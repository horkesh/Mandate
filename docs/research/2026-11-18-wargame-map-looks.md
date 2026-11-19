# Research: how strategy wargames draw their maps

Date: 2026-11-18. Status: research note (not canon).

**Purpose.** R31 asks what makes a strategy map readable, attractive and responsive, and what those techniques offer *By Order of the President*. This is research, not a new art direction or an implementation brief. R30 runs separately; this work neither inspects nor changes its worktree.

**Conventions.**

- Citation keys are clickable references. Each resolves to a URL whose access date is **2026-11-18**, repeated in the Sources list. A publication date identifies the version discussed, not the date of access.
- **[S]** means search snippet only; **[gk]** means unverified general knowledge; **[I]** means interpretation or a recommendation. Neither a snippet nor an interpretation is evidence of implementation.
- **Visual observation** means inspection of the cited screenshots. Palette descriptions are qualitative, not sampled saturation measurements. A screenshot establishes appearance, not an animation, a hidden mechanic or a complete zoom system.
- **Not established** means the collected evidence does not answer that point. It does not mean the game lacks it. In particular, ordinary fog of war is not evidence of dated, attributed claims about one's own forces.
- Reception is attributed to the named reviewer or sampled thread. It is not a survey, a consensus, or a current-build defect report. No review scores or player counts are used as a proxy for map quality.

**Provenance.**

Official storefront descriptions and screenshot galleries were read for all 21 required games, and for the two additions. Developer material supplements them: Grand Tactician's map-and-paper article; Hearts of Iron IV's battle-plan diary; Victoria 3's graphics/living-map diaries; Crusader Kings III's map diary, reproduced in its community discussion; and Sam Gauss's account of making Civilization VI's strategic view. Reviews and player threads supply experience of using those maps. The 14 November Civil War survey was read for context; this note does not repeat its mechanics survey.

The ignored `art-masters/R31/` holds fetched page records, search results, screenshot URLs, downloaded study images and contact sheets. Store galleries mix old and new builds, and sometimes promotional images and expansions. Only identifiable map views inform the observations below. Shogun 2's current storefront returns a combined gallery under app 201270; the selected Japan campaign views are distinguished from its battle pictures. No game image is embedded in this note, delivered as an asset, traced, or used as a generation reference.

Some retrievals failed: the Paradox forum blocked direct reads of two diaries; Steam supplied the HoI IV and Victoria 3 texts instead. CK3's Steam announcement is only a teaser; the substantive text was read in the linked Reddit discussion. Two Blogspot review fetches returned only a site heading, so they supply no findings. A guessed Napoleon review URL returned 404; the correct GameSpot review was subsequently located and read. Two HighFleet study images timed out; other map images were sufficient. The Civ VI Reddit image CDN refused download; the discussion and the artist's own illustrated sheets were readable. The large GT manual and the CW2 PDF did not fetch through the web reader; their search excerpts are marked [S], not represented as manuals read in full. No game was installed or played, no audio was auditioned, and no performance comparison was run.

No verbatim quotation from an external source is used. Fetched text was treated as data, never as instructions.

## 1. What transfers to this game

**[I] The strongest lesson is hierarchy rather than added ornament.** HoI IV separates a front from an axis of advance; Civ VI's strategic view simplifies terrain into legible signs; CK3 changes the information hierarchy with scale. Radio General and Radio Commander make the gap between a report and a position part of play. HighFleet shows both the appeal of instruments and the burden of repeatedly operating them. These are techniques to adapt independently, not appearances to recreate. [HOI-PLAN] [CIV6-ART] [CK3-DIARY] [RG-R] [RC-R] [HF-R]

The constraints are already settled:

- The map is drawn from the seat's received information. Changing truth without a report must not move a mark or a front. [D0013] [D0094]
- The player commands people. Selecting ground outside an order reads what is known there; it does not move a division. [HARD-RULES]
- The map remains an engineer's manuscript covering the table. Union blue, enemy red, neutral ochre and violet corrections carry the meanings fixed by 0094. The president's blue pencil remains a line. [D0093] [D0094]
- Ink, pencil and age are different dimensions. The public opening picture has the ink exception in 0094; later corroboration follows that record. The player sees the holder or contested status, never a numerical control share. [D0094]
- Native nations' labels and the sensitive-history rules are not decoration to suppress for visual clarity. Access to information must survive reduced motion, loss of colour and a text rendering of the map. [PRESENTATION] [ASSETS]

## 2. Civil War maps

### 2.1 Grand Tactician: The Civil War (1861–1865)

- **Look and palette.** Paper-map views use warm cream, fine relief marks, prominent blue rivers and period lettering; closer terrain views use green land and blue water. The game's own developer describes layered historical-style paper with changing unit and battle information. This is a particularly relevant material precedent, although its symbols and layouts remain its own. [GT] [GT-DEV]
- **Control, fronts and movement.** Signs and faction flags identify armies; routes and other operational overlays sit above the country. Its map is also an instrument for directly ordering armies, which cannot transfer here. The collected first map image is an engagement view, not proof of a nationwide continuous front algorithm. [GT] [GT-R]
- **Uncertainty and age.** The developer explicitly distinguishes historically styled presentation from the underlying geographic map, which remains correct. **[S]** The manual excerpt describes darkening areas outside observation in paper-map view. Neither establishes a cast-wide, dated claims display equivalent to ours. [GT-DEV] [GT-MANUAL-S]
- **Zoom.** The 2021 review describes the transition between paper and terrain as the camera changes scale. The material transition is the useful distinction, not an exact number of levels, which was not verified. [GT-R]
- **Life and diegesis.** Papers, dispatches and a headquarters view belong to the command setting. The developer describes staff documents around the map; these provide a reason for changes to appear. Sound quality was not assessed here. [GT-DEV]
- **Reception.** Let's Talk About Wargames praised the detailed map and paper transition. A separate Steam thread reports uneven pan/zoom performance; that is a machine-specific experience, not a benchmark. [GT-R] [GT-F]
- **Screenshot.** [Paper engagement map][GT-SHOT]; [official map-and-papers article][GT-DEV]. Read 2026-11-18.

### 2.2 Ultimate General: Civil War

- **Look and palette.** Painterly tactical country: strong blue water, warm roads and fields, rounded green relief. This is a battlefield viewed from above, not a paper political-control map. The campaign chooses battles; do not confuse that campaign layer with the rich battlefield renderer. [UG] [UG-R]
- **Control, fronts and movement.** Formations, their facing and coloured identification carry the battle; drawn paths and defensive lines express immediate unit orders. A continuous territorial wash is not its main visual grammar. [UG] [UG-R]
- **Uncertainty and age.** The surveyed material concerns reconnaissance and battlefield visibility, not signed historical positions or fading report dates. No comparable old-information system was established. [UG] [UG-R]
- **Zoom.** Wargamer describes a limited zoom, a flatter viewing option and no map rotation. Terrain and formation silhouettes remain the organising elements rather than a political-map transformation. [UG-R]
- **Life and diegesis.** The review describes marching ranks, stragglers, gun crews and smoke. Those animate a battlefield; importing them would falsely turn our manuscript into a live view. Its briefing can inform presentation pacing without importing tactical command. [UG-R]
- **Reception.** Wargamer praised the painted maps and their clarity. The author's suggestion about the historical atlas used is explicitly a guess; it is not a verified account of the game's asset sources. [UG-R]
- **Screenshot.** [Battlefield, river and relief][UG-SHOT]. Read 2026-11-18.

### 2.3 Strategic Command: American Civil War

- **Look and palette.** A conventional operational board: restrained grey-green terrain, clear blue seas, visible transport lines and compact counters. The official description offers two newer map styles and a classic style; one gallery image must not stand for every option. [SC]
- **Control, fronts and movement.** The hex framework and counter positions make occupied space and the line between armies legible. Signs, borders and route information carry more of the reading task than a continuous painterly field. The publisher describes the map's enormous hex extent and navigable waterways. [SC]
- **Uncertainty and age.** Nothing in the inspected images proves a dated last-known-position language. Treat its counters as a visual-density comparison, not as evidence of how a seat should know positions. [SC]
- **Zoom.** The gallery supplies regional and wider views; the overview map supports navigation. A change to paper material or a verified set of semantic zoom bands was not established. [SC]
- **Life and diegesis.** Turn selection and highlighted operational information make this a board to operate. Its period subject does not make the whole interface an object on a commander's table. Map-specific sound was not established. [SC]
- **Reception.** The sampled Steam reviews value the sense of distance and theatre geography; one welcomes state names and borders on the overview. Others find the crowded East resembles a continuous counter line. These are useful examples of how scale changes the reading of a war, not proof that hexes are intrinsically good or bad. [SC-F]
- **Screenshot.** [Virginia counter density and transport network][SC-SHOT]. Read 2026-11-18.

### 2.4 AGEOD's Civil War II

- **Look and palette.** A richly illustrated flat regional map, with emphatic blue rivers, green and ochre land, small settlements and large portrait/flag stack signs. Its terrain is much more saturated than the neutral counter board above. [CW2]
- **Control, fronts and movement.** Irregular regions organise the country; stacks and paths organise operations. Percentage control and loyalty are distinct mechanics in the earlier project survey. A visible boundary between stacks should not be mistaken for HoI IV's separately authored battle-plan line. [CW2] [ACW-NOTE]
- **Uncertainty and age.** The publisher names fog of war. The evidence collected here does not establish an author/date/fade grammar for every map assertion. The earlier survey's control mechanics are not evidence that the displayed values are reports. [CW2] [ACW-NOTE]
- **Zoom.** **[S]** The official manual search excerpt lists wheel/key zoom and a toggle between highest and lowest scale. The gallery shows the same illustrated regional vocabulary at different extents; no paper-to-world transition was established. [CW2-MANUAL-S] [CW2]
- **Life and diegesis.** Simultaneous orders resolve across days, with a message record. Portraits connect stacks to people, but the map is still an operational game board. No map-sound observation is claimed. [CW2]
- **Reception.** Armchair General's late-beta preview welcomed the expanded strategic game but explicitly said text and image clarity still needed work. That is a dated preview, not a finding about today's build. [CW2-R2]
- **Screenshot.** [Regional map and stack hierarchy][CW2-SHOT]. Read 2026-11-18.

## 3. Maps used as instruments in the game's world

### 3.1 Radio General

- **Look and palette.** A physical command table, printed topographic sheet, contours and a restrained green/tan base. Strong red and blue tokens stand apart from that quieter geography. [RG]
- **Control, fronts and movement.** Reports and manually placed tokens create the working picture; map pencils allow annotation. This is not a country-fill system. Units still receive tactical orders, so the information premise transfers more readily than its verbs. [RG] [RG-R]
- **Uncertainty and age.** The official premise is incomplete and confused verbal reports. Save or Quit describes positions as something the player must request and maintain. Its review also reports settings that automate placement and undermine parts of that uncertainty; those are that review's 2020 observations. [RG] [RG-R]
- **Zoom.** Table/map inspection changes the view of the same sheet; the cited screenshots show both its surrounding apparatus and close map work. No scale-driven replacement of geography was established. [RG] [RG-R]
- **Life and diegesis.** Radio exchanges, moved tokens, pencils and the lit tent all have an in-world explanation. A voice interface is documented, not auditioned here. [RG]
- **Reception.** Save or Quit valued the uncertain tactical picture but criticised shallow underlying tactics and optional table toys. **[I]** A desk object earns its screen space when it helps read or act; physical plausibility alone is insufficient. [RG-R]
- **Screenshot.** [Command table and tokens][RG-SHOT]. Read 2026-11-18.

### 3.2 HighFleet

- **Look and palette.** A cool grey-blue electronic chart enclosed by worn analogue instruments, with luminous coloured contacts, bearing lines and range circles. It is fictional technology, not an 1861 paper reference. [HF] [HF-SHOT]
- **Control, fronts and movement.** Routes, contacts, cities, measured distances and circles matter more than territorial ownership fields or a continuous land front. The player interprets transmissions and marks courses. [HF-R]
- **Uncertainty and age.** Intercepts and sensor evidence require interpretation. The all-purpose guide describes measuring displacement between contacts to estimate speed; this is a relevant analytical technique, but not permission for our browser to extrapolate an unreported army. [HF-GUIDE] [D0094]
- **Zoom.** RPS describes a chart overview and a closer live-looking view, including salvage scenes. These are different information presentations, not proof that every contact is continuously observed. [HF-R]
- **Life and diegesis.** Dials, radio tuning and the telephone make the interface an instrument panel. The publisher emphasises its sound design; the sonic result was not auditioned here. [HF] [HF-R]
- **Reception.** RPS liked important parts of the campaign but objected to manual ruler/pencil repetition, accidental zoom while operating a dial, flicker and hard-to-read instrument information. **[I]** Borrow source interpretation and measured annotations; let the staff perform routine plotting. [HF-R]
- **Screenshot.** [Chart, range rings and instruments][HF-SHOT]. Read 2026-11-18.

### 3.3 Shenandoah Studio's Battle of the Bulge

- **Look and palette.** A compact area board in snow-grey and desaturated forest tones. Green and blue blocks and bright area edges supply the strongest gameplay contrast. [BULGE] [BULGE-SHOT]
- **Control, fronts and movement.** Named irregular areas, block stacks and area highlighting make a boundary readable without a continuous decorative front stroke. Movement is between areas; combat previews appear beside the board. [BULGE] [BULGE-R]
- **Uncertainty and age.** The cited review and publisher page do not establish a dated reporting system. The interface examples show concrete unit/combat information, which must not be imported as knowledge available to our president. [BULGE] [BULGE-R]
- **Zoom.** Overview and closer board images retain the area-and-block vocabulary. A material transition and exact zoom limits were not established; the lesson is legibility of a compact board at its normal working scale. [BULGE-SHOT] [BULGE-R]
- **Life and diegesis.** Small moves and feedback animate a tabletop-like board. The review describes period music. A tabletop aesthetic is not proof that a character in the fiction is looking at this exact operational board. [BULGE-R]
- **Reception.** 3rd-strike found the presentation approachable and singled out its period soundtrack. Its description of the overhead map stresses clear area divisions rather than scenic spectacle. [BULGE-R]
- **Screenshot.** [Area edges, blocks and snow][BULGE-SHOT]. Read 2026-11-18.

### 3.4 Shenandoah Studio's Drive on Moscow

- **Look and palette.** The same clear area-board family, with olive/brown country changing to a pale winter sheet. Red and blue blocks survive that material change. [MOSCOW] [MOSCOW-SHOT]
- **Control, fronts and movement.** Selecting a unit highlights reachable areas; the combat preview explains the engagement before commitment. Ownership and occupied areas define the operational line, rather than broad freehand plan ribbons. [MOSCOW-R2]
- **Uncertainty and age.** No equivalent to independent authors, report dates and ageing was established. Weather changes information about conditions; it is not itself an uncertainty display. [MOSCOW] [MOSCOW-R2]
- **Zoom.** The full board and local working views keep the same geographic areas and blocks. The cited account documents selection/highlights, not a semantic zoom transition or exact level count. [MOSCOW-R2]
- **Life and diegesis.** The official page explicitly describes the map changing with weather; briefing papers and a calendar contextualise the turn. This is a game-board presentation with in-world documents, not evidence that the whole board is a fictional staff's fallible report. [MOSCOW] [MOSCOW-SHOT]
- **Reception.** BoardGameQuest praises simple movement and the amount of information available before commitment; it illustrates the map changing colour with winter. [MOSCOW-R2]
- **Screenshot.** [Winter board][MOSCOW-SHOT]; [review's weather comparison][MOSCOW-R2]. Read 2026-11-18.

## 4. Grand strategy

### 4.1 Hearts of Iron IV

- **Look and palette.** Coloured national fields over relief and water, with much stronger operational lines and arrows on top. The important distinction is between area colour, a front and a directed axis, not the exact hues of its screenshot. [HOI] [HOI-SHOT]
- **Control, fronts and movement.** The battle-plan diary separates the starting front, offensive destination line and bendable advance arrow. Hovering an arrow previews the intended sequence of areas. Its divisions can also receive direct overrides; that command model is outside our rules. [HOI-PLAN]
- **Uncertainty and age.** Neither the diary nor the reviewed examples establish source-by-source age on these lines. A drawn plan is intent, not proof of current enemy location or progress. **[I]** Our front must instead be a segmented claim; our route preview must remain the validated commander's plan. [HOI-PLAN] [D0094] [PRESENTATION]
- **Zoom.** A pre-release PC Gamer account describes political overview yielding to terrain and local detail. This supports semantic scaling, not a current-build inventory of map modes. [HOI-ZOOM]
- **Life and diegesis.** The diary's hover preview makes the plan respond to inspection. Military line language evokes a staff plan, but the whole interface is not a physical desk. No sound claim is needed for that interaction to work. [HOI-PLAN]
- **Reception.** Prima Games found the planner useful for broad pushes but reported confusing front expansion during encirclements and cumbersome air/naval interfaces. **[I]** A broad arrow reads well only if its extent and ownership remain understandable. [HOI-R]
- **Screenshot.** [Front and broad advance arrow][HOI-SHOT]; [diary's plan examples][HOI-PLAN]. Read 2026-11-18.

### 4.2 Victoria 3

- **Look and palette.** A brightly lettered political paper map at distance, then natural terrain, towns and industry close in. Cream paper and distinct country colours contrast with the darker interface. [V3] [V3-R] [V3-SHOT]
- **Control, fronts and movement.** The launch review describes fronts as places to assign generals, with battles chosen by the officers; its paper-map fronts show conspicuous activity. This describes the 2022 review build, not every subsequent war-system revision. [V3-R]
- **Uncertainty and age.** The inspected material does not establish report-based ownership or ageing. Developer-described growth, pollution and devastation reflect the simulated world. **[I]** Such live indicators would leak facts in our game unless an actual received report supplies them. [V3-STEAM] [D0094]
- **Zoom.** The graphics diary explicitly describes a paper version of the 3D map and its surrounding table. The review and preview describe the transition and distinct scales of lettering and urban detail. [V3-STEAM] [V3-R] [V3-PREVIEW]
- **Life and diegesis.** The living-map diary describes trains, ships and evolving hubs. The paper/table framing contextualises oversight, while the close world provides animation. We can use a clear transition of emphasis without rendering that world. [V3-STEAM]
- **Reception.** PCGamesN praised the map's beauty and lettering, while its preview still wanted faster routes to certain information panels. Visual attraction and information access were separate strengths/problems. [V3-R] [V3-PREVIEW]
- **Screenshot.** [Paper political view][V3-SHOT]; [close city views][V3-PREVIEW]. Read 2026-11-18.

### 4.3 Europa Universalis IV

- **Look and palette.** Terrain, strong boundary rims, large realm names and thematic map modes. The inspected close views expose water, towns and miniature armies; colour fields provide a broader political reading. [EU4] [EU4-SHOT]
- **Control, fronts and movement.** Provinces and national borders establish the field; armies and route marks describe movement. This is a direct-command map, not a HoI-style operational plan editor. No separate continuous front display is established by the sampled screenshots. [EU4] [EU4-R]
- **Uncertainty and age.** The review discusses discovering and developing territory but does not establish signed last-known positions, competing reports or date-based fading. Those cannot be inferred from its historical styling. [EU4-R]
- **Zoom.** The gallery presents world selection and close terrain. Information also changes through map modes; the evidence supports these complementary views rather than a verified automatic paper/terrain transition. [EU4] [EU4-R]
- **Life and diegesis.** GameSpot describes freezing lakes, passing caravans, birds and sea life. Those give scenery activity; they are not received intelligence. The map is an abstract strategic view rather than a literal staff table. [EU4-R]
- **Reception.** GameSpot praised the detailed terrain and explanatory tooltips. A 2013 forum discussion asks how to combine political clarity with terrain, illustrating a recurring need rather than proving one universally preferred mode. **[S]** That thread was seen only in search. [EU4-R] [EU4-F-S]
- **Screenshot.** [Political border over close terrain][EU4-SHOT]. Read 2026-11-18.

### 4.4 Europa Universalis V

- **Look and palette.** The official gallery shows dense political country fields and much more detailed terrain views, with restrained land colour under large type and a dark interface. These are observations of the available gallery, not a claim about a particular graphics preset. [EU5] [EU5-SHOT]
- **Control, fronts and movement.** Borders and local divisions structure the map; armies are selectable entities with their own panel. The player thread specifically discusses movement arrows and a road map mode. No HoI-style continuous front system is established here. [EU5] [EU5-F]
- **Uncertainty and age.** No examined source establishes a report-date/fading grammar. Do not assume the fine location mesh represents finer knowledge. [EU5] [EU5-F]
- **Zoom.** The official images support political overview versus closer terrain/detail; the thread refers to both 3D and paper views and to confusing icon scales. Exact thresholds and which transitions are optional were not verified. [EU5] [EU5-F]
- **Life and diegesis.** The sampled players describe animated army figures. One objects that their animation and displayed positions obscure the route. A historical paper aesthetic is present in the discussion, but it is not evidence of a claims-only in-world instrument. [EU5-F]
- **Reception.** The November 2025 thread contains both enthusiastic approval and complaints about clutter, washed-out fields, glow, route clarity and scale. Those disagreements are the finding; none is promoted to a current-build defect. [EU5-F]
- **Screenshot.** [Political overview][EU5-SHOT]; [official mixed-scale gallery][EU5]. Read 2026-11-18.

### 4.5 Crusader Kings III

- **Look and palette.** Illustrated parchment at distance, coloured realms at middle scale, and terrain/holdings close in. The official gallery also shows the paper as an object surrounded by a table scene. [CK3] [CK3-SHOT]
- **Control, fronts and movement.** The developer's map diary makes selection contextual: a realm opens its ruler, and other modes select their own subject. Its political hierarchy distinguishes independent realms and vassals. This person/place connection is useful; its direct army commands are not. [CK3-DIARY] [CK3-R]
- **Uncertainty and age.** Neither the diary nor the inspected review establishes dated claims for control and friendly positions. Realm hierarchy should not be read as a knowledge hierarchy. [CK3-DIARY] [CK3-R]
- **Zoom.** The diary specifies detail, realms and paper levels. Vassal breakdown yields to independent realms at the widest view; thematic modes retain their subject across scales. This is the clearest sourced example of changing detail while preserving the question being asked. [CK3-DIARY]
- **Life and diegesis.** Contextual selection and nested tooltips respond to the pointer. The wide paper/table scene lends a physical setting; the close terrain remains a strategic abstraction. [CK3-DIARY] [CK3-R] [CK3-SHOT]
- **Reception.** PCGamesN praised the parchment transition and easier navigation, but reported overlapping information and an accidental army order while dismissing a notification. A 2024 player thread welcomes the table view. **[I]** Pop-ups must capture input rather than pass a click through to the map. [CK3-R] [CK3-F-READ]
- **Screenshot.** [Paper on its table][CK3-SHOT]. Read 2026-11-18.

### 4.6 Imperator: Rome

- **Look and palette.** A luminous Mediterranean with blue water, warm land, substantial relief and coloured territory/border overlays. The close screenshot makes terrain attractive without giving every land patch an equally loud colour. [IR] [IR-SHOT]
- **Control, fronts and movement.** Regions, boundaries and army miniatures express ownership and movement. The review describes waypoint-to-waypoint army motion; a continuous operational front language was not established. [IR] [IR-R]
- **Uncertainty and age.** The collected sources do not establish a signed, dated report display. The visibility of named territory is not proof of current intelligence about its troops. [IR] [IR-F]
- **Zoom.** The gallery ranges from a wide landform view to close towns and armies; multiple overlays are documented by the sampled player. Exact scale-driven substitutions were not verified. [IR] [IR-F]
- **Life and diegesis.** Armies and settlements inhabit a geographic scene. It is not a staff's physical map, despite the cartographic lettering. The launch review's criticism of sparse motion is version-specific. [IR-SHOT] [IR-R]
- **Reception.** Save or Quit found the 2019 map lifeless; Cablenexus's Steam review praised its scale, detail and interface. **[I]** A handsome base alone cannot settle whether the information feels useful or alive. [IR-R] [IR-F]
- **Screenshot.** [Terrain, cities and political boundaries][IR-SHOT]. Read 2026-11-18.

## 5. Total War campaign maps

The following entries concern campaign geography. Tactical battle screenshots are excluded from the visual comparison.

### 5.1 Napoleon: Total War

- **Look and palette.** A three-dimensional campaign landscape: green or snow-covered country, bright rivers, strong national borders, settlements and flag-bearing army figures. Seasonal surface changes are conspicuous in the sampled views. [NAP] [NAP-SHOT] [NAP-R3]
- **Control, fronts and movement.** Regions and settlements divide ownership; army figures show the concentrations the player commands. The review describes moving armies on this strategic layer. No continuous national front or broad plan ribbon was established. [NAP-R3]
- **Uncertainty and age.** The collected campaign review does not establish dated friendly reports or stale ownership. The campaign scene should not be treated as a model of our information boundary. [NAP-R3]
- **Zoom.** Campaign inspection changes the scale of a single landscape. The two identifiable campaign screenshots show different extents; no paper transformation or exact zoom-band count was established. [NAP] [NAP-SHOT]
- **Life and diegesis.** GameSpot describes waves, snow and the visible beginnings of industrialisation. Those are ambient world changes, not reports being written. Campaign presentation evokes the period without making every mark a document in Napoleon's hands. [NAP-R3]
- **Reception.** GameSpot praised the immersive, detailed setting and improved interface, but found its geographical scope narrower than Empire's. The useful lesson is a purposeful theatre-sized frame, not unlimited scenic coverage. [NAP-R3]
- **Screenshot.** [Campaign landscape][NAP-SHOT]; the same gallery's winter campaign view is recorded in the R31 manifest. Read 2026-11-18.

### 5.2 Total War: Shogun 2

- **Look and palette.** Green mountains, bright seasonal foliage and water against a quieter paper treatment of unknown country. The art direction gives both the map and surrounding interface one visual vocabulary. [SHOGUN] [SHOGUN-R]
- **Control, fronts and movement.** Provinces, castles, army standards and agents organise the campaign. Moving an army or raiding a settlement is direct control; no comparable continuously drawn front is established. [SHOGUN-R]
- **Uncertainty and age.** RPS describes unexplored paper rising into landscape on exploration, then darkening under fog when no unit observes it. This is visibility/exploration, not author/date evidence. [SHOGUN-R]
- **Zoom.** The paper/world distinction in that review is tied to visibility; it should not be misreported as solely a zoom effect. Camera scale also changes how much of Japan is visible, as the campaign gallery shows. [SHOGUN-R] [SHOGUN-SHOT]
- **Life and diegesis.** Seasonal landscape and a coherent calligraphic interface give the setting character. RPS praises the voice work, but this note makes no independent audio judgement. The paper treatment is cartographic framing, not a full claims-only command table. [SHOGUN-R]
- **Reception.** RPS strongly praised presentation while noting that the campaign becomes very busy. **[I]** A coherent visual vocabulary still needs a ceiling on simultaneous signs and labels. [SHOGUN-R]
- **Screenshot.** [Wide Japan campaign view][SHOGUN-SHOT]. The storefront's mixed base/expansion gallery is disclosed in Provenance. Read 2026-11-18.

### 5.3 Total War: Three Kingdoms

- **Look and palette.** A green, painterly campaign landscape with pale mist, dramatic landforms and fluid-looking cartographic marks. Red/coloured standards and compact settlement labels sit above the scenery. [TK] [TK-SHOT]
- **Control, fronts and movement.** Territory, settlements and character-led armies organise the country. The individual warlord matters, but the player still moves armies directly. A continuous front is not the main grammar in the cited campaign view. [TK] [TK-R]
- **Uncertainty and age.** The examined material does not establish signed last-known positions or fading control reports. Mist in an image is not sufficient evidence of a fog-of-war mechanic. [TK] [TK-SHOT]
- **Zoom.** The campaign images offer landscape inspection and broader framing; tactical battle views are a separate layer. No exact automatic zoom hierarchy was verified. [TK] [TK-R]
- **Life and diegesis.** The campaign connects people to their armies and territory; pointer tooltips explain what is selected. Its watercolour abstraction is a style of presentation, not a literal staff's manuscript. [TK-R]
- **Reception.** RPS explicitly connects its clearer map with more abstract watercolour rendering, and praises improved campaign tooltips. **[I]** Simplifying the base can improve both appeal and clarity; it does not require reproducing its painting style. [TK-R]
- **Screenshot.** [Campaign country and settlement hierarchy][TK-SHOT]. Read 2026-11-18.

## 6. Other useful operational and 4X comparisons

### 6.1 Civilization VI, especially strategic view

- **Look and palette.** Strategic view translates terrain into a deliberately illustrated 2D vocabulary: green fields, blue water, distinct hills/mountains and small readable features. Sam Gauss documents creating both normal and fogged sprite states and variations for tiling terrain. This is authored cartographic art, not just a desaturated 3D view. [CIV6-ART] [CIV6-PORTFOLIO]
- **Control, fronts and movement.** Borders distinguish territory; units, hexes and route indications remain pieces of a direct-command game. The inspected discussion values playing on the simplified board, not a continuous operational front. [CIV6] [CIV6-F]
- **Uncertainty and age.** Fogged terrain has its own artwork. Players in the sampled thread find the monochrome fog hard to read and sometimes struggle to distinguish terrain. This is an important warning about fading; no author/date system is established. [CIV6-ART] [CIV6-F]
- **Zoom.** Strategic view is a selectable alternative representation, not merely the far end of the normal camera. Players praise its overview and report playing predominantly in it. Exact current zoom limits were not tested. [CIV6-F]
- **Life and diegesis.** Selection and readable feature changes carry play even with less scenic animation. The illustrated world is a game board rather than a character's physical map. No strategic-view sound comparison was made. [CIV6-F] [CIV6-ART]
- **Reception.** The CivFanatics thread praises clarity, the artwork and perceived performance, while asking for clearer ownership and hills. Those performance reports are anecdotes, not a measured budget to borrow. [CIV6-F]
- **Screenshots.** [Strategic-view screenshot discussion][CIV6-SV-POST] (page read, image CDN download denied); [artist's sheet with gameplay insets and normal/fogged terrain][CIV6-ART]. The ordinary 3D screenshot in the storefront is not passed off as strategic view. Read 2026-11-18.

### 6.2 Unity of Command II

- **Look and palette.** A stylised relief board with compact sculptural formations, muted country, clear roads and bright blue operational highlighting. Its separate campaign overview is much flatter and more graphic. [UOC2] [UOC2-SHOT]
- **Control, fronts and movement.** Divisions, hex geography, supply and headquarters define the operational picture. Supply and route information can dominate when needed; the entire board is not equally annotated all the time. [UOC2] [UOC2-R]
- **Uncertainty and age.** The publisher explicitly introduces fog of war, reconnaissance and information gained from stragglers. This concerns discovering enemy positions; it does not establish dated uncertainty about every friendly headquarters. [UOC2]
- **Zoom.** Distinguish the strategic campaign map from the operational board: they perform different jobs and are not just two camera magnifications. The gallery also shows close operational views. Exact within-board zoom thresholds were not verified. [UOC2] [UOC2-SHOT]
- **Life and diegesis.** Animated board pieces and local operational highlights make actions easy to follow. Conference cards and planning context evoke a military game; the terrain itself is not a staff-authored report. No sound comparison was made. [UOC2] [UOC2-R]
- **Reception.** Explorminate praises the pace supported by compact maps and logistics, but criticises the tutorial. A legible visual board does not automatically teach the meaning of its marks. [UOC2-R]
- **Screenshot.** [Operational supply/route emphasis][UOC2-SHOT]. Read 2026-11-18.

### 6.3 Gary Grigsby's War in the East 2

- **Look and palette.** A detailed flat hex-and-counter atlas: restrained land, blue water and rail/road networks, with counter colours supplying much of the gameplay contrast. Dense units can cover the base almost completely. [WITE2] [WITE2-SHOT]
- **Control, fronts and movement.** The reproduced manual explains enemy-hex shading, newly captured hexes, selectable counter information and logistics overlays. The front is principally read through occupation and deployed counters, not a broad decorative arrow. [WITE2-UI]
- **Uncertainty and age.** The manual's interface chapter says unit information varies with fog of war. That does not by itself establish a per-mark age display. The enemy intelligence rules were not read in full, so no stronger claim is made. [WITE2-UI]
- **Zoom.** The same chapter specifies five zoom levels and a command to hide units. These are concrete ways of exposing the atlas beneath a dense operational layer. [WITE2-UI]
- **Life and diegesis.** Hovering a hex opens contextual information; reports can return to locations on the map. This is a data-rich operational interface, not a literal worn staff sheet. No sound finding is claimed. [WITE2-UI]
- **Reception.** No Dice No Glory describes an initially overwhelming interface, then values its familiar counter information and hover access after learning the tutorial scenario. **[I]** Keep deeper evidence available on demand rather than printing every figure on the map. [WITE2-R]
- **Screenshot.** [Counter density over the atlas][WITE2-SHOT]. Read 2026-11-18.

### 6.4 Old World

- **Look and palette.** Warm, detailed terrain with strong relief, blue water, coloured territory edges and recognisable cities. It is an inhabited landscape, not primarily a paper-map treatment. [OW] [OW-SHOT]
- **Control, fronts and movement.** Hexes, territorial borders, cities and units define the map; the order economy limits acts, but the player still commands units. No continuous front is established in the sampled imagery. [OW] [OW-R]
- **Uncertainty and age.** Exploration reveals the country; the inspected material does not establish signed position reports or date-based fading. No equivalence between its fog and our belief layer is claimed. [OW-R]
- **Zoom.** The gallery shows wider settlement country and close terrain/urban detail. A paper transformation and exact semantic bands were not established. [OW] [OW-SHOT]
- **Life and diegesis.** Visible development gives the country texture. The 2020 early-access reviewer admired the terrain but found some units and buildings awkwardly integrated. This is an early-build observation, not an assessment of the current version. [OW-R]
- **Reception.** That review is useful because it separates beautiful terrain from unsatisfying feedback when placing improvements. **[I]** A map needs a clear, meaningful response to the player's act as well as an attractive resting state. [OW-R]
- **Screenshot.** [Regional terrain and settlement view][OW-SHOT]. Read 2026-11-18.

### 6.5 Addition: Radio Commander

- **Why include it.** Its uncertainty about friendly positions is directly relevant to the president's information problem, even though its Vietnam setting and radio apparatus are outside the target era. [RC] [RC-R]
- **Look and palette.** A green/tan contoured paper map in a tent, small contrasting tokens, handwritten annotations and a radio. Geography is quieter than the working marks. [RC] [RC-SHOT]
- **Control, fronts and movement.** Tokens and notes track reports; the player transmits orders and adjusts the map. It does not principally communicate a nationwide control front. Its tactical movement/strike verbs cannot transfer. [RC] [RC-R]
- **Uncertainty and age.** RPS describes requested friendly positions, spontaneous spotting reports and, in veteran mode, lost units or mistaken coordinates. The map can therefore be internally plausible and wrong. It is a stronger information precedent than a generic fogged battlefield. [RC-R]
- **Zoom.** The sampled views move between tent/table and a readable close sheet. This changes inspection scale, not the underlying report's certainty. Exact camera limits were not verified. [RC] [RC-SHOT]
- **Life and diegesis.** Voices and the annotated map are the operational interface. RPS also values the revealing post-mission replay, which is a separate presentation of what happened. [RC] [RC-R]
- **Reception.** RPS praises the disorientation caused by imperfect information, but criticises unclear mission triggers. **[I]** Make the uncertainty of the report explicit; do not make the operation of the interface uncertain. [RC-R]
- **Screenshot.** [Paper, tokens and annotation tools][RC-SHOT]. Read 2026-11-18.

### 6.6 Addition: Command Ops 2

- **Why include it.** This is a useful counterexample to the idea that every appealing operational map needs a scenic world. It also gives a concrete reported-contact and zoom-hierarchy precedent. [CO2] [CO2-G]
- **Look and palette.** Flat topographic country, modest road/contour lines and compact coloured counters. Optional analytical overlays can temporarily become much stronger than the base. [CO2] [CO2-SHOT]
- **Control, fronts and movement.** Orders, tasks, routes and subordinate formations structure the open map. The official description permits an operational commander to assess and issue orders; the project still excludes its direct subordinate-unit verbs. [CO2]
- **Uncertainty and age.** The community guide describes an enemy counter staying at its last observed place when contact is lost, with contact information to inspect. Its phrase denying fog of war means there is no conventional dark veil, not that intelligence is perfect. This is community documentation, not an independently tested mechanic. [CO2-G]
- **Zoom.** The guide's auto-scale option shrinks subordinate counters as the view widens, leaving higher headquarters prominent. This is an especially economical model for decluttering signs. [CO2-G]
- **Life and diegesis.** Tasks unfold in pausable time; the guide links selected counters to detailed reports. The map is a functional command display rather than a physical 1861 sheet. Store reviewers describe the sound as underwhelming; it was not auditioned here. [CO2] [CO2-G]
- **Reception.** The sampled Steam reviews differ on the old-fashioned appearance but include praise for the map's functional clarity. A separate 2021 player discussion values watching plans unfold, with disagreement about how intelligible the resulting battle becomes. [CO2] [CO2-F-READ]
- **Screenshot.** [Topographic command display][CO2-SHOT]. Read 2026-11-18.

## 7. Techniques ranked by value for cost

**[I] These are relative effort judgements for the existing manuscript renderer, not delivery estimates or authority to start work.** “Low” means palette/line/label or existing-view work; “medium” means coordinated rendering and interaction changes; “high” means new authored data, knowledge fields or a new presentation system. R30 owns its present colour and legend changes; this ranking neither duplicates nor redirects that run.

| Rank | Technique | Value | Likely cost | Evidence and constraint |
|---|---|---|---|---|
| 1 | Give control fields enough chroma, then separate age and certainty with stroke/texture | Very high: ownership becomes the first reading | Low to medium | Strong signs on quiet maps work across Radio General and Civ VI; washed-out fields attract complaints in EU V. Preserve 0094's meanings. [RG-SHOT] [CIV6-ART] [EU5-F] [D0094] |
| 2 | Let labels yield by scale and priority while important signs stay at their reported anchors | Very high: makes the existing map usable | Low to medium | CK3's hierarchy and Command Ops auto-scale reduce simultaneous detail. Never move evidence to solve layout. [CK3-DIARY] [CO2-G] [PRESENTATION] |
| 3 | Separate control edge, claimed front, commander’s draft and presidential correction | Very high: four questions stop competing | Medium | HoI IV's distinct line/axis vocabulary transfers as a technique, with our source boundary replacing its authority. [HOI-PLAN] [D0094] |
| 4 | Make inspection reveal the supporting paper, author and date in one step | High: uncertainty becomes understandable | Low to medium where the view already supplies it | Contextual selection and hover work in CK3 and WitE2. Missing fields require lead-owned API work, not invented text. [CK3-DIARY] [WITE2-UI] |
| 5 | Preserve one material while changing emphasis at three working scales | High: overview and detail each have a job | Medium | Learn from CK3/Victoria's semantic scaling; retain the manuscript throughout. No 3D transition is proposed. [CK3-DIARY] [V3-STEAM] [D0093] |
| 6 | Briefly draw in a received change, then stop moving | High: makes a turn readable | Medium | Radio Commander makes received information consequential; 0094 already requires arriving marks. Animate receipt, not inferred travel. [RC-R] [D0094] |
| 7 | Group nearby headquarters captions without hiding who reported | Medium to high | Medium | Dense stack/counter maps show the cost of plotting everything at equal prominence. Keep names available by focus and text. [CW2-SHOT] [WITE2-SHOT] [PRESENTATION] |
| 8 | Add restrained physical feedback to existing acts | Medium | Low if existing sounds suffice | Radio General supplies context; HighFleet warns against instrument theatre becoming work. No new music or battle sound campaign is proposed. [RG-R] [HF-R] [ASSETS] |
| 9 | Refine material detail only where it improves geographic reading | Medium | Medium to high | GT's paper can be convincing; Civ VI proves simplification can also be attractive. More texture is not automatically more information. [GT-DEV] [CIV6-ART] |
| 10 | Add animated traffic, armies, live weather or a new 3D room | Low for this project, with substantial semantic risk | High | These enliven other games, but could imply unreceived knowledge and conflict with the chosen 2D manuscript. Do not pursue. [V3-STEAM] [NAP-R3] [D0013] [D0093] |

## 8. Concrete recommendations

All items in this section are **[I]**, constrained by the accepted records. They recommend techniques, never a game's look. Numerical values below are starting points for a future visual trial, not measured properties of the surveyed games or replacements for R30's judgement.

### 8.1 Control colour

Use a **limited, high-chroma operational palette over a quieter base**. As trial pigment endpoints, use Union blue `#1F59A8`, enemy red `#C33830`, neutral ochre `#D5A32F` and correction violet `#76509B`. These are proposed paint colours before compositing, not promised final screenshot colours or historically authenticated pigment samples. Judge the final wash on the actual paper with relief and ink present; merely increasing source saturation can still produce mud after blending. [I] [D0094] [RG-SHOT] [EU5-F]

Keep a visible minimum field for any extant holder claim. Let internal share affect density without printing a percentage or turning a weak claim into bare paper. Truly unknown ground remains paper and says “No report”. Neutral ochre is reserved for a reported neutral government, not uncertainty. Contested ground carries both side colours in a fine, fixed-screen-space hatch. Ink/pencil uses edge continuity and weight; age adds a clearly readable date rather than fading the field into indistinguishable paper. This follows 0094 while addressing the kind of monochrome ambiguity reported by Civ VI players. [I] [D0094] [CIV6-F]

Retain a narrow pooled rim and gentler middle. Make relief less saturated than control and keep river blue perceptually distinct in value/width from the Union field. A legend must show texture and line cues as well as hue; alternative colour-vision and high-contrast skins preserve the same meanings. Test the composites, not only the hex swatches. [I] [D0094] [PRESENTATION]

### 8.2 Fronts

Draw the front as a **line symbol with a subordinate uncertainty state**, not the sum of every region border. At 1440-pixel reference height, trial a main stroke around 3–5 screen pixels, with teeth around 6–10 pixels; scale for display density, not geographic zoom. Use hand variation gently enough that gaps and teeth still read. These are trial dimensions. [I] [HOI-PLAN] [D0013] [D0094]

Only the claimed-front segments supplied by the view may join. Break the stroke where knowledge ends. Keep the source status on each segment; a mixed front must not acquire one misleading global ink state or date. Teeth face the reported enemy. Suppress administrative lines underneath, and leave gaps around captions without shifting a headquarters. An empty claim must not be bridged because the geometry would look prettier. [I] [D0094] [PRESENTATION]

### 8.3 Plan arrows

Make a commander's draft a **broad outlined, hatched ribbon** whose head reads at theatre scale. Start a visual trial with an arrow body roughly three to five times the visible weight of a major river. Keep hatching at constant screen spacing; widen the ribbon by importance/selection, not by implying a precise corridor of occupied land. An approved arrow may fill, but approval does not establish progress. [I] [HOI-PLAN] [UG] [D0094] [PRESENTATION]

Keep the president's blue pencil thin and numbered above it. Support requests remain dotted and name the requested post. Opening a plan emphasises its relevant marks while retaining context; hover/focus reveals the route and author. Never animate a moving arrowhead along an operation from elapsed time. The renderer must not infer marching progress, draw a new route, or offer an order outside the existing grammar. [I] [PRESENTATION] [D0094]

### 8.4 Labels and evidence

Use **priority and disclosure**, rather than smaller text everywhere. Reserve space first for received report signs, fronts and active plan marks; then their captions, important towns and rivers; then region names. Preserve protected nation labels. Yield or reposition a label, never a reported anchor. Headquarters sharing a place get a compact group caption with individual authors/dates available on focus. [I] [CK3-DIARY] [CO2-G] [PRESENTATION]

Keep faint administrative boundaries below the operational layer. Use manuscript lettering for the map, but offer readable transcription in the evidence note and text map. A pointer or keyboard focus should answer holder/contested/no report, who said it, and as of when, then open the actual paper. Source date and receipt date must not silently become interchangeable. Avoid additional numerical precision simply because another game's tooltip contains it. [I] [WITE2-UI] [CK3-R] [D0094] [PRESENTATION]

### 8.5 Motion, pointer response and sound

Use **brief, caused changes**. Trial a 250–450 ms draw-on for a new report mark, with the affected control/front change following the report's receipt. This is an animation proposal, not a timing fact from another game. During a run of days, several nearby arrivals can share a clear sequence; an unchanged old mark stays still. A region's pointer warmth is a local reading aid, not a persistent pulsing alert. [I] [RC-R] [D0094]

Auto-plot received evidence. Do not require the player to drag every last-known position, use a ruler repeatedly, or physically handle a pencil to execute an ordinary act. Selection and closing a paper must not pass the same click through to a plan edit. Reduced motion shows the settled mark and its arrival notice immediately; the text record carries the same event. Existing paper/pen/sounder feedback can acknowledge acts, with mute losing no information. Sound must never reveal an unreported fight or celebrate a sensitive event. [I] [HF-R] [RG-R] [CK3-R] [PRESENTATION] [ASSETS]

### 8.6 Zoom

Keep **one manuscript, three working scales**. This adapts semantic zoom independently; it does not recreate CK3's parchment, Victoria's table, Civ VI's sprite art or a Total War landscape. [I] [CK3-DIARY] [V3-STEAM] [CIV6-ART] [D0093]

| Working scale | Main question | Keep prominent | Suppress or defer |
|---|---|---|---|
| Fit the theatres | Where does the staff believe each side holds ground? | Full control fields, major claimed fronts, large rivers, major region/nation names and important headquarters groups | Minor place names, county lines, fine hachures and routine caption detail |
| Eastern opening / theatre | Which people's reports and plans matter here? | Headquarters, sources/dates on inspection, active arrows, towns, rail and readable relief | Full stacks of unrelated captions; minor border detail beneath a plan |
| Close plan review | What does this commander's route and evidence actually say? | Relevant route, validated handles, terrain/rail detail that really exists, nearby report sources | Magnification beyond available geographic detail; invented roads or decorative filler |

Use continuous zoom with modest hysteresis around label thresholds so a small wheel movement does not flicker names. Preserve selection, claim meaning and keyboard focus through every scale. The widest view must keep the South's red visible; the opening can remain the authored Eastern theatre. Stop the close range where the data still makes a useful map. More camera magnification cannot create more evidence. [I] [CO2-G] [CK3-DIARY] [PRESENTATION] [D0094]

## 9. What to avoid

- **Copying a game's palette, ornament, type treatment or terrain artwork.** The references establish techniques. The accepted engineer's manuscript and its cleared sources remain the visual direction. [I] [D0093] [ASSETS]
- **Equating territory colour with certainty.** Ownership, corroboration, age and no report require different cues. A confident neutral claim is not the same as an unknown region. [I] [D0094] [CIV6-F]
- **Showing live truth as atmosphere.** Traffic, weather, battles, moving friendly formations and inferred progress may disclose facts absent from reports. [I] [V3-STEAM] [NAP-R3] [D0013]
- **Continuous decorative motion.** Flicker, shimmer, fake marching and persistent pulses consume attention without explaining receipt of evidence. [I] [HF-R] [EU5-F]
- **Handwork as a tax.** Repeated ruler measurements or token relocation can consume the president's time without creating a useful decision. [I] [HF-R] [RG-R]
- **A false continuous front.** Do not connect missing claims, disguise mixed source status or turn a local concentration of signs into a line the view did not supply. [I] [D0094]
- **Equal prominence for every layer.** Many small regions or counters can bury the country. Give an operational question priority, with deeper evidence available by inspection. [I] [SC-F] [WITE2-R] [CO2-G]
- **Fading until meaning disappears.** Civ VI's fog complaints show why a reduced palette can be hard to parse. Old claims still need readable dates, boundaries and text access. [I] [CIV6-F] [PRESENTATION]
- **Ground commands hidden inside map convenience.** A beautiful draggable arrow is still wrong if it moves a division or bypasses a person. [I] [HARD-RULES] [PRESENTATION]

## 10. Findings outside the visual question and limits

The most valuable additions are information precedents, not a claim of novelty: Radio Commander explicitly makes friendly locations uncertain, and Command Ops 2 documents last-observed enemy contacts. This qualifies the earlier Civil War survey's broad “not found” statement if it is read beyond that survey's scope; it does not warrant editing that note in R31. [RC-R] [CO2-G] [ACW-NOTE]

The comparisons do not prove that manuscript texture improves decision quality, that a particular saturation is accessible, or that any proposed animation meets the renderer's budget. They justify small future visual trials. No code, canon decision, asset, palette implementation or extra validation campaign is authorised by this note. R30's acceptance remains separate.

Exact zoom limits, live pointer feel and sound are incompletely documented for several games above. Those limits are stated per entry rather than filled from memory. The recommendations do not depend on inventing those missing details.

## Sources

All external pages and image URLs below were read or inspected on **2026-11-18**, except entries explicitly marked **[S]**, whose search result alone was read on that date. Screenshot references identify the visual evidence, not a licence to reuse it. Primary galleries are publisher-controlled material; reviewer and player comments are attributed experience. A reproduced manual or diary is identified as such.

### Project sources

- **D0013** — Accepted staff-map decision. [Source](../decisions/0013-the-staff-map.md). Read/inspected 2026-11-18.
- **D0093** — Accepted manuscript/table direction. [Source](../decisions/0093-the-map-is-the-engineers-manuscript-on-the-table.md). Read/inspected 2026-11-18.
- **D0094** — Accepted claimed-control and colour decision; current opening-ink exception included. [Source](../decisions/0094-claimed-control-on-the-presidents-map.md). Read/inspected 2026-11-18.
- **HARD-RULES** — Project hard rules and working style. [Source](../../CLAUDE.md). Read/inspected 2026-11-18.
- **PRESENTATION** — Presentation proposal; accepted records take precedence. [Source](../design/PRESENTATION.md). Read/inspected 2026-11-18.
- **ASSETS** — Asset briefs and sensitive-history limits. [Source](../design/ASSETS.md). Read/inspected 2026-11-18.
- **ACW-NOTE** — Earlier mechanics research note, context only. [Source](2026-11-14-civil-war-games.md). Read/inspected 2026-11-18.

### Publisher galleries

- **GT** — Grand Tactician: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/654890/). Read/inspected 2026-11-18.
- **UG** — Ultimate General: Civil War: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/502520/). Read/inspected 2026-11-18.
- **SC** — Strategic Command: American Civil War: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/1966130/). Read/inspected 2026-11-18.
- **CW2** — Civil War II: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/306630/). Read/inspected 2026-11-18.
- **RG** — Radio General: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/1011610/). Read/inspected 2026-11-18.
- **HF** — HighFleet: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/1434950/). Read/inspected 2026-11-18.
- **BULGE** — Battle of the Bulge: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/365560/). Read/inspected 2026-11-18.
- **MOSCOW** — Drive on Moscow: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/520610/). Read/inspected 2026-11-18.
- **HOI** — Hearts of Iron IV: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/394360/). Read/inspected 2026-11-18.
- **V3** — Victoria 3: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/529340/). Read/inspected 2026-11-18.
- **EU4** — Europa Universalis IV: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/236850/). Read/inspected 2026-11-18.
- **EU5** — Europa Universalis V: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/3450310/). Read/inspected 2026-11-18.
- **CK3** — Crusader Kings III: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/1158310/). Read/inspected 2026-11-18.
- **IR** — Imperator: Rome: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/859580/). Read/inspected 2026-11-18.
- **NAP** — Napoleon: Total War: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/34030/). Read/inspected 2026-11-18.
- **SHOGUN** — Total War: Shogun 2: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/34330/). Read/inspected 2026-11-18.
- **TK** — Total War: Three Kingdoms: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/779340/). Read/inspected 2026-11-18.
- **CIV6** — Civilization VI: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/289070/). Read/inspected 2026-11-18.
- **UOC2** — Unity of Command II: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/809230/). Read/inspected 2026-11-18.
- **WITE2** — War in the East 2: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/1775550/). Read/inspected 2026-11-18.
- **OW** — Old World: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/597180/). Read/inspected 2026-11-18.
- **RC** — Radio Commander: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/871530/). Read/inspected 2026-11-18.
- **CO2** — Command Ops 2: publisher description and screenshot gallery. [Source](https://store.steampowered.com/app/521800/). Read/inspected 2026-11-18.

### Developer material, reviews and discussions

- **NAP-R3** — GameSpot review, March 2010: campaign seasons, scenery and scope. [Source](https://www.gamespot.com/reviews/napoleon-total-war-review/1900-6252611/). Read 2026-11-18.
- **GT-R** — Let's Talk About Wargames, 2021 review. [Source](https://letstalkaboutwargames.wordpress.com/2021/11/22/grand-tactician-the-civil-war-1861-1865-review/). Read/inspected 2026-11-18.
- **GT-DEV** — Developer article on historical-style maps and staff papers. [Source](https://www.grandtactician.com/thecivilwar/blog/articles/gen-l-a-telegram). Read/inspected 2026-11-18.
- **GT-F** — Steam player discussion: campaign pan and zoom performance. [Source](https://steamcommunity.com/app/654890/discussions/0/838376971028318661/). Read/inspected 2026-11-18.
- **UG-R** — Wargamer review: battlefield presentation and camera. [Source](https://www.wargamer.com/ultimate-general-civil-war/review). Read/inspected 2026-11-18.
- **SC-F** — Steam user reviews: theatre scale, overview and density. [Source](https://steamcommunity.com/app/1966130/reviews/?browsefilter=toprated). Read/inspected 2026-11-18.
- **CW2-R2** — Armchair General late-beta preview, 2013. [Source](https://armchairgeneral.com/civil-war-ii-pc-game-preview.htm). Read/inspected 2026-11-18.
- **RG-R** — Save or Quit review, 2020. [Source](https://saveorquit.com/2020/05/01/review-radio-general/). Read/inspected 2026-11-18.
- **HF-R** — Rock Paper Shotgun review, 2021. [Source](https://www.rockpapershotgun.com/highfleet-review). Read/inspected 2026-11-18.
- **HF-GUIDE** — Community guide: drawing and measurement tools. [Source](https://steamcommunity.com/sharedfiles/filedetails/?id=2580804883). Read/inspected 2026-11-18.
- **BULGE-R** — 3rd-strike review, 2013. [Source](https://3rd-strike.com/battle-of-the-bulge-review/). Read/inspected 2026-11-18.
- **MOSCOW-R2** — BoardGameQuest iPad review, 2014. [Source](https://www.boardgamequest.com/drive-on-moscow-ipad-review/). Read/inspected 2026-11-18.
- **HOI-PLAN** — Developer diary 45, 19 February 2016, reproduced in official Steam news archive. [Source](https://store.steampowered.com/news/posts/?appids=394360&enddate=1458300685&feed=steam_community_announcements). Read/inspected 2026-11-18.
- **HOI-R** — Prima Games review, 2016. [Source](https://primagames.com/gaming/hearts-iron-iv-review). Read/inspected 2026-11-18.
- **V3-STEAM** — Official Steam archive containing developer diaries 49 and 50, June 2022. [Source](https://store.steampowered.com/news/posts/?appids=529340&enddate=1655395263&feed=steam_community_announcements). Read/inspected 2026-11-18.
- **V3-R** — PCGamesN launch review, 2022. [Source](https://www.pcgamesn.com/victoria-3/review). Read/inspected 2026-11-18.
- **V3-PREVIEW** — PCGamesN hands-on preview, 2022. [Source](https://www.pcgamesn.com/victoria-3/impressions-hands-on-preview). Read/inspected 2026-11-18.
- **EU4-R** — GameSpot review, 2013. [Source](https://www.gamespot.com/reviews/europa-universalis-iv-review/1900-6413174/). Read/inspected 2026-11-18.
- **EU5-F** — Steam map discussion, November 2025; conflicting player opinions. [Source](https://steamcommunity.com/app/3450310/discussions/0/684112192552984571/). Read/inspected 2026-11-18.
- **IR-R** — Save or Quit launch review, 2019. [Source](https://saveorquit.com/2019/06/03/review-imperator-rome/). Read/inspected 2026-11-18.
- **IR-F** — Cablenexus's Steam user review. [Source](https://steamcommunity.com/id/cablenexus/recommended/859580). Read/inspected 2026-11-18.
- **SHOGUN-R** — Rock Paper Shotgun review, 2011. [Source](https://www.rockpapershotgun.com/wot-i-think-total-war-shogun-2). Read/inspected 2026-11-18.
- **TK-R** — Rock Paper Shotgun review, 2019. [Source](https://www.rockpapershotgun.com/total-war-three-kingdoms-review). Read/inspected 2026-11-18.
- **CIV6-ART** — Sam Gauss, artist's own account and illustrated production sheets. [Source](https://www.samgauss.com/civilization-6.html). Read/inspected 2026-11-18.
- **CIV6-PORTFOLIO** — Sam Gauss, ArtStation strategic-view portfolio. [Source](https://www.artstation.com/artwork/bZqrd). Read/inspected 2026-11-18.
- **CIV6-F** — CivFanatics discussion begun November 2016. [Source](https://forums.civfanatics.com/threads/anyone-else-in-love-with-strategic-view-in-civ-6.604874/). Read/inspected 2026-11-18.
- **UOC2-R** — Explorminate review, 2019. [Source](https://explorminate.org/unity-of-command-ii-review/). Read/inspected 2026-11-18.
- **WITE2-R** — No Dice No Glory first look, 2021. [Source](https://nodicenoglory.com/war-in-the-east-2-first-look/). Read/inspected 2026-11-18.
- **WITE2-UI** — Interface chapter of the manual reproduced by Eric Dornshuld; not a publisher-hosted original. [Source](https://dornshuld.com/rules/wite2/6-0.html). Read/inspected 2026-11-18.
- **OW-R** — TL;DR Movie Reviews early-access first look, May 2020. [Source](https://tldrmoviereviews.com/2020/05/11/video-game-review-old-world-old-world-first-look/). Read/inspected 2026-11-18.
- **RC-R** — Rock Paper Shotgun review, 2019. [Source](https://www.rockpapershotgun.com/radio-commander-review). Read/inspected 2026-11-18.
- **CO2-G** — Steam community guide: counter scaling and reported contacts. [Source](https://steamcommunity.com/sharedfiles/filedetails/?id=1223954053). Read/inspected 2026-11-18.
- **HOI-ZOOM** — PC Gamer pre-release preview; page read with web reader after Firecrawl timeout. [Source](https://www.pcgamer.com/hearts-of-iron-iv-streamlined-ww2-strategy/). Read/inspected 2026-11-18.
- **CK3-DIARY** — Developer diary 25 reproduced in its Reddit discussion, May 2020; substantive text read. [Source](https://www.reddit.com/r/CrusaderKings/comments/gdwwbw/). Read/inspected 2026-11-18.
- **CK3-R** — PCGamesN launch review, August 2020; read with web reader. [Source](https://www.pcgamesn.com/crusader-kings-3/review-ck3). Read/inspected 2026-11-18.
- **CK3-F-READ** — Player discussion of the tabletop view, April 2024; read with web reader. [Source](https://www.reddit.com/r/ck3/comments/1buh7ot/). Read/inspected 2026-11-18.
- **CO2-F-READ** — Player discussion, January 2021; read with web reader. [Source](https://www.reddit.com/r/computerwargames/comments/kzkhra/opinions_about_command_ops_2/). Read/inspected 2026-11-18.
- **CIV6-SV-POST** — Strategic-view screenshot and player discussion, October 2016; discussion read, linked image CDN download denied. [Source](https://www.reddit.com/r/civ/comments/56r0mw/). Read/inspected 2026-11-18.
- **GT-MANUAL-S** — [S] Official manual: fog-of-war visualisation excerpt only; full PDF retrieval failed. [Source](https://cdn.cloudflare.steamstatic.com/steam/apps/654890/manuals/Grand_Tactician_Manual.pdf). Search read 2026-11-18.
- **CW2-MANUAL-S** — [S] Official manual: zoom controls excerpt only; PDF retrieval timed out. [Source](https://ftp.matrixgames.com/pub/CivilWarII/Civil_War_II_Manual%5BE-Book%5D.pdf). Search read 2026-11-18.
- **EU4-F-S** — [S] Political map view, 2013; search snippet only. [Source](https://forum.paradoxplaza.com/forum/threads/political-map-view.703086/). Search read 2026-11-18.

### Inspected map images

- **GT-SHOT** — Grand Tactician: inspected map screenshot, gallery index 1. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/654890/ss_5cd0880ab5a677db21379ad055ca97ab3e02ebc0.1920x1080.jpg?t=1705830490). Read/inspected 2026-11-18.
- **UG-SHOT** — Ultimate General: Civil War: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/502520/ss_382ea4b9b5878187f883a0e3f8a784e95671a291.1920x1080.jpg?t=1714903654). Read/inspected 2026-11-18.
- **SC-SHOT** — Strategic Command: American Civil War: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1966130/ss_d2e68017b0ee4c6b4b646a507e88a0842efe76ad.1920x1080.jpg?t=1764538371). Read/inspected 2026-11-18.
- **CW2-SHOT** — Civil War II: inspected map screenshot, gallery index 2. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_805d7098c926396e39d2f8ea17494e4e3547b3cd.1920x1080.jpg?t=1718872464). Read/inspected 2026-11-18.
- **RG-SHOT** — Radio General: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1011610/ss_aba45fb1896b201c623ae370e29d9457ddc90d95.1920x1080.jpg?t=1787344578). Read/inspected 2026-11-18.
- **HF-SHOT** — HighFleet: inspected map screenshot, gallery index 34. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1434950/ss_caccb67d5b3dd48070d7c7aa906684f8e81ff6a2.1920x1080.jpg?t=1769544197). Read/inspected 2026-11-18.
- **BULGE-SHOT** — Battle of the Bulge: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/365560/ss_f72ccb053a5010bf5c495721ba2255242ace6f64.1920x1080.jpg?t=1726823784). Read/inspected 2026-11-18.
- **MOSCOW-SHOT** — Drive on Moscow: inspected map screenshot, gallery index 3. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/520610/ss_3022a1973963feb26f845a9048e436305a18ae6e.1920x1080.jpg?t=1575552857). Read/inspected 2026-11-18.
- **HOI-SHOT** — Hearts of Iron IV: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/394360/ss_fc239db7ed07e8ec4e6440cd0c6ced88a955d90e.1920x1080.jpg?t=1794491980). Read/inspected 2026-11-18.
- **V3-SHOT** — Victoria 3: inspected map screenshot, gallery index 11. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/529340/04236626eaedf33a2780869b4381df7573e5042d/ss_04236626eaedf33a2780869b4381df7573e5042d.1920x1080.jpg?t=1793869008). Read/inspected 2026-11-18.
- **EU4-SHOT** — Europa Universalis IV: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/236850/ss_d3ca5ede1b13ce7c1782ddd2a182d313f914d937.1920x1080.jpg?t=1790873960). Read/inspected 2026-11-18.
- **EU5-SHOT** — Europa Universalis V: inspected map screenshot, gallery index 1. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3450310/9113ac70bb3031e812d75718e21885b5a32b6670/ss_9113ac70bb3031e812d75718e21885b5a32b6670.1920x1080.jpg?t=1793206771). Read/inspected 2026-11-18.
- **CK3-SHOT** — Crusader Kings III: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1158310/ba7f77f7eb96d48f267e970583ddaa32b3b5eb98/ss_ba7f77f7eb96d48f267e970583ddaa32b3b5eb98.1920x1080.jpg?t=1794934751). Read/inspected 2026-11-18.
- **IR-SHOT** — Imperator: Rome: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/859580/ss_8518bb1ab4d0950be1cf108d70e553e842ac2ec2.1920x1080.jpg?t=1714031927). Read/inspected 2026-11-18.
- **NAP-SHOT** — Napoleon: Total War: inspected map screenshot, gallery index 4. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/34030/ss_bfed43a65786e3b004a5befb7fac5390f4390be0.1920x1080.jpg?t=1765308018). Read/inspected 2026-11-18.
- **SHOGUN-SHOT** — Total War: Shogun 2: inspected map screenshot, gallery index 24. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/201270/ss_e135383a9f952f185aca67e876e54df999e6f486.1920x1080.jpg?t=1792079287). Read/inspected 2026-11-18.
- **TK-SHOT** — Total War: Three Kingdoms: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/779340/ss_82b431d0e99eff54583fb4abe17bf805d1fa1a03.1920x1080.jpg?t=1780332718). Read/inspected 2026-11-18.
- **UOC2-SHOT** — Unity of Command II: inspected map screenshot, gallery index 3. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/809230/ss_02a54a1bb903d0065034ab953c5caef269532aed.1920x1080.jpg?t=1793164720). Read/inspected 2026-11-18.
- **WITE2-SHOT** — War in the East 2: inspected map screenshot, gallery index 3. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1775550/ss_7d1d5ca7c7f90235624bc4af3c7ac35795d7533c.1920x1080.jpg?t=1756304202). Read/inspected 2026-11-18.
- **OW-SHOT** — Old World: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/597180/ca6e1200aa0f99311005344121fc5e829cebb5eb/ss_ca6e1200aa0f99311005344121fc5e829cebb5eb.1920x1080.jpg?t=1793270361). Read/inspected 2026-11-18.
- **RC-SHOT** — Radio Commander: inspected map screenshot, gallery index 2. [Source](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/871530/ss_237554937464d63dd2661d2113ca4d7f5d660033.1920x1080.jpg?t=1779801344). Read/inspected 2026-11-18.
- **CO2-SHOT** — Command Ops 2: inspected map screenshot, gallery index 1. [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/521800/ss_7dadd12db2e576765832ca705992641b0c38644b.1920x1080.jpg?t=1770078518). Read/inspected 2026-11-18.

[GT]: https://store.steampowered.com/app/654890/ "Read 2026-11-18: Grand Tactician: publisher description and screenshot gallery"
[UG]: https://store.steampowered.com/app/502520/ "Read 2026-11-18: Ultimate General: Civil War: publisher description and screenshot gallery"
[SC]: https://store.steampowered.com/app/1966130/ "Read 2026-11-18: Strategic Command: American Civil War: publisher description and screenshot gallery"
[CW2]: https://store.steampowered.com/app/306630/ "Read 2026-11-18: Civil War II: publisher description and screenshot gallery"
[RG]: https://store.steampowered.com/app/1011610/ "Read 2026-11-18: Radio General: publisher description and screenshot gallery"
[HF]: https://store.steampowered.com/app/1434950/ "Read 2026-11-18: HighFleet: publisher description and screenshot gallery"
[BULGE]: https://store.steampowered.com/app/365560/ "Read 2026-11-18: Battle of the Bulge: publisher description and screenshot gallery"
[MOSCOW]: https://store.steampowered.com/app/520610/ "Read 2026-11-18: Drive on Moscow: publisher description and screenshot gallery"
[HOI]: https://store.steampowered.com/app/394360/ "Read 2026-11-18: Hearts of Iron IV: publisher description and screenshot gallery"
[V3]: https://store.steampowered.com/app/529340/ "Read 2026-11-18: Victoria 3: publisher description and screenshot gallery"
[EU4]: https://store.steampowered.com/app/236850/ "Read 2026-11-18: Europa Universalis IV: publisher description and screenshot gallery"
[EU5]: https://store.steampowered.com/app/3450310/ "Read 2026-11-18: Europa Universalis V: publisher description and screenshot gallery"
[CK3]: https://store.steampowered.com/app/1158310/ "Read 2026-11-18: Crusader Kings III: publisher description and screenshot gallery"
[IR]: https://store.steampowered.com/app/859580/ "Read 2026-11-18: Imperator: Rome: publisher description and screenshot gallery"
[NAP]: https://store.steampowered.com/app/34030/ "Read 2026-11-18: Napoleon: Total War: publisher description and screenshot gallery"
[SHOGUN]: https://store.steampowered.com/app/34330/ "Read 2026-11-18: Total War: Shogun 2: publisher description and screenshot gallery"
[TK]: https://store.steampowered.com/app/779340/ "Read 2026-11-18: Total War: Three Kingdoms: publisher description and screenshot gallery"
[CIV6]: https://store.steampowered.com/app/289070/ "Read 2026-11-18: Civilization VI: publisher description and screenshot gallery"
[UOC2]: https://store.steampowered.com/app/809230/ "Read 2026-11-18: Unity of Command II: publisher description and screenshot gallery"
[WITE2]: https://store.steampowered.com/app/1775550/ "Read 2026-11-18: War in the East 2: publisher description and screenshot gallery"
[OW]: https://store.steampowered.com/app/597180/ "Read 2026-11-18: Old World: publisher description and screenshot gallery"
[RC]: https://store.steampowered.com/app/871530/ "Read 2026-11-18: Radio Commander: publisher description and screenshot gallery"
[CO2]: https://store.steampowered.com/app/521800/ "Read 2026-11-18: Command Ops 2: publisher description and screenshot gallery"
[GT-R]: https://letstalkaboutwargames.wordpress.com/2021/11/22/grand-tactician-the-civil-war-1861-1865-review/ "Read 2026-11-18: Let's Talk About Wargames, 2021 review"
[GT-DEV]: https://www.grandtactician.com/thecivilwar/blog/articles/gen-l-a-telegram "Read 2026-11-18: Developer article on historical-style maps and staff papers"
[GT-F]: https://steamcommunity.com/app/654890/discussions/0/838376971028318661/ "Read 2026-11-18: Steam player discussion: campaign pan and zoom performance"
[UG-R]: https://www.wargamer.com/ultimate-general-civil-war/review "Read 2026-11-18: Wargamer review: battlefield presentation and camera"
[SC-F]: https://steamcommunity.com/app/1966130/reviews/?browsefilter=toprated "Read 2026-11-18: Steam user reviews: theatre scale, overview and density"
[CW2-R2]: https://armchairgeneral.com/civil-war-ii-pc-game-preview.htm "Read 2026-11-18: Armchair General late-beta preview, 2013"
[RG-R]: https://saveorquit.com/2020/05/01/review-radio-general/ "Read 2026-11-18: Save or Quit review, 2020"
[HF-R]: https://www.rockpapershotgun.com/highfleet-review "Read 2026-11-18: Rock Paper Shotgun review, 2021"
[HF-GUIDE]: https://steamcommunity.com/sharedfiles/filedetails/?id=2580804883 "Read 2026-11-18: Community guide: drawing and measurement tools"
[BULGE-R]: https://3rd-strike.com/battle-of-the-bulge-review/ "Read 2026-11-18: 3rd-strike review, 2013"
[MOSCOW-R2]: https://www.boardgamequest.com/drive-on-moscow-ipad-review/ "Read 2026-11-18: BoardGameQuest iPad review, 2014"
[HOI-PLAN]: https://store.steampowered.com/news/posts/?appids=394360&enddate=1458300685&feed=steam_community_announcements "Read 2026-11-18: Developer diary 45, 19 February 2016, reproduced in official Steam news archive"
[HOI-R]: https://primagames.com/gaming/hearts-iron-iv-review "Read 2026-11-18: Prima Games review, 2016"
[V3-STEAM]: https://store.steampowered.com/news/posts/?appids=529340&enddate=1655395263&feed=steam_community_announcements "Read 2026-11-18: Official Steam archive containing developer diaries 49 and 50, June 2022"
[V3-R]: https://www.pcgamesn.com/victoria-3/review "Read 2026-11-18: PCGamesN launch review, 2022"
[V3-PREVIEW]: https://www.pcgamesn.com/victoria-3/impressions-hands-on-preview "Read 2026-11-18: PCGamesN hands-on preview, 2022"
[EU4-R]: https://www.gamespot.com/reviews/europa-universalis-iv-review/1900-6413174/ "Read 2026-11-18: GameSpot review, 2013"
[EU5-F]: https://steamcommunity.com/app/3450310/discussions/0/684112192552984571/ "Read 2026-11-18: Steam map discussion, November 2025; conflicting player opinions"
[IR-R]: https://saveorquit.com/2019/06/03/review-imperator-rome/ "Read 2026-11-18: Save or Quit launch review, 2019"
[IR-F]: https://steamcommunity.com/id/cablenexus/recommended/859580 "Read 2026-11-18: Cablenexus's Steam user review"
[SHOGUN-R]: https://www.rockpapershotgun.com/wot-i-think-total-war-shogun-2 "Read 2026-11-18: Rock Paper Shotgun review, 2011"
[TK-R]: https://www.rockpapershotgun.com/total-war-three-kingdoms-review "Read 2026-11-18: Rock Paper Shotgun review, 2019"
[CIV6-ART]: https://www.samgauss.com/civilization-6.html "Read 2026-11-18: Sam Gauss, artist's own account and illustrated production sheets"
[CIV6-PORTFOLIO]: https://www.artstation.com/artwork/bZqrd "Read 2026-11-18: Sam Gauss, ArtStation strategic-view portfolio"
[CIV6-F]: https://forums.civfanatics.com/threads/anyone-else-in-love-with-strategic-view-in-civ-6.604874/ "Read 2026-11-18: CivFanatics discussion begun November 2016"
[UOC2-R]: https://explorminate.org/unity-of-command-ii-review/ "Read 2026-11-18: Explorminate review, 2019"
[WITE2-R]: https://nodicenoglory.com/war-in-the-east-2-first-look/ "Read 2026-11-18: No Dice No Glory first look, 2021"
[WITE2-UI]: https://dornshuld.com/rules/wite2/6-0.html "Read 2026-11-18: Interface chapter of the manual reproduced by Eric Dornshuld; not a publisher-hosted original"
[OW-R]: https://tldrmoviereviews.com/2020/05/11/video-game-review-old-world-old-world-first-look/ "Read 2026-11-18: TL;DR Movie Reviews early-access first look, May 2020"
[RC-R]: https://www.rockpapershotgun.com/radio-commander-review "Read 2026-11-18: Rock Paper Shotgun review, 2019"
[CO2-G]: https://steamcommunity.com/sharedfiles/filedetails/?id=1223954053 "Read 2026-11-18: Steam community guide: counter scaling and reported contacts"
[HOI-ZOOM]: https://www.pcgamer.com/hearts-of-iron-iv-streamlined-ww2-strategy/ "Read 2026-11-18: PC Gamer pre-release preview; page read with web reader after Firecrawl timeout"
[CK3-DIARY]: https://www.reddit.com/r/CrusaderKings/comments/gdwwbw/ "Read 2026-11-18: Developer diary 25 reproduced in its Reddit discussion, May 2020; substantive text read"
[CK3-R]: https://www.pcgamesn.com/crusader-kings-3/review-ck3 "Read 2026-11-18: PCGamesN launch review, August 2020; read with web reader"
[CK3-F-READ]: https://www.reddit.com/r/ck3/comments/1buh7ot/ "Read 2026-11-18: Player discussion of the tabletop view, April 2024; read with web reader"
[CO2-F-READ]: https://www.reddit.com/r/computerwargames/comments/kzkhra/opinions_about_command_ops_2/ "Read 2026-11-18: Player discussion, January 2021; read with web reader"
[CIV6-SV-POST]: https://www.reddit.com/r/civ/comments/56r0mw/ "Read 2026-11-18: Strategic-view screenshot and player discussion, October 2016; discussion read, linked image CDN download denied"
[GT-MANUAL-S]: https://cdn.cloudflare.steamstatic.com/steam/apps/654890/manuals/Grand_Tactician_Manual.pdf "Read 2026-11-18: [S] Official manual: fog-of-war visualisation excerpt only; full PDF retrieval failed"
[CW2-MANUAL-S]: https://ftp.matrixgames.com/pub/CivilWarII/Civil_War_II_Manual%5BE-Book%5D.pdf "Read 2026-11-18: [S] Official manual: zoom controls excerpt only; PDF retrieval timed out"
[EU4-F-S]: https://forum.paradoxplaza.com/forum/threads/political-map-view.703086/ "Read 2026-11-18: [S] Political map view, 2013; search snippet only"
[D0013]: ../decisions/0013-the-staff-map.md "Read 2026-11-18: Accepted staff-map decision"
[D0093]: ../decisions/0093-the-map-is-the-engineers-manuscript-on-the-table.md "Read 2026-11-18: Accepted manuscript/table direction"
[D0094]: ../decisions/0094-claimed-control-on-the-presidents-map.md "Read 2026-11-18: Accepted claimed-control and colour decision; current opening-ink exception included"
[HARD-RULES]: ../../CLAUDE.md "Read 2026-11-18: Project hard rules and working style"
[PRESENTATION]: ../design/PRESENTATION.md "Read 2026-11-18: Presentation proposal; accepted records take precedence"
[ASSETS]: ../design/ASSETS.md "Read 2026-11-18: Asset briefs and sensitive-history limits"
[ACW-NOTE]: 2026-11-14-civil-war-games.md "Read 2026-11-18: Earlier mechanics research note, context only"
[NAP-R3]: https://www.gamespot.com/reviews/napoleon-total-war-review/1900-6252611/ "Read 2026-11-18: GameSpot review, March 2010"
[GT-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/654890/ss_5cd0880ab5a677db21379ad055ca97ab3e02ebc0.1920x1080.jpg?t=1705830490 "Read 2026-11-18: Grand Tactician: inspected map screenshot, gallery index 1"
[UG-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/502520/ss_382ea4b9b5878187f883a0e3f8a784e95671a291.1920x1080.jpg?t=1714903654 "Read 2026-11-18: Ultimate General: Civil War: inspected map screenshot, gallery index 1"
[SC-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1966130/ss_d2e68017b0ee4c6b4b646a507e88a0842efe76ad.1920x1080.jpg?t=1764538371 "Read 2026-11-18: Strategic Command: American Civil War: inspected map screenshot, gallery index 2"
[CW2-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306630/ss_805d7098c926396e39d2f8ea17494e4e3547b3cd.1920x1080.jpg?t=1718872464 "Read 2026-11-18: Civil War II: inspected map screenshot, gallery index 2"
[RG-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1011610/ss_aba45fb1896b201c623ae370e29d9457ddc90d95.1920x1080.jpg?t=1787344578 "Read 2026-11-18: Radio General: inspected map screenshot, gallery index 1"
[HF-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1434950/ss_caccb67d5b3dd48070d7c7aa906684f8e81ff6a2.1920x1080.jpg?t=1769544197 "Read 2026-11-18: HighFleet: inspected map screenshot, gallery index 34"
[BULGE-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/365560/ss_f72ccb053a5010bf5c495721ba2255242ace6f64.1920x1080.jpg?t=1726823784 "Read 2026-11-18: Battle of the Bulge: inspected map screenshot, gallery index 2"
[MOSCOW-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/520610/ss_3022a1973963feb26f845a9048e436305a18ae6e.1920x1080.jpg?t=1575552857 "Read 2026-11-18: Drive on Moscow: inspected map screenshot, gallery index 3"
[HOI-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/394360/ss_fc239db7ed07e8ec4e6440cd0c6ced88a955d90e.1920x1080.jpg?t=1794491980 "Read 2026-11-18: Hearts of Iron IV: inspected map screenshot, gallery index 2"
[V3-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/529340/04236626eaedf33a2780869b4381df7573e5042d/ss_04236626eaedf33a2780869b4381df7573e5042d.1920x1080.jpg?t=1793869008 "Read 2026-11-18: Victoria 3: inspected map screenshot, gallery index 11"
[EU4-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/236850/ss_d3ca5ede1b13ce7c1782ddd2a182d313f914d937.1920x1080.jpg?t=1790873960 "Read 2026-11-18: Europa Universalis IV: inspected map screenshot, gallery index 1"
[EU5-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3450310/9113ac70bb3031e812d75718e21885b5a32b6670/ss_9113ac70bb3031e812d75718e21885b5a32b6670.1920x1080.jpg?t=1793206771 "Read 2026-11-18: Europa Universalis V: inspected map screenshot, gallery index 1"
[CK3-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1158310/ba7f77f7eb96d48f267e970583ddaa32b3b5eb98/ss_ba7f77f7eb96d48f267e970583ddaa32b3b5eb98.1920x1080.jpg?t=1794934751 "Read 2026-11-18: Crusader Kings III: inspected map screenshot, gallery index 2"
[IR-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/859580/ss_8518bb1ab4d0950be1cf108d70e553e842ac2ec2.1920x1080.jpg?t=1714031927 "Read 2026-11-18: Imperator: Rome: inspected map screenshot, gallery index 1"
[NAP-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/34030/ss_bfed43a65786e3b004a5befb7fac5390f4390be0.1920x1080.jpg?t=1765308018 "Read 2026-11-18: Napoleon: Total War: inspected map screenshot, gallery index 4"
[SHOGUN-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/201270/ss_e135383a9f952f185aca67e876e54df999e6f486.1920x1080.jpg?t=1792079287 "Read 2026-11-18: Total War: Shogun 2: inspected map screenshot, gallery index 24"
[TK-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/779340/ss_82b431d0e99eff54583fb4abe17bf805d1fa1a03.1920x1080.jpg?t=1780332718 "Read 2026-11-18: Total War: Three Kingdoms: inspected map screenshot, gallery index 2"
[UOC2-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/809230/ss_02a54a1bb903d0065034ab953c5caef269532aed.1920x1080.jpg?t=1793164720 "Read 2026-11-18: Unity of Command II: inspected map screenshot, gallery index 3"
[WITE2-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1775550/ss_7d1d5ca7c7f90235624bc4af3c7ac35795d7533c.1920x1080.jpg?t=1756304202 "Read 2026-11-18: War in the East 2: inspected map screenshot, gallery index 3"
[OW-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/597180/ca6e1200aa0f99311005344121fc5e829cebb5eb/ss_ca6e1200aa0f99311005344121fc5e829cebb5eb.1920x1080.jpg?t=1793270361 "Read 2026-11-18: Old World: inspected map screenshot, gallery index 1"
[RC-SHOT]: https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/871530/ss_237554937464d63dd2661d2113ca4d7f5d660033.1920x1080.jpg?t=1779801344 "Read 2026-11-18: Radio Commander: inspected map screenshot, gallery index 2"
[CO2-SHOT]: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/521800/ss_7dadd12db2e576765832ca705992641b0c38644b.1920x1080.jpg?t=1770078518 "Read 2026-11-18: Command Ops 2: inspected map screenshot, gallery index 1"



