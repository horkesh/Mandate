import { patchBlock, observeBlock } from '../../kernel/test/support/lot-fixture.ts';
import { enlistmentsOf } from '../../kernel/src/forces/enlistment.ts';
import { forceTotals } from '../../kernel/src/forces/lots.ts';
import { canonicalHash, decodeSave, encodeSave, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

const S = (s: string) => ids.toId('situation', s);
const B = (s: string) => ids.toId('forceBlock', `state-forces.${s}`);
const post = ids.toId('post', 'n_brenmark_governor');
const effect = (men: number | null = 2000, patch = {}) => ({ propose: {
  owner: 'recruitment', field: 'state_forces', subject: post, delta: 1,
  reason: 'assembly-transfer', side: ids.toId('faction', 'north'),
  stateForces: { id: 'shire_infantry', regiments: men === null ? null : 2, men, arm: 'infantry', termDays: 90 }, ...patch,
} });
function fixture(effects: unknown[] = [effect()]) {
  const loaded = seatsWorld('testbed');
  const notice = { ...loaded.world.situations.find(s => s.kind === 'notice')!,
    id: S('shire_transfer'), faction: ids.toId('faction', 'north'), earliest: '1861-03-01',
    event: { all: [{ dayAtLeast: 2 }, { flag: 'shire_joined' }] },
    effects, report: null, speakers: [], namedOnly: 'The assembly acts.',
  } as phase0.SituationDef;
  const world = { ...loaded.world, situations: [notice] };
  const state = phase0.createState(world, loaded.setup);
  return { world, state: { ...state, situationFlags: { shire_joined: 1 } } as phase0.State };
}
function run(f = fixture(), days = 3) {
  let state = f.state;
  const results = [];
  while (state.stateDay < days) {
    const r = phase0.tick(f.world, state, [], { freeze: true });
    expect(r.rejections).toEqual([]);
    state = r.state; results.push(r);
  }
  return { state, results };
}
describe('a state transfers its own forces by institutional notice', () => {
  it('enters service on the act day without a call, compliance response or muster delay', () => {
    const f = fixture();
    const r = run(f);
    expect(r.results[0]!.state.forceBlockStates[B('shire_infantry')]).toBeUndefined();
    expect(observeBlock(r.results[1]!.state.forceBlockStates[B('shire_infantry')]!)).toMatchObject({ fbStrength: 2000, fbArm: 'infantry' });
    expect(r.state.forceLocations[B('shire_infantry')]!.locRegion).toBe(f.state.postStates[post]!.postSeat);
    expect(r.state.forceAssignments[B('shire_infantry')]).toBe(post);
    expect(enlistmentsOf(r.state)[B('shire_infantry')]).toMatchObject({ enlMusterDay: 2, enlEndsDay: 92, enlSourceAct: 'shire_transfer' });
    expect(r.state.orderResponses).toEqual(f.state.orderResponses);
    expect(r.state.postLevies).toEqual({});
    expect(run(f).state).toEqual(r.state);
  });
  it('musters at its declared local command and transfers service without resetting the contingent', () => {
    const f = fixture([effect(2000, { stateForces: { id: 'shire_infantry', regiments: 2, men: 2000, arm: 'infantry', termDays: 90, post: 'n_army_west' } })]);
    const entered = run(f, 2).state;
    const b = B('shire_infantry');
    expect(entered.forceAssignments[b]).toBe('n_army_west');
    expect(entered.forceLocations[b]!.locRegion).toBe(entered.postStates[ids.toId('post', 'n_army_west')]!.postSeat);
    const previous = { ...entered, forceBlockStates: { ...entered.forceBlockStates, [b]: patchBlock({ ...entered.forceBlockStates[b]! }, { fbStrength: 1700, fbStragglers: 50 }) } };
    const notice = { ...f.world.situations[0]!, id: S('shire_service'), event: { dayAtLeast: 3 }, effects: [effect(null, { stateForces: { id: 'shire_infantry', regiments: null, men: null, arm: 'infantry', termDays: null, transferTo: 'n_war' } })] } as unknown as phase0.SituationDef;
    const next = run({ world: { ...f.world, situations: [notice] }, state: previous }, 3).state;
    const control = run({ world: { ...f.world, situations: [] }, state: previous }, 3).state;
    expect(next.forceBlockStates[b]).toEqual({ ...control.forceBlockStates[b], fbDepartment: 'n_war' });
    expect(enlistmentsOf(next)[b]).toEqual(enlistmentsOf(previous)[b]);
    expect(next.forceAssignments[b]).toEqual(previous.forceAssignments[b]);
    expect(next.forceLocations[b]).toEqual(previous.forceLocations[b]);
  });
  it('does not create a missing contingent from a service-transfer notice', () => {
    const r = run(fixture([effect(null, { stateForces: { id: 'shire_infantry', regiments: null, men: null, arm: 'infantry', termDays: null, transferTo: 'n_war' } })]));
    expect(r.state.forceBlockStates[B('shire_infantry')]).toBeUndefined();
  });
  it('ends a separately identified militia contingent by its sourced relief, without inventing an enlistment term', () => {
    const f = fixture([effect(null)]);
    const entered = run(f, 2).state;
    const notice = { ...f.world.situations[0]!, id: S('shire_relief'), event: { dayAtLeast: 3 }, effects: [effect(null, { stateForces: { id: 'shire_infantry', regiments: null, men: null, arm: 'infantry', termDays: null, release: true } })] } as unknown as phase0.SituationDef;
    const next = run({ world: { ...f.world, situations: [notice] }, state: entered }, 3).state;
    expect(next.forceBlockStates[B('shire_infantry')]).toBeUndefined();
    expect(next.forceAssignments[B('shire_infantry')]).toBeUndefined();
    expect(next.forceLocations[B('shire_infantry')]).toBeUndefined();
  });
  it('waits indefinitely without the secession cause', () => {
    const f = fixture();
    const r = run({ ...f, state: { ...f.state, situationFlags: {} } }, 5);
    expect(r.state.situationStates[S('shire_transfer')]).toBeUndefined();
    expect(r.state.forceBlockStates[B('shire_infantry')]).toBeUndefined();
  });
  it('does not turn a vacancy in the governor’s office into a veto of the state act', () => {
    const f = fixture();
    const r = run({ ...f, state: { ...f.state, postStates: { ...f.state.postStates, [post]: { ...f.state.postStates[post]!, postHolder: null } } } });
    expect(forceTotals(r.state.forceBlockStates[B('shire_infantry')]!).fbStrength).toBe(2000);
    expect(enlistmentsOf(r.state)[B('shire_infantry')]!.enlRaisedBy).toBeNull();
  });
  it('retains unknown strength and unknown original expiry explicitly', () => {
    const r = run(fixture([effect(null, { stateForces: { id: 'shire_infantry', regiments: null, men: null, arm: 'infantry', termDays: null, termUnknown: true } })]));
    expect(forceTotals(r.state.forceBlockStates[B('shire_infantry')]!).fbStrength).toBeNull();
    expect(enlistmentsOf(r.state)[B('shire_infantry')]).toMatchObject({ enlEndsDay: null, enlTermUnknown: true });
  });
  it('a later quantified return fills the same block without renewing or relocating it', () => {
    const f = fixture([effect(null)]);
    const count = { ...f.world.situations[0]!, id: S('shire_return'), event: { all: [{ dayAtLeast: 3 }, { fired: S('shire_transfer') }] }, effects: [effect(2000)] } as phase0.SituationDef;
    const r = run({ ...f, world: { ...f.world, situations: [...f.world.situations, count] } }, 4);
    expect(forceTotals(r.state.forceBlockStates[B('shire_infantry')]!).fbStrength).toBe(2000);
    expect(enlistmentsOf(r.state)[B('shire_infantry')]).toMatchObject({ enlMusterDay: 2, enlEndsDay: 92, enlSourceAct: 'shire_transfer' });
    expect(Object.keys(r.state.forceBlockStates).filter(b => b.startsWith('state-forces.'))).toHaveLength(1);
  });
  it('a later return cannot recreate a contingent that has left play', () => {
    const f = fixture([effect(null)]);
    const entered = run(f, 3).state;
    const removed = phase0.applyMusters(f.world.map, entered, [{ change: 'disband', block: B('shire_infantry'), cause: 'recruitment' }]);
    const placed = phase0.placeAndRemove(f.world.map, removed.state, [], removed.disbanded);
    const gone = phase0.musterAssignments(placed, [], [], removed.disbanded);
    const count = { ...f.world.situations[0]!, id: S('shire_return'), event: { dayAtLeast: 4 }, effects: [effect(2000)] } as phase0.SituationDef;
    const r = run({ ...f, state: gone, world: { ...f.world, situations: [...f.world.situations, count] } }, 4);
    expect(r.state.forceBlockStates[B('shire_infantry')]).toBeUndefined();
  });
  it('round-trips the source act and unknown original term after entry, and resumes identically', () => {
    const f = fixture([effect(null, { stateForces: { id: 'shire_infantry', regiments: null, men: null, arm: 'infantry', termDays: null, termUnknown: true } })]);
    const state = run(f).state;
    const hash = canonicalHash(f.world.map.world);
    const loaded = decodeSave(encodeSave({ worldHash: hash, state }), { expectedWorldHash: hash });
    expect(loaded.state).toEqual(state);
    expect(run({ ...f, state: loaded.state as unknown as phase0.State }, 5).state).toEqual(run({ ...f, state }, 5).state);
  });
  it.each([{ side: 'south' }, { subject: 'n_army_west' }, { delta: -1 }])('refuses a malformed or other-side transfer: %j', patch => {
    const r = run(fixture([effect(2000, patch)]));
    expect(r.state.forceBlockStates[B('shire_infantry')]).toBeUndefined();
    expect(r.results.flatMap(r => r.mapEvents).some(e => e.event === 'proposal_refused')).toBe(true);
  });
  it('credits an included call after its response has been pruned, preserving the existing men and expiry', () => {
    const f = fixture();
    const world = { ...f.world, situations: [] };
    const call = phase0.tick(world, f.state, [{ day: 1, seat: phase0.seatIdFor(ids.toId('person', 'n_leader')), command: {
      cmd: 'call', to: post, regiments: 2, termDays: 90, route: 'courier', bypass: false, callId: 'shire_prior',
    } }], { freeze: true });
    expect(call.rejections).toEqual([]);
    let state = call.state;
    while (state.stateDay < 20) state = phase0.tick(world, state, [], { freeze: true }).state;
    const previous = Object.entries(enlistmentsOf(state)).filter(([, e]) => e.enlCallId === 'shire_prior');
    expect(previous).toHaveLength(1);
    const [id, enlistment] = previous[0]!;
    const previousMen = forceTotals(state.forceBlockStates[id as keyof typeof state.forceBlockStates]!).fbStrength!;
    const e = effect(4000, { stateForces: { id: 'shire_infantry', regiments: 4, men: 4000, arm: 'infantry', termDays: null, termUnknown: true, includesCalls: ['shire_prior'] } });
    const notice = { ...f.world.situations[0]!, effects: [e] } as phase0.SituationDef;
    const r = run({ world: { ...world, situations: [notice] }, state: { ...state, orderResponses: {} } }, 21);
    expect(forceTotals(r.state.forceBlockStates[B('shire_infantry')]!).fbStrength).toBe(4000 - previousMen);
    expect(enlistmentsOf(r.state)[id as keyof ReturnType<typeof enlistmentsOf>]).toEqual(enlistment);
  });
});
