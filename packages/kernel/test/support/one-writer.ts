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
 * - `++` / `--`, prefix or postfix; `delete`, including `delete (x as T).key`
 *   and `delete x['key']`;
 * - a mutating call (`.push(`, `.set(`, `.splice(` ...), also by optional
 *   chaining (`x.key?.push(v)`);
 * - a mutator borrowed for the key (`Array.prototype.push.call(x.key, v)`) and
 *   a reflective write with the key as its target (`Object.assign(x.key, ...)`,
 *   `Reflect.set(x.key, ...)`) or named as a string argument
 *   (`Reflect.set(x, 'key', v)`, `Object.defineProperty(x, 'key', d)`,
 *   `Reflect.deleteProperty(x, 'key')`);
 * - a write through a parenthesised target that mentions the key: a cast
 *   (`(x.key as T)['k'] = v`), a comma expression (`(0, x.key).push(v)`), a
 *   conditional (`(c ? x.key : y).push(v)`);
 * - a destructuring assignment target (`[x.key] = ...`, `({ a: x.key } = ...)`)
 *   and a `for` loop's target (`for (x.key of items)`, `for (x.key in obj)`);
 * - a spread update (`{ ...x, key: v }` or `{ ...x, key }`);
 * - a write through a local bound to the key (`const c = x.key; c.push(v)`,
 *   `c[id] = v`; see `localAliasWrites`).
 * Not recognised: writes through a destructured binding (`const { key } = x`),
 * a parameter, a value passed further, or a call after the key/alias. Without
 * types `.get(id)!.push(f)` cannot be distinguished from a method returning
 * a copy: do not guess that a call preserves identity. The test-time deep
 * freeze (`tick/freeze.ts`) catches in-place writes through these escapes.
 * Map/Set contents escape Object.freeze; `state-data.test.ts` walks starting
 * and 30-day States for every real pack at peace/war and rejects them and
 * class instances. Only plain objects, arrays and primitives may enter State.
 * Local alias tracking is lexical, not scope/type analysis: shadowed names
 * and a later rebinding remain conservative matches, as before. Bindings
 * separated by commas and dynamic property names are not followed; freeze
 * is their backstop too.
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
/** What may follow the key and still be inside the owned field: `!`, an index, a member, each optionally chained with `?.`. */
const TAIL = String.raw`(?:\s*!|\s*(?:\?\.)?${INDEX}|\s*\??\.\s*[\w$]+)*`;
/** The characters a receiver or argument path may use between an operator and the key: names, members, indexes, `!`, `?`, parentheses and quotes. */
const PATH_CHARS = String.raw`[\w$.\[\]!?\s()'"\x60]*?`;
/** The functions that mutate their first argument, or whatever `this` they are called with. */
const REFLECTIVE = String.raw`(?:Object\s*\.\s*(?:assign|defineProperty|defineProperties|setPrototypeOf)|Reflect\s*\.\s*(?:set|defineProperty|deleteProperty|setPrototypeOf|apply))`;

/** The reflective writes that take the target's key as a string: `Reflect.set(x, 'key', v)`, `Object.defineProperty(x, 'key', d)`. */
const KEYED_REFLECTIVE = String.raw`(?:Reflect\s*\.\s*(?:set|defineProperty|deleteProperty)|Object\s*\.\s*defineProperty)`;

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface KeyPatterns {
  readonly key: string;
  readonly forms: readonly { readonly pattern: RegExp; readonly form: string; readonly view: 'code' | 'withStrings' }[];
  readonly target: RegExp;
  /** `x['key']`, tested against text with strings kept. */
  readonly bracket: RegExp;
  readonly property: RegExp;
}

/** Compile a key's patterns once, for every file. */
function patternsFor(key: string): KeyPatterns {
  const k = escape(key);
  // The two ways to name a key: `x.key` (found in the code view, where string contents are blanked) and `x['key']`
  // (found with strings kept). Every write form is built for both.
  const dot = String.raw`\.\s*${k}(?![\w$])`;
  const brk = String.raw`\[\s*(?:'${k}'|"${k}"|\x60${k}\x60)\s*\]`;
  const forms: { pattern: RegExp; form: string; view: 'code' | 'withStrings' }[] = [];
  const both = (dotted: string, bracketed: string, build: (ref: string) => string) => {
    forms.push({ pattern: new RegExp(build(dot), 'g'), form: dotted, view: 'code' });
    forms.push({ pattern: new RegExp(build(brk), 'g'), form: bracketed, view: 'withStrings' });
  };
  both('assignment', 'bracket assignment', (ref) => String.raw`${ref}${TAIL}\s*${ASSIGN_OP}`);
  both('increment', 'bracket increment', (ref) => String.raw`${ref}${TAIL}\s*(?:\+\+|--)`);
  // A prefix `++` or `--` sits where no operand ends before it; `n-- ) x.key` is not one.
  both('increment', 'bracket increment', (ref) => String.raw`(?<![\w$)\]]\s*)(?:\+\+|--)\s*${PATH_CHARS}${ref}`);
  both('delete', 'bracket delete', (ref) => String.raw`\bdelete\b[^;{}\n]*?${ref}`);
  both('mutating call', 'bracket mutating call', (ref) => String.raw`${ref}${TAIL}\s*\??\.\s*(?:${MUTATORS})\s*\(`);
  // `for (x.key of items)` and `for (x.key in obj)` assign the key on every pass.
  both('loop target', 'bracket loop target', (ref) => String.raw`\bfor\s*(?:await\s*)?\(\s*[\w$.\[\]!?]*?${ref}${TAIL}\s+(?:of|in)\b`);
  // `Array.prototype.push.call(x.key, v)`, `[].splice.apply(x.key, args)`: a mutator borrowed for the key.
  both('borrowed mutator', 'bracket borrowed mutator', (ref) => String.raw`\.\s*(?:${MUTATORS})\s*\.\s*(?:call|apply|bind)\s*\(\s*${PATH_CHARS}${ref}`);
  // `Object.assign(x.key, ...)`, `Reflect.set(x.key, ...)`: the key's value is the first argument.
  both('reflective write', 'bracket reflective write', (ref) => String.raw`\b${REFLECTIVE}\s*\(\s*${PATH_CHARS}${ref}`);
  // `Reflect.set(x, 'key', v)`, `Object.defineProperty(x, 'key', d)`, `Reflect.deleteProperty(x, 'key')`: the key as a
  // string argument (the natural spelling of a reflective write). Needs the strings, so only the withStrings view.
  forms.push({
    pattern: new RegExp(String.raw`\b${KEYED_REFLECTIVE}\s*\([^;]*?,\s*(?:'${k}'|"${k}"|\x60${k}\x60)\s*[,)]`, 'g'),
    form: 'reflective write by name',
    view: 'withStrings',
  });
  return {
    key,
    forms,
    target: new RegExp(dot),
    bracket: new RegExp(brk),
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
  /** Brace groups (at their own nesting level) with no spread that are not destructuring targets: literals built whole. */
  readonly literals: readonly { readonly offset: number; readonly text: string }[];
  /** Grouping parentheses that something is written through: `(x.key as T).push(v)`, `delete (x.key)`. */
  readonly writeParens: readonly ParenGroup[];
}

interface ParenGroup {
  readonly offset: number;
  /** The group in the code view (strings blanked) and with strings kept. */
  readonly code: string;
  readonly strings: string;
}

function indexFile(path: string, lexed: LexedSource): FileIndex {
  const groups = braceGroups(lexed.code);
  return {
    path,
    lexed,
    writeParens: writeParenGroups(lexed),
    patterns: destructuringPatterns(lexed.code),
    spreads: groups.filter((g) => g.text.includes('...')),
    literals: groups.filter((g) => !g.text.includes('...') && !/^\s*=(?![=>])/.test(lexed.code.slice(g.offset + g.length))),
  };
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
  for (const g of file.writeParens) if (p.target.test(g.code) || p.bracket.test(g.strings)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'write through a parenthesised target' });
  for (const g of file.patterns) if (p.target.test(g.text)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'destructuring assignment' });
  for (const g of file.spreads) if (p.property.test(g.text)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'spread update' });
  for (const g of file.literals) if (p.property.test(g.text)) sites.push({ path, line: lexed.lineOf(g.offset), key: p.key, form: 'object literal' });
  for (const s of localAliasWrites(lexed, p, file.writeParens)) sites.push({ path, line: s.line, key: p.key, form: 'write through a local alias' });
  return sites.sort((a, b) => a.line - b.line || (a.form < b.form ? -1 : a.form > b.form ? 1 : 0));
}

/** One or more index, member or `!` steps: the alias is written into, not rebound. */
const TAIL_STEP = String.raw`(?:\s*!|\s*(?:\?\.)?${INDEX}|\s*\??\.\s*[\w$]+)+`;

/**
 * Writes through a local bound to the key's value: `const c = x.key; c.push(v)`,
 * `c[id] = v`, `c.y += v`, `delete c[id]`, `Object.assign(c, ...)`. The binding
 * must be the key itself or an index or member below it (`x.key[id]`), not a
 * copy (`[...x.key]`, `x.key.slice()`): the right side ends at the key's tail,
 * which may sit in parentheses (but not in a call: `Object.keys(x.key)` is a
 * copy), be reached through a receiver with its own balanced groups (`(x as T).key`,
 * `current().key`, `xs[pick(i)].key`), carry a cast, default with `?? {}`, `?? []` or a
 * name, or be one arm of a conditional. A write through a parenthesised group
 * that mentions the local (`(c as T[]).push(v)`, a cast at the write) counts too.
 * A use is any later mention of the name in the file, so a shadowing local of
 * the same name is flagged too; as with parenthesised targets, that is paid by
 * renaming. Destructured bindings (`const { key } = x`) and parameters are not
 * followed; the test-time freeze (`tick/freeze.ts`) remains their backstop.
 */
/** Split only expression-level operators, never calls, indexes or literal bodies. */
function expressionParts(text: string): string[] {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (depth === 0) {
      if (/^\s+(?:as|satisfies)\s+/.test(text.slice(i))) return [text.slice(0, i)];
      if (text.slice(i, i + 2) === '??' || text.slice(i, i + 2) === '||') return [text.slice(0, i), ...expressionParts(text.slice(i + 2))];
      if (c === '?' && text[i + 1] !== '.' && text[i - 1] !== '?') {
        let nested = 0;
        let groups = 0;
        for (let j = i + 1; j < text.length; j++) {
          const d = text[j]!;
          if ('([{'.includes(d)) groups++;
          else if (')]}'.includes(d)) groups--;
          else if (groups === 0) {
            if (d === '?' && text[j + 1] !== '?' && text[j + 1] !== '.' && text[j - 1] !== '?') nested++;
            if (d === ':' && nested-- === 0) return [text.slice(i + 1, j), text.slice(j + 1)];
          }
        }
      }
    }
  }
  return [text];
}

function balanced(text: string): boolean {
  const stack: string[] = [];
  for (const c of text) {
    if ('([{'.includes(c)) stack.push(c);
    else if (')]}'.includes(c) && stack.pop() !== ({ ')': '(', ']': '[', '}': '{' } as Record<string, string>)[c]) return false;
  }
  return stack.length === 0;
}

function aliasesExpression(text: string, p: KeyPatterns, names: ReadonlySet<string>): boolean {
  text = text.trim();
  while (text.startsWith('(') && text.endsWith(')') && balanced(text.slice(1, -1))) text = text.slice(1, -1).trim();
  const parts = expressionParts(text);
  if (parts.length !== 1 || parts[0] !== text) return parts.some(part => aliasesExpression(part, p, names));
  // The key must end a reference, not be an argument of a surrounding call
  // or part of a new literal. Receiver calls such as current().key are fine.
  const ref = new RegExp(String.raw`(?:\.\s*${escape(p.key)}(?![\w$])|\[\s*(?:'${escape(p.key)}'|"${escape(p.key)}"|\x60${escape(p.key)}\x60)\s*\])${TAIL}\s*$`);
  const match = ref.exec(text);
  if (match && balanced(text.slice(0, match.index)) && !/[{},;=]/.test(text.slice(0, match.index).replace(/\([^()]*\)|\[[^\[\]]*\]/g, ''))) return true;
  for (const name of names) if (new RegExp(String.raw`^${escape(name)}${TAIL}\s*$`).test(text)) return true;
  return false;
}

function localAliasWrites(lexed: LexedSource, p: KeyPatterns, writeParens: readonly ParenGroup[]): { line: number }[] {
  const code = lexed.withStrings;
  const bindings: { name: string; from: number; expression: string }[] = [];
  // The lexer retains offsets while removing comments. Read a whole balanced
  // initializer, including object defaults; a semicolon inside it is not its end.
  for (const d of lexed.code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]*)?=\s*/g)) {
    const start = d.index + d[0].length;
    let depth = 0;
    let end = start;
    for (; end < code.length; end++) {
      const c = lexed.code[end]!;
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (depth === 0) break; depth--; }
      else if (depth === 0 && c === ';') break;
    }
    bindings.push({ name: d[1]!, from: end, expression: code.slice(start, end) });
  }
  for (const d of lexed.code.matchAll(/\bfor\s*(?:await\s*)?\(\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s+of\s+/g)) {
    const start = d.index + d[0].length;
    let depth = 0;
    let end = start;
    for (; end < code.length; end++) {
      const c = lexed.code[end]!;
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) { if (depth === 0) break; depth--; }
    }
    bindings.push({ name: d[1]!, from: end, expression: code.slice(start, end) });
  }
  bindings.sort((a, b) => a.from - b.from);
  const names = new Set<string>();
  const lines = new Set<number>();
  for (const d of bindings) {
    if (!aliasesExpression(d.expression, p, names)) continue;
    names.add(d.name);
    const ref = String.raw`(?<![\w$.])${escape(d.name)}(?![\w$])`;
    const uses = [
      new RegExp(String.raw`${ref}${TAIL_STEP}\s*${ASSIGN_OP}`, 'g'),
      new RegExp(String.raw`${ref}${TAIL_STEP}\s*(?:\+\+|--)`, 'g'),
      new RegExp(String.raw`${ref}${TAIL}\s*\??\.\s*(?:${MUTATORS})\s*\(`, 'g'),
      new RegExp(String.raw`\bdelete\s+${ref}${TAIL_STEP}`, 'g'),
      new RegExp(String.raw`\b${REFLECTIVE}\s*\(\s*${ref}`, 'g'),
    ];
    const tail = lexed.code.slice(d.from);
    for (const u of uses) for (const m of tail.matchAll(u)) lines.add(lexed.lineOf(d.from + m.index));
    for (const g of writeParens) if (g.offset >= d.from && new RegExp(ref).test(g.code)) lines.add(lexed.lineOf(g.offset));
  }
  return [...lines].sort((a, b) => a - b).map(line => ({ line }));
}

/** Every place in `file` that writes property `key`. Throws `LexerError` if the file cannot be lexed. */
export function writeSites(file: SourceFile, key: string): WriteSite[] {
  return sitesIn(indexFile(file.path, lexSource(file.code)), patternsFor(key));
}

/** Words after which a parenthesis groups an expression (rather than calling something or heading a control statement). */
const GROUPING_KEYWORDS: ReadonlySet<string> = new Set(['delete', 'typeof', 'void', 'await', 'return', 'throw', 'yield', 'in', 'of', 'case', 'else', 'do', 'instanceof']);
/** Control statements whose head is parenthesised: a parenthesis right after one is the next statement's own. */
const CONTROL_HEADS: ReadonlySet<string> = new Set(['if', 'while', 'for', 'switch', 'with', 'catch']);

/** The word that ends just before `index` (skipping blanks), or '' if what precedes is not a word. */
function wordBefore(code: string, index: number): string {
  let j = index - 1;
  while (j >= 0 && /\s/.test(code[j]!)) j--;
  let s = j;
  while (s >= 0 && /[\w$]/.test(code[s]!)) s--;
  return code.slice(s + 1, j + 1);
}

/**
 * Parentheses that group an expression, as opposed to calls and control heads,
 * which something is written through: the group is followed by a write
 * (`) = v`, `)[i] = v`, `).x += v`, `)++`, `).push(v)`) or preceded by
 * `delete` or a prefix `++`/`--`. A cast (`(x.key as T)`), a comma expression
 * (`(0, x.key)`), a conditional and `??` all sit in such a group, so the
 * scanner asks only whether the group mentions the key: one pass, no parsing
 * of types. A group that mentions the key and is written through is flagged
 * even when the write lands on something beside the key; that is the price of
 * not parsing, and it is paid by renaming a local.
 */
function writeParenGroups(lexed: LexedSource): ParenGroup[] {
  const code = lexed.code;
  const out: ParenGroup[] = [];
  const open: number[] = [];
  const openOf = new Map<number, number>();
  const after = new RegExp(String.raw`${TAIL}\s*(?:${ASSIGN_OP}|\+\+|--|\??\.\s*(?:${MUTATORS})\s*\()`, 'y');
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '(') {
      open.push(i);
    } else if (code[i] === ')') {
      const start = open.pop();
      if (start === undefined) continue;
      openOf.set(i, start);
      let j = start - 1;
      while (j >= 0 && /\s/.test(code[j]!)) j--;
      const before = j < 0 ? '' : code[j]!;
      let grouping: boolean;
      if (before === ')') {
        // `if (c) (x.key as T).push(v)`: a group after a control head is a group.
        const head = openOf.get(j);
        grouping = head !== undefined && CONTROL_HEADS.has(wordBefore(code, head));
      } else if (before === ']') {
        grouping = false;
      } else if (/[\w$]/.test(before)) {
        grouping = GROUPING_KEYWORDS.has(wordBefore(code, start));
      } else {
        grouping = true;
      }
      if (!grouping) continue;
      after.lastIndex = i + 1;
      const prefixWrite = wordBefore(code, start) === 'delete' || /(?:\+\+|--)\s*$/.test(code.slice(Math.max(0, start - 40), start));
      if (prefixWrite || after.test(code)) out.push({ offset: start, code: code.slice(start, i + 1), strings: lexed.withStrings.slice(start, i + 1) });
    }
  }
  return out;
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
 * Every brace group at its own nesting level. Peels groups innermost-first,
 * replacing each with blanks of the same length, so offsets stay true and
 * nested literals don't hide outer ones. A group that spreads something and
 * sets an owned key is a spread update; one built whole with an owned key is
 * an object literal (review F6: with copy-on-write State, "return a new State"
 * is a write, however the object is built).
 */
function braceGroups(code: string): { offset: number; length: number; text: string }[] {
  const out: { offset: number; length: number; text: string }[] = [];
  let text = code;
  const innermost = /\{[^{}]*\}/g;
  for (;;) {
    let found = false;
    text = text.replace(innermost, (group: string, offset: number) => {
      found = true;
      out.push({ offset, length: group.length, text: group });
      return `0${group.slice(1).replace(/[^\n]/g, ' ')}`;
    });
    if (!found) break;
  }
  return out;
}

/**
 * Writes to owned keys outside their writer module (including building a
 * whole object literal with the key, except in a named State constructor),
 * any in-place write to an immutable key, and files the lexer cannot read.
 */
export function writeViolations(
  files: readonly SourceFile[],
  owned: readonly { readonly key: string; readonly writer: string }[],
  immutableKeys: readonly string[],
  constructors: readonly string[] = [],
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
    const isConstructor = constructors.some((c) => isInModule(file.path, c));
    for (const { writer, p } of ownedPatterns) {
      if (isInModule(file.path, writer)) continue;
      for (const site of sitesIn(index, p)) {
        if (site.form === 'object literal' && isConstructor) continue;
        violations.push({ ...site, writer });
      }
    }
    for (const p of immutablePatterns) {
      // Creating a record is not a write, and `{ ...template, id: newId() }`
      // is how records are created, so spread and literal forms are allowed
      // here; every in-place change to an immutable key is a violation.
      for (const site of sitesIn(index, p)) {
        if (site.form !== 'spread update' && site.form !== 'object literal') violations.push({ ...site, writer: 'nobody' });
      }
    }
  }
  return violations;
}

/** Every interface and object type alias in a file, with its top-level keys and the type names it mentions. */
/** Named type heads, allowing nested generics and defaults containing `=`. */
function typeHeads(code: string): { name: string; start: number; parameters: string }[] {
  const out: { name: string; start: number; parameters: string }[] = [];
  for (const m of code.matchAll(/\btype\s+([A-Za-z_$][\w$]*)\s*/g)) {
    let i = m.index + m[0].length;
    const begin = i;
    if (code[i] === '<') {
      let depth = 1;
      for (i++; i < code.length && depth > 0; i++) {
        if (code[i] === '<') depth++;
        if (code[i] === '>' && code[i - 1] !== '=') depth--;
      }
    }
    const parameters = code.slice(begin, i);
    while (/\s/.test(code[i] ?? '') && i < code.length) i++;
    if (code[i] !== '=' || code[i + 1] === '>') continue;
    out.push({ name: m[1]!, start: i + 1, parameters });
  }
  return out;
}

export function typeRecords(file: SourceFile): TypeRecord[] {
  const code = lexSource(file.code).code;
  const records: TypeRecord[] = [];
  function record(name: string, open: number): void {
    const close = matchingBrace(code, open);
    const raw = code.slice(open + 1, close);
    let body = raw;
    // Keep offsets when blanking child groups, then give inline types their
    // own reachable record name. Keys inside them must not disappear.
    const children: { name: string; open: number }[] = [];
    for (let i = open + 1; i < close; i++) {
      if (code[i] === '{') {
        const end = matchingBrace(code, i);
        const before = code.slice(open + 1, i);
        const member = /(?:^|[;,\n])\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:[^;{}]*$/.exec(before);
        if (member) children.push({ name: `${name}.${member[1]}`, open: i });
        body = body.slice(0, i - open - 1) + ' '.repeat(end - i + 1) + body.slice(end - open);
        i = end;
      }
    }
    // Parameter lists are not data members.
    for (let previous = ''; previous !== body;) {
      previous = body;
      body = body.replace(/\([^()]*\)/g, group => ' '.repeat(group.length));
    }
    const keys = [...body.matchAll(/(?:^|[;,\n])\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\??\s*:/g)].map(k => k[1]!);
    const mentions = [...new Set([...raw.matchAll(/\b[A-Z][\w$]*\b/g)].map(t => t[0]))].sort();
    records.push({ path: file.path, record: name, keys, mentions: [...mentions, ...children.map(c => c.name)] });
    for (const child of children) record(child.name, child.open);
  }
  const heads = [...code.matchAll(/\binterface\s+([A-Za-z_$][\w$]*)\b[^{=;]*\{/g)].map(m => ({ name: m[1]!, open: m.index + m[0].length - 1 }));
  for (const h of typeHeads(code)) {
    const leading = /^\s*(?:Readonly\s*<\s*)?\{/.exec(code.slice(h.start));
    if (leading) heads.push({ name: h.name, open: h.start + leading[0].length - 1 });
  }
  heads.sort((a, b) => a.open - b.open);
  for (const head of heads) record(head.name, head.open);
  // Union arms belong to one named type. Their repeated discriminator keys
  // are one immutable field, not two unrelated State records.
  const merged = new Map<string, TypeRecord>();
  for (const r of records) {
    const previous = merged.get(r.record);
    merged.set(r.record, previous === undefined ? r : { ...r, keys: [...new Set([...previous.keys, ...r.keys])], mentions: [...new Set([...previous.mentions, ...r.mentions])] });
  }
  return [...merged.values()];
}

/** A type alias that is not an object type (`type X = Readonly<Record<K, R>>`, `type Y = A | B[]`): a name to walk through, with no keys. */
export interface TypeAlias {
  readonly path: string;
  readonly alias: string;
  readonly mentions: readonly string[];
}

/** Every non-object type alias in a file, with the capitalised type names on its right side. */
export function typeAliases(file: SourceFile): TypeAlias[] {
  const code = lexSource(file.code).code;
  const out: TypeAlias[] = [];
  for (const h of typeHeads(code)) {
    if (/^\s*\{/.test(code.slice(h.start))) continue;
    const body = `${h.parameters} ${aliasBody(code, h.start)}`;
    out.push({ path: file.path, alias: h.name, mentions: [...new Set([...body.matchAll(/\b[A-Z][\w$]*\b/g)].map(t => t[0]))].sort() });
  }
  return out;
}

/** The right side of an alias: up to the first `;` outside brackets, or a newline outside brackets that does not continue the type. */
function aliasBody(code: string, start: number): string {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    const c = code[i]!;
    if (c === '<' || c === '(' || c === '[' || c === '{') depth++;
    else if ((c === '>' && code[i - 1] !== '=') || c === ')' || c === ']' || c === '}') depth--;
    else if (depth <= 0 && c === ';') return code.slice(start, i);
    else if (depth <= 0 && c === '\n') {
      const before = code.slice(start, i).trimEnd();
      const after = code.slice(i).trimStart();
      if (before !== '' && !/[|&=,<(]$/.test(before) && !/^[|&]/.test(after)) return code.slice(start, i);
    }
  }
  return code.slice(start);
}

/**
 * State records: every record named `State` or `...State`, plus every record
 * reachable by name from a root record named exactly `State` (its fields are
 * State too, whatever the type is called). Reachability walks through
 * non-object type aliases: a record behind `type T = Readonly<Record<K, R>>`
 * is as much State as one named inline.
 */
export function stateRecords(files: readonly SourceFile[]): StateRecord[] {
  const all = files.flatMap(typeRecords);
  const byName = new Map<string, TypeRecord[]>();
  for (const r of all) byName.set(r.record, [...(byName.get(r.record) ?? []), r]);
  const aliases = new Map<string, string[]>();
  for (const a of files.flatMap(typeAliases)) aliases.set(a.alias, [...(aliases.get(a.alias) ?? []), ...a.mentions]);
  const chosen = new Set<TypeRecord>(all.filter((r) => /State$/.test(r.record)));
  const walked = new Set<string>();
  const queue: string[] = [];
  for (const root of byName.get('State') ?? []) queue.push(...root.mentions);
  while (queue.length > 0) {
    const name = queue.pop()!;
    if (walked.has(name)) continue;
    walked.add(name);
    for (const next of byName.get(name) ?? []) {
      chosen.add(next);
      queue.push(...next.mentions);
    }
    queue.push(...(aliases.get(name) ?? []));
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
 * What is immutable (`ownership.ts`): records below the State root, by type
 * name (their keys are read from the types); State's own root fields set once
 * at setup; and keys that are never reassigned wherever they appear.
 */
export interface ImmutableDeclaration {
  readonly records: readonly string[];
  readonly rootFields: readonly string[];
  readonly neverReassigned: readonly string[];
}

/** No immutable declarations at all, for fixtures that test one rule at a time. */
export const NO_IMMUTABLES: ImmutableDeclaration = { records: [], rootFields: [], neverReassigned: [] };

const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The keys the scan must never see assigned: every key of a declared immutable
 * record, State's immutable root fields, and the never-reassigned keys; sorted,
 * without repeats. This replaces a hand-kept list of keys.
 */
export function immutableKeys(records: readonly StateRecord[], declaration: ImmutableDeclaration): string[] {
  const keys = new Set<string>([...declaration.rootFields, ...declaration.neverReassigned]);
  // State is never an immutable record (its fields are owned); declaring it is reported by classificationProblems, not silently honoured.
  for (const r of records) if (r.record !== 'State' && declaration.records.includes(r.record)) for (const k of r.keys) keys.add(k);
  return [...keys].sort(byCode);
}

/**
 * Problems with the classification of State records against the table and the
 * immutable declaration:
 * - a property that is neither owned, nor in an immutable record, nor an
 *   immutable root field, nor a never-reassigned key (a new nested record not
 *   yet declared shows up here, one line per property);
 * - table entries and declarations pointing at nothing;
 * - keys owned twice, or owned and immutable;
 * - immutable keys shared by two declared records, or with an owned key: the
 *   scan matches by name, so they must be unique.
 */
export function classificationProblems(
  records: readonly StateRecord[],
  fields: readonly OwnedField[],
  immutable: ImmutableDeclaration,
  legacy: readonly { readonly file: string; readonly record: string }[],
): string[] {
  const problems: string[] = [];
  const owned = ownedKeys(fields);
  const isLegacy = (r: StateRecord) => legacy.some((l) => l.file === r.path && l.record === r.record);
  const declared = new Set(immutable.records);
  const derived = immutableKeys(records, immutable);

  const byKey = new Map<string, string[]>();
  for (const o of owned) byKey.set(o.key, [...(byKey.get(o.key) ?? []), `${o.record} (${o.writer})`]);
  for (const [key, claims] of [...byKey].sort(([a], [b]) => byCode(a, b))) {
    if (claims.length > 1) problems.push(`owned key "${key}" is claimed ${claims.length} times: ${claims.join(', ')}; owned keys must be unique`);
    if (derived.includes(key)) problems.push(`key "${key}" is both owned and immutable`);
  }

  for (const r of records) {
    if (isLegacy(r)) continue;
    for (const key of r.keys) {
      if (owned.some((o) => o.record === r.record && o.key === key)) continue;
      if (immutable.neverReassigned.includes(key)) continue;
      if (declared.has(r.record)) continue;
      if (r.record === 'State' && immutable.rootFields.includes(key)) continue;
      problems.push(
        r.record === 'State'
          ? `${r.path}: State.${key} has no writer in OWNED_FIELDS and is not an immutable root field (packages/kernel/src/ownership.ts)`
          : `${r.path}: ${r.record}.${key} has no writer in OWNED_FIELDS, and ${r.record} is not declared in IMMUTABLE_RECORDS; a record below the State root is an immutable value (decision 0052) (packages/kernel/src/ownership.ts)`,
      );
    }
  }

  for (const name of immutable.records) {
    if (name === 'State') problems.push('IMMUTABLE_RECORDS names State, whose fields are owned by their writers; list its set-once fields in IMMUTABLE_ROOT_FIELDS');
    else if (!records.some((r) => r.record === name)) problems.push(`IMMUTABLE_RECORDS names ${name}, which no State record declares; remove the entry`);
  }
  for (const key of immutable.rootFields) {
    if (!records.some((r) => r.record === 'State' && r.keys.includes(key))) problems.push(`IMMUTABLE_ROOT_FIELDS names ${key}, which State does not declare`);
  }
  const declaredBy = new Map<string, string[]>();
  for (const r of records) {
    if (!declared.has(r.record)) continue;
    for (const k of r.keys) if (!immutable.neverReassigned.includes(k)) declaredBy.set(k, [...(declaredBy.get(k) ?? []), r.record]);
  }
  for (const [key, names] of [...declaredBy].sort(([a], [b]) => byCode(a, b))) {
    if (names.length > 1) problems.push(`immutable key "${key}" is declared by ${names.join(' and ')}; immutable keys must be unique, so the scan can match them by name`);
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
