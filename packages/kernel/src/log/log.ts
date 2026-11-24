/**
 * The command log: the truth about what happened (decision 0015; FOUNDATION
 * section 10). It sits beside State, never in it.
 *
 * Every input the kernel did not compute itself is an entry: a principal's
 * orders and every seat's answer to a menu, rule seats included. A day's
 * entries are applied in log order. Replay runs the tick over the log from the
 * start and never asks a seat; resume continues from a saved State with the
 * log saved beside it. The save envelope carries the log and its hash.
 */
import { battleOrdersProblems } from '../combat/order-kinds.ts';
import { strictCompare } from '../compare.ts';
import { isWellFormedId, type SeatId } from '../ids.ts';
import { ROUTE_KINDS } from '../messages/latency.ts';
import { DISCRETION_CONDITIONS, EDIT_KINDS, MAX_FALLBACKS, POSTURES } from '../plans/goal.ts';
import { noteProblems } from '../plans/notes.ts';
import { COUNTER_KINDS } from '../audience/counters.ts';
import { isLetterIdentity } from '../world/letters.ts';
import { COMMAND_KINDS, PROPOSAL_ACTIONS, RELIEF_MODES, REVIEW_ACTIONS, type Command } from './commands.ts';

export interface LogEntry {
  /** The day the command applies to. */
  readonly day: number;
  readonly seat: SeatId;
  readonly command: Command;
}

export type CommandLog = readonly LogEntry[];

/** The entries for one day, in log order. */
export function entriesForDay(log: CommandLog, day: number): LogEntry[] {
  return log.filter((e) => e.day === day);
}

/** The log up to and including `day`. */
export function logThrough(log: CommandLog, day: number): LogEntry[] {
  return log.filter((e) => e.day <= day);
}

/**
 * Problems with one entry's shape and value types: a known command kind with
 * exactly its fields, each of the right type and, where the vocabulary is
 * closed (goal kinds, routes), a known word (review F5). The tick still judges
 * what a well-formed command asks for (a known post, a legal route for it).
 */
export function entryProblems(raw: unknown, i: number): string[] {
  const at = `entry ${i}`;
  const e = raw as Partial<LogEntry> | null;
  if (typeof e !== 'object' || e === null || Array.isArray(e)) return [`${at}: not an object`];
  const problems: string[] = [];
  const top = Object.keys(e).sort(strictCompare).join();
  if (top !== 'command,day,seat') problems.push(`${at}: has fields [${top}], expected [command, day, seat]`);
  if (typeof e.day !== 'number' || !Number.isSafeInteger(e.day) || e.day < 1) problems.push(`${at}: day must be a positive integer`);
  if (typeof e.seat !== 'string' || !isWellFormedId(e.seat)) problems.push(`${at}: seat must be a seat id`);
  const c = e.command as Partial<Record<string, unknown>> | undefined;
  if (typeof c !== 'object' || c === null || !(COMMAND_KINDS as readonly unknown[]).includes(c.cmd)) return [...problems, `${at}: unknown command`];
  const FIELDS: Readonly<Record<string, readonly string[]>> = {
    recall_offer: ['cmd', 'offer'],
    mandate: ['cmd', 'paper', 'route'],
    allocation: ['cmd', 'paper', 'route'],
    order: ['bypass', 'cmd', 'goal', 'route', 'to'],
    answer_proposal: ['action', 'bypass', 'cmd', 'proposal', 'route', 'to'],
    review: ['action', 'bypass', 'cmd', 'edit', 'route', 'to'],
    go: ['bypass', 'cmd', 'route', 'to'],
    call: ['bypass', 'cmd', 'regiments', 'route', 'termDays', 'to'],
    battle: ['cmd', 'commit', 'cutOff', 'night', 'post', 'pursue'],
    choose: ['cmd', 'option', 'request'],
    decide: ['cmd', 'options', 'situation'],
    delegate: ['cmd', 'situation', 'to'],
    // Lane 1.5: the people verbs.
    appoint: ['cmd', 'person', 'post', 'rank', 'route'],
    relieve: ['cmd', 'mode', 'post', 'route', 'to'],
    transfer: ['amount', 'cmd', 'force', 'from', 'route', 'to'],
    inquire: ['cmd', 'route', 'subject', 'to'],
    consult: ['cmd', 'posts', 'situation'],
    audience: ['cmd', 'counters', 'to'],
    observer: ['cmd', 'person', 'route', 'to'],
    promise: ['cmd', 'person'],
    pressure: ['cmd', 'person'],
    address: ['bloc', 'cmd'],
  };
  const fields = [...FIELDS[c.cmd as string]!,
    ...((c.cmd === 'order' || c.cmd === 'answer_proposal') && Object.hasOwn(c, 'doctrine') ? ['doctrine'] : []),
    ...(c.cmd === 'order' ? ['letter', 'retryOf'].filter(k => Object.hasOwn(c, k)) : []),
    ...(c.cmd === 'consult' ? ['round', 'retryOf'].filter(k => Object.hasOwn(c, k)) : []),
    ...(c.cmd === 'answer_proposal' && c.action === 'discretion' ? ['goal'] : []),
    ...(c.cmd === 'review' && Object.hasOwn(c, 'notes') ? ['notes'] : []),
    ...(c.cmd === 'review' && Object.hasOwn(c, 'paper') ? ['paper'] : []),
    ...(c.cmd === 'call' ? ['men', 'callId', 'arm', 'readiness', 'termsId', 'address'].filter(k => Object.hasOwn(c, k)) : []),
    ...(c.cmd === 'appoint' && Object.hasOwn(c, 'from') ? ['from'] : []),
    ...(c.cmd === 'transfer' ? ['regiments', 'concentration'].filter(k => Object.hasOwn(c, k)) : []),
  ].sort(strictCompare);
  const keys = Object.keys(c).sort(strictCompare);
  if (keys.join() !== fields.join()) return [...problems, `${at}: ${String(c.cmd)} has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const id = (v: unknown) => typeof v === 'string' && isWellFormedId(v);
  const routed = () => {
    if (!id(c.to)) problems.push(`${at}: ${String(c.cmd)}.to must be a post id`);
    if (!(ROUTE_KINDS as readonly unknown[]).includes(c.route)) problems.push(`${at}: ${String(c.cmd)}.route must be one of ${ROUTE_KINDS.join(', ')}`);
    if (typeof c.bypass !== 'boolean') problems.push(`${at}: ${String(c.cmd)}.bypass must be true or false`);
  };
  if (Object.hasOwn(c, 'doctrine') && !id(c.doctrine)) problems.push(`${at}: doctrine must name a doctrine row`);
  if (c.cmd === 'recall_offer') {
    if (!id(c.offer)) problems.push(`${at}: recall_offer.offer must be a message id`);
  } else if (c.cmd === 'mandate' || c.cmd === 'allocation') {
    if (!id(c.paper) || !(ROUTE_KINDS as readonly unknown[]).includes(c.route)) problems.push(`${at}: invalid mandate paper or route`);
  } else if (c.cmd === 'order') {
    routed();
    if (Object.hasOwn(c, 'letter') && (!isLetterIdentity(c.letter) || c.doctrine !== undefined)) problems.push(`${at}: invalid authored letter identity`);
    if (Object.hasOwn(c, 'retryOf') && (!id(c.retryOf) || !isLetterIdentity(c.letter))) problems.push(`${at}: retryOf must identify a dispatch of the authored letter`);
    problems.push(...goalTermsProblems(c.goal).map((p) => `${at}: order.goal ${p}`));
  } else if (c.cmd === 'answer_proposal') {
    routed();
    if (!id(c.proposal)) problems.push(`${at}: proposal must be a message id`);
    if (!(PROPOSAL_ACTIONS as readonly unknown[]).includes(c.action)) problems.push(`${at}: unknown proposal answer`);
    if (c.action === 'discretion') {
      if (typeof c.goal === 'object' && c.goal !== null && !Object.hasOwn(c.goal, 'discretion')) problems.push(`${at}: the answer must grant discretion`);
      problems.push(...goalTermsProblems(c.goal).map(p => `${at}: answer_proposal.goal ${p}`));
    }
  } else if (c.cmd === 'review') {
    routed();
    if (Object.hasOwn(c, 'paper') && !id(c.paper)) problems.push(`${at}: review.paper must be a message id`);
    if (Object.hasOwn(c, 'notes')) {
      if (c.action !== 'send_back' || !Array.isArray(c.notes)) problems.push(`${at}: notes belong only to a send-back`);
      else for (const n of c.notes) problems.push(...noteProblems(n).map(p => `${at}: ${p}`));
    }
    if (!(REVIEW_ACTIONS as readonly unknown[]).includes(c.action)) problems.push(`${at}: review.action must be one of ${REVIEW_ACTIONS.join(', ')}`);
    if ((c.action === 'edit') !== (c.edit !== null)) problems.push(`${at}: review.edit is given for an edit and only for an edit`);
    if (c.edit !== null) problems.push(...editTermsProblems(c.edit).map((p) => `${at}: review.edit ${p}`));
  } else if (c.cmd === 'go') {
    routed();
  } else if (c.cmd === 'call') {
    routed();
    if (c.regiments !== null && (typeof c.regiments !== 'number' || !Number.isSafeInteger(c.regiments) || c.regiments < 1)) problems.push(`${at}: call.regiments must be positive whole regiments or null for unknown`);
    if (c.termDays !== null && (typeof c.termDays !== 'number' || !Number.isSafeInteger(c.termDays) || c.termDays < 1)) problems.push(`${at}: call.termDays must be positive whole days or null for the war`);
    if (Object.hasOwn(c, 'men') && c.men !== null && (typeof c.men !== 'number' || !Number.isSafeInteger(c.men) || c.men < 1)) problems.push(`${at}: call.men must be positive whole men or null for unknown strength`);
    if (Object.hasOwn(c, 'address') && c.address !== 'office') problems.push(`${at}: invalid call address`);
    if (Object.hasOwn(c, 'callId') && (typeof c.callId !== 'string' || !/^[a-z][a-z0-9_]*$/.test(c.callId))) problems.push(`${at}: call.callId must be a pack call id`);
    if (Object.hasOwn(c, 'termsId') && (typeof c.termsId !== 'string' || !/^[a-z][a-z0-9_]*$/.test(c.termsId))) problems.push(`${at}: call.termsId must be a pack profile id`);
    if (Object.hasOwn(c,'arm') && !id(c.arm)) problems.push(`${at}: call.arm must name an arm`);
    if (Object.hasOwn(c,'readiness') && typeof c.readiness !== 'boolean') problems.push(`${at}: call.readiness must be boolean`);
  } else if (c.cmd === 'battle') {
    if (!id(c.post)) problems.push(`${at}: battle.post must be a post id`);
    problems.push(...battleOrdersProblems(c as { commit: unknown; night: unknown; cutOff: unknown; pursue: unknown }).map((p) => `${at}: ${p}`));
  } else if (c.cmd === 'decide') {
    if (!id(c.situation)) problems.push(`${at}: decide.situation must be a situation id`);
    if (!Array.isArray(c.options) || !c.options.every((o) => typeof o === 'string' && o.length > 0) || new Set(c.options).size !== c.options.length) {
      problems.push(`${at}: decide.options must be distinct option ids (none: ignore it)`);
    }
  } else if (c.cmd === 'delegate') {
    if (!id(c.situation)) problems.push(`${at}: delegate.situation must be a situation id`);
    if (!id(c.to)) problems.push(`${at}: delegate.to must be a post id`);
  } else if (c.cmd !== 'choose') {
    problems.push(...verbProblems(c).map((p) => `${at}: ${String(c.cmd)}.${p}`));
  } else {
    if (typeof c.request !== 'string' || c.request.length === 0) problems.push(`${at}: choose.request must be a request key`);
    if (typeof c.option !== 'string' || c.option.length === 0) problems.push(`${at}: choose.option must be an option id`);
  }
  return problems;
}

const ID = (v: unknown) => typeof v === 'string' && isWellFormedId(v);

/** Problems with a people verb's values (lane 1.5); its field names are already checked. */
function verbProblems(c: Partial<Record<string, unknown>>): string[] {
  const problems: string[] = [];
  const route = () => {
    if (!(ROUTE_KINDS as readonly unknown[]).includes(c.route)) problems.push(`route must be one of ${ROUTE_KINDS.join(', ')}`);
  };
  const need = (k: string, what: string) => {
    if (!ID(c[k])) problems.push(`${k} must be ${what}`);
  };
  const maybe = (k: string, what: string) => {
    if (c[k] !== null && !ID(c[k])) problems.push(`${k} must be ${what} or null`);
  };
  switch (c.cmd) {
    case 'appoint':
      need('post', 'a post id');
      need('person', 'a person id');
      if (Object.hasOwn(c, 'from')) need('from', 'a post id');
      maybe('rank', 'a rank id');
      route();
      break;
    case 'relieve':
      need('post', 'a post id');
      if (!(RELIEF_MODES as readonly unknown[]).includes(c.mode)) problems.push(`mode must be one of ${RELIEF_MODES.join(', ')}`);
      if ((c.mode === 'quiet_department') !== (c.to !== null)) problems.push('to names the quiet post for quiet_department, and only for it');
      maybe('to', 'a post id');
      route();
      break;
    case 'transfer':
      need('from', 'a post id');
      need('to', 'a post id');
      if (c.force !== 'blocks' && c.force !== 'men') problems.push('force must be blocks or men');
      if (typeof c.amount !== 'number' || !Number.isSafeInteger(c.amount) || c.amount < 1) problems.push('amount must be a whole number, at least 1');
      if (c.regiments !== undefined && (c.force !== 'blocks' || !Array.isArray(c.regiments) || c.regiments.length === 0 ||
        !c.regiments.every(ID) || new Set(c.regiments).size !== c.regiments.length || c.regiments.length !== c.amount)) problems.push('a named transfer must name distinct regiments and their count');
      if (c.concentration !== undefined && (!ID(c.concentration) || c.regiments === undefined)) problems.push('a concentration id requires a named transfer');
      route();
      break;
    case 'inquire':
      need('to', 'a post id');
      maybe('subject', 'a region id');
      route();
      break;
    case 'consult':
      need('situation', 'a situation id');
      if (c.round !== undefined && !isLetterIdentity(c.round)) problems.push('round must be an authored letter identity');
      if (c.retryOf !== undefined && (c.round === undefined || !ID(c.retryOf) || !Array.isArray(c.posts) || c.posts.length !== 1)) problems.push('retryOf requires an authored round and one recipient');
      if (!Array.isArray(c.posts) || c.posts.length === 0 || !c.posts.every(ID) || new Set(c.posts).size !== c.posts.length) problems.push('posts must be distinct post ids, at least one');
      break;
    case 'audience':
      need('to', 'a post id');
      if (!Array.isArray(c.counters) || !c.counters.every(counterShaped)) problems.push(`counters must be counters, each with exactly kind, value, boldness, from and men (kind one of ${COUNTER_KINDS.join(', ')})`);
      break;
    case 'observer':
      need('person', 'a person id');
      need('to', 'a post id');
      route();
      break;
    case 'promise':
    case 'pressure':
      need('person', 'a person id');
      break;
    case 'address':
      need('bloc', 'a bloc id');
      break;
  }
  return problems;
}

function counterShaped(raw: unknown): boolean {
  const k = raw as Partial<Record<string, unknown>> | null;
  if (typeof k !== 'object' || k === null || Array.isArray(k)) return false;
  if (Object.keys(k).sort(strictCompare).join() !== 'boldness,from,kind,men,value') return false;
  if (!(COUNTER_KINDS as readonly unknown[]).includes(k.kind)) return false;
  const nullOr = (v: unknown, ok: (x: unknown) => boolean) => v === null || ok(v);
  const int = (x: unknown) => typeof x === 'number' && Number.isSafeInteger(x);
  return nullOr(k.value, ID) && nullOr(k.boldness, int) && nullOr(k.from, ID) && nullOr(k.men, int);
}

/** Problems with a goal's shape as a command carries it: exactly its fields, each of its type and vocabulary. */
export function goalTermsProblems(raw: unknown, depth = 0): string[] {
  const g = raw as Partial<Record<string, unknown>> | null;
  if (typeof g !== 'object' || g === null || Array.isArray(g)) return ['must be an object'];
  const detention = Object.hasOwn(g, 'purpose');
  const fields = ['approveAsDrafted', 'awaitWord', 'committed', 'deadlineDays',
    ...(!detention && Object.hasOwn(g, 'discretion') ? ['discretion'] : []), 'neutral',
    ...(detention ? ['purpose'] : ['objective', 'posture']), 'rail', 'risk', 'river', 'sea'];
  const keys = Object.keys(g).sort(strictCompare);
  if (keys.join() !== fields.join()) return [`has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const problems: string[] = [];
  if (detention) {
    const p = g.purpose as Record<string, unknown> | null;
    const target = p?.target as Record<string, unknown> | null;
    if (depth > 0 || p === null || p === undefined || Object.keys(p).sort(strictCompare).join() !== 'actionArea,detentionArea,duty,kind,means,target' ||
      p.kind !== 'attack_or_demonstrate' || p.duty !== 'detain' || target === null || target === undefined ||
      Object.keys(target).sort(strictCompare).join() !== 'kind,post' || target.kind !== 'opposing_command' || !ID(target.post) ||
      !Array.isArray(p.means) || p.means.length !== 2 || p.means[0] !== 'attack' || p.means[1] !== 'demonstrate') {
      problems.push('invalid detention purpose');
    } else for (const area of [p.detentionArea, p.actionArea]) {
      if (!Array.isArray(area) || area.length === 0 || !area.every(ID) || new Set(area).size !== area.length) {
        problems.push('detention and action areas need distinct region ids');
      }
    }
  } else {
    if (g.objective !== null && !ID(g.objective)) problems.push('objective must be a region id or null');
    if (!(POSTURES as readonly unknown[]).includes(g.posture)) problems.push(`posture must be one of ${POSTURES.join(', ')}`);
  }
  for (const k of ['risk', 'deadlineDays'] as const) if (typeof g[k] !== 'number' || !Number.isSafeInteger(g[k])) problems.push(`${k} must be an integer`);
  for (const k of ['rail', 'river', 'sea', 'neutral', 'awaitWord', 'approveAsDrafted'] as const) if (typeof g[k] !== 'boolean') problems.push(`${k} must be true or false`);
  if (!Array.isArray(g.committed) || !g.committed.every(ID)) problems.push('committed must be force block ids');
  if (Object.hasOwn(g, 'discretion')) {
    const d = g.discretion as { condition?: unknown; fallback?: unknown } | null;
    if (depth >= MAX_FALLBACKS) problems.push(`allows at most ${MAX_FALLBACKS} fallbacks`);
    else if (typeof d !== 'object' || d === null || Object.keys(d).sort(strictCompare).join() !== 'condition,fallback') problems.push('discretion needs a condition and a fallback goal');
    else {
      if (!(DISCRETION_CONDITIONS as readonly unknown[]).includes(d.condition)) problems.push('unknown discretion condition');
      problems.push(...goalTermsProblems(d.fallback, depth + 1).map(p => `fallback ${p}`));
    }
  }
  return problems;
}

/** Problems with an edit's shape as a command carries it. */
export function editTermsProblems(raw: unknown): string[] {
  const e = raw as Partial<Record<string, unknown>> | null;
  if (typeof e !== 'object' || e === null || Array.isArray(e)) return ['must be an object'];
  const fields = ['axis', 'concentration', 'kind', 'region', 'via'];
  const keys = Object.keys(e).sort(strictCompare);
  if (keys.join() !== fields.join()) return [`has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const problems: string[] = [];
  if (!(EDIT_KINDS as readonly unknown[]).includes(e.kind)) problems.push(`kind must be one of ${EDIT_KINDS.join(', ')}`);
  if (e.axis !== null && (typeof e.axis !== 'string' || e.axis.length === 0)) problems.push('axis must be an axis name or null');
  if (e.region !== null && !ID(e.region)) problems.push('region must be a region id or null');
  if (!Array.isArray(e.via) || !e.via.every(ID)) problems.push('via must be region ids');
  if (e.concentration !== null && (typeof e.concentration !== 'number' || !Number.isSafeInteger(e.concentration))) problems.push('concentration must be an integer or null');
  return problems;
}

/**
 * Problems with a whole log (as read from a save): every entry well formed
 * (`entryProblems`), and days never going backwards.
 */
export function logProblems(log: readonly unknown[]): string[] {
  const problems: string[] = [];
  let lastDay = 0;
  log.forEach((raw, i) => {
    problems.push(...entryProblems(raw, i));
    const day = (raw as Partial<LogEntry> | null)?.day;
    if (typeof day === 'number' && Number.isSafeInteger(day)) {
      if (day < lastDay) problems.push(`entry ${i}: day ${day} comes after day ${lastDay}`);
      lastDay = Math.max(lastDay, day);
    }
  });
  return problems;
}

export class LogError extends Error {
  constructor(readonly problems: readonly string[]) {
    super(`malformed command log:\n- ${problems.join('\n- ')}`);
    this.name = 'LogError';
  }
}

/** Throw `LogError` listing every problem unless the log is well formed; return it typed. */
export function checkedLog(log: readonly unknown[]): CommandLog {
  const problems = logProblems(log);
  if (problems.length > 0) throw new LogError(problems);
  return log as CommandLog;
}
