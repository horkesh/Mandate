import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { readFileSync } from 'node:fs';
import { phase0 } from '@mandate/kernel';
import { toId } from '../../../packages/kernel/src/ids.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { viewFor } from '../../../packages/kernel/src/view/view.ts';
import { receivedDepartmentSides } from '../../../packages/kernel/src/seats/received.ts';
import { morningGround } from '../../../packages/kernel/src/seats/requests.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';

it('S77: received military transfers confirm source governments without reading hidden accession state',()=>{
 const {world,setup}=seatsWorld('union-1861');const seat=toId('seat','seat:davis_jefferson');
 const start={...phase0.createState(world,setup),stateDay:148};
 for(const [notice,department,day] of [['tennessee_military_league','st_tennessee',65],['north_carolina_forces_transferred','st_north_carolina',114]] as const){
  const hidden={...start,departmentFactions:{...start.departmentFactions,[department]:'confederate' as ReturnType<typeof toId<'faction'>>}};
  const sides=(s:typeof start)=>receivedDepartmentSides(world,viewFor(world,s,seat));
  expect(sides(hidden).get(toId('department',department))).toBeNull();
  const paper=report(`m.s77.${notice}`,{reportAuthor:toId('person','walker_leroy_p'),reportAuthorPost:toId('post','cs_secretary_war'),reportSubjectKind:'situation',reportSubjectId:notice,reportDay:day},day+2);
  const heard=deliverReport(hidden,seat,paper,NO_TRUTH);
  expect(sides(heard).get(toId('department',department))).toBe('confederate');
  expect(sides(deliverReport(start,seat,paper,NO_TRUTH))).toEqual(sides(heard));
 }
});

it('S77: Confederate concentration asks governors for the raised regiments instead of only local opaque contingents',()=>{
 const {world}=seatsWorld('union-1861');
 const rows=world.map.world.rules.ruleSeats.principals.find(r=>r.faction==='confederate')!.concentrations!;
 const johnston=rows.find(r=>r.post==='cs_cmd_harpers_ferry')!;
 const beauregard=rows.find(r=>r.post==='cs_cmd_manassas')!;
 expect(johnston.fromPosts).toContain('st_gov_georgia');
 expect(johnston.fromPosts).toContain('st_gov_tennessee');
 for(const p of ['st_gov_alabama','st_gov_louisiana','st_gov_mississippi','st_gov_south_carolina','st_gov_virginia'])expect(beauregard.fromPosts).toContain(p);
 expect(johnston.receiveLevies).toBe(false);
 expect(beauregard.receiveLevies).toBe(false);
});

it('S77: S75 applies only federal contracts, preserves muster conflicts, and does not turn war service into days',()=>{
 const {world}=seatsWorld('union-1861');const catalogue=world.map.world.regimentCatalogue!;
 expect(catalogue.filter(r=>r.path.S75_term_status==='federal_term_sourced')).toHaveLength(43);
 expect(catalogue.find(r=>r.id==='ny_26_infantry')!.termDays).toEqual([90]);
 expect(catalogue.find(r=>r.id==='la_8_infantry')).toMatchObject({termDays:[],warTerm:true});
 for(const id of ['sc_2_infantry','sc_3_infantry','sc_4_infantry'])expect(catalogue.find(r=>r.id===id)!.termDays).toEqual([]);
 for(const id of ['ny_25_infantry','ny_27_infantry','ny_31_infantry','pa_26_infantry']){
  const r=catalogue.find(r=>r.id===id)!;
  expect(r.path.S75_muster_status).toBe('conflicting_sources_HOLD');
  expect(new Set(r.observations.filter(o=>o.observationKind==='muster_in').map(o=>o.source)).size).toBe(2);
 }
});

it('S91: 0112 retires pushback counts and retains every accepted obligation and exclusion',()=>{
 const checkpoints=JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
 expect(checkpoints.pushback).toEqual([]);
 expect(checkpoints.pushbackRegisters).toEqual(['pushback-union.json','pushback-confederate.json']);
 const rows=checkpoints.pushbackRegisters.flatMap((file:string)=>JSON.parse(readFileSync(`packs/union-1861/${file}`,'utf8')).rows);
 expect(rows.filter((r:any)=>r.status==='eligible').map((r:any)=>r.id)).toEqual([
  'U01','U02','U03a','U03b','U03c','U03d','U03e','U04','U05','U14','U25a','U25b','U32','U33','U34','U39','U40','U42',
  'C01','C02','C03','C04','C05','C06','C07','C09','C10','C11','C12','C14','C15','C16','C25',
 ]);
 expect(rows.filter((r:any)=>r.status==='excluded')).toHaveLength(38);
 expect(rows.filter((r:any)=>r.status==='qualified_source')).toHaveLength(3);
 expect(checkpoints.checkpoints.find((r:any)=>r.id==='men_confederate')).toMatchObject({min:100000,max:200000,floorBinding:true});
});

it('S77: the documented Winchester wire does not invent wire access at Harpers Ferry or an earlier opening',()=>{
 const {world,setup}=seatsWorld('union-1861');const state=phase0.createState(world,setup);
 const access=(day:number,to:string)=>morningGround(world,state,day).latency.publicWire!(toId('region','richmond'),toId('region',to),toId('faction','confederate'));
 expect(access(133,'lower_valley')).toBe(false);
 expect(access(134,'lower_valley')).toBe(true);
 expect(access(148,'lower_valley')).toBe(true);
 expect(access(149,'lower_valley')).toBe(false);
 expect(access(134,'harpers_ferry')).toBe(false);
});
