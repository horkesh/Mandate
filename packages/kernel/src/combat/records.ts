/**
 * Battle records (FOUNDATION section 10: written only by `combat`; the combat note's P1). One record per battle: its
 * region, its days, the sides, the posts whose marching caused it (AWWV's battle receipt; lane 1.4 adds operations), and
 * each day's resolution with every breakdown (hard rule 6). The day shape and the verdict are derived from a record on
 * read (`shape.ts`), never stored beside it.
 *
 * Every record below the root is an immutable value, replaced whole by `combat` (0052); every key carries a prefix, as
 * 0044 asks, so the one-writer scan can match it by name.
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { BattleType, Commit, DayResult } from './rules.ts';

/** A battle's id: its region and the day it opened, so two battles never share one. */
export type BattleId = string;
export const battleId = (region: RegionId, startDay: number): BattleId => `battle:${region}:${startDay}`;

/** One typed contribution to a number: its kind, its signed value, and what it came from (hard rule 6). */
export interface BattleTerm {
  readonly btermKind: string;
  readonly btermValue: number;
  /** The person, block, terrain or rule it came from, or null. */
  readonly btermSource: string | null;
}

/** One block's losses on one day, apportioned from its side's by men engaged (the largest-remainder rule). */
export interface BlockLoss {
  readonly blossBlock: ForceBlockId;
  readonly blossKilled: number;
  readonly blossWounded: number;
  /** Missing who straggle: they go to the block's stragglers and rejoin over days. */
  readonly blossMissing: number;
  /** Captured: they leave the block's strength, a typed loss (R4's battle ruling). */
  readonly blossCaptured: number;
  /** Stragglers of a surrendered block taken with it (they were inside the pocket). */
  readonly blossStragglersCaptured: number;
}

/** What a commander hit on a battle-day suffers (proposed to `people`, his post's vacancy to `command`). */
export const LEADER_HITS = ['killed', 'wounded', 'captured'] as const;
export type LeaderHit = (typeof LEADER_HITS)[number];

/** The commander's choice with no way out (P8): break out, or surrender the force. */
export type CutOffChoice = 'break_out' | 'surrender';
/** What became of a side cut off: his choice, or destroyed when the breakout he chose failed (never his surrender, 0074). */
export type CutOff = CutOffChoice | 'destroyed';

/** The winner's choice the morning after a withdrawal or rout (P6.3). Lane 1.4 runs the pursuit; combat only emits it. */
export const PURSUITS = ['none', 'follow', 'press'] as const;
export type Pursuit = (typeof PURSUITS)[number];

/** One side on one battle-day: what it brought, what it lost and why, and what its commander decided. */
export interface BattleSide {
  readonly bsideFaction: FactionId;
  /** The post whose blocks are strongest here, and its holder, or null when vacant. */
  readonly bsidePost: PostId | null;
  readonly bsideCommander: PersonId | null;
  readonly bsideCommit: Commit;
  /** Every block of the side standing here, in id order. */
  readonly bsideBlocks: readonly ForceBlockId[];
  /** Blocks whose strength no source gives: listed in every record, counted as none (0064; 1A's done check). */
  readonly bsideUnknown: readonly ForceBlockId[];
  /** Men present (known), committed (the commit's share), engaged (committed, capped by frontage). */
  readonly bsidePresent: number;
  readonly bsideCommitted: number;
  readonly bsideEngaged: number;
  /** The base rate this side takes, K+W per 1000 men in contact. */
  readonly bsideBase: number;
  /** The loss multiplier's terms (P4); the multiplier is 1000 plus their sum, then the clamp term. */
  readonly bsideTerms: readonly BattleTerm[];
  readonly bsideMultiplier: number;
  /** Killed plus wounded, and the same number broken down by term: the parts sum exactly to it. */
  readonly bsideKw: number;
  readonly bsideKwParts: readonly BattleTerm[];
  readonly bsideKilled: number;
  readonly bsideWounded: number;
  /** Missing who straggle, and their breakdown (by result, flank break, and the cap at the men present). */
  readonly bsideMissing: number;
  readonly bsideMissingParts: readonly BattleTerm[];
  /** Captured, kept apart from the missing (R4's battle ruling): on the field, and in a force taken (surrendered or destroyed) with the day's missing and the stragglers in the pocket. */
  readonly bsideCaptured: number;
  readonly bsideCapturedParts: readonly BattleTerm[];
  readonly bsideFlankDraw: number;
  readonly bsideFlankThreshold: number;
  readonly bsideFlankTerms: readonly BattleTerm[];
  readonly bsideFlankBroken: boolean;
  readonly bsideMoraleBefore: number;
  readonly bsideMoraleAfter: number;
  readonly bsideMoraleTerms: readonly BattleTerm[];
  /** What his decisions read today (dawn, night, cut off, pursuit): believed ratios and the shares of his demand. */
  readonly bsideDecisions: readonly BattleTerm[];
  readonly bsideResult: DayResult;
  /** With no legal retreat (0019): break out or surrender, his choice; destroyed when that breakout failed; null when it stayed or had a way out. */
  readonly bsideCutOff: CutOff | null;
  readonly bsideRetreatTo: RegionId | null;
  /** The pursuit its commander chooses after the other side withdrew or routed; null when there is none to choose. */
  readonly bsidePursue: Pursuit | null;
  readonly bsideLosses: readonly BlockLoss[];
  /** The commander's draw on the leaders' stream, and what it did to him (null: unhurt, or no commander). */
  readonly bsideHitDraw: number;
  readonly bsideHit: LeaderHit | null;
}

/** One day of a battle. */
export interface BattleDay {
  readonly bdayDay: number;
  /** 1 on the battle's first day. */
  readonly bdayNumber: number;
  readonly bdayType: BattleType;
  /** The attacking side, or null in a meeting engagement (both attack). */
  readonly bdayAttacker: FactionId | null;
  readonly bdayFrontage: number;
  /** Men in contact: the lesser of the two sides engaged (P3). */
  readonly bdayContact: number;
  /** Values drawn from the day's stream: always the same number (P7). */
  readonly bdayDraws: number;
  /** The two sides, in faction order. */
  readonly bdaySides: readonly BattleSide[];
}

export interface BattleRecord {
  readonly battleRegion: RegionId;
  readonly battleStartDay: number;
  /** The day it closed, or null while it is open. */
  readonly battleEndDay: number | null;
  /** The two sides, in faction order. */
  readonly battleFactions: readonly FactionId[];
  /** The posts whose blocks marched in and pressed for the region (the battle's receipt; lane 1.4 adds operations). */
  readonly battleCauses: readonly PostId[];
  readonly battleDays: readonly BattleDay[];
}

export type BattleTable = Readonly<Record<BattleId, BattleRecord>>;

/** A change `combat` makes to its own records. */
export type BattleRecordChange =
  | { readonly change: 'open'; readonly id: BattleId; readonly record: BattleRecord }
  | { readonly change: 'day'; readonly id: BattleId; readonly day: BattleDay; readonly causes: readonly PostId[] }
  | { readonly change: 'close'; readonly id: BattleId; readonly day: number };

/** The open battle in a region, if any. */
export function openBattleIn(state: State, region: RegionId): BattleId | null {
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const r = state.battleRecords[id]!;
    if (r.battleRegion === region && r.battleEndDay === null) return id;
  }
  return null;
}

/** The only writer of battle records: apply changes in order. Returns the State unchanged when there are none. */
export function applyBattleRecords(state: State, changes: readonly BattleRecordChange[]): State {
  if (changes.length === 0) return state;
  const next: Record<BattleId, BattleRecord> = { ...state.battleRecords };
  for (const c of changes) {
    if (c.change === 'open') {
      if (next[c.id] !== undefined) throw new RangeError(`battle ${c.id} is already open`);
      next[c.id] = c.record;
      continue;
    }
    const r = next[c.id];
    if (r === undefined) throw new RangeError(`unknown battle ${c.id}`);
    if (r.battleEndDay !== null) throw new RangeError(`battle ${c.id} is closed`);
    if (c.change === 'day') {
      const causes = [...new Set([...r.battleCauses, ...c.causes])].sort(strictCompare);
      next[c.id] = { ...r, battleCauses: causes, battleDays: [...r.battleDays, c.day] };
    } else {
      next[c.id] = { ...r, battleEndDay: c.day };
    }
  }
  return { ...state, battleRecords: next };
}

/** A battle's last day, if it has one. */
export function lastDay(record: BattleRecord): BattleDay | null {
  return record.battleDays.length === 0 ? null : record.battleDays[record.battleDays.length - 1]!;
}
