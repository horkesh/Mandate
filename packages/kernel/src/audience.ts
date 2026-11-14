import type { ComplianceRung, Reason } from './directive.ts';
import { clampRegard } from './derive.ts';
import { addGrievance, direct, keepPromise, removeGrievances } from './orders.ts';
import type { PersonId, ValueId } from './people.ts';
import { clampPermille, type Permille } from './permille.ts';
import { readOrder } from './reading.ts';
import type { KernelRules } from './rules.ts';
import type { FactionId, GameState, GrievanceKind, Objective, PostId } from './state.ts';

/**
 * The Audience (P3): before committing an order, the principal hears the
 * holder state his position and reasons, and may answer with counters. Each
 * counter answers only certain kinds of reason. Grievances are not
 * interchangeable: reinforcements do not soothe a man passed over for
 * promotion. You can only answer reasons he states; an uncandid man hides his.
 */
export type Counter =
  | { readonly kind: 'frame'; readonly value: ValueId }
  | { readonly kind: 'adjust'; readonly boldness: Permille }
  | { readonly kind: 'reinforce'; readonly fromPostId: PostId; readonly amount: number }
  | { readonly kind: 'promise_advancement' }
  | { readonly kind: 'withdraw_overseer' }
  | { readonly kind: 'ease_pressure' }
  | { readonly kind: 'vindicate' }
  | { readonly kind: 'threaten' };

export type CounterKind = Counter['kind'];

const grievanceIs = (r: Reason, kinds: readonly GrievanceKind[]) =>
  r.kind === 'holds_grievance' && (kinds as readonly string[]).includes(r.grievance);

/** Which stated reasons each counter answers. `threaten` answers none: it is coercion, not persuasion. */
export const COUNTER_ANSWERS: Readonly<Record<CounterKind, (r: Reason) => boolean>> = {
  frame: (r) => r.kind === 'values_offended',
  adjust: (r) => r.kind === 'too_rash' || r.kind === 'too_timid',
  reinforce: (r) => r.kind === 'lacks_resources',
  promise_advancement: (r) => grievanceIs(r, ['passed_over']),
  withdraw_overseer: (r) => grievanceIs(r, ['monitored']),
  ease_pressure: (r) => grievanceIs(r, ['pressured']),
  vindicate: (r) => grievanceIs(r, ['blamed', 'overruled', 'promise_broken']),
  threaten: () => false,
};

export const COUNTER_KINDS: readonly CounterKind[] = [
  'frame', 'adjust', 'reinforce', 'promise_advancement', 'withdraw_overseer', 'ease_pressure', 'vindicate', 'threaten',
];

export interface AudienceDraft {
  readonly postId: PostId;
  readonly objective: Objective;
  readonly boldness: Permille;
  readonly counters: readonly Counter[];
}

export interface AudienceOutcome {
  readonly personId: PersonId;
  /** What he says he will do. */
  readonly declared: ComplianceRung;
  /** The reasons he gives. */
  readonly statedReasons: readonly Reason[];
  /** His counter-proposal, if he objects. */
  readonly counterBoldness: Permille | null;
  /** For each counter kind that answers one of his stated reasons: which reasons it answers. */
  readonly options: readonly { readonly counter: CounterKind; readonly answers: readonly Reason[] }[];
  /** Stated reasons nothing in one audience can answer (e.g. distrust, his own standing). */
  readonly unanswerable: readonly Reason[];
  /** Values the order may be framed in. */
  readonly frames: readonly ValueId[];
  /** Problems with the counters offered, if any. */
  readonly problems: readonly string[];
}

/**
 * Preview an audience. Pure: works on a copy of the state. What it returns is
 * exactly what the holder would declare if the order arrived now with these
 * counters applied (0008: what he says, not what he will do).
 */
export function holdAudience(state: GameState, factionId: FactionId, draft: AudienceDraft, rules: KernelRules): AudienceOutcome {
  const scratch = structuredClone(state);
  const applied = applyCounters(scratch, factionId, draft, rules);
  const post = scratch.posts[draft.postId];
  if (!post || post.factionId !== factionId || post.holderId === null) {
    throw new Error(`no audience possible: ${draft.postId} is not a held post of ${factionId}`);
  }
  const holder = scratch.persons[post.holderId]!;
  const response = readOrder(scratch, factionId, holder, post, {
    objective: draft.objective,
    boldness: applied.boldness,
    framing: applied.framing,
    promisedForce: applied.promisedForce,
    insisted: false,
  }, rules);

  const stated = response.statedReasons;
  const frames = state.objectiveValues[draft.objective.kind].frames ?? [];
  const options = COUNTER_KINDS
    .filter((counter) => counter !== 'frame' || frames.length > 0)
    .map((counter) => ({ counter, answers: stated.filter(COUNTER_ANSWERS[counter]) }))
    // Threats and appeals to his values are always available; the rest only when they answer something he said.
    .filter((o) => o.answers.length > 0 || o.counter === 'threaten' || o.counter === 'frame');
  const answerable = (r: Reason) => COUNTER_KINDS.some((k) => COUNTER_ANSWERS[k](r));
  const unanswerable = stated.filter((r) => !answerable(r) && r.kind !== 'values_honoured' && r.kind !== 'trusts_leader');

  return {
    personId: holder.id,
    declared: response.declared,
    statedReasons: stated,
    counterBoldness: response.counterProposal?.boldness ?? null,
    options,
    unanswerable,
    frames,
    problems: applied.problems,
  };
}

/**
 * Commit an audience: the counters take effect for real, and the order is
 * issued with the agreed terms. Returns a problem string if it cannot be held.
 */
export function commitAudience(state: GameState, factionId: FactionId, draft: AudienceDraft, rules: KernelRules): string | null {
  const post = state.posts[draft.postId];
  if (!post || post.factionId !== factionId || post.holderId === null) return `${draft.postId} is not a held post`;
  // Dry run on a copy first, so a refused audience changes nothing.
  const dry = applyCounters(structuredClone(state), factionId, draft, rules);
  if (dry.problems.length > 0) return dry.problems.join('; ');
  const applied = applyCounters(state, factionId, draft, rules);
  return direct(state, factionId, draft.postId, draft.objective, applied.boldness, {
    framing: applied.framing,
    promisedForce: applied.promisedForce,
  });
}

interface Applied {
  readonly boldness: Permille;
  readonly framing: ValueId | null;
  readonly promisedForce: number;
  readonly problems: string[];
}

function applyCounters(state: GameState, factionId: FactionId, draft: AudienceDraft, rules: KernelRules): Applied {
  const problems: string[] = [];
  let boldness = draft.boldness;
  let framing: ValueId | null = null;
  let promisedForce = 0;

  const post = state.posts[draft.postId];
  if (!post || post.holderId === null) return { boldness, framing, promisedForce, problems: [`${draft.postId} is not held`] };
  const personId = post.holderId;
  const person = state.persons[personId]!;
  const faction = state.factions[factionId]!;

  if (draft.counters.length > rules.audienceMaxCounters) {
    problems.push(`an audience allows at most ${rules.audienceMaxCounters} counters`);
  }
  const seen = new Set<CounterKind>();
  for (const c of draft.counters) {
    if (seen.has(c.kind)) {
      problems.push(`counter ${c.kind} offered twice`);
      continue;
    }
    seen.add(c.kind);
    switch (c.kind) {
      case 'frame': {
        const frames = state.objectiveValues[draft.objective.kind].frames ?? [];
        if (!frames.includes(c.value)) problems.push(`this order cannot be framed as ${c.value}`);
        else framing = c.value;
        break;
      }
      case 'adjust':
        if (!Number.isSafeInteger(c.boldness) || c.boldness < 0 || c.boldness > 1000) problems.push('boldness must be an integer permille');
        else boldness = c.boldness;
        break;
      case 'reinforce': {
        const from = state.posts[c.fromPostId];
        if (!from || from.factionId !== factionId || from.id === post.id) problems.push(`cannot reinforce from ${c.fromPostId}`);
        else if (!Number.isSafeInteger(c.amount) || c.amount <= 0 || c.amount > from.force) problems.push(`${c.fromPostId} cannot spare ${c.amount}`);
        else {
          promisedForce = c.amount;
          // The reinforcement is itself an order, to another holder who may drag his feet (P1).
          const problem = direct(state, factionId, from.id, { kind: 'transfer', toPostId: post.id, amount: c.amount }, 300);
          if (problem) problems.push(problem);
        }
        break;
      }
      case 'promise_advancement':
        if (faction.promises.some((p) => p.personId === personId)) problems.push('a promise to him is already pending');
        else {
          faction.promises.push({ personId, dueDay: state.day + rules.promiseDays });
          faction.record.push({ day: state.day, kind: 'promise_made', personId });
          removeGrievances(state, personId, ['passed_over']);
        }
        break;
      case 'withdraw_overseer':
        if (!person.overseen) problems.push('he is not being overseen');
        else {
          person.overseen = false;
          removeGrievances(state, personId, ['monitored']);
        }
        break;
      case 'ease_pressure':
        if (person.pressuredUntil < state.day) problems.push('he is not under pressure');
        else {
          person.pressuredUntil = -1;
          removeGrievances(state, personId, ['pressured']);
        }
        break;
      case 'vindicate':
        // Public vindication heals the wound and raises his standing: the price is a more independent man (P6).
        person.regard = clampRegard(person.regard + rules.honourRegard);
        person.standing = clampPermille(person.standing + rules.honourStanding);
        removeGrievances(state, personId, ['blamed', 'overruled']);
        for (const g of person.grievances) if (g.kind === 'promise_broken') g.weight = Math.trunc(g.weight / 2);
        keepPromise(state, factionId, personId);
        break;
      case 'threaten':
        person.pressuredUntil = state.day + rules.pressureDays;
        addGrievance(state, personId, 'pressured', rules);
        break;
    }
  }
  return { boldness, framing, promisedForce, problems };
}
