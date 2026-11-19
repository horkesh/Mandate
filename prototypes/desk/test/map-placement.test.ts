import { expect, it } from 'vitest';
import { placeMarks } from '../web/map/placement.ts';
import type { MapMark } from '../web/map/model.ts';
it('separates signs from nearby regions as well as the same region, retaining their reported anchors', () => {
  const marks = ['enemy','headquarters','works'].map((kind,i)=>({id:String(i),kind,region:String(i)})) as MapMark[];
  const points = [[100,100],[106,101],[100,100]] as [number,number][];
  const result=placeMarks(marks,id=>points[Number(id)]!,250,200);
  expect(result).toEqual(placeMarks(marks,id=>points[Number(id)]!,250,200));
  expect(result.map(p=>p.anchor)).toEqual(points);
  for(const a of result)for(const b of result)if(a!==b)expect(Math.hypot(a.point[0]-b.point[0],a.point[1]-b.point[1])).toBeGreaterThanOrEqual(29);
  expect(marks.map(m=>m.region)).toEqual(['0','1','2']);
});
