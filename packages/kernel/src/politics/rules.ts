/**
 * Politics as pack rules (lane 1.6; FOUNDATION section 7; 0028, 0040, 0046). Every number here is the pack's (0072): no
 * kernel default. Blocs, chambers, the session calendar and the papers are the pack's own records, each with its cite.
 */
import type { FactionId, PersonId, RegionId } from '../ids.ts';
import type { StringKey } from '../world/graph.ts';
import type { World } from '../world/world.ts';
import {parseIsoDate} from '../world/calendar.ts';

/** A bloc (M2's `Bloc`, recast): its voice in Washington and how events move it. Its id is the pack's bloc vocabulary. */
export interface BlocRule {
  readonly id: string;
  readonly faction: FactionId;
  /** Permille of its faction's voice; a faction's blocs sum to 1000 (M2's weight). */
  readonly voice: number;
  /** Signed permille: its support at the start, and the settled disposition it drifts back toward (M2's baseline). */
  readonly rest: number;
  /** The pack's values it holds: an address to a bloc costs the blocs that share none of them (M2's rule). */
  readonly values: readonly string[];
  /** Signed permille its support moves when its side's press reports a battle won, at a paper's full reach. */
  readonly victory: number;
  /** The same, for a battle reported lost. */
  readonly defeat: number;
  readonly cite: string;
}

/** A chamber of the legislature (0040). */
export interface ChamberRule {
  readonly id: string;
  readonly faction: FactionId;
  readonly name: StringKey;
  readonly cite: string;
  /** Dated public seat counts, when the pack publishes them; never inferred from bloc support. */
  readonly composition?: readonly {readonly on:string;readonly groups:readonly {readonly name:StringKey;readonly seats:number}[];readonly cite:string}[];
}

/**
 * A session in the pack's calendar. A regular session sits from `opens` to `closes` (ISO dates, both days sitting). A
 * callable session sits only when a proposal calls it: from `opens` (or the day after the call, if that has passed) or
 * `afterCallDays` after the call, to `closes` or for `sitsDays`.
 */
export interface SessionRule {
  readonly id: string;
  readonly chambers: readonly string[];
  readonly callable: boolean;
  readonly opens: string | null;
  readonly closes: string | null;
  readonly afterCallDays: number | null;
  readonly sitsDays: number | null;
  readonly cite: string;
}

/** A paper whose weekly front page is a report route (FOUNDATION section 7): its editor writes it where it prints. */
export interface PaperRule {
  readonly id: string;
  readonly faction: FactionId;
  readonly editor: PersonId;
  readonly region: RegionId;
  /** Permille of its side's public it reaches; a faction's papers sum to at most 1000. Scales what its page moves. */
  readonly reachPermille: number;
  readonly cite: string;
}

/**
 * Problems with a World's politics rules, by the kernel's own rule (the validator says the same at the pack's cell):
 * known blocs, factions, values, chambers, editors and regions; a side's voices summing to 1000 and its papers' reach
 * to at most 1000; each session's dates complete for its kind; and bounds in order.
 */
export function politicsRulesProblems(world: World): string[] {
  const rules = world.rules.politics;
  if (rules === undefined) return ['the pack states no politics rules (rules.politics)'];
  const problems: string[] = [];
  const factions = new Set<string>(world.factions.map((f) => f.id));
  const blocVocab = new Set(world.vocabularies.blocs.map((b) => b.id));
  const values = new Set(world.vocabularies.values.map((v) => v.id));
  const regions = new Set<string>(world.regions.map((r) => r.id));
  const people = new Map<string, FactionId | null>(world.people.map((p) => [p.id, p.faction]));
  const seen = new Set<string>();
  const voices = new Map<string, number>();
  for (const b of rules.blocs) {
    if (seen.has(b.id)) problems.push(`politics bloc ${b.id} is stated twice`);
    seen.add(b.id);
    if (!blocVocab.has(b.id)) problems.push(`politics bloc ${b.id} is not in the bloc vocabulary`);
    if (!factions.has(b.faction)) problems.push(`politics bloc ${b.id}: faction ${b.faction} is not in the pack`);
    for (const v of b.values) if (!values.has(v)) problems.push(`politics bloc ${b.id}: value ${v} is not in the values vocabulary`);
    voices.set(b.faction, (voices.get(b.faction) ?? 0) + b.voice);
  }
  for (const [f, sum] of [...voices].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0))) if (sum !== 1000) problems.push(`politics: faction ${f}'s blocs' voices sum to ${sum}, not 1000`);
  if (!Number.isSafeInteger(rules.drift.divisor) || rules.drift.divisor < 1) problems.push('politics drift.divisor must be a whole number from 1');
  const chambers = new Set<string>();
  for (const c of rules.chambers) {
    if (chambers.has(c.id)) problems.push(`politics chamber ${c.id} is stated twice`);
    chambers.add(c.id);
    if (!factions.has(c.faction)) problems.push(`politics chamber ${c.id}: faction ${c.faction} is not in the pack`);
    const dates=new Set<string>();
    for(const table of c.composition??[]){
      try{parseIsoDate(table.on);}catch{problems.push(`politics chamber ${c.id}: composition date ${table.on} is invalid`);}
      if(table.groups.length===0||table.cite.trim().length===0)problems.push(`politics chamber ${c.id}: composition needs groups and a citation`);
      if(dates.has(table.on))problems.push(`politics chamber ${c.id}: composition date ${table.on} is repeated`);
      dates.add(table.on);
      const groups=new Set<string>();
      for(const g of table.groups){
        if(groups.has(g.name))problems.push(`politics chamber ${c.id}: composition group ${g.name} is repeated`);
        groups.add(g.name);
        if(!Number.isSafeInteger(g.seats)||g.seats<0)problems.push(`politics chamber ${c.id}: composition seats must be nonnegative integers`);
      }
    }
  }
  const sessions = new Set<string>();
  for (const s of rules.sessions) {
    if (sessions.has(s.id)) problems.push(`politics session ${s.id} is stated twice`);
    sessions.add(s.id);
    for (const c of s.chambers) if (!chambers.has(c)) problems.push(`politics session ${s.id}: chamber ${c} is not stated`);
    if (!s.callable) {
      if (s.opens === null || s.closes === null || s.afterCallDays !== null || s.sitsDays !== null) problems.push(`politics session ${s.id}: a regular session states opens and closes, and no afterCallDays or sitsDays`);
      else if (s.opens > s.closes) problems.push(`politics session ${s.id} closes before it opens`);
    } else {
      if ((s.opens === null) === (s.afterCallDays === null)) problems.push(`politics session ${s.id}: a callable session states exactly one of opens and afterCallDays`);
      if ((s.closes === null) === (s.sitsDays === null)) problems.push(`politics session ${s.id}: a callable session states exactly one of closes and sitsDays`);
    }
  }
  const c = rules.credibility;
  if (c.min > c.max) problems.push('politics credibility min is above max');
  const reach = new Map<string, number>();
  const papers = new Set<string>();
  for (const p of rules.press.papers) {
    if (papers.has(p.id)) problems.push(`politics paper ${p.id} is stated twice`);
    papers.add(p.id);
    if (!factions.has(p.faction)) problems.push(`politics paper ${p.id}: faction ${p.faction} is not in the pack`);
    if (!regions.has(p.region)) problems.push(`politics paper ${p.id}: region ${p.region} is not in the World`);
    if (!people.has(p.editor)) problems.push(`politics paper ${p.id}: editor ${p.editor} is not a person in the World`);
    else if (people.get(p.editor) !== p.faction) problems.push(`politics paper ${p.id}: editor ${p.editor} is not of its side ${p.faction}`);
    reach.set(p.faction, (reach.get(p.faction) ?? 0) + p.reachPermille);
  }
  for (const [f, sum] of reach) if (sum > 1000) problems.push(`politics: faction ${f}'s papers reach ${sum}, above 1000`);
  return problems;
}

/**
 * Every group of numbers below carries a `cite`: its source, or "[I]" for a design judgement or "M2's" for a value
 * carried from M2, so lane 1.14's stand-in criterion finds each one in the pack (the standing review of lane 1.6, item 5).
 */
export interface PoliticsRules {
  readonly blocs: readonly BlocRule[];
  /** Each week a bloc's support closes 1/divisor of the gap to its rest (M2's `blocReversionDivisor`). */
  readonly drift: { readonly divisor: number; readonly cite: string };
  /** An address (M2's): the bloc addressed gains `support`; the side's blocs that share none of its values gain `othersPenalty` (negative). */
  readonly address: { readonly support: number; readonly othersPenalty: number; readonly cite: string };
  /**
   * A man's ladder rung, weekly (M2's `ladder.ts`): from lobbying up, his own bloc loses `lobbyingPerRung` for each rung
   * from lobbying (negative numbers); from public defiance, every bloc of his side gets `publicDefiance`; a rival's bloc gets `rival`.
   */
  readonly ladder: { readonly lobbyingPerRung: number; readonly publicDefiance: number; readonly rival: number; readonly cite: string };
  readonly chambers: readonly ChamberRule[];
  readonly sessions: readonly SessionRule[];
  /**
   * The principal's sanction credibility (P7; replaces 0079's stand-in): `base`, plus `mandatePermille` of his mandate,
   * plus `perRelief` for each man who holds a relief against him (a fading record that he does relieve), within `min`..`max`.
   */
  readonly credibility: { readonly base: number; readonly mandatePermille: number; readonly perRelief: number; readonly min: number; readonly max: number; readonly cite: string };
  /** The framing term (0028, 0040) counts in the mandate at this permille. */
  readonly framing: { readonly mandatePermille: number; readonly cite: string };
  /**
   * The press: every `cadenceDays` days each paper prints a front page of the battles its side closed since the last,
   * as its public hears them. A battle's commander's standing moves by `standing.victory` or `standing.defeat` at the
   * paper's reach (proposed to `people`); each bloc of the side by its own `victory` or `defeat` (applied by `politics`).
   */
  readonly press: { readonly cadenceDays: number; readonly papers: readonly PaperRule[]; readonly standing: { readonly victory: number; readonly defeat: number; readonly cite: string } };
}
