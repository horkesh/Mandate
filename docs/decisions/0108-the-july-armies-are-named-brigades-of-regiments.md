# 0108: The July armies are named brigades of regiments

Status: accepted (2026-11-22). The owner's decision on 22 November ("Yes, queue it") to the lead's question "Queue the July 1861 armies as named brigades in the scenario?". It rests on S66's research and mechanism proposal: `docs/research/2026-11-22-S66-july-armies.md` and `docs/design/S66-NAMED-BRIGADES-PROPOSAL.md`, on `sprint/research-military` at `6deda1a8`. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Extends 0033 and 0073.

## Context

- **No block matches a command.** The pack's raised blocks are statewide batches, one per governor per call day, with no regiment identities (S64). So McDowell and Patterson command no troops in July, there is no Union offensive, and no battle is fought at Manassas (S67).
- **The organising orders exist in the record.** S66 read the Official Records (series I, volumes II and LI part 1) and Dyer's *Compendium*. It recorded 365 observations of units within commands, and found the organising orders:
  - McDowell's General Orders No. 13 of 8 July (OR I-LI.1 pp.413–414);
  - Patterson's Special Orders Nos. 66, 68, 76, 94 and 96 of June and July (pp.397–398, 406, 415–416);
  - Beauregard's General Orders No. 20 of 20 June (OR I-II pp.943–944);
  - Johnston's roster of 30 June (p.470).
- **No model batch can be matched to a historical regiment by its date and call.** The game's governors raise regiments on the game's dates, not history's.
- **The batches fall short of 0033.** It already says the 1861 pack starts as brigade-sized blocks grouped under their commanders, and that divisions form as the army grows.

## Decision

1. **Regiments are components inside brigade-sized blocks.**
   - `forces` owns each regiment's lot: its identity, arm, raising post and person, call or act, and service term, plus its men and stragglers when they are known.
   - A lot belongs to exactly one block. The block is still what moves and fights.
   - A block's strength and stragglers are derived from its lots, and never saved beside them. Unknown quantities stay unknown in every sum.
   - A regiment has no location or commander of its own: it has its block's.
2. **Identities come from a sourced catalogue, and are assigned as regiments are raised.**
   - The pack carries each regiment's identity, aliases and dated observations from the Official Records and Dyer.
   - When a governor raises regiments against a call, recruitment gives them his state's next unused catalogue identities, in the catalogue's order. Each identity's sourced term must fit the call.
   - Regiments raised beyond the catalogue carry generated identities, marked as generated.
   - If a governor raises fewer regiments than history, the later ones never exist.
   - No regiment is created on its historical date, and no identity is matched to a model batch by date.
3. **Regiments reach the field army only by transfer** (0033).
   - The field commander or the War Department asks the raising or sending commander for a force, and the sender chooses which regiments go, by his own compliance.
   - Movement's join orders and the real routes govern the journey.
   - A historical roster may guide what is asked for. It never moves a regiment.
4. **The army or department commander organises his own command.**
   - A pack organisation template records a sourced order: its brigades and divisions, their regiments, and the order's date, which is evidence and not a trigger.
   - The commander's organisational act forms the regiments actually present under him into the template's brigade blocks, and opens its division posts. What causes the act is his holding regiments he hasn't yet organised, not the date.
   - `forces` regroups the lots, and `command` opens and fills the posts. The act succeeds whole, or it changes nothing and returns typed reasons.
   - The President doesn't form brigades or pick regiments. A verb for the President to instruct a commander to organise can come later; 1A doesn't need one.
5. **Division posts persist.**
   - They are templates declared in the pack beneath the army or department post. The commander's act opens one when he has real formations and an eligible holder.
   - A later act closes one. For example, Miles's division was broken up on 25 July (OR I-LI.1 p.425).
   - They don't close when an operation ends.
   - Johnston's and Beauregard's brigades sit directly under their armies, because the sources read show no standing Confederate divisions in July. The attack plan's "divisions" of 20 July (OR I-II pp.479–480) stay temporary groupings.
6. **Divergence is kept.**
   - The act forms what is present. A named regiment that is absent, elsewhere, discharged or never raised stays absent. It is never cloned, and its place is never filled with average men.
   - If the commander puts another regiment in its place, his return names the substitution.
7. **Brigade and division commanders are people.**
   - Commanders the pack lacks get records from a cast research request, under the evidence rules (0085, 0087). Stats are left unknown where no contemporary evidence was read.
   - Generated officers (0020) appear only where the source names no commander.
8. **The budget stands:** 100 µs per block per day (0033), and 40 ms a day for the whole tick (0106).
   - S66 estimates at least 158 blocks on 31 July.
   - Lot totals are recomputed when a lot changes, never in the daily scan of blocks.

Rejected:
- **One block per regiment.** It multiplies the block count against the budget, and rebuilds the order screens 0033 rejected.
- **Renaming the statewide batches as brigades.** Regiments would still have no identities, and men on different service terms would share one expiry.
- **Adding the historical armies on top of the raised batches.** It counts the same men twice.
- **Creating each regiment on its historical muster date.** That is a calendar arrival, and it bypasses the governors' compliance (0073).
- **Matching model batches to regiments by date.** S66 found no exact matches, and the game's dates diverge from history's.
- **Divisions fixed from 5 March.** Wrong for the period (0033).
- **The President forming brigades.** It puts the player in the general's seat (0016).
- **Forming brigades on the order's date.** That changes State by the calendar, not by a cause.

## Consequences

- **A schema and save migration:**
  - lots in `forces`;
  - derived block totals;
  - service terms held by each regiment;
  - ownership and FOUNDATION writer rows for each new field.

  No released save exists, so fixtures are regenerated with the prescribed tool.
- **The build goes in `sprint-july` (0107), in two requests:**
  1. the lots, the catalogue and recruitment, keeping every unrelated output the same;
  2. the organisational act, the division posts, the templates and the transfers.
- **The commit.** The July stack commits once the build makes the July contact the record shows, with no band widened and no assertion changed.
- **A cast request** for the July commanders the pack lacks.
- **S66's research holds stay open:**
  - the whole Washington garrison on a single day;
  - the regiments of Carson's and Meem's militia;
  - several aliases;
  - the regiments' strengths.
