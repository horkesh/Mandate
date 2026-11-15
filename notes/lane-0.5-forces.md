# Lane 0.5 hand-over: forces, command, movement, infrastructure and the control contest

Branch `phase0-forces` (worktree `.claude/worktrees/phase0-forces`), on top of b58e244 (main after decision 0061). Built to FOUNDATION section 12, row 0.5, on lane 0.2's World (0050), lane 0.4's control and supply (0054), lane 0.6's copy-on-write State (0052), lane 0.7's situations (0057) and the 0058 format fields (0061). The seats layer now runs on the v2 World; the stand-in comms World is gone.

## What is built, and where

| Piece | Where |
|---|---|
| **Forces** as State (`forceBlockStates`): strength, stores in milli-days, non-combatants, department, arm, detachments; written only by `forces` through typed `ForceDelta`s | `packages/kernel/src/forces/forces.ts` |
| **Stores on hand**: eaten daily, refilled through `allocateInPriorityOrder`, falling in a pocket; crossing the low threshold is a truth event | `packages/kernel/src/forces/stores.ts` |
| **Command** as State (`postStates`, `forceAssignments`, and lane 0.7's `regionGovernments`, `closedGovernments`): holders, chain, departments, temporary posts, links, scheduled department changes, standing orders, intelligence chiefs; transfers that name a force; neutral ground and government closing; the proposals `command` owns | `packages/kernel/src/command/command.ts` |
| **Movement** (`forceLocations`): a block's region or ship, and the leg it is on; marching over typed edges with seasons, conditions, obstructions and neutral passage; retreats | `packages/kernel/src/movement/movement.ts`, `march.ts` |
| **Infrastructure** as State (`infraEdgeCondition`, `infraDepotCondition`, `infraObstructions`), changed by typed deltas; `networkOf` feeds the supply derivation | `packages/kernel/src/infrastructure/infrastructure.ts` |
| **The control contest and occupation** (pure; proposals only) | `packages/kernel/src/combat/contest.ts` |
| **The seats World** (replaces `standin/world.ts`): v2 map and start, 0058's trait stand-in, courier days from edges, latency on the day's control index | `packages/kernel/src/seats/world.ts` |
| **Posts as the seats layer reads them**: field posts, command strength, headquarters, filter post, offices | `packages/kernel/src/seats/posts.ts` |
| **Tick phases**: movement (3), contest (3b), stores (4a), command's proposals (4c); passage and the shared pocket diff | `tick/standing.ts`, `tick/forces.ts`, `tick/passage.ts`, `tick/tick.ts` |
| Tests | kernel `forces-command`, `infrastructure`, `march`, `stores`, `contest`, `governments`; `packs/testbed/test/forces.test.ts`; `packs/union-1861/test/passage.test.ts`; every seats-layer test on the rebuilt v2 fixture (`test/support/seats-fixture.ts`) |

Deleted: `standin/world.ts`, `standin/from-scenario.ts`, `movement/headquarters.ts`, the stand-in `headquarters` State field, `test/support/comms-fixture.ts`. `standin/traits.ts` stays until the Phase 1 people recast (0058).

The save fixture was regenerated after every change of State's shape (`npx tsx tools/make-save-fixture.ts`), as 0052 allows before a public build.

## Done check

- `npm run check`: 704 passed, 2 todo. CI green on both machines with matching hashes on every push (last checked on the step 3 commit, run 43650964737).
- M2 tests and the testbed seats run pass. On the testbed, 120 days: rule seats order advances, 7 legs, 2 objectives reached, 14 contests, 2 retreats, a pocket closed, 0 rejections, replay matches.
- **On union-1861 at 5 March 1861** Washington is supplied (not in a pocket); Maryland's five regions are open neutral ground; a Union force from Harrisburg reaches Washington by rail through York, Baltimore County and Southern Maryland (`packs/union-1861/test/passage.test.ts`, with closing Maryland as the positive control). The seats runner plays 75 days with no errors and replay and resume matching; CI now runs it on both machines.
- Tests show a march along a road and along rail with a river season closing an edge (`march.test.ts`); neutral passage open and closed, with a situation closing it end to end through the tick (`governments.test.ts`); a pocket forming when a force cuts a line and lifting when it is relieved (`contest.test.ts`); stores falling in a pocket (`stores.test.ts`). Each step has positive controls.
- Performance: union-1861 runs at 26.8 ms a day on the reference machine (84 blocks, 135 posts, 264 regions), seats asked, tick and a full state hash included, inside the 40 ms tick budget.

## Choices, with what was rejected (for a decision record)

1. **Three writers, three fields for a force block.** `forces` owns what a block is and has, `movement` where it stands, `command` who commands it. *Rejected:* one block record with three writers (breaks one writer per field); location owned by `forces` (FOUNDATION names `movement` the only writer of location).
2. **Stores in milli-days**, so a part-day's delivery never rounds away (0002). Unknown strength or stores stay unknown: never guessed, listed in every sum. *Rejected:* whole days; a default strength for unknown blocks.
3. **Transfers name a force** (0033): a number of blocks, men (whole blocks), or a corps that moves as a bundle by changing its parent. The sender gives his weakest first, by known strength, unknown last: a labelled stand-in for Phase 1's compliance. Detachments go with their block. *Rejected:* naming blocks one by one (0033's reassignment trap); splitting blocks to hit a number of men exactly.
4. **Temporary posts dissolve with their operation** (0040): blocks go to the nearest surviving post up the chain, sub-posts move up. *Rejected:* leaving orphaned blocks with no post.
5. **A leg is one edge, at supply's own edge leg** (season and condition applied), so armies and supply see one network. A leg begun is finished. *Rejected:* a separate movement cost table (two models of one road); recalling men mid-leg when an edge is cut behind them.
6. **An edge carries a march only at one whole unit of capacity this month** (now the pack's `WorldRules.movement.marchMinCapacityPermille`, branch `phase0-pack-rules`). The data's seasons never reduce capacity to zero, so this is what makes low water or ice close a capacity-1 river (192 such edges in the Union pack). A design parameter in the kernel, not yet a pack rule. *Rejected:* closing only at zero capacity (no season would ever close an edge).
7. **Who may use what.** Land troops use roads and rails; ships use water edges; troops aboard move with their ship. Rail needs both ends traced or open neutral ground (0019). Land troops may enter enemy ground (that is how ground is contested) and ground of unknown government, but not a neutral government's closed territory; nobody enters an off-map box. *Rejected:* barring untraced ground to movement (no army could ever advance into enemy territory). Note for the lead: 0061 says the Eastern Shore (unknown government) is closed to every side; it is for supply, but troops may still march into it.
8. **Neutral passage as `NetworkConditions.neutralGround`** (region → open or closed), built from `command`'s governments (0058, 0061). Supply passes open neutral ground; an origin there supplies nobody. Movement is barred only from closed neutral ground. *Rejected:* the interim stand-in that opened every uncontrolled region (0058 rejects it; it opened the Indian Territory); a separate passage input to every derivation.
9. **Situations close a government through `command`'s proposals** (`government_closed`, delta above 0 closes, below 0 reopens), applied in phase 4c right after the situations phase. That phase reports the pockets the closing makes and hands back the day's map as it now is. *Rejected:* waiting for tomorrow's map phase (the barrier compared a stale map: found by the deep checks); moving situations before the map (0057 puts them after control).
10. **Only troops that marched in press for ground.** Blocks where the start put them hold but take nothing. Found on union-1861: federal troops still in Texas on 5 March 1861 took the Confederacy's Texas back at 100‰ a day. *Rejected:* every block pressing from day 1.
11. **Neutral ground is passed, never taken by arms** (0055; review S1, the lead's ruling): where no side holds a share in a neutral government's region, open or closed, neither occupation nor a clash changes control, and nobody is driven out; a situation decides that ground (Kentucky, September 1861). Ground of unknown government with no shares is occupied and contested as usual. *Rejected:* refusing occupation of all ground nobody holds (it froze the Indian Territory as well); letting a clash on Maryland ground move control.
12. **Occupation scales with men** (full rate, 100‰ a day, at 5,000; in proportion below). Found on union-1861: 600 militiamen took Georgia regions one after another. **The contest** gives the stronger side 200‰ times its margin a day; a tie changes nothing; no losses (battles are Phase 1). **Retreat** below the pack's threshold goes to the neighbour where the side holds most at or above it, or nowhere. Every rate is a design parameter. *Rejected:* a flat occupation rate; losses in the contest.
13. **Courier days derive from typed edges**: a third of a division's days, rounded up, at least one (a design parameter). Wire latency reads the day's control index. *Rejected:* courier at division speed; a fixed wire table.
14. **Field posts are posts that command a force block.** Headquarters are where a post's strongest block stands, else its seat, else its side's capital. A commander's menu offers the first legs of quickest routes toward his goal; his marching group is his blocks (not detachments) at headquarters, ships alone if all are ships. *Rejected:* a stored headquarters (a second truth beside the blocks); classifying posts by pack kind names (hard rule 3).
15. **`SeatsWorld` carries the start it was indexed with**, and `createState(world, { seed })` begins from it. *Rejected:* passing the start twice (one World, two starts possible).
16. **Steps 4 and 5 share one commit**: their tick wiring is one file.

## Stand-ins, labelled in code

| Stand-in | Replaced by |
|---|---|
| `standin/traits.ts` fed by 0058's adapter (boldness from `nerve`, regard 0, values empty) | Phase 1's people recast |
| Weakest-first choice of blocks in a transfer | Phase 1's compliance |
| Standing goals (hold, or advance to a region) driving movement | Lane 0.9's planner and Phase 1's plans |
| The simple contest and occupation (no losses) | Phase 1 combat |
| Ships and troops afloat neither eat nor draw stores | Phase 1 sea deliveries |

## For later lanes

- **0.8:** declare `MAP_MECHANICS` (now including `combat.*`, `command.*`, `forces.*`, `infrastructure.changed`) and `TICK_MECHANICS` (now including `movement.leg_started`, `movement.arrived`, `plans.goal_reached`). On union-1861, 75 days: the contest, occupation, blocked retreats, stores falling, legs and goals fire; refills, pockets relieved or lost, government closing and infrastructure changes stay at zero until situations and raids use them. `combat.retreat_blocked` fires daily while a contested side has nowhere to go.
- **0.8, quiet by design on v2 packs (0058):** with values empty until Phase 1's people recast, relay objections (`orders.relay_objected`), filter holds and trims (`reports.filtered` holds, `reports.trimmed`) stay at zero, and with regard 0 so do relay holds (`orders.relay_held`). A delegate deciding a situation by his values scores every option 0, so his choice falls back to the deterministic tie-break (first open option in display order). Set their bands to match; the kernel tests still drive all of them through explicit trait inputs (`test/support/seats-fixture.ts`).
- **0.8 / Phase 1 history run:** the generic rule-seat principal opens on day 1 with an advance on the enemy capital (Davis sends the Charleston command on Washington, Lincoln the DC militia on Montgomery). With real movement and the contest, Washington falls on day 19. A history run needs principals that keep March 1861's peace until the war's opening situations.
- **0.9 (the lead's three asks from the planner spike, all in place):**
  1. *Garrisons stay put.* A post's marching group is its blocks at headquarters, never its detachments (0040's detachment below its brigade): `marchingGroup` in `seats/requests.ts`. A goal moves the army, not the garrison.
  2. *Movement owns passage and exports it* as one pure function, `marchBar(ground, leg, side, naval)` in `movement/march.ts`, with `legsFrom` and `marchSteps` (quickest first legs toward a goal) on the same `MarchGround` (map, control index, `passageOf` network, month). Land troops pass any land region or key point, enemy ground and open neutral ground (0058) included, but not a closed neutral government's; rail needs both ends traced by the side or open neutral; water edges carry only ships, and a ship is barred by works held against it; off-map is never passable; an edge below one whole unit of capacity this month carries no march. Supply passage stays lane 0.4's (`supply.ts`). The spike's own copy retires.
  3. *Clearing works no fort holds.* `applyInfrastructure`'s `clear` change removes any obstruction, a boom or hulks (`by: null`) included, with cause `operations` (deliberately) or `combat` (by force). Tested in `march.test.ts`: the boom bars both sides' ships; cleared, the edge opens.
- **0.9, also:** supply paths carry legs per region, for a supply-aware route.
- **Situation authors:** close or reopen a neutral government with a proposal to `command`, field `government_closed`, subject the department, delta +1 or -1.
- **Phase 1:** reports of a pocket closing or stores crossing the low threshold are the decision points (0054); the truth events are `pocket_closed` and `stores_crossed`. Message routes by rail and ship can now use the typed edges.

## Findings outside my scope

1. The generic rule-seat principal's day-1 war (see "For later lanes"). The rule seats belong to lane 0.6's package.
2. (Done on `phase0-pack-rules`: these are now `WorldRules` every pack states.) Three design parameters the pack format did not carry, then kernel defaults: stores (men per capacity unit 20,000; cap 30 days; low threshold 7 days), the contest (occupation 100‰ a day at 5,000 men; contest 200‰ at full margin), and movement (one whole unit of capacity to march; courier a third of a division's days). If packs should tune them, `WorldRules` needs fields (a lane 0.2 change).
3. Many Union blocks have unknown stores (`storesDays` null), so stores do little on union-1861; a research or data item for lane 0.3.
4. FOUNDATION section 10 should gain the rows for `forceBlockStates`, `forceLocations`, `postStates`, `forceAssignments` and the three infrastructure fields, the tick's phases 3b, 4a and 4c, and `combat` as a proposer-only module in Phase 0.
