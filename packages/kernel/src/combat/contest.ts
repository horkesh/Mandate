/**
 * A simple deterministic control contest, and occupation (FOUNDATION section
 * 12, lane 0.5; decisions 0019, 0054, 0055). Pure: it reads State and proposes
 * control deltas (to `control`) and retreats (to `movement`); it writes
 * nothing itself. Battles with losses, breakdowns and reports are Phase 1
 * `combat`; this is the stand-in that lets ground change hands in Phase 0.
 *
 * The model, stated so it can be checked:
 * - **Who is in a region.** Each side's land blocks standing there and not on
 *   a leg; ships, and troops aboard, hold no ground. A side's strength is its
 *   blocks' known men (an unknown strength counts as none, and is said so).
 * - **Who presses.** Only blocks that marched into a region in play press for
 *   it (their `locSinceDay` is after the start). Troops standing where the start
 *   put them hold their ground but take nothing: a garrison left behind under a
 *   truce, before the fighting starts, is not an invasion. A region where nobody
 *   presses changes nothing.
 * - **Neutral ground is passed, never taken by arms** (0055; review S1). A
 *   region of a neutral government's (open or closed, `neutralGround`) where no
 *   side holds any share changes no control, whoever stands there and however a
 *   clash goes: a situation decides that ground. Ground of unknown government is
 *   not neutral and is taken as usual.
 * - **Occupation.** One side alone, pressing, gains `occupyPermille` a day at
 *   `occupyFullMen` or more, and in proportion below it (cause `occupation`; the
 *   gain comes out of the others' shares): a few hundred men pass through a
 *   county, they do not take it.
 * - **Contest.** Where two or more sides stand and one of them presses, the strongest (most men; a tie
 *   changes nothing) gains `contestPermille` times its margin over the next,
 *   `(s1 - s2) / s1`, a day (cause `combat`).
 * - **Retreat** (0019). A side whose share there, after today's deltas, is
 *   below the pack's retreat threshold falls back to the neighbouring land
 *   region, across an edge land troops may use this month, where its share is
 *   at or above that threshold: the one where it holds most, ties by region id.
 *   With nowhere to go it stays, and that is reported.
 */
import { strictCompare } from '../compare.ts';
import { applyControl, type ControlDelta } from '../control/control.ts';
import type { EdgeId, FactionId, ForceBlockId, RegionId } from '../ids.ts';
import { factionOfBlock, isNaval } from '../forces/forces.ts';
import { marchBar, type MarchGround } from '../movement/march.ts';
import type { State } from '../root-state.ts';
import { edgeLeg } from '../supply/supply.ts';
import { otherEnd } from '../world/index.ts';

/** DESIGN PARAMETERS until the pack format carries them (listed for the lead). */
export interface ContestRules {
  /** Control a side alone in a held region gains a day at full strength, permille. */
  readonly occupyPermille: number;
  /** The men at which occupation reaches its full rate; fewer gain in proportion. */
  readonly occupyFullMen: number;
  /** Control the stronger side gains a day at an overwhelming margin, permille. */
  readonly contestPermille: number;
}

export const DEFAULT_CONTEST_RULES: ContestRules = Object.freeze({ occupyPermille: 100, occupyFullMen: 5000, contestPermille: 200 });

/** One side's presence in a region (hard rule 6: the terms behind a contest). */
export interface Presence {
  readonly faction: FactionId;
  readonly men: number;
  readonly blocks: readonly ForceBlockId[];
  /** Blocks that marched in during play, and so press for the region. */
  readonly pressing: readonly ForceBlockId[];
  /** Blocks whose strength no source gives, counted as none. */
  readonly unknown: readonly ForceBlockId[];
}

export interface ContestRecord {
  readonly region: RegionId;
  readonly kind: 'occupation' | 'contest';
  /** Every side present, strongest first (ties by faction id). */
  readonly sides: readonly Presence[];
  /** The side that gains, or null for a tie. */
  readonly gainer: FactionId | null;
  readonly deltaPermille: number;
}

export interface Retreat {
  readonly faction: FactionId;
  readonly from: RegionId;
  /** Where they fall back to, or null when nowhere passes the threshold. */
  readonly to: RegionId | null;
  readonly edge: EdgeId | null;
  readonly blocks: readonly ForceBlockId[];
  /** The side's share in `from` after today's deltas, which fell below the threshold. */
  readonly sharePermille: number;
}

export interface ContestResult {
  readonly records: readonly ContestRecord[];
  readonly deltas: readonly ControlDelta[];
  readonly retreats: readonly Retreat[];
}

/** Each side's land troops standing (not marching, not aboard) in each region, by region then strength. */
export function presenceByRegion(ground: MarchGround, state: State): Map<RegionId, Presence[]> {
  const raw = new Map<RegionId, Map<FactionId, { men: number; blocks: ForceBlockId[]; pressing: ForceBlockId[]; unknown: ForceBlockId[] }>>();
  const ids = Object.keys(state.forceLocations) as ForceBlockId[];
  for (const id of ids.sort(strictCompare)) {
    const loc = state.forceLocations[id]!;
    if (loc.locMarch !== null || loc.locAboard !== null) continue;
    const kind = ground.map.regions.get(loc.locRegion)!.kind;
    if (kind !== 'land' && kind !== 'key_point') continue;
    if (isNaval(ground.map, state, id)) continue;
    const faction = factionOfBlock(ground.map, state, id);
    if (faction === null) continue;
    const byFaction = raw.get(loc.locRegion) ?? new Map();
    raw.set(loc.locRegion, byFaction);
    const p = byFaction.get(faction) ?? { men: 0, blocks: [], pressing: [], unknown: [] };
    byFaction.set(faction, p);
    const men = state.forceBlockStates[id]!.fbStrength;
    p.blocks.push(id);
    if (loc.locSinceDay > 0) p.pressing.push(id);
    if (men === null) p.unknown.push(id);
    else p.men += men;
  }
  const out = new Map<RegionId, Presence[]>();
  for (const region of [...raw.keys()].sort(strictCompare)) {
    const sides = [...raw.get(region)!].map(([faction, p]) => ({ faction, ...p })).sort((a, b) => b.men - a.men || strictCompare(a.faction, b.faction));
    out.set(region, sides);
  }
  return out;
}

/** Today's contests and occupations, with the control deltas and retreats they propose. */
export function contest(ground: MarchGround, state: State, rules: ContestRules = DEFAULT_CONTEST_RULES): ContestResult {
  const records: ContestRecord[] = [];
  const deltas: ControlDelta[] = [];
  const presence = presenceByRegion(ground, state);
  for (const [region, sides] of presence) {
    // Nobody marched in: garrisons and armies where the start put them take nothing.
    if (!sides.some((s) => s.pressing.length > 0)) continue;
    const shares = state.regionControl[region] ?? {};
    // A neutral government's ground nobody holds a share of is passed, never taken by arms (0055; review S1).
    if (Object.keys(shares).length === 0 && ground.network.neutralGround?.[region] !== undefined) continue;
    if (sides.length === 1) {
      const side = sides[0]!;
      const have = shares[side.faction] ?? 0;
      if (have >= 1000) continue;
      const rate = Math.trunc((rules.occupyPermille * Math.min(side.men, rules.occupyFullMen)) / rules.occupyFullMen);
      const delta = Math.min(rate, 1000 - have);
      if (delta <= 0) continue;
      records.push({ region, kind: 'occupation', sides, gainer: side.faction, deltaPermille: delta });
      deltas.push({ region, faction: side.faction, deltaPermille: delta, cause: 'occupation' });
      continue;
    }
    const [first, second] = [sides[0]!, sides[1]!];
    if (first.men === second.men) {
      records.push({ region, kind: 'contest', sides, gainer: null, deltaPermille: 0 });
      continue;
    }
    const delta = Math.trunc((rules.contestPermille * (first.men - second.men)) / first.men);
    records.push({ region, kind: 'contest', sides, gainer: first.faction, deltaPermille: delta });
    if (delta > 0) deltas.push({ region, faction: first.faction, deltaPermille: delta, cause: 'combat' });
  }
  const contested = new Set(records.filter((r) => r.kind === 'contest').map((r) => r.region));
  return { records, deltas, retreats: retreatsAfter(ground, state, presence, deltas, contested) };
}

/** Retreats from today's contested regions only: where nobody pressed, nobody is driven out. */
function retreatsAfter(ground: MarchGround, state: State, presence: ReadonlyMap<RegionId, readonly Presence[]>, deltas: readonly ControlDelta[], contested: ReadonlySet<RegionId>): Retreat[] {
  const threshold = ground.map.world.rules.retreatControlPermille;
  // Shares after today's deltas, exactly as `control` will apply them (reused, never copied: FOUNDATION 11.11).
  const control = applyControl(ground.map, state, deltas).state.regionControl;
  const retreats: Retreat[] = [];
  for (const [region, sides] of presence) {
    if (!contested.has(region)) continue;
    for (const side of sides) {
      const share = control[region]?.[side.faction] ?? 0;
      if (share >= threshold) continue;
      let best: { to: RegionId; edge: EdgeId; share: number } | null = null;
      for (const edge of ground.map.edgesAt.get(region) ?? []) {
        const to = otherEnd(edge, region);
        const leg = edgeLeg(ground.map, edge, region, ground.month, ground.network);
        if (marchBar(ground, leg, side.faction, false) !== null) continue;
        const there = state.regionControl[to]?.[side.faction] ?? 0;
        if (there < threshold) continue;
        if (best === null || there > best.share || (there === best.share && strictCompare(to, best.to) < 0)) best = { to, edge: edge.id, share: there };
      }
      retreats.push({ faction: side.faction, from: region, to: best?.to ?? null, edge: best?.edge ?? null, blocks: side.blocks, sharePermille: share });
    }
  }
  return retreats;
}
