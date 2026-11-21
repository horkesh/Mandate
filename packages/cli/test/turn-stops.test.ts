import {expect,it} from 'vitest';
import {ConsoleGame} from '../src/console/game.ts';
import {parseLine as parseWithStrings} from '../src/desk/commands.ts';
import {deskStrings} from '../src/pack-text.ts';
const textGame = new ConsoleGame({pack:'testbed'});
const t = deskStrings(textGame.strings, textGame.locale);
const parseLine = (line: string, request: Parameters<typeof parseWithStrings>[1]) => parseWithStrings(line, request, t);
it('projects and changes the driver’s stops without changing State or the command log',()=>{
 const game=new ConsoleGame({pack:'testbed'}), hash=game.hash(), log=JSON.stringify(game.log), before=game.morning();
 expect(before.turnStops?.points.every(p=>p.enabled)).toBe(true);
 game.setTurnStops([]);
 expect(game.morning().turnStops?.points.every(p=>!p.enabled)).toBe(true);
 expect(game.hash()).toBe(hash);expect(JSON.stringify(game.log)).toBe(log);
 expect(()=>game.setTurnStops(['invented'])).toThrow();
 expect(game.morning().turnStops?.points.every(p=>!p.enabled)).toBe(true);
});
it('uses the selected stops to return early while retaining all reported decision points',()=>{
 const game=new ConsoleGame({pack:'testbed',atWar:true});
 game.setTurnStops([]);
 const order=parseLine('order n_army_west take salient_tip review',game.morning());
 if(order.kind!=='command')throw Error('Expected fixture order');
 const result=game.turn([order.command]);
 expect(result.days).toHaveLength(game.morning().turnStops!.maxDays);
 expect(result.stopped).toBe('week');
 expect(result.days.flatMap(d=>d.points).length).toBeGreaterThan(0);
});
