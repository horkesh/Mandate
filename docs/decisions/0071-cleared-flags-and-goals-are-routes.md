# 0071: A cleared flag is a route, and a standing goal is a choice

Status: accepted (2026-11-15). Amends 0060 and 0070. From the standing reviewer's and the gate reviewer's re-checks of the `selfGoverning` rule (`review-selfgoverning.md`, `review-gate-selfgoverning.md`; approved at 6b6e187). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Decision

**A cleared flag is a route.** The dependence finder counts a flag an item clears as well as one it sets, so an item that fires on "not F" depends on whatever cleared F. One function serves both rules:
- **0060's D5:** an item that follows an atrocity's cleared flag is tainted.
- **0070:** a nation-moving item that follows a flag a principal's option cleared is refused.

**A standing goal is the principal's own choice.**
- An item that moves a self-governing department may not read a `goal`, directly (`self-governing-goal`) or through any middle item (`self-governing-choice`). A route note does not excuse it.
- A commander's location (`headquartersAt`) is news of an event, not a choice. It is allowed, with a route note in the sign-off.

Rejected:
- **Counting only flags an item sets.** A principal's option could clear a flag, and a notice that fires on its absence would move a nation.
- **Treating a goal as news.** A goal is an order the principal gave. Reading it turns his order into the nation's act.

## Consequences

- Built and merged with `selfgoverning-rule` (6b6e187), with a control for each route.
- Cosmetic: a laundered goal's error should name the standing goal of the post, not "the principal's decision" (N6).
