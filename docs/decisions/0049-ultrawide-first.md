# 0049: The game is designed for ultrawide displays first (3440×1440 reference)

Status: accepted (2026-11-14). Owner directive: "game should be optimized for ultrawide, my monitor, so make sure that is clear from the start." The owner plays on a 3440×1440, 21:9 monitor at 144 Hz with an AMD Radeon RX 7800 XT (recorded in the owner's Far Postings decision 0025; the map tripwire measured on the same machine, 0043). Follows Far Postings' rule, adapted to the desk.

## Decision

1. **The reference resolution is 3440×1440 (21:9).** Every layout, wireframe, mock, storyboard and screenshot is designed and checked there first.
2. **16:9 (2560×1440 and 1920×1080) is the secondary target** and must stay fully usable: nothing hidden or cut off. The side areas collapse into drawers rather than the map shrinking.
3. **The extra width goes to the desk, not to stretched panels.** The staff map holds the centre. The inbox anchors to one edge, and the ledger and org board to the other. No single panel stretches across the full width.
4. **Text measure stays readable.** Papers, reports and dialogue keep a maximum line length; extra width goes to margins, portraits and the map, never to longer lines.
5. **Performance:** 144 Hz capable at the reference resolution on the owner's hardware, with a 60 Hz floor. The map's lazy bake (0043) is measured at 3440×1440.
6. **16:10, down to 1280×800 (the Steam Deck class),** is checked before release but not designed for, until Phase 2 decides otherwise.

## Consequences

- `docs/design/PRESENTATION.md` draws every screen at 3440×1440 first, with a 16:9 variant.
- `docs/design/ASSETS.md` sizes assets for 1440 pixels of height at 1×. Wide pieces (the desk surface, textures, store art) are framed at 21:9, with a centred 16:9 safe area for anything that must stay visible.
- Codex requests state the 21:9 target (`CODEX.md`, 0048).
- Phase 2's screenshot checks (Playwright, 0035) capture 3440×1440 and 1920×1080.
