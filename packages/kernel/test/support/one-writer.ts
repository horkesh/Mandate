/**
 * The one-writer scanner behind `one-writer.test.ts`. Pure functions over
 * source text, so the test can run them on the real packages and on a
 * deliberately broken fixture.
 *
 * Type-blind by design (TypeScript 7 has no stable compiler API yet): a write
 * is recognised by the owned property key, which is why owned keys must be
 * unique across all State records (see `ownership.ts`). Recognised writes:
 * `x.key = v` and every compound assignment, `x['key'] = v`, `++`/`--`,
 * `delete x.key`, mutating calls (`x.key.push(...)`, `.set(`, `.splice(` ...),
 * and spread updates (`{ ...x, key: v }` or `{ ...x, key }`). Not recognised:
 * writes through an alias (`const k = 'key'; x[k] = v`) and `Object.assign`,
 * which the banned-API test forbids in deterministic packages instead.
 */
import type { FieldLocation, OwnedField } from '../../src/ownership.ts';
import { stripComments, stripCommentsAndStrings } from './source.ts';

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

export interface StateRecord {
  readonly path: string;
  readonly record: string;
  readonly keys: readonly string[];
}

const KERNEL_SRC = 'packages/kernel/src/';

/** Whether a repo-relative file belongs to kernel module `module` (the file `module.ts` or the folder `module/`). */
export function isInModule(path: string, module: string): boolean {
  if (!path.startsWith(KERNEL_SRC)) return false;
  const rel = path.slice(KERNEL_SRC.length).replace(/\.ts$/, '');
  return rel === module || rel.startsWith(`${module}/`);
}

const ASSIGN_OP = String.raw`(?:\*\*|<<|>>>|>>|&&|\|\||\?\?|[-+*/%&|^])?=(?![=>])`;
const MUTATORS = 'push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin|set|delete|clear|add';

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineAt(code: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (code.charCodeAt(i) === 10) line++;
  return line;
}

/** Every place in `file` that writes property `key`, by the forms listed above. */
export function writeSites(file: SourceFile, key: string): WriteSite[] {
  const k = escape(key);
  const end = String.raw`(?![\w$])`;
  // Bracket writes need the string contents; everything else scans with strings emptied.
  const withStrings = stripComments(file.code);
  const code = stripCommentsAndStrings(file.code);
  const sites: WriteSite[] = [];
  const add = (text: string, pattern: RegExp, form: string) => {
    for (const m of text.matchAll(pattern)) sites.push({ path: file.path, line: lineAt(text, m.index), key, form });
  };
  add(code, new RegExp(String.raw`\.\s*${k}${end}\s*${ASSIGN_OP}`, 'g'), 'assignment');
  add(withStrings, new RegExp(String.raw`\[\s*(['"\x60])${k}\1\s*\]\s*${ASSIGN_OP}`, 'g'), 'bracket assignment');
  add(code, new RegExp(String.raw`\.\s*${k}${end}\s*(?:\+\+|--)`, 'g'), 'increment');
  add(code, new RegExp(String.raw`(?:\+\+|--)\s*[\w$.\[\]]*\.\s*${k}${end}`, 'g'), 'increment');
  add(code, new RegExp(String.raw`\bdelete\s+[\w$.\[\]?]*\.\s*${k}${end}`, 'g'), 'delete');
  add(code, new RegExp(String.raw`\.\s*${k}${end}\s*\.\s*(?:${MUTATORS})\s*\(`, 'g'), 'mutating call');
  sites.push(...spreadUpdates(file.path, code, key));
  return sites.sort((a, b) => a.line - b.line || (a.form < b.form ? -1 : a.form > b.form ? 1 : 0));
}

/**
 * Spread updates: an object literal that spreads something and sets `key`.
 * Peels brace groups innermost-first, so each literal is checked at its own
 * level and nested literals don't hide outer ones.
 */
function spreadUpdates(path: string, code: string, key: string): WriteSite[] {
  const sites: WriteSite[] = [];
  const property = new RegExp(String.raw`(?:^|[{,])\s*${escape(key)}\s*(?::|,|\}|$)`);
  let text = code;
  const innermost = /\{[^{}]*\}/g;
  for (;;) {
    let found = false;
    text = text.replace(innermost, (group: string, offset: number) => {
      found = true;
      if (group.includes('...') && property.test(group)) {
        sites.push({ path, line: lineAt(text, offset), key, form: 'spread update' });
      }
      // Keep the newlines so later line numbers stay right.
      return `0${group.replace(/[^\n]/g, '')}`;
    });
    if (!found) break;
  }
  return sites;
}

/** Writes to owned keys outside their writer module, and any write to an immutable key. */
export function writeViolations(
  files: readonly SourceFile[],
  owned: readonly { readonly key: string; readonly writer: string }[],
  immutableKeys: readonly string[],
): WriteViolation[] {
  const violations: WriteViolation[] = [];
  for (const file of files) {
    for (const { key, writer } of owned) {
      if (isInModule(file.path, writer)) continue;
      for (const site of writeSites(file, key)) violations.push({ ...site, writer });
    }
    for (const key of immutableKeys) {
      // Creating a record is not a write, and `{ ...template, id: newId() }`
      // is how records are created, so spread forms are allowed here; every
      // in-place change to an immutable key is a violation.
      for (const site of writeSites(file, key)) {
        if (site.form !== 'spread update') violations.push({ ...site, writer: 'nobody' });
      }
    }
  }
  return violations;
}

/** Interfaces and object type aliases named `...State`, with their top-level property keys. */
export function stateRecords(file: SourceFile): StateRecord[] {
  const code = stripCommentsAndStrings(file.code);
  const records: StateRecord[] = [];
  const head = /\b(?:interface\s+([A-Za-z_$][\w$]*State)\b[^{=;]*|type\s+([A-Za-z_$][\w$]*State)\s*(?:<[^=]*>)?\s*=\s*)\{/g;
  for (const m of code.matchAll(head)) {
    const open = m.index + m[0].length - 1;
    const close = matchingBrace(code, open);
    let body = code.slice(open + 1, close);
    // Flatten nested object types and parameter lists so only top-level keys remain.
    for (let prev = ''; prev !== body; ) {
      prev = body;
      body = body.replace(/\{[^{}]*\}/g, '0').replace(/\([^()]*\)/g, '0');
    }
    const keys = [...body.matchAll(/(?:^|[;,\n])\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\??\s*:/g)].map((k) => k[1]!);
    records.push({ path: file.path, record: (m[1] ?? m[2])!, keys });
  }
  return records;
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
