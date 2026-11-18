import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pack tests live with their pack, since setting names may not appear under packages/ (decision 0003).
    // Long-running tests (the Phase 0 done check, whole-campaign runs, tests that shell out to git) take seconds alone and
    // many times that when the suite runs files in parallel on a busy machine; the 5 s default failed `npm run check` twice
    // on tests that pass alone. One generous bound, named here and nowhere else: a hung test still fails, a slow one does not.
    testTimeout: 120_000,
    hookTimeout: 300_000,
    include: ['packages/*/test/**/*.test.ts', 'packs/*/test/**/*.test.ts', 'tools/test/**/*.test.ts'],
    // Codex's command-line lane must never invoke git, including test fixtures.
    // Exclude the hook file before collection; the ordinary gate remains full.
    exclude: process.env.MANDATE_NO_GIT === '1' ? ['tools/test/staged-check.test.ts'] : [],
    fsModuleCachePath: process.env.MANDATE_NO_GIT === '1' ? 'node_modules/.vitest-no-git' : undefined,
  },
});
