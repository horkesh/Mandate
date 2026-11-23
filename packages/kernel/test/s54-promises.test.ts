import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { setGoal } from '../src/plans/plans.ts';
import { knowledgeOf, pruneKnowledge } from '../src/knowledge/knowledge.ts';
import type { Command } from '../src/log/commands.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { indexedFixture, P, POST } from './support/seats-fixture.ts';
const world = indexedFixture(), seat = seatIdFor(P('a_lead'));
function advance(start: State, until: number, commands: Record<number, Command[]> = {}) {
  let state = start;
  while (state.stateDay < until) {
    const day = state.stateDay + 1;
    const result = tick(world, state, (commands[day] ?? []).map(command => ({ day, seat, command })), { freeze: true });
    expect(result.rejections).toEqual([]);
    state = result.state;
  }
  return state;
}
it('records exact own commitment terms immediately and records expiry on the actual weekly people step', () => {
  const promised = advance(createState(world, { seed: 1 }), 1, { 1: [{ cmd: 'promise', person: P('a_bold') }] });
  const due = 1 + world.rules.people.verbs.promise.dueDays;
  expect(viewFor(world, promised, seat)).toHaveProperty('promises.0', expect.objectContaining({ person: P('a_bold'), kind: 'advancement', day: 1, dueDay: due, status: 'pending', settledDay: null, settlement: null }));
  const notYetReceived = advance(promised, 35);
  expect(viewFor(world, notYetReceived, seat).promises![0]!.status).toBe('pending');
  const expired = advance(notYetReceived, 45);
  const week = world.rules.people.verbs.weekDays, settled = Math.ceil(due / week) * week;
  expect(viewFor(world, expired, seat)).toHaveProperty('promises.0', expect.objectContaining({ status: 'expired', settledDay: settled }));
  const report = viewFor(world, expired, seat).reports.find(r => r.claims.some(c => c.kind === 'promise-broken'));
  expect(report).toBeDefined();
  expect(viewFor(world, expired, seatIdFor(P('a_gen')))).toHaveProperty('promises', []);
});
it('keeps the promise pending until the successful appointment account actually reaches the principal', () => {
  const opening = createState(world, { seed: 1 });
  const vacant = advance(opening, 6, { 1: [{ cmd: 'relieve', post: POST('a_reserve'), mode: 'outright', to: null, route: 'courier' }] });
  const promised = advance(vacant, 7, { 7: [{ cmd: 'promise', person: P('a_spy') }, { cmd: 'appoint', post: POST('a_reserve'), person: P('a_spy'), rank: null, route: 'courier' }] });
  const run = advance(promised, 12);
  const reply = knowledgeOf(run, seat).knownReports.find(r => r.knownBody.reportClaims.some(c => c.claimKind === 'promise-kept'));
  expect(reply).toBeDefined();
  expect(viewFor(world, run, seat)).toHaveProperty('promises.0', expect.objectContaining({ status: 'kept', settlement: reply!.id, settledDay: reply!.knownBody.reportDay }));
  const hidden = { ...run, knowledgeBySeat: { ...run.knowledgeBySeat, [seat]: { ...run.knowledgeBySeat[seat]!, knownReports: run.knowledgeBySeat[seat]!.knownReports.filter(r => r.id !== reply!.id) } } };
  expect(viewFor(world, hidden, seat)).toHaveProperty('promises.0.status', 'pending');
});
it('does not reconstruct promises or settlement from private promises, grievances, responses or posts, using fresh/shared caches', () => {
  const known = advance(createState(world, { seed: 1 }), 1, { 1: [{ cmd: 'promise', person: P('a_bold') }] });
  const hidden = { ...known, personPromises: {}, personGrievances: {}, personRegard: {}, orderResponses: {} };
  for (const cache of [undefined, createViewCache()]) {
    expect(Reflect.get(viewFor(world, hidden, seat, cache), 'promises')).toEqual(Reflect.get(viewFor(world, known, seat, cache), 'promises'));
  }
  expect(viewFor(world, { ...known, knowledgeBySeat: {} }, seat)).toHaveProperty('promises', []);
});
it('keeps promise evidence through ordinary report pruning and canonical save/load', () => {
  const state = advance(createState(world, { seed: 1 }), 45, { 1: [{ cmd: 'promise', person: P('a_bold') }] });
  expect(viewFor(world, state, seat).promises).toHaveLength(1);
  const pruned = pruneKnowledge(state, world.rules.templates, 500, world.map.world.rules.supplyControlPermille).state;
  const envelope = decodeSave(encodeSave({ worldHash: '0'.repeat(64), state: pruned }));
  expect(Reflect.get(viewFor(world, envelope.state as unknown as State, seat), 'promises')).toEqual(Reflect.get(viewFor(world, state, seat), 'promises'));
});

it('files an audience commitment only from the visitor reply after receipt, with no hidden preview', () => {
  const start = applyPeopleChanges(createState(world, { seed: 1 }), [{ change: 'grievance', person: P('a_gen'), kind: 'passed_over', weight: 500, against: P('a_lead'), cause: 'fixture' }], 0, world.rules.people, world.map.world.vocabularies.ranks);
  const planned = setGoal(start, POST('a_army'), { id: toId('message', 'hold'), issuer: P('a_lead'), viaChain: true, issuedDay: 0, response: 'hold:response', goal: {
    goalObjective: null, goalPosture: 'hold', goalRisk: 300, goalDeadlineDays: 20, goalRail: false, goalRiver: false, goalSea: false, goalNeutral: false, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: true,
  } }, 0);
  const knownPlan = { ...planned, knowledgeBySeat: { ...planned.knowledgeBySeat, [seat]: { ...knowledgeOf(planned, seat),
    knownSentOrders: [{ sentPost: POST('a_army'), sentMessage: toId('message', 'hold'), sentKind: 'goal' as const, sentDay: 0, sentPaper: null, sentGoal: planned.planRecords[POST('a_army')]!.planGoal }],
  } } };
  const invited = advance(knownPlan, 1, { 1: [{ cmd: 'audience', to: POST('a_army'), counters: [{ kind: 'promise_advancement', value: null, boldness: null, from: null, men: null }] }] });
  expect(viewFor(world, invited, seat).promises).toEqual([]);
  const run = advance(invited, 25);
  expect(viewFor(world, run, seat).promises).toEqual([expect.objectContaining({ person: P('a_gen'), kind: 'advancement', status: 'pending' })]);
  const reply = knowledgeOf(run, seat).knownReports.find(r => r.knownBody.reportClaims.some(c => c.claimKind === 'promise-made'))!;
  expect(reply.knownBody.reportAuthor).toBe(P('a_gen'));
  expect(reply.knownBody.reportDay).toBe(viewFor(world, run, seat).promises![0]!.day);
});
it('does not record a rejected duplicate promise and keeps a later distinct commitment separate', () => {
  const start = createState(world, { seed: 1 });
  const result = tick(world, start, [0, 1].map(() => ({ day: 1, seat, command: { cmd: 'promise' as const, person: P('a_bold') } })));
  expect(result.rejections.map(r => r.reason)).toEqual(['already_promised']);
  expect(viewFor(world, result.state, seat).promises).toHaveLength(1);
  const expired = advance(result.state, 45);
  const renewed = advance(expired, 46, { 46: [{ cmd: 'promise', person: P('a_bold') }] });
  expect(viewFor(world, renewed, seat).promises!.map(p => p.status)).toEqual(['expired', 'pending']);
});

it('does not have a killed promise recipient author an expiry letter', () => {
  const promised = advance(createState(world, { seed: 1 }), 1, { 1: [{ cmd: 'promise', person: P('a_bold') }] });
  const killed = applyPeopleChanges(promised, [{ change: 'status', person: P('a_bold'), status: 'killed' }], 2, world.rules.people, world.map.world.vocabularies.ranks);
  const run = advance(killed, 45);
  expect(run.personPromises[P('a_bold')]).toBeUndefined();
  expect(viewFor(world, run, seat).reports.filter(r => r.author === P('a_bold') && r.claims.some(c => c.kind === 'promise-broken'))).toEqual([]);
});
