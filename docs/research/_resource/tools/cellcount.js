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
const REF = /^(NEW:)?(NavyReg|ArmyReg|BDAC|Heitman|Callahan|Wright|Cullum|Dyer|CongDir|APPLETONS|AAC)/i;
const tot = { KEEP: 0, CHANGE: 0, HOLD: 0, n: 0 };
const bad = [];
for (let k = 1; k <= 6; k++) {
  const rows = parse(fs.readFileSync(dir + `rs${k}.csv`, 'utf8'));
  const h = rows[0];
  const ix = (n) => h.indexOf(n);
  let n = 0;
  for (const r of rows.slice(1)) {
    if (r.length < h.length) continue;
    n++;
    const dec = r[ix('decision')];
    tot[dec] = (tot[dec] || 0) + 1; tot.n++;
    if (dec === 'HOLD') continue;
    // the new citations may carry an inline "x:" direction prefix; split on + and strip
    const cites = r[ix('citations')].split('+').map((s) => s.trim().replace(/^[a-z_]+:/, '')).filter(Boolean);
    if (cites.length > 0 && cites.every((s) => REF.test(s))) bad.push(`rs${k} ${r[ix('person')]} ${r[ix('cell')]} ${dec}: ${r[ix('citations')].slice(0, 90)}`);
    if (cites.length === 0) bad.push(`rs${k} ${r[ix('person')]} ${r[ix('cell')]} ${dec}: NO CITATIONS`);
  }
  console.log('rs' + k, n);
}
console.log(JSON.stringify(tot));
console.log(bad.join('\n'));
