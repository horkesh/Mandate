import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const loaded = seatsWorld('union-1861');
const situation = ids.toId('situation', 'missouri_provisional_government');
const department = ids.toId('department', 'st_missouri');
// Exercise the loaded notice and its command-owned effect without unrelated situations.
const world = { ...loaded.world, situations: loaded.world.situations.filter((s) => s.id === situation) };

function missouriRun(received: number | null, through = 149) {
  const order = ids.toId('message', 'r94-call');
  const response = (day: number) => ({
    [order]: {
      respOrder: order, respPerson: ids.toId('person', 'jackson_claiborne_f'),
      respPost: ids.toId('post', 'st_gov_missouri'), respRole: 'addressee' as const,
      respKind: 'call' as const, respDay: day,
      respActual: 'refuse' as const, respDeclared: 'refuse' as const, respWillingness: 0,
      respTerms: [], respReasons: [], respStated: [], respConditions: [],
    },
  });
  let state: phase0.State = {
    ...phase0.createState(world, loaded.setup), stateDay: 145,
    orderResponses: received !== null && received <= 145 ? response(received) : {},
  };
  const days: phase0.State[] = [];
  while (state.stateDay < through) {
    const day = state.stateDay + 1;
    if (day === received) state = { ...state, orderResponses: response(day) };
    const result = phase0.tick(world, state, [], { freeze: true });
    expect(result.rejections).toEqual([]);
    state = result.state;
    days.push(state);
  }
  return days;
}

describe('R94: Missouri requires a received call and the recorded date', () => {
  it.each([20, 43, 147, 148])('fires on day 148 when the call arrives on day %i', (received) => {
    const days = missouriRun(received);
    for (const state of days) {
      if (state.stateDay < 148) {
        expect(state.situationStates[situation]).toBeUndefined();
        expect(state.situationFlags.missouri_provisional_government).toBeUndefined();
        expect(state.departmentFactions[department]).toBeNull();
      } else {
        expect(state.situationStates[situation]?.sitFiredDay).toBe(148);
        expect(state.situationFlags.missouri_provisional_government).toBe(148);
        expect(state.departmentFactions[department]).toBe('union');
      }
    }
  });

  it('does not fire without a received call, even after the recorded date', () => {
    for (const state of missouriRun(null, 160)) {
      expect(state.situationStates[situation]).toBeUndefined();
      expect(state.situationFlags.missouri_provisional_government).toBeUndefined();
      expect(state.departmentFactions[department]).toBeNull();
    }
  });

  it('fires on receipt when the call arrives after day 148, without another wait', () => {
    for (const state of missouriRun(151, 152)) {
      expect(state.situationStates[situation]?.sitFiredDay).toBe(state.stateDay < 151 ? undefined : 151);
      expect(state.situationFlags.missouri_provisional_government).toBe(state.stateDay < 151 ? undefined : 151);
      expect(state.departmentFactions[department]).toBe(state.stateDay < 151 ? null : 'union');
    }
  });
});
