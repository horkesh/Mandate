import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { IMMUTABLE_STATE_KEYS, KERNEL_MODULES, LEGACY_STATE_RECORDS, OWNED_FIELDS, type OwnedField } from '../src/ownership.ts';
import {
  classificationProblems,
  isInModule,
  ownedKeys,
  stateRecords,
  writeSites,
  writeViolations,
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
    const records = sources.flatMap(stateRecords);
    expect(classificationProblems(records, OWNED_FIELDS, IMMUTABLE_STATE_KEYS, LEGACY_STATE_RECORDS)).toEqual([]);
  });

  it('writes each owned field only from its writer, and never writes an immutable key', () => {
    const violations = writeViolations(sources, ownedKeys(OWNED_FIELDS), IMMUTABLE_STATE_KEYS).map(
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
    expect(() => writeSites({ path: 'x.ts', code: "const s = 'open\nr.controller = f;" }, 'controller')).toThrow('lexer lost sync at line 1');
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
    const records = [control, unclassified].flatMap(stateRecords);
    expect(records.find((r) => r.record === 'ForceBlockState')?.keys).toEqual(['id', 'strength', 'location']);
    expect(classificationProblems(records, [...fixtureFields, stale], ['id'], [])).toEqual([
      'packages/kernel/src/forces.ts: ForceBlockState.strength has no writer in OWNED_FIELDS (packages/kernel/src/ownership.ts)',
      'packages/kernel/src/forces.ts: ForceBlockState.location has no writer in OWNED_FIELDS (packages/kernel/src/ownership.ts)',
      'OWNED_FIELDS "ghost" points at GhostState.ghost, which no State record declares',
    ]);
  });

  it('flags a key owned twice', () => {
    const twice: OwnedField = { field: 'other', writer: 'combat', proposedBy: [], code: [{ record: 'RegionState', key: 'controller' }] };
    const problems = classificationProblems(stateRecords(control), [...fixtureFields, twice], ['id'], []);
    expect(problems[0]).toContain('owned key "controller" is claimed 2 times');
  });
});
