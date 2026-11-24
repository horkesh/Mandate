import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  IMMUTABLE_RECORDS,
  IMMUTABLE_ROOT_FIELDS,
  KERNEL_MODULES,
  LEGACY_STATE_RECORDS,
  NEVER_REASSIGNED_KEYS,
  OWNED_FIELDS,
  STATE_CONSTRUCTORS,
  type OwnedField,
} from '../src/ownership.ts';
import {
  classificationProblems,
  immutableKeys,
  isInModule,
  NO_IMMUTABLES,
  ownedKeys,
  stateRecords,
  writeSites,
  writeViolations,
  type ImmutableDeclaration,
  type SourceFile,
} from './support/one-writer.ts';
import { repoPath, tsFiles, workspacePackages } from './support/source.ts';
import { classifyReads, REVIEWED_READS } from './support/one-writer-reads.ts';

/**
 * One writer per field (CLAUDE.md rule 5; FOUNDATION sections 10 and 11.4).
 * The table is data in `src/ownership.ts`; the scanner is
 * `support/one-writer.ts`. Every package's `src` is scanned, not only the
 * kernel's: an app or a seat package writing State is as wrong as a kernel
 * module that isn't the owner.
 */

/**
 * The keys that `IMMUTABLE_STATE_KEYS` listed by hand before records were declared (f18b073), pinned once: the derived
 * keys must never lose one. 69 then; lane 0.5 deliberately removed `hqRegion` and `hqSinceDay` with the stand-in
 * `Headquarters` record it was briefed to delete (headquarters now derive from force blocks), leaving 67.
 */
const IMMUTABLE_KEYS_OF_THE_OLD_LIST: readonly string[] = [
    'adviceConfidence', 'adviceReasons', 'adviceRecommends', 'calendarStart', 'claimConfidence', 'claimKind',
    'claimRegion', 'claimToken', 'claimValue', 'gameSeed',
    'hopPerson', 'hopPost', 'hopRole', 'id',
    'knownBody', 'knownReceivedDay', 'knownReports', 'knownRoute', 'knownVia', 'msgArriveDay',
    'msgFrom', 'msgOrder', 'msgOrigin', 'msgPending', 'msgReport', 'msgRole',
    'msgRoute', 'msgSentDay', 'msgTo', 'msgToPost', 'msgTruth', 'msgVia',
    'orderBypass', 'orderGoal', 'orderIssuedDay', 'orderIssuer', 'orderTarget', 'reasonKind',
    'reasonWeight', 'reportAdvice', 'reportAnswers', 'reportAuthor', 'reportAuthorPost', 'reportClaims',
    'reportDay', 'reportHour', 'reportSubjectId', 'reportSubjectKind', 'reportSubtype', 'reportType',
    'seatDriver', 'seatPerson', 'termKind', 'termPerson', 'termPost', 'termRegion', 'termRule',
    'termValue', 'truthTerms', 'truthTrimmed',
];

/** What is immutable, as `ownership.ts` declares it: records by name, State's set-once root fields, and ids. */
const IMMUTABLE: ImmutableDeclaration = { records: IMMUTABLE_RECORDS, rootFields: IMMUTABLE_ROOT_FIELDS, neverReassigned: NEVER_REASSIGNED_KEYS };
/** Fixtures that need only the id rule. */
const ID_ONLY: ImmutableDeclaration = { ...NO_IMMUTABLES, neverReassigned: ['id'] };
/** The tail of the message for a record below the root that nothing declares. */
const NOT_DECLARED = (record: string): string => `, and ${record} is not declared in IMMUTABLE_RECORDS; a record below the State root is an immutable value (decision 0052)`;

const sources: SourceFile[] = workspacePackages().flatMap((p) =>
  tsFiles(join(p.root, 'src')).map((file) => ({ path: repoPath(file), code: readFileSync(file, 'utf8') })),
);

describe('the field-to-writer table', () => {
  const modules = new Map(KERNEL_MODULES.map((m) => [m.name, m]));

  it('names each module once', () => {
    expect(modules.size).toBe(KERNEL_MODULES.length);
  });

  it('gives every field a writer that is a State module or a writer', () => {
    const problems = OWNED_FIELDS.flatMap((f) => {
      const m = modules.get(f.writer);
      if (!m) return [`"${f.field}": writer ${f.writer} is not in KERNEL_MODULES`];
      return m.layer === 'State' || m.layer === 'writer' ? [] : [`"${f.field}": writer ${f.writer} is ${m.layer}, which writes nothing`];
    });
    expect(problems).toEqual([]);
  });

  it('names each field once', () => {
    const names = OWNED_FIELDS.map((f) => f.field);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('one writer per field, over every package', () => {
  it('scans a non-empty set of files', () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it('classifies every property of every State record, and no key is owned twice', () => {
    const records = stateRecords(sources);
    expect(classificationProblems(records, OWNED_FIELDS, IMMUTABLE, LEGACY_STATE_RECORDS)).toEqual([]);
  });

  it('writes each owned field only from its writer, and never writes an immutable key', () => {
    const raw = writeViolations(sources, ownedKeys(OWNED_FIELDS), immutableKeys(stateRecords(sources), IMMUTABLE), STATE_CONSTRUCTORS);
    const audit = classifyReads(sources, raw, REVIEWED_READS);
    const violations = audit.violations.map(
      (v) => `${v.path}:${v.line}: ${v.form} of "${v.key}" (only ${v.writer} may write it)`,
    ).concat(audit.problems);
    expect(violations).toEqual([]);
  });
});

/**
 * The deliberately failing example: a tiny fixture codebase with one State
 * record owned by `control`, and other modules breaking the rule in each way
 * the scanner knows. Proves the check bites, so a green run means something.
 */
describe('the scanner catches violations (positive control)', () => {
  const fixtureFields: OwnedField[] = [
    { field: 'region control', writer: 'control', proposedBy: ['combat'], code: [{ record: 'RegionState', key: 'controller' }] },
  ];
  const owned = ownedKeys(fixtureFields);

  it.each([
    ['nested parentheses', 'const x = ((state.controller)); x.push(f);'],
    ['parenthesised ternary', 'const x = (ok ? state.controller : other); x.push(f);'],
    ['satisfies', 'const x = state.controller satisfies T[]; x.push(f);'],
    ['parenthesised nullish default', 'const x = ((state.controller ?? {})); x[id] = f;'],
    ['logical default', 'const x = state.controller || {}; x[id] = f;'],
    ['factory default', 'const x = state.controller ?? makeEmpty(); x[id] = f;'],
    ['two hops', 'const a = state.controller; const b = a[id]; b.push(f);'],
    ['loop element', 'for (const x of state.controller) x.push(f);'],
    ['loop through alias', 'const a = state.controller; for (const x of a) x.push(f);'],
  ])('follows %s', (_, code) => {
    expect(writeViolations([{ path: 'packages/kernel/src/supply.ts', code }], owned, [])).toEqual([
      expect.objectContaining({ key: 'controller', form: 'write through a local alias' }),
    ]);
  });

  it('follows a generic alias with a default to its State row', () => {
    const files = [{ path: 'packages/kernel/src/state.ts', code: 'interface State { rows: Rows } type Rows<T = Row> = Readonly<Record<string, T>>; interface Row { readonly rowValue: number }' }];
    const records = stateRecords(files);
    expect(records.map(r => r.record)).toContain('Row');
    const keys = immutableKeys(records, { records: ['Row'], rootFields: [], neverReassigned: [] });
    expect(writeViolations([{ path: 'packages/cli/src/x.ts', code: 'r.rowValue = 2;' }], [], keys)).toHaveLength(1);
  });

  it('classifies keys of inline object types, including arrays of inline objects', () => {
    const records = stateRecords([{ path: 'packages/kernel/src/state.ts', code: 'interface State { detail: { readonly inlineValue: number; children: readonly { readonly childValue: number }[] } }' }]);
    expect(records.map(r => [r.record, r.keys])).toEqual([
      ['State', ['detail']], ['State.detail', ['inlineValue', 'children']], ['State.detail.children', ['childValue']],
    ]);
    const keys = immutableKeys(records, { records: ['State.detail', 'State.detail.children'], rootFields: [], neverReassigned: [] });
    expect(writeViolations([{ path: 'packages/cli/src/x.ts', code: 'r.inlineValue++; r.childValue = 2;' }], [], keys)).toHaveLength(2);
  });

  it('does not guess whether a method returns owned storage or a copy', () => {
    expect(writeSites({ path: 'x.ts', code: 'state.controller.get(id)!.push(f);' }, 'controller')).toEqual([]);
    expect(readFileSync(new URL('./support/one-writer.ts', import.meta.url), 'utf8').split('import type')[0]).toContain('state-data.test.ts');
  });

  it('keeps inline keys behind a wrapper alias reachable from State', () => {
    const records = stateRecords([{ path: 'x.ts', code: 'interface State { rows: Rows } type Rows<T = number> = Readonly<{ readonly wrappedValue: T }>[];' }]);
    expect(records.map(r => [r.record, r.keys])).toEqual([['State', ['rows']], ['Rows', ['wrappedValue']]]);
  });

  it('does not follow an alias through a copy, a call result, or a loop over a copy', () => {
    const code = 'const a = state.controller; const b = [...a]; b.push(f); const c = a.slice(); c.push(f); for (const x of a.map(copy)) x.push(f);';
    expect(writeViolations([{ path: 'packages/kernel/src/supply.ts', code }], owned, [])).toEqual([]);
  });

  const control: SourceFile = {
    path: 'packages/kernel/src/control.ts',
    code: [
      'export interface RegionState { readonly id: RegionId; controller: FactionId }',
      'export function applyControl(r: RegionState, f: FactionId): void { r.controller = f; }',
    ].join('\n'),
  };
  const controlFolderFile: SourceFile = { path: 'packages/kernel/src/control/apply.ts', code: 'r.controller = f;' };
  const offender: SourceFile = {
    path: 'packages/kernel/src/supply.ts',
    code: [
      '// r.controller = x;  (a comment is not a write)',
      "const note = 'r.controller = x'; // nor is a string",
      'r.controller = f;',
      'regions[id].controller ??= f;',
      "r['controller'] = f;",
      'delete r.controller;',
      'history.controller.push(f);',
      'const next = { ...r, controller: f };',
      'const nested = { a: { b: 1 }, ...r, controller: f };',
      'const short = { ...r, controller };',
      'r.id = other;',
      'if (r.controller === f) {}',
      'const copy = { controller: r.controller };',
    ].join('\n'),
  };
  const app: SourceFile = { path: 'packages/cli/src/console.ts', code: 'state.regions[id].controller = mine;' };

  it('allows the writer module, as a file or a folder', () => {
    expect(isInModule(control.path, 'control')).toBe(true);
    expect(isInModule(controlFolderFile.path, 'control')).toBe(true);
    expect(isInModule('packages/kernel/src/control-index.ts', 'control')).toBe(false);
    expect(isInModule('packages/cli/src/control.ts', 'control')).toBe(false);
    expect(writeViolations([control, controlFolderFile], owned, ['id'])).toEqual([]);
  });

  it('reports every write form outside the writer, and none for reads, comments or strings', () => {
    const found = writeViolations([control, offender, app], owned, ['id']);
    const summary = found.map((v) => `${v.path}:${v.line} ${v.form} ${v.key}`);
    expect(summary).toEqual([
      'packages/kernel/src/supply.ts:3 assignment controller',
      'packages/kernel/src/supply.ts:4 assignment controller',
      'packages/kernel/src/supply.ts:5 bracket assignment controller',
      'packages/kernel/src/supply.ts:6 delete controller',
      'packages/kernel/src/supply.ts:7 mutating call controller',
      'packages/kernel/src/supply.ts:8 spread update controller',
      'packages/kernel/src/supply.ts:9 spread update controller',
      'packages/kernel/src/supply.ts:10 spread update controller',
      // A literal carrying an owned key is a write under copy-on-write State (review F6): owned
      // key names are reserved everywhere, so the copy must use another property name.
      'packages/kernel/src/supply.ts:13 object literal controller',
      'packages/kernel/src/supply.ts:11 assignment id',
      'packages/cli/src/console.ts:1 assignment controller',
    ]);
  });

  it('sees writes after regex literals that look like strings, comments or templates (the reviewer probes)', () => {
    const probes: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        "const a = /'/.test('x'); r.controller = f;",
        "const b = 'a/b'.split(/\\//); r.controller = f;",
        "const c = /[/*]/.test('x');",
        'r.controller = f;',
        "const e = /`/.test('x');",
        'r.id = other;',
      ].join('\n'),
    };
    expect(writeViolations([probes], owned, ['id']).map((v) => `${v.line} ${v.key}`)).toEqual(['1 controller', '2 controller', '4 controller', '6 id']);
  });

  it('fails closed when the lexer loses sync', () => {
    const broken: SourceFile = { path: 'packages/kernel/src/supply.ts', code: "const s = 'open\nr.controller = f;" };
    expect(() => writeSites(broken, 'controller')).toThrow('lexer lost sync at line 1');
    expect(writeViolations([broken], owned, ['id']).map((v) => `${v.path}:${v.line} ${v.form}`)).toEqual([
      'packages/kernel/src/supply.ts:1 lexer lost sync at line 1: a quoted string meets a newline',
    ]);
  });

  it('catches index writes, ! forms and destructuring assignment (reviewer probes)', () => {
    const probes: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        'state.controller[regionId] = faction;',
        "state.controller['r1'] = f;",
        'r.controller!.push(f);',
        'r.controller![i] = f;',
        'state.controller[ids[0]].holder ??= f;',
        '[r.controller] = [f];',
        '({ controller: r.controller } = other);',
        'r.controller![i]++;',
        'delete state.controller[regionId];',
        'const seen = state.controller[regionId] === f;',
        'const [a, b] = pair;',
      ].join('\n'),
    };
    expect(writeViolations([probes], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual([
      '1 assignment',
      '2 assignment',
      '3 mutating call',
      '4 assignment',
      '5 assignment',
      '6 destructuring assignment',
      '7 destructuring assignment',
      '8 increment',
      '9 delete',
    ]);
  });

  it('catches writes through a cast and delete through a cast, and their siblings (review of lane 0.4)', () => {
    const writes: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        // The reviewer's two probes.
        "(s.controller as Record<string, unknown>)['x'] = {};",
        'delete (s as any).controller;',
        // Siblings: casts, a comma expression, a conditional, `??`, an angle assertion, a group after a control head.
        '(s.controller as T[]).push(f);',
        '(0, s.controller).push(f);',
        '(cond ? s.controller : t).push(f);',
        '(s.controller ?? []).push(f);',
        '(<T[]>s.controller).push(f);',
        'if (c) (s.controller as T[]).push(f);',
        '(s.controller) = f;',
        '(s.controller as T).length = 0;',
        "delete (s.controller as any)['x'];",
        '++(s.controller as any).n;',
        // Siblings: optional chaining, bracket forms, a prefix write through a receiver cast.
        's.controller?.push(f);',
        's?.controller.push(f);',
        "delete s['controller'];",
        "s['controller']++;",
        "++s['controller'];",
        '++(s as any).controller;',
        // Siblings: a borrowed mutator and reflective writes with the key as the target.
        'Array.prototype.push.call(s.controller, f);',
        '[].splice.apply(s.controller, [0, 1]);',
        "Object.assign(s.controller, { a: 1 });",
        "Reflect.set(s.controller, 'a', 1);",
      ].join('\n'),
    };
    const found = writeViolations([writes], owned, []).map((v) => `${v.line} ${v.form}`);
    expect(found).toEqual([
      '1 write through a parenthesised target',
      '2 delete',
      '3 write through a parenthesised target',
      '4 write through a parenthesised target',
      '5 write through a parenthesised target',
      '6 write through a parenthesised target',
      '7 write through a parenthesised target',
      '8 write through a parenthesised target',
      '9 write through a parenthesised target',
      '10 write through a parenthesised target',
      '11 delete',
      '11 write through a parenthesised target',
      '12 increment',
      '12 write through a parenthesised target',
      '13 mutating call',
      '14 mutating call',
      '15 bracket delete',
      '16 bracket increment',
      '17 bracket increment',
      '18 increment',
      '19 borrowed mutator',
      '20 borrowed mutator',
      '21 reflective write',
      '22 reflective write',
    ]);
  });

  it('catches a for loop that assigns the key on every pass, and not one that only reads it (review N1)', () => {
    const loops: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        'for (s.controller of items) {}',
        'for (s.controller in table) {}',
        "for (s['controller'] of items) {}",
        'for (const x of s.controller) {}',
        'for (const k in s.controller) {}',
        'for (let i = 0; i < s.controller.length; i++) {}',
      ].join('\n'),
    };
    expect(writeViolations([loops], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual(['1 loop target', '2 loop target', '3 bracket loop target']);
  });

  it('catches a reflective write that names the key as a string (review of the tooling batch)', () => {
    const writes: SourceFile = {
      path: 'packages/cli/src/shell.ts',
      code: [
        // The reviewer's three probes.
        "Reflect.set(s, 'controller', v);",
        "Object.defineProperty(s, 'controller', { value: v });",
        "Reflect.deleteProperty(s, 'controller');",
        // Siblings: the other quote styles, a cast target, a multi-line call, defineProperties with the key in its map.
        'Reflect.set(s, "controller", v);',
        'Reflect.set(s, `controller`, v);',
        "Reflect.defineProperty((s as any), 'controller', d);",
        "Reflect.set(\n  getState(a, b),\n  'controller',\n  v,\n);",
        'Object.defineProperties(s, { controller: { value: v } });',
      ].join('\n'),
    };
    expect(writeViolations([writes], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual([
      '1 reflective write by name',
      '2 reflective write by name',
      '3 reflective write by name',
      '4 reflective write by name',
      '5 reflective write by name',
      '6 reflective write by name',
      '7 reflective write by name',
      '12 object literal',
    ]);
  });

  it('does not flag a reflective read, another key, or a key that only starts like it (negative controls)', () => {
    const reads: SourceFile = {
      path: 'packages/cli/src/shell.ts',
      code: [
        "Reflect.get(s, 'controller');",
        "Reflect.has(s, 'controller');",
        "Reflect.set(s, 'other', v);",
        "Reflect.set(s, 'controllerAlso', v);",
        "Object.defineProperty(s, 'other', d);",
        "log('controller');",
      ].join('\n'),
    };
    expect(writeViolations([reads], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual([]);
  });

  it('does not flag reads, or the key passed as a source rather than a target (negative controls)', () => {
    const reads: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        'Object.assign(other, s.controller);',
        'Array.prototype.push.call(other, s.controller);',
        'const n = (s.controller as T[]).length;',
        'const m = (s.controller as T[]).map((x) => x);',
        'if (s.controller) y = 1;',
        'foo(s.controller, f);',
        'foo(s.controller as T).bar = 1;',
        'const k = (s.controller as T) === f;',
        'while (n--) keep(s.controller);',
        'for (let i = 0; i < n; i--) other = s.controller;',
      ].join('\n'),
    };
    expect(writeViolations([reads], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual([]);
  });

  it('treats a record named exactly State, and every record reachable from it, as State (reviewer probes)', () => {
    const root: SourceFile = {
      path: 'packages/kernel/src/state.ts',
      code: [
        'export interface State { readonly day: number; regions: Readonly<Record<RegionId, Region>>; forces: ForceBlock[] }',
        'export interface Region { readonly id: RegionId; controller: FactionId; supply: SupplyRow }',
        'export type ForceBlock = { readonly id: ForceBlockId; strength: number };',
        'export interface SupplyRow { level: number }',
        'export interface Unrelated { anything: number }',
      ].join('\n'),
    };
    const records = stateRecords([root]);
    expect(records.map((r) => r.record).sort()).toEqual(['ForceBlock', 'Region', 'State', 'SupplyRow']);
    const regionFields: OwnedField[] = [{ field: 'region control', writer: 'control', proposedBy: [], code: [{ record: 'Region', key: 'controller' }] }];
    expect(classificationProblems(records, regionFields, ID_ONLY, [])).toEqual([
      'packages/kernel/src/state.ts: State.day has no writer in OWNED_FIELDS and is not an immutable root field (packages/kernel/src/ownership.ts)',
      'packages/kernel/src/state.ts: State.regions has no writer in OWNED_FIELDS and is not an immutable root field (packages/kernel/src/ownership.ts)',
      'packages/kernel/src/state.ts: State.forces has no writer in OWNED_FIELDS and is not an immutable root field (packages/kernel/src/ownership.ts)',
      `packages/kernel/src/state.ts: Region.supply has no writer in OWNED_FIELDS${NOT_DECLARED('Region')} (packages/kernel/src/ownership.ts)`,
      `packages/kernel/src/state.ts: ForceBlock.strength has no writer in OWNED_FIELDS${NOT_DECLARED('ForceBlock')} (packages/kernel/src/ownership.ts)`,
      `packages/kernel/src/state.ts: SupplyRow.level has no writer in OWNED_FIELDS${NOT_DECLARED('SupplyRow')} (packages/kernel/src/ownership.ts)`,
    ]);
  });

  it('follows non-object type aliases to the records behind them, and catches a write to one (the alias gap, phase 0 close-out)', () => {
    const root: SourceFile = {
      path: 'packages/kernel/src/state.ts',
      code: [
        'export interface State { roster: RosterTable; ledger: LedgerList; readonly day: number }',
        // The close-out's case: a record reachable only through `Readonly<Record<K, R>>`.
        'export type RosterTable = Readonly<Record<PersonId, RosterRow>>;',
        'export interface RosterRow { readonly id: PersonId; rosterRank: number }',
        // An alias of an alias, over two lines, through a union.
        'export type LedgerList = readonly LedgerEntry[]',
        '  | Readonly<Record<string, TrimRow>> |',
        '  CutList;',
        // A union broken after its operator (review N2).
        'export type CutList = readonly CutRow[];',
        'export interface CutRow { readonly cutAmount: number }',
        'export type LedgerEntry = Readonly<{ entryDay: number }> & EntryNote;',
        'export interface EntryNote { readonly noteText: string }',
        'export interface TrimRow { readonly trimAmount: number }',
        'export type Unreached = Readonly<Record<string, Loose>>;',
        'export interface Loose { looseKey: number }',
      ].join('\n'),
    };
    const records = stateRecords([root]);
    expect(records.map((r) => r.record).sort()).toEqual(['CutRow', 'EntryNote', 'LedgerEntry', 'RosterRow', 'State', 'TrimRow']);
    const fields: OwnedField[] = [{ field: 'roster', writer: 'people', proposedBy: [], code: [{ record: 'State', key: 'roster' }, { record: 'State', key: 'ledger' }] }];
    const decl: ImmutableDeclaration = { records: ['CutRow', 'EntryNote', 'LedgerEntry', 'TrimRow'], rootFields: ['day'], neverReassigned: ['id'] };
    // The alias-hidden record is classified: its unowned field is reported, where before the scan never saw it.
    expect(classificationProblems(records, fields, decl, [])).toEqual([
      `packages/kernel/src/state.ts: RosterRow.rosterRank has no writer in OWNED_FIELDS${NOT_DECLARED('RosterRow')} (packages/kernel/src/ownership.ts)`,
    ]);
    // Declared immutable, its keys are protected: a write from anywhere is caught.
    const keys = immutableKeys(records, { ...decl, records: [...decl.records, 'RosterRow'] });
    expect(keys).toEqual(expect.arrayContaining(['noteText', 'rosterRank', 'trimAmount']));
    expect(keys).not.toContain('looseKey');
    const writer: SourceFile = { path: 'packages/kernel/src/supply.ts', code: 'row.rosterRank = 2;\nnote.noteText = "x";\nloose.looseKey = 1;' };
    expect(writeViolations([writer], [], keys).map((v) => `${v.line} ${v.key}`).sort()).toEqual(['1 rosterRank', '2 noteText']);
  });

  it('catches writes through a local bound to the key, and not through a copy (the alias gap)', () => {
    const local: SourceFile = {
      path: 'packages/kernel/src/supply.ts',
      code: [
        'const c = state.controller;',
        'c.push(f);',
        'c[id] = f;',
        'c.holder += 1;',
        'delete c[id];',
        'Object.assign(c, { a: 1 });',
        'c![i]++;',
        "const b = state['controller'][id];",
        'b.holder = f;',
        'const copy = [...state.controller];',
        'copy.push(f);',
        'const sliced = state.controller.slice();',
        'sliced.push(f);',
        'const n = state.controller.length;',
        'let again = state.controller;',
        'again = other;',
        'const seen = c[id] === f;',
        // A cast at the declaration (review N1), and a cast at the write (review S1): State is readonly, so real code casts.
        'const cast = state.controller as unknown as X[];',
        'cast.push(f);',
        'const plain = state.controller;',
        '(plain as X[]).push(f);',
        'const row = state.controller[id];',
        '(row as Record<string, number>)[k] = 1;',
        // Declarations in parentheses, with a default, or as one arm of a conditional.
        'const wrapped = (state.controller);',
        'wrapped.push(f);',
        'const orNone = state.controller[id] ?? {};',
        'orNone.holder = f;',
        'const either = ok ? state.controller : other;',
        'either.push(f);',
        // Reads through the same shapes stay clear.
        'const n2 = (plain as X[]).length;',
        'const ok2 = either.includes(f);',
        // A call around the key makes a copy: its result is not the key (the real tree's `Object.keys(state.x)`).
        'const keys = Object.keys(state.controller) as Id[];',
        'keys.sort(cmp);',
        // A receiver with its own balanced groups (re-check S3), and a cast around a default.
        'const recv = (state as Mutable<State>).controller;',
        'recv.push(f);',
        'const castDefault = (state.controller[id] ?? {}) as Record<string, number>;',
        'castDefault[k] = 1;',
        'const picked = states[pick(i)].controller;',
        'picked.push(f);',
        // The conditional's else arm (re-check N4).
        'const elseArm = ok ? other : state.controller;',
        'elseArm.push(f);',
      ].join('\n'),
    };
    expect(writeViolations([local], owned, []).map((v) => `${v.line} ${v.form}`)).toEqual([
      '2 write through a local alias',
      '3 write through a local alias',
      '4 write through a local alias',
      '5 write through a local alias',
      '6 write through a local alias',
      '7 write through a local alias',
      '9 write through a local alias',
      '19 write through a local alias',
      '21 write through a local alias',
      '23 write through a local alias',
      '25 write through a local alias',
      '27 write through a local alias',
      '29 write through a local alias',
      '35 write through a local alias',
      '37 write through a local alias',
      '39 write through a local alias',
      '41 write through a local alias',
    ]);
    // In the writer module the same code is allowed.
    expect(writeViolations([{ ...local, path: 'packages/kernel/src/control.ts' }], owned, [])).toEqual([]);
  });

  it('catches a whole new State literal built outside the writer, except in a named constructor (review F6)', () => {
    const fields: OwnedField[] = [
      { field: 'the current day', writer: 'tick', proposedBy: [], code: [{ record: 'State', key: 'stateDay' }] },
      { field: 'messages in transit', writer: 'messages', proposedBy: [], code: [{ record: 'State', key: 'messagesInTransit' }] },
    ];
    const forge: SourceFile = {
      path: 'packages/kernel/src/view/view.ts',
      code: [
        'export const forge = (s: State): State => ({',
        '  gameSeed: s.gameSeed,',
        '  stateDay: 0,',
        '  messagesInTransit: [],',
        '});',
        'const { stateDay } = s;',
        'const seen = { day: s.stateDay };',
      ].join('\n'),
    };
    const setup: SourceFile = { path: 'packages/kernel/src/tick/setup.ts', code: 'export const createState = () => ({ gameSeed: 1, stateDay: 0, messagesInTransit: [] });' };
    const found = writeViolations([forge, setup], ownedKeys(fields), ['gameSeed'], ['tick/setup']).map((v) => `${v.path}:${v.line} ${v.form} ${v.key}`);
    expect(found).toEqual(['packages/kernel/src/view/view.ts:1 object literal stateDay', 'packages/kernel/src/view/view.ts:1 object literal messagesInTransit']);
    // Without the constructor exemption, setup's literal is a violation too (setup sits in `tick`, so its day is its own).
    expect(writeViolations([setup], ownedKeys(fields), [], []).map((v) => v.key)).toEqual(['messagesInTransit']);
  });

  it('counts increments as writes', () => {
    expect(writeSites({ path: 'x.ts', code: 'r.controller++; --r.controller;' }, 'controller').map((s) => s.form)).toEqual(['increment', 'increment']);
  });

  it('flags an unclassified State field and a stale table entry', () => {
    const unclassified: SourceFile = {
      path: 'packages/kernel/src/forces.ts',
      code: 'export interface ForceBlockState {\n  readonly id: ForceBlockId;\n  strength: number;\n  location: { region: RegionId };\n}',
    };
    const stale: OwnedField = { field: 'ghost', writer: 'forces', proposedBy: [], code: [{ record: 'GhostState', key: 'ghost' }] };
    const records = stateRecords([control, unclassified]);
    expect(records.find((r) => r.record === 'ForceBlockState')?.keys).toEqual(['id', 'strength', 'location']);
    expect(classificationProblems(records, [...fixtureFields, stale], ID_ONLY, [])).toEqual([
      `packages/kernel/src/forces.ts: ForceBlockState.strength has no writer in OWNED_FIELDS${NOT_DECLARED('ForceBlockState')} (packages/kernel/src/ownership.ts)`,
      `packages/kernel/src/forces.ts: ForceBlockState.location has no writer in OWNED_FIELDS${NOT_DECLARED('ForceBlockState')} (packages/kernel/src/ownership.ts)`,
      'OWNED_FIELDS "ghost" points at GhostState.ghost, which no State record declares',
    ]);
  });

  describe('the immutable declaration (tooling item 4: per record, not per key)', () => {
    const nested: SourceFile = {
      path: 'packages/kernel/src/state.ts',
      code: [
        'export interface State { readonly gameSeed: number; readonly calendarStart: string | null; messages: readonly Message[]; stateDay: number }',
        'export interface Message { readonly id: MessageId; readonly msgFrom: PersonId; readonly msgBody: Body }',
        'export interface Body { readonly bodyText: string }',
        'export interface Scratch { readonly scratchNote: string }',
      ].join('\n'),
    };
    const records = stateRecords([nested]);
    const decl: ImmutableDeclaration = { records: ['Message', 'Body'], rootFields: ['gameSeed', 'calendarStart'], neverReassigned: ['id'] };
    const fields: OwnedField[] = [{ field: 'the day', writer: 'tick', proposedBy: [], code: [{ record: 'State', key: 'stateDay' }, { record: 'State', key: 'messages' }] }];

    it('derives the immutable keys from the declared records, with the root fields and ids', () => {
      expect(immutableKeys(records, decl)).toEqual(['bodyText', 'calendarStart', 'gameSeed', 'id', 'msgBody', 'msgFrom']);
      // One line declares a record, whatever its keys: a new key on Message is covered at once.
      const grown = stateRecords([{ ...nested, code: nested.code.replace('readonly msgBody: Body', 'readonly msgBody: Body; readonly msgLate: number') }]);
      expect(immutableKeys(grown, decl)).toContain('msgLate');
      expect(classificationProblems(records, fields, decl, [])).toEqual([]);
    });

    it('flags an assignment to any key of a declared record, and allows building one whole', () => {
      const writer: SourceFile = {
        path: 'packages/kernel/src/messages.ts',
        code: ['m.msgFrom = other;', 'delete m.msgBody;', 'const next = { ...m, msgFrom: p };', 'const fresh = { id, msgFrom: p, msgBody: b };', 'm.scratchNote = x;'].join('\n'),
      };
      const found = writeViolations([writer], [], immutableKeys(records, decl)).map((v) => `${v.line} ${v.form} ${v.key}`).sort();
      expect(found).toEqual(['1 assignment msgFrom', '2 delete msgBody']);
    });

    it('flags a record below the root that nothing declares, one line per key (positive control)', () => {
      const problems = classificationProblems(records, fields, { ...decl, records: ['Message'] }, []);
      expect(problems).toEqual([
        `packages/kernel/src/state.ts: Body.bodyText has no writer in OWNED_FIELDS${NOT_DECLARED('Body')} (packages/kernel/src/ownership.ts)`,
      ]);
    });

    it('flags a State field that is neither owned nor an immutable root field', () => {
      expect(classificationProblems(records, fields.slice(0, 1).map((f) => ({ ...f, code: [{ record: 'State', key: 'stateDay' }] })), decl, [])).toEqual([
        'packages/kernel/src/state.ts: State.messages has no writer in OWNED_FIELDS and is not an immutable root field (packages/kernel/src/ownership.ts)',
      ]);
    });

    it('flags declarations that point at nothing, and State declared as an immutable record', () => {
      expect(classificationProblems(records, fields, { ...decl, records: ['Message', 'Body', 'Gone', 'State'], rootFields: ['gameSeed', 'calendarStart', 'ghostField'] }, [])).toEqual([
        'IMMUTABLE_RECORDS names Gone, which no State record declares; remove the entry',
        'IMMUTABLE_RECORDS names State, whose fields are owned by their writers; list its set-once fields in IMMUTABLE_ROOT_FIELDS',
        'IMMUTABLE_ROOT_FIELDS names ghostField, which State does not declare',
      ]);
    });

    it('flags an immutable key shared by two declared records, or with an owned key, since the scan matches by name', () => {
      const clash = stateRecords([{ ...nested, code: nested.code.replace('readonly bodyText: string', 'readonly msgFrom: string') }]);
      expect(classificationProblems(clash, fields, decl, [])).toEqual([
        'immutable key "msgFrom" is declared by Message and Body; immutable keys must be unique, so the scan can match them by name',
      ]);
      const owns = [...fields, { field: 'a stray', writer: 'tick', proposedBy: [], code: [{ record: 'Scratch', key: 'scratchNote' }, { record: 'State', key: 'msgFromOwned' }] }];
      const shadow = stateRecords([{ ...nested, code: nested.code.replace('readonly scratchNote: string', 'readonly bodyText: string') }]);
      expect(classificationProblems(shadow, [...fields, { field: 'a stray', writer: 'tick', proposedBy: [], code: [{ record: 'Scratch', key: 'bodyText' }] }], decl, [])).toContain('key "bodyText" is both owned and immutable');
      expect(owns.length).toBe(2);
    });

    it('is the real declaration: every nested State record is declared, and the derived keys include the ones the old list named', () => {
      const real = stateRecords(sources);
      const keys = immutableKeys(real, IMMUTABLE);
      // The ratchet: every key the old hand-kept list named (67 since lane 0.5) is still derived. New records add keys freely;
      // a key leaves only by a deliberate edit to the pinned list above.
      expect(keys).toEqual(expect.arrayContaining([...IMMUTABLE_KEYS_OF_THE_OLD_LIST]));
      // Lane 1.4 retired the standing goal: its seven keys (`goalSpec*`, `standing*`) left the list on purpose.
      expect(IMMUTABLE_KEYS_OF_THE_OLD_LIST).toHaveLength(60);
      const nestedNames = real.filter((r) => r.record !== 'State' && !LEGACY_STATE_RECORDS.some((l) => l.record === r.record)).map((r) => r.record).sort();
      expect(nestedNames).toEqual([...IMMUTABLE_RECORDS].sort());
    });
  });

  it('flags a key owned twice', () => {
    const twice: OwnedField = { field: 'other', writer: 'combat', proposedBy: [], code: [{ record: 'RegionState', key: 'controller' }] };
    const problems = classificationProblems(stateRecords([control]), [...fixtureFields, twice], ID_ONLY, []);
    expect(problems[0]).toContain('owned key "controller" is claimed 2 times');
  });
});
