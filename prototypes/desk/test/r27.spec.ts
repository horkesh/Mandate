import {expect,test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {mapProjection} from '../web/map/projection.ts';
import {geographicBounds} from '../web/map/atlas.ts';
import {presenter} from '../web/presentation.ts';
const out='../../art-masters/R27';
async function ready(page:Page){await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:20000});}
async function diagnostics(page:Page){return JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);}
async function meridians(page:Page){return page.evaluate(()=>{
 const boxes=(s:string)=>[...document.querySelectorAll(s)].map(n=>{const b=n.getBoundingClientRect();return {text:n.textContent,x:b.x,y:b.y,right:b.right,bottom:b.bottom};});
 const headings=boxes('.map-meridian'),ticks=boxes('.map-degree-ticks text');
 return {headings,ticks,collisions:headings.flatMap(a=>ticks.filter(b=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y).map(b=>[a.text,b.text]))};
});}
test('R27 opening, fit, closer view, names and meridian clearance',async({page})=>{
 test.setTimeout(120000);const measurements=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const size of [{width:1920,height:1080},{width:3440,height:1440}]){
  await page.setViewportSize(size);await page.goto('/');await ready(page);
  const opening=await diagnostics(page),projection=mapProjection(false);
  for(const point of [[-80,40.44],[-76.33,36.97],[-76.61,39.29],[-79.14,37.41]] as [number,number][]){
   const p=projection(point)!,c=opening.camera,x=p[0]*c.z+c.x,y=p[1]*c.z+c.y;
   expect.soft(x).toBeGreaterThan(15);expect.soft(x).toBeLessThan(size.width-15);expect.soft(y).toBeGreaterThan(15);expect.soft(y).toBeLessThan(size.height-15);
  }
  const [x0,y0,x1,y1]=geographicBounds(projection,[-80.35,36.7,-75.85,40.65]);
  expect.soft(opening.camera.z).toBeCloseTo(Math.min((size.width-120)/(x1-x0),(size.height-110)/(y1-y0)),5);
  const buttons=await page.getByRole('button').allTextContents();expect.soft(buttons.filter(s=>/[→↩]/u.test(s))).toEqual([]);
  const views=[];
  for(const view of process.env.DESK_R27_CLOSE_ONLY==='1'?['closer']:['opening','fit','closer']){
   if(view==='fit')await page.getByRole('button',{name:'Fit the map',exact:true}).click();
   if(view==='closer'){
    await page.getByRole('button',{name:'Show Virginia',exact:true}).click();
    for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await ready(page);}
   }
   await ready(page);const d=await diagnostics(page),meridian=await meridians(page);
   expect.soft(meridian.collisions).toEqual([]);expect(d.studyControl).toBeNull();expect(d.staticBakes).toBe(0);expect(d.rawTextureBytes).toBeLessThan(96*1024*1024);expect(d.baseCoverage.inside).toBe(true);
   if(view==='fit'){
    expect.soft(d.camera.z).toBeLessThan(opening.camera.z/2);
    expect.soft(d.labelVisibility?.filter((r:any)=>r.eligible&&r.kind==='land').every((r:any)=>r.sizeClass==='l')).toBe(true);
   }
   if(view==='closer')expect(d.camera.z).toBeGreaterThan(opening.camera.z*1.3);
   if(process.env.DESK_R27_CAPTURE==='1')await page.screenshot({path:`${out}/${view}-${size.width}x${size.height}.png`});
   views.push({view,diagnostics:d,meridian});
  }
  await page.getByRole('button',{name:/Read the map as text/}).click();
  const g=await(await page.request.get('/map-data/union-1861-atlas/geometry.json')).json();
  const snapshot=await(await page.request.get('/api/desk')).json(),names=presenter(snapshot.strings);
  const allNames=await page.getByTestId('map-text-twin').innerText();for(const r of g.regions)expect.soft(allNames).toContain(names.name(r.id,'region'));
  await page.getByRole('button',{name:/Return to the map/}).click();await ready(page);
  const host=(await page.getByTestId('map-canvas-host').boundingBox())!;
  // Find an interior whose name is suppressed by the wide-view policy.
  await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);
  const wide=await diagnostics(page),hidden=g.regions.find((r:any)=>r.id==='manassas'),p=projection(hidden.point)!,c=wide.camera;
  await page.mouse.move(host.x+p[0]*c.z+c.x,host.y+p[1]*c.z+c.y);
  await expect.soft(page.locator('.map-note')).toContainText(hidden.name);
  await page.locator('.table-run').hover();await expect(page.locator('.map-note')).toHaveCount(0);
  measurements.push({size,opening,views});
 }
 writeFileSync(`${out}/${process.env.DESK_EVIDENCE_RUN??'views'}-measurements.json`,JSON.stringify({measurements,errors},null,2));expect(errors).toEqual([]);
});
