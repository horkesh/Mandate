/**
 * Wall-clock tests are opt-in (lane 1.0t). A test that asserts a stopwatch threshold (a budget in milliseconds) runs
 * only with `MANDATE_TIMING=1`: CI sets it on its Linux job, and `npm run check` (the pre-commit hook) leaves it unset,
 * because a shared machine under load fails a stopwatch on no change to the code, and a hook that fails on load teaches
 * people to retry or skip it. Pure logic over given timings (`budgetProblems` and the like) is not a stopwatch and runs
 * always. `run:done-check`'s budget criterion is untouched: it always measures.
 */
export const TIMING = process.env['MANDATE_TIMING'] === '1';
