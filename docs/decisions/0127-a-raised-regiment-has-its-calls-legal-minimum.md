# 0127: A raised regiment has its call's legal minimum establishment

Status: accepted (2026-11-23). From S121's research (`docs/research/2026-11-23-S121-regiment-rule-and-returns.md` and `docs/research/S121/` on `sprint/research-military` at `c1e53598`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0125 (the basis of the recruitment rule).

## Context

- **What 0125 asks of the rule.** It gives the recruitment rule `menPerRegiment` the job of producing the model's own men, and asks for a sourced basis. Today the rule is 1,000 for every regiment of every call on both sides.
- **What S121 read.** The 1861 establishments differ by side, kind of call, arm and organisation:
  - **The Union's April call:** a regiment of 780 (37 officers and 743 men), from the War Department's schedule (OR III-I pp.67–69).
  - **GO15 volunteers of 4 May:**
    - infantry from 866 to 1,046, in ten companies of 83 to 101;
    - cavalry from 660 to 1,168, by the number of squadrons (pp.151–153).
  - **GO16 regulars:**
    - infantry of three battalions from 2,020 to 2,452;
    - cavalry from 997 to 1,189;
    - artillery from 997 to 1,909 (pp.154–157).
  - **The Confederacy:**
    - the volunteer act of 6 March: companies of 64 to 100 privates;
    - Cooper's organisation of 3 June: four officers, four sergeants, four corporals and two musicians a company, so 78 to 114;
    - the calls of 22 April: ten companies "of at least 64 men" (OR IV-I pp.126–128, 131, 367, 231–233).
- **What actual musters show.** The sample at muster-in is tiny: one Maine regiment of 779, and two companies of 75 and 95. No mean or distribution is justified.

## Decision

1. **A regiment the model raises has its call's legal establishment at the minimum for acceptance.**
   - **The rule's grain.** It is set by side, kind of call, arm and organisation, with the date the establishment took effect.
   - **Why the minimum.** A unit was accepted at muster only at or above the minimum. That is the one number every accepted unit is attested to have met.
   - **What is rejected.** The maximum is a target few units reached. A midpoint would be fitted. A typical muster can't be inferred from three samples.
2. **Where an establishment gives a single figure, the rule uses it.** For the April militia regiment that is 780.
3. **The Confederate infantry company is counted from the statute's privates plus Cooper's listed ranks: at least 78.** A regiment of ten companies is then 780.
   - Regimental appointments are added only where the law creates them beyond the company ranks.
   - The calls' wording of "at least 64 men" is kept beside the statute's "privates". The build uses the statute's reading and records the other.
4. **The values are pack data, each with its citation.** Every call profile names its establishment. A call that asks for a number of men keeps it.
5. **0125's limits still hold.**
   - **Kind:** the rule's output is labelled `rule`, never cited as a return.
   - **History:** a historical unit with no return stays unknown, and the rule never gives it men.
   - **Lineage:** a generated lot given a historical identity keeps its rule quantity.
6. **Estimates of the state forces count only at their own scope** (0125 item 5).
   - The sources are Virginia's "upward of 40,000" of 17 June and Tennessee's "about 22,000" of 23 July for the whole army.
   - Such an estimate may bound a group's total at a checkpoint only where its membership reconciles exactly with the model's lots.
   - Otherwise it stays a diagnostic printed beside the checkpoint.
   - It is never divided among lots.

Rejected:
- **One number of 1,000, or one constant for each side across all arms and calls.**
- **A legal maximum, a midpoint fitted to July, or an average of cumulative enlistments.**
- **The rule's number for an unreturned historical unit.**
- **Changing an establishment to meet a checkpoint.**

## Consequences

- **The build.** It replaces `menPerRegiment` with the establishments by call, and measures. The Union's counted men will fall where calls move from 1,000 to 780 or 866, and the Confederate count will move by the same rule. Each change is published with its call.
- **Empirical samples stay open as research.** Their purpose is to inform a later review of the fill assumption, never to set a lot's men.
- **The sixteen historical unknowns that fight stay unknown** until their returns are found: fifteen North Carolina regiments and Preston.
