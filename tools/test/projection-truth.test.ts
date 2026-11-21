import { describe, expect, it } from 'vitest';
import { projectionFindings } from '../rules/projection-truth.ts';

const path = 'packages/kernel/src/view/example.ts';
describe('projection truth architecture', () => {
  it.each(['postStates', 'departmentFactions', 'personService', 'battleRecords', 'reportTruth'])('rejects a direct %s read, irrespective of the receiver name', key => {
    expect(projectionFindings([{ path, code: `export function view(s) { return s.${key}; }` }], [])).toHaveLength(1);
  });
  it.each([
    'return s["postStates"];',
    'const { postStates: rows } = s; return rows;',
    'const alias = s; return alias?.postStates;',
    'const key = "postStates"; return s[key];',
    'return Reflect.get(s, "postStates");',
    'return `${s.postStates}`;',
  ])('catches bracket, destructuring, alias, reflection and template reads: %s', body => {
    expect(projectionFindings([{ path, code: `export function view(s) { ${body} }` }], [])).toHaveLength(1);
  });
  it('follows renamed imports, local wrappers, barrel exports and callback references', () => {
    const sources = [
      { path, code: 'import { leak as read } from "../bridge.ts"; function wrap(s) { return [s].map(read); } export function view(s) { return wrap(s); }' },
      { path: 'packages/kernel/src/bridge.ts', code: 'export { hidden as leak } from "./hidden.ts";' },
      { path: 'packages/kernel/src/hidden.ts', code: 'export function hidden(s) { return s.battleRecords; }' },
    ];
    const found = projectionFindings(sources, []);
    expect(found).toHaveLength(2); // Both the local wrapper and the exported projection are unsafe.
    expect(found.map(f => f.detail)).toEqual([expect.stringContaining('wrap reaches'), expect.stringContaining('view reaches')]);
  });
  it('does not taint a safe import with an unused function in the same module', () => {
    expect(projectionFindings([
      { path, code: 'import { safe } from "../mixed.ts"; export function view(s) { return safe(s); }' },
      { path: 'packages/kernel/src/mixed.ts', code: 'export function safe(s) { return s.knowledgeBySeat; } export function leak(s) { return s.postStates; }' },
    ], [])).toEqual([]);
  });
  it('ignores comments, string prose, type declarations and copies of received reports', () => {
    expect(projectionFindings([{ path, code: '// s.postStates\n type X = State["postStates"]; const note = "postStates"; export function view(s) { return s.knowledgeBySeat; }' }], [])).toEqual([]);
  });
  it('permits only the exact cited derivation, invalidating the allowance after a body edit', () => {
    const source = { path, code: 'export function ownSeat(s) { return s.postStates; }' };
    const found = projectionFindings([source], [])[0]!;
    const allow = { path, symbol: 'ownSeat', hash: found.hash, citation: 'R48, own-seat identity', reason: 'Only the current seat identity.' };
    expect(projectionFindings([source], [allow])).toEqual([]);
    expect(projectionFindings([{ ...source, code: source.code.replace('s.postStates', 's.personService') }], [allow])).toHaveLength(1);
  });
  it('includes desk and CLI projection folders', () => {
    for (const p of ['prototypes/desk/web/new.ts', 'packages/cli/src/desk/new.ts']) {
      expect(projectionFindings([{ path: p, code: 'export const read = s => s.reportTruth;' }], [])).toHaveLength(1);
    }
  });
  it('reads JSX expressions while ignoring JSX prose and type-only State indexes', () => {
    const path = 'prototypes/desk/web/example.tsx';
    expect(projectionFindings([{ path, code: 'type P = State["postStates"]; export const View = s => <p>postStates {s.personService}</p>;' }], [])).toHaveLength(1);
    expect(projectionFindings([{ path, code: 'export const View = () => <p>postStates are private</p>;' }], [])).toEqual([]);
  });
  it('follows named namespace exports through the kernel-style barrel', () => {
    expect(projectionFindings([
      { path, code: 'import { api } from "../index.ts"; export function view(s) { return api.leak(s); }' },
      { path: 'packages/kernel/src/index.ts', code: 'export * as api from "./hidden.ts";' },
      { path: 'packages/kernel/src/hidden.ts', code: 'export function leak(s) { return s.reportTruth; }' },
    ], [])).toHaveLength(1);
  });
  it.each([
    ['export const leak = s => s.postStates;', 'import { leak } from "../hidden.ts";'],
    ['export default function leak(s) { return s.postStates; }', 'import leak from "../hidden.ts";'],
    ['const read = s => s.postStates; export { read as leak };', 'import { leak } from "../hidden.ts";'],
  ])('follows helper declarations and default/local re-exports: %s', (helper, imported) => {
    expect(projectionFindings([
      { path, code: `${imported} export function view(s) { return leak(s); }` },
      { path: 'packages/kernel/src/hidden.ts', code: helper },
    ], [])).toHaveLength(1);
  });
  it('does not mistake an object key for a read from State', () => {
    expect(projectionFindings([{ path, code: 'export function view() { return { postStates: [] }; }' }], [])).toEqual([]);
  });
  it('checks adapter methods and their local helper methods', () => {
    expect(projectionFindings([{ path: 'prototypes/desk/server/adapter.ts', code: 'export class DeskAdapter { snapshot(s) { return this.hidden(s); } hidden(s) { return s.postStates; } }' }], [])).toHaveLength(2);
  });
  it('invalidates a derivation when an intermediate helper changes its truth target', () => {
    const sources = [
      { path, code: 'import { select } from "../select.ts"; export function view(s) { return select(s); }' },
      { path: 'packages/kernel/src/select.ts', code: 'import { truth } from "./truth.ts"; export function select(s) { return truth(s, s.own); }' },
      { path: 'packages/kernel/src/truth.ts', code: 'export function truth(s, id) { return s.personService[id]; }' },
    ];
    const hash = projectionFindings(sources, [])[0]!.hash;
    const allowed = [{ path, symbol: 'view', hash, reason: 'Only own identity.', citation: '0052, seat identity' }];
    expect(projectionFindings(sources, allowed)).toEqual([]);
    expect(projectionFindings(sources.map(s => s.path.endsWith('/select.ts') ? { ...s, code: s.code.replace('s.own', 's.enemy') } : s), allowed)).toHaveLength(1);
  });
  it.each(['read$(s)', 'api["leak"](s)'])('follows identifier and computed namespace references: %s', expression => {
    expect(projectionFindings([
      { path, code: `import { leak as read$ } from "../hidden.ts"; import * as api from "../hidden.ts"; export function view(s) { return ${expression}; }` },
      { path: 'packages/kernel/src/hidden.ts', code: 'export function leak(s) { return s.reportTruth; }' },
    ], [])).toHaveLength(1);
  });
});
