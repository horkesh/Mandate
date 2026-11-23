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
import type { ForceBlockId, PostId, RegionId } from '../ids.ts';
import type { GoalTerms } from '../log/commands.ts';
import { canonicalHash } from '../serialize/hash.ts';
import type { PaperSelector } from '../world/paper-selectors.ts';

/** What the goal asks of him: take the objective, relieve it (reach it and hold it for a garrison there), or hold it. */
export const POSTURES = ['hold', 'relieve', 'take'] as const;
export type Posture = (typeof POSTURES)[number];

export const DISCRETION_CONDITIONS = ['turned', 'outmatched'] as const;
export type DiscretionCondition = (typeof DISCRETION_CONDITIONS)[number];
/** Grammar bound for nesting in a dated row, a player's order or a replay entry. */
export const MAX_FALLBACKS = 3;

export interface Discretion<Goal> {
  readonly condition: DiscretionCondition;
  readonly fallback: Goal;
}

interface DoctrineGoal {
  readonly objective: RegionId | null;
  readonly posture: Posture;
}

/** Goals in sourced doctrine rows inherit the other terms of the letter. */
export type DoctrineDiscretion = Discretion<DoctrineGoal & { readonly discretion?: Discretion<
  DoctrineGoal & { readonly discretion?: Discretion<DoctrineGoal> }
> }>;

export type DoctrineProposalAnswer = {
  readonly id: string;
  readonly post: PostId;
  readonly fromDate: string;
  readonly answers: string;
  readonly source: string;
  readonly requiresPapers?: readonly PaperSelector[];
} & ({ readonly action: 'accept' | 'decline' } | {
  readonly action: 'discretion';
  readonly objective?: RegionId | null;
  readonly posture?: Posture;
  readonly discretion: DoctrineDiscretion;
});

/**
 * A goal as `plans` holds it and an order carries it. Immutable: replaced whole.
 * `goalObjective` is null only for "hold where he stands".
 */
export interface DetentionPurpose {
  readonly kind: 'attack_or_demonstrate';
  readonly duty: 'detain';
  readonly target: { readonly kind: 'opposing_command'; readonly post: PostId };
  readonly detentionArea: readonly RegionId[];
  readonly actionArea: readonly RegionId[];
  readonly means: readonly ['attack', 'demonstrate'];
}

export function copyPurpose(purpose: DetentionPurpose): DetentionPurpose {
  return { ...purpose, target: { ...purpose.target }, detentionArea: [...purpose.detentionArea],
    actionArea: [...purpose.actionArea], means: [...purpose.means] };
}

export type PlanGoal = PlanGoalTerms & (
  | { readonly goalPurpose?: never; readonly goalObjective: RegionId | null; readonly goalPosture: Posture }
  | { readonly goalPurpose: PlanDetentionPurpose; readonly goalObjective?: never; readonly goalPosture?: never }
);

export interface PlanDetentionPurpose {
  readonly detKind: 'attack_or_demonstrate';
  readonly detDuty: 'detain';
  readonly detTargetPost: PostId;
  readonly detTargetKind: 'opposing_command';
  readonly detDetentionArea: readonly RegionId[];
  readonly detActionArea: readonly RegionId[];
  readonly detMeans: readonly ['attack', 'demonstrate'];
}

export function purposeOf(terms: DetentionPurpose): PlanDetentionPurpose {
  return { detKind: terms.kind, detDuty: terms.duty, detTargetPost: terms.target.post,
    detTargetKind: terms.target.kind, detDetentionArea: [...terms.detentionArea], detActionArea: [...terms.actionArea],
    detMeans: [...terms.means] };
}

export function purposeTerms(purpose: PlanDetentionPurpose): DetentionPurpose {
  return { kind: purpose.detKind, duty: purpose.detDuty, target: { kind: purpose.detTargetKind, post: purpose.detTargetPost },
    detentionArea: [...purpose.detDetentionArea], actionArea: [...purpose.detActionArea], means: [...purpose.detMeans] };
}

interface PlanGoalTerms {
  readonly goalPurpose?: PlanDetentionPurpose;
  readonly goalPosture?: Posture;
  readonly goalObjective?: RegionId | null;
  readonly goalDiscretion?: Discretion<PlanGoal>;
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
    (a.goalPurpose === undefined ? b.goalPurpose === undefined :
      b.goalPurpose !== undefined && canonicalHash(a.goalPurpose) === canonicalHash(b.goalPurpose)) &&
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
    a.goalCommitted.every((x, i) => x === b.goalCommitted[i]) &&
    (a.goalDiscretion === undefined ? b.goalDiscretion === undefined :
      a.goalDiscretion.condition === b.goalDiscretion?.condition && sameGoal(a.goalDiscretion.fallback, b.goalDiscretion.fallback))
  );
}

/** Problems with a goal's values (the tick refuses an order whose goal has any). */
export function goalProblems(goal: PlanGoal, depth = 0): string[] {
  const problems: string[] = [];
  if (goal.goalPurpose !== undefined) {
    if ('goalPosture' in goal || 'goalObjective' in goal) problems.push('a detention purpose replaces posture and objective');
    if (goal.goalDiscretion !== undefined) problems.push('detention has no regional discretion');
    const p = purposeTerms(goal.goalPurpose);
    if (p.kind !== 'attack_or_demonstrate' || p.duty !== 'detain' || p.target?.kind !== 'opposing_command' ||
      p.means?.length !== 2 || p.means[0] !== 'attack' || p.means[1] !== 'demonstrate') problems.push('invalid detention purpose');
    for (const area of [p.detentionArea, p.actionArea]) {
      if (!Array.isArray(area) || area.length === 0 || new Set(area).size !== area.length) problems.push('areas must be nonempty and duplicate-free');
    }
  } else {
  if (!(POSTURES as readonly string[]).includes(goal.goalPosture)) problems.push(`posture must be one of ${POSTURES.join(', ')}`);
  if (goal.goalObjective === null && goal.goalPosture !== 'hold') problems.push('only a hold may name no objective');
  }
  if (!Number.isSafeInteger(goal.goalRisk) || goal.goalRisk < 0 || goal.goalRisk > 1000) problems.push('risk must be a permille');
  if (!Number.isSafeInteger(goal.goalDeadlineDays) || goal.goalDeadlineDays < 1) problems.push('deadline must be a whole number of days, at least 1');
  if (new Set(goal.goalCommitted).size !== goal.goalCommitted.length) problems.push('a block is committed twice');
  const discretion = goal.goalDiscretion;
  if (discretion !== undefined) {
    if (depth >= MAX_FALLBACKS) problems.push(`at most ${MAX_FALLBACKS} fallbacks`);
    else {
      if (!DISCRETION_CONDITIONS.includes(discretion.condition)) problems.push('unknown discretion condition');
      problems.push(...goalProblems(discretion.fallback, depth + 1).map(p => `fallback: ${p}`));
    }
  }
  return problems;
}

/** A goal as an issuer may copy it into a letter. */
export function termsOfGoal(goal: PlanGoal): GoalTerms {
  return {
    ...(goal.goalPurpose === undefined ? { objective: goal.goalObjective, posture: goal.goalPosture } : { purpose: purposeTerms(goal.goalPurpose) }),
    risk: goal.goalRisk, deadlineDays: goal.goalDeadlineDays,
    rail: goal.goalRail, river: goal.goalRiver, sea: goal.goalSea, neutral: goal.goalNeutral, committed: [...goal.goalCommitted],
    awaitWord: goal.goalAwaitWord, approveAsDrafted: goal.goalApproveAsDrafted,
    ...(goal.goalDiscretion === undefined ? {} : { discretion: {
      condition: goal.goalDiscretion.condition,
      fallback: termsOfGoal(goal.goalDiscretion.fallback),
    } }),
  };
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

export interface EditProblem {
  readonly kind: 'bad-kind' | 'needs-axis' | 'extra-axis' | 'needs-region' | 'extra-region'
    | 'needs-waypoints' | 'extra-waypoints' | 'needs-days' | 'extra-days' | 'invalid-days';
  readonly edit: EditKind;
}

/** Problems with an edit's shape: the fields its kind needs, and no others. */
export function editIssues(e: EditSpec): EditProblem[] {
  const problems: EditProblem[] = [];
  const edit = e.editKind;
  if (!(EDIT_KINDS as readonly string[]).includes(edit)) return [{ kind: 'bad-kind', edit }];
  const needsAxis = e.editKind !== 'add_axis';
  if (needsAxis !== (e.editAxis !== null)) problems.push({ kind: needsAxis ? 'needs-axis' : 'extra-axis', edit });
  const needsRegion = e.editKind === 'objective' || e.editKind === 'add_axis';
  if (needsRegion !== (e.editRegion !== null)) problems.push({ kind: needsRegion ? 'needs-region' : 'extra-region', edit });
  if ((e.editKind === 'waypoints') !== (e.editVia.length > 0)) {
    problems.push({ kind: e.editKind === 'waypoints' ? 'needs-waypoints' : 'extra-waypoints', edit });
  }
  const needsDays = e.editKind === 'timing';
  if (needsDays !== (e.editConcentration !== null)) problems.push({ kind: needsDays ? 'needs-days' : 'extra-days', edit });
  if (e.editConcentration !== null && (!Number.isSafeInteger(e.editConcentration) || e.editConcentration < 0)) {
    problems.push({ kind: 'invalid-days', edit });
  }
  return problems;
}

/** A goal's kind, whose directive terms the pack states (`people.goalTerms`): a hold, or an advance (take or relieve). */
export const GOAL_KINDS = ['advance', 'hold'] as const;
export type GoalKind = (typeof GOAL_KINDS)[number];
