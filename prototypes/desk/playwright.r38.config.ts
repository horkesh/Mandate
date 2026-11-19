import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL('../../../ByOrderOfThePresident/art-masters/R38/',import.meta.url));
export default defineConfig({testDir:'./test',testMatch:'**/r38.spec.ts',workers:1,timeout:180000,maxFailures:1,
 outputDir:`${out}/${process.env.R38_RUN??'browser-artifacts-r38'}`,reporter:[['list'],['json',{outputFile:`${out}/browser-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5274',trace:'retain-on-failure',actionTimeout:5000,reducedMotion:'reduce'},
 webServer:{command:'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000}});
