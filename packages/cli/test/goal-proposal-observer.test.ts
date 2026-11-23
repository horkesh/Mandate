import { expect, it } from 'vitest';
import { canonicalHash, phase0 } from '@mandate/kernel';
import { indexedFixture } from '../../kernel/test/support/seats-fixture.ts';
import { goalTerms } from '../../kernel/test/support/test-seats.ts';
import { observePushback } from '../src/pushback-observer.ts';

it('observes one typed proposal against the original goal matter and shares the answer credit identity', () => {
  const world = indexedFixture();
  const initial = phase0.createState(world, { seed: 1 });
  const observer = observePushback();
  const tick = (state: unknown, day: number) => ({ state, day, events: [] }) as unknown as phase0.TickResult;
  const original = { id: 'original', msgOrigin: 'original', msgOrder: { orderIssuer: 'a_lead', orderGoal: phase0.goalOf(goalTerms('hold', 'a_mid')), orderCall: null }, msgVerb: null, msgReport: null };
  observer.onTick(world, tick({ ...initial, messagesInTransit: [original] }, 1));
  const proposal = { reportAuthor: 'a_gen', reportAuthorPost: 'a_army', reportDay: 2, reportAnswers: 'original', reportAdvice: null, reportClaims: [],
    reportProposal: { goal: phase0.goalOf(goalTerms('hold', 'a_cap')), reasons: [{ kind: 'safer_position', heldThreat: 10000, preferredThreat: 0 }] } };
  const message = { id: 'reply', msgOrigin: 'reply', msgOrder: null, msgVerb: null, msgReport: proposal, msgPending: [], msgTo: 'a_lead' };
  const state = { ...initial, messagesInTransit: [message] };
  const before = canonicalHash(state);
  observer.onTick(world, tick(state, 2));
  observer.onTick(world, tick(state, 3));
  const acts = observer.observations();
  expect(acts).toHaveLength(1);
  expect(acts[0]).toMatchObject({ order: 'original', side: 'a', actor: 'a_gen', role: 'addressee', kind: 'goal-proposal', actual: 'propose',
    objective: 'a_mid', posture: 'hold', creditKey: 'original|a_gen|addressee|' });
  expect(canonicalHash(state)).toBe(before);
});

it('does not invent an original order identity for an uncorrelated proposal', () => {
  const world = indexedFixture();
  const state = phase0.createState(world, { seed: 1 });
  const observer = observePushback();
  observer.onTick(world, { state: { ...state, messagesInTransit: [{ msgOrder: null, msgVerb: null, msgReport: { reportAuthor: 'a_gen', reportDay: 2, reportAnswers: null, reportClaims: [], reportProposal: { goal: phase0.goalOf(goalTerms('hold', null)), reasons: [] } }, msgPending: [], msgTo: 'a_lead' }] }, day: 2, events: [] } as unknown as phase0.TickResult);
  expect(observer.observations()).toEqual([]);
});
