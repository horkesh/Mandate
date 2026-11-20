# 0104: The opening of the war follows its causes and its news

Status: accepted (2026-11-20). The lead's rulings when lanes 1.11 and 1.12 met in one history run. Built by Codex (R74, R78, R80, R81, under 0096) on `phase1-rule-seats-b`, and reviewed by Claude's standing reviewer and the gate reviewer. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0066 and 0040 to the opening; extends 0098 and records a change to 0052's tick order.

## Context

- Once lane 1.11's situations and lane 1.12's bombardment ran together, the history run went wrong in three ways:
  - Sumter fell on 20 April, a week late. Under R74's terms window (11 to 13 April) that became Anderson's capture, so the signed evacuation notice never fired.
  - Lincoln was told the fort was fired on at Davis's decision of 10 April, two days before the first shot.
  - Lincoln then called for troops on 11 April, four days ahead of the proclamation of 15 April.
- 0066 says a principal is never at war before he knows. The signed Sumter notice quotes Beauregard's offer of 11 April.

## Decision

1. **The record's terms apply only in the record's case** (R74). A `recordTerms` row grants its terms only when its cited conditions hold: the fort falls under the commander the record names, within the window after the recorded offer. Otherwise the garrison and its commander are captured through the existing owners, which is 0074's default of no terms the record doesn't state.
2. **A bombardment from guns already in battery opens on time** (R78). Batteries in position within range skip preparation and staging, by a pack rule (`inPositionPreparationDays`, 0 for union-1861, with its source, OR I-1 p. 30). Guns that must first move still march. An urgent bypass around an objecting official goes by the telegraph where the record has it used, and an order that needs no travel settles on the day it is issued. The doctrine's Sumter row is gone, because lane 1.11's `reduce_sumter` sends the goal, so the order goes once.
3. **Davis's order follows its cause.** `confederate_opening`'s option opens three days after the situation surfaces (`clockAtLeast 3`), not on a calendar date. In the history run that falls on Walker's authorization of 10 April (OR I-1 p. 297), and in other games it stays tied to the relief or landing that raised it. `war_begun_confederate` is set at Davis's decision, because Walker's authorization is the Confederate act.
4. **Lincoln learns of the firing from the fort's dispatch** (R80). `sumter_fired_upon` fires when the Union principal holds a received battle-phase claim at the fort. Its only source is the defending commander's own wire, sent before a surrender vacates his post. Nothing reads truth.
5. **Lincoln calls for troops on knowing the fort has fallen.** `call_for_troops` waits for his knowledge of the fall, with a sourced deliberation day, and with a fallback for a fort that holds. The Union's war flag then falls on 15 April, the day of the proclamation.
6. **The tick order gains two delivery passes,** beyond 0052's phase 2. `deliverBattleDispatches` delivers battle-phase wires (phase 4a''), and `deliverSituationOrders` delivers zero-day situation orders after phase 4b. Each delivers only its own kind.
7. **`heldPost` finds a post's holder in one scan** (R81), with the same result as before (the smallest match by `strictCompare`). Sorting every lookup had put the integrated run over the tick budget on CI.

Rejected:
- **Counting the terms window from the bombardment's start.** The signed notice quotes the offer of 11 April, so a fall a week later would make it untrue.
- **Accepting a capture in the history run.** It contradicts the signed notice.
- **Opening Davis's option on 10 April by date.** That gives the same history, but in other games it would wait for the calendar instead of its cause (the gate reviewer's B2 rule).
- **Telling Lincoln at Davis's decision, or calling troops on that notice.** He would be at war before he knew (0066).
- **Raising the tick budget.** R81 brought war by decision from 54.5 ms to 29.1 ms a day on CI, with no change in behaviour.

## Consequences

- The history run with no `--at-war` now opens as the record does: relief ordered on 6 April, Davis's decision on 10 April, the first fire on 12 April, Sumter's evacuation under Anderson on 13 April with the notice on 14 April, and the militia call on 15 April.
- Virginia now secedes on 20 April against the record's 17 April. That goes to lane 1.14's calibration and the checkpoint bands.
