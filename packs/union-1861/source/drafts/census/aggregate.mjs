// Sums Kennedy's county figures (kennedy-county-1860.csv) into the pack's regions.
// Usage: node aggregate.mjs   (run from this folder; reads ../../world/regions.csv)
// Writes enslaved-1860-by-region.csv and aggregate-report.txt. Draft only: nothing here enters the pack.
// Inputs: kennedy-county-1860.csv (county tables), kennedy-state-summary-1860.csv (the Recapitulation,
// printed pp. 598-599). Spelling differences between the pack's county names and the printed names are
// in ALIASES below (pack name -> printed name); counties created after the 1860 enumeration are in POST1860.
import fs from 'node:fs';

function parse(t) {
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      row.push(f); f = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const csvCell = (s) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
const norm = (s) =>
  s.toLowerCase().replace(/,?\s*\(no return\)/g, '').replace(/\*/g, '').replace(/,?\s*estimated/g, '').replace(/\./g, '')
    .replace(/\bterritory\b/g, '').replace(/\bsaint\b/g, 'st').replace(/\b(county|parish|district|city)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const k = (st, co) => norm(st) + '|' + norm(co);

// pack spelling -> printed spelling (keys already normalised pieces; checked against the printed rows)
const ALIASES = {
  'Virginia:Loudoun': 'Loudon', 'Virginia:Spotsylvania': 'Spottsylvania', 'Virginia:Mathews': 'Matthews', 'Virginia:Greensville': 'Greenville',
  'Maryland:Queen Anne\'s': 'Queene Anne', 'Maryland:Allegany': 'Alleghany', 'Delaware:New Castle': 'Newcastle',
  'North Carolina:Tyrrell': 'Tyrrel', 'North Carolina:Edgecombe': 'Edgecomb', 'North Carolina:Johnston': 'Johnson', 'North Carolina:Cabarrus': 'Cabarras',
  'South Carolina:Williamsburg': 'Williamsburgh', 'South Carolina:Marlboro': 'Marlborough', 'South Carolina:Orangeburg': 'Orangeburgh', 'South Carolina:Spartanburg': 'Spartanburgh',
  'Georgia:Columbia': 'Columbus', 'Georgia:Screven': 'Scriven', 'Georgia:Bulloch': 'Bullock', 'Georgia:Clarke': 'Clark', 'Georgia:DeKalb': 'De Kalb', 'Georgia:Brooks': 'Brooke', 'Georgia:Tattnall': 'Tatnall',
  'Florida:Lafayette': 'La Fayette', 'Florida:St. Johns': "St. John's", 'Alabama:DeKalb': 'De Kalb',
  'Mississippi:DeSoto': 'De Soto', 'Mississippi:Yalobusha': 'Yalabusha', 'Mississippi:Clarke': 'Clark',
  'Louisiana:St. John the Baptist': 'St. John the Bap\'t', 'Louisiana:Terrebonne': 'Terre Bonne', 'Louisiana:St. Mary': "St. Mary's", 'Louisiana:St. Martin': "St. Martin's",
  'Louisiana:Vermilion': 'Vermillion', 'Louisiana:East Baton Rouge': 'Baton Rouge, E.', 'Louisiana:West Baton Rouge': 'Baton Rouge, W.',
  'Louisiana:West Feliciana': 'Feliciana, W.', 'Louisiana:East Feliciana': 'Feliciana, E.', 'Louisiana:Pointe Coupee': 'Point Coupee', 'Louisiana:Ouachita': 'Ouichita',
  'Tennessee:Humphreys': 'Humphrey', 'Kentucky:Edmonson': 'Edmondson', 'Kentucky:Green': 'Greene', 'Kentucky:LaRue': 'La Rue', 'Kentucky:Muhlenberg': 'Muhlenburg', 'Kentucky:Rockcastle': 'Rock Castle',
  'Missouri:St. Francois': 'St. FranÃ§ois', 'Missouri:DeKalb': 'De Kalb', 'Texas:DeWitt': 'De Witt', 'Kansas:Wyandotte': 'Wyandott',
  'New Mexico Territory:Santa Fe': 'Santa FÃ©', 'New Mexico Territory:Dona Ana': 'DoÃ±a Anna', 'New Mexico Territory:Rio Arriba': 'Ri Ariba', 'New Mexico Territory:Arizona': 'Arizonia',
  'New Mexico Territory:Santa Ana': 'Santa Ana', 'New Mexico Territory:San Miguel': 'San Miguel',
};
// Counties the pack lists that were created after the 1860 enumeration: their people sit in parent counties in Kennedy.
const POST1860 = new Set(['North Carolina:Transylvania', 'North Carolina:Clay', 'North Carolina:Mitchell', 'Florida:Polk', 'Missouri:Worth', 'Texas:Wilson', 'Kentucky:Wolfe']);
// District of Columbia is printed as three lines.
const DC_ROWS = ['Georgetown', 'Washington', 'Remainder of District'];

const reg = parse(fs.readFileSync('../../world/regions.csv', 'utf8'));
const rh = reg[0];
const idI = rh.indexOf('id'), coI = rh.indexOf('counties');

const cty = parse(fs.readFileSync('kennedy-county-1860.csv', 'utf8'));
const ch = cty[0];
const col = (n) => ch.indexOf(n);
const byKey = new Map();
const statesRead = new Set();
for (const r of cty.slice(1)) {
  const st = r[col('state')], co = r[col('county')];
  statesRead.add(norm(st));
  if (co === '__STATE_TOTAL__') continue;
  const key = k(st, co);
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(r);
}
const sum = parse(fs.readFileSync('kennedy-state-summary-1860.csv', 'utf8'));
const sh = sum[0];
const summary = new Map();
for (const r of sum.slice(1)) summary.set(norm(r[0]), r);

function keysFor(st, co) {
  if (st === 'District of Columbia') return DC_ROWS.map((n) => k(st, n));
  const a = ALIASES[st + ':' + co];
  return [k(st, a || co)];
}

// First pass: which county rows does any region claim?
const claimed = new Map();
const wildcardStates = new Map();
for (const r of reg.slice(1)) {
  for (const it of r[coI].split(';').map((s) => s.trim()).filter(Boolean)) {
    const i = it.indexOf(':');
    const st = it.slice(0, i), co = it.slice(i + 1);
    if (co.includes('*')) { (wildcardStates.get(norm(st)) || wildcardStates.set(norm(st), []).get(norm(st))).push(r[idI]); continue; }
    if (/\(part/i.test(co) || POST1860.has(st + ':' + co)) continue;
    for (const key of keysFor(st, co)) {
      if (!claimed.has(key)) claimed.set(key, []);
      claimed.get(key).push(r[idI]);
    }
  }
}

const header = ['region_id', 'enslaved_1860', 'free_1860', 'aggregate_1860', 'counties_included', 'kennedy_citation', 'mapping_note', 'status'];
const out = [header.join(',')];
const used = new Set();
const cite = (h) => h[col('state')] + ' Table 2 p.' + h[col('page')] + ' leaf n' + h[col('leaf')];
for (const r of reg.slice(1)) {
  const id = r[idI];
  const items = r[coI].split(';').map((s) => s.trim()).filter(Boolean);
  let slave = 0, free = 0, agg = 0, freeKnown = true;
  let incomplete = false;
  const names = [], pages = new Set(), notes = [], issues = [];
  for (const it of items) {
    const i = it.indexOf(':');
    const st = it.slice(0, i), co = it.slice(i + 1);
    names.push(it);
    const sumRow = summary.get(norm(st));
    if (co.includes('*')) {
      // whole state, or the remainder of a state after the counties other regions claim
      if (statesRead.has(norm(st))) {
        let s2 = 0, f2 = 0, a2 = 0, nr = 0;
        for (const [key, rows] of byKey) {
          if (!key.startsWith(norm(st) + '|') || claimed.has(key)) continue;
          for (const h of rows) {
            if (h[col('total_slave')] === '') { nr++; continue; }
            s2 += Number(h[col('total_slave')]); f2 += Number(h[col('total_free')]); a2 += Number(h[col('aggregate')]);
            pages.add(cite(h));
          }
        }
        slave += s2; free += f2; agg += a2;
        notes.push('remainder of ' + st + ' after the counties other regions claim' + (nr ? ' (' + nr + ' counties print "no return" and are not counted)' : ''));
      } else if (sumRow) {
        slave += Number(sumRow[5]);
        if (wildcardStates.get(norm(st)).length === 1 && !items.some((x) => x.startsWith(st + ':') && !x.includes('*'))) {
          free += Number(sumRow[2]); agg += Number(sumRow[6]);
          pages.add('state summary Recapitulation pp. 598-599 leaves n717-n718');
          notes.push(st + ' whole state from the Recapitulation (no county table read)');
        } else {
          freeKnown = false;
          pages.add('state summary Recapitulation pp. 598-599 leaves n717-n718');
          notes.push(st + ': enslaved from the Recapitulation (free state: dotted slave cell); free population not split by region (no county table read)');
        }
      } else { incomplete = true; issues.push('no-summary-row:' + st); }
      continue;
    }
    if (/\(part/i.test(co)) {
      const base = co.replace(/\s*\(part.*$/i, '');
      const hit = byKey.get(k(st, ALIASES[st + ':' + base] || base));
      notes.push('part of ' + base + ' county: not separable from county tables' + (hit ? ' (whole county: ' + hit[0][col('total_slave')] + ' enslaved)' : ''));
      issues.push('part-county:' + co);
      continue;
    }
    if (POST1860.has(st + ':' + co)) {
      notes.push(co + ' was created after the 1860 enumeration: its people are inside parent counties in Kennedy');
      issues.push('post-1860-county:' + co);
      continue;
    }
    if (!statesRead.has(norm(st))) {
      // free state: no county table read; the Recapitulation prints a dotted (zero) slave cell
      if (sumRow && Number(sumRow[5]) === 0) { freeKnown = false; pages.add('state summary Recapitulation pp. 598-599 leaves n717-n718'); continue; }
      incomplete = true; issues.push('no-county-table:' + st + ':' + co); continue;
    }
    const keys = keysFor(st, co);
    for (const key of keys) {
      used.add(key);
      const hit = byKey.get(key);
      if (!hit) { incomplete = true; issues.push('unmatched:' + st + ':' + co); continue; }
      if (hit.length > 1) { incomplete = true; issues.push('ambiguous:' + st + ':' + co); continue; }
      const h = hit[0];
      if (h[col('total_slave')] === '') { issues.push('no-return:' + st + ':' + co + ' (county printed "no return": no figures, not counted)'); continue; }
      if (h[col('flags')]) issues.push('input-flag:' + st + ':' + co);
      slave += Number(h[col('total_slave')]); free += Number(h[col('total_free')]); agg += Number(h[col('aggregate')]);
      pages.add(cite(h));
      const cl = claimed.get(key);
      if (cl && cl.length > 1) issues.push('county-split:' + co + ' also in ' + cl.filter((x) => x !== id).join('/'));
    }
  }
  const allFreeState = !freeKnown && items.every((x) => !statesRead.has(norm(x.slice(0, x.indexOf(':')))));
  let status;
  if (incomplete) status = 'INCOMPLETE:' + issues.join(' | ');
  else if (issues.length) status = 'sum-with-caveats:' + issues.join(' | ');
  else status = allFreeState ? 'free-state-zero (Recapitulation)' : 'county-sum';
  out.push([
    id,
    String(slave),
    freeKnown ? String(free) : '',
    freeKnown ? String(agg) : '',
    names.join('; '),
    'Kennedy, Population of the United States in 1860 (1864), archive.org populationofusin00kennrich: ' + [...pages].join('; '),
    notes.join(' | '),
    status,
  ].map(csvCell).join(','));
}
fs.writeFileSync('enslaved-1860-by-region.csv', out.join('\n') + '\n');

const unclaimed = [...byKey.keys()].filter((x) => !used.has(x) && !claimed.has(x));
const rep = [];
rep.push('regions: ' + (reg.length - 1));
rep.push('county rows read: ' + [...byKey.values()].reduce((a, v) => a + v.length, 0));
rep.push('county rows claimed by no region (accounted for by a wildcard region only if its state has one): ' + unclaimed.length);
rep.push(...unclaimed.map((x) => '  ' + x));
// accounting: how many times each county row is counted across regions
for (const [key, rows] of byKey) { const st = key.split('|')[0]; const times = (claimed.get(key) || []).length || (wildcardStates.has(st) ? 1 : 0); if (times !== 1) rep.push('  counted ' + times + 'x: ' + key + ' (enslaved ' + rows.map((h) => h[col('total_slave')]).join('/') + ')'); }
fs.writeFileSync('aggregate-report.txt', rep.join('\n') + '\n');
console.log(rep.slice(0, 3).join('\n'));



