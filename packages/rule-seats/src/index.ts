/**
 * Rule seats (FOUNDATION section 8; decision 0015: rules first).
 *
 * A rule seat decides for any person from the request alone: the view the
 * kernel built from what he may know, and the menu of responses it judged
 * legal. It imports nothing from the kernel but `@mandate/kernel/seat-api`
 * (proved by the kernel's boundary test), holds no state of its own and draws
 * no dice, so its answers are a pure function of the request. Its answers
 * still go into the command log, like any seat's: replay never asks it again.
 *
 * Its jobs:
 * - **a commander** picks among the planner's candidates for his goal: the one his own scorer ranked best, a score
 *   weighted by his own profile (his boldness, caution and perception), so he chooses by his traits (lane 1.2; lane
 *   1.12). In a battle he leaves every decision to his traits (`judge`), so a rule seat's battles are the trait rule's;
 *   another seat may order each point (lane 1.12);
 * - **a principal** does his historical jobs by his pack doctrine (lane 1.12, replacing the generic principal of 0072
 *   and the other side's capital as everyone's objective). He keeps the peace until his side is at war (0064, 0066),
 *   then, each morning, within his week's attention and in this order:
 *   1. answers his commanders: approves every plan submitted to him as drafted, gives the word to every operation
 *      that waits for it, and goes around an office that withheld his answer;
 *   2. gives each offensive goal on its day (the doctrine's dated rows; none before the morning after war);
 *   3. fills each post commanding troops that nobody holds, with the senior man of the right kind (appoint);
 *   4. calls on each raising post the doctrine lists, once, from its date (lane 1.7's recruitment);
 *   5. concentrates what the governors raised at the doctrine's post (transfer);
 *   6. asks each of his armies (the concentration post, each offensive's post) where it stands, on the doctrine's
 *      cadence (inquire, which costs no attention).
 *   He holds his capital by never ordering its garrison away: only the doctrine's offensives move an army.
 *   At peace or war, he consults the offered posts of an open situation's proposers, within attention.
 * - **a holder handed a situation** decides it by his values: the option the kernel scored as honouring them most
 *   (lane 0.7). A rule-driven principal's own situations take their historical default inside the kernel (a history
 *   run, 0040), so no rule seat ever sees that default.
 * AI seats (Phase 1) wrap a rule seat and fall back to it.
 */
import type {
  BattleMenu,
  DelegatedMenu,
  GoalTerms,
  OptionView,
  PlanMenu,
  PrincipalMenu,
  ReportView,
  RouteOption,
  Seat,
  SeatAnswer,
  SeatCommand,
  SeatRequest,
} from '@mandate/kernel/seat-api';

export interface RuleSeatPolicy {
  /** The first day a principal acts on his doctrine (never before the morning after his side is at war). */
  readonly openingDay: number;
  /** Whether a principal sends an objected order again around the office that objected. */
  readonly goAroundObjections: boolean;
}

export const DEFAULT_RULE_SEAT_POLICY: RuleSeatPolicy = Object.freeze({ openingDay: 1, goAroundObjections: true });

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** A commander's plan: the candidate his own scorer ranked highest, ties to the lower candidate id. */
export function choosePlan(menu: PlanMenu): OptionView {
  const best = [...menu.options].sort((a, b) => b.score - a.score || compareText(a.optionId, b.optionId))[0];
  if (best === undefined) throw new RangeError(`plan menu for ${menu.post} offers no candidate`);
  return best;
}

/** A goal to take `objective` with every block the post commands, on the pack's goal terms and his doctrine's neutral ground. */
export function takeGoal(menu: PrincipalMenu, objective: GoalTerms['objective']): GoalTerms {
  return { ...menu.goalDefaults, objective, posture: 'take', committed: [], neutral: menu.goalDefaults.neutral || menu.doctrine.crossNeutral };
}

/** A delegate's choice: the option that honours his values most, ties to the earlier in display order. */
export function chooseDelegated(menu: DelegatedMenu): string[] {
  const options = menu.choice.options;
  let best = -1;
  options.forEach((o, i) => {
    if (best === -1 || o.score > options[best]!.score) best = i;
  });
  return best === -1 ? [] : [options[best]!.optionId];
}

/** A commander's battle orders: `judge` at every point, so his traits decide each on the spot. */
export function battleOrders(menu: BattleMenu): SeatCommand {
  return { cmd: 'battle', post: menu.post, commit: 'judge', night: 'judge', cutOff: 'judge', pursue: 'judge' };
}

/** The quickest route that costs nothing, else the quickest at all; ties to the route's name. */
function quickest(routes: readonly RouteOption[]): RouteOption | undefined {
  const free = routes.filter((r) => r.price === 0);
  return [...(free.length > 0 ? free : routes)].sort((a, b) => a.typicalDays - b.typicalDays || compareText(a.route, b.route))[0];
}

/** Urgent bypasses take the fastest offered route, paying for a messenger only when it is quicker. */
function fastest(routes: readonly RouteOption[]): RouteOption | undefined {
  return [...routes].sort((a, b) => a.typicalDays - b.typicalDays || a.price - b.price || compareText(a.route, b.route))[0];
}

/** Memoranda that objected to one of his orders and reached him yesterday. */
function freshObjections(reports: readonly ReportView[], day: number): ReportView[] {
  return reports.filter((r) => r.type === 'advice' && r.subtype === 'memorandum' && r.answers !== null && r.receivedDay === day - 1 && r.subjectKind === 'post');
}

/** What a command costs him, by the pack's table (the kernel prices the same way: `tick/attention.ts`). */
function price(menu: PrincipalMenu, c: SeatCommand): number {
  // The cost table's keys (the pack's `rules.people.attention.costs`): a call is priced as an order (lane 1.4c).
  let key: string | null = null;
  if (c.cmd === 'order' || c.cmd === 'call') key = 'order';
  else if (c.cmd === 'review') key = c.action === 'approve' ? 'review_approve' : c.action === 'edit' ? 'review_edit' : 'review_send_back';
  else if (c.cmd === 'go' || c.cmd === 'appoint' || c.cmd === 'relieve' || c.cmd === 'transfer' || c.cmd === 'inquire' || c.cmd === 'consult' || c.cmd === 'audience' || c.cmd === 'observer' || c.cmd === 'promise' || c.cmd === 'pressure' || c.cmd === 'address') key = c.cmd;
  const base = key === null ? 0 : (menu.attention.costs[key] ?? 0);
  return base + ('route' in c && c.route === 'special-messenger' ? menu.attention.specialMessenger : 0);
}

/** A principal's orders for the day: his answers to his commanders, then his doctrine, within his attention. */
export function principalOrders(menu: PrincipalMenu, reports: readonly ReportView[], day: number, policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): SeatCommand[] {
  let left = menu.attention.left ?? Number.MAX_SAFE_INTEGER;
  const orders: SeatCommand[] = [];
  /** Send it if he can pay for it today; else it waits for a later morning (or his weekly refill). */
  const send = (c: SeatCommand): boolean => {
    const cost = price(menu, c);
    if (cost > left) return false;
    left -= cost;
    orders.push(c);
    return true;
  };
  // 1. Plans submitted to him, approved as drafted; operations awaiting his word, released (by the quickest free route).
  // An office that withheld his answer (its objection reached him yesterday) is gone around with the same answer, by the
  // fastest messenger, at its price; never with a fresh goal, which would start the plan over (lane 1.2).
  const withheld = new Set(policy.goAroundObjections ? freshObjections(reports, day).map((m) => m.subjectId) : []);
  const routeTo = (post: string, urgent = false) => (urgent ? fastest : quickest)(menu.commandable.find((c) => c.post === post)?.routes ?? [])?.route ?? 'courier';
  for (const r of menu.reviews) {
    const around = withheld.has(r.post);
    send({ cmd: 'review', to: r.post, action: 'approve', edit: null, route: routeTo(r.post, around), bypass: around });
  }
  for (const post of menu.awaiting) {
    const around = withheld.has(post);
    send({ cmd: 'go', to: post, route: routeTo(post, around), bypass: around });
  }
  // A surfaced question may need advice at peace too. The menu offers only proposers' own-side held posts whose
  // consultation has not been sent; the existing verb carries each request and records whatever its holder answers.
  for (const situation of menu.situations) {
    const posts = [...new Set(situation.consultPosts ?? [])].sort(compareText);
    if (posts.length > 0) send({ cmd: 'consult', situation: situation.situation, posts });
  }
  const answered = new Set<string>([...menu.reviews.map((r) => r.post), ...menu.awaiting]);
  const sendCalls = (peaceOnly: boolean): void => {
    for (const call of menu.doctrine.calls) {
      if (day < call.day || (peaceOnly && call.atPeace !== true)) continue;
      const r = menu.raising.find(x => x.post === call.post);
      const route = r === undefined ? undefined : quickest(r.routes);
      if (r === undefined || route === undefined || (call.id === undefined ? r.called : call.issued === true)) continue;
      send({ cmd: 'call', to: r.post, regiments: call.regiments, termDays: call.termDays, route: route.route, bypass: false,
        ...(call.termsId === undefined ? {} : { termsId: call.termsId }), ...(call.id === undefined ? {} : { callId: call.id }), ...(call.men === undefined ? {} : { men: call.men }), ...(call.arm === undefined ? {} : { arm: call.arm }), ...(call.readiness === undefined ? {} : { readiness: call.readiness }) });
    }
  };
  // 0064, 0066: nothing of his doctrine before the morning after his side is at war.
  if (menu.atWarSince === null) { sendCalls(true); return orders; }
  const opening = Math.max(policy.openingDay, menu.atWarSince + 1);
  if (day < opening) { sendCalls(true); return orders; }
  const doctrine = menu.doctrine;
  const appointed = new Set((doctrine.appointments ?? []).filter(a => a.ready || a.issued).map(a => a.person));
  const appointedPosts = new Set<string>();

  // Sourced establishments wait for their date, their government's side and an eligible serving commander.
  // The appointment letter carries the expected old post; command alone changes both holder links on arrival.
  for (const a of doctrine.appointments ?? []) {
    if (!a.ready || a.issued) continue;
    const route = quickest(a.routes);
    if (route !== undefined) send({ cmd: 'appoint', post: a.post, person: a.person, rank: null, route: route.route, ...(a.from === null ? {} : { from: a.from }) });
  }

  // 2. Each offensive goal on its day: the doctrine's dated row, or the opening morning if its date has passed.
  for (const o of doctrine.offensives) {
    if (o.ready === undefined ? day !== Math.max(o.day, opening) : !o.ready || o.issued === true || day < Math.max(o.day, opening)) continue;
    const target = menu.commandable.find((c) => c.post === o.post);
    const route = target === undefined ? undefined : quickest(target.routes);
    if (target === undefined || route === undefined) continue;
    send({ cmd: 'order', to: target.post, goal: { ...takeGoal(menu, o.objective), posture: o.posture ?? 'take' }, route: route.route, bypass: false });
    answered.add(target.post);
  }
  // An order an office withheld is sent again around it, to the objective it named (a fresh goal is never invented).
  if (policy.goAroundObjections) {
    for (const memo of freshObjections(reports, day)) {
      const target = menu.commandable.find((c) => c.post === memo.subjectId);
      if (target === undefined || target.relays.length === 0 || answered.has(target.post)) continue;
      const region = memo.claims.find((c) => c.kind === 'order-objected')?.region ?? null;
      if (region === null) continue;
      const copy = menu.sentGoals?.find(s => s.post === target.post && s.message === memo.answers);
      // A late objection to a superseded letter cannot replace the newer goal.
      // Older menus lacked sender copies; keep their legacy objective-only fallback.
      if (menu.sentGoals !== undefined && copy === undefined) continue;
      send({ cmd: 'order', to: target.post, goal: copy?.goal ?? takeGoal(menu, region), route: routeTo(target.post, true), bypass: true });
    }
  }
  // The history driver alone is offered sourced appointments due today. These use the same letter and compliance
  // as any appointment; their date never opens a command or replaces a holder by itself.
  for (const a of menu.historicalAppointments ?? []) {
    const route = quickest(a.routes);
    if (route !== undefined && !appointed.has(a.person) && send({ cmd: 'appoint', post: a.post, person: a.person, rank: null, route: route.route })) {
      appointed.add(a.person);
      appointedPosts.add(a.post);
    }
  }
  // 3. A post commanding troops with nobody to command them gets the senior man of the right kind (lane 1.5's appoint).
  for (const v of menu.vacancies) {
    if (v.appointing || appointedPosts.has(v.post)) continue;
    const kinds = doctrine.appointKinds[v.arm];
    const man = menu.candidates.find((c) => kinds.includes(c.kind) && !appointed.has(c.person) && !(menu.historicalAppointees ?? []).includes(c.person));
    const route = quickest(v.routes);
    if (man === undefined || route === undefined) continue;
    appointed.add(man.person);
    send({ cmd: 'appoint', post: v.post, person: man.person, rank: null, route: route.route });
  }
  // 4. Each dated requisition once. A later identified call is independent of the governor's earlier answers.
  sendCalls(false);
  // 5. Named command inclusions remain independent of the latest destination for new levies.
  // A reported zero is not authority to discard an expressly named contingent of unknown strength.
  // The receiving post must have become known; the ordinary verb still owns compliance and joining.
  const inclusions = new Map(doctrine.concentrationTransfers?.map(t => [t.from, t.to]));
  if (doctrine.concentrateAt !== null) {
    for (const c of menu.commandable) {
      const named = inclusions.get(c.post) ?? (doctrine.concentrationTransfers === undefined && doctrine.concentrateFrom?.includes(c.post) ? doctrine.concentrateAt : undefined);
      const to = named ?? (c.raising && doctrine.concentrateLevies !== false ? doctrine.concentrateAt : undefined);
      if (to === undefined || c.post === to || (named === undefined && c.men === 0) || c.inTransit.includes('transfer')) continue;
      const route = quickest(c.routes);
      if (route === undefined) continue;
      send({ cmd: 'transfer', from: c.post, to, force: 'blocks', amount: 999, route: route.route });
    }
  }
  // 6. On the doctrine's cadence, he asks each of his armies where it stands and what it faces: the post where he
  // concentrates and each offensive's post, not every fort and yard (no attention; one or two a week).
  const armies = new Set<string>([...(doctrine.concentrateAt === null ? [] : [doctrine.concentrateAt]), ...doctrine.offensives.map((o) => o.post)]);
  if (doctrine.inquireEveryDays > 0 && (day - opening) % doctrine.inquireEveryDays === 0) {
    for (const c of menu.commandable) {
      if (!armies.has(c.post) || c.inTransit.includes('inquire')) continue;
      const route = quickest(c.routes);
      if (route === undefined) continue;
      send({ cmd: 'inquire', to: c.post, subject: null, route: route.route });
    }
  }
  return orders;
}

export function respond(request: SeatRequest, policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): SeatAnswer {
  const menu = request.menu;
  if (menu.menuKind === 'plan-selection') return { answerKind: 'choose', option: choosePlan(menu).optionId };
  // A commander's battle (lane 1.12): every point to his traits, so a rule seat's battles are the trait rule's own.
  if (menu.menuKind === 'battle') return { answerKind: 'commands', commands: [battleOrders(menu)] };
  if (menu.menuKind === 'delegated-situation') return { answerKind: 'commands', commands: [{ cmd: 'decide', situation: menu.choice.situation, options: chooseDelegated(menu) }] };
  return { answerKind: 'commands', commands: principalOrders(menu, request.view.reports, request.requestDay, policy) };
}

/** A rule seat. One serves every person: it holds nothing between requests. */
export function createRuleSeat(policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): Seat {
  return Object.freeze({ driver: 'rules' as const, respond: (request: SeatRequest) => respond(request, policy) });
}
