# 0128: The bounds of a limited sortie and a demonstration

Status: accepted (2026-11-23). From S127's proposal (`docs/design/S127-SORTIE-DEMONSTRATION-BOUNDS.md` and `docs/design/S127/` on `sprint/pushback` at `d6e7a27a`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0121 (the sortie's safety rule) and 0123 (the demonstration's limits).

## Context

- **What 0121 and 0123 require.** Before either build, the lead must see three things with their basis: the limited sortie's safety rule (0121 item 5), and the demonstration's limits on areas, candidates and duration (0123 item 2).
- **What the read papers give.**
  - **Patterson's letter to Wallace of 6 June** allows action against a reported armed gathering that a safely detached force can overcome. It gives no ceiling, guard or duration (OR I-II p.668).
  - **Scott's of 13 July** permits demonstration to detain the enemy, with no duration (p.166).
- **What S127 proposes.**
  - **Values:** every value is a stated design value, tied to the kernel's daily tick and its coarse regions. None comes from a period source, and none from Wallace's raid or Patterson's July.
  - **Tests:** twenty-two paired tests that would expose fitting.

## Decision

1. **The limited sortie.**
   - **S1 (sizes).** At most three sizes: a third, two thirds and the whole of the safe allowance `A`, with no zero and no duplicate.
   - **S2 (routes and candidates).** At most two complete pairs of routes out and back to one reported target, so at most six candidates a morning for each selected report and grant.
   - **S3 (the guard).**
     - The commander keeps at least half his local parent's known strength, rounded up. He keeps more where an enacted guard or a defensive need requires it.
     - Men guarding home can't also march.
     - If the parent's strength is unknown, there is no numeric sortie.
     - This prudential guard is not written into any standing mandate. 0124's standing mandates still carry no guard.
   - **S4 (action).** At most one full daily interval of action before returning.
   - **S5 (stores).** Each block's stores after the split must cover preparation, the route out, the action, the route back and one day more. Each leg is rounded up to whole days, and no resupply or capture is assumed.
2. **The enemy estimate is a hard gate.**
   - A sortie needs fresh received numeric estimates, or received clearance, for the target region, home and the regions it crosses.
   - Absent, stale or unknown is never zero, and missing quantification keeps the sortie unavailable.
   - The allocated men must meet the threat by the existing open-field demand, and at a hostile endpoint by the existing assault margin. This is a new conservative feasibility rule.
   - The existing risk terms still rank the candidates that pass. They can't override a failed gate.
3. **The demonstration.**
   - **D1 (detention area).** One or two connected regions.
   - **D2 (action area).** One to four connected regions, including staging, activity, recovery and transit.
   - **D3 (duration).** A `deployment` lasts one or two full daily intervals. A `reconnaissance_in_force` lasts one.
   - **D4 (demonstration candidates).** At most twelve: up to four activity endpoints, each with three tasks.
   - **D5 (all candidates).** With up to four attacks added, at most sixteen candidates, so both means are weighed before scoring. No existing cap, score or term is raised.
   - **D6 (stores).** The same reserve of one day as S5.
4. **These values are pack data, required and validated.**
   - The kernel installs no default. Missing policy means the action is unavailable.
   - The values restrict a received grant, and never supply authority it omits.
5. **Each build proves itself cheaply first.** Before any reference capture, it runs S127's paired tests on fictional fixtures:
   - execution of both means;
   - controls without authority and without reports;
   - an opponent that ignores the activity and leaves;
   - an unknown parent that blocks the split.

   Missing producers of reports and clearances, contact within one coarse region, and stores for split units stay named prerequisites, never fitted exceptions.

Rejected:
- **A preferred absolute size, an absolute garrison, or a guard written into the standing mandates.**
- **Treating an absent estimate as zero, or letting a score override a failed gate.**
- **A historical return date, a duration fitted to July, or a task with no length.**
- **Unlimited enumeration of routes or forces, or raising the existing caps.**
- **Any value fitted to Wallace's raid, to Patterson's July, or to a recorded outcome.**

## Consequences

- **The two builds follow the merge of the mandates into `sprint/july`.**
  - **The demonstration form (0123) comes first.** It bears on U33 and U34, and on the threat Johnston sees.
  - **The limited sortie (0121 item 5) follows.** It bears on Wallace's raid in S99's G07.
- **The guard may limit what the model can attempt.** A Wallace-sized raid of about 500 from a regiment of 866 exceeds half. The model's commander then weighs smaller sizes, and that divergence is accepted.
