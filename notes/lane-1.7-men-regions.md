# Lane 1.7 hand-over: men and regions

Branch `phase1-men-regions`, from `main` at 2e4655b, with main merged in after lanes 1.3 and 1.8b landed (no rebase). Built to FOUNDATION section 12 row 1.7 (0073) and the lead's brief. The standing reviewer approved it (`review-lane-1.7.md`); its re-check covers the merge and the fixes below. The gate reviewer reads the gated parts (the self-emancipation term, arrivals State, the census input) against lane 1.8b's merged register.


## S1 final enlistment delivery (2026-11-21)

S1's integration, build and test changes are committed through the real hook; final calibration and closeout are proposed for review under 0106. The complete default eight-seed verification with drafting passes all five non-timing Phase 0 criteria. 1A is 4/6, still unmet for pushback and D6; timing remains S2's. Retain ordinary complyAt 10 as a proposed partial improvement: reservations fall from 101 to 16, still above 9. InitiativeAt stays 150 and every sourced band is unchanged. The eight-comparison budget is spent; there is no ninth run. Final Manassas is McDowell against Beauregard on July 27 and 29, with 90,600/40,000 and 83,156/16,000 men present. These are model outputs.

The default sweep's 0/8 return-best result does not clear D6: its grievance channel is missing and all 24 strict border-levy chains remain unexercised. Transfer and remuster cannot count as a new governor levy. The fourth Charleston source count and Patterson discharge lifecycle remain held. Saunders's correct Union value is now grounded in his Iowa home under 0055, with a read 1880 official directory citation. Only his source metadata changes after the frozen measurement, with full World equivalence proof. No starting-side exception or other cast values were introduced.

All eight public console tests pass, including actual July battle existence and separate chronology. Full sources, per-build tables, exact eight comparisons, verdict/recommendations and preservation evidence are at the top of `lane-1.14-done-check.md`. Older stopping points below are superseded by that delivery. Independent review and signatures remain Claude's; no accepted ruling is recorded here.

## Current S1 enlistment integration (2026-11-21)

R97 and the five requested merges are committed on `sprint/1a`. S1 adds sixteen sourced national volunteer quotas (56 regiments), guarded declared Regular recruiting with three arms and unknown actual men, and a notice-only voluntary whole-unit remuster. `forces` remains the single enlistment writer; renewal preserves original call/source/muster credit and men, with separate optional renewal provenance. No remuster or institutional transfer is a new border governor levy. The Minnesota notice creates nothing when the original call is refused, as in the current history. Aggregate consent/replacement remains a named1B stand-in. Foundation/ownership, schema and conservation/save/refusal regressions accompany it.

Corrected July history: McDowell vs Beauregard at Manassas July27 and29;90,600/40,000 then83,156/16,000 present. National checkpoints pass; the same five pushback criteria remain unmet. Actual Regular requests reach Smith but he objects; fictional positive controls verify that accepted unknown-strength recruiting calls can muster. The legal organization is never reported as men enlisted. Detailed sources, limits, tests, proposed rulings and evidence are in the S1 national section of `lane-1.14-done-check.md`. The fourth Charleston strength remains a source HOLD; independent review remains deferred by0106.

## The answer

Block creation is one proposal applied in one phase, with no second owner. The recruitment phase (`tick/recruitment.ts`, phase 2d) builds one proposal per block. Each owner then applies its own part, writing only its own field:
- `forces` creates the block and its enlistment (`forces/enlistment.ts`, `applyMusters`: a new `create` and `disband` delta);
- `movement` places it at the governor's region (`placeAndRemove`);
- `command` assigns it to the governor's post and clears his levy (`command/levies.ts`, `musterAssignments`).

Disbanding is the same proposal in reverse. The one-writer scanner passes.

`npm run check` passes (1100 tests, after the merge), `npm run run:done-check` gives six PASS, and the liveness gate is re-banded.

## After lane 1.3, and the review's fixes

- **New blocks take lane 1.3's fields:** morale, experience and equipment at the pack's start values (`startingCondition`), no stragglers, never routed or surrendered (`applyMusters` now takes the map).
- **A block whose term ends while a battle it fought in is still open in its region keeps its men** until the battle closes (`inOpenBattle`). A battle in progress never loses a participant. Closed records are history; nothing reads their blocks back from State.
- **`linesForceIn`** counts only blocks with men present that have not surrendered.
- **A levy due in an enemy-held region** (another faction's share there above its side's) does not muster. It waits, re-checked each day (`recruitment.muster_blocked`). Past the pack's `recruitment.musterBlockedDays` it lapses (`recruitment.lapsed`), and the governor reports it to the man who called it: a `levy-lapsed` claim with the token `region_enemy_held`, and a `levy_lapsed` truth term. Both paths are tested.
- **Agency reasons per cause** (pack rules `selfEmancipation.agencyReasons`). Union: `agency:resistance-within-confederacy` (cause 1), `agency:flight-to-union-lines` (cause 2) and `agency:escape-from-impressment`, carried by a third reason when the pack's pressure flags drive the term. Pressure now raises both causes. The testbed uses `agency:fen-flight` for all three, its register's one type. The situation layer refuses an agency reason the gate register does not list.
- **Controls:**
  - the self-governing refusal (S1);
  - the `call_loyalty` label;
  - a census region the lines' side already holds (`n_west_front` in the testbed gets no term);
  - a source scan that only `tick/regions.ts` calls `applyArrivals` and only the term proposes the protected field (`kernel/test/men-regions-scan.test.ts`).
- **G-1.7a (the lead's ruling on the gate review):** holding a region protects no one by itself. The term runs in a census region the lines' side holds, with that region itself as cause 2's destination (its posts and camps there), scaled by known policy, so a policy of return lowers it. It skips a region only while a pack protection flag covers it (`selfEmancipation.protectedFlags`: a flag and its regions, set by R7's and S17's decisions; the testbed's `sanctuary_act` covers its two fronts). No text calls the people counted there free. Cause 1's reason is chosen by the region's government (N10), and each pressure flag has its own agency type (N9). Tests: a held region without the flag gets the term, one with it is skipped, and a return-style flag lowers it.
- **G-1.7b (the gate reviewer's correction, adopted by the lead):** a flag in `selfEmancipation.protectedFlags` skips a region only where slavery has ended there, in law or in fact (the District of Columbia act of April 1862 is the model). A policy that protects people who reach the lines is a policy flag: it raises flight to the lines and never skips a region. The testbed's protection flag is now `fen_bondage_ended` (no decision sets it yet); `sanctuary_act` stays a policy flag, and a test shows it raises the flight and skips nothing.
- **Controls (each guard fails a test when turned off):** `linesForceIn` skipping surrendered and strength-0 blocks; the situation layer's agency-reason check against the register (`pack-format/test/self-emancipation-gate.test.ts`); raised blocks taking the pack's starting condition.
- **The protected ids** match lane 1.8b's merged register exactly: `region_reached_union_lines` and `region_enslaved_population`.

## What is built

| Where | What |
|---|---|
| `forces/enlistment.ts` | `Enlistment` (who raised the block, on whose call, its regiments, muster day and end day), `MusterDelta` (`create`, `disband`), `applyMusters`. A disbanded block's detachments go with it. Kept out of `applyForces`, which lane 1.3 rewrites, to keep the merge small |
| `movement/movement.ts` | `placeAndRemove`: a new block stands still on land at its muster region. A removed ship's passengers stay where it was |
| `command/levies.ts` | `Levy` (a call answered and not yet mustered: regiments, men, term, muster day, the `proxy` response key), `recordLevy`, `leviesDue`, `musterAssignments` |
| `regions/regions.ts` | `regionLoyalty` (each faction's share, permille, from the start; `loyaltyOf` returns null where none is recorded, never a value guessed from control). `regionReachedUnionLines` and `applyArrivals`, the only writer; it accepts only the derived term's proposals. `REACHED_UNION_LINES_FIELD = 'region_reached_union_lines'` and `ENSLAVED_POPULATION_INPUT = 'region_enslaved_population'`, the ids lane 1.8b's register reserves |
| `regions/self-emancipation.ts` | The derived term (0046), pure. Cause 1, resistance and flight within, is keyed to no one's reach: a base rate plus the pressure the pack's flags add. Cause 2, flight to the lines, is scaled by reach (a region the lines' side holds, here or next door, with or without its force there) and by known policy (a base plus the pack's flags). Every number carries the pack's agency reason type. Only cause 2 proposes arrivals |
| `recruitment/rules.ts` | `RecruitmentRules`: call terms, raising post kinds, men per regiment, arm, stores, muster days, share and delay per rung, loyalty scaling, longest term. `SelfEmancipationRules`: lines faction, agency reason, cadence, rates, reach, hold share, policy and pressure flags. Their checks, and `callTerms` |
| `tick/recruitment.ts` | `issueCall` (validation), `arriveCall` (the governor answers by `answerOrder`; `proxy` records it; `command` holds the levy; his answer goes back as a report), `recruitmentPhase` (phase 2d), `regimentsRaised` |
| `tick/regions.ts` | Phase 4a′: the term on its cadence, its proposals applied by `regions` |
| `tick/orders.ts` | `dispatchOrder`, split out of `issueOrder` so a call travels as any order does. A relay reads a call on the call terms |
| `log/`, `messages/transit.ts` | The `call` command (`to`, `regiments`, `termDays`, `route`, `bypass`) and the `call` order kind with `orderCall` |
| World format | `census.csv` (World, optional; protected input) and `loyalty.csv` (scenario, optional). Rules `recruitment` and `selfEmancipation` in every pack. The validator checks references, sums and ranges |
| Testbed | The Shire of Brenmark (a new department kind, `shire`), its governor `n_governor`, the value `home_rule` (Lowmarch's governor holds it), loyalty for nine regions, and a fictional fen-folk census in four southern regions. `sanctuary_act` raises known policy |
| Union pack | Rules only. No census or loyalty rows (lane 1.10 sources them; lane 1.11 enters them). The call terms honour `union` and `duty`; `state_autonomy` is not in the pack's values vocabulary yet, so the call offends nothing until lane 1.11 adds it |
| Tests | `cli/test/men-regions.test.ts` drives the kernel's tick on the testbed: a call answered, a call slow-walked, refusals, a block created, placed and assigned, a ninety-day disbanding, loyalty read and scaling a levy, and arrivals proposed with typed reasons |

## Choices, with what was rejected

1. **One block per answered call, not per regiment.** The block is the kernel's unit; the regiment count rides in its enlistment. *Rejected:* one block per regiment (hundreds of blocks in a Union run).
2. **The levy in hand is `command` State** (the "standing agreements and prior orders on a post" row): an answered call is a prior order on the governor's post. *Rejected:* computing the muster at arrival and creating the block at once (no slow walk); a new owner.
3. **Enlistments are a separate `forces` table** (`forceEnlistments`), not new fields on `ForceBlockState`, which lane 1.3 is changing.
4. **Recruitment runs daily (phase 2d), not in the weekly step** (FOUNDATION section 9's item 7). A muster day and a term's end are particular days (the ninety-day men went home on theirs), and the phase costs nothing on a day with no levy due.
5. **A rung sets the share and the delay; loyalty scales the share.** `refuse` and `object` raise none and send a memorandum. `reinterpret` raises 600‰. *Rejected:* reading loyalty nowhere (loyalty State with no reader), or as a stand-in for control.
6. **A call to a post of a self-governing department is refused** (`not_raising_post`; SENSITIVE-HISTORY 3.7: no seat recruits a nation).
7. **The term's agency reason types are pack rules, per cause** (`selfEmancipation.agencyReasons`), each one of the pack's own register agency types (E3; the situation layer refuses one it does not list). Union: `agency:resistance-within-confederacy` for cause 1 in a region the enslaving side governs, `agency:self-emancipation` for cause 1 elsewhere (a neutral government's, or the lines' side's own), and `agency:flight-to-union-lines` for cause 2. Each pressure flag carries its own type (`agency:escape-from-impressment` for an impressment flag). The testbed uses `agency:fen-flight` throughout.
8. **The census does not deplete** as people reach the lines. Calibration waits on sources (SENSITIVE-HISTORY 3.2: the figures are UNVERIFIED). The rates are design values, and the Union pack has no census, so no Union run moves.
9. **No `men` stock in `economy`** (1B): a regiment goes straight from the governor into a block.

## Stand-ins and gaps, each labelled

- No rule seat calls for regiments; lane 1.12's rule-seat principals will. Recruitment's mechanics are QUIET in the reference runs, each with its driving test.
- The president's call as a situation (S09) is lane 1.11's. A situation option cannot yet issue a call; it would go through `dispatchOrder` like a goal.
- The term's effect on the holding side's regional capacity and supply waits for an economy (1B). Today the term is derived and its arrivals are State.

## For the gate reviewer

- **Protected ids:** `REACHED_UNION_LINES_FIELD` and `ENSLAVED_POPULATION_INPUT` are spelled exactly as lane 1.8b reserves them. `applyArrivals` refuses any proposal that is not the derived term's. No situation, verb or view reads or writes either.
- **Not a proposal field:** the census id is not exported as a `*_FIELD`, because it is never proposed. Register coverage would otherwise probe it as a proposal field.
- **Testbed register:** the testbed's `fen-flight` topic does not list the kernel's ids among its protected fields.

## Findings outside my scope

1. Union `state_autonomy` is not in the pack's values vocabulary. Lane 1.11's data entry needs it before the call terms can offend it.
2. FOUNDATION section 9 runs recruitment in the weekly step; this lane runs it daily (choice 4). The phase list should say so.

## R90: dated calls and state-force transfers (2026-11-20)

For the lead: 3 items. R90 only, on `phase1-calls-1861` at `3cbf71e`. `npm ci` ran first (exit 0, zero vulnerabilities). Read the main checkout's CODEX standing, command-line and writing rules, 0105, the numbers note, both hand-overs and 0065/0066/0096/0099/0104. Git was read-only. Independent review remains with Claude under 0096. Evidence index: `runs/r90/final-checks.json`.

### What is delivered

- `pack.json` carries **60 Confederate and five Union identified requisitions**. A later call to a governor has its own identity; an in-transit call or retained response suppresses only that identity. The 24 authored Union militia orders remain the sole 15 April issuer. The final history issues **89 calls = 65 doctrine + 24 authored**, with no rejection or duplicate scheduled identity.
- The Confederate entries cover 9 March, both April readiness calls, the absolute requisitions of 22 April, the June reserve and separate supplementary requisitions, and the July requisitions. Florida is **1,500 on 8 April and 2,000 on 16 April**. Readiness requests receive the governor's answer but create no levy: Walker expressly forbids muster before an absolute call (OR IV-1 pp. 211, 221–222, 233, 276). No statutory ceiling becomes a second levy.
- State-force entries cover Virginia, North Carolina, Tennessee and Arkansas. They use governor compliance, `command`'s levy, `forces`' creation, `movement`'s placement and `command`'s assignment. Arms survive that path. Unquantified cavalry/artillery bundles retain null strength and null regiment equivalents, contributing no invented men. War service has no fixed expiry. Ordinary calls retain their existing conversion and ninety-day expiry behavior.
- `calls-1861.json` records **20 call, transfer and statutory records**, with dates, terms and source limits. The national **3 May** call records **42,034 volunteers, 22,714 regulars and 18,000 seamen**. The July 22/25 volunteer acts, July 29 regular establishment and July 31 acceptance act are distinguished. The executable Union additions are New York's accepted 38-regiment two-year tender, Indiana's six-regiment 11 June call, and New York's July requisitions. **The national 3 May allocation and central Regular Army/Navy enlistment remain catalogue-only; no absent state quota was invented.**
- A dated public-office wire link represents Cameron–Letcher on **15–16 April**, independently of military control. It closes at an enemy-held endpoint. The historical call arrives on **15 April/day 41**, and the **unchanged signed Virginia situation fires on 17 April/day 43**. No signed item needed alteration.

### Sources and proposed rulings

The delivery cites read primary pages, indexed with hashes in `runs/r90/sources-read.json` (31 cited URL endpoints; related page transcriptions are retained beside them). Main anchors are [OR IV-1 p. 135](https://ehistory.osu.edu/books/official-records/127/0135), [p. 211](https://ehistory.osu.edu/books/official-records/127/0211), [pp. 221–222](https://ehistory.osu.edu/books/official-records/127/0221), [pp. 231–233](https://ehistory.osu.edu/books/official-records/127/0232), [p. 412](https://ehistory.osu.edu/books/official-records/127/0412), [OR III-1 pp. 68–76](https://ehistory.osu.edu/books/official-records/122/0076), [pp. 146/151](https://ehistory.osu.edu/books/official-records/122/0151), [pp. 369/376](https://ehistory.osu.edu/books/official-records/122/0369), [pp. 372–374](https://ehistory.osu.edu/books/official-records/122/0374), and [pp. 380–383](https://ehistory.osu.edu/books/official-records/122/0383).

For transfers: Letcher's proclamation is **6 June**, published **8 June** ([OR I-2 pp. 911–912](https://ehistory.osu.edu/books/official-records/002/0912)); the first read quantitative statement is his **17 June** message, **upward of 40,000** ([OR IV-1 pp. 388–392](https://ehistory.osu.edu/books/official-records/127/0392)). North Carolina's ten war-term regiments and 27 June ordinance are [pp. 397, 402–404](https://ehistory.osu.edu/books/official-records/127/0402). Tennessee's 2 July tender names 22 infantry regiments, two cavalry regiments and ten artillery companies ([p. 417](https://ehistory.osu.edu/books/official-records/127/0417)); its league is [pp. 296–297](https://ehistory.osu.edu/books/official-records/127/0297). Arkansas's consenting transfer articles are dated 15 July ([OR I-3 pp. 609–610](https://ehistory.osu.edu/books/official-records/003/0609)). A tender is not a certificate of completed muster.

Proposed rulings [I], implemented for review:

1. Preserve conditional readiness separately from active muster; reject treating both April totals as troops already in service or adding a statutory maximum as another call.
2. Use only the documented public-wire exchange, without assigning Union control to Richmond or changing Virginia's signed delay; reject false territorial control and an unbounded inference of public wire access.
3. Enter Virginia's 40,000 on the first read quantitative date, 17 June, without back-projecting that count to 6 June. Treat North Carolina's four already-serving twelve-month regiments as three additional equivalents after its separate 22 April requisition, avoiding that explicit overlap. The original individual State enlistment dates are unknown: twelve months from the model muster for the Virginia/Tennessee/Arkansas entries is an **inferred horizon-limited approximation**, not a sourced expiry. Review this limit before accepting the data.
4. Preserve unknown sub-regimental headcounts and war terms instead of inventing full regiments or a fixed war-end date. New York's July entry uses the verified 25 July public proclamation date; the exact earlier presidential requisition date is not established here.

### History, without fitting

| 31 July known men | Baseline | R90 | Unchanged band |
|---|---:|---:|---|
| Union | 18,686 | **62,686**, plus 4 unknown blocks | 95,000–250,000; lower edge non-binding |
| Confederate | 20,957 | **46,457**, plus 17 unknown blocks | 100,000–200,000; **fails** |

The data does **not** reproduce the recorded State transfers in this history: Virginia, North Carolina and Tennessee object. Their value contribution is zero under the unchanged shared call terms (`union`, `duty`); no trait, threshold or call-purpose score was fitted. Arkansas slow-walks, leaving its transfer levies due on **day 155**, beyond July. New York's July levies are also pending at the stop. Exact responses and terms: `runs/r90/transfer-responses.json` and `call-outcomes.json`.

There is **no Confederate force at Manassas or in any graph-adjacent region on any of July's 31 days**, and **no battle there**. The existing doctrine still concentrates at Charleston; R90 does not invent a Manassas command or force a battle. Both scored fought-operation counts remain zero.

Final State: **`bd66d4d23bca3dbc45541a9fd241c43255c81b7947c399eed66931a8c0d24552`**. Replay and day-60 resume match; zero rejections. All **148 daily hashes** match the full done check's independent checked Union slot. The original spatial observer used nonexistent `from/to` edge fields. Its raw evidence is retained; `field-scan.ts` corrects that report using actual `a/b` endpoints in one no-replay, last-hash-only scan, which matches the final State. National-strength and replay/resume evidence were unaffected.

### Gates and preservation

- Exact **`MANDATE_NO_GIT=1 npm run check`: exit 1**, **131 files; 1,473 passed, five failed, three existing skips**, 168.19 seconds. Four failures depend on the unchanged liveness bands. The fifth concentration fixture incorrectly required the later May levy to meet April's march deadline. It now follows the original militia levy and preserves the pre-war Union control; the targeted correction **passes both tests**. No production change followed the suite. Its unaffected evidence is reused with `suite-reuse.diff`; no full-suite rerun or exit-0 claim.
- Focused gates: **112 passed**. Final typecheck, boundary, licences, decisions, generated-pack checks and schema checks **exit 0**. Both generated Worlds and the two changed published schemas are current. The save fixture was regenerated with its tool: **only World hash changes; saved State and log hashes match the original**.
- Full **`npm run run:done-check -- --label r90-done`: exit 1**, default **eight seeds and drafting**. **Phase 0 4/6; 1A 2/6**. Phase 0 fails liveness and budget. War median/p95 **38.09/58.80 ms**; history **40.44/64.48 ms**, so the history median misses **40 ms**. No unloaded or CI claim; no timing retry.
- **Nine liveness breaches** remain: stores-low 29 (1–5), arrivals 260 (61–246), answers 54 (9–38), calls 89 (15–62), musters 39 (9–38), refusals 35 (6–24), slow walks 50 (7–30), attention 96 (14–58), and seven pre-war calls (0–0). **No numeric band changes.** All **30 changed measured rows**, including magnitude-only differences, retain before/after values and direct or explicitly inferred causes in `runs/r90/band-reconciliation.json`. Six changed situation dates are in `situation-date-changes.json`.
- **1A still fails checkpoints, operation, pushback and lever sweep.** Checkpoints retain Missouri neutral, the empty western-Virginia checkpoint department list, Confederate strength below 100,000 and both fought-operation floors. The supplied head has not received R85's two accepted data corrections; R90 leaves them for integration. Pushback misses relay holds, filter holds and trims, with **75 reservations** and **17 slow walks** above their upper limits. Stand-ins and unknown strength pass as scored. The full sweep weighs eight decisions over eight seeds, **712 base-run calls**; return is best in **0/8**, but all **24 policy moves** still lack a new border levy and the grievance channel is unmeasured. This is **not D6 clearance**.
- Code inventory, runtime and preservation checks preceded this closeout. HEAD remains `3cbf71e`; staged diff is empty; imports resolve locally. All **65 situation/gate files**, both band files, lockfiles and the worktree's CODEX are preserved; men per regiment remains **1,000**. No build, server, browser, Git mutation or other-worktree write. Final inventory is indexed in `runs/r90/final-checks.json`.

For the lead:

1. Review the data, the wire-access representation and the labelled source/term inferences under 0096; this is not acceptance or a gate signature.
2. Retain the failed strength/transfer result and the missing national allocation/central enlistment path. Decide the call-purpose/compliance follow-up from the record, rather than lowering a shared threshold to hit the manpower band.
3. Route the missing Manassas field establishment and keep the failed liveness, timing and 1A gates binding through integration. The second calibration budget opens only under 0105's condition.

## Findings outside my scope

1. **Lead / 1.12 and calibration:** shared call terms and the governors' responses prevent the sourced transfers from mustering in the history. The later July New York levies are pending. No compliance or initiative calibration was undertaken.
2. **Lead / 1.12:** Charleston remains the concentration destination; no Confederate field establishment appears near Manassas. No battle was scripted. R91's bombardment record and R92's threshold/filter work were not undertaken.
3. **Lead / steward and 1.14:** integrate the accepted R85 corrections and retain all failed gates, including the measured 40.44 ms history median. No band may be treated as waived by these passing focused checks.

## R96: R90's liveness bands recentred (2026-11-20)

For the lead: 2 items. R96 only, retaining `phase1-calls-1861` at `3cbf71e` and R90's uncommitted implementation. Read CODEX's standing, command-line and writing rules and the R96 ruling. Evidence: `runs/r96/final-checks.json`. Git was read-only; independent review remains with Claude under 0096. Proposed rulings: none.

### Bands and causes

Only the nine breached liveness bands changed. Each calls the existing, unchanged `around(n)` function: `max(1, floor(n / 2))` through `max(n * 2, n + 3)`. Each carries its cause in `why`. `runs/r96/band-reconciliation.json` records the observed count, old bounds, new bounds and cause; its verifier confirms every other band is unchanged. Historical checkpoint, strength and pushback bands are preserved.

| Mechanic (148-day history unless stated) | Observed centre | Old bounds | New bounds | Cause |
|---|---:|---:|---:|---|
| `forces.stores_low` | 29 | 1–5 | 14–58 | [I] More blocks raised by the sourced calls consume stores while concentrating. |
| `movement.arrived` | 260 | 61–246 | 130–520 | [I] Additional levies and answered transfers produce more joining marches. |
| `recruitment.called` | 89 | 15–62 | 44–178 | 65 identified doctrine requisitions plus the unchanged 24 authored calls replace 31 calls. |
| `recruitment.answered` | 54 | 9–38 | 27–108 | More calls reach governors; readiness requests receive answers without muster. |
| `recruitment.slow_walked` | 50 | 7–30 | 25–100 | More calls take the existing delayed-response path. |
| `recruitment.refused` | 35 | 6–24 | 17–70 | More calls are refused under unchanged compliance rules. |
| `recruitment.mustered` | 39 | 9–38 | 19–78 | Additional absolute requisitions and transfer entries produce 39 musters, four of unknown strength. |
| `seats.attention_spent` | 96 | 14–58 | 48–192 | Additional priced calls and transfers consume attention at unchanged prices. |
| `recruitment.called`, 30-day pre-war exercise | 7 | 0–0 | 3–14 | The sourced 9 March provisional-force requisitions precede the war decisions. |

The [I] causes are retained downstream explanations from R90, not new isolated counterfactual measurements. No threshold, delay, movement rule, stores rule or price changed. The 50 recruitment slow-walk firings are distinct from the 17 slow walks scored by the pushback checkpoint.

### Verification and evidence reuse

- Exact **`MANDATE_NO_GIT=1 npm run check`: exit 0**, **131 files, 1,478 passed / three existing skips**, **166.05 seconds**. Typecheck, boundary, licences and decision index all pass. Logs: `check-final.log` and `check-final-exit.json` under `runs/r96/`.
- The first exact check passed all 1,478 tests but stopped at the boundary scanner: R90's concentration-fixture comment used a prohibited setting term. Replaced only that word with setting-neutral wording. The fixture's executable code, original militia selection and assertions remain unchanged. Boundary, licences and decisions then passed cheaply before the required exact rerun. Both check logs are retained. The initial cheap preflight passed eight selected band-table/concentration tests; nine unselected tests in that preflight were excluded by its name filter.
- Full **`npm run run:done-check -- --label r96-done`: exit 0**, **1,098.34 seconds**, with default **eight seeds and drafting**. **Phase 0 6/6; 1A 2/6**. The default command binds Phase 0; its exit 0 does not certify 1A. No timing retry or parameter search.
- Union reference median/p95 **29.00/44.39 ms**; Union history **29.86/45.35 ms**; testbed **2.38/3.51 ms**. These fit the unchanged **40/160 ms** limits locally. CI's Linux run decides the budget; no unloaded-host, CI-green or causal performance claim is made.
- Every deterministic summary field matches R90, including **148 Union / 120 testbed daily hashes and daily telemetry rows**, aggregate liveness, checkpoints, World hash, replay and resume; zero rejections. Union final State remains **`bd66d4d23bca3dbc45541a9fd241c43255c81b7947c399eed66931a8c0d24552`**. R90's unchanged source catalogue, call outcomes, strength explanations and spatial scan are reused, rather than repeated.
- Runtime resolution, source inventory and preservation checks completed before this closeout. All three workspace packages resolve inside this worktree. The R96 delta is limited to the liveness table, the fixture comment and this hand-over; the other **1,651 baseline files**, all five captured worktree Git metadata files, HEAD and staged content remain unchanged. No build, server, browser, install or other-worktree write. The only main-checkout write is the required single CODEX status appended after reading it fresh.

### Remaining criteria and hand-off

1A still fails **checkpoints, operation, pushback and lever sweep**, for the same 13 reported problems: Missouri remains neutral; western Virginia's checkpoint has no government; Confederate known strength is 46,457 against the binding 100,000 floor; both sides fight zero planned operations; no operation writes a battle record; relay holds, filter holds and trims miss their floors; reservations 75 and slow walks 17 exceed their ceilings; the sweep's grievance channel is unmeasured and all 24 watched policy moves lack a new border levy. The eight-seed sweep makes 712 base-run calls; return is best in 0/8, which supplies no D6 clearance. Union known men remain 62,686 against 95,000–250,000 with the lower edge non-binding. No criterion or bound is waived.

For the lead:

1. Review and commit R90/R96 under 0096, including R90's still-labelled source/term inferences. The corrected fixture is retained and the exact check now passes.
2. Start R97 and R98 only after that commit, as ruled. Their transfer/concentration changes and the already accepted R85/R94 and other branches' changes have not been imported here.

## Findings outside my scope

1. State-force transfers still pass through governor compliance on this head; their replacement by the states' own dated acts belongs to R97. Northern Virginia's Confederate concentration belongs to R98. No battle is forced here.
2. Retain the four failed 1A categories with their existing owners and integrate the accepted checkpoint/other-lane fixes separately. CI budget confirmation remains required despite the passing local measurement.


## R97: state forces enter by their states’ own acts (2026-11-20)

R97 only, in `C:/Pyrrhic/mandate-transfers-1861`, `phase1-transfers-1861`, from the lead’s R90/R96 commit `4f6e8b3`. `npm ci` ran first: exit 0, 51 packages, zero vulnerabilities. Git was read-only. R98’s worktree and concentration changes were not touched or imported. Claude’s independent review remains pending under 0096. Evidence: `runs/r97/final-checks.json`.

### Where it stopped

Seven notices replace eleven transfer requisitions. Each state act waits on its own secession flag as well as its sourced date. Four transfers create eleven aggregate contingents through the existing `forces`, `movement` and `command` owners in phase 4c, after command’s side proposals. A vacant governorship cannot veto a state’s act. Ordinary calls still travel, cost attention and receive the governor’s own compliance. No values, thresholds, prices, rates, military-control assignments or concentration instructions were fitted.

Virginia enters with unknown strength on 6 June. Its 17 June return fills the same block. Tennessee’s resolution enters unknown contingents on 29 June; the 2 July tender fills their quantities. A later return preserves location, assignment, condition, entry and expiry, and cannot recreate a contingent that has left play. Situation records provide that last guard; no second identity ledger was added.

### The read record and gate placement

Live Ohio State endpoints returned 403. Read the retained primary-page extracts from R90 instead, and copied them into this worktree’s ignored `runs/r97/sources/`. `sources-read.json` identifies each of the fifteen read pages, its URL, original path and SHA-256; `source-index.json` retains the live-access failures. No claim of a fresh online reading or complete-volume reading.

| Notice | Recorded date | Fired in this history | Read source |
|---|---|---|---|
| Virginia’s proclamation | 6 June | day 93, 6 June | OR I-2 pp. [911](https://ehistory.osu.edu/books/official-records/002/0911)–[912](https://ehistory.osu.edu/books/official-records/002/0912), proclamation dated 6 June, published in General Orders 25 on 8 June |
| Virginia’s quantitative return | 17 June | day 104, 17 June | OR IV-1 p. [388](https://ehistory.osu.edu/books/official-records/127/0388), message’s date; p. [392](https://ehistory.osu.edu/books/official-records/127/0392), summary item 2, upward of 40,000 volunteers |
| North Carolina’s ordinance | 27 June | day 114, 27 June | OR IV-1 pp. [396–397](https://ehistory.osu.edu/books/official-records/127/0397), ten war-term regiments; pp. [402](https://ehistory.osu.edu/books/official-records/127/0402)–[404](https://ehistory.osu.edu/books/official-records/127/0404), transfer ordinance, four already-serving twelve-month regiments and 2,000 accepted |
| Tennessee’s military league | 7 May | day 66, 10 May: secession cause first present | OR IV-1 pp. [296–297](https://ehistory.osu.edu/books/official-records/127/0297), agreement subject to both governments’ ratification; authority only, no duplicate numerical entry |
| Tennessee’s legislative resolution | 29 June | day 116, 29 June | OR IV-1 p. [411](https://ehistory.osu.edu/books/official-records/127/0411), resolution authorizing placement at Confederate disposal |
| Tennessee’s tender | 2 July | day 119, 2 July | OR IV-1 p. [417](https://ehistory.osu.edu/books/official-records/127/0417), 22 infantry regiments, two cavalry regiments, ten artillery companies; incomplete field batteries |
| Arkansas’s articles | 15 July | day 132, 15 July | OR I-3 pp. [609](https://ehistory.osu.edu/books/official-records/003/0609)–[610](https://ehistory.osu.edu/books/official-records/003/0610), consenting troops, seven infantry regiments, one cavalry regiment, one cavalry battalion, five artillery companies, existing enlistments and clothing obligation |

All seven carry an explicit `gate.none` reason: administrative military service only, with no motive, secession-cause claim, slavery policy, security order, civilian conduct or protected-population effect. No gated topic was placed in text or effect, no draft required, and no signature written. Existing signed material is preserved. Placement remains subject to the independent reviewer; a gate concern goes to the gate reviewer rather than being self-signed.

### Proposed rulings and limits [I]

1. **Aggregate entry for forces not separately represented before transfer.** Use the existing block, placement and assignment owners at the state government’s seat, with existing recruitment stores and condition rules, then ordinary transfers and joins. This is an administrative approximation, not sourced field disposition. Virginia keeps the single default-arm infantry aggregate from R90; the read total has no arm breakdown, so this is not a claim that all its volunteers were infantry. Reject another governor-compliance request, a new economy stock, invented field posts or a forced battle.
2. **Separate act from quantity.** Virginia’s later 40,000 is not back-projected to 6 June. Tennessee’s tender is not a certificate of completed muster on 29 June or 2 July. Later quantities fill the same contingents. Regimental men use the unchanged 1,000-men norm [I], not exact reported headcounts. Sub-regimental headcounts remain null. Reject duplicate numerical transfers in May and July or fresh blocks for the same later returns.
3. **Preserve uncertainty about original expiries.** The former twelve-month-from-model-muster approximation is removed for these institutional entries. `enlEndsDay: null` with `enlTermUnknown: true` means an unread original expiry, distinct from North Carolina’s known war service. No new twelve-month term starts at transfer. The governor recorded at entry is bookkeeping, nullable during a vacancy, not an assertion that he personally raised every regiment. Original individual dates and expiries remain for research beyond this horizon.
4. **Credit the included North Carolina requisition dynamically.** Its four already-serving regiment equivalents credit surviving men or pending levies linked to the April requisition, using durable `enlCallId` after response pruning. This history’s April answer is `object`, so the credited amount is zero and all four equivalents enter. Reject the old fixed subtraction of one merely requested regiment. Other earlier calls have no read regiment-to-regiment crosswalk; no such identity was invented.

The navy, staff, property and August discharge provisions remain cited/catalogued where numerical units or later-horizon execution are absent. No ships, ordnance staff strengths, field batteries or later August discharges were invented.

### History, strength and unchanged bands

The 148-day history has zero command rejections and zero refused institutional proposals. Replay, day-60 resume and saved-log replay match. Final State: `9c9d7bbacbfd203638e9365d5966674218bac14b7acaf07cf45a1948e3ffdabf`. The correction scan matches all 148 daily State hashes and all liveness rows. A focused post-entry save round-trip preserves the new source-act and unknown-term fields and resumes identically.

| 31 July men | R90/R96 retained evidence | R97 | Unchanged band |
|---|---|---|---|
| Union | 62,686 known + four unknown blocks | 62,686 known + four unknown blocks | 95,000–250,000; below the non-binding floor, not fitted |
| Confederate | 46,457 known + 17 unknown blocks | 134,457 known + 20 unknown blocks | 100,000–200,000; inside both binding edges |

The 88,000 additional known men are source-described contingents represented by the unchanged regimental norm or Virginia’s lower represented 40,000; they are model quantities, not an exact return of all men present. Calls fall from 89 to 78; seven removed objected entries and four removed delayed entries account for the call-response deltas. Normal muster counters do not count institutional entries as new governor musters; the notice proposals and State records carry their separate trail.

**No numerical band changed.** Twenty-nine measured rows move (including magnitude-only changes); all old/new values, unchanged bounds and direct or labelled inferred causes are in `band-reconciliation.json`. Five existing liveness bands are breached:

| Mechanic | Observed | Unchanged bounds |
|---|---:|---:|
| `combat.occupation` | 50 | 9–36 |
| `control.changed` | 52 | 10–40 |
| `control.threshold_crossed` | 24 | 5–20 |
| `movement.joined` | 35 | 8–34 |
| `movement.leg_started` | 199 | 49–196 |

[I] Additional contingents press control at their seats and during ordinary joining marches. No isolated counterfactual was run for downstream effects. Recentring needs the lead’s ruling; no other passing check waives these breaches.

### Verification and retained failures

- Exact `MANDATE_NO_GIT=1 npm run check`: exit **1**, 1,499 passed / three failed / three existing skips, 182.27 s total (Vitest 169.02 s). All three failures are assertions over the five liveness breaches above. The chain stops before boundary/licence/decision checks; those were run separately and pass.
- After the single lost-contingent correction: **85 focused tests pass**, final typecheck passes, and all 148 normal-history hashes/liveness rows match. Reuse the unaffected full-suite evidence; no full-suite rerun or exit-0 claim. Generated pack/schema freshness, boundary, licences, decisions and whitespace checks pass.
- The first default done-check attempt was stopped after a cheap test reproduced a later return recreating a departed contingent (299.66 s, interrupted exit -1). Its partial summaries/saves and log are retained; it is not a completed result. The six-line guard was verified cheaply before the final attempt.
- One completed default eight-seed done check with drafting: exit **1**, **1216.77 s**. Its criteria:

  - PASS  [behaviour] rule seats giving goals, whose commanders draft and execute plans, move divisions, change control through battles and occupation (a battle-day or an occupation, and a control change), and derive fronts, pockets and supply
  - PASS  [hash] the same state hash on every run, with State frozen or not (Linux against Windows is the CI determinism job, over the summaries this writes)
  - PASS  [resume] a mid-run save, loaded, resumes to the continuous run’s final hash, and the log replays to every hash
  - FAIL  [liveness] every Phase 0 mechanic is inside its band in the reference runs, or quiet for a stated reason
  - PASS  [section-ten] the tests named in FOUNDATION section 10 are present and none is skipped (that they pass is the suite’s)
  - PASS  [budget] the day's cost stays inside the 40 ms tick budget (median), and its slowest days inside 4 times it (p95), measured with the planner, people and situations running (1A)
  - FAIL  [checkpoints] the history run reaches its last checkpoint with each side at war by its own decision (no --at-war), and every checkpoint falls inside its sourced band: states seceded, the sides of the governments that could change, Washington held, men under arms, planned operations fought
  - FAIL  [operation] at least one operation drafted by the kernel planner, chosen by its commander’s seat, approved, executed and fought with the battle model, with a breakdown
  - FAIL  [pushback] pushback fires inside its bands: lower bounds from the record’s sourced cases (S01–S21), upper bounds the lead’s
  - PASS  [unknown-strength] no block fights with unknown strength: every battle record, in every run, lists none unknown
  - PASS  [stand-ins] the eight stand-ins Phase 0 labelled are gone, and any stand-in left in the code is labelled and owned by a 1B lane
  - FAIL  [lever-sweep] the lever sweep (D6): no watched option, nor an atrocity-class decision’s inaction, is the victory-only bot’s best choice in more than a quarter of the seeds; no floor goes unpaid; recruitment is active

Local timing, retained without a retry:

- union-1861, war by decision, 148 days: median 34.23 ms, p95 57.51 ms, max 75.97 ms over 148 days (plans.drafted 2, ladder.moved 10, situations.fired 61)
- testbed, 120 days: median 3.75 ms, p95 5.15 ms, max 6.85 ms over 120 days (plans.drafted 3, ladder.moved 6, situations.fired 6)
- union-1861 history run, 148 days to 1861-07-31: median 34.02 ms, p95 51.58 ms, max 67.16 ms over 148 days (plans.drafted 2, ladder.moved 10, situations.fired 61)
- union-1861, war by decision, 148 days: median 34.23 ms, p95 57.51 ms, max 75.97 ms over 148 days
- testbed, 120 days: median 3.75 ms, p95 5.15 ms, max 6.85 ms over 120 days
- union-1861 history run, 148 days to 1861-07-31: median 34.02 ms, p95 51.58 ms, max 67.16 ms over 148 days
- one day of all 23 drafts back to back: median 37.3 ms, p95 46.4 ms, worst 49.4 ms over 20 days; slowest single draft 11.5 ms; a capped day (the pack's 3 slowest drafts for each of 2 sides, together) at worst 28.7 ms

Linux CI decides the budget; no unloaded-host, causal-performance or CI claim. All failure reasons, including the unchanged 1A failures and sweep limitations, remain in `done-final.log` and `done-result.json`. No D6 clearance or acceptance-criterion waiver.

### Preservation and hand-off

Final runtime inputs, artifact inventory and preservation checks completed before this documentation. `runtime-final.json` verifies all 570 runtime inputs, 4 captured Git metadata files and fifteen page copies. `pre-closeout-audit.json` preserves all 117 baseline protected inputs, including signed notices, gate files, source tables, checkpoints, liveness bounds, lockfiles and saves. The Union doctrine and every remaining call are unchanged as data; Confederate concentration and other doctrine fields are preserved. No build, server, browser, commit, stage or other-worktree write.

For Claude: (1) review the implementation, source pages, gate-none placement and labelled representation/expiry choices under 0096; (2) rule on the five liveness breaches and keep the remaining milestone failures binding through integration. R97’s calls-array edit must meet R98’s separate concentration edits without dropping either.

### Findings outside my scope

- R98 owns northern Virginia’s concentration, appointments and whether forces meet; its worktree was not touched.
- The inherited Missouri/western-Virginia checkpoint gaps and the operation/pushback/sweep failures retain their existing owners; the complete final problem list is `done-result.json`.
- Original State enlistment expiries, absent naval unit descriptions and any unsourced crosswalk to other already represented calls remain research/data limits. No quota, expiry, unit or new field disposition was invented to fill them.

## S1: R97 integrated with northern concentration and resignation (2026-11-20)

Imported R97 here on `sprint/1a`, retaining R98's separate command/concentration work and main's resignation owner. Four focused files / 28 tests, typecheck, generation and boundary pass. The initial 148-day integrated probe has zero rejections: Confederate known men 130,862, Union 58,497, all sourced checkpoints passing. An emerged Manassas field battle runs 27-29 July: Stone/Beauregard start 45,600/40,000, and the last day reads 43,175/54,144. These are model outputs. No battle participant has unknown strength. The five requested mechanical rows now centre on occupation 102, control changes 105, threshold crossings 40, joins 40 and legs 240; all 43 changed counts receive the same helper and a cause. The retained-row rescore has no breaches. The full hook/default done check remain the next required gates; no historical/pushback band or D6 criterion is waived. Integration evidence and further S1 work are tracked in `notes/lane-1.14-done-check.md`, S1.

### Findings outside my scope

The missing complete national allocation, Regular recruitment and sourced opening strength remain S1's next build work. The prior R97 source/expiry limits remain explicit. Independent review and all gate signatures remain with Claude after the sprint.

## Findings outside my scope

1A remains unmet; see the S1 final verdict in `lane-1.14-done-check.md`. The lead owns deferred review/rulings and unavailable review-ID reconciliation. S2 owns the integrated timing problem;1 Bowns grievance consequences and individual service/consent. The fourth Charleston strength, discharge lifecycle, filter-role source and strict new-border-levy chain remain bounded follow-ups. No other lane's files or branch was written.
