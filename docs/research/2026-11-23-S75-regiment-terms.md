# S75: original service terms and musters

S75 only, `sprint/research-military`, from `e48d7e2cb65f7904b2e5ecf54f73eaad04bbb5f2`. Research is **partial**: every requested catalogue identity has a disposition, but the requirement to establish every original term and muster is not met. No pack, kernel, term-day value, identity, expiry, call match or band is changed.

## Register and limits

The read-only July input contains 214 identities: 53 already carrying terms and 161 requested empty-term identities (77 Union, 84 Confederate). Its original bytes have SHA-256 `68b1be1235d161958ddd0af75dfad4e78a3f37c0bb77236ba3801fa3c200a886`. [catalogue-receipt.json](S75/catalogue-receipt.json) pins its path, requested keys and prior terms. This is the input as read, not a claim that the concurrently edited July tree is unchanged.

| Disposition | Identities |
| --- | ---: |
| Original Union or Confederate term sourced | 43 (42 Union, one Confederate) |
| Original State term only; Confederate contract held | 3 |
| No original regimental term established | 115 |
| Performed-muster observation present | 47 |
| Performed muster unestablished | 114 |
| Sourced federal term and muster observation | 36 |
| Conflicting performed-muster sources, within the 47 | 4 |

Thus **118 federal-term identities remain held**, including the three with State terms only. Here “federal” distinguishes United States/Confederate States service from State service. A sourced term does not clear a separate muster, component, date or identity hold. These are not 43 automatically applicable model rows.

- [term-register.csv](S75/term-register.csv): one row per requested ID, in catalogue order; separate term/muster dispositions, observation links and retrieval requirements.
- [service-observations.csv](S75/service-observations.csv): 150 observations with authority, event, date precision, component scope, historical term units, source and printed page. `evidence` contains summaries or short extracts, not a guarantee of verbatim transcription. `[I]` marks an interpretation or identity join.
- [search-dispositions.csv](S75/search-dispositions.csv): all requested keys in 25 side/State groups, sources read and search limits.
- [source-reading.json](S75/source-reading.json): 14 works, 101 retained page passages and 21 inspected images/contact sheets, with external paths, URLs and hashes. This is selected-passage reading and bounded searches, not whole-volume reading. Other downloads and failed retrievals are search aids only.

`unknown` means unestablished here; `none` means no linked observation. Neither means no historical contract or surviving record. Event dates are not expiry intervals. `original_term`, `muster_in`, `credited_date`, `organization`, `component_term` and parent/candidate evidence remain distinct. A month or range is not silently completed to exact days. Terms remain months, years or the war; there is no day conversion, computed expiry or date trigger.

## Source findings

Dyer is the Union starting source. He explicitly lists Connecticut's 1st, 2nd and 3rd as three-month regiments (p.21), calls Michigan's 2nd a three-year regiment (p.1281), gives Varian's militia battery three months (p.1403), and gives the First Rhode Island Battery three months and a May 2 muster (p.1633). An organization or discharge date is not substituted for a missing original contract or performed muster.

Official State publications supplement Dyer's omissions. Phisterer's original-service entries give the numbered New York regiments' terms and company dates; per-unit citations are in the rows. The **26th New York was accepted by the State for two years but initially mustered federally for three months on May 21**. Its August extension is not an original two-year federal contract (III, p.2027). The 82nd/2nd Militia and 84th/14th Brooklyn aliases and three-year service are explicit (IV, pp.2897,2929-2930). GO13's “Thirteenth Militia” is not silently joined to Rochester's volunteer 13th; candidate evidence stays unapplied (III, p.1887).

Four performed-muster conflicts remain unresolved. Credited dates are separate:

| Identity | Dyer | State history/register |
| --- | --- | --- |
| 25th New York | June 28, p.1414 | June 26, Phisterer III p.2012 |
| 27th New York | June 15, p.1414 | July 9 and 10, credited May 21, Phisterer III p.2039 |
| 31st New York | May 14, p.1416 | Field/staff and companies May 24-June 13, Phisterer III p.2089 |
| 26th Pennsylvania | May 27, p.1585 | May 25, credited May 5, Bates I p.344 |

Bates gives the 26th Pennsylvania's federal muster as three years; its earlier three-month State offer was not actually mustered (I, p.344). He gives the City Troop's three-month May 13 muster (p.241), M'Mullin's Rangers as three-month troops (p.243; command/label crosswalk [I] with p.107), and Fourth Connecticut as three-year volunteers (p.107). No new identity follows from a spelling difference.

Massachusetts defines its following volunteer histories as three-year regiments and names the 1st, 2nd, 9th and 11th within that section (1861 report, pp.30-32,34,36). Vermont's official roster directly gives the 2nd three years and June 20 muster (p.27). New Hampshire describes the 2nd's early three-month recruitment, May change, three-year organization and second muster by companies June 1-8 (p.25); this does not make every individual's first contract identical. Wisconsin's June 10, 1864 order expressly states the 2nd's completed original term was three years (1864 report, p.26). That is an explicit original-term statement, not an inference from reorganization.

Cooper accepted Henry B. Kelly's regiment **for the war** on June 12 (OR I-LI.2, p.138). Louisiana's report names Kelly with the Eighth and gives its June 15 muster (OR IV-I, p.750); that identity join is marked [I]. The report gives Sixth Louisiana's June 4 and Seventh Louisiana's June 5 musters, but the changing tenders do not explicitly establish either numbered regiment's actual original contract in the passages read (pp.747-750). The war is not 1,095 days.

South Carolina's Historical Commission links the 2nd, 3rd and 4th to the original one-year State call under the December 17, 1860 act, separating State service from Confederate muster (II, pp.[1],284,570). The 2nd's State muster was April 9 and Confederate muster May 22-23; the 3rd's Confederate muster was June 6; the 4th entered State service April 14 and mustered Confederate June 7. **Company B of the 3rd entered State service for twelve months, then Confederate service for ten months and eight days** (p.318). This component term does not apply to the whole regiment. A full year must not restart automatically at transfer. Separate Confederate regimental contracts remain held.

North Carolina distinguishes a twelve-month volunteer force from war-term State Troops (first extra session 1861, chapter 3 section 1 p.87; chapter 6 sections 1-2 p.95). Tennessee's provisional force statute specifies twelve months unless sooner discharged (April extra session, chapter 3 section 3 p.22). Numbered-unit-to-act and muster links remain held. An OR roster or brigade order is organization evidence, not a contract (OR I-II, pp.470,943-944). Virginia aggregate enrollment/term tables and a later Confederate roster do not supply individual original contracts (OR IV-I, pp.626-633,837,860-863). No blanket term is assigned to regular/Marine components, unnamed militia, batteries, unidentified battalions or same-number candidates.

## Verification and handoff

The source audit passes **2,037 checks**, including exact catalogue coverage/order, prior-record exclusion, observation joins, read-page coverage, authority/component holds and 136 external artifact hashes. Run `python docs/research/S75/verify.py`; add `--sources` on this research host. It audits integrity, not historical truth or an independent review. The scan check corrected OCR/page-map guesses; accepted and rejected locators are recorded.

Final data inventory and runtime diagnostics preceded this note. All **1,783 starting tracked paths remain byte-identical**. Dependency installation, workspace alias/startup, typecheck and boundary passed first. One default eight-seed done check with drafting exited 0: **Phase 0 6/6; supplemental 1A 2/6**, with the same ten S72 problems. Unmet criteria remain unmet. Both references match S72 in every non-timing field: 268 daily rows/hashes, zero rejections, exact replay/resume and byte-identical day-60/day-40 saves. No extra campaign.

Shared-Windows Union war/history medians were 31.58/31.03 ms, p95 53.63/51.69 ms; testbed median/p95 3.52/4.84 ms. Other Node processes were observed; the user reported other lanes active. This is no idle-host or hosted-Linux certification and does not decide S74's gate. [validation.json](S75/validation.json) retains diagnostics and hashes; complete logs/exits, States/saves, host inventory and preservation evidence remain under `runs/s75/` and `runs/s75-done*/`.

Commit only this packet, note and handover normally through the unchanged hook. Actual outcome: `runs/s75/commit-receipt.json` and `runs/s75/commit-hook.log`, produced by that invocation. No skip, override or push. Historical review remains with the lead under the sprint process.

Proposed rulings [I]: retain authority/component scope, actual versus credited dates and conflicts; accept explicitly supported terms only after lead review; leave unresolved identities unmatched. **The research gap remains open.** Per-ID retrieval requirements name the original records and joins still needed. A passing audit does not satisfy the missing historical evidence.

## Findings outside my scope

Unfinished S75 work: the held original records and crosswalks are still required by the original request. This packet does not retire or move that acceptance criterion. Separate work outside S75 comprises pack application, S74/S73, model day conversion, timing certification, whole-stack review, main integration, release and pushing. Other worktrees were not written; `sprint-pushback` was not accessed. One status is appended to main CODEX by UTF-8 Python after a fresh read, preserving every previous byte.
