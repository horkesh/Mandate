/**
 * A tiny, valid v2 pack held in memory, with setting-free names (decision
 * 0003). Tests break one thing at a time and assert which check fires.
 */
import { DEFAULT_COMPLIANCE_RULES } from '@mandate/kernel';
import type { PackFiles } from '../../src/index.ts';

const tpl = (templateType: string, templateSubtype: string | null, templateRoute: string, cadenceDays: number, maxAgeDays: number, keepSupersededDays: number) => ({
  templateType,
  templateSubtype,
  templateRoute,
  cadenceDays,
  maxAgeDays,
  keepSupersededDays,
});

/** The rules 0072 moved out of the kernel, at the testbed's and Union's values: latency, report templates, standing goals. */
export const MESSAGE_RULES = {
  latency: { wireDays: 0, mailPermille: 2000, specialMessengerPermille: 500, courierNoiseMaxDays: 1, specialMessengerPrice: 1 },
  reportTemplates: [
    tpl('wire-dispatch', null, 'wire', 2, 30, 3),
    tpl('strength-return', null, 'mail', 10, 60, 10),
    tpl('effective-strength', null, 'wire', 0, 30, 3),
    tpl('casualty-return', null, 'courier', 0, 90, 30),
    tpl('enemy-estimate', null, 'in-person', 1, 14, 0),
    tpl('press', null, 'mail', 0, 21, 3),
    tpl('informal', 'cabinet-word', 'in-person', 7, 21, 7),
    tpl('informal', 'caller', 'in-person', 0, 21, 7),
    tpl('informal', 'governor-wire', 'wire', 0, 21, 7),
    tpl('informal', 'legislator', 'in-person', 0, 21, 7),
    tpl('informal', 'navy-channel', 'wire', 0, 21, 7),
    tpl('informal', 'railroad-man', 'wire', 0, 21, 7),
    tpl('observer-letter', null, 'courier', 0, 60, 14),
    tpl('retrospective', null, 'mail', 0, 400, 400),
    tpl('advice', 'requested', 'in-person', 0, 60, 30),
    tpl('advice', 'memorandum', 'courier', 0, 60, 30),
  ],
  standing: { conflictWindowDays: 7 },
  planner: {"hopShare":250,"menPerDay":1000,"flankOverlapMax":600,"flankLengthMax":1600,"flankPenalty":2000,"retrogradeSlack":0,"dedupeOverlap":800,"dedupeArrival":1500,"topN":4,"maxSearches":64,"reducePerLevel":10,"clearDays":4000,"forceDays":1000,"forcingThreat":4000,"assaultDays":1000,"pincerWindow":2000,"dependenceCost":120,"partnerWillingnessWeight":300, "partnerRegardWeight": 1000, "partnerStandingWeight": 1000, "partnerStandingPivot": 500,"dailyDraftCap":3,"weights":{"riskBase":200,"supplyBase":1100,"concentrationPerTimid":250,"pausePerTimid":400,"twoAxesAt":500,"threeAxesAt":800,"goalFit":400,"ratioBonusMax":300,"ratioBonusDivisor":10,"ratioPenaltyMax":600,"latePenaltyMax":600,"latePerDay":40,"earlyBonusMax":300,"earlyDivisor":25000,"holdingTime":-300,"traitBase":1100,"hasteDivisor":10000,"supplyDivisor":10000,"outrunDivisor":4,"exposureDivisor":20,"coordinationDivisor":10000,"perExtraAxis":50,"gloryDivisor":5,"cautionDivisor":2}},
  plans: {"goalDefaults":{"risk":500,"deadlineDays":20,"rail":true,"river":false,"sea":false,"neutral":false,"awaitWord":false,"approveAsDrafted":true},"holdingRisk":-400},
  // Lane 1.1: the people core's rules, at the packs' values.
  people: {
    shadow: {
      centrePermille: { high: 800, above: 650, average: 500, below: 350, low: 200 },
      unknownCentre: 500,
      spread: 100,
      unknownSpread: 200,
      regardPermille: { high: 600, above: 300, average: 0, below: -300, low: -600 },
      regardUnknown: 0,
    },
    compliance: { ...DEFAULT_COMPLIANCE_RULES },
    goalTerms: [
      { goal: 'hold', boldness: 400, honours: ['caution'], offends: [] },
      { goal: 'advance', boldness: 600, honours: ['glory'], offends: ['caution'] },
    ],
    context: { oversight: 500, leaderCredibility: 500 },
    relay: { reservationsHoldDays: 0, slowWalkHoldDays: 2, reinterpretHoldDays: 4 },
    filter: { holdFor: [{ value: 'order', days: 1 }], trimFor: [{ value: 'reputation', claimKinds: ['own-losses'] }], candidAt: 500 },
    traits: {
      perceptionPivot: 500, perceptionPerPoint: 3, perceptionValues: [{ value: 'caution', permille: 500 }], perceptionMax: 4000,
      demandBase: 1000, demandPerPoint: 2, assaultMargin: 1500, holdBand: 1500, wantsMenPermille: 800, paperPermille: 1400,
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
  },
};

const manifest = {
  formatVersion: 2,
  id: 'fixture',
  status: 'draft',
  name: 'pack.name',
  defaultLocale: 'en',
  locales: ['en'],
  rules: {
    capacityMax: 5,
    supplyControlPermille: 250,
    retreatControlPermille: 50,
    stores: { menPerCapacityUnit: 20000, capDays: 30, lowDays: 7 },
    contest: { occupyPermille: 100, occupyFullMen: 5000, contestPermille: 200 },
    movement: { marchMinCapacityPermille: 1000, courierPermille: 333 },
    ruleSeats: { warFlags: [{ faction: 'red', flag: null }, { faction: 'blue', flag: null }] },
    ...MESSAGE_RULES,
    seasons: [
      { reason: 'mud', defaultMonths: [1, 2, 12], lengthPermille: 1500, capacityPermille: 600 },
      { reason: 'low_water', defaultMonths: [8, 9], lengthPermille: 1300, capacityPermille: 500 },
    ],
  },
  vocabularies: {
    terrains: [
      { id: 'plain', name: 'terrain.plain', roadLengthPermille: 1000, water: false },
      { id: 'coastal', name: 'terrain.coastal', roadLengthPermille: 1000, water: true },
      { id: 'river', name: 'terrain.river', roadLengthPermille: 1000, water: true },
    ],
    postKinds: [
      { id: 'chief', name: 'post_kind.chief', creatable: 'start_only', temporary: false },
      { id: 'army', name: 'post_kind.army', creatable: 'appoint', temporary: false },
      { id: 'squadron', name: 'post_kind.squadron', creatable: 'directive', temporary: false },
      { id: 'expedition', name: 'post_kind.expedition', creatable: 'appoint', temporary: true },
    ],
    departmentKinds: [{ id: 'ministry', name: 'department_kind.ministry' }, { id: 'province', name: 'department_kind.province', government: true }],
    arms: [
      { id: 'foot', name: 'arm.foot', naval: false },
      { id: 'ships', name: 'arm.ships', naval: true },
    ],
    personKinds: [{ id: 'officer', name: 'person_kind.officer' }],
    traits: [{ id: 'bold', name: 'trait.bold', gate: false }],
    ranks: [
      { id: 'junior', name: 'rank.junior', seniority: 1, kind: 'regular' },
      { id: 'senior', name: 'rank.senior', seniority: 2, kind: 'regular' },
    ],
    rankKinds: [{ id: 'regular', name: 'rank_kind.regular' }],
    values: ['career', 'caution', 'duty', 'glory', 'order', 'reputation'].map((v) => ({ id: v, name: `value.${v}` })),
    blocs: [{ id: 'greens', name: 'bloc.greens' }],
    standingOrderKinds: [{ id: 'hold', name: 'order_kind.hold' }],
  },
  factions: [
    { id: 'red', name: 'faction.red' },
    { id: 'blue', name: 'faction.blue' },
  ],
  scenarios: ['start'],
};

const provenance = {
  formatVersion: 2,
  sources: [
    { key: 'DESIGN', title: 'Fixture design', kind: 'own-work', licence: 'own-work', basis: null, copyUsed: 'this test', licencePage: null, licenceReadOn: null },
    { key: 'REG A', title: 'An old register', kind: 'primary', licence: 'public-domain', basis: 'expired-copyright', copyUsed: 'archive id reg-a', licencePage: null, licenceReadOn: null },
    { key: 'NOTE-x', title: 'Our research note', kind: 'pointer', licence: 'own-work', basis: null, copyUsed: 'docs/research', licencePage: null, licenceReadOn: null },
  ],
};

const strings: Record<string, string> = {
  'pack.name': 'Fixture',
  'rank_kind.regular': 'regular',
  'value.career': 'career',
  'value.caution': 'caution',
  'value.duty': 'duty',
  'value.glory': 'glory',
  'value.order': 'order',
  'value.reputation': 'reputation',
  'terrain.plain': 'plain',
  'terrain.coastal': 'coast',
  'terrain.river': 'river',
  'post_kind.chief': 'chief',
  'post_kind.army': 'army',
  'post_kind.squadron': 'squadron',
  'post_kind.expedition': 'expedition',
  'department_kind.ministry': 'ministry',
  'department_kind.province': 'province',
  'arm.foot': 'foot',
  'arm.ships': 'ships',
  'person_kind.officer': 'officer',
  'trait.bold': 'bold',
  'rank.junior': 'junior',
  'rank.senior': 'senior',
  'bloc.greens': 'Greens',
  'order_kind.hold': 'hold',
  'faction.red': 'Red',
  'faction.blue': 'Blue',
};

export const FIXTURE: Readonly<Record<string, string>> = {
  'pack.json': JSON.stringify(manifest, null, 2),
  'PROVENANCE.json': JSON.stringify(provenance, null, 2),
  'strings/en.json': JSON.stringify(strings, null, 2),
  'source/world/departments.csv': ['id,name,faction,kind,sources,notes', 'r_war,Red Ministry,red,ministry,DESIGN,', 'r_sea,Red Admiralty,red,ministry,DESIGN,', 'b_war,Blue Ministry,blue,ministry,DESIGN,', 'r_prov,Red Province,red,province,DESIGN,'].join('\n'),
  'source/world/regions.csv': [
    'id,name,kind,terrain,flags,off_map_role,weather_zone,ref_point,counties,label_anchor,label_spine,label_size,label_min_zoom,sources,notes',
    'alpha,Alpha,land,plain,capital;port,,,10.5 50.25,,,,,,DESIGN,',
    'beta,Beta,land,plain,,,,,,,,,,DESIGN,',
    'port,Port,key_point,plain,port,,,,,,,,,DESIGN,',
    'bay,The Bay,sea,coastal,,,,,,,,,,DESIGN,',
    'stream,The Stream,river,river,,,,,,,,,,DESIGN,',
    'abroad,Abroad,off_map,,,foreign_power,,,,,,,,DESIGN,',
  ].join('\n'),
  'source/world/edges.csv': [
    'id,from,to,type,line,length_days,length_days_back,capacity,break_of_bulk,depth_feet,seasonal,sources,notes',
    ',alpha,beta,road,,2,,3,,,mud,DESIGN,',
    ',beta,port,road,,1,,3,,,mud,DESIGN,',
    ',alpha,port,rail,main_line,1,,2,,,,DESIGN,',
    ',port,bay,sea,,1,,4,,12,,DESIGN,',
    ',bay,abroad,sea,,9,,5,,,,DESIGN,',
    ',beta,stream,river,,1,2,3,,6,low_water,DESIGN,',
  ].join('\n'),
  'source/world/installations.csv': [
    'id,name,region,kind,fort_water,commands_edges,sources,notes',
    'port_fort,Port Fort,port,fort,reduction,sea:bay:port,DESIGN,',
    'port_base,Port Base,port,naval_base,,,DESIGN,',
  ].join('\n'),
  'source/world/rail_lines.csv': ['id,name,sources,notes', 'main_line,Main Line,DESIGN,'].join('\n'),
  'source/world/depots.csv': ['id,name,region,kind,capacity,sources,notes', 'alpha_stores,Alpha stores,alpha,source,4,DESIGN,'].join('\n'),
  'source/world/people.csv': [
    'id,name,invented,faction,kind,born,died,competence,nerve,experience,reputation,traits,bloc,ranks,sources,notes',
    'red_chief,Red Chief,,red,officer,1800,1870,above:REG A p.3,average:REG A,unknown,high:REG A+DESIGN,bold:REG A p.9,greens,junior:1840;senior:1850-05,REG A,',
    'blue_chief,Blue Chief,,blue,officer,1801,1871,average:DESIGN,average:DESIGN,average:DESIGN,average:DESIGN,,,,DESIGN,',
    'red_captain,Red Captain,,red,officer,1810,1880,average:DESIGN,average:DESIGN,average:DESIGN,average:DESIGN,,,,DESIGN,',
  ].join('\n'),
  'source/scenarios/start/scenario.json': JSON.stringify({
    name: 'The start',
    startDate: '1900-05-01',
    seed: 7,
    factions: [
      { faction: 'red', principal: 'red_chief', capital: 'alpha', playable: true },
      { faction: 'blue', principal: 'blue_chief', capital: null, playable: false },
    ],
  }),
  'source/scenarios/start/control.csv': ['region,shares,notes', 'alpha,red:1000,', 'beta,red:600;blue:300,', 'port,blue:1000,'].join('\n'),
  'source/scenarios/start/governments.csv': ['region,department,sources,notes', 'alpha,r_prov,DESIGN,', 'beta,r_prov,DESIGN,', 'port,unknown,DESIGN,No civil government is known for the port.'].join('\n'),
  'source/scenarios/start/posts.csv': [
    'id,name,kind,department,parent,region,temporary_operation,installation,rail_line,sources,notes',
    'red_top,Red Chief,chief,r_war,,alpha,,,,DESIGN,',
    'red_army,Red Army,army,r_war,red_top,beta,,,,DESIGN,',
    'red_fleet,Red Fleet,squadron,r_sea,red_top,alpha,,,,DESIGN,',
    'blue_top,Blue Chief,chief,b_war,,port,,port_fort,,DESIGN,',
  ].join('\n'),
  'source/scenarios/start/holders.csv': ['post,person,acting,from,to,sources,notes', 'red_top,red_chief,no,1890,,DESIGN,', 'blue_top,blue_chief,no,,,DESIGN,'].join('\n'),
  'source/scenarios/start/standing_orders.csv': ['id,post,kind,from,issued_on,summary,sources,notes', 'stay,red_army,hold,red_top,1900-04-01,Hold the line.,DESIGN,'].join('\n'),
  'source/scenarios/start/force_blocks.csv': [
    'id,name,kind,parent,department,post,region,aboard,arm,strength,strength_date,non_combatants,stores_days,stores_date,sources,notes',
    'red_1,Red First,block,,r_war,red_army,beta,,foot,5000,1900-04,,10,1900-04,DESIGN,',
    'red_1_det,Red First guard,detachment,red_1,r_war,red_army,alpha,,foot,200,1900-04,,10,1900-04,DESIGN,',
    'red_ship,Red Ship,block,,r_sea,red_fleet,alpha,,ships,300,1900-04,,30,1900-04,DESIGN,',
    'blue_1,Blue First,block,,b_war,blue_top,port,,foot,unknown,,,12,1900-03,DESIGN,',
  ].join('\n'),
};

export type FileMap = Map<string, string>;

export function fixture(): FileMap {
  return new Map(Object.entries(FIXTURE));
}

export function filesOf(map: ReadonlyMap<string, string>): PackFiles {
  const below = (path: string) => [...map.keys()].filter((k) => k.startsWith(`${path}/`)).map((k) => k.slice(path.length + 1));
  return {
    read: (path) => map.get(path),
    folders: (path) => [...new Set(below(path).filter((rest) => rest.includes('/')).map((rest) => rest.split('/')[0]!))],
    files: (path) => below(path).filter((rest) => !rest.includes('/')),
  };
}

/** A copy of the fixture with one file changed. */
export function withFile(path: string, change: (text: string) => string, base: FileMap = fixture()): FileMap {
  const next = new Map(base);
  const text = next.get(path);
  if (text === undefined) throw new Error(`fixture has no ${path}`);
  next.set(path, change(text));
  return next;
}

/** A copy of the fixture without one file. */
export function withoutFile(path: string, base: FileMap = fixture()): FileMap {
  const next = new Map(base);
  if (!next.delete(path)) throw new Error(`fixture has no ${path}`);
  return next;
}

/** A copy of the fixture with a file it does not have yet. */
export function withNewFile(path: string, text: string, base: FileMap = fixture()): FileMap {
  if (base.has(path)) throw new Error(`fixture already has ${path}`);
  return new Map([...base, [path, text]]);
}

/** Replace exactly one occurrence, so a test fails loudly if the fixture changes under it. */
export function replaceOnce(from: string, to: string): (text: string) => string {
  return (text) => {
    const at = text.indexOf(from);
    if (at === -1 || text.indexOf(from, at + 1) !== -1) throw new Error(`"${from}" must occur exactly once in the fixture file`);
    return text.slice(0, at) + to + text.slice(at + from.length);
  };
}

export function appendRow(row: string): (text: string) => string {
  return (text) => `${text.replace(/\n?$/, '')}\n${row}`;
}
