/**
 * The press as a report route (lane 1.6; FOUNDATION section 7; 0032). A paper is no owner of State: its weekly front
 * page is a report its editor writes, put into each reader's knowledge by the ordinary path, and what the page says
 * moves the blocs (proposed to `politics`) and a commander's standing (proposed to `people`).
 *
 * The page carries the battles its side closed since the last page, each as its public hears it: won (the other side
 * left the field), lost (its own side left the field: withdrew or routed, or surrendered or was destroyed), or drawn.
 * Who left the field was public. The paper's reach scales what the page moves.
 *
 * Its losses are never the battle record's truth (0008, 0052; the lead's ruling on lane 1.6). They are what its side's
 * principal has been told by the printing day: for each day of the battle, the latest casualty return he holds, the full
 * return once it has come and the first (low) return before. A page printed before any return has come gives the result
 * without a figure. Pure: nothing here draws a die; the tick sends the page and applies the proposals.
 */
import { strictCompare } from '../compare.ts';
import type { BattleRecord } from '../combat/records.ts';
import type { FactionId, PersonId, RegionId } from '../ids.ts';
import type { KnownReport } from '../knowledge/knowledge.ts';
import type { ReportClaim } from '../knowledge/report.ts';
import type { PeopleChange } from '../people/people.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { PoliticsChange } from './politics.ts';
import type { PaperRule, PoliticsRules } from './rules.ts';

export const BATTLE_RESULTS = ['drawn', 'lost', 'won'] as const;
export type BattleResult = (typeof BATTLE_RESULTS)[number];

/** How a page's figure stands: from full returns for every day, from a first (low) return for some, or none yet. */
export const RETURNED = ['first', 'full', 'none'] as const;
export type Returned = (typeof RETURNED)[number];

/** The confidence a front page gives its figure: full returns, first returns, or none (0: the page prints no figure). */
export const RETURNED_CONFIDENCE: Readonly<Record<Returned, number>> = Object.freeze({ full: 900, first: 500, none: 0 });

/** One battle as a side's public hears it. */
export interface PressBattle {
  readonly battle: string;
  readonly region: RegionId;
  readonly result: BattleResult;
  readonly commander: PersonId | null;
  /** The side's killed, wounded and missing as its principal's returns give them (the captured among the missing); 0 with none. */
  readonly casualties: number;
  /** The captured, as the full returns list them apart; 0 until every day's full return has come (no early split). */
  readonly captured: number;
  readonly returned: Returned;
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

/** A return's own losses: killed and wounded, plus the missing and (a full return's) captured. Null if it is not a return of his own. */
function ownLosses(r: KnownReport, kind: 'first' | 'full'): number | null {
  const own = r.knownBody.reportClaims.filter((c) => c.claimToken === kind && (c.claimKind === 'own-losses' || c.claimKind === 'missing' || c.claimKind === 'captured'));
  return own.length === 0 ? null : own.reduce((a, c) => a + c.claimValue, 0);
}

/**
 * The side's losses over a battle as its principal holds them (the lead's ruling on lane 1.6): for each battle day, the
 * full return written `revealDays` after it if he holds it, else the first return written that evening. The first
 * return counts the captured among the missing, and the full return lists them apart, so both count them (G-1.6a).
 */
export function returnedLosses(state: State, principal: PersonId | null, region: RegionId, battleDays: readonly number[], revealDays: number): { readonly men: number; readonly captured: number; readonly returned: Returned } {
  if (principal === null) return { men: 0, captured: 0, returned: 'none' };
  const held = (state.knowledgeBySeat[seatIdFor(principal)]?.knownReports ?? []).filter((r) => r.knownBody.reportType === 'casualty-return' && r.knownBody.reportSubjectKind === 'region' && r.knownBody.reportSubjectId === region);
  let men = 0;
  let captured = 0;
  let full = 0;
  let first = 0;
  for (const d of battleDays) {
    const fullReturn = held.find((r) => r.knownBody.reportDay === d + revealDays && ownLosses(r, 'full') !== null);
    if (fullReturn !== undefined) {
      men += ownLosses(fullReturn, 'full')!;
      captured += fullReturn.knownBody.reportClaims.filter((c) => c.claimToken === 'full' && c.claimKind === 'captured').reduce((a, c) => a + c.claimValue, 0);
      full += 1;
      continue;
    }
    const firstReturn = held.find((r) => r.knownBody.reportDay === d && ownLosses(r, 'first') !== null);
    if (firstReturn !== undefined) {
      men += ownLosses(firstReturn, 'first')!;
      first += 1;
    }
  }
  return { men, captured, returned: full + first === 0 ? 'none' : first === 0 ? 'full' : 'first' };
}

/** The battles `faction` fought that closed in (`after`, `upTo`], in battle id order, with the losses its principal holds. */
export function closedBattles(state: State, faction: FactionId, after: number, upTo: number, principal: PersonId | null, revealDays: number): PressBattle[] {
  const out: PressBattle[] = [];
  const ids = Object.keys(state.battleRecords).sort(strictCompare);
  for (const id of ids) {
    const r = state.battleRecords[id]!;
    if (r.battleEndDay === null || r.battleEndDay <= after || r.battleEndDay > upTo || !r.battleFactions.includes(faction)) continue;
    let commander: PersonId | null = null;
    const days: number[] = [];
    for (const day of r.battleDays) {
      for (const s of day.bdaySides) {
        if (s.bsideFaction !== faction) continue;
        if (!days.includes(day.bdayDay)) days.push(day.bdayDay);
        if (s.bsideCommander !== null) commander = s.bsideCommander;
      }
    }
    const losses = returnedLosses(state, principal, r.battleRegion, days, revealDays);
    out.push({ battle: id, region: r.battleRegion, result: battleResultFor(r, faction), commander, casualties: losses.men, captured: losses.returned === 'full' ? losses.captured : 0, returned: losses.returned });
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

/**
 * The front page `paper` prints today, from the battles its side closed in the last `cadenceDays`, with the losses its
 * side's `principal` holds in his returns (`revealDays`: the pack's days from a battle day to its full return), and its
 * side's framing.
 */
export function frontPage(rules: PoliticsRules, state: State, paper: PaperRule, day: number, principal: PersonId | null, revealDays: number): FrontPage {
  const battles = closedBattles(state, paper.faction, day - rules.press.cadenceDays, day, principal, revealDays);
  const claims: ReportClaim[] = battles.flatMap((b): ReportClaim[] => [
    // The result always prints, a surrender or a destroyed force included, whether or not any return has come (the
    // gate reviewer's condition: a force taken whole may send none).
    { claimKind: 'battle-result', claimRegion: b.region, claimValue: b.casualties, claimToken: b.result, claimConfidence: RETURNED_CONFIDENCE[b.returned] },
    // The captured print apart only once every day's full return has come; before, they are among the missing (no early split).
    ...(b.returned === 'full' && b.captured > 0 ? [{ claimKind: 'captured' as const, claimRegion: b.region, claimValue: b.captured, claimToken: null, claimConfidence: RETURNED_CONFIDENCE.full }] : []),
  ]);
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
