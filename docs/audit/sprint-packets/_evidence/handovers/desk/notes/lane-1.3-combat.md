# Lane 1.3: combat, the battle model

Lane 1.3 is FOUNDATION section 12's row 1.3 (decision 0073), on 1A's critical path. It replaces Phase 0's simple contest
(0064, `combat/contest.ts`, now deleted) with the combat note's model (`docs/research/2026-11-14-combat-model.md`), under
R4's battle ruling as 0074 records it. Branch `claude/phase1-combat-3ba74b`, with main merged in after 0074.

## R95: support band after Sumter's record (2026-11-20)

This is the current hand-over for `phase1-bombard-record` at `3cbf71e`, with R91 still uncommitted.
Handled R95 only, under the lead's ruling in the main checkout's CODEX.md. Git was read-only.

**One band recentred.** In `packages/cli/src/liveness-gate.ts`, Union `politics.support` changes from
`around(16)` (8..32) to `around(49)` (24..98). The existing `around()` function is unchanged. The band's `why`
records the cause: R91 gives Sumter's bombardment a battle record, so its closing report reaches the editors and
their front pages move bloc support. The old centre came from the run with no battle record. The fresh run still
fires support 49 times. No other band is out of range; none was changed. The full eight-row comparison, including
report, message and pruning effects, remains in R91's table below and `runs/r91/band-comparison.json`.
The immutable loss reduction in `combat/bombard.ts` and every other R91 implementation file are byte-identical
to the delivered R91 versions. No production parameter changed. Proposed rulings: none beyond the lead's ruling.

**Verification.** Local dependency links resolve to this worktree. The retained history reproduces the single old
band failure, then passes every band with the new centre; the table is sound. Fresh affected checks pass **45 tests
in three files**. Exact **`MANDATE_NO_GIT=1 npm run check` exits 0**, **129 files / 1,476 passed / three existing
optional timing skips**, in **130.80 s**. Typecheck, boundary, licences and decision index all pass. The full suite
also verifies `one-writer.test.ts`; the focused command's `ownership.test.ts` filter named no file.

**One full done check.** `npm run run:done-check -- --label r95-done` exits **0** in **1,116.86 s**, with normal
eight seeds and drafting: **Phase 0 6/6; 1A 3/6**. Its default reports 1A without making it binding; those three
failures remain unmet. Liveness and operation pass. Local tick costs (median / p95, ms):

| Run | Median | p95 |
|---|---:|---:|
| Union reference, 148 days, war by decision | 28.34 | 45.62 |
| Testbed, 120 days | 2.68 | 3.63 |
| Union history to 31 July, 148 days | 26.48 | 42.05 |

These are loaded-host measurements, inside the unchanged 40/160 limits. Linux CI decides the budget; no CI or
causal performance claim is made. Drafting is sound: all-command day median/p95 27.5/33.4 ms, capped worst 18.5 ms.
No expensive retry or additional campaign ran.

All **148 Union / 120 testbed daily hashes**, daily telemetry and liveness counts match R91. Replay, mid-run
save/resume and saved-log replay pass; zero rejections. Union final State remains
`28183d6d1984e906e3a6ded545195924f1eb294cab4dc052b21c2e9dd29f0c85`.
Reuse R91's unchanged detailed history and loss/operation comparison; the fresh full check covers its regressions.

**Evidence and preservation.** `runs/r95/final-checks.json` indexes commands, exits, all twelve criteria, all ten
remaining 1A problems, timings, checked summaries, saves and drafting. Raw logs: `runs/r95/check.log` and
`runs/r95/done-check.log`. Runtime diagnostics and artifact hashes were settled before this hand-over update.
All **561 runtime inputs**, including **198 pack files**, match the done-check manifest. Relative to R91, only
the liveness table differs. Signed material, generated Worlds, fixture saves, lockfiles and checkpoint bounds are
preserved. All five captured own-worktree Git metadata files are unchanged. R95 edits only the liveness table
and this hand-over; Claude's independent review remains pending under 0096.

**For the lead.** Review R91/R95 and route the Linux timing result through CI. Retain the existing criterion owners:
checkpoints still fail on Missouri neutral, western Virginia's checkpoint reference, Confederate men 20,957 and
Union fought operations zero. Pushback still fails on relay holds 1, filter holds zero, trims zero and reservations
44. The sweep retains its unmeasured grievance channel and the 24 moves without a border levy; D6 clearance stays
parked under 0105. The other requests' changes were not imported into this worktree.

**Findings outside my scope (R95).** The three failed 1A categories above remain with their existing owners.
The support mismatch is resolved by the lead's recentering ruling. No new finding.

## R91: bombardment battle records (2026-11-20; original delivery evidence)

Implemented R91 only in `C:/Pyrrhic/mandate-bombard-record`, branch `phase1-bombard-record`, retaining HEAD
`3cbf71e`. Read the main checkout's CODEX standing, command-line and writing rules, 0096 and 0105.
`npm ci` ran first (exit 0, 51 packages added, zero vulnerabilities). Git was read-only. The earlier lane report
below remains as historical context; R95 above is the current hand-over.

**Built.** `combat/bombard.ts` turns the existing `FortDay` into ordinary `BattleRecordChange` proposals;
`tick/bombard.ts` applies them through `applyBattleRecords` before forces and evacuation remove any inputs.
Killed, wounded, captured and captured stragglers come from the actual force proposals. The record retains the
bombardment's own K+W term and its morale terms, with a clamp contribution when needed. No second loss calculation
or land-combat resolution runs. Consecutive fire days share a record, the attacking post supplies its cause, and
surrender or the existing maximum closes it. The later field-combat phase leaves today's open bombardment alone.
The existing battle pruner and save envelope carry the record; no new State field, save version or pack rule.

**Choices for the lead's review.** Record the day as `bombard`, with zero land contact and draws. The daily model has
no hourly distribution, so `dayShape` supplies no invented phases; the existing bombardment dispatch still reports
the opening. This rejects labelling fire as an assault or supplying new phase weights. The attacking participants
are the known, positive-strength gun-arm blocks that actually supplied fire to `fortDay`; non-firing support is not
listed as a firing force. Unknown defenders under fire remain listed and count as none, under 0076. This rejects
guessing strengths or treating every supporting block as a firing battery. Normal casualty returns, governor wires
and closing-result press reports read the new record.

**Testbed and opening.** The first regression run failed four assertions because no record existed. Final focused
checks pass 100 tests across bombardment, combat, operations, determinism and the sourced opening. Five added kernel
tests cover consecutive days and closure, real nonzero losses and captured stragglers with summing parts, firing
participants, unknown defenders, and an open-record save/resume. The lifecycle test also verifies zero-loss evacuation,
the verdict, closed-record save round-trip and both sides of the pruning boundary.

**History, 148 days to 31 July, no `--at-war`.** One Confederate planned operation fought, up from zero, inside its
unchanged 1..4 checkpoint band: `op:cs_cmd_charleston:38` caused `battle:fort_sumter:38`. Its two fire days are 12 and
13 April (days 38 and 39), closing on 39. Both sides' losses are zero and every K+W breakdown sums; no firing strength
is unknown. The operation criterion now passes. The Union count remains zero against 1..26. Known men remain Union
18,686 (95,000..250,000, non-binding floor) and Confederate 20,957 (100,000..200,000, failed). Government and strength
snapshots are byte-equivalent to the baseline comparison. The first 37 daily hashes match the baseline. Replay and
day-60 resume match with zero rejections; all 148 daily hashes also match the full done check's checked run.
Final hash: `28183d6d1984e906e3a6ded545195924f1eb294cab4dc052b21c2e9dd29f0c85`.

Every changed mechanic is below. No numeric band or production parameter was changed. Counts are fires; the last
column gives magnitude where it differs from the fire count.

| Mechanic | Before | After | Magnitude before to after / cause |
|---|---:|---:|---|
| `reports.casualty_return` | 0 | 8 | First and full returns from the two recorded fire days |
| `reports.governor_wire` | 0 | 2 | The normal daily battle wire |
| `messages.sent` | 11,164 | 11,176 | The returns, governor wires and closing-result papers |
| `messages.delivered` | 10,516 | 10,528 | Those added reports arrive |
| `messages.courier_delay` | 66 | 67 | One added return's ordinary courier delay |
| `knowledge.pruned_age` | 96 | 96 | 1,261 to 1,267; extra report contents |
| `knowledge.pruned_superseded` | 146 | 146 | 8,855 to 8,861; extra report contents |
| `politics.support` | 16 | 49 | Closing-battle press effects now fire; **fails unchanged 8..32** |

The Confederate fought-operation checkpoint changes from failed to passed. The remaining checkpoint and pushback
values are unchanged. Detailed comparison: `runs/r91/band-comparison.json`.

**Required checks and retained failures.** Exact `MANDATE_NO_GIT=1 npm run check` exits 1: 129 files, 1,472 passed,
four failed, three existing timing skips. One failure identified five writes to immutable `BlockLoss` keys in a local
accumulator. Replaced that construction with an immutable reduction, retaining the arithmetic. The complete ownership
and bombardment suites then pass 73 tests. The other three failures all assert the same unchanged support band.
The full suite was not repeated or represented as exit 0; its unaffected passes are reused. Final typecheck,
boundary, licences and decision index each exit 0. The full done check uses the corrected code; its 148 matching
history hashes also verify that the construction correction preserves the run.

`npm run run:done-check -- --label r91-done` exits 1, with the full eight seeds and drafting measurement:
**Phase 0 4/6; 1A 3/6.** Phase 0 fails liveness (support 49 above 32) and budget. Checked/history Union medians and p95s
are **46.21/71.94** and **40.28/63.70 ms**, against unchanged **40/160** limits. Testbed is **4.28/5.97 ms**. No unloaded
or CI claim. 1A passes operation, unknown strength and stand-ins; checkpoints, pushback and lever sweep remain failed.
At this base the retained checkpoint failures are Missouri neutral, western Virginia's checkpoint reference,
Confederate men and Union operations. Pushback retains relay holds 1, filter holds 0, trims 0 and reservations 44.
The sweep weighs eight decisions, makes 248 base-run calls, and finds return best in 2/8 seeds. Its grievance channel
is unmeasured and all 24 policy moves lack a new border levy; this supplies no D6 clearance under 0105. No expensive
gate was retried.

**Evidence and preservation.** `runs/r91/final-checks.json` indexes the commands, exits, history, full run artifacts
and input hashes; the full raw log is `runs/r91/done-check.log`. The standalone history is
`runs/r91/history-after.json`, with baseline and comparison alongside it. All 561 recorded runtime inputs match the
full-run manifest, including 198 unchanged pack files. Runtime checks and the seven-file implementation inventory
were completed before this documentation update. The delivery adds the existing FOUNDATION ownership-row update and
this hand-over. No pack data, band, signature, generated World, fixture save or lockfile changed. The five captured
worktree Git metadata files, including HEAD and index, are byte-identical. Claude's standing review remains pending
under 0096.

**Findings outside my scope (R91).** The new `politics.support` liveness failure needs the lead and 1.14's integrated
calibration ruling before acceptance; its old limit was preserved. The two measured tick medians also remain unmet.
Route the unchanged checkpoint, raising, Union-operation and pushback gaps to their existing owners; D6 clearance
stays parked under 0105, with the recruitment chain continuing there. The old pruning finding below was resolved by
lane 1.4; R91 uses that existing owner and policy. No other request was undertaken.

## What is built, and where

| Piece | Where |
|---|---|
| The pack's combat rules and their check (`combatRulesProblems`, run by the kernel at indexing and by the validator) | `kernel/src/combat/rules.ts` |
| One battle-day, pure: contact, losses with additive typed terms and an exact breakdown, the flank, morale and the rout, the night's stand, cut off and surrender, missing and captured, per-block apportionment, six fixed draws; the commanders hit on their own stream | `kernel/src/combat/resolve.ts` |
| The commanders' decisions, pure, from traits and what they see: commit at dawn, stand or withdraw at night, break out or surrender, pursue | `kernel/src/combat/decide.ts` |
| The battle phase in the tick: presence, which battle and type, the proposals to each owner, occupation, opening and closing records | `kernel/src/combat/battle.ts`, `tick/forces.ts` (`combatPhase`) |
| Battle records (State `battleRecords`, writer `combat`) | `kernel/src/combat/records.ts` |
| The day shape (four phases with hours, each list summing exactly) and the battle's verdict, derived on read | `kernel/src/combat/shape.ts` |
| Morale, experience, equipment, stragglers, the rout day and the surrender day on each block; the `battle_losses`, `condition` and `stragglers_returned` deltas | `kernel/src/forces/forces.ts` |
| Stragglers rejoin, in supply and out of battle | `kernel/src/forces/stragglers.ts`, in `storesPhase` (4a) |
| A post vacated by a hit commander; a surrendered block released | `command/command.ts` (`applyCombatCommand`) |
| Nothing moves a person out of `captured` or `killed` | `people/people.ts` (`FINAL_STATUSES`) |
| `WorldRules.combat`, and `contest` renamed `occupation` (its `contestPermille` dropped) | `world/world.ts`, `pack-format/src/schemas.ts`, `validate.ts`, both `pack.json`, both READMEs, the published schemas |
| Livermore's tables as a harness of named set-ups | `packs/union-1861/test/livermore.test.ts`, `test/livermore/livermore-1900.csv` and its README |
| Kernel tests | `kernel/test/combat.test.ts` (25), `pack-rules.test.ts` |

**The phase.** Phase 3b is now combat. Each owner applies combat's proposals in that phase: `forces` the losses and
condition, `combat` its records, `movement` the retreats, `people` a commander's status, `command` his post's vacancy and
a surrendered block's release. Control deltas go to the map phase, as the contest's did.

**The streams.** `combat/<battle>/<day>` draws six values a battle-day in a fixed order (per side: two summed for the loss
noise, one for the flank). `combat/<battle>/<day>/leaders` draws two, one per side. Nothing else draws, so reading a
record never shifts a later draw. A kernel test shows the stream's state after a fight, a day with no contact and a
surrender is the same as after exactly six draws.

**The record.** Every battle-day keeps both sides' base rate, terms, multiplier, K+W and its breakdown, killed, wounded,
missing and captured (each with its parts), the flank draw and threshold with terms, morale before and after with terms,
the commanders' decision terms, the result, the cut-off choice, the retreat, the pursuit choice, the per-block losses, the
leaders' draw and hit, and **the blocks with unknown strength, listed in every record** (empty when none). A test asserts
that every number equals the sum of its typed parts.

## Done

- `npm run check` passes: 987 tests, boundary, licences, decisions index (after merging main at 0074).
- `npm run run:done-check` passes all six criteria. Criterion 1 now reads battles and occupation.
- The Livermore harness passes inside the note's bands (targets 1–4 and a half-to-twice band over the set-ups).
- Kernel tests on fictional ground show, each with typed reasons: an assault on works; a rout without deaths (its dead are
  the day's hits; the rout's missing straggle and rejoin); a cut-off force destroyed (a failed breakout); a trapped
  garrison's surrender; a general wounded and his post left vacant; a capture on the field and in a surrender; and a
  record whose breakdowns sum.
- The contest is gone: `combat/contest.ts`, its test and its mechanics. Lane 0.5's pocket case is ported to occupation
  and battle (`combat.test.ts`, "a raid occupies b2").
- In the Union reference run the 600 regulars in Washington, attacked with nowhere to go, now surrender (`OPEN_QUESTIONS`'
  trapped garrison).

## Choices made within the brief (for a decision record; the lead may overturn them)

1. **Contact is the lesser side's engaged men, and both sides' losses come from it** (P3). *Rejected:* each side's losses
   from its own engaged men (Lanchester by another name; the bigger army wins by numbers).
2. **Only a side whose blocks marched in may attack** (0064's rule, kept). A garrison the start placed defends but never
   attacks. *Rejected:* every side may attack (the Texas case 0064 rejected comes back).
3. **The commander of a side in a region** is the holder of the post whose blocks there are strongest, while he serves; a
   vacant post's force is led by the pack's unknown man (`people.shadow.unknownCentre`). *Rejected:* the senior officer by
   rank (seniority needs lane 1.5's lists).
4. **What he sees in contact** is the enemy's known men present inflated by his own perception bias (`perceived`, the
   formula beliefs use), never his reports, which lag days behind a fight he is in. *Rejected:* reading his seat's latest
   enemy-strength claim (on the day of battle it is stale).
5. **His decisions are pure functions of his traits**, set as pack shares of his own demand ratio: attack at it, probe at
   `probeShare`, withdraw below `holdShare`, break out at `breakoutShare`, pursue by boldness. They are not seat requests
   yet (see item 8 for the lead).
6. **An unknown strength fights as none** (0064). A side of only unknown blocks has no contact, sees odds of nought,
   and withdraws, or surrenders if cut off. *Rejected:* a default strength.
7. **The missing split two ways**: a pack share by result is captured on the field; the rest straggle and rejoin. A
   force taken in a pocket (surrendered, or destroyed in a failed breakout) has all its men captured: those left, the
   day's missing, and the stragglers in the pocket. The record keeps killed, wounded, missing and captured
   apart (0074). *Rejected:* captured only in pursuit (lane 1.4's), which would leave a rout capturing no one.
8. **A surrendered block stays in State, spent**: strength 0, `fbSurrenderedDay` set, released from its post, never present
   again. *Rejected:* deleting it across three owners from combat (lane 1.7's `disband` delta is the place).
9. **Control in battle** goes to the side left holding the field, the pack's `fieldControlPermille`, the day the other
   leaves; none while both stand. Occupation is kept unchanged. *Rejected:* control by margin while both stand (that is
   the contest).
10. **Breakout** is fought the next day at the assault rates, all-out; if the force still wants out and cannot get out,
    it is destroyed, recorded as `cutOff: 'destroyed'` with its own counter (`combat.destroyed`), never as his surrender.
    **A routed force in a pocket still has its commander's choice** (0074: surrender is his own act).
11. **Commanders hit**: one draw per side per battle-day; killed, wounded, or captured only if his side routed; captured
    if his force surrendered. Each vacates his post. `people` refuses any status change out of `captured` or `killed`.
    Wounded men do not return to duty yet.
12. **No battle on neutral ground nobody holds** (0055, extended from the contest to battles).
13. **Starting morale, experience and equipment** are pack rules, the same for every block. *Rejected:* scenario columns
    now (no sourced data; 1B can add them).
14. **The day shape and the verdict are derived**, never stored (hard rule 5). The flank break falls in the phase its
    draw gives; a surrender and a departure fall in the evening.
15. **Rearguard**: the defender fell back into this region from this attacker yesterday. **Surprise**: in a meeting, a
    commander who holds no enemy-strength report for the region (or a vacant post) is surprised.
16. **The Livermore harness lives in the Union pack** (setting names may not appear under `packages/`), runs its combat
    rules, and asserts the note's bands over the set-ups, never one battle. Each set-up's type, commit and ground are the
    model's choices, stated in its README.

## The liveness gate, re-banded

From the new reference runs (mechanics that change something):
- **Union at war, 75 days:** one battle, at Washington: the attacker's assault, the garrison cut off and surrendering,
  its commander captured. `battle_day`, `battle_opened`, `battle_closed`, `cut_off`, `surrendered`, `withdrew`,
  `captured`, `general_hit` at around(1); `killed_wounded` and `missing` around(2); `occupation` around(40); `control.changed`
  around(41); `forces.stragglers_returned` around(5); `knowledge.pruned_age` around(6). The stalled band for the trapped
  garrison is gone, since a battle ends the stand-off.
- **Testbed, 120 days:** two one-day battles, each defender withdrawing: `battle_*` around(2), `killed_wounded` and
  `missing` around(4), `pursuit_chosen` and `general_hit` around(1), `occupation` around(20), `stores_fell` around(24),
  `stragglers_returned` around(102).
- **Quiet, each with a driving kernel test:** `combat.breakout`, `combat.destroyed`, `combat.flank_broken`, `combat.routed` (too few
  battle-days in either run), and `map.pocket_closed` (with no contest, neither run cuts a line).
- The kernel's 60-day seats reference game no longer fires `seats.choices`: its one battle ends with both sides holding,
  so no menu changes. Both gate runs fire it.

## After the standing review (`review-lane-1.3.md`)

- **S1:** a rout's drop to the floor is a `rout_floor` term, so routed morale sums like any other; the test's exemption is gone.
- **S2:** a test routs a force in a pocket whose commander believes he can fight free, and asserts `break_out`; its control, outnumbered six to one, surrenders by his choice.
- **S3:** a failed breakout is `destroyed`, with its captured part named so, its own evening flag in the day shape, and the `combat.destroyed` counter (quiet in both runs, driven by the breakout test).
- **N1:** a control that the leaders' stream draws two values with no commander on either side. **N2:** a set-up that reaches the multiplier's clamp and morale's. **N3:** Bull Run is in target 2's set; its sides are not all in contact, so the band does not apply to them. **N4:** a force taken captures the day's missing with the rest; a control that `stragglersStep` skips a surrendered block.
- Cleanups: the three stale contest comments, and the source scans match either quote style.

## Findings for later lanes

- **1.4 (operations, reports, dispatches):** `dayShape(rules, day)` gives each battle-day's phases with hours and each
  side's losses per phase; `bsidePursue` is each commander's pursue choice; `battleVerdict` the field and damage. The tick
  emits a `battle` map event per battle-day with the whole record. The pursuit (stragglers to captured) is yours to run.
  A battle report as a decision point is also yours.
- **1.10 and 1.14 (unknown strength):** every record lists unknown-strength blocks in `bsideUnknown`; the criterion reads it.
- **1.12 (commander seats):** commit, stand, cut off and pursuit are rule functions in `decide.ts`; a seat menu could offer
  the same choices.
- **1.5 (people's verbs):** wounded generals stay `wounded`; a return to duty and the appointment to a vacated post are
  yours.
- **1.7 (men):** a surrendered block is spent but stays in State; your `disband` delta could remove it.

## For the lead

1. **A decision record** for the battle model's choices above (items 1–16), or a ruling on any you would change.
2. **FOUNDATION section 10:** the Phase 0 phase-order line still says "the control contest and occupation (3b)"; it is
   now "combat: battles and occupation (3b)", with stragglers rejoining in 4a. Two `command` rows gain combat as a proposer
   (a hit commander's vacancy; a surrendered block's release); `OWNED_FIELDS` already says so.
3. **The pack format changed:** `WorldRules.contest` is now `occupation` (without `contestPermille`), and `combat` is new.
   0064 could carry an "amended by" note for its contest numbers.
4. **`OPEN_QUESTIONS`, for the steward:** the trapped-garrison item (Phase 1, first bullet) is closed by this lane; the
   unknown-strength item continues with 1.10 and 1.14; the combat-note bullet is built.
5. **R4 per 0074:** the model matches the ruling. One change for it: a routed force in a pocket surrenders only by its
   commander's choice, not automatically.
6. **Calibration for 1.14:** the harness's weakest set-up is Fort Wagner (model 62 against Livermore's 213 per 1000 for
   the attacker). Contact as the lesser side's men understates an assault on a small garrison; a fix would make an
   attacker's losses in an assault scale with the defenders' fire. The bands still pass.
7. **Fortification is read, never written:** P9's works +1 overnight and works lost when stormed have no applier in
   `regions`. Lane 1.4's works phase is the natural home.
8. **Decisions are not seat requests** (item 5): fine for rule seats, but an AI seat cannot take them (0022). Lane 1.12.

## Findings outside my scope

- `battleRecords` grows with every battle-day, as `orderResponses` does with every hop; neither has a pruning rule.
- `seats.choices` has no kernel unit test; only the gate's runs fire it now.
- The arms vocabulary has no cavalry flag, so the pursuit choice cannot ask for cavalry (P6.3).
- No weather term (the `weather` module is reserved) and no supply term in quality.
