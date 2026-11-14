import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Decision 0035: lanes upgrade tools deliberately, never silently. Every
 * external dependency is pinned to an exact version in package.json (the
 * lockfile pins transitive ones). Workspace references (`@mandate/*`) are exempt.
 */
type Manifest = { name?: string; dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string> };

export function unpinned(manifest: Manifest): string[] {
  const out: string[] = [];
  for (const field of ['dependencies', 'devDependencies'] as const) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (name.startsWith('@mandate/')) continue;
      if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(range)) out.push(`${manifest.name ?? '(root)'} ${field}: ${name}@${range}`);
    }
  }
  return out;
}

describe('toolchain pins (decision 0035)', () => {
  const root = new URL('../../', import.meta.url);
  const manifests: Manifest[] = [
    JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as Manifest,
    ...readdirSync(new URL('packages/', root)).map((dir) => JSON.parse(readFileSync(new URL(`packages/${dir}/package.json`, root), 'utf8')) as Manifest),
  ];

  it('pins every external dependency exactly', () => {
    expect(manifests.flatMap(unpinned)).toEqual([]);
  });

  it('flags ranges (positive control)', () => {
    expect(unpinned({ devDependencies: { tsx: '^4.23.15', vitest: '5.1.0', a: '~1.0.0', b: '*', c: 'latest' }, dependencies: { '@mandate/kernel': '*' } })).toEqual([
      '(root) devDependencies: tsx@^4.23.15',
      '(root) devDependencies: a@~1.0.0',
      '(root) devDependencies: b@*',
      '(root) devDependencies: c@latest',
    ]);
  });
});
