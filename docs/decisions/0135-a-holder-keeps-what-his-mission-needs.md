# 0135: A holder keeps what his own mission needs, and an unknown is not a need

Status: accepted (2026-11-24). From S150's measurement of 0134 (`docs/audit/s150-evidence/0134-capture/` on `sprint/allocate`, staged). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0133 (how a superior decides from what he holds) and 0134 (what a subordinate may keep), by 0130's rule on undetermined comparisons. Clarified by 0139 (an order to send the surplus keeps what its own words name).

## Context

- **What S150 measured.**
  - Under 0134, Scott ordered Mansfield on day 114 to send one regiment to Patterson. Lee ordered Holmes on day 124 to send one to Johnston.
  - Both holders answered `comply` through their compliance. Mansfield's duty was honoured, with willingness 264.
  - Both then sent nothing: their lot selection deferred with `retention_comparison_undetermined`.
  - Lee, who holds six lots at Lynchburg himself, relayed Johnston's first request for the same reason.
  - No regiment moved by request in the whole run.
- **The code.** `forceRetention` defers whenever the force ratio is unavailable to either draft. Where it is available, it keeps whenever the score after sending is lower than before. Removing a regiment always lowers a holding plan's score, so a holder who can compare always keeps. A holder who can't compare always defers. Either way, nothing is sent.
- **What 0130 already says.**
  - A comparison with an unknown is undetermined: never false, and never zero (item 2).
  - The planner compares candidates only on terms it can evaluate for all of them (item 3).
  - Item 4 names the gates that block an unknown, and a holder's retention is not among them.

## Decision

1. **A holder keeps only for a need his own planner states.**
   - The need is his own mission's `lacks_resources` shortfall, the figure 0133 uses for requests. He keeps lots when sending them would create that shortfall or deepen it.
   - A lower plan score alone is not a need.
   - This applies both to a superior granting from his own direct holdings (0133) and to a subordinate answering his superior's order (0134).
2. **An undetermined need is no reason to keep.**
   - Where an enemy strength his mission faces is unknown (0130), the force ratio and the need derived from it are unavailable to both choices, keeping and sending, with a typed reason.
   - The undetermined comparison is never by itself a reason to keep, and never a reason to send.
   - The choice rests on his compliance and the terms he can evaluate. An ordered subordinate who answers `comply` sends. His answer records the undetermined comparison as a stated reservation, for the issuer and the requester to read.
3. **Compliance still governs.** A holder may object, defer or counterpropose for a typed reason of his own (values, regard, disposition, grievance, capacity), as 0016's pushback allows.
4. **0133's quantities stand:**
   - the requester's stated shortfall, or one regiment where it is undetermined;
   - one outstanding request per mission, task and scope;
   - no daily retries.

Rejected:
- **Keeping on any drop in score.** It makes every holder who can compare keep everything.
- **Treating an unknown as a need.** It makes every holder keep everything while the enemy is unknown, which in 1861 is nearly always.
- **A fitted reserve fraction, a garrison minimum or a size target.**
- **Sending without the holder's compliance.**

## Consequences

- **The build.** S150 builds it with focused tests on fictional fixtures. They cover:
  - a determined need that keeps;
  - a determined surplus that sends;
  - an undetermined need under `comply` that sends with its reservation;
  - an objection for a typed reason of the holder's own.
- **What it may give.** Regiments held at Washington and Lynchburg may now move by request, one order at a time, at whatever pace the chains allow. Whether an army forms is measured.
