import {expect,it} from 'vitest';
import {ConsoleGame} from '../src/console/game.ts';
import {ConsoleSession} from '../src/console/session.ts';
it('states the actual shorter interval in the console’s stop line',()=>{
 const game=new ConsoleGame({pack:'testbed'});game.setTurnStops([]);
 const session=new ConsoleSession(game);session.start();
 const lines=session.handle('end 1').lines;
 expect(lines).toContain('1 day has passed.');expect(lines).not.toContain('A week has passed.');
 expect(session.handle('end 2').lines).toContain('2 days have passed.');
});
