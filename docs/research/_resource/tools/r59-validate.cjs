// Read-only validation of the R59 research delivery, not an apply of pack data.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const resource = path.dirname(__dirname);
const evidence = path.join(resource, 'evidence-r59');
const csvModule = { exports: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'csvlib.js'), 'utf8'), { exports: csvModule.exports });
const parse = csvModule.exports.parse;
const text = fs.readFileSync(path.join(resource, 'rs15.csv'), 'utf8');
assert(!text.startsWith('\uFEFF'), 'no BOM');
assert(!text.includes(';'), 'no semicolon separators in reader cells');
const rows = parse(text);
assert.equal(rows.shift().join(','), 'person,cell,decision,proposed_direction,citations,basis,prior_value');
const input = parse(fs.readFileSync(path.join(evidence, 'input-held-judgments.csv'), 'utf8'));
input.shift();
const inputMap = new Map(input.map(r => [r[0] + '/' + r[1], r[2]]));
assert.equal(inputMap.size, 189);
assert.equal(rows.length, inputMap.size);
const sources = JSON.parse(fs.readFileSync(path.join(evidence, 'sources.json'), 'utf8'));
const allowed = new Set(sources.records.map(r => r.key));
const stats = JSON.parse(fs.readFileSync(path.join(evidence, 'counts.json'), 'utf8'));
const totals = {KEEP: 0, CHANGE: 0, HOLD: 0};
const byPerson = {}, byField = {};
const seen = new Set();
const fifteen = new Set('buchanan_franklin cooper_samuel crittenden_george_b ewell_richard_s gorgas_josiah holmes_theophilus_h johnston_albert_s johnston_joseph_e lee_robert_e longstreet_james loring_william_w magruder_john_b pemberton_john_c smith_edmund_k stuart_james_e_b'.split(' '));
for (const row of rows) {
  assert.equal(row.length, 7);
  const [person, cell, decision, direction, citations, basis, prior] = row;
  const id = person + '/' + cell;
  assert(inputMap.has(id), 'only R51 held cells: ' + id);
  assert(!seen.has(id), 'no duplicate: ' + id); seen.add(id);
  assert.equal(prior, inputMap.get(id), 'exact R51 prior: ' + id);
  assert(!fifteen.has(person), 'R49 officers excluded');
  assert(Object.hasOwn(totals, decision)); totals[decision]++;
  assert(basis.includes('[I]'), 'inference label: ' + id);
  assert(basis.length > 50);
  for (const [obj, key] of [[byPerson,person], [byField,cell.split(':')[0]]]) {
    obj[key] ??= {KEEP:0, CHANGE:0, HOLD:0}; obj[key][decision]++;
  }
  if (decision === 'HOLD') {
    assert.equal(direction, ''); assert.equal(citations, '');
  } else {
    assert(direction && citations);
    assert(!/BATES-D|WELLES-D1-RETRO|APPLETONS|Heitman|Cullum/.test(citations));
    const priorDirection = cell.startsWith('regard_others:') ? prior.split(':')[1] : prior.split(':')[0];
    if (decision === 'KEEP') assert.equal(direction, priorDirection);
    for (const cite of citations.split('+')) {
      assert(allowed.has(cite.split(' ')[0]), 'declared source: ' + cite);
      assert(/\bp\d+/.test(cite), 'page locator: ' + cite);
      const date = cite.match(/ dated (\d{4}(?:-\d{2})?(?:-\d{2})?)$/)?.[1];
      assert(date, 'explicit date or bound: ' + cite);
      const latest = date.length === 4 ? date + '-12-31' : date.length === 7 ? date + '-31' : date;
      assert(latest < '1861-03-05', 'entire date bound precedes R59 cutoff: ' + cite);
    }
  }
}
assert.equal(rows.find(r => r[0] === 'lincoln_abraham' && r[1] === 'reputation')[2], 'HOLD');
assert.equal(rows.find(r => r[0] === 'dana_charles_a' && r[1] === 'trait:antislavery')[2], 'HOLD');
for (const key of Object.keys(totals)) assert.equal(totals[key], stats[key]);
for (const [key, counts] of Object.entries(byPerson)) for (const d of Object.keys(totals)) assert.equal(counts[d], stats.by_person[key][d] || 0);
for (const [key, counts] of Object.entries(byField)) for (const d of Object.keys(totals)) assert.equal(counts[d], stats.by_field[key][d] || 0);
assert.equal(Object.keys(byPerson).length, 105);
const heldBlocs = parse(fs.readFileSync(path.join(evidence, 'input-held-blocs.csv'), 'utf8'));
assert.equal(heldBlocs.length-1, 60);
assert.equal(stats.bloc_changes_proposed, 0);
let files = 0;
for (const record of sources.records) for (const f of record.retained_files) {
  const content = fs.readFileSync(path.join(sources.source_root,f.name));
  assert.equal(content.length,f.bytes);
  assert.equal(crypto.createHash('sha256').update(content).digest('hex'),f.sha256);
  if (f.name.endsWith('.jpg')) assert.equal(content.subarray(0,2).toString('hex'),'ffd8');
  files++;
}
const doc = fs.readFileSync(path.join(resource,'rs15.md'),'utf8');
assert(!doc.includes('<!-- R59_COUNT_TABLES -->'), 'count tables inserted');
assert(doc.includes(fs.readFileSync(path.join(evidence,'count-tables.md'),'utf8').trim()));
assert(doc.trim().endsWith("This delivery changes no pack, generated file, signed item, rule, test, dependency or other run's files."));
console.log(JSON.stringify({verdict:'PASS',rows:rows.length,people:Object.keys(byPerson).length,...totals,sourceFileReferencesVerified:files,blocs:heldBlocs.length-1,physicalPackWrites:0}));
