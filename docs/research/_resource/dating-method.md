# R52: dating the older people citations

Research delivery, 19 November 2026. Worktree `C:/Pyrrhic/mandate-research-dating`, branch `research-1861-dating`, base `a2ea7c2493f11ed6e1ffc954427b6e3f121b033f`. No pack data was applied. Decisions 0087 and 0097 remain in force.

## Coverage and limits

`dating.csv` keeps the four original columns: `cell,citation,date,source of the date`. It covers **1,017 cited cells and all 1,705 citations actually present in this checkout**, with **1,021 distinct source/locator pairs**. The source CSV and generated World have identical citation multisets; `evidence-r52/preservation.json` records that comparison. This is the older direction, value, trait and regard cell inventory, including experience; it is not a new dating claim about every biographical sentence in `notes` or every record-level bibliography entry.

The hand-over's 998 cells / 1,668 citations is an earlier inventory. This base contains 246 locators with an ISO-shaped day anywhere, of which only 27 have the checker's literal `dated` marker. Neither number is the hand-over's 220. The actual input inventory is retained in `evidence-r52/cells.json`; no cells were removed to force the earlier count.

**412 current citation rows have a verified date or bound: 157 exact days and 255 bounds. The remaining 1,293 say `not found`.** Eleven narrower R45 documentary records are retained as explicitly labelled supplements, giving 1,716 data rows in the CSV. Those supplements do not date broader current locators automatically.

`not found` means no underlying document date was established for that exact locator in this pass. It does **not** mean a date cannot exist, or that a source was read cover to cover. The row explains whether it is a compiled reference entry, an unresolved page/document span, an access/identification limit, or an inherited date that was not verified. The source-by-source counts are in `evidence-r52/dating-counts.json`. Many such rows still need a narrower documentary locator; this delivery does not certify them as fully dated evidence.

## What a date means

- An exact day comes from a read letter/report/entry heading or an explicit source note. A narrated event is not automatically the date of the document describing it.
- `YYYY`, `YYYY-MM`, and `lower..upper` retain the precision found. A month bound is never converted into its first or last day for application.
- A range covering several documents remains a range. Reading its first page is insufficient to date unread additional pages; those cases say `not found`.
- A compiler's imprint is distinct from an underlying letter, speech or register entry. A later imprint cannot turn retrospective narrative into a contemporary leg. Conversely, a genuinely dated contemporary letter printed later retains its letter date.
- Original citations, source kinds and policy lists are preserved. A date establishes timing, not the truth of a judgment, a man's private opinion, or a new starting bloc.

The rows contain page or dated-entry locators and point to the retained reading evidence. `official-page-extracts.json`, `official-reading.txt`, `diary-heading-extracts.json`, `diary-reading.txt`, `jones-selected-extracts.json`, `lincoln-heading-extracts.json`, `jccs-page-extracts.json` and `date-overrides.json` make the decisions inspectable. Automated page candidates are not all certified: wrong OCR page matches are excluded, and missing/unresolved pages remain explicit. `r52-dating.py` builds the table without writing a pack.

## Read sources and date decisions

**Official Records / naval records.** The retained texts were identified by their title/series pages, not just their local filenames. Selected page extracts cover OR I volumes 1-12, 16, 19 and 21, II-1, III-1/2, and ORN I-4/5 and II-2 where an actual date could be read. Not every cited volume/page was available or resolved; `official-missing.txt` and the individual rows retain those gaps. Sources are the [War of the Rebellion collection](https://www.govinfo.gov/collection/serial-set) and the named Internet Archive editions recorded in the evidence files. Cite the precise series, volume, part and printed page given in the row, rather than this collection link alone.

Examples that matter to an apply:

- **OR I-1 p 12:** Anderson's telegram is headed **18 April 1861**, and his letter **19 April 1861**. Both are under No. 6. The five page-only citations retain **1861-04-18..1861-04-19**. The surrender event does not date either document.
- **OR I-1 p 23:** Foster's engineer journal has an **1 October 1861** submission heading on p 16. The internal 13 April narrative is not its submission date. The inherited `dated 1861-04-13` marker must be replaced if this locator is applied.
- **OR I-1 p 32:** Beauregard's detailed report is headed **27 April 1861**; 13 April is the narrated event. Its inherited marker likewise needs replacement.
- **OR I-11-1 p 61:** an independently headed **28 June 1862** telegram is quoted inside McClellan's report No. 1, headed **4 August 1863** on p 5. The two page-only citations retain **1862-06-28..1863-08-04**; the telegram does not date the surrounding report.
- **OR I-6 p 558:** the date heading belongs to the **April 1863** inquiry, not to the earlier event being investigated.
- **OR I-16-1 p 1109:** November 1862 is readable; the missing day is not supplied.

**Cabinet opinions.** Read [Complete Works, vol VI](https://archive.org/details/completeworv6linc), pp 192-220 and 227-231. The first group has March 15/16 headings; the second has the explicit **29 March 1861** group heading. Broad first-group locators retain March bounds. A March 30 running head on p 230 does not replace the March 29 group heading. However, p 231 also begins a separately headed letter to John T. Stuart dated **30 March 1861**. The three unqualified p230-231 / p228-231 rows therefore retain **1861-03-29..1861-03-30**. Page230 alone and spans ending on p230 retain March29. The retained `cw6.txt` file is actually vol XII; the correctly titled vol VI text was used instead. The selected `DOC-1861` Chase and Seward documents were also checked against the read opinion/memorandum headings. Other `DOC-1861` locator dates are not accepted merely because their strings resemble dates.

**Lincoln letters.** Read the selected dated letters in Nicolay/Hay's two-volume Complete Works, retaining their recipient and date, and the separately printed cabinet opinions above. The December 10 Trumbull and April 13 Virginia-committee locators were not established in the checked selection and remain unresolved. A missing letter in a selection is not proof it never existed.

**Fox.** Read [Confidential Correspondence, vol 1](https://archive.org/details/confidentialcorr01foxg), Sumter correspondence pp 1-51: the chapter's letter headings run January-May 1861. That broad bound is used where the current page locator selects no single letter. Exact selected January 31, February 8, March 31 and May 1 letters retain their headings. The March 31 letter to Blair is on pp 11-12, continued across the page, not an assumed page-to-date conversion. Later locators outside the checked chapter remain unresolved.

**Diaries.** Welles entry headings were read in vol 1, with the 1862/1863 sequence distinguished; the 1911 imprint is not their entry date. Jones was checked against the complete year sequence anchored by the opening April 8 1861 entry and the printed January 1 1862/1863 headings. Searching only a month/day first produced misleading hits in other years; the final Jones rows use the correct year sequence. Ambiguous November numerals retain a month bound. No wrong-year candidate is promoted. See the retained selected headings and OCR line references.

**Government contracts.** Read [H. Rept.2, 37th Congress, 2d session](https://archive.org/details/governmentcontra00wash), p 1: ordered printed **17 December 1861**, with examinations beginning 27 August and continuing to the report. The relevant testimony/report rows use an August-December 1861 bound; their earlier narrated transactions do not backdate the testimony. An assumed 1862 imprint would have been wrong.

**Confederate journal.** Read [Journal vol 1](https://archive.org/details/journalofcongres00conf), the first-session opening, selected page/entry headers and p 464. Pages 96 and 106 contain business preceding the new sitting even though their running heads anticipate March 1 and March 5. They therefore retain February-March and March bounds. A running head alone must not turn Mallory's preceding confirmation into a new exact-day assertion. Unresolved vol II locators remain `not found`.

### Reference-work register and identification limits

Read title pages establish BDAC 1928, Heitman 1903, Callahan 1901, Wright 1911, and the Congressional Directory's 1861 session/edition. The retained Cullum volumes are **1868, second edition**; the generic provenance's later-edition description is not silently substituted for that copy. Retained Appletons volumes have differing reprint imprints. None of these imprints is assigned as the date of an original commission or a contemporary judgment; generic entry locators with no selected dated document say `not found`.

NH's narrative, Pearson, Foulke, Newton, Riddle, Woodburn and other biographies may quote documents, but a chapter/page span does not identify and date every quotation in it. R45's narrower documentary records remain visible separately. The retained Richardson volume I is a **1906** issue, copyright 1904; the page correspondence with inherited locators was not safely established, so no blanket Richardson date was assigned. Some requested OCR downloads failed or timed out; their `.fetch.json` files record the failures rather than a successful reading claim.

The current source policy also needs careful interpretation on the apply base: NH, Pearson and Newton are `secondary` keys in this checkout, while `hasContemporaryLeg` requires `primary`. A genuine letter reprinted in one of them needs its documentary source handled explicitly by the apply/review owner; this pass does not relabel the whole biography.

### Locator conflicts

`USREPORTS 24 How66 dated 1860-04-14` remains unresolved as a document-date claim. In the read [Kentucky v. Dennison text](https://www.law.cornell.edu/supremecourt/text/65/66), the April 14 1860 statement is Ohio Attorney General Wolcott's written advice. It is not the date of Taney's decision. The broad opening-page citation does not select that advice separately. Do not preserve that day as a certified decision date.

The ORN I-12 pp 195-198 July 5 locator remains unresolved in the full span. An inherited exact marker on an unresolved row is **not verified** merely because the production checker would parse it. These are the two remaining unverified literal markers; the sensitivity below discloses how the checker treats them.

## What the leg check would do

This is a **projection before R51 applies rs1-rs14**, not a post-apply validation. The local base predates the later warning implementation. `r52-leg-audit.py` ports the read predicates from `e8c5808` using its unchanged policy, source kinds and fact exclusions. The policy and source-code snapshots are retained. R51's extra register keys are unused by this older cell inventory, so they do not change these counts. No warning is waived or pack source changed.

| Projection over the 839 judgment cells | No contemporary leg | Weak-citations-only cells | Date uncertainty |
|---|---:|---:|---:|
| Existing literal markers only | 292 | 0 | Undated citations mechanically admitted |
| Verified CSV dates/bounds inserted, current exact-day parser | **373** | **55** | Bounds still ignored by that parser |
| Research comparison respecting the verified bounds | **485 definite** | **145 definite** | **312 judgments undecided; 42 have a verified timely leg** |

The 55 weak-only cells overlap the 373 no-leg cells; do not add them together. The first column is the contemporary-leg warning predicate; weak-only is the separate refusal/error predicate. Current lists of every affected cell are in `evidence-r62/leg-audit.json`; `evidence-r52/leg-audit.json` preserves the original R52 projection.

There are another **67 uncited factional blocs** on this pre-apply base. Including those gives **359 existing warnings**, **440 projected warnings** with the current parser, or **552 definite missing-leg cases** when bounds are respected, with the same 312 unresolved judgments. Facts and experience are excluded from the contemporary-leg judgment count according to 0087; the weak-only diagnostic still covers all cited cells. The uncertain judgments prevent certification of one fully dated final historical total. The bounded analysis permits 485-797 judgment failures, depending on unresolved documents; those endpoints are diagnostic possibilities, not newly established dates.

The hand-over's **84** was an older sensitivity using embedded dates plus the weak list, not the no-leg predicate. Treating every ISO-shaped day in this checkout as a document date gives **83 weak-only cells** /403 no-leg judgments, but that unverified exercise is retained only as `inherited-date-sensitivity.json`. It is not proposed for application.

For bounds, the research comparison computes interval endpoints internally solely to compare the policy boundary. Those computational endpoints are not historical dates and are never written as `dated YYYY-MM-DD`. The production parser recognizes only a complete literal day. Fixing that parser is outside R52.

## R62 correction audit

The exact-day audit covers all **99 distinct citation/date groups (178 rows, including 11 R45 supplements)** that were exact before R62. `evidence-r62/exact-day-audit.json` records each disposition. Ten current rows become bounds: the five Anderson rows, three Bates rows extending through Complete Works VI p231, and two McClellan rows on OR I-11-1 p61. Named diary entries and selected letters retain their dates despite neighboring documents; page-only locators retain an exact day only where the read document/session headings agree. Mentioning an earlier document or event without a separate document heading does not date the enclosing letter. R52's reading evidence is reused for the unchanged rows; this is not a new cover-to-cover reading of every source.

Buchanan's recorded departure is **dismissal**, dated **22 April 1861**, in the 1863 Navy Register, **p112, Dismissals, Captain Franklin Buchanan** ([composite register](https://archive.org/details/registerofcommi00unit)). Appletons vol1 p428 describes his resignation and refused attempt to withdraw it; that account is distinct from the register's classification. The rs8 row, research notes and research-tool wording now distinguish them. The source key `NavyReg1863-RESIGN` remains stable. No pack or runtime data was applied. The protected lane hand-over remains untouched; the R62 coordination status records the correction to its collective resignation wording.

The bound-aware projection is unchanged. The old exact-day parser's no-leg/weak-only projections move from 377/59 to 373/55 because it ignores bounds; this is a parser limitation, not newly timely evidence. No date policy or parser was changed. `evidence-r62/source-reading.json` retains the read headings and source hashes.

R62 typecheck and focused coverage, regeneration, wording and preservation checks pass. The research-tool probe intercepts all writes in memory and checks that only Buchanan's note/citation and the registry description differ. This old base lacks R50's CommonJS marker; the probe loads the unchanged CSV helper explicitly. Its initial module-loading failure is retained. The full `MANDATE_NO_GIT=1 npm run check` is not run: this base's configuration does not exclude `tools/test/staged-check.test.ts`, whose fixtures invoke Git init/add/rm. The standalone done-check is not run: its CLI creates output only under `runs/`, outside R62's authorized research paths. These inherited gates remain unmet; the focused checks do not waive them. No dependency installation or expensive campaign was performed.

## Original R52 verification and remaining work

The table builder, the 1,705-row current-citation coverage check, date-shape checks, source/World comparison and preservation check pass, exit 0. **629 baseline files outside the authorized write scope are unchanged**, HEAD is still the requested base, the index is empty and `git diff --check` is clean. Logs, hashes and the final file inventory are under `evidence-r52/`. The research scripts use only read-only git subcommands.

In the original R52 run, required `MANDATE_NO_GIT=1 npm run check` exited **2**, before tests, because Node type definitions are unavailable. Required `npm run run:done-check` exited **1**, because `tsx` is unavailable. **0 tests ran; 0 done-check criteria were evaluated.** No dependencies were installed. This base's Vitest configuration also lacks the later no-git fixture exclusion, so installing dependencies alone would not authorize a full run. These gates remain unmet and belong to the compatible integration base. No expensive retry or campaign was run.

Stone's contemporary authority and Bulloch's exact start-day commitment are still unproved: see `stone-1861.md` and `bulloch-1861.md`. The strongest new sources and the remaining limits are recorded there. The optional third held-cell round was not undertaken; no rs15 recommendation is fabricated to fill it. Standing review remains with Claude; no git stage, commit, merge, fetch, push, pack generation, gate signature or R51 apply was performed.
