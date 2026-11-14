# Planner spike (Phase 0 lane 0.9)

A prototype of the kernel's candidate-plan drafter (decision 0026, FOUNDATION section 12 row 0.9), on the testbed pack's `opening` start. Results and choices: [`notes/lane-0.9-planner.md`](../../notes/lane-0.9-planner.md).

```bash
npx tsx prototypes/planner-spike/src/cli.ts       # every case's draft set for four seated generals, with terms and gates
npx tsx prototypes/planner-spike/src/measure.ts   # cost, sensitivity sweeps, term liveness, one edit of each kind
npx vitest run prototypes/planner-spike           # the spike's tests (also part of npm run check)
```

The planner itself is `types`, `context`, `route`, `profile`, `axes`, `score`, `methods`, `planner` and `edits` (about 1,330 lines with comments). It is written as kernel code (integer permille, stable tie-breaks, no randomness or clock) so it can be ported, and imports only the kernel's public API. `testbed-cases.ts`, `cli.ts` and `measure.ts` are fixtures and tools.

When the spike is retired, remove its two include lines from the root `tsconfig.json` and `vitest.config.ts`.
