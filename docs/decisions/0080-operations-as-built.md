# 0080: Operations, reports and dispatches, as built

Status: accepted (2026-11-16). From Phase 1 lane 1.4 (`notes/lane-1.4-operations.md`), the standing reviewer's review and re-checks (`review-lane-1.4.md`), and the gate reviewer's verdict (`review-gate-1861.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12's row 1.4 (0073), under 0074 and 0076.

## Context

Lane 1.4 turned approved plans into operations, retired Phase 0's standing-goal path, and built the reports that come back through commanders and other routes.

## Decision

**Operations.** An approved plan, or one assembled and awaiting the word, opens one operation (`operationRecords`, written by `operations`).
- **The axes are copied from the plan,** so a plan sent back later keeps its operation's history.
- **Each axis runs:** assemble, march along the plan's own legs (taking the quickest step where a leg is barred), assault, pursue, withdraw and pause, works at its objective, and end. Every stage carries a typed reason.
- **One operation per goal and plan.** Nothing reopens it.
- **Phase 0's standing-goal execution path is retired.**

**Support and encirclement.**
- **A support request** goes straight from the commander to the holder he asks, by wire where he has it, and that holder answers by his own compliance and his regard for the man asking.
- **A reinforcement request** goes to the principal, who answers with his own verbs.
- **An encirclement's outcome is typed:** met, failed for a human reason (the partner refused, was late, or his post was vacant), or failed on the ground (no route).

**Reports** (0008, 0032, 0074, 0076).
- **Who writes:** a side's reports are written by whoever holds its post that day, or the post above. A post left vacant sends none.
- **Phase wires:** four a battle-day, one at the end of each phase. He says it went well unless his flank broke, he leaves that evening or his force was destroyed. He gives the enemy as he sees him, and says nothing of his own losses. What he left out is kept in the truth beside the report.
- **Casualty returns:**
  - the first, in the evening, runs low by the pack's share and counts every captured man among the missing;
  - the full return, the pack's days later, sets killed, wounded, missing and captured apart;
  - a destroyed force is never reported as killed.
- **A governor's wire** carries battle news in his state's regions. It never comes from a self-governing nation's head (0069, 0070).

**Oversight** comes from distance and the telegraph: the pack's base, less a term per courier day to the issuer, plus a term on the wire, with a floor and a ceiling, all as typed terms. An observer's `watched` term stacks on top (0079).

**Stores norms** apply where a block's stores are unknown. They match by the block's starting post or that post's kind, its arm and its side, and every block that uses one is flagged "assumed" in its data and records. The Union pack has one norm, the Home Squadron's ships, cited.

**Works** are dug only by an axis holding its objective, not by every block standing still, and storming takes the pack's share off. Otherwise every 1861 garrison would entrench, and every fight would become an assault on works.

**Pursuit** takes the pursued side's stragglers, more with cavalry.

**Pruning** removes ended operations, closed battles and old responses. Anything a plan, operation or levy still names is kept. A battle is never pruned before its full return is written.

Rejected:
- **Executing straight from the plan record.** A plan sent back would lose its operation's history.
- **Reopening a finished operation.** It looped every few days in the reference run.
- **Routing support requests through the principal's chain.** It's a request between holders (FOUNDATION section 5).
- **Matching stores norms by block kind.** That can't tell a garrison from a field force in the Union data.
- **Works for every block standing still.**
- **Labelling distance and the wire as "watched".** Each term says what it is.

## Consequences

- FOUNDATION section 10 gains `operationRecords` and the phase-3 order.
- **Lane 1.4b:** detachments in play (garrisons and landings), built on lane 1.7's block creation. S02's landing needs them.
- **Lane 1.5b:** verbs and the audience read oversight at distance too.
- **1B:**
  - troops embarked and carried by sea;
  - Navy-channel battle news;
  - the siege method, for an axis that faces an enemy its commander won't attack;
  - freelancing.
- **Lane 1.12:** rule seats reappoint a post the battle model leaves vacant.
