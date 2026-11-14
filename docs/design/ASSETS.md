# Assets: one brief per asset family

Status: design lane output (2026-11-14), a proposal like everything in `docs/design/`. Nothing here is accepted until a decision record accepts it. It briefs every asset the desk and the staff map in `PRESENTATION.md` need, so that work can be done in-house now and commissioned later without re-deciding what each thing is for.

**Marks.** **[canon: NNNN]** means an accepted record fixes it; **[proposed]** means this document introduces it. Every count is an estimate unless it cites a record.

**What binds every brief.**
- **Prove it first** [canon: 0037, 0039]. No art or marketing money before the hook is proven. The procedural staff map, a text-led desk, public-domain portraits and open-licence typefaces carry the game until wishlists reach the go band (7,000–20,000 organic wishlists: "key art and capsule, hired UI polish, a trailer", per the market note, which 0039 adopts). Spending is the owner's decision [canon: CLAUDE.md, 0037].
- **Licence rules** [canon: 0014, 0033; proposed where marked]:
  - the repository is PolyForm Noncommercial and the game is commercial, so every shipped asset must allow commercial use and redistribution inside a game [proposed reading of 0014's "third-party data and assets keep their own licences and must not be committed unless those licences allow it"];
  - allowed: public domain, CC0, our own work, and commissioned work with full rights assigned to the owner [proposed];
  - not allowed: share-alike (CC BY-SA), non-commercial (any NC), no-derivatives (ND), and any source with no stated licence [canon for pack data: 0033 rejects CC BY-SA and sources without a stated licence; proposed extension to assets];
  - CC BY only with the lead's approval in a record and an attribution entry shipped with the game [proposed];
  - **no generative-AI assets** in the shipped game: Steam's disclosure covers pre-generated content as well as live, and the market evidence says the label costs reviews and peer goodwill [proposed, from 0039 and the market note sections 4 and findings];
  - every asset has a provenance row (source, URL, the licence statement and the date it was read, who read it) beside it in the pack or the app's asset folder, as 0031 requires for geography [canon: 0031 provenance per pack; proposed extension];
  - **licence facts come from a research lane**, never from memory (L10). Public-domain portrait and image sources are catalogued by the image-sources lane in `docs/research/2026-11-14-portrait-and-image-sources.md` (in progress when this was written); every sourced asset cites that note or a later one.
- **Binary assets go in Git LFS** from the first image [canon: `docs/LANES.md`, "Not adopted yet": Git LFS at "the first map art or image asset"].
- **Packs own setting assets** [canon: hard rule 3, 0013 item 3]: portraits, ornaments, document templates' wording and the era skin live in `packs/<pack>/`; the desk chrome, the procedural painters and generic sounds live in the app. No setting name in `packages/` (`npm run check:boundary`).
- **Who produces** [proposed]: *the Phase 2 desk lane* (Sonnet, high: UI) for procedural and code assets; *a research lane* (Sonnet, high) for sourcing and licences; *the owner* for recordings and every spending call; *an art-direction lane* for commissions, which opens at the first commission or at the start of the Phase 2 desk lane, whichever comes first; *a commissioned artist or performer* only after a go decision.

**Base specification** [proposed]: logical layout at 1920×1080, scaling from 1280×720 to 3840×2160 and device pixel ratios 1 to 2; raster masters at 2× their largest display size; shipped raster as WebP (lossy for photographs and scans, lossless for line art), vector as SVG; every colour a token in the era skin (as the `map-style` prototype does), so the high-contrast and colour-vision skins change tokens, not files.

---

## 1. The map's icon set

- **Purpose:** the staff map's dynamic and base marks (`PRESENTATION.md` section 3): headquarters flags, places, infrastructure, the enemy's pencilled estimates, messages in transit, battle and siege marks.
- **Count** [proposed, about 40 glyphs]: headquarters flags for army, department, corps, temporary post and detachment (5); squadron and flotilla (2); fort, depot, port, arsenal or yard (4); towns in three size tiers and the key point (4); rail junction, rail cut, bridge out, ford (4); enemy estimate (area and point) (2); observer, courier, wire in transit, telegraph office (4); battle, siege, entrenchment, pocket ring (4); support-request tab, plan axis number, edit number, correction initials (4); cartouche, compass, scale bar, seal (4, ornaments, see below); spares for the pack (about 3).
- **Specifications:** SVG paths drawn on a 24-unit grid, stroked not filled where possible so the skin's ink and pencil styles apply; drawn at runtime through the same seeded roughening as region borders [canon: 0035 our own seeded noise]; legible at 16 logical pixels; each glyph distinguishable in silhouette alone, so meaning never rests on colour [proposed, `PRESENTATION.md` section 5].
- **Style references:** period military maps and atlas plates in the public domain, as the image-sources lane catalogues them (Library of Congress map collections are 0031's named source for traced rail) [canon: 0031 for rail sources]; the `map-style` prototype's line language [canon: 0013].
- **Production route:** procedural (authored SVG in the era skin, pack data) [canon: 0013 item 3]. **Ornaments** (cartouche, compass, seals) are the only hand-made map art per pack [canon: 0013 item 3]: drawn in-house as SVG, or traced from a public-domain engraving the research lane clears.
- **Licence:** our own work; any traced source public domain with provenance.
- **Priority:** demo-critical.
- **Dependencies:** the era skin tokens; lane 0.2's world format (posts, depots, key points); 0043's label hints.
- **Acceptance:** every glyph identifiable in a silhouette test at 16 px by someone who has read the legend; no two glyphs share an outline; all render in ink, pencil and faded states; the colour-vision skins pass a simulated deuteranopia, protanopia and tritanopia check with no lost meaning.
- **Who:** the Phase 2 desk lane; ornaments by the same lane or the art-direction lane.

## 2. Paper and desk textures

- **Purpose:** the surfaces: the desk, the blotter, and the paper stocks of each genre (telegraph form, letter sheet, printed form, newsprint, linen map).
- **Count:** desk wood, blotter, about five paper stocks, card stock for the docket and org board, cork for the board [proposed].
- **Specifications:** generated at runtime from seeded noise (grain, fibre, foxing at the edges, fold lines) as tileable shader or canvas textures; no image files in the shipped build unless a scan is cleared; parameters per stock in the era skin; a "plain" variant with grain off for the high-contrast skin [proposed].
- **Style references:** public-domain scans of period papers the image-sources lane lists (for colour and grain only).
- **Production route:** procedural [canon: 0013 "desk material" is part of the era skin; 0037 procedural first].
- **Licence:** our own code.
- **Priority:** demo-critical (simple versions).
- **Dependencies:** the era skin; the accessibility contrast rule (body text at 4.5:1 on every stock).
- **Acceptance:** no visible tiling seams at 1× or 2×; text contrast passes on every stock; texture generation under 50 ms at startup on the reference machine; the same seed gives the same texture.
- **Who:** the Phase 2 desk lane.

## 3. Desk chrome

- **Purpose:** the objects on the desk: the in-tray and out-tray, the docket rail, the ledger, the org board, the file drawer and daybook, the calendar, the attention meter, the "why we stopped" slip, the run-the-days control.
- **Count:** about 10 objects, each with rest, hover, focus and disabled states [proposed].
- **Specifications:** HTML and CSS (React components) with SVG details, scaled with the layout; focus rings visible in every skin; meter tokens and calendar pages as vector; no raster except textures from brief 2 [proposed].
- **Style references:** period stationery and office objects from public-domain photographs and catalogues the image-sources lane lists; the flat, seen-from-above desk of `PRESENTATION.md` section 1.
- **Production route:** procedural and in-house code; hired UI polish only after a go decision [canon: 0039's go band].
- **Licence:** our own work.
- **Priority:** demo-critical.
- **Dependencies:** `PRESENTATION.md` sections 1–2; the presenter (section 6 there); typography (brief 5).
- **Acceptance:** every object operable by keyboard and mouse; the attention meter shows the price of a focused action and the refill date; layout holds from 1280×720 to 3840×2160 with no overlap; Playwright golden screenshots per state [canon: Playwright for UI screenshots, 0035].
- **Who:** the Phase 2 desk lane.

## 4. Document templates

- **Purpose:** the forms every paper is printed or written on (`PRESENTATION.md` section 4's genres): telegram, letter with letterhead, memorandum, written opinion, strength return, casualty return, enemy estimate, newspaper front page and clipping, General Orders, promotion list, plan sheet, situation docket card, briefing.
- **Count:** about 14 genres; letterheads per issuing post as pack data (about 15–25 for 1861–62, estimate) [proposed].
- **Specifications:** HTML and CSS templates with string-table slots (ICU messages) [canon: 0030, 0035]; the setting's words, mastheads and letterheads in the pack; handwriting genres render in a handwriting face with a typeset transcription available [proposed, accessibility]; every template has an author, a route and a stamp field [canon: 0032, gate F1]; quotations carry speaker and citation [canon: gate F3].
- **Style references:** **needs-source.** The period conventions (the military telegraph form, letterheads, General Orders, returns, front-page structure, endorsements, forms of address) come from a research lane's catalogue of public-domain scans (`PRESENTATION.md` section 9), not from this lane.
- **Production route:** procedural templates in-house; layouts drawn from public-domain originals; mastheads reset in our faces unless the research lane clears a public-domain original [proposed].
- **Licence:** our own templates; reference scans public domain with provenance; the newspaper titles a pack uses checked by a research lane before ship [proposed].
- **Priority:** demo-critical for telegram, letter, memorandum, opinion, strength return, newspaper, plan sheet, docket card and briefing; General Orders, casualty return, enemy estimate and promotion list are demo-critical only where the demo's six weeks use them [proposed].
- **Dependencies:** the research lane on period conventions; string tables (lane 0.2); the gate's forbidden, review and anachronism lists [canon: 0046].
- **Acceptance:** each template reviewed against its cited period source; every string passes the gate's pattern checks; text reflows at 200% type without clipping; the same paper renders identically in the console's text form (the presenter's output) and on the desk.
- **Who:** research lane (conventions), the Phase 2 desk lane (templates), the gate reviewer for any template carrying gated text.

## 5. Typography

- **Purpose:** every letter on screen.
- **Chosen** [canon: 0035]: self-hosted SIL Open Font Licence faces: IM Fell, Libre Caslon, Old Standard TT, Cinzel.
- **Roles** [proposed]:
  - **IM Fell English and its small capitals:** map lettering (region names along spines), cartouches, headings on papers;
  - **Libre Caslon:** letter and memorandum body text set as type, the newspaper's body, and the "plain reading" option;
  - **Old Standard TT:** printed forms, General Orders, returns, the ledger's tables;
  - **Cinzel:** not used by the 1861 pack (the prototype used it for the Rome skin); kept for other packs;
  - **out-of-world chrome** (menus, settings, key card) in Libre Caslon or Old Standard at a larger size.
- **Missing** [proposed]: **a handwriting face** for pencil notes on the map, the president's endorsements, operators' hands on telegrams and private letters. 0035's list has none. The `map-style` prototype used Kalam (pencil notes) and Permanent Marker (the 2022 skin) from a web CDN; their licences and suitability must be checked by a research lane and a face added to 0035's list by a record amendment.
- **Specifications:** WOFF2, self-hosted (never a CDN at runtime) [canon: 0035 self-hosted]; a multi-resolution or signed-distance atlas for map labels so they stay crisp at every zoom [canon: tripwire section 5 estimate]; wait for fonts before the first layout.
- **Licence:** OFL text shipped beside the fonts [proposed]; the dependency-licence check extended to font files [proposed; 0035 adds a dependency-licence check to `npm run check`].
- **Priority:** demo-critical.
- **Dependencies:** the handwriting-face record; the label atlas work (Phase 2 lane, 0043).
- **Acceptance:** every glyph a pack's strings use exists in its face (a test over the string tables); body text at 16 px passes contrast; the map label atlas is crisp at 1× to 16× fit.
- **Who:** the Phase 2 desk lane; a research lane for the handwriting face's licence.

## 6. Portraits of real people

- **Purpose:** the audience scene's large portrait, person cards on the org board, author thumbnails on papers [`PRESENTATION.md` sections 1.3, 1.5].
- **Count:** about 150–180 named people in 1861–62, about 450 over the war [canon: 0033 roster size]. **For the demo** [proposed estimate]: the people the March 1862 start's six weeks can show, about 30–40, of whom about 15 can sit in an audience; the exact list comes from the pack's March 1862 roster.
- **Specifications** [proposed]: one master per person at 960×1200 (4:5), neutral greyscale or the source's own tone, cleaned of damage but not retouched in likeness; shipped as WebP at 960×1200 (audience), 320×400 (card) and 96×120 (thumbnail); toning, oval vignette and paper border applied at runtime by the era skin, so one master serves every skin; dated as close to the scenario's dates as the sources allow, with the likeness date in the provenance.
- **Style references:** the public-domain photographic and engraved portraits of the period as the image-sources lane catalogues them.
- **Production route:** sourced from the public domain [canon: 0037 "public-domain portraits"]. **Sources and licences: `docs/research/2026-11-14-portrait-and-image-sources.md`** (the image-sources lane), never this document.
- **Licence:** public domain or CC0 only, confirmed per image by the research lane with the repository's own statement, its URL and the date read [proposed, from 0033's sourcing rule and L10].
- **Priority:** demo-critical for the demo cast; full game for the rest.
- **Dependencies:** the image-sources note; the pack's roster (lane 0.3 and the people data); Git LFS.
- **Acceptance:** the sitter's identity matches the source record (name, date, repository, identifier); a provenance row per image; no image of a living person's likeness or a modern reconstruction; a reviewer who is not the sourcer checks identity for the demo cast [proposed]; the image reads at thumbnail size.
- **Who:** the image-sources research lane (sourcing, identity, licence); the Phase 2 desk lane (processing pipeline).

## 7. Portraits for generated officers and the "hidden gems"

- **Purpose:** a face for invented officers who rise from the officer pool [canon: 0020], who must never resemble or be passed off as a real person [canon: 0020, invented officers checked against rosters].
- **Count:** open-ended; an officer is generated only when he becomes relevant [canon: 0033].
- **Specifications and route** [proposed], in two stages:
  1. **Demo and early game: no likeness.** A generated officer's card shows a plain period card with "no likeness on file" and his name and home in the hand of a clerk. This is honest (the staff has no photograph of a captain nobody has heard of) and costs nothing.
  2. **Full game, after a go decision: a procedural engraving kit.** A commissioned set of engraved parts (heads, hair, beards, collars, uniforms by rank, about 150–250 parts, estimate) composited by a seeded generator into an engraving-style bust, so a hidden gem gains a face when he becomes notable. The kit is commissioned once with full rights; no part may be traced from an identifiable real person's portrait; a similarity check against the real-portrait set is run on every generated face [proposed].
- **Not allowed:** generative-AI faces (licence rules above), and real portraits relabelled as invented men.
- **Licence:** commissioned with full rights assigned to the owner.
- **Priority:** stage 1 demo-critical (trivial); stage 2 full game only.
- **Dependencies:** the officer generator (Phase 1); the art-direction lane; the owner's spending decision.
- **Acceptance:** stage 1: the card renders for any generated officer. Stage 2: 1,000 seeded faces with no duplicates, none flagged by the similarity check, each identifiable at thumbnail size.
- **Who:** the Phase 2 desk lane (stage 1); the art-direction lane and a commissioned engraver or illustrator (stage 2).

## 8. Sound

- **Purpose:** feedback for acts and arrivals, and a quiet room: a paper drawn from the tray, a paper put down, a stamp, a pen signing, a telegraph sounder for an incoming wire, the calendar page, the ledger opening, the drawer, a pin on the org board, a door and steps for an audience, a chair, a clock for the days running, a low room tone [proposed].
- **Count:** about 20 effects, with two or three variants each to avoid repetition [proposed].
- **Specifications:** masters at 48 kHz, 24-bit WAV; shipped as Ogg Vorbis or Opus; loudness normalised across the set; effects under 2 seconds except room tone (a seamless loop); separate effects, room and music volumes; every sound has a visual equivalent [proposed, `PRESENTATION.md` section 5].
- **Style references:** the real objects (a telegraph sounder, period paper, a wooden desk).
- **Production route:** **our own recordings** by the owner (a field recorder or a good phone in a quiet room) as the first choice; CC0 libraries second, each file's licence confirmed by a research lane [proposed].
- **Licence:** own work or CC0; no CC BY-NC or "royalty-free with restrictions" packs unless a research lane confirms game redistribution [proposed].
- **Priority:** demo-critical for about 8 core effects (paper, stamp, pen, sounder, calendar, door, clock, room tone); the rest full game.
- **Dependencies:** the desk's act list (`PRESENTATION.md` section 2).
- **Acceptance:** no clipping; consistent loudness; no sound repeats identically twice in a row; muting all sound loses no information.
- **Who:** the owner (recording); the Phase 2 desk lane (integration); a research lane for any library file.

## 9. Music

- **Purpose:** a sparse, optional bed for the desk and the menus; silence by default during the battle night so the dispatches carry it [proposed].
- **Count:** none in the demo or one piece for the menu; for the full game 4–8 pieces of 2–4 minutes [proposed].
- **Specifications:** masters 48 kHz, 24-bit; shipped Ogg; looping points marked; default volume low.
- **Style references:** parlour, band and church music of the period, in public-domain scores the research lane identifies.
- **Production route:** performances of public-domain scores, **recorded by us or commissioned**; a modern recording of an old score carries its own rights, and a modern edition or arrangement may too, so a research lane confirms each score's and edition's status before it is used [proposed; L10].
- **Gate:** music is in-world text in sound. Songs whose origins or lyrics the gate's lists would fail (for example a song whose words are period racist language) are not used, even as instrumentals, without the gate reviewer's ruling [proposed, from the gate's F2 and Q9].
- **Licence:** own recording or commissioned with full rights; scores public domain as confirmed.
- **Priority:** full game only (the demo can ship silent apart from effects).
- **Dependencies:** the research lane on scores; the gate reviewer; the owner's spending decision for a commission.
- **Acceptance:** each piece has a provenance row (score, edition, performers, recording rights); the gate reviewer has signed off the selection.
- **Who:** a research lane (scores), the gate reviewer (selection), the owner (recording or spending).

## 10. Store art

- **Purpose:** the Steam page and the demo's store presence: capsule images, screenshots, a trailer, key art [canon: 0037 a Steam page and a demo; 0039 positioning].
- **Count:** the capsule set Steam requires at the time (sizes read from Steamworks' own documentation when the page is built, not from memory), 5–10 screenshots, one trailer of about a minute, later one key art piece [proposed].
- **Positioning** [canon: 0039]: show the desk, the letters and the faces before the arrows; no mention of AI; the line "You can't move a division. One of your generals may run against you."
- **Specifications:** screenshots captured from the build by Playwright at 1920×1080 and 3840×2160 [canon: Playwright, 0035]; the trailer captured from play, cut in-house; capsule composed in-house from a public-domain portrait, desk textures and the title in IM Fell until a go decision.
- **Production route:** in-house from the game's own assets now; **commissioned key art and capsule, hired UI polish and a trailer only in the go band**, on the owner's call [canon: 0037, 0039].
- **Licence:** our own work plus cleared public-domain images; commissioned work with full rights.
- **Priority:** the in-house capsule and screenshots are demo-critical (the Steam page goes up with or before the demo); commissioned art is full game only.
- **Dependencies:** a playable desk (Phase 2 steps 3–5); portraits (brief 6); 0039's disclosure question settled before the page goes up [canon: 0039 consequences].
- **Acceptance:** every image passes Steam's then-current rules as read from Steamworks; no AI imagery; the capsule reads at its smallest size; the first screenshot shows a letter and a face, not the map.
- **Who:** the Phase 2 desk lane (capture), the lead (selection), the owner (publishing and any spend); the art-direction lane for any commission.

---

## 11. What the demo needs first

The demo is the early March 1862 start, showing the desk, the audience and plan review [canon: 0039, 0040, 0046].

| Order | Asset | Route | Producer | Blocks |
|---|---|---|---|---|
| 1 | Typography (four 0035 faces, self-hosted) | sourced (OFL) | desk lane | everything with text |
| 2 | Handwriting face | sourced, after a licence check and a record | research lane, lead | map pencil, telegrams, endorsements |
| 3 | Era skin tokens and paper and desk textures | procedural | desk lane | the desk's look |
| 4 | Desk chrome | procedural, code | desk lane | playing at all |
| 5 | Document templates (the nine demo genres) | procedural, from sourced conventions | research lane, desk lane | reading papers |
| 6 | Map icon set and ornaments | procedural, in-house SVG | desk lane | the staff map |
| 7 | Portraits of the demo cast (about 30–40) | sourced (public domain) | image-sources lane | the audience |
| 8 | "No likeness on file" card | procedural | desk lane | generated officers |
| 9 | Core sound effects (about 8) | own recording or CC0 | owner, desk lane | feel, not function |
| 10 | In-house capsule and screenshots | in-house | desk lane, lead | the Steam page |

**Not needed for the demo:** music, the engraving kit, commissioned key art, the full roster's portraits, the remaining sound effects.

## 12. Everything procedural, needing no art

- the staff map's base bake: coast, water lines, rivers, relief hachures, region fills and borders, washes, hatching [canon: 0013, 0043];
- fronts, pockets, supply lines, arrows, edits, corrections, notes and fading [canon: 0013];
- region and place labels from authored hints [canon: 0043];
- the map icon set (authored SVG in the era skin);
- paper, card, cork, blotter and desk textures (seeded noise);
- desk chrome: trays, docket rail, ledger, org board, file, daybook, calendar, attention meter, slips;
- document templates (HTML and CSS over string tables);
- portrait processing: toning, vignette, border, sizes from one master;
- the "no likeness on file" card for generated officers;
- the high-contrast and colour-vision skins (token sets);
- the console's text rendering of all of the above, and the map's text twin.
