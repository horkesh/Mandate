// List the cells still warned no-contemporary-leg and write them out for a second re-sourcing round.
const fs = require('fs');
const { parse } = require('./csvlib.js');
const root = (process.env.PACK_ROOT || '.').replace(/\\/g, '/').replace(/\/?$/, '/'); // a worktree holding packs/ and docs/research/_resource/
const lines = JSON.parse(fs.readFileSync(root + 'issues.tmp.json', 'utf8'));
const rows = parse(fs.readFileSync(root + 'packs/union-1861/source/world/people.csv', 'utf8'));
const H = rows[0]; const byId = new Map(rows.slice(1).map((r) => [r[0], r]));
const cells = []; const unparsed = [];
for (const l of lines) {
  const m = l.match(/\(row \d+ \((\w+)\), column (\w+)\): (.*?) rests on no contemporary leg/);
  if (!m) { unparsed.push(l.slice(0, 160)); continue; }
  const [, id, col, what] = m;
  const row = byId.get(id);
  let cell = col, cur = row[H.indexOf(col)];
  let q;
  if (col === 'traits' && (q = what.match(/trait "(\w+)"/))) { cell = 'trait:' + q[1]; cur = cur.split(';').find((s) => s.startsWith(q[1] + ':')) || cur; }
  else if (col === 'values' && (q = what.match(/value "(\w+)"/))) { cell = 'value:' + q[1]; cur = cur.split(';').find((s) => s.startsWith(q[1] + ':')) || cur; }
  else if (col === 'regard_others' && (q = what.match(/regard toward (\w+)/))) { cell = 'regard_others:' + q[1]; cur = cur.split(';').find((s) => s.startsWith(q[1] + ':')) || cur; }
  else if (col === 'bloc') { cell = 'bloc'; cur = row[H.indexOf('bloc')] + ' | ' + row[H.indexOf('bloc_cites')]; }
  cells.push({ person: id, cell, class: ['competence', 'nerve'].includes(cell) || /^trait:(slow|rank_proud|joint_minded|organiser|micromanages|intrigues|quarrelsome|ambitious|insubordinate|disdains_superiors|shifts_blame|self_doubting|holds_grudges)$/.test(cell) ? 'innate' : 'start', cur });
}
console.log('warned', lines.length, 'parsed', cells.length, 'unparsed', unparsed.length);
for (const u of unparsed.slice(0, 5)) console.log(u);
const kinds = {}; for (const c of cells) { const k = c.cell.split(':')[0]; kinds[k] = (kinds[k] || 0) + 1; }
console.log(kinds);
const people = new Set(cells.map((c) => c.person)); console.log('people', people.size);
fs.writeFileSync(process.env.OUT_JSON, JSON.stringify(cells, null, 1));
