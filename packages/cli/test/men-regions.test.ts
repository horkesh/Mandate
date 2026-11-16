import { createTelemetry, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * Men and regions on the testbed (lane 1.7; FOUNDATION section 12 row 1.7), through the kernel's own tick:
 * - a call is an order through people, answered by each governor's compliance on the pack's call terms;
 * - one recruitment proposal makes each block, applied in one phase: `forces` creates it, `movement` places it at the
 *   governor's region, `command` assigns it to his post; its enlistment runs out and it disbands;
 * - region loyalty is State, read where the levy is raised;
 * - the derived self-emancipation term (the testbed's fen flight) proposes who reached the northern lines.
 */
const P = (id: string) => ids.toId('person', id);
const POST = (id: string) => ids.toId('post', id);
const R = (id: string) => ids.toId('region', id);
const NORTH_GOVERNOR = POST('n_brenmark_governor');
const SOUTH_GOVERNOR = POST('s_lowmarch_governor');

function start() {
  const { world, seed } = seatsWorld('testbed');
  return { world, state: phase0.createState(world, { seed, people: 'as-history' }) };
}

const call = (to: ids.PostId, regiments: number, termDays: number): phase0.CallCommand => ({ cmd: 'call', to, regiments, termDays, route: 'courier', bypass: false });

/** Play `days` days; `script(day)` gives each principal's commands, as [principal, command] pairs. */
function play(world: phase0.SeatsWorld, state: phase0.State, days: number, script: (day: number) => readonly [string, phase0.Command][] = () => []) {
  const telemetry = createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]);
  const results: phase0.TickResult[] = [];
  let s = state;
  for (let d = s.stateDay + 1; results.length < days; d++) {
    const entries = script(d).map(([person, command]) => ({ day: d, seat: phase0.seatIdFor(P(person)), command }));
    const r = phase0.tick(world, s, entries, { freeze: true, telemetry });
    expect(r.rejections, `day ${d}`).toEqual([]);
    results.push(r);
    s = r.state;
  }
  return { state: s, results, fires: (m: string) => telemetry.mechanics[m]!.fires };
}

const responseTo = (state: phase0.State, person: string) => Object.values(state.orderResponses).find((r) => r.respPerson === P(person) && r.respRole === 'addressee');

describe('a call for regiments, answered by each governor through his own compliance (lane 1.7)', () => {
  it('the northern governor answers the call: his response is recorded, his levy is in hand, and his answer reaches the caller', () => {
    const { world, state } = start();
    const { state: s, results, fires } = play(world, state, 4, (d) => (d === 1 ? [['n_leader', call(NORTH_GOVERNOR, 10, 90)]] : []));
    const response = responseTo(s, 'n_governor')!;
    expect(response).toBeDefined();
    // Typed reasons (hard rule 6): he read the call on the pack's terms, which honour his duty.
    expect(response.respReasons.map((r) => r.kind)).toContain('values_honoured');
    const levy = Object.values(s.postLevies)[0]!;
    expect(levy).toMatchObject({ levyPost: NORTH_GOVERNOR, levyGovernor: P('n_governor'), levyIssuer: P('n_leader'), levyTermDays: 90, levyResponse: phase0.responseKey(levy.levyCall, P('n_governor')) });
    expect(levy.levyRegiments).toBeGreaterThan(0);
    expect(levy.levyMen).toBe(levy.levyRegiments * world.map.world.rules.recruitment.menPerRegiment);
    expect(fires('recruitment.called')).toBe(1);
    expect(fires('recruitment.answered')).toBe(1);
    // His answer goes back to the First Minister: the regiments he says he will raise, and the rung he declares.
    const answer = results.flatMap((r) => phase0.knowledgeOf(r.state, phase0.seatIdFor(P('n_leader'))).knownReports).find((k) => k.knownBody.reportClaims[0]?.claimKind === 'call-answer');
    expect(answer?.knownBody.reportClaims[0]).toMatchObject({ claimKind: 'call-answer', claimToken: response.respDeclared });
  });

  it('a governor who values home rule slow-walks the call: the muster comes days later, and his rung says why', () => {
    const { world, state } = start();
    const { state: s, fires } = play(world, state, 6, (d) => (d === 1 ? [['s_leader', call(SOUTH_GOVERNOR, 10, 365)]] : []));
    const response = responseTo(s, 's_governor')!;
    expect(response.respReasons).toContainEqual({ kind: 'values_offended', value: 'home_rule' });
    const levy = Object.values(s.postLevies)[0]!;
    const row = world.map.world.rules.recruitment.rungs.find((r) => r.rung === response.respActual)!;
    expect(row.delayDays).toBeGreaterThan(0);
    expect(fires('recruitment.slow_walked')).toBe(1);
    expect(levy.levyMusterDay - response.respDay).toBe(world.map.world.rules.recruitment.musterDays + row.delayDays);
  });

  it('refuses a call to a post that raises no regiments, and one longer than the pack allows', () => {
    const { world, state } = start();
    const r = phase0.tick(world, state, [
      { day: 1, seat: phase0.seatIdFor(P('n_leader')), command: call(POST('n_army_west'), 2, 90) },
      { day: 1, seat: phase0.seatIdFor(P('n_leader')), command: call(NORTH_GOVERNOR, 2, world.map.world.rules.recruitment.maxTermDays + 1) },
      { day: 1, seat: phase0.seatIdFor(P('n_leader')), command: call(SOUTH_GOVERNOR, 2, 90) },
    ]);
    expect(r.rejections.map((x) => x.reason)).toEqual(['not_raising_post', 'bad_call', 'other_side']);
  });
});

describe('one recruitment proposal makes each block, applied in one phase; enlistments run out (lane 1.7)', () => {
  it('musters the levy into a new block, placed at the governor’s region and assigned to his post, then disbands it when its ninety days end', () => {
    const { world, state } = start();
    const first = play(world, state, 3, (d) => (d === 1 ? [['n_leader', call(NORTH_GOVERNOR, 10, 90)]] : []));
    const levy = Object.values(first.state.postLevies)[0]!;
    const toMuster = play(world, first.state, levy.levyMusterDay - first.state.stateDay);
    const s = toMuster.state;
    const block = ids.toId('forceBlock', `raised.${NORTH_GOVERNOR}.d${levy.levyMusterDay}`);
    // Each owner wrote its own field: forces the block and its enlistment, movement its place, command its post.
    expect(s.forceBlockStates[block]).toMatchObject({ fbKind: 'block', fbDepartment: 'n_province', fbArm: world.map.world.rules.recruitment.arm, fbStrength: levy.levyMen });
    expect(s.forceEnlistments[block]).toEqual({ enlPost: NORTH_GOVERNOR, enlRaisedBy: P('n_governor'), enlCall: levy.levyCall, enlRegiments: levy.levyRegiments, enlMusterDay: levy.levyMusterDay, enlEndsDay: levy.levyMusterDay + 90 });
    expect(s.forceLocations[block]).toMatchObject({ locRegion: R('n_heartland'), locAboard: null, locSinceDay: levy.levyMusterDay });
    expect(s.forceAssignments[block]).toBe(NORTH_GOVERNOR);
    expect(s.postLevies).toEqual({});
    expect(toMuster.fires('recruitment.mustered')).toBe(1);
    expect(toMuster.fires('recruitment.men')).toBe(1);

    // The ninety-day men: on the day their term ends the block disbands from all three owners.
    const before = play(world, s, 89);
    expect(before.state.forceBlockStates[block]).toBeDefined();
    const after = play(world, before.state, 1);
    for (const table of [after.state.forceBlockStates, after.state.forceLocations, after.state.forceAssignments, after.state.forceEnlistments]) expect(Object.prototype.hasOwnProperty.call(table, block)).toBe(false);
    expect(after.fires('recruitment.disbanded')).toBe(1);
  });
});

describe('region loyalty is State owned by regions, read where a levy is raised (lane 1.7)', () => {
  it('copies the start’s loyalty into State, never guessed from control, and scales a levy by it', () => {
    const { world, state } = start();
    expect(phase0.loyaltyOf(state, R('n_heartland'), ids.toId('faction', 'north'))).toBe(900);
    // A region the start gives no loyalty has none recorded (null), whoever controls it.
    expect(phase0.loyaltyOf(state, R('n_coast'), ids.toId('faction', 'north'))).toBeNull();
    const rules = world.map.world.rules.recruitment;
    // At or above the pack's full loyalty, the full share; below it, scaled down by the pack's weight; none recorded, unscaled.
    expect(phase0.regimentsRaised(rules, 10, 'comply', 900)!.regiments).toBe(10);
    expect(phase0.regimentsRaised(rules, 10, 'comply', 400)!.regiments).toBe(7);
    expect(phase0.regimentsRaised(rules, 10, 'comply', null)!.regiments).toBe(10);
    expect(phase0.regimentsRaised(rules, 10, 'refuse', 900)).toBeNull();
    // End to end: the same call to a province whose loyalty has fallen raises fewer regiments.
    const loyal = play(world, state, 3, (d) => (d === 1 ? [['n_leader', call(NORTH_GOVERNOR, 10, 90)]] : [])).state;
    const shaken = play(world, { ...state, regionLoyalty: { ...state.regionLoyalty, [R('n_heartland')]: { north: 300 } } }, 3, (d) => (d === 1 ? [['n_leader', call(NORTH_GOVERNOR, 10, 90)]] : [])).state;
    expect(Object.values(shaken.postLevies)[0]!.levyRegiments).toBeLessThan(Object.values(loyal.postLevies)[0]!.levyRegiments);
  });
});

describe('the derived self-emancipation term proposes who reached the lines (lane 1.7; 0046)', () => {
  it('on its cadence, people reach the northern lines next to their region: a count only regions writes, every number with its typed reason', () => {
    const { world, state } = start();
    const rules = world.map.world.rules.selfEmancipation;
    const terms = phase0.selfEmancipationTerms(world.map, state, rules);
    // Both causes are present: the cause within reaches no one's lines, and is never keyed to reach.
    const far = terms.find((t) => t.region === R('s_coast_east'))!;
    expect(far).toMatchObject({ destination: null, toLines: 0 });
    expect(far.within).toBeGreaterThan(0);
    const valley = terms.find((t) => t.region === R('w_valley'))!;
    expect(valley.destination).not.toBeNull();
    expect(valley.toLines).toBeGreaterThan(0);
    expect(valley.reasons.map((r) => [r.kind, r.agency, r.cause])).toEqual([
      ['agency', 'agency:fen-flight', 'resistance-within'],
      ['agency', 'agency:fen-flight', 'flight-to-lines'],
    ]);
    const { state: s, fires } = play(world, state, 8);
    const reached = Object.values(s.regionReachedUnionLines).reduce((n, v) => n + v, 0);
    expect(reached).toBe(2 * terms.reduce((n, t) => n + t.toLines, 0));
    expect(fires('regions.reached_lines')).toBeGreaterThan(0);
  });

  it('rises with known policy (the pack’s flag), and the proposals name only the protected field', () => {
    const { world, state } = start();
    const rules = world.map.world.rules.selfEmancipation;
    const base = phase0.selfEmancipationTerms(world.map, state, rules).reduce((n, t) => n + t.toLines, 0);
    const known = phase0.selfEmancipationTerms(world.map, { ...state, situationFlags: { ...state.situationFlags, sanctuary_act: 1 } }, rules).reduce((n, t) => n + t.toLines, 0);
    expect(known).toBeGreaterThan(base);
    for (const p of phase0.arrivalProposals(phase0.selfEmancipationTerms(world.map, state, rules))) expect(p).toMatchObject({ field: phase0.REACHED_UNION_LINES_FIELD, origin: 'self-emancipation' });
    expect(() => phase0.applyArrivals(state, [{ field: 'reached_union_lines' as never, region: R('n_west_front'), people: 5, origin: 'self-emancipation' }])).toThrow();
  });
});
