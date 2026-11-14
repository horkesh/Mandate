/**
 * A synthetic map at least the size of the Union map, for the performance
 * test. Setting-free. The Union draft (lane 0.3) has 263 regions and 931
 * edges; this has 270 and 971.
 *
 * A 27 x 10 grid with diagonals: roads everywhere, a rail line
 * along every other row, a river down column 6, mud and low-water seasons on
 * a third of the edges. Faction `a` holds columns 0-12, `b` columns 14-26,
 * column 13 is contested, so there are fronts the whole height of the map.
 * Sources sit in the outer columns, forward depots two columns behind each
 * front, and a few pockets are cut out behind the lines.
 */
import { strictCompare } from '../../src/compare.ts';
import type { EdgeRecord } from '../../src/world/graph.ts';
import type { WorldIndex } from '../../src/world/index.ts';
import type { RegionControlTable } from '../../src/control/control.ts';
import { controlTable, depot, edge, mapIndex, region } from './map-fixture.ts';

export const COLS = 27;
export const ROWS = 10;

const id = (c: number, r: number) => `g${String(c).padStart(2, '0')}_${r}`;

export function unionSizeMap(): WorldIndex {
  const regions = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) regions.push(region(id(c, r)));
  const edges: EdgeRecord[] = [];
  let n = 0;
  const seasons = () => {
    n++;
    if (n % 3 === 0) return [{ reason: 'mud' as const, months: [1, 2, 3, 12], depthFeet: null }];
    if (n % 7 === 0) return [{ reason: 'low_water' as const, months: [8, 9, 10], depthFeet: 3 }];
    return [];
  };
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (c + 1 < COLS) {
        const rail = r % 2 === 0;
        edges.push(edge(id(c, r), id(c + 1, r), rail ? { type: 'rail', line: `row_${r}`, days: 1, capacity: 4, seasons: seasons() } : { days: 2, capacity: 3, seasons: seasons() }));
      }
      if (r + 1 < ROWS) edges.push(edge(id(c, r), id(c, r + 1), c === 6 ? { type: 'river', days: 1, daysBA: 2, capacity: 4, seasons: seasons() } : { days: 2, capacity: 2, seasons: seasons() }));
      if (c + 1 < COLS && r + 1 < ROWS) {
        edges.push(edge(id(c, r), id(c + 1, r + 1), { days: 3, capacity: 1, seasons: seasons() }));
        edges.push(edge(id(c + 1, r), id(c, r + 1), { days: 3, capacity: 1, seasons: seasons() }));
      }
    }
  }
  const depots = [];
  for (let r = 0; r < ROWS; r += 3) {
    depots.push(depot(`src_a_${r}`, id(0, r), 'source', 5), depot(`src_b_${r}`, id(COLS - 1, r), 'source', 5));
    depots.push(depot(`fwd_a_${r}`, id(11, r), 'depot', 3), depot(`fwd_b_${r}`, id(15, r), 'depot', 3));
  }
  return mapIndex({ regions, edges: edges.sort((x, y) => strictCompare(x.id, y.id)), depots });
}

/** Control for the synthetic map. `shift` moves the contested column, to force a recompute. */
export function unionSizeControl(shift = 0): RegionControlTable {
  const spec: Record<string, Record<string, number>> = {};
  const front = 13 + shift;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (c < front) spec[id(c, r)] = { a: 1000 };
      else if (c > front) spec[id(c, r)] = { b: 1000 };
      else spec[id(c, r)] = r % 2 === 0 ? { a: 400, b: 500 } : { a: 520, b: 300 };
    }
  }
  // Pockets behind the lines: b holds a ring around (4, 4) in a's territory.
  for (const [c, r] of [[3, 3], [4, 3], [5, 3], [3, 4], [5, 4], [3, 5], [4, 5], [5, 5]] as const) spec[id(c, r)] = { b: 1000 };
  return controlTable(spec);
}
