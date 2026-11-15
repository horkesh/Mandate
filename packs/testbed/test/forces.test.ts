import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * Forces and command (lane 0.5) on the testbed's `opening` start: every block
 * and post copied once into State, the joint relief expedition as two
 * temporary posts that dissolve with their operation, troops aboard a ship,
 * and a railhead detachment of a western block.
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
const command = phase0.initialCommand(map, opening);
const state: phase0.State = {
  ...phase0.emptyState(),
  forceBlockStates: phase0.initialForces(map, opening),
  forceLocations: phase0.initialLocations(map, opening),
  postStates: command.posts,
  forceAssignments: command.assignments,
};
const B = (id: string) => ids.toId('forceBlock', id);
const P = (id: string) => ids.toId('post', id);

describe('the testbed opening as forces and command State', () => {
  it('copies every block and post, each block under a post on its own side', () => {
    expect(Object.keys(state.forceBlockStates)).toHaveLength(opening.forceBlocks.length);
    expect(Object.keys(state.postStates)).toHaveLength(opening.posts.length);
    for (const b of phase0.blockIds(state)) {
      const post = phase0.assignmentOf(state, b);
      if (post !== null) expect(phase0.factionOfPost(map, state, post), b).toBe(phase0.factionOfBlock(map, state, b));
    }
  });

  it('keeps the relief troops aboard their ship and the railhead guard under its block', () => {
    expect(state.forceLocations[B('n_relief_troops')]).toMatchObject({ locAboard: 'n_ship_resolute' });
    expect(state.forceBlockStates[B('n_west_1_railguard')]).toMatchObject({ fbKind: 'detachment', fbParent: 'n_west_1' });
  });

  it('dissolves the joint relief expedition with its operation, its troops returning up the chain', () => {
    const { state: after, dissolved } = phase0.dissolveOperation(state, 'gull_rock_relief');
    expect(dissolved).toEqual(['n_relief_army', 'n_relief_squadron']);
    expect(after.forceAssignments[B('n_relief_troops')]).toBe(state.postStates[P('n_relief_army')]!.postParent);
  });
});
