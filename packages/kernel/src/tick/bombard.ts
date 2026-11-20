/**
 * The bombardment stage in the tick (lane 1.12). The battle model decides and proposes (`combat/bombard.ts`, `fortDay`);
 * this applies each proposal through its owner and tells both principals:
 * - `forces`: the defenders' morale and their killed and wounded (R4: only `battle_losses` takes men); on surrender,
 *   their capture, or their leaving play under the record's terms (a disbanding with that typed cause);
 * - `movement` and `command`: an evacuated garrison is removed and unassigned; a captured one is released;
 * - `command` and `people`: the commander leaves his post; captured, his status changes, evacuated, he keeps serving;
 * - `regions`: the fort's works wear (the stage's works list, applied with the operations phase's);
 * - `control`: the fort passes to the attacker (proposed, applied with the day's control changes).
 * The reports state only the record's terms (0074): the token, with the record's source in the truth beside it. Nothing
 * here reads or writes a town's people (0029; SENSITIVE-HISTORY 3.6), and no text names who built the works.
 */
import { applyCombatCommand } from '../command/command.ts';
import { musterAssignments } from '../command/levies.ts';
import { bombardRecords, fortDay, type FortDay } from '../combat/bombard.ts';
import { applyBattleRecords } from '../combat/records.ts';
import { JUDGE } from '../combat/order-kinds.ts';
import { applyMusters } from '../forces/enlistment.ts';
import { applyForces } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { ReportClaim } from '../knowledge/report.ts';
import { term } from '../knowledge/truth.ts';
import { placeAndRemove } from '../movement/movement.ts';
import { applyPeopleChanges } from '../people/people.ts';
import type { State } from '../root-state.ts';
import type { FortificationDelta } from '../regions/regions.ts';
import { fire, sendReport, type TickContext } from './context.ts';

export const BOMBARD_MECHANICS = ['combat.bombardment', 'combat.evacuated'] as const;

export interface BombardResult {
  readonly state: State;
  /** The day's fire, or null when no defender stood in the fort. */
  readonly fort: FortDay | null;
}

/** One day's bombardment of `objective` by `attackers` (standing at their shore), applied. */
export function bombardFort(ctx: TickContext, start: State, attackerPost: PostId, attackers: readonly ForceBlockId[], objective: RegionId, side: FactionId, works: FortificationDelta[]): BombardResult {
  const { world, day } = ctx;
  const fort = fortDay(world, start, attackers, objective, side, (post) => (post === null ? JUDGE : (ctx.battleOrders?.get(post)?.cutOff ?? JUDGE)), day);
  if (fort === null) return { state: start, fort: null };
  fire(ctx, 'combat.bombardment');
  fire(ctx, 'combat.battle_day');
  if (fort.day.losses > 0) fire(ctx, 'combat.killed_wounded', fort.day.losses);
  // The garrison reports today's fire even if it holds. A received phase claim, never an authorization flag,
  // can tell its principal that bombardment began. Send before a surrender vacates the commander's post.
  if (fort.commander !== null) {
    sendReport(ctx, start, {
      body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: fort.commander, reportAuthorPost: fort.defPost,
        reportSubjectKind: 'region', reportSubjectId: objective, reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null,
        reportClaims: [{ claimKind: 'battle-phase', claimRegion: objective, claimValue: 1, claimToken: 'bombard', claimConfidence: 1000 }] },
      truth: { truthTerms: fort.day.terms.map((x) => term('observed', x.btermValue, { region: objective, rule: x.btermKind })), truthTrimmed: [] },
      to: world.faction(fort.defFaction).principal, fromRegion: objective, tag: `bombard.${objective}`,
    });
    fire(ctx, 'reports.battle_dispatch');
  }
  works.push(...fort.works);
  let state = applyBattleRecords(start, bombardRecords(world, start, fort, attackerPost, attackers, objective, side, day));
  state = applyForces(state, fort.forces).state;
  if (fort.surrendered === null) return { state, fort };

  if (fort.musters.length > 0) {
    const gone = applyMusters(world.map, state, fort.musters);
    state = musterAssignments(placeAndRemove(world.map, gone.state, [], gone.disbanded), [], [], gone.disbanded);
    fire(ctx, 'combat.evacuated', gone.disbanded.length);
  }
  if (fort.surrendered === 'captured') fire(ctx, 'combat.captured', fort.men);
  fire(ctx, 'combat.surrendered');
  state = applyCombatCommand(state, fort.command);
  state = applyPeopleChanges(state, fort.people, day, world.rules.people, world.map.world.vocabularies.ranks);
  ctx.controlDeltas.push(...fort.control);

  // The reports: the fort's commander tells his principal (evacuated, or captured under a flag of truce); the attacker's
  // commander wires his. Each states only the terms the record gives, as a typed token.
  const why = [...fort.day.terms.map((x) => term('observed', x.btermValue, { rule: x.btermKind })), term('observed', 0, { region: objective, rule: fort.recordSource === null ? 'no_record_terms' : `record_terms:${fort.recordSource}` })];
  const claim: ReportClaim = { claimKind: 'fort-surrendered', claimRegion: objective, claimValue: fort.surrendered === 'captured' ? fort.men : 0, claimToken: fort.surrendered, claimConfidence: 1000 };
  const tell = (author: PersonId | null, authorPost: PostId | null, faction: FactionId, tag: string) => {
    const principal = world.faction(faction).principal;
    sendReport(ctx, state, {
      body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: author ?? principal, reportAuthorPost: author === null ? null : authorPost, reportSubjectKind: 'region', reportSubjectId: objective, reportClaims: [claim], reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null },
      truth: { truthTerms: why, truthTrimmed: [] },
      to: principal,
      tag,
      fromRegion: objective,
    });
  };
  tell(fort.commander, fort.defPost, fort.defFaction, `fort-surrendered.${objective}`);
  tell(state.postStates[attackerPost]?.postHolder ?? null, attackerPost, side, `fort-taken.${objective}`);
  return { state, fort };
}
