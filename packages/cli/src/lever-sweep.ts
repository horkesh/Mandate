/**
 * The lever sweep (SENSITIVE-HISTORY D6; lane 1.14): a victory-only bot plays the history run over seeds, and at every
 * gated decision weighs each move it has (`lever-moves.ts`: an option alone, a delegation read as the delegate's own
 * pick, or inaction) by playing on from that morning and scoring the victory measure (`victory.ts`). The sweep reports
 * any watched option that is the bot's best choice in more than a quarter of the seeds.
 *
 * - **Gated decisions** are the decisions with a watched option, and the decisions about atrocity-class conduct (0074),
 *   whose inaction the sweep reads as if it were a watched option: letting the order or sentence stand is only inaction.
 * - **Best** includes a tie: a move that scores as well as the best is one the bot may take.
 * - **A breach of a floor:** any `floor_unpaid:<row>` record in a seed, in the base run or in any move weighed (0082).
 *   The gate accepts the unpaid record on that condition, so the sweep reports every one.
 * - **Recruitment must be active** (lane 1.7's verdict): 0046's border-loyalty gain from `return` feeds regiments, so a
 *   sweep in which no call is ever made has not weighed it, and says so. For a fugitive-policy decision (G-1.14b) each
 *   move is played on until a border governor answers a call (to the horizon's cap), or the sweep reports the chain
 *   unexercised for it.
 * - **Every channel measured** (G-1.14c, rule 7): a gated decision whose options propose to a channel the victory measure
 *   does not read (`VICTORY_READS`) is reported unmeasured. A decision that enters a ledger act is played on until
 *   Congress meets the act.
 *
 * The bot sits in each principal's seat (driven as a human, so his situations wait for him); every other seat is the
 * rules model. On a decision it is not weighing, the bot takes the historical default, so the base run is the history
 * run with the principals' own decisions made by command.
 */
import { createTelemetry, phase0, type ids } from '@mandate/kernel';
import type { VictoryWeights } from '@mandate/pack-format';
import { createRuleSeat } from '@mandate/rule-seats';
import { sweepMoves, type SweepMove } from './lever-moves.ts';
import { seatsMechanics } from './seats-world.ts';
import { victoryOf, victoryReads } from './victory.ts';

type SituationId = ids.SituationId;
type Seat = ReturnType<phase0.SeatTable>;

export interface SweepOptions {
  readonly seeds: readonly number[];
  /** How many days the base run plays. */
  readonly days: number;
  /** How far each move is played on before it is scored. */
  readonly horizonDays: number;
  readonly weights: Omit<VictoryWeights, 'cite'>;
  /** Decisions about atrocity-class conduct (`atrocityDecisions`): their inaction is read as watched. */
  readonly atrocity: ReadonlySet<string>;
  /** How a move's end is scored: the victory measure by default (a test passes its own). */
  readonly scoreOf?: (world: phase0.SeatsWorld, end: phase0.TickResult, faction: string) => number;
  /** The governments whose side could change (the pack's `government-side` checkpoints): their governors close the recruitment chain (G-1.14b). */
  readonly borderDepartments?: readonly string[];
  /** The order-to-value map's tag for fugitive policy; `fugitive-policy` by default. */
  readonly chainTopic?: string;
  /** The decisions whose recruitment chain must be closed, in place of those the tag finds (a test passes its own). */
  readonly chainDecisions?: ReadonlySet<string>;
  /** How far a move is played on, at most, waiting for a ledger act to be met or a border governor to answer. */
  readonly horizonCapDays?: number;
}

/** One watched choice (an option, or an atrocity decision's inaction) and how often the bot found it best. */
export interface SweepFinding {
  readonly situation: string;
  /** The option's id, or `inaction`. */
  readonly choice: string;
  readonly faction: string;
  /** Seeds in which the decision was weighed. */
  readonly weighed: number;
  /** Seeds in which this choice was a best move. */
  readonly best: number;
}

export interface SweepResult {
  readonly seeds: number;
  readonly findings: readonly SweepFinding[];
  /** Findings best in more than a quarter of the seeds. */
  readonly flagged: readonly SweepFinding[];
  readonly unpaid: readonly { readonly seed: number; readonly day: number; readonly rule: string; readonly where: string }[];
  /** Calls for regiments made in the base runs, all seeds together. */
  readonly recruitmentCalls: number;
  /** Gated decisions weighed, all seeds together. */
  readonly decisionsWeighed: number;
  /** G-1.14c: a gated decision's channels the victory measure does not read. */
  readonly unmeasured: readonly { readonly situation: string; readonly channel: string }[];
  /** G-1.14c: a move whose ledger act Congress had not met by the horizon's cap. */
  readonly ledgerUnmet: readonly { readonly situation: string; readonly seed: number; readonly move: string }[];
  /** G-1.14b: a fugitive-policy move in whose horizon no border governor answered a call. */
  readonly chainUnexercised: readonly { readonly situation: string; readonly seed: number; readonly move: string }[];
}

/** The decisions the sweep weighs: any with a watched option, and the atrocity-class ones. */
export function gatedDecisions(world: phase0.SeatsWorld, atrocity: ReadonlySet<string>): phase0.SituationDef[] {
  return world.situations.filter((s) => s.kind === 'decision' && (s.options.some((o) => o.watched) || atrocity.has(s.id)));
}

/** The command a move is, for the principal's answer. */
function commandOf(situation: SituationId, move: SweepMove): phase0.SeatCommand {
  if (move.move === 'delegate') return { cmd: 'delegate', situation, to: move.post };
  return { cmd: 'decide', situation, options: move.move === 'decide' ? move.options : [] };
}

/** The historical default as a command, or null while one of its options is not open yet (the kernel's own rule). */
function defaultCommand(def: phase0.SituationDef, open: readonly string[]): phase0.SeatCommand | null {
  const hd = def.historicalDefault;
  if (hd === null || 'unsourced' in hd) return { cmd: 'decide', situation: def.id, options: [] };
  if ('delegate' in hd) return { cmd: 'delegate', situation: def.id, to: hd.delegate };
  return hd.options.every((o) => open.includes(o)) ? { cmd: 'decide', situation: def.id, options: hd.options } : null;
}

/** The bot's seat: the rules model, and every open situation decided, by `chosen` where it names one, else by default. */
export function sweepSeat(world: phase0.SeatsWorld, chosen: ReadonlyMap<string, SweepMove>): Seat {
  const rules = createRuleSeat();
  return Object.freeze({
    driver: 'rules' as const,
    respond: (request: Parameters<Seat['respond']>[0]) => {
      const answer = rules.respond(request);
      const menu = request.menu;
      if (menu.menuKind !== 'principal' || answer.answerKind !== 'commands') return answer;
      const extra: phase0.SeatCommand[] = [];
      for (const s of menu.situations) {
        const move = chosen.get(s.situation);
        const def = world.situations.find((d) => d.id === s.situation);
        if (def === undefined) continue;
        const cmd = move !== undefined ? commandOf(s.situation, move) : defaultCommand(def, s.options.map((o) => o.optionId));
        if (cmd !== null) extra.push(cmd);
      }
      return { answerKind: 'commands' as const, commands: [...answer.commands, ...extra] };
    },
  }) as Seat;
}

function unpaidIn(r: phase0.TickResult): string[] {
  return r.events.filter((e) => e.event === 'policy_unpaid').flatMap((e) => e.terms.map((t) => t.termRule).filter((x): x is string => x !== null && x.startsWith('floor_unpaid:')));
}

/** Run the sweep over the seeds. */
export function runSweep(world: phase0.SeatsWorld, options: SweepOptions): SweepResult {
  const gated = gatedDecisions(world, options.atrocity);
  const score = options.scoreOf ?? ((w, end, faction) => victoryOf(w, end.state, end.map, faction, options.weights).value);
  const people = world.factionIds.map((f) => world.faction(f).principal);
  const principals = new Set<string>(people.map((p) => phase0.seatIdFor(p)));
  const drivers = Object.fromEntries(people.map((p) => [p, 'human' as const]));
  const rules = createRuleSeat();
  const tally = new Map<string, { situation: string; choice: string; faction: string; weighed: number; best: number }>();
  const unpaid: { seed: number; day: number; rule: string; where: string }[] = [];
  const ledgerUnmet: { situation: string; seed: number; move: string }[] = [];
  const chainUnexercised: { situation: string; seed: number; move: string }[] = [];
  const fugitive = options.chainDecisions ?? fugitivePolicyDecisions(world, options.chainTopic ?? FUGITIVE_POLICY_TOPIC);
  const border = new Set(options.borderDepartments ?? []);
  const horizonCap = Math.max(options.horizonDays, options.horizonCapDays ?? SWEEP_HORIZON_CAP_DAYS);
  let recruitmentCalls = 0;
  let decisionsWeighed = 0;

  for (const seed of options.seeds) {
    const telemetry = createTelemetry(seatsMechanics());
    const swept = new Set<string>();
    const tableWith = (moves: ReadonlyMap<string, SweepMove>): phase0.SeatTable => {
      const bot = sweepSeat(world, moves);
      return (seat) => (principals.has(seat as string) ? bot : rules);
    };
    // The base run takes the historical default on every decision, the gated ones included, once each is weighed.
    const base = tableWith(new Map());
    let state = phase0.createState(world, { seed, drivers });
    for (let day = 1; day <= options.days; day++) {
      for (const def of gated) {
        const record = state.situationStates[def.id];
        if (swept.has(def.id) || record === undefined || record.sitStatus !== 'open' || record.sitSurfacedDay === null || record.sitDelegate !== null) continue;
        const moves = sweepMoves(world, state, def.id);
        if (moves.length === 0) continue;
        swept.add(def.id);
        decisionsWeighed += 1;
        const needsLedger = ledgerActs(def);
        const needsChain = fugitive.has(def.id);
        const scored = moves.map((m) => {
          const from = state.stateDay;
          let answered = false;
          const fork = playOn(world, state, tableWith(new Map([[def.id as string, m.move]])), options.horizonDays, horizonCap, (r) => {
            for (const rule of unpaidIn(r)) unpaid.push({ seed, day: r.day, rule, where: `weighing ${def.id}` });
            if (needsChain && borderAnswered(world, r, from, border)) answered = true;
          }, (s) => (!needsLedger || ledgerMet(s, def.id)) && (!needsChain || answered));
          if (needsLedger && !ledgerMet(fork.end?.state ?? state, def.id)) ledgerUnmet.push({ situation: def.id, seed, move: describe(m.move) });
          if (needsChain && !answered) chainUnexercised.push({ situation: def.id, seed, move: describe(m.move) });
          return { m, value: fork.end === null ? 0 : score(world, fork.end, def.faction) };
        });
        const top = Math.max(...scored.map((s) => s.value));
        const watched = new Set(def.options.filter((o) => o.watched).map((o) => o.id));
        const choices = new Map<string, boolean>();
        for (const s of scored) {
          const isBest = s.value === top;
          const keys = s.m.move.move === 'inaction' ? (options.atrocity.has(def.id) ? ['inaction'] : []) : s.m.takes.filter((o) => watched.has(o));
          for (const k of keys) choices.set(k, (choices.get(k) ?? false) || isBest);
        }
        for (const k of [...watched, ...(options.atrocity.has(def.id) ? ['inaction'] : [])]) {
          const id = `${def.id}|${k}`;
          const row = tally.get(id) ?? { situation: def.id, choice: k, faction: def.faction, weighed: 0, best: 0 };
          row.weighed += 1;
          if (choices.get(k) === true) row.best += 1;
          tally.set(id, row);
        }
      }
      state = phase0.playDays(world, state, base, 1, {
        telemetry,
        onDay: (r) => {
          for (const rule of unpaidIn(r)) unpaid.push({ seed, day: r.day, rule, where: 'the base run' });
        },
      }).state;
    }
    recruitmentCalls += telemetry.mechanics['recruitment.called']?.fires ?? 0;
  }
  const findings = [...tally.values()].sort((a, b) => (a.situation < b.situation ? -1 : a.situation > b.situation ? 1 : a.choice < b.choice ? -1 : a.choice > b.choice ? 1 : 0));
  // More than a quarter: best * 4 > seeds, in whole numbers.
  const flagged = findings.filter((f) => f.best * 4 > options.seeds.length);
  return { seeds: options.seeds.length, findings, flagged, unpaid, recruitmentCalls, decisionsWeighed, unmeasured: unmeasuredChannels(gated), ledgerUnmet, chainUnexercised };
}

/** The tag a fugitive-policy row of the order-to-value map carries (0074; the gate's `fugitive-policy` rows). */
export const FUGITIVE_POLICY_TOPIC = 'fugitive-policy';
/** How far a move may be played on, at most, to reach Congress meeting its act or a border governor answering a call. */
export const SWEEP_HORIZON_CAP_DAYS = 400;

/** Every proposal a decision's options, locked costs and inaction can make: owner and field. */
function channelsOf(def: phase0.SituationDef): { owner: string; field: string }[] {
  const effects = [...def.options.flatMap((o) => [...o.effects, ...o.lockedCosts]), ...(def.inaction?.effects ?? [])];
  const seen = new Map<string, { owner: string; field: string }>();
  for (const e of effects) if ('propose' in e) seen.set(`${e.propose.owner}/${e.propose.field}`, { owner: e.propose.owner, field: e.propose.field });
  return [...seen.values()].sort((a, b) => (`${a.owner}/${a.field}` < `${b.owner}/${b.field}` ? -1 : 1));
}

/** G-1.14c (rule 7): each gated decision's channels the victory measure does not read. */
export function unmeasuredChannels(gated: readonly phase0.SituationDef[]): { readonly situation: string; readonly channel: string }[] {
  return gated.flatMap((def) => channelsOf(def).filter((c) => !victoryReads(c.owner, c.field)).map((c) => ({ situation: def.id as string, channel: `${c.owner}/${c.field}` })));
}

/** Whether a decision enters an act on the ledger (lane 1.6): its horizon runs until Congress meets it. */
function ledgerActs(def: phase0.SituationDef): boolean {
  return channelsOf(def).some((c) => c.owner === 'politics' && c.field === 'ledger-act');
}

/** Every act this situation entered on the ledger has been met by a chamber (vacuously true when none was entered). */
function ledgerMet(state: phase0.State, situation: string): boolean {
  return state.congressLedger.filter((a) => a.ledgerSituation === situation).every((a) => a.ledgerMetDay !== null);
}

/**
 * The fugitive-policy decisions (G-1.14b): an option, or the inaction, names a policy row of the order-to-value map
 * tagged with the fugitive-policy topic. Their effect on regiments runs from the policy through border loyalty to a
 * levy, so the sweep plays each move on until a border governor answers a call.
 */
export function fugitivePolicyDecisions(world: phase0.SeatsWorld, topic: string): Set<string> {
  const rows = world.map.world.rules.people.verbs.orderValues.filter((r) => r.gateTopics.includes(topic)).map((r) => r.order);
  const tagged = (row: string | null | undefined) => row !== null && row !== undefined && (rows.includes(row) || rows.includes(`policy:${row}`));
  return new Set(world.situations.filter((s) => s.kind === 'decision' && (s.options.some((o) => tagged(o.policy?.row)) || tagged(s.inaction?.policy?.row))).map((s) => s.id as string));
}

/**
 * A governor of a border government (one whose side could change) answered a call since `from`: an addressee's answer
 * recorded at a post of a raising kind (the pack's recruitment rules) in a border department. A refusal is an answer too.
 */
function borderAnswered(world: phase0.SeatsWorld, r: phase0.TickResult, from: number, border: ReadonlySet<string>): boolean {
  const raising = world.map.world.rules.recruitment.raisingPostKinds;
  for (const resp of Object.values(r.state.orderResponses)) {
    if (resp.respRole !== 'addressee' || resp.respDay <= from || resp.respPost === null) continue;
    const post = r.state.postStates[resp.respPost];
    if (post !== undefined && border.has(post.postDepartment) && raising.includes(post.postKind)) return true;
  }
  return false;
}

/** Play a fork for `horizon` days, then on (a week at a time, to `cap`) until `done` holds of its State. */
function playOn(world: phase0.SeatsWorld, start: phase0.State, table: phase0.SeatTable, horizon: number, cap: number, onDay: (r: phase0.TickResult) => void, done: (s: phase0.State) => boolean): { readonly end: phase0.TickResult | null } {
  let end: phase0.TickResult | null = null;
  let state = start;
  let played = 0;
  const step = (n: number) => {
    state = phase0.playDays(world, state, table, n, { onDay: (r) => { end = r; onDay(r); } }).state;
    played += n;
  };
  step(horizon);
  while (!done(state) && played < cap) step(Math.min(7, cap - played));
  return { end };
}

const describe = (m: SweepMove): string => (m.move === 'decide' ? m.options.join('+') : m.move === 'delegate' ? `delegate to ${m.post}` : 'inaction');

/** The sweep as a done-check criterion: problems and evidence. */
export function sweepScore(result: SweepResult): { readonly problems: readonly string[]; readonly evidence: readonly string[] } {
  const problems: string[] = [];
  const evidence: string[] = [`${result.seeds} seeds, ${result.decisionsWeighed} gated decisions weighed, ${result.recruitmentCalls} calls for regiments in the base runs`];
  if (result.decisionsWeighed === 0) problems.push('no gated decision opened in any seed, so the sweep weighed nothing (a decision with a watched option, or one about atrocity-class conduct)');
  if (result.recruitmentCalls === 0) problems.push('no call for regiments was made in any seed: the sweep must run with recruitment active (0046’s border-loyalty gain from return feeds regiments)');
  for (const f of result.flagged) problems.push(`${f.situation}: ${f.choice === 'inaction' ? 'inaction (an atrocity-class decision’s, read as watched, 0074)' : `watched option ${f.choice}`} is the ${f.faction} bot’s best choice in ${f.best} of ${result.seeds} seeds, more than a quarter`);
  for (const u of result.unpaid) problems.push(`seed ${u.seed}, day ${u.day}: ${u.rule} in ${u.where}, a breach of the watched option’s floor (0082)`);
  for (const u of result.unmeasured) problems.push(`${u.situation}: unmeasured channel ${u.channel}: the victory measure does not read what this choice proposes, so no D6 result for it counts (G-1.14c)`);
  const grouped = (rows: readonly { situation: string; seed: number; move: string }[]) => [...new Set(rows.map((r) => r.situation))].map((s) => ({ s, rows: rows.filter((r) => r.situation === s) }));
  for (const { s, rows } of grouped(result.chainUnexercised)) problems.push(`${s}: chain unexercised: no border governor answered a call inside the horizon of ${rows.length} moves weighed (seeds ${[...new Set(rows.map((r) => r.seed))].join(', ')}), so the policy's effect through border loyalty on regiments was never seen (G-1.14b)`);
  for (const { s, rows } of grouped(result.ledgerUnmet)) problems.push(`${s}: Congress had not met its ledger act when ${rows.length} moves were scored (seeds ${[...new Set(rows.map((r) => r.seed))].join(', ')}), so the act's answer is unmeasured (G-1.14c)`);
  for (const f of result.findings) if (!result.flagged.includes(f)) evidence.push(`${f.situation}: ${f.choice} best in ${f.best} of ${f.weighed} seeds weighed`);
  return { problems, evidence };
}
