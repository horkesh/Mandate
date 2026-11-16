# 0086: Wall-clock tests run behind a flag, not in the pre-commit hook

Status: accepted (2026-11-16). From Phase 1 lane 1.0t (`notes/lane-1.0t-timing.md`) and the standing reviewer's review (`review-lane-1.0t.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

`npm run check` is the pre-commit hook, and several sessions share one machine. A test asserting a stopwatch threshold failed under load twice in one day, then passed on retry. A check that fails on load rather than on code teaches lanes to retry or bypass the hook, which breaks hard rule 7.

## Decision

**The three stopwatch thresholds run only with `MANDATE_TIMING=1`:**
- the map's budget;
- the planner's drafting cost;
- the done check's live tick budget.

So `npm run check`, and the hook, skip them.

- **What stays in the hook:** every check without a stopwatch, such as the map's rebuild count and `budgetProblems` on given timings.
- **Where they still run:** the Linux CI job sets the flag, and a test pins that.
- **Unchanged:** `run:done-check`'s budget criterion always measures, on every machine.
- **Nothing was deleted, and no bound was widened.**

Rejected:
- **Deleting the timing tests.** The budget would go unwatched.
- **Widening the thresholds until they never fail.** Then they'd catch nothing.

## Consequences

- `CLAUDE.md` lists `MANDATE_TIMING=1 npm test`.
- **Lane 1.14:** the CI pin checks the workflow's text, not that the timed tests ran. Make the Linux job prove the gate is open, or fail it when any test is skipped.
