import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='../../art-masters/R23';
const snapshot=JSON.parse(readFileSync('../../art-masters/R22/scene-snapshot.json','utf8'));
const sizes=[{width:1920,height:1080},{width:3440,height:1440}];
async function open(page:Page,query:string){
  await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
  await page.goto(query);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
}
async function labels(page:Page){
  const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
  const host=(await page.getByTestId('map-canvas-host').boundingBox())!;
  const html=await page.locator('.study-cartouche,.study-navigation,.study-caption,.map-tools,.table-report,.table-commander,.table-tray,.map-mark.headquarters .mark-caption,.map-mark').evaluateAll(nodes=>nodes.filter(n=>(n as HTMLElement).offsetWidth>0).map(n=>{const b=n.getBoundingClientRect();return {id:n.className,text:n.textContent?.trim(),bounds:{x:b.x,y:b.y,width:b.width,height:b.height}};}));
  const boxes=d.renderedLabels.map((l:any)=>({...l,bounds:{...l.bounds,x:l.bounds.x+host.x,y:l.bounds.y+host.y}}));
  const collisions:any[]=[];
  const hit=(a:any,b:any)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  for(let i=0;i<boxes.length;i++){
    for(const b of [...boxes.slice(i+1),...html])if(hit(boxes[i].bounds,b.bounds))collisions.push([boxes[i].id,b.id]);
  }
  for(let i=0;i<html.length;i++)if(html[i]!.id==='mark-caption')for(let j=0;j<html.length;j++){
    if(i===j||(html[j]!.id==='mark-caption'&&j<i))continue;
    if(hit(html[i]!.bounds,html[j]!.bounds))collisions.push([html[i]!.text,html[j]!.id]);
  }
  return {diagnostics:d,html,collisions};
}
test('R23 startup and shared label clearance preflight',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,'/?study=1&look=A');
  const result=await labels(page);writeFileSync(`${out}/preflight-labels.json`,JSON.stringify(result,null,2));
  await page.screenshot({path:`${out}/preflight-A.png`});
  expect(result.collisions).toEqual([]);
  expect(result.diagnostics.baseCoverage.inside).toBe(true);
  expect(result.diagnostics.rawTextureBytes).toBeLessThanOrEqual(result.diagnostics.rawTextureCap);
  for(const id of ['estimate','draft'])expect(result.diagnostics.renderedLabels.some((l:any)=>l.id===id),id).toBe(true);
  for(const name of ['Potomac','Shenandoah','Rappahannock','York','James','Manassas Junction','Baltimore'])expect(result.diagnostics.renderedLabels.some((l:any)=>l.text===name),name).toBe(true);
  await page.goto('/?study=1&look=A&layout=table');
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
  await expect(page.locator('.table-report')).toContainText('no enemy seen at Fort Monroe');
  const table=await labels(page);writeFileSync(`${out}/preflight-D-labels.json`,JSON.stringify(table,null,2));expect(table.collisions).toEqual([]);
  for(const id of ['estimate','draft'])expect(table.diagnostics.renderedLabels.some((l:any)=>l.id===id),`D ${id}`).toBe(true);
  await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
  await expect(page.getByTestId('staff-map')).toHaveAttribute('data-look','0');await expect(page.locator('.study-caption')).toHaveCount(0);
  expect(errors).toEqual([]);
});
test('R23 closest captions clear the navigation at 1080p',async({page})=>{
  const records=[];
  for(const look of ['0','A','B','C']){
    await open(page,`/?study=1&look=${look}&detail=manassas`);
    const result=await labels(page);writeFileSync(`${out}/close-caption-${look}.json`,JSON.stringify(result,null,2));
    expect(result.collisions).toEqual([]);
    await page.screenshot({path:`${out}/plate-${look}-manassas-1920x1080.png`});records.push({look,...result});
  }
  writeFileSync(`${out}/close-caption-checks.json`,JSON.stringify(records,null,2));
});
test('R23 table estimate remains signed and dated after yielding to the report',async({page})=>{
  const records=[];
  for(const size of sizes){
    await page.setViewportSize(size);await open(page,'/?study=1&look=A&layout=table');
    const result=await labels(page);writeFileSync(`${out}/table-note-${size.width}.json`,JSON.stringify(result,null,2));
    expect(result.collisions).toEqual([]);
    for(const id of ['estimate','draft']){
      const note=result.diagnostics.renderedLabels.find((l:any)=>l.id===id);expect(note,id).toBeDefined();
      expect(note.text).toContain(snapshot.date);expect(note.text).toContain('illustrative');
    }
    await expect(page.locator('.table-report')).toContainText('no enemy seen at Fort Monroe');
    await page.screenshot({path:`${out}/plate-D-${size.width}x${size.height}.png`});records.push({size,...result});
  }
  writeFileSync(`${out}/table-note-checks.json`,JSON.stringify(records,null,2));
});
test('R23 matching plates, clearance and bounded pan timings',async({page})=>{
  test.setTimeout(300000);test.skip(process.env.DESK_R23_PREFLIGHT==='1');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const records:any[]=[];
  const selected=process.env.DESK_R23_LOOKS?.split(',')??['0','A','B','C','D'];
  for(const size of sizes){
    await page.setViewportSize(size);
    for(const look of selected){
      await open(page,`/?study=1&look=${look==='D'?'A':look}${look==='D'?'&layout=table':''}`);
      const host=page.getByTestId('map-canvas-host');
      const full=await labels(page);writeFileSync(`${out}/labels-${look}-${size.width}.json`,JSON.stringify(full,null,2));
      await page.screenshot({path:`${out}/plate-${look}-${size.width}x${size.height}.png`});
      expect(full.collisions,`${look} ${size.width}`).toEqual([]);
      let cadence:number[]=[];
      if(size.width===3440&&look!=='D'){
        await host.focus();cadence=await host.evaluate(async el=>{
          const times:number[]=[];let previous=performance.now();
          for(let i=0;i<24;i++){
            await new Promise<void>(r=>requestAnimationFrame(()=>r()));const now=performance.now();times.push(now-previous);previous=now;
            el.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft',bubbles:true}));
          }return times;
        });await expect(host).toHaveAttribute('data-ready','ready');
      }
      const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
      expect(after.staticBakes).toBe(full.diagnostics.staticBakes);expect(after.rawTextureBytes).toBeLessThanOrEqual(after.rawTextureCap);
      records.push({look,size,diagnostics:after,cadence});
      if(look!=='D'){
        await page.getByRole('button',{name:'Manassas Junction, closest view',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');
        const close=await labels(page);writeFileSync(`${out}/labels-${look}-manassas-${size.width}.json`,JSON.stringify(close,null,2));
        await page.screenshot({path:`${out}/plate-${look}-manassas-${size.width}x${size.height}.png`});expect(close.collisions).toEqual([]);
      }
    }
  }
  writeFileSync(`${out}/plate-measurements.json`,JSON.stringify({records,errors},null,2));expect(errors).toEqual([]);
});
