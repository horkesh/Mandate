// Apply the re-sourcing readers' KEEP / CHANGE / HOLD results (rs1-rs9) to people.csv. Lane 1.11r3.
const fs = require('fs');
const { parse, serialise } = require('./csvlib.js');
const root = (process.env.PACK_ROOT || '.').replace(/\\/g, '/').replace(/\/?$/, '/'); // a worktree holding packs/ and docs/research/_resource/
const res = root + 'docs/research/_resource/';
const peopleFile = root + 'packs/union-1861/source/world/people.csv';
const dry = process.argv.includes('--dry');
const armyOk = process.argv.includes('--army-serving-stand'); // the 13 serving officers stand as facts (after A1 verifies)

const people = parse(fs.readFileSync(peopleFile, 'utf8'));
const H = people[0];
if (!H.includes('bloc_cites')) { H.splice(H.indexOf('bloc') + 1, 0, 'bloc_cites'); for (const r of people.slice(1)) r.splice(H.indexOf('bloc_cites'), 0, ''); }
const col = (n) => H.indexOf(n);
const byId = new Map(people.slice(1).map((r) => [r[0], r]));
const stripNew = (s) => s.replace(/(^|\+)NEW:/g, '$1');
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
    const row = byId.get(c.person);
    if (!row) { log.push(`NO PERSON ${c.person} (rs${k})`); continue; }
    const [kind, name] = c.cell.includes(':') ? c.cell.split(/:(.+)/) : ['stat', c.cell];
    const dec = c.decision;
    const cites = stripNew(c.citations.trim());
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
const blocHeld = []; const blocLog = []; const preposition = []; const factStands = [];
const FACT = new Set(['army', 'confederate']);
const CIVILIANS = new Set(['burnside_ambrose_e', 'grant_ulysses_s', 'halleck_henry_w', 'hitchcock_ethan_a', 'hooker_joseph', 'mitchel_ormsby_m', 'patterson_robert', 'rosecrans_william_s', 'sherman_william_t', 'stone_charles_p']);
for (const f of ['rs7.csv', 'rs8.csv', 'rs9.csv']) {
  for (const c of cellsFrom(f)) {
    const row = byId.get(c.person);
    if (!row) { log.push(`NO PERSON ${c.person} (${f})`); continue; }
    const prior = row[col('bloc')];
    const cites = stripNew(c.bloc_cites.trim());
    if (c.decision === 'KEEP') { row[col('bloc_cites')] = cites; touch(c.person, 'kept'); }
    else if (c.decision === 'CHANGE' && c.proposed_bloc === 'army') {
      // The lead's earlier ruling: an officer who left US service after 5 March is a PRE-POSITIONED stand-in (owned by lane 1.12) until the engine can
      // resign an officer; he keeps his coded bloc, and the row's notes carry the register fact for lane 1.12.
      const dates = [...cites.matchAll(/dated (\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]);
      const when = dates[dates.length - 1];
      const src = cites.split('+').pop().replace(/ dated .*$/, '');
      const departure = c.person === 'buchanan_franklin' ? 'was dismissed' : 'resigned';
      row[col('bloc_cites')] = cites;
      row[col('notes')] = (row[col('notes')] + ` [Pre-positioned stand-in, owned by lane 1.12: held a US commission on 5 March 1861 (bloc army, a register fact) and ${departure} on ${when} (${src}); he takes his true start in US service once lane 1.12 builds resignation (Part B).]`).trim();
      touch(c.person, 'kept'); preposition.push(`${c.person} ${when}`);
    } else if (c.decision === 'CHANGE') { row[col('bloc')] = c.proposed_bloc; row[col('bloc_cites')] = cites; touch(c.person, 'changed'); blocLog.push(`${c.person}: ${prior} -> ${c.proposed_bloc}`); }
    else if (FACT.has(prior) && !CIVILIANS.has(c.person)) {
      // A HOLD on a fact bloc stands as coded (a fact needs no leg): the 13 serving army officers pending the register check, and the
      // confederate men no document before 5 March places.
      factStands.push(`${c.person} ${prior}`);
    } else {
      blocHeld.push([c.person, prior, c.proposed_bloc, c.basis]);
      row[col('bloc')] = ''; row[col('bloc_cites')] = '';
      touch(c.person, 'held');
    }
  }
}

if (dry) {
  console.log('log', log.length); for (const l of log) console.log(' ', l);
  console.log('cells held', held.length, 'blocs held', blocHeld.length); console.log(blocLog.join('\n'));
  console.log('preposition', preposition.length, preposition.join('; ')); console.log('fact HOLDs standing', factStands.length, factStands.join('; '));
  const missing = [...CIVILIANS].filter((p) => !byId.has(p)); console.log('civilian ids not in the pack', missing);
  process.exit(0);
}
fs.writeFileSync(peopleFile, serialise(people));
fs.writeFileSync(process.env.HELD_OUT_CELLS, serialise([['person', 'cell', 'prior_value', 'reader_basis'], ...held]));
fs.writeFileSync(process.env.HELD_OUT_BLOCS, serialise([['person', 'prior_bloc', 'proposed_bloc', 'reader_basis'], ...blocHeld]));
console.log('written; log', log.length);
