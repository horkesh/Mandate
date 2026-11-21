import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './test', testMatch: '**/s45-map.spec.ts', workers: 1,
  timeout: 60_000, outputDir: `../../art-masters/S45/${process.env.S45_PHASE??'after'}-artifacts`,
  reporter: [['list'], ['json', { outputFile: `../../art-masters/S45/${process.env.S45_PHASE??'after'}-results.json` }]],
  use: { baseURL: 'http://127.0.0.1:5345', headless: true,
    trace: 'retain-on-failure', reducedMotion: 'reduce' },
  webServer: { command: 'node --import tsx scripts/dev.ts --port 5345 --saved-map',
    url: 'http://127.0.0.1:5345/api/desk', reuseExistingServer: false, timeout: 60_000,
    env: { ...process.env, DESK_ART_ROOT: process.env.DESK_ART_ROOT ?? resolve('../../../ByOrderOfThePresident/art') } },
});
