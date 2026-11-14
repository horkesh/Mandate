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
    sources: convertSources(r.get('sources'), 'OOB-LANE'), notes: r.get('notes'), est,
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
const holders = []; // { post, person | 'unknown', acting, from, to, sources, notes }
const holderOf = new Map();
const unresolved = [];
for (const p of posts) {
  const ts = tenuresByPost.get(p.id) ?? [];
  const yes = ts.filter((t) => t.cover === 'yes');
  const maybe = ts.filter((t) => t.cover === 'maybe');
  let win;
  let why = '';
  if (yes.length === 1) win = yes[0];
  else if (yes.length > 1) {
    const dated = yes.filter((t) => t.from !== '').sort((a, b) => cmp(b.from, a.from));
    if (dated.length >= 1 && (dated.length === 1 || dated[0].from !== dated[1].from)) win = dated[0];
    else why = `${yes.length} tenures cover the start with no way to order them: ${yes.map((t) => `${t.person}${t.acting ? ' (acting)' : ''}`).join(', ')}`;
  } else if (maybe.length > 0) why = `no tenure is certain to cover the start (a start or end is needs-source): ${maybe.map((t) => t.person).join(', ')}`;
  else why = ts.length > 0 ? 'its tenures all fall outside the start' : 'the draft gives no holder';
  if (win) {
    holders.push({ post: p.id, person: win.person, acting: win.acting, from: win.from, to: win.to, sources: convertSources(win.sources, 'OOB-LANE'), notes: win.notes });
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
const people = [];
const factionNotes = [];
for (const r of rosterRows) {
  const id = r.get('id');
  const sf = startFaction(id);
  const draftSide = sideFaction[r.get('side')] ?? '';
  const faction = sf !== undefined ? sf : draftSide;
  if (sf !== undefined && sf !== draftSide) factionNotes.push(`${id}: ${sf || 'no faction'} at the start (post), ${draftSide || 'none'} in the draft`);
  const born = r.get('born'), died = r.get('died');
  const notes = [r.get('notes'), r.get('posts_1861_62') && `[posts 1861-62: ${r.get('posts_1861_62')}]`, r.get('west_point_class') && `[West Point class ${r.get('west_point_class')}]`, r.get('prewar') && `[prewar: ${r.get('prewar')}]`].filter(Boolean).join(' ');
  people.push([
    id, r.get('name'), '', faction, r.get('kind'), born === '' ? 'unknown' : born, died === '' ? 'unknown' : died,
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
for (const e of [...extra.values()].sort((a, b) => cmp(a.id, b.id))) {
  people.push([e.id, e.name, '', e.faction, e.kind, 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown', '', '', '', convertSources(e.sources.join('; '), 'OOB-LANE'),
    `[not in the people roster: a post-holder of the oob draft; kind from his post (${e.posts.join(', ')})]`]);
}
say(`people: ${rosterRows.length} from the roster + ${extra.size} post-holders not in it = ${people.length}`);
say(`stat directions kept with citations: ${personStats.directions}; dropped to unknown or trait dropped for lack of an admissible citation: ${personStats.dropped.length}${personStats.dropped.length ? ` (${personStats.dropped.slice(0, 40).join(', ')}${personStats.dropped.length > 40 ? ', ...' : ''})` : ''}`);
say(`ranks: ${usedRanks.size} distinct; entries dropped for an unknown date: ${rankDropped}; entries that are a status, not a rank: ${rankStatus}`);
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
