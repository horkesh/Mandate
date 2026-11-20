# S2 and S20: tick budget without behavior changes

For the lead: 3 items. S20 only, on sprint/perf from fae69bc, under 0106. Review the three optimizations separately; retain the local/CI distinction and all unmet criteria; route the inherited 1A and view-cache findings to their owners. No push, history rewrite, other sprint write or gate signature.

## S20 result

The command owner derives unposted people once per menu; the census term derives force presence once per call; the request caller reuses a deeply frozen candidate graph with its full dependency key. Every compared value and daily State hash is unchanged. The first two commits are **82f817b** and **72dfa0d**; the candidate-cache optimization and this closeout form the final commit.

| Optimization | Parent | Median paired war saving | Median paired history saving |
|---|---|---:|---:|
| Unposted roster | fae69bc | -0.541 ms | 9.282 ms |
| Force presence | 82f817b | 0.008 ms | 0.223 ms |
| Frozen candidate graph | 72dfa0d | 1.807 ms | 1.278 ms |

Each cell is the median of three alternating pair differences (before minus after), over complete 148-day runs. These changing-host observations are not additive or precise causal savings. Step 1 does not demonstrate a whole-war saving; step 2 war is unresolved within noise. All direct comparisons and all losses are retained below and under runs/s20/. No campaign was repeated for a better clock.

## S20 settled verification

One default eight-seed done check **exit 0**, **1919.19 s**, including drafting: **Phase 0 6/6; 1A 2/6**. **Budget passes this local sample** against unchanged 40/160 ms limits. The unloaded 20 ms aim and Linux CI remain unestablished. No D6 clearance or criterion waiver.

The final done check reports:

- union-1861, war by decision, 148 days: median 37.61 ms, p95 70.63 ms, max 77.73 ms over 148 days
- testbed, 120 days: median 5.66 ms, p95 11.63 ms, max 41.23 ms over 120 days
- union-1861 history run, 148 days to 1861-07-31: median 34.11 ms, p95 75.47 ms, max 120.06 ms over 148 days
- one day of all 23 drafts back to back: median 136.0 ms, p95 221.5 ms, worst 398.8 ms over 20 days; slowest single draft 175.4 ms; a capped day (the pack's 3 slowest drafts for each of 2 sides, together) at worst 120.1 ms

All 10 reported problems are retained in final-checks.json and final-done.log:

- union-1861 history run, 148 days to 1861-07-31: men_confederate (1861-07-31, day 148): confederate has 20957 men, below 100000
- union-1861 history run, 148 days to 1861-07-31: operations_union (1861-07-31, day 148): union fought 0 planned operations, below 1
- union-1861 history run, 148 days to 1861-07-31: operations_confederate (1861-07-31, day 148): confederate fought 0 planned operations, below 1
- union-1861 history run, 148 days to 1861-07-31: no operation fought a battle in the history run (2 operations, 0 battles)
- union-1861 history run, 148 days to 1861-07-31: relay holds: 1, below the record's 2
- union-1861 history run, 148 days to 1861-07-31: filter holds: 0, below the record's 1
- union-1861 history run, 148 days to 1861-07-31: trims: 0, below the record's 1
- union-1861 history run, 148 days to 1861-07-31: compliance with reservations: 44, above 9
- union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: measured in part: the victory measure does not read people/grievance (policy pushback) (its own choice). Until it does (the people's response through self-emancipation waits for enemy capacity in 1B), no D6 result for this decision counts as evidence (G-1.14c, G-1.14d)
- union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: chain unexercised: no border governor answered a call inside the horizon of 24 moves weighed (seeds 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868), so the policy's effect through border loyalty on regiments was never seen (G-1.14b)

Every final frozen daily hash matches pre-S2: **268 total (Union 148, testbed 120)**, together with daily fires, liveness, World/initial/final hashes, log counts, decisions and rejections. Replay, save/resume and saved-log replay pass for both. The unchanged day-40 fixture is reproduced byte-for-byte, SHA-256 **a3e363b949df0e7a2284241453a16b175a434c7dc320bea913e1df5f9d417b1c**.

The complete printed non-timing Phase 0 and 1A/history/sweep evidence also equals the retained S2 log, including eight seeds, eight gated decisions and 248 base calls for regiments. Only the timing verdict changes. No D6 clearance follows from return being best in 0/8 seeds.

Inventories and runtime diagnostics preceded this closeout: **eight delivery files**, **1670 other original files unchanged**, no deletion/unexpected change, **397 runtime/pack files equal the hash-verified snapshot**, workspace aliases here. Packs, bands, fixtures, locks, existing saves and signed material are preserved. No build, server or browser was needed. Fixture evidence is reused after verifying identical runtime hashes; no redundant reproduction. Evidence: runs/s20/preservation.json, parent-proof.json, profile-inventory.json and final-checks.json.

The first two actual hooks pass (139 files / 1,535 tests; 140 files / 1,538 tests; each one existing expected failure / four skips), plus typecheck, boundary, licences and decisions. Supported MANDATE_NO_GIT=1 and VITEST_MAX_WORKERS=1 are retained without weakening timeouts or selection; no-Git mode excludes the two Git-writing fixture files. The final optimization must still pass its actual hook; its exact exit/counts are in runs/s20/commit-candidate-cache.log and the final coordination status. The standing independent review remains Claude's after the sprint under 0106.

### Top twenty self costs before S2 and after S20

These are sampled self milliseconds summed by function and file over each 148-day run, restricted to stacks beneath playDays (including its single final checkpoint hash). Setup, imports, pack validation and courier-table construction are excluded; GC with no playDays ancestor is not attributed to a tick function. Anonymous callbacks from one file are grouped. All raw full-run rankings, including setup and GC, remain in the JSON files. Absolute samples on this loaded host are descriptive, not paired causal savings.

**Before S2** (tick-stack samples: 3979.6 ms).

| Rank | Function and file | Self ms |
|---:|---|---:|
| 1 | deliverReport (knowledge/knowledge.ts) | 535.0 |
| 2 | heldPost (command/command.ts) | 495.1 |
| 3 | deepFreeze (tick/freeze.ts) | 212.2 |
| 4 | (anonymous) (seats/requests.ts) | 123.2 |
| 5 | principalMenu (seats/requests.ts) | 110.4 |
| 6 | (anonymous) (seats/world.ts) | 107.6 |
| 7 | postStateOf (command/command.ts) | 106.3 |
| 8 | (anonymous) (command/command.ts) | 95.9 |
| 9 | contactEdgesOf (control-index/control-index.ts) | 85.9 |
| 10 | commandedBlocks (command/command.ts) | 84.8 |
| 11 | (anonymous) (control-index/control-index.ts) | 82.5 |
| 12 | controlEvidence (knowledge/control-beliefs.ts) | 82.4 |
| 13 | set TextDecoder () | 78.9 |
| 14 | postIdsOf (command/command.ts) | 78.7 |
| 15 | sideOfPerson (command/command.ts) | 73.3 |
| 16 | pruneKnowledge (knowledge/knowledge.ts) | 62.0 |
| 17 | __name (control-index/control-index.ts) | 49.3 |
| 18 | buildControlIndex (control-index/control-index.ts) | 46.7 |
| 19 | write (serialize/canonical.ts) | 41.5 |
| 20 | claimedControlView (view/claimed-control.ts) | 41.5 |

**After S20: war slot** (tick-stack samples: 4850.3 ms).

| Rank | Function and file | Self ms |
|---:|---|---:|
| 1 | deepFreeze (tick/freeze.ts) | 396.2 |
| 2 | heldPost (command/command.ts) | 379.4 |
| 3 | (anonymous) (seats/world.ts) | 166.1 |
| 4 | deliverReports (knowledge/knowledge.ts) | 156.7 |
| 5 | commandedBlocks (command/command.ts) | 145.3 |
| 6 | contactEdgesOf (control-index/control-index.ts) | 142.1 |
| 7 | (anonymous) (command/command.ts) | 127.1 |
| 8 | set TextDecoder () | 124.3 |
| 9 | postIdsOf (command/command.ts) | 115.0 |
| 10 | (anonymous) (control-index/control-index.ts) | 110.8 |
| 11 | postStateOf (command/command.ts) | 102.5 |
| 12 | buildControlIndex (control-index/control-index.ts) | 98.8 |
| 13 | pruneKnowledge (knowledge/knowledge.ts) | 90.8 |
| 14 | __name (control-index/control-index.ts) | 85.0 |
| 15 | sideOfPerson (command/command.ts) | 78.0 |
| 16 | controlEvidence (knowledge/control-beliefs.ts) | 77.4 |
| 17 | write (serialize/canonical.ts) | 71.5 |
| 18 | edgeLeg (supply/supply.ts) | 70.9 |
| 19 | peopleProjection (view/people.ts) | 67.3 |
| 20 | sendReport (tick/context.ts) | 66.3 |

**After S20: history slot** (tick-stack samples: 6485.1 ms).

| Rank | Function and file | Self ms |
|---:|---|---:|
| 1 | buildControlIndex (control-index/control-index.ts) | 570.6 |
| 2 | deepFreeze (tick/freeze.ts) | 526.2 |
| 3 | heldPost (command/command.ts) | 488.1 |
| 4 | (anonymous) (seats/world.ts) | 260.0 |
| 5 | deliverReports (knowledge/knowledge.ts) | 176.6 |
| 6 | postIdsOf (command/command.ts) | 171.5 |
| 7 | commandedBlocks (command/command.ts) | 168.6 |
| 8 | (anonymous) (command/command.ts) | 167.5 |
| 9 | (anonymous) (control-index/control-index.ts) | 160.9 |
| 10 | contactEdgesOf (control-index/control-index.ts) | 160.7 |
| 11 | set TextDecoder () | 153.6 |
| 12 | pruneKnowledge (knowledge/knowledge.ts) | 110.3 |
| 13 | claimedControlView (view/claimed-control.ts) | 104.3 |
| 14 | __name (control-index/control-index.ts) | 103.9 |
| 15 | controlEvidence (knowledge/control-beliefs.ts) | 101.9 |
| 16 | postStateOf (command/command.ts) | 91.9 |
| 17 | edgeLeg (supply/supply.ts) | 88.0 |
| 18 | write (serialize/canonical.ts) | 84.5 |
| 19 | sideOfPerson (command/command.ts) | 83.6 |
| 20 | generateReports (tick/generate.ts) | 82.0 |

The single retained pre-S2 profile is the common baseline for both slots: the two timing calls have the same pack, days, atWar and other options on this branch. A second historical capture was not invented or rerun. Final slots are separate fresh captures using Node command-line profiling, whose import samples are removed by the same stack filter.


Profiled median/p95 observations: final-war 28.14/57.49 ms; final-history 34.66/73.49 ms. All profiled result values equal the timed source snapshot. These profiles are descriptive; the default done check above retains its own verdict.

## S20 plan and measured changes (from fae69bc)

S20 continues only the performance lane under 0106. Read the main CODEX standing, command-line, writing and sprint rules, CLAUDE.md and 0106. Clean starting branch: sprint/perf at fae69bc. `npm ci` ran first, exit 0. Claude's independent whole-branch review remains deferred under 0106; no review subagent, push or other worktree write.

Question: which largest remaining self costs can be removed while preserving every daily hash, fixture and band? Retain a private source snapshot and inventory in ignored runs/s20, smoke three days, then inspect the retained S2 and fresh profiles. Optimize one coherent cost at a time, with focused tests first. Before shipping each candidate compare three alternating parent/change pairs for each 148-day war/history timing slot (their setup/options are currently identical), reporting median paired differences. Reject a candidate without demonstrated savings. Compare all 148 Union and 120 testbed daily hashes and complete untimed summaries; final frozen replay/resume and fixture bytes must also match. Stop expensive retries on unexpected failures until diagnosed cheaply.

Each optimization commits separately through the actual hook with the Codex footer. Use MANDATE_NO_GIT=1 and VITEST_MAX_WORKERS=1 as established in S2, without changing test selection/timeouts. Expected cost: smoke/focused checks seconds, profiles/pairs minutes, hooks several minutes each, one final default done check roughly 30 minutes. Preserve all agreed criteria and retain inherited failures. Reuse S2 pre-optimization profiles and unaffected evidence; write top-twenty self summaries before S2 and after S20. Complete inventories and runtime/preservation checks before final closeout. Never stop another lane's process or change its files.

### S20 step 1: derive the unposted roster once

The retained S2 profiles put heldPost among the largest tick self costs. Principal menus scanned posts for every person, and sideOfPerson repeated that scan plus a World roster search. The command owner now derives the unposted roster in one pass, applying the same starting-side/resigned-service rule for people with no post. Status, principal exclusion, rank ordering and every menu value remain unchanged. No global cache, State field or saved derived data.

New tests cover one enumeration for the roster, resignation versus staying, neutral people, inherited posts, relief and older-State reads. The missing helper failed first; an incomplete fixture was corrected before the green gate. Focused checks: 59 passed, typecheck exit 0. All 148 Union and 120 testbed daily hashes and entire untimed summaries match the pre-S2 baseline. Evidence: runs/s20/candidates-hash/comparison.json and candidates-testbed/comparison.json.

Three alternating pairs per slot against fae69bc are retained in runs/s20/candidates-pairs/pairs.json. War before/after medians 39.685/40.226 ms, median paired saving **-0.541 ms**; history 78.657/46.129 ms, median paired saving **9.282 ms**. These separate changing-host samples are not causal or additive. The direct menu comparison, all values equal, saves a median paired **673.757 ms over 100 calls for both principals**, with before/after medians 902.488/228.902 ms. A timestamp audit corrects this step's earlier overlap note: the micro result finished at 22:06:38.693 UTC, before the next focused command's log was created at 22:06:41.127 UTC; the shell was continuing into its hash check (runs/s20/menu-scheduling.json). No unloaded claim. All three direct pairs win (663.044–674.049 ms), supporting removal of the repeated scan despite mixed whole-run timing. No timing campaign was repeated for a nicer number.

The inspector-session profile stalled; only that lane-owned process was stopped. A bounded three-day diagnostic reproduced the stall. Node's command-line CPU profiler then passed the three-day smoke and is the final-profile method. Failed/aborted evidence remains under runs/s20. The original retained pre-S2 profile is reused.

Committed step 1 as **82f817b** through the actual hook: exit 0, 139 files, 1,535 passed, one existing expected failure, four skips; typecheck, boundary, licences and decision index pass. Duration 832.57 s. The fourth skip is the Git-executable-mode check in the private snapshot; no-Git mode also excludes the two Git-writing fixture files. A diagnostic read 100% host CPU. No retry, timeout change, selection change or bypass.

### S20 step 2: derive force presence once per term call

The history profile's selfEmancipationTerms was a remaining large self cost. Its per-region presence predicate repeatedly enumerated every force location, including when neighboring census regions asked about the same place. A local, lazy Set now enumerates locations once per call, with the same known positive strength, not-surrendered and department-side rules. No term, destination, arithmetic, source, cadence or gate content changes. No persisted or cross-State cache.

The regression first failed with four force enumerations instead of one. Three tests pass, covering all terms/destinations, movement, surrender, null/zero/negative strength, missing blocks, enemy forces, department-side changes, older-State reads, no census and fully protected census. All 268 daily hashes and complete summaries remain equal to pre-S2 (runs/s20/force-regions-hash-comparisons.json).

Three alternating parent/change pairs per slot, against step 1's runtime snapshot: median paired saving **0.008 ms war / 0.223 ms history** (runs/s20/force-regions-pairs/pairs.json). The independent medians of before/after run medians are 32.848/51.552 ms war and 31.377/30.486 ms history; subtracting those is not the paired estimator. Individual paired changes vary from -18.704 to +1.863 ms in war. The war effect is unresolved within host noise. A direct comparison on S2's hash-checked day-60 save retains every term and saves median paired **98.472 ms over 100 calls**; one pair loses, two win (runs/s20/force-pairs.json). No timing retry or unloaded/CI claim.

Committed step 2 as **72dfa0d** through the actual hook: exit 0, 140 files, 1,538 passed, one existing expected failure, four skips; typecheck, boundary, licences and decision index pass. Duration 741.97 s. No retry or changed gate.

### S20 step 3: reuse the frozen candidate graph

The remaining request-freeze cost includes rebuilding and walking the same candidate graph every morning. The final candidate reuses that deeply frozen graph in the caller's ViewCache while World, post States, service choices, ranks and statuses retain identity. The full dependency key is checked for each faction; old-State reads and a different World recompute. It shares no morning view into planning and leaves S2's post-identity finding untouched.

The new identity regression failed first with equal values in distinct arrays. Six focused files pass, 44 tests, plus typecheck. Tests cover every dependency, unrelated knowledge/day changes, older-State reads and mutation rejection. Its snapshot also matches all 268 daily hashes and complete summaries (runs/s20/candidate-cache-hash-comparisons.json).

Three alternating pairs per slot against step 2 save median paired **1.807 ms war / 1.278 ms history**. The separate before/after medians are 25.214/24.183 ms war and 26.418/25.001 ms history. War improves in all three pairs; history improves in two and loses one. The direct request construction/freeze comparison improves in all three pairs, saving median paired **50.350 ms over 100 morning reads**; all values equal. These reads use the same retained day-60 truth with only the day changed, and are not a simulated trajectory (runs/s20/request-pairs.json). The whole-run comparisons are in runs/s20/candidate-cache-pairs/pairs.json. They ran after step 2's hook with no other validation job from this lane. Parent-proof.json verifies that the four relevant source files in both parent snapshots match actual commits 82f817b and 72dfa0d after Git line-ending normalization. The final hook remains outstanding.

Runtime/preservation preflight is complete: eight delivery files, 1,670 other originals unchanged, all 397 runtime/pack files match the hash-verified final candidate snapshot, aliases resolve here, and the regenerated day-40 save is byte-identical (SHA-256 a3e363b949df0e7a2284241453a16b175a434c7dc320bea913e1df5f9d417b1c). Reuse this fixture evidence if runtime hashes remain unchanged. Final profiles and the default done check are recorded above.

## Retained S2 hand-over at fae69bc

The following is the historical S2 record, before S20; its old timing verdict is not the S20 verdict above. Git also retains its original text at fae69bc:notes/lane-s2-perf.md.

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

The retry passed and created `a3285d7`: 139 files, 1,532 passed, one existing expected failure, four skips; 617.85 s. Typecheck, boundary, licences and decision index pass. `runs/s2/commit-freeze-retry.log` retains the exact staged-snapshot gate. No history was rewritten.

### 3. Reuse the public opening bulletin

The opening bulletin and shared claims do not change when an ordinary report arrives. Previously, replacing SeatKnowledge also rebuilt that opening report wrapper, defeating ReportView reuse. A caller-owned weak cache now resolves the stored opening report once per claim array. It invalidates on replacement of either input. Existing callers without this optional cache keep their API and values.

The new regression failed first on the lost opening identity. Then 80 focused knowledge/view/ownership tests and typecheck passed. It covers ordinary report arrival, changed opening claims, replacement of the stored report, and reading the old State again. Every cached view equals a freshly derived view. All 148 Union daily hashes and the full summary match baseline (`runs/s2/opening/comparison.json`).

Three alternating direct comparisons over 61 views have identical values throughout. Before/after totals: 84.69/67.57, 64.46/60.92 and 66.24/42.12 ms; median 66.24 to 60.92 ms (5.32 ms over 61 views). The separate whole-tick comparison reads median/p95 41.46/109.39 before and 35.52/107.18 ms after. These are observed shared-host differences, not unloaded or CI claims.

### Planner backlog: experiments rejected

No planner change is retained. Three bounded implementations preserved all 23 Union draft sets but did not show a saving in warmed alternating comparisons:

- Per-edge direction maps: 38.06 to 39.94 ms over all 23 drafts.
- Two direction tables per request: 44.14 to 44.35 ms.
- Reuse of the selected land-block list: 810.71 to 816.86 ms over 20 repetitions of 23 drafts.

The latter larger batch reduced sensitivity to timer noise; it still supplied no positive evidence. All three sources, tests and measurements remain only in ignored `runs/s2/step4*` snapshots and `draft-pair*.json`. The original planner files were restored byte-for-byte. No cap, route, candidate, score, search count or drafting behavior changed. Reject shipping these caches on intuition alone.

### Final verification

Final war/history CPU profiles are retained under `runs/s2/final-war-profile/` and `final-history-profile/`. The slots use identical 148-day setup/options today. Profiled median/p95: 35.29/122.10 and 34.17/104.31 ms, inside 40/160 on this loaded host. Load records are retained. No other validation job of this lane ran during those samples. The unloaded 20 ms aim and Linux CI remain unestablished.

The testbed's 120 daily hashes and full summary match baseline. Both original and final code reproduce the day-40 save byte-for-byte (SHA-256 `a3e363b949df0e7a2284241453a16b175a434c7dc320bea913e1df5f9d417b1c`). Runtime workspace aliases point here. The final runtime matches the hash-verified step-3 snapshot; original pack, fixture, band and lock inputs are preserved. Evidence: `runtime-preflight.json`, `testbed-final/comparison.json`, `preservation-final.json`.

The one default eight-seed `npm run run:done-check -- --label s2-final-done`, including drafting, **exited 1** after about 30 minutes. **Phase 0: 5/6; 1A: 2/6. The budget remains failed.** War by decision median/p95 is **28.07/53.80 ms**; testbed **3.52/6.15**; history **52.82/126.68**, above the unchanged 40 ms median limit. The history and reference timing calls use identical setup/options; source inspection confirms this, but the cause of their different timings is not established. The separately profiled sub-40 results do not waive this failure. No timing retry or unloaded-host claim.

All eleven reported problems are retained in `runs/s2/final-checks.json` and `final-done.log`: the budget failure; the Confederate strength floor and two operation checkpoint floors; no planned operation fought; four pushback breaches; the sweep's unmeasured people/grievance channel and its unexercised border-governor chain. 1A passes unknown strength and stand-ins, while checkpoints, operation, pushback and lever sweep fail. Watched return is best 0/8, but that supplies no D6 clearance. No band, criterion or signature was changed.

The final checked (frozen) summaries match the original source on **all 268 daily hashes**, daily fires, all liveness rows, World/initial/final hashes, command counts, decision points and rejections. Replay, save/resume and saved-log replay pass for both. Union final State remains `55a35b1034c19b09f121d3ffcd311219b416e864257b43b1bb9370a33c8e7006`; testbed `69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`. The original checked/unfrozen comparisons and focused gates are reused rather than repeated after documentation changes. The evidence parser's initial UTF-8 assumption was corrected for PowerShell's UTF-16 log; no production code or campaign was rerun for it.

Final inventories and runtime diagnostics preceded this closeout: **eight delivery files**, **1,668 other original files unchanged**, no original deletion or unexpected change, and **397 runtime/pack files** matching the hash-verified source. The done check produced five core summary/save/drafting artifacts. Planner experiments are restored to the original byte hashes. No build, server, browser, push or other-worktree write. `runs/s2/final-checks.json` indexes the settled evidence.

The opening-report commit runs the same full `check` script through the hook. Its raw result is retained in `runs/s2/commit-opening.log` and the final coordination status records the counts. The supported single-worker setting used successfully for step 2 is retained; timeouts and selection stay unchanged. The required no-Git mode excludes its two Git-writing fixture files. Three timing tests remain optional; the extra skip in step 2's private snapshot was the Git-executable-mode check, whose repository was absent there. Independent review remains Claude's under 0106.

For the lead:

1. Review the three optimization commits independently. Retain the failed budget and obtain an unloaded comparison and Linux CI verdict before accepting S2; the 20 ms aim is also unestablished.
2. Keep the four reported 1A failure categories with their existing owners. No scenario or calibration work from S1 was imported.
3. Route the reproduced post-cache issue below to the view owner. Do not broaden cache sharing on this branch to conceal it.

## Proposed rulings

1. Accept consecutive report batches within the knowledge owner, flushing before every intervening reader. Rejected: changed report cadence/order, dropped reports or in-place State mutation.
2. Accept caller-owned freeze and opening-report caches keyed by immutable inputs. Rejected: global mutable caches or persisted derived data.
3. Park the measured planner caches. Rejected: retaining extra allocation and invalidation code without evidence of a saving. The 40 ms budget, 20 ms unloaded aim and all behavior criteria remain unchanged.

## Findings outside my scope

1. Lead: Linux CI decides the hosted budget; this run's history budget **failed at 52.82 ms**, and the unloaded target is not established. No push or hosted job was triggered. Other sprint lanes' work is not imported or changed.
2. View owner: an existing ViewCache can return the old post after a same-day reassignment at the same location. The final equality guard omits post identity. `runs/s2/cache-post-identity.json` reproduces cached `null` versus fresh `a_office`. Broader sharing of the morning cache into planning is therefore deferred. Fixing this changes observable behavior and is outside S2's preservation scope.
3. S1 and the existing 1A owners: checkpoint, operation, pushback and lever-sweep failures remain binding for their milestone. All original pack bands and checkpoint bounds are preserved.

## S20 proposed rulings

1. Accept the command owner's single-pass unposted roster. Rejected: retaining repeated post/World searches for every person; changing service choices, availability, rank order or menu values.
2. Accept lazy force-presence derivation local to one census-term call. Rejected: repeated neighbor scans, a cross-State presence cache, or changing any term, destination, cadence, gate content or band.
3. Accept only the fully keyed, deeply frozen candidate graph in the caller-owned cache. Rejected: caching a whole morning request, sharing the known-problematic morning view into planning, shallow-freeze shortcuts or persisted derived data.

## Findings outside my scope

1. Lead/CI: Linux performance and the unloaded 20 ms aim remain unestablished. Review the whole branch and each optimization after the sprint; nothing here reaches main by itself. The largest remaining samples include request freezing, post lookups and control-index construction. The large one-slot index sample needs isolation before selecting a next change. No additional campaign was started to chase it.
2. S1/existing 1A owners retain every checkpoint, operation, pushback and lever-sweep problem listed above. No calibration, criterion or signature changed.
3. View owner/S18: the inherited same-day post-identity cache issue remains outside S20; runs/s2/cache-post-identity.json and the retained S2 finding describe it. Its guard is unchanged. Broader cache sharing stays deferred; no behavior-changing fix was folded into these optimizations.
