/**
 * The victory measure (lane 1.14, a proposal for the lead to rule): how well a side stands, read from the same scores as
 * the checkpoints, for the lever sweep (SENSITIVE-HISTORY D6) to weigh a move by. It is a measure of winning, not of
 * history: a victory-only bot maximises it, and the sweep reports a watched option that bot would pick too often.
 *
 * Five terms, each with its amount (hard rule 6), weighted by the pack (`checkpoints.json`, `victory`; the lead's
 * ruling, amended by G-1.14c):
 * - `capital`: each faction principal's seat region the side holds, less each the other sides hold;
 * - `government`: each government (a department of a `government` kind) on the side, less each on another side;
 * - `men`: the side's permille of every man of known strength, above an even share;
 * - `ground`: the side's permille of every control share, above an even share;
 * - `mandate`: lane 1.6's derived mandate (its blocs' support by voice, and the framing), in permille above its rest.
 * The first four are relative, so one side's gain is another's loss; the mandate is the side's own.
 *
 * `VICTORY_READS` lists every channel the measure reads (G-1.14c, rule 7): the sweep reports a gated decision whose
 * options propose to any other channel as unmeasured, since the bot could not see what that choice costs.
 */
import { phase0, type ids } from '@mandate/kernel';
import type { VictoryWeights } from '@mandate/pack-format';

/** The owners and fields a situation's effects propose to that the measure reads, and how. */
export const VICTORY_READS: readonly { readonly owner: string; readonly field: string; readonly how: string }[] = [
  { owner: 'command', field: 'department-side', how: 'the government term' },
  { owner: 'politics', field: 'bloc-support', how: 'the mandate term (bloc support by voice)' },
  { owner: 'politics', field: 'framing', how: 'the mandate term (its framing part)' },
  { owner: 'politics', field: 'ledger-act', how: 'the mandate term, through the answer once Congress meets the act (the sweep plays on until it is met)' },
  { owner: 'politics', field: 'ledger-answer', how: 'the mandate term, through the answering option’s own effects' },
];

/** Whether the measure reads a channel. */
export const victoryReads = (owner: string, field: string): boolean => VICTORY_READS.some((r) => r.owner === owner && r.field === field);

/** The faction's mandate above its rest (every bloc at its rest, no framing), in permille. */
export function mandateAboveRest(world: phase0.SeatsWorld, state: phase0.State, faction: string): number {
  const rules = world.map.world.rules.politics;
  const now = phase0.mandateOf(rules, state, faction as ids.FactionId).value;
  const rest = rules.blocs.filter((b) => b.faction === faction).reduce((n, b) => n + Math.trunc((b.rest * b.voice) / 1000), 0);
  return now - Math.max(-1000, Math.min(1000, rest));
}

export interface VictoryTerm {
  readonly term: 'capital' | 'government' | 'men' | 'ground' | 'mandate';
  /** What was counted: capitals or governments net, or permille above an even share. */
  readonly count: number;
  readonly amount: number;
}

export interface Victory {
  readonly faction: string;
  readonly value: number;
  readonly terms: readonly VictoryTerm[];
}

/** A faction's share of a total, in permille above an even share among `sides` sides; 0 when there is nothing to share. */
function shareAboveEven(mine: number, total: number, sides: number): number {
  if (total <= 0 || sides <= 0) return 0;
  return Math.trunc((mine * 1000) / total) - Math.trunc(1000 / sides);
}

/** The victory measure for `faction` on a day's State and derived map. */
export function victoryOf(world: phase0.SeatsWorld, state: phase0.State, map: phase0.DerivedMap | null, faction: string, weights: Omit<VictoryWeights, 'cite'>): Victory {
  const factions = world.map.world.factions.map((f) => f.id as string);
  const holderOf = (region: ids.RegionId): string | null => map?.index.holdings.get(region)?.holder ?? null;

  let capitals = 0;
  for (const id of world.factionIds) {
    const holder = holderOf(world.faction(id).seatRegion);
    if (holder === faction) capitals += 1;
    else if (holder !== null) capitals -= 1;
  }

  const governmentKinds = new Set(world.map.world.vocabularies.departmentKinds.filter((k) => k.government).map((k) => k.id));
  let governments = 0;
  for (const d of world.map.world.departments) {
    if (!governmentKinds.has(d.kind)) continue;
    const side = state.departmentFactions[d.id] ?? null;
    if (side === faction) governments += 1;
    else if (side !== null) governments -= 1;
  }

  const men = new Map<string, number>();
  for (const block of Object.values(state.forceBlockStates)) {
    if (block.fbStrength === null) continue;
    const side = phase0.departmentSide(state, block.fbDepartment);
    if (side !== null) men.set(side, (men.get(side) ?? 0) + block.fbStrength);
  }
  const allMen = [...men.values()].reduce((a, b) => a + b, 0);

  const ground = new Map<string, number>();
  for (const shares of Object.values(state.regionControl)) for (const [f, p] of Object.entries(shares)) ground.set(f, (ground.get(f) ?? 0) + (p ?? 0));
  const allGround = [...ground.values()].reduce((a, b) => a + b, 0);

  const menShare = shareAboveEven(men.get(faction) ?? 0, allMen, factions.length);
  const groundShare = shareAboveEven(ground.get(faction) ?? 0, allGround, factions.length);
  const mandate = mandateAboveRest(world, state, faction);
  const terms: VictoryTerm[] = [
    { term: 'capital', count: capitals, amount: capitals * weights.capital },
    { term: 'government', count: governments, amount: governments * weights.government },
    { term: 'men', count: menShare, amount: menShare * weights.menShare },
    { term: 'ground', count: groundShare, amount: groundShare * weights.groundShare },
    { term: 'mandate', count: mandate, amount: mandate * weights.mandate },
  ];
  return { faction, value: terms.reduce((n, t) => n + t.amount, 0), terms };
}
