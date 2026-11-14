# Research: how the kernel should draft candidate plans

Date: 2026-11-14. Status: research and design proposal for lane 0.9 (not canon until a record accepts it). Builds on decisions 0016, 0019, 0026, 0030 and 0033, `docs/design/FOUNDATION.md` sections 4, 5, 8, 10 and 12, and `2026-11-14-awwv-architecture-lessons.md`.

Conventions: **(snippet)** means I saw the fact only in a search-result snippet, not on the page. **[I]** marks my inference. AWWV paths are relative to `F:\A-War-Without-Victory` and were read on 2026-11-14.

## 1. The question

Decision 0026 says the kernel drafts candidate plans deterministically from the goal, the commander's state and the map, and his seat picks one. This note asks how to generate those candidates, score them, let character shape them, generate support requests, bound the cost, map the edit grammar onto them, and measure all of it in a spike.

## 2. Prior art

### Hearts of Iron IV
- The 2024 "small features" diary (Force Concentration, written by the programmer "Plankie") says the AI picks its most important fronts, "evaluates possible targets close to the front line" (supply hubs, ports, large cities), and finds a path there by the "path-of-least-resistance principle". The path avoids river crossings, bad terrain and forts, and follows railways to keep troops supplied. When an offensive "stagnates", the AI decides the plan "didn't survive the enemy contact" and picks another target. Source: https://devtrackers.gg/heartsofiron/p/d2563482-developer-diary-small-features (a mirror of the Paradox forum post).
- A developer said in Development Diary 54 that the AI uses battle plans under the same rules as the player **(snippet)**: https://forum.paradoxplaza.com/forum/threads/hearts-of-iron-iv-development-diary-54-ai.924168/page-2 (the forum blocked a direct fetch).
- Patch 1.3.3 made the AI ignore "non-dangerous fronts" **(snippet)**: https://forum.paradoxplaza.com/forum/threads/hoi4-dev-diary-1-3-3-patch-3.1000989/
- **Lesson:** a believable offensive comes from three cheap steps: pick a target of value near the front, route along a weighted cost (terrain, rivers, forts, rail), and drop the plan when it stalls. HoI4 needs no search over futures.

### Total War (Rome II onward)
- The campaign AI runs pre-movement analysis, then task allocation, then post-movement. Separate generators propose tasks for armies, navies and diplomacy. Filters remove tasks that contradict long-term strategy or recent actions. Monte Carlo tree search then grades what is left. It looks about "one turn ahead" before random playouts. At launch, AI turns took several minutes, and fixing that took weeks of patches. Source: https://www.gamedeveloper.com/design/revolutionary-warfare-the-ai-of-total-war-part-3-
- An ACCU 2018 talk by Cakmak and Davidson covers restricted MCTS under the campaign's memory and time limits **(snippet)**: https://accu.org/video/spring-2018-day-4/cakmak-davidson
- **Lesson:** "generators, then filters, then scoring" is the right shape. Search over futures is where the cost went. Mandate's planner should generate and score; it should not simulate.

### HTN planning in games and military planning
- Guerrilla used HTN planning in the Killzone series and expanded it for Horizon Zero Dawn: https://guerrilla-games.com/read/htn-planning-in-decima
- The planner in Transformers: Fall of Cybertron is a total-order forward-decomposition HTN, reported to be the game's fastest AI component (Humphreys, "Exploring HTN Planners through Example", *Game AI Pro 360*, pp. 103–22, doi 10.1201/9780429055058-9) **(snippet)**: https://www.taylorfrancis.com/chapters/edit/10.1201/9780429055058-9/exploring-htn-planners-example-troy-humphreys
- Nau argues that game plans must look believable and consistent and be produced very quickly **(snippet)**: https://www.cs.umd.edu/~nau/papers/nau2013game.pdf
- CADET (BBN, Kott's group) expanded a commander's high-level course of action into detailed task schedules. It used an HTN-like method that interleaved planning, adversary estimates, scheduling, routing, attrition and consumption. DARPA used it in Command Post of the Future. Sources: https://en.wikipedia.org/wiki/Course_of_Action_Display_and_Evaluation_Tool and https://arxiv.org/pdf/1601.06069
- Recent course-of-action work insists that each option's predicted outcome come with an explainable justification **(snippet)**: https://arxiv.org/pdf/2604.20862
- **Lesson:** a fixed set of methods ("ways to take an objective"), each expanded one level into axes, routes and phases, is cheap and readable, and it is how staff doctrine already works. Mandate needs one level of decomposition, not a general planner.

### Alternative routes on graphs
- Plain k-shortest paths overlap heavily; one study found 99% shared edges. The penalty method runs Dijkstra repeatedly, raising the weights of edges already used (often doubling them), and gets dissimilar alternatives cheaply. Sources: https://arxiv.org/pdf/2306.13704 and https://didawiki.cli.di.unipi.it/lib/exe/fetch.php/geospatialanalytics/gsa/05_-_alternative_routing.pdf
- **Lesson:** a flanking route is "the shortest path once the obvious one has been penalised". Integer weights make this fully deterministic.

### Influence maps
- Dave Mark's modular influence maps represent spatial threat and control as layered fields: https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter30_Modular_Tactical_Influence_Maps.pdf
- **Lesson [I]:** on a graph of about 250 regions, a per-region "perceived enemy strength" field, propagated one or two hops, is an influence map. It is the right input to route costs.

### Civil War games (from the existing survey, `2026-11-14-civil-war-games.md`)
- Grand Tactician: "Cautious commanders will usually overestimate the enemy strength" (manual p. 89): https://cdn.cloudflare.steamstatic.com/steam/apps/654890/manuals/Grand_Tactician_Manual.pdf
- AGEoD: generals do the executing ("trust your general's judgment"). Inactivity is an activation roll against a strategic rating, and a cautious army commander drags his corps commanders down. The default AI is passive, "like an herd of cats" (survey note, section 1). I found no source describing how AGEoD's AI forms operations; the AGEoD forum refuses automated fetches.
- The Union information-flows note puts commanders' enemy overestimates at 1.0x to 4x, depending on who ran the intelligence bureau (`2026-11-14-union-information-flows.md`, line 150).

### AWWV's planner (read-only)
- **Shape.** Bot corps run briefing → belief → assess → allocate → plan → decide → emit (`src/sim/combat/commander/`). Counted on 2026-11-14: `plan.ts` 2,168 lines, `decide.ts` 959, `emit.ts` 3,969.
- **Candidates are scored intents.** `CommanderIntentCandidate` holds an intent type (hold, reinforce, stage operation, launch opportunity, thin a sector, recall, request support), a score, a `score_breakdown` map and `blocked_by` strings (`commander_state.ts:381-405`). Mandate should port the breakdown and the gate list.
- **Plans are intentions** with required brigades, a staging zone, concentration progress and a viability score re-evaluated each turn (`commander_state.ts:176-206`; `plan.ts:1-33`).
- **Personality** is four floats from 0 to 1: aggression, caution, initiative, competence (`commander_state.ts:469-478`). Do not port the floats.
- **What went wrong:**
  - Axes shared an objective index, so the first stalled axis froze the rest (`docs/life_lessons/architecture.md`, "Ops process axes SEQUENTIALLY").
  - Five or more launch gates masked each other until an all-gates trace was added ("Redundant gates mask each other").
  - A formula bot overwrote the AI commander's stances every turn ("Formula bots silently override").
  - Staging tiles not adjacent to the objective meant weeks of marching and stalled operations ("Synthetic JNA corps", gotcha 3).
  - Dead operation types held corps slots ("Zombie op types").
  - The bot could not produce the historical operations, so they were authored as a 3,329-line catalogue of pre-planned operations plus trigger closures (architecture note, section 1). **[I]** This is the strongest warning: when generated plans are not good enough, authored plans creep in, and the generator decays behind them.
- `OperationAxis` (`src/state/game_state.ts:354-433`) carries many diagnostic fields written only under environment flags inside state (M9 in the architecture note). Keep those traces out of state.

## 3. What produced believable plans cheaply

1. Value-driven target choice near the front (HoI4), which Mandate replaces with the player's goal.
2. A weighted path of least resistance over terrain, rivers, forts and rail (HoI4), plus penalty-method alternatives for flanks.
3. A small set of methods, each expanded one level (HTN, CADET).
4. Generate, filter, score, with breakdowns kept (Total War, AWWV).
5. No lookahead simulation. That is where Total War spent minutes.
6. Abandon a plan when it stalls (HoI4). That belongs to operations, not to the planner, but the planner must be re-callable.
7. Character shows through perception and demand (Grand Tactician, AGEoD), not through randomness.

## Design

### D1. Where the planner sits
- `planner` is a pure function, `draft(world, derived, seatView, request) → DraftSet`. It writes nothing.
- `plans` (the only writer) stores the drafts it returns on the request day. Once drafted they are State: later calls see a changed map and would not reproduce them (finding 1).
- The planner runs only on request: when a goal is set, when a plan is sent back, when the player asks for a redraft, and when operations report a stall or invalidation. It never runs every tick.

### D2. Inputs
- **Goal** (0016): objective (region, force or line), posture, risk, deadline, permissions (rail, river, sea), committed force.
- **Commander profile**: a small permille record derived from his true stats and traits by a pack-tunable table:
  - `perceptionBias`: the multiplier on perceived enemy strength, 1000 to 4000‰. Its range follows the information-flows note.
  - `demandRatio`: the force ratio he needs before an axis is ready.
  - `tempo`: concentration days, pause days per phase, march-rate factor.
  - `supplyCare`: the weight on supply margin.
  - `maxAxes`: from competence. Low competence means one axis; AWWV used a similar cap.
  - `riskWeight`, `gloryWeight`: from values.
  - `methodMask`: the methods he will consider.
- **His forces**: force blocks with strength, region and readiness (0033).
- **World graph**: regions, typed edges with length in days and capacity (0019).
- **Derived indexes**: control, fronts, and supply paths with capacity (lane 0.4).
- **His knowledge only**: perceived enemy strength per region from his seat's beliefs (`viewFor`), never truth. The bias belongs to belief derivation, so his dispatches and his plans inflate the enemy by the same amount (finding 3).
- **Neighbouring posts**: holders, forces and regions as he knows them, for support requests.

### D3. Route cost
- Each edge gets an integer cost in hours: `length × terrain × edge type × condition`.
- To that it adds a threat term from the perceived-enemy field (his strength in a region, plus a fraction propagated one hop), scaled by `riskWeight`.
- It adds a supply term when the edge leaves his traced supply network or exceeds rail capacity, scaled by `supplyCare`.
- Edges barred by the goal's permissions are removed.
- Dijkstra with a binary heap, ordered by (cost, region id). Waypoint routes chain Dijkstra legs.

### D4. Methods (candidate generators)
Each method expands one level into axes (route, assigned force share, staging region, phases) or returns typed gate failures. It never silently returns nothing; that was AWWV's silent-drop lesson.

| Method | Expansion |
|---|---|
| Direct | One axis on the least-cost route to the objective. |
| Flank | One axis on the best penalty-method alternative: re-run Dijkstra after doubling the cost of the direct route's edges, and keep it if region overlap is under a threshold. |
| Supply line | One axis on the route that maximises minimum rail or river capacity within a time limit, with depot steps as phases. |
| Two-axis | A main and a fixing axis: the direct and flank routes, split by force. |
| Pincer | Two axes converging on the objective from regions on either side of it. If the second start region is held by another post, that axis becomes a **support request** to its holder with an arrival window. |
| Envelopment by water | A river or sea axis, if permitted. It needs a navy support request. |
| Holding action | Fix the enemy in place on a sector while the force builds up. This is the honest "not yet" plan. |
| Siege | When the objective is fortified (0029). |

Methods are engine code and setting-free. The pack tunes their thresholds.

### D5. Force allocation and timing
- The commander splits his blocks over the axes in proportion to each axis's perceived opposition × `demandRatio`, best blocks to the main axis. Assignment is deterministic, sorted by (strength, id).
- Phases: concentrate at staging (days from `tempo` and the distance of blocks from staging), march legs, pause, assault.
- An axis whose staging region is not adjacent to its first objective region is rejected with a gate reason (AWWV gotcha 3).
- Shortfall: if his force falls below `demandRatio × perceived opposition` on an axis, the plan does not fail. It carries a **reinforcement request** and a start gate, "move when reinforced".

### D6. Scoring
- A candidate's score is a signed sum of typed `Contribution`s in permille, like `compliance` today:
  - goal fit: objective, posture and deadline met;
  - perceived force ratio at the objective;
  - time to the objective against the deadline;
  - supply margin: minimum capacity over demand along the route;
  - exposure: articulation points and cut-risk edges on his supply line (AWWV P4);
  - coordination risk: axes × the spread of arrival days ÷ competence;
  - dependence on others: the number of support requests weighted by his regard for each holder;
  - personal terms: glory, caution, reputation.
- The weights come from his profile. The score is the exact sum of the terms, and a test asserts it.
- Every candidate also carries its gate list (every gate, not the first failure, per AWWV P10).
- Ties break by candidate id, built from method, axes and route hash, by strict comparison.
- Deduplicate candidates whose routes overlap above a pack threshold, keeping the better-scored one. Return the top N (default 4), plus one holding action whenever one is legal, so "not yet" is always on the menu.

### D7. How character shapes the menu
Four knobs, all visible in the terms:
- **What he sees:** `perceptionBias`. A cautious man's enemy is larger, so his routes avoid more, his ratios fall short and his requests multiply.
- **What he demands:** `demandRatio`. More shortfall means more reinforcement requests and start gates.
- **How fast he goes:** `tempo`. Longer concentration and pauses.
- **What he considers:** `methodMask` and `maxAxes`. An aggressive man gets the "outrun supply" variant, which is the same method with `supplyCare` near zero. A low-competence man never gets pincers.

No randomness enters the planner. Variety between games comes from the drawn true stats (0020) and from his knowledge.

### D8. Support requests
Requests are typed and attached to the candidate:
- **Reinforcement**, sent to the president: a strength in men (0033 transfer form). It appears to Lincoln as a condition. Commanders never transfer forces themselves.
- **Cooperating axis**, sent to a neighbouring post's holder: objective, start region, arrival window.
- **Naval support**, sent to the squadron's holder.
- **Rail capacity**, sent to the rail-capacity holder (economy).

On approval, each request becomes a directive to its holder, who answers through his own compliance (0016 joint operations). A pincer therefore fails for human reasons as well as geographic ones.

### D9. Cost bounds
- Per request: at most 8 methods × 3 alternatives × 2 axes, or about 48 Dijkstra runs. On about 250 regions and 700 edges, one run is roughly 700 × log₂ 250 ≈ 6,000 heap steps, so about 300,000 steps in all. **[I]** That is a few milliseconds in V8.
- Budget: at most 10 ms per request at p95 on the reference machine, with a hard cap on Dijkstra runs per request (the cap is counted and reported, never silent). The tick queues drafting requests beyond 4 per day for the next day, deferring rather than dropping (AWWV events lesson).
- Liveness counters: drafts per run, the share of candidates per method, gate failures by kind.

### D10. Determinism
- Integer maths only: costs in hours, everything else in permille. Every collection is iterated in id order.
- The heap compares (cost, id). Candidate ids are content-derived but computed once and stored with the draft (M10). No RNG and no module-level state.
- A permutation test: shuffling the order of regions, edges and blocks in the input must not change the output.

### D11. The edit grammar (0026)
Every edit is applied to a copy of the chosen candidate and re-expanded by the same machinery:
- **Objective**: re-route the axis to the new objective, keeping waypoints that remain on a legal path.
- **Waypoints**: a constrained route through them (chained Dijkstra legs). An unreachable waypoint is rejected with a reason, as a validation failure, not a compliance outcome.
- **Timing**: shift phase start dates and durations. Shortening concentration below his `tempo` is the classic "move now" edit.
- **Add an axis with an objective**: run his best method for that objective with forces re-split by D5. **Remove an axis**: re-split its forces over the remaining axes.
- **Force size request**: a separate order he reads (0026). It changes the allocation input, not the route.

### D12. Judging an edit's distance from his judgement
- Score the edited plan with **his** scorer and profile.
- **Distance** = (his best candidate's score − the edited plan's score), clamped to 0..1000‰. An edit that reproduces one of his own top candidates costs only that score gap, so picking his second choice is nearly free.
- The terms that fall the most become typed reasons. Today's `too_rash` (the force ratio drops below his demand), `lacks_resources` (shortfall) and `too_timid` (the player slowed an aggressive man) already exist in `directive.ts`. A few new ones are needed: `supply_exposed`, `uncoordinated`, `depends_on_rival`.
- The edited plan maps to `DirectiveTerms`:
  - `boldness` is derived from the plan's risk terms;
  - `required` is the force needed at his `demandRatio`;
  - `honours` and `offends` come from the goal and plan kind.
- `compliance.resolveDirective` then decides the rung as it does today. On top, a small "overruled" grievance scales with the distance and his pride. The kernel decides compliance; the seat never does (FOUNDATION section 8).
- The covert rungs become concrete plans:
  - **Reinterpret**: he executes the candidate nearest to the edit, by route overlap, among those whose score he accepts.
  - **Slow walk**: the edit's timing, stretched by his `tempo`.
  - **Comply with reservations**: the edit as given, with his stated reasons logged.

## Spike plan for lane 0.9

**Build (on the testbed graph, prototype quality, in the kernel's style):**
1. A testbed graph of about 30–40 fictional regions, if lane 0.2's is not ready, as a fixture. It needs:
   - a direct road route;
   - a flank route 30–50% longer;
   - a rail line with limited capacity;
   - a navigable river;
   - one fortified region;
   - two friendly posts on either side of an enemy salient;
   - a depot.
   If lane 0.4 has not landed, use a stub control and supply index.
2. Integer Dijkstra with (cost, id) ordering, penalty-method alternatives, and waypoint chaining.
3. Five methods: direct, flank, supply line, pincer (with a cross-post support request) and holding action.
4. The scorer with typed contributions, gates and deduplication.
5. Three profiles from the trait table: cautious, aggressive and steady-competent.
6. The edit machinery and distance mapped to `DirectiveTerms`, fed to the existing `resolveDirective`.
7. A CLI that prints each draft set with its terms and gates.

**Measure:**
- **Believability:** ten fixed situations, each drafted for all three profiles. In a blind review, the lead and then the owner judge whether each top pick is a plan a commander of that kind would offer, and whether they can tell the profile from the plans. Target: profile identified in at least 8 of 10 situations, and no top pick judged absurd.
- **Diversity:** mean pairwise region overlap of the top 3 under 60%, in at least 8 of 10 situations.
- **Supply-awareness:** where the shortest route breaks supply, the steady commander ranks the supply-line candidate first and the aggressive one ranks the overextended route first.
- **Pincer:** produced when two posts flank a salient, with arrival spread within the pack limit and a support request to the second holder.
- **Explainability:** every score equals the sum of its terms (property test). Every rejected method reports all of its gates.
- **Edits:** an edit equal to his own top candidate has distance 0. Successively farther waypoint edits give a non-decreasing distance (fast-check). Each rung's concrete plan is produced.
- **Determinism:** the same output hash across two runs, under input permutation, and on Windows and Linux CI.
- **Cost:** p95 under 10 ms on the testbed. Also under 25 ms on a synthetic graph of 250 regions and 700 edges, which stands in for the Union map.
- **Liveness:** every scoring term changes the top pick in at least one situation (sensitivity test). A term that never matters is dead.

**Success:** all of the above pass, in roughly 1,500 lines of planner code or fewer, with no situation-specific rules.

**Failure, reported honestly with numbers:** any of these:
- profiles cannot be told apart;
- the top 3 are near-duplicates on the sparse graph;
- the cost exceeds 25 ms;
- one term dominates every pick;
- believable plans need authored, per-situation templates (the AWWV catalogue warning).

A partial result, for example good single-axis plans but unconvincing pincers, is reported as such, with the method that failed and why.

**Stopping rule:** stop once the success criteria pass or after two measured iterations of the scorer weights per profile. Change one weight at a time.

## Findings outside my scope

1. **Drafts are State, not Derived.** FOUNDATION lists `planner` as Derived, which is right for the function. But the drafts shown to the player must be stored by `plans` on the request day, because a later call sees a different map and won't reproduce them. The field-to-writer table should say so, and the save schema must hold draft sets.
2. **The testbed graph needs specific features** for the planner spike: a flank route, a capacity-limited rail line, a river, a fort, two posts around a salient and a depot. Lane 0.2 should build them into the testbed pack, or 0.9 will fork a fixture.
3. **Enemy overestimation should live in belief derivation (lane 0.6), not in the planner.** Then a cautious general's dispatches and his plans inflate the enemy by the same amount, and one owner holds the bias.
4. **Responses need richer conditions.** `CounterProposal` carries only boldness and required resources. Plans need "I will move when reinforced by N men" and "if the navy supports". A typed condition list on responses, and the reasons `supply_exposed`, `uncoordinated` and `depends_on_rival`, should be planned for the Phase 1 recast of `compliance`.
5. **Commanders' reinforcement requests go to the president**, because only the player transfers forces (0033). The request belongs in the plan-review screen, or approving a cautious plan becomes an implicit transfer.
6. **The intelligence source's bias stacks on the commander's.** The information-flows note puts the overestimate at 1.0x to 4x depending on who ran the bureau. That bias belongs to the report's author and route (0032), not to the commander alone. Belief derivation should combine the two as separate terms, so the player can tell a timid general from a bad intelligence chief.
7. **Tuning the planner shifts obedience.** Edit distance reads the planner's scores (D12), so changing a scoring weight changes compliance rates. Calibration must treat them as one coupled system: one change per measured run, and the liveness gate should track the compliance rung distribution next to the planner's metrics.
8. **Don't port AWWV's float personality** (`OfficerPersonality`, 0–1 floats) or its environment-gated diagnostic fields on `OperationAxis`. Traces go to the tick report.
