/**
 * What supply and movement may pass today (a pure read of State): `infrastructure`'s
 * network (edge and depot condition, obstructions) and `command`'s neutral ground
 * (each neutral government's regions, open or closed: 0055 as amended by 0058).
 * Also the pocket diff: whoever changes passage reports the pockets it closes, relieves or
 * loses (the map phase for control and the network; the proposals phase for a government
 * closing). Its own module so the map and forces phases share it without importing each other.
 */
import { governmentRailOf, neutralGroundOf } from '../command/command.ts';
import type { DerivedMap } from '../control-index/derived.ts';
import type { FactionId, RegionId } from '../ids.ts';
import { networkOf } from '../infrastructure/infrastructure.ts';
import type { State } from '../root-state.ts';
import type { NetworkConditions } from '../supply/supply.ts';
import type { WorldIndex } from '../world/index.ts';
import { fire, type TickContext } from './context.ts';

export function passageOf(map: WorldIndex, state: State): NetworkConditions {
  return { ...networkOf(state), neutralGround: neutralGroundOf(map, state), governmentRail: governmentRailOf(map, state) };
}
function pocketRegions(derived: DerivedMap, faction: FactionId): Set<RegionId> {
  return new Set(derived.supply.factions.get(faction)!.pockets.flatMap((p) => p.regions));
}

/** Report what changed between two derivations: pockets closed (regions newly cut off), relieved (a path reaches them again) and lost (no longer traced). */
export function reportPocketChanges(ctx: TickContext, yesterday: DerivedMap, today: DerivedMap): void {
  if (today === yesterday) return;
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
