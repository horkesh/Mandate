# Foundation design: the game's shape and the kernel's architecture

Status: proposed (2026-11-14), written by the lead from the owner's brainstorm decisions and four research notes, then revised after an independent review (verdict "ready after fixes"; fixes in 0024–0026), and revised again after a paper walkthrough of the first month (`FIRST-MONTH.md`; fixes in 0040). Decision records 0015–0026 accept its parts; until a record accepts a part, it is a proposal (canon precedence in `CLAUDE.md`). It replaces the M1/M2 kernel described in `KERNEL.md` and the coarse theatre of proposal P13.

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
| Attention | Lincoln's attention is a weekly budget with a pack cost table; approving a good draft or accepting the staff recommendation is free; it refills weekly with no carry-over. | 0025, 0040 |
| Review fixes | Kernel-drafted plans, a limited edit grammar, corps as posts, promotion lists, kernel-owned latency, visits that aren't truth, gate scope. | 0026 |
| Start, victory, navy | The campaign starts at the March 1861 inauguration; two national wills decide it; the navy works through people. The war's opening is the Confederate seat's decision, a labelled railroad with triggers and a fallback. | 0028, 0040 |
| Seasons, sieges, raids | Weather through commanders; sieges as operations; raids and insurgency under the gate; a Confederacy on the same machinery. | 0029 |
| Commitments | Scenario starts, packs as the modding format, string tables, playable at every phase, a planner spike. | 0030 |
| Map extent and sources | The whole war at about 250 regions; Newberry boundaries, traced rail, Natural Earth and USGS; provenance per pack. | 0031 |
| Reports | Typed reports with authors, routes and filters; the telegraph office as a seat. | 0032 |
| Forces and data | Transfers name a force; force blocks fit 1861; public-domain data only. | 0033 |
| Stack | PixiJS for the map with a tripwire spike; React, Electron, Zod, ICU strings, fast-check. | 0035 |
| Title | *By Order of the President*; Mandate stays the engine's codename. | 0036 |
| Commercial | A commercial product on a prove-it-first budget: no art or marketing money until a Steam page and a demo show the hook. | 0037 |
| AI on Steam | The Steam build ships template voices only until Valve clears bring-your-own-key or local models; the AI path sits behind a build-time switch. | 0038 |
| Positioning and demo | Sell the constraint and the people, not the map or the AI. The public demo shows the desk, the audience and plan review, from a later scenario with armies in the field. | 0039, 0040 |
| First-month revisions | Live situations; ignore, delegate and the hidden historical default kept apart; advice reports; Inquire, Consult, proposals, temporary posts; relay through chains of posts; the attention cost table; stop rules; stores on hand; Congress's chambers. | 0040 |

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
- **Stores on hand.** A force block carries its days of supply (State, written by `forces`, proposed by supply each day): they fall while the block is in a pocket and refill when a supply path or a sea delivery reaches it. A report that a garrison's stores have crossed a pack-set threshold is a decision point, like a report that a pocket has closed: the decision point belongs to the report, never to the truth (0054). The player never sees true stores, only the garrison's reports and the staff's range (0040).
- **Provenance.** Every geographic source carries a provenance and licence entry in its pack. Third-party data is committed only when its licence allows it (0014).

The staff map (0013) draws regions, fronts and arrows from the player's knowledge, never from truth.

## 5. Forces, command, goals and plans

**Forces.** A division has a strength, a region, a commander's post, experience, morale and equipment. **Corps are posts that hold people** (Lincoln imposed corps on the Army of the Potomac in March 1862, per the Union dossier, so appointing corps commanders is a real lever), but they have no relay mechanic yet: the army commander assigns divisions to corps and axes. A chain of command in which corps commanders relay and filter orders is a later dial (0026). That deferral covers only corps inside an army; orders relay between all other posts from the start (below, 0040).

**Detachments** sit below the force block, for garrisons and landings (0040, amending 0033).

**Command.** Posts (armies, departments, governorships, cabinet offices, the navy's squadrons) hold people and assets (P1). A post can also be **temporary** (an expedition command), dissolving when its operation ends. A post carries its **standing agreements and prior orders** as state (owner `command`), which its holder's compliance reads; a newer order from his own department supersedes them (0040). The player's command verbs:

| Verb | Targets | Notes |
|---|---|---|
| Appoint, relieve, promote | a person and a post | Relief has modes with different costs: to a quiet department, "at his own request", outright. Promotions arrive as lists from superiors and the War Department, which the player approves, amends or overrides; overriding or promoting over seniors costs standing; a nomination can lapse at the Senate's session end (0026). Approving a list as drafted is free; each amendment costs 1 attention. "Appoint" may create a temporary post (0040). |
| Transfer a force | from one army or department to another | Name the two commanders and a force (a number of divisions, a corps, or a strength in men); the sending commander picks which units go (0033). The stripped commander resents it; his friends in Congress notice. Inside an army, the commander assigns. |
| Set a goal | a commander | Objective (a region, a force or a line), posture, risk, deadline, permissions (rail, river, sea), and the divisions committed. Timing can be **"prepare, await my word"**: the operation assembles and waits for a free "go". A goal can carry **"approve as drafted unless he objects"** (section 9), and can attach a proposal (below) (0040). |
| Go | an assembled operation held for the player's word | Free (0040). |
| Review a plan | a commander's draft | Approve, send back with notes, or edit the arrows. |
| Inquire | any holder, on a subject | Ask for a report. It travels like an order and returns as a report from him, shaded by him. 0 attention; repeated inquiries to one man in a week cost his patience. It names a place only as a subject (0040). |
| Consult | a set of holders, such as the cabinet, on a situation | 1 attention. Each answers in writing with advice (section 8); each answer becomes a **stance on record**: reversing it later costs the man consistency, and a stance can leak. This verb is the cabinet meeting (0040). |
| Audience | a commander, before or during | Hear him out; offer counters (P3, M2's typed counters). |
| Visit | an army | Days away from Washington, while the cabinet's and Congress's business resolves by default (0025). You get several independent first-hand reports from the army's officers: better than dispatches, **not the truth** (0026). Your counters there weigh more. |
| Send an observer | any rostered person to a commander's headquarters | He reports to whoever sent him. An office-holder carries his bias; a man without a post carries only personal bias (0040). |
| Honour, promise, pressure, address | people and blocs | As in M2. |

**Goals and plans.** A goal goes to a commander. **The kernel's planner drafts candidate plans** deterministically from the goal, the commander's stats and traits, his forces and the map; his seat selects one, adjusts it within kernel bounds and annotates it (0026). A plan has one or more axes, each with assigned divisions, a route along graph edges, phases with timings, and requests for support from other posts (a fleet, a neighbouring army, rail capacity). The candidates reflect who he is: a cautious man's are slow and ask for more; an aggressive man's outrun his supply. Plans are drafted on request, never every tick.

**Proposals.** Any person can submit a candidate plan nobody ordered; the kernel drafts it from his traits and the map. The player adopts it by attaching it to a goal for a holder, who reads it like any order and may resent an outsider's plan. Seats still never invent a plan the kernel has not validated (0026, 0040).

The plan appears as arrows. The player can:
- **approve** it as drafted (free: 0025);
- **send it back** with notes, which the commander reads like any order (`reading`);
- **edit the arrows**, within a limited grammar: an axis's objective, its waypoint regions, its timing, and adding or removing an axis with an objective. The commander assigns divisions to axes; the player can ask for a force size. Each edit is a counter-order. It passes through the commander's compliance like any directive, and the further it departs from his own judgement, the more likely he complies with reservations, slow-walks, reinterprets or objects (0007, P2).

**Joint operations.** A support request to another post (the navy's squadron, a neighbouring department) is a directive to that holder, who answers with his own compliance. An encirclement is two commanders' arrows meeting, so it fails for human reasons as well as geographic ones.

**Orders through chains** (0040). An order for a holder lower in a chain of posts (president, secretary, squadron, captain) travels down that chain:
- **Relay is message passing between posts.** Each link receives the order as a message, applies his own compliance and delay, and forwards it or objects. His standing agreements and prior orders weigh in his compliance.
- **Going around the chain.** An order may go direct to a holder below the one who should relay it: faster, a grievance for the bypassed man, and a risk of conflicting orders.
- **Conflicting orders.** A holder with two resolves them by his compliance and reports which he obeyed.
- **Routes.** A special messenger or a fast ship is a route with a price.

**Execution.** An approved plan becomes an operation with a lifecycle per axis. `movement.ts` is the only writer of a division's location; `combat.ts` resolves contacts; reports come back through the commander, shaded by who he is (0008, P4), and through other routes (the press, governors, observers, the telegraph office), each with its own author and filters (0032).

**Cost of operating.** The default path must take seconds: the commander's draft is usually good enough to approve, and the interface shows his reasons inline. Editing arrows is for when you care.

**Attention** (0025, 0040) is a weekly budget, priced by a pack cost table with these rules:
- a situation decision includes the orders its option issues (no double charge);
- accepting the staff recommendation is free; overruling it costs 1;
- approving a draft as written, approving a promotion list as drafted and sending a plan back are free; each amendment to a list costs 1;
- Inquire costs 0, Consult costs 1;
- attention refills to its cap weekly with no carry-over, and the meter shows the next refill date.

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
- **Situations.** Historical pressures arrive when their causes are present, not on dates (P15). Each situation is pack data: a cause predicate, options, consequences, an `inaction` outcome, a **historical default** and a **staff recommendation**. A test enforces all three (0023, 0040).
  - **Live situations** (0040). A situation can stay open while its clock runs: its cause is re-evaluated daily, options can **expire** (`expiresWhen` per option) or **appear**, and it ends a turn only when an option expires or appears or a pack-set clock threshold is crossed (`resurfaceOn` per situation). The player can wait and gather information meanwhile.
  - **Three outcomes, kept apart** (0040). **Ignore** resolves to the pack-authored `inaction` outcome (for Sumter, the garrison starves, then surrenders). **Delegate** hands the choice to a named holder's seat, which decides by his values. The **historical default** is used only by history runs and a rule-seat Lincoln, and is **never shown to the player**, since it would leak hindsight.
  - **Options can issue orders through people** (a goal, an appointment, a notice), not only abstract consequences (0040).
  - **The staff recommendation** is an advice report authored by the holder of a named post, carrying his bias (section 8).
- **Congress.** Each chamber has a state in `politics` (sitting, adjourned, special session called), which changes which situation options are legal and creates an accountability check at the next session (0040).
- **The war's opening** (0028, as amended by 0040). **The Confederate seat opens the war**: the one deliberate railroad, labelled in data and docs, with an ordered trigger list (a relief attempt at Sumter, a landing at Pickens, a last date) and a guaranteed fallback. The player's choices set the timing, which fort, and a **framing** term owned by `politics`: who the public believes began it, through the press.
- **Patronage**, if modelled, arrives as weekly lists with defaults, never one card per office (0040).
- **Foreign powers.** Britain and France are pressure clocks driven by the blockade, victories and emancipation, worked through the Secretary of State's seat, not playable factions.
- **Border states.** Contested regions whose governors and legislatures are seats with loyalties of their own.
- **Enslaved people** are agents of their own freedom, never a resource either side manages: self-emancipation toward Union lines, and the effect of policy (the confiscation acts, the Emancipation Proclamation). **Black regiments** come from the enlistment choices of free Black men and freedpeople responding to policy, not from a pool in the "men" resource (0026). This sits under the sensitive-history gate (0021), which also covers the wars against Native nations (the Dakota War of 1862 falls inside the first slice), the draft riots and civil liberties. Every sensitive feature is placed before it is authored: modelled with locked consequences, narrated only, or refused. The test is "Is this a lever?" The checklist and the 1861–62 topic register are in `docs/design/SENSITIVE-HISTORY.md` (0046): placements per facet (decision, event, derived, text, refused), the ship rule, and the records still to write.

## 8. Seats, knowledge and voice

- **A seat** is whoever decides for a person: the rules model, an AI model, or later a human. Every seat receives a request built only from what that person may know, plus the kernel's menu of legal responses, and returns a typed response. One set of decision types serves all three kinds of seat.
- **The rules model is always there.** An AI seat wraps a rule seat and falls back to it on timeout, invalid output, a failed consistency check or no key, logging the fallback.
- **What an AI may decide.** A principal's choices (the opposing president's decisions, from the same legal set as the player's), and a choice among options the kernel has already judged equally consistent with a person's state, such as which of the planner's candidate plans a commander picks. Compliance itself never moves to the AI: the kernel decides what a general actually does and what he says he does. The AI writes the words from what he declared and chose to state, never from what he will actually do, so it cannot leak a lie (0022).
- **Reports** are typed data with an author, a route, filters and bias terms (0032). Not every report comes through the commander: governors, the Navy Department, the press, observers and informal sources have their own routes, and the War Department's telegraph office is a filtering seat the president can go around at an attention cost. That filter post is empty in the March 1861 start (0040).
- **Advice** is a report type of its own (0040): an author, a recommended option, stated reasons as typed terms, and a confidence. A **memorandum** is unsolicited advice. Consult's answers and a situation's staff recommendation are advice; the recommendation is authored by the holder of a named post (the general-in-chief, the relevant secretary) and carries his bias. An adviser's **credibility** is tracked separately from his field assessment (0020).
- **Seat initiative** (0040). Seats also act unprompted: each has a pack-defined initiative menu (open a channel to the enemy, write to the press, propose a plan, bid for authority), evaluated in the weekly people step through the same compliance machinery, with declared and actual rungs. An initiative reaches the president only through report routes.
- **Knowledge per seat.** Each seat stores the reports that reached it, with latency (courier, telegraph). Beliefs are derived on read. Faded reports are pruned by a pack rule (age and supersession), so knowledge does not grow without limit. `viewFor(state, seatId)` generalises today's per-faction view (0011 is superseded by 0015).
- **Rule seats live in their own package**, outside the kernel but inside the banned-API and pack-boundary checks, because their output enters the log.
- **Seats answer at turn boundaries** (0027). An AI seat has until the player ends the turn; if it has not answered, the shell waits ("awaiting dispatch") or falls back to the rule seat. The command log records every answer, so replays are exact.
- **The player-visible boundary is built in Phase 0**, before any generated text exists. True reasons in a response are reachable only through the truth layer, and an architecture test proves the view layer and the AI caller cannot import it.

## 9. Time

- The kernel ticks one day at a time and never sees the wall clock. Turns are the shell's business (0027): a turn runs up to seven days (a pack setting) and ends early on the kernel's decision-point signal.
- The day tick returns a decision-point signal (an objection arrived, a battle report, a report that a pocket closed or that a pocket's stores crossed their threshold, a situation fired, a live situation's option expired or appeared or its clock crossed a threshold, a plan is ready for review); the shell ends the turn on it according to the player's settings, shows the turn's days passing as their dispatches arrive, and waits for the player.
- **Stop rules** (0040):
  - a goal marked "approve as drafted unless he objects" executes its plan without a stop; an objection or a large departure from the goal still stops;
  - lists, promotions and routine returns go to the inbox and never end a turn;
  - "a report I asked for has arrived" (from Inquire or Consult) is an optional stop.
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
- **Derived**: pure functions of World and State. Their caches are keyed by a signature computed from the State they read (for example each faction's band and holder per region, the month and the network) and tied to their World; they live outside State, so no "dirty" flag or cache can be saved, and a signature cannot drift from the data it describes (0054).

The **command log** sits beside State and is the truth about what happened: replay and resume run from it, and resuming from a save must equal the continuous run (AWWV's resumed games drifted by 616 differences).

Module map, adapted from the AWWV-architecture note:

| Module | Layer | Owns |
|---|---|---|
| `world/graph` | World | regions, typed edges, capacities, depots, terrain |
| `control` | State | the control map; the only writer of control changes |
| `control-index` | Derived | holders, contact edges, fronts, components, wire owners; a function of any control table, so the staff map can feed it claimed control (0054) |
| `supply` | Derived | supply paths with capacity from sources and forward depots; pockets with their cut; allocation in priority order (0054) |
| `forces` | State | force blocks and detachments, with stores on hand; location written only by `movement` |
| `command` | State | posts (including temporary posts) and the people in them; division-to-commander assignment; standing agreements and prior orders |
| `plans` | State | goals, drafts, approvals, edits as counter-orders |
| `operations` | State | approved plans in execution, per-axis lifecycles |
| `movement` | writer | the only writer of location; owns and exports the movement passage rule, which `planner` imports (0062) |
| `combat` | writer | battle resolution with breakdowns and named seeded streams, and occupation (0076; Phase 0's simple contest, 0064, is retired) |
| `people`, `compliance`, `reading`, `audience`, `proxy`, `ladder` | State writers | the M1/M2 people core, recast for goals and plans |
| `knowledge` | State | per-seat reports with latency; the truth behind each report in a separate map the view layer cannot import (0052) |
| `messages` | State | messages in transit, with latency owned by the kernel (0052) |
| `view` | Derived | `viewFor(state, seatId)` |
| `seats` | State | who drives each person; command validation (drivers live outside the kernel) |
| `economy` | State | money, men, munitions, rail capacity at their holders |
| `situations` | State | cause predicates, offers, live situations and their clocks, decisions |
| `politics` | State + Derived | blocs, mandate, elections, verdict, chambers of Congress, the war's framing |
| `planner` | pure function | drafts candidate plans for a goal on request; the drafts are saved as State by `plans` on the request day, because a later call would see a changed map (planner-design note). Generate, filter and score with one level of methods; reads beliefs from the commander's view, never truth (0062) |
| `infrastructure` | State | edge condition (damage and repair), water-edge obstructions, depot condition (0050) |
| `weather` | State | today's weather per weather zone, a seeded draw (reserved, 0029, 0050) |
| `tick` | writer | the fixed day order and the decision-point signal; the only writer of the current day (0052) |
| `log`, `serialize` | — | command log, snapshots, replay, canonical JSON, state hash |
| `invariants` | — | post-tick assertions with typed failures |

**One writer per field.** Other modules propose typed deltas; the owner applies them. This table is the source for the architecture test in section 11.

| State field | Only writer | Proposed by |
|---|---|---|
| region control | `control` | combat, occupation |
| region population, loyalty (`regionLoyalty`, from sourced start values; never a stand-in for control), supply value | `regions` | economy, situations, occupation |
| edge condition (`infraEdgeCondition`) | `infrastructure` | combat, raids, repair orders |
| water-edge obstructions (`infraObstructions`); depot condition (`infraDepotCondition`) | `infrastructure` | combat, raids, operations, including clearing works no fort holds (0050, 0064; set at scenario start) |
| a post's department, and scheduled department changes | `command` | the scenario start's scheduled changes, situations (0050) |
| a region's civil government, which no-faction governments are closed, and each department's side | `command` | the scenario start, situations (0058, 0065) |
| a person's ranks, one per kind (regular, volunteer, brevet) held at once, each with its date | `people` | appointments, promotion lists (0050, 0073) |
| a person's status (serving, wounded, killed, captured) and its date | `people` | combat (0073) |
| today's weather per weather zone | `weather` | its own seeded draw (0029, 0050; reserved) |
| a force block's region or ship, and the leg it is on (`forceLocations`) | `movement` | operations, retreats, recruitment (a raised block placed at its muster region; a disbanded one removed), detachments (a garrison placed where its parent stands, a landing ashore) (0064, 0073, 0081) |
| a raised block's enlistment (`forceEnlistments`): who raised it, on whose call, and when its men's term ends | `forces` | recruitment (0073) |
| the current day | `tick` | the day tick (0052) |
| messages in transit | `messages` | commands, reports, relay links forwarding an order, the kernel's latency rules (0052) |
| knowledge: reports per seat, and the truth behind them | `knowledge` | message delivery, pruning (0052) |
| seat assignments | `seats` | setup, the player's settings (0052) |
| the president's attention this week (`seatAttention`: what is left, and the day of the last refill) | `seats` | command validation (spending, from the pack's cost table), the weekly step (refill to the cap, no carry-over) (0025, 0040, 0073) |
| seat initiative state (`seatInitiatives`: each initiative's last firing day, for its cooldown) | `seats` | the weekly people step (0040, 0073) |
| a force block's strength, non-combatants, arm and department (`forceBlockStates`); morale, experience and equipment from Phase 1 | `forces` | combat, attrition, economy, recruitment, transfers (0064) |
| a force block's stores on hand | `forces` | supply (daily), operations (a sea delivery) |
| detachments below the force block (garrisons, landings): a `forceBlockStates` record of kind `detachment` naming its parent; detach, rejoin and stand alone, with men conserved | `forces` | operations (a landing by water), a proposal naming a count of men and a region, such as a situation's `landing` effect; placed by `movement` and assigned by `command` in the same proposal (0041, 0081) |
| stragglers: men absent from a force block who rejoin over days | `forces` | combat, attrition (0041) |
| battle records | `combat` | (0041) |
| situation chain and wait state | `situations` | (0046) |
| the Congress accountability ledger: acts taken while Congress was away | `politics` | (0046) |
| people who have reached Union lines (`regionReachedUnionLines`) | `regions` | the derived self-emancipation term only (0046, 0074); never a lever |
| fortification and entrenchment | `regions` | operations (works dug by an axis holding its objective), combat (works lost when stormed) (0029, 0041, 0080) |
| a force block's post (`forceAssignments`) | `command` | transfers that name a force, the army commander's assignments, combat releasing a surrendered block, recruitment (a raised block assigned to its governor's post; a disbanded one removed), detachments (a new detachment assigned to its parent's post) (0033, 0064, 0073, 0076, 0081) |
| people in posts; temporary posts (`postStates`) | `command` | appoint, relieve, promotion lists, an operation's end, combat vacating a hit commander's post (0076) |
| observers in post (`observerPostings`): the observer, the post he watches, who sent him and the day he arrived | `command` | the observer verb and his recall (0040, 0073) |
| standing agreements and prior orders on a post, including a governor's answered call not yet mustered (`postLevies`) | `command` | verbs, situations, orders from the holder's own department, a call a governor answered (0073) |
| a person's stats, traits, standing, grievances, regard | `people` | combat results, the press, verbs, ladder, a chosen policy's pushback (typed grievances, and the floor's cost to the principal's standing) (0082) |
| a person's stances on record (from Consult) | `people` | Consult answers (0040, 0041); adviser credibility is derived from the president's knowledge, never stored |
| promises made to a person (`personPromises`: the kind, the day made and the day due); one that falls due unkept becomes a grievance | `people` | the promise verb, the audience (0073) |
| inquiries a person received this week (`personInquiries`); past the pack's patience they become a grievance | `people` | the inquire verb (0040, 0073) |
| a person's ladder rung and rivals (`personRungs`, `personRivals`) | `ladder` | weekly people step |
| responses to orders (declared and actual rungs, reasons) | `proxy` | message arrival, a policy's carriers answering it (0082); computed by `compliance` and `reading`, which are pure and write nothing |
| audience state (`audienceHeld`: the last audience's day and the counters used) | `audience` | the audience verb |
| each post's goal and plan record (`planRecords`): the goal, its draft set saved on the request day, the seat's pick, approval or send-back, edits as counter-orders, and a reference to his response (`proxy` writes the response itself) | `plans` | verbs (order, review, go), seat selections, order arrival, the planner's draft sets on request (0062, 0073) |
| operations and their lifecycles (`operationRecords`: one per goal and plan, axes copied from the plan, each stage with a typed reason) | `operations` | plan approval, movement and combat outcomes, support answers (0080) |
| knowledge (reports per seat) | `knowledge` | message delivery, pruning |
| messages in transit | `messages` | commands, reports, relay links forwarding an order, the kernel's latency rules |
| economy stocks | `economy` | weekly step, verbs |
| situations fired, live (open options, clocks) and decided | `situations` | cause evaluation, decisions, delegated seats' choices |
| blocs, mandate, election results | `politics` | weekly step, battles, the press, checkpoints |
| each chamber of Congress's state (sitting, adjourned, special session called) | `politics` | situations, the weekly step |
| the framing term (who the public believes began the war) | `politics` | the war's opening situations, the press |
| seat assignments | `seats` | setup, the player's settings |

The day tick, each phase declaring what it reads and writes:
1. Apply today's commands, validated; each creates messages in transit (the kernel computes their arrival). Rejections are logged.
2. Deliver messages due today into seat knowledge; recipients' responses are computed on arrival.
3. Movement.
4. Combat.
5. Control changes; bump the control version when a threshold is crossed.
6. Operations advance; stores on hand fall or refill from the supply trace.
7. Weekly: economy, people's politics and seat initiatives, bloc drift, attention refill. Recruitment runs daily instead, because musters and enlistment terms fall on particular days (0078).
8. Situations fire on their causes over today's State, after every phase that changes the truth, and surface on the deciding seat's knowledge; live situations check option appearance and expiry over what the principal knows, and their clocks (0057; phase 4b in Phase 0 code, after control).
9. Checkpoints and the verdict.
10. The invariant barrier.
11. Decision-point detection.

In the code the phases run as: commands (1), deliveries (2), recruitment's musters and disbandings (2d, 0078), operations, then movement (3, 0080), battles and occupation (3b; the control contest until 0076), control and the derived map (4), stores on hand and stragglers rejoining (4a), the self-emancipation term on its cadence (4a′, 0078), situations (4b), `command`'s proposals such as a government closing (4c), cyclic reports, pruning, the day, and the barrier (0057, 0064). A post's headquarters is derived from where its strongest block stands, never stored.

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

## 12. Phase plans

### Phase 0 (closed, 0072)

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
| 0.7 | Situations schema with live state (`expiresWhen`, `resurfaceOn`), options that issue orders, and `inaction`, historical default and an authored staff recommendation enforced by test; the sensitive-history placement checklist | 0.1 | Opus, high |
| 0.8 | Headless runner with liveness, hashes and resume check; the Phase 0 done check | 0.3–0.7 | Sonnet, high |
| 0.9 | Planner spike: design and prototype candidate-plan drafting (including a two-commander pincer, a supply-aware route and a small joint naval relief) on the testbed graph; report what works (0030) | 0.4 | Opus, high |
| 0.10 | Map tripwire spike: bake the first 40 regions in tiles with PixiJS, draw one curved region name, test hit-testing; reopen MapLibre for labels if they would cost more than a week (0035) | 0.3's first 40 regions | Sonnet, high |

Notes for lanes not yet started, from research:
- **0.10** ran early on stand-in regions: PixiJS stands, with a lazy bake in 512-pixel tiles and authored label hints per region (0043). It re-runs its measurements on 0.3's first real regions (the second tripwire).
- **0.2 is done** (0050). **0.3** imports the Union drafts into its format, starting from the fit test in `notes/lane-0.2-world-format.md`.
- **0.7's sensitive-history checklist was drafted early** by a separate gate lane (`docs/design/SENSITIVE-HISTORY.md`, 0046); lane 0.7 builds the schema and the tests from it.
- **0.2 and 0.3:** the world format defines optional label hints per region (anchor, spine, size class, minimum zoom), and lane 0.3 fills them where automatic placement fails (0043). Lane 0.3 must not fetch from census.gov on this machine.
- **0.2:** the testbed pack's graph needs the features the planner spike tests: a direct road and a longer flank route, limited rail, a river, a fort, two posts around a salient, and a depot (`docs/research/2026-11-14-planner-design.md`).
- **0.6:** a commander's overestimate of the enemy lives in belief derivation, so his dispatches and his plans inflate the enemy by the same amount; an intelligence chief's bias is a separate term on top, so the player can tell a timid general from a bad intelligence chief (planner-design note).
- **Phase 1 calibration:** edit distance comes from the planner's scores, so planner weights change how often generals obey. Calibrate them together, one change per measured run, tracking compliance outcomes beside planner metrics (planner-design note).
- **0.9:** builds on `docs/research/2026-11-14-planner-design.md` and its spike plan and success criteria. Its cases gain one small joint relief operation: a sea route, a landing and a support request to a navy post, since the campaign's first two plans are naval (0040).
- **0.7:** starts from 0040: live situations, the three outcomes kept apart, and the staff recommendation as an advice report by a named post's holder. Option labels are worded neutrally, in the advisers' own terms, in a fixed order unrelated to the historical default (0041). The March situations start the day after the inauguration, which is the premise, not a choice (0042). It also starts from `docs/design/SITUATIONS-1861-62.md` (the cases the schema must fit) and `docs/design/SENSITIVE-HISTORY.md` (its mechanical questions are the gate tests), with 0046's two triggers, waiting options, chains, the ordered staff-line authors and the decision and notice kinds. Its test fixtures use the testbed's fictional terms, never the setting's.
- **Before the March 1861 situations are authored:** the facts the walkthrough marked unsourced are now sourced in `docs/research/2026-11-14-march-1861-facts.md`, and `FIRST-MONTH.md` opens with the corrections. Its remaining gaps (the Senate Executive Journal, Fox's account in the Navy Official Records, Northern papers) are for a verification pass before pack data cites them.

Lane 0.1 starts by upgrading to Vitest 5 and TypeScript 7 and adds a dependency-licence check (0035). Lane 0.2 also covers several scenario starts per pack, published schemas with readable validation errors, and string tables for all player text (0030). The Union data in lane 0.3 starts at the March 1861 inauguration (0028), with the telegraph-office filter post empty (0040). The world format reserves state fields and owners for weather, fortification and raids (0029), and supports detachments below the force block, temporary posts, standing agreements on posts and stores on hand (0040).

Sequence within the limit of four lanes, two of them moving the simulation (reviewer lanes count, and run after their implementer):
1. 0.1, then its reviewer.
2. 0.2 and 0.6 (simulation), with 0.3's source research and 0.7 alongside.
3. 0.4, then 0.5 (simulation), with 0.3's data entry alongside.
4. 0.8.

### Phase 1: the war machine (0073)

Phase 1 builds the kernel planner and plan selection; operations; combat with breakdowns and shaded reports; the people core recast for goals, plans and edits; stats, assessment and the officer pool; politics, the press and the 1862 midterms; the economy; and attention.

**Phase 1 is done when** a headless history run from March 1861 reaches the 1862 midterms with checkpoints in plausible bands, **and** the owner can play the core loop in a text console: plan review, arrow edits, audiences and dispatches (0030).

**Two milestones.** The Phase 0 exit review ranked what Phase 1 inherits (0072):
1. pushback has never run on the new kernel;
2. the history run needs rule-seat principals and the opening situations, under the gate;
3. the planner replaces standing goals;
4. two kernels sit side by side;
5. data gaps decide outcomes.

Built system by system, these risks would meet only at the end. So Phase 1 runs as two milestones:
- **1A, the road to Bull Run** (5 March to 31 July 1861), is a thin slice through every system over the war's first five months, and meets all five risks before anything is built on top of it. These months hold:
  - the opening decisions and both war flags;
  - the call for troops and the armies it raises on both sides;
  - the border states and the upper South;
  - Congress away, then in special session;
  - the first plan a president reviewed and pushed: McDowell's advance before the ninety-day men went home (S21).
- **1B, to the midterms**, builds the breadth on that slice.

The slice is emergent like the rest of the game: its checkpoints are bands, and no battle is required to happen where or when it did (section 11).

**1A is done when**, on the Union pack from the 5 March 1861 start:
1. A headless history run reaches 31 July 1861, and:
   - each side's war flag is set by its own government's decision (0066), with no `--at-war`;
   - the 31 July checkpoints fall inside bands sourced by a research lane before the run, never fitted from it. They cover:
     - which states have seceded;
     - the side of each government whose side could change by 31 July: Maryland, Delaware, Kentucky, Missouri, western Virginia and the Indian Territory nations;
     - whether Washington is held;
     - each side's men under arms;
     - a planned operation fought by each side;
   - at least one operation is drafted by the kernel planner, chosen by its commander's seat, approved, executed and fought with the battle model, with a breakdown;
   - pushback fires on the new kernel, in bands set before the run. Lower bounds come from the sourced pushback in S01–S21 (the catalogue's cases, such as a slow walk on the Pickens order and a refusal down the chain); upper bounds, set by the lead, keep disobedience from becoming the rule. So the four bands Phase 0 pinned at zero move (0068): relay objections, relay holds, filter holds and trims. Compliance with reservations, slow walks and an objection to a plan are banded the same way;
   - no block fights with unknown strength: every battle record lists none unknown (risk 5);
   - the eight stand-ins Phase 0 labelled for Phase 1 are gone: standing goals, the consistency judgement, the trait adapter, weakest-first transfers, conflicts resolved by department, the simple contest, the generic rule-seat principal and the capital as objective. Any stand-in left in the code is labelled and owned by a 1B lane (risk 3);
   - every Phase 0 criterion still passes: the same hashes on Linux and Windows, resume, the liveness gate for every mechanic, and the tick budget, re-measured with the planner, people and situations running.
2. A scripted console session plays the same months on the new kernel and reaches 31 July. It is a test that uses only verbs from the verb list, and it goes through:
   - the situations;
   - a plan review with an arrow edit;
   - an audience;
   - dispatches, including a battle day's hour-stamped dispatches.
   The owner's playtest follows the milestone; its findings go to 1A's exit review, not to this check.
3. M2 is retired:
   - `GameState`, `turn`, `theatre`, M2's console, runners and CI steps are deleted;
   - `compliance.test.ts` and the audience tests run on the new State.

Lanes for 1A, sized from `docs/LANES.md`:

| # | Lane | Depends on | Size |
|---|---|---|---|
| 1.1 | **The people recast: State and compliance.** First, as its own merge, the one-writer scanner follows type aliases; it lands before 1.1's or 1.2's new State (`OPEN_QUESTIONS`). Then: people as State owned by `people`: hidden true stats drawn at setup from cited centres; traits; standing; grievances; regard; stances on record; a status (serving, wounded, killed or captured); and a rank per kind (regular, volunteer, brevet), held at once. Values and temperament join the world format, each centre cited (0005). `compliance`, `reading` and `proxy` move onto the new State. Compliance answers goals, plans and edits through `DirectiveTerms`: it reads a plan's boldness against the man's own best plan, and its responses carry conditions such as "move when reinforced" and "if the navy supports" (lane 0.9). A compliance function resolves conflicting orders (0040), and 1.2 calls it. Relay compliance and the filter read values, so relay objections, relay holds, filter holds and trims come alive. It replaces the trait adapter (0058) and moves `compliance.test.ts` onto the new State | Phase 0 | Opus, high |
| 1.2 | **The planner and plans in the kernel.** `planner` is a pure module in 0062's shape, inside lane 0.9's boundary: passage from `movement`, the heap shared from `supply`, and every input about the enemy or the ground from the commander's view. New claim kinds for works and obstructions let a commander plan on what he has been told of them. `plans` State holds:<br>• full goals: objective, posture, risk, deadline, permissions, committed divisions, "prepare, await my word", "approve as drafted unless he objects";<br>• draft sets saved on the request day;<br>• the seat's selection, approval and send-back;<br>• arrow edits as counter-orders.<br>A commander's menu offers the planner's candidates, which replaces the consistency-judgement stand-in (`seats/requests.ts`). Conflicting orders are resolved at arrival by 1.1's compliance function, which replaces resolution by department (0064). It makes lane 0.9's fixes: a phase for each enemy-held region on a route, the shortfall threshold, the assault margin, neutral ground only by permission, detachments left behind, and a pincer partner scored by its holder's regard and values. The daily drafting cap becomes a pack rule. It retires standing goals as an order's content and everywhere they are read: the situations `goal` condition, 0071's refusal, the war gate's opening order, and the hold goal a post gets when its government changes side (0072). Standing goals keep driving movement (`tick/standing.ts`) until 1.4's operations take it over | Phase 0; 1.1's scanner fix before its new State | Opus, high |
| 1.3 | **Combat: the battle model.** It replaces the simple contest (0064) with the combat note's model:<br>• one battle per region per day, with men in contact capped by frontage;<br>• five battle types with base loss rates, and additive typed terms;<br>• one named stream per battle-day with fixed draws;<br>• commanders commit, stand or pursue by their traits, without dice;<br>• the missing go to stragglers, a rout by morale does not kill, and destruction comes only when cut off;<br>• a trapped garrison surrenders (`OPEN_QUESTIONS`);<br>• captured men leave a block's strength as a typed loss in the battle record, with no prisoner stock, exchange, parole or option on their fate, as R4's battle ruling places them;<br>• generals are killed, wounded or captured on their own stream, proposed to `people` (their status) and `command` (the vacancy).<br>It also adds battle records with breakdowns; morale, experience and equipment on force blocks; a four-phase template that drives the hour-stamped dispatches; and Livermore's tables as a CI harness of named set-ups. A separate gate reviewer reviews it | 1.1; R4's battle ruling (1.8) recorded before it merges | Opus, high |
| 1.4 | **Operations, reports and dispatches.** An approved plan becomes an operation with a lifecycle per axis: assemble, march, works, assault, pause, pursue, withdraw, end. Support requests are directives to other holders, who answer with their own compliance, and an encirclement is two commanders' arrows meeting. Detachments below the force block (garrisons, landings) become `forces` State. Reports come through the commander, shaded by who he is (0008), and through the other routes: governors, the Navy Department, observers and the telegraph office. A battle day's dispatches are stamped by hour (section 9). A battle report, a closed pocket and a plan ready for review become decision points. It retires the standing-goal execution path and the daily step menu. Ships and troops afloat still neither eat nor draw stores; it labels that stand-in in code, owned by 1B's ships' stores (0064) | 1.2, 1.3 | Opus, high |
| 1.5 | **People's verbs, the audience and attention.** The verbs: appoint and relieve, with relief's modes, for 1A's appointments (volunteer generals were appointed, not listed); transfer through compliance, where the sending commander chooses the blocks, replacing weakest-first transfers (0064); inquire; consult, with stances on record; the audience recast for plans, before and during; send an observer; promise, pressure and address. Also: the ladder and rivals; seat initiatives in the weekly people step (0040), as a mechanism with a testbed case, their state owned by `seats`; and the attention budget, owned by `seats`, priced by a pack cost table and refilled weekly. It moves the M2 audience tests onto the new State | 1.1 | Opus, high |
| 1.6 | **Politics, first cut.** Each chamber's state and the accountability ledger, so the acts of April to July 1861 are taken while Congress is away and answered for when it meets (S20); the framing term (0028); blocs and the mandate, recast from M2's `derive`. The press is a report route: its weekly front page is a report in each seat's knowledge, whose effects are proposed to `politics` (blocs) and `people` (standing), so the press needs no owner of its own | 1.1 | Opus, high |
| 1.7 | **Men and regions.** Governors on each side raise regiments on a call, through their own compliance, into new force blocks. One recruitment proposal, applied in one phase, makes each block: `forces` creates it (a new `create` and `disband` delta), `movement` places it at its muster region and `command` assigns it to the governor's post. Block ids derive from content. Enlistment terms run out (the ninety-day men), and their blocks disband. Region loyalty becomes State owned by `regions`, with a loyalty field in the world format and the start (`OPEN_QUESTIONS`), from 1.10's sourced start values. Self-emancipation becomes the derived term 0046 placed, and the people who have reached Union lines become State written by `regions`. A separate gate reviewer reviews it | 1.1; 1.8's registration | Opus, high |
| 1.8 | **The gate for 1A.** It registers in the Union pack's gate every `SENSITIVE-HISTORY` section 3 topic whose window overlaps 5 March to 31 July 1861, with its sources, placements, refused signatures, agency reasons, triggers and protected groups (`OPEN_QUESTIONS`). These include `prisoners-and-exchange`, `self-emancipation`, `fugitive-policy`, `black-enlistment-1861-offers`, `civilian-deaths-1861`, `union-habeas-and-arrests`, `press-suppression`, `guerrilla-war-west`, `cause-of-secession`, `war-aims-1861` and the wording rules. It drafts R4's battle ruling for the lead to decide and record, which 1.3 needs: whether capture in battle and surrender fall under `prisoners-and-exchange`. Off the critical path, it drafts R6 and R7 for 1B. R1's interim rule and R8 are already recorded (0046) and are not redrafted; R2 is 1B's. A separate gate reviewer reviews it | — | Opus, high |
| 1.9 | **Research: the cast.** Values, temperament, regard and stat centres, each cited, for 1A's people on both sides: Lincoln's cabinet, Scott and the department commanders, the governors who raise the regiments, the border states' leaders, and Davis, his cabinet, the Confederate governors who raised and transferred state forces (at least Virginia's, North Carolina's, Tennessee's and Georgia's), Beauregard, J. E. Johnston and Lee | — | Sonnet, high |
| 1.10 | **Research: numbers and facts.** Strengths and stores for the blocks with unknowns (`OPEN_QUESTIONS`, risk 5); the regiments each state raised against the April and May calls, with their terms; the Confederate calls and acts of February to May 1861, and the state forces each seceding state raised and transferred, with dates and terms; start loyalty for the border and upper-South states, checking lane 0.3's proposals in the `control.csv` notes; the Confederate opening's decisions (Davis's cabinet on Sumter, the upper-South conventions; `OPEN_QUESTIONS`); and the 31 July 1861 checkpoint bands, each sourced | — | Sonnet, high |
| 1.11 | **Situations, March to July 1861** (split on 2026-11-16: data entry runs as 1.11a, beside the authoring).  S01 to S21 as pack data; the gated ones are authored only after their topics are registered (1.8), with the gate reviewer's sign-off. Fox's plan in S01, which nobody ordered, enters through `provision-notice`'s temporary post (0040); proposals proper are 1B's. Also:<br>• the Confederate seat opening the war, as the one labelled railroad, with 0040's ordered triggers (Sumter, Pickens, a last date) and fallback, and each side's war-flag decision (0066);<br>• the border-state chains proposing department sides (0065);<br>• the upper South's secessions as notices fired by their causes (among them the call for troops, S09), each proposing its government's side;<br>• the Indian Territory nations' own acts in the window as each nation's notice (0069, 0070), registered under `indian-territory-1861`: the posts abandoned in April and May, the Creek treaty of 10 July, and the Choctaw and Chickasaw treaty of 12 July;<br>• Seward's initiative-menu entry, whose memorandum raises S07;<br>• data entry of 1.9's and 1.10's findings | 1.8's registration and the gate reviewer's sign-off for the gated items; 1.9; 1.10. Options that propose to owners not yet built are reported, not applied (0057), so authoring need not wait for those owners | Opus, high |
| 1.12 | **Rule-seat principals and commander seats.** A rule-seat Lincoln (historical defaults) and Davis who do their historical jobs (section 11): keep March's peace until the opening decisions, hold the capitals, raise and concentrate armies, and set the goals behind the summer's operations. The Confederate seat acts under 0046's interim rule. Also: commander seats that choose among the planner's candidates by their traits. It retires the generic principal (0072) and the stand-in that makes the other side's capital the objective | 1.2, 1.4, 1.5, 1.7, 1.11 | Opus, high |
| 1.13 | **The console on the new kernel, and M2 retired.** A text console with turns of up to seven days that end on the kernel's decision points (0027), an inbox, dispatches, situations, plan review with arrow edits and a preview of the edited route (lane 0.9), the audience, and every verb built in 1A. The verb-list test reads the new kernel. It then deletes M2's `GameState`, `turn`, `theatre`, console, runners and CI steps, and lists what of M2 survives: `compliance`, `directive` and `rules` (section 10). `npm run demo` is ported to the new State | 1.4, 1.5, 1.6; 1.11 and 1.12 before its scripted session | Sonnet, high |
| 1.14 | **The 1A done check.** It extends the runner and the done check (0068) with checkpoint scores, the pushback bands, the unknown-strength and stand-in criteria, and the re-measured tick budget. It calibrates against the sourced bands with a budget of eight measured runs (one change per run, sourced data corrections before engine knobs; section 11), then a continue-or-park ruling | 1.1–1.13 | Opus, high |

After 1.14, **1A's exit review** is a fresh lane that reviewed none of 1A's lanes, as Phase 0's was (0072). Its findings, and the owner's playtest, set 1B's lanes.

Notes for 1A's lanes:
- **1.1 and 1.2 meet at `DirectiveTerms`.** It already exists (`directive.ts`), with a pure `resolveDirective`. Both lanes code against it, and changes to it go through 1.1. The planner maps a plan or an edit to terms, and compliance answers.
  - Both lanes edit `tick/orders.ts`: 1.1 owns `relayOrder` and the filter (`tick/deliver.ts`); 1.2 owns `issueOrder`, `arriveOrder` and the order payload.
  - Conflicting orders (0040) are resolved at 1.2's call site by a compliance function from 1.1.
  - Until 1.1 merges, 1.2 reads traits through the seats layer's trait inputs (`seats/world.ts`), which 1.1 re-points.
- **A response to a goal, a plan or an edit** (rungs and reasons) is written by `proxy`; `plans` holds only a reference to it.
- **1.3 and 1.4 share a battle.** 1.3 emits each battle-day's phases with their hours, and each commander's pursue choice. 1.4 turns them into hour-stamped reports and runs an operation's pursue phase.
- **Planner weights and compliance are calibrated together** in 1.14, one change per measured run, because edit distance comes from the planner's scores (the Phase 0 note above).
- **CI runs the done check at every merge**, so each lane re-bands the liveness gate for the mechanics it changes, from mechanics that change something (0072).
- **Every new kernel default is a pack rule in `WorldRules`**, stated by every pack, with no hidden default (0072). Every new State field gets its `OWNED_FIELDS` entry and its row in section 10. The reserved rows for the Congress ledger and for the people who have reached Union lines get their writers in 1.6 and 1.7.
- **The border-state chains and the upper South's secessions are the first situations to change a department's side** (0065), so 1.11 tests that path on the real pack.
- **Kernel tests use the testbed's fictional terms**, never the setting's (`check:boundary`).

Sequence, within four lanes at once, two of them moving the simulation. Standing lanes are excepted, every gate review counts, and 1.11 is pack data, not simulation.
1. 1.1 (its scanner fix first) and 1.2 (simulation), with 1.8 and 1.9.
2. 1.3 and 1.7 (simulation), as 1.1 and 1.2 merge, with 1.10 and 1.8's gate review.
3. 1.4 and 1.5 (simulation), with 1.11 once 1.10 has closed, and its gate reviews.
4. 1.12 and 1.6 (simulation), with 1.13.
5. 1.14, then the exit review.

The critical path is 1.1 → 1.3 → 1.4 → 1.12 → 1.14. The limit of two simulation lanes sets it: eight simulation lanes need at least four steps, whatever their dependencies. The gate path, 1.8 → 1.11, sits beside it.

**1B, to the midterms.** Its lanes are numbered from 1.15, and sized and ordered after 1A's exit review, from what 1A teaches. Its scope:
- **The home front in full:** the press's leaks; generals as political actors (P6); Congress's sessions and the Joint Committee (S27); and the 1862 midterms state by state, with soldier voting by each state's law.
- **Foreign powers and the blockade:** the British and French pressure clocks and the blockade clock (section 7), which 1A's situations name but no 1A lane builds; and weather (0029), if the history run's winter needs it.
- **The economy:** money (the Treasury and Congress, with the gold premium), munitions (Ripley and Meigs) and rail capacity per named line, each lever with a holder who can stall.
- **People:** stats, assessment, the officer pool and the reckoning (section 6); and the verbs 1A did not need: promotion lists, visit and honour.
- **The planner and operations, second pass:** proposals, the siege method, rivers, rail capacity, ships' stores and blockade stations (lane 0.9).
- **The gate**, each record recorded and registered before its situations:
  - R2 (Black military service), before the Militia Act's situations;
  - R3 (the wars against Native nations, the Dakota War among them);
  - R4 beyond 1A's battle ruling: exchange, parole, camps and retaliation;
  - R6, if 1A did not record it;
  - R7: Frémont's proclamation in 1861, and the decisions of 1862;
  - research for `union-freedpeople-camps`, a whole-topic ship-blocker.
- **Research:** strengths into 1862, the Confederate side's 1862 decisions, and the checkpoint bands to the midterms.
- **Situations** from August 1861 to the midterms, and the principals' 1862 jobs.
- **The Phase 1 done check** and its calibration, then the Phase 1 exit review.

### Phase 2

**Phase 2** is the desk and the staff map. Its done check is set when Phase 1 lands; the working version is that the owner plays Lincoln through 1861–62 at the desk, on the staff map, and finds plan review and the audience worth playing. Phase 2 also yields the public demo (0037, 0039): the desk, the audience and plan review, starting from a later scenario with armies in the field, because the March 1861 start has no armies and so no arrows (0040).

## 13. Open after this design

- The first pack's exact region count and boundaries (lane 0.3).
- Hour-level battle presentation details (with the desk, after Phase 0).
- Which situations ship first, under the sensitive-history gate.
- The officer generator's name sources (the history note lists candidates).
- Setup options beyond the three history modes.
- Campaign length: the first-month walkthrough projects about 26 hours, just over the 15–25 hour target; the turn cap and decision-point settings are the dials, tuned in Phase 1 (0040).
