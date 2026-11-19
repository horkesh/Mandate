# Lane 1.11: the situations of March to July 1861 (hand-over)

Branch `phase1-situations`. This note is kept current until the lane closes. The catalogue is `docs/design/SITUATIONS-1861-62.md`, and the facts come from `docs/research/2026-11-14-secession-winter-1861.md` (cited as NOTE-secession-winter-1861).

Main merged at `364aba0` on 2026-11-19, by R46; working files resolved and checked, with staging and the merge commit left to the lead.

The lead committed that merge as `95cdecd`; R47 started there on 2026-11-19. R47 uses git only to read and leaves its changes uncommitted.

## What runs

The Union reference run is 148 days (5 March to 31 July 1861) and has no `--at-war` flag: each side's war flag is set by that side's own decision (0066).

The opening runs in this order:
1. S01's relief order opens Fox's expedition command as a temporary post (0040).
2. The Confederate seat's labelled railroad (`confederate_opening`) reduces the fort.
3. S09's call goes out to every governor, including those on no side.

Each state's act fires a pack-set delay after the call reaches its governor (`callReceived`), labelled STAND-IN until conventions exist (1B).

| Catalogue | File | Status |
|---|---|---|
| S01 | `sumter_garrison` | live |
| S02 | `pickens_reinforcement` | live; its landing rides on S06's Navy Department order (below), the one Captain Adams obeyed |
| S03 | `confederate_commissioners` | live |
| S06 | `pickens_refused` | live; on its labelled date, a STAND-IN owned by 1B (sea carriage). The courier and department orders land Vogdes's company (90 men) from the Brooklyn at Fort Pickens through the `landing` effect (lane 1.4b's detachment path), on the decision day rather than 12 April, and set `pickens_landed` |
| S07 | `seward_memorandum` | live; raised by the Secretary of State's initiative (lane 1.5), which he takes in the reference run now that lane 1.11a entered his values |
| S09 | `call_for_troops` | live; calls at the OR III-1 p. 69 quotas; enters the call on lane 1.6's ledger, and the militia call summons `congress_37_1` |
| S10 | `blockade_or_closure` | live |
| S12 | `washington_cut_off` | live; reads the closure flag set by `baltimore_route_closed` |
| S13 | `black_volunteer_offers` | signed; the lead's final 1A placement: a notice with no options or effects, Dodson's offer (OR III-1 p. 107) and Cameron's reply (p. 133) quoted; the decision goes to 1B with R2 |
| S14 | `missouri_arsenal` | live; `back_harney` and `back_lyon` |
| S15 | `western_virginia` | live; separate military/government groups. R47 replaces the recognition clock with receipt of the ordinance report and Cameron's 25 June letter, and proposes `department_side` for `st_virginia_restored`. R55 promotes the ungated ordinance; the combined history default now takes both groups after the reports arrive. |
| S20 | `special_session` | live; fires when the House sits (lane 1.6's chamber condition); `ask_war_footing` appears while the spring's acts are before Congress and answers them on the ledger |
| S11 | `gosport_yard` | live; raised by Virginia's secession notice; `defend` and `remove` (Welles's orders of 10 to 16 April). The order to hold the yard is a flag only: a navy yard is not a field post, so the goal path refuses it (`not_field_post`) until installations have holders who take orders (1B). `destroy_rest` has no advocate: the commandant burned the yard on his own (the inaction). |
| S17 | `fort_monroe_arrivals` | signed and live, with its three `fugitive-policy` rows (signed in `gated-rows.test.ts`). `approve_holding` (Cameron) and `return` (labelled plainly; proposed on a basis in the 1850 law and Major Cary's demand, the recorded exception; watched; floored; expires with the confiscation act); inaction is `commanders_decide`, floored. The men's escape is two notices from one cause: Butler's refusal prints only while the Fort Monroe command's holder carries `holds_fugitives`. Butler's command (`us_dept_virginia`) opens on 22 May by a STAND-IN notice, `butler_at_fort_monroe`, owned by lane 1.12: its Part B replaces it with the rule-seat Lincoln's appointment on the sourced date, so only the history run puts Butler there and a player appoints in his own game. Townsend's (OR II-1 p. 760) and Bates's (p. 761) letters are standalone dated reports in July; a recurrence of S17 goes to 1B (the First Confiscation Act). The NPS caution that the three names rest on later attribution goes to lane 1.10's list. |
| S18 | `merryman_writ` | signed and live, the event facet. `merryman_answer` remains a draft until Taney's row reaches main. The preceding `habeas_on_the_line` remains signed and byte-identical. R47 supplies the CLI desk's neutral rendering and architecture tests; its condition for showing this item there is met. Patterson's, Thomson's and Judge Nelson's reports remain unchanged. |
| S16 | `kentucky_neutrality` | live, stage A only (stage B, Magoffin's protest of 19 August, falls after the window); `arm_quietly` (Cameron's department), `move_in` (Dennison, Yates), `wait` (Scott, McClellan) |
| S21 | `mcdowell_advance` | live; `advance_now` (the Blairs, as Weed's letter of 26 July names them: retrospective) and `drill_first` (McDowell); flags only, since McDowell and Patterson hold no posts in the March start |
| S05 | `lamon_promise` | live; Pickens's telegram of 30 March (a labelled railroad); `assure_notice` (Seward's note of 1 April, OR I-53 pp. 162 to 163); Lamon's words from OR I-1 p. 282 |
| S08 | `virginia_unionists` | live; the Unionist's visit of 4 April (a labelled railroad); `offer_fort` is Seward's course as Fox's own memo records it (FOX-CC vol. 1 p. 38), and the inaction is Baldwin's sworn account (JCR Part II pp. 102 to 105); the accounts conflict, and the history default follows Fox and Botts. The vote is 89 to 45 (the convention's journal) |
| S04 | none | its options have no adviser on record (lane 1.11r); the rumour wave belongs to lane 1.6's press, not a situation |
| S19 | none | goes to 1B: the board reported on 5, 16 and 26 July, but its plan was adopted only by Welles's order of 3 August, so nothing in it yields a decision before 31 July |

Notices:
- **Live:**
  - R47/R55: `wheeling_convention` (11 June), `wheeling_ordinance` (19 June), `pierpont_elected` (20 June), `wheeling_recognition_letter` (25 June), `wheeling_legislature` (1 July). R55 also promotes `houston_confederate_obligations` (13 March) and `texas_governor_changed` (16 March), with command's occupied-post succession effect. All seven are ungated under the reviewer's content ruling.
  - `confederate_opening` (the railroad);
  - `sumter_fired_upon`;
  - `maryland_legislature` (14 days after the call);
  - `kentucky_neutrality_proclaimed` (35 days after);
  - `missouri_provisional_government` (106 days after);
  - `baltimore_route_closed` (4 days after the call reaches Massachusetts).
- **Live and signed by the gate reviewer:**
  - the four secessions (`cause-of-secession`), each a delay after the call reaches its government: Virginia 2 days, Arkansas and Tennessee 21, North Carolina 35;
  - the Indian Territory acts: the posts given up, the Confederate act of 21 May (a hook), the Creek, Choctaw and Chickasaw treaties, and the Cherokee neutrality (0069, 0070, with the reviewer's route notes);
  - `pratt_street_deaths` (`civilian-deaths-1861`, actingSide union) and `mcclellan_proclamation` (`fugitive-policy`, text).
- **Drafts awaiting the gate reviewer:**
  - R47's three drafts are now live, ungated under the R55 verdict; no gate signature was invented for them.
  - `camp_jackson_deaths`: attributed to Frost's protest (OR I-3 p. 7), with no count; the count and a Missouri State Archives source row go to the research list;
  - `black_volunteer_offers`: Dodson's offer only (OR III-1 p. 107); the Boston, Philadelphia and Providence offers and the two refusals rest on an unlicensed mirror and go to the research list.

## Options dropped for want of a sourced advocate (0041; the research pass)

- **S12:** `suspend_on_line` and `force_through`.
- **S13:** `ask_congress` and `refer_governors`. Until the research pass sources them, acceptance through Congress is not open.
- **S14:** `repudiate_agreement`, which also needs the Price and Harney agreement as an event.
- **S15:** `wait`.
- **S20:** `ask_narrow` and the aims option, which `war-aims-1861` refuses unless an adviser argued it that week.

## Kernel added by this lane

- Calls from situation options (`OptionCall`).
- Calls and messages to and from governments on no side (the lead's rulings 1 and 2).
- Temporary posts proposed by effect (`temporary_posts.csv`).
- The `callReceived` condition. Responses now carry the order kind.
- The pruner keeps each post holder's first answer to a call, since lane 1.4's pruning would otherwise drop it before the longest delay.

## The post-holder check (the lead's rule 7)

A notice that quotes a named man, or gives an act of his as holder of a post, declares him in `speakers` (the post he must hold, or null for serving); the kernel fires it only while every speaker holds. One that only names a man says why in `namedOnly`. The validator refuses a notice naming a World person with neither, skipping places named for men. `packages/cli/test/post-holder-check.test.ts` tests both ways.

## Calls go only to a state government (the lead's ruling)

A call may go to a governor of the calling side or of a neutral state government, never to the other side's, and never to a people who govern themselves (0069, 0070). The validator refuses it (`self-governing-call`), and the kernel's call path refuses it as `not_raising_post`; `packs/union-1861/test/nation-calls.test.ts` is the control.

## Effects reported, not applied (owners not built)

None at present: S13's decision, which carried a locked cost on the radicals bloc, is held.

## STAND-INs to retire

| Item | Stand-in cause | Retired by |
|---|---|---|
| Each `callReceived` delay | delay after the call reaches the governor | conventions and legislatures (1B) |
| Baltimore | 4 days after the call reaches Massachusetts | rail through a hostile city (1B) |
| Camp Jackson | 24 days after the call reaches Missouri's governor | the arsenal commander's seat conduct |
| S14 | 8 days after the call reaches Missouri's governor | the arsenal as an installation (1B) |
| S20 | day 121, the date the proclamation set | the proclamation's own term (1.6) |

## Where R47 stopped (2026-11-19; superseded by the R55 close-out below)

**Done and signed (live in the reference run):** S01, S02 (the Pickens landing through S06), S03, S05, S06, S07, S08, S09, S10, S11, S12, S13 (the offers as a notice), S14, S15, S16 stage A, S17 (with its three signed fugitive-policy rows), S20, S21; the four secessions; the Indian Territory acts; the Pratt Street and Camp Jackson deaths; McClellan's proclamation; the escape notices and the July reports for S17; habeas_on_the_line (S12's suspension); merryman_writ (S18's event); the Patterson, Thomson and Judge Nelson reports. reduce_sumter orders the Charleston command to take the fort (lane 1.12's bombardment hook).

**Drafted and waiting:**
- merryman_answer (S18's decision), in situations/drafts/: comply (Taney's words, Taney's Reports pp. 269 to 270, proposedBy taney_roger_b, speaker while serving); the inaction is the historical course, with the suspension's costs; no ask-Congress option; no staff line, a typed absence citing NOTE-1861-leads. Waits on taney_roger_b reaching main (branch phase1-taney-1861, d50e533); then move it into situations/, take 1.11r3's TANEY-REPORTS row and citation form on the merge, and send it to the gate reviewer.
- The Restored Government's data is authored by R47: department, declared regions, the four requested civic notices and Cameron's recognition letter. The 19 June ordinance remains a gate draft. Recognition uses received reports, never its old clock. While the draft is excluded the combined historical default takes neither group; `command.government_established` remains QUIET in the live reference. This is an acceptance gap, not a claim that the government was unestablished historically.
- The CLI desk's neutral rendering and architecture tests are done in R47. A typed absence projects only `no-adviser-on-record`, without its research citations, and prints "No recommendation from the staff". A plain-report author is no longer presented as a staff adviser. Provenance objects are opaque to rendering. The signing condition for showing `habeas_on_the_line` at this CLI desk is met; its signed JSON was not edited.
- S04: not a situation; recommended to lane 1.6's press (no adviser on record for its options).

**Rulings, as built:**
- principal-initiative (the lead's (b) on S12, with the gate reviewer's three conditions): accepted only on an option of a gated decision, the side's principal as author, dated on or before the situation's earliest date; no staff line, told by a plain report (B9). Built, tested, signed on habeas_on_the_line.
- The typed staff absence (the lead's (b) on S18): built and tested (staffAbsence { none, cites }). Open: whether habeas_on_the_line should also carry one, for a uniform rule; that changes its hash and needs re-signing, so it would go in S18's sign-off batch.

**Waiting on other lanes:** Taney's row on main before promoting `merryman_answer`; the gate review of R47's drafts; a command-owned existing-post succession and a fact-only way to honour Houston's documented refusal; lane 1.12's bombardment stage (it removes its own dated Sumter row once it reads reduce_sumter's order). Gone to 1B: S13's decision, S17's recurrence, S19, S16 stage B (August). R48 and R49 worktrees were not written.

## R47: sources, data and remaining limits

**Sources actually read:** lane 1.11r3's W1 and G1, and the original works' OCR passages: Lewis, *How West Virginia Was Made*, pp. 79-80, 140, 145; Wheeling Convention *Journal* (1861), p. 3 and pp. 27-28; the 1866 *Ordinances and Acts*, Ordinances pp. 6-7, Acts title page and reprint resolution p. 2; OR I-2 pp. 723-724; Texas Convention *Journal*, pp. 113-114, 178-187 and 197; OR I-1 pp. 612-613. Original text downloads and hashes, and the R44 original-source transcription excerpts reused for Lewis and OR I-2, are identified in `runs/r47/`. This is transcription verification, not new page-image verification. No fact is taken from G1's rejected claim that Clark served through 1863. Birth/death dates and judgments for Houston and Clark remain unknown.

### The 35 counties and the pack's regions

Lewis pp. 79-80 print 32 roll headings naming 35 counties. The ordinance itself claims Virginia and gives no county list. [I] The declaration uses all eight intersecting **whole pack regions**, an administrative approximation; it neither describes a sovereignty boundary nor changes military control. `runs/r47/county-mapping.json` verifies all 35 names, with no duplicate or unmatched county.

| Pack region | Counties named on the roll | Other counties in that whole region |
|---|---|---|
| `northern_virginia` | Alexandria, Fairfax | none |
| `harpers_ferry` | Jefferson | none |
| `wheeling` | Ohio, Marshall, Brooke, Hancock, Wetzel, Tyler | none |
| `grafton` | Taylor, Marion, Monongalia, Preston, Harrison, Barbour | none |
| `parkersburg` | Wood, Ritchie, Pleasants, Wirt, Doddridge, Gilmer, Jackson, Roane | Calhoun |
| `kanawha` | Kanawha, Putnam, Mason, Cabell, Wayne | Clay, Logan, Boone |
| `wv_central` | Randolph, Tucker, Upshur, Lewis, Webster | Braxton, Pocahontas |
| `potomac_highlands` | Hampshire, Hardy | Pendleton |

The last four rows are split by the roll. The eight whole regions contain 42 county entries; **the seven additional entries are not seven additional roll counties**. Lewis p. 80's note says Moore represented Webster and **parts** of Nicholas and Braxton. Nicholas lies in `wv_south`, which is not added: neither those part-county boundaries nor the other counties of that region are established by this roll. Cabell remains in the roll mapping while Lewis's note records Laidley's later removal. No claim of a single day’s exact membership or enforceable jurisdiction is made.

### Texas

`houston_samuel` and `clark_edward` entered as facts-only rows in R47. R55 adds only Houston's Union value and low regard toward Davis, from his dated 1860 letter below; other judgments and both personal blocs remain held. Houston holds `st_gov_texas` at setup (Texas Journal pp. 113-114; OR I-1 pp. 612-613). The refusal of Confederate obligations is documented in the 13 March Cave letter (OR I-1 pp. 612-613). The Convention's 16 March proceedings declare the office vacant and treat Clark as Governor that evening (Texas Journal pp. 183-187); a separate gubernatorial oath time is not asserted. R55 implements that succession.

**[I] Compatibility ruling built:** Houston's `faction` follows the existing Texas department's service side while he holds its office (0065). This is not a judgment of allegiance or acceptance of Confederate obligations. Leaving it null made the opening day's subordinate strength return throw `RangeError: houston_samuel has no side` through `sendReport`; the retained one-day red/green test establishes the cause. His eventual unposted side requires the succession owner. No corresponding service-side fact is assigned to unposted Clark.

**At the R47 hand-off:** situation effects could not replace an occupied existing post. That gap is resolved by R55's `post_succession` proposal below. A recorded historical refusal is still not a rating: the new sourced judgments do not force the recorded refusal.

The unmodified 148-day reference issues **no Texas call** on this branch. A separate, explicitly controlled probe issues Davis's call on day 1; it reaches Houston on day 10, without rejection. He actually complies with reservations, declares compliance and prepares two regiments (2,000 men). This **does not reproduce the documented refusal**. `texas-call-probe.json` retains every contributing term. Do not call either the refusal or succession complete, and do not attribute the injected call to the unmodified history run.

### Proposed rulings for the lead and reviewer

1. [I] Accept the eight-region administrative approximation with the four split regions and Moore's partial district disclosed. Rejected: silently treating all 42 county entries as credentialed, inventing fractional boundaries, or enlarging the graph in this request.
2. [I] Accept Houston's office-service compatibility tag while keeping his bloc and judgments blank; his own refusal still needs an authorised fact-only mechanism. Rejected: a blank service side that crashes the opening, or invented traits/values that force a historical answer.
3. [I] Review the ordinance and Texas allegiance/succession drafts conservatively under `cause-of-secession` / event. No signature was written. Rejected: removing their gate tags merely to make the history assertion pass. The ordinary convention, election, legislature and correspondence notices contain no secession-cause claim, slavery policy, security order or protected-population effect.
4. [I] Recommend a typed staff absence on `habeas_on_the_line` too, for a uniform explicit signal whenever there is no staff recommendation. This is **a recommendation only**: adding it changes the signed content hash and requires the gate reviewer to sign again. Rejected: having a presenter infer a message from `proposedBy.basis`, or editing a signed item within R47.

### Reference evidence and checks

`runs/r47/history-audit.json` compares the final reference with the retained R46 reference: both start on 5 March, no `--at-war`, and reach day 148 / 31 July. Current final hash is `7dd5bbd3648b50c7da31395f459ae66cfaf7cec595e4072ecee2e5e7cb5413a1`; no command is rejected. No band definition was edited and all 150 existing reference mechanics pass their bands. Every changed count or magnitude is below (fires / magnitude where they differ):

| Mechanic | R46 | R47 | Cause |
|---|---:|---:|---|
| `knowledge.pruned_age` | 91 / 1195 | 91 / 1198 | additional dated reports |
| `knowledge.pruned_superseded` | 146 / 10841 | 146 / 10896 | the newly occupied Texas office's report traffic |
| `messages.courier_delay` | 61 | 93 | Texas office and civic-report routes |
| `messages.delivered` | 12421 | 12482 | additional office and civic reports |
| `messages.mail_delay` | 2776 | 2788 | added report traffic |
| `messages.sent` | 13073 | 13137 | added office/civic reports, partly offset by S15 waiting |
| `situations.decided` | 19 | 18 | S15 now waits for the withheld ordinance report |
| `situations.fired` | 46 | 49 | four civic notices added; S15 no longer raises its dependent McClellan proclamation |
| `situations.notice_reports` | 28 | 31 | four civic reports added; the dependent proclamation is absent |
| `situations.noticed` | 27 | 30 | four civic notices added; the dependent proclamation is absent |
| `situations.options_changed` | 4 | 3 | recognition no longer appears on a clock |
| `situations.surfaced` | 46 | 49 | four civic notices added; the dependent proclamation is absent |

The traffic explanations are causal readings [I] of the data changes and retained per-day evidence, not historical measurements. No combat, movement, control, recruitment or other liveness row changed. The government establishment remains withheld, so no new region is governed by it in this live run.

Required `MANDATE_NO_GIT=1 npm run check`: **exit 1**, 105 files, **1269 passed / 2 failed / 3 skipped** (1274 collected). One failure was the old neutral-government inventory overlooking an inactive declared government; its corrected full pack file passes **19/19**. The other remains at `packages/cli/test/union-opening.test.ts:91`: it expects both S15 choices, while the gate draft is withheld. That test is outside R47's package-edit scope and was not weakened. Full-suite evidence for unaffected tests is reused; there is no second expensive suite run claiming away this residual. Typecheck, boundary, licences, decision index and generated-pack freshness pass separately.

Required `npm run run:done-check -- --label r47-done`: **exit 0, all six criteria pass**, replay and save/resume agree, Union median/p95 **35.10/70.48 ms**. Its Union final hash matches the detailed history audit. These Phase 0 criteria do not waive the outstanding S15 assertion, the gate review, or Texas's incorrect refusal/succession behaviour. Logs, inventory, source hashes, focused red/green evidence and preservation checks are in `runs/r47/`.

## R55 close-out (2026-11-19)

R55 only, in the existing `phase1-situations` worktree at `95cdecd`, retaining R47 and the lead's App.tsx correction. Git was read-only. Evidence is under `runs/r55/`; no server was started. The separate gate note was read and never written. Independent standing review remains with the lead.

### Gate and presentation

The reviewer ruled the three institutional notices ungated on their content. `wheeling_ordinance`, `houston_confederate_obligations` and `texas_governor_changed` are now live, with the exact `gate.none` sentences requested, without signatures. Their player strings are unchanged. The Texas succession notice now proposes the authorised command effect. S15's recognition becomes available from the received ordinance and Cameron letter; `union-opening.test.ts:91` passes unchanged.

`habeas_on_the_line` has exactly the supplied decision-level `staffAbsence`, including the research limits. Its replacement note was copied verbatim from the gate reviewer, all questions remain v1, and the pack's own `loadPack` and `gateContentHash` confirm **`4cb7024226f63f8a6a7fab91dce3fa518b9ea2d0bc001dfba2b9b2564cd71d3e`**. Apart from this field and its authorised replacement review, the item is unchanged; its strings and citations are preserved. No other gate sign-off was authored.

The browser shows **"No recommendation from the staff"** once for the decision. The lead's array guard remains. The added browser test renders an opaque proposal object whose property reads throw, and forbids `basis`, `cites` and basis-literal inspection in App.tsx, as the CLI architecture test does. It covers both the declared and absent staff line, plus an ordinary named adviser. The browser's neutral-rendering condition is met for this presenter; no other presenter is qualified by this result.

### Texas: succession, evidence and the call

A situation proposes `command.post_succession`, with the existing post as `subject` and a typed `succession: {from, to}` payload. Command accepts it only from a notice, at delta +1 with no side measure, while the named incumbent holds. The existing appointment guards require a serving successor on the office's side who holds no other post. The two holder writes are atomic, both persons' statuses are preserved, a different incumbent causes a typed refusal, and a repeat is a no-op. The tick reports `post_succeeded` with `from`, `to`, the typed `institutional-succession` reason and the pack's cause. There is no player succession verb, new State field or new kernel default. FOUNDATION section 10 records the existing owner's additional input; no OWNED_FIELDS addition is needed.

Clark holds `st_gov_texas` from day 11 / **16 March 1861**, in the 13-day integration test and every later day of the 148-day reference. Houston is no longer a current command card's holder. Governors are not field-command cards in today's browser; old dated reports remain historical reports, not a current appointment list.

Sources read:

- **Houston's judgments:** his letter to A. Daly, Austin, **14 August 1860**, printed verbatim in *The Writings of Sam Houston*, VIII, pp. **118-120** ([printed pp. 118](https://archive.texashistorytrust.org/view/728572066/142/), [119](https://archive.texashistorytrust.org/view/728572066/143/), [120](https://archive.texashistorytrust.org/view/728572066/144/)). It opposes Davis's principles and urges constitutional Union. Entered **Union value and low regard toward Davis only [I]**, with a dated primary leg under 0087. No editor's judgment, numeric historical rating, antislavery belief, reputation, temperament or personal bloc is inferred. The short phrase "Constitution and the Union" describes his stated value; opposition to secession must not be mistaken for opposition to slavery.
- **The refusal and succession:** Cave's letter for Houston, **13 March**, OR I-1 pp. **612-613**, read in the retained R47 primary OCR; Convention proceedings of **16 March**, TX-CONV-1861 pp. **183-187**. The refusal remains a dated report guarded by Houston's post holding.
- **Clark before the start:** Crane, *Life and Select Literary Remains of Sam Houston* (**1884**), chapter **XXV**, identifies him as the incumbent Lieutenant Governor before succession ([entry](https://en.wikisource.org/wiki/Life_and_select_literary_remains_of_Sam_Houston_of_Texas/Chapter_25)). The [official Legislative Reference Library office-term entry](https://www.lrl.texas.gov/legeLeaders/leadership/ltGovPage.cfm?ltgovID=7), read directly, gives 21 December 1859 through 16 March 1861. **[I]** His opening service-side tag follows his already-held Texas office under 0055, not his future governorship; that lieutenant-governor post is not separately modelled. The pack registers the expired-copyright period reference for facts only. No modern site prose or images are copied. Two old world inventory assertions now explicitly account for Clark and check the supporting office source; the starting-side rule is unchanged.

The unmodified reference issues **no Texas call**, so no call reaches either Houston or Clark. S09 calls only Union/neutral governors; Texas's government is already Confederate. No Confederate reference decision calls Texas. The separately labelled controlled probe sends Davis's two-regiment, one-year courier call on day 1: it reaches Houston on **day 10 / 15 March** without rejection. His actual answer is now **`slow_walk`**, declared **`comply`**, willingness **-27**; the terms include values +200, regard -180 and disposition -60. It schedules 2,000 men for day 25. This is **not the recorded refusal**, nor a historical requisition. The generic call terms honour `union` for either issuer; no coefficients or further judgments were tuned to force a refusal. **STAND-IN: lane 1.14 owns calibration of this answer.** No sufficiently established pre-5-March judgment by another person was entered; reputation and the remaining judgments stay held.

### Virginia's side: proposed ruling only

The unchanged `virginia_secedes` notice has earliest **17 April**, then proposes `department_side` two days after a call reaches its governor. In this reference it fires on **day 43 / 17 April**, not 23 May. A late call can still delay it: the existing convention-delay stand-in remains.

**[I] Recommend keeping 17 April as the government's operational allegiance date**, with the separate ratification on 23 May stated in historical text. The [17 April ordinance](https://encyclopediavirginia.org/primary-documents/virginia-ordinance-of-secession-april-17-1861/) makes its legal effectiveness conditional on ratification and relates the act back to its date. Actual state military command already operated before ratification: Letcher's **23 April** order puts Lee over the state forces, OR I-2 p. **775** ([primary text](https://ehistory.osu.edu/books/official-records/002/0775)). This distinguishes operational service from a claim of final legal ratification. Rejected: waiting until 23 May and thereby preventing the Army Register's 20 April Magruder and 25 April Lee service changes, or treating a forceful takeover as a change of military control here. No secession item, register date or resignation mechanism was changed in R55.

### Reference evidence, every changed row and band

The Union run starts **5 March**, with **no `--at-war`**, and reaches **31 July / day 148**. Final State hash **`684e3cf3a4d583824ffed694f2ed5fba72512a9d89f61e04d2e06a3f9da9bbc6`** agrees between the retained detailed reference and the final done check. All **151** reference mechanics pass their bands, with no rejected command. The restored government is established on 19 June and subsequently recognised through S15; military control is unchanged by those civil acts. R47's same-configuration reference is the baseline. Counts below are fires / magnitude; traffic explanations marked [I] are causal interpretations, not historical measurements.

| Mechanic | R47 | R55 | Why |
|---|---:|---:|---|
| `command.government_established` | 0 / 0 | 1 / 1 | The promoted 19 June ordinance establishes the declared Restored Government. |
| `command.post_succeeded` | 0 / 0 | 1 / 1 | The 16 March Convention notice replaces Houston with Clark. |
| `command.side_changed` | 9 / 9 | 10 / 10 | S15 now recognises the established Restored Government. |
| `knowledge.pruned_age` | 91 / 1198 | 93 / 1206 | Additional dated notices and the restored S15 path change report ages and pruning days [I]. |
| `knowledge.pruned_superseded` | 146 / 10896 | 146 / 10889 | Succession changes the Texas report author; added civic reports alter the supersession set [I]. |
| `ladder.moved` | 7 / 7 | 10 / 10 | Houston's sourced low regard toward Davis adds three weekly moves; ladder-probe.json isolates all three. |
| `map.recomputed` | 29 / 31 | 31 / 33 | Government establishment and the recognition side change invalidate the derived map. |
| `messages.courier_delay` | 93 / 93 | 94 / 94 | The changed Texas holder and additional notices change routed traffic [I]. |
| `messages.delivered` | 12482 / 12482 | 12483 / 12483 | Net delivered traffic changes with succession and the four additional notices [I]. |
| `messages.mail_delay` | 2788 / 2788 | 2781 / 2781 | The report routes change with the Texas holder and new civic reports [I]. |
| `messages.sent` | 13137 / 13137 | 13138 / 13138 | New notices and the restored S15 path, offset by the changed Texas author's traffic [I]. |
| `situations.decided` | 18 / 18 | 19 / 19 | S15's combined historical default is no longer blocked by the withheld ordinance. |
| `situations.fired` | 49 / 49 | 53 / 53 | Three promoted notices and S15's dependent McClellan proclamation. |
| `situations.notice_reports` | 31 / 31 | 35 / 35 | Three promoted notice reports and the dependent McClellan proclamation. |
| `situations.noticed` | 30 / 30 | 34 / 34 | Three promoted notices and the dependent proclamation. |
| `situations.options_changed` | 3 / 3 | 4 / 4 | The recognition option becomes available after its required reports arrive. |
| `situations.proposals` | 23 / 588 | 26 / 591 | Succession, establishment and S15's recognition each add one proposal. |
| `situations.surfaced` | 49 / 49 | 53 / 53 | Three promoted notices and the dependent proclamation. |

The **five Union band changes**, using the existing `around` policy, are:

| Mechanic | Before (min-max fires) | R55 | Reason |
|---|---:|---:|---|
| `command.government_established` | QUIET, 0-0 | 1-4 | The ordinance is live; remove its obsolete global QUIET entry. |
| `command.post_succeeded` | undeclared | 1-4 | New mechanic, driven by the Texas succession. |
| `ladder.moved` | 2-8 | 5-20 | 7 to 10 observed; the isolated Houston ladder probe identifies the three added moves. |
| `situations.notice_reports` | 8-34 | 17-70 | 31 to 35 observed; three promoted notices and the restored dependent proclamation. |
| `situations.proposals` | 6-24 | 13-52 | 23 to 26 observed; succession, establishment and recognition. |

Testbed gains explicit zero-floor, open-ceiling `notHere` explanations for establishment and succession because it authors neither notice. No other band was changed. The original reference exposed the three ceilings before they were rebanded; that evidence is retained. `reference-band-check.json` reuses its liveness rows after the explanatory band edits, and the required done check independently confirms the final bands.

### Validation and preservation

- **Required root command:** `MANDATE_NO_GIT=1 npm run check`, exit **1**, **107 files**, **1,288 passed / 2 failed / 3 skipped**, 1,293 collected. Both failures were Clark's starting-side inventory assertions. The correction sources his already-held office and passes the complete affected **19-test** file, exit **0** (`clark-verified.log`). The other **106 files** are reused from the full run, giving **1,290 passed / 3 skipped** across the final test set. **This is composite evidence, not a claim that a second full root command exited 0.** No full-suite reassurance rerun.
- **Remaining root chain:** fresh typecheck, boundary, licences and decision index all exit **0** (`non-test-gates.json`). Generated-pack freshness, published-schema freshness, exact habeas hash and `git diff --check` exit **0**. Expected unknown-value warnings remain.
- **Required done check:** `npm run run:done-check -- --label r55-done`, exit **0**, **6/6** criteria; replay, repeat, frozen/unfrozen and save/resume agree. Union median/p95 **32.25 / 69.34 ms**. It checks 151 mechanics for each full reference and the two mechanic-specific exercises.
- **Focused preflight:** **35/35**, including the unchanged S15 opening assertion, loader guards, succession/status/refusal checks and the 13-day office integration. The CLI staff-absence/proposal checks remain covered in the full root suite.
- **Browser:** final `tsc --noEmit`, exit **0**; new neutral-rendering and architecture tests **2/2**, exit **0**. The requested full desk suite exited **1**, **25 files**, **76 passed / 1 failed / 8 skipped**, 85 collected. The inherited failure is `test/r26.test.ts:12`: first-turn playback has two frames, not more than seven. `browser-baseline-probe.json` reverses R55's pack edits in memory and reproduces the identical one-day stop and two frames. R26 and all production playback code are untouched; the other 23 passing files are reused.
- Final inventory and preservation checks are retained in `runs/r55/`. The audit covers **1,106** baseline source/doc files; R47's untouched changes and the lead's App.tsx guard remain. No Git write, other worktree write or server operation was performed. Retained failed fixtures, the diagnostic harness's wrong calendar export, and the rejected source-basis/source-kind attempts are labelled intermediate evidence; none is reported as a passed check.

### Proposed rulings

1. **[I] Institutional succession is a notice-only proposal naming both incumbent and successor**, applied atomically by command with existing appointment guards, no status change and typed outcomes. Rejected: overwriting whichever holder happens to sit there, turning it into a player appointment, or assigning historical status changes through command.
2. **[I] Clark's opening service-side tag follows his already-held Texas office**, supported by the office sources above; it is not a personal political judgment or an inference from his later governorship. Rejected: treating him as already Governor on 5 March, or loosening cross-side appointment guards.
3. **[I] Keep only the sourced Houston judgments and leave the unreplicated refusal to lane 1.14's calibration.** Rejected: inventing temperament, state-autonomy or deterrence ratings, changing generic call weights to force the desired answer, or calling the injected probe the reference run.
4. **[I] Keep 17 April for Virginia's operational allegiance**, with the legal ratification distinction above. Rejected: delaying all service choices to 23 May. Recommendation only; no change applied.

## Findings outside my scope

1. **Lane 1.14 / calibration:** Houston still does not refuse the controlled Confederate call; the generic call terms honour `union` for either issuer. His inherited unposted faction remains an office-service compatibility tag after succession, not a sourced personal allegiance. Calibrate or design these deliberately; do not invent more ratings in this lane.
2. **Prototype owner:** the inherited R26 first-turn playback fixture expects a full week's worth of frames despite a legitimate day-one situation stop. The in-memory R47 control reproduces it. Its one failure remains outstanding; it does not invalidate the new neutral-rendering tests.
3. **Lead / standing reviewer:** review R47 and R55 together, including the eight-region Restored Government approximation and the new succession proposal. The gate's exact habeas approval was copied only within its authorised scope. No independent standing review is claimed here. The root evidence is explicitly composite; the original full command's nonzero exit is retained.
4. **Lane 1.6 press / research / later authoring:** S04's rumour wave, the remaining primary-source leads, and S18's draft still have their previous owners. No R48, R49, R56 or other run's files were changed. This run does not promote `merryman_answer` or alter resignation/secession timing.
