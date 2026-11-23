# S76: continuation of the held service terms

S76 only, `sprint/research-military`, from `9e210f6e`. The [continued register](S76/term-register.csv) preserves S75's 161 keys, its 150 observations and its 43 previously supported federal-term rows. S76 adds 28 observations and supports seven more federal terms. **111 of the requested 118 federal terms remain unresolved.** This is a partial research continuation, not completion of the original-record retrieval requirement.

No pack, kernel, catalogue identity, contract-day value or expiry changes. Nothing is applied. S74's worktree was not written or used to run commands.

## New contract evidence

| Catalogue identity | Supported original federal term | Read source and printed page |
| --- | --- | --- |
| Maine 3rd | Three years; muster June 4, 1861 | Maine AG report for 1861, main p.6; Appendix F pp.2-3 |
| Maine 4th | Three years; muster June 15, 1861 | Same, main p.6; Appendix F pp.2-3 |
| Maine 5th | Three years; muster June 24, 1861 | Same, main p.6; Appendix F pp.2-3 |
| Maine 6th | Three years; muster July 15, 1861 | Same, main p.6; Appendix F pp.2-3 |
| Rhode Island 1st | Three months | Official Register (1866), pp.[1],9 |
| Rhode Island 2nd | Three years **or during the war** | Same, pp.[39],[45] |
| Louisiana Washington Artillery | For the war, original battalion | OR I-LI.2, pp.572-573 |

Maine's report names the Third through Sixth among the regiments initially enlisted for **two years in State service**, then explains the additional-year agreement required for federal service (main pp.6-7). The individual regiment rows in the official return explicitly put their federal service in the three-year column; its reverse names Captain Thomas Hight as mustering officer (Appendix F pp.2-3). [I] The named contract explanation and those separate regiment rows establish the join. This is neither apportionment of an army aggregate nor subtraction of a discharge date. Appendix F's aggregate quantities include later recruits; no strength is extracted or applied here. `F2`/`F3` in the CSV distinguish this restarted pagination from main pp.2-3.

Rhode Island's own unit histories link each named regiment to its original call, alongside its muster register. [I] These are named unit-to-contract joins, not general statutes applied to every regiment. The First's May 2 entries are specifically original field/staff entries (p.9), not a newly established simultaneous muster of every soldier. The Second's field/staff list has June 5 and June 6 dates, with later appointments separately listed (p.[45]). Its war clause remains part of the contract (p.[39]); three years is not converted into an unconditional 1,095-day expiry. The retained digitization covers the First and Second infantry, not the complete State register or the attached battery.

Walton's June 16, 1862 letter expressly describes the battalion's **original** tender for the war and direct muster as a battalion before its June 1861 Richmond arrival (OR I-LI.2 pp.572-573). That is retrospective testimony about the original contract, not a term inferred from a later reorganization. [I] The catalogue Washington battalion and its detached July sections share that original battalion identity; no later company is included. The exact original muster day remains unestablished.

## Evidence that does not clear a federal regimental term

Clark's Fifth State Troops history links its organization to the May 8 act and distinguishes it from the Fifth Volunteers, later Fifteenth (I p.281). It supplies no original acceptance or muster contract, so its term value stays unknown. Ray expressly says the Sixth's men were mustered for the war (I pp.295-296); the register records that as North Carolina State Troops evidence and retains the separate Confederate acceptance/transfer hold. Avery's account describes the authorizing bill as three years or the war (p.337); the statutory description does not replace Ray's actual-muster testimony or a Confederate roll.

The printed Eleventh North Carolina remains an identity hold. Clark's Twenty-first history gives an early-June Confederate muster at Danville under Kirkland (II p.129), but that is a candidate until an original numbered-unit crosswalk joins it to the catalogue observation. No term or muster from the Bethel regiment or the later Eleventh is borrowed. Early June is not completed to exact dates.

South Carolina's official roll compilation supplies different component contracts within the Second Regiment. Wallace's Company C was mustered May 23 for twelve months **from May 22** (II p.62). Kennedy's Company E entered Confederate service for the **balance of the State term**; its May 23 roll remarks name the State authority (p.118). These complement S75's Third Regiment Company B evidence, not a uniform Confederate contract for the whole Second, Third or Fourth. No fresh full year is invented at transfer.

Hampton's May 8 enclosure describes a proposed one-year legion covering infantry, cavalry and artillery; Walker's April 27 conditional acceptance and Pickens' April 30 assent accompany it (OR IV-I pp.303-305). The enclosure expressly places receipt after completion of organization. It does not establish the completed original muster terms of the three catalogue arms. All three remain held.

Early reports Fagan's Arkansas regiment already mustered into Confederate service on May 27 (OR I-LI.2 p.115). That is the report's date, not proof of the performed muster day; the passage supplies neither a term nor an original numbered-unit crosswalk. It remains candidate evidence.

## Coverage and remaining retrievals

The [118 search dispositions](S76/search-dispositions.csv) preserve every starting `retrieval_needed`, record the actual work and its limits, and retain the next retrieval. They do not claim 118 completed archival investigations. Confederate OCR token searches across both OR IV-I scan sections and I-LI.2 are search aids; only retained, page-located passages are used as evidence. State-wide token matches are not individual-regiment matches or proof that no acceptance survives.

Michigan's official biography text and the unit openings in *Michigan in the War* were searched, but the original-biography page locator could not be verified. That observation was excluded. A few individual contracts would not establish the entire regiment's term. Other unsuccessful downloads, blank page responses and incomplete XML files are also excluded from the reading receipt.

There are no New Jersey or Pennsylvania keys among these 118 term holds; no Stryker or Bates term is applied to a different identity. The New York militia/battery identity holds persist. Original company and individual records are still required for regular/Marine detachments; a regular regiment is not one volunteer enlistment contract. The unresolved Confederate regiments still need their own acceptance/muster/roll and a demonstrated act/contract join. General acts, army totals, later reorganizations, discharge arithmetic and unidentified components remain insufficient.

Across the full continued register: **50 federal terms supported, four State-only federal holds, 107 without an original regimental term**. Forty-nine IDs have muster observations, including component evidence; that is not 49 complete regiment-wide muster dates. S75's four conflicting muster sources remain unresolved. The remaining **111 federal terms are unfinished S76 research**, not outside scope or waived acceptance criteria.

## Verification

[Source reading receipt](S76/source-reading.json): 19 source entries, including two scan sections of OR IV-I; 21 new page locators and nine newly inspected scans/renderings. Earlier readings retain their S75 attribution. Sources remain outside every worktree. Five added source entries represent four publication volumes and the additional OR scan section, not five distinct new works.

`python docs/research/S76/verify.py --sources` passes **2,361 checks**, including **171 external artifact hashes**, exact continuation, the unchanged prior 43 rows/150 observations, citation coverage and authority/component holds. It verifies integrity, not historical review or missing retrieval completion.

Dependency installation, local workspace resolution, typecheck and boundary checks passed before expensive validation. One default eight-seed done check with drafting exited 0: **Phase 0 6/6; supplemental 1A 2/6**, with exactly S75's ten problems. The CLI ignored an attempted `--help` flag and ran its defaults; this is the sole campaign, with the actual node exit retained. No replacement campaign was run.

Both references match S75 in every non-timing field: **268 daily hashes**, zero rejections, replay/resume and byte-identical saves. All **1,792 starting tracked paths remain byte-identical**. Shared-Windows Union war/history median ticks were 24.51/23.69 ms, p95 40.83/38.53 ms. No idle-host, Linux or S74 timing clearance is claimed. Complete problems, comparisons, logs, exits and inventories are retained in `runs/s76/`; [validation.json](S76/validation.json) carries compact diagnostics. Inventories and runtime diagnostics preceded final prose.

The normal commit invokes the unchanged hook; its actual result is recorded in `runs/s76/commit-receipt.json` and `commit-hook.log`. No hook bypass or push. Claude's standing research review remains pending under the sprint process.

Proposed rulings [I]: retain the seven supported federal contract observations for lead review, with every qualifier; retain North Carolina's State-only distinction and all candidate/component holds. Reject treating a proposal as a muster, multiplying a company's term across a regiment, restarting a year at transfer, or retiring the 111 missing retrievals because integrity/runtime checks pass.

## Findings outside my scope

The 111 remaining federal-term retrievals and original-record crosswalks are unfinished S76 work. Separate work outside S76 is pack application, contract-day conversion, S74, performance certification, whole-branch acceptance, main integration, release and pushing. Nothing is signed or cleared for main. One fresh-read UTF-8 Python append to the main coordination file reports the actual commit result.
