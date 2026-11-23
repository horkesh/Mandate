import { describe, expect, it } from 'vitest';
import { callTerms, recruitmentRuleProblems } from '../src/recruitment/rules.ts';
import { arriveCall, issueCall } from '../src/tick/recruitment.ts';
import { relayOrder } from '../src/tick/orders.ts';
import { entryProblems } from '../src/log/log.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexedFixture, P, POST } from './support/seats-fixture.ts';
import { ctxFor as makeContext } from './support/tick-context.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
const ctxFor: typeof makeContext = (world, state, day) => makeContext(world, state, day, [...TICK_MECHANICS, ...MAP_MECHANICS]);

const profile = (id: string, honours: string[], offends: string[]) => ({
  id, sourceProfile: 'fixture', honours, offends, callProvenance: [{ source: 'fixture', page: 12 }],
  conditions: [{ kind: 'appointments' as const, clauseText: 'Officers retained.' }],
  materialDemand: [{ resource: 'arms' as const, obligation: 'required' as const, provider: 'unspecified' as const, quantity: null, demandText: 'Armed units requested.' }],
  rationale: 'Fixture terms, independent of the answer.', limits: 'No inventory evidence.',
});

function fixture() {
  const base = indexedFixture();
  const rules = { ...base.map.world.rules.recruitment,
    raisingPostKinds: [base.start.posts.find(p => p.id === POST('a_army'))!.kind],
    callProfiles: [profile('retained', ['caution'], []), profile('displaced', [], ['caution']), profile('empty', [], [])],
  };
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, rules: { ...base.map.world.rules, recruitment: rules,
    ruleSeats: { ...base.map.world.rules.ruleSeats, principals: base.map.world.rules.ruleSeats.principals.map(p => ({ ...p, calls: p.faction === 'a' ? [{ id: 'retained_call', termsId: 'retained', post: POST('a_army'), regiments: 1, termDays: 30, fromDate: '1900-06-02', source: 'fixture page 12' }] : [] })) },
  } }), base.start);
  return { world, state: createState(world, { seed: 17 }), rules };
}

describe('per-call terms travel with the paper', () => {
  it('pairs the same governor and draw under calls with different values', () => {
    const { world, state } = fixture();
    const answer = (termsId: string) => {
      const ctx = ctxFor(world, state, 1);
      expect(issueCall(ctx, state, seatIdFor(P('a_lead')), { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier', bypass: true, termsId })).toBeNull();
      const message = ctx.outbox[0]!;
      const next = arriveCall(ctx, state, message);
      return { message, response: Object.values(next.orderResponses)[0]! };
    };
    const retained = answer('retained'), displaced = answer('displaced');
    expect(retained.response.respWillingness).toBeGreaterThan(displaced.response.respWillingness);
    expect(retained.response.respActual).not.toBe(displaced.response.respActual);
    expect(retained.message.msgOrder!.orderCall!.callProfile).toEqual(profile('retained', ['caution'], []));
    expect(retained.response.respTerms.find(t => t.respTermName === 'capacity')!.respTermAmount).toBe(0);
  });

  it('keeps an explicitly empty profile empty, while unprofiled calls use the fallback', () => {
    const { rules } = fixture();
    expect(callTerms(rules, profile('empty', [], []))).toMatchObject({ honours: [], offends: [], required: 0 });
    expect(callTerms(rules)).toMatchObject({ ...rules.callTerms, required: 0 });
  });

  it('records structural conditions and material demand without scoring either', () => {
    const { rules } = fixture();
    const plain = profile('same', ['caution'], []);
    const changed = { ...plain, conditions: [{ kind: 'destination' as const, clauseText: 'A different camp.' }], materialDemand: [] };
    expect(callTerms(rules, changed)).toEqual(callTerms(rules, plain));
  });

  it('makes a relay read the attached values and forwards the complete paper unchanged', () => {
    const { world, state } = fixture();
    const route = (termsId: string) => {
      const sent = ctxFor(world, state, 1);
      expect(issueCall(sent, state, seatIdFor(P('a_lead')), { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier', bypass: false, termsId })).toBeNull();
      const msg = sent.outbox[0]!;
      expect(msg.msgRole).toBe('relay');
      const ctx = ctxFor(world, state, msg.msgArriveDay);
      const next = relayOrder(ctx, state, msg);
      return { ctx, msg, response: Object.values(next.orderResponses)[0]! };
    };
    const kept = route('retained'), displaced = route('displaced');
    expect(kept.response.respWillingness).toBeGreaterThan(displaced.response.respWillingness);
    expect(kept.ctx.outbox.find(m => m.msgOrder !== null)!.msgOrder).toEqual(kept.msg.msgOrder);
  });

  it('accepts profile selection in a persisted command and rejects an invalid selector shape', () => {
    const entry = { day: 1, seat: seatIdFor(P('a_lead')), command: { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier', bypass: true, termsId: 'retained' } };
    expect(entryProblems(entry, 0)).toEqual([]);
    expect(entryProblems({ ...entry, command: { ...entry.command, termsId: 12 } }, 0)).not.toEqual([]);
  });

  it('rejects unknown explicit profiles instead of silently substituting fallback terms', () => {
    const { world, state } = fixture(), ctx = ctxFor(world, state, 1);
    expect(issueCall(ctx, state, seatIdFor(P('a_lead')), { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier', bypass: true, termsId: 'missing' })).toBe('bad_call');
    expect(ctx.outbox).toHaveLength(0);
  });

  it('keeps a dated call on its registered terms when a caller omits or contradicts the selector', () => {
    const { world, state } = fixture();
    const command = { cmd: 'call' as const, to: POST('a_army'), regiments: 1, termDays: 30, route: 'courier' as const, bypass: true, callId: 'retained_call' };
    const ctx = ctxFor(world, state, 1);
    expect(issueCall(ctx, state, seatIdFor(P('a_lead')), command)).toBeNull();
    expect(ctx.outbox[0]!.msgOrder!.orderCall!.callProfile?.id).toBe('retained');
    const wrong = ctxFor(world, state, 1);
    expect(issueCall(wrong, state, seatIdFor(P('a_lead')), { ...command, termsId: 'displaced' })).toBe('bad_call');
    expect(wrong.outbox).toHaveLength(0);
  });

  it('rejects duplicate profiles and invalid callProvenance', () => {
    const { rules } = fixture();
    expect(recruitmentRuleProblems({ ...rules, callProfiles: [profile('same', [], []), profile('same', [], [])] })).not.toEqual([]);
    expect(recruitmentRuleProblems({ ...rules, callProfiles: [{ ...profile('bad', [], []), callProvenance: [] }] })).not.toEqual([]);
  });
});
