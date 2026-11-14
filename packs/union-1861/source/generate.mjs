// Generates packs/union-1861/scenario.json (run: node packs/union-1861/source/generate.mjs packs/union-1861/scenario.json).
// Source of every person, post, bloc and region: docs/research/2026-11-14-union-1861-62.md. Trait numbers are interpretation.
import { writeFileSync } from 'node:fs';

const out = process.argv[2];
const US = 'union', CS = 'confederacy';

// [id, name, controller, garrison (thousands)]
const regions = [
  ['washington', 'Washington (fortified)', US, 40],
  ['maryland', 'Maryland', US, 4],
  ['northern_virginia', 'Northern Virginia', CS, 3],
  ['lower_shenandoah', 'Lower Shenandoah', CS, 3],
  ['western_maryland', 'Western Maryland', US, 2],
  ['south_pennsylvania', 'South Pennsylvania', US, 4],
  ['rappahannock', 'Fredericksburg and the Rappahannock', CS, 3],
  ['upper_shenandoah', 'Upper Shenandoah and Piedmont', CS, 3],
  ['eastern_shore', 'Eastern Shore', US, 2],
  ['richmond', 'Richmond (fortified)', CS, 30],
  ['western_virginia', 'Western Virginia', US, 3],
  ['ohio', 'Ohio', US, 5],
  ['peninsula', 'The Peninsula and Fort Monroe', US, 3],
  ['southside_virginia', 'Southside Virginia', CS, 3],
  ['southwest_virginia', 'Southwest Virginia', CS, 3],
  ['nc_coast', 'North Carolina coast', CS, 3],
  ['eastern_kentucky', 'Eastern Kentucky', US, 2],
  ['east_tennessee', 'East Tennessee', CS, 3],
  ['central_kentucky', 'Central Kentucky', US, 3],
  ['southern_indiana_illinois', 'Southern Indiana and Illinois', US, 4],
  ['western_kentucky', 'Western Kentucky', US, 2],
  ['cairo', 'Cairo', US, 3],
  ['middle_tennessee', 'Middle Tennessee', CS, 4],
  ['west_tennessee', 'West Tennessee', CS, 4],
  ['st_louis', 'St Louis', US, 4],
  ['southeast_missouri', 'Southeast Missouri', CS, 3],
  ['north_alabama', 'North Alabama and Chattanooga', CS, 3],
  ['north_mississippi', 'North Mississippi', CS, 3],
  ['atlantic_coast', 'Atlantic coast', CS, 4],
  ['central_missouri', 'Central Missouri', US, 2],
  ['southwest_missouri', 'Southwest Missouri', CS, 3],
  ['arkansas', 'Arkansas', CS, 3],
  ['mississippi_corridor', 'Mississippi corridor', CS, 4],
  ['deep_south', 'Deep South interior', CS, 6],
  ['kansas', 'Kansas', US, 2],
  ['new_orleans', 'New Orleans and the Gulf', CS, 6],
  ['northern_states', 'The Northern states', US, 10],
];

// Undirected edges (land, rivers, and the Chesapeake/blockade sea lanes).
const edges = `
washington-maryland washington-northern_virginia washington-western_maryland washington-peninsula
maryland-northern_virginia maryland-lower_shenandoah maryland-south_pennsylvania maryland-eastern_shore
northern_virginia-lower_shenandoah northern_virginia-rappahannock northern_virginia-upper_shenandoah
lower_shenandoah-western_maryland lower_shenandoah-south_pennsylvania lower_shenandoah-upper_shenandoah lower_shenandoah-western_virginia
western_maryland-south_pennsylvania south_pennsylvania-ohio south_pennsylvania-northern_states
rappahannock-upper_shenandoah rappahannock-richmond
upper_shenandoah-richmond upper_shenandoah-western_virginia
eastern_shore-peninsula
richmond-peninsula richmond-southside_virginia richmond-southwest_virginia
western_virginia-ohio western_virginia-eastern_kentucky western_virginia-east_tennessee
ohio-eastern_kentucky ohio-central_kentucky ohio-southern_indiana_illinois ohio-northern_states
peninsula-southside_virginia peninsula-nc_coast
southside_virginia-southwest_virginia southside_virginia-nc_coast
southwest_virginia-east_tennessee
nc_coast-atlantic_coast
eastern_kentucky-east_tennessee eastern_kentucky-central_kentucky eastern_kentucky-middle_tennessee
east_tennessee-middle_tennessee east_tennessee-north_alabama
central_kentucky-southern_indiana_illinois central_kentucky-western_kentucky central_kentucky-middle_tennessee
southern_indiana_illinois-western_kentucky southern_indiana_illinois-cairo southern_indiana_illinois-northern_states
western_kentucky-cairo western_kentucky-middle_tennessee western_kentucky-west_tennessee
cairo-st_louis cairo-southeast_missouri
middle_tennessee-west_tennessee middle_tennessee-north_alabama
west_tennessee-southeast_missouri west_tennessee-north_alabama west_tennessee-north_mississippi
st_louis-southeast_missouri st_louis-central_missouri st_louis-southwest_missouri
southeast_missouri-southwest_missouri southeast_missouri-arkansas
north_alabama-north_mississippi north_alabama-deep_south
north_mississippi-mississippi_corridor north_mississippi-deep_south
atlantic_coast-deep_south atlantic_coast-new_orleans
central_missouri-southwest_missouri central_missouri-kansas
southwest_missouri-arkansas southwest_missouri-kansas
arkansas-mississippi_corridor arkansas-kansas
mississippi_corridor-deep_south mississippi_corridor-new_orleans
deep_south-new_orleans
`.trim().split(/\s+/).map((e) => e.split('-'));

const neighbours = Object.fromEntries(regions.map(([id]) => [id, new Set()]));
for (const [a, b] of edges) {
  if (!neighbours[a] || !neighbours[b]) throw new Error(`bad edge ${a}-${b}`);
  neighbours[a].add(b);
  neighbours[b].add(a);
}

// [id, name, faction, values, boldness, candour, competence, standing, regard]
const persons = [
  ['lincoln', 'Abraham Lincoln', US, ['union', 'party'], 650, 750, 750, 550, 1000],
  ['scott', 'Winfield Scott', US, ['duty', 'order'], 250, 750, 600, 600, 400],
  ['mcclellan', 'George B. McClellan', US, ['conciliation', 'reputation'], 150, 200, 650, 800, -400],
  ['halleck', 'Henry W. Halleck', US, ['career', 'caution'], 200, 400, 550, 550, 150],
  ['fremont', 'John C. Frémont', US, ['abolition', 'glory'], 650, 300, 300, 800, -200],
  ['butler', 'Benjamin F. Butler', US, ['career', 'union'], 600, 400, 350, 750, 200],
  ['banks', 'Nathaniel P. Banks', US, ['career', 'party'], 450, 500, 250, 700, 500],
  ['mcdowell', 'Irvin McDowell', US, ['duty', 'order'], 450, 650, 400, 250, 600],
  ['pope', 'John Pope', US, ['career', 'glory'], 750, 350, 400, 400, 600],
  ['burnside', 'Ambrose E. Burnside', US, ['duty', 'order'], 550, 850, 300, 500, 600],
  ['grant', 'Ulysses S. Grant', US, ['duty', 'union'], 800, 750, 800, 250, 500],
  ['buell', 'Don Carlos Buell', US, ['caution', 'conciliation'], 150, 450, 550, 300, 0],
  ['stanton', 'Edwin M. Stanton', US, ['order', 'union'], 700, 450, 800, 550, 300],
  ['cameron', 'Simon Cameron', US, ['career', 'party'], 450, 250, 200, 650, 300],
  ['seward', 'William H. Seward', US, ['party', 'union'], 400, 600, 750, 750, 500],
  ['chase', 'Salmon P. Chase', US, ['abolition', 'career'], 600, 250, 750, 700, 0],
  ['curtin', 'Andrew G. Curtin', US, ['party', 'union'], 500, 700, 700, 650, 600],
  ['andrew', 'John A. Andrew', US, ['abolition', 'union'], 700, 700, 700, 650, 300],
  ['morton', 'Oliver P. Morton', US, ['party', 'union'], 750, 450, 750, 650, 500],

  ['davis', 'Jefferson Davis', CS, ['order', 'reputation'], 550, 500, 600, 600, 1000],
  ['j_johnston', 'Joseph E. Johnston', CS, ['caution', 'reputation'], 300, 350, 650, 700, -400],
  ['beauregard', 'P. G. T. Beauregard', CS, ['glory', 'reputation'], 650, 350, 550, 750, -300],
  ['lee', 'Robert E. Lee', CS, ['duty', 'glory'], 850, 750, 850, 500, 700],
  ['jackson', 'Thomas J. Jackson', CS, ['duty', 'glory'], 850, 700, 800, 500, 300],
  ['as_johnston', 'Albert Sidney Johnston', CS, ['duty', 'reputation'], 600, 600, 550, 850, 800],
  ['bragg', 'Braxton Bragg', CS, ['duty', 'order'], 600, 400, 450, 400, 700],
  ['longstreet', 'James Longstreet', CS, ['career', 'reputation'], 450, 700, 750, 500, 400],
];

// [id, name, faction, kind, region, holder, force (thousands), linkDays, recruitPerWeek]
const posts = [
  ['us_general_in_chief', 'General-in-Chief', US, 'office', 'washington', 'scott', 0, 0, 0],
  ['us_army_potomac', 'Army of the Potomac', US, 'field', 'washington', 'mcclellan', 50, 0, 0],
  ['us_dept_shenandoah', 'Department of the Shenandoah', US, 'field', 'western_maryland', 'banks', 15, 0, 0],
  ['us_fort_monroe', 'Department of Virginia (Fort Monroe)', US, 'field', 'peninsula', 'butler', 10, 1, 0],
  ['us_western_dept', 'Western Department', US, 'field', 'st_louis', 'fremont', 25, 1, 0],
  ['us_army_ohio', 'Department of the Ohio', US, 'field', 'central_kentucky', 'buell', 15, 1, 0],
  ['us_district_cairo', 'District of Cairo', US, 'field', 'cairo', 'grant', 10, 1, 0],
  ['us_war_department', 'War Department', US, 'office', 'washington', 'cameron', 20, 0, 2],
  ['us_treasury', 'Treasury', US, 'office', 'washington', 'chase', 0, 0, 0],
  ['us_state_department', 'State Department', US, 'office', 'washington', 'seward', 0, 0, 0],
  ['us_gov_pennsylvania', 'Governor of Pennsylvania', US, 'office', 'south_pennsylvania', 'curtin', 5, 0, 3],
  ['us_gov_indiana', 'Governor of Indiana', US, 'office', 'southern_indiana_illinois', 'morton', 5, 1, 2],
  ['us_gov_massachusetts', 'Governor of Massachusetts', US, 'office', 'northern_states', 'andrew', 5, 1, 2],

  ['cs_army_potomac', 'Army of the Potomac (Confederate)', CS, 'field', 'northern_virginia', 'j_johnston', 30, 0, 0],
  ['cs_first_corps', 'First Corps at Manassas', CS, 'field', 'northern_virginia', 'beauregard', 20, 0, 0],
  ['cs_valley_district', 'Valley District', CS, 'field', 'lower_shenandoah', 'jackson', 8, 1, 0],
  ['cs_department_2', 'Western Department (No. 2)', CS, 'field', 'middle_tennessee', 'as_johnston', 30, 1, 0],
  ['cs_gulf', 'Department of the Gulf coast', CS, 'field', 'new_orleans', 'bragg', 12, 2, 0],
  ['cs_war_department', 'Confederate War Department', CS, 'office', 'richmond', 'lee', 15, 0, 4],
];

// [id, name, faction, weight, values, support]
const blocs = [
  ['us_radicals', 'Radical Republicans', US, 150, ['abolition', 'glory'], 200],
  ['us_moderates', 'Moderate Republicans', US, 250, ['party', 'union'], 500],
  ['us_war_democrats', 'War Democrats', US, 200, ['conciliation', 'union'], 400],
  ['us_peace_democrats', 'Peace Democrats', US, 100, ['caution', 'conciliation'], -500],
  ['us_border_unionists', 'Border-state Unionists', US, 150, ['conciliation', 'union'], 200],
  ['us_abolitionists', 'Abolitionists', US, 50, ['abolition'], 0],
  ['us_army', 'The army', US, 100, ['duty', 'reputation'], 300],

  ['cs_planters', 'Planter establishment', CS, 400, ['order', 'reputation'], 500],
  ['cs_fire_eaters', 'Fire-eaters', CS, 300, ['duty', 'glory'], 400],
  ['cs_governors', "States' governors", CS, 300, ['career', 'order'], 300],
];

const scenario = {
  id: 'union-1861',
  seed: 1861,
  minTurnDays: 7,
  maxTurnDays: 21,
  endDay: 517,
  objectiveValues: {
    attack: { honours: ['duty', 'glory'], offends: ['caution'], frames: ['reputation', 'union', 'abolition'] },
    hold: { honours: ['caution', 'order'], offends: ['glory'], frames: ['union', 'conciliation'] },
    transfer: { honours: ['duty', 'order'], offends: ['reputation'], frames: ['union', 'party'] },
  },
  factions: [
    { id: US, name: 'The Union', principalId: 'lincoln', capitalRegionId: 'washington', isPlayer: true, attentionPerTurn: 4, baseOversight: 700, oversightLossPerLinkDay: 60 },
    { id: CS, name: 'The Confederacy', principalId: 'davis', capitalRegionId: 'richmond', isPlayer: false, attentionPerTurn: 3, baseOversight: 700, oversightLossPerLinkDay: 60 },
  ],
  persons: persons.map(([id, name, factionId, values, boldness, candour, competence, standing, regard]) =>
    ({ id, name, factionId, values, boldness, candour, competence, standing, regard })),
  posts: posts.map(([id, name, factionId, kind, regionId, holderId, force, linkDays, recruitPerWeek]) =>
    ({ id, name, factionId, kind, regionId, holderId, force, linkDays, recruitPerWeek })),
  regions: regions.map(([id, name, controllerId, garrison]) => ({ id, name, controllerId, neighbours: [...neighbours[id]].sort(), garrison })),
  blocs: blocs.map(([id, name, factionId, weight, values, support]) => ({ id, name, factionId, weight, values, support })),
  checkpoints: [
    { day: 440, factionId: US, kind: 'mandate_test', threshold: 100, label: '1862 midterm elections' },
  ],
};

writeFileSync(out, JSON.stringify(scenario, null, 2) + '\n');
console.log(`wrote ${out}: ${regions.length} regions, ${edges.length} edges, ${persons.length} persons, ${posts.length} posts`);

