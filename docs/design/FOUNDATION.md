# Foundation design: the game's shape and the kernel's architecture

Status: proposed (2026-11-14), written by the lead from the owner's brainstorm decisions and four research notes. Decision records 0015–0023 accept its parts; until a record accepts a part, it is a proposal (canon precedence in `CLAUDE.md`). It replaces the M1/M2 kernel described in `KERNEL.md` and the coarse theatre of proposal P13.

Sources:
- the owner's answers in the 2026-11-14 brainstorm (recorded in 0015–0023);
- `docs/research/2026-11-14-civil-war-games.md` (games survey);
- `docs/research/2026-11-14-awwv-architecture-lessons.md` (AWWV architecture);
- `docs/research/2026-11-14-ai-players.md` (AI players);
- `docs/research/2026-11-14-union-command-and-promotion.md` (history of Union command);
- AWWV's founding brief for this project (operating model in `docs/LANES.md`; engineering foundations in section 11 below).

## 1. The game in one paragraph

You are Lincoln, from 1861 to 1865. You cannot move a division. You set goals for your commanders, and each drafts a plan that appears on the map as arrows. You approve it, send it back, or redraw the arrows yourself, and every redraw is a counter-order he can resent. You move divisions between commanders, which is a political act. You never see the truth about your own armies: you see what your generals report, what your observers write, and what the newspapers print. Generals gain and lose nerve and fame, leak to friendly papers, and may run against you. Your mandate is a clock as real as the front: lose the 1864 election and the war ends in a negotiated peace.

## 2. What is ours, and what isn't

The games survey found that the premise itself is not new. *No Greater Glory* (SSI, 1991) made the player Lincoln, with a cabinet, Congress, governors, seniority claims, generals who decide whether to obey and a losable 1864 election. AGEoD, For the People and Grigsby already price sackings by political weight; Grand Tactician already has feuds that delay or alter orders, and cautious commanders who overestimate the enemy.

What no surveyed game does, and Mandate must do well:
1. Generals who lie about themselves: inflating a victory, hiding losses, claiming obedience while slow-walking, blaming a rival.
2. No ground truth about your own forces; a staff map drawn from dated, sourced, fading reports (0013).
3. Pushback that is caused, readable and negotiable: a counter-proposal, conditions, bargaining, never a hidden roll.
4. Generals as political competitors over time: leaks, going to Congress, running in 1864.
5. An escalation ladder from slow-walking to public defiance (P5).
6. Memory between the leader and each general: promises, grievances, trust.
7. No unit verbs at all (0001, refined by 0016).

The two warnings from the closest precedents bind the design:
- *No Greater Glory*'s players spent "about 60–80% of the game" on command reassignment and slow transport. **Every verb in Mandate must be cheaper to operate than those order screens.**
- AGEoD's players switch unexplained obedience rolls off. **Every refusal comes with a reason.**

## 3. Settled shape

| Area | Settled | Record |
|---|---|---|
| Setting and scope | The American Civil War, 1861–65; you play Lincoln. Union first; the Confederacy later on the same machinery. The engine's promise narrows from "every era" to "wars with fronts"; packs remain the architecture. | 0018 |
| Core | Pushback is the point. Every plan must survive the people carrying it out. | 0001 (kept) |
| Operations | Goal, then the commander's plan as arrows, then your review: approve, send back, or edit the arrows at a cost. | 0016 |
| Forces | You transfer divisions between commanders; commanders decide where divisions stand. | 0016 |
| People | Stats and traits that change with battle; you see your staff's assessment, not the truth; true stats drawn per game around the record ("history's shadow"); an officer pool of real and invented men. | 0020 |
| Seats | Every person is a seat filled by the rules model, an AI model, or later a human. Rules first; fully playable offline. Lincoln's seat first, "play a general" second, multiplayer third. | 0015 |
| AI | The engine decides, the model voices. AI text is never state. | 0022 |
| Time | Real time with pause on a daily tick; the game pauses itself when something needs you. About 15–25 hours for a full campaign. | 0017 |
| Map | Irregular regions in the hundreds, over a graph of typed road, rail, river and sea links; fronts and pockets derived from control. | 0019 |
| Home front | A light war economy run through people; elections; history as situations triggered by causes; losing 1864 ends the game. | 0023 |
| Sensitive history | A written gate; no Lost Cause framing; enslaved people as agents of their own freedom. | 0021 |
| Licence | PolyForm Noncommercial 1.0.0. | 0014 |

Accepted features from the brainstorm: finding your Grant (0020); the night of the battle (section 9); going to see for yourself (section 6); the reckoning (section 6); leaks (section 7); joint army–navy operations (section 5). The general who runs against you in 1864 was proposed and not objected to (section 7).

## 4. Map and space

The games survey compared hexes, AGEoD-style regions, point-to-point graphs and free movement, and recommends regions on top of a typed graph. AWWV's polygon-derived adjacency produced phantom fronts and dropped real links, so the graph is authored, not derived from geometry.

- **Regions.** Irregular, drawn to real terrain, numbering in the hundreds (AGEoD's 3,000+ is the commonest complaint). Navigable rivers and sea lanes can be their own regions. Each region has terrain, population, loyalty and a supply value.
- **Edges.** Typed links between regions: road, rail, river, sea. Each has a length in days for a division and a capacity. Railways are edges, not region attributes, so "cut the line at the junction" is a real thing.
- **Depots and sources.** Supply sources (states' rail hubs, ports) and depots sit on regions.
- **Control** is a permille per faction per region, not a flag, so fronts are soft. Thresholds start from AGEoD's tested values: a faction needs at least 250‰ control of a region to trace supply or rail through it, and an army cannot retreat into a region where it holds under 50‰. Both are pack-tunable.
- **Fronts** are derived, never saved: a front is the set of contact edges between regions where opposing control meets. **Pockets** are derived too: a friendly component with no supply path to a source. Divisions belong to commanders, never to fronts (AWWV's costliest mistake was saving front sectors).
- **Supply** is a path with capacity from a source, traced along friendly edges, readable by the player as "the line to Nashville is open / cut at X". Rail capacity is allocated in priority order, not by maximum flow.
- **Provenance.** Every geographic source carries a provenance and licence entry in its pack. Third-party data is committed only when its licence allows it (0014).

The staff map (0013) draws regions, fronts and arrows from the player's knowledge, never from truth.

## 5. Forces, command, goals and plans

**Forces.** A division has a strength, a region, a commander's post, experience, morale and equipment. There is no corps level in the first version: divisions sit directly under an army or department commander. A chain of command (corps commanders as seats who relay and filter) is a later dial, not a foundation.

**Command.** Posts (armies, departments, governorships, cabinet offices, the navy's squadrons) hold people and assets (P1). The player's command verbs:

| Verb | Targets | Notes |
|---|---|---|
| Appoint, relieve, promote | a person and a post | Relief has modes with different costs: to a quiet department, "at his own request", outright. Promotion over seniors costs standing; a nomination can lapse at the Senate's session end. |
| Transfer divisions | from one commander to another | The stripped commander resents it; his friends in Congress notice. |
| Set a goal | a commander | Objective (a region, a force or a line), posture, risk, deadline, permissions (rail, river, sea), and the divisions committed. |
| Review a plan | a commander's draft | Approve, send back with notes, or edit the arrows. |
| Audience | a commander, before or during | Hear him out; offer counters (P3, M2's typed counters). |
| Visit | an army | Days away from Washington; see the true state of that army; your counters there weigh more. |
| Send an observer | a person to a commander's headquarters | The observer is an office-holder with bias who reports to whoever sent him. |
| Honour, promise, pressure, address | people and blocs | As in M2. |

**Goals and plans.** A goal goes to a commander; his seat drafts a **plan**: one or more axes, each with assigned divisions, a route along graph edges, phases with timings, and requests for support from other posts (a fleet, a neighbouring army, rail capacity). The plan reflects who he is: a cautious man's plan is slow and asks for more; an aggressive man's outruns his supply.

The plan appears as arrows. The player can:
- **approve** it as drafted;
- **send it back** with notes, which the commander reads like any order (`reading.ts`);
- **edit the arrows**: move an axis, change a timing, add a pincer. Each edit is a counter-order. It passes through the commander's compliance like any directive, and the further it departs from his own judgement, the more likely he complies with reservations, slow-walks, reinterprets or objects (0007, P2).

**Joint operations.** A support request to another post (the navy's squadron, a neighbouring department) is a directive to that holder, who answers with his own compliance. An encirclement is two commanders' arrows meeting, so it fails for human reasons as well as geographic ones.

**Execution.** An approved plan becomes an operation with a lifecycle per axis. `movement.ts` is the only writer of a division's location; `combat.ts` resolves contacts; reports go back through the commander, shaded by who he is (0008, P4).

**Cost of operating.** The default path must take seconds: the commander's draft is usually good enough to approve, and the interface shows his reasons inline. Editing arrows is for when you care.

## 6. People

- **True stats** (hidden): competence, nerve, experience, plus innate traits (some hidden until circumstances reveal them). Drawn once per game from a range centred on the historical record (history's shadow), from a seeded stream at setup. Setup options: history's shadow (default), as history, unknown men.
- **Public standing** moves with the newspapers and the blocs, not with the truth. **Reputation and nerve are separate**: the history lane found that victory does not reliably make generals bolder, nor defeat more cautious, so a general's traits decide how a result moves him.
- **Earned traits** come from what happens: a string of wins, a rout, the love of his men, a quarrel with the navy.
- **Assessment.** The player sees his staff's assessment of each general, built from independent sources (the general's own reports, observers, newspapers, rivals' gossip, West Point reputation), each with its own bias. It converges on the truth as the general fights, fastest with independent sources. Memoirs and self-reports are weak evidence.
- **The officer pool.** Below general rank: real junior officers whose rise is not guaranteed, and invented ones with plausible names, hometowns and backgrounds, checked against rosters so none is a real person. They surface as mentions in battle reports and in observers' letters. Credit can be stolen by a superior's report.
- **Compliance** stays the deterministic machinery from M1/M2 (willingness from values, temperament, regard, deterrence, capacity, disposition, grievances; declared versus actual rungs; true versus stated reasons). It is recast from single directives to goals, plans and edits.
- **The reckoning.** After each major battle (optional) and at campaign end, the game shows what you were told against what happened.

## 7. Politics, the press and the home front

- **Blocs** with weights and support, as in M2; the mandate derived from them.
- **Elections.** The 1862 midterms and the 1864 presidential election are checkpoints. Losing 1864 ends the game with a negotiated peace.
- **Generals as political actors.** Standing breeds rivals (P6). A popular general, or a sacked martyr, can court the opposition, leak, appeal to Congress, and be drawn as the 1864 opponent.
- **The press.** A weekly front page shows what the public believes. Generals leak to friendly papers (the history lane found McClellan's friends did; whether he did himself is unsourced); the player can leak too. Belief drives the blocs.
- **Economy.** Four resources: money, men, munitions, rail capacity. Each lever has a holder who can stall: the treasury raises money, governors raise regiments, the War Department turns munitions into equipped divisions. The player sets priorities and picks people.
- **Situations.** Historical pressures arrive when their causes are present, not on dates (P15). Each situation is pack data: a cause predicate, options, consequences, and, per AWWV's lesson, a **historical default and a staff recommendation** so unattended history runs can play it. A test enforces both fields.
- **Foreign powers.** Britain and France are pressure clocks driven by the blockade, victories and emancipation, worked through the Secretary of State's seat, not playable factions.
- **Border states.** Contested regions whose governors and legislatures are seats with loyalties of their own.
- **Enslaved people** are agents of their own freedom, never a resource either side manages: self-emancipation toward Union lines, the effect of policy (the confiscation acts, the Emancipation Proclamation), and Black regiments. This sits under the sensitive-history gate (0021).

## 8. Seats, knowledge and voice

- **A seat** is whoever decides for a person: the rules model, an AI model, or later a human. Every seat receives a request built only from what that person may know, plus the kernel's menu of legal responses, and returns a typed response. One set of decision types serves all three kinds of seat.
- **The rules model is always there.** An AI seat wraps a rule seat and falls back to it on timeout, invalid output, a failed consistency check or no key, logging the fallback.
- **What an AI may decide.** A principal's choices (the opposing president's decisions, from the same legal set as the player's), and a choice among options the kernel has already judged equally consistent with a person's state. Compliance itself never moves to the AI: the kernel decides what a general actually does and what he says he does. The AI writes the words from what he declared and chose to state, never from what he will actually do, so it cannot leak a lie (0022).
- **Knowledge per seat.** Each seat stores the reports that reached it, with latency (courier, telegraph). Beliefs are derived on read. `viewFor(state, seatId)` generalises today's per-faction view (0011 is superseded by 0015).
- **Think time is courier latency.** An AI seat's request is stamped with the in-game day its answer is due; if the model has not answered by then, the shell pauses with "awaiting dispatch". The answer applies on its stamped day whatever the wall clock did, so replays are exact.
- **The player-visible boundary is built in Phase 0**, before any generated text exists. True reasons in a response are reachable only through the truth layer, and an architecture test proves the view layer and the AI caller cannot import it.

## 9. Time

- The kernel ticks one day at a time and never sees the wall clock. Speed, pause and the auto-pause rules live in the shell.
- The day tick returns a decision-point signal (an objection arrived, a battle report, a pocket closed, a situation fired, a seat is awaiting dispatch); the shell pauses on it according to the player's settings.
- **The night of the battle.** Battles may last several days; each day of battle is resolved in the day tick, and also emits that day's dispatches stamped by hour. The shell slows time and releases them hour by hour: fragments, contradictions, silence. Orders the player wires during the battle are commands stamped for when they would arrive. The kernel stays daily.
- **Performance budget.** A headless full campaign (about 1,460 days) must run in under a minute on the reference machine, so a day tick costs under about 40 ms. AWWV's weekly turn took about 1.6 s. Derived indexes (control, fronts, supply) are recomputed only when control changes.

## 10. Kernel architecture

Three layers:
- **World**: static pack data (regions, edges, people's historical records, situations). Immutable, hashed, never saved; a save references it by hash.
- **State**: mutable truth. Saved.
- **Derived**: pure functions of World and State, memoised, never saved.

The **command log** sits beside State and is the truth about what happened: replay and resume run from it, and resuming from a save must equal the continuous run (AWWV's resumed games drifted by 616 differences).

Module map, adapted from the AWWV-architecture note:

| Module | Layer | Owns |
|---|---|---|
| `world/graph` | World | regions, typed edges, capacities, depots, terrain |
| `control` | State | the control map; the only writer of control changes |
| `control-index` | Derived | contact edges, fronts, pockets, components |
| `supply` | Derived | supply paths with capacity from sources |
| `forces` | State | divisions; location written only by `movement` |
| `command` | State | people in posts; division-to-commander assignment |
| `plans` | State | goals, drafts, approvals, edits as counter-orders |
| `operations` | State | approved plans in execution, per-axis lifecycles |
| `movement` | writer | the only writer of location |
| `combat` | writer | battle resolution with breakdowns and named seeded streams |
| `people`, `compliance`, `reading`, `audience`, `proxy`, `ladder` | State writers | the M1/M2 people core, recast for goals and plans |
| `knowledge` | State | per-seat reports with latency |
| `view` | Derived | `viewFor(state, seatId)` |
| `seats` | State | who drives each person; command validation (drivers live outside the kernel) |
| `economy` | State | money, men, munitions, rail capacity at their holders |
| `situations` | State | cause predicates, offers, decisions |
| `politics` | State + Derived | blocs, mandate, elections, verdict |
| `tick` | — | the fixed day order and the decision-point signal |
| `log`, `serialize` | — | command log, snapshots, replay, canonical JSON, state hash |
| `invariants` | — | post-tick assertions with typed failures |

The day tick, each phase declaring what it reads and writes:
1. Apply the commands stamped for today, validated; rejections logged.
2. Deliver due messages into seat knowledge.
3. Movement.
4. Combat.
5. Control changes; mark derived indexes dirty.
6. Operations advance.
7. Weekly: economy, recruitment, people's politics, bloc drift.
8. Situations evaluate their causes.
9. Checkpoints and the verdict.
10. The invariant barrier.
11. Decision-point detection.

**What survives from today's kernel:** `permille`, `rng`, `compare`, `rules`, scenario validation, and the people core (`people`, `compliance`, `reading`, `audience`, `proxy`, `ladder`), recast. `view` survives, generalised to seats. `theatre` and `turn` are replaced; `bot` becomes a rule seat outside the kernel. The Union pack is rebuilt for the new world format; its people data and research carry over.

## 11. Engineering foundations (from AWWV's founding brief)

Built in Phase 0, before gameplay code, because AWWV's pain came from foundations added late:

1. **Determinism.** Seeded streams passed explicitly; the banned-API test extended to every kernel folder; every comparator has an explicit id tie-break; canonical serialization and a **state hash every tick**; a test runs the same scenario twice, and CI runs it on Linux and Windows and compares hashes.
2. **One owner of state.** A versioned save schema with migrations and save-compatibility tests from the first save; saves written atomically (temporary file, then rename).
3. **Typed IDs.** One namespace per kind (region, edge, person, post, division, situation). A lookup with an unknown ID throws; it never defaults to zero or empty.
4. **One writer per field**, enforced by an architecture test that lists every writer of each state field.
5. **Liveness telemetry.** Every mechanic counts how often it fires and how much it changes; a health-gate test asserts each fires within a plausible band in a reference run. A dead mechanic is a bug even when the scores look good.
6. **A headless runner** that outputs the final hash, a per-day summary, mechanic liveness and checkpoint scores, in short and full-length modes. A history run (every seat on the rules model with historical defaults) is also the calibration harness.
7. **Derived data from scripts.** Map graphs and orders of battle are generated by deterministic scripts from pack sources; CI fails if committed generated data is stale.
8. **Runs write only to the ignored `runs/` folder**, outside folders agents search.
9. **Honest CI** on GitHub Actions: it lists the steps that actually ran.
10. **The verb list is the interface.** An architecture test asserts the app's commands match the kernel's verb list exactly, so no screen can order a division (AWWV's shell let unit orders back in).
11. **Export and reuse; never copy a function** (a copy is a second owner).

Simulation discipline, kept from AWWV's lessons:
- Emergent, not railroads: no scripted captures and no "X falls on date Y". A railroad we cannot avoid is labelled in code and docs.
- Fix mechanics before calibrating; legitimate levers only (sourced data corrections before engine knobs); one change per measured run.
- Calibration targets are bands and counts of named things, not single-region flips; late-war checkpoints are chaotic.
- Check that every rule seat can do its historical job.

## 12. Phase 0 plan

Done when: **a headless history run of 1861–62 on the new kernel completes, gives the same state hash on Linux and Windows, passes the liveness gate, and the existing people tests pass on the recast core.** The full war (to 1865) and the desk come after Phase 0.

Lanes, in order. Each is sized from `docs/LANES.md`.

| # | Lane | Depends on | Size |
|---|---|---|---|
| 0.1 | Engineering foundations: CI on Linux and Windows, `runs/`, typed IDs, canonical serialization and state hash, save schema with atomic writes, one-writer and verb-list architecture tests, liveness counters | — | Opus, high (determinism) |
| 0.2 | World format v2: regions, typed edges, depots, provenance; validator; generator script; staleness check | 0.1 | Opus, high |
| 0.3 | Union map data for 1861–62: regions and edges from sources, with provenance and licences | 0.2's format | Sonnet, high (data from sources) |
| 0.4 | Control, fronts, pockets and supply as derived indexes, with invariants and a performance test | 0.2 | Opus, high |
| 0.5 | Forces, command, transfers and movement | 0.1, 0.4 | Opus, high |
| 0.6 | Seats, knowledge per seat, the player-visible boundary, the command log and replay; `bot` as a rule seat | 0.1 | Opus, high |
| 0.7 | Goals, plans and operations, with compliance recast for plans and edits | 0.5, 0.6 | Opus, high |
| 0.8 | Situations schema with historical default and staff recommendation, enforced by test | 0.1 | Sonnet, high |
| 0.9 | Headless history runner with liveness and checkpoints; the Phase 0 done check | 0.3–0.8 | Sonnet, high |

Parallelism: 0.1 first. Then 0.2 and 0.6 and 0.8 in parallel (0.3's source research can start alongside). Then 0.4, then 0.5, then 0.7, then 0.9. At most two lanes move the simulation at once (`docs/LANES.md`). Each simulation lane gets a separate reviewer lane.

## 13. Open after this design

- The first pack's exact region count and boundaries (lane 0.3).
- Hour-level battle presentation details (with the desk, after Phase 0).
- Which situations ship first, under the sensitive-history gate.
- The officer generator's name sources (the history note lists candidates).
- Setup options beyond the three history modes.
