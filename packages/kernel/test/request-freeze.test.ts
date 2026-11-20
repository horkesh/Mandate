import { expect, it, vi } from 'vitest';
import { pendingRequests } from '../src/seats/requests.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache } from '../src/view/view.ts';
import { indexedFixture } from './support/seats-fixture.ts';

it('walks shared view children once while still deeply freezing every new request', () => {
  const world = indexedFixture();
  const state = createState(world, { seed: 1 });
  const cache = createViewCache();
  const values = vi.spyOn(Object, 'values');
  let walks: number;
  try {
    const first = pendingRequests(world, state, cache);
    const again = pendingRequests(world, state, cache);
    const next = pendingRequests(world, { ...state, stateDay: 1 }, cache);
    const reports = first[0]!.view.reports;
    expect(again[0]!.view.reports).toBe(reports);
    expect(next[0]!.view.reports).toBe(reports);
    walks = values.mock.calls.filter(([value]) => value === reports).length;
    for (const request of [...first, ...again, ...next]) {
      expect(Object.isFrozen(request)).toBe(true);
      expect(Object.isFrozen(request.menu)).toBe(true);
      if (request.menu.menuKind === 'principal') {
        const commandable = request.menu.commandable;
        expect(() => (commandable as unknown[]).push(null)).toThrow(TypeError);
      }
    }
  } finally { values.mockRestore(); }
  expect(walks).toBe(1);
  // A different caller owns a separate ledger and still freezes the whole graph.
  const fresh = pendingRequests(world, state, createViewCache());
  expect(Object.isFrozen(fresh[0]!.view.reports)).toBe(true);
});
