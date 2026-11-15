/**
 * Forces (FOUNDATION section 10; decisions 0033, 0040, 0041, 0050): force
 * blocks and their detachments as State, written only here.
 *
 * `forces` owns what a block is and has: its strength in men, its stores on
 * hand and its non-combatants. Where a block stands belongs to `movement`
 * (`movement/movement.ts`), and which post commands it to `command`
 * (`command/command.ts`), so three writers share no field (hard rule 5).
 *
 * Stores are held in milli-days (1000 = one day of supply for the block), so
 * a part-day's consumption or delivery never rounds away (decision 0002).
 */
import { strictCompare } from '../compare.ts';
import type { DepartmentId, FactionId, ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { ForceBlockKind, ScenarioStart } from '../world/scenario.ts';

/** One force block or detachment. Immutable: `forces` replaces it whole. */
export interface ForceBlockState {
  /** The block's string-table key. */
  readonly fbName: string;
  readonly fbKind: ForceBlockKind;
  /** The block a detachment belongs to; null for a block. */
  readonly fbParent: ForceBlockId | null;
  /** Whose forces they are: who raised them and may recall them (0050). */
  readonly fbDepartment: DepartmentId;
  /** An arm from the pack's vocabulary. */
  readonly fbArm: string;
  /** Men present; null when no source gives it (counted as none, and said so in every sum). */
  readonly fbStrength: number | null;
  /** Labourers and other non-combatants who eat the block's rations. */
  readonly fbNonCombatants: number;
  /** Stores on hand in milli-days (1000 = one day); null when unknown. */
  readonly fbStoresMilli: number | null;
}

export type ForceTable = Readonly<Record<ForceBlockId, ForceBlockState>>;

/**
 * Who may propose a change to a block (the proposers `OWNED_FIELDS` lists for
 * forces). A typed reason (hard rule 6): an unlisted proposer fails typecheck.
 */
export const FORCE_CAUSES = ['combat', 'attrition', 'supply', 'consumption', 'economy', 'recruitment', 'operations'] as const;
export type ForceCause = (typeof FORCE_CAUSES)[number];

/** A change a mechanism proposes for `forces` to apply. */
export type ForceDelta =
  | { readonly change: 'strength'; readonly block: ForceBlockId; readonly men: number; readonly cause: ForceCause }
  | { readonly change: 'stores'; readonly block: ForceBlockId; readonly milli: number; readonly cause: ForceCause };

/** A change applied, with the value before and after (for the explanation trail). */
export interface ForceChange {
  readonly change: ForceDelta['change'];
  readonly block: ForceBlockId;
  readonly before: number;
  readonly after: number;
  readonly cause: ForceCause;
}

export class ForcesError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid forces:\n- ${problems.join('\n- ')}`);
    this.name = 'ForcesError';
  }
}

/** Milli-days per day of stores. */
export const STORES_MILLI = 1000;

/**
 * The blocks at a scenario start, copied once into State at setup (0050).
 * Every problem is reported together.
 */
export function initialForces(map: WorldIndex, start: ScenarioStart): ForceTable {
  const departments = new Set(map.world.departments.map((d) => d.id));
  const arms = new Set(map.world.vocabularies.arms.map((a) => a.id));
  const ids = new Set(start.forceBlocks.map((b) => b.id));
  const problems: string[] = [];
  const out: Record<ForceBlockId, ForceBlockState> = {};
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    if (Object.prototype.hasOwnProperty.call(out, b.id)) problems.push(`force block ${b.id} is listed twice`);
    if (!departments.has(b.department)) problems.push(`force block ${b.id}: department ${b.department} is not in the World`);
    if (!arms.has(b.arm)) problems.push(`force block ${b.id}: arm ${b.arm} is not in the pack's vocabulary`);
    if (b.kind === 'detachment' && (b.parent === null || !ids.has(b.parent))) problems.push(`force block ${b.id}: a detachment needs a parent block`);
    if (b.kind === 'block' && b.parent !== null) problems.push(`force block ${b.id}: a block has no parent`);
    if (b.strength !== null && (!Number.isSafeInteger(b.strength) || b.strength < 0)) problems.push(`force block ${b.id}: strength must be a whole number of men`);
    if (!Number.isSafeInteger(b.nonCombatants) || b.nonCombatants < 0) problems.push(`force block ${b.id}: non-combatants must be a whole number`);
    if (b.storesDays !== null && (!Number.isSafeInteger(b.storesDays) || b.storesDays < 0)) problems.push(`force block ${b.id}: stores must be whole days`);
    out[b.id] = {
      fbName: b.name,
      fbKind: b.kind,
      fbParent: b.parent,
      fbDepartment: b.department,
      fbArm: b.arm,
      fbStrength: b.strength,
      fbNonCombatants: b.nonCombatants,
      fbStoresMilli: b.storesDays === null ? null : b.storesDays * STORES_MILLI,
    };
  }
  if (problems.length > 0) throw new ForcesError(problems);
  return out;
}

/** A block by id. Throws on an unknown block (an unknown id never defaults, FOUNDATION section 11.3). */
export function blockOf(state: State, id: ForceBlockId): ForceBlockState {
  const b = state.forceBlockStates[id];
  if (b === undefined) throw new ForcesError([`unknown force block ${id}`]);
  return b;
}

/** Every block id in code-unit order. */
export function blockIds(state: State): ForceBlockId[] {
  return (Object.keys(state.forceBlockStates) as ForceBlockId[]).sort(strictCompare);
}

/** The faction whose forces a block is, through its department; null for a neutral government's (0050). */
export function factionOfBlock(map: WorldIndex, state: State, id: ForceBlockId): FactionId | null {
  const dept = blockOf(state, id).fbDepartment;
  const d = map.world.departments.find((x) => x.id === dept);
  if (d === undefined) throw new ForcesError([`force block ${id}: department ${dept} is not in the World`]);
  return d.faction;
}

/** Whether a block is naval (its arm says so in the pack's vocabulary): naval blocks carry others aboard. */
export function isNaval(map: WorldIndex, state: State, id: ForceBlockId): boolean {
  const arm = blockOf(state, id).fbArm;
  return map.world.vocabularies.arms.find((a) => a.id === arm)?.naval === true;
}

/** A sum of strengths, with the blocks whose strength no source gives (counted as none, never guessed). */
export interface StrengthSum {
  readonly men: number;
  readonly unknown: readonly ForceBlockId[];
}

export function sumStrength(state: State, ids: readonly ForceBlockId[]): StrengthSum {
  let men = 0;
  const unknown: ForceBlockId[] = [];
  for (const id of [...ids].sort(strictCompare)) {
    const s = blockOf(state, id).fbStrength;
    if (s === null) unknown.push(id);
    else men += s;
  }
  return { men, unknown };
}

/**
 * Apply proposed changes in order: the only way a block's strength or stores
 * change in play. Strength and stores never fall below zero; an unknown value
 * stays unknown (a change to it is refused, not guessed). A change that
 * changes nothing is no change. If none changes anything, the same State returns.
 */
export function applyForces(state: State, deltas: readonly ForceDelta[]): { readonly state: State; readonly changes: readonly ForceChange[] } {
  if (deltas.length === 0) return { state, changes: [] };
  const next: Record<ForceBlockId, ForceBlockState> = { ...state.forceBlockStates };
  const changes: ForceChange[] = [];
  for (const d of deltas) {
    const b = next[d.block];
    if (b === undefined) throw new ForcesError([`unknown force block ${d.block}`]);
    const amount = d.change === 'strength' ? d.men : d.milli;
    if (!Number.isSafeInteger(amount)) throw new ForcesError([`${d.change} change for ${d.block} must be a whole number, got ${amount}`]);
    const before = d.change === 'strength' ? b.fbStrength : b.fbStoresMilli;
    if (before === null) continue;
    const after = Math.max(0, before + amount);
    if (after === before) continue;
    next[d.block] = d.change === 'strength' ? { ...b, fbStrength: after } : { ...b, fbStoresMilli: after };
    changes.push({ change: d.change, block: d.block, before, after, cause: d.cause });
  }
  if (changes.length === 0) return { state, changes };
  return { state: { ...state, forceBlockStates: next }, changes };
}
