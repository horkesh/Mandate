# Lane 1.4: operations, reports and dispatches

Lane 1.4 is FOUNDATION section 12's row 1.4 (decision 0073), on 1A's critical path. Branch `phase1-operations`, from
main at 2bcc680 (after lane 1.3's merge), with main merged in at 496ee81 (lane 1.10's research). It builds on lane 1.2's
plans (0075) and lane 1.3's battle model (0076).

## What is built, and where

| Piece | Where |
|---|---|
| **Operations** as State (`operationRecords`, writer `operations`): one per approved plan, each axis with its stage, history, repulses, pursuit and arrival; its support requests; for a pincer, whether the arrows met | `kernel/src/operations/operations.ts` |
| The operations and pruning rules (`WorldRules.operations`, `WorldRules.pruning`) and their check | `kernel/src/operations/rules.ts` |
| **Phase 3**: operations follow plans, each axis takes its day's stage, then every march gains a day. Replaces the standing-goal path | `kernel/src/tick/operations.ts` |
| **Support requests**: a directive between holders (`orderKind: 'support'`), answered on arrival by the holder's own compliance | `kernel/src/tick/support.ts`; `tick/orders.ts` routes it |
| **Battle reports**: hour-stamped dispatches, first and full casualty returns, a governor's wire, a pocket report | `kernel/src/tick/battle-reports.ts` |
| **Decision points**: a battle report (the first return), a pocket closed (the commander's wire), a plan ready for review (the submission) | `kernel/src/tick/deliver.ts` |
| **Works**: dug each night by an axis holding its objective; lost when a defender is driven from them | `regions/regions.ts` (`applyFortification`), `tick/operations.ts`, `combat/battle.ts` |
| **Pursuit captures**: a rearguard day takes a share of the pursued side's stragglers, more with cavalry (the arms vocabulary gains `cavalry`) | `combat/battle.ts` (`pursuitRate`), `combat/resolve.ts` (`pursuedPermille`) |
| **Oversight** from distance and the wire (`oversightOf`), in place of lane 1.1's constant | `tick/context.ts`; `reading/orders.ts` (`OrderMeans.oversight`); `people.context` gains three terms |
| **Stores norms** (lane 1.10's Appendix K): a block with no sourced stores takes the first norm that covers it, flagged `fbStoresAssumed`; the planner's axis carries `axisStoresAssumed`, a stores crossing `assumed` | `forces/forces.ts`, `forces/stores.ts`, `planner/` |
| **Pruning**: ended operations (a post's latest kept), closed battles, and responses no plan or operation names | `operations/operations.ts`, `combat/records.ts`, `proxy/responses.ts`; the tick's step 6 |
| Tests | `kernel/test/operations.test.ts` (14), and the touched suites |

**Retired:** `plans/execute.ts`, `tick/standing.ts`, `StandingGoal`, `GoalSpec`, the `standingGoals` field, and the
now-unused `marchingGroup`. A test asserts none of them is left in the kernel. The daily step menu was already gone
with lane 1.2's plan menu.

**Labelled stand-in left:** ships and troops afloat neither eat nor draw stores (`forces/stores.ts`; owner 1B's ships'
stores, 0064). The planner's own stand-in on it (`planner/route.ts`) stays as lane 1.2 labelled it.

## The lifecycle, as built

An approved plan (or one assembled and awaiting the word) opens one operation, `op:<post>:<day>`. A change of goal or
plan ends it as `superseded`; once an operation has run for a goal and plan, nothing reopens it. Each axis:
- **assemble** until its concentration ends, the word comes (status `ready`), and, for a partner axis, its holder
  agreed (a delayed answer moves from the day his hold ends);
- **march** along the plan's own legs; where a leg is barred today it takes the quickest step instead (`rerouted`);
  it pauses at each depot step for the plan's days;
- **assault** where the enemy stands in its way; the battle model fights it in phase 3b. An axis that arrived and fought
  the same day records the assault the next morning;
- **pursue** for the pack's days when its commander chose to (lane 1.3's `bsidePursue`), into the region the enemy fell
  back to; combat's rearguard day takes stragglers;
- **withdraw**, then **pause**, when the battle model drove it back; after `maxRepulses` it ends and the operation fails;
- **works** at its objective: digging in each night, until its side holds `holdControlPermille` there;
- **end**: objective held, superseded, failed (repulsed too often, no route, its force gone or taken).

The operation ends with its own main axis. Every stage entered is logged with a typed reason.

## Done

- `npm run check` passes (1100 tests), and `npm run run:done-check` passes all six criteria.
- Kernel tests on fictional ground show: an operation's full lifecycle (assemble, march, assault, pursue, march, works,
  end); a repulse that withdraws and pauses; a support request refused by its holder's own compliance; an encirclement
  that fails for that human reason (and its positive control, the arrows meeting); hour-stamped battle dispatches; a
  casualty return shaded beside its truth; the captured shown as missing first and apart later; and the standing-goal
  path gone. Also works stormed, pursuit captures, oversight by distance, assumed stores and pruning.
- The liveness gate is re-banded (below), the save fixture regenerated.

## Choices made within the brief (for a decision record; the lead may overturn them)

1. **`operationRecords` is its own State field, keyed by post and opening day**, with axes copied from the plan (route
   and phases), not re-read from `plans`. *Rejected:* executing straight from the plan record (a plan sent back would
   lose the operation's history).
2. **One operation per goal and plan.** A plan that stays approved after its operation ran is not executed again, and
   pruning keeps each post's latest operation. *Rejected:* reopening (it looped every few days in the reference game).
3. **Support requests go straight from the commander to the holder he asks**, by wire where he has it, with no relay;
   the holder answers by `answerOrder` with his regard for the man asking, on the advance terms. Comply or reservations:
   the axis moves; slow walk or reinterpret: it moves after the pack's relay hold for that rung; object or refuse: never.
   He wires back his declared rung. *Rejected:* routing them up and down the principal's chain (it is a request
   between holders, FOUNDATION section 5).
4. **A reinforcement request goes to the principal** and is marked `to_principal`: he answers by his own verbs
   (transfers, lane 1.5). A naval support request is answered like a cooperating axis; carrying troops is not executed
   (see findings).
5. **An encirclement's outcome is typed:** `met`, `failed_human` (`partner_refused`, `partner_late`, `partner_vacant`)
   or `failed_ground` (`no_route`), judged against the plan's own arrival window.
6. **Battle dispatches**: four wires a side a battle-day, at the end of each phase, from the day shape. He says the
   phase went well unless his flank broke or he leaves that evening, gives the enemy as he sees him, and says nothing of
   his losses; what he left out is in the truth beside it.
7. **Casualty returns**: the first (evening, by courier) runs low by the pack's share and counts every captured man
   among the missing; the full return, the pack's days later, sets killed and wounded, missing and captured apart. A
   destroyed force's men are reported missing, then captured, never killed (0074, 0076). Enemy losses are claimed at his
   perception (a bold man as they were, a timid one inflated).
8. **A side's reports are written by whoever holds its post that day**, or the post above it; a post left vacant by a
   hit commander sends none.
9. **Oversight** is the pack's base less a term per courier day to the issuer, plus a term on the wire, with a floor; the
   tick passes it at relays, arrivals, edits and support answers. Conflict resolution keeps the base (it has no reach).
10. **Stores norms match by the post a block starts under or that post's kind, its arm and its side.** The first match
    applies; no match stays unknown. *Rejected:* matching by block kind (detachment or block), which cannot tell a garrison from a
    field force in the Union data.
11. **Works** are dug only by an axis holding its objective (`works` stage), not by every block standing still: the
    Phase 0 garrisons would otherwise all entrench and turn every 1861 fight into an assault on works. Storming takes
    the pack's share off.
12. **Pruning keeps** any response a plan or operation names, whatever its age.

## The liveness gate, re-banded

- **Union at war:** one operation (the Charleston command on Washington): `operations.opened`, `ended` around(1),
  `stage` around(20), `works` around(6); its battle's `reports.battle_dispatch` around(8) and `casualty_return` around(4);
  `orders.responses_pruned` around(4); `knowledge.pruned_age` around(8). Flank breaks, routs, works stormed, the
  governor's wire and pocket reports are `notHere` (the testbed fires them).
- **Testbed:** three operations; `combat.flank_broken` and `combat.routed` now fire (around(2)), so they leave `QUIET`;
  works stormed around(1), governor's wires and pocket reports around(3), dispatches around(24), returns around(12).
- **Quiet, each with its driving test:** `operations.repulsed` and `operations.support_*` (no reference plan is a pincer
  or is driven back), `combat.records_pruned` (battles are kept 120 days).
- The kernel's 60-day seats game: `commands.rejected` is now live (a scripted order meets a post the battle model left
  vacant, `vacant_post`), and the game delivers fewer messages (a commander wounded); both assertions note why.

## For the lead

1. **A decision record** for the choices above.
2. **FOUNDATION section 10 rows:**
   - `operations`: `operationRecords`, proposed by plan approval, movement and combat outcomes, and a support request answered;
   - fortification: `regions` now applies changes (`applyFortification`), proposed by operations (works) and combat (stormed);
   - the phase order: phase 3 is now operations, then marching; phase 5 writes battle reports before the cyclic ones;
   - `orderResponses`, battle records and operations are pruned (the pruning rules).
3. **The pack format changed:** `WorldRules.operations`, `WorldRules.pruning`, `combat.pursuit`, `stores.norms`, three
   `people.context` oversight terms, and `vocabularies.arms[].cavalry`.
4. **Stores norms, entered (your ruling: pack rules, cited).** The Union pack has one: the Home Squadron's ships, 30
   days, from ORN I-4 pp. 228-229 and 234 (practice for a short expedition; lane 1.10's Appendix K). Not entered, each
   for a reason: the garrison norm (about four months) would land only on Fort Monroe and Fort Jefferson, which Appendix K
   leaves unknown, and Fort Pickens, which your earlier ruling keeps unknown; the marching norm (three days) fits no Union
   block at the start; the far squadrons have no sourced months-at-sailing rule; Confederate stocks are not sourced. The
   testbed states two design norms (a fort, a ship) and has no block they change. In the Union run the Home Squadron's
   ships now eat their assumed month where no supply reaches (`forces.stores_fell` re-banded to around(37)).
5. **Detachments in play are not built.** Making a garrison or landing a new block needs block creation across its three
   owners, which is lane 1.7's `create` path, not merged yet. I recommend a small follow-up once 1.7 lands: an operation
   leaving a garrison at a taken objective, and a landing from a carrier.
6. **McClellan's gap** (bold on paper, cautious in action): with operations, drafting and execution are already
   separate. Drafting reads his boldness through the planner; execution reads his traits again at every battle-day
   (commit, stand, pursue) and every relay. One boldness can therefore give a bold plan and a cautious fight, but only
   while the plan's own terms differ from the battle's thresholds. I recommend no second term until lane 1.14's
   calibration shows the gap is too narrow; if it is, a pack weight on boldness at execution is the smallest change.
7. **Freelancing goes to 1B.** It does not fall out of operations naturally: it needs a man to set his own goal, which
   is a seat initiative (lane 1.5's), feeding an operation. The pieces exist; the initiative does not.
8. **The reports seam with lane 1.5** is as I proposed: 1.4 owns `sendReport`'s routes, battle reports and
   `oversightOf`; 1.5's observer letters use `sendReport`, and its observer term adds to `oversightOf`'s value. The
   shared edit is `CLAIM_KINDS`; I added `battle-phase`, `captured`, `casualties`, `missing`, `operation`, `pocket` and
   `support-answer`.

## Findings outside my scope

- A naval support request is answered, but troops are not embarked or carried: sea and river axes march only as a naval
  group already aboard. Embarkation is 1B's (ships and landings).
- The Navy Department's channel carries no battle news: combat ignores ships, so there is nothing for it to report yet.
- An axis standing in the enemy's region whose commander will not attack (his odds below his demand) stays in `assault`
  with no battle: a stand-off, not a siege. The siege method (0062, 1B) is its home.
- The kernel's seats reference game wounds a commander and leaves his post vacant, so its scripted order on day 20 is
  rejected. Nothing reappoints a vacated post yet (lane 1.5's appoint verb).
