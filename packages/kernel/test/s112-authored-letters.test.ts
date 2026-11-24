import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { OrderCommand, SeatCommand } from '../src/log/commands.ts';
import { playDays, replay } from '../src/log/session.ts';
import { responseKey } from '../src/proxy/responses.ts';
import type { State } from '../src/root-state.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { TICK_MECHANICS, tick } from '../src/tick/tick.ts';
import { createState } from '../src/tick/setup.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { conditionalDoctrineProblems } from '../src/world/doctrine.ts';
import { indexWorld } from '../src/world/index.ts';
import type { DoctrineOffensive, LetterIdentity, PrincipalDoctrine } from '../src/world/world.ts';
import { F, fixtureMap, fixtureStart, P, POST, R, type FixtureOver } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { scriptedSeats } from './support/test-seats.ts';
import { report } from './support/s25-fixture.ts';

const lead = seatIdFor(P('a_lead'));
const post = POST('a_reserve');
const date = '1900-06-02';
const letter = (key: string, revision = 1): LetterIdentity => ({ namespace: 'a_dispatches', key, revision });
const first = letter('first');
const second = letter('second');

function offensive(identity: LetterIdentity, more: Partial<Extract<DoctrineOffensive, { objective: unknown }>> = {}): DoctrineOffensive {
  return { letter: identity, post, objective: R('a_mid'), posture: 'hold', fromDate: date, source: 'Fictional dispatch book', ...more };
}

function doctrine(offensives: readonly DoctrineOffensive[]): PrincipalDoctrine {
  return { faction: F('a'), letterNamespace: 'a_dispatches', crossNeutral: false, concentrateAt: null, concentrateSource: null,
    calls: [], offensives, inquireEveryDays: 7, appointKinds: { land: [], naval: [] } };
}

function fixture(offensives: readonly DoctrineOffensive[], people: FixtureOver['persons'] = {}, review = false) {
  const map = fixtureMap({ persons: people });
  const world = map.world;
  const plans = review ? { ...world.rules.plans, goalDefaults: { ...world.rules.plans.goalDefaults, approveAsDrafted: false } } : world.rules.plans;
  return indexSeatsWorld(indexWorld({ ...world, rules: { ...world.rules, plans, ruleSeats: { ...world.rules.ruleSeats, principals: [doctrine(offensives)] } } }), fixtureStart());
}

function command(world: ReturnType<typeof fixture>, row: DoctrineOffensive, changes: Partial<OrderCommand> = {}): OrderCommand {
  const { goalDefaults } = world.map.world.rules.plans;
  const { risk, deadlineDays, rail, river, sea, neutral, awaitWord, approveAsDrafted } = goalDefaults;
  return { cmd: 'order', to: row.post, route: 'courier', bypass: true, letter: row.letter!,
    goal: { objective: row.objective!, posture: row.posture ?? 'take', risk, deadlineDays, rail, river, sea, neutral, awaitWord, approveAsDrafted, committed: [] }, ...changes };
}

function menu(world: ReturnType<typeof fixture>, state: State) {
  return principalMenu(world, state, F('a'), morningGround(world, state, state.stateDay + 1));
}

const worldHash = '0'.repeat(64);
const sent = (state: State) => knowledgeOf(state, lead).knownDoctrineDispatches ?? [];
const authored = (state: State) => state.messagesInTransit.filter(m => m.msgOrder?.orderLetter !== undefined);
const entry = (day: number, order: SeatCommand) => ({ day, seat: lead, command: order });

describe('S112 authored correspondence', () => {
  it('B1 keeps same-day, same-post identical letters separate after a manual order', () => {
    const a = offensive(first);
    const b = offensive(second);
    const world = fixture([b, a]);
    const start = createState(world, { seed: 11 });
    const { letter: _, ...manual } = command(world, a);
    const afterManual = tick(world, start, [entry(1, manual)]).state;
    expect(menu(world, afterManual).doctrine.offensives.map(o => [o.letter?.key, o.issued])).toEqual([['first', false], ['second', false]]);
    const afterFirst = tick(world, afterManual, [entry(2, command(world, a))]).state;
    const duplicate = tick(world, afterFirst, [entry(3, command(world, a)), entry(3, command(world, b))]);
    expect(duplicate.rejections).toHaveLength(1);
    expect(sent(duplicate.state).map(d => d.dispatchLetter)).toEqual([first, second]);
    expect(new Set(sent(duplicate.state).map(d => d.dispatchOrigin)).size).toBe(2);
  });

  it('B2 retains prior dispatch identities after the ordinary goal copy compacts and the save resumes', () => {
    const a = offensive(first);
    const b = offensive(second, { objective: R('a_cap') });
    const world = fixture([a, b]);
    const start = createState(world, { seed: 11 });
    const aSent = tick(world, start, [entry(1, command(world, a))]).state;
    const bSent = tick(world, aSent, [entry(2, command(world, b))]).state;
    expect(knowledgeOf(bSent, lead).knownSentOrders?.filter(s => s.sentKind === 'goal')).toHaveLength(1);
    const saved = decodeSave(encodeSave({ worldHash, state: bSent })).state as unknown as State;
    const resumed = tick(world, saved, [entry(3, command(world, a))]);
    expect(resumed.rejections).toHaveLength(1);
    expect(sent(resumed.state)).toEqual(sent(bSent));
    expect(menu(world, resumed.state).doctrine.offensives.every(o => o.issued)).toBe(true);
  });

  it('B3 rejects duplicate identity, missing namespace, invalid supersession and cyclic dependencies', () => {
    const revision = letter('first', 2);
    const problems = (row: PrincipalDoctrine) => conditionalDoctrineProblems(row, () => true).map(p => p.message).join('\n');
    expect(problems(doctrine([offensive(first), offensive(first)]))).toMatch(/duplicate.*letter/i);
    expect(problems({ ...doctrine([offensive(first)]), letterNamespace: undefined })).toMatch(/namespace/i);
    expect(problems(doctrine([offensive(revision, { supersedes: second })]))).toMatch(/supersed/i);
    expect(problems(doctrine([offensive(first, { dependsOn: [second] }), offensive(second, { dependsOn: [first] })]))).toMatch(/cycl/i);
    expect(problems(doctrine([offensive(first), offensive(revision, { supersedes: first })]))).toBe('');
  });

  it('B4 retains the actual answer to a late older revision without replacing the newer plan', () => {
    const a = offensive(first);
    const b = offensive(letter(first.key, 2), { supersedes: first, objective: R('a_cap') });
    const world = fixture([a, b]);
    const start = createState(world, { seed: 11 });
    const aSent = tick(world, start, [entry(1, command(world, a, { route: 'courier' }))]).state;
    const older = authored(aSent)[0]!;
    expect(older).toBeDefined();
    const slow = { ...aSent, messagesInTransit: aSent.messagesInTransit.map(m => m.id === older.id ? { ...m, msgArriveDay: 5 } : m) };
    const bSent = tick(world, slow, [entry(2, command(world, b, { route: 'special-messenger' }))]).state;
    const newer = sent(bSent).find(d => d.dispatchLetter.revision === 2)!.dispatchOrigin;
    expect(bSent.planRecords[post]?.planOrder).toBe(newer);
    const later = deliverDue(ctxFor(world, bSent, 5, TICK_MECHANICS), bSent);
    expect(later.planRecords[post]?.planOrder).toBe(newer);
    expect(later.orderResponses[responseKey(older.msgOrigin, P('a_bold'))]?.respOrder).toBe(older.msgOrigin);
    expect(knowledgeOf(later, seatIdFor(P('a_bold'))).knownPaperReceipts?.some(r => r.receiptOrigin === older.msgOrigin)).toBe(true);
  });

  it('B4 keeps the held plan when its replacement is lost or actually refused', () => {
    const a = offensive(first);
    const b = offensive(letter(first.key, 2), { supersedes: first, objective: R('b_cap'), posture: 'take' });
    const world = fixture([a, b], { a_bold: { boldness: 'low', regard: 'low', candour: 'high', values: ['caution'] } });
    const start = createState(world, { seed: 11 });
    const aSent = tick(world, start, [entry(1, command(world, a, { route: 'special-messenger' }))]).state;
    const original = aSent.planRecords[post]?.planOrder;
    expect(original).toBe(sent(aSent)[0]?.dispatchOrigin);
    const lost = tick(world, aSent, [entry(2, command(world, b, { route: 'courier' }))]).state;
    const pending = authored(lost)[0];
    expect(pending).toBeDefined();
    const withoutDelivery = { ...lost, messagesInTransit: lost.messagesInTransit.filter(m => m.id !== pending?.id) };
    expect(tick(world, withoutDelivery, []).state.planRecords[post]?.planOrder).toBe(original);
    const refused = tick(world, aSent, [entry(2, command(world, b, { route: 'special-messenger' }))]).state;
    const newer = sent(refused).find(d => d.dispatchLetter.revision === 2)!.dispatchOrigin;
    expect(['object', 'refuse']).toContain(refused.orderResponses[responseKey(newer, P('a_bold'))]?.respActual);
    expect(refused.planRecords[post]?.planOrder).toBe(original);
  });

  it('B5 keeps identical independent letters apart and rejects altered authored terms', () => {
    const a = offensive(first);
    const b = offensive(letter(first.key, 2), { supersedes: first });
    const world = fixture([a, b]);
    const start = createState(world, { seed: 11 });
    const initial = command(world, a, { route: 'special-messenger' });
    const altered = { ...initial, goal: { ...initial.goal, risk: initial.goal.risk + 1 } };
    const rejected = tick(world, start, [entry(1, altered)]);
    expect(rejected.rejections).toHaveLength(1);
    expect(sent(rejected.state)).toEqual([]);
    const aSent = tick(world, start, [entry(1, initial)]).state;
    const bSent = tick(world, aSent, [entry(2, command(world, b, { route: 'special-messenger' }))]).state;
    const origins = sent(bSent).map(d => d.dispatchOrigin);
    expect(bSent.planRecords[post]?.planOrder).toBe(origins[1]);
    expect(knowledgeOf(bSent, lead).knownSentOrders?.find(o => o.sentMessage === origins[1])?.sentReaffirms).toBeUndefined();
    expect(origins[0]).not.toBe(origins[1]);
  });

  it('B5 a received plan submission answers the original dispatch, and its approval goes stale after revision', () => {
    const a = offensive(first);
    const b = offensive(letter(first.key, 2), { supersedes: first, objective: R('a_cap') });
    const world = fixture([a, b], {}, true);
    const start = createState(world, { seed: 11 });
    let state = tick(world, start, [entry(1, command(world, a, { route: 'special-messenger' }))]).state;
    const original = sent(state)[0]!.dispatchOrigin;
    for (let i = 0; i < 7 && menu(world, state).reviews.length === 0; i++) state = tick(world, state, []).state;
    const review = menu(world, state).reviews[0]!;
    expect(review.authoredPaper).toBe(review.report);
    const submission = knowledgeOf(state, lead).knownReports.find(r => r.id === review.authoredPaper);
    expect(submission?.knownBody).toMatchObject({ reportLetter: first, reportAnswers: original });
    const revised = tick(world, state, [entry(state.stateDay + 1, command(world, b, { route: 'special-messenger' }))]).state;
    const next = tick(world, revised, [entry(revised.stateDay + 1, { cmd: 'review', action: 'approve', to: post, paper: review.authoredPaper!, edit: null, route: 'special-messenger', bypass: true })]);
    expect(next.rejections).toEqual([]);
    expect(next.state.planRecords[post]?.planOrder).toBe(sent(revised).find(d => d.dispatchLetter.revision === 2)!.dispatchOrigin);
    expect(next.state.planRecords[post]?.planStatus).not.toBe('approved');
  });

  it('B5 links a deliberate retry and its proposal to the still-held original, then refuses the late approval', () => {
    const a = offensive(first);
    const b = offensive(letter(first.key, 2), { supersedes: first, objective: R('a_cap') });
    const world = fixture([a, b], { a_bold: { boldness: 'low', candour: 'high', regard: 'above', values: ['caution', 'duty'] } });
    const holder = seatIdFor(P('a_bold'));
    const start = deliverReport(createState(world, { seed: 7 }), holder, report('m.authored.safe', {
      reportSubjectId: R('a_cap'), reportDay: 0,
      reportClaims: [{ claimKind: 'control', claimRegion: R('a_cap'), claimValue: 1000, claimToken: 'a', claimConfidence: 1000 }],
    }, 0), NO_TRUTH);
    const initial = command(world, a, { route: 'special-messenger' });
    const issued = playDays(world, start, scriptedSeats({ a: { 1: [initial] } }), 2).state;
    const original = issued.planRecords[post]!.planOrder;
    const day = issued.stateDay;
    const withoutRoutine = { ...issued, messagesInTransit: issued.messagesInTransit.filter(m => m.msgTo !== P('a_bold') || m.msgReport?.reportType !== 'enemy-estimate') };
    const threatened = deliverReport(withoutRoutine, holder, report('m.authored.threat', {
      reportType: 'enemy-estimate', reportSubjectKind: 'region', reportSubjectId: R('a_mid'), reportDay: day,
      // A safer-position proposal needs affirmative clearances, including its route's neighbors.
      reportClaims: ['a_cap', 'a_mid', 'a_front', 'b_front', 'b_mid', 'b_cap'].map(r => ({ claimKind: 'enemy-strength', claimRegion: R(r), claimValue: r === 'a_mid' ? 300 : 0, claimToken: null, claimConfidence: 1000 })),
    }, day), NO_TRUTH);
    let retried = tick(world, threatened, [entry(day + 1, { ...initial, retryOf: original })]).state;
    expect(retried.planRecords[post]?.planOrder).toBe(original);
    const retry = sent(retried)[0]!.dispatchLatest!;
    expect(retry).toBeDefined();
    expect(retry).not.toBe(original);
    for (let i = 0; i < 6 && (menu(world, retried).proposals?.length ?? 0) === 0; i++) retried = tick(world, retried, []).state;
    const proposal = menu(world, retried).proposals?.[0];
    expect(proposal?.order).toBe(retry);
    const response = knowledgeOf(retried, lead).knownReports.find(r => r.id === proposal?.paper);
    expect(response?.knownBody).toMatchObject({ reportLetter: first, reportAnswers: retry, reportProposal: { proposalBasis: original } });
    const revised = tick(world, retried, [entry(retried.stateDay + 1, command(world, b, { route: 'special-messenger' }))]).state;
    const answer = { cmd: 'answer_proposal' as const, action: 'accept' as const, to: post, proposal: proposal!.paper, route: 'special-messenger' as const, bypass: true };
    const last = tick(world, revised, [entry(revised.stateDay + 1, answer)]);
    expect(last.rejections).toEqual([]);
    expect(last.state.planRecords[post]?.planOrder).toBe(sent(revised).find(d => d.dispatchLetter.revision === 2)!.dispatchOrigin);
  });

  it('B6 preserves an authored dispatch ID and courier delay when an unrelated message is inserted', () => {
    const a = offensive(first, { post: POST('a_army') });
    const b = offensive(second, { post: POST('a_army') });
    const world = fixture([a, b]);
    const start = createState(world, { seed: 11 });
    const aOnly = [entry(1, command(world, a))];
    const bOnly = [entry(1, command(world, b))];
    const { letter: _, ...unrelated } = command(world, offensive(first));
    const capture = (log: typeof aOnly) => authored(tick(world, start, log).state).map(m => [m.id, m.msgArriveDay]);
    expect(capture(aOnly)).toHaveLength(1);
    expect(capture(bOnly)).toHaveLength(1);
    expect(capture(aOnly)).not.toEqual(capture(bOnly));
    const expanded = [entry(1, unrelated), ...aOnly];
    expect(capture(expanded)).toEqual(capture(aOnly));
    expect(capture([...aOnly, entry(1, unrelated)])).toEqual(capture(aOnly));
    const played = playDays(world, start, scriptedSeats({ a: { 1: expanded.map(e => e.command), 2: [command(world, b)] } }), 7);
    expect(replay(world, start, played.log, 7).hashes).toEqual(played.hashes);
  });
});
