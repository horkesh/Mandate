# Sprint branch review packets

S32 only. These packets prepare Claude’s whole-branch standing review and the lead’s individual rulings under decision 0106. They supply no approval, signature, release verdict or merge into main. The audit worktree started on `sprint/audit` at `9ab0f5e`; only this directory is a delivery path. The sole authorized main-checkout write is the final append to CODEX.

The final pinned remote snapshot is **2026-11-21T01:39:50.624621+00:00**, main **`b01764406738b42633277c8bf00099e093bf20e9`**. It contains **14 sprint branches**. Full hashes, commit parents, file changes and merge bases are in [inventory](_evidence/inventory.json). Names below omit the `sprint/` prefix only in filenames. All source line links use immutable commit IDs.

An initial snapshot was refreshed when main advanced only in CODEX and S29 was pushed to desk. [Refresh receipt](_evidence/refresh-receipt.json): 27 affected merge probes rerun, 78 unaffected probes reused. Earlier inventories/results are retained. The new S33 request is not undertaken and is not delivered at the desk pin. S1 and S25 are still ongoing at the packet cutoff; do not describe their backlogs as completed.

## Packet coverage

| Remote branch | Pinned tip | Commits outside main | Changed paths | Numbered ruling entries | Gate inventory rows |
|---|---|---:|---:|---:|---:|
| [sprint/1a](1a.md) | `bf6cc66c025a` | 13 | 84 | 23 | 7 |
| [sprint/audit](audit.md) | `9ab0f5e7473d` | 1 | 13 | 4 | 0 |
| [sprint/checks](checks.md) | `39c279cefc3e` | 4 | 28 | 6 | 0 |
| [sprint/desk](desk.md) | `7db8c80a605c` | 23 | 140 | 15 | 7 |
| [sprint/people-data](people-data.md) | `637e1d427d44` | 3 | 12 | 9 | 6 |
| [sprint/perf](perf.md) | `3155d90ef0be` | 23 | 97 | 14 | 7 |
| [sprint/plan-1b](plan-1b.md) | `97a03792e492` | 10 | 28 | 112 | 33 |
| [sprint/playtest](playtest.md) | `4bf2b8bab7e3` | 14 | 92 | 5 | 7 |
| [sprint/research-cast](research-cast.md) | `4d475c2e0b4a` | 8 | 48 | 25 | 6 |
| [sprint/research-foreign-economy](research-foreign-economy.md) | `c70441af68b9` | 5 | 51 | 19 | 38 |
| [sprint/research-gate](research-gate.md) | `4220d6124ca3` | 7 | 46 | 37 | 33 |
| [sprint/research-military](research-military.md) | `7fbd1082c061` | 9 | 85 | 38 | 68 |
| [sprint/research-politics](research-politics.md) | `cd9213219ed2` | 5 | 26 | 14 | 21 |
| [sprint/situations-1862](situations-1862.md) | `6dd333d6d95d` | 4 | 139 | 13 | 115 |

Commit/path counts overlap: desk, perf and playtest inherit 1a. Numbered ruling entries retain explicitly sourced status restatements as well as primary choices; their counts are not counts of unique design decisions. Historical withdrawn/superseded choices are labeled, especially R90→R97, R84→R89 and S9→S16. A status saying “blocked” does not hide a later delivered remote commit; a later commit does not erase the failed evidence or a per-note-commit shortfall.

The packet’s “Four review lenses” table gives exact source locations and tests or concrete validation contracts. Those links do not claim a fresh execution of every branch. Research has no automatic test for historical truth. The gate table distinguishes actual topic candidates from source/design files needing facet triage; it does not label all ordinary data as a gated mechanic. Proposed gate.none classifications still require review.

## Suggested merge order

This is a proposed dependency/reconciliation order [I], after the required standing verdicts, lead rulings and separate gate approvals. The steward must recheck each actual cumulative integration. It is not an instruction for S32 to merge anything.

| Step | Branch | Reason and prerequisite |
|---:|---|---|
| 1 | [sprint/audit](audit.md) | Review the S26 findings and S32 navigation first, so later verdicts explicitly dispose of known contracts and unmet criteria. Audit findings are for their stated baseline, not automatic findings against every sprint implementation. |
| 2 | [sprint/research-gate](research-gate.md) | Review source limits, inherited refusals and the 33 topic candidates before adopting sensitive facets elsewhere. Merge only unsigned research/dossiers; placement and signatures remain separate. |
| 3 | [sprint/research-cast](research-cast.md) | Review temporal identities, directed observer evidence, holds and commission/assumption dates. This supplies accepted inputs to later people/OOB work without applying them. |
| 4 | [sprint/research-military](research-military.md) | Review force measures, source bounds and nonoverlapping dated observations using the cast identity decisions. Keep all 149 unknowns and unsupported checkpoint kinds visible. |
| 5 | [sprint/research-foreign-economy](research-foreign-economy.md) | Review monetary/physical units, manpower stages, route joins and supply holds alongside the military windows. No observation becomes rated capacity or available stock by merging it. |
| 6 | [sprint/research-politics](research-politics.md) | Review election denominators, session/member/party crosswalks and press scope; reconcile shared legal provisions with the economy/gate notes. No immediate successor seating or runtime reach is inferred. |
| 7 | [sprint/plan-1b](plan-1b.md) | With the source reviews in hand, review the 26 proposed notes and D01–D14. Reconcile S11 amendments with the older external drafts. Merging clearly proposed documents does not authorize 1B before the separate 1A exit review/playtest. |
| 8 | [sprint/1a](1a.md) | Review and merge the common gameplay integration before its descendants. Resolve each imported choice, runner-ceiling proposal and missing S1 build/calibration item; preserve open pushback/D6 criteria. |
| 9 | [sprint/perf](perf.md) | 1a is already an ancestor. Review the perf-only commits separately, preserving the integrated baseline. Require hosted Linux budget evidence; local paired estimates and daily-hash equality answer different questions. |
| 10 | [sprint/people-data](people-data.md) | Resolve the liveness conflict against the now-integrated runtime with the actual causal evidence. Preserve all service-owned rows and explicit Seward/Walker deferrals. Recompute required combined behavior evidence; S30 preservation hashes cannot certify changed inputs. |
| 11 | [sprint/desk](desk.md) | 1a is already included here too. Resolve handwritten view/view.ts against perf without losing either candidate caching or public/received projections. Preserve S29’s five corrections and open human-Manassas result; its earlier schema conflicts were regenerated in its delivered merge. |
| 12 | [sprint/situations-1862](situations-1862.md) | Review all 115 isolated drafts against the source/gate/contract decisions. Keep them unloaded until actual receipt producers, typed acts, costs, source adoption and signatures exist. Do not promote from a successful structural check. |
| 13 | [sprint/playtest](playtest.md) | Review the console-only cases after the related runtime/desk contracts. Preserve actual red evidence; if a reviewed production correction makes an expected failure pass, convert it deliberately to an ordinary passing regression. |
| 14 | [sprint/checks](checks.md) | Reconcile the frozen pre-integration liveness origin, append-only causes, projection/helper fingerprints and signed inventory against the accepted integrated changes. Classify rather than enlarge the thirteen known findings. Run the real rules/history hook on the integrated tree; clean merge-tree output is insufficient. |

The source branches can be reviewed independently. Their order above is for resolving shared semantics, not a claim that one research branch technically imports another. The proposal documents can merge as proposals before the runtime branches, but opening 1B still waits for its accepted entry contract. Do not cherry-pick away required source/hold context to avoid a conflict.

## Pairwise conflicts

All **105 unordered pairs** among main and fourteen sprint tips were actually probed with `git merge-tree --write-tree --name-only`. Each packet lists all fourteen of its peers, including main and every clean result. Final results: **100 clean / 5 conflicted**. Every branch is textually clean against pinned main. [Commands, full SHAs, exits, tree IDs and complete stdout/stderr](_evidence/merge-tree.json).

| Pair | Conflicting paths |
|---|---|
| 1a ↔ people-data | `packages/cli/src/liveness-gate.ts` |
| desk ↔ people-data | `packages/cli/src/liveness-gate.ts` |
| desk ↔ perf | `packages/kernel/src/view/view.ts` |
| people-data ↔ perf | `packages/cli/src/liveness-gate.ts` |
| people-data ↔ playtest | `packages/cli/src/liveness-gate.ts` |

The earlier desk generated-schema conflicts disappeared after S29’s delivered 1a merge. The remaining view conflict is handwritten. The four liveness conflicts involve observations from different input baselines; keeping one side is not a reconciliation. S18’s exact origin/fingerprint/history checks create a further semantic integration obligation even where merge-tree is clean.

No cumulative virtual merge or build was performed. Pairwise clean results do not establish compatible behavior, a passing hook, correct history or preserved approvals. Generated conflicts must be regenerated from combined owning source. Handwritten content decisions return to the owning lane/reviewer.

## Rulings and gate review

The [source-heading cross-check](_evidence/proposal-source-audit.json) accounts for all 33 explicit proposal headings in changed hand-overs. Archived hand-overs preserve their source text; use the packet?s immutable commit links to follow their original branch-relative references. The numbered lists retain explicit choices/rejections from changed hand-overs, S8’s status, S23’s README/topic dossiers, S26’s report, S27/S29’s reports and the author statuses. [Ruling provenance](_evidence/rulings.json), [status coverage](_evidence/status-coverage.json), [pinned author statuses](_evidence/status-source.json), [sprint coordination snapshot](_evidence/CODEX-sprint-snapshot.md), [relevant pre-sprint statuses](_evidence/CODEX-pre-sprint-statuses.md). An inferred review question is marked [I]; the packet never fabricates an author’s rejected alternative.

D01–D14 were read from their external delivery folder and verified against the hand-over’s hashes. [Exact unsigned copies](_evidence/external-decisions/), [hash receipt](_evidence/external-decisions.json). Their individual proposed clauses are separately numbered in plan-1b. They are not installed in the decisions directory, accepted, numbered or signed. The author’s S11 self-review says affected wording must be reconciled first.

Gate inventory highlights: **33 S23 topic dossiers; 115 S13/S28 situation drafts; four S9 recommendations and Clark’s companion HOLD; sensitive cast sidecar rows; D08–D14; seven inherited administrative notice exemptions.** The source-draft and design-note tables provide exhaustive file navigation for classification. Review translations, source adoption, advocates, received causes, cost/dependency/sign rules and every remaining hold with each item. Schema acceptance is never a signature.

## S32 validation

Question: do all fourteen packets cover the pinned commits/files, explicit proposal sources, four lenses, gate candidates and every peer, while preserving the audit worktree? Cheapest checks: workspace resolution; metadata path/line anchors; exact branch and 105-pair coverage; proposal/gate/source hashes and local links; original tracked-file preservation. The worktree’s existing S26 install is reused without reinstalling or modifying dependencies.

Required inherited gates: `MANDATE_NO_GIT=1 npm run check` once, one default `runDoneCheck` plus default drafting, and the actual configured pre-commit hook. The campaign adapter changes only output placement into this directory’s ignored `validation-raw/`; it preserves defaults, horizons, eight seeds and budgets. Supported `VITEST_MAX_WORKERS=1` controls file concurrency only. No branch checkout, main write, other-lane write, publication, push, production fix or additional calibration campaign is included. Expected cost: several minutes for each check/hook, roughly 20–45 minutes for the one campaign. Stop after an unexpected failure, inspect all categories and unreached gates, and verify cheaply before any required retry; never repeat unchanged campaigns for reassurance.

Settled fresh results and the final packet/source/protection inventory are in [validation summary](_evidence/validation-summary.json) and [packet checks](_evidence/packet-checks.json). Raw logs, command/exit receipts, summaries and saves remain locally under `docs/audit/sprint-packets/_evidence/validation-raw/` and are deliberately untracked. The final commit’s hook receipt and exact commit hash are recorded after it completes, in that raw directory and the one shared CODEX status; a commit cannot contain its own later receipt.

S32’s check/campaign verifies this audit baseline only. It does not replace the branches’ retained run evidence, establish Linux CI, validate every historical page, make supplemental 1A binding through the default exit, or waive an existing failed acceptance criterion. In particular, 1A pushback and D6 remain open; local performance equality cannot clear them.

## Evidence and reproduction

| Evidence | Purpose |
|---|---|
| [collect.py](_evidence/collect.py), [refresh.py](_evidence/refresh.py) | Read-only object inventory and bounded changed-tip refresh; merge-tree writes Git objects, never a checked-out merge. |
| [build_packets.py](_evidence/build_packets.py), [write_readme.py](_evidence/write_readme.py) | Packet/index construction from pinned objects, source statuses and explicit review notes. |
| [references.json](_evidence/references.json) | Every resolved source path/line used in packet navigation. |
| [gates.json](_evidence/gates.json) | Exact candidate/file-level triage inventory; no approvals. |
| [preservation-before.json](_evidence/preservation-before.json) | SHA-256 of every original tracked file before S32. |
| [verify_packets.py](_evidence/verify_packets.py) | Fresh coverage, citation, inventory and scope checks; writes only packet evidence. |
| [run-done.ts](_evidence/run-done.ts), [validate-runtime.py](_evidence/validate-runtime.py) | Existing default runtime machinery with output confinement and retained command/exit logs. |

Do not rerun collect.py over its pinned inventory. A future remote advance needs a new explicit snapshot and affected-pair refresh, not silent replacement of this evidence. A new review cutoff should update affected hand-overs/statuses and their packet; unrelated evidence remains reusable.

## Findings outside my scope

Claude’s standing whole-branch verdicts, individual lead rulings, gate placements/signatures, original-source follow-ups, pending S1/S25/S33 work, cumulative conflict resolution, every unmet runtime/human-play/CI criterion, steward integration and pushing remain outside S32. No other sprint request is performed here.
