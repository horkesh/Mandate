import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./test',testMatch:'**/r27-plan.spec.ts',workers:1,timeout:60000,
 outputDir:'../../art-masters/R27/plan-artifacts',reporter:[['list'],['json',{outputFile:'../../art-masters/R27/plan-results.json'}]],
 use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
 webServer:{command:'npm run dev -- --pack testbed',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
