/**
 * The tick's forces phases (FOUNDATION section 10, lane 0.5). They run only when
 * the World carries lane 0.2's map:
 * - day-tick phase 4, combat (lane 1.3: battles and occupation), after movement and
 *   before control: it applies each owner's proposals, and hands control deltas to the map phase;
 * - day-tick phase 6, stores on hand, after control and the derived map, so a
 *   pocket closed today starves its garrison today.
 */
import { combatDay, type CombatResult } from '../combat/battle.ts';
import { applyBattleRecords } from '../combat/records.ts';
import { applyCombatCommand, applyCommandProposals, DEPARTMENT_SIDE_FIELD } from '../command/command.ts';
import { applyForces } from '../forces/forces.ts';
import { stragglersStep } from '../forces/stragglers.ts';
import type { ForceBlockId } from '../ids.ts';
import { applyPeopleChanges } from '../people/people.ts';
import { applyFortification } from '../regions/regions.ts';
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
  'combat.battle_closed',
  'combat.battle_day',
  'combat.battle_opened',
  'combat.breakout',
  'combat.captured',
  'combat.cut_off',
  'combat.destroyed',
  'combat.flank_broken',
  'combat.general_hit',
  'combat.killed_wounded',
  'combat.missing',
  'combat.occupation',
  'combat.pursuit_chosen',
  'combat.records_pruned',
  'combat.routed',
  'combat.surrendered',
  'combat.works_stormed',
  'combat.withdrew',
  'command.government_closed',
  'command.government_reopened',
  'command.proposal_refused',
  'command.side_changed',
  'forces.stores_fell',
  'forces.stores_low',
  'forces.stores_refilled',
  'forces.stragglers_returned',
] as const;

/**
 * Situations' proposals that `command` owns (a neutral government closing or reopening its
 * territory: 0055, 0058; a government joining a side: 0065), applied right after the situations
 * phase that made them. The map
 * phase has already run today, so this phase reports the pockets a closing makes itself, and
 * hands back the day's map as it now is: the barrier and the tick's result never carry a map
 * State has moved past. Movement and combat see the closing from tomorrow morning.
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
 * Combat (lane 1.3): today's battles and occupations. Each owner applies what combat proposes to it, in this phase:
 * `forces` the losses, condition, routs and surrenders; `combat` its records; `movement` the retreats; `people` a
 * commander's status; `command` his post's vacancy and a surrendered block's release. Control deltas go to
 * `ctx.controlDeltas` for the map phase to apply. Returns the new State and the day's result (truth, for the run report
 * and for lane 1.4's reports to tell).
 */
export function combatPhase(ctx: TickContext, state: State): { readonly state: State; readonly result: CombatResult | null } {
  const map = ctx.world.map;
  if (map === null) return { state, result: null };
  if (state.calendarStart === null) throw new RangeError('this game has no calendar (no map)');
  const month = dateOfDay(state.calendarStart, ctx.day).month;
  const network = passageOf(map, state);
  // The control index alone (no supply), built fresh: the derived map's cache stays the map phase's.
  const result = combatDay(ctx.world, { map, index: buildControlIndex(map, state.regionControl), network, month }, state, ctx.day);
  for (const o of result.occupations) {
    ctx.mapEvents.push({ event: 'occupation', record: o });
    fire(ctx, 'combat.occupation', o.deltaPermille);
  }
  for (const q of result.quiet) {
    ctx.mapEvents.push({ event: 'battle_closed', battle: q.battle, lastDay: q.lastDay });
    fire(ctx, 'combat.battle_closed');
  }
  for (const f of result.fought) {
    ctx.mapEvents.push({ event: 'battle', fought: f });
    if (f.opened) fire(ctx, 'combat.battle_opened');
    fire(ctx, 'combat.battle_day');
    if (f.closed) fire(ctx, 'combat.battle_closed');
    for (const s of f.day.bdaySides) {
      if (s.bsideKw > 0) fire(ctx, 'combat.killed_wounded', s.bsideKw);
      if (s.bsideMissing > 0) fire(ctx, 'combat.missing', s.bsideMissing);
      if (s.bsideCaptured > 0) fire(ctx, 'combat.captured', s.bsideCaptured);
      if (s.bsideFlankBroken) fire(ctx, 'combat.flank_broken');
      if (s.bsideResult === 'routed') fire(ctx, 'combat.routed');
      else if (s.bsideResult === 'withdrew') fire(ctx, 'combat.withdrew');
      if (s.bsideCutOff !== null) fire(ctx, 'combat.cut_off');
      if (s.bsideCutOff === 'surrender') fire(ctx, 'combat.surrendered');
      if (s.bsideCutOff === 'destroyed') fire(ctx, 'combat.destroyed');
      if (s.bsideCutOff === 'break_out') fire(ctx, 'combat.breakout');
      if (s.bsideHit !== null) fire(ctx, 'combat.general_hit');
      if (s.bsidePursue !== null && s.bsidePursue !== 'none') fire(ctx, 'combat.pursuit_chosen');
    }
  }
  for (const r of result.retreats) ctx.mapEvents.push({ event: 'retreat', retreat: r });
  ctx.controlDeltas.push(...result.control);
  let next = applyForces(state, result.forces).state;
  next = applyBattleRecords(next, result.records);
  next = applyRetreats(next, result.retreats, ctx.day);
  next = applyPeopleChanges(next, result.people, ctx.day, ctx.world.rules.people);
  next = applyCombatCommand(next, result.command);
  const stormed = applyFortification(next, result.fortification);
  for (const c of stormed.changes) fire(ctx, 'combat.works_stormed', c.before - c.after);
  next = stormed.state;
  return { state: next, result };
}
/**
 * Eat a day and refill from supply; report blocks crossing the low-stores threshold as map events (truth). Then stragglers
 * rejoin blocks in supply that did not fight today (lane 1.3, P8).
 */
export function storesPhase(ctx: TickContext, state: State, derived: DerivedMap | null, inBattle: ReadonlySet<ForceBlockId> = new Set()): State {
  const map = ctx.world.map;
  if (map === null || derived === null) return state;
  const back = stragglersStep(map, state, derived.supply, inBattle);
  for (const c of back.changes) fire(ctx, 'forces.stragglers_returned', c.before - c.after);
  const result = storesStep(map, back.state, derived.supply);
  for (const c of result.changes) fire(ctx, c.after < c.before ? 'forces.stores_fell' : 'forces.stores_refilled', c.after - c.before);
  for (const crossing of result.crossings) {
    ctx.mapEvents.push({ event: 'stores_crossed', crossing });
    if (crossing.direction === 'down') fire(ctx, 'forces.stores_low');
  }
  return result.state;
}
