# 0070: A nation's act must be its own, and must stay with its own people

Status: accepted (2026-11-15). Amends 0069. Amended by 0071 (a cleared flag is a route; a standing goal is a choice). From the standing reviewer's and the gate reviewer's reviews of the `selfGoverning` rule (`review-selfgoverning.md`, `review-gate-selfgoverning.md`) and the gate reviewer's review of the Indian Territory split (`review-gate-indian-territory.md`, Part 2). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

0069 let only a notice move a self-governing department. Both reviewers showed two ways round that.
- A principal's decision sets a flag, and a notice that reads the flag moves the nation. The president chooses, and the nation's "own act" follows by rule.
- Nothing tied the notice to the nation, so a Confederate or Union act authored as a notice also passed.

The same-kind rule also let one nation's land pass to another nation's government.

## Decision

**A notice that moves a self-governing department names whose act it is.**
- Its `actingGovernment` must be the proposal's subject, and the validator refuses one that is missing or different.
- Such a notice carries a gate topic tag and a sign-off, so the gate reviewer reads every one.

**No principal's choice moves a nation.**
- An item that moves a self-governing department may not depend on a principal's decision option by any route: reading the decision, a flag an option sets, or a chain. Dependence is found to a fixed point, with 0060's machinery.
- Dependence on events and on news is allowed, because nations answered what happened around them. Such an item's sign-off carries the reviewer's note on that route, as review-severity wording hits do.
- Phase 0 has no nation seat, so a nation's answer to a policy is authored from conditions, never as a fixed one-to-one response to the president's choice (rule 5).

**A nation's land stays with its own people.**
- A self-governing department carries a `polity` id, and rival governments of one nation share it.
- A region moves only to a department of the same kind and the same polity.
- A self-governing department without a polity is refused.
- The validator checks that two polities never share a region's government.

**A tripwire for the region writer.** A test fails if `command` gains any write of `regionGovernments` outside setup, and its message names `regionMoveProblem` and the validator's field list. Whoever writes the field first must therefore call the guard.

**Before the nations are applied,** the Union pack's gate register carries an `indian-territory-1861` topic with these contents:
- refused signatures for recruitment and manpower fields aimed at a nation's region or department, per 3.7's refused verb;
- the nations' population fields as protected fields;
- the nations' names as protected groups.

Diplomacy toward a nation may be legal; R3 draws that line.

**The split patch, before it is applied:**
1. the `nation_government` kind is `selfGoverning`, and each department has its own `polity`;
2. the Leased District is named for its people too ("Leased District (Wichita and affiliated peoples)"), with the peoples listed as the 12 August 1861 treaty names them;
3. the Cherokee region's government row, and the relevant Kansas rows, say that the Quapaw, the Seneca and Shawnee, and the Osage lived on their own lands under their own chiefs and are not governed by the department named, until a period map sources a region for them;
4. the Muscogee department's note says the nation was divided in 1861, in the oral history's own terms;
5. the Cherokee boundaries are bounded by difference and labelled inferred and needs-source.

**Wording:**
- **Correcting 0069:** the territories' notes say "Native nations held or claimed much of the land", not "most", which is what the sources read can carry.
- "Opothleyahola's loyalists" stays (loyal to him, per the nation's oral history) until the Muscogee Nation's own term is read.
- The words "Now the wolf has come …" are not used as Opothleyahola's until the letter is read in a primary copy.

**For authors** (in `SENSITIVE-HISTORY.md` 3.7):
- Emory's "unworthy conduct" is his attributed view, never the narrator's.
- The 12 August treaty's legitimacy is contested, and a research lane sources the dispute before it is authored.
- The Reserve peoples' treaty of 14 May with Texas is their own act.

Rejected:
- **Refusing any notice that follows events or news.** Nations did respond to what happened around them.
- **The same-kind rule alone.** It folds one nation under another's government.
- **Tracking the region writer by note only.** That is a rule waiting to be broken (hard rule 7).

## Consequences

- **Lane 0.8's session** builds `actingGovernment`, the gating requirement, the decision-dependence refusal, `polity` and the tripwire on `selfgoverning-rule`. Both reviewers re-check it.
- **The governments research lane:**
  - fixes the Part 1 wording (the Fort Wise treaty as an unratified cession, and the nits);
  - revises the split patch;
  - applies it after `selfgoverning-rule` merges.
- **The gate reviewer** drafts the Union pack's `indian-territory-1861` register topic.
