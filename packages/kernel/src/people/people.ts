/**
 * People as State, owned by `people` (lane 1.1; FOUNDATION sections 6 and 10; 0073).
 *
 * - **True stats** (competence, nerve, experience) and **temperament** (boldness, candour) are hidden. History's shadow
 *   draws each once at setup from the person's cited centre, on his own named seeded stream (`people/shadow/<id>`), so
 *   adding a person never shifts another's draw (0002, 0005, 0026). Setup options: history's shadow (the default), as
 *   history (every draw at its centre), unknown men (every stat drawn as unknown).
 * - **Traits**, **standing** (public, from the reputation centre; it moves with the press, not the truth),
 *   **grievances**, **regard** (toward the principal and between people), **stances on record** (Consult, 0040), a
 *   **status** with its day, and **ranks**, one per kind (regular, volunteer, brevet), each with its date.
 *
 * Every field here has one writer, this module (`OWNED_FIELDS`). Other mechanisms propose a typed `PeopleChange`
 * (`applyPeopleChanges`): combat a status, the press a standing, verbs regard and grievances, Consult a stance,
 * appointments and promotion lists a rank. Values are World data and do not change in play.
 */
import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { clampPermille, clampSignedPermille } from '../permille.ts';
import { createStream, nextInt, type RngStream } from '../rng.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { StatCentre } from '../world/people.ts';
import type { ScenarioStart } from '../world/scenario.ts';
import { ranksOn, type PersonRank } from './ranks.ts';
import type { ShadowRules } from './rules.ts';

/** A person's hidden true stats and temperament, permille, drawn once at setup. */
export interface PersonTrue {
  readonly trueCompetence: number;
  readonly trueNerve: number;
  readonly trueExperience: number;
  readonly trueBoldness: number;
  readonly trueCandour: number;
}

/** Something a person holds against someone (0040: a bypassed relay; FOUNDATION section 6: compliance reads them). */
export interface PersonGrievance {
  /** What kind (`bypassed`, `overruled`, `stripped`): each is answered by its own counters (P3). */
  readonly grievanceKind: string;
  readonly grievanceWeight: number;
  /** The day it was given. */
  readonly grievanceDay: number;
  /** Whom he holds it against, if anyone in particular. */
  readonly grievanceAgainst: PersonId | null;
  /** What caused it: an order's id, a situation's, or null. */
  readonly grievanceCause: string | null;
}

/** A stance on record (Consult, 0040): what he advised, which reversing later costs him consistency. */
export interface Stance {
  /** What it was about: a situation's id, or another subject's. */
  readonly stanceSubject: string;
  /** The option or course he recommended. */
  readonly stanceRecommends: string;
  readonly stanceDay: number;
  readonly stanceConfidence: number;
}

export const PERSON_STATUSES = ['serving', 'wounded', 'killed', 'captured'] as const;
export type PersonStatusKind = (typeof PERSON_STATUSES)[number];

/** A person's status and the day it began (0073; combat proposes it). */
export interface PersonStatus {
  readonly statusKind: PersonStatusKind;
  readonly statusDay: number;
}

/** History's shadow's setup option (FOUNDATION section 6). */
export type ShadowMode = 'shadow' | 'as-history' | 'unknown-men';
export const SHADOW_MODES: readonly ShadowMode[] = ['shadow', 'as-history', 'unknown-men'];

/** The people fields of a new State. */
export interface PeopleStart {
  readonly personTrue: Readonly<Record<PersonId, PersonTrue>>;
  readonly personTraits: Readonly<Record<PersonId, readonly string[]>>;
  readonly personStanding: Readonly<Record<PersonId, number>>;
  readonly personGrievances: Readonly<Record<PersonId, readonly PersonGrievance[]>>;
  readonly personRegard: Readonly<Record<PersonId, Readonly<Record<PersonId, number>>>>;
  readonly personStances: Readonly<Record<PersonId, readonly Stance[]>>;
  readonly personStatus: Readonly<Record<PersonId, PersonStatus>>;
  readonly personRanks: Readonly<Record<PersonId, Readonly<Record<string, PersonRank>>>>;
}

/**
 * One draw of history's shadow: uniform in the centre plus or minus the half-width, clamped to 0..1000. A cited
 * direction draws around its permille centre with the pack's spread; an unknown stat around the unknown centre with the
 * wider unknown spread. Each stat takes one draw from the stream, in every mode (a zero width still draws).
 */
export function drawStat(rules: ShadowRules, centre: StatCentre, mode: ShadowMode, stream: RngStream): number {
  const isKnown = mode !== 'unknown-men' && centre.direction !== null;
  const mid = isKnown ? rules.centrePermille[centre.direction!] : rules.unknownCentre;
  const half = mode === 'as-history' ? 0 : isKnown ? rules.spread : rules.unknownSpread;
  return clampPermille(mid - half + nextInt(stream, 2 * half + 1));
}

/** A person's starting regard for his principal: the pack's signed permille for its cited direction; unknown is none. */
export function regardAtStart(rules: ShadowRules, centre: StatCentre): number {
  return centre.direction === null ? 0 : clampSignedPermille(rules.regardPermille[centre.direction]);
}

/**
 * The people fields at setup (0050: each part of a start is copied once into the field its owner writes from then on).
 * True stats and standing are drawn by history's shadow; regard for the principal comes from the cited centre (none in
 * `unknown-men`); every person is serving on day 0; ranks are those held at the start date, one per kind.
 */
export function initialPeople(map: WorldIndex, start: ScenarioStart, seed: number, mode: ShadowMode): PeopleStart {
  const rules = map.world.rules.people.shadow;
  const principals = new Map(start.factions.filter((f) => f.principal !== null).map((f) => [f.faction, f.principal!]));
  const personTrue: Record<PersonId, PersonTrue> = {};
  const personTraits: Record<PersonId, readonly string[]> = {};
  const personStanding: Record<PersonId, number> = {};
  const personRegard: Record<PersonId, Readonly<Record<PersonId, number>>> = {};
  const personStatus: Record<PersonId, PersonStatus> = {};
  const personRanks: Record<PersonId, Readonly<Record<string, PersonRank>>> = {};
  for (const p of [...map.world.people].sort((a, b) => strictCompare(a.id, b.id))) {
    const stream = createStream(seed, `people/shadow/${p.id}`);
    // A fixed order of draws: three stats, then temperament, then public standing.
    personTrue[p.id] = {
      trueCompetence: drawStat(rules, p.centres.competence, mode, stream),
      trueNerve: drawStat(rules, p.centres.nerve, mode, stream),
      trueExperience: drawStat(rules, p.centres.experience, mode, stream),
      trueBoldness: drawStat(rules, p.temperament.boldness, mode, stream),
      trueCandour: drawStat(rules, p.temperament.candour, mode, stream),
    };
    personStanding[p.id] = drawStat(rules, p.centres.reputation, mode, stream);
    personTraits[p.id] = [...new Set(p.traits.map((t) => t.trait))].sort(strictCompare);
    const principal = p.faction === null ? undefined : principals.get(p.faction);
    const regard = mode === 'unknown-men' ? 0 : regardAtStart(rules, p.regard);
    if (principal !== undefined && principal !== p.id && regard !== 0) personRegard[p.id] = { [principal]: regard };
    personStatus[p.id] = { statusKind: 'serving', statusDay: 0 };
    const ranks = ranksOn(map, p.ranks, start.startDate);
    if (Object.keys(ranks).length > 0) personRanks[p.id] = ranks;
  }
  return { personTrue, personTraits, personStanding, personGrievances: {}, personRegard, personStances: {}, personStatus, personRanks };
}

/** A typed change another mechanism proposes for `people` to apply (hard rule 5: one writer). */
export type PeopleChange =
  | { readonly change: 'standing'; readonly person: PersonId; readonly delta: number }
  | { readonly change: 'regard'; readonly person: PersonId; readonly toward: PersonId; readonly delta: number }
  | { readonly change: 'grievance'; readonly person: PersonId; readonly kind: string; readonly weight: number; readonly against: PersonId | null; readonly cause: string | null }
  | { readonly change: 'status'; readonly person: PersonId; readonly status: PersonStatusKind }
  | { readonly change: 'stance'; readonly person: PersonId; readonly subject: string; readonly recommends: string; readonly confidence: number }
  | { readonly change: 'rank'; readonly person: PersonId; readonly kind: string; readonly rank: string; readonly since: string };

function known(state: State, person: PersonId): void {
  if (state.personTrue[person] === undefined) throw new RangeError(`unknown person id "${person}"`);
}

/**
 * Apply changes in the order given, on `day`; the only writer of every people field. Standing clamps to 0..1000 and
 * regard to -1000..1000 (a regard that returns to 0 is removed, so the table stays sparse). Returns the State unchanged
 * when there are no changes.
 */
export function applyPeopleChanges(state: State, changes: readonly PeopleChange[], day: number): State {
  let next = state;
  for (const c of changes) {
    known(next, c.person);
    switch (c.change) {
      case 'standing':
        next = { ...next, personStanding: { ...next.personStanding, [c.person]: clampPermille((next.personStanding[c.person] ?? 0) + c.delta) } };
        break;
      case 'regard': {
        known(next, c.toward);
        const row: Record<PersonId, number> = { ...(next.personRegard[c.person] ?? {}) };
        const value = clampSignedPermille((row[c.toward] ?? 0) + c.delta);
        if (value === 0) delete row[c.toward];
        else row[c.toward] = value;
        const table: Record<PersonId, Readonly<Record<PersonId, number>>> = { ...next.personRegard };
        if (Object.keys(row).length === 0) delete table[c.person];
        else table[c.person] = sortedRecord(row);
        next = { ...next, personRegard: table };
        break;
      }
      case 'grievance': {
        const g: PersonGrievance = { grievanceKind: c.kind, grievanceWeight: c.weight, grievanceDay: day, grievanceAgainst: c.against, grievanceCause: c.cause };
        next = { ...next, personGrievances: { ...next.personGrievances, [c.person]: [...(next.personGrievances[c.person] ?? []), g] } };
        break;
      }
      case 'status':
        next = { ...next, personStatus: { ...next.personStatus, [c.person]: { statusKind: c.status, statusDay: day } } };
        break;
      case 'stance': {
        const s: Stance = { stanceSubject: c.subject, stanceRecommends: c.recommends, stanceDay: day, stanceConfidence: c.confidence };
        next = { ...next, personStances: { ...next.personStances, [c.person]: [...(next.personStances[c.person] ?? []), s] } };
        break;
      }
      case 'rank':
        next = { ...next, personRanks: { ...next.personRanks, [c.person]: sortedRecord({ ...(next.personRanks[c.person] ?? {}), [c.kind]: { rankTerm: c.rank, rankSince: c.since } }) } };
        break;
    }
  }
  return next;
}

function sortedRecord<V>(r: Readonly<Record<string, V>>): Record<string, V> {
  const out: Record<string, V> = {};
  for (const k of Object.keys(r).sort(strictCompare)) out[k] = r[k]!;
  return out;
}

/** His regard for `toward`, signed permille (0 when none is recorded). */
export function regardOf(state: State, person: PersonId, toward: PersonId): number {
  return state.personRegard[person]?.[toward] ?? 0;
}

/** His true stats. Throws for a person the State does not hold. */
export function trueOf(state: State, person: PersonId): PersonTrue {
  const t = state.personTrue[person];
  if (t === undefined) throw new RangeError(`unknown person id "${person}"`);
  return t;
}
