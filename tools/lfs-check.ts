#!/usr/bin/env node
/**
 * No binary under art/ goes into plain git (lane 0.7l; docs/design/ASSETS.md 0.7; CLAUDE.md rule 7: a rule that
 * matters becomes a check). The game's art lives in Git LFS; a clone whose git-lfs is missing or not set up would add
 * a texture as a plain blob without a word, and the public repository would carry it in every clone forever.
 *
 * It reads the blobs git stores, never the files on disk: in a working tree (and in the pre-commit hook's snapshot,
 * written by `git checkout-index`) LFS files are smudged back to their binaries, so only the blob tells a pointer from
 * art committed by mistake. Two modes:
 * - `--staged`: the index (the pre-commit hook; `GIT_INDEX_FILE` is honoured, so `git commit -a` is checked too);
 * - `--tree <rev>`: a commit's tree (CI, on what was pushed, so a commit made with `--no-verify` is caught).
 *
 * Under art/, a path that an LFS pattern in `.gitattributes` covers must be an LFS pointer; any other file must not be
 * binary (a binary of a type no pattern covers is refused too, so a new format cannot slip in as plain git).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The first line of every Git LFS pointer (the LFS spec, v1). */
export const LFS_POINTER_HEAD = 'version https://git-lfs.github.com/spec/v1\n';
export const ART_ROOT = 'art/';

/** The path patterns `.gitattributes` sends to LFS (`filter=lfs`), in file order. */
export function lfsPatterns(gitattributes: string): string[] {
  const out: string[] = [];
  for (const raw of gitattributes.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const [pattern, ...attrs] = line.split(/\s+/);
    if (pattern !== undefined && attrs.includes('filter=lfs')) out.push(pattern);
  }
  return out;
}

/** A `.gitattributes` glob as a regular expression over a repository-relative path (`**`, `*` and `?`). */
export function globToRegExp(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i]!;
    if (ch === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        re += '(?:.*/)?';
        i += 2;
      } else {
        re += '.*';
        i += 1;
      }
    } else if (ch === '*') re += '[^/]*';
    else if (ch === '?') re += '[^/]';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export function coveredByLfs(path: string, patterns: readonly string[]): boolean {
  return patterns.some((p) => globToRegExp(p).test(path));
}

export function isLfsPointer(blob: Uint8Array): boolean {
  return Buffer.from(blob.subarray(0, LFS_POINTER_HEAD.length)).toString('utf8') === LFS_POINTER_HEAD;
}

/** Binary by git's own rule: a NUL byte in the first 8000 bytes. */
export function looksBinary(blob: Uint8Array): boolean {
  return blob.subarray(0, 8000).includes(0);
}

export interface ArtEntry {
  readonly path: string;
  readonly blob: Uint8Array;
}

/** Why each entry under art/ may not be committed as it is (empty when every binary is an LFS pointer). */
export function artProblems(entries: readonly ArtEntry[], patterns: readonly string[]): string[] {
  const problems: string[] = [];
  for (const e of entries) {
    if (!e.path.startsWith(ART_ROOT)) continue;
    if (coveredByLfs(e.path, patterns)) {
      if (!isLfsPointer(e.blob)) problems.push(`${e.path}: an LFS pattern covers it, but it would go into plain git (is git-lfs installed? run 'git lfs install --skip-repo', then 'git rm --cached ${e.path}' and add it again)`);
    } else if (looksBinary(e.blob)) {
      problems.push(`${e.path}: a binary under art/ that no LFS pattern covers (add its type to .gitattributes, as docs/design/ASSETS.md 0.7 lists)`);
    }
  }
  return problems;
}

const git = (root: string, args: readonly string[]): Buffer => execFileSync('git', args, { cwd: root, maxBuffer: 1024 * 1024 * 1024 });

/** `-z` output, split into records. */
const records = (out: Buffer): string[] => out.toString('utf8').split('\0').filter((r) => r.length > 0);

/** The index's entries under art/: `<mode> <sha> <stage>\t<path>`. */
export function stagedEntries(root: string): ArtEntry[] {
  return records(git(root, ['ls-files', '--stage', '-z', '--', ART_ROOT])).map((r) => {
    const [meta, path] = r.split('\t') as [string, string];
    return { path, blob: git(root, ['cat-file', 'blob', meta.split(' ')[1]!]) };
  });
}

/** A commit's entries under art/: `<mode> <type> <sha>\t<path>`. */
export function treeEntries(root: string, rev: string): ArtEntry[] {
  return records(git(root, ['ls-tree', '-r', '-z', rev, '--', ART_ROOT]))
    .map((r) => r.split('\t') as [string, string])
    .filter(([meta]) => meta.split(' ')[1] === 'blob')
    .map(([meta, path]) => ({ path, blob: git(root, ['cat-file', 'blob', meta.split(' ')[2]!]) }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const patterns = lfsPatterns(readFileSync(join(root, '.gitattributes'), 'utf8'));
  const at = args.indexOf('--tree');
  const entries = args.includes('--staged') ? stagedEntries(root) : at >= 0 && args[at + 1] !== undefined ? treeEntries(root, args[at + 1]!) : null;
  if (entries === null) {
    console.error('usage: lfs-check --staged | --tree <rev>');
    process.exit(2);
  }
  const problems = artProblems(entries, patterns);
  for (const p of problems) console.error(`lfs-check: ${p}`);
  if (problems.length > 0) process.exit(1);
  console.error(`lfs-check: ${entries.length.toString()} file(s) under art/, every binary an LFS pointer.`);
}
