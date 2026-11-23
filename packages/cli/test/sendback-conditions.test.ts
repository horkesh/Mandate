import { expect, it } from 'vitest';
import { ids, planner, world } from '@mandate/kernel';
import { CASES, caseInput, SEATINGS } from '../src/planner-cases.ts';
import { bombard, direct, directRoute, holding } from '../../kernel/src/planner/methods.ts';
import { noteCandidates } from '../../kernel/src/planner/notes.ts';
import type { PlanNote } from '../../kernel/src/plans/notes.ts';
import { edge } from '../../kernel/test/support/map-fixture.ts';

const R = (id: string) => ids.toId('region', id);
const wait: PlanNote = { markKind: 'wait', markAxis: 'main', markDays: 7, markRegion: null, markVia: [] };

it('recomputes reinforcement requests and gates for each note alternative, including a wait for men', () => {
  const { input } = caseInput(CASES[1]!, SEATINGS[0]!);
  const request: planner.PlannerInput = {
    ...input,
    assaultMargin: 1000,
    rules: { ...input.rules, hopShare: 0 },
    beliefs: new Map([[R('s_heartland'), 20000], [R('w_valley'), 100]]),
  };
  const ctx = planner.makeCtx(request);
  const own = direct(ctx, directRoute(ctx));
  if ('rejected' in own) throw Error('direct draft expected');
  expect(own.ok.candAxes[0]!.axisStrength).toBe(8000);
  expect(own.ok.candRequests).toMatchObject([{ reqKind: 'reinforcement', reqMen: 12000 }]);
  expect(own.ok.candConditions).toMatchObject([{ gateKind: 'move_when_reinforced' }]);
  const marks: PlanNote[] = [
    wait,
    { ...wait, markKind: 'via', markDays: null, markVia: [R('w_valley')] },
    { ...wait, markKind: 'avoid', markDays: null, markRegion: R('e_lowlands') },
    { ...wait, markKind: 'focus', markDays: null, markRegion: R('w_valley') },
    { ...wait, markDays: 8 },
    { ...wait, markKind: 'focus', markDays: null, markRegion: R('s_heartland') },
    { ...wait, markDays: 9 },
  ];
  const candidates = noteCandidates(planner.makeCtx({ ...request, notes: marks.map(mark => ({ mark, weight: 1000 })), noteScoreWeight: 600 }), [own.ok]);
  expect(candidates).toHaveLength(marks.length + 1);
  for (const [index, men] of [12000, 12000, 12000, 0, 0, 12000, 12000].entries()) {
    const candidate = candidates[index + 1]!;
    expect(candidate.candVariant.endsWith(`+note${index}`)).toBe(true);
    expect(candidate.candNotes![index]!.noteFollowed).toBe(true);
    const requests = candidate.candRequests.filter(r => r.reqKind === 'reinforcement');
    const gates = candidate.candConditions.filter(g => g.gateKind === 'move_when_reinforced');
    expect(requests, candidate.id).toEqual(men ? [{ ...own.ok.candRequests[0]!, reqMen: men }] : []);
    expect(gates, candidate.id).toEqual(men ? own.ok.candConditions : []);
  }
  expect(candidates[1]!.candAxes[0]!.axisPhases.find(p => p.phaseKind === 'concentrate')!.phaseDays).toBe(7000);
});

it('N9: notes cannot turn holding or bombardment into a march, but can change a marching draft', () => {
  const { input } = caseInput(CASES[2]!, SEATINGS[0]!);
  const request: planner.PlannerInput = {
    ...input,
    goal: { ...input.goal, goalPurpose: undefined, goalObjective: input.goal.goalObjective ?? null, goalPosture: 'take' },
    // Put a held battery shore beside the fictional fort, instead of sailing through open sea.
    ground: { ...input.ground, map: world.indexWorld({ ...input.ground.map.world,
      edges: [...input.ground.map.world.edges, edge('n_naval_base', 'island_fort', { type: 'sea' })],
    }) },
    forces: input.forces.map(f => f.post === input.post ? { ...f, aboard: null } : f),
    bombardment: { ...input.bombardment, gunArms: ['infantry'], objectives: [{ region: R('island_fort'), source: 'testbed fixture' }], rangeMaxDaysPermille: 100000 },
  };
  const ctx = planner.makeCtx(request);
  const stationary = [holding(ctx), bombard(ctx)];
  for (const outcome of stationary) {
    if ('rejected' in outcome) throw Error(JSON.stringify(outcome.rejected));
    const candidate = outcome.ok;
    const mark = { ...wait, markAxis: candidate.candAxes[0]!.axisName };
    const alternatives = noteCandidates(planner.makeCtx({ ...request, notes: [{ mark, weight: 1000 }], noteScoreWeight: 600 }), [candidate]);
    expect(alternatives, candidate.candMethod).toHaveLength(1);
    expect(alternatives[0]!.candAxes).toEqual(candidate.candAxes);
    expect(alternatives[0]!.candAxes.flatMap(a => a.axisPhases).some(p => p.phaseKind === 'march')).toBe(false);
    expect(alternatives[0]!.candAxes[0]!.axisPhases.some(p => p.phaseKind === (candidate.candMethod === 'holding' ? 'hold' : 'bombard'))).toBe(true);
  }
  const { input: land } = caseInput(CASES[1]!, SEATINGS[0]!);
  const landCtx = planner.makeCtx(land);
  const moving = direct(landCtx, directRoute(landCtx));
  if ('rejected' in moving) throw Error('marching draft expected');
  const alternatives = noteCandidates(planner.makeCtx({ ...land, notes: [{ mark: wait, weight: 1000 }], noteScoreWeight: 600 }), [moving.ok]);
  expect(alternatives).toHaveLength(2);
  expect(alternatives[1]!.candAxes[0]!.axisPhases.find(p => p.phaseKind === 'concentrate')!.phaseDays).toBe(7000);
});
