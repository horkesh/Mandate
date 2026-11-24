import { mandateProblems } from '../world/mandates.ts';
import { assignmentProblems } from '../world/assignments.ts';
/**
 * The seats layer's World (lane 0.5 replaces lane 0.6's stand-in comms World):
 * lane 0.2's v2 World and a scenario start, indexed once, with the lookups the
 * seats layer reads. Derived from World data, never saved.
 *
 * What lives where now:
 * - **Posts, holders, chains and strengths are State** (`command`, `forces`):
 *   read them through `seats/posts.ts`, never from here.
 * - **Courier days derive from the typed edges** (0052): a courier crosses an
 *   edge in the pack's courier fraction of a division's days (`WorldRules.movement.courierPermille`),
 *   rounded up, at least one.
 * - **A region's wire owner is its holder** (0052), so wire latency reads the
 *   day's control index (`latencyMapFor`), not a fixed table.
 * - **People's trait inputs are people State** (lane 1.1 retired lane 0.6's
 *   stand-in adapter, 0058): read a man through `traitsOf(world, state, id)`
 *   (`people/traits.ts`), never from here. This World keeps only a person's
 *   side at the start.
 * - **A faction's objective** is no longer the other capital (0058's stand-in, retired by lane 1.12): each principal's
 *   goals come from his pack doctrine (`rules.ruleSeats.principals`).
 */
import { strictCompare } from '../compare.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import { wireOwnerOf, type ControlIndex } from '../control-index/control-index.ts';
import type { FactionId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import { templateProblems, type ReportTemplate } from '../knowledge/templates.ts';
import { reportConfidenceProblems } from '../knowledge/confidence.ts';
import { latencyProblems, type LatencyMap, type LatencyRules } from '../messages/latency.ts';
import type { PlannerRules, PlansRules, PrincipalDoctrine, StandingRules } from '../world/world.ts';
import { noteRulesProblems } from '../plans/note-rules.ts';
import { situationReferenceProblems } from '../situations/references.ts';
import type { SituationDef } from '../situations/types.ts';
import { peopleRulesProblems, type PeopleRules, type TraitRules } from '../people/rules.ts';
import { verbRulesProblems } from '../people/verb-rules.ts';
import { recruitmentRuleProblems, selfEmancipationRuleProblems } from '../recruitment/rules.ts';
import { combatRulesProblems } from '../combat/rules.ts';
import { operationsRulesProblems } from '../operations/rules.ts';
import { politicsRulesProblems } from '../politics/rules.ts';
import { otherEnd, type WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';
import type { PostKindRole, World } from '../world/world.ts';
import { detentionProblems, validDemonstrationPolicy } from '../plans/detention.ts';
import { conditionalDoctrineProblems } from '../world/doctrine.ts';
import { letterKey, type LetterIdentity } from '../world/letters.ts';
import { seatIdFor } from './seats.ts';
import type { PaperDoctrine } from '../knowledge/papers.ts';

/** Keep report witnesses only for each issuing seat's own explicit prerequisites. */
export function paperDoctrines(world: SeatsWorld): ReadonlyMap<SeatId, PaperDoctrine> | undefined {
  const rows = world.map.world.rules.ruleSeats.principals.filter(r =>
    r.offensives.some(o => o.requiresPapers !== undefined) || r.calls.some(c => c.requiresPapers !== undefined) ||
    r.concentrations?.some(c => c.requiresPapers !== undefined) === true || r.proposalAnswers?.some(a => a.requiresPapers !== undefined) === true);
  const byIssuer = new Map<SeatId, PaperDoctrine>();
  for (const row of rows) {
    const principal = world.faction(row.faction).principal;
    byIssuer.set(seatIdFor(principal), { ...row, offensives: row.offensives.filter(o => o.issuer === undefined) });
    const authors = new Set(row.offensives.flatMap(o => o.issuer === undefined || o.requiresPapers === undefined ? [] : [o.issuer]));
    for (const author of authors) byIssuer.set(seatIdFor(author), { ...row, offensives: row.offensives.filter(o => o.issuer === author),
      calls: [], concentrations: [], proposalAnswers: [] });
  }
  for(const paper of world.map.world.rules.allocationInstruments??[]) {
    if(paper.requiresPapers===undefined)continue;
    const seat=seatIdFor(paper.issuer), prior=byIssuer.get(seat);
    const template=world.map.world.rules.ruleSeats.principals[0];
    if(template===undefined)continue;
    const basis=prior??{...template,offensives:[],calls:[],concentrations:[],proposalAnswers:[]};
    byIssuer.set(seat,{...basis,allocationPapers:[...(prior?.allocationPapers??[]),paper]});
  }
  return byIssuer.size?byIssuer:undefined;
}

/**
 * The rules the seats layer reads, all the pack's (`WorldRules`, 0072), read from the World it was indexed with, never
 * a kernel default: latency, report templates, and the people rules (lane 1.1), whose trait rules (`traits`) replaced
 * lane 0.6's labelled stand-in (0058).
 */
export interface SeatsRules {
  readonly latency: LatencyRules;
  readonly traits: TraitRules;
  readonly people: PeopleRules;
  readonly templates: readonly ReportTemplate[];
}

/** A person as the seats layer's World knows him: his side at the start. His traits are people State (`traitsOf`). */
export interface SeatPerson {
  readonly id: PersonId;
  /** His side at the start (0055); null for foreigners, neutrals and the unknown. */
  readonly faction: FactionId | null;
}

export interface SeatFaction {
  readonly id: FactionId;
  readonly principal: PersonId;
  /** The start's capital, for setup and validation only. Live locations read State.factionCapitals. */
  readonly seatRegion: RegionId;
}

export interface SeatsWorld {
  readonly map: WorldIndex;
  /** The scenario start it was indexed with: the game `createState` begins. */
  readonly start: ScenarioStart;
  readonly rules: SeatsRules;
  readonly regionIds: readonly RegionId[];
  readonly personIds: readonly PersonId[];
  /** Factions with a principal, the ones the seats layer asks. */
  readonly factionIds: readonly FactionId[];
  person(id: PersonId): SeatPerson;
  faction(id: FactionId): SeatFaction;
  /** A post kind's role (0058): the engine reads only this, never the pack's kind names. */
  roleOf(kind: string): PostKindRole | null;
  /** Courier days between two regions along the quickest path. Throws if unreachable. */
  courierDays(from: RegionId, to: RegionId): number;
  /** Regions a commander watches: where he stands and every neighbour across an edge, in id order. */
  watched(region: RegionId): readonly RegionId[];
  /**
   * Where a post's headquarters stood at the start of play: its strongest directly commanded block in the start (by
   * known men, ties by block id, as `headquartersOf` reads State), or an institutional office's government seat.
   * Null for a field post without opening blocks. Pack data,
   * so a principal may be told it; where the post's headquarters is today he may not (exit review P2).
   */
  startHeadquarters(post: PostId): RegionId | null;
  readonly situations: readonly SituationDef[];
  situation(id: SituationId): SituationDef;
}

export interface SeatsWorldOptions {
  readonly situations?: readonly SituationDef[];
}

export class SeatsWorldError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid seats world:\n- ${problems.join('\n- ')}`);
    this.name = 'SeatsWorldError';
  }
}


/** Index a v2 World and its start for the seats layer. Throws `SeatsWorldError` listing every problem. */
export function indexSeatsWorld(map: WorldIndex, start: ScenarioStart, options: SeatsWorldOptions = {}): SeatsWorld {
  const pack = map.world.rules;
  const rules: SeatsRules = Object.freeze({ latency: pack.latency, templates: pack.reportTemplates, traits: pack.people?.traits, people: pack.people });
  // The kernel takes any World it is handed (a fixture, an adapter), so it checks the pack's rules as the validator does.
  const problems: string[] = [
    ...mandateProblems(map.world,start),
    ...assignmentProblems(map.world,start),
    ...templateProblems(rules.templates),
    ...reportConfidenceProblems(pack.reportConfidence),
    ...latencyProblems(rules.latency),
    ...standingProblems(pack.standing),
    ...peopleRulesProblems(pack.people, map.world.vocabularies.values?.map((v) => v.id) ?? [], map.world.vocabularies.traits.map(t => t.id)),
    // Lane 1.5: attention, the order-to-value map, the verbs, the ladder, the audience and initiatives.
    ...verbRulesProblems(pack.people?.attention, pack.people?.verbs, map.world.vocabularies.values?.map((v) => v.id) ?? [], map.world.vocabularies.personKinds.map((k) => k.id)),
    ...plannerRuleProblems(pack.planner, pack.plans),
    ...recruitmentRuleProblems(pack.recruitment),
    ...selfEmancipationRuleProblems(pack.selfEmancipation),
    ...menAndRegionsReferenceProblems(map.world),
    ...combatRulesProblems(pack.combat, map.world.vocabularies.terrains.map((t) => t.id)),
    ...operationsRulesProblems(pack.operations, pack.pruning),
    // Lane 1.6: blocs, chambers, sessions and papers.
    ...politicsRulesProblems(map.world),
  ];

  const people = new Map<PersonId, SeatPerson>();
  for (const p of map.world.people) people.set(p.id, { id: p.id, faction: p.faction });
  for (const record of pack.recruitment.stateConditions ?? []) {
    if (!people.has(record.recordActor)) problems.push(`state condition ${record.recordId}: unknown actor ${record.recordActor}`);
    if (!start.posts.some(p => p.id === record.recordPost)) problems.push(`state condition ${record.recordId}: unknown own post ${record.recordPost}`);
    try { parseIsoDate(record.recordDate); } catch { problems.push(`state condition ${record.recordId}: invalid date`); }
  }

  const factions = new Map<FactionId, SeatFaction>();
  for (const f of start.factions) {
    if (f.principal === null) continue;
    if (f.capital === null) {
      problems.push(`faction ${f.faction}: a principal needs a capital to sit in`);
      continue;
    }
    if (people.get(f.principal)?.faction !== f.faction) problems.push(`faction ${f.faction}: principal ${f.principal} is not one of its people`);
    factions.set(f.faction, { id: f.faction, principal: f.principal, seatRegion: f.capital });
  }

  const situations = [...(options.situations ?? [])].sort((a, b) => strictCompare(a.id, b.id));
  // Each start post's side at the start, through its department: null for a neutral government's post. A department not
  // in the World is a problem, never a side of '' (exit review P4; FOUNDATION 11.3: an unknown lookup throws).
  const postSides = new Map<string, { readonly faction: FactionId | null }>();
  for (const p of start.posts) {
    const d = map.world.departments.find((x) => x.id === p.department);
    if (d === undefined) problems.push(`post ${p.id}: department ${p.department} is not in the World`);
    else postSides.set(p.id, { faction: d.faction });
  }
  problems.push(
    ...situationReferenceProblems(situations, {
      factions,
      posts: postSides,
      declaredPosts: new Set(start.temporaryPosts.map(p => p.id)),
      persons: people,
      regions: map.regions,
    }),
  );
  problems.push(...doctrineProblems(map, start, factions, postSides));
  for (const row of map.world.rules.ruleSeats.principals) for (const offensive of row.offensives) {
    if (offensive.requiresNotice !== undefined && !situations.some(s => s.id === offensive.requiresNotice && s.kind === 'notice' && s.faction === row.faction)) {
      problems.push(`rules.ruleSeats: ${offensive.requiresNotice} is not this faction's notice`);
    }
  }
  for (const wire of rules.latency.publicWires ?? []) {
    if (!map.regions.has(wire.from) || !map.regions.has(wire.to)) problems.push('latency.publicWires: unknown endpoint');
    if (!factions.has(wire.faction)) problems.push('latency.publicWires: unknown faction');
    try {
      if (daysFromCivil(parseIsoDate(wire.throughDate)) < daysFromCivil(parseIsoDate(wire.fromDate))) problems.push('latency.publicWires: date range is reversed');
    } catch { problems.push('latency.publicWires: invalid date'); }
    if (wire.source.trim().length === 0) problems.push('latency.publicWires: a public route needs a source');
  }
  // Lane 1.12 (G-1.12a): the forts the rules let be bombarded, and the record's terms, name regions of the map and sides.
  const bombardment = map.world.rules.combat.bombardment;
  for (const o of bombardment.objectives) if (!map.regions.has(o.region)) problems.push(`rules.combat.bombardment.objectives: ${o.region} is not a region`);
  for (const t of bombardment.recordTerms) {
    if (!factions.has(t.faction)) problems.push(`rules.combat.bombardment.recordTerms: ${t.faction} is not a faction`);
    if (!people.has(t.commander)) problems.push(`rules.combat.bombardment.recordTerms: ${t.commander} is not a person`);
  }
  if (problems.length > 0) throw new SeatsWorldError(problems);

  const regionIds = [...map.regions.keys()].sort(strictCompare);
  const courier = courierTable(map, regionIds, map.world.rules.movement.courierPermille);
  const roles = new Map(map.world.vocabularies.postKinds.map((k) => [k.id, k.role]));
  const situationById = new Map(situations.map((s) => [s.id, s]));
  const startBody = new Map<PostId, { readonly region: RegionId; readonly men: number }>();
  for (const b of [...start.forceBlocks].sort((x, y) => strictCompare(x.id, y.id))) {
    if (b.post === null) continue;
    const men = b.strength ?? 0;
    const best = startBody.get(b.post);
    if (best === undefined || men > best.men) startBody.set(b.post, { region: b.region, men });
  }
  const get = <K, V>(m: ReadonlyMap<K, V>, kind: string, id: K): V => {
    const v = m.get(id);
    if (v === undefined) throw new RangeError(`unknown ${kind} id "${String(id)}"`);
    return v;
  };
  return Object.freeze({
    map,
    start,
    rules,
    regionIds,
    personIds: [...people.keys()].sort(strictCompare),
    factionIds: [...factions.keys()].sort(strictCompare),
    person: (id: PersonId) => get(people, 'person', id),
    faction: (id: FactionId) => get(factions, 'faction', id),
    roleOf: (kind: string) => roles.get(kind) ?? null,
    courierDays: (from: RegionId, to: RegionId) => {
      const d = courier.get(`${from}|${to}`);
      if (d === undefined) throw new RangeError(`no courier path from ${from} to ${to}`);
      return d;
    },
    watched: (region: RegionId) => [region, ...(map.edgesAt.get(region) ?? []).map((e) => otherEnd(e, region))].filter((r, i, all) => all.indexOf(r) === i).sort(strictCompare),
    startHeadquarters: (post: PostId) => {
      const p = start.posts.find(p => p.id === post);
      if (p !== undefined && roles.get(p.kind) === 'office') {
        const side = map.world.departments.find(d => d.id === p.department)?.faction;
        return start.factions.find(f => f.faction === side)?.capital ?? p.region;
      }
      return startBody.get(post)?.region ?? null;
    },
    situations,
    situation: (id: SituationId) => get(situationById, 'situation', id),
  });
}

/** Problems with the conflicting-orders rule (0072): a conflict window of at least a day. */
export function standingProblems(rules: StandingRules): string[] {
  const problems: string[] = [];
  if (!Number.isSafeInteger(rules.conflictWindowDays) || rules.conflictWindowDays < 1) problems.push('standing rule conflictWindowDays must be a whole number of days, at least 1');
  return problems;
}

/**
 * Problems with the planner's and plans' rules (lane 1.2), as the validator checks them: whole numbers, divisors of
 * at least 1 (a weight of 0 would divide by zero), permilles in range, and at least one draft a day.
 */
export function plannerRuleProblems(planner: PlannerRules, plans: PlansRules): string[] {
  const problems: string[] = [];
  const whole = (name: string, v: number, min: number) => {
    if (!Number.isSafeInteger(v) || v < min) problems.push(`planner rule ${name} must be a whole number, at least ${min}`);
  };
  for (const k of ['hopShare', 'menPerDay', 'flankOverlapMax', 'flankLengthMax', 'flankPenalty', 'dedupeOverlap', 'topN', 'maxSearches', 'dailyDraftCap'] as const) whole(k, planner[k], 1);
  for (const k of ['retrogradeSlack', 'dedupeArrival', 'reducePerLevel', 'clearDays', 'forceDays', 'forcingThreat', 'assaultDays', 'pincerWindow', 'dependenceCost', 'partnerWillingnessWeight', 'partnerRegardWeight', 'partnerStandingWeight', 'partnerStandingPivot'] as const) whole(k, planner[k], 0);
  if (Number.isSafeInteger(planner.partnerStandingPivot) && planner.partnerStandingPivot > 1000) problems.push('planner rule partnerStandingPivot must be a permille');
  const w = planner.weights;
  for (const k of ['concentrationPerTimid', 'pausePerTimid', 'ratioBonusDivisor', 'earlyDivisor', 'hasteDivisor', 'supplyDivisor', 'outrunDivisor', 'exposureDivisor', 'coordinationDivisor', 'gloryDivisor', 'cautionDivisor'] as const) whole(`weights.${k}`, w[k], 1);
  for (const k of ['ratioPenaltyMax'] as const) whole(`weights.${k}`, w[k], 1);
  for (const k of ['riskBase', 'supplyBase', 'twoAxesAt', 'threeAxesAt', 'goalFit', 'ratioBonusMax', 'latePenaltyMax', 'latePerDay', 'earlyBonusMax', 'traitBase', 'perExtraAxis'] as const) whole(`weights.${k}`, w[k], 0);
  if (!Number.isSafeInteger(w.holdingTime)) problems.push('planner rule weights.holdingTime must be a whole number');
  const d = plans.goalDefaults;
  if (!Number.isSafeInteger(d.risk) || d.risk < 0 || d.risk > 1000) problems.push('plans rule goalDefaults.risk must be a permille');
  if (!Number.isSafeInteger(d.deadlineDays) || d.deadlineDays < 1) problems.push('plans rule goalDefaults.deadlineDays must be a whole number of days, at least 1');
  if (!Number.isSafeInteger(plans.holdingRisk)) problems.push('plans rule holdingRisk must be a whole number');
  problems.push(...noteRulesProblems(plans.notes));
  return problems;
}

/** A courier's whole days across one edge: `courierPermille` of a division's, rounded up, at least one. */
export function courierEdgeDays(lengthDays: number, courierPermille: number): number {
  return Math.max(1, Math.trunc((lengthDays * courierPermille + 999) / 1000));
}

/** Quickest courier days between every pair of regions (Dijkstra from each over every edge, off-map boxes included). */
function courierTable(map: WorldIndex, ids: readonly RegionId[], courierPermille: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const source of ids) {
    const best = new Map<RegionId, number>([[source, 0]]);
    const done = new Set<RegionId>();
    for (;;) {
      let next: RegionId | null = null;
      for (const [id, d] of best) {
        if (done.has(id)) continue;
        if (next === null || d < best.get(next)! || (d === best.get(next)! && id < next)) next = id;
      }
      if (next === null) break;
      done.add(next);
      for (const edge of map.edgesAt.get(next) ?? []) {
        const to = otherEnd(edge, next);
        const days = best.get(next)! + courierEdgeDays(Math.min(edge.lengthDays, edge.lengthDaysBA ?? edge.lengthDays), courierPermille);
        if (!best.has(to) || days < best.get(to)!) best.set(to, days);
      }
    }
    for (const [to, d] of best) out.set(`${source}|${to}`, d);
  }
  return out;
}

/**
 * Latency on today's map: courier days from the typed edges, and the wire of
 * whoever holds each region (0052: the wire belongs to a side). Build one per
 * tick from the morning's control index.
 */
export function latencyMapFor(world: SeatsWorld, index: ControlIndex, day?: number): LatencyMap {
  const wired = new Map<FactionId, RegionId[]>();
  for (const region of world.regionIds) {
    const owner = wireOwnerOf(index, region).owner;
    if (owner === null) continue;
    const list = wired.get(owner) ?? [];
    list.push(region);
    wired.set(owner, list);
  }
  return {
    publicWire: (from, to, faction) => day !== undefined && (world.rules.latency.publicWires ?? []).some(w => {
      const start = daysFromCivil(parseIsoDate(world.start.startDate));
      const when = start + day;
      const matches = w.faction === faction && ((w.from === from && w.to === to) || (w.from === to && w.to === from));
      const uncontested = [from,to].every(r => { const holder=wireOwnerOf(index,r).owner; return holder === null || holder === faction; });
      return matches && uncontested && when >= daysFromCivil(parseIsoDate(w.fromDate)) && when <= daysFromCivil(parseIsoDate(w.throughDate));
    }),
    courierDays: (from, to) => world.courierDays(from, to),
    daysToWire: (from, faction) => {
      const list = wired.get(faction);
      if (list === undefined || list.length === 0) return null;
      let best: number | null = null;
      for (const r of list) {
        const d = world.courierDays(from, r);
        if (best === null || d < best) best = d;
      }
      return best;
    },
    region: (id) => ({ wireOwner: wireOwnerOf(index, id).owner }),
  };
}

/** The post kinds the World names, by role (a filter post's kinds, an intelligence post's). */
export function kindsWithRole(world: SeatsWorld, role: PostKindRole): readonly string[] {
  return world.map.world.vocabularies.postKinds.filter((k) => k.role === role).map((k) => k.id);
}


/** What the men-and-regions rules name must be in the World: the arm and the raising post kinds in its vocabularies, the call's values, the lines' faction (lane 1.7). */
export function menAndRegionsReferenceProblems(world: World): string[] {
  const { recruitment, selfEmancipation } = world.rules;
  const v = world.vocabularies;
  const problems: string[] = [];
  // A pack where no post raises regiments names no arm that matters.
  if (recruitment.raisingPostKinds.length > 0 && !v.arms.some((a) => a.id === recruitment.arm)) problems.push(`recruitment rule arm ${recruitment.arm} is not in the pack's arms`);
  for (const k of recruitment.raisingPostKinds) if (!v.postKinds.some((p) => p.id === k)) problems.push(`recruitment rule raisingPostKinds: ${k} is not a post kind`);
  const values = new Set((v.values ?? []).map((x) => x.id as string));
  for (const value of [...recruitment.callTerms.honours, ...recruitment.callTerms.offends]) if (!values.has(value)) problems.push(`recruitment rule callTerms: value ${value} is not in the pack's values`);
  for (const p of recruitment.callProfiles ?? []) for (const value of [...p.honours, ...p.offends]) if (!values.has(value)) problems.push(`recruitment callProfiles.${p.id}: value ${value} is not in the pack's values`);
  if (selfEmancipation.linesFaction !== null && !world.factions.some((f) => f.id === selfEmancipation.linesFaction)) problems.push(`selfEmancipation rule linesFaction ${selfEmancipation.linesFaction} is not a faction`);
  for (const p of selfEmancipation.protectedFlags) for (const r of p.regions) if (!world.regions.some((x) => x.id === r)) problems.push(`selfEmancipation rule protectedFlags.${p.flag}: region ${r} is not in the World`);
  for (const c of world.census) {
    const region = world.regions.find((r) => r.id === c.region);
    if (region === undefined || (region.kind !== 'land' && region.kind !== 'key_point')) problems.push(`census: region ${c.region} is not a land region of the World`);
    if (!Number.isSafeInteger(c.enslavedPopulation) || c.enslavedPopulation < 0) problems.push(`census: region ${c.region}: a whole number of people, not negative`);
  }
  return problems;
}
/**
 * Problems with the rule-seat principals' doctrine (lane 1.12; `rules.ruleSeats.principals`): at most one row for each
 * faction with a principal (none: no doctrine); its posts on that faction's side at the start; its calls to posts that raise regiments (a governor,
 * under the pack's recruitment rules) within the pack's longest term, each post once; its offensives to known regions.
 */
export function doctrineProblems(map: WorldIndex, start: ScenarioStart, factions: ReadonlyMap<FactionId, SeatFaction>, postSides: ReadonlyMap<string, { readonly faction: FactionId | null }>): string[] {
  const problems: string[] = [];
  const rows = map.world.rules.ruleSeats.principals;
  const policy = map.world.rules.plans.demonstration;
  if (policy !== undefined && !validDemonstrationPolicy(policy)) problems.push('rules.plans.demonstration: invalid policy');
  const recruitment = map.world.rules.recruitment;
  const selfGoverning = new Set(map.world.vocabularies.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id));
  const posts = new Map(start.posts.map((p) => [p.id as string, p]));
  const kinds = new Set(map.world.vocabularies.personKinds.map((k) => k.id as string));
  const callIds = new Set<string>();
  for (const id of [...factions.keys()].sort(strictCompare)) {
    // A faction with no row has no doctrine: its rule-seat principal answers his commanders and gives no order of his own.
    // A pack states one row for each faction (the pack validator requires it); two are a contradiction.
    const n = rows.filter((r) => r.faction === id).length;
    if (n > 1) problems.push(`rules.ruleSeats.principals: faction ${id} has ${n} doctrine rows, not one`);
  }
  rows.forEach((r, i) => {
    const at = `rules.ruleSeats.principals[${i}]`;
    if (r.letterNamespace !== undefined && rows.findIndex(q => q.letterNamespace === r.letterNamespace) !== i) problems.push(`${at}.letterNamespace: duplicate issuer namespace`);
    const declared = new Map(start.temporaryPosts.map(p => [p.id, p]));
    const hasPerson = (id: PersonId) => map.world.people.some(p => p.id === id);
    const hasPost = (id: PostId) => posts.has(id) || declared.has(id);
    const hasLetter = (issuer: PersonId, letter: LetterIdentity) => rows.some(q =>
      q.offensives.some(o => (o.issuer ?? factions.get(q.faction)?.principal) === issuer &&
        o.letter !== undefined && letterKey(o.letter) === letterKey(letter)) ||
      (factions.get(q.faction)?.principal === issuer && q.consultations?.some(c => letterKey(c.letter) === letterKey(letter)) === true));
    for (const p of conditionalDoctrineProblems(r, id => map.regions.has(id), { hasPerson, hasPost, hasLetter })) problems.push(`${at}.${p.field}: ${p.message}`);
    const onSide = (post: string, what: string) => {
      if (!posts.has(post)) problems.push(`${at}.${what}: ${post} is not a start post`);
      else if (postSides.get(post)?.faction !== r.faction) problems.push(`${at}.${what}: ${post} is not on ${r.faction}'s side at the start`);
    };
    if (r.concentrateAt !== null) onSide(r.concentrateAt, 'concentrateAt');
    if ((r.concentrateAt === null) !== (r.concentrateSource === null)) problems.push(`${at}.concentrateSource: a concentration post cites its source, and only a concentration post has one`);
    const onDeclaredSide = (id: PostId, field: string, prerequisite?: string) => {
      const p = posts.get(id) ?? declared.get(id);
      const dept = map.world.departments.find(d => d.id === p?.department);
      const joining = dept?.faction === null && dept.id === prerequisite && map.world.vocabularies.departmentKinds.some(k => k.id === dept.kind && k.government && !k.selfGoverning);
      if (p === undefined || (dept?.faction !== r.faction && !joining)) problems.push(`${at}.${field}: ${id} is not a declared post on this side`);
    };
    const datedCause = (date: string, department: string, source: string) => {
      try { parseIsoDate(date); } catch { problems.push(`${at}: invalid doctrine date ${date}`); }
      if (!map.world.departments.some(d => d.id === department)) problems.push(`${at}: unknown prerequisite department ${department}`);
      if (source.trim().length === 0) problems.push(`${at}: dated doctrine requires a source`);
    };
    const establishmentPosts = new Set<string>();
    for (const a of (r.appointments ?? []).filter(a => 'fromDate' in a)) {
      onDeclaredSide(a.post, 'appointments.post', a.requiresDepartment);
      datedCause(a.fromDate, a.requiresDepartment, a.source);
      const p = declared.get(a.post);
      if (p === undefined || p.holder !== a.person || !map.world.vocabularies.postKinds.some(k => k.id === p.kind && k.temporary && k.creatable === 'appoint')) problems.push(`${at}: appointment must name its declared holder and an appointment-created temporary post`);
      if (!map.world.people.some(p => p.id === a.person)) problems.push(`${at}: unknown appointee ${a.person}`);
      if (a.fromPost !== null) onDeclaredSide(a.fromPost, 'appointments.fromPost', a.requiresDepartment);
      if (establishmentPosts.has(a.post)) problems.push(`${at}: duplicate establishment ${a.post}`);
      establishmentPosts.add(a.post);
    }
    const concentrationDates = new Set<string>();
    for (const c of r.concentrations ?? []) {
      if (c.namedRegiments !== undefined) {
        const named = c.namedRegiments;
        const from = c.fromPosts[0];
        if (c.id === undefined || c.fromPosts.length !== 1 || named.ids.length === 0 || new Set(named.ids).size !== named.ids.length ||
          !r.calls.some(call => call.id === named.afterCall && call.post === from) ||
          !named.ids.every(id => map.world.regimentCatalogue?.some(record => record.id === id && record.side === r.faction))) {
          problems.push('named concentration requires an id, one donor with its own call, and distinct same-side catalogue regiments');
        }
      }
      onDeclaredSide(c.post, 'concentrations.post', c.requiresDepartment);
      // A source government can join independently of the receiving army's
      // government. The principal's received picture still gates each source.
      for (const from of c.fromPosts) onDeclaredSide(from, 'concentrations.fromPosts', (posts.get(from) ?? declared.get(from))?.department ?? c.requiresDepartment);
      datedCause(c.fromDate, c.requiresDepartment, c.source);
      if (concentrationDates.has(c.fromDate)) problems.push(`${at}: ambiguous concentration date ${c.fromDate}`);
      concentrationDates.add(c.fromDate);
    }
    if (!(r.inquireEveryDays >= 1)) problems.push(`${at}.inquireEveryDays must be at least 1`);
    for (const arm of ['land', 'naval'] as const) for (const k of r.appointKinds[arm]) if (!kinds.has(k)) problems.push(`${at}.appointKinds.${arm}: "${k}" is not a person kind`);
    const called = new Set<string>();
    r.calls.forEach((c, j) => {
      const p = posts.get(c.post) ?? declared.get(c.post);
      const side = posts.has(c.post) ? postSides.get(c.post)?.faction : map.world.departments.find(d => d.id === p?.department)?.faction;
      if (p === undefined) problems.push(`${at}.calls[${j}].post: ${c.post} is not a declared post`);
      else if (side !== null && side !== r.faction) problems.push(`${at}.calls[${j}].post: ${c.post} belongs to another side at the start`);
      const dept = p === undefined ? undefined : map.world.departments.find((d) => d.id === p.department);
      if (p !== undefined && (!recruitment.raisingPostKinds.includes(p.kind) || (dept !== undefined && selfGoverning.has(dept.kind)))) problems.push(`${at}.calls[${j}]: ${c.post} does not raise regiments (rules.recruitment.raisingPostKinds)`);
      if (c.termDays !== null && c.termDays > recruitment.maxTermDays) problems.push(`${at}.calls[${j}]: a term of ${c.termDays} days is longer than the pack's ${recruitment.maxTermDays}`);
      if (c.arm !== undefined && !map.world.vocabularies.arms.some(a => a.id === c.arm && !a.naval)) problems.push(`${at}.calls[${j}]: ${c.arm} is not a land arm`);
      if (c.address !== undefined && (c.address !== 'office' || c.id === undefined || c.source.trim().length === 0)) problems.push(`${at}.calls[${j}]: an office call needs an identity and source`);
      if (c.offer !== undefined && (!map.regions.has(c.offer.region) || c.offer.receiver!==undefined && (!posts.has(c.offer.receiver) || postSides.get(c.offer.receiver)?.faction !== r.faction))) problems.push(`${at}.calls[${j}]: an offer needs a known destination and this side's receiving office`);
      const key = c.id ?? c.post;
      if (c.termsId !== undefined && !recruitment.callProfiles?.some(p => p.id === c.termsId)) problems.push(`${at}.calls[${j}]: unknown call profile ${c.termsId}`);
      if (c.id !== undefined) {
        if (callIds.has(c.id)) problems.push(`${at}.calls[${j}]: duplicate pack call id ${c.id}`);
        callIds.add(c.id);
      }
      if (called.has(key)) problems.push(`${at}.calls[${j}]: duplicate call ${key}`);
      called.add(key);
    });
    r.offensives.forEach((o, j) => {
      onDeclaredSide(o.post, `offensives[${j}].post`);
      if (o.purpose !== undefined) {
        const goalAt = `${at}.offensives[${j}]`;
        const target = o.purpose.target.post;
        const declaredTarget = posts.get(target) ?? declared.get(target);
        const opposing = posts.has(target) ? postSides.get(target)?.faction :
          map.world.departments.find(d => d.id === declaredTarget?.department)?.faction;
        if (opposing == null || opposing === r.faction) problems.push(`${goalAt}: target must be a declared opposing command`);
        if (o.letter === undefined) problems.push(`${goalAt}: detention directive requires its authored identity`);
        if (o.issuer !== undefined && !hasPerson(o.issuer)) problems.push(`${goalAt}: unknown issuer`);
        for (const problem of detentionProblems(map, o.purpose)) problems.push(`${goalAt}: ${problem}`);
      } else if (!map.regions.has(o.objective)) problems.push(`${at}.offensives[${j}]: ${o.objective} is not a region`);
    });
    const appointed = new Set<string>();
    for (const [j, a] of (r.appointments ?? []).entries()) {
      if (!('onDate' in a)) continue;
      const here = `${at}.appointments[${j}]`;
      if (appointed.has(a.post)) problems.push(`${here}: ${a.post} has more than one historical appointment`);
      appointed.add(a.post);
      try { parseIsoDate(a.onDate); } catch { problems.push(`${here}.onDate: a full calendar date is required`); }
      if (!a.source.trim()) problems.push(`${here}.source: the appointment must cite its record`);
      const person = map.world.people.find((p) => p.id === a.person);
      // A later office may be filled after a declared change of service. The runtime
      // still waits for the principal's received eligibility; this validates a possible
      // appointment, without changing the person's opening side or forcing his choice.
      if (person === undefined || (person.faction !== r.faction && person.service?.toFaction !== r.faction) || factions.get(r.faction)?.principal === a.person) problems.push(`${here}.person: an own-side person or declared service entrant other than the principal is required`);
      const post = posts.get(a.post);
      if (post !== undefined) onSide(a.post, `appointments[${j}].post`);
      else {
        const template = start.temporaryPosts.find((p) => p.id === a.post);
        const kind = map.world.vocabularies.postKinds.find((k) => k.id === template?.kind);
        const dept = map.world.departments.find((d) => d.id === template?.department);
        if (template === undefined || !kind?.temporary || kind.creatable !== 'appoint' || dept?.faction !== r.faction) problems.push(`${here}.post: an own-side start post or a declared temporary command creatable by appointment is required`);
        if (template?.parent !== null && template?.parent !== undefined) onSide(template.parent, `appointments[${j}].parent`);
      }
    }
  });
  return problems;
}
