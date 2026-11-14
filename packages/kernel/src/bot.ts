import { strictCompare } from './compare.ts';
import { scale } from './permille.ts';
import type { KernelRules } from './rules.ts';
import type { Decision } from './verbs.ts';
import type { FactionView } from './view.ts';

/**
 * The bot principal (decision 0009): a cheap, deterministic policy that reads
 * only its own faction's view, never ground truth. It is deliberately simple;
 * its job in M1 is to be wired and to give the player's opponent the same
 * command problems the player has.
 */
export interface BotPolicy {
  /** Boldness of the bot's own offensives. */
  readonly boldness: number;
  /** Assumed enemy force in a region nobody has reported on. */
  readonly assumedForce: number;
  /** Days a directive stays "active" before the bot considers the post free again. */
  readonly patienceDays: number;
  /** Refusals after which the bot sacks a man. */
  readonly refusalsBeforeDismissal: number;
}

export const DEFAULT_BOT_POLICY: BotPolicy = Object.freeze({
  boldness: 700,
  assumedForce: 300,
  patienceDays: 28,
  refusalsBeforeDismissal: 2,
});

export function botDecisions(view: FactionView, rules: KernelRules, policy: BotPolicy = DEFAULT_BOT_POLICY): Decision[] {
  const decisions: Decision[] = [];
  const budget = () => decisions.length < view.attentionPerTurn;

  // 1. Answer objections by accepting the counter-proposal: the bot trusts its men's judgment.
  for (const d of view.directives) {
    if (d.objectionPending && budget()) decisions.push({ verb: 'accept_counter', directiveId: d.id });
  }

  // 2. Sack repeat refusers and replace them with the most competent man available.
  const refusals = new Map<string, number>();
  for (const d of view.directives) {
    if (d.told?.declared === 'refuse') refusals.set(d.told.personId, (refusals.get(d.told.personId) ?? 0) + 1);
  }
  const available = view.people
    .filter((p) => p.status === 'active' && p.postId === null)
    .sort((a, b) => b.competence - a.competence || strictCompare(a.id, b.id));
  for (const person of view.people) {
    if ((refusals.get(person.id) ?? 0) < policy.refusalsBeforeDismissal || person.postId === null) continue;
    const replacement = available.shift();
    if (!replacement || decisions.length + 2 > view.attentionPerTurn) break;
    decisions.push({ verb: 'dismiss', personId: person.id });
    decisions.push({ verb: 'appoint', postId: person.postId, personId: replacement.id });
  }

  // 3. Order an offensive wherever its own returns and reported enemy strength justify one.
  const busy = new Set(
    view.directives
      .filter((d) => view.day - d.issuedDay < policy.patienceDays && d.told?.declared !== 'refuse')
      .map((d) => d.postId),
  );
  for (const post of view.posts) {
    if (!budget()) break;
    if (post.kind !== 'field' || post.holderId === null || post.force === 0 || busy.has(post.id)) continue;
    const region = view.regions.find((r) => r.id === post.regionId);
    if (!region) continue;
    const targets = region.neighbours
      .map((id) => view.regions.find((r) => r.id === id)!)
      .filter((r) => r.controllerId !== view.factionId)
      .map((r) => ({ id: r.id, estimate: r.lastEstimate?.force ?? policy.assumedForce }))
      .sort((a, b) => a.estimate - b.estimate || strictCompare(a.id, b.id));
    const target = targets[0];
    if (!target) continue;
    // A bolder principal accepts worse odds: boldness 0 wants the full attack ratio, boldness 1000 wants parity.
    const ratio = rules.attackRatio - scale(rules.attackRatio - 1000, policy.boldness);
    const needed = Math.max(1, scale(target.estimate, ratio));
    if (post.force >= needed) {
      decisions.push({ verb: 'direct', postId: post.id, objective: { kind: 'attack', targetRegionId: target.id }, boldness: policy.boldness });
    }
  }
  return decisions;
}
