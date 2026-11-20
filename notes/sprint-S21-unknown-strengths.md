# S21 unknown-strength research

Completed S21 only, 20-21 November 2026, on `sprint/research-military` from `73d6b7af81213fec8377907c7db4d9692792f7ef`. Draft research; no active input, checkpoint, runtime, gate placement or signature change. Sources and working evidence remain under `C:/Pyrrhic/mandate-research-sources/S4/S21/`, reusing S4/S14 scans in place. Review remains Claude's after the sprint under 0106.

## Delivery

All **203 original unknown rows** have dispositions: **40 quantified / 163 still unknown**. The 40 comprise **19 reported observations, 13 estimates, four source reconstructions and four upper bounds**. A limited infantry, enlisted, marching or engaged measure is not a full all-arms duty return. The same 416 force observations in 62 snapshots now contain 253 numerical entries. The original 213 numerical force rows and companion observations remain exactly unchanged.

Start with the [203-row register](../docs/research/2026-11-20-S21-strength-dispositions.csv). Each ID has searched printed pages, result, date/measure when available, related evidence and the next source. The [research note](../docs/research/2026-11-20-S21-unknown-strengths.md) explains source differences and proposed rulings. The [source inventory](../docs/research/2026-11-20-S21-source-inventory.json) links 31 scans, 2,449,912,075 bytes and 239 cited selected-page records to URLs, hashes and printed/PDF positions: 21 reused scans and ten new cited scans. An extra image-only naval PDF is retained but excluded in favour of its OCR companion. No whole-volume reading or complete original muster-roll census is claimed.

Army/corps/division counts remain non-additive. Exact dates remain dates: April 30 Yorktown duty, August 16 McDowell duty and August 21 Morell duty are not asserted for every day of their campaign windows. Pope's rounded reports differ by date. Livermore and Reed estimates stay attributed. No army share, regiment average, casualty inversion or men-per-gun/ship assumption fills a blank.

New findings include Greene's 2,504 aggregate present, Carr's stated personnel components, Nelson's entered-action count, the Shiloh compiler's separately labelled categories, Davies's October 4 all-ranks figure, and Jackson's Perryville enlisted-only marching count. Detailed printed-page citations are in the register. The January naval manning shortage, June 7 supply requisition, incomplete enemy crews, authorized complements and prisoner totals remain related evidence rather than later full-strength returns.

Conflicts remain visible: McCook 7,553 on Reed p.100 versus 7,552 on pp.102,111; Davies October 3 infantry components 2,934 versus printed 2,924; incomplete McLaws engaged cells; second East Tennessee division/cavalry attachment coverage; the separate Smith corps/department scopes. The register does not silently emend or allocate these quantities.

## Verification and preserved evidence

The concise plan was recorded before the expensive commands: first verify joins, citations, dates/measures, UTF-8, scope and dependencies; then run the required no-git project check, one default eight-seed done check with drafting, and each real commit hook. Expected cost was minutes per check and about 20-35 minutes for the campaign on a shared host. Stop on unexpected failure, inspect all categories including unreached gates, verify cheaply, and retry only the affected required command when a correction answers a new question. No package build or additional campaign was authorized or run.

Inventories, runtime diagnostics and preservation checks preceded this close-out documentation. Evidence is external under S4/S21:

| Check | Result | Evidence |
|---|---|---|
| First command, `npm ci` | exit 0; 51 packages, zero vulnerabilities | `npm-ci.log`, `.exit.txt` |
| Startup/typecheck | exit 0; own worktree dependency resolution | `typecheck.log`, `.exit.txt` |
| Complete row/scope audit | exit 0; all 203 IDs covered, original 213 numerical rows preserved | `audit.json` |
| Source inventory | all 31 hashes match acquisition/prior inventory; all 239 citation records present and hashed | `source-inventory-draft.json`, `inventory-final.log` |
| Initial required no-git check | exit 1; 136 files pass; one setup-hook timeout at unchanged 300 seconds | `npm-check.log`, `.exit.txt` |
| Unreached chained gates | boundary, licences and 106-record decision index each exit 0 | `*-after-timeout.log`, `.exit.txt` |
| Failed-file check, one worker | exit 0, unchanged tests/timeouts | `timeout-targeted.log`, `.exit.txt` |
| Required no-git check, two workers | exit 0; files/passed/expected failure/skips: **137/1530/1/3**; all chained gates pass | `npm-check-bounded.log`, `.exit.txt` |
| Eastern actual hook | exit 0; 139 files, 1,548 passed, one expected failure, three skips | `hook-east.log`, `.exit.txt` |
| Western actual hook | exit 0; same counts | `hook-west.log`, `.exit.txt` |
| One default eight-seed done check with drafting | exit 1; Phase 0 5/6, supplemental 1A 2/6; 12 problems retained | `done-check.log`, `.exit.txt`, `runtime-diagnostics.json`, `run-copies/` |
| Preservation/inventory | 1,683 base paths protected; 67 data/source artifacts hashed before close-out | `preservation.json`, `delivery-inventory.json` |

The initial check timeout occurred in `done-check.test.ts` before its tests; 1,516 tests passed and 17 were skipped in that failed attempt. No source, test, configuration or timeout was changed. The single-file check established that the unchanged fixture passes with one worker; the required check then used `VITEST_MAX_WORKERS=2` with `MANDATE_NO_GIT=1`. The runner's environment support was read locally. The final actual commit hook also uses two workers, with Git fixture tests enabled. Its result, final inventory and commit receipt are recorded in external `hook-final.log` / `.exit.txt` and `final-checks.json`. No hook bypass, criterion change, push or history rewrite.

The completed campaign is reused without a second campaign. Its reference hashes match S14: Union `55a35b1034c19b09`, testbed `69d8759b02cfa93f`. Behaviour, daily hashes, resume, liveness and section-ten checks pass. The unknown-strength harness reads zero Union battle records and four testbed records; that pass clears none of the 163 draft unknowns. No Linux CI, idle-host timing or 1B simulation claim.

All **12 problems** remain open:

- Timing: Union reference median **41.10 ms** and history median **41.02 ms**, against unchanged 40 ms; p95 **66.14/63.67 ms**, within 160 ms.
- Checkpoints: Confederate men **20,957** below 100,000; both sides fight zero planned operations, below one.
- Operation: two history operations, zero operation battles.
- Pushback: relay holds **1** below 2; filter holds **0** below 1; trims **0** below 1; reservations **44** above 9.
- Lever sweep: the grievance channel is unmeasured and no border governor answers within the measured horizon. Eight seeds/eight gated decisions and 248 base calls do not clear D6; return is best in 0/8, but that partial result is not acceptance.

## Commits and proposed rulings

1. `9211ea1`: Eastern dated returns and explicit limits, through the actual hook.
2. `13a9190`: Western battle strengths and missing-return scopes, through the actual hook.
3. The final coastal/source/close-out batch's ID and hook result are in external `final-checks.json` and the one main-CODEX status; this note needs no self-referential hash.

**[I] Preserve measured observations and explicit bounds.** Reject backdating, equating a bound with a headcount, treating a compiler estimate as an original return, or treating limited infantry/enlisted strength as all ranks and arms. Integration must deliberately map each measure before application.

**[I] Keep unresolved coverage held.** Reject unknown equals zero, nominal regiment/division/crew sizes, partial-table completion and adding overlapping parents/children. Seek original subordinate morning returns, the state/regimental returns and original muster/crew rolls named per ID. The remaining 163 are research and integration holds, not a waived acceptance criterion.

**[I] Route decisions and review to the lead.** The second East Tennessee division/cavalry coverage, print discrepancies and measure mapping need explicit review. Reject silently selecting a convenient alternative. Whole-branch and gate review remain Claude's under 0106; no author or gate-none sign-off is supplied.

## Findings outside my scope

S1/S2 and integration retain the 12 runtime problems. S12/1B owners retain cast/service joins, temporal command changes, non-overlapping scenario membership and unknown combatant coverage. S14's unsupported battle checkpoint kinds, national hold and actual stores remain unchanged. The gate reviewer retains surrender/confinement, civilian-property, Native-nation and alleged fire-on-men-in-water source subjects; no policy, effect, placement or signature is authored. Other sprint worktrees were not written.
