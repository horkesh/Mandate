import {
  advance,
  applyDecisions,
  createGame,
  DEFAULT_KERNEL_RULES,
  holdAudience,
  playerFactionId,
  viewFor,
  type AudienceDraft,
  type Counter,
  type Decision,
  type FactionView,
  type GameState,
  type KernelRules,
  type Objective,
  type ScenarioData,
} from '@mandate/kernel';
import * as fmt from './format.ts';

/** Display names from the pack. The kernel never sees them (decision 0003). */
interface Labels {
  readonly [id: string]: string;
}

function labelsOf(data: ScenarioData): Labels {
  const out: Record<string, string> = {};
  const add = (items: readonly { readonly id: string; readonly name?: string }[]) => {
    for (const i of items) if (i.name) out[i.id] = i.name;
  };
  add(data.persons);
  add(data.posts);
  add(data.regions);
  add(data.blocs);
  add(data.factions);
  return out;
}

/**
 * A text console for playing a pack (M2). `handle` takes one command line and
 * returns the lines to print, so it can be driven by a terminal or by tests.
 * It reads only the player's view; ground truth appears only after the game.
 */
export class GameConsole {
  state: GameState;
  readonly player: string;
  private queue: Decision[] = [];
  private audience: AudienceDraft | null = null;
  private claimsSeen = 0;
  private readonly labels: Labels;

  constructor(data: ScenarioData, private readonly rules: KernelRules = DEFAULT_KERNEL_RULES) {
    this.state = createGame(data);
    this.player = playerFactionId(this.state);
    this.labels = labelsOf(data);
  }

  private name(id: string): string {
    const label = this.labels[id];
    return label ? `${label} (${id})` : id;
  }

  private view(): FactionView {
    return viewFor(this.state, this.player, this.rules);
  }

  get over(): boolean {
    return this.state.verdict !== null;
  }

  intro(): string[] {
    return [
      'You lead your faction. You cannot move a single regiment yourself.',
      'Every order goes to a person, who will read it his own way, and tell you what he chooses to.',
      'Type "help" for commands, "desk" to look at your desk.',
      '',
      ...this.desk(),
    ];
  }

  handle(line: string): string[] {
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const [cmd, ...args] = words as [string, ...string[]];
    try {
      if (this.audience && AUDIENCE_COMMANDS.has(cmd)) return this.audienceCommand(cmd, args);
      switch (cmd) {
        case 'help':
          return HELP;
        case 'desk':
          return this.desk();
        case 'people':
          return this.people();
        case 'map':
          return this.map();
        case 'news':
          return this.news(true);
        case 'queue':
          return this.showQueue();
        case 'undo':
          return this.queue.pop() ? ['Removed the last decision.', ...this.showQueue()] : ['Nothing to undo.'];
        case 'order':
          return this.enqueue({ verb: 'direct', postId: need(args[0], 'post'), ...this.objective(args.slice(1)) });
        case 'audience':
          return this.openAudience(args);
        case 'allocate':
          return this.enqueue({ verb: 'allocate', fromPostId: need(args[0], 'from post'), toPostId: need(args[1], 'to post'), amount: int(args[2], 'amount') });
        case 'appoint':
          return this.enqueue({ verb: 'appoint', postId: need(args[0], 'post'), personId: need(args[1], 'person') });
        case 'dismiss':
        case 'honour':
        case 'promise':
        case 'pressure':
        case 'oversee':
          return this.enqueue({ verb: cmd, personId: need(args[0], 'person') });
        case 'address':
          return this.enqueue({ verb: 'address', blocId: need(args[0], 'bloc') });
        case 'insist':
          return this.enqueue({ verb: 'insist', directiveId: need(args[0], 'directive') });
        case 'accept':
          return this.enqueue({ verb: 'accept_counter', directiveId: need(args[0], 'directive') });
        case 'end':
          return this.endTurn();
        default:
          return [`Unknown command "${cmd}". Type "help".`];
      }
    } catch (e) {
      return [(e as Error).message];
    }
  }

  // -------------------------------------------------------------------------

  private objective(args: string[]): { objective: Objective; boldness: number } {
    const kind = need(args[0], 'objective (attack or hold)');
    if (kind === 'attack') return { objective: { kind: 'attack', targetRegionId: need(args[1], 'region') }, boldness: int(args[2], 'boldness') };
    if (kind === 'hold') return { objective: { kind: 'hold' }, boldness: args[1] ? int(args[1], 'boldness') : 200 };
    throw new Error('Objective must be "attack <region> <boldness>" or "hold [boldness]".');
  }

  /** Check a decision against a copy of the state before queueing it. */
  private enqueue(decision: Decision): string[] {
    const probe = structuredClone(this.state);
    probe.factions[this.player]!.attentionLeft = probe.factions[this.player]!.attentionPerTurn;
    const rejections = applyDecisions(probe, this.player, [...this.queue, decision], this.rules);
    const mine = rejections.find((r) => r.decision === decision);
    if (mine) return [`Not possible: ${mine.reason}.`];
    this.queue.push(decision);
    const left = this.view().attentionPerTurn - this.queue.length;
    return [`Queued: ${fmt.decision(decision)}. Attention left this turn: ${left}.`];
  }

  private showQueue(): string[] {
    if (this.queue.length === 0) return ['No decisions queued this turn.'];
    return ['Queued this turn:', ...this.queue.map((d, i) => `  ${i + 1}. ${fmt.decision(d)}`)];
  }

  private desk(): string[] {
    const v = this.view();
    const out = [
      `Day ${v.day}, turn ${v.turn + 1}. Mandate ${v.mandate}. Attention ${v.attentionPerTurn - this.queue.length}/${v.attentionPerTurn}.`,
      `Your record: sanctions credible ${v.sanctionCredibility}/1000, promises believed ${v.promiseCredibility}/1000.`,
      '',
      'Posts:',
    ];
    for (const p of v.posts) {
      out.push(`  ${this.name(p.id)} at ${this.name(p.regionId)}: ${p.holderId ? this.name(p.holderId) : 'VACANT'}, force ${p.force}, ${p.linkDays} day(s) away`);
    }
    out.push('', 'Blocs:');
    for (const b of v.blocs) out.push(`  ${this.name(b.id)} (${b.values.join(', ')}): weight ${b.weight}, support ${b.support}`);
    const pending = v.directives.filter((d) => d.objectionPending);
    if (pending.length) {
      out.push('', 'Objections waiting for your answer (insist <id> / accept <id>):');
      for (const d of pending) out.push(`  ${d.id}: ${this.name(d.told!.personId)} proposes boldness ${d.told!.counterBoldness} instead of ${d.boldness}`);
    }
    if (v.pendingPromises.length) {
      out.push('', 'Promises you owe:');
      for (const p of v.pendingPromises) out.push(`  ${this.name(p.personId)}, by day ${p.dueDay}`);
    }
    out.push('', ...this.news(false));
    return out;
  }

  private news(all: boolean): string[] {
    const claims = this.view().claims;
    const fresh = all ? claims : claims.slice(this.claimsSeen);
    if (!all) this.claimsSeen = claims.length;
    if (fresh.length === 0) return [all ? 'Nothing has reached you yet.' : 'No new reports.'];
    return [all ? 'Everything you have been told:' : 'New reports:', ...fresh.map((c) => `  ${this.named(fmt.claim(c))}`)];
  }

  private named(text: string): string {
    return text.replace(/\b[a-z][a-z0-9_]*_[a-z0-9_]+\b/g, (id) => this.labels[id] ?? id);
  }

  private people(): string[] {
    const v = this.view();
    return ['Your people (public reputation only):', ...v.people.map((p) =>
      `  ${this.name(p.id)}: values ${p.values.join(', ')}; competence ${p.competence}, boldness ${p.boldness}, standing ${p.standing}; ${p.status === 'active' ? (p.postId ? `holds ${p.postId}` : 'available') : p.status}${p.overseen ? '; overseen' : ''}${p.lastSignal ? `; last word: ${p.lastSignal}` : ''}`)];
  }

  private map(): string[] {
    const v = this.view();
    return ['Regions as your staff understands them:', ...v.regions.map((r) =>
      `  ${this.name(r.id)}: held by ${this.name(r.controllerId)}; borders ${r.neighbours.map((n) => this.labels[n] ?? n).join(', ')}${r.lastEstimate ? `; enemy reported ${r.lastEstimate.force} on day ${r.lastEstimate.day}` : ''}`)];
  }

  // -------------------------------------------------------------------------
  // The audience

  private openAudience(args: string[]): string[] {
    const postId = need(args[0], 'post');
    this.audience = { postId, ...this.objective(args.slice(1)), counters: [] };
    return this.previewAudience();
  }

  private previewAudience(): string[] {
    const draft = this.audience!;
    const o = holdAudience(this.state, this.player, draft, this.rules);
    const order = draft.objective.kind === 'attack' ? `attack ${this.name(draft.objective.targetRegionId)}` : draft.objective.kind;
    const adjusted = draft.counters.find((c) => c.kind === 'adjust');
    const boldness = adjusted?.kind === 'adjust' ? `${adjusted.boldness} (softened from ${draft.boldness})` : String(draft.boldness);
    const out = [
      `Audience with ${this.name(o.personId)} about the order: ${order}, at boldness ${boldness}.`,
      `He says: "${o.declared}"${o.counterBoldness !== null ? `, and proposes boldness ${o.counterBoldness} instead` : ''}.`,
      o.statedReasons.length ? `He gives as reasons: ${o.statedReasons.map(fmt.reason).join(', ')}.` : 'He gives no reasons.',
    ];
    if (o.problems.length) out.push(`Problems: ${o.problems.join('; ')}.`);
    if (o.unanswerable.length) out.push(`Nothing you can say today answers: ${o.unanswerable.map(fmt.reason).join(', ')}.`);
    out.push('What you could offer:');
    for (const opt of o.options) {
      const how = COUNTER_SYNTAX[opt.counter];
      const effect = opt.answers.length
        ? `answers ${opt.answers.map(fmt.reason).join(', ')}`
        : opt.counter === 'threaten' ? 'answers nothing; leaves a grievance' : 'answers nothing he said; may still appeal to him';
      out.push(`  ${how}  ${effect}`);
    }
    if (o.options.some((x) => x.counter === 'frame') && o.frames.length) out.push(`  (frames available: ${o.frames.join(', ')})`);
    out.push(`Offered so far: ${draft.counters.length ? draft.counters.map(fmt.counter).join(', ') : 'nothing'} (at most ${this.rules.audienceMaxCounters}).`);
    out.push('Commands: frame <value> | adjust <boldness> | reinforce <post> <amount> | promise | withdraw | ease | vindicate | threaten | clear | commit | leave');
    return out;
  }

  private audienceCommand(cmd: string, args: string[]): string[] {
    const draft = this.audience!;
    const add = (c: Counter) => {
      this.audience = { ...draft, counters: [...draft.counters.filter((x) => x.kind !== c.kind), c] };
      return this.previewAudience();
    };
    switch (cmd) {
      case 'frame':
        return add({ kind: 'frame', value: need(args[0], 'value') });
      case 'adjust':
        return add({ kind: 'adjust', boldness: int(args[0], 'boldness') });
      case 'reinforce':
        return add({ kind: 'reinforce', fromPostId: need(args[0], 'post'), amount: int(args[1], 'amount') });
      case 'promise':
        return add({ kind: 'promise_advancement' });
      case 'withdraw':
        return add({ kind: 'withdraw_overseer' });
      case 'ease':
        return add({ kind: 'ease_pressure' });
      case 'vindicate':
        return add({ kind: 'vindicate' });
      case 'threaten':
        return add({ kind: 'threaten' });
      case 'clear':
        this.audience = { ...draft, counters: [] };
        return this.previewAudience();
      case 'leave':
        this.audience = null;
        return ['You end the audience without giving the order.'];
      case 'commit': {
        this.audience = null;
        return this.enqueue({ verb: 'audience', ...draft });
      }
      default:
        return [];
    }
  }

  // -------------------------------------------------------------------------

  private endTurn(): string[] {
    if (this.over) return ['The game is over.'];
    const decisions = this.queue;
    this.queue = [];
    const result = advance(this.state, decisions, this.rules);
    this.state = result.state;
    const out = [`Days ${result.fromDay} to ${result.toDay} pass. (${result.stoppedBecause})`];
    for (const r of result.rejections) out.push(`  Not carried out: ${fmt.decision(r.decision)} (${r.reason})`);
    out.push('', ...this.desk());
    if (this.state.verdict) out.push('', ...this.verdict());
    return out;
  }

  verdict(): string[] {
    const v = this.state.verdict!;
    const out = [`THE END: ${v.kind}${v.factionId ? ` (${this.name(v.factionId)})` : ''} on day ${v.day}. ${v.causes.join('; ')}`, '', 'What you were never told:'];
    for (const d of Object.values(this.state.directives)) {
      if (d.factionId !== this.player || !d.response || d.response.declared === d.response.actual) continue;
      out.push(`  ${this.name(d.response.holderId)} said "${d.response.declared}" and did "${d.response.actual}".`);
    }
    for (const p of Object.values(this.state.persons)) {
      if (p.factionId !== this.player || p.id === this.state.factions[this.player]!.principalId) continue;
      out.push(`  ${this.name(p.id)} was truly ${p.ladder}, regard ${p.regard}${p.rival ? ', and had become your rival' : ''}.`);
    }
    return out;
  }
}

const AUDIENCE_COMMANDS = new Set(['frame', 'adjust', 'reinforce', 'promise', 'withdraw', 'ease', 'vindicate', 'threaten', 'clear', 'commit', 'leave']);

const COUNTER_SYNTAX: Record<string, string> = {
  frame: 'frame <value>         put the order in terms of something he believes in',
  adjust: 'adjust <boldness>     change how hard you ask him to push',
  reinforce: 'reinforce <post> <n>  promise him troops from another post (that holder gets an order too)',
  promise_advancement: 'promise               promise him advancement (you must keep it within 60 days)',
  withdraw_overseer: 'withdraw              recall the overseer you attached to him',
  ease_pressure: 'ease                  lift the pressure you put on him',
  vindicate: 'vindicate             honour him publicly (he grows more independent)',
  threaten: 'threaten              make clear what failure will cost him',
};

const HELP = [
  'Looking: desk | people | map | news | queue',
  'Orders (each costs one attention):',
  '  order <post> attack <region> <boldness 0-1000>   or   order <post> hold',
  '  audience <post> attack <region> <boldness>        hear him out first, then offer counters and commit',
  '  allocate <from-post> <to-post> <amount>',
  '  appoint <post> <person> | dismiss <person> | honour <person> | promise <person>',
  '  pressure <person> | oversee <person> | address <bloc>',
  '  insist <directive> | accept <directive>            answer an objection',
  'Turn: end (let the days run until something needs you) | undo (drop the last queued decision) | quit',
];

function need(value: string | undefined, what: string): string {
  if (!value) throw new Error(`Missing ${what}.`);
  return value;
}

function int(value: string | undefined, what: string): number {
  const n = Number(need(value, what));
  if (!Number.isSafeInteger(n)) throw new Error(`${what} must be a whole number.`);
  return n;
}
