import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pack tests live with their pack, since setting names may not appear under packages/ (decision 0003).
    // The planner spike (lane 0.9) is a prototype outside the workspaces, but its tests run with the suite so `npm run check` covers it.
    include: ['packages/*/test/**/*.test.ts', 'packs/*/test/**/*.test.ts', 'tools/test/**/*.test.ts', 'prototypes/planner-spike/test/**/*.test.ts'],
  },
});
