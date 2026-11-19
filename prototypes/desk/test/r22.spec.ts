import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
const out='../../art-masters/R22';
const snapshot=JSON.parse(readFileSync(`${out}/scene-snapshot.json`,'utf8'));
async function open(page:Page,query:string){
  await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
  await page.goto(query);await page.evaluate(()=>document.fonts.ready);
  await expect(page.getByTestId('map-study')).toBeVisible();
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
}
test('opening, data, skin switching and plate isolation preflight',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page,'/?study=1&look=A');
  await expect(page.locator('.comparison-map')).toHaveAttribute('data-look','A');
  const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
  writeFileSync(`${out}/preflight-diagnostics.json`,JSON.stringify(d,null,2));
  expect(d.baseCoverage.inside).toBe(true);expect(d.rawTextureBytes).toBeLessThanOrEqual(d.rawTextureCap);
  for(const name of ['Potomac','Shenandoah','Rappahannock','York','James'])expect(d.renderedLabels.some((l:any)=>l.text===name),name).toBe(true);
  for(const name of ['Manassas Junction','Harpers Ferry','Baltimore','Richmond'])expect(d.renderedLabels.some((l:any)=>l.text===name),name).toBe(true);
  const boxes=await page.locator('.map-mark.headquarters .mark-caption').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};}));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;expect(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y).toBe(false);}
  await page.screenshot({path:`${out}/preflight.png`});
  await page.getByTestId('map-canvas-host').focus();await page.keyboard.press('v');
  await expect(page.locator('.comparison-map')).toHaveAttribute('data-look','B');
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
  await page.goto('/');await expect(page.getByTestId('desk')).toBeVisible();
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:60000});
  await expect(page.getByTestId('staff-map')).toHaveAttribute('data-look','0');
  await expect(page.locator('.study-caption')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('illustrative');
  expect(errors).toEqual([]);
  writeFileSync(`${out}/preflight.json`,JSON.stringify({diagnostics:d,errors,plateIsolation:true},null,2));
});
test('matching plates and panning measurements',async({page})=>{
  test.skip(process.env.DESK_R22_PREFLIGHT==='1');
  test.setTimeout(300000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const selected=process.env.DESK_R22_LOOKS?.split(',');
  const closeOnly=process.env.DESK_R22_CLOSE_ONLY==='1';
  const records:any[]=selected?JSON.parse(readFileSync(`${out}/plate-measurements.json`,'utf8')).records.filter((r:any)=>!selected.includes(r.look)):[];
  for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
    await page.setViewportSize(size);
    for(const look of selected??['0','A','B','C','D']){
      await open(page,`/?study=1&look=${look==='D'?'A':look}${look==='D'?'&layout=table':''}`);
      await expect(page.locator('.map-mark[data-region="fort_monroe"]')).toBeVisible();
      const host=page.getByTestId('map-canvas-host');
      await page.screenshot({path:`${out}/${closeOnly?'verify-full-':'plate-'}${look}-${size.width}x${size.height}.png`});
      const start=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
      if(look==='C')expect(start.studyControl.mode).toBe('region-tint');
      let cadence:number[]=[];
      if(size.width===3440&&look!=='D'&&!closeOnly){
        await host.focus();
        cadence=await host.evaluate(async el=>{
          const times:number[]=[];let previous=performance.now();
          for(let i=0;i<45;i++){
            await new Promise<void>(r=>requestAnimationFrame(()=>r()));
            const now=performance.now();times.push(now-previous);previous=now;
            el.dispatchEvent(new KeyboardEvent('keydown',{key:i%2?'ArrowRight':'ArrowLeft',bubbles:true}));
          }
          return times;
        });
        await expect(host).toHaveAttribute('data-ready','ready');
      }
      const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
      expect(after.staticBakes).toBe(start.staticBakes);
      if(closeOnly){
        const prior=JSON.parse(readFileSync(`${out}/plate-measurements.json`,'utf8')).records.find((r:any)=>r.look===look&&r.size.width===size.width);
        records.push({...prior,diagnostics:{...prior.diagnostics,bakeMs:after.bakeMs,rawTextureBytes:after.rawTextureBytes},panEvidenceReused:'plates-final / press-tint-final; close band invisible at Eastern theatre zoom'});
      }else records.push({look,size,diagnostics:after,cadence});
      if(look!=='D'){
        await page.getByRole('button',{name:'Manassas Junction, closest view',exact:true}).click();
        await expect(host).toHaveAttribute('data-ready','ready');
        await page.screenshot({path:`${out}/plate-${look}-manassas-${size.width}x${size.height}.png`});
      }
    }
  }
  writeFileSync(`${out}/plate-measurements.json`,JSON.stringify({records,errors},null,2));
  expect(errors).toEqual([]);
});

test('the playable opening centres the theatres and can zoom out to the whole map',async({page})=>{
  const records=[];
  await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
  for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
    await page.setViewportSize(size);await page.goto('/');
    const host=page.getByTestId('map-canvas-host');await expect(host).toHaveAttribute('data-ready','ready',{timeout:60000});
    const map=page.getByTestId('staff-map');
    const before=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
    expect(before.look).toBe('0');expect(before.studyControl).toBe(null);expect(before.zoom).toBeGreaterThan(1.2);
    await page.screenshot({path:`${out}/opening-${size.width}x${size.height}.png`});
    for(let i=0;i<10;i++)await map.getByRole('button',{name:'Zoom out',exact:true}).click();
    await expect(host).toHaveAttribute('data-ready','ready');
    const after=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
    expect(after.zoom).toBeLessThan(before.zoom);expect(after.regionContainment.outside).toEqual([]);expect(after.baseCoverage.inside).toBe(true);
    records.push({size,before,after});
  }
  writeFileSync(`${out}/opening-checks.json`,JSON.stringify(records,null,2));
});
