import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { callEstablishment, recruitmentRuleProblems } from '../../../packages/kernel/src/recruitment/rules.ts';
import { regimentsRaised } from '../../../packages/kernel/src/tick/recruitment.ts';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

it('every researched call profile names its own dated cited organisation',()=>{
  const {world}=seatsWorld('union-1861');const rules=world.map.world.rules.recruitment;
  expect(rules.menPerRegiment).toBeUndefined();
  expect(recruitmentRuleProblems(rules)).toEqual([]);
  expect(rules.callProfiles).toHaveLength(100);
  for(const p of rules.callProfiles!){
    const e=rules.establishments!.find(e=>e.id===p.callEstablishment)!;
    expect(e, p.id).toBeDefined();expect(e.cites.length).toBeGreaterThan(0);expect(e.effective).toMatch(/^1861-/);
  }
  for(const [profile,men] of [['us_apr15_maine',780],['us_may03_accepted_new_york',866],['us_may04_regular_infantry',2020],['us_may04_regular_cavalry',997],['us_may04_regular_artillery',997],['us_jul30_cavalry_new_york',660],['cs_apr22_absolute_tennessee',780]] as const){
    const p=rules.callProfiles!.find(p=>p.id===profile)!;const row=rules.establishments!.find(e=>e.id===p.callEstablishment)!;
    expect(callEstablishment(rules,p,row.faction,row.arm)?.men).toBe(men);
    expect(regimentsRaised(rules,2,'comply',null,undefined,row.men)?.men).toBe(men*2);
  }
});

it('keeps historical transfers unknown while restoring the named raised lots to rule quantities',()=>{
  const {world}=seatsWorld('union-1861');
  for(const name of ['arkansas_forces_transferred','north_carolina_forces_transferred']){
    const s=world.situations.find(s=>s.id===name)!;
    for(const e of s.effects)if('propose' in e && e.propose.stateForces){expect(e.propose.stateForces.men).toBeNull();expect(e.propose.stateForces.strengthBasis?.strengthKind).toBe('unknown');}
  }
  const call=world.map.world.rules.ruleSeats.principals.flatMap(p=>p.calls).find(c=>c.id==='cs_apr22_absolute_tennessee')!;
  expect('men' in call).toBe(false);
  const original=JSON.parse(readFileSync(new URL('../pack.json',import.meta.url),'utf8'));
  expect(original.rules.recruitment.establishments.find((e:{id:string})=>e.id==='cs_public_defense_infantry').note).toContain('64 men');
});
