For the lead: 1 item

# R56: send back with notes

Worked only in `C:/Pyrrhic/mandate-sendback`, branch `plan-sendback-notes`, from `ba76d277a7f12aa3efa6d81c082385085b7d2c9a`. Both requested `npm ci` installs passed before implementation. Git was read-only. No other worktree was written. Read the standing, command-line and writing rules, R56's records and plan-review presentation. Decision 0098 was read from the main checkout because this base predates its record; its delivery implementation is on this base.

## Where it stopped

R83 has resolved the working files for the lead-started merge of main at `e0a8ce7079badc3f889524405fff118e94fd8f5a` into `plan-sendback-notes` at `9f933f5ca05c28b23b5a45903582e4b7e9c94615`. The seven index conflicts remain unmerged because nothing was staged; HEAD, index and merge metadata are unchanged. Root check and desk checks pass. The standalone done check exits 1 on the history timing budget; its five other Phase 0 criteria pass. The lead's review and merge commit remain pending. No feature work was added. Details and the five remaining 1A failures are in the R83 section below.

R56 is approved at `13089c4`: the lead's R67 message accepts all five proposed rulings and reports the reviewer's passing 6/6 done check with timing. That supersedes the local R56 timing hold recorded below. R67 is complete on that same base, with five new regression tests and six successful deliberate re-break checks. The root check and standalone done check both pass. R67 awaits Claude's standing review under 0096. No decision, gate signature, commit or merge was authored.

## What changed

`ReviewCommand.notes` is optional for old-log compatibility and legal only on `send_back`. Each mark uses the closed `PlanNote` vocabulary, with flat, validated fields:

| Kind | Meaning | Console token |
|---|---|---|
| `focus` | Consider a different objective for the named axis | `focus:main:salient_base` |
| `via` | Consider an ordered route through these places | `via:main:w_valley,salient_base` |
| `wait` | Consider concentrating for at least this many days before moving | `wait:main:7` |
| `avoid` | Avoid this place on this axis | `avoid:main:salient_tip` |

Several tokens follow `sendback <post>`. `by=<route>` and `bypass` retain the order grammar. Colons inside identifiers use `%3A`. Unknown tokens, extra fields, malformed numbers and notes on approval are refused. The kernel checks known regions, a submitted axis and pack bounds; the log boundary validates shape. Seat answers copy each field and route array into the log, so replay keeps the marks.

The payload travels as `OrderBody.orderNotes`, through the existing route, latency, relay and bounce path. A known vacancy is refused at issue; a missing or changed holder on arrival returns the dispatch without a note response or redraft. Notes do not act before delivery. They add no attention charge; the existing special-messenger route charge still applies.

On delivery, each note is read by `answerOrder`, using pack-authored boldness/value terms, the commander's regard, grievances and existing oversight. `proxy` saves one response per note, identified by the original order, person and note index. `plans` stores the mark and response reference. Pruning preserves responses while their plan names them. A later send-back replaces the previous notes; a new goal starts without them.

The pure planner keeps its original candidates and generates bounded alternatives using the same passage, route and axis machinery. It can consider successive accepted marks together. A suggested objective and subsequent marks are scored against that suggested objective's perceived opposition. Avoidance uses the existing flank penalty; it never closes the region. Waiting changes a candidate's concentration, without imposing it. Every candidate receives a typed `notes` score term and a per-note breakdown: followed, declined, preferred own judgement, or no matching candidate. Different note dispositions survive deduplication. Search accounting and the existing daily cap remain in force.

The commander still chooses among his candidates. His goal, committed force, permissions, edit history and approval rules remain separate. Sending a plan back requests another draft even when he follows none of the notes. An arrow edit remains the way to bind a counter-order through its existing compliance path.

At submission, his ordinary report carries `reportNotes`: the marks, his stated account and stated reasons. The principal's review reads that received report, never the actual response table. Private note amounts and generation tags are omitted from the principal's plan and edit preview. An uncandid commander's private distrust is not exposed. The plan sheet and console format the account through thirty additive `plan.note.*` strings in each pack.

The map sends every held mark in one command. Its objective and waypoint marks become `focus` and `via`; a strike becomes `avoid` for the struck axis's reported objective. Marks clear only after queue acceptance; a rejected send retains them. The out-tray holds the actual note tokens and their text. Existing binding edit controls remain.

## Ownership and format

There is no new root State field. `PlanNote`, `NoteReading`, `NoteDisposition` and `NoteAccount` are registered in `IMMUTABLE_RECORDS`. Their saved locations remain under the existing `OWNED_FIELDS` owners:

| Saved field | Root owner |
|---|---|
| `PlanRecord.planNotes`, saved candidate `candNotes` | `plans` through `planRecords` |
| `OrderResponse.respNote` and the response itself | `proxy` through `orderResponses` |
| `OrderBody.orderNotes` in transit | `messages` through `messagesInTransit` |
| Received `ReportBody.reportNotes` | `knowledge` through `knowledgeBySeat`; transit belongs to `messages` |

FOUNDATION section 10 records these extensions. The optional fields leave old logs and states usable under the unreleased schema 1. Both packs explicitly state `rules.plans.notes`; schema and kernel validation require the bounds, complete rung table and all four directive rows. Referenced values must exist in the pack vocabulary. No kernel fallback supplies a missing rule.

Regenerated the manifest and world schemas, both worlds, and the day-40 save with their documented tools. The save changed only `worldHash`; its log, state and their hashes are unchanged. Existing pack rules and strings are preserved.

## R56 rulings [I], accepted by the lead in R67

1. **Start with four marks corresponding to the existing review grammar.** Objective, route, timing and avoidance fit this bounded payload. A strike recommends avoiding its objective; it does not remove an axis. Rejected: free prose interpreted by the kernel, converting notes into edits, or introducing direct force movement. A named-force wait or a strength request would need its own typed semantics and controls; neither is claimed here.
2. **Read each note separately on arrival, then always request a fresh draft.** The commander may reject all the preferences while reconsidering the plan. Rejected: one answer for a mixed bundle, immediate effects at issue, and refusing the whole redraft because one note was refused. Every note shares the order's route and recipient.
3. **Weight preferences by the actual response, with the pack owning every coefficient.** Initial weights are exceed/comply 1000, reservations 500, slow walk 250, and reinterpret/object/refuse 0. Each fully weighted matching note adds 600 score units. Bounds are eight marks, eight waypoints per mark and sixty waiting days. All four directive rows initially have boldness 500, honour `duty` and offend no value. These are uncalibrated design parameters, not historical judgments. Rejected: a mandatory route exclusion, guaranteed compliance, or a hidden kernel constant. No calibration campaign was added.
4. **Retain alternatives and explain the selected plan.** Generate one successive alternative per positively weighted mark, within the existing search cap, and keep original candidates. A scoring preference can lose to other terms, an impossible route, or another note. Rejected: replacing the goal, narrowing the legal menu to the requested route, or saving a second mutable preference table. A new send-back replaces the prior bundle rather than accumulating its influence across reviews.
5. **Deliver the commander's account through knowledge.** Save actual terms in `proxy` and the draft's internal breakdown; show only the report's stated account and reasons to the principal. Rejected: reading hidden willingness for a preview or showing the actual rung through plan metadata. Unknown private motives are not invented in prose.

## R56 verification (historical)

Evidence is under `runs/r56/`; the standalone runner also wrote its uniquely named `runs/r56-done/` and `runs/r56-done-drafting/` directories. `final-checks.json` indexes the settled evidence.

| Check | Result |
|---|---|
| Root and desk `npm ci` | exit 0 each; both lockfiles preserved |
| `MANDATE_NO_GIT=1 npm run check` | exit 0; 102 files, 1,279 passed / 3 optional skips; typecheck, boundary, licences and decision index pass |
| Final root typecheck after the extra pack acceptance tests | exit 0 |
| Actual testbed acceptance/grammar file | exit 0; 6 tests, including the four requested cases; four were added after the full gate, whose unaffected evidence is reused |
| Desk suite | exit 0; 76 passed / 8 optional map-data skips |
| Final desk typecheck/build | exit 0; inherited runtime-asset and bundle-size warnings remain |
| Browser interaction | one pass each at 1920x1080 and 3440x1440; actual adapter and review components, explicit schematic geometry; no page errors |
| Preservation and `git diff --check` | pass; protected paths, HEAD and index unchanged |

The small kernel fixtures cover a compliant commander following a timing note, distrust causing rejection with its reason, a vacancy during transit, repeated-run/replay equality, save/resume and the private-report boundary. The loaded testbed pack separately covers accepted timing, resentful rejection, a vacancy bounce and deterministic replay, using the people owner to vary regard without editing the pack.

The browser tests verify two held marks become one note payload, no binding edit is queued, marks clear after acceptance, and both notes reach the log. Their screenshots were inspected. Geography and LFS furniture are absent from these captures; this is interaction evidence, not a full map/art integration pass. Reused these browser and desk results after the later kernel-only correction; no unchanged browser campaign was repeated.

The standalone `npm run run:done-check -- --label r56-done` exits **1**. Repeat hashes, save/resume and replay, all liveness bands/quiet reasons, and required FOUNDATION tests pass. **Timing remains unmet:** Union median **92.13 ms**, p95 **197.06 ms**, maximum **301.11 ms**, against **40/160 ms** median/p95 limits. Testbed median/p95 **4.21/6.65 ms** pass. No existing liveness band changed; `planner.term.notes` has an explicit quiet reason and driving tests because the reference principals send no notes. A read-only runtime sample found 24 Node processes on a host reporting 16 logical processors; this does not establish the cause. No other process was stopped, no budget was relaxed, and no costly retry was made.

Retained failures and corrections: note-shaped log entries were initially rejected; the immutable scanner caught generic field names, corrected to `mark*`; type-only inline imports were converted to ordinary type imports for the existing scan; the shared pack fixture needed the required rules; and the combined objective/timing regression demonstrated opposition 9000 instead of 100 before its fix. After the full-suite failure, all failure categories and unreached component gates were inspected. Focused corrections passed (297 tests / one optional skip, 265 later targeted tests, 69 architecture checks) before the one justified full rerun. No test, signature, criterion or timing threshold was weakened.

## R67: recomputed conditions and missing regressions

Worked only in this worktree on `plan-sendback-notes`, retaining HEAD `13089c45ef09bff0de3b16b9bfc862f78a9b0e5d`. Read CODEX's standing, command-line, writing and R44–R49 rules, 0096 and the relevant plan records. Git commands were read-only. No main merge or other run's worktree write.

**Recomputation was already present on the supplied base.** `planner/notes.ts` filters the old reinforcement request and `move_when_reinforced` gate before calling `score.ts`'s `makeCandidate`. That same constructor used by ordinary drafts recomputes the shortfall from the alternative's axes, objective and beliefs and adds fresh requests and gates. The new test passes on the unchanged base. Runtime code is therefore preserved rather than adding a second calculation.

The five new tests are in `packages/cli/test/sendback-conditions.test.ts` and `packages/kernel/test/sendback-notes.test.ts`:

- **Conditions:** an 8,000-man force facing a perceived 20,000 asks for 12,000 and waits. Seven successive alternatives cover wait, via, avoid, focus to a lightly held objective, wait there, focus back and wait again. Every alternative has exactly the required requests and gates: the first wait keeps them, the light objective removes them and returning restores them without duplicates.
- **N9:** actual holding and bombardment candidates keep their stationary phases under a wait note. The bombardment fixture uses a fictional held battery shore beside the fort. A moving draft is a positive control: the same note can change its concentration.
- **N3:** a compliant commander's chosen plan has a positive private note term. Both the principal's review score and the received `plan-submitted` claim equal the ordinary sum, excluding that term. The term itself remains hidden.
- **N5:** `issueOrder` refuses an approval carrying notes before dispatch, preserving State; a bare approval on the same review is accepted. This directly tests the runtime guard independently of log-shape validation.
- **N6:** unknown focus and avoid regions and an unknown via waypoint are refused before dispatch. Corresponding known regions are accepted.

**Re-breaks:** six isolated mutations each exit 1 with exactly the intended failing test: dropping the recomputed requests/gates, copying the old ones, deleting the stationary-method guard, exposing `candScore`, removing the approval guard and removing region validation. `runs/r67/rebreaks.json` records exact replacements, failures and restoration hashes; the script restores each production file byte-for-byte in `finally`. The dropping mutation fails on the first wait; copying fails when the objective becomes lightly held. N3 catches 1,165 exposed instead of 565. The final full check runs after every restoration.

| R67 check | Result |
|---|---|
| Existing focused preflight | exit 0; 41 passed / 1 optional skip |
| Final focused regressions | exit 0; 10 passed, including the five new tests |
| Typecheck before the full gate | exit 0 |
| `MANDATE_NO_GIT=1 npm run check` | exit 0; 103 files, 1,288 passed / 3 existing optional skips; typecheck, boundary, licences and decision index pass |
| `npm run run:done-check -- --label r67-done` | exit 0; all 6 criteria pass; 154 mechanics bands per pack unchanged |
| Union median / p95 | 32.17 / 63.67 ms; unchanged limits 40 / 160 ms |
| Testbed median / p95 | 4.45 / 16.62 ms |
| Preservation and whitespace | three delivery files; 1,314 other baseline files unchanged; HEAD unchanged, staged diff empty, whitespace exit 0 |

Evidence: `runs/r67/final-checks.json`, its linked logs and inventory; standalone summaries/saves in `runs/r67-done/`, drafting diagnostics in `runs/r67-done-drafting/`. The root gate took 113.74 seconds and ran once; the standalone gate also ran once. No band, threshold, signature, runtime data, lockfile, schema or save fixture changed. No install, server, package build or browser campaign was needed for these test-only changes. R56's UI acceptance is unchanged; R67 claims no new UI validation.

Retained cheap-check failures: the first fixtures used the wrong received-report key, omitted dispatch telemetry declarations and placed batteries away from a held shore beside the fort. Corrected only those fixture assumptions; focused tests and typecheck then passed before either full gate. All failures are retained in `new-tests.json` and `typecheck-preflight.log`. The first preservation audit also flagged a changed index byte hash. HEAD and staged contents remain unchanged, so that hash is retained as a diagnostic rather than treated as a content failure; no Git metadata was restored.

**Proposed rulings:** none. R67 verifies the lead's existing ruling. The one-writer, deterministic planner and principal's knowledge boundary are unchanged.

## R83: main integration, merge only

Worked only in this checkout, keeping the lead's merge target `e0a8ce7` and branch HEAD `9f933f5`. The coordination file's standing, command-line and writing rules, R44–R49 merge rules, 0096 and 0102 were read. Neither lockfile changed between the merge parents, and all four workspace dependency links resolve into this checkout, so no install was needed. Git commands were read-only.

Resolved the seven conflicts:

- `console/session.ts` passes the translator to both `commandText` and `dayLines`, retaining the note tokens and main's received-report formatting. Both sides' remaining commands survive.
- `proxy/responses.ts` requires main's response kind alongside R56's optional note index. Note response keys and plan references survive, as do the first-call retention and doctrine-call retention rules.
- Both packs' strings contain every key and value from both parents unchanged: 159 testbed strings and 410 Union strings, including all thirty note strings in each pack. A duplicate-key check passes.
- Regenerated the two schemas with `npm run pack:schemas` and the day-40 save with `tools/make-save-fixture.ts`. Both pack generators report zero changed outputs; the merged worlds were already current. Schema freshness passes.

One additional integration correction: the per-note `responseOf` call in `tick/orders.ts` supplies `kind: order.orderKind` along with its existing note index. No other runtime correction, feature, parameter, band, signed item or rule was changed. Proposed rulings: none.

Evidence is in `runs/r83/`, with standalone summaries/saves under `runs/r83-done/` and drafting under `runs/r83-done-drafting/`. `final-checks.json` indexes the results, logs and preservation evidence.

| R83 check | Result |
|---|---|
| Root typecheck and seven focused files | exit 0; 57 tests passed |
| Focused merge probe | exit 0; distinct note indexes and kind; named notes, first calls and doctrine calls retained; unreferenced old responses pruned |
| `MANDATE_NO_GIT=1 npm run check` | exit 0; 132 files, 1,489 passed / 3 existing optional skips; boundary, licences and decisions pass; 496.21 seconds |
| `npm run run:done-check -- --label r83-done` | exit 1; Phase 0 5/6; 1A 1/6; 1,500.83 seconds, full eight-seed sweep and drafting |
| War-by-decision median / p95 | 37.33 / 62.81 ms; unchanged limits 40 / 160 ms |
| Testbed median / p95 | 3.95 / 5.48 ms |
| History median / p95 | 102.72 / 177.07 ms; both exceed their unchanged limits |
| Desk `tsc --noEmit` and suite | exit 0 each; 89 passed / 8 existing optional skips |
| Schema freshness, conflict-marker scan and whitespace | pass |

The history reaches day 148 / 31 July with no `--at-war`. Repeat/frozen daily hashes, replay, save/resume, liveness and the section-ten checks pass. There are 159 reference mechanics per pack, all inside their retained bands or quiet for stated reasons. The Union checked run retains final State hash `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`.

The timing criterion remains unmet. The history sample was measured in the same standalone invocation as the passing war-by-decision sample; no unloaded-host condition or cause of the difference was established. No performance tuning, limit change or costly retry was attempted. The full root check's passing evidence is retained separately and does not waive this failure.

The five failing 1A categories are retained in full in `done-check.log`: checkpoints (Missouri, the western-Virginia government data gap, Confederate strength and both planned-operation counts), operation (no battle in the history run), pushback (relay holds, filter holds, trims and reservations), stand-ins (the two unowned `callReceived` labels on this merge target), and lever sweep (its Fort Monroe measurement and chain limitations). Unknown-strength passes. R79 and R85 own relevant follow-ups elsewhere; R83 did not apply their work or calibrate a band.

Final runtime and preservation checks preceded this hand-over update. Eight resolved/integration files changed before documentation, 1,655 other baseline files were unchanged, no additions or deletions outside ignored evidence, and all nine captured worktree Git metadata files were byte-identical. The index still reports seven unmerged paths, deliberately left for the lead to stage after review. No stage, commit, abort, build, browser or server was run.

## For the lead

1. Review the R83 resolutions under 0096 and retain the unmet history timing criterion when deciding the merge's next step. The seven working-file conflicts are resolved; staging and committing remain with the lead.
2. Retain the five failed 1A categories with their existing owners. R83 made no calibration or R79 follow-up change and ran neither expensive gate a second time.

## Findings outside my scope

R83: the history timing failure and the five 1A failure categories above remain open. No cause for the timing difference was established, and no criterion was waived. No other worktree was written.

No new finding beyond the existing recomputation in the supplied base and the changed index byte hash noted above. The lead's R67 receipt resolves the historical R56 timing hold, and R67's fresh local timing passes. Hosted CI and optional map-data integrations were not run. No unrelated performance change, calibration campaign, map rebuild or art repair was undertaken.
