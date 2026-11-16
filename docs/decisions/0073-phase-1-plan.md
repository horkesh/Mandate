# 0073: The Phase 1 plan: two milestones, starting with the road to Bull Run

Status: accepted (2026-11-16). From the lead's draft of FOUNDATION section 12's Phase 1 plan and a fresh review lane that reviewed none of Phase 0's lanes (`review-phase1-plan.md`: approve after fixes, nothing blocking, every fix taken). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12 and 0072's hand-over.

## Context

Phase 1's scope and done check were already settled (FOUNDATION section 12, `docs/ROADMAP.md`): a headless history run from March 1861 to the 1862 midterms with checkpoints in plausible bands, and the core loop playable in a text console. What was missing was the plan for getting there. The Phase 0 exit review ranked the five risks Phase 1 inherits (0072):
1. pushback has never run on the new kernel;
2. the rule-seat principals and the history run;
3. the planner replacing standing goals;
4. two kernels side by side;
5. data gaps deciding outcomes.

## Decision

**Phase 1 runs as two milestones**, as FOUNDATION section 12 now sets out.
- **1A, the road to Bull Run** (5 March to 31 July 1861), is a thin slice through every system. It meets all five risks before breadth is built on it.
- **1B, to the midterms**, is a scope list, sized and ordered after 1A's exit review.

**1A's done check** has three parts:
- **A history run to 31 July 1861.** Both war flags are set by decision. The checkpoints fall in bands sourced before the run, covering the named governments whose side could change. The planner, operations and the battle model each work end to end. Pushback is banded above zero, from the catalogue's sourced cases. No block fights with unknown strength, Phase 0's eight labelled stand-ins are gone, and every Phase 0 criterion still passes.
- **A scripted console session** that reaches 31 July using only verbs from the verb list. The owner's playtest follows the milestone and feeds 1A's exit review. It is not a criterion, because no lane can close a judgement.
- **M2's retirement**, with the compliance and audience tests moved onto the new State.

**Fourteen lanes** (1.1–1.14), with their dependencies, sizes and a five-step sequence, are in section 12. The critical path is 1.1 → 1.3 → 1.4 → 1.12 → 1.14. The limit of two simulation lanes at once sets that path, not the dependencies.

**Owners named by the plan** (section 10's writer table gains the rows):
- **`people`:** a person's status (serving, wounded, killed, captured), and ranks held at once, one per kind (regular, volunteer, brevet).
- **`seats`:** the president's weekly attention, and any seat-initiative state.
- **`proxy`:** a response to a goal, a plan or an edit. `plans` holds only a reference to it.
- **No new owner for the press.** Its weekly front page is a report, whose effects are proposed to `politics` and `people`.
- **A new force block** comes from one recruitment proposal, applied in one phase across its three owners: `forces` creates it, `movement` places it and `command` assigns it.

**The gate in 1A.** Lane 1.8 registers every section 3 topic whose window overlaps 1A. It also drafts R4's battle ruling, which lane 1.3 waits on before it merges. The ruling answers whether capture in battle and surrender fall under `prisoners-and-exchange`. The review's recommended answer is the candidate: capture is a battle loss, placed as an event; the captured leave play; casualty returns may name them as a count; and exchange, parole, camps, retaliation and the Corcoran lot stay held for R4 in 1B. The lead decides it once the gate reviewer has read the draft. R1's interim rule and R8 are already recorded (0046) and are not redrafted. R2, R3, the rest of R4, R6 and R7's later decisions belong to 1B.

Rejected:
- **Building system by system to the midterms.** The five risks would meet only at the end, and the history run would first run months into the phase.
- **A slice on the fictional testbed.** It leaves the Union data gaps and the history run untested.
- **A slice that ends before Bull Run.** It has no plan review and no battle, so risk 3 goes untested.
- **The console at the end of Phase 1.** The owner could not judge pushback until then.
- **The owner's judgement as a done criterion.** No lane can close it. The playtest informs the exit review instead.
- **Redrafting R1's interim rule and R8.** Both were decided in 0046, and a second record could contradict them (hard rule 2).
- **Splitting lane 1.1 further.** That adds a step to the critical path. Moving conflict resolution to 1.2's call site and transfers to 1.5 shrinks it enough.
- **Retiring standing goals in lane 1.2.** Nothing would march until operations land, and the Phase 0 done check, which CI runs at every merge, would fail for three steps. Standing goals drive movement until lane 1.4 retires them.

## Consequences

- The first wave starts now: 1.1 and 1.2 (simulation), with 1.8 (gate) and 1.9 (research).
- The steward syncs `docs/ROADMAP.md` and `CLAUDE.md`'s phase line. It also files two pointers: `SENSITIVE-HISTORY.md` section 4 and `OPEN_QUESTIONS` still list R1's interim rule and R8 as records to write, though 0046 recorded both.
