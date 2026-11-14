import { describe, expect, expectTypeOf, it } from 'vitest';
import { compareIds, hasId, ID_KINDS, IdError, idsOf, lookup, toId, type PersonId, type RegionId } from '../src/ids.ts';

describe('typed ids', () => {
  it('lists each kind once, in strict order', () => {
    expect([...ID_KINDS].sort()).toEqual([...ID_KINDS]);
    expect(new Set(ID_KINDS).size).toBe(ID_KINDS.length);
    for (const kind of ['region', 'edge', 'person', 'post', 'forceBlock', 'situation', 'seat', 'faction', 'bloc']) {
      expect(ID_KINDS).toContain(kind);
    }
  });

  it('brands at the edge and rejects malformed ids', () => {
    expect(toId('region', 'r_shenandoah')).toBe('r_shenandoah');
    for (const bad of ['', ' r1', 'r 1', '_r1', 'r1\n', 'x'.repeat(129)]) {
      expect(() => toId('region', bad)).toThrow(IdError);
    }
  });

  it('keeps kinds apart at compile time', () => {
    const region = toId('region', 'r1');
    expectTypeOf(region).toEqualTypeOf<RegionId>();
    expectTypeOf(region).not.toEqualTypeOf<PersonId>();
    // @ts-expect-error a region id is not a person id
    const person: PersonId = region;
    void person;
    // @ts-expect-error a bare string is not an id
    const raw: RegionId = 'r1';
    void raw;
  });

  it('looks up records and maps, and throws on an unknown id instead of defaulting', () => {
    const r1 = toId('region', 'r1');
    const r2 = toId('region', 'r2');
    const record = { [r1]: 0 } as Partial<Record<RegionId, number>>;
    expect(lookup('region', record, r1)).toBe(0);
    expect(() => lookup('region', record, r2)).toThrow('unknown region id "r2"');
    const map = new Map<RegionId, number>([[r1, 7]]);
    expect(lookup('region', map, r1)).toBe(7);
    expect(() => lookup('region', map, r2)).toThrow(IdError);
  });

  it('does not treat inherited properties as entries', () => {
    const record: Partial<Record<RegionId, number>> = {};
    expect(() => lookup('region', record, toId('region', 'toString'))).toThrow(IdError);
    expect(hasId(record, toId('region', 'constructor'))).toBe(false);
  });

  it('carries the kind and id on the error', () => {
    try {
      lookup('person', {}, toId('person', 'nobody'));
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(IdError);
      expect((e as IdError).kind).toBe('person');
      expect((e as IdError).id).toBe('nobody');
      expect((e as IdError).problem).toBe('unknown');
    }
  });

  it('orders ids by code unit, never by insertion or locale', () => {
    const ids = ['b', 'B', 'a', 'a2', 'a10'].map((s) => toId('post', s));
    const record = Object.fromEntries(ids.map((id) => [id, 1])) as Partial<Record<(typeof ids)[number], number>>;
    expect(idsOf(record)).toEqual(['B', 'a', 'a10', 'a2', 'b']);
    expect(idsOf(new Map(ids.map((id) => [id, 1])))).toEqual(['B', 'a', 'a10', 'a2', 'b']);
    expect(compareIds(ids[0]!, ids[1]!)).toBe(1);
  });
});
