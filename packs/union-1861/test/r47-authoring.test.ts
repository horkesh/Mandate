import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { phase0 } from '@mandate/kernel';
import { SituationSchema } from '../../../packages/pack-format/src/situations.ts';
import { seatsWorld, v2Map } from '../../../packages/cli/src/seats-world.ts';

const raw = (file: string) => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
const regions = ['grafton', 'harpers_ferry', 'kanawha', 'northern_virginia', 'parkersburg', 'potomac_highlands', 'wheeling', 'wv_central'];

describe('R47 sourced authoring', () => {
  it('declares the eight roll-intersecting regions, with no side or change of control at setup', () => {
    const map = v2Map('union-1861')!;
    expect(map.start.declaredGovernments).toContainEqual({ id: 'st_virginia_restored', regions });
    const { world, setup } = seatsWorld('union-1861');
    const start = phase0.createState(world, setup);
    expect(start.departmentFactions['st_virginia_restored' as never] ?? null).toBeNull();
    expect(regions.every((region) => start.regionGovernments[region as never] === 'st_virginia')).toBe(true);
    const established = phase0.applyCommandProposals(world.map, start, [{ owner: 'command', field: 'government_established', subject: 'st_virginia_restored', delta: 1, side: null, origin: 'notice' }], 107, [], map.start.declaredGovernments);
    expect(established.refused).toEqual([]);
    expect(regions.every((region) => established.state.regionGovernments[region as never] === 'st_virginia_restored')).toBe(true);
    expect(established.state.regionControl).toEqual(start.regionControl);
  });

  it('keeps Houston as the opening holder and enters only the R55 sourced judgments', () => {
    const map = v2Map('union-1861')!;
    expect(map.start.posts.find((p) => p.id === 'st_gov_texas')?.holder).toBe('houston_samuel');
    for (const id of ['houston_samuel', 'clark_edward']) {
      const person = map.world.people.find((p) => p.id === id)!;
      expect(person).toBeDefined();
      expect(person.values.map((v) => v.value)).toEqual(id === 'houston_samuel' ? ['union'] : []);
      expect(person.regardOthers.map((r) => [r.toward, r.direction])).toEqual(id === 'houston_samuel' ? [['davis_jefferson', 'low']] : []);
      expect(person.traits).toEqual([]);
      expect(person.born).toBeNull();
    }
  });

  it('succeeds Houston on 16 March without leaving him in the desk command menu', () => {
    const { world, setup } = seatsWorld('union-1861');
    let state = phase0.createState(world, setup);
    const status = state.personStatus['houston_samuel' as never];
    const changes = [];
    for (let day = 1; day <= 13; day++) {
      const result = phase0.tick(world, state, [], { freeze: true });
      state = result.state;
      changes.push(...result.mapEvents.filter((e) => e.event === 'post_succeeded'));
      expect(state.postStates['st_gov_texas' as never]!.postHolder).toBe(day < 11 ? 'houston_samuel' : 'clark_edward');
      if (day >= 11) {
        const request = phase0.pendingRequests(world, state).find((r) => r.requestSeat === phase0.seatIdFor('davis_jefferson' as never));
        if (request?.menu.menuKind !== 'principal') throw Error('no Confederate principal menu');
        // Governors are not field posts in this menu. No current command card may still name the former holder.
        expect(request.menu.commandable.some((p) => p.holder === 'houston_samuel')).toBe(false);
      }
    }
    expect(state.personStatus['houston_samuel' as never]).toEqual(status);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ event: 'post_succeeded', reason: 'institutional-succession', from: 'houston_samuel', to: 'clark_edward' });
  });

  it('can deliver the opening Texas subordinates’ reports to their governor', () => {
    const { world, setup } = seatsWorld('union-1861');
    const start = phase0.createState(world, setup);
    expect(() => phase0.tick(world, start, [], { freeze: true })).not.toThrow();
  });

  it('replaces the recognition clock with received Cameron correspondence and the ordinance report', () => {
    const s = raw('situations/western_virginia.json');
    const option = s.options.find((o: { id: string }) => o.id === 'recognise');
    expect(JSON.stringify(option.appearsWhen)).not.toContain('clockAtLeast');
    expect(JSON.stringify(option.appearsWhen)).toContain('wheeling_recognition_letter');
    expect(JSON.stringify(option.appearsWhen)).toContain('wheeling_ordinance');
    expect(option.proposedBy).toEqual(['cameron_simon']);
    expect(option.effects).toContainEqual({ propose: { owner: 'command', field: 'department_side', subject: 'st_virginia_restored', delta: 1, reason: 'recognition-letter', side: 'union' } });
  });

  it.each(['wheeling_ordinance', 'texas_governor_changed', 'houston_confederate_obligations'])('loads %s live and ungated under the R55 verdict', (id) => {
    const item = raw(`situations/${id}.json`);
    expect(SituationSchema.safeParse(item).success).toBe(true);
    expect(item.gate.none).toBeTypeOf('string');
    expect(item.gate.topics).toBeUndefined();
    expect(item.gateReview).toBeUndefined();
    expect(seatsWorld('union-1861').world.situations.some((s) => s.id === id)).toBe(true);
  });
});
