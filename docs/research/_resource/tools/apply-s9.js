// Incremental S9 apply. Old rounds are never replayed; 0097's fifteen rows stay owned by service.
const { parse, serialise } = require('./csvlib.js');
const PACK = 'packs/union-1861/';
const RESEARCH = 'docs/research/_resource/';
const PEOPLE = PACK + 'source/world/people.csv';
const HELD = PACK + 'source/drafts/people/held-back-judgments-1861.csv';
const PROTECTED = new Set(['buchanan_franklin', 'cooper_samuel', 'crittenden_george_b', 'ewell_richard_s', 'gorgas_josiah', 'holmes_theophilus_h', 'johnston_albert_s', 'johnston_joseph_e', 'lee_robert_e', 'longstreet_james', 'loring_william_w', 'magruder_john_b', 'pemberton_john_c', 'smith_edmund_k', 'stuart_james_e_b']);
// S16: defer these whole people, rather than weaken their historical assertions.
// Keep their pre-S9 rows until the lead rules on the dated-value proposals in the hand-over.
const DEFERRED = new Set(['seward_william_h', 'walker_leroy_p']);
const PRESERVED = new Set([...PROTECTED, ...DEFERRED]);
const GATED = new Map([
  ['houston_samuel/value:slavery_defence', '0074 cost-only value; S9 explicitly requires a gate draft.'],
  ['clark_edward/value:state_autonomy', '0074 cause-of-secession placement; review the explicit companion slavery_defence HOLD before placing this value.'],
  ['sumner_charles/trait:antislavery', 'rs15 requests later review of this antislavery placement; draft for the gate under 0106.'],
  ['wilson_henry/trait:antislavery', 'rs15 requests later review of this antislavery placement; draft for the gate under 0106.'],
]);
// Only these documents are primary, not their containing biographies or retrospective narrative.
const SOURCES = [
  ['CHASE-LINCOLN-1861-DOC', 'Chase to Thaddeus Stevens, 9 January 1861, printed in R. B. Warden (1874), p377', 'expired-copyright', 'https://archive.org/details/slamonportlandchas00wardrich/page/n400', 'rs15; letter only, p377 dated 1861-01-09; Warden narrative excluded.'],
  ['STAT9-SCOTT-1848', 'Joint resolution of 9 March 1848, thanks of Congress to Scott and his troops, 9 Stat. 333', 'government-work', 'https://en.wikisource.org/wiki/Page:United_States_Statutes_at_Large_Volume_9.djvu/359', 'rs15; sections 1-2 of the resolution, p333 dated 1848-03-09; not an assessment of health in 1861.'],
  ['DIX-BANKERS-1861-DOC', 'Bank officers and directors resolution, printed in Morgan Dix, Memoirs of John Adams Dix (1883), vol. 1 pp363-364', 'expired-copyright', 'https://archive.org/details/memoirsofjohnada01dixm/page/363', 'rs15; quoted resolution only, bounded to January 1861. No day is supplied; surrounding biography excluded.'],
  ['HOUSTON-AUSTIN-1860-DOC', 'Sam Houston, Austin speech of 22 September 1860, printed in W. C. Crane (1884), pp599-610', 'expired-copyright', 'https://archive.org/details/lifeselectlitera00cran/page/n614', 'rs16; own speech only, pp599-600 and p602, dated by the heading on p599; narrative excluded.'],
  ['HOUSTON-LEGIS-1861-DOC', 'Sam Houston, Texas legislative message of 6 February 1861, printed in W. C. Crane (1884), pp642-645', 'expired-copyright', 'https://archive.org/details/lifeselectlitera00cran/page/n657', 'rs16; own message only, heading p642 and positive pp644-645. Adopted-state attachment and civic duty [I], not an Army obligation or support for Confederate calls.'],
  ['CLARK-CONVENTION-1860-DOC', 'Signed convention call, Texas convention journal, ed. E. W. Winkler (1912), pp9-12', 'expired-copyright', 'https://archive.org/details/journalofsecessi00texa/page/n20', 'rs16; call on pp10-11 and Ed. Clark signature p12; newspaper notice p9 identifies the signer. Signing date bounded to 1860, not the newspaper publication day. Gate draft only.'],
  ['SHERMAN-MCCLELLAN-1861-DOC', 'W. T. Sherman to John Sherman, 20 May 1861, printed in The Sherman Letters, ed. Rachel Sherman Thorndike (1894), pp120-121', 'expired-copyright', 'https://archive.org/details/shermanlettersco00sher/page/120', 'S6 2c1cea0, individually read S9 backlog opt-in. Heading p120, professional appraisal p121. Only this letter is primary; editorial narrative and the separate May 22 letter are excluded. Scan hashes: p120 88789da093fb3ee132b6228440295edc5906ccd935377ad41ade08aeffb27b8f; p121 908d8c8e43ec7840bf0b739ab7e397fd937cb96f8794d928ffa1a51e17d445bd.'],
];
const records = text => {
  const rows = parse(text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
  return rows.slice(1).filter(r => r.some(Boolean)).map(r => Object.fromEntries(rows[0].map((h, i) => [h, r[i] || ''])));
};
const parts = text => text ? text.split(';') : [];
const stripNew = text => text.replace(/(^|\+)NEW:/g, '$1');
const aliases = new Map([['PEARSON-ANDREW-DOCS', 'PEARSON-ANDREW'], ['NH-DOCS', 'NH'], ['NEWTON-LYONS-DOCS', 'NEWTON-LYONS'], ['WOODBURN-STEVENS-DOCS', 'WOODBURN-STEVENS']]);
function locator(citation) {
  return citation.replace(/\bdated[: ]\s*\d{4}(?:-\d{2}){0,2}(?:\.\.\d{4}(?:-\d{2}){0,2})?.*$/, '')
    .replace(/ \(withdrawal letter only\)$/, '').replace(/(\d)-p/g, '$1 p').replace(/\s+/g, ' ').trim()
    .replace(/^\S+/, key => aliases.get(key) || key);
}
// Endpoints are comparisons only. They never become claimed historical days.
function dateBounds(text) {
  const one = bound => {
    const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(bound);
    if (!m) throw new Error(`Unsupported date bound: ${text}`);
    const year = Number(m[1]), month = Number(m[2] || 1), day = Number(m[3] || 1);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) throw new Error(`Invalid date bound: ${text}`);
    return [m[1] + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0'),
      m[1] + '-' + (m[2] || '12') + '-' + (m[3] || String(m[2] ? days[month - 1] : 31).padStart(2, '0'))];
  };
  const range = text.split('..');
  if (range.length > 2) throw new Error(`Invalid date range: ${text}`);
  const lo = one(range[0])[0], hi = one(range[range.length - 1])[1];
  if (lo > hi) throw new Error(`Reversed date range: ${text}`);
  return [lo, hi];
}

function applyS9(files) {
  const read = path => { if (!files.has(path)) throw new Error(`Missing input: ${path}`); return files.get(path); };
  const table = parse(read(PEOPLE).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
  const header = table[0], column = name => { const i = header.indexOf(name); if (i < 0) throw new Error(`Missing people column ${name}`); return i; };
  const rows = table.slice(1).filter(r => r.some(Boolean));
  const byId = new Map(rows.map(row => [row[0], row]));
  const protectedBefore = new Map(rows.filter(r => PRESERVED.has(r[0])).map(r => [r[0], JSON.stringify(r)]));
  const provenance = JSON.parse(read(PACK + 'PROVENANCE.json'));
  for (const [key, title, basis, url, scope] of SOURCES) {
    const record = key === 'SHERMAN-MCCLELLAN-1861-DOC' ? 'S6 commit 2c1cea0, docs/research/S6/scan-manifest.json; originals under C:/Pyrrhic/mandate-research-sources/S6/.' : 'source hashes/read limits in docs/research/_resource/evidence-r59/sources.json or evidence-r65/sources.json.';
    if (!provenance.sources.some(s => s.key === key)) provenance.sources.push({ key, title, kind: 'primary', licence: 'public-domain', basis, copyUsed: `${url}; ${scope} S9; ${record}`, licencePage: null, licenceReadOn: null });
  }
  const sources = new Map(provenance.sources.map(s => [s.key, s]));
  const policy = JSON.parse(read(PACK + 'gate/source-policy.json'));
  const evidence = policy.evidence;
  const weak = new Set([...(policy.weak || []), ...(policy.banned || [])]);
  const held = new Map(records(read(HELD)).map(c => [c.person + '/' + c.cell, c]));
  const report = { research: [], protected: [], deferred: [...DEFERRED].filter(id => byId.has(id)), dating: [], heldByDating: [], draft: [] };
  const drafts = [];
  function cell(row, name) {
    const [kind, sub] = name.includes(':') ? name.split(/:(.+)/) : ['stat', name];
    const field = kind === 'stat' ? sub : kind === 'value' ? 'values' : kind === 'trait' ? 'traits' : kind;
    const index = column(field);
    const list = kind !== 'stat';
    const segments = list ? parts(row[index]) : [];
    const position = list ? segments.findIndex(s => s.startsWith(sub + ':')) : -1;
    return {
      get: () => list ? (position < 0 ? '' : segments[position]) : row[index],
      set: value => {
        if (!list) row[index] = value;
        else { if (position < 0) { if (value) segments.push(value); } else if (value) segments[position] = value; else segments.splice(position, 1); row[index] = segments.join(';'); }
      },
      prefix: text => { const end = kind === 'regard_others' ? text.indexOf(':', text.indexOf(':') + 1) : text.indexOf(':'); return text.slice(0, end + 1); },
      kind, name: sub,
    };
  }
  function hold(id, name, prior, basis) {
    const key = id + '/' + name;
    if (!held.has(key)) held.set(key, { person: id, cell: name, prior_value: prior, reader_basis: basis });
  }
  const rounds = [[15, 'rs15.csv'], [16, 'rs16.csv']];
  if (files.has(RESEARCH + 's9-backlog.csv')) rounds.push(['S6', 's9-backlog.csv']);
  for (const [round, filename] of rounds) {
    const seen = new Set();
    for (const c of records(read(RESEARCH + filename))) {
      if (round === 'S6' && c.decision === 'HOLD') throw new Error('S6 HOLD is a search limit, never authority to erase starting data');
      const key = c.person + '/' + c.cell;
      if (seen.has(key)) throw new Error(`Duplicate research cell: rs${round} ${key}`);
      seen.add(key);
      if (PROTECTED.has(c.person)) { report.protected.push({ round, cell: key, decision: c.decision }); continue; }
      if (DEFERRED.has(c.person)) continue;
      const row = byId.get(c.person);
      if (!row) throw new Error(`Unknown person: ${c.person}`);
      const target = cell(row, c.cell), prior = target.get();
      if (c.decision === 'HOLD') {
        if (prior && prior !== 'unknown' && prior !== c.prior_value) throw new Error(`HOLD conflicts with a later live cell: ${key}`);
        hold(c.person, c.cell, prior || c.prior_value, `rs${round}: ${c.basis}`);
        if (prior !== 'unknown') target.set('');
      }
      else {
        if (!['KEEP', 'CHANGE'].includes(c.decision)) throw new Error(`Unknown decision: ${c.decision}`);
        const cites = stripNew(c.citations.trim());
        if (!cites || /;/.test(cites)) throw new Error(`Invalid citations: ${key}`);
        for (const cite of cites.split('+')) if (!sources.has(cite.split(' ')[0])) throw new Error(`Unknown citation: ${cite}`);
        if (GATED.has(key)) {
          drafts.push({ person: c.person, cell: c.cell, decision: c.decision, direction: c.proposed_direction, citations: cites, inference: c.basis, gateReason: GATED.get(key) });
          hold(c.person, c.cell, prior || c.prior_value, `S9 gate draft, not applied: ${c.basis}`);
          report.draft.push(key);
          continue;
        }
        const dir = c.proposed_direction.replace(/\s*\(.*$/, '').trim();
        if (!dir) throw new Error(`Missing direction: ${key}`);
        let citationList = cites.split('+');
        if (c.decision === 'KEEP' && prior) {
          const previous = prior.slice(target.prefix(prior).length).split('+');
          citationList = [...new Set([...previous, ...citationList])];
        }
        const prefix = target.kind === 'stat' ? dir + ':' : target.kind === 'regard_others' ? `${target.name}:${dir.split(':').pop()}:` : target.name + ':';
        target.set(prefix + citationList.join('+'));
        held.delete(key);
      }
      report.research.push({ round, cell: key, decision: c.decision });
    }
  }
  const dates = new Map();
  for (const d of records(read(RESEARCH + 'dating.csv'))) {
    if (d.date !== 'not found') dateBounds(d.date);
    const key = d.cell + '/' + locator(d.citation);
    const previous = dates.get(key);
    if (previous && previous.date !== 'not found') {
      if (d.date === 'not found') continue;
      if (previous.date !== d.date) throw new Error(`Conflicting dates: ${key}`);
    }
    dates.set(key, d);
  }
  function citations(text, target) { return text.slice(target.prefix(text).length).split('+'); }
  const after = (cite, innate) => {
    const match = /\bdated[: ]\s*(\d{4}(?:-\d{2}){0,2}(?:\.\.\d{4}(?:-\d{2}){0,2})?)(?![\d-])/.exec(cite);
    if (!match) return false; // 0087: genuinely undated evidence is not automatically refused.
    const [, upper] = dateBounds(match[1]);
    return innate ? upper > evidence.innateThrough : upper >= evidence.startBefore;
  };
  const weakCitation = (cite, innate) => {
    const space = cite.indexOf(' '), key = space < 0 ? cite : cite.slice(0, space), at = space < 0 ? '' : cite.slice(space + 1);
    return weak.has(key) || /^(?:\[)?(?:snippet|self-report|after-start)(?:\b|:)/i.test(at) || after(cite, innate);
  };
  for (const row of rows) {
    const id = row[0];
    if (PRESERVED.has(id)) continue;
    const names = ['competence', 'nerve', 'experience', 'reputation', 'boldness', 'candour', 'regard'].filter(n => header.includes(n));
    for (const [field, kind] of [['values', 'value'], ['traits', 'trait'], ['regard_others', 'regard_others']]) {
      if (header.includes(field)) for (const s of parts(row[column(field)])) names.push(kind + ':' + s.split(':')[0]);
    }
    for (const name of names) {
      const target = cell(row, name), prior = target.get();
      if (!prior || prior === 'unknown') continue;
      const prefix = target.prefix(prior), key = id + '/' + name;
      const updated = [...new Set(citations(prior, target).map(cite => {
        const d = dates.get(key + '/' + locator(cite));
        if (!d) return cite;
        const clean = cite.replace(/\s+dated[: ]\s*\d{4}(?:-\d{2}){0,2}(?:\.\.\d{4}(?:-\d{2}){0,2})?/g, '');
        report.dating.push({ cell: key, citation: cite, date: d.date, source: d['source of the date'] });
        return d.date === 'not found' ? clean : `${clean} dated ${d.date}`;
      }))];
      const dated = prefix + updated.join('+');
      target.set(dated);
      const innate = target.kind === 'stat' ? evidence.innateStats.includes(target.name) : target.kind === 'trait' && evidence.innateTraits.includes(target.name);
      const fact = name === 'experience' || (target.kind === 'trait' && evidence.factTraits.includes(target.name));
      const strong = updated.filter(cite => !weakCitation(cite, innate));
      const leg = strong.some(cite => { const source = cite.split(' ')[0]; return sources.get(source)?.kind === 'primary' && !evidence.referenceWorks.includes(source); });
      if ((!fact && !leg) || (fact && strong.length === 0)) {
        hold(id, name, dated, 'S9 dating/0087: no qualifying contemporary leg survives at the sourced precision. A bound crossing the cutoff does not establish a timely document; unresolved dates are not invented.');
        cell(row, name).set('');
        report.heldByDating.push({ cell: key, prior: dated });
      }
    }
  }
  for (const [id, before] of protectedBefore) if (JSON.stringify(byId.get(id)) !== before) throw new Error(`Protected row changed: ${id}`);
  const heldRows = [...held.values()].sort((a, b) => a.person < b.person ? -1 : a.person > b.person ? 1 : a.cell < b.cell ? -1 : a.cell > b.cell ? 1 : 0);
  const draft = { status: 'draft', request: 'S9', loaded: false, note: 'Unsigned people-data recommendations for the gate reviewer under 0106. These are data-placement drafts, not playable situations. No live value, trait, option, text or sign-off is supplied by this file.', recommendations: drafts, companionHolds: records(read(RESEARCH + 'rs16.csv')).filter(c => c.person === 'clark_edward' && c.cell === 'value:slavery_defence') };
  const outputs = new Map([
    [PEOPLE, serialise([header, ...rows])],
    [HELD, serialise([['person', 'cell', 'prior_value', 'reader_basis'], ...heldRows.map(c => [c.person, c.cell, c.prior_value, c.reader_basis])])],
    [PACK + 'PROVENANCE.json', JSON.stringify(provenance, null, 2) + '\n'],
    [PACK + 'source/drafts/people/s9-people-gate.json', JSON.stringify(draft, null, 2) + '\n'],
  ]);
  return { outputs, report };
}
function main() {
  const fs = require('fs'), path = require('path');
  const root = process.env.PACK_ROOT || '.';
  const names = [PEOPLE, HELD, PACK + 'PROVENANCE.json', PACK + 'gate/source-policy.json', ...['rs15.csv', 'rs16.csv', 'dating.csv'].map(f => RESEARCH + f)];
  if (fs.existsSync(path.join(root, RESEARCH + 's9-backlog.csv'))) names.push(RESEARCH + 's9-backlog.csv');
  const files = new Map(names.map(name => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
  const { outputs, report } = applyS9(files);
  if (!process.argv.includes('--dry')) for (const [name, text] of outputs) fs.writeFileSync(path.join(root, name), text);
  if (process.env.S9_REPORT) fs.writeFileSync(process.env.S9_REPORT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ dry: process.argv.includes('--dry'), research: report.research.length, protectedRecommendations: report.protected.length, deferredPeople: report.deferred, matchedDates: report.dating.length, heldByDating: report.heldByDating.length, gateDrafts: report.draft, outputs: [...outputs.keys()] }, null, 2));
}
exports.applyS9 = applyS9;
exports.main = main;
if (require.main === module) main();
