/**
 * The desk's dispatch log, as console text: what a seat may read, and only
 * that. Player-facing: it imports the kernel only as `@mandate/kernel/seat-api`
 * and is given a `SeatView`, never State (the kernel's boundary test checks
 * both). The Phase 2 desk replaces the text, not the rule.
 */
import type { ClaimView, ReportView, SeatView } from '@mandate/kernel/seat-api';
import { pressStories } from './press.ts';

function claimText(c: ClaimView): string {
  const where = c.region === null ? '' : ` at ${c.region}`;
  switch (c.kind) {
    case 'position':
      return `headquarters${where}`;
    case 'goal-status':
      return `${c.token ?? 'status unknown'}${c.region === null ? '' : ` (objective ${c.region})`}`;
    case 'enemy-strength':
      return `enemy ${c.value.toString()}${where}`;
    case 'control':
      return `control reported${where}`;
    case 'control-government':
      return c.value === 1 ? `neutral government ${c.token ?? 'not named'}${where}` : `${c.token ?? 'government not named'} governs${where}`;
    case 'order-obeyed':
      return `order ${c.token ?? (c.value === 1 ? 'obeyed' : 'not obeyed')}`;
    case 'order-objected':
      return 'objects to the order';
    case 'arrived':
      return `arrived${where}`;
    // Lane 1.13: the claims of plans, battles, returns and the press, as the console shows them.
    case 'plan-submitted':
      return `submits a plan (${c.token ?? 'plan'})${c.region === null ? '' : ` for ${c.region}`}`;
    case 'plan-answer':
      return `answers your edit: ${c.token ?? 'no answer'}`;
    case 'service-choice':
      return c.token === 'resign' ? 'has resigned from his service' : 'remains in his service';
    case 'verb-answered':
      return `${(c.token ?? '').replace(':', ': ')}${c.value === 1 ? '' : ' (not done)'}`;
    case 'battle-phase':
      return `${c.token ?? 'battle'}${where}: ${c.value === 1 ? 'going well' : 'going badly'}`;
    case 'battle-result':
      return `the battle${where}: ${c.token ?? 'unknown'}${c.confidence === 0 ? ', no figures yet' : `, ${c.value.toString()} lost`}`;
    case 'own-losses':
      return `own killed and wounded ${c.value.toString()}${where} (${c.token ?? 'return'})`;
    case 'casualties':
      return `enemy losses claimed ${c.value.toString()}${where}`;
    case 'framing':
      return `the public holds the other side began the war (${c.value.toString()})`;
    default:
      return `${c.kind} ${c.value.toString()}${where}`;
  }
}

function reportLine(r: ReportView, t: (key: string) => string): string {
  const kind = r.subtype === null ? r.type : `${r.type}/${r.subtype}`;
  const via = r.via.length === 0 ? '' : ` via ${r.via.join(', ')}`;
  const advice = r.advice === null ? '' : ` | recommends ${r.advice.recommends} (${r.advice.reasons.map((x) => x.kind).join(', ')})`;
  // A report with no claims (a notice, a word in person) is about its subject.
  const opening=r.openingControl===true;
  const regions=new Set(r.claims.filter(c=>c.kind==='control'&&c.region!==null).map(c=>c.region));
  const holdings = (r.reportedControl ?? []).map(c => `${c.holder === null ? `no holder reported at ${c.region}` : `${c.holder} holds ${c.region}`}${c.contested ? '; contested ground' : ''}`);
  const otherClaims = r.claims.filter(c => c.kind !== 'control').map(claimText);
  // Older presentation fixtures can lack summaries. Keep their report visible
  // without guessing a threshold or exposing the shares as figures.
  const controlFallback = holdings.length === 0 ? [...new Set(r.claims.filter(c => c.kind === 'control').map(c => c.region))].map(region => `control reported${region === null ? '' : ` at ${region}`}`) : [];
  const claims = opening ? `The opening country report records control and governments for ${regions.size.toString()} regions. The regional claims are entered on the staff map.` : r.claims.length === 0 ? `about ${r.subjectKind} ${r.subjectId}` : [...holdings, ...controlFallback, ...otherClaims].join('; ');
  // A battle day's dispatches carry their hour (FOUNDATION section 9: the night of the battle, hour by hour).
  const hour = r.hour === null ? '' : ` at ${r.hour.toString().padStart(2, '0')}:00`;
  const stories = pressStories(r, t);
  const copy = r.type === 'press' ? (stories.length === 0 ? t('press.empty') : stories.map(s => `${s.headline}. ${s.body}`).join('; ')) : claims;
  return `day ${r.receivedDay.toString().padStart(3)}  ${kind} from ${r.author} (written day ${r.day.toString()}${hour}, ${r.route}${via}): ${copy}${advice}`;
}

/**
 * The reports in reading order: by the day received, then the day and hour written, so a battle day's dispatches read
 * dawn to evening (lane 1.13); otherwise in the order the seat holds them.
 */
export function readingOrder(reports: readonly ReportView[]): ReportView[] {
  return reports
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.receivedDay - b.r.receivedDay || a.r.day - b.r.day || (a.r.hour ?? 24) - (b.r.hour ?? 24) || a.i - b.i)
    .map((x) => x.r);
}

/** The reports a seat holds, received on or after `sinceDay`, in reading order. */
export function dispatchLog(view: SeatView, sinceDay = 0, t: (key: string) => string = key => key): string[] {
  return readingOrder(view.reports.filter((r) => r.receivedDay >= sinceDay)).map(r => reportLine(r,t));
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
