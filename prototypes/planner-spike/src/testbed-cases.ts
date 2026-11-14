/**
 * The spike's three cases on the testbed pack's `opening` start (fictional,
 * setting-free; it may be named here because this is a fixture, not engine code).
 *
 * The planner reads only `PlannerInput`. This file builds it: the World and
 * the derived map through the kernel's public APIs, force blocks and posts
 * from the start (lane 0.5's types, field for field), and his beliefs through
 * the stand-in belief formula (perception applied once, in belief derivation).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type PackFiles } from '@mandate/pack-format';
import { DEFAULT_RULES, type PlannerInput, type PlannerRules, type PostInfo } from './context.ts';
import { beliefsFor, boldnessOf, competenceOf, profileOf, traitHolder } from './profile.ts';
import type { ForceStandIn, Goal, PostId, RegionId } from './types.ts';

const root = fileURLToPath(new URL('../../../packs/testbed/', import.meta.url));
const files: PackFiles = {
  read: (p) => {
    const full = join(root, ...p.split('/'));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
  },
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  files: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name),
};

export interface Testbed {
  readonly map: w.WorldIndex;
  readonly opening: w.ScenarioStart;
  readonly derived: phase0.DerivedMap;
  readonly network: phase0.NetworkConditions;
  readonly forces: readonly ForceStandIn[];
  readonly posts: readonly PostInfo[];
  readonly fortification: ReadonlyMap<RegionId, number>;
  readonly month: number;
}

let cached: Testbed | null = null;

export function testbed(): Testbed {
  if (cached) return cached;
  const { pack } = loadPack(files);
  const map = w.indexWorld(pack!.world);
  const opening = pack!.scenarios.find((s) => s.id === 'opening')!;
  const control = phase0.initialControl(map, opening);
  const network = phase0.networkConditions(opening);
  const month = 4;
  const derived = phase0.deriveMap(map, { control, month, network });
  const forces: ForceStandIn[] = opening.forceBlocks
    .filter((b) => b.post !== null)
    .map((b) => ({ id: b.id, post: b.post!, region: b.region, kind: b.kind, arm: b.arm, strength: b.strength ?? 0, storesDays: b.storesDays ?? 0, aboard: b.aboard }));
  const posts: PostInfo[] = opening.posts.map((p) => ({ id: p.id, holder: p.holder, parent: p.parent, region: p.region, kind: p.kind }));
  const fortification = new Map(opening.fortification.map((f) => [f.region, f.levelPermille]));
  cached = { map, opening, derived, network, forces, posts, fortification, month };
  return cached;
}

const R = (id: string) => ids.toId('region', id);
const P = (id: string) => ids.toId('post', id);
const F = (id: string) => ids.toId('faction', id);

/** The side a post serves: its department's faction. */
export function sideOfPost(tb: Testbed, post: string): string | null {
  const dept = tb.opening.posts.find((p) => p.id === post)?.department;
  return tb.map.world.departments.find((d) => d.id === dept)?.faction ?? null;
}

/** What his side's intelligence reports of the enemy, region by region: the true blocks, before any bias. */
export function reportedEnemy(tb: Testbed, faction: string): Map<RegionId, number> {
  const out = new Map<RegionId, number>();
  for (const b of tb.forces) {
    if (sideOfPost(tb, b.post) !== faction) out.set(b.region, (out.get(b.region) ?? 0) + b.strength);
  }
  return new Map([...out].sort(([a], [b]) => (a < b ? -1 : 1)));
}

export interface CaseSpec {
  readonly name: string;
  readonly post: PostId;
  readonly goal: Goal;
}

export const CASES: readonly CaseSpec[] = [
  {
    name: 'pincer: take the Harrow Bulge between the two northern armies',
    post: P('n_army_west'),
    goal: { objective: R('salient_tip'), posture: 'take', risk: 500, deadlineDays: 10, permissions: { rail: true, river: false, sea: false }, committed: [] },
  },
  {
    name: 'supply-aware: march on Southvale from Westwatch',
    post: P('n_army_west'),
    goal: { objective: R('s_heartland'), posture: 'take', risk: 500, deadlineDays: 20, permissions: { rail: true, river: false, sea: false }, committed: [] },
  },
  {
    name: 'joint naval relief: relieve Gull Rock by sea',
    post: P('n_relief_army'),
    goal: { objective: R('island_fort'), posture: 'relieve', risk: 500, deadlineDays: 14, permissions: { rail: false, river: false, sea: true }, committed: [] },
  },
];

/** The people the spike seats in a post to show character: the testbed's three generals. */
export const COMMANDERS = ['n_appointee', 'n_organiser', 'n_fighter'] as const;

/**
 * The four seatings the spike compares: the testbed's three generals, and a
 * steady-competent stand-in (boldness 500, competence 650) seated as the
 * appointee, because the cast has no such man. Labelled; not pack data.
 */
export const SEATINGS: readonly { readonly label: string; readonly person: string; readonly seating: Seating }[] = [
  { label: 'appointee (bold 500, comp 350)', person: 'n_appointee', seating: {} },
  { label: 'organiser (bold 200, comp 650)', person: 'n_organiser', seating: {} },
  { label: 'fighter (bold 800, comp 650)', person: 'n_fighter', seating: {} },
  { label: 'steady stand-in (bold 500, comp 650)', person: 'n_appointee', seating: { boldness: 500, competence: 650 } },
];

export interface Seating {
  /** Override boldness (for the sensitivity sweep). */
  readonly boldness?: number;
  /** Override competence (the steady-competent stand-in, which the testbed's cast lacks). */
  readonly competence?: number;
  /** The intelligence source's bias, permille (1000: as reported). */
  readonly sourceBias?: number;
  readonly rules?: PlannerRules;
}

/** The planner input for a case with a given person in the post. */
export function inputFor(spec: CaseSpec, person: string, seating: Seating = {}): PlannerInput {
  const tb = testbed();
  const record = tb.map.world.people.find((p) => p.id === person)!;
  const boldness = seating.boldness ?? boldnessOf(record);
  const profile = profileOf(record.id, boldness, seating.competence ?? competenceOf(record));
  const { beliefs } = beliefsFor(reportedEnemy(tb, 'north'), seating.sourceBias ?? 1000, traitHolder(record.id, boldness));
  const faction = F('north');
  // He holds the post for this request (the testbed seats a different general in it to compare).
  const posts = tb.posts.map((p) => (p.id === spec.post ? { ...p, holder: record.id } : p));
  return {
    map: tb.map,
    month: tb.month,
    network: tb.network,
    controlIndex: tb.derived.index,
    supply: tb.derived.supply.factions.get(faction)!,
    faction,
    fortification: tb.fortification,
    beliefs,
    forces: tb.forces.filter((b) => sideOfPost(tb, b.post) === faction),
    posts: posts.filter((p) => sideOfPost(tb, p.id) === faction),
    post: spec.post,
    profile,
    goal: spec.goal,
    rules: seating.rules ?? DEFAULT_RULES,
  };
}
