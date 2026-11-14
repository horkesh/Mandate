/**
 * Situations in play (writer: `situations`; FOUNDATION section 10; 0040, 0046).
 *
 * Two root fields, both written only here, copy-on-write (0052):
 * - `situationStates`: each situation that has fired, with its status (open,
 *   waiting on a condition, decided, lapsed, or a notice given), its clock,
 *   the options open now, the thresholds it has resurfaced at, who decided and
 *   how, a delegate, and who wrote its staff line;
 * - `situationFlags`: the chain state that effects set and clear, and later
 *   situations' conditions read (0046: situation chain and wait state).
 *
 * A situation that has not fired has no record. The tick (`tick/situations.ts`)
 * decides when each change happens; this module only records it.
 */
import type { PersonId, SituationId } from '../ids.ts';
import type { State } from '../root-state.ts';

export const SITUATION_STATUSES = ['decided', 'lapsed', 'noticed', 'open', 'waiting'] as const;
export type SituationStatus = (typeof SITUATION_STATUSES)[number];

/** How a decision was reached. */
export const DECIDED_BY = ['delegate', 'history-default', 'inaction', 'lapse', 'principal'] as const;
export type DecidedBy = (typeof DECIDED_BY)[number];

export interface SituationRecord {
  readonly sitStatus: SituationStatus;
  /** The day its event held: its clock starts here. */
  readonly sitFiredDay: number;
  /** The day news reached the deciding seat (its knowledge condition held); null until then. */
  readonly sitSurfacedDay: number | null;
  /** Options open now, in display order (appeared and not expired). */
  readonly sitOpenOptions: readonly string[];
  /** Clock thresholds already crossed (each ends a turn once). */
  readonly sitResurfaced: readonly number[];
  readonly sitDecidedDay: number | null;
  /** Options taken, in display order; empty for inaction or a lapse. While a reopened decision is pending, the spent waiting option. */
  readonly sitChosen: readonly string[];
  readonly sitDecidedBy: DecidedBy | null;
  /** The holder the choice was handed to; his seat decides from the same options (0040, B7). */
  readonly sitDelegate: PersonId | null;
  /** The waiting option taken, while the situation waits on its condition. */
  readonly sitWaitingOn: string | null;
  /** Who wrote the staff recommendation; null if every author post was vacant or held by a subject. */
  readonly sitStaffAuthor: PersonId | null;
}

function put(state: State, id: SituationId, record: SituationRecord): State {
  return { ...state, situationStates: { ...state.situationStates, [id]: record } };
}

export function situationRecord(state: State, id: SituationId): SituationRecord | undefined {
  return state.situationStates[id];
}

function existing(state: State, id: SituationId): SituationRecord {
  const r = state.situationStates[id];
  if (r === undefined) throw new RangeError(`situation ${id} has not fired`);
  return r;
}

/** A situation's event held today: a decision opens, a notice is given. */
export function fireSituation(state: State, id: SituationId, day: number, kind: 'decision' | 'notice', openOptions: readonly string[]): State {
  if (state.situationStates[id] !== undefined) throw new RangeError(`situation ${id} has already fired`);
  return put(state, id, {
    sitStatus: kind === 'notice' ? 'noticed' : 'open',
    sitFiredDay: day,
    sitSurfacedDay: null,
    sitOpenOptions: openOptions,
    sitResurfaced: [],
    sitDecidedDay: null,
    sitChosen: [],
    sitDecidedBy: null,
    sitDelegate: null,
    sitWaitingOn: null,
    sitStaffAuthor: null,
  });
}

/** News reached the deciding seat today. */
export function surfaceSituation(state: State, id: SituationId, day: number, staffAuthor: PersonId | null): State {
  return put(state, id, { ...existing(state, id), sitSurfacedDay: day, sitStaffAuthor: staffAuthor });
}

export function setOpenOptions(state: State, id: SituationId, openOptions: readonly string[]): State {
  return put(state, id, { ...existing(state, id), sitOpenOptions: openOptions });
}

export function markResurfaced(state: State, id: SituationId, threshold: number): State {
  const r = existing(state, id);
  return put(state, id, { ...r, sitResurfaced: [...r.sitResurfaced, threshold].sort((a, b) => a - b) });
}

export function delegateSituation(state: State, id: SituationId, delegate: PersonId): State {
  return put(state, id, { ...existing(state, id), sitDelegate: delegate });
}

/** Record a decision: options taken (or none: inaction or a lapse), by whom, and whether it now waits on a condition. */
export function recordDecision(state: State, id: SituationId, day: number, chosen: readonly string[], by: DecidedBy, waitingOn: string | null): State {
  const r = existing(state, id);
  return put(state, id, {
    ...r,
    sitStatus: waitingOn !== null ? 'waiting' : by === 'lapse' ? 'lapsed' : 'decided',
    sitDecidedDay: day,
    sitChosen: chosen,
    sitDecidedBy: by,
    sitWaitingOn: waitingOn,
  });
}

/** A waiting situation's condition held: it opens again with a reduced set of options (0046). */
export function reopenSituation(state: State, id: SituationId, day: number, openOptions: readonly string[]): State {
  // The waiting option stays in sitChosen as spent, so it is never offered again; the decision is pending once more.
  return put(state, id, { ...existing(state, id), sitStatus: 'open', sitOpenOptions: openOptions, sitWaitingOn: null, sitSurfacedDay: day, sitDelegate: null, sitDecidedDay: null, sitDecidedBy: null });
}

/** Set and clear chain flags; a flag records the day it was set. */
export function applyFlags(state: State, set: readonly string[], clear: readonly string[], day: number): State {
  if (set.length === 0 && clear.length === 0) return state;
  const next: Record<string, number> = { ...state.situationFlags };
  for (const f of clear) delete next[f];
  for (const f of set) if (next[f] === undefined) next[f] = day;
  return { ...state, situationFlags: next };
}
