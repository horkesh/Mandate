import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import type { OptionDef, SituationDef } from '../src/situations/types.ts';
import { tick } from '../src/tick/tick.ts';
import { atWarWorld } from './support/war-flag-world.ts';
import { createState, WarFlagError, warFlagProblems } from '../src/tick/setup.ts';
import { warSince } from '../src/seats/requests.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';

/** The rule-seat war flags (0064) are checked at setup, as control and governments are (0061). Each refusal has a control. */
const rows = (world: ReturnType<typeof indexedFixture>) => world.map.world.rules.ruleSeats.warFlags;

describe('war flags at setup', () => {
  it('accepts a row for every faction', () => {
    const world = indexedFixture();
    expect(warFlagProblems(world.map)).toEqual([]);
    expect(() => createState(world, { seed: 1 })).not.toThrow();
  });

  it('refuses a row for a faction the World lacks, a faction listed twice, and a faction with no row, naming each', () => {
    const base = indexedFixture();
    const [a] = rows(base);
    const unknown = atWarWorld(base, [...rows(base), { faction: F('zz'), flag: null }]);
    expect(warFlagProblems(unknown.map)).toEqual(['war flag row for zz, which is not a faction in the World']);
    const twice = atWarWorld(base, [...rows(base), a!]);
    expect(warFlagProblems(twice.map)).toEqual([`faction ${a!.faction} has more than one war flag row`]);
    const missing = atWarWorld(base, rows(base).slice(1));
    expect(warFlagProblems(missing.map)).toEqual([`faction ${a!.faction} has no war flag row`]);
    for (const bad of [unknown, twice, missing]) expect(() => createState(bad, { seed: 1 })).toThrow(WarFlagError);
  });

  it('reports every problem together', () => {
    const base = indexedFixture();
    const both = atWarWorld(base, [{ faction: F('zz'), flag: null }]);
    expect(warFlagProblems(both.map)).toHaveLength(3);
  });

  it('a named flag is peace until a situation sets it, and war from the day it was set; null is war from day 1', () => {
    const base = indexedFixture();
    const named = atWarWorld(base, rows(base).map((r) => ({ ...r, flag: 'war_begun' })));
    const state = createState(named, { seed: 1 });
    expect(warSince(named, state, F('a'))).toBeNull();
    expect(warSince(named, { ...state, situationFlags: { war_begun: 12 } }, F('a'))).toBe(12);
    expect(warSince(base, createState(base, { seed: 1 }), F('a'))).toBe(0);
    // The labelled option sets the pack's flags on day 0, and nothing for a null row.
    expect(warSince(named, createState(named, { seed: 1, atWar: true }), F('b'))).toBe(0);
    expect(createState(base, { seed: 1, atWar: true }).situationFlags).toEqual({});
  });
});

/** The reviewer's N3 (0066): a decision option sets the faction's own flag, and `atWarSince` appears only after the decision. */
describe('the war begins by the faction’s own decision', () => {
  const option = (id: string, displayKey: number, effects: OptionDef['effects'] = []): OptionDef => ({
    id, label: `situation.opening.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects, lockedCosts: [], orders: [], honours: [], watched: false, policy: null, gate: null,
  });
  const opening: SituationDef = {
    id: toId('situation', 'opening'),
    kind: 'decision',
    faction: F('a'),
    title: 'situation.opening.title',
    text: 'situation.opening.text',
    earliest: '1861-04-01',
    event: { dayAtLeast: 6 },
    knowledge: null,
    railroad: 'test fixture',
    chain: null,
    subjects: [],
    options: [option('keep_peace', 1), option('open_war', 2, [{ setFlag: 'war_a' }])],
    inaction: { text: 'situation.opening.inaction', effects: [] },
    historicalDefault: { options: ['open_war'] },
    staffLine: { authors: [POST('a_office')], recommends: ['open_war'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
    delegableTo: [],
    resurfaceOn: [],
    effects: [],
    report: null,
    gate: { none: 'test fixture' },
    gateReview: null,
    citations: [],
  };
  const world = () => {
    const base = indexedFixture({}, [opening]);
    return atWarWorld(base, [{ faction: F('a'), flag: 'war_a' }, { faction: F('b'), flag: 'war_b' }]);
  };
  const since = (w: ReturnType<typeof world>, state: State) => [warSince(w, state, F('a')), warSince(w, state, F('b'))];

  it('a rule-driven principal takes the historical default on the day it surfaces: peace before, war from that day, the other side still at peace', () => {
    const w = world();
    let state = createState(w, { seed: 3 });
    const history: (number | null)[][] = [];
    for (let i = 0; i < 12; i++) {
      state = tick(w, state, [], { freeze: true }).state;
      history.push(since(w, state));
    }
    const firstWar = history.findIndex((h) => h[0] !== null) + 1;
    expect(firstWar).toBeGreaterThanOrEqual(6);
    expect(history.slice(0, firstWar - 1).every((h) => h[0] === null)).toBe(true);
    // The flag's value is the day the decision applied, and the situation had surfaced on his knowledge by then.
    expect(history[firstWar - 1]![0]).toBe(firstWar);
    expect(state.situationStates[opening.id]!.sitSurfacedDay).toBeLessThanOrEqual(firstWar);
    expect(history.every((h) => h[1] === null)).toBe(true);
  });

  it('a human principal who does not decide stays at peace; the day he chooses war is the day it begins', () => {
    const w = world();
    let state = createState(w, { seed: 3, drivers: { a_lead: 'human' } });
    const lead = seatIdFor(P('a_lead'));
    for (let i = 0; i < 8; i++) state = tick(w, state, [], { freeze: true }).state;
    expect(state.situationStates[opening.id]!.sitStatus).toBe('open');
    expect(since(w, state)).toEqual([null, null]);
    const day = state.stateDay + 1;
    state = tick(w, state, [{ day, seat: lead, command: { cmd: 'decide', situation: opening.id, options: ['open_war'] } }], { freeze: true }).state;
    expect(since(w, state)).toEqual([day, null]);
    // Choosing peace instead leaves the flag unset.
    let peaceful = createState(w, { seed: 3, drivers: { a_lead: 'human' } });
    for (let i = 0; i < 8; i++) peaceful = tick(w, peaceful, [], { freeze: true }).state;
    const d2 = peaceful.stateDay + 1;
    peaceful = tick(w, peaceful, [{ day: d2, seat: lead, command: { cmd: 'decide', situation: opening.id, options: ['keep_peace'] } }], { freeze: true }).state;
    expect(since(w, peaceful)).toEqual([null, null]);
  });
});
