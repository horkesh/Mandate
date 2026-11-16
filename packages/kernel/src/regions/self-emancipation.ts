/**
 * The derived self-emancipation term (0046; SENSITIVE-HISTORY 3.2; lane 1.7). Pure: it reads State and the World and
 * writes nothing. It is never a lever: no seat, verb, option or situation sets, reads as a stock, spends or prevents it.
 *
 * It has two kinds of cause, so that it is the people's agency and not a side's output:
 * 1. **resistance and flight within** the side that holds a census region, not keyed to anyone's reach: a base rate
 *    and the pressure the pack's situation flags add (impressment, say);
 * 2. **flight to the lines** of the pack's lines faction, scaled by the reach of its lines and forces (a region it holds,
 *    here or next door, with or without its force there) and by its known policy (the pack's base and situation flags).
 *
 * It reads the census of enslaved people as protected World input and never writes it. Only cause 2 reaches the lines:
 * its arrivals are proposed to `regions`, which alone writes them (`region_reached_union_lines`). Every number carries
 * its typed reason, the pack's agency type (hard rule 6), worded as the people's act.
 */
import { strictCompare } from '../compare.ts';
import { shareOf } from '../control/control.ts';
import type { FactionId, RegionId } from '../ids.ts';
import type { SelfEmancipationRules } from '../recruitment/rules.ts';
import type { State } from '../root-state.ts';
import { edgesOf, otherEnd, type WorldIndex } from '../world/index.ts';
import { REACHED_UNION_LINES_FIELD, type ArrivalProposal } from './regions.ts';

/** Why a number in the term is what it is: always the people's own act, with the pack's agency reason type (`agency:self-emancipation` in the Union pack's register). */
export type SelfEmancipationReason =
  | { readonly kind: 'agency'; readonly agency: string; readonly cause: 'resistance-within'; readonly perMillion: number; readonly pressure: readonly string[] }
  | { readonly kind: 'agency'; readonly agency: string; readonly cause: 'flight-to-lines'; readonly reach: 'lines-with-force' | 'lines' | 'none'; readonly reachPermille: number; readonly policyPermille: number; readonly policyFlags: readonly string[] };

/** The term in one census region, for one cadence. */
export interface SelfEmancipationTerm {
  readonly region: RegionId;
  /** The census, as the World gives it (read, never written). */
  readonly census: number;
  /** Cause 1: people resisting and fleeing within, this cadence (derived; no one holds or spends it). */
  readonly within: number;
  /** Where cause 2's people reach the lines: the region the lines' side holds, here or next door; null when none. */
  readonly destination: RegionId | null;
  /** Cause 2: people reaching the lines this cadence. */
  readonly toLines: number;
  readonly reasons: readonly SelfEmancipationReason[];
}

/** The pack's flags set in State that the term reads, in order, with their sum. */
function flagSum(state: State, flags: readonly { readonly flag: string; readonly permille: number }[]): { readonly sum: number; readonly set: readonly string[] } {
  const set = flags.filter((f) => state.situationFlags[f.flag] !== undefined).sort((a, b) => strictCompare(a.flag, b.flag));
  return { sum: set.reduce((s, f) => s + f.permille, 0), set: set.map((f) => f.flag) };
}

/** Whether the lines' side has a force block standing in `region`. */
function linesForceIn(state: State, region: RegionId, lines: FactionId): boolean {
  return (Object.keys(state.forceLocations) as (keyof typeof state.forceLocations)[]).some((b) => {
    if (state.forceLocations[b]!.locRegion !== region) return false;
    const dept = state.forceBlockStates[b]?.fbDepartment;
    return dept !== undefined && state.departmentFactions[dept] === lines;
  });
}

/** Whether today is a cadence day for the term (day 1, then every `cadenceDays`). */
export function selfEmancipationDue(rules: SelfEmancipationRules, day: number): boolean {
  return rules.linesFaction !== null && day >= 1 && (day - 1) % rules.cadenceDays === 0;
}

/**
 * The term for every census region the lines' side does not hold, in region order. A region it holds is already within
 * its lines; a region with no census has no term.
 */
export function selfEmancipationTerms(map: WorldIndex, state: State, rules: SelfEmancipationRules): SelfEmancipationTerm[] {
  const lines = rules.linesFaction;
  if (lines === null) return [];
  const holds = (r: RegionId) => shareOf(map, state.regionControl, r, lines) >= rules.holdShare;
  const pressure = flagSum(state, rules.pressureFlags);
  const policyFlags = flagSum(state, rules.policyFlags);
  const policy = Math.max(0, Math.min(1000, rules.policyBase + policyFlags.sum));
  const out: SelfEmancipationTerm[] = [];
  for (const c of [...map.world.census].sort((a, b) => strictCompare(a.region, b.region))) {
    if (c.enslavedPopulation <= 0 || holds(c.region)) continue;
    // Cause 1, keyed to no one's reach: the base rate, raised by the pressure the pack's flags name.
    const withinPerMillion = Math.trunc((rules.resistancePerMillion * (1000 + pressure.sum)) / 1000);
    const within = Math.trunc((c.enslavedPopulation * withinPerMillion) / 1000000);
    // Cause 2: the nearest of the lines' ground, here or next door; with its force there, the reach is greater.
    const near = [...new Set(edgesOf(map, c.region).map((e) => otherEnd(e, c.region)))]
      .filter((r) => {
        const k = map.regions.get(r)?.kind;
        return (k === 'land' || k === 'key_point') && holds(r);
      })
      .map((r) => ({ region: r, force: linesForceIn(state, r, lines) }))
      .sort((a, b) => Number(b.force) - Number(a.force) || shareOf(map, state.regionControl, b.region, lines) - shareOf(map, state.regionControl, a.region, lines) || strictCompare(a.region, b.region));
    const best = near[0] ?? null;
    const reach = best === null ? 0 : best.force ? rules.reachWithForce : rules.reachLinesOnly;
    let toLines = Math.trunc((c.enslavedPopulation * rules.flightPerMillion) / 1000000);
    toLines = Math.trunc((toLines * reach) / 1000);
    toLines = Math.trunc((toLines * policy) / 1000);
    out.push({
      region: c.region,
      census: c.enslavedPopulation,
      within,
      destination: best?.region ?? null,
      toLines,
      reasons: [
        { kind: 'agency', agency: rules.agencyReason, cause: 'resistance-within', perMillion: withinPerMillion, pressure: pressure.set },
        { kind: 'agency', agency: rules.agencyReason, cause: 'flight-to-lines', reach: best === null ? 'none' : best.force ? 'lines-with-force' : 'lines', reachPermille: reach, policyPermille: policy, policyFlags: policyFlags.set },
      ],
    });
  }
  return out;
}

/** The term's proposals to `regions`: the people who reached the lines this cadence, by the region where they reached them. */
export function arrivalProposals(terms: readonly SelfEmancipationTerm[]): ArrivalProposal[] {
  const by = new Map<RegionId, number>();
  for (const t of terms) if (t.destination !== null && t.toLines > 0) by.set(t.destination, (by.get(t.destination) ?? 0) + t.toLines);
  return [...by.keys()].sort(strictCompare).map((region) => ({ field: REACHED_UNION_LINES_FIELD, region, people: by.get(region)!, origin: 'self-emancipation' as const }));
}
