/**
 * What a battle record says beyond its stored truth, derived on read and never saved (hard rule 5):
 * - **the day shape** (the combat note's P10): a battle-day's losses and flank break apportioned over the pack's four
 *   phases with their hours, from the day's own result. It adds no second truth. Lane 1.4 turns it into hour-stamped
 *   dispatches, beside each commander's pursue choice, which the day's record carries (`bsidePursue`);
 * - **the verdict** (P5): who held the field at the close, and each side's losses and loss share.
 */
import type { FactionId } from '../ids.ts';
import type { BattleDay, BattleRecord, Pursuit } from './records.ts';
import { apportion } from './resolve.ts';
import { DAY_PHASES, type CombatRules, type DayPhase } from './rules.ts';

export interface PhaseSide {
  readonly faction: FactionId;
  readonly killedWounded: number;
  readonly missing: number;
  readonly captured: number;
  /** The phase in which its flank broke, if it broke today. */
  readonly flankBreaks: boolean;
  /** In the evening phase: it leaves tonight (withdrew or routed), surrenders, or breaks out tomorrow. */
  readonly leaves: boolean;
  readonly surrenders: boolean;
}

export interface DayPhaseShape {
  readonly phase: DayPhase;
  readonly fromHour: number;
  readonly toHour: number;
  readonly sides: readonly PhaseSide[];
}

export interface DayShape {
  readonly day: number;
  readonly phases: readonly DayPhaseShape[];
  /** Each commander's pursue choice for the morning after (null where there is none to make). */
  readonly pursuits: readonly { readonly faction: FactionId; readonly pursue: Pursuit | null }[];
}

/**
 * A battle-day's shape: each side's killed and wounded, missing and captured split over the phases by the battle type's
 * shares (largest remainder, so each phase list sums exactly to the day's figure); the flank break in the phase its draw
 * falls in (draw times four over the threshold); a surrender and a departure in the evening.
 */
export function dayShape(rules: CombatRules, day: BattleDay): DayShape {
  const shares = rules.phases.lossShares[day.bdayType];
  const split = day.bdaySides.map((s) => ({
    kw: apportion(s.bsideKw, shares),
    missing: apportion(s.bsideMissing, shares),
    // A surrender comes at the day's end: the captured in it fall in the evening.
    field: apportion(s.bsideCaptured - surrenderedOf(s.bsideCapturedParts), shares),
    surrender: surrenderedOf(s.bsideCapturedParts),
    flankPhase: s.bsideFlankBroken && s.bsideFlankThreshold > 0 ? Math.min(DAY_PHASES.length - 1, Math.trunc((s.bsideFlankDraw * DAY_PHASES.length) / s.bsideFlankThreshold)) : -1,
  }));
  const evening = DAY_PHASES.length - 1;
  const phases = rules.phases.hours.map((h, p) => ({
    phase: h.phase,
    fromHour: h.fromHour,
    toHour: h.toHour,
    sides: day.bdaySides.map((s, i) => ({
      faction: s.bsideFaction,
      killedWounded: split[i]!.kw[p]!,
      missing: split[i]!.missing[p]!,
      captured: split[i]!.field[p]! + (p === evening ? split[i]!.surrender : 0),
      flankBreaks: split[i]!.flankPhase === p,
      leaves: p === evening && s.bsideRetreatTo !== null,
      surrenders: p === evening && s.bsideCutOff === 'surrender',
    })),
  }));
  return { day: day.bdayDay, phases, pursuits: day.bdaySides.map((s) => ({ faction: s.bsideFaction, pursue: s.bsidePursue })) };
}

function surrenderedOf(parts: readonly { readonly btermKind: string; readonly btermValue: number }[]): number {
  return parts.filter((p) => p.btermKind === 'surrender' || p.btermKind === 'stragglers_in_pocket').reduce((a, p) => a + p.btermValue, 0);
}

export interface SideTotals {
  readonly faction: FactionId;
  readonly killed: number;
  readonly wounded: number;
  readonly missing: number;
  readonly captured: number;
  /** Men present on its first day. */
  readonly engagedAtStart: number;
  /** Killed, wounded, missing and captured, permille of its men present on its first day. */
  readonly lossSharePermille: number;
}

export interface BattleVerdict {
  /** The side left holding the field at the close, or null when both stayed or both left. */
  readonly field: FactionId | null;
  readonly days: number;
  readonly sides: readonly SideTotals[];
}

/** A battle's verdict (P5's field and damage parts; the operation part is lane 1.4's). */
export function battleVerdict(record: BattleRecord): BattleVerdict {
  const first = record.battleDays[0];
  const last = record.battleDays[record.battleDays.length - 1];
  const sides = record.battleFactions.map((faction) => {
    const days = record.battleDays.map((d) => d.bdaySides.find((s) => s.bsideFaction === faction)!);
    const killed = days.reduce((a, s) => a + s.bsideKilled, 0);
    const wounded = days.reduce((a, s) => a + s.bsideWounded, 0);
    const missing = days.reduce((a, s) => a + s.bsideMissing, 0);
    const captured = days.reduce((a, s) => a + s.bsideCaptured, 0);
    const engagedAtStart = first?.bdaySides.find((s) => s.bsideFaction === faction)?.bsidePresent ?? 0;
    const lossSharePermille = engagedAtStart === 0 ? 0 : Math.trunc(((killed + wounded + missing + captured) * 1000) / engagedAtStart);
    return { faction, killed, wounded, missing, captured, engagedAtStart, lossSharePermille };
  });
  let field: FactionId | null = null;
  if (last !== undefined) {
    const gone = last.bdaySides.map((s) => s.bsideRetreatTo !== null || s.bsideCutOff === 'surrender');
    if (gone[0] !== gone[1]) field = last.bdaySides[gone[0] ? 1 : 0]!.bsideFaction;
  }
  return { field, days: record.battleDays.length, sides };
}
