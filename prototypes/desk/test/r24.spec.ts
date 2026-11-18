import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='../../art-masters/R24';
const snapshot=JSON.parse(readFileSync('../../art-masters/R22/scene-snapshot.json','utf8'));
const sizes=[{width:1920,height:1080},{width:3440,height:1440}];
async function open(page:Page,query:string){
 await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
 await page.goto(query);await page.evaluate(()=>document.fonts.ready);
 await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
 // A rendered camera update must settle with its HTML captions, without a sleep.
 await expect.poll(async()=>JSON.parse((await page.getByTestId('map-diagnostics').textContent())!).ready).toBe('ready');
}
async function measure(page:Page){
 const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 const host=(await page.getByTestId('map-canvas-host').boundingBox())!;
 const html=await page.locator('.study-cartouche,.study-navigation,.study-caption,.map-cartouche,.map-tools,.table-report,.table-commander,.table-tray,.map-mark.headquarters .mark-caption,.map-mark').evaluateAll(nodes=>nodes.filter(n=>(n as HTMLElement).offsetWidth>0&&getComputedStyle(n).display!=='none').map(n=>{const b=n.getBoundingClientRect();return {id:n.className,text:n.textContent?.trim(),bounds:{x:b.x,y:b.y,width:b.width,height:b.height}};}));
 const boxes=d.renderedLabels.map((l:any)=>({...l,bounds:{...l.bounds,x:l.bounds.x+host.x,y:l.bounds.y+host.y}}));
 const collisions:any[]=[];const hit=(a:any,b:any)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 for(let i=0;i<boxes.length;i++)for(const b of [...boxes.slice(i+1),...html])if(hit(boxes[i].bounds,b.bounds))collisions.push([boxes[i].id,b.id]);
 for(let i=0;i<html.length;i++)if(html[i]!.id==='mark-caption')for(let j=0;j<html.length;j++)if(i!==j&&!(html[j]!.id==='mark-caption'&&j<i)&&hit(html[i]!.bounds,html[j]!.bounds))collisions.push([html[i]!.text,html[j]!.id]);
 return {diagnostics:d,html,collisions};
}

test('R24 hero material preflight',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:3440,height:1440});await open(page,'/?study=1&look=A&detail=hero');
 const data=await measure(page);writeFileSync(`${out}/hero-after-diagnostics.json`,JSON.stringify(data,null,2));
 await page.screenshot({path:`${out}/hero-after-3440x1440.png`});
 expect.soft(data.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
 expect.soft(data.collisions).toEqual([]);expect(errors).toEqual([]);
});

test('R24 opening and table preflight',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const layout of ['','&layout=table']){
  await open(page,`/?study=1&look=A${layout}`);
  const data=await measure(page);const name=layout?'D':'A';writeFileSync(`${out}/preflight-${name}.json`,JSON.stringify(data,null,2));
  await page.screenshot({path:`${out}/preflight-${name}.png`});
  expect.soft(data.collisions).toEqual([]);
  const note=data.diagnostics.renderedLabels.find((l:any)=>l.id==='estimate');expect.soft(note).toBeDefined();
  expect.soft(data.diagnostics.detail.reliefRows).toBe(true);expect.soft(data.diagnostics.detail.counties).toBeGreaterThan(0);
  expect.soft(data.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
  if(layout)await expect(page.locator('.table-report')).toContainText('no enemy seen at Fort Monroe');
 }
 await open(page,'/');await expect(page.getByTestId('staff-map')).toHaveAttribute('data-look','A');
 await expect(page.locator('.study-caption')).toHaveCount(0);expect((await measure(page)).diagnostics.studyControl).toBeNull();
 expect(errors).toEqual([]);
});


test('R24 final views and bounded pan sample',async({page})=>{
 test.setTimeout(300000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const records:any[]=[];
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const [name,query] of [['A',''],['D','&layout=table'],['A-manassas','&detail=manassas'],['A-opening','&detail=theatre']] as const){
   await open(page,`/?study=1&look=A${query}`);const m=await measure(page);
   writeFileSync(`${out}/measure-${name}-${size.width}.json`,JSON.stringify(m,null,2));
   await page.screenshot({path:`${out}/plate-${name}-${size.width}x${size.height}.png`});
   expect.soft(m.collisions,`${name} ${size.width}`).toEqual([]);
   expect.soft(m.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
   expect.soft(m.diagnostics.baseCoverage.inside).toBe(true);
   if(name==='A'||name==='D'){
    const note=m.diagnostics.renderedLabels.find((l:any)=>l.id==='estimate');expect.soft(note).toBeDefined();
    if(note){const b=note.bounds,p=m.diagnostics.noteAnchor;expect.soft(Math.hypot(b.x+b.width/2-p[0],b.y+b.height/2-p[1])).toBeLessThan(145);}
   }
   let cadence:number[]=[];
   if(size.width===3440&&name==='A'){
    const host=page.getByTestId('map-canvas-host');await host.focus();
    cadence=await host.evaluate(async el=>{const times:number[]=[];let previous=performance.now();for(let i=0;i<20;i++){await new Promise<void>(r=>requestAnimationFrame(()=>r()));const now=performance.now();times.push(now-previous);previous=now;el.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft',bubbles:true}));}return times;});
    await expect(host).toHaveAttribute('data-ready','ready');
   }
   const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
   expect.soft(after.staticBakes).toBe(m.diagnostics.staticBakes);
   records.push({name,size,before:m.diagnostics,after,cadence});
  }
 }
 writeFileSync(`${out}/plate-measurements.json`,JSON.stringify({records,errors},null,2));expect(errors).toEqual([]);
});

test('R24 legacy looks remain selectable',async({page})=>{
 await open(page,'/?study=1&look=A');
 for(const look of ['B','C','0','A']){await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption(look);await expect(page.getByTestId('staff-map')).toHaveAttribute('data-look',look);await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});}
});


test('R24 close relief proof',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await open(page,'/?study=1&look=A&detail=manassas');const m=await measure(page);
 writeFileSync(`${out}/detail-proof.json`,JSON.stringify(m,null,2));await page.screenshot({path:`${out}/detail-proof.png`});
 expect(m.collisions).toEqual([]);expect(errors).toEqual([]);expect(m.diagnostics.rawTextureBytes).toBeLessThanOrEqual(96*1024*1024);
});
