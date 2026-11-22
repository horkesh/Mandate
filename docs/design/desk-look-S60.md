# The desk's look (S60) and the desk at laptop sizes (S56)

Status: proposal for the lead (2026-11-22), from the S60 design lane, which also took S56's layout brief while Codex is out of allowance. Nothing here is accepted until a decision record accepts it. It applies `PRESENTATION.md` (accepted with 0053) and the image rules of 0053 and `ASSETS.md` section 0.3 to the prototype in `prototypes/desk/` (0089). Branch `claude/desk-look-395bf6`, from `sprint/desk-look` at `3e7aad0`.

**Evidence.** Captures are in `art-masters/S60/` in the lane's worktree (ignored by git, each with a recipe): `before-<size>-<view>.png` and `after-<size>-<view>.png` at 3440×1440, 1920×1080, 1366×768 and 1280×720, for the desk and for each tool opened. The checks are `prototypes/desk/test/s60-capture.spec.ts` and `s60-layout.spec.ts`, run headless on their own port with `npx playwright test --config playwright.s60.config.ts`. Their measurements are beside the captures (`after-layout-*.json`, `after-contrast-*.json`).

## 1. What read as basic

Seen in `before-1920x1080-desk.png` and the rest of the `before-*` set:

1. **There was no desk.** The staff map filled the window edge to edge, and every object floated on top of it as a card. Nothing said "a desk in an office".
2. **The tools were a grid of grey boxes.** Org board, ledger, file, daybook, plans, orders, writing an order, the key card and sound were nine identical bordered buttons in the top right corner (four with a 32-pixel thumbnail at 3440).
3. **Grey paper.** The paper and card textures are delivered neutral (mean value 230 on every channel, as `ASSETS.md` 0.2 asks, so the skin can tone them). Most surfaces used them untoned, so papers, the board's cards and the tray's lists read grey (`before-1920x1080-org-board.png`, `-paper.png`).
4. **The calendar** was a paper chip reading `1861-03-05`, an ISO date, beside an attention card with tiny drawn dots.
5. **The map key** was a generic bordered two-column box in the map's lower middle, a separate "Staff map" box beside it and a third box for the compass and scale. At 1366×768 and 1280×720 the key covered the Gulf coast (`before-1280x720-desk.png`).
6. **The map controls** were a strip of eleven small bordered buttons and selects floating over the map's bottom edge.
7. **The docket** was a plain "Docket 0" button with italic text beside it.
8. **"Let the days run"** was a bordered box of the same weight as everything else.
9. **The first morning's note** was a large box over the map's upper left.
10. **The opened tools** were one generic modal each: a cream box with a "The president's desk" eyebrow and a "Put down" button. The board was grey rows on tan, the ledger tabs in a tan band, the key card a plain table.
11. **At laptop sizes things met.** At 1280×720 an open paper covered both trays, the place finder's select read "Find a" and the map look's "Manus".

**Chrome art that existed but was not used:** the calendar block, the docket spike, all five stamps, the paper clip, the pin, the slip, the ledger's open spread, both attention tokens, the board frame as an object, and the blotter. All of these are now used except four of the stamps (section 5).

## 2. The design

A working desk in the President's office in 1861, seen from above (`PRESENTATION.md` 1.0–1.1). All of it is one stylesheet, `prototypes/desk/web/desk-look.css`, loaded last and scoped to the table desk, plus small markup changes in `App.tsx` and `map/StaffMap.tsx`. Earlier request styles stay intact underneath.

Each choice below is a proposal, with the alternatives rejected.

### 2.1 The desk and its layout

- **Choice:** a CSS grid over the walnut desk surface: the left edge holds the calendar block, the attention tokens and the two trays; the centre holds the staff map on its blotter; the right edge holds the org board, ledger, daybook, file drawer, two folders, the order pad and the key card; the front edge holds the docket spike with its slips and "Let the days run". Columns are `clamp(148px, 11.6vw, 400px)` and `clamp(158px, 12.4vw, 430px)`; the front edge is `clamp(62px, 9.4vh, 136px)`. This is `PRESENTATION.md` 1.1's 3440 layout, scaled, at every size.
- **Rejected: drawers with tabs at 16:9**, as `PRESENTATION.md` 1.0 proposes. Measured, the map keeps 56% of the screen at 1280×720 with the edges showing (56.0% to 57.5% at all four sizes), so hiding the objects in drawers would buy little map and lose the desk, which is the point of this request. The lead may still want drawers below 1280 wide; nothing here prevents them.
- **Rejected: keeping the map full-window with objects floating on it**, as before. It is what read as basic, and it is what made objects cover the map.
- **Whole pixels.** Where the browser supports CSS `round()`, the columns, gaps and margins are rounded to whole pixels, so the map's canvas has a whole-pixel size: a fresh load and a resize then frame the map identically (S45's framing check), and art edges stay sharp. Other browsers keep the unrounded values.
- **One existing test changed:** `test/s45-map.spec.ts` assumed the map's canvas fills the window (`frame[2]` equal to the window's width). It now compares the frame with the canvas's own width; its real checks, that first load and a resize both equal "Fit the map", are unchanged and pass.

### 2.2 The staff map

- **Choice:** the map lies as a mounted sheet on the green blotter (`textures/blotter.png`), with a cream mat line and a shadow, and the blotter's leather edge round it. Nothing lies on the sheet except its own printed key and, while open, a paper or a plan sheet.
- **Rejected: a heavier engraved frame drawn round the map.** The map already has its neatline and degree ticks; a second frame competes with them.

### 2.3 The map key as a printed cartouche

- **Choice:** the cartouche title, the control key, the compass and the scale bar become one printed cartouche in the sheet's lower right, double-ruled with corner marks, on linen. A "Map key" toggle folds it to its title; it starts open when the map is at least 1000×640 pixels (3440×1440, 1920×1080) and folded below (1366×768, 1280×720), until the player chooses. It covers 2.7–6.4% of the map. `display: contents` keeps the three parts where they were in the plan-review dialog and the study page.
- **Rejected: moving the key off the map** into the right edge. A printed key on the sheet is what the brief and `PRESENTATION.md` 3.1 ask for, and the right edge is full at 1280×720.
- **Rejected: refitting the map around the key.** That is the renderer's fit, outside this lane (see "Findings outside my scope").

### 2.4 The instrument strip

- **Choice:** one restrained ebony rule on the blotter, under the sheet: zoom −/+, "Fit the map", four arrows for panning, the place finder and its "Show place", "Show Virginia", the map look, and at its right end "Read the map as text". Glyph buttons keep their spoken names (`aria-label`, `title`), so `getByRole('button', { name: 'Pan west' })` and the T and arrow shortcuts are unchanged. If text is enlarged past what fits, the strip scrolls rather than overlap.
- **Rejected: icons for every control.** "Fit the map" and the finder are clearer as words, and the strip has room for them at 1280.
- **Rejected: brass instrument styling with dials.** Busier than "restrained" and harder to read.

### 2.5 Objects on the desk

- **Calendar block:** `chrome/calendar-block.png` as a border image, its date set in type: weekday, day, month and year, and "At peace" or "At war". Its `<time>` reads "Tuesday, 5 March 1861" and keeps the ISO date only in its `datetime` attribute (section 2.9).
- **Attention:** the `attention-token` art on a dark leather strip, with the count in type, and `attention-token-spent` for the tokens an act would strike. *Rejected:* drawing the tokens as CSS discs (what it was).
- **Trays:** the existing tray art, with a brass-framed label holder, and sheets drawn in the tray only while it holds papers (`data-count`).
- **Org board:** a framed cork board (`board-frame.png` as a border image) with two cards and its label pinned (`pin.png`).
- **Ledger, daybook, file:** the existing book and drawer art with paper labels pasted on.
- **Folders, order pad, key card:** drawn in CSS (manila folders with tabs, a ruled pad with a pen, a printed card). A waiting plan shows as a stamp-red line inside the Plans folder. *Rejected:* new raster art for these; the brief prefers code, and no new image is needed (so no LFS pointer is added).
- **Sound:** a small switch at the foot of the right edge, not an object.

### 2.6 The front edge

- **Docket:** the brass `docket-spike.png` with its pin and a count label; live situations as slips (`slip-why-stopped.png`) along the edge, each with a punch hole, its title on up to two lines and its date. *Rejected:* slips impaled on the spike itself, which would hide all but one.
- **"Let the days run":** the one primary act: a gilt-lettered green morocco plate (the blotter's leather and baize), the largest type on the desk's edge. The only other green-and-gilt buttons are the act that sends the turn ("Send orders & run days") and the primary act of a sheet. *Rejected:* a wax seal or a bell pull; both read as decoration rather than a control.
- **First morning's note:** a card on the front edge, never on the map.

### 2.7 Papers

- **Choice:** the stock sets the paper: laid letter paper with chain lines for letters, buff form stock with printed double rules, two-column filled fields and ruled writing lines for telegraph forms, white printed stock for returns, newsprint for the press. The author's post is the heading; the received stamp is an ink impression (`stamp-decided.png` as a mask) with its word set in type. A paper opens with a short slide (reduced motion: none) beside the place it names, and goes right of the place when the left would cover it. It is clamped to the blotter, so it never covers a tray or an object.
- **The paper clip** (`paper-clip.png`) holds the open paper at its head. **A filed paper** carries the file's stamp (`stamp-filed.png` as a mask, the word "Filed" set in type) in the file drawer and the daybook; it is the desk's own mark, so it shows only what the player did.
- **Rejected: forms copied from period scans.** The period conventions are still **needs-source** (`PRESENTATION.md` 9); the forms here are interpretation, like R15's.

### 2.8 Tools brought forward

- **Org board:** the cork board frame round the whole sheet; every post a pinned card in rows; a post with its own chain of posts takes a full row so the chain stays legible.
- **Ledger:** the open spread art as the book, its rules softened under a page tone, the tabs as ribbon tabs (selected one stamp red).
- **Daybook:** one bound journal page with a leather spine and faint rules.
- **File, in-tray, out-tray:** a wooden tray or drawer; papers as sheets in their own stock, unread ones with a turned corner; filed papers in the drawer as manila folders.
- **Key card:** a printed card, keys in small frames.
- **Writing an order:** a ruled order pad.
- **Every sheet:** printed stock with the title over a double rule; the redundant "The president's desk" eyebrow is hidden. *Rejected:* restyling each sheet's internal layout; the structure, tests and keyboard behaviour stay as they were.

### 2.9 Dates

The lead amended this lane's third call: every date the player reads uses the written form. One formatter, `web/dates.ts`, writes "5 March 1861", and "Tuesday, 5 March 1861" on the calendar block, with integer arithmetic for the weekday. Data keeps ISO dates (snapshots, `deskDate`, `reportDate`, file names and tests); the view passes them through the formatter: paper datelines and stamps, the staff map's cartouche, header, captions, notes and text record, the daybook, the ledger and Congress leaf, the order slips and dispatch record, the stop slip, the days passing, the advance agenda and the week's papers. The presenter's text and name lookups write out any ISO date inside console prose or pack strings, so none leaks into the view. `<time>` elements keep the ISO date in `datetime`.

- **Raw day numbers too** (the lead's follow-up): a seat day never stands in for a date. The paper cards in the in-tray, file and daybook read "5 March 1861" and "written 5 March 1861" (they read "Day 0" and "Written 0"); the board's sources, a person's "Holder recorded as of …", "Vacant since …" and "Last heard from …", and the enemy table's "As of …" are written dates; the calendar sheet and the daybook's day headings no longer add the seat's day count. App supplies the written date once, through a context (`web/desk-date.ts`), so a card deep in the board or the audience cannot fall back to a day number.
- **Checked:** `test/s60-written-dates.spec.ts` reads every rendered line, spoken name and tooltip on the first morning, with each tool open (including the order sheet, a person's page and the appointments sheet), with a paper open, in the map's text record, and after signing a slip and running a turn (the days passing, the stop slip, the out-tray, the daybook, the ledger and the rest); none holds an ISO date or a raw day number ("Day 0", "written 0", "as of day 3"). It also reads the in-tray's paper card for its written date. `test/dates.test.ts` checks the formatter.
- **Desk tests updated** where they matched an ISO date in the view: `s39-verify`, `s47-verify`, `r19`, `r20`, `r29`, `s33`, `s33-papers` (whose daybook heading also loses its day count), `s19`, `s33-discovery` and S60's own decoration check. Tests on data (`deskDate`, `snapshot.date`) are unchanged.
- **Not changed:** the map-style study page (`?study=1`), a review tool rather than the desk, still prints ISO dates.

### 2.10 Type

Old Standard for printed labels, forms and numbers; IM Fell English for titles, headings and hands; Libre Caslon for set text and notes; no new face. Chrome text sits on a scale tied to the screen's height (12–17, 13–20, 15–25, 17–32 and 27–58 pixels), so 3440×1440 and 1920×1080 read alike. The text-size setting scales chrome and papers alike, from 80% to 200% (`PRESENTATION.md` section 5; S61 found an earlier 135% cap on chrome, now removed).

**Enlarged type reflows rather than squeezes.** The edges widen with the text, up to 1.55 times, and the front edge deepens, up to twice. Above 140% (the existing large-type setting) the right edge's objects become labelled rows, each with its object drawn small beside its name, so every tool stays in view at full size. The instrument strip wraps into as many rows as its type needs, with its two selects held at a readable width, and its switch for the text record takes a row of its own; the map gives up the height, not the strip. Trays give up height before anything overlaps, and a folded key shows only its title and switch. The map stays the largest object: 43.6–45.4% of the screen at 135% and 26.8–33.6% at 200%, at 1920×1080 and 1280×720. *Rejected:* letting an edge scroll at 200%, which would hide tools the way drawers would (ruling 1); keeping the full-size objects with labels shrunk to fit, which defeats the setting.

## 3. The rules kept

- **Labelled controls:** every object is a button named by its text or label; decorative art is `alt=""` or `aria-hidden`. Checked: every visible control in the desk is named, and no image lacks an empty `alt`.
- **Keyboard focus:** one two-tone ring for every surface (a dark inner ring for paper, a pale outer ring for wood and baize). Checked by tabbing 26 controls. DOM order follows the visual order.
- **Contrast:** each text is measured against the actual pixels behind it, with the text hidden, at the worst 1% of those pixels: the desk's labels at 1920×1080 and 1280×720, and every text in eight sheets (the trays, the file, the ledger, the daybook, the board, the docket and the key card) in the plain, high-contrast and evening-lamp skins. Text scrolled out of a sheet's view is not counted. Of 313 texts the lowest is 5.69:1; every one passes 4.5:1. Each sheet must also have an opaque surface. In high contrast every sheet is plain white with black type: S61 found the trays and the file had lost their surface in that skin (their only background was a gradient, which the skin strips), and the ledger had the same fault; with the rule disabled the check fails at about 1:1, as S61 measured.
- **Reduced motion:** the slide of a paper or stop slip and the lifts on hover are off; checked.
- **Nothing the seat hasn't received:** decoration follows received data only: sheets in a tray only when it holds papers, one slip per live situation, the calendar face from the desk's date. Checked against `/api/desk`.
- **Image rules (0053):** no human figure, plantation motif, flag, seal or emblem is drawn; the objects are stationery, wood, cork, leather and brass. No likeness of anyone.
- **Written dates:** no rendered text, spoken name or tooltip holds an ISO date (section 2.9).
- **No slogan copy and no all-caps labels:** checked in the DOM. (The map's region names on the canvas remain the renderer's lettering.)
- **New raster art:** none.

## 4. Layout at each size (S56)

The layout check (`s60-layout.spec.ts`) passes at all four sizes: nothing leaves the screen; no desk object covers another, the map's sheet or its strip; the map is the largest object (55.6–57.8% of the screen); the key stays on the sheet; no label is clipped. An open paper stays inside the blotter and clear of every object at 1920×1080 and 1280×720.

## 5. Not done, and limits

- **Docket slips and plan review** were checked by hand on the lane's own servers (a Union run to 30 March; the R26 plan fixture), not in the S60 harness, which stays read-only on the first morning.
- **Four stamps** are still unused: there is no honest place for "decided", "referred", "closed" or "let it take its course" until the docket keeps decided cards.
- **The audience, battle night and study** were not restyled; nor was the plan sheet's inside, only its place on the map.

## 6. The lead's rulings (2026-11-22)

1. **Accepted:** the desk keeps its objects at every size, with no 16:9 drawers (2.1). The lead records it as amending 0053's drawer clause.
2. **Accepted:** the key opens by itself on a map of at least 1000×640 and folds below (2.3).
3. **Amended and applied:** every date the player reads is written out (2.9).

## 7. S61 review fixes

Codex's review (S61, `C:\Pyrrhic\mandate-reviews\S61-desk-look-review.md`) approved the redesign after two accessibility fixes, both applied: an opaque high-contrast surface for every sheet (section 3), and chrome scaling to 200% with reflow (section 2.10). The checks for both are in `s60-layout.spec.ts`: the sheets in three skins, and the layout and type size at 135% and 200% at 1920×1080 and 1280×720. The map-look select's names, which the review called taste, are unchanged.

Found while verifying the fixes: once the strip can wrap, a sheet laid on the map (an open paper, the stop slip, the plan sheet) could no longer be sized from a fixed allowance for the strip; at 800×600 the stop slip covered "Fit the map". The app now publishes the measured drawing as `--drawing-top`, `--drawing-left` and `--drawing-bottom-gap` on the table, and those sheets take their box from it. The turn played in `s60-written-dates.spec.ts` checks that the stop slip stays on the drawing and clear of the strip.

## 8. Regression

The existing desk specs that run without retained fixtures were rerun on this branch's port with `S60_SPECS` (`desk`, `keyboard`, `keyboard-actions`, `skins`, `s29-controls`, `s39-verify`, `s47-verify`, `sendback-notes`, `s45-map`). The same 15 fail before and after the change: they need retained fixtures under `art-masters/S29`, `S39` and `S47` that this worktree does not have, or they look for the room objects the R26 table replaced (`.run-object`, `.write-object`, every object inside the "Desk objects" bar). `s45-map` passes after its one assertion change (section 2.1). After the written dates (2.9) the run is unchanged: 14 pass, the same 15 fail, 25 skip. The prototype's unit suite (160 tests, with the formatter's) and typecheck pass.

After the S61 fixes and the day-number fix the run has the same 15 pre-existing failures and one more: `s45-map`'s region-name audit stops at its 240-second budget. That is load on this shared machine, not the layout: with a longer budget it passes (no misplaced name) in 7.3 minutes on this branch and in 8.6 minutes on the committed code before these fixes, measured back to back. Its budget may want raising for this machine; that is outside this lane.
