import { forceTotals, type ForceTotalsCache } from '../forces/lots.ts';
/**
 * The derived self-emancipation term (0046; SENSITIVE-HISTORY 3.2; lane 1.7). Pure: it reads State and the World and
 * writes nothing. It is never a lever: no seat, verb, option or situation sets, reads as a stock, spends or prevents it.
 *
 * It has two kinds of cause, so that it is the people's agency and not a side's output:
 * 1. **resistance and flight within** a census region, not keyed to anyone's reach: a base rate and the pressure the
 *    pack's situation flags add (impressment, say);
 * 2. **flight to the lines** of the pack's lines faction, scaled by the reach of its lines and forces (its posts and
 *    camps in the region itself where it holds it, else a region it holds next door, with or without its force there)
 *    and by its known policy (the pack's base and situation flags, a policy of return lowering it).
 *
 * Holding a region protects no one by itself (the lead's ruling on G-1.7a): where slavery stayed lawful under the lines'
 * side and fugitives were returned, its people are still counted, and none is called free. A policy that protects people
 * who reach the lines is a policy flag: it raises flight to the lines and never skips a region. The term skips a region
 * only where a pack flag says slavery has ended there, in law or in fact (G-1.7b; the District of Columbia act of April
 * 1862 is the model).
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

/**
 * Why a number in the term is what it is: always the people's own act, each with the pack's agency type for its cause
 * (the Union pack's register: `agency:resistance-within-confederacy` in the enslaving side's own regions and
 * `agency:self-emancipation` elsewhere, `agency:flight-to-union-lines`, and each pressure flag's own type, such as
 * `agency:escape-from-impressment`).
 */
export type SelfEmancipationReason =
  | { readonly kind: 'agency'; readonly agency: string; readonly cause: 'resistance-within'; readonly government: 'enslaving-side' | 'elsewhere'; readonly perMillion: number; readonly pressure: readonly string[] }
  | { readonly kind: 'agency'; readonly agency: string; readonly cause: 'flight-to-lines'; readonly reach: 'lines-here' | 'lines-with-force' | 'lines' | 'none'; readonly reachPermille: number; readonly policyPermille: number; readonly policyFlags: readonly string[] }
  | { readonly kind: 'agency'; readonly agency: string; readonly cause: 'pressure'; readonly flag: string; readonly pressurePermille: number };

/** The term in one census region, for one cadence. */
export interface SelfEmancipationTerm {
  readonly region: RegionId;
  /** The census, as the World gives it (read, never written). */
  readonly census: number;
  /** Cause 1: people resisting and fleeing within, this cadence (derived; no one holds or spends it). */
  readonly within: number;
  /** Where cause 2's people reach the lines: this region where the lines' side holds it, else one it holds next door; null when none. */
  readonly destination: RegionId | null;
  /** Cause 2: people reaching the lines this cadence. */
  readonly toLines: number;
  readonly reasons: readonly SelfEmancipationReason[];
}

/** The pack's flags set in State that the term reads, in flag order, with their sum. */
function flagsSet<T extends { readonly flag: string; readonly permille: number }>(state: State, flags: readonly T[]): { readonly sum: number; readonly set: readonly T[] } {
  const set = flags.filter((f) => state.situationFlags[f.flag] !== undefined).sort((a, b) => strictCompare(a.flag, b.flag));
  return { sum: set.reduce((s, f) => s + f.permille, 0), set };
}

/** Regions with the lines' force present: unknown strengths and surrendered blocks do not count. Derived for one call only. */
function linesForceRegions(state: State, lines: FactionId, cache?: ForceTotalsCache): ReadonlySet<RegionId> {
  const regions = new Set<RegionId>();
  for (const b of Object.keys(state.forceLocations) as (keyof typeof state.forceLocations)[]) {
    const block = state.forceBlockStates[b];
    if (block === undefined || block.fbSurrenderedDay !== null || (forceTotals(block, cache).fbStrength ?? 0) <= 0) continue;
    if (state.departmentFactions[block.fbDepartment] === lines) regions.add(state.forceLocations[b]!.locRegion);
  }
  return regions;
}

/** Whether a region is governed by the enslaving side: a government on a side other than the lines' (not neutral, not unknown, not the lines' own). */
function enslavingSideGoverns(state: State, region: RegionId, lines: FactionId): boolean {
  const dept = state.regionGovernments[region];
  if (dept === undefined || dept === 'unknown') return false;
  const side = state.departmentFactions[dept] ?? null;
  return side !== null && side !== lines;
}

/** Whether today is a cadence day for the term (day 1, then every `cadenceDays`). */
export function selfEmancipationDue(rules: SelfEmancipationRules, day: number): boolean {
  return rules.linesFaction !== null && day >= 1 && (day - 1) % rules.cadenceDays === 0;
}

/** The census regions a set flag covers where slavery has ended, in law or in fact (G-1.7b): no one there is enslaved, so the term skips them. */
export function protectedRegions(state: State, rules: SelfEmancipationRules): ReadonlySet<RegionId> {
  return new Set(rules.protectedFlags.filter((p) => state.situationFlags[p.flag] !== undefined).flatMap((p) => p.regions));
}

/**
 * The term for every census region, in region order, but those where a set flag says slavery has ended. A region with no census
 * has no term.
 */
export function selfEmancipationTerms(map: WorldIndex, state: State, rules: SelfEmancipationRules): SelfEmancipationTerm[] {
  const lines = rules.linesFaction;
  if (lines === null) return [];
  const holds = (r: RegionId) => shareOf(map, state.regionControl, r, lines) >= rules.holdShare;
  const protectedHere = protectedRegions(state, rules);
  const pressure = flagsSet(state, rules.pressureFlags);
  const policyFlags = flagsSet(state, rules.policyFlags);
  const policy = Math.max(0, Math.min(1000, rules.policyBase + policyFlags.sum));
  // Adjacent census regions often ask about the same force locations. Enumerate
  // them at most once, and only if an eligible census region needs the lookup.
  let forceRegions: ReadonlySet<RegionId> | undefined;
  const forceIn = (region: RegionId): boolean => (forceRegions ??= linesForceRegions(state, lines, map.forceTotalsCache)).has(region);
  const out: SelfEmancipationTerm[] = [];
  for (const c of [...map.world.census].sort((a, b) => strictCompare(a.region, b.region))) {
    if (c.enslavedPopulation <= 0 || protectedHere.has(c.region)) continue;
    // Cause 1, keyed to no one's reach: the base rate, raised by the pressure the pack's flags name.
    const withinPerMillion = Math.trunc((rules.resistancePerMillion * (1000 + pressure.sum)) / 1000);
    const within = Math.trunc((c.enslavedPopulation * withinPerMillion) / 1000000);
    // Cause 2: the lines' posts and camps here where its side holds the region; else the nearest of its ground next door,
    // its force there reaching further.
    const here = holds(c.region);
    const near = here
      ? [{ region: c.region, force: forceIn(c.region) }]
      : [...new Set(edgesOf(map, c.region).map((e) => otherEnd(e, c.region)))]
          .filter((r) => {
            const k = map.regions.get(r)?.kind;
            return (k === 'land' || k === 'key_point') && holds(r);
          })
          .map((r) => ({ region: r, force: forceIn(r) }))
          .sort((a, b) => Number(b.force) - Number(a.force) || shareOf(map, state.regionControl, b.region, lines) - shareOf(map, state.regionControl, a.region, lines) || strictCompare(a.region, b.region));
    const best = near[0] ?? null;
    const reach = best === null ? 0 : best.force ? rules.reachWithForce : rules.reachLinesOnly;
    // Pressure within (impressment, say) drives flight as well as resistance: each flag's escape is its own reason.
    let toLines = Math.trunc((c.enslavedPopulation * Math.trunc((rules.flightPerMillion * (1000 + pressure.sum)) / 1000)) / 1000000);
    toLines = Math.trunc((toLines * reach) / 1000);
    toLines = Math.trunc((toLines * policy) / 1000);
    const enslaving = enslavingSideGoverns(state, c.region, lines);
    out.push({
      region: c.region,
      census: c.enslavedPopulation,
      within,
      destination: best?.region ?? null,
      toLines,
      reasons: [
        { kind: 'agency', agency: enslaving ? rules.agencyReasons.resistanceWithin : rules.agencyReasons.resistanceElsewhere, cause: 'resistance-within', government: enslaving ? 'enslaving-side' : 'elsewhere', perMillion: withinPerMillion, pressure: pressure.set.map((f) => f.flag) },
        { kind: 'agency', agency: rules.agencyReasons.flightToLines, cause: 'flight-to-lines', reach: best === null ? 'none' : here ? 'lines-here' : best.force ? 'lines-with-force' : 'lines', reachPermille: reach, policyPermille: policy, policyFlags: policyFlags.set.map((f) => f.flag) },
        ...pressure.set.map((f) => ({ kind: 'agency' as const, agency: f.agency, cause: 'pressure' as const, flag: f.flag, pressurePermille: f.permille })),
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
