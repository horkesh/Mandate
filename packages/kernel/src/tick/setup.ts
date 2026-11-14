/**
 * A new game's State from a World and a seed (FOUNDATION section 10).
 *
 * With a map (lane 0.2's World, attached to the index), a scenario start is
 * required: its control is copied once into State, to be written only by
 * `control` from then on (0050), and its date becomes the calendar's day 0.
 */
import { strictCompare } from '../compare.ts';
import { initialControl } from '../control/control.ts';
import type { DepartmentId, RegionId } from '../ids.ts';
import { initialHeadquarters } from '../movement/headquarters.ts';
import { initialGoals } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import type { SeatDriver } from '../seats/api.ts';
import { initialSeats } from '../seats/seats.ts';
import type { IndexedWorld } from '../standin/world.ts';
import { parseIsoDate } from '../world/calendar.ts';
import type { WorldIndex } from '../world/index.ts';
import { UNKNOWN_GOVERNMENT, type ScenarioStart } from '../world/scenario.ts';

export interface SetupOptions {
  readonly seed: number;
  /** Seat drivers by person id; everyone else is on the rules model. */
  readonly drivers?: Readonly<Record<string, SeatDriver>>;
  /** The scenario start whose control and date begin the game; required exactly when the World has a map. */
  readonly start?: ScenarioStart;
}

/**
 * A State with nothing in it, for asking whether a condition could hold before
 * anything has happened (the gate's B2 check). Never a game's start.
 */
export function emptyState(): State {
  return {
    gameSeed: 0,
    calendarStart: null,
    stateDay: 0,
    regionControl: {},
    regionGovernments: {},
    closedGovernments: {},
    seatAssignments: {},
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    standingGoals: {},
    headquarters: {},
    situationStates: {},
    situationFlags: {},
  };
}

export class GovernmentError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid governments:\n- ${problems.join('\n- ')}`);
    this.name = 'GovernmentError';
  }
}

/**
 * Each region's government from the start, in canonical (region id) order (0058), checked as control's setup is
 * (format review N2). Every problem is reported together: a region not in the World, a water or off-map region, a
 * region listed twice, a department not in the World. The pack validator says the same at a source cell; this keeps
 * any start the kernel is handed (a fixture, an adapter) from setting up with a bad row.
 */
export function initialGovernments(map: WorldIndex, start: ScenarioStart): Record<RegionId, DepartmentId | 'unknown'> {
  const departments = new Set(map.world.departments.map((d) => d.id));
  const problems: string[] = [];
  const out: Record<RegionId, DepartmentId | 'unknown'> = {};
  for (const g of [...start.governments].sort((a, b) => strictCompare(a.region, b.region))) {
    const region = map.regions.get(g.region);
    if (!region) {
      problems.push(`region ${g.region} is not in the World`);
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(out, g.region)) problems.push(`region ${g.region} is listed twice`);
    if (region.kind !== 'land' && region.kind !== 'key_point') problems.push(`region ${g.region} is ${region.kind}, which has no civil government`);
    if (g.department !== UNKNOWN_GOVERNMENT && !departments.has(g.department)) problems.push(`region ${g.region}: department ${g.department} is not in the World`);
    out[g.region] = g.department;
  }
  if (problems.length > 0) throw new GovernmentError(problems);
  return out;
}

export function createState(world: IndexedWorld, options: SetupOptions): State {
  if (!Number.isSafeInteger(options.seed) || options.seed < 0 || options.seed > 0xffffffff) throw new RangeError('seed must be a 32-bit unsigned integer');
  if ((world.map === null) !== (options.start === undefined)) throw new RangeError('a scenario start is given exactly when the World has a map');
  if (options.start !== undefined) parseIsoDate(options.start.startDate);
  return {
    gameSeed: options.seed,
    calendarStart: options.start?.startDate ?? null,
    stateDay: 0,
    regionControl: world.map !== null && options.start !== undefined ? initialControl(world.map, options.start) : {},
    regionGovernments: world.map !== null && options.start !== undefined ? initialGovernments(world.map, options.start) : {},
    closedGovernments: {},
    seatAssignments: initialSeats(world, options.drivers),
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    standingGoals: initialGoals(world),
    headquarters: initialHeadquarters(world),
    situationStates: {},
    situationFlags: {},
  };
}