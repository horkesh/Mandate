import { sortedKeys, strictCompare } from './compare.ts';
import { adjacentEnemyRegions, assaultAvailability, defendingForce, grievanceLoad, ladderIndex, postOf } from './derive.ts';
import { log, report } from './messages.ts';
import { clamp, clampPermille } from './permille.ts';
import type { KernelRules } from './rules.ts';
import { LADDER, type GameState, type LadderRung, type Person } from './state.ts';
import { hasPendingOperation, launchOperation } from './theatre.ts';
import { addGrievance } from './verbs.ts';

/**
 * Weekly politics of the people (P5, P6): grievances fade, discontent moves
 * each person one rung at a time along the insubordination ladder, high rungs
 * bleed the principal's blocs, rivals emerge, freelancers act on their own,
 * and broken promises come due. Everything here is caused (0007).
 */
export function weeklyPeople(state: GameState, rules: KernelRules): void {
  for (const id of sortedKeys(state.persons)) {
    const person = state.persons[id]!;
    if (person.id === state.factions[person.factionId]!.principalId) continue;
    decayGrievances(person, rules);
    moveOnLadder(state, person, rules);
    applyLadderEffects(state, person, rules);
    checkRival(state, person, rules);
    freelance(state, person, rules);
  }
}

export function duePromises(state: GameState, rules: KernelRules): void {
  for (const factionId of sortedKeys(state.factions)) {
    const faction = state.factions[factionId]!;
    const due = faction.promises.filter((p) => p.dueDay <= state.day);
    if (due.length === 0) continue;
    faction.promises = faction.promises.filter((p) => p.dueDay > state.day);
    for (const promise of due) {
      faction.record.push({ day: state.day, kind: 'promise_broken', personId: promise.personId });
      const person = state.persons[promise.personId]!;
      person.regard = clamp(person.regard + rules.brokenPromiseRegard, -1000, 1000);
      addGrievance(state, person.id, 'promise_broken', rules);
      log(state, { kind: 'promise_broken', factionId, actors: [person.id], causes: [`promise not kept within ${rules.promiseDays} days`] });
    }
  }
}

function decayGrievances(person: Person, rules: KernelRules): void {
  for (const g of person.grievances) g.weight -= Math.max(1, Math.trunc(g.weight / rules.grievanceDecayDivisor));
  person.grievances = person.grievances.filter((g) => g.weight > 0);
}

/** Discontent: what a person holds against the principal, net of goodwill. */
export function discontentOf(state: GameState, person: Person): number {
  return grievanceLoad(state, person.id) - Math.trunc(person.regard / 2);
}

/** The rung discontent points to, capped by what the person can afford to do. */
export function targetRung(state: GameState, person: Person, rules: KernelRules): LadderRung {
  const discontent = discontentOf(state, person);
  let index = rules.ladderThresholds.filter((t) => discontent >= t).length;
  // Open defiance needs protection; armed defiance also needs an army.
  if (index >= 6 && person.standing < rules.publicDefianceStanding) index = 5;
  const force = postOf(state, person.id)?.force ?? 0;
  if (index >= 7 && (person.standing < rules.armedDefianceStanding || force < rules.armedDefianceForce)) index = 6;
  return LADDER[index]!;
}

function moveOnLadder(state: GameState, person: Person, rules: KernelRules): void {
  const current = ladderIndex(person.ladder);
  const target = ladderIndex(targetRung(state, person, rules));
  if (target === current) return;
  const next = LADDER[current + Math.sign(target - current)]!;
  const previous = person.ladder;
  person.ladder = next;
  log(state, {
    kind: 'ladder_moved',
    factionId: person.factionId,
    actors: [person.id],
    causes: [
      `discontent ${discontentOf(state, person)}`,
      ...person.grievances.map((g) => `grievance ${g.kind} ${g.weight}`),
      `regard ${person.regard}`,
      `standing ${person.standing}`,
    ],
    detail: { from: previous, to: next },
  });
  // The principal learns of it only through an overseer, or once it becomes public (lobbying and above).
  const delay = postOf(state, person.id)?.linkDays ?? 0;
  if (ladderIndex(next) >= ladderIndex('lobbying')) {
    report(state, person.factionId, { kind: 'public' }, { kind: 'signal', personId: person.id, rung: next }, 0);
  } else if (person.overseen) {
    report(state, person.factionId, { kind: 'overseer', watchingId: person.id }, { kind: 'signal', personId: person.id, rung: next }, delay);
  }
  if (next === 'armed_defiance' && !state.verdict) {
    state.verdict = { day: state.day, kind: 'mutiny', factionId: person.factionId, causes: [`${person.id} turned his army against the principal`] };
  }
}

function applyLadderEffects(state: GameState, person: Person, rules: KernelRules): void {
  const index = ladderIndex(person.ladder);
  if (index < ladderIndex('lobbying')) return;
  const drain = -(index - ladderIndex('lobbying') + 1) * rules.lobbyingSupportPerRung;
  for (const id of sortedKeys(state.blocs)) {
    const bloc = state.blocs[id]!;
    if (bloc.factionId !== person.factionId) continue;
    let delta = 0;
    if (bloc.values.some((v) => person.values.includes(v))) delta += drain;
    if (index >= ladderIndex('public_defiance')) delta += rules.publicDefianceSupport;
    if (person.rival && bloc.values.some((v) => person.values.includes(v))) delta += rules.rivalSupportDrain;
    if (delta !== 0) bloc.support = clamp(bloc.support + delta, -1000, 1000);
  }
}

/** Success breeds rivals (P6): a famous man who has turned against you becomes a contender. */
function checkRival(state: GameState, person: Person, rules: KernelRules): void {
  if (person.rival) return;
  if (person.standing < rules.rivalStanding || ladderIndex(person.ladder) < ladderIndex('lobbying')) return;
  person.rival = true;
  log(state, {
    kind: 'rival_emerged',
    factionId: person.factionId,
    actors: [person.id],
    causes: [`standing ${person.standing} >= ${rules.rivalStanding}`, `ladder ${person.ladder}`],
  });
  report(state, person.factionId, { kind: 'public' }, { kind: 'signal', personId: person.id, rung: person.ladder }, 0);
}

/** A bold man on the freelancing rung or above starts his own war (cf. AWWV stubbornness). */
function freelance(state: GameState, person: Person, rules: KernelRules): void {
  if (person.status !== 'active' || ladderIndex(person.ladder) < ladderIndex('freelancing')) return;
  if (person.boldness < rules.freelanceBoldness) return;
  if (state.day - person.lastFreelanceDay < rules.freelanceIntervalDays) return;
  const post = postOf(state, person.id);
  if (!post || post.kind !== 'field' || post.force === 0 || hasPendingOperation(state, post.id)) return;
  const targets = adjacentEnemyRegions(state, post).sort(
    (a, b) => defendingForce(state, a) - defendingForce(state, b) || strictCompare(a, b),
  );
  const target = targets[0];
  if (!target || assaultAvailability(state, post, target, rules) < 500) return;
  person.lastFreelanceDay = state.day;
  launchOperation(state, {
    factionId: person.factionId,
    postId: post.id,
    holderId: person.id,
    directiveId: null,
    targetRegionId: target,
    commitment: clampPermille(rules.freelanceCommitment),
    mode: 'assault',
    startDay: state.day,
    cause: `unordered: ${person.id} is ${person.ladder} and bold (${person.boldness})`,
  }, rules);
}
