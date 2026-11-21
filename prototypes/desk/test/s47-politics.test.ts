import {expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {Situation} from '../web/App.tsx';
const render=(props:any)=>renderToStaticMarkup(createElement(Situation,props));
function fixture(){
 const data=new DeskAdapter(new ConsoleGame({pack:'testbed'})).snapshot(),menu=data.morning.menu;
 if(menu.menuKind!=='principal')throw Error('principal');
 const situation:any={id:'received_case',title:'Received decision',text:'Received account',status:'open',surfacedDay:0,options:[],staffAuthor:null};
 Object.assign(menu,{situations:[{situation:situation.id,options:[],delegableTo:[],consultPosts:['cabinet_a','cabinet_b']}]});
 const names:Record<string,string>={cabinet_a:'Received Secretary A',cabinet_b:'Received Secretary B',unoffered:'Unreceived adviser'};
 return {situation,menu,t:(id:string)=>names[id]??id,execute:async()=>{},order:()=>{},busy:false};
}
it('offers consultation recipients only from this received decision menu',()=>{
 const props=fixture(),html=render(props);
 expect(html).toContain('Advisers available for this decision');
 expect(html).toContain('Received Secretary A');expect(html).toContain('Received Secretary B');
 expect(html).not.toContain('Unreceived adviser');expect(html).not.toContain('Address to post');
});
it('excludes advisers already asked in this out-tray, independently of commandable posts',()=>{
 const props=fixture();
 const a=render({...props,queue:[{line:'consult received_case cabinet_a'}]});
 expect(a).not.toContain('Received Secretary A');expect(a).toContain('Received Secretary B');
 Object.assign(props.menu,{commandable:[{post:'unoffered',holder:'private_person'}]});
 expect(render({...props,queue:[{line:'consult received_case cabinet_a'}]})).toBe(a);
});
it('does not offer an unsupported consultation when the menu supplies no recipients',()=>{
 const props=fixture();Object.assign(props.menu.situations[0]!,{consultPosts:[]});
 const html=render(props);expect(html).toContain('No further consultation is offered for this decision.');
 expect(html).not.toContain('Received Secretary A');
});
