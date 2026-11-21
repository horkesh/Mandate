/**
 * The desk's text is built from the morning's request and the reports a day brought.
 * Its wording comes from the pack's string table.
 */
import type { AxisView, OptionView, PrincipalMenu, ReportView, SeatCommand, SeatRequest, SituationView } from '@mandate/kernel/seat-api';
import { dispatchLog, enemyPicture } from './dispatches.ts';
import { noteAccountLines, noteText } from './notes.ts';
import type { DeskStrings } from './strings.ts';

function axisLine(a: AxisView, t: DeskStrings): string {
  return t('console.plan.axis', {
    name: a.name, post: a.post, mode: a.mode, strength: String(a.strength),
    route: a.regions.join(' > '), days: String(Math.ceil(a.arrival / 1000)), phases: a.phases.join(', '),
  });
}

/** A plan as he submitted it: its method, axes, what it asks of others and its conditions. */
export function planLines(plan: OptionView, t: DeskStrings): string[] {
  const asks = plan.requests.length === 0 ? '' : t('console.plan.asks', { requests: plan.requests.join(', ') });
  const conditions = plan.conditions.length === 0 ? '' : t('console.plan.conditions', { conditions: plan.conditions.join(', ') });
  return [
    t('console.plan.summary', { method: plan.method, variant: plan.variant, enemy: String(plan.perceivedEnemy), asks, conditions }),
    ...plan.axes.map(a => axisLine(a, t)),
  ];
}

/** The situations before him, open first, with their options in display order. */
export function situationLines(views: readonly SituationView[], menu: PrincipalMenu, t: DeskStrings): string[] {
  const open = views.filter(s => s.status === 'open' || s.status === 'waiting');
  if (open.length === 0) return [t('console.situation.none')];
  const out: string[] = [];
  for (const s of open) {
    const choice = menu.situations.find(c => c.situation === s.id);
    out.push(t('console.situation.heading', { id: s.id, title: t(s.title), status: s.status, day: String(s.surfacedDay) }));
    out.push('  ' + t(s.text));
    if (s.staffAuthor !== null) out.push(t('console.situation.staff', { author: s.staffAuthor }));
    else if (s.staffAbsence === 'no-adviser-on-record') out.push(t('console.situation.no-staff'));
    for (const o of s.options) {
      const advice = Array.isArray(o.proposedBy) ? t('console.situation.urged', { people: o.proposedBy.join(', ') }) : '';
      out.push(t('console.situation.option', { id: o.id, label: t(o.label), advice }));
    }
    if (choice !== undefined && choice.delegableTo.length > 0) {
      out.push(t('console.situation.delegate', { posts: choice.delegableTo.join(', ') }));
    }
  }
  return out;
}

/** Plans submitted for his review, and operations waiting for his word. */
export function planReviewLines(menu: PrincipalMenu, t: DeskStrings): string[] {
  const out: string[] = [];
  for (const r of menu.reviews) {
    out.push(t('console.plan.review', { post: r.post, holder: r.holder }), ...planLines(r.plan, t), ...noteAccountLines(r.notes ?? [], t).map(s => '  ' + s));
  }
  for (const p of menu.awaiting) out.push(t('console.plan.prepared', { post: p }));
  return out.length === 0 ? [t('console.plan.none')] : out;
}

/** The posts he may order, each with its holder, the posts an order passes, and its routes. */
export function postLines(menu: PrincipalMenu, t: DeskStrings): string[] {
  return menu.commandable.map(c => {
    const relays = c.relays.length === 0 ? '' : t('console.via', { posts: c.relays.join(' > ') });
    const routes = c.routes.map(r => {
      const price = r.price > 0 ? t('console.post.route-price', { price: String(r.price) }) : '';
      return t('console.post.route', { route: r.route, days: String(r.typicalDays), price });
    }).join(', ');
    return t('console.post', { post: c.post, holder: c.holder, relays, routes });
  });
}

/** The morning: the date, what arrived since the last reading, and what waits for him. */
export function morningLines(request: SeatRequest, sinceDay: number, t: DeskStrings, header: { readonly date: string; readonly attention: number | null }): string[] {
  const menu = request.menu;
  const view = request.view;
  if (menu.menuKind !== 'principal') return [t('console.morning.other-seat', { person: view.person, kind: menu.menuKind })];
  const attention = header.attention === null ? '' : t('console.morning.attention', { attention: String(header.attention) });
  const peace = menu.atWarSince === null ? t('console.morning.peace') : '';
  const out = [t('console.morning', { date: header.date, day: String(request.requestDay), person: view.person, faction: menu.faction, peace, attention })];
  const fresh = dispatchLog(view, sinceDay, t);
  out.push(fresh.length === 0 ? t('console.morning.nothing-new') : t('console.morning.new-inbox', { count: String(fresh.length) }), ...fresh.map(l => '  ' + l));
  const open = view.situations.filter(s => s.status === 'open');
  if (open.length > 0) {
    out.push(t('console.morning.situations', { situations: open.map(s => t('console.morning.situation', { id: s.id, title: t(s.title) })).join('; ') }));
  }
  if (menu.reviews.length > 0) out.push(t('console.morning.plans', { posts: menu.reviews.map(r => r.post).join(', ') }));
  if (menu.awaiting.length > 0) out.push(t('console.morning.awaiting', { posts: menu.awaiting.join(', ') }));
  return out;
}

/** The days of a turn passing: each day's new reports and any orders refused. */
export function dayLines(day: { readonly day: number; readonly date: string; readonly reports: readonly ReportView[]; readonly refused: readonly { readonly what: string; readonly reason: string }[] }, t: DeskStrings): string[] {
  const out = [t('console.day', { date: day.date, day: String(day.day) })];
  for (const r of day.refused) {
    const key = `console.refusal.${r.reason}`;
    const reason = t(key);
    out.push(t('console.refused', { command: r.what, reason: reason === key ? t('console.refusal.unavailable') : reason }));
  }
  for (const l of dispatchLog(day, 0, t)) out.push('  ' + l);
  return out;
}

export function enemyLines(request: SeatRequest, t: DeskStrings): string[] {
  const lines = enemyPicture(request.view, t);
  return lines.length === 0 ? [t('console.enemy.none')] : lines;
}

/** A queued command, as the queue lists it. */
export function commandText(c: SeatCommand, t: DeskStrings): string {
  switch (c.cmd) {
    case 'order':
      return t('console.command.order', {
        post: c.to, posture: c.goal.posture, objective: c.goal.objective === null ? '' : ' ' + c.goal.objective,
        risk: String(c.goal.risk), days: String(c.goal.deadlineDays), route: c.route,
        bypass: c.bypass ? t('console.command.bypass') : '',
      });
    case 'review': {
      const routed = (command: string) => t('console.command.review-route', {
        command, route: c.route, bypass: t(c.bypass ? 'console.command.bypass' : 'console.command.through-chain'),
      });
      if (c.action === 'edit' && c.edit !== null) {
        const axis = c.edit.axis === null ? '' : ' ' + c.edit.axis;
        const objective = c.edit.region === null ? '' : t('console.command.edit-to', { region: c.edit.region });
        const via = c.edit.via.length === 0 ? '' : t('console.via', { posts: c.edit.via.join(',') });
        const days = c.edit.concentration === null ? '' : t('console.command.edit-days', { days: String(c.edit.concentration) });
        return routed(t('console.command.edit', { post: c.to, kind: c.edit.kind, axis, objective, via, days }));
      }
      const notes = c.notes?.length ? ': ' + c.notes.map(n => noteText(n, t)).join(' ') : '';
      return routed(t(c.action === 'approve' ? 'console.command.approve' : 'console.command.send-back', { post: c.to, notes }));
    }
    case 'decide':
      return t('console.command.decide', { situation: c.situation, options: c.options.length === 0 ? t('console.command.no-options') : c.options.join(', ') });
    case 'delegate':
      return t('console.command.delegate', { situation: c.situation, post: c.to });
    case 'transfer':
      return t('console.command.transfer', { amount: String(c.amount), force: c.force, from: c.from, to: c.to });
    case 'audience': {
      const counters = c.counters.length === 0 ? '' : ': ' + c.counters.map(k => {
        if (k.kind === 'adjust') return t('console.command.counter-adjust', { boldness: String(k.boldness) });
        if (k.kind === 'frame') return t('console.command.counter-frame', { value: String(k.value) });
        if (k.kind === 'reinforce') return t('console.command.counter-reinforce', { post: String(k.from), men: String(k.men) });
        return k.kind;
      }).join(', ');
      return t('console.command.audience', { post: c.to, counters });
    }
    case 'go':
      return t('console.command.go', { post: c.to });
    case 'call': {
      const force = c.men === null || c.regiments === null ? t('console.command.unknown-strength')
        : c.men === undefined ? t('console.command.regiments', { count: String(c.regiments) })
          : t('console.command.men', { count: String(c.men) });
      const arm = c.arm === undefined ? '' : t('console.command.arm', { arm: c.arm });
      const term = c.termDays === null ? t('console.command.war-term') : t('console.command.days-term', { days: String(c.termDays) });
      return t(c.readiness ? 'console.command.hold-ready' : 'console.command.call', { force, arm, term, post: c.to });
    }
    case 'appoint': {
      const rank = c.rank === null ? '' : t('console.command.rank', { rank: c.rank });
      return t('console.command.appoint', { person: c.person, post: c.post, rank });
    }
    case 'relieve': {
      const to = c.to === null ? '' : t('console.command.relieve-to', { post: c.to });
      return t('console.command.relieve', { post: c.post, mode: c.mode.replace('_', ' '), to });
    }
    case 'inquire': {
      const subject = c.subject === null ? '' : t('console.command.inquire-subject', { subject: c.subject });
      return t('console.command.inquire', { post: c.to, subject });
    }
    case 'consult':
      return t('console.command.consult', { posts: c.posts.join(', '), situation: c.situation });
    case 'observer':
      return t('console.command.observer', { person: c.person, post: c.to });
    case 'promise':
      return t('console.command.promise', { person: c.person });
    case 'pressure':
      return t('console.command.pressure', { person: c.person });
    case 'address':
      return t('console.command.address', { bloc: c.bloc });
    // A commander’s battle orders. The kernel refuses them from a player’s seat.
    case 'battle':
      return t('console.command.battle', { post: c.post, commit: String(c.commit), night: String(c.night), cutOff: String(c.cutOff), pursue: String(c.pursue) });
  }
}
