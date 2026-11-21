# S36 — received canon contracts

Branch `sprint/fixes-canon`, base `78eb7dbff1243409265ab2f71b41ceab08abeb36`. S36 only. `npm ci` ran first, exit 0. Headless only; no push or other sprint worktree writes. Decision 0106 defers standing and gate review.

## Scope and validation

Confirm A01–A11 against this base; fix A01–A05 first, then A06–A11. Add paired-State regressions for the five High findings. Reconcile O01–O03 in FOUNDATION as a proposal without changing code ownership. Leave D01–D16 alone.

Cheap gates: fixture/pack loading, regression reproduction, focused tests and typecheck. Retain pinned reference/history daily hashes and rule choices, compare after fixes, explain changes and every moved liveness band. Final gates: actual pre-commit hook and exactly one default eight-seed done check with `--milestone 1a`, drafting included. Expected final cost: tens of minutes locally. Stop on unexpected expensive failure, inspect all retained categories, correct/verify cheaply before an affected retry. Do not retry the campaign or tune numerical acceptance criteria. Raw logs and reproducible comparison scripts live in ignored `runs/s36/`.

## Findings confirmed on the base

All eleven S26 current-contract paths remain: live totals/candidate filters, live review and preview inputs, true planner control, literal player text, fixed report confidences, World provenance alias, missing post cache key, missing received succession, and conventional gate direction. S1 changed appointments and operations but did not remove these paths.

## Proposed rulings

1. A01 uses the latest received present-for-duty figure with source, author and date; an absent received figure is `null`. Reject live totals and equating unknown with zero. The existing all-block transfer request does not require a headcount; retain it for unknown counts and suppress it for reported zero. A provisional null-as-zero rule was rejected during cheap comparison, before the campaign.
2. A02 follows the lead's ruling: candidates use opening public ranks/offices and received service/loss papers. Actual service, status and office eligibility resolve the appointment; typed `appointment-refused` claims provide readable reasons. Reject live filtering or broader truth exceptions.
3. A03/A04 use immutable submitted-plan enclosures and bounded sender copies, owned by knowledge. Keep the latest enclosure per post beyond ordinary dispatch age so late objections can reopen it. Preview uses that enclosure's historical scoring basis and has no current commander/profile/intelligence read. Its private coefficients never enter `SeatView` or the menu; execution still re-expands and resolves compliance on arrival. Reject silently replacing a received paper with a live draft or promising that preview predicts execution. This enclosure is historical correspondence, not a persisted current derived cache; its adoption remains a proposed ruling for review.
4. A05 rebuilds the planner's holding index from the commander's received control claims. Preserve the accepted own-side supply/edge-condition exceptions; reject using the true enemy-holder index.
5. A06 injects the existing ICU formatter from the driver into the desk, moves player English to both packs' string tables, localizes typed preview/refusal failures and the prototype map location phrase. Preserve grammar tokens and non-seat saved diagnostics; reject a new formatter, English fallbacks or a boundary exemption.
6. A07 makes all 27 audited confidence defaults mandatory validated pack data, preserving their numerical values. Certainty and 0103's accepted press ladder remain unchanged.
7. A08 clones/freezes World provenance; A09 keys the cache on own post; A10 applies only received notice succession, in written chronology, against the known predecessor. Reject mutating World, fresh truth reads or premature future receipts.
8. A11 reads the measure owner's declared direction, including explicit provisional declarations for the two already reserved politics fields. It fails closed for undeclared measures. Reject inferring benefit from sign, per-pack direction overrides or re-signing gate content. No deferred system was built.
9. O01–O03 are expressly proposed FOUNDATION edits naming the existing writers; no code owner changed to fit the prose.

## Settled cheap evidence

`runs/s36/preflight.log`: 11 files / 462 tests passed, exit 0. Earlier High/plan/verb/ownership verification: 106 passed, exit 0. Red evidence is retained against the pinned base for A01–A05/A08–A10; A06/A07/A11 have focused red/green logs in worker evidence folders. Root and desk typechecks, pack validators and the headless adapter tests pass. Final hook and campaign results are below.

The first full no-git check exposed four old test-fixture categories (15 failed assertions): bombardment supplied enemy strength but no received shore control; gate wiring edited on private `planStatus` before receipt; a rule-seat test vacated an incumbent but left him alive/eligible; a resignation test nominated before its actual letter arrived. Corrected fixtures retain all numerical bounds, offer windows and outcome assertions. Bombardment now receives control evidence; gate wiring uses the received review; the appointment case uses a killed incumbent, received loss paper and a distinct eligible spare; resignation asserts absence before actual arrival, eligibility on receipt and final appointment by the original day-15 limit. The 75 targeted tests pass. Unreached boundary, licence and decision gates were checked separately and pass. No runtime code, band, timeout, skip or assertion was relaxed to resolve these failures.

That check completed in 511.96 seconds, exit 1: 6 files failed / 149 passed; 19 failed / 1,658 passed / three conditional skips. The remaining four failures were generated-artifact checks: three save tests rejected the old World hash after adding pack confidence rules, and the published situation schema lacked the new `appointment-refused` claim. Regenerated both with `tools/make-save-fixture.ts` and `npm run pack:schemas`, preserving the prior save and SHA-256 locally. Their 14 targeted tests pass. This is the repository's unreleased-fixture policy, not a migration or compatibility claim. The actual full hooks subsequently passed with Git fixtures enabled; the failed no-git run was not repeated for reassurance.

The final A02 follow-through test first failed when a delivered `not_serving` refusal still left its author on the candidate menu. The menu now reads received typed appointment refusals, with no live status read; 83 affected tests pass. Reference/history evidence is reused when their complete run argument signatures are identical.

The first code commit is `ad15a89f0d78cd5033aa309ce188ac02e198a185`, through the actual hook: exit 0, 555.92 seconds, 157 files / 1,695 passed / three conditional skips, all chained gates. The headless prototype build passes; its inventory is 271 files / 2,818,488 bytes, a local prototype build rather than a shipping package.

Before accepting the campaign, a further A02 path introduced by S1 was found: `doctrine.appointments[].ready` still read live service, status and held posts. Two valid paired-State fixtures reproduce that signal for both an unposted candidate and an officer transferring from an existing post. The readiness flag now uses the same received eligibility and office picture as the candidate list. Current eligibility still resolves at the destination. Reuse the already-computed seat view within each menu, rather than rebuilding it for every dated candidate; no derived data is saved. The reference comparison after this correction retains exactly the same final hashes, eight Union responses, no testbed choice changes and no band breaches.

Plan deviation: stopped the initial campaign attempt on this newly confirmed High defect, after 823.93 seconds, exit -1, before any final criteria were produced. Only processes matching this exact workspace and the unique `s36-done` label were stopped; their command lines and partial logs/summaries are retained. It is not a completed done check or an acceptance result. The correction then passed 125 focused tests, typecheck and the actual hook before the completed campaign below. No failed band was tuned and no timeout, assertion or criterion was weakened.

Pinned baseline reference and history: Union final `0cfa53c7505b94a60d454e824f2a8fa0c4ade794005e60b8391666e71944a52b`; testbed `69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`. Settled comparison and the final campaign: Union `2b007d310e5f9b8cab193d74485dacc99e4b3334f45c4cb39652caa209a6285c`; testbed `ee1b76d81d16951cd9d9cfcaecce1f773128ad5df4bfedea6b1ed60f4b014b56`. All 113 Union hashes from day 36 through 148 change; all 120 testbed daily hashes change. The first differences coincide with own sent-order copies entering knowledge; later differences also include historical plan enclosures and changed received-information choices. Both Union runs match each other. All have zero rejections. Pack World hashes also change with the new rules/string tables; the unreleased save fixture was regenerated accordingly.

Eight changed Union rule responses (identical in reference and history): day 70 Lincoln nominates Loring instead of Sumner from the unreceived service picture; day 78 he then nominates Sumner and delays the New Hampshire transfer under the attention budget; day 85 he requests that transfer; Davis requests a Virginia transfer on day 94 rather than 105, can inquire on day 100, and requests a Mississippi transfer on day 136 rather than 137. These are request days. [I] The source causes are received strength and service/eligibility news, acting through the unchanged priority, attention and in-transit checks. Testbed has no changed choices. The machine comparison retains exact before/after commands. No liveness band changed or breached; changed counts/magnitudes are retained, with unchanged acceptance bands.

## Final verification and remaining criteria

Corrective commit `a7eaf410ccada505204d1686726021d3ecf8a4da` passed the actual hook: exit 0, 617.04 seconds; **157 files / 1,697 passed / three conditional skips**, with typecheck, boundary, licences and the 106-decision index. No hook bypass or history rewrite. The 22 headless prototype tests and 26 focused boundary/localization tests pass. The prototype build is explicitly reused: its source and formatter files are unchanged by the kernel-only corrective commit.

One completed default eight-seed campaign on that corrected commit, drafting included: `npm run run:done-check -- --milestone 1a --label s36-done-final`, **exit 1, 1,451.75 seconds; Phase 0 5/6; 1A 4/6**. All replay, resume, liveness, architecture, checkpoint, fought-operation, recorded-strength and stand-in criteria pass. No band moved. All nine remaining problem statements are retained verbatim in `docs/audit/s36-evidence/runtime-diagnostics.json`:

| Failed measurement | Observed | Unchanged requirement |
|---|---|---|
| Union reference median | 43.35 ms/day | at most 40 |
| Union history median | 57.23 ms/day | at most 40 |
| Relay holds | 1 | 2–6 |
| Filter holds | 0 | 1–9 |
| Trims | 0 | 1–4 |
| Compliance with reservations | 17 | 1–9 |
| Slow walks | 15 | 2–9 |
| Policy grievance effect | not measured by the victory measure | required before any D6 clearance |
| Border-governor response chain | unexercised in 24 moves over eight seeds | must be exercised |

Reference/history p95: 66.27 / 111.29 ms, below the unchanged 160 ms limit. Testbed median/p95: 4.08 / 9.34 ms. These are local Windows observations, not Linux CI. Other pushback bands: relay objections 2 in 0–6, plan objections 36 in 10–42. The sweep weighs eight gated decisions across eight seeds, with 744 base recruitment calls; `return` is best in 0/8, which does **not** clear the two unmeasured channels or parked D6. No calibration or repeat of the completed campaign.

The history records planned operations fighting at Fort Sumter (operation day 38) and Manassas (operation day 137, battle day 144). Known men at the last checkpoint: Union 99,791 and Confederate 124,098; four and 17 blocks remain unknown outside the recorded battles. Drafting remains informational: all-command median/p95/worst 27.5/33.1/37.0 ms; worst capped day 22.7 ms.

Inventories and runtime diagnostics were completed before this final-result section. All **1,699 original tracked files** remain; protected art, gate content, situations and decisions match the base. The source inventory covers **80 code/test/pack/prototype files** and records working-file SHA-256, excluding this hand-over and the evidence documents. `reference-comparison.json` retains every changed day and all eight command differences. `validation.json` retains hook receipts, build inventory and raw-log hashes; raw evidence stays in ignored `runs/s36/`. The evidence parser initially assumed UTF-8 for PowerShell's UTF-16LE log, rejected zero parsed criteria, then decoded the BOM correctly and required all twelve criteria. No simulation was repeated for that correction. The documentation commit's required hook and final preservation check follow; their actual receipts belong in the shared final status.

## Findings outside my scope

S35, other sprint integrations, deferred D01–D16, acceptance-band calibration, standing/gate review, Linux CI, pushing and release remain with their owners. S35's note/edit scoring is intentionally unchanged here: integration must preserve the same admitted-note basis for the arriving edit and the new submitted preview enclosure, without exposing private weights. Its console fixes also need to retain the string-table boundary. Other S26 M findings were not undertaken or certified by this lane.
