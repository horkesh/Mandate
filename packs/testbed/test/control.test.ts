import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * Control, fronts, pockets and supply (lane 0.4) on the testbed's real v2
 * graph and its `opening` start: the salient, the contested flank, the river
 * fort and the besieged island fort each behave as the pack's README says.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const files: PackFiles = {
  read: (p) => {
    const full = join(root, ...p.split('/'));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
  },
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  files: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name),
};
const { pack } = loadPack(files);
const map = w.indexWorld(pack!.world);
const opening = pack!.scenarios.find((s) => s.id === 'opening')!;
const control = phase0.initialControl(map, opening);
const R = (id: string) => ids.toId('region', id);
const F = (id: string) => ids.toId('faction', id);
const APRIL = 4;
const index = phase0.buildControlIndex(map, control);
const startNetwork = phase0.networkConditions(opening);

describe('control at the opening (0050)', () => {
  it('copies the start: soft control in the salient and on the flank', () => {
    expect(control[R('salient_tip')]).toEqual({ north: 150, south: 750 });
    expect(control[R('w_valley')]).toEqual({ north: 300, south: 550 });
    expect(control[R('mere_lower')]).toBeUndefined();
  });

  it('holds the salient for the South, and contests the flank', () => {
    expect(index.holdings.get(R('salient_tip'))!.holder).toBe('south');
    expect(index.holdings.get(R('salient_tip'))!.tracedBy).toEqual(['south']);
    expect(index.contested).toEqual(['w_valley']);
    expect(index.holdings.get(R('mere_lower'))!.reason).toBe('open_water');
  });
});

describe('fronts around the salient (0013)', () => {
  it('meets along five contact edges, and the North sees one line around the bulge', () => {
    expect(index.contactEdges.map((c) => c.edge)).toEqual([
      'road:e_lowlands:n_east_front',
      'road:n_centre_line:salient_tip',
      'road:n_east_front:salient_tip',
      'road:n_west_front:salient_tip',
      'road:n_west_front:w_valley',
    ]);
    const north = index.fronts.get(F('north'))!;
    expect(north.map((l) => [l.id, l.regions])).toEqual([['front:north:n_centre_line', ['n_centre_line', 'n_east_front', 'n_west_front']]]);
    expect(north[0]!.segments.filter((s) => s.faces === 'salient_tip').map((s) => s.own)).toEqual(['n_centre_line', 'n_east_front', 'n_west_front']);
  });

  it('gives each region its holder as wire owner (0052)', () => {
    expect(phase0.wireOwnerOf(index, R('salient_tip')).owner).toBe('south');
    expect(phase0.wireOwnerOf(index, R('n_capital')).owner).toBe('north');
    expect(phase0.wireOwnerOf(index, R('north_sea')).owner).toBeNull();
  });
});

describe('supply on the opening graph', () => {
  it('supplies the island fort by sea from the naval base while the channel is open', () => {
    const north = phase0.deriveSupply(map, index, APRIL).factions.get(F('north'))!;
    const island = north.paths.get(R('island_fort'))!;
    expect(island.origin).toBe('kestrel_source');
    expect(island.legs.map((l) => l.type)).toEqual(['sea', 'sea', 'sea', 'sea']);
    expect(north.pockets).toEqual([]);
  });

  it('cuts it off once the start’s boom closes the channel, and names the boom as the cut', () => {
    const north = phase0.deriveSupply(map, index, APRIL, startNetwork).factions.get(F('north'))!;
    expect(north.pockets).toEqual([
      { id: 'pocket:north:island_fort', faction: 'north', regions: ['island_fort'], cut: { why: 'obstructed', region: null, edge: 'sea:island_fort:south_sea', by: null } },
    ]);
  });

  it('feeds the western army from the forward depot at the railhead, damaged as the start says', () => {
    const north = phase0.deriveSupply(map, index, APRIL, startNetwork).factions.get(F('north'))!;
    const depot = north.origins.find((o) => o.depot === 'brenn_depot')!;
    expect(depot.terms).toContainEqual({ kind: 'condition', conditionPermille: 800 });
    expect(north.paths.get(R('n_west_front'))!.origin).toBe('brenn_depot');
  });

  it('lets the South use the river past its own fort, but not the North', () => {
    const corran = phase0.obstructionFor(map, index, startNetwork, ids.toId('edge', 'river:mere_crossing:mere_upper'), F('north'));
    expect(corran).toEqual({ by: 'corran_fort' });
    expect(phase0.obstructionFor(map, index, startNetwork, ids.toId('edge', 'river:mere_crossing:mere_upper'), F('south'))).toBeNull();
  });

  it('lengthens muddy roads in winter (0029)', () => {
    const winter = phase0.deriveSupply(map, index, 1).factions.get(F('north'))!.paths.get(R('n_centre_line'))!;
    const spring = phase0.deriveSupply(map, index, 6).factions.get(F('north'))!.paths.get(R('n_centre_line'))!;
    expect(winter.daysPermille).toBeGreaterThan(spring.daysPermille);
    expect(winter.legs.some((l) => l.effects.some((e) => e.kind === 'season' && e.reason === 'mud'))).toBe(true);
  });

  it('holds every invariant on the opening, with and without the start’s network', () => {
    expect(phase0.controlInvariants(map, control)).toEqual([]);
    for (const network of [phase0.INTACT_NETWORK, startNetwork]) {
      const derived = phase0.deriveMap(map, { control, month: APRIL, network });
      expect(phase0.derivedInvariants(map, control, APRIL, network, derived)).toEqual([]);
    }
  });
});
