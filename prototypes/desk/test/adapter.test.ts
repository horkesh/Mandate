import { describe, expect, it } from 'vitest';
import { canonicalHash } from '@mandate/kernel';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../../packages/cli/src/console/session.ts';
import { dispatchLog } from '../../../packages/cli/src/desk/dispatches.ts';
import { writeFileSync } from 'node:fs';
import { DeskAdapter } from '../server/adapter.ts';

describe('the desk uses the console driver and grammar', () => {
  for (const options of [{ pack: 'union-1861' }, { pack: 'union-1861', atWar: true }, { pack: 'testbed' }]) {
    it(`matches command logs over three turns: ${JSON.stringify(options)}`, () => {
      const deskGame = new ConsoleGame(options);
      const consoleGame = new ConsoleGame(options);
      const desk = new DeskAdapter(deskGame);
      const session = new ConsoleSession(consoleGame);
      session.start();
      const post = desk.snapshot().morning.menu;
      if (post.menuKind !== 'principal') throw Error('not principal');
      const first = post.commandable[0]!.post;
      const script = [
        `order ${first} hold`, `inquire ${first}`, 'cancel 1', 'queue', 'end',
        `inquire ${first}`, 'end', 'address radicals', 'end',
      ];
      for (const line of script) {
        desk.execute(line);
        session.handle(line);
        expect(canonicalHash(deskGame.log)).toBe(canonicalHash(consoleGame.log));
        expect(deskGame.hash()).toBe(consoleGame.hash());
      }
      expect(desk.snapshot().history).toHaveLength(3);
      expect(desk.snapshot().morning.requestDay).toBeGreaterThan(3);
      const snapshot = desk.snapshot();
      for (const r of snapshot.morning.view.reports) {
        const text = dispatchLog({ ...snapshot.morning.view, reports: [r] })[0]!;
        expect(snapshot.paperText[r.id]).toBe(text.slice(text.indexOf('): ') + 3));
      }
      writeFileSync(new URL(`../../../art-masters/${process.env.DESK_EVIDENCE_REQUEST ?? 'R17'}/equivalence-${options.pack}${options.atWar ? '-at-war' : ''}.json`, import.meta.url), JSON.stringify({ options, turns: snapshot.history.length, requestDay: snapshot.morning.requestDay, deskLogHash: canonicalHash(deskGame.log), consoleLogHash: canonicalHash(consoleGame.log), equalState: deskGame.hash() === consoleGame.hash() }, null, 2));
    });
  }
  it('reads, queueing, cancel and preview never advance the game; only end does', () => {
    const game = new ConsoleGame({ pack: 'testbed' });
    const desk = new DeskAdapter(game);
    const hash = game.hash();
    for (const line of ['posts', 'enemy', 'inbox all', 'help', 'situations', 'plans', 'order n_army_east hold', 'queue', 'cancel 1', 'preview n_army_east timing days=3']) desk.execute(line);
    expect(game.hash()).toBe(hash);
    expect(game.log).toHaveLength(0);
    expect(desk.snapshot().queue).toHaveLength(0);
    const invalid = desk.execute('move n_army_east salient_tip');
    expect(invalid.ok).toBe(false);
    expect(game.hash()).toBe(hash);
    desk.execute('end');
    expect(game.log.length).toBeGreaterThan(0);
  });
  it('serializes only the permitted envelope and copies it, never truth or the log', () => {
    const game = new ConsoleGame({ pack: 'testbed' });
    const desk = new DeskAdapter(game);
    const snapshot = desk.snapshot();
    expect(Object.keys(snapshot).sort()).toEqual(['closed', 'date', 'help', 'history', 'morning', 'pack', 'paperText', 'queue', 'strings']);
    expect(JSON.stringify(snapshot)).not.toContain('stateNow');
    expect(JSON.stringify(snapshot)).not.toContain('worldHash');
    expect(snapshot.morning).toEqual(game.morning());
    expect(snapshot.morning).not.toBe(game.morning());
  });
  it('previews an edit with the same visible result as the console without sending it', () => {
    const game = new ConsoleGame({ pack: 'testbed' });
    const desk = new DeskAdapter(game);
    desk.execute('order n_army_west take salient_tip review');
    desk.execute('end');
    const hash = game.hash();
    const result = desk.execute('preview n_army_west waypoints via=w_valley');
    expect(result.preview?.ok).toBe(true);
    expect(result.preview?.ok && result.preview.plan.axes[0]?.regions).toContain('w_valley');
    expect(game.hash()).toBe(hash);
  });
});
