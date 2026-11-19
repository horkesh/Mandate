import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./test',testMatch:'**/r54.spec.ts',workers:1,timeout:30000,maxFailures:1,
  outputDir:'../../runs/r54/browser/artifacts',reporter:[['list'],['json',{outputFile:'../../runs/r54/browser/results.json'}]],
  use:{baseURL:'http://127.0.0.1:5284',trace:'retain-on-failure',actionTimeout:6000,reducedMotion:'reduce'},
  webServer:{command:'npx vite --host 127.0.0.1 --port 5284 --strictPort',url:'http://127.0.0.1:5284/test/r54-fixture.html',reuseExistingServer:false,timeout:30000}});
