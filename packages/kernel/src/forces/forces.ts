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
import { forceTotals, changeLotTotals, knownStragglers, unidentifiedLot, type RegimentLot } from './lots.ts';
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
  /** Regiment lots; totals are derived through forceTotals, never saved alongside them (0108). */
  readonly fbLots: readonly RegimentLot[];
  /** Labourers and other non-combatants who eat the block's rations. */
  readonly fbNonCombatants: number;
  /** Stores on hand in milli-days (1000 = one day); null when unknown. */
  readonly fbStoresMilli: number | null;
  /** The stores are a pack norm's (practice, lane 1.10), not a source's figure for this block (lane 1.4): every reader says so. */
  readonly fbStoresAssumed: boolean;
  /** Morale, permille (lane 1.3): falls with losses and a broken flank; below the pack's rout line a side routs. */
  readonly fbMorale: number;
  /** Experience, permille: both sides gain it in battle. */
  readonly fbExperience: number;
  /** Equipment, permille: lost in a rout. */
  readonly fbEquipment: number;
  /** The day the block last routed (it may not attack for the pack's recovery days), or null. */
  readonly fbRoutedDay: number | null;
  /** The day the block surrendered, cut off (0019; R4's battle ruling: its men captured, never exchanged), or null. A surrendered block fights no more. */
  readonly fbSurrenderedDay: number | null;
}

export type ForceTable = Readonly<Record<ForceBlockId, ForceBlockState>>;

/**
 * Who may propose a change to a block (the proposers `OWNED_FIELDS` lists for
 * forces). A typed reason (hard rule 6): an unlisted proposer fails typecheck.
 */
export const FORCE_CAUSES = ['combat', 'attrition', 'supply', 'consumption', 'economy', 'recruitment', 'operations'] as const;
export type ForceCause = (typeof FORCE_CAUSES)[number];

/**
 * A change a mechanism proposes for `forces` to apply.
 * - `battle_losses` is the only change that captures men, and only `combat` proposes it (R4's battle ruling: captured
 *   men leave a block's strength as a typed loss in the battle record). Killed, wounded and captured leave the block;
 *   the missing move from its strength to its stragglers; stragglers taken in a pocket leave its stragglers.
 * - `condition` moves morale, experience and equipment, and marks a rout or a surrender.
 * - `stragglers_returned` moves men from its stragglers back to its strength.
 */
export type ForceDelta =
  | { readonly change: 'strength'; readonly block: ForceBlockId; readonly men: number; readonly cause: ForceCause }
  | { readonly change: 'stores'; readonly block: ForceBlockId; readonly milli: number; readonly cause: ForceCause }
  | {
      readonly change: 'battle_losses';
      readonly block: ForceBlockId;
      readonly killed: number;
      readonly wounded: number;
      readonly missing: number;
      readonly captured: number;
      readonly stragglersCaptured: number;
      readonly cause: 'combat';
    }
  | {
      readonly change: 'condition';
      readonly block: ForceBlockId;
      readonly morale: number;
      readonly experience: number;
      readonly equipment: number;
      readonly routedDay: number | null;
      readonly surrenderedDay: number | null;
      readonly cause: ForceCause;
    }
  | { readonly change: 'stragglers_returned'; readonly block: ForceBlockId; readonly men: number; readonly cause: ForceCause };

/** A change applied, with the value before and after (for the explanation trail): men present for the battle and straggler changes. */
export interface ForceChange {
  readonly change: ForceDelta['change'];
  readonly block: ForceBlockId;
  readonly before: number;
  readonly after: number;
  readonly cause: ForceCause;
}

/** The starting condition of every block, from the pack's combat rules (0072: no kernel default). */
export interface BlockCondition {
  readonly morale: number;
  readonly experience: number;
  readonly equipment: number;
}

export function startingCondition(map: WorldIndex): BlockCondition {
  const c = map.world.rules.combat;
  return { morale: c.morale.start, experience: c.experience.start, equipment: c.equipment.start };
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
  const condition = startingCondition(map);
  const postKinds = new Map(start.posts.map((p) => [p.id, p.kind]));
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    if (Object.prototype.hasOwnProperty.call(out, b.id)) problems.push(`force block ${b.id} is listed twice`);
    if (!departments.has(b.department)) problems.push(`force block ${b.id}: department ${b.department} is not in the World`);
    if (!arms.has(b.arm)) problems.push(`force block ${b.id}: arm ${b.arm} is not in the pack's vocabulary`);
    if (b.kind === 'detachment' && (b.parent === null || !ids.has(b.parent))) problems.push(`force block ${b.id}: a detachment needs a parent block`);
    if (b.kind === 'block' && b.parent !== null) problems.push(`force block ${b.id}: a block has no parent`);
    if (b.strength !== null && (!Number.isSafeInteger(b.strength) || b.strength < 0)) problems.push(`force block ${b.id}: strength must be a whole number of men`);
    if (!Number.isSafeInteger(b.nonCombatants) || b.nonCombatants < 0) problems.push(`force block ${b.id}: non-combatants must be a whole number`);
    if (b.storesDays !== null && (!Number.isSafeInteger(b.storesDays) || b.storesDays < 0)) problems.push(`force block ${b.id}: stores must be whole days`);
    // Stores no source gives take the first norm that covers the block (lane 1.4), flagged assumed; none: unknown.
    const side = map.world.departments.find((d) => d.id === b.department)?.faction ?? null;
    const kind = b.post === null ? null : (postKinds.get(b.post) ?? null);
    const norm = b.storesDays !== null ? null : (map.world.rules.stores.norms.find((n) => (n.post === null || n.post === b.post) && (n.postKind === null || n.postKind === kind) && (n.arm === null || n.arm === b.arm) && (n.faction === null || n.faction === side)) ?? null);
    out[b.id] = {
      fbName: b.name,
      fbKind: b.kind,
      fbParent: b.parent,
      fbDepartment: b.department,
      fbArm: b.arm,
      fbLots: [unidentifiedLot(`initial.${b.id}`, b.arm, b.strength)],
      fbNonCombatants: b.nonCombatants,
      fbStoresMilli: b.storesDays !== null ? b.storesDays * STORES_MILLI : norm === null ? null : norm.days * STORES_MILLI,
      fbStoresAssumed: b.storesDays === null && norm !== null,
      fbMorale: condition.morale,
      fbExperience: condition.experience,
      fbEquipment: condition.equipment,
      fbRoutedDay: null,
      fbSurrenderedDay: null,
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

/** The faction whose forces a block is, through its department's side today (0050, 0065); null for a neutral government's. */
export function factionOfBlock(_map: WorldIndex, state: State, id: ForceBlockId): FactionId | null {
  const dept = blockOf(state, id).fbDepartment;
  if (!Object.prototype.hasOwnProperty.call(state.departmentFactions, dept)) throw new ForcesError([`force block ${id}: department ${dept} is not in the World`]);
  return state.departmentFactions[dept]!;
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
    const s = forceTotals(blockOf(state, id)).fbStrength;
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
  let changed = false;
  for (const d of deltas) {
    const b = next[d.block];
    if (b === undefined) throw new ForcesError([`unknown force block ${d.block}`]);
    if (d.change === 'battle_losses') {
      const stragglersBefore = knownStragglers(b);
      const parts = [d.killed, d.wounded, d.missing, d.captured, d.stragglersCaptured];
      if (parts.some((n) => !Number.isSafeInteger(n) || n < 0)) throw new ForcesError([`battle losses for ${d.block} must be whole numbers, at least 0`]);
      if (d.stragglersCaptured > stragglersBefore) throw new ForcesError([`${d.block} has ${stragglersBefore} known stragglers, not ${d.stragglersCaptured} to capture`]);
      // An unknown strength stays unknown (counted as none, never guessed); only its stragglers can change.
      const out = d.killed + d.wounded + d.missing + d.captured;
      if (forceTotals(b).fbStrength! !== null && out > forceTotals(b).fbStrength!) throw new ForcesError([`${d.block} has ${forceTotals(b).fbStrength!} men, not ${out} to lose`]);
      const strength = forceTotals(b).fbStrength! === null ? null : forceTotals(b).fbStrength! - out;
      const stragglers = stragglersBefore + (forceTotals(b).fbStrength === null ? 0 : d.missing) - d.stragglersCaptured;
      if (strength === forceTotals(b).fbStrength && stragglers === stragglersBefore) continue;
      next[d.block] = { ...b, fbLots: changeLotTotals(b.fbLots, strength, stragglers) };
      changed = true;
      if (forceTotals(b).fbStrength! !== null && strength !== forceTotals(b).fbStrength!) changes.push({ change: d.change, block: d.block, before: forceTotals(b).fbStrength!, after: strength!, cause: d.cause });
      continue;
    }
    if (d.change === 'condition') {
      const after: ForceBlockState = {
        ...b,
        fbMorale: Math.min(1000, Math.max(0, b.fbMorale + d.morale)),
        fbExperience: Math.min(1000, Math.max(0, b.fbExperience + d.experience)),
        fbEquipment: Math.min(1000, Math.max(0, b.fbEquipment + d.equipment)),
        fbRoutedDay: d.routedDay ?? b.fbRoutedDay,
        fbSurrenderedDay: d.surrenderedDay ?? b.fbSurrenderedDay,
      };
      if (after.fbMorale === b.fbMorale && after.fbExperience === b.fbExperience && after.fbEquipment === b.fbEquipment && after.fbRoutedDay === b.fbRoutedDay && after.fbSurrenderedDay === b.fbSurrenderedDay) continue;
      next[d.block] = after;
      changed = true;
      continue;
    }
    if (d.change === 'stragglers_returned') {
      const stragglers = knownStragglers(b);
      if (!Number.isSafeInteger(d.men) || d.men < 0 || d.men > stragglers) throw new ForcesError([`${d.block} has ${stragglers} known stragglers, not ${d.men} to return`]);
      if (d.men === 0 || forceTotals(b).fbStrength === null) continue;
      next[d.block] = { ...b, fbLots: changeLotTotals(b.fbLots, forceTotals(b).fbStrength! + d.men, stragglers - d.men) };
      changed = true;
      changes.push({ change: d.change, block: d.block, before: stragglers, after: stragglers - d.men, cause: d.cause });
      continue;
    }
    const amount = d.change === 'strength' ? d.men : d.milli;
    if (!Number.isSafeInteger(amount)) throw new ForcesError([`${d.change} change for ${d.block} must be a whole number, got ${amount}`]);
    const before = d.change === 'strength' ? forceTotals(b).fbStrength : b.fbStoresMilli;
    if (before === null) continue;
    const after = Math.max(0, before + amount);
    if (after === before) continue;
    next[d.block] = d.change === 'strength' ? { ...b, fbLots: changeLotTotals(b.fbLots, after, knownStragglers(b)) } : { ...b, fbStoresMilli: after };
    changed = true;
    changes.push({ change: d.change, block: d.block, before, after, cause: d.cause });
  }
  if (!changed) return { state, changes };
  return { state: { ...state, forceBlockStates: next }, changes };
}
