/**
 * A new game's State from a World and a seed (FOUNDATION section 10).
 *
 * With a map (lane 0.2's World, attached to the index), a scenario start is
 * required: its control is copied once into State, to be written only by
 * `control` from then on (0050), and its date becomes the calendar's day 0.
 */
import { initialControl } from '../control/control.ts';
import { initialHeadquarters } from '../movement/headquarters.ts';
import { initialGoals } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import type { SeatDriver } from '../seats/api.ts';
import { initialSeats } from '../seats/seats.ts';
import type { IndexedWorld } from '../standin/world.ts';
import { parseIsoDate } from '../world/calendar.ts';
import type { ScenarioStart } from '../world/scenario.ts';

export interface SetupOptions {
  readonly seed: number;
  /** Seat drivers by person id; everyone else is on the rules model. */
  readonly drivers?: Readonly<Record<string, SeatDriver>>;
  /** The scenario start whose control and date begin the game; required exactly when the World has a map. */
  readonly start?: ScenarioStart;
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
    seatAssignments: initialSeats(world, options.drivers),
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    standingGoals: initialGoals(world),
    headquarters: initialHeadquarters(world),
  };
}