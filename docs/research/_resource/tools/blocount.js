const fs = require('fs');
const dir = 'C:/Pyrrhic/ByOrderOfThePresident/.claude/worktrees/research-1861-leads/docs/research/_resource/';
function parse(text) {
  const rows = []; let row = [], c = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(c); c = ''; }
    else if (ch === '\n') { row.push(c.replace(/\r$/, '')); rows.push(row); row = []; c = ''; }
    else c += ch;
  }
  if (c !== '' || row.length) { row.push(c); rows.push(row); }
  return rows;
}
const REF = /^(NEW:)?(NavyReg|ArmyReg|BDAC|Heitman|Callahan|Wright|Cullum|Dyer|CongDir)/;
const tally = {};
const refOnly = [];
for (const f of ['rs7.csv', 'rs8.csv', 'rs9.csv']) {
  const rows = parse(fs.readFileSync(dir + f, 'utf8'));
  const h = rows[0];
  const ix = (n) => h.indexOf(n);
  for (const r of rows.slice(1)) {
    if (r.length < h.length) continue;
    const prior = r[ix('prior_bloc')] || r[ix('bloc')];
    const dec = r[ix('decision')];
    const proposed = r[ix('proposed_bloc')];
    const cites = r[ix('bloc_cites')].split('+').map((s) => s.trim()).filter(Boolean);
    const refOnlyCites = cites.length > 0 && cites.every((s) => REF.test(s));
    const key = prior;
    (tally[key] ??= { KEEP: 0, CHANGE: 0, HOLD: 0, keepOnRefOnly: 0, changeOnRefOnly: 0, n: 0 });
    tally[key].n++;
    tally[key][dec]++;
    if (dec === 'KEEP' && refOnlyCites) { tally[key].keepOnRefOnly++; refOnly.push(r[ix('person')] + ' ' + key); }
    if (dec === 'CHANGE') {
      if (refOnlyCites) tally[key].changeOnRefOnly++;
      (tally._changes ??= []).push(`${r[ix('person')]}: ${key} -> ${proposed}`);
    }
  }
}
console.log(JSON.stringify(tally, null, 1));
console.log('KEEP resting only on reference works:', refOnly.length);
