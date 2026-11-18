# 0093: The staff map is the engineer's manuscript, and it covers the table

Status: accepted (2026-11-18). The owner found the staff map "very bland" and called it "the heart of the game". Codex drew three looks and a layout mock (R22, R23), and the owner chose look A: "A, but it needs to be improved much". The layout follows the lead's recommendation, decided under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0091 (the prototype's look and the map's place on the desk). Refines 0013's 1862 era skin. Refined by 0094 (claimed control in bold colour) and 0095 (no pictorial signs, for now).

## Context

- 0013 fixed the line language (ink, pencil, red correction, blue pencil, fading) and named the 1862 skin "ink on linen, hachured ridges, engraver's water lines". It left the look itself open.
- The prototype's map (R18 to R21) read as a clean survey map. It opened on the whole continent, lacked relief, rail and washes, and was a sheet the player picked up from the desk and put down again. That made it feel like a side screen.
- R22 and R23 drew one Eastern-theatre scene in three looks, from the real geometry, with ETOPO relief and Atack's 1861 rail:
  - A, the engineer's manuscript;
  - B, the engraved atlas plate;
  - C, the coloured war map of the press.
  They also drew D, a mock of the map filling the screen as the president's table.

## Decision

1. **The `union-1861` era skin is the engineer's manuscript.** The map is ink and watercolour on toned paper, as the Union's topographical engineers drew in the field:
   - brown ink;
   - hachured relief;
   - watercolour washes for claimed control;
   - graphite pencil for single reports, and blue pencil for the president.

   The line language of 0013 is unchanged. Other packs choose their own skins (0013 item 3).
2. **The map covers the table.**
   - The staff map fills the screen, and the president's papers lie on it: the in-tray at an edge, an open report beside its marked place, and a person's card beside that person's flag.
   - The map is never a sheet the player opens and puts down.
   - The org board, ledger and file still come forward over the map when called for.
3. **The bar is high.** The owner judged A good only as a direction. The next requests to Codex raise it until a still from the game reads as a hand-drawn staff map of 1861 that has been used.

Rejected:
- **B, the engraved atlas plate.** It was crisp but cold. It reads as a printed reference, not as the staff's working map.
- **C, the coloured war map of the press.** A flat colour for every region competes with the washes of claimed control. On the staff map, colour must carry what the staff claims.
- **Today's look (0).** The owner found it bland.
- **The desk with the map as one panel among the papers** (`PRESENTATION.md` section 1). It is legible, but the map becomes one surface among many.
- **A separate map screen** the player switches to. That is what the prototype did, and it is why the map felt secondary.
- **A war-room scene with a wall map.** It needs heavy art for every room and reads less well.

## Consequences

- R24 asks Codex to raise look A to the bar in item 3 and to make it the prototype's default look. The B and C skins stay in the prototype as proof that skins are pack data, at no further cost.
- Rewiring the desk prototype into the table layout is a later request, after the look.
- The Phase 2 desk lane redraws `PRESENTATION.md` section 1's layouts to match item 2.
