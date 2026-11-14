# Staff map prototype (decision 0013)

This is a single-file prototype of the hand-drawn staff map. It shows one fictional dataset (the testbed's Two Rivers on day 51) in three era skins, plus a developer toggle that overlays ground truth.

```bash
node tools/serve-static.mjs prototypes/map-style 4173
```

Then open http://localhost:4173.

What it demonstrates:
- **Line language:** ink is confirmed, pencil is a single report, red is an inspector's correction, blue pencil is your orders, and old news fades.
- **HoI4-style front:** a heavy line with teeth toward the enemy, inked where telegraph-confirmed and pencilled where it rests on one general's word.
- **Broad hatched order arrows**, with the proxy's declared answer written beside them.
- **Era skins as pure style:**
  - 1862: ink on linen, hachured ridges, engraver's water lines, miles;
  - Rome: parchment, Cinzel capitals, glyph mountains, *milia passuum*;
  - 2022: topo sheet under acetate, contours, marker notes, km.
- **Developer truth view:** the real front, true strengths, what Pell actually did, and his hidden mood.

Known limits: live SVG filters are slow to paint at large sizes, so production will bake static layers (see 0013). The geometry is hand-placed, not GeoJSON. Labels are placed by hand, not by a placement algorithm.
