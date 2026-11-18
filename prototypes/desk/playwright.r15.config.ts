import { defineConfig } from '@playwright/test';
import base from './playwright.config.ts';

export default defineConfig(base, {
  testMatch: '**/decoration.spec.ts',
  outputDir: '../../art-masters/R15/playwright-results',
  reporter: [['list'], ['json', { outputFile: '../../art-masters/R15/ui-results.json' }]],
});
