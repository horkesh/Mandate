import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * A transfer concentrates (lane 1.12; the lead's Fix 1). The doctrine transfers what the governors raise to its
 * concentration post; each block handed over is ordered to join that post at its seat (its home region in pack data)
 * and marches there by movement's own routes, by rail where its side traces the line. And a goal to hold holds the
 * post's seat, not the region of its strongest block.
 */
const rules = createRuleSeat();
const { world, setup } = seatsWorld('union-1861');
const DC = ids.toId('post', 'us_dc_militia');
const WASHINGTON = ids.toId('region', 'washington');

describe('a transfer concentrates on union-1861', () => {
  it('a levy mustered at New York and transferred to Washington’s post marches to Washington, by rail where it runs', () => {
    expect(phase0.createState(world, setup).postStates[DC]!.postSeat).toBe(WASHINGTON);
    const legs = new Map<string, Set<string>>();
    const run = phase0.playDays(world, phase0.createState(world, { ...setup, atWar: true }), () => rules, 75, {
      freeze: true,
      onDay: (r) => {
        for (const [b, loc] of Object.entries(r.state.forceLocations)) {
          if (!b.startsWith('raised.st_gov_new_york.') || loc.locMarch === null) continue;
          const type = world.map.edges.get(loc.locMarch.marchEdge)!.type;
          legs.set(b, new Set([...(legs.get(b) ?? []), type]));
        }
      },
    });
    // Follow the original militia levy. The sourced 3 May repeat has had fewer days to march by day 75.
    const militia = Object.values(run.state.orderResponses).find(r => r.respKind === 'call' && r.respRole === 'addressee' && r.respPost === 'st_gov_new_york' && r.respCallId === undefined)!;
    expect(militia).toBeDefined();
    const ny = Object.keys(run.state.forceLocations).filter((b) => run.state.forceEnlistments[b as ids.ForceBlockId]?.enlCall === militia.respOrder);
    expect(ny.length).toBeGreaterThan(0);
    for (const b of ny) {
      // Handed to Washington's post, it stands at Washington with no order left to join.
      expect(run.state.forceAssignments[b as ids.ForceBlockId]).toBe(DC);
      expect(run.state.forceLocations[b as ids.ForceBlockId]!.locRegion).toBe(WASHINGTON);
      expect(run.state.forceJoins[b as ids.ForceBlockId]).toBeUndefined();
      // It went by rail: the side traces the lines from New York (0019).
      expect([...(legs.get(b) ?? [])]).toContain('rail');
    }
    // Before the opening decisions no Union levy has been called. The other side's sourced March calls may raise troops,
    // while the concentration doctrine still waits for that side's own war decision.
    const peace = phase0.playDays(world, phase0.createState(world, setup), () => rules, 30, { freeze: true });
    expect(Object.keys(peace.state.forceJoins)).toEqual([]);
    expect(Object.entries(peace.state.forceBlockStates).some(([b,force]) => b.startsWith('raised.') && phase0.departmentSide(peace.state,force.fbDepartment) === 'union')).toBe(false);
  });

  it('a goal to hold Washington holds Washington, the post’s seat, not New York where its strongest block stands', () => {
    let state = phase0.createState(world, { ...setup, atWar: true });
    // Put the post's strongest block elsewhere (New York), as a fresh levy would stand before it marches.
    const strongest = Object.keys(state.forceAssignments)
      .filter((b) => state.forceAssignments[b as ids.ForceBlockId] === DC)
      .sort((a, b) => (state.forceBlockStates[b as ids.ForceBlockId]!.fbStrength ?? 0) - (state.forceBlockStates[a as ids.ForceBlockId]!.fbStrength ?? 0))[0] as ids.ForceBlockId;
    state = { ...state, forceBlockStates: { ...state.forceBlockStates, [strongest]: { ...state.forceBlockStates[strongest]!, fbStrength: 99999 } }, forceLocations: { ...state.forceLocations, [strongest]: { ...state.forceLocations[strongest]!, locRegion: ids.toId('region', 'new_york') } } };
    const lincoln = phase0.seatIdFor(world.faction(ids.toId('faction', 'union')).principal);
    const goal = { ...world.map.world.rules.plans.goalDefaults, objective: WASHINGTON, posture: 'hold' as const, committed: [] };
    const sent = phase0.tick(world, state, [{ day: 1, seat: lincoln, command: { cmd: 'order', to: DC, goal, route: 'courier', bypass: false } }], { freeze: true });
    expect(sent.rejections).toEqual([]);
    const run = phase0.playDays(world, sent.state, () => rules, 10, { freeze: true });
    const hold = run.state.planRecords[DC]!.planDraft!.draftCandidates.find((c) => c.candMethod === 'holding')!;
    expect(hold.candAxes[0]!.axisRoute.routeTo).toBe(WASHINGTON);
  });
});
