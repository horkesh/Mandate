import { describe, expect, it } from 'vitest';
import { canonicalHash } from '../src/serialize/hash.ts';
import { blocOfPerson, resignationChoice } from '../src/people/resignation.ts';
import { changeDepartmentSide, heldPost, relieveHolder, sideOfPerson } from '../src/command/command.ts';
import { toId } from '../src/ids.ts';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { pendingRequests } from '../src/seats/requests.ts';
import { indexWorld } from '../src/world/index.ts';
import type { State } from '../src/root-state.ts';
import { F, P, POST, indexedFixture } from './support/seats-fixture.ts';

const home = toId('department', 'neutral_gov');
function fixture(history = false, on = '1900-06-10') {
  const base = indexedFixture({ persons: { a_gen: { values: ['glory'], regard: 'high' }, a_bold: { values: ['duty'] } } });
  const map = indexWorld({ ...base.map.world,
    vocabularies: { ...base.map.world.vocabularies,
      rankKinds: [{ id: 'regular', name: 'rank_kind.regular' }],
      ranks: [{ id: 'service_captain', name: 'rank.service_captain', seniority: 1, kind: 'regular' }],
    },
    rules: { ...base.map.world.rules, people: { ...base.map.world.rules.people,
      resignation: { historicalDefaults: history, base: 0, resignAt: 500,
        values: [{ value: 'glory', weight: 600 }, { value: 'duty', weight: -600 }], traits: [] },
    } },
    people: base.map.world.people.map(p => ['a_gen', 'a_bold'].includes(p.id) ? { ...p,
      ranks: [{ rank: 'service_captain', from: '1890-01-01' }],
      service: { government: home, toFaction: F('b'), toBloc: null, historicalOn: history ? on : null, cites: [{ source: 'FIXTURE', at: 'p1' }] },
    } : p),
  });
  return indexSeatsWorld(map, base.start);
}
function through(world: ReturnType<typeof fixture>, state: State, day: number) {
  const results = [];
  while (state.stateDay < day) { const r = tick(world, state, [], { freeze: true }); results.push(r); state = r.state; }
  return { state, results };
}

describe('an officer chooses his service', () => {
  it('waits for his government, then one man resigns and another stays on the weekly step', () => {
    const world = fixture();
    const initial = createState(world, { seed: 1 });
    const before = through(world, initial, 7).state;
    expect(sideOfPerson(world.map, before, P('a_gen'))).toBe(F('a'));
    const joined = changeDepartmentSide(world.map, before, home, F('b')).state;
    const notYet = through(world, joined, 13).state;
    expect(heldPost(notYet, P('a_gen'))).toBe(POST('a_army'));
    const done = through(world, notYet, 14);
    expect(sideOfPerson(world.map, done.state, P('a_gen'))).toBe(F('b'));
    expect(heldPost(done.state, P('a_gen'))).toBeNull();
    expect(heldPost(done.state, P('a_bold'))).toBe(POST('a_reserve'));
    expect(done.state.personService?.[P('a_bold')]?.serviceChoice).toBe('stay');
    expect(done.results.flatMap(r => r.events).filter(e => e.event === 'service_choice')).toHaveLength(2);
    const again = through(world, done.state, 28);
    expect(again.results.flatMap(r => r.events).filter(e => e.event === 'service_choice')).toHaveLength(0);
  });

  it('keeps rank, appears among the other principal’s candidates, and accepts his appointment', () => {
    const world = fixture();
    let state = changeDepartmentSide(world.map, createState(world, { seed: 2 }), home, F('b')).state;
    const ranks = state.personRanks[P('a_gen')];
    state = through(world, state, 7).state;
    expect(sideOfPerson(world.map, state, P('a_gen'))).toBe(F('b'));
    expect(state.personRanks[P('a_gen')]).toEqual(ranks);
    const request = pendingRequests(world, state).find(r => r.requestSeat === seatIdFor(P('b_lead')));
    expect(request?.menu.menuKind).toBe('principal');
    if (request?.menu.menuKind !== 'principal') throw new Error('principal request missing');
    expect(request.menu.candidates.some(c => c.person === P('a_gen'))).toBe(true);
    expect(ranks?.regular?.rankTerm).toBe('service_captain');
    state = relieveHolder(state, POST('b_army'));
    const first = tick(world, state, [{ day: 8, seat: seatIdFor(P('b_lead')), command: {
      cmd: 'appoint', person: P('a_gen'), post: POST('b_army'), rank: null, route: 'courier',
    } }], { freeze: true });
    expect(first.rejections).toEqual([]);
    state = through(world, first.state, 15).state;
    expect(heldPost(state, P('a_gen'))).toBe(POST('b_army'));
  });

  it('uses the sourced date only in the history policy, even between weekly steps', () => {
    const world = fixture(true);
    const initial = changeDepartmentSide(world.map, createState(world, { seed: 3 }), home, F('b')).state;
    const before = through(world, initial, 8).state;
    expect(heldPost(before, P('a_gen'))).toBe(POST('a_army'));
    expect(before.personService?.[P('a_gen')]).toBeUndefined();
    const done = through(world, before, 9);
    expect(sideOfPerson(world.map, done.state, P('a_gen'))).toBe(F('b'));
    expect(done.state.personService?.[P('a_gen')]).toMatchObject({ serviceChoice: 'resign', serviceDay: 9 });
    expect(done.results.flatMap(r => r.events).some(e => e.event === 'service_choice' && e.terms.some(t => t.termRule === 'historical_date'))).toBe(true);
    const after = through(world, done.state, 10);
    expect(after.state.personService?.[P('a_gen')]).toEqual(done.state.personService?.[P('a_gen')]);
    expect(sideOfPerson(world.map, after.state, P('a_gen'))).toBe(F('b'));
    expect(heldPost(after.state, P('a_gen'))).toBeNull();
    expect(after.results.flatMap(r => r.events).filter(e => e.event === 'service_choice')).toHaveLength(0);
    expect(canonicalHash(through(world, initial, 16).state)).toBe(canonicalHash(through(world, initial, 16).state));
  });

  it.each([
    [-1, 'stay'], [0, 'resign'], [1, 'resign'],
  ] as const)('chooses %s from resignAt: %s', (offset, expected) => {
    const base = fixture();
    const rules = base.map.world.rules;
    const map = indexWorld({ ...base.map.world, rules: { ...rules, people: { ...rules.people,
      resignation: { ...rules.people.resignation, base: 500 + offset, resignAt: 500, values: [], traits: [] },
    } } });
    const answer = resignationChoice(map, createState(base, { seed: 6 }), P('a_gen'));
    expect(answer.choice).toBe(expected);
    expect(answer.terms.map(t => [t.termRule, t.termValue])).toEqual([['base', 500 + offset], ['threshold', -500]]);
  });

  it('moves the resigned man’s political pull to his new service bloc', () => {
    const base = fixture();
    const oldBloc = { id: 'a_old', faction: F('a'), voice: 1000, rest: 0, values: [], victory: 0, defeat: 0, cite: 'FIXTURE' };
    const newBloc = { ...oldBloc, id: 'b_new', faction: F('b') };
    const map = indexWorld({ ...base.map.world,
      vocabularies: { ...base.map.world.vocabularies, blocs: [oldBloc, newBloc].map(b => ({ id: b.id, name: `bloc.${b.id}` })) },
      rules: { ...base.map.world.rules, politics: { ...base.map.world.rules.politics, blocs: [oldBloc, newBloc] } },
      people: base.map.world.people.map(p => p.id === P('a_gen') ? { ...p, bloc: oldBloc.id, service: { ...p.service!, toBloc: newBloc.id } } : p),
    });
    const world = indexSeatsWorld(map, base.start);
    const initial = changeDepartmentSide(map, createState(world, { seed: 7 }), home, F('b')).state;
    expect(blocOfPerson(map, initial, P('a_gen'))).toBe(oldBloc.id);
    const resigned = through(world, initial, 13).state;
    expect(sideOfPerson(map, resigned, P('a_gen'))).toBe(F('b'));
    expect(blocOfPerson(map, resigned, P('a_gen'))).toBe(newBloc.id);
    expect(map.world.people.find(p => p.id === P('a_gen'))?.bloc).toBe(oldBloc.id);
    // One rung down from leaking is lobbying. Compare otherwise identical States so the
    // actual politics phase must charge the current bloc, rather than the immutable start.
    const lobbying: State = { ...resigned, personRungs: { ...resigned.personRungs, [P('a_gen')]: 'leaking' } };
    const control = tick(world, resigned, [], { freeze: true }).state;
    const pulled = tick(world, lobbying, [], { freeze: true }).state;
    expect(pulled.personRungs[P('a_gen')]).toBe('lobbying');
    expect(pulled.blocSupport[oldBloc.id]).toBe(control.blocSupport[oldBloc.id]);
    expect(pulled.blocSupport[newBloc.id]).toBe(control.blocSupport[newBloc.id]! + map.world.rules.politics.ladder.lobbyingPerRung);
    expect(map.world.rules.politics.ladder.lobbyingPerRung).not.toBe(0);
  });

  it('does not apply a historical default until the named government has joined', () => {
    const world = fixture(true);
    const before = through(world, createState(world, { seed: 3 }), 12).state;
    expect(sideOfPerson(world.map, before, P('a_gen'))).toBe(F('a'));
    const joined = changeDepartmentSide(world.map, before, home, F('b')).state;
    expect(sideOfPerson(world.map, through(world, joined, 13).state, P('a_gen'))).toBe(F('b'));
  });

  it('never changes a killed or captured officer’s service', () => {
    const world = fixture(true);
    const initial = createState(world, { seed: 4 });
    const unavailable: State = { ...initial, personStatus: { ...initial.personStatus, [P('a_gen')]: { statusKind: 'captured', statusDay: 0 } } };
    expect(sideOfPerson(world.map, through(world, unavailable, 16).state, P('a_gen'))).toBe(F('a'));
  });

  it('returns each value and trait term, and resumes a service choice from serialized State', () => {
    const world = fixture();
    const initial = changeDepartmentSide(world.map, createState(world, { seed: 5 }), home, F('b')).state;
    const answer = resignationChoice(world.map, initial, P('a_gen'));
    expect(answer.terms.find(t => t.termRule === 'value:glory')?.termValue).toBe(600);
    const changedMap = indexWorld({ ...world.map.world, rules: { ...world.map.world.rules, people: {
      ...world.map.world.rules.people, resignation: { ...world.map.world.rules.people.resignation, traits: [{ trait: 'reserved', weight: -600 }] },
    } } });
    const changed: State = { ...initial, personTraits: { ...initial.personTraits, [P('a_gen')]: ['reserved'] } };
    const other = resignationChoice(changedMap, changed, P('a_gen'));
    expect(other.choice).toBe('stay');
    expect(other.terms.find(t => t.termRule === 'trait:reserved')?.termValue).toBe(-600);
    const chosen = through(world, initial, 7).state;
    const resumed = JSON.parse(JSON.stringify(chosen)) as State;
    expect(canonicalHash(through(world, resumed, 21).state)).toBe(canonicalHash(through(world, initial, 21).state));
  });
});
