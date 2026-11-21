# S18: rules that matter become checks

For the lead: 2 items.

Completed S18 only in `C:/Pyrrhic/sprint-checks`, branch `sprint/checks`, from `79bd9d6`. Read CODEX's top standing, command-line and writing rules, the S1 to S10 sprint message, S18 and decision 0106. `npm ci` ran first: exit 0, 51 packages added, 56 audited, zero vulnerabilities. Review remains with Claude after the sprint under 0106. No production code, pack data, signed content, saves or desk source changed. No push, history rewrite or hook bypass.

## Delivered checks

All four run through `npm run check:rules`, inside `npm run check` and CI. The hook also checks exact staged history before running the staged tree's ordinary gate. It honors `GIT_INDEX_FILE`; an unstaged data repair cannot hide a staged violation. The pre-existing no-git mode retains its original two fixture-file exclusions.

| Check | What fails | Fixtures |
|---|---|---:|
| B2 situation causes | An event that can hold with no positive cause in State, including a date branch inside `any` or a negated absent flag; a railroad label without an exact cited exemption | 10 |
| Projection truth | Direct or statically reachable reads of `postStates`, `departmentFactions`, `personService`, `battleRecords` or `reportTruth` outside exact cited derivations | 26 |
| Liveness causes | A changed/additional/retired band without a chained observation and cause record; a positive band unequal to `around(observed)`; rewriting the origin or old cause records | 12 |
| Signed content | A signature whose canonical hash differs, including signed drafts or items now tagged `gate.none`; stripping a known signature/file; omitting a newly signed path from the inventory | 8 |

Two additional baseline-history fixtures and 18 staged-hook fixtures bring the focused result to **76 passed**, exit 0. The core fixtures use fictional, in-memory data. The Git fixtures use disposable repositories; no production sign-off was created.

B2 uses the existing condition schema/evaluator rather than a search for any flag. The nine exemptions in `tools/rules/cause-exemptions.json` cite the existing premise/outside-model rulings. Each binds the situation, resolved text in every declared locale, and cited source rows. A wording-only change invalidates it. Wheeling's convention, Richmond's move and Missouri's notice currently have their positive prerequisites and pass.

The projection scanner parses TS/TSX and follows named/default imports, barrels, namespace members, callbacks, arrows and local adapter methods. Exact derivation allowances bind the entire reachable helper closure: retargeting an intermediate helper invalidates the allowance even if the final accessor is unchanged. Projection roots are kernel views, seat requests/beliefs, CLI desk modules, browser desk modules and adapter methods. Session/bootstrap scripts are host operations. This is a conservative, type-blind architecture guard; it does not prove arbitrary dynamic dispatch or opaque computed keys safe. Existing import-boundary and paired-State tests remain necessary.

The liveness origin retains **338** resolved bands from the unchanged base. `liveness-changes.json` is empty because this lane changes no band. A future record names the run/mechanic key, before/after bands, observed count, cause and an existing evidence file. Positive bounds must equal `min=max(1,floor(n/2))`, `max=max(2*n,n+3)`. The checker replays the ledger to the actual exported reference bands. A cause cannot be banked in one commit for a later unrecorded change.

Signed hashing reuses the pack format's `gateContentHash`, including displayed translations and cited provenance. `signed-inventory.json` lists **29 existing paths**, without writing signatures. The staged history guard prevents shrinking that inventory to hide a removed sign-off. The existing gate still owns reviewer identity, review versions, wording and placement.

## Findings on pinned main

Read-only audit of **`ce3811b9fe3fb83e12472c5110a202ca10e749ba`**, exported by its full object ID. Its 305 scanned source inputs match this branch after line-ending normalization. The settled audit covers 64 live/draft situations, 29 signatures and 338 bands. Evidence: `runs/s18/main-ref.json`, `main-audit-settled.json`, `audit-input-comparison.json`.

**Ten B2 findings remain unchanged in production:**

- `chickasaw_treaty`
- `choctaw_treaty`
- `indian_territory_posts_given_up`
- `muscogee_treaty`
- `pickens_refused`
- `pierpont_elected`
- `texas_governor_changed`
- `wheeling_legislature`
- `wheeling_ordinance`
- `wheeling_recognition_letter`

These retain railroad labels with State dependencies and need the lead's classification: remove an unwarranted label in the production owner's lane, or approve a precise cited outside-model exemption. This lane does neither. They are authoring findings, not new historical conclusions.

**Three projection paths remain for classification**, all in `packages/kernel/src/seats/requests.ts`:

| Projection | Recorded read path |
|---|---|
| `reviewsFor` | Current `postStates` |
| `principalMenu` | Current post/department/service truth through the command and seats helpers |
| `pendingRequests` | The aggregate request builder, reaching those readers and battle-record derivations |

The full paths and fingerprints are in `tools/rules/existing-findings.json` and the settled main audit. These are confirmed read paths, not a claim that every kernel menu judgement is an information leak. The lead should distinguish an allowed consistency derivation from player-visible truth exposure before choosing a production fix or another exact allowance.

There are **zero stale signed hashes** and **zero changes from the liveness origin** on this pinned main. Matching the origin does not retrospectively certify every old observation/cause; the new structured ledger is prospective. The 13 existing findings are exact fingerprints, not broad path exemptions. Their baseline cannot grow through a normal commit. Refreshing a fingerprint requires a checker change; removing a resolved entry is allowed. A stale baseline entry also fails.

## Proposed rulings and rejected alternatives

1. Keep an exact, non-growing baseline for the 13 current findings so this lane can deliver checks without changing production. Reject broad exclusions or silently accepting edited/new defects.
2. Require explicit cited premise/outside-model exemptions for date-only branches and railroad labels. Reject trusting the railroad prose alone or attempting natural-language historical inference in a validator.
3. Permit only exact cited projection derivations, including their helper closure. Reject a file-wide whitelist and a root-only fingerprint that would miss an intermediate helper's changed target.
4. Use an immutable 338-band origin and append-only observation/cause records. Reject automatically running campaigns to fit bands or accepting arbitrary hand-written limits. Existing quiet/stalled bands stay at the origin; introducing a new quiet/stalled shape needs an explicit lead policy rather than an implicit exception to the positive `around(observed)` rule. Explicit retirements require a cause too.
5. Retain the known signed-path inventory so removing both the gate tag and the sign-off cannot hide an edit. Reject checking only currently gated items or writing replacement sign-offs in S18.

## Verification and commits

| Step | Commit/result | Actual gate evidence |
|---|---|---|
| B2 | `98c4250` | Hook exit 0: 140 files; 1,555 passed, one expected failure, five conditional skips |
| Projection | `f740e7e` | Hook exit 0: 141 files; 1,579 passed, one expected failure, five conditional skips |
| Liveness/history | `5665f5e` | Hook exit 0: 143 files; 1,598 passed, one expected failure, five conditional skips |
| Signature/inventory and this hand-over | Final check commit; exact hash and hook result recorded in the final CODEX status and external evidence | `runs/s18/commit-04.log` and `.exit` |

Every commit message has the required Codex footer. `MANDATE_NO_GIT=1 VITEST_MAX_WORKERS=2 npm run check` **exits 0** on the complete final code: **142 files; 1,588 passed, one existing expected failure, three conditional skips**. Typecheck, all four rules, boundary, licences and the 106-record decision index pass.

Red/green evidence is retained in `runs/s18/01-red.log`, `02-red.log`, `03-red.log`, `04-red.log` and the later context, helper, namespace, closure, reference and signature-presence controls. `final-focused.log` records the 76 passing controls. These controls failed before their implementations/corrections and passed after.

The initial B2 hook failed the CI workflow's missing new rule step; its ten CI fixtures passed after the step and summary wiring were added. The first projection hook timed out in the existing done-check suite's 300-second setup, with no assertion failure. That same suite passed alone (14 passed, one conditional skip, 244.86 s); the corrected full hook passed with two workers. The first final-hook attempt was stopped for one hand-over dash damaged by PowerShell piping; it was replaced with the ASCII words "to" and audited before the corrected hook. No timeout or assertion was weakened. All failure categories were inspected before the affected hook was repeated. Later hooks retain that scheduling cap; no production configuration changed.

### Required default runtime sweep

One normal **eight-seed** `npm run run:done-check -- --label s18-done`, including drafting, **exits 1**: Phase 0 **5/6**, supplemental 1A **2/6**. Engine and pack inputs are unchanged throughout this tooling run, so this evidence is reused across the check commits. There was no second campaign, threshold change or timing waiver.

All **13 problems** are retained in `runs/s18/runtime-evidence.json` and the complete `done-check.log`:

- Budget: Union war median **50.00 ms** exceeds 40; history median **156.18 ms** exceeds 40 and p95 **288.44 ms** exceeds 160. This is a shared-host measurement, not an idle-machine or CI claim.
- Checkpoints: Confederate known men **20,957**, below 100,000; planned operations fought **0** for both sides, below 1. The Union's 18,686 known men are reported below its nonbinding floor, not claimed as another failed assertion.
- Operation: no fought history operation, with two operations and zero battles.
- Pushback: relay holds **1/2 minimum**, filter holds **0/1**, trims **0/1**, reservations **44/9 maximum**.
- Lever sweep: grievance/policy pushback is unmeasured, and the border-governor chain is unexercised inside the horizon. Eight decisions and 248 recruitment calls were weighed; a partial result is not D6 clearance.

Behaviour, frozen/unfrozen hashes, replay, save/resume, liveness and section-ten pass. Both retained summaries have zero rejections. Union final State is `55a35b1034c19b09f121d3ffcd311219b416e864257b43b1bb9370a33c8e7006`; testbed is `69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`. These are this base's results, not a new integrated S1 build.

## Preservation and evidence

The code inventory and runtime diagnostics preceded this final hand-over. `runs/s18/final-checks.json` indexes evidence; `preservation-and-inventory.json` and its final code inventory record scope/hashes. All 27 code/config/test delivery files are inside this lane's scope; this hand-over is the 28th delivery file. Protected diff against `79bd9d6` is exit 0 for `packages/`, `packs/`, `prototypes/`, `.githooks/` and this worktree's `CODEX.md`. Runtime, checkpoint bounds, signed inputs, save fixtures and desk sources are preserved. The sole shared-checkout write is the final append to main's CODEX, read fresh and prefix-checked separately. No server was started.

For the lead:

1. Review the whole branch under 0106 and rule on the baseline, exemptions and exact derivations; classify the ten B2 and three projection findings before routing any production edit. Gate-owned classification/sign-off stays with the separate gate reviewer.
2. Route the unchanged runtime/timing failures to S1/S2. The new tooling checks pass; their success does not waive those acceptance criteria.

## Findings outside my scope

The ten B2 classifications, three projection classifications, shared-host tick budget and the inherited checkpoint, operation, pushback and D6 gaps remain with their production owners and the lead. No other sprint request or worktree was changed.
