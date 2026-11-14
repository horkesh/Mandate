# 0054: Control, fronts, pockets and supply

Status: accepted (2026-11-14). From Phase 0 lane 0.4 (`notes/lane-0.4-control.md`, fifteen choices, each with what it rejected) and the standing reviewer's two passes (approved after fixes). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION sections 4 and 10, and decisions 0013, 0019, 0029, 0044, 0050 and 0052. Amended by 0055 (neutral regions are passable unless their government closes them).

## Decision

**Control** is State (`regionControl`), set from the scenario start and written only by `control`, through typed deltas whose cause is `combat` or `occupation`. Every change and threshold crossing is reported with its cause. A delta that changes nothing is no change.

**Holders and fronts** are derived. A region's holder is the faction with the largest share, if it reaches the supply threshold (250‰) and no other faction's share equals it; a region two factions both trace is contested. A contact edge joins regions with different holders, and each side's front segment faces the enemy (0013). Segments join into one line around a salient. The control index is a function of any control table, so the staff map can draw fronts from a seat's claimed control with the same function. A region's wire owner is its holder (0052).

**Passage.** Land regions and key points pass only if traced. River and sea regions are open water, passable by every side (blockade is Phase 1). Off-map boxes are never passed. Works named by an installation close their edge to everyone but the holder of the installation's region; unmodelled works close it to everyone.

**Supply** is derived. A source supplies whoever traces its region; a forward depot supplies only while a source's path reaches it, capped by that feed. Paths take the fewest days, then the larger capacity, in permille units, so seasons never round away (0029). A pocket is a group of traced regions with no supply path, reported with its cut (the first region or edge its side cannot pass). Allocation runs in priority order, sharing each edge's capacity between both directions and both sides.

**Map events are truth, not decision points.** A pocket closed, relieved or lost, and control changes, are returned with their terms. The decision point belongs to the report of them, written when a garrison or the staff reports it (0046's two triggers): a turn ending on the truth would tell the player what no report has said.

**Caches** of derived data are keyed by a signature computed from the State they read (bands, holders, the month, the network), tied to their World, held by the caller and never saved, so they cannot drift.

**Invariants** check control every tick and, in tests and CI, compare the cached map with a fresh one; a failure throws with every typed failure and nothing repairs State.

**Performance.** A full rebuild at the Union map's size (270 regions and 971 edges in the test) is bounded at 25 ms within the 40 ms tick, measured at about 5 ms on Linux CI and 7 ms on Windows CI.

Rejected: fronts wherever both sides hold any share; a holder at a simple majority; an index that only reads truth; control on water regions; obstruction regardless of who holds the works; depots as free sources; maximum flow; whole-day units; pockets as control components without a source; a version counter bumped by the writer; map events as decision points.

## Consequences

- FOUNDATION's module map moves pockets to `supply` and widens `control-index`. Section 10's cache sentence now describes signatures, and the decision points name the report of a pocket or of a garrison's stores, not the event.
- Lane 0.5 closes the seams in the note: it builds network conditions from infrastructure State, proposes control deltas from combat and occupation, makes message latency read `wireOwnerOf`, and calls allocation from its stores step.
- The staff map's lane first moves the control-table types out of the module the seat boundary refuses.
