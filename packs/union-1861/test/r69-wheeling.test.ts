import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const S = (id: string) => ids.toId('situation', id);
const dates = [
  ['wheeling_convention', 98],
  ['wheeling_ordinance', 106],
  ['pierpont_elected', 107],
  ['wheeling_recognition_letter', 112],
  ['wheeling_legislature', 118],
] as const;
const restored = ids.toId('department', 'st_virginia_restored');

// Isolate the loaded pack's civic chain and S15. The call has arrived, so S15
// can open in both controls; only Virginia's secession flag differs. Starting
// just before June avoids replaying the unrelated opening in every pack test.
function civicRun(seceded: boolean) {
  const loaded = seatsWorld('union-1861');
  const included = new Set<string>([...dates.map(([id]) => id), 'pierpont_aid_requested', 'western_virginia']);
  const world = { ...loaded.world, situations: loaded.world.situations.filter((s) => included.has(s.id)) };
  const order = ids.toId('message', 'r69-call');
  let state: phase0.State = {
    ...phase0.createState(world, loaded.setup),
    stateDay: 96,
    situationFlags: seceded ? { virginia_seceded: 43 } : {},
    orderResponses: {
      'r69-call': {
        respOrder: order, respPerson: ids.toId('person', 'letcher_john'), respPost: ids.toId('post', 'st_gov_virginia'),
        respRole: 'addressee', respKind: 'call', respDay: 41,
        respActual: 'comply', respDeclared: 'comply', respWillingness: 0,
        respTerms: [], respReasons: [], respStated: [], respConditions: [],
      },
    },
  };
  const start = state;
  const days: phase0.State[] = [];
  while (state.stateDay < 148) {
    const result = phase0.tick(world, state, [], { freeze: true });
    expect(result.rejections).toEqual([]);
    state = result.state;
    days.push(state);
  }
  return { world, start, state, days };
}

describe('R69: Wheeling follows Virginia’s secession', () => {
  it('fires on 11 June with the flag, then establishes and recognises the government through the dated chain', () => {
    const run = civicRun(true);
    expect(run.world.situations.find((s) => s.id === S('wheeling_convention'))!.railroad).toBeNull();
    for (const [id, day] of dates) {
      expect(run.days.find((s) => s.stateDay === day - 1)!.situationStates[S(id)]).toBeUndefined();
      expect(run.days.find((s) => s.stateDay === day)!.situationStates[S(id)]?.sitFiredDay).toBe(day);
    }
    expect(run.days.find((s) => s.stateDay === 105)!.regionGovernments).toEqual(run.start.regionGovernments);
    const established = run.days.find((s) => s.stateDay === 106)!;
    for (const region of run.world.start.declaredGovernments.find((g) => g.id === restored)!.regions) {
      expect(established.regionGovernments[region]).toBe(restored);
    }
    expect(established.departmentFactions[restored]).toBeNull();
    expect(run.state.departmentFactions[restored]).toBe('union');
    expect(run.state.situationStates[S('western_virginia')]!.sitChosen).toContain('recognise');
    expect(run.state.situationFlags['wheeling_government_recognised']).toBeGreaterThanOrEqual(112);
  });

  it('leaves every civic notice and government absent through 31 July without the flag, even while S15 is open', () => {
    const run = civicRun(false);
    expect(run.state.situationFlags['virginia_seceded']).toBeUndefined();
    for (const day of run.days) {
      for (const [id] of dates) expect(day.situationStates[S(id)], `${id} on day ${day.stateDay}`).toBeUndefined();
      expect(day.regionGovernments).toEqual(run.start.regionGovernments);
      expect(day.departmentFactions[restored]).toBeNull();
      expect(day.situationFlags['wheeling_government_recognised']).toBeUndefined();
    }
    const question = run.state.situationStates[S('western_virginia')]!;
    expect(question.sitStatus).toBe('open');
    expect(question.sitOpenOptions).not.toContain('recognise');
    expect(question.sitChosen).toEqual([]);
  });
});
