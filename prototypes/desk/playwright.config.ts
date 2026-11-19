import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test', testMatch: '**/*.spec.ts', testIgnore: ['**/r19.spec.ts','**/r20.spec.ts','**/r21.spec.ts','**/r22.spec.ts','**/r23.spec.ts'], fullyParallel: false, workers: 1,
  timeout: 45000,
  outputDir: `../../art-masters/R17/${process.env.DESK_EVIDENCE_RUN ?? 'playwright-results'}`,
  reporter: [['list'], ['json', { outputFile: `../../art-masters/R17/${process.env.DESK_EVIDENCE_RUN ?? 'ui'}-results.json` }]],
  use: { baseURL: 'http://127.0.0.1:5274', trace: 'retain-on-failure' },
  webServer: { command: process.env.DESK_PACK === 'testbed' ? 'npm run dev -- --pack testbed' : 'npm run dev', url: 'http://127.0.0.1:5274/api/desk', reuseExistingServer: true, timeout: 30000 },
});
