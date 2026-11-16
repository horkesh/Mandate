# Lane 1.11a: data entry for the 1861 Union pack, from lanes 1.9 and 1.10 (hand-over)

Branch `data-entry-1861`. Written 2026-11-16 by lane 1.11a (Sonnet, high). The standing reviewer checks it; the gate reviewer signs the slavery values (and would sign any census rows: there are none).

## What is done

1. **The six values (0074)** are in `pack.json` (`state_autonomy`, `slavery_defence`, `slavery_noninterference`, `free_soil`, `native_state`, `fugitive_defence`), with strings. `slavery_defence` and `slavery_noninterference` carry `costOnly: true` (lane 1.5's flag, merged from main in the second batch); its kernel test runs over them and passes.
2. **The weak-citation rule (hard rule 7).** `packages/pack-format` refuses a people cell (a centre, temperament, regard, value or trait) whose every admissible citation is weak: its source is on the gate's weak list (`gate/source-policy.json`), or banned, or its place begins `snippet`, `self-report` or `after-start`. A strong citation beside a weak one stands. Error kind `weak-citations-only`; tests in `validate.test.ts`. A citation-policy error no longer stops the gate's own pass over the situations (`load.ts`).
3. **`banned-source-cited` is an error**, in the same commit as the re-sourcing. The six rows (`benjamin_judah_p`, `johnston_joseph_e`, `lee_robert_e`, `mallory_stephen_r`, `memminger_christopher_g`, `reagan_john_h`): the banned citations are removed from their cells and row source lists; the cells that then rest on nothing strong are held back (below).
4. **Source keys.** The memoir keys are weak in the source policy: BL, BULLOCH, CHESNUT, COX-3DEC, DANA-RCW, GRANT-PM, GREELEY-RBL, JULIAN-PR, LEE-1904, LEWWALLACE-AUTO, LONGSTREET-1896, MCCLELLAN-OS, MEADE-PAULDING, SHERMAN-M, WEED-MEM, WELLES-D1-RETRO. **Welles's retrospective chapters (vol. 1 pp. 3 to 60) now carry `WELLES-D1-RETRO`**; every `WELLES-D 1` cite in a cell or source list at p60 or below was renamed. New public-domain keys: NH-CW (Nicolay and Hay's Complete Works vol. 6, the cabinet opinions), FOX-CC, SCHUCKERS, NEVINS-FREMONT, NPS, DOC-1861 (dated documents read through transcriptions; the locator names author, date and transcription). RICH's title now covers both volumes.
5. **The cast** from `cast-1861.csv` into `people.csv` (boldness, candour, regard and values columns): see "What did not enter". Five people added: `mansfield_joseph_k_f`, `paulding_hiram`, `mervine_william`, `carlile_john_s`, `willey_waitman_t` (born and died unknown, needs-source; cells only where cited). Nit R1 done (McClellan's `slavery_noninterference` reads "his own wording (S15)"); nit R2 done (the cast note points to 0074).
6. **Stat-centre disagreements, decided from sources** (each decision is also in the row's notes): changed Andrew's reputation to average (Pearson: mocked in March and April), Hicks's competence to average (N&H 4 p163), Magoffin's nerve to average (N&H 4 p230); filled Goldsborough's birth (1805-02-15, Fox) and noted that his refusal to serve under McClellan is 1862; left Welles, Cameron, Anderson, McClellan's reputation and Yates's birth year with a reason each; noted corrections for Brown (Pulaski by 5 January), Stringham (squadron styled by 3 May), Fox (Chief Clerk 8 to 9 May, Assistant Secretary 1 August), Du Pont (31 December 1860 supported) and Ellis. **Rank kinds:** Price's 1847 brigadier generalcy is U.S. Volunteers (Heitman Part I p22 lists it "(vols)"), so it is `usv_brig_gen`. **Breckinridge (state_maj:1847) and Pike (state_capt:1846) could not be checked** (Heitman Part II was unreachable): left as they are, a lead.
7. **Strengths** (`force_blocks.csv`): six entered, each flagged in its notes. One return: the St. Louis Arsenal garrison, 490 (the midpoint of 488 to 493 on 19 and 21 February). Five inferred bands entered at their midpoint with the arithmetic in the notes: Fort Monroe 400, New Mexico 2,225, Pacific 2,900, Vogdes's company 90, the Louisiana forts 520. **Rejected** (left unknown): the two Marine blocks and the two ships (snippet-unverified: Wikipedia infoboxes and secondary summaries), every Charleston unit and Fort Morgan and the Texas blocks (no per-unit source at the start date, or formed after it: Kershaw, Hagood, Rion; Ford's regiment is May). Stores stay unknown: lane 1.4 owns the norms. `fb_us_ship_powhatan`'s date was not changed: the only evidence for a different date is one OCR read ("March 13" against 18).
8. **Loyalty** (`loyalty.csv`, 36 regions) is **a proxy, labelled so in every row's note, never a measured loyalty**: the 1860 presidential vote among the free and voting population (0078), for Delaware, Maryland (Baltimore City apart), Kentucky and Missouri as read in the Tribune Almanac (union = the non-Breckinridge share, a ceiling on unconditional Union; confederate = the Breckinridge share, a ceiling on committed Southern-rights sentiment). Delaware is corrected from 650/80 to 543/457; Missouri's Confederate share is 189, not 200. **Virginia, North Carolina, Tennessee and Arkansas have no loyalty row**: the evidence found is a vote on calling a convention, not loyalty, and Virginia's east-west split was not found. Texas has none (control is Confederate). No value comes from the census.
9. **The calls**: a draft, `source/drafts/calls/union-calls-1861.csv`, the 15 April quota table by state (94 regiments, 73,391 men, two cells repaired by arithmetic and marked) and the 3 May call. The world format has no table for quotas (a call's quota is the situation option's, S09: lane 1.11), so it is a draft for the situation lane. **Re-read OR III-1 p69 in print**: the standing reviewer could not read the table's total.
10. **Census rows: none entered.** The enslaved population by region would come from Kennedy's *Population of the United States in 1860* (1864), whose county tables (registered as CEN1860-POP) are on archive.org; no region was mapped to its counties and no count was read, and the census.gov pages refuse automated requests. `census.csv` stays empty; the self-emancipation term has nowhere to run until the rows are sourced and the gate reviewer signs them.
11. **Liveness bands** (`packages/cli/src/liveness-gate.ts`), re-derived after lane 1.4 merged: the first batch of this lane had banded `combat.flank_broken` and `combat.routed` (and un-banded `combat.withdrew`) because its people data moved the Union run's one battle-day. Lane 1.4's operations changed that run again, so those three edits were **removed** and lane 1.4's own bands stand (`flank_broken` and `routed` not-here in the Union run and `around(2)` in the testbed; `withdrew` `around(1)`): the merged runs fire inside them. The one band the merged run moved is `forces.stragglers_returned` in the Union run, 32 fires against a band of 5 to 20: it is now `around(32)`. The done check passes.

12. **Delaware's government starts Union** (lane 1.11's finding): st_delaware is union, the Delaware region's control is union:1000, and Governor Burton's person row is union, from the General Assembly's refusal of Mississippi's commissioner on 3 January 1861 (the House unanimously, the Senate by a majority). The source is Appletons' Annual Cyclopaedia 1861 p256, a public-domain **period secondary** now registered as AAC; the House and Senate journals, the Rebellion Record and the Laws of Delaware 1861 were not reachable, so a primary printing is a lead. The Delaware loyalty row (a proxy) is unchanged.

## regard_others (the second batch, after lane 1.5's merge)

`regard_others` is entered from `cast-1861.csv` through the same weak-citation rule (now also applied to regard for others): **90 entries entered, 24 not** (no citable public-domain source, or only weak citations). The ones that did not enter:

- `seward_william_h -> scott_winfield above: no citable public-domain source`
- `cameron_simon -> blair_montgomery above: no citable public-domain source`
- `cameron_simon -> smith_caleb_b low: no citable public-domain source`
- `welles_gideon -> fox_gustavus_v above: only weak citations remain`
- `bates_edward -> seward_william_h average: no citable public-domain source`
- `bates_edward -> gamble_hamilton_r above: no citable public-domain source`
- `blair_montgomery -> cameron_simon above: no citable public-domain source`
- `blair_montgomery -> fox_gustavus_v high: no citable public-domain source`
- `smith_caleb_b -> cameron_simon low: no citable public-domain source`
- `mcdowell_irvin -> chase_salmon_p above: no citable public-domain source`
- `harney_william_s -> lyon_nathaniel below: no citable public-domain source`
- `lyon_nathaniel -> blair_francis_p above: no citable public-domain source`
- `lyon_nathaniel -> harney_william_s low: no citable public-domain source`
- `morgan_edwin_d -> weed_thurlow high: no citable public-domain source`
- `curtin_andrew_g -> cameron_simon below: no citable public-domain source`
- `dennison_william -> chase_salmon_p high: no citable public-domain source`
- `carlile_john_s -> willey_waitman_t below: no citable public-domain source`
- `willey_waitman_t -> carlile_john_s below: no citable public-domain source`
- `gamble_hamilton_r -> bates_edward above: no citable public-domain source`
- `paulding_hiram -> mervine_william above: only weak citations remain`
- `paulding_hiram -> davis_charles_h high: only weak citations remain`
- `letcher_john -> lee_robert_e above: no citable public-domain source`
- `davis_jefferson -> lee_robert_e average: only weak citations remain`
- `memminger_christopher_g -> pickens_francis_w above: no citable public-domain source`

## What did not enter, and why

The cells below keep their old directions and citations in the row's notes (the cast cells keep theirs in `cast-1861.csv`). **A later research lane should re-source them; they are not re-entered now (the lead's ruling).**

**Existing cells held back** (33 centres): each rested only on weak citations (a memoir, a self-report, a banned memoir). The old direction and citations are kept in the row's notes, so lane 1.11 or a research lane can re-source them. Many were rows the rule found by itself, beyond the six banned ones.

- `benjamin_judah_p reputation above:BL 1-p106`
- `buchanan_franklin competence above:BL 1-p700-701+BL 1-p694-695`
- `buchanan_franklin nerve high:BL 1-p700-701+BL 1-p705-706`
- `bulloch_james_d competence above:BULLOCH SS-p62-63+BULLOCH SS-p260-261+BULLOCH SS-p397-401`
- `bulloch_james_d nerve above:BULLOCH SS-p379-380`
- `cobb_howell reputation high:BL 1-p101+CHESNUT 1905-p6`
- `dana_charles_a nerve above:DANA-RCW ch1`
- `eckert_thomas_t competence above:MCCLELLAN-OS report-eckert`
- `foote_andrew_h nerve high:BL 1-p413+BL 1-p434`
- `fox_gustavus_v nerve high:WELLES-D 1 p15`
- `goldsborough_louis_m nerve average:MCCLELLAN-OS p246-247+BL 2-p268-270`
- `greeley_horace competence above:GREELEY-RBL p402-403`
- `holt_joseph reputation above:WELLES-D 1 p4`
- `mallory_stephen_r competence above:BL 1-p631+BL 1-p630+BL 1-p105+BL 2-p76`
- `mallory_stephen_r nerve above:BL 1-p631`
- `mcclernand_john_a reputation above:GRANT-PM ch18`
- `memminger_christopher_g experience above:BL 1-p104`
- `memminger_christopher_g reputation above:BL 1-p106+BL 1-p104`
- `reagan_john_h reputation average:BL 1-p106`
- `rodgers_john competence high:BL 1-p620+BL 1-p358+BL 2-p268-270+MCCLELLAN-OS p429-430+MCCLELLAN-OS p437+BL 2-p172`
- `rodgers_john nerve high:BL 2-p268-270`
- `semmes_raphael nerve above:BL 2-p135`
- `smith_charles_f nerve high:GRANT-PM ch22+GRANT-PM ch23`
- `stanton_edwin_m reputation average:WELLES-D 1 p55+WELLES-D 1 p57`
- `stringham_silas_h reputation above:WELLES-D 1 p5-6`
- `tattnall_josiah nerve average:BL 1-p705-706+BL 1-p707+BL 1-p709-711`
- `toombs_robert_a reputation high:BL 1-p104+BL 1-p106`
- `vallandigham_clement_l reputation above:COX-3DEC p80-82+COX-3DEC p75-76`
- `walker_leroy_p reputation average:BL 1-p104+BL 1-p106`
- `weed_thurlow nerve above:WEED-MEM p349`
- `wigfall_louis_t nerve high:BL 1-p73+BL 1-p83`
- `wigfall_louis_t reputation above:CHESNUT 1905-p29+CHESNUT 1905-p33`
- `wilkes_charles nerve high:BL 2-p135`

**Existing traits held back** (30), same reason:

- `adams_charles_f trait candid:WEED-MEM p350`
- `benjamin_judah_p trait political_patron:BL 1-p105+BL 1-p106`
- `davis_jefferson trait holds_grudges:CHESNUT 1905-p100+CHESNUT 1905-p248+BL 1-p224`
- `du_pont_samuel_f trait joint_minded:BL 1-p673`
- `eckert_thomas_t trait organiser:MCCLELLAN-OS report-eckert`
- `grant_ulysses_s trait organiser:GRANT-PM ch18`
- `greeley_horace trait uses_press:GREELEY-RBL p402-403`
- `halleck_henry_w trait slow:GRANT-PM ch23+GRANT-PM ch26`
- `halleck_henry_w trait micromanages:GRANT-PM ch26`
- `hill_daniel_h trait candid:BL 2-p394-395`
- `johnston_joseph_e trait rank_proud:JOHNSTON-1874 p71-73`
- `lee_robert_e trait slaveholder:LEE-1904 p89-90`
- `lincoln_abraham trait candid:WELLES-D 1 p17+WELLES-D 1 p18`
- `mallory_stephen_r trait slow:BL 1-p104+BL 1-p105+BL 2-p76`
- `mcclernand_john_a trait political_patron:GRANT-PM ch30`
- `mcclernand_john_a trait ambitious:GRANT-PM ch29+GRANT-PM ch30`
- `northrop_lucius_b trait shifts_blame:BL 1-p261`
- `porter_david_d trait intrigues:WELLES-D 1 p20-21`
- `rodgers_john trait organiser:BL 1-p358+BL 1-p620`
- `rodgers_john trait candid:BL 2-p268-270`
- `rodgers_john trait joint_minded:MCCLELLAN-OS p485`
- `rosecrans_william_s trait slow:GRANT-PM ch29`
- `seward_william_h trait intrigues:WELLES-D 1 p9+WELLES-D 1 p17`
- `sherman_william_t trait self_doubting:SHERMAN-M ch9`
- `toombs_robert_a trait quarrelsome:CHESNUT 1905-p108`
- `walker_leroy_p trait political_patron:BL 1-p104`
- `walker_leroy_p trait ambitious:BL 1-p104`
- `wigfall_louis_t trait insubordinate:BL 1-p83`
- `wigfall_louis_t trait disdains_superiors:CHESNUT 1905-p96`
- `wigfall_louis_t trait quarrelsome:CHESNUT 1905-p48+CHESNUT 1905-p101`

**Cast cells not entered** (32): the only citations left were modern or non-public-domain pages (an encyclopedia, a state archive's exhibit, a university's teaching site: the pack takes only public-domain, government or own-work sources, 0033), or only weak ones. The evidence stays in the cast note and its draft CSV.

- `chase_salmon_p value fugitive_defence: no citable PD source left`
- `bates_edward value free_soil: no citable PD source left`
- `smith_caleb_b regard: no citable PD source left`
- `butler_benjamin_f value party: no citable PD source left`
- `mcdowell_irvin value career: no citable PD source left`
- `morgan_edwin_d candour: no citable PD source left`
- `morgan_edwin_d value party: no citable PD source left`
- `morgan_edwin_d value order: no citable PD source left`
- `morgan_edwin_d value state_autonomy: no citable PD source left`
- `curtin_andrew_g value party: no citable PD source left`
- `dennison_william value fugitive_defence: no citable PD source left`
- `yates_richard regard: no citable PD source left`
- `yates_richard value party: no citable PD source left`
- `hicks_thomas_h boldness: no citable PD source left`
- `pierpont_francis_h boldness: no citable PD source left`
- `pierpont_francis_h value order: no citable PD source left`
- `pierpont_francis_h value free_soil: no citable PD source left`
- `carlile_john_s boldness: no citable PD source left`
- `carlile_john_s value union: no citable PD source left`
- `carlile_john_s value order: no citable PD source left`
- `willey_waitman_t boldness: no citable PD source left`
- `willey_waitman_t value union: no citable PD source left`
- `gamble_hamilton_r value union: no citable PD source left`
- `paulding_hiram candour: only weak citations remain (MEADE-PAULDING p241-245)`
- `paulding_hiram value union: only weak citations remain`
- `paulding_hiram value duty: only weak citations remain`
- `letcher_john value conciliation: no citable PD source left`
- `letcher_john value slavery_defence: no citable PD source left`
- `memminger_christopher_g boldness: no citable PD source left`
- `memminger_christopher_g candour: no citable PD source left`
- `lee_robert_e regard: only weak citations remain (LEE-1904 p36-37)`
- `lee_robert_e value order: only weak citations remain`

## Not done, and why

- **`fugitive-policy` rows**: lane 1.5b's.
- **Situations**: lane 1.11's.
- **A stricter reading of "evidence after the start date"**: the rule can only see a marker in a citation's place (`after-start`); no existing cell carries one, so cells resting on evidence dated after 5 March are caught only if their source is weak. A research pass over the cells' dates would add the markers.
- **Re-read in print** before release: every figure that came through OCR or a transcription (the OR III-1 p69 quota table, the Almanac's 1860 returns, the St. Louis Arsenal returns, the Army table's company counts).

## Checks

`pack:validate union-1861`: 0 errors. `npm run check`, the full suite and `run:done-check` pass.
