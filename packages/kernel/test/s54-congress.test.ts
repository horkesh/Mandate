import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { fireSituation, recordDecision, surfaceSituation } from '../src/situations/situations.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';

const seat = seatIdFor(P('a_lead'));
const effect = (field: string) => ({ propose: { owner: 'politics', field, subject: 'spring_act', side: F('a'), delta: 1, reason: 'fixture' } });
const act: SituationDef = {
  id: toId('situation', 'spring'), kind: 'notice', faction: F('a'), title: 'spring.title', text: 'spring.text',
  earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'fixture', chain: null,
  subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null, delegableTo: [], resurfaceOn: [],
  effects: [effect('ledger-act')], report: { authors: [POST('a_office')], reportType: 'wire-dispatch', subtype: null },
  gate: { none: 'fixture' }, gateReview: null, citations: [],
};
const message: SituationDef = { ...act, id: toId('situation', 'message'), kind: 'decision', effects: [], report: null,
  staffLine: { authors: [POST('a_office')], recommends: ['account'], reasons: [], confidence: 700 },
  options: [{ id: 'account', label: 'message.option.account', displayKey: 1, proposedBy: [P('a_sec')],
    group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, honours: [], watched: false, policy: null,
    effects: [effect('ledger-answer')], lockedCosts: [], orders: [], calls: [], gate: null }],
  inaction: { text: 'wait', effects: [], policy: null }, historicalDefault: { options: ['account'] },
};
function fixture() {
  const base = indexedFixture(), map = base.map.world;
  const world = indexSeatsWorld(indexWorld({ ...map, rules: { ...map.rules, politics: { ...map.rules.politics,
    chambers: [{ id: 'house', faction: F('a'), name: 'house', cite: 'fixture' }],
    sessions: [{ id: 'regular', chambers: ['house'], callable: false, opens: '1900-06-01', closes: '1900-06-10', afterCallDays: null, sitsDays: null, cite: 'fixture' }],
  } } }), base.start, { situations: [act, message] });
  const opening = { ...createState(world, { seed: 1 }), stateDay: 3 };
  const known = deliverReport(opening, seat, { id: toId('message', 'spring.paper'), knownReceivedDay: 1, knownRoute: 'courier', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'),
      reportSubjectKind: 'situation', reportSubjectId: act.id, reportClaims: [], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null } }, NO_TRUTH);
  return { world, known };
}
it('identifies the own message as a principal account with its exact chosen text, without claiming legislative assent', () => {
  const { world, known } = fixture();
  const own = recordDecision(surfaceSituation(fireSituation(known, message.id, 2, 'decision', ['account']), message.id, 2, P('a_sec')), message.id, 3, ['account'], 'principal', null);
  const entry = viewFor(world, own, seat).congress!.ledger[0]!;
  expect(entry.answeredDay).toBe(3);
  expect(entry).toHaveProperty('account', { kind: 'principal-account', day: 3, situation: message.id, option: 'account', text: 'message.option.account', source: null });
  expect(entry).not.toHaveProperty('ratified');
  expect(Object.isFrozen(Reflect.get(entry, 'account'))).toBe(true);
});
it('does not infer an account from the hidden ledger, an unchosen option or another decider, even with a shared cache', () => {
  const { world, known } = fixture();
  const hidden = { ...known, congressLedger: [{ ledgerAct: 'spring_act', ledgerSide: F('a'), ledgerDay: 1, ledgerSituation: act.id, ledgerOption: null, ledgerMetDay: 1, ledgerAnsweredDay: 3 }] };
  for (const cache of [undefined, createViewCache()]) {
    expect(viewFor(world, hidden, seat, cache).congress).toEqual(viewFor(world, known, seat, cache).congress);
    expect(viewFor(world, hidden, seat, cache).congress!.ledger[0]).not.toHaveProperty('account');
  }
  const delegated = recordDecision(surfaceSituation(fireSituation(hidden, message.id, 2, 'decision', ['account']), message.id, 2, P('a_sec')), message.id, 3, ['account'], 'delegate', P('a_sec'));
  expect(viewFor(world, delegated, seat).congress!.ledger[0]!.answeredDay).toBeNull();
});

it('attaches a received account only after its dated notice arrives, with its own source and text', () => {
  const { world: base, known } = fixture();
  const notice = { ...act, id: toId('situation', 'account_notice'), text: 'account.notice.text', effects: [effect('ledger-answer')] };
  const world = indexSeatsWorld(base.map, base.start, { situations: [act, notice] });
  const paper = { id: toId('message', 'account.paper'), knownReceivedDay: 4, knownRoute: 'courier' as const, knownVia: [], knownBody: {
    reportType: 'wire-dispatch' as const, reportSubtype: null, reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'),
    reportSubjectKind: 'situation' as const, reportSubjectId: notice.id, reportClaims: [], reportDay: 2, reportHour: null, reportAdvice: null, reportAnswers: null,
  } };
  const held = deliverReport(known, seat, paper, NO_TRUTH), cache = createViewCache();
  expect(viewFor(world, held, seat, cache).congress!.ledger[0]).not.toHaveProperty('account');
  expect(viewFor(world, { ...held, stateDay: 4 }, seat, cache).congress!.ledger[0]).toHaveProperty('account', {
    kind: 'received-account', day: 2, situation: notice.id, option: null, text: notice.text, source: paper.id,
  });
});
