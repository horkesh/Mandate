/**
 * Detachment proposals, applied across their three owners in one phase (lane 1.4b; as lane 1.7's recruitment makes a
 * block): `forces` makes, rejoins or frees the record (`forces/detachments.ts`), `movement` places or removes it, and
 * `command` assigns it or lets it go. Each owner writes only its own field (hard rule 5).
 *
 * - **A garrison** is detached where its parent stands, keeping the parent's arrival day: a garrison left behind does not
 *   press for ground it already held (0064's rule, which the battle model keeps).
 * - **A landing** is detached from a block aboard a ship into a land region across an edge from the ship's region; it
 *   arrives that day, so it presses there.
 * - **Rejoin** needs the detachment and its parent standing still in the same region, neither aboard, and a day after
 *   the detachment was made (lane 1.4c: so its id is never made again).
 * A proposal that cannot be carried out is refused with a typed reason, never applied in part.
 */
import { strictCompare } from '../compare.ts';
import { musterAssignments } from '../command/levies.ts';
import { applyDetachments, detachmentProblems, type DetachmentCause, type DetachmentDelta } from '../forces/detachments.ts';
import type { ForceBlockId, PostId, RegionId } from '../ids.ts';
import { placeAndRemove, type MusterPlacement } from '../movement/movement.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { otherEnd } from '../world/index.ts';

export type DetachmentProposal =
  | { readonly kind: 'garrison'; readonly parent: ForceBlockId; readonly men: number; readonly post: PostId | null; readonly cause: DetachmentCause }
  | { readonly kind: 'landing'; readonly parent: ForceBlockId; readonly men: number; readonly region: RegionId; readonly post: PostId | null; readonly cause: DetachmentCause }
  | { readonly kind: 'rejoin'; readonly detachment: ForceBlockId; readonly cause: DetachmentCause }
  | { readonly kind: 'stand_alone'; readonly detachment: ForceBlockId; readonly cause: DetachmentCause };

export const DETACHMENT_REFUSALS = ['forces', 'not_standing', 'not_aboard', 'not_adjacent', 'not_land', 'apart', 'no_post', 'same_day'] as const;
export type DetachmentRefusal = (typeof DETACHMENT_REFUSALS)[number];

export interface DetachmentResult {
  readonly state: State;
  /** Detachments made (garrisons and landings), in the order proposed. */
  readonly made: readonly ForceBlockId[];
  readonly rejoined: readonly ForceBlockId[];
  readonly freed: readonly ForceBlockId[];
  readonly refused: readonly { readonly proposal: DetachmentProposal; readonly reason: DetachmentRefusal; readonly why: string }[];
}

/**
 * A detachment's id: its parent's and the day it is made, with a counter for a second the same day (content-derived).
 * It is never re-minted (lane 1.4c; 0081), with no memory in State: a detachment cannot rejoin on the day it was made
 * (`madeToday`, refused `same_day`), so any id a rejoin frees carries an earlier day than today's, and every id made
 * from now on carries today's or a later one. Within a call, `taken` keeps a second detachment the same day apart.
 */
export function detachmentId(state: State, parent: ForceBlockId, day: number, taken: ReadonlySet<string>): ForceBlockId {
  for (let n = 1; ; n++) {
    const id = `${parent}.det.${day}${n === 1 ? '' : `.${n}`}` as ForceBlockId;
    if (state.forceBlockStates[id] === undefined && !taken.has(id)) return id;
  }
}

/** Whether detachment was made from parent on day: its id carries the day it was made (detachmentId). */
export function madeToday(detachment: ForceBlockId, parent: ForceBlockId, day: number): boolean {
  const stem = `${parent}.det.${day}`;
  return detachment === stem || detachment.startsWith(`${stem}.`);
}

/** Apply detachment proposals, each in full or refused. */
export function applyDetachmentProposals(map: WorldIndex, start: State, proposals: readonly DetachmentProposal[], day: number): DetachmentResult {
  let state = start;
  const made: ForceBlockId[] = [];
  const rejoined: ForceBlockId[] = [];
  const freed: ForceBlockId[] = [];
  const refused: DetachmentResult['refused'][number][] = [];
  const taken = new Set<string>();
  for (const p of proposals) {
    const refuse = (reason: DetachmentRefusal, why: string) => refused.push({ proposal: p, reason, why });
    if (p.kind === 'garrison' || p.kind === 'landing') {
      const loc = state.forceLocations[p.parent];
      if (loc === undefined) {
        refuse('forces', `unknown force block ${p.parent}`);
        continue;
      }
      if (loc.locMarch !== null) {
        refuse('not_standing', `${p.parent} is on a leg`);
        continue;
      }
      let region: RegionId;
      let since: number;
      if (p.kind === 'garrison') {
        if (loc.locAboard !== null) {
          refuse('not_standing', `${p.parent} is aboard ${loc.locAboard}: a garrison stands on land; a landing goes ashore`);
          continue;
        }
        region = loc.locRegion;
        since = loc.locSinceDay;
      } else {
        if (loc.locAboard === null) {
          refuse('not_aboard', `${p.parent} is not aboard a ship`);
          continue;
        }
        const target = map.regions.get(p.region);
        if (target === undefined || (target.kind !== 'land' && target.kind !== 'key_point')) {
          refuse('not_land', `${p.region} is not land`);
          continue;
        }
        if (!(map.edgesAt.get(loc.locRegion) ?? []).some((e) => otherEnd(e, loc.locRegion) === p.region)) {
          refuse('not_adjacent', `${p.region} is not across an edge from the ship's region ${loc.locRegion}`);
          continue;
        }
        region = p.region;
        since = day;
      }
      const post = p.post ?? state.forceAssignments[p.parent] ?? null;
      if (post === null || state.postStates[post] === undefined) {
        refuse('no_post', `no post commands ${p.parent}, and none was named`);
        continue;
      }
      const detachment = detachmentId(state, p.parent, day, taken);
      const delta: DetachmentDelta = { change: 'detach', parent: p.parent, detachment, men: p.men, name: `detachment.${p.parent}`, cause: p.cause };
      const problems = detachmentProblems(state, delta);
      if (problems.length > 0) {
        refuse('forces', problems.join('; '));
        continue;
      }
      taken.add(detachment);
      state = applyDetachments(state, [delta]).state;
      const placement: MusterPlacement = { block: detachment, region, day: since };
      state = placeAndRemove(map, state, [placement], []);
      state = musterAssignments(state, [], [{ block: detachment, post }], []);
      made.push(detachment);
      continue;
    }
    const delta: DetachmentDelta = p.kind === 'rejoin' ? { change: 'rejoin', detachment: p.detachment, cause: p.cause } : { change: 'stand_alone', detachment: p.detachment, cause: p.cause };
    const problems = detachmentProblems(state, delta);
    if (problems.length > 0) {
      refuse('forces', problems.join('; '));
      continue;
    }
    if (p.kind === 'stand_alone') {
      state = applyDetachments(state, [delta]).state;
      freed.push(p.detachment);
      continue;
    }
    // A rejoin the day it was made would free an id a later make that day could take again (lane 1.4c): it waits a day.
    if (madeToday(p.detachment, state.forceBlockStates[p.detachment]!.fbParent!, day)) {
      refuse('same_day', `${p.detachment} was made today: it rejoins on a later day, so its id is never made again`);
      continue;
    }
    const det = state.forceLocations[p.detachment];
    const parent = state.forceLocations[state.forceBlockStates[p.detachment]!.fbParent!];
    if (det === undefined || parent === undefined || det.locMarch !== null || parent.locMarch !== null || det.locAboard !== null || parent.locAboard !== null || det.locRegion !== parent.locRegion) {
      refuse('apart', `${p.detachment} and its parent do not stand still together on land`);
      continue;
    }
    state = applyDetachments(state, [delta]).state;
    state = placeAndRemove(map, state, [], [p.detachment]);
    state = musterAssignments(state, [], [], [p.detachment]);
    // Its id is spent: no detachment made later today takes it again.
    rejoined.push(p.detachment);
  }
  return { state, made, rejoined: rejoined.sort(strictCompare), freed: freed.sort(strictCompare), refused };
}
