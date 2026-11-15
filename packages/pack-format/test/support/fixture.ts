/**
 * A tiny, valid v2 pack held in memory, with setting-free names (decision
 * 0003). Tests break one thing at a time and assert which check fires.
 */
import type { PackFiles } from '../../src/index.ts';

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
      { id: 'junior', name: 'rank.junior', seniority: 1 },
      { id: 'senior', name: 'rank.senior', seniority: 2 },
    ],
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
    'id,name,kind,parent,department,post,region,aboard,arm,strength,strength_date,non_combatants,stores_days,sources,notes',
    'red_1,Red First,block,,r_war,red_army,beta,,foot,5000,1900-04,,10,DESIGN,',
    'red_1_det,Red First guard,detachment,red_1,r_war,red_army,alpha,,foot,200,1900-04,,10,DESIGN,',
    'red_ship,Red Ship,block,,r_sea,red_fleet,alpha,,ships,300,1900-04,,30,DESIGN,',
    'blue_1,Blue First,block,,b_war,blue_top,port,,foot,unknown,,,12,DESIGN,',
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
