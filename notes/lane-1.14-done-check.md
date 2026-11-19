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

## Recorded measurements before the R58 merge

These figures predate main's lane 1.12 merge. The R58 section below gives the current results.

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
- **Confederate men:** originally open-topped pending lane 1.11r3's reading of the OR IV-1 returns; R58 adds the authorised inferred ceiling below.
- **Confederate planned operations:** 1 to 4, not 0 to 4. FOUNDATION's "a planned operation fought by each side" stands, counting the Sumter bombardment on Davis's government's order, which lane 1.12's bombardment stage makes fightable.
- **Western Virginia's government and the marines' strength:** routed to lanes 1.11 and 1.11r3.
- **Stand-ins:** lane 1.12 retires them in Part A.
- **`--milestone 1a`:** goes into CI's `run:done-check` step when Part B starts. Not done here.
- **G-1.14a, atrocity inaction, the forward route:** `atrocityDecisions` also finds a decision whose inaction fires an atrocity-class item. That can happen directly (a read that the decision was decided with any outcome, or not decided with the option that stops it; a flag its inaction sets; a chain stage after it) or through items in between. Routes back through the decision's own options are excluded. Tested on the testbed's fictional register.
- **G-1.14b, the recruitment chain:** a fugitive-policy decision is one where an option, or the inaction, names a policy row tagged `fugitive-policy`. Each of its moves is played on until a governor of a border government answers a call, up to 400 days; if none does, the move is reported "chain unexercised". The border governments are the pack's `government-side` checkpoints.
- **G-1.14c, every channel measured:** `VICTORY_READS` lists the channels the measure reads: government sides; bloc support and framing, through the mandate; ledger acts and answers, through the mandate once Congress meets the act. A gated decision whose options, locked costs or inaction propose to any other channel is reported "unmeasured channel", and no D6 result counts for it. A decision that enters a ledger act is played on until Congress meets it, up to 400 days.

## Since 85c3a37: G-1.14d and the standing review's should-fixes

- **G-1.14d** (the gate reviewer's finding, the lead's ruling). The unmeasured-channel check now also follows:
  - a policy row's pushback, reported as `people/grievance (policy pushback)`;
  - every flag a gated decision sets or clears, through whatever reads it, to a fixed point. A pack rule reading it counts: the self-emancipation rule's policy, pressure and protected flags give `regions/self-emancipation`, and a war flag gives `seats/war`. So does an item whose trigger or option conditions read it, which carries that item's channels, flags and policies.
  - The sweep's report says a decision with any such channel is **measured in part**, names each channel and how it is reached, and says that no D6 result for it counts as evidence. In 1A that will be true of S17: its people's-response cost cannot be weighed until enemy capacity exists in 1B.
- **The recruitment chain** closes only with a new levy at a border government's post. A levy exists only for an answer to a call, and it is where loyalty scales the regiments. A transfer or a goal at a governor's post can no longer stand in for it.
- **New tests**, so that breaking each rule fails one:
  - the border-department filter;
  - the fork's stopping rule (`forkDone`: the ledger wait and the chain wait) and `playOn`;
  - the mandate's weight away from its rest, on the testbed's blocs.
- **The Union men band's cite** carries lane 1.11r3's cross-check: Cameron's 22 June claim of 250,000 in the field. It is a public claim, not a return, and it agrees with the upper edge.

**Wired but not exercised.** The Union pack has no gated decisions yet, so the sweep weighs nothing on main. G-1.14a to d are tested on fixtures only. Their first real decisions come when lane 1.11 merges, and Part B's calibration runs exercise them.

## Pause record (2026-11-17; superseded by R58 below)

- **Head:** `phase1-done-check-1a` at accb12a, CI green.
  - **G-1.14d:** done (63ca901), with the standing review's should-fixes.
  - **Main:** already merged in (accb12a, no conflicts). No merge is owed.
  - **Review:** the standing reviewer has queued 63ca901 and accb12a for re-check after the pause. The gate reviewer has accb12a for G-1.14d.
- **Lane 0.7l:** `art-lfs` is at 535e3ff, CI green: main merged in, the art-masters/ refusal, and the modes test. That is past the lead's "stays at 9c69c66", because those commits were already pushed when the pause arrived. The reviewer has queued 535e3ff.
- **Owed on resume, by the lead's ruling:**
  - Give the Confederate men band a labelled inferred ceiling of 200,000 [I]. Cite the inference from Walker's 24 July count (OR IV-1 pp. 496-497, "190 regiments and 34 battalions" accepted), so calibration can revisit it.
  - The Washington Marines strength and the Harris/Henderson correction go to the data lane.
- **Part B, the calibration runs**, once lanes 1.11 and 1.12 are on main:
  1. Merge main into this branch, then run `run:done-check` and read the six 1A criteria on the real history run, which by then has war openings, situations and principals.
  2. Calibrate design parameters against the bands, never the bands against the run. In order:
     - goal boldness (hold 400, advance 600);
     - the compliance thresholds, against the pushback bands;
     - discontent and the ladder;
     - credibility and the M2-carried politics values;
     - drafting against execution boldness (McClellan's gap);
     - the Fort Wagner assault case.
  3. Run the lever sweep with 8 seeds on the authored gated decisions (S17 first). Read any flagged option, any "chain unexercised", and the "measured in part" channels.
  4. Re-measure the tick budget on the war run, and count the press's mail apart, as the lead ruled.
  5. When the criteria pass, or their remaining failures are ruled, add `--milestone 1a` to CI's `run:done-check` step.

## Where the lane stopped (R58, 2026-11-19)

Worked only on R58 in this worktree. HEAD remains `f6dedebb167643912b7c4492ccc451093bd973c2`; the lead's merge of main at `d472d1e` remains in progress. Both conflict files have resolved contents, but the index intentionally still records them as unmerged. No stage, commit, abort, checkout, fetch or other Git write was performed. R44 and the gate reviewer had already approved Part A; Claude's review of this delivery remains pending.

**Step 1, merge resolution and the required check's Git guard:**

| File | Resolution |
|---|---|
| `packages/kernel/src/seats/world.ts` | Kept lane 1.12's doctrine validation and retirement of the other-capital objective. Lane 1.14 had only relabelled that obsolete stand-in here. The resolved file matches main at `d472d1e`. |
| `packages/rule-seats/src/index.ts` | Kept lane 1.12's doctrine, attention accounting, calls, concentration, appointments, inquiries and battle answers. Removed the obsolete generic-principal implementation and its labels, rather than restoring a stand-in that main retired. The resolved file matches main at `d472d1e`. |
| `tools/test/lfs.test.ts` | Before running the required gate, made its three scratch-history fixtures honour `MANDATE_NO_GIT=1`, as R54 had done on another branch. The hook-mode Git query also skips under that flag. Ordinary hook and CI collection remain unchanged. |

Lane 1.14's scorers, sweep, victory measure and stand-in scanner are preserved. No generated file required regeneration, and all generated files remain byte-identical to the initial merged worktree. Step 1's file copies and manifest are in `runs/r58/step1/` and `runs/r58/step1-files.json`.

**Step 2, a separate change set:** only `packs/union-1861/checkpoints.json`. The `men_confederate` maximum is now **200,000 [I]**; its 100,000 minimum and binding floor are unchanged. Its citation names `docs/research/_leads/T2-strengths.md`, section 1's corrected reasoning, and Walker to Davis, 24 July 1861, OR IV-1 pp. 496–497. About 200,000–210,000 is a rough paper estimate for the regiments and battalions Walker counted [I]. His independent companies, twelve recently called regiments and reserve corps are outside that count. The 200,000 ceiling is explicitly an inferred, revisable calibration band, not an upper bound proved by those sources or a count of men under arms. This completes the ceiling item R51 left to this lane. The lead can commit step 1's merge first, then this file; this hand-over records both steps.

**Verification and retained evidence:**

- Dependency links resolve to this worktree's own packages; the root lockfile did not differ between the two merge parents, so no install was needed. Typecheck exits 0. Focused doctrine, seats, bombardment, harness, checkpoint and LFS checks exit 0: **7 files, 98 passed / 4 skipped** (`runs/r58/step1-focused.log`).
- The pack loads. The ceiling probe confirms that only the maximum and its citation changed: 99,999 fails the existing floor, 100,000 and 200,000 pass, and 200,001 fails the ceiling (`runs/r58/ceiling-check-corrected.log`, exit 0). The first probe failed because a PowerShell evidence export was UTF-16; converting that evidence file to UTF-8 corrected the probe without a product change. Both logs are retained.
- Required **`MANDATE_NO_GIT=1 npm run check` exits 0: 103 files, 1,307 passed / 7 skipped**, plus typecheck, pack boundary, licences and decision index (`runs/r58/check.log`, `check-exit.json`). The skips are the three existing opt-in stopwatch tests and four Git-dependent LFS tests; the staged-hook file is excluded by the existing no-Git configuration.
- Required **`npm run run:done-check -- --label r58-done` exits 1: Phase 0 5/6, reported 1A 2/6** (`runs/r58/done-check.log`, `done-check-exit.json`). Behaviour, hashes, replay/save-resume, liveness and section-ten pass. The Union mechanics run misses the unchanged timing budget: **98.28 ms median / 220.86 ms p95**, against 40/160 ms. Testbed is **6.41/39.20 ms**; the 148-day Union history run is **34.42/71.19 ms**. Reference summaries and saves are under `runs/r58-done/`; drafting evidence is under `runs/r58-done-drafting/`.
- One cheap, isolated 75-day timing-only reproduction also exits 1: **96.73 ms median / 191.22 ms p95** (`runs/r58/timing-only.json`, `timing-only.log`). No expensive campaign was repeated. The kernel and rule-seat executable code matches `d472d1e`: their remaining kernel differences are comments. The runner's optional observer is after the timing sample and absent from timed runs. This inspection does not establish whether the miss is main's performance or machine load. The timing gate remains unmet; thresholds and simulation parameters were not changed.
- 1A now passes **unknown strength** and **stand-ins**. The other four criteria remain failed: the history run has no government's war opening, incomplete sides/governments, 7,957 Confederate men below the floor, no fought operation or pushback, and no gated decision or recruitment in the sweep. The added ceiling is reported as `100000..200000`; it does not cause the present below-floor failure. These remain for the situations/data lanes and Part B, not feature work in R58.
- Final preservation inventory: `runs/r58/final-preservation.json`. The index and all five other snapshotted merge-state files are byte-identical to entry. Both conflict files are marker-free; `git diff --check` exits 0. No server was started.

**For the lead:** commit the merge changes before the separate ceiling file, after review. The standalone timing failure remains a failed required gate. [I] Keep its budget unchanged and route the reproducible miss to Part B/performance diagnosis; rejected changing the budget or tuning unrelated simulation behavior to close this merge. The full-suite evidence remains valid and was not repeated. Part B still awaits lanes 1.11 and 1.12 together, and `--milestone 1a` remains off.

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
- The Union mechanics timing budget fails in the required R58 done-check and in one isolated timing-only reproduction. Cause remains undetermined; the result and unchanged limits are recorded above for the lead and Part B.
- The remaining four failed 1A criteria still need the situations/data lanes and Part B. The old finding about an unguarded stopwatch assertion is retired: lane 1.13's guard is present in this merged tree.
