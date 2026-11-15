/**
 * A new game's State from a World and a seed (FOUNDATION section 10).
 *
 * Every game runs on lane 0.2's World and the scenario start its seats World was
 * indexed with (`SeatsWorld.start`): each part of the start is copied once into the field its owner writes from then on
 * (0050), and the start's date becomes the calendar's day 0.
 */
import { initialCommand } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import { initialControl } from '../control/control.ts';
import { initialForces } from '../forces/forces.ts';
import type { DepartmentId, RegionId } from '../ids.ts';
import { initialInfrastructure } from '../infrastructure/infrastructure.ts';
import { initialLocations } from '../movement/movement.ts';
import { initialGoals } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import type { SeatDriver } from '../seats/api.ts';
import { initialSeats } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { parseIsoDate } from '../world/calendar.ts';
import type { WorldIndex } from '../world/index.ts';
import { UNKNOWN_GOVERNMENT, type ScenarioStart } from '../world/scenario.ts';

export interface SetupOptions {
  readonly seed: number;
  /** Seat drivers by person id; everyone else is on the rules model. */
  readonly drivers?: Readonly<Record<string, SeatDriver>>;
  /**
   * A labelled option for mechanics runs (0064): every faction's war flag starts set, as if the war's opening
   * situation had already fired, so the generic rule-seat principals move forces and contest ground from day 1.
   * Never a history run's setting: the flag is State, so the run hashes differently, and a runner says it did this.
   */
  readonly atWar?: boolean;
}

/** The chain flags the pack names as putting a faction at war, each set on day 0 (null rows, war from day 1, set nothing). */
export function warFlagsAtStart(world: SeatsWorld): Record<string, number> {
  const flags: Record<string, number> = {};
  for (const row of world.map.world.rules.ruleSeats.warFlags) if (row.flag !== null) flags[row.flag] = 0;
  return flags;
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
    situationStates: {},
    situationFlags: {},
    forceBlockStates: {},
    forceLocations: {},
    postStates: {},
    forceAssignments: {},
    infraEdgeCondition: {},
    infraDepotCondition: {},
    infraObstructions: [],
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

export function createState(world: SeatsWorld, options: SetupOptions): State {
  if (!Number.isSafeInteger(options.seed) || options.seed < 0 || options.seed > 0xffffffff) throw new RangeError('seed must be a 32-bit unsigned integer');
  const { start } = world;
  parseIsoDate(start.startDate);
  const map = world.map;
  // Each part of the start is copied once into the field its owner writes from then on (0050).
  const command = initialCommand(map, start);
  const network = initialInfrastructure(map, start);
  return {
    gameSeed: options.seed,
    calendarStart: start.startDate,
    stateDay: 0,
    regionControl: initialControl(map, start),
    regionGovernments: initialGovernments(map, start),
    closedGovernments: {},
    seatAssignments: initialSeats(world, options.drivers),
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    // Standing goals read the posts and assignments just copied: every held field post holds where it stands.
    standingGoals: initialGoals(map, command.posts, command.assignments),
    situationStates: {},
    situationFlags: options.atWar === true ? warFlagsAtStart(world) : {},
    forceBlockStates: initialForces(map, start),
    forceLocations: initialLocations(map, start),
    postStates: command.posts,
    forceAssignments: command.assignments,
    infraEdgeCondition: network.edges,
    infraDepotCondition: network.depots,
    infraObstructions: network.obstructions,
  };
}