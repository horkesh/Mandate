/**
 * The battle model in the day tick (lane 1.3; FOUNDATION section 12's row 1.3; the combat note's P1–P9). It replaces
 * Phase 0's simple contest (0064). Pure: it reads State and returns proposals for each owner, and its own battle-record
 * changes; the tick applies them (`tick/forces.ts`).
 *
 * The model, stated so it can be checked:
 * - **Who is in a region.** Each side's land blocks standing there, not on a leg, not aboard, not surrendered. Ships hold
 *   no ground. A block whose strength no source gives counts as none, and every battle record lists it (0064).
 * - **When a battle is fought** (P1). One per region per day, between the two strongest sides there, on the day at least
 *   one commander chooses to attack. Only a side whose blocks marched in during play may attack (0064: a garrison the
 *   start put there holds; it does not press), and not while recovering from a rout. Neutral ground nobody holds a share
 *   of is passed, never fought over (0055).
 * - **Who decides** (P6). The commander of each side here is the holder of the post whose blocks here are strongest; he
 *   commits at dawn and stands or withdraws at night by his traits and what he sees (`decide.ts`), never by dice. A
 *   vacant post's force is led by the pack's unknown man (`people.shadow.unknownCentre`).
 * - **The battle type** (P2): a breakout is fought at the assault rates; both attacking is a meeting; a defender who fell
 *   back here from this attacker yesterday fights a rearguard; otherwise the region's fortification (`regions`) makes it
 *   an assault on works or on hasty works, and a defender who arrived today with no works meets the attack in the open.
 * - **What it proposes**: losses, condition, routs and surrenders to `forces`; retreats to `movement` (to the neighbour
 *   its side holds most at or above the retreat threshold, 0019); control to the side left holding the field (the pack's
 *   rate); a commander killed, wounded or captured to `people` and his post's vacancy to `command`, which also releases a
 *   surrendered block from its post.
 * - **Occupation** is kept from Phase 0: a side alone that marched in gains control by its men (0064). It is not a battle.
 * - **A battle closes** when one side has left, when neither commander attacks, or after the pack's days.
 * - **Streams.** One per battle-day, `combat/<battle>/<day>`, with six draws; one for its commanders,
 *   `combat/<battle>/<day>/leaders`, with two. Nothing else draws, so reading a record never shifts a later draw.
 */
import { ALL_JUDGE, JUDGE, notPossible, ordered, type BattleOrders } from './orders.ts';
import { strictCompare } from '../compare.ts';
import type { CombatCommandChange } from '../command/command.ts';
import type { ControlDelta } from '../control/control.ts';
import type { FortificationDelta } from '../regions/regions.ts';
import { factionOfBlock, isNaval, type ForceDelta } from '../forces/forces.ts';
import { toId, type EdgeId, type FactionId, type ForceBlockId, type PersonId, type PostId, type RegionId } from '../ids.ts';
import { latestEnemyClaims } from '../knowledge/beliefs.ts';
import { marchBar, type MarchGround } from '../movement/march.ts';
import type { PeopleChange } from '../people/people.ts';
import { trueOf } from '../people/people.ts';
import { demandRatio, perceptionBias, traitsOf, type PrincipalLookup } from '../people/traits.ts';
import { createStream } from '../rng.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import { edgeLeg } from '../supply/supply.ts';
import { otherEnd } from '../world/index.ts';
import { commitAtDawn, type CommanderView } from './decide.ts';
import { battleId, lastDay, openBattleIn, type BattleDay, type BattleId, type BattleRecordChange, type BattleTerm } from './records.ts';
import { leaderHits, resolveDay, type BlockInput, type SideInput } from './resolve.ts';
import type { BattleType, CombatRules, Commit } from './rules.ts';

/** One side's presence in a region. */
export interface Presence {
  readonly faction: FactionId;
  /** Known men present. */
  readonly men: number;
  readonly blocks: readonly ForceBlockId[];
  /** Blocks that marched in during play, and so may press for the region. */
  readonly pressing: readonly ForceBlockId[];
  /** Blocks whose strength no source gives, counted as none. */
  readonly unknown: readonly ForceBlockId[];
}

/** A side alone that marched in, gaining control by its men (0064). */
export interface OccupationRecord {
  readonly region: RegionId;
  readonly faction: FactionId;
  readonly men: number;
  readonly unknown: readonly ForceBlockId[];
  readonly deltaPermille: number;
}

/** A side leaving a battle tonight for its retreat region. */
export interface RetreatRecord {
  readonly battle: BattleId;
  readonly faction: FactionId;
  readonly from: RegionId;
  readonly to: RegionId;
  readonly edge: EdgeId;
  readonly blocks: readonly ForceBlockId[];
  readonly routed: boolean;
}

/** One battle-day fought today. */
export interface FoughtDay {
  readonly battle: BattleId;
  readonly region: RegionId;
  readonly opened: boolean;
  readonly closed: boolean;
  readonly day: BattleDay;
}

export interface CombatResult {
  readonly fought: readonly FoughtDay[];
  readonly occupations: readonly OccupationRecord[];
  /** Battles closed today because nobody attacked, a side was gone, or the days ran out; the day each last fought. */
  readonly quiet: readonly { readonly battle: BattleId; readonly lastDay: number }[];
  readonly records: readonly BattleRecordChange[];
  readonly forces: readonly ForceDelta[];
  readonly retreats: readonly RetreatRecord[];
  readonly control: readonly ControlDelta[];
  readonly people: readonly PeopleChange[];
  readonly command: readonly CombatCommandChange[];
  /** Works lost where a defender in them was driven out (lane 1.4; 0029), for `regions` to apply. */
  readonly fortification: readonly FortificationDelta[];
  /** Every block that fought today (it does not take stragglers back today: P8). */
  readonly inBattle: readonly ForceBlockId[];
}

const VACANT: PersonId = toId('person', 'vacant_post');

/** Each side's land troops standing (not marching, not aboard, not surrendered) in each region, by region then strength. */
export function presenceByRegion(ground: Pick<MarchGround, 'map'>, state: State): Map<RegionId, Presence[]> {
  const raw = new Map<RegionId, Map<FactionId, { men: number; blocks: ForceBlockId[]; pressing: ForceBlockId[]; unknown: ForceBlockId[] }>>();
  const ids = Object.keys(state.forceLocations) as ForceBlockId[];
  for (const id of ids.sort(strictCompare)) {
    const loc = state.forceLocations[id]!;
    if (loc.locMarch !== null || loc.locAboard !== null) continue;
    const kind = ground.map.regions.get(loc.locRegion)!.kind;
    if (kind !== 'land' && kind !== 'key_point') continue;
    if (isNaval(ground.map, state, id)) continue;
    const b = state.forceBlockStates[id]!;
    if (b.fbSurrenderedDay !== null) continue;
    const faction = factionOfBlock(ground.map, state, id);
    if (faction === null) continue;
    const byFaction = raw.get(loc.locRegion) ?? new Map();
    raw.set(loc.locRegion, byFaction);
    const p = byFaction.get(faction) ?? { men: 0, blocks: [], pressing: [], unknown: [] };
    byFaction.set(faction, p);
    p.blocks.push(id);
    if (loc.locSinceDay > 0) p.pressing.push(id);
    if (b.fbStrength === null) p.unknown.push(id);
    else p.men += b.fbStrength;
  }
  const out = new Map<RegionId, Presence[]>();
  for (const region of [...raw.keys()].sort(strictCompare)) {
    const sides = [...raw.get(region)!].map(([faction, p]) => ({ faction, ...p })).sort((a, b) => b.men - a.men || strictCompare(a.faction, b.faction));
    out.set(region, sides);
  }
  return out;
}

/** Whether a side may attack today: a block of it marched in and presses (0064), and is not recovering from a rout. */
export function mayAttackToday(rules: CombatRules, state: State, side: Presence, day: number): boolean {
  return side.pressing.some((b) => {
    const routed = state.forceBlockStates[b]!.fbRoutedDay;
    return routed === null || day - routed >= rules.morale.recoveryDays;
  });
}

/** A commander as his decisions read him: a man's own traits and stats, or the pack's unknown man for a vacant post. */
export function commanderView(world: PrincipalLookup, state: State, person: PersonId | null): CommanderView {
  const rules = world.map.world.rules.people;
  if (person === null) {
    const unknown = rules.shadow.unknownCentre;
    const p = { id: VACANT, boldness: unknown, values: [] as string[] };
    return { person: null, boldness: unknown, competence: unknown, nerve: unknown, perceptionPermille: perceptionBias(rules.traits, p).permille, demandPermille: demandRatio(rules.traits, p) };
  }
  const t = traitsOf(world, state, person);
  const truth = trueOf(state, person);
  return { person, boldness: t.boldness, competence: truth.trueCompetence, nerve: truth.trueNerve, perceptionPermille: perceptionBias(rules.traits, t).permille, demandPermille: demandRatio(rules.traits, t) };
}

/** The post whose blocks here are strongest (known men, ties by post id), and its holder if he is serving. */
export function sideCommand(state: State, blocks: readonly ForceBlockId[]): { readonly post: PostId | null; readonly person: PersonId | null } {
  const men = new Map<PostId, number>();
  for (const b of blocks) {
    const post = state.forceAssignments[b] ?? null;
    if (post === null) continue;
    men.set(post, (men.get(post) ?? 0) + (state.forceBlockStates[b]!.fbStrength ?? 0));
  }
  const best = [...men].sort(([pa, ma], [pb, mb]) => mb - ma || strictCompare(pa, pb))[0];
  if (best === undefined) return { post: null, person: null };
  const holder = state.postStates[best[0]]?.postHolder ?? null;
  const serving = holder !== null && (state.personStatus[holder]?.statusKind ?? 'serving') === 'serving';
  return { post: best[0], person: serving ? holder : null };
}

/** Where a side may fall back to from a region (0019): the passable neighbour it holds most at or above the threshold, ties by id. */
export function retreatTarget(ground: MarchGround, state: State, region: RegionId, faction: FactionId): { readonly to: RegionId; readonly edge: EdgeId } | null {
  const threshold = ground.map.world.rules.retreatControlPermille;
  let best: { to: RegionId; edge: EdgeId; share: number } | null = null;
  for (const edge of ground.map.edgesAt.get(region) ?? []) {
    const to = otherEnd(edge, region);
    const leg = edgeLeg(ground.map, edge, region, ground.month, ground.network);
    if (marchBar(ground, leg, faction, false) !== null) continue;
    const there = state.regionControl[to]?.[faction] ?? 0;
    if (there < threshold) continue;
    if (best === null || there > best.share || (there === best.share && strictCompare(to, best.to) < 0)) best = { to, edge: edge.id, share: there };
  }
  return best === null ? null : { to: best.to, edge: best.edge };
}

/** Whether a commander holds any report of the enemy's strength in the region (a meeting finds him surprised if not). */
function forewarned(state: State, person: PersonId | null, region: RegionId): boolean {
  if (person === null) return false;
  const knowledge = state.knowledgeBySeat[seatIdFor(person)];
  return knowledge !== undefined && latestEnemyClaims(knowledge).has(region);
}

/** The battle type and the attacker (P2), from the commits, the ground and yesterday's battles. */
function battleTypeOf(state: State, region: RegionId, day: number, commits: readonly Commit[], sides: readonly Presence[], breaking: readonly boolean[]): { readonly type: BattleType; readonly attacker: FactionId | null } {
  const b = breaking.findIndex((x) => x);
  if (b >= 0) return { type: 'assault_works', attacker: sides[b]!.faction };
  const attacking = commits.map((c) => c !== 'defend');
  if (attacking[0] && attacking[1]) return { type: 'meeting', attacker: null };
  const a = attacking[0] ? 0 : 1;
  const attacker = sides[a]!.faction;
  const defender = sides[1 - a]!;
  // A rearguard: the defender fell back here from this attacker yesterday.
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const last = lastDay(state.battleRecords[id]!);
    if (last === null || last.bdayDay !== day - 1) continue;
    const mine = last.bdaySides.find((s) => s.bsideFaction === defender.faction);
    const theirs = last.bdaySides.find((s) => s.bsideFaction !== defender.faction);
    if (mine?.bsideRetreatTo === region && theirs?.bsideFaction === attacker) return { type: 'rearguard', attacker };
  }
  return { type: 'attack_open', attacker };
}

/** Today's battles and occupations, with the proposals they make. */
export function combatDay(world: PrincipalLookup, ground: MarchGround, state: State, day: number, orders: ReadonlyMap<PostId, BattleOrders> = new Map()): CombatResult {
  const rules = ground.map.world.rules.combat;
  const presence = presenceByRegion(ground, state);
  const out = {
    fought: [] as FoughtDay[],
    occupations: [] as OccupationRecord[],
    quiet: [] as { battle: BattleId; lastDay: number }[],
    records: [] as BattleRecordChange[],
    forces: [] as ForceDelta[],
    retreats: [] as RetreatRecord[],
    control: [] as ControlDelta[],
    people: [] as PeopleChange[],
    command: [] as CombatCommandChange[],
    fortification: [] as FortificationDelta[],
    inBattle: [] as ForceBlockId[],
  };
  const fightingIn = new Set<RegionId>();
  const closeQuiet = (id: BattleId) => {
    const last = lastDay(state.battleRecords[id]!);
    const lastFought = last?.bdayDay ?? state.battleRecords[id]!.battleStartDay;
    out.records.push({ change: 'close', id, day: lastFought });
    out.quiet.push({ battle: id, lastDay: lastFought });
  };

  for (const [region, all] of presence) {
    const shares = state.regionControl[region] ?? {};
    const open = openBattleIn(state, region);
    // Operations already resolved today's fire across water. The shore batteries are not standing in the fort.
    if (open !== null && lastDay(state.battleRecords[open]!)?.bdayDay === day && lastDay(state.battleRecords[open]!)?.bdayType === 'bombard') continue;
    // Neutral ground nobody holds a share of is passed, never fought over (0055; review S1).
    const neutral = Object.keys(shares).length === 0 && ground.network.neutralGround?.[region] !== undefined;
    if (all.length < 2 || neutral) {
      if (open !== null) closeQuiet(open);
      if (all.length === 1 && !neutral) occupy(ground, state, region, all[0]!, out.occupations, out.control);
      continue;
    }
    const sides = [all[0]!, all[1]!].sort((a, b) => strictCompare(a.faction, b.faction));
    let record = open === null ? null : state.battleRecords[open]!;
    if (record !== null && (record.battleFactions[0] !== sides[0]!.faction || record.battleFactions[1] !== sides[1]!.faction)) {
      closeQuiet(open!);
      record = null;
    }
    const last = record === null ? null : lastDay(record);
    const breaking = sides.map((s) => last !== null && last.bdayDay === day - 1 && last.bdaySides.find((x) => x.bsideFaction === s.faction)?.bsideCutOff === 'break_out');
    const command = sides.map((s) => sideCommand(state, s.blocks));
    const views = command.map((c) => commanderView(world, state, c.person));
    // His seat's orders for today (lane 1.12): a vacant post's side, or a post with no orders, is left to judgement.
    const given = command.map((c) => (c.post === null || c.person === null ? ALL_JUDGE : (orders.get(c.post) ?? ALL_JUDGE)));
    const commits = sides.map((s, i) => {
      if (breaking[i]) return { choice: 'all_out' as Commit, terms: [{ btermKind: 'breaking_out', btermValue: 0, btermSource: command[i]!.person } as BattleTerm] };
      const mayAttack = mayAttackToday(rules, state, s, day);
      const rule = commitAtDawn(rules, views[i]!, mayAttack, s.men, sides[1 - i]!.men);
      const order = given[i]!.commit;
      // A side that may not attack defends whatever it was ordered: the order is recorded as not carried out.
      if (!mayAttack && order !== JUDGE && order !== 'defend') return { choice: rule.choice, terms: [...rule.terms, notPossible(command[i]!.person)] };
      return ordered(rule, order, command[i]!.person);
    });
    if (commits.every((c) => c.choice === 'defend')) {
      if (record !== null) closeQuiet(open!);
      continue;
    }
    // Today's battle: the open one if it has days left, else a new one.
    let id: BattleId;
    let dayNumber: number;
    let opened = false;
    if (record !== null && record.battleDays.length < rules.maxBattleDays) {
      id = open!;
      dayNumber = record.battleDays.length + 1;
    } else {
      if (record !== null) closeQuiet(open!);
      id = battleId(region, day);
      dayNumber = 1;
      opened = true;
    }
    let { type, attacker } = battleTypeOf(state, region, day, commits.map((c) => c.choice), sides, breaking);
    if (type === 'attack_open') {
      const fort = state.regionFortification[region] ?? 0;
      const defender = sides.find((s) => s.faction !== attacker)!;
      if (fort >= rules.works.preparedAt) type = 'assault_works';
      else if (fort >= rules.works.hastyAt) type = 'attack_hasty';
      else if (defender.blocks.every((b) => state.forceLocations[b]!.locSinceDay === day)) type = 'meeting';
    }
    const terrain = ground.map.regions.get(region)!.terrain ?? '';
    const terrainRow = rules.terrain.find((t) => t.terrain === terrain) ?? rules.otherTerrain;
    const inputs = sides.map(
      (s, i): SideInput => ({
        faction: s.faction,
        post: command[i]!.post,
        commander: views[i]!,
        commit: commits[i]!.choice,
        commitTerms: commits[i]!.terms,
        blocks: s.blocks.map((b): BlockInput => {
          const f = state.forceBlockStates[b]!;
          return { id: b, men: f.fbStrength, stragglers: f.fbStragglers, morale: f.fbMorale, experience: f.fbExperience, equipment: f.fbEquipment };
        }),
        retreatTo: retreatTarget(ground, state, region, s.faction)?.to ?? null,
        breakingOut: breaking[i]!,
        surprised: !forewarned(state, command[i]!.person, region),
        pursuedPermille: type === 'rearguard' && s.faction !== attacker ? pursuitRate(ground, state, region, day, s.faction, sides.find((x) => x.faction === attacker)!) : 0,
        orders: given[i]!,
      }),
    );
    const resolved = resolveDay(rules, { day, dayNumber, type, attacker, terrain, frontageMen: terrainRow.frontageMen, terrainLossPermille: terrainRow.lossPermille, sides: [inputs[0]!, inputs[1]!] }, createStream(state.gameSeed, `combat/${id}/${day}`));
    const bday = leaderHits(rules, resolved.day, resolved.sides, createStream(state.gameSeed, `combat/${id}/${day}/leaders`));
    fightingIn.add(region);

    // Proposals: forces, movement, control, people, command.
    for (const o of resolved.blocks) {
      out.inBattle.push(o.block);
      if (o.killed + o.wounded + o.missing + o.captured + o.stragglersCaptured > 0) {
        out.forces.push({ change: 'battle_losses', block: o.block, killed: o.killed, wounded: o.wounded, missing: o.missing, captured: o.captured, stragglersCaptured: o.stragglersCaptured, cause: 'combat' });
      }
      if (o.moraleDelta !== 0 || o.experienceDelta !== 0 || o.equipmentDelta !== 0 || o.routed || o.surrendered) {
        out.forces.push({ change: 'condition', block: o.block, morale: o.moraleDelta, experience: o.experienceDelta, equipment: o.equipmentDelta, routedDay: o.routed ? day : null, surrenderedDay: o.surrendered ? day : null, cause: 'combat' });
      }
      if (o.surrendered) out.command.push({ change: 'release', block: o.block, battle: id });
    }
    resolved.sides.forEach((o, i) => {
      if (o.retreatTo === null) return;
      const edge = retreatTarget(ground, state, region, o.faction)!.edge;
      out.retreats.push({ battle: id, faction: o.faction, from: region, to: o.retreatTo, edge, blocks: sides[i]!.blocks, routed: o.routed });
    });
    const gone = resolved.sides.map((o) => o.retreatTo !== null || o.surrendered);
    // Works stormed (lane 1.4; 0029): a defender in works driven from them loses the pack's share of them.
    const works = state.regionFortification[region] ?? 0;
    const defender = attacker === null ? -1 : sides.findIndex((s) => s.faction !== attacker);
    const lost = ground.map.world.rules.operations.works.lostWhenStormedPermille;
    if ((type === 'attack_hasty' || type === 'assault_works') && defender >= 0 && gone[defender] && works > 0 && lost > 0) out.fortification.push({ region, deltaPermille: -Math.min(works, lost), cause: 'combat' });
    if (gone[0] !== gone[1]) {
      const holder = sides[gone[0] ? 1 : 0]!.faction;
      const have = shares[holder] ?? 0;
      const delta = Math.min(rules.fieldControlPermille, 1000 - have);
      if (delta > 0) out.control.push({ region, faction: holder, deltaPermille: delta, cause: 'combat' });
    }
    for (const s of bday.bdaySides) {
      if (s.bsideHit === null || s.bsideCommander === null) continue;
      out.people.push({ change: 'status', person: s.bsideCommander, status: s.bsideHit });
      if (s.bsidePost !== null) out.command.push({ change: 'vacate', post: s.bsidePost, person: s.bsideCommander, why: s.bsideHit, battle: id });
    }

    // The record: opened, today's day, and closed when a side is gone or the days ran out.
    const causes = [...new Set(sides.flatMap((s) => s.pressing.map((b) => state.forceAssignments[b] ?? null)).filter((p): p is PostId => p !== null))].sort(strictCompare);
    if (opened) out.records.push({ change: 'open', id, record: { battleRegion: region, battleStartDay: day, battleEndDay: null, battleFactions: sides.map((s) => s.faction), battleCauses: [], battleDays: [] } });
    out.records.push({ change: 'day', id, day: bday, causes });
    const closed = gone.some((g) => g) || dayNumber >= rules.maxBattleDays;
    if (closed) out.records.push({ change: 'close', id, day });
    out.fought.push({ battle: id, region, opened, closed, day: bday });
  }
  // Open battles where nobody stands any more close quietly too.
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const r = state.battleRecords[id]!;
    if (r.battleEndDay === null && !presence.has(r.battleRegion) && !fightingIn.has(r.battleRegion)) closeQuiet(id);
  }
  return out;
}

/**
 * The share of a pursued side's stragglers its pursuer takes on a rearguard day (P8; lane 1.4): by the pursuer's own
 * choice yesterday (lane 1.3's `bsidePursue`), with more when he has cavalry there.
 */
function pursuitRate(ground: MarchGround, state: State, region: RegionId, day: number, pursued: FactionId, pursuer: Presence): number {
  const p = ground.map.world.rules.combat.pursuit;
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const last = lastDay(state.battleRecords[id]!);
    if (last === null || last.bdayDay !== day - 1) continue;
    const fled = last.bdaySides.find((x) => x.bsideFaction === pursued);
    const chose = last.bdaySides.find((x) => x.bsideFaction === pursuer.faction);
    if (fled?.bsideRetreatTo !== region || chose === undefined) continue;
    const base = chose.bsidePursue === 'press' ? p.pressPermille : chose.bsidePursue === 'follow' ? p.followPermille : 0;
    if (base === 0) return 0;
    const arms = ground.map.world.vocabularies.arms;
    const cavalry = pursuer.blocks.some((b) => arms.find((a) => a.id === state.forceBlockStates[b]!.fbArm)?.cavalry === true);
    return Math.min(1000, base + (cavalry ? p.cavalryPermille : 0));
  }
  return 0;
}

/** Occupation (0064): a side alone that marched in gains `occupation.occupyPermille` a day at `occupyFullMen`, in proportion below. */
function occupy(ground: MarchGround, state: State, region: RegionId, side: Presence, records: OccupationRecord[], control: ControlDelta[]): void {
  if (side.pressing.length === 0) return;
  const rules = ground.map.world.rules.occupation;
  const have = state.regionControl[region]?.[side.faction] ?? 0;
  if (have >= 1000) return;
  const rate = Math.trunc((rules.occupyPermille * Math.min(side.men, rules.occupyFullMen)) / rules.occupyFullMen);
  const delta = Math.min(rate, 1000 - have);
  if (delta <= 0) return;
  records.push({ region, faction: side.faction, men: side.men, unknown: side.unknown, deltaPermille: delta });
  control.push({ region, faction: side.faction, deltaPermille: delta, cause: 'occupation' });
}
