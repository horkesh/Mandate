# sprint/checks: review packet

Pinned remote tip: `39c279cefc3e836e9a7f6a39acbb6772393a16ab`. Comparison: `origin/main...origin/sprint/checks` at main `df0cf216e8bba2be74e992922bd8dd0730135456`; merge base `79bd9d633dd78c973b134d6557f046595bd53df9`. Snapshot: 2026-11-21T02:11:37.186520+00:00.

This is navigation for the standing reviewer and the lead under 0106. It is not a verdict, accepted ruling, gate sign-off or permission to merge. Locations below refer to the pinned branch, not to the audit worktree.

## What changes

Adds B2 cause/exemption, projection-truth, liveness-cause/history and signed-content checks, their fixtures, CI/check wiring and a staged-history hook extension. Production packs/runtime are unchanged. S25 is not present at this remote tip.

4 commits reachable from the branch but not pinned main; 28 changed paths. Descendants include shared commits; counts across packets must not be added. Immutable [full diff](https://github.com/horkesh/Mandate/compare/df0cf216e8bba2be74e992922bd8dd0730135456...39c279cefc3e836e9a7f6a39acbb6772393a16ab) and [inventory](_evidence/inventory.json). Raw git diff, its command, size and SHA-256 are retained under `_evidence/validation-raw/diffs/` (local, ignored), with the receipt in the inventory.

### Commits

| Commit | Subject |
|---|---|
| [`98c425091e84`](https://github.com/horkesh/Mandate/commit/98c425091e8457ba6ac613a2dcd3de826cceb50b) | Check situation dates and railroad exemptions against B2 |
| [`f740e7e6b7b9`](https://github.com/horkesh/Mandate/commit/f740e7e6b7b9b87f44195e27aa7e04fc760427be) | Check projection truth reads through helper and barrel imports |
| [`5665f5ebbf64`](https://github.com/horkesh/Mandate/commit/5665f5ebbf64074cdc521ce27fd8b29d51898459) | Require observed liveness band changes to record their causes |
| [`39c279cefc3e`](https://github.com/horkesh/Mandate/commit/39c279cefc3e836e9a7f6a39acbb6772393a16ab) | Check every signed situation against its reviewed content |

### Files and areas

| Change | Path |
|---|---|
| M | [.github/workflows/ci.yml:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/.github/workflows/ci.yml#L1) |
| A | [notes/sprint-S18-checks.md:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L1) |
| M | [package-lock.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/package-lock.json#L1) |
| M | [package.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/package.json#L1) |
| A | [tools/audit-rules.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/audit-rules.ts#L1) |
| A | [tools/check-rules.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/check-rules.ts#L1) |
| A | [tools/rule-history.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rule-history.ts#L1) |
| A | [tools/rules/cause-exemptions.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/cause-exemptions.json#L1) |
| A | [tools/rules/common.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/common.ts#L1) |
| A | [tools/rules/existing-findings.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/existing-findings.json#L1) |
| A | [tools/rules/liveness-causes.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/liveness-causes.ts#L1) |
| A | [tools/rules/liveness-changes.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/liveness-changes.json#L1) |
| A | [tools/rules/liveness-origin.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/liveness-origin.json#L1) |
| A | [tools/rules/liveness-snapshot.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/liveness-snapshot.ts#L1) |
| A | [tools/rules/pack-content.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/pack-content.ts#L1) |
| A | [tools/rules/projection-derivations.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/projection-derivations.json#L1) |
| A | [tools/rules/projection-truth.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/projection-truth.ts#L1) |
| A | [tools/rules/signed-inventory.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/signed-inventory.json#L1) |
| A | [tools/rules/signed-pack.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/signed-pack.ts#L1) |
| A | [tools/rules/signed-situations.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/signed-situations.ts#L1) |
| A | [tools/rules/situation-causes.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/situation-causes.ts#L1) |
| M | [tools/staged-check.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/staged-check.ts#L1) |
| A | [tools/test/liveness-causes.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/liveness-causes.test.ts#L1) |
| A | [tools/test/projection-truth.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/projection-truth.test.ts#L1) |
| A | [tools/test/rule-history.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/rule-history.test.ts#L1) |
| A | [tools/test/signed-situations.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/signed-situations.test.ts#L1) |
| A | [tools/test/situation-causes.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/situation-causes.test.ts#L1) |
| M | [tools/test/staged-check.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/staged-check.test.ts#L1) |

## Proposed rulings for the lead

Each number is a source proposal the lead can accept, revise or overturn. Choices and rejected alternatives retain the author’s wording unless marked as S32 unpacking. Status restatements are retained for traceability; they are not additional witnesses. A withdrawn or superseded proposal is labeled by its source and is not silently revived. Where the source supplies no rejected alternative, this packet does not manufacture one.

1. Keep an exact, non-growing baseline for the 13 current findings so this lane can deliver checks without changing production. Reject broad exclusions or silently accepting edited/new defects. — [notes/sprint-S18-checks.md:61](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L61); hand-over.
2. Require explicit cited premise/outside-model exemptions for date-only branches and railroad labels. Reject trusting the railroad prose alone or attempting natural-language historical inference in a validator. — [notes/sprint-S18-checks.md:62](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L62); hand-over.
3. Permit only exact cited projection derivations, including their helper closure. Reject a file-wide whitelist and a root-only fingerprint that would miss an intermediate helper's changed target. — [notes/sprint-S18-checks.md:63](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L63); hand-over.
4. Use an immutable 338-band origin and append-only observation/cause records. Reject automatically running campaigns to fit bands or accepting arbitrary hand-written limits. Existing quiet/stalled bands stay at the origin; introducing a new quiet/stalled shape needs an explicit lead policy rather than an implicit exception to the positive `around(observed)` rule. Explicit retirements require a cause too. — [notes/sprint-S18-checks.md:64](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L64); hand-over.
5. Retain the known signed-path inventory so removing both the gate tag and the sign-off cannot hide an edit. Reject checking only currently gated items or writing replacement sign-offs in S18. — [notes/sprint-S18-checks.md:65](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L65); hand-over.
6. **Proposed rulings:** exact non-growing baseline, cited causal exemptions, full-closure derivation allowances, immutable liveness origin with chained causes, and protected signed-path inventory. Rejected alternatives and limits are in the hand-over. Evidence: **`runs/s18/final-checks.json`**, `main-audit-settled.json`, `runtime-evidence.json`, red/green logs and commit receipts. Inventories and runtime diagnostics preceded final documentation. — CODEX.md:5460 (preserved in the linked status snapshot); S18 author status.

### Status and hand-over coverage

| Source | Coverage |
|---|---|
| S18 author status | Original `CODEX.md:5441`, 28 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| [notes/sprint-S18-checks.md:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/notes/sprint-S18-checks.md#L1) | [Retained hand-over](_evidence/handovers/checks/notes/sprint-S18-checks.md) |

## Four review lenses

| Lens | First question and location | Regression evidence / test |
|---|---|---|
| Canon and decisions | Baseline findings must not grow or become broad exceptions. Classify the exact menu/projection paths and date-only/railroad cases before changing the lists. [tools/rules/existing-findings.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/existing-findings.json#L1) | [tools/test/situation-causes.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/situation-causes.test.ts#L1) |
| Determinism | Check AST reachability/helper-closure fingerprints, staged-index handling and append-only history replay. Dynamic dispatch/computed keys remain limits. [tools/rules/projection-truth.ts:46](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/projection-truth.ts#L46) | [tools/test/projection-truth.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/projection-truth.test.ts#L1) |
| History | Exemption citations are authority to review, not historical cause inference. A changed locale/source row must invalidate its exact exemption. [tools/rules/cause-exemptions.json:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/cause-exemptions.json#L1) | [tools/test/situation-causes.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/situation-causes.test.ts#L1) |
| Realism | A new checker must catch lost prerequisites and stale signatures rather than teach authors to silence them. Reconcile integrated band observations with actual causes. [tools/rules/liveness-causes.ts:19](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/rules/liveness-causes.ts#L19) | [tools/test/liveness-causes.test.ts:1](https://github.com/horkesh/Mandate/blob/39c279cefc3e836e9a7f6a39acbb6772393a16ab/tools/test/liveness-causes.test.ts#L1) |

A test link identifies the relevant guard or validation contract, not a claim that S32 ran that branch. Research/design inventories lack a general test for historical truth; compare cited pages and scope/measure sidecars before adoption. Run the required project/hook checks after integration and every behavior-triggered regression.

## Gate items

No new situation draft. All 29 known signed paths are inventoried; the checks do not issue replacement approvals. Ten B2 cases involving Native nations and other sensitive topics still need their production/gate classifications.

No new per-item draft is added by this branch. Inherited or later-use review obligations are described above.

## Conflicts from merge-tree

Every row is an actual `git merge-tree --write-tree --name-only <pinned-left> <pinned-right>` result. Exit 0 means textually clean, exit 1 means conflicted. No checkout, merge or conflict resolution was performed. [All 105 commands, exits, trees, complete stdout/stderr](_evidence/merge-tree.json).

| Other tip | Exit | Conflicting files |
|---|---:|---|
| origin/main | 0 | None |
| sprint/1a | 0 | None |
| sprint/audit | 0 | None |
| sprint/desk | 0 | None |
| sprint/people-data | 0 | None |
| sprint/perf | 0 | None |
| sprint/plan-1b | 0 | None |
| sprint/playtest | 0 | None |
| sprint/research-cast | 0 | None |
| sprint/research-foreign-economy | 0 | None |
| sprint/research-gate | 0 | None |
| sprint/research-military | 0 | None |
| sprint/research-politics | 0 | None |
| sprint/situations-1862 | 0 | None |

Merge this branch only after explicit reconciliation of the integrated state. Its clean textual merge with 1a/perf/desk/people-data does not imply check:rules or staged-history will pass. Existing-findings fingerprints and the frozen band origin are from the pre-integration baseline.

These are pairwise probes only. A clean pair does not establish a clean cumulative merge, compatible semantics, passing rules/history checks or preservation of signed content. Regenerate generated conflicts with their owning tools; handwritten conflict choices need the owning lane and reviewer.

## Retained validation and open work

S18 retains thirteen production findings (ten B2, three projection paths), nine explicit cause exemptions, 338 origin bands and 29 signed paths. The hand-over reports 76 focused controls; no production fix, new sign-off or acceptance waiver.

S32’s own validation receipts are in [README](README.md#s32-validation). That checks this audit worktree and packet integrity; it does not re-execute all branch suites or substitute for Claude’s whole-branch review.

## Findings outside my scope

Merge this branch only after explicit reconciliation of the integrated state. Its clean textual merge with 1a/perf/desk/people-data does not imply check:rules or staged-history will pass. Existing-findings fingerprints and the frozen band origin are from the pre-integration baseline. Standing review, lead rulings, separate gate review, cumulative integration, runtime repairs, CI and pushing remain with their owners.
