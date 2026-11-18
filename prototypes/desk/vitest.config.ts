import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { fsModuleCachePath: fileURLToPath(new URL('./node_modules/.vitest-cache',import.meta.url)), include: ['test/**/*.test.ts'], testTimeout: 120000 } });
