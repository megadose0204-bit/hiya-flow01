const {chromium}=require('C:/Users/이홍우/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:8765/slides.html?view');await page.waitForTimeout(3500);
await page.evaluate(()=>window.lectureDeck.showRemote(0));await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#counter').textContent(),'2 / 36');
await page.keyboard.press('g');assert(await page.locator('#gridOverlay').evaluate(e=>e.classList.contains('open')));await page.keyboard.press('Escape');assert(!(await page.locator('#gridOverlay').evaluate(e=>e.classList.contains('open'))));
const bad=await page.evaluate(()=>{const all=[...document.querySelectorAll('#stage > section.slide')];return all.map((s,i)=>{all.forEach(x=>x.classList.toggle('active',x===s));const c=s.querySelector('.slide-content')||s;return {n:i+1,oh:c.scrollHeight-c.clientHeight,ow:c.scrollWidth-c.clientWidth};}).filter(r=>r.oh>4||r.ow>4);});assert.deepEqual(bad,[]);
await page.pdf({path:'C:/Users/Public/Documents/ESTsoft/CreatorTemp/flow-sync-check.pdf',preferCSSPageSize:true});
await page.goto('http://localhost:8765/slides.html');await page.waitForTimeout(3000);await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#counter').textContent(),'1 / 36');
assert.equal(await page.locator('#syncBtn').textContent(),'강사 화면 동기화');
await page.setViewportSize({width:375,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('#gridBtn').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));
await page.goto('http://localhost:8765/slides.html?admin');await page.waitForTimeout(1500);assert(await page.locator('#syncDialog').evaluate(e=>e.open));await page.locator('#syncClose').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#counter').textContent(),'1 / 36');
for(const name of ['index.html','admin.html']){await page.goto('http://localhost:8765/'+name);await page.waitForTimeout(500);}
assert.deepEqual(errors,[]);console.log(JSON.stringify({overflow:bad,keyboard:'pass',audienceLock:'pass',mobile:'pass',instructorLogin:'pass',console:errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

