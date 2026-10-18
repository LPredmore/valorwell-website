import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, sep, extname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const results=[], blocked=[];
const dist=resolve('dist');
const output=resolve(process.env.BROWSER_EVIDENCE_DIR || '.browser-acceptance');mkdirSync(output,{recursive:true});
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
 let file=resolve(dist,'.'+path);
 if(file!==dist&&!file.startsWith(dist+sep)){res.writeHead(403).end();return}
 if(existsSync(join(file,'index.html')))file=join(file,'index.html');
 if(!existsSync(file)){res.writeHead(404).end();return}
 try{const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'}[extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(readFileSync(file))}catch{res.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const hydrationErrors=[];

const browser=await chromium.launch({headless:true});
async function context(options={}) {
 const ctx=await browser.newContext(options); ctx.setDefaultTimeout(10000); ctx.on('page',page=>page.on('pageerror',e=>hydrationErrors.push(e.message)));
 await ctx.route('**/*', route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1' || url.hostname==='localhost') return route.continue();
  blocked.push({host:url.hostname,path:url.pathname,method:route.request().method()});
  if(url.hostname==='www.zeffy.com' && route.request().resourceType()==='document') return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Isolated donation form placeholder</title><p>No payment provider connected.</p>'});
  return route.abort('blockedbyclient');
 });
 return ctx;
}
async function check(name,run) {try {const observed=await run(); results.push({name,status:'PASS',observed});console.log('PASS '+name)}catch(e){results.push({name,status:'FAIL',error:String(e),stack:e.stack});console.log('FAIL '+name+': '+e.message)}}
let ctx=await context(),page=await ctx.newPage();
await page.goto(base+'/donate/?utm_source=google&gclid=SYNTHETIC_CLICK&email=fixture%40example.invalid&token=TEST_TOKEN',{waitUntil:'networkidle'});
await page.evaluate(()=>{window.__acceptanceEvents=[];window.gtag=(...args)=>window.__acceptanceEvents.push(args)});
const triggers=page.locator('[data-donate-source]');
await check('Desktop donation CTA opens named accessible dialog and local intercepted iframe',async()=>{
 assert.ok(await triggers.count()>1);await triggers.first().click();
 await page.getByRole('dialog',{name:'Donate to the ValorWell Foundation'}).waitFor();
 const frame=page.locator('iframe[title="ValorWell Foundation Bridge Fund donation form"]');
 const src=await frame.getAttribute('src');const url=new URL(src);
 assert.equal(url.origin,'https://www.zeffy.com');assert.equal(url.pathname,'/embed/donation-form/the-valorwell-bridge-fund');
 assert.deepEqual([...url.searchParams].sort(),[['UTM_source','google'],['modal','true']]);
 return {src,providerConnection:'intercepted locally; no external requests permitted'};
});
await check('Escape closes modal and restores keyboard focus to initiating CTA',async()=>{
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).focus();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.equal(await triggers.first().evaluate(e=>e===document.activeElement),true);return 'focus restored';
});
await check('Repeated form open records one intent and conversion for the same CTA',async()=>{
 await triggers.first().click();await page.getByRole('dialog').waitFor();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).focus();await page.keyboard.press('Escape');
 const events=await page.evaluate(()=>window.__acceptanceEvents);assert.equal(events.filter(x=>x[1]==='begin_donation').length,1);assert.equal(events.filter(x=>x[1]==='conversion').length,1);
 assert.ok(!JSON.stringify(events).includes('SYNTHETIC_CLICK'));assert.ok(!JSON.stringify(events).includes('example.invalid'));assert.ok(!JSON.stringify(events).includes('TEST_TOKEN'));
 assert.ok(!events.some(x=>/purchase|payment|refund/.test(x[1])));return events;
});
await check('A separate CTA preserves its placement and creates its own intent',async()=>{
 const firstSource=await triggers.first().getAttribute('data-donate-source');
 let selected;
 for(let i=1;i<await triggers.count();i++)if(await triggers.nth(i).isVisible() && await triggers.nth(i).getAttribute('data-donate-source')!==firstSource){selected=triggers.nth(i);break}
 assert.ok(selected,'distinct visible CTA missing');const source=await selected.getAttribute('data-donate-source');await selected.click();await page.getByRole('dialog').waitFor();
 const events=await page.evaluate(()=>window.__acceptanceEvents);assert.equal(events.filter(x=>x[1]==='begin_donation').length,2);assert.ok(events.some(x=>x[1]==='begin_donation'&&x[2].cta_source===source));
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).focus();await page.keyboard.press('Escape');return {firstSource,secondSource:source};
});
await page.screenshot({path:join(output,'website-desktop.png'),fullPage:true});await ctx.close();
ctx=await context({viewport:{width:390,height:844}});page=await ctx.newPage();
await page.goto(base+'/donate/?utm_source=arbitrary-private-value',{waitUntil:'networkidle'});
await check('Mobile donation modal fits viewport and unknown acquisition falls back to website',async()=>{
 const trigger=page.locator('[data-donate-source]').filter({visible:true}).first();await trigger.click();const dialog=page.getByRole('dialog');await dialog.waitFor();
 const src=await page.locator('iframe[title="ValorWell Foundation Bridge Fund donation form"]').getAttribute('src');assert.equal(new URL(src).searchParams.get('UTM_source'),'website');
 const box=await dialog.boundingBox();assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=391 && box.y+box.height<=845);
 await page.screenshot({path:join(output,'website-mobile-modal.png')});return {src,bounds:box};
});
await check('Mobile modal keyboard tab remains inside dialog',async()=>{
 for(let i=0;i<6;i++){await page.keyboard.press('Tab');assert.equal(await page.getByRole('dialog').evaluate(el=>el.contains(document.activeElement)),true)}return 'six keyboard tab advances contained';
});await ctx.close();
ctx=await context({javaScriptEnabled:false});page=await ctx.newPage();await page.goto(base+'/donate/',{waitUntil:'load'});
await check('Without JavaScript prerendered donation anchors retain direct fixed-form fallback',async()=>{
 const links=await page.locator('[data-donate-source]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert.ok(links.length>0);
 for(const href of links){const url=new URL(href);assert.equal(url.hostname,'www.zeffy.com');assert.equal(url.pathname,'/embed/donation-form/the-valorwell-bridge-fund');assert.equal(url.searchParams.get('modal'),'true')};return {fallbackLinks:links.length};
});
await ctx.close();
ctx=await context();page=await ctx.newPage();
await check('All eleven themed pages hydrate without browser errors',async()=>{
 for(const route of ['/','/donate/','/foundation/','/about/','/beyond-the-yellow/','/contact/','/mission/','/impact/','/how-it-works/','/partner/','/resources/']) { const response=await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route); await page.locator('h1').first().waitFor(); }
 assert.deepEqual(hydrationErrors,[]);return {routes:11,pageErrors:0};
});
await ctx.close();await browser.close();server.close();
writeFileSync(join(output,'results.json'),JSON.stringify({kind:'real Chromium against built website; analytics and provider frame intercepted locally',results,externalRequestsBlocked:blocked},null,2));
process.exitCode=results.some(x=>x.status==='FAIL')?1:0;


