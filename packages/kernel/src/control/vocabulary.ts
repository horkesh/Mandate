import type { EdgeId, FactionId, RegionId } from '../ids.ts';

/** Whole permille per faction, with zero shares omitted. */
export type ControlShares = Readonly<Record<FactionId, number>>;

/** Control by region. A region absent here has no shares. */
export type RegionControlTable = Readonly<Record<RegionId, ControlShares>>;

export interface FrontSegment {
  readonly faction: FactionId;
  readonly edge: EdgeId;
  /** The faction's own end. */
  readonly own: RegionId;
  /** The enemy's end, which the segment faces. */
  readonly faces: RegionId;
  readonly enemy: FactionId;
}
