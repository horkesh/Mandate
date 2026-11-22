/**
 * The pack validator's semantic pass: everything the schemas cannot say.
 * References between records, the licence allow-list and provenance, the
 * graph's rules, people's citations, scenario starts, string tables and NFC
 * text. It reports every problem, never only the first, each with where it is
 * and what is expected (decision 0030).
 *
 * Input is shape-checked data (`schemas.ts`); `locate` turns a record address
 * into a file and place, so the generator can point at the source CSV row and
 * the committed-pack check can point at the generated JSON.
 */
import { phase0, world as w } from '@mandate/kernel';
import { citationsIn, datedAfterBoundary, type EvidenceClass, type EvidencePolicy, hasWeakMarker } from './banned-sources.ts';
import type { Checkpoints } from './checkpoints.ts';
import type { GateData } from './gate.ts';
import { IntlMessageFormat } from 'intl-messageformat';
import { type Issue, IssueSink } from './issues.ts';
import { licenceVerdict, needsLicencePage, PUBLIC_DOMAIN_BASES } from './licences.ts';
import type { Manifest, ProvenanceFile, StringTable } from './schemas.ts';

export interface PackData {
  readonly manifest: Manifest;
  readonly provenance: ProvenanceFile;
  readonly world: w.World;
  readonly scenarios: readonly w.ScenarioStart[];
  /** String tables by locale, each a list of files (hand-written and generated). */
  readonly strings: ReadonlyMap<string, readonly { readonly file: string; readonly table: StringTable }[]>;
  /**
   * Ids of records that failed the shape check and were left out, by
   * `scope|table`. References to them are not reported again as unknown.
   */
  readonly quarantined?: ReadonlyMap<string, ReadonlySet<string>>;
  /** Situations (lane 0.7), once they and the gate have validated. */
  readonly situations?: readonly phase0.SituationDef[];
  /** The pack's gate files (lane 0.7), if it has any. */
  readonly gate?: GateData | null;
  /** Sources the gate bans as evidence (`gate/source-policy.json`), checked in every citation of the World and its starts (lane 1.8b). */
  readonly bannedSources?: readonly string[];
  /** Sources the gate marks weak (`gate/source-policy.json`): a people cell resting only on them is refused (lane 1.11a). */
  readonly weakSources?: readonly string[];
  /** The pack's evidence-date rule (`gate/source-policy.json`, `evidence`; 0085): a dated citation past its cell's boundary is weak. */
  readonly evidencePolicy?: EvidencePolicy | null;
  /** The done check's bands (`checkpoints.json`, lane 1.14), if the pack has them. Never read by the kernel. */
  readonly checkpoints?: Checkpoints | null;
}

/** A record's address: `world` or `scenario:<id>`, a table, an index, and optionally a field path inside the record. */
export interface Where {
  readonly scope: string;
  readonly table: string;
  readonly index: number;
  readonly field?: string;
}

export type Locate = (where: Where) => { readonly file: string; readonly at: string };

/** Locate a record in the generated files under `data/`. */
export const locateInData: Locate = ({ scope, table, index, field }) => ({
  file: scope === 'world' ? 'data/world.json' : `data/scenarios/${scope.slice('scenario:'.length)}.json`,
  at: `${table}[${index}]${field ? `.${field}` : ''}`,
});

/** Fields whose null must be declared unknown in `unknowns` (otherwise null is ambiguous). */
const MUST_DECLARE: Readonly<Record<string, readonly string[]>> = Object.freeze({
  people: ['born', 'died'],
  posts: [],
  forceBlocks: ['strength', 'storesDays'],
});
/** Fields that may be declared unknown. */
const MAY_DECLARE: Readonly<Record<string, readonly string[]>> = Object.freeze({
  people: ['born', 'died', 'faction', 'bloc'],
  posts: ['holder', 'region', 'parent'],
  forceBlocks: ['strength', 'strengthDate', 'storesDays', 'post'],
});

export function validatePack(pack: PackData, locate: Locate = locateInData): Issue[] {
  const sink = new IssueSink();
  const { manifest, provenance, world, scenarios } = pack;
  const release = manifest.status === 'release';

  const issueAt = (severity: 'error' | 'warning', kind: string, where: Where, message: string, expected?: string) => {
    const { file, at } = locate(where);
    if (severity === 'error') sink.error(kind, file, at, message, expected);
    else sink.warn(kind, file, at, message, expected);
  };
  const err = (kind: string, where: Where, message: string, expected?: string) => issueAt('error', kind, where, message, expected);
  const warn = (kind: string, where: Where, message: string, expected?: string) => issueAt('warning', kind, where, message, expected);
  const W = (table: string, index: number, field?: string): Where => (field === undefined ? { scope: 'world', table, index } : { scope: 'world', table, index, field });

  // ---- string keys referenced anywhere, checked against the tables at the end
  const referencedKeys: { key: string; where: Where }[] = [];
  const useKey = (key: string, where: Where) => referencedKeys.push({ key, where });

  // ---- ids per table
  const idSet = <T extends { readonly id: string }>(table: string, records: readonly T[], scope = 'world'): Set<string> => {
    const seen = new Set<string>();
    records.forEach((r, i) => {
      if (seen.has(r.id)) err('duplicate-id', { scope, table, index: i, field: 'id' }, `"${r.id}" is defined more than once in ${table}`, 'each id once');
      seen.add(r.id);
    });
    for (const q of pack.quarantined?.get(`${scope}|${table}`) ?? []) seen.add(q);
    return seen;
  };
  const refCheck = (set: ReadonlySet<string>, what: string, value: string | null, where: Where) => {
    if (value !== null && !set.has(value)) err('unknown-reference', where, `"${value}" is not a ${what}`, `a ${what} id defined in the pack`);
  };

  // ---- vocabularies (manifest, copied into the world)
  const vocab = world.vocabularies;
  const termSets = new Map<string, Set<string>>();
  for (const [name, list] of Object.entries(vocab) as [string, readonly { id: string; name: string }[]][]) {
    termSets.set(name, idSet(`vocabularies.${name}`, list));
    list.forEach((t, i) => useKey(t.name, W(`vocabularies.${name}`, i, 'name')));
  }
  const term = (vocabName: keyof w.Vocabularies, value: string | null, where: Where) => {
    if (value !== null && !termSets.get(vocabName)!.has(value)) {
      err('unknown-term', where, `"${value}" is not in the pack's ${vocabName} vocabulary`, `one of: ${[...termSets.get(vocabName)!].join(', ') || '(empty vocabulary)'}`);
    }
  };
  const terrains = new Map(vocab.terrains.map((t) => [t.id, t]));
  const arms = new Map(vocab.arms.map((a) => [a.id, a]));
  const rankOrder = new Map(vocab.ranks.map((r) => [r.id, r.seniority]));
  const rankKind = new Map(vocab.ranks.map((r) => [r.id, r.kind]));
  const seasonReasons = new Set(world.rules.seasons.map((s) => s.reason));
  world.rules.seasons.forEach((s, i) => {
    if (world.rules.seasons.findIndex((x) => x.reason === s.reason) !== i) err('duplicate-id', W('rules.seasons', i, 'reason'), `season reason "${s.reason}" is defined twice`);
    if (!ascendingUnique(s.defaultMonths)) err('season-months', W('rules.seasons', i, 'defaultMonths'), 'months must be ascending with no repeats');
  });
  if (world.rules.retreatControlPermille > world.rules.supplyControlPermille) {
    warn('rules-order', W('rules', 0, 'retreatControlPermille'), 'the retreat threshold is above the supply threshold', 'retreat at or below supply (0019: 50 and 250)');
  }
  // Lane 0.5's design parameters (0064): ranges the schema cannot state alone, because they depend on another rule.
  if (world.rules.stores.lowDays > world.rules.stores.capDays) {
    err('rules-range', W('rules.stores', 0, 'lowDays'), `the low-stores threshold (${world.rules.stores.lowDays} days) is above the cap (${world.rules.stores.capDays} days), so a full block would read low`, 'lowDays at most capDays');
  }
  // The rule-seat war setting (0064): one row per faction, naming a faction the pack has.
  const factionIds = new Set(world.factions.map((f) => f.id as string));
  const warRows = world.rules.ruleSeats.warFlags;
  warRows.forEach((row, i) => {
    if (!factionIds.has(row.faction)) err('unknown-reference', W('rules.ruleSeats.warFlags', i, 'faction'), `"${row.faction}" is not a faction in this pack`, `one of: ${[...factionIds].join(', ')}`);
    if (warRows.findIndex((x) => x.faction === row.faction) !== i) err('duplicate-id', W('rules.ruleSeats.warFlags', i, 'faction'), `faction "${row.faction}" has more than one war flag`);
    // 0066: each faction's war is its own government's decision, so a flag is one faction's, never shared.
    if (row.flag !== null && warRows.findIndex((x) => x.flag === row.flag) !== i) err('duplicate-id', W('rules.ruleSeats.warFlags', i, 'flag'), `war flag "${row.flag}" is named by more than one faction, so one side's decision would put the other at war before its president knew`, 'one flag per faction');
  });
  for (const f of [...factionIds].sort()) {
    if (!warRows.some((r) => r.faction === f)) err('missing-value', W('rules.ruleSeats', 0, 'warFlags'), `faction "${f}" has no war flag row`, 'one row per faction: a situation flag, or null for war from day 1');
  }
  // Lane 1.12: each faction's rule-seat principal has its doctrine, stated once (the kernel reads a missing row as none).
  const doctrineRows = world.rules.ruleSeats.principals;
  doctrineRows.forEach((row, i) => {
    if (!factionIds.has(row.faction)) err('unknown-reference', W('rules.ruleSeats.principals', i, 'faction'), `"${row.faction}" is not a faction in this pack`, `one of: ${[...factionIds].join(', ')}`);
    if (doctrineRows.findIndex((x) => x.faction === row.faction) !== i) err('duplicate-id', W('rules.ruleSeats.principals', i, 'faction'), `faction "${row.faction}" has more than one doctrine row`);
  });
  for (const f of [...factionIds].sort()) {
    if (!doctrineRows.some((r) => r.faction === f)) err('missing-value', W('rules.ruleSeats', 0, 'principals'), `faction "${f}" has no doctrine row`, 'one row per faction: its rule-seat principal’s doctrine (lane 1.12)');
  }
  if (world.rules.movement.marchMinCapacityPermille > world.rules.capacityMax * 1000) {
    err('rules-range', W('rules.movement', 0, 'marchMinCapacityPermille'), `no edge can carry a march: the least capacity to march (${world.rules.movement.marchMinCapacityPermille}) is above the scale's top (capacityMax ${world.rules.capacityMax} = ${world.rules.capacityMax * 1000})`, `at most ${world.rules.capacityMax * 1000}`);
  }
  // 0072: the report templates, by the kernel's own rule (the kernel checks the same when it indexes a World): one for
  // each report type and subtype it writes, none for a kind it does not, and a superseded report kept no longer than any.
  for (const problem of phase0.templateProblems(world.rules.reportTemplates)) {
    err('rules-templates', W('rules', 0, 'reportTemplates'), problem, 'one template for each report type and subtype the kernel writes, keepSupersededDays at most maxAgeDays');
  }
  for (const problem of phase0.latencyProblems(world.rules.latency)) err('rules-latency', W('rules', 0, 'latency'), problem);
  for (const d of world.rules.latency.dispatches ?? []) {
    for (const scenario of scenarios) {
      const target = scenario.posts.find(p => p.id === d.to);
      if (target === undefined) err('rules-dispatch', W('rules', 0, 'latency.dispatches'), `dispatch ${d.to}: target absent in scenario ${scenario.id}`);
      const side = world.departments.find(x => x.id === target?.department)?.faction;
      for (const c of d.carriers) {
        const post = scenario.posts.find(p => p.id === c.post);
        if (post === undefined || world.departments.find(x => x.id === post.department)?.faction !== side) err('rules-dispatch', W('rules', 0, 'latency.dispatches'), `dispatch ${d.to}: carrier ${c.post} must be a declared same-side post in ${scenario.id}`);
      }
    }
    for (const value of [...d.terms.honours, ...d.terms.offends]) if (!vocab.values.some(v => v.id === value)) err('rules-dispatch', W('rules', 0, 'latency.dispatches'), `unknown delivery value ${value}`);
  }
  // Lane 1.1: the people rules, by the kernel's own rule (it checks the same when it indexes a World): every value they name is in the vocabulary.
  // Lane 1.5: attention, the order-to-value map, the verbs, ladder, audience and initiatives.
  for (const problem of phase0.verbRulesProblems(world.rules.people.attention, world.rules.people.verbs, vocab.values.map((v) => v.id), vocab.personKinds.map((k) => k.id))) {
    err('rules-people', W('rules', 0, 'people'), problem, 'the pack’s attention and verb rules, whole and in range, naming values and person kinds from its vocabularies');
  }
  for (const problem of phase0.peopleRulesProblems(world.rules.people, vocab.values.map((v) => v.id), vocab.traits.map(t => t.id))) {
    err('rules-people', W('rules', 0, 'people'), problem, 'whole permille for each people rule, and values from the pack’s values vocabulary');
  }
  for (const [i,n] of world.rules.plans.notes.terms.entries()) for (const value of [...n.honours,...n.offends]) {
    if (!vocab.values.some(v=>v.id===value)) err('rules-notes', W('rules.plans.notes.terms',i,'honours/offends'), `unknown value "${value}"`, 'a value from this pack’s vocabulary');
  }
  // Lane 1.3: the combat rules, by the kernel's own rule (it checks the same when it indexes a World): every terrain the
  // frontage table names is in the vocabulary, the phase shares sum to 1000, and the phases run in order.
  for (const problem of phase0.combatRulesProblems(world.rules.combat, vocab.terrains.map((t) => t.id))) {
    err('rules-combat', W('rules', 0, 'combat'), problem, 'whole numbers in range for each combat rule, terrains from the pack’s vocabulary, phase shares summing to 1000');
  }
  // Lane 1.4: each stores norm names a post kind, an arm and a side the pack has.
  world.rules.stores.norms.forEach((n, i) => {
    if (n.postKind !== null) term('postKinds', n.postKind, W('rules.stores.norms', i, 'postKind'));
    if (n.arm !== null) term('arms', n.arm, W('rules.stores.norms', i, 'arm'));
    if (n.faction !== null && !factionIds.has(n.faction)) err('unknown-reference', W('rules.stores.norms', i, 'faction'), `faction "${n.faction}" is not in the manifest`, 'a faction from the manifest, or null');
  });
  // Lane 1.4: operations and pruning, by the kernel's own rule.
  for (const problem of phase0.operationsRulesProblems(world.rules.operations, world.rules.pruning)) {
    err('rules-operations', W('rules', 0, 'operations'), problem, 'whole numbers in range for each operations and pruning rule');
  }
  // Lane 1.7: the recruitment and self-emancipation rules and what they name, by the kernel's own rules (it checks the same when it indexes a World).
  for (const problem of [...phase0.recruitmentRuleProblems(world.rules.recruitment), ...phase0.selfEmancipationRuleProblems(world.rules.selfEmancipation), ...phase0.menAndRegionsReferenceProblems(world)]) {
    err('rules-men-regions', W('rules', 0, 'recruitment'), problem, 'whole numbers in range, and an arm, post kinds, values and a faction the pack has');
  }
  // Lane 1.6: the politics rules and what they name, by the kernel's own rule (it checks the same when it indexes a World).
  for (const problem of phase0.politicsRulesProblems(world)) {
    err('rules-politics', W('rules', 0, 'politics'), problem, 'blocs from the vocabulary with a side’s voices summing to 1000, chambers and sessions complete for their kind, papers whose editor is of their side');
  }
  world.rules.politics.chambers.forEach((c, i) => useKey(c.name, W('rules.politics.chambers', i, 'name')));
  world.rules.politics.chambers.forEach((c,i)=>c.composition?.forEach((t,j)=>t.groups.forEach((g,k)=>useKey(g.name,W(`rules.politics.chambers.${i}.composition.${j}.groups`,k,'name')))));
  // 0073: every rank has a kind from rankKinds, so a person can hold one of each kind at once.
  vocab.ranks.forEach((r, i) => term('rankKinds', r.kind, W('vocabularies.ranks', i, 'kind')));

  // ---- provenance: sources and licences
  const sources = new Map<string, ProvenanceFile['sources'][number]>();
  provenance.sources.forEach((s, i) => {
    const where = { file: 'PROVENANCE.json', at: `sources[${i}] (${s.key})` };
    if (sources.has(s.key)) sink.error('duplicate-id', where.file, where.at, `source key "${s.key}" is defined more than once`);
    sources.set(s.key, s);
    const verdict = licenceVerdict(s.licence);
    if (!verdict.allowed) sink.error('licence-not-allowed', where.file, where.at, `licence "${s.licence}": ${verdict.reason}`, 'public-domain, CC0-1.0 or own-work');
    if (s.licence === 'public-domain' && !(PUBLIC_DOMAIN_BASES as readonly string[]).includes(s.basis ?? '')) {
      sink.error('licence-basis-missing', where.file, where.at, `a public-domain source needs its basis, got ${s.basis === null ? 'none' : `"${s.basis}"`}`, PUBLIC_DOMAIN_BASES.join(', '));
    }
    if (needsLicencePage(s.licence, s.basis) && (s.licencePage === null || s.licenceReadOn === null)) {
      sink.error('licence-page-missing', where.file, where.at, 'this licence is a statement on a page: record the page and the day it was read', 'licencePage and licenceReadOn (decision 0031)');
    }
    if (s.kind === 'own-work' && s.licence !== 'own-work') sink.error('licence-not-allowed', where.file, where.at, 'own work must carry the own-work licence');
  });
  const citeCheck = (cites: readonly w.Citation[], where: Where, requireOne: boolean, what: string) => {
    let admissible = 0;
    cites.forEach((c, i) => {
      const src = sources.get(c.source);
      if (!src) {
        err('unknown-source', { ...where, field: `${where.field ?? 'provenance'}[${i}]` }, `source "${c.source}" is not in PROVENANCE.json`, 'a key defined in PROVENANCE.json');
      } else if (src.kind !== 'pointer') admissible++;
    });
    if (requireOne && cites.length > 0 && admissible === 0 && cites.every((c) => sources.get(c.source)?.kind === 'pointer')) {
      err('pointer-only', where, `${what} cites only pointers (research notes), which never count as evidence`, 'at least one primary, secondary or own-work source');
    }
  };

  // ---- factions and departments
  const factions = idSet('factions', world.factions);
  world.factions.forEach((f, i) => useKey(f.name, W('factions', i, 'name')));
  const departments = idSet('departments', world.departments);
  const deptFaction = new Map(world.departments.map((d) => [d.id as string, d.faction as string | null]));
  /** Which side a department is on: its faction. Unknown departments give undefined, already reported. */
  const allegiance = (dept: string): string | undefined => (deptFaction.has(dept) ? (deptFaction.get(dept) ?? `neutral:${dept}`) : undefined);
  const personFaction = new Map(world.people.map((p) => [p.id as string, p.faction as string | null]));
  const deptKind = new Map(world.departments.map((d) => [d.id as string, d.kind]));
  const governmentKinds = new Set(vocab.departmentKinds.filter((k) => k.government).map((k) => k.id));
  // 0069: only a government can govern itself, so a self-governing kind is a government kind.
  vocab.departmentKinds.forEach((k, i) => {
    if (k.selfGoverning && !k.government) err('self-governing-not-government', W('vocabularies.departmentKinds', i, 'selfGoverning'), `department kind "${k.id}" is self-governing but not a government`, 'government: true, or selfGoverning: false');
  });
  const selfGoverningKinds = new Set(vocab.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id));
  world.departments.forEach((d, i) => {
    // 0070: a self-governing department names the people whose government it is, so its land cannot pass to another people's.
    if (selfGoverningKinds.has(d.kind) && d.polity === undefined) err('self-governing-no-polity', W('departments', i, 'polity'), `department "${d.id}" governs itself but names no polity`, 'a polity id shared by the rival governments of one nation (0070)');
    // `unknown` is the governments table's word for no known government (0058), so no department may take it as an id.
    if (d.id === w.UNKNOWN_GOVERNMENT) err('reserved-id', W('departments', i, 'id'), `"${w.UNKNOWN_GOVERNMENT}" is reserved for a region whose government is not known`, 'another department id');
    refCheck(factions, 'faction', d.faction, W('departments', i, 'faction'));
    term('departmentKinds', d.kind, W('departments', i, 'kind'));
    useKey(d.name, W('departments', i, 'name'));
    citeCheck(d.provenance, W('departments', i), true, 'this department');
  });

  // ---- regions
  const regions = idSet('regions', world.regions);
  const regionKind = new Map(world.regions.map((r) => [r.id as string, r.kind]));
  const weatherZones = idSet('weatherZones', world.weatherZones);
  world.weatherZones.forEach((z, i) => useKey(z.name, W('weatherZones', i, 'name')));
  world.regions.forEach((r, i) => {
    const at = (f?: string) => W('regions', i, f);
    useKey(r.name, at('name'));
    citeCheck(r.provenance, at(), true, 'this region');
    refCheck(weatherZones, 'weather zone', r.weatherZone, at('weatherZone'));
    if (r.kind === 'off_map') {
      if (r.offMapRole === null) err('off-map-role', at('offMapRole'), 'an off-map box needs a role', w.OFF_MAP_ROLES.join(', '));
      if (r.terrain !== null) err('region-terrain', at('terrain'), 'an off-map box has no terrain', 'empty');
    } else {
      if (r.offMapRole !== null) err('off-map-role', at('offMapRole'), `only off-map boxes have a role, and this is a ${r.kind} region`, 'empty');
      if (r.terrain === null) err('region-terrain', at('terrain'), `a ${r.kind} region needs a terrain`, 'a terrain from the pack vocabulary');
      else {
        term('terrains', r.terrain, at('terrain'));
        const t = terrains.get(r.terrain);
        const water = r.kind === 'river' || r.kind === 'sea';
        if (t && t.water !== water) err('region-terrain', at('terrain'), `terrain "${r.terrain}" is ${t.water ? 'water' : 'land'} but the region is ${r.kind}`, water ? 'a water terrain' : 'a land terrain');
      }
    }
    if (new Set(r.flags).size !== r.flags.length) err('duplicate-entry', at('flags'), 'a flag is listed twice');
    if (r.labelHints && r.labelHints.spine.length === 1) err('label-hints', at('labelHints.spine'), 'a spine needs at least two points', 'two or more points, or none');
  });

  // ---- rail lines, edges
  const railLines = idSet('railLines', world.railLines);
  world.railLines.forEach((l, i) => {
    useKey(l.name, W('railLines', i, 'name'));
    citeCheck(l.provenance, W('railLines', i), true, 'this rail line');
  });
  const edges = idSet('edges', world.edges);
  const edgeById = new Map(world.edges.map((e) => [e.id as string, e]));
  const edgeKeys = new Map<string, number>();
  const isWater = (k: w.RegionKind | undefined) => k === 'river' || k === 'sea';
  world.edges.forEach((e, i) => {
    const at = (f?: string) => W('edges', i, f);
    refCheck(regions, 'region', e.a, at('a'));
    refCheck(regions, 'region', e.b, at('b'));
    citeCheck(e.provenance, at(), true, 'this edge');
    if (e.a === e.b) err('edge-self-loop', at('b'), `the edge joins "${e.a}" to itself`, 'two different regions');
    else if (!(e.a < e.b)) err('edge-order', at('a'), `ends must be in code-unit order, got "${e.a}" before "${e.b}"`, 'a < b');
    const key = `${e.type}|${e.a}|${e.b}|${e.line ?? ''}`;
    if (edgeKeys.has(key)) err('duplicate-edge', at(), `the same ${e.type} edge between "${e.a}" and "${e.b}" appears twice${e.line ? ` on line "${e.line}"` : ''}`, 'one edge per type and pair (rail: per line)');
    edgeKeys.set(key, i);
    if (e.capacity > world.rules.capacityMax) err('capacity-range', at('capacity'), `capacity ${e.capacity} is above the pack's maximum ${world.rules.capacityMax}`, `1 to ${world.rules.capacityMax}`);
    const ka = regionKind.get(e.a);
    const kb = regionKind.get(e.b);
    if (ka !== undefined && kb !== undefined) {
      const ends = [ka, kb];
      if ((e.type === 'road' || e.type === 'rail') && ends.some(isWater)) err('edge-end-kind', at('type'), `a ${e.type} edge cannot touch a ${isWater(ka) ? ka : kb} region`, 'land, key point or off-map ends');
      // A harbour channel joins two key points (a fort and its city) with no sea zone between them (lane 0.3: the Union 1861 draft has two).
      const harbour = ka === 'key_point' && kb === 'key_point';
      if (e.type === 'sea' && !harbour && !ends.some((k) => k === 'sea' || k === 'off_map')) {
        err('edge-end-kind', at('type'), 'a sea edge must touch a sea region or an off-map box, or join two key points on one harbour', 'at least one sea or off-map end, or two key points');
      }
      if (e.type === 'river' && ends.includes('off_map')) err('edge-end-kind', at('type'), 'a river edge cannot reach an off-map box', 'land, key point, river or sea ends');
    }
    if (e.type === 'rail') {
      if (e.line === null) err('rail-without-line', at('line'), 'a rail edge must belong to a named line', 'a rail line id');
      else refCheck(railLines, 'rail line', e.line, at('line'));
    } else if (e.line !== null) err('line-on-non-rail', at('line'), `a ${e.type} edge has no rail line`, 'empty');
    const water = e.type === 'river' || e.type === 'sea';
    if (!water && e.depthFeet !== null) err('water-field', at('depthFeet'), `a ${e.type} edge has no depth`, 'empty');
    if (e.lengthDaysBA !== null && e.lengthDaysBA === e.lengthDays) warn('redundant-value', at('lengthDaysBA'), 'the return length equals the length', 'empty when the same');
    const seenReasons = new Set<string>();
    e.seasons.forEach((s, j) => {
      const sat = at(`seasons[${j}]`);
      if (!seasonReasons.has(s.reason)) err('unknown-term', sat, `season reason "${s.reason}" has no effect in the pack's rules`, `one of: ${[...seasonReasons].join(', ')}`);
      if (seenReasons.has(s.reason)) err('duplicate-entry', sat, `season reason "${s.reason}" is listed twice on this edge`);
      seenReasons.add(s.reason);
      if (!ascendingUnique(s.months)) err('season-months', sat, 'months must be ascending with no repeats');
      const waterReason = s.reason === 'low_water' || s.reason === 'ice';
      if (waterReason && !water) err('season-reason', sat, `"${s.reason}" applies to river and sea edges, not ${e.type}`);
      if (s.reason === 'mud' && e.type !== 'road') err('season-reason', sat, `"mud" applies to road edges, not ${e.type}`);
      if (s.depthFeet !== null && !water) err('water-field', sat, `a ${e.type} edge has no depth`, 'empty');
    });
  });

  // ---- installations
  const installations = idSet('installations', world.installations);
  world.installations.forEach((inst, i) => {
    const at = (f?: string) => W('installations', i, f);
    refCheck(regions, 'region', inst.region, at('region'));
    useKey(inst.name, at('name'));
    citeCheck(inst.provenance, at(), true, 'this installation');
    if (inst.kind === 'naval_base' && regionKind.get(inst.region) !== undefined && regionKind.get(inst.region) !== 'key_point') {
      err('naval-base-not-key-point', at('region'), `naval bases are key points, but "${inst.region}" is a ${regionKind.get(inst.region)} region`, 'a key_point region');
    }
    if ((inst.kind === 'fort') !== (inst.fort !== null)) err('fort-fields', at('fort'), inst.kind === 'fort' ? 'a fort needs its fort facts' : `a ${inst.kind} has no fort facts`);
    inst.fort?.commandsEdges.forEach((edgeId, j) => {
      const e = edgeById.get(edgeId);
      if (!e) return err('unknown-reference', at(`fort.commandsEdges[${j}]`), `"${edgeId}" is not an edge`, 'an edge id');
      if (e.type !== 'river' && e.type !== 'sea') err('fort-edge', at(`fort.commandsEdges[${j}]`), `a fort commands water edges, and "${edgeId}" is ${e.type}`);
      if (e.a !== inst.region && e.b !== inst.region) err('fort-edge', at(`fort.commandsEdges[${j}]`), `edge "${edgeId}" does not touch the fort's region "${inst.region}"`, "an edge with the fort's region at one end");
    });
    if (inst.fort && inst.fort.water !== null && inst.fort.commandsEdges.length === 0) warn('fort-edge', at('fort.commandsEdges'), 'a fort on water commands no edge', 'the water edges under its guns');
    if (inst.fort && inst.fort.water === null && inst.fort.commandsEdges.length > 0) err('fort-edge', at('fort.water'), 'a fort that commands water needs passage or reduction', 'passage or reduction');
  });

  // ---- depots
  const depots = idSet('depots', world.depots);
  world.census.forEach((c, i) => refCheck(regions, 'region', c.region, W('census', i, 'region')));
  world.depots.forEach((d, i) => {
    refCheck(regions, 'region', d.region, W('depots', i, 'region'));
    useKey(d.name, W('depots', i, 'name'));
    citeCheck(d.provenance, W('depots', i), true, 'this depot');
    if (d.capacity > world.rules.capacityMax) err('capacity-range', W('depots', i, 'capacity'), `capacity ${d.capacity} is above the pack's maximum ${world.rules.capacityMax}`);
  });

  // ---- graph connectivity: every region reachable from the first
  if (world.regions.length > 0) {
    // Regions set aside by the shape check stay in the graph, so they don't cut it in two.
    const adj = new Map<string, string[]>([...regions].map((id) => [id, []]));
    for (const e of world.edges) {
      adj.get(e.a)?.push(e.b);
      adj.get(e.b)?.push(e.a);
    }
    const start = world.regions[0]!.id as string;
    const seen = new Set([start]);
    const queue = [start];
    while (queue.length > 0) for (const n of adj.get(queue.pop()!) ?? []) if (!seen.has(n)) (seen.add(n), queue.push(n));
    world.regions.forEach((r, i) => {
      if (!seen.has(r.id)) err('unreachable-region', W('regions', i), `"${r.id}" has no path from "${start}"`, 'a connected graph: every region joined by some edge');
    });
  }

  // ---- people
  const people = idSet('people', world.people);
  world.rules.combat.bombardment.recordTerms.forEach((row, i) => {
    if (!people.has(row.commander)) err('unknown-reference', W('rules.combat.bombardment.recordTerms', i, 'commander'), `"${row.commander}" is not a person in this pack`, 'the commander named by the cited surrender record');
  });
  const clashable = new Set(world.rules.people.verbs.orderValues.flatMap((r) => r.clashes));
  // Lane 1.11a (hard rule 7; 0074): a cell whose every admissible citation is weak is refused. A citation is weak when its
  // source is on the gate's weak list (memoirs, self-reports, pointers) or banned, or its place carries a weak marker
  // (`snippet`, `self-report`, `after-start`). A cell with a strong citation beside weak ones stands.
  const weakSet = new Set([...(pack.weakSources ?? []), ...(pack.bannedSources ?? [])]);
  // 0085: a citation that states its date (`dated YYYY-MM-DD` in its place) is also weak when the date is past its cell's
  // boundary: an innate cell (the pack's innate stats and traits) counts evidence up to the end of the window, every other
  // cell only evidence before the start. The pack's `evidence` policy holds the boundaries and the mapping.
  const evidence = pack.evidencePolicy ?? null;
  const classOf = (kind: 'stat' | 'trait' | 'other', name = ''): EvidenceClass =>
    evidence !== null && ((kind === 'stat' && evidence.innateStats.includes(name)) || (kind === 'trait' && evidence.innateTraits.includes(name))) ? 'innate' : 'start';
  const weakOnly = (cites: readonly w.Citation[], cls: EvidenceClass): boolean => {
    const admissible = cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer');
    return admissible.length > 0 && admissible.every((x) => weakSet.has(x.source) || hasWeakMarker(x.at) || datedAfterBoundary(x.at, cls, evidence));
  };
  // A contemporary leg (0087): a citation of a primary source that is not weak, carries no weak marker, and is not dated past its
  // boundary. A later reference work (the policy's `referenceWorks`) states facts and is never a leg for a judgment or a bloc.
  const referenceWorks = new Set(evidence?.referenceWorks ?? []);
  const hasContemporaryLeg = (cites: readonly w.Citation[], cls: EvidenceClass): boolean =>
    cites.some((x) => sources.get(x.source)?.kind === 'primary' && !referenceWorks.has(x.source) && !weakSet.has(x.source) && !hasWeakMarker(x.at) && !datedAfterBoundary(x.at, cls, evidence));
  const noLegExpected = 'a citation of a primary source (a document of the time, or one printed verbatim in a later work: not a later reference work) that is not weak and is not dated past the cell’s boundary; or hold the judgment back (0087)';
  const weakExpected ='a citation of a source the gate does not mark weak (not a memoir, a self-report, a snippet, or evidence dated after its cell’s boundary: 5 March 1861 for a cell true at the start, 31 July 1861 for an innate stat or trait), or leave the cell unknown';
  world.people.forEach((p, i) => {
    const at = (f?: string) => W('people', i, f);
    useKey(p.name, at('name'));
    refCheck(factions, 'faction', p.faction, at('faction'));
    term('personKinds', p.kind, at('kind'));
    term('blocs', p.bloc, at('bloc'));
    if (p.service !== undefined) {
      refCheck(departments, 'department', p.service.government, at('service.government'));
      refCheck(factions, 'faction', p.service.toFaction, at('service.toFaction'));
      term('blocs', p.service.toBloc, at('service.toBloc'));
      citeCheck(p.service.cites, at('service.cites'), true, 'the service choice');
      if (p.service.toFaction === p.faction) err('service-side', at('service.toFaction'), 'resignation must join another side');
      if (p.service.government === null && p.service.historicalOn === null) err('service-trigger', at('service'), 'a service choice needs a government or a historical date');
    }
    // Every record cites a real source, invented or not (review F7); only the centres and traits of an invented person need none.
    citeCheck(p.provenance, at(), true, 'this person');
    if (p.invented && !manifest.allowsInventedPeople) {
      err('invented-not-allowed', at('invented'), 'this pack does not allow invented people', 'allowsInventedPeople: true in pack.json, for a pack with fictional people; a historical person is never invented');
    }
    for (const stat of w.CENTRE_STATS) {
      const c = p.centres[stat];
      citeCheck(c.cites, at(`centres.${stat}.cites`), false, `the ${stat} centre`);
      if (c.direction === null) {
        if (c.cites.length > 0) warn('redundant-value', at(`centres.${stat}`), 'an unknown centre carries citations', 'a direction, or no citations');
        else if (!p.invented) issueAt(release ? 'error' : 'warning', 'unknown-value', at(`centres.${stat}`), `the ${stat} centre is unknown`);
      } else if (!p.invented) {
        const admissible = c.cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer');
        if (admissible.length === 0) {
          err('centre-without-citation', at(`centres.${stat}`), `the ${stat} centre "${c.direction}" has no admissible citation`, 'a citation of a primary or secondary source (pointers do not count; FOUNDATION section 6)');
        } else if (weakOnly(c.cites, classOf('stat', stat))) {
          err('weak-citations-only', at(`centres.${stat}`), `the ${stat} centre "${c.direction}" rests only on weak citations`, weakExpected);
        }
      }
    }
    // Lane 1.1: temperament and regard are centres like the stats: a direction needs an admissible citation. An unknown one
    // is allowed without a warning while the cast's research is open (lane 1.9).
    for (const [field, c] of [['temperament.boldness', p.temperament.boldness], ['temperament.candour', p.temperament.candour], ['regard', p.regard]] as const) {
      citeCheck(c.cites, at(`${field}.cites`), false, `the ${field} centre`);
      if (c.direction === null) {
        if (c.cites.length > 0) warn('redundant-value', at(field), `an unknown ${field} centre carries citations`, 'a direction, or no citations');
      } else if (!p.invented && c.cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer').length === 0) {
        err('centre-without-citation', at(field), `the ${field} centre "${c.direction}" has no admissible citation`, 'a citation of a primary or secondary source (pointers do not count; FOUNDATION section 6)');
      } else if (!p.invented && c.direction !== null && weakOnly(c.cites, classOf('other'))) {
        err('weak-citations-only', at(field), `the ${field} centre "${c.direction}" rests only on weak citations`, weakExpected);
      }
    }
    // Lane 1.5: regard for others names people of the World, each cited.
    p.regardOthers.forEach((o, j) => {
      refCheck(people, 'person', o.toward, at(`regardOthers[${j}].toward`));
      citeCheck(o.cites, at(`regardOthers[${j}].cites`), false, `regard toward ${o.toward}`);
      if (!p.invented && o.cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer').length === 0) {
        err('centre-without-citation', at(`regardOthers[${j}]`), `regard toward ${o.toward} has no admissible citation`, 'a citation of a primary or secondary source');
      } else if (!p.invented && weakOnly(o.cites, classOf('other'))) {
        err('weak-citations-only', at(`regardOthers[${j}]`), `regard toward ${o.toward} rests only on weak citations`, weakExpected);
      }
    });
    // Lane 1.5b: a practice is one some row of the map clashes with (else it could never bite), each cited, never twice.
    p.practices.forEach((pr, j) => {
      if (!clashable.has(pr.practice)) err('unknown-reference', at(`practices[${j}].practice`), `practice "${pr.practice}" is not one any order of the map clashes with`, 'a practice named in some rules.people.verbs.orderValues row’s clashes');
      if (p.practices.findIndex((x) => x.practice === pr.practice) !== j) err('duplicate-id', at(`practices[${j}]`), `practice "${pr.practice}" is listed twice`);
      citeCheck(pr.cites, at(`practices[${j}].cites`), false, `practice "${pr.practice}"`);
      if (!p.invented && pr.cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer').length === 0) {
        err('value-without-citation', at(`practices[${j}]`), `practice "${pr.practice}" has no admissible citation`, 'a citation of a primary or secondary source');
      } else if (!p.invented && weakOnly(pr.cites, classOf('other'))) {
        // Lane 1.11a's rule reaches practices too: gate content resting only on weak citations is refused.
        err('weak-citations-only', at(`practices[${j}]`), `practice "${pr.practice}" rests only on weak citations`, weakExpected);
      }
    });
    p.values.forEach((v, j) => {
      term('values', v.value, at(`values[${j}].value`));
      citeCheck(v.cites, at(`values[${j}].cites`), false, `value "${v.value}"`);
      if (p.values.findIndex((x) => x.value === v.value) !== j) err('duplicate-id', at(`values[${j}]`), `value "${v.value}" is listed twice`);
      if (!p.invented && v.cites.filter((x) => sources.has(x.source) && sources.get(x.source)!.kind !== 'pointer').length === 0) {
        err('value-without-citation', at(`values[${j}]`), `value "${v.value}" has no admissible citation`, 'a citation of a primary or secondary source (0005: each centre cited)');
      } else if (!p.invented && weakOnly(v.cites, classOf('other'))) {
        err('weak-citations-only', at(`values[${j}]`), `value "${v.value}" rests only on weak citations`, weakExpected);
      }
    });
    p.traits.forEach((t, j) => {
      term('traits', t.trait, at(`traits[${j}].trait`));
      citeCheck(t.cites, at(`traits[${j}].cites`), false, `trait "${t.trait}"`);
      if (!p.invented && t.cites.filter((x) => sources.get(x.source)?.kind !== 'pointer').length === 0) {
        err('trait-without-citation', at(`traits[${j}]`), `trait "${t.trait}" has no admissible citation`, 'a cited act (traits are proved by what he did)');
      } else if (!p.invented && weakOnly(t.cites, classOf('trait', t.trait))) {
        err('weak-citations-only', at(`traits[${j}]`), `trait "${t.trait}" rests only on weak citations`, weakExpected);
      }
    });
    // 0087: a judgment (reputation, competence, nerve, boldness, candour, regard, a value, a trait that is not a fact) needs a
    // contemporary leg: a primary source, not weak, and not dated past its cell's boundary. Until the older cells are
    // re-sourced this is a warning that lists each one; a pack without an `evidence` policy is not checked.
    if (!p.invented && evidence !== null) {
      const judged = (field: string, what: string, cites: readonly w.Citation[], cls: EvidenceClass) => {
        if (cites.length > 0 && !hasContemporaryLeg(cites, cls)) warn('no-contemporary-leg', at(field), `${what} rests on no contemporary leg`, noLegExpected);
      };
      for (const stat of ['competence', 'nerve', 'reputation'] as const) {
        const c = p.centres[stat];
        if (c.direction !== null) judged(`centres.${stat}`, `the ${stat} centre "${c.direction}"`, c.cites, classOf('stat', stat));
      }
      for (const [field, c] of [['temperament.boldness', p.temperament.boldness], ['temperament.candour', p.temperament.candour], ['regard', p.regard]] as const) {
        if (c.direction !== null) judged(field, `the ${field} centre "${c.direction}"`, c.cites, classOf('other'));
      }
      p.regardOthers.forEach((o, j) => judged(`regardOthers[${j}]`, `regard toward ${o.toward}`, o.cites, classOf('other')));
      p.values.forEach((v, j) => judged(`values[${j}]`, `value "${v.value}"`, v.cites, classOf('other')));
      p.traits.forEach((t, j) => {
        if (!evidence.factTraits.includes(t.trait)) judged(`traits[${j}]`, `trait "${t.trait}"`, t.cites, classOf('trait', t.trait));
      });
    }
    // 0087: a bloc is a start-class judgment: it needs a contemporary leg dated before the start (a warning until the cast is re-sourced).
    const blocCites = p.blocCites ?? [];
    citeCheck(blocCites, at('blocCites'), false, 'his bloc');
    if (!p.invented && evidence !== null && p.bloc !== null && !evidence.factBlocs.includes(p.bloc) && !hasContemporaryLeg(blocCites, classOf('other'))) {
      warn('no-contemporary-leg', at('bloc'), `bloc "${p.bloc}" rests on no contemporary leg`, noLegExpected);
    }
    p.ranks.forEach((r, j) => {
      term('ranks', r.rank, at(`ranks[${j}].rank`));
      if (j > 0 && r.from < p.ranks[j - 1]!.from) err('ranks-out-of-order', at(`ranks[${j}]`), 'ranks must be in date order');
      if (j > 0 && (rankOrder.get(r.rank) ?? 0) < (rankOrder.get(p.ranks[j - 1]!.rank) ?? 0)) warn('rank-demotion', at(`ranks[${j}]`), `"${r.rank}" is junior to the rank before it`);
    });
    if (p.born !== null && p.died !== null && p.died < p.born) err('date-order', at('died'), 'died before born');
    unknownsCheck('people', p as unknown as Record<string, unknown>, p.unknowns, (f) => at(f));
  });

  function unknownsCheck(table: string, record: Record<string, unknown>, unknowns: readonly string[], at: (f: string) => Where) {
    const may = MAY_DECLARE[table] ?? [];
    for (const f of unknowns) {
      if (!may.includes(f)) err('unknowns-field', at('unknowns'), `"${f}" cannot be declared unknown here`, `one of: ${may.join(', ')}`);
      else if (record[f] !== null) err('unknowns-field', at(f), `"${f}" is declared unknown but has a value`, 'empty, or remove it from unknowns');
      else issueAt(release ? 'error' : 'warning', 'unknown-value', at(f), `"${f}" is unknown (needs a source)`, release ? 'a value: a release pack has no unknowns' : undefined);
    }
    for (const f of MUST_DECLARE[table] ?? []) {
      if (record[f] === null && !unknowns.includes(f)) err('unlisted-null', at(f), `"${f}" is empty but not declared unknown`, `a value, or "unknown" (needs a source)`);
    }
  }

  // ---- scenarios
  const scenarioIds = new Set(scenarios.map((s) => s.id as string));
  manifest.scenarios.forEach((id, i) => {
    if (!scenarioIds.has(id)) sink.error('scenario-missing', 'pack.json', `scenarios[${i}]`, `scenario "${id}" is listed but has no data`, `source/scenarios/${id}/`);
  });
  // 0070: a region's land stays with its own people, in every scenario start: two polities never govern one region.
  const polityOf = new Map(world.departments.flatMap((d) => (d.polity === undefined ? [] : [[d.id as string, d.polity] as const])));
  const regionPolity = new Map<string, { readonly polity: string | null; readonly department: string }>();
  for (const s of scenarios) {
    if (!manifest.scenarios.includes(s.id)) sink.error('scenario-missing', 'pack.json', 'scenarios', `scenario "${s.id}" has data but is not listed`, 'every scenario listed in pack.json');
    validateScenario(s);
  }

  function validateScenario(s: w.ScenarioStart) {
    const scope = `scenario:${s.id}`;
    const S = (table: string, index: number, field?: string): Where => (field === undefined ? { scope, table, index } : { scope, table, index, field });
    useKey(s.name, S('scenario', 0, 'name'));

    const startFactions = new Set<string>();
    s.factions.forEach((f, i) => {
      refCheck(factions, 'faction', f.faction, S('factions', i, 'faction'));
      refCheck(people, 'person', f.principal, S('factions', i, 'principal'));
      refCheck(regions, 'region', f.capital, S('factions', i, 'capital'));
      const pf = f.principal === null ? null : (personFaction.get(f.principal) ?? null);
      if (pf !== null && pf !== f.faction) err('faction-mismatch', S('factions', i, 'principal'), `the principal "${f.principal}" serves faction "${pf}", not "${f.faction}"`, 'a principal of the same faction');
      if (startFactions.has(f.faction)) err('duplicate-entry', S('factions', i, 'faction'), `faction "${f.faction}" is listed twice`);
      startFactions.add(f.faction);
    });
    if (!s.factions.some((f) => f.playable)) err('no-playable-faction', S('factions', 0), 'no faction is playable in this start', 'at least one playable faction');

    function validateControlTable(rows: readonly w.RegionControlStart[], table: string) {
      const controlled = new Set<string>();
      rows.forEach((c, i) => {
        const where = S(table, i, 'region');
        refCheck(regions, 'region', c.region, where);
        const kind = regionKind.get(c.region);
        if (kind !== undefined && kind !== 'land' && kind !== 'key_point') err('control-region-kind', where, `region "${c.region}" is ${kind}, which carries no control`);
        if (controlled.has(c.region)) err('duplicate-entry', where, `region "${c.region}" has two control rows`);
        controlled.add(c.region);
        let sum = 0;
        c.shares.forEach((sh, j) => {
          refCheck(factions, 'faction', sh.faction, S(table, i, `shares[${j}].faction`));
          sum += sh.permille;
        });
        if (sum > 1000) err('control-sum', S(table, i), `control shares sum to ${sum}`, 'at most 1000 permille in all');
        if (new Set(c.shares.map((x) => x.faction)).size !== c.shares.length) err('duplicate-entry', S(table, i), 'a faction has two shares');
      });
      for (const r of world.regions) {
        if ((r.kind === 'land' || r.kind === 'key_point') && !controlled.has(r.id)) {
          err('control-missing', S(table, rows.length), `region "${r.id}" has no control row`, 'a control row for every land region and key point (empty shares for no one)');
        }
      }
    }
    validateControlTable(s.control, 'control');

    if (s.openingControl !== undefined) {
      const { authors, table } = s.openingControl;
      const named = new Set<string>();
      authors.forEach(({ faction, post }, i) => {
        const row = s.posts.find((p) => p.id === post);
        if (!startFactions.has(faction) || named.has(faction)) {
          err('opening-control-author', S('openingControl.authors', i, 'faction'), `expected one author per scenario faction, got "${faction}"`);
        }
        if (row === undefined || row.holder === null || world.departments.find((d) => d.id === row.department)?.faction !== faction) {
          err('opening-control-author', S('openingControl.authors', i, 'post'), `"${post}" must be a filled post of "${faction}"`);
        }
        named.add(faction);
      });
      for (const f of startFactions) {
        if (!named.has(f)) err('opening-control-author', S('openingControl.authors', authors.length), `no author for "${f}"`);
      }
      if (table !== undefined) validateControlTable(table, 'openingControl.table');
    }
    s.fortification.forEach((f, i) => refCheck(regions, 'region', f.region, S('fortification', i, 'region')));
    // Lane 1.7: loyalty, checked as control is (never a stand-in for it): known regions and factions, at most 1000 in all.
    const loyal = new Set<string>();
    s.loyalty.forEach((l, i) => {
      refCheck(regions, 'region', l.region, S('loyalty', i, 'region'));
      if (loyal.has(l.region)) err('duplicate-entry', S('loyalty', i, 'region'), `region "${l.region}" has two loyalty rows`);
      loyal.add(l.region);
      l.shares.forEach((sh, j) => refCheck(factions, 'faction', sh.faction, S('loyalty', i, `shares[${j}].faction`)));
      const sum = l.shares.reduce((n, sh) => n + sh.permille, 0);
      if (sum > 1000) err('loyalty-sum', S('loyalty', i), `loyalty shares sum to ${sum}`, 'at most 1000 permille in all');
      if (new Set(l.shares.map((x) => x.faction)).size !== l.shares.length) err('duplicate-entry', S('loyalty', i), 'a faction has two shares');
    });
    // Lane 1.11: temporary posts the start declares for a situation to open (0040): a temporary kind creatable in play,
    // a known department, parent post, holder and region, and an id no post at the start already has.
    const startPosts = new Set(s.posts.map((p) => p.id as string));
    // Lane 1.11: a declared government is a government department that governs nothing at the start.
    const governingAtStart = new Set(s.governments.map((g) => g.department as string));
    s.declaredGovernments.forEach((g, i) => {
      refCheck(departments, 'department', g.id, S('declaredGovernments', i, 'id'));
      if (governingAtStart.has(g.id)) err('declared-government', S('declaredGovernments', i, 'id'), `"${g.id}" already governs a region at the start`, 'a government that governs nothing until a situation establishes it');
      g.regions.forEach((r, j) => refCheck(regions, 'region', r, S('declaredGovernments', i, `regions[${j}]`)));
    });
    s.temporaryPosts.forEach((p, i) => {
      const kind = vocab.postKinds.find((k) => k.id === p.kind);
      if (kind === undefined || !kind.temporary || kind.creatable === 'start_only') err('temporary-post', S('temporaryPosts', i, 'kind'), `kind "${p.kind}" is not a temporary post kind creatable in play`, 'a post kind the vocabulary marks temporary and not start_only');
      refCheck(departments, 'department', p.department, S('temporaryPosts', i, 'department'));
      if (p.parent !== null && !startPosts.has(p.parent)) err('unknown-reference', S('temporaryPosts', i, 'parent'), `"${p.parent}" is not a post of this start`, 'a post of the same start');
      if (p.holder !== null) refCheck(people, 'person', p.holder, S('temporaryPosts', i, 'holder'));
      if (p.region !== null) refCheck(regions, 'region', p.region, S('temporaryPosts', i, 'region'));
      if (startPosts.has(p.id)) err('duplicate-entry', S('temporaryPosts', i, 'id'), `"${p.id}" is already a post at the start`, 'an id for a post the start does not open');
    });
    s.edgeConditions.forEach((c, i) => refCheck(edges, 'edge', c.edge, S('edgeConditions', i, 'edge')));
    s.depotConditions.forEach((c, i) => refCheck(depots, 'depot', c.depot, S('depotConditions', i, 'depot')));
    s.obstructions.forEach((o, i) => {
      refCheck(edges, 'edge', o.edge, S('obstructions', i, 'edge'));
      refCheck(installations, 'installation', o.by, S('obstructions', i, 'by'));
      const e = edgeById.get(o.edge);
      if (e && e.type !== 'river' && e.type !== 'sea') err('obstruction-on-land', S('obstructions', i, 'edge'), `only water edges are obstructed, and "${o.edge}" is ${e.type}`);
      citeCheck(o.provenance, S('obstructions', i), true, 'this obstruction');
    });

    // 0058: each land region's civil government. Jurisdiction, not control: a department whose kind the pack marks
    // as a government, or unknown (not neutral ground). Water and off-map regions have none.
    const governed = new Set<string>();
    s.governments.forEach((g, i) => {
      refCheck(regions, 'region', g.region, S('governments', i, 'region'));
      if (governed.has(g.region)) err('duplicate-entry', S('governments', i, 'region'), `region "${g.region}" has two government rows`, 'one row per region');
      governed.add(g.region);
      const rk = regionKind.get(g.region);
      if (rk !== undefined && rk !== 'land' && rk !== 'key_point') err('government-on-water', S('governments', i, 'region'), `"${g.region}" is a ${rk} region, which has no civil government`, 'rows for land regions and key points only');
      if (g.department !== w.UNKNOWN_GOVERNMENT) {
        // A department with no polity counts as none: a region one people's government holds in one start must not pass to a
        // department of no people (a state, a territory) in another (gate re-check N5), nor to another people's.
        const polity = polityOf.get(g.department) ?? null;
        const seen = regionPolity.get(g.region);
        if (seen === undefined) regionPolity.set(g.region, { polity, department: g.department });
        else if (seen.polity !== polity) err('polity-shared-region', S('governments', i, 'department'), `region "${g.region}" is governed by "${g.department}" (${polity === null ? 'no polity' : `polity ${polity}`}) here and by "${seen.department}" (${seen.polity === null ? 'no polity' : `polity ${seen.polity}`}) in another start: a people's land stays with its own people`, 'one polity per region across every start (0070)');
      }
      if (g.department !== w.UNKNOWN_GOVERNMENT) {
        refCheck(departments, 'department', g.department, S('governments', i, 'department'));
        const dk = deptKind.get(g.department);
        if (dk !== undefined && !governmentKinds.has(dk)) {
          err('not-a-government', S('governments', i, 'department'), `"${g.department}" is a ${dk} department, which the pack does not mark as a government`, `a department of a government kind (${[...governmentKinds].join(', ') || 'none in this pack'}), or unknown`);
        }
      }
      citeCheck(g.provenance, S('governments', i), true, 'this government');
    });
    world.regions.forEach((r) => {
      if ((r.kind === 'land' || r.kind === 'key_point') && !governed.has(r.id)) {
        err('government-missing', S('governments', s.governments.length), `region "${r.id}" has no government row`, 'a row for every land region and key point: a government department, or unknown with the reason');
      }
    });

    const posts = idSet('posts', s.posts, scope);
    const postById = new Map(s.posts.map((p) => [p.id as string, p]));
    const postKinds = new Map(vocab.postKinds.map((k) => [k.id, k]));
    s.posts.forEach((p, i) => {
      const at = (f?: string) => S('posts', i, f);
      useKey(p.name, at('name'));
      term('postKinds', p.kind, at('kind'));
      refCheck(departments, 'department', p.department, at('department'));
      refCheck(posts, 'post', p.parent, at('parent'));
      refCheck(people, 'person', p.holder, at('holder'));
      refCheck(regions, 'region', p.region, at('region'));
      refCheck(installations, 'installation', p.installation, at('installation'));
      refCheck(railLines, 'rail line', p.railLine, at('railLine'));
      citeCheck(p.provenance, at(), true, 'this post');
      const kind = postKinds.get(p.kind);
      if (kind && kind.temporary !== (p.temporary !== null)) {
        err('temporary-post', at('temporary'), kind.temporary ? `post kind "${p.kind}" is temporary: name the operation it dissolves with` : `post kind "${p.kind}" is not temporary`, kind.temporary ? 'an operation id' : 'empty');
      }
      const side = allegiance(p.department);
      const parent = p.parent === null ? undefined : postById.get(p.parent);
      if (parent) {
        const pf = allegiance(parent.department);
        if (pf !== undefined && side !== undefined && pf !== side) err('chain-crosses-factions', at('parent'), `the post answers to "${parent.id}" of another side`, 'a parent on the same side (use a link for cooperation)');
      }
      // 0058: the intelligence chief exists and is on the post's side (a neutral government's chief serves no faction).
      refCheck(people, 'person', p.intelligenceChief, at('intelligenceChief'));
      if (p.intelligenceChief !== null && personFaction.has(p.intelligenceChief) && deptFaction.has(p.department) && personFaction.get(p.intelligenceChief) !== deptFaction.get(p.department)) {
        err('faction-mismatch', at('intelligenceChief'), `the intelligence chief "${p.intelligenceChief}" serves ${personFaction.get(p.intelligenceChief) ?? 'no faction'}, but the post belongs to ${deptFaction.get(p.department) ?? 'a neutral government'}`, 'a chief on the post’s side');
      }
      const hf = p.holder === null ? null : (personFaction.get(p.holder) ?? null);
      if (hf !== null && side !== undefined && hf !== side) err('faction-mismatch', at('holder'), `the holder "${p.holder}" serves faction "${hf}", but the post belongs to "${side}"`, 'a holder of the same faction');
      p.links.forEach((l, j) => {
        const lat = at(`links[${j}]`);
        refCheck(posts, 'post', l.post, { ...lat, field: `${lat.field}.post` });
        if (l.post === p.id) return err('edge-self-loop', lat, 'a post links to itself');
        const other = postById.get(l.post);
        if (!other) return;
        const of = allegiance(other.department);
        // Links are for cooperation inside a side; dealings with the enemy (a truce) are standing agreements or situations.
        if (of !== undefined && side !== undefined && of !== side) err('chain-crosses-factions', lat, `a ${l.kind} link to "${other.id}", which is on another side`, 'links within one side; a truce with the enemy is a standing agreement');
        if (l.kind === 'joint') {
          const problems: string[] = [];
          if (p.temporary === null || other.temporary === null) problems.push('both posts must be temporary');
          else if (p.temporary.operation !== other.temporary.operation) problems.push(`the operations differ ("${p.temporary.operation}" and "${other.temporary.operation}")`);
          if (p.department === other.department) problems.push('both posts are in the same department, so one post would do');
          if (!other.links.some((x) => x.kind === 'joint' && x.post === p.id)) problems.push(`"${other.id}" does not link back`);
          for (const pr of problems) err('joint-link', lat, `joint link to "${other.id}": ${pr}`, 'two temporary posts of one operation, in different departments, linked both ways');
        }
      });
      let previous = s.startDate;
      p.departmentChanges.forEach((c, j) => {
        refCheck(departments, 'department', c.department, at(`departmentChanges[${j}].department`));
        refCheck(posts, 'post', c.parent, at(`departmentChanges[${j}].parent`));
        const newParent = c.parent === null ? undefined : postById.get(c.parent);
        if (c.parent === p.id) err('chain-cycle', at(`departmentChanges[${j}].parent`), 'a post cannot answer to itself');
        else if (newParent && allegiance(newParent.department) !== undefined && allegiance(newParent.department) !== allegiance(c.department)) {
          err('chain-crosses-factions', at(`departmentChanges[${j}].parent`), `the new parent "${newParent.id}" is on another side from the new department`, 'a parent on the same side');
        }
        citeCheck(c.provenance, at(`departmentChanges[${j}]`), true, 'this department change');
        if (c.on <= previous) err('date-order', at(`departmentChanges[${j}].on`), `department changes must fall after the start (${s.startDate}) and each other`, `a date after ${previous}`);
        previous = c.on;
        if (allegiance(c.department) !== undefined && side !== undefined && allegiance(c.department) !== side) {
          err('chain-crosses-factions', at(`departmentChanges[${j}].department`), 'a scheduled department change cannot move a post to another side; changing sides is for situations');
        }
      });
      const orderIds = new Set<string>();
      p.standingOrders.forEach((o, j) => {
        const oat = at(`standingOrders[${j}]`);
        if (orderIds.has(o.id)) err('duplicate-id', oat, `standing order "${o.id}" appears twice on this post`);
        orderIds.add(o.id);
        term('standingOrderKinds', o.kind, { ...oat, field: `${oat.field}.kind` });
        refCheck(posts, 'post', o.from, { ...oat, field: `${oat.field}.from` });
        useKey(o.summary, { ...oat, field: `${oat.field}.summary` });
        citeCheck(o.cites, { ...oat, field: `${oat.field}.cites` }, true, 'this standing order');
        if (o.issuedOn > s.startDate) err('date-order', { ...oat, field: `${oat.field}.issuedOn` }, `issued after the start (${s.startDate})`, 'a standing order already in force at the start');
      });
      unknownsCheck('posts', p as unknown as Record<string, unknown>, p.unknowns, (f) => at(f));
    });
    // Chains of command have no cycles.
    s.posts.forEach((p, i) => {
      const seen = new Set<string>([p.id]);
      let cur = p.parent === null ? undefined : postById.get(p.parent);
      while (cur) {
        if (seen.has(cur.id)) {
          err('chain-cycle', S('posts', i, 'parent'), `the chain of command from "${p.id}" loops back through "${cur.id}"`, 'a chain that ends at a post with no parent');
          break;
        }
        seen.add(cur.id);
        cur = cur.parent === null ? undefined : postById.get(cur.parent);
      }
    });

    const blocks = idSet('forceBlocks', s.forceBlocks, scope);
    const blockById = new Map(s.forceBlocks.map((b) => [b.id as string, b]));
    s.forceBlocks.forEach((b, i) => {
      const at = (f?: string) => S('forceBlocks', i, f);
      useKey(b.name, at('name'));
      refCheck(departments, 'department', b.department, at('department'));
      refCheck(posts, 'post', b.post, at('post'));
      refCheck(regions, 'region', b.region, at('region'));
      refCheck(blocks, 'force block', b.parent, at('parent'));
      refCheck(blocks, 'force block', b.aboard, at('aboard'));
      term('arms', b.arm, at('arm'));
      citeCheck(b.provenance, at(), true, 'this force block');
      if (b.kind === 'detachment' && b.parent === null) err('detachment-parent', at('parent'), 'a detachment needs the block it belongs to', 'a force block id');
      if (b.kind === 'block' && b.parent !== null) err('detachment-parent', at('parent'), 'a block has no parent; make it a detachment', 'empty, or kind detachment');
      const parent = b.parent === null ? undefined : blockById.get(b.parent);
      if (parent && parent.kind !== 'block') err('detachment-parent', at('parent'), `"${parent.id}" is itself a detachment`, 'detachments sit directly below a block');
      const side = allegiance(b.department);
      const naval = arms.get(b.arm)?.naval === true;
      const carrier = b.aboard === null ? undefined : blockById.get(b.aboard);
      if (carrier) {
        if (!arms.get(carrier.arm)?.naval) err('aboard-not-naval', at('aboard'), `"${carrier.id}" is not a naval block`, 'a block whose arm is naval');
        if (carrier.region !== b.region) err('aboard-elsewhere', at('region'), `the block is in "${b.region}" but its carrier "${carrier.id}" is in "${carrier.region}"`, 'the same region as its carrier');
        if (carrier.aboard !== null) err('aboard-cycle', at('aboard'), `the carrier "${carrier.id}" is itself aboard "${carrier.aboard}"`, 'a carrier that is not aboard anything');
        const cf = allegiance(carrier.department);
        if (cf !== undefined && side !== undefined && cf !== side) err('faction-mismatch', at('aboard'), `the carrier "${carrier.id}" is on another side`, 'a carrier of the same side');
      }
      const kind = regionKind.get(b.region);
      if ((kind === 'river' || kind === 'sea') && !naval && b.aboard === null) {
        err('afloat-without-ship', at('aboard'), `a ${b.arm} block stands in "${b.region}", a ${kind} region, without a ship`, 'troops on water are aboard a naval block');
      }
      if (naval && kind === 'land' && !world.regions.find((r) => r.id === b.region)?.flags.includes('port')) {
        warn('ship-ashore', at('region'), `a naval block is in "${b.region}", a land region with no port`, 'a water region, a key point or a port');
      }
      const post = b.post === null ? undefined : postById.get(b.post);
      if (post) {
        const pf = allegiance(post.department);
        if (pf !== undefined && side !== undefined && pf !== side) err('chain-crosses-factions', at('post'), `the block's department is on side "${side}" but its commander's post is on "${pf}"`, 'a commanding post on the same side');
      }
      unknownsCheck('forceBlocks', b as unknown as Record<string, unknown>, b.unknowns, (f) => at(f));
      // Stores carry their date as strengths do (0065, 0056): informational in Phase 0, required when stores are given.
      if (b.storesDays !== null && b.storesDate === null) err('missing-value', at('storesDate'), `stores of ${b.storesDays} days are given without the date of the figure`, 'the date the stores figure is as of: ISO, year-month or year');
      if (b.storesDays === null && b.storesDate !== null) err('missing-value', at('storesDays'), `a stores date (${b.storesDate}) is given without stores`, 'the days of stores the date belongs to, or no date');
    });
  }

  // ---- string tables: keys, ICU syntax, NFC
  const locales = pack.strings;
  const defaultTables = locales.get(manifest.defaultLocale) ?? [];
  if (!locales.has(manifest.defaultLocale)) sink.error('missing-string-table', 'pack.json', 'defaultLocale', `no string table for the default locale "${manifest.defaultLocale}"`, `strings/${manifest.defaultLocale}.json`);
  const defined = new Map<string, string>();
  for (const { file, table } of defaultTables) {
    for (const key of Object.keys(table)) {
      const first = defined.get(key);
      if (first !== undefined) {
        // Point at the hand-written file: the generated one is never edited.
        const [here, other] = file.startsWith('data/') ? [first, file] : [file, first];
        sink.error('duplicate-string', here, key, `key "${key}" is also defined in ${other}`, 'each key in one file');
      }
      defined.set(key, file);
    }
  }
  useKey(manifest.name, { scope: 'world', table: 'pack', index: 0, field: 'name' });
  const missing = new Set<string>();
  for (const { key, where } of referencedKeys) {
    if (!defined.has(key) && !missing.has(key)) {
      missing.add(key);
      err('missing-string', where, `string key "${key}" has no text in the ${manifest.defaultLocale} table`, `an entry in strings/${manifest.defaultLocale}.json or a name in the source`);
    }
  }
  for (const [locale, tables] of locales) {
    if (!manifest.locales.includes(locale)) sink.error('missing-string-table', tables[0]?.file ?? 'strings', '', `locale "${locale}" is not listed in pack.json`);
    for (const { file, table } of tables) {
      for (const [key, message] of Object.entries(table)) {
        try {
          new IntlMessageFormat(message, locale);
        } catch (e) {
          sink.error('icu-syntax', file, key, `not a valid ICU message: ${(e as Error).message}`, 'ICU MessageFormat syntax (decision 0035)');
        }
        if (locale !== manifest.defaultLocale && !defined.has(key)) sink.warn('stray-string', file, key, `key "${key}" is not in the default locale's table`);
      }
    }
  }
  for (const locale of manifest.locales) {
    if (!locales.has(locale)) sink.warn('missing-string-table', 'pack.json', 'locales', `no string table for locale "${locale}"`);
  }

  // A6 in every citation (lane 1.8b): a source the gate bans as evidence may not be cited anywhere in the pack, people's
  // centres included, not only on situations. One error per record, listing each banned citation in it. It was a warning
  // until lane 1.11a re-sourced the Union rows that cited the two memoirs; it is an error from that merge.
  const banned = new Set(pack.bannedSources ?? []);
  if (banned.size > 0) {
    const flag = (where: (field: string) => Where, record: unknown) => {
      const hits = citationsIn(record).filter((c) => banned.has(c.source));
      if (hits.length === 0) return;
      err(
        'banned-source-cited',
        where(hits[0]!.path),
        `cites a source the gate bans as evidence (A6): ${hits.map((h) => `"${h.source}" at ${h.path}`).join(', ')}`,
        'another source: a banned memoir may be a lead to a primary document, never the citation',
      );
    };
    for (const table of WORLD_RECORD_TABLES) (world[table] as readonly unknown[]).forEach((record, i) => flag((field) => W(table, i, field), record));
    for (const s of scenarios) {
      const scope = `scenario:${s.id}`;
      for (const [table, rows] of Object.entries(s)) {
        if (Array.isArray(rows)) rows.forEach((record, i) => flag((field) => ({ scope, table, index: i, field }), record));
      }
    }
  }

  // NFC (decision 0044) is checked where text is read, in `readJson` and the
  // CSV reader, so each problem points at the cell or JSON path a person edits.
  return sink.issues;
}

/** The World's tables of records, each of which may carry citations. */
const WORLD_RECORD_TABLES = ['departments', 'regions', 'installations', 'edges', 'railLines', 'depots', 'weatherZones', 'people'] as const;

function ascendingUnique(xs: readonly number[]): boolean {
  return xs.every((x, i) => i === 0 || x > xs[i - 1]!);
}

/** Visit every string (keys and values) in a JSON-like value. */
export function walkStrings(value: unknown, path: string, visit: (s: string, path: string) => void): void {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, visit));
  else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      visit(k, path ? `${path}.${k}` : k);
      walkStrings(v, path ? `${path}.${k}` : k, visit);
    }
  }
}
