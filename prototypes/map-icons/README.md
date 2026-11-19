# Staff map symbols

R16 drafts the 36 symbols in `docs/design/ASSETS.md` section 1 for the Phase 2 desk lane to adopt or replace (0090). This package has no contact with the game. Its sheet shows each symbol at 20, 24, 48 and 96 CSS pixels in ink, pencil and faded states, on both required paper stocks.

## Running the sheet

From `prototypes/map-icons/`:

```powershell
npm ci
npm run dev
```

The sheet is at **http://127.0.0.1:5276/**. The server binds only to loopback. The paper, outline and colour-vision controls change the sheet; the search field filters legend names. Both stocks appear initially. For a single stock, use `?stock=linen` or `?stock=letter`; `variant=clean` selects the clean sources and `vision=protanopia`, `deuteranopia` or `tritanopia` selects a simulation.

The server reads `art/app/textures/paper-linen-map.png` and `art/app/textures/paper-letter-2.png` from the checkout. These are the existing R2/R13 outputs and are not copied or modified. The lettering uses the machine's Georgia/Times serif fallback; this specimen does not introduce or redistribute a font, or make a runtime font request.

## Files and use

`icons/clean/` and `icons/rough/` each contain 36 standalone SVGs, each with a recipe. The view box is always `0 0 24 24`. SVG files contain only paths and neutral `currentColor` strokes or fills. They have no lettering, raster references, fixed colours, flags, national emblems or human figures. The headquarters signs are abstract post conventions. The two enemy symbols are broken estimate boundaries.

`src/catalog.mjs` holds the authored clean points. `src/roughen.mjs` subdivides paths at intervals of at most 1.4 units and applies xorshift32 noise within ±0.105 units per coordinate. The seed is keyed by icon id and path index, so reordering unrelated icons does not alter one. Coordinates serialize to 0.001 units. No game random stream is used.

```powershell
npm run generate
```

This rebuilds both sets and their recipes with seed **4816**. `node scripts/generate.mjs --seed=4817` generates an alternative rough set; the checks intentionally expect the delivered 4816 set. Identical sources and seed produce identical SVG bytes. No timestamp enters an SVG. Recipe provenance records the delivery environment; recipes are not claimed to remain identical across different environment variables.

`icons/manifest.json` records every file hash, group, availability and blank annotation slot. `src/strings.mjs` supplies legend names and sheet text. The three spares have no assigned meaning. `courier` and `wire-in-transit` are retained because the brief requests them, but are marked **reserved**: today's seat view has no message-position fields. A game renderer must not place them using invented transit data. `pocket-ring` means the staff's reading from claims, never the kernel's true pocket index.

For adoption, copy the SVG and recipe and record this source path/hash. Inline the SVG to inherit `currentColor` and the CSS state rules in `src/sheet.css`; a plain external `<img>` does not inherit its parent's ink colour. A Pixi texture pipeline must resolve colour, stroke width, dash and opacity before rasterizing. Keep the separate legend and author/date text. Number and initials slot bounds are in the manifest; the consuming renderer typesets their contents, with no baked glyphs. No staleness thresholds, report authors, dates, positions or command behaviour are invented here.

Ink uses a solid 1.8-unit stroke. Pencil uses a 1.65-unit stroke and a 7/3 dash pattern. Faded uses a 1.65-unit stroke, a 4.5/3 pattern and 0.74 opacity. Round caps are included when checking gap visibility. The skin can replace `--ink`, `--pencil`, `--faded` and `--icon-stroke`. State also changes the stroke pattern, so its meaning does not rely on hue.

## Verification

```powershell
npm test
npm run preflight
npm run check
npm run capture
```

Playwright uses an installed Chromium. If none is installed, `npx playwright install chromium` supplies it. Verification starts its own ephemeral loopback server and closes that server and browser when finished. It makes no git call. `npm run preflight` checks loading, both stock images, all 72 cards and 864 samples, search, selectors, asset/source hashes and dependency licences. `npm run check` also runs the four unit tests, silhouette comparisons, 20 px stroke checks, contrast and colour-vision checks. Results and logs go to `art-masters/R16/`.

The silhouette check rasterizes every clean and rough icon at **20×20**. Alpha at least 90/255 becomes foreground. A four-neighbour exterior flood fill closes enclosed holes, removing internal detail from a closed outline; open conventions keep their stroke envelope. Each of the 630 unordered pairs per variant is compared using filled-mask intersection over union, taking the greatest overlap across ±1 pixel of translation. Shifted pixels outside the box still count in the union. Scores **above 0.82 fail**: at least 18% of the union must differ even after that alignment. This deliberately catches near-duplicates rather than relying on their internal lines. It is an engineering screen, not a calibrated human recognition threshold.

Readability checks require at least ten pixels with at least 50% stroke coverage at 20 px, no stroke on the outside pixel border, visible dash gaps in the two broken states, and at least **3:1 graphical contrast**. Contrast composites each computed CSS colour/opacity over the darkest actual pixel in each full 1024×1024 stock, then evaluates each simulation. It describes full-coverage stroke interiors; anti-aliased edges are not claimed to meet that ratio. Full-ink legend text remains available. The native proof sheets support the separate visual check against the legend.

Colour-vision simulation uses the severity-1.0 matrices from **Machado, Oliveira and Fernandes, “A Physiologically-based Model for Simulation of Color Vision Deficiency,” IEEE TVCG 15(6), 2009, 1291–1298**, [author page and Table 1](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html), [DOI](https://doi.org/10.1109/TVCG.2009.113), checked 17 November 2026. The matrices multiply **linear sRGB**, followed by gamut clipping and sRGB encoding. The sheet uses SVG `feColorMatrix` with `color-interpolation-filters="linearRGB"`; numerical checks use the same published matrices in `src/vision.mjs`. Protanopia, deuteranopia and tritanopia are simulations, not alternative production palettes or clinical guarantees.

## Delivery evidence

The final verification passed with Node **22.23.2**, Chromium **159.0.8154.6**, and Playwright **1.65.1**. All four unit tests passed. All **1,260** pair comparisons passed: the highest clean score was **0.809524** (key point/edit number), and the highest rough score was **0.804167** (fort/arsenal). The lowest measured contrast was **3.191266:1**; the fewest strong pixels in a 20 px state sample was **29**. No checked sample reached the pixel border.

`art-masters/R16/capture-results.json` records the final gates. There are **11 Playwright screenshots**: both complete stock sheets at DPR 1 and 2 (3440×1440 CSS viewport), six complete colour-vision sheets at DPR 1, and a 1920×1080 overview. Full stock sheets are 3440×3237 pixels at 1× and 6880×6474 at 2×. Eight `proof-20px-*.png` sheets contain native, unresized crops of all 36 icons in all states on both stocks under normal vision and each simulation. `native-proof.py` and layout JSON files reproduce those review sheets from the screenshots. The maker inspected all eight proofs, the 2× detail and the secondary layout.

The first draft failed on similar silhouettes and border coverage; those shapes and margins were corrected without changing the threshold. Visual inspection then found that round caps concealed the original short dash gaps. The patterns were widened and a check added for that cause. `checks-first-draft.json`, `capture-initial.json` and the correction logs retain the findings; the final screenshot hashes are in `final-checks.json`. Unaffected dependency evidence was reused after the drawing corrections. The repository's `npm run check:licences` passed; this standalone package adds only Apache-2.0 development dependencies (`playwright` and `playwright-core`). No simulation or root build campaign was required for R16.

This remains a **draft pending the standing reviewers**. The maker found the signs distinguishable against the legend, including the broken states, but no independent recognition study or reviewer acceptance is claimed. No desk integration is included. R18, R17 and R15 are separate runs.
