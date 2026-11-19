import { seatsWorld } from '../../../cli/src/seats-world.ts';
import { v2Packs } from '../../../cli/src/pack-files.ts';
import { createRuleSeat } from '@mandate/rule-seats';
import { playDays } from '../../src/log/session.ts';
import { seatIds } from '../../src/seats/seats.ts';
import { canonicalHash } from '../../src/serialize/hash.ts';
import { createState } from '../../src/tick/setup.ts';
import { viewFor } from '../../src/view/view.ts';
import type { State } from '../../src/root-state.ts';

/** Real packs are discovered rather than naming a setting in the kernel. */
export function compareOpenings(visit: (key: string, day: number, state: State) => void = () => {}, through30 = true) {
  const result: Record<string, Record<string, Record<string, string>>> = {};
  for (const pack of v2Packs()) {
    const { world, setup } = seatsWorld(pack);
    for (const atWar of [false, true]) {
      const key = `${pack}/${atWar ? 'war' : 'peace'}`;
      const days: Record<string, Record<string, string>> = {};
      const record = (state: State) => {
        visit(key, state.stateDay, state);
        days[state.stateDay] = Object.fromEntries(seatIds(state).map(seat => {
          try { return [seat, canonicalHash(viewFor(world, state, seat))]; }
          catch (error) {
            // Some pack people have seats but neither a post nor a faction's
            // capital. Preserve the existing view failure too; do not omit seats.
            if (!(error instanceof RangeError) || !error.message.includes('holds no post and has no side')) throw error;
            return [seat, `RangeError: ${error.message}`];
          }
        }));
      };
      const start = createState(world, { ...setup, atWar });
      record(start);
      const rules = createRuleSeat();
      const first = playDays(world, start, () => rules, 1, { freeze: true, deepChecks: true });
      record(first.state);
      if (through30) record(playDays(world, first.state, () => rules, 29, { freeze: true, deepChecks: true, hashEvery: 30 }).state);
      result[key] = days;
    }
  }
  return result;
}
