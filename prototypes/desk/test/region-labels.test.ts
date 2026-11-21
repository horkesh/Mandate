import { expect, it } from 'vitest';
import { regionLabelDistance } from '../web/map/region-labels.ts';
import type { Point } from '../web/map/model.ts';

const square=(x:number,y:number,size:number):Point[]=>[[x,y],[x+size,y],[x+size,y+size],[x,y+size],[x,y]];
it('keeps area names local, including concavities, holes and separate islands',()=>{
  const polygons=[[square(0,0,100),square(20,20,40)],[square(200,0,10)]];
  expect(regionLabelDistance([10,10],polygons)).toBe(0);
  expect(regionLabelDistance([40,40],polygons)).toBe(20);
  expect(regionLabelDistance([205,5],polygons)).toBe(0);
  expect(regionLabelDistance([150,50],polygons)).toBe(50);
  expect(regionLabelDistance([100,50],polygons)).toBe(0);
  expect(regionLabelDistance([111,50],polygons)).toBe(11);
  const concave:Point[]=[[0,0],[100,0],[100,20],[20,20],[20,100],[0,100],[0,0]];
  expect(regionLabelDistance([80,80],[[concave]])).toBe(60);
});
