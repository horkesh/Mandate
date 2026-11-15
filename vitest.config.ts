import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pack tests live with their pack, since setting names may not appear under packages/ (decision 0003).
    // The planner spike (lane 0.9) is a prototype outside the workspaces, but its tests run with the suite so `npm run check` covers it.
    // Long-running tests (the Phase 0 done check, whole-campaign runs, tests that shell out to git) take seconds alone and
    // many times that when the suite runs files in parallel on a busy machine; the 5 s default failed `npm run check` twice
    // on tests that pass alone. One generous bound, named here and nowhere else: a hung test still fails, a slow one does not.
    testTimeout: 120_000,
    hookTimeout: 300_000,
    include: ['packages/*/test/**/*.test.ts', 'packs/*/test/**/*.test.ts', 'tools/test/**/*.test.ts', 'prototypes/planner-spike/test/**/*.test.ts'],
  },
});
