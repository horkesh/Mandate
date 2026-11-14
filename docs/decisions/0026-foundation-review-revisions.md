# 0026: Revisions after the foundation review

Status: accepted (2026-11-14). From the independent review of `docs/design/FOUNDATION.md` and 0015–0023 (verdict: ready after fixes). The lead accepted these fixes; the owner can overturn any of them. Amends 0016, 0017, 0020, 0021 and 0023. Amended by 0033 and 0040 (first-month walkthrough revisions).

## Decision

**Plans (amends 0016).**
- **The kernel drafts candidate plans** deterministically from the goal, the commander's state and the map. A seat (rule, AI or human) selects among them, adjusts within kernel bounds, and annotates. Seats never invent a plan the kernel has not validated.
- **The edit grammar is limited** to an axis's objective, its waypoint regions and its timing, and adding or removing an axis with an objective. The commander assigns divisions to axes; the player can ask for a force size, which the commander reads like any order.
- **Corps are posts that hold people**, with no relay mechanic yet. Lincoln can appoint corps commanders (he imposed corps on the Army of the Potomac in 1862, per the Union dossier). Divisions transfer between armies; inside an army the commander assigns them.
- **Promotions arrive as lists** from superiors and the War Department, which the player approves, amends or overrides (overriding costs standing). The player can still nominate anyone.

**Latency (amends 0017).**
- **The kernel owns all latency.** A command applies on the day it is issued and creates a message that travels; the recipient acts when it arrives. The shell never computes arrival times.
- **Orders wired during the night of the battle** cannot change a day the kernel has already resolved; they arrive for a later day of the battle, or after it.

**Visits (amends 0016 and FOUNDATION).** A visit gives several independent first-hand reports from the army's officers, more accurate than dispatches, but **not the truth**. At Harrison's Landing in July 1862 the corps commanders disagreed with each other (command note).

**People (amends 0020).** The general who runs against you: a popular general, especially a sacked one, can be drawn as the opposition's 1864 candidate. Hidden-stat centres for real people cite sources in the pack, and the pack validator enforces that a citation exists.

**Sensitive history (amends 0021).**
- The gate also covers the wars against Native nations (the Dakota War of 1862 falls inside the first slice), the draft riots, and civil liberties (habeas corpus, arrests of civilians).
- **Placement rule:** each sensitive feature is placed before it is authored as one of: modelled with locked consequences, narrated only, or refused. The test is "Is this a lever?": an atrocity is never a lever that pays.
- **Black regiments** come from the enlistment choices of free Black men and freedpeople, modelled as their agency in response to policy, not as a pool in the "men" resource the player draws on.
- **A playable Confederacy needs its own record**, covering impressed and enslaved labour under this gate, before it is built.

**The ending (amends 0023).** Losing the 1864 election ends the game with a verdict: the electorate has rejected the war. The game does not claim what a McClellan administration would have done. The months before the March 1865 inauguration are not played.

## Consequences

- FOUNDATION.md is revised to match (field-to-writer table, layers, Phase 0 scope).
- CLAUDE.md, VISION.md, the roadmap and the README are updated before Phase 0 starts.
