# Lane 1.12: rule-seat principals and commander seats (Part A)

Branch `phase1-rule-seats`. Part A of the brief: commanders' battle choices as seat requests, a doctrine for each rule-seat principal (Lincoln, Davis) read from the pack, the generic principal of 0072 and the capital-as-objective stand-in retired, and the lead's rulings on the menu (posts as the principal believes them) and on the battle guard. Part B, the history run end to end, waits for lane 1.11's situations.

## What changed

**Battle orders are seat requests** (`combat/order-kinds.ts`, `combat/orders.ts`, `seats/requests.ts` `battleMenus`, `tick.ts`).
- A commander whose men stand where the enemy's do, or march in, gets a `battle` menu each morning: commit, night, cut-off and pursuit, each an option or `judge` (his traits decide on the spot). The menu shows what his traits would choose on the morning's numbers as he believes them.
- The `battle` command is accepted only from the seat of the post's holder, once a day (`not_the_decider`, `duplicate_choice`).
- **The guard (hard rule 1, 0016):** a seat the player drives never sends battle orders and is never asked. The tick refuses such a command with the typed reason `player_seat`, and `pendingRequests` builds no battle menu for that seat, so his commanders fight by their traits. **A player seat is one whose `seatDriver` is `human`** (`state.seatAssignments`, set by `initialSeats`' `drivers` or `reassignSeat`). The check reads the driver, not the post, so it holds even if a setting ever lets the player sit in a commander's seat. Test: `combat.test.ts`, "never takes them from a seat the player drives".
- Rule seats answer `judge` at every point, so a history run's battles are the trait rule's. `seats.choices` has a kernel unit test in `plans.test.ts`.

**The doctrine** (`rules.ruleSeats.principals`, one row per faction, a pack rule with no kernel default; `world/world.ts` `PrincipalDoctrine`; checks in `seats/world.ts` `doctrineProblems` and `pack-format` `validate.ts`).
- The rule-seat principal (`packages/rule-seats`) does nothing of his doctrine until his side is at war (0064, 0066). From the morning after, within his week's attention (priced by the pack's table), in this order:
  1. he answers his commanders (approve as drafted, give the word, go around an office that withheld his answer);
  2. he gives each dated offensive on its day;
  3. he reappoints a post that lost its holder, choosing the senior candidate of the right kind;
  4. he makes each dated call once;
  5. he transfers what the governors raised to the concentration post;
  6. on the doctrine's cadence, he asks his armies (the concentration post and each offensive's post) where they stand.
- He holds his capital by never ordering its garrison away: only the doctrine's offensives move an army.
- **union-1861:**
  - **Union calls:** 17 calls from the 15 April 1861 quota table, 74 regiments for 90 days (OR III-1 p. 69), dated 15 April.
  - **Confederate calls:** 3 regiments for 12 months to each of SC, MS, FL, AL, GA, LA and TX (NF App G (a); OR IV-1 pp. 126-127), dated 8 April.
  - **Offensives:** the Charleston command takes Fort Sumter from 12 April (the first shot, NPS-Sumter), and Washington moves on Manassas from 16 July (McDowell marches, WIKI-Bull). Both are cited from `docs/research/2026-11-14-secession-winter-1861.md`.
  - **Concentration posts:** `us_dc_militia` and `cs_cmd_charleston`, each with a `concentrateSource` citing the research notes. The choice of post is labelled [I], as the lead ruled.
  - **Other settings:** inquiry every 7 days; appoint `general` to land posts and `naval_officer` to naval ones.
- **testbed:** the mirror, with TB-DESIGN sources.

**Retired:** the generic rule-seat principal (0072) and every side's "the other capital" objective (`SeatFaction.objective` is gone). `cli/drafting-measure.ts` keeps its benchmark objective, the other capital, computed inline and labelled a benchmark, not a goal.

**Calls happen once** (`proxy/responses.ts` `isCallAnswer`). Responses are pruned after the pack's `responseDays` (60). The doctrine read "called" from the governor's answer, so it called every governor again on day 61. A governor's answer to a call is now kept for good (one per call; it does not grow with the war's hops), and the seat's "called" check reads it.

**Posts as the principal believes them** (the lead's ruling on `review-lane-1.13.md` item 2, under 0052 and 0027; `seats/believed.ts`, `tick/battle-reports.ts`, `tick/orders.ts`, `tick/deliver.ts`).
- **The news.** A battle that takes a post's commander (killed, wounded, captured) still vacates the post at once in truth. It now also sends the principal a `commander-lost` report about the post. The report is written by the next holder up the chain; if nobody holds a post above, it is sent from the field as from the principal's own staff.
- **The belief.** While that report is in transit, the principal believes the post is held by the man he lost (taken from the battle record). His menu lists the post as commandable with that holder, and offers no vacancy. The belief needs no new State: messages in transit are never pruned, and the battle record names the man.
- **Reappointment** waits for the report, because the doctrine reappoints only from `vacancies`.
- **Orders.**
  - An order to a post he believes held is accepted. It is carried to the post's headquarters.
  - On arrival, an order whose addressee no longer holds the post is not answered. It comes back as a **returned dispatch**: a `wire-dispatch` report to the issuer, by the route the order went, from the post's headquarters. The report's subject is the post, it answers the order's id, and it carries one claim, `order-returned`, with the token `vacant_post` or `holder_changed`. Telemetry: `orders.returned`.
  - **How it reaches the player:** like any answer to an order, in his reports (his knowledge, then his view). He sees which dispatch came back and why, and he learns of the vacancy itself from the `commander-lost` report.
  - An order to a post he *knows* is vacant is still refused at once (`vacant_post`).
- Scope of the bounce: orders (goals, reviews, the word to go, edits, calls) addressed to a post's holder. A support request between holders keeps lane 1.4's handling. The people verbs still refuse `vacant_post` from State at once; see the findings.
- Tests (`believed-posts.test.ts`):
  - a captured commander's post stays on the menu until the report arrives, then becomes a vacancy;
  - an order sent before then bounces on arrival, typed;
  - the reappointment waits for the report;
  - positive controls.

## Choices, and the alternatives rejected

- **`crossNeutral` is false for both sides** (accepted by the lead). Entering a neutral government's ground is a political act, which in a history run comes from a situation, not from a standing permission. Rejected: true for either side, which would let a rule seat's goal march through a neutral state as a routine permission.
- **A refusing carrier records his refusal; the policy still stands** (accepted by the lead). The refusal is a grievance and a stance on record, as lane 1.5b's gate wiring applies it. It does not suspend the policy in his department. Rejected: a refusal that suspends the policy locally. That would make every carrier a veto, and nothing in the research gives a department-level suspension mechanism.
- **The quota table's rows for MD, VA, NC, TN, AR, KY and MO are dropped from the Union doctrine.** In the pack those governors' posts are not on the Union side at the start, so the world check refuses a call to them. What became of those requisitions belongs to the situations (lane 1.11), not to the doctrine.
- **Calls are dated, and the doctrine calls each governor once.** One owner per levy (rule 5): a row is the doctrine's call. **To switch a row off by data in Part B, remove it from `rules.ruleSeats.principals[].calls` when a situation's option makes the same call** (S09 and the others). The kernel also keeps every governor's answer to a call, and the seat never calls a governor who has been called, whoever called him. So even a row left in place by mistake makes no second call once the situation's call has gone out. Rejected: calling on the morning after war, which is not history; a per-row `owner` field, which adds a second way of saying what removing the row says.
- **Appoint fills only a post that lost the holder the scenario gave it.** The first version filled five posts that `union-1861` starts vacant, on day 1 (Twiggs to Morris Island, Patterson to the St. Louis Arsenal). A post the scenario starts vacant is the history's own choice. Rejected: filling every vacant field post.
- **The weekly inquiry goes only to the doctrine's armies**, not to every post (it was 298 answered verbs in 75 days, about 25 a week). Rejected: inquiring of every fort and yard; a men threshold, which would be a new number with no source.
- **The Confederate capital is read as the scenario states it (Montgomery), with no move in Part A** (the lead's ruling (a)).
- **Consult, audience, observer, promise, pressure, address and relieve have no doctrine in Part A.**
  - Consult needs an open situation to consult on, so it waits for Part B.
  - Promise and address stay QUIET in 1A (the lead's ruling (c)), each with its reason and driving test.
  - Audience, observer, pressure and relieve have no sourced trigger yet.

## A transfer concentrates (the lead's Fix 1)

- **Joins.** A transfer orders every block it hands over to join the receiving post at its seat: the post's home region in pack data (`postSeat`, the start's `region`; Washington for `us_dc_militia`, Charleston for `cs_cmd_charleston`). No new pack rule was needed. State: `forceJoins`, owned by `movement` (`movement/join.ts`).
- **The day's legs.** Each day the operations phase starts each joining block's next leg (`tick/operations.ts`, `joinStep`). It takes the quickest legs the side may take (movement's own rules), so it goes by rail where the side traces the line. Blocks standing together going to the same seat march together.
- **When it ends.** The order ends at the seat (`movement.joined`), or when the block is no longer the post's, has surrendered, is gone, or is in one of the post's operations. A block with no route waits, typed `no_route` (`movement.join_blocked`), and is tried again each day. This is an order to join, not a plan: no assault and no planner.
- **Hold goals.** A goal to hold holds its objective, or the post's seat when it names none (`planner/axes.ts`), never the region of its strongest block. "Hold Washington" was drafting a hold at New York.
- **Tests:**
  - `concentration.test.ts`: the New York levy reaches Washington by rail, and "hold Washington" holds Washington;
  - `join.test.ts`: rail and road, an island with no route, a block transferred again.

## The bombardment (the lead's ruling on Sumter, built in Part A so the run is whole)

- **The planner.** A new method, `bombard`, offered only when no land route reaches the objective. Its conditions:
  - the goal is to take, and the objective lies across a water edge no longer than the pack's battery range (`combat.bombardment.rangeMaxDaysPermille`);
  - the shore is held by the side, and the post's guns stand there (the pack's `gunArms`; a shore's batteries are garrison detachments, so they count);
  - there is a target, meaning the commander believes a force is in the objective or knows of works there. If not, it is refused as `no_target`.
  - It fires from the shore with the most guns. Its axis is concentrate, then bombard; nothing crosses.
- **The operations stage `bombard`:** each day the battle model fights a fire-only engagement (`combat/bombard.ts`, `bombardDay` and `fortDay`).
  - Fire ratio: attacker's guns over the defender's, capped.
  - Morale falls by the pack's rate at that ratio, and further when stores are out.
  - Works wear. Killed and wounded are the pack's share; for `union-1861` that is 0, because nobody was killed by the bombardment of Sumter (secession-winter-1861.md [HN-Sumter]).
  - Every number is a typed term.
- **The defender's choice.** He is cut off, so he decides: he surrenders when morale falls below his floor, and his boldness lowers the floor, so a bolder man holds longer. His seat's `surrender` is taken; a `break_out` cannot cross water, so he holds. Nothing forces it.
- **On surrender, the terms are only the record's** (`combat.bombardment.recordTerms`: fort, side, terms, source):
  - **evacuated under terms:** the garrison leaves play by a disbanding with that typed cause (`forces`), is removed (`movement`) and unassigned (`command`). Its commander leaves the post and keeps serving.
  - **captured,** with no row: its men are captured (R4), its blocks marked surrendered and released, and its commander captured with his post vacant, as lane 1.3's surrender does.
  - The fort's control passes to the attacker (a proposal to `control`).
  - Both principals are told by a typed report (`fort-surrendered`, token `evacuated_under_terms` or `captured`), with the record's source in the truth beside it.
- **The gate's conditions, built in:**
  1. An evacuated garrison is never captured, and its commander stays `serving`.
  2. Target kinds are only `force` and `works` (`BOMBARD_TARGET_KINDS`, tested), and nothing reads or writes a town's people.
  3. No text names who built the works.
- **Sumter's row cites** OR I-1 pp. 13-15 (Beauregard's offer of 11 April, accepted 13 April) and p. 12 (Anderson's telegram of 18 April), as read by lane 1.11r3 in `docs/research/_leads/L3-sumter.md`. That note is on `research-1861-leads` and **not yet on main**; the citation should point to it once it lands.
- **Union run:**
  - Davis's order goes out on day 38, 12 April.
  - Beauregard's plan is the bombardment, approved. Fire opens on day 44 and the garrison surrenders on day 46, after two days of fire.
  - Five days later than the record's 12–13 April: the order relays, meets the War Department's objection, goes around, and is drafted.
  - The garrison is evacuated under the record's terms. Anderson keeps serving, off the post, and the fort passes to the Confederacy.
- **Tests:**
  - `bombard.test.ts`, on fictional ground: the day rule, the target check, a captured garrison with no record terms, a bolder commander holding longer, the record's terms evacuating, and a town refused `no_target`;
  - `bombardment.test.ts`: the Union run end to end.
- **For lane 1.11's hook:** the stage reads a goal with posture `take` whose objective is the fort's region (`fort_sumter`), sent to `cs_cmd_charleston`; the planner's `bombard` method does the rest. When lane 1.11's `reduce_sumter` order sends that goal, remove the doctrine's Sumter offensive row (one owner, as with the calls).
- **For the gate reviewer:** the surrender reaches each principal as a typed claim. No prose is printed: the token `evacuated_under_terms` and the region. If a notice text is wanted under `capture-in-battle`, this is the proposed wording, stating only the record's terms:

  > "Fort Sumter has been evacuated. Major Anderson and his command were allowed to remove, with company arms and property and all private property, to a post in the United States, and to salute their flag."

  It is not signed, and no text is shipped yet.

## The liveness gate

Re-banded from the merged runs (`cli/src/liveness-gate.ts`).
- **The Union run:**
  - It now marches: 107 arrivals and 15 joins as the levies concentrate.
  - It bombards Sumter twice, evacuates it, changes control and reaches its goal.
  - Recruitment, inquiries and transfers fire.
  - Field battles are `notHere` with the reason; the testbed keeps them alive.
- **Moved:**
  - out of QUIET: `combat.surrendered`, `map.pocket_lost`, `combat.flank_broken`, and recruitment's calls, answers and musters;
  - into QUIET, each with its driving test: `combat.cut_off`, `combat.general_hit`, `plans.approved`, `movement.join_blocked`, `reports.commander_lost` and `orders.returned`;
  - back into QUIET, since the testbed's war no longer fires them: `operations.repulsed` and `map.pocket_relieved`.
- **Still QUIET:**
  - `recruitment.muster_blocked` and `lapsed`;
  - consult, audience, observer, promise, pressure, address;
  - `seats.attention_refused`: the seat budgets its own attention.
- **Tests adjusted:**
  - The no-orders positive control now runs on the testbed, and also checks that the Union doctrine's calls and inquiries go dead.
  - The planted stalled-band control moved to `combat.battle_day`.
  - `recruitment.called` joins the peace run's quiet list.

## The done check

All six criteria pass with no amendment (the lead's ruling: the criterion was catching a real gap). On this machine:
- Union median 25 ms, p95 52 ms;
- testbed median 3 ms.

`MECHANICS_RUN` no longer says "stand-in principals". It now says the run is at war from day 0 by the labelled option, not by the governments' decisions. The budget test is behind lane 1.0t's flag (0086), merged from main.

## For Part B

- **Situations:**
  - Tie the calls and goals to lane 1.11's situations, removing each doctrine row a situation takes over (the calls, and the Sumter offensive once `reduce_sumter` sends its goal).
  - Set the war flags by each government's decision, with no `--at-war`.
  - Give consult its policy: consult the posts of a situation's proposers.
  - Check whether a situation treats Lincoln's 4 July message as an `address`.
- **The Confederate capital:** it becomes State with one owner, moved by an event on a sourced date (lane 1.11r2: resolution agreed 20 May, approved 21 May 1861; Davis at Richmond from 29 May; the War Department ordered to move 25 May). Propose the owner and which date counts; the lead's first guess is Davis's arrival.
- **Butler to Fort Monroe:** the rule-seat Lincoln appoints Butler to `us_fort_monroe` on the sourced date, in the history run only. Lane 1.11's placeholder notice of 22 May is removed, in coordination with lane 1.11, which names it in its hand-over.
- **Lane 1.14:** checks the concentration against the 31 July checkpoints (men under arms, and a planned operation by each side).
- **Lane 1.11's Sumter hook:** `reduce_sumter` sends the goal the bombardment reads (posture `take`, objective `fort_sumter`, to `cs_cmd_charleston`; c878fd9 on `phase1-situations`). After lane 1.11 merges, remove the doctrine's Sumter row and re-run `bombardment.test.ts` with the situation as the order's only source.
- **The people verbs bounce like orders** (the lead's addition): inquire, transfer, relieve, audience and observer are accepted for a post the principal believes held, and come back undelivered on arrival, as orders do (0052).
- **`believedHolder` reads every capture** (the lead's addition), not only battle records: a commander captured in a bombardment, or by any later route, is believed held until the report arrives.
- **Each Part A stand-in names an owner lane** (the lead's addition):
  - lane 1.14 for the [I] bombardment parameters and the concentration posts;
  - 1B for gun counts (today, the known men of the gun arms).

## Findings outside my scope

- **Sumter's terms cite a research note not yet on main** (`docs/research/_leads/L3-sumter.md`, branch `research-1861-leads`).
- **The Texas governor's post (`st_gov_texas`) has no holder** at `union-1861`'s start, so Davis's call to Texas waits. The lead has sent it to research.
- **The stopwatch:** the Union day's cost reads 25 ms standalone but about 70 ms under the full suite's parallel load. 0086's flag keeps that out of the hook.
