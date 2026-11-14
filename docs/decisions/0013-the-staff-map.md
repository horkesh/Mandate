# 0013: The map is the staff's map: hand-drawn, procedural, drawn from claims

Status: accepted (2026-11-14). The owner asked for maps that are "beautiful and handdrawn but adaptable, with HoI4 influence lines". This record supersedes the "map last" ordering in proposal P17. Prototype: `prototypes/map-style/`. Extended by 0019 (what the map is: regions over a typed graph).

## Context

- HoI4's front lines and battle-plan arrows are the clearest strategic-map language players know. But HoI4 draws them from ground truth.
- In Mandate the player never sees ground truth (0008, P4).
- AWWV rebuilt its map four times (Canvas 2D → 3D → MapLibre → Deck.gl).
- Hand-painted base maps are beautiful but cannot adapt to new scenarios or packs.

## Decision

1. **The map is diegetic.** It is the map the staff keeps on the leader's desk, drawn only from the faction's view. Its line language:
   - ink: confirmed by more than one source;
   - pencil: a single report, with the author and date written beside it;
   - red (or the pack's correction colour): an overseer's correction, striking out the original;
   - blue pencil (the pack's own colour): the leader's own orders;
   - fading: information ages, so a stale report fades.
2. **HoI4-style front lines**, derived from the adjacency of *claimed* control. They are drawn segment by segment, each with its source status and teeth facing the enemy. Orders are broad, hatched, hand-drawn arrows.
3. **Procedural and data-driven.** Pack geometry (GeoJSON regions, rivers, coast, relief ridges, towns) goes in, and the hand-drawn map comes out. An **era skin** is pack data: palette, lettering, relief style (hachures / glyph mountains / contours), unit symbology, scale units, and desk material. Hand-made art is limited to ornaments per pack (cartouche, compass, seals).
4. **Production tech.** The prototype uses live SVG filters. They are too slow to paint at desktop sizes: building the SVG took 33 ms, but painting timed out repeatedly at a 1.5× device pixel ratio. The production renderer will therefore:
   - bake static layers (paper, washes, relief, coast, water lines) once per scenario into textures;
   - draw dynamic layers (fronts, arrows, notes, counters) live;
   - use a 2D WebGL renderer (PixiJS) with d3-geo for projection.

   It stays 2D, not 3D.
5. **A developer truth layer** overlays ground truth for testing and calibration only. It is never shown in a shipped game.

Rejected:
- a GIS tile stack (MapLibre / Deck.gl): excellent for data, wrong for hand-drawn, and it is the path AWWV churned on;
- 3D;
- hand-painted base maps per scenario (not adaptable);
- live SVG filters in production (too slow).

## Consequences

- Region geometry becomes part of every pack. Candidate open sources, licences to be verified per pack:
  - 1860 county boundaries (Newberry Atlas of Historical County Boundaries) for the Union;
  - Ancient World Mapping Center / Pleiades for Rome;
  - geoBoundaries for Ukraine.
- The kernel's `Region` gains optional geometry references (not geometry itself; the kernel stays geometry-free).
- The map is built as part of the desk UI (M3 at the time; Phase 2 in the current roadmap), not after it.
