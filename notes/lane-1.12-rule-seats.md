# Lane 1.12: rule-seat principals and commander seats (Parts A and B)

Main merged at `364aba0` on 2026-11-19, by R46. R48 starts from the committed merge at `8b15e6e`, in `C:/Pyrrhic/mandate-rule-seats-b`, branch `phase1-rule-seats-b`.

## Where lane 1.12 stopped (2026-11-19, R77)

**R74 is approved at `5a08456`. R77 resolves the working-file contents of the in-progress merge of lane 1.11 at `b6f935b`; the index intentionally remains unmerged.** Nothing is staged, committed or aborted. Both lanes' behavior is retained. The first checked integrated history reaches 31 July/day 148, without `--at-war`, with zero rejections, matching daily replay and day-60 save/resume. Sumter falls on **20 April/day 46 under Anderson**, outside R74's recorded window: capture, no evacuation notice, `combat.evacuated = 0`. Richmond moves once on **29 May/day 85**, after `virginia_seceded` on day 43. Each side's own decision sets its war flag (Confederate day 37; Union day 38). No outcome was tuned.

Required no-Git full check: **exit 0, 126 files / 1,440 passed / 3 optional skips**. Desk types and suite: **exit 0, 84 passed / 8 existing skips**. Standalone done check: **exit 0, Phase 0 6/6; 1A 1/6**. Full details and all remaining gate problems are in R77 below and `runs/r77/final-checks.json`. The unmet Sumter condition belongs to the next request.

The Part A review history at the pause follows:

**Part A** is complete on `phase1-rule-seats`, head 0fd0f26, pushed. It has not merged.
- **Checks:** `npm run check` passes, and so do all six `run:done-check` criteria. CI was green on ea764cd. Every later commit passed the full check in its pre-commit hook.
- **Reviews:** the standing reviewer has the head 0fd0f26.
- **The gate reviewer approved the bombardment at 3cb3610 with two changes, both done and accepted:**
  - **G-1.12a** (0fd0f26), the cited list of forts that may be bombarded: accepted. The reviewer did not re-run `bombard.test.ts` during the pause; it passes in this branch's full check.
  - **The Sumter notice** is signed by `gate-reviewer` (hash bed9f439…, all questions at v1, the reviewer's note verbatim) and moved to `situations/sumter_evacuated.json`. "Allowed" was accepted.
  - The notice fires once in the Union run, when the principal learns of the evacuation. `situations.fired`, `noticed`, `notice_reports` and `surfaced` are banded at one there.
- **Before merging:** lane 1.11r3's `L3-sumter.md` (990275c, on `research-1861-leads`) must reach main. The notice and `recordTerms` cite it.

**R77 integrates lane 1.11 and reports the history and war flags.** The list in "For Part B" below is the original brief; its remaining policy changes await the lead’s next request:
- the history run end to end, through lane 1.11's situations: reported in R77, with the Sumter timing condition unmet;
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
- **For lane 1.11's hook:** the stage reads a goal with posture `take` whose objective is the fort's region (`fort_sumter`), sent to `cs_cmd_charleston`; the planner's `bombard` method does the rest. When lane 1.11's `reduce_sumter` order sends that goal, remove the doctrine's Sumter offensive row (one owner, as with the calls).
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
- **Lane 1.11's Sumter hook:** `reduce_sumter` sends the goal the bombardment reads (posture `take`, objective `fort_sumter`, to `cs_cmd_charleston`; c878fd9 on `phase1-situations`). After lane 1.11 merges, remove the doctrine's Sumter row and re-run `bombardment.test.ts` with the situation as the order's only source.
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

R77 below reports the end-to-end history run and verifies each government’s war decision. Consult policy, Butler’s integration, removing the doctrine’s Sumter row and the 4 July message as an `address` remain deferred. Resignation remains its own lane. R57’s three-day capital test remains a separate boundary control.

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

## Findings outside my scope

1. **Lead / next Part B request:** Sumter's day-46 capture misses the required 12–13 April evacuation and signed notice. The trace exposes both the authored and doctrine orders and their relay/travel/staging delay; R77 leaves their behavior intact.
2. **Lead / lane 1.14:** the budget passes; all eleven non-budget criterion statuses and problem lists match retained R73 evidence. Retain the five failed 1A gates listed above. A passing root suite or liveness table does not waive historical, operation, pushback, stand-in or D6 conditions. `return` being best in zero seeds is not D6 clearance while the required channels/chain are unmeasured.
3. **Lead / remaining Part B policy:** consult policy, Butler's integration/placeholder cleanup, retiring the doctrine Sumter row, and the July message as `address` remain outside R77. Resignation is its separate lane.
4. **Lead / standing reviewer:** review the combined contents and the ungated capital annotation under 0096. The ten index conflicts remain intentionally unmerged for the lead to stage; no Git metadata or another worktree was written.
