/**
 * The press as a report route (lane 1.6; FOUNDATION section 7; 0032). A paper is no owner of State: its weekly front
 * page is a report its editor writes, put into each reader's knowledge by the ordinary path, and what the page says
 * moves the blocs (proposed to `politics`) and a commander's standing (proposed to `people`).
 *
 * The page carries the battles its side closed since the last page, each as its public hears it: won (the other side
 * left the field), lost (its own side left the field: withdrew or routed), or drawn. The paper's reach scales what the
 * page moves. Pure: nothing here draws a die; the tick sends the page and applies the proposals.
 */
import { strictCompare } from '../compare.ts';
import type { BattleRecord } from '../combat/records.ts';
import type { FactionId, PersonId, RegionId } from '../ids.ts';
import type { ReportClaim } from '../knowledge/report.ts';
import type { PeopleChange } from '../people/people.ts';
import type { State } from '../root-state.ts';
import type { PoliticsChange } from './politics.ts';
import type { PaperRule, PoliticsRules } from './rules.ts';

export const BATTLE_RESULTS = ['drawn', 'lost', 'won'] as const;
export type BattleResult = (typeof BATTLE_RESULTS)[number];

/** One battle as a side's public hears it. */
export interface PressBattle {
  readonly battle: string;
  readonly region: RegionId;
  readonly result: BattleResult;
  readonly commander: PersonId | null;
  /** The side's killed, wounded, missing and captured over the battle, men (the captured counted among the missing). */
  readonly casualties: number;
}

/**
 * The result of a closed battle for `faction`: who left the field on its last day. A side leaves it by withdrawing or
 * routing, or as prisoners: a cut-off force that surrendered or was destroyed has lost (the gate review's G-1.6b).
 */
export function battleResultFor(record: BattleRecord, faction: FactionId): BattleResult {
  const last = record.battleDays[record.battleDays.length - 1];
  if (last === undefined) return 'drawn';
  const left = (s: (typeof last.bdaySides)[number]) => s.bsideResult === 'withdrew' || s.bsideResult === 'routed' || s.bsideCutOff === 'surrender' || s.bsideCutOff === 'destroyed';
  if (last.bdaySides.some((s) => s.bsideFaction === faction && left(s))) return 'lost';
  if (last.bdaySides.some((s) => s.bsideFaction !== faction && left(s))) return 'won';
  return 'drawn';
}

/** The battles `faction` fought that closed in (`after`, `upTo`], in battle id order. */
export function closedBattles(state: State, faction: FactionId, after: number, upTo: number): PressBattle[] {
  const out: PressBattle[] = [];
  const ids = Object.keys(state.battleRecords).sort(strictCompare);
  for (const id of ids) {
    const r = state.battleRecords[id]!;
    if (r.battleEndDay === null || r.battleEndDay <= after || r.battleEndDay > upTo || !r.battleFactions.includes(faction)) continue;
    let casualties = 0;
    let commander: PersonId | null = null;
    for (const day of r.battleDays) {
      for (const s of day.bdaySides) {
        if (s.bsideFaction !== faction) continue;
        // The public's figure counts the captured among the missing (0074, 0076; the gate review's G-1.6a).
        casualties += s.bsideKilled + s.bsideWounded + s.bsideMissing + s.bsideCaptured;
        if (s.bsideCommander !== null) commander = s.bsideCommander;
      }
    }
    out.push({ battle: id, region: r.battleRegion, result: battleResultFor(r, faction), commander, casualties });
  }
  return out;
}

/** A front page: its claims, and what it moves, at the paper's reach. */
export interface FrontPage {
  readonly paper: string;
  readonly battles: readonly PressBattle[];
  readonly claims: readonly ReportClaim[];
  readonly politics: readonly PoliticsChange[];
  readonly people: readonly PeopleChange[];
}

const scale = (v: number, permille: number): number => Math.trunc((v * permille) / 1000);

/** The front page `paper` prints today, from the battles its side closed in the last `cadenceDays` and its side's framing. */
export function frontPage(rules: PoliticsRules, state: State, paper: PaperRule, day: number): FrontPage {
  const battles = closedBattles(state, paper.faction, day - rules.press.cadenceDays, day);
  const claims: ReportClaim[] = battles.map((b) => ({ claimKind: 'battle-result', claimRegion: b.region, claimValue: b.casualties, claimToken: b.result, claimConfidence: 1000 }));
  const framing = state.warFraming[paper.faction] ?? 0;
  if (framing !== 0) claims.push({ claimKind: 'framing', claimRegion: null, claimValue: framing, claimToken: null, claimConfidence: 1000 });
  const politics: PoliticsChange[] = [];
  const people: PeopleChange[] = [];
  const blocs = [...rules.blocs].filter((b) => b.faction === paper.faction).sort((x, y) => strictCompare(x.id, y.id));
  for (const b of battles) {
    if (b.result === 'drawn') continue;
    for (const bloc of blocs) {
      const delta = scale(b.result === 'won' ? bloc.victory : bloc.defeat, paper.reachPermille);
      if (delta !== 0) politics.push({ change: 'support', bloc: bloc.id, delta, reason: `press:${paper.id}:${b.result}` });
    }
    if (b.commander !== null) {
      const delta = scale(b.result === 'won' ? rules.press.standing.victory : rules.press.standing.defeat, paper.reachPermille);
      if (delta !== 0) people.push({ change: 'standing', person: b.commander, delta });
    }
  }
  return { paper: paper.id, battles, claims, politics, people };
}
