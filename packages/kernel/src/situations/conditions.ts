/**
 * Evaluating situation conditions (pure; writes nothing).
 *
 * Event conditions read the truth in State. A `knows` condition reads only
 * what one seat holds (decision 0052: a knowledge condition is evaluated from
 * what the seat knows), so a situation can wait for news to reach the
 * president however long ago the thing happened.
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
}

/** Whether a report the seat holds matches the pattern. */
export function knowsMatch(knowledge: SeatKnowledge, p: KnowsPattern): boolean {
  return knowledge.knownReports.some((r) => {
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
  if ('knows' in c) return knowsMatch(ctx.knowledge, c.knows);
  if ('goal' in c) return ctx.state.standingGoals[c.goal.post]?.standingSpec.goalSpecKind === c.goal.kind;
  if ('headquartersAt' in c) return ctx.state.headquarters[c.headquartersAt.post]?.hqRegion === c.headquartersAt.region;
  // clockAtLeast
  if (ctx.situation === null) return false;
  const r = ctx.state.situationStates[ctx.situation];
  return r !== undefined && ctx.day - r.sitFiredDay >= c.clockAtLeast;
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

/** Whether a condition is a date and nothing else (gate B2: allowed only for a labelled railroad). */
export function isDateOnly(c: Condition): boolean {
  if ('all' in c) return c.all.length > 0 && c.all.every(isDateOnly);
  if ('any' in c) return c.any.length > 0 && c.any.every(isDateOnly);
  if ('not' in c) return isDateOnly(c.not);
  return 'dayAtLeast' in c;
}
