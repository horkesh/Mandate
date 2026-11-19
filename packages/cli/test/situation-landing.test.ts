import { ids, phase0, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { v2Map } from '../src/seats-world.ts';

/**
 * A situation's option proposes a landing (lane 1.11) through `forces`' detachment path (lane 1.4b), applied in phase 4c
 * beside `command`'s proposals. On the testbed: no block there starts aboard ship, so the control is the refusal, which
 * changes nothing and names its reason. The Union run's landing (Pickens) is in `union-opening.test.ts`.
 */
const P = (id: string) => ids.toId('person', id);
const POST = (id: string) => ids.toId('post', id);

function landingSituation(parent: string, region: string): phase0.SituationDef {
  return {
    id: ids.toId('situation', 'shore_party'),
    kind: 'decision',
    faction: ids.toId('faction', 'north'),
    title: 'situation.shore_party.title',
    text: 'situation.shore_party.text',
    earliest: '1861-03-01',
    event: { dayAtLeast: 1 },
    knowledge: null,
    railroad: 'a test landing on day 1',
    chain: null,
    subjects: [],
    options: [
      {
        id: 'land',
        label: 'situation.shore_party.option.land',
        displayKey: 1,
        proposedBy: [P('n_secretary')],
        group: null,
        appearsWhen: null,
        expiresWhen: null,
        waitsOn: null,
        effects: [{ landing: { parent: ids.toId('forceBlock', parent), men: 100, region: ids.toId('region', region) } }],
        lockedCosts: [],
        orders: [],
        calls: [],
        honours: [],
        watched: false,
        policy: null,
        gate: null,
      },
    ],
    inaction: { text: 'situation.shore_party.inaction', effects: [], policy: null },
    historicalDefault: { options: ['land'] },
    staffLine: { authors: [POST('n_war_office')], recommends: ['land'], reasons: [], confidence: 600 },
    delegableTo: [],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'a test landing' },
    gateReview: null,
    citations: [],
  };
}

describe('a situation proposes a landing (lane 1.11, on lane 1.4b’s path)', () => {
  it('refuses a landing from a block that is not aboard, changing nothing and naming its reason', () => {
    const map = v2Map('testbed')!;
    const block = map.start.forceBlocks.find((b) => b.aboard === null)!;
    const world = phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations: [landingSituation(block.id, block.region)] });
    let state = phase0.createState(world, { seed: map.start.seed, people: 'as-history' });
    const before = Object.keys(state.forceBlockStates).length;
    const events: unknown[] = [];
    for (let d = 1; d <= 3; d++) {
      const r = phase0.tick(world, state, [], { freeze: true });
      events.push(...r.mapEvents);
      state = r.state;
    }
    expect(events).toContainEqual(expect.objectContaining({ event: 'proposal_refused', owner: 'forces', reason: 'not_aboard' }));
    expect(Object.keys(state.forceBlockStates).length).toBe(before);
  });
});
