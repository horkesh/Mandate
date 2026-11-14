# Lane 0.4 hand-over: control, fronts, pockets and supply

Branch `phase0-control` (worktree `.claude/worktrees/phase0-control`), on top of 3028889. Built to FOUNDATION section 12, row 0.4, on lane 0.2's World (0050) and lane 0.6's copy-on-write State (0052). M2, the seats layer, replay and the save fixture all still run.

## What is built, and where

| Piece | Where |
|---|---|
| **Control** as State (`regionControl`), set once from the scenario start, written only by `control` (`applyControl`, from typed `ControlDelta`s), with every change and threshold crossing returned with its cause | `packages/kernel/src/control/control.ts` |
| **The control index** (Derived): holdings with reasons, contested regions, contact edges, front segments facing the enemy and front lines, components, wire owners | `packages/kernel/src/control-index/control-index.ts` |
| **Supply** (Derived): origins (sources, and depots their paths reach), paths with legs, season and condition effects, rail lines and breaks of bulk, pockets with where they are cut, allocation in priority order | `packages/kernel/src/supply/supply.ts` |
| **The derived map and its cache**, rebuilt only when a holder, a threshold band, the month or the network changes | `packages/kernel/src/control-index/derived.ts` |
| **Invariants**: typed post-tick failures for control and the derived map (including "a cached derivation equals a fresh one") | `packages/kernel/src/invariants/map.ts` |
| **The tick's map phases**: control changes, the derived map, pocket closed, relieved and lost events, the invariant barrier | `packages/kernel/src/tick/map.ts`, wired into `tick/tick.ts` |
| **An integer calendar** (the month for seasons; the kernel has no `Date`) | `packages/kernel/src/world/calendar.ts` |
| **The seats runner carries the map**: on a v2 pack, its first start sets control, and the map phases run every day with deep checks, in CI on both machines | `packages/cli/src/seats-run.ts` |
| Tests | kernel `calendar`, `control`, `control-index`, `supply`, `map-derived`, `map-tick`, `map-performance`; `packs/testbed/test/control.test.ts` |

State gains two root fields, both built only in `createState` (0052): `regionControl` (owned by `control`, `OWNED_FIELDS` "region control") and `calendarStart` (the start's ISO date, immutable, in `IMMUTABLE_STATE_KEYS`). **The save fixture was regenerated** (`npx tsx tools/make-save-fixture.ts`): State changed shape, and the testbed seats run now carries the v2 map's control.

## Performance (FOUNDATION section 9: a day tick under about 40 ms)

On a synthetic graph at least the size of the Union draft (now 270 regions and 971 edges against the draft's 263 and 931; rail rows, a river, seasons, ten contested regions, pockets). Measured at review on the 250-region version:

| Measure | Reference machine | CI Linux | CI Windows | Bound asserted |
|---|---:|---:|---:|---:|
| Full rebuild: control index and supply for both sides | 2.6 ms | 5.3 ms | 8.2 ms | 25 ms |
| A quiet day: signature, cache hit, control invariants | 0.29 ms | 0.39 ms | 0.74 ms | 2 ms |
| A year of days, control still, the month turning (14 rebuilds) | 110 ms | 191 ms | 328 ms | 1.5 s |
| Deep invariants (fresh rebuild compared; tests and CI only) | 16 ms | 33 ms | 50 ms | not budgeted |

The bounds come from the design budget, not a machine (review S3): a rebuild under 25 ms still fits the 40 ms tick. They are medians measured while the other test files run in parallel. On the grown 270-region graph a rebuild takes 3.6 ms on the reference machine. On the testbed seats run (180 days) the map was rebuilt 6 times: once on day 1, then at each new month.

## Choices, with what was rejected (for a decision record)

1. **A region's holder** is the faction with the largest share, if it reaches the supply threshold and no other faction's equals it; a region two factions both trace is contested, held by the larger. Fronts, wire owners and obstruction manning read the holder. *Rejected:* fronts wherever both sides have any control (every soft border becomes a front); holder at a simple majority of 501 (ignores the pack's threshold, 0019).
2. **Fronts.** A contact edge joins regions with different holders; each side gets a segment that faces the other's end (0013). Segments form one line when their own ends touch inside the faction's territory or their faced ends touch inside the enemy's, so a front around an enemy salient is one line. *Rejected:* grouping by friendly adjacency alone (the testbed's front around the Harrow salient split into three lines, since the three northern regions around it do not touch).
3. **The index is a function of any control table**, so the staff map (0013) can draw fronts from a seat's claimed control with the same function. Before it can, the staff map's lane must move `RegionControlTable` and `ControlShares` into a module with no `State` import: the seat-api boundary refuses `control.ts` today, which is right until then (review N5). *Rejected:* a truth-only index.
4. **Passage.** Land regions and key points pass only if traced (250 permille); river and sea regions are open water, no one's, passable by every side (blockade is Phase 1); off-map boxes are never passed. Control on open water or off the map is refused at setup and is an invariant failure. *Rejected:* control on water regions (the start has none, and no mechanism writes it yet); treating water as impassable (the testbed's island fort could never be relieved).
5. **Obstructions.** Works named by an installation close the edge to everyone but the holder of the installation's region; unmanned works (no holder) close nothing; works not modelled (a boom, hulks: `by: null`) close it to everyone. *Rejected:* obstruction regardless of who holds the works (a captured fort would still bar its captors).
6. **Supply origins.** A source supplies whoever traces its region. A forward depot supplies only while a source's path reaches it, capped by that feed, and days count from the nearest origin (wagons haul from the depot). *Rejected:* days from the source always (a depot would change nothing); depots as free sources (supply from nothing).
7. **Path choice:** fewest days, then larger capacity, by Dijkstra on that key, which is monotone along a path, so both are exact. Ties beyond them are broken where two paths first meet, by smaller origin id then smaller edge id: deterministic, but local, so the final path is not always the one from the globally smallest origin (review N1; a test pins the case). *Rejected:* maximum flow (FOUNDATION section 4 rules it out); widest path first (less readable than "the line to X").
8. **Units: permille days and permille capacity**, so a season's 1.5 on a one-day edge, or a 0.6 on capacity 1, is never truncated away (0002: integers, one truncation rule). *Rejected:* whole days and whole capacity (mud would do nothing to the shortest edges, and low water would close capacity-1 rivers outright).
9. **Pockets are traced regions with no supply path**, grouped by adjacency, each with a **cut**: the first region or edge the faction cannot pass on the shortest way in over the whole map (`not_traced`, `edge_cut`, `obstructed` with the installation, or `no_origin`). This is FOUNDATION's "cut at X". *Rejected:* pockets as control components without a source (misses a component cut by a destroyed bridge or a boom).
10. **Allocation in priority order**: each demand takes what its path's origin and edges still have. Edge capacity is shared by both directions and both sides; a depot's feed is not charged (Phase 0 simplification). No force blocks yet, so nothing calls it in the tick; lane 0.5's stores-on-hand step will.
11. **The cache key is a signature computed from State** (each faction's band per region, the holder, the month, the network), held by the caller, never saved, and reused only on the World it was made on (review N4). A test swaps 300/550 to 550/300 to prove the holder term matters (review S1). *Rejected:* FOUNDATION section 10's version counter bumped by the writer (another State field that could drift from the control it describes; a holder can change hands, 600/400 to 400/600, with no threshold crossed). The cached index carries only what the key determines (holder, reason, who traces), so it is never stale; exact shares come from `rankShares`, read fresh.
12. **Wire owner = holder** (0052). Open water and off-map boxes have none. *Rejected:* every region a side has any share of (both sides' wires in one county).
13. **Map events are truth, not decision points.** A pocket closed, relieved (a supply path reaches it again) or lost (no longer traced: overrun or abandoned, review S2), control changes and crossings are returned as `mapEvents` with their terms. A delta that changes nothing is no change and no firing (review N3). FOUNDATION section 9 lists "a pocket closed" as a decision point, but a turn ending on it would tell the player a truth his reports have not; the decision point belongs to the report of it, when lane 0.5 or 0.6 writes one.
14. **The invariant barrier** checks control every tick (cheap) and, with `deepChecks`, compares the derived map with a fresh derivation (tests, the seats runner and CI). A failure throws `InvariantError` with every typed failure; nothing repairs State (AWWV M3).
15. **The map seam.** `IndexedWorld` gains `map` (lane 0.2's indexed World) beside the stand-in comms map, and `createState` takes the scenario start exactly when there is a map. The two maps sit side by side until lane 0.5 replaces the comms World. *Rejected:* waiting for lane 0.5 (control would stay untested in play); replacing the comms World here (lane 0.5's brief).

## Stand-ins and seams, labelled in code

| Seam | Who closes it |
|---|---|
| The network is intact in the tick (`INTACT_NETWORK`): no edge or depot damage, no obstructions | Lane 0.5's `infrastructure` State, passed as `NetworkConditions` (`networkConditions(...)` already turns start-shaped lists into one) |
| No control deltas are proposed in play (`control.changed` is dead on the testbed) | Lane 0.5's control contest and occupation push `ControlDelta`s into the tick context |
| Wire owners derive from control, but the seats layer still routes messages over the comms map's fixed wire owners | Lane 0.5, when its World replaces the comms map: `LatencyMap.region(id).wireOwner` reads `wireOwnerOf` |
| `allocateInPriorityOrder` has no callers in the tick | Lane 0.5's stores-on-hand step |

## For later lanes

- **0.5:** propose control changes as `ControlDelta` into `ctx.controlDeltas` with a `ControlCause` (`combat` or `occupation`; a new proposer joins `CONTROL_CAUSES` and `OWNED_FIELDS` together); read fronts and supply from the tick result's `map` or `deriveMap` with the run's cache; build `NetworkConditions` from infrastructure State; the retreat threshold is `rules.retreatControlPermille`; make the comms latency read `wireOwnerOf`.
- **0.6 / 0.7:** a seat learns of a pocket only from a report. A garrison's or staff report of being cut off is the decision point (choice 13).
- **0.8:** the liveness gate needs bands for `MAP_MECHANICS` once control moves (`map.pocket_closed`, `map.pocket_relieved`, `map.pocket_lost` count different histories); `map.recomputed` per month is the quiet baseline.
- **0.9:** supply paths carry days, capacity and legs per region, for a supply-aware route.
- **The staff map (Phase 2):** call `buildControlIndex` on the control a seat's reports claim.

## Fixes after review (`review-lane-0.4.md`, approve after fixes on be61968)

One commit per group, each with a positive control that fails without the fix: S1 (the holder term in the cache key) and S4 (`component_overlap`); S2 (relieved and lost pockets apart); S3 and N6 (the bound from the tick budget, the fixture at the draft's size); N1 to N5 (the tie-break comment and a pinned case, `ControlCause`, no-op deltas, the cache tied to its World, the staff map's type move noted).

## Findings outside my scope

1. FOUNDATION section 10's day tick lists control changes as phase 5 after combat; in code they run after the stand-in standing goals, the only movement there is until lane 0.5. The order holds once movement and combat land before it.
2. FOUNDATION section 10 says derived caches are keyed by a writer-bumped version counter; choice 11 uses a signature instead. If the lead accepts it, the sentence wants a word.
3. FOUNDATION section 9 lists "a pocket closed" as a decision point; choice 13 says it should be the report of one. That is a design ruling for the lead.
4. The World has no telegraph lines, so every held land region counts as wired. If wires should follow lines (they ran along railways), the format needs a per-edge or per-region telegraph flag (lane 0.3's data).
