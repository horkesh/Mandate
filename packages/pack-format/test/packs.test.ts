import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { errorsOf, formatIssue, generatePack, loadPack, type PackFiles, staleFiles } from '../src/index.ts';

/**
 * Every pack in `packs/` with a v2 manifest: its sources generate without
 * errors, its committed `data/` is exactly the generator's output (the
 * staleness check, FOUNDATION 11.7), and the committed files load and validate
 * on their own. Pack ids come from disk, so no setting name appears here.
 */
const PACKS = fileURLToPath(new URL('../../../packs/', import.meta.url));

function packFiles(root: string): PackFiles {
  return {
    read: (p) => {
      const full = join(root, ...p.split('/'));
      return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
    },
    folders: (p) => {
      const full = join(root, ...p.split('/'));
      return existsSync(full) ? readdirSync(full, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
    },
  };
}

function dataFiles(root: string): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (rel: string) => {
    const full = join(root, ...rel.split('/'));
    if (!existsSync(full)) return;
    for (const d of readdirSync(full, { withFileTypes: true })) {
      if (d.isDirectory()) walk(`${rel}/${d.name}`);
      else out.set(`${rel}/${d.name}`, readFileSync(join(full, d.name), 'utf8'));
    }
  };
  walk('data');
  return out;
}

const v2 = readdirSync(PACKS).filter((d) => existsSync(join(PACKS, d, 'pack.json')));

describe('v2 packs', () => {
  it('there is at least one', () => {
    expect(v2.length).toBeGreaterThan(0);
  });

  for (const id of v2) {
    describe(id, () => {
      const root = join(PACKS, id);
      const generated = generatePack(packFiles(root));

      it('generates from its sources without errors', () => {
        expect(errorsOf(generated.issues).map(formatIssue)).toEqual([]);
      });

      it(`has an up-to-date data/ folder (run npm run pack:generate -- ${id} if not)`, () => {
        expect(staleFiles(generated.outputs, dataFiles(root))).toEqual([]);
      });

      it('loads and validates from its committed files alone, to the same World', () => {
        const loaded = loadPack(packFiles(root));
        expect(errorsOf(loaded.issues).map(formatIssue)).toEqual([]);
        expect(w.worldHash(loaded.pack!.world)).toBe(w.worldHash(generated.pack!.world));
        expect(loaded.pack!.scenarios.map(w.scenarioHash)).toEqual(generated.pack!.scenarios.map(w.scenarioHash));
      });
    });
  }
});
