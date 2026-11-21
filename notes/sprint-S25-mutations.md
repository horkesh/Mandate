# S25: kernel mutation survey

S25 only, in C:/Pyrrhic/sprint-checks, branch sprint/checks, from 39c279cefc3e836e9a7f6a39acbb6772393a16ab. Production sources and original tests were read-only. No push, merge or history rewrite. Decision 0106 defers independent whole-branch review until after the sprint; this is author verification, with nothing signed.

## Outcome and method

The finite survey contains **229 mutations in 32 module groups**. Existing tests kill 117 through failed test cases; one further break prevents fixture setup. Of 111 raw survivors, **88 are killed by the added regressions**. The other 23 have explicit equivalence or domain classifications and are not counted as kills. No unclassified rule break remains in this sample. **92 new tests in 27 files pass on unchanged production code.**

The source inventory includes all 144 current kernel TypeScript files, with no unassigned file. The selected operators produce mutations in 124 files; twenty declaration, vocabulary, re-export or simple wrapper files have no selected mutation. This is a finite sample across modules, not exhaustive branch coverage or a whole-suite mutation score. Each mutant records the selected existing suites. Broader tests might already catch a survivor of those suites; the report makes no contrary claim.

The driver, packages/kernel/test/support/s25-survey.mjs, uses the installed parser to select short comparison, boundary and arithmetic expressions, plus explicit ownership/unknown-seat guard removals and a truth-for-belief substitution. A Vite pre-transform changes one expression in memory. No production file is edited and restored. Each run requires a matching source hash and an application receipt. The mutation configuration disables filesystem module caching, keeping injected modules out of normal checks.

Per-group existing-test baselines pass. Every added kill has two controls: the real-code regression passes, and the new module file alone fails with its mutation applied. The exact source, line, expression, replacement, source hash, selected suites, failing test names, exit codes and evidence paths are in [s25-survey-results.json](../packages/kernel/test/support/s25-survey-results.json). [s25-equivalence.json](../packages/kernel/test/support/s25-equivalence.json) supplies the classifications and limits. The fictional shared fixture is s25-fixture.ts; it adds no historical quantities or live pack input.

Reproduce from this checkout with Node 22 and the locked dependencies: run node packages/kernel/test/support/s25-survey.mjs list, then baseline, then run <group-or-id> before. The after stage selects the new module file alone. The driver reuses retained successful verdicts; use a fresh runs/s25 directory in a separate checkout for a fresh campaign. Raw logs, JSON assertions, receipts, exits and the exact generated manifest remain in ignored runs/s25/. Do not treat an unloaded mutation or infrastructure error as a kill.

## Module results

Existing kills include the one separately reviewed fixture-setup kill in infrastructure. Raw survivors are survivors of the named existing suites, before the additions. Classified cases are not new kills.

| Module | Mutations | Existing kills | Raw survivors | Added kills | Classified |
|---|---:|---:|---:|---:|---:|
| knowledge | 10 | 4 | 6 | 3 | 3 |
| view | 11 | 8 | 3 | 2 | 1 |
| seats | 10 | 7 | 3 | 3 | 0 |
| tick-orders | 11 | 7 | 4 | 4 | 0 |
| tick-verbs | 11 | 6 | 5 | 5 | 0 |
| combat | 10 | 5 | 5 | 2 | 3 |
| people | 10 | 9 | 1 | 1 | 0 |
| command | 5 | 3 | 2 | 2 | 0 |
| control | 5 | 4 | 1 | 0 | 1 |
| control-index | 5 | 2 | 3 | 3 | 0 |
| forces | 5 | 1 | 4 | 4 | 0 |
| infrastructure | 5 | 5 | 0 | 0 | 0 |
| movement | 5 | 5 | 0 | 0 | 0 |
| supply | 5 | 1 | 4 | 2 | 2 |
| messages | 5 | 3 | 2 | 1 | 1 |
| plans | 5 | 1 | 4 | 4 | 0 |
| planner | 10 | 0 | 10 | 7 | 3 |
| operations | 5 | 4 | 1 | 0 | 1 |
| politics | 5 | 3 | 2 | 1 | 1 |
| regions | 5 | 0 | 5 | 5 | 0 |
| situations | 5 | 3 | 2 | 2 | 0 |
| reading | 5 | 1 | 4 | 3 | 1 |
| audience | 5 | 2 | 3 | 3 | 0 |
| proxy | 5 | 0 | 5 | 4 | 1 |
| ladder | 5 | 2 | 3 | 3 | 0 |
| recruitment | 5 | 4 | 1 | 1 | 0 |
| serialize | 5 | 5 | 0 | 0 | 0 |
| world | 5 | 4 | 1 | 1 | 0 |
| log | 5 | 2 | 3 | 3 | 0 |
| tick | 26 | 9 | 17 | 14 | 3 |
| primitives | 10 | 5 | 5 | 4 | 1 |
| state-support | 5 | 3 | 2 | 1 | 1 |
| **Total** | **229** | **118** | **111** | **88** | **23** |

The regressions cover zero-valued inputs and conservation, exact date/age/length/cooldown thresholds, ordering ties, report and control boundaries, planner search and axis limits, availability, and tick telemetry and state transitions. The JSON records map every new kill to its exact regression, rather than infer coverage from a green process exit.

## Classified survivors and proposed rulings

Twelve cases are equivalent in the examined expression, eight rely on current producer inputs, two differ only in current scratch representation, and one is equivalent as a canonical number. The manifest and classification file retain all 23 ids and their reasoning. Producer-domain classifications explicitly exclude malformed or legacy constructions; internal maps/property shapes and JavaScript signed-zero identity are not claimed identical.

Important limits: contradictory duplicate government claims have no invented first/last precedence; zero attacking batteries cannot execute the current bombard stage; produced broken flanks have positive thresholds; operation producers cannot emit two distinct operations for one post/start day; the current SeatsWorld constructor always supplies its map. A changed producer or consumer could invalidate these classifications. Review them as proposed rulings, not newly accepted contracts.

1. **[I] Use in-memory injection and source-hash/application receipts.** Reject editing and restoring live sources, which risks leaving a break behind and disturbing other worktrees. Invalid/unloaded attempts remain separate from rule kills.
2. **[I] Assert observable rules and supported-domain outcomes.** Reject tests that freeze incidental empty-map/property shapes, signed-zero identity, or invented semantics for contradictory malformed input merely to improve a mutation score. Keep all 23 classifications visible for the lead's review.
3. **[I] Keep the fixed sample and report its limits.** Reject an exhaustive-coverage claim and an expanded campaign without a new question. The planned cap was 240; the settled manifest has 229. Existing full-suite evidence is reused where unchanged, with required module hooks still executed.
4. **[I] Keep all thresholds and reduce owned validation contention.** Reject raising timeouts or calibrating model bands to obtain green checks. Scheduling changes affect only this run's Vitest CLI worker count, through an ignored preload; no production, hook, suite selection configuration or timeout is edited.

## Validation and retained failures

Dependencies reuse S18's successful npm ci in this same worktree. Lockfiles remain unchanged; kernel and CLI workspace junctions resolve into this checkout. Package/data inventories and the completed runtime diagnostics preceded this final-result text. Evidence: runs/s25/package-inventory.json, preservation.json, delivery-inventory.json, runtime-artifacts.json, runtime-diagnostics.json and final-audit.json.

- All 32 selected-module baselines pass. All 229 final before-verdicts have application receipts. All 88 after-proofs fail in the new module file; all 92 new tests pass together in 27 files, with no new skips. Typechecking and diff whitespace checks pass.
- Required **MANDATE_NO_GIT=1 npm run check exits 0** in 538.308 seconds: **169 files, 1,680 passed, one expected failure, three inherited timing skips**; compiler, rule scan, boundary, licences and the 106-record decision index pass. See check.log/.exit/.receipt.json. The ordinary final closeout hook's receipt is commit-closeout.log/.exit; the coordination status records that result.
- All 27 module commits pass the real, unchanged hook. Knowledge, view and seats run both Git-fixture suites. Their unchanged source hashes and evidence are recorded in reused-hook-evidence.json. Later module hooks use the standing MANDATE_NO_GIT=1 setting, excluding only tools/test/staged-check.test.ts and tools/test/lfs-git.test.ts. Every simulation, pack and rule check remains. Snapshot hooks have one additional inherited Git-context skip in tools/test/lfs.test.ts because the snapshot has no .git. The final tick hook reports 169 files, 1,679 passed, one expected failure and four skips. The closeout hook restores the ordinary full selection.
- The first knowledge hook attempt exceeds the existing done-check setup limit. VITEST_MAX_WORKERS was not supported by the installed runner. An explicit CLI limit passes the isolated fixture (185.74 seconds, 14 active tests and one inherited timing skip), then three complete full hooks. The later verbs hook again fails solely on the same beforeAll: 335.814 seconds against unchanged 300,000 ms. Its other 146 files pass; downstream gates were not reached in that attempt. Every failed log and exit is retained, not recast as a pass.
- The queue stops at that failure. After the required default CLI finishes, the fixture alone passes with one worker in **174.31 seconds**, then the required full worktree check passes. The resumed module queue uses one worker without a competing owned campaign; all remaining hooks pass. No extra campaign, weakened timeout or skipped fixture is used as a correction. The first sequencing-helper attempt misreads PowerShell's UTF-16 log and stops before launching validation; only its ignored reader is corrected.
- Tick/edit-preview's original suites did not load that source. The unloaded receipt is retained and excluded; adding its existing send-back suite produces a valid kill. infrastructure-05 unconditionally throws InfrastructureError with an empty problems list during fixture construction; it is separately classified as killed-setup. Early fixture/type errors and two targeted regression corrections remain in the retained attempts. The final controls and proofs supersede those attempts; no whole campaign is repeated for reassurance.

## Required default runtime result

Exactly one normal default npm run run:done-check -- --label s25-mutation-survey, including all eight seeds and drafting, **exits 1**. Elapsed time is approximately **2,489.3 seconds** from log timestamps. Phase 0 passes **5/6**; supplemental 1A passes **2/6**. There are **four timing breaches and ten 1A problems**, all retained in runtime-diagnostics.json and done-check.log.

War median/p95 are **121.29/350.36 ms**, history **214.16/543.33 ms**, against unchanged **40/160** limits. These are shared-host observations, not unloaded or Linux CI certification. No timing waiver or second measured campaign.

The ten 1A problems reproduce the pinned branch's functional gaps: Confederate known strength 20,957 below 100,000; both planned-operation floors at zero; no history operation fighting a battle; relay holds 1 below 2, filter holds 0 below 1, trims 0 below 1, reservations 44 above 9; and two lever-sweep evidence gaps (the victory measure does not read grievance, and no border governor answers a call within the measured horizon). Eight seeds and eight gated decisions are weighed, with 248 base-run calls. No D6 clearance is inferred.

Hash, replay, resume, liveness and section-ten pass. Final Union hash is 55a35b1034c19b09f121d3ffcd311219b416e864257b43b1bb9370a33c8e7006; testbed is 69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb. Both match S18. No history operation battle limits the unknown-strength pass. Drafting is sound; the capped-day worst is 176.7 ms, an informational result rather than a changed acceptance criterion. Five run/save/drafting artifacts are hashed in runtime-artifacts.json.

## Module commits

Each commit has the required Codex footer. The knowledge commit also introduces the shared fixture, driver and initial plan. All later module commits contain their own single new test file. The final data/driver/handover closeout is separate. No other branch was checked out or written.

| Module | Commit |
|---|---|
| knowledge | `a0113f0830fd3dccfe2dda899b855747799a7dd3` |
| view | `12450d206ac70aa45a9115cabb739f61a7e599eb` |
| seats | `07148971db8a75381b16a8509083c18736410ca4` |
| tick-orders | `3bc01971fc15ed41678f8f71ffe3ab56eda52b94` |
| tick-verbs | `4c460e6c8496fa23904fd5fd639d9a5cc769ef3b` |
| combat | `52918d25d48e806c09cbc4499b1cd14141c0990c` |
| people | `7551063bb4b049c9ccb90bdb960a9467edcbeaa2` |
| command | `b06e709374a98732a5480ea93bf28f5cd3751b50` |
| control-index | `df7a111755c6897e0e07a6d70f7abc07fa237db9` |
| forces | `c29f3dca73e7479b3624f6ab775a744e4661a5d9` |
| supply | `cbc3492357f8472fc727225959699fb547fa561d` |
| messages | `c5f4e5729a009a603e24ef5cdd0b60f957113f39` |
| plans | `b2b256f60fd5f9570439630ff50ba173b6822e54` |
| planner | `4987a3203cb2f87c5619a8530db04f93570bed1b` |
| politics | `32d3b70fcb3cdb76e1c726933c4dc3e6f87bb45b` |
| regions | `101c582ff0bb34dd0377326cf4605f494b7fa3d0` |
| situations | `be73c40971475c5d223ed98cc9c7253f9c29dac0` |
| reading | `fa0bc7549c53ec615a0764996969393ae49d7fc7` |
| audience | `f873a8b92bd00b310bf0475b4d6b3df96ae29d27` |
| proxy | `37ae1f5871344eecaa6d83da0ffcbe065c46e46b` |
| ladder | `0d97e25576aaa5f108bf5b57c7aae51f7702a6e3` |
| recruitment | `57ddb244726503abfccb803d4aac944ced803bd1` |
| world | `22d1ea19cbbf66d804fd985ce4d0c4fd6a40eec3` |
| log | `a3926888a79925bc37ed96b457c7f128dfa137be` |
| primitives | `efdcd65ca45182665b4157407f2b2bb3422463d9` |
| state-support | `36a14f5752d777dc6833bf05301ae2bce77a11f1` |
| tick | `9334eca77c773af864adcb9420a4697f1271c121` |

## Preservation

All **1,696 original tracked paths are unchanged against 39c279c**; current byte hashes are retained for every original. The **32 delivery files** are 27 new test files, four test-support files and this note. Production, old tests, accepted decisions/canon, live packs/generated Worlds, signed/gate material, lockfiles, hooks and other sprint worktrees are untouched. Only the main CODEX coordination append is written outside this worktree, after a fresh read, when the run ends. Its prior-byte-prefix proof is retained in coordination-append.json. No push, merge or rewrite.

## Findings outside my scope

Content-shortened call ids lose the suffix consumed by isCallAnswer. Later shortened calls can therefore lose unconditional call-answer retention. The proxy regression probes first-answer retention and ordering for those already-produced ids; it does not fix or endorse the recognition defect. The lead owns that production ruling and any resulting update to the fixture expectations.

The inherited S18 production classifications, timing and ten 1A gaps remain with their implementation, performance and gate owners. The lead must review the 23 equivalence/domain classifications and the whole branch under 0106; nothing here supplies gate signatures, releases D6, changes a sourced band or certifies CI timing. No production fix is authorized in S25.
