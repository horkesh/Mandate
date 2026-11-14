import { DEFAULT_COMPLIANCE_RULES, type ComplianceRules } from './compliance.ts';
import type { GrievanceKind } from './state.ts';

/**
 * Kernel tunables (M1). One immutable record so calibration can pass variants.
 * All values are integers; permille unless noted.
 */
export interface KernelRules {
  readonly compliance: ComplianceRules;

  // Theatre (deliberately coarse: P13)
  /** Attacker force needed per defender force for a comfortable assault (permille: 1500 = 1.5x). */
  readonly attackRatio: number;
  /** Defender multiplier (permille). */
  readonly defenseBonus: number;
  /** Max +/- random swing on each side's power (permille). Exogenous noise only (0007). */
  readonly battleNoise: number;
  readonly opDurationDays: number;
  readonly slowWalkDelayDays: number;
  readonly reinterpretDelayDays: number;
  readonly commitment: Readonly<Record<'exceed' | 'comply' | 'comply_with_reservations' | 'slow_walk' | 'reinterpret', number>>;
  /** Losses for winner and loser, as permille of committed force. */
  readonly winnerLosses: number;
  readonly loserLosses: number;
  /** Below this counter-boldness an objecting proxy left to his own devices simply holds. */
  readonly counterAttackMinBoldness: number;

  // Delegation (P9)
  /** Days an objection waits for an answer before the proxy follows his own counter-proposal. */
  readonly objectionTimeoutDays: number;

  // Standing and blocs (P6, P10)
  readonly victoryStanding: number;
  readonly defeatStanding: number;
  readonly blocVictorySupport: number;
  readonly blocDefeatSupport: number;
  readonly blocAlignedBonus: number;
  readonly blocRegionLostSupport: number;
  readonly addressSupport: number;
  readonly addressRivalPenalty: number;
  readonly dismissalSupportLossPerStanding: number;
  /** Each week a bloc closes 1/divisor of the gap between its support and its baseline. */
  readonly blocReversionDivisor: number;
  /** A battle's political weight is full once it involves this share (permille) of the faction's whole force; minimum a quarter. */
  readonly majorBattleShare: number;

  // Verbs
  readonly honourRegard: number;
  readonly honourStanding: number;
  readonly promiseRegard: number;
  readonly promiseDays: number;
  readonly brokenPromiseRegard: number;
  readonly pressureDays: number;
  readonly pressureOversight: number;
  readonly overseerOversight: number;
  readonly insistCredibility: number;
  readonly grievanceWeight: Readonly<Record<GrievanceKind, number>>;
  /** Counters the principal can offer in one audience ("you have twenty minutes with him"). */
  readonly audienceMaxCounters: number;

  // Credibility (P7)
  readonly baseCredibility: number;
  readonly credibilityPerDismissal: number;
  readonly credibilityPerOverride: number;
  readonly defaultPromiseCredibility: number;

  // Ladder (P5)
  /** Discontent thresholds for rungs 1..7. */
  readonly ladderThresholds: readonly number[];
  readonly dispositionPerRung: number;
  readonly publicDefianceStanding: number;
  readonly armedDefianceStanding: number;
  readonly armedDefianceForce: number;
  readonly lobbyingSupportPerRung: number;
  readonly publicDefianceSupport: number;
  readonly grievanceDecayDivisor: number;

  // Autonomy and rivals
  readonly freelanceBoldness: number;
  readonly freelanceIntervalDays: number;
  readonly freelanceCommitment: number;
  readonly rivalStanding: number;
  readonly rivalSupportDrain: number;
}

export const DEFAULT_KERNEL_RULES: KernelRules = Object.freeze({
  compliance: DEFAULT_COMPLIANCE_RULES,

  attackRatio: 1500,
  defenseBonus: 1300,
  battleNoise: 150,
  opDurationDays: 7,
  slowWalkDelayDays: 14,
  reinterpretDelayDays: 3,
  commitment: Object.freeze({
    exceed: 1000,
    comply: 900,
    comply_with_reservations: 700,
    slow_walk: 500,
    reinterpret: 250,
  }),
  winnerLosses: 100,
  loserLosses: 250,
  counterAttackMinBoldness: 400,

  objectionTimeoutDays: 10,

  victoryStanding: 120,
  defeatStanding: -80,
  blocVictorySupport: 30,
  blocDefeatSupport: -40,
  blocAlignedBonus: 30,
  blocRegionLostSupport: -50,
  addressSupport: 100,
  addressRivalPenalty: -15,
  dismissalSupportLossPerStanding: 250,
  blocReversionDivisor: 20,
  majorBattleShare: 250,

  honourRegard: 150,
  honourStanding: 100,
  promiseRegard: 150,
  promiseDays: 60,
  brokenPromiseRegard: -200,
  pressureDays: 30,
  pressureOversight: 300,
  overseerOversight: 400,
  insistCredibility: 300,
  grievanceWeight: Object.freeze({
    overruled: 250,
    monitored: 200,
    pressured: 150,
    passed_over: 200,
    promise_broken: 300,
    blamed: 250,
  }),
  audienceMaxCounters: 2,

  baseCredibility: 250,
  credibilityPerDismissal: 150,
  credibilityPerOverride: 50,
  defaultPromiseCredibility: 600,

  ladderThresholds: Object.freeze([100, 250, 400, 550, 700, 850, 1000]),
  dispositionPerRung: 80,
  publicDefianceStanding: 600,
  armedDefianceStanding: 800,
  armedDefianceForce: 300,
  lobbyingSupportPerRung: 15,
  publicDefianceSupport: -20,
  grievanceDecayDivisor: 10,

  freelanceBoldness: 600,
  freelanceIntervalDays: 28,
  freelanceCommitment: 800,
  rivalStanding: 750,
  rivalSupportDrain: -10,
});
