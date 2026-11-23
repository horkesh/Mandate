/**
 * The desk's dispatch log, built from the reports a seat can read.
 */
import type { ClaimView, ReportView, SeatView } from '@mandate/kernel/seat-api';
import { pressStories } from './press.ts';
import type { DeskStrings } from './strings.ts';

function atRegion(region: ClaimView['region'], t: DeskStrings): string {
  return region === null ? '' : t('console.report.at', { region });
}

function claimText(c: ClaimView, t: DeskStrings): string {
  const where = atRegion(c.region, t);
  switch (c.kind) {
    case 'position':
      return t('console.claim.position', { where });
    case 'goal-status': {
      const objective = c.region === null ? '' : t('console.claim.goal-objective', { region: c.region });
      return t('console.claim.goal-status', { status: c.token ?? t('console.claim.unknown-status'), objective });
    }
    case 'enemy-strength':
      return t('console.claim.enemy-strength', { value: String(c.value), where });
    case 'control-government':
      return c.value === 1
        ? t('console.claim.neutral-government', { government: c.token ?? t('console.claim.unidentified'), where })
        : t('console.claim.government', { government: c.token ?? t('console.claim.unidentified-government'), where });
    case 'order-obeyed':
      return t('console.claim.order-obeyed', { answer: c.token ?? t(c.value === 1 ? 'console.claim.obeyed' : 'console.claim.disobeyed') });
    case 'order-objected':
      return t('console.claim.order-objected');
    case 'arrived':
      return t('console.claim.arrived', { where });
    case 'plan-submitted': {
      const objective = c.region === null ? '' : t('console.claim.plan-objective', { region: c.region });
      return t('console.claim.plan-submitted', { plan: c.token ?? t('console.claim.plan'), objective });
    }
    case 'plan-answer':
      return t('console.claim.plan-answer', { answer: c.token ?? t('console.claim.no-answer') });
    case 'service-choice':
      return t(c.token === 'resign' ? 'console.claim.resigned' : 'console.claim.remains');
    case 'verb-answered': {
      const answer = (c.token ?? '').replace(':', ': ');
      return c.value === 1 ? answer : t('console.claim.verb-not-done', { answer });
    }
    case 'appointment-refused':
      return t('console.claim.appointment-refused', {
        reason: t(c.token === null ? 'console.claim.appointment.unknown' : 'console.claim.appointment.' + c.token),
      });
    case 'battle-phase':
      return t('console.claim.battle-phase', {
        phase: c.token ?? t('console.claim.battle'), where, course: t(c.value === 1 ? 'console.claim.going-well' : 'console.claim.going-badly'),
      });
    case 'battle-result': {
      const losses = c.confidence === 0 ? t('console.claim.no-figures') : t('console.claim.battle-losses', { value: String(c.value) });
      return t('console.claim.battle-result', { where, result: c.token ?? t('console.claim.unknown-result'), losses });
    }
    case 'own-losses':
      return t('console.claim.own-losses', { value: String(c.value), where, returnType: c.token ?? t('console.claim.return') });
    case 'casualties':
      return t('console.claim.casualties', { value: String(c.value), where });
    case 'framing':
      return t('console.claim.framing', { value: String(c.value) });
    default:
      return t('console.claim.raw', { kind: c.kind, value: String(c.value), where });
  }
}

function reportCopy(r: ReportView, t: DeskStrings): string {
  if (r.advice?.consultation !== undefined) {
    const a = r.advice.consultation;
    return t('console.advice.round', { round: a.consultationRound.key, courses: a.consultationAnswers.map(c =>
      t('console.advice.course', { course: c.answerCourse, position: t(`console.advice.${c.answerPosition}`),
        feasibility: c.answerFeasibility === undefined ? '' : t('console.advice.feasibility', { status: t(`console.advice.${c.answerFeasibility.assessmentStatus}`) }) })).join('; ') });
  }
  if (r.type === 'press') {
    const stories = pressStories(r, t);
    return stories.length === 0 ? t('press.empty') : stories.map(s => t('console.report.story', { headline: s.headline, body: s.body })).join('; ');
  }
  if (r.proposal !== undefined) return t('console.report.proposal', { paper: r.id, post: r.subjectId,
    posture: r.proposal.goal.goalPosture, objective: r.proposal.goal.goalObjective ?? t('console.goal.here'),
    reasons: r.proposal.reasons.map(reason => reason.kind).join(', '),
  });
  if (r.discretion !== undefined) return t('console.report.discretion', { post: r.subjectId,
    condition: r.discretion.switchCondition, posture: r.discretion.switchGoal.goalPosture,
    objective: r.discretion.switchGoal.goalObjective ?? t('console.goal.here'), region: r.discretion.switchRegion,
    estimate: String(r.discretion.switchEstimate),
  });
  const control = r.claims.filter(c => c.kind === 'control').map(c => c.region);
  const regions = new Set(control);
  if (r.openingControl === true) return t('console.report.opening', { regions: String(regions.size - Number(regions.has(null))) });
  if (r.claims.length === 0) return t('console.report.about', { kind: r.subjectKind, id: r.subjectId });
  const holdings = (r.reportedControl ?? []).map(c => {
    const holding = c.holder === null
      ? t('console.report.no-holder', { region: c.region })
      : t('console.report.holder', { region: c.region, holder: c.holder });
    return c.contested ? t('console.report.contested', { holding }) : holding;
  });
  // Older presentation fixtures lack summaries. Keep their reports visible without guessing or showing shares.
  const controlFallback = holdings.length === 0 ? [...regions].map(region => t('console.claim.control', { where: atRegion(region, t) })) : [];
  const otherClaims = r.claims.filter(c => c.kind !== 'control').map(c => claimText(c, t));
  return [...holdings, ...controlFallback, ...otherClaims].join('; ');
}

/** The received copy, shared with the browser's desk adapter. */
export function reportBody(r: ReportView, t: DeskStrings): string {
  const base = reportCopy(r, t);
  const copy = r.text === undefined || r.type === 'press' ? base : t('console.report.text', { copy: base, text: t(r.text) });
  return r.advice === null || r.advice.consultation !== undefined ? copy : t('console.report.advice', {
    copy, option: r.advice.recommends, reasons: r.advice.reasons.map(x => x.kind).join(', '),
  });
}

function reportLine(r: ReportView, t: DeskStrings): string {
  const kind = r.subtype === null ? r.type : r.type + '/' + r.subtype;
  const via = r.via.length === 0 ? '' : t('console.via', { posts: r.via.join(', ') });
  const hour = r.hour === null ? '' : t('console.report.hour', { hour: String(r.hour).padStart(2, '0') });
  return t('console.report.line', {
    received: String(r.receivedDay).padStart(3), kind, author: r.author, day: String(r.day), hour, route: r.route,
    via, body: reportBody(r, t),
  });
}

/**
 * By the day received, then the day and hour written, so battle dispatches read dawn to evening.
 * Otherwise use the order the seat holds them.
 */
export function readingOrder(reports: readonly ReportView[]): ReportView[] {
  return reports
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.receivedDay - b.r.receivedDay || a.r.day - b.r.day || (a.r.hour ?? 24) - (b.r.hour ?? 24) || a.i - b.i)
    .map((x) => x.r);
}

/** The reports a seat holds, received on or after the given day. */
export function dispatchLog(view: Pick<SeatView, 'reports'>, sinceDay: number, t: DeskStrings): string[] {
  return readingOrder(view.reports.filter(r => r.receivedDay >= sinceDay)).map(r => reportLine(r, t));
}

/** What he believes of the enemy, region by region. */
export function enemyPicture(view: SeatView, t: DeskStrings): string[] {
  return Object.keys(view.enemyBeliefs)
    .sort()
    .map(region => {
      const b = view.enemyBeliefs[region as keyof typeof view.enemyBeliefs]!;
      return t('console.enemy.belief', { region, strength: String(b.value), day: String(b.asOfDay) });
    });
}
