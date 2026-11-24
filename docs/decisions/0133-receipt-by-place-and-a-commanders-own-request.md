# 0133: A regiment is received where it lawfully arrives, and a commander may ask for what his mission lacks

Status: accepted (2026-11-24). From S144's design (`docs/design/S144-RECEIPT-AND-FORCE-REQUESTS.md` and `docs/research/S144/` on `sprint/pushback` at `21164521`), on S141's corrected capture (`sprint/allocate`, held). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0131 (who holds an unassigned regiment, and how a commander obtains forces). Clarified by 0134 (a superior may answer by ordering a subordinate who holds the troops) and 0135 (a holder keeps what his own mission needs).

## Context

- **What S141 measured.** With 0131's allocation by read instrument alone, no army forms:
  - McDowell, Patterson and Beauregard hold no lots on days 120, 140 and 146;
  - every July battle disappears.
- **Why.** Three gaps:
  - a regiment that lawfully arrives with no specific receiving command is under no one's command;
  - a commander with a mission never asks for the forces it needs;
  - the intermediate assignments that built the armies are largely unread.
- **What S144 read.**
  - **The 1857 Regulations** cover arrival, reporting and organisation at stations (pp.2–3, 23, 57–60, 63, 126, 430–431).
  - **The departments' orders:** GO12 for Washington and Pennsylvania, and McDowell's GO26 (OR I-II pp.607, 653). On the Confederate side, GO1, 3, 13, 20 and 25, and SO149 and 64 (pp.775–776, 783, 827, 882, 896, 907, 911–912).
  - **Requests and answers were choices,** not formulas:
    - Patterson's request for artillery (p.652);
    - McDowell's request for troops from Washington (p.747);
    - Beauregard's request for Holmes, and Holmes's disagreement (pp.932–933).

## Decision

1. **Receipt by place** (S144's ruling E).
   - **The order of precedence.** A regiment that lawfully arrives for service goes to the first of these that applies:
     1. its received sending terms' explicit receiving command;
     2. the command of the station or rendezvous those terms specify;
     3. if no command is specified, the established local station's command;
     4. then the station's unambiguous territorial department, which is the new default and is design `[I]`, extending the Regulations' practice.
   - **Lawful arrival comes first.** Appearing at its raising place is not delivery.
   - **The receiving post must be open, with lawful authority** (0124, 0129). A missing post, an absent holder, an overlap or a coarse boundary is a typed gap. The current owner keeps the lot, and no officer is invented.
   - **The exceptions stand:**
     - a specific assignment;
     - a body passing through, which reports without changing its assignment;
     - a governor's offer, still his until the receiving command's receipt (0126);
     - a neutral or state body, which is never nationalised by crossing a border.
   - **Receipt is one auditable event, recorded once.** It is local holding, not an offensive entitlement. 0131's tasks and commitment still decide who fights.
2. **A commander's own request** (ruling F, with one change).
   - **What prompts it.** It comes after a received and accepted mission: the commander's own reports, holdings and planner's candidate tasks show an empty or short force for a task. An empty command may ask before it has any plan. No request comes from a date, an unreceived report, or the historical army's deficit.
   - **The scope** is a real call or service family and arm, suited to the mission. It is never a state, never `all`, and never a roster.
   - **The quantity is the planner's own stated shortfall for the task,** the existing `lacks_resources` figure, in whole regiments of the scoped cohort. Where that shortfall is undetermined, because the enemy is unknown under 0130, the request is one regiment at a time (S144's bootstrap). No new term, ratio or size target is fitted.
   - **Limits on asking:**
     - one outstanding request for each mission, task and scope;
     - reconsidered only on fulfilment, a new mission or evidence, an answer, a cancellation, or a material change;
     - no daily retries.
   - **Addressing.** It goes to the immediate superior through the chain and staff (Regulations pp.58–60), logged as the commander's own choice.
   - **The superior decides by his own planner and compliance,** from what he actually holds:
     - he may grant, grant partly, defer, counterpropose, refuse, or report no eligible force;
     - a grant is his own scoped assignment to the actual sender, and approval is not arrival;
     - he cannot grant what he doesn't hold. He may relay the need upward, or ask a governor, who undertakes, refuses or delays.
   - **0131 and 0126 still govern.** A generated lot first honours its call's destination and offer.
3. **Prove the chain first** (ruling H). The build runs S144's 26 paired specifications on fictional fixtures before any reference capture. Missing posts, destinations and transfers stay named gaps.

Rejected:
- **Permanent limbo until a named assigning paper is found.**
- **Geography seizing every body in a region.**
- **Washington standing as McDowell.**
- **Automatic grants, a global inventory of the faction, or a superior who rubber-stamps.**
- **Requests every tick until a target size is reached, or one regiment at a time when the planner can state the shortfall.**
- **New terms tuned so that the chosen requests win.**

## Consequences

- **The build** follows the performance lane on `sprint/july`. It goes onto `sprint/allocate`, beside S141's held data, and is measured.
- **What it may give.** Armies may now form by commanders' requests and superiors' answers, at whatever pace their chains allow. The size and date of any July battle is measured, never targeted.
