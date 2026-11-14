# 0062: The planner's shape: generate, filter and score, with one level of methods

Status: accepted (2026-11-15). Applies 0026 and 0030. From Phase 0 lane 0.9's planner spike (`prototypes/planner-spike/`, `notes/lane-0.9-planner.md`) and the standing reviewer's approval (`review-lane-0.9.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

Decision 0026 says the kernel drafts candidate plans deterministically, from the goal, the commander's state and the map, and the commander's seat picks one. The spike asked whether a cheap planner could draft believable candidates at an affordable cost, which the edit grammar can then change. On the testbed it can.
- **The cases:** a pincer with a cooperating-axis request; a supply-aware route; and a naval relief that clears or forces a boom.
- **Character:** the plans change with the commander's boldness and his overestimate of the enemy.
- **Edits:** all five edit kinds re-score through the commander's own scorer.
- **Cost:** 3–5 ms per draft on a 270-region graph.

## Decision

**The Phase 1 planner keeps the spike's shape.**
- **Generate, filter, score.** Methods expand one level: direct, flank, supply line, pincer, by water, and hold. Each method returns every gate it hit.
- **Routes:**
  - routes are searched in integer permille days;
  - a flank is the penalty-method alternative, kept only if it shares under 600‰ of the direct route's regions, is at most 1.6 times as long, and never doubles back.
- **Scoring:**
  - the score is the sum of typed terms (hard rule 6);
  - a shortfall adds a reinforcement request rather than failing the plan;
  - the menu is the top four moving plans plus a holding action;
  - candidate ids are derived from content.
- **Character** comes from boldness and competence, and the enemy overestimate is applied in belief derivation (0052), never as a planner knob.
- **Edits** are re-expanded by the same machinery and scored by the commander's own scorer. Edit distance is his best candidate's score minus the edited plan's.
- **Compliance reads a plan's boldness relative to the commander's own best plan,** not on an absolute scale. Otherwise a bold general objects to his own favourite plan.

**Module boundary (FOUNDATION section 10):**
- **`planner`** is a pure function, `draft(world, derived, view, request)` and `applyEdit`. It reads beliefs from the commander's view, never truth, and that includes what he believes of fortifications and obstructions: a commander learns of a boom by report.
- **`plans`** (State) stores each draft set, the chosen candidate, and edits as counter-orders.
- **`movement`** owns the passage rule (`marchBar` and `marchSteps`), and `planner` imports it. The spike's own copy retires.
- **`compliance`** maps an edited plan to directive terms.
- **The binary heap** moves out of `supply` into shared code.

**Neutral ground needs the goal's permission** to march through, as rail, river and sea do. Supply still passes open neutral ground (0055, 0058).

**The daily drafting cap is a pack rule.** Lane 0.8 measures the worst day on the real Union graph and sets the cap's starting value.

**Additions in Phase 1, in this order:**
1. a siege method for fortified objectives (0029);
2. the river variant of the water method;
3. a rail-capacity check;
4. an assault margin in the trait table, after which the pincer case is run again;
5. a reinforcement condition that applies only past a shortfall share scaled by caution, as a pack rule;
6. an assault or reduction phase where a route meets enemy-held ground.

Rejected:
- **Search over futures** (Total War's tree search). That is where its turn time went.
- **An authored catalogue of operations.** It is AWWV's warning: generated plans decay behind authored ones.
- **HTN beyond one level, and a float personality.**
- **Plain k-shortest paths for flanks.** They return near-duplicates.
- **Absolute plan boldness.** A bold general objects to his own plan.
- **A bias knob in the planner.** It would make two owners of one bias.
- **A second copy of the passage rule in the planner.** It would make two owners of one truth.

## Consequences

- **When the spike retires:** delete `prototypes/planner-spike/`, and remove its include lines from the root `tsconfig.json` and `vitest.config.ts`.
- **Lane 0.8:**
  - count scoring terms over plan edits as well as drafts in the liveness gate;
  - measure the worst drafting day on the Union graph, after a battle as well as on a quiet day.
- **Phase 2 plan review** previews an edited route and its distance before the order is sent.
- **Phase 1 open questions** (already filed): navy stores, and scoring a pincer partner's willingness by his regard and values.
