import { expect, it } from 'vitest';
import { canonicalHash } from '../src/serialize/hash.ts';
import { tick } from '../src/tick/tick.ts';
import { createState } from '../src/tick/setup.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { goalTerms } from './support/test-seats.ts';
import type { ReviewCommand } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import { replay } from '../src/log/session.ts';
import { relieveHolder } from '../src/command/command.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import type { State } from '../src/root-state.ts';
import { previewEdit } from '../src/tick/edit-preview.ts';
import { issueOrder } from '../src/tick/orders.ts';
import { ctxFor } from './support/tick-context.ts';

const post = POST('a_reserve');
const seat = seatIdFor(P('a_lead'));
const note = { markKind: 'wait', markAxis: 'main', markDays: 7, markRegion: null, markVia: [] } as const;

function run(resentful = false, covert = false) {
  const world = indexedFixture({ posts: { a_reserve: { strength: 2000 } }, persons: {
    a_bold: { boldness: 'high', candour: covert ? 'low' : 'high', regard: resentful ? 'low' : 'high', values: ['glory'] },
  } });
  let state = createState(world, { seed: 7 });
  let sent = false;
  let arrived = false;
  const log: LogEntry[] = [];
  for (let day = 1; day <= 18; day++) {
    const request = pendingRequests(world, state).find(r => r.requestSeat === seat)!;
    const review = request.menu.menuKind === 'principal' && request.menu.reviews.length > 0;
    const command = day === 1 ? { cmd: 'order' as const, to: post, goal: goalTerms('take', 'b_mid', { approveAsDrafted: false }), route: 'special-messenger' as const, bypass: true }
      : review && !sent ? { cmd: 'review', to: post, action: 'send_back', edit: null, notes: [note], route: 'special-messenger', bypass: true } as ReviewCommand
      : null;
    if (command?.cmd === 'review') sent = true;
    const entries = command ? [{ day, seat, command }] : [];
    log.push(...entries);
    const result = tick(world, state, entries, { freeze: true });
    expect(result.rejections).toEqual([]);
    state = result.state;
    if (sent && state.planRecords[post]?.planDraft?.draftDay === day) arrived = true;
    const received = pendingRequests(world,state).find(r=>r.requestSeat===seat)!.menu;
    if (arrived && received.menuKind==='principal' && received.reviews.some(r=>r.notes?.length)) break;
  }
  expect(sent && arrived).toBe(true);
  return { world, state, log, record: state.planRecords[post]! };
}

it('a compliant commander reads a note and gives its preferred timing a soft scoring term', () => {
  const { record } = run();
  const chosen = record.planDraft!.draftCandidates.find(c => c.id === record.planChosen)!;
  expect(chosen.candAxes[0]!.axisPhases.find(p => p.phaseKind === 'concentrate')!.phaseDays).toBe(7000);
  expect(chosen.candTerms.some(t => t.contribTerm === 'notes' && t.contribAmount > 0)).toBe(true);
  expect(record.planGoal.goalObjective).toBe('b_mid');
  expect(record.planCounters).toEqual([]);
  expect(record.planStatus).toBe('review');
});

it('a commander who resents the principal sets the note aside with his compliance reason', () => {
  const { state, record } = run(true);
  const response = Object.values(state.orderResponses).find(r => r.respOrder.includes('send_back') && r.respRole === 'addressee')!;
  expect(response).toBeDefined();
  expect(response.respReasons).toContainEqual({ kind: 'distrusts_leader' });
  const chosen = record.planDraft!.draftCandidates.find(c => c.id === record.planChosen)!;
  expect(chosen.candAxes[0]!.axisPhases.find(p => p.phaseKind === 'concentrate')!.phaseDays).not.toBe(7000);
  expect(chosen.candTerms.filter(t => t.contribTerm === 'notes').every(t => t.contribAmount === 0)).toBe(true);
});

it('the notes and their redraft replay to the same hash', () => {
  const a = run();
  expect(canonicalHash(a.state)).toBe(canonicalHash(run().state));
  const start = createState(a.world, { seed: 7 });
  expect(canonicalHash(replay(a.world, start, a.log, a.state.stateDay).state)).toBe(canonicalHash(a.state));
  const worldHash = canonicalHash(a.world.map.world);
  const save = decodeSave(encodeSave({ worldHash, state: a.state, log: a.log }), { expectedWorldHash: worldHash });
  expect(save.log).toEqual(a.log);
  const resumed = save.state as unknown as State;
  expect(canonicalHash(tick(a.world, resumed, [], { freeze: true }).state)).toBe(canonicalHash(tick(a.world, a.state, [], { freeze: true }).state));
});

it('the principal receives the stated account without hidden note weights or private distrust', () => {
  const { world, state } = run(true, true);
  const request = pendingRequests(world, state).find(r => r.requestSeat === seat)!;
  if (request.menu.menuKind !== 'principal') throw Error('principal expected');
  const review = request.menu.reviews[0]!;
  expect(review.notes).toHaveLength(1);
  expect(review.notes![0]!.accountReasons.some(r => r.reasonKind === 'distrusts_leader')).toBe(false);
  expect(review.plan.terms.some(t => t.term === 'notes')).toBe(false);
  expect(JSON.stringify(review)).not.toMatch(/respActual|readingResponse|\+note\d|noteAmount/);
  const preview=previewEdit(world,state,post,{kind:'timing',axis:'main',region:null,via:[],concentration:4},state.stateDay+1);
  expect(preview.ok).toBe(true);
  expect(JSON.stringify(preview)).not.toMatch(/\+note\d|noteAmount/);
});

it('a note whose post falls vacant in transit bounces without compliance or redrafting', () => {
  const base = run();
  let state = base.state;
  const sentDay = state.stateDay + 1;
  const command: ReviewCommand = { cmd: 'review', to: post, action: 'send_back', edit: null, notes: [note], route: 'courier', bypass: true };
  const sent = tick(base.world, state, [{ day: sentDay, seat, command }], { freeze: true });
  expect(sent.rejections).toEqual([]);
  const message = sent.state.messagesInTransit.find(m => m.msgOrder?.orderKind === 'send_back')!;
  expect(message.msgOrder?.orderNotes).toEqual([note]);
  expect(message.msgArriveDay).toBeGreaterThan(sentDay);
  state = relieveHolder(sent.state, post);
  const previous = state.planRecords[post];
  for (let d = 0; d < 6; d++) state = tick(base.world,state,[],{freeze:true}).state;
  expect(Object.values(state.orderResponses).some(r => r.respOrder === message.msgOrigin && r.respRole === 'addressee')).toBe(false);
  expect(state.planRecords[post]).toEqual(previous);
  expect(Object.values(state.knowledgeBySeat).flatMap(k=>k.knownReports).some(k=>k.knownBody.reportAnswers === message.msgOrigin && k.knownBody.reportClaims.some(c=>c.claimKind==='order-returned' && c.claimToken==='vacant_post'))).toBe(true);
});

it('N3: the submitted score excludes a positive private note weight', () => {
  const { world, state, record } = run();
  const chosen = record.planDraft!.draftCandidates.find(c => c.id === record.planChosen)!;
  const amount = chosen.candTerms.find(t => t.contribTerm === 'notes')!.contribAmount;
  expect(amount).toBeGreaterThan(0);
  const menu = pendingRequests(world, state).find(r => r.requestSeat === seat)!.menu;
  if (menu.menuKind !== 'principal') throw Error('principal expected');
  const review = menu.reviews.find(r => r.post === post)!;
  const ordinary = chosen.candTerms.filter(t => t.contribTerm !== 'notes').reduce((sum, t) => sum + t.contribAmount, 0);
  expect(review.plan.score).toBe(ordinary);
  expect(review.plan.score).toBe(chosen.candScore - amount);
  expect(review.plan.terms.some(t => t.term === 'notes')).toBe(false);
  const report = state.knowledgeBySeat[seat]!.knownReports.find(r => r.id === review.report)!;
  expect(report.knownBody.reportClaims.find(c => c.claimKind === 'plan-submitted')!.claimValue).toBe(ordinary);
});

it('N5: approval refuses notes before dispatch, while a bare approval is accepted', () => {
  const { world, state } = run();
  const ctx = ctxFor(world, state, state.stateDay + 1, ['messages.sent', 'messages.courier_delay', 'orders.bypassed']);
  const command: ReviewCommand = { cmd: 'review', to: post, action: 'approve', edit: null, notes: [note], route: 'courier', bypass: true };
  const before = canonicalHash(state);
  expect(issueOrder(ctx, state, seat, command)).toBe('bad_review');
  expect(ctx.outbox).toEqual([]);
  expect(canonicalHash(state)).toBe(before);
  const { notes: ignored, ...bare } = command;
  expect(issueOrder(ctx, state, seat, bare)).toBeNull();
  expect(ctx.outbox).toHaveLength(1);
  expect(ctx.outbox[0]!.msgOrder!.orderKind).toBe('approve');
  expect(ctx.outbox[0]!.msgOrder!.orderNotes).toBeUndefined();
});

it('N6: a note naming an unknown objective or waypoint is refused before dispatch', () => {
  const { world, state } = run();
  for (const mark of [
    { ...note, markKind: 'focus' as const, markDays: null, markRegion: R('not_on_the_map') },
    { ...note, markKind: 'avoid' as const, markDays: null, markRegion: R('not_on_the_map') },
    { ...note, markKind: 'via' as const, markDays: null, markVia: [R('not_on_the_map')] },
  ]) {
    const ctx = ctxFor(world, state, state.stateDay + 1, ['messages.sent', 'messages.courier_delay', 'orders.bypassed']);
    const command: ReviewCommand = { cmd: 'review', to: post, action: 'send_back', edit: null, notes: [mark], route: 'courier', bypass: true };
    expect(issueOrder(ctx, state, seat, command), mark.markKind).toBe('bad_review');
    expect(ctx.outbox).toEqual([]);
    const known = { ...mark, markRegion: mark.markRegion === null ? null : R('b_mid'), markVia: mark.markVia.map(() => R('b_front')) };
    expect(issueOrder(ctx, state, seat, { ...command, notes: [known] }), mark.markKind).toBeNull();
    expect(ctx.outbox).toHaveLength(1);
  }
});
