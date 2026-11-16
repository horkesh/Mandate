import { canonicalHash, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { ConsoleGame } from '../src/console/game.ts';
import { ConsoleSession } from '../src/console/session.ts';

/**
 * The console on the new kernel, played headless from a script (lane 1.13). Turns of up to the pack's week end on the
 * player's decision points (0027); the inbox shows only what reached him; plans come back for review, with a preview
 * of an arrow edit; situations wait for his decision (his seat is a human's, so no historical default is taken for
 * him); and every order goes to a person (hard rule 1).
 */
function play(pack: string, script: readonly string[]): { readonly game: ConsoleGame; readonly transcript: string[]; readonly turns: string[][] } {
  const game = new ConsoleGame({ pack });
  const session = new ConsoleSession(game);
  const transcript = [...session.start()];
  const turns: string[][] = [];
  for (const line of script) {
    const out = session.handle(line).lines;
    transcript.push(`> ${line}`, ...out);
    if (line === 'end') turns.push([...out]);
  }
  return { game, transcript, turns };
}

/** The days a turn showed passing. */
const daysOf = (turn: readonly string[]) => turn.filter((l) => l.startsWith('--- ')).length;

const TESTBED_WEEK = [
  'posts',
  'move n_army_east salient_tip',
  'order n_army_east take salient_tip review',
  'queue',
  'end',
  'plans',
  'preview n_army_east waypoints via=n_east_plain',
  'approve n_army_east',
  'end',
  'situations',
  'decide fen_crossing shelter',
  'decide eastwatch_stalls wait_for_strength',
  'address n_hawks',
  'end',
  'inbox',
];

describe('the console plays a scripted week of the testbed, headless', () => {
  const { game, transcript, turns } = play('testbed', TESTBED_WEEK);
  const text = transcript.join('\n');

  it('opens on the principal’s first morning, and names the posts he may order', () => {
    expect(transcript[1]).toBe('=== 1861-04-02 (day 1): n_leader, north; 12 attention left this week ===');
    expect(text).toMatch(/^n_army_east: n_organiser via n_war_office; courier 2d/m);
  });

  it('refuses a word that would move a force: there is none (hard rule 1)', () => {
    expect(text).toContain('Unknown command "move". Every order goes to a person');
  });

  it('queues an order to a person and sends it when the turn ends', () => {
    expect(text).toContain('Queued 1: order n_army_east to take salient_tip (risk 500, 20 days) by wire.');
    expect(turns[0]![0]).toBe('Sent: order n_army_east to take salient_tip (risk 500, 20 days) by wire.');
  });

  it('ends a turn on his decision points, never past the pack’s week (0027)', () => {
    for (const turn of turns) expect(daysOf(turn)).toBeLessThanOrEqual(7);
    expect(turns[0]!.some((l) => l.startsWith('The turn stops:') && l.includes('plan-review'))).toBe(true);
    // The scripted session covers at least a week of the game.
    expect(turns.reduce((n, t) => n + daysOf(t), 0)).toBeGreaterThanOrEqual(7);
  });

  it('shows the plan for review, previews an edit before it is sent, and sends the approval', () => {
    expect(text).toContain('n_army_east (n_organiser) submits a plan for your review:');
    expect(text).toMatch(/That edit cannot be made: axis \w+ holds where it stands|As edited \(on today’s map/);
    expect(turns[1]![0]).toBe('Sent: approve n_army_east\'s plan.');
  });

  it('keeps the situations before him for his decision, and sends it', () => {
    expect(text).toMatch(/^fen_crossing: .+ \(open, before you since day \d+\)$/m);
    expect(text).toMatch(/^eastwatch_stalls: .+ \(open, before you since day \d+\)$/m);
    expect(turns[2]![0]).toBe('Sent: decide fen_crossing: shelter; decide eastwatch_stalls: wait_for_strength; address the n_hawks.');
    expect(text).not.toMatch(/Refused: decide/);
    const records = game.state.situationStates;
    const fen = records['fen_crossing' as keyof typeof records]!;
    const stalls = records['eastwatch_stalls' as keyof typeof records]!;
    expect([fen.sitStatus, fen.sitChosen]).toEqual(['decided', ['shelter']]);
    // Waiting for strength is a waiting option (0046): his choice is recorded, and the situation stays before him.
    expect([stalls.sitStatus, stalls.sitChosen]).toEqual(['open', ['wait_for_strength']]);
  });

  it('plays the same lines to the same State, and its log replays to it (the log is the truth, 0015)', () => {
    const again = play('testbed', TESTBED_WEEK);
    expect(again.transcript).toEqual(transcript);
    expect(again.game.hash()).toBe(game.hash());
    const fresh = new ConsoleGame({ pack: 'testbed' });
    const replayed = phase0.replay(fresh.world, fresh.state, game.log, game.state.stateDay);
    expect(canonicalHash(replayed.state)).toBe(game.hash());
  });
});

describe('a battle at his capital (the lead’s question to lane 1.13)', () => {
  it('ends the turn on the battle report, the first return, and shows the battle day’s dispatches dawn to evening', () => {
    // The testbed's southern army attacks the northern capital on day 8; its dispatches and first return are written that
    // evening and reach the principal the next morning, when the first casualty return is the battle-report point.
    const { turns } = play('testbed', ['order n_army_east take salient_tip review', 'end', 'approve n_army_east', 'end']);
    const turn = turns[1]!;
    expect(turn.find((l) => l.startsWith('The turn stops:'))).toContain('battle-report');
    const battleDay = turn.filter((l) => /wire-dispatch from n_secretary \(written day \d+ at \d\d:00/.test(l));
    expect(battleDay.length).toBe(4);
    const hours = battleDay.map((l) => Number(/at (\d\d):00/.exec(l)![1]));
    expect(hours).toEqual([...hours].sort((a, b) => a - b));
    expect(turn.some((l) => /casualty-return from n_secretary .*\(first\)/.test(l))).toBe(true);
  });
});

describe('the preview of an arrow edit (lane 0.9’s finding 5)', () => {
  it('shows the route a waypoint makes, and what it does to the time, before the edit is sent', () => {
    const { transcript } = play('testbed', ['order n_army_west take salient_tip review', 'end', 'preview n_army_west waypoints via=w_valley', 'queue']);
    const text = transcript.join('\n');
    expect(text).toMatch(/As edited \(on today’s map; it reaches him days later\):\n.*\n {4}main \(n_army_west, land, \d+ men\): n_west_front > w_valley > /);
    expect(text).toMatch(/The plan arrives in \d+ days instead of \d+\./);
    // A preview sends nothing.
    expect(transcript.at(-1)).toBe('Nothing queued.');
  });
});

/**
 * The Union pack, from 5 March 1861. A stub until lanes 1.11 and 1.12 merge: today the pack has no situations
 * authored and the other side's principal is the generic rule seat, so the scripted week only orders, addresses and
 * waits. Lane 1.11 adds the pack's first situations (its opening crisis, the call, the special session) for the script
 * to decide; lane 1.12 gives the rule-seat principals their policies, so the other side acts.
 */
describe('the console plays a scripted week of union-1861 (stub until lanes 1.11 and 1.12)', () => {
  const { transcript, turns } = play('union-1861', ['situations', 'address radicals', 'inquire us_general_in_chief', 'inquire us_army_hq', 'end']);
  const text = transcript.join('\n');

  it('opens on the principal’s first morning, at peace', () => {
    expect(transcript[1]).toMatch(/^=== 1861-03-06 \(day 1\): lincoln_abraham, union; at peace; \d+ attention left this week ===$/);
    expect(text).toContain('No situation is before you.');
  });

  it('sends his orders, lets up to a week pass, and shows the kernel refusing an order to a post that does not exist', () => {
    expect(turns[0]![0]).toBe('Sent: address the radicals; ask us_general_in_chief for a report; ask us_army_hq for a report.');
    expect(daysOf(turns[0]!)).toBeGreaterThan(0);
    expect(daysOf(turns[0]!)).toBeLessThanOrEqual(7);
    expect(text).toContain('Refused: ask us_army_hq for a report (unknown_post)');
    expect(text).not.toContain('Refused: address');
    expect(text).not.toContain('Refused: ask us_general_in_chief');
  });
});
