import { FIXTURE_RULES } from './support/map-fixture.ts';
import { describe, expect, it } from 'vitest';
import { IdError, toId } from '../src/ids.ts';
import { KERNEL_MODULES, OWNED_FIELDS, type KernelModule, type OwnedField } from '../src/ownership.ts';
import { edgeDays, edgesOf, indexWorld, otherEnd, START_OWNERS, worldHash, type EdgeRecord, type World } from '../src/world/index.ts';

const r = (id: string) => toId('region', id);
const edge = (id: string, a: string, b: string, lengthDays = 1, lengthDaysBA: number | null = null): EdgeRecord => ({
  id: toId('edge', id),
  type: 'road',
  a: r(a),
  b: r(b),
  lengthDays,
  lengthDaysBA,
  capacity: 1,
  line: null,
  breakOfBulk: false,
  depthFeet: null,
  seasons: [],
  provenance: [{ source: 'DESIGN', at: null }],
});
const region = (id: string) => ({
  id: r(id),
  name: `region.${id}.name`,
  kind: 'land' as const,
  terrain: 'plain',
  flags: [],
  offMapRole: null,
  weatherZone: null,
  refPoint: null,
  counties: [],
  labelHints: null,
  provenance: [{ source: 'DESIGN', at: null }],
});
const world = (edges: EdgeRecord[]): World => ({
  formatVersion: 2,
  pack: 'fixture',
  rules: { capacityMax: 5, supplyControlPermille: 250, retreatControlPermille: 50, seasons: [], ...FIXTURE_RULES },
  vocabularies: { terrains: [], postKinds: [], departmentKinds: [], arms: [], personKinds: [], traits: [], ranks: [], rankKinds: [], values: [], blocs: [], standingOrderKinds: [] },
  factions: [],
  departments: [],
  regions: [region('a'), region('b'), region('c')],
  installations: [],
  edges,
  railLines: [],
  depots: [],
  weatherZones: [],
  people: [],
  census: [],
});

/** Every writer named for a start part is a State module or writer that owns at least one field (review N4). */
function startOwnerProblems(owners: Readonly<Record<string, string>>, modules: readonly KernelModule[], fields: readonly OwnedField[]): string[] {
  return Object.entries(owners).flatMap(([part, writer]) => {
    const m = modules.find((x) => x.name === writer);
    if (!m) return [`${part}: "${writer}" is not a kernel module`];
    if (m.layer !== 'State' && m.layer !== 'writer') return [`${part}: "${writer}" is ${m.layer}, which writes nothing`];
    if (!fields.some((f) => f.writer === writer)) return [`${part}: "${writer}" owns no field in OWNED_FIELDS`];
    return [];
  });
}

describe('START_OWNERS agrees with the module map and the field table', () => {
  it('names only State modules that own a field', () => {
    expect(startOwnerProblems(START_OWNERS, KERNEL_MODULES, OWNED_FIELDS)).toEqual([]);
  });

  it('flags an unknown module, a module that writes nothing, and one that owns nothing (positive control)', () => {
    expect(startOwnerProblems({ a: 'nowhere', b: 'planner', c: 'view' }, KERNEL_MODULES, OWNED_FIELDS)).toEqual([
      'a: "nowhere" is not a kernel module',
      'b: "planner" is pure, which writes nothing',
      'c: "view" is Derived, which writes nothing',
    ]);
    expect(startOwnerProblems({ d: 'weather' }, KERNEL_MODULES, [])).toEqual(['d: "weather" owns no field in OWNED_FIELDS']);
  });
});

describe('the World index (world/graph)', () => {
  it("lists a region's edges in id order, never insertion order", () => {
    const idx = indexWorld(world([edge('z:a:b', 'a', 'b'), edge('m:a:c', 'a', 'c')]));
    expect(edgesOf(idx, r('a')).map((e) => e.id)).toEqual(['m:a:c', 'z:a:b']);
    expect(edgesOf(idx, r('b')).map((e) => e.id)).toEqual(['z:a:b']);
  });

  it('throws on an unknown region, never returning an empty list', () => {
    const idx = indexWorld(world([]));
    expect(() => edgesOf(idx, r('nowhere'))).toThrow(IdError);
    expect(() => indexWorld(world([edge('x:a:q', 'a', 'q')]))).toThrow('unknown region id "q"');
  });

  it('gives the far end and the length in each direction', () => {
    const e = edge('river:a:b', 'a', 'b', 2, 1);
    expect(otherEnd(e, r('a'))).toBe('b');
    expect(edgeDays(e, r('a'))).toBe(2);
    expect(edgeDays(e, r('b'))).toBe(1);
    expect(edgeDays(edge('road:a:b', 'a', 'b', 3), r('b'))).toBe(3);
    expect(() => otherEnd(e, r('c'))).toThrow(IdError);
  });

  it('hashes the World canonically, independent of key order', () => {
    const w1 = world([edge('road:a:b', 'a', 'b')]);
    const reverseKeys = (v: unknown): unknown =>
      Array.isArray(v) ? v.map(reverseKeys) : v !== null && typeof v === 'object' ? Object.fromEntries(Object.entries(v).reverse().map(([k, x]) => [k, reverseKeys(x)])) : v;
    const w2 = reverseKeys(w1) as World;
    expect(Object.keys(w2)[0]).toBe('census');
    expect(worldHash(w1)).toMatch(/^[0-9a-f]{64}$/);
    expect(worldHash(w2)).toBe(worldHash(w1));
  });
});
