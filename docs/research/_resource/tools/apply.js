// Apply rounds 1 and 2 (rs1-rs14), under decision 0097 and R51. Lane 1.11r3.
const fs = require('fs');
const { parse, serialise } = require('./csvlib.js');
const root = (process.env.PACK_ROOT || '.').replace(/\\/g, '/').replace(/\/?$/, '/'); // a worktree holding packs/ and docs/research/_resource/
const res = root + 'docs/research/_resource/';
const peopleFile = root + 'packs/union-1861/source/world/people.csv';
const dry = process.argv.includes('--dry');
// These whole rows belong to R49, including their judgments and notes.
// R62: Buchanan was dismissed; he did not resign. Preserve R49's wording rather than pre-positioning him here.
const R49 = new Set(['buchanan_franklin', 'cooper_samuel', 'crittenden_george_b', 'ewell_richard_s', 'gorgas_josiah', 'holmes_theophilus_h', 'johnston_albert_s', 'johnston_joseph_e', 'lee_robert_e', 'longstreet_james', 'loring_william_w', 'magruder_john_b', 'pemberton_john_c', 'smith_edmund_k', 'stuart_james_e_b']);

const people = parse(fs.readFileSync(peopleFile, 'utf8'));
const H = people[0];
if (!H.includes('bloc_cites')) { H.splice(H.indexOf('bloc') + 1, 0, 'bloc_cites'); for (const r of people.slice(1)) r.splice(H.indexOf('bloc_cites'), 0, ''); }
const col = (n) => H.indexOf(n);
const byId = new Map(people.slice(1).map((r) => [r[0], r]));
const stripNew = (s) => s.replace(/(^|\+)NEW:/g, '$1');
// Only the documents explicitly quoted by the readers get these primary keys;
// the containing books remain secondary, and untouched citations keep their keys.
const DOCUMENT_KEYS = new Map([['PEARSON-ANDREW', 'PEARSON-ANDREW-DOCS'], ['NH', 'NH-DOCS'], ['NEWTON-LYONS', 'NEWTON-LYONS-DOCS'], ['WOODBURN-STEVENS', 'WOODBURN-STEVENS-DOCS']]);
const documents = s => stripNew(s).split('+').map(c => c.replace(/^([^ ]+)/, key => DOCUMENT_KEYS.get(key) || key)).join('+');
const log = []; const held = []; const touched = new Map();
const touch = (id, what) => { if (!touched.has(id)) touched.set(id, { kept: 0, changed: 0, held: 0 }); touched.get(id)[what]++; };

function cellsFrom(file) {
  const rows = parse(fs.readFileSync(res + file, 'utf8')); const h = rows[0];
  return rows.slice(1).filter((r) => r.length >= h.length).map((r) => Object.fromEntries(h.map((n, i) => [n, r[i]])));
}
const segs = (v) => (v === '' ? [] : v.split(';'));
const direction = (s) => s.replace(/\s*\(.*$/, '').trim();

// ---------------------------------------------------------------- judgment cells (rs1-rs6)
for (const k of [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14]) {
  if (!fs.existsSync(res + `rs${k}.csv`)) continue;
  for (const c of cellsFrom(`rs${k}.csv`)) {
    if (R49.has(c.person)) continue;
    if (c.person === 'lincoln_abraham' && c.cell === 'reputation') {
      c.decision = 'HOLD';
      c.basis = 'Decision 0097 item 7: rs11 CHANGE rejected. One supporter\'s rally speech already supports Andrew\'s regard; reputation remains held, with the average default.';
    }
    const row = byId.get(c.person);
    if (!row) { log.push(`NO PERSON ${c.person} (rs${k})`); continue; }
    const [kind, name] = c.cell.includes(':') ? c.cell.split(/:(.+)/) : ['stat', c.cell];
    const admissible = stripNew(c.citations.trim()).split('+').filter(cite => !/^BATES-D(?:\s|$)/.test(cite));
    if (c.decision !== 'HOLD' && !admissible.some(Boolean)) {
      c.decision = 'HOLD';
      c.basis += ' R51 rights hold: the Bates diary edition remains excluded by the pack\'s licence test; no independent citation remains. Proposed ruling pending the lead.';
    }
    const dec = c.decision;
    let cites = documents(admissible.join('+'));
    // The round-two notes explicitly bound these documents, rejecting the
    // precise days/months guessed by round one (0097 item 8).
    if (k === 10 && c.person === 'andrew_john_a' && c.cell === 'regard') cites += ' dated 1860';
    if (k === 12 && c.person === 'lyons_richard_b_p' && c.cell === 'reputation') cites += ' dated 1853';
    const dir = direction(c.proposed_direction);
    if (kind === 'stat') {
      const i = col(name);
      if (i < 0) { log.push(`NO COLUMN ${name} (${c.person} rs${k})`); continue; }
      const prior = row[i];
      if (dec === 'HOLD') { held.push([c.person, c.cell, prior, c.basis]); row[i] = ''; touch(c.person, 'held'); }
      else { const d = dir || prior.split(':')[0]; row[i] = `${d}:${cites}`; touch(c.person, dec === 'CHANGE' ? 'changed' : 'kept'); }
    } else {
      const i = col(kind === 'value' ? 'values' : kind === 'trait' ? 'traits' : 'regard_others');
      const list = segs(row[i]);
      const idx = list.findIndex((s) => (kind === 'regard_others' ? s.startsWith(name + ':') : s.startsWith(name + ':')));
      if (idx < 0 && dec !== 'HOLD') { log.push(`NO SEGMENT ${c.cell} for ${c.person} (rs${k}); adding`); }
      const prior = idx >= 0 ? list[idx] : '';
      if (dec === 'HOLD') {
        held.push([c.person, c.cell, prior, c.basis]);
        if (idx >= 0) list.splice(idx, 1);
        touch(c.person, 'held');
      } else {
        const rdir = (dir.includes(':') ? dir.split(':').pop() : dir) || prior.split(':')[1];
        const seg = kind === 'regard_others' ? `${name}:${rdir}:${cites}` : `${name}:${cites}`;
        if (idx >= 0) list[idx] = seg; else list.push(seg);
        touch(c.person, dec === 'CHANGE' ? 'changed' : 'kept');
      }
      row[i] = list.join(';');
    }
  }
}

// ---------------------------------------------------------------- blocs (rs7-rs9)
const blocHeld = []; const blocLog = []; const factStands = [];
const FACT = new Set(['army', 'confederate']);
const CIVILIANS = new Set(['burnside_ambrose_e', 'grant_ulysses_s', 'halleck_henry_w', 'hitchcock_ethan_a', 'hooker_joseph', 'mitchel_ormsby_m', 'patterson_robert', 'rosecrans_william_s', 'sherman_william_t']);
const DISPUTED = new Set(['breckinridge_john_c', 'buckner_simon_b', 'vance_zebulon_b', 'letcher_john', 'polk_leonidas', 'lovell_mansfield', 'mason_james_m', 'hunter_robert_m_t', 'floyd_john_b', 'bulloch_james_d']);
const NO_BLOC = new Set([...CIVILIANS, ...DISPUTED, 'stone_charles_p']);
for (const f of ['rs7.csv', 'rs8.csv', 'rs9.csv']) {
  for (const c of cellsFrom(f)) {
    if (R49.has(c.person)) continue;
    const row = byId.get(c.person);
    if (!row) { log.push(`NO PERSON ${c.person} (${f})`); continue; }
    const prior = row[col('bloc')];
    const cites = stripNew(c.bloc_cites.trim());
    if (NO_BLOC.has(c.person)) {
      blocHeld.push([c.person, prior, '', `Decision 0097: no starting bloc. ${c.basis}`]);
      row[col('bloc')] = ''; row[col('bloc_cites')] = ''; touch(c.person, 'held');
    } else if (c.decision === 'KEEP') { row[col('bloc_cites')] = cites; touch(c.person, 'kept'); }
    else if (c.decision === 'CHANGE') { row[col('bloc')] = c.proposed_bloc; row[col('bloc_cites')] = cites; touch(c.person, 'changed'); blocLog.push(`${c.person}: ${prior} -> ${c.proposed_bloc}`); }
    else if (FACT.has(prior)) {
      // The remaining fact HOLDs stand. A1 verified the thirteen Army commissions.
      factStands.push(`${c.person} ${prior}`);
    } else {
      blocHeld.push([c.person, prior, c.proposed_bloc, c.basis]);
      row[col('bloc')] = ''; row[col('bloc_cites')] = '';
      touch(c.person, 'held');
    }
  }
}

const stone = byId.get('stone_charles_p');
const stoneNote = '[Decision 0097: District of Columbia volunteer colonel and inspector general from 1 January 1861 (Cullum 2 no1237 pp117-118); federal commission authority is not established by a contemporary source read. Starting bloc held.]';
if (stone && !stone[col('notes')].includes(stoneNote)) stone[col('notes')] = `${stone[col('notes')]} ${stoneNote}`.trim();

// Dates apply only to their specified, surviving citation. A date cannot restore a held cell.
const datingLog = [];
for (const d of cellsFrom('dating.csv')) {
  const [id, cell] = d.cell.split('/');
  if (R49.has(id)) continue;
  if (!/^\d{4}(?:-\d{2}){0,2}$/.test(d.date)) throw new Error(`Unsupported date bound: ${d.date}`);
  const row = byId.get(id);
  if (!row) throw new Error(`Dating person not found: ${id}`);
  const [kind, name] = cell.split(':');
  const i = col(kind === 'value' ? 'values' : kind === 'trait' ? 'traits' : kind);
  const segments = kind === 'value' || kind === 'trait' || kind === 'regard_others' ? segs(row[i]) : [row[i]];
  let found = false;
  const locator = s => s.replace(/ dated \d{4}(?:-\d{2}){0,2}.*$/, '').replace(/ \(withdrawal letter only\)$/, '').replace(/(\d)-p/g, '$1 p');
  for (let n = 0; n < segments.length; n++) {
    if (name && !segments[n].startsWith(name + ':')) continue;
    segments[n] = segments[n].split('+').map(c => {
      const prefix = n === 0 || name ? c.slice(0, c.indexOf(':') + 1) : '';
      const citation = c.slice(prefix.length);
      if (locator(citation).replace(/-DOCS\b/, '') !== locator(d.citation)) return c;
      found = true;
      return `${prefix}${locator(citation)} dated ${d.date}`;
    }).join('+');
  }
  row[i] = segments.join(';');
  datingLog.push(`${d.cell}: ${found ? 'dated ' + d.date : 'held or superseded citation (not restored)'}: ${d.citation}`);
}
if (log.length) throw new Error(log.join('\n'));

if (dry) {
  console.log('log', log.length); for (const l of log) console.log(' ', l);
  console.log('cells held', held.length, 'blocs held', blocHeld.length); console.log(blocLog.join('\n'));
  console.log('R49 rows skipped', R49.size); console.log('fact HOLDs standing', factStands.length, factStands.join('; '));
  console.log('dating', datingLog.join('\n'));
  const missing = [...CIVILIANS].filter((p) => !byId.has(p)); console.log('civilian ids not in the pack', missing);
  process.exit(0);
}
fs.writeFileSync(peopleFile, serialise(people));
fs.writeFileSync(process.env.HELD_OUT_CELLS, serialise([['person', 'cell', 'prior_value', 'reader_basis'], ...held]));
fs.writeFileSync(process.env.HELD_OUT_BLOCS, serialise([['person', 'prior_bloc', 'proposed_bloc', 'reader_basis'], ...blocHeld]));
console.log('written; log', log.length, 'cells held', held.length, 'blocs held', blocHeld.length, 'R49 rows skipped', R49.size);
console.log(datingLog.join('\n'));
