import { enlistmentsOf } from '../forces/enlistment.ts';
import { forceTotals } from '../forces/lots.ts';
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
import { leviesDue, musterAssignments, recordLevy, type Levy } from '../command/levies.ts';
import { openBattleIn, unresolvedContact } from '../combat/records.ts';
import { shareOf } from '../control/control.ts';
import type { WorldIndex } from '../world/index.ts';
import { applyMusters, enlistmentsEnding, type MusterDelta } from '../forces/enlistment.ts';
import { toId, type FactionId, type ForceBlockId, type PostId, type RegionId, type SeatId } from '../ids.ts';
import type { CallCommand } from '../log/commands.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { placeAndRemove, type MusterPlacement } from '../movement/movement.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { reportQualificationOf } from '../knowledge/report.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { hasRequiredPapers } from '../knowledge/papers.ts';
import { term } from '../knowledge/truth.ts';
import { answerOrder } from '../reading/orders.ts';
import { callDirective, type RecruitmentRules } from '../recruitment/rules.ts';
import { renewableBlock } from '../recruitment/renewal.ts';
import { loyaltyOf } from '../regions/regions.ts';
import type { State } from '../root-state.ts';
import { senderFor } from '../seats/sender.ts';
import { postFaction } from '../seats/posts.ts';
import { fire, oversightOf, sendReport, type RejectionReason, type TickContext } from './context.ts';
import { answerBody, dispatchOrder, returnDispatch } from './orders.ts';

/** Every mechanic recruitment counts (FOUNDATION section 11.5). */
export const RECRUITMENT_MECHANICS = ['recruitment.called', 'recruitment.answered', 'recruitment.slow_walked', 'recruitment.refused', 'recruitment.mustered', 'recruitment.men', 'recruitment.muster_blocked', 'recruitment.lapsed', 'recruitment.disbanded', 'recruitment.renewed'] as const;

/** Whether a post answers a call: a raising kind, held, with a seat region, of a department that is not self-governing (SENSITIVE-HISTORY 3.7: no seat recruits a nation). */
function raisingPost(ctx: TickContext, state: State, post: PostId): boolean {
  const p = state.postStates[post]!;
  const rules = ctx.world.map.world.rules.recruitment;
  const dept = ctx.world.map.world.departments.find((d) => d.id === p.postDepartment);
  const kind = ctx.world.map.world.vocabularies.departmentKinds.find((k) => k.id === dept?.kind);
  return rules.raisingPostKinds.includes(p.postKind) && p.postSeat !== null && kind?.selfGoverning !== true;
}

/** Validate and send a call. Returns the reason for a rejection, or null when it is on its way. Only a principal calls. */
export function issueCall(ctx: TickContext, state: State, seat: SeatId, cmd: CallCommand, requisition = false): RejectionReason | null {
  const { world } = ctx;
  const assignment = state.seatAssignments[seat];
  if (assignment === undefined) return 'unknown_seat';
  const sender = senderFor(world, state, seat, requisition ? cmd.to : undefined, ctx.senderViews);
  if (sender === null) return 'not_a_principal';
  const issuer = { id: sender.principal };
  const target = sender.definition(cmd.to);
  if (!sender.known(cmd.to) || target === undefined) {
    const declared = sender.declaredSide(cmd.to);
    return declared != null && declared !== sender.faction ? 'other_side' : 'unknown_post';
  }
  const targetSide = sender.side(cmd.to);
  if (targetSide !== sender.faction && targetSide !== null) return 'other_side';
  const dept = world.map.world.departments.find(d => d.id === target.department);
  const kind = world.map.world.vocabularies.departmentKinds.find(k => k.id === dept?.kind);
  if (!world.map.world.rules.recruitment.raisingPostKinds.includes(target.kind) || target.region === null || kind?.selfGoverning === true) return 'not_raising_post';
  if (sender.holder(cmd.to) === null && (!requisition || sender.posts.get(cmd.to)?.status === 'vacant')) return 'vacant_post';
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';
  if (cmd.termDays !== null && cmd.termDays > world.map.world.rules.recruitment.maxTermDays) return 'bad_call';
  if (cmd.arm !== undefined && !world.map.world.vocabularies.arms.some(a => a.id === cmd.arm && !a.naval)) return 'bad_call';
  const rules = world.map.world.rules.recruitment;
  const declared = cmd.callId === undefined ? undefined : world.map.world.rules.ruleSeats.principals.flatMap(p => p.calls).find(c => c.id === cmd.callId);
  const registered = declared?.termsId;
  if (declared?.requiresPapers !== undefined) {
    const own = world.map.world.rules.ruleSeats.principals.find(p => p.faction === sender.faction);
    if (declared.post !== cmd.to || !own?.calls.includes(declared) ||
      !hasRequiredPapers(declared.requiresPapers, knowledgeOf(state, seat), state.stateDay, world.rules.templates)) return 'bad_call';
  }
  if (registered !== undefined && cmd.termsId !== undefined && registered !== cmd.termsId) return 'bad_call';
  const termsId = cmd.termsId ?? registered;
  const profile = termsId === undefined ? undefined : rules.callProfiles?.find(p => p.id === termsId);
  if (termsId !== undefined && profile === undefined) return 'bad_call';
  dispatchOrder(ctx, state, seat, issuer.id, cmd.to, cmd.route, cmd.bypass, { orderKind: 'call', orderGoal: null, orderEdit: null, orderCall: { ...(profile === undefined ? {} : { callProfile: profile }), callRegiments: cmd.regiments, callTermDays: cmd.termDays, ...(cmd.men === undefined ? {} : { callMen: cmd.men }), ...(cmd.callId === undefined ? {} : { callId: cmd.callId }), ...(cmd.arm === undefined ? {} : { callArm: cmd.arm }), ...(cmd.readiness === undefined ? {} : { callReadiness: cmd.readiness }) } }, requisition ? cmd.to : undefined);
  fire(ctx, 'recruitment.called');
  return null;
}

/** The share of a call a rung raises, scaled by his region's loyalty to his side (pack rules), in whole regiments. */
export function regimentsRaised(rules: RecruitmentRules, asked: number | null, rung: string, loyalty: number | null, askedMen?: number | null): { readonly regiments: number | null; readonly men: number | null; readonly delayDays: number; readonly loyaltyPermille: number } | null {
  const executionRung = rung === 'comply_with_reservations' ? 'comply' : rung;
  const row = rules.rungs.find((r) => r.rung === executionRung);
  if (row === undefined) return null;
  const factor = rules.loyaltyWeight === 0 || loyalty === null ? 1000 : 1000 - rules.loyaltyWeight + Math.trunc((rules.loyaltyWeight * Math.min(loyalty, rules.loyaltyFull)) / rules.loyaltyFull);
  const regiments = asked === null ? null : Math.trunc((Math.trunc((asked * row.sharePermille) / 1000) * factor) / 1000);
  if ((askedMen === null || (asked === null && askedMen === undefined)) && row.sharePermille > 0 && factor > 0) return { regiments: null, men: null, delayDays: row.delayDays, loyaltyPermille: factor };
  if (askedMen === null || (asked === null && askedMen === undefined)) return { regiments: 0, men: 0, delayDays: row.delayDays, loyaltyPermille: factor };
  const men = askedMen === undefined ? regiments! * rules.menPerRegiment : Math.trunc((Math.trunc((askedMen * row.sharePermille) / 1000) * factor) / 1000);
  // An explicit headcount can describe a different organization size. Preserve the known nominal quota;
  // converting its men by the pack's default again would invent additional regiments. A positive
  // sub-regimental remainder has unknown whole-unit count, rather than a fabricated extra regiment.
  const nominal = askedMen === undefined || asked !== null ? (men > 0 && regiments === 0 ? null : regiments) : Math.ceil(men / rules.menPerRegiment);
  return { regiments: nominal, men, delayDays: row.delayDays, loyaltyPermille: factor };
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
  if (!raisingPost(ctx,start,post)) return returnDispatch(ctx,start,msg,'not_raising_post');
  const rules = world.map.world.rules.recruitment;
  // He answers watched from where he stands (lane 1.4's oversight: his courier days from the caller, and the wire).
  const answer = answerOrder(world, start, governor, order.orderIssuer, callDirective(rules, call), { oversight: oversightOf(ctx, start, governor, order.orderIssuer).value });
  let state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: governor, post, role: 'addressee', day, kind: 'call', ...(call.callId === undefined ? {} : { callId: call.callId }) }));
  const side = postFaction(world, state, post);
  const region = state.postStates[post]!.postSeat;
  const loyalty = side === null || region === null ? null : loyaltyOf(state, region, side);
  const actual = regimentsRaised(rules, call.callRegiments, answer.actual, loyalty, call.callMen);
  const declared = regimentsRaised(rules, call.callRegiments, answer.declared, loyalty, call.callMen);
  if (actual === null || actual.regiments === 0) fire(ctx, 'recruitment.refused');
  else {
    if (call.callReadiness !== true) state = recordLevy(state, {
      levyPost: post,
      levyGovernor: governor,
      levyIssuer: order.orderIssuer,
      levyCall: msg.msgOrigin,
      levyRegiments: actual.regiments,
      levyMen: actual.men,
      levyTermDays: call.callTermDays,
      ...(call.callArm === undefined ? {} : { levyArm: call.callArm }),
      ...(call.callId === undefined ? {} : { levyCallId: call.callId }),
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
      ...reportQualificationOf(answer),
      reportSubtype: objects ? 'memorandum' : null,
      reportClaims: [{ claimKind: 'call-answer', claimRegion: region, claimValue: declared?.regiments ?? 0, claimToken: declared?.men === null ? `${answer.declared}:unknown_strength` : answer.declared, claimConfidence: declared?.men === null ? 0 : 1000 }],
      reportAdvice: objects ? { adviceRecommends: 'withdraw-order', adviceReasons: answer.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: 1000 })), adviceConfidence: ctx.world.map.world.rules.reportConfidence.recruitmentObjection } : null,
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

/** Discharge protection follows a resolved engagement in the open battle, not unresolved presence (S81 ruling 2). */
export function inOpenBattle(state: State, block: ForceBlockId): boolean {
  const loc = state.forceLocations[block];
  if (loc === undefined) return false;
  const id = openBattleIn(state, loc.locRegion);
  if (id === null) return false;
  return state.battleRecords[id]!.battleDays.some((d) => !unresolvedContact(d) && d.bdaySides.some((s) => s.bsideBlocks.includes(block)));
}

/** A levy lapsed: the governor tells the man who called it, with the typed reason (its region in enemy hands past the pack's days). */
function reportLapse(ctx: TickContext, state: State, levy: Levy): void {
  fire(ctx, 'recruitment.lapsed');
  const region = state.postStates[levy.levyPost]!.postSeat;
  sendReport(ctx, state, {
    body: answerBody(levy.levyGovernor, levy.levyPost, ctx.day, {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportClaims: [{ claimKind: 'levy-lapsed', claimRegion: region, claimValue: levy.levyRegiments ?? 0, claimToken: levy.levyRegiments === null ? 'region_enemy_held:unknown_strength' : 'region_enemy_held', claimConfidence: levy.levyRegiments === null ? 0 : 1000 }],
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
  const ending = enlistmentsEnding(start, day, world.map.forceServiceCache).filter((b) => !inOpenBattle(start, b));
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
        arm: levy.levyArm ?? rules.arm,
        strength: levy.levyMen,
        storesDays: rules.storesDays,
        enlistment: { enlPost: levy.levyPost, enlRaisedBy: levy.levyGovernor, enlCall: levy.levyCall, enlRegiments: levy.levyRegiments, enlMusterDay: day, enlEndsDay: levy.levyTermDays === null ? null : day + levy.levyTermDays,
          ...(levy.levyCallId === undefined ? {} : { enlCallId: levy.levyCallId }),
        },
      },
    });
    placements.push({ block, region: p.postSeat!, day });
    assign.push({ block, post: levy.levyPost });
    fire(ctx, 'recruitment.mustered');
    if (levy.levyMen !== null) fire(ctx, 'recruitment.men', levy.levyMen);
  }
  for (const block of ending) deltas.push({ change: 'expire', block, day, cause: 'recruitment' });
  const forces = applyMusters(world.map, start, deltas);
  for (const _ of forces.disbanded) fire(ctx, 'recruitment.disbanded');
  const moved = placeAndRemove(world.map, forces.state, placements, forces.disbanded);
  return musterAssignments(moved, [...due, ...lapsed], assign, forces.disbanded);
}

/** A notice may renew a qualifying existing unit's term; forces owns the only changed field. */
export function renewalPhase(ctx: TickContext, start: State): State {
  let state = start;
  for (const p of ctx.proposals) {
    if (p.proposal !== 'effect' || p.owner !== 'recruitment' || p.field !== 'renew_enlistment') continue;
    const r = p.renewal;
    const notice = ctx.world.situations.find(s => s.id === p.situation);
    const block = r === undefined || p.side === null ? undefined : renewableBlock(ctx.world, state, p.side, r, ctx.day);
    if (p.origin !== 'notice' || notice?.kind !== 'notice' || notice.faction !== p.side || p.option !== null ||
      p.delta !== 1 || r === undefined || p.subject !== r.post || block === undefined) {
      ctx.mapEvents.push({ event: 'proposal_refused', owner: 'recruitment', reason: p.reason, why: 'invalid_enlistment_renewal' });
      continue;
    }
    state = applyMusters(ctx.world.map, state, [{ change: 'renew', block, day: ctx.day, fromTermDays: r.fromTermDays, termDays: r.termDays, situation: p.situation, cause: 'recruitment' }]).state;
    fire(ctx, 'recruitment.renewed');
  }
  return state;
}

/** Institutional entries are proposals, never orders to a governor. Each owner applies its own part. */
export function stateForcesPhase(ctx: TickContext, start: State): State {
  let state = start;
  for (const p of ctx.proposals) {
    if (p.proposal !== 'effect' || p.owner !== 'recruitment' || p.field !== 'state_forces') continue;
    const entry = p.stateForces;
    const post = p.subject as PostId;
    const office = state.postStates[post];
    const refuse = (why: string) => ctx.mapEvents.push({ event: 'proposal_refused', owner: 'recruitment', reason: p.reason, why });
    if (p.origin !== 'notice' || p.delta !== 1 || entry === undefined || office === undefined || office.postSeat === null ||
      !raisingPost(ctx, state, post) || p.side === null || postFaction(ctx.world, state, post) !== p.side ||
      !/^[a-z][a-z0-9_]*$/.test(entry.id) || !ctx.world.map.world.vocabularies.arms.some(a => a.id === entry.arm && !a.naval) ||
      (entry.men !== null && (!Number.isSafeInteger(entry.men) || entry.men < 0)) ||
      (entry.regiments !== null && (!Number.isSafeInteger(entry.regiments) || entry.regiments < 1)) ||
      (entry.termDays !== null && (!Number.isSafeInteger(entry.termDays) || entry.termDays < 1 || entry.termDays > ctx.world.map.world.rules.recruitment.maxTermDays)) ||
      (entry.termUnknown === true && entry.termDays !== null)) {
      refuse('invalid_state_forces_notice'); continue;
    }
    const block = toId('forceBlock', `state-forces.${entry.id}`);
    // A return can include a prior requisition. Credit its surviving men, or its still-pending levy,
    // without changing that call's answer, expiry, assignment or journey. Durable enlistment identity
    // works after proxy response pruning too.
    const includes = (id: string | undefined) => id !== undefined && (entry.includesCalls ?? []).includes(id);
    const priorMen = Object.entries(enlistmentsOf(state, ctx.world.map.forceServiceCache)).reduce((n, [id, e]) =>
      e.enlPost === post && includes(e.enlCallId) ? n + (forceTotals(state.forceBlockStates[id as ForceBlockId]!, ctx.world.map.forceTotalsCache).fbStrength ?? 0) : n, 0)
      + Object.values(state.postLevies).reduce((n, l) => l.levyPost === post && includes(l.levyCallId) ? n + (l.levyMen ?? 0) : n, 0);
    const men = entry.men === null ? null : Math.max(0, entry.men - priorMen);
    const old = state.forceBlockStates[block];
    if (entry.release === true) {
      const own = enlistmentsOf(state, ctx.world.map.forceServiceCache)[block];
      if (old === undefined || own?.enlSourceAct === undefined || own.enlPost !== post || old.fbArm !== entry.arm ||
          entry.transferTo !== undefined || entry.post !== undefined || entry.region !== undefined || entry.men !== null || entry.regiments !== null) { refuse('invalid_state_force_relief'); continue; }
      const removed = applyMusters(ctx.world.map, state, [{ change: 'disband', block, cause: 'recruitment' }]);
      state = musterAssignments(placeAndRemove(ctx.world.map, removed.state, [], removed.disbanded), [], [], removed.disbanded);
      continue;
    }
    if (entry.transferTo !== undefined) {
      const destination = ctx.world.map.world.departments.find(d => d.id === entry.transferTo);
      const own = enlistmentsOf(state, ctx.world.map.forceServiceCache)[block];
      if (old === undefined || own?.enlSourceAct === undefined || own.enlPost !== post || old.fbArm !== entry.arm ||
          destination === undefined || state.departmentFactions[destination.id] !== p.side ||
          ctx.world.map.world.vocabularies.departmentKinds.find(k => k.id === destination.kind)?.selfGoverning === true ||
          entry.men !== null || entry.regiments !== null || entry.post !== undefined || entry.region !== undefined) { refuse('invalid_state_force_service_transfer'); continue; }
      state = applyMusters(ctx.world.map, state, [{ change: 'service', block, department: destination.id, cause: 'recruitment' }]).state;
      continue;
    }
    if (old !== undefined) {
      const enlistment = enlistmentsOf(state, ctx.world.map.forceServiceCache)[block];
      if (enlistment?.enlSourceAct === undefined || enlistment.enlPost !== post || old.fbArm !== entry.arm) { refuse('state_force_identity_conflict'); continue; }
      if (forceTotals(old, ctx.world.map.forceTotalsCache).fbStrength === null && men !== null) {
        const count = enlistment.enlRegiments;
        const batchReturn = old.fbLots.length === 1 && old.fbLots[0]?.lotRegiment === null;
        const modelReturn = count !== null && entry.regiments === count && old.fbLots.length === count &&
          old.fbLots.every(l => l.lotMen === null) && men === count * ctx.world.map.world.rules.recruitment.menPerRegiment;
        if (!batchReturn && !modelReturn) {
          refuse('unattributable_regimental_return'); continue;
        }
        state = applyMusters(ctx.world.map, state, [{ change: 'quantify', block, men, regiments: entry.regiments, cause: 'recruitment' }]).state;
      }
      continue;
    }
    // Situation records survive the contingent: a later return is evidence about the old entry,
    // never authority to raise it again after disbanding or surrender. No second identity ledger.
    const enteredBefore = ctx.world.situations.some(s => s.id !== p.situation &&
      state.situationStates[s.id] !== undefined && state.situationStates[s.id]!.sitFiredDay < ctx.day &&
      s.effects.some(e => 'propose' in e && e.propose.owner === 'recruitment' && e.propose.field === 'state_forces' && e.propose.stateForces?.id === entry.id));
    if (enteredBefore) { refuse('state_force_no_longer_present'); continue; }
    const commandPost = entry.post ?? post;
    const command = state.postStates[commandPost];
    if (command?.postSeat == null || postFaction(ctx.world, state, commandPost) !== p.side) { refuse('invalid_state_force_local_command'); continue; }
    const region = entry.region ?? command.postSeat;
    if (!ctx.world.map.world.regions.some(r => r.id === region && ['land', 'key_point'].includes(r.kind))) { refuse('invalid_state_force_muster_point'); continue; }
    const created = applyMusters(ctx.world.map, state, [{ change: 'create', cause: 'recruitment', create: {
      block, name: `raised.${commandPost}`, department: office.postDepartment, arm: entry.arm, strength: men,
      storesDays: ctx.world.map.world.rules.recruitment.storesDays,
      enlistment: { enlPost: post, enlRaisedBy: office.postHolder, enlCall: toId('message', `state-act.${p.situation}.${entry.id}`),
        enlRegiments: entry.regiments, enlMusterDay: ctx.day, enlEndsDay: entry.termDays === null ? null : ctx.day + entry.termDays,
        enlSourceAct: p.situation, ...(entry.termUnknown === true ? { enlTermUnknown: true } : {}),
      },
    } }]).state;
    state = musterAssignments(placeAndRemove(ctx.world.map, created, [{ block, region, day: ctx.day }], []), [], [{ block, post: commandPost }], []);
  }
  return state;
}
