import { ids, phase0, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld, v2Map } from '../src/seats-world.ts';

/**
 * A government the start declares (lane 1.11, the lead's ruling on a government formed during the war): inactive at the
 * start, established by a situation's effect (command's government_established), its declared region passes to it with
 * no side; a later proposal gives it a side through department_side (0065), as S15's recognition will. On the testbed.
 */
const S = (id: string) => ids.toId('situation', id);

function notice(id: string, day: number, propose: { field: string; subject: string; side: string | null }): phase0.SituationDef {
  return {
    id: S(id), kind: 'notice', faction: ids.toId('faction', 'north'), title: `situation.${id}.title`, text: `situation.${id}.text`, earliest: '1861-03-01',
    event: { dayAtLeast: day }, knowledge: null, railroad: 'a test notice', chain: null, subjects: [], options: [], inaction: null, historicalDefault: null,
    staffLine: null, delegableTo: [], resurfaceOn: [],
    effects: [{ propose: { owner: 'command', field: propose.field, subject: propose.subject, delta: 1, reason: 'test', side: propose.side === null ? null : ids.toId('faction', propose.side) } }],
    report: { authors: [ids.toId('post', 'n_war_office')], reportType: 'wire-dispatch', subtype: null }, gate: { none: 'a test' }, gateReview: null, citations: [],
  } as unknown as phase0.SituationDef;
}

function run(situations: phase0.SituationDef[], declare: boolean, days = 4) {
  const map = v2Map('testbed')!;
  const held = map.start.governments.find((g) => g.department !== 'unknown')!;
  const parent = map.world.departments.find((d) => d.id === held.department)!;
  const fresh = { ...parent, id: ids.toId('department', 'n_new_government'), faction: null };
  const world = { ...map.world, departments: [...map.world.departments, fresh] } as w.World;
  const start = { ...map.start, declaredGovernments: declare ? [{ id: fresh.id, regions: [held.region] }] : [] };
  const seats = phase0.indexSeatsWorld(w.indexWorld(world), start, { situations });
  let state = phase0.createState(seats, { seed: map.start.seed, people: 'as-history' });
  const events: unknown[] = [];
  for (let d = 1; d <= days; d++) {
    const r = phase0.tick(seats, state, [], { freeze: true });
    events.push(...r.mapEvents);
    state = r.state;
  }
  return { state, events, region: held.region, from: held.department };
}

describe('a declared government is established by a situation (lane 1.11)', () => {
  it('takes its declared region with no side, and joins a side only when one is proposed', () => {
    const established = run([notice('wheeling', 1, { field: 'government_established', subject: 'n_new_government', side: null })], true);
    expect(established.state.regionGovernments[established.region]).toBe('n_new_government');
    expect(established.state.departmentFactions['n_new_government' as never] ?? null).toBeNull();
    const recognised = run(
      [notice('wheeling', 1, { field: 'government_established', subject: 'n_new_government', side: null }), notice('recognised', 2, { field: 'department_side', subject: 'n_new_government', side: 'north' })],
      true,
    );
    expect(recognised.state.departmentFactions['n_new_government' as never]).toBe('north');
  });

  it('refuses to take a region a people governs themselves (0069, 0070), changing nothing', () => {
    const map = v2Map('union-1861')!;
    const nationRegion = map.start.governments.find((g) => {
      const d = map.world.departments.find((x) => x.id === g.department);
      return map.world.vocabularies.departmentKinds.find((k) => k.id === d?.kind)?.selfGoverning === true;
    })!;
    const stateGov = map.world.departments.find((d) => map.world.vocabularies.departmentKinds.find((k) => k.id === d.kind)?.government === true && map.world.vocabularies.departmentKinds.find((k) => k.id === d.kind)?.selfGoverning !== true)!;
    const fresh = { ...stateGov, id: ids.toId('department', 'zz_declared'), faction: null };
    const world = { ...map.world, departments: [...map.world.departments, fresh] } as w.World;
    const start = { ...map.start, declaredGovernments: [{ id: fresh.id, regions: [nationRegion.region] }] };
    const def = { ...notice('wheeling', 1, { field: 'government_established', subject: 'zz_declared', side: null }), faction: ids.toId('faction', 'union'), report: { authors: [ids.toId('post', 'us_secretary_war')], reportType: 'informal', subtype: 'cabinet-word' } } as unknown as phase0.SituationDef;
    const seats = phase0.indexSeatsWorld(w.indexWorld(world), start, { situations: [...seatsWorld('union-1861').world.situations.filter(s => s.id === 'manassas_advance_received'), def] });
    let state = phase0.createState(seats, { seed: map.start.seed, people: 'as-history' });
    const events: unknown[] = [];
    for (let d = 1; d <= 3; d++) {
      const r = phase0.tick(seats, state, [], { freeze: true });
      events.push(...r.mapEvents);
      state = r.state;
    }
    expect(state.regionGovernments[nationRegion.region]).toBe(nationRegion.department);
    expect(events).toContainEqual(expect.objectContaining({ event: 'proposal_refused', owner: 'command', reason: 'self_governing_region' }));
  });

  it('refuses a government the start does not declare, changing nothing', () => {
    const r = run([notice('wheeling', 1, { field: 'government_established', subject: 'n_new_government', side: null })], false);
    expect(r.state.regionGovernments[r.region]).toBe(r.from);
    expect(r.events).toContainEqual(expect.objectContaining({ event: 'proposal_refused', owner: 'command' }));
  });
});
