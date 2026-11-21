import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const out=resolve('../../art-masters/S47/politics');
export default defineConfig({testDir:'./test',testMatch:'**/s47-play.spec.ts',workers:1,timeout:10_800_000,maxFailures:1,
 outputDir:`${out}/artifacts`,reporter:[['list'],['json',{outputFile:`${out}/results.json`}]],
 use:{baseURL:'http://127.0.0.1:5347',headless:true,trace:'retain-on-failure',actionTimeout:8000,reducedMotion:'reduce',viewport:{width:3440,height:1440}},
 webServer:{command:'node --import tsx scripts/dev.ts --port 5347 --saved-map',url:'http://127.0.0.1:5347/api/desk',reuseExistingServer:false,timeout:60000,
 env:{...process.env,DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art')}},
});
