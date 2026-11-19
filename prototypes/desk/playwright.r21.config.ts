import { defineConfig } from '@playwright/test';
const run=process.env.DESK_EVIDENCE_RUN??'browser';
export default defineConfig({
  testDir:'./test',testMatch:process.env.DESK_R21_MAP==='1'?'**/map.spec.ts':'**/r21.spec.ts',workers:1,fullyParallel:false,timeout:60000,
  outputDir:`../../art-masters/R21/${run}-artifacts`,
  reporter:[['list'],['json',{outputFile:`../../art-masters/R21/${run}-results.json`}]],
  use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
  webServer:{command:process.env.DESK_PACK==='testbed'?'npm run dev -- --pack testbed':'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000},
});
