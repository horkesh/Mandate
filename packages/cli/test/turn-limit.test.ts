import {expect,it} from 'vitest';
import {ConsoleGame} from '../src/console/game.ts';
import {ConsoleSession} from '../src/console/session.ts';
import {parseLine as parseWithStrings} from '../src/desk/commands.ts';
import {deskStrings} from '../src/pack-text.ts';
const textGame = new ConsoleGame({pack:'testbed'});
const t = deskStrings(textGame.strings, textGame.locale);
const parseLine = (line: string, request: Parameters<typeof parseWithStrings>[1]) => parseWithStrings(line, request, t);


it('can return to the desk before the pack maximum without changing that maximum',()=>{
 const game=new ConsoleGame({pack:'testbed'});game.setTurnStops([]);
 const before=game.morning();
 const turn=game.turn([],2);
 expect(turn.days.map(d=>d.day)).toEqual([1,2]);
 expect(game.morning().requestDay).toBe(3);
 expect(game.morning().turnStops?.maxDays).toBe(before.turnStops?.maxDays);
});
it('accepts only whole day limits within the pack maximum',()=>{
 const game=new ConsoleGame({pack:'testbed'}),request=game.morning();
 expect(parseLine('end 2',request)).toEqual({kind:'end',days:2});
 for(const line of ['end 0','end -1','end 8','end 1.5','end 2 extra'])expect(parseLine(line,request).kind).toBe('error');
 expect(parseLine('end',request)).toEqual({kind:'end'});
});
it('honours a shorter turn in the text console too',()=>{
 const game=new ConsoleGame({pack:'testbed'});game.setTurnStops([]);
 const session=new ConsoleSession(game);session.start();session.handle('end 1');
 expect(game.morning().requestDay).toBe(2);
});
