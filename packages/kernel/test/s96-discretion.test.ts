import { expect, it } from 'vitest';
import { applyForces } from '../src/forces/forces.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { playDays, replay } from '../src/log/session.ts';
import { entryProblems } from '../src/log/log.ts';
import type { SeatCommand } from '../src/log/commands.ts';
import { orderJoins } from '../src/movement/join.ts';
import { discretionThreat } from '../src/planner/discretion.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import type { State } from '../src/root-state.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { morningGround, pendingRequests } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { goalOf } from '../src/tick/orders.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { report } from './support/s25-fixture.ts';
import { goalTerms, order, scriptedSeats } from './support/test-seats.ts';

const post = POST('a_reserve');
const commander = seatIdFor(P('a_bold'));
const principal = seatIdFor(P('a_lead'));
const world = indexedFixture();
const run = (state: State, days: number, letter?: ReturnType<typeof order>) =>
  playDays(world, state, scriptedSeats(letter ? { a: { 1: [letter] } } : {}), days);

function enemyReport(state: State, region: string, amount: number, seat = commander): State {
  return deliverReport(state, seat, report(`m.enemy.${region}.${state.stateDay}`, {
    reportType: 'enemy-estimate', reportSubjectKind: 'region', reportSubjectId: region, reportDay: state.stateDay,
    reportClaims: [{ claimKind: 'enemy-strength', claimRegion: R(region), claimValue: amount, claimToken: null, claimConfidence: 1000 }],
  }, state.stateDay), NO_TRUTH);
}

function unseenStrength(state: State): State {
  return applyForces(state, [{ change: 'strength', block: toId('forceBlock', 'b_army_1'), men: 10000, cause: 'recruitment' }]).state;
}

function withoutRoutineEstimate(state: State): State {
  return { ...state, messagesInTransit: state.messagesInTransit.filter(m =>
    m.msgTo !== P('a_bold') || m.msgReport?.reportType !== 'enemy-estimate') };
}

it('applies the full fallback only after delivery, from the commander’s own contact report', () => {
  const start = createState(world, { seed: 7 });
  const fallback = goalTerms('hold', null, { rail: false, deadlineDays: 7 });
  const grant = order(post, 'advance', 'b_cap', 'courier', true, { discretion: { condition: 'outmatched', fallback } });
  const sent = run(start, 2, grant);
  expect(sent.state.planRecords[post]).toBeUndefined();
  // Replace the routine estimate en route to this commander with the controlled contact report.
  const withoutRoutine = withoutRoutineEstimate(sent.state);
  const principalOnly = enemyReport(withoutRoutine, 'a_mid', 40000, principal);
  const hisContact = enemyReport(withoutRoutine, 'a_mid', 40000);
  const received = run(hisContact, 1);
  expect(received.state.planRecords[post]?.planGoal).toEqual(goalOf(fallback));
  expect(received.state.messagesInTransit.some(m => m.msgReport?.reportDiscretion?.switchCondition === 'outmatched')).toBe(true);
  expect(received.state.knowledgeBySeat[principal]?.knownReports.some(r => r.knownBody.reportDiscretion)).toBeFalsy();
  expect(run(unseenStrength(hisContact), 1).state.planRecords[post]?.planGoal).toEqual(goalOf(fallback));
  expect(run(principalOnly, 1).state.planRecords[post]?.planGoal.goalObjective).toBe(R('b_cap'));
  expect(run(unseenStrength(principalOnly), 1).state.planRecords[post]?.planGoal.goalObjective).toBe(R('b_cap'));
  expect(replay(world, hisContact, received.log, 3).state).toEqual(received.state);
  const informed = run(received.state, 2).state;
  expect(informed.knowledgeBySeat[principal]?.knownReports.find(r => r.knownBody.reportDiscretion)?.knownBody.reportAnswers)
    .toBe(received.state.planRecords[post]!.planDiscretionOrder);
});

it('judges a known superior force astride the fallback line as turning the position', () => {
  const start = createState(world, { seed: 7 });
  const grant = order(post, 'hold', 'a_mid', 'special-messenger', true, {
    discretion: { condition: 'turned', fallback: goalTerms('hold', 'a_cap') },
  });
  const belief = enemyReport(start, 'a_cap', 40000);
  expect(run(belief, 2, grant).state.planRecords[post]?.planGoal.goalObjective).toBe(R('a_cap'));
  expect(run(unseenStrength(belief), 2, grant).state.planRecords[post]?.planGoal.goalObjective).toBe(R('a_cap'));
  const frontal = enemyReport(start, 'a_front', 40000);
  expect(run(frontal, 2, grant).state.planRecords[post]?.planGoal.goalObjective).toBe(R('a_mid'));
  expect(run(unseenStrength(frontal), 2, grant).state.planRecords[post]?.planGoal.goalObjective).toBe(R('a_mid'));
});

function offeredProposal() {
  const start = enemyReport(createState(world, { seed: 7 }), 'b_cap', 40000, seatIdFor(P('a_gen')));
  const letter = order('a_army', 'advance', 'b_cap', 'special-messenger', true);
  const tail = run(start, 5, letter).state;
  return { tail, letter, proposal: principalMenu(tail).proposals?.[0] };
}

function principalMenu(state: State, fixture = world) {
  const menu = pendingRequests(fixture, state).find(r => r.requestSeat === principal)?.menu;
  if (menu?.menuKind !== 'principal') throw Error('the fixture principal has no menu');
  return menu;
}

it('an objection carries the planner’s own complete proposal back along the wire', () => {
  const { tail, letter, proposal: offered } = offeredProposal();
  const proposal = tail.knowledgeBySeat[principal]?.knownReports.find(r => r.id === offered?.paper);
  expect(proposal?.knownBody.reportAnswers).toBeTruthy();
  expect(proposal?.knownBody.reportProposal).toMatchObject({
    goal: { ...goalOf(letter.goal), goalPosture: 'hold', goalObjective: null },
    reasons: expect.arrayContaining([expect.objectContaining({ kind: 'hold_preferred' })]),
  });
  expect(tail.planRecords[letter.to]?.planGoal.goalObjective).toBe(R('b_cap'));
});

it.each(['accept', 'decline', 'discretion'] as const)('sends a received proposal answer as a letter (%s)', (action) => {
  const { tail, letter, proposal } = offeredProposal();
  expect(proposal).toBeDefined();
  const day = tail.stateDay + 1;
  const fallback = { condition: 'turned' as const, fallback: goalTerms('hold', 'a_mid', {
    discretion: { condition: 'outmatched', fallback: goalTerms('hold', 'a_cap') },
  }) };
  const routing = { cmd: 'answer_proposal' as const, to: letter.to, proposal: proposal!.paper, route: 'courier' as const, bypass: true };
  const command: SeatCommand = action === 'discretion'
    ? { ...routing, action, goal: { ...letter.goal, discretion: fallback } } : { ...routing, action };
  const sent = playDays(world, tail, scriptedSeats({ a: { [day]: [command] } }), 1, { freeze: true });
  expect(sent.state.planRecords[letter.to]?.planGoal).toEqual(goalOf(letter.goal));
  const answer = sent.state.messagesInTransit.find(m => m.msgOrder?.orderProposal?.replyPaper === proposal!.paper);
  expect(answer?.msgOrder?.orderProposal).toEqual({ replyPaper: proposal!.paper, replyAction: action, replyOrder: proposal!.order });
  expect(answer!.msgArriveDay).toBeGreaterThan(day);
  const decoded = decodeSave(encodeSave({ worldHash: canonicalHash(world.map.world), state: sent.state, log: sent.log }));
  const received = run(decoded.state as unknown as State, answer!.msgArriveDay - day);
  const goal = received.state.planRecords[letter.to]?.planGoal;
  if (action === 'accept') expect(goal).toEqual(goalOf(proposal!.goal));
  else if (action === 'decline') expect(goal).toEqual(goalOf(letter.goal));
  else expect(goal).toEqual(goalOf({ ...letter.goal, discretion: fallback }));
  expect(replay(world, tail, [...sent.log, ...received.log], answer!.msgArriveDay, { freeze: true }).state).toEqual(received.state);
});

it('rejects an answer to a proposal that has yet to arrive', () => {
  const start = createState(world, { seed: 7 });
  const proposal = toId('message', 'm.pending');
  const played = tick(world, start, [{ day: 1, seat: principal, command: { cmd: 'answer_proposal', to: post, proposal, action: 'accept', route: 'wire', bypass: false } }]);
  expect(played.rejections).toEqual([expect.objectContaining({ reason: 'no_proposal' })]);
});

it('a reaffirmed goal preserves its still-actionable proposal', () => {
  const { tail, letter, proposal } = offeredProposal();
  const day = tail.stateDay + 1;
  const repeated = tick(world, tail, [{ day, seat: principal, command: letter }]).state;
  const after = tick(world, repeated, []).state;
  expect(after.planRecords[letter.to]?.planOrder).toBe(proposal!.order);
  expect(principalMenu(after).proposals?.[0]?.paper).toBe(proposal!.paper);
});

it('a reservation on a reaffirmed goal can send a proposal without resetting the held plan', () => {
  const fixture = indexedFixture({ persons: { a_bold: { boldness: 'above', candour: 'average', regard: 'above', values: ['glory'] } } });
  const days = (state: State, n: number, letter?: ReturnType<typeof order>) =>
    playDays(fixture, state, scriptedSeats(letter ? { a: { 1: [letter] } } : {}), n).state;
  const letter = order(post, 'hold', 'a_mid', 'special-messenger', true);
  const original = days(createState(fixture, { seed: 7 }), 2, letter);
  expect(principalMenu(original, fixture).proposals).toBeUndefined();
  const plan = original.planRecords[post]!;
  const updated = enemyReport(withoutRoutineEstimate(original), 'a_mid', 1800);
  const prepared = deliverReport(updated, commander, report('m.reaffirm.friendly', {
    reportSubjectId: R('a_cap'), reportDay: updated.stateDay,
    reportClaims: [{ claimKind: 'control', claimRegion: R('a_cap'), claimValue: 1000, claimToken: 'a', claimConfidence: 1000 }],
  }, updated.stateDay), NO_TRUTH);
  const did = tick(fixture, prepared, [{ day: prepared.stateDay + 1, seat: principal, command: letter }]).state;
  const heard = days(did, 2);
  expect(heard.planRecords[post]).toMatchObject({ planOrder: plan.planOrder, planSetDay: plan.planSetDay, planChosen: plan.planChosen });
  const proposal = principalMenu(heard, fixture).proposals?.[0];
  expect(proposal?.goal.objective).toBe(R('a_cap'));
  expect(proposal?.order).not.toBe(plan.planOrder);
  expect(Object.values(heard.orderResponses).find(r => r.respOrder === proposal?.order && r.respRole === 'addressee')?.respDeclared).toBe('comply_with_reservations');
});

it('a conflict-kept goal may still be proposed against, and only its current reply can replace the held plan', () => {
  const army = POST('a_army');
  const held = order(army, 'hold', 'a_front', 'wire');
  const before = run(createState(world, { seed: 7 }), 3, held).state;
  const original = before.planRecords[army]!;
  expect(original?.planGoal.goalObjective).toBe(R('a_front'));
  const cautious = seatIdFor(P('a_gen'));
  const picture = enemyReport(before, 'b_cap', 40000, cautious);
  const conflicting = order(army, 'advance', 'b_cap', 'special-messenger', true);
  const challenged = tick(world, picture, [{ day: picture.stateDay + 1, seat: principal, command: conflicting }]).state;
  const heard = run(challenged, 4).state;
  const offer = principalMenu(heard).proposals?.[0];
  expect(heard.planRecords[army]?.planOrder).toBe(original.planOrder);
  expect(offer?.goal.objective).toBeNull();
  expect(offer?.order).not.toBe(original.planOrder);
  const answer = { cmd: 'answer_proposal' as const, to: army, proposal: offer!.paper, action: 'accept' as const, route: 'courier' as const, bypass: true };
  const queued = tick(world, heard, [{ day: heard.stateDay + 1, seat: principal, command: answer }]);
  const message = queued.state.messagesInTransit.find(m => m.msgOrder?.orderProposal?.replyPaper === offer!.paper)!;
  expect(queued.rejections).toEqual([]);
  expect(queued.state.planRecords[army]?.planOrder).toBe(original.planOrder);
  const days = message.msgArriveDay - queued.state.stateDay;
  expect(run(queued.state, days).state.planRecords[army]?.planGoal.goalObjective).toBeNull();

  const other = order(army, 'advance', 'b_mid', 'special-messenger', true);
  const superseded = tick(world, queued.state, [{ day: queued.state.stateDay + 1, seat: principal, command: other }]).state;
  const passed = run(superseded, days).state;
  expect(passed.planRecords[army]?.planGoal.goalObjective).toBe(R('b_mid'));
  const receipts = [...passed.messagesInTransit.flatMap(m => m.msgReport === null ? [] : [m.msgReport]),
    ...passed.knowledgeBySeat[principal]!.knownReports.map(r => r.knownBody)];
  expect(receipts.some(r => r.reportAnswers === message.msgOrigin &&
    r.reportClaims.some(c => c.claimKind === 'order-obeyed' && c.claimToken === 'stale'))).toBe(true);
});

it('declining a second proposal retains the goal sent in the first proposal answer', () => {
  const { tail, letter, proposal } = offeredProposal();
  const first = { cmd: 'answer_proposal' as const, to: letter.to, proposal: proposal!.paper, action: 'accept' as const, route: 'special-messenger' as const, bypass: true };
  const issued = tick(world, tail, [{ day: tail.stateDay + 1, seat: principal, command: first }]).state;
  const approved = tick(world, issued, []).state;
  const active = approved.planRecords[letter.to]!;
  expect(active.planGoal).toEqual(goalOf(proposal!.goal));
  const paper = report('m.second.proposal', {
    reportAuthor: P('a_gen'), reportAuthorPost: letter.to, reportSubjectKind: 'post', reportSubjectId: letter.to,
    reportAnswers: active.planOrder, reportDay: approved.stateDay,
    reportProposal: { goal: goalOf(goalTerms('hold', 'a_mid')), reasons: [{ kind: 'safer_position', heldThreat: 1000, preferredThreat: 0 }] },
  }, approved.stateDay);
  const newest = deliverReport(approved, principal, paper, NO_TRUTH);
  expect(principalMenu(newest).proposals?.[0]?.paper).toBe(paper.id);
  const declined = tick(world, newest, [{ day: newest.stateDay + 1, seat: principal,
    command: { ...first, proposal: paper.id, action: 'decline' } }]);
  expect(declined.rejections).toEqual([]);
  expect(principalMenu(declined.state).proposals).toBeUndefined();
  expect(principalMenu(declined.state).sentGoals?.some(g => g.message === active.planOrder)).toBe(true);
});

it('a conditional fallback waits for its own word, offered only from received readiness and switch papers', () => {
  const start = enemyReport(createState(world, { seed: 7 }), 'a_front', 40000);
  const fallback = goalTerms('hold', 'a_cap', { awaitWord: true });
  const grant = order(post, 'hold', 'a_mid', 'special-messenger', true, { discretion: { condition: 'outmatched', fallback } });
  const issued = tick(world, start, [{ day: 1, seat: principal, command: grant }]).state;
  let state = issued;
  for (let i = 0; i < 4 && !principalMenu(state).awaiting.includes(post); i++) state = tick(world, state, []).state;
  expect(state.planRecords[post]?.planStatus).toBe('ready');
  expect(principalMenu(state).awaiting).toContain(post);
  const knowledge = state.knowledgeBySeat[principal]!;
  for (const missing of ['switch', 'ready']) {
    const hidden = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [principal]: { ...knowledge, knownReports: knowledge.knownReports.filter(r =>
      missing === 'switch' ? r.knownBody.reportDiscretion === undefined :
        !r.knownBody.reportClaims.some(c => c.claimKind === 'goal-status' && c.claimToken === 'ready')) } } };
    expect(principalMenu(hidden).awaiting).not.toContain(post);
    const refused = tick(world, hidden, [{ day: hidden.stateDay + 1, seat: principal, command: { cmd: 'go', to: post, route: 'wire', bypass: true } }]);
    expect(refused.rejections).toEqual([expect.objectContaining({ reason: 'no_plan' })]);
  }
  const sent = tick(world, state, [{ day: state.stateDay + 1, seat: principal, command: { cmd: 'go', to: post, route: 'wire', bypass: true } }]);
  expect(sent.rejections).toEqual([]);
  expect(principalMenu(sent.state).awaiting).not.toContain(post);
  expect(tick(world, sent.state, []).state.planRecords[post]?.planStatus).toBe('approved');
});

it.each(['turned', 'outmatched'] as const)('ignores a stronger distant reinforcement still joining when judging %s', condition => {
  const block = toId('forceBlock', 'a_army_1');
  const start = enemyReport(createState(world, { seed: 7 }), 'a_cap', 800);
  const assigned = { ...start, forceAssignments: { ...start.forceAssignments, [block]: post } };
  const joining = orderJoins(assigned, [block], post, R('a_mid'), 0);
  const grant = order(post, 'hold', 'a_mid', 'special-messenger', true, { discretion: { condition, fallback: goalTerms('hold', 'a_cap') } });
  function switchPaper(state: State) {
    return run(state, 1, grant).state.messagesInTransit.find(m => m.msgReport?.reportDiscretion)?.msgReport?.reportDiscretion;
  }
  const onHisOwn = switchPaper(start);
  expect(onHisOwn).toMatchObject({ switchRegion: R('a_cap'), switchStrength: 600 });
  expect(switchPaper(joining)).toEqual(onHisOwn);
});

it('uses the pack’s caution shares strictly above superiority at the same perceived strength', () => {
  const start = createState(world, { seed: 7 });
  const ground = morningGround(world, start, 1).march;
  const derived = deriveMap(world.map, { control: start.regionControl, month: ground.month, network: ground.network });
  const position = R('a_mid');
  const input = plannerInputFor(world, start, derived, ground.network, ground.month, viewFor(world, start, commander), post, goalOf(goalTerms('hold', position)), 1);
  const grant = { condition: 'outmatched' as const, fallback: goalOf(goalTerms('hold', null)) };
  function faces(boldness: number, estimate: number) {
    return discretionThreat({ ...input, profile: { ...input.profile, boldness }, beliefs: new Map([[position, estimate]]) }, position, grant);
  }
  expect(faces(0, 599)).toBeNull();
  expect(faces(0, 606)).toBeNull();
  expect(faces(0, 607)).toMatchObject({ threshold: 606, estimate: 607 });
  expect(faces(1000, 607)).toBeNull();
  expect(faces(1000, 631)).toBeNull();
  expect(faces(1000, 632)).toMatchObject({ threshold: 631, estimate: 632 });
});

it('an objection to holding put can propose a safer reachable position under the commander’s own picture', () => {
  const start = enemyReport(createState(world, { seed: 7 }), 'a_mid', 1800);
  const held = deliverReport(start, commander, report('m.friendly.anchor', {
    reportSubjectId: R('a_cap'), reportDay: 0,
    reportClaims: [{ claimKind: 'control', claimRegion: R('a_cap'), claimValue: 1000, claimToken: 'a', claimConfidence: 1000 }],
  }, 0), NO_TRUTH);
  const letter = order(post, 'hold', 'a_mid', 'special-messenger', true);
  expect(principalMenu(run(start, 4, letter).state).proposals).toBeUndefined();
  const tail = run(held, 4, letter).state;
  expect(principalMenu(tail).proposals?.[0]?.goal.objective).toBe(R('a_cap'));
  expect(principalMenu(tail).proposals?.[0]?.reasons.some(r => r.kind === 'safer_position')).toBe(true);
  expect(tail.planRecords[post]?.planGoal.goalObjective).toBe(R('a_mid'));
});

it('a second fallback has its own test and keeps the original source of permission', () => {
  const start = enemyReport(createState(world, { seed: 7 }), 'a_cap', 800);
  const fallback = goalTerms('hold', 'a_cap', { discretion: { condition: 'outmatched', fallback: goalTerms('hold', null) } });
  const grant = order(post, 'hold', 'a_mid', 'special-messenger', true, { discretion: { condition: 'turned', fallback } });
  const first = run(start, 1, grant).state;
  expect(first.planRecords[post]?.planGoal).toEqual(goalOf(fallback));
  const authority = first.planRecords[post]!.planDiscretionOrder;
  expect(authority).toBeDefined();
  const heard = enemyReport(withoutRoutineEstimate(first), 'a_front', 40000);
  const second = run(heard, 1).state;
  expect(second.planRecords[post]?.planGoal).toEqual(goalOf(goalTerms('hold', null)));
  expect(second.planRecords[post]?.planDiscretionOrder).toBe(authority);
  expect(second.messagesInTransit.some(m => m.msgReport?.reportDiscretion?.switchCondition === 'outmatched' && m.msgReport.reportAnswers === authority)).toBe(true);
});

it('the doctrine is offered only after a proposal answering the named letter reaches the principal', () => {
  const target = POST('a_army');
  const fromDate = '1900-06-02';
  const base = world.map.world;
  const map = indexWorld({ ...base, rules: { ...base.rules, ruleSeats: { ...base.rules.ruleSeats,
    principals: base.rules.ruleSeats.principals.map(row => row.faction !== F('a') ? row : {
      ...row,
      offensives: [{ id: 'advance_letter', post: target, objective: R('b_cap'), fromDate, source: 'record 1' }],
      proposalAnswers: [{ id: 'answer_letter', post: target, action: 'accept', fromDate, answers: 'advance_letter', source: 'record 2' }],
    }),
  } } });
  const fixture = indexSeatsWorld(map, world.start);
  const start = enemyReport(createState(fixture, { seed: 7 }), 'b_cap', 40000, seatIdFor(P('a_gen')));
  for (const named of [true, false]) {
    const letter = { ...order(target, 'advance', 'b_cap', 'special-messenger', true), ...(named ? { doctrine: 'advance_letter' } : {}) };
    const early = playDays(fixture, start, scriptedSeats({ a: { 1: [letter] } }), 2).state;
    expect(principalMenu(early, fixture).doctrine.proposalAnswers).toEqual([]);
    const received = playDays(fixture, early, scriptedSeats(), 3).state;
    expect(principalMenu(received, fixture).proposals).toHaveLength(1);
    expect(principalMenu(received, fixture).doctrine.proposalAnswers).toHaveLength(Number(named));
  }
});

it('rejects unknown conditions, extra answer goals and overdeep or cyclic orders', () => {
  const base = order(post, 'hold', 'a_mid');
  const entry = { day: 1, seat: principal, command: base };
  for (const condition of ['unknown', 'turned']) {
    const cyclic = { ...base.goal, discretion: { condition, fallback: base.goal } };
    Object.assign(cyclic.discretion, { fallback: cyclic });
    expect(entryProblems({ ...entry, command: { ...base, goal: cyclic } }, 0)).toEqual(expect.arrayContaining([expect.stringContaining('at most 3 fallbacks')]));
  }
  expect(entryProblems({ ...entry, command: { cmd: 'answer_proposal', action: 'decline', to: post,
    proposal: 'm.paper', bypass: true, route: 'courier', goal: base.goal } }, 0)).toHaveLength(1);
  expect(entryProblems({ ...entry, command: { ...base, goal: { ...base.goal,
    discretion: { condition: 'unknown', fallback: base.goal },
  } } }, 0)).toEqual(expect.arrayContaining([expect.stringContaining('unknown discretion condition')]));
});

// 0116: the response and the military reading answer different questions.
it.each([
  { threatened: false, regard: 'above', rung: 'comply' },
  { threatened: true, regard: 'above', rung: 'comply' },
  { threatened: false, regard: 'high', rung: 'exceed' },
  { threatened: true, regard: 'high', rung: 'exceed' },
] as const)('a complying commander proposes only with a received threat ($rung, $threatened)', ({ threatened, regard, rung }) => {
  const fixture = indexedFixture({ persons: { a_bold: { boldness: 'low', candour: 'high', regard, values: ['caution', 'duty'] } } });
  let start = createState(fixture, { seed: 7 });
  start = deliverReport(start, commander, report('m.safe.route', {
    reportSubjectId: R('a_cap'), reportDay: 0,
    reportClaims: [{ claimKind: 'control', claimRegion: R('a_cap'), claimValue: 1000, claimToken: 'a', claimConfidence: 1000 }],
  }, 0), NO_TRUTH);
  // His cautious perception reads 300 as 720 against his joined 600; the
  // route to the friendly capital still admits a feasible alternative.
  const belief = threatened ? enemyReport(start, 'a_mid', 300) : start;
  const letter = order(post, 'hold', 'a_mid', 'special-messenger', true);
  const first = playDays(fixture, belief, scriptedSeats({ a: { 1: [letter] } }), 1);
  const active = first.state.planRecords[post]!;
  const response = first.state.orderResponses[active.planResponse]!;
  expect(response.respActual).toBe(rung);
  expect(response.respDeclared).toBe(rung);
  expect(active.planGoal).toEqual(goalOf(letter.goal));
  const papers = first.state.messagesInTransit.filter(m => m.msgReport?.reportProposal);
  expect(papers).toHaveLength(Number(threatened));
  if (threatened) {
    expect(papers[0]!.msgReport).toMatchObject({ reportAnswers: active.planOrder,
      reportProposal: { goal: { goalPosture: 'hold', goalObjective: R('a_cap') },
        reasons: expect.arrayContaining([expect.objectContaining({ kind: 'position_threatened', condition: 'outmatched', strength: 600 })]) } });
    expect(principalMenu(first.state, fixture).proposals).toBeUndefined();
    const untilReceived = playDays(fixture, first.state, scriptedSeats(), 4).state;
    expect(untilReceived.planRecords[post]!.planGoal).toEqual(goalOf(letter.goal));
    expect(principalMenu(untilReceived, fixture).proposals).toHaveLength(1);
  }
  expect(replay(fixture, belief, first.log, 1).state).toEqual(first.state);
});

it('a complying reaffirmation can propose on new received knowledge without resetting the active plan', () => {
  const fixture = indexedFixture({ persons: { a_bold: { boldness: 'low', candour: 'high', regard: 'above', values: ['caution', 'duty'] } } });
  const start = deliverReport(createState(fixture, { seed: 7 }), commander, report('m.reaffirm.safe', {
    reportSubjectId: R('a_cap'), reportDay: 0,
    reportClaims: [{ claimKind: 'control', claimRegion: R('a_cap'), claimValue: 1000, claimToken: 'a', claimConfidence: 1000 }],
  }, 0), NO_TRUTH);
  const letter = order(post, 'hold', 'a_mid', 'special-messenger', true);
  const original = playDays(fixture, start, scriptedSeats({ a: { 1: [letter] } }), 2).state;
  const active = original.planRecords[post]!;
  const prepared = enemyReport(withoutRoutineEstimate(original), 'a_mid', 300);
  const day = prepared.stateDay + 1;
  const played = playDays(fixture, prepared, scriptedSeats({ a: { [day]: [letter] } }), 5).state;
  const offered = principalMenu(played, fixture).proposals?.[0];
  expect(offered).toBeDefined();
  expect(offered!.order).not.toBe(active.planOrder);
  const paper = played.knowledgeBySeat[principal]!.knownReports.find(r => r.id === offered!.paper)!;
  expect(paper.knownBody.reportProposal?.proposalBasis).toBe(active.planOrder);
  expect(played.planRecords[post]).toMatchObject({ planOrder: active.planOrder, planSetDay: active.planSetDay,
    planChosen: active.planChosen, planGoal: active.planGoal });
  expect(Object.values(played.orderResponses).find(r => r.respOrder === offered!.order && r.respRole === 'addressee')?.respActual).toBe('comply');
});

it('compliance is not enough when the superior enemy is unseen or known only to the principal', () => {
  const fixture = indexedFixture({ persons: { a_bold: { boldness: 'low', candour: 'high', regard: 'above', values: ['caution', 'duty'] } } });
  const start = createState(fixture, { seed: 7 });
  const letter = order(post, 'hold', 'a_mid', 'special-messenger', true);
  for (const state of [unseenStrength(start), enemyReport(start, 'a_mid', 40000, principal)]) {
    const played = playDays(fixture, state, scriptedSeats({ a: { 1: [letter] } }), 1).state;
    expect(played.orderResponses[played.planRecords[post]!.planResponse]!.respActual).toBe('comply');
    expect(played.messagesInTransit.some(m => m.msgReport?.reportProposal)).toBe(false);
    expect(played.planRecords[post]!.planGoal).toEqual(goalOf(letter.goal));
  }
});

it('does not propose merely because a complying commander has a different planner preference', () => {
  const fixture = indexedFixture({ posts: { a_army: { strength: 10000 } }, persons: { a_gen: { boldness: 'low', candour: 'high', regard: 'high', values: ['duty', 'glory'] } } });
  const letter = order('a_army', 'advance', 'b_cap', 'special-messenger', true);
  const state = enemyReport(createState(fixture, { seed: 7 }), 'b_cap', 40000, seatIdFor(P('a_gen')));
  const played = playDays(fixture, state, scriptedSeats({ a: { 1: [letter] } }), 3).state;
  const plan = played.planRecords[letter.to]!;
  expect(played.orderResponses[plan.planResponse]!.respActual).toBe('comply');
  expect(plan.planDraft!.draftCandidates[0]!.candMethod).toBe('holding');
  expect(played.messagesInTransit.some(m => m.msgReport?.reportProposal)).toBe(false);
  expect(principalMenu(played, fixture).proposals).toBeUndefined();
});
