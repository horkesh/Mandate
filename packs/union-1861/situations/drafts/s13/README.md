# S13 unsigned situations, August 1861–November 1862

73 situation drafts cover all 36 entries S22–S57 and the dated autumn stages of S16 and S19: 49 document notices and 24 decision facets, with 34 offered choices. Every review is null. The production loader reads none of them. This is authoring material for whole-branch and gate review under 0106, not a playable 1862 campaign.

[index.json](index.json) records every draft’s cause, page evidence by option, missing owner acts and holds. [catalogue-options.json](catalogue-options.json) accounts for all 132 catalogue alternatives: 24 matching offered option IDs, five narrower sourced facets, sixteen matching held sourced candidates and 87 holds. Those are dispositions, not 132 implemented choices. Seventeen candidate choices in [candidate-options.json](candidate-options.json) retain wording, proposers and pages separately from the offered options; one is an additional sourced facet rather than an exact catalogue alternative. Missing advocacy is a hold, not invented advice. The index’s typed staff absences describe this bounded reading, not a claim that no adviser ever existed.

All 34 offered choices cite a documented proposer. Their actions remain reported in `index.json.acts`: the present effect/order/call schemas cannot express the full acts required here. All option effects, orders, calls and inaction effects are empty. They must acquire their real owner implementations and guards before promotion. In particular, `command.post_succession` is notice-only, incumbent-checked and status-preserving (0100 §12); using it for discretionary retirement, conditional relief, dual command or a field transfer would be a substitute for the missing act.

Every item waits for a specifically identified paper in `State.knowledgeBySeat`, as well as its date guard. It is a received-document or deliberation facet. It does not make the underlying battle, arrest, law, visit or appointment happen on a calendar date. No packet producer is built here. Retrospective publications are evidence for historical propositions, never papers dispatched into 1861–62. A period producer still needs the source case, actual speaker/post guards, route, receipt and chain conditions. The receipt tests accept the correct paper and refuse the wrong subject, future receipt, early day and date alone. No other draft is loaded to satisfy an isolated draft’s references.

**Gate proposals.** Nineteen notices are gated. They use `emancipation-policy`, `black-enlistment`, `occupation-orders`, `dakota-war-1862`, `union-habeas-and-arrests`, `guerrilla-war-west` and `capture-in-battle` as shown below. Four topics and the `civilians` class are draft overlays only. `civilians` follows the vocabulary in SENSITIVE-HISTORY §5; occupation orders have event/text placements, with no severity choice. The Frémont paper carries its shooting/martial-law topics as well as emancipation; its candidates concern emancipation only. No option permits shooting, reprisals or execution. Dakota is a request for records, not an execution choice. Nothing here accepts a placement, lifts R3/R6 or supplies a sign-off.

**Authoring checks.** Run `node --import tsx packs/union-1861/situations/drafts/s13/validate.ts`. It parses the draft overlays and each situation separately with the existing schemas, semantic validator, policy validator and gate. The final run accepts all 73 with zero content errors. It separately retains 19 `gate-unsigned` and two `gate-held-topic` errors as review blockers; the latter are on the combined Frémont paper. All other error kinds remain fatal. The production gate’s unsigned refusal is tested directly. Candidate promotion without locked costs is also rejected. No numerical penalty was invented to make a sensitive choice pass. Two unchanged Townsend wording warnings repeat in each isolated context (146 reports, two unique warnings); none is an S13 wording hit. This authoring result is not a release verdict.

The pack tests cover every entry in isolation, the independent catalogue window, live-loader exclusion, provenance/string exclusion, receipt/date controls, missing strings/sources, invented people, exact anachronism matching, source/act evidence for choices, unsigned refusal, held candidates and the existing weak-source policy. There are 228 tests in the final file. The exact no-Git full check passed before the last bounded Hampton Roads source correction; its four affected checks then passed. The final commit hook checks the complete current tree, including the Git-fixture tests, again. Its result is retained in the external final-checks record and the main CODEX status.

**Evidence and limits.** [sources-read.md](sources-read.md) lists every historical source read, with printed pages and reading limits. [reading-manifest.json](reading-manifest.json) retains hashes for 27 source files (PDFs and OCR), 180 search/reading extracts and one copied scan. A full-file hash does not mean a full volume was read. Earlier wrong OCR-index assumptions, unused leads, failed downloads and the JS-only article response are excluded from adopted facts. Welles’s retrospective opening retains the existing weak classification; the actual Hampton Roads notice now uses the dated 10 March instruction, CW II p. 136. Its cabinet recollection remains a held lead, not an offered choice. There is no factual or gate-policy benefit from renaming a weak source.

**Owners still needed.**

| Owner area | What must precede promotion |
|---|---|
| Information, messages and source cases | Dated period papers; real authors/posts; routes; actual receipt; stale-document and chain guards; no retrospective publication in a period inbox. |
| People and command | Retirement versus relief; conditional issue and ordered delivery; dual/general/department/corps authority; successor assumption; field transfers; service status and vacancies. Resolve Cooke, Woodbury, Haupt, Sturgis and Army staff identities/posts rather than inventing ids. |
| Plans, transport and Navy | Support/transfer and readiness instructions, actual shipping and pontoon movement; separate squadron posts, boundaries, interim scope, administrative transfer and assumption. |
| Congress, states, Treasury and procurement | Bills/resolutions and approval; state acceptance; national calls versus quotas, terms, credits, muster and joining; actual agency contracts/commission; procurement claims and filing, not guessed cash or weapon gains. |
| Diplomacy | Demands, answers, release arrangements, foreign response clocks and consular case records. |
| Custody, courts and protected policy | Individual authority, detention, charges, hearing and review; gate placement, policy rows, actual enforcement and defensible locked consequences. No people-as-resource or atrocity lever. |

Existing owners are not absent merely because a required act is missing. Each exact gap is recorded per draft and per option in the index. No new root State field or typed owner vocabulary is introduced.

**Runtime check.** One normal eight-seed `npm run run:done-check -- --label s13-done` exits 1: Phase 0 5/6 and 1A 2/6. The unchanged 40 ms median budget fails (reference 56.43 ms; history 59.35 ms); checkpoint, operation, pushback and lever-sweep failures remain. The history ends on 31 July 1861 and the drafts are excluded, so it does not exercise S13’s August–November content. All 1,673 original tracked files are preserved. Its evidence is reused, not rerun or waived. Full results and the proposed rulings are in the [hand-over](../../../../../notes/sprint-S13-situations.md).

| Catalogue | Draft | Kind | Gate topics |
|---|---|---|---|
| S16 | [s13_kentucky_camp_protest](../s13_kentucky_camp_protest.json) | notice | proposed none |
| S16 | [s13_kentucky_camp_protest_decision](../s13_kentucky_camp_protest_decision.json) | decision | proposed none |
| S19 | [s13_atlantic_squadron_division](../s13_atlantic_squadron_division.json) | notice | proposed none |
| S19 | [s13_atlantic_squadron_division_decision](../s13_atlantic_squadron_division_decision.json) | decision | proposed none |
| S22 | [s13_fremont_proclamation](../s13_fremont_proclamation.json) | notice | emancipation-policy, union-habeas-and-arrests, guerrilla-war-west |
| S23 | [s13_maryland_legislature_autumn](../s13_maryland_legislature_autumn.json) | notice | union-habeas-and-arrests |
| S24 | [s13_fremont_department](../s13_fremont_department.json) | notice | proposed none |
| S24 | [s13_fremont_department_decision](../s13_fremont_department_decision.json) | decision | proposed none |
| S25 | [s13_general_in_chief_1861](../s13_general_in_chief_1861.json) | notice | proposed none |
| S25 | [s13_general_in_chief_1861_decision](../s13_general_in_chief_1861_decision.json) | decision | proposed none |
| S26 | [s13_trent_affair](../s13_trent_affair.json) | notice | proposed none |
| S26 | [s13_trent_affair_decision](../s13_trent_affair_decision.json) | decision | proposed none |
| S27 | [s13_committee_and_stone](../s13_committee_and_stone.json) | notice | union-habeas-and-arrests |
| S27 | [s13_stone_arrest_report](../s13_stone_arrest_report.json) | notice | union-habeas-and-arrests |
| S28 | [s13_war_department_report](../s13_war_department_report.json) | notice | emancipation-policy, black-enlistment |
| S28 | [s13_war_department_secretary](../s13_war_department_secretary.json) | notice | proposed none |
| S28 | [s13_war_department_secretary_decision](../s13_war_department_secretary_decision.json) | decision | proposed none |
| S29 | [s13_treasury_notes](../s13_treasury_notes.json) | notice | proposed none |
| S30 | [s13_arms_and_contracts](../s13_arms_and_contracts.json) | notice | proposed none |
| S30 | [s13_arms_and_contracts_decision](../s13_arms_and_contracts_decision.json) | decision | proposed none |
| S30 | [s13_foreign_contracts](../s13_foreign_contracts.json) | notice | proposed none |
| S30 | [s13_foreign_contracts_decision](../s13_foreign_contracts_decision.json) | decision | proposed none |
| S31 | [s13_army_will_not_move](../s13_army_will_not_move.json) | notice | proposed none |
| S31 | [s13_army_will_not_move_decision](../s13_army_will_not_move_decision.json) | decision | proposed none |
| S32 | [s13_grant_rumour](../s13_grant_rumour.json) | notice | proposed none |
| S32 | [s13_grant_rumour_decision](../s13_grant_rumour_decision.json) | decision | proposed none |
| S33 | [s13_compensated_emancipation](../s13_compensated_emancipation.json) | notice | emancipation-policy |
| S34 | [s13_hampton_roads_scare](../s13_hampton_roads_scare.json) | notice | proposed none |
| S35 | [s13_war_orders_march_1862](../s13_war_orders_march_1862.json) | notice | proposed none |
| S35 | [s13_war_orders_march_1862_decision](../s13_war_orders_march_1862_decision.json) | decision | proposed none |
| S36 | [s13_washington_cover](../s13_washington_cover.json) | notice | proposed none |
| S36 | [s13_washington_cover_decision](../s13_washington_cover_decision.json) | decision | proposed none |
| S37 | [s13_recruiting_call](../s13_recruiting_call.json) | notice | proposed none |
| S37 | [s13_recruiting_call_decision](../s13_recruiting_call_decision.json) | decision | proposed none |
| S37 | [s13_recruiting_closed](../s13_recruiting_closed.json) | notice | proposed none |
| S37 | [s13_recruiting_closed_decision](../s13_recruiting_closed_decision.json) | decision | proposed none |
| S37 | [s13_recruiting_new_call](../s13_recruiting_new_call.json) | notice | proposed none |
| S37 | [s13_recruiting_new_call_decision](../s13_recruiting_new_call_decision.json) | decision | proposed none |
| S38 | [s13_norfolk](../s13_norfolk.json) | notice | capture-in-battle |
| S39 | [s13_hunter_order](../s13_hunter_order.json) | notice | emancipation-policy |
| S40 | [s13_new_orleans_command](../s13_new_orleans_command.json) | notice | occupation-orders |
| S41 | [s13_army_of_virginia](../s13_army_of_virginia.json) | notice | proposed none |
| S41 | [s13_army_of_virginia_decision](../s13_army_of_virginia_decision.json) | decision | proposed none |
| S42 | [s13_harrisons_landing_letter](../s13_harrisons_landing_letter.json) | notice | emancipation-policy |
| S43 | [s13_general_in_chief_1862](../s13_general_in_chief_1862.json) | notice | proposed none |
| S43 | [s13_general_in_chief_1862_decision](../s13_general_in_chief_1862_decision.json) | decision | proposed none |
| S44 | [s13_vicksburg_river_1862](../s13_vicksburg_river_1862.json) | notice | proposed none |
| S45 | [s13_confiscation_and_militia_acts](../s13_confiscation_and_militia_acts.json) | notice | emancipation-policy, black-enlistment |
| S46 | [s13_emancipation_cabinet_draft](../s13_emancipation_cabinet_draft.json) | notice | emancipation-policy |
| S46 | [s13_emancipation_preliminary](../s13_emancipation_preliminary.json) | notice | emancipation-policy |
| S46 | [s13_greeley_reply](../s13_greeley_reply.json) | notice | emancipation-policy |
| S47 | [s13_peninsula_withdrawal](../s13_peninsula_withdrawal.json) | notice | proposed none |
| S47 | [s13_peninsula_withdrawal_decision](../s13_peninsula_withdrawal_decision.json) | decision | proposed none |
| S48 | [s13_military_arrests](../s13_military_arrests.json) | notice | union-habeas-and-arrests |
| S48 | [s13_military_arrests_august](../s13_military_arrests_august.json) | notice | union-habeas-and-arrests |
| S49 | [s13_dakota_war](../s13_dakota_war.json) | notice | dakota-war-1862 |
| S50 | [s13_railroad_dispute](../s13_railroad_dispute.json) | notice | union-habeas-and-arrests |
| S51 | [s13_cabinet_remonstrance](../s13_cabinet_remonstrance.json) | notice | proposed none |
| S51 | [s13_cabinet_remonstrance_decision](../s13_cabinet_remonstrance_decision.json) | decision | proposed none |
| S52 | [s13_altoona_governors](../s13_altoona_governors.json) | notice | emancipation-policy |
| S53 | [s13_after_antietam](../s13_after_antietam.json) | notice | proposed none |
| S53 | [s13_after_antietam_decision](../s13_after_antietam_decision.json) | decision | proposed none |
| S53 | [s13_mcclellan_relief](../s13_mcclellan_relief.json) | notice | proposed none |
| S53 | [s13_mcclellan_relief_decision](../s13_mcclellan_relief_decision.json) | decision | proposed none |
| S54 | [s13_buell_east_tennessee](../s13_buell_east_tennessee.json) | notice | proposed none |
| S54 | [s13_buell_east_tennessee_decision](../s13_buell_east_tennessee_decision.json) | decision | proposed none |
| S54 | [s13_buell_relief](../s13_buell_relief.json) | notice | proposed none |
| S54 | [s13_buell_relief_decision](../s13_buell_relief_decision.json) | decision | proposed none |
| S55 | [s13_river_squadron](../s13_river_squadron.json) | notice | proposed none |
| S55 | [s13_river_squadron_decision](../s13_river_squadron_decision.json) | decision | proposed none |
| S55 | [s13_river_transfer_act](../s13_river_transfer_act.json) | notice | proposed none |
| S56 | [s13_bond_agent](../s13_bond_agent.json) | notice | proposed none |
| S57 | [s13_fredericksburg_bridges](../s13_fredericksburg_bridges.json) | notice | proposed none |
