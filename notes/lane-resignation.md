# R49: resignation

For the lead: 4 items. R61 is complete in `C:/Pyrrhic/mandate-resignation`, branch `phase1-resignation`, from `2a65888`; R49's original base was `8b15e6e`. Independent review remains with Claude under 0096. Buchanan's departure and the post-1.11 history test remain open. No merge was started.

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

## For the lead

1. Route R61 to Claude's standing reviewer under 0096. The government mapping applies the lead's existing ruling; no further design choice is proposed.
2. Start the integration only after Part B lands. After 1.11 merges, replace the artificial at-war prerequisite with its history event and run that test. Preserve the apply's exclusion of the fifteen stand-ins, and both the current-service and capital readers in the shared location module.
3. Re-source Buchanan's voluntary departure or authorize a separate administrative-departure treatment; do not reuse the mislabeled register entry as a resignation. R61 leaves his row and the wording draft unchanged.
4. Route the pre-existing Virginia citation-format finding below to its owner; R61 corrected only its two new citations.

## Findings outside my scope

- The research hand-over's Buchanan citation needs correction in that lane. No other worktree was changed.
- Five existing R49 Virginia service citation cells join the Army Register and Heitman with `+`: Ewell, J. E. Johnston, Lee, Magruder and Stuart. The service-list parser treats that as one Army Register citation with Heitman text inside its pinpoint, rather than a separate source. The generated world confirms this. A semicolon would preserve the text while making the Heitman reference independent. These five rows remain unchanged in R61; Thomas's standalone Heitman citation is already separate.
