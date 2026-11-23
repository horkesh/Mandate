import { describe, expect, it } from 'vitest';
import { aggregateLots, changeLotTotals, forceTotals, type RegimentLot } from '../src/forces/lots.ts';
import { toId } from '../src/ids.ts';

const lot = (id: string, men: number | null, stragglers = 0): RegimentLot => ({
  lotId: id, lotRegiment: null, lotGenerated: false, lotArm: 'infantry',
  lotMen: men, lotStragglers: stragglers, lotService: null,
});

describe('regiment quantities (0108, S70)', () => {
  it('derives exact totals and preserves unknown men', () => {
    expect(aggregateLots([lot('b', 3, 2), lot('a', 2, 1)])).toEqual({ fbStrength: 5, fbStragglers: 3 });
    expect(aggregateLots([lot('a', null), lot('b', 2)])).toEqual({ fbStrength: null, fbStragglers: 0 });
  });
  it('allocates losses proportionally with integer remainders in identity order', () => {
    const input = [lot('b', 3), lot('a', 3)];
    const after = changeLotTotals(input, 3, 1);
    expect(after.map(x => [x.lotId, x.lotMen, x.lotStragglers])).toEqual([['b', 2, 0], ['a', 1, 1]]);
    expect(aggregateLots(after)).toEqual({ fbStrength: 3, fbStragglers: 1 });
    expect(input.map(x => x.lotMen)).toEqual([3, 3]);
  });
  it('returns and captures stragglers exactly without guessing unknown strength', () => {
    const a = [lot('a', 0, 2), lot('b', 0, 1)];
    expect(aggregateLots(changeLotTotals(a, 2, 1))).toEqual({ fbStrength: 2, fbStragglers: 1 });
    expect(changeLotTotals([lot('a', null, 2)], null, 1)[0]!.lotMen).toBeNull();
  });
  it('reuses derived totals across block changes that retain the same lots', () => {
    const cache = new WeakMap();
    const b = { fbLots: [lot('a', 8)] };
    const before = forceTotals(b, cache);
    expect(forceTotals({ ...b }, cache)).toBe(before);
    expect(forceTotals({ ...b, fbLots: changeLotTotals(b.fbLots, 7, 0) }, cache)).not.toBe(before);
    expect(cache.has(b.fbLots)).toBe(true);
  });
  it('can reinforce an exhausted known lot and never returns negative men', () => {
    expect(aggregateLots(changeLotTotals([lot('a', 0), lot('b', 0)], 3, 0)).fbStrength).toBe(3);
    for (let n = 0; n <= 10; n++) {
      const after = changeLotTotals([lot('b', 7), lot('a', 3)], 10 - n, n);
      expect(after.every(l => l.lotMen! >= 0 && l.lotMen! + l.lotStragglers === (l.lotId === 'a' ? 3 : 7))).toBe(true);
    }
  });
  it('derives expiry from each regiment rather than a saved block total', () => {
    const service = { enlPost: toId('post', 'governor'), enlRaisedBy: null, enlCall: toId('message', 'call'), enlRegiments: 1, enlMusterDay: 4, enlEndsDay: 94 };
    const input = [{ ...lot('a', 10), lotService: service }, { ...lot('b', 10), lotService: { ...service, enlEndsDay: 184 } }];
    expect(Math.min(...input.map(x => x.lotService.enlEndsDay))).toBe(94);
  });
});
