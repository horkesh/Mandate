/**
 * Minimal seats for kernel tests. The real rule seats live in
 * `packages/rule-seats`; the kernel's tests must not depend on them.
 */
import type { GoalTerms, OrderCommand, PostId, RegionId, Seat, SeatCommand, SeatId } from '../../src/seat-api.ts';
import { toId } from '../../src/ids.ts';
import type { SeatTable } from '../../src/log/session.ts';

/**
 * Picks the highest-scored option; a principal sends the orders scripted for each day (by faction), and approves
 * every plan submitted to him as drafted and gives the word to every operation that awaits it (lane 1.2), by wire and
 * straight to the commander (around the offices, whose relay compliance could otherwise hold or object to them).
 */
export function scriptedSeats(script: Readonly<Record<string, Readonly<Record<number, readonly SeatCommand[]>>>> = {}): SeatTable {
  const seat: Seat = {
    driver: 'rules',
    respond(request) {
      if (request.menu.menuKind === 'principal') {
        const answers: SeatCommand[] = [
          ...request.menu.reviews.map((r): SeatCommand => ({ cmd: 'review', to: r.post, action: 'approve', edit: null, route: 'wire', bypass: true })),
          ...request.menu.awaiting.map((p): SeatCommand => ({ cmd: 'go', to: p, route: 'wire', bypass: true })),
        ];
        return { answerKind: 'commands', commands: [...answers, ...(script[request.menu.faction]?.[request.requestDay] ?? [])] };
      }
      if (request.menu.menuKind === 'delegated-situation') {
        const choice = request.menu.choice;
        const best = [...choice.options].sort((a, b) => b.score - a.score || (a.optionId < b.optionId ? -1 : 1))[0];
        return { answerKind: 'commands', commands: [{ cmd: 'decide', situation: choice.situation, options: best === undefined ? [] : [best.optionId] }] };
      }
      // A commander's battle (lane 1.12): every point to his traits.
      if (request.menu.menuKind === 'battle') return { answerKind: 'commands', commands: [{ cmd: 'battle', post: request.menu.post, commit: 'judge', night: 'judge', cutOff: 'judge', pursue: 'judge' }] };
      const best = [...request.menu.options].sort((a, b) => b.score - a.score || (a.optionId < b.optionId ? -1 : 1))[0]!;
      return { answerKind: 'choose', option: best.optionId };
    },
  };
  return (_: SeatId) => seat;
}

/** The goal terms kernel tests give an order: the testbed's goal defaults, every block committed, approved as drafted. */
export function goalTerms(posture: GoalTerms['posture'], objective: string | null, over: Partial<GoalTerms> = {}): GoalTerms {
  return {
    objective: objective === null ? null : (toId('region', objective) as RegionId),
    posture,
    risk: 500,
    deadlineDays: 20,
    rail: true,
    river: false,
    sea: false,
    neutral: false,
    committed: [],
    awaitWord: false,
    approveAsDrafted: true,
    ...over,
  };
}

/** An order as Phase 0's tests wrote it: `advance` is a goal to take the region, `hold` a goal to hold it (or where he stands). */
export function order(to: string, goal: 'advance' | 'hold', region: string | null, route: OrderCommand['route'] = 'wire', bypass = false, over: Partial<GoalTerms> = {}): OrderCommand {
  return { cmd: 'order', to: toId('post', to) as PostId, goal: goalTerms(goal === 'advance' ? 'take' : 'hold', region, over), route, bypass };
}
