import { changeLotTotals, forceTotals, knownStragglers } from './lots.ts';
/**
 * Detachments in play (lane 1.4b; FOUNDATION section 5: detachments below the force block, for garrisons and landings,
 * 0040; section 10's row, which shares the block's own record). A detachment is a `forces` record of kind `detachment`
 * with its parent block. `forces` writes it here; `movement` places it and `command` assigns it, in the same phase, from
 * one proposal (`tick/detachments.ts`), as lane 1.7's recruitment makes a block.
 *
 * - **Detach**: men leave the parent for the detachment, with their share of the parent's stores, in the parent's
 *   condition (morale, experience, equipment, its rout day) and under its enlistment. Strength is conserved: the parent
 *   loses exactly what the detachment has.
 * - **Rejoin**: the detachment's men, stores and stragglers return to its parent, the condition averaged by men, and the
 *   detachment ceases.
 * - **Stand alone**: the detachment becomes a block of its own, with no parent.
 * Combat and operations treat a detachment as any other block (lane 1.3's presence counts every land block standing).
 */
import type { ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { ForcesError, type ForceBlockState } from './forces.ts';

/** Who proposes a detachment's change (the proposers `OWNED_FIELDS` lists for the detachments row). */
/** Who proposed it: an operation's landing, `command`, or a situation's option (lane 1.11: S02's landing). */
export type DetachmentCause = 'operations' | 'command' | 'situations';

/** `forces`' part of a detachment proposal. */
export type DetachmentDelta =
  | { readonly change: 'detach'; readonly parent: ForceBlockId; readonly detachment: ForceBlockId; readonly men: number; readonly name: string; readonly cause: DetachmentCause }
  | { readonly change: 'rejoin'; readonly detachment: ForceBlockId; readonly cause: DetachmentCause }
  | { readonly change: 'stand_alone'; readonly detachment: ForceBlockId; readonly cause: DetachmentCause };

/** The share of `total` that `part` of `whole` carries, truncated (permille arithmetic, 0002). */
const share = (total: number, part: number, whole: number): number => (whole === 0 ? 0 : Math.trunc((total * part) / whole));
/** Two blocks' condition averaged by their men (the joining men bring their own morale, experience, equipment). */
const blend = (a: number, aMen: number, b: number, bMen: number): number => (aMen + bMen === 0 ? a : Math.trunc((a * aMen + b * bMen) / (aMen + bMen)));

/** Problems with a delta against the State as it is (empty when it can be applied). */
export function detachmentProblems(state: State, d: DetachmentDelta): string[] {
  if (d.change === 'detach') {
    const p = state.forceBlockStates[d.parent];
    if (p === undefined) return [`unknown force block ${d.parent}`];
    if (state.forceBlockStates[d.detachment] !== undefined) return [`force block ${d.detachment} already exists`];
    if (p.fbKind !== 'block') return [`${d.parent} is a detachment: only a block detaches`];
    if (p.fbSurrenderedDay !== null) return [`${d.parent} has surrendered`];
    if (forceTotals(p).fbStrength === null) return [`${d.parent}'s strength is unknown: no men can be counted out of it`];
    if (!Number.isSafeInteger(d.men) || d.men < 1 || d.men > forceTotals(p).fbStrength!) return [`${d.parent} has ${forceTotals(p).fbStrength!} men, not ${d.men} to detach`];
    return [];
  }
  const det = state.forceBlockStates[d.detachment];
  if (det === undefined) return [`unknown force block ${d.detachment}`];
  if (det.fbKind !== 'detachment' || det.fbParent === null) return [`${d.detachment} is not a detachment`];
  if (d.change === 'rejoin') {
    const p = state.forceBlockStates[det.fbParent];
    if (p === undefined || p.fbSurrenderedDay !== null) return [`${d.detachment}'s parent ${det.fbParent} is gone`];
    if (det.fbSurrenderedDay !== null) return [`${d.detachment} has surrendered`];
  }
  return [];
}

/**
 * Apply detachment deltas in order: the only way a detachment comes to be, rejoins or stands alone in play. Throws on a
 * delta with problems (the tick checks first and refuses with a reason). Returns the detachments made and removed.
 */
export function applyDetachments(state: State, deltas: readonly DetachmentDelta[]): { readonly state: State; readonly made: readonly ForceBlockId[]; readonly removed: readonly ForceBlockId[] } {
  if (deltas.length === 0) return { state, made: [], removed: [] };
  const blocks: Record<ForceBlockId, ForceBlockState> = { ...state.forceBlockStates };
  const identities = new Set(Object.values(blocks).flatMap(b => b.fbLots.map(l => l.lotId)));
  const splitId = (base: string): string => {
    let id = base;
    for (let n = 2; identities.has(id); n++) id = `${base}.${n}`;
    identities.add(id);
    return id;
  };
  const made: ForceBlockId[] = [];
  const removed: ForceBlockId[] = [];
  let current: State = state;
  for (const d of deltas) {
    const problems = detachmentProblems(current, d);
    if (problems.length > 0) throw new ForcesError(problems);
    if (d.change === 'detach') {
      const p = blocks[d.parent]!;
      const strength = forceTotals(p).fbStrength!;
      const stores = p.fbStoresMilli === null ? null : share(p.fbStoresMilli, d.men, strength);
      const parentLots = changeLotTotals(p.fbLots, strength - d.men, knownStragglers(p));
      blocks[d.detachment] = { ...p, fbName: d.name, fbKind: 'detachment', fbParent: d.parent, fbLots: p.fbLots.map((l, i) => ({ ...l, lotId: splitId(`${l.lotId}.det.${d.detachment}`), lotMen: l.lotMen === null ? null : l.lotMen - parentLots[i]!.lotMen!, lotStragglers: 0 })), fbNonCombatants: 0, fbStoresMilli: stores, fbSurrenderedDay: null };
      blocks[d.parent] = { ...p, fbLots: parentLots, fbStoresMilli: p.fbStoresMilli === null ? null : p.fbStoresMilli - stores! };
      made.push(d.detachment);
    } else if (d.change === 'rejoin') {
      const det = blocks[d.detachment]!;
      const p = blocks[det.fbParent!]!;
      const men = forceTotals(det).fbStrength ?? 0;
      const pm = forceTotals(p).fbStrength ?? 0;
      blocks[det.fbParent!] = {
        ...p,
        fbLots: [...p.fbLots, ...det.fbLots],
        fbStoresMilli: p.fbStoresMilli === null || det.fbStoresMilli === null ? p.fbStoresMilli : p.fbStoresMilli + det.fbStoresMilli,
        fbMorale: blend(p.fbMorale, pm, det.fbMorale, men),
        fbExperience: blend(p.fbExperience, pm, det.fbExperience, men),
        fbEquipment: blend(p.fbEquipment, pm, det.fbEquipment, men),
      };
      delete blocks[d.detachment];
      removed.push(d.detachment);
    } else {
      blocks[d.detachment] = { ...blocks[d.detachment]!, fbKind: 'block', fbParent: null };
    }
    current = { ...current, forceBlockStates: blocks };
  }
  return { state: { ...state, forceBlockStates: blocks }, made, removed };
}
