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

/**
 * One writer per field (CLAUDE.md rule 5; FOUNDATION sections 10 and 11.4).
 * The table is data in `src/ownership.ts`; the scanner is
 * `support/one-writer.ts`. Every package's `src` is scanned, not only the
 * kernel's: an app or a seat package writing State is as wrong as a kernel
 * module that isn't the owner.
 */

/** The 69 keys that `IMMUTABLE_STATE_KEYS` listed by hand before records were declared (f18b073), pinned once: the derived keys must never lose one. */
const IMMUTABLE_KEYS_OF_THE_OLD_LIST: readonly string[] = [
    'adviceConfidence', 'adviceReasons', 'adviceRecommends', 'calendarStart', 'claimConfidence', 'claimKind',
    'claimRegion', 'claimToken', 'claimValue', 'gameSeed', 'goalSpecKind', 'goalSpecRegion',
    'hopPerson', 'hopPost', 'hopRole', 'hqRegion', 'hqSinceDay', 'id',
    'knownBody', 'knownReceivedDay', 'knownReports', 'knownRoute', 'knownVia', 'msgArriveDay',
    'msgFrom', 'msgOrder', 'msgOrigin', 'msgPending', 'msgReport', 'msgRole',
    'msgRoute', 'msgSentDay', 'msgTo', 'msgToPost', 'msgTruth', 'msgVia',
    'orderBypass', 'orderGoal', 'orderIssuedDay', 'orderIssuer', 'orderTarget', 'reasonKind',
    'reasonWeight', 'reportAdvice', 'reportAnswers', 'reportAuthor', 'reportAuthorPost', 'reportClaims',
    'reportDay', 'reportHour', 'reportSubjectId', 'reportSubjectKind', 'reportSubtype', 'reportType',
    'seatDriver', 'seatPerson', 'standingIssuer', 'standingOrder', 'standingSetDay', 'standingSpec',
    'standingViaChain', 'termKind', 'termPerson', 'termPost', 'termRegion', 'termRule',
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
    const violations = writeViolations(sources, ownedKeys(OWNED_FIELDS), immutableKeys(stateRecords(sources), IMMUTABLE), STATE_CONSTRUCTORS).map(
      (v) => `${v.path}:${v.line}: ${v.form} of "${v.key}" (only ${v.writer} may write it)`,
    );
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
      // The ratchet: every key the old hand-kept list named (69) is still derived. New records add keys freely;
      // a key leaves only by a deliberate edit to the pinned list above.
      expect(keys).toEqual(expect.arrayContaining([...IMMUTABLE_KEYS_OF_THE_OLD_LIST]));
      expect(IMMUTABLE_KEYS_OF_THE_OLD_LIST).toHaveLength(69);
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
