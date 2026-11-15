/**
 * A person's rank as State, owned by `people` (0050: "each part of a start is
 * copied into State once at setup ... ranks by `people`"; FOUNDATION section
 * 10's row "a person's rank and its date (seniority)"). Phase 0 builds the copy
 * at setup; nothing writes ranks in play yet. Promotion lists and appointments
 * (Phase 1) will propose changes for `people` to apply.
 *
 * The M2 kernel's people module (`../people.ts`) is a separate, older file: it
 * runs on M2's `GameState` until the Phase 1 people recast.
 */
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { daysInMonth, parseIsoDate } from '../world/calendar.ts';
import type { WorldIndex } from '../world/index.ts';
import type { RankHeld } from '../world/people.ts';

/** The rank a person holds, and the date he has held it from (his seniority), as the World gives it. */
export interface PersonRank {
  /** A rank from the pack's vocabulary. */
  readonly rankTerm: string;
  /** The date he holds it from: ISO, or year-month or year when the day is not in the source. */
  readonly rankSince: string;
}

export type RankTable = Readonly<Record<PersonId, PersonRank>>;

/**
 * The last day a historical date can mean: a full date is itself; a year-month is that month's last day; a year is
 * 31 December. Throws `RangeError` for anything else.
 */
export function latestDayOf(historical: string): string {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(historical);
  if (m === null) throw new RangeError(`"${historical}" is not a historical date (YYYY-MM-DD, YYYY-MM or YYYY)`);
  if (m[3] !== undefined) return historical;
  if (m[2] !== undefined) {
    const month = Number(m[2]);
    if (month < 1 || month > 12) throw new RangeError(`"${historical}" is not a historical date (YYYY-MM-DD, YYYY-MM or YYYY)`);
    return `${m[1]}-${m[2]}-${String(daysInMonth(Number(m[1]), month)).padStart(2, '0')}`;
  }
  return `${m[1]}-12-31`;
}

/**
 * The rank a person holds on `isoDate`: the last of his ranks (in date order, as the World keeps them) whose date is
 * certainly on or before it. A date given only to the month or the year counts from its last possible day, so a rank
 * is never claimed before its source certainly gives it. Null when he holds none by then.
 */
export function rankOn(ranks: readonly RankHeld[], isoDate: string): PersonRank | null {
  let held: PersonRank | null = null;
  for (const r of ranks) if (strictCompare(latestDayOf(r.from), isoDate) <= 0) held = { rankTerm: r.rank, rankSince: r.from };
  return held;
}

/** Every person's rank at the start date, in person id order; a person with none by then is absent. */
export function initialRanks(map: WorldIndex, startDate: string): RankTable {
  parseIsoDate(startDate);
  const out: Record<PersonId, PersonRank> = {};
  for (const p of [...map.world.people].sort((a, b) => strictCompare(a.id, b.id))) {
    const held = rankOn(p.ranks, startDate);
    if (held !== null) out[p.id] = held;
  }
  return out;
}
