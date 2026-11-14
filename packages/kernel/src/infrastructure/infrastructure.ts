/**
 * Infrastructure (FOUNDATION section 10; decisions 0029, 0050, 0054): the
 * network's condition as State, written only here. Edge condition (damage and
 * repair), depot condition, and water edges obstructed by works or batteries.
 *
 * Each part starts from the scenario start (0050) and changes only through
 * typed deltas proposed by combat, raids, repair orders, operations and
 * situations. The supply derivation reads the result as `NetworkConditions`
 * (`networkOf`), so damage here closes or narrows lines there.
 *
 * Conditions are permille: 1000 intact (never stored: an intact edge or depot
 * is absent), 0 cut.
 */
import { strictCompare } from '../compare.ts';
import type { DepotId, EdgeId, InstallationId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { networkConditions, type NetworkConditions } from '../supply/supply.ts';
import type { WorldIndex } from '../world/index.ts';
import type { ScenarioStart } from '../world/scenario.ts';

/** One obstructed water edge. Immutable: `infrastructure` replaces the list whole. */
export interface ObstructionState {
  readonly obsEdge: EdgeId;
  /** The installation whose works close it, or null for works not modelled (a boom, hulks). */
  readonly obsBy: InstallationId | null;
}

export type ConditionTable<K extends string> = Readonly<Record<K, number>>;

/**
 * Who may propose a change to the network (the proposers `OWNED_FIELDS` lists
 * for edge condition, obstructions and depot condition). A typed reason: an
 * unlisted proposer fails typecheck.
 */
export const INFRASTRUCTURE_CAUSES = ['combat', 'raids', 'repair', 'operations', 'situations'] as const;
export type InfrastructureCause = (typeof INFRASTRUCTURE_CAUSES)[number];

export type InfrastructureDelta =
  | { readonly change: 'edge'; readonly edge: EdgeId; readonly deltaPermille: number; readonly cause: InfrastructureCause }
  | { readonly change: 'depot'; readonly depot: DepotId; readonly deltaPermille: number; readonly cause: InfrastructureCause }
  | { readonly change: 'obstruct'; readonly edge: EdgeId; readonly by: InstallationId | null; readonly cause: InfrastructureCause }
  | { readonly change: 'clear'; readonly edge: EdgeId; readonly cause: InfrastructureCause };

export interface InfrastructureChange {
  readonly change: InfrastructureDelta['change'];
  readonly target: string;
  readonly before: number | null;
  readonly after: number | null;
  readonly cause: InfrastructureCause;
}

export class InfrastructureError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`Invalid infrastructure:\n- ${problems.join('\n- ')}`);
    this.name = 'InfrastructureError';
  }
}

const INTACT = 1000;

function checkPermille(problems: string[], what: string, v: number): void {
  if (!Number.isSafeInteger(v) || v < 0 || v > INTACT) problems.push(`${what}: condition must be a whole permille 0..1000, got ${v}`);
}

/** The network's condition at a scenario start, copied once into State (0050). Every problem is reported together. */
export function initialInfrastructure(
  map: WorldIndex,
  start: ScenarioStart,
): { readonly edges: ConditionTable<EdgeId>; readonly depots: ConditionTable<DepotId>; readonly obstructions: readonly ObstructionState[] } {
  const problems: string[] = [];
  const depots = new Set(map.world.depots.map((d) => d.id));
  const installations = new Set(map.world.installations.map((i) => i.id));
  const edgeOut: Record<EdgeId, number> = {};
  for (const c of [...start.edgeConditions].sort((a, b) => strictCompare(a.edge, b.edge))) {
    if (!map.edges.has(c.edge)) problems.push(`edge ${c.edge} is not in the World`);
    if (Object.prototype.hasOwnProperty.call(edgeOut, c.edge)) problems.push(`edge ${c.edge} is listed twice`);
    checkPermille(problems, `edge ${c.edge}`, c.conditionPermille);
    if (c.conditionPermille !== INTACT) edgeOut[c.edge] = c.conditionPermille;
  }
  const depotOut: Record<DepotId, number> = {};
  for (const c of [...start.depotConditions].sort((a, b) => strictCompare(a.depot, b.depot))) {
    if (!depots.has(c.depot)) problems.push(`depot ${c.depot} is not in the World`);
    if (Object.prototype.hasOwnProperty.call(depotOut, c.depot)) problems.push(`depot ${c.depot} is listed twice`);
    checkPermille(problems, `depot ${c.depot}`, c.conditionPermille);
    if (c.conditionPermille !== INTACT) depotOut[c.depot] = c.conditionPermille;
  }
  const seen = new Set<EdgeId>();
  for (const o of start.obstructions) {
    const e = map.edges.get(o.edge);
    if (e === undefined) problems.push(`obstruction on ${o.edge}, which is not in the World`);
    else if (e.type !== 'river' && e.type !== 'sea') problems.push(`obstruction on ${o.edge}, which is a ${e.type} edge, not water`);
    if (o.by !== null && !installations.has(o.by)) problems.push(`obstruction on ${o.edge}: installation ${o.by} is not in the World`);
    if (seen.has(o.edge)) problems.push(`edge ${o.edge} is obstructed twice`);
    seen.add(o.edge);
  }
  if (problems.length > 0) throw new InfrastructureError(problems);
  return { edges: edgeOut, depots: depotOut, obstructions: sortObstructions(start.obstructions.map((o) => ({ obsEdge: o.edge, obsBy: o.by }))) };
}

function sortObstructions(list: readonly ObstructionState[]): ObstructionState[] {
  return [...list].sort((a, b) => strictCompare(a.obsEdge, b.obsEdge));
}

/** The network's condition as the supply derivation reads it. */
export function networkOf(state: State): NetworkConditions {
  return networkConditions({
    edgeConditions: (Object.keys(state.infraEdgeCondition) as EdgeId[]).map((edge) => ({ edge, conditionPermille: state.infraEdgeCondition[edge]! })),
    depotConditions: (Object.keys(state.infraDepotCondition) as DepotId[]).map((depot) => ({ depot, conditionPermille: state.infraDepotCondition[depot]! })),
    obstructions: state.infraObstructions.map((o) => ({ edge: o.obsEdge, by: o.obsBy })),
  });
}

/** An edge's condition, permille (1000 intact). Throws on an unknown edge. */
export function edgeConditionOf(map: WorldIndex, state: State, edge: EdgeId): number {
  if (!map.edges.has(edge)) throw new InfrastructureError([`edge ${edge} is not in the World`]);
  return state.infraEdgeCondition[edge] ?? INTACT;
}

/**
 * Apply proposed changes in order: the only way the network changes in play.
 * Conditions clamp to 0..1000 (1000 is stored as absent). Obstructing an
 * obstructed edge or clearing a clear one is no change. If nothing changes,
 * the same State returns.
 */
export function applyInfrastructure(map: WorldIndex, state: State, deltas: readonly InfrastructureDelta[]): { readonly state: State; readonly changes: readonly InfrastructureChange[] } {
  if (deltas.length === 0) return { state, changes: [] };
  let edges: Record<EdgeId, number> | null = null;
  let depots: Record<DepotId, number> | null = null;
  let obstructions: ObstructionState[] | null = null;
  const changes: InfrastructureChange[] = [];
  const depotIds = new Set(map.world.depots.map((d) => d.id));
  for (const d of deltas) {
    if (d.change === 'edge' || d.change === 'depot') {
      if (!Number.isSafeInteger(d.deltaPermille)) throw new InfrastructureError([`${d.change} change must be a whole permille, got ${d.deltaPermille}`]);
      if (d.change === 'edge') {
        if (!map.edges.has(d.edge)) throw new InfrastructureError([`edge ${d.edge} is not in the World`]);
        edges ??= { ...state.infraEdgeCondition };
        const before = edges[d.edge] ?? INTACT;
        const after = Math.max(0, Math.min(INTACT, before + d.deltaPermille));
        if (after === before) continue;
        if (after === INTACT) delete edges[d.edge];
        else edges[d.edge] = after;
        changes.push({ change: 'edge', target: d.edge, before, after, cause: d.cause });
      } else {
        if (!depotIds.has(d.depot)) throw new InfrastructureError([`depot ${d.depot} is not in the World`]);
        depots ??= { ...state.infraDepotCondition };
        const before = depots[d.depot] ?? INTACT;
        const after = Math.max(0, Math.min(INTACT, before + d.deltaPermille));
        if (after === before) continue;
        if (after === INTACT) delete depots[d.depot];
        else depots[d.depot] = after;
        changes.push({ change: 'depot', target: d.depot, before, after, cause: d.cause });
      }
      continue;
    }
    const e = map.edges.get(d.edge);
    if (e === undefined) throw new InfrastructureError([`edge ${d.edge} is not in the World`]);
    obstructions ??= [...state.infraObstructions];
    const at = obstructions.findIndex((o) => o.obsEdge === d.edge);
    if (d.change === 'obstruct') {
      if (e.type !== 'river' && e.type !== 'sea') throw new InfrastructureError([`edge ${d.edge} is not water and cannot be obstructed`]);
      if (at !== -1) continue;
      obstructions.push({ obsEdge: d.edge, obsBy: d.by });
      changes.push({ change: 'obstruct', target: d.edge, before: null, after: null, cause: d.cause });
    } else {
      if (at === -1) continue;
      obstructions.splice(at, 1);
      changes.push({ change: 'clear', target: d.edge, before: null, after: null, cause: d.cause });
    }
  }
  if (changes.length === 0) return { state, changes };
  return {
    state: {
      ...state,
      ...(edges === null ? {} : { infraEdgeCondition: edges }),
      ...(depots === null ? {} : { infraDepotCondition: depots }),
      ...(obstructions === null ? {} : { infraObstructions: sortObstructions(obstructions) }),
    },
    changes,
  };
}
