const fs = require('fs');
const dir = 'C:/Users/User/AppData/Local/Temp/claude/4d87ab6d8ae0089a/9b5270b2-8d26-4ceb-8899-4a7cb8486063/scratchpad/gaps/resource/';
const cells = JSON.parse(fs.readFileSync(dir + '../../residual.json', 'utf8'));
const byPerson = new Map();
for (const c of cells) { (byPerson.get(c.person) ?? byPerson.set(c.person, []).get(c.person)).push(c); }
const people = [...byPerson.keys()].sort();
const N = 5; const per = Math.ceil(cells.length / N);
let b = 10, cur = [], n = 0;
const flush = () => {
  if (!cur.length) return;
  const head = '# Batch rs' + b + ' (second round; ' + cur.length + ' cells)\n\nperson | cell | class | the cell as it stands\n---|---|---|---\n';
  fs.writeFileSync(dir + `batch${b}.md`, head + cur.map((c) => `${c.person} | ${c.cell} | ${c.class} | ${c.cur}`).join('\n') + '\n');
  console.log('batch' + b, cur.length);
  b++; cur = [];
};
for (const p of people) {
  const cs = byPerson.get(p);
  if (cur.length + cs.length > per + 4 && cur.length) flush();
  cur.push(...cs);
}
flush();
