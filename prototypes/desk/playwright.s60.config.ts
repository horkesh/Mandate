import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

// S60: the desk's look and its layout at laptop sizes. Headless Chromium on its
// own port; captures and results go to the ignored art-masters/S60 folder.
const phase = process.env.S60_PHASE ?? 'after';
const port = Number(process.env.S60_PORT ?? 5362);
// S60_SPECS (comma-separated globs) reruns existing desk specs on this port
// instead, as a regression check of the restyled desk.
const specs = process.env.S60_SPECS ? process.env.S60_SPECS.split(',') : '**/s60-*.spec.ts';
export default defineConfig({
  testDir: './test', testMatch: specs, workers: 1, fullyParallel: false,
  timeout: 90_000, outputDir: `../../art-masters/S60/${phase}-artifacts`,
  reporter: [['list'], ['json', { outputFile: `../../art-masters/S60/${phase}-results.json` }]],
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true, trace: 'retain-on-failure' },
  webServer: { command: `node --import tsx scripts/dev.ts --port ${port} --saved-map`,
    url: `http://127.0.0.1:${port}/api/desk`, reuseExistingServer: false, timeout: 90_000,
    env: { ...process.env, DESK_ART_ROOT: process.env.DESK_ART_ROOT ?? resolve('../../../../../art') } },
});
