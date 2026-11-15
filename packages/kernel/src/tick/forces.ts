/**
 * The tick's forces phases (FOUNDATION section 10, lane 0.5). They run only when
 * the World carries lane 0.2's map:
 * - day-tick phase 4, the simple control contest and occupation, after movement
 *   and before control: it proposes control deltas and applies retreats;
 * - day-tick phase 6, stores on hand, after control and the derived map, so a
 *   pocket closed today starves its garrison today.
 */
import { contest, type ContestRecord, type Retreat } from '../combat/contest.ts';
import { applyCommandProposals, DEPARTMENT_SIDE_FIELD } from '../command/command.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import { deriveMap, type DerivedMap } from '../control-index/derived.ts';
import { passageOf, reportPocketChanges } from './passage.ts';
import { applyRetreats } from '../movement/march.ts';
import { storesStep } from '../forces/stores.ts';
import type { State } from '../root-state.ts';
import { fire, type TickContext } from './context.ts';
import { dateOfDay } from '../world/calendar.ts';

/** Every mechanic the forces phases count (FOUNDATION section 11.5). Declared with the map's. */
export const FORCES_MECHANICS = [
  'combat.contest',
  'combat.occupation',
  'combat.retreat',
  'combat.retreat_blocked',
  'command.government_closed',
  'command.government_reopened',
  'command.proposal_refused',
  'command.side_changed',
  'forces.stores_fell',
  'forces.stores_low',
  'forces.stores_refilled',
] as const;

/**
 * Situations' proposals that `command` owns (a neutral government closing or reopening its
 * territory: 0055, 0058; a government joining a side: 0065), applied right after the situations
 * phase that made them. The map
 * phase has already run today, so this phase reports the pockets a closing makes itself, and
 * hands back the day's map as it now is: the barrier and the tick's result never carry a map
 * State has moved past. Movement and the contest see the closing from tomorrow morning.
 */
export function commandProposalsPhase(ctx: TickContext, state: State): { readonly state: State; readonly derived: DerivedMap | null } {
  const map = ctx.world.map;
  const mine = ctx.proposals.flatMap((p) => (p.proposal === 'effect' && p.owner === 'command' ? [p] : []));
  if (mine.length === 0) return { state, derived: null };
  const result = applyCommandProposals(map, state, mine, ctx.day);
  for (const a of result.applied) {
    if (a.field === DEPARTMENT_SIDE_FIELD) {
      // A change of side is its own event, never a closing (0065).
      if (a.side !== null) {
        ctx.mapEvents.push({ event: 'side_changed', change: a.side });
        fire(ctx, 'command.side_changed');
      }
      continue;
    }
    ctx.mapEvents.push({ event: 'government_changed', department: a.subject, change: a.change });
    if (a.change === 'closed') fire(ctx, 'command.government_closed');
    if (a.change === 'reopened') fire(ctx, 'command.government_reopened');
  }
  for (const { reason, why } of result.refused) {
    ctx.mapEvents.push({ event: 'proposal_refused', owner: 'command', reason, why });
    fire(ctx, 'command.proposal_refused');
  }
  // The cause first, then what it did: the pockets the closing, reopening or change of side makes, today.
  let derived: DerivedMap | null = null;
  if (result.state.closedGovernments !== state.closedGovernments || result.state.departmentFactions !== state.departmentFactions) {
    const month = dateOfDay(state.calendarStart!, ctx.day).month;
    const before = deriveMap(map, { control: state.regionControl, month, network: passageOf(map, state) });
    derived = deriveMap(map, { control: result.state.regionControl, month, network: passageOf(map, result.state) });
    reportPocketChanges(ctx, before, derived);
  }
  return { state: result.state, derived };
}

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
  const network = passageOf(map, state);
  // The control index alone (no supply), built fresh: the derived map's cache stays the map phase's.
  const result = contest({ map, index: buildControlIndex(map, state.regionControl), network, month }, state);
  for (const r of result.records) {
    ctx.mapEvents.push({ event: 'contest', record: r });
    // A stalemate (the stronger side already holds it all) is a record, not a live contest: it fires nothing (exit review S2c).
    if (r.kind === 'stalemate') continue;
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
