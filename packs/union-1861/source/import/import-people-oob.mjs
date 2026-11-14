// ONE-TIME CONVERSION RECORD. DO NOT RE-RUN OVER THE PACK (see the header of import-drafts.mjs:
// the pack's source CSVs are the source of truth from the merge on, and this file's output would overwrite hand edits).
//
// Stage 2 of the Union 1861 import: departments, posts, tenures, people, force
// blocks, control, standing agreements, the scenario header and the pack's
// manifest, sources and strings. Stage 1 (import-drafts.mjs) did the map.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  START, SCENARIO, cites, say, rows, write, writeJson, regions, regionById, convertSources, stats, cmp, drafts, repo, V, makeResolver, pointerKey, readCsv,
} from './import-drafts.mjs';
import { citeText } from './registry.mjs';

const resolve = makeResolver(regions.map((r) => ({ id: r.id, counties: r.counties, flags: r.flags })));
const scen = (t) => `source/scenarios/${SCENARIO}/${t}.csv`;
// The cabinet's confirmation on 5 March rests on research notes in the draft; the note itself (march-1861-facts question 10) cites the
// New York Times of 6 March 1861, a primary source, so the record cites it too (lead ruling S3, 0050: pointers are never enough alone).
const confirmedCites = (cell) => (/march-1861-facts\.md q\.10/.test(cell) ? ['NYT-1861-03-06 Washington dispatch of 5 March, cabinet nominations confirmed'] : []);

// ---- posts ---------------------------------------------------------------------
const postRows = rows('oob/posts.csv');
// The installation each post commands (a post of any department may command one).
const POST_INSTALLATION = {
  us_fort_jefferson: 'fort_jefferson', us_fort_monroe: 'fort_monroe', us_fort_pickens: 'fort_pickens', us_fort_sumter: 'fort_sumter',
  us_fort_taylor: 'fort_taylor', us_harpers_ferry_armory: 'harpers_ferry_armory', us_st_louis_arsenal: 'st_louis_arsenal',
  us_navy_yard_boston: 'charlestown_navy_yard', us_navy_yard_mare_island: 'mare_island_navy_yard', us_navy_yard_new_york: 'brooklyn_navy_yard',
  us_navy_yard_norfolk: 'gosport_navy_yard', us_navy_yard_pensacola: 'pensacola_navy_yard', us_navy_yard_philadelphia: 'philadelphia_navy_yard',
  us_navy_yard_portsmouth: 'portsmouth_navy_yard', us_navy_yard_sacketts_harbor: 'sackets_harbor_navy_yard', us_navy_yard_washington: 'washington_navy_yard',
  cs_arsenal_baton_rouge: 'baton_rouge_arsenal', cs_arsenal_mount_vernon: 'mount_vernon_arsenal', cs_fort_morgan: 'forts_morgan_gaines',
  cs_navy_yard_pensacola: 'pensacola_navy_yard', st_la_forts_jackson_st_philip: 'forts_jackson_st_philip',
};
const posts = [];
const excludedPosts = [];
for (const r of postRows) {
  const id = r.get('id');
  const est = r.get('established'), abo = r.get('abolished');
  const atStart = (est === '' || est <= START) && (abo === '' || abo > START);
  if (!atStart) { excludedPosts.push(`${id} (${est ? `established ${est}` : ''}${abo ? `abolished ${abo}` : ''})`); continue; }
  const side = r.get('side');
  const text = r.get('department');
  const dept = side === 'state' ? V.stateId(text) : V.executiveDepartment(side, text);
  if (!dept) say(`UNMAPPED DEPARTMENT: ${id} ${side} "${text}"`);
  const loc = r.get('location');
  posts.push({
    id, name: r.get('name'), kind: r.get('kind'), side, dept, parent: r.get('parent_post'), loc, region: resolve(loc) ?? '',
    sources: convertSources(r.get('sources'), 'OOB-LANE', confirmedCites(r.get('sources'))), notes: r.get('notes'), est,
  });
}
const postById = new Map(posts.map((p) => [p.id, p]));
for (const p of posts) {
  if (p.parent && !postById.has(p.parent)) { p.notes += ` [parent ${p.parent} is not part of the 5 March start]`; p.parent = ''; }
  if (!p.region && !/utah|lost/i.test(p.loc) && !['us_navy_african_squadron'].includes(p.id)) say(`POST WITHOUT REGION: ${p.id}: ${p.loc.slice(0, 70)}`);
}
say(`posts at the start: ${posts.length} of ${postRows.length}; left out: ${excludedPosts.join('; ')}`);

// ---- departments ---------------------------------------------------------------
const deptUsed = new Set(posts.map((p) => p.dept));
const departments = [];
for (const [id, kind, name] of [...V.EXEC_DEPARTMENTS.union, ...V.EXEC_DEPARTMENTS.confederate]) {
  if (deptUsed.has(id)) departments.push({ id, name, faction: id.startsWith('us_') ? 'union' : 'confederate', kind });
}
const stateNames = [...new Set(postRows.filter((r) => r.get('side') === 'state').map((r) => r.get('department')))].sort();
for (const s of stateNames) departments.push({ id: V.stateId(s), name: `${s} state government`, faction: V.stateFaction(s) ?? '', kind: 'state_government' });
const deptFaction = new Map(departments.map((d) => [d.id, d.faction]));
for (const id of deptUsed) if (!deptFaction.has(id)) say(`DEPARTMENT NOT DEFINED: ${id}`);
write('source/world/departments.csv', ['id', 'name', 'faction', 'kind', 'sources', 'notes'],
  departments.map((d) => [d.id, d.name, d.faction, d.kind, 'OOB-LANE department structure of the oob draft', d.kind === 'state_government' && d.faction === '' ? 'uncommitted on 5 March 1861: no faction (modelling rule, lane 0.3 note)' : '']));

// ---- tenures -------------------------------------------------------------------
const ALIAS = { beauregard_peter_g_t: 'beauregard_pierre_g_t', toombs_robert: 'toombs_robert_a', morton_oliver_p: 'morton_oliver_h_p_t' };
const tenureRows = rows('oob/people_in_posts.csv');
const tenuresByPost = new Map();
for (const r of tenureRows) {
  const from = r.get('from'), to = r.get('to'), notes = r.get('notes');
  const flagFrom = /\[from: needs-source/.test(notes), flagTo = /\[to: needs-source/.test(notes);
  const person = ALIAS[r.get('person_id')] ?? r.get('person_id');
  let cover = 'yes';
  if (from !== '' && from > START) cover = 'no';
  else if (to !== '' && to <= START) cover = 'no';
  else if ((from === '' && flagFrom) || (to === '' && flagTo)) cover = 'maybe';
  const t = { person, name: r.get('person_name'), post: r.get('post_id'), from, to, acting: r.get('acting') === 'yes', notes, sources: r.get('sources'), cover, line: r.line };
  tenuresByPost.set(t.post, [...(tenuresByPost.get(t.post) ?? []), t]);
}
const HOLDER_RULING = {
  us_fort_pickens: { person: 'slemmer_adam_j', why: "Slemmer commanded the garrison from 10 January; Vogdes was senior on the station from 6 February but stayed afloat in Brooklyn (the draft's own rows); Vogdes's company is aboard Brooklyn" },
  // Lead ruling (round 3): the oob draft's own rows order the two tenures, though neither carries a date cell: Twiggs "relinquished command 19 Feb 1861 ... not a holder in the window" and Waite "assumed command 19 Feb 1861 (General Orders No. 7, Department of Texas)" (OR I-1 pp.502-503, 521, 591).
  us_dept_texas: { person: 'waite_carlos_a', why: "the oob draft's own rows: Twiggs relinquished command on 19 February 1861 (before the window; OR I-1 p.591) and Waite assumed it that day under General Orders No. 7, so Waite held the department on 5 March" },
};
/** Men who hold no post at the start but whose record is kept (they command forces afloat or are named by a ruling). */
const ALSO_RECORD = ['vogdes_israel'];
const holders = []; // { post, person | 'unknown', acting, from, to, sources, notes }
const holderOf = new Map();
const unresolved = [];
for (const p of posts) {
  const ts = tenuresByPost.get(p.id) ?? [];
  const yes = ts.filter((t) => t.cover === 'yes');
  const maybe = ts.filter((t) => t.cover === 'maybe');
  let win;
  let why = '';
  const ruled = HOLDER_RULING[p.id] && yes.find((t) => t.person === HOLDER_RULING[p.id].person);
  if (ruled) {
    // Lead ruling S2 (0055 review): the man who commanded the garrison holds the fort; the senior officer who stayed afloat does not.
    win = ruled;
    win.notes = `${win.notes} [chosen over ${yes.filter((t) => t !== ruled).map((t) => t.person).join(', ')}: ${HOLDER_RULING[p.id].why}]`;
  } else if (yes.length === 1) win = yes[0];
  else if (yes.length > 1) {
    const dated = yes.filter((t) => t.from !== '').sort((a, b) => cmp(b.from, a.from));
    if (dated.length >= 1 && (dated.length === 1 || dated[0].from !== dated[1].from)) win = dated[0];
    else why = `${yes.length} tenures cover the start with no way to order them: ${yes.map((t) => `${t.person}${t.acting ? ' (acting)' : ''}`).join(', ')}`;
  } else if (maybe.length > 0) why = `no tenure is certain to cover the start (a start or end is needs-source): ${maybe.map((t) => t.person).join(', ')}`;
  else why = ts.length > 0 ? 'its tenures all fall outside the start' : 'the draft gives no holder';
  if (win) {
    holders.push({ post: p.id, person: win.person, acting: win.acting, from: win.from, to: win.to, sources: convertSources(win.sources, 'OOB-LANE', confirmedCites(win.sources)), notes: win.notes });
    holderOf.set(p.id, win.person);
  } else {
    holders.push({ post: p.id, person: 'unknown', acting: false, from: '', to: '', sources: '', notes: why });
    unresolved.push(`${p.id}: ${why}`);
  }
}
say(`posts with a certain holder: ${holders.filter((h) => h.person !== 'unknown').length}; holder unknown: ${unresolved.length}`);
for (const u of unresolved.filter((x) => /cover the start with no way|certain to cover/.test(x))) say(`  ${u}`);
say(`  (and ${unresolved.filter((x) => /gives no holder|fall outside/.test(x)).length} posts with no holder row or only tenures outside the start)`);
write(scen('holders'), ['post', 'person', 'acting', 'from', 'to', 'sources', 'notes'],
  holders.map((h) => [h.post, h.person, h.acting ? 'yes' : 'no', h.from, h.to, h.sources, h.notes]));

// ---- people --------------------------------------------------------------------
const rosterRows = rows('people/people.csv');
const rosterIds = new Set(rosterRows.map((r) => r.get('id')));
// Part 3 of the people evidence file: the cited evidence behind each stat direction.
const md = readFileSync(join(drafts, 'people', 'people-sources.md'), 'utf8');
const part3 = md.slice(md.indexOf('## Part 3.'));
const evidence = new Map();
let cur = null;
for (const line of part3.split(/\r?\n/)) {
  const h = /^#### ([a-z0-9_]+):/.exec(line);
  if (h) { cur = h[1]; evidence.set(cur, {}); continue; }
  if (/^###? /.test(line)) { cur = null; continue; }
  const b = /^- (competence|nerve|experience|reputation_1861) (high|above|average|below|low|unknown)\b/.exec(line);
  if (b && cur) evidence.get(cur)[b[1]] = { dir: b[2], text: line };
}
const TOKEN = /\b([A-Z][A-Z0-9]*(?:-[A-Za-z0-9_.]+)+)\b/g;
const personStats = { dropped: [], directions: 0, noEvidenceSection: [] };
const traitIds = new Set(V.TRAITS.map((t) => t.id));
const usedRanks = new Map();
let rankDropped = 0, rankStatus = 0;
const postKindOf = new Map(posts.map((p) => [p.id, p.kind]));

function centreCell(id, stat, dir) {
  if (dir === 'unknown' || dir === '') return 'unknown';
  const ev = evidence.get(id)?.[stat === 'reputation' ? 'reputation_1861' : stat];
  if (!ev) { personStats.noEvidenceSection.push(`${id}.${stat}`); personStats.dropped.push(`${id}.${stat}`); return 'unknown'; }
  if (ev.dir !== dir) say(`direction differs between people.csv and Part 3: ${id}.${stat}: ${dir} / ${ev.dir}`);
  const keys = [];
  for (const m of ev.text.matchAll(TOKEN)) {
    const c = cites.canon(m[1]);
    if (c.key && !pointerKey(c.key)) { const tx = citeText(c).replace(/[;+]/g, ','); if (!keys.includes(tx)) keys.push(tx); }
  }
  if (keys.length === 0) { personStats.dropped.push(`${id}.${stat}`); return 'unknown'; }
  personStats.directions++;
  return `${dir}:${keys.join('+')}`;
}
function traitsCell(id, raw) {
  const out = [];
  for (const item of raw.split(';').map((s) => s.trim()).filter(Boolean)) {
    const i = item.indexOf(':');
    const tag = (i < 0 ? item : item.slice(0, i)).trim();
    const keys = [];
    for (const k of (i < 0 ? '' : item.slice(i + 1)).split('+').map((s) => s.trim()).filter(Boolean)) {
      const c = cites.canon(k);
      if (c.key && !pointerKey(c.key)) { const tx = citeText(c).replace(/[;+]/g, ','); if (!keys.includes(tx)) keys.push(tx); }
    }
    if (!traitIds.has(tag)) { say(`UNKNOWN TRAIT ${tag} on ${id}`); continue; }
    if (keys.length === 0) { personStats.dropped.push(`${id}.trait:${tag}`); continue; }
    out.push(`${tag}:${keys.join('+')}`);
  }
  return out.join(';');
}
function ranksCell(id, raw) {
  const out = [];
  for (const item of raw.split(';').map((s) => s.trim()).filter(Boolean)) {
    const parts = item.split(',').map((s) => s.trim());
    const date = parts.pop();
    const rankText = parts.join(', ');
    if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date ?? '')) { rankDropped++; continue; }
    const pr = V.parseRank(rankText);
    if (!pr) { rankStatus++; continue; }
    usedRanks.set(pr.id, pr);
    out.push(`${pr.id}:${date}`);
  }
  return out.sort((a, b) => cmp(a.split(':')[1], b.split(':')[1])).join(';');
}
const sideFaction = { union: 'union', confederate: 'confederate', foreign: '', border: '' };
const startFaction = (personId) => {
  const mine = holders.filter((h) => h.person === personId).map((h) => deptFaction.get(postById.get(h.post).dept));
  return mine.length > 0 ? (mine[0] ?? '') : undefined;
};
// Starting sides (decision 0055, lead ruling S1): a man's side on 5 March comes from the post he holds then; with no post, from his home
// state's government (a man from one of the eight no-faction states has no side); a man holding a US commission starts on the Union side.
// The 44 Confederate-coded men with no post are decided here, each by what the draft's own rows say; his eventual side stays in his note.
// [side, reason]: 'none' is no faction; 'unknown' is a home state the draft does not name.
const START_SIDE = {
  bragg_braxton: ['confederate', 'a Louisiana sugar planter (Lafourche Parish) with no post on 5 March; Louisiana had seceded'],
  breckinridge_john_c: ['none', 'a Kentucky man, Senator from 4 March (a federal seat, not a post in this pack); the Kentucky government has no faction'],
  buckner_simon_b: ['none', 'Inspector-General of Kentucky (a state office) 1860-61'],
  bulloch_james_d: ['unknown', 'a merchant-service captain and civilian on 5 March; the draft names no home state'],
  cobb_howell: ['confederate', 'a Georgia man; President of the Confederate Provisional Congress from 4 February 1861'],
  crittenden_george_b: ['union', 'lieutenant colonel, Mounted Rifles, US Army (Fort Stanton), until 10 June 1861'],
  daniel_john_m: ['none', 'a Richmond man, back from his Buchanan mission; the Virginia government has no faction'],
  ewell_richard_s: ['union', 'captain, 1st Dragoons, US Army (Fort Bliss), until 7 May 1861'],
  floyd_john_b: ['none', 'a private citizen on 5 March, former Governor of Virginia'],
  forrest_nathan_b: ['none', 'a planter near Memphis, Tennessee'],
  gorgas_josiah: ['union', 'captain, US Army (Frankford Arsenal), until 3 April 1861'],
  hardee_william_j: ['unknown', 'resigned from the US Army on 31 January 1861; the draft names no home state'],
  hill_ambrose_p: ['none', 'resigned from the US Army on 1 March 1861; colonel of the 13th Virginia Infantry from May: a Virginia man'],
  hill_daniel_h: ['none', 'Superintendent of the North Carolina Military Institute 1859-61'],
  holmes_theophilus_h: ['union', 'major, 8th Infantry, US Army, until 22 April 1861'],
  hunter_robert_m_t: ['none', 'US Senator for Virginia until 28 March 1861'],
  jackson_thomas_j: ['none', 'professor at the Virginia Military Institute; "held no military rank in Mar 1861" (the draft)'],
  lee_robert_e: ['union', 'colonel, 1st Cavalry, US Army, on leave at Arlington until 25 April 1861 (decision 0055)'],
  longstreet_james: ['union', 'major and paymaster, US Army, until 1 June 1861'],
  loring_william_w: ['union', 'colonel, Mounted Rifles, US Army, commanding the Department of New Mexico, until 13 May 1861'],
  lovell_mansfield: ['union', 'a New York merchant and Deputy Street Commissioner of New York City 1858-61; the New York government is Union'],
  magruder_john_b: ['union', 'captain, 1st Artillery, US Army, at Washington, until 20 April 1861'],
  mason_james_m: ['none', 'US Senator for Virginia until 28 March 1861'],
  mcculloch_ben: ['confederate', 'a Texas frontiersman (the draft: "Texas 1861"); Texas had seceded'],
  morgan_john_h: ['none', 'a Lexington, Kentucky hemp manufacturer'],
  northrop_lucius_b: ['confederate', 'a Charleston physician (South Carolina) from 1853; resigned from the US Army on 8 January 1861'],
  pemberton_john_c: ['union', 'captain, 4th Artillery, US Army, at the Washington Arsenal, until 29 April 1861'],
  pike_albert: ['none', 'an Arkansas lawyer and editor'],
  pillow_gideon_j: ['none', 'a Tennessee lawyer and planter'],
  polk_leonidas: ['confederate', 'Episcopal Bishop of Louisiana 1841-61; Louisiana had seceded'],
  price_sterling: ['none', 'President of the Missouri State Convention on 4 March 1861'],
  randolph_george_w: ['none', 'a Richmond lawyer'],
  reagan_john_h: ['confederate', 'a Texas man; US Representative until 3 March 1861, Confederate Postmaster General from 6 March'],
  seddon_james_a: ['none', 'a Richmond lawyer'],
  semmes_raphael: ['confederate', 'resigned from the US Navy on 15 February 1861 and became a Confederate purchasing agent that day'],
  slidell_john: ['confederate', 'a New Orleans lawyer and Senator for Louisiana; Louisiana had seceded'],
  smith_edmund_k: ['union', 'major, 2nd Cavalry, US Army, until 6 April 1861'],
  stuart_james_e_b: ['union', 'first lieutenant, 1st Cavalry, US Army (Fort Wise), until 14 May 1861 (decision 0055)'],
  tattnall_josiah: ['confederate', 'senior flag officer of the Georgia navy from 28 February 1861; resigned from the US Navy on 20-21 February'],
  twiggs_david_e: ['confederate', 'dismissed from the US Army on 1 March 1861; "a Georgia officer" (the draft)'],
  van_dorn_earl: ['unknown', 'resigned from the US Army on 31 January 1861; his Texas command is dated 1861-03 only and the draft names no home state'],
  vance_zebulon_b: ['none', 'a Buncombe County man, later of North Carolina posts; US Representative until March 1861'],
  wigfall_louis_t: ['confederate', 'a Texas man; US Senator for Texas until 28 March 1861, delegate to the Provisional Congress from 16 March'],
  yancey_william_l: ['confederate', 'an Alabama lawyer and editor who reported the Alabama ordinance of secession'],
};
// The Union-coded men with no post on 5 March, audited the same way (lead ruling, round 3): a man from one of the eight no-faction states has
// no side unless his 5 March post gives him one. Home state or employer is read from the draft's own `prewar` and `posts_1861_62` cells; a US
// commission on 5 March is the Union; where the draft names no residence at all the side is `unknown`, not guessed.
// [inferred] marks a home state taken from a state office he held later because the draft's prewar cell is needs-source.
const START_SIDE_UNION_CODED = {
  adams_charles_f: ['union', 'a Boston lawyer; US Representative for Massachusetts from 4 March 1861'],
  banks_nathaniel_p: ['union', 'Governor of Massachusetts to January 1861, then vice-president of the Illinois Central Railroad (Chicago)'],
  bennett_james_g: ['union', 'proprietor and editor of the New York Herald'],
  blair_francis_p: ['none', 'a St Louis lawyer, US Representative for Missouri from 4 March 1861; Missouri is a no-faction state'],
  buell_don_c: ['union', 'US Army assistant adjutant general on special service in the War Department until 20 March 1861'],
  burnside_ambrose_e: ['unknown', 'a civilian since 1853; the draft names no residence for 5 March (his first post is the 1st Rhode Island, from 2 May)'],
  butler_benjamin_f: ['union', 'a Lowell (Massachusetts) lawyer and Democratic politician'],
  chandler_zachariah: ['union', 'US Senator for Michigan'],
  clay_cassius_m: ['none', 'a Kentucky man (legislator, editor of the True American); Minister to Russia only from 28 March; Kentucky is a no-faction state'],
  covode_john: ['union', 'US Representative for Pennsylvania'],
  crittenden_john_j: ['none', 'a Kentucky lawyer and Senator; US Representative for Kentucky from 4 March 1861'],
  curtis_samuel_r: ['union', 'US Representative for Iowa'],
  dahlgren_john_a_b: ['union', 'US Navy commander on ordnance duty at the Washington Navy Yard'],
  dana_charles_a: ['union', 'managing editor of the New York Tribune'],
  davis_charles_h: ['union', 'US Navy commander, Superintendent of the Nautical Almanac Office (inferred in the draft)'],
  dayton_william_l: ['union', 'Attorney General of New Jersey from 4 March 1861'],
  dix_john_a: ['union', 'a New York man (assistant treasurer and postmaster of New York); his Treasury office ended on 4 March 1861'],
  eckert_thomas_t: ['union', 'an Ohio man [inferred: the draft prewar cell reads "Ohio; prewar career not found"]'],
  farragut_david_g: ['union', 'US Navy captain awaiting orders at Norfolk; he kept his commission and left Norfolk on 18 April (the draft)'],
  fessenden_william_p: ['union', 'US Senator for Maine'],
  foote_andrew_h: ['union', 'US Navy commander stationed at the New York Navy Yard'],
  fox_gustavus_v: ['union', 'a woollen-mill agent at Lawrence, Massachusetts (the draft)'],
  franklin_william_b: ['union', 'captain, Topographical Engineers, US Army'],
  fremont_john_c: ['unknown', 'a private citizen in March 1861; the draft names no residence'],
  gamble_hamilton_r: ['none', 'a Missouri man [inferred: chosen Provisional Governor of Missouri by the State convention on 31 July; the draft prewar cell is needs-source]'],
  gooch_daniel_w: ['union', 'US Representative for Massachusetts'],
  grant_ulysses_s: ['union', 'a leather merchant at Galena, Illinois'],
  greeley_horace: ['union', 'editor of the New York Tribune'],
  halleck_henry_w: ['union', 'a San Francisco lawyer and mine director (California)'],
  hamlin_hannibal: ['union', 'a Maine man; Vice-President of the United States from 4 March 1861'],
  hay_john_m: ['union', 'assistant private secretary to the President, from March 1861; Illinois bar'],
  heintzelman_samuel_p: ['union', 'major, 1st Infantry, US Army, until 14 May 1861'],
  hitchcock_ethan_a: ['unknown', 'retired and a civilian since 1855; the draft names no residence'],
  holt_joseph: ['none', 'a Kentucky lawyer; his Secretary of War tenure ended on 5 March 1861, leaving no post; Kentucky is a no-faction state'],
  hooker_joseph: ['unknown', 'a civilian since 1853; the draft names no residence'],
  hunter_david: ['union', 'US Army paymaster (major) until 14 May 1861'],
  hurlbut_stephen_a: ['union', 'a lawyer and state representative at Belvidere, Illinois (born Charleston; the draft)'],
  johnson_andrew: ['none', 'US Senator for Tennessee; Tennessee is a no-faction state'],
  julian_george_w: ['union', 'US Representative for Indiana'],
  keyes_erasmus_d: ['union', 'lieutenant colonel and military secretary to Scott, US Army'],
  lane_james_h: ['union', 'Senator for Kansas from 4 April 1861 (Kansas a state from 29 January 1861 in the map draft); no sourced residence is named for 5 March [inferred from the Senate seat]'],
  lyon_nathaniel: ['union', 'captain, 2nd Infantry, US Army (his St Louis command begins on 13 March)'],
  marble_manton_m: ['union', 'editor of the New York World'],
  mcclellan_george_b: ['unknown', 'a civilian, president of the St. Louis and Cincinnati Railroad; the draft names no residence (his earlier railroad was the Illinois Central)'],
  mcclernand_john_a: ['union', 'US Representative for Illinois'],
  mcdowell_irvin: ['union', 'assistant adjutant general, Adjutant General\'s Department, US Army'],
  meade_george_g: ['union', 'captain, Topographical Engineers, US Army'],
  meigs_montgomery_c: ['union', 'captain, US Army (engineer)'],
  mitchel_ormsby_m: ['union', 'director of the Dudley Observatory at Albany, New York'],
  nelson_william: ['union', 'lieutenant, US Navy (Kentucky-born; the commission gives the side)'],
  nicolay_john_g: ['union', 'private secretary to the President from 4 March 1861; an Illinois newspaper proprietor'],
  odell_moses_f: ['union', 'US Representative for New York'],
  patterson_robert: ['union', 'a Philadelphia merchant, major general of Pennsylvania militia'],
  pendleton_george_h: ['union', 'US Representative for Ohio'],
  pierpont_francis_h: ['none', 'a Virginia man [inferred: Governor of the Restored Government of Virginia from June 1861; the draft prewar cell is needs-source]; Virginia is a no-faction state'],
  pope_john: ['union', 'captain, Topographical Engineers, US Army'],
  porter_david_d: ['union', 'US Navy lieutenant awaiting orders at Washington'],
  porter_fitz_john: ['union', 'captain and assistant adjutant general, US Army'],
  raymond_henry_j: ['union', 'editor of the New York Times'],
  reynolds_john_f: ['union', 'captain, 3rd Artillery, US Army'],
  ripley_james_w: ['union', 'lieutenant colonel, Ordnance, US Army (colonel from 3 April)'],
  rodgers_john: ['union', 'US Navy commander on special duty at Washington'],
  rosecrans_william_s: ['union', 'a kerosene-oil manufacturer at Cincinnati, Ohio'],
  schofield_john_m: ['union', 'first lieutenant, 1st Artillery, US Army, on leave as a professor in St Louis'],
  schurz_carl: ['union', 'a Wisconsin lawyer and Republican orator (the draft)'],
  scott_thomas_a: ['union', 'vice-president of the Pennsylvania Railroad'],
  seymour_horatio: ['union', 'a New York man (Utica; former Governor)'],
  sherman_william_t: ['none', 'president of the Fifth Street Railroad at St Louis from January 1861, after leaving Louisiana; Missouri is a no-faction state'],
  sickles_daniel_e: ['union', 'US Representative for New York until 3 March 1861'],
  sigel_franz: ['unknown', 'a civilian in St Louis at a date the draft leaves unknown (occupation needs-source)'],
  smith_charles_f: ['union', 'lieutenant colonel, US Army; command of the Department of Utah ended on 28 February 1861'],
  stanton_edwin_m: ['union', 'Buchanan\'s Attorney General until 4 March 1861; a Washington practice; an Ohio lawyer'],
  stevens_thaddeus: ['union', 'US Representative for Pennsylvania'],
  stringham_silas_h: ['union', 'US Navy captain, Chief of the Bureau of Detail'],
  sumner_charles: ['union', 'US Senator for Massachusetts'],
  sumner_edwin_v: ['union', 'colonel, 1st Cavalry, US Army, until 16 March 1861'],
  thomas_george_h: ['union', 'major, 2nd Cavalry, US Army, on leave (a Virginian by birth; the commission gives the side)'],
  thomas_lorenzo: ['union', 'lieutenant colonel in the Adjutant General\'s Office, US Army; Adjutant General from 7 March 1861'],
  tod_david: ['union', 'an Ohio man [inferred: Governor of Ohio from January 1862; the draft prewar cell is needs-source]'],
  trumbull_lyman: ['union', 'US Senator for Illinois'],
  vallandigham_clement_l: ['union', 'US Representative for Ohio'],
  wade_benjamin_f: ['union', 'US Senator for Ohio'],
  wadsworth_james_s: ['union', 'a Geneseo (New York) landowner; delegate to the Peace Conference'],
  wallace_lewis: ['union', 'an Indiana lawyer [inferred: colonel of the 11th Indiana Infantry from 25 April; the draft prewar cell gives no residence]'],
  washburne_elihu_b: ['union', 'US Representative for Illinois'],
  weed_thurlow: ['union', 'editor of the Albany Evening Journal'],
  wilkes_charles: ['union', 'US Navy captain on special duty at Washington'],
  wilson_henry: ['union', 'US Senator for Massachusetts'],
  wood_benjamin: ['union', 'US Representative for New York; owner of the New York Daily News'],
};
Object.assign(START_SIDE, START_SIDE_UNION_CODED);
const people = [];
const factionNotes = [];
const sideCount = {};
for (const r of rosterRows) {
  const id = r.get('id');
  const sf = startFaction(id);
  const draftSide = sideFaction[r.get('side')] ?? '';
  let faction = sf !== undefined ? sf : draftSide;
  let sideNote = '';
  if (sf === undefined && START_SIDE[id]) {
    const [side, why] = START_SIDE[id];
    faction = side === 'none' ? '' : side;
    sideNote = `[start side ${side === 'none' ? 'none (no-faction home state)' : side}: ${why}; his eventual side in the draft is ${draftSide || 'none'}]`;
    sideCount[side] = (sideCount[side] ?? 0) + 1;
  } else if (sf === undefined && (draftSide === 'confederate' || draftSide === 'union')) say(`MAN WITH NO POST AND NO START SIDE RULING: ${id} (${draftSide})`);
  if (sf !== undefined && sf !== draftSide) factionNotes.push(`${id}: ${sf || 'no faction'} at the start (post), ${draftSide || 'none'} in the draft`);
  const born = r.get('born'), died = r.get('died');
  const notes = [sideNote, r.get('notes'), r.get('posts_1861_62') && `[posts 1861-62: ${r.get('posts_1861_62')}]`, r.get('west_point_class') && `[West Point class ${r.get('west_point_class')}]`, r.get('prewar') && `[prewar: ${r.get('prewar')}]`].filter(Boolean).join(' ');
  people.push([
    id, r.get('name'), '', faction === 'unknown' ? 'unknown' : faction, r.get('kind'), born === '' ? 'unknown' : born, died === '' ? 'unknown' : died,
    centreCell(id, 'competence', r.get('competence')), centreCell(id, 'nerve', r.get('nerve')), centreCell(id, 'experience', r.get('experience')), centreCell(id, 'reputation', r.get('reputation_1861')),
    traitsCell(id, r.get('traits_evidence')), r.get('bloc'), ranksCell(id, r.get('rank_dates')), convertSources(r.get('sources'), 'PEOPLE-LANE'), notes,
  ]);
}
// People who hold a post at the start but are not in the roster.
const PERSON_KIND = { governor: 'governor', cabinet: 'cabinet', president: 'cabinet', vice_president: 'cabinet', bureau: 'bureau', navy_squadron: 'naval_officer', navy_yard: 'naval_officer', ship_command: 'naval_officer', marine_corps: 'naval_officer', fort_command: 'general', army_department: 'general', general_in_chief: 'general', arsenal: 'general', harbour_command: 'general', temporary_command: 'general', state_military: 'general' };
const extra = new Map();
for (const h of holders) {
  if (h.person === 'unknown' || rosterIds.has(h.person)) continue;
  const t = (tenuresByPost.get(h.post) ?? []).find((x) => x.person === h.person);
  const e = extra.get(h.person) ?? { id: h.person, name: t.name, kind: PERSON_KIND[postKindOf.get(h.post)] ?? 'other', faction: deptFaction.get(postById.get(h.post).dept) ?? '', sources: [], posts: [] };
  e.sources.push(t.sources); e.posts.push(h.post);
  extra.set(h.person, e);
}
for (const id of ALSO_RECORD) {
  if (rosterIds.has(id) || extra.has(id)) continue;
  const t = [...tenuresByPost.values()].flat().find((x) => x.person === id);
  const post = postById.get(t.post);
  extra.set(id, { id, name: t.name, kind: PERSON_KIND[post.kind] ?? 'other', faction: deptFaction.get(post.dept) ?? '', sources: [t.sources], posts: [`${t.post} (not the holder: ${HOLDER_RULING[t.post]?.why ?? 'kept by ruling'})`] });
}
for (const e of [...extra.values()].sort((a, b) => cmp(a.id, b.id))) {
  people.push([e.id, e.name, '', e.faction, e.kind, 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', '', '', '', convertSources(e.sources.join('; '), 'OOB-LANE'),
    `[not in the people roster: a post-holder of the oob draft; kind from his post (${e.posts.join(', ')})]`]);
}
say(`people: ${rosterRows.length} from the roster + ${extra.size} post-holders not in it = ${people.length}`);
say(`stat directions kept with citations: ${personStats.directions}; dropped to unknown or trait dropped for lack of an admissible citation: ${personStats.dropped.length}${personStats.dropped.length ? ` (${personStats.dropped.slice(0, 40).join(', ')}${personStats.dropped.length > 40 ? ', ...' : ''})` : ''}`);
say(`ranks: ${usedRanks.size} distinct; entries dropped for an unknown date: ${rankDropped}; entries that are a status, not a rank: ${rankStatus}`);
say(`start sides decided by table for men with no post: ${JSON.stringify(sideCount)} (${Object.keys(START_SIDE).length} entries)`);
say(`people whose faction at the start differs from the draft's side: ${factionNotes.length}${factionNotes.length ? ` (${factionNotes.slice(0, 12).join('; ')}${factionNotes.length > 12 ? '; ...' : ''})` : ''}`);
write('source/world/people.csv', ['id', 'name', 'invented', 'faction', 'kind', 'born', 'died', 'competence', 'nerve', 'experience', 'reputation', 'traits', 'bloc', 'ranks', 'sources', 'notes'], people);

// ---- posts.csv (needs nothing from people) --------------------------------------
write(scen('posts'), ['id', 'name', 'kind', 'department', 'parent', 'region', 'temporary_operation', 'installation', 'rail_line', 'sources', 'notes'],
  posts.map((p) => [p.id, p.name, p.kind, p.dept, p.parent, p.region, p.kind === 'temporary_command' ? p.id : '', POST_INSTALLATION[p.id] ?? '', '', p.sources, p.notes]));

// ---- force blocks --------------------------------------------------------------
const fbRows = rows('oob/force_blocks.csv');
const blocks = [];
const excludedBlocks = [];
const byId = new Map(fbRows.map((r) => [r.get('id'), r]));
const included = new Set();
const decision = new Map();
const FORCE_DETACHMENT = new Set(['fb_st_charleston_morris_island']);
const SUMTER_LABOURERS = 55; // oob README "Priorities": garrison 85 soldiers, 55 labourers
/** A block is in the start when its commanding post is, its parent block is, and its place resolves to a region. */
function decide(id) {
  if (decision.has(id)) return decision.get(id);
  const r = byId.get(id);
  const post = r.get('post');
  const parent = r.get('parent_block');
  let why = '';
  if (post && !postById.has(post)) why = `post ${post} not at the start`;
  else if (parent && (!byId.has(parent) || !decide(parent).ok)) why = `parent ${parent} left out`;
  else if (!resolve(r.get('location'))) why = `no region for "${r.get('location').slice(0, 50)}"`;
  const d = why ? { ok: false, why } : { ok: true, region: resolve(r.get('location')) };
  decision.set(id, d);
  return d;
}
for (const r of fbRows) {
  const id = r.get('id');
  const d = decide(id);
  if (!d.ok) { excludedBlocks.push(`${id} (${d.why})`); continue; }
  const loc = r.get('location');
  const region = d.region;
  included.add(id);
  const side = r.get('side');
  const post = r.get('post');
  let dept;
  if (side === 'state') {
    const st = stateNames.find((s) => new RegExp(`\\b${s}\\b`).test(loc) || (post && postById.get(post)?.dept === V.stateId(s)));
    dept = st ? V.stateId(st) : undefined;
  } else dept = postById.get(post)?.dept;
  if (!dept) say(`NO DEPARTMENT FOR BLOCK ${id}`);
  const strength = r.get('strength');
  const date = r.get('strength_date');
  let parent = r.get('parent_block');
  let note = r.get('notes');
  let kind = r.get('kind');
  // The draft makes the Morris Island command a block under the Charleston block; the format keeps parents for detachments only.
  if (FORCE_DETACHMENT.has(id)) { kind = 'detachment'; note += ' [kind block in the draft; a part of its parent block in this format]'; }
  if (parent && (byId.get(parent).get('kind') === 'detachment' || FORCE_DETACHMENT.has(parent))) {
    const grand = byId.get(parent).get('parent_block');
    note += ` [parent was the detachment ${parent}; reparented to its block ${grand}]`;
    parent = grand;
  }
  const aboardM = /^aboard USS (\w+)/i.exec(loc);
  blocks.push({
    id, name: r.get('name'), kind, parent, dept, post, region, aboard: aboardM ? `fb_us_ship_${aboardM[1].toLowerCase()}` : '', arm: r.get('arm'),
    strength: strength === '' ? 'unknown' : strength, date: date === '' ? (strength === '' ? '' : 'unknown') : date,
    nonCombatants: id === 'fb_us_sumter_garrison' ? String(SUMTER_LABOURERS) : '', stores: r.get('stores_days') === '' ? 'unknown' : r.get('stores_days'),
    sources: convertSources(r.get('sources'), 'OOB-LANE'), notes: [note, r.get('units') && `[units: ${r.get('units')}]`].filter(Boolean).join(' '),
  });
}
say(`force blocks at the start: ${blocks.length} of ${fbRows.length}; left out: ${excludedBlocks.join('; ')}`);
say(`force blocks whose return is dated after the start (kept, date recorded): ${blocks.filter((b) => b.date !== '' && b.date !== 'unknown' && b.date > START).length}`);
write(scen('force_blocks'), ['id', 'name', 'kind', 'parent', 'department', 'post', 'region', 'aboard', 'arm', 'strength', 'strength_date', 'non_combatants', 'stores_days', 'sources', 'notes'],
  blocks.map((b) => [b.id, b.name, b.kind, b.parent, b.dept, b.post, b.region, b.aboard, b.arm, b.strength, b.date, b.nonCombatants, b.stores, b.sources, b.notes]));

// ---- standing agreements -------------------------------------------------------
const pickensSources = postById.get('us_fort_pickens')?.sources ?? '';
const truceSummary = 'The truce of 28 January 1861 at Pensacola: Fort Pickens is held, and landing troops there was read as breaking it. The drafts and research notes give no other terms.';
const standing = [];
for (const post of ['us_fort_pickens', 'cs_cmd_pensacola']) {
  if (!postById.has(post)) { say(`standing order not entered: ${post} is not a post at the start`); continue; }
  standing.push(['pickens_truce', post, 'truce', '', '1861-01-28', truceSummary,
    convertSources(`${pickensSources}; research note secession-winter (1861-03-11/12 entry); research note march-1861-facts (Adams)`, 'OOB-LANE'), 'from the draft notes of us_fort_pickens and fort_pickens; the terms are not in the drafts']);
}
say('prior orders not entered: the Navy Secretary\'s earlier orders to Captain Adams (the march-1861-facts note names them but gives no date or text)');
write(scen('standing_orders'), ['id', 'post', 'kind', 'from', 'issued_on', 'summary', 'sources', 'notes'], standing);

// ---- control -------------------------------------------------------------------
const stateOf = (r) => [...new Set(r.counties.map((c) => c.split(':')[0]))];
// Loyalty (union / confederate / neutral-contested) proposals from the research note secession-winter, border states. Lead ruling after review: loyalty never stands in for control, so these are NOT control; they wait for a loyalty field and are kept here and in the rows' notes.
const LOYALTY = { Maryland: [350, 250, 400], Delaware: [650, 80, 270], Kentucky: [330, 250, 420], Missouri: [450, 200, 350] };
const control = [];
const ruleCount = {};
for (const r of regions.filter((x) => x.kind === 'land' || x.kind === 'key_point')) {
  const states = stateOf(r);
  let shares = '', note;
  const st = states.length === 1 ? states[0] : undefined;
  if (['fort_sumter', 'fort_pickens', 'key_west'].includes(r.id)) { shares = 'union:1000'; note = 'Union-held fort in a seceded state (oob draft posts us_fort_sumter, us_fort_pickens, us_fort_taylor)'; ruleCount.fort = (ruleCount.fort ?? 0) + 1; }
  else if (r.id === 'fort_monroe') { shares = 'union:1000'; note = 'Union-held throughout (map draft notes)'; ruleCount.fort = (ruleCount.fort ?? 0) + 1; }
  else if (r.id === 'baltimore') { shares = ''; note = 'Maryland: control is the state government\'s (no faction). [I] loyalty proposal for Baltimore, not control: union 150, confederate 400, neutral-contested 450 (research note secession-winter, border states); it waits for a loyalty field'; ruleCount.stateGovernment = (ruleCount.stateGovernment ?? 0) + 1; }
  else if (st && LOYALTY[st]) { shares = ''; note = `${st}: control is the state government's (no faction). [I] loyalty proposal, not control: union ${LOYALTY[st][0]}, confederate ${LOYALTY[st][1]}, neutral-contested ${LOYALTY[st][2]} (research note secession-winter, border states); it waits for a loyalty field`; ruleCount.stateGovernment = (ruleCount.stateGovernment ?? 0) + 1; }
  else if (st && V.SECEDED.includes(st)) { shares = 'confederate:1000'; note = `${st} had seceded by 5 March 1861 (research notes: "the seven states")`; ruleCount.seceded = (ruleCount.seceded ?? 0) + 1; }
  else if (st && V.UNCOMMITTED.includes(st)) { shares = ''; note = `${st}: slave state still in the Union on 5 March and uncommitted; no sourced start control, so no one's (the research note's Virginia proposals name the Blue Ridge and the draft's regions do not)`; ruleCount.uncommitted = (ruleCount.uncommitted ?? 0) + 1; }
  else if (r.id.startsWith('it_')) { shares = ''; note = 'Indian Territory nations: no sourced start control (the Choctaw Nation declared for the South on 7 February 1861, region notes); no one\'s'; ruleCount.uncommitted = (ruleCount.uncommitted ?? 0) + 1; }
  else if (st || states.every((s) => s.endsWith('Territory') || !V.SECEDED.includes(s))) { shares = 'union:1000'; note = 'a free state or territory, or the District, in the Union on 5 March 1861'; ruleCount.union = (ruleCount.union ?? 0) + 1; }
  else { say(`CONTROL NOT DECIDED: ${r.id} (${states.join(', ')})`); continue; }
  control.push([r.id, shares, note]);
}
say(`control rows: ${control.length} (${Object.entries(ruleCount).map(([k, n]) => `${k} ${n}`).join(', ')})`);
write(scen('control'), ['region', 'shares', 'notes'], control);

// ---- scenario header, manifest, sources, strings ---------------------------------
writeJson(`source/scenarios/${SCENARIO}/scenario.json`, {
  name: 'March 1861: the cabinet confirmed',
  startDate: START,
  seed: 1861,
  factions: [
    { faction: 'union', principal: 'lincoln_abraham', capital: 'washington', playable: true },
    { faction: 'confederate', principal: 'davis_jefferson', capital: 'montgomery', playable: false },
  ],
});
const sortedRanks = [...usedRanks.values()].sort((a, b) => a.seniority - b.seniority || cmp(a.id, b.id));
const manifest = {
  formatVersion: 2, id: 'union-1861', status: 'draft', name: 'pack.name', defaultLocale: 'en', locales: ['en'],
  rules: V.RULES,
  vocabularies: {
    terrains: V.TERRAINS, postKinds: V.POST_KINDS, departmentKinds: V.DEPARTMENT_KINDS, arms: V.ARMS, personKinds: V.PERSON_KINDS, traits: V.TRAITS,
    ranks: sortedRanks.map((r) => ({ id: r.id, name: `rank.${r.id}`, seniority: r.seniority })), blocs: V.BLOCS, standingOrderKinds: V.STANDING_ORDER_KINDS,
  },
  factions: V.FACTIONS, scenarios: [SCENARIO],
};
writeJson('pack.json', manifest);
writeJson('PROVENANCE.json', { formatVersion: 2, sources: cites.used().sort((a, b) => cmp(a.key, b.key)) });
const label = (id) => id.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const strings = { 'pack.name': 'Union 1861 (draft)', 'faction.union': 'the Union', 'faction.confederate': 'the Confederate States' };
for (const [group, list] of Object.entries(manifest.vocabularies)) {
  for (const t of list) strings[t.name] = group === 'ranks' ? usedRanks.get(t.id).name : label(t.id);
}
writeJson('strings/en.json', Object.fromEntries(Object.entries(strings).sort(([a], [b]) => cmp(a, b))));
say(`sources registered: ${cites.used().length}; fallback own-work citations used: ${JSON.stringify(stats.fallbackCites)}; draft citations dropped: ${JSON.stringify([...cites.drops()])}`);
say(`tokens no rule could resolve: ${JSON.stringify([...cites.unknowns()])}`);
