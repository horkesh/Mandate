# S86: Virginia, Louisiana and the later Confederate calls

23 November 2026. Research only, for the lead's review. No pack, strength, service term, band, trait or accepted decision changes. The 100,000 floor and its failure remain.

The registers establish additional identities and dated service events. They do **not** establish an exact allocation of Letcher's June 17 aggregate, a numerical July return for each regiment, or the identity of Arkansas's excluded pair. Those parts of S86 remain research holds. There is no justified number of extra men to apply from this packet.

## Evidence and counting unit

- [Virginia units and companies](S86/virginia-units.csv): **49 observations**. The June 1 numbering order supplies 36 rows, of which 18 describe formed regiments and 18 prescribe future designations. Eight May 14 company/force observations and five June 30 command components follow. These are observations at different dates, not 49 distinct additive units.
- [Virginia area crosswalk](S86/virginia-area-crosswalk.csv): **14 estimates** from the May 30 headquarters statement, retaining each place's qualifications.
- [Louisiana acceptances and returns](S86/louisiana-acceptances.csv): **24 observations**, including the ten numbered volunteer regiments with dated service-entry events before August, the regulars, battalions, direct acceptance and later exclusions.
- [Later-pair register](S86/later-pairs.csv): **10 cases**, separating the four requested States' calls from earlier/different requests and Georgia's brigade and extra pair.
- [Read sources](S86/source-reading.json): printed-page locators, exact retained extracts/scans, URLs, hashes and excluded retrievals. Each CSV's `source_keys` resolves here. Headless extraction and image inspection only; no browser or desktop control. Scans remain in `C:/Pyrrhic/mandate-research-sources/S86/` under the standing sprint rule.
- [Model inputs](S86/model-inputs.json): frozen S82 world/catalogue and S84 projections, plus S64's committed register read through `git show e2b98c81:docs/research/2026-11-22-S64-command-inclusion.csv`. The active S83 worktree is not an implementation input.

Historical statements below cite sources read. **[M]** marks the frozen model. **[I]** marks identity joins, comparisons and proposed rulings. A blank headcount means unknown, never zero. A unit's formation, State muster, Confederate acceptance, transfer, arrival and present-for-duty return are different observations.

## 1. Virginia: the aggregate cannot be treated as a second army

Letcher's message begins on June 17 and claims upward of 40,000 volunteers armed, equipped and ready (OR IV-I pp. 388,392). It does not enumerate their regiments or companies. The useful parallel is Lee's June 15 report, explicitly covering preparations through transfer of the State's military operations. Lee says complete field returns have not been received, estimates about 35,000 from available information, then discusses about 40,000 through arms issues, troops from other States receiving Virginia arms, and Virginia companies already armed when received. These are qualified estimates at different dates/scopes, not an audited June 17 muster sum ([OR I-II pp. 927-928](https://archive.org/details/warofrebellion02secrrich/page/n946/mode/1up)).

The June 1 General Orders 24 is the strongest read statewide **identity** list. It names these 18 as already formed and in the field or garrison:

| June 1 number | Commander as printed | June 1 number | Commander as printed |
|---|---|---|---|
| 1 | P. T. Moore | 10 | Arthur C. Cummings |
| 2 | J. W. Allen | 11 | Samuel Garland, Jr. |
| 3 | R. A. Pryor | 12 | D. A. Weisiger |
| 4 | James T. Preston | 13 | A. P. Hill |
| 5 | Kenton Harper | 14 | J. G. Hodges |
| 6 | William Mahone | 15 | T. P. August |
| 7 | James L. Kemper | 16 | Charles A. Crump |
| 8 | Eppa Hunton | 17 | M. D. Corse |
| 9 | George W. Richardson | 18 | R. E. Withers |

The same order lists 19-36 as future designations. It is not evidence that all 36 were already formed on June 1 or that their later organization/numbering stayed identical. The register retains the proposed commanders separately, including Gilham 20, Jackson 21 and Radford 30; it does not silently turn these into later same-number infantry regiments ([OR I-LI.2 p. 123](https://archive.org/details/warofrebellion512unit/page/n130/mode/1up), text and image read). No individual original muster roll or June 17 regimental headcount was read for these 36 rows. Where another own-force report was read, it is separate below.

### The six local model entries and the overlap

**[M]** S84's lots preserve six Virginia origins: Norfolk, Richmond, Harpers Ferry, Garland at Manassas, Preston at Manassas, and the Peninsula. On July 31 five remain unknown; Garland has 351 after the separately documented 490 and net 139 reduction. These six origins are not six full armies and do not exhaust the statewide claim.

| Existing lot / group | Read membership or return evidence | Crosswalk limit [I] |
|---|---|---|
| Garland | Lee calls his existing force a four-company battalion, to grow as companies arrive; Cocke reports Garland 490, arriving the preceding Sunday, in his May 14 own-force report (OR I-II pp. 826,841). June 1 names Garland as Eleventh (I-LI.2 p. 123). | A predecessor relationship is supported. The original 490 is already represented. The enlarged regiment cannot be added whole beside it; later additions need their own dated records. |
| Preston | The same May 10 order names seven companies and intended growth (OR I-II p. 826); June 1 proposes Robert T. Preston's Twenty-eighth (I-LI.2 p. 123). | Named predecessor candidate, not a proved company-level lineage. Seven companies do not establish their men, and the later full regiment cannot quantify the original lot. |
| Harpers Ferry | June 30 return names 2nd, 4th, 5th, 10th, 13th, 27th and 33rd Virginia infantry and 1st Virginia cavalry, alongside other States and named batteries (OR I-II p. 470). | Later command membership is evidence for comparison with S64, not original April-cohort membership or a June 17 total. Battery names in that mixed command are not by themselves proof of State origin. |
| Peninsula / Richmond | August's Virginia regiment is ordered to Magruder with De Russy's Louisiana and Hill's North Carolina regiments on May 21 (OR I-II p. 865); June 1 names August's Fifteenth (I-LI.2 p. 123). | Movement across two local scopes cannot create two populations. Yorktown/department totals mix States and detachments. |
| Norfolk / Richmond / other local areas | Garnett's May 30 list explicitly gives conjectured 7,000 Norfolk, 5,500 Richmond including Ashland and Confederate troops, 3,500 Williamsburg/Yorktown, and separate entries for Jamestown, Gloucester, Fredericksburg, western locations and rendezvous (OR I-II p. 895). | The 14 entries total the source's 36,200 estimates [I]; they are not an individual regiment roster. Missing geographical entries in S84 do not authorize duplicating troops passing through Richmond/Lynchburg. |

Cocke's May 14 own-force report is preserved by company: Payne 76, Green 57, Hamilton about 60, two unnamed Irish companies 54/58, Marr's Warrenton Riflemen 88, Garland 490, and Kemper's two-gun artillery detachment without a separate manpower figure. His approximate 830 and 918 totals remain as reported; no arithmetic residual is assigned to the artillery. These companies must not all be packed into Garland's 490 (OR I-II p. 841). His May 15 discussion also describes authorized future recruitment, not already raised regiments (p. 847).

This explains the missing crosswalk's shape: there are formed numbered regiments, local unnumbered components, subsequent growth, western/coastal forces outside the six local origins, and incomplete returns. It does not prove a residual of 40,000 minus 490 new men. The later September 30 report itself warns about incomplete returns and unclassifiable Virginia independent-company rolls (OR IV-I p. 626); its later roster cannot fill June 17 by backdating.

**Proposed ruling [I].** Retain the statewide claim as context and the six existing origins. Use the dated identity observations to research components and growth within those origins; require new identities and own returns for genuinely unrepresented forces. Keep the full June 17 allocation and individual strengths held. Reject adding 40,000 beside the local lots, numbering 36 formed regiments from a future list, converting arms into present men, or dividing a command total among nominal regiments.

## 2. Louisiana: the dated service events contradict historical non-raising

**[M]** S84 retains six Louisiana calls: March 9 immediate, April 8/16 readiness, April 22 absolute, June 29 extra and June 30 reserve. Each addressee response is `object`, and none creates a levy. The model ends with only 520 known men at `fb_st_la_forts_jackson_st_philip`. Readiness is not an active muster. These are model outcomes, not evidence that Moore historically supplied no troops.

Grivot's November 22 official report, which S75 used, supplies the following **retrospective own-unit service observations**. It is not an original company-roll inspection:

| Volunteer regiment | Recorded event | Citation |
|---|---|---|
| First / Blanchard | Organized April 25; transferred April 29 | OR IV-I pp. 748-749 |
| Second / De Russy | Mustered May 11 | p. 749 |
| Third / Hebert | Mustered May 11; ordered Arkansas | p. 749 |
| Fourth / Barrow | Accepted for twelve months; transferred May 25 | pp. 749-750 |
| Fifth / Hunt | Mustered May 25, as printed | p. 750 |
| Sixth / Seymour | Mustered June 4 | p. 750 |
| Seventh / Hays | Mustered June 5 | p. 750 |
| Eighth / Kelly | Mustered June 15 | p. 750 |
| Ninth / Taylor | Mustered July 6 | p. 750 |
| Tenth / Marigny | Mustered July 22 | p. 750 |

Kelly's June 12 **acceptance for the war**, with instructions to muster and proceed to Lynchburg, is independently explicit. Joining that named regiment to the Eighth is [I] supported by Grivot's commander and muster date; acceptance June 12 and muster June 15 remain separate ([OR I-LI.2 p. 138](https://archive.org/details/warofrebellion512unit/page/n145/mode/1up); IV-I p. 750). S75's held Sixth/Seventh original contracts are not settled by this work.

The reported historical disruption differs from six blanket refusals. Grivot prints the earlier requisitions and proclamations, including 3000 received April 18 and an additional 5000 received April 21, while retaining a proclamation dated April 17 (pp. 747-748). His May 15 order addresses the Confederate refusal of further twelve-month troops. He describes disbanding after the May 25 deadline and a late May 26 reversal which did not reach many companies in time. The same report nevertheless dates the Fifth's muster May 25. That sequence conflict is retained; an original roll/dispatch is required to resolve it, rather than silently moving the muster (pp. 749-750; both images inspected).

Additional overlaps and limits matter:

- The two State regular regiments transferred under the March 13 ordinance are distinct from later volunteer calls. Regular infantry was incomplete when transferred. Five volunteer companies serving with it at Warrington were relieved in June and formed Dreux's battalion for Yorktown; the parent and those companies cannot both count them for the same date (OR IV-I p. 747).
- Wheat's five-company special battalion was accepted and mustered June 6 (p. 751, image). It is a candidate for the existing `la_1_special_infantry` identity [I]. No November battalion figure is backdated.
- Moore's July 11 report puts the Ninth's departures on that day and the 13th and gives an approximate 10,000 for the Virginia-directed regiments/battalions, explicitly excluding Pensacola infantry, fort artillery and the coast regiment. He also reports independently accepted troops and Tochman's brigade. These are overlapping group observations, not 10,000 extra men beside the listed units (pp. 444-445).
- The Polish Brigade is the later Fourteenth/Fifteenth [I]. Grivot explicitly has no State muster/transfer records for it; a direct Confederate acceptance path needs its own records rather than another governor levy (pp. 445,751).
- Moore's July 23 letter reports the Third previously at Fort Smith and short of shoes; that is a location/supply observation, not a headcount. Grivot's same-day Eleventh is **organizing**, with three twelve-month companies already mustered. Its eventual regimental muster is August 18; Twelfth August 13; Thirteenth transfer September 9 (pp. 495-496,750-751). They cannot be made July regimental musters from the companies' earlier service.
- The November recapitulation is 19,152 State-transferred, 20,202 State-organized including Camp Lewis, plus an approximate 3375 independent troops, yielding 23,577. It includes later units and the detailed company document is omitted. The scan corrects misleading OCR totals; it is not a July return and cannot allocate men per regiment (pp. 751-752, images).

**Proposed ruling [I].** Preserve the six modeled responses as observations, while routing the dated Louisiana acceptances, transfers and original unit returns for later apply research. Keep direct acceptances distinct from governor requisitions, and carve regular/battalion components out of existing parents before additions. Reject a blanket willingness adjustment, a uniform 1000 per regiment, applying 23,577 in July, or treating the Eleventh as fully mustered on July 23.

## 3. The later pairs and Georgia's State brigade

Walker excludes two recently called regiments each from Mississippi, Alabama, South Carolina, Texas, Arkansas and Tennessee, and separately excludes the reserve corps (OR IV-I p. 496). That passage gives no individual call dates or regiment names. Alabama and Mississippi already have extra pairs in S84 and are not new additions here.

| Case | Dated record and identities | Overlap and remaining hold [I] |
|---|---|---|
| South Carolina | Pickens's July 15 reply names **Gregg and Orr** for the two war-term regiments (IV-I pp. 479-480). The September roster separates Gregg's First and Orr's First Rifles (p. 629, image). | Exact original issue date and contract continuity are held. A July 10 order sends Second/Secrest and Sixth/Blanding **in addition** to two requested earlier (I-LI.2 p. 159); these pairs must not be collapsed. The existing Gregg catalogue row describes June 20; shared commander/name does not establish a fresh uninterrupted war-term cohort. No discharge/re-enlistment date is asserted from unread rolls. |
| Texas | Cooper's **June 12** call is for 20 war-term infantry companies, to become regiments only after arrival; officers and muster procedure are specified (I-IV pp. 91-92). | Candidate for the report's pair, not an explicit cross-reference. Debray on August 28 reports 16 companies marching, first column at Niblett's Bluff August 16, and six of the original 20 taken out with Greer before replacements (pp. 98-100). Fourth/Fifth are later numbering candidates from IV-I p. 630, not a proved company join or July muster. June 30 reserve 2000, Sibley's July 8 mounted brigade and July 25 northern mounted call are different scopes (I-IV pp. 93-94,98-99). |
| Arkansas | The July 24 report establishes an excluded call, **but its exact issue date and named pair were not found**. July 15 transfer names seven infantry regiments: Cleburne, Gratiot, two attached to Pearce, Cross, Lyon and Shaver, plus separately listed mounted/artillery components (I-III pp. 609-610). | Seven unnamed infantry lots already represent that aggregate. June 21/22 tender/acceptance and May 25's inquiry about two already organized regiments do not identify a new pair (pp. 584-585,595,597). No pair is selected by subtraction, commander memory or same-State resemblance. Original requisition, replies and individual musters remain required. |
| Tennessee | **July 22** Walker asks for two more beyond Anderson's first three. Anderson names **Fulton and Savage** at Bristol July 25; Walker orders them to Lynchburg that day (I-LI.2 pp. 190,197-198). September roster identifies **Eighth/Fulton and Sixteenth/Savage** (IV-I p. 629, image). | A strong transfer-pair join; exact linkage to Walker's July 24 enumeration remains held. The earlier July 9/11 East Tennessee two-regiment movement order is distinct (I-IV p. 366). July 23 raises the requested number again (I-LI.2 p. 195). These are existing State forces, with broad overlap against the modeled 22 infantry regiments (IV-I p. 417); no new 2000. |

Tennessee's initial three under Anderson are Hatton, Maney and Forbes in his July 24 report (OR I-LI.2 p. 197). The September roster supplies Seventh/Hatton, First/Maney and Fourteenth/Forbes [I], while explicitly listing **Turney's Provisional First separately from Maney's First** (IV-I p. 629). The frozen `tn_1_infantry` observation is therefore not authority to merge Maney into Turney. A numbered component/aggregate crosswalk remains necessary even where the transfer identity is strong.

### Georgia is a brigade tender, a separate extra pair, and later component service

Brown reports Phillips's brigade in camp June 18. His June 28 detailed tender describes two infantry regiments and three battalions: rifles, four-company artillery and four-company cavalry (OR IV-I pp. 393,408-409). The July 1 extra-two requisition is separate from the June 30 reserve call (p. 416). Brown's July 8 offer conditions the brigade settlement on its command/organization, promising two other regiments; July 15 he says two **new** regiments are in camp at Confederate disposal, and offers the entire brigade's 2,500 instead of 1500 in its two regiments (pp. 424,477-478). That proposal is not evidence of acceptance or five newly completed regiments.

Folsom's contemporary 1864 unit accounts provide the names/dates missing from those letters:

- Later **Eighteenth**, W. T. Wofford: formed April 22 as First Regiment, Fourth Brigade, State Troops; left Camp McDonald August 2 and reached Richmond August 7 (pp. 13-14, images).
- Later **Nineteenth**, W. W. Boyd: State muster June 11 as Second Regiment, Fourth Brigade; the account dates brigade disbanding and Confederate transfer to August 2 (pp. 33-34, images).
- **Phillips's Legion**: William Phillips, ten companies of infantry/cavalry, a stated June 11 muster and training at Camp McDonald (p. 107, image). That passage does not label the muster as State or Confederate; it cannot date Confederate acceptance June 11. Continuity with the earlier rifle/cavalry battalions is a candidate [I], not proof of every company's membership or the artillery's successor.

Folsom is a wartime celebratory compilation, with its own warning about missing Nineteenth regimental books (p. 33). This note uses the named service observations and retains their limits; it adopts none of the book's valor judgments or reconstructed casualty totals. Its August dates are not July field availability. The frozen catalogue has no named Eighteenth/Nineteenth/Phillips entries, but nine generic Georgian regiment lots and an unknown cavalry supplement already exist [M]. Absence of the names is not proof of nine entirely different populations.

**Proposed ruling [I].** Treat Tennessee's later pair as transfers to investigate within its continuing State-force identities; retain the First-regiment distinction. Retain Georgia's State brigade identity and separate extra requisition, with its State/Confederate dates and component joins. Continue the precise South Carolina/Texas call joins and Arkansas's original call as holds. Reject four automatic pairs of 2000, recutting generic lots by name alone, counting brigade plus components, backdating August transfers to July, or forcing historical concentration from later rosters.

## Verification before commit

The research audit checks source hashes, locator closure, snapshot keys, dated observations, nonduplication dispositions and preservation. It does not replace historical review. The completed packet has 75 read locators, including 11 inspected page images, and seven upstream source hashes. All 1825 starting tracked paths remain byte-identical; no pack or runtime input changed. Typecheck, boundary and the opening test (9/9) passed before the long run.

One normal eight-seed done check with drafting completed: **exit 0, 1381.166 seconds; Phase 0 6/6; supplemental 1A 2/6**. All ten problems are exact to S76. The 268 daily hashes and both saved summaries are byte-identical to S76. This checkout's older runtime reports 20,957 known Confederate men and no fought history operation; it is not the frozen S82 July reference used for the research comparison, and does not revise S84's 86,894. Unknown-strength's pass here includes zero Union-pack battles and supplies no July combat clearance. Local shared-Windows war/history medians 33.85/34.77 ms do not certify S85's CI gate. The CLI ignored the unsupported `--out` option, so results remain in the default fresh `runs/done-check/` directories identified in [the verification receipt](S86/verification.json); the campaign was not repeated.

The actual unchanged pre-commit hook is the remaining commit gate. This note/handover records the pre-hook evidence; the sole CODEX status will record the actual commit and hook outcome. Full logs, exits, inventories, comparison and recovery stay in `runs/s86/`. No accepted decision, signature or main-integration clearance is claimed.

## For the lead

1. Retain the qualified Virginia identity/area crosswalk; the exact June 17 unit sum and individual strengths are **not resolved**. Require original regiment/company records and dated joins before numerical application.
2. Route Louisiana's dated service observations and direct acceptance as distinct from blanket objections. Preserve the Fifth's date conflict and all original-roll/headcount and later-unit holds.
3. Retain the Tennessee transfer identities and Georgia State-service identities as bounded proposals, with all overlap limits. Arkansas's exact later call/pair is **not resolved**; South Carolina/Texas exact call-to-component joins are not cleared. No pack application or floor waiver is authorized by this note.

## Findings outside my scope

S83 integration, S85 performance, S87 measurement, code/pack application, new calibration, whole-branch/gate acceptance, controlled timing, main integration, release and pushing. No signature or acceptance decision is supplied. The unresolved S86 research items remain named above rather than being moved outside the request.
