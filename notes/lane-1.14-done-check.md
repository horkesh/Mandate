# Lane 1.14, Part A: the 1A done check's harness

Branch `phase1-done-check-1a`, from main at a38d7ea. It builds FOUNDATION section 12's row 1.14, Part A: the harness that scores 1A's done check. Part B, the calibration runs, waits for lanes 1.11 and 1.12. `run:done-check` now reports 1A's six criteria beside Phase 0's six. Each is PASS or FAIL, with its reasons.

## What is in place

| Piece | Where |
|---|---|
| The pack's bands, read from the numbers note with a citation each: 16 checkpoints, 7 pushback bands and the victory weights | `packs/union-1861/checkpoints.json` |
| Their schema and validator. Every department, region and faction is checked against the World, dates are checked against the start, and upside-down bands are refused. The file is optional, loaded by `loadPack` and published as JSON Schema | `packages/pack-format/src/checkpoints.ts`, `schemas/checkpoints.schema.json` |
| The history run: start to the last checkpoint date, with the pack's own peace and war, rule seats, a read-only observer, and a timed copy | `packages/cli/src/history-run.ts`, `done-check.ts` (`historyRun`) |
| The scorers, each a pure function of the observations: checkpoints (plus each side's war flag set by its own decision, never `--at-war`), the fought operation with a breakdown, pushback, and unknown strength in every run's battles | `history-run.ts` |
| The stand-in check over the code's labels, now written `STAND-IN(<key>; owner: <lane>)`, with a tell for each retired stand-in that had a name. It also lists pack values carried from M2, as lane 1.6's review asked | `packages/cli/src/stand-ins.ts`; nine labels normalised in `kernel` and `rule-seats` |
| The victory measure | `packages/cli/src/victory.ts` |
| The lever sweep (D6): a victory-only bot over seeds, delegation read through `lever-moves.ts`, an atrocity decision's inaction read as watched (0074), any `floor_unpaid` reported as a breach (0082), and recruitment required | `packages/cli/src/lever-sweep.ts`; `atrocityDecisions` in `pack-format/src/gate.ts` |
| The budget, re-measured over the history run too. It now fails if no timed run had the planner, people or situations running | `done-check.ts` (`BUDGET_SYSTEMS`) |
| The 0086 gap: the Linux job fails when any test is skipped, and requires the three stopwatch tests to have run and passed | `tools/no-skips.ts`, a `no_skips` step in `ci.yml`, pinned in `tools/test/ci-workflow.test.ts` |
| Tests: a positive control for every scorer, the sweep on the seats fixture, the pack validator and the no-skips tool | `packages/cli/test/done-check-1a.test.ts`, `packages/pack-format/test/checkpoints.test.ts`, `tools/test/no-skips.test.ts`, `done-check.test.ts` |

**Exit status.** Phase 0's criteria still set it. 1A's criteria are measured and reported; `--milestone 1a` makes them binding. CI stays green while 1A is unfinished, and the lead flips the flag when Part B begins.

## What it measures on today's main

Phase 0: all six pass. 1A: all six fail, each for a reason that names its owner:
- **checkpoints:** 7 of 11 states seceded. Maryland, Missouri and the three treaty nations are neutral. No government in the pack stands for western Virginia. Neither side is at war, because no opening situation has been authored. Men: Union 18,771 (reported, since its floor is not binding) and Confederate 7,957 (below 100,000). Union operations fought: 0.
- **operation:** no operation in the peace run.
- **pushback:** every band reads 0, so six fall below the record's lower bounds.
- **unknown strength:** in the at-war mechanics run, the Union fights at Washington with one block of unknown strength, `fb_us_marines_washington_barracks`.
- **stand-ins:** six of the eight are gone. The generic principal and the capital as objective remain, labelled and owned by lane 1.12, which is a 1A lane, not 1B.
- **lever sweep:** no gated decision opens, and no call for regiments is made.

The tick budget, re-measured on this machine while other sessions were running:

| Run | median (ms) | p95 (ms) | max (ms) |
|---|---|---|---|
| Union at war | 12.2 | 30.1 | 33.1 |
| Testbed | 1.5 | 2.4 | 2.6 |
| Union history run (148 days) | 13.2 | 33.4 | 43.5 |

The budget is a 40 ms median and a 160 ms p95. The history run is at peace on main, so it drafts no plans. The Part B runs measure the war.

## The lead's rulings and the gate review (since 159aaaa)

- **Pushback upper bounds:** accepted as proposed. Each band's cite now names every record case it was counted from.
- **Victory measure:** accepted, labelled [I], and amended by G-1.14c with a fifth term, the mandate (lane 1.6's, in permille above its rest, at 1 a permille). The weights are pack data.
- **Confederate men:** open-topped and labelled until lane 1.11r3 reads the OR IV-1 returns.
- **Confederate planned operations:** 1 to 4, not 0 to 4. FOUNDATION's "a planned operation fought by each side" stands, counting the Sumter bombardment on Davis's government's order, which lane 1.12's bombardment stage makes fightable.
- **Western Virginia's government and the marines' strength:** routed to lanes 1.11 and 1.11r3.
- **Stand-ins:** lane 1.12 retires them in Part A.
- **`--milestone 1a`:** goes into CI's `run:done-check` step when Part B starts. Not done here.
- **G-1.14a, atrocity inaction, the forward route:** `atrocityDecisions` also finds a decision whose inaction fires an atrocity-class item. That can happen directly (a read that the decision was decided with any outcome, or not decided with the option that stops it; a flag its inaction sets; a chain stage after it) or through items in between. Routes back through the decision's own options are excluded. Tested on the testbed's fictional register.
- **G-1.14b, the recruitment chain:** a fugitive-policy decision is one where an option, or the inaction, names a policy row tagged `fugitive-policy`. Each of its moves is played on until a governor of a border government answers a call, up to 400 days; if none does, the move is reported "chain unexercised". The border governments are the pack's `government-side` checkpoints.
- **G-1.14c, every channel measured:** `VICTORY_READS` lists the channels the measure reads: government sides; bloc support and framing, through the mandate; ledger acts and answers, through the mandate once Congress meets the act. A gated decision whose options, locked costs or inaction propose to any other channel is reported "unmeasured channel", and no D6 result counts for it. A decision that enters a ledger act is played on until Congress meets it, up to 400 days.

## The proposals as made

**1. Pushback upper bounds.** Each is three times the record's cases of that kind, counting note-only rows and extras, and never below the lower bound plus 3.

| Band | Lower (verified) | Upper |
|---|---|---|
| Relay objections | 0 | 6 |
| Relay holds | 2 | 6 |
| Filter holds | 1 | 9 |
| Trims | 1 | 4 |
| Compliance with reservations | 1 | 9 |
| Slow walks | 2 | 9 |
| Objections to a plan | 10 | 42 |

Why three times:
- The catalogue covers only the 21 situations' principal-level decisions, read in a single pass. Burlingame ch. 22 never loaded. So the record undercounts, and a run may exceed it.
- But three times everything the record shows, in the same five months, would make pushback the main thing that happens. That is what an upper bound exists to stop.

The run counts both sides, while the lower bounds are all Union-side cases, so they stay lower bounds.

*Rejected:*
- A ratio to orders given. The order count is not settled until 1.12's principals exist.
- No upper bound for compliance with reservations. It still weighs a goal by a man's temper, and a flood of it would hide a broken willingness scale (the reviewer's tabulation: every order lands on reservations or an objection).

**2. The victory measure** (`victory.ts`, weights in `checkpoints.json`). It reads the checkpoint scores; it does not score how close the run stays to history.

| Term | Counts | Weight |
|---|---|---|
| capital | each principal's seat region the side holds, minus each one the other side holds | 1000 |
| government | each government on the side, minus each on the other side | 100 |
| men | permille of all known men, above an even share | 1 |
| ground | permille of all control shares, above an even share | 1 |

Each term returns its amount. The terms are relative, so no opponent needs to be subtracted.

Why these weights:
- A capital outweighs any spread of men or ground (at most 500 each). The capitals are the war's stated aims in the window.
- A government is worth a tenth of a capital, so turning Kentucky outweighs a few percent of the men.

*Rejected:*
- Planned operations fought as a term. That count calibrates against history; it is not winning.
- Distance from the checkpoint bands. That would make the bot a history-follower, and D6 needs a winner.
- Casualties. Each loss already shows in men.

## Choices made

1. **Bands live in a pack file at the root, `checkpoints.json`, beside `pack.json`, not under `data/`.** `data/` is generated, and these bands are hand-written from research. *Rejected:* `WorldRules`, which the kernel would carry and never read.
2. **Phase 0's criteria set the exit status; 1A's are reported until `--milestone 1a`.** *Rejected:* failing CI on main today. The brief expects 1A to fail now, and a red CI for a known state teaches nothing.
3. **The Union men band runs from present for duty's lower edge to the rolls' upper edge (95,000 to 250,000), with a non-binding floor.** A block's strength is "men present", which lies between those two measures, and the note forbids scoring present for duty against the rolls. *Rejected:* either bracket alone.
4. **A tie counts as best in the sweep.** A move that scores as well as the best one is a move the bot may take. *Rejected:* strict best, which would let a watched option hide behind a tie.
5. **The sweep plays each move 30 days on, from the morning the decision is open, and weighs each gated decision once per seed.** The done check sweeps 8 seeds; its test sweeps 2.
6. **Stand-in labels follow one format, `STAND-IN(<key>; owner: <lane>)`, on one line.** Three stale labels were reworded: the credibility stand-in that lane 1.6 replaced, the conflict-window note, and the capital objective.

## For the lead

1. Every item from the first report is ruled (above).
2. Missouri has no rival government in the pack, so its band scores the one `st_missouri`.
3. When Part B starts, add `--milestone 1a` to CI's `run:done-check` step.
4. The channel list (`VICTORY_READS`) is what 1B extends when national will, foreign patience and enemy capacity get owners. Until then, a gated option that proposes to them is reported unmeasured, as G-1.14c intends.

## Findings outside my scope

- The pack's politics values carried from M2 (`rules.politics.drift`, `address`, `ladder`, `credibility`, `press.standing`) are listed in the stand-ins evidence. Calibration (Part B) replaces them.
- `done-check.test.ts` on main still has the unguarded stopwatch assertion in its budget control (`expect(budgetProblems(run)).toEqual([])`). Lane 1.13's branch fixes it, so I left it alone to avoid a conflict.
