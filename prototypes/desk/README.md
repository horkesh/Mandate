# The playable desk and staff map

A standalone React 19 / TypeScript prototype of the playable map table (0093, R26). It plays the real console driver and draws the staff map in PixiJS 8.

From a checkout with the root workspace dependencies installed:

```powershell
cd prototypes/desk
npm ci
python -m pip install --target .geometry-tools -r scripts/geometry-requirements.txt
npm run map:fetch
npm run map:build
npm run map:verify
npm run dev
```

Open **http://127.0.0.1:5274/**. The process owns one local session, shared by its browser tabs. Refresh preserves the game and queue. Read/file marks belong to the current page; display, sound and playback settings persist in local storage. Restart the process to begin a new game.

Geometry is built locally and stays ignored while the prototype awaits review. Newberry confirmed CC0 and commercial redistribution on 16 November 2026. If it has not been built, the map offers the available reports as text. The Python GIS tools are development tools; the browser uses the generated JSON. Pyshp is MIT and Shapely is BSD-3-Clause; Shapely's GEOS library has its own LGPL licence. These Python libraries are not bundled into the browser build. The npm runtime dependencies remain permissive.

Other console starts, after stopping the current process:

```powershell
npm run dev -- --pack testbed
npm run dev -- --at-war
npm run dev -- --pack testbed --at-war
```

The map fills the screen from the first morning. Trays, calendar, attention, books and the run control sit at its edges; live situations occupy a row of cards. The in-tray opens a paper beside its reported place, marked in blue pencil. An off-screen place pans into view. Papers without a place open at the reading edge. Return to tray or Escape closes the paper; File puts it in the searchable file drawer. Selecting a headquarters sign opens its holder's card beside the flag, with the latest report and its date, and actions for the person's page or an order.

The docket offers only the morning menu's choices; the board, ledger, file and daybook come forward over the map. Plans offer approval, sending back, the console edit grammar and route previews on a sheet at the map's left. Every console verb is also available on the order sheet. Signed commands wait in the out-tray and can be recalled. Only **Send orders & run days** (the console's `end`) submits them to the game. During playback each report appears as a dated pencil mark before entering the tray. The daybook retains reports, refusals and stop reasons.

The map pans by dragging and zooms at the wheel position. Its labelled controls also work by keyboard. Press **T** while the map or its text record has focus to switch between them. Report signs reveal their author, date and source paper on hover or focus. Reports fade after 7, 14 and 28 days; agreeing claims by distinct authors use ink. These thresholds are presentation choices, with the full text record retaining the information. Older positions from the same author are removed; the proposed one-turn ghost is not implemented.

Opening a submitted plan brings its sheet beside the map. **Fit plan** frames the draft and the pencil routes. Drag an objective or waypoint handle to a region, or focus a handle and use the arrow keys to choose a region, then Enter to mark it. The form offers the same marks. The console previews each change against the submitted plan before a blue route appears. Each mark remains a separate counter-order; the display makes no prediction about the commander's response. The strike control also uses the preview and respects its refusal to remove a plan's only axis.

**Order these changes** queues the exact console edits. **Send back with notes** queues the existing `sendback <post>` command and retains the marks in this page's notebook, including when the panel is closed and reopened. **The console has no notes field, so the pencil notes are not delivered to the commander.** Full acceptance of that part of R18 needs a console change outside this prototype's scope. The notes disappear on page refresh. Approval and the typed edit sheet remain available.

The labelled edge controls provide keyboard access to the desk regions. Tab and Shift+Tab move among them; books and order forms contain focus while open. Papers and plan review stay on the table. Escape closes the current paper, card or plan, or returns one level in a book. Shortcuts are inactive in inputs, selects and editable text, including Escape; use Tab to leave a field.

| Key | Action |
|---|---|
| Space | Open the next unread paper, or skip passing days to the stop. |
| Up / Down, K / J | Choose the previous or next paper in the list in focus. |
| Enter / Escape | Open the focused act or put down the sheet. |
| F | File the open paper. |
| R | Show the selected decision's delegation choices; focus a person and press Enter to refer it. |
| I | Ask the open paper's author or the person whose card is open for a report. |
| A / N | Approve the open plan or send it back. Pencil notes remain on the desk. |
| S | Sign the open order to the out-tray. |
| D / B / L / M / G | Open the docket, org board, ledger or file; M focuses the map. |
| Ctrl+G | Search regions and people by name. Tab to a result and press Enter to open it. |
| W A S D, arrows | Pan while the map canvas has focus. Arrow handles instead choose regions for their marks. |
| + / - / 0 | Zoom in, zoom out or fit while the map canvas has focus. |
| T | Switch between the map and its text record. |
| Ctrl+Enter | Open the turn sheet; press again to send orders and run days. |
| ? | Open the key card and settings. |

Each shortcut uses the mouse control's action. Context keys act on the open paper, person, selected decision or plan; they do nothing when that act is unavailable. Key rebinding is deferred.

The key card provides continuous text scaling from 80% to 200%, with a separate slider for map labels. Papers widen with the text while retaining a maximum measure of 70 characters and scroll within the screen. High contrast uses plain paper and visible focus rings. Evening lamp warms the desk and dims paper without turning it dark. These settings stay in the browser and are never included in a game command.

Plain reading and playback speed are also available. System reduced motion makes playback instant. Sound starts muted; enabling it uses the existing R7/R11 effects and room tone. Every cue also has a visible representation.

## Boundary

`server/adapter.ts` is the only module that imports the console driver, parser and report presenter. It queues parsed console commands and explicitly serializes the morning request, date, pack strings, queued orders and player-visible turn history. Paper bodies use the console's existing report wording. No game state, world or command log crosses the boundary.

`web/adapter.ts` owns browser requests and wire types. Browser kernel imports are type-only from `@mandate/kernel/seat-api`; browser code cannot import the server or sibling packages. The local server binds only to 127.0.0.1, rejects other origins/hosts and stale mornings, and prevents Vite from serving server/pack/kernel sources. Reads never run days.

`web/map/model.ts` takes exactly a `SeatRequest` and static geometry. Headquarters come from position claims for known posts; enemy signs come from positive estimates, with conflicting authors kept separately. Works and region-bearing situation, battle, pocket, operation and goal claims retain their sources. A claim without a located, attributed source stays out of the drawing. The text record lists unplaced sources. During playback the map starts with the previous morning and adds only delivered reports. Beliefs retain their earlier source until its replacement arrives; future papers and beliefs stay out of the drawing.

Draft routes come from `OptionView`; pencil routes come from the existing console preview. Support arrows use reported supporting headquarters when available. No browser code searches a route or reads the authored movement graph. Current live-layer omissions include fronts, claimed-control washes, supply lines, courier positions, obstruction-edge locations and approved-operation routes. The current view lacks the information needed to draw those layers faithfully. Sourced relief, rivers and rail are static cartography; roads are not invented. Generic R16 headquarters signs are used without inferring post tiers or branch insignia.

`web/map/renderer.ts` uses d3-geo projection, Pixi labels and arrows, and saved static atlas bands loaded from disk under a 96 MiB raw-texture cap. `web/map/projection.ts` shares the 85° W central meridian between baking, prepared label angles and live rendering. Camera changes publish their canvas and HTML overlays together; the ready signal includes both. This is functional verification on the available Chromium, without a new frame-rate or GPU-memory campaign. Region hints control anchors, spine orientation, size and minimum zoom. Union's current CSV has no explicit anchor/spine hints, so names use its reference points with greedy collision hiding. Curved glyph layout remains production work.

## Geometry and provenance

The scripts read `packs/union-1861/source/world/regions.csv` without editing it. Newberry's nationwide dated county file is selected inclusively for **6 March 1861**, matched by exact state/county names with case and whitespace normalization, dissolved and simplified. `State:*` follows the pack notes: the whole state or its counties left after explicit assignments. No spelling aliases or part-county splits are guessed.

The current build produces **185 area shapes among 268 regions**. **43 unmatched expressions affect 34 regions**; all are listed individually in `art-masters/R18/geometry-report.json`. A region with any failed match gets a reference point and no partial area. The **49 regions without counties** are 25 sea, 12 river and 12 off-map regions. They get no invented area; the report lists each one. Testbed has 30 region entries; the 27 with authored reference points appear on a labelled schematic, with no fictional county polygons.

The county source is generalized at 0.01 degrees; the additional topology-preserving simplification tolerance is 0.008 degrees. Small overlaps between independently simplified borders remain: `geometry-checks.json` lists 101 overlaps over 0.0001 square degrees, the largest about 0.00986 square degrees. They never create graph links. Natural Earth's modern coast, land, lakes and rivers include its North America river supplement; reservoir features and NULL records are omitted. Period river corrections remain to be researched.

Sources are downloaded only from the providers, using Natural Earth's own AWS download host. ZIPs and archived grant pages stay in ignored `art-masters/R18/sources/`, with URL, retrieval time and SHA-256 in `manifest.json`. Newberry's ZIP has inconsistent central-directory offsets; `scripts/map_zip.py` corrects the reader's offset only after every local filename matches, then verifies every member CRC. It never changes the downloaded bytes.

- [Newberry downloads](https://publications.newberry.org/ahcb/downloads/index.html), [U.S. files](https://publications.newberry.org/ahcb/downloads/united_states.html), [Open Access Policy](https://www.newberry.org/policies)
- [Natural Earth physical data](https://www.naturalearthdata.com/downloads/10m-physical-vectors/), [river supplement](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/), [terms](https://www.naturalearthdata.com/about/terms-of-use/)

Only the scripts are intended for adoption now. `public/map-data/`, raw GIS files, ZIPs, developer tools and `dist/` are ignored. The derived JSON has local recipes identifying the inputs and script hash. Its rebuild matches byte for byte. Eight R16 SVGs are copied unchanged into `web/map/icons/`, with source paths, SHA-256 and consumption recipes; `npm run map:icons` rebuilds those copies. No new image generation or existing art edits were used.

## Checks and evidence

```powershell
npm test
npm run build
npm run test:ui
```

The testbed UI tests start a testbed process when none is running:

```powershell
$env:DESK_PACK='testbed'
npx playwright test test/map.spec.ts --grep 'testbed map'
npx playwright test test/testbed.spec.ts
```

`npm run build` verifies and bundles the browser. This is a local-server prototype; `/art/` URLs are served by its middleware, and Vite reports that those URLs resolve at runtime. The build is not a standalone distribution. The root's normal `npm run check` remains a separate required gate.

R14, R18 and R17 evidence remains in its original folders. General browser tests still use **`art-masters/R17/`**; `DESK_EVIDENCE_RUN` selects a separate results folder. The R15 document checks below always use **`art-masters/R15/`**. Set `DESK_EVIDENCE_REQUEST=R15` when running unit/equivalence tests for R15 so they preserve earlier evidence. Use separate fresh processes for the Union and testbed fixtures.

The root check passed 1,186 tests with 3 skips and all other gates. The prototype's 13 unit/equivalence tests passed, including the three-turn command-log comparisons and map/typed-console edit comparison. Those results are reused after browser-only corrections; the final typecheck and browser build also pass. Existing Union and testbed browser regressions pass. Keyboard evidence covers every requested key, typing guards, shared mouse actions, focus restoration and region Tab order.

`screenshots.json` identifies the 24 primary R17 captures: desk, paper and map at both type extremes, and both skins, at 3440x1440 and 1920x1080. `skin-measurements.json` records paper contrast of 18.88:1 for high contrast and at least 4.75:1 for evening lamp, with 3px keyboard focus rings. The shape of the text reflows without horizontal scrolling. Testbed supplies the populated papers for these captures.

`final-checks.json`, `delivery-inventory.json`, `preservation.json`, `runtime.json` and retained logs/traces record the maker verification. The preservation audit finds no net change among 24,307 files outside R17's scope, excluding dependency/build caches and git metadata. An initial test inherited R18's output folder; its artifacts were retained under R17 and R18's original last-run file was restored by its baseline SHA-256. Review and acceptance remain with Claude's standing reviewers.

## Deliberate limits

- Plain CSS cards stand in for missing likenesses. Document and docket layouts remain procedural; R15 supplies the sourced document decoration described below. The audience scene remains deferred.
- Union currently opens with no papers or situations. Its later reports are the console's reports. Testbed exercises authored docket choices.
- Names use the supplied pack string keys, with separate lookups for people, posts and regions. Missing lookups show ?Not supplied?; the desk does not invent a name. The R19 testbed plan has one missing lookup, `least_cost`. The checked Union views have none.
- The console does not expose refill dates, full action prices, situation-clock ranges or further personnel assessments. Only supplied figures and route prices appear. The ledger reads authored returns without inventing treasury or other figures.
- No new save/load, scenario selector or stop-setting acts are added beyond the console's loop. Standing and gate review remain for the project resume.
- R17 supplies the keyboard bindings, skins and writing sweep. Key rebinding remains deferred.

## Document decoration (R15)

Telegraphic dispatches use the blank telegraph header; press reports use the wordless masthead ornament. Double rules separate paper headings and metadata; thick/thin rules separate paragraphs on printed returns. The art is PNG alpha rendered as a CSS mask, so ink follows the active skin. High-DPI screens select the independently rasterized `@2x` files. All text stays in normal document flow and retains the console's wording; the decorations are hidden from assistive technology.

The five designs and their 1x/2x recipes are in `art/union-1861/documents/`. `make_documents.py` in ignored `art-masters/R15/` rebuilds them with Python and Pillow, without image generation or scan pixels. The source records name General Orders No. 94 (4 August 1862), the Ellis telegram (15 April 1861), Bates's 1907 book, and the three newspapers named in R15. Source files, rights evidence, crop coordinates and SHA-256 are retained there. Illustrated mastheads, figures, emblems, advertisements and notices are excluded; only non-figural layout/rule crops are used. The layouts are our interpretation rather than facsimiles. Bates's later-war examples inform spacing only.

The General Orders head is delivered but unused: the console's `ReportType` has no General Orders genre. Letterhead vignettes and return-form rules still await research. Existing generic return layouts are retained. The local middleware serves only the ten named document PNGs; recipes and other pack art remain inaccessible.

```powershell
npm run test:documents
$env:DESK_EVIDENCE_REQUEST='R15'
npm run check
```

The first command generates real console papers after three testbed turns and checks both genres at 3440x1440 and 1920x1080, at 100% and 200% type. The browser receives the resulting seat snapshot as a test fixture; no fixture is part of normal gameplay. It also checks HTTP access, skin colours, high-DPI image selection and printed-return rules. `npm run test:ui` generates this fixture before the general UI tests as well.

R15 evidence includes 19 browser captures, 12 source/asset/template comparisons, layout measurements and native rule-pixel checks. All 13 unit/equivalence tests pass, as do the three focused document tests, the final typecheck/build and root boundary/licence/decision checks. R17's root suite evidence is reused for unchanged kernel, CLI, pack and dependency files; R15 does not rerun the root hook tests that invoke git. Existing runtime-art and bundle-size build warnings remain. Maker verification is complete; standing reviewer acceptance remains pending.

Vite **7.3.1** is deliberately pinned: Vite 8's required Lightning CSS dependency has an MPL licence, while R14 requires permissive dependencies. The clean prototype lockfile contains only MIT, ISC, BSD-3-Clause and Apache-2.0 dependencies. React remains version 19 and TypeScript/Vitest version 7/5 respectively.

The three font families are self-hosted, with OFL text, source references, hashes and recipes beside their WOFF2 files in `public/fonts/`. `scripts/fonts.py` reconstructs IM Fell's upstream split TTX tables and encodes upstream fonts with FontTools/Brotli; `scripts/font-recipes.py` records provenance. Sources: [IM Fell English](https://github.com/librefonts/imfellenglish), [Libre Caslon Text](https://github.com/impallari/Libre-Caslon-Text), [Old Standard](https://github.com/akryukov/oldstand/releases/tag/v2.2). The local middleware follows [Vite's documented server hook](https://vite.dev/guide/api-plugin.html#configureserver).


## Names and the map sheet (R19)

The board, person cards, papers, plan sheets, search results and map descriptions use the names supplied with the seat request. The order field shows names between angle brackets while preserving the console identifiers in the commands it sends. A raw console command can still be pasted into the field. Signed commands and the text record use the same name lookup.

The staff map fills its sheet when no plan is open. A plan adds its column beside the map. Nearby report signs are spaced apart with leader lines to their reported places, so each can be hovered or focused. Find can also focus an off-map report, including Panama. R21 widens the Natural Earth base and limits the camera to its coverage.

Run the R19 browser checks from this folder with a fresh local server slot:

```powershell
$env:DESK_EVIDENCE_RUN='peace'
npx playwright test --config playwright.r19.config.ts
$env:DESK_AT_WAR='1'
$env:DESK_EVIDENCE_RUN='war'
npx playwright test --config playwright.r19.config.ts
```

The R19 configuration writes only to `art-masters/R19/`. Its plan and retained-week fixtures are the saved real-console snapshots there; `testbed-fixture.ts` rebuilds the plan fixture. These focused checks stay outside the general browser configuration. The real war week runs from 6 to 13 March 1861 and produces 14 headquarters reports and one positive enemy estimate. It produces no works report; a separate, explicitly synthetic claim tests that presentation path. The text record includes all 15 signs, with Panama outside the default map fit.

R19's 16 unit/equivalence tests pass, including the three-turn Union peace/war and testbed comparisons and the map/typed-edit command-log comparison. The final typecheck/build and root boundary, licence and decision-index checks pass. The full root suite is not rerun because its hook tests invoke git, which R19 forbids; earlier R17 evidence is reused for the unchanged kernel, CLI, packs and root dependencies. Existing runtime-art and bundle-size warnings remain. Browser logs, final captures, unresolved lookup lists and preservation evidence are in `art-masters/R19/final-checks.json` and its referenced files. Standing reviewer acceptance remains pending.

## Map labels and frame (R20, corrected in R21)

Region names yield to report signs, with rotated text measured along its authored spine. This leaves the existing sign positions and their reported anchors unchanged. Hidden names remain available through Find and the map's text record. The sheet supplies the title; the map header keeps the date and text-record button.

The rectangular double rule follows the edge of the canvas at every zoom. Land and water fill it. Default fit includes the full bounds of every on-map shape and all 256 on-map reference points, including New England. The 12 authored off-map placeholders remain outside this fit under decision 0031; their coordinates are unchanged. Find still reaches the Panama report. R21 replaces R20's inset frame and widens only the base layer; all 268 region records are preserved exactly.

Run the focused checks with the saved R19 war week:

```powershell
$env:DESK_EVIDENCE_REQUEST='R20'
npm run check
npx playwright test --config playwright.r20.config.ts
```

The R20 browser configuration writes to `art-masters/R20/` and starts a fresh local server. Its tests check sign/name collisions at 1920x1080 and 3440x1440, at fit and after Show Virginia, plus the single title, date, text record, ruled frame and Panama report. The retained fixture avoids another simulation week. For the existing live testbed plan regression:

```powershell
$env:DESK_PACK='testbed'
$env:DESK_R20_MAP='1'
npx playwright test --config playwright.r20.config.ts --grep 'testbed map'
```

R20's maker evidence includes four required map captures, label and frame measurements, the plan-handle regression, fresh unit/command-log equivalence results and the final build. The root typecheck, boundary, licence and decision-index gates pass. The unchanged root simulation suite reuses R17's evidence; its git-using hook tests are excluded from this run under the command-line rule. Standing reviewer acceptance remains with Claude.


## Base coverage and verification (R21)

The Natural Earth source box is now 170 degrees west to the prime meridian, and 30 degrees south to 75 degrees north. It encloses a fixed safe rectangle in the existing Albers projection. Every camera change is limited so the entire canvas stays inside that rectangle, including pointer drag, keyboard pan, zoom and Find. If a viewport is too large at the requested zoom, the minimum scale increases to cover it. The projection and region geography are unchanged.

The existing source archives and rights records remain in `art-masters/R18/sources/`. Rebuild only the widened base, preserving the existing Union regions and the testbed file:

```powershell
python scripts/build-map.py --base-only --evidence-request R21
python scripts/verify-map.py --evidence-request R21
```

A full `npm run map:build` also uses the widened box. Derived geometry and recipes remain locally ignored pending the existing Newberry confirmation; the base update does not change that restriction. The updated recipe records the prior geometry hash, source manifest, script hash and R21 evidence. Modern hydrography retains the existing historical limitations.

Run the focused browser checks with the saved R19 war week:

```powershell
$env:DESK_EVIDENCE_REQUEST='R21'
npm run check
npx playwright test --config playwright.r21.config.ts
```

The configuration starts a fresh Union server and writes only to `art-masters/R21/`. Its two tests measure canvas/frame agreement, independently project every on-map point and shape at default fit, check New England's name, and test geographic source coverage around the canvas perimeter. They cover fit, Virginia, both zoom limits, all four pan limits and Panama at 1920x1080 and 3440x1440. Report buttons must retain their 24-pixel hit areas and placed coordinates; fit and Virginia must have no label/sign overlap. A scoped CSS reset prevents the enemy text panel's spacing from displacing an enemy estimate button.

For the existing live plan-edit regression, use a separate process:

```powershell
$env:DESK_PACK='testbed'
$env:DESK_R21_MAP='1'
npx playwright test --config playwright.r21.config.ts --grep 'testbed map'
```

Unset those two variables before the Union checks. `DESK_R21_VIEWS` can select comma-separated views for a targeted correction; leave it unset for the complete check. `DESK_R21_PREFLIGHT=1` selects fit only. The ordinary browser configuration excludes the R21 fixture tests so it preserves their evidence scope.

All 16 unit/equivalence tests pass, including the three-turn Union peace/war and testbed comparisons; the map/typed-edit hash is unchanged. The final build and geometry checks pass. The live plan regression and the corrected fit/Virginia checks pass. Coverage and camera-limit evidence from unaffected views is reused, with its source runs identified in `settled-camera-evidence.json`. The first matrix used an absent Panama option; a clean targeted check replaced it with Find. The ultrawide fit then exposed the inherited enemy-panel CSS conflict; corrected sign positions and label clearance passed at both sizes.

The four requested captures are `map-war-fit-*` and `map-war-virginia-*` in `art-masters/R21/`; two live plan captures are also indexed in `screenshots.json`. `final-checks.json` records the checks and preservation audit. Root typecheck, boundary, licences and decision index pass. The unchanged root simulation suite reuses R17 evidence because its hook tests invoke git. Existing runtime-art and bundle-size build warnings remain. Standing reviewer acceptance belongs to Claude.
## The manuscript map (R24)

Look A is the default under decision 0093. The selector, **V** with map focus,
and `?look=0`, `?look=B` or `?look=C` retain the other skins. The playable desk
opens on the war theatres; zooming out still reaches the whole authored map.
The table layout remains a separate read-only study:

- `/?study=1&look=A` frames the Eastern theatre.
- `/?study=1&look=A&detail=hero` frames Harpers Ferry to Fredericksburg, across the Blue Ridge and the lower Potomac.
- `/?study=1&look=A&detail=manassas` opens the closest Manassas view.
- `/?study=1&look=A&detail=theatre` shows the opening theatre fit.
- `/?study=1&look=A&layout=table` opens D with its received report and commander card.

The study uses the process's current seat request. The capture tests substitute
only the real saved 22 March seat view accepted by Claude for R23. Control,
front, estimate, draft and revision mocks are explicitly marked illustrative;
they never enter the playable desk, a SeatRequest or a command.

Four static resolution bands hold seeded paper fibres, uneven toning, foxing,
folds, iron-gall linework, contour-row relief, black ladder rail, blue water,
coastal water-lining and geographic graticules. R25 builds these images beside
the ignored geometry. Paper and ink use coordinate hashes, without time or
runtime randomness. Opening the desk, changing a skin, panning and zooming load
saved images without a static bake. The atlas remains 85.574 MiB under the
96 MiB cap; old GPU textures are destroyed on replacement.

Close bands use Newberry's 0.001-degree source with 0.0003-degree display
simplification, finer Natural Earth coast geometry and county outlines dated
31 December 1860. Original region records, hit shapes, reported anchors and
rail records retain their hashes. State boundaries use 6 March 1861 counties.
Display joins are rounded without changing source or hit coordinates. No graph
adjacency is derived. Towns use pack points and the pack's size hints; the rail
line source supplies no station catalogue, so no stations or roads are invented.
Sea regions have italic capitals without a fill or a box.

Relief is derived from elevation isolines. Broad views retain NOAA ETOPO1;
close views substitute a USGS 3DEP bare-earth extract across Virginia/Maryland,
with finer 50-metre rows and stroke lengths from contour separation. Slopes
below the cutoff receive no hachures. One sparse TIFF tile has no source pixels;
the decoder excludes it. The DEM is modern landform evidence, not reconstructed
1861 infrastructure. River/coast corridors clear the relief. Pale paper halos
keep linework off names; names and captions reserve each other's bounds.
The Centreville estimate stays at Centreville, and ordinary names yield to it.

The study's A washes pool at their edges, granulate and bloom, with stronger
outline colour fading inward. Strength remains tied to claimed permille and
contested shapes remain hatched. Front teeth, draft outlines and hatching vary
by seeded pressure; blue pencil has broken grain. Headquarters retain R16's
meaning and gain a short staff. The frame carries degree ticks, a north arrow
and a measured period scale in miles. The cartouche has a plain ruled frame,
compilation line and received date. No figures, seals or emblems are added.

New raw sources and exact export URLs, rights, credits and hashes are in
`art-masters/R24/sources/manifest.json`; R18/R22 masters and existing OFL fonts
are reused unchanged. Credit the rails as: Jeremy Atack, *Historical Geographic
Information Systems (GIS) database of U.S. Railroads for 1861* (May 2016; revised
October 31, 2023), with the owner's permission recorded in CODEX R22. Annual
InOpBy selection does not establish day-exact March availability. The manuscript
reference page is named under `art-masters/R24/references/`; scan retrieval
failed (429/403), so no scan pixels were used or traced.

With the saved masters present, rebuild after the R18/R22/R23 base pipeline:

```powershell
python scripts/build-r24.py
python scripts/build-r24-relief.py
python scripts/verify-map.py --evidence-request R24
$env:DESK_EVIDENCE_REQUEST='R24'
npm run check
npx playwright test --config playwright.r24.config.ts
```

The R24 configuration writes to `art-masters/R24/`. For the existing live
plan-edit/refusal/send-back regression, use a separate process:

```powershell
$env:DESK_EVIDENCE_REQUEST='R24'
$env:DESK_EVIDENCE_RUN='plan-regression'
$env:DESK_R24_REGRESSION='1'
$env:DESK_PACK='testbed'
npx playwright test --config playwright.r24.config.ts --grep 'testbed map handles'
```

Clear the regression and pack variables before Union captures. Vitest's module
cache is explicitly inside this prototype; its workspace-root default would
otherwise write beyond the request's scope.

R24 delivers eleven image/recipe pairs: matching hero before/after, Eastern A
and D at both target sizes, both closest Manassas views, both opening-theatre
views, and a comparison against R23 A. `final-checks.json` indexes validation,
source and preservation evidence. All 24 unit/equivalence tests pass, including
three-turn Union peace/war/testbed and map-versus-typed-edit log hashes. The
capture checks, live plan regression, build/typecheck, geometry integrity and
byte-identical rebuild pass. Non-git root checks pass; all 431 inputs supporting
R17's root simulation results still match. The full root suite is not rerun
because its hook tests invoke git. Existing runtime-art and bundle-size build
warnings remain.

Cold bakes measured 13.88-15.33 seconds. The short ultrawide pan sample measured
24.1 ms median renderer work and 501.3 ms median animation-frame cadence on
SwiftShader software rendering. These are separate measurements and do not
qualify a hardware frame-rate target. The scene and source limits above remain
visible in the recipes; maker verification does not replace Claude's review.

## Finishing the manuscript (R25)

After running the existing geometry and cartography builders, build the saved
map images and compact display geometry:

```powershell
npm run map:bake
npm run dev -- --at-war
```

The bake writes PNGs, recipes, a manifest and display geometry under
`public/map-data/<pack>-atlas/`, covered by the existing ignored map-data rule.
It covers A, B, C and 0 in normal, lamp and high-contrast settings, with separate
A comparison images for the illustrative claims. The build browser binds only
to loopback port 5275 and closes when finished. `npm run map:build` also invokes
this final bake after rebuilding the base geometry; the R22–R24 cartography
builders still supply the detailed relief and rail layers.

The dev server checks source and image hashes before opening. Current outputs
are reused. Missing or stale images rebuild once at startup, so a first open
after changed data can take longer. The browser reads compact display geometry:
region records, reference points, hit shapes and river lines are preserved
exactly; fixed label angles are precomputed. Relief, rail and base paths remain
in the full build geometry and saved images. No game data or command changes.

Frame labels use degrees and minutes. Latitudes belong to the side edges;
Greenwich longitudes appear above and Washington longitudes below. E denotes
east of Washington. The offset is the Old Naval Observatory coordinate in
Culley, *Meridians of Washington*, Geodetic Letter 3(1), March 1936; its archived
text and datum limitation are in the R25 recipe evidence.

Unclaimed water uses the paper tone. Coastal pigment has a finite, granulated
band and pooled rim; state limits and wash rims use broken lines. Headquarters
sharing a reported place have one leader caption containing each holder and
report date. Captions clear the front, arrows, rivers, other captions and signs.
Contested hatching is lighter with 18-pixel perpendicular spacing. The closest
view keeps surrounding hills and both Manassas Junction and Washington visible;
a tighter frame magnified sparse country without a road or station layer.
The cartouche reads “Compiled from reports received”. A stays the default and
D stays on its separate illustrative route.

```powershell
$env:DESK_EVIDENCE_REQUEST='R25'
npm run check
npx playwright test --config playwright.r25.config.ts
```

The R25 configuration writes only to `art-masters/R25/`. For the live plan test,
use a fresh process with `DESK_PACK=testbed`, `DESK_R25_REGRESSION=1` and
`DESK_EVIDENCE_REQUEST=R25`, then select `--grep 'testbed map handles'`.

R25 retains eleven image/recipe pairs: hero, Eastern A, D, closest Manassas and
opening theatre views at both sizes, plus a six-panel comparison against R24.
The hero camera matches R24 exactly. All 29 unit/equivalence tests, the final
build, capture checks and live plan regression pass. Non-git root gates pass;
the root simulation evidence is reused for 431 unchanged inputs because its
hook tests invoke git. Existing runtime-art and bundle warnings remain.

The two-second startup gate uses the browser timestamp after canvas rendering
and synchronous caption layout, from navigation time origin. Eight opens cover
both sizes; the seven later opens measured 1.43–1.55 seconds. Later Playwright
inspection completion times are retained separately. Stage profiling exposed
that inspection as part of the earlier timer. The compact-data and prepared
label views are pixel-identical to the retained Eastern, D and close captures
at 1920x1080. Other unaffected captures and pan samples are reused explicitly.
`art-masters/R25/final-checks.json` indexes the settled evidence and failures.
SwiftShader timings do not qualify hardware frame-rate targets. Claude's
standing review remains pending.


## R26: the playable table

Run `npm run dev -- --at-war` to open the full-screen manuscript table. There is no map sheet to open or put down. M focuses its canvas; T opens the accessible text record. The comparison route `/?study=1&look=A&layout=table` retains the labelled illustrative layers; those layers are absent from play.

The shared projection centres on 85° W. The north arrow follows true north at the current view centre. Washington-meridian ticks use whole degrees from Washington, with W/E suffixes. Grouped headquarters captions have compact dated rows, remain near their flags and use visible leaders. A selected holder card replaces the duplicate hover caption. D's cartouche occupies the upper-right corner; the playable cartouche occupies the lower-right reading edge.

The Union evidence covers 6–13 March 1861. A real plan causes the first stop on 8 March; approving Stone's submitted holding plan allows the remaining five days to run. The twelve main captures cover the requested six states at 1920×1080 and 3440×1440. The holding plan is the console's own single-place plan, so no marching arrow is fabricated. The docket is honestly empty in this Union week. No likenesses or roads were added.

`art-masters/R26/days-run.webm` records the five-day run in 43.16 seconds at 960×540, from a 1920×1080 desktop. All 31 received reports appear in their console delivery order before entering the in-tray. The initial full-HD encoder setup consumed about 69 seconds before the page was available; its failed trace and recording are retained. A three-report diagnostic established that playback itself continued correctly, and the smaller recording then passed. The video is uncut and unaccelerated. Returning a paper does not cancel playback; Next day skips to the next date or the stop.

Current checks write to R26, with fresh Union and testbed server processes:

```powershell
$env:DESK_EVIDENCE_REQUEST='R26'
npm run check
npm run test:ui
npm run test:plan
```

`test:ui` first derives the saved fixtures from actual console commands. The prototype's 32 unit/equivalence tests and final build pass. Focused browser evidence covers the table, reports, off-screen navigation, flag cards, books, plan editing/refusals/send-back, report playback, keyboard acts and 80%/200% type at both sizes. Later warm opens measured 1.26 and 1.48 seconds, including canvas and synchronous overlay layout. Non-git root gates pass; R17 simulation evidence is reused for 431 unchanged inputs. Existing runtime-art and bundle warnings remain. This is maker verification; `art-masters/R26/final-checks.json` indexes the evidence.

Earlier browser configurations preserve their original layouts and evidence destinations. The console's send-back notes limitation remains unchanged.

## R27: the table's first view

The Union table opens on the Eastern theatre, keeping Pittsburgh, Baltimore,
Lynchburg and Hampton Roads in the frame. `web/map/framing.ts` holds the small
pack-keyed opening table until these bounds move to the pack's map hints.
**Fit the map** and the map's **0** key still show the wider theatres of war.

Region names appear by size class and zoom. Authored label sizes and minimum
zooms take precedence. The current Union geometry has neither, so a display
fallback classifies polygon area: at least 2 square degrees of spherical area
is large, at least 0.45 is medium, and the remainder is small. Large regions and
water can be named at theatre fit; medium names enter at 1.7 times that scale,
small names at 3, and key points at 2.4. Names leave at 90% of their entry scale,
so small zoom changes and repeated redraws do not flicker. Collision checks
still apply. Hover names remain available, and the text record lists every
region, including places omitted from the current drawing. No geography or
pack record is changed by this fallback.

Meridian headings occupy a separate row inside the tick labels. Pan controls
use words, and **Let the days run** has no arrow suffix.

From `prototypes/desk/`, the current focused checks write only to R27:

```powershell
$env:DESK_EVIDENCE_REQUEST='R27'
npm run check
$env:DESK_R27_CAPTURE='1'
npx playwright test --config playwright.r27.config.ts
npx playwright test --config playwright.r27-plan.config.ts
```

The six image/recipe pairs in `art-masters/R27/` show the opening, theatre fit
and a closer Virginia view at 1920×1080 and 3440×1440. The closer view uses
**Show Virginia**, followed by three **Zoom in** presses. The R27 plan check
reuses R26's real testbed edit/refusal/send-back sequence, with its evidence
redirected to R27. The R26 playback, keyboard/skin and source-geometry evidence
is retained; the new browser check exercises the revised names, hover, text
record, camera, plain buttons and meridian clearance.

## Continuous relief (R28)

The hachures come from one elevation field at every zoom. A 5200×4800 USGS
3DEP export covers the Eastern frame and southern Appalachians. It blends into
the retained NOAA ETOPO1 surface over two degrees before gradients or contours
are calculated. The old Virginia rectangle and close-only relief list are gone.
All mountain belts use the same 100-metre contour rows and downhill strokes,
with their length and strength set by metric slope. Sparse USGS tiles reuse
the coarse elevation rather than becoming invented flat ground.

After building the existing geometry and cartography, run from this directory:

```powershell
python -m pip install --target .geometry-tools -r scripts/r28-requirements.txt
python -B scripts/fetch-r28.py
python -B scripts/build-r28.py
python -B scripts/test-r28-relief.py
npm run map:bake
npm run dev -- --at-war
```

The fetch caches its source, response, service metadata, URL, rights record and
hash under ignored `art-masters/R28/sources/`. The field uses the existing
ETOPO1 coverage; the wider 3DEP source spans 86° W to 73° W and 31° N to 43° N.
These are modern bare-earth landforms. No roads, buildings or places are added.

The detailed Eastern raster extends west over the Cumberland edge and south
over the Appalachians. Sampling it at 16 pixels per map unit keeps the atlas at
88.06 MiB, below 96 MiB. Higher bands meet the lower image through a smooth
128-pixel margin. The build checks the actual PNG alpha borders as well as the
mask's pixel steps. Static rendering still happens before play.

```powershell
$env:DESK_EVIDENCE_REQUEST='R28'
npm run check
npx playwright test --config playwright.r28.config.ts
```

R28's evidence includes 37 unit/equivalence tests, three surface tests, the
both-size capture and zoom checks, and repeated playable-desk opens. The latter
take 1.26–1.59 seconds after the first open. Slower initial capture and comparison
route timings remain in `timings.json`; software rendering does not qualify a
hardware frame-rate target. The normal A bake takes 16.38 seconds.

`art-masters/R28/` holds the opening and hero at both sizes, a matched comparison
against R27, their recipes, and supporting proofs. The opening cameras match
R27. The hero keeps its authored geography under R26's north-up projection and
uses the accepted real 22 March scene; illustrative claims remain on that route.
The density scan detects the known R27 rectangle and no matching long straight
break in the new Eastern relief. `final-checks.json` indexes its thresholds,
measurements, preservation checks and reused simulation, playback and keyboard
evidence. The first captures and the raster-coverage correction are retained in
`first-pass/`. Claude's standing review remains pending.

## Claimed control (R29)

The table uses the seat's `controlBeliefs` and `claimedFronts`. Blue belongs to
the seat's faction, red to the opposing faction, and ochre to explicitly
reported neutral government ground without a faction holder. Each wash follows
its region, with a pooled rim, two-colour contested hatching, broken pencil
edges and fading from the report date. The existing paper and relief atlases
are unchanged. Front teeth face the reported opposing region. A contact without
a common cartographic area edge uses a short staff mark rather than inventing
a continuous surveyed boundary.

Hover names the reported holder, shares, authors and date; the text map carries
the same information. Conflicting observer corrections use violet ink. Received
signs and changed control marks draw on unless reduced motion is enabled.
Approved arrows retain routes that the player saw before approval. The adapter
records them only after the kernel accepts the order; cancellation and refusal
cannot approve an arrow. Its colour records the president's approval, without
asserting that the commander has executed it.

During playback the server projects cumulative received control reports through
the kernel. The browser displays those projections as their papers land. It
does not derive political control or infer adjacency from geometry.

From this directory, the R29 checks and evidence fixtures are:

```powershell
$env:DESK_EVIDENCE_REQUEST='../../ByOrderOfThePresident/art-masters/R29'
npm run check
npx tsx scripts/r29-fixture.ts
npx playwright test --config playwright.r29.config.ts
npx playwright test --config playwright.r29-plan.config.ts
```

R29's capture scripts use the main checkout's ignored `art-masters/R29/`.
The normal prototype command remains `npm run dev -- --at-war`. This worktree
also has verified copies of the previously delivered runtime assets.

At the root, `MANDATE_NO_GIT=1 npm run check` excludes the staged-hook test file
before collection, so the Codex command-line lane can obey its no-git rule.
Without that flag the ordinary hook tests remain enabled. The first attempted
per-test guard did not prevent git fixture execution; that failed run is
retained and is not evidence of compliance with the command rule.

The live March opening has no contested region. The labelled comparison route
`/?study=1&proof=control&look=A` can display the isolated synthetic control
projection from the R29 proof fixture, outside the playable request. The real
week and recording contain no control-transfer report, so they do not establish
a live territorial-transfer animation. Ten capture/recipe pairs, the short
recording, measurements, maker review, exact file inventory and retained failures
are indexed by `art-masters/R29/final-checks.json`. Formal acceptance remains
with Claude's review lane.
