import { ids, phase0, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld, v2Map } from '../src/seats-world.ts';

describe('the view carries a typed staff absence without its research provenance', () => {
  it('projects the declared absence once its plain report reaches the principal', () => {
    const map = v2Map('testbed')!;
    const all = seatsWorld('testbed').world.situations;
    const original = all.find((s) => s.kind === 'decision')!;
    const def: phase0.SituationDef = {
      ...original,
      event: { dayAtLeast: 1 }, knowledge: null, railroad: 'a test notice', earliest: map.start.startDate,
      chain: null, subjects: [], speakers: [],
      staffLine: null,
      staffAbsence: { none: 'no-adviser-on-record', cites: [{ source: 'TB-DESIGN', at: 'the test research' }] },
      report: { authors: [ids.toId('post', 'n_war_office')], reportType: 'informal', subtype: 'cabinet-word' },
    };
    const world = phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations: all.map((s) => s.id === def.id ? def : s) });
    let state = phase0.createState(world, { seed: map.start.seed });
    for (let day = 0; day < 4; day++) state = phase0.tick(world, state, [], { freeze: true }).state;
    const seat = Object.values(state.seatAssignments).find((s) => s.seatPerson === world.faction(def.faction).principal)!;
    const shown = phase0.viewFor(world, state, seat.id).situations.find((s) => s.id === def.id);
    expect(shown).toBeDefined();
    expect(shown).toHaveProperty('staffAbsence', 'no-adviser-on-record');
    expect(shown?.staffAuthor).toBeNull();
    expect(JSON.stringify(shown)).not.toContain('the test research');
  });
});
