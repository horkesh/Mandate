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
import { strictCompare } from '../compare.ts';
import { isWellFormedId, type SeatId } from '../ids.ts';
import { ROUTE_KINDS } from '../messages/latency.ts';
import { GOAL_KINDS } from '../plans/goal.ts';
import { COMMAND_KINDS, type Command } from './commands.ts';

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
  const FIELDS: Readonly<Record<string, readonly string[]>> = { order: ['bypass', 'cmd', 'goal', 'region', 'route', 'to'], choose: ['cmd', 'option', 'request'], decide: ['cmd', 'options', 'situation'], delegate: ['cmd', 'situation', 'to'] };
  const fields = FIELDS[c.cmd as string]!;
  const keys = Object.keys(c).sort(strictCompare);
  if (keys.join() !== fields.join()) return [...problems, `${at}: ${String(c.cmd)} has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`];
  const id = (v: unknown) => typeof v === 'string' && isWellFormedId(v);
  if (c.cmd === 'order') {
    if (!id(c.to)) problems.push(`${at}: order.to must be a post id`);
    if (!(GOAL_KINDS as readonly unknown[]).includes(c.goal)) problems.push(`${at}: order.goal must be one of ${GOAL_KINDS.join(', ')}`);
    if (c.region !== null && !id(c.region)) problems.push(`${at}: order.region must be a region id or null`);
    if (!(ROUTE_KINDS as readonly unknown[]).includes(c.route)) problems.push(`${at}: order.route must be one of ${ROUTE_KINDS.join(', ')}`);
    if (typeof c.bypass !== 'boolean') problems.push(`${at}: order.bypass must be true or false`);
  } else if (c.cmd === 'decide') {
    if (!id(c.situation)) problems.push(`${at}: decide.situation must be a situation id`);
    if (!Array.isArray(c.options) || !c.options.every((o) => typeof o === 'string' && o.length > 0) || new Set(c.options).size !== c.options.length) {
      problems.push(`${at}: decide.options must be distinct option ids (none: ignore it)`);
    }
  } else if (c.cmd === 'delegate') {
    if (!id(c.situation)) problems.push(`${at}: delegate.situation must be a situation id`);
    if (!id(c.to)) problems.push(`${at}: delegate.to must be a post id`);
  } else {
    if (typeof c.request !== 'string' || c.request.length === 0) problems.push(`${at}: choose.request must be a request key`);
    if (typeof c.option !== 'string' || c.option.length === 0) problems.push(`${at}: choose.option must be an option id`);
  }
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
