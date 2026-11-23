import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { relayChain } from '../../../packages/kernel/src/seats/posts.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';
import { createRuleSeat } from '@mandate/rule-seats';
import { headquartersOf } from '../../../packages/kernel/src/seats/posts.ts';

const id = ids.toId;
const aig = id('post', 'cs_war_adjutant_inspector_general');
const army = id('post', 'cs_cmd_harpers_ferry');
const davis = id('person', 'davis_jefferson');

it('July field orders pass through the Adjutant and Inspector General, while the War Department keeps its other channels', () => {
  const { world, setup } = seatsWorld('union-1861');
  const start = phase0.createState(world, setup);
  const command = world.start.temporaryPosts.find(p => p.id === army)!;
  const office = world.start.posts.find(p => p.id === aig)!;
  expect(office).toMatchObject({ department: 'cs_war', parent: 'cs_president' });
  expect(office.departmentChanges).toEqual([]);
  expect(command.parent).toBe(aig);
  expect(world.situations.find(s=>s.id==='manassas_advance_received')!.report!.authors).toEqual([aig]);
  // This fixture exercises the declared chain; it does not assert an appointment or arrival date.
  const state = { ...start, postStates: { ...start.postStates,
    [army]: { ...start.postStates[aig]!, postKind: command.kind, postDepartment: command.department, postParent: command.parent,
      postHolder: id('person', 'johnston_joseph_e'), postSeat: command.region },
  } };
  expect(relayChain(state, davis, army)).toEqual([aig, army]);
  expect(start.postStates[id('post','cs_secretary_war')]!.postParent).toBe('cs_president');
  const doctrine = world.map.world.rules.ruleSeats.principals.find(p => p.faction === 'confederate')!;
  expect(doctrine.appointments?.find(a => a.post === aig)).toMatchObject({ person: 'cooper_samuel', onDate: '1861-03-19' });
  expect(world.start.posts.find(p => p.id === 'cs_cmd_charleston')!.parent).toBe('cs_secretary_war');
});

it('0111 changes only the trims obligation while the coverage scorer awaits its own ruling', () => {
  const checks=JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
  expect(checks.pushback.find((r:{id:string})=>r.id==='trims')).toMatchObject({min:0,max:3,cite:expect.stringContaining('0111')});
});

it('the Adjutant and Inspector General follows the government to Richmond without relocating a field commander',()=>{
  const {world,setup}=seatsWorld('union-1861');
  const initial=phase0.createState(world,setup);
  const state={...initial,factionCapitals:{...initial.factionCapitals,confederate:id('region','richmond')}};
  expect(headquartersOf(world,state,aig)).toBe('richmond');
  expect(world.roleOf(state.postStates[aig]!.postKind)).toBe('office');
  const command=world.start.temporaryPosts.find(p=>p.id===army)!;
  const field={...state,postStates:{...state.postStates,[army]:{...state.postStates[aig]!,postKind:command.kind,postSeat:command.region,postHolder:id('person','johnston_joseph_e')}}};
  expect(headquartersOf(world,field,army)).toBe('harpers_ferry');
});
