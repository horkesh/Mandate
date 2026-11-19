import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { artProblems, checkProblems, historyProblems, mastersProblems, stagedMasters, treeEntries, treeMasters } from '../lfs-check.ts';

// These fixtures write temporary Git histories. vitest.config.ts excludes the
// whole file in the read-only lane; ordinary hook and CI collection remain full.
const TYPES = ['png', 'webp', 'jpg', 'wav', 'ogg', 'flac', 'ttf', 'otf', 'woff2'];
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

describe('the LFS check against Git fixtures', () => {
  const patterns = TYPES.map((t) => `art/**/*.${t}`);

  it('reads every commit a pushed head reaches: art committed into plain git and deleted later is still refused (the review)', () => {
    // A scratch repository with no hooks and no LFS filter: the first commit puts a PNG under art/ as a plain blob, the
    // second deletes it, so the tip is clean and only the history holds it.
    const dir = mkdtempSync(join(tmpdir(), 'mandate-lfs-history-'));
    const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=no-hooks', '-c', 'user.name=test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
    git('init', '-q');
    mkdirSync(join(dir, 'art', '_pilot'), { recursive: true });
    writeFileSync(join(dir, 'art', '_pilot', 'leak.png'), PNG);
    writeFileSync(join(dir, 'art', '_pilot', 'paper.recipe.json'), '{"source":"x"}\n');
    git('add', '-A');
    git('commit', '-q', '-m', 'a texture in plain git');
    const leaked = git('rev-parse', 'HEAD').trim();
    git('rm', '-q', 'art/_pilot/leak.png');
    git('commit', '-q', '-m', 'delete it');
    expect(artProblems(treeEntries(dir, 'HEAD'), patterns)).toEqual([]);
    const history = historyProblems(dir, 'HEAD', patterns);
    expect(history).toHaveLength(1);
    expect(history[0]).toContain('art/_pilot/leak.png: an LFS pattern covers it, but it would go into plain git');
    expect(history[0]).toContain(`(in commit ${leaked.slice(0, 12)})`);
  });

  it('refuses any path under art-masters/, staged by git add -f past .gitignore or in any commit (main 37da2a8)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mandate-lfs-masters-'));
    const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=no-hooks', '-c', 'user.name=test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
    git('init', '-q');
    writeFileSync(join(dir, '.gitignore'), '/art-masters/\n');
    mkdirSync(join(dir, 'art-masters', 'pilot'), { recursive: true });
    // Text or binary, a master is refused for where it is, not what it holds.
    writeFileSync(join(dir, 'art-masters', 'pilot', 'paper.psd'), PNG);
    writeFileSync(join(dir, 'art-masters', 'pilot', 'notes.txt'), 'the original\n');
    git('add', '.gitignore');
    expect(stagedMasters(dir)).toEqual([]);
    git('add', '-f', 'art-masters');
    expect(mastersProblems(stagedMasters(dir)).map((p) => p.split(':')[0])).toEqual(['art-masters/pilot/notes.txt', 'art-masters/pilot/paper.psd']);
    git('commit', '-q', '-m', 'masters forced in');
    git('rm', '-q', '-r', '--cached', 'art-masters');
    git('commit', '-q', '-m', 'and taken out');
    expect(mastersProblems(treeMasters(dir, 'HEAD'))).toEqual([]);
    const history = historyProblems(dir, 'HEAD', patterns);
    expect(history).toHaveLength(2);
    expect(history.every((p) => p.includes('under art-masters/, which never goes into git'))).toBe(true);
    // A path that only begins like it is not under it.
    expect(mastersProblems(['art-masters.md', 'art/masters/x.png'])).toEqual([]);
  });

  it('refuses git add -f art-masters/x.png in the staged mode the pre-commit hook runs, and in the tree mode (the re-check)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mandate-lfs-modes-'));
    const git = (...args: string[]) => execFileSync('git', ['-c', 'core.hooksPath=no-hooks', '-c', 'user.name=test', '-c', 'user.email=test@example.invalid', '-c', 'commit.gpgsign=false', ...args], { cwd: dir, encoding: 'utf8' });
    git('init', '-q');
    writeFileSync(join(dir, '.gitignore'), '/art-masters/\n');
    mkdirSync(join(dir, 'art-masters'), { recursive: true });
    writeFileSync(join(dir, 'art-masters', 'x.png'), PNG);
    git('add', '.gitignore');
    git('commit', '-q', '-m', 'ignore the masters');
    expect(checkProblems(dir, { staged: true }, patterns).problems).toEqual([]);
    git('add', '-f', 'art-masters/x.png');
    const staged = checkProblems(dir, { staged: true }, patterns).problems;
    expect(staged).toHaveLength(1);
    expect(staged[0]).toContain('art-masters/x.png: under art-masters/, which never goes into git');
    git('commit', '-q', '-m', 'forced');
    expect(checkProblems(dir, { tree: 'HEAD' }, patterns).problems.map((p) => p.split(':')[0])).toEqual(['art-masters/x.png']);
    expect(checkProblems(dir, { tree: 'HEAD~1' }, patterns).problems).toEqual([]);
  });
});
