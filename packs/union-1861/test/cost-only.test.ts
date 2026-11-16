import { phase0, world as w, type ids } from '@mandate/kernel';

type PersonId = ids.PersonId;
type PostId = ids.PostId;
import { describe, expect, it } from 'vitest';
import { v2Map } from '../../../packages/cli/src/seats-world.ts';

/**
 * 0074's cost-only values, on the Union pack itself (lane 1.5b; the gate review's G-1.5d). The pack's vocabulary flags
 * both 0074 values `costOnly`, and for every value it flags, an order that honours it, carried through its arrival and
 * the weekly people step, leaves its holder no more willing, gives him no reason to be, raises neither his regard nor his
 * standing, and removes or fades no grievance faster than the same order honouring nothing (rule 7). The control: the
 * same value not flagged does make him more willing, so the test can see a difference when there is one.
 */
const map = v2Map('union-1861')!;
const flagged = map.world.vocabularies.values.filter((v) => v.costOnly).map((v) => v.id);

/** The Union World with `holder` holding `value`, inquiry honouring `honours`, and `value` flagged as `costOnly` says. */
function worldWith(holder: PersonId, value: string, honours: string[], costOnly: boolean): phase0.SeatsWorld {
  const world = map.world;
  const people = world.people.map((p) => (p.id === holder ? { ...p, values: [{ value, cites: [] }] } : p));
  const values = world.vocabularies.values.map((v) => (v.id === value ? { ...v, costOnly } : v));
  const verbs = world.rules.people.verbs;
  const orderValues = verbs.orderValues.map((r) => (r.order === 'verb:inquire' ? { ...r, honours } : r));
  const next = { ...world, people, vocabularies: { ...world.vocabularies, values }, rules: { ...world.rules, people: { ...world.rules.people, verbs: { ...verbs, orderValues } } } };
  return phase0.indexSeatsWorld(w.indexWorld(next), map.start, { situations: [] });
}

/** A holder of a post on the first side who is not its principal, with the principal and his post. */
function subject(): { readonly holder: PersonId; readonly post: PostId; readonly principal: PersonId; readonly faction: string } {
  const world = worldWith('nobody' as PersonId, flagged[0]!, [], true);
  const state = phase0.createState(world, { seed: map.start.seed });
  const faction = world.factionIds[0]!;
  const principal = world.faction(faction).principal;
  for (const post of (Object.keys(state.postStates) as PostId[]).sort()) {
    const holder = state.postStates[post]!.postHolder;
    if (holder !== null && holder !== principal && phase0.sideOfPerson(world.map, state, holder) === faction) return { holder, post, principal, faction };
  }
  throw new Error('no held post on the first side');
}

/** Two weeks from the start: an inquiry to the holder on day 1, after he already holds a grievance against his principal. */
function run(world: phase0.SeatsWorld, s: ReturnType<typeof subject>) {
  let state = phase0.createState(world, { seed: map.start.seed });
  state = phase0.applyPeopleChanges(state, [{ change: 'grievance', person: s.holder, kind: 'overruled', weight: 400, against: s.principal, cause: null }], 0, world.map.world.rules.people, world.map.world.vocabularies.ranks);
  const seat = phase0.seatIdFor(s.principal);
  for (let day = 1; day <= 14; day++) {
    const entries = day === 1 ? [{ day, seat, command: { cmd: 'inquire' as const, to: s.post, subject: null, route: 'courier' as const } }] : [];
    const r = phase0.tick(world, state, entries);
    expect(r.rejections, `day ${day}`).toEqual([]);
    state = r.state;
  }
  const response = Object.values(state.orderResponses).find((x) => x.respPerson === s.holder);
  return { state, response };
}

describe('0074’s cost-only values on the Union pack (G-1.5d)', () => {
  it('flags both 0074 values cost-only', () => {
    expect(flagged).toEqual(expect.arrayContaining(['slavery_defence', 'slavery_noninterference']));
  });

  const s = subject();
  for (const value of flagged) {
    it(`${value}: honouring it raises no willingness, regard or standing, and relieves no grievance faster`, () => {
      const honoured = run(worldWith(s.holder, value, [value], true), s);
      const plain = run(worldWith(s.holder, value, [], true), s);
      expect(honoured.response, 'the inquiry arrived and was answered').toBeDefined();
      expect(honoured.response!.respWillingness).toBe(plain.response!.respWillingness);
      expect(honoured.response!.respReasons.some((r) => r.kind === 'values_honoured')).toBe(false);
      expect(honoured.state.personRegard[s.holder]).toEqual(plain.state.personRegard[s.holder]);
      expect(honoured.state.personStanding[s.holder]).toBe(plain.state.personStanding[s.holder]);
      expect(honoured.state.personGrievances[s.holder]).toEqual(plain.state.personGrievances[s.holder]);
      // The control: the same value, not flagged, does raise his willingness.
      const ordinary = run(worldWith(s.holder, value, [value], false), s);
      expect(ordinary.response!.respWillingness).toBeGreaterThan(plain.response!.respWillingness);
    });
  }
});
