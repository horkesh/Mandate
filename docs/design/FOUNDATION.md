# Foundation design: the game's shape and the kernel's architecture

Status: proposed (2026-11-14), written by the lead from the owner's brainstorm decisions and four research notes, then revised after an independent review (verdict "ready after fixes"; fixes in 0024–0026). Decision records 0015–0026 accept its parts; until a record accepts a part, it is a proposal (canon precedence in `CLAUDE.md`). It replaces the M1/M2 kernel described in `KERNEL.md` and the coarse theatre of proposal P13.

Sources:
- the owner's answers in the 2026-11-14 brainstorm (recorded in 0015–0023);
- `docs/research/2026-11-14-civil-war-games.md` (games survey);
- `docs/research/2026-11-14-awwv-architecture-lessons.md` (AWWV architecture);
- `docs/research/2026-11-14-ai-players.md` (AI players);
- `docs/research/2026-11-14-union-command-and-promotion.md` (history of Union command);
- AWWV's founding brief for this project (operating model in `docs/LANES.md`; engineering foundations in section 11 below).

## 1. The game in one paragraph

You are Lincoln, from 1861 to 1865. You cannot move a division. You set goals for your commanders, and each drafts a plan that appears on the map as arrows. You approve it, send it back, or redraw the arrows yourself, and every redraw is a counter-order he can resent. You move divisions between commanders, which is a political act. You never see the truth about your own armies: you see what your generals report, what your observers write, and what the newspapers print. Generals gain and lose nerve and fame, leak to friendly papers, and may run against you. Your mandate is a clock as real as the front: lose the 1864 election and the game ends: the electorate has rejected the war.

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
| Time | Variable turns of up to a week on a daily tick; a turn ends early when something needs you. About 15–25 hours for a full campaign. | 0027 (superseding 0017) |
| Map | Irregular regions in the hundreds, over a graph of typed road, rail, river and sea links; fronts and pockets derived from control. | 0019 |
| Home front | A light war economy run through people; elections; history as situations triggered by causes; losing 1864 ends the game. | 0023 |
| Sensitive history | A written gate; no Lost Cause framing; enslaved people as agents of their own freedom. | 0021 |
| Licence | PolyForm Noncommercial 1.0.0. | 0014 |
| Engine test | A mechanism is engine code if it makes sense in any war with fronts and works on the testbed pack. | 0024 |
| Attention | Lincoln's attention is a weekly budget; approving a good draft is free. | 0025 |
| Review fixes | Kernel-drafted plans, a limited edit grammar, corps as posts, promotion lists, kernel-owned latency, visits that aren't truth, gate scope. | 0026 |
| Start, victory, navy | The campaign starts at the March 1861 inauguration; two national wills decide it; the navy works through people. | 0028 |
| Seasons, sieges, raids | Weather through commanders; sieges as operations; raids and insurgency under the gate; a Confederacy on the same machinery. | 0029 |
| Commitments | Scenario starts, packs as the modding format, string tables, playable at every phase, a planner spike. | 0030 |
| Map extent and sources | The whole war at about 250 regions; Newberry boundaries, traced rail, Natural Earth and USGS; provenance per pack. | 0031 |
| Reports | Typed reports with authors, routes and filters; the telegraph office as a seat. | 0032 |
| Forces and data | Transfers name a force; force blocks fit 1861; public-domain data only. | 0033 |
| Stack | PixiJS for the map with a tripwire spike; React, Electron, Zod, ICU strings, fast-check. | 0035 |

Accepted features from the brainstorm: finding your Grant (0020); the night of the battle (section 9); going to see for yourself (section 6); the reckoning (section 6); leaks (section 7); joint army–navy operations (section 5). The general who runs against you in 1864 was proposed and not objected to (section 7).

## 4. Map and space

The games survey compared hexes, AGEoD-style regions, point-to-point graphs and free movement, and recommends regions on top of a typed graph. AWWV's polygon-derived adjacency produced phantom fronts and dropped real links, so the graph is authored, not derived from geometry.

- **Extent, size and sources** are set by 0031: the whole war at full resolution from southern Pennsylvania to the Gulf and the Atlantic to eastern Texas, coarse regions at the western and northern edges, off-map boxes beyond; about 250 regions including 25–40 key points; boundaries from the Newberry atlas, rail traced from public-domain Library of Congress maps, rivers and terrain from Natural Earth and USGS, with a provenance file per pack.
- **Regions.** Irregular, drawn to real terrain, numbering in the hundreds (AGEoD's 3,000+ is the commonest complaint). Navigable rivers and sea lanes can be their own regions. A region's terrain and starting values are World data; its population, loyalty and supply value change during play and are State (section 10).
- **Edges.** Typed links between regions: road, rail, river, sea. Each has a length in days for a division and a capacity (World). Railways are edges, not region attributes, so "cut the line at the junction" is a real thing: an edge's **condition** (damaged, repaired) is State with one writer.
- **Depots and sources.** Supply sources (states' rail hubs, ports) and depots sit on regions.
- **Control** is a permille per faction per region, not a flag, so fronts are soft. Thresholds start from AGEoD's tested values: a faction needs at least 250‰ control of a region to trace supply or rail through it, and an army cannot retreat into a region where it holds under 50‰. Both are pack-tunable.
- **Fronts** are derived, never saved: a front is the set of contact edges between regions where opposing control meets. **Pockets** are derived too: a friendly component with no supply path to a source. Divisions belong to commanders, never to fronts (AWWV's costliest mistake was saving front sectors).
- **Supply** is a path with capacity from a source, traced along friendly edges, readable by the player as "the line to Nashville is open / cut at X". Rail capacity is allocated in priority order, not by maximum flow.
- **Provenance.** Every geographic source carries a provenance and licence entry in its pack. Third-party data is committed only when its licence allows it (0014).

The staff map (0013) draws regions, fronts and arrows from the player's knowledge, never from truth.

## 5. Forces, command, goals and plans

**Forces.** A division has a strength, a region, a commander's post, experience, morale and equipment. **Corps are posts that hold people** (Lincoln imposed corps on the Army of the Potomac in March 1862, per the Union dossier, so appointing corps commanders is a real lever), but they have no relay mechanic yet: the army commander assigns divisions to corps and axes. A chain of command in which corps commanders relay and filter orders is a later dial (0026).

**Command.** Posts (armies, departments, governorships, cabinet offices, the navy's squadrons) hold people and assets (P1). The player's command verbs:

| Verb | Targets | Notes |
|---|---|---|
| Appoint, relieve, promote | a person and a post | Relief has modes with different costs: to a quiet department, "at his own request", outright. Promotions arrive as lists from superiors and the War Department, which the player approves, amends or overrides; overriding or promoting over seniors costs standing; a nomination can lapse at the Senate's session end (0026). |
| Transfer a force | from one army or department to another | Name the two commanders and a force (a number of divisions, a corps, or a strength in men); the sending commander picks which units go (0033). The stripped commander resents it; his friends in Congress notice. Inside an army, the commander assigns. |
| Set a goal | a commander | Objective (a region, a force or a line), posture, risk, deadline, permissions (rail, river, sea), and the divisions committed. |
| Review a plan | a commander's draft | Approve, send back with notes, or edit the arrows. |
| Audience | a commander, before or during | Hear him out; offer counters (P3, M2's typed counters). |
| Visit | an army | Days away from Washington, while the cabinet's and Congress's business resolves by default (0025). You get several independent first-hand reports from the army's officers: better than dispatches, **not the truth** (0026). Your counters there weigh more. |
| Send an observer | a person to a commander's headquarters | The observer is an office-holder with bias who reports to whoever sent him. |
| Honour, promise, pressure, address | people and blocs | As in M2. |

**Goals and plans.** A goal goes to a commander. **The kernel's planner drafts candidate plans** deterministically from the goal, the commander's stats and traits, his forces and the map; his seat selects one, adjusts it within kernel bounds and annotates it (0026). A plan has one or more axes, each with assigned divisions, a route along graph edges, phases with timings, and requests for support from other posts (a fleet, a neighbouring army, rail capacity). The candidates reflect who he is: a cautious man's are slow and ask for more; an aggressive man's outrun his supply. Plans are drafted on request, never every tick.

The plan appears as arrows. The player can:
- **approve** it as drafted (free: 0025);
- **send it back** with notes, which the commander reads like any order (`reading`);
- **edit the arrows**, within a limited grammar: an axis's objective, its waypoint regions, its timing, and adding or removing an axis with an objective. The commander assigns divisions to axes; the player can ask for a force size. Each edit is a counter-order. It passes through the commander's compliance like any directive, and the further it departs from his own judgement, the more likely he complies with reservations, slow-walks, reinterprets or objects (0007, P2).

**Joint operations.** A support request to another post (the navy's squadron, a neighbouring department) is a directive to that holder, who answers with his own compliance. An encirclement is two commanders' arrows meeting, so it fails for human reasons as well as geographic ones.

**Execution.** An approved plan becomes an operation with a lifecycle per axis. `movement.ts` is the only writer of a division's location; `combat.ts` resolves contacts; reports come back through the commander, shaded by who he is (0008, P4), and through other routes (the press, governors, observers, the telegraph office), each with its own author and filters (0032).

**Cost of operating.** The default path must take seconds: the commander's draft is usually good enough to approve, and the interface shows his reasons inline. Editing arrows is for when you care.

## 6. People

- **True stats** (hidden): competence, nerve, experience, plus innate traits (some hidden until circumstances reveal them). Drawn once per game from a range centred on the historical record (history's shadow), from a seeded stream at setup. Each real person's centre cites its sources in the pack, and the validator rejects a centre without a citation (0005, 0026). Setup options: history's shadow (default), as history, unknown men.
- **Public standing** moves with the newspapers and the blocs, not with the truth. **Reputation and nerve are separate**: the history lane found that victory does not reliably make generals bolder, nor defeat more cautious, so a general's traits decide how a result moves him.
- **Earned traits** come from what happens: a string of wins, a rout, the love of his men, a quarrel with the navy.
- **Assessment.** The player sees his staff's assessment of each general, built from independent sources (the general's own reports, observers, newspapers, rivals' gossip, West Point reputation), each with its own bias. It converges on the truth as the general fights, fastest with independent sources. Memoirs and self-reports are weak evidence.
- **The officer pool.** Below general rank: real junior officers whose rise is not guaranteed, and invented ones with plausible names, hometowns and backgrounds, checked against rosters so none is a real person. They surface as mentions in battle reports and in observers' letters. Credit can be stolen by a superior's report.
- **Compliance** stays the deterministic machinery from M1/M2 (willingness from values, temperament, regard, deterrence, capacity, disposition, grievances; declared versus actual rungs; true versus stated reasons). It is recast from single directives to goals, plans and edits.
- **The reckoning.** After each major battle (optional) and at campaign end, the game shows what you were told against what happened.

## 7. Politics, the press and the home front

- **Blocs** with weights and support, as in M2; the mandate derived from them.
- **Elections.** The 1862 midterms and the 1864 presidential election are checkpoints. Losing 1864 ends the game with a verdict: the electorate has rejected the war. The game makes no claim about what the winner would have done, and the months before the March 1865 inauguration are not played (0026).
- **Generals as political actors.** Standing breeds rivals (P6). A popular general, or a sacked martyr, can court the opposition, leak, appeal to Congress, and be drawn as the opposition's 1864 candidate (0026).
- **The press.** A weekly front page shows what the public believes. Generals leak to friendly papers (the history lane found McClellan's friends did; whether he did himself is unsourced); the player can leak too. Belief drives the blocs.
- **Economy.** Four resources: money, men, munitions, rail capacity. Each lever has a holder who can stall: the treasury raises money, governors raise regiments, the War Department turns munitions into equipped divisions. The player sets priorities and picks people.
- **Situations.** Historical pressures arrive when their causes are present, not on dates (P15). Each situation is pack data: a cause predicate, options, consequences, and, per AWWV's lesson, a **historical default and a staff recommendation** so unattended history runs can play it. A test enforces both fields.
- **Foreign powers.** Britain and France are pressure clocks driven by the blockade, victories and emancipation, worked through the Secretary of State's seat, not playable factions.
- **Border states.** Contested regions whose governors and legislatures are seats with loyalties of their own.
- **Enslaved people** are agents of their own freedom, never a resource either side manages: self-emancipation toward Union lines, and the effect of policy (the confiscation acts, the Emancipation Proclamation). **Black regiments** come from the enlistment choices of free Black men and freedpeople responding to policy, not from a pool in the "men" resource (0026). This sits under the sensitive-history gate (0021), which also covers the wars against Native nations (the Dakota War of 1862 falls inside the first slice), the draft riots and civil liberties. Every sensitive feature is placed before it is authored: modelled with locked consequences, narrated only, or refused. The test is "Is this a lever?"

## 8. Seats, knowledge and voice

- **A seat** is whoever decides for a person: the rules model, an AI model, or later a human. Every seat receives a request built only from what that person may know, plus the kernel's menu of legal responses, and returns a typed response. One set of decision types serves all three kinds of seat.
- **The rules model is always there.** An AI seat wraps a rule seat and falls back to it on timeout, invalid output, a failed consistency check or no key, logging the fallback.
- **What an AI may decide.** A principal's choices (the opposing president's decisions, from the same legal set as the player's), and a choice among options the kernel has already judged equally consistent with a person's state, such as which of the planner's candidate plans a commander picks. Compliance itself never moves to the AI: the kernel decides what a general actually does and what he says he does. The AI writes the words from what he declared and chose to state, never from what he will actually do, so it cannot leak a lie (0022).
- **Reports** are typed data with an author, a route, filters and bias terms (0032). Not every report comes through the commander: governors, the Navy Department, the press, observers and informal sources have their own routes, and the War Department's telegraph office is a filtering seat the president can go around at an attention cost.
- **Knowledge per seat.** Each seat stores the reports that reached it, with latency (courier, telegraph). Beliefs are derived on read. Faded reports are pruned by a pack rule (age and supersession), so knowledge does not grow without limit. `viewFor(state, seatId)` generalises today's per-faction view (0011 is superseded by 0015).
- **Rule seats live in their own package**, outside the kernel but inside the banned-API and pack-boundary checks, because their output enters the log.
- **Seats answer at turn boundaries** (0027). An AI seat has until the player ends the turn; if it has not answered, the shell waits ("awaiting dispatch") or falls back to the rule seat. The command log records every answer, so replays are exact.
- **The player-visible boundary is built in Phase 0**, before any generated text exists. True reasons in a response are reachable only through the truth layer, and an architecture test proves the view layer and the AI caller cannot import it.

## 9. Time

- The kernel ticks one day at a time and never sees the wall clock. Turns are the shell's business (0027): a turn runs up to seven days (a pack setting) and ends early on the kernel's decision-point signal.
- The day tick returns a decision-point signal (an objection arrived, a battle report, a pocket closed, a situation fired, a plan is ready for review); the shell ends the turn on it according to the player's settings, shows the turn's days passing as their dispatches arrive, and waits for the player.
- **The kernel owns all latency** (0026). A command applies on the day it is issued and creates a message (an order, a telegram, a courier) that travels along the graph; the recipient's seat acts when it arrives. The shell never computes arrival times.
- **The night of the battle.** Battles may last several days; each day of battle is resolved in the day tick, and also emits that day's dispatches stamped by hour. The shell plays them back hour by hour as a dispatch log: fragments, contradictions, silence. Orders the player wires meanwhile are ordinary commands: they cannot change a day already resolved, and arrive for a later day of the battle or after it. The kernel stays daily.
- **Performance budget.** A headless full campaign (about 1,460 days) must run in under a minute on the reference machine (the owner's Windows development PC until CI hardware is named), so a day tick costs under about 40 ms. AWWV's weekly turn took about 1.6 s. Rules that keep it there:
  - derived indexes (fronts, pockets, supply) are recomputed only when a region's control crosses a threshold (50‰, 250‰), not on every change;
  - plans are drafted on request, never scanned every tick;
  - knowledge is pruned (section 8);
  - the full canonical state hash runs every tick in tests and CI, and at saves and checkpoints in play.

## 10. Kernel architecture

Three layers:
- **World**: static pack data (region terrain and starting values, edges with lengths and capacities, people's historical records with citations, situations). Immutable, hashed, never saved; a save references it by hash.
- **State**: mutable truth, including everything that changes during play (control, region population and loyalty, edge condition, divisions, people, plans, knowledge). Saved.
- **Derived**: pure functions of World and State. Their caches are keyed by a version counter that the owning writer bumps (for example a control version bumped when a threshold is crossed), and live outside State, so no "dirty" flag or cache can be saved.

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
| `planner` | pure function | drafts candidate plans for a goal on request; the drafts are saved as State by `plans` on the request day, because a later call would see a changed map (planner-design note) |
| `infrastructure` | State | edge condition (damage and repair) |
| `tick` | — | the fixed day order and the decision-point signal |
| `log`, `serialize` | — | command log, snapshots, replay, canonical JSON, state hash |
| `invariants` | — | post-tick assertions with typed failures |

**One writer per field.** Other modules propose typed deltas; the owner applies them. This table is the source for the architecture test in section 11.

| State field | Only writer | Proposed by |
|---|---|---|
| region control | `control` | combat, occupation |
| region population, loyalty, supply value | `regions` | economy, situations, occupation |
| edge condition | `infrastructure` | combat, raids, repair orders |
| division location | `movement` | operations |
| division strength, morale, experience, equipment | `forces` | combat, attrition, economy, recruitment |
| division-to-post assignment | `command` | transfers, the army commander's assignments |
| people in posts | `command` | appoint, relieve, promotion lists |
| a person's stats, traits, standing, grievances, regard | `people` | combat results, the press, verbs, ladder |
| a person's ladder rung and rivals | `ladder` | weekly people step |
| responses to orders (declared and actual rungs, reasons) | `proxy` | message arrival; computed by `compliance` and `reading`, which are pure and write nothing |
| audience state | `audience` | the audience verb |
| goals, plans, approvals, edits | `plans` | verbs, seat selections |
| operations and their lifecycles | `operations` | plan approval, movement and combat outcomes |
| knowledge (reports per seat) | `knowledge` | message delivery, pruning |
| messages in transit | `messages` | commands, reports, the kernel's latency rules |
| economy stocks | `economy` | weekly step, verbs |
| situations fired and decided | `situations` | cause evaluation, decisions |
| blocs, mandate, election results | `politics` | weekly step, battles, the press, checkpoints |
| seat assignments | `seats` | setup, the player's settings |

The day tick, each phase declaring what it reads and writes:
1. Apply today's commands, validated; each creates messages in transit (the kernel computes their arrival). Rejections are logged.
2. Deliver messages due today into seat knowledge; recipients' responses are computed on arrival.
3. Movement.
4. Combat.
5. Control changes; bump the control version when a threshold is crossed.
6. Operations advance.
7. Weekly: economy, recruitment, people's politics, bloc drift, attention refill.
8. Situations evaluate their causes.
9. Checkpoints and the verdict.
10. The invariant barrier.
11. Decision-point detection.

**What happens to today's kernel:**
- **Survive as they are:** `permille`, `rng`, `compare`, `rules`, scenario validation.
- **Survive, recast in Phase 1:** the people core (`people`, `compliance`, `reading`, `audience`, `proxy`, `ladder`) for goals, plans and edits; `orders` and `verbs` into the new verb list; `messages` into `knowledge` and messages in transit; `derive` into `politics` and the credibility functions.
- **Generalised:** `view`, to seats.
- **Replaced:** `theatre` and `turn`; `bot` becomes a rule seat in its own package.
- **Tests that must keep passing through Phase 0:** `compliance.test.ts`, `rng.test.ts`, `banned-apis.test.ts` (extended), and the M2 audience tests in `audience.test.ts`. `turn.test.ts`, `testbed-run.test.ts`, `console.test.ts` and the union pack's play test retire with `turn` and `theatre`; `ladder` and `proxy` lose their `theatre` imports in Phase 1.
- The Union pack is rebuilt for the new world format; its people data and research carry over.

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
10. **The verb list is the interface.** An architecture test asserts the app's commands match the kernel's verb list exactly, so no screen can order a division (AWWV's shell let unit orders back in). The edit grammar for arrows (0026) is part of the verb list.
11. **Export and reuse; never copy a function** (a copy is a second owner).
12. **The rule-seat package is checked like the kernel:** banned APIs and the pack boundary apply to it.

Simulation discipline, kept from AWWV's lessons:
- Emergent, not railroads: no scripted captures and no "X falls on date Y". A railroad we cannot avoid is labelled in code and docs.
- Fix mechanics before calibrating; legitimate levers only (sourced data corrections before engine knobs); one change per measured run.
- Calibration targets are bands and counts of named things, not single-region flips; late-war checkpoints are chaotic.
- Check that every rule seat can do its historical job.

## 12. Phase 0 plan

The review found the first draft's done check (a full 1861–62 history run) needed combat, politics, the planner and a people pack that no lane built. Phase 0 is therefore the foundation and the world; Phase 1 is the war machine.

**Phase 0 is done when** a headless run on the new kernel, on the Union 1861 map and order of battle, with rule seats holding standing goals (hold, or advance to a region), moves divisions, changes control through a simple deterministic contest, derives fronts, pockets and supply, and:
- gives the same state hash on Linux and Windows CI;
- resumes from a mid-run save to the same final hash as the continuous run;
- passes the liveness gate for every Phase 0 mechanic;
- keeps the tests named in section 10 passing;
- stays inside the tick budget.

Lanes, sized from `docs/LANES.md`:

| # | Lane | Depends on | Size |
|---|---|---|---|
| 0.1 | Engineering foundations: CI on Linux and Windows, `runs/`, typed IDs, canonical serialization and state hash, save schema with atomic writes, one-writer and verb-list architecture tests, liveness counters, banned-API and boundary checks over the rule-seat package | — | Opus, high |
| 0.2 | World format v2: regions, typed edges, depots, provenance, cited people records; validator; generator script; staleness check; the testbed pack's small graph | 0.1 | Opus, high |
| 0.3 | Union 1861 data: regions and edges, posts, the division-level order of battle, people records carried over, all with provenance and licences | 0.2's format | Sonnet, high |
| 0.4 | Control, fronts, pockets and supply as derived indexes, with invariants and a performance test | 0.2 | Opus, high |
| 0.5 | Forces, command (posts, corps as posts, transfers), movement, infrastructure, and a simple deterministic control contest | 0.4 | Opus, high |
| 0.6 | Seats, knowledge per seat with pruning, messages in transit (kernel-owned latency), the player-visible boundary, the command log and replay; the rule-seat package with standing-goal seats | 0.1 | Opus, high |
| 0.7 | Situations schema with historical default and staff recommendation enforced by test, and the sensitive-history placement checklist | 0.1 | Opus, high |
| 0.8 | Headless runner with liveness, hashes and resume check; the Phase 0 done check | 0.3–0.7 | Sonnet, high |
| 0.9 | Planner spike: design and prototype candidate-plan drafting (including a two-commander pincer and a supply-aware route) on the testbed graph; report what works (0030) | 0.4 | Opus, high |
| 0.10 | Map tripwire spike: bake the first 40 regions in tiles with PixiJS, draw one curved region name, test hit-testing; reopen MapLibre for labels if they would cost more than a week (0035) | 0.3's first 40 regions | Sonnet, high |

Notes for lanes not yet started, from research:
- **0.2:** the testbed pack's graph needs the features the planner spike tests: a direct road and a longer flank route, limited rail, a river, a fort, two posts around a salient, and a depot (`docs/research/2026-11-14-planner-design.md`).
- **0.6:** a commander's overestimate of the enemy lives in belief derivation, so his dispatches and his plans inflate the enemy by the same amount (planner-design note).
- **0.9:** builds on `docs/research/2026-11-14-planner-design.md` and its spike plan and success criteria.

Lane 0.1 starts by upgrading to Vitest 5 and TypeScript 7 and adds a dependency-licence check (0035). Lane 0.2 also covers several scenario starts per pack, published schemas with readable validation errors, and string tables for all player text (0030). The Union data in lane 0.3 starts at the March 1861 inauguration (0028), and the world format reserves state fields and owners for weather, fortification and raids (0029).

Sequence within the limit of four lanes, two of them moving the simulation (reviewer lanes count, and run after their implementer):
1. 0.1, then its reviewer.
2. 0.2 and 0.6 (simulation), with 0.3's source research and 0.7 alongside.
3. 0.4, then 0.5 (simulation), with 0.3's data entry alongside.
4. 0.8.

**Phase 1, the war machine** (planned after Phase 0 lands): the kernel planner and plan selection; operations; combat with breakdowns and shaded reports; the people core recast for goals, plans and edits; stats, assessment and the officer pool; politics, the press and the 1862 midterms; the economy; attention. Phase 1 is done when a headless history run from March 1861 reaches the 1862 midterms with checkpoints in plausible bands, **and** the owner can play the core loop in a text console: plan review, arrow edits, audiences and dispatches (0030). **Phase 2** is the desk and the staff map. Its done check is set when Phase 1 lands; the working version is that the owner plays Lincoln through 1861–62 at the desk, on the staff map, and finds plan review and the audience worth playing.

## 13. Open after this design

- The first pack's exact region count and boundaries (lane 0.3).
- Hour-level battle presentation details (with the desk, after Phase 0).
- Which situations ship first, under the sensitive-history gate.
- The officer generator's name sources (the history note lists candidates).
- Setup options beyond the three history modes.
