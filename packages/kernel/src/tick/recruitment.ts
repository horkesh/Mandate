/**
 * Governors raise regiments on a call (lane 1.7; FOUNDATION section 12 row 1.7).
 *
 * - **The call is an order through people.** The principal calls a governor's post for regiments with a term; it
 *   travels as any order does (relays read it on the pack's call terms) and the governor answers it by his own
 *   compliance on those terms, which name the values a call honours and offends (pack data; 0074's `state_autonomy`).
 *   His rung sets the share of the quota he raises and the days he adds before they muster (pack rules); the loyalty of
 *   his region to his side scales the share. An objection or a refusal raises nothing and goes back as a memorandum.
 *   `proxy` records his response; `command` holds his levy until it musters.
 * - **One recruitment proposal makes each block, applied in one phase** (here): `forces` creates it, `movement` places
 *   it at the governor's region, `command` assigns it to his post. Its id derives from its content (the post and the
 *   muster day). Each owner writes only its own field.
 * - **Enlistments run out**: on the day a block's term ends the same proposal in reverse disbands it.
 *
 * There is no `men` stock in `economy` in 1A (that is 1B): a regiment goes straight from the governor into a block.
 */
import { sideOfPerson } from '../command/command.ts';
import { leviesDue, musterAssignments, recordLevy, type Levy } from '../command/levies.ts';
import { openBattleIn } from '../combat/records.ts';
import { shareOf } from '../control/control.ts';
import type { WorldIndex } from '../world/index.ts';
import { applyMusters, enlistmentsEnding, type MusterDelta } from '../forces/enlistment.ts';
import { toId, type FactionId, type ForceBlockId, type PostId, type RegionId, type SeatId } from '../ids.ts';
import type { CallCommand } from '../log/commands.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { placeAndRemove, type MusterPlacement } from '../movement/movement.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { term } from '../knowledge/truth.ts';
import { answerOrder } from '../reading/orders.ts';
import { callTerms, type RecruitmentRules } from '../recruitment/rules.ts';
import { loyaltyOf } from '../regions/regions.ts';
import type { State } from '../root-state.ts';
import { postFaction } from '../seats/posts.ts';
import { fire, oversightOf, sendReport, type RejectionReason, type TickContext } from './context.ts';
import { answerBody, dispatchOrder } from './orders.ts';

/** Every mechanic recruitment counts (FOUNDATION section 11.5). */
export const RECRUITMENT_MECHANICS = ['recruitment.called', 'recruitment.answered', 'recruitment.slow_walked', 'recruitment.refused', 'recruitment.mustered', 'recruitment.men', 'recruitment.muster_blocked', 'recruitment.lapsed', 'recruitment.disbanded'] as const;

/** Whether a post answers a call: a raising kind, held, with a seat region, of a department that is not self-governing (SENSITIVE-HISTORY 3.7: no seat recruits a nation). */
function raisingPost(ctx: TickContext, state: State, post: PostId): boolean {
  const p = state.postStates[post]!;
  const rules = ctx.world.map.world.rules.recruitment;
  const dept = ctx.world.map.world.departments.find((d) => d.id === p.postDepartment);
  const kind = ctx.world.map.world.vocabularies.departmentKinds.find((k) => k.id === dept?.kind);
  return rules.raisingPostKinds.includes(p.postKind) && p.postSeat !== null && kind?.selfGoverning !== true;
}

/** Validate and send a call. Returns the reason for a rejection, or null when it is on its way. Only a principal calls. */
export function issueCall(ctx: TickContext, state: State, seat: SeatId, cmd: CallCommand): RejectionReason | null {
  const { world } = ctx;
  const assignment = state.seatAssignments[seat];
  if (assignment === undefined) return 'unknown_seat';
  const issuer = world.person(assignment.seatPerson);
  const side = sideOfPerson(world.map, state, issuer.id);
  if (side === null || !world.factionIds.includes(side) || world.faction(side).principal !== issuer.id) return 'not_a_principal';
  if (state.postStates[cmd.to] === undefined) return 'unknown_post';
  // A call is a requisition, answered by the governor's own compliance (0065: a government's side is State): it may go to
  // a governor of the calling side or of a neutral government (the April 1861 call went to every state), never the other side's.
  const targetSide = postFaction(world, state, cmd.to);
  if (targetSide !== side && targetSide !== null) return 'other_side';
  if (!raisingPost(ctx, state, cmd.to)) return 'not_raising_post';
  if (state.postStates[cmd.to]!.postHolder === null) return 'vacant_post';
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';
  if (cmd.termDays > world.map.world.rules.recruitment.maxTermDays) return 'bad_call';
  dispatchOrder(ctx, state, seat, issuer.id, cmd.to, cmd.route, cmd.bypass, { orderKind: 'call', orderGoal: null, orderEdit: null, orderCall: { callRegiments: cmd.regiments, callTermDays: cmd.termDays } });
  fire(ctx, 'recruitment.called');
  return null;
}

/** The share of a call a rung raises, scaled by his region's loyalty to his side (pack rules), in whole regiments. */
export function regimentsRaised(rules: RecruitmentRules, asked: number, rung: string, loyalty: number | null): { readonly regiments: number; readonly delayDays: number; readonly loyaltyPermille: number } | null {
  const row = rules.rungs.find((r) => r.rung === rung);
  if (row === undefined) return null;
  const factor = rules.loyaltyWeight === 0 || loyalty === null ? 1000 : 1000 - rules.loyaltyWeight + Math.trunc((rules.loyaltyWeight * Math.min(loyalty, rules.loyaltyFull)) / rules.loyaltyFull);
  const regiments = Math.trunc((Math.trunc((asked * row.sharePermille) / 1000) * factor) / 1000);
  return { regiments, delayDays: row.delayDays, loyaltyPermille: factor };
}

/**
 * A call reaches the governor: he answers by his own compliance on the pack's call terms; `proxy` records it. A rung
 * that raises men leaves a levy on his post (`command`) to muster after the pack's days and his own delay; an objection
 * or a refusal raises none. Either way his answer goes back to the caller: the regiments he says he will raise, and
 * the rung he declares (his actual rung is the truth behind the report).
 */
export function arriveCall(ctx: TickContext, start: State, msg: TransitMessage): State {
  const { world, day } = ctx;
  const order = msg.msgOrder!;
  const call = order.orderCall!;
  const post = msg.msgToPost!;
  const governor = msg.msgTo;
  const rules = world.map.world.rules.recruitment;
  // He answers watched from where he stands (lane 1.4's oversight: his courier days from the caller, and the wire).
  const answer = answerOrder(world, start, governor, order.orderIssuer, callTerms(rules), { oversight: oversightOf(ctx, start, governor, order.orderIssuer).value });
  let state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: governor, post, role: 'addressee', day, kind: 'call' }));
  const side = postFaction(world, state, post);
  const region = state.postStates[post]!.postSeat;
  const loyalty = side === null || region === null ? null : loyaltyOf(state, region, side);
  const actual = regimentsRaised(rules, call.callRegiments, answer.actual, loyalty);
  const declared = regimentsRaised(rules, call.callRegiments, answer.declared, loyalty);
  if (actual === null || actual.regiments === 0) fire(ctx, 'recruitment.refused');
  else {
    state = recordLevy(state, {
      levyPost: post,
      levyGovernor: governor,
      levyIssuer: order.orderIssuer,
      levyCall: msg.msgOrigin,
      levyRegiments: actual.regiments,
      levyMen: actual.regiments * rules.menPerRegiment,
      levyTermDays: call.callTermDays,
      levyMusterDay: day + rules.musterDays + actual.delayDays,
      levyResponse: responseKey(msg.msgOrigin, governor),
    });
    fire(ctx, 'recruitment.answered');
    if (actual.delayDays > 0) fire(ctx, 'recruitment.slow_walked');
  }
  const objects = declared === null;
  sendReport(ctx, state, {
    body: answerBody(governor, post, day, {
      reportType: objects ? 'advice' : 'wire-dispatch',
      reportSubtype: objects ? 'memorandum' : null,
      reportClaims: [{ claimKind: 'call-answer', claimRegion: region, claimValue: declared?.regiments ?? 0, claimToken: answer.declared, claimConfidence: 1000 }],
      reportAdvice: objects ? { adviceRecommends: 'withdraw-order', adviceReasons: answer.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: 1000 })), adviceConfidence: 800 } : null,
      answers: msg.msgOrigin,
      about: post,
    }),
    truth: {
      truthTerms: [
        term('call_rung', answer.willingness + 0, { person: governor, post, rule: answer.actual }),
        term('call_loyalty', (actual?.loyaltyPermille ?? 0) + 0, { person: governor, post, rule: loyalty === null ? 'no_loyalty_recorded' : 'region_loyalty' }),
      ],
      truthTrimmed: [],
    },
    to: order.orderIssuer,
    tag: `call-answer.${post}`,
  });
  return state;
}

/** Whether the enemy holds `region` against `side`: another faction's control share there is greater than its own. */
function enemyHeld(map: WorldIndex, state: State, region: RegionId, side: FactionId): boolean {
  const own = shareOf(map, state.regionControl, region, side);
  return Object.keys(state.regionControl[region] ?? {}).some((f) => f !== side && shareOf(map, state.regionControl, region, f as FactionId) > own);
}

/** Whether a block stands in a region whose open battle names it. */
export function inOpenBattle(state: State, block: ForceBlockId): boolean {
  const loc = state.forceLocations[block];
  if (loc === undefined) return false;
  const id = openBattleIn(state, loc.locRegion);
  if (id === null) return false;
  return state.battleRecords[id]!.battleDays.some((d) => d.bdaySides.some((s) => s.bsideBlocks.includes(block)));
}

/** A levy lapsed: the governor tells the man who called it, with the typed reason (its region in enemy hands past the pack's days). */
function reportLapse(ctx: TickContext, state: State, levy: Levy): void {
  fire(ctx, 'recruitment.lapsed');
  const region = state.postStates[levy.levyPost]!.postSeat;
  sendReport(ctx, state, {
    body: answerBody(levy.levyGovernor, levy.levyPost, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'levy-lapsed', claimRegion: region, claimValue: levy.levyRegiments, claimToken: 'region_enemy_held', claimConfidence: 1000 }],
      reportAdvice: null,
      answers: levy.levyCall,
      about: levy.levyPost,
    }),
    truth: { truthTerms: [term('levy_lapsed', ctx.day - levy.levyMusterDay, { person: levy.levyGovernor, post: levy.levyPost, rule: 'region_enemy_held' })], truthTrimmed: [] },
    to: levy.levyIssuer,
    tag: `levy-lapsed.${levy.levyPost}`,
  });
}

/** A new block's id, from its content: the governor's post and the muster day (and an ordinal if two muster at once). */
function raisedBlockId(state: State, post: PostId, day: number, taken: ReadonlySet<string>): ForceBlockId {
  const base = `raised.${post}.d${day}`;
  let id = base;
  for (let n = 2; Object.prototype.hasOwnProperty.call(state.forceBlockStates, id) || taken.has(id); n++) id = `${base}.${n}`;
  return toId('forceBlock', id);
}

/**
 * The day's musters and disbandings: one recruitment proposal for each block, applied in one phase. `forces` creates or
 * disbands it, `movement` places or removes it, `command` assigns it to its governor's post or takes the assignment away.
 */
export function recruitmentPhase(ctx: TickContext, start: State): State {
  const { world, day } = ctx;
  const rules = world.map.world.rules.recruitment;
  // A levy whose region the enemy holds does not muster there: it waits, re-checked each day, and lapses past the pack's days.
  const blocked = (key: string) => {
    const levy = start.postLevies[key]!;
    const side = postFaction(world, start, levy.levyPost);
    // A neutral government's levy musters in its own region (its block serves no side until the government joins one).
    return side !== null && enemyHeld(world.map, start, start.postStates[levy.levyPost]!.postSeat!, side);
  };
  const dueAll = leviesDue(start, day);
  const due = dueAll.filter((k) => !blocked(k));
  const lapsed = dueAll.filter((k) => blocked(k) && day - start.postLevies[k]!.levyMusterDay >= rules.musterBlockedDays);
  for (const k of dueAll) if (!due.includes(k) && !lapsed.includes(k)) fire(ctx, 'recruitment.muster_blocked');
  for (const k of lapsed) reportLapse(ctx, start, start.postLevies[k]!);
  // A block in a battle still open in its region keeps its men until the battle closes: the record never loses a participant mid-fight.
  const ending = enlistmentsEnding(start, day).filter((b) => !inOpenBattle(start, b));
  if (due.length === 0 && ending.length === 0 && lapsed.length === 0) return start;
  const deltas: MusterDelta[] = [];
  const placements: MusterPlacement[] = [];
  const assign: { block: ForceBlockId; post: PostId }[] = [];
  const taken = new Set<string>();
  for (const key of due) {
    const levy = start.postLevies[key]!;
    const p = start.postStates[levy.levyPost]!;
    const block = raisedBlockId(start, levy.levyPost, day, taken);
    taken.add(block);
    deltas.push({
      change: 'create',
      cause: 'recruitment',
      create: {
        block,
        name: `raised.${levy.levyPost}`,
        department: p.postDepartment,
        arm: rules.arm,
        strength: levy.levyMen,
        storesDays: rules.storesDays,
        enlistment: { enlPost: levy.levyPost, enlRaisedBy: levy.levyGovernor, enlCall: levy.levyCall, enlRegiments: levy.levyRegiments, enlMusterDay: day, enlEndsDay: day + levy.levyTermDays },
      },
    });
    placements.push({ block, region: p.postSeat!, day });
    assign.push({ block, post: levy.levyPost });
    fire(ctx, 'recruitment.mustered');
    fire(ctx, 'recruitment.men', levy.levyMen);
  }
  for (const block of ending) deltas.push({ change: 'disband', block, cause: 'recruitment' });
  const forces = applyMusters(world.map, start, deltas);
  for (const _ of forces.disbanded) fire(ctx, 'recruitment.disbanded');
  const moved = placeAndRemove(world.map, forces.state, placements, forces.disbanded);
  return musterAssignments(moved, [...due, ...lapsed], assign, forces.disbanded);
}
