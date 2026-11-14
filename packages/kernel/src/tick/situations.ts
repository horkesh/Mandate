/**
 * Situations in the day tick (FOUNDATION section 10, phase 8; 0040, 0046, 0052).
 *
 * Each day, for each situation in id order:
 * 1. one that has not fired fires when its chain allows it and its event
 *    condition holds in State: a decision opens with the options open now, a
 *    notice applies its effects;
 * 2. one that has fired surfaces when its knowledge condition holds over the
 *    deciding seat's knowledge (or at once, if it has none): the staff
 *    recommendation is written by the first author post that is filled by a
 *    holder who is not a subject, and the turn may end;
 * 3. an open decision is live: options appear and expire, a clock threshold
 *    resurfaces it, and if every option has expired it resolves to `inaction`;
 * 4. a waiting decision opens again, without the waiting option, when its
 *    condition holds;
 * 5. a decision whose principal is on the rules model, and not delegated,
 *    takes the historical default (a history run, 0040), waiting until the
 *    default's options are open. The default is read nowhere else.
 *
 * Decisions sent as commands (`decide`, `delegate`) are applied in phase 1,
 * against the morning's State. Every order an option issues goes out in the
 * principal's name, through the same validated command path as his own
 * orders, by the route the option names; a delegated choice hands over the
 * choice, not the authority to order (0052).
 */
import type { PersonId, SeatId, SituationId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { DecideCommand, DelegateCommand } from '../log/commands.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import { holds, isFinal, knowsMatch, type ConditionContext } from '../situations/conditions.ts';
import {
  applyFlags,
  delegateSituation,
  fireSituation,
  markResurfaced,
  recordAuthor,
  recordDecision,
  reopenSituation,
  setOpenOptions,
  surfaceSituation,
  type DecidedBy,
  type SituationRecord,
} from '../situations/situations.ts';
import type { Effect, SituationDef } from '../situations/types.ts';
import { fire, sendReport, type RejectionReason, type TickContext } from './context.ts';
import { issueOrder } from './orders.ts';

/** Every mechanic the situations phase counts (FOUNDATION section 11.5). */
export const SITUATION_MECHANICS = [
  'situations.decided',
  'situations.delegated',
  'situations.fired',
  'situations.lapsed',
  'situations.notice_reports',
  'situations.noticed',
  'situations.options_changed',
  'situations.orders',
  'situations.proposals',
  'situations.resurfaced',
  'situations.staff_lines',
  'situations.surfaced',
  'situations.waiting',
] as const;

function principalOf(ctx: TickContext, def: SituationDef): PersonId {
  return ctx.world.faction(def.faction).principal;
}

/** `since`: for a trigger that waits for news, the day its wait began, so older reports never satisfy it (review S1). */
function conditionContext(ctx: TickContext, state: State, def: SituationDef, since: number | null = null): ConditionContext {
  return { state, day: ctx.day, situation: def.id, knowledge: knowledgeOf(state, seatIdFor(principalOf(ctx, def))), since };
}

/** The options open today, in display order: appeared (or always there) and not expired, less any excluded. */
export function openOptionsNow(ctx: TickContext, state: State, def: SituationDef, exclude: readonly string[] = []): string[] {
  const cc = conditionContext(ctx, state, def);
  return def.options
    .filter((o) => !exclude.includes(o.id) && (o.appearsWhen === null || holds(o.appearsWhen, cc)) && !(o.expiresWhen !== null && holds(o.expiresWhen, cc)))
    .map((o) => o.id);
}

/**
 * Whether nothing is left to offer: every option not excluded has expired. An option that has not appeared yet,
 * and has not expired, may still be offered, so the decision does not lapse (standing review S3).
 */
function allExpired(ctx: TickContext, state: State, def: SituationDef, exclude: readonly string[]): boolean {
  const cc = conditionContext(ctx, state, def);
  return def.options.every((o) => exclude.includes(o.id) || (o.expiresWhen !== null && holds(o.expiresWhen, cc)));
}

/**
 * Why a selection is not allowed, or null. Every option must be open; taking
 * more than one needs each to sit in a group of its own (catalogue P3); none
 * at all is ignoring the situation, which is always allowed.
 */
export function selectionProblem(def: SituationDef, record: SituationRecord, chosen: readonly string[]): RejectionReason | null {
  if (new Set(chosen).size !== chosen.length) return 'bad_selection';
  if (chosen.some((o) => !record.sitOpenOptions.includes(o))) return 'not_an_option';
  if (chosen.length > 1) {
    const groups = chosen.map((o) => def.options.find((x) => x.id === o)!.group);
    if (groups.some((g) => g === null) || new Set(groups).size !== groups.length) return 'bad_selection';
  }
  return null;
}

function applyEffects(ctx: TickContext, state: State, def: SituationDef, effects: readonly Effect[], option: string | null): State {
  const set: string[] = [];
  const clear: string[] = [];
  for (const e of effects) {
    if ('setFlag' in e) set.push(e.setFlag);
    else if ('clearFlag' in e) clear.push(e.clearFlag);
    else {
      fire(ctx, 'situations.proposals', e.propose.delta);
      ctx.proposals.push({ proposal: 'effect', ...e.propose, situation: def.id, option });
    }
  }
  return applyFlags(state, set, clear, ctx.day);
}

/** Apply a decision: each option's effects, locked costs and orders; a waiting option defers; none is inaction. */
function applyDecision(ctx: TickContext, start: State, def: SituationDef, chosen: readonly string[], by: DecidedBy): State {
  let state = start;
  const options = def.options.filter((o) => chosen.includes(o.id));
  if (options.length === 0) {
    state = applyEffects(ctx, state, def, def.inaction?.effects ?? [], null);
  }
  for (const o of options) {
    state = applyEffects(ctx, state, def, [...o.effects, ...o.lockedCosts], o.id);
    const principal = seatIdFor(principalOf(ctx, def));
    for (const order of o.orders) {
      // In the principal's name, through his validated path, by the route the option names (0052).
      const reason = issueOrder(ctx, state, principal, { cmd: 'order', to: order.to, goal: order.goal, region: order.region, route: order.route, bypass: false });
      if (reason === null) fire(ctx, 'situations.orders');
      else ctx.rejections.push({ day: ctx.day, seat: principal, entry: -1, reason });
    }
  }
  const waiting = options.find((o) => o.waitsOn !== null) ?? null;
  state = recordDecision(state, def.id, ctx.day, options.map((o) => o.id), options.length === 0 && by !== 'lapse' ? 'inaction' : by, waiting?.id ?? null);
  fire(ctx, waiting === null ? (by === 'lapse' ? 'situations.lapsed' : 'situations.decided') : 'situations.waiting');
  return state;
}

function knownSituation(ctx: TickContext, id: SituationId): SituationDef | null {
  return ctx.world.situations.find((s) => s.id === id) ?? null;
}

/** Phase 1: a seat's `decide` command, against the morning's State. */
export function decideCommand(ctx: TickContext, state: State, seat: SeatId, cmd: DecideCommand): { readonly state: State; readonly reason: RejectionReason | null } {
  const def = knownSituation(ctx, cmd.situation);
  const record = def === null ? undefined : state.situationStates[def.id];
  if (def === null || record === undefined || record.sitStatus !== 'open' || record.sitSurfacedDay === null) return { state, reason: 'situation_not_open' };
  const person = state.seatAssignments[seat]?.seatPerson;
  const decider = record.sitDelegate ?? principalOf(ctx, def);
  if (person !== decider) return { state, reason: 'not_the_decider' };
  const problem = selectionProblem(def, record, cmd.options);
  if (problem !== null) return { state, reason: problem };
  return { state: applyDecision(ctx, state, def, cmd.options, record.sitDelegate === null ? 'principal' : 'delegate'), reason: null };
}

/** Phase 1: the principal hands a situation's choice to a named holder. */
export function delegateCommand(ctx: TickContext, state: State, seat: SeatId, cmd: DelegateCommand): { readonly state: State; readonly reason: RejectionReason | null } {
  const def = knownSituation(ctx, cmd.situation);
  const record = def === null ? undefined : state.situationStates[def.id];
  if (def === null || record === undefined || record.sitStatus !== 'open' || record.sitSurfacedDay === null || record.sitDelegate !== null) return { state, reason: 'situation_not_open' };
  if (state.seatAssignments[seat]?.seatPerson !== principalOf(ctx, def)) return { state, reason: 'not_the_decider' };
  if (!def.delegableTo.includes(cmd.to)) return { state, reason: 'not_delegable' };
  const holder = ctx.world.post(cmd.to).holder;
  if (holder === null) return { state, reason: 'vacant_post' };
  // The lead's ruling on standing review S6: never the other side's holder, even in a World that skipped validation.
  if (ctx.world.person(holder).faction !== def.faction) return { state, reason: 'other_side' };
  fire(ctx, 'situations.delegated');
  return { state: delegateSituation(state, def.id, holder), reason: null };
}

/**
 * Write a situation's report from the first author post filled by a holder who
 * is not a subject (0046): a decision's staff recommendation, or a notice's
 * report (gate F1). Returns the author, or null if none was available.
 */
function writeReport(ctx: TickContext, state: State, def: SituationDef): PersonId | null {
  const line = def.staffLine;
  const notice = def.report;
  const authors = line?.authors ?? notice?.authors ?? [];
  for (const post of authors) {
    const holder = ctx.world.post(post).holder;
    if (holder === null || def.subjects.includes(holder)) continue;
    sendReport(ctx, state, {
      body: {
        reportType: line !== null ? 'advice' : notice!.reportType,
        reportSubtype: line !== null ? 'requested' : notice!.subtype,
        reportAuthor: holder,
        reportAuthorPost: post,
        reportSubjectKind: 'situation',
        reportSubjectId: def.id,
        reportClaims: [],
        reportDay: ctx.day,
        reportHour: null,
        reportAdvice:
          line === null
            ? null
            : {
                adviceRecommends: line.recommends.join('+'),
                adviceReasons: line.reasons.map((r) => ({ reasonKind: r.kind, reasonWeight: r.weight })),
                adviceConfidence: line.confidence,
              },
        reportAnswers: null,
      },
      truth: { truthTerms: [], truthTrimmed: [] },
      to: principalOf(ctx, def),
      tag: `${line !== null ? 'staff' : 'notice'}.${def.id}`,
    });
    fire(ctx, line !== null ? 'situations.staff_lines' : 'situations.notice_reports');
    return holder;
  }
  return null;
}

/** A notice surfaces when its own report reaches the principal, unless it names a knowledge condition of its own. */
function noticeArrived(ctx: TickContext, state: State, def: SituationDef): boolean {
  if (def.report === null) return true;
  return knowsMatch(knowledgeOf(state, seatIdFor(principalOf(ctx, def))), {
    reportType: def.report.reportType,
    subtype: def.report.subtype,
    subjectKind: 'situation',
    subjectId: def.id,
    claimKind: null,
    token: null,
  });
}

function point(ctx: TickContext, def: SituationDef, kind: 'situation-lapsed' | 'situation-options' | 'situation-resurfaced' | 'situation-surfaced'): void {
  ctx.decisionPoints.push({ point: kind, seat: seatIdFor(principalOf(ctx, def)), report: null, situation: def.id });
}

function chainAllows(state: State, def: SituationDef): boolean {
  const follows = def.chain?.follows;
  if (follows === undefined || follows === null) return true;
  const parent = state.situationStates[follows.situation];
  if (parent === undefined || !isFinal(parent)) return false;
  return follows.options === null || parent.sitChosen.some((o) => follows.options!.includes(o));
}

/** The situations phase: fire, surface, keep live, reopen, and take history defaults. */
export function runSituations(ctx: TickContext, start: State): State {
  let state = start;
  for (const def of ctx.world.situations) {
    // 1. Fire.
    if (state.situationStates[def.id] === undefined) {
      if (!chainAllows(state, def) || !holds(def.event, conditionContext(ctx, state, def))) continue;
      state = fireSituation(state, def.id, ctx.day, def.kind, []);
      if (def.kind === 'decision') state = setOpenOptions(state, def.id, openOptionsNow(ctx, state, def));
      else {
        state = applyEffects(ctx, state, def, def.effects, null);
        // The notice's report goes out now; the notice surfaces when it arrives (gate F1, review S10).
        state = recordAuthor(state, def.id, writeReport(ctx, state, def));
        fire(ctx, 'situations.noticed');
      }
      fire(ctx, 'situations.fired');
    }
    // 2. Surface.
    let record = state.situationStates[def.id]!;
    const news = def.knowledge !== null ? holds(def.knowledge, conditionContext(ctx, state, def, record.sitFiredDay)) : def.kind === 'notice' ? noticeArrived(ctx, state, def) : true;
    if (record.sitSurfacedDay === null && news) {
      const author = def.kind === 'decision' && record.sitStatus === 'open' ? writeReport(ctx, state, def) : record.sitStaffAuthor;
      state = surfaceSituation(state, def.id, ctx.day, author);
      fire(ctx, 'situations.surfaced');
      if (def.kind === 'decision' && record.sitStatus === 'open') point(ctx, def, 'situation-surfaced');
      record = state.situationStates[def.id]!;
    }
    const surfaced = record.sitSurfacedDay !== null;
    // 3. Live.
    if (record.sitStatus === 'open') {
      // A reopened decision never offers again the waiting option already spent.
      const open = openOptionsNow(ctx, state, def, record.sitChosen);
      if (open.join('|') !== record.sitOpenOptions.join('|')) {
        state = setOpenOptions(state, def.id, open);
        fire(ctx, 'situations.options_changed');
        if (surfaced && open.length > 0) point(ctx, def, 'situation-options');
      }
      if (open.length === 0 && allExpired(ctx, state, def, record.sitChosen)) {
        state = applyDecision(ctx, state, def, [], 'lapse');
        if (surfaced) point(ctx, def, 'situation-lapsed');
        continue;
      }
      // The clock runs from when he was told (gate re-check N6); before that no threshold is crossed.
      const clock = record.sitSurfacedDay === null ? -1 : ctx.day - record.sitSurfacedDay;
      for (const t of def.resurfaceOn) {
        if (clock >= t && !state.situationStates[def.id]!.sitResurfaced.includes(t)) {
          state = markResurfaced(state, def.id, t);
          fire(ctx, 'situations.resurfaced');
          if (surfaced) point(ctx, def, 'situation-resurfaced');
        }
      }
      // 5. A rule-driven principal takes the historical default (a history run).
      record = state.situationStates[def.id]!;
      const principalSeat = state.seatAssignments[seatIdFor(principalOf(ctx, def))];
      if (surfaced && record.sitDelegate === null && principalSeat?.seatDriver === 'rules') state = historyDefault(ctx, state, def, record);
      continue;
    }
    // 4. Reopen a waiting decision.
    if (record.sitStatus === 'waiting' && record.sitWaitingOn !== null) {
      const waitsOn = def.options.find((o) => o.id === record.sitWaitingOn)!.waitsOn!;
      // News the principal had before he chose to wait does not end the wait.
      if (holds(waitsOn, conditionContext(ctx, state, def, record.sitDecidedDay ?? record.sitFiredDay))) {
        // Every option already taken stays spent, as the live step treats it (standing review N3).
        state = reopenSituation(state, def.id, openOptionsNow(ctx, state, def, record.sitChosen));
        fire(ctx, 'situations.resurfaced');
        point(ctx, def, 'situation-resurfaced');
      }
    }
  }
  return state;
}

function historyDefault(ctx: TickContext, state: State, def: SituationDef, record: SituationRecord): State {
  const hd = def.historicalDefault;
  if (hd === null || 'unsourced' in hd) return applyDecision(ctx, state, def, [], 'inaction');
  if ('delegate' in hd) {
    const holder = ctx.world.post(hd.delegate).holder;
    if (holder === null || ctx.world.person(holder).faction !== def.faction) return applyDecision(ctx, state, def, [], 'inaction');
    fire(ctx, 'situations.delegated');
    return delegateSituation(state, def.id, holder);
  }
  // Wait until every option of the default is open (one that appears later, such as a body that must sit first).
  if (selectionProblem(def, record, hd.options) !== null) return state;
  return applyDecision(ctx, state, def, hd.options, 'history-default');
}
