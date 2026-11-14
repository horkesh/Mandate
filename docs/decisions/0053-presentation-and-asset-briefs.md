# 0053: The presentation design and the asset briefs are accepted

Status: accepted (2026-11-14). From the presentation design lane (`docs/design/PRESENTATION.md`, `docs/design/ASSETS.md`), approved by the standing reviewer and, for its image and sound rules, by a separate gate reviewer. The owner asked for how the game looks and plays to be written down, with asset briefs and an owner. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0013, 0025, 0032, 0040, 0043, 0046, 0048, 0049 and 0051.

## Decision

**The game is played at a desk.** `docs/design/PRESENTATION.md` is canon for the interface; elements it marks "proposed" are accepted with it.
- One flat 2D screen at 3440×1440 (0049). The staff map holds the centre; the inbox, calendar and attention meter sit on one edge, and the org board and ledger on the other. At 16:9 the side areas become drawers and the map keeps its size; no panel spans the width; papers keep a readable line length.
- The map draws only what the staff believe (0013): fronts, pockets and supply from claimed control and signed reports, the player's own forces at their last reported position with the report's date, ageing marks that fade, and never a message's place on its route or any position derived from truth.
- Situations and reports arrive as papers in the inbox, each with an author and route (0032); a live situation's clock shows on its paper. Papers open in place. The audience is the one scene change. Battles arrive as hour-stamped dispatches.
- Orders go through an out-tray that the shell holds until the days run; the order form shows the route's typical days and price; the president sees no preview of a man's compliance.
- Attention costs follow 0025 and 0040, with delegating and ignoring free.

**Assets** follow `docs/design/ASSETS.md`: one brief per asset family, each with exact files, sizes, folders, a recipe and checkable acceptance criteria, made by Codex, by code or from public-domain sources (0048, 0051).
- Portraits of real people are their public-domain photographs, processed without AI tools (0051). A photograph later than the scenario's start is dated on its card. A person with none, after a recorded search, shows "no likeness on file". Every rostered person gets the same search effort, and Native sitters are named by their own names.
- The gate's rules apply to images and sound: no human figures or plantation motifs in decoration; no Confederate emblem outside a document the gate has placed; no minstrel-origin or Confederate melodies, no spirituals or work songs as atmosphere, no sounds of violence against people; Native nations' lands carry their own names; retrospective statements are attributed claims, never the game's explanation. `CODEX.md` carries these rules too.
- Only game-resolution assets enter the repository, behind Git LFS once the owner confirms the allowance.
- The first Codex requests, in order: a paper and desk-surface pilot, the remaining textures, desk chrome, map ornaments, a portrait pilot (McClellan and Stanton, after a person records the Library of Congress item rights), the demo cast, core sounds, document decoration, generated officers, then store art.

**Ownership** (0048): the lead owns presentation canon through records and writes Codex's requests from the briefs; the standing reviewer checks deliveries, and the gate reviewer checks anything under the gate.

## Consequences

- Phase 2's desk builds from these documents; the demo storyboard (early March 1862) is the first target.
- Owner items before the first request: the Git LFS allowance, which plan Codex runs on, and the Library of Congress item pass for the portrait pilot (`docs/OPEN_QUESTIONS.md`).
- Open: the handwriting typeface's licence (and 0035's typeface list if it is adopted), a 16:10 test machine, and how Native nations appear beyond their names (R3).
