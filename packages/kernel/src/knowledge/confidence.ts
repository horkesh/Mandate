/** Pack-tunable confidence for tentative claims and advice, in whole permille (0072). */
export const REPORT_CONFIDENCE_FIELDS = [
  'battlePhase', 'battleEnemyStrength',
  'firstReturnOwnLosses', 'firstReturnMissing', 'firstReturnEnemyLosses',
  'fullReturnOwnLosses', 'fullReturnMissing', 'fullReturnCaptured',
  'governorWire', 'pocket', 'commanderLoss',
  'scoutEnemyStrength', 'scoutWorks', 'scoutObstruction',
  'dispatchEnemyStrength', 'dispatchEffectiveStrength',
  'returnPresentForDuty', 'returnPaperStrength', 'cabinetWord',
  'initiativeAdvice', 'orderObjection', 'planObjection', 'recruitmentObjection', 'verbObjection',
  'inquiryEnemyStrength', 'consultMinimum', 'observerGoalStatus',
] as const;

export type ReportConfidenceField = (typeof REPORT_CONFIDENCE_FIELDS)[number];
export type ReportConfidenceRules = Readonly<Record<ReportConfidenceField, number>>;

/** A World passed by an adapter must supply the same confidence rules as a pack file. */
export function reportConfidenceProblems(rules: ReportConfidenceRules | undefined): string[] {
  return REPORT_CONFIDENCE_FIELDS.flatMap((field) => {
    const value = rules?.[field];
    return value !== undefined && Number.isInteger(value) && value >= 0 && value <= 1000
      ? []
      : [`reportConfidence.${field} must be a whole number of permille from 0 to 1000`];
  });
}
