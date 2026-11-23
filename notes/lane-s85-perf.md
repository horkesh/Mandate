For the lead: 3 items.

# S85: the loaded tick budget

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
