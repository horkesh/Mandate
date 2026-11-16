/**
 * How a man reads an order on the new State (lane 1.1; FOUNDATION section 10: `reading` is pure and writes nothing).
 * The single owner of this computation for the new kernel: a relaying link (0040), an addressee, a conflict between two
 * orders and a filter post's holder each read through here, and `compliance` answers.
 *
 * - **The terms** of a goal come from the pack (`WorldRules.people.goalTerms`): its boldness and the values it honours
 *   or offends. A plan or an edit maps to terms in the planner (lane 1.2), with `ownBest`, `departure` and `support`.
 * - **The man** is read from people State through `traitsOf`, with his regard for whoever issued the order.
 * - **The context**: oversight from where he stands (lane 1.4: the pack's base, less his courier days from the principal,
 *   more on the wire; `tick/context.ts`) and the principal's credibility (a
 *   LABELLED STAND-IN, owner lane 1.6: see `ReadingContextRules`), and
 *   the grievances people State holds for him.
 *
 * M2's `reading.ts` beside this folder still reads M2's `GameState` until lane 1.13 deletes it.
 */
import { strictCompare } from '../compare.ts';
import { resolveConflict, resolveDirective, type ConflictResolution, type OrderInHand } from '../compliance.ts';
import type { CommandContext, DirectiveResponse, DirectiveTerms } from '../directive.ts';
import type { PersonId, PostId } from '../ids.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import type { StatedReason } from '../knowledge/report.ts';
import type { ProxyProfile } from '../people.ts';
import { regardOf } from '../people/people.ts';
import type { PeopleRules } from '../people/rules.ts';
import { traitsOf, type PersonTraits, type PrincipalLookup } from '../people/traits.ts';
import type { State } from '../root-state.ts';
import { heldPost, sideOfPerson } from '../command/command.ts';
import { observersAt } from '../command/observers.ts';
import { dispositionOf } from '../ladder/ladder.ts';

/** The seats layer's World as reading needs it: the map, its rules, and each faction's principal. */
export type ReadingWorld = PrincipalLookup;

function peopleRules(world: ReadingWorld): PeopleRules {
  return world.map.world.rules.people;
}

/** The terms of a goal of `kind`, as the pack states them. Throws for a goal kind the pack gives no terms (the kernel takes any World). */
export function goalTerms(rules: PeopleRules, kind: string): DirectiveTerms {
  const row = rules.goalTerms.find((g) => g.goal === kind);
  if (row === undefined) throw new RangeError(`the pack states no terms for goal kind "${kind}" (rules.people.goalTerms)`);
  return { boldness: row.boldness, honours: row.honours, offends: row.offends, required: 0 };
}

/** A man as compliance reads him, with his regard for `toward` (the issuer of the order he reads). */
export function profileOf(world: ReadingWorld, state: State, person: PersonId, toward: PersonId): ProxyProfile {
  const t = traitsOf(world, state, person);
  return { id: person, values: t.values, boldness: t.boldness, candour: t.candour, standing: t.standing, regard: toward === person ? 0 : regardOf(peopleRules(world), state, person, toward) };
}

/** The circumstances he reads an order in: the pack's oversight and credibility, full means unless the caller says, and his grievances. */
/** What the caller knows of an order's circumstances: the means at hand, the support promised, and how closely he is watched. */
export interface OrderMeans {
  readonly available?: number;
  readonly supportPromised?: readonly string[];
  /** Oversight from where he stands (`tick/context.ts`'s `oversightOf`, lane 1.4); the pack's base where the caller cannot place him. */
  readonly oversight?: number;
}

export function contextFor(world: ReadingWorld, state: State, person: PersonId, means: OrderMeans = {}): CommandContext {
  const rules = peopleRules(world);
  return {
    available: means.available ?? 1000,
    oversight: means.oversight ?? rules.context.oversight,
    leaderCredibility: rules.context.leaderCredibility,
    grievances: (state.personGrievances[person] ?? []).map((g) => ({ kind: g.grievanceKind, weight: g.grievanceWeight })),
    ...(means.supportPromised === undefined ? {} : { supportPromised: means.supportPromised }),
    ...extraContext(world, state, person),
  };
}

/**
 * Lane 1.5's terms of the context, each present only when it bites: his ladder rung (`disposition`), the pack's
 * cost-only values (0074), and oversight beyond the base stand-in from an observer at his headquarters or recent
 * pressure, each its own typed term (the lead's condition: a replacement of the base keeps them).
 */
function extraContext(world: ReadingWorld, state: State, person: PersonId): Pick<CommandContext, 'disposition' | 'costOnly' | 'oversightTerms'> {
  const rules = peopleRules(world);
  const out: { disposition?: number; costOnly?: readonly string[]; oversightTerms?: readonly { readonly source: string; readonly amount: number }[] } = {};
  const disposition = dispositionOf(rules, state, person);
  if (disposition !== 0) out.disposition = disposition;
  const costOnly = world.map.world.vocabularies.values.filter((v) => v.costOnly).map((v) => v.id);
  if (costOnly.length > 0) out.costOnly = costOnly;
  const terms: { source: string; amount: number }[] = [];
  const post = heldPost(state, person);
  if (post !== null && observersAt(state, post).length > 0) terms.push({ source: 'observer', amount: rules.verbs.observer.oversight });
  const today = state.stateDay;
  if ((state.personGrievances[person] ?? []).some((g) => g.grievanceKind === 'pressured' && today - g.grievanceDay < rules.verbs.pressure.days)) terms.push({ source: 'pressure', amount: rules.verbs.pressure.oversight });
  if (terms.length > 0) out.oversightTerms = terms;
  return out;
}

/** The terms of an order in the pack's order-to-value map (0074): `goal:<kind>`, `verb:<verb>` or `policy:<option>`. */
export function orderTerms(rules: PeopleRules, order: string): DirectiveTerms {
  const row = rules.verbs.orderValues.find((r) => r.order === order);
  if (row === undefined) throw new RangeError(`the pack's order-to-value map has no row for "${order}" (rules.people.verbs.orderValues)`);
  const clashes = row.clashes.length === 0 ? {} : { clashes: row.clashes };
  // A row with no boldness asks nothing of his temperament: the order is read against itself, so the gap is none.
  if (row.boldness === null) return { boldness: 500, ownBest: 500, honours: row.honours, offends: row.offends, required: 0, ...clashes };
  return { boldness: row.boldness, honours: row.honours, offends: row.offends, required: 0, ...clashes };
}

/**
 * One term of the pushback against an order (hard rule 6: each typed, and the terms sum to the total):
 * - `values`: a person on the side holds a value the order offends;
 * - `recipient`: a man who must carry it out is unwilling, apart from any clash with his practice;
 * - `practice`: the order runs against a practice of his own (lane 1.5b);
 * - `floor`: the row is never cheaper than the row it names (0074), and this is the difference (gate review G-1.5b).
 */
export type PushbackTerm =
  | { readonly source: 'values'; readonly person: PersonId; readonly amount: number }
  | { readonly source: 'recipient'; readonly person: PersonId; readonly amount: number }
  | { readonly source: 'practice'; readonly person: PersonId; readonly practice: string; readonly amount: number }
  | { readonly source: 'floor'; readonly order: string; readonly amount: number };

export interface Pushback {
  readonly total: number;
  readonly terms: readonly PushbackTerm[];
  /** The row whose pushback set the total, when the floor applied; else null. */
  readonly floor: string | null;
}

/**
 * Pushback against an order of the map (0074): from every person on the side who holds a value it offends (every seat
 * with a stake, not only the men who carry it out), and from each of `recipients`: his unwillingness, and any clash
 * with a practice of his own (lane 1.5b). With no recipient (a policy no post carries), the side is the issuer's. A row
 * with `notCheaperThan` is, by construction, never cheaper than the row it names: the difference is its own term.
 */
export function pushbackOf(world: ReadingWorld, state: State, order: string, recipients: readonly PersonId[], issuer: PersonId): Pushback {
  const rules = peopleRules(world);
  const row = rules.verbs.orderValues.find((r) => r.order === order);
  if (row === undefined) throw new RangeError(`the pack's order-to-value map has no row for "${order}"`);
  const carriers = [...new Set(recipients)].sort(strictCompare);
  const side = sideOfPerson(world.map, state, carriers[0] ?? issuer);
  const terms: PushbackTerm[] = [];
  for (const p of [...world.map.world.people].sort((a, b) => strictCompare(a.id, b.id))) {
    if (p.id === issuer || sideOfPerson(world.map, state, p.id) !== side) continue;
    const offended = row.offends.filter((v) => p.values.some((h) => h.value === v)).length;
    if (offended > 0) terms.push({ source: 'values', person: p.id, amount: offended * rules.compliance.valueWeight });
  }
  for (const recipient of carriers) {
    const answer = answerOrder(world, state, recipient, issuer, orderTerms(rules, order));
    let clashing = 0;
    for (const r of answer.reasons) {
      if (r.kind !== 'practice_clash') continue;
      terms.push({ source: 'practice', person: recipient, practice: r.practice, amount: r.weight });
      clashing += r.weight;
    }
    // His unwillingness apart from the clash, which is its own term above: nothing is counted twice.
    const apart = answer.willingness + clashing;
    if (apart < 0) terms.push({ source: 'recipient', person: recipient, amount: 0 - apart });
  }
  const own = terms.reduce((s, t) => s + t.amount, 0);
  if (row.notCheaperThan !== null) {
    const floor = pushbackOf(world, state, row.notCheaperThan, carriers, issuer);
    if (floor.total > own) return { total: floor.total, terms: [...terms, { source: 'floor', order: row.notCheaperThan, amount: floor.total - own }], floor: row.notCheaperThan };
  }
  return { total: own, terms, floor: null };
}
/**
 * How `person` answers an order from `issuer` with these terms: compliance on the new State, with the pack's weights.
 * Pure. Lane 1.2 calls it at an order's arrival with a goal's, a plan's or an edit's terms.
 */
export function answerOrder(world: ReadingWorld, state: State, person: PersonId, issuer: PersonId, terms: DirectiveTerms, means: OrderMeans = {}): DirectiveResponse {
  const rules = peopleRules(world);
  // Lane 1.5b: an order that runs against a practice of his own (the map's `clashes` against his cited practices).
  const own = world.map.world.people.find((p) => p.id === person)?.practices.map((p) => p.practice) ?? [];
  const practiceClashes = [...new Set(terms.clashes ?? [])].filter((c) => own.includes(c)).sort(strictCompare).map((practice) => ({ practice, weight: rules.verbs.practiceWeight }));
  const context = contextFor(world, state, person, means);
  return resolveDirective(profileOf(world, state, person, issuer), terms, practiceClashes.length === 0 ? context : { ...context, practiceClashes }, rules.compliance);
}

/**
 * Two orders conflict (0040): which `person` obeys, by his own compliance. Each order is read with his regard for its
 * own issuer. Lane 1.2 calls this at `arriveOrder`, in place of resolving by department (`plans/standing.ts`).
 */
export function resolveOrderConflict(
  world: ReadingWorld,
  state: State,
  person: PersonId,
  held: OrderInHand & { readonly issuer: PersonId },
  arriving: OrderInHand & { readonly issuer: PersonId },
): ConflictResolution {
  const profile = profileOf(world, state, person, arriving.issuer);
  return resolveConflict(
    profile,
    { ...held, issuerRegard: held.issuer === person ? 0 : regardOf(peopleRules(world), state, person, held.issuer) },
    { ...arriving, issuerRegard: profile.regard },
    contextFor(world, state, person),
    peopleRules(world).compliance,
  );
}

/** What a relaying link does with an order (0040): forward it after his hold, or object and send it back. */
export interface RelayAction {
  readonly action: 'forward' | 'object';
  readonly holdDays: number;
  /** His true reasons, as the truth layer's terms. */
  readonly terms: readonly BiasTerm[];
  /** What he says when he objects: the reasons he stated, weighted. */
  readonly stated: readonly StatedReason[];
}

/**
 * A relaying link's rung becomes his relay: exceed or comply forwards at once; reservations, a slow walk or a
 * reinterpretation (a relay cannot rewrite the order) forward after the pack's hold; an objection or a refusal sends it
 * back with his stated reasons. The terms carry the rung and each contribution (hard rule 6).
 */
export function relayAction(rules: PeopleRules, response: DirectiveResponse, person: PersonId, post: PostId): RelayAction {
  const contributions = response.contributions.map((c) => term('relay_term', c.amount, { person, post, rule: c.term }));
  const holdDays =
    response.actual === 'comply_with_reservations'
      ? rules.relay.reservationsHoldDays
      : response.actual === 'slow_walk'
        ? rules.relay.slowWalkHoldDays
        : response.actual === 'reinterpret'
          ? rules.relay.reinterpretHoldDays
          : 0;
  if (response.actual === 'object' || response.actual === 'refuse') {
    const stated = response.statedReasons.map((r) => ({ reasonKind: r.kind, reasonWeight: reasonWeight(r) }));
    return { action: 'object', holdDays: 0, terms: [term('relay_objection', response.willingness, { person, post, rule: response.actual }), ...contributions], stated };
  }
  const terms = holdDays > 0 ? [term('relay_hold', holdDays, { person, post, rule: response.actual }), ...contributions] : contributions;
  return { action: 'forward', holdDays, terms, stated: [] };
}

/** A stated reason's weight, permille, for the memorandum: its gap, shortfall, departure or grievance weight; else full. */
function reasonWeight(r: DirectiveResponse['reasons'][number]): number {
  switch (r.kind) {
    case 'too_rash':
    case 'too_timid':
      return r.gap;
    case 'lacks_resources':
      return r.shortfall;
    case 'departs_from_judgement':
      return r.departure;
    case 'holds_grievance':
      return Math.min(1000, r.weight);
    default:
      return 1000;
  }
}

/** A filter post's holder deciding what to do with a wire bound for his principal (0032). */
export interface FilterDecision {
  readonly holdDays: number;
  /** Claim kinds he cuts before the report goes on. */
  readonly trims: readonly string[];
  readonly terms: readonly BiasTerm[];
}

/**
 * The filter reads his values (lane 1.1): he holds a wire for the longest hold any of his values asks (the pack's
 * `filter.holdFor`), and, unless he is candid, cuts the claim kinds his values ask (`filter.trimFor`).
 */
export function filterDecision(rules: PeopleRules, holder: PersonTraits, post: PostId): FilterDecision {
  const terms: BiasTerm[] = [];
  let holdDays = 0;
  let holdValue: string | null = null;
  for (const h of rules.filter.holdFor) {
    if (holder.values.includes(h.value) && h.days > holdDays) {
      holdDays = h.days;
      holdValue = h.value;
    }
  }
  if (holdDays > 0) terms.push(term('filter_hold', holdDays, { person: holder.id, post, rule: `values:${holdValue}` }));
  const trims = new Set<string>();
  if (holder.candour < rules.filter.candidAt) {
    for (const t of rules.filter.trimFor) if (holder.values.includes(t.value)) for (const k of t.claimKinds) trims.add(k);
  }
  return { holdDays, trims: [...trims].sort(strictCompare), terms };
}

/** The value a trim of `claimKind` comes from, for its term (the first of his values the pack says cuts it). */
export function trimValueOf(rules: PeopleRules, holder: PersonTraits, claimKind: string): string {
  return rules.filter.trimFor.find((t) => holder.values.includes(t.value) && t.claimKinds.includes(claimKind))?.value ?? 'unknown';
}
