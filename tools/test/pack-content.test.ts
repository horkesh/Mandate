import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { PROVENANCE_FILE } from '@mandate/pack-format';
import { readTestbed } from '../../packages/pack-format/test/support/testbed.ts';
import { packContent } from '../rules/pack-content.ts';

const files = vi.hoisted(() => new Map<string, string>());
vi.mock('node:fs', async importOriginal => {
  const original = await importOriginal<typeof import('node:fs')>();
  const key = (path: unknown) => String(path).replaceAll('\\', '/');
  return {
    ...original,
    existsSync: (path: Parameters<typeof original.existsSync>[0]) => key(path).startsWith('/case-sensitive-pack/') ? files.has(key(path)) : original.existsSync(path),
    readFileSync: (...args: Parameters<typeof original.readFileSync>) => {
      if (!key(args[0]).startsWith('/case-sensitive-pack/')) return original.readFileSync(...args);
      const value = files.get(key(args[0]));
      if (value === undefined) throw new Error(`ENOENT, case-sensitive fixture: ${key(args[0])}`);
      return value;
    },
  };
});

it('loads signed-content inputs using their tracked spelling on a case-sensitive filesystem', () => {
  const root = '/case-sensitive-pack';
  for (const path of ['pack.json', PROVENANCE_FILE, 'strings/en.json']) files.set(`${root}/packs/testbed/${path}`, readTestbed(path));
  expect(readFileSync(`${root}/packs/testbed/${PROVENANCE_FILE}`, 'utf8')).toContain('sources');
  let content: ReturnType<typeof packContent> | undefined;
  expect(() => { content = packContent(root, 'testbed'); }).not.toThrow();
  expect(content!.provenance.sources.length).toBeGreaterThan(0);
  expect(content!.strings.get('en')!.size).toBeGreaterThan(0);
});
