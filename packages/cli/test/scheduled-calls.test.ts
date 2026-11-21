import {expect,it} from 'vitest';
import type {PrincipalMenu} from '@mandate/kernel/seat-api';
import {ConsoleGame} from '../src/console/game.ts';
import {parseLine as parseWithStrings} from '../src/desk/commands.ts';
import {deskStrings} from '../src/pack-text.ts';
const textGame = new ConsoleGame({pack:'testbed'});
const t = deskStrings(textGame.strings, textGame.locale);
const parseLine = (line: string, request: Parameters<typeof parseWithStrings>[1]) => parseWithStrings(line, request, t);


function morning(){
 const request=structuredClone(new ConsoleGame({pack:'testbed'}).morning()),menu=request.menu as PrincipalMenu;
 Object.assign(menu.doctrine,{calls:[{id:'fixture_horse',post:'n_brenmark_governor',day:1,regiments:2,men:1200,termDays:null,arm:'cavalry',readiness:true,issued:false}]});
 return request;
}
it('copies an identified call’s complete terms from the eligible seat menu',()=>{
 const input=parseLine('call n_brenmark_governor scheduled=fixture_horse',morning());
 expect(input).toMatchObject({kind:'command',command:{cmd:'call',to:'n_brenmark_governor',callId:'fixture_horse',regiments:2,men:1200,termDays:null,arm:'cavalry',readiness:true}});
});
it('refuses unknown, early, already issued or mismatched identified calls',()=>{
 for(const change of [{day:2},{issued:true},{post:'n_army_west'}]){
  const request=morning(),menu=request.menu as PrincipalMenu;
  Object.assign(menu.doctrine.calls[0]!,change);
  expect(parseLine('call n_brenmark_governor scheduled=fixture_horse',request).kind).toBe('error');
 }
 expect(parseLine('call n_brenmark_governor scheduled=missing',morning()).kind).toBe('error');
});
it('does not accept overrides to an identified call and preserves the manual grammar',()=>{
 expect(parseLine('call n_brenmark_governor 99 1 scheduled=fixture_horse',morning()).kind).toBe('error');
 expect(parseLine('call n_brenmark_governor scheduled=fixture_horse men=9000',morning()).kind).toBe('error');
 expect(parseLine('call n_brenmark_governor 2 90',morning())).toMatchObject({kind:'command',command:{regiments:2,termDays:90}});
});
