/**
 * Helpers for the architecture tests that read source text: walking packages,
 * and lexing source so a scan sees code, not comments, strings or regexes.
 *
 * The lexer is small, not a parser. It understands line and block comments,
 * quoted strings, template literals (with `${...}` nesting) and regular
 * expression literals. A `/` starts a regex when the previous significant
 * token is an operator or punctuator other than `)`, `]` and `}`, one of the
 * keywords that precede an expression, or the start of the file; otherwise it
 * is division. It fails closed: if a quoted string or a regex meets a newline,
 * or the file ends inside a string, template, regex or comment, it throws
 * `LexerError` ("lexer lost sync at line N") instead of letting a scan pass
 * over code it misread.
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
  return allFiles(dir).filter((f) => f.endsWith('.ts'));
}

/** Every file under `dir`, of any extension, sorted, skipping `node_modules`. */
export function allFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : allFiles(path);
      return [path];
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

export class LexerError extends Error {
  constructor(
    readonly line: number,
    detail: string,
  ) {
    super(`lexer lost sync at line ${line}: ${detail}`);
    this.name = 'LexerError';
  }
}

/** One file, lexed once: two views of its code, both the same length as the source, and a line lookup. */
export interface LexedSource {
  /** Comments blanked; strings, templates and regexes kept verbatim. */
  readonly withStrings: string;
  /** Comments blanked, and the contents of strings, templates and regexes blanked too. */
  readonly code: string;
  /** 1-based line of a character offset (the same in both views). */
  lineOf(index: number): number;
}

/** Lex a file once. Throws `LexerError` if the lexer loses sync. */
export function lexSource(source: string): LexedSource {
  const { withStrings, code } = lex(source);
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source.charCodeAt(i) === 10) starts.push(i + 1);
  const lineOf = (index: number) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid]! <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  return { withStrings, code, lineOf };
}

/** Source with comments removed. String, template and regex contents are kept. */
export function stripComments(code: string): string {
  return lex(code).withStrings;
}

/** Source with comments removed and every string, template and regex body blanked. */
export function stripCommentsAndStrings(code: string): string {
  return lex(code).code;
}

/** Keywords after which a `/` begins an expression (a regex), not a division. */
const REGEX_AFTER_KEYWORD: ReadonlySet<string> = new Set([
  'return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'instanceof', 'do', 'else', 'yield', 'await',
]);

type Prev = { readonly kind: 'start' | 'value' | 'punct'; readonly text: string };

/**
 * The lexer. Blanked characters become spaces (newlines are kept), so offsets
 * and line numbers in the views match the source.
 */
function lex(src: string): { withStrings: string; code: string } {
  const keep: string[] = [];
  const blank: string[] = [];
  const n = src.length;
  let i = 0;
  let line = 1;
  let prev: Prev = { kind: 'start', text: '' };
  // Brace depths at which an enclosing template literal resumes after `${...}`.
  const templateResume: number[] = [];
  let braceDepth = 0;

  /** Emit src[from, to): `kept` controls the code view; the withStrings view keeps `literal` text verbatim. */
  const emit = (from: number, to: number, mode: 'code' | 'comment' | 'literal-body') => {
    for (let j = from; j < to; j++) {
      const ch = src[j]!;
      if (ch === '\n') line++;
      const space = ch === '\n' ? '\n' : ch === '\r' ? '\r' : ' ';
      keep.push(mode === 'comment' ? space : ch);
      blank.push(mode === 'code' ? ch : space);
    }
  };

  const regexAllowed = () =>
    prev.kind === 'start' ||
    (prev.kind === 'punct' && prev.text !== ')' && prev.text !== ']' && prev.text !== '}') ||
    (prev.kind === 'value' && REGEX_AFTER_KEYWORD.has(prev.text));

  /** Scan template text from `start` (just after a backtick or a resuming `}`) to its end; returns the index after it. */
  const templateText = (start: number): number => {
    let j = start;
    for (;;) {
      if (j >= n) throw new LexerError(line, 'file ends inside a template literal');
      const d = src[j]!;
      if (d === '\\') {
        emit(j, Math.min(j + 2, n), 'literal-body');
        j += 2;
        continue;
      }
      if (d === '`') {
        emit(j, j + 1, 'code');
        prev = { kind: 'value', text: '`' };
        return j + 1;
      }
      if (d === '$' && src[j + 1] === '{') {
        emit(j, j + 2, 'code');
        templateResume.push(braceDepth);
        prev = { kind: 'punct', text: '{' };
        return j + 2;
      }
      emit(j, j + 1, 'literal-body');
      j++;
    }
  };

  while (i < n) {
    const c = src[i]!;
    const next = src[i + 1];

    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v' || c === '﻿') {
      emit(i, i + 1, 'code');
      i++;
      continue;
    }
    if (c === '/' && next === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      emit(i, j, 'comment');
      i = j;
      continue;
    }
    if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) throw new LexerError(line, 'file ends inside a block comment');
      emit(i, end + 2, 'comment');
      i = end + 2;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      for (;;) {
        if (j >= n) throw new LexerError(line, 'file ends inside a string');
        const d = src[j]!;
        if (d === '\n') throw new LexerError(line, 'a quoted string meets a newline');
        if (d === '\\') {
          j += src[j + 1] === '\r' && src[j + 2] === '\n' ? 3 : 2;
          continue;
        }
        if (d === c) break;
        j++;
      }
      emit(i, i + 1, 'code');
      emit(i + 1, j, 'literal-body');
      emit(j, j + 1, 'code');
      prev = { kind: 'value', text: c };
      i = j + 1;
      continue;
    }
    if (c === '`') {
      emit(i, i + 1, 'code');
      i = templateText(i + 1);
      continue;
    }
    if (c === '}' && templateResume.length > 0 && templateResume[templateResume.length - 1] === braceDepth) {
      templateResume.pop();
      emit(i, i + 1, 'code');
      i = templateText(i + 1);
      continue;
    }
    if (c === '/' && regexAllowed()) {
      let j = i + 1;
      let inClass = false;
      for (;;) {
        if (j >= n) throw new LexerError(line, 'file ends inside a regex literal');
        const d = src[j]!;
        if (d === '\n' || d === '\r') throw new LexerError(line, 'a regex literal meets a newline');
        if (d === '\\') {
          j += 2;
          continue;
        }
        if (d === '[') inClass = true;
        else if (d === ']') inClass = false;
        else if (d === '/' && !inClass) break;
        j++;
      }
      let end = j + 1;
      while (end < n && /[A-Za-z]/.test(src[end]!)) end++;
      emit(i, i + 1, 'code');
      emit(i + 1, j, 'literal-body');
      emit(j, end, 'code');
      prev = { kind: 'value', text: '/regex/' };
      i = end;
      continue;
    }
    if (/[A-Za-z_$\u0080-￿]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w$\u0080-￿]/.test(src[j]!)) j++;
      emit(i, j, 'code');
      prev = { kind: 'value', text: src.slice(i, j) };
      i = j;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && next !== undefined && /[0-9]/.test(next))) {
      let j = i + 1;
      while (j < n && /[\w.]/.test(src[j]!)) j++;
      emit(i, j, 'code');
      prev = { kind: 'value', text: '0' };
      i = j;
      continue;
    }
    if (c === '{') braceDepth++;
    if (c === '}') braceDepth--;
    emit(i, i + 1, 'code');
    prev = { kind: 'punct', text: c };
    i++;
  }
  return { withStrings: keep.join(''), code: blank.join('') };
}
