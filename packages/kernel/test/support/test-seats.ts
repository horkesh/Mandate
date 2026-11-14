/**
 * Minimal seats for kernel tests. The real rule seats live in
 * `packages/rule-seats`; the kernel's tests must not depend on them.
 */
import type { OrderCommand, PostId, RegionId, Seat, SeatId } from '../../src/seat-api.ts';
import { toId } from '../../src/ids.ts';
import type { SeatTable } from '../../src/log/session.ts';

/** Picks the highest-scored option; a principal sends the orders scripted for each day (by faction). */
export function scriptedSeats(script: Readonly<Record<string, Readonly<Record<number, readonly OrderCommand[]>>>> = {}): SeatTable {
  const seat: Seat = {
    driver: 'rules',
    respond(request) {
      if (request.menu.menuKind === 'principal') return { answerKind: 'commands', commands: script[request.menu.faction]?.[request.requestDay] ?? [] };
      const best = [...request.menu.options].sort((a, b) => b.score - a.score || (a.optionId < b.optionId ? -1 : 1))[0]!;
      return { answerKind: 'choose', option: best.optionId };
    },
  };
  return (_: SeatId) => seat;
}

export function order(to: string, goal: 'advance' | 'hold', region: string | null, route: OrderCommand['route'] = 'wire', bypass = false): OrderCommand {
  return { cmd: 'order', to: toId('post', to) as PostId, goal, region: region === null ? null : (toId('region', region) as RegionId), route, bypass };
}
