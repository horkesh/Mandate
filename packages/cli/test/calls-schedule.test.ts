import { enlistmentsOf } from '../../kernel/src/forces/enlistment.ts';
import { forceTotals } from '../../kernel/src/forces/lots.ts';
import { ids, phase0, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

const id = ids.toId;
describe('dated public wires and exact troop quotas', () => {
  it('answers a readiness request without mustering troops before an absolute requisition', () => {
    const { world, setup } = seatsWorld('testbed');
    let state=phase0.createState(world,setup);
    for(let day=1;day<=25;day++) {
      const r=phase0.tick(world,state,day===1 ? [{day,seat:phase0.seatIdFor(id('person','n_leader')),command:{cmd:'call',to:id('post','n_brenmark_governor'),regiments:3,termDays:365,readiness:true,callId:'ready',route:'courier',bypass:false}}] : [], {freeze:true});
      expect(r.rejections).toEqual([]); state=r.state;
    }
    expect(Object.values(state.orderResponses).some(r=>r.respCallId==='ready' && r.respRole==='addressee')).toBe(true);
    expect(Object.values(state.postLevies)).toHaveLength(0);
    expect(Object.values(enlistmentsOf(state))).toHaveLength(0);
  });
  it('delivers a public wire on its documented dates without assigning military control', () => {
    const { world, setup } = seatsWorld('testbed');
    const state = phase0.createState(world, setup);
    const from = world.faction(world.factionIds[0]!).seatRegion;
    const to = world.start.posts.find(p => p.kind === 'governor')!.region!;
    const changed = { ...world, rules: { ...world.rules, latency: { ...world.rules.latency, publicWires: [{ from, to, faction: world.factionIds[0]!, fromDate: world.start.startDate, throughDate: w.formatIsoDate(w.civilFromDays(w.daysFromCivil(w.parseIsoDate(world.start.startDate)) + 2)), source: 'TB-DESIGN: public office' }] } } };
    const index = phase0.buildControlIndex(world.map, { ...state.regionControl, [to]: {} });
    const route = (day:number) => phase0.routeLatency(phase0.latencyMapFor(changed,index,day), changed.rules.latency, 'wire',from,to,world.factionIds[0]!,null);
    expect(route(1)).toMatchObject({ ok: true, latency: { days: 0, parts: [{ part: 'public wire', days: 0 }] } });
    expect(route(3)).not.toMatchObject({ ok: true, latency: { parts: [{ part: 'public wire', days: 0 }] } });
    expect(index.holdings.get(to)?.holder).toBeNull();
  });

  it.each([500, null])('musters a sourced quota of %s men, preserving unknown strength', (men) => {
    const { world, setup } = seatsWorld('testbed');
    let state = phase0.createState(world, setup);
    const governor = id('post','n_brenmark_governor');
    for(let day=1;day<=25;day++) {
      const result = phase0.tick(world,state,day===1 ? [{ day, seat: phase0.seatIdFor(id('person','n_leader')), command: { cmd:'call', to:governor,regiments:men === null ? null : 1,men,arm:'cavalry',callId:'small_quota',termDays:null,route:'courier',bypass:false } }] : [],{freeze:true});
      expect(result.rejections).toEqual([]);
      state=result.state;
    }
    const response=Object.values(state.orderResponses).find(r=>r.respCallId==='small_quota' && r.respRole==='addressee');
    const enlisted=Object.entries(enlistmentsOf(state)).find(([,e])=>e.enlCall===response?.respOrder);
    expect(enlisted).toBeDefined();
    expect(enlisted![1].enlEndsDay).toBeNull();
    expect(forceTotals(state.forceBlockStates[id('forceBlock',enlisted![0])]!).fbStrength).toBe(men);
    expect(state.forceBlockStates[id('forceBlock',enlisted![0])]!.fbArm).toBe('cavalry');
    expect(state.forceAssignments[id('forceBlock',enlisted![0])]).toBe(governor);
    expect(state.forceLocations[id('forceBlock',enlisted![0])]!.locRegion).toBe(state.postStates[governor]!.postSeat);
  });
});
