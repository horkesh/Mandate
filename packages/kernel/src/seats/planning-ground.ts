import { deriveMap, type DerivedMap } from '../control-index/derived.ts';
import type { State } from '../root-state.ts';
import type { NetworkConditions } from '../supply/supply.ts';
import { passageOf } from '../tick/passage.ts';
import { dateOfDay } from '../world/calendar.ts';
import type { SeatsWorld } from './world.ts';
import { createPlannerInputCache, type PlannerInputCache } from '../planner/input.ts';

export type LocalPlanningGround = () => { readonly month: number; readonly network: NetworkConditions; readonly derived: DerivedMap; readonly plannerCache?: PlannerInputCache };

/** Share the ground for one immutable morning across its local menus. Each seat still plans from its own reports. */
export function localPlanningGround(world: SeatsWorld, state: State, day: number): LocalPlanningGround {
  let ground: ReturnType<LocalPlanningGround> | undefined;
  return () => {
    if (ground === undefined) {
      const month = dateOfDay(world.start.startDate, day).month;
      const network = passageOf(world.map, state);
      ground = { month, network, derived: deriveMap(world.map, { control: state.regionControl, month, network }), plannerCache: createPlannerInputCache() };
    }
    return ground;
  };
}
