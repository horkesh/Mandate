import fs from 'node:fs';
import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const acts = [
  ['virginia_forces_transferred', 'virginia_seceded', 93],
  ['north_carolina_forces_transferred', 'north_carolina_seceded', 114],
  ['tennessee_forces_return', 'tennessee_forces_authorized', 119],
  ['arkansas_forces_transferred', 'arkansas_seceded', 132],
] as const;
const B = (s: string) => ids.toId('forceBlock', `state-forces.${s}`);
describe('R97: the recorded state acts have their own cause, date and service entry', () => {
  it.each(acts)('%s waits for %s as well as day %i', (id, cause, day) => {
    const loaded = seatsWorld('union-1861');
    const def = loaded.world.situations.find(s => s.id === id)!;
    const world = { ...loaded.world, situations: [def] };
    expect(def.event).toEqual({ all: [{ dayAtLeast: day }, { flag: cause }] });
    expect(def.gate).toHaveProperty('none');
    expect(def.gateReview).toBeNull();
    expect(def.citations.every(c => c.source === 'OR' && c.at?.includes('p'))).toBe(true);
    const initial = { ...phase0.createState(world, loaded.setup), stateDay: day - 1 };
    const absent = phase0.tick(world, initial, [], { freeze: true });
    expect(absent.state.situationStates[ids.toId('situation', id)]).toBeUndefined();
    const p = def.effects.flatMap(e => 'propose' in e && e.propose.owner === 'recruitment' ? [e.propose] : []);
    const dept = initial.postStates[ids.toId('post', p[0]!.subject!)]!.postDepartment;
    const present = phase0.tick(world, { ...initial, situationFlags: { [cause]: day - 5 }, departmentFactions: { ...initial.departmentFactions, [dept]: ids.toId('faction', 'confederate') } }, [], { freeze: true });
    expect(present.state.situationStates[ids.toId('situation', id)]?.sitFiredDay).toBe(day);
    for (const e of p) {
      if (e.stateForces!.transferTo !== undefined) {
        expect(present.state.forceBlockStates[B(e.stateForces!.id)]).toBeUndefined();
      } else {
        expect(present.state.forceBlockStates[B(e.stateForces!.id)]).toBeDefined();
        expect(present.state.forceAssignments[B(e.stateForces!.id)]).toBe(e.subject);
      }
    }
    expect(present.state.orderResponses).toEqual(initial.orderResponses);
    expect(present.state.postLevies).toEqual({});
  });
  it('has no duplicate governor requisition for any institutional entry, and defers the returns', () => {
    const loaded = seatsWorld('union-1861');
    const entries = loaded.world.situations.flatMap(s => s.effects.flatMap(e => 'propose' in e && e.propose.stateForces ? [e.propose.stateForces.id] : []));
    const pack = JSON.parse(fs.readFileSync(new URL('../pack.json', import.meta.url), 'utf8'));
    const calls = pack.rules.ruleSeats.principals.flatMap((p: { calls: { id: string }[] }) => p.calls);
    for (const id of entries) expect(calls.some((c: { id: string }) => c.id === id), id).toBe(false);
    for (const [id, parent, day] of [['virginia_forces_return', 'virginia_forces_transferred', 104],
      ['tennessee_forces_transferred', 'tennessee_seceded', 116],
      ['tennessee_forces_return', 'tennessee_forces_authorized', 119],
      ['tennessee_forces_receiving_procedure', 'tennessee_forces_tendered', 122],
      ['tennessee_forces_state_order', 'tennessee_forces_procedure_recorded', 148]] as const) {
      expect(loaded.world.situations.find(s => s.id === id)!.event).toEqual({ all: [{ dayAtLeast: day }, { flag: parent }] });
    }
    const nc = loaded.world.situations.find(s => s.id === 'north_carolina_forces_transferred')!;
    expect(nc.effects.flatMap(e => 'propose' in e && e.propose.stateForces?.id === 'cs_nc_volunteers_north_carolina' ? [e.propose.stateForces] : [])).toMatchObject([{ regiments: 4, men: 4000, includesCalls: ['cs_apr22_absolute_north_carolina'] }]);
  });
  it('records the Tennessee tender under its State chain without allocating its headcounts or ship-ready field batteries', () => {
    const loaded = seatsWorld('union-1861');
    const world = { ...loaded.world, situations: loaded.world.situations.filter(s => s.id.startsWith('tennessee_forces_')) };
    const initial = phase0.createState(world, loaded.setup);
    let state: typeof initial = { ...initial, situationFlags: { tennessee_seceded: 65 },
      departmentFactions: { ...initial.departmentFactions, [ids.toId('department', 'st_tennessee')]: ids.toId('faction', 'confederate') } };
    const step = (day: number) => { state = phase0.tick(world, { ...state, stateDay: day - 1 }, [], { freeze: true }).state; };
    const entries = () => Object.entries(state.forceBlockStates).filter(([id]) => id.startsWith('state-forces.cs_tn_'));
    step(116);
    expect(entries()).toEqual([]);
    step(119);
    expect(entries().map(([id]) => id).sort()).toEqual(['cavalry', 'infantry', 'river_artillery'].map(arm => B(`cs_tn_${arm}_tennessee`)));
    for (const day of [122, 148]) step(day);
    expect(state.situationFlags).toMatchObject({ tennessee_forces_authorized: 116, tennessee_forces_tendered: 119,
      tennessee_forces_procedure_recorded: 122, tennessee_forces_state_order_recorded: 148 });
    for (const [id, block] of entries()) {
      expect(state.forceAssignments[ids.toId('forceBlock', id)]).toBe('st_gov_tennessee');
      expect(block.fbDepartment).toBe('st_tennessee');
      expect(block.fbLots).toMatchObject([{ lotRegiment: null, lotMen: null, lotStragglers: null,
        lotService: { enlRegiments: null, enlTermUnknown: true } }]);
    }
  });
});
