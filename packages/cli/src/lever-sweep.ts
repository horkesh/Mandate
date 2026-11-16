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
 *   sweep in which no call is ever made has not weighed it, and says so.
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
import { victoryOf } from './victory.ts';

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
        const scored = moves.map((m) => {
          let last: phase0.TickResult | null = null;
          phase0.playDays(world, state, tableWith(new Map([[def.id as string, m.move]])), options.horizonDays, {
            onDay: (r) => {
              last = r;
              for (const rule of unpaidIn(r)) unpaid.push({ seed, day: r.day, rule, where: `weighing ${def.id}` });
            },
          });
          const end = last as phase0.TickResult | null;
          return { m, value: end === null ? 0 : score(world, end, def.faction) };
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
  return { seeds: options.seeds.length, findings, flagged, unpaid, recruitmentCalls, decisionsWeighed };
}

/** The sweep as a done-check criterion: problems and evidence. */
export function sweepScore(result: SweepResult): { readonly problems: readonly string[]; readonly evidence: readonly string[] } {
  const problems: string[] = [];
  const evidence: string[] = [`${result.seeds} seeds, ${result.decisionsWeighed} gated decisions weighed, ${result.recruitmentCalls} calls for regiments in the base runs`];
  if (result.decisionsWeighed === 0) problems.push('no gated decision opened in any seed, so the sweep weighed nothing (a decision with a watched option, or one about atrocity-class conduct)');
  if (result.recruitmentCalls === 0) problems.push('no call for regiments was made in any seed: the sweep must run with recruitment active (0046’s border-loyalty gain from return feeds regiments)');
  for (const f of result.flagged) problems.push(`${f.situation}: ${f.choice === 'inaction' ? 'inaction (an atrocity-class decision’s, read as watched, 0074)' : `watched option ${f.choice}`} is the ${f.faction} bot’s best choice in ${f.best} of ${result.seeds} seeds, more than a quarter`);
  for (const u of result.unpaid) problems.push(`seed ${u.seed}, day ${u.day}: ${u.rule} in ${u.where}, a breach of the watched option’s floor (0082)`);
  for (const f of result.findings) if (!result.flagged.includes(f)) evidence.push(`${f.situation}: ${f.choice} best in ${f.best} of ${f.weighed} seeds weighed`);
  return { problems, evidence };
}
