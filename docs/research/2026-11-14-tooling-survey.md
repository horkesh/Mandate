# Research: the tools and libraries Mandate will need, surveyed before building

Date: 2026-11-14. Status: research note (not canon).

**Why now.** AWWV found MapLibre a month in and rebuilt its map four times. The owner wants the whole tool list in front of us before Phase 0, so that no tool arrives as a surprise.

**Conventions.**
- Citation keys in [brackets] resolve in the Sources list at the end.
- **Versions, licences and dates were read on 2026-11-14** with `npm view` (registry metadata only; nothing was installed), the GitHub API through `gh`, crates.io, and the tools' own pages. "Pushed" is the repository's last push; "latest" is the registry's `latest` tag. I took no version from memory.
- **[gk]** = general knowledge, not checked today. **[I]** = my interpretation or estimate. **(snippet)** = seen only in a search summary, or a page that refused automated fetches. Verify before relying on any of these.
- "Cost to learn" is my estimate [I], for someone who already writes TypeScript.
- Nothing here is legal advice. Where a licence matters I quote its page.

**Settled, not reopened.** The staff map is hand-drawn, procedural and 2D, with static layers baked and dynamic layers live (0013). The map has about 250 regions and about 800 authored edges (0031). Packs are the modding format, and all text lives in string tables (0030). AI is voice, never state (0022). The repo is PolyForm Noncommercial with the owner free to license commercially (0014), so third-party dependencies must be licences we can ship in a commercial build.

---

## 1. Map rendering

### 1.1 Candidates

| Tool | Version | Licence | Maintenance | What it is |
|---|---|---|---|---|
| PixiJS | 8.23.0 | MIT | pushed 2026-11-11; 48.7k stars | 2D renderer on WebGL, WebGPU or Canvas fallback; docs say TypeScript 5, 6 or 7 [PIXI-LLMS], [npm], [gh] |
| MapLibre GL JS | 6.18.0 | BSD-3-Clause | pushed 2026-11-13; 5.x still patched (5.24.1 on 2026-11-11) | GPU vector-tile map library [MAPLIBRE-GH], [gh] |
| deck.gl | 9.4.1 (npm) | MIT | pushed 2026-11-14 | Large-data layers over a map (a GIS layer library) [npm], [gh] |
| d3-geo | 3.1.2 | ISC | pushed 2026-11-03 | Projections and path generators; no renderer of its own [npm], [gh] |
| Konva | 10.9.1 | MIT | pushed 2026-11-10 | Canvas 2D scene graph with events [npm], [gh] |
| Rough.js | 4.6.6 | MIT | last npm publish 2023-11-20; last push 2024-07-28 | Hand-drawn-style strokes and fills [npm], [gh] |

### 1.2 How each fits the job

The job: about 250 regions, baked hand-drawn layers, live arrows and fronts, labels, pan and zoom, and a desktop wrapper.

- **PixiJS** draws the dynamic layers on the GPU, shows baked layers as textures, and has a texture-generation system for baking from a scene [PIXI-LLMS]. It has no map concepts (no projection, no label placement, no hit-testing by geography). We supply those. d3-geo gives the projection.
- **MapLibre** brings a good label engine (collision, line-following text), hit-testing and a camera with inertia [gk]. Its model fights this map in four ways:
  1. Its documentation says "GeoJSON is tiled internally for rendering", and features come back from vector-tile data [MAPLIBRE-GEOJSON]. Our geometry is a single small projected plane, so tiling adds clipping and quantising for no gain [I].
  2. Its API lists a globe control and no other projection family [MAPLIBRE-DOCS]. I did not check whether Albers-style projections exist in 6.x; Web Mercator at 30-45°N would stretch the map away from the look of period maps [I].
  3. Hand-drawn washes, hatching and rough strokes are outside its style specification. They would arrive as raster or image sources, or as custom WebGL layers [MAPLIBRE-DOCS]. That puts us back in a bake pipeline, now feeding MapLibre.
  4. Our dynamic layers (arrows, fronts, teeth, fading pencil) would be GeoJSON source updates re-tiled in a worker on every change [I].
- **deck.gl** is for million-row data on top of a map. It adds a second rendering stack and no label or hand-drawn help. No.
- **d3-geo on SVG** is the prototype that painted too slowly (0013). **On Canvas 2D** it is excellent for a one-time bake. See 1.3.
- **Konva** is the easy scene graph, but it is Canvas 2D only, so animated hatched arrows at 4K and high pixel ratios run out of fill rate sooner than Pixi [I].
- **Rough.js** is effectively unmaintained (last push 2024). We need a deterministic wobble keyed to a seed so screenshots reproduce, which a few dozen lines of seeded noise give. A small noise library (simplex-noise 4.0.3, MIT, last publish 2024-07) is optional [npm]. Visual seeds must be separate from the kernel's streams.

### 1.3 Verdict on decision 0013

**PixiJS is a sound choice. I found no evidence it is wrong.** The reasoning in 0013 is partly different from the strongest reason, so I would add three points:

- **The better reason against MapLibre** is the style gap above, not AWWV's history. AWWV's problem was real GIS data; Mandate's is an illustrated map.
- **MapLibre's one real advantage is labels.** Pixi has no label placement. Greedy placement with a spatial index (rbush 4.0.1, MIT; flatbush 4.7.0, ISC; polylabel 2.1.0, ISC for anchor points) is a few days of work for horizontal region names, and more for curved, letter-spaced names along a river or region [npm], [I]. Treat curved text as the schedule risk of the map.
- **The bake has a hard size limit.** Real-device data shows `MAX_TEXTURE_SIZE` of at least 8192 on 100% of Windows and 97% of Linux reports, but at least 16384 on only about 93% of Windows and about 63% of Linux reports [WEB3D]. A whole-map bake zoomed 4× on a 4K screen is about 15,000 px wide. So bake in tiles, or re-bake the visible window when zoom settles. Design for 8192 per texture.

**Bake painter.** Pixi render textures or Canvas 2D on `OffscreenCanvas` (with d3-geo's `geoPath(context)` for projection) can both paint the bake. Canvas 2D has pattern fills, multiply compositing and filters, which suits washes. The slowness measured in 0013 was live SVG filters, not baking. A spike picks one.

**Tripwire.** Run a two-lane-day spike with the first 40 real regions (lane 0.3's output): bake time and memory at 4096 and 8192, one curved label, a hit-test. If curved, collision-free labels cost more than about a week, reopen "MapLibre for camera and labels, Pixi for everything drawn". Otherwise 0013 stands.

**Pan and zoom.** pixi-viewport 7.0.2 (MIT, last publish 2026-11-07) exists. It is about 100 lines to write ourselves. Check its Pixi 8 peer range before adopting [npm].

**Cost to learn Pixi.** About a week to be productive [I]: scene graph, render groups, texture lifecycle, filters, and GPU memory release [PIXI-LLMS]. Pixi-react 8.0.5 (MIT, pushed 2026-01-16) exists, but a canvas wants one owner, so I would not use it (see section 3) [gh].

---

## 2. Map data pipeline and authoring

### 2.1 Candidates

| Tool | Version | Licence | Maintenance | Role |
|---|---|---|---|---|
| mapshaper | 0.7.101 | MPL-2.0 | pushed 2026-11-07 | CLI and web editor: dissolve, simplify, clean, project, join, snap [MAPSHAPER-REF], [npm], [gh] |
| GDAL / `ogr2ogr` | 3.13.3 (2026-08-18) | X/MIT-style (`LICENSE.TXT`; not read in full) | pushed 2026-11-13 | Reads any GIS format, SQL dissolves [GDAL-DL], [gh] |
| QGIS | 4.2 latest; 3.44 LTR | GPL-2.0 | pushed 2026-11-14 | Desktop GIS: look at data, hand-edit lines and polygons [QGIS-DL], [gh] |
| Turf.js | 7.4.0 | MIT | pushed 2026-11-11 | Geometry operations in JavaScript [npm], [gh] |
| TopoJSON (`topojson-*`) | client 3.1.0, server 3.0.1, simplify 3.0.3 | ISC | last publish 2022-06 (finished, not abandoned) | Shared-border format [npm] |
| geojson.io | (site) | ISC | pushed 2026-08-17 | Paste-and-look viewer and quick editor [gh] |

### 2.2 Recommendation

- **mapshaper CLI is the repeatable build step**, in `tools/`, driven from a script. Its documented commands cover our pipeline [MAPSHAPER-REF]:
  - `-join` with `keys=` attaches the region id from a county-to-region CSV;
  - `-dissolve` merges adjacent polygons by erasing shared boundaries;
  - `-snap` and `-clean` repair gaps and overlaps, so regions fit without slivers;
  - `-simplify` offers Douglas-Peucker and two Visvalingam variants, with an option to keep shapes from collapsing (check the exact option name in the reference);
  - `-proj` projects once, at build time, so the runtime draws in plain map coordinates.
  The licence is file-level copyleft (MPL-2.0). It is a dev tool we do not bundle, so this is fine.
- **QGIS (which ships GDAL) is the hand tool**, used for the cases where scripts are the wrong tool: reading the Newberry shapefile's attribute table, hand-editing the 1861 Mississippi, and splitting a county along a ridge or river line traced from a public-domain map (0031). QGIS is GPL, and using it as a tool does not make our output data GPL [gk]. The hand edits must be saved as vector files in `tools/` or the pack, and logged in `PROVENANCE.json` (0031), so the build is repeatable without QGIS.
- **Turf only for validators and checks** (point-in-polygon, nearest-region for a site). Its `dissolve` takes Polygon features only and does not support MultiPolygon [TURF-DISSOLVE], which counties often are. Do not dissolve with Turf.
- **TopoJSON is not a pack format.** Commit simplified GeoJSON, which a modder can read and QGIS opens. The shared-vertex property comes from `-snap`, `-clean` and fixed coordinate precision. The `topojson-*` packages are optional helpers.
- **geojson.io** is for looking at a file, never as a place of record.
- **Not a candidate:** Clipper-family JavaScript libraries carry unusual licences (`clipper-lib` lists "BSL", `js-clipper` "boost") [npm]. jsts lists "EDL-1.0 OR EPL-1.0" [npm]. Avoid them unless a need appears.

**Cost to learn.** mapshaper: about a day to read the command reference and run the pipeline on three test counties [I]. QGIS: about two days to be comfortable with layers, snapping and the editing toolbar [I].

### 2.3 Would a small graph editor pay off?

**Yes, in two steps.** Authoring about 800 cited, typed edges between 250 regions in raw JSON is error-prone, and the map renderer can already draw regions, centroids and edges.

1. **Phase 1 (as soon as lane 0.3 has region geometry): a read-only graph viewer**, a dev-only route in the same Vite app that reuses the production renderer. It shows regions, edges coloured by type, and lists validator failures (disconnected graph, missing citation, edge length far from geometry distance, rail edge whose regions miss the traced line). Without it, nobody can see the graph.
2. **Add editing only after the first 60 or so regions hurt:** click two regions, choose an edge type, enter days, capacity and a citation, and write back to the JSON file. That is two to four days on top of the viewer [I].

The graph stays authored, never derived from geometry (0019); the editor only edits the authored file.

---

## 3. Desk UI framework

### 3.1 Candidates

| Tool | Version | Licence | Maintenance |
|---|---|---|---|
| React | 19.3.1 | MIT | npm modified 2026-11-12 [npm] |
| Svelte | 5.57.3 | MIT | pushed 2026-11-14; 88.7k stars [npm], [gh] |
| Solid | 1.9.19 (npm) | MIT | pushed 2026-11-14 (its last GitHub release is v1.9.0, 2024-09) [npm], [gh] |
| Preact | 11.2.0 | MIT | npm modified 2026-11-06 [npm] |
| Vite (build tool) | 8.3.8 | MIT | npm modified 2026-11-11; needs Node 20.19+ or 22.12+ [npm] |

### 3.2 What the desk is

The desk is mostly text panels (reports, letters, plan review, audiences) beside one Pixi canvas. Its input is a view model from the kernel (`viewFor(state, seatId)`). Its output is commands from the verb list (FOUNDATION section 11, item 10).

**Recommendation: React 19 with Vite, and a plain-TypeScript store.** Reasons [I]:
- the desk is a function of a view snapshot, which is what React expects;
- lanes will write most of this code, and React is the framework with the most documentation and examples;
- Svelte 5 is a strong runner-up with less code per panel, but its newer rune-based reactivity has less example code to learn from. Reconsider it if the desk's panels turn out simple.

**State handling.** The kernel is the store. Keep a small framework-free store module that holds the latest view snapshot and notifies listeners. React reads it with its built-in `useSyncExternalStore`. No Redux or Zustand is needed (Zustand 5.1.0 is available if a local UI state grows) [npm]. This keeps the framework replaceable.

**One request for the kernel.** `viewFor` should return **stable object references for sections that did not change** (or carry a per-section version number). Otherwise every tick re-renders every panel. This belongs in lane 0.6's design.

**Pixi inside React.** One component owns a `<div>`, creates the Pixi application once, and talks to it through an imperative interface (`map.setView(snapshot)`). React must not manage Pixi's scene graph. Selection from the map goes back as a typed event, not a direct state change.

**Cost to learn.** React: nothing new if known. `useSyncExternalStore` plus the Pixi bridge: about half a day [I].

---

## 4. Desktop wrapper and distribution

### 4.1 Electron against Tauri

| | Electron | Tauri |
|---|---|---|
| Version | 45.3.2 (MIT) [npm] | 2.12.5 stable on crates.io; 3.0.0-alpha.6 also published; Apache-2.0 OR MIT [CRATES] |
| Support | "latest 3 stable releases" [ELECTRON-TIMELINE] | pushed 2026-11-13 [gh] |
| Web engine | Bundled Chromium, the same on every OS | WebView2 (Chromium-based) on Windows; WebKit on macOS and Linux [TAURI-WV] |
| Steam binding | steamworks.js has an Electron path | steamworks-rs 0.13.1 (Rust); no built-in Tauri support [CRATES], [TAURI-STEAM] |
| Size | Large (a whole Chromium) | Small |

### 4.2 Recommendation: Electron

Tauri's own documentation says that on Linux "Tauri renders through WebKitGTK". WebGL there can "silently land on a slow path" with no error, and the page says to give WebGL-heavy apps a non-WebGL fallback [TAURI-LINUX]. Mandate is a WebGL map, and the Steam Deck is a Linux device [gk]. Electron ships one Chromium, so what we test on Windows is what Linux players get. Size does not matter for a Steam download. **Electron wins for this game.**

### 4.3 Steam integration

- **steamworks.js 0.4.0 (MIT):** npm publish 2024-08-06; repository pushed 2026-04-08; no GitHub releases [npm], [gh]. Its README says it works with Electron, and to enable it in the renderer you set `contextIsolation: false` and `nodeIntegration: true`. It also needs `electronEnableSteamOverlay()` for the overlay, and the Steam redistributable files copied into the build [STEAMWORKS-JS]. Its README calls greenworks (the older binding) unmaintained [STEAMWORKS-JS]. Greenworks 0.22.0 had a release in 2025-09 and a push in 2025-11 [gh], so "unmaintained" may be a competitor's framing. A third option, steamworks-ffi-node, claims to fix steamworks.js's gaps (a competitor's claim, last push 2026-03-20) (snippet) [SEARCH-SW].
- **Recommended shape:** call Steam only from Electron's main process, behind a tiny interface of our own (`init`, `unlockAchievement`, `richPresence`, `isOverlayAvailable`), and expose that through a preload script. Do not turn on `nodeIntegration` in the renderer just to reach Steam [I]. If steamworks.js goes stale, swapping the binding touches one file.
- **Saves and Steam Cloud.** Steam Auto-Cloud syncs files from a configured path without any code. For new Root paths its default is cross-platform, and Steam strongly recommends keeping that setting, because an OS-locked root cannot later sync to other platforms [STEAM-CLOUD]. Write saves under Electron's per-user data directory (`app.getPath('userData')`, which defaults to the appData folder plus the app name [ELECTRON-APP]) and point Auto-Cloud at a `saves/` folder inside it. Keep machine-specific settings (video options) outside synced files, as Steam advises [STEAM-CLOUD]. In the web build, save to IndexedDB (idb 8.0.4, ISC) and offer a save-file download and upload [npm].
- **Auto-update.** On Steam the client updates the game; electron-updater is not needed. For a non-Steam build (a demo site, itch.io) electron-builder 26.18.0 and electron-updater 6.8.11 (both MIT) are the usual pair. Electron Forge 8.0.1 (MIT) is the alternative [npm]. Tauri's updater plugin is 2.14.1 [CRATES]. Decide this at the end of Phase 2.
- **Do not commit to a store, price or launch date.** Steam Direct fees, store pages and release dates are outward-facing and the owner's call.

**Cost to learn.** Electron main/preload/renderer split and packaging: about two days. Steam bridge, tried first with the app id 480 that steamworks.js's README uses in its example: half a day [I].

---

## 5. Schemas and mod tooling

### 5.1 Candidates

| Tool | Version | Licence | Maintenance |
|---|---|---|---|
| Zod | 4.6.7 | MIT | pushed 2026-11-13; 44.3k stars [npm], [gh] |
| TypeBox | 1.4.7 (package `typebox`; the old `@sinclair/typebox` is 0.34.52) | MIT | pushed 2026-11-12 [npm], [gh] |
| Valibot | 1.5.0 | MIT | pushed 2026-11-14 [npm], [gh] |
| Ajv (JSON Schema validator) | 8.20.0 (+ ajv-formats 3.0.1) | MIT | pushed 2026-09-06 [npm], [gh] |
| ArkType | 2.2.9 | MIT | npm modified 2026-10-20 [npm] |

### 5.2 What we need

Three things, from 0030: (1) TypeScript types for the kernel without writing them twice; (2) a published JSON Schema a modder's editor can use for autocomplete [gk]; (3) errors that say file, field, what is wrong and what is expected.

- **Zod 4** gives (1) from `z.infer`. For (2) it has a built-in `z.toJSONSchema()`; the docs warn that "some types have no analog" in JSON Schema, which matters only for refinements and transforms [ZOD-JS]. For (3) it has `z.prettifyError()`, which prints each issue with its path (for example "expected string, received number → at username") [ZOD-ERR]. Referential checks (an edge names a region that exists; a message uses a placeholder its reason provides) are ordinary code in the validator, in any library.
- **TypeBox** schemas *are* JSON Schema, so (2) needs no conversion and loses nothing [TYPEBOX-GH]. Its cost is less familiar error formatting, and less example code.
- **Ajv** is the reference JSON Schema validator. It makes sense if JSON Schema files become the source of truth and TypeScript types are generated from them (json-schema-to-typescript 16.0.0, MIT) [npm]. That direction suits a modding-first project, but it adds a code-generation step to every schema change.
- **Valibot** is the smallest bundle; its JSON Schema conversion is a separate package [gk]. We do not ship validators to browsers at scale, so size gives it no edge.

**Recommendation: Zod 4**, with the generated JSON Schema files committed under `packs/schema/` and a staleness check in `npm run check` (FOUNDATION section 11, item 7). Reason: one library for types, validation and published schemas, the most readable errors out of the box, and the widest familiarity [I]. If lossy JSON Schema conversion ever hurts a field, TypeBox is the replacement.

**Published docs for modders.** Fields should carry `.describe()` text, and a small script can render those into Markdown tables. A ready generator exists: @adobe/jsonschema2md 8.0.11 (Apache-2.0, last publish 2026-10) [npm]. Avoid json-schema-static-docs (0.28.1): its licence is GPL-3.0-only [npm].

**Cost to learn.** Zod 4: half a day. Writing a readable error formatter (file, field path, expected, found): one day [I].

---

## 6. Localisation

### 6.1 Candidates

| Tool | Version | Licence | Maintenance |
|---|---|---|---|
| FormatJS `intl-messageformat` | 12.1.5 | BSD-3-Clause | repo pushed 2026-11-14; `@formatjs/cli` 6.19.0 [npm], [gh] |
| i18next | 27.1.1 | MIT | npm modified 2026-11-10 [npm] |
| `messageformat` | 4.1.0 | Apache-2.0 (npm); its repo shows MIT | repo says "ICU MessageFormat and Unicode Messageformat for Javascript" [npm], [MESSAGEFORMAT-GH] |

### 6.2 What we need

Pack string tables keyed by id, filled from typed reasons and parameters. Plural forms ("1 division", "3 divisions"), ordinals ("First Corps"), selects, and number and date formatting. Pronoun handling is a select: the project's own rule is "they/them unless stated", so a select on a stored pronoun set is real, not hypothetical [I].

**Recommendation: `intl-messageformat` (the FormatJS core, no React binding).**
- It implements ICU message syntax, which is the format translators' tools already know [gk].
- It is a small formatter that sits behind our own `text(id, params)` function. It runs in the CLI and the desk alike.
- **Validate at pack load.** Parse every message when the pack is read. A validator fails if a message uses a placeholder the typed reason does not provide, or a reason has no message. This is the localisation check that stops "missing key" bugs at the door [I].
- i18next solves language detection and runtime loading, which we do not need. Unicode MessageFormat 2 (what `messageformat` 4 also targets) is the coming standard, but the evidence I read shows no clear sign it is ready to be the baseline. Track it, and keep message syntax behind our wrapper so a move is a data migration [I].
- **Fonts and scripts.** Localisation includes glyph coverage. The IM Fell and Cinzel families Google Fonts lists carry only Latin subsets (section 9), so any Cyrillic or Greek skin needs a different face.

**Cost to learn.** ICU message syntax: two hours. The `text()` wrapper and the pack-load validator: about one day [I].

---

## 7. Testing and quality

| Tool | Version | Licence | Maintenance |
|---|---|---|---|
| Vitest | 5.1.0 (the repo uses ^3.2.7, which `npm` still tags `V3` = 3.2.7) | MIT | npm modified 2026-11-02; needs Node ^22.12 or 24+ [npm] |
| `@vitest/coverage-v8` | 5.1.0 | MIT | tied to Vitest [npm] |
| fast-check | 4.10.2; `@fast-check/vitest` 0.5.0 | MIT | npm modified 2026-09-19 [npm] |
| Playwright | 1.65.1 | Apache-2.0 | pushed 2026-11-14 [npm], [gh] |
| `@vitest/browser-playwright` | 5.1.0 | MIT | tied to Vitest [npm] |
| tinybench | 6.2.3 | MIT | npm modified 2026-11-01 [npm] |

- **Property-based testing: fast-check.** The kernel's invariants are exactly its kind of target: generate command sequences and assert after each tick. Candidates for the first properties [I]:
  - control permille per region never exceeds the allowed total;
  - the same seed and commands give the same state hash;
  - resuming from any mid-run save equals the continuous run (FOUNDATION section 11);
  - supply is never traced through a region under the 250‰ threshold;
  - a verb the player cannot legally issue is always rejected, never half-applied;
  - the authored graph stays connected after any edge-condition change.
  A failing case shrinks to a minimal command list, which suits a deterministic engine, because the shrunk list is a replayable bug report.
- **Playwright for the desk.** `toHaveScreenshot()` compares to reference images, and its own docs warn that rendering "can vary based on the host OS, version, settings, hardware... headless mode" and that baselines must come from the same environment [PW-SNAP]. For a WebGL map this is stronger: pin one environment (a Linux CI container with software rendering) for pixel baselines, use a tolerance, and prefer comparing the *baked layer output* (a deterministic image from a seed) over comparing a live frame. Test DOM panels with ordinary assertions and use screenshots only for the map. Playwright ships a separate headless Chromium shell for CI [PW-BROWSERS].
- **Benchmarks.** Vitest has a `bench` mode built on tinybench [gk]. The existing map-size benchmark (about 0.6 ms at 3,000 regions for a supply recompute) shows the tick budget is not the limit [MAP-NOTE]. Make benchmarking a test with a generous ceiling (fail at 5× today's number), not a number to chase.
- **Coverage.** `@vitest/coverage-v8` is enough. Coverage is a hint, not a gate. The liveness gate (FOUNDATION section 11, item 5) is the better measure of "is this mechanic dead".
- **A dependency-licence check.** Add `npm run check:licences`: fail on any production dependency whose licence is outside an allow-list (MIT, ISC, BSD, Apache-2.0, OFL for fonts, MPL-2.0 only for dev tools). My own sweep found a GPL-3.0 documentation tool and several odd licences (sections 2 and 5), so this rule will bite. Candidates: `license-checker-rseidelsohn` 5.0.1 (BSD-3-Clause, modified 2026-07-15). The older `license-checker` 25.0.1 was last modified 2022 [npm].

**Cost to learn.** fast-check: one day to write the first model-based test [I]. Playwright screenshots against Pixi: about two days to get a stable CI baseline [I].

---

## 8. AI seats

### 8.1 Cloud: the Anthropic TypeScript SDK

- **`@anthropic-ai/sdk` 1.8.0, Apache-2.0**, pushed 2026-11-10. It needs TypeScript 5.0 or newer and Node 20 LTS or newer [ANTHROPIC-SDK], [npm].
- **Browser use is off by default** "to avoid exposing your secret key" [ANTHROPIC-SDK]. A bring-your-own-key game puts the key on the player's machine, so call the API from **Electron's main process**, not the renderer. In the web build, the key lives in the player's browser and the call is theirs to make. Never write a key into a save, a log or a bug report [I].
- **Model ids** on the models page: `claude-fable-5-2`, `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5` [ANTHROPIC-MODELS]. Voice lines are short and plentiful, so a small, cheap model is the default and the player can choose another [I].
- **Structured output** is GA through `output_config.format` with a JSON Schema; the response comes back as text in the first content block, and SDK helpers parse it into your type [ANTHROPIC-SO]. The schema has limits that shape our design [ANTHROPIC-SO]:
  - `additionalProperties` must be `false` on objects;
  - no recursive schemas;
  - `minItems` only 0 or 1;
  - enums only of primitives;
  - changing `output_config.format` invalidates the prompt cache for the thread.
  These are friendly to the design in FOUNDATION section 8: a seat answers from the kernel's menu of legal responses, so the schema is an enum of option ids plus short text, not a tree.

### 8.2 Local models

| Tool | Version | Licence | Maintenance |
|---|---|---|---|
| Ollama | 0.40.16 (2026-11-09) | MIT | pushed 2026-11-14 [gh] |
| `ollama` JS client | 0.6.4 | MIT | npm modified 2026-09-29 [npm] |
| llama.cpp | v1.0.0 (2026-11-13) | MIT | pushed 2026-11-14 [gh] |
| LM Studio | (app) | proprietary; terms at [LMSTUDIO-TERMS] | n/a |

- **Ollama:** its `format` field takes a JSON Schema to constrain the reply, and "Ollama's cloud currently does not support structured outputs" [OLLAMA-SO]. A community report says models can still wander and invent fields, so **parse and validate every reply** (Zod) and fall back to the rules seat [SEARCH-OLLAMA].
- **llama.cpp** ships `llama-server`, described as a set of LLM REST APIs plus a web UI [LLAMACPP-SRV]. I did not read its schema-constraint documentation. Check before relying on it.
- **LM Studio** documents OpenAI-compatible endpoints including "Structured Output", and an Anthropic-compatible Messages endpoint [LMSTUDIO-DOCS]. Its app is closed-source with its own terms [LMSTUDIO-TERMS]. We only talk to the player's own install over its documented HTTP interface, and bundle nothing.
- **Recommendation:** one thin adapter, **plain `fetch`** to an OpenAI-compatible chat endpoint with a JSON Schema response format, covers Ollama, llama.cpp and LM Studio (each documents compatible endpoints [OLLAMA-SO], [LMSTUDIO-DOCS], [LLAMACPP-SRV]), without another SDK. Anthropic's SDK stays for the cloud seat. Both sit behind the seat interface of FOUNDATION section 8, with the rules seat as fallback, a timeout, and the answer stamped with its due in-game day.
- **Never bundle a model.** A bundled model's licence has to be checked first (0022, consequences). Players bring their own.

**Cost to learn.** The SDK and structured output: half a day. A local adapter and a mock server for tests: one day [I].

---

## 9. Assets and typography

### 9.1 Typefaces

Licence and subsets read from Google Fonts' own metadata files [GFONTS-META]. All of these are SIL Open Font License (OFL) unless stated.

| Font | Designer | Licence | Subsets | Fit (my judgement [I]) |
|---|---|---|---|---|
| IM Fell English / Double Pica / Great Primer / French Canon | Igino Marini | OFL | latin | Old-style printing: map labels, headings, letters |
| Libre Caslon Text | Pablo Impallari | OFL | latin, latin-ext | Caslon was common in 19th-century US print: body text |
| Old Standard TT | Alexey Kryukov | OFL | latin, latin-ext, **cyrillic**, vietnamese | 19th-century "modern" book type; has Cyrillic |
| EB Garamond | Georg Duffner, Octavio Pardo | OFL | latin, latin-ext, **cyrillic, greek**, vietnamese | Broad coverage for other packs |
| Cormorant Garamond | Christian Thalmann | OFL | latin, latin-ext, cyrillic, vietnamese | Display |
| Cinzel | Natanael Gama | OFL | latin, latin-ext | Roman capitals: the Rome skin |
| UnifrakturCook | j. 'mach' wust | OFL | latin | Newspaper nameplates (blackletter) |
| Pinyon Script | Nicole Fally | OFL | latin, latin-ext, vietnamese | Copperplate hand for letters and signatures |
| Caveat | Impallari Type | OFL | latin, latin-ext, cyrillic | Margin notes; modern in feel, use sparingly |
| Special Elite | Astigmatic | **Apache-2.0** | latin | Typewriter: the 2022 skin only, wrong for 1861 |

**Licence mechanics (OFL).** Bundling a font in a program is allowed. The OFL FAQ says embedding makes extraction difficult, while "any other means of delivering a font" is distribution and "needs to be accompanied by any copyright notices and licensing information available in OFL.txt" [OFL-FAQ]. So ship each font's `OFL.txt` and list it in a credits screen. Other OFL terms (no selling the font on its own; modified versions cannot reuse the reserved name) are [gk]; read the licence text before modifying a font.

**Delivery.** Self-host, do not use the Google Fonts CDN: offline play, and no third-party request from the game, which keeps the privacy rule. Fontsource publishes OFL font files as npm packages with the licence included (for example `@fontsource/im-fell-english` 5.3.0 and `@fontsource/cinzel` 5.3.0, both OFL-1.1) [npm]. Load fonts and wait for them before Pixi measures text [gk].

### 9.2 Maps and portraits

- **Library of Congress** is the source for period maps (0031) and for portraits. Its "Free to Use and Reuse" sets include an Abraham Lincoln set and a Civil War Drawings set [LOC-FREE]. The Civil War maps rights page refused automated fetches, so read it in a browser [LOC-CWM].
- **Check every portrait item's own Rights Advisory** and record it in the pack's `PROVENANCE.json`, in the same shape 0031 sets for map layers. About 150 officer portraits are a research lane of their own, not a tooling task [I].
- **Faithful scans of 2-D public-domain works** carry no new US copyright under *Bridgeman v. Corel* (see the map note), but other countries may differ [MAP-NOTE].

### 9.3 Audio

| Source | Licence as I could read it |
|---|---|
| Freesound | Per-sound: "Creative Commons 0", "Attribution", or "Attribution Noncommercial" [FREESOUND]. **Filter to CC0 and Attribution only.** |
| Kevin MacLeod (incompetech) | CC BY 4.0, with credit required; commercial use needs credit or a purchased licence [INCOMPETECH] |
| Musopen, IMSLP, Library of Congress National Jukebox | **Not verified:** Musopen's page returned no licence text, and the National Jukebox rights page refused automated fetches [LOC-JUKEBOX] |

- **A recording and a composition are different rights** [gk]. A Civil War song's composition is public domain, but a modern recording of it is the performer's work. Safe routes: record or commission our own performances of public-domain sheet music, or use only CC0 recordings. That is Phase 2 or later.
- **Playback:** plain Web Audio with a thin wrapper is enough for clicks, ambience and music crossfades [I]. howler.js 2.2.4 (MIT) works but has had no publish since 2023-09 [npm]. Tone.js 15.1.22 (MIT, active) is for music synthesis, which we do not need [npm].

---

## 10. Anything else teams discover late

### 10.1 Saves, hashes and compression

- **Hash the canonical JSON, never the compressed bytes.** Compressors from different libraries produce different bytes for the same content, which would break the "same hash on Linux and Windows" check. Compress after hashing [I].
- **Compression:** the Web Streams `CompressionStream('gzip')` is built into Chromium and Node [gk], so it needs no dependency. fflate 0.8.3 (MIT, last publish 2026-07-20) is the small fallback if a synchronous path is needed. pako 3.0.3 carries "(MIT AND Zlib)" [npm].
- **The kernel's state hash must be a small pure-TypeScript function.** The kernel runs in browsers, so it should not import `node:crypto` [I]. This belongs to lane 0.1.

### 10.2 Crash reports and telemetry

- **Determinism is the crash-reporting tool.** A bug report is "save file plus command log plus build version", and the kernel replays it exactly [I]. A **"Copy bug report" button** in Phase 1 or 2 needs no service.
- **No telemetry by default.** If ever added: opt-in, aggregate counts only, never save contents, never an API key, and disclosed on the Steam store page.
- **Sentry's browser SDK** is `@sentry/browser` 11.12.0, MIT; the Sentry server project's licence reads "NOASSERTION" on GitHub (not a plain open-source licence) [npm], [gh]. If a hosted service is wanted later, it must be opt-in and scrub paths, text and save data. Steam also has an error-reporting feature, listed in its documentation index [STEAM-INDEX]; I did not read its page.

### 10.3 Docs site for modders

- **VitePress** 1.6.4 (MIT; 2.0.0-alpha.21 is the `next` tag) vs **Starlight** 0.43.1 (MIT, still pre-1.0) [npm]. Both turn Markdown into a searchable site. **Recommendation: VitePress 1.6.4**, a stable line with the least moving parts. Host on GitHub Pages from the public repo. Add TypeDoc 0.28.20 (Apache-2.0) only if we publish a scripting API [npm].
- **Timing:** the site is needed when the pack format stops changing, not before. Start it as a `docs/modding/` folder of Markdown in Phase 1 so nothing is lost, and pick the generator in Phase 2.

### 10.4 Baked assets and Git LFS

0031 says Git LFS arrives with the first map art asset. Because the map is procedural, **bake at load time from pack data with a fixed seed and cache the result in IndexedDB (or the desktop data directory)**, so no baked texture is ever committed [I]. That avoids LFS storage and bandwidth limits for map art. Fonts and portraits are real binary assets, so LFS is still needed for them; check the current GitHub LFS quota before committing any [gk].

### 10.5 Smaller items

- **Accessibility.** The ink, pencil, red and blue-pencil language leans on colour. Add line style (dash, weight) so it survives colour blindness. A Pixi canvas is invisible to screen readers; Pixi has an accessibility system [PIXI-LLMS], but the desk's DOM text carries the real content [I].
- **High-DPI and Steam Deck.** Set Pixi's resolution from `devicePixelRatio`; plan for controller navigation of the desk panels (Steam Input) after Phase 2 [gk].
- **Code signing** matters for non-Steam Windows downloads (SmartScreen warnings) [gk]. Steam builds are not affected in the same way [gk]. Costs money, so the owner decides.
- **Dependency updates:** one scheduled bot (Dependabot or Renovate) with a weekly grouped PR keeps the toolchain from falling two majors behind again (see "Findings outside my scope").

---

## Recommended stack

All versions are the registry's `latest` as read on 2026-11-14 unless noted. "When" is the first phase that needs the tool.

| Need | Tool | Version | Licence | When |
|---|---|---|---|---|
| Test runner and coverage | Vitest + `@vitest/coverage-v8` | 5.1.0 (repo is on 3.2.7) | MIT | Phase 0 (upgrade in lane 0.1) |
| Property tests | fast-check + `@fast-check/vitest` | 4.10.2 / 0.5.0 | MIT | Phase 0 |
| Benchmarks | Vitest bench / tinybench | 5.1.0 / 6.2.3 | MIT | Phase 0 |
| Dependency licence check | `license-checker-rseidelsohn` (or equivalent) | 5.0.1 | BSD-3-Clause | Phase 0 |
| Pack schemas and errors | Zod | 4.6.7 | MIT | Phase 0 (lane 0.2) |
| Published JSON Schema | `z.toJSONSchema()` (in Zod) | 4.6.7 | MIT | Phase 0 (lane 0.2) |
| String tables | `intl-messageformat` | 12.1.5 | BSD-3-Clause | Phase 0 (lane 0.2) |
| Map build step | mapshaper | 0.7.101 | MPL-2.0 (dev tool, not bundled) | Phase 0 (lane 0.3) |
| Map hand edits and inspection | QGIS (includes GDAL) | 4.2 latest / 3.44 LTR; GDAL 3.13.3 | GPL-2.0 (tool only); GDAL MIT-style | Phase 0 (lane 0.3) |
| Projection and geometry checks | d3-geo; Turf.js | 3.1.2; 7.4.0 | ISC; MIT | Phase 0 (build); Phase 2 (runtime) |
| Graph viewer, later editor | Our own dev route (Vite + the production renderer) | n/a | ours | Phase 1 (viewer), later (editing) |
| Anthropic seat and voice | `@anthropic-ai/sdk` | 1.8.0 | Apache-2.0 | Phase 1 |
| Local-model seat | plain `fetch` to OpenAI-compatible endpoints (Ollama, llama.cpp, LM Studio) | Ollama 0.40.16; llama.cpp v1.0.0 | MIT; MIT | Phase 1 |
| Map renderer | PixiJS | 8.23.0 | MIT | Phase 1 spike; Phase 2 build |
| Label placement | rbush + polylabel (own placer) | 4.0.1; 2.1.0 | MIT; ISC | Phase 2 |
| Desk UI | React + Vite | 19.3.1; 8.3.8 | MIT | Phase 2 |
| UI screenshots | Playwright (+ `@vitest/browser-playwright`) | 1.65.1; 5.1.0 | Apache-2.0; MIT | Phase 2 |
| Fonts | IM Fell, Libre Caslon, Old Standard TT, Cinzel, Pinyon Script (via Fontsource) | 5.3.0 for the two checked | OFL-1.1 | Phase 2 |
| Save compression | `CompressionStream` (built in); fflate as fallback | n/a; 0.8.3 | n/a; MIT | Phase 1 |
| Web saves | idb (IndexedDB wrapper) | 8.0.4 | ISC | Phase 2 |
| Desktop wrapper | Electron | 45.3.2 | MIT | Phase 2 end |
| Steam binding | steamworks.js behind our own interface | 0.4.0 | MIT | Phase 2 end |
| Installers (non-Steam) | electron-builder + electron-updater | 26.18.0; 6.8.11 | MIT | Phase 2 end (optional) |
| Modder docs | VitePress | 1.6.4 | MIT | Phase 2 |
| Audio playback | Web Audio, thin wrapper | n/a | n/a | Phase 2 or later |

---

## Learn now

The few tools the owner and lead should understand before Phase 0 starts:

1. **mapshaper and QGIS** (about three days between them). Lane 0.3 depends on them, and the whole map pipeline in 0031 is their commands. Read the command reference and run one county dissolve by hand.
2. **Zod 4 and `z.prettifyError`** (half a day). Lane 0.2's format, schemas and readable errors are built on it.
3. **ICU message syntax** (two hours). Every line of player text is a message from the first commit (0030).
4. **fast-check's model-based testing** (a day). Lane 0.1's invariants and lane 0.4's supply and control properties are written this way.
5. **What a PixiJS bake costs** (read the Pixi architecture and render-group pages; two hours) so that the region geometry format (projected coordinates, stable ids, a department tag) is chosen with the renderer in mind, even though Pixi code starts later.
6. **Vitest 5, TypeScript 7 and Vite 8 compatibility** (half a day, lane 0.1): the repo's toolchain is two majors behind (see below).

---

## Findings outside my scope

1. **The repo's toolchain is two major versions behind.** `package.json` pins `vitest ^3.2.7` (latest 5.1.0; npm tags 3.2.7 as the `V3` line) and `typescript ^5.9.3` (latest 7.0.2) [npm]. Vitest 5 needs Node `^22.12.0 || ^24.0.0 || >=26.0.0` and Vite `^6.4 || ^7 || ^8`; this machine runs Node 22.23.2 [npm]. I did not test compatibility. Upgrade at the start of lane 0.1, before more code depends on the old APIs, and check that `tsx` 4.23.15 works under TypeScript 7.
2. **Steam's live-AI terms may conflict with "bring your own key".** Steam's content survey says a game connecting to a live-generated AI service with ongoing per-call costs must manage access to it and collect payment through a Steam-supported method (a price increase, microtransactions, a subscription or DLC) [STEAM-SURVEY]. It also requires a statement of the guardrails against illegal content for any live-generated AI. Whether a player's own API key or a local model counts under that wording is unclear. Ask Valve before 0022's AI voice ships; asking is outward-facing, so it needs the owner's go-ahead.
3. **Steam binding risk and the Tauri Linux caveat** (sections 4.2 and 4.3). steamworks.js's last npm publish is 2024-08, and it asks for an unsafe renderer setup. Put a Steam interface in place at the first desktop build. Do not pick Tauri for the Steam build without a Linux WebGL test on real hardware.
4. **The state hash must not depend on compression or `node:crypto`** (10.1). Lane 0.1 should write the hash as a pure function over canonical JSON.
5. **`viewFor` needs stable references or per-section versions** (section 3), or the desk re-renders everything each tick. Lane 0.6 should design this in.
6. **A dependency-licence check belongs in `npm run check`** (section 7), alongside the pack-provenance validator of 0031. The sweep found GPL-3.0 and odd licences among ordinary candidates. LANES' rule 7 ("rules that matter become checks") applies.
7. **Bake at load, do not commit textures** (10.4). This changes 0031's "Git LFS with the first map art" trigger: fonts and portraits, not map art, become the first LFS assets. Worth a line in `docs/LANES.md`.
8. **Facts I could not verify:** the Library of Congress Civil War maps and National Jukebox rights pages, Musopen's licence, MapLibre's non-Mercator projection support, and the llama.cpp schema-constraint docs all need a browser read. Several [gk] items (OFL reserved-name rule, `CompressionStream` availability, Pixi text classes) were not checked today.

---

## Sources

Versions and dates come from registry and API queries on 2026-11-14 (marked [npm], [gh], [CRATES]); the rest are pages.

**Registries and repositories**
- [npm] https://www.npmjs.com/ (queried with `npm view <package> version license time.modified`; packages named in the tables)
- [gh] https://api.github.com/ (queried with `gh api repos/<owner>/<repo>`: pixijs/pixijs, maplibre/maplibre-gl-js, visgl/deck.gl, d3/d3-geo, konvajs/konva, rough-stuff/rough, mbloch/mapshaper, OSGeo/gdal, qgis/QGIS, tauri-apps/tauri, electron/electron, ceifa/steamworks.js, Noxime/steamworks-rs, greenheartgames/greenworks, ollama/ollama, ggml-org/llama.cpp, formatjs/formatjs, microsoft/playwright, Turfjs/turf, mapbox/geojson.io, sinclairzx81/typebox, colinhacks/zod, open-circle/valibot, anthropics/anthropic-sdk-typescript, ajv-validator/ajv, sveltejs/svelte, solidjs/solid, pixijs/pixi-react)
- [CRATES] https://crates.io/api/v1/crates/tauri (also `steamworks`, `tauri-plugin-updater`)

**Map rendering and data**
- [PIXI-LLMS] https://pixijs.com/llms.txt (PixiJS documentation index for v8.23.0)
- [MAPLIBRE-GH] https://github.com/maplibre/maplibre-gl-js
- [MAPLIBRE-DOCS] https://maplibre.org/maplibre-gl-js/docs/
- [MAPLIBRE-GEOJSON] https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/
- [WEB3D] https://web3dsurvey.com/webgl/parameters/MAX_TEXTURE_SIZE
- [MAPSHAPER-REF] https://github.com/mbloch/mapshaper/blob/master/docs/reference.md
- [GDAL-DL] https://gdal.org/en/stable/download.html
- [QGIS-DL] https://qgis.org/download/
- [TURF-DISSOLVE] https://github.com/Turfjs/turf/tree/master/packages/turf-dissolve
- [MAP-NOTE] `docs/research/2026-11-14-map-extent-size-sources.md`

**Desktop and Steam**
- [ELECTRON-TIMELINE] https://www.electronjs.org/docs/latest/tutorial/electron-timelines
- [ELECTRON-APP] https://www.electronjs.org/docs/latest/api/app
- [TAURI-WV] https://v2.tauri.app/reference/webview-versions/
- [TAURI-LINUX] https://v2.tauri.app/develop/debug/linux-graphics/
- [TAURI-STEAM] https://forum.gdevelop.io/t/implementing-steam-achievements-with-tauri/73202 (snippet)
- [STEAMWORKS-JS] https://github.com/ceifa/steamworks.js
- [SEARCH-SW] web search "steamworks.js Electron Steam integration maintenance status 2026" (results about steamworks-ffi-node were competitor material) (snippet)
- [STEAM-CLOUD] https://partner.steamgames.com/doc/features/cloud
- [STEAM-SURVEY] https://partner.steamgames.com/doc/gettingstarted/contentsurvey
- [STEAM-INDEX] https://partner.steamgames.com/doc/gettingstarted/contentsurvey (documentation index, listing Steam Error Reporting)

**Schemas, localisation, AI**
- [ZOD-JS] https://zod.dev/json-schema
- [ZOD-ERR] https://zod.dev/error-formatting
- [TYPEBOX-GH] https://github.com/sinclairzx81/typebox
- [MESSAGEFORMAT-GH] https://github.com/messageformat/messageformat
- [ANTHROPIC-SDK] https://github.com/anthropics/anthropic-sdk-typescript
- [ANTHROPIC-SO] https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- [ANTHROPIC-MODELS] https://platform.claude.com/docs/en/about-claude/models/overview
- [OLLAMA-SO] https://docs.ollama.com/capabilities/structured-outputs
- [SEARCH-OLLAMA] web search "Ollama structured outputs JSON schema format parameter API documentation" (community reliability report) (snippet)
- [LLAMACPP-SRV] https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md
- [LMSTUDIO-DOCS] https://lmstudio.ai/docs/developer/openai-compat
- [LMSTUDIO-TERMS] https://lmstudio.ai/app-terms

**Testing**
- [PW-SNAP] https://playwright.dev/docs/test-snapshots
- [PW-BROWSERS] https://playwright.dev/docs/browsers

**Assets**
- [GFONTS-META] https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/METADATA.pb (per family; `apache/specialelite` for Special Elite)
- [OFL-FAQ] https://openfontlicense.org/ofl-faq/
- [LOC-FREE] https://www.loc.gov/free-to-use/
- [LOC-CWM] https://www.loc.gov/collections/civil-war-maps/about-this-collection/rights-and-access/ (refused automated fetch; not read)
- [LOC-JUKEBOX] https://www.loc.gov/collections/national-jukebox/about-this-collection/rights-and-access/ (HTTP 403; not read)
- [FREESOUND] https://freesound.org/help/faq/
- [INCOMPETECH] https://incompetech.com/music/royalty-free/faq.html
