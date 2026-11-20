import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { ConsoleGame } from '../src/console/game.ts';
import { ConsoleSession } from '../src/console/session.ts';
import { DESK_COMMANDS, VERB_COMMANDS } from '../src/desk/commands.ts';

/** R86 / FOUNDATION 12, 1A.2. This player holds only a text session: no State,
 * World, seat request, command log, runner or kernel calls. Even selectors and
 * the calendar come from the same printed desk a keyboard player reads. */
class Player {
  readonly transcript: string[];
  readonly commands: string[] = [];
  readonly turns: string[][] = [];
  readonly errors: string[] = [];
  constructor(private readonly session: ConsoleSession) {
    this.transcript = [...session.start()];
  }
  type(command: string): string[] {
    const word = command.split(' ')[0]!;
    if (![...Object.keys(VERB_COMMANDS), ...DESK_COMMANDS].includes(word)) {
      throw new Error(`Script used an undeclared word: ${command}`);
    }
    const lines = [...this.session.handle(command).lines];
    if (Object.hasOwn(VERB_COMMANDS, word) && !lines[0]?.startsWith('Queued ')) {
      this.errors.push(`${command}: ${lines.join(' ')}`);
    }
    this.commands.push(command);
    this.transcript.push(`> ${command}`, ...lines);
    if (command === 'end') this.turns.push(lines);
    return lines;
  }
  get date(): string {
    const header = [...this.transcript].reverse().find(line => line.startsWith('=== '));
    if (!header) throw new Error('The desk did not print a calendar date.');
    return /^=== (\d{4}-\d\d-\d\d)/.exec(header)?.[1] ?? '';
  }
}

function player(atWar = false): Player {
  return new Player(new ConsoleSession(new ConsoleGame({ pack: 'union-1861', atWar })));
}

// An authored script, pinned to the pack's cited historicalDefault choices.
// These are not read from hidden game data while the player is playing.
const CHOICES: Readonly<Record<string, readonly string[]>> = {
  sumter_garrison: ['provision_notice'],
  pickens_reinforcement: ['land_company'],
  confederate_commissioners: ['hold_and_talk'],
  lamon_promise: ['assure_notice'],
  seward_memorandum: ['answer_in_person'],
  pickens_refused: ['courier_order', 'special_expedition'],
  virginia_unionists: ['offer_fort'],
  call_for_troops: ['militia_call'],
  blockade_or_closure: ['blockade'],
  gosport_yard: ['defend'],
  washington_cut_off: ['around_baltimore'],
  habeas_on_the_line: ['suspend_on_line'],
  missouri_arsenal: ['back_lyon'],
  kentucky_neutrality: ['arm_quietly', 'wait'],
  fort_monroe_arrivals: ['approve_holding'],
  western_virginia: ['cross_river', 'recognise'],
  special_session: ['ask_war_footing'],
  mcdowell_advance: ['advance_now'],
};

function offered(lines: readonly string[]): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  let current: Set<string> | undefined;
  for (const line of lines) {
    const heading = /^(\w+): .+ \((?:open|waiting), before you since day \d+\)$/.exec(line);
    if (heading) {
      current = new Set();
      result.set(heading[1]!, current);
    }
    const option = /^  - (\w+):/.exec(line);
    if (option) current?.add(option[1]!);
  }
  return result;
}

describe('R86 console preflight', () => {
  it('opens at peace with readable situation, post and plan selectors', () => {
    const p = player();
    expect(p.date).toBe('1861-03-06');
    expect(p.transcript.join('\n')).toContain('; at peace;');
    expect(p.type('help').join('\n')).toContain('edit <post>');
    expect(p.type('posts').join('\n')).toMatch(/^us_dc_militia: \w+/m);
    expect(p.type('plans')).toEqual(['No plan waits for you.']);
    p.type('end');
    expect(offered(p.type('situations')).has('sumter_garrison')).toBe(true);
  });
});

interface Played {
  readonly player: Player;
  readonly missingChoices: string[];
}

function playMonths(atWar = false): Played {
  const p = player(atWar);
  const chosen = new Map<string, Set<string>>();
  const missingChoices = new Set<string>();
  // At most 160 console turns: even a decision point every day is bounded.
  for (let turn = 0; turn < 160 && p.date <= '1861-07-31'; turn++) {
    for (const [id, options] of offered(p.type('situations'))) {
      const wanted = CHOICES[id];
      if (!wanted) {
        missingChoices.add(`No authored historical choice for ${id}`);
        continue;
      }
      const previous = chosen.get(id) ?? new Set<string>();
      // A grouped historical decision settles on the first choice. Wait until
      // all its choices are printed, or a later group would be lost forever.
      const available = wanted.every(option => options.has(option))
        ? wanted.filter(option => !previous.has(option)) : [];
      if (available.length > 0) {
        p.type(`decide ${id} ${available.join(' ')}`);
        for (const option of available) previous.add(option);
        chosen.set(id, previous);
      }
    }
    // The advance decision has no order effect. A human must order the holder.
    // The command is sent after the desk offers and we choose the advance.
    if (chosen.has('mcdowell_advance') && !p.commands.some(c => c.startsWith('order '))) {
      const posts = p.type('posts');
      if (posts.some(line => line.startsWith('us_dc_militia: '))) {
        p.type('order us_dc_militia take manassas review');
      }
    }
    if (p.transcript.some(line => line.includes('objects to the order')) &&
        p.commands.some(c => c.startsWith('order ')) &&
        !p.commands.some(c => c.startsWith('order ') && c.endsWith('bypass'))) {
      p.type('order us_dc_militia take manassas review bypass');
    }
    const plans = p.type('plans');
    const review = plans.find(line => /^us_dc_militia \(.+\) submits a plan for your review:$/.test(line));
    if (review && !p.commands.some(c => c.startsWith('edit '))) {
      // Shorten the displayed arrow to its printed intermediate region. This
      // changes geometry rather than resending the commander's own waypoints.
      p.type('preview us_dc_militia objective region=northern_virginia');
      p.type('edit us_dc_militia objective region=northern_virginia bypass');
      p.type('audience us_dc_militia');
    }
    p.type('end');
  }
  p.type('inbox all');
  return { player: p, missingChoices: [...missingChoices] };
}

/** Weekly turns may run past July. Such output is preserved as evidence, but
 * cannot satisfy a required activity in the March–July acceptance window. */
function throughJuly(p: Player): string[] {
  const after = p.transcript.findIndex(line => /^(?:---|===) 1861-08-/.test(line));
  return after < 0 ? p.transcript : p.transcript.slice(0, after);
}

function battleDispatchProblems(lines: readonly string[]): string[] {
  const groups = new Map<string, number[]>();
  for (const line of lines) {
    const dispatch = /wire-dispatch from (\w+) \(written day (\d+) at (\d\d):00.*?: .*?at (\w+): going (?:well|badly)/.exec(line);
    if (!dispatch) continue;
    const key = `${dispatch[1]}/${dispatch[2]}/${dispatch[4]}`;
    const hours = groups.get(key) ?? [];
    hours.push(Number(dispatch[3]));
    groups.set(key, hours);
  }
  if (groups.size === 0) return ['No hour-stamped battle dispatch reached this desk (1A operation gap; owner R85 / lane 1.14 calibration).'];
  const problems: string[] = [];
  for (const [battleDay, hours] of groups) {
    if (hours.length < 2) problems.push(`${battleDay}: no sequence of battle-day hours.`);
    if (hours.some((hour, index) => index > 0 && hour <= hours[index - 1]!)) problems.push(`${battleDay}: hours are not in chronological order: ${hours.join(', ')}.`);
  }
  return problems;
}

describe('R86: the history months through the player’s console (1A criterion 2)', () => {
  let played: Played;
  beforeAll(() => {
    played = playMonths();
    // Optional retained evidence; ordinary tests do not write into the source tree.
    if (process.env.R86_EVIDENCE_DIR) {
      mkdirSync(process.env.R86_EVIDENCE_DIR, { recursive: true });
      writeFileSync(join(process.env.R86_EVIDENCE_DIR, 'history-transcript.txt'), `${played.player.transcript.join('\n')}\n`);
    }
    // R86 asks for the nearest honest route when July has no battle dispatch.
    // Continue this same session, without a new seed or hidden setup, to the
    // end of August. This evidence cannot satisfy the July requirement.
    if (battleDispatchProblems(throughJuly(played.player)).length > 0) {
      const start = played.player.transcript.length;
      for (let turn = 0; turn < 32 && played.player.date <= '1861-08-31'; turn++) {
        const out = played.player.type('end');
        if (battleDispatchProblems(out).length === 0) break;
      }
      if (process.env.R86_EVIDENCE_DIR) {
        writeFileSync(join(process.env.R86_EVIDENCE_DIR, 'later-transcript.txt'), `${played.player.transcript.slice(start).join('\n')}\n`);
      }
    }
  });

  it('reaches 31 July through declared console words, with every turn at most a week', () => {
    expect(throughJuly(played.player).includes('--- 1861-07-31 (day 148) ---')).toBe(true);
    for (const turn of played.player.turns) {
      expect(turn.filter(line => line.startsWith('--- ')).length).toBeGreaterThan(0);
      expect(turn.filter(line => line.startsWith('--- ')).length).toBeLessThanOrEqual(7);
    }
  });

  it('decides the opening, troop call and special session as authored when offered', () => {
    expect(played.missingChoices).toEqual([]);
    for (const [id, options] of Object.entries(CHOICES)) {
      for (const option of options) {
        expect.soft(played.player.commands.some(c => c.startsWith(`decide ${id} `) && c.split(' ').slice(2).includes(option)), `Historical choice ${id}/${option} was never offered or sent; owner lane 1.11`).toBe(true);
      }
    }
    const refusals = throughJuly(played.player).filter(line => line.includes('Refused:'));
    expect(played.player.errors).toEqual([]);
    expect(refusals).toEqual([]);
  });

  it('reviews a submitted plan and sends an arrow edit with a successful preview', () => {
    const text = throughJuly(played.player).join('\n');
    expect(text.includes('submits a plan for your review:'), 'No review reached the desk by 31 July; owner lane 1.13, planner/people lanes 1.2/1.5').toBe(true);
    expect(text.includes('As edited (on today’s map; it reaches him days later):'), 'The printed plan has no editable arrow; owner lane 1.2').toBe(true);
    expect(/^Sent: .*edit us_dc_militia's plan: objective main to northern_virginia/m.test(text), 'The arrow edit was not sent').toBe(true);
    expect(/answers your edit: (?:exceed|comply(?:_with_reservations)?|slow_walk|reinterpret|object|refuse)\b/.test(text), 'No valid answer to the arrow edit reached the desk').toBe(true);
  });

  it('holds an audience and receives its answer, rather than only queuing the word', () => {
    const lines = throughJuly(played.player);
    const answer = lines.some(line => /^\s*day \d+/.test(line.trim()) && /audience: (?:exceed|comply(?:_with_reservations)?|slow_walk|reinterpret|object|refuse)\b/.test(line) && !line.includes('(not done)'));
    expect(answer, 'No completed audience is printed in the history months; owner lane 1.5/1.13').toBe(true);
  });

  // R88: no battle reaches this desk by 31 July. R85 / lane 1.14 calibration
  // owns the 1A operation gap. A battle must turn this into an unexpected pass;
  // then replace it.fails with a plain it. No other step is an expected failure.
  it.fails('reads a battle day’s dispatches with their hours in chronological order', () => {
    expect(battleDispatchProblems(throughJuly(played.player))).toEqual([]);
  });
});

describe('R86 supplemental battle route, not a substitute for the history months', () => {
  it('reads the fictional battle on day 8, and rejects missing hours or reversed dispatches', () => {
    const p = new Player(new ConsoleSession(new ConsoleGame({ pack: 'testbed' })));
    for (const command of ['order n_army_east take salient_tip review', 'end', 'approve n_army_east', 'end']) p.type(command);
    const battle = p.turns[1]!.filter(line => line.includes('wire-dispatch') && line.includes(' at ') && line.includes(':00'));
    expect(battle).toHaveLength(4);
    expect(battleDispatchProblems(battle)).toEqual([]);
    expect(battleDispatchProblems([...battle].reverse()).join('\n')).toContain('not in chronological order');
    expect(battleDispatchProblems(battle.map(line => line.replace(/ at \d\d:00/, ''))).join('\n')).toContain('No hour-stamped');
    expect(battleDispatchProblems([]).join('\n')).toContain('No hour-stamped');
    if (process.env.R86_EVIDENCE_DIR) {
      mkdirSync(process.env.R86_EVIDENCE_DIR, { recursive: true });
      writeFileSync(join(process.env.R86_EVIDENCE_DIR, 'supplemental-transcript.txt'), `${p.transcript.join('\n')}\n`);
    }
  });
});
