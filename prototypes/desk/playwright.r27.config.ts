import {defineConfig} from '@playwright/test';
const run=process.env.DESK_EVIDENCE_RUN??'views';
export default defineConfig({testDir:'./test',testMatch:'**/r27.spec.ts',workers:1,timeout:60000,
 outputDir:`../../art-masters/R27/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`../../art-masters/R27/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
