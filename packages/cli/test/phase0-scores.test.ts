import { phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { checkpointScores } from '../src/phase0-scores.ts';
import { seatsWorld } from '../src/seats-world.ts';

/** Checkpoint scores read a block's side from State's department sides (0065; exit review S5, 0072 item 6). */
describe('checkpoint scores count a block on its department\'s side today', () => {
  it('moves a department\'s known men to the side it is on in State, not the World\'s', () => {
    const { world, setup } = seatsWorld('testbed');
    const result = phase0.tick(world, phase0.createState(world, setup), []);
    const block = Object.values(result.state.forceBlockStates).find((b) => b.fbStrength !== null && phase0.departmentSide(result.state, b.fbDepartment) !== null)!;
    const from = phase0.departmentSide(result.state, block.fbDepartment)!;
    const to = world.map.world.factions.map((f) => f.id).find((f) => f !== from)!;
    let men = 0;
    for (const b of Object.values(result.state.forceBlockStates)) if (b.fbDepartment === block.fbDepartment) men += b.fbStrength ?? 0;
    expect(men).toBeGreaterThan(0);

    const before = checkpointScores(world, result);
    // As a change of side leaves it: the department's side is State; the World still says the old side.
    const turned = { ...result, state: { ...result.state, departmentFactions: { ...result.state.departmentFactions, [block.fbDepartment]: to } } };
    expect(world.map.world.departments.find((d) => d.id === block.fbDepartment)!.faction).toBe(from);
    const after = checkpointScores(world, turned);
    const known = (s: ReturnType<typeof checkpointScores>, f: string) => s.factions.find((x) => x.faction === f)!.menKnown;
    expect(known(after, from)).toBe(known(before, from) - men);
    expect(known(after, to)).toBe(known(before, to) + men);
  });
});
