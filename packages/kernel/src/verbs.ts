import { commitAudience, type Counter } from './audience.ts';
import { sortedKeys } from './compare.ts';
import { clampRegard, postOf, promiseCredibility } from './derive.ts';
import { log } from './messages.ts';
import { addGrievance, direct, keepPromise } from './orders.ts';
import type { PersonId } from './people.ts';
import { clamp, clampPermille, scale, type Permille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import type { BlocId, DirectiveId, FactionId, GameState, Objective, PostId } from './state.ts';

/**
 * The leader's verbs (decision 0001). Every verb targets a person, post, bloc
 * or directive, never a unit or a place directly. Each costs one point of
 * attention (P9).
 */
export type Decision =
  | { readonly verb: 'direct'; readonly postId: PostId; readonly objective: Objective; readonly boldness: Permille }
  | { readonly verb: 'audience'; readonly postId: PostId; readonly objective: Objective; readonly boldness: Permille; readonly counters: readonly Counter[] }
  | { readonly verb: 'appoint'; readonly postId: PostId; readonly personId: PersonId }
  | { readonly verb: 'dismiss'; readonly personId: PersonId }
  | { readonly verb: 'allocate'; readonly fromPostId: PostId; readonly toPostId: PostId; readonly amount: number }
  | { readonly verb: 'honour'; readonly personId: PersonId }
  | { readonly verb: 'promise'; readonly personId: PersonId }
  | { readonly verb: 'pressure'; readonly personId: PersonId }
  | { readonly verb: 'oversee'; readonly personId: PersonId }
  | { readonly verb: 'address'; readonly blocId: BlocId }
  | { readonly verb: 'insist'; readonly directiveId: DirectiveId }
  | { readonly verb: 'accept_counter'; readonly directiveId: DirectiveId };

export type Verb = Decision['verb'];

export interface Rejection {
  readonly decision: Decision;
  readonly reason: string;
}

/** Apply a principal's decisions in order. Invalid or unaffordable decisions are rejected, not thrown. */
export function applyDecisions(
  state: GameState,
  factionId: FactionId,
  decisions: readonly Decision[],
  rules: KernelRules,
): Rejection[] {
  const rejections: Rejection[] = [];
  const faction = state.factions[factionId]!;
  for (const decision of decisions) {
    if (faction.attentionLeft <= 0) {
      rejections.push({ decision, reason: 'no attention left this turn' });
      continue;
    }
    const problem = apply(state, factionId, decision, rules);
    if (problem) {
      rejections.push({ decision, reason: problem });
      continue;
    }
    faction.attentionLeft -= 1;
    log(state, { kind: `verb_${decision.verb}`, factionId, actors: actorsOf(decision), detail: detailOf(decision) });
  }
  return rejections;
}

function apply(state: GameState, factionId: FactionId, d: Decision, rules: KernelRules): string | null {
  switch (d.verb) {
    case 'direct':
      return direct(state, factionId, d.postId, d.objective, d.boldness);
    case 'audience':
      return commitAudience(state, factionId, { postId: d.postId, objective: d.objective, boldness: d.boldness, counters: d.counters }, rules);
    case 'allocate': {
      const to = state.posts[d.toPostId];
      if (!to || to.factionId !== factionId) return `unknown post ${d.toPostId}`;
      if (!Number.isSafeInteger(d.amount) || d.amount <= 0) return 'amount must be a positive integer';
      return direct(state, factionId, d.fromPostId, { kind: 'transfer', toPostId: d.toPostId, amount: d.amount }, 300);
    }
    case 'appoint':
      return appoint(state, factionId, d.postId, d.personId, rules);
    case 'dismiss':
      return dismiss(state, factionId, d.personId, rules);
    case 'honour': {
      const p = ownPerson(state, factionId, d.personId);
      if (typeof p === 'string') return p;
      p.regard = clampRegard(p.regard + rules.honourRegard);
      p.standing = clampPermille(p.standing + rules.honourStanding);
      keepPromise(state, factionId, d.personId);
      return null;
    }
    case 'promise': {
      const p = ownPerson(state, factionId, d.personId);
      if (typeof p === 'string') return p;
      const faction = state.factions[factionId]!;
      if (faction.promises.some((x) => x.personId === d.personId)) return 'a promise to this person is already pending';
      p.regard = clampRegard(p.regard + scale(rules.promiseRegard, promiseCredibility(state, factionId, rules)));
      faction.promises.push({ personId: d.personId, dueDay: state.day + rules.promiseDays });
      faction.record.push({ day: state.day, kind: 'promise_made', personId: d.personId });
      return null;
    }
    case 'pressure': {
      const p = ownPerson(state, factionId, d.personId);
      if (typeof p === 'string') return p;
      p.pressuredUntil = state.day + rules.pressureDays;
      addGrievance(state, d.personId, 'pressured', rules);
      return null;
    }
    case 'oversee': {
      const p = ownPerson(state, factionId, d.personId);
      if (typeof p === 'string') return p;
      if (p.overseen) return 'already overseen';
      p.overseen = true;
      addGrievance(state, d.personId, 'monitored', rules);
      return null;
    }
    case 'address': {
      const bloc = state.blocs[d.blocId];
      if (!bloc || bloc.factionId !== factionId) return `unknown bloc ${d.blocId}`;
      bloc.support = clamp(bloc.support + rules.addressSupport, -1000, 1000);
      for (const id of sortedKeys(state.blocs)) {
        const other = state.blocs[id]!;
        if (other.factionId !== factionId || other.id === bloc.id) continue;
        if (!other.values.some((v) => bloc.values.includes(v))) {
          other.support = clamp(other.support + rules.addressRivalPenalty, -1000, 1000);
        }
      }
      return null;
    }
    case 'insist':
    case 'accept_counter':
      return answerObjection(state, factionId, d.directiveId, d.verb === 'insist', rules);
  }
}

function answerObjection(state: GameState, factionId: FactionId, directiveId: DirectiveId, insist: boolean, rules: KernelRules): string | null {
  const directive = state.directives[directiveId];
  if (!directive || directive.factionId !== factionId) return `unknown directive ${directiveId}`;
  // The principal can only answer an objection it has actually been told about (0008, 0011).
  const known = state.claims.some(
    (c) => c.factionId === factionId && c.body.kind === 'response' && c.body.directiveId === directiveId && c.body.declared === 'object',
  );
  if (!known || directive.status !== 'awaiting_answer' || !directive.response) return 'no objection pending on that directive';
  const holderId = directive.response.holderId;
  if (insist) {
    state.factions[factionId]!.record.push({ day: state.day, kind: 'override', personId: holderId });
    addGrievance(state, holderId, 'overruled', rules);
    directive.status = 'superseded';
    return direct(state, factionId, directive.postId, directive.objective, directive.boldness, {
      insisted: true,
      framing: directive.framing,
      promisedForce: directive.promisedForce,
    });
  }
  const counter = directive.response.counterBoldness ?? directive.boldness;
  directive.status = 'superseded';
  return direct(state, factionId, directive.postId, directive.objective, counter, { counterOf: directive.id });
}

function appoint(state: GameState, factionId: FactionId, postId: PostId, personId: PersonId, rules: KernelRules): string | null {
  const post = state.posts[postId];
  if (!post || post.factionId !== factionId) return `unknown post ${postId}`;
  if (post.holderId !== null) return `post ${postId} is held; dismiss its holder first`;
  const person = ownPerson(state, factionId, personId);
  if (typeof person === 'string') return person;
  if (personId === state.factions[factionId]!.principalId) return 'the principal cannot hold a post';
  if (postOf(state, personId)) return `${personId} already holds a post`;
  post.holderId = personId;
  // Anyone senior who was available and passed over takes it personally.
  for (const id of sortedKeys(state.persons)) {
    const other = state.persons[id]!;
    if (other.factionId !== factionId || other.id === personId || other.status !== 'active') continue;
    if (other.id === state.factions[factionId]!.principalId || postOf(state, other.id)) continue;
    if (other.standing > person.standing) addGrievance(state, other.id, 'passed_over', rules);
  }
  keepPromise(state, factionId, personId);
  return null;
}

function dismiss(state: GameState, factionId: FactionId, personId: PersonId, rules: KernelRules): string | null {
  const person = ownPerson(state, factionId, personId);
  if (typeof person === 'string') return person;
  const post = postOf(state, personId);
  if (!post) return `${personId} holds no post`;
  post.holderId = null;
  person.status = 'dismissed';
  state.factions[factionId]!.record.push({ day: state.day, kind: 'dismissal', personId });
  addGrievance(state, personId, 'blamed', rules);
  // Blocs that share the dismissed man's values resent it, in proportion to his standing (P6).
  const loss = scale(person.standing, rules.dismissalSupportLossPerStanding);
  for (const id of sortedKeys(state.blocs)) {
    const bloc = state.blocs[id]!;
    if (bloc.factionId === factionId && bloc.values.some((v) => person.values.includes(v))) {
      bloc.support = clamp(bloc.support - loss, -1000, 1000);
    }
  }
  return null;
}

function ownPerson(state: GameState, factionId: FactionId, personId: PersonId) {
  const p = state.persons[personId];
  if (!p || p.factionId !== factionId) return `unknown person ${personId}`;
  if (p.status !== 'active') return `${personId} is not active`;
  return p;
}

function actorsOf(d: Decision): string[] {
  switch (d.verb) {
    case 'direct':
    case 'audience':
      return [d.postId];
    case 'allocate':
      return [d.fromPostId, d.toPostId];
    case 'appoint':
      return [d.postId, d.personId];
    case 'address':
      return [d.blocId];
    case 'insist':
    case 'accept_counter':
      return [d.directiveId];
    default:
      return [d.personId];
  }
}

function detailOf(d: Decision): Record<string, number | string> {
  if (d.verb === 'direct' || d.verb === 'audience') {
    return {
      objective: d.objective.kind,
      boldness: d.boldness,
      ...(d.objective.kind === 'attack' ? { target: d.objective.targetRegionId } : {}),
      ...(d.verb === 'audience' ? { counters: d.counters.map((c) => c.kind).join(',') } : {}),
    };
  }
  if (d.verb === 'allocate') return { amount: d.amount };
  return {};
}
