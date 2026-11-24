import { describe, expect, it } from 'vitest';
import { ConsoleGame } from '../src/console/game.ts';
import { ConsoleSession } from '../src/console/session.ts';

function session(overrides: Record<string, string>) {
  const game = new ConsoleGame({ pack: 'testbed' });
  Object.assign(game.strings, overrides);
  return new ConsoleSession(game);
}

describe('console wording from the pack', () => {
  it('S41 keeps edit days, delivery and audience values behind substituted pack wording', () => {
    const desk = session({
      'console.command.edit': 'CHANGE {post}{days}',
      'console.command.edit-days': ' WAIT={days}',
      'console.command.review-route': '{command} / {route}{bypass}',
      'console.command.bypass': ' DIRECT',
      'console.command.through-chain': ' CHAIN',
      'console.command.counter-adjust': 'BOLD={boldness}',
      'console.command.audience': 'VISIT {post}{counters}',
    });
    desk.handle('order n_army_east take salient_tip review');
    desk.handle('end');
    expect(desk.handle('edit n_army_east timing days=1 by=wire bypass').lines[0]).toContain('CHANGE n_army_east WAIT=1 / wire DIRECT');
    expect(desk.handle('approve n_army_east by=wire').lines[0]).toContain('/ wire CHAIN');
    expect(desk.handle('audience n_army_east adjust:100').lines[0]).toContain('VISIT n_army_east: BOLD=100');
  });

  it('formats the opening and leaves the command grammar intact', () => {
    const desk = session({
      'console.start': 'Welcome',
      'console.morning': '{person} | {date} | {day}{peace}{attention}',
      'console.help.look': 'Read the desk:',
      'console.error.no-post': 'No such post: {post}',
    });
    const opening = desk.start();
    expect(opening[0]).toBe('Welcome');
    expect(opening[1]).toContain('n_leader | 1861-04-01 | 1');
    expect(desk.handle('help').lines[0]).toBe('Read the desk:');
    expect(desk.handle('order unknown hold').lines).toEqual(['No such post: unknown']);
  });

  it('uses the pack for received reports, queue entries and plans', () => {
    const desk = session({
      'console.report.opening': 'Map record: {regions}',
      'console.command.order': '{post} | {posture}',
      'console.queue.add': '{index}: [{command}]',
      'console.plan.summary': 'Plan {method} {variant}: enemy {enemy}{asks}{conditions}',
      'console.claim.unknown-result': 'UNMEASURED',
    });
    expect(desk.start().join('\n')).toMatch(/Map record: \d+/);
    expect(desk.handle('order n_army_east take salient_tip review').lines).toEqual(['1: [n_army_east | take]']);
    desk.handle('end');
    expect(desk.handle('plans').lines.join('\n')).toMatch(/Plan .+: enemy UNMEASURED/);
  });

  it('formats field validation and planner failures from the pack', () => {
    const desk = session({
      'console.preview.invalid': 'Edit rejected: {reason}',
      'console.preview.needs-region': '{edit} requires a destination',
      'console.preview.holding-axis': 'The {axis} axis is stationary',
      'console.preview.no-waypoint': 'The {region} waypoint is unavailable for {mode}',
    });
    desk.handle('order n_army_east take salient_tip review');
    desk.handle('end');
    expect(desk.handle('preview n_army_east objective').lines).toEqual(['Edit rejected: objective requires a destination']);
    expect(desk.handle('preview n_army_east waypoints via=island_fort').lines).toEqual(['Edit rejected: The island_fort waypoint is unavailable for land']);
  });
});
