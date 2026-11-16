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
| S02 | `pickens_reinforcement` | live; the landing itself is a labelled gap until lane 1.4b's `landing` effect is on main (the lead's ruling) |
| S03 | `confederate_commissioners` | live |
| S06 | `pickens_refused` | live; on its labelled date, a STAND-IN owned by 1B (sea carriage) |
| S07 | `seward_memorandum` | live; raised by the Secretary of State's initiative (lane 1.5), so it does not arise until his values are entered (lane 1.11a) |
| S09 | `call_for_troops` | live; calls at the OR III-1 p. 69 quotas |
| S10 | `blockade_or_closure` | live |
| S12 | `washington_cut_off` | live; reads the closure flag set by `baltimore_route_closed` |
| S13 | `drafts/black_volunteer_offers` | the decision is held until `ask_congress` has a sourced advocate (the lead's ruling; it blocks nothing in 1A, a labelled gap); the men's offers are a notice (event, no options or effects), awaiting sign-off |
| S14 | `missouri_arsenal` | live; `back_harney` and `back_lyon` |
| S15 | `western_virginia` | live; `cross_river` and `recognise`, in separate groups |
| S20 | `special_session` | live; `ask_war_footing` only |
| S11 | `gosport_yard` | live; raised by Virginia's secession notice; `defend` and `remove` (Welles's orders of 10 to 16 April). The order to hold the yard is a flag only: a navy yard is not a field post, so the goal path refuses it (`not_field_post`) until installations have holders who take orders (1B). `destroy_rest` has no advocate: the commandant burned the yard on his own (the inaction). |
| S17 | none | waits on lane 1.5b's merge: options and inaction each carry a `policy` row (`fugitive-policy`), signed in `gated-rows.test.ts` |
| S18 | none | waits on an advocate for S12's suspension |
| S04, S05, S08, S16, S19, S21 | none | held for the research pass after lane 1.11a's data entry (the lead's ruling) |

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
