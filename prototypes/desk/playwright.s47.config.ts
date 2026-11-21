import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const verify=process.env.S47_VERIFY==='1';
const result=process.env.S47_RESULT??'initial';
if(!/^[a-z0-9-]+$/.test(result))throw Error('Invalid result label');
const out=resolve(verify?'../../art-masters/S47/verify':'../../art-masters/S47/politics');
export default defineConfig({testDir:'./test',testMatch:verify?'**/s47-verify.spec.ts':'**/s47-play.spec.ts',workers:1,timeout:verify?120_000:10_800_000,maxFailures:1,
 outputDir:`${out}/artifacts-${result}`,reporter:[['list'],['json',{outputFile:`${out}/results-${result}.json`}]],
 use:{baseURL:'http://127.0.0.1:5347',headless:true,trace:'retain-on-failure',actionTimeout:8000,reducedMotion:'reduce',viewport:{width:3440,height:1440}},
 webServer:{command:'node --import tsx scripts/dev.ts --port 5347 --saved-map',url:'http://127.0.0.1:5347/api/desk',reuseExistingServer:false,timeout:60000,
 env:{...process.env,DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art')}},
});
