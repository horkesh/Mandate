# Lane 1.11: the situations of March to July 1861 (hand-over)

Branch `phase1-situations`. This note is kept current until the lane closes. The catalogue is `docs/design/SITUATIONS-1861-62.md`, and the facts come from `docs/research/2026-11-14-secession-winter-1861.md` (cited as NOTE-secession-winter-1861).

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
| S15 | `western_virginia` | live; `cross_river` and `recognise`, in separate groups |
| S20 | `special_session` | live; fires when the House sits (lane 1.6's chamber condition); `ask_war_footing` appears while the spring's acts are before Congress and answers them on the ledger |
| S11 | `gosport_yard` | live; raised by Virginia's secession notice; `defend` and `remove` (Welles's orders of 10 to 16 April). The order to hold the yard is a flag only: a navy yard is not a field post, so the goal path refuses it (`not_field_post`) until installations have holders who take orders (1B). `destroy_rest` has no advocate: the commandant burned the yard on his own (the inaction). |
| S17 | `fort_monroe_arrivals` | signed and live, with its three `fugitive-policy` rows (signed in `gated-rows.test.ts`). `approve_holding` (Cameron) and `return` (labelled plainly; proposed on a basis in the 1850 law and Major Cary's demand, the recorded exception; watched; floored; expires with the confiscation act); inaction is `commanders_decide`, floored. The men's escape is two notices from one cause: Butler's refusal prints only while the Fort Monroe command's holder carries `holds_fugitives`. Butler's command (`us_dept_virginia`) opens on 22 May by a STAND-IN notice, `butler_at_fort_monroe`, owned by lane 1.12: its Part B replaces it with the rule-seat Lincoln's appointment on the sourced date, so only the history run puts Butler there and a player appoints in his own game. Townsend's (OR II-1 p. 760) and Bates's (p. 761) letters are standalone dated reports in July; a recurrence of S17 goes to 1B (the First Confiscation Act). The NPS caution that the three names rest on later attribution goes to lane 1.10's list. |
| S18 | `merryman_writ` | signed and live, the event facet: the writ and the commander's refusal as Taney's Reports record them. The president's answer (comply, decline and defend, ask Congress) is still to author. The suspension it follows, `habeas_on_the_line` (S12's suspend-on-line), is signed and live: Lincoln's own initiative of 25 April as provenance only (the principal-initiative exception), no staff line, told by a plain report; the desk's neutral rendering and its architecture test are owed when lane 1.13's desk lands. Patterson's, Thomson's and Judge Nelson's calls for martial law or arrests are signed dated reports. |
| S16 | `kentucky_neutrality` | live, stage A only (stage B, Magoffin's protest of 19 August, falls after the window); `arm_quietly` (Cameron's department), `move_in` (Dennison, Yates), `wait` (Scott, McClellan) |
| S21 | `mcdowell_advance` | live; `advance_now` (the Blairs, as Weed's letter of 26 July names them: retrospective) and `drill_first` (McDowell); flags only, since McDowell and Patterson hold no posts in the March start |
| S05 | `lamon_promise` | live; Pickens's telegram of 30 March (a labelled railroad); `assure_notice` (Seward's note of 1 April, OR I-53 pp. 162 to 163); Lamon's words from OR I-1 p. 282 |
| S08 | `virginia_unionists` | live; the Unionist's visit of 4 April (a labelled railroad); `offer_fort` is Seward's course as Fox's own memo records it (FOX-CC vol. 1 p. 38), and the inaction is Baldwin's sworn account (JCR Part II pp. 102 to 105); the accounts conflict, and the history default follows Fox and Botts. The vote is 89 to 45 (the convention's journal) |
| S04 | none | its options have no adviser on record (lane 1.11r); the rumour wave belongs to lane 1.6's press, not a situation |
| S19 | none | goes to 1B: the board reported on 5, 16 and 26 July, but its plan was adopted only by Welles's order of 3 August, so nothing in it yields a decision before 31 July |

Notices:
- **Live:**
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
| S15's `recognise` | the clock (37 days) | the Wheeling convention's ordinance |
| S20 | day 121, the date the proclamation set | the proclamation's own term (1.6) |

## Where it stopped (2026-11-17, the owner's pause)

**Done and signed (live in the reference run):** S01, S02 (the Pickens landing through S06), S03, S05, S06, S07, S08, S09, S10, S11, S12, S13 (the offers as a notice), S14, S15, S16 stage A, S17 (with its three signed fugitive-policy rows), S20, S21; the four secessions; the Indian Territory acts; the Pratt Street and Camp Jackson deaths; McClellan's proclamation; the escape notices and the July reports for S17; habeas_on_the_line (S12's suspension); merryman_writ (S18's event); the Patterson, Thomson and Judge Nelson reports. reduce_sumter orders the Charleston command to take the fort (lane 1.12's bombardment hook).

**Drafted and waiting:**
- merryman_answer (S18's decision), in situations/drafts/: comply (Taney's words, Taney's Reports pp. 269 to 270, proposedBy taney_roger_b, speaker while serving); the inaction is the historical course, with the suspension's costs; no ask-Congress option; no staff line, a typed absence citing NOTE-1861-leads. Waits on taney_roger_b reaching main (branch phase1-taney-1861, d50e533); then move it into situations/, take 1.11r3's TANEY-REPORTS row and citation form on the merge, and send it to the gate reviewer.
- The Restored Government of Virginia: the mechanism is built (declared_governments.csv, command's government_established, the 0070 guard, tests; command.government_established is QUIET). The pack data (the declared government, its regions, the Wheeling notice, S15's recognise giving its side through department_side) waits on research the lead is routing: the convention's dates and ordinance (11 and 19 June), Pierpont's election (20 June), the counties claimed, and the first federal act of recognition.
- The desk's neutral rendering and its architecture test (the desk never reads proposedBy's basis; "No recommendation from the staff" for a typed absence): wait on lane 1.13's desk reaching main. No desk may show habeas_on_the_line until both are in (its signing note).
- S04: not a situation; recommended to lane 1.6's press (no adviser on record for its options).

**Rulings, as built:**
- principal-initiative (the lead's (b) on S12, with the gate reviewer's three conditions): accepted only on an option of a gated decision, the side's principal as author, dated on or before the situation's earliest date; no staff line, told by a plain report (B9). Built, tested, signed on habeas_on_the_line.
- The typed staff absence (the lead's (b) on S18): built and tested (staffAbsence { none, cites }). Open: whether habeas_on_the_line should also carry one, for a uniform rule; that changes its hash and needs re-signing, so it would go in S18's sign-off batch.

**Waiting on other lanes:** taney_roger_b (lane 1.11r3); the Wheeling research (routed by the lead); lane 1.13's desk; lane 1.12's bombardment stage (it removes its own dated Sumter row once it reads reduce_sumter's order). Gone to 1B: S13's decision, S17's recurrence, S19, S16 stage B (August).