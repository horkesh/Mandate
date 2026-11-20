# Seat view people: R70, R75 and R76 hand-over

For the lead: 2 items.

R76 only, `C:/Pyrrhic/mandate-seat-view`, branch `seat-view-people`, starting at
`0201488`. Git was read-only. Claude held R75 for the knowledge leak corrected
below; its other work stands. R73 runs elsewhere and was not touched.

## R76 delivered

Standing eligibility starts with `world.person(id).faction`. A man's current
post, department side and service truth do not decide it. A received report
about a government-change notice supplies its authored `department_side` act;
the report must match the notice's type and subtype. Known holders of that
government's posts then follow the received side. The known post catalogue
comes from opening knowledge and received letters, never live command tables.
Foreign post references supply only the public department, without borrowing
the opening holder or parent. Decisions' possible effects are not evidence.
Written day, hour and report id order the notices, so a late older report
cannot undo a newer one. Future-written or future-received papers wait.

The people cache no longer depends on `postStates` or `departmentFactions`.
Paired-State tests now require hidden changes to those tables to preserve
standing and the cached catalogue references. A received notice changes
eligibility equally in both States, including with cold/shared caches. Tests
also cover a later return to the opening side, stale notices, unrelated report
types and subjects, and receipt-day cache expiry. The original code failed
three regressions before the correction (12 passed); the final focused gate
passes 42 tests across kernel, real testbed, boundary and banned-API checks.

R49 is absent on this head: neither `personService` nor service-choice letters
exist here. Consuming a received service-choice letter remains for that merge;
no guessed token, State field, report schema or writer was added. Reported
foreign/neutral standing remains null because reports carry no standing figure.
No player-facing wording, pack data, save, gate record or lockfile changed.

## R76 validation and limits

Evidence: `runs/r76/final-checks.json`. Raw logs and the initial red failure
remain beside it. Pack startup and local kernel resolution passed before
the longer checks; both typechecks and the 42-test focused gate exited 0.

- Safe root suite: exit 0, **105 files, 1,324 passed / 3 optional skips**.
  Root typecheck, boundary, licences, decisions and whitespace: exit 0.
- Desk `tsc --noEmit`: exit 0. Desk suite: exit 0, **84 passed / 8 existing
  skips**, 26 files. No build, browser or server was needed.
- **Exact `MANDATE_NO_GIT=1 npm run check` remains unrun/unmet.** Its no-git
  configuration still collects three Git-writing LFS fixtures. The safe
  check components ran with `tools/test/lfs.test.ts` additionally excluded,
  preserving the explicit read-only-Git instruction. No test infrastructure
  was changed to expand this fix.
- Standalone `npm run run:done-check -- --label r76-done-check`: **exit 0,
  Phase 0 6/6**. Union at war median/p95 **32.61/61.83 ms**; Union history
  **31.35/65.40 ms**; testbed **3.34/5.25 ms**. Limits remain **40/160 ms**.
- 1A remains **2/6**: checkpoints, operation, pushback and lever sweep fail.
  Every one of the eleven non-budget criteria has the same status/problem
  list as retained R75 evidence. The history reaches 31 July with neither
  side at war, missing government sides/strengths, no operations, no gated
  decisions and no recruitment calls. All failure categories were inspected;
  no band changed or campaign retried.
- All **195 daily hashes** and both final hashes match R75. The comparison
  reuses its retained summaries, with no baseline campaign rerun.

Final runtime and pre-documentation inventory: four source/test files changed,
1,432 other baseline files unchanged, no additions/deletions, and all eight
worktree Git metadata files byte-identical. The final inventory also includes
this hand-over. No independent-review approval is claimed; Claude's standing
review under 0096 remains pending.

No new proposed ruling. R76 supplies the knowledge boundary; the received
notice identifies its authored public act without reading its hidden trigger,
State outcome, decision choices or historical default.

## R75 delivered (historical; its side lookup is replaced by R76)

R75 limited live standing to a known man's current side matching the
principal's, using `sideOfPerson` (0065). R76 replaces this truth lookup and
its cache keys as described above. The existing report format has no
standing claim or field, so foreign and neutral men have `standing: null`.
No foreign figure is reconstructed from State or an opening reputation.
The projection cache now also depends on post holders and department sides,
so a side change cannot leave a previously visible live figure in the cache.
These inputs only gate standing; they do not populate the received catalogue.
No State, report format, report writer, pack data or save was changed.

T5, T6 and T9 already had the right production guards. New regressions close
the gaps that let their re-breaks survive: a declined appointment preserves
an opening vacancy or previous holder; the man's own letter is not an
assessment of him; a memorandum, ordinary requested advice, another verb's
answer or a declined consult does not create a consult stance. The actual
received consult remains a positive control. The original letters remain
available as reports. Each re-break was applied separately and restored:
T5 failed 2 tests, T6 failed 1, T9 failed 4, each with exit 1. The mutation
driver restored the source bytes, and final tests pass.

Paired-State tests cover enemy authors and subjects with differing live
standing, both cold and shared caches, including the real testbed. Cache
tests cover a holder becoming foreign or neutral, then leaving that post.
Both desk cards display their existing missing-standing text for a known
man whose figure is null. No player-facing string was added.

## R75 validation and limits

Evidence: `runs/r75/final-checks.json`; raw logs, mutation results, source
hashes and preservation inventories are beside it. Startup of both packs
and both principal views passed before the longer checks. Existing root
and desk installations resolve locally; no reinstall was needed.

- Focused kernel/pack/boundary/determinism: **41 passed**, exit 0. The two
  original standing tests first failed with a foreign live figure of 500.
  Focused desk: **4 passed**, exit 0.
- Root and desk `tsc --noEmit`, pack boundary, licences, decisions and
  whitespace: exit 0. Safe root suite: **105 files, 1,323 passed / 3 existing
  optional skips**, exit 0. Desk suite: **84 passed / 8 existing skips**,
  exit 0, 26 files.
- **Exact `MANDATE_NO_GIT=1 npm run check` remains unrun/unmet.** This head's
  no-git configuration excludes the staged-hook file but still collects
  three Git-writing LFS fixtures. The safe equivalent ran its typecheck,
  suite with `--exclude tools/test/lfs.test.ts`, and all three remaining
  check components. Test infrastructure was not expanded in R75.
- Standalone `npm run run:done-check -- --label r75-done-check` ran once,
  **exit 1**, Phase 0 **5/6**. The sole failing criterion is budget: Union
  history median/p95 **87.68/154.56 ms**, limits **40/160 ms**. Union at war
  **36.46/67.07 ms** and testbed **3.45/5.16 ms** pass their timing limits.
- 1A remains **2/6**, failing checkpoints, operation, pushback and lever
  sweep. The history reaches day 148 but neither side opens the war; it
  has no operations, battles, gated decisions or recruitment calls. Missing
  government sides/strengths and every other problem remain in the log.
  All eleven non-budget criteria have the same status and problem lists
  as retained R70 evidence; no band changed.
- The retained R70 and current runs have identical **195 daily hashes**
  and both final hashes. No baseline campaign or failed campaign retry
  was run. A bounded saved-day-30 probe compares HEAD/R75 for both
  principals: cold median **2.6544/4.3055 ms**; replacing the post-table
  reference, **0.1029/1.5704 ms**. This measures projection overhead on one
  State only; it does not establish the history timing failure's cause or
  waive the budget. All failure categories were inspected before stopping.

The pre-documentation inventory preserves 1,430 other tracked files, with
six changed source/test files, no additions/deletions outside ignored run
evidence, and unchanged HEAD/index/ORIG_HEAD bytes. The final inventory also
includes this hand-over. No build, browser campaign or server was needed.
Claude's independent standing review of R75 remains pending under 0096.

No new proposed ruling: R75 supplies the standing restriction; current-side
membership uses its existing owner. The report format's lack of standing
is recorded rather than filled with a new schema or an invented snapshot.

## R70 delivered (retained context)

`SeatView.posts` supplies the principal's opening establishment, including
staff/offices, internal holders and opening vacancies, with the pack's parents.
Subsequent evidence comes only from received reports. Written day, hour and
report id order evidence, so a late old letter cannot undo a newer loss.
Successful appointment/relief replies and returned dispatches update belief;
an unreported change in State does not. Correspondence can reveal another
post's existence without revealing its holder or parent. Each holder has an
as-of day and source; an opening vacancy has no invented start date.

`SeatView.people` exposes own-side public standing (restricted by R76's received knowledge), received consult answers and
received advice about each known man. The catalogue also references received
observer letters. These are sources, not hidden ability bands or assertions
about current observer postings. New arrays and entries are frozen and cached
outside State. Public scheduled parent changes invalidate the cache on their
date. Non-principal seats receive empty catalogues.

The board reads this catalogue instead of reconstructing one from field-order
relays. Both post details and the audience's card show the public/received
records, with source-paper buttons and explicit empty states. Commands continue
through the existing menu/grammar. No likeness or new art was introduced.

## Audience requirement not met

The current live case, subject-specific counter permissions, eligible framing
values, declared reply per counter and attributable filed audience record are
still absent. Earlier received reasons remain explicitly earlier papers.

The missing source information cannot be recovered by projecting existing
received records:

- `knowledge/report.ts:135`, `StatedReason`, retains only kind and weight.
  It drops the offended value and the grievance's identity.
- `audience/audience.ts:37`, `AudienceRecord`, retains day, before/during and
  counter kinds, with no principal or transcript. `proxy/responses.ts` explicitly
  keeps its records behind the report boundary. A later holder's current faction
  cannot establish which principal held an earlier audience.
- `previewAudience` at `audience/audience.ts:99` reads hidden values, grievances,
  promises, observers and traits. Stripping its response fields does not make
  those inputs received knowledge. A fresh declared reply would require a ruling
  treating the read as a newly spoken declaration, beyond R70's stated boundary.
- Consult's writer stores the situation in private `personStances`, but the
  returned letter names the post. The projection preserves the actual received
  subject; it does not borrow a situation id from private State.

No State or report writer was changed to work around these gaps.

## Proposed rulings

1. Treat one's own complete opening establishment and its authored administrative
   schedule as public opening knowledge. Reveal other posts only through received
   references, without filling their holders/parents from truth. Rejected: current
   `postStates` or the field-order menu as the catalogue's owner.
2. Read own-side public standing from its explicitly public State table, subject
   to R76's knowledge restriction above. Derive
   consults, person advice and observer letters solely from retained received
   reports, keeping their original subjects and dates. Rejected: hidden traits,
   private stances/postings, invented assessment bands, or calling a received
   letter proof that an observer is still attached.
3. Preserve the live-audience gap pending a seat-owned declaration source or an
   explicit fresh-speech ruling. Rejected: recomputing private compliance and
   presenting it as an already received case, or manufacturing counter replies.

## R70 validation (historical evidence; approval superseded its review hold)

Evidence is in `runs/r70/final-checks.json`; raw logs stay there.

- New projection tests first failed for missing fields: 4 kernel tests. Three
  desk tests first failed on the old presenters. Final focused passes: 30 kernel/
  pack/boundary/determinism tests and 8 desk tests. The real testbed paired-State
  regression also passes after the test-only readonly cast was narrowed correctly.
- Safe root suite: exit 0, 105 files, **1,312 passed / 3 optional skips**.
  `MANDATE_NO_GIT=1` excludes the staged-hook file; the command additionally
  excludes `tools/test/lfs.test.ts`, whose three fixtures still mutate Git on
  this base. **The exact required full `npm run check` remains unrun/unmet.**
- Final root and desk typechecks, pack boundary, licences and decisions: exit 0.
  Desk suite: exit 0, **83 passed / 8 optional skips**, 26 files. Desk build:
  exit 0, **271 files** inventoried; existing chunk-size warning. No browser
  campaign: this worktree lacks the saved Union map manifest and geometry;
  neither unrelated map setup nor a new server was started.
- Standalone done-check ran once, **exit 1**. Phase 0 **5/6**: behaviour, repeat
  hashes, save/resume/replay, all liveness bands and section-ten pass. Budget
  fails: Union median/p95 **75.32/141.23 ms** against **40/160 ms**. Testbed
  **3.74/5.36 ms**; history **33.31/63.13 ms**. No budget or band changed.
- 1A reports **2/6**: unknown strength and stand-ins pass; checkpoints,
  operation, pushback and lever sweep fail. History has no war decisions,
  operations, gated decisions or recruitment calls, and reports missing sides
  and out-of-band strengths. All categories are retained in `done-check.log`.
  No baseline campaign was run to classify these failures.
- Cheap timing diagnosis, not a campaign retry: cold construction of both
  principal views on the retained day-30 save measures baseline **1.1281 ms**,
  current **1.4379 ms** median, 100 samples after warmup. This does not identify
  the 75-day timing failure's cause or waive the failed budget. The initial
  all-seat probe hit an inherited unseated-person error; its log is retained,
  and the corrected probe restricts itself to the two principals.

No campaign was repeated after failure. The source, package inventory and
runtime-input audit preceded R70's final documentation batch. State, packs,
save fixtures, gate files and lockfiles were preserved. Claude subsequently
approved R70 as recorded in the R75 request.

## For the lead

1. Review R76's received-side boundary; R75's T5/T6/T9 tests still pass.
2. Route the unmet exact root check and four failed 1A criteria to integration,
   and connect received service-choice letters when R49 lands. Their
   acceptance criteria remain unchanged; Phase 0 timing passes in R76.

## Findings outside my scope

The unexcluded Git-writing LFS fixtures and failed 1A categories are
detailed above. R70's live-audience source gap, missing Union map inputs and
lossy consult subject remain outside R76. Received resignation letters will
vacate the catalogue only in the later follow-up the request deferred.
No other run's files were changed.
