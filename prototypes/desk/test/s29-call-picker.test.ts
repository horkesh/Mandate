import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {OrderSheet} from '../web/App.tsx';
it('offers raising governors and their routes when writing a call',()=>{
 const game=new ConsoleGame({pack:'testbed'}),menu=game.morning().menu;
 if(menu.menuKind!=='principal')throw Error('Expected principal');
 const governor=menu.raising[0]!;
 expect(menu.commandable.some(p=>p.post===governor.post)).toBe(false);
 const html=renderToStaticMarkup(createElement(OrderSheet,{menu,t:(s:string)=>s,line:`call ${governor.post} 2 90`,setLine:()=>{},help:[],execute:async()=>{},busy:false,display:(s:string)=>s,commandDisplay:(s:string)=>s,commandInput:(s:string)=>s}));
 expect(html).toContain(`value="${governor.post}"`);expect(html).toContain('wire: 0 typical days');
});
