# S57: 1B people and posts

Research draft, 22 November 2026. **S57 only**, `C:/Pyrrhic/sprint-research-cast`, `sprint/research-cast`, from `ddc5cb7`. Documents only. Read the main CODEX from the top, including standing, command-line and writing rules, 0106, S1 to S10 and the S57/all-lanes instructions. Headless tools only; one worker, no subagents. No push, main edit except the authorized final status append, other-worktree edit, live-pack change, accepted decision, source admission or gate signature.

## Work and validation plan

1. Read civil-office succession evidence and draft both cabinets, War/Navy leadership and general-in-chief transitions.
2. Read command instruments and register entries for appointments, removals, resignations, promotions, wounds and deaths in August 1861–November 1862. Separate order, receipt and execution; retain conflicts and unknowns.
3. Retain cited scans, readings, locators and hashes under `C:/Pyrrhic/mandate-research-sources/S6/S57/`. Preserve S6/S12/S22/S38 and all earlier tracked files.
4. Before campaigns, check dependency/runtime readiness, typecheck, opening tests, scope, CSV shape, citations and source hashes. Run the required no-git check, each actual commit hook and one default done check. Expected cost was minutes per suite and roughly half an hour for the campaign; the measured civil hook took about fourteen minutes and the campaign about forty-nine under the observed load. Stop expensive retries after an unexpected failure, diagnose cheaply, reuse unaffected evidence, and never weaken a timeout or assertion. No unchanged campaign repeat.

## Deliverable and preservation

[Research entrypoint](../docs/research/S57/README.md): **397 rows** in four tables—55 civil, 17 War offices, 161 command and 164 rank/availability. Both sides are covered; this is an additive draft with selective coverage, not an exhaustive roll of every subordinate/interim command. The 21 case notes retain unknowns and proposed treatments, including Memminger's printed-name conflict and Forney's unresolved first name. No character judgment is derived from tenure, promotion, praise or casualty.

**196 cited pages**, 30 source keys, **188,401,287 scan bytes**; 424 source/index/reading/inspection artifacts are inventoried. Facts come from read passages, cited by printed page. All 196 page locators were inspected; 34 selected factual image checks are recorded. Nineteen neighboring-page locator errors were corrected in S57, with old metadata and scan bytes retained. Four belonged to the first S57 civil manifest; its 55-row CSV and citations remain byte-identical. Prior sprint files and their scans were not repaired or rewritten.

All **1,743 original tracked paths** match the initial SHA-256 baseline. CSV schemas, unique event IDs, dates, every table/note citation, source hashes, bibliography keys, UTF-8 and local links pass. Added repository files stay within `docs/research/S57/` and this hand-over; runtime/code/pack inputs remain unchanged. Source inventories, runtime diagnostics and preservation checks preceded this final-result prose. Final scope/link checks are repeated only for these documentation additions.

## Checks and failures

Root `npm ci`: exit 0, 51 packages, zero vulnerabilities. Preflight typecheck and ten opening tests in two files pass. The retained condensed preflight output does not enumerate the two filenames.

The initial `MANDATE_NO_GIT=1 npm run check` used default parallel workers and failed only the unchanged **300000 ms** `beforeAll` timeout in `packages/cli/test/done-check.test.ts`: **136 files pass / one fails**, **1,516 tests pass / one expected failure / 17 skipped**, **371.65 seconds**. Inspection identified the supported worker control; the affected file with `VITEST_MAX_WORKERS=1` passed **14 tests / one skip**, **229.14 seconds**. Boundary, licences and 106 decisions, not reached by the initial failing chain, passed separately. Unaffected evidence was reused; no source, assertion or timeout changed.

**Civil commit `c6cd2040`** passed the actual one-worker hook: exit 0; LFS, typecheck, **137 test files / 1,530 tests / one expected failure / three skips**, boundary, licences and 106 decisions pass; **837.13 seconds**. Its five new documents/tables were committed with the required Codex co-author footer. The later military/closeout commit must pass its own actual hook; its receipt is `logs/commit-final.log`, `.exit` and `.seconds` in the external S57 folder and is reported in the sole shared CODEX status. This text does not pre-claim its result.

**One default campaign:** `MANDATE_NO_GIT=1 VITEST_MAX_WORKERS=1 npm run run:done-check -- --label s57-done`, default eight seeds, unchanged 400-day fork cap, drafting included. **Exit 1, 2,917.67 seconds; Phase 0 5/6; nonbinding 1A 2/6.** Both Union median budgets fail: reference **57.75 ms**, history **51.65 ms**, against **40**; p95 **122.19/115.43 ms** against **160**. Testbed median/p95 **4.28/5.99 ms**. No rerun or runtime tuning.

The four 1A failure categories and their exact problem set match S38: Confederate men **20,957 / 100,000 minimum**; both sides' planned operations **0 / 1 minimum** and no planned-operation battle; relay/filter/trim holds **1/0/0** below **2/1/1**, reservations **44** above **9**; D6's incomplete people/grievance measure and unexercised border-governor recruitment chain. Eight seeds weigh eight gated decisions, with 248 base-run regiment calls; the reported return-best result is 0/8, which does not clear the explicitly incomplete/unexercised measure. These remain unmet, not waived by documentation or unrelated passes. Unknown-strength and stand-in criteria pass. No Linux certification.

Reference summaries are **identical to S38 outside timing**: **148 Union + 120 testbed daily hashes**, all liveness rows, finals, replay/resume and saved-log results; **zero rejections**. No changed reference hash or counter needs a cause attribution. Five runtime artifacts are hashed and copied into the external `runtime/` folder. [Validation receipt](../docs/research/S57/validation.json) records every failure, comparison and retained artifact; raw logs and exits stay external. The same campaign is not repeated for reassurance.

## Proposed rulings [I]

Keep nomination, confirmation, rank, assignment, receipt, assumption, relief, tender, acceptance and availability separate; keep source variants and unknowns explicit. Reject one universal date, inferred continuous service or recovery, praise-derived character, treating a conditional resignation as executed, making confirmation revive a dead officer, changing old rows, or scripting historical events on dates. The case notes list the evidence and rejected alternatives. Nothing is applied.

## Findings outside my scope

Identity/source admission, outstanding appointment and execution instruments, complete interim-command/bureau collation, recovery notices and gameplay application remain with the lead. Repair of earlier sprint locator manifests is separate; their bytes are preserved. The tick-budget breach, unchanged 1A failures, Linux CI, whole-branch/gate review and integration remain outside S57. Under 0106 reviewers and steward stand down during the sprint; nothing is cleared or signed.
