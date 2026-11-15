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
 * Two jobs in Phase 0:
 * - a commander with a standing goal (hold, or advance to a region) picks his
 *   next step from the options the kernel judged consistent with him;
 * - a principal sends his side's opening advance on the objective the first morning his side is
 *   at war (the pack's war flag, 0064), and goes around a relaying office that
 *   objects, by special messenger;
 * - a holder handed a situation decides it by his values: the option the
 *   kernel scored as honouring them most (lane 0.7). A rule-driven principal's
 *   own situations take their historical default inside the kernel (a history
 *   run, 0040), so no rule seat ever sees that default.
 * AI seats (Phase 1) wrap a rule seat and fall back to it.
 */
import type { DelegatedMenu, OptionView, OrderCommand, PrincipalMenu, ReportView, RouteOption, Seat, SeatAnswer, SeatRequest, StandingMenu } from '@mandate/kernel/seat-api';

export interface RuleSeatPolicy {
  /** The day a principal orders his opening advance on the objective. */
  readonly openingDay: number;
  /** Whether a principal sends an objected order again around the office that objected. */
  readonly goAroundObjections: boolean;
}

export const DEFAULT_RULE_SEAT_POLICY: RuleSeatPolicy = Object.freeze({ openingDay: 1, goAroundObjections: true });

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** A commander's step: the option the kernel scored highest, ties to the lower option id. */
export function chooseStep(menu: StandingMenu): OptionView {
  const best = [...menu.options].sort((a, b) => b.score - a.score || compareText(a.optionId, b.optionId))[0];
  if (best === undefined) throw new RangeError(`standing menu for ${menu.post} offers no option`);
  return best;
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

/** The quickest route that costs nothing, else the quickest at all; ties to the route's name. */
function quickest(routes: readonly RouteOption[]): RouteOption | undefined {
  const free = routes.filter((r) => r.price === 0);
  return [...(free.length > 0 ? free : routes)].sort((a, b) => a.typicalDays - b.typicalDays || compareText(a.route, b.route))[0];
}

/** Memoranda that objected to one of his orders and reached him yesterday. */
function freshObjections(reports: readonly ReportView[], day: number): ReportView[] {
  return reports.filter((r) => r.type === 'advice' && r.subtype === 'memorandum' && r.answers !== null && r.receivedDay === day - 1 && r.subjectKind === 'post');
}

/** A principal's orders for the day. */
export function principalOrders(menu: PrincipalMenu, reports: readonly ReportView[], day: number, policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): OrderCommand[] {
  // 0064: the generic principal keeps the peace, every standing goal at hold, until his side is at war, and
  // opens his campaign the first morning after it begins (or on the policy's opening day, if that is later).
  if (menu.objective === null || menu.atWarSince === null) return [];
  const orders: OrderCommand[] = [];
  if (day === Math.max(policy.openingDay, menu.atWarSince + 1)) {
    // The army that can be reached soonest opens the campaign; the rest hold where they stand.
    const ranked = menu.commandable
      .map((c) => ({ c, route: quickest(c.routes) }))
      .filter((x): x is { c: (typeof menu.commandable)[number]; route: RouteOption } => x.route !== undefined)
      .sort((a, b) => a.route.typicalDays - b.route.typicalDays || compareText(a.c.post, b.c.post));
    const first = ranked[0];
    if (first !== undefined) orders.push({ cmd: 'order', to: first.c.post, goal: 'advance', region: menu.objective, route: first.route.route, bypass: false });
  }
  if (policy.goAroundObjections) {
    for (const memo of freshObjections(reports, day)) {
      const target = menu.commandable.find((c) => c.post === memo.subjectId);
      if (target === undefined || target.relays.length === 0) continue;
      const objected = memo.claims.find((c) => c.kind === 'order-objected');
      const region = objected?.region ?? menu.objective;
      // Around the man who objected, by the fastest messenger, at its price.
      orders.push({ cmd: 'order', to: target.post, goal: 'advance', region, route: 'special-messenger', bypass: true });
    }
  }
  return orders;
}

export function respond(request: SeatRequest, policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): SeatAnswer {
  const menu = request.menu;
  if (menu.menuKind === 'standing-goal') return { answerKind: 'choose', option: chooseStep(menu).optionId };
  if (menu.menuKind === 'delegated-situation') return { answerKind: 'commands', commands: [{ cmd: 'decide', situation: menu.choice.situation, options: chooseDelegated(menu) }] };
  return { answerKind: 'commands', commands: principalOrders(menu, request.view.reports, request.requestDay, policy) };
}

/** A rule seat. One serves every person: it holds nothing between requests. */
export function createRuleSeat(policy: RuleSeatPolicy = DEFAULT_RULE_SEAT_POLICY): Seat {
  return Object.freeze({ driver: 'rules' as const, respond: (request: SeatRequest) => respond(request, policy) });
}
