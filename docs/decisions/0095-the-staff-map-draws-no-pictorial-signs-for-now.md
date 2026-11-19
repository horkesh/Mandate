# 0095: The staff map draws no pictorial signs, for now

Status: accepted (2026-11-18). The owner, after seeing R36, R38, R39 and R40: "I dislike all of those. At this point, I'd rather stick to the straight map if we can't get better solutions." Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Narrows 0013 item 3 for `union-1861`. Refines 0093.

## Context

- The owner asked for hand-drawn elements like AGEOD's (R34). Codex built procedural signs placed from data, in six passes:
  - R34: small, icon-like signs.
  - R35: ink and wash, baked.
  - R36: placement and capitals.
  - R38: under the washes, one ink.
  - R39: legible under the wash.
  - R40: crisper.
- R37's research found that AGEOD's towns were separate sprites, which belonged to the map because they shared a hand-painted material, made by an artist (`docs/research/2026-11-18-ageod-map-integration.md`).
- Each pass fixed what the last got wrong, and each was measured. None reached the charm the owner wanted: drawn on top, the signs looked like stickers; integrated, they looked faint, then blotted, then like a grid of icons.

## Decision

1. **The `union-1861` staff map draws no pictorial signs:** no towns, capitals, forts, crossings, mountains, woods or marshes as drawings. Places are shown by their names, as on the map before R34. The relief, rivers, rail, washes, fronts and reports carry the map.
2. **Kept from that work,** because it is not the signs:
   - the research palette (0094 item 5);
   - the compass and scale on a margin card;
   - water labels that sit on their own water;
   - the baked static layers;
   - the sign code, which stays in the prototype, off by default, as a record of what was tried.
3. **The way back is a better source of art, not another procedural pass.** If pictorial signs return, they come from a hand-made sign set by an illustrator, in the engineers' conventions, reviewed against this record. Commissioning one costs money, so the owner decides it.

Rejected:
- **Another procedural pass.** Six passes show the limit of procedurally drawn signs for this look, and each pass spent Codex's time on the owner's least favourite part of the map.
- **Keeping R40's signs on.** The owner dislikes them.
- **Image-model sprite sheets.** That route is untried here. It would need curation against 0051's provenance rules, and the owner asked to stop.

## Consequences

- R41 turns the signs off by default and keeps item 2's pieces.
- Phase 2's desk lane inherits the decision. 0013 item 3 still allows signs for other packs.
