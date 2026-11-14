import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pack tests live with their pack, since setting names may not appear under packages/ (decision 0003).
    include: ['packages/*/test/**/*.test.ts', 'packs/*/test/**/*.test.ts'],
  },
});
