import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import type {MapGeometry} from '../web/map/model.ts';
import {mapProjection} from '../web/map/projection.ts';

it('R28 uses one continuous relief field, without a rectangular close replacement',()=>{
 const g:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
 expect(g.cartography!.lod?.reliefExtent).toBeUndefined();
 expect(g.cartography!.lod?.relief).toBeUndefined();
 const marks=g.cartography!.relief;
 // All requested mountain belts must carry actual downhill contour strokes.
 for(const [west,south,east,north] of [[-80.5,38,-79.5,40.5],[-85.5,34.5,-84,37],[-83.5,34.5,-81,36.5],[-78.8,37.5,-77.5,39.5]]){
  expect(marks.filter(m=>m.a[0]>west!&&m.a[0]<east!&&m.a[1]>south!&&m.a[1]<north!).length).toBeGreaterThan(100);
 }
 expect(marks.every(m=>m.contour!==undefined&&m.contour%100===0&&m.slope!>=18)).toBe(true);
});

it('R28 keeps the Cumberland edge and the whole Eastern frame inside the detailed raster',()=>{
 const m=JSON.parse(readFileSync(`public/map-data/union-1861-atlas/${process.env.DESK_R28_PREFLIGHT==='1'?'preflight':'manifest'}.json`,'utf8'));
 const band=m.variants['A-normal'].bands.find((b:any)=>b.minZoom===8);
 expect(band.scale).toBe(16);
 const projection=mapProjection(false);
 for(const point of [[-85.5,35.8],[-80,40.44],[-76.33,36.97]] as [number,number][]){
  const p=projection(point)!,box=band.box;
  expect((p[0]-box[0])*band.scale).toBeGreaterThan(128);
  expect((box[2]-p[0])*band.scale).toBeGreaterThan(128);
  expect((p[1]-box[1])*band.scale).toBeGreaterThan(128);
  expect((box[3]-p[1])*band.scale).toBeGreaterThan(128);
 }
});
