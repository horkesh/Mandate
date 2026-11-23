import { forceTotals } from './lots.ts';
/**
 * New blocks and their enlistments (lane 1.7; FOUNDATION section 12 row 1.7): `forces` creates a block a governor's
 * regiments muster into, renews a sourced voluntary term without adding men, and disbands one whose men's term has run out (the ninety-day men).
 *
 * One recruitment proposal makes each block, applied in one phase (`tick/recruitment.ts`): `forces` creates it here
 * (its strength, stores and enlistment), `movement` places it at its muster region and `command` assigns it to the
 * governor's post. Each owner writes only its own field (hard rule 5). Disbanding is the same proposal in reverse.
 *
 * There is no `men` stock in `economy` in 1A (that is 1B): a regiment goes straight from the governor into a block.
 */
import { unidentifiedLot, type RegimentLot } from './lots.ts';
import { strictCompare } from '../compare.ts';
import type { DepartmentId, ForceBlockId, MessageId, PersonId, PostId, SituationId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { ForcesError, startingCondition, STORES_MILLI, type BlockCondition, type ForceBlockState } from './forces.ts';

/** A lot's service terms and raising provenance. Proposals describe a batch; no block-level copy is saved. */
export interface Enlistment {
  /** The post whose holder raised it (a governor's). */
  readonly enlPost: PostId;
  /** The governor recorded at entry, or null for an institutional act while that office is vacant. */
  readonly enlRaisedBy: PersonId | null;
  /** The call it answered, or a stable act reference when enlSourceAct is present. */
  readonly enlCall: MessageId;
  /** Regiments in the block, or null for an unquantified sub-regimental bundle. */
  readonly enlRegiments: number | null;
  /** Model service-entry day; an institutional transfer does not assert a new historical enlistment. */
  readonly enlMusterDay: number;
  /** Current fixed expiry, or null for war service or an explicitly unknown original expiry. */
  readonly enlEndsDay: number | null;
  /** Present for an institutional entry; enlCall then identifies the act, not a dispatched call. */
  readonly enlSourceAct?: SituationId;
  /** The voluntary remuster's source; the original call, source and service credit stay intact. */
  readonly enlRenewedBy?: SituationId;
  /** A null expiry whose original date is unknown, rather than known war service. */
  readonly enlTermUnknown?: boolean;
  readonly enlCallId?: string;
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
  readonly stragglersUnknown?: boolean;
  readonly storesDays: number;
  readonly enlistment: Enlistment;
}

/**
 * `create`, `quantify`, `renew` and `disband`: the changes recruitment proposes for `forces` (the proposer `OWNED_FIELDS` lists). Lane 1.12: a
 * garrison evacuated under the record's terms after a bombardment leaves play by the same disbanding, with its own cause.
 */
export type MusterDelta = { readonly change: 'create'; readonly create: NewBlock; readonly cause: 'recruitment' }
  | { readonly change: 'renew'; readonly block: ForceBlockId; readonly day: number; readonly fromTermDays: number; readonly termDays: number; readonly situation: SituationId; readonly cause: 'recruitment' }
  | { readonly change: 'service'; readonly block: ForceBlockId; readonly department: DepartmentId; readonly cause: 'recruitment' }
  | { readonly change: 'quantify'; readonly block: ForceBlockId; readonly men: number; readonly regiments: number | null; readonly cause: 'recruitment' }
  | { readonly change: 'expire'; readonly block: ForceBlockId; readonly day: number; readonly cause: 'recruitment' }
  | { readonly change: 'disband'; readonly block: ForceBlockId; readonly cause: 'recruitment' | 'evacuated_under_terms' };

/**
 * A new block's State: its strength is the quota answered, or remains unknown; stores are what the governor issued, in
 * the pack's starting condition (lane 1.3: morale, experience, equipment), with no stragglers, never routed or surrendered.
 */
function blockState(b: NewBlock, condition: BlockCondition, lots: readonly RegimentLot[]): ForceBlockState {
  return {
    fbName: b.name,
    fbKind: 'block',
    fbParent: null,
    fbDepartment: b.department,
    fbArm: b.arm,
    fbLots: lots,
    fbNonCombatants: 0,
    fbStoresMilli: b.storesDays * STORES_MILLI,
    // Issued with the block (lane 1.7), so a source's figure, never a pack norm's (lane 1.4).
    fbStoresAssumed: false,
    fbMorale: condition.morale,
    fbExperience: condition.experience,
    fbEquipment: condition.equipment,
    fbRoutedDay: null,
    fbSurrenderedDay: null,
  };
}

/**
 * Apply recruitment's creations, quantified returns, term renewals and disbandings in order. A block
 * created must be new; a block disbanded must exist, and its detachments go with it. Returns the blocks created and
 * disbanded (detachments included), in id order.
 */
export function applyMusters(map: WorldIndex, state: State, deltas: readonly MusterDelta[]): { readonly state: State; readonly created: readonly ForceBlockId[]; readonly disbanded: readonly ForceBlockId[] } {
  if (deltas.length === 0) return { state, created: [], disbanded: [] };
  const blocks: Record<ForceBlockId, ForceBlockState> = { ...state.forceBlockStates };
  const enlistments: Record<ForceBlockId, Enlistment> = { ...enlistmentsOf(state, map.forceServiceCache) };
  const identities: Record<string, true> = { ...state.forceRaisedIdentities };
  const created: ForceBlockId[] = [];
  const disbanded: ForceBlockId[] = [];
  for (const d of deltas) {
    if (d.change === 'expire') {
      const b=blocks[d.block];
      if(b===undefined)throw new ForcesError([`unknown force block ${d.block}`]);
      const live=b.fbLots.filter(l=>l.lotService?.enlEndsDay == null || l.lotService.enlEndsDay>d.day);
      if(live.length>0){
        blocks[d.block]={...b,fbLots:live};
        enlistments[d.block]=enlistmentOf(blocks[d.block]!)!;
        continue;
      }
    }
    if (d.change === 'service') {
      const b = blocks[d.block];
      if (b === undefined || enlistments[d.block]?.enlSourceAct === undefined) throw new ForcesError([`invalid service transfer for ${d.block}`]);
      blocks[d.block] = { ...b, fbDepartment: d.department };
      continue;
    }
    if (d.change === 'renew') {
      const b = blocks[d.block];
      const e = enlistments[d.block];
      if (b === undefined || e === undefined || b.fbSurrenderedDay !== null || forceTotals(b).fbStrength === 0 ||
        e.enlEndsDay === null || e.enlTermUnknown === true || e.enlEndsDay <= d.day ||
        e.enlEndsDay - e.enlMusterDay !== d.fromTermDays || !Number.isSafeInteger(d.termDays) || d.termDays <= d.fromTermDays || d.termDays > map.world.rules.recruitment.maxTermDays) {
        throw new ForcesError([`invalid term renewal for ${d.block}`]);
      }
      blocks[d.block] = { ...b, fbLots: b.fbLots.map(l => ({ ...l, lotService: l.lotService === null ? null : { ...l.lotService, enlEndsDay: l.lotService.enlMusterDay + d.termDays, enlRenewedBy: d.situation } })) };
      enlistments[d.block] = enlistmentOf(blocks[d.block]!)!;
      continue;
    }
    if (d.change === 'quantify') {
      const b = blocks[d.block];
      const e = enlistments[d.block];
      if (b === undefined || e?.enlSourceAct === undefined || forceTotals(b).fbStrength !== null || !Number.isSafeInteger(d.men) || d.men < 0) throw new ForcesError([`invalid quantified return for ${d.block}`]);
      const single = b.fbLots[0];
      if (b.fbLots.length === 1 && single?.lotRegiment === null) {
        // An own-contingent return stays one lot, even when regiment count is unknown. Its
        // sourced aggregate is not a strength claim for any named regiment.
        blocks[d.block] = { ...b, fbLots: [{ ...single, lotMen: d.men, lotService: { ...e, enlRegiments: d.regiments } }] };
        enlistments[d.block] = { ...e, enlRegiments: d.regiments };
        continue;
      }
      // An aggregate return is not evidence of each regiment's strength. It
      // can confirm the original model quota, but cannot apportion a different
      // headcount or create/replace regimental identities after raising.
      const nominal = map.world.rules.recruitment.menPerRegiment;
      if (e.enlRegiments === null || d.regiments !== e.enlRegiments || b.fbLots.length !== e.enlRegiments ||
        b.fbLots.some(l => l.lotMen !== null) || d.men !== e.enlRegiments * nominal) {
        throw new ForcesError([`aggregate return cannot assign regimental strengths for ${d.block}`]);
      }
      blocks[d.block] = { ...b, fbLots: b.fbLots.map(l => ({ ...l, lotMen: nominal })) };
      enlistments[d.block] = { ...e, enlRegiments: d.regiments };
      continue;
    }
    if (d.change === 'create') {
      const b = d.create;
      if (Object.prototype.hasOwnProperty.call(blocks, b.block)) throw new ForcesError([`force block ${b.block} already exists`]);
      if ((b.strength !== null && (!Number.isSafeInteger(b.strength) || b.strength < 0)) || !Number.isSafeInteger(b.storesDays) || b.storesDays < 0) throw new ForcesError([`force block ${b.block}: strength must be unknown or whole and nonnegative; stores must be whole and nonnegative`]);
      blocks[b.block] = blockState(b, startingCondition(map), raisedLots(map, state, b, identities));
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
  return { state: { ...state, forceBlockStates: blocks, forceRaisedIdentities: identities }, created: created.sort(strictCompare), disbanded: disbanded.sort(strictCompare) };
}

/** The enlistments whose term ends on or before `day`, in block id order. */
export function enlistmentsEnding(state: State, day: number, cache?: ForceServiceCache): ForceBlockId[] {
  return (Object.keys(enlistmentsOf(state, cache)) as ForceBlockId[]).filter((id) => { const end=enlistmentOf(state.forceBlockStates[id]!, cache)!.enlEndsDay; return end !== null && end <= day; }).sort(strictCompare);
}

/** Derived block expiry: the first fixed service expiry; war/unknown remain null when no fixed term exists. */
export type ForceServiceCache = WeakMap<readonly RegimentLot[], Enlistment | undefined>;

export function enlistmentOf(block: ForceBlockState, cache?: ForceServiceCache): Enlistment | undefined {
  if (cache?.has(block.fbLots)) return cache.get(block.fbLots);
  const services = block.fbLots.flatMap(l => l.lotService === null ? [] : [l.lotService]);
  const first = services[0];
  if (first === undefined) { cache?.set(block.fbLots, undefined); return undefined; }
  const ends = services.flatMap(e => e.enlEndsDay === null ? [] : [e.enlEndsDay]);
  const end = ends.length === 0 ? null : Math.min(...ends);
  const count=block.fbLots.every(l=>l.lotRegiment!==null)?new Set(block.fbLots.map(l=>l.lotRegiment)).size:block.fbLots.length===1?first.enlRegiments:null;
  const result = first.enlEndsDay === end && first.enlRegiments===count ? first : { ...first, enlEndsDay: end, enlRegiments:count };
  cache?.set(block.fbLots, result);
  return result;
}

export function enlistmentsOf(state: State, cache?: ForceServiceCache): EnlistmentTable {
  const result: Record<ForceBlockId, Enlistment> = {};
  for (const id of Object.keys(state.forceBlockStates) as ForceBlockId[]) {
    const e = enlistmentOf(state.forceBlockStates[id]!, cache);
    if (e !== undefined) result[id] = e;
  }
  return result;
}

/**
 * Allocate the quota the model raised, filling nominal men-per-regiment in order.
 * An explicit sub-regimental quota leaves a partial last lot, never extra men.
 * This is model raising arithmetic, never an apportionment of a historical return.
 */
function raisedLots(map: WorldIndex, state: State, b: NewBlock, used: Record<string, true>): readonly RegimentLot[] {
  const e = b.enlistment;
  if (e.enlRegiments === null) return [unidentifiedLot(`unidentified.${b.block}`, b.arm, b.strength, b.stragglersUnknown === true ? null : 0, e)];
  const raiser = state.postStates[e.enlPost]?.postDepartment ?? b.department;
  const term = e.enlEndsDay === null ? null : e.enlEndsDay - e.enlMusterDay;
  const catalogue = (map.world.regimentCatalogue ?? []).filter(r => r.raisingDepartment === raiser && r.arm === b.arm && r.scope === 'regiment' &&
    (r.identityCall === undefined || r.identityCall === e.enlCallId) &&
    (r.identityCall !== undefined && r.termDays.length === 0 && r.warTerm !== true ||
      (term === null ? r.warTerm === true && e.enlTermUnknown !== true : r.termDays.includes(term))))
    .sort((a, c) => Number(c.identityCall !== undefined) - Number(a.identityCall !== undefined) || a.order - c.order || strictCompare(a.id, c.id));
  let remaining = b.strength;
  const stragglers = b.stragglersUnknown === true || (b.strength === null && catalogue.some(r => r.identityCall !== undefined)) ? null : 0;
  const out: RegimentLot[] = [];
  for (let n = 0; n < e.enlRegiments; n++) {
    const record = catalogue.find(r => used[r.id] !== true);
    const identity = record?.id ?? `generated.${b.block}.${n + 1}`;
    used[identity] = true;
    const men = remaining === null ? null : n === e.enlRegiments - 1 ? remaining : Math.min(remaining, map.world.rules.recruitment.menPerRegiment);
    if (remaining !== null) remaining -= men!;
    out.push({ lotId: identity, lotRegiment: identity, lotGenerated: record === undefined, lotArm: b.arm, lotMen: men, lotStragglers: stragglers, lotService: e });
  }
  return out;
}
