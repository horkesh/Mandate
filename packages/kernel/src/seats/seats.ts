/**
 * Seat assignments (writer: `seats`; decision 0015). Every person is a seat,
 * driven by the rules model, an AI model, or (later) a human. The driver
 * matters only to the shell, which decides whom to ask; the kernel treats
 * every answer the same way, because every answer is logged.
 */
import { strictCompare } from '../compare.ts';
import { toId, type PersonId, type SeatId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { IndexedWorld } from '../standin/world.ts';
import type { SeatDriver } from './api.ts';

export interface SeatAssignment {
  readonly id: SeatId;
  readonly seatPerson: PersonId;
  readonly seatDriver: SeatDriver;
}

/** The seat that decides for a person. One seat per person, so the id is derived and never re-minted. */
export function seatIdFor(person: PersonId): SeatId {
  return toId('seat', `seat:${person}`);
}

/** Every person gets a seat on the rules model; `drivers` overrides some (the player's seat: `human`). */
export function initialSeats(world: IndexedWorld, drivers: Readonly<Record<string, SeatDriver>> = {}): Readonly<Record<SeatId, SeatAssignment>> {
  const out: Record<SeatId, SeatAssignment> = {};
  for (const person of world.personIds) {
    const id = seatIdFor(person);
    out[id] = { id, seatPerson: person, seatDriver: drivers[person] ?? 'rules' };
  }
  return out;
}

export function seatOf(state: State, seat: SeatId): SeatAssignment {
  const s = state.seatAssignments[seat];
  if (s === undefined) throw new RangeError(`unknown seat id "${seat}"`);
  return s;
}

export function seatIds(state: State): SeatId[] {
  return (Object.keys(state.seatAssignments) as SeatId[]).sort(strictCompare);
}

/** Change who drives a seat (the player's settings, or an AI seat falling back for good). */
export function reassignSeat(state: State, seat: SeatId, driver: SeatDriver): State {
  const current = seatOf(state, seat);
  if (current.seatDriver === driver) return state;
  return { ...state, seatAssignments: { ...state.seatAssignments, [seat]: { id: seat, seatPerson: current.seatPerson, seatDriver: driver } } };
}
