# Assets: one brief per asset family

Status: design lane output (2026-11-14), revised the same day for decisions 0048 (assets are made by Codex through `CODEX.md`) and 0049 (ultrawide first). A proposal like everything in `docs/design/`: nothing here is accepted until a decision record accepts it. It briefs every asset the desk and the staff map in `PRESENTATION.md` need, so that **a Codex request in `CODEX.md` can point to a brief and add only the request's specifics**.

**Marks.** **[canon: NNNN]** means an accepted record fixes it; **[proposed]** means this document introduces it. Every count is an estimate unless it cites a record.

---

## 0. Rules for every brief

### 0.1 Who makes what

| Route | Used for | Who | Status |
|---|---|---|---|
| **Codex via `CODEX.md`** | raster art (textures, desk objects, ornaments, document decoration, portraits, store art) and non-speech audio (effects, music) | Codex, on the owner's plan; the lead writes the request; the standing reviewer checks the delivery; the lead looks, commits and replies | canon: 0048 |
| **Procedural** | everything the game draws from data: the map's base and dynamic layers, the icon set, labels, document layouts, chrome layout and states, portrait toning | the Phase 2 desk lane (Sonnet, high) | canon: 0013 for the map; proposed for the rest |
| **Sourced** | typefaces (OFL, chosen in 0035) and the public-domain photographs portraits are built from | a research lane; the image-sources lane for portraits | canon: 0035, 0037 |
| **Paid human commission** | only if the owner decides, case by case | the owner | canon: 0048 (rejected as the default), 0037 |

There is no art-direction lane: the briefs, the lead and the reviewer cover direction [canon: 0048]. Spending stays the owner's [canon: CLAUDE.md, 0037]. Codex uses the built-in image tool on the owner's plan with no API key, buys nothing and stops at the plan's limit [canon: `CODEX.md`, 0048].

### 0.2 Display and sizes

[canon: 0049] The reference display is **3440×1440 (21:9)**; 16:9 (2560×1440, 1920×1080) is the secondary target. **Assets are sized for 1440 pixels of height at 1×.** Wide pieces (the desk surface, textures meant to fill the desk, store art) are framed at **21:9 with a centred 16:9 safe area** (2560×1440 inside 3440×1440) for anything that must stay visible.

[proposed]:
- every raster asset is delivered at **1×** (the size in this document) and, where the tool allows, at **2×** for 4K-class and high-DPI displays; the recipe records the actual size delivered;
- shipped raster is WebP (lossy for photographic and painted art, lossless for line art), derived by the build from the delivered PNG; vector is SVG;
- art with transparency is PNG with an alpha channel, no matte, trimmed to its content plus a 4-pixel margin;
- colour is sRGB; no embedded profiles other than sRGB;
- every colour the game applies at runtime (ink, pencil, washes, toning) is a token in the era skin, so art is delivered **neutral** where the brief says so and the skin tones it (this keeps the high-contrast and colour-vision skins working without new files).

### 0.3 Licence and provenance

- **The game is commercial and the repository is PolyForm Noncommercial**, so every asset must allow commercial use and redistribution inside a game [proposed reading of 0014: third-party assets "keep their own licences and must not be committed unless those licences allow it"].
- **Allowed inputs** [proposed]: public domain and CC0 references, our own work, Codex outputs under 0048, OFL fonts. **Not allowed** as an input or a reference: share-alike, non-commercial or no-derivatives material, anything without a stated licence [canon for pack data: 0033; proposed extension to art], copyrighted artwork, and real modern brands or logos [canon: `CODEX.md` working rules].
- **Every asset has a recipe** beside it (section 0.5) [canon: 0048], which is its provenance. Reference images are cited by path and source URL, and the source's licence statement is the one the research lane recorded, never one stated from memory (L10).
- **AI disclosure**: Codex outputs are AI-generated, so the Steam page's AI-content disclosure covers them [canon: 0048, 0039]. AI is still never in the store headline, the trailer or the demo's pitch [canon: 0039].
- **The sensitive-history rules apply to images and sound** [canon: 0046, `CODEX.md`]: no Lost Cause imagery or symbols as decoration; no moral caricature; enslaved and free Black people, Native nations and civilians shown as people, never as props or a resource; no period racist imagery outside a cited document a gate reviewer has placed. The gate reviewer sees any delivery that depicts people other than the named sitters, or that uses flags, seals or emblems of either side [proposed].

### 0.4 Where deliveries go

Codex writes only under `art/` and to `CODEX.md` [canon: 0048]. Folder layout [proposed]:

```
art/
  app/                      generic, setting-free (desk objects, generic sounds)
    textures/  chrome/  sound/
  union-1861/               the pack's setting art (hard rule 3: no setting in packages/)
    ornaments/  documents/  portraits/real/<person-id>/  portraits/generated/
    music/  store/
  _pilot/                   pilot requests, deleted or promoted after review
```

`<person-id>` is the pack's person id (lane 0.3's people data), so a portrait joins its record without a lookup table. The build copies accepted files into the app and pack outputs; nothing under `packages/` names a setting [canon: hard rule 3, `npm run check:boundary`].

### 0.5 The recipe

Beside every asset, `<asset>.recipe.json` [canon fields: `CODEX.md`, 0048; proposed additions marked +]:

```json
{
  "asset": "art/app/textures/paper-letter.png",
  "request": "R2",                                   
  "brief": "ASSETS.md#2",                            
  "prompt": "…",
  "references": [
    { "path": "art/_refs/…", "sourceUrl": "https://…", "licenceNoted": "from <note>, section …" }
  ],
  "requestedSize": "1024x1024",
  "actualSize": "1024x1024",
  "tool": "…", "mode": "…",
  "sha256": "…",
  "variantsMade": 4, "variantChosen": 2,            
  "postProcess": ["trimmed", "made tileable by offset-and-heal"],
  "notes": "…"
}
```

`request`, `brief`, `variantsMade`, `variantChosen` and `postProcess` are proposed additions, so the reviewer can tie each file to its brief and see what was done after generation.

### 0.6 What a request in `CODEX.md` contains

A request names [proposed, extending `CODEX.md`'s "Requests point to briefs"]: the brief (section number here), the exact files with names and sizes, the output folder, the reference images for this request (path, source URL, the note that cleared them), any per-request style notes, the 21:9 target where relevant [canon: 0049], and "the brief's acceptance criteria apply". Briefs below give everything else, so requests stay short.

### 0.7 Storing binaries

**Recommendation: Git LFS for accepted deliveries; originals and rejects outside the repository** [proposed; `docs/LANES.md` already names Git LFS as the trigger at "the first map art or image asset"].

- **In the repository, through Git LFS:** every accepted file under `art/` (the 1× and 2× PNGs, audio masters' shipped encodings) and the build's derived WebP and Ogg files if they are committed at all. The recipes (`*.recipe.json`) are ordinary text in git.
- **Outside the repository:** Codex's rejected variants, raw source scans (re-fetchable from the URL in the recipe, checked by SHA-256), and any working files. They live in a folder the owner backs up, named in a note, never in git.
- **Before the first delivery is committed** the lead adds `.gitattributes` patterns for `art/**` binaries, runs `git lfs install`, and has CI fetch LFS objects. The owner checks GitHub's LFS storage and bandwidth allowance for the account first, since going over it is a spending question [canon: CLAUDE.md, money is the owner's].
- **Rejected:** plain git for binaries (the repository is public and every clone would carry every revision of every image forever); keeping everything outside the repository (deliveries could not be reviewed on a branch, and builds would depend on one machine's folder).

---

## 1. The map's icon set and ornaments

- **Purpose:** the staff map's marks (`PRESENTATION.md` section 3): headquarters flags, places, infrastructure, enemy estimates, messages in transit, battle and siege marks; and the pack's ornaments.
- **Route:** **icons procedural** (authored SVG in the era skin, roughened by our seeded noise, recoloured by tokens) [canon: 0013 item 3, 0035]; **ornaments by Codex** (0013 limits hand-made map art to ornaments per pack: cartouche, compass, seals) [canon: 0013, 0048].
- **Icons, count** [proposed, about 36]: headquarters flags for army, department, corps, temporary post, detachment; squadron, flotilla; fort, depot, port, arsenal or yard; towns in three tiers and the key point; rail junction, rail cut, bridge out, ford; enemy estimate (area, point); observer, courier, wire in transit, telegraph office; battle, siege, entrenchment, pocket ring; support-request tab, axis number, edit number, correction initials; three spares. Drawn on a 24-unit grid, legible at 20 px at 1440 height, distinguishable in silhouette alone. Producer: the Phase 2 desk lane.
- **Ornaments, output folder:** `art/union-1861/ornaments/`.
- **Ornaments, files** (PNG with alpha, neutral dark ink on transparent, toned at runtime):

| File | 1× size | 2× |
|---|---|---|
| `cartouche-frame.png` (empty frame; the title is set in type) | 900×560 | 1800×1120 |
| `compass-rose.png` | 360×360 | 720×720 |
| `scale-bar-frame.png` (empty; ticks drawn by code) | 720×120 | 1440×240 |
| `seal-war-department-style.png`, `seal-navy-department-style.png`, `seal-executive-style.png` (generic period-style seals, not reproductions of real seals unless a cleared public-domain reference is named) | 280×280 | 560×560 |
| `corner-flourish.png` (one corner; mirrored by code) | 240×240 | 480×480 |

- **Style references:** public-domain engraved map ornaments and atlas plates of the period, chosen by the image-sources lane or a research lane and named in the request; the `map-style` prototype's ink-on-linen skin [canon: 0013].
- **Licence:** Codex output; references public domain with URLs.
- **Priority:** demo-critical (icons and the compass, cartouche and scale frame); seals full game.
- **Dependencies:** era skin tokens; lane 0.2's world format; 0043's label hints.
- **Acceptance (reviewer):** icons: each identifiable in a 20 px silhouette test against the legend, no two sharing an outline, readable in ink, pencil and faded states and under simulated deuteranopia, protanopia and tritanopia. Ornaments: transparent background with no halo when composited on the darkest and lightest paper stocks; line weight consistent across the set (a single stroke reads at 1× without aliasing); no lettering baked in; nothing traced from a source not named in the recipe; seals carry no real emblem unless the recipe cites a cleared reference.

## 2. Paper and desk textures

- **Purpose:** the desk surface, the blotter, the paper stocks of each genre, card for the docket and org board, cork for the board.
- **Route:** **Codex** [canon: 0048], with procedural grain kept as the fallback and for the high-contrast skin's plain paper [proposed].
- **Output folder:** `art/app/textures/`.
- **Files:**

| File | 1× size | Notes |
|---|---|---|
| `desk-surface.png` | 3440×1440 | wood, top-down, even light; **21:9 frame with the centred 2560×1440 safe area** free of strong features; no objects on it |
| `desk-wood-tile.png` | 1024×1024 | tileable, for sizes beyond the frame |
| `blotter.png` | 1600×1100 | leather or felt blotter with worn edges, top-down |
| `paper-letter.png` | 1024×1024 | tileable laid letter paper, light cream, faint chain lines |
| `paper-telegraph-form.png` | 1024×1024 | tileable buff form stock |
| `paper-printed.png` | 1024×1024 | tileable bright printed-form stock |
| `paper-newsprint.png` | 1024×1024 | tileable newsprint, slight show-through |
| `paper-linen-map.png` | 1024×1024 | tileable linen-backed map paper |
| `card-stock.png` | 1024×1024 | tileable, for docket and person cards |
| `cork.png` | 1024×1024 | tileable cork board |
| `paper-edge-wear.png` | 1024×1024 | alpha mask of worn edges and corner folds, overlaid by code |

2× of each where the tool allows. Paper stocks are **neutral in colour and value** within a stated range so the skin can tone them; the request states the target mean value [proposed].
- **Style references:** public-domain scans of period papers and photographs of period desks, named in the request by the research lane.
- **Licence:** Codex output; references public domain.
- **Priority:** demo-critical.
- **Dependencies:** the era skin; the contrast rule (body text at 4.5:1 on every stock, `PRESENTATION.md` section 5).
- **Acceptance (reviewer):** a 3×3 tiling of each tile shows no visible seam or repeating blotch at 100% and 200%; desk surface: nothing important outside the 16:9 safe area, no objects, no text; paper stocks: black body text at 18 px on the stock measures at least 4.5:1 everywhere (checked at the darkest 1% of pixels); no watermark, maker's mark or legible writing; recipe present.

## 3. Desk chrome

- **Purpose:** the objects on the desk around the HTML interface: in-tray and out-tray, the ledger (closed and open spread), the org board's frame, the file drawer, the daybook, the calendar block, the attention tokens, stamps, pins and clips.
- **Route:** **Codex for the objects' art; procedural for layout, states and interaction** (React and CSS place the art, draw focus rings and text) [canon: 0048 for the art; proposed split].
- **Output folder:** `art/app/chrome/`.
- **Files** (PNG with alpha, top-down, light from the top left, consistent across the set):

| File | 1× size |
|---|---|
| `tray-in.png`, `tray-out.png` (empty wire or wooden letter trays) | 520×420 |
| `ledger-closed.png` | 600×780 |
| `ledger-open-spread.png` (blank ruled pages; figures set in type) | 1500×1000 |
| `board-frame.png` (empty cork board with frame) | 1400×1240 |
| `file-drawer.png` | 640×300 |
| `daybook.png` (closed) | 560×720 |
| `calendar-block.png` (blank tear-off calendar; date set in type) | 360×420 |
| `attention-token.png`, `attention-token-spent.png` | 72×72 |
| `stamp-decided.png`, `stamp-referred.png`, `stamp-filed.png`, `stamp-closed.png`, `stamp-let-take-course.png` (ink impressions with **blank text areas**; words set in type from the string table) | 420×160 |
| `pin.png`, `paper-clip.png`, `docket-spike.png` | 96×96 |
| `slip-why-stopped.png` (blank slip) | 640×220 |

- **Style references:** public-domain photographs and catalogue engravings of period stationery and office furniture, named in the request.
- **Licence:** Codex output.
- **Priority:** demo-critical.
- **Dependencies:** `PRESENTATION.md` sections 1–2 (sizes follow its 3440×1440 columns: left edge 560 px, right edge 660 px); typography (brief 5).
- **Acceptance (reviewer):** same light direction and shadow length across the set; no baked text anywhere (words come from string tables, 0030); alpha clean on the desk surface and on the high-contrast skin's flat background; each object reads at its 1× size inside the column it belongs to in the 3440×1440 layout and at 1920×1080 in its drawer; recipe present.

## 4. Document templates

- **Purpose:** the forms every paper is printed or written on (`PRESENTATION.md` section 4): telegram, letter with letterhead, memorandum, written opinion, strength return, casualty return, enemy estimate, newspaper front page and clipping, General Orders, promotion list, plan sheet, docket card, briefing.
- **Route:** **procedural layouts** (HTML and CSS over string-table slots, ICU messages) [canon: 0030, 0035]; **Codex for decoration only**: letterhead vignettes, printed-form rules and borders, masthead ornaments, the telegraph form's printed header art with blank fields [canon: 0048; proposed split].
- **Count:** about 14 genres; letterheads per issuing post as pack data (about 15–25 for 1861–62).
- **Output folder:** `art/union-1861/documents/`.
- **Files** (PNG with alpha, neutral ink, at the width the reading column uses: 760 px at 1×):

| File | 1× size |
|---|---|
| `telegraph-form-header.png` (printed header art, fields blank) | 760×260 |
| `letterhead-vignette-<post>.png` (one per issuing post the demo uses) | 760×180 |
| `general-orders-head.png` (rule and ornament, number and text set in type) | 760×200 |
| `return-form-rules.png` (ruled table frame; headings set in type) | 760×1000 |
| `masthead-ornament.png` (ornament only; titles set in type) | 1520×240 |
| `rule-double.png`, `rule-thick-thin.png` | 760×24 |

- **Style references: needs-source.** Period conventions (the military telegraph form, letterheads, General Orders, returns, front pages, endorsements, forms of address) come from a research lane's catalogue of public-domain scans (`PRESENTATION.md` section 9). Each request names the scans to work from.
- **Licence:** our templates; Codex decoration; references public domain. Newspaper titles a pack uses are checked by a research lane before ship.
- **Priority:** demo-critical for telegram, letter, memorandum, opinion, strength return, newspaper, plan sheet, docket card and briefing.
- **Dependencies:** the period-conventions research; string tables (lane 0.2); the gate's pattern lists [canon: 0046].
- **Acceptance (reviewer):** every decoration has blank areas wherever text goes and contains no legible words; each template compared side by side with its cited period scan; every string in the template passes the gate's pattern checks; text reflows at 200% type without clipping and never exceeds the reading column's line length [canon: 0049 item 4]; the same paper renders as text in the console (the presenter's output).

## 5. Typography

- **Purpose:** every letter on screen.
- **Route:** sourced; not a Codex asset.
- **Chosen** [canon: 0035]: self-hosted SIL Open Font Licence faces: IM Fell, Libre Caslon, Old Standard TT, Cinzel.
- **Roles** [proposed]: IM Fell English and its small capitals for map lettering, cartouche titles and paper headings; Libre Caslon for letters and memoranda set as type, newspaper body and the "plain reading" option; Old Standard TT for printed forms, General Orders, returns and the ledger; Cinzel unused by the 1861 pack; out-of-world chrome in Libre Caslon or Old Standard at a larger size.
- **Missing** [proposed]: **a handwriting face** for pencil notes, the president's endorsements, operators' hands and private letters; 0035's list has none. The `map-style` prototype used Kalam and Permanent Marker from a web CDN; a research lane checks their licences and suitability, and a record amends 0035.
- **Specifications:** WOFF2, self-hosted, never a CDN at runtime [canon: 0035]; a multi-resolution or signed-distance atlas for map labels [canon: tripwire section 5]; reading text at least 18 px at 1440 height [proposed, `PRESENTATION.md` section 5].
- **Licence:** OFL text shipped beside the fonts; the dependency-licence check extended to font files [proposed; 0035].
- **Priority:** demo-critical.
- **Acceptance (reviewer):** every glyph a pack's strings use exists in its face (a test over the string tables); labels crisp from 1× to 16× fit.
- **Who:** the Phase 2 desk lane; a research lane for the handwriting face.

## 6. Portraits of real people

- **Purpose:** the audience's large portrait, person cards, author thumbnails (`PRESENTATION.md` sections 1.3, 1.5).
- **Route:** **Codex, from the person's cited public-domain photograph** [canon: 0048, `CODEX.md`]. Sources and licences: `docs/research/2026-11-14-portrait-and-image-sources.md` (the image-sources lane; not yet landed when this was revised). Each request lists, per sitter: the pack person id, the reference image's path, its item URL, repository and identifier, the sitter's name and the photograph's date as the note records them.
- **Count:** about 150–180 named people in 1861–62 and about 450 over the war [canon: 0033]. **The demo's first cast** [proposed], from the catalogue entries the March 1862 week uses (S32, S34, S35, S36, S38): Stanton, Welles, McClellan, Halleck, Grant, C. F. Smith, McDowell, Sumner, Heintzelman, Keyes, Frémont, Burnside, Goldsborough, Wilkes; plus the rest of the cabinet and Lincoln (for setup, the briefing and the store page) from the pack's March 1862 roster. About 20–25 in all; about 30–40 across the demo's six weeks.
- **The treatment rule** [proposed; the principle is canon in 0048]:
  - **Allowed:** crop to head and shoulders; repair damage (scratches, foxing, missing emulsion) without inventing features; even out tone and contrast to the set's standard; extend background or clothing at the edges only where the crop needs it, marked in the recipe; a uniform, light engraving-like finish applied the same way to every portrait, only if the pilot shows it keeps the likeness.
  - **Not allowed:** changing the face, expression, age, hair, beard, pose or build; adding or altering insignia, medals or rank marks; colourising; combining two photographs; inventing a likeness for anyone without a cited photograph (such a person gets the "no likeness on file" card, brief 7); caricature.
  - **Always delivered with a straight version:** the cleaned crop with no finish, so the game can fall back to it if a finished portrait fails review.
- **Output folder:** `art/union-1861/portraits/real/<person-id>/`.
- **Files** (greyscale, neutral tone; the era skin tones and vignettes at runtime):

| File | 1× size (1440 height) | 2× |
|---|---|---|
| `portrait.png` (audience, head and shoulders, 4:5) | 576×720 | 1152×1440 |
| `portrait-straight.png` (same crop, cleaned only) | 576×720 | 1152×1440 |
| `card.png` (derived by the build, not by Codex) | 240×300 | 480×600 |
| `thumb.png` (derived by the build) | 96×120 | 192×240 |

- **Licence:** reference photographs public domain or CC0 as the image-sources note records; the output is Codex's under 0048.
- **Priority:** demo-critical for the demo cast; full game for the rest.
- **Dependencies:** the image-sources note; the pack's roster and person ids (lane 0.3); Git LFS (section 0.7).
- **Acceptance (reviewer):** the recipe cites the reference with item URL and the note that cleared it; side by side with the reference at the same scale, the eyes, nose, mouth, ears, hairline and beard line, and the visible insignia match (the reviewer marks each); no colour; nothing added that the reference lacks except marked edge extension; the straight version is present; the portrait reads at 96×120; the sitter's identity in the recipe matches the pack person id and the note's record.
- **Who:** the image-sources lane (references and identity); Codex (treatment); the reviewer; the Phase 2 desk lane (derivatives and toning).

## 7. Portraits for generated officers and the "hidden gems"

- **Purpose:** faces for invented officers from the officer pool [canon: 0020], who must never resemble or pass for a real person [canon: 0020].
- **Count:** open-ended; officers are generated only when relevant [canon: 0033]. A starting library of about 40 faces covers the demo and early play [proposed].
- **Route** [proposed]: two layers.
  1. **"No likeness on file"** (procedural): a plain period card with the officer's name and home in a clerk's hand. Used for any officer without an assigned face, and for real people with no cited photograph.
  2. **A Codex library of invented faces** in the same treatment as brief 6, generated from text prompts only (rank, age range, hair and beard, build), **with no photograph of any real person as a reference**. A seeded rule assigns a face from the library when an officer becomes notable (a hidden gem rises); the assignment is presentation, never state.
- **Output folder:** `art/union-1861/portraits/generated/`, files `face-001.png` … with `face-NNN-straight.png` not needed (no reference), same sizes as brief 6.
- **Licence:** Codex output.
- **Priority:** layer 1 demo-critical (trivial); layer 2 demo-useful (a battle report may name a junior officer), full set full game.
- **Dependencies:** the officer generator (Phase 1); the real-portrait set (for the check below).
- **Acceptance (reviewer):** the recipe shows no photographic reference; no face resembles any portrait in the real set (the reviewer compares each new face against the real set in a contact sheet); no duplicates within the library; uniforms and ranks plausible for the period per the research notes; each reads at 96×120.

## 8. Sound

- **Purpose:** feedback for acts and arrivals and a quiet room: paper drawn from the tray, paper put down, stamp, pen signing, telegraph sounder for an incoming wire, calendar page, ledger opening, drawer, pin, door and steps for an audience, chair, clock for the days running, room tone.
- **Route:** **Codex** [canon: 0048, non-speech audio]; the owner's own recordings are an alternative for any effect Codex cannot make convincingly [proposed].
- **Count:** about 20 effects, two or three variants each [proposed].
- **Output folder:** `art/app/sound/`.
- **Files:** `<name>-v<n>.wav`, 48 kHz, 24-bit, mono unless stated; effects under 2 seconds; `room-tone.wav` a seamless loop of 60 seconds, stereo. The build encodes Ogg Vorbis or Opus.
- **Style references:** the real objects (a telegraph sounder, period paper, a wooden desk); no copyrighted recordings as references [canon: `CODEX.md`].
- **Licence:** Codex output or own recording.
- **Priority:** demo-critical for 8 core effects (paper, stamp, pen, sounder, calendar, door, clock, room tone).
- **Dependencies:** the desk's act list (`PRESENTATION.md` section 2).
- **Acceptance (reviewer):** no clipping (peaks under −1 dBFS); loudness within 2 LU across the set; the loop has no audible seam; no speech or voice-like sounds; muting all sound loses no information (`PRESENTATION.md` section 5).

## 9. Music

- **Purpose:** a sparse, optional bed for the desk and menus; silence by default during the battle night [proposed].
- **Route:** **Codex** [canon: 0048]; a performance of a public-domain score is an alternative if the owner prefers, with each score's and edition's status confirmed by a research lane (L10) [proposed].
- **Count:** none in the demo, or one menu piece; 4–8 pieces of 2–4 minutes for the full game.
- **Output folder:** `art/union-1861/music/`; files 48 kHz, 24-bit stereo WAV with loop points in the recipe.
- **Style references:** parlour, band and church music of the period, described in words; no modern recordings as references.
- **The gate:** no piece built on a melody whose origin or words the gate's lists would fail, without the gate reviewer's ruling [proposed, from the gate's F2 and Q9]. The request states the melody's source if it uses one.
- **Priority:** full game only.
- **Acceptance (reviewer):** loop points clean; no recognisable modern or copyrighted melody; the gate reviewer has signed off any period melody used.

## 10. Store art

- **Purpose:** the Steam page and the demo's presence: capsule images, screenshots, a trailer, key art [canon: 0037, 0039].
- **Route:** **screenshots and trailer captured from the build** (Playwright at 3440×1440 and 1920×1080 [canon: 0035, 0049]); **capsules and key art by Codex**, composed from the game's own assets and portraits [canon: 0048].
- **Positioning** [canon: 0039]: the desk, the letters and the faces before the arrows; no mention of AI; "You can't move a division. One of your generals may run against you."
- **Output folder:** `art/union-1861/store/`.
- **Files:** the capsule set Steam requires, at the sizes read from Steamworks' documentation when the page is built (not from memory); `key-art.png` at 6880×2880, **21:9 with the centred 16:9 safe area** holding the title and the faces [canon: 0049].
- **Licence:** Codex output, the game's assets, cleared portraits; the AI disclosure covers it [canon: 0048].
- **Priority:** in-house screenshots and a first capsule are demo-critical (the page goes up with or before the demo); key art can follow.
- **Dependencies:** a playable desk (`PRESENTATION.md` section 6, steps 3–5); portraits (brief 6); 0039's disclosure question settled first.
- **Acceptance (reviewer):** every image meets Steam's then-current rules as read from Steamworks; the capsule's title reads at its smallest size; the first screenshot shows a letter and a face, not the map; no real person shown except from brief 6's portraits.

---

## 11. What the demo needs first

The demo is the early March 1862 start: the desk, the audience and plan review [canon: 0039, 0040, 0046].

| Order | Asset | Route | Blocks |
|---|---|---|---|
| 1 | Typography (four 0035 faces) and a handwriting face | sourced; research lane for the handwriting face | all text |
| 2 | Paper stocks and desk surface (brief 2) | Codex | the desk's look |
| 3 | Desk chrome (brief 3) | Codex art, procedural layout | playing at all |
| 4 | Map icons (procedural) and ornaments (Codex, brief 1) | both | the staff map |
| 5 | Demo cast portraits (brief 6) | Codex from public-domain photographs | the audience |
| 6 | Document decoration (brief 4) | Codex, after the conventions research | reading papers in period form |
| 7 | Core sound effects (brief 8) | Codex | feel, not function |
| 8 | Generated-officer library, first 12 (brief 7) | Codex | battle-report mentions |
| 9 | Capsule and screenshots (brief 10) | capture and Codex | the Steam page |

Not needed for the demo: music, the full roster's portraits, the full generated library, key art, seals.

## 12. First requests, in the order to send them

Each is a `CODEX.md` request pointing to its brief; the lead sends the next only after the reviewer has passed the last pilot [proposed].

1. **R1, pilot: paper and desk.** Brief 2: `paper-letter.png` and `desk-surface.png` into `art/_pilot/`. Calibrates sizes, tiling, the neutral-tone target, the 21:9 frame and the recipe. Before sending: `.gitattributes` and LFS in place (section 0.7).
2. **R2, the remaining textures.** Brief 2: every other file in its table, into `art/app/textures/`.
3. **R3, desk chrome.** Brief 3: the whole table, into `art/app/chrome/`.
4. **R4, map ornaments.** Brief 1: cartouche frame, compass rose, scale-bar frame and corner flourish, into `art/union-1861/ornaments/`, with the public-domain atlas references the research lane names.
5. **R5, portrait pilot.** Brief 6: two sitters, one in uniform and one civilian (for example McClellan and Stanton), into `art/_pilot/`, both finished and straight versions, with references from the image-sources note. Settles whether the engraving-like finish keeps the likeness. Blocked until that note lands.
6. **R6, the demo cast.** Brief 6: the remaining sitters of the demo's first cast, in batches of about eight, into `art/union-1861/portraits/real/<person-id>/`.
7. **R7, core sounds.** Brief 8: the 8 core effects with two variants each, into `art/app/sound/`.
8. **R8, document decoration.** Brief 4: the demo genres' decoration, into `art/union-1861/documents/`. Blocked until the period-conventions research names its scans.
9. **R9, generated officers.** Brief 7: the first 12 faces, into `art/union-1861/portraits/generated/`, after R6 so the resemblance check has the real set to compare against.
10. **R10, store art.** Brief 10: a first capsule set from the playable desk. Last, because it needs the desk running.

## 13. Everything procedural, needing no art

- the staff map's base bake: coast, water lines, rivers, relief hachures, region fills and borders, washes, hatching [canon: 0013, 0043];
- fronts, pockets, supply lines, arrows, edits, corrections, notes and fading [canon: 0013];
- region and place labels from authored hints [canon: 0043];
- the map icon set (authored SVG in the era skin);
- desk layout, drawers, focus, hover and disabled states, and the attention meter's behaviour;
- document layouts (HTML and CSS over string tables) and all text on any asset;
- portrait derivatives (card and thumbnail), toning and vignettes;
- the "no likeness on file" card;
- the high-contrast and colour-vision skins (token sets) and the plain-paper fallback grain;
- the console's text rendering of all of the above, and the map's text twin.
