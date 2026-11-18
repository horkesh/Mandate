import {expect,test} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {mapProjection} from '../web/map/projection.ts';
import {geographicBounds} from '../web/map/atlas.ts';
const out='../../art-masters/R28';
const snapshot=JSON.parse(readFileSync('../../art-masters/R22/scene-snapshot.json','utf8'));

test('R28 repeated playable desk opens retain the two-second warm budget',async({page})=>{
 const records=[];
 for(const width of [3440,3440,3440,1920,1920]){
  await page.setViewportSize({width,height:width===3440?1440:1080});await page.goto('/');
  const host=page.getByTestId('map-canvas-host');await expect(host).toHaveAttribute('data-ready','ready',{timeout:20000});
  const startup=JSON.parse((await host.getAttribute('data-startup'))!);
  records.push({width,startup});
 }
 writeFileSync(`${out}/warm-opens.json`,JSON.stringify(records,null,2));
 for(const r of records.slice(1))expect(r.startup.lastOverlay).toBeLessThan(2000);
});

test('R28 atlas boundaries taper without a pixel step on all four edges',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {featherBand}=await import('/web/map/atlas.ts' as string);
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d')!;
  x.fillStyle='#000';x.fillRect(0,0,512,512);featherBand(x,512,512);
  const a=x.getImageData(0,0,512,512).data;
  const line=(side:number)=>Array.from({length:256},(_,i)=>{
   const [px,py]=side===0?[i,256]:side===1?[511-i,256]:side===2?[256,i]:[256,511-i];
   return a[(py*512+px)*4+3]!;
  });return [0,1,2,3].map(line);
 });
 for(const edge of result){expect(edge[0]).toBe(0);expect(edge[128]).toBe(255);
  expect(Math.max(...edge.slice(1).map((x:number,i:number)=>Math.abs(x-edge[i]!)))).toBeLessThanOrEqual(4);
  expect(edge.every((x:number,i:number)=>i===0||x>=edge[i-1]!)).toBe(true);}
 writeFileSync(`${out}/raster-edge-check.json`,JSON.stringify({edges:result,marginPixels:128,maximumAlphaStep:4},null,2));
});

test('R28 opening and matching hero use saved continuous relief at both sizes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const records=[];
 if(process.env.DESK_R28_PREFLIGHT==='1')await page.route('**/union-1861-atlas/manifest.json',r=>r.fulfill({json:JSON.parse(readFileSync('public/map-data/union-1861-atlas/preflight.json','utf8'))}));
 const sizes=process.env.DESK_R28_PREFLIGHT==='1'?[{width:3440,height:1440}]:[{width:3440,height:1440},{width:1920,height:1080}];
 for(const size of sizes){
  await page.setViewportSize(size);
  for(const view of process.env.DESK_R28_PREFLIGHT==='1'?['opening']:['opening','hero']){
   await page.unroute('**/api/desk');
   if(view==='hero')await page.route('**/api/desk',r=>r.fulfill({json:snapshot}));
   await page.goto(view==='opening'?'/':'/?study=1&look=A&detail=hero');
   await page.evaluate(()=>document.fonts.ready);
   await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});
   const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
   expect(d.atlasSource).toBe('disk');expect(d.staticBakes).toBe(0);
   expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);expect(d.baseCoverage.inside).toBe(true);
   if(view==='opening'){
    expect(d.studyControl).toBeNull();
    const before=JSON.parse(readFileSync('../../art-masters/R27/final-measurements.json','utf8'));
    const prior=before.measurements.find((m:any)=>m.size.width===size.width).opening;
    expect(d.camera).toEqual(prior.camera);
   }else{
    // Keep the authored hero geography under R26's accepted north-up projection.
    const b=(await page.getByTestId('map-canvas-host').boundingBox())!;
    const [x0,y0,x1,y1]=geographicBounds(mapProjection(false),[-78.35,38.15,-76.72,39.4]);
    const z=Math.min((b.width-120)/(x1-x0),(b.height-110)/(y1-y0));
    expect(d.camera.z).toBeCloseTo(z,6);
    expect(d.camera.x).toBeCloseTo(b.width/2-(x0+x1)/2*z,6);
    expect(d.camera.y).toBeCloseTo(b.height/2-(y0+y1)/2*z,6);
   }
   await page.screenshot({path:`${out}/${process.env.DESK_R28_PREFLIGHT==='1'?'preflight-':''}${view}-${size.width}x${size.height}.png`});
   const startup=JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-startup'))!);
   records.push({view,size,diagnostics:d,startup});
  }
 }
 writeFileSync(`${out}/${process.env.DESK_EVIDENCE_RUN??'final'}-measurements.json`,JSON.stringify({records,errors},null,2));
 expect(errors).toEqual([]);
});

test('R28 relief stays on saved bands through fit, zoom changes and the closest view',async({page})=>{
 test.skip(process.env.DESK_R28_PREFLIGHT==='1','Only the opening is built in the cheap preflight');
 await page.setViewportSize({width:3440,height:1440});await page.goto('/');
 const host=page.getByTestId('map-canvas-host');await expect(host).toHaveAttribute('data-ready','ready');
 const records=[];
 await page.getByRole('button',{name:'Fit the map',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');
 for(let step=0;step<19;step++){
  const d=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
  expect(d.staticBakes).toBe(0);expect(d.atlasSource).toBe('disk');expect(d.baseCoverage.inside).toBe(true);
  records.push({step,camera:d.camera,atlasBytes:d.rawTextureBytes});
  if(step===0||step===18)await page.screenshot({path:`${out}/${step===0?'fit-proof':'closest-proof'}-3440x1440.png`});
  if(step<18){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');}
 }
 await page.goto('/?study=1&look=A&detail=manassas');await expect(host).toHaveAttribute('data-ready','ready');
 await page.screenshot({path:`${out}/manassas-closest-proof-3440x1440.png`});
 const closest=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
 expect(closest.atlasSource).toBe('disk');expect(closest.staticBakes).toBe(0);
 records.push({step:19,camera:closest.camera,atlasBytes:closest.rawTextureBytes});
 writeFileSync(`${out}/zoom-bands.json`,JSON.stringify(records,null,2));
});
