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

## Proposed rulings

None. The 40 ms budget and all behavior criteria remain unchanged.

## Findings outside my scope

Linux CI decides the hosted budget. Other sprint lanes' work is not imported or changed.
