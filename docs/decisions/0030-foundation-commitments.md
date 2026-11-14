# 0030: Foundation commitments: scenario starts, packs as the modding format, string tables, playable at every phase, a planner spike

Status: accepted (2026-11-14). Recommendations from the lead's foundation checklist; the owner takes recommendations by default. Amends the Phase 0 and Phase 1 plan in `docs/design/FOUNDATION.md` section 12.

## Context

The owner asked to "cover all our bases" before building. These five items are cheap to design in now and expensive to retrofit.

## Decision

1. **A scenario is world data plus a starting state.** The world format (lane 0.2) supports several starts per pack (the March 1861 start first; later starts such as 1862 or 1863 possible) without engine changes.
2. **The pack format is the modding format.** PolyForm Noncommercial (0014) allows noncommercial mods, so pack files get published schemas and validation errors a modder can read (file, field, what is wrong, what is expected).
3. **All player-facing text lives in pack string tables**, keyed by id, from the first line of text. Engine code produces typed reasons and ids, never English (this already follows from 0003). Localisation stays possible without a rewrite.
4. **Playable at every phase.** The owner plays something at the end of each phase, not only after the desk exists. Phase 1 ends console-playable: plan review, arrow edits, audiences and dispatches in a text console, so the core loop is tested before any art.
5. **A planner spike in Phase 0.** The kernel planner (0026) is the hardest technical problem and Phase 1 depends on it. Phase 0 gains a design-and-prototype lane that drafts candidate plans (including a two-commander pincer and a supply-aware route) on the testbed graph, and reports what works before Phase 1 commits to it.

Rejected: a single hard-coded start (mid-war starts would need engine changes later); an internal-only pack format (mods would depend on reading code); English strings in engine code; no human play until Phase 2 (the core loop would go untested through two phases); building the planner without a spike (Phase 1 would discover the hard part late).

## Consequences

- Lane 0.2's scope grows to scenarios, schemas, readable validation errors and string tables.
- A new Phase 0 lane, 0.9, runs the planner spike (Opus, high).
- Phase 1's done check adds the console-playable loop.
