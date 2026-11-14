import { sortedKeys, strictCompare } from './compare.ts';
import { defendingCompetence, defendingForce, postOf } from './derive.ts';
import { log, report } from './messages.ts';
import type { PersonId } from './people.ts';
import { clamp, clampPermille, scale, type Permille } from './permille.ts';
import { createStream, nextInt } from './rng.ts';
import type { KernelRules } from './rules.ts';
import { newId, type Author, type DirectiveId, type FactionId, type GameState, type Operation, type PostId, type RegionId } from './state.ts';

/**
 * The theatre is deliberately coarse and hidden behind reports (P13). Battles
 * carry seeded noise (0007: dice for battles, never for people).
 */

export interface LaunchSpec {
  readonly factionId: FactionId;
  readonly postId: PostId;
  readonly holderId: PersonId;
  readonly directiveId: DirectiveId | null;
  readonly targetRegionId: RegionId;
  readonly commitment: Permille;
  readonly mode: Operation['mode'];
  readonly startDay: number;
  readonly cause: string;
}

export function launchOperation(state: GameState, spec: LaunchSpec, rules: KernelRules): Operation {
  const id = newId(state, 'op');
  const op: Operation = {
    id,
    factionId: spec.factionId,
    postId: spec.postId,
    holderId: spec.holderId,
    directiveId: spec.directiveId,
    targetRegionId: spec.targetRegionId,
    commitment: spec.commitment,
    mode: spec.mode,
    startDay: spec.startDay,
    resolveDay: spec.startDay + rules.opDurationDays,
    status: 'pending',
  };
  state.operations[id] = op;
  log(state, {
    kind: 'operation_planned',
    factionId: spec.factionId,
    actors: [spec.holderId, spec.postId, id],
    causes: [spec.cause],
    detail: { target: spec.targetRegionId, commitment: spec.commitment, mode: spec.mode, startDay: spec.startDay },
  });
  return op;
}

export function hasPendingOperation(state: GameState, postId: PostId): boolean {
  return Object.values(state.operations).some((op) => op.postId === postId && op.status === 'pending');
}

/** Resolve every operation due today, in id order. */
export function resolveDueOperations(state: GameState, rules: KernelRules): void {
  const due = sortedKeys(state.operations)
    .map((id) => state.operations[id]!)
    .filter((op) => op.status === 'pending' && op.resolveDay <= state.day);
  for (const op of due) resolveOperation(state, op, rules);
}

function resolveOperation(state: GameState, op: Operation, rules: KernelRules): void {
  const post = state.posts[op.postId]!;
  const target = state.regions[op.targetRegionId]!;
  const defender = target.controllerId;
  // The army may have moved, changed hands, or the region may already have fallen.
  if (defender === op.factionId || post.holderId !== op.holderId || !state.regions[post.regionId]!.neighbours.includes(target.id)) {
    op.status = 'cancelled';
    log(state, { kind: 'operation_cancelled', factionId: op.factionId, actors: [op.id], causes: ['circumstances changed before the assault'] });
    return;
  }

  const attacker = state.persons[op.holderId]!;
  const committed = scale(post.force, op.commitment);
  const defenceForce = defendingForce(state, target.id);
  const stream = (state.rng[`battle/${op.id}`] ??= createStream(state.seed, `battle/${op.id}`));
  const swing = () => 1000 - rules.battleNoise + nextInt(stream, 2 * rules.battleNoise + 1);

  const attackPower = scale(scale(committed, 500 + attacker.competence), swing());
  const defencePower = scale(scale(scale(defenceForce, 500 + defendingCompetence(state, target.id)), rules.defenseBonus), swing());
  // A demonstration is not meant to take ground; it can only if the defence collapses.
  const taken = op.mode === 'demonstration' ? attackPower > defencePower * 2 : attackPower > defencePower;

  const attackerLosses = scale(committed, taken ? rules.winnerLosses : rules.loserLosses);
  const defenderLossRate = taken ? rules.loserLosses : rules.winnerLosses;
  post.force -= attackerLosses;
  let defenderLosses = 0;
  const defendingPosts = sortedKeys(state.posts)
    .map((id) => state.posts[id]!)
    .filter((p) => p.regionId === target.id && p.factionId === defender);
  for (const p of defendingPosts) {
    const loss = scale(p.force, defenderLossRate);
    p.force -= loss;
    defenderLosses += loss;
  }

  op.status = 'resolved';
  const standingDelta = taken ? rules.victoryStanding : op.mode === 'demonstration' ? Math.trunc(rules.defeatStanding / 4) : rules.defeatStanding;
  attacker.standing = clampPermille(attacker.standing + standingDelta);
  for (const p of defendingPosts) {
    if (p.holderId) {
      const h = state.persons[p.holderId]!;
      h.standing = clampPermille(h.standing + (taken ? rules.defeatStanding : Math.trunc(rules.victoryStanding / 2)));
    }
  }
  // Politics weighs a battle by its size: a skirmish is not a Bull Run. A failed demonstration is a smaller blow.
  const magnitude = battleMagnitude(state, op.factionId, committed, rules);
  const baseDelta = taken ? rules.blocVictorySupport : op.mode === 'demonstration' ? Math.trunc(rules.blocDefeatSupport / 2) : rules.blocDefeatSupport;
  shiftBlocs(state, op.factionId, scale(baseDelta, magnitude), rules);

  if (taken) {
    target.controllerId = op.factionId;
    shiftBlocs(state, defender, scale(rules.blocRegionLostSupport, battleMagnitude(state, defender, defenceForce, rules)), rules);
    for (const p of defendingPosts) retreat(state, p.id);
    post.regionId = target.id;
  }

  log(state, {
    kind: 'operation_resolved',
    factionId: op.factionId,
    actors: [op.holderId, op.postId, op.id, target.id],
    causes: [
      `attack power ${attackPower} (committed ${committed} at ${op.commitment} permille, competence ${attacker.competence})`,
      `defence power ${defencePower} (force ${defenceForce})`,
    ],
    detail: { outcome: taken ? 'taken' : 'repulsed', attackerLosses, defenderLosses, defenceForce, committed, mode: op.mode },
  });

  // Each side's commander reports, shading the truth by his candour (P4).
  reportResult(state, op.factionId, attacker.id, op.id, target.id, taken ? 'taken' : 'repulsed', defenceForce, attackerLosses, rules);
  const mainDefender = defendingPosts.find((p) => p.holderId !== null);
  if (mainDefender?.holderId) {
    reportResult(state, defender, mainDefender.holderId, op.id, target.id, taken ? 'lost' : 'held', committed, defenderLosses, rules);
  }
}

function reportResult(
  state: GameState,
  factionId: FactionId,
  personId: PersonId,
  operationId: string,
  regionId: RegionId,
  outcome: 'taken' | 'repulsed' | 'held' | 'lost',
  enemyForce: number,
  ownLosses: number,
  _rules: KernelRules,
): void {
  const person = state.persons[personId]!;
  const post = postOf(state, personId);
  const delay = post?.linkDays ?? 0;
  const bad = outcome === 'repulsed' || outcome === 'lost';
  // An uncandid man who failed inflates the enemy and understates his losses.
  const shade = person.candour >= 500 ? 0 : 500 - person.candour;
  const reportedEnemyForce = bad ? enemyForce + scale(enemyForce, shade * 2) : enemyForce;
  const reportedOwnLosses = ownLosses - scale(ownLosses, shade);
  const author: Author = { kind: 'person', personId };
  report(state, factionId, author, { kind: 'op_result', operationId, regionId, outcome, reportedEnemyForce, reportedOwnLosses }, delay);
  report(state, factionId, author, { kind: 'enemy_strength', regionId, force: reportedEnemyForce }, delay);
  // An overseer attached to him sends the unvarnished version (P4: independent channels).
  if (person.overseen && (reportedEnemyForce !== enemyForce || reportedOwnLosses !== ownLosses)) {
    report(state, factionId, { kind: 'overseer', watchingId: personId }, { kind: 'op_result', operationId, regionId, outcome, reportedEnemyForce: enemyForce, reportedOwnLosses: ownLosses }, delay);
  }
}

/** Retreat a post to the first adjacent region its faction holds, or lose its force. */
function retreat(state: GameState, postId: PostId): void {
  const post = state.posts[postId]!;
  const options = [...state.regions[post.regionId]!.neighbours]
    .filter((n) => state.regions[n]!.controllerId === post.factionId)
    .sort(strictCompare);
  const destination = options[0];
  if (destination) {
    post.regionId = destination;
  } else {
    log(state, { kind: 'force_destroyed', factionId: post.factionId, actors: [post.id], causes: ['no line of retreat'], detail: { force: post.force } });
    post.force = 0;
  }
}

/** Permille weight of a battle at home: its force as a share of the faction's whole force, from a quarter to full. */
function battleMagnitude(state: GameState, factionId: FactionId, force: number, rules: KernelRules): Permille {
  let total = 0;
  for (const id of sortedKeys(state.posts)) {
    const post = state.posts[id]!;
    if (post.factionId === factionId) total += post.force;
  }
  if (total <= 0) return 1000;
  const share = Math.trunc((force * 1000) / total);
  return clamp(Math.trunc((share * 1000) / rules.majorBattleShare), 250, 1000);
}

function shiftBlocs(state: GameState, factionId: FactionId, delta: number, rules: KernelRules): void {
  const aligned = new Set(state.objectiveValues.attack.honours);
  for (const id of sortedKeys(state.blocs)) {
    const bloc = state.blocs[id]!;
    if (bloc.factionId !== factionId) continue;
    const bonus = bloc.values.some((v) => aligned.has(v)) ? Math.sign(delta) * rules.blocAlignedBonus : 0;
    bloc.support = clamp(bloc.support + delta + bonus, -1000, 1000);
  }
}
