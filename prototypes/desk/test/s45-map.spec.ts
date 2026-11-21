import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { mapProjection } from '../web/map/projection.ts';
import type { MapGeometry, Point } from '../web/map/model.ts';

const out = resolve('../../art-masters/S45');
const phase = process.env.S45_PHASE ?? 'after';
const sizes = [{width:800,height:600},{width:1440,height:900}];
const geometry=JSON.parse(readFileSync(resolve('public/map-data/union-1861-atlas/geometry.json'),'utf8')) as MapGeometry;
const projection=mapProjection(false);
const catalogue=JSON.parse(readFileSync(resolve('web/map/furniture-r35.json'),'utf8')) as {signs:{id:string}[]};
const towns=new Set(catalogue.signs.filter(t=>t.id.startsWith('town:')).map(t=>t.id.slice(5)));
async function audit(page:Page,d:any){
  const inputs=[];
  for(const label of d.renderedLabels){
    const region=geometry.regions.find(r=>r.id===label.id);if(!region?.point)continue;
    const {x,y,z}=d.camera,b=label.bounds;
    const point:Point=[b.x+b.width/2,b.y+b.height/2];
    const screen=(p:Point):Point=>{const q=projection(p)!;return [q[0]*z+x,q[1]*z+y];};
    const anchor=screen(region.point);
    const polygons=region.shape?(region.shape.type==='Polygon'?[region.shape.coordinates]:region.shape.coordinates) as Point[][][]:null;
    inputs.push({id:region.id,name:region.name,point,anchor,bounds:b,
      area:region.kind==='land'&&polygons&&!towns.has(region.id)?polygons.map(p=>p.map(r=>r.map(screen))):null,
      limit:towns.has(region.id)?29:12});
  }
  // Native Canvas fill/stroke tests are independent of the renderer's numeric
  // segment-distance implementation. Stroke is a 12px buffer around each area.
  return page.evaluate(inputs=>{
    const ctx=document.createElement('canvas').getContext('2d')!;
    ctx.lineWidth=24.01;ctx.lineJoin='round';ctx.lineCap='round';
    return inputs.map(({area,...label})=>{
      if(area){
        const paths=area.map(polygon=>{const path=new Path2D();for(const ring of polygon){ring.forEach((p,i)=>i?path.lineTo(...p):path.moveTo(...p));path.closePath();}return path;});
        return {...label,local:paths.some(path=>ctx.isPointInPath(path,...label.point,'evenodd')||ctx.isPointInStroke(path,...label.point))};
      }
      const b=label.bounds,a=label.anchor;
      const gap=Math.hypot(Math.max(b.x-a[0],0,a[0]-b.x-b.width),Math.max(b.y-a[1],0,a[1]-b.y-b.height));
      return {...label,gap,local:gap<=label.limit+.01};
    });
  },inputs);
}
async function ready(page:Page) {
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready',{timeout:30_000});
  await page.evaluate(()=>document.fonts.ready);
}
async function diagnostics(page:Page) {
  return JSON.parse((await page.getByTestId('map-diagnostics').textContent())!);
}
async function capture(page:Page, name:string) {
  const file=resolve(out,`${phase}-${name}.png`);await page.screenshot({path:file});
  writeFileSync(`${file}.recipe.json`,JSON.stringify({request:'S45',tool:'Prototype headless Playwright harness',
    mode:'Unedited first-morning desk capture',date:'2026-11-21',requestedSize:page.viewportSize(),actualSize:page.viewportSize(),
    humanEdits:[],postProcess:[],sha256:createHash('sha256').update(readFileSync(file)).digest('hex')},null,2));
}

for(const size of sizes)test(`first morning and resize match Fit the map at ${size.width}x${size.height}`,async({page})=>{
  mkdirSync(out,{recursive:true});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize(size);await page.goto('/');await ready(page);
  const first=await diagnostics(page);await capture(page,`first-${size.width}x${size.height}`);
  await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);
  const fitted=await diagnostics(page);
  await capture(page,`fitted-${size.width}x${size.height}`);
  await page.getByRole('button',{name:'Pan east',exact:true}).click();await ready(page);
  await page.setViewportSize({width:size.width+120,height:size.height+80});await ready(page);
  await expect.poll(async()=> (await diagnostics(page)).frame[2]).toBe(size.width+120);
  await page.setViewportSize(size);
  await expect.poll(async()=> (await diagnostics(page)).frame[2]).toBe(first.frame[2]);await ready(page);
  const resized=await diagnostics(page);
  await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);
  const refitted=await diagnostics(page);
  writeFileSync(resolve(out,`${phase}-framing-${size.width}.json`),JSON.stringify({size,first,fitted,resized,refitted,errors},null,2));
  expect.soft(first.camera).toEqual(fitted.camera);
  expect.soft(resized.camera).toEqual(refitted.camera);
  expect(errors).toEqual([]);
});

test('every rendered region name stays inside or beside its own geography',async({page})=>{
  test.setTimeout(240_000);mkdirSync(out,{recursive:true});
  const records=[];
  for(const size of [...sizes,{width:3440,height:1440}]){
    await page.setViewportSize(size);await page.goto('/');await ready(page);
    await page.getByRole('button',{name:'Fit the map',exact:true}).click();await ready(page);
    for(const look of ['A','B','C','0']){
      await page.getByRole('combobox',{name:'Map look',exact:true}).selectOption(look);await ready(page);
      records.push({size,look,zoom:'fit',labels:await audit(page,await diagnostics(page))});
    }
  }
  // Exercise every selectable region, including names hidden at the wide view.
  await page.setViewportSize({width:1440,height:900});await page.goto('/');await ready(page);
  const places=page.getByRole('combobox',{name:'Find a place',exact:true});
  const ids=await places.locator('option').evaluateAll(options=>options.map(o=>(o as HTMLOptionElement).value).filter(Boolean));
  for(const id of ids){
    await places.selectOption(id);await page.getByRole('button',{name:'Show place',exact:true}).click();await ready(page);
    records.push({size:{width:1440,height:900},look:'A',zoom:id,labels:await audit(page,await diagnostics(page))});
  }
  const misplaced=records.flatMap(r=>r.labels.filter(l=>!l.local).map(l=>({...l,size:r.size,look:r.look,view:r.zoom})));
  writeFileSync(resolve(out,`${phase}-label-audit.json`),JSON.stringify({regions:geometry.regions.length,focused:ids,records,misplaced},null,2));
  const drawn=new Set(records.flatMap(r=>r.labels.map(label=>label.id)));
  for(const id of ['tx_northeast','al_hills','kansas_west','minnesota','michigan_wisconsin','new_england'])expect(drawn.has(id),id).toBe(true);
  expect(misplaced).toEqual([]);
});
