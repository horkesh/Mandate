import {defineConfig} from '@playwright/test';
const out='C:/Pyrrhic/ByOrderOfThePresident/art-masters/R32';
export default defineConfig({testDir:'./test',testMatch:'**/r32.spec.ts',workers:1,timeout:60000,
 outputDir:`${out}/browser-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/browser-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure',actionTimeout:5000},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
