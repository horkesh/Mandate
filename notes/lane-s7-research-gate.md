# S7: sources for the gate's 1B topics

For the lead: 2 items, listed below; no proposed design ruling.

Status: research delivered for post-sprint review, 20 November 2026. Branch `sprint/research-gate`, cut from main at `ceff796`. S7 only, under decision 0106. No placements, authored situations, pack edits or signatures. The commit identity and actual hook verdict are recorded in the run's one final S7 status in the main checkout's CODEX.md; nothing is pushed.

## Scope and method

Read `docs/design/SENSITIVE-HISTORY.md` first, then the main checkout's CODEX standing, command-line and writing rules, S7, decision 0106, CLAUDE and LANES. The research window is August 1861 through November 1862; earlier documents establish the law or an ongoing practice, and later evidence is dated explicitly.

Read sources, not search snippets, support facts. Citations identify printed pages, not viewer offsets. Inferences carry [I]. An official's count, allegation or policy is attributed; an order does not prove execution. Retain conflicting counts and denominators rather than averaging them. Scans, OCR, retrieval logs and SHA-256 inventories stay in `C:/Pyrrhic/mandate-research-sources/S7/`.

Prioritize the old notes' gaps: freedpeople's camps and plantation conditions; Hunter and other 1862 Black enlistment; prison conditions on both sides; East Tennessee and civilian reprisals. Read the statutes and presidential orders directly alongside those reports. Extend within section 3's 1B topics after the core, keeping later events distinct.

## Validation plan

First check dependencies, branch, changed-path scope, links, citation locators and scan readability. `npm ci` exited 0 (51 packages added; zero vulnerabilities); log: `C:/Pyrrhic/mandate-research-sources/S7/logs/npm-ci.log`. Run focused documentation and preservation checks before each coherent commit, then commit through the existing hook. The hook runs the required root check. Retain logs and report its actual exit; do not retry an unexpected failure without diagnosis. No simulation calibration or new performance campaign is part of this research lane. The standing batch additionally requests the default done check: inspect prerequisites first, run once, retain failures outside S7, and do not change simulation or bands to make it pass.

## Stopping point and remaining work

Five subject notes, a [coverage/source index](../docs/research/2026-11-20-s7-gate-research-index.md) and [CSV manifest](../docs/research/s7-sources.csv) cover the law and orders; freedpeople and Black service; prisoners and exchange; guerrillas, civilian coercion and Big Eagle; and Washington camps, Jacobs and Camp Barker. The adjacent backlog reached Johnson's submitted war-aims resolution, naval entry, Black criticism of colonization, Big Eagle and Wisconsin's November response. All are research for later review; no gate or pack file changed.

Material findings: the March Article of War already restricts military returns before July's distinct provisions; Pierce reports coerced recruitment contrary to an unqualified reading of Hunter; the naval September acknowledgment gives a separate rating/pay path; the prison papers expose defective denominators and political-exchange exclusions; East Tennessee has both execution reports and Confederate objections to arbitrary arrest. The Camp Barker scan, Jacobs's contemporary report, Taylor's 1902 account, the Douglass editorial and Big Eagle's 1894 interview add different kinds of voices, with provenance stated.

The retained-source inventory has **218 artifacts in 23 source groups, including 199 scan files (19 PDFs and 180 JPEGs)**, totaling 667,961,695 bytes. Checksums match retrieval receipts; PDFs open and JPEGs verify. All **121 cited image locators** checked are present; seven Markdown documents, 29 local links and the 218 manifest rows pass the documentation check. Large newspaper images produced a Pillow size warning, not a corrupt-image failure. Inspection renderings/crops remain beside their originals. Evidence: `source-inventory-result.json`, `documentation-verification.json`, and `logs/source-inventory-final.log` under the external S7 folder.

Validation, without changing code, bands, timeouts or test configuration:

- `npm ci`, typecheck, boundary, licence and decision checks: exit 0; separate logs under external `logs/`.
- `MANDATE_NO_GIT=1 npm run check`: exit 1, 319 seconds. 136 of 137 files passed, 1,516 tests passed, one expected failure and 17 skips; `done-check.test.ts` beforeAll timed out at 300 seconds. The chained later checks were not reached, so their independent successful runs matter. It overlapped the default campaign; contention is plausible, not proven.
- After that campaign ended, `MANDATE_NO_GIT=1 npm exec -- vitest run packages/cli/test/done-check.test.ts`: exit 0, 14 passed and one skipped; Vitest 162.96 seconds, process 172.10. This verifies the timed-out file under the unchanged timeout. The earlier full check is not relabeled a pass.
- Default `npm run run:done-check -- --label s7-baseline`, with all eight sweep seeds and drafting: exit 1, 2,045.50 seconds. Phase 0 behavior/hash/resume/liveness/section-ten passed; budget failed (Union median 62.94 ms; history median 104.81, p95 217.96). 1A checkpoints, operation, pushback and lever-sweep failed; unknown-strength and stand-ins passed. Those are recorded failures, not waived criteria or S7 changes. No repeat campaign was run. These are shared-host observations, not unloaded or CI measurements.
- `git diff --check`, allowed-path checks and comparison of packages, packs, tools, prototypes, art and hook files against `ceff796`: exit 0. Only this lane's research and handover are staged. Commit goes through the existing full hook; its actual result is in the final CODEX status and `logs/commit-hook.log`.

Default-run summaries, saves and drafting output are inventoried in `runtime-artifacts.json` and copied to external `validation-runs/`. The logs and result JSONs retain every exit and failure category. No other sprint files or processes were modified.

Remaining source questions are explicit in the index: Hunter's complete muster/discharge chain and Kansas service; individual naval ratings/pay/treatment; camp registers and cumulative deaths; the original Palmyra file and Osceola civilian voices; actual Wisconsin dispositions; a contemporary July cabinet chronology; a concluded lawful May 1861 acceptance path; and the still-missing detention/removal records for Dakota people. No numerical effect or checkpoint band was invented from mixed counts.

## Proposed rulings

None. Source disagreements and remaining evidence limits go to the gate reviewer; no needs-source flag is lifted here.

## For the lead

1. After the sprint, route these notes to the standing and gate reviewers under 0106.
2. Route the retained baseline failures to S1/S2 and the lead; do not recenter a band or change a timeout in this docs-only lane. The required default campaign is complete but did not pass.

## Findings outside my scope

1. Gate review: distinguish March and July return restrictions before revising any expiry description; this lane makes no ruling.
2. Earlier research citation: Hoffman's 20,500 estimate is on OR II.4 p. 278, not p. 277.
3. S2 owns performance; the validation timeout is retained for diagnosis and does not authorize adjusting the budget. Other sprint processes and files remain untouched.
