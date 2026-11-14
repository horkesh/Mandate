/**
 * A setting-free World for the seats layer's tests (decision 0003):
 *
 *   a_cap(w) --1-- a_mid(w) --2-- a_front --1-- b_front --1-- b_mid --1-- b_cap(w)
 *
 * (w) = on the wire. Side a: the principal sits at a_cap; an office (a_sec,
 * timid and cautious, so he objects to advances he relays); a filter post
 * (a_clerk, who values order and reputation, so he holds wires and cuts
 * losses); a field army at a_front (a_gen, timid, with a biased intelligence
 * chief a_spy) and a second at a_mid (a_bold, bold, no chief). Side b mirrors
 * it more plainly.
 */
import { toId, type PersonId, type PostId, type RegionId } from '../../src/ids.ts';
import { DEFAULT_COMMS_RULES, indexWorld, type CommsPerson, type CommsPost, type CommsWorld, type IndexedWorld } from '../../src/standin/world.ts';

export const R = (id: string): RegionId => toId('region', id);
export const P = (id: string): PersonId => toId('person', id);
export const POST = (id: string): PostId => toId('post', id);

type Over<T> = { -readonly [K in keyof T]?: T[K] };

export function commsFixture(over: { persons?: Record<string, Over<CommsPerson>>; posts?: Record<string, Over<CommsPost>> } = {}): CommsWorld {
  const link = (to: string, days = 1) => ({ to: R(to), days });
  const person = (id: string, faction: string, boldness: number, values: string[], extra: Over<CommsPerson> = {}): CommsPerson => ({
    id: P(id),
    faction: toId('faction', faction),
    boldness,
    regard: 300,
    values,
    intelligenceBias: 1000,
    ...extra,
    ...(over.persons?.[id] ?? {}),
  });
  const post = (id: string, faction: string, kind: CommsPost['kind'], region: string, holder: string | null, superior: string | null, strength: number, chief: string | null = null): CommsPost => ({
    id: POST(id),
    faction: toId('faction', faction),
    kind,
    region: R(region),
    holder: holder === null ? null : P(holder),
    superior: superior === null ? null : POST(superior),
    strength,
    intelligenceChief: chief === null ? null : P(chief),
    ...(over.posts?.[id] ?? {}),
  });
  return {
    regions: [
      { id: R('a_cap'), neighbours: [link('a_mid')], wired: true },
      { id: R('a_mid'), neighbours: [link('a_cap'), link('a_front', 2)], wired: true },
      { id: R('a_front'), neighbours: [link('a_mid', 2), link('b_front')], wired: false },
      { id: R('b_front'), neighbours: [link('a_front'), link('b_mid')], wired: false },
      { id: R('b_mid'), neighbours: [link('b_front'), link('b_cap')], wired: false },
      { id: R('b_cap'), neighbours: [link('b_mid')], wired: true },
    ],
    factions: [
      { id: toId('faction', 'a'), principal: P('a_lead'), seatRegion: R('a_cap'), objective: R('b_cap') },
      { id: toId('faction', 'b'), principal: P('b_lead'), seatRegion: R('b_cap'), objective: R('a_cap') },
    ],
    posts: [
      post('a_office', 'a', 'office', 'a_cap', 'a_sec', null, 0),
      post('a_filter', 'a', 'filter', 'a_cap', 'a_clerk', null, 0),
      post('a_army', 'a', 'field', 'a_front', 'a_gen', 'a_office', 1000, 'a_spy'),
      post('a_reserve', 'a', 'field', 'a_mid', 'a_bold', 'a_office', 600),
      post('b_office', 'b', 'office', 'b_cap', 'b_min', null, 0),
      post('b_army', 'b', 'field', 'b_front', 'b_gen', 'b_office', 800),
    ],
    persons: [
      person('a_lead', 'a', 600, ['duty'], { regard: 1000 }),
      person('a_sec', 'a', 200, ['caution']),
      person('a_clerk', 'a', 400, ['order', 'reputation']),
      person('a_gen', 'a', 200, ['caution']),
      person('a_spy', 'a', 500, ['duty'], { intelligenceBias: 2000 }),
      person('a_bold', 'a', 800, ['glory']),
      person('b_lead', 'b', 600, ['duty'], { regard: 1000 }),
      person('b_min', 'b', 500, ['duty']),
      person('b_gen', 'b', 600, ['duty']),
    ],
    rules: DEFAULT_COMMS_RULES,
  };
}

export function indexedFixture(over: Parameters<typeof commsFixture>[0] = {}): IndexedWorld {
  return indexWorld(commsFixture(over));
}
