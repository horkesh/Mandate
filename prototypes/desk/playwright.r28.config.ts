import {defineConfig} from '@playwright/test';
const run=process.env.DESK_EVIDENCE_RUN??'final';
export default defineConfig({testDir:'./test',testMatch:'**/r28.spec.ts',workers:1,timeout:120000,
 outputDir:`../../art-masters/R28/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`../../art-masters/R28/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure'},
 webServer:{command:process.env.DESK_R28_PREFLIGHT==='1'?'npx tsx scripts/r28-preflight.ts':'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
