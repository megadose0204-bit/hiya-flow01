import { createSync } from './firebase-sync.js';

const deck = window.lectureDeck;
const dialog = document.getElementById('syncDialog');
const button = document.getElementById('syncBtn');
const status = document.getElementById('syncStatus');
const login = document.getElementById('syncLogin');
const controls = document.getElementById('syncAdmin');
const lockButton = document.getElementById('syncLock');
const params = new URLSearchParams(location.search);
const free = params.has('view');
const teacher = params.has('admin');
let admin = false;
let locked = true;
let ready = false;
let connected = false;
let stateSlide = 0;

deck.canNavigate = () => ready && admin || free || ready && !locked && !teacher;
button.addEventListener('click', () => dialog.showModal());
document.getElementById('syncClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', e => e.stopPropagation());

function render() {
  button.textContent = !connected ? '동기화 연결 대기' : admin ? '강사 제어' : free ? '개별 열람' : locked ? '강사 화면 동기화' : '자유 이동';
  login.hidden = admin || (!teacher && !dialog.open);
  controls.hidden = !admin;
  lockButton.textContent = '청중 동기화 ' + (locked ? 'ON' : 'OFF');
  status.textContent = !connected ? '연결 확인 중 · 인터넷 연결 필요' : admin ? '강사 권한 확인 완료 · 슬라이드 이동 시 청중 화면 반영' : free ? '개별 열람 · 내 화면만 이동' : '청중 입장 · ' + (locked ? '강사 화면 따라가기' : '각자 슬라이드 이동');
  deck.refresh();
}

const sync = createSync(window.FIREBASE_CONFIG, window.DECK_ID);
deck.onNavigate = n => {
  if (admin) sync.setSlide(n).catch(() => {status.textContent='전송 실패 · 연결 확인 후 다시 이동';deck.showRemote(stateSlide);dialog.showModal();});
};
sync.onConnection(value => { connected=value;render(); });
sync.onState(state => {
  if (!state) {ready=false;status.textContent='동기화 읽기 실패 · Firebase 규칙 확인 필요';return;}
  ready=true;locked=state.locked;stateSlide=state.slide;
  if (!free && (!admin && locked || teacher)) deck.showRemote(stateSlide);
  render();
});
sync.onAdmin(value => {admin=value && teacher;if (!free) deck.showRemote(stateSlide);render();if(admin && dialog.open) dialog.close();});
login.addEventListener('submit', async e => {
  e.preventDefault();
  const password=document.getElementById('syncPassword');
  status.textContent='로그인 확인 중';
  try {await sync.login(document.getElementById('syncEmail').value.trim(), password.value);if(!admin) status.textContent='권한 확인 중 · 강사 등록 계정 필요';}
  catch {status.textContent='로그인 실패 · 이메일과 변경한 비밀번호 확인';}
  finally {password.value='';}
});
lockButton.addEventListener('click', () => sync.setLock(!locked).catch(() => {status.textContent='설정 전송 실패 · 연결 확인';}));
document.getElementById('syncLogout').addEventListener('click', () => sync.logout().catch(() => {status.textContent='로그아웃 실패 · 다시 시도';}));
button.addEventListener('click', () => {login.hidden=!teacher;render();});
render();
if (teacher) dialog.showModal();

