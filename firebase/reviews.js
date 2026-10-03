import {isConfigured} from './config-check.js';
const $=id=>document.getElementById(id),teacher=new URLSearchParams(location.search).has('admin');
$('adminPanel').hidden=!teacher;
$('text').oninput=()=>{$('count').textContent=$('text').value.length+' / 1000자';};
if(!isConfigured(window.FIREBASE_CONFIG)){$('message').textContent='후기 저장 설정 전 · 접수 준비 중';$('publicList').textContent='공개 후기 준비 중';}
else{try{
const [appApi,dbApi,authApi]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js')]);
const app=appApi.initializeApp(window.FIREBASE_CONFIG),db=dbApi.getDatabase(app),auth=authApi.getAuth(app),base='decks/'+window.DECK_ID;
let admin=false,unsubscribe=()=>{};
const fail=()=>{$('message').textContent='저장 실패 · 후기 내용 유지 · 연결 또는 접수 설정 확인';};
$('send').disabled=false;$('message').textContent='작성 후 보내기 · 저장 완료 안내 확인';
dbApi.onValue(dbApi.query(dbApi.ref(db,base+'/publicReviews'),dbApi.limitToLast(100)),s=>{const list=$('publicList');list.replaceChildren();const vals=Object.values(s.val()||{}).reverse();if(!vals.length){list.textContent='아직 공개된 후기 없음';return;}vals.forEach(r=>{const li=document.createElement('li');li.textContent=r.text;list.append(li);});},()=>{$('publicList').textContent='공개 후기 연결 준비 중';});
$('reviewForm').onsubmit=async e=>{e.preventDefault();const text=$('text').value.trim();if(text.length<5||text.length>1000||!$('consent').checked){$('message').textContent='후기 5~1000자 · 공개 동의 확인';return;}$('send').disabled=true;try{await dbApi.set(dbApi.push(dbApi.ref(db,base+'/reviewInbox')),{text,createdAt:dbApi.serverTimestamp()});$('reviewForm').reset();$('count').textContent='0 / 1000자';$('message').textContent='후기 저장 완료 · 강사 승인 후 공개';}catch{fail();}finally{$('send').disabled=false;}};
$('login').onsubmit=async e=>{e.preventDefault();try{await authApi.signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value);}catch{$('adminMessage').textContent='로그인 실패 · 계정 확인';}finally{$('password').value='';}};
$('logout').onclick=()=>authApi.signOut(auth);
authApi.onAuthStateChanged(auth,async u=>{unsubscribe();admin=false;$('pending').replaceChildren();try{admin=teacher&&!!u&&(await dbApi.get(dbApi.ref(db,'admins/'+u.uid))).val()===true;}catch{}$('login').hidden=admin;$('logout').hidden=!admin;if(!teacher)return;$('adminMessage').textContent=admin?'건별 공개 승인 · 공개 취소 가능':'강사 권한 로그인 필요';if(!admin)return;
unsubscribe=dbApi.onValue(dbApi.ref(db,base+'/reviewInbox'),s=>{$('pending').replaceChildren();Object.entries(s.val()||{}).reverse().forEach(([id,r])=>{const li=document.createElement('li'),p=document.createElement('p'),approve=document.createElement('button'),hide=document.createElement('button');p.textContent=r.text;approve.textContent='공개 승인';hide.textContent='공개 취소';approve.onclick=async()=>{try{await dbApi.set(dbApi.ref(db,base+'/publicReviews/'+id),{text:r.text,createdAt:r.createdAt});$('adminMessage').textContent='공개 승인 완료';}catch{$('adminMessage').textContent='공개 승인 실패';}};hide.onclick=async()=>{try{await dbApi.remove(dbApi.ref(db,base+'/publicReviews/'+id));$('adminMessage').textContent='공개 취소 완료 · 원본 후기 유지';}catch{$('adminMessage').textContent='공개 취소 실패';}};li.append(p,approve,hide);$('pending').append(li);});},()=>{$('adminMessage').textContent='후기 조회 실패 · 규칙 확인';});});
}catch{$('message').textContent='연결 실패 · 새로고침 후 재시도';$('publicList').textContent='후기 연결 실패';}}
