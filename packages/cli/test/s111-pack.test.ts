import { expect,it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';
import { historyPack } from '../src/done-check.ts';

it('keeps the April three-regiment matter and applies omission readings by source family',()=>{
  const { world }=seatsWorld('union-1861');
  const rules=world.map.world.rules;
  const call=rules.ruleSeats.principals.flatMap(p=>p.calls).find(c=>c.id==='cs_apr22_absolute_tennessee')!;
  expect(call).toMatchObject({fromDate:'1861-04-22',regiments:3,post:'st_gov_tennessee',termsId:'cs_apr22_absolute_tennessee'});
  const families=new Map<string,unknown>();
  for(const profile of rules.recruitment.callProfiles??[]){
    if(families.has(profile.sourceProfile)) expect(profile.information).toEqual(families.get(profile.sourceProfile));
    else families.set(profile.sourceProfile,profile.information);
  }
  expect(rules.recruitment.stateConditions??[]).toEqual([]);
  const hold=rules.ruleSeats.principals.flatMap(p=>p.offensives).find(o=>o.id==='holmes_fredericksburg_assignment');
  expect(hold).toMatchObject({fromDate:'1861-06-05',post:'cs_cmd_fredericksburg',objective:'fredericksburg',posture:'hold'});
  const rows=historyPack('union-1861')!.pushbackRegisters!.flatMap(r=>r.rows).filter(r=>r.status==='eligible');
  expect(rows).toHaveLength(33);
  expect(rows.find(r=>r.id==='C03')!.match!.qualification!.every(q=>q.groundKind==='resource_report')).toBe(true);
});
