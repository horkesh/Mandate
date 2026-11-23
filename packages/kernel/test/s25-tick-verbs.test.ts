import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { setGoal } from '../src/plans/plans.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { goalOf } from '../src/tick/orders.ts';
import { applyVerb, arriveVerb } from '../src/tick/verbs.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { report, claim, fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { goalTerms } from './support/test-seats.ts';

it('S25 tick-verbs-01/09: an audience is available at the exact cooldown on issue and receipt', () => {
  const { world, state: initial, seat } = fresh();
  const holder = P('a_gen'), post = POST('a_army');
  const cooldown = world.rules.people.verbs.audience.cooldownDays;
  const set = setGoal(initial, post, { id: toId('message', 's25.audience-goal'), issuer: P('a_lead'),
    goal: goalOf(goalTerms('hold', null)), viaChain: true, issuedDay: 1, response: 's25.answer' }, 1);
  const copy = {sentPost:post,sentMessage:toId('message','s25.audience-goal'),sentKind:'goal' as const,sentDay:1,sentPaper:null,sentGoal:set.planRecords[post]!.planGoal};
  const state = { ...set, knowledgeBySeat:{...set.knowledgeBySeat,[seat]:{...knowledgeOf(set,seat),knownSentOrders:[copy]}}, stateDay: cooldown, audienceHeld: { [holder]: { audDay: 1, audAbout: 'during' as const, audCounters: [] } } };
  const issue = ctxFor(world, state, cooldown + 1, TICK_MECHANICS);
  expect(applyVerb(issue, state, seat, { cmd: 'audience', to: post, counters: [] }).reason).toBeNull();
  const letter = issue.outbox[0]!;
  expect(letter.msgVerb?.verbKind).toBe('audience');
  const arrived = { ...state, stateDay: letter.msgArriveDay - 1,
    audienceHeld: { [holder]: { audDay: letter.msgArriveDay - cooldown, audAbout: 'during' as const, audCounters: [] } } };
  const receipt = ctxFor(world, arrived, letter.msgArriveDay, TICK_MECHANICS);
  expect(arriveVerb(receipt, arrived, letter).audienceHeld[holder]!.audDay).toBe(letter.msgArriveDay);
  expect(receipt.outbox.flatMap(m => m.msgReport?.reportClaims ?? []).some(c => c.claimToken?.startsWith('audience:too_soon'))).toBe(false);
});

it('S25 tick-verbs-05: an inquiry exactly one week old no longer uses his free allowance', () => {
  const { world, state: initial, seat } = fresh();
  const state = { ...initial, stateDay: 19 };
  const issue = ctxFor(world, state, 20, TICK_MECHANICS);
  expect(applyVerb(issue, state, seat, { cmd: 'inquire', to: POST('a_army'), subject: null, route: 'courier' }).reason).toBeNull();
  const letter = issue.outbox[0]!, day = letter.msgArriveDay;
  const held = { ...state, stateDay: day - 1, personInquiries: { [P('a_gen')]: [day - world.rules.people.verbs.weekDays, day - 1] } };
  const next = arriveVerb(ctxFor(world, held, day, TICK_MECHANICS), held, letter);
  expect(next.personInquiries[P('a_gen')]).toEqual([day - 1, day]);
  expect((next.personGrievances[P('a_gen')] ?? []).filter(g => g.grievanceKind === 'pestered')).toEqual([]);
});

it('S25 tick-verbs-explicit: the verb API refuses an unknown seat without sending or changing anything', () => {
  const { world, state } = fresh();
  const ctx = ctxFor(world, state, 1, TICK_MECHANICS);
  const result = applyVerb(ctx, state, toId('seat', 'seat:absent'), { cmd: 'promise', person: P('a_gen') });
  expect(result).toEqual({ state, reason: 'not_a_principal' });
  expect(result.state).toBe(state);
  expect(ctx.outbox).toEqual([]);
});

it('S25 tick-verbs-10: a received appointment dates its rank by the campaign calendar', () => {
  const { world: base, seat } = fresh();
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, vocabularies: { ...base.map.world.vocabularies,
    ranks: [{ id: 'field_general', name: 'rank.general', seniority: 1, kind: 'regular' }], rankKinds: [{ id: 'regular', name: 'rank.regular' }] } }), base.start);
  const initial = createState(world, { seed: 17 });
  const vacant = { ...initial, stateDay: 2, postStates: { ...initial.postStates,
    [POST('a_reserve')]: { ...initial.postStates[POST('a_reserve')]!, postHolder: null } } };
  const state=deliverReport(vacant,seat,report('m.vacancy.rank',{reportAuthor:P('a_sec'),reportSubjectKind:'post',reportSubjectId:'a_reserve',reportDay:2,reportClaims:[claim('commander-lost',1,'captured')]},2),NO_TRUTH);
  const issue = ctxFor(world, state, 3, TICK_MECHANICS);
  expect(applyVerb(issue, state, seat, { cmd: 'appoint', post: POST('a_reserve'), person: P('a_spy'), rank: 'field_general', route: 'courier' }).reason).toBeNull();
  const letter = issue.outbox[0]!;
  const receipt = ctxFor(world, state, letter.msgArriveDay, TICK_MECHANICS);
  const next = arriveVerb(receipt, state, letter);
  expect(next.postStates[POST('a_reserve')]!.postHolder).toBe(P('a_spy'));
  expect(next.personRanks[P('a_spy')]!.regular).toEqual({ rankTerm: 'field_general', rankSince: '1900-06-04' });
});
