import {expect,it} from 'vitest';
import {geoAlbers} from 'd3-geo';
import {graticuleTicks,WASHINGTON_WEST} from '../web/map/graticule.ts';
import {StaffRenderer} from '../web/map/renderer.ts';
import {reportPlace,dayFrames,playbackSnapshot} from '../web/table.ts';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';

it('R26 reveals each received paper before it enters the tray, in delivery order',()=>{
 const desk=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true})),before=desk.snapshot();
 desk.execute('inquire us_general_in_chief');const result=desk.execute('end');expect(result.ok).toBe(true);
 const frames=dayFrames(result.turn!);expect(frames.length).toBeGreaterThan(7);
 expect(frames.map(f=>f.day.day)).toEqual(frames.map(f=>f.day.day).sort((a,b)=>a-b));
 const i=frames.findIndex(f=>f.phase==='mark'),frame=frames[i]!;
 expect(frame.report).toBeDefined();
 const during=playbackSnapshot(before,result.snapshot,frames,i);
 expect(during.morning.view.reports.some(r=>r.id===frame.report!.id)).toBe(false);
 expect(playbackSnapshot(before,result.snapshot,frames,i+1).morning.view.reports.some(r=>r.id===frame.report!.id)).toBe(true);
 expect(reportPlace(frame.report!)).toBe(frame.report!.claims.find(c=>c.region)?.region??'');
 expect(during.morning.requestDay).toBe(frame.day.day);
 expect(reportPlace({...frame.report!,subjectKind:'post',claims:[]})).toBe('');
});

it('R26 places Washington longitude ticks on whole degrees from Washington',()=>{
 const projection=geoAlbers().rotate([85,0]).center([0,38]).scale(1100).translate([0,0]);
 const p=projection([-77.3,38.8])!,z=20;
 const ticks=graticuleTicks(projection,{z,x:960-p[0]*z,y:540-p[1]*z},1920,1080).filter(t=>t.side==='bottom');
 expect(ticks.length).toBeGreaterThan(2);
 for(const t of ticks){expect(t.value+WASHINGTON_WEST).toBeCloseTo(Math.round(t.value+WASHINGTON_WEST),6);expect(t.text).toMatch(/^\d+°(?: [WE])?$/);}
});

it('R26 points the north arrow to geographic north at the current camera centre',()=>{
 const method=(StaffRenderer.prototype as any).northAngle;
 expect(typeof method).toBe('function');if(!method)return;
 const projection=geoAlbers().rotate([85,0]).center([0,38]).scale(1100).translate([0,0]);
 for(const c of [[-77,38],[-91,35],[-120,48]] as [number,number][]){
  const p=projection(c)!,z=5,n=projection([c[0]!,c[1]!+.01])!;
  const angle=method.call({projection,project:projection,camera:{z,x:960-p[0]*z,y:540-p[1]*z},app:{screen:{width:1920,height:1080}}});
  expect(angle).toBeCloseTo(Math.atan2(n[0]-p[0],p[1]-n[1])*180/Math.PI,4);
 }
});
