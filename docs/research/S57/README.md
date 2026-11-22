# S57: people and posts, August 1861–November 1862

Research draft, 22 November 2026. **Unsigned and unapplied.** S57 only, on `sprint/research-cast` from `ddc5cb7`. The window is 1 August 1861–30 November 1862; earlier starts and later endpoints are labelled context. This adds evidence to [S12](../S12/README.md), [S22](../S22/README.md) and [S38](../S38/README.md), preserving every existing row and all 1,743 original tracked files.

| Table | Rows | Contents |
|---|---:|---|
| [Civil offices](civil-offices.csv) | 55 | Both cabinets; War and Navy leadership; Union Navy bureaus; Union general-in-chief. |
| [War offices](war-offices.csv) | 17 | Selected Union central staff-office reference intervals. |
| [Commands](commands.csv) | 161 | Army, department and selected subordinate command assignments, assumptions, handovers, reliefs and reporting arrangements. |
| [Rank and availability](rank-availability.csv) | 164 | Selected promotions, resignations, wounds, illness, leave, deaths and dated reports of availability. |

The **397 rows** are event/reference rows, not a count of people or a complete roll of every command. [Holds and conflicts](holds-and-conflicts.md) gives 21 proposed treatments and the coverage gaps. **Read H19 before using the Memminger labels:** the three existing civil rows follow Wright's printed “Charles G.”; the cabinet journal has initials, while Capers reproduces “Christopher Gustavus.” The original labels remain as source variants pending identity review, not as a new separate person.

## Reading the tables

`date` belongs to the named `event`. Nomination, confirmation, rank-from, assignment, receipt, assumption, relief, resignation request, acceptance, wound and death remain separate. `through` is only an endpoint explicitly supplied by the cited source. A blank means unknown, not a vacancy or continued service. Year, range and approximate precision must not become guessed exact days. The Crittenden first-of-December anchor is explicitly approximate. Reference office intervals are not independently verified duty receipts or proof of every intervening day's availability. Highest rank in a bureau list is not backdated throughout a tenure.

Names and initials follow the read evidence; aliases are not automatically merged. Forney's first name remains held. A wound or illness does not supply an invented recovery interval, complete medical fitness judgment, news-arrival date or automatic successor. An organization label in the `person` column records an organizational act, not a person.

These are additive factual research tables in S12/S38's manner, not seven-column proposals to alter judgment cells. No apply tool should consume them. They create no stat, temperament, regard, inferred motive, sensitive-history placement or automatic historical event. Native nations are not reduced to either belligerent's faction, and military geographical titles do not establish civil sovereignty or policy.

## Findings to carry forward

Walker's tender, requested departure and acceptance fall on different dates. The permanent Confederate cabinet's nomination on 17 March and confirmation on 18 March coexist with Wright's March War-office overlap. Randolph's November acceptance, Campbell's conditional tender and Seddon's addressed-as-holder/reference entry likewise remain separate. `NEW:S57-OR-IV-1 p602`; `NEW:S57-OR-IV-1 p603`; `NEW:S57-OR-IV-1 p613`; `NEW:S57-JCCS-II p72`; `NEW:S57-JCCS-II p73`; `NEW:S57-JCCS-II p74`; `NEW:S57-WRIGHT p153`; `NEW:S57-WRIGHT p154`; `NEW:S57-OR-IV-2 p178`; `NEW:S57-OR-IV-2 p179`; `NEW:S57-OR-IV-2 p196`.

Halleck's 11 July assignment precedes Heitman's 23 July assumption. Grant's February district records precede Cullum's March reference start; Smith's expedition command is a different post. Buell's army command continues through departmental reorganization, and Rosecrans's October assignment precedes actual turnover. Burnside's November order, reported receipt/assumption and Cullum entry remain distinct. `NEW:S57-LINCOLN p203`; `NEW:S57-HEITMAN p17`; `NEW:S57-OR-I-8 p555`; `NEW:S57-OR-I-7 p629`; `NEW:S57-CULLUM-II p171`; `NEW:S57-OR-I-10-2 p6`; `NEW:S57-OR-I-10-2 p33`; `NEW:S57-OR-I-16-2 p641`; `NEW:S57-OR-I-16-2 p642`; `NEW:S57-OR-I-16-2 p654`; `NEW:S57-LINCOLN p252`; `NEW:S57-OR-I-21 p82`; `NEW:S57-OR-I-21 p83`; `NEW:S57-CULLUM-II p319`.

The Seven Pines reports place Johnston's wound/Smith's succession at sunset on 31 May, Smith's turnover to Lee at about 2 p.m. on 1 June, and Smith's separate illness departure on 2 June. Johnston describes weakness when reporting on 24 June. These are attributed contemporary retrospective accounts; they supplement the separate 1 June presidential casualty notice and orders without inventing a complete incapacity period. `NEW:S57-OR-I-11-1 p933`; `NEW:S57-OR-I-11-1 p934`; `NEW:S57-OR-I-11-1 p935`; `NEW:S57-OR-I-11-1 p989`; `NEW:S57-OR-I-11-1 p992`; `NEW:S57-OR-I-11-1 p993`; `NEW:S57-OR-I-11-3 p568`; `NEW:S57-OR-I-11-3 p569`.

## Evidence and validation

[Sources](sources.md) identifies the 30 editions/source keys. [Scan manifest](scan-manifest.json) resolves all **196 cited pages** to URLs, retained files and SHA-256: **188,401,287 bytes** under `C:/Pyrrhic/mandate-research-sources/S6/S57/scans/`. Read OCR passages are retained externally in `page-readings.json`; they do not assert that every neighboring entry was read. Search excerpts supplied no historical facts.

[Page inspection](page-inspection.json) records all 196 locator checks; [image checks](image-checks.json) records 34 selected factual body/column checks. [Locator corrections](locator-corrections.json) preserves the 19 old/new image links and old scan bytes, including four corrected civil locators from the first S57 commit. Every CSV row and printed-page citation is preserved. Earlier sprint files remain untouched. [Source artifacts](source-artifacts.json) inventories 424 external source/index/reading/inspection files, including rejected acquisitions; presence is not source admission.

[Validation](validation.json) and the [hand-over](../../../notes/sprint-S57-posts.md) retain the exits, failures, timings, preservation checks and runtime artifacts. The civil commit passed its actual hook. The initial parallel check's unchanged 300-second setup timeout was diagnosed; the affected file passed with one worker, as did the civil hook. No timeout or assertion changed.

The one default done check **failed** after **2,917.67 seconds**: Phase 0 **5/6**, nonbinding 1A **2/6**. Union reference/history medians **57.75/51.65 ms** exceed the unchanged **40 ms** budget; p95s are **122.19/115.43 ms**, within 160. The reference summaries match S38 outside timing: all **268 daily hashes**, liveness rows, replay, resume and saved-log results are unchanged, with zero rejections. The four 1A failure categories and all their problems match S38; no criterion is waived. No unchanged campaign was repeated, and no Linux certification is claimed. The closing commit's actual hook receipt is retained externally and reported in the sole CODEX status.

## Proposed rulings [I]

Keep each legal act, duty act, report and reference date in its own meaning. Preserve conflicting dates and printed name variants for review. Reject a universal appointment date, invented acting incumbents or recovery periods, accepting a conditional request as executed, interpreting confirmation as physical availability, importing praise into judgment cells, rewriting earlier research, or turning the chronology into a date-triggered script. The per-case rejected alternatives and holds are in the linked notes. Nothing is applied.

## Findings outside my scope

The lead owns identity and source admission, unresolved legal/duty boundaries, complete interim-command and bureau-staff collation, notices of recovery/return, dated-post execution and gameplay effects. Earlier sprint scan-locator repair is a separate task; their files remain preserved. The tick-budget breach, inherited 1A gaps, Linux CI, whole-branch review, gate review and integration remain outside this documents-only lane. Nothing is cleared or signed.
