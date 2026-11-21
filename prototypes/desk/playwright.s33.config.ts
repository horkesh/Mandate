import {defineConfig} from '@playwright/test';
import {resolve,relative,isAbsolute} from 'node:path';
const base=resolve('../../../ByOrderOfThePresident/art-masters/S33');
const out=resolve(process.env.S33_OUTPUT??base);
if(relative(base,out).startsWith('..')||isAbsolute(relative(base,out)))throw Error('S33 evidence must stay in its masters folder');
export default defineConfig({testDir:'./test',testMatch:process.env.S33_OBSERVER==='1'?'**/s33-papers.spec.ts':'**/s33.spec.ts',workers:1,timeout:900_000,maxFailures:1,
 outputDir:`${out}/artifacts`,reporter:[['list'],['json',{outputFile:`${out}/results.json`}]],
 use:{baseURL:'http://127.0.0.1:5297',headless:true,trace:'retain-on-failure',actionTimeout:8000,reducedMotion:'reduce'},
 webServer:process.env.S33_OBSERVER==='1'?undefined:{command:'node --import tsx scripts/dev.ts --port 5297 --saved-map',url:'http://127.0.0.1:5297/api/desk',reuseExistingServer:false,timeout:60000,
 env:{...process.env,DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art')}},
});
