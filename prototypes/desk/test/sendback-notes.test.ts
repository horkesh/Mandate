import { expect, it } from 'vitest';
import { canonicalHash } from '@mandate/kernel';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../../packages/cli/src/console/session.ts';
import { DeskAdapter } from '../server/adapter.ts';
import { sendbackLine } from '../web/map/notes.ts';

it('the desk sends its held marks as one note payload with the same log as the console', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const typed = new ConsoleGame({ pack: 'testbed' });
  const desk = new DeskAdapter(game), console = new ConsoleSession(typed);
  console.start();
  for (const line of ['order n_army_west take salient_tip review','end']) {
    expect(desk.execute(line).ok).toBe(true); console.handle(line);
  }
  const menu = desk.snapshot().morning.menu;
  if (menu.menuKind !== 'principal') throw Error('principal expected');
  const review = menu.reviews[0]!;
  const line = sendbackLine(review.post, [
    { kind: 'objective', axis: 'main', region: 'salient_base' },
    { kind: 'waypoints', axis: 'main', region: 'w_valley' },
  ], review.plan);
  expect(line).toBe('sendback n_army_west focus:main:salient_base via:main:w_valley');
  expect(desk.execute(line).ok).toBe(true);
  console.handle(line);
  expect(desk.snapshot().queue[0]!.text).toContain('w_valley');
  desk.execute('end'); console.handle('end');
  expect(canonicalHash(game.log)).toBe(canonicalHash(typed.log));
  expect(game.hash()).toBe(typed.hash());
  const command = game.log.find(e => e.command.cmd === 'review')!.command;
  expect(command).toMatchObject({ action: 'send_back', notes: [{ markKind: 'focus' },{ markKind: 'via' }] });
});
