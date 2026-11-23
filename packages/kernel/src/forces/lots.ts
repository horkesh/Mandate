/** Regiment quantities belong to forces (0108). No lot has a location or commander. */
import { strictCompare } from '../compare.ts';
import type { Enlistment } from './enlistment.ts';
import type { ForceBlockState } from './forces.ts';

export interface RegimentLot {
  readonly lotId: string;
  /** Catalogue identity; null for a formation whose regiment identity is not established. */
  readonly lotRegiment: string | null;
  readonly lotGenerated: boolean;
  readonly lotArm: string;
  readonly lotMen: number | null;
  readonly lotStragglers: number | null;
  readonly lotService: Enlistment | null;
}

export interface ForceTotals {
  readonly fbStrength: number | null;
  readonly fbStragglers: number | null;
}

/** Caller-held, disposable derived data; never part of World data or saved State. */
export type ForceTotalsCache = WeakMap<readonly RegimentLot[], ForceTotals>;

export function forceTotals(block: Pick<ForceBlockState, 'fbLots'>, cache?: ForceTotalsCache): ForceTotals {
  const hit = cache?.get(block.fbLots);
  if (hit !== undefined) return hit;
  const totals = aggregateLots(block.fbLots);
  cache?.set(block.fbLots, totals);
  return totals;
}

/** Existing unlabelled formation, not a claim that a regiment has been identified. */
export function unidentifiedLot(id: string, arm: string, men: number | null, stragglers: number | null = 0, service: Enlistment | null = null): RegimentLot {
  return { lotId: id, lotRegiment: null, lotGenerated: false, lotArm: arm, lotMen: men, lotStragglers: stragglers, lotService: service };
}

export function aggregateLots(lots: readonly RegimentLot[]): ForceTotals {
  let present = 0;
  let absent = 0;
  let unknown = false;
  let unknownAbsent = false;
  for (const l of lots) {
    if (l.lotMen === null) unknown = true;
    else present += l.lotMen;
    if (l.lotStragglers === null) unknownAbsent = true;
    else absent += l.lotStragglers;
  }
  return { fbStrength: unknown ? null : present, fbStragglers: unknownAbsent ? null : absent };
}

/** Only accounted stragglers can return or be captured. An incomplete sum stays unknown in returns. */
export function knownStragglers(block: Pick<ForceBlockState, 'fbLots'>, cache?: ForceTotalsCache): number {
  return forceTotals(block, cache).fbStragglers ?? block.fbLots.reduce((sum, lot) => sum + (lot.lotStragglers ?? 0), 0);
}

/**
 * Proportional integer allocation: floor each share, then one remainder per eligible
 * lot in strict identity order. For a reduction the weights are the men removed
 * from; for an addition use the returning stragglers, or current men if none.
 * Unknown men are never quantified by a loss or reinforcement.
 */
function allocate(lots: readonly RegimentLot[], amount: number, weights: readonly number[]): readonly number[] {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError('lot allocation must be whole and nonnegative');
  const total = weights.reduce((n, w) => n + w, 0);
  const shares = weights.map(w => total === 0 ? 0 : Math.trunc(amount * w / total));
  let remainder = amount - shares.reduce((n, w) => n + w, 0);
  const ordered = lots.map((l, i) => ({ id: l.lotId, i })).sort((a, b) => strictCompare(a.id, b.id));
  if (remainder > 0 && total === 0) throw new RangeError('no known lot can receive the quantity');
  for (const { i } of ordered) if (remainder > 0 && weights[i]! > 0) { shares[i] = shares[i]! + 1; remainder--; }
  if (remainder !== 0) throw new RangeError('lot allocation did not conserve the quantity');
  return shares;
}

/** Set exact block totals through the lots, without changing identity or service. */
export function changeLotTotals(lots: readonly RegimentLot[], men: number | null, stragglers: number): readonly RegimentLot[] {
  const before = aggregateLots(lots);
  if (men !== null && (!Number.isSafeInteger(men) || men < 0)) throw new RangeError('invalid lot men');
  if (!Number.isSafeInteger(stragglers) || stragglers < 0) throw new RangeError('invalid lot stragglers');
  if ((men === null) !== (before.fbStrength === null)) throw new RangeError('a quantity change cannot resolve unknown men');
  const delta = men === null ? 0 : men - before.fbStrength!;
  const knownAbsent = before.fbStragglers ?? lots.reduce((sum, lot) => sum + (lot.lotStragglers ?? 0), 0);
  const menWeights = lots.map(l => delta < 0 ? l.lotMen ?? 0 : (knownAbsent > 0 ? l.lotStragglers ?? 0 : before.fbStrength === 0 && l.lotMen !== null ? 1 : l.lotMen ?? 0));
  const menParts = allocate(lots, Math.abs(delta), menWeights);
  const absentDelta = stragglers - knownAbsent;
  const absentParts = allocate(lots, Math.abs(absentDelta), lots.map((l, i) => l.lotStragglers === null ? 0 : absentDelta < 0 ? l.lotStragglers : delta < 0 ? menParts[i]! : l.lotMen ?? 0));
  return lots.map((l, i) => ({ ...l,
    lotMen: l.lotMen === null ? null : l.lotMen + Math.sign(delta) * menParts[i]!,
    lotStragglers: l.lotStragglers === null ? null : l.lotStragglers + Math.sign(absentDelta) * absentParts[i]!,
  }));
}
