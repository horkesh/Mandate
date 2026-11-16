/**
 * A new game's State from a World and a seed (FOUNDATION section 10).
 *
 * Every game runs on lane 0.2's World and the scenario start its seats World was
 * indexed with (`SeatsWorld.start`): each part of the start is copied once into the field its owner writes from then on
 * (0050), and the start's date becomes the calendar's day 0.
 */
import { initialCommand, initialDepartmentSides } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import { initialControl } from '../control/control.ts';
import { initialForces } from '../forces/forces.ts';
import type { DepartmentId, RegionId } from '../ids.ts';
import { initialInfrastructure } from '../infrastructure/infrastructure.ts';
import { initialLocations } from '../movement/movement.ts';
import { initialPeople, SHADOW_MODES, type ShadowMode } from '../people/people.ts';
import { initialFortification } from '../regions/regions.ts';
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
   * situation had already fired, so the generic rule-seat principals move forces and fight for ground from day 1.
   * Never a history run's setting: the flag is State, so the run hashes differently, and a runner says it did this.
   */
  readonly atWar?: boolean;
  /**
   * History's shadow (FOUNDATION section 6): `shadow` (the default) draws each true stat around its cited centre;
   * `as-history` puts every stat at its centre; `unknown-men` draws every stat as unknown.
   */
  readonly people?: ShadowMode;
}

export class WarFlagError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid war flags:\n- ${problems.join('\n- ')}`);
    this.name = 'WarFlagError';
  }
}

/**
 * Problems with the pack's rule-seat war flags (0064), checked at setup as control and governments are (0061): the pack
 * validator says the same at a source cell, but the kernel takes any World it is handed (a fixture, an adapter). A row
 * for a faction the World lacks, a faction listed twice, and a faction with no row (a principal's war would be undefined).
 */
export function warFlagProblems(map: WorldIndex): string[] {
  const factions = map.world.factions.map((f) => f.id);
  const rows = map.world.rules.ruleSeats.warFlags;
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!factions.includes(row.faction)) problems.push(`war flag row for ${row.faction}, which is not a faction in the World`);
    if (seen.has(row.faction)) problems.push(`faction ${row.faction} has more than one war flag row`);
    seen.add(row.faction);
  }
  for (const f of factions) if (!seen.has(f)) problems.push(`faction ${f} has no war flag row`);
  return problems;
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
    departmentFactions: {},
    seatAssignments: {},
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    planRecords: {},
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
    regionFortification: {},
    personRanks: {},
    personTrue: {},
    personTraits: {},
    personStanding: {},
    personGrievances: {},
    personRegard: {},
    personStances: {},
    personStatus: {},
    orderResponses: {},
    battleRecords: {},
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
  const flagProblems = warFlagProblems(map);
  if (flagProblems.length > 0) throw new WarFlagError(flagProblems);
  // Each part of the start is copied once into the field its owner writes from then on (0050).
  const mode = options.people ?? 'shadow';
  if (!SHADOW_MODES.includes(mode)) throw new RangeError(`people must be one of ${SHADOW_MODES.join(', ')}`);
  const command = initialCommand(map, start);
  const network = initialInfrastructure(map, start);
  // People: true stats drawn by history's shadow on each person's named stream, the rest copied from the World (lane 1.1).
  const people = initialPeople(map, start, options.seed, mode);
  return {
    gameSeed: options.seed,
    calendarStart: start.startDate,
    stateDay: 0,
    regionControl: initialControl(map, start),
    regionGovernments: initialGovernments(map, start),
    closedGovernments: {},
    departmentFactions: initialDepartmentSides(map),
    seatAssignments: initialSeats(world, options.drivers),
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    // No goal is ordered before play (lane 1.2): a post with none holds where it stands, and nothing moves it.
    planRecords: {},
    standingGoals: {},
    situationStates: {},
    situationFlags: options.atWar === true ? warFlagsAtStart(world) : {},
    forceBlockStates: initialForces(map, start),
    forceLocations: initialLocations(map, start),
    postStates: command.posts,
    forceAssignments: command.assignments,
    infraEdgeCondition: network.edges,
    infraDepotCondition: network.depots,
    infraObstructions: network.obstructions,
    regionFortification: initialFortification(map, start),
    personRanks: people.personRanks,
    personTrue: people.personTrue,
    personTraits: people.personTraits,
    personStanding: people.personStanding,
    personGrievances: people.personGrievances,
    personRegard: people.personRegard,
    personStances: people.personStances,
    personStatus: people.personStatus,
    orderResponses: {},
    battleRecords: {},
  };
}