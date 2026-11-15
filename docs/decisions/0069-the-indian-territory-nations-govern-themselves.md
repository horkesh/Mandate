# 0069: The Indian Territory nations govern themselves, and only their own acts move them

Status: accepted (2026-11-15). Refines 0046. Places part of record R3 ahead of R3 itself. From the gate review of the governments research (`review-gate-indian-territory.md`, approve after fixes) and the research note `docs/research/2026-11-15-governments-and-stores-1861.md`. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. R3 adopts or supersedes this when it is written.

## Decision

**Representation (R3's question, answered for the Indian Territory in Phase 0).**
- Each nation's own government is a department of kind `nation_government`, with no faction and the nation's own name. Its land is neutral ground under 0055 and 0058.
- Its choices are dated events the nation owns: neutrality, independence, councils, the Articles of 1 July 1861, and treaties.
- A treaty is the nation's government's own act, a change of side under 0065 and 0067, with the Confederacy as the other party. It is not an act of the Confederate rule seat.
- `SENSITIVE-HISTORY.md` section 3.7 changes accordingly. The interim rule still covers the Confederacy's own acts toward the nations, and "no Union decision in 1861" stands.

**Only a nation's own act moves it.**
- A department kind may be marked `selfGoverning` (set on `nation_government`).
- A proposal that changes such a department's side, closes or reopens it, or moves its regions may appear only in a notice's effects, never in a decision's options or inaction. So no principal can make a nation either side's possession by choice.
- A region held by such a department moves only to another department of the same kind. That allows a nation's own rival governments, such as the Cherokee in 1862–63, and never annexation to a state, a territory or a military department.
- The pack validator and the kernel guard both check this, with a test for each part.

**One nation, one region, before any nation's government is applied.**
- The map is split first: Cherokee, Muscogee (Creek), Seminole, Choctaw, Chickasaw, and the Leased District, whose peoples are their own.
- Until the split, both Indian Territory regions stay `unknown`. Sealing the land to passage is an inaccuracy of mechanism, but an interim row would be an inaccuracy about who governed whom, which the gate exists to stop. That matters most for the Chickasaw, who had separated from the Choctaw in 1855.

**Wording.**
- A nation's land is never "no one's", "open", "unclaimed" or a "corridor". Control rows say "neither side's".
- Opothleyahola's people are "Opothleyahola's loyalists", as in section 3.7, until a source gives their own term.
- The Choctaw resolution of 7 February 1861 follows "their own people's ties and interests", which it says bind them to the Southern states, conditional on a permanent dissolution of the Union.
- The territories' department notes for Dakota, Colorado, Nebraska and New Mexico say that the act excepts treaty Indian lands until the tribe assents, that most of the region's land was the nations', and that the department is the Territory's government, not the government of the nations living there.

**Before release (R3 is a ship-blocker in any case):**
- The real pack's gate lists the nations as protected groups, with the forbidden words near them.
- A force of either side entering a nation's land can fire that nation's own response as an event, as Pratt Street fires from Baltimore. This is a facet of `indian-territory-1861`.
- The 1 July Articles' rider is quoted only as the nations' own attributed text, with its date, its signers' nations and the Grand Council it formed.

Rejected:
- **Interim government rows on the unsplit boxes.** They fold nations under each other's governments.
- **Letting either principal's decision close a nation's land or change its side.** That makes the nation a possession by the player's choice.
- **Reusing `nation_government` by analogy for the territories' nations without a source.** R3 needs research first.

## Consequences

- **The governments research lane** fixes the wording now (the Choctaw sentence, "neither side's", Opothleyahola's loyalists, the territories' notes, and the draft map's "declared for the South").
- **The same lane then:**
  - researches the thin items: the Muscogee and Seminole governments and nation-voiced sources; the Upper Creek; the Leased District's peoples and the treaties of August and October 1861; the dates the forts were abandoned;
  - proposes the region split.
- **A code lane** builds the `selfGoverning` rule before any situation touches a nation.
- **The gate reviewer re-checks** the wording fixes, the split and the applied patch.
