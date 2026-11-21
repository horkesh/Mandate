import { expect, it } from 'vitest';
import { ConsoleGame } from '../src/console/game.ts';
import { ConsoleSession } from '../src/console/session.ts';
import { parseLine } from '../src/desk/commands.ts';
import { dayLines } from '../src/desk/render.ts';
import type { phase0 } from '@mandate/kernel';

it('maps request mornings separately from dated event days without moving the tick', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const session = new ConsoleSession(game);
  expect(session.start()[1]).toContain('1861-04-01 (day 1)');
  expect(game.state.stateDay).toBe(0);
  expect(game.dateOf(0)).toBe('1861-04-01');
  expect(game.dateOf(1)).toBe('1861-04-02');
  const text = session.handle('end').lines;
  expect(text).toContain('--- 1861-04-02 (day 1) ---');
  expect(text.find(l => l.startsWith('=== '))).toContain(game.dateOf(game.state.stateDay));
});

it.each(['bypass', 'review', 'await', 'rail', 'norail', 'river', 'sea', 'neutral', 'review bypass by=wire'])(
  'does not turn the optional hold flag %s into an objective', flags => {
    const game = new ConsoleGame({ pack: 'testbed' });
    const parsed = parseLine(`order n_army_west hold ${flags}`, game.morning());
    expect(parsed.kind).toBe('command');
    if (parsed.kind !== 'command' || parsed.command.cmd !== 'order') throw Error('order expected');
    expect(parsed.command.goal.objective).toBeNull();
    expect(parsed.command.bypass).toBe(flags.includes('bypass'));
    expect(parsed.command.goal.approveAsDrafted).toBe(!flags.includes('review'));
  });

it('keeps an unknown hold objective for the kernel to refuse', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const parsed = parseLine('order n_army_west hold review unknown_place', game.morning());
  expect(parsed.kind === 'command' && parsed.command.cmd === 'order' && parsed.command.goal.objective).toBe('unknown_place');
});

it('keeps the typed refusal while the console prints the supplied string-table wording', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const parsed = parseLine('order n_army_west take unknown_place', game.morning());
  if (parsed.kind !== 'command') throw Error('order expected');
  const day = game.turn([parsed.command]).days[0]!;
  expect(day.refused[0]?.reason).toBe('bad_goal');
  const rendered = dayLines({ ...day, refused: [{ what: 'the test order', reason: day.refused[0]!.reason }] },
    key => key === 'console.refusal.bad_goal' ? 'Supplied explanation.' : key);
  expect(rendered.join('\n')).toContain('Refused: the test order (Supplied explanation.)');
  expect(rendered.join('\n')).not.toContain('(bad_goal)');
});

it('supplies wording for every typed refusal, including the S27 supplemental cases', () => {
  const reasons: Record<phase0.RejectionReason, true> = {
    bad_goal:true,bad_review:true,bad_selection:true,no_plan:true,not_delegable:true,not_the_decider:true,
    situation_not_open:true,duplicate_choice:true,malformed:true,no_such_request:true,not_a_principal:true,
    not_an_option:true,not_field_post:true,not_raising_post:true,bad_call:true,other_side:true,player_seat:true,
    route_unavailable:true,unknown_post:true,unknown_seat:true,vacant_post:true,wrong_day:true,
    already_promised:true,bad_counters:true,no_attention:true,person_holds_post:true,post_held:true,too_soon:true,
    unknown_bloc:true,unknown_person:true,unknown_rank:true,unknown_region:true,
  };
  const strings = new ConsoleGame({ pack: 'testbed' }).strings;
  for (const reason of Object.keys(reasons)) expect(strings[`console.refusal.${reason}`], reason).toMatch(/\.$/);
});

