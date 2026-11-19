import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {writeFileSync,mkdirSync} from 'node:fs';
const out='../../art-masters/R26',desk=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true}));
mkdirSync(out,{recursive:true});const firstMorning=desk.snapshot();
let opening=desk.snapshot(),queued=opening,reply=desk.execute('order us_dc_militia take baltimore bypass');
if(!reply.ok)throw Error(reply.message);
const actions:{line:string;ok:boolean}[]=[{line:'order us_dc_militia take baltimore bypass',ok:true}];
for(let turn=0;turn<3;turn++){
 opening=desk.snapshot();const menu=opening.morning.menu;if(menu.menuKind!=='principal')throw Error('Principal required');
 for(const p of menu.commandable){const line=`inquire ${p.post}`,r=desk.execute(line);if(!r.ok)throw Error(r.message);actions.push({line,ok:true});}
 queued=desk.snapshot();reply=desk.execute('end');actions.push({line:'end',ok:reply.ok});if(!reply.ok||!reply.turn)throw Error('Week did not run');
 if(reply.snapshot.morning.menu.menuKind==='principal'&&reply.snapshot.morning.menu.reviews.length)break;
}
const warmup=[...actions];opening=desk.snapshot();
const ready=opening.morning.menu;if(ready.menuKind!=='principal'||!ready.reviews.length)throw Error('No real Union plan after bounded preparation');
const weekCommands=[...ready.reviews.map(r=>`approve ${r.post}`),'inquire us_general_in_chief','inquire us_fort_monroe'];
for(const line of weekCommands){const r=desk.execute(line);if(!r.ok)throw Error(r.message);actions.push({line,ok:true});}
queued=desk.snapshot();reply=desk.execute('end');actions.push({line:'end',ok:reply.ok});if(!reply.ok||!reply.turn)throw Error('Week did not run');
for(const [name,value] of Object.entries({firstMorning,opening,queued,reply,actions,warmup,weekCommands}))writeFileSync(`${out}/fixture-${name}.json`,JSON.stringify(value,null,2));
const summary={start:opening.date,date:reply.snapshot.date,days:reply.turn.days.length,reports:reply.turn.days.flatMap(d=>d.reports).length,reviews:ready.reviews};
writeFileSync(`${out}/fixture-summary.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
if(!summary.reviews.length)process.exitCode=1;
