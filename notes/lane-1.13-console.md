# Lane 1.13: the console on the new kernel, and M2 retired

Phase 1 lane 1.13 (FOUNDATION section 12, row 1.13; 0073), on branch `phase1-console`, from main at 80f6ae7. The text console now plays the new kernel turn by turn (0027), `npm run demo` reads the new State, and M2 is gone.

**Current follow-up:** R88 fixes the completed audience's received answer on `phase1-console-session`, from `ff07445`, retaining R86's uncommitted March–July script. The audience step passes normally. Only the Union battle-hour step uses `it.fails`, as R88 directs, pending R85's operation calibration. The full no-Git check passes. Criterion 2 still lacks its Union battle; the R86 account below is historical, superseded by the R88 closeout.

## The console

`npm run play -- <pack> [--at-war]` (default `testbed`; `union-1861` opens on Lincoln's first morning, 6 March 1861).

| Piece | Where | What it may see |
|---|---|---|
| The desk: the command grammar (`parseLine`, `VERB_COMMANDS`, `DESK_COMMANDS`, `HELP`) and the text (`morningLines`, `situationLines`, `planReviewLines`, `postLines`, `dayLines`, `planLines`, `commandText`), with `dispatches.ts` extended for plans, battles, returns and the press | `packages/cli/src/desk/` | Player-facing (the boundary test's root): it imports the kernel only as `@mandate/kernel/seat-api` and reads only the morning's request (the view and the menu) and the reports a day brought |
| The driver: `ConsoleGame` holds the World and State, asks every seat each morning, runs the tick and keeps the command log | `packages/cli/src/console/game.ts` | Not player-facing: it is the shell (FOUNDATION section 9: turns are the shell's) |
| The session: text in, text out; orders queue until "end" | `packages/cli/src/console/session.ts` | Joins the two |
| The keyboard loop | `packages/cli/src/play.ts` | |

**Turns (0027).**
- A turn runs up to the pack's new `turns.maxDays` (7 in both packs) and ends early on any decision point that is the player's: a plan for review, an objection, a battle report, a situation surfacing or resurfacing, and the rest.
- His orders go on the turn's first morning. The other days he waits, and each day's new reports are shown as they arrive, stamped with their dates.
- Refusals of his own orders (an unknown post, no attention) are shown on the day.
- The rules model sits in every other seat (`@mandate/rule-seats`).

**His seat is a human's.** `createState` is given `drivers: { <principal>: 'human' }`. Without it the kernel took each situation's historical default for him (0040: that default is only for rule-driven principals), which the first try showed: his situations vanished.

**The inbox** is his view's reports since the last turn (`inbox all`: every report he holds). **Situations** show their title, text, options, who urged each, the staff line's author and whom he may hand them to. A waiting option (0046) is recorded and the situation stays before him.

**Plan review.** `plans` shows each submitted plan's axes (route, strength, arrival, phases), what it asks and its conditions.
- `approve`, `sendback` and `edit` send 0026's grammar: objective, waypoints, timing, `add_axis`, `remove_axis`.
- `preview <post> <edit>` re-expands the edit as the commander will (`previewEdit`, below) and shows the route it makes and the time it takes ("arrives in 11 days instead of 5") before anything is sent. This is lane 0.9's finding 5.

**Every verb of 1A**, each an order to a person (hard rule 1):
- order, review (approve, send back, edit), go, call, decide, delegate;
- appoint, relieve, transfer, inquire, consult, audience (with counters), observer, promise, pressure, address.

A place appears only inside an order to a person: an order's objective, an edit's region or waypoints, an inquiry's subject. No word moves a force: `move`, `march`, `attack`, `detach` and the rest are unknown commands.

## In the kernel (small)

- `tick/edit-preview.ts` `previewEdit(world, state, post, edit, day)`: the edited plan as an `OptionView`, built as `tick/plans.ts`'s `answerEdit` builds the edit on arrival (the commander's planner input from his view, `applyEdit`, his scorer), or the reason it cannot be made. Pure; compliance is not read (that answer comes when the edit arrives).
- `seat-api.ts` now exports the people verbs' command types, `COMMAND_KINDS`, `RELIEF_MODES` and the audience's `COUNTER_KINDS`/`CounterTerms`: plain vocabulary, no State, so the desk can build them. The boundary test still proves its import closure clean.
- `WorldRules.turns: { maxDays, cite }` (0027's "pack-set maximum"), in both packs at 7. The kernel never reads it; the shell does.

## Tests

- **`packages/cli/test/console.test.ts`** (10 tests): the scripted session, headless.
  - **The testbed's week** (at least seven days over three turns, each at most seven, as the test asserts):
    - posts are listed, and "move" is refused;
    - an order is queued and sent;
    - the turn stops on plan-review;
    - the plan is shown, an edit is previewed, and the approval is sent;
    - both situations are before him and decided as he chose (one decided, one waiting);
    - the same lines reach the same State, and the console's log replays from the start to the same hash.
  - **The edit preview**, on a moving plan.
  - **The Union stub:** Lincoln's first morning at peace, a week passing, and the kernel refusing an inquiry to a post that does not exist.
- **`packages/cli/test/verb-list.test.ts`**, rewritten for the new kernel. The console words map onto `phase0.COMMAND_KINDS`, less `choose` (a commander's answer, never the principal's), with `review` split by its three actions: one word per verb. The look words are disjoint from the verbs, and no undeclared word moves a force. Every `cmd` the desk builds is a principal's verb.
- **`packages/kernel/test/boundary.test.ts`**: the legacy exception list is empty, and the desk stays a player-facing root.

## Original dependencies on lanes 1.11 and 1.12

At the original hand-over, the Union part of `console.test.ts` was a stub. R86's separate `console-session.test.ts` now exercises the merged situations and rule seats:
- **Today:** union-1861 has no situations authored, and the Confederate principal is the generic rule seat. So its scripted week only addresses, inquires and waits.
- **After lane 1.11 merges:** the script decides the March to July situations (the Sumter crisis, S09's call with `session-call`, S20's special session) through `decide`.
- **After lane 1.12 merges:** the rule-seat principals have their policies, and the script checks the other side acts.

The testbed part already plays a full scripted week, with situations, a plan review and a preview.

## M2 retired

**Deleted:**
- **The kernel:** `state` (GameState), `rules` (KernelRules), `scenario`, `derive`, `messages`, `orders`, `reading`, `audience`, `verbs`, `theatre`, `proxy`, `ladder`, `view`, `bot`, `turn`.
- **The kernel's tests:** `turn.test.ts`, the M2 `audience.test.ts` (lane 1.5 recast its nine cases on the new State; the done check now reads them in `people-verbs.test.ts`), and the M2 `fixture.ts`.
- **The CLI:** `console`, `format`, `play` (rewritten), `load`, `run`, `headless`, `m2-liveness`, `run-headless`, `run-pack`, `run-testbed`, `testbed-script`.
- **The CLI's tests:** `console.test.ts` (rewritten), `testbed-run`, `determinism` (M2's) and `health-gate` (M2's gate).
- **The scripts:** `run:testbed`, `run:pack` and `run:headless`. `demo` now runs `packages/cli/src/demo.ts`.
- **CI:** the two M2 determinism steps. The seats runs and the done check remain, and `ci-workflow.test.ts` now forbids `run:headless`.
- **The packs:** both M2 `scenario.json` files, union's `source/generate.mjs` and `test/union-pack.test.ts`. The READMEs are updated.

**What of M2 survives, and why:**
- `permille`, `compare` and `rng`: integer arithmetic, strict comparison and the named seeded streams that every kernel module uses.
- `compliance` and `directive`: the compliance machinery the people core reads (`reading/orders.ts`, `tick/people-week.ts`, `planner/edits.ts`).
- `people.ts`: only compliance's input profile (`ProxyProfile`, plain `PersonId` and `ValueId`). The `ids` namespace stays because of these plain aliases.
- **Not `rules`, though section 10 names it as surviving.** M2's `rules.ts` was `KernelRules` (M2's parameters), importing M2's `state.ts`. No new code read it: the new kernel's compliance defaults are `compliance.ts`'s, and every other number is a pack rule (0072).

**The demo** (`packages/cli/src/demo.ts`) is M0's demo on the new State. One bold advance is read by three testbed commanders through the people core (`answerOrder`: drawn traits, regard, credibility). The organiser refuses openly, the appointee says comply and reinterprets, and the fighter complies. It moved from `packages/kernel/demo/` to the CLI because it now loads a pack.

## Choices made (for the decision record)

1. **The desk and the driver are split along the boundary.** The desk sees views; the driver holds State. *Rejected:* one console module with State, which would leave the player-facing code unchecked by the boundary test.
2. **The edit preview lives in the kernel, re-expanding the edit as the commander will.** *Rejected:* a console-side route guess, which would differ from what he does, and showing scores of his judgement (only the route and the time are shown, beside the plan's own terms, which the review already shows).
3. **The turn length is a pack rule (`turns.maxDays`).** *Rejected:* a console constant (0027 says pack-set).
4. **Orders queue and go on the turn's first morning.** *Rejected:* sending at once mid-turn. A turn is the unit the player acts at (0027), and replay reads one log day.
5. **His seat is registered `human`.** *Rejected:* keeping `rules`, under which the kernel takes his situations' historical defaults.
6. **`rules.ts` is retired, though section 10 names it.** *Rejected:* keeping dead M2 parameters.
7. **The demo moves to the CLI.** *Rejected:* a hand-built fixture World inside the kernel package.

## For the lead

1. A decision record for the seven choices.
2. **FOUNDATION, from the lead:**
   - section 10's "What happens to today's kernel" (the survivors are `permille`, `compare`, `rng`, `compliance` and `directive`, with `people`'s profile types; not `rules`);
   - section 10's named tests (M2's `audience.test.ts` is gone; its nine cases live in `people-verbs.test.ts`, and the done check reads them there);
   - the module map's `turns` rule;
   - the desk as the console's player-facing root.
3. **Lane 1.11 and lane 1.12** complete the Union scripted session (see "What waits").
4. **The steward** should sync `docs/OPEN_QUESTIONS.md` and the roadmap for the retired commands. `CLAUDE.md`'s phase paragraph and command list are updated here.

## The lead's three follow-ups (second commit)

1. **The budget control** in `done-check.test.ts` asserted the real run's stopwatch on its first line. It now uses given timings (`budgetProblems` over a synthetic fast run), so the hook runs only logic. The real budget stays behind `MANDATE_TIMING` (lane 1.0t's helper).
2. **Attention is in the seat's view.** `SeatView.attention` is what is left of his week (null for a seat that keeps none), built by `viewFor` from `seats`. The driver no longer reads State for it; the desk shows it from the request.
3. **The "missing" battle decision point was not missing.** In the testbed week the southern army attacks the northern capital on day 8. Its four hour-stamped dispatches and the first casualty return are written that evening (reports are written at the day's end, after deliveries) and reach the principal the next morning. The first return is lane 1.4's `battle-report` point (`tick/deliver.ts`), and the turn stopped on it. My first look had cut that turn's output.
   - **What it did show:** the battle day's dispatches printed in id order (afternoon before dawn) with no hour. The desk now orders each day's reports by the day and hour written, and prints the hour ("written day 8 at 06:00"). That is FOUNDATION section 9's night of the battle, hour by hour.
   - **Test:** the turn ends on `battle-report`, the four dispatches read dawn to evening, and the first return is there.

## Findings outside my scope

- **The press's front pages reach every serving post holder**, so the Union inbox fills with dispatch traffic. Filtering the inbox by report type, or summarising each week, is a Phase 2 desk question (the lead files it in OPEN_QUESTIONS).
- **A battle at the testbed's northern capital brings a "governor's wire" whose author is the principal himself** (`informal/governor-wire from n_leader`). The capital region's government head post is his, so lane 1.4's governor wire reports to him from him. It is harmless, but `battleReports` could skip a governor who is the principal.

## R86: the scripted console session (2026-11-20)

For the lead: 2 items. **The test is delivered; FOUNDATION section 12, 1A criterion 2 remains unmet.** Work stayed in `C:/Pyrrhic/mandate-console-session`, branch `phase1-console-session`, at `ff07445735e0423581f5107ce89b348770fde024`. Git was read-only. `npm ci` ran first, exit 0 with zero vulnerabilities. No simulation, pack, gate, band, schema, lockfile or save changed.

### What the player script does

`packages/cli/test/console-session.test.ts` constructs the ordinary `ConsoleSession` and then calls only `start()` and `handle(text)`. Its player has no State, World, seat request, command log, runner or kernel access. It checks each input word against `VERB_COMMANDS` or `DESK_COMMANDS`; post selectors, options, reviews, calendar dates and results come from printed console output. The authored choice table is pinned to the existing pack's `historicalDefault` options, rather than reading those defaults during play.

The peace-start session prints **31 July/day 148**, then opens the morning of **1 August/day 149**. Every turn stays within seven days. It sends all **18 authored Union decisions / 21 option selections**, including the opening, the militia call, recognition and Congress. Parser failures and kernel refusals are checked. Unknown decisions or missing historical options fail with their reason; nothing is skipped.

The advance choice is made on **1 July**. The script orders the displayed holder of `us_dc_militia`; after Scott's received objection it sends the same goal around the chain. On **6 July** Stone submits the displayed route `washington > northern_virginia > manassas`, eight days. The player previews and sends an objective edit to its displayed intermediate region, `northern_virginia`, around the same chain. The preview shortens the arrow to three days; **7 July/day 124** brings Stone's `answers your edit: comply`. This exercises a real geometry change, rather than resending an unchanged waypoint.

### Remaining gaps and proposed rulings

| Gap | Evidence and owner |
|---|---|
| Audience result is invisible | `audience us_dc_militia` is sent on 6 July without a refusal, but no completed audience answer is printed. The test requires a received, valid declaration, and rejects error answers. `tick/verbs.ts`'s successful `holdAudience` records the response/event but sends no answer report; the console renders neither that response nor an audience case. **Owners: lane 1.5 and the seat-view people follow-up (R70), then lane 1.13.** This test does not infer that an audience was held from an empty error list or read hidden State to prove it. |
| No hour-stamped Union battle dispatch | Sumter's 12–13 April bombardment dispatches arrive, but their report source, `tick/bombard.ts`, explicitly sets `reportHour: null`. No field-battle hour sequence reaches this desk by 31 July. **Owners: reporting lane 1.4 / bombardment lane 1.12, with an actual fought-operation route belonging to lane 1.14 (R85).** No hour was invented. |
| Grouped decisions cannot be taken in stages | Taking only `cross_river` immediately settles western Virginia and loses the later `recognise` choice. The final script waits until both historical options are offered, then sends both on 27 June. **Owner: situations lane 1.11.** This records the limitation; it does not claim that the crossing's timing matches the record. |
| Console dates differ from the headless history | Weekly turns give the player the next stopping morning. The relief choice is 7 April, the call 16 April and the special-session answer 6 July. The complete table is `runs/r86/decision-dates.json`. **Owner: turn/console lane 1.13 for any finer clock control; lead for acceptance interpretation.** No date or band was changed to hide this. |

**Proposed rulings:**

1. Keep the audience requirement failing until a seat-owned speech/answer source and its console rendering exist. Reject treating a queued command as a visible audience, or reconstructing a reply from private compliance inputs. This follows the unresolved audience source already recorded in `notes/lane-seat-view-people.md`.
2. Keep the Union battle requirement failing. Continuing this same session through the first turn past **31 August** reaches the morning of **5 September/day 184**, with no hour-stamped battle sequence. The nearest demonstrated working route is the **fictional testbed battle on day 8**, received on day 9: **08:00, 12:00, 17:00, 21:00**. Its separate supplemental test passes and proves that the reader rejects reversed or unstamped dispatches. Recommend retaining it as supplemental coverage while R85 supplies an honest Union battle route; reject counting it as satisfaction of the Union criterion or assigning fabricated hours to Sumter.

The script follows the authored historical **choices when offered**, rather than asserting calendar or State equality with the all-rule-seat history. The grouped-choice delay and different dates remain explicit limits of this route. No acceptance criterion was retired.

### Validation and retained evidence

Evidence lives in this worktree's ignored `runs/r86/`; standalone summaries/saves are under `runs/r86-done-check/`. Optional `R86_EVIDENCE_DIR=runs/r86` retains the test transcripts. Normal test collection has no new skips.

| Check | Exit and result |
|---|---|
| `npm ci` | **0**, zero vulnerabilities; local `@mandate/*` links resolve into this worktree |
| Cheap console preflight | **0**, startup, help and readable post/situation/plan selectors |
| Final focused session | **1**, **5 passed / 2 failed**, the two unmet requirements above |
| Exact `MANDATE_NO_GIT=1 npm run check` | **1**, **129 files passed / 1 failed; 1,476 tests passed / 2 failed / 3 existing skips**; typecheck passed; total shell time 208.00 s |
| Boundary, licences and decisions, separately after the chained check stopped at tests | **0 / 0 / 0**, 314 files / 61 terms; all four lockfiles; 104 decision rows |
| `npm run run:done-check -- --label r86-done-check` | **0**, **Phase 0 6/6**; full eight-seed sweep and drafting, **1,465.35 s**; run once |

The standalone harness's **1A subgates are 2/6**, passing unknown-strength and stand-ins, failing checkpoints, operation, pushback and lever sweep. Its default exit does not bind those subgates and does not measure the separate console criterion 2. All failure categories are retained in `done-check.log`: Missouri neutral, western-Virginia checkpoint mapping, Confederate men 20,957 below 100,000, neither side fighting a planned operation; relay holds 1 below 2, filter holds 0 below 1, trims 0 below 1, reservations 44 above 9; the existing partial people/grievance measure and unexercised border-governor chain in D6. **Owners remain R85 / the existing 1B gate owners.** No calibration was attempted here.

War/history median–p95 costs are **37.30/60.18 ms** and **35.64/60.90 ms**, within unchanged **40/160** limits. The standalone Union final hash is still `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`; daily hash, replay and day-60 resume checks pass. These local timings are not unloaded-host or Linux CI claims.

The initial TypeScript `findLast` error was corrected with an ES2022-compatible lookup before the campaign. Retained first-session failures exposed the grouped-choice loss and unanswered relay objection; the script now waits for the grouped options and uses the existing bypass verb. A faulty assertion that expected the edit first in a combined queue was corrected. Negative controls verify that reversed hours and absent stamps fail. All failures remain in their logs; no production defect was concealed by a skip or expected-failure annotation. The broad check ran once, and the full done check ran once. Final hand-over edits reuse the settled code evidence.

Runtime/import diagnostics and a full source audit preceded this closeout: **all 1,651 baseline files were unchanged before this hand-over edit**, with only the new console test added. Final intended delivery is that test and this hand-over; all other baseline files, including production code, signed inputs and save fixtures, remain unchanged. `runs/r86/final-checks.json` records the final inventory and evidence paths. No server, browser, build or other request was started. Review is pending with Claude under 0096.

For the lead:
1. Route the audience source/rendering gap to lane 1.5 / the R70 follow-up and lane 1.13; criterion 2 stays failing until output proves the audience.
2. Rule on the supplemental battle route and the historical-choice/date interpretation; route the Union fought-operation and grouped-situation limits to R85 and lane 1.11. Keep the two failed tests binding unless the owner explicitly changes the criterion.

## R88: received audience answer and the known battle gap (2026-11-20)

For the lead: 2 items. **R88 is delivered, uncommitted**, on `phase1-console-session` at `ff07445735e0423581f5107ce89b348770fde024`. The audience requirement passes normally; the absent Union battle remains binding and owned by **R85 / lane 1.14 calibration**. Git was read-only. Evidence: `runs/r88/final-checks.json`.

### What changed

`tick/verbs.ts` now files a successful audience's **declared answer and stated reasons** as an ordinary received report, linked to the request and attributed to its visitor/post. It uses the existing in-person transport and report/view owners. The console's existing dispatch renderer then shows the answer; no console access to private responses or live previews was added. The script receives Stone's `audience: comply` on **6 July/day 123**. No new State field, schema, pack rule or authored historical text.

The new setting-free regression proves that a reply is absent before delivery, reaches the requesting seat afterward, and carries the declaration rather than a different private response. Hidden grievance reasons stay hidden; changing the private response record leaves received reports unchanged. The initial missing-answer failures and a corrected fixture assumption (its first visitor actually complied) are retained in the logs.

R86's script changes only in the battle failure's owner message and its `it.fails` annotation/comment. The audit reconstructs the prior file and matches its R86 hash. **Exactly one expected-failure declaration**, with no new skips. When chronological battle-hour dispatches reach the July desk, Vitest will report an unexpected pass and require conversion to plain `it`. The supplemental fictional battle remains ordinary coverage, not satisfaction of the Union criterion.

**Proposed ruling:** retain the completed audience's answer through the existing in-person report path. Reject reading `orderResponses` or recomputing a preview in player-facing code. This does not supply R70's separate prospective counter/case projection.

### Final validation

| Check | Result |
|---|---|
| Focused audience, console and session tests | **exit 0**, 47 passed / 1 expected failure |
| Cheap typecheck and boundary preflight | **exit 0 / 0** |
| Exact `MANDATE_NO_GIT=1 npm run check` | **exit 0**, 130 files; 1,478 passed / 1 expected failure / 3 existing skips; **142.99 s**; all chained gates pass |
| Normal eight-seed `run:done-check`, including drafting | **exit 0**, Phase 0 **6/6**, 1A **2/6**; **1,727.50 s**, once, no retry |

All checked daily hashes and liveness rows equal R86 in both packs; replay and save/resume pass. Union's final hash remains `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`. War/history median–p95 costs are **33.04/54.13** and **34.09/58.74 ms**, inside unchanged **40/160** limits. These are local measurements, not unloaded-host or CI claims.

The same four 1A categories fail: **checkpoints, operation, pushback and lever sweep**. Every failure remains in `done-check.log`; R86's detailed inventory above is reused unchanged. The default exit and expected-failure annotation do not waive them or console criterion 2.

Runtime diagnostics, package links, inventory and preservation checks preceded this documentation batch. Final scope is four delivery/hand-over files; **1,648 other baseline files unchanged**, no addition/deletion, all five captured worktree Git metadata files unchanged. Packs, signed inputs, saves, lockfiles, bands and other worktrees are preserved. No install, build, server or browser. Claude's independent review remains pending under 0096.

For the lead:
1. Review the received audience source and R88 delivery under 0096.
2. Retain R85's Union operation/battle gap; convert only its expected-failure step to plain `it` when the required dispatches arrive. The earlier grouped-choice/date limits keep their R86 owners.

## Findings outside my scope

- The four existing 1A failures remain with R85 and the named 1B gate owners. R70's prospective audience case/counters remain with the seat-view follow-up. R88 changes no band, historical choice or other request.
