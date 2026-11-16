/**
 * Operations' pack rules (lane 1.4; 0072: every kernel default is a pack rule, stated by every pack). DESIGN
 * PARAMETERS, never sourced facts: how long an axis pauses after it is driven back and how often before the operation
 * fails, how long a pursuit lasts, the control at which an objective is held, and how works are dug and lost.
 */

export interface OperationsRules {
  /** Days an axis pauses after it is driven back, before it tries again. */
  readonly pauseDays: number;
  /** Times an axis may be driven back before its operation fails. */
  readonly maxRepulses: number;
  /** Days a pursuit lasts, by the commander's choice (lane 1.3's `bsidePursue`). */
  readonly pursuitDays: { readonly follow: number; readonly press: number };
  /** Control at its objective, permille, at which an axis holds it and its operation ends. */
  readonly holdControlPermille: number;
  /** Works (0029, P9): an axis holding its objective digs in each night by this much, to a cap; storming takes this much off. */
  readonly works: { readonly perNightPermille: number; readonly capPermille: number; readonly lostWhenStormedPermille: number };
  /**
   * Casualty returns (0032; 0074, 0076): the first runs low by this share of his killed and wounded, and counts the captured
   * among the missing; the full return follows this many days after the battle-day.
   */
  readonly returns: { readonly firstLowPermille: number; readonly revealDays: number };
}

/** How long history is kept (as knowledge prunes, FOUNDATION section 8): ended operations, closed battles, answered orders. */
export interface PruningRules {
  readonly operationDays: number;
  readonly battleDays: number;
  readonly responseDays: number;
}

/** Problems with a pack's operations and pruning rules, as the validator and the kernel's setup see them. */
export function operationsRulesProblems(rules: OperationsRules | undefined, pruning: PruningRules | undefined): string[] {
  const problems: string[] = [];
  if (rules === undefined) problems.push('the pack states no operations rules (rules.operations)');
  if (pruning === undefined) problems.push('the pack states no pruning rules (rules.pruning)');
  if (problems.length > 0) return problems;
  const whole = (v: unknown, what: string, min = 0, max?: number) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < min || (max !== undefined && v > max)) problems.push(`${what} must be a whole number from ${min}${max === undefined ? '' : ` to ${max}`}`);
  };
  whole(rules!.pauseDays, 'operations rule pauseDays', 1);
  whole(rules!.maxRepulses, 'operations rule maxRepulses', 1);
  whole(rules!.pursuitDays.follow, 'operations rule pursuitDays.follow', 1);
  whole(rules!.pursuitDays.press, 'operations rule pursuitDays.press', 1);
  whole(rules!.holdControlPermille, 'operations rule holdControlPermille', 1, 1000);
  whole(rules!.works.perNightPermille, 'operations rule works.perNightPermille', 0, 1000);
  whole(rules!.works.capPermille, 'operations rule works.capPermille', 0, 1000);
  whole(rules!.works.lostWhenStormedPermille, 'operations rule works.lostWhenStormedPermille', 0, 1000);
  whole(rules!.returns.firstLowPermille, 'operations rule returns.firstLowPermille', 0, 1000);
  whole(rules!.returns.revealDays, 'operations rule returns.revealDays', 1);
  whole(pruning!.operationDays, 'pruning rule operationDays', 1);
  whole(pruning!.battleDays, 'pruning rule battleDays', 1);
  whole(pruning!.responseDays, 'pruning rule responseDays', 1);
  // A battle must outlive its full casualty return, which reads the record `returns.revealDays` after the battle-day.
  if (pruning!.battleDays < rules!.returns.revealDays) problems.push('pruning rule battleDays must be at least operations rule returns.revealDays, or a battle is pruned before its full return');
  return problems;
}
