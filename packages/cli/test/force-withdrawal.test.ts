import { canonicalHash, createTelemetry, decodeSave, encodeSave, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

const loaded = seatsWorld('testbed');
const bare = { ...loaded.world, situations: [] };
const start = phase0.createState(bare, loaded.setup);
const block = Object.keys(start.forceBlockStates).map(x => ids.toId('forceBlock', x)).find(x => start.forceLocations[x]!.locAboard === null)!;
const region = start.forceLocations[block]!.locRegion;
const side = start.departmentFactions[start.forceBlockStates[block]!.fbDepartment]!;
const S = ids.toId('situation', 'garrison_withdrawal');
const withdrawal: phase0.ForceWithdrawal = { block, regions: [region] };
const notice: phase0.SituationDef = { ...loaded.world.situations.find(s => s.kind === 'notice')!, id: S, faction: side,
  earliest: '1861-03-01', event: { withdrawableForce: withdrawal }, speakers: [], report: null,
  effects: [{ propose: { owner: 'forces', field: 'withdraw_from_theatre', subject: block, delta: 1, reason: 'recorded-departure', side, withdrawal } }],
};
const world = { ...bare, situations: [notice] };
const tick = (state = start) => phase0.tick(world, state, [], { freeze: true });
describe('a sourced withdrawal is bounded to the contingent still in its theatre', () => {
  it('removes it through the owners without casualties, substitute troops or unrelated removals', () => {
    const control = phase0.tick(bare, start, [], { freeze: true }).state;
    const telemetry = createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]);
    const result = phase0.tick(world, start, [], { freeze: true, telemetry });
    expect(result.rejections).toEqual([]);
    expect(result.state.forceBlockStates[block]).toBeUndefined();
    expect(result.state.forceLocations[block]).toBeUndefined();
    expect(result.state.forceAssignments[block]).toBeUndefined();
    expect(Object.keys(result.state.forceBlockStates)).toEqual(Object.keys(control.forceBlockStates).filter(x => x !== block));
    expect(telemetry.mechanics['combat.captured']?.fires).toBe(0);
    expect(tick(result.state).state.forceBlockStates[block]).toBeUndefined();
  });
  it('does not hold on a date alone or remove a contingent moved outside the cited theatre', () => {
    expect(phase0.holds(notice.event, { state: phase0.emptyState(), day: 90, situation: null, knowledge: { knownReports: [] }, since: null })).toBe(false);
    const elsewhere = loaded.world.map.world.regions.find(r => r.id !== region && r.kind === 'land')!.id;
    const moved = { ...start, forceLocations: { ...start.forceLocations, [block]: { ...start.forceLocations[block]!, locRegion: elsewhere } } };
    expect(tick(moved).state.situationStates[S]).toBeUndefined();
  });
  it('refuses a decision-origin or wrong-side withdrawal', () => {
    for (const patch of [{ origin: 'decision' }, { side: ids.toId('faction', 'wrong_side') }]) {
      const p = notice.effects[0]!; if (!('propose' in p)) throw Error('fixture');
      const ctx = { world, day: 1, proposals: [{ proposal: 'effect', ...p.propose, situation: S, option: null, origin: 'notice', ...patch }], mapEvents: [] } as unknown as phase0.TickContext;
      expect(phase0.withdrawalPhase(ctx, start)).toBe(start);
    }
  });
  it('round trips the existing State without a new field', () => {
    const state = tick().state;
    const worldHash = canonicalHash(world.map.world);
    const saved = decodeSave(encodeSave({ worldHash, state }), { expectedWorldHash: worldHash });
    expect(saved.state).toEqual(state);
    expect(tick(saved.state as unknown as phase0.State).state).toEqual(tick(state).state);
  });

  it('keeps a whole contingent when a detached part has left the theatre', () => {
    const child = ids.toId('forceBlock', 'detached_exit_fixture');
    const elsewhere = loaded.world.map.world.regions.find(r => r.id !== region && r.kind === 'land')!.id;
    const state = { ...start, forceBlockStates: { ...start.forceBlockStates,
      [child]: { ...start.forceBlockStates[block]!, fbKind: 'detachment' as const, fbParent: block } },
      forceLocations: { ...start.forceLocations, [child]: { ...start.forceLocations[block]!, locRegion: elsewhere } } };
    expect(phase0.holds(notice.event, { state, day: 90, situation: null, knowledge: { knownReports: [] }, since: null })).toBe(false);
  });

  it.each(['missing source', 'uncited source', 'unguarded source', 'different payload'] as const)('refuses %s', fault => {
    const p = notice.effects[0]!;
    if (!('propose' in p)) throw Error('expected proposal');
    const source = fault === 'uncited source' ? { ...notice, citations: [] } : fault === 'unguarded source' ? { ...notice, event: { dayAtLeast: 1 } } : notice;
    const ctx = { world: { ...world, situations: fault === 'missing source' ? [] : [source] }, day: 1,
      proposals: [{ proposal: 'effect', ...p.propose, situation: S, option: null, origin: 'notice',
        ...(fault === 'different payload' ? { withdrawal: { ...withdrawal, regions: [region, region] } } : {}) }], mapEvents: [] } as unknown as phase0.TickContext;
    expect(phase0.withdrawalPhase(ctx, start)).toBe(start);
  });
});
