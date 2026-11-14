// Sources, citation keys and vocabularies for the Union 1861 import (lane 0.3).
//
// Every source below is named in one of the three drafts' own source tables
// (packs/union-1861/source/drafts/*/README.md, people-sources.md Part 1); its
// licence and basis are the drafts' statements, which this lane did not
// re-verify against the originals. Nothing here comes from memory.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PD = 'public-domain';
const GOV = 'government-work';
const OLD = 'expired-copyright';

/** key -> [title, kind, basis, copy used]. All public domain, per the drafts. */
const WORKS = {
  'CEN1860-POP': ['J. C. G. Kennedy, Population of the United States in 1860 (GPO, 1864)', 'primary', GOV, 'archive.org populationofusin00kennrich (University of California copy), OCR; used to check county names'],
  'CEN1860-RR': ['Statistics of the United States ... in 1860 (GPO, 1866), Miscellaneous Statistics, "Railroads"', 'primary', GOV, "archive.org statisticsunite00goog (Google-digitised), OCR. The scan's front matter asks for non-commercial use and no automated querying: a request, not a licence, and only facts are taken; cite the federal census.gov PDF in a release pack (map draft README)"],
  'MO-AR-1861': ['Mobile and Ohio Railroad Co., Annual Report as of 1 April 1861 (President Milton Brown; Chief Engineer L. J. Fleming, 6 May 1861)', 'primary', OLD, 'transcription on csa-railroads.com (company report of 1861)'],
  LLOYD1856: ["James T. Lloyd, Lloyd's Steamboat Directory, and Disasters on the Western Waters (Cincinnati, 1856)", 'primary', OLD, 'archive.org lloydssteamboatd00lloy (Library of Congress copy), OCR; the distance tables are column-scrambled'],
  OR: ['The War of the Rebellion: Official Records of the Union and Confederate Armies (GPO, 1880-1901)', 'primary', GOV, 'archive.org volume scans, OCR, and civilwar.com transcriptions (identifiers by volume in the three drafts READMEs); page numbers from running heads can drift by one page'],
  ORN: ['Official Records of the Union and Confederate Navies, Series I vols 1 and 4, Series II vol. 1 (GPO, 1894-1921)', 'primary', GOV, 'archive.org volume scans, OCR (oob draft README)'],
  NavyReg1861: ['Register of the Commissioned and Warrant Officers of the Navy, corrected to 1 January 1861 (GPO)', 'primary', GOV, 'archive.org scan, OCR (oob draft README)'],
  SecNav1860: ['Report of the Secretary of the Navy (Toucey), December 1860, in the 36th Congress, 2nd session printing of the Presidents message (Bowman, 1860)', 'primary', GOV, 'archive.org scan, OCR (oob draft README)'],
  SecNav1861: ["Lincoln's message of 4 July 1861 with the reports of the Secretaries of War and the Navy (Welles's report: the 4 March snapshot), 37th Congress 1st session", 'primary', GOV, 'archive.org scan, OCR (oob draft README)'],
  Dyer: ['Frederick H. Dyer, A Compendium of the War of the Rebellion (Des Moines, 1908)', 'primary', OLD, 'archive.org scan, OCR (oob draft README)'],
  Heitman: ['Francis B. Heitman, Historical Register and Dictionary of the United States Army, 1789-1903 (GPO, 1903), vols 1-2', 'primary', GOV, 'archive.org historicalregist01heitrich and historicalregist02heitrich, OCR'],
  JCCS: ['Journal of the Congress of the Confederate States of America, 1861-1865 (Senate Doc. 234, GPO, 1904-05)', 'primary', GOV, 'archive.org journalofcongres00conf and journalofcongres02confiala, OCR'],
  Callahan: ['E. W. Callahan, List of Officers of the Navy of the United States and of the Marine Corps, 1775-1900 (1901)', 'primary', GOV, 'archive.org listofofficersof00unit, OCR (Navy Department compilation)'],
  Cullum: ["G. W. Cullum, Biographical Register of the Officers and Graduates of the U.S. Military Academy, 2nd ed. (1879) and 3rd ed. (1891)", 'primary', OLD, 'archive.org biographicalregi01cull, biographicalregi02cull, biographicalregi03bost, OCR; Thayer transcription of the 3rd ed. (people draft Part 1)'],
  Wright: ['Marcus J. Wright, General Officers of the Confederate Army (Neale, 1911)', 'primary', OLD, 'archive.org generalofficers00wrigrich, OCR'],
  BDAC: ['Biographical Directory of the American Congress, 1774-1927 (GPO, 1928)', 'primary', GOV, 'archive.org in.ernet.dli.2015.74142, OCR; digits often garbled'],
  CongDir37: ['Congressional Directory, 37th Congress, 2nd session (1861)', 'primary', GOV, 'archive.org congressionaldirunit, OCR'],
  JCCW: ['Report of the Joint Committee on the Conduct of the War (1863), parts 1-3', 'primary', GOV, 'archive.org reportjointcomm01wargoog and reportjointcomm03wargoog, OCR'],
  'HR-37-2-2': ['House of Representatives, 37th Congress, 2nd session, Report No. 2, Government Contracts (1862)', 'primary', GOV, 'archive.org governmentcontra00wash, OCR'],
  PRFA: ['Papers Relating to Foreign Affairs (December 1861 and December 1862 volumes)', 'primary', GOV, 'archive.org papersrelatingto00unit_0 and papersrelatingt00unit, OCR'],
  RICH: ['J. D. Richardson, ed., A Compendium of the Messages and Papers of the Confederacy (1905), vol. 2', 'primary', OLD, 'archive.org compilationofmes02conf, OCR; cited by dispatch date'],
  REBREC: ['Frank Moore, ed., The Rebellion Record, vol. 2 (1862)', 'primary', OLD, 'archive.org rebellionrecord0002fran, OCR'],
  APPLETONS: ["Appletons' Cyclopaedia of American Biography (1887-89), vols 1-6", 'secondary', OLD, 'archive.org appletonscyclop01wilsuoft and companions; Wikisource. Period but secondary: an Appletons-only direction is a single source'],
  DNB: ['Dictionary of National Biography (1885-1900)', 'secondary', OLD, 'Wikisource'],
  'WELLES-D': ['Diary of Gideon Welles (1911), vol. 1', 'primary', OLD, 'archive.org diaryofgideonwel0001unse_i9v3; Welles is hostile to Seward, Chase and Stanton'],
  'HAY-D': ['Letters of John Hay and Extracts from Diary (1908), vol. 1', 'primary', OLD, 'archive.org lettersofjohnhay01hayj'],
  'CHASE-D': ['S. P. Chase, Diary and Correspondence (Annual Report of the American Historical Association for 1902, vol. 2, 1903)', 'primary', OLD, 'archive.org'],
  NH: ["J. G. Nicolay and J. Hay, Abraham Lincoln: A History (Century, 1890)", 'secondary', OLD, "archive.org abrahamlincolnhi03nico, johnnicolayabe03nicorich and companions; Lincoln's secretaries, so own-side"],
  'GRANT-PM': ['U. S. Grant, Personal Memoirs (1885-86)', 'primary', OLD, 'Gutenberg 4367; archive.org; own memoir'],
  'SHERMAN-M': ['W. T. Sherman, Memoirs (1875)', 'primary', OLD, 'Gutenberg 4361; archive.org; own memoir'],
  'MCCLELLAN-OS': ["G. B. McClellan, McClellan's Own Story (1887)", 'primary', OLD, 'archive.org; own memoir'],
  'JOHNSTON-1874': ['J. E. Johnston, Narrative of Military Operations (1874)', 'primary', OLD, 'archive.org; advocacy, cited only for what the author claimed'],
  'DAVIS-RF': ['J. Davis, The Rise and Fall of the Confederate Government (1881)', 'primary', OLD, 'archive.org; advocacy, cited only for what the author claimed'],
  'LONGSTREET-1896': ['J. Longstreet, From Manassas to Appomattox (1896)', 'primary', OLD, 'archive.org; own memoir'],
  'JULIAN-PR': ['G. W. Julian, Political Recollections (1884)', 'primary', OLD, 'archive.org; own memoir'],
  'COX-3DEC': ['S. S. Cox, Union-Disunion-Reunion (1885)', 'primary', OLD, 'archive.org; own memoir'],
  'GREELEY-RBL': ['H. Greeley, Recollections of a Busy Life (1868)', 'primary', OLD, 'archive.org; own memoir'],
  'DANA-RCW': ['C. A. Dana, Recollections of the Civil War (1898)', 'primary', OLD, 'archive.org; own memoir'],
  'WEED-MEM': ['T. Weed, Autobiography (1883), with Barnes, Memoir (1884)', 'primary', OLD, 'archive.org; own memoir'],
  BULLOCH: ['J. D. Bulloch, The Secret Service of the Confederate States in Europe (1883)', 'primary', OLD, 'archive.org; own memoir'],
  BL: ['Battles and Leaders of the Civil War (Century, 1887-88), vols 1-2', 'primary', OLD, "archive.org bwb_S0-BUN-264_1 and battlesleadersof02cent; participants' articles, memoirs with the author named"],
  JONES: ["J. B. Jones, A Rebel War Clerk's Diary (1866)", 'primary', OLD, 'archive.org arebelwarclerks01jonegoog; hostile to Benjamin and Cooper'],
  CHESNUT: ['M. B. Chesnut, A Diary from Dixie (1905 edition)', 'primary', OLD, 'archive.org diaryfromdixieas00chesiala; the 1905 text was revised'],
  'RIDDLE-WADE': ['A. G. Riddle, Life of Benjamin F. Wade (1886)', 'secondary', OLD, 'archive.org; admiring biography'],
  'PIERCE-SUMNER': ['E. L. Pierce, Memoir and Letters of Charles Sumner (1893)', 'secondary', OLD, 'archive.org; admiring biography'],
  'NASON-WILSON': ['E. Nason and T. Russell, Life and Public Services of Henry Wilson (1876)', 'secondary', OLD, 'archive.org; admiring biography'],
  'CHANDLER-OS': ['Zachariah Chandler: An Outline Sketch of His Life and Public Services (1880)', 'secondary', OLD, 'archive.org; admiring biography'],
  'WOODBURN-STEVENS': ['J. A. Woodburn, Life of Thaddeus Stevens (1913)', 'secondary', OLD, 'archive.org; admiring biography'],
  'FOULKE-MORTON': ['W. D. Foulke, Life of Oliver P. Morton (1899)', 'secondary', OLD, 'archive.org; admiring biography'],
  'PEARSON-ANDREW': ['H. G. Pearson, Life of John A. Andrew (1904)', 'secondary', OLD, 'archive.org; admiring biography'],
  'NEWTON-LYONS': ['Lord Newton, Lord Lyons (1913)', 'secondary', OLD, 'archive.org; Gutenberg 43317; partisan'],
  'JORDAN-PRYOR-1868': ['J. Jordan and J. P. Pryor, The Campaigns of Lieut.-Gen. N. B. Forrest (1868)', 'secondary', OLD, 'archive.org; admiring biography'],
  'LEE-1904': ['R. E. Lee Jr., Recollections and Letters of General Robert E. Lee (1904)', 'secondary', OLD, 'archive.org; family compilation'],
  STEPHENS: ['A. H. Stephens, speech at Savannah, 21 March 1861 (the "Cornerstone" speech), newspaper report', 'primary', OLD, 'a transcription of the period newspaper text'],
  LINCOLN: ['Lincoln letters, as read through the sources the people draft names in its Part 2', 'primary', OLD, 'people draft Part 2 says where each text was read'],
};

/** Own authored data: the three drafts' authorship, licensed as the project's own work. */
const OWN = {
  'MAP-LANE': ['Map data lane (2026-11-14): the authored graph, sea zones, river reaches, off-map boxes and road edges (from county adjacency, a check and never a source), with the lengths computed in the map draft README', 'own-work', 'packs/union-1861/source/drafts/map (this repository)'],
  'OOB-LANE': ['Order-of-battle data lane (2026-11-14): the posts, force blocks and tenures of 4 March to 15 April 1861', 'own-work', 'packs/union-1861/source/drafts/oob (this repository)'],
  'PEOPLE-LANE': ['People data lane (2026-11-14): the 1861-62 roster and its evidence', 'own-work', 'packs/union-1861/source/drafts/people (this repository)'],
  'LANE-0.3': ['Lane 0.3 import (this lane): design parameters and modelling rules, named as such in notes/lane-0.3-union-data.md', 'own-work', 'notes/lane-0.3-union-data.md (this repository)'],
};

/** Alias a draft key prefix to a registered key. `rest` keeps the part after the draft key. */
const ALIASES = [
  [/^HEIT1(?:-|$)/, 'Heitman', (rest) => `1 ${rest}`],
  [/^HEIT2(?:-|$)/, 'Heitman', (rest) => `2 ${rest}`],
  [/^CALLAHAN(?:-|$)/, 'Callahan'],
  [/^CULLUM(?:-|$)/, 'Cullum'],
  [/^WRIGHT(?:-|$)/, 'Wright'],
  [/^CONGDIR37(?:-|$)/, 'CongDir37'],
  [/^JCCW-1863(?:-|$)/, 'JCCW'],
  [/^JC(?:-|$)/, 'JCCS'],
  [/^WELLES-D1(?:-|$)/, 'WELLES-D', (rest) => `1 ${rest}`],
  [/^HAY-D1(?:-|$)/, 'HAY-D', (rest) => `1 ${rest}`],
  [/^HAY-L1908(?:-|$)/, 'HAY-D', (rest) => `L1908 ${rest}`],
];

/** Draft keys the lane refuses to use, with the reason (counted in the hand-over note). */
const DROPPED = [
  [/^BATES-D(?:-|$)/, "Bates's diary (GPO 1933): published after 1929 with no stated licence (people draft); no direction rests on it alone"],
  [/^needs-source/, 'a flag, not a source'],
  [/^WP1848/, 'cited by the map draft with no entry in its Sources table, so its licence is unstated (decision 0033)'],
];

const NOTE_DIR = 'docs/research';

/** The research notes by short name ("union-navy"), from the folder. */
function noteShorts(repo) {
  return readdirSync(join(repo, NOTE_DIR)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/^2026-11-14-/, '').replace(/\.md$/, ''));
}

/** Resolve a draft's name for a note ("secession-winter") to the note's short name, or undefined. */
function resolveNote(shorts, name) {
  if (shorts.includes(name)) return name;
  const starts = shorts.filter((s) => s.startsWith(name));
  if (starts.length === 1) return starts[0];
  const inc = shorts.filter((s) => s.includes(name));
  return inc.length === 1 ? inc[0] : undefined;
}

/**
 * Build a citation canonicaliser and the source registry in use.
 * `canon(token)` returns `{ key, at }`, `{ dropped: reason }` or `{ unknown: token }`.
 */
export function makeCitations(repo) {
  const shorts = noteShorts(repo);
  const used = new Map(); // registry key -> entry
  const drops = new Map(); // reason -> count
  const unknowns = new Map();
  const register = (key) => {
    if (used.has(key)) return;
    const w = WORKS[key];
    const o = OWN[key];
    if (w) {
      used.set(key, { key, title: w[0], kind: w[1], licence: PD, basis: w[2], copyUsed: w[3], licencePage: null, licenceReadOn: null });
    } else if (o) {
      used.set(key, { key, title: o[0], kind: 'own-work', licence: 'own-work', basis: null, copyUsed: o[2], licencePage: null, licenceReadOn: null });
    } else if (key.startsWith('NOTE-')) {
      if (!shorts.includes(key.slice(5))) throw new Error(`no research note for ${key}`);
      const file = `${NOTE_DIR}/2026-11-14-${key.slice(5)}.md`;
      used.set(key, { key, title: `Project research note ${file} (a pointer to primary documents, never the source of a fact)`, kind: 'pointer', licence: 'own-work', basis: null, copyUsed: file, licencePage: null, licenceReadOn: null });
    } else throw new Error(`unregistered source key ${key}`);
  };
  const out = (key, at) => {
    register(key);
    return { key, at: at === '' ? null : at };
  };
  const drop = (reason) => {
    drops.set(reason, (drops.get(reason) ?? 0) + 1);
    return { dropped: reason };
  };

  function canon(raw) {
    const t = raw.trim().replace(/\s+/g, ' ');
    if (t === '') return { dropped: 'empty' };
    for (const [re, reason] of DROPPED) if (re.test(t)) return drop(reason);
    // The map draft's own words.
    if (/^own-work\b/.test(t)) return out('MAP-LANE', t.replace(/^own-work\s*/, ''));
    if (/^adjacency\b/.test(t)) return out('MAP-LANE', t);
    for (const k of Object.keys(OWN)) if (t === k || t.startsWith(`${k} `)) return out(k, t.slice(k.length).trim());
    let m = /^research note (?:2026-11-14-)?([a-z0-9-]+?)(?:\.md)?(?:\s+(.*))?$/.exec(t);
    if (m) {
      const short = resolveNote(shorts, m[1]);
      if (short) return out(`NOTE-${short}`, (m[2] ?? '').replace(/^\((.*)\)$/, '$1'));
    }
    if (t.startsWith('NOTE-')) {
      const parts = t.slice(5).split(/\s+/)[0].split('-');
      const tail = t.slice(5).split(/\s+/).slice(1).join(' ');
      for (let i = parts.length; i >= 1; i--) {
        const short = resolveNote(shorts, parts.slice(0, i).join('-'));
        if (short) return out(`NOTE-${short}`, [parts.slice(i).join('-'), tail].filter(Boolean).join(' '));
      }
    }
    m = /^(CEN1860-POP|CEN1860-RR|MO-AR-1861|LLOYD1856)\b\s*(.*)$/s.exec(t);
    if (m) return out(m[1], m[2]);
    // Order-of-battle style: "OR I-1 p.489", "ORN I-4 p.85", "OR III-1 index".
    m = /^(OR|ORN)\s+(.*)$/s.exec(t);
    if (m) return out(m[1], m[2]);
    // Map style: "OR-I-1 (ch. V summary)", "OR-I-3".
    m = /^OR-(\S+)(?:\s+(.*))?$/s.exec(t);
    if (m) return out('OR', `${m[1]} ${m[2] ?? ''}`.trim());
    m = /^(SecNav1860|SecNav1861|NavyReg1861|Dyer|Heitman|JCCS|Callahan)\b\s*(.*)$/s.exec(t);
    if (m) {
      let at = m[2];
      if (m[1] === 'SecNav1861') at = at.replace(/^\/\s*msg_jul1861\s*/, '');
      return out(m[1], at);
    }
    if (/^msg_jul1861\b/.test(t)) return out('SecNav1861', t.replace(/^msg_jul1861\s*/, ''));
    if (/^Lincoln, message to Congress 4 July/.test(t)) return out('SecNav1861', t.replace(/^Lincoln, message to Congress /, ''));
    // People style: KEY-rest, longest registered key first.
    for (const [re, key, f] of ALIASES) {
      const mm = re.exec(t);
      if (mm) {
        const rest = t.slice(mm[0].length);
        return out(key, f ? f(rest) : rest);
      }
    }
    const keys = Object.keys(WORKS).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (t === k || t.startsWith(`${k}-`) || t.startsWith(`${k} `)) return out(k, t.slice(k.length + 1));
    }
    unknowns.set(t, (unknowns.get(t) ?? 0) + 1);
    return { unknown: t };
  }

  return {
    canon,
    register,
    used: () => [...used.values()],
    drops: () => new Map(drops),
    unknowns: () => new Map(unknowns),
    OWN_KEYS: Object.keys(OWN),
  };
}

/** Text form of a citation for a CSV cell: `KEY place`. */
export function citeText(c) {
  return c.at === null ? c.key : `${c.key} ${c.at}`;
}

export { existsSync };
