import { describe, expect, it } from 'vitest';
import { errorsOf, generatePack } from '@mandate/pack-format';
import { filesOf, withFile } from '../../pack-format/test/support/fixture.ts';
import { seatIds } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';

function fixture() {
  return withFile('source/scenarios/start/scenario.json', text => {
    const header = JSON.parse(text) as { factions: { faction: string; capital: string | null }[] };
    return JSON.stringify({ ...header, factions: header.factions.map(row => row.faction === 'blue' ? { ...row, capital: 'port' } : row), openingControl: {
    authors: [{ faction: 'red', post: 'red_top' }, { faction: 'blue', post: 'blue_top' }],
    table: [{ region: 'alpha', shares: [] }, { region: 'beta', shares: [] }, { region: 'port', shares: [] }],
    } });
  });
}

describe('the authored opening government override, through the pack loader', () => {
  it('reveals no true government when the authored override contains control only', () => {
    const result = generatePack(filesOf(fixture()));
    expect(errorsOf(result.issues)).toEqual([]);
    const data = result.pack!;
    const world = indexSeatsWorld(indexWorld(data.world), data.scenarios[0]!);
    const state = createState(world, { seed: 1 });
    expect(state.regionGovernments).toMatchObject({ alpha: 'r_prov', beta: 'r_prov' });
    expect(seatIds(state).length).toBeGreaterThan(0);
    for (const seat of seatIds(state)) {
      const claims = viewFor(world, state, seat).reports.flatMap(r => r.claims).filter(c => c.kind === 'control-government');
      expect(claims).toEqual([]);
      expect(claims.some(c => c.token === 'r_prov')).toBe(false);
    }
  });

});
