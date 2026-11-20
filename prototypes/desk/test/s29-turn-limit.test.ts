import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {TurnSheet} from '../web/DeskViews.tsx';

it('honours the signed day limit through the desk adapter',()=>{
 const game=new ConsoleGame({pack:'testbed'});game.setTurnStops([]);
 const desk=new DeskAdapter(game);
 expect(desk.execute('end 2').turn?.days.map(d=>d.day)).toEqual([1,2]);
 expect(desk.execute('end 0').ok).toBe(false);
 expect(game.morning().requestDay).toBe(3);
});
it('offers every day limit through the pack maximum on the turn sheet',()=>{
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot();
 const html=renderToStaticMarkup(createElement(TurnSheet,{data,busy:false,run:()=>{},openPaper:()=>{},onDocket:()=>{},onPlans:()=>{},onHistory:()=>{}}));
 expect(html).toContain('Maximum days this turn');
 expect(html).toContain('<option value="1">1</option>');
 expect(html).toContain('<option value="7" selected="">7</option>');
});
