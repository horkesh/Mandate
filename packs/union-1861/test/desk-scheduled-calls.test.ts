import {expect,it} from 'vitest';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {parseLine} from '../../../packages/cli/src/desk/commands.ts';

it('issues the actual May requisition through a raising governor absent from commandable field posts',()=>{
 const game=new ConsoleGame({pack:'union-1861',atWar:true});game.setTurnStops([]);
 for(let i=0;i<8;i++)game.turn([],7);game.turn([],2);
 const request=game.morning(),menu=request.menu;
 if(menu.menuKind!=='principal')throw Error('Expected principal');
 expect(request.requestDay).toBe(59);
 expect(menu.raising.some(r=>r.post==='st_gov_new_york')).toBe(true);
 expect(menu.commandable.some(r=>r.post==='st_gov_new_york')).toBe(false);
 const input=parseLine('call st_gov_new_york scheduled=us_may03_accepted_new_york',request);
 expect(input.kind).toBe('command');if(input.kind!=='command')throw Error('Call was not parsed');
 const result=game.turn([input.command],1);expect(result.days[0]!.refused).toEqual([]);
 const after=game.morning().menu;if(after.menuKind!=='principal')throw Error('Expected principal');
 expect(after.doctrine.calls.find(c=>c.id==='us_may03_accepted_new_york')?.issued).toBe(true);
});
