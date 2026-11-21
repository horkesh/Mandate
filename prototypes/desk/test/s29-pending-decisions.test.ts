import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {PrincipalMenu,SituationView} from '@mandate/kernel/seat-api';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {Situation} from '../web/App.tsx';

it('keeps the signed selection visible and prevents a second decision slip',()=>{
 const menu=structuredClone(new ConsoleGame({pack:'testbed'}).morning().menu) as PrincipalMenu;
 Object.assign(menu,{situations:[{situation:'fixture_decision',options:[{optionId:'wait',score:0,group:null}],delegableTo:[]}]});
 const situation:SituationView={id:'fixture_decision' as SituationView['id'],kind:'decision',title:'Fixture decision',text:'A fictional decision.',status:'open',surfacedDay:1,options:[{id:'wait',label:'Wait for the report',proposedBy:'inaction',group:null}],chosen:[],delegatedTo:null,staffAuthor:null};
 const html=renderToStaticMarkup(createElement(Situation,{situation,menu,t:(s:string)=>s,execute:async()=>{},order:()=>{},busy:false,queue:[{line:'decide fixture_decision wait'}]}));
 expect(html).toContain('Decision in the out-tray');expect(html).toContain('checked=""');
 expect(html).toMatch(/<fieldset disabled=""/);expect(html).toMatch(/<button disabled="">Sign this decision/);
});
it('distinguishes queued inaction from an unanswered decision',()=>{
 const menu=structuredClone(new ConsoleGame({pack:'testbed'}).morning().menu) as PrincipalMenu;
 Object.assign(menu,{situations:[{situation:'fixture_decision',options:[],delegableTo:[]}]});
 const situation:SituationView={id:'fixture_decision' as SituationView['id'],kind:'decision',title:'Fixture decision',text:'A fictional decision.',status:'open',surfacedDay:1,options:[],chosen:[],delegatedTo:null,staffAuthor:null};
 const html=renderToStaticMarkup(createElement(Situation,{situation,menu,t:(s:string)=>s,execute:async()=>{},order:()=>{},busy:false,queue:[{line:'decide fixture_decision'}]}));
 expect(html).toContain('Decision in the out-tray');expect(html).toMatch(/<button disabled="">Let it take its course/);
});
