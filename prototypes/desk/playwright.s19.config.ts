import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const out=resolve('../../../ByOrderOfThePresident/art-masters/S19');
const run=process.env.S19_RUN??'browser';
export default defineConfig({testDir:'./test',testMatch:'**/s19.spec.ts',workers:1,timeout:60000,maxFailures:1,
 outputDir:`${out}/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5291',trace:'retain-on-failure',actionTimeout:7000,reducedMotion:'reduce'},
 webServer:{command:'node --import tsx scripts/dev.ts --port 5291 --saved-map --at-war',url:'http://127.0.0.1:5291/api/desk',reuseExistingServer:false,timeout:60000,env:{DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art'),...process.env}},
});
