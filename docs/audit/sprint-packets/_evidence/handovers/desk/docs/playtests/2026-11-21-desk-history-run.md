# S29: the human Union desk on integrated 1A

Maker playtest, 21 November 2026. Branch `sprint/desk`, from `c6f9799`, with
`sprint/1a` at `bf6cc66` merged as `d878dd3`. Claude's whole-branch review
remains deferred under 0106. Nothing is signed or cleared for main.

The desk reached 31 July with 22 weekly capture sets, all five identified
calls issued, Sumter papers, an arrow edit, a send-back with a received note
account, and a filed audience. **The human Manassas battle playtest remains
unmet:** no Manassas battle dispatch reached this desk by the endpoint. The
separate automated history did fight there. That result cannot substitute for
the missing human scene.

## Method and evidence

Only the prototype's own headless Playwright Chromium harness drove the desk,
on owned port **5293**, now closed. No Computer Use, desktop control or real
browser was used in this resumed run. All writes used the desk controls and
order sheet; GET snapshots retained the public response. No State was loaded
or edited to manufacture a date, appointment or encounter. No likeness or
slogan was added. Nothing was pushed or written to another sprint worktree.

Evidence root: `C:/Pyrrhic/ByOrderOfThePresident/art-masters/S29/`.

| Evidence | Meaning |
|---|---|
| `completed-history/` | Primary trajectory: day 148, 52 turns, 22 weeks, 18 historical bundles, zero command rejections or page errors. Its acceptance test exits **1** for missing Manassas. |
| `completed-history/journal.json`, `weeks.json`, `observations.json` | Received daily papers, signed actions, stops and public weekly menus; basis of the table below. |
| `completed-history/browser-commands.jsonl`, `resume-prefix.jsonl`, `replay-commands.jsonl` | Actual UI commands. The continuation replays 83 successful commands to exactly the day-138 morning, history and empty queue. |
| `completed-history/prefix-replay-check.json` | Exact prefix comparison; nineteen unchanged weekly sets reused, their provenance retained in recipes. |
| `completed-history/late-diagnosis.json` | All late plan papers, the received note account, final call markers and failed battle condition. |
| `final-history/` | Earlier governor-corrected full trajectory, five issued calls and real-call captures at 200% high contrast. Different late review sequence, also no Manassas battle. |
| Root `history-first.log`, `history-continuation.log`, `history-with-calls.log` | Retained earlier failures and recovery, not final acceptance evidence. |
| `runtime-summary.json`, `done-check.log`, `runtime/` | The single default eight-seed done check, drafting, all failures and raw artifacts. |
| `completed-history/final-inventory.json`, `server-closed.json` | Capture/source hashes, integrated-input preservation, build inventory and no listener on 5293. |

The baseline is 5 March; the first actionable morning is 6 March. Each weekly
set shows the following morning after the completed interval, at 3440×1440
and 1920×1080, plus its weekly papers at 3440×1440. The final calendar reads
1 August while the stop slip records 31 July. No August day was executed.
Every primary PNG has a matching recipe with source and output hashes.

Historical answers use the integrated pack's authored `historicalDefault`
bundles, retained with their citations in `history-choices.json` by
[the preparation script](../../prototypes/desk/scripts/s29-prepare.ts).
This is the playtest reference, not a new player-facing recommendation.
A bundle is signed only when all its options are offered. This report
describes the game's correspondence, not independent historical recertification.

## Each week's desk

Papers means distinct received during the interval / still held in the next
morning's view, not unread count. Option IDs identify the actual authored
bundles; notices do not require an invented decision.

| Week and completed dates | Papers | What the player sees and decides | Unclear point |
|---|---:|---|---|
| 1 · 5–11 March | 41 / 30 | Pickens reinforcement: `land_company`; opening Sumter and resignation papers. | A queued answer originally looked unanswered on reopening; the pending-decision fix retains it. |
| 2 · 12–18 March | 62 / 30 | Seward: `answer_in_person`; commissioners: `hold_and_talk`. | No explanation of future alternatives that may arrive later. |
| 3 · 19–25 March | 75 / 46 | Continuing Sumter correspondence; no new historical bundle to sign. | Only withdrawal is offered; the public view has no clock or future-option explanation. |
| 4 · 26 March–1 April | 70 / 35 | Lamon promise: `assure_notice`. | A seven-day maximum can skip a chosen date; the shorter-turn control resolves that. |
| 5 · 2–8 April | 80 / 49 | Virginia: `offer_fort`; Pickens refusal: `courier_order special_expedition`; Sumter: `provision_notice`. | Multiple compatible answers must remain visibly signed in the out-tray. |
| 6 · 9–15 April | 76 / 47 | `blockade`; Sumter bombardment and surrender-related papers; troop-call situation arrives. | Battle date and receipt date differ; press arrives much later. |
| 7 · 16–22 April | 105 / 89 | `militia_call`; Gosport: `defend`; Washington: `around_baltimore`; three governor transfers toward the District. | The situation's call and subsequent identified governor requisitions are distinct. Dispatch does not prove arrival. |
| 8 · 23–29 April | 93 / 105 | Missouri: `back_lyon`; habeas: `suspend_on_line`; seven transfers; Black volunteer and Indian Territory notices. | Notices retain their people and sources; they do not become a recruitable resource or new command. |
| 9 · 30 April–6 May | 85 / 125 | New York's 3 May identified call: 38 regiments, 730 days; two transfers. | Governors without blocks are absent from `commandable`; the corrected desk uses `raising`. |
| 10 · 7–13 May | 76 / 114 | Maryland judge, Tennessee, Arkansas and Camp Jackson notices. | Several notices do not imply a new decision bundle. |
| 11 · 14–20 May | 81 / 111 | Another New York transfer; Western Virginia and Cherokee neutrality correspondence. | Received reports are not a simultaneous complete account. |
| 12 · 21–27 May | 69 / 89 | Fort Monroe: `approve_holding`; Kentucky: `arm_quietly wait`; protection-act, escape request, neutrality and North Carolina notices. | Human menu lacks a dated Butler appointment offer. The sweep also cannot clear this policy's consequences. |
| 13 · 28 May–3 June | 70 / 83 | Merryman writ correspondence. | Receipt is a sourced claim, not a preview of policy effects. |
| 14 · 4–10 June | 61 / 67 | Routine returns; no historical bundle signed. | Quiet weeks remain recorded, without inventing an event. |
| 15 · 11–17 June | 72 / 65 | Indiana's six-regiment, 1,095-day identified call; Wheeling convention papers. | An identified requisition needs its complete terms, not a generic regiment count. |
| 16 · 18–24 June | 65 / 52 | Wheeling ordinance and Pierpont notices. | A filed notice does not itself establish a new command or appointment. |
| 17 · 25 June–1 July | 74 / 58 | Indiana transfer; Western Virginia: `cross_river recognise`; advance question: `advance_now`. | The situation names McDowell, but Stone still holds the human District command at this pin. |
| 18 · 2–8 July | 65 / 47 | Special session: `ask_war_footing`; Wheeling legislature notice. | This answer is not independent proof of every later Congressional ratification. |
| 19 · 9–15 July | 73 / 53 | Muscogee, Chickasaw and Choctaw treaty notices. | Retain the correspondence without adding policy options or decorative symbols. |
| 20 · 16–22 July | 70 / 49 | Order toward Manassas with review; Scott objects; repeat the withheld goal around the relay; send zero-day wait note; request audience. | Human review differs from the rules driver's approval. The audience lacks a current authored numbered case. |
| 21 · 23–29 July | 73 / 57 | Redraft accounts for note as `followed`; mark main axis via Northern Virginia, sign edit directly by wire; receive declared `comply`; issue New York's 25,000-man three-year call on 25 July. | Declared compliance proves neither march nor battle; no Manassas battle paper arrives. |
| 22 · 30–31 July | 21 / 60 | New York: two cavalry regiments and two artillery regiments, both for the war; stop at day 148. | Five issued markers establish dispatch, not delivery of all requested men. Manassas remains unplayed. |

## Sumter, review and audience

Anderson's bombardment dispatches are dated and received on days 38–39
(12–13 April). First casualty returns arrive on days 40 and 44, later returns
on days 46–47, and press on days 52–53. Nine battle/loss/press papers concern
Sumter. Their values, confidence, authors and receipt dates remain distinct;
zero reported casualties are not a new claim about unknown strength.

Stone submits a `supply_line` plan for Manassas. The final continuation uses
the native map note/waypoint controls, recalls their default relay slips,
then signs those same terms `by=wire bypass` through the order sheet after
Scott's received objection. A zero-day wait note requests a redraft without
imposing delay. Day 139's received plan accounts for that exact note as
`followed`. The day-140 main-axis waypoint edit via Northern Virginia receives
a day-141 answer declaring `comply`. This exercises the concrete plan edit,
not dragging a division.

The audience answer is filed with source
`m.138.stone_charles_p.lincoln_abraham.answer.audience.us_dc_militia`, linked
to the invitation. It declares `comply` and contains no counters. That is the
audience actually supplied; an old letter does not preview the next answer.

No Manassas battle-phase/result claim reaches the human desk by day 148. The
final reviews and awaiting lists are empty. These facts do not identify the
hidden cause of the missing encounter. The failed assertion and trace remain.
The reporter's additional error is only “Testing stopped early after 1 maximum
allowed failures,” not a second server failure. The original note assertion
followed the battle assertion; its retained account was checked separately.
The committed harness checks both without masking one behind the other.

The automated history instead records `battle:manassas:144`, Union operation
`op:us_dc_militia:137`, method `supply_line`, and a fought planned operation on
each side. This establishes an engine path to battle, not the human scene.

## Corrections and maker checks

Every production correction has a separate hooked commit and a failing test
before its fix. No active pack data, kernel tick behavior, State schema or
liveness band changed after integration.

| Commit | Problem and correction | Evidence |
|---|---|---|
| `d878dd3` | Commit the staged integration first; regenerate the two conflicting schemas from combined source. | Root/desk typecheck and whitespace; real hook: 147 files, 1,601 passed, one expected failure, three skips. |
| `6627e69` | Seven-day-only turns skip dates. Add bounded `end [days]` and “Maximum days this turn.” | Five initial failures; parser, console, adapter, component checks; real one-day browser turn. |
| `76d4fd6` | One day said a week passed. State the actual shorter interval. | Console wording test, failing then passing. |
| `2516f89` | No identified-call path. Queue complete menu terms by ID; show due calls, attention price and pending state. | Eligibility, complete fields, numeric override rejection and duplicate-slip regressions. |
| `25e6b73` | First fixture used a field post, missing governors without blocks. Use `raising` for picker, eligibility and routes. | Real Union day-59 May call accepted without rejection; full corrected trajectory requires all five IDs issued. |
| `0d9194b` | Reopening clears a signed decision and permits duplicate signing. Derive selection/pending state from the out-tray, with recall available. | Bundle and inaction tests; real retained Pickens scene at both native sizes, no writes. |

The first journey also stopped at the nested audience: the harness sought
“Put down” where the actual control was “Back.” A small read-only browser
check verified returning to an active desk before replaying the affected
suffix. The governor correction reused eight unchanged weeks with an exact
day-56 prefix comparison. The late investigation reused nineteen weeks with
an exact day-138 comparison. Earlier goal-reset behavior was corrected:
redeliver the withheld review kind rather than restarting the original goal.
Earlier failures are retained, never silently promoted to passes.

Final production desk suite: **115 passed, three existing skips, 35 files**,
exit 0. Desk typecheck/build exit 0. Browser corrections retain three passes
for nested audience/pending decisions and two for the real call at 200% high
contrast: keyboard day selection, no horizontal dialog overflow, both sizes.
Preflight checks startup, map readiness, selectors, forbidden source access
and rejection of a foreign origin. Final harness/tooling typecheck is separate
from the reused unchanged production suite/build. The final staged-tree hook
verdict is retained in `final-hook.log` and `final-hook.exit.json`.

Before final documentation, the inventory verified **72 primary capture/recipe
pairs**, including all 66 weekly captures; **1,700 preserved integrated paths**
outside the delivery; **159 unchanged ignored maps** against S8; **430 build
files / 471,648,002 bytes**. Delivery hashes are refreshed after documentation
without rebuilding unchanged assets. The existing >500 kB chunk warning
remains. This is a local-server prototype using a configured art root, not a
standalone shipping package. Port 5293 has zero listeners after teardown.

## The required done check remains red

`npm run run:done-check -- --label s29-integrated-desk`: one default eight-seed
campaign with drafting, exit **1**, **1,637.25 seconds**. Simulation/pack inputs
are unchanged. No repeat campaign, recentered band or relaxed criterion.

| Criterion | Result and every reported failure |
|---|---|
| Phase 0: 5/6 | Behavior, hashes, save/resume, liveness and section ten pass. Budget fails twice: Union reference median **46.13 ms**, p95 **71.88**, maximum **85.03**; history median **45.46**, p95 **68.38**, maximum **81.41**; unchanged median/p95 limits **40/160 ms**. Testbed median 3.94, p95 5.34, maximum 7.03. |
| 1A: 4/6 | Checkpoints, operation, unknown strength and stand-ins pass. Five pushback failures: relay holds **1 < 2**, filter holds **0 < 1**, trims **0 < 1**, reservations **86 > 9**, slow walks **13 > 9**. Relay objections 2 and plan objections 27 stay within bands. |
| Lever sweep | Three failures: Fort Monroe's watched `return` best in **6/8** seeds, above one quarter; people/grievance unmeasured by the victory measure; no border governor call answered inside **24 moves**, seeds **1861–1868**, so the border-loyalty chain is unexercised. **No D6 clearance.** |

All **ten** problem statements remain in `runtime-summary.json`. Eight gated
decisions generated 624 base-run calls. The Union checkpoint has 58,497 known
men plus four unknown blocks, below the advisory 95,000 lower edge; Confederate
130,862 known plus twenty unknown, within 100,000–200,000. Unknown blocks do
not fight. These are runner diagnostics, not knowledge imported into the map.

Replay and mid-save checks match all daily hashes: Union 148 days, final
`c62e0a1a610d59983dd83a48f92130c86ca965344dec7c5c414c47cfe74a7004`,
resume turn 60; testbed 120 days, final
`69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`,
resume turn 40. Saved logs replay, both have zero rejections and 161 liveness
mechanics. Drafting lands 16/23 commands: twenty full days median 45.6 ms,
p95 55.3, worst 58.4; slowest draft 14.3; capped three-per-side worst 27.9.
Shared-host Windows evidence is not a Linux CI or unloaded-hardware claim.

## Proposed rulings and owning gaps

1. Keep shorter turns as a driver preference within the pack maximum. Reject
   changing pack weeks or silently passing a chosen date. Keep own-queue
   decisions visibly pending; reject pretending queueing applied effects.
2. Use complete identified-call fields and governor routes from the public
   menu. Reject inferred quotas or replacing war terms with fixed durations.
   An issued marker means issued, not fulfilled.
3. Supply lawful human appointment/establishment context.
   [requests.ts](../../packages/kernel/src/seats/requests.ts) restricts dated
   `historicalAppointments` to the rules driver; none appears in 22 human
   menus. Separately, the actual Union appointment table at this pin in
   [world.json](../../packs/union-1861/data/world.json) contains **only Butler
   on 22 May**. McDowell and Patterson are absent, not merely hidden by that
   restriction. Their sourced establishments/appointments belong to S1's
   owner. Reject automatic historical defaults or relabelling Stone.
4. Author a public live-clock marker, reported ranges and explanation of
   unavailable alternatives. `SituationView` supplies none. Reject deriving
   deadlines or future options from private effects, especially at Sumter.
5. Complete the prospective audience case, legal counters and declared replies.
   The filed answer works but is not a current numbered case. Reject inventing
   one from private traits or old reasons.
6. Have the contract owner classify the plan DTO's numeric score/weighted
   terms. The review carries score 772 and terms including `goal_fit`,
   `force_ratio`, `time`, `supply`, `glory`;
   [optionView](../../packages/kernel/src/tick/plans.ts) with `false` hides
   private notes but retains those fields. The desk does **not** display the
   numbers. This is a possible oversharing review question, not a proven canon
   violation or permission to use the numbers as advice.
7. Preserve missing human Manassas as open acceptance. [I] Different holders,
   explicit review and transport make this trajectory differ from automated
   history; they do not prove which caused the absence. Reject fabricated
   reports, truth imported from the automated run, or pack tuning for a
   screenshot. The next bounded investigation belongs to the human
   operation/appointment contract owner, using the retained commands/replies.

No menu/received-post holder mismatch was found in 22 weekly snapshots. That
is a bounded check, not a universal information-leak proof.

Findings outside my scope: the human Manassas battle scene remains unmet;
appointment/establishment authoring, situation clocks, prospective audiences
and plan-score classification need their owning lanes. Default timing,
pushback and lever-sweep failures remain open. Claude's whole-branch review
and every gated signature remain deferred under 0106.
