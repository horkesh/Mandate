/** S27: a keyboard player. No kernel, World, State, runner, pack-data or menu
 * imports. All observations and selectors come from play.ts stdout. */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, process.env.S27_EVIDENCE_DIR ?? 'runs/s27');
mkdirSync(output, { recursive: true });
const historical = {
  sumter_garrison: ['provision_notice'], pickens_reinforcement: ['land_company'],
  confederate_commissioners: ['hold_and_talk'], lamon_promise: ['assure_notice'],
  seward_memorandum: ['answer_in_person'], pickens_refused: ['courier_order', 'special_expedition'],
  virginia_unionists: ['offer_fort'], call_for_troops: ['militia_call'],
  blockade_or_closure: ['blockade'], gosport_yard: ['defend'],
  washington_cut_off: ['around_baltimore'], habeas_on_the_line: ['suspend_on_line'],
  missouri_arsenal: ['back_lyon'], kentucky_neutrality: ['arm_quietly', 'wait'],
  fort_monroe_arrivals: ['approve_holding'], western_virginia: ['cross_river', 'recognise'],
  special_session: ['ask_war_footing'], mcdowell_advance: ['advance_now'],
};

export function situations(lines) {
  const result = new Map();
  let current;
  for (const line of lines) {
    const head = /^(\w+): (.+) \((open|waiting), before you since day (\d+)\)$/.exec(line);
    if (head) { current = { id: head[1], title: head[2], status: head[3], since: Number(head[4]), options: [] }; result.set(current.id, current); }
    const option = /^  - (\w+): (.*)$/.exec(line);
    if (option && current) current.options.push({ id: option[1], label: option[2] });
  }
  return result;
}

export class Keyboard {
  constructor(name) {
    this.name = name; this.buffer = ''; this.stderr = ''; this.records = []; this.date = null;
    this.base = join(output, name);
    writeFileSync(`${this.base}.txt`, ''); writeFileSync(`${this.base}.ndjson`, '');
    this.child = spawn(process.execPath, ['--import', 'tsx', 'packages/cli/src/play.ts', 'union-1861'], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
    this.child.stdout.setEncoding('utf8'); this.child.stderr.setEncoding('utf8');
    this.child.stdout.on('data', data => { this.buffer += data; this.flush(); });
    this.child.stderr.on('data', data => { this.stderr += data; });
    this.child.on('error', error => this.pending?.reject(error));
    this.child.on('close', (code, signal) => {
      this.exit = { code, signal }; writeFileSync(`${this.base}.stderr.txt`, this.stderr);
      if (this.pending?.command === 'quit') this.finish();
      else this.pending?.reject(new Error(`Console exited: ${JSON.stringify(this.exit)} ${this.stderr}`));
    });
  }
  flush() { if (this.pending && this.buffer.endsWith('> ')) this.finish(); }
  finish() {
    const pending = this.pending; if (!pending) return;
    clearTimeout(pending.timer); this.pending = null;
    const raw = this.buffer; this.buffer = '';
    const text = raw.endsWith('> ') ? raw.slice(0, -2) : raw;
    const lines = text.replace(/\r/g, '').split('\n'); if (lines.at(-1) === '') lines.pop();
    const before = this.date;
    for (const line of lines) { const date = /^=== (\d{4}-\d\d-\d\d)/.exec(line); if (date) this.date = date[1]; }
    const record = { index: this.records.length, command: pending.command, dateBefore: before, dateAfter: this.date, lines };
    this.records.push(record);
    appendFileSync(`${this.base}.ndjson`, `${JSON.stringify(record)}\n`);
    appendFileSync(`${this.base}.txt`, `${pending.command === null ? '' : `> ${pending.command}\n`}${lines.join('\n')}\n`);
    pending.resolve(lines);
  }
  read(command = null) {
    if (this.pending) throw new Error('Only one keyboard command may be pending.');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.child.kill(); reject(new Error(`Console did not answer ${command} in 60 seconds`)); }, 60_000);
      this.pending = { command, resolve, reject, timer };
      if (command !== null) this.child.stdin.write(`${command}\n`);
      if (command === 'quit') this.child.stdin.end();
      this.flush();
    });
  }
}

function summary(p, extra = {}) {
  const lines = p.records.flatMap(r => r.lines);
  return { name: p.name, date: p.date, exit: p.exit, records: p.records.length,
    turns: p.records.filter(r => r.command === 'end').length,
    days: lines.filter(l => /^--- /.test(l)).length,
    commands: p.records.filter(r => r.command !== null).map(r => r.command),
    rejectedAtConsole: p.records.filter(r => /^(order|decide|approve|sendback|edit|call|go|relieve|appoint|inquire|consult|audience|address|pressure|promise|transfer|observer|delegate) /.test(r.command ?? '') && !r.lines[0]?.startsWith('Queued ')),
    refusedWhenSent: p.records.flatMap(r => r.lines.filter(l => l.includes('Refused:')).map(line => ({ record: r.index, date: r.dateBefore, line }))),
    stops: Object.fromEntries([...new Set(lines.filter(l => l.startsWith('The turn stops:')))].map(stop => [stop, lines.filter(l => l === stop).length])),
    ...extra };
}

async function preflight() {
  const p = new Keyboard('preflight');
  try {
    await p.read();
    for (const c of ['help', 'posts', 'situations', 'plans', 'enemy', 'end', 'situations', 'inbox', 'quit']) await p.read(c);
    const result = summary(p, { node: process.version, npmCi: { exit: 0, added: 51, audited: 56, vulnerabilities: 0, evidence: 'Initial tool command output; recorded here after installation.' } });
    writeFileSync(join(output, 'preflight.json'), `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result, null, 2));
    if (p.exit?.code !== 0 || !p.records[0].lines.some(l => l.includes('lincoln')) || !p.records.find(r => r.command === 'posts').lines.some(l => l.startsWith('us_dc_militia: '))) throw new Error('Opening or selector precondition failed.');
  } finally { if (!p.exit) p.child.kill(); }
}

async function play(name) {
  const p = new Keyboard(name); const chosen = new Map(); const omissions = new Set(); const actions = [];
  let advanced = false, bypassed = false, lastReliefMonth = '', reliefs = 0;
  const relievedPosts = new Set();
  const started = Date.now();
  try {
    await p.read(); await p.read('help');
    for (let turn = 0; turn < 160 && p.date <= '1861-07-31'; turn++) {
      const date = p.date;
      const offered = situations(await p.read('situations'));
      const posts = await p.read('posts');
      const plans = await p.read('plans');
      // Reading the press is separate from responding. This strategy never
      // opens the inbox and never decides/delegates the congressional paper.
      if (name !== 'ignore-press-congress') await p.read('inbox');
      await p.read('enemy');
      for (const [id, s] of offered) {
        if (s.status !== 'open') continue;
        if (id === 'special_session' && name === 'ignore-press-congress') { omissions.add(id); continue; }
        if (id === 'call_for_troops' && name === 'cautious' && date < '1861-05-01') { omissions.add(`${date}: delayed troop call`); continue; }
        let wanted = historical[id];
        if (!wanted) { omissions.add(`No scripted choice for ${id}`); continue; }
        if (id === 'mcdowell_advance' && name === 'cautious') {
          const defer = s.options.find(o => /wait|delay|prepare|defer/i.test(`${o.id} ${o.label}`));
          if (defer) wanted = [defer.id]; else { omissions.add(`${date}: decline advance`); continue; }
        }
        const previous = chosen.get(id) ?? new Set();
        if (wanted.every(o => s.options.some(option => option.id === o)) && wanted.some(o => !previous.has(o))) {
          const command = `decide ${id} ${wanted.filter(o => !previous.has(o)).join(' ')}`;
          const response = await p.read(command);
          if (response[0]?.startsWith('Queued ')) {
            wanted.forEach(o => previous.add(o)); chosen.set(id, previous);
            actions.push({ date, command });
          }
        }
      }
      const wantAdvance = name === 'aggressive' ? date >= '1861-04-01' : name !== 'cautious' && chosen.has('mcdowell_advance');
      if (wantAdvance && !advanced && posts.some(l => l.startsWith('us_dc_militia: '))) {
        const command = 'order us_dc_militia take manassas review';
        await p.read(command); actions.push({ date, command }); advanced = true;
      }
      if (advanced && !bypassed && p.records.slice(-30).some(r => r.lines.some(l => l.includes('objects to the order')))) {
        const command = 'order us_dc_militia take manassas review bypass';
        await p.read(command); actions.push({ date, command }); bypassed = true;
      }
      for (const line of plans) {
        const review = /^(\w+) \(.+\) submits a plan for your review:$/.exec(line);
        if (review) { const command = `approve ${review[1]}`; await p.read(command); actions.push({ date, command }); }
        const awaitWord = /^(\w+): prepared, waiting for your word/.exec(line);
        if (awaitWord) { const command = `go ${awaitWord[1]}`; await p.read(command); actions.push({ date, command }); }
      }
      if (name === 'frequent-relief' && date >= '1861-04-01' && date.slice(0, 7) !== lastReliefMonth) {
        const held = posts.map(l => /^(us_(?:dc_militia|fort_monroe|fort_pickens|general_in_chief|dept_new_mexico)): (\w+)/.exec(l))
          .find(match => match && !relievedPosts.has(match[1]));
        if (held) {
          const command = `relieve ${held[1]} outright`;
          await p.read(command);
          actions.push({ date, command, holder: held[2] });
          relievedPosts.add(held[1]); reliefs++; lastReliefMonth = date.slice(0, 7);
        }
      }
      await p.read('queue');
      const turnOutput = await p.read('end');
      if (p.date <= date) throw new Error(`Turn failed to advance ${date}`);
      if (turnOutput.filter(l => /^--- /.test(l)).length > 7) throw new Error('Turn ran longer than seven days.');
      if (p.date.slice(0, 7) !== date.slice(0, 7)) console.log(`${name}: reached ${p.date}`);
    }
    if (p.date <= '1861-07-31') throw new Error('160-turn bound reached before July ended.');
    await p.read('situations'); await p.read('posts'); await p.read('plans'); await p.read('enemy');
    if (name !== 'ignore-press-congress') await p.read('inbox all');
    await p.read('quit');
    const result = summary(p, { elapsedMs: Date.now() - started, actions, omissions: [...omissions], reliefs });
    writeFileSync(`${p.base}.json`, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify({ name, date: p.date, turns: result.turns, days: result.days, exit: p.exit, rejected: result.rejectedAtConsole.length, refused: result.refusedWhenSent.length, elapsedMs: result.elapsedMs }));
  } catch (error) {
    writeFileSync(`${p.base}.failure.json`, `${JSON.stringify(summary(p, { error: String(error), stack: error.stack }), null, 2)}\n`); throw error;
  } finally { if (!p.exit) p.child.kill(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--preflight')) await preflight();
  else for (const name of process.argv.slice(2).length ? process.argv.slice(2) : ['historical', 'cautious', 'aggressive', 'frequent-relief', 'ignore-press-congress']) await play(name);
}
