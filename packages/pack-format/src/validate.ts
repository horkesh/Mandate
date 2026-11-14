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
import { world as w } from '@mandate/kernel';
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
  const seasonReasons = new Set(world.rules.seasons.map((s) => s.reason));
  world.rules.seasons.forEach((s, i) => {
    if (world.rules.seasons.findIndex((x) => x.reason === s.reason) !== i) err('duplicate-id', W('rules.seasons', i, 'reason'), `season reason "${s.reason}" is defined twice`);
    if (!ascendingUnique(s.defaultMonths)) err('season-months', W('rules.seasons', i, 'defaultMonths'), 'months must be ascending with no repeats');
  });
  if (world.rules.retreatControlPermille > world.rules.supplyControlPermille) {
    warn('rules-order', W('rules', 0, 'retreatControlPermille'), 'the retreat threshold is above the supply threshold', 'retreat at or below supply (0019: 50 and 250)');
  }

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
  world.departments.forEach((d, i) => {
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
      if (e.type === 'sea' && !ends.some((k) => k === 'sea' || k === 'off_map')) err('edge-end-kind', at('type'), 'a sea edge must touch a sea region or an off-map box', 'at least one sea or off-map end');
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
  world.people.forEach((p, i) => {
    const at = (f?: string) => W('people', i, f);
    useKey(p.name, at('name'));
    refCheck(factions, 'faction', p.faction, at('faction'));
    term('personKinds', p.kind, at('kind'));
    term('blocs', p.bloc, at('bloc'));
    if (!p.invented) citeCheck(p.provenance, at(), true, 'this person');
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
        }
      }
    }
    p.traits.forEach((t, j) => {
      term('traits', t.trait, at(`traits[${j}].trait`));
      citeCheck(t.cites, at(`traits[${j}].cites`), false, `trait "${t.trait}"`);
      if (!p.invented && t.cites.filter((x) => sources.get(x.source)?.kind !== 'pointer').length === 0) {
        err('trait-without-citation', at(`traits[${j}]`), `trait "${t.trait}" has no admissible citation`, 'a cited act (traits are proved by what he did)');
      }
    });
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

    const controlled = new Set<string>();
    s.control.forEach((c, i) => {
      refCheck(regions, 'region', c.region, S('control', i, 'region'));
      if (controlled.has(c.region)) err('duplicate-entry', S('control', i, 'region'), `region "${c.region}" has two control rows`);
      controlled.add(c.region);
      let sum = 0;
      c.shares.forEach((sh, j) => {
        refCheck(factions, 'faction', sh.faction, S('control', i, `shares[${j}].faction`));
        sum += sh.permille;
      });
      if (sum > 1000) err('control-sum', S('control', i), `control shares sum to ${sum}`, 'at most 1000 permille in all');
      if (new Set(c.shares.map((x) => x.faction)).size !== c.shares.length) err('duplicate-entry', S('control', i), 'a faction has two shares');
    });
    world.regions.forEach((r) => {
      if ((r.kind === 'land' || r.kind === 'key_point') && !controlled.has(r.id)) {
        err('control-missing', S('control', s.control.length), `region "${r.id}" has no control row`, 'a control row for every land region and key point (empty shares for no one)');
      }
    });
    s.fortification.forEach((f, i) => refCheck(regions, 'region', f.region, S('fortification', i, 'region')));
    s.edgeConditions.forEach((c, i) => refCheck(edges, 'edge', c.edge, S('edgeConditions', i, 'edge')));
    s.depotConditions.forEach((c, i) => refCheck(depots, 'depot', c.depot, S('depotConditions', i, 'depot')));
    s.obstructions.forEach((o, i) => {
      refCheck(edges, 'edge', o.edge, S('obstructions', i, 'edge'));
      refCheck(installations, 'installation', o.by, S('obstructions', i, 'by'));
      const e = edgeById.get(o.edge);
      if (e && e.type !== 'river' && e.type !== 'sea') err('obstruction-on-land', S('obstructions', i, 'edge'), `only water edges are obstructed, and "${o.edge}" is ${e.type}`);
      citeCheck(o.provenance, S('obstructions', i), true, 'this obstruction');
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

  // ---- NFC over every string in every pack file (decision 0044)
  const nfc = (file: string, value: unknown, path: string) => {
    walkStrings(value, path, (s, p) => {
      if (s.normalize('NFC') !== s) sink.error('not-nfc', file, p, 'text is not in Unicode NFC', 'NFC-normalised text (decision 0044)');
    });
  };
  nfc('data/world.json', world, '');
  for (const s of scenarios) nfc(`data/scenarios/${s.id}.json`, s, '');
  nfc('PROVENANCE.json', provenance, '');
  nfc('pack.json', manifest, '');
  for (const tables of locales.values()) for (const { file, table } of tables) nfc(file, table, '');

  return sink.issues;
}

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
