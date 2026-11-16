/**
 * A person's ranks as State, owned by `people` (0050: "each part of a start is
 * copied into State once at setup ... ranks by `people`"; FOUNDATION section
 * 10's row "a person's ranks, one per kind (regular, volunteer, brevet) held at
 * once, each with its date", 0073). Each rank term's kind comes from the pack's
 * vocabulary (`RankTerm.kind`). Appointments and promotion lists propose a rank
 * for `people` to apply (`applyPeopleChanges`).
 *
 * The M2 kernel's people module (`../people.ts`) is a separate, older file: it
 * runs on M2's `GameState` until lane 1.13 deletes it.
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

/** Each person's rank of each kind he holds: absent for a person with none, a kind absent when he holds none of it. */
export type RankTable = Readonly<Record<PersonId, Readonly<Record<string, PersonRank>>>>;

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

/** The rank kind of a rank term, from the pack's vocabulary. Throws for a rank the vocabulary lacks (the kernel takes any World it is handed). */
function rankKindOf(map: WorldIndex, rank: string): string {
  const term = map.world.vocabularies.ranks.find((r) => r.id === rank);
  if (term === undefined) throw new RangeError(`rank "${rank}" is not in the pack's rank vocabulary`);
  return term.kind;
}

/** A person's rank of each kind on `isoDate`: for each kind, the last of its ranks certainly held by then (`rankOn`). */
export function ranksOn(map: WorldIndex, ranks: readonly RankHeld[], isoDate: string): Record<string, PersonRank> {
  const byKind = new Map<string, RankHeld[]>();
  for (const r of ranks) {
    const kind = rankKindOf(map, r.rank);
    byKind.set(kind, [...(byKind.get(kind) ?? []), r]);
  }
  const out: Record<string, PersonRank> = {};
  for (const kind of [...byKind.keys()].sort(strictCompare)) {
    const held = rankOn(byKind.get(kind)!, isoDate);
    if (held !== null) out[kind] = held;
  }
  return out;
}

/** Every person's ranks at the start date, in person id order; a person with none by then is absent. */
export function initialRanks(map: WorldIndex, startDate: string): RankTable {
  parseIsoDate(startDate);
  const out: Record<PersonId, Readonly<Record<string, PersonRank>>> = {};
  for (const p of [...map.world.people].sort((a, b) => strictCompare(a.id, b.id))) {
    const held = ranksOn(map, p.ranks, startDate);
    if (Object.keys(held).length > 0) out[p.id] = held;
  }
  return out;
}