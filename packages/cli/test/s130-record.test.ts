import { expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';
import { historyPack } from '../src/done-check.ts';
import { phase0 } from '@mandate/kernel';

it('declares accepted demonstration policy and three distinct Scott papers without prescribing Patterson replies', () => {
  const {world}=seatsWorld('union-1861');
  expect(world.map.world.rules.plans.demonstration).toEqual({detentionRegions:2,actionRegions:4,deploymentDays:[1,2],
    reconnaissanceDays:1,demonstrationCandidates:12,totalCandidates:16,reserveDays:1});
  const rows=world.map.world.rules.ruleSeats.principals.find(r=>r.faction==='union')!.offensives.filter(r=>r.purpose!==undefined);
  expect(rows).toHaveLength(3);
  expect(rows.map(r=>[r.issuer,r.fromDate,r.letter?.key])).toEqual([
    ['scott_winfield','1861-07-13','scott_patterson_jul13'],
    ['scott_winfield','1861-07-17','scott_patterson_jul17'],
    ['scott_winfield','1861-07-18','scott_patterson_jul18'],
  ]);
  for(const row of rows){
    expect(row.post).toBe('us_dept_pennsylvania');
    expect(row.purpose).toMatchObject({kind:'attack_or_demonstrate',duty:'detain',target:{kind:'opposing_command',post:'cs_cmd_harpers_ferry'},detentionArea:['lower_valley'],actionArea:['harpers_ferry','lower_valley']});
    expect(row).not.toHaveProperty('posture'); expect(row).not.toHaveProperty('objective');
    expect(row.source).toMatch(/OR I-II pp\.16[678]/);
    expect(row).not.toHaveProperty('answer');
  }
  expect(rows[0]!.source).toContain('unrepresented');
  expect(rows[2]!.source).toContain('entrench-and-wait');
  expect(world.map.world.rules.mandates?.find(m=>m.grant.mandateHolder==='scott_winfield')?.grant.mandateActions).toContain('attack_or_demonstrate');
  expect(world.start.posts.some(p=>p.id==='cs_cmd_harpers_ferry')).toBe(false);
  expect(world.start.temporaryPosts.some(p=>p.id==='cs_cmd_harpers_ferry')).toBe(true);
  expect(phase0.createState(world,{seed:1}).postStates).not.toHaveProperty('cs_cmd_harpers_ferry');
});
it('makes the two separate July matters binding with evidence requirements rather than representation gaps', () => {
  const rows=historyPack('union-1861')!.pushbackRegisters.flatMap(r=>r.rows).filter(r=>['U33','U34'].includes(r.id));
  expect(rows).toHaveLength(2);
  expect(rows.map(r=>r.gap)).toEqual([undefined,undefined]);
  expect(rows.map(r=>r.match?.detentionEvidence)).toEqual(['course_challenge','actual_deferral']);
  expect(rows[0]!.match?.letters).toEqual([{namespace:'us_army_orders',key:'scott_patterson_jul13',revision:1}]);
  expect(rows[1]!.match?.letters).toEqual(['scott_patterson_jul17','scott_patterson_jul18'].map(key=>({namespace:'us_army_orders',key,revision:1})));
});
