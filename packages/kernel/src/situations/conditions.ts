/**
 * Evaluating situation conditions (pure; writes nothing).
 *
 * Event conditions read the truth in State. A `knows` condition reads only
 * what one seat holds (decision 0052: a knowledge condition is evaluated from
 * what the seat knows), so a situation can wait for news to reach the
 * president however long ago the thing happened. A situation's own knowledge
 * trigger counts only news received since its clock started (`since`), so a
 * report the seat held before the event never surfaces it (review S1).
 */
import type { SituationId } from '../ids.ts';
import type { SeatKnowledge } from '../knowledge/knowledge.ts';
import type { State } from '../root-state.ts';
import type { SituationRecord } from './situations.ts';
import type { Condition, KnowsPattern } from './types.ts';

export interface ConditionContext {
  readonly state: State;
  /** The day being evaluated (the tick's day). */
  readonly day: number;
  /** The situation whose clock `clockAtLeast` reads, if any. */
  readonly situation: SituationId | null;
  /** The deciding seat's knowledge, for `knows`. */
  readonly knowledge: SeatKnowledge;
  /** `knows` counts only reports received on or after this day; null counts every report the seat holds. */
  readonly since: number | null;
}

/** Whether a report the seat holds (received on or after `since`, if given) matches the pattern. */
export function knowsMatch(knowledge: SeatKnowledge, p: KnowsPattern, since: number | null = null): boolean {
  return knowledge.knownReports.some((r) => {
    if (since !== null && r.knownReceivedDay < since) return false;
    const b = r.knownBody;
    if (p.reportType !== null && b.reportType !== p.reportType) return false;
    if (p.subtype !== null && b.reportSubtype !== p.subtype) return false;
    if (p.subjectKind !== null && b.reportSubjectKind !== p.subjectKind) return false;
    if (p.subjectId !== null && b.reportSubjectId !== p.subjectId) return false;
    if (p.claimKind === null) return true;
    return b.reportClaims.some((c) => c.claimKind === p.claimKind && (p.token === null || c.claimToken === p.token));
  });
}

export function holds(c: Condition, ctx: ConditionContext): boolean {
  if ('all' in c) return c.all.every((x) => holds(x, ctx));
  if ('any' in c) return c.any.some((x) => holds(x, ctx));
  if ('not' in c) return !holds(c.not, ctx);
  if ('dayAtLeast' in c) return ctx.day >= c.dayAtLeast;
  if ('flag' in c) return ctx.state.situationFlags[c.flag] !== undefined;
  if ('fired' in c) return ctx.state.situationStates[c.fired] !== undefined;
  if ('decided' in c) {
    const r = ctx.state.situationStates[c.decided];
    if (r === undefined || !isFinal(r)) return false;
    return c.options === null || r.sitChosen.some((o) => c.options!.includes(o));
  }
  if ('knows' in c) return knowsMatch(ctx.knowledge, c.knows, ctx.since);
  if ('goal' in c) return ctx.state.standingGoals[c.goal.post]?.standingSpec.goalSpecKind === c.goal.kind;
  if ('headquartersAt' in c) return ctx.state.headquarters[c.headquartersAt.post]?.hqRegion === c.headquartersAt.region;
  // clockAtLeast
  if (ctx.situation === null) return false;
  const r = ctx.state.situationStates[ctx.situation];
  return r !== undefined && ctx.day - r.sitFiredDay >= c.clockAtLeast;
}

/** The predicate at the top of a condition. */
export function predicateOf(c: Condition): string {
  for (const k of ['all', 'any', 'not', 'dayAtLeast', 'flag', 'fired', 'decided', 'knows', 'goal', 'headquartersAt', 'clockAtLeast'] as const) if (k in c) return k;
  return 'unknown';
}

/** The places a condition must follow what the principal knows, rather than the truth. */
export type KnowablePlace = 'knowledge' | 'waitsOn' | 'appearsWhen' | 'expiresWhen';

/**
 * What each such place may read, beside `all`, `any` and `not` (the lead's
 * rulings on gate review S10 and standing review S2): `knows`, and the public
 * facts the president always knows, on an explicit allow-list. The truth fires a
 * situation; it never surfaces one, ends a wait or changes an option, since an
 * option change must never reveal an event. A chamber's sitting state joins the
 * list for options once it exists.
 */
export const KNOWABLE: Readonly<Record<KnowablePlace, readonly string[]>> = Object.freeze({
  knowledge: ['knows'],
  waitsOn: ['knows', 'clockAtLeast'],
  appearsWhen: ['knows', 'clockAtLeast', 'dayAtLeast'],
  expiresWhen: ['knows', 'clockAtLeast', 'dayAtLeast'],
});

/** The first predicate in `c` that its place may not read, or null. */
export function unknowableRead(c: Condition, place: KnowablePlace): string | null {
  const p = predicateOf(c);
  if (p === 'all' || p === 'any') {
    for (const x of 'all' in c ? c.all : 'any' in c ? c.any : []) {
      const bad = unknowableRead(x, place);
      if (bad !== null) return bad;
    }
    return null;
  }
  if (p === 'not' && 'not' in c) return unknowableRead(c.not, place);
  return KNOWABLE[place].includes(p) ? null : p;
}
/** Whether a situation is settled: decided or lapsed, not open and not waiting on a deferral. */
export function isFinal(r: SituationRecord): boolean {
  return r.sitStatus === 'decided' || r.sitStatus === 'lapsed';
}

/** Every situation a condition refers to (for validation and chain checks). */
export function situationsIn(c: Condition): SituationId[] {
  if ('all' in c) return c.all.flatMap(situationsIn);
  if ('any' in c) return c.any.flatMap(situationsIn);
  if ('not' in c) return situationsIn(c.not);
  if ('fired' in c) return [c.fired];
  if ('decided' in c) return [c.decided];
  return [];
}

/** Every flag a condition reads. */
export function flagsIn(c: Condition): string[] {
  if ('all' in c) return c.all.flatMap(flagsIn);
  if ('any' in c) return c.any.flatMap(flagsIn);
  if ('not' in c) return flagsIn(c.not);
  if ('flag' in c) return [c.flag];
  return [];
}

