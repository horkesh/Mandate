import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
const out=resolve(process.env.S8_EVIDENCE??'../../../ByOrderOfThePresident/art-masters/S8');
mkdirSync(out,{recursive:true});
for(const pack of ['union-1861','testbed']){
 if(process.argv.includes('--playback-only')&&pack==='testbed')continue;
 const game=new ConsoleGame({pack,atWar:true}),desk=new DeskAdapter(game);
 const opening=desk.snapshot(),menu=opening.morning.menu;
 if(menu.menuKind!=='principal')throw Error('Principal menu required');
 const visitor=menu.commandable.find(p=>p.post===(pack==='testbed'?'n_army_west':'us_general_in_chief'))??menu.commandable[0]!;
 const script=pack==='testbed'?[`order ${visitor.post} take salient_tip review`]:[`order ${visitor.post} take richmond review`];
 for(const line of script)if(!desk.execute(line).ok)throw Error(`Fixture rejected ${line}`);
 let playbackBefore=desk.snapshot(),firstReply=desk.execute('end');
 for(let i=0;i<8&&(firstReply.turn?.days.reduce((n,d)=>n+Math.max(1,d.reports.length*2),0)??0)<2;i++){
  playbackBefore=desk.snapshot();firstReply=desk.execute('end');
 }
 if(!firstReply.turn||firstReply.turn.days.reduce((n,d)=>n+Math.max(1,d.reports.length*2),0)<2)throw Error('No multi-frame turn in bounded fixture');
 writeFileSync(`${out}/${pack}-playback-before.json`,JSON.stringify(playbackBefore));
 writeFileSync(`${out}/${pack}-playback-reply.json`,JSON.stringify(firstReply));
 if(process.argv.includes('--playback-only'))continue;
 for(let i=0;i<8;i++){
  const m=desk.snapshot().morning.menu;
  if(m.menuKind==='principal'&&m.reviews.some(r=>r.post===visitor.post))break;
  desk.execute('end');
 }
 const scene=desk.snapshot();
 writeFileSync(`${out}/${pack}-scene.json`,JSON.stringify(scene));
 writeFileSync(`${out}/${pack}-fixture.json`,JSON.stringify({pack,visitor:visitor.post,holder:visitor.holder,script,day:scene.morning.requestDay,hash:game.hash(),reviews:scene.morning.menu.menuKind==='principal'?scene.morning.menu.reviews.map(r=>r.post):[]},null,2));
 console.log(JSON.stringify({pack,day:scene.morning.requestDay,reviews:scene.morning.menu.menuKind==='principal'?scene.morning.menu.reviews.length:0}));
 if(pack==='union-1861'){
  for(let i=0;i<20&&desk.snapshot().morning.requestDay<31;i++)desk.execute('end');
  writeFileSync(`${out}/union-1861-returns-scene.json`,JSON.stringify(desk.snapshot()));
 }
}
