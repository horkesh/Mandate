import { describe, expect, it, vi } from 'vitest';
import * as forces from '../src/forces/forces.ts';
import { toId } from '../src/ids.ts';
import type { State } from '../src/root-state.ts';
import { generateReports } from '../src/tick/generate.ts';
import { createState } from '../src/tick/setup.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { indexedFixture, P, POST, R } from './support/seats-fixture.ts';
import { ctxFor } from './support/tick-context.ts';

const enemy = toId('forceBlock', 'b_army_1');
const aboard = toId('forceBlock', 'a_army_1');

function fixture() {
  const original = indexedFixture();
  const regions = [...original.map.regions.keys()];
  const world = { ...original, watched: () => regions };
  return { world, state: createState(world, { seed: 17 }) };
}

describe('S146 report-phase reconnaissance index', () => {
  it('bounds force ownership scans independently of commanders and watched regions', () => {
    const { world, state } = fixture();
    const spy = vi.spyOn(forces, 'factionOfBlock');
    try {
      generateReports(ctxFor(world, state, 1, TICK_MECHANICS), state);
      // One reconnaissance index and the existing one count pass per side.
      expect(spy.mock.calls.length).toBeLessThanOrEqual(Object.keys(state.forceLocations).length * (world.factionIds.length + 1));
    } finally { spy.mockRestore(); }
  });

  it.each(['unknown', 'detachment', 'zero', 'surrendered', 'aboard'] as const)('retains %s contact and attribution semantics', kind => {
    const { world, state } = fixture();
    const force = state.forceBlockStates[enemy]!;
    const changed: State = { ...state,
      forceBlockStates: { ...state.forceBlockStates, [enemy]: { ...force,
        fbKind: kind === 'detachment' ? 'detachment' : force.fbKind,
        fbSurrenderedDay: kind === 'surrendered' ? 0 : force.fbSurrenderedDay,
        fbLots: force.fbLots.map(l => ({ ...l, lotMen: kind === 'zero' ? 0 : null,
          lotStrength: { strengthKind: kind === 'zero' ? 'rule' : 'unknown', strengthSource: null, strengthDate: null } })),
      } },
      forceLocations: { ...state.forceLocations, [enemy]: { ...state.forceLocations[enemy]!, locAboard: kind === 'aboard' ? aboard : null } },
    };
    const ctx = ctxFor(world, changed, 1, TICK_MECHANICS);
    generateReports(ctx, changed);
    const paper = ctx.outbox.find(m => m.msgTo === P('a_gen') && m.msgReport?.reportType === 'enemy-estimate')!.msgReport!;
    const seen = kind === 'unknown' || kind === 'detachment';
    expect(paper.reportClaims.find(c => c.claimRegion === R('b_front') && c.claimStrength !== undefined)?.claimStrength)
      .toMatchObject({ strengthPresence: seen, strengthCoverage: 'unknown', strengthUnknown: true });
    expect(paper.reportClaims.some(c => c.claimKind === 'enemy-command' && c.claimRegion === R('b_front') && c.claimToken === POST('b_army')))
      .toBe(kind === 'unknown');
  });
});
