# 0114: A commander may propose another goal, and a goal may carry conditional discretion

Status: accepted (2026-11-23). From S94's research and grammar proposal (`docs/research/2026-11-23-S94-johnston-withdrawal.md` and `docs/research/S94/` on `sprint/research-military` at `c7aa662d`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Extends 0016.

## Context

- **Johnston's withdrawal is a chain of answers.** In June 1861 he questioned holding Harpers Ferry and proposed a mobile mission instead (to Lee, 6 June, OR I-II pp.907–908). The government answered twice:
  - Lee, on 7 June, gave Davis's preference for holding, but left Johnston to retire if he couldn't oppose the enemy (p.910);
  - Cooper, on 13 June, authorised him to retire towards Winchester when he judged he was about to be turned, and further towards the passes if need be, promising support for his discretion (pp.923–925).

  Johnston withdrew on his own judgment, by way of Bunker Hill, to Winchester (pp.472, 929–934). Cooper's telegram of 17 July was also conditional: join Beauregard "if practicable", with the arrangements left to him (p.478).
- **The grammar can't carry it.** In the model Johnston stays at Harpers Ferry, beyond the wire, and the July order reaches him after July. S94 found two missing pieces:
  1. A commander can answer a goal with a compliance rung and reasons, but not with a proposal of another goal. `AdviceBody` carries no executable goal, and `PlanCounter` records the principal's edit, not the commander's.
  2. A goal has one objective and posture. It can't grant permission to leave a fixed point under a stated condition while keeping the broader mission. `delegate` hands over a situation's decision, not operational discretion.
- **The pattern recurs.** Discretionary and conditional orders run through the war, so this is not one scene's special case.

## Decision

1. **A commander may answer a goal with a proposal.**
   - The proposal is a complete goal in the existing grammar (objective, posture, risk, deadline, movement permissions), with his typed reasons. It travels as an ordinary paper, correlated with the order it answers.
   - It comes from his own planning: the kernel drafts it when his response to the goal is an objection or a reservation and his planner's best candidate under his own judgment differs from the ordered goal. It is never authored by a date.
   - The principal can accept it, which issues it as his order. He can decline it. Or he can answer with a goal that carries conditional discretion.
   - For the player this is an order to a person, within 0016.
2. **A goal may carry conditional discretion.**
   - Beside its objective, a goal may name a **fallback goal** and a **condition** from a small typed vocabulary that names no setting. The first two conditions are:
     - **turned:** a force he believes superior threatens his flank or his line of retreat;
     - **outmatched:** the force he believes in contact with him is superior beyond his own caution.
   - Each condition is judged on the commander's own knowledge and perception, never on the truth.
   - When it holds, by his judgment, he may switch to the fallback himself, and his report of the switch travels as an ordinary paper. The principal learns of it only when that report arrives.
   - "If practicable" is the same device: the goal is the order, and the fallback is to remain.
3. **Authority is received.** A commander acts on a proposal's acceptance, or on a grant of discretion, only once the paper has reached him. A grant never takes effect from its date of issue.
4. **The rule seats use it from the sources.** A doctrine row may grant discretion where a sourced order did, Cooper's of 13 June and 17 July among them, gated on the papers received as now.

Rejected:
- **Moving Johnston to Winchester on 15 June.** A date-only move puts history in place of the people who made it.
- **A concrete "hold Winchester" goal sent in place of the discretion.** It is narrower than what Cooper granted, and it would hide the commander's own judgment, which is the game's subject.
- **Free-text authority in advice strings.** It can't be executed or checked.
- **An open-ended condition language.** Every condition has to be explainable from the commander's own knowledge, so the vocabulary grows only by decision.

## Consequences

- **The build.** A request builds both pieces, with paired tests, and the rule-seat rows for Johnston's June chain:
  - his proposal in answer to a hold goal at Harpers Ferry;
  - the government's grant of discretion, in Cooper's terms;
  - his withdrawal on his own judgment.

  It then re-measures the July junction.
- **For the player.** A proposal paper from a commander can be accepted, declined or answered with a grant of discretion. A goal the player gives can carry a fallback and a condition.
- **Coverage.** Row C15 (Johnston on holding Harpers Ferry) becomes representable. S91's gaps for Holmes's conditional withdrawal (C16) and Patterson's attack-or-demonstrate orders (U33, U34) are re-examined under the new grammar.
