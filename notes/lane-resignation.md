# R49: resignation

For the lead: 4 items. R82's merge contents are resolved in `C:/Pyrrhic/mandate-resignation`, branch `phase1-resignation`, with HEAD `5a96a16` and the lead's MERGE_HEAD `e0a8ce7`. The merge remains in progress; its index is deliberately unchanged and still has twelve unmerged paths. Nothing was staged, committed or aborted. Independent review remains with Claude under 0096. The ordinary history run now has the actual secession events and reaches 31 July; R87 follows the lead's merge commit. Buchanan's departure remains held. The R49/R61 record below is retained, with R82's integration evidence below it.

## Where this lane stopped

The people step now records an officer's own choice of service. `people/people.ts` alone writes optional `State.personService`; its immutable `PersonService` record carries service side, bloc, choice and day. `OWNED_FIELDS` and FOUNDATION section 10 name that owner. Absence in an older State means no choice has been recorded.

On the weekly step, an authored government's joining the named other side offers resign or stay, once. A pure calculation returns the base, every matching value and trait weight, and threshold. Resignation asks `command` to vacate the post; it transfers neither troops nor ranks. The officer remains serving, unposted, and appears in the other principal's existing candidates. `sideOfPerson`, unposted location and the politics bloc reader use his current service. His letter travels through ordinary report routes; the desk says only that he resigned or remains in service. It invents no motive.

### Proposed rulings [I]

- `rules.people.resignation.historicalDefaults` selects the history baseline. A recorded effective date is a default for the officer's act, never an assertion about his values. It can fall between people weeks. A named government remains a prerequisite; an unknown government is null, and the historical personal act can stand on its own date. Rejected: forcing every departure through an inferred birth state's secession, or silently changing the register date.
- The ordinary model is deterministic: base 0, threshold 500; the Union pack gives `state_autonomy` +600, `native_state` +800, `union` -600 and `duty` -300. Its trait-weight list is explicitly empty. These are uncalibrated design parameters, not historical judgments. The fictional tests exercise both values and traits. Rejected: dice and automatic resignation when a state changes side.
- A stay is final for this offered choice. Rank and troops stay with their existing owners. Rejected: repeated weekly demands after an answer, or taking the man's forces across with him.
- The Virginia trigger for Ewell, J. E. Johnston, Lee, Magruder, Stuart and Thomas is an explicit inference from their Virginia appointment provenance in Heitman, vol. 1, respectively pp. 410, 578, 625, 684, 933 and 953. It is not a sourced claim about motive. R61 applies the lead's ruling to Holmes and Loring as recorded below; other government fields are unchanged.

## Format and data

World format v2 gains optional `PersonRecord.service`: `government` (department or null), `toFaction`, `toBloc` (or null), `historicalOn` (full ISO date or null), and `cites`. Source columns are `service_government`, `resigned_on`, `resignation_side`, `resignation_bloc`, `resignation_cites`. The generator, validator and published pack/world/situation schemas carry it. Bad references, impossible dates, missing citations, incomplete source fields and a destination equal to the starting side are rejected. Every pack states the new people rule; there is no hidden simulation default.

All fifteen retain their existing US starting factions and ranks; their starting blocs are now `army`, including the naval officer under the research lane's fact-bloc ruling. Fourteen dates are carried from the original September Army Register, checked against its downloaded text; Heitman's entries provide a cross-check where read:

| Officer | Register's effective resignation date | Army Register, September 1861 |
|---|---|---|
| Samuel Cooper | 1861-03-07 | p. 61 |
| George B. Crittenden | 1861-06-10 | p. 61 |
| Richard S. Ewell | 1861-05-07 | p. 61 |
| Josiah Gorgas | 1861-04-03 | p. 62 |
| Theophilus H. Holmes | 1861-04-22 | p. 61 |
| Albert S. Johnston | 1861-05-03 | p. 61 |
| Joseph E. Johnston | 1861-04-22 | p. 61 |
| Robert E. Lee | 1861-04-25 | p. 61 |
| James Longstreet | 1861-06-01 | p. 64 |
| William W. Loring | 1861-05-13 | p. 61 |
| John B. Magruder | 1861-04-20 | p. 61 |
| John C. Pemberton | 1861-04-29 | p. 61 |
| Edmund K. Smith | 1861-04-06 | p. 61 |
| James E. B. Stuart | 1861-05-14 | p. 62 |

**Buchanan is held:** the supplied 1863 Navy Register entry for 22 April 1861 is in the unnumbered **Dismissals** table, between French Forrest and George A. Magruder, not the resignations table. The inherited reader/apply note mislabels it. His US start and `army` bloc are retained; that entry is not encoded as his voluntary act. This does not establish when he submitted a resignation.

Sources read: [Army Register](https://archive.org/download/officialarmyregi1861unit/officialarmyregi1861unit_djvu.txt), pp. 61-64; [Heitman vol. 1](https://archive.org/download/historicalregist01heitrich/historicalregist01heitrich_djvu.txt), named entries and Virginia pages above; [composite Navy Registers](https://archive.org/download/registerofcommi00unit/registerofcommi00unit_djvu.txt), the 1861 captain/Washington Navy Yard entries and 1863 Dismissals table. Copies, selected extracts, URLs and hashes are in `runs/r49/sources.json` and `heitman-entries.json`. No fact was entered from memory.

The pending research apply **must skip all fifteen pre-positioning branches now**. Preserve these true starts, service fields and notes; reuse the existing `ArmyReg1861-09` provenance key rather than add it twice. The apply tools in the research worktree were read, never edited or run here.

## Gate and history dependency

The unsigned text-only `situations/drafts/officer_resignation.json`, with `officer_resignation.strings.json`, is offered to the gate reviewer under `cause-of-secession`. It reports an individual act without explaining secession or praising or scolding the officer. Its schema passes, it has no effects or signature, and it is not loaded. No signed situation or gate file changed.

The source dates are not shown in a seat's menu. Virginia has not joined on this base. The July test therefore uses the allowed at-war driver and an explicitly artificial government-side prerequisite. It reaches day 118; J. E. Johnston changes service on day 48, and the model keeps Thomas, Farragut and Scott Union. This is not proof of the unmodified history run. After lane 1.11 merges, remove `atWar` and the injection, drive its Virginia notice, and verify the history run instead.

## R49 verification

`npm ci` ran first: exit 0, 51 packages, no audit vulnerabilities. The final `MANDATE_NO_GIT=1 npm run check` exits 0: **101 files, 1,263 passed / 3 established optional skips**. This includes eleven new tests: six fictional kernel cases, three format cases and two pack cases. `npm run run:done-check -- --label r49-done` exits 0: **6/6 criteria**, replay and save/resume match. Union tick median/p95: **33.53/67.21 ms**; testbed: **3.47/5.22 ms**. The normal Union 75-day reference fires seven resignations; the new stay path has its explicit fictional driver and quiet reason. Other liveness bands are unchanged.

Generated with their own tools: the three published schemas, both packs' `data/world.json`, and `packages/cli/test/fixtures/saves/testbed-seats-day40.json` (`npx tsx tools/make-save-fixture.ts`; changed World rules change its world hash). The save's command log is preserved.

Logs and failed attempts remain in `runs/r49/`; `validation-plan.md` explains corrections and evidence reuse. Fixed root-field/mechanic test inventories, restored a curly apostrophe corrupted by an encoding mistake without changing a sign-off, moved the setting-specific test into the pack, and removed its inappropriate local 30-second timeout in favor of the repository's existing 120-second bound. No acceptance criterion or gate signature was relaxed. The draft's initial inline-command quoting failure was corrected with a retained script.

The source-cell audit preserves all original ranks, faction cells and unrelated judgments. All 53 protected files are unchanged, including signed situations, gate files, scenario sources, strings and lockfile. Original politics rules match HEAD. Git was read-only; nothing staged or committed. No server was started.

## R61 follow-ups (2026-11-19)

Applied the lead's government ruling: Holmes has `st_north_carolina`, from Heitman vol. 1 p. 539; Loring has `st_florida`, from p. 642. Read the retained original-source transcription and its Notes and Abbreviations, item 3, which distinguishes birthplace from appointment state. Holmes's entry gives North Carolina for both; Loring's gives North Carolina and Florida respectively. [I] The appointment state selects the government prerequisite under the lead's ruling. It does not supply a motive. The retained source's SHA-256 matches R49's source record; `runs/r61/source-and-cell-audit.json` gives the source, page references and exact cells.

The register's effective dates remain unchanged. Each officer's existing historical-default path now also requires his named government to have joined the destination side. Regenerated only `packs/union-1861/data/world.json` through `npm run pack:generate -- union-1861`. No schemas, testbed world or save fixture needed regeneration. Of 258 source people, only those two rows' government, service citations and explanatory notes changed; generated changes are confined to their service governments and citations. Every starting faction, rank, judgment and effective date is preserved.

Added seven test cases and strengthened the existing historical-date test. The actual weekly politics phase charges the resigned officer's new service bloc, leaving his original bloc unchanged. `resignAt` is a score threshold, so the tests cover one below, equal and one above it; the historical-date test separately checks the day before, the day of and the day after, including no second choice. The validator rejects a service row without either trigger and accepts each trigger alone. Two pack cases require the sourced appointment-government fields and independently parsed Heitman citations.

One bounded re-break check changed the political bloc reader back to the immutable start, made the score threshold exclusive, delayed the historical boundary by one day, and removed the validator guard. All four intended tests failed. Production files were restored byte-for-byte; the final focused run passes all 18 tests. Logs retain the original missing-government failures, the nullable-citation type correction, and the citation-separator correction: service citations use semicolons rather than stat-centre `+` syntax.

Required checks pass without changing a band or acceptance limit:

- `MANDATE_NO_GIT=1 npm run check`: exit 0; 101 files, 1,270 passed / 3 established optional skips; typecheck, boundary, licences and decision index pass.
- `npm run run:done-check -- --label r61-done`: exit 0; all six Phase 0 criteria pass, including repeat/frozen hashes, replay, save/resume, liveness and timing. Union median/p95 31.15/61.69 ms; testbed 3.92/6.36 ms. Both main references have 155 mechanics in band. This is the branch's existing mechanics check, not a new 1A history acceptance claim.
- Final data/preservation audits and `git diff --check`: pass. Six delivery files; all other 1,311 baseline files unchanged. Signed situations, gate files, scenario sources, strings, schemas, lockfiles and save fixture are unchanged. No server, install, calibration campaign or other worktree write.

Evidence: `runs/r61/final-checks.json`, linked logs, data audit, re-break restoration and final inventory; standalone summaries and saves in `runs/r61-done/`, drafting diagnostics in `runs/r61-done-drafting/`. HEAD remains `2a65888d53679ac2a450f0eb5af7365c4c3a67f5`. Git commands were read-only and the staged diff is empty. The index byte hash differs from entry after permitted status reads; no staging command was used. Remaining reads use `GIT_OPTIONAL_LOCKS=0`. No new ruling, gated wording or signature was authored.

## R82: merge main into resignation (2026-11-20)

Resolved only the existing merge's twelve working-file conflicts. No feature work or Git mutation:

- `seats/posts.ts` keeps resignation's current `sideOfPerson` lookup and main's `capitalOf` lookup, including the principal's moving capital. Main's shared commander-loss reporter is unchanged; resignation does not turn an ordinary service departure into a capture or death report.
- `world/people.ts`, the generator and the source schemas retain both `service` and `blocCites`.
- The people CSV keeps every existing column of all fifteen resignation-owned rows. The other 246 main rows retain main's re-sourced fields; Thomas also retains his authored service offer and its inference note, without restoring his older reputation. All 261 people remain.
- `PROVENANCE.json` is byte-identical to MERGE_HEAD. Its existing `ArmyReg1861-09` entry covers the resignation citations; no duplicate source was added or signed source metadata replaced.
- The liveness table keeps main's 148-day reference and active government-closure band, plus resignation's existing `people.resigned` band. The integrated notice now offers Thomas his choice, so the obsolete quiet entry for `people.stayed` becomes `around(1)` in Union and an explicit zero reason in testbed. No existing positive band or historical checkpoint limit was widened.
- Regenerated the three published schemas, Union's `data/world.json`, and the day-40 testbed save with their own tools. Both packs and all published schemas pass their final freshness checks. The lockfile matches both heads, and the workspace junctions resolve to this worktree, so no install was required.

### Ordinary history, no `--at-war`

`runs/r82/history.ts` observes the unchanged ordinary rule-seat driver through `phase0Run`, with daily hashes, replay, and day-60 save/resume. It reaches **31 July/day 148**, with zero rejections and matching replay/resume. All 148 hashes match the standalone done check's Union reference. Final State: **`f7d3e654d0b562135bde562da7f4458078907fb558e16ffad84ebcf5e803cf20`**.

These are observed model dates, not changes to the register dates:

| Officer | Resigns in this run | Day |
|---|---|---:|
| Franklin Buchanan | No resignation; still Union on 31 July, departure held | — |
| Samuel Cooper | 7 March | 2 |
| George B. Crittenden | 10 June | 97 |
| Richard S. Ewell | 7 May | 63 |
| Josiah Gorgas | 3 April | 29 |
| Theophilus H. Holmes | 24 May | 80 |
| Albert S. Johnston | 3 May | 59 |
| Joseph E. Johnston | 22 April | 48 |
| Robert E. Lee | 25 April | 51 |
| James Longstreet | 1 June | 88 |
| William W. Loring | 13 May | 69 |
| John B. Magruder | 20 April | 46 |
| John C. Pemberton | 29 April | 55 |
| Edmund K. Smith | 6 April | 32 |
| James E. B. Stuart | 14 May | 70 |

Virginia joins on 20 April/day 46; North Carolina joins on 24 May/day 80. Under 0101's existing government prerequisite, Holmes consequently waits beyond his register's 22 April date. His row and that date are unchanged. Thomas records `stay` on 23 April/day 49; Farragut and Scott also remain Union. Davis's capital moves from Montgomery to Richmond on 29 May/day 85, and all fourteen resigned officers are unposted at the current Confederate capital at the end. There are fourteen resignations, one stay and zero commander-loss reports. Exact events, terms, current service and locations: `runs/r82/history-service.json`.

### Checks and retained failures

- Exact `MANDATE_NO_GIT=1 npm run check`: **exit 1**, after **132 files / 1,489 passed / 3 existing optional skips**, at the pack boundary gate. Two new liveness explanations contained a setting name under `packages/`. A cheap boundary-only reproduction confirmed both hits; only the comment and zero-band explanatory string were made generic. Final typecheck, boundary, licences, decisions, six liveness-table tests, and the recorded-history liveness gate all **exit 0**. The passing 462-second suite is reused; `runs/r82/suite-reuse.diff` proves the two text-only changes. The exact full command was not rerun or reported as exit 0.
- Full `npm run run:done-check -- --label r82-done`: **exit 0**, **Phase 0 6/6**, full default **eight-seed** sweep and drafting included, **1,431.24 seconds**. Union war-by-decision median/p95 **36.13/62.25 ms**; history **37.64/60.70 ms**, within the unchanged **40/160** limits. These are shared-host measurements, not unloaded or Linux CI evidence. Both full references have all 160 mechanics in band.
- **1A remains 1/6**; only unknown-strength passes. Checkpoints fail for Missouri's side, the reported western-Virginia government gap, Confederate known men **20,957**, and zero planned operations fought by either side. Operation fails with two operations and zero field battles. Pushback fails at relay holds **1**, filter holds **0**, trims **0**, and reservations **44**. Stand-ins fail for the two unowned `callReceived` labels on this merge target; R79's later fixes were not imported. The lever sweep retains the policy/grievance measurement gap and unexercised border-governor chain. Every problem is in `runs/r82/done-check.log`; none was waived, calibrated away, or retried.

Final runtime/artifact checks and the preservation inventory preceded this hand-over update. The twelve resolved contents were the only source changes at that point; all **1,645 other baseline files**, **95 protected inputs**, and all **eight captured Git metadata files**, including the index, were unchanged. This hand-over is the only additional delivery file. No deletion, unexpected source addition, install, build, server, browser, other request, or other-worktree write. Evidence index: `runs/r82/final-checks.json`; raw commands and exits are retained under `runs/r82/`, with standalone summaries and drafting diagnostics under `runs/r82-done/` and `runs/r82-done-drafting/`.

Proposed rulings: none. R87 retains the feature follow-ups, including replacing the old artificial at-war pack test, promoting the wording draft under the existing gate ruling, and any received-resignation catalogue treatment; R82 changes none of them.

## For the lead

1. Review R82 under 0096, then stage and commit the existing merge through the hook. The twelve working-file contents are resolved; the unmerged index was intentionally not changed.
2. After that commit, route R87's follow-ups. R82 proves the actual ordinary history run without injection; the older artificial at-war pack test and wording draft remain unchanged. Preserve the fifteen-row ownership and both current-service and capital readers. Retain the five failed 1A criteria with their existing owners; passing Phase 0 does not waive them.
3. Re-source Buchanan's voluntary departure or authorize a separate administrative-departure treatment; do not reuse the mislabeled register entry as a resignation. R61 leaves his row and the wording draft unchanged.
4. Route the pre-existing Virginia citation-format finding below to its owner; R61 corrected only its two new citations.

## Findings outside my scope

- The research hand-over's Buchanan citation needs correction in that lane. No other worktree was changed.
- Five existing R49 Virginia service citation cells join the Army Register and Heitman with `+`: Ewell, J. E. Johnston, Lee, Magruder and Stuart. The service-list parser treats that as one Army Register citation with Heitman text inside its pinpoint, rather than a separate source. The generated world confirms this. A semicolon would preserve the text while making the Heitman reference independent. These five rows remain unchanged in R61; Thomas's standalone Heitman citation is already separate.
