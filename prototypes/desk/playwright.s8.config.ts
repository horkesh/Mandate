import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
const out=resolve(process.env.S8_EVIDENCE??'../../../ByOrderOfThePresident/art-masters/S8');
const run=process.env.S8_RUN??'browser';
export default defineConfig({testDir:'./test',testMatch:'**/s8.spec.ts',workers:1,timeout:60000,maxFailures:1,
 outputDir:`${out}/${run}-artifacts`,reporter:[['list'],['json',{outputFile:`${out}/${run}-results.json`}]],
 use:{baseURL:'http://127.0.0.1:5288',trace:'retain-on-failure',actionTimeout:7000,reducedMotion:'reduce'},
 webServer:{command:process.env.S8_STATIC==='1'?'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5288 --strictPort':'node --import tsx scripts/dev.ts --port 5288 --saved-map --at-war',url:process.env.S8_STATIC==='1'?'http://127.0.0.1:5288':'http://127.0.0.1:5288/api/desk',reuseExistingServer:false,timeout:60000,
  env:{DESK_ART_ROOT:resolve('../../../ByOrderOfThePresident/art'),...process.env}},
});
