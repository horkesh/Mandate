# S33: can a player bring on the July battle?

For the lead: three items. **Yes.** The human player fights at Manassas on
**28–29 July (days 145–146)**. Eight field dispatches, with hours 08:00,
12:00, 17:00 and 21:00, reach Lincoln on **29–30 July (146–147)**. The run
completes 31 July. These are game dates, not historical-date certification.

1. S29's missing battle is traced to its later review sequence and an actual
   slow walk despite a declared reply of comply. A note-scoring mismatch
   explains the edit's departure penalty; it remains a kernel finding.
2. The player gives the goal, reviews the plan, edits its arrow and approves
   it. Desk gaps in dates, pending reviews, timing, permission and delivery
   are corrected and tested. Native controls reproduce the successful
   public trajectory exactly.
3. The required default done check remains red: **exit 1, Phase 0 5/6,
   supplemental 1A 4/6**, with all ten problem statements retained. No D6
   clearance or relaxed criterion. Whole-branch review remains with Claude
   under 0106; nothing is signed.

## Scope and method

S33 only, `C:/Pyrrhic/sprint-desk`, `sprint/desk`, from `7db8c80`.
Read CODEX from the top, including the standing, command-line, writing and
S1–S10 sprint rules, and decision 0106. Root `npm ci` exited 0.

All actual desk interaction used the prototype's **headless Playwright
harness** on owned port **5297**, now closed. No Computer Use, desktop
control, visible/real browser, loaded State, route mocking, likeness or
slogan. No other sprint worktree was written, no push or history rewrite.
There is no new kernel, pack, schema, band, art or map change.

Evidence root: `C:/Pyrrhic/ByOrderOfThePresident/art-masters/S33/`.
The primary run re-enters 79 unchanged S29 UI commands to the day-133 morning,
then presses the advance. It contains 107 successful UI commands, including
previews and recalled slips, and uses one-day turns from day 133. The second
run uses the new native controls, with 103 commands: it removes four review
recall/re-sign commands. Its final public morning, complete turn history and
empty queue equal the primary run exactly. Both have zero page errors and
send-time refusals. The final calendar is 1 August, the next morning after
day 148; no August day executes.

The prefix uses S29's authored-choice playtest reference. No historical-default
choice was added to the product. This is a scripted maker playtest, not an
independent usability study.

## What rule-seat Lincoln did

The fresh rule-seat trace reproduces `battle:manassas:144` and the retained
reference final hash
`c62e0a1a610d59983dd83a48f92130c86ca965344dec7c5c414c47cfe74a7004`.
Its exact log is `rule-log.json`; daily July records are in `rule-july.json`.
The policy is `principalOrders` in `packages/rule-seats/src/index.ts`:
answer reviews and awaiting-word operations, then dated offensives, calls,
transfers and inquiries. The policy alone does not prove a July approval
command occurred; the actual log shows automatic permission for this plan.

| Sequence | Rule-seat history | S29 human | S33 pressing player |
|---|---|---|---|
| Goal, 16 July / 133 | Take Manassas, risk 500, 30 days, approve as drafted, no await; courier | Same objective/risk/deadline, but requires review; wire | Same S29 goal requiring review |
| Scott's objection | Repeat goal directly by courier on 136 | Repeat around relay on 136 | Repeat directly by wire on 136 after received objection |
| Review | No July approval command: plan already has permission | Send back with zero-day wait note on 138; receive redraft on 139; edit on 140 | Edit waypoint via Northern Virginia and explicitly approve on 138 |
| Operation opens | 137 | 140 | 138 |
| Concrete preparation | Two-day assembly and two-day depot stage | Four-day assembly and four-day depot stage | Two-day assembly and two-day depot stage |
| Battle | Starts 144 / 27 July | None through 148 | Starts 145 / 28 July, ends 146 / 29 July |

All goals have `awaitWord: false`. **No missing go command explains S29.**
An accepted edit can itself authorize execution (`settleCounter` in
`packages/kernel/src/plans/plans.ts`). Explicit approval is part of the S33
requested playthrough, not proven universally necessary. The five identified
calls are present in S29 and S33, with the same early recruitment prefix.
The successful replay does not require a new troop call.

At this pin **Stone commands both the rule-seat and human operations**.
There is no McDowell appointment or McDowell-authored plan to claim. The
appointment gap cannot alone explain S29's missing battle.

## Why S29 misses July: developer diagnosis

These private facts were **not exposed on the player desk**.
`scripts/s33-compare.ts` reconstructs kernel commands from retained UI
submissions, respecting recalls, human driver assignment and seed. It does
not instantiate or drive a desk, or load diagnostic State into one. Both
replays reproduce their recorded final public morning exactly, without
kernel rejections.

| Measured edit fact | S29, day 140 | S33, day 138 |
|---|---:|---:|
| Chosen plan score | 1072 | 772 |
| Delivered-note contribution | 300 | None |
| Edit distance | 300 | 0 |
| Sole dropped score term | Notes: 300 | None |
| Actual response | slow_walk | comply_with_reservations |
| Declared response | comply | comply |
| Concrete duration | 12 days | 8 days |

S29's zero-day wait note is reported followed. Its redraft receives the
300-point note contribution. The same-route waypoint edit is compared
against that note-weighted draft, but rebuilt without the note term. The
counter loses only `notes`, producing a 300 departure and a slow walk. Both
preparation stages stretch; on day 148 it remains paused at the Northern
Virginia depot.

Source chain:

- `packages/kernel/src/planner/notes.ts:65`: `noteCandidates` adds delivered
  note contributions to draft scores.
- `packages/kernel/src/tick/plans.ts:209`: drafting supplies note weights;
  `:240` builds the edit input without those readings.
- `packages/kernel/src/planner/edits.ts:111`: rebuild the edit; `:113` compare
  with the draft's best score; `:176` stretch the concrete slow walk.

**[I] The comparison uses inconsistent scoring bases.** The proposed kernel
ruling is to compare draft and edit on the same note basis. S33 records this
rather than changing the kernel or fitting a number to July.
Evidence: `kernel-diagnosis.json`, `s29-kernel-replay-148.json` and
`s33-kernel-replay-148.json`. Diagnostic final hashes:
`9fb616613cb1e4e87294be05d84b0b81009ed6de6af2e56e69b87b915d56b95d`
and `6f5e705899a4d6bb4d029abebaca2af53c674195e842e7c749b68e525b7cdaf0`.

## Discoverability from the desk

| Step | Previously | S33 correction and limit |
|---|---|---|
| Dated goal | Situation and order grammar; no dated goal entry | Due, at-war advance entry names post, objective and proposed date, and opens an editable goal requiring review. No automatic dispatch; future and peace-time rows stay hidden. |
| Waiting plan | Review stop and weekly papers; unchanged Plans button | Persistent review count on Plans, plus review/awaiting-word summary and Open plans on the turn sheet. |
| Approval | Button without dispatch/execution explanation | Map sheet explains permission on receipt, separate await/go case, out-tray and potentially misleading declared reply. |
| Timing | Map review omitted supplied duration; depot tokens said Not supplied | Supplied duration from plan start and plain depot wording. It is an estimate, not an absolute march date or battle promise. |
| Relay objection | Order-sheet grammar could choose route/bypass; map buttons could not | Actual menu routes and relaying offices, explicit bypass checkbox and grievance/conflict consequence. No automatic bypass. Special-messenger cost enters review/edit affordability. |
| Goal already sent | No state beside the proposed advance | Own queued/dispatched slips are distinguished; a refused dispatch remains available. Neither state is labelled compliance. |

Each corrected area has a regression in `test/s33-discovery.test.ts` or
`test/s33-plan-permission.test.ts`: nine S33 cases. Native checks assert the
July date, actual goal, review count, duration, wording and exact delivered
edit/approval lines. The player can complete this path using the desk; this
does not establish that an unbriefed player will discover it unaided.

## Kernel and pack findings left with their owners

1. Note/edit scoring needs a same-basis correction and regression. Preserve
   actual versus declared response; do not reveal private scores/willingness.
2. `packs/union-1861/situations/mcdowell_advance.json:29` makes `advance_now`
   set a flag, not issue an operational goal. A player can read that decision
   as the order. Its owner must connect it to a lawful goal proposal/order
   or clarify the separate act. S33 does not infer effects from the flag.
3. Human appointment/establishment context remains incomplete;
   `packages/kernel/src/seats/requests.ts:201` restricts dated historical
   appointments to the history driver. Do not call Stone's plan McDowell's.
4. There is no public absolute operation-start/advance clock here. An axis
   duration cannot establish message arrival, actual movement or a battle
   date. Further progress must be authored/projected by its owner, rather
   than reconstructed from State.

## Verification and preservation

| Evidence under S33 | Result |
|---|---|
| `press-advance/` | Primary trajectory: 107 commands, eight Manassas papers, zero errors/refusals; Playwright exit 0. |
| `discovery/` | Native controls: 103 commands; exact public morning/history/queue equality in `equivalence.json`; exit 0. |
| `discovery/papers/manassas-dawn-{1920,3440}.png` | Actual paper written 28 July, 08:00, received 29 July. Read-only observer, no command POST; exit 0. |
| `final-opening.log` | No premature July agenda, ready map and usable controls; exit 0. |
| `desk-suite.log` | Full desk suite before final due-date restriction: 120 passed, three existing skips. |
| `final-targeted-separated.log` | Final affected checks: 20 passed, including nine S33 regressions. Unaffected suite evidence reused. |
| `final-build.log`, `final-source-typecheck.log` | Final build and complete tooling typecheck exit 0; existing >500 kB bundle warning retained. |
| `commit-trace.log`, `commit-discovery.log` | First two actual hooks exit 0: each 151 files, 1608 passed, one expected failure, four skips; type/boundary/licence/106-decision checks pass. Final hook receipt: `commit-final.log` / `commit-final.exit.json`. |
| `final-inventory.json`, `capture-reuse.json` | 23 PNG/recipe pairs with source/output hashes, all 1920×1080 or 3440×1440; 728 protected runtime/art/map inputs unchanged; final build 430 files / 471,652,971 bytes. All scenes are due and at war, unaffected by the final agenda restriction. |
| `runtime-preservation.json` | 268 reference daily hashes match S29, plus World/initial/final hashes, activity, liveness, rejections and replay/save/resume. |
| `server-closed.json` | Zero listeners on port 5297 after final opening check. |

Eight retained `battle-*` images are daybook overviews still scrolled to
opening entries. They are **not visual proof of the battle paper**. Visual
review caught this; the two observer captures above supply the proof. No
failure was deleted or silently promoted.

Other retained failures: the first server-rendered test needed a browser
location fixture; the first raw-kernel diagnostic tried shell `end 6` without
the console's turn-limit projection. A seven-day diagnostic preflight passed
after shell-only end/preview actions were separated from kernel submissions,
before the full diagnostic replays. Intentional red tests precede the UI
corrections, including the final due-date restriction. No campaign retry,
weakened timeout or criterion. This is a local-server prototype with its
configured art root, not a shipping package or Linux CI timing result.

## Required campaign: every unmet criterion retained

One default `npm run run:done-check -- --label s33-desk-manassas`, including
drafting and all eight seeds: **exit 1; Phase 0 5/6; 1A 4/6**.
`done-check.log` and `runtime-summary.json` retain all ten full problems.
Five runtime files were copied from this worktree's `runs/s33-desk-manassas*`
to `S33/runtime/` and hash-verified before this report.

| Failed criterion | All problems |
|---|---|
| Budget | Union reference median **54.61 ms**, p95 **155.34**, max **310.78**; history median **54.02**, p95 **128.34**, max **292.86**. Both medians breach unchanged **40 ms**. Unchanged p95 limit **160 ms**. Testbed median/p95 **3.58/5.17**. Shared-host sample, including concurrent required hooks. |
| Pushback | Relay holds **1 < 2**; filter holds **0 < 1**; trims **0 < 1**; reservations **86 > 9**; slow walks **13 > 9**. Relay objections 2 and plan objections 27 remain inside bands. |
| Lever sweep | Fort Monroe's watched return best **6/8**; people/grievance unmeasured; no border governor call answered within **24 moves**, seeds **1861–1868**. Eight gated decisions, 624 base-run calls. **No D6 clearance.** |

The Union checkpoint's strength floor remains expressly nonbinding: 58,497
known men and four unknown blocks, against nominal 95,000. A checkpoint pass
does not establish that strength. Confederate known strength is 130,862,
with twenty unknown blocks. Unknown blocks do not fight. No band, signature
or placement changed.

Drafting: 16 of 23 commands have land forces; twenty full drafting days have
median/p95 **36.9/39.7 ms**, slowest single draft **6.2 ms**, capped
three-per-side worst **19.5 ms**. These do not waive the tick-budget failures
or establish optimization savings.

## Proposed rulings and hand-over

1. Keep due, at-war goal offers and explicit human review. Reject future
   hindsight, automatic dispatch and treating a situation flag as an order.
2. Keep review/awaiting counts, supplied duration, honest permission wording
   and explicit legal delivery. Reject guaranteed battle dates, automatic
   bypass and calling a dispatched slip execution.
3. Treat the sole 300-point note loss as a kernel scoring-basis defect to
   resolve with the same context on both sides. Reject fitting scores/bands
   to July, deleting notes to hide the seam or exposing private compliance.
4. Accept actual human dispatches as S33 evidence. Reject rule-seat or
   opening-daybook substitutes, historical-date certification and McDowell
   attribution at this pin.

For the lead:

1. Route note/edit scoring to its kernel owner with the exact replays/drop.
2. Route flag/goal, appointment and public-clock gaps to their owners; keep
   existing runtime/gate failures open.
3. Review the whole branch under 0106 before integration. Nothing is signed.

Findings outside my scope: those kernel/pack items, timing, pushback and
sweep acceptance, Linux CI and Claude's standing/gate review. No other sprint
lane was changed.
