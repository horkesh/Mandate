# 0075: The planner in the kernel, as built

Status: accepted (2026-11-16). Amends 0068. From Phase 1 lane 1.2 (`notes/lane-1.2-planner.md`) and the standing reviewer's review and re-checks (`review-lane-1.2.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12's row 1.2 (0073) in 0062's shape.

## Context

Lane 1.2 moved the planner spike into the kernel and built plans as State. Three questions came out of the build and its review:
- how the daily drafting cap is shared between the sides;
- what a commander may know when he counts on a partner for a pincer;
- whether an office may withhold the president's approval of a plan.

The planner also changed what the reference runs do, so Phase 0's behaviour criterion no longer fits.

## Decision

**The planner is in the kernel in 0062's shape.**
- The spike's code moved; it was not copied.
- The binary heap is shared with `supply`, and passage comes from `movement`.
- Every input about the enemy or the ground comes from the commander's view. Works and obstructions come in by new claim kinds.
- Two own-side derived inputs still reflect truth: edge condition, and the side's supply reach. That is acceptable while nothing in 1A damages edges. 1B's raids add a path that goes by report.

**Plans are State** (`planRecords`, FOUNDATION section 10).
- `proxy` writes a response, and the plan keeps only its key.
- Standing goals survive only as movement's execution path, a labelled stand-in that lane 1.4 retires.

**The daily drafting cap is a pack rule, counted per side.** One side's planning never delays the other's: the player must never see Lincoln's plans wait because Davis's commanders asked for theirs.

**A pincer partner is counted on by what the drafter can know.**
- Expected cooperation comes from the drafter's regard for the partner's holder (`regardUnknown` where they have no history) and that holder's public standing, weighted by pack rules.
- The partner's hidden stats, traits and answer never enter planning.
- His real answer comes from his own compliance when the support request reaches him (0062: the planner reads beliefs, never truth; FOUNDATION section 6: true stats are hidden).

**Offices relay the president's approvals and his word to go with their own compliance** (0040's chains), so an office can withhold or delay "approved as drafted".
- While an office's objection to the order he sent is travelling back to him, matched by the kind of order, the plan stays off his menu.
- He learns of the withholding when the memorandum arrives. This keeps a rule-seat president from redrafting in a loop.

**The assault margin** is a pack rule (`people.traits.assaultMargin`, at least 1000). The planner applies it to an assault on a held region, and the margin's permille is stated in the `force_ratio` term's reason.

**The done check's behaviour criterion (amends 0068):** each reference run needs a contest or an occupation, and a change of control. The planner now holds garrisons, so the Union run no longer occupies ground. The liveness gate still bands the contest in both runs and occupation in the testbed, so a dead mechanic still fails.

Rejected:
- **One drafting cap shared by both sides.** It couples the sides, and enemy activity would delay the player's plans.
- **Scoring a partner by his true temperament through `answerOrder`.** It reads hidden truth into a commander's planning.
- **Offices that cannot withhold an approval.** 0040 makes every link of a chain apply its own compliance.
- **Keeping Phase 0's criterion of a contest, an occupation and a control change all at once.** The planner's runs hold their garrisons, so the criterion would fail a working kernel.

## Consequences

- The steward merges lane 1.2 and syncs `OPEN_QUESTIONS`.
- Lane 1.4's operations retire the standing-goal execution path.
- Lane 1.12 owns the `crossNeutral` stand-in.
- 1B's raids add report-based edge condition and supply reach.
