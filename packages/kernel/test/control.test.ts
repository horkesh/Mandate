import { describe, expect, it } from 'vitest';
import { applyControl, ControlError, controlThresholds, initialControl, shareOf } from '../src/control/control.ts';
import type { State } from '../src/root-state.ts';
import { controlTable, F, lineMap, R, startWith } from './support/map-fixture.ts';

const map = lineMap();

/** A State carrying only what the control writer reads (the rest is never touched). */
function stateWith(spec: Parameters<typeof controlTable>[0]): State {
  return { regionControl: controlTable(spec) } as unknown as State;
}

describe('control at the scenario start (0050)', () => {
  it('copies the start, omitting zero shares, in id order', () => {
    const control = initialControl(map, startWith({ mid: { b: 400, a: 500 }, a1: { a: 1000 }, b1: { b: 1000, a: 0 } }));
    expect(control).toEqual({ a1: { a: 1000 }, b1: { b: 1000 }, mid: { a: 500, b: 400 } });
    expect(Object.keys(control)).toEqual(['a1', 'b1', 'mid']);
    expect(shareOf(map, control, R('mid'), F('b'))).toBe(400);
    expect(shareOf(map, control, R('a2'), F('a'))).toBe(0);
    expect(() => shareOf(map, control, R('nowhere'), F('a'))).toThrow('unknown region id "nowhere"');
  });

  it('reports every problem in a start together (positive control)', () => {
    try {
      initialControl(map, startWith({ ghost: { a: 10 }, w: { a: 500 }, mid: { a: 700, b: 400, c: 1 }, a1: { a: 1.5 } }));
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ControlError);
      const problems = (e as ControlError).problems.join('\n');
      for (const p of ['region ghost is not in the World', 'region w is river, which carries no control', 'faction c is not in the World', 'shares sum to 1101', "a's share must be a whole permille, got 1.5"]) {
        expect(problems).toContain(p);
      }
    }
  });
});

describe('the control writer (only `applyControl` changes control)', () => {
  it('applies deltas, takes an excess from the largest other share, and reports each threshold crossed', () => {
    const start = stateWith({ mid: { a: 300, b: 650 } });
    const { state, changes, crossings } = applyControl(map, start, [{ region: R('mid'), faction: F('a'), deltaPermille: 400, cause: 'occupation' }]);
    expect(state.regionControl[R('mid')]).toEqual({ a: 700, b: 300 });
    expect(changes).toEqual([{ region: 'mid', faction: 'a', before: 300, after: 700, cause: 'occupation', takenFrom: [{ faction: 'b', permille: 350 }] }]);
    // b fell through no threshold (650 -> 300 stays above 250); a crossed none upward either (300 was already above both).
    expect(crossings).toEqual([]);
    const second = applyControl(map, state, [{ region: R('mid'), faction: F('b'), deltaPermille: -280, cause: 'combat' }]);
    expect(second.state.regionControl[R('mid')]).toEqual({ a: 700, b: 20 });
    expect(second.crossings).toEqual([
      { region: 'mid', faction: 'b', threshold: 50, direction: 'down', cause: 'combat' },
      { region: 'mid', faction: 'b', threshold: 250, direction: 'down', cause: 'combat' },
    ]);
  });

  it('counts the shares taken from others as crossings too', () => {
    const { crossings } = applyControl(map, stateWith({ mid: { a: 600, b: 300 } }), [{ region: R('mid'), faction: F('a'), deltaPermille: 300, cause: 'occupation' }]);
    expect(crossings).toEqual([{ region: 'mid', faction: 'b', threshold: 250, direction: 'down', cause: 'occupation' }]);
  });

  it('clamps to 0..1000, drops a region no one holds, and keeps shares in id order', () => {
    const { state } = applyControl(map, stateWith({ mid: { a: 100 } }), [
      { region: R('mid'), faction: F('a'), deltaPermille: -500, cause: 'combat' },
      { region: R('a2'), faction: F('b'), deltaPermille: 5000, cause: 'occupation' },
      { region: R('a2'), faction: F('a'), deltaPermille: 10, cause: 'occupation' },
    ]);
    expect(state.regionControl).toEqual({ a2: { a: 10, b: 990 } });
    expect(Object.keys(state.regionControl[R('a2')]!)).toEqual(['a', 'b']);
  });

  it('is copy-on-write: unchanged regions are the same objects, the input is untouched', () => {
    const start = stateWith({ a1: { a: 1000 }, mid: { a: 500 } });
    const before = JSON.stringify(start);
    const { state } = applyControl(map, start, [{ region: R('mid'), faction: F('b'), deltaPermille: 100, cause: 'occupation' }]);
    expect(state.regionControl[R('a1')]).toBe(start.regionControl[R('a1')]);
    expect(JSON.stringify(start)).toBe(before);
    expect(applyControl(map, start, []).state).toBe(start);
  });

  it('refuses control on open water, unknown factions and fractional deltas (positive control)', () => {
    const s = stateWith({});
    expect(() => applyControl(map, s, [{ region: R('w'), faction: F('a'), deltaPermille: 10, cause: 'x' }])).toThrow('carries no control');
    expect(() => applyControl(map, s, [{ region: R('mid'), faction: F('z'), deltaPermille: 10, cause: 'x' }])).toThrow('faction z is not in the World');
    expect(() => applyControl(map, s, [{ region: R('mid'), faction: F('a'), deltaPermille: 0.5, cause: 'x' }])).toThrow('whole permille');
    expect(() => applyControl(map, s, [{ region: R('nowhere'), faction: F('a'), deltaPermille: 10, cause: 'x' }])).toThrow('unknown region id');
  });

  it('reads its thresholds from the pack (0019: 50 and 250 to start)', () => {
    expect(controlThresholds(map)).toEqual([50, 250]);
  });
});
