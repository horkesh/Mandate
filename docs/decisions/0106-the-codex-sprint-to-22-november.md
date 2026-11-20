# 0106: The Codex sprint to 22 November

Status: accepted (2026-11-20). The owner: "we need to use all of Codex' generous allowance in the next two days. Use the raw power, we can review what he created in two days. No bottlenecks, we need max productivity." Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0092 and 0096 for the sprint only.

## Context

- Codex's prepaid plan runs to 22 November 2026. Its weekly limit was 41% used on the evening of 20 November.
- Under 0096, each Codex run waited for the lead to commit it, for Claude's reviewer to approve it and for the steward to merge it. That chain is now the bottleneck, not Codex.
- main's Linux CI fails the tick budget (war by decision at 46.8 ms against 40), while local machines read 24 to 33 ms.

## Decision

1. **Until the sprint ends (end of 22 November), Codex runs as many long lanes at once as its limits allow,** about nine. Each is a numbered request in `CODEX.md`, in its own worktree and branch. When one ends, the lead starts the next.
2. **Codex commits on its own sprint branch.**
   - It commits through the pre-commit hook, never with `--no-verify`, and never rewrites history.
   - It may merge into its own branch another sprint branch or main, as its request says.
   - It never pushes, and never checks out or writes main or another lane's branch.
   - The lead pushes the sprint branches.
   This amends 0092 item 3 and 0096 item 3 for the sprint.
3. **Nothing reaches main unreviewed.** Sprint work integrates on `sprint/1a` and the other sprint branches.
   - After the sprint, Claude's standing reviewer reviews each sprint branch whole, with its four lenses, and the gate reviewer signs each gated item.
   - Only then does the steward merge into main (0045).
   - During the sprint, the reviewer and the steward stand down.
4. **The rules that make the work reviewable hold:**
   - the hard rules;
   - the settled decisions;
   - facts only from sources read and cited;
   - gated items as drafts, never signed;
   - each lane's hand-over kept current and ending with "Findings outside my scope";
   - each choice listed as a proposed ruling with its rejected alternatives.
   The lead rules on the proposed rulings, records them, and keeps routing findings.
5. **The tick budget stays at 40 ms a day.** A sprint lane owns bringing CI's Linux measure back under it with no change in behaviour. If that can't be done, the lead rules on re-measuring the budget at the sprint's review, with the profile in hand.

Rejected:
- **Keeping review per branch during the sprint.** It caps Codex at the reviewer's pace, which is the bottleneck the owner named.
- **Merging unreviewed work into main.** main is what CI, the steward and every new branch trust. An integration branch gives the same speed without that risk.
- **Codex pushing.** Pushing is outward-facing, and the lead keeps it.
- **Raising the tick budget now.** That would fit the budget to the run before the profile shows where CI's time goes.

## Consequences

- The sprint's requests open in `CODEX.md` (S1 onwards).
- At the sprint's end, the lead lists every sprint branch, its commits and its proposed rulings, for the review.
