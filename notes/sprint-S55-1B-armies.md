# S55: 1B armies

22 November 2026. **S55 only**, on `sprint/research-military`, from `7fbd108`. Documents only; research drafts unsigned and unapplied. [Research findings](../docs/research/2026-11-22-S55-1B-armies.md), [formation register](../docs/research/2026-11-22-S55-formations.csv), [numerical observations](../docs/research/2026-11-22-S55-strengths.csv), [source inventory](../docs/research/2026-11-22-S55-source-inventory.json).

## Work and verification plan

Read CODEX from the top, including its standing, command-line and writing rules, 0106, S1 to S10 and S55. Worked alone, headless. Root `npm ci` and typecheck pass; packages resolve within this worktree. Selected OR roster, report and dated-return passages were read, with copied scans, extracts, numerical images and logs retained in `C:/Pyrrhic/mandate-research-sources/S4/S55/`. No claim to whole-volume reading. Facts carry volume/part and printed-page citations; IDs, joins, arithmetic and proposed requests are labelled [I].

Cheap gates preceded expensive checks: scan identity/page mapping, table readability, citation/link/row checks, original-file preservation, runtime dependencies and typecheck. The required runtime question was whether the unchanged runtime retains its mandatory checks. Commands: one default eight-seed `npm run run:done-check -- --label s55-done` and the real staged-tree pre-commit hooks, each invoking `MANDATE_NO_GIT=1 npm run check`. Planned cost was 20-35 minutes for the campaign and minutes per hook on the shared host. Pass criteria were all required gates exiting 0, without changing thresholds. After failure, inspect all categories and unreached gates; no unchanged expensive retry. No extra package build or calibration was added.

## Delivered research

The additive registers contain **832 formation observations, including 520 brigade observations, and 237 numerical observations**. Thirteen requested campaign groupings cover both sides: Wilson's Creek, Ball's Bluff, Henry, Donelson, Pea Ridge, Shiloh, Yorktown, Seven Days, the Valley, Second Manassas, Maryland, Perryville and Corinth. The Valley has separate Kernstown, McDowell, late-May and June snapshots. Late-October returns mark the approach to the midterms without extending their validity into November. Return snapshots before or after a battle remain separately dated.

These are repeated observations, not 832 distinct simultaneous units or 237 resolutions of old unknowns. **615 formation observations have no numerical quantity; 28 commander cells remain explicitly held.** Each unknown strength has a scoped next-return request, not a claim that the requested manuscript survives. No individual manuscript morning return is claimed read here. All prior S4/S14/S21/S31 rows, including S31's 149 unknown rows, remain unchanged.

Army, corps/wing where established, division and brigade retain the source's hierarchy and commanders. Garrison, column, district and department titles are not promoted into armies; missing echelons are not invented. Namesake formations do not establish their current commander. Measures distinguish duty, effective, aggregate present, engaged, partial arm counts, narrative estimates and bounds. Inclusive parent/child totals, temporary attachments and successive snapshots are never additive. No parent allocation, regiment-average estimate, casualty inversion, live pack input, cast/service join or historical date/outcome trigger was made.

Seventeen copied OR scans and **259 cited selected-page records** have scan/extract hashes, printed/PDF mappings and numerical-image references. `source-preservation.json` verifies the copies against the original cached scans and prior inventories; `title-reading.json` retains volume/part identity readings. `docs-audit.json` and `docs-audit-details.json` hold citation, row, UTF-8, link and original-file checks. `data-inventory.json` holds fresh parent-cycle/window and two-sided campaign coverage checks. The initial exact-label coverage check missed the deliberately qualified Confederate approximately-30-April Yorktown label; the corrected alias was verified from its source window, with no historical row changed to satisfy the check. A cheap prose check also confirms every cited page has a retained extract.

## Proposed rulings and rejected alternatives

1. **[I] Keep dated hierarchies and measures.** Reject timeless rosters, nearby-date backfills, invented echelons and narrative estimates relabelled as certified returns. The nominal 1 October Perryville return's date/organisation caveat remains; late-October returns do not certify November strengths.
2. **[I] Preserve the June return's conflict.** OR I-XI.3 p.238 prints Fifth Corps duty columns summing to 20,560; its components sum to 19,960. The 600 difference also appears between printed army section subtotals and the grand columns. Keep the printed subtotal and separately labelled arithmetic; reject silently correcting the source or S14. Other conflicting reports and same-day returns remain attributed. Details and component figures are in the research note.
3. **[I] Keep unknowns as integration holds.** Reject parent allocation and commander inference from eponyms. Review date/attachment/accounting joins before any application, and seek command-specific returns for missing quantities. The unknown-strength criterion remains binding.
4. **[I] Submit the whole branch under 0106.** No author signature or automatic application. Rejected alternatives include treating these research counts as accepted pack headcounts or treating unrelated passing checks as a waiver of failed acceptance criteria.

## Retained verification

First batch: 145 formations, 90 brigades, 54 quantities; committed through the actual hook as `ee354f28`. The hook exits 0: **137 test files, 1,530 passed, one expected failure, three skips**; typecheck, pack boundary, licences and 106 decision-index records pass. Test duration 822.03 seconds. `hook-west.log` and `hook-west.exit.txt` retain its output/receipt. The hook is the required no-git npm check; no redundant standalone copy was run. Final batch likewise goes through the configured hook; its result belongs in `hook-final.log`, `hook-final.exit.txt` and the final Git receipt, rather than a further self-report-only commit.

The **one default done check exits 1** after roughly 44 minutes. Phase 0 passes **5/6**; supplemental 1A passes **2/6**. All **14 reported problems** were inspected:

| Category | Problems retained |
|---|---|
| Budget (4) | Union reference median 112.32 ms / p95 249.81 ms; history median 76.86 ms / p95 255.42 ms, against 40 / 160 ms. Testbed is 7.88 / 53.34 ms. Shared Windows host; no Linux or idle-host budget certification. |
| Checkpoints (3) | Confederate known strength 20,957 below 100,000; Union and Confederate planned operations fought both 0 below 1. The Union lower strength edge is explicitly nonbinding in the harness and is not an extra failed problem. |
| Operation (1) | History has two operations and no operation-fought battle. |
| Pushback (4) | Relay holds 1 below 2; filter holds 0 below 1; trims 0 below 1; reservations 44 above 9. Other reported pushback bands pass. |
| D6 (2) | Victory measure omits people/grievance response; no border governor answers within the 24-move horizon over seeds 1861-1868. Return best in 0/8 does not clear these holes. |

Behaviour, hashes, replay/resume, liveness and section-ten pass. Reference Union has 148 daily hashes, final `55a35b1034c19b09`; testbed has 120, final `69d8759b02cfa93f`. Their saved daily/turn hashes, counters, liveness, replay and resume fields match the unaffected S31 summaries exactly. Timing is measured afresh. Unknown-strength passes, but reference/history Union have no battles; this does not accept any S55 unknown. Drafting reports 23 commands, 16 with land forces: 20-day median 123.3 ms, p95 169.5 ms, worst 262.2 ms; slowest single draft 100.1 ms; capped day 202.6 ms; no unsound draft reported.

`runtime-diagnostics.json` retains all 12 criterion verdicts, the 14 problem strings, comparison fields and hashes. `run-copies/` retains both reference summaries, saves and the drafting artifact. The current CLI does not persist a separate history summary; its results are retained in `done-check.log`, with no saved history daily-hash comparison claimed. No runtime correction or repeated campaign was attempted in this documents-only lane.

## Preservation and handover

All **1,758 original tracked files** retain their baseline SHA-256; only the five S55 documents are added/extended. No other sprint worktree, prior source inventory, runtime file, pack, gate or signature is written. No push. Final inventories, runtime diagnostics and preservation checks preceded this final handover prose; hashes are refreshed after prose. Commit history is the ledger. The main CODEX receives one fresh-read UTF-8 Python append after the final hooked commit.

## Findings outside my scope

The live 1B application, service/cast crosswalks, retrieval of remaining command-specific returns, unknown-strength acceptance, inherited runtime/budget/D6 failures, whole-branch review and gate signatures remain with their owners. Nothing here clears main or changes a historical battle's date or outcome.
