# 0063: An option that hurts the enemy in response to an atrocity is watched

Status: accepted (2026-11-15). Amends 0060. Amended by 0074 (D6 reads the inaction outcome of a decision about an atrocity-class order or sentence as watched). From the gate reviewer's re-check of G5 and G6 (nit N10) and lane 0.7's G7, approved at bd5d01f with a precision control added (663e962). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Decision

In a decision that depends on an atrocity, an option whose effects or locked costs lower the acting side's measures must be marked `watched`, so the lever sweep (D6) always reads it. An unmarked option is refused with the error `gate-unwatched-lever`.
- The rule follows 0060's scoping. Every option needs the mark when the item's trigger depends on the atrocity; only that option needs it when its own condition does.
- An untainted sibling needs no mark, and a control proves it.
- The inaction outcome is not an option and cannot be marked, so the rule does not apply to it.

The reviewer checklist's Q7 now names four cases that only a reader can judge:
- reports about an atrocity from other modules;
- a decision in which every option depends on the atrocity, read later with no options named;
- a panic notice recast as a decision that only costs the decider;
- a subject-free `advice/requested` pattern that matches a dependent decision's staff line.

Rejected:
- **Leaving the lever to the reviewer's reading alone (0060's consequence).** A mechanical mark costs nothing, and it makes D6 read every such option.
- **Requiring the mark on every option of the decision.** It is stricter than the dependence, and it flags honest siblings.

## Consequences

- Lane 0.7's gate work is complete. The gate reviewer re-checks the first real atrocity situation when it is authored.
