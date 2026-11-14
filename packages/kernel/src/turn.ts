import { botDecisions } from './bot.ts';
import { sortedKeys } from './compare.ts';
import { mandate } from './derive.ts';
import { duePromises, weeklyPeople } from './ladder.ts';
import { log } from './messages.ts';
import { receiveDirective, settleStaleObjections } from './proxy.ts';
import { DEFAULT_KERNEL_RULES, type KernelRules } from './rules.ts';
import { newId, type FactionId, type GameState } from './state.ts';
import { resolveDueOperations } from './theatre.ts';
import { applyDecisions, type Decision, type Rejection } from './verbs.ts';
import { viewFor } from './view.ts';

/**
 * The turn (decision 0010): apply the principals' decisions, then run day
 * ticks until something needs the player (a decision point), within the
 * scenario's minimum and maximum turn length. Pure: the input state is never
 * mutated.
 */
export interface TurnResult {
  readonly state: GameState;
  readonly fromDay: number;
  readonly toDay: number;
  readonly rejections: readonly Rejection[];
  readonly botDecisions: Readonly<Record<FactionId, readonly Decision[]>>;
  readonly stoppedBecause: string;
}

export function playerFactionId(state: GameState): FactionId {
  const id = sortedKeys(state.factions).find((f) => state.factions[f]!.isPlayer);
  if (!id) throw new Error('no player faction');
  return id;
}

export function advance(previous: GameState, decisions: readonly Decision[], rules: KernelRules = DEFAULT_KERNEL_RULES): TurnResult {
  if (previous.verdict) throw new Error('the game is over');
  const state = structuredClone(previous);
  state.turn += 1;
  for (const id of sortedKeys(state.factions)) state.factions[id]!.attentionLeft = state.factions[id]!.attentionPerTurn;

  const player = playerFactionId(state);
  const rejections = applyDecisions(state, player, decisions, rules);

  const bots: Record<FactionId, Decision[]> = {};
  for (const id of sortedKeys(state.factions)) {
    if (id === player) continue;
    const chosen = botDecisions(viewFor(state, id, rules), rules);
    bots[id] = chosen;
    for (const r of applyDecisions(state, id, chosen, rules)) {
      log(state, { kind: 'bot_decision_rejected', factionId: id, actors: [r.decision.verb], causes: [r.reason] });
    }
  }

  const fromDay = state.day;
  const claimsAtStart = state.claims.length;
  let stoppedBecause = '';
  for (;;) {
    tickDay(state, rules);
    const elapsed = state.day - fromDay;
    if (state.verdict) {
      stoppedBecause = `verdict: ${state.verdict.kind}`;
      break;
    }
    if (elapsed >= state.maxTurnDays) {
      stoppedBecause = 'maximum turn length';
      break;
    }
    if (elapsed >= state.minTurnDays) {
      const point = decisionPoint(state, player, claimsAtStart);
      if (point) {
        stoppedBecause = point;
        break;
      }
    }
  }
  return { state, fromDay, toDay: state.day, rejections, botDecisions: bots, stoppedBecause };
}

/** One day. Named steps in a fixed order; each step owns its writes. */
export function tickDay(state: GameState, rules: KernelRules): void {
  state.day += 1;
  deliverMessages(state, rules);
  settleStaleObjections(state, rules);
  resolveDueOperations(state, rules);
  deliverMessages(state, rules);
  if (state.day % 7 === 0) {
    recruit(state);
    blocDrift(state, rules);
    weeklyPeople(state, rules);
  }
  duePromises(state, rules);
  checkpoints(state);
  termination(state);
}

function deliverMessages(state: GameState, rules: KernelRules): void {
  for (;;) {
    const due = state.messages
      .filter((m) => m.deliverDay <= state.day)
      .sort((a, b) => a.deliverDay - b.deliverDay || a.sentDay - b.sentDay || idOrder(a.id, b.id));
    if (due.length === 0) return;
    const dueIds = new Set(due.map((m) => m.id));
    state.messages = state.messages.filter((m) => !dueIds.has(m.id));
    for (const message of due) {
      const p = message.payload;
      if (p.kind === 'directive') {
        receiveDirective(state, state.directives[p.directiveId]!, rules);
      } else if (p.kind === 'claim') {
        state.claims.push({ ...p.claim, id: newId(state, 'clm'), knownDay: state.day });
      } else {
        const to = state.posts[p.toPostId]!;
        to.force += p.amount;
        log(state, { kind: 'transfer_arrived', factionId: to.factionId, actors: [p.fromPostId, p.toPostId], detail: { amount: p.amount } });
      }
    }
  }
}

/** Held posts raise their weekly levy into their own force (P1: the principal must still order it moved). */
function recruit(state: GameState): void {
  for (const id of sortedKeys(state.posts)) {
    const post = state.posts[id]!;
    if (post.recruitPerWeek > 0 && post.holderId !== null) post.force += post.recruitPerWeek;
  }
}

/** Public mood fades back toward each bloc's settled disposition. */
function blocDrift(state: GameState, rules: KernelRules): void {
  for (const id of sortedKeys(state.blocs)) {
    const bloc = state.blocs[id]!;
    bloc.support += Math.trunc((bloc.baseline - bloc.support) / rules.blocReversionDivisor);
  }
}

/** Ids are `<prefix>-<n>`; order by the numeric counter so creation order is preserved. */
function idOrder(a: string, b: string): number {
  return Number(a.slice(a.lastIndexOf('-') + 1)) - Number(b.slice(b.lastIndexOf('-') + 1));
}

function checkpoints(state: GameState): void {
  for (const c of state.checkpoints) {
    if (c.day !== state.day || state.verdict) continue;
    const value = mandate(state, c.factionId);
    const passed = value >= c.threshold;
    log(state, {
      kind: 'checkpoint',
      factionId: c.factionId,
      actors: [c.label],
      causes: [`mandate ${value} vs threshold ${c.threshold}`],
      detail: { passed, mandate: value, threshold: c.threshold },
    });
    if (!passed) {
      state.verdict = { day: state.day, kind: 'mandate_lost', factionId: c.factionId, causes: [`${c.label}: mandate ${value} below ${c.threshold}`] };
    }
  }
}

function termination(state: GameState): void {
  if (state.verdict) return;
  for (const id of sortedKeys(state.factions)) {
    const f = state.factions[id]!;
    const holder = state.regions[f.capitalRegionId]!.controllerId;
    if (holder !== id) {
      state.verdict = { day: state.day, kind: 'capital_fallen', factionId: id, causes: [`capital ${f.capitalRegionId} taken by ${holder}`] };
      return;
    }
  }
  if (state.day >= state.endDay) {
    state.verdict = { day: state.day, kind: 'time', factionId: null, causes: [`day ${state.endDay} reached`] };
  }
}

/** Something new the player must look at: an objection, a refusal, a battle, a signal about one of their people. */
function decisionPoint(state: GameState, player: FactionId, claimsAtStart: number): string | null {
  for (const c of state.claims.slice(claimsAtStart)) {
    if (c.factionId !== player) continue;
    if (c.body.kind === 'response' && (c.body.declared === 'object' || c.body.declared === 'refuse')) return `${c.body.declared} from ${c.body.personId}`;
    if (c.body.kind === 'op_result') return `battle report on ${c.body.regionId}`;
    if (c.body.kind === 'signal') return `word about ${c.body.personId}`;
  }
  return null;
}
