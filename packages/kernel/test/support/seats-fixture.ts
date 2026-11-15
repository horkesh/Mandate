/**
 * A setting-free World for the seats layer's tests (decision 0003), in world
 * format v2 (lane 0.5 replaced the stand-in comms World):
 *
 *   a_cap(w) --3-- a_mid(w) --6-- a_front --3-- b_front --3-- b_mid --3-- b_cap(w)
 *
 * Edge lengths are a division's days; a courier takes a third, rounded up, so
 * every link is one courier day except a_mid - a_front (two). (w) = on the
 * wire: the wire is the holder's (0052), so a_cap, a_mid and b_cap are held and
 * the ground between is held by nobody (control below the supply threshold).
 *
 * Side a: the principal sits at a_cap; an office (a_sec, timid and cautious, so
 * he objects to advances he relays); a filter post (a_clerk, who values order
 * and reputation, so he holds wires and cuts losses); a field army at a_front
 * (a_gen, timid, with a biased intelligence chief a_spy) and a second at a_mid
 * (a_bold, bold, no chief). Side b mirrors it more plainly. v2 people carry no
 * trait inputs (0058), so the fixture hands them explicitly.
 */
import { toId, type FactionId, type PersonId, type PostId, type RegionId } from '../../src/ids.ts';
import { indexSeatsWorld, type SeatsWorld, type TraitInputs } from '../../src/seats/world.ts';
import type { SituationDef } from '../../src/situations/types.ts';
import { indexWorld, type WorldIndex } from '../../src/world/index.ts';
import type { ScenarioStart } from '../../src/world/scenario.ts';
import { block, forcesWorld, person, post } from './forces-fixture.ts';
import { depot, edge, region, startWith } from './map-fixture.ts';

export const R = (id: string): RegionId => toId('region', id);
export const P = (id: string): PersonId => toId('person', id);
export const POST = (id: string): PostId => toId('post', id);
export const F = (id: string): FactionId => toId('faction', id);

export const FIXTURE_TRAITS: Readonly<Record<string, TraitInputs>> = {
  a_lead: { boldness: 600, regard: 1000, values: ['duty'] },
  a_sec: { boldness: 200, regard: 300, values: ['caution'] },
  a_clerk: { boldness: 400, regard: 300, values: ['order', 'reputation'] },
  a_gen: { boldness: 200, regard: 300, values: ['caution'] },
  a_spy: { boldness: 500, regard: 300, values: ['duty'], intelligenceBias: 2000 },
  a_bold: { boldness: 800, regard: 300, values: ['glory'] },
  b_lead: { boldness: 600, regard: 1000, values: ['duty'] },
  b_min: { boldness: 500, regard: 300, values: ['duty'] },
  b_gen: { boldness: 600, regard: 300, values: ['duty'] },
};

/** Overrides: people's trait inputs, and a field post's strength (its one block's men). */
export interface FixtureOver {
  readonly persons?: Readonly<Record<string, TraitInputs>>;
  readonly posts?: Readonly<Record<string, { readonly strength?: number }>>;
}

const STRENGTHS: Readonly<Record<string, number>> = { a_army: 1000, a_reserve: 600, b_army: 800 };

/** The fixture's v2 map. */
export function fixtureMap(): WorldIndex {
  const world = forcesWorld({
    regions: ['a_cap', 'a_mid', 'a_front', 'b_front', 'b_mid', 'b_cap'].map((r) => region(r)),
    edges: [edge('a_cap', 'a_mid', { days: 3 }), edge('a_mid', 'a_front', { days: 6 }), edge('a_front', 'b_front', { days: 3 }), edge('b_front', 'b_mid', { days: 3 }), edge('b_mid', 'b_cap', { days: 3 })],
    depots: [depot('a_src', 'a_cap'), depot('b_src', 'b_cap')],
    people: ['a_lead', 'a_sec', 'a_clerk', 'a_gen', 'a_spy', 'a_bold', 'b_lead', 'b_min', 'b_gen'].map((p) => person(p, p.slice(0, 1))),
  });
  return indexWorld({
    ...world,
    vocabularies: {
      ...world.vocabularies,
      postKinds: [...world.vocabularies.postKinds, { id: 'filter', name: 'kind.filter', creatable: 'start_only', temporary: false, role: 'filter' }],
    },
  });
}

/** The fixture's scenario start. */
export function fixtureStart(over: FixtureOver = {}): ScenarioStart {
  const strength = (p: string) => over.posts?.[p]?.strength ?? STRENGTHS[p]!;
  const base = startWith({ a_cap: { a: 1000 }, a_mid: { a: 1000 }, a_front: { a: 100 }, b_front: { b: 100 }, b_mid: { b: 100 }, b_cap: { b: 1000 } }, '1900-06-01');
  return {
    ...base,
    factions: [
      { faction: F('a'), principal: P('a_lead'), capital: R('a_cap'), playable: true },
      { faction: F('b'), principal: P('b_lead'), capital: R('b_cap'), playable: true },
    ],
    posts: [
      post('a_office', { kind: 'office', department: 'a_war', holder: P('a_sec'), region: R('a_cap') }),
      post('a_filter', { kind: 'filter', department: 'a_war', holder: P('a_clerk'), region: R('a_cap') }),
      post('a_army', { department: 'a_war', parent: POST('a_office'), holder: P('a_gen'), region: R('a_front'), intelligenceChief: P('a_spy') }),
      post('a_reserve', { department: 'a_war', parent: POST('a_office'), holder: P('a_bold'), region: R('a_mid') }),
      post('b_office', { kind: 'office', department: 'b_war', holder: P('b_min'), region: R('b_cap') }),
      post('b_army', { department: 'b_war', parent: POST('b_office'), holder: P('b_gen'), region: R('b_front') }),
    ],
    forceBlocks: [
      block('a_army_1', { department: 'a_war', post: POST('a_army'), region: 'a_front', strength: strength('a_army'), storesDays: null }),
      block('a_reserve_1', { department: 'a_war', post: POST('a_reserve'), region: 'a_mid', strength: strength('a_reserve'), storesDays: null }),
      block('b_army_1', { department: 'b_war', post: POST('b_army'), region: 'b_front', strength: strength('b_army'), storesDays: null }),
    ],
  };
}

/** The fixture as the seats layer's World, with overrides and situations. */
export function indexedFixture(over: FixtureOver = {}, situations: readonly SituationDef[] = []): SeatsWorld {
  const traits: Record<string, TraitInputs> = {};
  for (const id of Object.keys(FIXTURE_TRAITS)) traits[id] = { ...FIXTURE_TRAITS[id], ...(over.persons?.[id] ?? {}) };
  return indexSeatsWorld(fixtureMap(), fixtureStart(over), { traits, situations });
}
