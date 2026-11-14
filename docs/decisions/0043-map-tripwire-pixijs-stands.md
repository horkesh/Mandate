# 0043: The map tripwire: PixiJS stands, and labels get authored hints

Status: accepted (2026-11-14). From Phase 0 lane 0.10, run early on stand-in regions (`prototypes/map-tripwire/README.md`, `results/measurements.json`, screenshots). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0035.

## Context

0035 kept PixiJS 8 and set a tripwire: if labels would cost more than about a week, reopen MapLibre for camera and labels only. The spike measured on an AMD Radeon RX 7800 XT through the hardware path (ANGLE on Direct3D 11), with seeded Voronoi regions clipped to Natural Earth's public-domain state outlines, because census.gov blocks this machine:

- **Bake:** eager bake of 40 regions in 650 ms and 250 regions in 842 ms at device pixel ratio 1 (1.2 s and 1.4 s at ratio 2), in 1,024-pixel tiles over three levels of detail. Panning holds every frame at vsync with 1–3 ms of script.
- **Memory:** GPU memory runs at about 2.2 times the raw texture bytes; four levels at ratio 2 reach 2 GB, so an eager bake of everything is not viable.
- **Hit-testing:** matched an independent id buffer on all 43,089 interior samples, at about 2 µs per pick.
- **Labels:** one curved, letter-spaced name along a spine is legible at two zoom levels, at 1.4–6 ms per zoom change. Only 140 of 250 names fit at the fitted zoom, and the automatic spines are weak on concave regions. The lane estimates 8.5 working days (7–11) for all 250, over the trigger. It judges, without a prototype, that MapLibre would cover about 3 of those days but cost 4–6 days to combine with PixiJS, 11–14 in all.
- **Caveat:** stand-in regions have far fewer vertices than dissolved 1861 counties, so the bake cost will rise on real data.

## Decision

**PixiJS stands for the map, the camera and the labels; MapLibre is not reopened.** The tripwire exists to catch the case where MapLibre would be cheaper, and on the lane's estimate it would not be.

- **Lazy bake:** static layers bake on demand in 512-pixel tiles, with least-recently-used eviction capped by bytes. Budget GPU memory at about 2.2 times the raw texture bytes.
- **Authored label hints:** pack data carries optional hints per region: an anchor, a spine, a size class and a minimum zoom. The world format (lane 0.2) defines them; the map data lane (0.3) fills them where the automatic placement fails. Hints are data, so a modder fixes a label without code.
- **A second tripwire:** when lane 0.3 has its first real regions, re-run `npm run measure` in `prototypes/map-tripwire/` on them. Reopen MapLibre, for labels only, if the re-estimate of label work exceeds about 15 working days or the lazy bake misses the frame budget under a hard pan.

Rejected:
- **Reopening MapLibre now for camera and labels.** More days in total on the lane's estimate, two renderers to keep in step, and the style gap 0035 found (washes, hatching, rough strokes) remains.
- **A MapLibre spike now to firm up the comparison.** Days spent to confirm a judgement that already points the other way; the second tripwire covers the risk with real data.

## Consequences

- The prototype stays in `prototypes/map-tripwire/` as the measuring harness, outside the npm workspaces. Its geometry is generated or fetched at build time and never committed.
- Lane 0.2's world format adds the label-hint fields; lane 0.3 fills them and runs the re-measure.
- Lane 0.3's pipeline must not depend on fetching from census.gov on this machine.
