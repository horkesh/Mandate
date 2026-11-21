import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const { world, setup } = seatsWorld('union-1861');
const P = (s: string) => ids.toId('person', s);
const POST = (s: string) => ids.toId('post', s);
const seat = phase0.seatIdFor(P('lincoln_abraham'));
const doctrine = world.map.world.rules.ruleSeats.principals.find(r => r.faction === 'union')!;
function menu(state: phase0.State) { return phase0.pendingRequests(world, state).find(r => r.requestSeat === seat)!; }

describe('S1 national volunteer allocations and Regular recruiting', () => {
  it('preserves earlier calls and records sixteen additional quotas without a duplicate Minnesota levy', () => {
    const calls = doctrine.calls.filter(c => /^us_may1[56]_vol_/.test(c.id ?? ''));
    expect(calls).toHaveLength(16);
    expect(calls.reduce((n, c) => n + (c.regiments ?? 0), 0)).toBe(56);
    for (const c of calls) expect(c.termDays).toBe(1095);
    expect(calls.find(c => c.post === 'st_gov_new_york')).toMatchObject({ regiments: 14, fromDate: '1861-05-16' });
    expect(calls.find(c => c.post === 'st_gov_indiana')).toMatchObject({ regiments: 4, fromDate: '1861-05-16' });
    expect(calls.some(c => c.post === 'st_gov_minnesota')).toBe(false);
    expect(doctrine.calls.find(c => c.id === 'us_may03_accepted_new_york')).toMatchObject({ regiments: 38, termDays: 730 });
    expect(doctrine.calls.find(c => c.id === 'us_jun11_indiana')).toMatchObject({ regiments: 6 });
    const catalogue = JSON.parse(readFileSync(new URL('../calls-1861.json', import.meta.url), 'utf8'));
    expect(catalogue.records.find((r: { id: string }) => r.id === 'us_may03')).toMatchObject({ volunteers: 42034, regulars: 22714, seamen: 18000 });
  });

  it('keeps the directed Regular organizations separate from unread actual enlisted strength', () => {
    const calls = doctrine.calls.filter(c => c.id?.startsWith('us_may04_regular_'));
    expect(calls.map(c => [c.arm, c.regiments, c.men])).toEqual([['infantry', 8, null], ['cavalry', 1, null], ['artillery', 1, null]]);
    const catalogue = JSON.parse(readFileSync(new URL('../calls-1861.json', import.meta.url), 'utf8'));
    expect(catalogue.records.find((r: { id: string }) => r.id === 'us_may04_regular_organization')).toMatchObject({ requestedMinimumMen: 18154, maximumOrganizationMen: 22714 });
    const start = phase0.createState(world, setup);
    expect(start.postStates[POST('us_recruiting_service')]).toBeUndefined();
    expect(Object.values(start.forceEnlistments).some(e => e.enlPost === POST('us_recruiting_service'))).toBe(false);
    const dueWithoutOffice = { ...start, stateDay: 59, situationFlags: { war_begun_union: 41 } };
    const answer = createRuleSeat().respond(menu(dueWithoutOffice));
    if (answer.answerKind !== 'commands') throw Error('expected commands');
    expect(answer.commands.some(c => c.cmd === 'call' && c.to === 'us_recruiting_service')).toBe(false);
    const invalid = phase0.tick(world, dueWithoutOffice, [{ day: 60, seat, command: { cmd: 'call', to: POST('us_recruiting_service'), regiments: 8, men: 16160, arm: 'infantry', termDays: 1095, route: 'courier', bypass: false } }], { freeze: true });
    expect(invalid.rejections.map(r => r.reason)).toEqual(['unknown_post']);
  });

  it('opens the recruiting office normally and routes each request through Smith’s own answer', () => {
    const start = phase0.createState(world, setup);
    let state: phase0.State = { ...start, stateDay: 52, situationFlags: { war_begun_union: 41 } };
    const answer = createRuleSeat().respond(menu(state));
    if (answer.answerKind !== 'commands') throw Error('expected commands');
    const command = answer.commands.find(c => c.cmd === 'appoint' && c.post === 'us_recruiting_service')!;
    expect(command).toMatchObject({ person: P('smith_charles_f') });
    let r = phase0.tick(world, state, [{ day: 53, seat, command }], { freeze: true });
    expect(r.rejections).toEqual([]); state = r.state;
    expect(state.postStates[POST('us_recruiting_service')]?.postHolder).toBe(P('smith_charles_f'));
    state = { ...state, stateDay: 59 };
    const requested = doctrine.calls.filter(c => c.id?.startsWith('us_may04_regular_'));
    r = phase0.tick(world, state, requested.map(c => ({ day: 60, seat, command: { cmd: 'call' as const, to: c.post, regiments: c.regiments, men: c.men, arm: c.arm!, callId: c.id!, termDays: 1095, route: 'courier' as const, bypass: false } })), { freeze: true });
    expect(r.rejections).toEqual([]); state = r.state;
    for (let day = 61; day <= 90; day++) state = phase0.tick(world, state, [], { freeze: true }).state;
    const answers = Object.values(state.orderResponses).filter(r => r.respRole === 'addressee' && r.respKind === 'call' && requested.some(c => c.id === r.respCallId));
    expect(answers).toHaveLength(3);
    const accepted = answers.filter(r => ['exceed', 'comply', 'comply_with_reservations', 'slow_walk', 'reinterpret'].includes(r.respActual));
    const enlistments = Object.entries(state.forceEnlistments).filter(([, e]) => requested.some(c => c.id === e.enlCallId));
    expect(enlistments).toHaveLength(accepted.length);
    expect(new Set(enlistments.map(([block]) => block)).size).toBe(accepted.length);
    for (const [block, e] of enlistments) {
      const arm = requested.find(c => c.id === e.enlCallId)!.arm;
      expect(e.enlPost).toBe(POST('us_recruiting_service'));
      expect(e.enlRegiments).toBeNull();
      expect(e.enlEndsDay! - e.enlMusterDay).toBe(1095);
      expect(state.forceBlockStates[ids.toId('forceBlock', block)]).toMatchObject({ fbArm: arm, fbStrength: null });
      expect(state.forceAssignments[ids.toId('forceBlock', block)]).toBe(POST('us_recruiting_service'));
    }
  });

  it('preserves a stated nominal regiment quota when a numeric request uses a larger organization', () => {
    // Controlled arithmetic fixture, not a claim that these men historically enlisted on this date.
    const rules = world.map.world.rules.recruitment;
    expect(phase0.regimentsRaised(rules, 8, 'comply', rules.loyaltyFull, 16160)).toMatchObject({ regiments: 8, men: 16160 });
  });
});
