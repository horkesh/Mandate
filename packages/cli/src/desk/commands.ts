/**
 * The desk's command grammar: one console word per kernel verb (the verb list is the interface, FOUNDATION section
 * 11.10), and the words that only look or move the clock. Player-facing: it imports the kernel only as
 * `@mandate/kernel/seat-api` and reads only the morning's request (the view and the menu), never State.
 *
 * Every verb is an order to a person (hard rule 1, 0016). A place appears only inside one: an order's objective, an
 * arrow edit's region or waypoints, or an inquiry's subject (0040). There is no word that moves a force.
 */
import { COUNTER_KINDS, EDIT_KINDS, POSTURES, RELIEF_MODES, NOTE_KINDS } from '@mandate/kernel/seat-api';
import type { PlanNote } from '@mandate/kernel/seat-api';
import type { CounterKind, CounterTerms, EditKind, EditTerms, PersonId, PostId, Posture, PrincipalMenu, RegionId, ReliefMode, RouteKind, SeatCommand, SeatRequest, SituationId } from '@mandate/kernel/seat-api';

/** Each console word that changes the game, and the kernel command it sends: `review` splits by its action. */
export const VERB_COMMANDS = {
  order: 'order',
  approve: 'review:approve',
  sendback: 'review:send_back',
  edit: 'review:edit',
  go: 'go',
  call: 'call',
  decide: 'decide',
  delegate: 'delegate',
  appoint: 'appoint',
  relieve: 'relieve',
  transfer: 'transfer',
  inquire: 'inquire',
  consult: 'consult',
  audience: 'audience',
  observer: 'observer',
  promise: 'promise',
  pressure: 'pressure',
  address: 'address',
} as const;
export type VerbWord = keyof typeof VERB_COMMANDS;

/** The words that look or move the clock: none sends a command. */
export const DESK_COMMANDS = ['help', 'inbox', 'situations', 'plans', 'posts', 'enemy', 'preview', 'queue', 'cancel', 'end', 'quit'] as const;
export type DeskWord = (typeof DESK_COMMANDS)[number];

export type DeskInput =
  | { readonly kind: 'command'; readonly word: VerbWord; readonly command: SeatCommand }
  | { readonly kind: 'look'; readonly what: 'help' | 'inbox' | 'situations' | 'plans' | 'posts' | 'enemy' | 'queue'; readonly all: boolean }
  | { readonly kind: 'preview'; readonly post: PostId; readonly edit: EditTerms }
  | { readonly kind: 'cancel'; readonly index: number }
  | { readonly kind: 'end'; readonly days?: number }
  | { readonly kind: 'quit' }
  | { readonly kind: 'error'; readonly message: string };

/** One line of help per word, in the order shown. */
export const HELP: readonly string[] = [
  'Look (free):',
  '  inbox [all]            reports received since the last turn (all: every report you hold)',
  '  situations             situations before you, with their options',
  '  plans                  plans submitted for your review, and operations waiting for your word',
  '  posts                  the posts you may order, their holders and routes',
  '  enemy                  what you believe of the enemy, region by region',
  '  preview <post> <edit>  the route an arrow edit would make, before you send it',
  '  queue | cancel <n>     the orders you will send when the turn ends, or take one back',
  '  end [days]             send your orders and run up to this many days, within the pack maximum',
  '  quit',
  'Orders to people (each answered by the man, through his own judgement):',
  '  order <post> <hold|take|relieve> [objective] [risk=N] [deadline=N] [rail|norail] [river] [sea] [neutral] [await] [review] [by=<route>] [bypass]',
  '  approve <post> | sendback <post> [focus:<axis>:<region> | via:<axis>:<region>,<region> | wait:<axis>:<days> | avoid:<axis>:<region>] ... [by=<route>] [bypass]',
  '  edit <post> <objective|waypoints|timing|add_axis|remove_axis> [axis=<name>] [region=<r>] [via=<r>,<r>] [days=N]',
  '  go <post>                             the word an operation prepared under "await my word" waits for',
  '  call <post> <regiments> <termDays>    a call for regiments to a governor',
  '  decide <situation> [option ...]       no options: let it take its course',
  '  delegate <situation> <post>',
  '  appoint <post> <person> [rank] | relieve <post> <own_request|outright|quiet_department> [to-post]',
  '  transfer <from-post> <to-post> <blocks|men> <n>   the sending commander picks what goes',
  '  inquire <post> [region] | consult <situation> <post> ... | observer <person> <post>',
  '  audience <post> [counter ...]   counters: frame:<value> adjust:<boldness> reinforce:<from-post>:<men> promise_advancement withdraw_overseer ease_pressure vindicate threaten',
  '  promise <person> | pressure <person> | address <bloc>',
];

const fail = (message: string): DeskInput => ({ kind: 'error', message });

/** `key=value` options and bare flags after the positional words. */
function split(tokens: readonly string[]): { readonly words: string[]; readonly opts: Map<string, string>; readonly flags: Set<string> } {
  const words: string[] = [];
  const opts = new Map<string, string>();
  const flags = new Set<string>();
  for (const t of tokens) {
    const eq = t.indexOf('=');
    if (eq > 0) opts.set(t.slice(0, eq), t.slice(eq + 1));
    else words.push(t);
  }
  return { words, opts, flags: new Set(words) };
}

const whole = (s: string | undefined): number | null => (s !== undefined && /^-?\d+$/.test(s) ? Number(s) : null);

function noteFrom(token: string, t: (key: string) => string): PlanNote | string {
  // Axes and regions can contain colons (notably added:<region>). Encode those as %3A in a note token.
  const parts = token.split(':');
  if (parts.length !== 3) return t('plan.note.error.shape');
  let kind: string, axis: string, value: string;
  try { [kind, axis, value] = parts.map(decodeURIComponent) as [string,string,string]; }
  catch { return t('plan.note.error.escape'); }
  if (!(NOTE_KINDS as readonly string[]).includes(kind) || !axis || !value) return t('plan.note.error.kind');
  const days = kind === 'wait' ? whole(value) : null;
  if (kind === 'wait' && (days === null || !Number.isSafeInteger(days) || days < 0)) return t('plan.note.error.days');
  const via = kind === 'via' ? value.split(',') : [];
  if (via.some(r => !r)) return t('plan.note.error.waypoint');
  return { markKind: kind as PlanNote['markKind'], markAxis: axis, markRegion: (kind === 'focus' || kind === 'avoid' ? value : null) as RegionId | null, markVia: via as RegionId[], markDays: days };
}

/** The route an order to `post` goes by: the one named, else the wire where it reaches him, else the courier. */
function routeTo(menu: PrincipalMenu, post: string, named: string | undefined): RouteKind | string {
  if (named !== undefined) return named;
  const routes = menu.commandable.find((c) => c.post === post)?.routes ?? [];
  return routes.some((r) => r.route === 'wire') ? 'wire' : 'courier';
}

function knownRoute(menu: PrincipalMenu, post: string, route: string): string | null {
  const routes = menu.commandable.find((c) => c.post === post)?.routes;
  if (routes === undefined) return null;
  return routes.some((r) => r.route === route) ? null : `${route} is not a route to ${post} (${routes.map((r) => r.route).join(', ')})`;
}

/** An arrow edit from its words: `<kind> [axis=..] [region=..] [via=a,b] [days=N]`, its axis by default the plan's first. */
export function editFrom(words: readonly string[], opts: ReadonlyMap<string, string>, firstAxis: string | null): EditTerms | string {
  const kind = words[0];
  if (kind === undefined || !(EDIT_KINDS as readonly string[]).includes(kind)) return `an edit is one of ${EDIT_KINDS.join(', ')}`;
  const days = opts.get('days');
  const concentration = days === undefined ? null : whole(days);
  if (days !== undefined && concentration === null) return `days must be a whole number, not ${days}`;
  const axis = kind === 'add_axis' ? null : (opts.get('axis') ?? firstAxis);
  const via = (opts.get('via') ?? '').split(',').filter((r) => r.length > 0) as RegionId[];
  return { kind: kind as EditKind, axis, region: (opts.get('region') ?? null) as RegionId | null, via, concentration };
}

/** An audience counter from `kind[:arg[:arg]]`. */
function counterFrom(token: string): CounterTerms | string {
  const [kind, a, b] = token.split(':');
  if (kind === undefined || !(COUNTER_KINDS as readonly string[]).includes(kind)) return `a counter is one of ${COUNTER_KINDS.join(', ')}`;
  const k = kind as CounterKind;
  if (k === 'frame') return a === undefined ? 'frame needs a value: frame:<value>' : { kind: k, value: a, boldness: null, from: null, men: null };
  if (k === 'adjust') return whole(a) === null ? 'adjust needs a boldness: adjust:<0-1000>' : { kind: k, value: null, boldness: whole(a), from: null, men: null };
  if (k === 'reinforce') return a === undefined || whole(b) === null ? 'reinforce needs a post and men: reinforce:<post>:<men>' : { kind: k, value: null, boldness: null, from: a, men: whole(b) };
  return { kind: k, value: null, boldness: null, from: null, men: null };
}

/**
 * Read one line against the morning's request. A verb becomes the command the kernel will validate when it is sent
 * (an unknown person or region is the kernel's to refuse, and the refusal is shown); what the menu itself can tell (a
 * post he may not order, a situation not before him, a plan not under review) is refused here, before it costs anything.
 */
export function parseLine(line: string, request: SeatRequest, t: (key: string) => string = key => key): DeskInput {
  const tokens = line.trim().split(/\s+/).filter((t) => t.length > 0);
  const word = tokens[0]?.toLowerCase();
  if (word === undefined) return { kind: 'look', what: 'help', all: false };
  const menu = request.menu;
  if (menu.menuKind !== 'principal') return fail('this desk is the principal’s');
  const { words, opts, flags } = split(tokens.slice(1));
  const post = words[0] as PostId | undefined;
  const commandable = (p: string | undefined): string | null => (p === undefined ? 'name a post' : menu.commandable.some((c) => c.post === p) ? null : `${p} is not a post you may order (try "posts")`);
  const situation = (s: string | undefined): string | null => (s === undefined ? 'name a situation' : menu.situations.some((c) => c.situation === s) ? null : `${s} is not a situation before you (try "situations")`);
  switch (word) {
    case 'help':
    case 'inbox':
    case 'situations':
    case 'plans':
    case 'posts':
    case 'enemy':
    case 'queue':
      return { kind: 'look', what: word, all: flags.has('all') };
    case 'end': {
      if(tokens.length===1)return {kind:'end'};
      const days=whole(tokens[1]),max=request.turnStops?.maxDays??0;
      return tokens.length===2&&days!==null&&days>=1&&days<=max?{kind:'end',days}:fail(`Choose between 1 and ${max} whole days`);
    }
    case 'quit':
      return { kind: 'quit' };
    case 'cancel': {
      const n = whole(words[0]);
      return n === null ? fail('cancel <n>: the number shown by "queue"') : { kind: 'cancel', index: n };
    }
    case 'preview': {
      const problem = reviewProblem(menu, post);
      if (problem !== null) return fail(problem);
      const edit = editFrom(words.slice(1), opts, firstAxis(menu, post!));
      return typeof edit === 'string' ? fail(edit) : { kind: 'preview', post: post!, edit };
    }
    case 'order': {
      const problem = commandable(post);
      if (problem !== null) return fail(problem);
      const posture = words[1];
      if (posture === undefined || !(POSTURES as readonly string[]).includes(posture)) return fail(`order <post> <${POSTURES.join('|')}> [objective] ...`);
      const objective = (words[2] ?? null) as RegionId | null;
      if (posture !== 'hold' && objective === null) return fail(`a ${posture} order names its objective`);
      const d = menu.goalDefaults;
      const risk = opts.has('risk') ? whole(opts.get('risk')) : d.risk;
      const deadline = opts.has('deadline') ? whole(opts.get('deadline')) : d.deadlineDays;
      if (risk === null || deadline === null) return fail('risk and deadline are whole numbers');
      const route = routeTo(menu, post!, opts.get('by'));
      const bad = knownRoute(menu, post!, route);
      if (bad !== null) return fail(bad);
      const goal = {
        objective,
        posture: posture as Posture,
        risk,
        deadlineDays: deadline,
        rail: flags.has('norail') ? false : flags.has('rail') || d.rail,
        river: flags.has('river') || d.river,
        sea: flags.has('sea') || d.sea,
        neutral: flags.has('neutral') || d.neutral,
        committed: [],
        awaitWord: flags.has('await') || d.awaitWord,
        approveAsDrafted: flags.has('review') ? false : d.approveAsDrafted,
      };
      return { kind: 'command', word: 'order', command: { cmd: 'order', to: post!, goal, route: route as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'approve':
    case 'sendback':
    case 'edit': {
      const problem = reviewProblem(menu, post);
      if (problem !== null) return fail(problem);
      const route = routeTo(menu, post!, opts.get('by')) as RouteKind;
      if (word !== 'edit') {
        if ([...opts.keys()].some(k => k !== 'by')) return fail(t('plan.note.error.shape'));
        const tokens = words.slice(1).filter(w => w !== 'bypass');
        if (word === 'approve' && tokens.length) return fail(t('plan.note.error.sendback'));
        const notes: PlanNote[] = [];
        for (const token of tokens) {
          const note = noteFrom(token,t);
          if (typeof note === 'string') return fail(note);
          notes.push(note);
        }
        const bad = knownRoute(menu, post!, route);
        if (bad) return fail(bad);
        return { kind: 'command', word, command: { cmd: 'review', to: post!, action: word === 'approve' ? 'approve' : 'send_back', edit: null, ...(notes.length ? { notes } : {}), route, bypass: flags.has('bypass') } };
      }
      const edit = editFrom(words.slice(1), opts, firstAxis(menu, post!));
      if (typeof edit === 'string') return fail(edit);
      return { kind: 'command', word: 'edit', command: { cmd: 'review', to: post!, action: 'edit', edit, route, bypass: flags.has('bypass') } };
    }
    case 'go': {
      if (post === undefined || !menu.awaiting.includes(post)) return fail(`${post ?? 'that post'} has no operation waiting for your word (try "plans")`);
      return { kind: 'command', word: 'go', command: { cmd: 'go', to: post, route: routeTo(menu, post, opts.get('by')) as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'call': {
      const problem = commandable(post);
      if (problem !== null) return fail(problem);
      const regiments = whole(words[1]);
      const termDays = whole(words[2]);
      if (regiments === null || termDays === null) return fail('call <post> <regiments> <termDays>');
      return { kind: 'command', word: 'call', command: { cmd: 'call', to: post!, regiments, termDays, route: routeTo(menu, post!, opts.get('by')) as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'decide': {
      const s = words[0];
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const choice = menu.situations.find((c) => c.situation === s)!;
      const options = words.slice(1);
      const unknown = options.filter((o) => !choice.options.some((x) => x.optionId === o));
      if (unknown.length > 0) return fail(`not an option of ${s}: ${unknown.join(', ')} (it has ${choice.options.map((o) => o.optionId).join(', ')})`);
      return { kind: 'command', word: 'decide', command: { cmd: 'decide', situation: s as SituationId, options } };
    }
    case 'delegate': {
      const s = words[0];
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const to = words[1] as PostId | undefined;
      const choice = menu.situations.find((c) => c.situation === s)!;
      if (to === undefined || !choice.delegableTo.includes(to)) return fail(`${s} may be handed to ${choice.delegableTo.join(', ') || 'no one'}`);
      return { kind: 'command', word: 'delegate', command: { cmd: 'delegate', situation: s as SituationId, to } };
    }
    case 'appoint': {
      const person = words[1] as PersonId | undefined;
      if (post === undefined || person === undefined) return fail('appoint <post> <person> [rank]');
      return { kind: 'command', word: 'appoint', command: { cmd: 'appoint', post, person, rank: words[2] ?? null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'relieve': {
      const mode = words[1];
      if (post === undefined || mode === undefined || !(RELIEF_MODES as readonly string[]).includes(mode)) return fail(`relieve <post> <${RELIEF_MODES.join('|')}> [to-post]`);
      if (mode === 'quiet_department' && words[2] === undefined) return fail('a relief to a quiet department names the post he goes to');
      return { kind: 'command', word: 'relieve', command: { cmd: 'relieve', post, mode: mode as ReliefMode, to: (words[2] ?? null) as PostId | null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'transfer': {
      const to = words[1] as PostId | undefined;
      const force = words[2];
      const amount = whole(words[3]);
      if (post === undefined || to === undefined || (force !== 'blocks' && force !== 'men') || amount === null) return fail('transfer <from-post> <to-post> <blocks|men> <n>');
      return { kind: 'command', word: 'transfer', command: { cmd: 'transfer', from: post, to, force, amount, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'inquire': {
      if (post === undefined) return fail('inquire <post> [region]');
      return { kind: 'command', word: 'inquire', command: { cmd: 'inquire', to: post, subject: (words[1] ?? null) as RegionId | null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'consult': {
      const s = words[0];
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const posts = words.slice(1) as PostId[];
      if (posts.length === 0) return fail('consult <situation> <post> ...');
      return { kind: 'command', word: 'consult', command: { cmd: 'consult', situation: s as SituationId, posts } };
    }
    case 'audience': {
      if (post === undefined) return fail('audience <post> [counter ...]');
      const counters: CounterTerms[] = [];
      for (const t of words.slice(1)) {
        const c = counterFrom(t);
        if (typeof c === 'string') return fail(c);
        counters.push(c);
      }
      return { kind: 'command', word: 'audience', command: { cmd: 'audience', to: post, counters } };
    }
    case 'observer': {
      const person = words[0] as PersonId | undefined;
      const to = words[1] as PostId | undefined;
      if (person === undefined || to === undefined) return fail('observer <person> <post>');
      return { kind: 'command', word: 'observer', command: { cmd: 'observer', person, to, route: routeTo(menu, to, opts.get('by')) as RouteKind } };
    }
    case 'promise':
    case 'pressure': {
      const person = words[0] as PersonId | undefined;
      if (person === undefined) return fail(`${word} <person>`);
      return { kind: 'command', word, command: { cmd: word, person } };
    }
    case 'address': {
      const bloc = words[0];
      if (bloc === undefined) return fail('address <bloc>');
      return { kind: 'command', word: 'address', command: { cmd: 'address', bloc } };
    }
    default:
      return fail(`Unknown command "${word}". Every order goes to a person: type "help" for the list.`);
  }
}

function reviewProblem(menu: PrincipalMenu, post: string | undefined): string | null {
  if (post === undefined) return 'name the post whose plan you review';
  return menu.reviews.some((r) => r.post === post) ? null : `${post} has no plan before you for review (try "plans")`;
}

function firstAxis(menu: PrincipalMenu, post: string): string | null {
  return menu.reviews.find((r) => r.post === post)?.plan.axes[0]?.name ?? null;
}
