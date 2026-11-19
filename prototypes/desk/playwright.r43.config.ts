import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../art-masters/R43/',import.meta.url));
export default defineConfig({testDir:'./test',testMatch:'**/r43.spec.ts',workers:1,timeout:90000,maxFailures:1,
 outputDir:`${out}/${process.env.R43_RUN??'browser'}-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/${process.env.R43_RUN??'browser'}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure',actionTimeout:6000,reducedMotion:'reduce'},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
