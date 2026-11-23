import type { ForceBlockState } from '../../src/forces/forces.ts';
import { forceTotals, unidentifiedLot } from '../../src/forces/lots.ts';
import type { Enlistment } from '../../src/forces/enlistment.ts';

/** Fixture adapter for the old quantity overrides. No expected quantity is changed. */
export function patchBlock(block: ForceBlockState, patch: Partial<ForceBlockState> & { fbStrength?: number | null; fbStragglers?: number }): ForceBlockState {
  const { fbStrength, fbStragglers, ...rest } = patch;
  const before = forceTotals(block);
  if (fbStrength === undefined && fbStragglers === undefined) return { ...block, ...rest };
  const first = block.fbLots[0]!;
  return { ...block, ...rest, fbLots: [unidentifiedLot(first.lotId, block.fbArm,
    fbStrength === undefined ? before.fbStrength : fbStrength, fbStragglers ?? before.fbStragglers, first.lotService)] };
}

export function patchService(block: ForceBlockState, patch: Partial<Enlistment>): ForceBlockState {
  return { ...block, fbLots: block.fbLots.map(l => ({ ...l, lotService: l.lotService === null ? null : { ...l.lotService, ...patch } })) };
}

/** Observe the former block schema, keeping all old expectations byte-for-byte. */
export function observeBlock(block: ForceBlockState): Omit<ForceBlockState, 'fbLots'> & ReturnType<typeof forceTotals> {
  const { fbLots: _lots, ...rest } = block;
  return { ...rest, ...forceTotals(block) };
}
