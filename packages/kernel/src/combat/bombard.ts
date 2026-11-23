import { forceTotals } from '../forces/lots.ts';
/**
 * Bombardment across water (lane 1.12; the lead's rulings on Sumter and the gate's three conditions). A general stage,
 * not a script for one fort: an operation whose objective lies across a short water edge from ground its side holds
 * fires on it each day instead of halting with no route (Sumter now; Pickens, Hatteras and Port Royal later).
 *
 * - **What it fires on.** Only forts' works and the forces in them (`BOMBARD_TARGET_KINDS`): never a town or its people
 *   as such (0029; SENSITIVE-HISTORY 3.6). The target is the defending blocks and the region's fortification; nothing
 *   here reads or writes a population, and the stage is offered only where an enemy force or works stand.
 * - **Each day** the battle model fights a fire-only engagement: no crossing, no assault. Fire is the attacker's guns
 *   against the defender's (the known men of the pack's gun arms, a stand-in owned by 1B, since the data has no gun counts), as a
 *   ratio, capped. The defender's morale falls by the pack's rate at that ratio, and further when his stores are out; his
 *   works wear; his killed and wounded are the pack's share (Sumter's rule is none). Every number has its typed terms.
 * - **The defender is cut off**, so his own choice decides, from his seat's orders or else his traits (0074, lane 1.3):
 *   he surrenders when his men's morale falls below his floor, which his boldness lowers (a bolder man holds longer).
 *   A seat's `surrender` is taken; a `break_out` cannot cross water, so he holds. Nothing forces it.
 * - **On surrender** the terms are only the record's (`bombardment.recordTerms`, cited), and only when that case happens
 *   in play: evacuated under terms (the garrison leaves play, its commander keeps serving), or else captured.
 *
 * Pure: the tick applies what this returns through each owner (`tick/bombard.ts`).
 */
import { strictCompare } from '../compare.ts';
import type { CombatCommandChange } from '../command/command.ts';
import type { ControlDelta } from '../control/control.ts';
import type { MusterDelta } from '../forces/enlistment.ts';
import { factionOfBlock, isNaval, type ForceDelta } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { PeopleChange } from '../people/people.ts';
import type { FortificationDelta } from '../regions/regions.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { commanderView } from './battle.ts';
import { battleId, lastDay, openBattleIn, type BattleDay, type BattleRecordChange, type BattleSide, type BattleTerm } from './records.ts';
import type { CutOffChoice, JUDGE } from './order-kinds.ts';
import type { BombardmentRules, BombardTerms } from './rules.ts';

/** What a bombardment may target (rule 7: a check). A town, or the people in it, is never one. */
export const BOMBARD_TARGET_KINDS = ['force', 'works'] as const;
export type BombardTarget = (typeof BOMBARD_TARGET_KINDS)[number];

/** The defender as the day's fire reads him. */
export interface BombardDefender {
  readonly guns: number;
  readonly men: number;
  readonly morale: number;
  readonly storesOut: boolean;
  /** The fort's fortification, permille. */
  readonly works: number;
  readonly commander: PersonId | null;
  readonly boldness: number;
}

export interface BombardDay {
  readonly fireRatio: number;
  readonly moraleLoss: number;
  readonly moraleAfter: number;
  readonly worksLoss: number;
  readonly worksAfter: number;
  /** His side's killed and wounded today. */
  readonly losses: number;
  /** The morale below which he surrenders. */
  readonly floor: number;
  readonly choice: 'hold' | 'surrender';
  readonly terms: readonly BattleTerm[];
}

const t = (kind: string, value: number, source: string | null): BattleTerm => ({ btermKind: kind, btermValue: value + 0, btermSource: source });

/** One day's fire on a fort, and the defender's choice that evening. */
export function bombardDay(rules: BombardmentRules, attackerGuns: number, d: BombardDefender, order: CutOffChoice | typeof JUDGE): BombardDay {
  const ratio = d.guns <= 0 ? rules.ratioCapPermille : Math.min(rules.ratioCapPermille, Math.trunc((attackerGuns * 1000) / d.guns));
  const fire = Math.trunc((rules.moraleLossPerDay * ratio) / 1000);
  const hungry = d.storesOut ? rules.outOfStoresMoraleLoss : 0;
  const moraleLoss = fire + hungry;
  const moraleAfter = Math.max(0, d.morale - moraleLoss);
  const worksLoss = Math.min(d.works, Math.trunc((rules.worksWearPerDay * ratio) / 1000));
  const losses = Math.min(d.men, Math.trunc((Math.trunc((d.men * rules.lossPermille) / 1000) * ratio) / 1000));
  const floor = Math.max(0, Math.min(1000, rules.surrenderMorale - Math.trunc((rules.boldnessWeight * (d.boldness - 500)) / 1000)));
  const terms: BattleTerm[] = [
    t('guns_attacker', attackerGuns, null),
    t('guns_defender', d.guns, null),
    t('fire_ratio', ratio, 'bombardment.ratioCapPermille'),
    t('morale_fire', -fire, 'bombardment.moraleLossPerDay'),
    t('morale_out_of_stores', -hungry, 'bombardment.outOfStoresMoraleLoss'),
    t('works_wear', -worksLoss, 'bombardment.worksWearPerDay'),
    t('killed_wounded', losses, 'bombardment.lossPermille'),
    t('surrender_floor', floor, d.commander),
    t('boldness', d.boldness, d.commander),
  ];
  let choice: 'hold' | 'surrender';
  if (order === 'surrender') {
    choice = 'surrender';
    terms.push(t('ordered', 0, d.commander));
  } else if (order === 'break_out') {
    choice = 'hold';
    terms.push(t('no_breakout_over_water', 0, d.commander));
  } else choice = moraleAfter < floor ? 'surrender' : 'hold';
  return { fireRatio: ratio, moraleLoss, moraleAfter, worksLoss, worksAfter: d.works - worksLoss, losses, floor, choice, terms };
}

/** A day's fire on a fort as proposals for each owner (the battle model's, as R4 asks: only combat proposes a capture). */
export interface FortDay {
  readonly day: BombardDay;
  readonly defenders: readonly ForceBlockId[];
  readonly defFaction: FactionId;
  readonly defPost: PostId | null;
  readonly commander: PersonId | null;
  readonly men: number;
  /** The terms he surrendered on (the record's, or captured), or null while he holds. */
  readonly surrendered: BombardTerms | 'captured' | null;
  /** The record's row for this case, if any: its source goes with the reports' truth. */
  readonly recordSource: string | null;
  readonly forces: readonly ForceDelta[];
  readonly musters: readonly MusterDelta[];
  readonly command: readonly CombatCommandChange[];
  readonly people: readonly PeopleChange[];
  readonly control: readonly ControlDelta[];
  readonly works: readonly FortificationDelta[];
}

/** Record the fire already resolved by `fortDay`; do not run the land model or calculate losses a second time. */
export function bombardRecords(world: SeatsWorld, state: State, fort: FortDay, attackerPost: PostId, attackers: readonly ForceBlockId[], objective: RegionId, side: FactionId, day: number): readonly BattleRecordChange[] {
  // Only known gun-arm men supplied fire in fortDay. Support and unknown/empty batteries did not fire.
  const batteries = attackers.filter(b => world.map.world.rules.combat.bombardment.gunArms.includes(state.forceBlockStates[b]!.fbArm) && (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0) > 0);
  const factions = [side, fort.defFaction].sort(strictCompare);
  const changes: BattleRecordChange[] = [];
  const open = openBattleIn(state, objective);
  const previous = open === null ? null : state.battleRecords[open]!;
  const continuing = previous !== null && previous.battleDays.length < world.map.world.rules.combat.maxBattleDays
    && lastDay(previous)?.bdayType === 'bombard' && lastDay(previous)?.bdayDay === day - 1
    && previous.battleFactions.every((f, i) => f === factions[i]);
  if (previous !== null && !continuing) changes.push({ change: 'close', id: open!, day: lastDay(previous)?.bdayDay ?? previous.battleStartDay });
  const id = continuing ? open! : battleId(objective, day);
  if (!continuing) changes.push({ change: 'open', id, record: { battleRegion: objective, battleStartDay: day, battleEndDay: null, battleFactions: factions, battleCauses: [], battleDays: [] } });
  const makeSide = (faction: FactionId): BattleSide => {
    const defending = faction === fort.defFaction;
    const blocks = [...(defending ? fort.defenders : batteries)].sort(strictCompare);
    const present = blocks.reduce((n, b) => n + (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0), 0);
    const losses = blocks.map((b) => {
      const deltas = defending ? fort.forces.filter(d => d.change === 'battle_losses' && d.block === b) : [];
      return deltas.reduce((total, d) => d.change !== 'battle_losses' ? total : {
        blossBlock: b, blossKilled: total.blossKilled + d.killed, blossWounded: total.blossWounded + d.wounded,
        blossMissing: total.blossMissing + d.missing, blossCaptured: total.blossCaptured + d.captured,
        blossStragglersCaptured: total.blossStragglersCaptured + d.stragglersCaptured,
      }, { blossBlock: b, blossKilled: 0, blossWounded: 0, blossMissing: 0, blossCaptured: 0, blossStragglersCaptured: 0 });
    });
    const killed = losses.reduce((n, b) => n + b.blossKilled, 0);
    const wounded = losses.reduce((n, b) => n + b.blossWounded, 0);
    const captured = losses.reduce((n, b) => n + b.blossCaptured, 0);
    const stragglers = losses.reduce((n, b) => n + b.blossStragglersCaptured, 0);
    const weight = (b: ForceBlockId) => Math.max(1, forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0);
    const totalWeight = blocks.reduce((n, b) => n + weight(b), 0);
    const morale = (after: boolean) => totalWeight === 0 ? 0 : Math.trunc(blocks.reduce((n, b) => n + weight(b) * Math.max(0, state.forceBlockStates[b]!.fbMorale - (after && defending ? fort.day.moraleLoss : 0)), 0) / totalWeight);
    const before = morale(false);
    const after = morale(true);
    const moraleTerms = defending ? fort.day.terms.filter(t => t.btermKind.startsWith('morale_')) : [];
    const clamp = after - before - moraleTerms.reduce((n, t) => n + t.btermValue, 0);
    const gone = defending && fort.surrendered !== null;
    const post = defending ? fort.defPost : attackerPost;
    return {
      bsideFaction: faction, bsidePost: post, bsideCommander: defending ? fort.commander : (state.postStates[attackerPost]?.postHolder ?? null),
      bsideCommit: defending ? 'defend' : 'main', bsideBlocks: blocks,
      bsideUnknown: blocks.filter(b => forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength === null), bsidePresent: present,
      // All defenders are exposed to fire. No land frontage or contact is assumed.
      bsideCommitted: present, bsideEngaged: present,
      bsideBase: defending ? world.map.world.rules.combat.bombardment.lossPermille : 0,
      bsideTerms: defending ? [t('fire_ratio', fort.day.fireRatio - 1000, 'bombardment.ratioCapPermille')] : [],
      bsideMultiplier: defending ? fort.day.fireRatio : 1000,
      bsideKw: killed + wounded, bsideKwParts: defending ? fort.day.terms.filter(t => t.btermKind === 'killed_wounded') : [], bsideKilled: killed, bsideWounded: wounded,
      bsideMissing: 0, bsideMissingParts: [], bsideCaptured: captured + stragglers,
      bsideCapturedParts: [t('surrender', captured, null), t('stragglers_in_pocket', stragglers, null)].filter(t => t.btermValue !== 0),
      bsideFlankDraw: -1, bsideFlankThreshold: 0, bsideFlankTerms: [], bsideFlankBroken: false,
      bsideMoraleBefore: before, bsideMoraleAfter: after, bsideMoraleTerms: [...moraleTerms, ...(clamp === 0 ? [] : [t('morale_clamp', clamp, null)])],
      bsideDecisions: defending ? fort.day.terms : [], bsideResult: !defending && fort.surrendered !== null ? 'gained_ground' : 'held',
      bsideCutOff: gone ? 'surrender' : null, bsideRetreatTo: null, bsidePursue: null, bsideLosses: losses,
      bsideHitDraw: -1, bsideHit: defending && fort.surrendered === 'captured' && fort.commander !== null ? 'captured' : null,
    };
  };
  const bday: BattleDay = { bdayDay: day, bdayNumber: continuing ? previous!.battleDays.length + 1 : 1, bdayType: 'bombard', bdayAttacker: side, bdayFrontage: 0, bdayContact: 0, bdayDraws: 0, bdaySides: factions.map(makeSide) };
  changes.push({ change: 'day', id, day: bday, causes: [attackerPost] });
  if (fort.surrendered !== null || bday.bdayNumber >= world.map.world.rules.combat.maxBattleDays) changes.push({ change: 'close', id, day });
  return changes;
}

/** The defenders standing in a fort: another side's land blocks there, not on a leg, not aboard, not surrendered. */
export function fortDefenders(world: SeatsWorld, state: State, region: RegionId, side: FactionId): ForceBlockId[] {
  return (Object.keys(state.forceLocations).sort(strictCompare) as ForceBlockId[]).filter((b) => {
    const l = state.forceLocations[b]!;
    if (l.locRegion !== region || l.locMarch !== null || l.locAboard !== null) return false;
    if (state.forceBlockStates[b]!.fbSurrenderedDay !== null || isNaval(world.map, state, b)) return false;
    const f = factionOfBlock(world.map, state, b);
    return f !== null && f !== side;
  });
}

/**
 * The day's fire by `attackers` (standing at their shore, of `side`) on `objective`, as proposals: morale and losses
 * (`forces`), works (`regions`); on surrender, by the record's terms or else captured, the garrison's fate (`forces`,
 * `movement` through the musters' removals, `command`, `people`) and the fort's control (`control`). Null when no
 * defender stands there. `order` is the defender's seat's cut-off order, or `judge`.
 */
export function fortDay(world: SeatsWorld, state: State, attackers: readonly ForceBlockId[], objective: RegionId, side: FactionId, order: (post: PostId | null) => CutOffChoice | typeof JUDGE, day: number): FortDay | null {
  const rules = world.map.world.rules.combat.bombardment;
  // G-1.12a, the stage's own check (rule 7): it fires only on a fortification the pack lets be bombarded, cited.
  if (!rules.objectives.some((o) => o.region === objective)) return null;
  const defenders = fortDefenders(world, state, objective, side);
  if (defenders.length === 0) return null;
  const men = (blocks: readonly ForceBlockId[]) => blocks.reduce((s, b) => s + (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0), 0);
  const gun = (b: ForceBlockId) => rules.gunArms.includes(state.forceBlockStates[b]!.fbArm);
  const lead = [...defenders].sort((a, b) => (forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0) - (forceTotals(state.forceBlockStates[a]!, world.map.forceTotalsCache).fbStrength ?? 0) || strictCompare(a, b))[0]!;
  const defFaction = factionOfBlock(world.map, state, lead)!;
  const defPost = state.forceAssignments[lead] ?? null;
  const commander = defPost === null ? null : (state.postStates[defPost]?.postHolder ?? null);
  // Morale by men (a block of unknown strength weighs one man); stores out when every known stock is empty.
  const weight = (b: ForceBlockId) => Math.max(1, forceTotals(state.forceBlockStates[b]!, world.map.forceTotalsCache).fbStrength ?? 0);
  const total = defenders.reduce((s, b) => s + weight(b), 0);
  const morale = Math.trunc(defenders.reduce((s, b) => s + state.forceBlockStates[b]!.fbMorale * weight(b), 0) / total);
  const known = defenders.filter((b) => state.forceBlockStates[b]!.fbStoresMilli !== null);
  const storesOut = known.length > 0 && known.every((b) => state.forceBlockStates[b]!.fbStoresMilli! <= 0);
  const garrison = men(defenders);
  const d = bombardDay(rules, men(attackers.filter(gun)), { guns: men(defenders.filter(gun)), men: garrison, morale, storesOut, works: state.regionFortification[objective] ?? 0, commander, boldness: commanderView(world, state, commander).boldness }, order(defPost));
  const forces: ForceDelta[] = defenders.map((b) => ({ change: 'condition', block: b, morale: -d.moraleLoss, experience: 0, equipment: 0, routedDay: null, surrenderedDay: null, cause: 'combat' }));
  if (d.losses > 0 && forceTotals(state.forceBlockStates[lead]!, world.map.forceTotalsCache).fbStrength !== null) {
    const killed = Math.trunc((d.losses * world.map.world.rules.combat.killedPermille) / 1000);
    forces.push({ change: 'battle_losses', block: lead, killed, wounded: d.losses - killed, missing: 0, captured: 0, stragglersCaptured: 0, cause: 'combat' });
  }
  const works: FortificationDelta[] = d.worksLoss > 0 ? [{ region: objective, deltaPermille: -d.worksLoss, cause: 'combat' }] : [];
  const base = { day: d, defenders, defFaction, defPost, commander, men: garrison, works };
  if (d.choice === 'hold') return { ...base, surrendered: null, recordSource: null, forces, musters: [], command: [], people: [], control: [] };

  // He surrenders: only the record's terms, when this is the record's case (0074; the lead's gate condition 1).
  const row = rules.recordTerms.find((r) => r.region === objective && r.faction === defFaction && r.commander === commander
    && (r.offerWindow === null || (day > r.offerWindow.offerDay && day <= r.offerWindow.lastDay))) ?? null;
  const surrendered = row === null ? 'captured' : row.terms;
  const battle = `bombard:${objective}:${day}`;
  const musters: MusterDelta[] = [];
  const command: CombatCommandChange[] = [];
  const people: PeopleChange[] = [];
  if (surrendered === 'evacuated_under_terms') {
    // The garrison leaves play; its commander leaves the post and keeps serving (no change of status).
    for (const b of defenders) musters.push({ change: 'disband', block: b, cause: 'evacuated_under_terms' });
    if (defPost !== null && commander !== null) command.push({ change: 'vacate', post: defPost, person: commander, why: 'evacuated', battle });
  } else {
    for (const b of defenders) {
      const f = state.forceBlockStates[b]!;
      const lost = forceTotals(f, world.map.forceTotalsCache).fbStrength! === null ? 0 : forceTotals(f, world.map.forceTotalsCache).fbStrength! - (b === lead ? d.losses : 0);
      if (lost > 0 || forceTotals(f, world.map.forceTotalsCache).fbStragglers > 0) forces.push({ change: 'battle_losses', block: b, killed: 0, wounded: 0, missing: 0, captured: lost, stragglersCaptured: forceTotals(f, world.map.forceTotalsCache).fbStragglers, cause: 'combat' });
      forces.push({ change: 'condition', block: b, morale: 0, experience: 0, equipment: 0, routedDay: null, surrenderedDay: day, cause: 'combat' });
      command.push({ change: 'release', block: b, battle });
    }
    if (defPost !== null && commander !== null) {
      command.push({ change: 'vacate', post: defPost, person: commander, why: 'captured', battle });
      people.push({ change: 'status', person: commander, status: 'captured' });
    }
  }
  // The fort passes to the side that fired on it.
  const shares = state.regionControl[objective] ?? {};
  const control: ControlDelta[] = [];
  for (const f of Object.keys(shares).sort(strictCompare) as FactionId[]) if (f !== side && shares[f]! > 0) control.push({ region: objective, faction: f, deltaPermille: -shares[f]!, cause: 'combat' });
  control.push({ region: objective, faction: side, deltaPermille: 1000 - (shares[side] ?? 0), cause: 'combat' });
  return { ...base, surrendered, recordSource: row?.source ?? null, forces, musters, command, people, control };
}
