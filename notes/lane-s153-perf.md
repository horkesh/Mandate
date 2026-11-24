For the lead: 2 items.

# S153: merge July and profile the allocation tick

Entry 7d3c1bcd, incoming de3a6601, only sprint/allocate-july. npm ci passed.
Headless only. S152 and every other worktree remain read-only; no push.

## Merge conflicts (all nine)

- authority.ts: retained S150 selected-lot ceilings/retained remainders and its existing missing-container guard, which already subsumes S145. Kept S145 regressions from the incoming branch.
- local-actions.ts: kept S146 exact-State/world/day/person cache, received-view reuse, early mandate filters and lazy planning, together with S150 principal answers, requests, allocations, receipt fulfilments, ranking and shared planning ground. Execution still revalidates a fresh State.
- requests.ts and tick.ts: pass both the existing received-view cache and shared planning ground; retain both branches' request and tick changes.
- serialize/save.ts: schema 8 remains current; the 6->7 no-op migration describes both optional allocation and task records; 7->8 retains causal service receipts and needs. No old history invented.
- s123-mandates.test.ts: retain the incoming S145 movement/repartition imports and both branches' tests.
- s124-office-offers.test.ts: retain the incoming CURRENT_SAVE_SCHEMA assertion and all allocation-side tests.
- testbed-seats-day40.json: regenerate with tools/make-save-fixture.ts, combining S150 service receipts with S148 tasks and combat terms. First attempt with S150's fixture failed only replay/resume; retained diagnosis identifies changes exclusively in operationRecords/battleRecords. Targeted correction passes 7/7.
- projection-derivations.json: retain both reasons/citations; certify exact union of both parents' protected-reader identities, all eight roots. No scanner or finding baseline weakened. The first full hook passed 2,585 tests, with only the reviewed-read certificate for generate.ts stale after S146 moved its unchanged fresh-array sort from line 228 to 247. Updated exactly that hash/location; the reason and scanner stay intact. Two earlier quick hook attempts rejected measurement-tool typing; type-only corrections reuse all runtime proofs.

## Hash evidence and changed premise

The one 148-day history proof differs on days 4-148 (145 hashes). Days 1-3,
World, initial State, daily activity, all liveness counters and checkpoint scores
are exact. First divergent State, replayed against pinned S150 for four days,
differs ONLY at operationRecords.op:us_general_in_chief:4.opTasks: S148 records
the default local_defence task. Thus the brief's expectation that only S145
could change a hash is false: de3a6601 also contains accepted S148/S139 tasks.
These remain intact. No S153 behaviour change is used to erase the difference.
Complete before/after hashes: docs/audit/s153-evidence/merge-comparison.json;
first cause: merge-first-cause.json. Other two merged references establish the
pre-optimisation baseline (148 war and 120 testbed days). No old task history
is fabricated. The full hook supplies repeat/replay/resume checks separately.

## Profile and advisory timing

Whole history CPU profile, checks/replay disabled, checkpoint hashing retained:
forceOptions 18.367%, inputFor 17.372%, viewFor 12.949%, plannerInputFor 8.422%,
generateReports 7.974%, deriveMap 7.053%, sidePosts 4.651%. Inclusive shares overlap;
playDays is 78.550% of samples, with initial pack setup/final hash also sampled.
Allocation/retention/request work adds forceOptions/inputFor and planning input;
receipt/report delivery remains visible (deliverDue 4.587%, deliverReports 2.185%
self). Live-order paths are present but not separately resolved; no zero-cost
claim. Per-function shares and raw V8 samples: runs/s153/merge-profile/.
S152's Codex process at sprint-allocate is concurrent; the process inventory is
runs/s153/processes-start.json. No other process was stopped.
Unprofiled Windows history median/p95 65.04/104.86 ms; war 52.69/92.14 ms.
Local contention means direction only. Linux 40/160 ms remains binding.

The three .fails tests and their helper are byte-identical to S150. No band,
floor, value, criterion, pack input or budget changes. Formal independent review
is not claimed: requested 5.6 models unavailable, no substituted worker.

## For the lead

1. Review the merge's inherited S148 hash changes and subsequent independent optimisation proofs.
2. Push only from the lead and read isolated hosted Linux for both reference runs. Neither local timing nor the three marks clears the merge gate into sprint/july.

Findings outside my scope
