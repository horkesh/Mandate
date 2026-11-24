For the lead: 3 items.

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

## Three independently proved pure optimisations

The following three small changes are grouped in one optimisation commit after
merge 070accce. Each has its own intermediate source identity and full proof,
not only a final combined comparison:

1. **Outstanding requests before planning:** keep the original matching
   mission/task/cohort-scope and received-outcome checks, and stop before input
   construction when a matching request is already outstanding. Four controls
   first exposed the redundant planner call and preserve the mismatched cases.
   No overall wall-clock speedup is established for this step alone.
2. **Reuse the caller's received picture:** pass the existing ViewCache into
   forceOptions/inputFor. The test first observed an extra latestEnemyClaims
   call, then proves equal options and a shared, unchanged picture. The cache's
   existing invalidation rules and local execution revalidation remain intact.
3. **Share force projections and post geometry:** the disposable planning
   ground holds an exact-State/world/faction weak cache. Every commander still
   gets his own freshly calculated cooperation values and received picture.
   New States/worlds/factions miss; cached forces/geometry are frozen and never
   enter State. A work-count test first found 12 scans instead of 6; controls
   cover equal values and invalidation. A cheap first correction fixed returning
   the original array instead of its frozen cached counterpart; no expensive
   proof had run before the correction.

Each step compares **all 416 daily hashes** (148 history, 148 war by decision,
120 testbed), World/initial hashes, daily activity, liveness, checkpoint scores,
final hashes, log counts and decision points, with zero differences/rejections.
Proofs: step1-proof.json, step2-proof.json, step3-proof.json under
`docs/audit/s153-evidence/`. Intermediate step1 force source was reconstructed
by reversing only the cache-argument patch and verified against its measured
SHA-256; the two step2 source files were copied before step3. Thus the grouped
commit does not obscure the separate measured code. Full raw summaries and
logs are in runs/s153/, with command/exits. Proof costs: 75.83,107.70,64.70 s.

The final adjacent Windows pair (same workload; candidate then pinned merged
070accce baseline, with the final profile/setup between them) is advisory:

| Run | Merged median / p95 | Final median / p95 |
| --- | ---: | ---: |
| History | 68.16 / 103.15 ms | 61.21 / 93.01 ms |
| War by decision | 52.61 / 95.37 ms | 48.85 / 79.93 ms |

This is direction, not an isolated or binding acceptance. S152's concurrent
processes were inventoried at startup and during measurement; its completion
status appeared in the shared CODEX before the final baseline. Contention and
order prevent an additive or Linux speedup claim. No foreign process stopped.

Final inclusive whole-run shares: forceOptions 13.352%, inputFor 12.626%,
viewFor 10.956%, plannerInputFor 5.622%, sidePosts 2.199%, sideForces 0.288%,
generateReports 8.061%, deriveMap 7.353%. They overlap; playDays is77.330%.
AllocationSelection 0.537%, forceRetention 0.255%, forceAnswer 0.151%,
receiveAllocations 0.046%; shared deliverDue 4.913% and deliverReports2.553%
include other messages. Live-order readiness is not separately resolved at this
sampling resolution, not claimed free. Final profiles and exact per-function
shares are retained beside the baseline; startup courierTable and checkpoint
hash work are not claimed to be tick-budget savings. Timed/profiled outputs
match the checked proof's final hashes, every retained checkpoint hash and
non-clock activity (runtime-verification.json).

**Budget remains unproved.** Only the lead's isolated hosted Linux readings can
clear median<40ms and p95<160ms on both runs. If they remain over budget, next
hash-neutral candidates for the lead are: share planner control/supply inputs
only under complete dependency identities; index repeatedly searched received
paper/token witnesses without changing order, freshness or missing knowledge;
and avoid rebuilding unused planning inputs with work-count/unknown controls.
These are candidates, not implemented or accepted behaviour changes. No rule,
value, band, floor, threshold, workload or budget is changed to reach a target.

## Validation, inventory and limits

Merge hook: exit0,293 files,2586 passed,3 expected failures,3 existing skips.
Final focused controls:162 passed in7 files; typecheck/rules/projection and
ownership checks pass. Raw command receipts identify failures and corrections.
All3899 starting tracked paths remain;638 protected pack/evidence/art/gate/scanner
inputs are exact ignoring checkout line endings. All three .fails tests and
their helper remain exact. `preservation.json` and `raw-inventory.json` were
written after runtime diagnostics, before this final narrative. Inventory183
raw files predates the final commit hook; its separate log/exit receipt is
`runs/s153/optimisations-commit-exit.json`. The commit is made only if that
ordinary hook succeeds. Formal independent review remains the lead's separate
lane; unavailable5.6 workers were not silently replaced. No new sweep, draft
campaign, browser, desktop control, push, S152 merge or write outside this
worktree (apart from the one authorised shared CODEX status) is claimed.

## Round two: hosted 52.9 / 51.0 ms on 541074d2

The lead accepted the first merge and three cuts, then reported hosted Linux
war/history medians 52.9/51.0 ms (run45412831675), still above40 ms. Round two
starts exactly at541074d2. Its retained416 hashes and measured runtime inputs
were verified before editing. No S155/S156 integration is included.

Four further pure cuts from the named families are grouped in one commit:

| Stage | Measured target and change | Separate proof |
| --- | --- | --- |
| step4 | Shared planner control/supply: keep the existing complete map signature and World guard in a caller-owned cache across mornings; cache received control indexes by exact received-picture identity and World. Civil rail movement access is rebuilt separately and never mistaken for supply ownership. | step4-proof.json vs step3 |
| step5 | Avoid unused planner-view inputs: a thin planner picture shares the exact unchanged received-picture body with the full view, leaving roster, own-position and desk projections to their actual consumers. Expiry, perception, hidden/other-seat reports and unknowns remain exact. | step5-proof.json vs step4 |
| step6 | Make unused planning inputs lazy: local supply, received control indexes and the context's in-supply set compute on demand and memoize. Holding-score paths do not build unused supply. Route consumers get the same complete values; eager callers keep validation, and missing supply still throws rather than becoming zero. | step6-proof.json vs step5 |
| step7 | Received advice/token witnesses: one pass through the existing received chronology indexes consult stances by author and assessments by person. Future/wrong-kind/unstamped papers and self-assessments retain their existing exclusions; day/hour/id order remains. No persistent index enters State. | step7-proof.json vs step6 |

Each proof covers148 history,148 war and120 testbed days: **1664 independent
daily comparisons**, all exact for State hashes, every liveness counter,
daily activity, checkpoint scores, final/initial/World hashes, decisions and
log counts, with zero rejections. Intermediate runtime source identities and
replayable patches relative to541074d2 are retained in the round2 evidence.
Each timed/profiled run also matches its checked reference outputs.

Candidate order followed measured costs as they remained: deriveMap7.353%
at entry, viewFor12.055% after ground sharing, then remaining unused supply,
then establishmentProjection4.656%. The stored-paper matching path was below
0.12% and is not indexed just to tick a box. `tokenMatches` belongs to pack
validation/startup, not the tick. The useful received-token index is the live
advice-witness loop inside establishmentProjection. Its failing work-count
control observed11->13 reads of an unchanged report when one person was
added; after indexing, reads are independent of roster size.

Cheap controls ran before each expensive proof. step4 first exposed duplicate
supply/index builds; a test-only branded-seat type correction preceded its
proof. step5 first exposed unused roster construction, and the moved received
picture body is byte-identical to541074d2 (picture-extraction.json). step6
first exposed an unused supply build; the earlier index work-count control was
updated to actually read its now-lazy index before checking reuse. step7 first
exposed repeated per-person witness reads. All corrected controls pass,
including ownership and the unchanged eight protected-reader identities.
Proof costs were91.10,136.30,73.51,59.34 seconds; no failed hash proof was retried.

Final adjacent **Windows, advisory only**, baseline541074d2 then candidate,
both reference runs per process, no test workers of our own alongside:

| Run | Baseline median / p95 | Candidate median / p95 |
| --- | ---: | ---: |
| History | 54.70 / 86.41 ms | 45.65 / 74.09 ms |
| War by decision | 50.57 / 81.92 ms | 41.34 / 68.25 ms |

S156 and another project's four-shard AWWV test run were observed during the
work; process inventories bracket measurements. S155's completion is in the
shared coordination file. No foreign process was stopped. Per-stage times
encountered changing contention and are not additive causal savings. The one
adjacent A/B answers combined direction; it does not establish hosted Linux
acceptance or predict a platform multiplier.

Final whole-run inclusive shares (overlap): forceOptions6.065%, inputFor4.586%,
viewFor8.280%, generateReports8.683%, receivedPicture5.267%, deliverDue5.225%.
At the accepted entry, forceOptions/inputFor were13.352/12.626%.
`round2/budget-path-shares.json` also scopes existing samples to playDays,
excluding direct checkpoint hashing and runner callbacks. It is contextual,
not another elapsed run; unparented GC is unresolved. In that approximation,
remaining generateReports is13.490%, viewFor12.864%, deliverDue8.117% and
sendReport6.611%. Startup validation and direct checkpoint hashes are not
proposed as tick-budget cuts.

**Return to the lead before widening scope.** The named families have these
bounded implementations, and the lower-share stored-paper path is documented.
If hosted Linux still exceeds40/160 ms, proposed next questions are: index
command-subtree strength/holdings once per immutable report phase (under
`generateReports`, preserving attribution, unknown lots and report cadence);
avoid constructing unused person views when seatIdentity needs only its own
post/side, while keeping every received institutional correction; and examine
shared message routing/holder lookups under complete assignment, location,
capital, control, network and date dependencies. These are proposals, not
implemented changes or permission to suppress work or alter behaviour.
Linux budget and headroom remain **unproved** pending the lead's push and CI.

Final runtime diagnostics and inventories preceded this narrative. All3974
starting tracked paths remain,1999 protected pack/art/evidence/gate/scanner/
dependency inputs are exact ignoring checkout line endings; all183 previously
inventoried raw files verify untouched. All three .fails tests/helper remain
exact. Round2's raw inventory covers397 pre-closeout files; final hook and
commit have their own subsequent receipt in runs/s153/round2/final-receipt.json.
The ordinary commit is made only when its hook succeeds. No scanner, band,
floor, value, workload, save shape or budget changes; no push, browser/desktop,
foreign-worktree write, or foreign-process stop. Formal review remains the
lead-owned lane. The sole outside-worktree write is the authorised final
UTF-8 Python coordination append, after a fresh read.

## For the lead

1. Review the four new416-day proofs and final hook receipt, alongside the already accepted merge and first three cuts.
2. Push and read isolated hosted Linux on both references against unchanged median<40ms/p95<160ms, with headroom. No local number clears that gate or the three July marks.
3. If still over budget, choose the next bounded question from the retained profile and proposals before any behaviour change or wider campaign.

Findings outside my scope
