# S12: the cast's second round, officer pool and governors

Research handover, 20 November 2026. S12 only; docs only on `sprint/research-cast`, from pinned `2c1cea09ab01994e1f88f73c04b2071634b69d94`. Read CODEX from the top, its standing/command-line/writing rules, the S1–S10 message and S12, CLAUDE, 0106 and the relevant temporal boundaries. Independent review is deferred to Claude under 0106. S6 remains intact. Nothing is pushed.

## Work and verification

The authorized plan was three coherent research batches, cheapest rejection checks first, one required campaign and each commit through the normal hook. Delivery starts at [the research index](../docs/research/S12/README.md), [officer note](../docs/research/S12/officers.md), [governor note](../docs/research/S12/governors.md) and [source/reading record](../docs/research/S12/sources.md). Scans, workings and logs stay in `C:/Pyrrhic/mandate-research-sources/S6/S12/`.

| Delivery | Final scope |
|---|---|
| S6 second round | All 464 original HOLD keys and exact prior fields preserved, seven columns. 31 cells newly read, 433 explicitly carried; ten dated CHANGE proposals, 454 remaining HOLDs; 39 observer records. S6's 68 positive rows untouched. |
| Officers | 252 command entries, 239 research handles (139 Union, 100 Confederate), 128 literal named register excerpts, 101 manually transcribed Confederate rank events. Shiloh, Maryland and four retrospectively identified Harpers Ferry brigades. Three assessment proposals; 2,148 common cells HOLD. |
| Governors | 55 office records, including predecessors, acting/military and competing authorities; 27 sourced prewar histories. Six boundary records, including five prospective 1863 governors and the unresolved Reynolds lead. Four common-field proposals, 491 HOLDs. Three of these proposals also appear in the cast second round; they are not independent extra witnesses. |

This is a substantial dated pool, not an exhaustive resolved census of every 1862 brigade or a continuous governor-tenure table. Identity joins and missing histories remain explicit. No office or service length becomes an experience stat or organising gift.

No later judgment becomes a March-1861 starting cell. No appointment, victory, editorial verdict or highest eventual rank substitutes for a contemporary appraisal or dated commission. Unsupported fields stay HOLD. Bands are **[I]**; no exact numeric centre is inferred. Sensitive observations remain unsigned research drafts. **Do not use the old apply:** its HOLD clears a field, whereas these research HOLDs preserve separately vetted evidence. No accepted decision, pack person/stat, placement, signature, gate hash, calibration or runtime change is made.

`npm ci` ran first, exit 0: 51 packages, zero vulnerabilities. Typecheck and three opening government tests passed. Logs: `npm-ci.log`, `preflight-typecheck.log`, `preflight-opening.log`.

The one required `npm run run:done-check` completed, exit 0: **Phase 0 6/6; supplemental 1A 2/6**. Checkpoints, operation, pushback and lever-sweep fail. Confederate known strength is 20,957 below 100,000; both sides fight zero planned operations; relay/filter/trim lower bounds and reservations upper bound fail; D6 remains partly measured and its border-governor chain unexercised. These remain failures; the default exit 0 does not mean 1A passes. `done-check.log`/`.exit`, copied `runtime/done-check/` and `runtime/done-check-drafting/` retain the evidence.

The campaign question was whether the unchanged branch baseline satisfies inherited run rules. Expected cost was roughly half an hour on the shared host; stop after one campaign, retaining every failure. That rule was followed. Timings: Union median 36.12 ms/p95 59.43; testbed 2.95/4.84; history 37.00/62.11. Drafting is diagnostic information, not a separate acceptance criterion. No retry, tuning, build or further calibration/timing campaign. Unchanged successful campaign evidence is reused.

The separately required `MANDATE_NO_GIT=1 npm run check` passed, exit 0: **137 files; 1,530 passed, one expected failure, three skips**; typecheck, boundary, licences and decisions passed. Git-dependent files are outside that mode; normal hooks cover them. `check-no-git.log`/`.exit`.

Each batch commits through the mandatory hook with the Codex trailer. Planned cost was several minutes per hook; stop an unexpected failure, inspect all categories and verify cheaply before any retry. No bypass or timeout change was made.

- `e8dd4e9`: Chase diary and HOLD preservation. Normal hook exit 0: 139 files, 1,548 passed, one expected failure, three skips; all other check gates passed. Initial citation audit found a missing p62 scan, subsequently acquired and audit passed. `commit-round2.log`.
- `15411e7`: officer command/register batch. First hook exit 1: one setup exceeded 300,000 ms in `done-check.test.ts`; 138 other files passed. Isolated affected file passed unchanged: 14 passed, one skip, exit 0, 230.60 seconds. The three not-yet-reached boundary/licence/decision gates passed separately. One retry through the unchanged hook passed: 139 files, 1,546 passed, one expected failure, five skips. Host contention/run variability is a hypothesis, not a proven root cause. `hook-timeout-diagnosis.json`, `commit-officers.log`, `isolated-donecheck.log`, `unreached-*.log`, `commit-officers-retry.log`.
- Final governor/correspondence batch is committed only through the mandatory normal hook; its exact commit/result are in Git and `commit-governors.log`/`.exit`. No self-referential hash is inserted into this file.

## Retention and protection

The final source audit passes: **296 CSV-cited printed pages, 15 source groups, all cited JPEGs present with matching SHA-256; 372 retained selected images, 422,776,065 bytes**, including leads beyond the cited set. [Manifest](../docs/research/S12/scan-manifest.json). Image/reading limits are explicit; every retained image is not claimed visually inspected.

Visual checks rejected the initial Wisconsin/California image mappings; corrected Wisconsin p90/p114 and California p693 were visually read. Rejected images/mappings remain external. Automatic Confederate first-date extraction was also rejected; only manually curated events enter the table. Search snippets and unused modern summaries source no delivered fact.

`audit-final.json`/`.log`, `delivery-inventory.json` and `source-inventory.json` retain CSV shapes, exact S6 joins/prior fields, nine cells per handle, positive witnesses, inference/temporal labels, source formats/hashes, UTF-8/local links and protection evidence. Inventory/runtime/protection checks preceded this close-out. S6, packages, packs, tools, decisions, dependencies, hooks and this worktree's CODEX are unchanged from base. The authorized main-CODEX status append follows a fresh read; no other sprint research is edited.

## Proposed rulings

- [I] Preserve separate observer assessments when witnesses disagree; reject averaging hostile and favorable voices into an invented national reputation.
- [I] Use command snapshots and distinct commission events; reject carrying a rank or temporary command across an unproved interval.
- [I] Separate election, appointment, confirmation, arrival and assumption. Reject stale recipient lists and prospective 1863 governors backdated into 1862.
- [I] Retain role-bounded qualitative proposals, directed relationships, source conflicts and OCR ambiguity. Reject exact numerical centres, self-appraisal as gift proof, later biography as a contemporary leg and silent emendation from memory.

Remaining research HOLDs: 433 carried S6 cells and 454 total second-round HOLDs; officer identity/service joins and expansion beyond the selected command organizations; 28 governor prewar histories; exact handover dates identified in the tables; Arkansas names/assumption interval; December Missouri succession; General Hunter's given name in Chase. Cullum collation is not claimed complete. These limits do not waive an acceptance criterion.

## Findings outside my scope

- Claude owns independent review, identity acceptance, temporal visibility, assessment/promotion mechanics and proposed rulings. A research handle is not ready for automatic apply.
- S3 owns election mechanics/quantities; the gate reviewer owns later use of slavery, conscription, coerced labor, prisoner and civilian-policy passages. No placements or signatures were made.
- Runtime owners retain the four supplemental 1A failures; this docs lane neither tunes nor waives them.
