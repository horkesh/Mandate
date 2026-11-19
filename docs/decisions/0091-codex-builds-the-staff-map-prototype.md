# 0091: Codex builds the staff map into the desk prototype now

Status: accepted (2026-11-17). The owner asked where the map comes in, since a player should not play through dry reports alone. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0090 (which had rejected the staff map for now) and 0089 (the desk prototype's scope). Amended by 0093 (the look is the engineer's manuscript, and the map covers the table).

## Context

The design puts the map at the centre of play:
- **The staff map** (`PRESENTATION.md` section 3, 0013) is the president's picture of the war as his staff draws it: fronts, headquarters flags, estimates that fade with age, and pencil.
- **Plan review on the map** (section 1.4) is where the player argues with a commander. The draft's arrows come forward, and the player's blue-pencil marks become edits in the grammar of 0026.

The desk prototype (0089) is section 6's step 2: the desk with the map's text twin. The map itself is steps 3 and 4. 0090 rejected building it now, because the pack has no region geometry.

That reason was weaker than it looked:
- **Counties.** 219 of `union-1861`'s 268 regions list their 1860 counties (`packs/union-1861/source/world/regions.csv`), and 267 have a reference point. Most of the rest are sea and off-map regions, which 0031 draws as boxes.
- **County boundaries.** The map-extent research note (`docs/research/2026-11-14-map-extent-size-sources.md`, section 3.2) finds the Newberry Atlas of Historical County Boundaries usable under its current grant ("for any lawful purpose, commercial or non-commercial"). It sets three steps:
  1. get written confirmation from the Newberry;
  2. archive the grant pages;
  3. commit only simplified, dissolved region geometry, never the raw files.
- **Coast, rivers and relief.** Natural Earth is public domain.

So region shapes can be built by dissolving the 1860 counties each region lists.

## Decision

**R18: the staff map, steps 3 and 4, built by Codex into `prototypes/desk/`.**
- **Geometry.** A script in the prototype downloads the Newberry's 1860 county boundaries and Natural Earth's coast, lakes and rivers from their own sites. It dissolves the counties into the pack's regions by the `counties` column, simplifies the result and writes it into the prototype.
  - The raw downloads stay in the ignored `art-masters/R18/`.
  - The derived geometry is not committed until the Newberry has confirmed in writing (the note's step 1, the owner's email). Until then the prototype builds it locally.
  - The kernel stays geometry-free (0013), and the region graph stays authored, never derived from shapes (0019).
- **The read-only map (step 3).**
  - Drawn in PixiJS (0035) in the ink-on-linen look of `prototypes/map-style/` (0013), with labels from the pack's label hints (0043) and R16's icons.
  - It takes the text twin's place in the desk, and the text twin stays available as the map's accessible equivalent (section 5).
  - It draws only what the player's view supplies, with each mark's age shown by fading (section 3.3).
  - A layer the view doesn't supply yet is left out and listed, never estimated.
- **Plan review on the map (step 4).**
  - The commander's draft appears as hatched arrows, one per axis, and support requests as dotted arrows.
  - The player's blue-pencil marks (move an objective, move a waypoint, strike an axis) become the console's existing edit commands. Routes are drawn only after the console validates them.
  - "Send back with notes" and "Order these changes" work as section 1.4 says.
  - There are no new verbs, and nothing on the map moves a division (hard rule 1, 0016, 0026).
- **Order of the runs:** R16 (the icons R18 uses), then R18, then R17 (whose keyboard work now includes the map keys), then R15.

Rejected:
- **Waiting for the Phase 2 desk lane.** The owner wants to see the game's main surface now, and Codex's plan ends on 22 November. The lane still decides what to keep.
- **A separate map prototype outside the desk.** The map's main job is plan review beside the plan sheet and the people (section 1.4). Apart from the desk it would show neither.
- **Region shapes from Voronoi cells around the reference points.** They would look wrong beside real rivers and coasts. AWWV's lesson is to keep geometry as presentation built from real boundaries.
- **Committing the derived geometry now.** The research note asks for the Newberry's written confirmation first.

## Consequences

- `PRESENTATION.md` section 6 marks steps 3 and 4 as prototyped by Codex (R18).
- The owner's items gain the Newberry email from the map-extent note, section 3.2, step 1.
- The pack lane that later owns map data (lane 0.3's successor) moves the geometry build into the pack once the Newberry confirms, and the prototype's script becomes its reference.
- The reviewers check R18 at the resume against `PRESENTATION.md` sections 1.4, 3 and 5, and against this record.
