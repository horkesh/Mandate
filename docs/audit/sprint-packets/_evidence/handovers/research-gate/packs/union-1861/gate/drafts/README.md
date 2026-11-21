# S23: proposed gate entries for August 1861–November 1862

For the lead: 3 items. These are **unsigned drafts for the separate gate reviewer** under 0106, based on `5c1e8ed4739b135abe02914aae13ec6e1bd88d32` on `sprint/research-gate`. S23 is the only request undertaken. The reviewer places the facets and signs approved content after the sprint. No live register, signature, source policy, source table, string, situation, generated World, scenario or runtime input is changed.

Read [common-rules.json](common-rules.json), then [coverage.json](coverage.json) and the relevant topic dossier. [sources.json](sources.json) maps 28 evidence references to the read research notes, printed-page citations and source limits. The original S7 manifest and scans are reused; this run does not claim a new inspection of every primary page. Inherited authority and source pointers are identified separately in each dossier. They are not new source-policy exceptions.

There are 33 dossiers: 20 continuations of entries at the pinned base and 13 proposed additions. Each `entry` uses the existing register schema. The surrounding material supplies source references, facet recommendations, agency reasons, trigger candidates, protected groups, wording rules, unresolved work, proposed rulings and rejected alternatives. These annotations are out of world. Only the explicitly labeled wording examples resemble player text; they are not strings for loading. Artificial matcher fixtures in `verify.mjs` are also out of world.

The entry's status, placements and dates are proposals within a draft, never approval. An inherited entry retains its window, placements, status, superseded options, source hold and every refused signature. New envelopes are review bounds, not incident triggers or proof of when news arrived. The existing classes, global trigger allowlist, forbidden patterns, anachronisms and source policy remain unchanged.

The topic batches are:

| Subject | Dossiers | Review focus |
|---|---:|---|
| Slavery and emancipation | 7 | Self-emancipation, fugitive policy, camps, emancipation policy, coerced labor, wealth framing and the protected-labor facet of cotton |
| Black service | 5 | Earlier offers, 1862 authority/service, pay, naval entry and November capture policy |
| Prisoners | 2 | The 0074 battle boundary and R4's exchange, parole and camp questions |
| Civilians and coercive policy | 10 | Guerrillas, occupation, Unionist repression, both habeas policies, press, mobs, earlier civilian deaths, exemptions and the committee facet |
| Native nations | 2 | Nations' own acts and the held Dakota topic |
| Continuing framing | 7 | Cause, inaugural, Corwin, war aims, Lost Cause traps, racist opposition and verdict obligations |

The coverage file explains the five wholly later topics, the neutral-option rule and mixed windows. Ordinary cotton/prizes, commutation and emergency militia do not become gated systems merely by appearing in that coverage. Fort Pillow and Sand Creek atrocities are later; the committee's in-window existence does not open them. December Dakota review/executions, December capture proclamation and the January final proclamation remain outside this request's November endpoint.

## Proposed rulings and alternatives

1. **[I] Preserve the holds and use bounded source clearance.** S7 supports particular camp reports, service disputes and local conditions. Recommend reviewing those facets individually before any source lift. Reject treating a published report as a national census, an order as implementation, or a typed reason as an implemented mechanic. R2, R3, R4, R6 and the camps' whole-topic source hold remain unresolved. The new `emancipation-policy` candidate is held for R7; the committee candidate is conservatively held until its in-window facet is separated and re-sourced. These extra proposed holds are explicit recommendations, not changes to live release behavior.
2. **[I] Distinguish the March and July fugitive restrictions by conduct.** The 13 March Article of War prohibits employing commanded forces to return fugitives; July separately restricts deciding claims and surrendering people. Recommend a March gate for the earlier prohibited conduct and retain July's additional clauses. Reject a blind date replacement. The inherited expiry and option ids are unchanged pending the lead's conduct/owner/knowledge ruling.
3. **[I] Keep agency, hostile claims and later testimony separate.** Recommend reading Pierce against Hunter's account, distinguishing separate Saxton authorities from actual enlistment, preserving the statutory word “may” in the clothing provision, and treating the November capture documents as reports and threats without inventing the captives' fate. Carpenter, Taylor and Big Eagle retain their later publication/interview provenance. Reject a uniform voluntary-service claim, mortality rates from incompatible counts, a unit-strength total from authorization ceilings, or a new July transcript assembled from retrospective testimony.

Each topic gives its narrower recommendation. The permanent refusals on people as resources and atrocity choices survive any future lift. The R6 `executions-and-reprisals` split is left to its owner; no refusal disappears through renaming. Dakota remains R3's separate ruling, including its exception in 0074; no clemency or execution menu is supplied. Native-nation agency classes do not substitute for atrocity classification/sign checks on conduct.

## Verification and evidence

Run the focused author check from this worktree:

```powershell
node --import tsx packs/union-1861/gate/drafts/verify.mjs C:/Pyrrhic/mandate-research-sources/S7/S23/draft-audit.json
```

It checks the existing register schema, source resolution, preserved baseline restrictions, unsigned boundaries, UTF-8, coverage, compilation of signatures/triggers, positive and negative examples for new refusal signatures, proper-noun exclusions, allowed write paths and the actual pack loader with drafts visible/hidden. Inherited signature behavior is covered by the unchanged `gate-register.test.ts` in the required checks. Matcher probes are not end-to-end gate approval or a D6 sweep; new live patterns will need the lane 1.8 end-to-end coverage when adopted.

The required `MANDATE_NO_GIT=1 npm run check` and each actual commit hook have separate retained logs/results in `C:/Pyrrhic/mandate-research-sources/S7/S23/`. No test, timeout, band, budget, fixture or hook is changed. The commit footer is `Co-Authored-By: Codex <noreply@openai.com>`; the branch is never pushed or rewritten. Final receipts and inventory are in that folder's `final-checks.json`, written after all topic commits.

**Runtime evidence is reused explicitly.** The default S7 eight-seed done check with drafting exited **1**, in **2,045.50 seconds**. Phase 0 passed behavior, hash/replay, resume, liveness and section-ten, and failed budget. Supplemental 1A failed checkpoints, operation, pushback and lever-sweep; unknown-strength and stand-ins passed. Union median/p95 was **62.94/128.59 ms**, history **104.81/217.96 ms**, against unchanged **40/160 ms** limits. Confederate strength and both operation floors failed; no planned operation fought a history battle; relay/filter/trim/reservation bands failed; the people grievance channel was unmeasured and the border-governor recruitment channel unexercised. The Union strength floor was expressly nonbinding. These failures remain acceptance gaps.

`preservation-and-reuse.json` verifies all **218** S7 source artifacts and **five** runtime artifacts against retained hashes, and checks that code and live inputs remain unchanged from S7's runtime base. `settled-draft-audit.json` records the actual loader comparison and tracked-tree preservation before this hand-over. No repeat campaign is justified by draft-only additions that the loader does not read. There is no new simulation, timing, release or gate clearance.

The first focused audit exposed omitted explicit empty protected-group arrays in some wrappers. The authoring helper now supplies them. The corrected audit checks those arrays and passes. No historical source or live pack change was needed.

The first actual hook, with two workers in its staged snapshot, **failed**: one failed suite / 138 passed, 1,532 tests passed, one expected failure and 19 skips. `done-check.test.ts` exceeded its unchanged 300-second setup bound; the hook exited 1 after 619.00 seconds and wrote no commit. Later chained gates were not reached. Their earlier no-git results are retained, not relabeled as part of that hook. A targeted check of the same file in a new exact staged snapshot with one worker then **passed: 14 passed / one timing skip**, exit 0, 192.08 seconds. The full one-worker retry passed: 139 files / 1,546 tests passed / one expected failure / five conditional skips, exit 0 in 1,060.72 seconds. Later subjects are restored from session memory one at a time so the unchanged hook checks the exact tree in place. The Black-service hook passed with two workers (139 files / 1,548 passed / one expected failure / three skips), but the prisoner hook subsequently hit the same setup timeout: 138 files passed, 1,534 tests passed, one expected failure and 17 skips, exit 1 after 719.56 seconds. Snapshot location alone therefore does not explain the intermittent failure [I]. All remaining hooks use one worker, reusing the already passed serial diagnostic; no further concurrency experiment or full runtime campaign is added. The consolidated diagnosis is retained in `timeout-diagnosis.json`. No timeout, test or acceptance criterion was changed. The original failure, targeted result and each full-hook receipt remain separate; final hook verdicts are recorded in `final-checks.json` and CODEX.

## For the lead

1. Route the whole branch to the standing and gate reviewers after the sprint; decide the proposed holds, facet placements and source adoption before promotion. No draft can be copied straight into the live register as an approval.
2. Route the March/July conduct distinction and R2/R4 capture boundary to their owners. Before any Black unit fights, the capture re-ruling required by 0074 still has to exist.
3. Keep S1/S2's retained runtime failures open. Cost sizes, active owners, specific advocates, source-row adoption, final strings, end-to-end matcher coverage and the real D6 sweep are implementation/review work after placement.

## Findings outside my scope

Original Palmyra proceedings, actual captive fates, complete muster/payroll chains, Barker's unresolved death numeral, exact cabinet chronology, Dakota trial/detention/removal records and the weak committee establishment/Stone source chain remain research questions. No other sprint worktree or lane hand-over is edited. The original S7 and lane 1.8 notes remain preserved; this README is S23's hand-over within the authorized draft directory.
