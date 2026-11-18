import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { DeskAdapter } from '../server/adapter.ts';
import { buildMapModel } from '../web/map/model.ts';
import type { MapGeometry } from '../web/map/model.ts';
import { readFileSync, writeFileSync } from 'node:fs';
const evidence='../../art-masters/R22';
const desk=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true}));
const geometry:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
const actions:any[]=[];
// A bounded real-console run. Orders go through the commander's existing goal
// grammar. No report, position or truth is injected into this saved seat view.
const run=(line:string)=>{const reply=desk.execute(line);actions.push({line,ok:reply.ok,message:reply.message,day:reply.snapshot.morning.requestDay});if(!reply.ok)throw Error(reply.message);return reply;};
run('order us_dc_militia take baltimore bypass');
let reached=false;
for(let turn=0;turn<3;turn++){
  const snapshot=desk.snapshot();
  if(snapshot.morning.menu.menuKind!=='principal')throw Error('principal expected');
  for(const p of snapshot.morning.menu.commandable)run(`inquire ${p.post}`);
  run('end');
  const current=desk.snapshot();
  const model=buildMapModel(current.morning,geometry);
  const hq=model.marks.filter(m=>m.kind==='headquarters');
  if(hq.some(m=>m.region==='fort_monroe')&&hq.some(m=>['baltimore','southern_maryland','frederick_md'].includes(m.region))){reached=true;break;}
}
const snapshot=desk.snapshot(),model=buildMapModel(snapshot.morning,geometry);
writeFileSync(`${evidence}/scene-snapshot.json`,JSON.stringify(snapshot,null,2));
writeFileSync(`${evidence}/scene-run.json`,JSON.stringify({reached,date:snapshot.date,actions,marks:model.marks,absent:model.absent,unplaced:model.unplaced},null,2));
console.log(JSON.stringify({reached,date:snapshot.date,headquarters:model.marks.filter(m=>m.kind==='headquarters').map(m=>({region:m.region,author:m.author,day:m.day})),turns:snapshot.history.length}));
if(!reached)process.exitCode=1;
