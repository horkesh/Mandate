/**
 * New blocks and their enlistments (lane 1.7; FOUNDATION section 12 row 1.7): `forces` creates a block a governor's
 * regiments muster into, and disbands one whose men's term has run out (the ninety-day men).
 *
 * One recruitment proposal makes each block, applied in one phase (`tick/recruitment.ts`): `forces` creates it here
 * (its strength, stores and enlistment), `movement` places it at its muster region and `command` assigns it to the
 * governor's post. Each owner writes only its own field (hard rule 5). Disbanding is the same proposal in reverse.
 *
 * There is no `men` stock in `economy` in 1A (that is 1B): a regiment goes straight from the governor into a block.
 */
import { strictCompare } from '../compare.ts';
import type { DepartmentId, ForceBlockId, MessageId, PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { ForcesError, startingCondition, STORES_MILLI, type BlockCondition, type ForceBlockState } from './forces.ts';

/** A block's enlistment: who raised it, on whose call, and when its men's term ends. Immutable: `forces` replaces it whole. */
export interface Enlistment {
  /** The post whose holder raised it (a governor's). */
  readonly enlPost: PostId;
  /** The governor who raised it. */
  readonly enlRaisedBy: PersonId;
  /** The call it answered (the order's id). */
  readonly enlCall: MessageId;
  /** Regiments in the block, or null for an unquantified sub-regimental bundle. */
  readonly enlRegiments: number | null;
  /** The day it mustered. */
  readonly enlMusterDay: number;
  /** Fixed expiry, or null for war service, which has no fixed expiry. */
  readonly enlEndsDay: number | null;
}

export type EnlistmentTable = Readonly<Record<ForceBlockId, Enlistment>>;

/** What a new block is, as the recruitment proposal gives it. */
export interface NewBlock {
  readonly block: ForceBlockId;
  /** The block's string-table key. */
  readonly name: string;
  readonly department: DepartmentId;
  readonly arm: string;
  readonly strength: number | null;
  readonly storesDays: number;
  readonly enlistment: Enlistment;
}

/**
 * `create` and `disband`: the changes recruitment proposes for `forces` (the proposer `OWNED_FIELDS` lists). Lane 1.12: a
 * garrison evacuated under the record's terms after a bombardment leaves play by the same disbanding, with its own cause.
 */
export type MusterDelta = { readonly change: 'create'; readonly create: NewBlock; readonly cause: 'recruitment' } | { readonly change: 'disband'; readonly block: ForceBlockId; readonly cause: 'recruitment' | 'evacuated_under_terms' };

/**
 * A new block's State: its strength is the quota answered, or remains unknown; stores are what the governor issued, in
 * the pack's starting condition (lane 1.3: morale, experience, equipment), with no stragglers, never routed or surrendered.
 */
function blockState(b: NewBlock, condition: BlockCondition): ForceBlockState {
  return {
    fbName: b.name,
    fbKind: 'block',
    fbParent: null,
    fbDepartment: b.department,
    fbArm: b.arm,
    fbStrength: b.strength,
    fbNonCombatants: 0,
    fbStoresMilli: b.storesDays * STORES_MILLI,
    // Issued with the block (lane 1.7), so a source's figure, never a pack norm's (lane 1.4).
    fbStoresAssumed: false,
    fbMorale: condition.morale,
    fbExperience: condition.experience,
    fbEquipment: condition.equipment,
    fbStragglers: 0,
    fbRoutedDay: null,
    fbSurrenderedDay: null,
  };
}

/**
 * Apply recruitment's creations and disbandings, in order: the only way a block comes to be or ceases in play. A block
 * created must be new; a block disbanded must exist, and its detachments go with it. Returns the blocks created and
 * disbanded (detachments included), in id order.
 */
export function applyMusters(map: WorldIndex, state: State, deltas: readonly MusterDelta[]): { readonly state: State; readonly created: readonly ForceBlockId[]; readonly disbanded: readonly ForceBlockId[] } {
  if (deltas.length === 0) return { state, created: [], disbanded: [] };
  const blocks: Record<ForceBlockId, ForceBlockState> = { ...state.forceBlockStates };
  const enlistments: Record<ForceBlockId, Enlistment> = { ...state.forceEnlistments };
  const created: ForceBlockId[] = [];
  const disbanded: ForceBlockId[] = [];
  for (const d of deltas) {
    if (d.change === 'create') {
      const b = d.create;
      if (Object.prototype.hasOwnProperty.call(blocks, b.block)) throw new ForcesError([`force block ${b.block} already exists`]);
      if ((b.strength !== null && (!Number.isSafeInteger(b.strength) || b.strength < 0)) || !Number.isSafeInteger(b.storesDays) || b.storesDays < 0) throw new ForcesError([`force block ${b.block}: strength must be unknown or whole and nonnegative; stores must be whole and nonnegative`]);
      blocks[b.block] = blockState(b, startingCondition(map));
      enlistments[b.block] = b.enlistment;
      created.push(b.block);
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(blocks, d.block)) throw new ForcesError([`unknown force block ${d.block}`]);
    const gone = [d.block, ...(Object.keys(blocks) as ForceBlockId[]).filter((id) => blocks[id]!.fbParent === d.block)];
    for (const id of gone) {
      delete blocks[id];
      delete enlistments[id];
      disbanded.push(id);
    }
  }
  return { state: { ...state, forceBlockStates: blocks, forceEnlistments: enlistments }, created: created.sort(strictCompare), disbanded: disbanded.sort(strictCompare) };
}

/** The enlistments whose term ends on or before `day`, in block id order. */
export function enlistmentsEnding(state: State, day: number): ForceBlockId[] {
  return (Object.keys(state.forceEnlistments) as ForceBlockId[]).filter((id) => { const end=state.forceEnlistments[id]!.enlEndsDay; return end !== null && end <= day; }).sort(strictCompare);
}
