import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const profile=process.env.S39_PROFILE??'advance';
if(!['advance','training','verify'].includes(profile))throw Error('Unknown S39 profile');
const out=resolve('../../art-masters/S39',profile);
const result=process.env.S39_RESULT??'main';
if(!/^[a-z0-9-]+$/.test(result))throw Error('Invalid S39 result label');
export default defineConfig({testDir:'./test',testMatch:process.env.S39_VERIFY==='1'?'**/s39-verify.spec.ts':'**/s39-play.spec.ts',workers:1,timeout:process.env.S39_VERIFY==='1'?120_000:10_800_000,maxFailures:1,
 outputDir:`${out}/artifacts-${result}`,reporter:[['list'],['json',{outputFile:`${out}/results-${result}.json`}]],
 use:{baseURL:'http://127.0.0.1:5309',headless:true,trace:'retain-on-failure',actionTimeout:8000,reducedMotion:'reduce',viewport:{width:3440,height:1440}},
 webServer:{command:'node --import tsx scripts/dev.ts --port 5309 --saved-map',url:'http://127.0.0.1:5309/api/desk',reuseExistingServer:false,timeout:60000,
 env:{...process.env,DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art')}},
});
