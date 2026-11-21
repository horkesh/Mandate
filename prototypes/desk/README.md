# The playable desk and staff map

A standalone React 19 / TypeScript prototype of the playable map table (0093, R26). It plays the real console driver and draws the staff map in PixiJS 8.

From a checkout with the root workspace dependencies installed:

```powershell
cd prototypes/desk
npm ci
python -m pip install --target .geometry-tools -r scripts/map-requirements.txt
npx playwright install chromium
npm run map:setup
npm run dev
```

Open **http://127.0.0.1:5274/**. The process owns one local session, shared by its browser tabs. Refresh preserves the game and queue. Read/file marks belong to the current page; display, sound and playback settings persist in local storage. Restart the process to begin a new game.

On the turn sheet, **Maximum days this turn** can return the desk sooner than the pack's maximum. Selected decision stops still apply. The text console accepts the same limit as `end 2`, for example; plain `end` keeps the pack maximum.

The same sheet lists **Calls due** when an identified requisition is eligible on the seat's menu. Signing copies its supplied regiment or men count, arm, term and readiness. A queued call cannot be signed twice there. The shared text grammar is `call <post> scheduled=<id>`; it accepts the published terms without overrides.

### Map setup

`npm run map:setup` fetches missing pinned inputs, builds stale geography in dependency order, then bakes stale map and sign images. Current recipes and output hashes reuse completed work; CRLF/LF changes alone do not invalidate geographic recipes. `python -B scripts/map-setup.py --check` lists the required geography stages. Missing pack files, tools, failed downloads and changed source hashes fail with the input named. Python dependencies and Chromium must be installed first, as above.

New sources and build intermediates stay in ignored `data/map-setup/rebuild/`; the older builders run there so they cannot overwrite historical evidence. Existing verified source masters can seed that cache without a download. `--full` rebuilds geography from the base stage. Raw-source retrieval is pinned to the accepted source catalogue in `scripts/map-sources.json`; a changed provider export needs a reviewed catalogue update. The research palette and straight map remain the default; the retained sign experiment still requires `?signs=on`.

`npm test` needs no ignored map files or old evidence directories. Eight integration checks skip only when their named map inputs are absent; each skipped title names `npm run map:setup`. With those inputs present they run normally and malformed data fails. Test evidence defaults to `node_modules/.cache/desk-test-evidence`, or to the explicitly selected `DESK_EVIDENCE_REQUEST` folder. Historical Playwright delivery scripts still use their original request fixtures; they are separate from this unit/equivalence suite.

### Finding papers

The in-tray filters received papers by sender group, named place and unread status. **Clear filters** clears all three. Opening a paper marks it read; returning it preserves the filters. Sender groups use only the received paper's type, the supplied post title and the morning's commandable posts. Unknown roles stay under Others.

**The week’s papers** is computed when opened from the seat's held papers. It links qualitative reported changes of hand, battle dispatches and plans still awaiting review. Every entry retains its author and date and opens its source paper. Filing a source does not erase the seat's knowledge. No summary or new game data is stored.

R43 remains incomplete for the press's main stories: today's `ReportView` has no press story body, and the real press papers checked have empty claims. The console text is only an envelope such as `about person …`. The weekly paper therefore offers attributed press source links, without inventing headlines or stories. Completing that requirement needs a lead-owned view change; no kernel or CLI change is made here.

`npm run test:intray` creates the real at-war volume fixture and runs the R43 browser checks. The retained scan covers eleven completed weeks, days 1–77, with a silent human principal. Days 22–28 have the most held papers received in a week: 41, in an in-tray of 42. The partial summary links seven papers (four battle dispatches and three press envelopes); no waiting plan or control transfer was in that week's held papers. This is the busiest observed week in that bounded run, not a claim about every possible campaign.

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

Opening a submitted plan brings its sheet beside the map. **Fit plan** frames the draft and the pencil routes. Drag an objective or waypoint handle to a region, or focus a handle and use the arrow keys to choose a region, then Enter to mark it. The form offers the same marks. The console previews each change against the submitted plan before a blue route appears. When sent as binding edits, each mark is a separate counter-order; the display makes no prediction about the commander's response. The strike control also uses the preview and respects its refusal to remove a plan's only axis.

**Order these changes** queues the exact console edits. **Send back with notes** sends the held marks in one `sendback <post>` payload and clears them after the queue accepts it. An objective mark becomes `focus:axis:region`, a waypoint becomes `via:axis:region`, and a struck axis asks him to avoid its objective. The console also accepts `wait:axis:days` and several notes on one line. A colon inside an axis or region identifier is escaped as `%3A`. The commander reads the delivered notes through compliance and redrafts with soft scoring preferences. He may set every note aside. His returned plan sheet shows his account and stated reasons. Sending notes does not approve a plan or bind an arrow edit. Note wording comes from the pack's `plan.note.*` strings. Approval and the typed edit sheet remain available.

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

## R30: stronger control colour and the missing Eastern areas

The live washes use ultramarine blue `#084bd6`, crimson red `#d32238` and
yellow ochre `#f7c52f`. Pencil pigment rises from 0.32 to 0.60 and ink from
0.44 to 0.72, before the existing age and share factors. The pooled rims,
broken pencil edges, contested hatching, violet corrections and blue pencil
orders retain their meanings. Paper and relief remain in the saved atlases.
The six-entry manuscript key sits beside the cartouche, with text for every
swatch. Its hatch survives high contrast and its type follows the desk setting.

The bare Eastern regions had received reports, rather than low positive shares.
Washington, Fort Monroe and the Eastern Shore each have Union 1000‰. Annapolis
and Southern Maryland, the Peninsula, Norfolk, and Suffolk and City Point have
explicit neutral-government reports with empty faction shares. All 219 start
table rows occur in the opening bulletin with identical faction shares. The
unreported sea and river regions stay paper and say "no report received".

Seven missing display areas are rebuilt from the existing Newberry archive's
records active on 6 March 1861. The publisher omits possessive apostrophes and
adds `(ext)` to counties that later ceased to exist. The District is the sole
active District of Columbia county record, `dcs_washington`. Exact source IDs,
dates, county matches, licence and hashes are in `art-masters/R30/area-build.json`.
No partial area or guessed boundary is used. The supplement fills only null
shapes in compact display geometry; it changes no claim, pack, graph edge,
reference point, existing shape, river, or static atlas. Other claimed places
without recovered areas, including Baltimore, get a small coloured point sign.
They do not acquire an invented territorial field.

From this worktree's `prototypes/desk/`, with its existing map data and tools:

```powershell
python -B scripts/r30-areas.py
npm run dev -- --at-war
```

The first command reads the retained R24 Newberry source in the main checkout
and writes an ignored `public/map-data/union-1861-claim-areas.json` plus recipe.
The normal startup merges it into compact geometry and loads the unchanged
saved atlas. Rebuilding those seven areas produces identical bytes.

The current checks keep evidence in the main checkout's R30 folder:

```powershell
$env:DESK_EVIDENCE_REQUEST='../../ByOrderOfThePresident/art-masters/R30'
npm run check
npx playwright test --config playwright.r30.config.ts
npx tsx scripts/r30-measure.ts
python -B C:/Pyrrhic/ByOrderOfThePresident/art-masters/R30/measure.py
```

The 48 unit/equivalence tests, build, final typecheck and non-git root gates pass.
The six distinct browser checks cover the seven areas, both display sizes,
normal and enlarged/high-contrast key, no-report hover/text, eight real views,
and a matched pigment comparison. R29's real peace/war/week fixtures are reused;
no simulation campaign or synthetic political claim is added. The original R29
opening images supply the before-and-after sheets. A separate fit image uses
test-only module interception to reconstruct R29 pigment/opacity on identical
R30 geometry and paper; it is a measurement control, not an original R29 capture.

Measured median raster HSL, R29 to R30, on the clean 1920 fit:

| Wash | Hue | Saturation |
|---|---:|---:|
| Union | 150.0° → 220.7° | 3.6% → 41.2% |
| Enemy | 20.7° → 2.7° | 49.7% → 59.1% |
| Neutral government | 41.3° → 44.1° | 55.6% → 82.4% |

The nearly grey R29 Union field has an unstable hue; its very low saturation is
the useful comparison. `pigment-measurements.json` also gives source-pigment HSL,
the RGB values, masks, pixel counts and method. Full-share area masks exclude
pooled rims, labels and furniture. Native peace, war, fit and Virginia captures
at 1920×1080 and 3440×1440, their recipes and two comparisons are in R30.

Earlier diagnostic evidence is retained. A stylesheet precedence error initially
put the scale under the key; scoped styling fixes it. Namespaced swatches avoid
the enemy panel's CSS. The capture fixture initially reversed the sea region's
ID; correcting that selector passed the focused hover check. The final clean
captures park the pointer on the calendar because `(0,0)` is itself map ground.
`first-capture/` preserves the earlier images. The full desk gate is reused after
recipe-only metadata completion; targeted tests and final typecheck pass.

`final-checks.json` indexes the settled evidence. Static images remain at
88.06 MiB with no runtime bake. This is maker verification; the existing R29
live contested/territorial-transfer evidence gaps and console notes limitation
are unchanged and remain outside R30.

A bounded warm-open follow-up passes the existing two-second target: repeated
opens take 1.64–1.80 seconds at 3440×1440 and 1.40–1.54 seconds at 1920×1080.
The 2.20-second initial warm-check open and the capture run's 2.03/2.04-second
later ultrawide samples remain recorded. No performance code was tuned.


## R33 palette comparison

From this folder, run `npm run dev -- --at-war`. Open
`http://127.0.0.1:5274/?palette=strong` or `/?palette=research`. Research is the default under R38. Strong remains available for comparison. The Map look selector groups each existing look under strong or
research; `Manuscript (research)` selects the new pigments. V still cycles the
map look while keeping the selected palette. Presentation choices send no game
command.

Research uses Union `#1F59A8`, enemy `#C33830`, neutral `#D5A32F` and correction
`#76509B`. Its middle density is 66% of strong's; pooled rim widths are 6, 2.5
and 1.2 screen pixels, compared with strong's 9, 4 and 1.4. Rim pressure,
contested hatch spacing/opacity, broken pencil edges and age factors retain
their existing behavior. Paper, relief, river blue/width and atlas are shared.
The legend, headquarters, claimed fronts, approved arrows and correction ink
follow the chosen palette.

`art-masters/R33/` in the main checkout contains the three paired sheets,
`summary-three-pairs.png`, twelve individual captures and measurements. Each
comparison half is an unscaled 1920×1080 capture under a 64-pixel label row. The
summary stacks all three full-size pairs. The separate ultrawide captures are
3440×1440. All use the same saved real R32 at-war opening and matched cameras.

| Wash | Strong H / S / L | Research H / S / L | Relief contrast, strong / research |
|---|---|---|---|
| Union | 220.9° / 49.3% / 55.1% | 206.7° / 13.4% / 60.6% | 33.9% / 56.2% |
| Enemy | 359.0° / 60.6% / 60.2% | 15.8° / 51.4% / 63.7% | 33.0% / 56.9% |
| Neutral | 44.5° / 85.3% / 65.3% | 41.5° / 62.7% / 67.5% | 32.9% / 56.0% |

These are native sRGB composite measurements, not just endpoint swatches.
Relief contrast is measured against matched no-wash references at source
hachures that remain visible as dark local marks, excluding rail/river
corridors, labels and furniture. The full method, masks and pixel counts are
in `pigment-and-relief-measurements.json`. Research's blue composites to a quiet
slate-blue on the warm paper; the owner still chooses the palette.

Verification: 53 unit/equivalence tests, the desk build, final typecheck, paired
browser matrix, palette switching without commands, default and visible selector
text, and no-wash references pass. Strong's map raster matches the pre-change
reference outside changed toolbar furniture/shadows. The 189 protected inputs
are unchanged, with zero static bakes and the existing 88.06 MiB atlas.

Run `npx playwright test --config playwright.r33.config.ts --grep 'smoke|matrix|reference|final selector'`
for the browser checks. The baseline test is separately opt-in with
`R33_BASELINE=1`; keep its original pre-change evidence. R32's accepted root
checks and unchanged playback/keyboard/skin/plan evidence are reused. No root
simulation campaign or map bake ran for R33. Existing build warnings and the
console send-back notes limitation remain.

## R34 geographic signs

R41 / decision 0095 leaves pictorial geography off by default. The retained
experiment is available only through the exact `?signs=on` URL parameter;
the look selector has no sign option. Geographic drawings in that experiment
sit below the live control washes.
Both `?palette=strong` and `?palette=research` remain available, with research the
default under R38. `public/map-signs/` contains 15 SVG designs,
four seeded variants each, and their recipes. Runtime variants use the feature
id as their seed and the same point strokes as the exported SVGs.

At theatre fit, capitals, elevation-derived mountain signs and large named
wetlands remain. The Eastern opening adds city blocks, towns, named forts and
crossings. The close view adds smaller places and any supplied station points.
Reports, fronts, arrows, papers and names have priority over these signs.
The compass follows true north; the decorated scale uses the measured mileage.
The cartouche reuses R15's wordless General Orders rulework.

`web/map/furniture-data.json` contains 425 pack/rail/elevation display features.
`web/map/woodlands.json` names the Wilderness of Spotsylvania, Great Dismal
Swamp and Okefenokee, with sources, dates and extent certainty. Both files
explicitly belong in the pack later. No modern land-cover map is used.
The forest and marsh clumps are symbols inside approximate placement envelopes,
not surveyed 1861 boundaries. Forts use their pack region anchors rather than
invented footprints. Crossings use actual 1861 rail/river intersections or
one approximate intersection for an on-map graph edge whose note names a
bridge or ferry. Off-map graph chords are excluded. Mountain anchors select
the highest qualifying elevation-contour endpoints in geographic cells; they
are an overview treatment, not surveyed ridge polygons.

Town classes use the pack's urban, capital and key-point hints; Baltimore also
uses its separately transcribed 1860 city count. County aggregates are never
treated as town populations. City blocks are emblematic street plans, not a
new road network. There are **zero station points** in the current rail layer;
the station glyph is supplied but no station location is invented.

Control uses only held and firmly held depths, separated at a fixed internal
800-permille threshold, with the existing ink/pencil, age and contested cues.
Exact shares are absent from DOM attributes and diagnostics. The legend names
both depths. The kernel's data and the console's commands are unchanged.
The R29 fixture and R30 area scripts now resolve paths from their own files;
`MANDATE_MAIN` optionally selects a different main checkout.

Rebuild geography with `python scripts/r34-geography.py`, and the SVG library
with `npx tsx scripts/r34-assets.ts`. They use the existing local geometry tools
and source data. Run `npx vitest run test/r34.test.ts` for focused checks and
`npx playwright test --config playwright.r34.config.ts` for the browser proofs.
For the full unit suite in this worktree, set
`DESK_EVIDENCE_REQUEST=../../ByOrderOfThePresident/art-masters/R34` first, so the
older equivalence tests put their evidence in the current request's folder.

The main checkout's `art-masters/R34/` holds six native 1920×1080 comparison
pairs, twelve individual 3440×1440 captures, the glyph sheet, sourced list,
recipes and logs. The four-case ultrawide pan sample records 265–297 ms median
renderer work on software rendering; it does not qualify a hardware frame-rate
target. It records zero static rebakes and the unchanged 88.06 MiB atlas.
The saved atlas's earlier 16.38-second bake is inherited evidence, not a new
R34 bake. Existing build warnings and earlier console/live-evidence limits
remain as described above.
## R35 geographic sprite layers

The manuscript signs use eight seeded compositions per kind, with shaded roofs,
transparent brown foliage and varied pen strokes after R38. `npm run dev -- --at-war` opens
the research palette; `?palette=strong` selects the comparison palette and
`?signs=on` enables the retained experiment; the default is the straight map.

`python scripts/r35-geography.py` derives the new ridge catalogue from the R28
continuous elevation and the existing R34 features. `npx tsx scripts/r35-assets.ts`
writes the SVG/recipe set and review sheet. `npx tsx scripts/bake-furniture.ts`
now rasterizes the signs into an ignored 6.80 MiB shared texture and builds wide,
theatre and close placement layers. The dev launcher checks this bake. The base
atlas is unchanged; after R40, combined static textures use 94.86 MiB. The old geometry,
Atack rail sources and absence of station points retain their earlier limits.

Placement rejects water footprints and collisions; coastal building emblems may
sit on the landward side of their unchanged source anchor. Fort Delaware's
regional anchor has no safe land footprint, so its geographic sign is omitted.
Bridge and ferry signs intentionally cross water. Mountain chains interleave so
the Blue Ridge, Alleghenies and southern Appalachians all appear at fit zoom.
Runtime draws cached sprites and hides whole signs when reports, arrows or
papers take priority. Names yield without changing a reported position.

Unchanged live control meshes survive small pans inside a guard band. A received
view/day/faction, palette, contrast, zoom, animation or guard-band exit rebuilds
them. This cache never puts beliefs into the static geographic bake. Geographic
graticule intersections are shared between the SVG and diagnostics for an
identical camera. Cold wash rebuilds still cost more than steady panning.

`npx playwright test --config playwright.r35.config.ts` writes evidence only to
the main checkout's `art-masters/R35/`. Its retained real R32 fixtures cover the
two-size/palette matrix, collisions, live front/report priority, mesh cache
invalidation and bounded pan timing. For unit/equivalence evidence, set
`DESK_EVIDENCE_REQUEST=../../ByOrderOfThePresident/art-masters/R35` before
`npm test`, so older helpers do not write to R17. The R35 delivery README records
the final checks, timing reuse and the research-only woodland source note.



## R38 manuscript material

Research is the default palette. `?palette=strong` remains a comparison choice.
The unchanged R36 designs use fine manuscript-brown strokes, translucent brown
roof/crown washes and transparent interiors. Source-map noise modulates the ink
in the offline bake. Capitals retain their ring geometry and rank hierarchy;
non-geographic ornaments retain their prior output.

`npx tsx scripts/r38-assets.ts` refreshes 96 geographic SVGs and recipes, checking
every path/circle coordinate against the prior source. The sign bake packs 288
geographic subtiles into a 1280 by 1152 image with three placement bands. They
share the base world's transform below live claimed washes, then operational
arrows and labels. Texture upload explicitly premultiplies alpha. Retaining
subtiles rather than flattening whole maps preserves R36's date-dependent
capital scale, report avoidance and name suppression without a runtime bake.
Reports, authors, claims and fronts never enter the static bake.

Water names stay at their own anchors instead of using land-label offsets.
Delaware Bay's name uses two lines along the bay at its existing point. Town
names retain priority; anchored water names precede general region captions.
Diagnostics expose water-label sources, bounds and collision classes.
`npx tsx scripts/r38-water-proof.ts` audits delivered water names against their
own source water points or named river lines.

Evidence is in the main checkout's `art-masters/R38/`: native R36/R38 fit and
Virginia comparisons, ultrawide captures, town/capital/hill crops, memory and
timings, and a renderer wash attenuation proof. Selected captures retain R36's
real snapshot and cameras. A separate diagnostic probe removes claims from
copied fixtures, identified in their recipes. `playwright.r38.config.ts` writes
there; set `R38_RUN` to a fresh artifact directory for each correction run.
Use the earlier `DESK_EVIDENCE_REQUEST` setting with R38 for unit evidence.
The evidence README records checks, reused results and retained failures.
This is maker verification.

## R66 audience and org board

Run `npm run dev -- --at-war` from this folder. Open the org board with B or
its desk button. The board now reads the principal's dated post catalogue
from SeatView.posts, including internal offices and opening vacancies. The
opening establishment supplies known parents and holders; received reports
supply subsequent holder evidence. A post whose placement has not been
reported stays in a separate list. Field orders remain tied to the existing
command menu. Opening vacancies have no invented date of becoming vacant.
Open a post to read its received papers or draft an available order.

On a commandable holder's card, Request an audience opens the scene. The desk
recedes behind a plain name-and-post card, 420×560 at 1920×1080 and 540×720 at
3440×1440. No likeness is used. Earlier received reasons are numbered and
linked to their source papers. Reading a source and returning preserves the
unsigned answers. All eight counter forms serialize the existing console
grammar. Signing queues an `audience` command; it does not hold an audience or
advance a day. The kernel checks the request when the days run. Escape returns
one level and the final close returns focus to the desk button. Enlarged text
reflows and scrolls vertically; reduced motion removes the transition.

**Acceptance gaps remain.** The seat API has no current audience case, allowed
counter menu, eligible framing values, declared reply per counter or filed
audience transcript. Earlier advice is explicitly labelled as earlier advice,
and the desk predicts no response. R70 supplies public standing and received
consults, advice about the man and observer letters through SeatView.people
and the catalogue's source references. Missing records remain explicit.
Observer letters do not imply an observer is still attached, and received
consults retain their letter's subject rather than borrowing the private
stance table's subject. No assessment band is inferred from hidden ability.

R70 remains incomplete on the live audience projection. StatedReason stores
only reason kind and weight; AudienceRecord stores only day, before/during
and counter kinds, without principal attribution or a transcript. The
preview computes framing values and replies from hidden person inputs.
A seat-owned declaration source or a ruling permitting newly spoken
read-only declarations is needed before the audience requirement can pass.
The implementation adds no State and exposes none of those private inputs.
See notes/lane-seat-view-people.md at the repository root for proposed
choices, validation and remaining gates; runs/r70/final-checks.json indexes
the evidence.

`web/people.ts` and `web/People.tsx` take `SeatRequest` and display strings only.
The server adapter and HTTP boundary are unchanged. New player text is in
`web/strings.ts`. The full desk suite passed 87 tests before the final targeted
corrections. Twelve focused tests then passed, including the fifth R66 test
that parses all generated counters through the actual console grammar. The
final typecheck/build passes. Eight distinct browser checks passed across the
retained runs; unaffected board captures and suite evidence were reused after
the final portrait proportion correction.

Evidence, eight native captures with recipes, failures, scope audit and the
437-file browser-build inventory are in `../../art-masters/R66/`.
`final-checks.json` indexes the results. Regenerate browser fixtures with
`npx tsx scripts/r66-fixture.ts`; run the browser checks with
`npx playwright test --config playwright.r66.config.ts`. The R66 proof server
uses the required loopback port 5274 and existing saved map data, without a
map rebuild. `R66_RUN` selects a fresh evidence subfolder. Leave
`R66_REUSE_1920` unset when regenerating all captures.

Root typecheck, pack boundary, licences and decision-index checks passed.
The inherited full root check was not run: this main checkout still has LFS
fixtures that write Git, even with `MANDATE_NO_GIT=1`. The standalone done-check
was not run because its CLI writes only under `runs/`, outside R66's scope.
Those gates remain unverified. Claude's independent standing review is pending.


### R39 geographic legibility

The baked signs retain R38's placement and composition below live claimed washes. Stronger brown strokes and roof/crown tone have bounded ink load (.62 wide/theatre, .65 close); capital outlines stay stronger than town outlines. Wide hill flanks use spaced original relief hachures within unchanged footprints. Research stays default.

Main `art-masters/R39/README.md` indexes the native R36/R38/R39 comparison sheets, source/placement proofs, per-band and palette contrast measurements, texture inventory and software-rendering timings. The controlled current-ink target is sign contrast >= rails and < report/front/name references under the same wash; all 3,456 samples pass. Age fading and operational conflict priority remain unchanged.

Verification: `npm test`, `npm run build`, `npx playwright test --config playwright.r39.config.ts` (outputs under main R39). `npx tsx scripts/r39-contrast.ts` runs the offline controlled proof; `R39_PROOF_BAND=close` limits it to the affected band. The retained delivery reuses passing wide/theatre proof conditions and signs-off captures. No git-using root suite was run.

### R40 drawing definition

R40 refines the drawings inside the original placement envelopes. Houses and
tree crowns have separate outlines, pale roof/crown tone and thinner brown pen
lines. The legacy paths still own placement bounds; changing the drawing does
not move a town or its name. Capitals retain their rings and rank scale. Hill
flanks retain R39's original relief-source segments.

The offline bake rasterizes at 4× and downsamples to 2× subtiles. Alpha trimming
and height-sorted packing produce a 1024 by 1741 atlas, including two transparent
texels around each frame. Texture `orig`/`trim` and density compensation preserve
the same world geometry. Premultiplied upload uses nearest minification, linear
magnification and one mip. This avoids a second smoothing of narrow pen cores;
no runtime bake or per-pan geographic path construction is added. R39's .62/.65
peak ink loads, grain, washes, palettes and operational priority remain.

`npx tsx scripts/r40-assets.ts` updates the 96 geographic SVGs and recipes.
`npx tsx scripts/bake-furniture.ts` builds the atlas. The dev launcher checks it.
`npx tsx scripts/r40-contrast.ts` runs the unchanged R39 contrast references with
the shipped sampler, writing only to main `art-masters/R40/`. All 36 conditions
and 3,456 sign samples meet the rail lower bound and report/front/name upper
bound. `npx playwright test --config playwright.r40.config.ts` checks the native
views, placements, sampler, operational priority and matched pan timings.
Set `DESK_EVIDENCE_REQUEST=../../ByOrderOfThePresident/art-masters/R40` before
`npm test` to direct equivalence evidence there.

Main `art-masters/R40/README.md` indexes the R39/R40 comparisons, four native
close crops and their 2× pixel-inspection enlargements, diagnosis, contrast proof,
texture memory and software-renderer timings. Source geography, cameras, zoom
bands and research default are unchanged. Maker verification remains separate
from the lead's aesthetic acceptance.

### R41 straight map

The default Union map shows places by their names, with no pictorial towns,
capitals, forts, crossings, hills, woods or marshes. The existing place catalogue
supplies name-only zoom hints at the original geometry points. Nearby text
positions clear rivers and operational marks; a compact search handles river
confluences before the older wide label offsets. Report signs, fronts and arrows
retain priority. Research remains the default palette, and the compass and
measured scale remain on their margin card. Water anchors and baked static base
layers are unchanged.

The browser skips the sign manifest, image decoding and texture allocation while
signs are off. SVGs, recipes, bake code and the ignored atlas remain available for
`?signs=on`. Neither changing the map look nor an unrecognized `signs` value
enables the experiment. The developer launcher still verifies the saved sign
bake so the explicit opt-in works; it does not load that texture in the page.

From this folder, run `npm run dev -- --at-war` and open
`http://127.0.0.1:5274/`. `npx playwright test --config playwright.r41.config.ts`
checks the default, exact opt-in, selector, names, six requested captures,
operational priority and pan timings. For unit/equivalence evidence in the
authorized main folder, set
`DESK_EVIDENCE_REQUEST=../../ByOrderOfThePresident/art-masters/R41` before
`npm test`; `npm run build` typechecks and packages the browser.

Main `art-masters/R41/README.md` indexes the selected opening, fit and Virginia
captures at 1920×1080 and 3440×1440, name-anchor audit, texture measurements,
timings, package inventory, retained failures and reused evidence. The default
static allocation is 88.06 MiB, with zero sign texture bytes. Rendering timings
use ANGLE SwiftShader and do not establish hardware frame rates.

### Press stories and the week's papers

Front pages render the claims received in the seat view, using pack strings for
headlines and copy. The weekly paper lists each press story with its editor and
date and opens the received source. Battle dispatches carrying the same battle
ID appear as one line, linking the latest dispatch. Earlier fixtures without an
ID can only group reports from the same place and day.

From the repository root, `npm run typecheck:desk` checks the complete browser
and server types. CI installs this folder's dependencies and runs that command
on both platforms. It stays outside the staged hook because that hook's private
snapshot supplies only the root dependency tree.

From this folder, `npx vitest run test/intray.test.ts test/press.test.ts` checks
the stories and grouping. `npx playwright test --config playwright.r54.config.ts`
checks source opening and return at 1920×1080 and 3440×1440, using the real reading
components with a small fictional snapshot. It needs no ignored map data and
writes its captures and results to the worktree's `runs/r54/browser/`.

### S8 remaining desk views

Run `npm run dev -- --port 5288 --saved-map --at-war` from this folder after
installing both dependency trees. `--saved-map` requires the existing ignored
atlas and compact geometry; it does not rebuild geography. `DESK_ART_ROOT` may
point to an existing art directory, read only. The server still binds to
127.0.0.1, checks the selected port's Host and Origin, and serves only its art
allowlist. Leave 5274 for other runs.

For this worktree, set `DESK_ART_ROOT` to
`C:/Pyrrhic/ByOrderOfThePresident/art`. The saved map files were copied without
editing from that checkout's ignored `prototypes/desk/public/map-data/`.

S8 adds a stop slip with related final-day papers, pausable playback, the
attention price table and an accountability spread. Submitted slips remain in
the shell's history after dispatch. Rejections retain their occurrence index;
a dispatch never implies compliance. Received decisions and numeric returns
keep their source papers. The board can search known posts and vacancies.
The audience can display a filed answer received through ordinary report
transport, separately from its earlier reasons and unsigned counters.
Plan review also accepts the existing wait-note grammar. Wait notes are sent
only as requests for a redraft. Unaffordable acts stay visible with a refill
explanation; free inquiries remain available. Returning from a ledger source
preserves its leaf and restores focus to the source control. During playback,
global panel shortcuts wait for the next morning, and the menu and docket use
the held snapshot rather than the completed turn's final morning.

Proposed rulings: keep missing seat projections explicit rather than reading
State or pack effects. Reject inferred Congressional ratification, a refill
date guessed from weekdays, and an audience preview from hidden traits. Keep
the shell's own submitted slips in its existing turn history; reject a new
simulation ledger or a claim that dispatch proves execution.

Evidence and native captures are in
`C:/Pyrrhic/ByOrderOfThePresident/art-masters/S8/`. Generate actual seat fixtures
with `npx tsx scripts/s8-fixtures.ts`; then run
`npx playwright test --config playwright.s8.config.ts`. The preflight checks
startup, art, port isolation, forbidden server-source access and core selectors
before the native capture tests. The dev server is owned and closed by
Playwright. The S8 test uses the actual adapter and console grammar.

Maker checks: the complete desk suite passed 101 tests with three existing
skips, and its typecheck/build passed. Thirteen distinct browser checks passed
across the retained runs, including both native sizes, 200% high contrast,
1280×800 plan reflow, source return, exhaustion, wait notes and pausable
playback. `final-captures.log` retains the nine-test capture pass;
`playback-boundary-verified.log` retains the final keyboard correction. Earlier
unaffected evidence is reused. The two unchanged ultrawide board/audience
captures were reused; all 29 PNGs have matching dimensions, recipes and hashes.
`final-inventory.json` records 430 build files (471,638,003 bytes) and the source
scope audit. The build resolves art through the local server and is not a
standalone shipping package. `runtime-final.json` records port 5288 closed.

The exact root `MANDATE_NO_GIT=1 npm run check` initially exited 1 when the
existing done-check setup exceeded 300 seconds: 136 files passed, 1,516 tests
passed, one expected failure and 17 skips. Its isolated correction verification
passed 14 tests with one skip in 170.88 seconds; no timeout or simulation code
changed. Boundary, licences and decision-index checks passed separately. The
staged-tree commit gate is recorded in `hook.log`.

One required default eight-seed done check, with drafting, exited 1 in
2,038.59 seconds: Phase 0 5/6 and 1A 2/6. Phase 0 fails only timing; Union
reference/history median–p95 were 55.13/97.37 and 45.94/74.83 ms against the
unchanged 40/160 limits. The 1A checkpoint, operation, pushback and sweep gaps
remain. All 12 reported problems are retained in `done-check.log`; no D6
clearance or criterion waiver. Replay, daily hashes and save/resume pass.
This shared-host run overlapped the small UI correction checks early on;
it establishes neither unloaded-host nor CI performance. The simulation and
pack inputs are unchanged. The full check was not repeated for reassurance.
The raw run artifacts are preserved under `done-artifacts/`.

These are maker results. Claude's independent review remains deferred under
0106; nothing is signed or cleared for main.

Findings outside my scope: the seat API still lacks the Congress ledger,
attention allowance/refill date, configurable stops, and a current audience
case with legal counter values and declared replies. Filed audience answers
are available and rendered; they do not supply the missing prospective case.
The seat also supplies no authored live-clock ranges or live/non-live marker
for the unanswered-situation confirmation. Those require their owning views;
the prototype does not reconstruct them from private pack effects.

### S19 seat projections and desk controls

The desk now reads the seat's public Congress records, own attention allowance,
spending and next refill, audience correspondence and the console driver's
current turn stops. Open **Account to Congress** in the ledger, **Attention**
on the desk, the stop checkboxes in **Let the days run**, or the correspondence
at the top of the org board. Sources return to their source control. A visitor
from an earlier record never opens a replacement holder's person page.

Stop preferences remain in the running console process across page refreshes.
They change when a turn returns to the desk; they add no simulation State or
command. A new process starts with all existing stops enabled. Unselected
decision points and their papers remain in the daybook.

Run this checkout on its own port:

```powershell
$env:DESK_ART_ROOT='C:/Pyrrhic/ByOrderOfThePresident/art'
npm run dev -- --port 5291 --saved-map --at-war
```

Close that process after use. S19's verification server was closed. From this
folder, generate the evidence fixtures with
`npx tsx scripts/s19-fixtures.ts`, then run
`npx playwright test --config playwright.s19.config.ts`. Its preflight runs
before captures; results and recipes go only to the main checkout's ignored
`art-masters/S19/`. `scripts/s19-audit.ts` verifies image/source hashes, scope,
the build inventory and the ignored map inputs against S8's retained inventory.

Published dated chamber membership is supported, but the existing pack supplies
no counts. Production authors also supply no explicit audience requests or
prospective declared counter replies yet. The request-source fixture is marked
fictional; the granted invitation and Union ledger scenes use real kernel
commands. A prior answer never becomes a preview of the visitor's next reply.
Detailed evidence, proposed rulings and retained baseline failures are in
[the S19 hand-over](../../notes/sprint-S19-desk.md). Standing review remains
deferred under 0106.

### S29 integrated history playtest

The turn sheet accepts a shorter maximum within the pack's turn length and
offers due identified governor calls with their complete published terms.
Signing queues the requisition; an issued marker establishes dispatch. The
docket keeps signed decisions visibly pending until recalled or dispatched.
Command-line equivalents are `end [days]` and
`call <governor-post> scheduled=<id>`.

S29 uses only this prototype's **headless Playwright harness**, on port 5293.
It starts at peace, owns its server and closes it afterward. It never uses
Computer Use, desktop control or a real browser. Captures stay under
`C:/Pyrrhic/ByOrderOfThePresident/art-masters/S29/`, with recipes and public
snapshots. From this folder, use a new evidence subfolder for a fresh run:

```powershell
$env:S29_OUTPUT='C:/Pyrrhic/ByOrderOfThePresident/art-masters/S29/new-history'
$env:S29_RUN='new-history'
$env:S29_FOCUSED_PLAN='1'
Remove-Item Env:S29_RESUME -ErrorAction SilentlyContinue
Remove-Item Env:S29_CHECK_CONTROLS -ErrorAction SilentlyContinue
node --import tsx scripts/s29-prepare.ts
npx playwright test --config playwright.s29.config.ts
```

Do not overwrite retained attempts. Preparation extracts the pack's historical
choice reference, never State. All playthrough writes use UI controls.
`S29_RESUME=1` requires a retained prefix/manifest: it replays UI commands and
compares the exact public morning, history and queue instead of loading State.
`S29_FOCUSED_PLAN=1` sends notes before the edit and uses direct review replies
after a received relay objection. Both strategies require actual received
Manassas evidence, rather than fabricating a battle to pass.

`scripts/s29-audit.ts` checks primary captures, build and preserved integrated
and map inputs. Retained production suite: 115 passed, three skips; build
passes with its existing chunk warning. The final human trajectory reaches
31 July with all five calls issued, edit, received note account and filed
audience, but its Manassas battle assertion **fails**. The default done check
also stays red: timing, pushback and lever-sweep measurement/coverage. No
threshold changed. Read [the report](../../docs/playtests/2026-11-21-desk-history-run.md)
and [handover](../../notes/sprint-S29-desk.md) before treating results as
acceptance. The automatic history's battle is not proof of the human scene.
