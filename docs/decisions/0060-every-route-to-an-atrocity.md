# 0060: D5 sees every route to an atrocity, and a response to one can be decided honestly

Status: accepted (2026-11-14). From the gate reviewer's re-checks of lane 0.7 (G3, G4, G5 and G6 in `review-gate-lane-0.7.md`) and lane 0.7's fixes. G3 merged as 789df5a, G4 is approved at 77b7e30, and G5 and G6 are ruled on here. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0057.

## Decision

**Every effect that depends on an atrocity names its side (G3).**
- An effect that moves a measure with no side, in anything that depends on an atrocity, is refused with the same error as E7 (`gate-acting-side`). The fix is always the same: name the side.

**Dependence is found by every route, to a fixed point (G4).**
- An item depends on an atrocity when:
  - it fires on the atrocity;
  - it reads the atrocity's decision, naming the dependent option;
  - it waits on news of the atrocity, through a `knows` pattern with the atrocity as subject;
  - it follows the atrocity in a chain;
  - it reads a flag the atrocity sets;
  - or it depends on such an item, through chains of any length.
- An item's trigger makes all its effects depend on the atrocity. One option's own condition makes only that option's effects depend.
- Expiry counts like appearance.
- The error names the route it found.

**A subject-free pattern that could match the atrocity's own report counts too (G6).**
- That report's type, subtype and claims are declared in the item, so a `knows` pattern with no subject that could match it is a reference.
- Such patterns are tainted, not refused.
- The reviewer checklist's Q7 keeps only reports from other modules, such as the press later, and decisions in which every option depends on the atrocity.

**A response to an atrocity can be decided honestly (G5, the lead's ruling).**
- **In a decision that depends on an atrocity**, a fall on the deciding side's own measures is the cost of the choice, and it passes D5. Rises still fail for every side.
- **Notices keep the strict rule:** only the acting side's measures may fall.
- **B5 requires a real cost:** every gated option needs at least one locked cost that is a fall on the deciding side's own measures. A fall on the enemy's measures never counts as a cost.

Rejected:
- **Reading a missing side as the actor's.** A fall would pass as the actor's cost without anyone stating whose measure it is.
- **Stopping after one hop.** A middle item that only sets flags would launder the link.
- **Tainting a whole item when one option appears on news.** It would flag every sibling option's costs.
- **Refusing subject-free `knows` patterns outright.** They are the ordinary way to ask about news, and the atrocity's own report can be matched mechanically.
- **Keeping D5 strict for decisions.** Every honest response decision, such as the R2 retaliation decision in the catalogue, would fail. The only way through would be a fake cost that lowers the enemy, which is a gain from an atrocity dressed as a price.

## Consequences

- Lane 0.7 builds G5 and G6 on a branch cut from main after G4 merges, with a control for each. The gate reviewer re-checks them before the steward merges.
- `fen_crossing`'s `send_back` depends on the atrocity, which is correct. Its costs pass once G5 lands.
- Lowering the actor's measures stays allowed, as the consequence of its own conduct (0057). Whether a response option uses that as a lever is for the gate reviewer's reading (D4 and Q1–Q12).
