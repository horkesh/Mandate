# 0094: The president's map shows claimed control, in bold colour

Status: accepted (2026-11-18). The owner approved the kernel work ("Go ahead") and set the colour direction for the map: "way too drab. We need color, control needs to be marked... it should look like a real staff map, yes, but with a splash of fun and gaming." Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out the consequence of 0054 that the staff map's lane owes ("the control index is a function of any control table, so the staff map can draw fronts from a seat's claimed control"). Refines 0093 item 1 on colour.

## Context

- Since R26 the desk prototype has been the table of 0093. In play, though, its map is bare paper. The seat view (`view/types.ts`) carries `enemyBeliefs`, `worksBeliefs` and `obstructionBeliefs`, but nothing about who holds a region, so the map has no wash and no front.
- Control is State (`regionControl`), written only by `control` (0054). A seat may never read it (FOUNDATION section 8; `test/boundary.test.ts`). The staff map draws only from claims (0013).
- The control index is already a pure function of any control table (0054), so fronts can come from a claimed table.

## Decision

1. **Claimed control is a belief, derived on read and never stored** (hard rule 5), like `enemyBeliefs`.
   - For each region it holds the shares by faction as he has been told them, the holder or "contested" by 0054's rule, the day it stands as of, and the reports it rests on (hard rule 6).
   - It is **ink** when two or more authors agree on the holder since its last change, and **pencil** when it rests on one author. Ageing is shown from its date (0013).
   - The opening picture counts as ink, because the political map it records was public. Without this, all 219 regions draw in pencil, since the bulletin has one author per side (the reviewer's finding, `review-claimed-control.md`, before the merge).
   - The player sees the holder, and whether a region is contested, never the share as a figure. How a commander perceives shares is an open question.
2. **The opening picture.** At the scenario's start, each seat holds one report of the country as it stands. It is dated the start day, written from the post the pack names for the faction, and carries a control claim for each region from the scenario's start table.
   - This reads truth once, at the start, because in March 1861 the political map was public.
   - A pack whose start is not public knowledge supplies its own opening table in place of the start table.
3. **A control claim.** A new claim kind, `control`, carries the faction (as its token) and its share (as its value).
   - Every report that already tells of a change of hands (0054: written when a garrison or the staff reports it) carries a control claim for that region.
   - For each region, the latest claim wins (by stamp, then arrival, then id), as for every other belief.
4. **Claimed fronts.** The control index's own front function runs over the claimed table. The view carries the segments, each with its two regions, the side its teeth face, the date and ink or pencil.
   - The control-table types move to a file of plain vocabulary that the view layer may import, which is the move 0054 left to the staff map's lane.
   - Nothing on the seat side reads `regionControl`. A test changes truth without a report and shows that the view does not change.
5. **How the desk draws it: real colour, used boldly.**
   - The Union is **blue** and the enemy is **red**, as Union staff maps marked the two sides. A neutral government's ground (0055) takes a third colour, a yellow ochre.
   - For `union-1861` the colours are the research palette of `docs/research/2026-11-18-wargame-map-looks.md` section 8.1: Union `#1F59A8`, enemy `#C33830`, neutral `#D5A32F` and corrections `#76509B`. Each wash has a narrow pooled rim and a gentler middle, so the paper and relief read through it. The owner chose this over R30's stronger palette after the R33 comparison (2026-11-18).
   - Washes are full watercolour fields with outline colour at the borders. Contested ground is hatched in both sides' colours, a pencil claim is lighter with a broken edge, and an old claim fades.
   - The paper, ink and relief of 0093 stay. The colour sits on them, not instead of them.
   - The game shows through in motion and response, never in chrome:
     - new marks draw themselves on;
     - a front redraws when a claim changes;
     - a region warms under the pointer and shows its claim in words: who holds it, by whose report, and as of when;
     - headquarters signs carry their side's colour;
     - an approved plan's arrow fills with colour.
   - The enemy still has no flag, seal or emblem as a marker (`ASSETS.md` section 0.3); his marks are red pencil.
   - So that red means the enemy alone, corrections take the pack's correction colour (0013 item 1), which for `union-1861` is violet copying ink. The president's blue pencil stays a pencil line, never a wash.

Rejected:
- **Reading `regionControl` into the view.** It shows truth, and the boundary test refuses it.
- **Storing a claimed-control table.** It would be a second writer of derived data (hard rule 5).
- **An authored opening table for 1861.** For 1861 it would equal the start table, so it would be data work for no difference. The pack's override covers starts that differ.
- **Grey for the Confederacy.** Union staff maps used red, and grey fades into the paper. Colour must carry the claim.
- **Region-by-region colour, as in look C.** It competes with control (0093).

## Consequences

- R29 asks Codex for items 1 to 5, the kernel work on its own branch in its own worktree (0092). The prototypes are committed to that branch first, so the desk can draw from the new view.
- A review lane checks the branch before the steward merges it (0092 item 5, 0045). The prototypes reach main with it, after their own review.
- `PRESENTATION.md` section 3.1's claimed-control row is now canon by this record. Its colours are the ones in item 5.
