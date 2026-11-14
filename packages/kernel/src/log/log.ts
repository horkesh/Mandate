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
import type { SeatId } from '../ids.ts';
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
 * Problems with a log's shape (as read from a save): days must not go
 * backwards, and each command must be a known kind with its fields. The tick
 * still validates what each command asks for; this only guards the format.
 */
export function logProblems(log: readonly unknown[]): string[] {
  const problems: string[] = [];
  let lastDay = 0;
  log.forEach((raw, i) => {
    const e = raw as Partial<LogEntry> | null;
    if (typeof e !== 'object' || e === null) return void problems.push(`entry ${i}: not an object`);
    if (typeof e.day !== 'number' || !Number.isSafeInteger(e.day) || e.day < 1) return void problems.push(`entry ${i}: day must be a positive integer`);
    if (e.day < lastDay) problems.push(`entry ${i}: day ${e.day} comes after day ${lastDay}`);
    lastDay = e.day;
    if (typeof e.seat !== 'string') problems.push(`entry ${i}: seat must be a seat id`);
    const c = e.command as Partial<Record<string, unknown>> | undefined;
    if (typeof c !== 'object' || c === null || !(COMMAND_KINDS as readonly unknown[]).includes(c.cmd)) return void problems.push(`entry ${i}: unknown command`);
    const fields = c.cmd === 'order' ? ['bypass', 'cmd', 'goal', 'region', 'route', 'to'] : ['cmd', 'option', 'request'];
    const keys = Object.keys(c).sort(strictCompare);
    if (keys.join() !== fields.join()) problems.push(`entry ${i}: ${String(c.cmd)} has fields [${keys.join(', ')}], expected [${fields.join(', ')}]`);
  });
  return problems;
}
