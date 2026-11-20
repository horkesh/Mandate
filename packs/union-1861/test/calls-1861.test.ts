import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
const pack=JSON.parse(fs.readFileSync(new URL('../pack.json',import.meta.url),'utf8'));
const catalogue=JSON.parse(fs.readFileSync(new URL('../calls-1861.json',import.meta.url),'utf8'));
const rows=pack.rules.ruleSeats.principals.flatMap((p:{calls:unknown[]})=>p.calls) as {id?:string;men?:number;regiments:number;termDays:number|null;readiness?:boolean;fromDate:string;post:string;source:string}[];
describe('1861 calls follow the read record, with authorizations kept apart from musters',()=>{
 it('retains each dated call once, with the Florida exceptions and additive April readiness calls',()=>{
  expect(new Set(rows.map(r=>r.id)).size).toBe(rows.length);
  for(const r of rows) expect(r.source).toMatch(/OR .*p[p]?\./);
  for(const [key,total] of [['mar09',11700],['apr08',19500],['apr16',32000],['jun30_reserve',30000]] as const) {
   const group=rows.filter(r=>r.id?.startsWith(`cs_${key}_`));
   expect(group.reduce((n,r)=>n+r.men!,0)).toBe(total);
  }
  expect(rows.find(r=>r.id==='cs_apr08_florida')).toMatchObject({men:1500,readiness:true});
  expect(rows.find(r=>r.id==='cs_apr16_florida')).toMatchObject({men:2000,readiness:true});
  expect(rows.some(r=>r.fromDate==='1861-04-15' && r.id?.startsWith('us_'))).toBe(false);
  expect(rows.find(r=>r.id==='us_may03_accepted_new_york')).toMatchObject({regiments:38,termDays:730,fromDate:'1861-05-03'});
  expect(rows.find(r=>r.id==='us_jul25_new_york')).toMatchObject({men:25000,fromDate:'1861-07-25'});
 });
 it('records legal totals and source limits without creating a statutory ceiling as another levy',()=>{
  expect(catalogue.records.find((r:{id:string})=>r.id==='us_may03')).toMatchObject({volunteers:42034,regulars:22714,seamen:18000});
  expect(catalogue.records.find((r:{id:string})=>r.id==='us_jul22')).toMatchObject({kind:'authorization',maximumMen:500000});
  expect(catalogue.records.find((r:{id:string})=>r.id==='us_jul25')).toMatchObject({kind:'authorization',maximumMen:500000});
  expect(rows.some(r=>r.men===500000 || r.men===100000)).toBe(false);
  expect(pack.rules.recruitment.menPerRegiment).toBe(1000);
  expect(rows.find(r=>r.id==='cs_nc_state_transfer_north_carolina')).toBeUndefined();
  const transfer=JSON.parse(fs.readFileSync(new URL('../situations/north_carolina_forces_transferred.json',import.meta.url),'utf8'));
  expect(transfer.effects.find((e:{propose?:{stateForces?:{id:string}}})=>e.propose?.stateForces?.id==='cs_nc_state_transfer_north_carolina').propose.stateForces.termDays).toBeNull();
 });
});
