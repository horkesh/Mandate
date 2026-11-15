# Phase 0 close-out lane

The lane 0072 names: the exit review's items 1–6 (`review-phase0-exit.md`, sections 3 and 5), one commit each, on `phase0-close-out` from 524bf48. Opus, high. Each item has a positive control: a test that fails on the code before the fix.

| Item | Commit | What |
|---|---|---|
| 1. The crash (S1) | 9142516 | a post whose government joins a side gets a hold goal |
| 2. The contest record (S2c) | 94df5c2 | a stalemate records no gain; the Union bands re-set |
| 3. Labels (S2b, S2d) | 417f354 | the generic principal and the objective marked STAND-IN; the Union PASS line |
| 4. Hidden kernel defaults (S3) | f6ba7de | latency, report templates and the standing numbers become `WorldRules` |
| 5. Canon's promises (S4) | 468e574 | fortification and ranks become State; reserved rows; pockets to `supply`; the verb-list test |
| 6. Small fixes | dccfc92 | scores from State's sides, the seatless menu (P2), unknown departments (P4), a comment |

## 1. The crash (S1)

`plans` owns goals, so `command`'s side change can't write them. The tick has a new phase 4d, right after `command`'s proposals: `holdGoalsForNewFieldPosts` (in `plans/standing.ts`) gives every field post on a side without a goal a hold goal, from that day. The start does the same for every field post. `receiveOrder` reads a missing goal as "holding since day 0 on no order", so it never throws. `OWNED_FIELDS` names "a government joining a side" among `plans`' proposers.

- **Control:** `department-sides.test.ts`, from the fixture. `neutral_gov` joins `a` on day 2. `n_guard` becomes commandable and gets a hold goal from day 2. The order sent on day 4 is obeyed, and the guard marches to a2 and holds it. With phase 4d disabled the test fails.
- **Rejected:**
  - `command` writing the goal inside `changeDepartmentSide`: it breaks one writer per field.
  - Only the `receiveOrder` fallback: it leaves a commandable post on a side with no goal. The view's `goal` and the `goal` condition would then read nothing for a post the principal can order.
  - A typed proposal from `command` to `plans`: nothing proposes to `plans` yet. Running the step on today's field posts covers every way a post can become one (a side change now; appointments and transfers once the tick calls them), without a new channel.

## 2. The contest record (S2c), and the bands

- `combat/contest.ts` now has a third kind of record. Where the stronger side already holds 1000‰, the record is a `stalemate`: gainer null, delta 0.
- A contest's gain is capped at what is left to take, so a record never claims more than `control` applies. The cap is what `control` did anyway, so State and every hash were unchanged by this commit.
- A stalemate fires no `combat.contest`. It is still a map event, and its region still counts for retreats: a weaker side below the threshold is driven out where it can go.

**Rejected:**
- Recording the stalemate as a tie (a `contest` record firing `combat.contest` at 0). The count stays 62 and the band still pins the deadlock.
- No record at all. The stand-off becomes unexplained (hard rule 6).
- Dropping retreats in a stalemate. An attacker who marches into ground the enemy wholly holds would never be thrown back.

**The Union bands, reset:**

| Mechanic | Before | After | Why |
|---|---|---|---|
| `combat.contest` | `around(62)` | `around(7)` (3 to 14) | The live contest at Washington, days 14 to 20. From day 20 the attacker holds all of it, and the 56 later firings were a frozen stand-off. |
| `combat.retreat_blocked` | `around(57)` | `notHere`, and in `QUIET` with its driving kernel test (`contest.test.ts`, "stays put with nowhere to go") | Every firing is the 600 regulars left at 0‰ in Washington from day 19, with Maryland's neutral ground behind them. It is not a live mechanic. |

Why `retreat_blocked` is not banded:
- `around(57)` would pin the deadlock.
- `minFires: 1` would fail the day a better principal keeps Washington, the same backwards failure the review named.
- No reference run exercises it live, so the gate's rule for such mechanics applies: a quiet reason and a named kernel test. `QUIET`'s comment now says one of its entries fires only from a stand-off.

The testbed's bands are unchanged: its 14 contests include no stalemate. Its `retreat_blocked` reason no longer says "the Union run fires it". The war-gate exercise run still bands `combat.contest` quiet.

## 3. Labels (S2b, S2d)

- `rule-seats/src/index.ts`: the generic rule-seat principal is marked STAND-IN (0072). The label says what it does and names its replacement: Phase 1's rule-seat principals, who must do their historical jobs for the Phase 1 history run (FOUNDATION section 11).
- `seats/world.ts`: "a faction's objective is the other's capital" is a LABELLED STAND-IN (0058).
- `done-check.ts`: a run started at war by the labelled option says, on the behaviour PASS line, "(a mechanics run on stand-in principals: its outcome is not a war, 0072)". A test pins the text on the Union line and keeps it off the testbed's.

## 4. Hidden kernel defaults (S3)

`WorldRules` gains three groups, each stated by every pack, with no kernel default:
- `latency`: wireDays, mailPermille, specialMessengerPermille, courierNoiseMaxDays, specialMessengerPrice;
- `reportTemplates`: 16 rows, one per report type and subtype;
- `standing`: conflictWindowDays, scoreCap.

`DEFAULT_LATENCY_RULES`, `DEFAULT_REPORT_TEMPLATES`, `DEFAULT_SEATS_RULES`, `CONFLICT_WINDOW_DAYS` and `SCORE_CAP` are gone. The seats World reads latency and templates from the World it indexes, and `SeatsWorldOptions.rules` became `traitRules`. The trait rules stay the labelled stand-in (0058) and did not move.

**Checks:**
- `templateProblems` now also refuses a report kind with no template, a template for a kind the kernel does not write, and an unknown route (`REPORT_KINDS`).
- `indexSeatsWorld` checks the templates, the latency rules and the standing rules of any World it is handed.
- The pack validator runs the same template rule (`rules-templates`). The Zod schema states the ranges, the published JSON Schemas are regenerated, and the situations validator checks a notice's report against the pack's own templates.

**Packs:** both state today's values, and their `data/world.json` is regenerated. Both READMEs list the values as design parameters; the templates cite the Union information-flows note ("Design implications").

**Controls:**
- eleven validator cases;
- kernel tests showing that each rule changes the outcome: special messenger and mail days, the conflict window (a two-day window turns the conflict into a plain obey), the score cap, a template's route;
- a World missing a template is refused at indexing.

**Rejected:**
- Keeping a `rules` override on the seats World: it would be a second source beside the World.
- Mapping pack keys to the kernel's (`type` to `templateType`): it adds a translation layer. The pack uses the kernel's names, as every other rule group does.
- Wrapping the templates in a `reports` object: nothing else belongs in it yet.

## 5. Canon's promises (S4)

**Fortification** is State owned by `regions` (`regions/regions.ts`, `State.regionFortification`), copied at setup in region order.
- It refuses a region not in the World, water, a duplicate, and a level off the permille scale.
- Nothing writes it in Phase 0.
- The testbed's four rows arrive, tested from disk: mere_crossing 600, island_fort 800, salient_base 300, n_capital 400.

**Ranks** are State owned by `people` (`people/ranks.ts`, `State.personRanks`, record `PersonRank`, declared in `IMMUTABLE_RECORDS`): each person's rank at the start date, and the date he has held it from.
- A date given only to the month or the year counts from its last possible day, so a rank is never claimed before its source certainly gives it.
- Rejected: counting such a date from its first day, which claims a March 1861 commission on 5 March from a source that says only "1861".

**Reserved rows.** `OWNED_FIELDS` gains section 10's rows for the Congress accountability ledger (`politics`) and for people who have reached Union lines (`regions`, proposed by the derived self-emancipation term, never a lever). They have no code, the form the table already uses for unbuilt fields.

**Pockets.** `KERNEL_MODULES` gives pockets to `supply`, and both entries now say what section 10's module map says (0054).

**The verb-list test** (`command-kinds.test.ts`) pins Phase 0's commands:
- the list is exactly choose, decide, delegate and order;
- the union type equals the list at compile time;
- the log refuses move, march and attack, and an order that names a force;
- the tick branches on each kind.

## 6. Small fixes

- `phase0-scores.ts` reads a block's side from State (`departmentSide`, 0065). The control turns a department's side in State, and its men move with it.
- **P2:** a seatless post's typical days are to where its headquarters stood at the start (`SeatsWorld.startHeadquarters`, indexed from the start's blocks by `headquartersOf`'s rule), or else the side's capital, never where it is today. The control moves the block, and the days stay the start's. Rejected: building a start State for each menu, which costs too much for one lookup.
- **P4:** a start post whose department is not in the World is a `SeatsWorldError` naming it. A neutral government's post now carries `null`, not `''`.
- The `headquartersAt` comment says headquarters are derived (0064).

## What moved

| Commit | Save fixture (`testbed-seats-day40.json`) | Done-check final hashes (Union, testbed) |
|---|---|---|
| 1 to 3 | nothing | unchanged: a652d5129f954a54, 03ddcb69b659ef86 |
| 4 | `worldHash` only (b529fd07… to c63fe55b…): the World gained the rules | unchanged |
| 5 | `state` gains `personRanks` and `regionFortification`, so `stateHash` moves; `log`, `logHash` and `worldHash` are unchanged | 1fbdd2b89ef7e7ef, ac7ebe71f2e7e038 |
| 6 | nothing | unchanged from 5 |

Liveness counts are unchanged except `combat.contest` on the Union run (62 to 7, item 2).

- `npm run check`: 77 files, 929 tests, green.
- The done check passes all six criteria.

## Findings outside my scope

- **The one-writer scanner doesn't follow non-object type aliases.** A record reachable from `State` only through `type X = Readonly<Record<K, R>>` is not found unless its name ends in `State`: my `RankTable` alias hid `PersonRank`. I typed the root field inline, as `seatAssignments` is, rather than change the scanner. This may be the review's "alias gap".
- **No save schema bump.** The new State fields go in without one, as earlier Phase 0 lanes did, since no save has shipped. A save from before this branch decodes without the two fields. It's the lead's call whether that needs a migration rule before Phase 1.
- The Union README's research pointer and the testbed's both point at the Union note. The testbed is fictional and only borrows the values.
- The 744 `pack:validate` warnings on union-1861 were there before this branch (unknown values).
