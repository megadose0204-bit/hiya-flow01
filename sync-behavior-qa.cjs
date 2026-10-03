const {chromium}=require('C:/Users/이홍우/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const p=await b.newPage();
 await p.route('**/firebase/firebase-config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.FIREBASE_CONFIG={};window.DECK_ID="test";'}));
 await p.goto('http://localhost:8765/slides.html');await p.waitForTimeout(500);
 await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#counter').textContent(),'2 / 36','설정 전 자유 이동');
 await p.unroute('**/firebase/firebase-config.js');
 await p.route('**/firebase/firebase-sync.js',r=>r.fulfill({contentType:'text/javascript',body:`export function createSync(){let state={slide:0,locked:true,pdf:true},cb,acb;const api={onState(f){cb=f;f(state)},onConnection(f){f(true)},onAdmin(f){acb=f;f(false,null)},login(){acb(true,{uid:'test'});return Promise.resolve()},logout(){acb(false,null);return Promise.resolve()},setSlide(n){state.slide=n;cb(state);return Promise.resolve()},setLock(n){state.locked=n;cb(state);return Promise.resolve()},setPdf(n){state.pdf=n;cb(state);return Promise.resolve()}};window.testState=s=>{state={...state,...s};cb(state)};return api}` }));
 await p.goto('http://localhost:8765/slides.html');await p.waitForTimeout(300);
 await p.evaluate(()=>{window.print=()=>window.printCalls=(window.printCalls||0)+1;window.testState({slide:3,pdf:false})});
 assert.equal(await p.locator('#counter').textContent(),'4 / 36');await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#counter').textContent(),'4 / 36');
 await p.keyboard.press('p');assert.equal(await p.evaluate(()=>window.printCalls||0),0,'PDF OFF 키보드 차단');assert(!(await p.locator('#printBtn').isVisible()));
 await p.evaluate(()=>window.testState({locked:false,pdf:true}));await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#counter').textContent(),'5 / 36');await p.keyboard.press('p');assert.equal(await p.evaluate(()=>window.printCalls),1);
 await p.goto('http://localhost:8765/slides.html?admin');await p.waitForTimeout(300);await p.locator('#syncEmail').fill('teacher@example.com');await p.locator('#syncPassword').fill('test-only');await p.locator('#syncLogin button').click();await p.waitForFunction(()=>document.getElementById('syncBtn').textContent==='강사 제어');await p.locator('#syncBtn').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#counter').textContent(),'2 / 36');
 await p.locator('#syncBtn').click();await p.locator('#syncPdf').click();assert.equal(await p.locator('#syncPdf').getAttribute('aria-pressed'),'false');await p.locator('#syncLock').click();assert.equal(await p.locator('#syncLock').getAttribute('aria-pressed'),'false');
 console.log('설정 전 자유 이동 / 청중 추종 / 잠금 / PDF 버튼·단축키 / 강사 로그인·전송 통과');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

