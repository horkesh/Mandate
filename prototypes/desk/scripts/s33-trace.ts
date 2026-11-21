/** Read-only rule-seat diagnostic; never provides State to the desk. */
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {canonicalHash,phase0} from '@mandate/kernel';
import {createRuleSeat} from '@mandate/rule-seats';
import {seatsWorld} from '../../../packages/cli/src/seats-world.ts';
const out=resolve('../../../ByOrderOfThePresident/art-masters/S33');
mkdirSync(out,{recursive:true});
const {world,setup,worldHash}=seatsWorld('union-1861');
const initial=phase0.createState(world,setup),seat=createRuleSeat();
const days:unknown[]=[];
const run=phase0.playDays(world,initial,()=>seat,148,{freeze:false,deepChecks:false,hashEvery:148,onDay:r=>{
 if(r.day>=125)days.push({day:r.day,plans:r.state.planRecords,operations:r.state.operationRecords,battles:r.state.battleRecords});
}});
writeFileSync(`${out}/rule-log.json`,JSON.stringify(run.log,null,2));
writeFileSync(`${out}/rule-july.json`,JSON.stringify(days,null,2));
writeFileSync(`${out}/rule-summary.json`,JSON.stringify({worldHash,initialHash:canonicalHash(initial),finalHash:canonicalHash(run.state),battles:run.state.battleRecords,operations:run.state.operationRecords,doctrine:world.map.world.rules.ruleSeats,plans:world.map.world.rules.plans},null,2));
const human=JSON.parse(readFileSync(resolve('../../../ByOrderOfThePresident/art-masters/S29/completed-history/final-snapshot.json'),'utf8'));
writeFileSync(`${out}/s29-human-july.json`,JSON.stringify({history:human.history.filter((t:any)=>t.days.some((d:any)=>d.day>=125)),menu:human.morning.menu},null,2));
console.log(JSON.stringify({days:148,entries:run.log.length,battles:Object.keys(run.state.battleRecords),finalHash:canonicalHash(run.state)}));
