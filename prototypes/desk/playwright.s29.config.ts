import {defineConfig} from '@playwright/test';
import {resolve,relative,isAbsolute} from 'node:path';
const base=resolve('../../../ByOrderOfThePresident/art-masters/S29');
const out=resolve(process.env.S29_OUTPUT??base);
if(relative(base,out).startsWith('..')||isAbsolute(relative(base,out)))throw Error('S29 evidence must stay in its masters folder');
const run=process.env.S29_RUN??'history';
export default defineConfig({testDir:'./test',testMatch:process.env.S29_CHECK_CONTROLS==='1'?'**/s29-controls.spec.ts':'**/s29.spec.ts',workers:1,timeout:1_200_000,maxFailures:1,
 outputDir:`${out}/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5293',headless:true,trace:'retain-on-failure',actionTimeout:8000,reducedMotion:'reduce'},
 webServer:{command:'node --import tsx scripts/dev.ts --port 5293 --saved-map',url:'http://127.0.0.1:5293/api/desk',reuseExistingServer:false,timeout:60000,
 env:{...process.env,DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art')}},
});
