/**
 * The tick's map phases (FOUNDATION section 10, day-tick phases 5 and 10):
 * control changes, the derived map, and the invariant barrier. They run only
 * when the World carries lane 0.2's map.
 *
 * Control changes come from typed deltas that mechanisms push into the tick
 * context (combat and occupation, lane 0.5); `control` applies them. The
 * derived map (fronts, pockets, supply) is read through a caller-held cache,
 * so it is rebuilt only when a holder, a threshold band, the month or the
 * network changes.
 *
 * STAND-IN: the network is intact (no edge or depot damage, no obstructions)
 * until lane 0.5's `infrastructure` State carries them; the derivation already
 * takes them (`NetworkConditions`).
 */
import { applyControl } from '../control/control.ts';
import { deriveMap, type DerivedMap, type DerivedMapCache } from '../control-index/derived.ts';
import { controlInvariants, derivedInvariants, InvariantError } from '../invariants/map.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { INTACT_NETWORK } from '../supply/supply.ts';
import { dateOfDay } from '../world/calendar.ts';
import { fire, type MapEvent, type TickContext } from './context.ts';

/** Every mechanic the map phases count (FOUNDATION section 11.5). */
export const MAP_MECHANICS = ['control.changed', 'control.threshold_crossed', 'map.pocket_closed', 'map.pocket_lost', 'map.pocket_relieved', 'map.recomputed'] as const;

/** The month of a day, from the State's calendar. */
export function monthOf(state: State, day: number): number {
  if (state.calendarStart === null) throw new RangeError('this game has no calendar (no map)');
  return dateOfDay(state.calendarStart, day).month;
}

/** Apply today's control deltas and derive the map, reporting what changed: pockets closed, relieved and lost. */
export function mapPhase(ctx: TickContext, start: State, cache: DerivedMapCache): { readonly state: State; readonly derived: DerivedMap | null } {
  const map = ctx.world.map;
  if (map === null) {
    if (ctx.controlDeltas.length > 0) throw new RangeError('control deltas were proposed in a game with no map');
    return { state: start, derived: null };
  }
  const recomputesBefore = cache.recomputes;
  const yesterday = deriveMap(map, { control: start.regionControl, month: monthOf(start, ctx.day - 1), network: INTACT_NETWORK }, cache);
  const applied = applyControl(map, start, ctx.controlDeltas.splice(0));
  for (const change of applied.changes) {
    ctx.mapEvents.push({ event: 'control_changed', change });
    fire(ctx, 'control.changed', change.after - change.before);
  }
  for (const crossing of applied.crossings) {
    ctx.mapEvents.push({ event: 'threshold_crossed', crossing });
    fire(ctx, 'control.threshold_crossed');
  }
  const today = deriveMap(map, { control: applied.state.regionControl, month: monthOf(applied.state, ctx.day), network: INTACT_NETWORK }, cache);
  if (cache.recomputes > recomputesBefore) fire(ctx, 'map.recomputed', cache.recomputes - recomputesBefore);
  if (today !== yesterday) {
    for (const faction of today.index.factions) {
      const before = pocketRegions(yesterday, faction);
      const after = pocketRegions(today, faction);
      for (const pocket of today.supply.factions.get(faction)!.pockets) {
        const newly = pocket.regions.filter((r) => !before.has(r));
        if (newly.length === 0) continue;
        ctx.mapEvents.push({ event: 'pocket_closed', faction, pocket: pocket.id, regions: newly, cut: pocket.cut });
        fire(ctx, 'map.pocket_closed');
      }
      // A region leaves a pocket in one of two ways: a supply path reaches it
      // (relieved), or the faction no longer traces it (lost: overrun or given up).
      const paths = today.supply.factions.get(faction)!.paths;
      for (const pocket of yesterday.supply.factions.get(faction)!.pockets) {
        const freed = pocket.regions.filter((r) => !after.has(r));
        const relieved = freed.filter((r) => paths.has(r));
        const lost = freed.filter((r) => !paths.has(r));
        if (relieved.length > 0) {
          ctx.mapEvents.push({ event: 'pocket_relieved', faction, pocket: pocket.id, regions: relieved, cut: null });
          fire(ctx, 'map.pocket_relieved');
        }
        if (lost.length > 0) {
          ctx.mapEvents.push({ event: 'pocket_lost', faction, pocket: pocket.id, regions: lost, cut: pocket.cut });
          fire(ctx, 'map.pocket_lost');
        }
      }
    }
  }
  return { state: applied.state, derived: today };
}

function pocketRegions(derived: DerivedMap, faction: FactionId): Set<RegionId> {
  return new Set(derived.supply.factions.get(faction)!.pockets.flatMap((p) => p.regions));
}

/**
 * The invariant barrier: control is always checked; with `deep`, the derived
 * map is also compared with a fresh derivation (tests and determinism runs).
 * Throws `InvariantError` with every typed failure.
 */
export function mapBarrier(ctx: TickContext, state: State, derived: DerivedMap | null, deep: boolean): void {
  const map = ctx.world.map;
  if (map === null) return;
  const failures = controlInvariants(map, state.regionControl);
  if (deep && derived !== null) failures.push(...derivedInvariants(map, state.regionControl, monthOf(state, ctx.day), INTACT_NETWORK, derived));
  if (failures.length > 0) throw new InvariantError(ctx.day, failures);
}
