import {expect,it} from 'vitest';
import {geoAlbers} from 'd3-geo';
import {StaffRenderer} from '../web/map/renderer.ts';
import * as placement from '../web/map/placement.ts';
import type {MapMark,Point} from '../web/map/model.ts';
import {paintWash} from '../web/map/manuscript.ts';
import {compactGeometry} from '../scripts/runtime-map.ts';
import {readFileSync} from 'node:fs';
import type {MapGeometry} from '../web/map/model.ts';

it('R25 loads the same regions and rivers without reparsing baked relief, rail and base paths',()=>{
 const source:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
 const compact=compactGeometry(source);
 expect(compact.regions).toEqual(source.regions);expect(compact.cartography!.rivers).toEqual(source.cartography!.rivers);
 expect(compact.base).toHaveLength(0);expect(compact.cartography!.relief).toHaveLength(0);expect(compact.cartography!.rail).toHaveLength(0);
 expect(compact.baseCoverage).toEqual(source.baseCoverage);
 expect(Object.keys(compact.regionAngles??{}).length).toBeGreaterThan(100);
 expect(JSON.stringify(compact).length).toBeLessThan(JSON.stringify(source).length/8);
});

it('R25 keeps thick pigment dashes separated instead of joining their round caps',()=>{
 const strokes:{cap:string;dash:number[]}[]=[];let dash:number[]=[];
 const c={lineCap:'round',save(){},restore(){},clip(){},fill(){},setLineDash(v:number[]){dash=v;},stroke(){strokes.push({cap:this.lineCap,dash});}};
 paintWash(c as unknown as CanvasRenderingContext2D,{} as Path2D,[0,0,0,0],'#537f9b',.9,20);
 expect(strokes).toHaveLength(4);expect(strokes.every(s=>s.cap==='butt'&&s.dash.length>0)).toBe(true);
});

it('R25 puts each degree/minute label on the edge of its own geographic line',()=>{
 const projection=geoAlbers().parallels([29.5,45.5]).rotate([96,0]).center([0,38]).scale(1100).translate([0,0]);
 for(const [width,height,z,center] of [[1920,900,3,[-86,37]],[3440,1280,45,[-77.6,38.8]],[1920,900,100,[-77.3,38.8]]] as const){
  const p=projection([...center])!;
  const fake={geometry:{schematic:false},ready:true,app:{screen:{width,height}},projection,camera:{z,x:width/2-p[0]*z,y:height/2-p[1]*z},project:(p:Point)=>projection(p)};
  const ticks=StaffRenderer.prototype.degreeTicks.call(fake as any);
  expect(ticks.length).toBeGreaterThan(4);
  for(const tick of ticks){
   const t=tick as any;
   const geo=projection.invert!([(t.x-fake.camera.x)/z,(t.y-fake.camera.y)/z])!;
   const latitude=t.side==='left'||t.side==='right';
   expect(t.kind).toBe(latitude?'latitude':'longitude');
   expect(t.text).toMatch(t.side==='bottom'?/^\d+°(?: [WE])?$/:/^\d+° \d{2}′(?: [ENSW])?$/);
   expect(t.value).toBeCloseTo(geo[latitude?1:0]!,5);
   const match=/^(\d+)°(?: (\d{2})′)?/.exec(t.text)!;
   const displayed=Number(match[1])+Number(match[2]??0)/60;
   const offset=t.side==='bottom'?77+3/60+6.119/3600:0;
   expect(Math.abs(displayed-Math.abs(t.value+offset))).toBeLessThanOrEqual(1/120+1e-7);
   if(!latitude)expect(t.meridian).toBe(t.side==='top'?'Greenwich':'Washington');
  }
 }
});

it('R25 gives colocated headquarters one dated caption clear of the front and rivers',()=>{
 const groups=(placement as any).groupHeadquarters;
 expect(typeof groups).toBe('function');if(!groups)return;
 const marks=['Scott','Mansfield','Buchanan'].map((caption,i)=>({id:String(i),kind:'headquarters',region:'washington',caption,day:i+4})) as MapMark[];
 const placed=placement.placeMarks(marks,()=>[900,350],1920,1080);
 const result=groups(placed);
 expect(result).toHaveLength(1);expect(result[0].marks.map((m:MapMark)=>[m.caption,m.day])).toEqual([['Scott',4],['Mansfield',5],['Buchanan',6]]);
 const front:[number,number,number,number]=[700,280,1200,450];
 const captions=placement.placeCaptions(result,1920,1080,[front]);
 expect(captions.size).toBe(1);
 for(const b of captions.values())expect(b[0]<front[2]&&b[2]>front[0]&&b[1]<front[3]&&b[3]>front[1]).toBe(false);
 expect(placed.map(p=>p.anchor)).toEqual([[900,350],[900,350],[900,350]]);
});

it('R25 clamps all zoom paths to the available Manassas–Washington detail',()=>{
 const projection=geoAlbers().parallels([29.5,45.5]).rotate([96,0]).center([0,38]).scale(1100).translate([0,0]);
 const regions=[{id:'manassas',point:[-77.47,38.75]},{id:'washington',point:[-77.03,38.9]}];
 const fake={geometry:{schematic:false},regions,app:{screen:{width:1920,height:900}},project:(p:Point)=>projection(p),camera:{z:10000,x:0,y:0,fit:1},invalidate(){}};
 Object.setPrototypeOf(fake,StaffRenderer.prototype);
 StaffRenderer.prototype.zoom.call(fake as any,2);
 const a=projection(regions[0]!.point as Point)!,b=projection(regions[1]!.point as Point)!;
 expect(Math.abs(a[0]-b[0])*fake.camera.z).toBeGreaterThan(400);
 expect(Math.abs(a[0]-b[0])*fake.camera.z).toBeLessThanOrEqual(1740);
 expect(Math.abs(a[1]-b[1])*fake.camera.z).toBeLessThanOrEqual(660);
 expect(fake.camera.z).toBeLessThanOrEqual(900/12);
});
