import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { artProblems, coveredByLfs, globToRegExp, isLfsPointer, lfsPatterns, LFS_POINTER_HEAD, looksBinary } from '../lfs-check.ts';

/**
 * Git LFS for the art (lane 0.7l; docs/design/ASSETS.md 0.7). The binaries under art/ go to LFS, recipes stay text,
 * the hooks chain LFS's own with the repository's, and a binary that would go into plain git is refused (rule 7).
 */
const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const TYPES = ['png', 'webp', 'jpg', 'wav', 'ogg', 'flac', 'ttf', 'otf', 'woff2'];
const POINTER = Buffer.from(`${LFS_POINTER_HEAD}oid sha256:${'a'.repeat(64)}\nsize 1234\n`);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

describe('the LFS patterns (.gitattributes)', () => {
  const attrs = read('.gitattributes');
  const patterns = lfsPatterns(attrs);

  it('send every art type to LFS, under art/ only, and keep the repository’s own lines', () => {
    expect(patterns).toEqual(TYPES.map((t) => `art/**/*.${t}`));
    expect(attrs.split('\n').slice(0, 4)).toEqual(['* text=auto eol=lf', '*.png binary', '*.jpg binary', '*.pdf binary']);
  });

  it('cover the art at any depth, and nothing outside art/ nor a recipe', () => {
    expect(coveredByLfs('art/_pilot/paper.png', patterns)).toBe(true);
    expect(coveredByLfs('art/union-1861/ornaments/compass-rose.png', patterns)).toBe(true);
    expect(coveredByLfs('art/top.webp', patterns)).toBe(true);
    expect(coveredByLfs('art/_pilot/paper.recipe.json', patterns)).toBe(false);
    expect(coveredByLfs('packs/testbed/map.png', patterns)).toBe(false);
    expect(coveredByLfs('docs/art/x.png', patterns)).toBe(false);
    expect(globToRegExp('art/*.png').test('art/a/b.png')).toBe(false);
  });
});

describe('the check (no binary under art/ in plain git)', () => {
  const patterns = TYPES.map((t) => `art/**/*.${t}`);

  it('passes an LFS pointer and a text recipe, and ignores files outside art/', () => {
    expect(isLfsPointer(POINTER)).toBe(true);
    expect(artProblems([
      { path: 'art/_pilot/paper.png', blob: POINTER },
      { path: 'art/_pilot/paper.recipe.json', blob: Buffer.from('{"source":"x"}\n') },
      { path: 'docs/figure.png', blob: PNG },
    ], patterns)).toEqual([]);
  });

  it('refuses a covered binary in plain git, and a binary of a type no pattern covers', () => {
    expect(looksBinary(PNG)).toBe(true);
    const problems = artProblems([
      { path: 'art/_pilot/paper.png', blob: PNG },
      { path: 'art/_pilot/sketch.psd', blob: PNG },
    ], patterns);
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain('art/_pilot/paper.png: an LFS pattern covers it, but it would go into plain git');
    expect(problems[1]).toContain('art/_pilot/sketch.psd: a binary under art/ that no LFS pattern covers');
  });


});

describe('the hooks (core.hooksPath is .githooks)', () => {
  it('chain LFS’s four hooks, each failing loudly without git-lfs', () => {
    for (const hook of ['pre-push', 'post-checkout', 'post-commit', 'post-merge']) {
      const text = read(`.githooks/${hook}`);
      expect(text.startsWith('#!/bin/sh\n'), hook).toBe(true);
      expect(text, hook).toContain('command -v git-lfs >/dev/null 2>&1 || {');
      expect(text, hook).toMatch(/exit 2; \}/);
      expect(text, hook).toContain(`git lfs ${hook} "$@"`);
      expect(text, hook).not.toContain('\r');
    }
  });

  it('keep the pre-commit check as it was, after refusing art in plain git', () => {
    const text = read('.githooks/pre-commit');
    const lines = text.split('\n').filter((l) => l !== '' && !l.startsWith('#'));
    expect(lines).toEqual(['set -e', 'node --import tsx tools/lfs-check.ts --staged', 'exec node --import tsx tools/staged-check.ts']);
  });

  // The hooks' modes are in git, so this runs where the tree is a repository (CI, a checkout), not in the hook's snapshot.
  it.runIf(existsSync(new URL('.git', root)))('are executable in git', () => {
    const modes = execFileSync('git', ['ls-files', '--stage', '--', '.githooks'], { cwd: root, encoding: 'utf8' }).trim().split('\n').map((l) => [l.split('\t')[1], l.split(' ')[0]]);
    expect(modes.map(([path]) => path).sort()).toEqual(['.githooks/post-checkout', '.githooks/post-commit', '.githooks/post-merge', '.githooks/pre-commit', '.githooks/pre-push']);
    for (const [path, mode] of modes) expect(mode, path).toBe('100755');
  });
});
