import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, world as w } from '@mandate/kernel';
import { errorsOf, loadPack, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * The testbed's world-format-v2 graph carries what the planner spike (lane
 * 0.9, `docs/research/2026-11-14-planner-design.md`) needs: a direct road and
 * a flank route 30-50% longer, a rail line of limited capacity, a navigable
 * river, a fort, two friendly posts around an enemy salient, a depot, and a
 * small joint relief by sea. Each test fails if the feature is edited away.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const files: PackFiles = {
  read: (p) => {
    const full = join(root, ...p.split('/'));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
  },
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
};
const { pack, issues } = loadPack(files);
const world = pack!.world;
const index = w.indexWorld(world);
const opening = pack!.scenarios.find((s) => s.id === 'opening')!;
const R = (id: string) => ids.toId('region', id);

/** Shortest road time by integer Dijkstra with (days, id) order; `banned` regions are not entered. */
function roadDays(from: string, to: string, banned: readonly string[] = []): number {
  const dist = new Map<string, number>([[from, 0]]);
  const done = new Set<string>();
  for (;;) {
    const next = [...dist].filter(([id]) => !done.has(id)).sort(([a, x], [b, y]) => x - y || (a < b ? -1 : a > b ? 1 : 0))[0];
    if (!next) return Infinity;
    const [at, d] = next;
    if (at === to) return d;
    done.add(at);
    for (const e of w.edgesOf(index, R(at))) {
      if (e.type !== 'road') continue;
      const far = w.otherEnd(e, R(at));
      if (banned.includes(far)) continue;
      const nd = d + w.edgeDays(e, R(at));
      if (nd < (dist.get(far) ?? Infinity)) dist.set(far, nd);
    }
  }
}

describe('testbed world v2', () => {
  it('loads cleanly, with several scenario starts (decision 0030)', () => {
    expect(errorsOf(issues)).toEqual([]);
    expect(pack!.scenarios.map((s) => s.id)).toEqual(['opening', 'summer_front']);
    expect(world.regions.length).toBeGreaterThanOrEqual(30);
  });

  it('has a direct road route and a flank route 30-50% longer', () => {
    const direct = roadDays('n_west_front', 's_heartland');
    const flank = roadDays('n_west_front', 's_heartland', ['salient_tip', 'salient_base', 'mere_crossing']);
    expect(direct).toBe(8);
    expect(flank / direct).toBeGreaterThanOrEqual(1.3);
    expect(flank / direct).toBeLessThanOrEqual(1.5);
  });

  it('has a rail line of limited capacity, with a break of gauge, on a named line', () => {
    const limited = world.edges.filter((e) => e.type === 'rail' && e.capacity === 1);
    expect(limited.length).toBeGreaterThan(0);
    expect(limited.every((e) => e.line !== null)).toBe(true);
    expect(limited.some((e) => e.breakOfBulk)).toBe(true);
  });

  it('has a navigable river whose fort must be reduced, obstructing it at the start', () => {
    const fort = world.installations.find((i) => i.kind === 'fort' && i.fort?.water === 'reduction' && i.fort.commandsEdges.some((id) => index.edges.get(id)?.type === 'river'))!;
    expect(fort).toBeDefined();
    expect(opening.fortification.find((f) => f.region === fort.region)?.levelPermille).toBeGreaterThan(0);
    expect(opening.obstructions.filter((o) => o.by === fort.id).length).toBeGreaterThan(0);
    expect(world.edges.some((e) => e.type === 'river' && e.seasons.some((s) => s.reason === 'low_water'))).toBe(true);
  });

  it('has two friendly posts on either side of an enemy salient', () => {
    const control = new Map(opening.control.map((c) => [c.region as string, c.shares]));
    const holder = (region: string) => (control.get(region) ?? []).reduce<{ faction: string; permille: number } | null>((best, s) => (best && best.permille >= s.permille ? best : s), null)?.faction;
    const armies = opening.posts.filter((p) => p.kind === 'army' && p.region !== null);
    const pairs = armies.flatMap((x) =>
      armies
        .filter((y) => x.id < y.id && x.department === y.department && x.region !== y.region)
        .flatMap((y) => {
          const nx = w.edgesOf(index, x.region!).map((e) => w.otherEnd(e, x.region!));
          const ny = new Set(w.edgesOf(index, y.region!).map((e) => w.otherEnd(e, y.region!)));
          return nx.filter((n) => ny.has(n) && holder(n) !== holder(x.region!)).map((salient) => [x.id, y.id, salient]);
        }),
    );
    expect(pairs).toContainEqual(['n_army_east', 'n_army_west', 'salient_tip']);
  });

  it('has depots and supply sources', () => {
    expect(world.depots.map((d) => d.kind).sort()).toEqual(['depot', 'source', 'source', 'source']);
  });

  it('has a joint relief by sea: a naval base, a sea route to a besieged fort, troops afloat, two linked temporary posts', () => {
    const base = world.installations.find((i) => i.kind === 'naval_base')!;
    expect(index.regions.get(base.region)?.kind).toBe('key_point');
    const sea = new Set(world.regions.filter((r) => r.kind === 'sea').map((r) => r.id as string));
    const reach = new Set<string>([base.region]);
    for (let grew = true; grew; ) {
      grew = false;
      for (const e of world.edges) {
        if (e.type !== 'sea') continue;
        for (const [x, y] of [[e.a, e.b], [e.b, e.a]] as const) if (reach.has(x) && (sea.has(x) || x === base.region) && !reach.has(y)) (reach.add(y), (grew = true));
      }
    }
    expect(reach.has('island_fort')).toBe(true);
    const relief = opening.posts.filter((p) => p.temporary?.operation === 'gull_rock_relief');
    expect(new Set(relief.map((p) => p.department)).size).toBe(2);
    expect(relief.every((p) => p.links.some((l) => l.kind === 'joint'))).toBe(true);
    expect(opening.forceBlocks.some((b) => b.aboard !== null)).toBe(true);
  });

  it('exercises the navy notes and 0040: a department change, standing orders, a detachment, labourers, provincial troops under another command', () => {
    expect(opening.posts.some((p) => p.departmentChanges.length > 0)).toBe(true);
    expect(opening.posts.some((p) => p.standingOrders.some((o) => o.from === null))).toBe(true);
    expect(opening.forceBlocks.some((b) => b.kind === 'detachment')).toBe(true);
    expect(opening.forceBlocks.some((b) => b.nonCombatants > 0)).toBe(true);
    const postDept = new Map(opening.posts.map((p) => [p.id as string, p.department as string]));
    expect(opening.forceBlocks.some((b) => b.post !== null && postDept.get(b.post) !== b.department)).toBe(true);
    expect(world.regions.some((r) => r.offMapRole === 'blockade_port')).toBe(true);
    expect(opening.posts.some((p) => p.railLine !== null && p.holder !== null)).toBe(true);
  });
});
