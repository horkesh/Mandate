# Lane 1.13: the console on the new kernel, and M2 retired

Phase 1 lane 1.13 (FOUNDATION section 12, row 1.13; 0073), on branch `phase1-console`, from main at 80f6ae7. The text console now plays the new kernel turn by turn (0027), `npm run demo` reads the new State, and M2 is gone.

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

## What waits on lanes 1.11 and 1.12 (the scripted session's completion)

The Union part of `console.test.ts` is a stub:
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

## Findings outside my scope

- **The principal's attention** is shown from State by the driver. It is his own resource, but `SeatView` does not carry it. A view field would let the desk read it like the rest.
- **The press's front pages reach every serving post holder**, so the Union inbox fills with dispatch traffic. Filtering the inbox by report type, or summarising each week, is a Phase 2 desk question.
- **No decision point fires for a battle the player's side fought** at its capital in the testbed week (the front page and the return arrive, but the turn ran on). Check whether `battle-report` points reach the principal, or only the commander.
