/**
 * The desk's command grammar: one console word per kernel verb (the verb list is the interface, FOUNDATION section
 * 11.10), and the words that only look or move the clock. Player-facing: it imports the kernel only as
 * `@mandate/kernel/seat-api` and reads only the morning's request (the view and the menu), never State.
 *
 * Every verb is an order to a person (hard rule 1, 0016). A place appears only inside one: an order's objective, an
 * arrow edit's region or waypoints, or an inquiry's subject (0040). There is no word that moves a force.
 */
import { COUNTER_KINDS, DISCRETION_CONDITIONS, EDIT_KINDS, MAX_FALLBACKS, POSTURES, RELIEF_MODES, NOTE_KINDS } from '@mandate/kernel/seat-api';
import type { DeskStrings } from './strings.ts';
import type { PlanNote } from '@mandate/kernel/seat-api';
import type { CounterKind, CounterTerms, Discretion, EditKind, EditTerms, GoalTerms, PersonId, PostId, Posture, PrincipalMenu, RegionId, ReliefMode, RouteKind, SeatCommand, SeatRequest, SituationId } from '@mandate/kernel/seat-api';

/** Each console word that changes the game, and the kernel command it sends: `review` splits by its action. */
export const VERB_COMMANDS = {
  order: 'order',
  proposal: 'answer_proposal',
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
const HELP_KEYS = [
  'console.help.look',
  'console.help.inbox',
  'console.help.situations',
  'console.help.plans',
  'console.help.posts',
  'console.help.enemy',
  'console.help.preview',
  'console.help.queue',
  'console.help.end',
  'console.help.quit',
  'console.help.orders',
  'console.help.order',
  'console.help.proposal',
  'console.help.review',
  'console.help.edit',
  'console.help.go',
  'console.help.call',
  'console.help.call-scheduled',
  'console.help.decide',
  'console.help.delegate',
  'console.help.people',
  'console.help.transfer',
  'console.help.correspondence',
  'console.help.audience',
  'console.help.influence',
];

export function helpLines(t: DeskStrings): string[] {
  return HELP_KEYS.map(key => t(key));
}

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

function withFallback(goal: GoalTerms, raw: string, t: DeskStrings): (GoalTerms & { readonly discretion: Discretion<GoalTerms> }) | string {
  const entries = raw.split('/');
  const error = t('console.error.fallback', { max: String(MAX_FALLBACKS) });
  if (entries.length > MAX_FALLBACKS) return error;
  const { discretion: _old, ...terms } = goal;
  const goals: { condition: Discretion<GoalTerms>['condition']; goal: GoalTerms }[] = [];
  for (const entry of entries) {
    const [condition, posture, encoded, ...extra] = entry.split(',');
    if (extra.length || encoded === undefined || encoded.length === 0 ||
      !DISCRETION_CONDITIONS.some(c => c === condition) || !POSTURES.some(p => p === posture) ||
      (encoded === '-' && posture !== 'hold')) return error;
    let region: string;
    try { region = decodeURIComponent(encoded); } catch { return error; }
    goals.push({ condition: condition as Discretion<GoalTerms>['condition'],
      goal: { ...terms, objective: encoded === '-' ? null : region as RegionId, posture: posture as Posture } });
  }
  let fallback = goals.at(-1)!.goal;
  for (let i = goals.length - 2; i >= 0; i--) fallback = { ...goals[i]!.goal, discretion: { condition: goals[i + 1]!.condition, fallback } };
  return { ...terms, discretion: { condition: goals[0]!.condition, fallback } };
}

function noteFrom(token: string, t: DeskStrings): PlanNote | string {
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
  const routes = menu.commandable.find((c) => c.post === post)?.routes ?? menu.raising.find(c=>c.post===post)?.routes ?? [];
  return routes.some((r) => r.route === 'wire') ? 'wire' : 'courier';
}

function knownRoute(menu: PrincipalMenu, post: string, route: string, t: DeskStrings): string | null {
  const routes = menu.commandable.find((c) => c.post === post)?.routes ?? menu.raising.find(c=>c.post===post)?.routes;
  if (routes === undefined) return null;
  return routes.some((r) => r.route === route) ? null : t('console.error.route', { route: route, post: post, routes: routes.map((r) => r.route).join(', ') });
}

/** An arrow edit from its words: `<kind> [axis=..] [region=..] [via=a,b] [days=N]`, its axis by default the plan's first. */
function editFrom(words: readonly string[], opts: ReadonlyMap<string, string>, firstAxis: string | null, t: DeskStrings): EditTerms | string {
  const kind = words[0];
  if (kind === undefined || !(EDIT_KINDS as readonly string[]).includes(kind)) return t('console.error.edit', { edits: EDIT_KINDS.join(', ') });
  const days = opts.get('days');
  const concentration = days === undefined ? null : whole(days);
  if (days !== undefined && concentration === null) return t('console.error.edit-days', { days: days });
  const axis = kind === 'add_axis' ? null : (opts.get('axis') ?? firstAxis);
  const via = (opts.get('via') ?? '').split(',').filter((r) => r.length > 0) as RegionId[];
  return { kind: kind as EditKind, axis, region: (opts.get('region') ?? null) as RegionId | null, via, concentration };
}

/** An audience counter from `kind[:arg[:arg]]`. */
function counterFrom(token: string, t: DeskStrings): CounterTerms | string {
  const [kind, a, b] = token.split(':');
  if (kind === undefined || !(COUNTER_KINDS as readonly string[]).includes(kind)) return t('console.error.counter', { counters: COUNTER_KINDS.join(', ') });
  const k = kind as CounterKind;
  if (k === 'frame') return a === undefined ? t('console.error.frame') : { kind: k, value: a, boldness: null, from: null, men: null };
  if (k === 'adjust') return whole(a) === null ? t('console.error.adjust') : { kind: k, value: null, boldness: whole(a), from: null, men: null };
  if (k === 'reinforce') return a === undefined || whole(b) === null ? t('console.error.reinforce') : { kind: k, value: null, boldness: null, from: a, men: whole(b) };
  return { kind: k, value: null, boldness: null, from: null, men: null };
}

/**
 * Read one line against the morning's request. A verb becomes the command the kernel will validate when it is sent
 * (an unknown person or region is the kernel's to refuse, and the refusal is shown); what the menu itself can tell (a
 * post he may not order, a situation not before him, a plan not under review) is refused here, before it costs anything.
 */
export function parseLine(line: string, request: SeatRequest, t: DeskStrings): DeskInput {
  const tokens = line.trim().split(/\s+/).filter((t) => t.length > 0);
  const word = tokens[0]?.toLowerCase();
  if (word === undefined) return { kind: 'look', what: 'help', all: false };
  const menu = request.menu;
  if (menu.menuKind !== 'principal') return fail(t('console.error.principal'));
  const { words, opts, flags } = split(tokens.slice(1));
  const post = words[0] as PostId | undefined;
  const commandable = (p: string | undefined): string | null => (p === undefined ? t('console.error.post') : menu.commandable.some((c) => c.post === p) ? null : t('console.error.no-post', { post: p }));
  const situation = (s: string | undefined): string | null => (s === undefined ? t('console.error.situation') : menu.situations.some((c) => c.situation === s) ? null : t('console.error.no-situation', { situation: s }));
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
      return tokens.length===2&&days!==null&&days>=1&&days<=max?{kind:'end',days}:fail(t('console.error.turn-days', { max: String(max) }));
    }
    case 'quit':
      return { kind: 'quit' };
    case 'cancel': {
      const n = whole(words[0]);
      return n === null ? fail(t('console.error.cancel')) : { kind: 'cancel', index: n };
    }
    case 'preview': {
      const problem = reviewProblem(menu, post, t);
      if (problem !== null) return fail(problem);
      const edit = editFrom(words.slice(1), opts, firstAxis(menu, post!), t);
      return typeof edit === 'string' ? fail(edit) : { kind: 'preview', post: post!, edit };
    }
    case 'order': {
      const problem = commandable(post);
      if (problem !== null) return fail(problem);
      const posture = words[1];
      if (posture === undefined || !(POSTURES as readonly string[]).includes(posture)) return fail(t('console.error.order', { post: '<post>', postures: POSTURES.join('|') }));
      const goalFlags = new Set(['rail', 'norail', 'river', 'sea', 'neutral', 'await', 'review', 'bypass']);
      const objective = (words.slice(2).find(w => !goalFlags.has(w)) ?? null) as RegionId | null;
      if (posture !== 'hold' && objective === null) return fail(t('console.error.objective', { posture: posture }));
      const d = menu.goalDefaults;
      const risk = opts.has('risk') ? whole(opts.get('risk')) : d.risk;
      const deadline = opts.has('deadline') ? whole(opts.get('deadline')) : d.deadlineDays;
      if (risk === null || deadline === null) return fail(t('console.error.risk-deadline'));
      const route = routeTo(menu, post!, opts.get('by'));
      const bad = knownRoute(menu, post!, route, t);
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
      const fallback = opts.get('fallback');
      const drafted = fallback === undefined ? goal : withFallback(goal, fallback, t);
      return typeof drafted === 'string' ? fail(drafted) : { kind: 'command', word: 'order', command: { cmd: 'order', to: post!, goal: drafted, route: route as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'proposal': {
      const problem = commandable(post);
      if (problem !== null) return fail(problem);
      const [, paper, action] = words;
      const proposal = menu.proposals?.find(p => p.post === post && p.paper === paper);
      if (proposal === undefined) return fail(t('console.error.proposal'));
      const route = routeTo(menu, post!, opts.get('by'));
      const bad = knownRoute(menu, post!, route, t);
      if (bad !== null) return fail(bad);
      if (words.slice(3).some(w => w !== 'bypass')) return fail(t('console.error.proposal-action'));
      const routing = { cmd: 'answer_proposal' as const, to: post!, proposal: proposal.paper, route: route as RouteKind, bypass: flags.has('bypass') };
      if ((action === 'accept' || action === 'decline') && [...opts.keys()].every(k => k === 'by')) {
        return { kind: 'command', word, command: { ...routing, action } };
      }
      const fallback = opts.get('fallback');
      if (action !== 'discretion' || fallback === undefined || [...opts.keys()].some(k => k !== 'by' && k !== 'fallback')) return fail(t('console.error.proposal-action'));
      const goal = withFallback(proposal.ordered, fallback, t);
      return typeof goal === 'string' ? fail(goal) : { kind: 'command', word, command: { ...routing, action, goal } };
    }
    case 'approve':
    case 'sendback':
    case 'edit': {
      const problem = reviewProblem(menu, post, t);
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
        const bad = knownRoute(menu, post!, route, t);
        if (bad) return fail(bad);
        return { kind: 'command', word, command: { cmd: 'review', to: post!, action: word === 'approve' ? 'approve' : 'send_back', edit: null, ...(notes.length ? { notes } : {}), route, bypass: flags.has('bypass') } };
      }
      const edit = editFrom(words.slice(1), opts, firstAxis(menu, post!), t);
      if (typeof edit === 'string') return fail(edit);
      return { kind: 'command', word: 'edit', command: { cmd: 'review', to: post!, action: 'edit', edit, route, bypass: flags.has('bypass') } };
    }
    case 'go': {
      if (post === undefined || !menu.awaiting.includes(post)) return fail(t('console.error.no-operation', { post: post ?? t('console.error.that-post') }));
      return { kind: 'command', word: 'go', command: { cmd: 'go', to: post, route: routeTo(menu, post, opts.get('by')) as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'call': {
      if(post===undefined)return fail(t('console.error.call-governor'));
      if(!menu.raising.some(r=>r.post===post))return fail(t('console.error.call-not-offered', { post }));
      if(opts.has('scheduled')){
        if(words.length!==1||[...opts.keys()].some(k=>k!=='scheduled'&&k!=='by'))return fail(t('console.error.call-overrides'));
        const call=menu.doctrine.calls.find(c=>c.id===opts.get('scheduled')&&c.post===post);
        if(!call||call.issued===true||call.day>request.requestDay||(menu.atWarSince===null&&call.atPeace!==true))return fail(t('console.error.call-unavailable'));
        const route=routeTo(menu,post!,opts.get('by')),bad=knownRoute(menu,post!,route,t);
        if(bad)return fail(bad);
        return {kind:'command',word:'call',command:{cmd:'call',to:post!,callId:call.id!,regiments:call.regiments,termDays:call.termDays,
          ...(call.men===undefined?{}:{men:call.men}),...(call.arm===undefined?{}:{arm:call.arm}),...(call.readiness===undefined?{}:{readiness:call.readiness}),route:route as RouteKind,bypass:false}};
      }
      const regiments = whole(words[1]);
      const termDays = whole(words[2]);
      if (regiments === null || termDays === null) return fail(t('console.error.call'));
      return { kind: 'command', word: 'call', command: { cmd: 'call', to: post!, regiments, termDays, route: routeTo(menu, post!, opts.get('by')) as RouteKind, bypass: flags.has('bypass') } };
    }
    case 'decide': {
      const s = words[0];
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const choice = menu.situations.find((c) => c.situation === s)!;
      const options = words.slice(1);
      const unknown = options.filter((o) => !choice.options.some((x) => x.optionId === o));
      if (unknown.length > 0) return fail(t('console.error.option', { situation: choice.situation, unknown: unknown.join(', '), options: choice.options.map((o) => o.optionId).join(', ') }));
      return { kind: 'command', word: 'decide', command: { cmd: 'decide', situation: s as SituationId, options } };
    }
    case 'delegate': {
      const s = words[0];
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const to = words[1] as PostId | undefined;
      const choice = menu.situations.find((c) => c.situation === s)!;
      if (to === undefined || !choice.delegableTo.includes(to)) return fail(t('console.error.delegate', { situation: choice.situation, posts: choice.delegableTo.join(', ') || t('console.error.no-delegate') }));
      return { kind: 'command', word: 'delegate', command: { cmd: 'delegate', situation: s as SituationId, to } };
    }
    case 'appoint': {
      const person = words[1] as PersonId | undefined;
      if (post === undefined || person === undefined) return fail(t('console.error.appoint'));
      return { kind: 'command', word: 'appoint', command: { cmd: 'appoint', post, person, rank: words[2] ?? null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'relieve': {
      const mode = words[1];
      if (post === undefined || mode === undefined || !(RELIEF_MODES as readonly string[]).includes(mode)) return fail(t('console.error.relieve', { post: '<post>', modes: RELIEF_MODES.join('|') }));
      if (mode === 'quiet_department' && words[2] === undefined) return fail(t('console.error.quiet-department'));
      return { kind: 'command', word: 'relieve', command: { cmd: 'relieve', post, mode: mode as ReliefMode, to: (words[2] ?? null) as PostId | null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'transfer': {
      const to = words[1] as PostId | undefined;
      const force = words[2];
      const amount = whole(words[3]);
      if (post === undefined || to === undefined || (force !== 'blocks' && force !== 'men') || amount === null) return fail(t('console.error.transfer'));
      return { kind: 'command', word: 'transfer', command: { cmd: 'transfer', from: post, to, force, amount, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'inquire': {
      if (post === undefined) return fail(t('console.error.inquire'));
      return { kind: 'command', word: 'inquire', command: { cmd: 'inquire', to: post, subject: (words[1] ?? null) as RegionId | null, route: routeTo(menu, post, opts.get('by')) as RouteKind } };
    }
    case 'consult': {
      const s = words[0];
      const roundKey = opts.get('round');
      if (roundKey !== undefined) {
        const q = menu.consultations?.find(q => `${q.letter.namespace}.${q.letter.key}.${q.letter.revision}` === roundKey && q.subject === s);
        const targets = words.slice(1) as PostId[];
        if (q === undefined || targets.length === 0 || !targets.every(p => q.posts.includes(p))) return fail(t('console.error.consult'));
        return { kind: 'command', word: 'consult', command: { cmd: 'consult', situation: q.subject, posts: targets, round: q.letter } };
      }
      const problem = situation(s);
      if (problem !== null) return fail(problem);
      const posts = words.slice(1) as PostId[];
      if (posts.length === 0) return fail(t('console.error.consult'));
      return { kind: 'command', word: 'consult', command: { cmd: 'consult', situation: s as SituationId, posts } };
    }
    case 'audience': {
      if (post === undefined) return fail(t('console.error.audience'));
      const counters: CounterTerms[] = [];
      for (const token of words.slice(1)) {
        const c = counterFrom(token, t);
        if (typeof c === 'string') return fail(c);
        counters.push(c);
      }
      return { kind: 'command', word: 'audience', command: { cmd: 'audience', to: post, counters } };
    }
    case 'observer': {
      const person = words[0] as PersonId | undefined;
      const to = words[1] as PostId | undefined;
      if (person === undefined || to === undefined) return fail(t('console.error.observer'));
      return { kind: 'command', word: 'observer', command: { cmd: 'observer', person, to, route: routeTo(menu, to, opts.get('by')) as RouteKind } };
    }
    case 'promise':
    case 'pressure': {
      const person = words[0] as PersonId | undefined;
      if (person === undefined) return fail(t(word === 'promise' ? 'console.error.promise' : 'console.error.pressure'));
      return { kind: 'command', word, command: { cmd: word, person } };
    }
    case 'address': {
      const bloc = words[0];
      if (bloc === undefined) return fail(t('console.error.address'));
      return { kind: 'command', word: 'address', command: { cmd: 'address', bloc } };
    }
    default:
      return fail(t('console.error.unknown', { word: word }));
  }
}

function reviewProblem(menu: PrincipalMenu, post: string | undefined, t: DeskStrings): string | null {
  if (post === undefined) return t('console.error.review-post');
  return menu.reviews.some((r) => r.post === post) ? null : t('console.error.no-plan', { post: post });
}

function firstAxis(menu: PrincipalMenu, post: string): string | null {
  return menu.reviews.find((r) => r.post === post)?.plan.axes[0]?.name ?? null;
}
