/**
 * One battle-day, resolved (the combat note's P3–P8). Pure: it reads a plain description of the two sides and the
 * ground, draws a fixed number of values from the day's stream, and returns the day's record with every breakdown and
 * the per-block changes `combat` proposes. It knows nothing of State, so the Livermore harness feeds it named set-ups.
 *
 * The model, stated so it can be checked:
 * - **Contact** (P3): each side commits a share of its known men present by its commander's dawn choice; frontage caps
 *   the men engaged; the men in contact are the lesser side's engaged, and both sides' losses are computed from them.
 * - **Losses** (P4): `kw = trunc(contact × base × multiplier / 10^6)`, the multiplier being 1000 plus additive typed
 *   terms (terrain, quality, competence, surprise, both postures, successive day, numbers, noise), clamped. The kw is
 *   broken down by term with the largest-remainder rule, so its parts sum to it exactly. Killed is a pack share of kw.
 * - **Flank** (P7): a draw below a threshold (base, the enemy's numbers and quality) breaks a side's flank today.
 * - **Morale** (P5): falls with the day's loss share and a broken flank, moves with the commander's nerve and the side's
 *   experience. Below the pack's rout line the side routs: mechanical, never chosen, and it kills no one.
 * - **Night** (P6): a side that did not rout stays or withdraws by its commander's believed odds. A side that leaves with
 *   no legal retreat (0019) is cut off: its commander breaks out (tomorrow, at the assault rates) or surrenders, by his
 *   own traits even when it routed (0074: surrender is his own act); one whose breakout failed is destroyed, recorded as
 *   such and never as his surrender. Only then is a force taken: its men, the day's missing among them, are captured.
 * - **Missing** (P4, P8): a share of kw by the side's result, more when its flank broke, capped at the men left. Of the
 *   missing, a share by result is captured on the field; the rest straggle and rejoin over days. Captured men leave a
 *   block's strength, a typed loss in the record (R4's battle ruling).
 * - **Noise** (P7): six values a day from the day's own stream, in a fixed order whatever the branch: per side, two
 *   uniform draws summed for the loss term (triangular, no transcendental maths) and one for the flank.
 */
import type { FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import { clamp } from '../permille.ts';
import { nextInt, type RngStream } from '../rng.ts';
import { commitAtDawn, cutOffChoice, pursuitChoice, standAtNight, type CommanderView } from './decide.ts';
import type { BattleDay, BattleSide, BattleTerm, BlockLoss, CutOff, LeaderHit, Pursuit } from './records.ts';
import type { BattleType, CombatRules, Commit, DayResult } from './rules.ts';

/** Values drawn from a battle-day's stream, always (P7). */
export const DRAWS_PER_DAY = 6;
/** Values drawn from a battle-day's leaders' stream, always: one per side. */
export const LEADER_DRAWS_PER_DAY = 2;

/** A block as the day reads it. */
export interface BlockInput {
  readonly id: ForceBlockId;
  /** Known men present; null when no source gives its strength (it fights as none, and is listed). */
  readonly men: number | null;
  readonly stragglers: number;
  readonly morale: number;
  readonly experience: number;
  readonly equipment: number;
}

export interface SideInput {
  readonly faction: FactionId;
  readonly post: PostId | null;
  readonly commander: CommanderView;
  /** The commander's dawn choice (`commitAtDawn`), decided by the caller from the morning's view. */
  readonly commit: Commit;
  readonly commitTerms: readonly BattleTerm[];
  /** Blocks in id order. */
  readonly blocks: readonly BlockInput[];
  /** Where it falls back to, or null when no neighbour passes the retreat rule (0019). */
  readonly retreatTo: RegionId | null;
  /** It broke out of a pocket yesterday: a second failure is a surrender, never another breakout. */
  readonly breakingOut: boolean;
  /** Surprised in a meeting engagement: its commander held no report of the enemy here. */
  readonly surprised: boolean;
}

export interface DayInput {
  readonly day: number;
  readonly dayNumber: number;
  readonly type: BattleType;
  readonly attacker: FactionId | null;
  readonly terrain: string;
  readonly frontageMen: number;
  readonly terrainLossPermille: number;
  /** Exactly two sides, in faction order. */
  readonly sides: readonly [SideInput, SideInput];
}

/** What `forces` is asked to change for one block today. */
export interface BlockOutcome {
  readonly block: ForceBlockId;
  readonly killed: number;
  readonly wounded: number;
  readonly missing: number;
  readonly captured: number;
  readonly stragglersCaptured: number;
  readonly moraleDelta: number;
  readonly experienceDelta: number;
  readonly equipmentDelta: number;
  readonly routed: boolean;
  readonly surrendered: boolean;
}

export interface SideOutcome {
  readonly faction: FactionId;
  /** Where its blocks go tonight (withdrew or routed with a way out), or null when they stay. */
  readonly retreatTo: RegionId | null;
  /** Taken: it surrendered, or a failed breakout destroyed it; its men are captured either way. */
  readonly surrendered: boolean;
  readonly breakingOut: boolean;
  readonly routed: boolean;
}

export interface DayOutcome {
  /** The day's record, the commanders' hits not yet drawn (`leaderHits` fills them). */
  readonly day: BattleDay;
  readonly blocks: readonly BlockOutcome[];
  readonly sides: readonly [SideOutcome, SideOutcome];
}

const term = (kind: string, value: number, source: string | null = null): BattleTerm => ({ btermKind: kind, btermValue: value, btermSource: source });
const sum = (terms: readonly BattleTerm[]): number => terms.reduce((a, t) => a + t.btermValue, 0);
const floorDiv = (a: number, b: number): number => {
  const q = Math.trunc(a / b);
  return q * b > a ? q - 1 : q;
};

/**
 * Split a whole `total` over weights by the largest-remainder rule: each part the floor of its exact share, the units
 * left over to the largest remainders, ties to the earlier weight. The parts sum to `total` exactly, and with weights
 * all at least 0 and `total` at most their sum, no part exceeds its weight.
 */
export function apportion(total: number, weights: readonly number[]): number[] {
  const W = weights.reduce((a, b) => a + b, 0);
  if (weights.length === 0) return [];
  if (W === 0) {
    if (total !== 0) throw new RangeError(`cannot apportion ${total} over weights summing to 0`);
    return weights.map(() => 0);
  }
  const sign = W < 0 ? -1 : 1;
  const parts = weights.map((w) => floorDiv(total * w * sign, W * sign));
  const rems = weights.map((w, i) => total * w * sign - parts[i]! * W * sign);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = rems.map((r, i) => ({ r, i })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0 && k < order.length; k++, left--) parts[order[k]!.i]! += 1;
  return parts;
}

/** A side's known men, men-weighted mean condition, and its blocks with no known strength. */
function sideBasics(side: SideInput) {
  const known = side.blocks.filter((b) => b.men !== null);
  const present = known.reduce((a, b) => a + b.men!, 0);
  const mean = (f: (b: BlockInput) => number): number => {
    if (present > 0) return Math.trunc(known.reduce((a, b) => a + b.men! * f(b), 0) / present);
    if (side.blocks.length === 0) return 0;
    return Math.trunc(side.blocks.reduce((a, b) => a + f(b), 0) / side.blocks.length);
  };
  const morale = mean((b) => b.morale);
  const experience = mean((b) => b.experience);
  const quality = mean((b) => Math.trunc((b.morale + b.experience + b.equipment) / 3));
  return { present, morale, experience, quality, unknown: side.blocks.filter((b) => b.men === null).map((b) => b.id) };
}

/** Resolve one battle-day. Draws exactly `DRAWS_PER_DAY` values from `stream`, whatever happens. */
export function resolveDay(rules: CombatRules, input: DayInput, stream: RngStream): DayOutcome {
  // The fixed draws first, in faction order, so no branch below can change how many are taken.
  const draws = input.sides.map(() => ({ a: nextInt(stream, 1001), b: nextInt(stream, 1001), flank: nextInt(stream, 1000) }));
  const basics = input.sides.map(sideBasics);
  const committed = input.sides.map((s, i) => Math.trunc((basics[i]!.present * rules.commit[s.commit].sharePermille) / 1000));
  const engaged = committed.map((c) => Math.min(c, input.frontageMen));
  const contact = Math.min(engaged[0]!, engaged[1]!);
  const t = rules.terms;

  // Losses: the base rate, the additive terms, the clamp, and the breakdown.
  const loss = input.sides.map((side, i) => {
    const j = 1 - i;
    const enemy = input.sides[j]!;
    const me = basics[i]!;
    const them = basics[j]!;
    const role = input.type === 'meeting' || input.attacker === side.faction ? 'attacker' : 'defender';
    const base = rules.baseRates[input.type][role];
    const larger = Math.max(me.present, them.present);
    const margin = larger === 0 ? 0 : Math.trunc((Math.abs(me.present - them.present) * 1000) / larger);
    const numbers = Math.trunc((margin * t.numbersMax) / 1000) * (me.present > them.present ? -1 : me.present < them.present ? 1 : 0);
    const noise = Math.trunc(((draws[i]!.a + draws[i]!.b - 1000) * t.noiseMax) / 1000);
    const candidates: BattleTerm[] = [
      term('terrain', input.terrainLossPermille, input.terrain),
      term('quality', clamp(Math.trunc(((them.quality - me.quality) * t.qualityWeight) / 1000), -t.qualityMax, t.qualityMax)),
      term('competence', clamp(Math.trunc(((enemy.commander.competence - side.commander.competence) * t.competenceWeight) / 1000), -t.competenceMax, t.competenceMax), enemy.commander.person),
      term('surprise', input.type === 'meeting' && side.surprised ? t.surprisePermille : 0),
      term('own_posture', rules.commit[side.commit].posturePermille, side.commit),
      term('enemy_posture', rules.commit[enemy.commit].posturePermille, enemy.commit),
      term('successive_day', (input.dayNumber - 1) * t.successiveDayPermille),
      term('numbers', numbers),
      term('noise', noise),
    ];
    const terms = candidates.filter((x) => x.btermValue !== 0);
    const raw = 1000 + sum(terms);
    const multiplier = clamp(raw, rules.multiplier.min, rules.multiplier.max);
    if (multiplier !== raw) terms.push(term('clamp', multiplier - raw));
    const uncapped = Math.trunc((contact * base * multiplier) / 1_000_000);
    const kw = Math.min(uncapped, me.present);
    const weights = [1000, ...terms.map((x) => x.btermValue)];
    const split = apportion(uncapped, weights);
    const parts = [term('base', split[0]!, input.type), ...terms.map((x, k) => term(x.btermKind, split[k + 1]!, x.btermSource))].filter((x) => x.btermValue !== 0);
    if (kw !== uncapped) parts.push(term('cap_present', kw - uncapped));
    return { base, terms, multiplier, kw, parts, margin, largerIsEnemy: them.present > me.present };
  });

  // The flank and the morale, from today's contact (no contact, no break and no change of heart).
  const flank = input.sides.map((side, i) => {
    const j = 1 - i;
    const f = rules.flank;
    const terms = [term('flank_base', f.basePermille)];
    if (loss[i]!.largerIsEnemy) terms.push(term('enemy_numbers', Math.trunc((loss[i]!.margin * f.numbersWeight) / 1000)));
    const better = basics[j]!.quality - basics[i]!.quality;
    if (better > 0) terms.push(term('enemy_quality', Math.trunc((better * f.qualityWeight) / 1000)));
    const raw = sum(terms);
    const threshold = clamp(raw, 0, f.maxPermille);
    if (threshold !== raw) terms.push(term('clamp', threshold - raw));
    return { threshold, terms, broken: contact > 0 && draws[i]!.flank < threshold, draw: draws[i]!.flank, side };
  });
  const morale = input.sides.map((side, i) => {
    const me = basics[i]!;
    const m = rules.morale;
    if (contact === 0) return { before: me.morale, after: me.morale, terms: [] as BattleTerm[], routed: false };
    const share = me.present > 0 ? Math.trunc((loss[i]!.kw * 1000) / me.present) : 0;
    const terms = [
      term('losses', -Math.trunc((share * m.lossWeight) / 1000)),
      term('flank_broken', flank[i]!.broken ? -rules.flank.moraleLoss : 0),
      term('nerve', Math.trunc(((side.commander.nerve - 500) * m.nerveWeight) / 1000), side.commander.person),
      term('experience', Math.trunc(((me.experience - 500) * m.experienceWeight) / 1000)),
    ].filter((x) => x.btermValue !== 0);
    const raw = me.morale + sum(terms);
    const after = clamp(raw, 0, 1000);
    if (after !== raw) terms.push(term('clamp', after - raw));
    if (after >= m.routAt) return { before: me.morale, after, terms, routed: false };
    // A rout drops the side to the pack's floor: a term of its own, so the record still sums (hard rule 6).
    const floor = Math.min(0, m.routFloor - after);
    if (floor !== 0) terms.push(term('rout_floor', floor));
    return { before: me.morale, after: after + floor, terms, routed: true };
  });

  // Night: who stays, who leaves, and who is cut off.
  const left = input.sides.map((s, i) => basics[i]!.present - loss[i]!.kw);
  const night = input.sides.map((side, i) => {
    if (morale[i]!.routed) return { leaves: true, terms: [] as BattleTerm[] };
    const d = standAtNight(rules, side.commander, left[i]!, left[1 - i]!);
    return { leaves: d.choice === 'withdraw', terms: d.terms };
  });
  const verdict = input.sides.map((side, i) => {
    const decisions: BattleTerm[] = [...side.commitTerms, ...night[i]!.terms];
    let cutOff: CutOff | null = null;
    if (night[i]!.leaves && side.retreatTo === null) {
      if (side.breakingOut) {
        // A breakout that failed: the force he chose to fight out with is destroyed (P8), which is not his surrender
        // (0074: surrender is his own act). Never a second breakout.
        cutOff = 'destroyed';
        decisions.push(term('breakout_failed', 0, side.commander.person));
      } else {
        // Surrender is the cut-off commander's own act, from his traits, routed or not (0074).
        const c = cutOffChoice(rules, side.commander, left[i]!, left[1 - i]!);
        cutOff = c.choice;
        decisions.push(...c.terms);
      }
    }
    return { cutOff, decisions };
  });
  const leaving = (i: number) => night[i]!.leaves && verdict[i]!.cutOff !== 'break_out';
  const result = (i: number): DayResult => {
    if (morale[i]!.routed) return 'routed';
    if (night[i]!.leaves) return 'withdrew';
    if (leaving(1 - i)) return input.type === 'meeting' || input.attacker === input.sides[i]!.faction ? 'gained_ground' : 'held';
    return flank[i]!.broken ? 'fell_back' : 'held';
  };

  const sides: BattleSide[] = [];
  const blocks: BlockOutcome[] = [];
  const outcomes: SideOutcome[] = [];
  input.sides.forEach((side, i) => {
    const me = basics[i]!;
    const L = loss[i]!;
    const r = result(i);
    // Taken: it surrendered, or its failed breakout destroyed it. Either way its men are captured (R4's battle ruling).
    const surrendered = verdict[i]!.cutOff === 'surrender' || verdict[i]!.cutOff === 'destroyed';
    const killed = Math.trunc((L.kw * rules.killedPermille) / 1000);
    // Missing: by result, more with a broken flank, never more than the men left after the day's hits.
    const missingTerms = [term(`result_${r}`, Math.trunc((L.kw * rules.missingPermille[r]) / 1000), r)];
    if (flank[i]!.broken) missingTerms.push(term('flank_broken', Math.trunc((L.kw * rules.flank.missingPermille) / 1000)));
    const rawMissing = sum(missingTerms);
    const missTotal = Math.min(rawMissing, me.present - L.kw);
    if (missTotal !== rawMissing) missingTerms.push(term('cap_present', missTotal - rawMissing));
    const capturedField = Math.trunc((missTotal * rules.capturedPermille[r]) / 1000);
    // Per block: hits by men, killed among the hit, missing among the men left, captured among the missing.
    const known = side.blocks.filter((b) => b.men !== null);
    const men = known.map((b) => b.men!);
    const kwB = apportion(L.kw, men);
    const killedB = apportion(killed, kwB);
    const missB = apportion(missTotal, men.map((m, k) => m - kwB[k]!));
    const capB = apportion(capturedField, missB);
    let surrenderedMen = 0;
    let stragglersTaken = 0;
    const losses: BlockLoss[] = [];
    const dMorale = morale[i]!.after - morale[i]!.before;
    const gain = contact > 0 ? rules.experience.gainPerDay : 0;
    for (const b of side.blocks) {
      const k = known.indexOf(b);
      const kw = k < 0 ? 0 : kwB[k]!;
      const kd = k < 0 ? 0 : killedB[k]!;
      const ms = k < 0 ? 0 : missB[k]!;
      const cp = k < 0 ? 0 : capB[k]!;
      const rest = surrendered && k >= 0 ? b.men! - kw - ms : 0;
      const taken = surrendered ? b.stragglers : 0;
      surrenderedMen += rest;
      stragglersTaken += taken;
      // In a pocket taken, the day's missing are inside it too: captured with the rest, none left to straggle back.
      const straggle = surrendered ? 0 : ms - cp;
      const captured = surrendered ? ms + rest : cp;
      if (kw + ms + rest + taken > 0) losses.push({ blossBlock: b.id, blossKilled: kd, blossWounded: kw - kd, blossMissing: straggle, blossCaptured: captured, blossStragglersCaptured: taken });
      const routed = morale[i]!.routed;
      blocks.push({
        block: b.id,
        killed: kd,
        wounded: kw - kd,
        missing: straggle,
        captured,
        stragglersCaptured: taken,
        moraleDelta: routed ? Math.min(0, rules.morale.routFloor - b.morale) : clamp(b.morale + dMorale, 0, 1000) - b.morale,
        experienceDelta: clamp(b.experience + gain, 0, 1000) - b.experience,
        equipmentDelta: routed ? clamp(b.equipment - rules.equipment.routLoss, 0, 1000) - b.equipment : 0,
        routed,
        surrendered,
      });
    }
    const inPocket = surrendered ? missTotal - capturedField : 0;
    const missingParts = [...missingTerms];
    if (capturedField > 0) missingParts.push(term('captured_on_field', -capturedField));
    if (inPocket > 0) missingParts.push(term('missing_in_pocket', -inPocket));
    const capturedParts = [term('captured_on_field', capturedField), term('missing_in_pocket', inPocket), term(verdict[i]!.cutOff === 'destroyed' ? 'destroyed' : 'surrender', surrenderedMen), term('stragglers_in_pocket', stragglersTaken)].filter((x) => x.btermValue !== 0);
    const stays = !leaving(i);
    let pursue: Pursuit | null = null;
    const decisions = [...verdict[i]!.decisions];
    if (stays && !morale[i]!.routed && !night[i]!.leaves && leaving(1 - i) && verdict[1 - i]!.cutOff !== 'surrender' && verdict[1 - i]!.cutOff !== 'destroyed') {
      const p = pursuitChoice(rules, side.commander, left[i]!, left[1 - i]!);
      pursue = p.choice;
      decisions.push(...p.terms);
    }
    sides.push({
      bsideFaction: side.faction,
      bsidePost: side.post,
      bsideCommander: side.commander.person,
      bsideCommit: side.commit,
      bsideBlocks: side.blocks.map((b) => b.id),
      bsideUnknown: me.unknown,
      bsidePresent: me.present,
      bsideCommitted: committed[i]!,
      bsideEngaged: engaged[i]!,
      bsideBase: L.base,
      bsideTerms: L.terms,
      bsideMultiplier: L.multiplier,
      bsideKw: L.kw,
      bsideKwParts: L.parts,
      bsideKilled: killed,
      bsideWounded: L.kw - killed,
      bsideMissing: missTotal - capturedField - inPocket,
      bsideMissingParts: missingParts,
      bsideCaptured: capturedField + inPocket + surrenderedMen + stragglersTaken,
      bsideCapturedParts: capturedParts,
      bsideFlankDraw: flank[i]!.draw,
      bsideFlankThreshold: flank[i]!.threshold,
      bsideFlankTerms: flank[i]!.terms,
      bsideFlankBroken: flank[i]!.broken,
      bsideMoraleBefore: morale[i]!.before,
      bsideMoraleAfter: morale[i]!.after,
      bsideMoraleTerms: morale[i]!.terms,
      bsideDecisions: decisions,
      bsideResult: r,
      bsideCutOff: verdict[i]!.cutOff,
      bsideRetreatTo: leaving(i) && !surrendered ? side.retreatTo : null,
      bsidePursue: pursue,
      bsideLosses: losses,
      bsideHitDraw: -1,
      bsideHit: null,
    });
    outcomes.push({ faction: side.faction, retreatTo: leaving(i) && !surrendered ? side.retreatTo : null, surrendered, breakingOut: verdict[i]!.cutOff === 'break_out', routed: morale[i]!.routed });
  });
  const day: BattleDay = {
    bdayDay: input.day,
    bdayNumber: input.dayNumber,
    bdayType: input.type,
    bdayAttacker: input.attacker,
    bdayFrontage: input.frontageMen,
    bdayContact: contact,
    bdayDraws: DRAWS_PER_DAY,
    bdaySides: sides,
  };
  return { day, blocks, sides: [outcomes[0]!, outcomes[1]!] };
}

/**
 * The commanders hit today, on the leaders' own stream (`combat/<battle>/<day>/leaders`; combat note finding 5): one
 * draw per side whatever happens, so whether anyone is hit never shifts another draw. Below the pack's killed share he
 * is killed, then wounded, then captured if his side routed. A man whose force was taken (surrendered, or destroyed in a
 * failed breakout) is captured if not hit.
 */
export function leaderHits(rules: CombatRules, day: BattleDay, outcomes: readonly SideOutcome[], stream: RngStream): BattleDay {
  const l = rules.leaders;
  const sides = day.bdaySides.map((s, i) => {
    const draw = nextInt(stream, 1000);
    let hit: LeaderHit | null = null;
    if (s.bsideCommander !== null) {
      if (draw < l.killedPermille) hit = 'killed';
      else if (draw < l.killedPermille + l.woundedPermille) hit = 'wounded';
      else if (draw < l.killedPermille + l.woundedPermille + l.capturedPermille && outcomes[i]!.routed) hit = 'captured';
      else if (outcomes[i]!.surrendered) hit = 'captured';
    }
    return { ...s, bsideHitDraw: draw, bsideHit: hit };
  });
  return { ...day, bdaySides: sides };
}
