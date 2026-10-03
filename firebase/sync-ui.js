import { isConfigured } from './config-check.js';

const deck = window.lectureDeck;
const dialog = document.getElementById('syncDialog');
const button = document.getElementById('syncBtn');
const status = document.getElementById('syncStatus');
const login = document.getElementById('syncLogin');
const controls = document.getElementById('syncAdmin');
const lockButton = document.getElementById('syncLock');
const pdfButton = document.getElementById('syncPdf');
const params = new URLSearchParams(location.search);
const free = params.has('view');
const teacher = params.has('admin');
const configured = isConfigured(window.FIREBASE_CONFIG);
let admin = false, locked = true, pdf = true, ready = false, connected = false;
let stateSlide = 0, sync = null, error = '';

deck.canNavigate = () => !configured || free || ready && (admin || !locked && !teacher);
deck.canPrint = () => !configured || free || pdf;
button.addEventListener('click', () => {render();dialog.showModal();});
document.getElementById('syncClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', e => e.stopPropagation());

function render() {
  button.textContent = !configured ? '설정 전 · 자유 열람' : free ? '개별 열람' : !connected ? '동기화 연결 대기' : admin ? '강사 제어' : locked ? '강사 화면 동기화' : '자유 이동';
  login.hidden = !configured || !teacher || admin;
  controls.hidden = !admin;
  lockButton.textContent = '청중 잠금 ' + (locked ? 'ON' : 'OFF');
  lockButton.setAttribute('aria-pressed',String(locked));
  pdfButton.textContent = 'PDF 허용 ' + (pdf ? 'ON' : 'OFF');
  pdfButton.setAttribute('aria-pressed',String(pdf));
  document.getElementById('printBtn').hidden = !deck.canPrint();
  status.textContent = error || (!configured ? 'Firebase 설정 전 · 자유 열람 · 설정 파일 입력 후 동기화' : free ? '개별 열람 · 내 화면만 이동' : !connected ? '연결 확인 중 · 인터넷 연결 필요' : admin ? '강사 권한 확인 완료 · 슬라이드 이동 시 청중 화면 반영' : teacher ? '강사 이메일과 비밀번호로 로그인' : '청중 입장 · ' + (locked ? '강사 화면 따라가기' : '각자 슬라이드 이동'));
  deck.refresh();
}
function failed(message){error=message;render();}

async function start() {
  if (!configured || free) {render();return;}
  try {
    const {createSync}=await import('./firebase-sync.js');
    sync=createSync(window.FIREBASE_CONFIG,window.DECK_ID || 'hiya-flow01-20261019');
  } catch {failed('동기화 시작 실패 · 인터넷과 설정 파일 확인');return;}
  deck.onNavigate = n => {
    if (admin) sync.setSlide(n).catch(() => {failed('전송 실패 · 연결 확인 후 다시 이동');deck.showRemote(stateSlide);if(!dialog.open) dialog.showModal();});
  };
  sync.onConnection(value => {connected=value;render();});
  sync.onState(state => {
    if (!state) {ready=false;failed('동기화 읽기 실패 · Firebase 규칙 확인 필요');return;}
    ready=true;locked=!!state.locked;pdf=!!state.pdf;stateSlide=state.slide;
    if (!teacher && !admin && locked) deck.showRemote(stateSlide);
    document.getElementById('syncResume').textContent='저장 위치 이어서 진행 · '+(stateSlide+1)+'장';
    render();
  });
  sync.onAdmin((value,user) => {
    admin=value && teacher;
    if (admin) {error='';if(dialog.open) dialog.close();}
    else if (teacher && user) error='강사 목록(admins)에 없는 계정 · UID 등록 확인';
    render();
  });
  login.addEventListener('submit', async e => {
    e.preventDefault();const password=document.getElementById('syncPassword');
    error='로그인 확인 중';render();
    try {await sync.login(document.getElementById('syncEmail').value.trim(),password.value);}
    catch {failed('로그인 실패 · 이메일과 비밀번호 확인');}
    finally {password.value='';}
  });
  lockButton.addEventListener('click', () => sync.setLock(!locked).catch(() => failed('잠금 전송 실패 · 연결 확인')));
  pdfButton.addEventListener('click', () => sync.setPdf(!pdf).catch(() => failed('PDF 설정 전송 실패 · 연결 확인')));
  document.getElementById('syncStart').addEventListener('click', async () => {
    try {await sync.setSlide(0);deck.showRemote(0);error='';render();dialog.close();}
    catch {failed('수업 시작 전송 실패 · 연결 확인');}
  });
  document.getElementById('syncResume').addEventListener('click', () => {deck.showRemote(stateSlide);dialog.close();});
  document.getElementById('syncLogout').addEventListener('click', () => sync.logout().catch(() => failed('로그아웃 실패 · 다시 시도')));
}
render();
if (teacher && configured && !free) dialog.showModal();
start();

