# 0076: The battle model, as built

Status: accepted (2026-11-16). Amends 0064. From Phase 1 lane 1.3 (`notes/lane-1.3-combat.md`), the standing reviewer's review and re-check (`review-lane-1.3.md`), and the gate reviewer's read of its capture parts (`review-gate-1861.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12's row 1.3 (0073) from `docs/research/2026-11-14-combat-model.md`, under 0074's capture ruling.

## Context

Lane 1.3 replaced 0064's simple contest with the combat note's battle model. It made sixteen choices within its brief, and its reviews closed three should-fixes:
- a term for the floor a routed side's morale falls to;
- a test that a routed force in a pocket chooses its own fate;
- a failed breakout recorded as `destroyed`, never as a surrender.

## Decision

**The battle model replaces the simple contest (amends 0064).** The pack format's `contest` rules become `occupation`, and `contestPermille` goes. A new `WorldRules.combat` holds every rate, each stated by every pack.

**The model, as built:**
1. **Contact** is the lesser side's engaged men, capped by frontage, and both sides' losses come from it. The bigger army does not win by numbers alone.
2. **Only a side whose blocks marched in may attack.** A garrison the start placed defends but never attacks (0064's rule, kept).
3. **A side's commander in a region** is the serving holder of the post whose blocks there are strongest. A vacant post's force is led by the pack's unknown man.
4. **What he sees in contact** is the enemy's known men present, inflated by his own perception bias, not his lagging reports.
5. **His decisions are pure functions of his traits.** He attacks, probes, holds, withdraws, breaks out, surrenders or pursues by pack shares of his own demand ratio, with no dice. They are rule functions, not seat requests, until lane 1.12 routes them through seats.
6. **An unknown strength fights as none** (0064). Every battle record lists the unknown blocks.
7. **The missing split two ways.**
   - A pack share by result is captured on the field, and the rest straggle and rejoin over days.
   - A force taken in a pocket has all its men captured: those left, the day's missing and its stragglers.
   - The record keeps killed, wounded, missing and captured apart.
8. **A surrendered block stays in State, spent:** strength 0, its day recorded, released from its post, never present again. Removing blocks is lane 1.7's `disband` delta.
9. **Control in battle** goes to the side left holding the field, the day the other leaves. Occupation is unchanged.
10. **A breakout** is fought the next day at the assault rates. If it fails, the force is `destroyed`, with its own counter, and the men in it are taken; it is never recorded as his surrender. A routed force in a pocket keeps its commander's choice (0074: surrender is his own act).
11. **Commanders hit:** one draw per side per battle-day, on a named stream of its own.
    - A hit commander is killed or wounded, or captured if his side routed or surrendered.
    - He leaves his post vacant.
    - `people` refuses any status change out of `captured` or `killed`, and the wounded do not yet return to duty.
12. **No battle on neutral ground** that nobody holds (0055, extended from the contest to battles).
13. **Starting morale, experience and equipment** are pack rules, the same for every block, until sourced data exists.
14. **Derived, never stored:** the battle-day's four-phase shape and its verdict.
15. **Two terms:** rearguard (the defender fell back from this attacker yesterday) and surprise (a commander with no report of the enemy's strength in a meeting).
16. **The Livermore harness** lives in the Union pack and asserts the combat note's bands over its fourteen set-ups, never one battle.

**Each battle-day draws six values from its own named stream, and its commanders two from a separate one, before any branch.** No report changes a draw. Every number in a battle record is the exact sum of its typed terms, including the routed side's `rout_floor` and the clamps.

**What reports may say** (from the gate review):
- the battle record carries no terms of capture;
- cited surrender terms belong only in capture notices for the historical cases, each fired only when that case happens in play;
- the player's first casualty return reports the day's captured as missing, and the captured figure comes later;
- a `destroyed` force is never reported as killed.

Rejected:
- **Losses from each side's own engaged men.** That is Lanchester's law by another name: numbers alone decide.
- **Every side may attack.** It brings back the Texas case 0064 rejected.
- **The senior officer by rank as commander.** Seniority needs lane 1.5's promotion lists.
- **Reading his lagging reports in contact.** On the day of battle they are stale.
- **A default strength for unknown blocks.** It fits the data's gaps.
- **Capture only in pursuit.** A rout would then capture no one.
- **Deleting a surrendered block from combat across three owners.**
- **Control by margin while both sides stand.** That is the contest again.
- **A forced surrender for a routed force in a pocket,** and recording a failed breakout as a surrender. 0074 makes surrender his own act.
- **A terms field on the battle record.** It would be State something could act on, which R4 still holds back.

## Consequences

- The steward merges lane 1.3; FOUNDATION section 10 names combat as a proposer to `command`, and the phase order shows battles at 3b.
- **Lane 1.4:**
  - the casualty-return rule (missing first, captured later);
  - the pursue phase;
  - fortification works;
  - pruning battle records.
- **Lane 1.7:** the `disband` delta.
- **Lane 1.12:** commanders' battle choices through seats.
- **Lane 1.14:** calibrates against the Livermore bands, Fort Wagner's under-loss among them, and needs a reference run that fires breakouts, flank breaks and routs.
