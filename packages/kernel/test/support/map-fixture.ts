/**
 * Setting-free World builders for the control, supply and invariant tests
 * (decision 0003: no setting names under packages/). Only the fields the map
 * code reads are meaningful; the rest are empty.
 */
import { strictCompare } from '../../src/compare.ts';
import { toId, type DepotId, type EdgeId, type FactionId, type InstallationId, type RailLineId, type RegionId } from '../../src/ids.ts';
import type { ControlShares, RegionControlTable } from '../../src/control/control.ts';
import type { DepotRecord, EdgeRecord, EdgeType, InstallationRecord, RegionKind, RegionRecord, SeasonWindow } from '../../src/world/graph.ts';
import { indexWorld, type WorldIndex } from '../../src/world/index.ts';
import type { ScenarioStart } from '../../src/world/scenario.ts';
import type { SeasonEffect, World } from '../../src/world/world.ts';
import type { ReportType } from '../../src/knowledge/report.ts';
import type { ReportTemplate } from '../../src/knowledge/templates.ts';
import type { RouteKind } from '../../src/messages/latency.ts';
import { DEFAULT_COMPLIANCE_RULES } from '../../src/compliance.ts';
import type { PeopleRules } from '../../src/people/rules.ts';
import type { CombatRules } from '../../src/combat/rules.ts';

export const R = (id: string): RegionId => toId('region', id);
export const F = (id: string): FactionId => toId('faction', id);
export const E = (id: string): EdgeId => toId('edge', id);
export const D = (id: string): DepotId => toId('depot', id);
export const I = (id: string): InstallationId => toId('installation', id);
export const L = (id: string): RailLineId => toId('railLine', id);

export const SEASONS: readonly SeasonEffect[] = [
  { reason: 'mud', defaultMonths: [1, 2, 3, 12], lengthPermille: 1500, capacityPermille: 600 },
  { reason: 'low_water', defaultMonths: [8, 9, 10], lengthPermille: 1300, capacityPermille: 500 },
  { reason: 'flood', defaultMonths: [4, 5], lengthPermille: 1200, capacityPermille: 800 },
  { reason: 'ice', defaultMonths: [1, 2], lengthPermille: 2000, capacityPermille: 300 },
];

const t = (type: ReportType, subtype: string | null, route: RouteKind, cadenceDays: number, maxAgeDays: number, keepSupersededDays: number): ReportTemplate => ({
  templateType: type,
  templateSubtype: subtype,
  templateRoute: route,
  cadenceDays,
  maxAgeDays,
  keepSupersededDays,
});

/** The fixtures' report templates: the testbed's and Union's values (0072), from the Union information-flows note's table. */
export const FIXTURE_TEMPLATES: readonly ReportTemplate[] = [
  t('wire-dispatch', null, 'wire', 2, 30, 3),
  t('strength-return', null, 'mail', 10, 60, 10),
  t('effective-strength', null, 'wire', 0, 30, 3),
  t('casualty-return', null, 'courier', 0, 90, 30),
  t('enemy-estimate', null, 'in-person', 1, 14, 0),
  t('press', null, 'mail', 0, 21, 3),
  t('informal', 'cabinet-word', 'in-person', 7, 21, 7),
  t('informal', 'caller', 'in-person', 0, 21, 7),
  t('informal', 'governor-wire', 'wire', 0, 21, 7),
  t('informal', 'legislator', 'in-person', 0, 21, 7),
  t('informal', 'navy-channel', 'wire', 0, 21, 7),
  t('informal', 'railroad-man', 'wire', 0, 21, 7),
  t('observer-letter', null, 'courier', 0, 60, 14),
  t('retrospective', null, 'mail', 0, 400, 400),
  t('advice', 'requested', 'in-person', 0, 60, 30),
  t('advice', 'memorandum', 'courier', 0, 60, 30),
];

/** The values vocabulary the fixtures' people rules name (lane 1.1; the starting vocabulary both packs declare). */
export const FIXTURE_VALUES: readonly string[] = ['abolition', 'caution', 'conciliation', 'career', 'duty', 'glory', 'order', 'party', 'reputation', 'union'];

/**
 * The fixtures' people rules (lane 1.1): the packs' numbers, except that history's shadow draws with no spread, so a
 * fixture person's drawn stats are his centres exactly, and the direction table is one the fixtures can hit exactly.
 */
export const FIXTURE_PEOPLE_RULES: PeopleRules = {
  shadow: {
    centrePermille: { high: 800, above: 600, average: 500, below: 400, low: 200 },
    unknownCentre: 500,
    spread: 0,
    unknownSpread: 0,
    regardPermille: { high: 1000, above: 300, average: 0, below: -300, low: -1000 },
    regardUnknown: 0,
  },
  compliance: DEFAULT_COMPLIANCE_RULES,
  goalTerms: [
    { goal: 'hold', boldness: 400, honours: ['caution'], offends: [] },
    { goal: 'advance', boldness: 600, honours: ['glory'], offends: ['caution'] },
  ],
  context: { oversight: 500, oversightPerCourierDay: 50, oversightWired: 150, oversightMin: 100, leaderCredibility: 500 },
  relay: { reservationsHoldDays: 0, slowWalkHoldDays: 2, reinterpretHoldDays: 4 },
  filter: { holdFor: [{ value: 'order', days: 1 }], trimFor: [{ value: 'reputation', claimKinds: ['own-losses'] }], candidAt: 500 },
  traits: {
    perceptionPivot: 500,
    perceptionPerPoint: 3,
    perceptionValues: [{ value: 'caution', permille: 500 }],
    perceptionMax: 4000,
    demandBase: 1000,
    demandPerPoint: 2, assaultMargin: 1500,
    holdBand: 1500,
    wantsMenPermille: 800,
    paperPermille: 1400,
  },
  grievances: { bypassedWeight: 150 },
  attention: {
    cap: 12,
    refillDays: 7,
    costs: { order: 1, review_edit: 1, review_approve: 0, review_send_back: 0, go: 0, decide_staff: 0, decide_overrule: 1, delegate: 0, appoint: 1, relieve: 1, transfer: 1, inquire: 0, consult: 1, audience: 1, observer: 1, promise: 1, pressure: 1, address: 1 },
  },
  verbs: {
    weekDays: 7,
    orderValues: [
      { order: 'verb:appoint', boldness: null, honours: ['career', 'reputation'], offends: [], gateTopics: [], notCheaperThan: null },
      { order: 'verb:consult', boldness: null, honours: ['duty'], offends: [], gateTopics: [], notCheaperThan: null },
      { order: 'verb:inquire', boldness: null, honours: ['duty'], offends: [], gateTopics: [], notCheaperThan: null },
      { order: 'verb:observer', boldness: null, honours: ['duty'], offends: [], gateTopics: [], notCheaperThan: null },
      { order: 'verb:relieve', boldness: null, honours: [], offends: ['career', 'reputation'], gateTopics: [], notCheaperThan: null },
      { order: 'verb:transfer', boldness: null, honours: ['duty'], offends: ['reputation'], gateTopics: [], notCheaperThan: null },
    ],
    relief: [
      { mode: 'quiet_department', grievanceWeight: 100, regardDelta: -100, standingDelta: 0 },
      { mode: 'own_request', grievanceWeight: 50, regardDelta: 0, standingDelta: 0 },
      { mode: 'outright', grievanceWeight: 250, regardDelta: -250, standingDelta: -100 },
    ],
    inquiry: { freePerWeek: 2, pesteredWeight: 60 },
    promise: { dueDays: 30, brokenWeight: 200, brokenRegard: -150 },
    pressure: { weight: 150, oversight: 200, days: 14 },
    observer: { oversight: 150, monitoredWeight: 100, letterEveryDays: 7 },
    audience: { maxCounters: 3, cooldownDays: 7, vindicateRegard: 150, vindicateStanding: 50 },
    ladder: { thresholds: [100, 200, 300, 400, 500, 650, 800], dispositionPerRung: 60, publicStanding: 600, rivalStanding: 700, decayDivisor: 4 },
    initiatives: [],
  },
};

/**
 * The fixtures' combat rules (lane 1.3): the packs' numbers. The fixtures declare no terrains, so their ground takes
 * the stated row for any terrain the table does not name, at open ground's frontage.
 */
export const FIXTURE_COMBAT_RULES: CombatRules = {
  baseRates: { meeting: { attacker: 160, defender: 160 }, attack_open: { attacker: 170, defender: 160 }, attack_hasty: { attacker: 190, defender: 95 }, assault_works: { attacker: 180, defender: 40 }, rearguard: { attacker: 50, defender: 100 } },
  works: { hastyAt: 200, preparedAt: 500 },
  terrain: [],
  otherTerrain: { frontageMen: 60000, lossPermille: 0 },
  multiplier: { min: 250, max: 3000 },
  terms: { qualityWeight: 600, qualityMax: 300, competenceWeight: 400, competenceMax: 150, numbersMax: 150, surprisePermille: 300, successiveDayPermille: -100, noiseMax: 150 },
  commit: { all_out: { sharePermille: 1000, posturePermille: 200 }, main: { sharePermille: 700, posturePermille: 0 }, probe: { sharePermille: 300, posturePermille: -400 }, defend: { sharePermille: 1000, posturePermille: 0 } },
  killedPermille: 150,
  missingPermille: { held: 100, gained_ground: 80, fell_back: 300, withdrew: 300, routed: 500 },
  capturedPermille: { held: 0, gained_ground: 0, fell_back: 100, withdrew: 150, routed: 300 },
  flank: { basePermille: 50, numbersWeight: 200, qualityWeight: 300, maxPermille: 400, moraleLoss: 150, missingPermille: 200 },
  morale: { start: 600, lossWeight: 1500, nerveWeight: 200, experienceWeight: 300, routAt: 250, routFloor: 150, recoveryDays: 5 },
  experience: { start: 400, gainPerDay: 30 },
  equipment: { start: 600, routLoss: 100 },
  decisions: { probeShare: 700, allOutBoldness: 700, holdShare: 600, breakoutShare: 400, followBoldness: 550, pressBoldness: 750 },
  maxBattleDays: 7,
  fieldControlPermille: 200,
  pursuit: { followPermille: 100, pressPermille: 300, cavalryPermille: 150 },
  straggleReturnPermille: 100,
  leaders: { killedPermille: 15, woundedPermille: 40, capturedPermille: 20 },
  phases: {
    hours: [
      { phase: 'dawn', fromHour: 5, toHour: 8 },
      { phase: 'morning', fromHour: 8, toHour: 12 },
      { phase: 'afternoon', fromHour: 12, toHour: 17 },
      { phase: 'evening', fromHour: 17, toHour: 21 },
    ],
    lossShares: { meeting: [100, 300, 450, 150], attack_open: [100, 300, 450, 150], attack_hasty: [100, 350, 400, 150], assault_works: [150, 400, 350, 100], rearguard: [200, 400, 300, 100] },
  },
};

/** The fixtures' design parameters (the testbed's and Union's values: 0064, 0072). */export const FIXTURE_RULES = {
  stores: { menPerCapacityUnit: 20000, capDays: 30, lowDays: 7, norms: [] },
  occupation: { occupyPermille: 100, occupyFullMen: 5000 },
  combat: FIXTURE_COMBAT_RULES,
  operations: { pauseDays: 3, maxRepulses: 3, pursuitDays: { follow: 1, press: 2 }, holdControlPermille: 500, works: { perNightPermille: 50, capPermille: 300, lostWhenStormedPermille: 150 }, returns: { firstLowPermille: 200, revealDays: 7 } },
  pruning: { operationDays: 60, battleDays: 120, responseDays: 60 },
  movement: { marchMinCapacityPermille: 1000, courierPermille: 333 },
  ruleSeats: { warFlags: [] },
  latency: { wireDays: 0, mailPermille: 2000, specialMessengerPermille: 500, courierNoiseMaxDays: 1, specialMessengerPrice: 1 },
  reportTemplates: FIXTURE_TEMPLATES,
  standing: { conflictWindowDays: 7 },
  planner: {"hopShare":250,"menPerDay":1000,"flankOverlapMax":600,"flankLengthMax":1600,"flankPenalty":2000,"retrogradeSlack":0,"dedupeOverlap":800,"dedupeArrival":1500,"topN":4,"maxSearches":64,"reducePerLevel":10,"clearDays":4000,"forceDays":1000,"forcingThreat":4000,"assaultDays":1000,"pincerWindow":2000,"dependenceCost":120,"partnerWillingnessWeight":300, "partnerRegardWeight": 1000, "partnerStandingWeight": 1000, "partnerStandingPivot": 500,"dailyDraftCap":3,"weights":{"riskBase":200,"supplyBase":1100,"concentrationPerTimid":250,"pausePerTimid":400,"twoAxesAt":500,"threeAxesAt":800,"goalFit":400,"ratioBonusMax":300,"ratioBonusDivisor":10,"ratioPenaltyMax":600,"latePenaltyMax":600,"latePerDay":40,"earlyBonusMax":300,"earlyDivisor":25000,"holdingTime":-300,"traitBase":1100,"hasteDivisor":10000,"supplyDivisor":10000,"outrunDivisor":4,"exposureDivisor":20,"coordinationDivisor":10000,"perExtraAxis":50,"gloryDivisor":5,"cautionDivisor":2}},
  plans: {"goalDefaults":{"risk":500,"deadlineDays":20,"rail":true,"river":false,"sea":false,"neutral":false,"awaitWord":false,"approveAsDrafted":true},"holdingRisk":-400},
  recruitment: {"callTerms":{"boldness":500,"honours":["duty"],"offends":[]},"raisingPostKinds":[],"menPerRegiment":1000,"arm":"infantry","storesDays":10,"musterDays":5,"rungs":[{"rung":"exceed","sharePermille":1200,"delayDays":0},{"rung":"comply","sharePermille":1000,"delayDays":0},{"rung":"comply_with_reservations","sharePermille":1000,"delayDays":3},{"rung":"slow_walk","sharePermille":1000,"delayDays":10},{"rung":"reinterpret","sharePermille":600,"delayDays":5}],"loyaltyFull":800,"loyaltyWeight":500,"maxTermDays":1095,"musterBlockedDays":14},
  selfEmancipation: {"linesFaction":null,"agencyReasons":{"resistanceWithin":"agency:fixture","resistanceElsewhere":"agency:fixture","flightToLines":"agency:fixture"},"protectedFlags":[],"cadenceDays":7,"resistancePerMillion":200,"pressureFlags":[],"flightPerMillion":1000,"reachWithForce":1000,"reachLinesOnly":400,"holdShare":600,"policyBase":500,"policyFlags":[]},
  people: FIXTURE_PEOPLE_RULES,
} as const;

export function region(id: string, kind: RegionKind = 'land'): RegionRecord {
  return {
    id: R(id),
    name: `region.${id}.name`,
    kind,
    terrain: kind === 'off_map' ? null : kind === 'river' || kind === 'sea' ? 'water' : 'plain',
    flags: [],
    offMapRole: kind === 'off_map' ? 'foreign_power' : null,
    weatherZone: null,
    refPoint: null,
    counties: [],
    labelHints: null,
    provenance: [],
  };
}

export interface EdgeOptions {
  readonly type?: EdgeType;
  readonly days?: number;
  readonly daysBA?: number | null;
  readonly capacity?: number;
  readonly line?: string | null;
  readonly breakOfBulk?: boolean;
  readonly seasons?: readonly SeasonWindow[];
}

/** An edge between two regions, ends put in code-unit order; id `type:a:b` (or `type:a:b:line`). */
export function edge(x: string, y: string, o: EdgeOptions = {}): EdgeRecord {
  const [a, b] = [x, y].sort(strictCompare) as [string, string];
  const type = o.type ?? 'road';
  const line = o.line ?? (type === 'rail' ? 'line_1' : null);
  return {
    id: E(line === null ? `${type}:${a}:${b}` : `${type}:${a}:${b}:${line}`),
    type,
    a: R(a),
    b: R(b),
    lengthDays: o.days ?? 1,
    lengthDaysBA: o.daysBA ?? null,
    capacity: o.capacity ?? 3,
    line: line === null ? null : L(line),
    breakOfBulk: o.breakOfBulk ?? false,
    depthFeet: null,
    seasons: o.seasons ?? [],
    provenance: [],
  };
}

export function depot(id: string, at: string, kind: 'source' | 'depot' = 'source', capacity = 5): DepotRecord {
  return { id: D(id), region: R(at), kind, name: `depot.${id}.name`, capacity, provenance: [] };
}

export function fort(id: string, at: string, commands: readonly string[] = []): InstallationRecord {
  return { id: I(id), region: R(at), kind: 'fort', name: `installation.${id}.name`, fort: { water: 'reduction', commandsEdges: commands.map(E) }, provenance: [] };
}

export interface WorldParts {
  readonly regions: readonly RegionRecord[];
  readonly edges: readonly EdgeRecord[];
  readonly depots?: readonly DepotRecord[];
  readonly installations?: readonly InstallationRecord[];
  readonly factions?: readonly string[];
  /** Department ids, each on the faction its prefix names (`a_gov` is a's), or none for a `neutral_` id. */
  readonly departments?: readonly string[];
  readonly supplyControlPermille?: number;
  readonly retreatControlPermille?: number;
}

export function mapWorld(parts: WorldParts): World {
  const lines = [...new Set(parts.edges.flatMap((e) => (e.line === null ? [] : [e.line])))].sort(strictCompare);
  return {
    formatVersion: 2,
    pack: 'fixture',
    rules: {
      capacityMax: 5,
      supplyControlPermille: parts.supplyControlPermille ?? 250,
      retreatControlPermille: parts.retreatControlPermille ?? 50,
      seasons: SEASONS,
      ...FIXTURE_RULES,
      // Every fixture faction is at war from day 1 (0064): the fixtures test the war, not the peace before it.
      ruleSeats: { warFlags: (parts.factions ?? ['a', 'b']).map((f) => ({ faction: F(f), flag: null })) },
    },
    vocabularies: { terrains: [], postKinds: [], departmentKinds: [], arms: [], personKinds: [], traits: [], ranks: [], rankKinds: [], values: FIXTURE_VALUES.map((v) => ({ id: v, name: `value.${v}`, costOnly: false })), blocs: [], standingOrderKinds: [] },
    factions: (parts.factions ?? ['a', 'b']).map((f) => ({ id: F(f), name: `faction.${f}.name` })),
    departments: (parts.departments ?? []).map((d) => ({ id: toId('department', d), faction: d.startsWith('neutral_') ? null : F(d.split('_')[0]!), kind: 'government', name: `department.${d}.name`, provenance: [] })),
    regions: parts.regions,
    installations: parts.installations ?? [],
    edges: parts.edges,
    railLines: lines.map((l) => ({ id: l, name: `rail.${l}.name`, provenance: [] })),
    depots: parts.depots ?? [],
    weatherZones: [],
    people: [],
    census: [],
  };
}

export function mapIndex(parts: WorldParts): WorldIndex {
  return indexWorld(mapWorld(parts));
}

/** A control table from `{ region: { faction: permille } }`, in canonical order. */
export function controlTable(spec: Readonly<Record<string, Readonly<Record<string, number>>>>): RegionControlTable {
  const out: Record<RegionId, ControlShares> = {};
  for (const r of Object.keys(spec).sort(strictCompare)) {
    const shares: Record<FactionId, number> = {};
    for (const f of Object.keys(spec[r]!).sort(strictCompare)) if (spec[r]![f]! > 0) shares[F(f)] = spec[r]![f]!;
    out[R(r)] = shares;
  }
  return out;
}

/** A scenario start carrying only control and, optionally, governments (the rest empty), for setup tests. */
export function startWith(
  control: Readonly<Record<string, Readonly<Record<string, number>>>>,
  startDate = '1900-03-01',
  governments: Readonly<Record<string, string>> = {},
): ScenarioStart {
  return {
    id: toId('scenario', 'fixture_start'),
    name: 'scenario.fixture_start.name',
    startDate,
    seed: 1,
    factions: [],
    control: Object.keys(control).map((r) => ({ region: R(r), shares: Object.keys(control[r]!).map((f) => ({ faction: F(f), permille: control[r]![f]! })) })),
    fortification: [],
    loyalty: [],
    edgeConditions: [],
    obstructions: [],
    depotConditions: [],
    posts: [],
    forceBlocks: [],
    governments: Object.keys(governments).map((r) => ({ region: R(r), department: governments[r] === 'unknown' ? 'unknown' : toId('department', governments[r]!), provenance: [{ source: 'FIXTURE', at: null }] })),
  };
}

/**
 * The line: a1 - a2 - mid - b2 - b1, a road chain, with a river region `w`
 * off a2 and b2 (open water), a source at each end, and a forward depot at a2.
 *
 *   a1 -- a2 -- mid -- b2 -- b1
 *          \          /
 *           +-- w ---+   (river edges)
 */
export function lineMap(departments: readonly string[] = []): WorldIndex {
  return mapIndex({
    departments,
    regions: ['a1', 'a2', 'mid', 'b2', 'b1'].map((r) => region(r)).concat([region('w', 'river')]),
    edges: [
      edge('a1', 'a2', { type: 'rail', days: 1, capacity: 4, line: 'a_line' }),
      edge('a2', 'mid', { days: 2, capacity: 3 }),
      edge('mid', 'b2', { days: 2, capacity: 3 }),
      edge('b2', 'b1', { type: 'rail', days: 1, capacity: 4, line: 'b_line' }),
      edge('a2', 'w', { type: 'river', days: 1, capacity: 2 }),
      edge('b2', 'w', { type: 'river', days: 1, capacity: 2 }),
    ],
    depots: [depot('a_src', 'a1'), depot('b_src', 'b1'), depot('a_fwd', 'a2', 'depot', 2)],
  });
}
