import {expect,test} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R32';
const snapshot=(name:string)=>JSON.parse(readFileSync(`${out}/${name}-snapshot.json`,'utf8'));
const figures=/\d+\s*‰|\bcontrol\s+\d+|\bpermille\b/i;

test('R32 preflight opens the live public picture in ink',async({page,request})=>{
 const response=await request.get('/api/desk');expect(response.ok()).toBe(true);
 const data=await response.json();
 expect(Object.values(data.morning.view.controlBeliefs).length).toBe(219);
 expect(Object.values(data.morning.view.controlBeliefs).every((b:any)=>b.mark==='ink')).toBe(true);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});
 const diagnostics=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 expect(diagnostics.staticBakes).toBe(0);expect(diagnostics.rawTextureBytes).toBeLessThan(96*1024*1024);
 await page.getByRole('button',{name:/Read the map as text/}).click();
 await expect(page.getByRole('button',{name:/Return to the map/})).toBeVisible();
 await page.getByRole('button',{name:/Return to the map/}).click();
 writeFileSync(`${out}/browser-preflight.json`,JSON.stringify({errors,diagnostics,regions:Object.keys(data.morning.view.controlBeliefs).length},null,2));
 expect(errors).toEqual([]);
});

test('R32 uses qualitative control in hover, text and received papers at both sizes',async({page})=>{
 const evidence:any[]=[];
 const sizes=process.env.R32_BROWSER_SMOKE?[{width:1920,height:1080}]:[{width:3440,height:1440},{width:1920,height:1080}];
 const states=process.env.R32_BROWSER_SMOKE?['day75']:['opening','day75'];
 for(const size of sizes)for(const state of states){
  const data=snapshot(state);await page.setViewportSize(size);
  await page.unroute('**/api/desk');await page.route('**/api/desk',r=>r.fulfill({json:data}));await page.goto('/');
  const host=page.getByTestId('map-canvas-host');await expect(host).toHaveAttribute('data-ready','ready',{timeout:20000});
  // Washington's received signs cover its small hit area in the later scene.
  // Verify its changed holder in the complete text twin and its actual paper;
  // unobstructed Eastern Shore ground exercises the shared hover wording.
  const control=JSON.parse((await host.getAttribute('data-control'))!),p=control.points.find((p:any)=>p.id==='eastern_shore');
  const box=(await host.boundingBox())!;
  await page.mouse.move(box.x+p.point[0],box.y+p.point[1]);
  const hover=page.getByTestId('control-hover');await expect(hover).toBeVisible();
  await expect(hover).toContainText('Union holds');
  await expect(hover).toContainText('Cameron');await expect(hover).not.toContainText(figures);
  if(state==='opening')await expect(hover).toContainText('In ink');
  evidence.push({state,size,hover:await hover.textContent()});
  await page.getByRole('button',{name:/Read the map as text/}).click();
  const twin=page.getByTestId('map-text-twin');await expect(twin).toBeVisible();await expect(twin).not.toContainText(figures);
  const washington=twin.locator('li').filter({hasText:/^Washington:/});
  await expect(washington).toContainText(state==='opening'?'Union holds':'Confederate States holds');
  evidence.at(-1).washington=await washington.innerText();
  await page.getByRole('button',{name:/Return to the map/}).click();
  if(state==='opening')await page.keyboard.press('Space');
  else {
   await page.getByRole('button',{name:/In-tray/}).first().click();
   await page.getByTestId('paper-link').filter({hasText:'Cameron'}).filter({hasText:'Washington'}).first().click();
  }
  const paper=page.getByTestId('paper');await expect(paper).toBeVisible();await expect(paper).not.toContainText(figures);
  await expect(paper).toContainText(state==='opening'?'opening country report':'Confederate States holds');
  evidence.at(-1).paper=await paper.innerText();
  writeFileSync(`${out}/browser-words${process.env.R32_BROWSER_SMOKE?'-smoke':''}.json`,JSON.stringify(evidence,null,2));
 }
});

test('R32 geometry failure fallback shows holder and contested status without shares',async({page})=>{
 const data=snapshot('day75');
 await page.route('**/api/desk',r=>r.fulfill({json:data}));
 await page.route('**/map-data/union-1861-atlas/geometry.json',r=>r.fulfill({status:503,body:'Geometry unavailable for fallback verification'}));
 await page.goto('/');const twin=page.getByTestId('map-text-twin');await expect(twin).toBeVisible();
 await expect(twin).toContainText('Confederate States holds Washington');await expect(twin).not.toContainText(figures);
 writeFileSync(`${out}/fallback-words.txt`,await twin.innerText(),'utf8');
});
