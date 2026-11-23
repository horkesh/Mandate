import { describe, expect, it } from 'vitest';
import { toId, type PersonId } from '../src/ids.ts';
import { knowledgeOf, paperReadiness } from '../src/knowledge/knowledge.ts';
import type { ReportBody, ReportClaim } from '../src/knowledge/report.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { OrderCommand, SeatCommand } from '../src/log/commands.ts';
import { playDays, replay, type SeatTable } from '../src/log/session.ts';
import type { TransitMessage } from '../src/messages/transit.ts';
import { sendMessages } from '../src/messages/transit.ts';
import type { State } from '../src/root-state.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { decodeSave, encodeSave, makeSave } from '../src/serialize/save.ts';
import { createState } from '../src/tick/setup.ts';
import { goalOf } from '../src/tick/orders.ts';
import { tick } from '../src/tick/tick.ts';
import { conditionalDoctrineProblems } from '../src/world/doctrine.ts';
import { indexWorld } from '../src/world/index.ts';
import type { DoctrineOffensive, PaperSelector, PrincipalDoctrine } from '../src/world/world.ts';
import { report } from './support/s25-fixture.ts';
import { F, fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';
import { goalTerms, scriptedSeats } from './support/test-seats.ts';

const principal = P('a_lead');
const lead = seatIdFor(principal);
const reserve = POST('a_reserve');
const holder = P('a_bold');
const first = { namespace: 'a_letters', key: 'first', revision: 1 };
const next = { ...first, key: 'followup' };
const named = { kind: 'letter', issuer: principal, letter: first, post: reserve, role: 'addressee' } as const;
const reportSelector = { kind: 'report', author: P('a_gen'), authorPost: POST('a_army'), subjectKind: 'region', subjectId: R('b_mid'), reportType: 'enemy-estimate', reportSubtype: null } as const;
const alarm = { kind: 'enemy-strength', region: R('b_mid'), token: null, min: 50 } as const;
const works = { kind: 'works', region: R('b_mid'), token: null, min: 100 } as const;
const condition = { ...reportSelector, claims: [alarm] } satisfies PaperSelector;
const message = (id: string) => toId('message', id);
const district = toId('department', 'a_war');

const offensive = (letter = next, more: Partial<DoctrineOffensive> = {}): DoctrineOffensive => ({
  letter, post: reserve, objective: R('a_mid'), posture: 'hold', fromDate: '1900-06-02', source: 'Fictional correspondence', ...more,
});

function doctrine(rows: readonly DoctrineOffensive[], more: Partial<PrincipalDoctrine> = {}): PrincipalDoctrine {
  return { faction: F('a'), letterNamespace: first.namespace, maxPaperSelectors: 3, crossNeutral: false,
    concentrateAt: null, concentrateSource: null, calls: [], offensives: rows, inquireEveryDays: 7,
    appointKinds: { land: [], naval: [] }, ...more };
}

function fixture(row: PrincipalDoctrine) {
  const map = fixtureMap(), world = map.world;
  const reportTemplates = world.rules.reportTemplates.map(t => t.templateType === 'enemy-estimate' ? { ...t, maxAgeDays: 2, keepSupersededDays: 1 } : t);
  const start = fixtureStart();
  const recruitment = row.calls.length === 0 ? world.rules.recruitment : {
    ...world.rules.recruitment, raisingPostKinds: [start.posts.find(p => p.id === reserve)!.kind],
  };
  return indexSeatsWorld(indexWorld({ ...world, rules: { ...world.rules, reportTemplates, recruitment, ruleSeats: { ...world.rules.ruleSeats, principals: [row] } } }), start);
}

type RunWorld = ReturnType<typeof fixture>;
const command = (w: RunWorld, letter = next): OrderCommand => ({ cmd: 'order', to: reserve, letter, route: 'special-messenger', bypass: true,
  goal: goalTerms('hold', 'a_mid', w.map.world.rules.plans.goalDefaults) });
const entry = (day: number, cmd: SeatCommand) => ({ day, seat: lead, command: cmd });
const advance = (world: RunWorld, state: State, days: number) => replay(world, state, [], days).state;
const menu = (world: RunWorld, state: State) => principalMenu(world, state, F('a'), morningGround(world, state, state.stateDay + 1)).doctrine;
const decisions = (world: RunWorld, state: State) => menu(world, state).paperReadiness?.find(r => r.action === 'a_letters.followup.1')?.results;
const receipts = (state: State, person = principal) => knowledgeOf(state, seatIdFor(person)).knownPaperReceipts ?? [];

const claim = (selector: typeof alarm | typeof works, value: number): ReportClaim => ({ claimKind: selector.kind,
  claimRegion: selector.region, claimToken: selector.token, claimValue: value, claimConfidence: 900 });

function dispatch(id: string, arrival: number, claims: readonly ReportClaim[], more: Partial<ReportBody> = {}, recipient: PersonId = principal): TransitMessage {
  const body = report(id, { reportAuthor: reportSelector.author, reportAuthorPost: reportSelector.authorPost, reportSubjectKind: reportSelector.subjectKind,
    reportSubjectId: reportSelector.subjectId, reportType: reportSelector.reportType, reportDay: arrival, reportClaims: claims, ...more }).knownBody;
  return { id: message(id), msgOrigin: message(id), msgFrom: body.reportAuthor, msgTo: recipient, msgToPost: null, msgRole: 'addressee',
    msgRoute: 'courier', msgSentDay: body.reportDay, msgArriveDay: arrival, msgVia: [], msgPending: [], msgOrder: null, msgVerb: null,
    msgReport: body, msgTruth: NO_TRUTH };
}

describe('S112 receipt-gated doctrine in the fictional testbed', () => {
  it('A1 exact named evidence follows delivery, with the same world and before or after a delayed hop', () => {
    const world = fixture(doctrine([offensive(first)]));
    const start = createState(world, { seed: 11 });
    const send = tick(world, start, [entry(1, { ...command(world, first), route: 'courier' })]).state;
    const letter = send.messagesInTransit.find(m => m.msgOrder?.orderLetter !== undefined)!;
    expect(letter).toBeDefined();
    const evaluate = (state: State) => paperReadiness([named], knowledgeOf(state, seatIdFor(holder)), state.stateDay, world.rules.templates)[0];
    const scheduled = (day: number) => ({ ...send, messagesInTransit: send.messagesInTransit.map(m => m.id === letter.id ? { ...m, msgArriveDay: day } : m) });
    expect(evaluate(advance(world, scheduled(3), 2))).toMatchObject({ status: 'missing', reason: 'no_receipt' });
    expect(evaluate(advance(world, scheduled(3), 3))).toMatchObject({ status: 'received', origin: letter.msgOrigin, receivedDay: 3 });
    expect(evaluate(advance(world, scheduled(4), 3))).toMatchObject({ status: 'missing', reason: 'no_receipt' });
    expect(evaluate(advance(world, scheduled(4), 4))).toMatchObject({ status: 'received', origin: letter.msgOrigin, receivedDay: 4 });
  });

  it('A1 the principal cannot dispatch from a same-day arrival, but the next morning menu can', () => {
    const world = fixture(doctrine([offensive(next, { requiresPapers: [condition] })]));
    const start = sendMessages(createState(world, { seed: 11 }), [dispatch('m.alarm', 1, [claim(alarm, 50)])]);
    expect(menu(world, start).offensives[0]?.ready).toBe(false);
    const arrived = tick(world, start, [entry(1, command(world))]);
    expect(arrived.rejections).toHaveLength(1);
    expect(menu(world, arrived.state).offensives[0]?.ready).toBe(true);
    expect(decisions(world, arrived.state)).toEqual([expect.objectContaining({ status: 'received', origin: 'm.alarm', receivedDay: 1 })]);
    expect(tick(world, arrived.state, [entry(2, command(world))]).rejections).toEqual([]);
  });

  it('A2 matches every named identity address field and makes repeated delivery idempotent', () => {
    const world = fixture(doctrine([offensive(first)]));
    const start = createState(world, { seed: 11 });
    const posted = tick(world, start, [entry(1, { ...command(world, first), route: 'courier' })]).state;
    const letter = posted.messagesInTransit.find(m => m.msgOrder?.orderLetter !== undefined)!;
    const arrival = letter.msgArriveDay;
    const nextCopy = { ...letter, id: message('m.copy') };
    const done = advance(world, sendMessages(posted, [nextCopy]), arrival);
    const evaluate = (selector: PaperSelector, person: PersonId) => paperReadiness([selector], knowledgeOf(done, seatIdFor(person)), arrival, world.rules.templates)[0];
    expect(receipts(done, holder).filter(r => r.receiptOrigin === letter.msgOrigin)).toHaveLength(1);
    expect(evaluate(named, holder)).toMatchObject({ status: 'received' });
    for (const mismatch of [
      { ...named, letter: { ...first, revision: 2 } }, { ...named, issuer: P('b_lead') },
      { ...named, post: POST('a_army') }, { ...named, role: 'relay' as const },
    ]) expect(evaluate(mismatch, holder)).toMatchObject({ status: 'missing' });
    expect(evaluate(named, principal)).toMatchObject({ status: 'missing' });
  });

  it('A2 matches report author, subject, owning seat and exact own dispatch origin', () => {
    const answer = { kind: 'report', author: holder, authorPost: reserve, subjectKind: 'post', subjectId: reserve,
      reportType: 'wire-dispatch', reportSubtype: null, answers: first } satisfies PaperSelector;
    const world = fixture(doctrine([offensive(first), offensive(next, { requiresPapers: [answer] })]));
    const start = createState(world, { seed: 11 });
    const spec = { reportAuthor: holder, reportAuthorPost: reserve, reportSubjectKind: 'post', reportSubjectId: reserve,
      reportType: 'wire-dispatch', reportAnswers: message('m.other.dispatch') } as const;
    const wrong = [dispatch('m.wrong-origin', 1, [], spec), dispatch('m.wrong-author', 1, [], { ...spec, reportAuthor: P('a_gen') }),
      dispatch('m.wrong-subject', 1, [], { ...spec, reportSubjectId: POST('a_army') }), dispatch('m.wrong-seat', 1, [], spec, P('a_gen'))];
    const unknown = advance(world, sendMessages(start, wrong), 1);
    expect(decisions(world, unknown)).toMatchObject([{ status: 'missing', reason: 'no_dispatch' }]);
    const sent = tick(world, unknown, [entry(2, command(world, first))]).state;
    const actual = knowledgeOf(sent, lead).knownDoctrineDispatches![0]!.dispatchOrigin;
    const pending = sendMessages(sent, [dispatch('m.actual.answer', 3, [], { ...spec, reportAnswers: actual })]);
    expect(decisions(world, pending)).toMatchObject([{ status: 'missing', reason: 'no_receipt' }]);
    expect(decisions(world, advance(world, pending, 3))).toMatchObject([{ status: 'received', origin: 'm.actual.answer' }]);
  });

  it('A2 the report witness sees only the enclosure that passed the wire filter', () => {
    const loss = { kind: 'own-losses', region: R('b_mid'), token: null, min: 1 } as const;
    const witness = { ...reportSelector, reportType: 'wire-dispatch', claims: [loss] } satisfies PaperSelector;
    const world = fixture(doctrine([offensive(next, { requiresPapers: [witness] })]));
    const start = createState(world, { seed: 11 });
    const original = dispatch('m.filtered', 1, [{ claimKind: loss.kind, claimRegion: loss.region, claimToken: loss.token,
      claimValue: 100, claimConfidence: 1000 }], { reportType: 'wire-dispatch' });
    const throughFilter: TransitMessage = { ...original, msgTo: P('a_clerk'), msgToPost: POST('a_filter'), msgRole: 'filter', msgRoute: 'wire',
      msgPending: [{ hopPerson: principal, hopPost: null, hopRole: 'addressee' }] };
    const arrived = advance(world, sendMessages(start, [throughFilter]), 4);
    expect(knowledgeOf(arrived, lead).knownReports.find(r => r.id === original.id)?.knownBody.reportClaims).toEqual([]);
    expect(decisions(world, arrived)).toMatchObject([{ status: 'missing', reason: 'missing_claim', origin: original.id }]);
  });

  it('A3 requires one whole paper for its claims and every selector, even for a false report', () => {
    const other = { ...reportSelector, subjectId: R('b_cap') };
    const world = fixture(doctrine([offensive(next, { requiresPapers: [{ ...condition, claims: [alarm, works] }, other] })]));
    const start = createState(world, { seed: 10 });
    const split = advance(world, sendMessages(start, [dispatch('m.strength', 1, [claim(alarm, 600)]), dispatch('m.works', 1, [claim(works, 100)])]), 1);
    expect(decisions(world, split)).toMatchObject([{ status: 'missing', reason: 'missing_claim' }, { status: 'missing', reason: 'no_receipt' }]);
    const combined = advance(world, sendMessages(split, [dispatch('m.combined', 2, [claim(alarm, 600), claim(works, 100)])]), 2);
    expect(menu(world, combined).offensives[0]?.ready).toBe(false);
    const both = advance(world, sendMessages(combined, [dispatch('m.other', 3, [], { reportSubjectId: other.subjectId })]), 3);
    expect(menu(world, both).offensives[0]?.ready).toBe(true);
    expect(decisions(world, both)).toMatchObject([{ status: 'received', origin: 'm.combined' }, { status: 'received', origin: 'm.other' }]);
    expect(both.forceLocations).toEqual(start.forceLocations);
    expect(both.regionControl).toEqual(start.regionControl);
  });

  it('A4 keeps named receipt identity, honors the latest resource correction and prunes released claim witnesses', () => {
    const world = fixture(doctrine([offensive(first), offensive(next, { requiresPapers: [condition] })]));
    const start = createState(world, { seed: 11 });
    const posted = tick(world, start, [entry(1, command(world, first))]).state;
    const earlier = advance(world, sendMessages(posted, [dispatch('m.old', 2, [claim(alarm, 50)])]), 2);
    expect(menu(world, earlier).offensives[0]?.issued).toBe(true);
    expect(decisions(world, earlier)).toMatchObject([{ status: 'received' }]);
    const correction = advance(world, sendMessages(earlier, [dispatch('m.correction', 3, [claim(alarm, 1)]), dispatch('m.late.old', 3, [claim(alarm, 500)], { reportDay: 2 })]), 3);
    expect(decisions(world, correction)).toMatchObject([{ status: 'missing', reason: 'claim_bound', origin: 'm.correction' }]);
    const stale = advance(world, correction, 6);
    expect(decisions(world, stale)).toMatchObject([{ status: 'missing', reason: 'stale', origin: 'm.correction' }]);
    expect(receipts(stale, holder).some(r => 'receiptLetter' in r && r.receiptLetter?.key === first.key)).toBe(true);
    const refreshed = advance(world, sendMessages(stale, [dispatch('m.fresh', 7, [claim(alarm, 60)])]), 7);
    const issued = tick(world, refreshed, [entry(8, command(world))]);
    expect(issued.rejections).toEqual([]);
    expect(receipts(issued.state)).toEqual([]);
    expect(receipts(issued.state, holder).length).toBeGreaterThan(0);
  });

  it('A5 silence cannot prove an evacuation and an identified concentration uses its own paper gate', () => {
    const evacuation = { ...reportSelector, reportType: 'wire-dispatch', claims: [{ kind: 'fort-surrendered', region: R('b_mid'), token: 'evacuated_under_terms', min: 1 }] } satisfies PaperSelector;
    const world = fixture(doctrine([offensive(next, { requiresPapers: [evacuation] })], { concentrations: [{ id: 'gather', post: reserve,
      fromDate: '1900-06-02', requiresDepartment: district, fromPosts: [POST('a_army')], source: 'Fictional concentration plan', requiresPapers: [condition] }] }));
    const start = createState(world, { seed: 11 });
    const waiting = advance(world, start, 2);
    expect(menu(world, waiting).concentrateAt).toBeNull();
    expect(menu(world, waiting).offensives[0]?.ready).toBe(false);
    const informed = advance(world, sendMessages(waiting, [dispatch('m.concentration', 3, [claim(alarm, 70)])]), 3);
    expect(menu(world, informed).concentrateAt).toBe(reserve);
    expect(menu(world, informed).offensives[0]?.ready).toBe(false);
  });

  it('A5 an identified call needs its own received paper before sending', () => {
    const world = fixture(doctrine([], { calls: [{ id: 'demand', post: reserve, regiments: 1, termDays: 90, fromDate: '1900-06-02',
      source: 'Fictional requisition', requiresPapers: [condition] }] }));
    const call = { cmd: 'call', callId: 'demand', to: reserve, regiments: 1, termDays: 90, route: 'special-messenger', bypass: true } as const;
    const start = sendMessages(createState(world, { seed: 11 }), [dispatch('m.requisition.report', 1, [claim(alarm, 90)])]);
    expect(menu(world, start).calls[0]?.ready).toBe(false);
    const morning = tick(world, start, [entry(1, call)]);
    expect(morning.rejections).toHaveLength(1);
    expect(menu(world, morning.state).calls[0]?.ready).toBe(true);
    expect(tick(world, morning.state, [entry(2, call)]).rejections).toEqual([]);
  });

  it('A5 a proposal answer waits for both the proposal and its independently specified received paper', () => {
    const { letter: _, ...legacy } = offensive();
    const world = fixture(doctrine([{ ...legacy, id: 'original_goal' }], { proposalAnswers: [{ id: 'answer', post: reserve, action: 'accept',
      answers: 'original_goal', fromDate: '1900-06-02', source: 'Fictional reply', requiresPapers: [condition] }] }));
    const { letter: _commandLetter, ...own } = command(world);
    const sent = tick(world, createState(world, { seed: 11 }), [entry(1, { ...own, doctrine: 'original_goal' })]).state;
    const origin = knowledgeOf(sent, lead).knownSentOrders![0]!.sentMessage;
    const reply = dispatch('m.own.proposal', 2, [], { reportAuthor: holder, reportAuthorPost: reserve, reportSubjectKind: 'post',
      reportSubjectId: reserve, reportType: 'wire-dispatch', reportAnswers: origin,
      reportProposal: { goal: goalOf(own.goal), reasons: [] } });
    const received = advance(world, sendMessages(sent, [reply]), 2);
    expect(menu(world, received).proposalAnswers).toEqual([]);
    const answer = { cmd: 'answer_proposal', to: reserve, proposal: reply.id, action: 'accept', doctrine: 'answer', route: 'special-messenger', bypass: true } as const;
    expect(tick(world, received, [entry(3, answer)]).rejections).toHaveLength(1);
    const open = advance(world, sendMessages(received, [dispatch('m.additional.reply.paper', 3, [claim(alarm, 70)])]), 3);
    expect(menu(world, open).proposalAnswers?.[0]?.paper).toBe(reply.id);
    expect(tick(world, open, [entry(4, answer)]).rejections).toEqual([]);
  });

  it('A6 saves, resumes and replays the same delivered witnesses, explanations and daily hashes', () => {
    const answer = { kind: 'report', author: holder, authorPost: reserve, subjectKind: 'post', subjectId: reserve,
      reportType: 'wire-dispatch', reportSubtype: null, answers: first, claims: [{ kind: 'order-obeyed', region: R('a_mid'), token: 'new', min: 1 }] } satisfies PaperSelector;
    const world = fixture(doctrine([offensive(first), offensive(next, { requiresPapers: [answer] })]));
    const start = createState(world, { seed: 11 });
    const scripted = scriptedSeats();
    const seats: SeatTable = seat => ({ driver: 'rules', respond: request => {
      if (seat !== lead || request.menu.menuKind !== 'principal') return scripted(seat).respond(request);
      const ready = request.menu.doctrine.offensives.find(o => o.ready && !o.issued);
      return { answerKind: 'commands', commands: ready?.letter === undefined ? [] : [command(world, ready.letter)] };
    } });
    const seen: unknown[] = [];
    const capture = (rows: unknown[]) => ({ onDay: ({ state }: { state: State }) => rows.push([receipts(state), decisions(world, state)]) });
    const played = playDays(world, start, seats, 8, capture(seen));
    expect(played.log.filter(e => e.command.cmd === 'order')).toHaveLength(2);
    const replaySeen: unknown[] = [];
    const replayed = replay(world, start, played.log, 8, capture(replaySeen));
    expect(replayed.hashes).toEqual(played.hashes);
    expect(replaySeen).toEqual(seen);
    const checkpoint = seen.findIndex(row => (row as [unknown[], unknown])[0].length > 0) + 1;
    expect(checkpoint).toBeGreaterThan(0);
    const midway = playDays(world, start, seats, checkpoint);
    const saved = decodeSave(encodeSave({ worldHash: '0'.repeat(64), state: midway.state, log: midway.log }));
    const resumed = playDays(world, saved.state as unknown as State, seats, 8 - checkpoint);
    expect(resumed.hashes).toEqual(played.hashes.slice(checkpoint));
    expect(resumed.state).toEqual(played.state);
  });

  it('validates opt-in identity, a pack bound, and an integer claim interval', () => {
    const problems = (row: PrincipalDoctrine) => conditionalDoctrineProblems(row, () => true);
    const licensed = offensive(next, { requiresPapers: [condition] });
    expect(problems(doctrine([licensed]))).toEqual([]);
    expect(problems(doctrine([{ ...licensed, letter: undefined }]))).toContainEqual(expect.objectContaining({ message: expect.stringMatching(/identif/i) }));
    expect(problems(doctrine([licensed], { maxPaperSelectors: undefined }))).toContainEqual(expect.objectContaining({ message: expect.stringMatching(/limit/i) }));
    expect(problems(doctrine([{ ...licensed, requiresPapers: [{ ...condition, claims: [{ ...alarm, min: 60, max: 50 }] }] }]))).toContainEqual(expect.objectContaining({ message: expect.stringMatching(/bound/i) }));
  });

  it('migrates a schema 1 save with empty receipt and dispatch histories and the same State hash', () => {
    const world = fixture(doctrine([offensive(next, { requiresPapers: [condition] })]));
    const start = createState(world, { seed: 11 });
    const old = { ...makeSave({ worldHash: '0'.repeat(64), state: start }), schemaVersion: 1 };
    const migrated = decodeSave(JSON.stringify(old));
    const state = migrated.state as unknown as State;
    expect(migrated.stateHash).toBe(old.stateHash);
    expect(receipts(state)).toEqual([]);
    expect(knowledgeOf(state, lead).knownDoctrineDispatches ?? []).toEqual([]);
    expect(menu(world, state).offensives[0]?.ready).toBe(false);
  });
});
