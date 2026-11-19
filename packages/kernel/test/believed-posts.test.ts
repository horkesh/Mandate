import { describe, expect, it } from 'vitest';
import type { State } from '../src/root-state.ts';
import { believedHolder } from '../src/seats/believed.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import { createTelemetry } from '../src/telemetry.ts';
import { tick, TICK_MECHANICS, type TickResult } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import type { PostStart } from '../src/world/scenario.ts';
import { worldOf } from './support/tick-context.ts';
import { B, block, DEP, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { ctxFor } from './support/tick-context.ts';
import { applyVerb, arriveVerb } from '../src/tick/verbs.ts';
import type { VerbCommand } from '../src/log/commands.ts';
import { commanderLossReports } from '../src/tick/commander-losses.ts';
import { relieveHolder } from '../src/command/command.ts';
import { applyPeopleChanges } from '../src/people/people.ts';
import { attentionPrice } from '../src/tick/attention.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { depot, edge, F, FIXTURE_COMBAT_RULES, R, region } from './support/map-fixture.ts';

/**
 * Posts as the principal believes them (lane 1.12; the lead's ruling on the standing review of lane 1.13, item 2, under
 * 0052 and 0027). A battle captures b's commander in a trapped garrison (the combat fixture's ground: b2 is a's, so b in
 * mid has nowhere to go); his post keeps a reserve block in b1, so it is still a field post. b's principal learns of the
 * capture only from the `commander-lost` report: until it reaches him his menu shows the post held by the man he lost,
 * an order he sends it is accepted and comes back undelivered, and no vacancy is offered to fill.
 */
const MAP = (() => {
  const base = forcesWorld({
    regions: ['a1', 'a2', 'mid', 'b2', 'b1', 'n', 'u'].map((r) => region(r)),
    edges: [edge('a1', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b1', { type: 'rail', line: 'b_line' }), edge('mid', 'n'), edge('mid', 'u')],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1')],
    people: [person('a_lead', 'a'), person('a_gen', 'a'), person('b_lead', 'b'), person('b_gen', 'b'), person('b_spare', 'b'), person('b_other', 'b')],
  });
  return indexWorld({ ...base, rules: { ...base.rules, combat: FIXTURE_COMBAT_RULES } });
})();
const TRAPPED = { a1: { a: 1000 }, a2: { a: 1000 }, mid: { a: 1000 }, b2: { a: 1000 }, b1: { b: 1000 } };
const POSTS: readonly PostStart[] = [post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('a2') }), post('b_army', { department: 'b_war', holder: PER('b_gen'), region: R('b1') }), post('b_other', { department: 'b_war', holder: PER('b_other'), region: R('b1') })];
const GOVERNMENTS = [
  { region: R('n'), department: DEP('neutral_gov'), provenance: [] },
  { region: R('u'), department: 'unknown' as const, provenance: [] },
];
const START = forcesStart(TRAPPED, POSTS, [block('a_1', { department: 'a_war', region: 'mid', strength: 8000, post: P('a_army') }), block('b_gar', { department: 'b_war', region: 'mid', strength: 600, post: P('b_army') }), block('b_res', { department: 'b_war', region: 'b1', strength: 3000, post: P('b_army') })], { governments: GOVERNMENTS });
const world = worldOf(MAP, {
  ...START,
  factions: [
    { faction: F('a'), principal: PER('a_lead'), capital: R('a1'), playable: true },
    { faction: F('b'), principal: PER('b_lead'), capital: R('b1'), playable: true },
  ],
});
const ARMY = P('b_army');
const B_LEAD = PER('b_lead');
const B_SEAT = seatIdFor(B_LEAD);

function start(): State {
  const s = createState(world, { seed: 1 });
  return { ...s, forceLocations: { ...s.forceLocations, [B('a_1')]: { ...s.forceLocations[B('a_1')]!, locSinceDay: 1 } } };
}

/** Play until the garrison's commander is taken; the state the next morning, and the telemetry. */
function untilCaptured() {
  const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
  let s = start();
  for (let i = 0; i < 6 && s.postStates[ARMY]!.postHolder !== null; i++) s = tick(world, s, [], { telemetry }).state;
  return { state: s, telemetry };
}
const menuOf = (s: State) => principalMenu(world, s, F('b'), morningGround(world, s, s.stateDay + 1));
const lossKnown = (s: State) => knowledgeOf(s, B_SEAT).knownReports.some((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'commander-lost'));

describe('posts as the principal believes them (lane 1.12; 0052)', () => {
  it('an unreported capture changes neither the audience answer nor the attention charged', () => {
    const { state: captured } = untilCaptured();
    const holder = PER('b_gen');
    // Hold the undelivered traffic fixed: only the holder/status truth differs.
    const present: State = {
      ...captured,
      postStates: { ...captured.postStates, [ARMY]: { ...captured.postStates[ARMY]!, postHolder: holder } },
      personStatus: { ...captured.personStatus, [holder]: { ...captured.personStatus[holder]!, statusKind: 'serving' } },
    };
    expect(lossKnown(captured)).toBe(false);
    expect(knowledgeOf(present, B_SEAT)).toEqual(knowledgeOf(captured, B_SEAT));
    for (const state of [present, captured]) {
      expect(believedHolder(state, B_LEAD, ARMY)).toBe(holder);
      expect(state.planRecords[ARMY]).toBeUndefined();
    }
    const command: VerbCommand = { cmd: 'audience', to: ARMY, counters: [] };
    const issue = (state: State) => tick(world, state, [{ day: state.stateDay + 1, seat: B_SEAT, command }], { freeze: true });
    const held = issue(present);
    const lost = issue(captured);
    expect(held.rejections).toEqual(lost.rejections);
    expect(held.rejections).toEqual([]);
    expect(held.state.seatAttention[B_SEAT]).toEqual(lost.state.seatAttention[B_SEAT]);
    expect(present.seatAttention[B_SEAT]!.attnLeft - held.state.seatAttention[B_SEAT]!.attnLeft).toBe(attentionPrice(world, present, command));
    expect(attentionPrice(world, present, command)).toBeGreaterThan(0);
  });

  it('reads a loss report without needing a battle record', () => {
    const { state } = untilCaptured();
    const withoutBattle = { ...state, battleRecords: {} };
    expect(believedHolder(withoutBattle, B_LEAD, ARMY)).toBe(PER('b_gen'));
  });

  it('a capture from any other phase is reported by the shared path, and belief survives a filter hop', () => {
    const before = start();
    const state = relieveHolder(applyPeopleChanges(before, [{ change: 'status', person: PER('b_gen'), status: 'captured' }], 1, world.rules.people, world.map.world.vocabularies.ranks), ARMY);
    const ctx = ctxFor(world, state, 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    commanderLossReports(ctx, before, state);
    expect(ctx.outbox).toHaveLength(1);
    const report = ctx.outbox[0]!;
    const filtered = { ...report, msgTo: PER('b_other'), msgRole: 'filter' as const, msgPending: [{ hopPerson: B_LEAD, hopPost: null, hopRole: 'addressee' as const }] };
    expect(believedHolder(sendMessages(state, [filtered]), B_LEAD, ARMY)).toBe(PER('b_gen'));
  });

  const verbs: readonly VerbCommand[] = [
    { cmd: 'inquire', to: ARMY, subject: null, route: 'courier' },
    { cmd: 'transfer', from: ARMY, to: P('b_other'), force: 'blocks', amount: 1, route: 'courier' },
    { cmd: 'relieve', post: ARMY, mode: 'outright', to: null, route: 'courier' },
    { cmd: 'audience', to: ARMY, counters: [] },
    { cmd: 'observer', to: ARMY, person: PER('b_spare'), route: 'courier' },
  ];
  it.each(verbs)('$cmd accepts a believed holder, then returns undelivered without answering or applying effects', (command) => {
    const { state } = untilCaptured();
    const ctx = ctxFor(world, state, state.stateDay + 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    const sent = applyVerb(ctx, state, B_SEAT, command);
    expect(sent.reason).toBeNull();
    expect(sent.state).toBe(state);
    const message = ctx.outbox.splice(0)[0]!;
    expect(message).toBeDefined();
    const arrived = arriveVerb({ ...ctx, day: message.msgArriveDay }, state, message);
    expect(arrived).toBe(state);
    const returned = ctx.outbox.find((m) => m.msgReport?.reportAnswers === message.msgOrigin)!;
    expect(returned.msgReport?.reportSubjectId).toBe(ARMY);
    expect(returned.msgReport?.reportClaims).toContainEqual(expect.objectContaining({ claimKind: 'order-returned', claimToken: 'vacant_post' }));
    // A new holder also cannot answer a letter addressed to the lost man.
    const changed = { ...state, postStates: { ...state.postStates, [ARMY]: { ...state.postStates[ARMY]!, postHolder: PER('b_spare') } } };
    ctx.outbox.splice(0);
    expect(arriveVerb({ ...ctx, day: message.msgArriveDay }, changed, message)).toBe(changed);
    expect(ctx.outbox[0]?.msgReport?.reportClaims[0]?.claimToken).toBe('holder_changed');
  });

  it.each(verbs)('$cmd is refused once the principal has learned the post is vacant', (command) => {
    let { state } = untilCaptured();
    for (let d = 0; d < 30 && !lossKnown(state); d++) state = tick(world, state, []).state;
    expect(lossKnown(state)).toBe(true);
    const ctx = ctxFor(world, state, state.stateDay + 1, [...TICK_MECHANICS, ...MAP_MECHANICS]);
    expect(applyVerb(ctx, state, B_SEAT, command).reason).toBe(command.cmd === 'audience' || command.cmd === 'observer' ? 'unknown_post' : 'vacant_post');
    expect(ctx.outbox).toEqual([]);
  });
  it('a captured commander’s post stays on the menu, held by him, until the report of the capture arrives; then it is a vacancy', () => {
    const { state, telemetry } = untilCaptured();
    expect(state.postStates[ARMY]!.postHolder).toBeNull();
    expect(state.personStatus[PER('b_gen')]?.statusKind).toBe('captured');
    expect(telemetry.mechanics['reports.commander_lost']!.fires).toBe(1);
    // The next morning: the report is on its way; he still believes b_gen holds the post.
    expect(lossKnown(state)).toBe(false);
    expect(believedHolder(state, B_LEAD, ARMY)).toBe(PER('b_gen'));
    const before = menuOf(state);
    expect(before.commandable.find((c) => c.post === ARMY)?.holder).toBe(PER('b_gen'));
    expect(before.vacancies).toEqual([]);
    // Day by day until the report is in his hands: from that morning the post is a vacancy, off the commandable list.
    let s = state;
    for (let i = 0; i < 30 && !lossKnown(s); i++) {
      expect(menuOf(s).vacancies).toEqual([]);
      s = tick(world, s, []).state;
    }
    expect(lossKnown(s)).toBe(true);
    const after = menuOf(s);
    expect(after.commandable.some((c) => c.post === ARMY)).toBe(false);
    expect(after.vacancies.map((v) => v.post)).toEqual([ARMY]);
    // The reappointment waits for it: his candidates were there all along, but nothing was vacant to fill until now.
    expect(before.candidates.some((c) => c.person === PER('b_spare'))).toBe(true);
  });

  it('an order sent before the report arrives is accepted, and bounces on arrival as a returned dispatch, typed', () => {
    const { state } = untilCaptured();
    const day = state.stateDay + 1;
    const goal = { ...world.map.world.rules.plans.goalDefaults, objective: R('b1'), posture: 'hold' as const, committed: [] };
    const telemetry = createTelemetry([...TICK_MECHANICS, ...MAP_MECHANICS]);
    const sent = tick(world, state, [{ day, seat: B_SEAT, command: { cmd: 'order', to: ARMY, goal, route: 'courier', bypass: false } }], { telemetry });
    expect(sent.rejections).toEqual([]);
    let s: State = sent.state;
    const results: TickResult[] = [];
    const returned = (x: State) => knowledgeOf(x, B_SEAT).knownReports.find((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'order-returned'));
    for (let i = 0; i < 30 && returned(s) === undefined; i++) {
      const r = tick(world, s, [], { telemetry });
      results.push(r);
      s = r.state;
    }
    const report = returned(s)!;
    expect(report.knownBody.reportSubjectId).toBe(ARMY);
    expect(report.knownBody.reportClaims.find((c) => c.claimKind === 'order-returned')!.claimToken).toBe('vacant_post');
    expect(telemetry.mechanics['orders.returned']!.fires).toBe(1);
    // Nobody answered it: no goal was set on the post.
    expect(s.planRecords[ARMY]).toBeUndefined();
    // Positive control: once he knows the post vacant (the report of the capture may come after the returned dispatch,
    // from farther off), an order to it is refused at once.
    for (let i = 0; i < 30 && !lossKnown(s); i++) s = tick(world, s, []).state;
    expect(lossKnown(s)).toBe(true);
    const known = tick(world, s, [{ day: s.stateDay + 1, seat: B_SEAT, command: { cmd: 'order', to: ARMY, goal, route: 'courier', bypass: false } }]);
    expect(known.rejections.map((r) => r.reason)).toEqual(['vacant_post']);
  });

  it('nothing changes for a post that never lost its holder (positive control)', () => {
    const s = start();
    expect(believedHolder(s, B_LEAD, ARMY)).toBe(PER('b_gen'));
    expect(menuOf(s).commandable.find((c) => c.post === ARMY)?.holder).toBe(PER('b_gen'));
    expect(menuOf(s).vacancies).toEqual([]);
  });
});
