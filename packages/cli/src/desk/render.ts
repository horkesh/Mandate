/**
 * The desk's text: what the principal sees each morning and as the days of a turn pass. Player-facing: built only from
 * the morning's request (the view and the menu) and the reports a day brought, through `@mandate/kernel/seat-api`.
 * Strings a pack provides (a situation's title and text, an option's label) are looked up through `t`, which the
 * console hands in; a key with no text shows as the key.
 */
import type { AxisView, OptionView, PrincipalMenu, ReportView, SeatRequest, SituationView } from '@mandate/kernel/seat-api';
import { dispatchLog, enemyPicture } from './dispatches.ts';
import type { SeatCommand } from '@mandate/kernel/seat-api';

export type Strings = (key: string) => string;

/** Days from a plan's start, from its permille days. */
const days = (permille: number): string => `${Math.ceil(permille / 1000).toString()} days`;

function axisLine(a: AxisView): string {
  return `    ${a.name} (${a.post}, ${a.mode}, ${a.strength.toString()} men): ${a.regions.join(' > ')}, arriving in ${days(a.arrival)}; ${a.phases.join(', ')}`;
}

/** A plan as he submitted it: its method, axes, what it asks of others and its conditions. */
export function planLines(plan: OptionView): string[] {
  const asks = plan.requests.length === 0 ? '' : `; asks: ${plan.requests.join(', ')}`;
  const conds = plan.conditions.length === 0 ? '' : `; on condition: ${plan.conditions.join(', ')}`;
  return [`  ${plan.method}/${plan.variant}: he expects about ${plan.perceivedEnemy.toString()} of the enemy${asks}${conds}`, ...plan.axes.map(axisLine)];
}

/** The situations before him, open first, with their options in display order. */
export function situationLines(views: readonly SituationView[], menu: PrincipalMenu, t: Strings): string[] {
  const open = views.filter((s) => s.status === 'open' || s.status === 'waiting');
  if (open.length === 0) return ['No situation is before you.'];
  const out: string[] = [];
  for (const s of open) {
    const choice = menu.situations.find((c) => c.situation === s.id);
    out.push(`${s.id}: ${t(s.title)} (${s.status}, before you since day ${s.surfacedDay.toString()})`);
    out.push(`  ${t(s.text)}`);
    if (s.staffAuthor !== null) out.push(`  The staff's advice comes from ${s.staffAuthor} (in your inbox).`);
    for (const o of s.options) out.push(`  - ${o.id}: ${t(o.label)}${o.proposedBy === 'inaction' ? '' : ` (urged by ${o.proposedBy.join(', ')})`}`);
    if (choice !== undefined && choice.delegableTo.length > 0) out.push(`  You may hand it to: ${choice.delegableTo.join(', ')}`);
  }
  return out;
}

/** Plans submitted for his review, and operations waiting for his word. */
export function planReviewLines(menu: PrincipalMenu): string[] {
  const out: string[] = [];
  for (const r of menu.reviews) out.push(`${r.post} (${r.holder}) submits a plan for your review:`, ...planLines(r.plan));
  for (const p of menu.awaiting) out.push(`${p}: prepared, waiting for your word ("go ${p}").`);
  return out.length === 0 ? ['No plan waits for you.'] : out;
}

/** The posts he may order, each with its holder, the posts an order passes, and its routes. */
export function postLines(menu: PrincipalMenu): string[] {
  return menu.commandable.map((c) => {
    const relays = c.relays.length === 0 ? '' : ` via ${c.relays.join(' > ')}`;
    const routes = c.routes.map((r) => `${r.route} ${r.typicalDays.toString()}d${r.price > 0 ? ` (${r.price.toString()} attention)` : ''}`).join(', ');
    return `${c.post}: ${c.holder}${relays}; ${routes}`;
  });
}

/** The morning: the date, what arrived since `sinceDay`, and what waits for him. */
export function morningLines(request: SeatRequest, sinceDay: number, t: Strings, header: { readonly date: string; readonly attention: number | null }): string[] {
  const menu = request.menu;
  if (menu.menuKind !== 'principal') return [`${request.view.person}: ${menu.menuKind}`];
  const view = request.view;
  const attention = header.attention === null ? '' : `; ${header.attention.toString()} attention left this week`;
  const war = menu.atWarSince === null ? '; at peace' : '';
  const out = [`=== ${header.date} (day ${request.requestDay.toString()}): ${view.person}, ${menu.faction}${war}${attention} ===`];
  const fresh = dispatchLog(view, sinceDay);
  out.push(fresh.length === 0 ? 'Nothing new has arrived.' : `${fresh.length.toString()} new in your inbox:`, ...fresh.map((l) => `  ${l}`));
  const open = view.situations.filter((s) => s.status === 'open');
  if (open.length > 0) out.push(`Before you: ${open.map((s) => `${s.id} (${t(s.title)})`).join('; ')}. Type "situations".`);
  if (menu.reviews.length > 0) out.push(`Plans for your review: ${menu.reviews.map((r) => r.post).join(', ')}. Type "plans".`);
  if (menu.awaiting.length > 0) out.push(`Waiting for your word: ${menu.awaiting.join(', ')}.`);
  return out;
}

/** The days of a turn passing: each day's new reports, any of his orders refused, and why the turn stopped. */
export function dayLines(day: { readonly day: number; readonly date: string; readonly reports: readonly ReportView[]; readonly refused: readonly { readonly what: string; readonly reason: string }[] }): string[] {
  const out = [`--- ${day.date} (day ${day.day.toString()}) ---`];
  for (const r of day.refused) out.push(`  Refused: ${r.what} (${r.reason})`);
  const view = { reports: day.reports } as unknown as Parameters<typeof dispatchLog>[0];
  for (const l of dispatchLog(view)) out.push(`  ${l}`);
  return out;
}

export function enemyLines(request: SeatRequest): string[] {
  const lines = enemyPicture(request.view);
  return lines.length === 0 ? ['You have no report of the enemy.'] : lines;
}

/** A queued command, as the queue lists it. */
export function commandText(c: SeatCommand): string {
  switch (c.cmd) {
    case 'order':
      return `order ${c.to} to ${c.goal.posture}${c.goal.objective === null ? '' : ` ${c.goal.objective}`} (risk ${c.goal.risk.toString()}, ${c.goal.deadlineDays.toString()} days) by ${c.route}${c.bypass ? ', around the chain' : ''}`;
    case 'review':
      return c.action === 'edit' && c.edit !== null ? `edit ${c.to}'s plan: ${c.edit.kind}${c.edit.axis === null ? '' : ` ${c.edit.axis}`}${c.edit.region === null ? '' : ` to ${c.edit.region}`}${c.edit.via.length > 0 ? ` via ${c.edit.via.join(',')}` : ''}` : `${c.action === 'approve' ? 'approve' : 'send back'} ${c.to}'s plan`;
    case 'decide':
      return `decide ${c.situation}: ${c.options.length === 0 ? 'let it take its course' : c.options.join(', ')}`;
    case 'delegate':
      return `hand ${c.situation} to ${c.to}`;
    case 'transfer':
      return `transfer ${c.amount.toString()} ${c.force} from ${c.from} to ${c.to}`;
    case 'audience':
      return `audience with ${c.to}${c.counters.length === 0 ? '' : `: ${c.counters.map((k) => k.kind).join(', ')}`}`;
    case 'go':
      return `the word to go, to ${c.to}`;
    case 'call':
      return `call ${c.regiments.toString()} regiments for ${c.termDays.toString()} days from ${c.to}`;
    case 'appoint':
      return `appoint ${c.person} to ${c.post}${c.rank === null ? '' : ` as ${c.rank}`}`;
    case 'relieve':
      return `relieve ${c.post}'s holder (${c.mode.replace('_', ' ')}${c.to === null ? '' : `, to ${c.to}`})`;
    case 'inquire':
      return `ask ${c.to} for a report${c.subject === null ? '' : ` on ${c.subject}`}`;
    case 'consult':
      return `consult ${c.posts.join(', ')} on ${c.situation}`;
    case 'observer':
      return `send ${c.person} to watch ${c.to}`;
    case 'promise':
      return `promise ${c.person} advancement`;
    case 'pressure':
      return `press ${c.person}`;
    case 'address':
      return `address the ${c.bloc}`;
  }
}
