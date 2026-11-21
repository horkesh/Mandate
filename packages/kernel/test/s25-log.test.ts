import { expect, it } from 'vitest';
import { logProblems, logThrough, type LogEntry } from '../src/log/log.ts';
import { playDays } from '../src/log/session.ts';
import { fresh } from './support/s25-fixture.ts';
import { P, POST } from './support/seats-fixture.ts';
import { scriptedSeats } from './support/test-seats.ts';

it('S25 log-01: a saved log includes commands on its final day and no later commands', () => {
  const { seat } = fresh();
  const entries: LogEntry[] = [1, 2, 3].map(day => ({ day, seat, command: { cmd: 'promise', person: P('a_gen') } }));
  expect(logThrough(entries, 2)).toEqual(entries.slice(0, 2));
});

it('S25 log-02: hashing every one day is the same cadence as the default', () => {
  const { world, state } = fresh();
  const daily = playDays(world, state, scriptedSeats(), 3, { hashEvery: 1 });
  expect(daily.hashes).toHaveLength(3);
  expect(daily.hashes).toEqual(playDays(world, state, scriptedSeats(), 3).hashes);
});

it('S25 log-05: a one-day call is well formed and a zero-day call is rejected', () => {
  const { seat } = fresh();
  const entry: LogEntry = { day: 1, seat, command: { cmd: 'call', to: POST('a_army'), regiments: 1, termDays: 1, route: 'courier', bypass: true } };
  expect(logProblems([entry])).toEqual([]);
  expect(logProblems([{ ...entry, command: { ...entry.command, termDays: 0 } }])).toContain('entry 0: call.termDays must be a whole number of days, at least 1');
});
