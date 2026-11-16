/**
 * STAND-IN (lane 1.1 replaces it): how a holder resolves conflicting orders (0040; 0064's resolution by department).
 *
 * Lane 1.1 builds a compliance function that resolves conflicting orders; lane 1.2's call site (`tick/orders.ts`,
 * `arriveOrder`) calls `resolveConflict`, and whichever lane merges second swaps this body for it (0073). Until then:
 * two orders conflict when they differ, the one he holds is less than the pack's conflict window old
 * (`WorldRules.standing.conflictWindowDays`), and one came down his chain while the other went around it (with relays
 * holding orders, they arrive out of the order they were written). The chain's order stands against one that went
 * around it, and a chain order supersedes one that went around (0040: a newer order from his own department
 * supersedes). Either way he reports which he obeyed. A post with no goal yet obeys, never a crash (exit review S1).
 */
import { sameGoal, type PlanGoal } from './goal.ts';
import type { PlanRecord } from './plans.ts';

export interface OrderOutcome {
  /** `new`: he works to the order that just arrived; `kept`: he keeps the goal he had. */
  readonly obeyed: 'kept' | 'new';
  /** Whether two orders conflicted (0040), so he reports which he obeyed. */
  readonly conflict: boolean;
}

export function resolveConflict(current: PlanRecord | undefined, order: { readonly goal: PlanGoal; readonly viaChain: boolean }, day: number, windowDays: number): OrderOutcome {
  if (current === undefined) return { obeyed: 'new', conflict: false };
  const differs = !sameGoal(current.planGoal, order.goal);
  const recent = day - current.planSetDay < windowDays;
  const conflict = differs && recent && current.planViaChain !== order.viaChain;
  if (conflict && !order.viaChain) return { obeyed: 'kept', conflict: true };
  return { obeyed: 'new', conflict };
}
