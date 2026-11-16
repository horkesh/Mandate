/**
 * Goals (FOUNDATION section 5; decisions 0016, 0026, 0040, 0062).
 *
 * A goal is what a principal orders a commander: an objective, a posture, the risk he accepts, a deadline, the
 * permissions to use rail, river, sea and neutral ground, the force committed, whether the operation should assemble
 * and await his word, and whether its plan may go ahead as drafted unless the commander objects. An order that names a
 * place does so only as part of a goal for a person (hard rule 1). `plans` holds each post's goal and its plan.
 *
 * Lane 1.4 retired the standing goal: an approved plan is executed by an operation (`operations/`, `tick/operations.ts`).
 */
import type { ForceBlockId, RegionId } from '../ids.ts';

/** What the goal asks of him: take the objective, relieve it (reach it and hold it for a garrison there), or hold it. */
export const POSTURES = ['hold', 'relieve', 'take'] as const;
export type Posture = (typeof POSTURES)[number];

/**
 * A goal as `plans` holds it and an order carries it. Immutable: replaced whole.
 * `goalObjective` is null only for "hold where he stands".
 */
export interface PlanGoal {
  readonly goalObjective: RegionId | null;
  readonly goalPosture: Posture;
  /** 0..1000: the risk the principal accepts; it scales the exposure the commander will tolerate. */
  readonly goalRisk: number;
  /** Days from the day he receives it by which the objective should be reached. */
  readonly goalDeadlineDays: number;
  readonly goalRail: boolean;
  readonly goalRiver: boolean;
  readonly goalSea: boolean;
  /** May he march through a neutral government's open ground (0055, 0058, 0062)? A political act, so only by permission. */
  readonly goalNeutral: boolean;
  /** The blocks committed; empty: every block (not detachment) his post commands (lane 0.9 finding 6). */
  readonly goalCommitted: readonly ForceBlockId[];
  /** "Prepare, await my word" (0040): the operation assembles and waits for a free "go". */
  readonly goalAwaitWord: boolean;
  /** "Approve as drafted unless he objects" (FOUNDATION section 9): the plan he picks goes ahead without a review. */
  readonly goalApproveAsDrafted: boolean;
}

/** Where a post's plan stands (`plans.ts` describes each status). */
export const PLAN_STATUSES = ['approved', 'choosing', 'drafting', 'ready', 'review'] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

/**
 * The goal kind whose directive terms the pack states (`WorldRules.people.goalTerms`, lane 1.1): a goal to take or
 * relieve an objective is an advance, a goal to hold is a hold.
 */
export function goalKindOf(goal: PlanGoal): GoalKind {
  return goal.goalPosture === 'hold' ? 'hold' : 'advance';
}

/** Two goals ask the same thing. */
export function sameGoal(a: PlanGoal, b: PlanGoal): boolean {
  return (
    a.goalObjective === b.goalObjective &&
    a.goalPosture === b.goalPosture &&
    a.goalRisk === b.goalRisk &&
    a.goalDeadlineDays === b.goalDeadlineDays &&
    a.goalRail === b.goalRail &&
    a.goalRiver === b.goalRiver &&
    a.goalSea === b.goalSea &&
    a.goalNeutral === b.goalNeutral &&
    a.goalAwaitWord === b.goalAwaitWord &&
    a.goalApproveAsDrafted === b.goalApproveAsDrafted &&
    a.goalCommitted.length === b.goalCommitted.length &&
    a.goalCommitted.every((x, i) => x === b.goalCommitted[i])
  );
}

/** Problems with a goal's values (the tick refuses an order whose goal has any). */
export function goalProblems(goal: PlanGoal): string[] {
  const problems: string[] = [];
  if (!(POSTURES as readonly string[]).includes(goal.goalPosture)) problems.push(`posture must be one of ${POSTURES.join(', ')}`);
  if (goal.goalObjective === null && goal.goalPosture !== 'hold') problems.push('only a hold may name no objective');
  if (!Number.isSafeInteger(goal.goalRisk) || goal.goalRisk < 0 || goal.goalRisk > 1000) problems.push('risk must be a permille');
  if (!Number.isSafeInteger(goal.goalDeadlineDays) || goal.goalDeadlineDays < 1) problems.push('deadline must be a whole number of days, at least 1');
  if (new Set(goal.goalCommitted).size !== goal.goalCommitted.length) problems.push('a block is committed twice');
  return problems;
}

/**
 * The arrow edits a principal may make to a plan (0026's grammar; FOUNDATION section 11, rule 10: part of the verb
 * list): an axis's objective, its waypoints, its timing, adding an axis with an objective, removing an axis. Each is a
 * counter-order the commander answers through compliance. The player never moves a division (hard rule 1).
 */
export const EDIT_KINDS = ['add_axis', 'objective', 'remove_axis', 'timing', 'waypoints'] as const;
export type EditKind = (typeof EDIT_KINDS)[number];

/** One arrow edit, as an order carries it and `plans` records it. The fields a kind does not use are null or empty. */
export interface EditSpec {
  readonly editKind: EditKind;
  /** The axis edited (`main`, `partner`, ...); null for `add_axis`. */
  readonly editAxis: string | null;
  /** The new objective (`objective`, `add_axis`). */
  readonly editRegion: RegionId | null;
  /** The waypoints, in order (`waypoints`). */
  readonly editVia: readonly RegionId[];
  /** Days he may concentrate before moving (`timing`; 0 is "move now"). */
  readonly editConcentration: number | null;
}

/** Problems with an edit's shape: the fields its kind needs, and no others. */
export function editProblems(e: EditSpec): string[] {
  const problems: string[] = [];
  if (!(EDIT_KINDS as readonly string[]).includes(e.editKind)) return [`edit kind must be one of ${EDIT_KINDS.join(', ')}`];
  const needsAxis = e.editKind !== 'add_axis';
  if (needsAxis !== (e.editAxis !== null)) problems.push(needsAxis ? `a ${e.editKind} edit names its axis` : 'adding an axis names no existing axis');
  const needsRegion = e.editKind === 'objective' || e.editKind === 'add_axis';
  if (needsRegion !== (e.editRegion !== null)) problems.push(needsRegion ? `a ${e.editKind} edit names a region` : `a ${e.editKind} edit names no region`);
  if ((e.editKind === 'waypoints') !== e.editVia.length > 0) problems.push(e.editKind === 'waypoints' ? 'a waypoints edit names at least one waypoint' : `a ${e.editKind} edit names no waypoints`);
  const needsDays = e.editKind === 'timing';
  if (needsDays !== (e.editConcentration !== null)) problems.push(needsDays ? 'a timing edit names the days he may concentrate' : `a ${e.editKind} edit names no days`);
  if (e.editConcentration !== null && (!Number.isSafeInteger(e.editConcentration) || e.editConcentration < 0)) problems.push('concentration days must be a whole number, at least 0');
  return problems;
}

/** A goal's kind, whose directive terms the pack states (`people.goalTerms`): a hold, or an advance (take or relieve). */
export const GOAL_KINDS = ['advance', 'hold'] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];
