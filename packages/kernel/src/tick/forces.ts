/**
 * The tick's forces phases (FOUNDATION section 10, lane 0.5). They run only when
 * the World carries lane 0.2's map:
 * - day-tick phase 4, the simple control contest and occupation, after movement
 *   and before control: it proposes control deltas and applies retreats;
 * - day-tick phase 6, stores on hand, after control and the derived map, so a
 *   pocket closed today starves its garrison today.
 */
import { contest, type ContestRecord, type Retreat } from '../combat/contest.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import type { DerivedMap } from '../control-index/derived.ts';
import { networkOf } from '../infrastructure/infrastructure.ts';
import { applyRetreats } from '../movement/march.ts';
import { storesStep } from '../forces/stores.ts';
import type { State } from '../root-state.ts';
import { fire, type TickContext } from './context.ts';
import { dateOfDay } from '../world/calendar.ts';

/** Every mechanic the forces phases count (FOUNDATION section 11.5). Declared with the map's. */
export const FORCES_MECHANICS = ['combat.contest', 'combat.occupation', 'combat.retreat', 'combat.retreat_blocked', 'forces.stores_fell', 'forces.stores_low', 'forces.stores_refilled'] as const;

/**
 * The contest and occupation: control deltas go to `ctx.controlDeltas` for the map
 * phase to apply; retreats are applied now, by `movement`. Returns the new State
 * and the day's records and retreats (truth, for the run report and reports to tell).
 */
export function contestPhase(ctx: TickContext, state: State): { readonly state: State; readonly records: readonly ContestRecord[]; readonly retreats: readonly Retreat[] } {
  const map = ctx.world.map;
  if (map === null) return { state, records: [], retreats: [] };
  if (state.calendarStart === null) throw new RangeError('this game has no calendar (no map)');
  const month = dateOfDay(state.calendarStart, ctx.day).month;
  const network = networkOf(state);
  // The control index alone (no supply), built fresh: the derived map's cache stays the map phase's.
  const result = contest({ map, index: buildControlIndex(map, state.regionControl), network, month }, state);
  for (const r of result.records) {
    ctx.mapEvents.push({ event: 'contest', record: r });
    if (r.gainer !== null) fire(ctx, r.kind === 'occupation' ? 'combat.occupation' : 'combat.contest', r.deltaPermille);
    else fire(ctx, 'combat.contest', 0);
  }
  ctx.controlDeltas.push(...result.deltas);
  for (const r of result.retreats) {
    ctx.mapEvents.push({ event: 'retreat', retreat: r });
    fire(ctx, r.to === null ? 'combat.retreat_blocked' : 'combat.retreat');
  }
  return { state: applyRetreats(state, result.retreats, ctx.day), records: result.records, retreats: result.retreats };
}

/** Eat a day and refill from supply; report blocks crossing the low-stores threshold as map events (truth). */
export function storesPhase(ctx: TickContext, state: State, derived: DerivedMap | null): State {
  const map = ctx.world.map;
  if (map === null || derived === null) return state;
  const result = storesStep(map, state, derived.supply);
  for (const c of result.changes) fire(ctx, c.after < c.before ? 'forces.stores_fell' : 'forces.stores_refilled', c.after - c.before);
  for (const crossing of result.crossings) {
    ctx.mapEvents.push({ event: 'stores_crossed', crossing });
    if (crossing.direction === 'down') fire(ctx, 'forces.stores_low');
  }
  return result.state;
}
