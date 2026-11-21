import { expect, it } from 'vitest';
import { buildControlIndex } from '../src/control-index/control-index.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { traitsOf } from '../src/people/traits.ts';
import { makeCtx } from '../src/planner/context.ts';
import { draft } from '../src/planner/draft.ts';
import { applyEdit } from '../src/planner/edits.ts';
import { plannerInputFor, sidePosts } from '../src/planner/input.ts';
import { directRoute, flank } from '../src/planner/methods.ts';
import { followsNote } from '../src/planner/notes.ts';
import { profileOf } from '../src/planner/profile.ts';
import { demandFor } from '../src/planner/score.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld, type SeatsWorld } from '../src/seats/world.ts';
import { passageOf } from '../src/tick/passage.ts';
import { goalOf } from '../src/tick/orders.ts';
import { createState } from '../src/tick/setup.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { fresh } from './support/s25-fixture.ts';
import { B } from './support/forces-fixture.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';
import { edge } from './support/map-fixture.ts';
import { goalTerms } from './support/test-seats.ts';

function inputFor(world: SeatsWorld = fresh().world, ownReserve = false) {
  const initial = createState(world, { seed: 17 });
  const state = ownReserve ? { ...initial, forceAssignments: { ...initial.forceAssignments, [B('a_reserve_1')]: POST('a_army') } } : initial;
  const network = passageOf(world.map, state);
  const derived = deriveMap(world.map, { control: state.regionControl, network, month: 6 });
  const input = plannerInputFor(world, state, derived, network, 6, viewFor(world, state, seatIdFor(P('a_gen'))), POST('a_army'), goalOf(goalTerms('take', 'b_front')), 1);
  return { world, state, input };
}

it('S25 planner-03: using the exact search allowance does not report a search-cap rejection', () => {
  const { input } = inputFor();
  const complete = draft({ ...input, rules: { ...input.rules, maxSearches: 1000 } });
  expect(complete.draftSearches).toBeGreaterThan(0);
  const exact = draft({ ...input, rules: { ...input.rules, maxSearches: complete.draftSearches } });
  expect(exact.draftCandidates).toEqual(complete.draftCandidates);
  expect(exact.draftRejected.some(r => r.rejVariant === 'search_cap')).toBe(false);
});

it('S25 planner-04: the one extra axis allowed by an edit cannot be added again', () => {
  const base = inputFor(undefined, true).input;
  const input = { ...base, profile: { ...base.profile, maxAxes: 1 } };
  const set = draft(input), chosen = set.draftCandidates.find(c => c.candMethod === 'direct')!;
  expect(chosen).toBeDefined();
  const edit = { editKind: 'add_axis' as const, editAxis: null, editRegion: R('a_mid'), editVia: [], editConcentration: null };
  const first = applyEdit(input, set, chosen, edit);
  expect(first.ok).toBe(true);
  if (!first.ok) throw Error(JSON.stringify(first.reason));
  expect(first.edited.candAxes).toHaveLength(2);
  expect(applyEdit(input, set, first.edited, edit)).toEqual({ ok: false, reason: { kind: 'too-many-axes' } });
});

it('S25 planner-05: a staff office has a seat, but no field headquarters in a planner post', () => {
  const { world, state } = fresh();
  expect(sidePosts(world, state, F('a'), P('a_gen')).find(p => p.id === POST('a_office'))).toMatchObject({ region: null, seat: R('a_cap') });
});

it('S25 planner-06: a flank route at the maximum relative length is allowed', () => {
  const { world: base } = fresh();
  const replaced = new Set(['road:a_front:a_mid', 'road:a_front:b_front']);
  const world = indexSeatsWorld(indexWorld({ ...base.map.world, edges: [
    ...base.map.world.edges.filter(e => !replaced.has(e.id)),
    edge('a_front', 'a_mid', { days: 1 }), edge('a_front', 'b_front', { days: 2 }), edge('a_mid', 'b_front', { days: 1 }),
  ] }), base.start);
  const original = inputFor(world).input;
  const input = { ...original, rules: { ...original.rules, flankLengthMax: 1000 } };
  const ctx = makeCtx(input), route = directRoute(ctx)!;
  expect(route.routeDays).toBe(2000);
  const alternative = flank(ctx, route);
  expect('ok' in alternative).toBe(true);
  if ('ok' in alternative) expect(alternative.ok.candAxes[0]!.axisRoute.routeDays).toBe(2000);
});

it('S25 planner-07: concentration for the exact requested wait follows the note', () => {
  const { input } = inputFor();
  const candidate = draft(input).draftCandidates.find(c => c.candMethod === 'direct')!;
  const adjusted = { ...candidate, candAxes: candidate.candAxes.map(a => ({ ...a,
    axisPhases: [{ phaseKind: 'concentrate' as const, phaseStart: 0, phaseDays: 3000, phaseRegion: a.axisRoute.routeFrom }] })) };
  expect(followsNote(adjusted, { markKind: 'wait', markAxis: 'main', markRegion: null, markVia: [], markDays: 3 })).toBe(true);
  expect(followsNote(adjusted, { markKind: 'wait', markAxis: 'main', markRegion: null, markVia: [], markDays: 4 })).toBe(false);
});

it('S25 planner-08: a commander at the three-axis competence threshold can run three axes', () => {
  const { world, state } = fresh();
  const weights = world.map.world.rules.planner.weights;
  expect(profileOf({ ...traitsOf(world, state, P('a_gen')), competence: weights.threeAxesAt }, world.rules.traits, weights).maxAxes).toBe(3);
});

it('S25 planner-10: enemy ownership alone does not supply a believed garrison for the assault margin', () => {
  const { input, world, state } = inputFor();
  const ground = { ...input.ground, index: buildControlIndex(world.map, { ...state.regionControl, [R('b_front')]: { b: 1000 } }) };
  expect(input.assaultMargin).toBeGreaterThan(1000);
  expect(demandFor(makeCtx({ ...input, ground, beliefs: new Map() }))).toBe(input.profile.demand);
});
