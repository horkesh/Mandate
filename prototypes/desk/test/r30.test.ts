import {expect,it} from 'vitest';
import {claimWords,controlOpacity,CONTROL_COLOURS} from '../web/map/control.ts';
import {compactGeometry} from '../scripts/runtime-map.ts';
import type {MapGeometry} from '../web/map/model.ts';

it('R30 leaves ground without a claim as no report in the same hover and text description',()=>{
 expect(claimWords('A place',undefined,id=>id,String)).toMatch(/A place: no report/i);
});

it('R30 retains enough blue pigment to read over warm paper while keeping the base visible',()=>{
 const b={shares:{union:1000},holder:'union',contested:false,asOfDay:0,mark:'pencil',sources:[]} as any;
 const alpha=controlOpacity(b,0),c=CONTROL_COLOURS.friendly;
 const paper=[234,217,179],ink=[c>>16,(c>>8)&255,c&255];
 const composite=paper.map((v,i)=>v*(1-alpha)+ink[i]!*alpha);
 expect(composite[2]!-composite[0]!).toBeGreaterThan(65);
 expect(alpha).toBeLessThan(.7);
 expect(controlOpacity({...b,mark:'ink'},0)).toBeGreaterThan(alpha);
 expect(controlOpacity(b,35)).toBeLessThan(alpha);
});

it('R30 restores only missing display shapes from a verified area supplement',()=>{
 const shape={type:'Polygon',coordinates:[[[-77,38],[-76,38],[-76,39],[-77,38]]]};
 const region=(id:string,s:any)=>({id,name:id,kind:'land',point:null,shape:s,label:{anchor:null,spine:[],size:null,minZoom:null}});
 const g={version:1,pack:'union-1861',schematic:false,base:[],regions:[region('missing',null),region('existing',shape)]} as MapGeometry;
 const patched=(compactGeometry as any)(g,{missing:shape,existing:{type:'Polygon',coordinates:[]}});
 expect(patched.regions[0].shape).toEqual(shape);
 expect(patched.regions[1].shape).toBe(shape);
 expect(g.regions[0]!.shape).toBeNull();
});

