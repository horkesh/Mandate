import { canonicalHash, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { fortDay } from '../../../packages/kernel/src/combat/bombard.ts';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const { world, setup } = seatsWorld('union-1861');
const fort = ids.toId('region', 'fort_sumter');
const post = ids.toId('post', 'us_fort_sumter');
const side = ids.toId('faction', 'confederate');
const anderson = ids.toId('person', 'anderson_robert');
const attackers = world.start.forceBlocks.filter(b => b.post === ids.toId('post', 'cs_cmd_charleston')).map(b => b.id);
const start = () => phase0.createState(world, { ...setup, atWar: true });
const fall = (state: phase0.State, day: number) => fortDay(world, state, attackers, fort, side, () => 'surrender', day)!;

describe('Sumter’s cited terms (R74, OR I-1 pp. 13–15)', () => {
  it('records Anderson and the 11–13 April offer window, keeping the historical surrender proposal unchanged', () => {
    expect(world.map.world.rules.combat.bombardment.recordTerms).toContainEqual(expect.objectContaining({ region: fort, commander: anderson, offerWindow: { offerDay: 37, lastDay: 39 } }));
    const result = fall(start(), 39);
    expect(result.surrendered).toBe('evacuated_under_terms');
    expect(result.people).toEqual([]);
    expect(result.command).toContainEqual(expect.objectContaining({ person: anderson, why: 'evacuated' }));
    // The pre-R74 whole-proposal control used the original, unquantified attackers. S1 supplies
    // three later-read strength snapshots; pin the old inputs here rather than changing that control
    // or making production strengths fit it. The actual current pack is exercised above.
    const initial = start();
    const legacyBlocks = { ...initial.forceBlockStates };
    for (const name of ['fb_st_charleston_fort_johnson', 'fb_st_charleston_fort_palmetto_stono', 'fb_st_charleston_regiment_of_rifles']) {
      const block = ids.toId('forceBlock', name);
      legacyBlocks[block] = { ...legacyBlocks[block]!, fbStrength: null };
    }
    const palmetto = ids.toId('forceBlock', 'fb_st_charleston_fort_palmetto_stono');
    legacyBlocks[palmetto] = { ...legacyBlocks[palmetto]!, fbArm: 'artillery' };
    const legacy = fall({ ...initial, forceBlockStates: legacyBlocks }, 39);
    expect(canonicalHash(legacy)).toBe('62df97f062af0b7b9dc90f6e1751334bace54edb41a284d18a668ccef5f0ac5a');
    const guns = (r: typeof result) => r.day.terms.find(t => t.btermKind === 'guns_attacker')!.btermValue;
    expect(guns(result)).toBe(guns(legacy) + 100);
    expect([result.surrendered, result.musters, result.command, result.people, result.control]).toEqual(
      [legacy.surrendered, legacy.musters, legacy.command, legacy.people, legacy.control],
    );
  });

  it('captures the replacement and his garrison when Anderson has been relieved before bombardment', () => {
    const initial = start();
    const replacement = world.map.world.people.find(p => p.faction === ids.toId('faction', 'union') && p.id !== anderson && !Object.values(initial.postStates).some(s => s.postHolder === p.id))!.id;
    const state = phase0.appointHolder(world.map, phase0.relieveHolder(initial, post), post, replacement);
    const result = fall(state, 39);
    expect(result.surrendered).toBe('captured');
    expect(result.recordSource).toBeNull();
    expect(result.people).toEqual([{ change: 'status', person: replacement, status: 'captured' }]);
    expect(result.command).toContainEqual(expect.objectContaining({ person: replacement, why: 'captured' }));
    expect(result.forces).toContainEqual(expect.objectContaining({ change: 'battle_losses', block: ids.toId('forceBlock', 'fb_us_sumter_garrison'), captured: expect.any(Number) }));
  });

  it.each([36, 37, 40, 46])('captures instead of asserting the 11 April terms when the fort falls on day %i', (day) => {
    const result = fall(start(), day);
    expect(result.surrendered).toBe('captured');
    expect(result.recordSource).toBeNull();
    expect(result.people).toEqual([{ change: 'status', person: anderson, status: 'captured' }]);
  });
});
