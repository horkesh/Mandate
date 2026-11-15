# Lane 0.8 hand-over: the headless runner and the Phase 0 done check

Branch `phase0-done-check` (worktree `.claude/worktrees/presentation-design-8c8c87`), on top of e08e0b1 (main after lane 0.5's pack rules, 0064 and 0065). Built to FOUNDATION section 12, row 0.8, in the five steps of the brief, one commit each (step 5 also carries this note).

## What is built, and where

| Piece | Where |
|---|---|
| **The runner**: `npm run run:phase0 -- <pack> [days] [--mode short\|full] [--hash daily\|checkpoints] [--checkpoint-every n] [--resume-at day] [--timings] [--at-war] [--label name]`. One implementation of the run and its three checks (replay, save, resume); a hash at checkpoints by default, a per-day summary (what fired each day), checkpoint scores, the liveness table with the gate, optional tick timings; writes only to `runs/` | `packages/cli/src/phase0-run.ts`, `run-phase0.ts`, `phase0-scores.ts` |
| The seats runner (`run:seats`, lane 0.6) is now that run with a hash every day, in its old summary shape; its World helpers moved | `seats-run.ts`, `seats-world.ts` |
| The session loop gained a hash cadence (`hashEvery`) and a `beforeDay` hook for a runner's clock; State and the hashes taken do not depend on either | `packages/kernel/src/log/session.ts` |
| **The liveness gate**: bands for every mechanic of `TICK_MECHANICS` and `MAP_MECHANICS` in two full reference runs and two exercise runs; every mechanic that fires in none is in `QUIET` with its reason and the kernel test that drives it | `packages/cli/src/liveness-gate.ts` |
| **The war gate** (0064): the principal's menu carries `atWarSince`; the generic rule seat orders only when it is not null; `SetupOptions.atWar` / `--at-war` is the labelled mechanics-run option | `kernel/src/seats/{api,requests}.ts`, `kernel/src/tick/setup.ts`, `rule-seats/src/index.ts` |
| **The done check**: six criteria as pure functions of run summaries, `npm run run:done-check`, and a CI step | `packages/cli/src/done-check.ts`, `run-done-check.ts`, `.github/workflows/ci.yml` |
| The drafting measurement on the Union graph (the planner spike's `draft`) | `packages/cli/src/drafting-measure.ts` |
| Tests | `phase0-run`, `resume-check`, `liveness-gate`, `war-gate`, `done-check` (cli); the war gate's units in `rule-seats.test.ts` |

## The done check, and where each criterion is proved

| Criterion (section 12) | Proved by | Positive control |
|---|---|---|
| Rule seats with standing goals move divisions, change control through the contest, derive fronts, pockets and supply (Union 1861 at war, 75 days, and the testbed, 120) | `behaviourProblems`: legs started and arrived, contest, occupation and control changes fire; goals reached and orders obeyed; the last checkpoint has fronts and supplied regions for each faction; a pocket at some checkpoint | the Union pack at peace fails it; a summary with no front, supply or pocket fails it |
| The same state hash on Linux and Windows | CI: both machines write a summary with a hash every day (`run:done-check --label ci-determinism`) and `tools/compare-runs.ts` compares them. In one process: a second run with State not frozen, and the timed run with no hashing, give the same hashes | a planted differing hash is named by day; the clock is never compared |
| Resume from a mid-run save equals the continuous run | `resumeProblems`, and `resume-check.test.ts` on both packs (testbed from day 40 of 120, Union from day 30 of 75) | a resumed leg whose seats act differently ends elsewhere; a hash-consistent save whose State its log never makes is reported; a tampered save or another World's does not load |
| The liveness gate for every Phase 0 mechanic | `liveness-gate.ts` and its test | a run in which no seat orders leaves movement, contest and control dead; a planted dead, flooded or rare mechanic; a quiet-by-design mechanic that starts firing; an unsound band table |
| The tests named in section 10 stand | `sectionTenProblems`: each file exists, has at least its tests, skips none (that they pass is `npm test`'s) | a deleted file, a skipped test and a thinned file are each named |
| The tick budget | `budgetProblems`: median at most 40 ms a day, p95 at most 160 ms, over requests, seats and the tick with no hashing and no freezing | a slow median, a slow tail and a missing timing each fail |

## Choices, with what was rejected (for a decision record)

1. **One implementation of the run.** `phase0Run` carries the run and its checks; lane 0.6's `seatsRun` calls it with a daily hash and maps the summary back. *Rejected:* a second runner beside it (a copy is a second owner, section 11 item 11); retiring `run:seats` (its tests and fixture are lane 0.6's, and CI runs it).
2. **Hash at checkpoints by default, every day on request** (`hashEvery` in the session loop). The done check and CI hash every day, as section 9 says tests and CI do; a long run hashes every 30 days. *Rejected:* a switch in `State` or `tick` (they must not know).
3. **"Checkpoint scores" are counts of named things the map phases derive**: regions held and traced, control shares, supplied regions, front lines and segments, pockets, men with known strength (blocks of unknown strength counted apart and listed, hard rule 6), blocks marching. Phase 0 has no victory measure; Phase 1's history run replaces them with calibration targets. *Rejected:* an invented score (a number nothing explains).
4. **The tick is timed with no hashing and no freezing**, from the morning's requests to the end of the tick, in a run of its own; the checked run keeps freezing and the deep checks. The timed run must end on the same hash, so the checks are shown not to change the game.
5. **Bands are half to double what the deterministic run showed** (`around`). The run is exact, so a band is a guard against a calibration change silently turning a mechanic off or flooding it, not a statistical bound. *Rejected:* exact counts (every unrelated change would move them); bands from memory.
6. **Every mechanic is alive in some reference run, or quiet with a reason and a driving kernel test**, checked by the gate's own test (the named test file exists and contains the named test). 17 mechanics are quiet. *Rejected:* a flat `minFires: 0` (the skeleton's shrug, which let a dead mechanic pass).
7. **Mechanics quiet by design are banded at exactly zero** (relay objections and holds, filter holds and trims: 0058), so the gate fails the day Phase 1 gives people values and the band is moved on purpose. Other quiet mechanics have a minimum of zero and no maximum.
8. **Exercise runs** make a mechanic fire that the full runs leave quiet, by changing the seats. Two exist: the testbed with commanders leaving their requests unanswered fires `seats.defaulted`; the Union pack at peace pins the war gate (movement, contest and control at zero). *Rejected:* a bare band at zero for `seats.defaulted` (no kernel test drives it: see "Findings outside my scope").
9. **The war gate is `atWarSince` on the principal's menu.** The kernel reads the pack's flag (`rules.ruleSeats.warFlags`, lane 0.5), whose value is the day it was set, and gives 0 for war from day 1; the rule seat orders on `max(its opening day, atWarSince + 1)`. A situation setting the flag on day D opens the campaign on D + 1, once. *Rejected:* a boolean (a war beginning after day 1 would never open, since the seat's opening day had passed: found while writing the mid-run test); giving the rule seat the flag name (it imports only `seat-api`, and the pack's names are hard rule 3's).
10. **`atWar` is a setup option, not a seat or runner hack.** `createState(world, { atWar: true })` sets the pack's own war flags on day 0, so the run is labelled in its summary (`atWar`) and in its hash. On the testbed (no flag) it changes nothing. *Rejected:* writing State from the runner (one writer per field); a different seat policy (the gate would not be exercised).
11. **The Union reference run is at war; a peace run pins the gate.** With the gate, a plain Union run keeps the peace from the opening and every mechanic of movement is quiet, which would hide the Phase 0 mechanics. *Rejected:* waiting for the war's opening situation (not authored, and a history run is Phase 1's).
12. **Kernel test fixtures state war from day 1** for their factions (they test the war), so every existing kernel test is unchanged.
13. **Drafting is measured by a script, not asserted.** `measureDrafting` runs the spike's `draft` for every post that commands a force block at the Union start (27, of which 19 have a land force), each asked to take the other side's capital. The done check asserts only that the drafts are sound.
14. **War flag rows are checked at setup** (the lead's review note on 0064): `createState` refuses a row for a faction the World lacks, a faction listed twice and a faction with no row, naming every problem together (`WarFlagError`, as `GovernmentError` does for governments, 0061), with a control for each in `war-flags.test.ts`. The pack validator says the same at a source cell; the kernel takes any World it is handed.
15. **One timeout, in one place.** `vitest.config.ts` sets `testTimeout` 120 s and `hookTimeout` 300 s, with the reason in a comment; no test names its own. The 5 s default failed `npm run check` on `staged-check.test.ts` and on seats-run tests that pass alone (the lead's report, and once in my own run). A hung test still fails. `npm run check` three times in a row, all green: 70.1 s, 57.5 s and 49.7 s wall (vitest 59.0, 47.8 and 40.8 s) for 809 tests in 65 files, with the done check's test inside the suite. *Rejected:* a longer timeout per slow test (scattered, and each new test would need to know); running the suite serially (slows it).


## Liveness bands

Fires in a reference run (union-1861 at war, 75 days / testbed, 120 days); a band is half to double. Zero entries carry their reason in `liveness-gate.ts`.

| Mechanic | Union | Testbed | Reason when quiet |
|---|---|---|---|
| `combat.contest`, `combat.occupation` | 62, 29 | 14, 6 | |
| `combat.retreat` | 0 | 2 | no side is pressed below the retreat threshold in 75 days |
| `combat.retreat_blocked` | 57 | 0 | fires daily while a contested side has nowhere to go (Union only) |
| `control.changed`, `control.threshold_crossed` | 36, 6 | 20, 12 | |
| `forces.stores_fell`, `forces.stores_low` | 7, 1 | 176, 7 | |
| `forces.stores_refilled` | 0 | 185 | most Union blocks have unknown stores (lane 0.5's finding 3), so few fall and none refill |
| `knowledge.pruned_age`, `knowledge.pruned_superseded` | 2, 73 | 7, 118 | |
| `map.pocket_closed` | 0 | 1 | |
| `map.recomputed` | 10 | 14 | the quiet baseline per month |
| `messages.sent`, `.delivered`, `.courier_delay` | 2820, 2681, 197 | 1829, 1812, 85 | |
| `messages.special_messenger` | 0 | 1 | |
| `movement.leg_started`, `movement.arrived`, `plans.goal_reached` | 27, 36, 2 | 7, 18, 2 | |
| `orders.obeyed`, `orders.relayed`, `seats.choices` | 2, 3, 1 | 3, 3, 1 | |
| `situations.*` (fired, surfaced, decided, delegated, staff lines, notices, orders, proposals) | 0 | 6, 6, 3, 1, 3, 3, 1, 5 | union-1861 has no situations authored yet (zero by reason, exactly) |
| `seats.defaulted` | 0 | 0 | fires in the silent-commanders exercise run |
| **Quiet in every run** (reason, driving kernel test) | | | |
| `command.government_closed`, `.government_reopened`, `.proposal_refused` | 0 | 0 | no pack situation closes or reopens a neutral government yet; `governments.test.ts` |
| `commands.rejected` | 0 | 0 | rule seats send only what the menu offers; `seats-orders.test.ts` |
| `infrastructure.changed` | 0 | 0 | nothing proposes damage until raids and operations; `infrastructure.test.ts` |
| `map.pocket_lost`, `map.pocket_relieved` | 0 | 0 | a pocket is overrun or relieved only by a reversal these runs do not make; `map-tick.test.ts` |
| `orders.bypassed`, `orders.conflict` | 0 | 0 | needs an objecting office, or two issuers; `seats-orders.test.ts` |
| `orders.relay_held`, `orders.relay_objected`, `reports.filtered`, `reports.trimmed` | 0 | 0 | quiet by design until Phase 1 gives people values and regard (0058), banded at exactly zero; the kernel tests drive them through explicit trait inputs |
| `situations.lapsed`, `.options_changed`, `.resurfaced`, `.waiting` | 0 | 0 | a rule-driven principal takes defaults at once (0057); `situations.test.ts` |

**Planner terms.** The planner is still a prototype, so none of its scoring terms is counted. When it moves into the kernel (Phase 1, 0062) the gate counts a term's firings over edits as well as drafts, or `haste` reads as dead (lane 0.9's finding 3).

## Measurements

Machine: the owner's Windows development PC, with other lanes' sessions running (so every figure is an upper-ish bound; CI hardware is unmeasured). No daily hashing.

| What | Result |
|---|---|
| Union 1861 at war, 75 days: requests, seats and tick, per day | median 15 to 23 ms, p95 25 to 82 ms, max 30 to 102 ms over six runs (the spread is the machine, not the code); the tick alone (replayed from the log) median 10 to 14 ms |
| Union 1861, a full 1,460-day campaign (`--mode full`) | median 15.0 ms, p95 24.6 ms, max 72.7 ms: about 22 s for the campaign, inside the minute section 9 allows. Nothing marches after about day 120 (every stand-in goal reached); it measures the map phases, not a war |
| Testbed, 1,460 days | median 1.6 ms, p95 2.9 ms, max 25.0 ms |
| Lane 0.5's figure for comparison | 26.8 ms a day with the full state hash included |
| Plan drafting on the Union graph (the spike's `draft`; 27 commands that hold force blocks at the start, 19 with a land force, each asked to take the other side's capital) | one draft: median 8 to 9 ms for a land command (range 5 to 11 ms), 0.2 ms for a squadron or yard (no candidate); at most 10 route searches; slowest single draft 24 to 47 ms in noisy runs. **A day of all 27 back to back: median 108 to 138 ms, p95 150 to 160 ms, worst 168 to 174 ms** over three runs of 20 days. Every land command got a candidate and every score was the exact sum of its terms |

## The daily drafting cap (0062)

**Recommend a starting cap of 3 drafts a day**, a pack rule (0062), oldest request first, the rest waiting for the next day.

- One land draft costs about 9 ms (median), against about 15 ms for the day's requests, seats and tick. Three drafts bring a day to about 42 ms, at the 40 ms budget; two to about 33 ms.
- Uncapped, the worst day (all 27 commands asking at once) is about 170 ms, four times the budget, so a cap is needed. A cap of 3 bounds the extra cost at about 27 ms typical and 60 ms when one draft is slow (the noisy maximum of 24 to 47 ms).
- The budget is an average over a campaign (a minute for 1,460 days), and drafting happens only on days a goal is set or edited, not every day, so a cap of 3 leaves the campaign average well inside it. If the Phase 1 planner's edits (rescoring, five edit kinds) cost more per request than a draft, lower the cap rather than the budget.
- These are the spike's costs on the real graph with the machine busy; the kernel planner should be re-measured on CI hardware before the cap is fixed.


## For Phase 1

- **Values arrive: move four bands.** Relay objections and holds, filter holds and trims are banded at exactly zero. The gate fails the day the people recast gives them values, which is the point; move the bands then, with the numbers the Union run shows.
- **The March 1861 situations must set the war flag.** The pack names `war_begun` for both factions; a situation's effects set it, and the gate opens the principal's campaign the next morning. `pack:validate` warns `war-flag-unset` until one does. When it does, the Union reference run no longer needs `--at-war`; keep the labelled option for mechanics runs.
- **A history run's checkpoint scores** (section 11) replace Phase 0's counts of named things.
- **The planner's terms over edits** (above), and the drafting cap as a pack rule with the value below.
- **Calibrate the tick budget on CI hardware.** The budget bound (median 40 ms, p95 160 ms) is wide for noise; if a CI run flakes on it, raise the p95 factor; do not skip the criterion.
- **The Union war goes static.** In the 1,460-day run no force marches after about day 120. Standing goals are stand-ins; plans replace them.
- **Resume in the Monte Carlo case**: `hashEvery` is in the session loop, so a run can hash at checkpoints only; normal play leaves `freeze` off.

## Findings outside my scope

1. **Lane worktrees resolve `@mandate/*` to the main checkout.** A worktree has its own `node_modules` folder but no `@mandate` links, so Node walks up to the main repository's `node_modules/@mandate`, whose junctions point at main's `packages/`. In a worktree, `cli`, `rule-seats` and `pack-format` therefore run against main's kernel, not the worktree's (I found it when my kernel change did not take effect; typecheck then reported two copies of the planner spike's types). Kernel tests that import by relative path are unaffected, and CI (a fresh checkout) is unaffected. I made the four junctions in this worktree's `node_modules/@mandate` (ignored by git). Lanes that changed the kernel and ran `cli` or `rule-seats` tests in a worktree may have tested main's kernel; the steward's after-rebase check on a clean checkout covers it. **Now a check (hard rule 7, the lead's ruling):** `tools/workspace-links.ts` does what Node does (the nearest `node_modules/@mandate/<name>` going up from the root) and `tools/test/workspace-links.test.ts` fails when any workspace package resolves outside the checkout under test. I confirmed it fails in this worktree with its links removed, and passes with them; its controls plant a nested worktree with no links, a link to another root and a missing link, in temporary folders. A new worktree needs `New-Item -ItemType Junction` for each of the four packages under `node_modules\@mandate` (or `npm install`).
2. **`seats.defaulted` had no kernel test that drives it.** Lane 0.6's note says each of its four quiet mechanics "has its own test"; for `seats.defaulted` I found none (the kernel's reference game lists it as dead). The silent-commanders exercise run now fires it (1 time in 120 days) and the gate bands it, so it is driven somewhere; a kernel unit test would be better.
3. **`docs/design/FOUNDATION.md` section 9** says the tick runs in under about 40 ms and the hash runs every tick in tests and CI. The Union tick is about 15 ms with seats and requests; the full hash adds roughly 10 ms (lane 0.5: 26.8 ms with it). Fine today; the hash grows with State.
4. **`CLAUDE.md` commands** gain `npm run run:phase0` and `npm run run:done-check`; the steward syncs factual pointers.
5. **`run:seats` on union-1861 is now a peace run** under the war gate (it plays 75 quiet days). CI still runs it; the done check is the war run. Remove the Union `run:seats` step if it is not wanted.
6. **A static Union map after day 120** (see Phase 1): informational.
7. `tools/test/staged-check.test.ts` timed out at the 5 s default under load: fixed by the global timeout (choice 15).
