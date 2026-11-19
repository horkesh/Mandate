import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./test',testMatch:'**/sendback-notes.spec.ts',workers:1,timeout:45000,
  outputDir:'../../runs/r56/browser/artifacts',reporter:[['list'],['json',{outputFile:'../../runs/r56/browser/results.json'}]],
  use:{baseURL:'http://127.0.0.1:5286',trace:'retain-on-failure'},
  webServer:{command:'npx vite --host 127.0.0.1 --port 5286 --strictPort',url:'http://127.0.0.1:5286',reuseExistingServer:false,timeout:15000},
});
