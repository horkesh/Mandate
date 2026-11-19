import {defineConfig} from '@playwright/test';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R30';
const run=process.env.DESK_EVIDENCE_RUN??'final';
export default defineConfig({testDir:'./test',testMatch:'**/r30.spec.ts',workers:1,timeout:90000,
 outputDir:`${out}/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
