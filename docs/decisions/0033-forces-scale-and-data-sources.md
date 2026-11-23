# 0033: Transfers name a force, not divisions one by one; force blocks fit the period; data comes from public-domain sources

Status: accepted (2026-11-14). From the war-scale lane (`docs/research/2026-11-14-war-scale.md`) and the secession-winter lane (`docs/research/2026-11-14-secession-winter-1861.md`). Recommended by the lead; the owner takes recommendations by default. Amends 0016 and 0026; extends 0031's sourcing rule to all pack data. Amended by 0040 (first-month walkthrough revisions). Extended by 0108 (regiments inside named brigades).

## Context

- The Union fielded roughly 85–100 divisions at once at its peak, in 20–24 corps; division size fell from about 11,000 men in early 1862 to about 4,000 in 1863–64.
- A player choosing individual divisions among about 100 would rebuild *No Greater Glory*'s order screens.
- In mid-1861 Union armies were organised in brigades, not divisions; corps did not exist before March 1862.
- About 450 named people matter over the whole war, about 150–180 in the first period; corps commanders held their posts for only four to five months on average.
- Dyer, Livermore, the Official Records and the 1887 Quartermaster General's volume are public domain; the Nafziger orders of battle state no licence, Wikipedia is CC BY-SA, and Eicher and Warner are in copyright.

## Decision

**Transfers name a force.** The transfer verb names the two commanders and a force: a number of divisions, a corps, or a strength in men. The sending commander picks which units go, by his own compliance (he sends his worst if he can). A corps moves as a bundle with its commander. The interface shows men as well as unit counts.

**The engine's unit is a force block**, pack-named. In the 1861 pack it starts as brigade-sized blocks grouped under their commanders, and divisions form as the army grows. Corps posts appear when they appear historically: Lincoln's order creating corps in March 1862 is a situation the player can take earlier, later or not at all.

**Posts nest.** Military divisions (from October 1863) sit above departments, departments above armies and corps; an army and its department are often one post. The world format supports the tiers and the merged case.

**Roster size.** The pack names about 150–180 people for the first period and about 450 for the whole war; officers below general rank are generated only when they become relevant (0020's officer pool), never stored in advance.

**Pack data sources.** Data of record comes from public-domain sources (the Official Records, Dyer, Livermore, the 1887 Quartermaster General's volume, the period maps of 0031), cited in the pack. Copyrighted reference works and CC BY-SA text may be consulted to check facts but are never copied into the pack. Sources without a stated licence are not used.

**Economy refinement.** Raising new regiments and refilling old ones are separate levers, because the Union raised new regiments while old ones shrank (Phase 1 economy).

Rejected: picking individual divisions (the reassignment trap); fixed divisions from 1861 (wrong for the period); a full roster stored up front (data and performance cost for no play); copying from Wikipedia, Nafziger or copyrighted compendia (licence risk in a public, commercial project).

## Consequences

- Lane 0.3 builds the March 1861 order of battle as force blocks from public-domain sources.
- The appointment verb recurs often, so promotion lists (0026) and cheap appointments matter.
- The performance budget is about 100 µs per force block per day, inside the tick budget.
