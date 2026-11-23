For the lead: 2 items.

# S85 continuation: the actual in-suite tick

Continued from `839272ab`, after the lead's hosted-CI result. One additional
optimization; the earlier accepted delivery is retained below. Headless only,
no push, no history rewrite, and no access to July or unknowns worktrees.

1. **Profile and change.** Temporary instrumentation wraps the unchanged
   test's three timed calls during the full suite, forwarding the same inputs
   and returning the identical result objects. Default **15 fork workers**, no
   selector/exclusion, `CI=1 MANDATE_TIMING=1`. Inspector setup and file writes
   are outside the timers. Independent review approved the instrumentation.

   The appointment `issued` check consumed about 625 ms of scoped samples per
   Union slot. It repeatedly parsed correspondence and minted the same key.
   The new lazy, per-menu day index collects the same eligible IDs once and
   mints once per day/query. Exact and dot-suffix matches, shortened IDs,
   negative days, visibility and appointment order retain their semantics.
   No derived State or cross-call cache is added. Four alternating direct
   pairs all improved; each checked its returned sample menu. Eleven separate
   adversarial cases and the collected regression cover the matching behavior.

   | Actual full-suite mode | War median | History median |
   |---|---:|---:|
   | `a4c0a43a`, CPU sampled | 27.01 ms | 26.61 ms |
   | `839272ab`, CPU sampled | 35.81 ms | 33.49 ms |
   | Candidate, CPU sampled | 30.28 ms | 29.60 ms |
   | Candidate, sampler off | **32.61 ms** | **31.54 ms** |

   Old/current suites have 209/226 files and 1,956/2,081 tests; their model
   workloads differ too. Both use default workers. Inclusive sample rows
   overlap; absent/inlined frames are not measured zero. Wall-clock changes
   across these shared-host samples are not an isolated causal estimate.
   Received views, command/headquarters queries and reports also grew; sent
   messages rose 11,839 to 15,396 per Union slot. Organisation/rail have distinct
   new frames, lot aggregation a small history frame, and combat changes less.

2. **Acceptance and preservation.** The sampler-off full run passes
   **2,082 tests, zero skips**, in 176.605 s. War/history p95 are
   **60.94/64.80 ms**. Both medians meet the **36 ms local aim**; the hard
   40/160 limits, original timing test, workload and worker count are unchanged.
   All **268 frozen hashes plus 148 observed history hashes**, counters, scores,
   non-clock criteria, replay and resume are exact. All eight protected readers
   match; only two existing fingerprint fields refresh. Independent source
   review found no blocking issue. Focused checks pass 115 tests, typecheck,
   one-writer and rules before the long runs.

   The warm standalone `runDoneCheck({sweepSeeds:0})` exits 0 in 127.857 s,
   war/history **32.53/32.37 ms**, Phase 0 passing. It is a timing-only check,
   not a new eight-seed result. Prior S85's full eight-seed report remains the
   latest; scorer/seed/fork code is unchanged and no new D6 clearance is claimed.
   Before this note, all 2,219 starting paths remained, 2,216 byte-identical;
   all 273 protected inputs and the 689-file runtime were verified.

Proposed [I]: retain this local correspondence index. Reject budget/test/load
changes, broader matching domains, persistent derived data and weaker keys.
The local headroom is measured; hosted Linux still needs the lead's push.

Evidence: `docs/audit/s85-evidence/loaded-appointment.json`; raw profiles,
snapshots, probes, checks and recovery: `runs/s85b/`. Actual hook/commit follow
this pre-hook note in `runs/s85b/commit-appointment.*` and the sole CODEX append.

## Findings outside my scope

Hosted CI certification, other lanes, 1A calibration/coverage, whole-branch
and gate review, July/main integration, release and pushing remain with owners.

## Earlier accepted S85 delivery at 839272ab

For the lead: 3 items.

### S85: the loaded tick budget

S85 only, `sprint/perf3`, from `e2b98c81`. Root `npm ci` passed; workspace
aliases resolve here. Work remained headless. No push or history rewrite.

1. **Three measured optimizations.** `5dd5e04e` shares the run's existing,
   dependency-checked received-view cache with sender authorization/routing.
   `34421fa9` derives menu lookup data once. The final commit skips the pure
   filter lookup for nonprincipal reports, already rejected by its predicate.
   Paired median war/history savings: sender **2.461/2.495 ms**; menu
   **3.339/3.673**; filter **1.555/unresolved** (history parents doubled).
   Each uses two alternating pairs per slot. Shared-host estimates are not
   additive; all samples/misses remain. The smaller address-book candidate
   was parked after inconclusive whole-run results.

2. **Both required timing contexts pass.** Baseline full-suite load failed
   at 46.5/46.6 ms war/history; 2,077 other tests passed. The same full
   `CI=1 MANDATE_TIMING=1 npm test` workload, with default workers and no
   no-Git exclusion, now passes **2,081/2,081**, zero skips, in 175.863 s.
   The unchanged test exposes exact medians only on failure. No-skips passes.

   The one normal eight-seed done check, including drafting, exits 0 in
   **1,663.660 s: Phase 0 6/6; supplemental 1A 2/6**.

   | Standalone slot | Median | p95 |
   |---|---:|---:|
   | War by decision | 37.43 ms | 67.09 ms |
   | Testbed | 3.28 ms | 5.07 ms |
   | History | 37.32 ms | 66.90 ms |

   Fresh cold CPU-profile medians: perf2 `a4c0a43a` 31.65/31.34 ms;
   e2 42.20/41.00; final 38.20/36.20. Sender, menu and report work grew;
   rail/organisation samples were smaller, with no consistent combat increase.
   The unchanged history peaks at 178 blocks and 294 lots. Absolute samples
   do not establish controlled Linux performance.

3. **Preservation and checks.** All **268 frozen daily hashes plus 148
   observed history hashes**, counters and scores match e2. Normal replay,
   save/resume and saved-log replay pass. All non-clock criteria, evidence and
   problems equal S82's frozen done result, including eight-seed diagnostics.
   All 2,212 original files remain; 12 source/test/registry files change,
   2,200 are byte-identical, and all 262 protected inputs are exact. The
   689-file runtime inventory preceded this note. Independent review found
   no blocking issue. Two existing fingerprints changed; all eight protected
   readers are exact.

   The menu hook's sole failure conflated unrelated `assigned` bindings.
   A three-line local rename, independently proven equivalent, passed 98
   targeted tests before the actual hook retry. The scanner stayed unchanged.
   The first two actual hooks passed 2,055 and 2,056 tests. The final hook and
   commit are recorded in `runs/s85/commit-final.*` and CODEX, after this note.

Proposed [I]: retain these three changes. Reject raised budgets, changed
assertions, reduced worker load, skipped work, persistent derived State or
weaker cache keys. Retain
every 1A hold; checkpoints, pushback, unknown strength and lever sweep fail.
The 40/160 ms limits and all pack data remain exact.

Process deviation: the initial AGENTS filename search enumerated unnamed
worktree paths. None of those files were opened or written; subsequent reads
stayed within authorized paths.

Evidence: `docs/audit/s85-evidence/`; full logs and recovery: `runs/s85/`.

## Findings outside my scope

Hosted Linux CI, S83/S86/S87, 1A calibration, whole-branch/gate review, main
integration, release and pushing remain with their owners. The lead merges
this branch after S83. Nothing is signed or cleared for main here.
