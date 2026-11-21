import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { mintMessageId } from '../src/messages/transit.ts';
import { isCallAnswer, pruneResponses, responseKey, type OrderResponse } from '../src/proxy/responses.ts';
import { fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';

function answer(order: string, day: number, kind = 'goal'): OrderResponse {
  return { respOrder: toId('message', order), respPerson: P('a_gen'), respPost: POST('a_army'), respRole: 'addressee',
    respKind: kind, respDay: day, respActual: 'comply', respDeclared: 'comply', respWillingness: 100,
    respTerms: [], respReasons: [], respStated: [], respConditions: [] };
}
function responses(rows: OrderResponse[]) {
  return Object.fromEntries(rows.map(r => [responseKey(r.respOrder, r.respPerson), r]));
}

it('S25 proxy-02: every recognized call answer is retained, including later calls to the same post', () => {
  const { state } = fresh();
  const a = answer('m.1.a.b.call.a_army', 1, 'call'), b = answer('m.2.a.b.call.a_army', 2, 'call');
  expect(isCallAnswer(a)).toBe(true);
  expect(isCallAnswer(b)).toBe(true);
  expect(pruneResponses({ ...state, orderResponses: responses([a, b]) }, 30, 5).state.orderResponses).toEqual(responses([a, b]));
});

it('S25 proxy-01/04, S40: shortened calls retain every answer regardless of day, key or insertion order', () => {
  const { state } = fresh();
  const mint = new Set<string>();
  const longPerson = toId('person', 'p'.repeat(100));
  const id = mintMessageId(mint, 1, P('a_lead'), longPerson, 'call.a_army');
  const second = mintMessageId(mint, 1, P('a_lead'), longPerson, 'call.a_army');
  const first = answer(id, 1, 'call'), tie = answer(second, 1, 'call');
  const later = answer(mintMessageId(mint, 2, P('a_lead'), longPerson, 'call.a_army'), 2, 'call');
  const unrelated = answer(mintMessageId(mint, 1, P('a_lead'), longPerson, 'goal.a_army'), 1);
  expect(id).toMatch(/^m\.1\.[a-f0-9]{16}$/);
  expect(isCallAnswer(first)).toBe(true);
  expect(isCallAnswer(tie)).toBe(true);
  expect(isCallAnswer(later)).toBe(true);
  expect(isCallAnswer(unrelated)).toBe(false);
  expect(isCallAnswer({ ...first, respRole: 'relay' })).toBe(false);
  expect(isCallAnswer({ ...first, respPost: null })).toBe(false);
  for (const rows of [[first, tie, later], [later, tie, first]]) {
    const next = pruneResponses({ ...state, orderResponses: responses([...rows, unrelated]) }, 30, 5);
    expect(next.pruned).toBe(1);
    expect(next.state.orderResponses).toEqual(responses(rows));
  }
});

it('S25 proxy-05: unreferenced responses survive the exact retention age and expire the next day', () => {
  const { state } = fresh();
  const row = answer('s25.goal.answer', 1);
  const held = { ...state, orderResponses: responses([row]) };
  expect(pruneResponses(held, 11, 10).pruned).toBe(0);
  expect(pruneResponses(held, 12, 10).pruned).toBe(1);
});
