# Map tripwire spike (lane 0.10, decision 0035)

**Question.** On this machine's GPU, does PixiJS 8 carry the staff map's static bake and labels at a cost we can afford, or should MapLibre be reopened for camera and labels (0035's tripwire)?

**Verdict: PixiJS stands. Do not reopen MapLibre.** Camera, tiled bake, hit-testing and frame time pass with a wide margin. Labels are the schedule risk the survey predicted. Full-quality labels for about 250 regions cost about **8.5 working days after this spike (range 7–11)**, which is over the literal "about a week" trigger, so I am flagging it plainly. I do not think it should reopen MapLibre: the part MapLibre would give us (collision and line-following text) is only about 3 of those days, and putting Pixi's drawn layers next to MapLibre's camera costs more than that (estimates below, not prototyped). The lead should rule on whether 0035's trigger means "more than a week" or "more than the MapLibre route". Section 5 has the numbers and section 7 what I'd change in 0035.

Everything here ran on one machine, one display, one Chromium. See "What this does not prove" at the end.

## 1. Setup and what ran on the GPU

| | |
|---|---|
| GPU | **AMD Radeon RX 7800 XT**, driver 32.0.32015.7029; CPU Ryzen 7 5700X, 32 GB RAM, Windows 11 |
| Browser | Chromium 151.0.7922.34 (the build Playwright had already installed), **headed**, `--use-angle=d3d11 --ignore-gpu-blocklist` |
| Display | 144 Hz (`CurrentRefreshRate` 144; steady-state `requestAnimationFrame` interval is 6.95 ms) |
| Renderer | PixiJS 8.23.0, `preference: 'webgl'` (WebGL 2). WebGPU not tried |
| **Hardware or software?** | **Hardware.** `UNMASKED_RENDERER_WEBGL` = `ANGLE (AMD, AMD Radeon RX 7800 XT (0x0000747E) Direct3D11 vs_5_0 ps_5_0, D3D11)`, `MAX_TEXTURE_SIZE` 16384, and the Windows GPU-process dedicated-memory counter rises with the bake. For contrast I forced SwiftShader (`gpu: 'software'`): renderer string `SwiftShader`, max texture 8192, GPU-process memory 0, frames 32–34 ms (about 30 fps) against 6.95 ms on hardware |
| Viewport | 1600×900 CSS px, device pixel ratio 1 and 2 |

Raw numbers: [results/measurements.json](results/measurements.json). Re-print them with `npm run summarize`.

### Stand-in data (why it isn't Census)

- **census.gov blocks this machine** (Cloudflare 403 "you have been blocked", for scripts, the in-app browser and the user's Chrome alike), so the Census cartographic boundary files could not be fetched and their licence could not be read on the Census site. The lead ruled out a Wayback fallback and a GitHub mirror.
- **Natural Earth** loads, and its terms page says: "All versions of Natural Earth raster + vector map data found on this website are in the public domain." (https://www.naturalearthdata.com/about/terms-of-use/, read 2026-11-14; `npm run fetch` re-checks the sentence and refuses to continue without it, writing it to `data/ne/LICENCE.txt`.) Used: `ne_10m_admin_1_states_provinces` (land outline) and `ne_10m_rivers_lake_centerlines`.
- **Regions are synthetic**, from a fixed seed (`scripts/generate-regions.mjs`, seed `0x4D414E44`): seeded Voronoi cells clipped to the state outlines, plus the hard cases the tripwire needs: 4–8 km-radius **key-point regions** carved out of their neighbours, and long thin curved **strip regions** carved the same way. Borders are roughened at load time by our own seeded value noise (displacement is a function of position, so shared borders stay shared at every zoom; no Rough.js).

| Set | Regions | Area / keypoint / strip | Extent | Smallest / median region | Vertices after densify |
|---|---|---|---|---|---|
| `regions-40` | 40 | 31 / 6 / 3 | 745×453 km (VA, WV, MD, DE, DC) | 56 / 5,385 km² | 17,500 |
| `regions-250` | 250 | 206 / 30 / 14 | 1,830×2,021 km (PA to FL, IL to the Atlantic) | 62 / 9,463 km² | 100,001 |

The 40-region set is the tripwire; the 250-region set is the same recipe at the size 0031 asks for, so the bake numbers extrapolate from a measurement, not a guess. The generated GeoJSON is git-ignored; `npm run fetch && npm run generate` rebuilds it byte for byte. The loader (`src/geo.js`) takes any lon/lat GeoJSON (`properties.kind`: `land`, `river`, or a region), so lane 0.3's real regions can drop in.

### Run it

```bash
cd prototypes/map-tripwire
npm install
npm run fetch && npm run generate
npm run dev            # http://localhost:5273/?data=regions-40   (or regions-250; keys 1/2/3 zoom, 0 reset)
npm run measure        # headed Chromium on the GPU, all scenarios, about 10 minutes; or: node scripts/measure.mjs A40-dpr1
```

Page parameters: `data`, `tile` (px), `mode=eager|lazy`, `lods`, `opt=1`, `glsync=1`, `maxtiles`, `labels=0`.

## 2. The bake

**Painter:** Canvas 2D on one reused scratch canvas, uploaded straight to a Pixi texture (`CanvasSource`), then reused for the next tile. Per tile: sea, engraver's water lines, land wash, region fills, **hatching on every region** (worst case), two-pass rough ink borders, rivers clipped to land, coast. Tiles carry 4 px of real neighbouring content on each side so bilinear sampling shows no seams, and the hatching is phase-locked to the global pixel grid (my first version restarted the hatch at every tile edge; fixed).

**LODs:** the camera runs from 0.9× to 4× the "fit" zoom. Static layers are baked at 1×, 2× and 4× fit (device px), and the sprite scale is 1/LOD, so the active LOD is always the smallest one at least as sharp as the view.

### Measuring honestly (this matters for lane 0.3's tooling)

Canvas 2D paint calls only *record* commands. Timed naively, a 1024-px tile "paints" in 0.2–0.4 ms. The real cost shows up when the GPU finishes the raster, so every number below forces completion by reading one pixel of the uploaded texture (`glsync=1`; this avoids reading the canvas back, which pushes Chrome toward CPU rendering and made tiles slower). "Mean tile" is paint plus upload plus GPU completion. The first tile of a page costs 175–260 ms extra (canvas GPU init and shader compile) and is included in the LOD 0 rows.

### Bake time and memory (1024-px tiles, eager, 3 LODs = 1×/2×/4× fit)

| Run | Tiles | Total bake | Mean tile (LOD 0/1/2) | Raw texture bytes | **GPU-process dedicated memory, before → after** | JS heap |
|---|---|---|---|---|---|---|
| 40 regions, DPR 1 | 32 | 650 ms | 66 / 22 / 16 ms | 130 MB | 125 → 435 MB (+310) | 17 → 24 MB |
| 250 regions, DPR 1 | 21 | 842 ms | 176 / 47 / 30 ms | 85 MB | 123 → 343 (+220) | 17 → 22 MB |
| 40 regions, DPR 2 | 126 | 1,201 ms | 31 / 13 / 7 ms | 512 MB | 176 → 1,241 (+1,065) | 17 → 22 MB |
| 250 regions, DPR 2 | 69 | 1,435 ms | 63 / 23 / 17 ms | 280 MB | 179 → 801 (+622) | 17 → 26 MB |

- Preparing geometry is cheap: fetch and parse 7–15 ms; project, densify and roughen 12 ms (40) and 33 ms (250); `Path2D` build 2 and 7–12 ms.
- **GPU memory is about 2.1–2.3× the raw texture bytes** (Windows `\GPU Process Memory(pid)\Dedicated Usage`; adapter-wide counters agree). I did not find where the other half goes (ANGLE/D3D11 staging copies are my guess). Budget for it.
- 250 regions cost about twice the 40-region set per tile (30 ms against 16 ms at the same pixel size) because more regions and a longer coast cross each tile. Region count matters less than vertices and clip paths per tile.
- Two cheap optimisations (`opt=1`): skip the whole-coast stroke for tiles that don't touch the coast, and hatch with one pattern fill per region instead of clip plus stroked lines. They cut the 250-region bake by 15–20% (903 → 720 ms at DPR 1) and made no measurable difference for the 40-region set (620 → 618 ms). Without GPU sync both looked far better than they were. They are worth keeping, not decisive. The DPR 1 rows above are the plain painter; the DPR 2 rows use `opt=1`.
- Profile (`profile=1`, 250 regions; it reads the canvas back after each phase, so treat it as indicative): water lines and land 335 ms, hatching 332–493 ms, borders 128–153 ms, coast 70 ms, fills 34 ms, rivers 52–60 ms of about 1 s. The whole-land outline (about 50k vertices) is stroked five times per tile in the naive version.

### Eager baking does not scale; bake visible tiles lazily

Four eager LODs at DPR 2 on the 250-region set (top LOD 12,524×13,804 px, still under this GPU's 16,384 limit, over SwiftShader's 8,192):

| Tile size | Tiles | Total bake | Mean tile at top LOD (max) | Raw texture bytes | GPU-process memory after |
|---|---|---|---|---|---|
| 512 | 922 | 6.4 s | 5.8 ms (28) | 951 MB | 1.85 GB |
| **1024** | 251 | 3.7 s | 11.9 ms (35) | 1,020 MB | 2.21 GB |
| 2048 | 70 | 2.5 s | 29.6 ms (82) | 1,129 MB | 2.13 GB |

**Tile size:** 1024 px (4 MB per tile) for baking everything up front: fewest draw calls and least overhead per megabyte, and it fits every texture limit in the survey's data (8,192 is the floor). **512 px for lazy baking:** a synchronous bake can't be interrupted, so the tile is the hitch. A 512 tile costs 6–8 ms (28 ms worst), a 1024 tile 12–50 ms, a 2048 tile up to 82 ms. 2048 wastes memory on edge tiles and hitches. So: bake LOD 0 eagerly, bake finer LODs per visible tile, evict least-recently-used by **bytes** (not tile count).

Lazy, 5 LODs (1×–16× fit), DPR 2, scripted pan at 900 CSS px/s (a hard flick) with a 6 ms per-frame budget, cache cap about 690 MB raw (about 1.4–1.5 GB of GPU memory):

| Set / tile | Tiles baked during sweep (×2/×4/×8/×16) | Frames over 20 ms (of about 550 at ×2/×4/×8) | Worst frame |
|---|---|---|---|
| 250 regions, 1024 | 4 / 25 / 45 / 62 | 2 / 13 / 15 / 3 | 42 ms |
| 250 regions, 512 | 14 / 89 / 155 / 195 | 9 / 29 / 30 / 0 | 35 ms |
| 40 regions, 1024 | 24 / 44 / 44 / 43 | 3 / 8 / 8 / 2 | 35 ms |
| 40 regions, 512 | 80 / 147 / 142 / 142 | 1 / 0 / 0 / 0 | 21 ms |

At the hardest pan I tried, 0–6% of frames are late; the longest was 42 ms (about 6 vsyncs at 144 Hz, 2.5 frames at 60 Hz). Real play pans slower and can prefetch the tiles ahead of the pan, so I read this as workable but needing the prefetch and a byte cap. A worker with `OffscreenCanvas` would take the bake off the main thread; I did not test it.

## 3. Camera and frame time

Own camera (about 40 lines: wheel zoom at the cursor, drag pan, keys 1/2/3 jump to 1×/2×/4× fit); no library. The screenshots show three zoom levels:

| | 40 regions | 250 regions |
|---|---|---|
| 1× fit (overview) | [screenshot](screenshots/r40-zoom1-overview.jpg) | [screenshot](screenshots/r250-zoom1-overview.jpg) |
| 2× | [screenshot](screenshots/r40-zoom2-mid.jpg) | [screenshot](screenshots/r250-zoom2-mid.jpg) |
| 4×, on a key point | [screenshot](screenshots/r40-zoom4-close-keypoint.jpg) | [screenshot](screenshots/r250-zoom4-close-keypoint.jpg) |

Steady state, panning a Lissajous path over the whole map at each zoom, 4 s per level, 3 LODs, 1024 tiles, DPR 1 (hardware):

| Set | Zoom | Frames | rAF interval mean / p95 / max | Over 20 ms | JS time per frame mean / p95 / max |
|---|---|---|---|---|---|
| 40 | ×1 | 573 | 6.96 / 7.00 / 13.8 ms | 0 | 0.96 / 1.4 / 2.8 ms |
| 40 | ×4 | 574 | 6.95 / 7.00 / 7.1 | 0 | 0.75 / 1.2 / 2.2 |
| 250 | ×1 | 574 | 6.95 / 7.00 / 7.1 | 0 | 1.75 / 2.5 / 4.4 |
| 250 | ×2 | 574 | 6.95 / 7.00 / 7.1 | 0 | 2.22 / 3.2 / 8.8 |
| 250 | ×4 | 574 | 6.95 / 7.00 / 7.3 | 0 | 2.57 / 4.7 / 8.4 |

Every frame lands on the 144 Hz vsync. The uncapped cost (render plus `gl.finish`, so GPU time included) is 0.2–0.3 ms mean for 40 regions and 0.7–1.2 ms for 250 regions, p95 at most 2.2 ms. DPR 2 gives the same (250 regions: 0.64–1.0 ms mean). Steady-state frame time is not the risk. The risk is the lazy bake in section 2.

Memory in steady state: JS heap 17 MB at start, 21–27 MB after the bake, 31–39 MB with 250 labels and some panning (about 50 MB after the lazy sweeps).

## 4. Hit-testing

`src/hit.js`: a uniform 25 km grid over region bounding boxes plus exact even-odd point-in-polygon on the roughened rings (holes included). Rules, in order: (1) a region that is **small on screen** (longest side up to 28 px) wins if the cursor is inside it or within a 12 px pick radius; (2) otherwise the region containing the cursor (smallest if several); (3) otherwise the nearest border within 4 px (this covers the gaps at the coast and between rings). Tolerances are screen pixels, so they shrink in map terms as you zoom in.

Checked against an **independent id-buffer** (every region filled in a flat colour on a canvas, `evenodd`), on interior pixels only (all four neighbours the same id), 20,000 random samples per run:

| Check | 40 regions ×1 / ×4 | 250 regions ×1 / ×4 |
|---|---|---|
| Point-in-polygon agrees with the id-buffer | 10,880 of 10,880 / 9,883 of 9,883 | 9,783 of 9,783 / 12,543 of 12,543 |
| Cost per `pick` | 1.7 / 1.5 µs | 1.95 / 1.75 µs |
| Points on region borders (about 30 per ring): result is null | 0 | 0 |
| Border points: result touches that spot (within 1.5 px) | 1,900 of 1,905 / 1,905 of 1,905 | 10,073 of 10,468 / 10,422 of 10,468 |
| A point 1.5 px *inside* a region picks that region | 1,788 of 1,794 / 1,894 of 1,894 | 7,556 of 7,963 / 8,995 of 9,061 |

The misses in the last two rows are all the small-region rule doing its job: near a key point, the pick goes to the key point rather than the region the cursor is over (395 of 10,468 border points at 250 regions, ×1, where all 30 key points are 4–7 px across). They are not wrong picks of far-away regions; at ×4, only 46 of 10,468.

**Small regions** (key points, 4–8 km radius; at fit zoom they are 18–33 px across in the 40-region set and **4–7 px in the 250-region set**), hit rate by distance outside the region's edge, for regions that qualify as small on screen:

| Distance outside edge | 0 px | 4 px | 8 px | 12 px | 16 px | 24 px |
|---|---|---|---|---|---|---|
| 250 regions ×1 (n = 120) | 100% | 100% | 96.7% | 81.7% | 0% | 0% |
| 40 regions ×1 (n = 12) | 100% | 100% | 100% | 91.7% | 8% | 0% |
| 250 regions ×4 (n = 112) | 100% | 100% | 100% | 85.7% | 0% | 0% |

Without the rule (pure inside test) a point even 1 px outside the edge always misses; inside by 3 px is 100% either way. The 12 px radius is a 4–7 px target made easy to hit, as intended. Regions that are not small on screen get no special treatment and are hit only inside them.

**End to end in Playwright**, mouse moved over a key point on the 250-region map at fit zoom, reading the HUD: centre → `r239 inside`; 6 px beyond the centre → `r239 small`; 14 px → the surrounding region `r034` (beyond the pick radius, since the point is about 5 px wide). Hover also draws the region outline in blue pencil (visible in the screenshots).

## 5. Labels

**One curved, letter-spaced name along a path, legible at two zoom levels.** The strip region "Yarton Valley" at the fit zoom and at 3× ([fit](screenshots/r40-label-strip-zoom1.png), [3×](screenshots/r40-label-strip-zoom3.png); the 250-region equivalents are [fit](screenshots/r250-label-strip-zoom1.png) and [3×](screenshots/r250-label-strip-zoom3.png)). Large regions curve along their own shape too ("Upper Barhaven", "Dunholm", "Marby" in the same shots).

How it works (`src/labels.js`, about 150 lines):
- **Spine:** grid samples inside the region, principal axis, centroid of each bin along the axis, smoothed three times. Text runs left to right.
- **Layout per zoom:** font size from region width in screen px (clamped 9–28), letter-spacing widened to fill about 80% of the spine up to 0.55 em, each glyph placed by arc length and rotated to the tangent. Glyph advances are measured once (Georgia stands in for the survey's IM Fell face).
- **Fit and collision:** glyph centres must lie in the region (85% of them); each glyph is a circle in a screen-space grid, greedy by priority (strips first, then area), three size attempts, else hidden. Key-point names are small horizontal labels to the right of the point, shown once the point is at least 11 px across.
- **Drawing:** one `BitmapText` per glyph over a single shared atlas (installing the font once; without that, Pixi created a bitmap font per label). Zoom changes redo the layout; panning only moves sprites.

| Cost | 40 regions | 250 regions |
|---|---|---|
| Build (spines, glyph objects) | 90–120 ms | 500 ms |
| Layout per zoom change | 1.4–1.8 ms | 4.6–6.4 ms |
| Reposition per frame while panning | 0.06–0.14 ms | 0.17–0.41 ms |
| Labels shown at 1× / 2× / 4× | 31 / 36 / 38 of 40 | 140 / 193 / 219 of 250 (244 at 16×) |

Machine cost is a non-issue. **Quality is the issue**: at fit zoom only 56% of the 250 names fit (the rest are hidden, correctly, but a staff map wants more of them shown), and PCA spines are weak on concave or multi-part regions (some names cut across a border: "Normont" and "Aarhaven" in [the 40-region overview](screenshots/r40-zoom1-overview.jpg)). Names from a seeded syllable generator repeat across the 250 set; cosmetic.

### Estimate: labelling all about 250 regions

Basis: what this spike took plus the gaps I can see in it. Estimates, not measurements; ±30%.

| Work | Spike has | Remaining (working days) |
|---|---|---|
| Robust spines (medial axis or ridge of the distance field; islands, concave and multi-part regions) | PCA and bin centroids, fine for convex shapes | 1.5 |
| Placement: oriented-box collision, priority tiers, size classes, zoom-dependent show/hide with hysteresis so labels don't flicker while zooming | greedy circles by area | 1.5 |
| Pack-authored label hints (anchor, spine override, size class, min zoom), a way to preview and edit them, and hand-tuning about 250 regions (I'd expect 20% need fixing) | none | 2.5 |
| Typography: self-hosted OFL face, crisp at every scale (multi-resolution or SDF atlas), halo, kerning with tracking, two-line names, wait-for-font | Georgia, one 100 px atlas | 1.0 |
| Key-point and town labels, river and ridge names (reuse the spine code) | horizontal key-point names only | 1.0 |
| Live-layer interaction (dim or hide labels under fronts and orders), golden screenshots, perf pass | separate screen-space layer | 1.0 |
| **Total remaining** | about 1 day spent | **8.5 (range 7–11)** |

**Against the tripwire (about one week):** over, by itself, by 2–6 days. **Against MapLibre:** MapLibre would give collision, line-following text, `text-letter-spacing` and min/max zoom, which is roughly the second row (1.5 days) and half of typography (it still needs glyph PBFs built from the font: 0.5 day). We would still write the spine generation (1.5) and the hint authoring and tuning (2.5). The expensive part is the other side: our washes, hatching and rough strokes are outside MapLibre's style specification, so Pixi layers would have to sit beside or inside it (camera sync, two coordinate systems, two canvases or a custom layer), and hit-testing and the fronts layer would still be ours. I put that at 4–6 days of integration plus a re-check of everything measured above, for a total of 11–14 days against 8.5. I did not prototype MapLibre, so this comparison is judgement, not evidence. The survey's own caveat that MapLibre's non-Mercator support was unchecked also applies.

## 6. Verdict and reasons

**PixiJS stands.**

1. **Rendering is not the problem.** On the RX 7800 XT every steady-state frame lands on the 144 Hz vsync with 1–3 ms of JS and about 1 ms of GPU. Hit-testing is 2 µs and agrees with an independent rasteriser on all 43,000 interior samples tested.
2. **The bake is affordable only if it is lazy and capped.** 1–1.5 s eager at 3 LODs is fine, but 4–5 LODs at DPR 2 reach 2 GB of GPU memory (about 2.2× the raw texture bytes). Tiles of 512 px, baked per visible tile with LRU eviction by bytes and prefetch, keep a hard pan to about 0–6% late frames. This changes how the bake is planned, not which renderer we use.
3. **Labels cost about 8.5 more days, over the one-week mark, but MapLibre doesn't beat that.** Most of the label cost is spine quality and authoring, which we pay under either option. I recommend 0035 accept this cost and schedule it as a Phase 2 lane rather than reopen MapLibre.

## 7. What I'd change in 0035

1. State the bake as **lazy, 512-px tiles, LRU eviction by bytes** (cap about 300–400 MB of raw texture, which is about 700–900 MB of GPU memory on this stack), with LOD 0 eager. Keep "tiles because of texture limits", and add that 1024 or 2048 px tiles hitch.
2. Record the **2.2× GPU memory factor** and the DPR 2 numbers; any wording that implies a whole-map texture at 4× needs the factor.
3. Make the trigger precise: "labels cost more than a week" is met by a full-quality 250-region label system on either route, so say "more than the MapLibre route would", or accept about 2 weeks for labels. The lead decides.
4. Add **authored label hints in pack data** (anchor, spine, size class, min zoom) with generated defaults; that, not collision, is the cost.
5. Add a note for tooling lanes: Canvas 2D paint timings need a GPU completion (read one pixel of the uploaded texture); without it they are off by 100×.
6. Add **census.gov blocks this machine** (Cloudflare 403) to the pipeline notes: lane 0.3 must not depend on fetching from census.gov locally.

## What this does not prove

- **One machine, one browser:** a fast discrete GPU (RX 7800 XT), Chromium 151, a 144 Hz display. Integrated GPUs, the Steam Deck and Electron's Chromium are untested. The software run shows the failure mode (30 fps), not a middle case.
- **Synthetic regions.** Voronoi cells have far fewer vertices than dissolved 1861 counties. Bake cost grows with vertices per tile (the 250-region set is 100k vertices; the real set could be several times that), so expect the per-tile numbers to rise. Re-run `npm run measure` on lane 0.3's regions before the Phase 2 bake design is final.
- **Rough borders** here are a position-keyed noise displacement plus a second wobble pass, not the final ink style. Hatching on every region is a deliberate worst case; hatching at fit zoom also shows some moiré.
- **WebGPU** and an `OffscreenCanvas` worker bake were not tried.
- **Labels:** placement is a greedy spike; the day estimates are mine.
- GPU memory is one Windows counter (process dedicated usage, cross-checked with the adapter total), not a profiler capture.

## Files

- `scripts/fetch-natural-earth.mjs`, `scripts/generate-regions.mjs`: data (git-ignored output under `data/`)
- `src/geo.js` (loader, noise), `src/bake.js` (tiles, LODs), `src/hit.js`, `src/labels.js`, `src/main.js` (camera, bench and test hooks)
- `scripts/measure.mjs` (Playwright runs), `scripts/summarize.mjs`, `scripts/smoke.mjs`, `scripts/lib.mjs`
- `results/measurements.json`, `screenshots/`
