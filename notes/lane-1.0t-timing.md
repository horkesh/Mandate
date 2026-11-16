# Lane 1.0t: wall-clock tests out of the pre-commit hook

A small tooling lane. Branch `timing-out-of-hook`, cut from main at 8de547c. `npm run check` is the pre-commit hook, and on a machine shared by several sessions its stopwatch thresholds failed under load on no change to the code. A check that fails on load teaches people to retry it or skip it (rule 7 wants checks that are trustworthy).

## What moved

There are three stopwatch tests. Each now runs only with `MANDATE_TIMING=1`, via `TIMING` in `packages/kernel/test/support/timing.ts`:

| Test | Its thresholds |
|---|---|
| `kernel/test/map-performance.test.ts`, "rebuilds, idles and runs a year within budget" | rebuild under 25 ms, quiet day under 2 ms, a year under 1.5 s |
| `cli/test/planner.test.ts`, the `cost` test | a testbed draft under 10 ms; the Union drafts under 40 ms (median) |
| `cli/test/done-check.test.ts`, "stays inside the tick budget on this machine" | the live budget criterion: 40 ms median, and p95 within 4x |

**What stays in the hook (no stopwatch):**
- **The map's rebuild count** over a year (at most 15) is now its own test.
- **"Passes every criterion"** checks every criterion except the budget.
- **The budget logic** on given timings (`budgetProblems(slow(…))`) is unchanged.
- **The drafting measure's soundness** (`d.sound`, posts, the day cap) is unchanged.

Nothing was deleted, and no threshold was widened.

## Where the timed tests run

- **CI:** the Linux job (`check (ubuntu-24.04)`) sets `MANDATE_TIMING=1` on its test step. Its "Steps that ran" table has a row, "wall-clock budget tests: on". The Windows job runs with it off; its test count shows the three as skipped. `tools/test/ci-workflow.test.ts` pins the flag on the Linux job.
- **`npm run run:done-check`:** its budget criterion is unchanged and always measures (CI runs it on both machines).
- **By hand:** `MANDATE_TIMING=1 npm test`, which is the line added to CLAUDE.md's command list. In PowerShell, use `$env:MANDATE_TIMING='1'; npm test`.

## Checked

- With the flag off, `npm run check` passes (1214 passed, 3 skipped).
- With `MANDATE_TIMING=1`, `npm test` passes (1217 passed, none skipped).

## Findings outside my scope

- None.
