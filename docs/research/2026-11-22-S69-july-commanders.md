# S69: July commanders as cast drafts

Research draft for the lead, 22 November 2026. **Unapplied and unsigned.** S69 only, on `sprint/research-cast`; no S68 or S70 work is included. Decisions 0107 and 0108 were read from the main checkout, together with the S69 brief and the standing sprint rules. The live pack, kernel, generated data, saves and gate records are unchanged.

The [commander audit](S69/commander-audit.csv) accounts for all **29** missing commanders in S66 after excluding Cocke. There are **25 identified people drafts** and **four identity holds**. These are partial evidence records, not 25 fully sourced, eligible opening appointees. All **275 judgment cells** remain unknown. The [175-field factual table](S69/facts.csv), [service history](S69/service-history.csv) and per-person notes preserve the evidence and its limits.

## Files and reading

| File | Use |
|---|---|
| [people.csv](S69/people.csv) | 25 historical people, with the live cast's exact 28-column header. Empty fields stay unknown. |
| [people-held.csv](S69/people-held.csv) | The same header for Carson, Meem, Williams and Wynkoop; identity fields remain empty and no provisional person ID is assigned. |
| [commander-audit.csv](S69/commander-audit.csv) | One disposition for every requested commander, with identity evidence and remaining requirements. |
| [facts.csv](S69/facts.csv) | Name, birth, death, opening faction/kind, ranks and prewar service, with page citations. `KNOWN_NONE` distinguishes Early's neutral opening from an unknown faction. |
| [judgments.csv](S69/judgments.csv) | 275 HOLDs: centres, temperament, regard, values, traits, relationships and practices. A HOLD is not a direction to erase another lane's accepted evidence. |
| [service-history.csv](S69/service-history.csv) | Eleven departures, separating pre-start exits, Elzey's later resignation, Howard's same-side change and Terrett's disputed departure kind. |
| [source-index.json](S69/source-index.json) | All 84 cited pages: original URLs, external artifacts, SHA-256, page locators and rejected-locator history. |
| [read-passages.json](S69/read-passages.json) | Public-domain page text and selected transcriptions; short factual paraphrases for the three modern archival sources. |
| [reading-receipt.json](S69/reading-receipt.json) | Reading scope, the 23 images inspected and OCR corrections. Retention is not a claim that every word of a page or book was read. |
| [verify.py](S69/verify.py) | Focused, read-only research checks; no fetch or apply path. |

Downloaded scans, rejected locators, full PDFs, OCR and acquisition scripts are outside every worktree at `C:/Pyrrhic/mandate-research-sources/S69/`. Logs and preservation receipts are in ignored `runs/s69/`. The two other worktrees were read only. The S66 audit joins exactly; the local live cast has no duplicate draft ID. The read-only July working file has 268 people and already contains `cocke_philip_st_george`.

Source keys beginning `NEW:S69-` are **research keys**, not additions to pack provenance. Their page numbers resolve through the source index. The principal references read were:

| Keys | Work and limited use |
|---|---|
| `HEITMAN` | Francis B. Heitman, *Historical Register and Dictionary of the United States Army*, I (1903), named entries: regular, volunteer and state grades, dated service and departures. |
| `AP1`–`AP6` | *Appletons' Cyclopædia of American Biography*, digitized copies catalogued 1887–1900; named factual entries only. Exact copies are pinned in the index. |
| `UA8` | *The Union Army*, VIII (1908), named factual biographies; later characterizations excluded. |
| `CALLAHAN` | *List of Officers of the Navy … and Marine Corps, 1775–1900*, p699, Terrett. |
| `CULLUM-I`, `CULLUM-II` | Cullum's 1891 register, I p674 and II p310, Early's and Willcox's prewar service/civilian intervals. |
| `OR-I-2`, `OR-I-51-1`, `DYER` | The S66 editions of the Official Records and Dyer, re-read for the selected named command passages. Original scan hashes and page locators are preserved from S66. |
| `CONGRESS` | *Biographical Congressional Directory*, named entries at pp630 and 713, factual offices and the Negley date conflict. |
| `NY37` | New York's official 37th Infantry roster, p698, McCunn's distinct rank-from, commission, muster and discharge dates. |
| `NJ-MANUAL` | *Manual of the Legislature of New Jersey*, 107th session, p144, Runyon's birth, law practice and 8 May 1857 militia appointment. |
| `CLARK1` | Emmons Clark, *History of the Seventh Regiment of New York*, I (1890), pp251, 468–469, Sandford's prewar command and February 1861 letter. |
| `BARTOW-UGA` | University of Georgia's 1901 Centennial Alumni Catalog family questionnaire, manuscript pp299, 301–302: Bartow's identity, birth, prewar militia service and death. The family memorial is not contemporary judgment evidence. |
| `RUNYON-OBIT` | *Ingham County News*, 30 January 1896, PDF leaf 2, left newspaper page, “A Diplomat Dead”: the Berlin dispatch of 27 January reporting Runyon's death that morning. Other military chronology there is not used. |
| `ALEXANDRIA`, `YALE`, `UNION-LEAGUE` | Modern archival/reference descriptions, respectively p29, the downloaded guide's p1606, and p9; narrow factual identity or life-year uses. No likeness asset is delivered. |

The initial automatic page labels were unreliable. The retained history shows corrected JP2 leaves for Appletons I pp216, 292 and 493, and the Davies image's corrected **printed p90**. Image inspection also corrected Bee's printed approximate birth year to **1823**, and OCR headings `840`/`616` to **340**/**516**. Discarded labels and images are not silently reused as citations.

## Opening facts and service

The table reports **5 March 1861**, separately from the later command observations. Six active U.S. officers have sourced opening service: Abercrombie, Elzey, Howard, Miles, Andrew Porter and Marine officer Terrett. Militia commissions and dated pre-start command evidence also establish Bartow, Runyon and Sandford as officers; they do not become federal generals by backdating a later muster. Documented civilians retain `other`. These vocabulary classifications and geographical faction assignments are marked **[I]**; they are not claims about motive, loyalty or ability.

Of the 25 identified drafts, **seven opening factions and four opening kinds remain unknown**. Early's blank faction is a separate, known-neutral representation [I] from his Virginia civilian interval and the pack's opening government rule. A consumer must read the factual status table; it must not turn every empty faction into either neutrality or Confederate service. No later appointment is an opening-side source.

The dated departures require different treatment:

- **Elzey:** U.S. captain at the start; resignation **25 April 1861**, then Confederate service. His draft alone proposes an in-window 0101 service row. The null government is **[I] under 0101 item 5**, using Heitman's Maryland appointment provenance rather than birthplace; no Maryland secession trigger is invented. Sources: `NEW:S69-HEITMAN p404`; `NEW:S69-AP2 p340`.
- **Bee, David R. Jones and Evans:** U.S. resignations **3 March, 15 February and 27 February 1861**, respectively. They have already left the U.S. Army before setup. Their precise 5 March destination service/kind remains held pending a dated entry or commission; later Confederate brigades do not settle it. No new 0101 offer is drafted. Sources: `NEW:S69-HEITMAN p205`, `p580`, `p410`.
- **Howard:** regular-Army resignation **7 June 1861**, while entering Union volunteer service. No cross-side 0101 row. Source: `NEW:S69-HEITMAN p546`.
- **Terrett:** Callahan says **dismissed 6 May 1861**; the later Alexandria account calls it resignation. The departure's voluntary character is held, and every scripted-resignation field remains empty. Sources: `NEW:S69-CALLAHAN p699`; `NEW:S69-ALEXANDRIA p29`.
- **Davies, Early, Richardson, Tyler and Willcox:** their old U.S. commissions ended before setup. Their past ranks remain historical facts, with departures in the sidecar; they are not continuous current-service eligibility. Sources: `NEW:S69-HEITMAN p356`, `p393`, `p828`, `p977`, `p1038`.

The cast vocabulary combines lieutenant grades. The factual notes retain the original first/second lieutenant distinctions, units, brevets and dates. Terrett's Marine ranks stay in the factual notes because the read vocabulary has no USMC service: they are not relabelled Navy or Army commissions. No new vocabulary or eligibility mechanism is proposed by the CSV.

## Holds and conflicts

| Commander | Identity remains held; what would settle it |
|---|---|
| Carson | A named Virginia militia commission, muster or signed Winchester order matched to the 18 July command. OR I-II pp473 and 982 do not expand the name. |
| Meem | A full-name militia commission or signed Winchester order linked to Johnston's reference, OR I-II p473. |
| Williams | Dyer p270 supplies initials `A. S.` but not a proved full identity. A Pennsylvania general-officer roster or commission must bridge to the brigade in OR I-LI.1 p398; no substitution from another Williams. |
| Wynkoop | Dyer p270 prints `Geo. C. Wynkoop`. A full identity and commission/service bridge to the 10 June and 8 July brigade is still needed; OR I-LI.1 pp397, 415. |

The identified records also keep source holds. **Three births and five deaths are wholly unknown**, and other dates retain year precision where that is all the admitted evidence supports. The principal conflicts are:

| Item | Retained treatment and pages |
|---|---|
| Andrew Porter, death | Heitman p798: 4 January 1872; UA8 p201: 3 January. Common year only. |
| David R. Jones | Heitman p580 prints Rumple and 16 June 1863; Appletons III p465 prints Rump and 8 March 1863. Retain the initial and common death year. |
| Tyler, birth | Appletons VI p192: 7 January 1799; UA8 p278: 22 February. Common year only. |
| Negley, birth | Appletons IV p487 and Congressional Directory p713: 26 December 1826; UA8 p184: 22 December. Common year only. |
| Blenker, colonel | Heitman p224: 23 April 1861; Appletons I p292 and UA8 pp33–34: 31 May. Flat event held pending the instruments. |
| Howard, colonel | Heitman p546: 4 June 1861; UA8 p133 describes a commission bearing 28 May. Preserve both; the draft's register date is provisional. |
| Willcox, colonel | Heitman p1038 and Appletons VI p516: 1 May 1861; Cullum II p310: 24 May. Preserve both; the register event remains provisional. |
| McCunn | Official roster p698 separates rank from 28 May, commission 20 June and muster 8 June. Yale's downloaded p1606 supplies life years 1824–1872, not exact dates. |

Every other missing fact and the required next evidence is in the person's notes and audit row. A reference-work date is a sourced claim, not a claim that no contrary source exists.

## Proposed rulings [I]

1. **Keep the literal opening and its uncertainty.** Retain documented civilian/serving status, and distinguish known-neutral from unknown. Reject assigning all future brigade commanders a federal opening commission, a destination faction from their later command, or a motive from resignation. A later kind/eligibility transition, where needed, belongs to the apply/command owner.
2. **Preserve departure and commission distinctions before applying ranks.** Keep historical service records apart from eligibility intervals, and state commissions apart from U.S. volunteers. Apply only a separately reviewed Elzey service proposal; hold Terrett's voluntary departure and Howard's cross-side fields. Reject continuous old commissions, a second offer to a pre-start resignee, invented USMC vocabulary and a dismissal encoded as voluntary resignation.
3. **Retain holds rather than manufacture centres or precision.** The dated orders establish tasks and command observations; later reference praise does not establish a temperament or centre under 0085/0087. Reject an average default, an inferred full name from initials, a birthday chosen between conflicting sources, or a command date used as a commission date. No new canon ruling is made here.

## Verification and preservation

The cheap gates passed first: root `npm ci` **exit 0**, zero vulnerabilities; typecheck **exit 0**; opening tests **9/9**, exit 0. Focused research validation passes: exact header, 25+4 coverage, date shapes, unknown judgments, service boundaries, all 84 citation resolutions/artifact hashes and **1,757 original tracked files unchanged**. The S66 missing-name set matches all 29 audit rows, excluding Cocke, with no live-ID duplicates. Evidence: `runs/s69/research-checks.log`, `coverage.json`, `baseline.json` and `precommit-inventory.json`.

One normal eight-seed done check, with drafting, ran headlessly: **exit 0 in 942.14 seconds**. **Phase 0 is 6/6; supplemental 1A remains 2/6.** All ten inherited problems remain: three checkpoint quantities/operations, no fought history operation, four pushback breaches, and the two D6 measurement/chain limitations. The default exit binds Phase 0 only. No assertion, band or simulation input was changed, and no failed criterion is waived.

Windows reference war/history median ticks were **25.37/23.46 ms**, with p95 **41.57/38.44 ms**; these are shared-host measurements, not unloaded-host or hosted Linux certification. S68 was running on this host per the owner's coordination. The unknown-strength criterion's Union observations contain **zero battles**, so that pass supplies no July-army combat evidence. Raw diagnostics: `runs/s69/done-check.log`, `done-check.exit.json`, `runs/s69-done/` and its drafting artifacts.

The runtime diagnostics and preservation/package inventory were completed before this result note. The commit is required to pass the **actual unchanged pre-commit hook**, with standing `MANDATE_NO_GIT=1`; this pre-commit note does not claim a future hook result. Its final command, exit, duration and commit are retained in `runs/s69/commit.log` and `commit.exit.json`, and reported in the sole CODEX status. There is no push, hook bypass, history rewrite, pack apply, signature or browser/desktop use.

## Findings outside my scope

The cast apply must resolve or explicitly retain the remaining opening, commission, life-date and vocabulary holds; it cannot load these drafts wholesale. Command eligibility intervals and any later kind changes need their owning mechanism. S68, S70, regiment organisation/transfers, historical calibration and inherited 1A/D6 failures remain with their assigned owners. Whole-branch review, gate review, main integration and release remain with the lead and steward under 0106/0107. No item is signed or cleared for main.
