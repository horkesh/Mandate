import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./test',testMatch:process.env.DESK_R19_MAP==='1'?'**/map.spec.ts':'**/r19.spec.ts',workers:1,fullyParallel:false,timeout:120000,
  outputDir:`../../art-masters/R19/${process.env.DESK_EVIDENCE_RUN??'browser'}-artifacts`,
  reporter:[['list'],['json',{outputFile:`../../art-masters/R19/${process.env.DESK_EVIDENCE_RUN??'browser'}-results.json`}]],
  use:{baseURL:'http://127.0.0.1:5274',viewport:{width:1920,height:1080},trace:'retain-on-failure'},
  webServer:{command:`npm run dev${process.env.DESK_PACK==='testbed'?' -- --pack testbed':''}${process.env.DESK_AT_WAR==='1'?' -- --at-war':''}`,url:'http://127.0.0.1:5274/api/desk',reuseExistingServer:false,timeout:30000},
});
