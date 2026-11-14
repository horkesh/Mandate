/**
 * Helpers for the architecture tests that read source text: walking packages,
 * and stripping comments (and optionally string contents) so a scan sees code.
 *
 * The stripper is a small lexer, not a parser: it understands line and block
 * comments, quoted strings and template literals (with `${...}` nesting). It
 * does not recognise regular-expression literals, so a regex containing a
 * quote or `//` can confuse it; kernel code keeps such regexes out of `src`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));

/** A repo-relative path with forward slashes, the same on every OS. */
export function repoPath(absolute: string): string {
  return relative(REPO_ROOT, absolute).split(sep).join('/');
}

/** Every `.ts` file under `dir`, sorted, skipping `node_modules`. */
export function tsFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : tsFiles(path);
      return entry.name.endsWith('.ts') ? [path] : [];
    })
    .sort();
}

export interface PackageInfo {
  /** Folder name under `packages/`. */
  readonly dir: string;
  readonly name: string;
  readonly root: string;
  readonly manifest: Record<string, unknown>;
}

/** Every workspace package under `packages/`, in folder order. */
export function workspacePackages(): PackageInfo[] {
  const packagesDir = join(REPO_ROOT, 'packages');
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(packagesDir, d.name, 'package.json')))
    .map((d) => d.name)
    .sort()
    .map((dir) => {
      const root = join(packagesDir, dir);
      const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, unknown>;
      return { dir, name: String(manifest.name), root, manifest };
    });
}

/** Source with comments removed. String and template contents are kept. */
export function stripComments(code: string): string {
  return lex(code, false);
}

/** Source with comments removed and every string and template literal emptied (`''`, `""`, ``` `` ```). */
export function stripCommentsAndStrings(code: string): string {
  return lex(code, true);
}

function lex(code: string, emptyStrings: boolean): string {
  let out = '';
  let i = 0;
  // Stack of brace depths at which an enclosing template literal resumes.
  const templateResume: number[] = [];
  let braceDepth = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i]!;
    const next = code[i + 1];
    if (c === '/' && next === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      // Keep newlines so line numbers survive.
      out += code.slice(i, stop).replace(/[^\n]/g, '');
      i = stop;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < n && code[j] !== c && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
      out += emptyStrings ? c + c : code.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === '`' || (c === '}' && templateResume.length > 0 && templateResume[templateResume.length - 1] === braceDepth)) {
      // Template literal text, from a backtick or from the `}` closing a `${`.
      if (c === '}') templateResume.pop();
      let j = i + 1;
      let text = '';
      for (;;) {
        if (j >= n) break;
        const d = code[j]!;
        if (d === '\\') {
          text += code.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (d === '`') {
          j++;
          break;
        }
        if (d === '$' && code[j + 1] === '{') {
          templateResume.push(braceDepth);
          j += 2;
          break;
        }
        text += d;
        j++;
      }
      const closedByBacktick = code[j - 1] === '`';
      const opener = c === '`' ? '`' : '}';
      const closer = closedByBacktick ? '`' : '${';
      out += opener + (emptyStrings ? text.replace(/[^\n]/g, '') : text) + closer;
      i = j;
      continue;
    }
    if (c === '{') braceDepth++;
    if (c === '}') braceDepth--;
    out += c;
    i++;
  }
  return out;
}
