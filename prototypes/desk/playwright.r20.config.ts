import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./test',testMatch:process.env.DESK_R20_MAP==='1'?'**/map.spec.ts':'**/r20.spec.ts',workers:1,fullyParallel:false,timeout:60000,
  outputDir:`../../art-masters/R20/${process.env.DESK_EVIDENCE_RUN??'browser'}-artifacts`,
  reporter:[['list'],['json',{outputFile:`../../art-masters/R20/${process.env.DESK_EVIDENCE_RUN??'browser'}-results.json`}]],
  use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
  webServer:{command:process.env.DESK_PACK==='testbed'?'npm run dev -- --pack testbed':'npm run dev -- --at-war',url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000},
});
