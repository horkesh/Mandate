/** Summarize retained stdout, without opening a pack or game object. Run after
 * s27-console-playtests.mjs. Full transcripts remain in ignored runs/s27/. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { writingCandidates } from './writing-screen.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const dir = join(root, 'runs/s27');
const names = ['historical', 'cautious', 'aggressive', 'frequent-relief', 'ignore-press-congress'];
const strategies = [];
const prose = new Set();
for (const name of names) {
  const text = readFileSync(join(dir, `${name}.ndjson`), 'utf8');
  const records = text.trim().split('\n').map(JSON.parse);
  const summary = JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
  const observed = [];
  for (const record of records) {
    if (record.dateBefore > '1861-07-31') continue;
    let date = record.dateBefore ?? '1861-03-06';
    record.lines.forEach((line, offset) => {
      const header = /^(?:---|===) (\d{4}-\d\d-\d\d)/.exec(line);
      if (header) date = header[1];
      if (date <= '1861-07-31') observed.push({ record: record.index, offset, command: record.command, date, text: line });
    });
  }
  const daily = observed.filter(x => x.command === 'end');
  const writing = new Map();
  for (const item of observed) {
    const line = item.text.trim();
    if (!/^(day\s+\d+|===|---)/.test(line)) prose.add(line);
    const categories = [];
    if (/\babout situation \w+/.test(line) && !/advice\//.test(line)) categories.push('claimless-situation-report');
    if (/\| recommends \S+ \([^)]*_[^)]*\)/.test(line)) categories.push('internal-advice-reasons');
    if (/\b(?:comply_with_reservations|slow_walk|awaiting-strength|effective-strength)\b/.test(line)) categories.push('technical-status-or-claim');
    if (/\bfort-surrendered 0\b/.test(line)) categories.push('raw-event-scalar');
    for (const category of categories) {
      const key = `${category}\0${line}`;
      const row = writing.get(key) ?? { category, text: line, locations: [] };
      row.locations.push([item.record, item.offset]); writing.set(key, row);
    }
  }
  const bandEvents = {};
  for (const item of daily) {
    const notice = /about situation (\w+)/.exec(item.text);
    if (notice) (bandEvents[notice[1]] ??= []).push({ date: item.date, record: item.record, offset: item.offset });
  }
  const last = command => records.filter(r => r.command === command && r.dateBefore <= '1861-07-31').at(-1);
  strategies.push({ name, rawTranscript: `runs/s27/${name}.txt`, rawRecords: `runs/s27/${name}.ndjson`,
    rawRecordsSha256: createHash('sha256').update(text).digest('hex'),
    exit: summary.exit, elapsedMs: summary.elapsedMs, turnsIncludingFinalTurn: summary.turns,
    daysThroughJuly: daily.filter(x => x.text.startsWith('--- ')).length,
    firstMorning: records[0].lines.find(l => l.startsWith('=== ')),
    finalMorningIncludingOverrun: summary.date,
    throughJulyOutputLines: observed.length, uniqueOutputLines: new Set(observed.map(x => x.text)).size,
    deliveredReportLinesThroughJuly: daily.filter(x => /^\s*day\s+\d+/.test(x.text)).length,
    hourStampedDispatchesThroughJuly: daily.filter(x => /wire-dispatch.* at \d\d:00/.test(x.text)).length,
    actions: summary.actions, omissions: summary.omissions, stopsIncludingOverrun: summary.stops,
    rejected: summary.rejectedAtConsole, refused: summary.refusedWhenSent,
    lastPrintedPostsThroughJuly: last('posts'), lastPrintedPlansThroughJuly: last('plans'),
    lastPrintedSituationsThroughJuly: last('situations'),
    noticeLocationsThroughJuly: bandEvents,
    writingLocationsThroughJuly: [...writing.values()],
  });
}
const genericBans = writingCandidates([...prose]);
const supplemental = [];
const verbs = /^(order|approve|sendback|edit|go|call|decide|delegate|appoint|relieve|transfer|inquire|consult|audience|observer|promise|pressure|address)(?: |$)/;
for (const filename of readdirSync(dir).filter(f => /^(preflight|short-probe|survey-.*)\.ndjson$/.test(f)).sort()) {
  const records = readFileSync(join(dir, filename), 'utf8').trim().split('\n').map(JSON.parse);
  supplemental.push({ records: `runs/s27/${filename}`, commands: records.filter(r => r.command !== null).map(r => r.command),
    parserRejections: records.filter(r => verbs.test(r.command ?? '') && !r.lines[0]?.startsWith('Queued ')).map(r => ({ record: r.index, command: r.command, lines: r.lines })),
    sentRejections: records.flatMap(r => r.lines.map((text, offset) => ({ record: r.index, offset, text })).filter(x => x.text.includes('Refused:'))),
  });
}
writeFileSync(join(root, 'docs/playtests/s27-evidence.json'), `${JSON.stringify({
  base: 'bf6cc66c025a0567a991f1a94eb9ba20656f4004',
  scope: 'Console-visible evidence only. July output excludes later days within an overrun turn; a final morning in August is not July evidence.',
  locationConvention: 'record and offset are zero-based indices in each named NDJSON file. Writing rows enumerate all matching locations, including re-reading the same report.',
  writingAudit: { genericPatternCandidates: genericBans, manualTriadFindings: [],
    caution: 'S35: substantive policy labels are permitted. This candidate screen is not a proof of literary quality.', distinctNonReportLines: prose.size },
  strategies, supplemental,
}, null, 2)}\n`);
writeFileSync(join(dir, 'prose-for-reading.txt'), `${[...prose].sort().join('\n')}\n`);
console.log(JSON.stringify({ strategies: strategies.length, totalDaysThroughJuly: strategies.reduce((n, x) => n + x.daysThroughJuly, 0), nonReportLines: prose.size, genericPatternCandidates: genericBans.length }));
