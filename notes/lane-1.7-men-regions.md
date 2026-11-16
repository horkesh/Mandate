# Lane 1.7 hand-over: men and regions

Branch `phase1-men-regions`, from `main` at 2e4655b. Built to FOUNDATION section 12 row 1.7 (0073) and the lead's brief. For the standing reviewer and, for the gated parts, the gate reviewer; then the steward. **The gated parts (the self-emancipation term, arrivals State, the census input) wait on lane 1.8b's register fixes before merging.**

## The answer

Block creation is one proposal applied in one phase, with no second owner. The recruitment phase (`tick/recruitment.ts`, phase 2d) builds one proposal per block. Each owner then applies its own part, writing only its own field:
- `forces` creates the block and its enlistment (`forces/enlistment.ts`, `applyMusters`: a new `create` and `disband` delta);
- `movement` places it at the governor's region (`placeAndRemove`);
- `command` assigns it to the governor's post and clears his levy (`command/levies.ts`, `musterAssignments`).

Disbanding is the same proposal in reverse. The one-writer scanner passes.

`npm run check` passes (993 tests), `npm run run:done-check` gives six PASS, and the liveness gate is re-banded.

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
7. **The term's agency reason type is a pack rule** (`agency:self-emancipation` for Union, `agency:fen-flight` for the testbed), so it is always one of the pack's own register agency types (E3).
8. **The census does not deplete** as people reach the lines. Calibration waits on sources (SENSITIVE-HISTORY 3.2: the figures are UNVERIFIED). The rates are design values, and the Union pack has no census, so no Union run moves.
9. **No `men` stock in `economy`** (1B): a regiment goes straight from the governor into a block.

## Stand-ins and gaps, each labelled

- No rule seat calls for regiments; lane 1.12's rule-seat principals will. Recruitment's mechanics are QUIET in the reference runs, each with its driving test.
- The president's call as a situation (S09) is lane 1.11's. A situation option cannot yet issue a call; it would go through `dispatchOrder` like a goal.
- The term's effect on the holding side's regional capacity and supply waits for an economy (1B). Today the term is derived and its arrivals are State.
- Merging lane 1.3: `blockState` in `forces/enlistment.ts` must take 1.3's new `ForceBlockState` fields (morale, experience, equipment from `startingCondition`, stragglers 0, routed and surrendered null).

## For the gate reviewer

- **Protected ids:** `REACHED_UNION_LINES_FIELD` and `ENSLAVED_POPULATION_INPUT` are spelled exactly as lane 1.8b reserves them. `applyArrivals` refuses any proposal that is not the derived term's. No situation, verb or view reads or writes either.
- **Not a proposal field:** the census id is not exported as a `*_FIELD`, because it is never proposed. Register coverage would otherwise probe it as a proposal field.
- **Testbed register:** the testbed's `fen-flight` topic does not list the kernel's ids among its protected fields.

## Findings outside my scope

1. Union `state_autonomy` is not in the pack's values vocabulary. Lane 1.11's data entry needs it before the call terms can offend it.
2. FOUNDATION section 9 runs recruitment in the weekly step; this lane runs it daily (choice 4). The phase list should say so.
