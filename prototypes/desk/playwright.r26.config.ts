import {defineConfig} from '@playwright/test';
const run=process.env.DESK_EVIDENCE_RUN??'table';
export default defineConfig({testDir:'./test',testMatch:'**/r26.spec.ts',workers:1,timeout:90000,
 outputDir:`../../art-masters/R26/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`../../art-masters/R26/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
