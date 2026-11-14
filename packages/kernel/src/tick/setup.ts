/**
 * A new game's State from a World and a seed (FOUNDATION section 10).
 */
import { initialHeadquarters } from '../movement/headquarters.ts';
import { initialGoals } from '../plans/standing.ts';
import type { State } from '../root-state.ts';
import type { SeatDriver } from '../seats/api.ts';
import { initialSeats } from '../seats/seats.ts';
import type { IndexedWorld } from '../standin/world.ts';

export interface SetupOptions {
  readonly seed: number;
  /** Seat drivers by person id; everyone else is on the rules model. */
  readonly drivers?: Readonly<Record<string, SeatDriver>>;
}

export function createState(world: IndexedWorld, options: SetupOptions): State {
  if (!Number.isSafeInteger(options.seed) || options.seed < 0 || options.seed > 0xffffffff) throw new RangeError('seed must be a 32-bit unsigned integer');
  return {
    gameSeed: options.seed,
    stateDay: 0,
    seatAssignments: initialSeats(world, options.drivers),
    messagesInTransit: [],
    knowledgeBySeat: {},
    reportTruth: {},
    standingGoals: initialGoals(world),
    headquarters: initialHeadquarters(world),
  };
}
