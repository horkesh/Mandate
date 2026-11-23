# 0107: The sprint continues on Codex's renewed allowance

Status: accepted (2026-11-22). The owner, after Codex's limits were reset on 22 November: "Codex limits have been manually reset so - continue him." Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0106.

## Context

- 0106 ran the sprint to the end of 22 November, when Codex's prepaid plan was due to end.
- The owner had Codex's limits reset on 22 November and told the lead to continue. Codex's weekly use read 16% at 23:00 that evening.
- The sprint's main thread isn't finished. The work of S46, S52, S62, S64 and S65 is staged together in `C:\Pyrrhic\sprint-july` (S67, S68). It can't commit through the hook until the July armies reach Manassas as the record shows, and that is the build 0108 accepts.

## Decision

1. **The sprint's rules continue past 22 November,** for as long as the renewed allowance lasts or until the owner calls the review. These are 0106 items 2 to 5: Codex commits on its own branch through the hook and never pushes, nothing reaches main unreviewed, the reviewability rules hold, and the tick budget stays at 40 ms.
2. **Stopping.** When Codex's weekly use nears its limit, or the owner calls the review, the lead stops starting lanes and lets running lanes finish. The lead then lists every sprint branch, with its commits and proposed rulings, as 0106 requires. The lead reads the weekly use from Codex's session logs.
3. **Codex's plan.** If Codex stops working when its plan ends, its lanes stop with it, and the lead reports where each one stood. Paying for more is the owner's decision.

Rejected:
- **Ending the sprint at midnight and returning to 0096's per-branch review.** It would stop the July stack halfway, with more than a hundred staged paths uncommitted.
- **Starting the whole-branch review now, while lanes still run.** The reviewer would be reviewing branches that are still moving.

## Consequences

- `CODEX.md`'s requests continue from S69.
- The review under 0106 item 3 starts when this sprint stops, not at the end of 22 November.
