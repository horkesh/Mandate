/**
 * The one-writer scanner behind `one-writer.test.ts`. Pure functions over
 * source text, so the test can run them on the real packages and on a
 * deliberately broken fixture.
 *
 * Type-blind by design (TypeScript 7 has no stable compiler API yet): a write
 * is recognised by the owned property key, which is why owned keys must be
 * unique across all State records (see `ownership.ts`). A write is any of
 * these on `x.key`, including through `!` and through index or member chains
 * below it (`x.key[id] = v`, `x.key![i].y += v`):
 * - assignment and every compound assignment; `x['key'] = v`;
 * - `++` / `--`, prefix or postfix; `delete`;
 * - a mutating call (`.push(`, `.set(`, `.splice(` ...);
 * - a destructuring assignment target (`[x.key] = ...`, `({ a: x.key } = ...)`);
 * - a spread update (`{ ...x, key: v }` or `{ ...x, key }`).
 * Not recognised: writes through an alias (`const c = x.key; c.push(v)`) and
 * `Object.assign`, which the banned-API test forbids instead.
 *
 * Each file is lexed once (`lexSource`); a file the lexer cannot read is
 * reported, never skipped.
 */
import type { FieldLocation, OwnedField } from '../../src/ownership.ts';
import { lexSource, LexerError, type LexedSource } from './source.ts';

export interface SourceFile {
  /** Repo-relative, forward slashes. */
  readonly path: string;
  readonly code: string;
}

export interface WriteSite {
  readonly path: string;
  readonly line: number;
  readonly key: string;
  readonly form: string;
}

export interface WriteViolation extends WriteSite {
  /** Who may write this key: a module name, or `nobody` for an immutable key. */
  readonly writer: string;
}

export interface TypeRecord {
  readonly path: string;
  readonly record: string;
  readonly keys: readonly string[];
  /** Capitalised type names mentioned in its body, for reachability. */
  readonly mentions: readonly string[];
}

export type StateRecord = TypeRecord;

const KERNEL_SRC = 'packages/kernel/src/';

/** Whether a repo-relative file belongs to kernel module `module` (the file `module.ts` or the folder `module/`). */
export function isInModule(path: string, module: string): boolean {
  if (!path.startsWith(KERNEL_SRC)) return false;
  const rel = path.slice(KERNEL_SRC.length).replace(/\.ts$/, '');
  return rel === module || rel.startsWith(`${module}/`);
}

const ASSIGN_OP = String.raw`(?:\*\*|<<|>>>|>>|&&|\|\||\?\?|[-+*/%&|^])?=(?![=>])`;
const MUTATORS = 'push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin|set|delete|clear|add';
/** One index, allowing one level of nested brackets: `[id]`, `[ids[0]]`. */
const INDEX = String.raw`\[(?:[^\[\]]|\[[^\[\]]*\])*\]`;
/** What may follow the key and still be inside the owned field: `!`, an index, a member. */
const TAIL = String.raw`(?:\s*!|\s*${INDEX}|\s*\.\s*[\w$]+)*`;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface KeyPatterns {
  readonly key: string;
  readonly forms: readonly { readonly pattern: RegExp; readonly form: string; readonly view: 'code' | 'withStrings' }[];
  readonly target: RegExp;
  readonly property: RegExp;
}

/** Compile a key's patterns once, for every file. */
function patternsFor(key: string): KeyPatterns {
  const k = escape(key);
  const at = String.raw`\.\s*${k}(?![\w$])`;
  const path = `${at}${TAIL}`;
  return {
    key,
    forms: [
      { pattern: new RegExp(String.raw`${path}\s*${ASSIGN_OP}`, 'g'), form: 'assignment', view: 'code' },
      { pattern: new RegExp(String.raw`\[\s*(['"\x60])${k}\1\s*\]${TAIL}\s*${ASSIGN_OP}`, 'g'), form: 'bracket assignment', view: 'withStrings' },
      { pattern: new RegExp(String.raw`${path}\s*(?:\+\+|--)`, 'g'), form: 'increment', view: 'code' },
      { pattern: new RegExp(String.raw`(?:\+\+|--)\s*[\w$.\[\]!]*${at}`, 'g'), form: 'increment', view: 'code' },
      { pattern: new RegExp(String.raw`\bdelete\s+[\w$.\[\]?!]*${at}`, 'g'), form: 'delete', view: 'code' },
      { pattern: new RegExp(String.raw`${path}\s*\.\s*(?:${MUTATORS})\s*\(`, 'g'), form: 'mutating call', view: 'code' },
    ],
    target: new RegExp(at),
    property: new RegExp(String.raw`(?:^|[{,])\s*${k}\s*(?::|,|\}|$)`),
  };
}

/** A lexed file plus the groups every key is tested against, computed once per file. */
interface FileIndex {
  readonly path: string;
  readonly lexed: LexedSource;
  /** Destructuring assignment patterns: `[ ... ] =` and `{ ... } =`. */
  readonly patterns: readonly { readonly offset: number; readonly text: string }[];
  /** Object literals (at their own nesting level) that contain a spread. */
  readonly spreads: readonly { readonly offset: number; readonly text: string }[];
}

function indexFile(path: string, lexed: LexedSource): FileIndex {
  return { path, lexed, patterns: destructuringPatterns(lexed.code), spreads: spreadGroups(lexed.code) };
}

/** Every write to `key` in one indexed file. */
function sitesIn(file: FileIndex, p: KeyPatterns): WriteSite[] {
  const { path, lexed } = file;
  // Most keys never appear in most files: skip them without running the patterns.
  if (!lexed.withStrings.includes(p.key)) return [];
  const sites: WriteSite[] = [];
  for (const { pattern, form, view } of p.forms) {
    for (const m of lexed[view].matchAll(pattern)) sites.push({ path, line: lexed.lineOf(m.index), key: p.key, form });
  }
  for (const g of file.patterns) if (p.target.test(g.text)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'destructuring assignment' });
  for (const g of file.spreads) if (p.property.test(g.text)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'spread update' });
  return sites.sort((a, b) => a.line - b.line || (a.form < b.form ? -1 : a.form > b.form ? 1 : 0));
}

/** Every place in `file` that writes property `key`. Throws `LexerError` if the file cannot be lexed. */
export function writeSites(file: SourceFile, key: string): WriteSite[] {
  return sitesIn(indexFile(file.path, lexSource(file.code)), patternsFor(key));
}

/** `[ ... ]` or `{ ... }` groups that are assigned to (`] =`, `} =`): destructuring patterns. */
function destructuringPatterns(code: string): { offset: number; text: string }[] {
  const out: { offset: number; text: string }[] = [];
  for (const m of code.matchAll(/[\]}](?=\s*=(?![=>]))/g)) {
    const close = m.index;
    const open = matchingOpen(code, close);
    if (open === -1) continue;
    // `x[i] = v` is an index write, not a pattern: a pattern's opening
    // bracket never follows an identifier, `)`, `]` or `!`.
    const before = /\S(?=\s*$)/.exec(code.slice(Math.max(0, open - 200), open))?.[0] ?? '';
    if (/[\w$)\]!]/.test(before)) continue;
    out.push({ offset: open, text: code.slice(open, close + 1) });
  }
  return out;
}

function matchingOpen(code: string, close: number): number {
  let depth = 0;
  for (let i = close; i >= 0; i--) {
    const c = code[i];
    if (c === ']' || c === '}' || c === ')') depth++;
    else if ((c === '[' || c === '{' || c === '(') && --depth === 0) return i;
  }
  return -1;
}

/**
 * Spread updates: an object literal that spreads something and sets the key.
 * Peels brace groups innermost-first, replacing each with blanks of the same
 * length, so offsets stay true and nested literals don't hide outer ones.
 */
function spreadGroups(code: string): { offset: number; text: string }[] {
  const out: { offset: number; text: string }[] = [];
  let text = code;
  const innermost = /\{[^{}]*\}/g;
  for (;;) {
    let found = false;
    text = text.replace(innermost, (group: string, offset: number) => {
      found = true;
      if (group.includes('...')) out.push({ offset, text: group });
      return `0${group.slice(1).replace(/[^\n]/g, ' ')}`;
    });
    if (!found) break;
  }
  return out;
}

/** Writes to owned keys outside their writer module, any in-place write to an immutable key, and files the lexer cannot read. */
export function writeViolations(
  files: readonly SourceFile[],
  owned: readonly { readonly key: string; readonly writer: string }[],
  immutableKeys: readonly string[],
): WriteViolation[] {
  const ownedPatterns = owned.map((o) => ({ writer: o.writer, p: patternsFor(o.key) }));
  const immutablePatterns = immutableKeys.map(patternsFor);
  const violations: WriteViolation[] = [];
  for (const file of files) {
    let index: FileIndex;
    try {
      index = indexFile(file.path, lexSource(file.code));
    } catch (e) {
      if (!(e instanceof LexerError)) throw e;
      violations.push({ path: file.path, line: e.line, key: '-', form: e.message, writer: '-' });
      continue;
    }
    for (const { writer, p } of ownedPatterns) {
      if (isInModule(file.path, writer)) continue;
      for (const site of sitesIn(index, p)) violations.push({ ...site, writer });
    }
    for (const p of immutablePatterns) {
      // Creating a record is not a write, and `{ ...template, id: newId() }`
      // is how records are created, so spread forms are allowed here; every
      // in-place change to an immutable key is a violation.
      for (const site of sitesIn(index, p)) {
        if (site.form !== 'spread update') violations.push({ ...site, writer: 'nobody' });
      }
    }
  }
  return violations;
}

/** Every interface and object type alias in a file, with its top-level keys and the type names it mentions. */
export function typeRecords(file: SourceFile): TypeRecord[] {
  const code = lexSource(file.code).code;
  const records: TypeRecord[] = [];
  const head = /\b(?:interface\s+([A-Za-z_$][\w$]*)\b[^{=;]*|type\s+([A-Za-z_$][\w$]*)\s*(?:<[^=]*>)?\s*=\s*)\{/g;
  for (const m of code.matchAll(head)) {
    const open = m.index + m[0].length - 1;
    const close = matchingBrace(code, open);
    const raw = code.slice(open + 1, close);
    let body = raw;
    // Flatten nested object types and parameter lists so only top-level keys remain.
    for (let prev = ''; prev !== body; ) {
      prev = body;
      body = body.replace(/\{[^{}]*\}/g, '0').replace(/\([^()]*\)/g, '0');
    }
    const keys = [...body.matchAll(/(?:^|[;,\n])\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\??\s*:/g)].map((k) => k[1]!);
    const mentions = [...new Set([...raw.matchAll(/\b[A-Z][\w$]*\b/g)].map((t) => t[0]))].sort();
    records.push({ path: file.path, record: (m[1] ?? m[2])!, keys, mentions });
  }
  return records;
}

/**
 * State records: every record named `State` or `...State`, plus every record
 * reachable by name from a root record named exactly `State` (its fields are
 * State too, whatever the type is called).
 */
export function stateRecords(files: readonly SourceFile[]): StateRecord[] {
  const all = files.flatMap(typeRecords);
  const byName = new Map<string, TypeRecord[]>();
  for (const r of all) byName.set(r.record, [...(byName.get(r.record) ?? []), r]);
  const chosen = new Set<TypeRecord>(all.filter((r) => /State$/.test(r.record)));
  const queue = [...(byName.get('State') ?? [])];
  while (queue.length > 0) {
    const r = queue.pop()!;
    for (const name of r.mentions) {
      for (const next of byName.get(name) ?? []) {
        if (!chosen.has(next)) {
          chosen.add(next);
          queue.push(next);
        }
      }
    }
  }
  return all.filter((r) => chosen.has(r));
}

function matchingBrace(code: string, open: number): number {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}' && --depth === 0) return i;
  }
  throw new Error(`unbalanced braces after offset ${open}`);
}

/** Owned (key, writer) pairs from the table's built fields. */
export function ownedKeys(fields: readonly OwnedField[]): { key: string; writer: string; field: string; record: string }[] {
  return fields.flatMap((f) => f.code.map((loc: FieldLocation) => ({ key: loc.key, writer: f.writer, field: f.field, record: loc.record })));
}

/**
 * Problems with the classification of State records against the table:
 * unclassified properties, table entries pointing at nothing, keys owned twice.
 */
export function classificationProblems(
  records: readonly StateRecord[],
  fields: readonly OwnedField[],
  immutableKeys: readonly string[],
  legacy: readonly { readonly file: string; readonly record: string }[],
): string[] {
  const problems: string[] = [];
  const owned = ownedKeys(fields);
  const isLegacy = (r: StateRecord) => legacy.some((l) => l.file === r.path && l.record === r.record);

  const byKey = new Map<string, string[]>();
  for (const o of owned) byKey.set(o.key, [...(byKey.get(o.key) ?? []), `${o.record} (${o.writer})`]);
  for (const [key, claims] of [...byKey].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (claims.length > 1) problems.push(`owned key "${key}" is claimed ${claims.length} times: ${claims.join(', ')}; owned keys must be unique`);
    if (immutableKeys.includes(key)) problems.push(`key "${key}" is both owned and immutable`);
  }

  for (const r of records) {
    if (isLegacy(r)) continue;
    for (const key of r.keys) {
      if (immutableKeys.includes(key)) continue;
      if (!owned.some((o) => o.record === r.record && o.key === key)) {
        problems.push(`${r.path}: ${r.record}.${key} has no writer in OWNED_FIELDS (packages/kernel/src/ownership.ts)`);
      }
    }
  }

  for (const o of owned) {
    if (!records.some((r) => r.record === o.record && r.keys.includes(o.key))) {
      problems.push(`OWNED_FIELDS "${o.field}" points at ${o.record}.${o.key}, which no State record declares`);
    }
  }

  for (const l of legacy) {
    if (!records.some((r) => r.path === l.file && r.record === l.record)) {
      problems.push(`LEGACY_STATE_RECORDS names ${l.file} ${l.record}, which no longer exists; remove the entry`);
    }
  }
  return problems;
}
