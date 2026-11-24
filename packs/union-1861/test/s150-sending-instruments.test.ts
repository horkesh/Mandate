import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

it('S150 gives McDowell and Beauregard sourced local hold missions on their read assumption/assignment bounds',()=>{
  const {world}=seatsWorld('union-1861');
  const orders=world.map.world.rules.ruleSeats.principals.flatMap(p=>p.offensives);
  for(const expected of [
    {id:'s150_mcdowell_department_hold',post:'us_dept_northeastern_virginia',objective:'northern_virginia',posture:'hold',fromDate:'1861-05-28'},
    {id:'s150_beauregard_manassas_hold',post:'cs_cmd_manassas',objective:'manassas',posture:'hold',fromDate:'1861-05-31'},
  ]) {
    const order=orders.find(o=>o.id===expected.id);
    expect(order).toMatchObject(expected);
    expect(order!.source).toContain('[I]');
    expect(order).not.toHaveProperty('purpose');expect(order).not.toHaveProperty('discretion');
  }
  expect(orders.find(o=>o.id==='s150_mcdowell_department_hold')!.source).toContain('GO1861 p.61');
  expect(orders.find(o=>o.id==='s150_beauregard_manassas_hold')!.source).toContain('OR I-II p.896');
  expect(orders.some(o=>o.post==='us_dept_northeastern_virginia'&&o.objective==='manassas'&&o.fromDate==='1861-07-16')).toBe(true);
});

it('S150 declares June3 organized three-year cohorts and keeps Washington distinct from McDowell',()=>{
  const {world}=seatsWorld('union-1861');
  const papers=world.map.world.rules.allocationInstruments!;
  for(const state of ['connecticut','maine','michigan','new_hampshire','new_jersey','wisconsin','massachusetts']) {
    const p=papers.find(p=>p.id===`s150_june3_${state}`);
    expect(p).toMatchObject({fromDate:'1861-06-03',issuer:'lincoln_abraham',issuerPost:null,
      from:`st_gov_${state}`,to:'us_dept_washington',destination:'washington',kind:'request',
      quantity:'all',continuing:true,scope:{kind:'cohort',arm:'infantry',minTermDays:1095}});
    expect(p!.source).toContain('OR III-I p.246');
    expect(p).not.toHaveProperty('voluntary');
  }
  const onward=papers.find(p=>p.id==='s150_scott_june23');
  expect(onward).toMatchObject({issuer:'scott_winfield',issuerPost:'us_general_in_chief',mandate:'scott_army_command',
    from:'us_dept_washington',to:'us_dept_northeastern_virginia',fromDate:'1861-06-23',modes:['land'],
    scope:{kind:'named',regiments:['ct_3_infantry','ny_2_militia_infantry']}});
});

it('S150 registers every inherited research instrument with its authority, scope, conditions and named disposition',()=>{
  const registry=JSON.parse(readFileSync('docs/audit/s150-evidence/instrument-disposition.json','utf8')) as {
    research:string; instrument:string; citation:string; authority:string; scope:string; conditions:string;
    disposition:string; declarationIds:string[]; gap:string;
  }[];
  const {world}=seatsWorld('union-1861');
  const ids=new Set([...(world.map.world.rules.allocationInstruments??[]),...(world.map.world.rules.onwardAssignments??[]),...(world.map.world.rules.mandates??[]),...world.map.world.rules.ruleSeats.principals.flatMap(p=>p.calls)].map(p=>p.id));
  expect(registry.filter(r=>r.research==='S149')).toHaveLength(109);
  expect(registry.some(r=>r.research==='S138'&&r.instrument==='U07')).toBe(true);
  for(const row of registry) {
    expect(row.citation).not.toBe('');expect(row.authority).not.toBe('');expect(row.scope).not.toBe('');
    expect(['declared','partial','already_declared','named_gap','evidence_only']).toContain(row.disposition);
    expect(row.declarationIds.every(id=>ids.has(id))).toBe(true);
    if(row.disposition==='named_gap'||row.disposition==='partial')expect(row.gap.length).toBeGreaterThan(10);
  }
  for(const key of ['C38','C43'])expect(registry.find(r=>r.research==='S149'&&r.instrument===key)).toMatchObject({disposition:'named_gap',declarationIds:[]});
  expect(registry.find(r=>r.research==='S149'&&r.instrument==='U39')!.gap).toContain('organisation');
});

it('S150 gives the existing April22 requests their read office addresses and rendezvous without duplicating calls',()=>{
  const {world}=seatsWorld('union-1861');
  const calls=world.map.world.rules.ruleSeats.principals.flatMap(p=>p.calls);
  for(const [state,destination,count] of [
    ['alabama','lynchburg',2],['arkansas','lynchburg',1],['georgia','richmond',2],
    ['kentucky','harpers_ferry',1],['louisiana','richmond',1],['mississippi','lynchburg',2],
    ['north_carolina','richmond',1],['tennessee','lynchburg',3],
  ] as const) {
    const rows=calls.filter(c=>c.id===`cs_apr22_absolute_${state}`);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({regiments:count,termDays:365,address:'office',offer:{region:destination,receiver:'cs_secretary_war'}});
    expect(rows[0]!.source).toContain('S150');
  }
});
