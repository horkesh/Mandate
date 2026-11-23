import { forceTotals } from '../../../packages/kernel/src/forces/lots.ts';
import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

const { world, setup } = seatsWorld('union-1861');
const id = (name: string) => ids.toId('forceBlock', name);

describe('S1 Charleston source snapshots reach the opening forces', () => {
  it.each([
    ['fb_st_charleston_fort_johnson', 100, '1861-03-03'],
    ['fb_st_charleston_fort_palmetto_stono', 146, '1861-03-03'],
    ['fb_st_charleston_regiment_of_rifles', 450, '1861-04-03'],
  ] as const)('loads %s with the reported count and its actual snapshot date', (block, count, date) => {
    expect(world.start.forceBlocks.find(b => b.id === block)).toMatchObject({ strength: count, strengthDate: date });
    expect(forceTotals(phase0.createState(world, setup).forceBlockStates[id(block)]!).fbStrength).toBe(count);
  });

  it('keeps the combined Palmetto force mixed and the unsourced infantry unknown', () => {
    const state = phase0.createState(world, setup);
    expect(state.forceBlockStates[id('fb_st_charleston_fort_palmetto_stono')]!.fbArm).toBe('mixed');
    expect(forceTotals(state.forceBlockStates[id('fb_st_charleston_1st_infantry_regulars')]!).fbStrength).toBeNull();
  });
});
