/**
 * The audience on the new State (lane 1.5; P3; M2's `audience.ts` recast for plans), owned by `audience`.
 *
 * The principal hears a commander out about his plan, before it is approved or during its execution, and may answer the
 * reasons he states with counters (M2's typed counters). Each counter answers only certain kinds of reason; an uncandid
 * man hides his, so nothing is offered against them; a threat answers nothing and leaves a grievance. What he declares
 * is computed by the same compliance he reads orders with (`reading/orders.ts`), so the preview is exactly what he would
 * say. A preview never changes the State; holding the audience applies the counters through their owners (`people` for
 * grievances, regard, standing and promises; `command` for an observer's recall) and records it here.
 */
import { strictCompare } from '../compare.ts';
import type { DirectiveResponse, DirectiveTerms, Reason } from '../directive.ts';
import type { PersonId, PostId } from '../ids.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { answerOrder, goalTerms, principalCredibility, type ReadingWorld } from '../reading/orders.ts';
import { goalKindOf } from '../plans/goal.ts';
import type { State } from '../root-state.ts';

export { COUNTER_KINDS, type CounterKind, type CounterTerms } from './counters.ts';
import { COUNTER_KINDS, type CounterKind, type CounterTerms } from './counters.ts';

const grievanceIs = (r: Reason, kinds: readonly string[]) => r.kind === 'holds_grievance' && kinds.includes(r.grievance);

/** Which stated reasons each counter answers (M2's table). `threaten` answers none: it is coercion, not persuasion. */
export const COUNTER_ANSWERS: Readonly<Record<CounterKind, (r: Reason) => boolean>> = {
  frame: (r) => r.kind === 'values_offended',
  adjust: (r) => r.kind === 'too_rash' || r.kind === 'too_timid',
  reinforce: (r) => r.kind === 'lacks_resources',
  promise_advancement: (r) => grievanceIs(r, ['passed_over']),
  withdraw_overseer: (r) => grievanceIs(r, ['monitored']),
  ease_pressure: (r) => grievanceIs(r, ['pressured']),
  vindicate: (r) => grievanceIs(r, ['blamed', 'overruled', 'promise_broken', 'relieved']),
  threaten: () => false,
};

/** An audience record: the last held with each man. Immutable: `audience` replaces it whole. */
export interface AudienceRecord {
  readonly audDay: number;
  /** Before his plan is approved, or during its execution. */
  readonly audAbout: 'before' | 'during';
  readonly audCounters: readonly CounterKind[];
}

export interface AudienceOutcome {
  readonly person: PersonId;
  readonly about: 'before' | 'during';
  /** What he says he will do, and the reasons he gives (0008: what he says, not what he will do). */
  readonly declared: DirectiveResponse['declared'];
  readonly statedReasons: readonly Reason[];
  /** For each counter that answers a reason he stated (and always frame and threaten): which reasons. */
  readonly options: readonly { readonly counter: CounterKind; readonly answers: readonly Reason[] }[];
  /** Stated reasons nothing in one audience can answer (distrust, his own standing). */
  readonly unanswerable: readonly Reason[];
  /** The values a frame may name: his own, except cost-only ones (0074), which honouring never helps. */
  readonly frames: readonly string[];
  readonly problems: readonly string[];
  /** The full answer, for the truth layer (never shown to a principal). */
  readonly response: DirectiveResponse;
  /** What holding the audience changes, for `people` to apply. */
  readonly changes: readonly PeopleChange[];
  /** The observers it recalls (withdraw_overseer). */
  readonly recall: readonly PersonId[];
  /** A reinforcement it promises: a transfer order to another holder (P1). */
  readonly reinforce: { readonly from: PostId; readonly men: number } | null;
}

/**
 * A plan as its holder reads it (`tick/audience-plan.ts`): the chosen candidate's terms as lane 1.2's `editDirective`
 * builds them, and the strength it commits. `editDirective`'s `required` is on a scale where 500 is "the men the plan
 * commits are enough", so what he holds for it reads as 500 on the same scale (`PLAN_HOLDS`).
 */
export interface PlanReading {
  readonly terms: DirectiveTerms;
  readonly strength: number;
}

/** What the post holds for its plan, on `editDirective`'s scale for `required` (its men needed * 500 / the men committed). */
export const PLAN_HOLDS = 500;

/**
 * The audience's subject: the chosen plan's terms when it is read (`planned`), before approval or during execution;
 * else the goal's terms; or a goal of `prospective` kind not yet sent ("before").
 */
function subject(world: ReadingWorld, state: State, post: PostId, prospective: 'hold' | 'advance' | null, planned: PlanReading | null): { readonly terms: DirectiveTerms; readonly about: 'before' | 'during' } | string {
  const plan = state.planRecords[post];
  if (plan === undefined) {
    if (prospective === null) return `${post} has no plan to talk about`;
    return { terms: goalTerms(world.map.world.rules.people, prospective), about: 'before' };
  }
  const about = plan.planStatus === 'approved' ? 'during' : 'before';
  return { terms: planned?.terms ?? goalTerms(world.map.world.rules.people, goalKindOf(plan.planGoal)), about };
}

/**
 * Preview an audience with the holder of `post`, for `principal`, with these counters. Pure: the counters are applied
 * to a copy of the people fields the answer reads. Problems (a counter offered twice, one that answers nothing he holds,
 * too many) are returned, and an audience with problems cannot be held.
 */
export function previewAudience(
  world: ReadingWorld,
  state: State,
  principal: PersonId,
  post: PostId,
  counters: readonly CounterTerms[],
  day: number,
  prospective: 'hold' | 'advance' | null = null,
  planned: PlanReading | null = null,
): AudienceOutcome | string {
  const holder = state.postStates[post]?.postHolder ?? null;
  if (holder === null) return `${post} is not held`;
  const about = subject(world, state, post, prospective, planned);
  if (typeof about === 'string') return about;
  const rules = world.map.world.rules.people;
  const costOnly = new Set(world.map.world.vocabularies.values.filter((v) => v.costOnly).map((v) => v.id));
  const own = world.map.world.people.find((p) => p.id === holder)?.values.map((v) => v.value) ?? [];
  const frames = own.filter((v) => !costOnly.has(v)).sort(strictCompare);
  const problems: string[] = [];
  const changes: PeopleChange[] = [];
  const recall: PersonId[] = [];
  let reinforce: { from: PostId; men: number } | null = null;
  let terms = about.terms;
  if (counters.length > rules.verbs.audience.maxCounters) problems.push(`an audience allows at most ${rules.verbs.audience.maxCounters} counters`);
  const held = state.personGrievances[holder] ?? [];
  const holds = (kinds: readonly string[]) => held.some((g) => kinds.includes(g.grievanceKind));
  const seen = new Set<CounterKind>();
  for (const c of counters) {
    if (seen.has(c.kind)) {
      problems.push(`counter ${c.kind} offered twice`);
      continue;
    }
    seen.add(c.kind);
    switch (c.kind) {
      case 'frame':
        if (c.value === null || !frames.includes(c.value)) problems.push(`the plan cannot be framed as ${c.value ?? 'nothing'}: frame it in one of his own values (${frames.join(', ') || 'none'})`);
        else terms = { ...terms, honours: [...new Set([...terms.honours, c.value])].sort(strictCompare) };
        break;
      case 'adjust':
        if (c.boldness === null || !Number.isSafeInteger(c.boldness) || c.boldness < 0 || c.boldness > 1000) problems.push('adjust needs a boldness permille');
        else terms = { ...terms, boldness: c.boldness };
        break;
      case 'reinforce': {
        const from = c.from === null ? undefined : state.postStates[c.from as PostId];
        if (c.from === null || from === undefined || c.from === post) problems.push(`cannot reinforce from ${c.from ?? 'nowhere'}`);
        else if (c.men === null || !Number.isSafeInteger(c.men) || c.men < 1) problems.push('reinforce names a number of men');
        else reinforce = { from: c.from as PostId, men: c.men };
        break;
      }
      case 'promise_advancement':
        if ((state.personPromises[holder] ?? []).some((p) => p.promiseKind === 'advancement')) problems.push('a promise of advancement to him is already pending');
        else {
          changes.push({ change: 'promise', person: holder, kind: 'advancement', due: day + rules.verbs.promise.dueDays });
          changes.push({ change: 'clear_grievances', person: holder, kinds: ['passed_over'] });
        }
        break;
      case 'withdraw_overseer': {
        const watching = (Object.keys(state.observerPostings) as PersonId[]).filter((o) => state.observerPostings[o]!.obsPost === post).sort(strictCompare);
        if (watching.length === 0) problems.push('nobody is watching him');
        else {
          recall.push(...watching);
          changes.push({ change: 'clear_grievances', person: holder, kinds: ['monitored'] });
        }
        break;
      }
      case 'ease_pressure':
        if (!holds(['pressured'])) problems.push('he is not under pressure');
        else changes.push({ change: 'clear_grievances', person: holder, kinds: ['pressured'] });
        break;
      case 'vindicate':
        // Public vindication heals the wound and raises his standing: the price is a more independent man (P6).
        changes.push({ change: 'regard', person: holder, toward: principal, delta: rules.verbs.audience.vindicateRegard });
        changes.push({ change: 'standing', person: holder, delta: rules.verbs.audience.vindicateStanding });
        changes.push({ change: 'clear_grievances', person: holder, kinds: ['blamed', 'overruled', 'relieved'] });
        changes.push({ change: 'halve_grievances', person: holder, kinds: ['promise_broken'] });
        break;
      case 'threaten':
        changes.push({ change: 'grievance', person: holder, kind: 'pressured', weight: rules.verbs.pressure.weight, against: principal, cause: 'audience' });
        break;
    }
  }
  // His answer with the counters applied: what holding the audience would leave him saying.
  const scratch = applyPeopleChanges(state, changes, day, rules, world.map.world.vocabularies.ranks);
  // A promised reinforcement counts toward what he holds for the plan only as far as the principal's promises are
  // believed (M2's case 7): its men on the plan's scale, scaled by his credibility.
  const believed = reinforce === null || planned === null || planned.strength === 0 ? 0 : Math.trunc((Math.trunc((reinforce.men * PLAN_HOLDS) / planned.strength) * principalCredibility(world, state, holder)) / 1000);
  const available = planned === null ? undefined : Math.min(1000, PLAN_HOLDS + believed);
  const means = { ...(available === undefined ? {} : { available }), ...(reinforce === null ? {} : { supportPromised: ['reinforcement'] }) };
  const response = answerOrder(world, scratch, holder, principal, terms, means);
  const stated = response.statedReasons;
  const options = COUNTER_KINDS.map((counter) => ({ counter, answers: stated.filter(COUNTER_ANSWERS[counter]) })).filter(
    (o) => o.answers.length > 0 || o.counter === 'threaten' || (o.counter === 'frame' && frames.length > 0),
  );
  const answerable = (r: Reason) => COUNTER_KINDS.some((k) => COUNTER_ANSWERS[k](r));
  const unanswerable = stated.filter((r) => !answerable(r) && r.kind !== 'values_honoured' && r.kind !== 'trusts_leader');
  return { person: holder, about: about.about, declared: response.declared, statedReasons: stated, options, unanswerable, frames, problems, response, changes, recall, reinforce };
}

/** Record an audience held (the only writer of `audienceHeld`). */
export function recordAudience(state: State, person: PersonId, record: AudienceRecord): State {
  return { ...state, audienceHeld: { ...state.audienceHeld, [person]: record } };
}
