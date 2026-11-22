import { expect, it, vi } from 'vitest';
import { indexedFixture, R } from './support/seats-fixture.ts';

it('looks up courier distances without constructing composite region keys', () => {
  let recording = false;
  const composite: string[] = [];
  class RecordedMap<K, V> extends Map<K, V> {
    override get(key: K): V | undefined {
      if (recording && typeof key === 'string' && key.includes('|')) composite.push(key);
      return super.get(key);
    }
  }
  vi.stubGlobal('Map', RecordedMap);
  try {
    const world = indexedFixture();
    recording = true;
    expect(world.courierDays(R('a_cap'), R('a_front'))).toBe(3);
    expect(world.courierDays(R('a_front'), R('a_cap'))).toBe(3);
    expect(world.courierDays(R('a_cap'), R('a_cap'))).toBe(0);
    expect(() => world.courierDays(R('missing'), R('a_cap'))).toThrow('no courier path from missing to a_cap');
    expect(composite).toEqual([]);
  } finally { vi.unstubAllGlobals(); }
});
