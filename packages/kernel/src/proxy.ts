import { sortedKeys } from './compare.ts';
import { resolveDirective } from './compliance.ts';
import type { ComplianceRung } from './directive.ts';
import {
  assaultAvailability,
  dispositionOf,
  oversightOf,
  sanctionCredibility,
} from './derive.ts';
import { log, report, send } from './messages.ts';
import { clampPermille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import type { Directive, GameState } from './state.ts';
import { launchOperation } from './theatre.ts';

/**
 * A proxy receives a directive (P2): reads it through his own values, regard,
 * fear and means, decides what he will actually do, and reports what he
 * chooses to say (0008). Proxies are deterministic (0007).
 */
export function receiveDirective(state: GameState, directive: Directive, rules: KernelRules): void {
  if (directive.status !== 'in_transit') return;
  const post = state.posts[directive.postId]!;
  if (post.holderId === null) {
    directive.status = 'superseded';
    log(state, { kind: 'directive_unheld', factionId: directive.factionId, actors: [directive.id, post.id], causes: ['post vacant on arrival'] });
    return;
  }
  const holder = state.persons[post.holderId]!;
  const objective = directive.objective;

  if (objective.kind === 'attack' && state.regions[objective.targetRegionId]!.controllerId === directive.factionId) {
    directive.status = 'done';
    log(state, { kind: 'directive_moot', factionId: directive.factionId, actors: [directive.id], causes: ['target already held on arrival'] });
    return;
  }

  const values = state.objectiveValues[objective.kind];
  const required = objective.kind === 'attack' ? 1000 : 0;
  const available = objective.kind === 'attack' ? assaultAvailability(state, post, objective.targetRegionId, rules) : 1000;
  let credibility = sanctionCredibility(state, directive.factionId, rules);
  if (directive.insisted) credibility = clampPermille(credibility + rules.insistCredibility);

  const response = resolveDirective(
    holder,
    { boldness: directive.boldness, honours: values.honours, offends: values.offends, required },
    {
      available,
      oversight: oversightOf(state, holder.id, rules),
      leaderCredibility: credibility,
      disposition: dispositionOf(state, holder.id, rules),
    },
    rules.compliance,
  );

  // Once overruled, a man can no longer object: he refuses if protected, or complies grudgingly.
  let actual: ComplianceRung = response.actual;
  let declared: ComplianceRung = response.declared;
  // His own counter-proposal, accepted, is his plan: he carries it out (if he still holds the post he proposed it from).
  const ownPlan = directive.counterOf !== null && state.directives[directive.counterOf]?.response?.holderId === holder.id;
  if (ownPlan) {
    actual = 'comply';
    declared = 'comply';
  } else if (directive.insisted && actual === 'object') {
    actual = holder.standing >= rules.compliance.protectedStandingAt ? 'refuse' : 'comply_with_reservations';
    declared = actual;
  }

  directive.response = {
    day: state.day,
    holderId: holder.id,
    actual,
    declared,
    willingness: response.willingness,
    contributions: response.contributions,
    reasons: response.reasons,
    statedReasons: response.statedReasons,
    counterBoldness: response.counterProposal?.boldness ?? null,
  };

  log(state, {
    kind: 'directive_read',
    factionId: directive.factionId,
    actors: [holder.id, directive.id],
    reasons: response.reasons,
    causes: response.contributions.map((c) => `${c.term} ${c.amount}`),
    detail: { actual, declared, willingness: response.willingness, insisted: directive.insisted, ownPlan, objective: objective.kind },
  });

  report(
    state,
    directive.factionId,
    { kind: 'person', personId: holder.id },
    {
      kind: 'response',
      directiveId: directive.id,
      personId: holder.id,
      declared,
      statedReasons: response.statedReasons,
      counterBoldness: actual === 'object' ? (response.counterProposal?.boldness ?? null) : null,
    },
    post.linkDays,
  );

  act(state, directive, actual, rules);
}

/** Turn the proxy's actual decision into action. */
function act(state: GameState, directive: Directive, actual: ComplianceRung, rules: KernelRules): void {
  const post = state.posts[directive.postId]!;
  const holderId = post.holderId!;
  const objective = directive.objective;

  if (actual === 'object') {
    directive.status = 'awaiting_answer';
    return;
  }
  if (actual === 'refuse') {
    directive.status = 'refused';
    return;
  }

  if (objective.kind === 'hold') {
    directive.status = 'done';
    return;
  }

  if (objective.kind === 'transfer') {
    const amount = actual === 'reinterpret' ? Math.trunc(objective.amount / 2) : objective.amount;
    const delay = actual === 'slow_walk' ? rules.slowWalkDelayDays : 0;
    const moved = Math.min(amount, post.force);
    post.force -= moved;
    const destination = state.posts[objective.toPostId]!;
    // Forces travel at courier speed: the two links, via the capital.
    send(state, state.day, delay + post.linkDays + destination.linkDays, {
      kind: 'transfer',
      fromPostId: post.id,
      toPostId: destination.id,
      amount: moved,
    });
    directive.status = 'done';
    log(state, { kind: 'transfer_sent', factionId: directive.factionId, actors: [holderId, post.id, destination.id], causes: [`response ${actual}`], detail: { ordered: objective.amount, moved, delay } });
    return;
  }

  // Attack.
  const delay =
    actual === 'slow_walk' ? rules.slowWalkDelayDays : actual === 'reinterpret' ? rules.reinterpretDelayDays : 0;
  launchOperation(state, {
    factionId: directive.factionId,
    postId: post.id,
    holderId,
    directiveId: directive.id,
    targetRegionId: objective.targetRegionId,
    commitment: rules.commitment[actual],
    mode: actual === 'reinterpret' ? 'demonstration' : 'assault',
    startDay: state.day + delay,
    cause: `response ${actual}`,
  }, rules);
  directive.status = 'executing';
}

/**
 * Delegation by default (P9): an objection the principal leaves unanswered is
 * settled by the proxy's own counter-proposal.
 */
export function settleStaleObjections(state: GameState, rules: KernelRules): void {
  for (const id of sortedKeys(state.directives)) {
    const directive = state.directives[id]!;
    if (directive.status !== 'awaiting_answer' || !directive.response) continue;
    const post = state.posts[directive.postId]!;
    // He waits for his objection to reach the capital and an answer to come back, plus the grace period.
    if (state.day - directive.response.day < rules.objectionTimeoutDays + 2 * post.linkDays) continue;
    const counter = directive.response.counterBoldness ?? 0;
    if (post.holderId !== directive.response.holderId) {
      directive.status = 'superseded';
      continue;
    }
    if (directive.objective.kind === 'attack' && counter >= rules.counterAttackMinBoldness) {
      launchOperation(state, {
        factionId: directive.factionId,
        postId: post.id,
        holderId: post.holderId,
        directiveId: directive.id,
        targetRegionId: directive.objective.targetRegionId,
        commitment: counter,
        mode: 'assault',
        startDay: state.day,
        cause: 'objection unanswered: proxy follows his own counter-proposal',
      }, rules);
      directive.status = 'executing';
    } else {
      directive.status = 'done';
    }
    log(state, {
      kind: 'delegated_by_default',
      factionId: directive.factionId,
      actors: [directive.response.holderId, directive.id],
      causes: [`no answer within ${rules.objectionTimeoutDays + 2 * post.linkDays} days (grace + round trip)`],
      detail: { counterBoldness: counter },
    });
  }
}
