# sprint/people-data: review packet

Pinned remote tip: `637e1d427d4489ff4b084b83d3c397c50d349ae0`. Comparison: `origin/main...origin/sprint/people-data` at main `b01764406738b42633277c8bf00099e093bf20e9`; merge base `ceff796b3c793ef28e79b5d51d7dfe5a2dfabf39`. Snapshot: 2026-11-21T01:39:50.624621+00:00.

This is navigation for the standing reviewer and the lead under 0106. It is not a verdict, accepted ruling, gate sign-off or permission to merge. Locations below refer to the pinned branch, not to the audit worktree.

## What changes

Incremental S9 apply/date holds, a curated one-row S6 opt-in, four unsigned people recommendations and S16 runtime data. S16 defers all new Seward/Walker row changes and changes only the initiative liveness band to around(3). Final held list is 414; 102 of 261 people change and all fifteen service-owned rows are protected.

3 commits reachable from the branch but not pinned main; 12 changed paths. Descendants include shared commits; counts across packets must not be added. Immutable [full diff](https://github.com/horkesh/Mandate/compare/b01764406738b42633277c8bf00099e093bf20e9...637e1d427d4489ff4b084b83d3c397c50d349ae0) and [inventory](_evidence/inventory.json). Raw git diff, its command, size and SHA-256 are retained under `_evidence/validation-raw/diffs/` (local, ignored), with the receipt in the inventory.

### Commits

| Commit | Subject |
|---|---|
| [`2c6da233313a`](https://github.com/horkesh/Mandate/commit/2c6da233313a3c4dccbab7fd138c8e5aab221a45) | Add an incremental people-data apply that preserves service ownership |
| [`07fbad6699d7`](https://github.com/horkesh/Mandate/commit/07fbad6699d7538c523409417a23a7a1b03e3bad) | Curate the timely S6 appraisal and record S9 integration blockers |
| [`637e1d427d44`](https://github.com/horkesh/Mandate/commit/637e1d427d4489ff4b084b83d3c397c50d349ae0) | Apply sourced people data while deferring historical answer regressions |

### Files and areas

| Change | Path |
|---|---|
| A | [docs/research/_resource/s9-backlog.csv:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/docs/research/_resource/s9-backlog.csv#L1) |
| A | [docs/research/_resource/tools/apply-s9.js:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/docs/research/_resource/tools/apply-s9.js#L1) |
| M | [docs/research/_resource/tools/apply.js:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/docs/research/_resource/tools/apply.js#L1) |
| M | [notes/lane-1.11r3-research.md:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L1) |
| M | [packages/cli/src/liveness-gate.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packages/cli/src/liveness-gate.ts#L1) |
| M | [packs/union-1861/PROVENANCE.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/PROVENANCE.json#L1) |
| M | [packs/union-1861/data/world.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/data/world.json#L1) |
| A | [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) |
| M | [packs/union-1861/source/drafts/people/held-back-judgments-1861.csv:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/source/drafts/people/held-back-judgments-1861.csv#L1) |
| M | [packs/union-1861/source/world/people.csv:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/source/world/people.csv#L1) |
| M | [packs/union-1861/test/r47-authoring.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/test/r47-authoring.test.ts#L1) |
| A | [packs/union-1861/test/s9-people-apply.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/test/s9-people-apply.test.ts#L1) |

## Proposed rulings for the lead

Each number is a source proposal the lead can accept, revise or overturn. Choices and rejected alternatives retain the author’s wording unless marked as S32 unpacking. Status restatements are retained for traceability; they are not additional witnesses. A withdrawn or superseded proposal is labeled by its source and is not silently revived. Where the source supplies no rejected alternative, this packet does not manufacture one.

1. Retain real bounds and conservative date holds; reject fabricated exact days or letting the day-only parser silently admit a straddling bound. Retain unresolved-date limits explicitly. — [notes/lane-1.11r3-research.md:255](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L255); hand-over.
2. Keep the four sensitive placements in `situations/drafts/s9-people-gate.json` for the gate, including the two rs15 traits and Clark's companion issue; reject unsigned live placement or silently dropping the slavery finding. This conservative placement remains for the lead/gate to rule on. — [notes/lane-1.11r3-research.md:256](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L256); hand-over.
3. Admit only McClellan's timely professional appraisal from S6, as above [I]; reject high, March reputation, wholesale application of its later table, or letting its search HOLDs erase prior evidence. — [notes/lane-1.11r3-research.md:257](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L257); hand-over.
4. Preserve the historical failures and route them to integration. A tentative two-band-only patch is **withdrawn and unapplied**: the full check exposed more than a band discrepancy. Reject restoring untimely motives, changing thresholds, weakening assertions or quieting a failed criterion merely to obtain a data commit. — [notes/lane-1.11r3-research.md:258](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L258); hand-over.
5. **Seward proposed ruling:** defer his new boldness, candour, motives and Blair relationship pending a dated-value ruling. His proposed empty motives remove **conciliation and reputation**, the two values honoured by `bid_for_direction`. Initial willingness changes **380 to -82**: values **400 to 0**, temperament **-55 to -117**; the other terms are unchanged. Restoring those motives alone gives **318**, while restoring boldness alone gives **-20**. The research dates the cabinet opinions to March 1861 (`NH-CW` VI pp192-201), and his *Some Thoughts for the President*, printed in *Complete Works* II **p29**, and Lincoln's reply **pp30-32**, to **1 April 1861**. These are not proven pre-5-March motives. The read headings and date register are in `docs/research/_resource/evidence-r52/lincoln-heading-extracts.json` and `dating.csv`. Keep the baseline pending a proper dated application [I]; reject backdating April evidence, dropping the memorandum assertion, quieting initiative, or changing its admission threshold. — [notes/lane-1.11r3-research.md:275](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L275); S32 unpacking of the cited proposal [I].
6. **Walker proposed ruling:** defer every new row change pending the same design question, including the proposed experience/boldness/regard holds, removal of caution/order and relationships, and date annotations. Initial advance-order willingness changes **-164 (object) to 44 (comply with reservations)**: the caution penalty **-200 to 0**, temperament **-105 to -7**, regard **90 to 0**, deterrence unchanged at **51**. Restoring caution with the other old motives alone gives **-156**; restoring boldness alone gives **-54**. The retained *Official Records* I-1 **p301** prints Walker's **11 April 1861** conditional direction to avoid unnecessary bombardment; its reading is in `evidence-r52/official-page-extracts.json`. The broad dating table retains the April bound; Jones's **22 May / 20 July** entries likewise do not establish start-day motives or regard. Keep the baseline until the lead rules on dated application [I]; reject converting the asserted bypass to an ordinary relay order or weakening any opening date. All existing bypass, bombardment, evacuation, initiative and console-choice assertions pass unchanged. The exact **day-37 wire bypass, day-38 bombardment and day-39 evacuation** checks remain ordinary tests. — [notes/lane-1.11r3-research.md:277](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L277); S32 unpacking of the cited proposal [I].
7. Only **`seats.initiative`** breaches its old band after the deferrals: **3 observed**, old **4-18**, new **`around(3)` = 1-6**. Cause: Bates and Caleb Smith lose conciliation when their later March cabinet opinions are held; the seven-day event comparison shows their initiatives disappearing while Seward's survives. Aggregate firings fall **3 to 1** on each of days **7, 70 and 133**, consistent with the unchanged 60-day cooldown [I]. Cause is recorded in the band's `why`; exact events and all 28 changed measured rows, including magnitude-only changes, are in **`initiative-cause.json`** and **`band-reconciliation.json`**. Every other liveness band, including grievance fading, is unchanged. No historical, checkpoint, strength, pushback, victory or timing bound changed. — [notes/lane-1.11r3-research.md:283](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L283); S32 unpacking of the cited proposal [I].
8. **Seward:** removing conciliation/reputation removes **400** initiative points; the boldness hold costs another **62**. Initial willingness **380 → -82**; restoring motives alone gives **318**, restoring boldness alone **-20**. The cabinet-opinion source is bounded to March (`NH-CW` VI pp192-201), and his *Some Thoughts*, *Complete Works* II **p29**, and Lincoln's reply **pp30-32**, are **1 April 1861**. Recommend a properly dated-value ruling [I]; reject backdating, losing the memorandum assertion, quieting initiative or changing its threshold. — CODEX.md:5399 (preserved in the linked status snapshot); S16 author status.
9. **Walker:** removing caution changes the advance-order value term **-200 → 0**, temperament **-105 → -7**, regard **90 → 0**; deterrence remains **51**. Willingness **-164 (object) → 44 (reservations)**. Restoring motives alone gives **-156**, boldness alone **-54**. The read *OR* I-1 **p301** gives his **11 April 1861** conditional direction; the dating table conservatively retains the April bound, and Jones's May/July evidence is likewise later than the start. Recommend dated application [I]; reject replacing the asserted bypass with an ordinary relay order or weakening a date. — CODEX.md:5400 (preserved in the linked status snapshot); S16 author status.

### Status and hand-over coverage

| Source | Coverage |
|---|---|
| S9 author status | Original `CODEX.md:5105`, 23 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S16 author status | Original `CODEX.md:5389`, 26 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| [notes/lane-1.11r3-research.md:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L1) | [Retained hand-over](_evidence/handovers/people-data/notes/lane-1.11r3-research.md) |

## Four review lenses

| Lens | First question and location | Regression evidence / test |
|---|---|---|
| Canon and decisions | Inspect incremental ownership, source-date cutoffs, whole-row deferrals and HOLD semantics. Later research must not erase accepted cells through the old apply. [docs/research/_resource/tools/apply-s9.js:59](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/docs/research/_resource/tools/apply-s9.js#L59) | [packs/union-1861/test/s9-people-apply.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/test/s9-people-apply.test.ts#L1) |
| Determinism | Normalization/deduplication and reapply must reproduce all four outputs byte for byte; preserve service rows and durable citations. [docs/research/_resource/tools/apply-s9.js:59](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/docs/research/_resource/tools/apply-s9.js#L59) | [packs/union-1861/test/s9-people-apply.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/test/s9-people-apply.test.ts#L1) |
| History | Seward’s April motives and Walker’s April direction are not proven March-5 values. Keeping the baseline is a deliberate deferral, not new verification of that baseline. [notes/lane-1.11r3-research.md:275](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L275) | [packages/cli/test/union-opening.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packages/cli/test/union-opening.test.ts#L1) |
| Realism | Verify the unchanged memorandum and extra bypass assertions. Explain the initiative-band change from held Bates/Smith motives rather than suppressing historical refusal. [notes/lane-1.11r3-research.md:283](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/notes/lane-1.11r3-research.md#L283) | [packs/union-1861/test/r47-authoring.test.ts:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/test/r47-authoring.test.ts#L1) |

A test link identifies the relevant guard or validation contract, not a claim that S32 ran that branch. Research/design inventories lack a general test for historical truth; compare cited pages and scope/measure sidecars before adoption. Run the required project/hook checks after integration and every behavior-triggered regression.

## Gate items

Four recommendations in s9-people-gate.json remain unsigned: Sumner/Wilson antislavery traits, Houston slavery_defence and Clark state_autonomy. Clark’s companion slavery_defence HOLD must be reviewed with his value. 0074 costOnly remains binding.

| Draft / item | Topic or classification | Remaining review |
|---|---|---|
| [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) — sumner_charles/trait:antislavery | KEEP | rs15 requests later review of this antislavery placement; draft for the gate under 0106. |
| [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) — wilson_henry/trait:antislavery | KEEP | rs15 requests later review of this antislavery placement; draft for the gate under 0106. |
| [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) — houston_samuel/value:slavery_defence | CHANGE | 0074 cost-only value; S9 explicitly requires a gate draft. |
| [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) — clark_edward/value:state_autonomy | CHANGE | 0074 cause-of-secession placement; review the explicit companion slavery_defence HOLD before placing this value. |
| [packs/union-1861/situations/drafts/s9-people-gate.json:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/situations/drafts/s9-people-gate.json#L1) — clark_edward/value:slavery_defence | companion HOLD | The signed call on Texas journal pp9-12 invokes the threatened Southern social order but does not explicitly name slavery in its substantive declaration. The December 1860 newspaper notice is reprinted on p9. [I] No separately supported slavery_defence value is entered from euphemism alone. HOLD, as an explicit companion research lead under 0074. Do not silently omit this issue when reviewing or placing the proposed state_autonomy value, and do not borrow another Clark's vote or another man's declaration. |
| [packs/union-1861/source/drafts/people/held-back-judgments-1861.csv:1](https://github.com/horkesh/Mandate/blob/637e1d427d4489ff4b084b83d3c397c50d349ae0/packs/union-1861/source/drafts/people/held-back-judgments-1861.csv#L1) — source/observation draft | facet triage | Unloaded; no placement/signature follows from its presence. |

## Conflicts from merge-tree

Every row is an actual `git merge-tree --write-tree --name-only <pinned-left> <pinned-right>` result. Exit 0 means textually clean, exit 1 means conflicted. No checkout, merge or conflict resolution was performed. [All 105 commands, exits, trees, complete stdout/stderr](_evidence/merge-tree.json).

| Other tip | Exit | Conflicting files |
|---|---:|---|
| origin/main | 0 | None |
| sprint/1a | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/audit | 0 | None |
| sprint/checks | 0 | None |
| sprint/desk | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/perf | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/plan-1b | 0 | None |
| sprint/playtest | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/research-cast | 0 | None |
| sprint/research-foreign-economy | 0 | None |
| sprint/research-gate | 0 | None |
| sprint/research-military | 0 | None |
| sprint/research-politics | 0 | None |
| sprint/situations-1862 | 0 | None |

liveness-gate.ts conflicts with 1a, perf and playtest. The S16 around(3) observation uses its own pre-integration input set; do not overwrite S1’s independently recentered integrated bands. A merged data change also invalidates using S30 hashes as preservation proof of the combined runtime.

These are pairwise probes only. A clean pair does not establish a clean cumulative merge, compatible semantics, passing rules/history checks or preservation of signed content. Regenerate generated conflicts with their owning tools; handwritten conflict choices need the owning lane and reviewer.

## Retained validation and open work

S9’s initially blocked applied candidate is superseded by S16, whose unchanged historical tests pass. Warnings remain 17 identical cells. S16 reports reproducible apply outputs, historical wire/bombardment/evacuation assertions and a full check; its campaign still fails timing and four 1A criteria.

S32’s own validation receipts are in [README](README.md#s32-validation). That checks this audit worktree and packet integrity; it does not re-execute all branch suites or substitute for Claude’s whole-branch review.

## Findings outside my scope

liveness-gate.ts conflicts with 1a, perf and playtest. The S16 around(3) observation uses its own pre-integration input set; do not overwrite S1’s independently recentered integrated bands. A merged data change also invalidates using S30 hashes as preservation proof of the combined runtime. Standing review, lead rulings, separate gate review, cumulative integration, runtime repairs, CI and pushing remain with their owners.
