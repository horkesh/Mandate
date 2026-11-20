# Lane 1.12: rule-seat principals and commander seats (Parts A and B)

Main merged at `364aba0` on 2026-11-19, by R46. R48 starts from the committed merge at `8b15e6e`, in `C:/Pyrrhic/mandate-rule-seats-b`, branch `phase1-rule-seats-b`.

## Where lane 1.12 stopped (2026-11-20, R98)

R98 adds sourced, government-dependent northern command assignments and concentration through existing transfers and joins, on `phase1-manassas-1861` at `4f6e8b3`. Beauregard takes the new command after his appointment letter arrives; Johnston's entry waits on the resignation/service implementation missing from this base. The existing Union advance produces battles at Manassas on 27, 29 and 31 July, with Stone still commanding the Union post. No battle date, location or weight was added. The full R98 account and proposed rulings are at the end of this hand-over.

Exact no-Git check: exit 0, 133 files / 1,489 passed / three existing skips. One normal eight-seed done check with drafting: exit 0, Phase 0 6/6; 1A 2/6. **1A remains unmet:** checkpoints, pushback, unknown strength and the lever sweep fail. Four unknown Confederate blocks fought; the watched return option is best in 3/8 seeds. No D6 clearance. Evidence: `runs/r98/final-checks.json`. Independent review remains with Claude under 0096.

### R81 stopping point (retained)

## Where lane 1.12 stopped (2026-11-20, R89)

**R89 delivers the Butler history appointment under the lead's command-mapping ruling.** On 22 May/day 78 Lincoln sends an ordinary appointment to `us_dept_virginia`; Butler accepts with reservations. Dimick retains `us_fort_monroe` every day through 31 July. The unsigned placeholder and its two strings are removed. The R89 section below supersedes the earlier Butler holds and the original Part B brief's Fort Monroe post ID. R84's consultation remains built; the lead accepted keeping the July message as the ledger's answer to Congress.

R89 history/replay/day-60 resume pass. The normal eight-seed done check with drafting exits 0, **Phase 0 6/6, 1A 2/6**. The exact full check exits 1 at one stale placeholder assertion: **1,480 passed / 1 failed / 3 existing skips**. Corrected that test only; its nine cases and all remaining gates pass. Unaffected suite evidence is reused, not reported as an exact full-command exit 0. Evidence: `runs/r89/final-checks.json`. Independent review belongs to Claude under 0096. The human-driven sweep's missing department carrier is a new finding for the lead, gate reviewer and R85; the four failed 1A categories remain binding.

The following R81 summary is historical. Decision 0104 now records the accepted Linux CI result; its earlier pending-CI statements below are the limits of that earlier run, not a new R84 hold.

**R80 is committed as `f444fa2`; R81 changes only the cost of looking up a post holder.** Its linear scan returns the same code-unit-first own matching post. The two decision-led 148-day paths preserve every daily hash and liveness count; the normal done check also preserves all 120 testbed hashes, replay and save/resume. R80 below remains the account of the opening's dates and delivery order. All save fixtures, bands, pack data and signed/gate inputs remain unchanged.

Timing-enabled no-Git root check: **exit 0, 127 files / 1,457 passed / zero skips**. Normal eight-seed done check with drafting: **exit 0, Phase 0 6/6; 1A 1/6**, with identical non-budget problem lists. Final back-to-back medians against preserved `f444fa2` source are **23.07 → 20.58 ms** (war by decision) and **22.02 → 19.40 ms** (history). **Other host jobs were active: unloaded confirmation and Linux CI remain pending.** No acceptance limit was changed or waived. R79 was not undertaken. Evidence: `runs/r81/final-checks.json`; independent review belongs to Claude under 0096.

The Part A review history at the pause follows:

**Part A** is complete on `phase1-rule-seats`, head 0fd0f26, pushed. It has not merged.
- **Checks:** `npm run check` passes, and so do all six `run:done-check` criteria. CI was green on ea764cd. Every later commit passed the full check in its pre-commit hook.
- **Reviews:** the standing reviewer has the head 0fd0f26.
- **The gate reviewer approved the bombardment at 3cb3610 with two changes, both done and accepted:**
  - **G-1.12a** (0fd0f26), the cited list of forts that may be bombarded: accepted. The reviewer did not re-run `bombard.test.ts` during the pause; it passes in this branch's full check.
  - **The Sumter notice** is signed by `gate-reviewer` (hash bed9f439…, all questions at v1, the reviewer's note verbatim) and moved to `situations/sumter_evacuated.json`. "Allowed" was accepted.
  - The notice fires once in the Union run, when the principal learns of the evacuation. `situations.fired`, `noticed`, `notice_reports` and `surfaced` are banded at one there.
- **Before merging:** lane 1.11r3's `L3-sumter.md` (990275c, on `research-1861-leads`) must reach main. The notice and `recordTerms` cite it.

**R77 integrates lane 1.11; R78 meets the Sumter timing condition and removes the duplicate doctrine row.** The list in "For Part B" below is the original brief; its remaining policy changes await the lead’s next request:
- the history run end to end, through lane 1.11's situations: reported in R77 and checked again in R78, with the Sumter timing condition now met;
- the Confederate capital as State: done in R48;
- Butler to Fort Monroe;
- the people verbs bouncing like orders: done in R48;
- `believedHolder` reading every capture: done in R48;
- an owner lane for each stand-in: done in R48;
- resignation runs separately as R49; its worktree was not changed here.

Original brief, branch `phase1-rule-seats`: commanders' battle choices as seat requests, a doctrine for each rule-seat principal (Lincoln, Davis) read from the pack, the generic principal of 0072 and the capital-as-objective stand-in retired, and the lead's rulings on the menu (posts as the principal believes them) and on the battle guard. R77 below reports Part B's history after integrating lane 1.11.

## What changed in Part A

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
  - **Offensives:** Washington moves on Manassas from 16 July (McDowell marches, WIKI-Bull, in `docs/research/2026-11-14-secession-winter-1861.md`). R78 removes the former Charleston–Sumter row: the authored `reduce_sumter` option now owns that goal.
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
- Scope of the bounce in Part A: orders (goals, reviews, the word to go, edits, calls) addressed to a post's holder. A support request between holders keeps lane 1.4's handling. R48 supersedes the Part A limitation on people verbs below.
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
- **Lane 1.11's hook:** the stage reads a goal with posture `take` whose objective is the fort's region (`fort_sumter`), sent to `cs_cmd_charleston`; the planner's `bombard` method does the rest. R78 removes the doctrine's Sumter offensive row now that `reduce_sumter` sends that goal, and tests the authored opening as its only source.
- **The forts that may be bombarded** (the gate reviewer's G-1.12a, the lead's ruling): `combat.bombardment.objectives`, a pack rule listing fortification regions, each cited. In `union-1861` the list is `fort_sumter` and `fort_pickens`; in the testbed it is empty.
  - Any other objective is refused `no_target` by the planner method, and the stage itself fires on nothing outside the list (rule 7).
  - A record-terms row must name a listed fort.
  - Tests: a town with a force believed in it is still refused, and the stage returns nothing for it.
  - A later fort (Hatteras, Port Royal, Pulaski) is added, cited, when its lane needs it. A populated place needs its civilian consequences authored first, under the sign rule.
- **The surrender notice** (the gate's text amendment): `packs/union-1861/situations/drafts/sumter_evacuated.json`, unsigned, so never loaded.
  - It is a notice for the Union, tagged `capture-in-battle`, placed `text`, with no effects. It cites OR I-1 pp. 12-15.
  - It fires on the principal's knowledge of the `fort-surrendered` report with token `evacuated_under_terms` about `fort_sumter`, and on nothing else.
  - Its strings are in `strings/en.json`: the title "Fort Sumter surrendered on terms", and this text:

    > Major Anderson has surrendered Fort Sumter on the terms General Beauregard offered on 11 April: his command is allowed "the removal of yourself and command, together with company arms and property, and all private property, to any post in the United States which you may select", and may salute its flag.

  - The quoted words are OR I-1 p. 13, verbatim, as `L3-sumter.md` prints them. One word differs from the lead's template: "allowed" joins "his command is" to the quotation, because the offer's own words are about the removal, not the command. The gate reviewer signs it and moves it out of `drafts/`.

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
- **Lane 1.11's Sumter hook — done in R78:** `reduce_sumter` sends the goal the bombardment reads (posture `take`, objective `fort_sumter`, to `cs_cmd_charleston`; c878fd9 on `phase1-situations`). The duplicate doctrine row is removed, and `bombardment.test.ts` now checks the history with the situation as the order's only source.
- **The people verbs bounce like orders** (the lead's addition): inquire, transfer, relieve, audience and observer are accepted for a post the principal believes held, and come back undelivered on arrival, as orders do (0052).
- **`believedHolder` reads every capture** (the lead's addition), not only battle records: a commander captured in a bombardment, or by any later route, is believed held until the report arrives.
- **Resignation** (the lead's addition, 2026-11-17; lane 1.12 recommended its own lane, and the lead had not yet ruled):
  - About 15 officers in US service on 5 March resign after their states secede: Lee, the Johnstons, Cooper, Ewell, Longstreet, Magruder, Stuart and others. Each resigns as his own act, by his values and traits. Thomas, Farragut and Scott stay.
  - Once his state's government joins the other side, the weekly people step offers him resign or stay.
  - If he resigns, he leaves his post (the vacancy rules handle it) and becomes an unposted officer of his rank for the other principal to appoint. His bloc follows his service.
  - A history run takes the sourced date as its historical default.
  - The 15 then take their true start in US service, and lane 1.11r3's stand-in labels go.
  - Tests: one officer resigns, another stays, and the history run brings J. E. Johnston to Confederate service by July.
  - The rule-seat principal's `candidates` already lists unposted serving men of his side, so a resigned officer reaches him with no change from lane 1.12.
- **Each Part A stand-in names an owner lane** (the lead's addition):
  - lane 1.14 for the [I] bombardment parameters and the concentration posts;
  - 1B for gun counts (today, the known men of the gun arms).

## Part B (R48)

Only the four items that do not wait on lane 1.11 were implemented. Git was read-only. No R47 or R49 files, existing signed situation, gate signature, historical start row or war flag was changed.

### The capital

- `State.factionCapitals` has one owner, `command/capitals.ts`, copied once from `FactionStart.capital`. `OWNED_FIELDS`, `START_OWNERS` and FOUNDATION section 10 name the owner.
- A situation proposes `faction_capital`: its subject is the destination region, its side the faction, and its delta 0. Both the pack validator and command owner reject invalid references or a nonzero delta. `capital_moved` records the applied event.
- `confederate_capital_moved.json` requires both day 85 (29 May 1861) and `virginia_seceded`, following R57's B2 correction. It has no railroad label. When it fires, it changes the dispatch destination from Montgomery to Richmond. Its plain text says Davis arrived there, without dating the move of every ministry. Its administrative subject touches no registered gate topic; no signature was authored. Lane 1.11 supplies the flag; with no setter on this base the notice never fires.
- Principal locations, the principal's own post, capital fallbacks, menu route origins and the drafting benchmark read State. Davis's fixed start-post seat therefore cannot keep dispatches at Montgomery after the move. Explicit ministry seats are not given invented removal dates.
- Source: `docs/research/_parts/I-richmond.md`, item 2, Davis's Richmond-dated telegram (OR IV-1 p. 361) and the contemporary arrival report (Rebellion Record vol. 1, Diary p. 84). The note distinguishes the resolution agreed 20 May / approved 21 May (OR IV-1 pp. 342-343), the War Department order of 25 May (p. 354), and Congress's first Richmond sitting on 20 July.
- **Proposed ruling [I]: command owns the capital, effective 29 May.** Rejected: a second capital in politics or the seats World; 20/21 May, which dates authorization; 25 May, which dates one department's order; and 20 July, which dates Congress rather than the president's arrival. The lead records acceptance under 0096.

### People messages and loss belief

- Inquire, transfer, relieve, audience and observer validate the principal's believed holder. On arrival a vacant post or changed holder returns the original dispatch by its route, with the existing `order-returned` claim and `vacant_post` / `holder_changed` token. No compliance response, grievance, transfer, audience counter or observer posting occurs on that failed delivery.
- Audience now travels by the existing `in-person` route: same-region delivery is immediate; elsewhere the bearer rides. Counter packets are immutable message values. Counters and cooldown are checked again on arrival. An observer's commission records the expected host separately from the observer and travels to that post's headquarters.
- **Proposed ruling [I]: these effects occur on arrival, including the audience; an observer's host identity belongs in the commission.** Rejected: keeping an immediate audience that reads a true vacancy, and following a captured addressee to his side's capital instead of taking the dispatch to the post.
- `tick/commander-losses.ts` writes the shared loss report after each phase's holder/status transition. Battle-only report production is removed. The report's truth names the lost holder, so `believedHolder` works for bombardment and later routes, through a filter, and without retained battle records. A post that lost all its blocks stays addressable until the report arrives.
- The phase boundary matters: a commander appointed in deliveries and captured by bombardment that same day must also be reported. A retained red test exposed the daily-snapshot gap; the phase observer and the regression now pass.

### Stand-ins, generated files and checks

- [I] Bombardment parameters and concentration posts name **owner lane 1.14** in code and pack labels. The known men of the gun arms, standing in for gun counts, name **owner 1B**. No number or doctrine choice changed.
- Regenerated `packs/union-1861/data/world.json` with `npm run pack:generate -- union-1861`: only the three owner-source labels changed. No format/schema extension was needed.
- Regenerated `packages/cli/test/fixtures/saves/testbed-seats-day40.json` with `npx tsx tools/make-save-fixture.ts`: its only State addition is `factionCapitals`; existing State fields, command log, log hash and world hash are unchanged. No save schema bump before a public build (0052).
- Final full gate: **100 files; 1,270 passed / 3 skipped**, exit 0, including typecheck, boundary (287 files, 61 terms), licences and decision index (95 records / rows). The three timing skips are the existing 0086 opt-in tests. No-git mode excludes the Git-writing staged-hook file before collection.
- Standalone done check: **6/6 pass**, exit 0; daily replay, save/resume and all existing liveness bands pass. Union median/p95 **32.08/57.48 ms**; testbed **4.01/5.52 ms**. No liveness band was changed.
- Evidence: `runs/r48/check-settled.log`, `done-check.log`, `final-checks.json`, `final-inventory.json`, `preservation.json`, and the focused/red/correction logs. Done-check run artifacts are in `runs/r48-done/` and `runs/r48-done-drafting/`. Workspace links resolve to this worktree.
- The first full run had two obsolete assertions (root-field inventory; notices having no effects). Their corrections were checked narrowly. Component checks caught the historical test's package boundary; it now lives under the pack. The 1,269-pass full run is retained; the final 1,270-pass run includes the subsequent same-day-capture correction. Earlier failures remain in their own logs.

### R57: the two standing-review corrections

- R57 initially made audience issue-time validation choose a prospective `hold` subject whenever the post had no plan, independent of the true holder. Its regression held knowledge and undelivered traffic fixed, changing only holder/status truth between a present commander and an unreported capture; both commands were accepted and charged the same positive pack price. R60 below replaces that stand-in with refusal at issue and retains the paired-State regression.
- The Richmond notice uses exactly `all: [dayAtLeast: 85, flag: virginia_seceded]`, with no railroad label. The pack test checks no move on or after 29 May without the flag; with the prerequisite supplied explicitly, it checks 28 May, the 29 May move, and no second move after save/resume. This is a boundary test, not the deferred history run.
- Pack validation exits 0: **0 errors / 810 warnings**, including the expected `situation-flag-unset` warning for `virginia_seceded`. No validator was weakened and no fake setter was added; lane 1.11's existing `virginia_secedes` will supply it on integration. The exact warning is retained in `runs/r57/virginia-flag-validation.json`.
- Both regressions failed for the reported defects before the fixes (**2 failed / 16 passed**). The corrected belief, audience and capital suites pass **46 tests**. Required full check exits **0: 100 files, 1,272 passed / 3 established optional skips**, plus typecheck, boundary, licences and decision index. The separate done check exits **0: 6/6**, with all existing liveness bands unchanged, daily replay and save/resume passing. Union median/p95 **32.43/61.01 ms**; testbed **6.29/23.70 ms**.
- Evidence: `runs/r57/regression-red.log`, `regression-green.log`, `pack-validate.log`, `check.log`, `done-check.log`, `final-checks.json` and the final inventory/preservation records. Run artifacts are in `runs/r57-done/` and `runs/r57-done-drafting/`. No generated file, State field, signed item, liveness band or other run's worktree changed. No additional ruling was needed beyond R57's instructions.
- V4, C2 and C4 were left untouched, as directed; their review notes are unavailable here and the lead routes them to OPEN_QUESTIONS. The lead/steward owns that document. No broader campaign or new feature was undertaken.

### R60: no-plan audiences agree at issue and arrival

- `applyVerb` now passes `null` for the prospective subject, as arrival already does. The principal's own `planRecords` determine whether there is a subject; no true-holder comparison is introduced. With no plan, refusal is immediate (`bad_counters`), with no attention charge or audience dispatch.
- R57's paired-State test remains: identical knowledge and undelivered traffic, different holder/status truth, identical refusal and unchanged attention. A separate tick test requires no-plan refusal, no attention charge, no audience message and no held audience. The audience bounce fixture now supplies an existing hold goal through `setGoal`, preserving its vacant/changed-holder arrival checks.
- Before the fix, the two refusal regressions failed as expected: **2 failed / 43 passed**. After the fix, both complete affected files pass **45 tests**, exit 0. The required full check exits **0: 100 files, 1,273 passed / 3 existing optional skips**, with typecheck, boundary, licences and decision index passing.
- The required standalone done check exits **1: 5/6 criteria pass**. Behaviour, daily repeat/frozen hashes, replay/save-resume, liveness and FOUNDATION test presence pass. **Timing remains unmet:** Union median/p95 **101.71/197.10 ms**, against unchanged **40/160 ms** limits; testbed **5.01/32.03 ms** passes. No liveness band or timing threshold was changed and no long run was retried. A read-only snapshot after the run found 77 Node processes and 16 logical processors; it establishes no cause and no process was stopped. The lead owns the next bounded timing check.
- Evidence: `runs/r60/regression-red.log`, `regression-green.log`, `check.log`, `done-check.log`, exit records, `runtime.json`, `final-checks.json` and `final-preservation.json`; standalone artifacts in `runs/r60-done/` and `runs/r60-done-drafting/`. Git is read-only. No generated file, schema, saved fixture, pack rule, State field, signed item or other run's worktree changed. No additional proposed ruling was needed; standing review remains pending.

R77 below reports the first integrated history and R78 repairs the bombardment's timing and removes the duplicate doctrine row. Consult policy, Butler’s integration and the 4 July message as an `address` remain deferred. Resignation remains its own lane. R57’s three-day capital test remains a separate boundary control.

### R74: recorded terms require the recorded case

- `combat.bombardment.recordTerms` now requires `commander` and `offerWindow`. A window is either `null` (no recorded offer date) or `{ offerDay, lastDay }` in scenario days. `fortDay` matches region, defending faction, the actual holder of the defending post on surrender, and `offerDay < day <= lastDay`. A missing commander, a replacement, or a fall outside that window receives `captured`, through the unchanged forces, command and people owners. No State field or second writer was added.
- Pack schemas and kernel types agree. Semantic checks reject unknown commanders and non-integer, negative, empty or reversed windows. Regenerated only `packages/pack-format/schemas/{pack,world}.schema.json` with `pack:schemas` and `packs/union-1861/data/world.json` with `pack:generate -- union-1861`; both exit 0. No signed situation, string, gate record, scenario, save fixture, lockfile or combat parameter changed.
- **Proposed ruling [I]:** use the documented offer-to-agreement interval conservatively: after 11 April through 13 April, days 37–39 from the scenario's 5 March start. The dates and named participants come from `L3-sumter.md` sections (a)–(b), read from the main checkout: OR I-1 p. 13 (11 April offer), pp. 14–15 (Anderson's acceptance and Beauregard's renewed terms on 13 April), p. 12 (Anderson's telegram). This is the model's applicability window, not a claim that the offer legally expired that night. Rejected: an indefinite window, widening it to preserve a late run, or recalibrating doctrine/deliveries in R74.
- Tests cover a replacement before bombardment, early and late falls, both date boundaries, an undated row, a vacant command, schema/reference errors, the historical Sumter proposal, and the ordinary delayed run. The fictional cases apply results through `bombardFort`/full ticks and check capture status, the garrison and reports. Initial red: 8 failed / 11 passed; after correction, 19/19 kernel cases pass. Pack-boundary red: 1 failed / 5 passed, then green in the full check. A pack fixture initially named an absent person; the corrected test selects a real unposted Union record. No production rule was changed to accommodate that fixture.
- **Hash comparison:** historical 13 April `FortDay` proposal stays `62df97f062af0b7b9dc90f6e1751334bace54edb41a284d18a668ccef5f0ac5a`. This is an isolated historical-case check, not a completed end-to-end historical run. The existing at-war reference still falls on day 46 (20 April), outside the window: final State changes from `11a3d7b52fe5769d79f8773e5cd9fdf596a67b3d22aab4dfe2e8becf331a5a3e` to `c7e932dacd5e12a4c0b696de985548911543ee3db5ac4d54518d53a3999ab138`. Its initial-State hash and command-log hash are unchanged. The combined pack hash changes from `d6e54ddf624eb22bfe1b64e08428cc7f5ee1c30ab918d239859563f1f4c8ebc5` to `11b824d66158bb5051e4cafc044cbccb69cfa89d38633c202b3e9590683b5698` because the row gains its conditions.
- **Seven Union bands changed from measured outcomes:** `combat.evacuated` 1..4 to exact zero (late fall); `combat.captured` zero-floor/no ceiling to 1..4; `reports.commander_lost` exact zero to 1..4; `situations.fired`, `notice_reports`, `noticed` and `surfaced` each 1..4 to exact zero because the evacuation notice has no cause. Evacuation now has a `QUIET` entry naming its historical-match kernel test; commander loss leaves `QUIET`. Testbed's commander-loss band remains exact zero, and its evacuation bounds remain unchanged. Other bands and timing thresholds are preserved. The pre-adjustment six gate failures are retained, rather than hidden by rerunning the campaign. The late run's existing CLI test now requires `captured` and no evacuation notice.
- **Required checks:** root check exit 0 (102 files, 1,295 passed / 3 existing optional skips), including types, boundary, licences and decisions. Done check exit 0, **6/6**, including daily frozen/repeat hashes, replay and mid-run save/resume. Union median/p95 **30.86/63.45 ms**, testbed **3.34/4.82 ms**. Two final comment/reason corrections and restoration of the testbed's exact-zero ceiling reuse the passing suite and retained campaign rows; the final table's six structure checks pass separately. No full suite or expensive campaign was repeated for reassurance.
- Evidence: `runs/r74/final-checks.json`, retained red/correction logs, `check.log`, `done-check.log`, `hash-comparison.json`, inventories and preservation records. Standalone artifacts: `runs/r74-done/` and `runs/r74-done-drafting/`. Git was read-only; HEAD and worktree git metadata are preserved. No R73 worktree write, merge, install, build, browser or server.

For the lead:
1. Route R74 to Claude's standing reviewer under 0096, including the proposed applicability window and seven directly affected bands.
2. Retain the deferred Part B history work after lane 1.11 lands; R74 does not repair the late doctrine run or claim 31 July history validation.

## R77: lanes 1.11 and 1.12 Part B integrated (2026-11-19)

Read the standing, command-line and writing rules and 0096. Work stayed in `C:/Pyrrhic/mandate-rule-seats-b`, apart from the single requested status in the main checkout's CODEX.md. Git is read-only; the captured HEAD, index and merge metadata are unchanged. Claude's standing reviewer owns review under 0096. Proposed rulings: none.

### Merge contents

| Conflict | Resolution |
|---|---|
| CLI liveness table | Keep lane 1.11's 148-day reference and R74's capture, zero evacuation and loss-report bands. Preserve R74's testbed zero-loss band and historical evacuation driver. |
| War-gate test | Keep the non-null war-flag invariant and the authored own-government decision writers; the pre-authoring absence assertion is obsolete. |
| Command owner | Keep capital moves and all succession, temporary-post and declared-government branches, with separate validation and applied results. |
| Battle reports | Keep the incoming battle IDs and public press result; retain Part B's shared phase-boundary loss reporter, avoiding the old battle-only duplicate. |
| Tick context | Keep both capital and institutional-succession events. |
| Tick forces | Dispatch both lanes' command proposals to their existing owners. |
| People verbs | Keep Part B's in-person audience dispatch, arrival effects and bounces. Supply the incoming required `verb:audience` response kind at arrival. |
| Pack situations validator | Keep both capital validation and succession/temporary-post/declared-government validation. |
| Union strings | Preserve every key/value from both parents, without duplicate keys. |
| Day-40 save | Regenerate with `npx tsx tools/make-save-fixture.ts`; its log and log hash match both parents. Against the incoming fixture, only `factionCapitals` is added to State. |

Further compatibility correction: the ungated capital notice needs `namedOnly` under lane 1.11's name check. Its annotation identifies the sourced administrative destination and disambiguates the two Davises; no trigger, effect, wording or speaker guard changed. The initial two loader errors are retained. `pack:generate -- union-1861` exits 0 with zero errors; all four generated data files are already identical to its output. Signed situations and gate records are unchanged. No schema, scenario, combat parameter, doctrine row, checkpoint band, lockfile, new State field or feature was added.

### First integrated history

`npx tsx runs/r77/history.ts` runs the pack's seed from 5 March to **31 July/day 148**, without `--at-war`, with daily hashes, replay and a day-60 save/resume: **exit 0, zero rejections, no liveness gate failures**. Final State: `da5627c37d44329fc1def3ce249c90d5e2ca66324e0e03fcc7e3a8e70ddd3e6c`; combined World: `b4f70f7cbc8fd5d2ad1ecc78f7783f43e2febe3e478a4d860a818f7e576a737e`. The standalone done check independently reproduces all 148 daily hashes.

- **Sumter fails the reviewer's historical condition.** Anderson commands until surrender on **20 April/day 46**; Beauregard commands the attacking operation. R74's commander condition matches, but its date window ends on day 39. The result is capture: the 85-man garrison's strength becomes zero, Anderson is captured, `combat.captured = 1`, `reports.commander_lost = 1`, `combat.evacuated = 0`, and the signed `sumter_evacuated` notice never fires by day 148.
- **Why late:** the authored `reduce_sumter` decision is taken on day 37; the retained doctrine issues another order on day 38. Walker objects to both on day 38. Two bypass messages depart on day 39 and reach Beauregard on day 42. He chooses the bombardment on day 43, its axis enters the bombard stage on day 44, fires on days 45–46, and ends on day 47. No duplicate order, relay, route, concentration day, trait, parameter or offer window was changed here.
- **Richmond:** `virginia_seceded` is set on day 43 (17 April). Exactly one `capital_moved` event occurs on **day 85/29 May**; its notice surfaces on day 86. State retains Richmond through day 148.
- **War:** the Confederate `confederate_opening/reduce_sumter` decision sets its flag on **day 37/11 April**. The Union `call_for_troops/militia_call` decision sets its own flag on **day 38/12 April**. The pack's setter audit confirms these are decision options of the respective faction, with no notice or other-side setter.
- **Texas:** Houston is replaced by Clark by the inherited `post_succeeded` event on day 11; the old vacancy finding is retired.

Evidence: `runs/r77/history-findings.json`, `history-summary.json`, `history-trace.json`, `history-final-state.json`, `history-save-day-60.json`, and `done-summary-comparison.json`.

### Bands and checks

The [complete band comparison](../runs/r77/band-reconciliation.md) lists **77 changed numeric bands against R74's 75-day at-war reference**, and **three against lane 1.11's 148-day reference** (capture, evacuation, loss reports), with bounds, measured counts and causes. `band-merge-diff.json` also retains all 103 literal Union-row differences against R74, including explanation-only differences. Historical checkpoint bands are unchanged. **No band was fitted after the history result.**

The retained R73 run differs in nine measured counts: the three surrender/loss counts and six within-band counts (age pruning, courier delays, messages sent/delivered, response pruning and situation proposals). All daily differences and causal limits are in `measured-differences-from-r73.json`. The capital proposal is observed directly; inferred routing/pruning explanations are marked [I], with per-paper attribution left unestablished where the old summary has no IDs. No extra counterfactual campaign was run.

- Root `MANDATE_NO_GIT=1 npm run check`: **exit 0, 126 files / 1,440 passed / 3 optional skips**. Types, boundary, licences and decisions pass. This is the exact required no-Git check.
- Desk: dependencies were absent; locked `npm ci` exits 0. Typecheck and suite exit 0: **84 passed / 8 existing optional skips**. No build, server or browser was started.
- Standalone `npm run run:done-check -- --label r77-done`: **exit 0, Phase 0 6/6; 1A 1/6**. Eight seeds, fork cap 400 days, default drafting measurement, all limits unchanged. union-1861, war by decision, 148 days: 34.29/65.80 ms median/p95; testbed, 120 days: 3.30/4.93 ms median/p95; union-1861 history run, 148 days to 1861-07-31: 34.29/62.27 ms median/p95. Limits remain **40/160 ms**.
- All failure categories were read. No full suite, sweep or unchanged review was repeated after the result. `done-comparison-with-r73.json` compares every criterion and problem list with retained R73 evidence. Preflight failures and their targeted corrections are in `preflight-corrections.json`; the other seven focused files' passing evidence was reused, then the required full suite passed.

Remaining done-check failures:

- **checkpoints (FAIL):** union-1861 history run, 148 days to 1861-07-31: side_western_virginia (1861-07-31, day 148): no government in the pack stands for western Virginia (the Restored Government at Wheeling) (a data gap: the band is union); union-1861 history run, 148 days to 1861-07-31: men_confederate (1861-07-31, day 148): confederate has 19957 men, below 100000; union-1861 history run, 148 days to 1861-07-31: operations_union (1861-07-31, day 148): union fought 0 planned operations, below 1; union-1861 history run, 148 days to 1861-07-31: operations_confederate (1861-07-31, day 148): confederate fought 0 planned operations, below 1
- **operation (FAIL):** union-1861 history run, 148 days to 1861-07-31: no operation fought a battle in the history run (2 operations, 0 battles)
- **pushback (FAIL):** union-1861 history run, 148 days to 1861-07-31: relay holds: 1, below the record's 2; union-1861 history run, 148 days to 1861-07-31: filter holds: 0, below the record's 1; union-1861 history run, 148 days to 1861-07-31: trims: 0, below the record's 1; union-1861 history run, 148 days to 1861-07-31: compliance with reservations: 46, above 9
- **stand-ins (FAIL):** packages/kernel/src/situations/types.ts:73: a stand-in with no owner (write STAND-IN(<key>; owner: <lane>)); packages/pack-format/src/situations.ts:63: a stand-in with no owner (write STAND-IN(<key>; owner: <lane>))
- **lever-sweep (FAIL):** union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: measured in part: the victory measure does not read people/grievance (policy pushback) (its own choice). Until it does (the people's response through self-emancipation waits for enemy capacity in 1B), no D6 result for this decision counts as evidence (G-1.14c, G-1.14d); union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: chain unexercised: no border governor answered a call inside the horizon of 24 moves weighed (seeds 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868), so the policy's effect through border loyalty on regiments was never seen (G-1.14b)

Final evidence index: `runs/r77/final-checks.json`. Final inventories and metadata preservation are in `final-preservation.json` and `final-inventory.json`. The source inventory and runtime diagnostics preceded this closeout; the final audit includes this hand-over. Claude commits the merge after review. R77 does not stage, commit or abort it.

## R78: the bombardment opens on time (2026-11-19)

For the lead: 2 items. Implemented **R78 only**, from the lead's R77 merge `235cfef`, on `phase1-rule-seats-b`. Git was read-only. R79 and other worktrees were not changed. The historical Sumter condition is met; the wider 1A milestone remains incomplete. Independent review belongs to Claude's standing reviewer under 0096.

### Where the week went, and the corrections

R77's trace was the baseline: authored goal day 37, duplicate doctrine goal day 38, Walker's objections day 38, bypasses sent day 39 and received day 42, choice day 43, concentration to day 44, and fire days 45–46. There was **no march across the harbour and no works phase** in that operation. The unnecessary operation time was field concentration and a day spent entering `bombard` before firing. The relay preserved the requested wire route; the later bypass policy hard-coded a special messenger.

| Change | Effect on the fall date |
|---|---|
| Remove the Confederate doctrine's Sumter offensive row. The authored `reduce_sumter` option owns the goal. | No date gain by itself; removes the duplicate goal, objection and bypass. One authored goal and its necessary bypass remain. |
| An urgent bypass chooses the fastest offered route, with price breaking ties. Reviews and the word to go use the same rule. | The Montgomery–Charleston bypass uses the existing zero-day wire instead of a three-day special messenger: **three days earlier**. No map, latency constant or person's traits changed. |
| Add required `WorldRules.combat.bombardment.inPositionPreparationDays`, stated as zero with a reason by both packs and both shared fixtures. The planner uses it instead of field concentration; a ready axis fires on entering the bombardment stage. | This operation loses its one concentration day and its empty stage-transition day: **two days earlier**. In the model, readiness means live guns standing at the planned firing shore, within the pack's water-edge range. Displaced guns must march back, and cannot fire inland. |
| Settle an option's zero-day order hops and their replies in phase 4b, through the existing delivery owner. Positive travel/holds remain in transit; other queued reports retain their dispatch phase. | Walker receives the local order and his objection returns on the issue day, rather than tomorrow: **one day earlier**. The normal next-morning bypass and commander's choice are retained. |
| Replace the opening option's four-day clock with availability from **10 April/day 36**, still requiring the opening situation's existing relief/landing/fallback cause. | The recorded initial authorization goes out on 10 April instead of 11 April: **one day earlier**. This is an absolute earliest authorization date, not a new three-day deliberation rule. |

The accounting is **day 46 → 43 → 41 → 40 → 39** after the no-date-change duplicate removal. Intermediate dates are [I], computed from the retained route and stage timings, not five new counterfactual campaigns. A retained 60-day probe after the first three changes directly observes day 41 (`runs/r78/probe-trace.json`).

**Sources read:** Walker's authorization of 10 April and Beauregard's same-day reply are [OR I-1 p. 297](https://ehistory.osu.edu/books/official-records/001/0297). The further exchange of 11 April is [p. 301](https://ehistory.osu.edu/books/official-records/001/0301). Beauregard's detailed report, dated 27 April, says the channel defences and batteries were completed before the 11 April demand, and records instructions received by telegraph at 9.10 p.m. after the aides returned at 5.10 p.m. ([p. 30](https://ehistory.osu.edu/books/official-records/001/0030)); it places the signal shell at 4.30 a.m. on 12 April ([p. 31](https://ehistory.osu.edu/books/official-records/001/0031)). Whiting's complaints about confused new infantry and support preparations remain important counterevidence to treating the whole force as ready ([p. 302](https://ehistory.osu.edu/books/official-records/001/0302)). The fix concerns batteries already positioned, not the readiness of every reinforcement. The terms remain sourced by `docs/research/_leads/L3-sumter.md`, OR I-1 pp. 12–15.

**Proposed rulings [I], for the lead to record:** the zero battery-preparation setting, fastest-route bypass policy and issue-day settlement implement R78's physical/latency ruling. The date correction treats the 10 April authorization as the option's earliest availability while retaining its event cause. Rejected: fitting a three-day relative clock only to this run; retaining an unsupported four-day wait; overriding Walker's compliance or changing his traits; skipping an unmade commander's choice; widening R74's offer window or changing morale, losses or surrender thresholds. Walker's objection is still the model's behaviour; the source has him issuing the order, not objecting to it.

### Checked history and wider dates

The run without `--at-war` reaches **31 July/day 148**, zero rejected commands, all daily replay hashes matching, and day-60 save/resume matching. Final State: **`444394e36f9ad384f9998516d5d2d129a969e6e11e7bada5889984ba28d6659a`**. World: `4a379964b2ba89f0c2adac5c3f506ac075d21cb8f17f02f91579afda331784b6`. The initial State hash is unchanged from R77.

- **10 April/day 36:** the authored goal, and Walker's objection received by Davis.
- **11 April/day 37:** the single bypass travels by wire and reaches Beauregard; he drafts.
- **12 April/day 38:** his normal choice approves the bombardment and the ready guns fire.
- **13 April/day 39:** second day of fire; Anderson surrenders under the unchanged recorded terms. His garrison leaves play, he remains serving, `combat.evacuated = 1`, `combat.captured = 0`, no commander-loss report. Day-39 State hash: **`6f135c6271896119347e94e4343bdc11ad82efaeca58e083aef0e38d5f219965`**.
- **14 April/day 40:** the signed `sumter_evacuated` notice fires on receipt of the report. Its bytes and gate material are unchanged. This model's day-39 event represents the agreement/fall; the source distinguishes the physical departure on 14 April.
- **Wider existing chain:** Confederate war flag is now day 36 (10 April), Union war flag day 37 (11 April), `virginia_seceded` day 42 (16 April). Each government's own decision remains the writer. These are one day earlier than R77, not corrected elsewhere by R78. Richmond remains one move on **29 May/day 85**, after the prerequisite, and remains Richmond through July.

`history-findings.json`, `history-trace.json` and the day-60 save contain the evidence. The original history command's **exit 1** is retained: it encountered four stale liveness bands. Its retained summary passes the final table (**exit 0**, `retained-history-validation.json`), without repeating that campaign. The standalone done check independently reproduces **all 148 Union daily hashes**. All **120 testbed daily hashes** match R77.

### Bands, checks and preservation

Only four numeric Union bands change: capture **1..4 → 0**, evacuation **0 → exactly 1**, special messengers **1..6 → 0**, commander-loss reports **1..4 → 0**. Their reasons are the recorded evacuation and wire bypass. Evacuation leaves global `QUIET`; commander-loss reporting gains its existing shared-path kernel driver. Testbed numeric bands, historical checkpoint bands, seeds, fork horizons and timing limits are unchanged. All four changes and all **25 changed measured counts** against R77 are retained in `band-differences.json` and `measured-differences.json`; other counts stay within their existing bands. No extra attribution campaign was run.

- Exact `MANDATE_NO_GIT=1 npm run check`: **exit 0, 126 files / 1,445 passed / 3 optional skips**, including types, boundary, licences and decisions. An initial long run was stopped when four files exposed the missing new field in the pack-format shared manifest. Adding that field passed **262 focused tests** and the remaining cheap gates before the corrected full check. All failure and correction logs remain.
- Desk typecheck and suite: **exit 0, 84 passed / 8 existing skips**. Their evidence is reused after only a non-desk test-fixture correction. No build, server or browser campaign.
- Standalone `npm run run:done-check -- --label r78-done`: **exit 0, Phase 0 6/6; 1A 1/6**, eight seeds and default drafting measurement. Union reference median/p95 **36.95/70.67 ms**; testbed **3.85/5.67 ms**; Union history **37.86/66.40 ms**. Limits remain **40/160 ms**.
- Every 1A failure category was read. All eleven non-budget statuses match R77; the only changed problem text is **45 reservations rather than 46**, still above nine. Checkpoints, operation, pushback, stand-ins and lever sweep remain failed. Their full lists are in `done-criteria.json`. Zero wins for `return` is still not D6 clearance while the channels and border recruitment chain are unmeasured.
- Regenerated schemas, both pack Worlds and the day-40 save with their own tools. The save's State, log, State hash and log hash are identical; only its World hash changes for the explicit pack rule. No new State field, owner, save schema, player wording, trait, strength or existing combat rate was introduced or tuned. R74's whole `recordTerms` row is identical.
- Final source inventory and runtime diagnostics precede this closeout. **27 delivery files, 1,615 other baseline files unchanged**, no addition/deletion outside ignored evidence; all **nine captured worktree Git metadata files unchanged**. Signed items, gate records, source rosters, checkpoint files and lockfiles are preserved. Evidence index: `runs/r78/final-checks.json`; inventories: `final-inventory.json`, `final-preservation.json`.

For the lead:
1. Review R78 under 0096, including the proposed earliest authorization date, its effect on counterfactual availability, the late order-delivery settlement and the four directly affected liveness bands.
2. Retain ownership of the five failed 1A gates and the wider opening-chain date shifts. R78's Sumter condition and passing Phase 0 checks do not waive them.

## Findings outside my scope

1. **Lead / lane 1.11:** its unchanged opening-flag chain now produces Union war on 11 April and Virginia's notice on 16 April. These are observed consequences of the sourced one-day authorization correction; separating an authorization flag from actual fire or revising the later chain needs its own ruling. R78 does not silently repair other situations to preserve old dates.
2. **Lead / lane 1.14 and R79:** retain the failed checkpoint, operation, pushback, stand-in and lever-sweep gates. R79's hook bound and label cleanup were not undertaken. The only changed problem count is reservations 46 → 45; no acceptance criterion was retired.
3. **Lead / remaining Part B policy:** consult policy, Butler's integration/placeholder cleanup and the July message as `address` remain deferred. Resignation is its separate lane. The duplicate Sumter doctrine row is now removed.

## R80: the opening follows received news (2026-11-19)

For the lead: 2 items. Implemented **R80 only**, from `ebb4227`, on `phase1-rule-seats-b`. Git commands were read-only; no staging, commit, fetch or push. R79 was not undertaken. Independent review remains with Claude's standing reviewer under 0096. Evidence index: `runs/r80/final-checks.json`.

### Built and proposed choices

- Each day of bombardment produces the defending commander's `wire-dispatch`, subject the fort, with a `battle-phase/bombard` claim. It is written before surrender vacates his post. The ordinary route and filter still apply. Due phase dispatches enter the delivery owner before situations; positive travel remains in transit.
- `sumter_fired_upon` fires and surfaces only on that received claim at `fort_sumter`. Neither it nor the troop-call trigger reads authorization flags or control. The old `sumter_fired` flag remains an authorization-era compatibility flag; it no longer tells Lincoln anything.
- The troop-call event registers received bombardment, surrender or evacuation news. It surfaces on a received `fort-surrendered` claim or evacuation notice, or after **two days holding bombardment news**. Both options open **one day after surfacing**. The new optional `knows.forDays` condition reads receipt time and the existing `since` window; there is no new State field or global timing rule.
- `confederate_opening/reduce_sumter` now uses **`clockAtLeast: 3`**, as R80 rules. It still surfaces on its existing cause. Its history decision stays day 36; a late cause moves the option with it.
- Removed the **17 Union doctrine call rows**. With the call now due on day 41, a forced-war fixture otherwise sends doctrine calls that morning and the authored call that evening. The authored decision now owns this call, just as it owns the normal peace-to-war path. Quotas, terms, both options and governor compliance are unchanged; New York answers once and musters in the retained fixture. Pack generation changes only that table in `data/world.json`.

**Proposed rulings [I]:** two days from receipt is the holding-fort fallback, and one day from surfacing represents consultation and publication. Reject an indefinite wait for surrender, an absolute 15 April cutoff, counting from a hidden or report-written day, and letting a dated doctrine duplicate the call. The lead already ruled on the three-day Confederate clock and the Anderson dispatch path; those are implemented, not new proposals.

**Sources read by this run:** [OR I-1 p. 31](https://ehistory.osu.edu/books/official-records/001/0031) dates the first shell to 4.30 a.m. on 12 April. [OR I-1 p. 297](https://ehistory.osu.edu/books/official-records/001/0297) contains Walker's 10 April authorization and Beauregard's reply. [OR III-1 pp. 67–68](https://ehistory.osu.edu/books/official-records/122/0067) contains the proclamation, dated 15 April on [p. 68](https://ehistory.osu.edu/books/official-records/122/0068), and that day's requisition. Frederick W. Seward's retrospective *Reminiscences* (1916), [pp. 151–152](https://archive.org/stream/reminiscencesofwsewa/reminiscencesofwsewa_djvu.txt), describes Sunday consultation after Washington knew the fort would evacuate, followed by preparation for Monday publication. The fallback interval is inferred from the 12-to-14 April interval, not a documented policy for a fort that holds.

**Source limit:** Seward places Washington's bombardment news on Saturday, 13 April, and describes assailants' telegraphic dispatches. Anderson's surviving report on [OR I-1 p. 12](https://ehistory.osu.edu/books/official-records/001/0012) is dated 18 April and describes departure on 14 April. R80's Anderson wire received on 12 April is a modelled reporting path [I], not an authenticated historical telegram. No telegram text was invented. Read pages and the limitation are retained in `runs/r80/sources-read.json`.

### History without `--at-war`

| Event or received knowledge | Run date / day |
|---|---|
| Confederate authorization / own war flag | 10 April / 36 |
| First shot; Anderson's first phase wire written and received by Lincoln; fired-upon notice fires and surfaces | 12 April / 38 |
| Fall under Anderson, evacuated under R74's unchanged terms | 13 April / 39 |
| Surrender claim received by Lincoln; troop decision surfaces; signed evacuation notice fires | 14 April / 40 |
| Troop decision issues the call and sets the Union war flag; evacuation notice surfaces | 15 April / 41 |
| Virginia notice fires / `virginia_seceded` | 20 April / 46 |
| Virginia notice surfaces | 21 April / 47 |
| Richmond move, once | 29 May / 85 |

Virginia's unchanged cause waits two days after its call is received; the call takes three days to arrive. No date was fitted elsewhere to hide the later call. `combat.evacuated = 1`, capture and commander-loss reports zero; Anderson keeps serving. The signed evacuation item, all gate material and R74's entire `recordTerms` row are unchanged.

The 148-day run reaches **31 July**, zero rejections, daily replay matching and day-60 save/resume matching. Final State **`59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`**. All 148 daily hashes match the standalone reference. All 120 testbed daily hashes match R78.

### Exact tick order for the lead's decision record

The morning ground/latency and standing plan menus still come first, from the State the seats were asked from (0052), followed by attention refill. Then:

1. **1 / 1b:** validate commands in log order; apply plan choices; flush messages. **2:** settle due messages through the delivery owner until none remain due. **2b:** apply immediate people changes. **2c:** answer plan edits and draft, then flush. **2d:** recruitment musters and disbandings.
2. **3:** operations, including fort bombardment, then movement. **3b:** battles and occupation. **4:** control and derived map. **4a:** stragglers and stores. **4a':** derived regional term.
3. **4a'' (R80):** temporarily remove the outbox, send only queued reports carrying `battle-phase`, and, if any exist, call the existing **full** due-delivery loop. This also settles any other already-transiting due messages and newly generated replies/filter hops. Restore the unselected outbox; surrender reports are unselected. Future arrivals and positive filter holds remain in transit. With no phase dispatch there is no additional loop.
4. **4b:** run situations in their existing order. **R78's `deliverSituationOrders` then adds its delivery pass:** remember the outbox length before situations; temporarily remove the outbox afterwards; select only new entries at or beyond that index carrying `msgOrder` (option goals and calls). If any exist, send them and run the same full due-delivery loop, including immediate replies and relays. Restore all unselected entries. It does not select pre-existing reports, new notice/staff reports or people verbs. Positive travel/holds remain in transit. Situations are not evaluated again that day.
5. **4c:** command proposals. **4d:** weekly people step and flush, when due. **4e:** politics and flush. **5:** field-battle reports, cyclic reports and observer letters, then flush. **6:** pruning. **7:** advance day. **8:** invariant barrier.

Thus an operation's due bombardment wire can inform today's situations, and a situation's zero-day order can be answered after them. A field-battle phase report written in phase 5, or an unselected surrender/notice report, still waits for the next delivery pass. The two additional calls reuse the delivery owner; they do not add a knowledge writer.

### Bands, validation and preservation

**No numeric liveness or historical checkpoint band moved.** The unchanged reference accepts the history. All **26 changed measured rows**, including magnitude-only differences, have old/new values, retained bounds and causes in [the reconciliation](../runs/r80/band-reconciliation.md). Direct producer/data causes are distinguished from downstream inferences [I]; no extra counterfactual campaign was run. All shifted situation dates are in `situation-date-differences.json`.

- Exact `MANDATE_NO_GIT=1 npm run check`: **exit 0, 127 files / 1,453 passed / 3 existing optional skips**; types, boundary, licences and decisions pass. Suite duration **355.45 s**. Focused evidence: 52 tests plus the six war-gate tests, including the real history order, hidden-State controls, a holding fort with a late wire, receipt-age boundaries, and due versus travelling dispatches.
- Desk tsc and suite: **exit 0, 84 passed / 8 existing skips**. No desk source changed.
- Standalone `npm run run:done-check -- --label r80-done`: **exit 0, Phase 0 6/6; 1A 1/6**, eight seeds, existing fork cap and default drafting measurement. Median/p95: Union reference **25.43/46.63 ms**, testbed **2.42/3.32 ms**, history **25.16/45.62 ms**; limits remain **40/160 ms**.
- Every failure category was read. **Checkpoints:** new Missouri-side failure; western-Virginia government still missing; Confederate strength **20,957 < 100,000**; both sides still have zero planned operations fought. **Operation:** two operations, zero field battles. **Pushback:** holds 1 < 2, filter holds 0 < 1, trims 0 < 1, reservations **44 > 9** (R78: 45). **Stand-ins:** the two existing unowned labels remain, one line number shifts. **Lever sweep:** the victory measure still omits the policy-pushback channel and the border recruitment chain remains unexercised. Return best in 0/8 is still not D6 clearance. Complete problems and R78 differences: `done-criteria.json`, `done-problem-differences.json`.
- Missouri's unchanged **106-day** cause now puts its provisional-government notice beyond the horizon. Its notice/effects/report account for the missing situation, proposal and side change. Arkansas's levy remains enlisted until **day 150**, explaining one fewer disbanding and the extra 1,000 Confederate men at day 148 after its government's side change. Neither acceptance band was widened.
- Initial fixture telemetry/type errors and the missing provenance key were corrected cheaply before the long gates. The forced-war duplication was reproduced and corrected before the full suite. A Windows default-code-page audit produced a false citation mismatch; explicit UTF-8 comparison passes. No expensive gate was retried.
- After the runs, corrected **only two citation strings**: encoding damage in the Anderson note and the obsolete absolute-date explanation. Final pack validation passes; normalized non-citation definitions are deeply equal, and the initial State is unchanged. The kernel does not read these citation fields. Behavioral evidence is explicitly reused in `citation-only-evidence-reuse.json`; no second history is claimed. Measured World **`32659168f36d661c3cd8ca7986844a8dd6c2ac8f1f495adec3cb8eb9077815bb`**; final World after citation cleanup **`84629d1ae8fa463de9fc67e0db9130c601017d1cfcf5b1c32ced649c52e768db`**. The final State hash above is unchanged.
- Regenerated the situation schema, Union World and save fixture with their tools. The save fixture is byte-identical. No State/save schema, trait, combat rate, report template, gate signature or player wording changed. Imports resolve to this worktree. No install, build, server or browser.
- Source inventory, runtime diagnostics and protected-input checks preceded this closeout. Final inventory: **19 delivery files, 1,625 other baseline files unchanged**, no deletion or unexpected path; **88 protected inputs unchanged**. Eight of nine captured Git metadata files retain their byte hashes. The index byte hash changed during the permitted read-only checks, but its staged diff is empty and HEAD stays `ebb4227`; no metadata restoration was attempted. Subsequent reads disable optional locks. Details: `final-inventory.json`, `git-metadata-observation.json`, `final-runtime.json`.

For the lead:
1. Review R80 under 0096, record the two delivery passes and the proposed receipt-based intervals, with their source limits.
2. Retain the failed 1A gates and route the later Virginia and Missouri consequences to their existing owners. R80 does not change their authored delays or waive their checks.

## Findings outside my scope

1. **Lead / lane 1.11:** the later Union call moves Virginia's notice to 20 April and Missouri's provisional-government cause beyond 31 July. These follow the existing receipt-and-delay rules; revising those rules is a separate decision. R80 supersedes R78's premature Union-flag finding.
2. **Lead / lane 1.14 and R79:** five 1A categories remain failed, now including the Missouri checkpoint. The hook bound, two stand-in labels and Taney follow-ups remain R79; no part of R79 was undertaken here.
3. **Lead / remaining Part B policy:** consult policy, Butler placeholder integration and the July message as `address` remain deferred. Independent review of this implementation remains with Claude.

## R81: cheaper post-holder lookup, unchanged outcomes (2026-11-19)

For the lead: 2 items. R81 only, from `f444fa2`, on `phase1-rule-seats-b`. Git commands were read-only; HEAD and the index are unchanged. No R79 work. Evidence index: `runs/r81/final-checks.json`.

### Change and profile

`heldPost` previously sorted every post ID for every person lookup, then scanned for that holder. It now scans own post keys once and chooses the code-unit-minimum matching ID. This preserves the old result even with duplicate holders, numeric-looking or differently inserted keys; inherited keys remain excluded. The regression checks insertion order, duplicate holders, inherited posts, an absent holder, and a replaced table while retaining the original State. No State, World, ownership, tick order or report writer changes. Proposed rulings: none.

The Node CPU sampler runs over both 148-day done-check slots. Those slots have identical scenario/defaults (`atWar:false`); the production runner measures them separately. The category table below excludes setup and checkpoint hashing, and leaves unparented GC samples unassigned. Values are sampled CPU milliseconds per day, not an additive breakdown of the median stopwatch result.

| Sampled category | War before | War after | History before | History after |
|---|---:|---:|---:|---:|
| Morning requests, including views/freezing | 11.540 | 9.010 | 10.869 | 8.562 |
| Delivery | 4.834 | 4.724 | 4.426 | 4.466 |
| Cyclic reports | 4.745 | 4.426 | 4.229 | 3.844 |
| Politics and press | 2.881 | 2.092 | 2.752 | 1.855 |
| Situations | 0.290 | 0.334 | 0.224 | 0.274 |
| Map | 1.072 | 1.000 | 1.104 | 0.841 |

The remaining largest self costs are `deliverReport` (3.77/3.69 sampled ms/day), `heldPost` (3.53/3.44), and `deepFreeze` (1.16/1.22). Before the change, `postIdsOf` alone cost 5.25/4.54 sampled ms/day; afterwards it costs 0.65/0.42. This is the profile evidence for eliminating the repeated sort. Situations' condition scans are a small part of this run. Raw CPU profiles and `day-profiles.json` retain the other phases and stacks.

### Back-to-back comparison and its limit

| 148-day slot | Before median / p95 | After median / p95 | Observed median reduction |
|---|---:|---:|---:|
| War by decision | 23.068 / 41.956 ms | 20.576 / 36.875 ms | 2.493 ms |
| History | 22.021 / 41.649 ms | 19.404 / 32.466 ms | 2.617 ms |

Both optimized medians are below the requested 28 ms number. **The requested unloaded comparison is not established.** Other jobs remained active after a bounded quiet-host wait; aggregate load samples were 31%, 80%, 56% before the pair and 3% afterwards, with active CPU-heavy processes still recorded. Load changed, so these observed reductions are not precise causal estimates. No other process was stopped. Linux CI was not run or triggered; its deciding budget remains to be confirmed by the lead.

The baseline loader substitutes only a byte-identical snapshot of `command.ts` taken before editing; its SHA-256 equals both the entry inventory and `git show f444fa2:packages/kernel/src/command/command.ts`. Every other runtime source is unchanged, and imports resolve into this worktree. No checkout, source rollback or Git write was used. Timing uses the exact last-day-only hash cadence and no freeze, deep checks, replay or observer, as the done check's stopwatch does. Daily hash preservation was checked separately.

### Behavior, gates and preservation

- Both decision-led paths match all 148 daily hashes, daily events, liveness counts, log-entry counts, decision points and rejections against the retained f444fa2 baseline. The final hash remains `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`. The standalone checked Union and testbed summaries also match R80 on all 148 + 120 daily hashes, liveness, replay and resume. No numeric band or measured count changed.
- The day-40 save fixture is reproduced byte-for-byte by both baseline and optimized source, without writing the fixture: SHA-256 `b865972cd76f99a73fa35b3ac5d54bf4072c1f59dc33d783ba9ea9e4c49a8036`. Every existing save fixture and all 206 protected pack/band/lock/configuration inputs are unchanged.
- Cheap gates before the full check: typecheck; 54 focused command/succession/believed-holder/determinism tests; boundary, licences and decision index. The new regression also passes on the original implementation, establishing its preserved semantics before the optimization.
- Exact `MANDATE_NO_GIT=1 MANDATE_TIMING=1 npm run check`: **exit 0**, 127 files, **1,457 passed / zero skips**, 331.89 seconds. This includes the requested timing-enabled `npm test` and its budget tests. Git-writing fixture files are excluded by the existing no-Git mode; they remain for the lead/CI.
- Normal standalone eight-seed `npm run run:done-check -- --label r81-done`, with default drafting: **exit 0, Phase 0 6/6; 1A 1/6**. War-by-decision median/p95 **22.20/38.08 ms**, history **22.52/37.56 ms**; unchanged limits **40/160**. Testbed **2.34/3.15 ms**. Every failure category was inspected. Checkpoints, operation, pushback, stand-ins and lever sweep retain exactly R80's problem lists, including Missouri, Wheeling, 20,957 Confederate men, no planned operations fought, 44 reservations, the two unowned labels and the unmeasured D6 channels. No gate was waived, fitted or retried.
- The initial exploratory `war` slot mistakenly used the labelled `atWar:true` mechanics path. Its evidence remains supplemental; reported profiles/timings use the corrected exact paths after a three-day loader smoke. A UTF-16 shell-log decoding error was fixed in the evidence parser only. No campaign was rerun for it.
- Runtime/import diagnostics and the source inventory preceded this closeout. Final inventory: **three delivery files, 1,641 other baseline files unchanged**, no unexpected addition/deletion, all **nine captured Git metadata files byte-identical**, staged diff empty. No install, package build, server or browser. Only the production lookup, its test and this hand-over changed outside ignored evidence.

For the lead:

1. Review R81 under 0096, then obtain the unloaded comparison and Linux CI timing verdict; the loaded measurements do not waive either condition.
2. Retain the five failed 1A categories with their existing owners. R81 changes no behavior or acceptance criteria.

## Findings outside my scope

1. **Lead / steward:** unloaded and Linux CI confirmation remain outstanding. The 28 ms number is met in the recorded loaded samples, but this is not an unloaded or hosted-CI claim.
2. **Lead / lane 1.14 and R79:** the inherited five 1A failure categories, hook bound, stand-in labels and Taney follow-ups remain separate work. No R79 item was undertaken.

## R90: shared call doctrine (2026-11-20)

The R90 hand-over is in **`notes/lane-1.7-men-regions.md`, R90**, with `runs/r90/final-checks.json` as evidence index. It supersedes Part A's once-per-governor suppression: 65 identified dated requisitions may repeat to a governor, while each identity is sent once. Explicit sourced peacetime calls do not set a war flag. Conditional readiness requests receive an answer without mustering. The authored 15 April militia decision remains its sole issuer. The public Cameron–Letcher wire brings the unchanged signed Virginia situation to 17 April.

The history still has no Confederate force near Manassas or battle there. The concentration post remains Charleston. Virginia, North Carolina and Tennessee object to transfer calls; Arkansas's transfer is due after July. The full check exits 1 (four band-dependent failures remain after a focused fixture correction); the full done check exits 1, Phase 0 4/6 and 1A 2/6, including a 40.44 ms history median against 40. No band, threshold, trait, signed item or men-per-regiment rule was fitted. Independent review remains with Claude under 0096.

## Findings outside my scope

The R90 primary hand-over routes the source/term limits, missing national enlistment path, call-purpose/compliance issue, absent Manassas establishment and every unmet gate. R87–R89 and R91–R93 were not undertaken here.

## R98: Confederate concentration in northern Virginia (2026-11-20)

For the lead: 3 items. R98 only in `C:/Pyrrhic/mandate-manassas-1861`, branch `phase1-manassas-1861`, retaining `4f6e8b30c344319802511eca534dff6a2c6a95cc`. `npm ci` ran first: exit 0, 51 packages, zero vulnerabilities. Git was read-only; R97's checkout was not touched. Review remains with Claude under 0096. Evidence index: `runs/r98/final-checks.json`.

### Delivered and sourced

- Pack doctrine declares Johnston's Harpers Ferry command and Beauregard's Alexandria-line command at Manassas. Both wait for Virginia's live department side to be Confederate and for an eligible serving officer. The commands have no opening forces. Dated concentration changes select an established command; governors and the named former concentration send troops through ordinary compliance, transfer and join orders.
- The appointment verb can establish an appointment-created declared temporary command. An optional expected old post permits reassignment; delivery guards both holder links and changes them atomically through command. Failed delivery or a changed destination leaves the old holder intact. Troops stay in the old post until a separate transfer. Existing verb prices, compliance and message latency apply. No new State field, default price, combat weight or player battle verb was added. Appointment answers retain their issuance record across response pruning; sourced appointees are reserved before ordinary vacancy selection.
- Primary source read: Cornell's OR I-2, scan `cu31924077730186`, retained OCR SHA-256 `66d9a89b843925389e1d2d5d9798dc4e0c66f9a0488bbfcc8705659e4b37ebbf`. **Johnston:** assignment 15 May, pp. 844–845; the President's intended army near Harpers Ferry, p. 856; assumed command 23 May, his retrospective report, p. 470. **Beauregard:** Alexandria-line assignment 31 May, Special Orders 149, p. 896; arrival 1 June in his 3 June letter from Camp Pickens, pp. 901–902; explicit Camp Pickens–Manassas location, p. 907 (geographical self-identification only, no political content used). Full source limits and rejected alternatives: `docs/research/2026-11-20-northern-virginia-concentration.md`.

### Proposed rulings [I]

1. Use the sourced assignment dates for doctrine letters; normal delivery determines completion, rather than forcing historical arrivals. Davis's doctrine exercises the R98 authorization; the printed 31 May order is by Lee. In this history Beauregard's letter is sent on **31 May/day 87** and completes on **5 June/day 92**, later than his recorded arrival. Reject adjusting courier weights or forcing headquarters placement to match a date.
2. Preserve Johnston's cross-side eligibility guard. This base still has him serving as Union Quartermaster General, without 0101's resignation/service owner, so **his Harpers Ferry command does not open in this run**. A fixture supplying only the missing service prerequisite makes his sourced assignment eligible. Reject changing his starting side or implementing the separate resignation lane here. The existing Union operation likewise remains under **Stone**, because this base has no McDowell department establishment; R98 does not repair that other-side gap.
3. Keep the existing bundle-transfer semantics: the named former Charleston concentration sends its commanded blocks, including opening blocks, while new levies go to the latest established northern command. This is an allocation approximation, not a sourced regiment list. It does not move an already established Johnston army to Manassas. Review this choice explicitly: four unknown opening blocks reach combat. Reject inventing their headcounts, hiding their participation or fitting the battle to a date or result. New establishment answers also prevent repeated dated appointments after ordinary response pruning.

### History, without fitting

The 148-day history, all seats on rules, uses the pack's own peace and war. Virginia's existing notice changes its side on day 43. The first **86 daily State hashes match R96**; the first difference is the 31 May appointment letter. All 148 daily hashes match the final done-check reference; replay, day-60 resume and saved-log replay pass, zero rejections. Final State: `8edd464f25f17d1806ff534a9f102b77c12636ee2f56e2a7c770a5ed84dd3381`. The unaffected testbed's 120 hashes and liveness match R96.

| Emerged field battle | Confederate known present | Union known present | Commanders and result |
|---|---:|---:|---|
| Manassas, 27 July/day 144 | 158 | 45,600 | Beauregard withdraws; Stone gains ground |
| Manassas, 29 July/day 146 | 19,261, plus four unknown blocks | 44,579 | Beauregard withdraws; Stone gains ground |
| Manassas, 31 July/day 148 | 126 | 41,263 | Beauregard's side is routed; Stone gains ground |

These are simulation observations, not the historical battle. The unchanged Union goal is issued 16 July; its planner chooses a supply-line operation beginning day 137, fought from day 144. A 158-man block first appears at Manassas or a graph-adjacent region on 21 July, not a full army on that date. At the end, the new command has 31 assigned blocks (20 raised in play), 35,791 known men, with all 31 under joining orders after withdrawals. Full daily locations, operations, holder transitions and battle records: `runs/r98/history-spatial.json`; compact findings: `history-findings.json`.

On **31 July**, Union known men are **59,329** with four unknown blocks, against unchanged **95,000–250,000** (floor reported, non-binding). Confederate known men are **42,829** with 17 unknown blocks, below unchanged **100,000–200,000**. R96 had 62,686 and 46,457 respectively; field losses change those totals. State-force acts from R97 and the absent national enlistment path have not been imported.

### Liveness bands and causes

Exactly six breached liveness bands use the **unchanged `around(observed)`** helper. No historical, pushback, strength, timing or lever bound changed. Old/new numbers, retained bounds, and all **37 changed measured rows** with direct or labelled inferred causes are in `runs/r98/band-reconciliation.json`. Retained R96 reference evidence supplies the baseline; no baseline campaign was repeated. Stale no-field-battle explanations on latent bands were corrected without changing their bounds.

| Mechanic | Observed | Old bounds → new | Cause |
|---|---:|---|---|
| `combat.captured` | 3 | 0–0 → 1–6 | Emerged field combat captures men; Sumter still evacuates under terms. |
| `combat.occupation` | 44 | 9–36 → 22–88 | [I] Northern joining marches and the summer operation expose more regions to occupation. |
| `control.changed` | 49 | 10–40 → 24–98 | [I] The changed movements, occupations and battles produce more control proposals. |
| `control.threshold_crossed` | 21 | 5–20 → 10–42 | [I] Additional control updates cross existing thresholds. |
| `movement.leg_started` | 197 | 49–196 → 98–394 | Transfers to the new command start northern joining marches. |
| `politics.support` | 52 | 8–32 → 26–104 | Field-battle reports reach editors, whose pages move bloc support. |

### Checks and remaining criteria

- **Exact `MANDATE_NO_GIT=1 npm run check`: exit 0**, **133 files / 1,489 passed / three existing skips**, **152.99 s**. All chained gates pass. Initial full check: one one-writer-scanner failure, with 1,487 other tests passed. Replaced a loose null comparison with a strict one; a focused failing regression also exposed the officer competing with a routine vacancy, corrected before the final run. **73 focused tests**, typecheck and boundary/licence/decision checks passed before the required exact rerun. No scanner or acceptance rule was weakened.
- **One default eight-seed done check with drafting: exit 0**, **1,295.39 s**, **Phase 0 6/6; 1A 2/6**. Default exit binds Phase 0 only. All **14 reported problems** remain in `done.log` and `final-checks.json`. The operation criterion now passes, through the existing Union planner operation.
- **Timing, median/p95:** Union reference **37.78/56.65 ms**; testbed **3.59/5.50**; Union history **33.30/52.31**, within unchanged **40/160** limits. Drafting: 23 commands, 16 with land forces; day median/p95 **40.3/52.3 ms**, capped worst **26.0 ms**. Linux CI decides the budget. No timing retry, unloaded-host or CI claim.
- **Checkpoints still fail:** Missouri neutral; western-Virginia checkpoint department list absent; Confederate known strength below 100,000; Confederate fought-operation count zero. Union fought-operation count is now one. Union's strength floor remains non-binding.
- **Pushback still fails:** relay holds **1 < 2**, filter holds **0 < 1**, trims **0 < 1**, reservations **77 > 9**, slow walks **17 > 9**. These bounds are unchanged.
- **Unknown-strength now fails:** on 29 July four Confederate blocks fight: `fb_st_charleston_1st_infantry_regulars`, `fb_st_charleston_fort_johnson`, `fb_st_charleston_fort_palmetto_stono`, `fb_st_charleston_regiment_of_rifles`. The reference and history both report it. Unknown strengths remain unknown; the criterion is not waived.
- **Lever sweep fails:** eight seeds, eight gated decisions and **712** base-run calls. Watched `return` is best in **3/8**, above one quarter. The unmeasured people/grievance channel and all **24 policy moves** without a new border-governor call remain separate failures. **No D6 clearance**, no gate promotion or sign-off.

Runtime diagnostics and artifact inventories were completed before this final documentation. The three workspace packages resolve inside this checkout. All 115 audited situation/gate/source/lock/save paths, including 84 situation/gate paths, and all historical checkpoint bounds are preserved. Original doctrine rows and all other rules are unchanged apart from the new appointment/concentration arrays and the new post kind. HEAD remains pinned and staged diff empty. No build, server, browser, Git mutation or other-worktree write; the sole main-checkout write is the required final CODEX status.

For the lead:
1. Review the implementation, source note and three proposed rulings under 0096, especially the old concentration's full bundle and its unknown-strength consequence.
2. Integrate the missing resignation/service and McDowell establishments through their owners, and merge R97 separately; Johnston's placement criterion remains unmet here.
3. Retain all failed 1A criteria with their owners and send timing to Linux CI. New field battles and a passing Phase 0 exit waive none of them.

## Findings outside my scope

Johnston's service and McDowell's absent establishment are integration prerequisites. Four unknown opening blocks now fight, and the watched return option wins 3/8 sweep seeds; both remain failures, requiring sourced force-allocation/strength work and the existing gate/calibration owners respectively. R97's state acts, national enlistment, Missouri/western-Virginia checkpoint gaps and the other pushback/sweep gaps remain with their existing owners. No other request was undertaken.

## R84: consult policy, the July message, and the Butler source conflict (2026-11-20)

For the lead: 3 items. R84 only in `C:/Pyrrhic/mandate-rule-seats-c`, branch `phase1-rule-seats-c`, from `ff07445`. `npm ci` ran first, exit 0, zero vulnerabilities. Git commands were read-only. No other run's worktree was written. **The Butler acceptance item remains unmet.**

### Consult

The principal menu offers `consultPosts` for surfaced, open, undelegated questions. These are held own-side posts of the currently open options' named proposers, using the principal's believed holders. An unposted proposer, a foreign holder, the principal himself, inaction and a proposal's documentary basis do not invent an adviser. The rule seat sends one grouped, sorted, deduplicated `consult` command within the existing attention budget, after answering commanders and before its war-only doctrine. Advice can be sought at peace.

Pending letters, responses to those letters and received replies suppress repeat requests while that evidence is retained. No private stance or actual compliance rung enters the choice. Consultation message keys now include the situation as well as the post; the menu reconstructs the existing content key, including its shortened form, so long IDs and two questions for one post remain distinct. No new State field, owner, save schema or pack default was added. The existing consultation verb, compliance, stance, report and attention owners apply the effects. History defaults and the tick order are unchanged; situations that resolve before the next morning acquire no artificial consultation delay.

The regression first failed without the policy. The first kernel fixture accidentally used the rules driver and therefore closed its question immediately; it was corrected to a human driver. The corrected kernel regression also fails against the retained original source. Final focused result: **49 passed**. The additional long-key regression checks suppression after delivery and independence of another open question. The required full gate includes all three new tests.

### Butler: stopped, not delivered

Scott's order to Butler is dated **18 May 1861** and directs him to assume Fort Monroe command while Dimick retains command of the regular garrison. Butler acknowledges receiving the transfer order in his letter to Cameron of that date. Source read: *Private and Official Correspondence of Gen. Benjamin F. Butler*, I, [pp. 94–96](https://archive.org/details/privateoffice01butlrich/page/94/mode/2up). These pages establish the order date; they do not establish the placeholder's 22 May effective date. The retained OCR and read excerpt are identified in `runs/r84/sources-read.json`.

On this base `us_fort_monroe` is occupied by Dimick, and `appoint` requires a vacant post. The placeholder instead opens `us_dept_virginia` with Butler. Three signed items reference that distinct post: `fort_monroe_arrivals`, `fort_monroe_escape` and `fort_monroe_escape_asked` (`butler-dependencies.json`). Simply relieving Dimick to satisfy the requested ID would erase the garrison command that the read order preserves. Simply removing the notice would leave those items without their existing command.

`docs/LANES.md`, “The brief”, says **“If the evidence contradicts the brief, stop and report.”** That is the stop applied to this item. The appointment, temporary-post row, placeholder, strings and signed items remain byte-identical. No gate signature was authored and no unreviewed substitute was loaded.

**Proposed ruling [I]:** represent Butler's superior command while retaining Dimick's garrison command, and distinguish the 18 May order from arrival/assumption. The lead and lane 1.12 own the post mapping and the appointment path; any retargeting of the three signed items must be drafted and reviewed by the gate reviewer. Rejected: treating the two commands as one vacancy, asserting 22 May from the read order, and deleting the notice while leaving its dependent command absent. This recommendation is not an implemented appointment or a waiver of R84 item 2.

### The 4 July message

`special_session` already models the message through `ask_war_footing`: it sets `war_footing_asked` and answers the spring's acts on the accountability ledger. It does **not** invoke `address`.

**Proposed ruling [I]: keep that treatment.** The read message addresses the Senate and House and asks for legislative authority for men and money: *Lincoln's First Message to Congress*, Old South Leaflets 189, [pp. 1 and 8, collected folios 253 and 260](https://upload.wikimedia.org/wikipedia/commons/d/dd/Lincoln%27s_first_message_to_Congress_-_message_to_Congress_in_special_session%2C_July_4%2C_1861_%28IA_lincolnsfirstmes00unit%29.pdf#page=8). The existing `address` verb chooses one political bloc, increases its support and penalizes same-side blocs with no shared values (`politics/addressChanges`). The read text does not establish a bloc to receive that effect. Rejected: choosing a bloc without evidence or inventing a second Congress-address mechanic for this item. No player text or situation was changed. In the measured history the situation resolves on **4 July/day 122**.

### Every original “For Part B” item

| Item | Current disposition / owner |
|---|---|
| Situations own their calls and goals; duplicate doctrine rows removed | Built in R78/R80; retained. Union doctrine calls are empty and the Sumter offensive row is absent. |
| Each government sets its war flag; history without `--at-war` | Built and accepted in 0104; R84 history and done check verify the decision-led path. |
| Consult policy | Built in R84, as above; Claude's independent review pending. |
| 4 July message as `address` | Assessed above; ledger treatment retained, proposed ruling for the lead. |
| Confederate capital as State, one owner | Built in R48/R57, accepted in 0098; retained and tested. |
| Butler appointment and placeholder retirement | **Unmet.** Lead / lane 1.12 own the command-model correction; gate reviewer owns any changed signed items. |
| Concentration against 31 July strength and fought-operation bands | Lane 1.14 / **R85** calibration. R84 neither tunes parameters nor widens these bands. |
| Lane 1.11's Sumter hook | Built in R78 and accepted in 0104; retained. |
| People messages bounce like orders; `believedHolder` covers all capture routes | Built in R48/R60/R74 and accepted in 0098; required suite passes. |
| Resignation, its historical defaults, roster correction and July appointment case | Separate resignation lane, **R82** merge and the lead's planned R87 follow-ups. No resignation work undertaken here. |
| Owner labels for bombardment/concentration and gun-count stand-ins | Existing labels retained: **lane 1.14** for parameters/concentration; **1B** for gun counts. R79's call-delay labels name 1B, conventions and legislatures. |

Audience, observer, promise, pressure and relieve still have no sourced automatic policy trigger. That original Part A residual remains with the lead / lane 1.12 for later authoring; R84 does not invent triggers for them.

### History, every changed band measure, and validation

The original-runtime snapshot is byte-verified against the entry inventory and `git show ff07445`; its workspace imports resolve into its own snapshot under `runs/r84/baseline`. It reproduces the previous final State `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`. No second checkout or Git mutation was used.

The changed history reaches **31 July/day 148**, without `--at-war`, zero rejections, daily replay matching and day-60 save/resume matching. Final State: **`2c33d5c0df4f5812850e502e95ad40bc136f051a154dd0bcbaf9ebb13f13e979`**. Every situation record and war flag equals the baseline, including the firing notice on day 38 and call on day 41. Five consultations answer the open Sumter question; their stances and correspondence change hashes from day 2. The standalone done check independently matches all 148 daily hashes and every liveness row. Its testbed replay and day-40 resume also match.

`band-reconciliation.json` retains old/new fires, magnitude, bounds and causes for **all seven changed liveness rows**:

| Measure | Before → after | Cause |
|---|---|---|
| `knowledge.pruned_age`, magnitude | 1,261 → 1,266 (fires remain 96) | Five additional advice reports age out. |
| `messages.sent` | 11,164 → 11,174 | Five letters and five replies. |
| `messages.delivered` | 10,516 → 10,526 | The same correspondence arrives. |
| `orders.responses_pruned`, fires / magnitude | 20 / 33 → 21 / 38 | Five consultation responses reach the existing pruning age. |
| `seats.attention_spent` | 27 → 28 | One grouped consult costs the existing one point. |
| `verbs.answered` | 48 → 53 | Five advisers answer. |
| `verbs.consulted` | 0 → 5 | Five recommendations become stances. |

**Only the Union consultation liveness band changes:** QUIET 0..0 becomes the existing half-to-double rule at five, **2..10**. It leaves global QUIET; the testbed retains an explicit **0..0** band because its history resolves its questions before a morning consultation. Every other liveness bound and every historical checkpoint/pushback band is unchanged. The historical reservations measure moves **44 → 48**, exactly the four new consultation responses on that rung; its **1..9** band is retained. The baseline 44 is also the starting measure in the R85 request. No proxy was changed to hide this consequence.

- Exact `MANDATE_NO_GIT=1 npm run check`: **exit 0, 129 files / 1,474 passed / 3 existing timing skips**, test duration 182.47 s. Typecheck, boundary, licences and decision index pass. Git-writing fixture files are excluded by the existing no-Git mode.
- Normal `npm run run:done-check -- --label r84-done`, including the default eight seeds, unchanged fork cap and drafting: **exit 0; Phase 0 6/6, 1A 2/6**. War median/p95 **37.86/61.32 ms**, history **36.85/62.02 ms**, unchanged limits **40/160**. These are local observations, not an unloaded comparison or CI result. The full campaign ran once and took about 24 minutes; it was not shortened or retried.
- All four failed 1A categories remain: **checkpoints** (Missouri neutral, missing western-Virginia government mapping, 20,957 Confederate men, neither side fought a planned operation); **operation** (two operations, zero field battles); **pushback** (holds 1 < 2, filter holds 0 < 1, trims 0 < 1, reservations 48 > 9); **lever sweep** (policy-pushback channel unmeasured and border recruitment chain unexercised). Unknown-strength and stand-ins pass. Return best in 0/8 is not D6 clearance. Every problem is retained in `final-checks.json` and the full log.
- After the full gates, corrected a header comment and the obsolete explanation that consult still waited for Part B. The testbed consultation entry initially used `notHere`; final review restored its original 0..0 ceiling with an explicit `quiet` reason. The final band-table check passes **6 tests**, and both retained full-run summaries pass every final bound in `final-band-check.log`. State-producing code is unchanged, so the full behavioral evidence is reused; no campaign was repeated for these table/explanation corrections.
- Final runtime/import and preservation checks precede this closeout: **227 protected inputs unchanged**, including every pack, signed item, save fixture and lockfile; no deletion. No package build, server or browser. HEAD remains `ff07445`, staged diff empty; no Git mutation command ran. Evidence and the source snapshot remain ignored under `runs/r84/`.

For the lead:

1. Review consult under 0096 and rule on pre-war consultation priority and retaining the July ledger treatment.
2. Resolve the Butler command mapping from the cited order before authoring the appointment/placeholder replacement. R84 item 2 remains unmet.
3. Route the four failed 1A criteria and the four additional reservations to R85 and their existing owners; no limit has been waived.

## Findings outside my scope

1. **Lane 1.14 / R85 and the lead:** the inherited checkpoint, operation, pushback and lever-sweep failures remain, with reservations now 48. Re-measure after integration as the batch request requires.
2. **Resignation lane / R82 and planned R87:** resignation's roster and historical service transitions remain outside R84. No other worktree was inspected or written for that work.


## R89: Butler to the Department of Virginia (2026-11-20)

For the lead: 2 items. R89 only, in `C:/Pyrrhic/mandate-rule-seats-c`, branch `phase1-rule-seats-c` at `a9c35ba`. Git was read-only. The requested history behavior is delivered; review remains with Claude under 0096. Evidence: `runs/r89/final-checks.json`.

### Dates and the command mapping

Scott's order of **18 May 1861** directs Butler to assume the superior command and preserves Dimick's regular-garrison command: *Private and Official Correspondence of Gen. Benjamin F. Butler*, I, [pp. 94?95](https://archive.org/details/privateoffice01butlrich/page/94/mode/2up), read. Butler's report to Scott of **24 May**, written at Department of Virginia headquarters, dates his arrival to Wednesday at 8 a.m. and lists Dimick commanding the regulars: [ibid., p. 104](https://archive.org/details/privateoffice01butlrich/page/104/mode/1up), and [OR I-2, p. 648](https://ehistory.osu.edu/books/official-records/002/0648), both read. That Wednesday is **22 May**; the calendar check and retained OCR pages are in `sources-read.json` and `butler-pages-read.txt`.

**Proposed ruling [I]:** use 22 May as the rule-seat appointment's effective date at daily granularity, representing arrival/assumption under the 18 May order. This does not claim Lincoln issued Scott's order on 22 May, or model the intervening journey. The lead's R89 ruling supplies the mapping to `us_dept_virginia`, preserving `us_fort_monroe` for Dimick. Rejected: relieving Dimick, opening the department in the March start, or claiming 22 May from the order date alone. The temporary representation of the department remains the existing **1B** stand-in; R89 does not build general department creation.

### Built

- The pack doctrine has one cited, dated `appointments` row. The principal menu offers it only on its date, only to a `rules` driver, only for an available own-side serving candidate and an available post. Human and AI menus carry no historical appointment row. No date mutates command State itself.
- The rule seat sends `appoint`, within existing attention and war rules. A post already appointed that day cannot also receive a generic vacancy appointment. The letter, compliance, recorded answer, reply, pruning and command-log replay use their existing owners.
- `appoint` may open a scenario-declared temporary command whose kind permits appointment. It creates the post only after the appointee accepts; refusal leaves no empty command. Side, parent, kind, existing holder and existing appointment guards apply. `command` remains the only post writer. No new State field, save schema, rank, trait, combat parameter or numeric kernel default.
- `us_dept_virginia` is declared with no forced holder and an appointment-created temporary kind. Its history appointment is Butler's. Dimick's post row, holder and force assignments are unchanged.
- Inspected the old `butler_at_fort_monroe` notice: `gate.none`, no signature. Removed it and its two strings; retained its bytes in ignored evidence. All 25 signed situations and gate records are unchanged. Neither the three dependent signed items nor their post IDs were retargeted.
- Regenerated the two affected published schemas and Union data with their tools. Final freshness: **zero schema updates; zero pack files written, four unchanged**. Parsed generated differences are only the doctrine appointment, the added post kind, and the department template's kind and empty holder (`generated-differences.json`).

### History and every moved band measure

The decision-led run, with no `--at-war`, reaches **31 July/day 148**, zero rejections. The department is absent before day 78; Butler accepts on **22 May/day 78**, with `comply_with_reservations`. Dimick remains the garrison holder every day. Replay and day-60 save/resume match. Final State: **`1c8aca4d77301c98f58bf3d431d6cd8e15a6e54ace2de4abcc02205b26f36d46`**. The first changed State day against retained R84 is 78. All other situation records and all flags are equal after excluding the retired notice.

The normal done check independently reproduces every one of the **148 Union daily hashes and liveness rows** on the final source. All **120 testbed hashes and liveness rows** equal retained R84. This also verifies reuse of the earlier history after the generic-vacancy exclusion: the department is not a held-at-start generic vacancy.

No numeric liveness, historical checkpoint, pushback or timing bound changes. `band-reconciliation.json` gives old/new values, retained bounds and causes for all ten changed liveness measures:

| Measure | Before ? after | Cause |
|---|---|---|
| `messages.sent` | 11,174 ? 11,175 | One notice report replaced by an appointment and reply. |
| `messages.delivered` | 10,526 ? 10,527 | The same net extra correspondence arrives. |
| `orders.responses_pruned`, fires / magnitude | 21 / 38 ? 22 / 39 | The appointment answer ages out. |
| `seats.attention_spent` | 28 ? 29 | The existing appointment cost. |
| `situations.fired` | 54 ? 53 | Placeholder retired. |
| `situations.notice_reports` | 36 ? 35 | Its report retired. |
| `situations.noticed` | 35 ? 34 | Its receipt retired. |
| `situations.proposals`, fires / magnitude | 26 / 590 ? 25 / 589 | No placeholder command proposal. |
| `situations.surfaced` | 54 ? 53 | Placeholder retired. |
| `verbs.answered` | 53 ? 54 | Butler answers the appointment. |

The department still opens once, so `command.temporary_post_opened` is unchanged. Historical reservations move **48 ? 49** because of Butler's answer; their **1..9** bound is retained.

### Checks and remaining failures

- Test-first regressions initially fail for the missing behavior. Final focused preflight: **71 passed** across four files, including the human/AI controls, refusal, declaration/kind checks and duplicate vacancy exclusion.
- Exact **`MANDATE_NO_GIT=1 npm run check` exits 1**, after typecheck and **129 passing files / one failing file; 1,480 passed / one failed / three existing timing skips**. The sole failure reads the removed notice's firing day. Corrected only `packages/cli/test/union-opening.test.ts` to require the actual day-78 appointment log and absence of the notice; **all nine cases pass**. Final typecheck, boundary, licences and decision index exit 0. The 1,480 passing tests are reused with the exact test-only delta in `suite-reuse.diff`: **1,481 unique cases now have passing evidence**. The full command was not rerun or represented as exit 0.
- Normal **`npm run run:done-check -- --label r89-done` exits 0**, default eight seeds and drafting, **Phase 0 6/6; 1A 2/6**. War-by-decision median/p95 **35.64/57.84 ms**, history **37.73/60.61 ms**, against unchanged **40/160 ms** limits. Testbed **6.74/36.83 ms**. These are local measurements, not unloaded or CI claims. No expensive gate was retried.
- **Checkpoints fail:** Missouri remains neutral; the scorer still lacks the western-Virginia government mapping; Confederate known strength is 20,957 below 100,000; neither side fought a planned operation. **Operation fails:** two operations, zero field battles. **Pushback fails:** relay holds 1 < 2, filter holds 0 < 1, trims 0 < 1, reservations 49 > 9. **Lever sweep fails:** policy pushback is unmeasured and the border-recruitment chain is unexercised in 24 weighed moves. The full problem list is in `done-criteria.json`. Only the reservations count changes from R84's problem list.
- The sweep still weighs **eight gated decisions over eight seeds**, with **248 base calls** and `return` best in **0/8**. That is not D6 clearance. Its principals are human-driven, so R89's automatic appointment is absent. A supplemental 84-day base-path probe issues **zero appointments**, has **no department**, and sees the signed alternate escape notice fire on **day 84**. That notice negates `holderPractice`, so no holder also satisfies it. The probe stops before the policy choice; existing `applyPolicy` drops null carried-by holders. The full sweep therefore still opens the decision, but lacks the department carrier. The earlier source-analysis prediction of an unopened decision was not confirmed. **Lead / gate reviewer / R85 own this consequence**, including the signed wording's request from a missing department holder. No signed guard, carrier mapping, floor or sweep policy was changed here.
- A UTF-16 shell-log parser error was corrected in the evidence reader only; no run was repeated for it. Runtime diagnostics, generated-data inventory and protected-input checks preceded this closeout. Final audit: **21 delivery/hand-over paths**, **1,630 other baseline files unchanged**, one authorized notice deletion and one added pack test; all **seven captured Git metadata files** preserved. Campaign source hashes are unchanged. No install, build, server, browser, other request or other-worktree write.

For the lead:

1. Review R89 under 0096, including the effective-date inference and ordinary appointment path. The requested history appointment and Dimick preservation are delivered.
2. Retain the four failed 1A criteria and route the missing human-bot carrier / signed-notice context to the gate reviewer and the next integrated lane 1.14 measurement before using the sweep as historical policy evidence. The original lane 1.11 hand-over's placeholder description is now historical and should be reconciled by the steward on integration.

## Findings outside my scope

1. **Lead, gate reviewer and lane 1.14 / R85:** the human-driven sweep needs a sourced appointment of its own; its current alternate notice can fire while the department has no holder. Signed authoring and sweep calibration remain separate work. All four existing 1A failures and the 49 reservations remain binding.
2. **Steward:** reconcile lane 1.11's historical placeholder pointer when integrating R89. Only this lane's hand-over was updated here.

Fresh CODEX at closeout records R85 received and the separate R90?R94 follow-ups under the lead's 0105 ruling. None was imported or undertaken. The missing-carrier question goes to the lead and gate reviewer for routing into the next integrated measurement; the failures reported above are those of R89's required `a9c35ba` base.


## R97: state-force transfers (2026-11-20)

R97 is implemented in `C:/Pyrrhic/mandate-transfers-1861` on `phase1-transfers-1861`, from R90/R96 at `4f6e8b3`. Seven notices replace eleven governor transfer requisitions; ordinary calls retain compliance. The current hand-over, read pages, modelling inferences, 31 July strength, all changed measured rows and final checks are in `notes/lane-1.7-men-regions.md`, R97, and `runs/r97/final-checks.json`. No concentration or appointment change from R98 was imported. Integration must retain both R97’s calls-array changes and R98’s independently authored doctrine changes.

### Findings outside my scope

Claude’s independent review and ruling on the five unchanged liveness-band breaches remain pending. R98 and the other inherited milestone failures retain their own owners.
