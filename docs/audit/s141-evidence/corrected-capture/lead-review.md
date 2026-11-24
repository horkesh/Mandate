# S141 corrected capture: lead review

The one authorised corrected capture succeeded. The first failed attempt remains separately retained. The data hook has not run: 15 zero-floor breaches need the lead's ruling. No zero permission or floor has changed.

Final day **148**, rejected commands **0**, final hash `bd5c7e4e2dd3bf7ef5e212e237ca1d5d47e0fe6b08e5acc1504661a2633c0fc1`. Daily replay, day-60 resume and saved-log replay agree. `final-state.json` is retained under `runs/s141/measurement-corrected/`; `raw-inventory.json` pins it and snapshots at days120/140/146.

## Coverage and composition

All **33** coverage rows: {'mismatch': 13, 'matched': 6, 'representation_gap': 10, 'unresolved': 2, 'not_observed': 2}. See `rows.csv` and `coverage.json` for evidence and gaps.

All 139 noninstitutional, nonformation command subtrees at days120/140/146 are recorded in `army-totals.csv` (417 rows) and `army-lots.csv` (1,223 lot rows). These are actual assignments including subordinate commands, not physical concentration or historical army sizes. Unknown strengths remain unknown.

| Day | Holder / command | Lots | Return | Estimate | Rule | Unknown lots |
|---|---|---:|---:|---:|---:|---:|
| 120 | mcdowell_irvin / `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 120 | patterson_robert / `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 120 | beauregard_pierre_g_t / `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 120 | johnston_joseph_e / `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |
| 140 | mcdowell_irvin / `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 140 | patterson_robert / `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 140 | beauregard_pierre_g_t / `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 140 | johnston_joseph_e / `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |
| 146 | mcdowell_irvin / `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 146 | patterson_robert / `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 146 | beauregard_pierre_g_t / `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 146 | johnston_joseph_e / `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |

Johnston's only assigned lot is `tn_1_infantry`, 780 rule men, in `organised.s74_johnston_brigade_3.1`: at Harpers Ferry on day120 and Lynchburg on days140/146. The lot retains its kind and declared strength source in the CSV. Assignment does not mean arrival in Johnston's presence. McDowell, Patterson and Beauregard have no assigned lots in these snapshots. No roster or desired battle total fills a gap.

Unmatched observations: **602** across snapshots ({120: 214, 140: 194, 146: 194}). Overlapping reasons: {'call_offer_not_established': 387, 'outside_read_sending_command': 476, 'no_declared_read_scope': 126}. These are observations, not 602 unique regiments. `unmatched.csv` retains every identity, call, assignment and reason.

The finite-five request was issued day130 and received by Curtin day135: no selected or received lots, shortfall five, `scope_unavailable`. The disjoint remainder never dispatched. See `allocations.json`; receipt alone does not establish availability.

## Every changed battle

All six changed battles are absent after sweep retirement. Sumter bombardment remains outside these six battle-ledger records. Every old side, participant set, known total, unknown ID, result and loss appears below; every after-side/set/result is **absent**, not a zero-strength historical force. Full terms, decisions, draws and casualty causes remain in `changed-battles.json`.

| Battle / day | Old faction / post / commander | Old blocks; unknown IDs | Present / committed / engaged | Result | Killed / wounded / missing / captured | After |
|---|---|---|---|---|---|---|
| `battle:harpers_ferry:146` / 146 | confederate / `cs_cmd_harpers_ferry` / `johnston_joseph_e` | `organised.s74_johnston_brigade_3.1`, `raised.st_gov_georgia.d122.2`, `raised.st_gov_georgia.d125`; unknown `[]` | 5340 / 3738 / 3738 | gained_ground | 45 / 259 / 24 / 0 | absent |
| `battle:harpers_ferry:146` / 146 | union / `us_dept_pennsylvania` / `patterson_robert` | `raised.st_gov_wisconsin.d83`; unknown `[]` | 1732 / 1732 / 1732 | withdrew | 29 / 165 / 50 / 8 | absent |
| `battle:manassas:140` / 140 | confederate / `cs_cmd_manassas` / `beauregard_pierre_g_t` | `raised.st_gov_alabama.d122.2`, `raised.st_gov_south_carolina.d125`, `state-forces.va_manassas_garland`; unknown `[]` | 6490 / 6490 / 6490 | routed | 168 / 954 / 550 / 235 | absent |
| `battle:manassas:140` / 140 | union / `us_dept_northeastern_virginia` / `mcdowell_irvin` | `organised.s74_mcdowell_division_1_brigade_2.1`, `organised.s74_mcdowell_division_1_brigade_3.1`, `organised.s74_mcdowell_division_1_brigade_4.1`, `organised.s74_mcdowell_division_1_brigade_4.2`, `organised.s74_mcdowell_division_2_brigade_1.1`, `organised.s74_mcdowell_division_2_brigade_2.1`, `organised.s74_mcdowell_division_2_brigade_2.2`, `organised.s74_mcdowell_division_3_brigade_2.1`, `organised.s74_mcdowell_division_3_brigade_3.1`, `organised.s74_mcdowell_division_4_reserve.1`, `organised.s74_mcdowell_division_5_brigade_1.1`, `organised.s74_mcdowell_division_5_brigade_1.2`, `organised.s74_mcdowell_division_5_brigade_2.1`, `raised.st_gov_connecticut.d77`, `raised.st_gov_maine.d77`, `raised.st_gov_massachusetts.d76`, `raised.st_gov_massachusetts.d76.bundle.2`, `raised.st_gov_michigan.d77`, `raised.st_gov_new_york.d64`, `raised.st_gov_new_york.d64.bundle.10`, `raised.st_gov_new_york.d64.bundle.2`, `raised.st_gov_new_york.d64.bundle.3`, `raised.st_gov_new_york.d64.bundle.4`, `raised.st_gov_new_york.d64.bundle.5`, `raised.st_gov_new_york.d64.bundle.6`, `raised.st_gov_new_york.d64.bundle.7`, `raised.st_gov_new_york.d64.bundle.8`, `raised.st_gov_new_york.d64.bundle.9`, `raised.st_gov_new_york.d83`, `raised.st_gov_new_york.d83.bundle.2`, `raised.st_gov_new_york.d83.bundle.3`, `raised.st_gov_new_york.d83.bundle.4`; unknown `[]` | 59754 / 41827 / 41827 | gained_ground | 131 / 743 / 69 / 0 | absent |
| `battle:manassas:141` / 141 | confederate / `cs_cmd_manassas` / `None` | `raised.st_gov_north_carolina.d125`, `raised.st_gov_north_carolina.d93`, `state-forces.cs_nc_additional_north_carolina`, `state-forces.cs_nc_state_transfer_north_carolina`, `state-forces.cs_nc_volunteers_north_carolina`; unknown `["state-forces.cs_nc_additional_north_carolina", "state-forces.cs_nc_state_transfer_north_carolina", "state-forces.cs_nc_volunteers_north_carolina"]` | 3780 / 3780 / 3780 | routed | 125 / 714 / 411 / 175 | absent |
| `battle:manassas:141` / 141 | union / `us_dept_northeastern_virginia` / `mcdowell_irvin` | `organised.s74_mcdowell_division_1_brigade_2.1`, `organised.s74_mcdowell_division_1_brigade_3.1`, `organised.s74_mcdowell_division_1_brigade_4.1`, `organised.s74_mcdowell_division_1_brigade_4.2`, `organised.s74_mcdowell_division_2_brigade_1.1`, `organised.s74_mcdowell_division_2_brigade_2.1`, `organised.s74_mcdowell_division_2_brigade_2.2`, `organised.s74_mcdowell_division_3_brigade_2.1`, `organised.s74_mcdowell_division_3_brigade_3.1`, `organised.s74_mcdowell_division_4_reserve.1`, `organised.s74_mcdowell_division_5_brigade_1.1`, `organised.s74_mcdowell_division_5_brigade_1.2`, `organised.s74_mcdowell_division_5_brigade_2.1`, `raised.st_gov_connecticut.d77`, `raised.st_gov_maine.d77`, `raised.st_gov_massachusetts.d76`, `raised.st_gov_massachusetts.d76.bundle.2`, `raised.st_gov_michigan.d77`, `raised.st_gov_new_york.d64`, `raised.st_gov_new_york.d64.bundle.10`, `raised.st_gov_new_york.d64.bundle.2`, `raised.st_gov_new_york.d64.bundle.3`, `raised.st_gov_new_york.d64.bundle.4`, `raised.st_gov_new_york.d64.bundle.5`, `raised.st_gov_new_york.d64.bundle.6`, `raised.st_gov_new_york.d64.bundle.7`, `raised.st_gov_new_york.d64.bundle.8`, `raised.st_gov_new_york.d64.bundle.9`, `raised.st_gov_new_york.d83`, `raised.st_gov_new_york.d83.bundle.2`, `raised.st_gov_new_york.d83.bundle.3`, `raised.st_gov_new_york.d83.bundle.4`; unknown `[]` | 58811 / 41167 / 41167 | gained_ground | 99 / 566 / 186 / 0 | absent |
| `battle:manassas:142` / 142 | confederate / `cs_cmd_manassas` / `None` | `raised.st_gov_mississippi.d121`, `raised.st_gov_north_carolina.d125`, `raised.st_gov_north_carolina.d93`, `state-forces.cs_nc_additional_north_carolina`, `state-forces.cs_nc_state_transfer_north_carolina`, `state-forces.cs_nc_volunteers_north_carolina`; unknown `["state-forces.cs_nc_additional_north_carolina", "state-forces.cs_nc_state_transfer_north_carolina", "state-forces.cs_nc_volunteers_north_carolina"]` | 3915 / 3915 / 3915 | routed | 142 / 805 / 464 / 198 | absent |
| `battle:manassas:142` / 142 | union / `us_dept_northeastern_virginia` / `mcdowell_irvin` | `organised.s74_mcdowell_division_1_brigade_2.1`, `organised.s74_mcdowell_division_1_brigade_3.1`, `organised.s74_mcdowell_division_1_brigade_4.1`, `organised.s74_mcdowell_division_1_brigade_4.2`, `organised.s74_mcdowell_division_2_brigade_1.1`, `organised.s74_mcdowell_division_2_brigade_2.1`, `organised.s74_mcdowell_division_2_brigade_2.2`, `organised.s74_mcdowell_division_3_brigade_2.1`, `organised.s74_mcdowell_division_3_brigade_3.1`, `organised.s74_mcdowell_division_4_reserve.1`, `organised.s74_mcdowell_division_5_brigade_1.1`, `organised.s74_mcdowell_division_5_brigade_1.2`, `organised.s74_mcdowell_division_5_brigade_2.1`, `raised.st_gov_connecticut.d77`, `raised.st_gov_maine.d77`, `raised.st_gov_massachusetts.d76`, `raised.st_gov_massachusetts.d76.bundle.2`, `raised.st_gov_michigan.d77`, `raised.st_gov_new_york.d64`, `raised.st_gov_new_york.d64.bundle.10`, `raised.st_gov_new_york.d64.bundle.2`, `raised.st_gov_new_york.d64.bundle.3`, `raised.st_gov_new_york.d64.bundle.4`, `raised.st_gov_new_york.d64.bundle.5`, `raised.st_gov_new_york.d64.bundle.6`, `raised.st_gov_new_york.d64.bundle.7`, `raised.st_gov_new_york.d64.bundle.8`, `raised.st_gov_new_york.d64.bundle.9`, `raised.st_gov_new_york.d83`, `raised.st_gov_new_york.d83.bundle.2`, `raised.st_gov_new_york.d83.bundle.3`, `raised.st_gov_new_york.d83.bundle.4`; unknown `[]` | 57960 / 40572 / 40572 | gained_ground | 104 / 592 / 55 / 0 | absent |
| `battle:manassas:143` / 143 | confederate / `cs_cmd_manassas` / `None` | `raised.st_gov_alabama.d125`, `raised.st_gov_mississippi.d121`, `raised.st_gov_north_carolina.d125`, `raised.st_gov_north_carolina.d93`, `state-forces.cs_nc_additional_north_carolina`, `state-forces.cs_nc_state_transfer_north_carolina`, `state-forces.cs_nc_volunteers_north_carolina`; unknown `["state-forces.cs_nc_additional_north_carolina", "state-forces.cs_nc_state_transfer_north_carolina", "state-forces.cs_nc_volunteers_north_carolina"]` | 3866 / 3866 / 3866 | routed | 136 / 771 / 318 / 135 | absent |
| `battle:manassas:143` / 143 | union / `us_dept_northeastern_virginia` / `mcdowell_irvin` | `organised.s74_mcdowell_division_1_brigade_2.1`, `organised.s74_mcdowell_division_1_brigade_3.1`, `organised.s74_mcdowell_division_1_brigade_4.1`, `organised.s74_mcdowell_division_1_brigade_4.2`, `organised.s74_mcdowell_division_2_brigade_1.1`, `organised.s74_mcdowell_division_2_brigade_2.1`, `organised.s74_mcdowell_division_2_brigade_2.2`, `organised.s74_mcdowell_division_3_brigade_2.1`, `organised.s74_mcdowell_division_3_brigade_3.1`, `organised.s74_mcdowell_division_4_reserve.1`, `organised.s74_mcdowell_division_5_brigade_1.1`, `organised.s74_mcdowell_division_5_brigade_1.2`, `organised.s74_mcdowell_division_5_brigade_2.1`, `raised.st_gov_connecticut.d77`, `raised.st_gov_maine.d77`, `raised.st_gov_massachusetts.d76`, `raised.st_gov_massachusetts.d76.bundle.2`, `raised.st_gov_michigan.d77`, `raised.st_gov_new_york.d64`, `raised.st_gov_new_york.d64.bundle.10`, `raised.st_gov_new_york.d64.bundle.2`, `raised.st_gov_new_york.d64.bundle.3`, `raised.st_gov_new_york.d64.bundle.4`, `raised.st_gov_new_york.d64.bundle.5`, `raised.st_gov_new_york.d64.bundle.6`, `raised.st_gov_new_york.d64.bundle.7`, `raised.st_gov_new_york.d64.bundle.8`, `raised.st_gov_new_york.d64.bundle.9`, `raised.st_gov_new_york.d83`, `raised.st_gov_new_york.d83.bundle.2`, `raised.st_gov_new_york.d83.bundle.3`, `raised.st_gov_new_york.d83.bundle.4`; unknown `[]` | 57209 / 40046 / 40046 | gained_ground | 104 / 593 / 55 / 0 | absent |
| `battle:manassas:146` / 146 | confederate / `cs_cmd_manassas` / `None` | `raised.st_gov_alabama.d125`, `raised.st_gov_mississippi.d121`, `raised.st_gov_north_carolina.d125`, `raised.st_gov_north_carolina.d93`, `state-forces.cs_nc_additional_north_carolina`, `state-forces.cs_nc_state_transfer_north_carolina`, `state-forces.cs_nc_volunteers_north_carolina`; unknown `["state-forces.cs_nc_additional_north_carolina", "state-forces.cs_nc_state_transfer_north_carolina", "state-forces.cs_nc_volunteers_north_carolina"]` | 2728 / 2728 / 2728 | routed | 96 / 548 / 226 / 96 | absent |
| `battle:manassas:146` / 146 | union / `us_dept_northeastern_virginia` / `mcdowell_irvin` | `organised.s74_mcdowell_division_1_brigade_2.1`, `organised.s74_mcdowell_division_1_brigade_3.1`, `organised.s74_mcdowell_division_1_brigade_4.1`, `organised.s74_mcdowell_division_1_brigade_4.2`, `organised.s74_mcdowell_division_2_brigade_1.1`, `organised.s74_mcdowell_division_2_brigade_2.1`, `organised.s74_mcdowell_division_2_brigade_2.2`, `organised.s74_mcdowell_division_3_brigade_2.1`, `organised.s74_mcdowell_division_3_brigade_3.1`, `organised.s74_mcdowell_division_4_reserve.1`, `organised.s74_mcdowell_division_5_brigade_1.1`, `organised.s74_mcdowell_division_5_brigade_1.2`, `organised.s74_mcdowell_division_5_brigade_2.1`, `raised.st_gov_connecticut.d77`, `raised.st_gov_maine.d77`, `raised.st_gov_massachusetts.d76`, `raised.st_gov_massachusetts.d76.bundle.2`, `raised.st_gov_michigan.d77`, `raised.st_gov_new_york.d64`, `raised.st_gov_new_york.d64.bundle.10`, `raised.st_gov_new_york.d64.bundle.2`, `raised.st_gov_new_york.d64.bundle.3`, `raised.st_gov_new_york.d64.bundle.4`, `raised.st_gov_new_york.d64.bundle.5`, `raised.st_gov_new_york.d64.bundle.6`, `raised.st_gov_new_york.d64.bundle.7`, `raised.st_gov_new_york.d64.bundle.8`, `raised.st_gov_new_york.d64.bundle.9`, `raised.st_gov_new_york.d83`, `raised.st_gov_new_york.d83.bundle.2`, `raised.st_gov_new_york.d83.bundle.3`, `raised.st_gov_new_york.d83.bundle.4`; unknown `[]` | 56527 / 39568 / 39568 | gained_ground | 66 / 377 / 35 / 0 | absent |

## Every changed count and band

The 66 count/magnitude changes compare against S134's retained repair capture, pinned before measurement. Causes are integrated trajectory inferences [I], not isolated credit for individual instruments. No contract, force quantity, combat/planner parameter, journey time or random stream was fitted.

All 47 moved positive counts have the authorised `around(n)` recenter: minimum `max(1,floor(n/2))`, maximum `max(2*n,n+3)`. Exact previous/next bands and causes are in `positive-band-review.json` and the append-only ledger. They resolve the 12 positive out-of-band results. All 18 new zero counts are submitted to the lead: 15 still breach floors; three already had minimum zero. No zero permission was added.

| Mechanic | Fires before ? after | Magnitude before ? after | Old band | Current band / disposition |
|---|---:|---:|---|---|
| `combat.battle_closed` | 6 ? 0 | 6 ? 0 | 2..10 | 2..10; lead: zero-floor breach |
| `combat.battle_day` | 8 ? 2 | 8 ? 2 | 3..14 | 1..5; positive recenter |
| `combat.battle_opened` | 6 ? 0 | 6 ? 0 | 2..10 | 2..10; lead: zero-floor breach |
| `combat.captured` | 6 ? 0 | 847 ? 0 | 2..10 | 2..10; lead: zero-floor breach |
| `combat.flank_broken` | 4 ? 0 | 4 ? 0 | 1..6 | 1..6; lead: zero-floor breach |
| `combat.general_hit` | 1 ? 0 | 1 ? 0 | 1..4 | 1..4; lead: zero-floor breach |
| `combat.killed_wounded` | 12 ? 0 | 8332 ? 0 | 5..20 | 5..20; lead: zero-floor breach |
| `combat.missing` | 12 ? 0 | 2443 ? 0 | 4..18 | 4..18; lead: zero-floor breach |
| `combat.occupation` | 408 ? 280 | 13817 ? 6561 | 157..628 | 140..560; positive recenter |
| `combat.pursuit_chosen` | 1 ? 0 | 1 ? 0 | 0..unbounded | 0..unbounded; lead: new zero within old band |
| `combat.routed` | 5 ? 0 | 5 ? 0 | 2..10 | 2..10; lead: zero-floor breach |
| `combat.withdrew` | 1 ? 0 | 1 ? 0 | 1..4 | 1..4; lead: zero-floor breach |
| `combat.works_stormed` | 1 ? 0 | 150 ? 0 | 0..unbounded | 0..unbounded; lead: new zero within old band |
| `control.changed` | 414 ? 282 | 16617 ? 8561 | 160..640 | 141..564; positive recenter |
| `control.threshold_crossed` | 49 ? 21 | 49 ? 21 | 19..78 | 10..42; positive recenter |
| `forces.stores_fell` | 2627 ? 466 | 2597278 ? 457119 | 1444..5776 | 233..932; positive recenter |
| `forces.stores_low` | 98 ? 11 | 98 ? 11 | 51..206 | 5..22; positive recenter |
| `forces.stores_refilled` | 2974 ? 2091 | 2928592 ? 2064575 | 1200..4800 | 1045..4182; positive recenter |
| `forces.stragglers_returned` | 174 ? 0 | 895 ? 0 | 92..368 | 92..368; lead: zero-floor breach |
| `knowledge.pruned_age` | 107 ? 103 | 1536 ? 1394 | 53..214 | 51..206; positive recenter |
| `knowledge.pruned_superseded` | 146 ? 146 | 12348 ? 14072 | 73..292 | 73..292; unchanged |
| `map.pocket_closed` | 6 ? 4 | 6 ? 4 | 1..6 | 2..8; positive recenter |
| `map.pocket_relieved` | 3 ? 0 | 3 ? 0 | 1..4 | 1..4; lead: zero-floor breach |
| `map.recomputed` | 55 ? 37 | 62 ? 42 | 26..104 | 18..74; positive recenter |
| `messages.courier_delay` | 161 ? 156 | 161 ? 156 | 49..198 | 78..312; positive recenter |
| `messages.delivered` | 14879 ? 16223 | 14879 ? 16223 | 7221..28886 | 8111..32446; positive recenter |
| `messages.mail_delay` | 2869 ? 2825 | 2869 ? 2825 | 1428..5712 | 1412..5650; positive recenter |
| `messages.sent` | 15657 ? 16955 | 15657 ? 16955 | 7607..30428 | 8477..33910; positive recenter |
| `messages.special_messenger` | 0 ? 1 | 0 ? 1 | 0..0 | 1..4; positive recenter |
| `movement.arrived` | 704 ? 43 | 704 ? 43 | 319..1276 | 21..86; positive recenter |
| `movement.joined` | 65 ? 2 | 65 ? 2 | 32..128 | 1..5; positive recenter |
| `movement.leg_started` | 387 ? 43 | 387 ? 43 | 155..620 | 21..86; positive recenter |
| `operations.ended` | 9 ? 5 | 9 ? 5 | 4..18 | 2..10; positive recenter |
| `operations.opened` | 10 ? 5 | 10 ? 5 | 3..12 | 2..10; positive recenter |
| `operations.repulsed` | 1 ? 0 | 1 ? 0 | 1..4 | 1..4; lead: zero-floor breach |
| `operations.stage` | 38 ? 25 | 38 ? 25 | 12..48 | 12..50; positive recenter |
| `operations.works` | 15 ? 4 | 750 ? 200 | 7..30 | 2..8; positive recenter |
| `orders.obeyed` | 13 ? 8 | 13 ? 8 | 4..18 | 4..16; positive recenter |
| `orders.relayed` | 20 ? 17 | 20 ? 17 | 10..40 | 8..34; positive recenter |
| `orders.responses_pruned` | 30 ? 19 | 78 ? 33 | 13..54 | 9..38; positive recenter |
| `planner.candidates` | 12 ? 8 | 22 ? 10 | 4..16 | 4..16; positive recenter |
| `planner.searches` | 12 ? 8 | 62 ? 20 | 4..16 | 4..16; positive recenter |
| `planner.term.time` | 2 ? 0 | 2 ? 0 | 1..5 | 1..5; lead: zero-floor breach |
| `plans.approved` | 5 ? 4 | 5 ? 4 | 0..unbounded | 2..8; positive recenter |
| `plans.chosen` | 14 ? 7 | 14 ? 7 | 7..28 | 3..14; positive recenter |
| `plans.drafted` | 12 ? 8 | 12 ? 8 | 4..16 | 4..16; positive recenter |
| `plans.goal_reached` | 6 ? 5 | 6 ? 5 | 1..6 | 2..10; positive recenter |
| `plans.goal_set` | 13 ? 8 | 13 ? 8 | 4..18 | 4..16; positive recenter |
| `plans.submitted` | 7 ? 5 | 7 ? 5 | 0..unbounded | 2..10; positive recenter |
| `plans.went_ahead` | 7 ? 2 | 7 ? 2 | 3..12 | 1..5; positive recenter |
| `politics.support` | 103 ? 49 | 103 ? 49 | 42..170 | 24..98; positive recenter |
| `regions.reached_lines` | 271 ? 260 | 271 ? 260 | 137..548 | 130..520; positive recenter |
| `regions.self_emancipation` | 3081 ? 3068 | 3081 ? 3068 | 1548..6194 | 1534..6136; positive recenter |
| `reports.battle_dispatch` | 50 ? 2 | 50 ? 2 | 21..84 | 1..5; positive recenter |
| `reports.casualty_return` | 24 ? 8 | 24 ? 8 | 10..40 | 4..16; positive recenter |
| `reports.commander_lost` | 1 ? 0 | 1 ? 0 | 1..4 | 1..4; lead: zero-floor breach |
| `reports.governor_wire` | 7 ? 2 | 7 ? 2 | 3..12 | 1..5; positive recenter |
| `seats.attention_spent` | 181 ? 100 | 181 ? 101 | 76..306 | 50..200; positive recenter |
| `seats.battle_orders` | 11 ? 0 | 11 ? 0 | 5..20 | 5..20; lead: zero-floor breach |
| `seats.choices` | 25 ? 15 | 25 ? 15 | 12..50 | 7..30; positive recenter |
| `situations.fired` | 90 ? 89 | 90 ? 89 | 44..176 | 44..178; positive recenter |
| `situations.notice_reports` | 72 ? 71 | 72 ? 71 | 35..140 | 35..142; positive recenter |
| `situations.noticed` | 71 ? 70 | 71 ? 70 | 34..138 | 35..140; positive recenter |
| `situations.surfaced` | 88 ? 87 | 88 ? 87 | 43..174 | 43..174; positive recenter |
| `verbs.answered` | 163 ? 65 | 163 ? 65 | 61..246 | 32..130; positive recenter |
| `verbs.declined` | 34 ? 0 | 34 ? 0 | 0..unbounded | 0..unbounded; lead: new zero within old band |

The remaining 15 breaches are the stopping point before the ordinary hook. Static boundary/rules checks cannot waive runtime liveness. A lead decision is required on the zero dispositions; no further capture is authorised or proposed here.

Findings outside my scope
