/**
 * STAND-IN goals for lane 0.6: a standing goal per field post, "hold" or
 * "advance to a region" (FOUNDATION section 12's Phase 0 done check). Lane
 * 0.9's planner and Phase 1's `plans` replace this with goals, drafts and
 * plans; an order that names a place still does so only as a goal for a
 * person (hard rule 1).
 */
import type { MessageId, PersonId, RegionId } from '../ids.ts';

export const GOAL_KINDS = ['advance', 'hold'] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];

/** A goal as an order carries it. `goalSpecRegion` is the objective for `advance`; null for `hold` (hold where he stands). */
export interface GoalSpec {
  readonly goalSpecKind: GoalKind;
  readonly goalSpecRegion: RegionId | null;
}

/** The goal a post's holder is working to, and where it came from. */
export interface StandingGoal {
  readonly standingSpec: GoalSpec;
  /** Who ordered it; null for the goal the scenario starts with. */
  readonly standingIssuer: PersonId | null;
  /** Whether it came down his own chain of command (false: it went around a relaying post). */
  readonly standingViaChain: boolean;
  readonly standingSetDay: number;
  /** The order message that set it; null at setup. */
  readonly standingOrder: MessageId | null;
}
