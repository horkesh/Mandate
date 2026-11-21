import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
  testDir: './test', testMatch: '**/s41-replay.spec.ts', workers: 1, maxFailures: 1,
  timeout: 1_800_000, outputDir: '../../art-masters/S41/replay/artifacts',
  reporter: [['list'], ['json', { outputFile: '../../art-masters/S41/replay/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:5317', headless: true, trace: 'retain-on-failure',
    actionTimeout: 8000, reducedMotion: 'reduce', viewport: { width: 3440, height: 1440 } },
  webServer: { command: 'node --import tsx scripts/dev.ts --port 5317 --saved-map',
    url: 'http://127.0.0.1:5317/api/desk', reuseExistingServer: false, timeout: 60_000,
    env: { ...process.env, DESK_ART_ROOT: resolve('../../../ByOrderOfThePresident/art') } },
});
