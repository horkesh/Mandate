/**
 * The desk's dispatch log, as console text: what a seat may read, and only
 * that. Player-facing: it imports the kernel only as `@mandate/kernel/seat-api`
 * and is given a `SeatView`, never State (the kernel's boundary test checks
 * both). The Phase 2 desk replaces the text, not the rule.
 */
import type { ClaimView, ReportView, SeatView } from '@mandate/kernel/seat-api';

function claimText(c: ClaimView): string {
  const where = c.region === null ? '' : ` at ${c.region}`;
  switch (c.kind) {
    case 'position':
      return `headquarters${where}`;
    case 'goal-status':
      return `${c.token ?? 'status unknown'}${c.region === null ? '' : ` (objective ${c.region})`}`;
    case 'enemy-strength':
      return `enemy ${c.value.toString()}${where}`;
    case 'order-obeyed':
      return `order ${c.token ?? (c.value === 1 ? 'obeyed' : 'not obeyed')}`;
    case 'order-objected':
      return 'objects to the order';
    case 'arrived':
      return `arrived${where}`;
    default:
      return `${c.kind} ${c.value.toString()}${where}`;
  }
}

function reportLine(r: ReportView): string {
  const kind = r.subtype === null ? r.type : `${r.type}/${r.subtype}`;
  const via = r.via.length === 0 ? '' : ` via ${r.via.join(', ')}`;
  const advice = r.advice === null ? '' : ` | recommends ${r.advice.recommends} (${r.advice.reasons.map((x) => x.kind).join(', ')})`;
  const claims = r.claims.map(claimText).join('; ');
  return `day ${r.receivedDay.toString().padStart(3)}  ${kind} from ${r.author} (written day ${r.day.toString()}, ${r.route}${via}): ${claims}${advice}`;
}

/** The reports a seat holds, received on or after `sinceDay`, oldest first. */
export function dispatchLog(view: SeatView, sinceDay = 0): string[] {
  return view.reports.filter((r) => r.receivedDay >= sinceDay).map(reportLine);
}

/** What he believes of the enemy, region by region. */
export function enemyPicture(view: SeatView): string[] {
  return Object.keys(view.enemyBeliefs)
    .sort()
    .map((region) => {
      const b = view.enemyBeliefs[region as keyof typeof view.enemyBeliefs]!;
      return `${region}: about ${b.value.toString()} (as of day ${b.asOfDay.toString()})`;
    });
}
