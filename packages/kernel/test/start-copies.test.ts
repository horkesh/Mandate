import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { initialRanks, latestDayOf, rankOn } from '../src/people/ranks.ts';
import { initialFortification } from '../src/regions/regions.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import type { PersonRecord } from '../src/world/people.ts';
import { forcesStart } from './support/forces-fixture.ts';
import { mapWorld, R, region, startWith } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';

/**
 * Two parts of a start the exit review found dropped (S4, 0072), now copied into State at setup as 0050 says:
 * fortification by `regions`, ranks by `people`. Nothing writes either in Phase 0.
 */
const MAP = indexWorld(mapWorld({ regions: [region('a1'), region('a2'), region('w', 'river')], edges: [] }));

describe('fortification is State, owned by regions, copied from the start (0050)', () => {
  it('copies every row in region order; a region with no row has none', () => {
    const start = { ...startWith({ a1: { a: 1000 } }), fortification: [{ region: R('a2'), levelPermille: 300 }, { region: R('a1'), levelPermille: 600 }] };
    expect(initialFortification(MAP, start)).toEqual({ a1: 600, a2: 300 });
    expect(Object.keys(initialFortification(MAP, start))).toEqual(['a1', 'a2']);
    const state = createState(worldOf(MAP, { ...forcesStart({ a1: { a: 1000 } }, [], []), fortification: start.fortification }), { seed: 1 });
    expect(state.regionFortification).toEqual({ a1: 600, a2: 300 });
    // The control: a start with none gives none.
    expect(createState(worldOf(MAP, forcesStart({ a1: { a: 1000 } }, [], [])), { seed: 1 }).regionFortification).toEqual({});
  });

  it('refuses a region not in the World, water, a region twice and a level off the permille scale, all at once (positive controls)', () => {
    const bad = {
      ...startWith({}),
      fortification: [
        { region: R('ghost'), levelPermille: 100 },
        { region: R('w'), levelPermille: 100 },
        { region: R('a1'), levelPermille: 100 },
        { region: R('a1'), levelPermille: 1200 },
      ],
    };
    expect(() => initialFortification(MAP, bad)).toThrow(/region a1 is listed twice[\s\S]*region a1: level 1200 is not a permille[\s\S]*region ghost is not in the World[\s\S]*region w is river, which is never fortified/);
  });
});

describe('ranks are State, owned by people: the rank of each kind each holds at the start date (0050, 0073)', () => {
  const person = (id: string, ranks: PersonRecord['ranks']): PersonRecord => ({
    id: toId('person', id),
    name: `person.${id}.name`,
    invented: true,
    faction: null,
    kind: 'officer',
    born: null,
    died: null,
    centres: { competence: { direction: null, cites: [] }, nerve: { direction: null, cites: [] }, experience: { direction: null, cites: [] }, reputation: { direction: null, cites: [] } },
    temperament: { boldness: { direction: null, cites: [] }, candour: { direction: null, cites: [] } },
    values: [],
    regard: { direction: null, cites: [] },
    regardOthers: [], practices: [],
    traits: [],
    bloc: null,
    ranks,
    unknowns: [],
    provenance: [],
  });

  it('a partial date counts from its last possible day, so a rank is never claimed before its source gives it', () => {
    expect([latestDayOf('1861-03-04'), latestDayOf('1861-02'), latestDayOf('1860-02'), latestDayOf('1861')]).toEqual(['1861-03-04', '1861-02-28', '1860-02-29', '1861-12-31']);
    expect(() => latestDayOf('March 1861')).toThrow('is not a historical date');
    expect(() => latestDayOf('1861-13')).toThrow('is not a historical date');
    const ranks = [{ rank: 'captain', from: '1855' }, { rank: 'colonel', from: '1861-03' }, { rank: 'general', from: '1861-03-05' }];
    // On 4 March the colonelcy "from March 1861" may not have begun: he is still a captain.
    expect(rankOn(ranks, '1861-03-04')).toEqual({ rankTerm: 'captain', rankSince: '1855' });
    // A full date counts on its own day.
    expect(rankOn(ranks, '1861-03-05')).toEqual({ rankTerm: 'general', rankSince: '1861-03-05' });
    // The control: by the month's last day the colonelcy is certain too, and the later general's rank still stands.
    expect(rankOn(ranks.slice(0, 2), '1861-03-31')).toEqual({ rankTerm: 'colonel', rankSince: '1861-03' });
    expect(rankOn(ranks, '1854-06-01')).toBeNull();
  });

  const RANKS = {
    ranks: [
      { id: 'captain', name: 'rank.captain', seniority: 1, kind: 'regular' },
      { id: 'major', name: 'rank.major', seniority: 2, kind: 'regular' },
      { id: 'vol_colonel', name: 'rank.vol_colonel', seniority: 3, kind: 'volunteer' },
      { id: 'bvt_general', name: 'rank.bvt_general', seniority: 4, kind: 'brevet' },
    ],
    rankKinds: [{ id: 'regular', name: 'rank_kind.regular' }, { id: 'volunteer', name: 'rank_kind.volunteer' }, { id: 'brevet', name: 'rank_kind.brevet' }],
  };
  const withRanks = (people: readonly PersonRecord[]) => indexWorld({ ...MAP.world, vocabularies: { ...MAP.world.vocabularies, ...RANKS }, people });

  it('copies each person\'s rank of each kind in id order; a person with none by then is absent', () => {
    const world = withRanks([person('zed', [{ rank: 'major', from: '1850-01-01' }]), person('abe', []), person('cal', [{ rank: 'captain', from: '1899' }, { rank: 'major', from: '1900-04-01' }])]);
    const ranks = initialRanks(world, '1900-03-01');
    expect(ranks).toEqual({ cal: { regular: { rankTerm: 'captain', rankSince: '1899' } }, zed: { regular: { rankTerm: 'major', rankSince: '1850-01-01' } } });
    expect(Object.keys(ranks)).toEqual(['cal', 'zed']);
    expect(createState(worldOf(world, forcesStart({ a1: { a: 1000 } }, [], [], { startDate: '1900-03-01' })), { seed: 1 }).personRanks).toEqual(ranks);
    // At a later start his majority has begun.
    expect(createState(worldOf(world, forcesStart({ a1: { a: 1000 } }, [], [], { startDate: '1900-06-01' })), { seed: 1 }).personRanks[toId('person', 'cal')]).toEqual({ regular: { rankTerm: 'major', rankSince: '1900-04-01' } });
  });

  it('holds a regular, a volunteer and a brevet rank at once, each with its own date (0073)', () => {
    const world = withRanks([person('ida', [{ rank: 'captain', from: '1890' }, { rank: 'vol_colonel', from: '1899-05' }, { rank: 'bvt_general', from: '1899-11-02' }, { rank: 'major', from: '1900-02-01' }])]);
    expect(initialRanks(world, '1900-03-01')).toEqual({
      ida: { brevet: { rankTerm: 'bvt_general', rankSince: '1899-11-02' }, regular: { rankTerm: 'major', rankSince: '1900-02-01' }, volunteer: { rankTerm: 'vol_colonel', rankSince: '1899-05' } },
    });
    // A rank the vocabulary lacks has no kind: the kernel refuses it rather than guessing.
    expect(() => initialRanks(withRanks([person('ghost', [{ rank: 'admiral', from: '1890' }])]), '1900-03-01')).toThrow('rank "admiral" is not in the pack\'s rank vocabulary');
  });
});
