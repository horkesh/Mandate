/** Prepare only the authored historical-choice reference, never simulation state. */
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
const base=resolve('../../../ByOrderOfThePresident/art-masters/S29'),out=resolve(process.env.S29_OUTPUT??base),source=resolve('../../packs/union-1861/situations');
if(relative(base,out).startsWith('..')||isAbsolute(relative(base,out)))throw Error('S29 evidence must stay in its masters folder');
mkdirSync(out,{recursive:true});
const choices=readdirSync(source).filter(n=>n.endsWith('.json')).sort().map(name=>{
 const s=JSON.parse(readFileSync(resolve(source,name),'utf8'));
 return {id:s.id,historicalDefault:s.historicalDefault,citations:s.citations};
});
writeFileSync(`${out}/history-choices.json`,JSON.stringify(choices,null,2));
console.log(`S29: ${choices.length} authored catalogue references; no game state changed.`);
