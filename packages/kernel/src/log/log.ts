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
import { EDIT_KINDS, POSTURES } from '../plans/goal.ts';
import { COUNTER_KINDS } from '../audience/counters.ts';
import { COMMAND_KINDS, RELIEF_MODES, REVIEW_ACTIONS, type Command } from './commands.ts';

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
    order: ['bypass', 'cmd', 'goal', 'route', 'to'],
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
  const fields = FIELDS[c.cmd as string]!;
  const keys = Object.keys(c).sort(strictCompare);
  if (keys.join() !== fields.join()) return [...problems, `${at}: ${String(c.cmd)} has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const id = (v: unknown) => typeof v === 'string' && isWellFormedId(v);
  const routed = () => {
    if (!id(c.to)) problems.push(`${at}: ${String(c.cmd)}.to must be a post id`);
    if (!(ROUTE_KINDS as readonly unknown[]).includes(c.route)) problems.push(`${at}: ${String(c.cmd)}.route must be one of ${ROUTE_KINDS.join(', ')}`);
    if (typeof c.bypass !== 'boolean') problems.push(`${at}: ${String(c.cmd)}.bypass must be true or false`);
  };
  if (c.cmd === 'order') {
    routed();
    problems.push(...goalTermsProblems(c.goal).map((p) => `${at}: order.goal ${p}`));
  } else if (c.cmd === 'review') {
    routed();
    if (!(REVIEW_ACTIONS as readonly unknown[]).includes(c.action)) problems.push(`${at}: review.action must be one of ${REVIEW_ACTIONS.join(', ')}`);
    if ((c.action === 'edit') !== (c.edit !== null)) problems.push(`${at}: review.edit is given for an edit and only for an edit`);
    if (c.edit !== null) problems.push(...editTermsProblems(c.edit).map((p) => `${at}: review.edit ${p}`));
  } else if (c.cmd === 'go') {
    routed();
  } else if (c.cmd === 'call') {
    routed();
    if (typeof c.regiments !== 'number' || !Number.isSafeInteger(c.regiments) || c.regiments < 1) problems.push(`${at}: call.regiments must be a whole number of regiments, at least 1`);
    if (typeof c.termDays !== 'number' || !Number.isSafeInteger(c.termDays) || c.termDays < 1) problems.push(`${at}: call.termDays must be a whole number of days, at least 1`);
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
      route();
      break;
    case 'inquire':
      need('to', 'a post id');
      maybe('subject', 'a region id');
      route();
      break;
    case 'consult':
      need('situation', 'a situation id');
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
export function goalTermsProblems(raw: unknown): string[] {
  const g = raw as Partial<Record<string, unknown>> | null;
  if (typeof g !== 'object' || g === null || Array.isArray(g)) return ['must be an object'];
  const fields = ['approveAsDrafted', 'awaitWord', 'committed', 'deadlineDays', 'neutral', 'objective', 'posture', 'rail', 'risk', 'river', 'sea'];
  const keys = Object.keys(g).sort(strictCompare);
  if (keys.join() !== fields.join()) return [`has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const problems: string[] = [];
  if (g.objective !== null && !ID(g.objective)) problems.push('objective must be a region id or null');
  if (!(POSTURES as readonly unknown[]).includes(g.posture)) problems.push(`posture must be one of ${POSTURES.join(', ')}`);
  for (const k of ['risk', 'deadlineDays'] as const) if (typeof g[k] !== 'number' || !Number.isSafeInteger(g[k])) problems.push(`${k} must be an integer`);
  for (const k of ['rail', 'river', 'sea', 'neutral', 'awaitWord', 'approveAsDrafted'] as const) if (typeof g[k] !== 'boolean') problems.push(`${k} must be true or false`);
  if (!Array.isArray(g.committed) || !g.committed.every(ID)) problems.push('committed must be force block ids');
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
