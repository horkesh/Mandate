import { sortedKeys, strictCompare } from './compare.ts';
import type { PersonId, ValueId } from './people.ts';
import { assertPermille, assertSignedPermille } from './permille.ts';
import type {
  Bloc,
  Checkpoint,
  Faction,
  GameState,
  ObjectiveKind,
  ObjectiveValues,
  Person,
  Post,
  Region,
} from './state.ts';

/**
 * Scenario data as a pack provides it (decision 0003). The kernel receives
 * parsed data; reading files is the caller's job (decision 0002: no I/O).
 */
export interface ScenarioData {
  readonly id: string;
  readonly seed: number;
  readonly minTurnDays: number;
  readonly maxTurnDays: number;
  readonly endDay: number;
  readonly objectiveValues: Readonly<Record<ObjectiveKind, ObjectiveValues>>;
  readonly factions: readonly {
    readonly id: string;
    readonly principalId: PersonId;
    readonly capitalRegionId: string;
    readonly isPlayer: boolean;
    readonly attentionPerTurn: number;
    readonly baseOversight: number;
    readonly oversightLossPerLinkDay: number;
    readonly name?: string;
  }[];
  readonly persons: readonly {
    readonly id: PersonId;
    readonly factionId: string;
    readonly values: readonly ValueId[];
    readonly boldness: number;
    readonly candour: number;
    readonly competence: number;
    readonly standing: number;
    readonly regard: number;
    readonly name?: string;
  }[];
  readonly posts: readonly {
    readonly id: string;
    readonly factionId: string;
    readonly kind: 'field' | 'office';
    readonly regionId: string;
    readonly holderId: PersonId | null;
    readonly force: number;
    readonly linkDays: number;
    readonly name?: string;
  }[];
  readonly regions: readonly {
    readonly id: string;
    readonly controllerId: string;
    readonly neighbours: readonly string[];
    readonly garrison: number;
    readonly name?: string;
  }[];
  readonly blocs: readonly {
    readonly id: string;
    readonly factionId: string;
    readonly weight: number;
    readonly values: readonly ValueId[];
    readonly support: number;
    readonly name?: string;
  }[];
  readonly checkpoints: readonly Checkpoint[];
}

export class ScenarioError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid scenario:\n- ${problems.join('\n- ')}`);
    this.name = 'ScenarioError';
  }
}

/** Validate scenario data and build the initial game state. */
export function createGame(data: ScenarioData): GameState {
  const problems = validateScenario(data);
  if (problems.length > 0) throw new ScenarioError(problems);

  // Display names are pack text: they stay out of game state (decision 0003).
  const factions: Record<string, Faction> = {};
  for (const { name: _name, ...f } of data.factions) {
    factions[f.id] = {
      ...f,
      attentionLeft: f.attentionPerTurn,
      record: [],
      promises: [],
    };
  }
  const persons: Record<string, Person> = {};
  for (const { name: _name, ...p } of data.persons) {
    persons[p.id] = {
      ...p,
      values: [...p.values].sort(strictCompare),
      status: 'active',
      grievances: [],
      ladder: 'loyal',
      overseen: false,
      pressuredUntil: -1,
      rival: false,
      lastFreelanceDay: -1000,
    };
  }
  const posts: Record<string, Post> = {};
  for (const { name: _name, ...p } of data.posts) posts[p.id] = { ...p };
  const regions: Record<string, Region> = {};
  for (const { name: _name, ...r } of data.regions) regions[r.id] = { ...r, neighbours: [...r.neighbours].sort(strictCompare) };
  const blocs: Record<string, Bloc> = {};
  for (const { name: _name, ...b } of data.blocs) blocs[b.id] = { ...b, values: [...b.values].sort(strictCompare) };

  return {
    schemaVersion: 1,
    scenarioId: data.id,
    seed: data.seed,
    day: 0,
    turn: 0,
    minTurnDays: data.minTurnDays,
    maxTurnDays: data.maxTurnDays,
    endDay: data.endDay,
    objectiveValues: data.objectiveValues,
    factions,
    persons,
    posts,
    regions,
    blocs,
    directives: {},
    operations: {},
    messages: [],
    claims: [],
    ledger: [],
    checkpoints: [...data.checkpoints].sort((a, b) => a.day - b.day || strictCompare(a.factionId, b.factionId)),
    rng: {},
    nextId: 1,
    verdict: null,
  };
}

/** Every problem in the scenario, so a pack author sees them all at once. */
export function validateScenario(data: ScenarioData): string[] {
  const problems: string[] = [];
  const check = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      problems.push((e as Error).message);
    }
  };
  const unique = (kind: string, ids: readonly string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`duplicate ${kind} id "${id}"`);
      seen.add(id);
    }
    return seen;
  };

  const factionIds = unique('faction', data.factions.map((f) => f.id));
  const personIds = unique('person', data.persons.map((p) => p.id));
  const postIds = unique('post', data.posts.map((p) => p.id));
  const regionIds = unique('region', data.regions.map((r) => r.id));
  unique('bloc', data.blocs.map((b) => b.id));

  if (data.factions.filter((f) => f.isPlayer).length !== 1) problems.push('exactly one faction must be the player');
  if (!(data.minTurnDays >= 1 && data.maxTurnDays >= data.minTurnDays)) problems.push('need 1 <= minTurnDays <= maxTurnDays');
  for (const kind of ['attack', 'hold', 'transfer'] as const) {
    if (!data.objectiveValues[kind]) problems.push(`objectiveValues.${kind} missing`);
  }

  for (const f of data.factions) {
    if (!personIds.has(f.principalId)) problems.push(`faction ${f.id}: unknown principal ${f.principalId}`);
    if (!regionIds.has(f.capitalRegionId)) problems.push(`faction ${f.id}: unknown capital ${f.capitalRegionId}`);
    check(() => assertPermille(f.baseOversight, `faction ${f.id} baseOversight`));
  }
  for (const p of data.persons) {
    if (!factionIds.has(p.factionId)) problems.push(`person ${p.id}: unknown faction ${p.factionId}`);
    check(() => assertPermille(p.boldness, `person ${p.id} boldness`));
    check(() => assertPermille(p.candour, `person ${p.id} candour`));
    check(() => assertPermille(p.competence, `person ${p.id} competence`));
    check(() => assertPermille(p.standing, `person ${p.id} standing`));
    check(() => assertSignedPermille(p.regard, `person ${p.id} regard`));
  }
  const held = new Set<string>();
  for (const p of data.posts) {
    if (!factionIds.has(p.factionId)) problems.push(`post ${p.id}: unknown faction ${p.factionId}`);
    if (!regionIds.has(p.regionId)) problems.push(`post ${p.id}: unknown region ${p.regionId}`);
    if (p.holderId !== null) {
      if (!personIds.has(p.holderId)) problems.push(`post ${p.id}: unknown holder ${p.holderId}`);
      if (held.has(p.holderId)) problems.push(`person ${p.holderId} holds more than one post`);
      held.add(p.holderId);
    }
    if (!Number.isSafeInteger(p.force) || p.force < 0) problems.push(`post ${p.id}: force must be a non-negative integer`);
    if (!Number.isSafeInteger(p.linkDays) || p.linkDays < 0) problems.push(`post ${p.id}: linkDays must be a non-negative integer`);
  }
  for (const r of data.regions) {
    if (!factionIds.has(r.controllerId)) problems.push(`region ${r.id}: unknown controller ${r.controllerId}`);
    for (const n of r.neighbours) {
      if (!regionIds.has(n)) problems.push(`region ${r.id}: unknown neighbour ${n}`);
      const other = data.regions.find((x) => x.id === n);
      if (other && !other.neighbours.includes(r.id)) problems.push(`region adjacency ${r.id}-${n} is not symmetric`);
    }
  }
  const weights: Record<string, number> = {};
  for (const b of data.blocs) {
    if (!factionIds.has(b.factionId)) problems.push(`bloc ${b.id}: unknown faction ${b.factionId}`);
    check(() => assertPermille(b.weight, `bloc ${b.id} weight`));
    check(() => assertSignedPermille(b.support, `bloc ${b.id} support`));
    weights[b.factionId] = (weights[b.factionId] ?? 0) + b.weight;
  }
  for (const f of sortedKeys(weights)) {
    if (weights[f] !== 1000) problems.push(`faction ${f}: bloc weights sum to ${weights[f]}, expected 1000`);
  }
  for (const c of data.checkpoints) {
    if (!factionIds.has(c.factionId)) problems.push(`checkpoint "${c.label}": unknown faction ${c.factionId}`);
  }
  return problems;
}
