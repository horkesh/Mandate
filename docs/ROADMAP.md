# Roadmap

The game and engine were redesigned on 2026-11-14 (decisions 0014–0026; design in [design/FOUNDATION.md](design/FOUNDATION.md)). The phases below come from FOUNDATION section 12.

## Done

- **M0 Foundations** (2026-11-13): repo, decisions, kernel primitives, and a demo of three proxies answering one directive differently.
- **M1 People kernel, headless** (2026-11-14): persons, posts, directives and the compliance ladder, claims with authors, the insubordination ladder, standing, the leader's record, latency and attention, in a scripted 20-turn run with typed reasons. Gaps in [design/KERNEL.md](design/KERNEL.md).
- **M2 Union 1861–62 slice, console** (built 2026-11-14): the Audience with typed counters, `packs/union-1861`, and `npm run play`. Its pending playtest and calibration are superseded by the redesign; its people core and Union people data carry into Phase 1.

## Next

| Phase | Goal | Done when |
|---|---|---|
| **Phase 0: foundation and world** | Engineering foundations (CI on Linux and Windows, typed IDs, canonical serialization and state hash, versioned saves, one-writer and verb-list architecture tests, liveness counters); world format v2 with regions, typed edges and provenance; the Union 1861 map and order of battle; control, fronts, pockets and supply as derived indexes; forces, command, movement and a simple control contest; seats, per-seat knowledge, kernel-owned latency, the player-visible boundary and the command log; the situations schema and the sensitive-history checklist; a headless runner | A headless run on the new kernel, on the Union 1861 map and order of battle, with rule seats holding standing goals, moves divisions, changes control through a simple deterministic contest, and derives fronts, pockets and supply; and it gives the same state hash on Linux and Windows CI, resumes from a mid-run save to the same final hash as the continuous run, passes the liveness gate for every Phase 0 mechanic, keeps the surviving tests named in FOUNDATION section 10 passing, and stays inside the tick budget |
| **Phase 1: the war machine** | The kernel planner and plan selection; operations; combat with breakdowns and shaded reports; the people core recast for goals, plans and edits; stats, assessment and the officer pool; politics, the press and the 1862 midterms; the economy; attention | A headless history run of 1861–62 reaches the midterms with checkpoints in plausible bands |
| **Phase 2: the desk and the staff map** | One inbox, the audience scene, the org chart, the ledger, and the hand-drawn staff map (0013) drawing regions, fronts and arrows from the player's knowledge | Set when Phase 1 lands. Working version (FOUNDATION section 12): the owner plays Lincoln through 1861–62 at the desk, on the staff map, and finds plan review and the audience worth playing; the map never shows ground truth |

Later, on the same machinery: the full war to 1865, a playable Confederacy (which needs its own record under the sensitive-history gate, 0026), playing a general, and multiplayer (0015). Rome is a possible later game, not a milestone (0018).
