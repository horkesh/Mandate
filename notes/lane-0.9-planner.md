# Lane 0.9 hand-over: the planner spike

Branch `phase0-planner-spike` (worktree `.claude/worktrees/phase0-planner-spike`), from `origin/main` at ea8d8f6. Built to FOUNDATION section 12 row 0.9 and the brief from the lead, on `docs/research/2026-11-14-planner-design.md` (its proposals taken as candidates). Prototype in `prototypes/planner-spike/`; nothing under `packages/` is edited. The root `tsconfig.json` and `vitest.config.ts` gain one include each so the spike's tests run under `npm run check`.

## The answer

**Yes.** A cheap generate–filter–score planner produces believable candidates on the testbed, at a cost the tick can afford, and the 0026 edit grammar edits them. Three things are not yet good enough, and they are calibration and data, not shape (see "What did not work"). No case needed an authored, per-situation template (AWWV's catalogue warning).

| Spike criterion | Result |
|---|---|
| Each case gives at least two distinct candidates | Yes: 2–5 per draft across 3 cases × 4 seatings × 2 intelligence biases; a holding action is always on the menu |
| Every score is the exact sum of typed terms, each with a reason | Yes, asserted for every candidate in the test matrix |
| Every rejected method reports every gate | Yes (never only the first, AWWV P10) |
| Pincer when two posts flank a salient, with a support request and an arrival window | Yes: a competent commander drafts it with a `cooperating_axis` request to the other army's holder; a low-competence one is refused with `max_axes` |
| Supply-aware route: the steady man takes the supply line, the bold man the overextended road | Yes |
| Small joint naval relief | Yes: troops afloat in another post's ship, a `naval_support` request to the squadron's holder, and a boom across the channel cleared deliberately or forced in a night |
| Character visible in the picks | Yes: top picks differ between men in every case |
| One edit of each grammar kind, re-scored | Yes, with distance, the kernel's compliance answer, and the concrete plan behind each covert rung |
| Determinism | Same canonical hash twice and under permuted regions, edges, forces, posts and beliefs |
| Cost | Testbed: 0.10–0.21 ms median, p95 at most 0.53 ms per draft. Union-size graph (270 regions, 971 edges): 3.3–4.7 ms median, p95 at most 5.8 ms |
| Size | About 1,330 lines of planner code with comments, under the note's 1,500 |

## What is built

| File | What it does |
|---|---|
| `types.ts` | Goal, force stand-in, profile, routes, axes, phases, support requests, gates, contributions, candidates, draft sets |
| `context.ts` | The request's input (`PlannerInput`), the pack-tunable `PlannerRules`, and a per-request influence field of perceived threat |
| `route.ts` | Integer Dijkstra on priced permille days, ordered (cost, region id); penalty-method alternatives; waypoint chaining; a reverse distance tree to refuse retrograde routes |
| `profile.ts` | The planning profile from 0058's stand-in boldness and the kernel's `demandRatio`; beliefs through the kernel's `perceptionBias` and `perceived` |
| `axes.ts` | A route expanded into phases: concentrate, march, works to reduce, clear or run past, depot steps, assault; block splitting |
| `score.ts` | Ten typed terms, weighted by the profile; the reinforcement request and "move when reinforced" condition for a shortfall |
| `methods.ts` | Direct, flank, supply line, pincer (with a partner post, or his own two axes), by water (two variants), holding |
| `planner.ts` | Generate, filter, deduplicate, rank, keep the top four plus a holding action |
| `edits.ts` | The five edits, distance from his judgement, the mapping to `DirectiveTerms`, the kernel's `resolveDirective`, and concrete plans for reinterpret and slow walk |
| `testbed-cases.ts`, `cli.ts`, `measure.ts` | The three cases, a printer, the measurements |
| `test/planner.test.ts` | 25 tests |

### How it maps to lane 0.5's types

The force stand-in is `ForceBlockStart` field for field (`id`, `post`, `region`, `kind`, `arm`, `strength`, `storesDays`, `aboard`). Posts are `PostStart`'s `id`, `holder`, `parent`, `region`, `kind`. When `forces` and `command` land, `PlannerInput.forces` and `posts` are read from State instead of the start; nothing else changes. Fortification is read from the start's `fortification` until `regions` owns it. The network is `phase0.networkConditions(start)`, as lane 0.4 left it for `infrastructure`.

## The three cases, as drafted

On the `opening` start in April. The four seatings are the testbed's appointee (boldness 500, competence 350), organiser (200, 650), fighter (800, 650), and a steady-competent stand-in (500, 650) seated as the appointee because the cast has none.

**1. Pincer: take the Harrow Bulge.** The Army of the Westwatch (8,000 men) against 8,200 perceived by a man of pivot boldness (7,100 reported at the Bulge plus a quarter of the 4,400 behind it); the timid man perceives 15,580.
- Appointee: direct assault, else hold. The pincer is refused (`max_axes`).
- Organiser: **holds**, and his direct assault carries a request to the principal for 16,628 men and "move when reinforced". The pincer is third.
- Fighter and steady: direct assault first, pincer second, with the Army of the Eastwatch on a `cooperating_axis` request to its holder (the organiser) and an arrival window of two days.
- With the intelligence overstating the enemy by 1.5x to 3.25x, the pincer becomes the fighter's pick; from 1.75x to 2.5x, the steady man's. The pincer appears when a man believes one army is too few.

**2. Supply-aware: march on Southvale.**
- Steady and appointee: **supply line**, the direct road through the Wending Valley and Harrow Neck with a depot step before the last leg, so the longest stretch beyond supply is 4 days instead of 6.
- Fighter: **direct**, 6 days beyond supply, no depot step; the flank over Highcairn is second. The supply-line method gives him no different plan (his tether is longer than the march), so it is deduplicated.
- Organiser: **holds**. His own direct route already avoids the fort and the Neck (the mountain road), and his flank is refused for doubling back through Brenn Junction.

**3. Joint naval relief: Gull Rock.** The relief troops (200 men) are aboard the *Resolute* of the Home Squadron, a different post.
- Every moving candidate is by sea, Kestrel Haven to Gull Sound to the fort, 6 days, with a `naval_support` request to the Home Squadron's holder (the commodore). The relief's own ship post is vacant; the request goes to the post that holds the carrier.
- The boom (works not modelled as an installation, closed to everyone by 0054) is met two ways: **clear first** (4 days, safe) and **run in** (1 night, 4,000 men-equivalent of threat). The organiser, appointee and steady man clear it; the fighter forces it and arrives 3 days earlier than he would by clearing it.
- The holding action is "assemble and await word" (0040's "prepare, await my word").
- Land methods are refused with `no_route`; the gates are reported.

## Measurements

**Cost per draft.** Testbed (30 regions, 51 edges): 0.10–0.21 ms median, p95 at most 0.53 ms, 4–7 route searches, 2–5 candidates. Union-size synthetic grid (270 regions, 971 edges, from the kernel's performance fixture): 3.3–4.7 ms median, p95 at most 5.8 ms, 8–10 searches. The note's budget was 10 ms per request at p95 on the testbed and 25 ms at Union size; both pass with room.

**Projection to the Union map at corps level.** About 30 commands draft (20–24 corps and 7–8 armies, war-scale note). Drafts are made on request (a goal, a send-back, a redraft, a stall), never daily. At a redraft per command per week that is about 4.3 drafts a day, about 20 ms at p95; with the note's queue cap of 4 drafts a day, at most about 23 ms on the worst day. That fits the 40 ms tick beside a map rebuild (measured 3–8 ms) but leaves little room, so **cap drafting at 3 a day at Union scale, or run drafting at the turn boundary when the player sets goals** (the usual case, where 5 ms is instant at 3440×1440). Cheap savings if needed: reuse the direct route across methods (already done), cache the reverse distance tree per objective, and stop each search at the objective (already done).

**How often the pick changes.**
- Boldness 0 to 1000 in steps of 50 (competence 650): the pincer case changes once (hold, then direct, at 350); the supply case three times (hold, supply line at 350, direct at 600, flank at 950); the naval case once (clear first, then run in at 700).
- Intelligence overestimate 1x to 4x in steps of 0.25: of 12 case-seatings, 6 never change, 4 change once (the steady and appointee give up the supply line and hold at 2.75x) and 2 change twice (the pincer appears, then direct returns when even two armies seem too few). The naval case never changes: no enemy stands at the objective.

**Term liveness** (dropping a term changes the top pick, in 36 situations): time 13, supply 10, exposure 10, goal fit 8, force ratio 8, caution 4, dependence 2, glory 2, coordination 1, **haste 0**. Haste is an edit-only term (drafts always concentrate as long as he wants); it is live in edit distance. The liveness gate must count edits as well as drafts, or it will call haste dead.

**One edit of each kind** (`measure.ts`):

| Edit | On | Score | Distance | Terms that fell | His answer |
|---|---|---|---|---|---|
| Objective to Harrow Neck | fighter's direct assault | 677 to 590 | 87 | time, exposure | complies with reservations |
| Waypoint via Fenmere | fighter's march on Southvale | 812 to 639 | 173 | time, supply | objects (grievance) |
| Timing: move now | organiser's march | −623 to −951 | 1000 | haste 360 | refuses: too rash |
| Add an axis on the Bulge | steady man's march | 317 to −338 | 735 | coordination, exposure, supply | objects: too rash |
| Remove the partner axis | fighter's pincer | 592 to 677 | 0 | force ratio | complies with reservations (short of men) |

An edit that reproduces one of his own routes has distance 0, and farther waypoints give a non-decreasing distance (tested). An unreachable waypoint is refused as a validation failure with its reason. Reinterpret executes his own candidate nearest the edit; slow walk stretches the edit's timing by his concentration days.

## What did not work, or not yet

1. **The pincer is rarely the pick at true strength.** With the kernel's stand-in demand of parity (1000‰) for a pivot man, one army at 1:1 looks sufficient and the pincer pays for coordination and dependence. It wins only when intelligence overstates the enemy. That is defensible, but it hangs on the demand table, which is a stand-in. Phase 1 should set the demand ratio with a margin for an assault on a held region (say 1500‰ at the pivot) and re-run this case.
2. **The absolute plan-to-directive mapping was wrong**, and was replaced. Mapping a plan's risk terms to an absolute boldness put the fighter's own favourite plan at about 530, which compliance read as "too timid" and he objected to his own plan. Boldness is now relative: his best candidate maps to his own boldness, and an edit moves it by the change in risk. Phase 1's compliance recast should take this form.
3. **The scorer first had no cost for haste.** Shortening a timid man's concentration raised his score (he arrived earlier). The `haste` term fixes it, scaled by his caution. It shows that edits exercise terms drafts never do.
4. **Penalty-method flanks wander.** The first flank for the timid man went back through the capital and round by the coast, 18 days. Two gates fix it: a length limit (1.6x the direct route) and refusing any route that passes a region farther from the objective than its start. On the sparse testbed graph the penalty method often finds no flank at all (a one-edge objective), which is reported as a `duplicate` gate.
5. **A waypoint far from the axis yields a wild route.** "Via Fenmere" routes through the capital, because the constrained route minimises his priced cost. That is correct, but the plan-review screen must preview an edited route and its distance before the player sends it.
6. **Garrison detachments marched with the army** until the default commitment excluded detachments (0040's detachment below its brigade). Lane 0.5's goal default should do the same.
7. **Two scoring-weight iterations were used**, as the note's stopping rule allows: the early-arrival bonus scaled up for bold men, and the haste term added. The weights are design parameters, not calibrated.

## Choices, with what was rejected

1. **Route cost in permille days** (days with season through the kernel's `edgeLeg`, plus threat, supply and works converted to days). *Rejected:* hours (the note's D3), a second unit beside lane 0.4's permille days.
2. **Movement passes enemy land; supply does not.** Land regions pass whoever holds them; rail needs the permission and both ends traced by his side; river and sea need their permission; off-map never. *Rejected:* reusing supply passability (an army could never march into enemy ground).
3. **Threat is a one-hop influence field** of his already-biased beliefs (his belief plus 250‰ of his neighbours'), built once per request. *Rejected:* reading truth; a multi-hop field (blurs the salient on a small graph).
4. **Perception bias stays in belief derivation** (`beliefsFor` applies the source's bias, then his, with the kernel's `perceived`), as 0052 requires. The profile has no perception field. *Rejected:* a bias knob in the planner (two owners of one bias).
5. **The profile derives from boldness and competence only** (0058's stand-ins): risk weight, supply care, glory, concentration and pause days, maximum axes. *Rejected:* AWWV's float personality; values (empty until Phase 1).
6. **Methods expand one level** (direct, flank, supply line, pincer with a partner or two own axes, by water in two variants, holding), each returning every gate. *Rejected:* search over futures; an authored operation catalogue; HTN beyond one level.
7. **The flank is a penalty-method alternative** (double the direct route's edges), kept only if it shares under 600‰ of the direct route's regions, is at most 1.6x as long, and never doubles back. *Rejected:* plain k-shortest paths (near-duplicates); the penalty method without the two gates (wandering routes).
8. **The supply line is the direct route with depot steps** whenever the stretch past supply would exceed his tether (his stores times his want of supply care), and supply is scored on the longest stretch, not the total. *Rejected:* a maximum-capacity route (no capacity-bound route differs on the testbed); scoring total days outside supply (depot steps would earn nothing).
9. **A pincer's partner is a friendly post with forces staging beside the objective**; its axis becomes a `cooperating_axis` request to that post's answering holder, walking up the chain past vacancies. *Rejected:* drafting the partner's axis as the commander's own (he cannot order another army, 0052).
10. **Water axes** use a carrier (the ship his troops are aboard, else his own naval block); a carrier of another post makes a `naval_support` request. Works on a water edge are reduced (forts in reduction mode), run past (passage mode) or cleared (unmodelled works), deliberately or by force. *Rejected:* ships moving by player order (hard rule 1); treating the boom as impassable (no relief is possible).
11. **Scoring is ten typed terms** whose sum is the score, plus gates and conditions. A shortfall never fails a plan: it adds a reinforcement request to the principal and "move when reinforced". *Rejected:* a score clamp (breaks the sum); failing short plans (the timid man would have no attack to offer).
12. **Deduplication** drops a candidate over the same ground, with the same phase shape, arriving within 1.5 days of a better one. *Rejected:* overlap alone (it merged the boom's two variants).
13. **The menu is the top four moving plans plus a holding action**, ranked by score then candidate id. *Rejected:* returning everything (menus of eight).
14. **Edit distance** is his best candidate's score minus the edited plan's, clamped to 0..1000, with the terms that fell as reasons. The plan maps to `DirectiveTerms` with boldness relative to his best, `required` from his demand, and an "overruled" grievance scaled by distance; the kernel's `resolveDirective` answers. *Rejected:* absolute plan boldness (finding 2); a separate obedience roll.
15. **Candidate ids are content-derived** (method, variant, each axis's regions), computed once. *Rejected:* counters (one new candidate would renumber the rest).

## Recommendation for the Phase 1 planner

**Shape.** Keep this one: generate, filter, score; one level of methods; an integer route search with penalty alternatives; typed terms and gates; a holding action always offered; edits re-expanded by the same machinery and scored by his scorer. Add, in this order: a siege method (0029) for fortified objectives, the river variant of the water method (the Mere past Corran Fort), and a rail-capacity check on rail legs (the README's capacity-1 branch line is not yet read). Calibrate the demand table with an assault margin before judging the pincer again.

**Module boundary** (FOUNDATION section 10):

| Module | Layer | Owns |
|---|---|---|
| `planner` | pure function | `draft(world, derived, view, request) → DraftSet` and `applyEdit`; route search, methods, scoring, distance. Reads beliefs from the commander's view, never truth |
| `plans` | State | stores each draft set on its request day, the chosen candidate, edits as counter-orders (unchanged from today's table) |
| `movement` | writer | also exports the **movement passage rule**, which `planner` imports, so a plan never routes where movement cannot go (one owner) |
| `compliance` | pure | maps an edited plan to `DirectiveTerms` with boldness relative to his best (finding 2) and decides the rung |
| shared | — | the binary heap moves out of `supply` so `planner` imports it rather than copying it (FOUNDATION section 11, rule 11) |

The planner's inputs are then all owned elsewhere: World, the derived map, `forces`, `command`, `regions` (fortification), `infrastructure` (obstructions), and the commander's beliefs from `knowledge`.

## Findings outside my scope

1. **Compliance recast (Phase 1):** a plan's boldness must be read relative to the man's own best plan, or bold men object to their own plans (finding 2). Responses also need conditions ("move when reinforced", "if the navy supports"), as the planner-design note's finding 4 said.
2. **Trait stand-ins:** `demandBase` 1000 makes a pivot man attack at parity. The Phase 1 trait table should carry an assault margin.
3. **Lane 0.5:** a goal's default commitment should exclude garrison detachments; the movement passage rule should be exported for the planner; and clearing unmodelled works (a boom) needs a writer in `infrastructure`, or a relief can never reopen the fort's supply line.
4. **Liveness gate (lane 0.8):** count scoring terms over edits as well as drafts, or `haste` reads as dead.
5. **Plan review (Phase 2):** preview an edited route and its distance before sending; a distant waypoint can produce a route the player did not mean.
6. **Navy stores:** ships and boats are treated as carrying their own stores (supply 0 at sea). A navy stores rule is needed before long voyages or blockade stations matter.
7. **Pincer partner selection** takes the first adjacent post by id, and the partner's own willingness enters only as a flat dependence term (regard is 0 under the stand-ins). In Phase 1 the request should be scored by the partner holder's regard and values.
8. **Retiring the spike:** remove its include lines from the root `tsconfig.json` and `vitest.config.ts`.
