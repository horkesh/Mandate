# Research: what Mandate's new kernel should learn from AWWV's architecture

Date: 2026-11-14. Status: research note (not canon). Paths are relative to the AWWV repo (`F:\A-War-Without-Victory`) unless prefixed `Mandate:`.

Conventions: a `file:line` means I read it in AWWV's code or docs. **[I]** marks my inference. Counts marked "counted" are my own line or file counts on 2026-11-14.

This note complements `2026-11-13-awwv-harvest.md`, which covers the premise and the command-chain rulings, and `Mandate:docs/LESSONS.md` L1–L8. It does not repeat them.

Target shape assumed throughout: the American Civil War 1861–65 with Lincoln as the player; real time with pause on a daily tick; hundreds to about 2,000 irregular regions joined by roads, railways and rivers; derived fronts and supply-path encirclement; divisions transferred between commanders; goal-driven plans drawn as arrows; every person a seat (rule-based, LLM, later human) over one deterministic kernel replayed from a log; per-seat knowledge; a light economy; cause-triggered situations; and the 1864 election as a hard end.

## 1. What AWWV's architecture is

- **One mutable state object.** `GameState` (`src/state/game_state.ts:2630`; the file is 3,377 lines) holds truth, caches, diagnostics, UI history and legacy fields side by side. `MilitaryState` alone runs from :2771 to :2966.
- **A weekly pipeline.** `runTurn` (`src/sim/turn_pipeline.ts:76`) clones the state and runs 171 named war steps in order (counted in `src/sim/turn_phases/war_phases.ts`, 4,532 lines), plus six early-war steps in bottom-up mode (:169-184). A post-turn invariant barrier (:195-209) then returns a typed failure instead of throwing (:47-56).
- **Saves.** Saves are canonical JSON with sorted keys and a transient denylist (`src/state/serializeGameState.ts:37-51`). The schema is at v38 (`game_state.ts:42`), carried by a 785-line migration stack (`save_migration.ts`) and a 4,629-line shape validator (`validateGameState.ts`).
- **Space.** 6,002 settlements were Voronoi-tessellated inside 110 municipalities (`docs/20_engineering/MAP_BUILD_SYSTEM.md:5-6`), then clustered into 712 operational settlements, called OSIDs (:65). The contact graph is derived from polygon geometry. Two id namespaces, SID and OSID, are kept with maps in both directions (`src/state/supply_reachability_osid.ts:73-78`).
- **Spatial snapshot.** `SpatialContext` (`src/sim/spatial_context.ts:30-64`) holds adjacency, per-faction friendly sets and connected components. It is recomputed before and after combat.
- **Fronts and sectors.** A front exists wherever hostile OSIDs are adjacent (`docs/10_canon/Engine_Invariants_v0_9_0.md:53`). Corps "front sectors" are built from front edges every turn and then persisted (`game_state.ts:2667-2727`).
- **Supply.** Supply is an unweighted breadth-first search from faction sources across friendly and allied OSIDs. Anything not reached is "isolated" (`supply_reachability_osid.ts:116-171`). There is no capacity and no distance.
- **Command.**
  - A brigade stands on one OSID, and corps own sectors.
  - Every attack goes through a `CorpsOperation` (`Engine_Invariants:96-106`), which has axes and the phases planning, execution and recovery (`game_state.ts:354-433`, `:572-731`).
  - Bot corps run a pipeline: briefing, belief, assess, allocate, plan, decide, emit (`src/sim/combat/commander/`; `emit.ts` alone is 3,730 lines).
  - Historical operations are TypeScript catalogs (`pre_planned_operations.ts`, 3,329 lines) and trigger closures (`triggered_operations.ts:93`).
- **Determinism.**
  - There is no RNG at all (`turn_pipeline.ts:146`, `:307-309`; Invariants §11.1). Ordering uses `strictCompare`, and static scans ban clocks and randomness.
  - Acceptance is a 188-week run scored against four painted control maps (707 of 712 cells, `docs/20_engineering/DETERMINISM_TEST_MATRIX.md:36`).
  - That run takes 297 s locally (`DETERMINISM_TEST_MATRIX.md:331`) and 4m58s on CI (`docs/life_lessons/platform.md:40`).
- **Visibility.** Data falls into three classes behind a renderer boundary (`docs/20_engineering/PLAYER_VISIBLE_STATE.md`). The warroom reads only through `extractWarData` and the UI only through the `LoadedGameState` adapter (`docs/life_lessons/architecture.md:48-52`, `:95-99`).
- **LLM commanders** (`src/sim/ai_commander/`). Their decisions are validated against event constraints (`decision_validator.ts:1-6`) and logged inside `GameState`, so a replay reuses them instead of calling the API again (`decision_log.ts:1-15`).
- **Scale** (counted). About 322,000 lines of TypeScript under `src/`, of which 91,000 are in `src/sim/combat/` across 222 files. There are 1,556 test files; the last full suite ran 15,094 tests (`DETERMINISM_TEST_MATRIX.md:36`).

## 2. Patterns to port

Each entry gives what to port, why, and where it lives in AWWV.

**P1. A pure step that returns a typed invariant failure.**
- What: `runTurn` returns `success | invariant_failure`. Callers must assert success before consuming the result (`turn_pipeline.ts:41-70`). Canon allows only named, explicit corrections; anything else must come back as a structured failure (`Engine_Invariants:9-13`).
- Why: a failed tick must never quietly become the next state.
- Mandate form: `tick(world, state, commands) → { state, report } | { failure }`.

**P2. Serializer guards.**
- What: keys are sorted. Non-finite numbers throw with their path, where JSON would otherwise silently write `null` (`serializeGameState.ts:57-76`). A Map or Set is normalised, unknown top-level keys are rejected (:134-147), and transient fields are a named, machine-readable list (:32-43).
- Mandate form: keep all of these. Add a type-level marker for each field's class (see M9).

**P3. One spatial index per control state, built in from day one.**
- What: `SpatialContext` is frozen, computed at phase boundaries, and invalidated after any control change (`spatial_context.ts:1-13`, `:154`).
- Why: AWWV retrofitted it. The header still says "Phase 0: compute and cache only — no consumers yet" (:9). `buildOsidAdjacency` and `buildFriendlyComponents` are still called directly in 26 files (counted, 44 call sites).
- Mandate form: a `ControlIndex` derived from (world graph, control map). Every system receives it as an argument, and nothing rebuilds adjacency for itself.

**P4. Graph structure instead of authored lists.**
- What: "Connected components, not proxy checks, for reachability" (`architecture.md:274-280`). Articulation points already found every chokepoint that someone proposed to author by hand (:113-129). A size-fraction threshold could not tell a vital corridor from an ordinary valley (:440-444).
- Mandate form: vital junctions, pockets and brittle supply lines are computed from the graph. Watch the traversal-tree trap: a breadth-first spanning tree shows reachability, not redundancy. Bridge detection run on the tree reports every edge as a bridge (:78-79).

**P5. End-of-tick assertions for cross-cutting invariants.**
- What: a guard on each code path failed three times, because new paths kept arriving without it (:376-380). A single post-pipeline assertion catches every path, and the pattern was then applied to five systems.
- Mandate form: an `invariants.ts` barrier that runs after every tick.

**P6. Intent, then route, then execution, with one writer of location.**
- What: AWWV's tiers are T1 strategic intent, T2 routing, T3 execution, T4 combat consequence, T5 lifecycle and T6 repair (`docs/20_engineering/MOVEMENT_AUTHORITY.md:8-19`). The separation is right; its cost is in M2.
- Mandate form: commanders write intent (where divisions should stand), a router turns intent into a route, and one executor moves divisions along the graph. Combat may displace a division only through the same executor.

**P7. Plans are intentions; operations are contracts; axes are independent.**
- What: "Plans are intentions, not orders — the EMIT phase converts ready plans into actual CorpsOperations" (`src/sim/combat/commander/plan.ts:1-33`). Operations need an explicit lifecycle in which "a turn with movement-only is still progress" (`architecture.md:382-386`).
- Why independent axes: a shared objective index meant the first stalled axis stopped every other axis (:196-201). Independent per-axis state fixed it (:220-223).
- Mandate form: the arrow plan is a `Plan` drafted by a commander seat. On approval it becomes an `Operation` owned by the kernel. Each arrow is an independent axis from the start.

**P8. An ownership header in every file, made checkable.**
- What: `plan.ts:17-32` declares OWNERSHIP, DECIDES, WRITES, READS, MUST NOT, UPSTREAM, DOWNSTREAM and TRUTH INVARIANTS.
- Mandate form: rule 7 says that rules which matter become checks. Make WRITES machine-readable and test it (see M2).

**P9. Exact causal receipts and breakdowns.**
- What: a battle receipt records the exact attacking brigades and contributing operation ids. "Sharing a target OSID is not evidence that an operation caused a battle" (`Engine_Invariants:106`). `computeDefenderPowerBreakdown` returns the terms of the result, not only the result (`src/sim/combat/combat_math.ts:51`, `:1609`).
- Mandate form: this is rule 6. Carry it into combat, supply and movement.

**P10. Trace every gate, not just the first one that blocks.**
- What: operation launch had five or more independent gates. Fixing the first left the hash identical, because the next gate was the binding one (`architecture.md:310-314`). Two sessions spent diagnosing from static code reading were both wrong. "If a system has been debugged twice without finding the root cause, the answer is never 'run more agents.' It is always 'add instrumentation'" (`docs/life_lessons/process.md:146-151`).
- Mandate form: every seat and kernel decision returns typed gate results. They go to the tick report and the journal, not into state.

**P11. Three visibility classes and a shaped view.**
- What: the classes are player-safe, staff abstraction and debug-only. "The player client should receive a player-facing state, not a prettified full state" (`PLAYER_VISIBLE_STATE.md:13-66`). A field's tier must be stated, and if it is missing the field is treated as fog-gated (`architecture.md:60-64`).
- Mandate form: `Mandate:view.ts` is already the boundary. Generalise it from faction to seat. "Staff abstraction" is the natural type for commanders' estimates.

**P12. The kernel validates every seat's output.**
- What: LLM decisions pass a pure validator against the active constraints before they take effect (`src/sim/ai_commander/decision_validator.ts:1-6`).
- Mandate form: a seat proposes commands. The kernel accepts or rejects them with a typed reason and logs both.

**P13. Hash-pinned optimisation.**
- What: in AWWV's profiling series, every speed-up was accepted only if the save hash stayed byte-identical ("kept hash `0cb626c032204372`"). The usual fix was a pass-local cache, built once per pass instead of once per brigade (`.claude/napkin/full_archive_20260708.md:636-670`).
- Mandate form: a performance change must leave the replay hash unchanged.

**P14. Identity derived from content and persisted.**
- What: the fix for re-minted sector ids was to derive identity from content and store it on the record (`architecture.md:491-495`).
- Mandate form, better still: let memory live on entities whose identity never changes (people, divisions, departments, regions). See M10.

**P15. Validate authored vocabulary when the pack loads.**
- What: event effects written to the wrong channel passed JSON validation and did nothing at runtime. A pre-fix audit found 11 such dead writes. The loader now rejects them (`docs/life_lessons/events.md:6-12`).
- Mandate form: `Mandate:scenario.ts` already reports every problem. Extend it to situations: every fact a trigger reads must have a writer (see M7).

**P16. An explicit staleness contract.**
- What: AWWV states outright that "Supply cascade is visible at the start of the **next** turn (supply is not re-run after control flips within the same turn)" (`Engine_Invariants:34`).
- Mandate form: name every derived value that is allowed to lag a tick, and recompute everything else on change.

## 3. The most expensive mistakes, and the rule Mandate should adopt for each

**M1. Derived data became truth.**
- What happened:
  - Canon says fronts are never serialized (`Engine_Invariants:326-332`).
  - Yet corps front sectors are "required-persisted", because "rebuilding can relocate formations and is therefore a gameplay mutation" (`game_state.ts:2667-2673`, `:2890`).
  - Sector intel was keyed on sector ids that are re-minted every turn, so after four years of contact the median `turns_in_contact` was 1–2. Intel was "unreachable by construction" (`architecture.md:491-495`).
  - A whole reconciliation layer grew up around sector rosters (`docs/life_lessons/sectors.md`).
- Rule: fronts, pockets and supply status are pure functions of truth, and rebuilding them changes nothing. Divisions belong to commanders, and commanders to departments; both are truth. No roster is ever owned by a derived front.
- Enforce:
  - A test that rebuilds every derived index from scratch mid-run and compares it with the live one.
  - A test that a save with all derived data stripped resumes to the same hash.

**M2. Many writers per truth.**
- What happened:
  - Sixteen files across six tiers write movement intent, movement orders or location (`MOVEMENT_AUTHORITY.md:21-43`; 19 rows, 3 of which are shared predicates or derived). The T2 router and the T6 repairer disagreed about the legal scope and reissued and cancelled the same march forever (:45-55).
  - Civilian deaths had three write paths into two stores, which drifted 3,700 apart (`architecture.md:322-326`).
  - Five code paths flipped control, and only two of them emitted events (:244-248).
  - A formula bot silently overwrote the AI commander's stances every turn (:316-320).
  - Trimming passes stripped brigades out of live operations (:42-46).
- Rule: each truth field has exactly one writer function. For control, location, assignment and strength, that function is also the only place that emits the matching event.
- Enforce: an architecture test mapping each owned field to its owner module, failing on assignment anywhere else. `Mandate:LESSONS.md` L2 already says to add this "once state has more than one module"; the new kernel is that moment.

**M3. A long pipeline with late writers.**
- What happened:
  - With 171 steps, derived values computed early went stale when later steps mutated their inputs (`docs/life_lessons/data_pipeline.md:38-42`; `architecture.md:282-286`).
  - The answer was more steps: `recompute-sector-combat-ratings`, `reconcile-live-operation-truth`, `sanitize-ghost-sector-power` and a whole "T6 repair" tier (`architecture.md:30-34`).
  - "If you enforce a property every turn, the model is wrong" (:394-398).
- Rule: a short day tick, under about 15 phases, each declaring what it reads and writes. Derived data is a memoised function of a truth version, never a mid-tick write into state. Repair steps are not allowed. A repair is a bug report against the step that broke the invariant.
- Enforce: a static test over the declarations. No phase may read a derived value whose inputs a later phase in the same tick writes, unless it is listed under P16.

**M4. No command log; the shell mutated state in place.**
- What happened:
  - The desktop main process has 81 IPC handlers (counted). The mutating ones read the canonical state, call a mutator and write the state back (`src/desktop/electron-main.cjs:2580-2594`). A mutation is "complete only after the new state has been serialized, autosaved, and broadcast" (`Engine_Invariants:303-305`).
  - The player's decision pause runs inside the turn pipeline as an async callback (`turn_pipeline.ts:162-166`, `:283-305`).
  - Replay plays back saved snapshots and never re-simulates (`src/sim/replay/replay_player.ts:1-10`).
  - Consequences: player games could not be compared with headless ones, and differences had to be classed as "explicit input divergence" (`DETERMINISM_TEST_MATRIX.md:73`, `:150`).
  - A run resumed from a save diverged from the continuous run: 616 semantic differences across seven saved turns, cause unmeasured (`DETERMINISM_TEST_MATRIX.md:320`; `docs/20_engineering/SAVE_SCHEMA_EVOLUTION.md:61-64`).
  - The LLM decision log lived inside `GameState` (`decision_log.ts:10-15`).
- **[I]** One plausible contributor to the resume divergence: 81 module-level `Map`/`Set`/`WeakMap` declarations across 52 files in `src/sim` (counted, constant tables included), among them a cache keyed on `GameState` identity (`supply_reachability_osid.ts:43-48`).
- Rule: the command log is the source of truth.
  - Every seat input (human, LLM or rule-based) is a typed command stamped with the day it applies.
  - `state(d+1) = tick(world, state(d), commands(d))`.
  - A save is a snapshot plus the log. Replay never calls a seat; LLM text and the parsed command are both logged.
  - Input enters only between ticks.
  - Kernel modules hold no module-level mutable state.
- Enforce:
  - A replay test: the log alone reproduces the final hash.
  - A resume test: save and reload on randomly chosen days, then continue, and get the continuous run's hash.
  - Extend the banned-API test to forbid module-level `let` and mutable collections in the kernel.

**M5. Floats.**
- What happened: byte-hash baselines were removed from CI because `final_save.json` differed between Windows and Linux. A "structural fingerprint" of control counts and flips replaced them (`DETERMINISM_TEST_MATRIX.md:202-235`). Commander beliefs blend with floating-point weights (`src/sim/combat/commander/belief.ts:25-56`).
- Rule: keep Mandate's integer permille (decision 0002).
- Enforce: run the replay test on both Windows and Linux in CI and compare hashes.

**M6. No noise, so every run is a single sample.**
- What happened:
  - Small changes reshuffled the whole operation schedule. At 61% schedule divergence, the checkpoint deltas were "not numbers" and re-running could not fix that (`docs/life_lessons/calibration.md:584-587`).
  - "Cells moving the right way" turned out three times in one day to be "a schedule lottery" (:599-602).
  - Alphabetical tiebreaks cascaded across whole sectors (`sectors.md:90-94`).
- **[I]** With no seeds, AWWV could never separate a mechanism's effect from chaos.
- Rule: keep 0002's named streams and L5's percentile calibration. Judge every behavioural change over a seed set, never on a single run.

**M7. Setting and calendar inside the engine.**
- What happened:
  - Pipeline steps are named after history: `washington-check`, `operation-storm-check`, `jna-transition`, `hv-integration`, `apply-vrs-equipment-decay` (`war_phases.ts`).
  - `SpatialContext` hardcodes RBiH and HRHB (`spatial_context.ts:117-121`), and the Sarajevo id sets are "engine geometry" (`src/state/enclave_integrity.ts:17-39`).
  - Triggers are closures such as `turn >= 170 && srebrenicaFallReceiptFired(state)` (`triggered_operations.ts:533`, also `:336`, `:606`).
  - An event gated on `srebrenica_fallen` was always true, because the flag that actually gets written is `srebrenica_fell` (`events.md:28-29`).
- Rule: situations are pack data with declarative cause predicates over named, typed facts. There are no date gates in the kernel or in trigger logic. A date can appear only as a fact, such as "the election is due".
- Enforce: the pack validator rejects any predicate that reads a fact with no writer. Mandate's boundary check (0003) already keeps names out of `packages/`.

**M8. Adjacency derived from polygons.**
- What happened:
  - A zero-distance threshold excluded 96% of real edges because of float noise (`data_pipeline.md:68-72`).
  - Single-vertex contacts created phantom fronts (:74-78).
  - A merge script dropped `min_dist`, which turned three adjacency filters into no-ops (:19-24).
  - Regenerating polygons silently changed the contact graph and shifted calibration (`architecture.md:172-176`).
  - Two adjacency definitions coexist in one spatial context (`spatial_context.ts:31-35`), and a grouping step and a splitting step disagreed (`architecture.md:352-356`).
- Rule: the region graph is authored data. Regions and typed edges (road, rail, river, sea) are the source, and polygons are presentation only. Each edge type has one adjacency definition.
- Enforce: a graph validator checks symmetry, endpoints, connectivity and edge-type legality, plus a golden list of known links.

**M9. Diagnostics, legacy fields and UI history inside truth.**
- What happened:
  - `CorpsOperation` carries legacy single-axis copies of the axis fields, marked "legacy — used when axes is absent", plus debug fields gated by environment variables (`game_state.ts:405-433`, `:641-678`).
  - `MilitaryState` keeps "compatibility-only" fields (:2790, :2824-2837) and stringly typed traces (`op_launch_trace?: string[]`, :1070).
  - Only 14 fields carry a `@persistence` class (counted), and only 5 are actually stripped on save (`serializeGameState.ts:37-43`).
  - An enum value whose execution path did not exist became a "zombie" operation that held a corps slot forever (`architecture.md:161-165`).
- Rule: state holds only what mechanics read. Traces go to the report, history to the journal, display signals to the view. Every field is classified as truth or input by type. Operation kinds are a discriminated union whose resolver is required at compile time.
- Enforce: a test that every `GameState` field has a class marker and at least one kernel reader.

**M10. Unstable identity.**
- What happened:
  - A runtime save carries two id namespaces. A catalog brigade can live under a synthetic key, so lookups by catalog id miss "in every run ever measured" (`architecture.md:477-483`).
  - Positional ids are re-minted every turn (:491-495).
  - Enclave ids are a hash of the member list (`enclave_integrity.ts:52-57`). **[I]** Such an id changes whenever the pocket gains or loses a cell.
- Rule:
  - Ids are minted once, from the pack or at creation, and never re-derived.
  - Plans and arrows reference only static ids (regions, edges) and persistent ids (people, divisions, departments), never derived ones (front segments, pockets).
  - Derived things carry no memory.

**M11. Per-entity production.**
- What happened: every brigade gained tanks on a timer. 125 brigades produced 243 phantom tanks against a historical 30–50. "Per-brigade scaling is acceptable only for consumption, never for production" (`architecture.md:328-332`). A proxy ticker had been hiding the missing capture mechanic (:334-338). Transfers that never debited the source duplicated equipment (:340-344).
- Rule for the light economy: production is a budget held by a lever-holder (a person or post). Divisions only consume. Every transfer is a single debit-and-credit function.

**M12. Tick cost.**
- What happened: about 1.6 s per weekly turn on 712 nodes and about 280 formations (297 s / 188 turns; the 279-formation snapshot, `DETERMINISM_TEST_MATRIX.md:44`). The profiling series shows the cost was per-brigade decision loops repeating spatial scans (`.claude/napkin/full_archive_20260708.md:636-670`).
- **[I]** A 1861–65 campaign is about 1,460 daily ticks. At AWWV's per-turn cost that is about 39 minutes per headless run, and real-time play would stall.
- **[I]** For Monte Carlo calibration (say 100 seeds) and smooth play, a day tick needs to cost a few milliseconds. For example, 100 × 1,460 ticks at 5 ms is about 12 minutes.
- Rule:
  - Recompute the control index and supply only when control or rail state changes, not every day.
  - Slow systems run weekly (0010 allows this).
  - Seat views are built on demand, not every day.
- Enforce: a performance test that fails when a one-year headless run exceeds its budget.

## 4. Proposed module map for the new kernel

The map has three layers.
- **World**: static data from the pack. It is immutable and hashed, never saved, and referenced by hash.
- **State**: mutable truth, saved.
- **Derived**: pure functions of World and State, memoised, never saved.

The command log and the journal sit beside State.

| Module | Layer | Owns | Notes and AWWV lineage | From today's kernel |
|---|---|---|---|---|
| `world/graph.ts` | World | regions, typed edges (road, rail, river, sea), lengths, rail capacity, depots, terrain | Authored, validated at load (M8). | new; `Region.neighbours` moves here out of saved state (`Mandate:state.ts:88-94`) |
| `control.ts` | State | the region-controller map; the **only** writer of a control flip, which also emits the event | M2: five flip paths, two emitting | from `theatre.ts` |
| `control_index.ts` | Derived | friendly sets, components, contact edges, fronts, pockets | P3, P4, M1; fronts carry no memory | new |
| `supply.ts` | Derived (+ stocks in economy) | supply paths from depots over the friendly graph; out of supply = no path; brittle = articulation points on the path | Replaces unweighted search (`supply_reachability_osid.ts`). **[I]** A multi-source shortest path per faction on 2,000 nodes is cheap when recomputed only on change. Allocate rail capacity in priority order, not by max-flow. | new |
| `forces.ts` | State | divisions: strength, region, commander; the **only** writer of location is `movement.ts` | P6 | from `Post.force` |
| `command.ts` | State | people in posts, departments, division→commander assignment; the transfer verb is the only writer | M1: assignments are truth, fronts are not | from `state.ts` posts |
| `plans.ts` | State | goals; plan drafts (arrows: phases, routes, timings, supporting commands); approval state; edits as counter-orders | P7. Edits go through `reading.ts` so the commander can object. | new |
| `operations.ts` | State | approved plans in execution; per-axis lifecycle; receipts | P7, P9; discriminated union of kinds (M9) | replaces `theatre.ts` operations |
| `movement.ts` | State writer | route and execute; one location writer | P6 | new |
| `combat.ts` | State writer | battle resolution with breakdowns and seeded noise | P9; named stream per battle (0002) | from `theatre.ts` |
| `knowledge.ts` | State | per-seat reports and claims with latency (courier, telegraph); beliefs derived on read | **[I]** Store reports, not a dense per-seat copy of the world. | from `messages.ts` |
| `view.ts` | Derived | `viewFor(state, seatId)` built only from that seat's knowledge, its own returns and its own acts; three visibility classes | P11 | survives, generalised from faction to seat |
| `seats.ts` | State | who drives each person (rule, LLM, human); command validation | P12. Drivers live outside the kernel; the kernel only validates. | from `bot.ts` (which becomes a rule-based driver outside the kernel) |
| `people.ts`, `compliance.ts`, `reading.ts`, `audience.ts`, `proxy.ts`, `ladder.ts` | State writers | willingness, the single owner of order reading, audiences, delegation, the insubordination ladder | Core of Mandate; AWWV's thin compliance formula (harvest note) is not a model | survive; recast from directives to plan edits and goals |
| `economy.ts` | State | money, men, munitions, rail capacity; each lever held by a post | M11: budgets at the holder, divisions consume | new; extends `Post.recruitPerWeek` |
| `situations.ts` | State | declarative cause predicates (pack data), offers and decisions | M7, P15; AWWV's event-system ideas reimplemented (0012) | new (named in `KERNEL.md` "known simplifications") |
| `politics.ts` | State + Derived | blocs, mandate, election checkpoint and verdict (losing 1864 ends the game) | | from `derive.ts`, `turn.ts` checkpoints |
| `tick.ts` | — | the fixed day order; returns the decision-point signal used for auto-pause | M3, P16 | replaces `turn.ts` |
| `log.ts`, `serialize.ts` | — | command log, journal, snapshots, replay, canonical JSON | M4, P2 | new; `messages.ts`'s ground-truth ledger moves to the journal **[I]** unless a mechanic reads it |
| `invariants.ts` | — | post-tick assertions returning a typed failure | P1, P5 | new |
| `permille.ts`, `rng.ts`, `compare.ts`, `rules.ts`, `scenario.ts`, `directive.ts` (types) | — | maths, streams, ordering, tunables, pack validation | `scenario.ts` gains the graph and situation validators | survive |

**Proposed day tick** (each phase declares its reads and writes):

1. Apply the commands stamped for today, validated, with rejections logged.
2. Deliver due messages into seat knowledge.
3. Movement executes.
4. Combat resolves contacts that operations attack.
5. The control writer applies flips and marks the control index and supply dirty.
6. Operations advance their per-axis lifecycles.
7. Weekly: economy, recruitment, people politics, bloc drift.
8. Situations evaluate their cause predicates.
9. Checkpoints (the election) and the verdict.
10. The invariant barrier.
11. Decision-point detection, which emits the auto-pause signal.

The wall clock, the speed setting and pause all live in the shell. The kernel never sees time, only commands stamped with days.

**[I] Seat think-time.** Treat an LLM seat's thinking time as in-game courier latency.
- The kernel stamps each request with the in-game day its answer is due.
- If the model has not answered by that day, the shell auto-pauses with "awaiting dispatch".
- The command applies on its stamped day whatever the wall clock did, so replay is exact.
- This replaces AWWV's async pause inside the pipeline (M4).

**Open questions this map does not settle:**
- Which of a person's choices are kernel mechanics fixed by state (0007), and which are seat choices made within kernel-validated bounds? An LLM filling McClellan's seat forces the answer.
- Should rule-based seats be logged like every other seat? I recommend yes, so that old replays survive changes to seat code.

## 5. Findings outside my scope

Ranked, most important first.

1. **LLM players were AWWV's best engine-health instrument.**
   - Three API-driven commanders played 40 weeks and filed 321 typed observations: severity, expected against actual, and the affected system (`process.md:369-373`).
   - The team then adopted "AI commander observations as the primary engine health metric", ahead of the calibration percentage (`sectors.md:61-65`).
   - Mandate's seat layer makes this nearly free. Build an "observation" output for LLM seats and a harness that counts observations across seeds, alongside the first LLM seat rather than later.

2. **Author the map; keep a provenance and licence file.**
   - AWWV's map is a long derived pipeline: tessellation, clustering, contact graph, then many coupled artifacts (`docs/20_engineering/GENERATED_ARTIFACT_OWNERSHIP.md:41`).
   - The three PMTiles packages have "no repo-local owner command" (:43-45).
   - AWWV's `osm.pmtiles` derives from OpenStreetMap through Protomaps (:44). OSM data is ODbL-licensed (general knowledge, not checked here), which brings attribution and share-alike duties.
   - Mandate should:
     - hand-author regions and typed edges with a small editor;
     - keep one build command;
     - record the source and licence of every geographic input. US government works such as the Official Records are generally public domain **[I]**, but modern historical-GIS datasets of 1860s railways and roads carry their own licences: check each one before using it.

3. **Calibration method, refined.**
   - L5 already rejects cell-level fitting. AWWV's later lessons add what to use instead:
     - "A target should be a count of a named thing" (five of seven targets written another way needed correcting, `calibration.md:594-597`);
     - a control taken from a baseline is invalid if the baseline is the thing under repair (:589-592);
     - record "measured, unattributable at N%" rather than banking the delta (:584-587).
   - Cause-triggered situations need runs long enough to reach their causes (`architecture.md:446-456`). A short run proves nothing about a late situation, and correct non-firing is valid evidence.

4. **The new shape collides with accepted decisions.** By CLAUDE.md rule 2, each needs a superseding record before code:
   - 0001 says every verb targets "a person, post, bloc or patron" and the player "never issues orders to units, forces or places". Setting a goal like "take New Orleans" and editing arrows target places and routes.
   - 0007 (people are deterministic functions of state) against LLM-filled people.
   - 0010 (`advance(state, decisions)` turns) against real time with pause.
   - 0004 (the 1861–62 slice) against a 1861–65 campaign.
   - 0011 (single-player) against future human seats.

5. **Sensitive history needs a placement rule early.**
   - AWWV's ring model: every sensitive feature is modelled with locked consequences, narrated, or refused, with the test "Is this a lever?" (`architecture.md:6-10`).
   - The ACW has its own hard material: slavery and emancipation, massacres of Black soldiers, the draft riots, the wars against Native nations. Decide the ring for each before situations are authored.

6. **Process weight came back despite good intentions.**
   - 2,716 Markdown files; `PROJECT_LEDGER.md` at 11,078 lines; `CALIBRATION_MASTER.md` at 7,077 lines (counted).
   - `DETERMINISM_TEST_MATRIX.md` was meant as a rules-to-gates matrix. Its first 120 lines are now dated run reports.
   - The lessons file contains duplicate entries (hidden BFS caps at `architecture.md:149` and `:410`; silent drops at :155 and :416) and an entry with no header (:18-22).
   - Mandate's rule that git history is the ledger is the defence. Generate any gate matrix from the tests instead of writing it by hand.

7. **The test suite needed infrastructure of its own.**
   - With 1,556 test files, the suite needed balanced worker partitioning (`DETERMINISM_TEST_MATRIX.md:237-249`).
   - Heuristic fast/slow buckets mis-filed tests, so some ran in neither and CI went falsely green (:245-249).
   - Keep one suite that runs everything. Long-run checks (replay, resume, performance, Monte Carlo) go in a separate, named job.

8. **Do not trust agent claims.**
   - "Sub-agent 'wrote file' claims with synthetic verification outputs can be fully hallucinated" (`process.md:90`).
   - "Verify agent edits landed on disk" (:177).
   - "A truncated grep is an incomplete search presented as a complete one" (:39).
   - Mandate is agent-built: the parent checks results on disk.

9. **Event-throughput caps break causal chains.**
   - `MAX_EVENTS_PER_TURN=3` let an unrelated pipeline change crowd out one event. Its flag then never fired, and three downstream events failed with it (`events.md:16-20`).
   - Mandate's auto-pause and situation queue should defer, never drop.

10. **Grep proves a line exists, not that control reaches it.**
    - AWWV re-violated this twice: once with a guard that could never be reached, once with a dead module written up as a fatal blocker (`architecture.md:471-489`).
    - Pair every "this blocks X" claim with a positive control: break the code and see what breaks.
