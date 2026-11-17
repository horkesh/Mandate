# 0087: The evidence rules as checks, and what a later work can source

Status: accepted (2026-11-16). Amends 0085. From:
- Phase 1 lane 1.11b (`notes/lane-1.11b-data-entry.md`, merged `a38d7ea`);
- the standing reviewer's review (`review-lane-1.11b.md`);
- the gate reviewer's approval of the census and the `fugitive_defence` cells.

Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

0085 set which evidence counts for the 1861 cast: innate stats and traits to 31 July 1861, and cells true at the start to 5 March. Lane 1.11b made those rules into checks and entered the data. Doing so raised three questions 0085 didn't answer:
- what a later reference work may source;
- whether a period document printed in a later book counts as period evidence;
- what happens to judgment cells entered before the rule.

## Decision

**The rules are checks.**
- **The boundaries:** `gate/source-policy.json` carries an `evidence` block with the two boundaries and the classes of innate stats and traits.
- **Dated citations:** a citation may state `dated YYYY-MM-DD`. A dated citation past its cell's boundary is weak, and an undated citation isn't judged.
- **Where:** the check lives in `banned-sources.ts` and the validator, with tests at each boundary.

**What a later work can source:**
- **Facts** (a rank, an office held, service, a date) may rest on a period reference work alone, such as Appletons, the Biographical Directory of Congress, or Heitman.
- **Judgments** (values, temperament, competence, nerve, regard, reputation, candour, boldness) may not. A later work's characterisation is hindsight, so a judgment needs a contemporary leg, or it's held back.
- **A contemporary document that a later work prints verbatim is a contemporary leg,** dated by the document and cited to the printing. Only the document's own words count, never the later author's comment around it.
- **Reputation is how others regarded a man.** So a reputation cell needs someone else's contemporary judgment; his own words show his conduct, not his reputation.

**The same rule reaches the older cells.** About 189 judgment cells entered before the rule rest on no contemporary leg.
- Research re-sources them (lane 1.11r3), starting with the men active from March to July 1861.
- Until that pass is done, the check lists them as warnings.
- Any judgment cell still without a contemporary leg is held back before 1A's exit review, so 1A ends on one standard.

**As entered:**
- 19 of the 118 re-sourced cells;
- the 1860 census for 205 regions, which gives the self-emancipation term its Union input;
- the PROVENANCE keys the drafts listed.
- **Mallory's reputation** is average, because his confirmation was split. **Harney's regard for Lyon** is held back, since its evidence is after the start.

Rejected:
- **Admitting a later work's judgment because it isn't on the weak list.** Hindsight is the reason for the boundary.
- **Grandfathering the older judgment cells.** Two standards in one cast table would mean the history run's men rest on different kinds of evidence.
- **Refusing the older cells at once.** That would strip the cast mid-milestone before research has had its chance.

## Consequences

- **Lane 1.11r3:** the four people rows lane 1.11 needs, S18's advocate, Sumter's surrender terms, the re-sourcing of the older judgment cells, the dating pass, and the remaining leads.
- **Lane 1.14:** calibrates with the census input live (`regions.self_emancipation` and `regions.reached_lines` are now banded). It also reads the warning list, so it knows which men's traits still rest on later works.
