import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R33';
const scene=JSON.parse(readFileSync('C:/Pyrrhic/ByOrderOfThePresident/art-masters/R32/opening-snapshot.json','utf8'));
const host=(page:Page)=>page.getByTestId('map-canvas-host');
async function ready(page:Page){await expect(host(page)).toHaveAttribute('data-ready','ready',{timeout:20000});await page.evaluate(()=>document.fonts.ready);}
async function open(page:Page,palette='strong'){
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto(`/?palette=${palette}`);await ready(page);
}
async function view(page:Page,name:string){
 if(name==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
 if(name==='virginia'){await page.getByRole('button',{name:'Show Virginia',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Zoom in',exact:true}).click();}
 await ready(page);await page.locator('.table-calendar').hover();await expect(page.getByTestId('control-hover')).toBeHidden();
}
async function evidence(page:Page){
 const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 const c=JSON.parse((await host(page).getAttribute('data-control'))!);
 expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);
 const boxes=await page.evaluate(()=>[...document.querySelectorAll('.map-tools,.table-calendar,.table-trays,.table-books,.table-run,.map-cartouche,.control-legend,.map-header,.map-scale,.map-meridian')].map(el=>{const r=el.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}));
 return {camera:d.camera,frame:d.frame,control:c,diagnostics:d,exclude:boxes};
}
test('R33 baseline captures the existing strong map before changes',async({page})=>{
 test.skip(process.env.R33_BASELINE!=='1','One retained pre-change reference, never overwritten by final tests.');
 await page.setViewportSize({width:1920,height:1080});const records=[];
 for(const name of ['opening','fit','virginia']){
  await open(page);await view(page,name);records.push({name,...await evidence(page)});
  await page.screenshot({path:`${out}/baseline-${name}-strong.png`});
 }
 writeFileSync(`${out}/strong-baseline.json`,JSON.stringify(records,null,2));
});

test('R33 smoke switches the real renderer and legend without a request or camera change',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1920,height:1080});await open(page);
 await expect(page.getByTestId('staff-map')).toHaveAttribute('data-palette','strong');
 const before=await evidence(page);let writes=0;page.on('request',r=>{if(r.method()!=='GET')writes++;});
 await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption('A:research');await ready(page);
 await expect(page.getByTestId('staff-map')).toHaveAttribute('data-palette','research');
 const after=await evidence(page);expect(after.camera).toEqual(before.camera);expect(after.control.points).toEqual(before.control.points);
 expect(after.control.paint.find((p:any)=>p.id==='eastern_shore').colour).toBe(0x1f59a8);
 const legend=page.getByTestId('control-legend');await expect(legend).toBeInViewport();
 expect(await legend.evaluate(el=>getComputedStyle(el).getPropertyValue('--claim-blue'))).toBe('#1f59a8');
 expect(await page.getByTestId('staff-map').evaluate(el=>getComputedStyle(el).getPropertyValue('--correction-colour'))).toBe('#76509b');
 await page.screenshot({path:`${out}/smoke-research.png`});
 await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption('A');await ready(page);
 expect((await evidence(page)).control.paint).toEqual(before.control.paint);
 expect(writes).toBe(0);expect(errors).toEqual([]);
 writeFileSync(`${out}/smoke.json`,JSON.stringify({before,after,writes,errors},null,2));
});

test('R33 final selector shows its palette name and defaults to strong',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/api/desk',r=>r.fulfill({json:scene}));await page.goto('/');await ready(page);
 await expect(page.getByTestId('staff-map')).toHaveAttribute('data-palette','strong');
 const select=page.getByRole('combobox',{name:'Map look',exact:true});
 await select.selectOption('A:research');await ready(page);
 const fit=await select.evaluate(el=>{
  const s=el as HTMLSelectElement,c=document.createElement('canvas').getContext('2d')!,style=getComputedStyle(s);
  c.font=`${style.fontSize} ${style.fontFamily}`;
  return {text:s.selectedOptions[0]!.text,width:c.measureText(s.selectedOptions[0]!.text).width,available:s.clientWidth-30};
 });
 expect(fit.text).toBe('Manuscript (research)');expect(fit.width).toBeLessThan(fit.available);
 writeFileSync(`${out}/selector-final.json`,JSON.stringify(fit,null,2));
});

for(const size of [{width:1920,height:1080},{width:3440,height:1440}])test(`R33 matrix ${size.width} uses paired scenes and cameras`,async({page})=>{
 const records:any[]=[];const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize(size);
 for(const name of ['fit','opening','virginia']){
  let previous:any;
  for(const palette of ['strong','research']){
   await page.unroute('**/api/desk');await open(page,palette);await view(page,name);
   await expect(page.getByTestId('staff-map')).toHaveAttribute('data-palette',palette);
   const record={name,palette,size,file:`${name}-${palette}-${size.width}x${size.height}.png`,...await evidence(page)};
   if(previous){expect(record.camera).toEqual(previous.camera);expect(record.control.points).toEqual(previous.control.points);expect(record.control.beliefs).toBe(previous.control.beliefs);}
   expect(record.control.beliefs).toBe(219);
   if(name==='fit')expect(record.control.paint.some((p:any)=>p.area&&p.colour===(palette==='strong'?0xd32238:0xc33830))).toBe(true);
   await page.screenshot({path:`${out}/${record.file}`});records.push(record);previous=record;
   writeFileSync(`${out}/views-${size.width}.json`,JSON.stringify({records,errors},null,2));
  }
 }
 expect(errors).toEqual([]);
});

test('R33 reference renders the same terrain without live pigment for contrast measurements',async({page})=>{
 await page.setViewportSize({width:1920,height:1080});
 await page.route('**/web/map/control.ts*',async route=>{
  const response=await route.fetch();const body=await response.text();
  const pattern=/function controlOpacity\([^)]*\)\s*\{/;
  expect(body).toMatch(pattern);
  await route.fulfill({response,body:body.replace(pattern,'$& return 0;')});
 });
 const records=[];
 for(const name of ['fit','opening','virginia']){
  await page.unroute('**/api/desk');await open(page);await view(page,name);
  expect((await evidence(page)).control.paint.every((p:any)=>p.alpha===0)).toBe(true);
  await page.screenshot({path:`${out}/${name}-unwashed-1920x1080.png`});records.push({name,...await evidence(page)});
 }
 writeFileSync(`${out}/unwashed-reference.json`,JSON.stringify(records,null,2));
});
