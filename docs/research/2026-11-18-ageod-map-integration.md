# Research: how AGEOD integrates pictorial geography into its maps

Date: 2026-11-18. Status: research note (not canon).

**Purpose.** R37 asks how AGEOD made pictorial geography belong to a map, and which techniques can serve *By Order of the President*. This note covers American Civil War (2007), Civil War II (2013), and documented methods shared by other AGE-engine games. It recommends renderer techniques, not AGEOD's appearance. No implementation is included. R36's worktree and the desk were neither inspected nor changed.

**Conventions.**

- Citation keys are clickable references to URLs. Every external source was read or inspected on **2026-11-18**; the Sources list repeats that date. Publication and archive dates describe the evidence, not its access date.
- **[I]** marks interpretation, design advice or an estimate. **[S]** marks a search excerpt whose full source could not be read. No factual claim relies on unmarked general knowledge.
- **Visual observation** means inspection of the named image, not verification of its engine implementation. Colours are described qualitatively, not as measured pigment values. A screenshot does not establish a blend equation, asset file boundary or zoom transition.
- **Not established** means the collected evidence leaves a question open. Different AGE-engine generations must not be treated as interchangeable.
- Reception is attributed to the sampled writer or modder. It is not a survey, a consensus or a benchmark.

## 1. The answer and its limits

**AGEOD combined an authored geographic surface with separately placed structures and operational pieces.** Its own developer distinguishes ACW1's hand-drawn map from CW2's changed approach: reproducing that technique at CW2's larger extent was impractical, and the new terrain colours were intended to communicate regional terrain more clearly. The premise that both games used exactly the same painted-map method is therefore too broad. [DEV]

The engine documentation explicitly describes AACW's cityscapes as assemblies of sprites. Its older games use named structure images; later modes select and combine structures from data. Thus a town can look compatible with the country without being baked into the geographic painting. [CITY]

**[I] The transferable result is a common graphic material, geographic attachment and controlled hierarchy.** Baking alone does not make a symbol belong: a bright opaque roof, circular base or heavy outline can still resemble a sticker after baking. Conversely, an independently drawn element can belong if its colour, texture, edges and ground contact match the surrounding map. The inspected ACW and CW2 images show both integrated terrain marks and conspicuously separate structures/counters. [ACW-S1] [ACW-S2] [CW2-S1] [CW2-S2]

Recommend first making procedural signs part of the **static geographic underdrawing, below live claimed-control washes**, while sharing the manuscript's ink and paper. Then join vegetation into fields and relief into ridge bands. Keep geographic names and received operational evidence readable above that surface. This is an independent proposal under the existing decisions, not a claim about AGEOD's hidden compositor. [I] [D0013] [D0093] [D0094]

## 2. Production, resolution and region data

### 2.1 American Civil War, 2007

A contemporary reproduction of AGEOD's feature series describes more than **1,500 regions**, hand-drawn in normal and winter forms, a **120-million-pixel surface**, and dynamic caching. This is a developer production claim reproduced by TOCWOC, not an independently measured installation. It does not provide width × height or say unambiguously how that pixel total accounts for the two seasonal sets. Do not turn it into invented raster dimensions. [ACW-FEATURES]

The later official diary corroborates the use of an artist's hand-drawn technique in ACW1. Neither source gives the artist's complete working file, brush settings or assembly history; no individual artist attribution is asserted here. [DEV] [ACW-FEATURES]

### 2.2 Civil War II, 2013

The developer describes a substantially expanded map and a change from ACW1's technique, with clearer terrain colour categories. That establishes a deliberate production/style change, **not** a fully documented procedural terrain generator. [DEV]

The publisher lists more than **3,000 regions**. Exact native raster width × height, working resolution and original texture-library dimensions were **not established**. The two downloaded gallery images are 1920×1080 screenshots, not map masters. [CW2-STORE] [CW2-S1] [CW2-S2]

Emx77's downloadable **4864×3833** strategic map is a community overview with military/economic information and alternative overlays. It is not evidence that the game paints its native geography at those dimensions. This distinction matters because searches for map resolution readily return that overview. [OVERVIEW]

### 2.3 How geography and rules are separated

AGEWiki separates region definitions, terrain rules, structures and graphics. ExMap edits region definitions; terrain files specify movement/combat/weather effects and connection types. The visual image is therefore not the sole source of gameplay geography. [FILES]

Northern Neighbour's public ExMap notes require a whole-map `Map.bmp` and show region records containing `TerrainType`, sprite coordinates, polygon vertices, triangles, adjacency and transport links. **Interpretation:** this supports an authored raster registered to explicit region geometry and metadata; it does not establish runtime terrain lookup from an RGB colour mask. The notes are a modder's account in Russian, read in the web reader after the scraper failed. [EXMAP-NOTES]

A 2019 archived AGEOD discussion independently shows a modder needing the original `map.bmp` for RUS. That capture contains only the early exchange; it cannot support later instructions or later tool availability. [EXMAP-ARCHIVE]

**Slicing/tiling:** an original ExMap tutorial search excerpt describes cutting regions from a bitmap. Its live page timed out and the attempted archive URL had no capture. The likely workflow is region extraction from registered artwork, but the cutting procedure remains **[S]**, not a verified technical specification. A universal square tile size, tile padding, seam handling, texture packing and GPU residency policy were **not established**. Do not substitute a familiar hex-tile or web-map pipeline for evidence. [S] [EXMAP-CUT-S]

The CW2 manual names region pre-caching and texture initialization as scrolling options. That supports cached graphics, not a particular atlas or streaming algorithm. [MANUAL]

### 2.4 What is shared across other AGE-engine games

The common game-file guide names BOA, AACW, NCP, WIA, ROP and VGN. That supports shared organisation of graphics and geographic/rule data, not identical artwork or every later version's internals. [FILES]

The cityscape guide distinguishes four modes: named structure images for BOA/WIA/ROP; modular sprites for AACW; a generalised simpler modular mode for NCP and prospective games; and an economic mode for VGN. It selects structure appearance using regional style, city size and fortification. Its future-facing wording must not be read as proof of CW2's shipped configuration. [CITY]

An engine note also maps cityscape, harbour, enemy-force and other indicators to separate ExMap coordinates, with compatibility handling for older games. This provides concrete evidence of geography, structures and indicators being registered together while remaining separate objects. [INDICATORS]

**Visual observation:** Rise of Prussia Gold's sampled gallery view retains terrain fields containing small repeated tree marks, blue waterways, town names and separate portrait counters. The active map filter is not identified, so its green polygons are not labelled military control here. It demonstrates the broad terrain/structure/counter hierarchy, not an identical production recipe. [ROP-S]

## 3. Layers: what the sources establish

The following is a **partial order reconstructed from documentation and visible occlusion**, not engine source code. [FILES] [CITY] [INDICATORS] [ACW-S2] [CW2-S1]

| Content | Evidence about its relationship to other content | Confidence and limit |
|---|---|---|
| Ground, broad forest/relief depiction and waterways | Form the continuous geographic surface in both games. Rivers interrupt land texture and remain strong boundaries. [ACW-S1] [CW2-S1] | Visual observation; cannot tell whether a particular tree is a bitmap stamp, a baked brush or a runtime sprite. |
| Regional divisions, roads and rail | Lines cross or divide the scenic ground; CW2 rail is darker and finer than its broad rivers. [ACW-S1] [CW2-S1] | Visible hierarchy; not proof of separate draw calls. |
| Political and other thematic colour | CW2 has distinct control, loyalty, state, department, weather and terrain filters. [MANUAL] | Documented modes; their precise colour math and order relative to every sprite are unknown. |
| Towns, forts, ports and their attachments | Structure sprites have their own positions; the guide describes modular assembly. [CITY] [INDICATORS] | Documented separation. It does not follow that a town is painted into a base bitmap. |
| Geographic labels and structure nameplates | ACW labels sit beside structures; CW2 uses conspicuous light or blue nameplates, while river names follow waterways. [ACW-S2] [CW2-S1] | Visual observation. No universal border/label draw order established. |
| Unit stacks, paths and operational indicators | Portrait cards cover geography in the gallery views; CW2's manual describes selectable stacks and structures. [CW2-S1] [CW2-S2] [MANUAL] | Visible occlusion plus documented interaction. |

**Political colour:** distinguish coloured ground from a control filter. CW2's normal terrain palette already has strong greens and ochres; not every coloured region denotes ownership. A static gallery image cannot prove that political paint tints trees, roofs and their shadows equally. The collected material does **not** establish Multiply, Overlay, a common tint shader, exact alpha values or a physically modelled light source. These must remain hypotheses rather than attributed AGEOD techniques. [CW2-S1] [MANUAL]

**[I] For our renderer,** use the following proposed order, keeping geography independent of claims:

1. Paper and quiet ground treatment.
2. Baked geographic underdrawing: relief plus terrain/vegetation marks and town/fort drawings, clipped to their geographic footprint. Resolve their overlaps at bake time; keep necessary water/transport strokes readable within this composite.
3. Live claimed-control fields, with the accepted research palette, pooled rims, two qualitative depths, contested hatching, pencil and age cues.
4. Geographic labels and any restrained water/transport accents needed for reading.
5. Received report signs, claimed fronts, plans, selection/focus and the president's pencil, with their existing priority rules.

This is a proposed compositing order, not permission to rebake the world when a claim changes, remove the signs required by R36, or change the view's evidence semantics. [I] [D0013] [D0094] [R35-R36]

## 4. Why the environmental marks belong, and where they do not

### 4.1 Colour, outlines, fills and shadows

**Visual observation, ACW1:** terrain has a warm, mottled ground; small tree groups and settlement marks repeat its brown/olive range. Fine internal details leave ground visible between them. Coast shading binds edges to water. But large structures visibly have platforms and nameplates: AGEOD did not eliminate the board-piece appearance everywhere. [ACW-S1] [ACW-S2]

**Visual observation, CW2:** green tree clumps share the surrounding green/ochre terrain; the relief has bright flanks and dark valleys rather than a row of isolated black mountain triangles. There are nevertheless obvious repeated tree arrangements and local shadows. Cities have bounded bases; portraits, flags and plates remain high-contrast overlays. Shared palette and lighting improve continuity without making every object indistinguishable from the ground. [CW2-S1] [CW2-S2]

**[I] Adapt the relationship, not the rendering style.** In our manuscript, local brown hatching can supply a shaded flank; it need not become CW2's modelled relief. Ground beneath a roof or tree should remain the same paper/wash as the surrounding region. Remove opaque paper-coloured interiors, badges and floating drop shadows from geographic drawings. An ink stroke can remain dark enough to read without outlining every object like an interface button. [D0093] [D0094]

### 4.2 Scale, density and repetition

**Visual observation:** in the inspected CW2 Ohio/West Virginia view, individual trees are much smaller than cities and numerous enough to describe areas. Clearings and changes in density connect them to terrain. The eye groups them as wooded country before reading an individual tree. The ROP image likewise repeats small tree forms inside broad terrain fields. Neither image proves the storage/runtime mechanism for forests. [CW2-S1] [ROP-S]

**[I] For this game,** evaluate the **combined dark coverage and footprint** of a wooded area, not just the attractive silhouette of one clump. Use seeded overlapping crowns, stipple and small trunks inside a sourced footprint, with irregular edges and open corridors along mapped water and transport. A field need not be uniform, and county boundaries must not automatically become visible forest edges. Repeated decorative clumps far apart can still look like an icon layer, however many variants exist. [CW2-S1] [D0013]

This note provides no new historical vegetation dataset. R35's source research is not a county woodland census ready for rendering. Unimproved farm acreage is not a forest percentage; unsupported woodland must remain absent rather than being filled from modern land cover or visual convenience. [R35-R36]

### 4.3 Ground contact and relief

**[I] Ground contact** means a town's lowest ink strokes share its mapped point and surrounding line language; it does not require a new road, plaza or earthwork invented to make the drawing attractive. Place its name beside that group. Use only existing river/rail/road facts to join it to the country. Keep R36's anchoring, water avoidance and capital hierarchy as separate requirements. [D0013] [R35-R36]

**[I] Relief should be one geographic construction.** Generate silhouettes along the actual ridges and make hachures run down their flanks, tapering into the existing relief. Avoid drawing a heavy triangle sprite and then unrelated hachures behind it. Use one ink range and one shading convention across a range; a ridge should survive downsampling as a band, not as a necklace of badges. This derives a manuscript technique from the terrain continuity visible in CW2, without imitating its shaded landscape. [CW2-S1] [D0093]

## 5. Zoom and reception

CW2 documents wheel/key zoom and a wheel-button swap between highest and lowest scale. The gallery gives different extents of the same illustrated country; it does not verify every zoom level or a change of base artwork. [MANUAL] [CW2-S1] [CW2-S2]

The general cityscape guide provides a configurable suppression threshold, illustrated at 30%, and changes font size/offsets with zoom. These are examples for its described mode, **not measured ACW1/CW2 defaults**. Painted base detail and optional structure display can therefore behave differently as scale changes. [CITY]

**[I] Retain our three working scales**, with geography simplified rather than enlarged indefinitely. At fit, show fine continuous ridge bands and broad sourced woodland texture; retain the national-capital/largest-city hierarchy R36 requests. At theatre scale, resolve town groups and forest edges. Close views can reveal finer hatching and individual crowns already supported by data. Select stable subsets from one seeded field so wheel zoom does not reshuffle the woods. Use modest hysteresis and crossfades that do not darken overlapping LODs. [D0013] [R35-R36]

Reception supplies reasons to preserve a clear operational layer:

- Larry Levandowski's **2007 Armchair General review** praised the period interface and expensive-board-game impression of the map/counters, while noting organisational complexity. This is praise for an illustrated board as well as its map, not evidence that all overlays disappeared into terrain. [REVIEW-ACW]
- The **2013 Armchair General late-beta preview** said text/image clarity still needed work. It is evidence about that preview build, not a current release verdict. [REVIEW-CW2]
- **Blue1's Steam review, posted 26 February 2015 and updated 11 December 2016**, complained that stacks between Washington and Richmond obscured terrain/objectives and preferred the first game's softer map colours. This is one player's experience, not a comparative measurement or consensus. [PLAYER]
- **nadia911, 22 December 2025**, described a personal CW2 mod that reduced green/brown intensity and contrast, improved terrain definition, fixed moving city flags and removed mini-flags/animals. The author reports the intended changes; the mod was not installed or benchmarked here. Mellman's thread also reports improved scrolling after texture preloading, without controlled timings. [MODDER]

**[I] Consequence:** scenic continuity must not bury report signs, fronts, names or arrows. AGEOD's examples are evidence for both the appeal of rich ground and the costs of saturation and crowded operational furniture. Our geographic ink should remain quieter than claimed control and operational evidence. [REVIEW-ACW] [PLAYER] [MODDER] [D0094]

## 6. Two comparisons that add something

**Lindenkohl's 1864 Military map of south-eastern Virginia.** LOC identifies houses, vegetation, roads, waterways and fortifications at 1:200,000. **Visual observation:** many tiny buildings and fine terrain marks occupy the same continuous sheet as roads, hydrography and labels; the paper remains visible between strokes. **[I] Lesson:** continuity can come from shared small marks and negative space, without scenic ground shading. This is a lithographed military-map comparison, not evidence of AGEOD's source art or an 1861 vegetation boundary. The LOC record permits reuse absent a contrary rights advisory; no map asset is produced here. [LOC]

**Civilization VI's 2D strategic view.** Artist Sam Gauss describes separate fog states and variations for tiling terrain sprites, implemented with a graphics engineer. **[I] Lesson:** design transitions and state variants as a system, rather than merely adding more standalone symbols. For us that means procedural edge treatments and stable scale variants, with uncertainty still governed by claims. His artwork is study material only and is not a reference for generating our signs. [CIV6]

## 7. Ranked techniques for our procedural renderer

Everything below is **[I]**. Costs are relative engineering estimates, not elapsed timings, authorisation for a campaign or changes to settled decisions. The renderer references are conceptual because R37 did not inspect the desk or R36's files. R35's delivery status is the source for the existing baked-sign arrangement and reported memory use. [R35-R36]

Keep the accepted pigment endpoints: Union `#1F59A8`, enemy `#C33830`, neutral `#D5A32F`, corrections `#76509B`. Terrain ink and quiet fills remain subordinate to those meanings. [D0094]

| Rank | Technique and intended change | Renderer change | Cost and limit |
|---|---|---|---|
| 1 | **Put geographic signs under the claimed washes.** Give roofs, trees and hills the same regional paint as nearby ground. | Composite procedural sign ink/quiet fills into existing per-band geographic bake targets before live control. Keep the source placement catalogue for labels, inspection and diagnostics. Never put a report, author, front or changing occupancy into this bake. | Medium integration; rebake affected static outputs once. Aim to replace work, not add a fullscreen pass. No claimed performance gain until measured. Retain the existing data anchors and water checks. [D0013] [D0094] |
| 2 | **Use common ink and transparent interiors.** Eliminate paper-white holes, dark button outlines and circular backing plates. | Draw all geographic strokes from the era skin's brown ink and relief weights. An unpainted roof is transparent; a roof wash is translucent and quiet. Apply the same map-space grain modulation to existing relief and sign ink. | Low to medium recipe/bake work; negligible new persistent memory if folded into existing targets. Do not make a white fringe by filtering non-premultiplied transparent pixels. Confirm sampling at native output sizes. [D0093] |
| 3 | **Choose compositing deliberately.** Preserve paper and operational colour without mud. | Trial normal premultiplied-alpha ink first. If opaque light fills are necessary, evaluate a local Multiply-style composite **at bake time**; do not put dynamic control into that bake. A retained live sprite fallback must pass through the same wash/tint stage rather than being drawn above it. | Low for bake trials; medium if a live material needs changing. Multiply is our proposed experiment, not a documented AGEOD blend mode. It only darkens and can close fine detail; never multiply an already paper-tinted sprite a second time. [D0093] [D0094] |
| 4 | **Attach towns to geography, with labels beside them.** Remove the impression of a loose object hovering nearby. | Use the actual mapped anchor and a local drawing origin at its ground contact. Coordinate footprint, allowed water adjustment and name reservation before baking. Use existing transport/hydrography only; keep geographical buildings distinct from reported occupation. | Low to medium; reuse R36's placement evidence and hierarchy. No new campaign, invented approach roads or additional capital rings. [D0013] [R35-R36] |
| 5 | **Join hills to the relief.** Make a range one construction. | Generate ridge silhouettes and flank hatching together from the existing elevation/ridge data, with the same ink and taper. Clip before water, reserve settlements, and render to the static band. | Medium; geometry/bake work rather than per-frame paths. Needs fit/theatre/close native-size judgement. Keep R36's fine-brown-mountain work; do not replace it based on a research note alone. [D0093] [R35-R36] |
| 6 | **Treat woods as a field.** Make density and edges describe ground, not a row of clump icons. | Populate sourced woodland footprints deterministically; overlap small procedural crowns, vary local density and dissolve edges. At fit use low-frequency ink texture; at closer bands reveal a stable subset of crowns. | Medium to high once data exists; historical coverage is the main dependency. Do not implement county densities from unimproved acreage alone. Avoid allocating one texture for every tree or every county. [D0013] [R35-R36] |
| 7 | **Make simplification consistent across scale.** Prevent large dark blobs and popping patterns. | Use one seeded geographic construction with band-specific stroke/detail budgets. Keep minority details out of fit instead of drawing every close symbol at a minimum screen size. Labels and operational signs retain their higher-priority allocation. | Medium visual tuning and small band metadata; no necessary extra full-map textures. Use the existing three-band scheme rather than an unbounded new zoom pyramid. [D0013] [R35-R36] |

### 7.1 Bake and memory implications

R35 reports a 7.5 MiB sign atlas, **95.56 MiB** combined static textures against **96 MiB**, and a roughly 0.1–0.2 ms geographic sprite pass in its software-rendering sample. These are retained maker figures, not new R37 measurements or R36 results. There is little reason to promise a large frame saving merely by removing that pass; the first purpose is visual integration. [R35-R36]

**[I] Reuse or repack existing geographic targets before allocating another complete layer.** One extra 3440×1440 RGBA8 image is **18.90 MiB**, calculated as width × height × four bytes, before mipmaps or driver overhead. Three such targets would be 56.69 MiB. These are illustrative screen-sized allocations, not the dimensions or format of the current map atlas. A seemingly small compositor change can exceed the reported allowance if it retains old and new targets together.

**[I] Keep a recoverable composition.** Baked geography should not be erased because a new report overlaps it. Put operational marks above it with a restrained local backing/priority treatment where needed, and resolve geographic label conflicts independently. Changing a claim should update only its live wash/front; it should neither recolour static source data nor move a geographical place. A change of pack, era style, geometry or geographic recipe can invalidate the bake. [D0013] [D0094]

### 7.2 Smallest useful later trial

**[I] Recommend one bounded visual trial of ranks 1–3 first**, after R36 is settled. Use its final Virginia and fit scenes at 1920×1080 and 3440×1440; keep cameras, data, signs and research palette identical. Change only compositing/material treatment. This isolates the owner's objection without quietly reopening placement or inventing vegetation.

Before any later package build/capture campaign, cheaply verify the chosen route opens, its scene is real, selectors exist, research is selected, and the bake does not allocate beyond its allowance. Then compare native captures and the existing performance probe. Pass criteria: no opaque light fill islands; signs and nearby ground respond consistently to the same wash; capitals/names still meet R36; rivers, fronts, reports and plans remain readable; no new per-pan path construction or runtime bake; the existing memory allowance and required behaviour checks still pass. Stop at the first unexpected failure, retain evidence and diagnose it before another run. No such implementation or campaign is run or authorised by R37 itself. [I] [R35-R36] [D0094]

## 8. Provenance, missing evidence and disposition

Collection used Firecrawl search/scrape, the web reader as a fallback, and direct downloads of the cited study files. External text was treated as data. **No external prose is quoted.** The manual was first retrieved through a PDF scraper, whose image transcription included suspect text; all manual findings here were checked against the original PDF's native text and the relevant rendered pages instead. Native text extraction covers PDF pages 1–45 of 129; printed pages 20 and 28 were visually checked. No claim of a complete manual review is made.

The live AGEOD forum refused or timed out on several reads. An actual **2019-11-17** Wayback capture of the ExMap discussion was readable. Archive attempts for the map-editing/cutting threads did not yield content. The static Le QG mirror preserved AGEWiki's file, indicator and cityscape documentation. Its documentation is primary-origin material on a third-party historical mirror; mirror retrieval dates are not documentation publication dates. Strategium was partially readable through the web reader; later fetches failed, so its unexamined sections supply no findings.

Exact CW2 master dimensions, a universal AGE texture tile size, original colour masks, all runtime layer passes, blend equations and shipped per-game cityscape thresholds remain unestablished. The note answers these with explicit limits rather than using screenshots as reverse-engineering proof. No game was installed or played; no mod was installed; no frame-rate or memory benchmark was run.

`art-masters/R37/` retains fetched records, errors, the source register, six downloaded study images with URLs/dimensions/SHA-256, the manual and its native-text evidence, and a study contact sheet. Images and manual renders remain study-only in that ignored directory. There is no game image embedded in this note, new game asset, tracing, image generation or generation reference. No application code, existing research note or canon decision was changed. R36's worktree was left alone.

**Disposition:** the production question is answered at the documented architecture level, with the unresolved internals above. Rank 1–3 material/compositing work is recommended for a separate request; forest-density implementation and a new art direction are not. [I]

## Sources

All external entries read/inspected **2026-11-18**. Local references were read on the same date. Study-image URLs are citations, not embedded artwork.

- **DEV** — Philkian, official CW2 developer diary, map entry dated 5 September 2013. [Source](https://forum.slitherine.com/viewtopic.php?t=44501). Read 2026-11-18. Establishes ACW1/CW2 production distinction and stated clarity goal.
- **ACW-FEATURES** — AGEOD feature series reproduced by TOCWOC, 16 December 2006, feature 6. [Source](https://www.brettschulte.net/CWBlog/2006/12/16/ageods-acw-features-0-19/). Read 2026-11-18. Primary-origin feature text on a secondary carrier; pixel total is not an independent measurement.
- **FILES** — AGEWiki, Overview of Game Files, preserved Le QG mirror. [Source](https://www.leqg.org/doc/age/www.ageod.net/agewiki/Overview_of_Game_Files.html). Read 2026-11-18. Common files, ExMap, terrain rules and graphics separation.
- **CITY** — AGEWiki technical guide, Displaying the Cityscape in the AGE Engine, Simple Modular Mode, preserved PDF. [Source](https://www.leqg.org/doc/age/www.ageod.net/agewiki/agewiki_images/d/d5/Displaying_the_Cityscape_in_the_AGE_Engine.pdf). Read 2026-11-18. Historical modes and configurable structures/zoom; not verified CW2 defaults.
- **INDICATORS** — AGEWiki, Region Indicators, documents an engine update as of 30 October 2010. [Source](https://www.leqg.org/doc/age/www.ageod.net/agewiki/Region_Indicators.html). Read 2026-11-18. Separate registered indicator coordinates.
- **EXMAP-NOTES** — Northern Neighbour, ExMap thread begun 16 March 2021. [Source](https://www.strategium.ru/forum/topic/96281-exmap-%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B0-%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%BA%D0%B0%D1%80%D1%82-%D0%B8%D0%B3%D1%80-ageod). Read 2026-11-18 through web reader, opening and region-record excerpt only. Russian-language modder testimony; no inaccessible attachments used.
- **EXMAP-ARCHIVE** — andrzej/Nikel, Map.bmp for exmap, June 2019 posts, Wayback capture **2019-11-17 09:53:01**. [Source](https://web.archive.org/web/20191117095301/http://ageod-forum.com/viewtopic.php?t=53394). Read 2026-11-18. Only the two posts present in that capture.
- **EXMAP-CUT-S** — **[S]** How to exmap?, original AGEOD tutorial. [Source](http://www.ageod-forum.com/viewtopic.php?t=24951). Search excerpt read 2026-11-18; live fetch timed out, archive attempt returned no capture. Cutting procedure unverified.
- **MANUAL** — Civil War II official instruction manual, Steam-hosted original PDF. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/manuals/AG_ACW2_Materials_Manual.pdf). Read 2026-11-18. Native PDF pages 1–45; cited material at printed pp. 10, 17–24 and 28, with pp. 20/28 visually checked.
- **CW2-STORE** — CW2 official Steam store description/gallery. [Source](https://store.steampowered.com/app/306630/). Read 2026-11-18. Region count and gallery provenance.
- **ACW-S1** — ACW official gallery image, 800×600 downloaded. [Image](https://www6.slitherine.com/images/screens/81/screen_5c9deccf0de47.jpg?1553853646), [gallery](https://www.slitherine.com/product/american-civil-war-the-blue-and-the-gray). Inspected 2026-11-18.
- **ACW-S2** — ACW official coastal-map image, 750×600 downloaded. [Image](https://www6.slitherine.com/images/screens/81/screen_5c9decd25aede.jpg?1553853650). Inspected 2026-11-18. Store image size is not native map resolution.
- **CW2-S1** — CW2 official Ohio/West Virginia gallery image, 1920×1080. [Image](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_805d7098c926396e39d2f8ea17494e4e3547b3cd.1920x1080.jpg?t=1718872464). Inspected 2026-11-18, including full native image.
- **CW2-S2** — CW2 official Eastern-theatre gallery image, 1920×1080. [Image](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_fb0ebad7e173c826252a940b152faa692d3405a4.1920x1080.jpg?t=1718872464). Inspected 2026-11-18.
- **ROP-S** — Rise of Prussia Gold official Steam gallery view, 1728×1080 returned. [Image](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292760/ss_729090dc1a68902ecd61fdede95607cf407d9b12.1920x1080.jpg?t=1710415147), [gallery](https://store.steampowered.com/app/292760/). Inspected 2026-11-18. Active filter unidentified.
- **OVERVIEW** — Emx77, CW2 Strategic Map, Matrix forum, October 2013. [Source](https://forums.matrixgames.com/viewtopic.php?t=243423). Read 2026-11-18. Community overview dimensions, not native game-raster specification.
- **REVIEW-ACW** — Larry Levandowski, Armchair General, 25 July 2007. [Source](https://armchairgeneral.com/ageods-american-civil-war-review.htm). Read 2026-11-18. Attributed reception only.
- **REVIEW-CW2** — Armchair General CW2 late-beta preview, 2013. [Source](https://armchairgeneral.com/civil-war-ii-pc-game-preview.htm). Read 2026-11-18. Pre-release clarity comment.
- **PLAYER** — Blue1's Steam review, posted 26 February 2015, updated 11 December 2016. [Direct source](https://steamcommunity.com/profiles/76561197986370677/recommended/306630/). Read 2026-11-18. Author and dates checked on the direct review after discovery in the reviews listing.
- **MODDER** — Mellman's Map Lag thread; nadia911's mod description, 22 December 2025. [Source](https://steamcommunity.com/app/306630/discussions/0/669472753009575748/). Read 2026-11-18. Author-reported changes and uncontrolled user experience only.
- **LOC** — A. Lindenkohl, Military map of south-eastern Virginia, 1864; LOC 99448891. [Record](https://www.loc.gov/item/99448891/), [study image](https://tile.loc.gov/image-services/iiif/service:gmd:gmd388:g3881:g3881s:cw0489000/full/pct:25/0/default.jpg). Read/inspected 2026-11-18. LOC Geography and Map Division credit; no contrary rights advisory observed.
- **CIV6** — Sam Gauss, own account and illustrated production sheets for Civ VI strategic view. [Source](https://www.samgauss.com/civilization-6.html). Read 2026-11-18. Production technique comparison, not an art-generation reference.
- **D0013** — [0013: procedural staff map](../decisions/0013-the-staff-map.md). Read 2026-11-18.
- **D0093** — [0093: engineer's manuscript](../decisions/0093-the-map-is-the-engineers-manuscript-on-the-table.md). Read 2026-11-18.
- **D0094** — [0094: claimed control and accepted research palette](../decisions/0094-claimed-control-on-the-presidents-map.md). Read 2026-11-18. Its qualitative control semantics govern over older research suggestions.
- **R35-R36** — [CODEX.md](../../CODEX.md), R35 delivery, R36 brief and R37 request. Read 2026-11-18. Retained maker figures and lead requirements; no R36 result assumed.

[DEV]: https://forum.slitherine.com/viewtopic.php?t=44501 "Read 2026-11-18: official CW2 developer diary"
[ACW-FEATURES]: https://www.brettschulte.net/CWBlog/2006/12/16/ageods-acw-features-0-19/ "Read 2026-11-18: reproduced AGEOD feature series"
[FILES]: https://www.leqg.org/doc/age/www.ageod.net/agewiki/Overview_of_Game_Files.html "Read 2026-11-18: AGEWiki common game-file guide"
[CITY]: https://www.leqg.org/doc/age/www.ageod.net/agewiki/agewiki_images/d/d5/Displaying_the_Cityscape_in_the_AGE_Engine.pdf "Read 2026-11-18: historical cityscape guide"
[INDICATORS]: https://www.leqg.org/doc/age/www.ageod.net/agewiki/Region_Indicators.html "Read 2026-11-18: registered regional indicators"
[EXMAP-NOTES]: https://www.strategium.ru/forum/topic/96281-exmap-%D0%BF%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%BC%D0%BC%D0%B0-%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%BA%D0%B0%D1%80%D1%82-%D0%B8%D0%B3%D1%80-ageod "Read 2026-11-18: partial ExMap modder account"
[EXMAP-ARCHIVE]: https://web.archive.org/web/20191117095301/http://ageod-forum.com/viewtopic.php?t=53394 "Read 2026-11-18: 2019-11-17 archived discussion"
[EXMAP-CUT-S]: http://www.ageod-forum.com/viewtopic.php?t=24951 "Search read 2026-11-18: full cutting tutorial unavailable"
[MANUAL]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/manuals/AG_ACW2_Materials_Manual.pdf "Read 2026-11-18: original PDF native text, first 45 pages"
[CW2-STORE]: https://store.steampowered.com/app/306630/ "Read 2026-11-18: official CW2 store"
[ACW-S1]: https://www6.slitherine.com/images/screens/81/screen_5c9deccf0de47.jpg?1553853646 "Inspected 2026-11-18: ACW map"
[ACW-S2]: https://www6.slitherine.com/images/screens/81/screen_5c9decd25aede.jpg?1553853650 "Inspected 2026-11-18: ACW coast"
[CW2-S1]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_805d7098c926396e39d2f8ea17494e4e3547b3cd.1920x1080.jpg?t=1718872464 "Inspected 2026-11-18: CW2 Ohio/West Virginia"
[CW2-S2]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_fb0ebad7e173c826252a940b152faa692d3405a4.1920x1080.jpg?t=1718872464 "Inspected 2026-11-18: CW2 Eastern theatre"
[ROP-S]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292760/ss_729090dc1a68902ecd61fdede95607cf407d9b12.1920x1080.jpg?t=1710415147 "Inspected 2026-11-18: ROP Gold"
[OVERVIEW]: https://forums.matrixgames.com/viewtopic.php?t=243423 "Read 2026-11-18: community strategic overview"
[REVIEW-ACW]: https://armchairgeneral.com/ageods-american-civil-war-review.htm "Read 2026-11-18: 2007 review"
[REVIEW-CW2]: https://armchairgeneral.com/civil-war-ii-pc-game-preview.htm "Read 2026-11-18: late-beta preview"
[PLAYER]: https://steamcommunity.com/profiles/76561197986370677/recommended/306630/ "Read 2026-11-18: Blue1 review, posted 2015-02-26, updated 2016-12-11"
[MODDER]: https://steamcommunity.com/app/306630/discussions/0/669472753009575748/ "Read 2026-11-18: player/modder accounts"
[LOC]: https://www.loc.gov/item/99448891/ "Read/inspected 2026-11-18: Lindenkohl 1864 map and rights"
[CIV6]: https://www.samgauss.com/civilization-6.html "Read 2026-11-18: artist production account"
[D0013]: ../decisions/0013-the-staff-map.md "Read 2026-11-18: procedural map canon"
[D0093]: ../decisions/0093-the-map-is-the-engineers-manuscript-on-the-table.md "Read 2026-11-18: manuscript canon"
[D0094]: ../decisions/0094-claimed-control-on-the-presidents-map.md "Read 2026-11-18: accepted research palette and control semantics"
[R35-R36]: ../../CODEX.md "Read 2026-11-18: lead requests and retained maker evidence"
