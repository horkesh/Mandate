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
 * - a commander picks among the planner's candidates for his goal (lane 1.2): the one his own scorer ranked best;
 * - a principal sends his side's opening goal, to take the objective, the first morning his side is
 *   at war (the pack's war flag, 0064), with the pack's goal terms (`goalDefaults`); goes around a relaying office
 *   that objects, by special messenger; approves every plan submitted to him as drafted; and gives the word to
 *   every operation that waits for it;
 * - a holder handed a situation decides it by his values: the option the
 *   kernel scored as honouring them most (lane 0.7). A rule-driven principal's
 *   own situations take their historical default inside the kernel (a history
 *   run, 0040), so no rule seat ever sees that default.
 * AI seats (Phase 1) wrap a rule seat and fall back to it.
 *
 * STAND-IN (0072): the generic rule-seat principal. It gives the army that can be
 * reached soonest, which is always his own capital's garrison, a goal to take the
 * other side's capital, approves the plan its commander submits, and goes around
 * any office that objects. It proves the machinery; it is not a war. Since lane 1.2
 * the commander's own planner judges the goal: on the Union pack at war the
 * Washington garrison holds (Montgomery is beyond it) and the Charleston command
 * marches on Washington and takes it by contest on day 23, where Phase 0's garrison
 * marched away and left the capital empty. Its replacement is Phase 1's rule-seat
 * principals, who must do their historical jobs for the Phase 1 history run
 * (FOUNDATION section 11).
 */
import type { BattleMenu, DelegatedMenu, GoalTerms, OptionView, PlanMenu, PrincipalMenu, ReportView, RouteOption, Seat, SeatAnswer, SeatCommand, SeatRequest } from '@mandate/kernel/seat-api';

export interface RuleSeatPolicy {
  /** The day a principal orders his opening advance on the objective. */
  readonly openingDay: number;
  /** Whether a principal sends an objected order again around the office that objected. */
  readonly goAroundObjections: boolean;
  /**
   * STAND-IN (0072, with the generic principal): whether his opening goal permits marching through a neutral
   * government's open ground. Phase 0's passage let every march cross it; since lane 1.2 a goal must permit it (0062),
   * and the generic principal does, so its mechanics run still reaches the enemy. Phase 1's principals (lane 1.12)
   * decide it as a political act.
   */
  readonly crossNeutral: boolean;
}

export const DEFAULT_RULE_SEAT_POLICY: RuleSeatPolicy = Object.freeze({ openingDay: 1, goAroundObjections: true, crossNeutral: true });

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** A commander's plan: the candidate his own scorer ranked highest, ties to the lower candidate id. */
export function choosePlan(menu: PlanMenu): OptionView {
  const best = [...menu.options].sort((a, b) => b.score - a.score || compareText(a.optionId, b.optionId))[0];
  if (best === undefined) throw new RangeError(`plan menu for ${menu.post} offers no candidate`);
  return best;
}

/** A goal to take `objective` with every block the post commands, on the pack's goal terms (and the policy's neutral ground). */
export function takeGoal(menu: PrincipalMenu, objective: GoalTerms['objective'], policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): GoalTerms {
  return { ...menu.goalDefaults, objective, posture: 'take', committed: [], neutral: menu.goalDefaults.neutral || policy.crossNeutral };
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

/** Memoranda that objected to one of his orders and reached him yesterday. */
function freshObjections(reports: readonly ReportView[], day: number): ReportView[] {
  return reports.filter((r) => r.type === 'advice' && r.subtype === 'memorandum' && r.answers !== null && r.receivedDay === day - 1 && r.subjectKind === 'post');
}

/** A principal's orders for the day: goals, then his answers to the plans before him. */
export function principalOrders(menu: PrincipalMenu, reports: readonly ReportView[], day: number, policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): SeatCommand[] {
  // Plans submitted to him, approved as drafted; operations awaiting his word, released (by wire, the quickest free route).
  // An office that withheld his answer (its objection reached him yesterday) is gone around with the same answer, by the
  // fastest messenger, at its price; never with a fresh goal, which would start the plan over (lane 1.2).
  const withheld = new Set(policy.goAroundObjections ? freshObjections(reports, day).map((m) => m.subjectId) : []);
  const answers: SeatCommand[] = [];
  for (const r of menu.reviews) {
    const around = withheld.has(r.post);
    const route = around ? 'special-messenger' : (quickest(menu.commandable.find((c) => c.post === r.post)?.routes ?? [])?.route ?? 'courier');
    answers.push({ cmd: 'review', to: r.post, action: 'approve', edit: null, route, bypass: around });
  }
  for (const post of menu.awaiting) {
    const around = withheld.has(post);
    const route = around ? 'special-messenger' : (quickest(menu.commandable.find((c) => c.post === post)?.routes ?? [])?.route ?? 'courier');
    answers.push({ cmd: 'go', to: post, route, bypass: around });
  }
  const answered = new Set<string>([...menu.reviews.map((r) => r.post), ...menu.awaiting]);
  // 0064: the generic principal keeps the peace, giving no goal, until his side is at war, and
  // opens his campaign the first morning after it begins (or on the policy's opening day, if that is later).
  if (menu.objective === null || menu.atWarSince === null) return answers;
  const orders: SeatCommand[] = [...answers];
  // STAND-IN (0072): the army that can be reached soonest opens the campaign; the rest hold where they stand.
  const ranked = menu.commandable
    .map((c) => ({ c, route: quickest(c.routes) }))
    .filter((x): x is { c: (typeof menu.commandable)[number]; route: RouteOption } => x.route !== undefined)
    .sort((a, b) => a.route.typicalDays - b.route.typicalDays || compareText(a.c.post, b.c.post));
  if (day === Math.max(policy.openingDay, menu.atWarSince + 1)) {
    const first = ranked[0];
    if (first !== undefined) orders.push({ cmd: 'order', to: first.c.post, goal: takeGoal(menu, menu.objective, policy), route: first.route.route, bypass: false });
  }
  if (policy.goAroundObjections) {
    for (const memo of freshObjections(reports, day)) {
      const target = menu.commandable.find((c) => c.post === memo.subjectId);
      if (target === undefined || target.relays.length === 0 || answered.has(target.post)) continue;
      const objected = memo.claims.find((c) => c.kind === 'order-objected');
      const region = objected?.region ?? menu.objective;
      // Around the man who objected, by the fastest messenger, at its price.
      orders.push({ cmd: 'order', to: target.post, goal: takeGoal(menu, region, policy), route: 'special-messenger', bypass: true });
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
