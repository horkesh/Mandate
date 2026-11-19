import {defineConfig} from '@playwright/test';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R29';
export default defineConfig({testDir:'./test',testMatch:'**/r29-plan.spec.ts',workers:1,timeout:60000,
 outputDir:`${out}/plan-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/plan-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --pack testbed',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
