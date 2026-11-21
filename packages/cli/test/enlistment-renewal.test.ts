import { canonicalHash, createTelemetry, decodeSave, encodeSave, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

const post = ids.toId('post', 'n_brenmark_governor');
const S = ids.toId('situation', 'shire_remuster');
const side = ids.toId('faction', 'north');
const selector: phase0.EnlistmentRenewal = { post, arm: 'infantry', regiments: 1, fromTermDays: 90, termDays: 1095, musteredBy: '1861-04-15' };
const loaded = seatsWorld('testbed');
const bareWorld = { ...loaded.world, situations: [] };
let raised = phase0.createState(bareWorld, loaded.setup);
const call = phase0.tick(bareWorld, raised, [{ day: 1, seat: phase0.seatIdFor(ids.toId('person', 'n_leader')), command: {
  cmd: 'call', to: post, regiments: 1, termDays: 90, route: 'courier', bypass: false, callId: 'shire_original',
} }], { freeze: true });
if (call.rejections.length) throw Error(JSON.stringify(call.rejections));
raised = call.state;
while (raised.stateDay < 20) raised = phase0.tick(bareWorld, raised, [], { freeze: true }).state;
const entry = Object.entries(raised.forceEnlistments).find(([, e]) => e.enlCallId === 'shire_original')!;
if (!entry) throw Error('fixture call did not muster');
const block = ids.toId('forceBlock', entry[0]);
const notice = (r = selector): phase0.SituationDef => ({ ...loaded.world.situations.find(s => s.kind === 'notice')!, id: S,
  earliest: '1861-03-01', faction: side, event: { renewableEnlistment: r }, report: null, speakers: [], namedOnly: 'The unit voluntarily remusters.',
  effects: [{ propose: { owner: 'recruitment', field: 'renew_enlistment', subject: r.post, delta: 1, side, reason: 'voluntary-remuster', renewal: r } }],
});
function tick(state = raised, r = selector) { return phase0.tick({ ...bareWorld, situations: [notice(r)] }, state, [], { freeze: true }); }

describe('a voluntary whole-unit remuster preserves the existing levy', () => {
  it('changes only the term and renewal source while preserving men, original call, muster credit, assignment and journey', () => {
    const telemetry = createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]);
    const result = phase0.tick({ ...bareWorld, situations: [notice()] }, raised, [], { freeze: true, telemetry });
    expect(telemetry.mechanics['recruitment.renewed']?.fires).toBe(1);
    expect(telemetry.mechanics['recruitment.mustered']?.fires).toBe(0);
    const control = phase0.tick(bareWorld, raised, [], { freeze: true }).state;
    expect(result.rejections).toEqual([]);
    expect(result.state.forceEnlistments[block]).toEqual({ ...raised.forceEnlistments[block], enlEndsDay: entry[1].enlMusterDay + 1095, enlRenewedBy: S });
    expect(result.state.forceBlockStates).toEqual(control.forceBlockStates);
    expect(result.state.forceLocations).toEqual(control.forceLocations);
    expect(result.state.forceAssignments).toEqual(control.forceAssignments);
    expect(result.state.postLevies).toEqual(control.postLevies);
    expect(result.state.orderResponses).toEqual(control.orderResponses);
    expect(tick(result.state).state.forceEnlistments).toEqual(result.state.forceEnlistments);
  });

  it('does not create a substitute if the original call never produced an enlistment', () => {
    const state = { ...phase0.createState(bareWorld, loaded.setup), stateDay: 20 };
    const result = tick(state);
    expect(result.state.situationStates[S]).toBeUndefined();
    expect(result.state.forceEnlistments).toEqual({});
    expect(Object.keys(result.state.forceBlockStates)).toEqual(Object.keys(state.forceBlockStates));
  });

  it.each([
    ['expired', { enlEndsDay: 20 }], ['war term', { enlEndsDay: null }], ['unknown term', { enlTermUnknown: true }],
    ['different term', { enlEndsDay: entry[1].enlMusterDay + 365 }], ['four regiments', { enlRegiments: 4 }],
    ['unknown regiments', { enlRegiments: null }], ['later original muster', { enlMusterDay: 19, enlEndsDay: 109 }],
  ] as const)('does not renew an ineligible enlistment: %s', (_, patch) => {
    const state = { ...raised, forceEnlistments: { ...raised.forceEnlistments, [block]: { ...entry[1], ...patch } } };
    const result = tick(state);
    expect(result.state.situationStates[S]).toBeUndefined();
    expect(result.state.forceEnlistments[block]?.enlRenewedBy).toBeUndefined();
  });

  it.each([{ fbSurrenderedDay: 19 }, { fbStrength: 0 }, { fbArm: 'cavalry' }, { fbDepartment: ids.toId('department', 's_war') }])('does not renew an unavailable or wrong-arm/side unit: %j', patch => {
    const state = { ...raised, forceBlockStates: { ...raised.forceBlockStates, [block]: { ...raised.forceBlockStates[block]!, ...patch } } };
    expect(tick(state).state.situationStates[S]).toBeUndefined();
  });

  it('selects the earliest eligible muster, then the strict block id; never splits a larger unit', () => {
    const other = ids.toId('forceBlock', 'aaa_remuster_fixture');
    const state = { ...raised, forceBlockStates: { ...raised.forceBlockStates, [other]: raised.forceBlockStates[block]! },
      forceEnlistments: { ...raised.forceEnlistments, [other]: entry[1] }, forceLocations: { ...raised.forceLocations, [other]: raised.forceLocations[block]! },
      forceAssignments: { ...raised.forceAssignments, [other]: raised.forceAssignments[block]! },
    };
    const result = tick(state);
    expect(result.state.forceEnlistments[other]?.enlRenewedBy).toBe(S);
    expect(result.state.forceEnlistments[block]).toEqual(entry[1]);
  });

  it('rejects a decision-origin proposal even when the unit qualifies', () => {
    const events: unknown[] = [];
    const p = notice().effects[0]!;
    if (!('propose' in p)) throw Error('expected proposal');
    const ctx = { world: bareWorld, day: 21, proposals: [{ proposal: 'effect', ...p.propose, situation: S, option: 'remuster', origin: 'decision' }], mapEvents: events } as unknown as phase0.TickContext;
    expect(phase0.renewalPhase(ctx, raised)).toBe(raised);
    expect(events).toEqual([expect.objectContaining({ event: 'proposal_refused', why: 'invalid_enlistment_renewal' })]);
  });

  it.each(['missing', 'other-side'] as const)('rejects a notice-labelled proposal with %s source provenance', source => {
    const events: unknown[] = [];
    const p = notice().effects[0]!;
    if (!('propose' in p)) throw Error('expected proposal');
    const world = source === 'missing' ? bareWorld : { ...bareWorld, situations: [{ ...notice(), faction: ids.toId('faction', 'south') }] };
    const ctx = { world, day: 21, telemetry: createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]),
      proposals: [{ proposal: 'effect', ...p.propose, situation: S, option: null, origin: 'notice' }], mapEvents: events,
    } as unknown as phase0.TickContext;
    expect(phase0.renewalPhase(ctx, raised)).toBe(raised);
    expect(events).toEqual([expect.objectContaining({ event: 'proposal_refused', why: 'invalid_enlistment_renewal' })]);
  });

  it('round-trips the renewal and resumes identically; old saves need no renewal field', () => {
    const state = tick().state;
    const worldHash = canonicalHash(bareWorld.map.world);
    const old = decodeSave(encodeSave({ worldHash, state: raised }), { expectedWorldHash: worldHash });
    expect(old.state).toEqual(raised);
    const saved = decodeSave(encodeSave({ worldHash, state }), { expectedWorldHash: worldHash });
    expect(saved.state).toEqual(state);
    expect(tick(saved.state as unknown as phase0.State).state).toEqual(tick(state).state);
  });
});
