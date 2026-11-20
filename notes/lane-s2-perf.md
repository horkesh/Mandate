# S2: tick budget without behavior changes

For the lead: 1 item. Work is on `sprint/perf`, from `ceff796`, under decision 0106. `npm ci` completed first (exit 0, 51 packages, zero vulnerabilities). Independent review remains with Claude after the sprint. No push is authorized.

## Plan and evidence

The question is where the 148-day war-by-decision/history run spends its time, and which repeated work can be removed without changing any daily hash, fixture or band. Both slots currently use the same initial setup, but the final done check measures each.

1. Smoke the retained baseline for three days. Retain a CPU profile and 148 daily hashes using the unchanged source snapshot in `runs/s2/base`; runtime aliases resolve inside that snapshot.
2. Optimize the largest measured costs individually, continuing through knowledge/report scans, delivery, view caching and planner drafting. Before each hook, run focused semantic tests and compare every daily hash, liveness row and checkpoint against baseline. Stop on a mismatch, diagnose it and verify cheaply before retrying.
3. Each optimization is its own commit through the existing hook. No bypass or rewritten history. Keep raw evidence in ignored `runs/s2/`.
4. Final gates: exact `MANDATE_NO_GIT=1 npm run check` (also the per-commit hook); one default `npm run run:done-check` with drafting. Expected costs: focused tests seconds; hash/profile runs tens of seconds; each hook a few minutes; final default done check roughly 20 minutes before optimization. Stop on an unexpected failure and inspect every category before an affected rerun. Reuse unaffected passing evidence.
5. Preserve pack inputs, bands, fixtures, ownership and runtime behavior. Aim for a local unloaded median of 20 ms or less; local results do not establish Linux CI performance. Do not stop other lanes' processes to obtain a quiet machine.

## Progress

Baseline retained in `runs/s2/baseline/`: all 148 daily hashes, zero rejections, final State `55a35b1034c19b09f121d3ffcd311219b416e864257b43b1bb9370a33c8e7006`. CPU profile: `runs/s2/baseline-profile/cpu.cpuprofile`; initial median/p95 24.56/43.49 ms. Sampling includes setup; courier-table and gate-validation samples belong to setup, not the tick.

### 1. Report arrival batches

The largest runtime self sample was `deliverReport` (535 sampled ms over 148 days). Consecutive terminal reports now enter knowledge in one batch, copying the knowledge/truth tables once and sorting each affected seat once. The tick flushes before an order, verb or filter, so later readers see the same arrivals. Decision points retain message order. The knowledge owner still owns every write; nothing is stored in State or saved differently.

Focused tests cover frozen inputs, cross-seat copies of one report with first-truth precedence, received-day/id ordering, duplicates within and before a batch, control archives, opening reports and unknown seats. New API tests first failed because the batch operation was absent. Focused gate: 72 tests pass; typecheck, boundary, licences and decision index exit 0. `runs/s2/delivery/comparison.json` proves full summary equality: 148 daily hashes, all 161 liveness rows, checkpoints, decisions, log counts and rejections unchanged. Raw logs remain under `runs/s2/`.

Timing limitation: an initial post-change median was 32.11 ms on a changing shared host; a load sample was 57%. This is not a causal saving or an unloaded result. A back-to-back retained-baseline comparison follows; Linux CI remains the deciding gate.

Back-to-back 148-day median/p95: 25.90/45.04 ms before, 21.13/41.70 ms after, an observed median saving of 4.77 ms. Shared-host load still limits causal precision. Commit `8d44c89` passed the hook: 138 files, 1,532 passed, one existing expected failure, three optional timing skips; boundary, licences and decisions passed.

### 2. Reuse the request freeze ledger

`pendingRequests` previously started a fresh deep-freeze walk for each request, including shared immutable report/view graphs. It now uses a weak ledger owned by the caller's ViewCache. New requests and newly reached children remain deeply frozen. No module-global state or State field is introduced.

The regression first failed on repeated traversal, then passed with the ledger. It verifies stable report-list identity across repeated mornings and a new day, a single child traversal, mutation rejection on newly built menus, and a separate caller's fully frozen request. All 82 focused freeze/log/ownership/determinism tests pass. Typecheck caught a narrowing lost across a test callback; capturing the narrowed array fixed it, with typecheck and that test freshly passing. The production run needs no rerun for that test-only correction. All 148 daily hashes and the full summary remain identical (`runs/s2/freeze/comparison.json`). Timing and hook evidence follow in the final evidence table.

The back-to-back step-1/step-2 sample reads 55.98/96.98 ms before and 42.28/76.88 ms after (median/p95), an observed median difference of 13.69 ms. Both medians exceed 40 ms on this busy host; neither is an unloaded pass. This sample is retained rather than retried for a better number.

The first step-2 hook attempt failed only the done-check test's existing 300-second setup bound (319.78 s overall; 138 other files passed, 1,519 tests passed, one expected failure, 17 skipped including the blocked suite). A diagnostic host sample read 100% CPU. The isolated affected file then passed under the same timeout: 14 tests passed, one optional timing skip, 185.06 s. Unreached boundary/licence/decision gates also pass independently. No timeout, criterion or test changed. The justified hook retry uses the installed runner's supported `VITEST_MAX_WORKERS=1`, limiting only this lane's concurrency; all ordinary hook tests remain selected. Pending opening-cache work stays outside the index, so the hook checks the exact step-2 tree in its private snapshot.

## Proposed rulings

None. The 40 ms budget and all behavior criteria remain unchanged.

## Findings outside my scope

Linux CI decides the hosted budget. Other sprint lanes' work is not imported or changed.
