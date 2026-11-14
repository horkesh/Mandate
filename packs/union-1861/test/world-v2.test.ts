import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorsOf, loadPack, type PackFiles } from '@mandate/pack-format';
import { parseCsv } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * Lane 0.3: the Union 1861 pack in world format v2. `packs.test.ts` in the
 * pack-format package already proves the sources generate, `data/` is fresh
 * and the committed files load; these tests pin what this import promised.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p: string): string | undefined => {
  const full = join(root, ...p.split('/'));
  return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
};
const files: PackFiles = {
  read,
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  files: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name),
};
const { pack, issues } = loadPack(files);
const world = pack!.world;
const start = pack!.scenarios[0]!;
const draftIds = (file: string, column: string): string[] => {
  const t = parseCsv(read(`source/drafts/${file}`)!);
  const i = t.header.indexOf(column);
  return t.rows.map((r) => r.cells[i]!);
};
const controlOf = (region: string) => start.control.find((c) => c.region === region)?.shares ?? [];

describe('Union 1861 world v2', () => {
  it('loads with no errors, as a draft pack, with one start on 4 March 1861', () => {
    expect(errorsOf(issues)).toEqual([]);
    expect(pack!.manifest.status).toBe('draft');
    expect(pack!.scenarios.map((s) => [s.id, s.startDate])).toEqual([['march_1861', '1861-03-04']]);
  });

  it('loses nothing from the map and people drafts', () => {
    const regionIds = new Set(world.regions.map((r) => r.id as string));
    expect(draftIds('map/regions.csv', 'id').filter((id) => !regionIds.has(id))).toEqual([]);
    expect(world.edges.length).toBe(draftIds('map/edges.csv', 'from').length);
    const people = new Set(world.people.map((p) => p.id as string));
    expect(draftIds('people/people.csv', 'id').filter((id) => !people.has(id))).toEqual([]);
  });

  it('turns draft flags into installations and every rail edge into a named line', () => {
    expect(world.installations.filter((i) => i.kind === 'fort').length).toBeGreaterThan(30);
    expect(world.regions.every((r) => !(r.flags as readonly string[]).some((f) => ['fort', 'arsenal', 'navy_yard', 'naval_base'].includes(f)))).toBe(true);
    const rail = world.edges.filter((e) => e.type === 'rail');
    expect(rail.length).toBe(173);
    expect(rail.every((e) => e.line !== null)).toBe(true);
    expect(world.railLines.length).toBe(88);
  });

  it('puts the Pickens truce on the post that holds the fort, dated 28 January 1861', () => {
    const post = start.posts.find((p) => p.id === 'us_fort_pickens')!;
    expect(post.standingOrders.map((o) => [o.id, o.kind, o.issuedOn, o.from])).toEqual([['pickens_truce', 'truce', '1861-01-28', null]]);
    expect(post.installation).toBe('fort_pickens');
  });

  it('holds the Union forts in the seceded states, and no one holds the uncommitted slave states', () => {
    for (const r of ['fort_sumter', 'fort_pickens', 'key_west', 'fort_monroe']) expect(controlOf(r)).toEqual([{ faction: 'union', permille: 1000 }]);
    expect(controlOf('charleston')).toEqual([{ faction: 'confederate', permille: 1000 }]);
    for (const r of ['richmond', 'nashville', 'raleigh', 'little_rock']) expect(controlOf(r)).toEqual([]);
    expect(controlOf('baltimore')).toEqual([{ faction: 'confederate', permille: 400 }, { faction: 'union', permille: 150 }]);
    const neutral = world.departments.filter((d) => d.faction === null).map((d) => d.id as string).sort();
    expect(neutral).toEqual(['st_arkansas', 'st_delaware', 'st_kentucky', 'st_maryland', 'st_missouri', 'st_north_carolina', 'st_tennessee', 'st_virginia']);
  });

  it('keeps the licence-unclear and unlicensed sources out of the registry', () => {
    const keys = pack!.provenance.sources.map((s) => s.key);
    expect(keys.some((k) => /^BATES|^WP1848/.test(k))).toBe(false);
    expect(pack!.provenance.sources.every((s) => ['public-domain', 'own-work'].includes(s.licence))).toBe(true);
    expect(pack!.provenance.sources.filter((s) => s.kind === 'pointer').every((s) => s.key.startsWith('NOTE-'))).toBe(true);
  });

  it('writes what no source gives as unknown, never as a value', () => {
    const unknownHolders = start.posts.filter((p) => p.unknowns.includes('holder')).map((p) => p.id as string);
    expect(unknownHolders).toContain('us_dept_texas');
    expect(start.posts.filter((p) => p.holder === null).every((p) => p.unknowns.includes('holder'))).toBe(true);
    expect(start.forceBlocks.filter((b) => b.strength === null).every((b) => b.unknowns.includes('strength'))).toBe(true);
    expect(world.people.filter((p) => p.born === null).every((p) => p.unknowns.includes('born'))).toBe(true);
  });

  it('records the Sumter labourers beside its garrison', () => {
    const b = start.forceBlocks.find((x) => x.id === 'fb_us_sumter_garrison')!;
    expect([b.strength, b.nonCombatants, b.storesDays]).toEqual([85, 55, 7]);
  });
});
