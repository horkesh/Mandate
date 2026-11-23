# 0130: An estimate keeps its unknown remainder

Status: accepted (2026-11-24). From S133's proposal (`docs/design/S133-ESTIMATES-UNDER-UNKNOWN-STRENGTH.md` and `docs/research/S133/` on `sprint/pushback` at `cd36eca4`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0125 (how a belief and the planner carry an unknown) and 0128 (a finite interval at a numeric gate).

## Context

- **What 0110 and 0125 keep unknown.** A historical force with no return keeps its truth unknown. Commanders still had to judge the enemy, and their scouts reported counts and estimates, often wrong.
- **What S130 found.** The regional planner's legacy fallback reads an explicitly unknown estimate as a small number, which contradicts 0125. Patterson's opposition fell from 4,630 to 532, attacking scored well, and the planner's time term stopped mattering.
- **Where the zero enters.**
  - `knowledge/beliefs.ts` reads only numeric strength claims.
  - `planner/input.ts` projects them to a map of numbers.
  - `planner/context.ts` fills what is missing with zero.
  - `planner/score.ts` treats zero opposition as a favourable ratio.
- **The record S133 read.**
  - Mahan's working allowance of 600 to 700 men to a formed battalion (p.28).
  - The Regulations' line between what a scout has seen and what he has only heard (pp.94–95).
  - Scott's words of 13 July: "the valley of Winchester" (OR I-II p.166).

## Decision

1. **An observer reports what he can count, and his estimate is attributed to him.**
   - He reports visible men, formations, units, guns, camps and activity as what they are, with the place, time and conditions.
   - He converts to men only on a read basis. The one such basis now is an observer who distinguishes `b` formed battalions, who may report an estimated component of `[600·b, 700·b]` from Mahan's allowance. This is marked `[I]`, and it never states the men of any historical lot.
   - No numbers are given for companies, regiments, guns or camps.
   - If he can count nothing, the strength is unknown. "Not seen" is not clearance.
   - 0052's perception bias applies once, to both ends of an interval.
2. **A belief keeps its parts.**
   - It holds presence, counted and estimated components, coverage, and an unknown remainder.
   - A partly counted force is that component plus an unquantified remainder, never the component alone.
   - A fresh unknown at the same scope defeats the completeness of an older number.
   - Knowing where a command is doesn't tell how many men it has.
   - The unknown survives every consumer: beliefs, the view, dispatches, the planner's input, the neighbouring threat, routes, ratios, `outmatched`, and explanations.
   - A comparison with an unknown is undetermined. It is never false, and never zero.
3. **The planner compares candidates only on terms it can evaluate for all of them.**
   - **Ordinary offensives.** Where a relevant enemy strength is partly unknown, the force ratio and the reinforcement demand derived from it are unavailable for every candidate compared, with a typed reason. Time, goal fit, caution, stores, travel and the other independent terms keep their weights. Such an offensive may be chosen, uncertified.
   - **No new term.** No bonus for missing data, no penalty for uncertainty, and no fitted weight.
4. **Gates stay gates.**
   - **The attack means of `attack_or_demonstrate`** keeps its numeric gate.
   - **A demonstration's fresh-estimate check** on its recovery stops still blocks an unknown.
   - **The limited sortie** is still a hard block when its estimates are unknown (0128).
   - **A complete finite interval** passes a numeric gate at its upper endpoint, as the observer's belief, never as a true bound.
5. **The truth is untouched.**
   - An observer's estimate never sets a lot's men.
   - It never clears the criterion on unknown combatants, and never certifies detention.
   - 0110's unresolved contact for a side wholly of unknown strength stands.
6. **"The valley of Winchester" is `lower_valley`.**
   - The map's whole Valley corridor (lower, middle and upper valley, and the Harpers Ferry outlet) would exceed 0128's two-region limit.
   - Geography never follows where Johnston happens to be in a run.

Rejected:
- **Zero, one, the establishment, an average unit, a midpoint, a fitted gap, or a lookup of the true strength for an unknown part.**
- **Treating every attack as a sortie,** and blocking it until every enemy return exists.
- **Keeping the last number as the complete picture after an explicit unknown,** or discarding the known parts.
- **A new caution penalty, a fitted time weight, or an exception for Patterson.**
- **Filling true lots from an observer's conversion,** or using an estimate to pass the unknown-combatant criterion.

## Consequences

- **The build.**
  - It changes the producers, beliefs and planner inputs together, never only the final division.
  - It runs S133's eight groups of acceptance tests on fictional fixtures first.
  - It then measures, and reviews the quiet `planner.term.time` record of S130.
- **What the measurement must show.** The operation stays reachable without guessed totals: an ordinary attack can still be chosen, and quantified forces fight under the battle rules. Whether McDowell's and Patterson's choices change is measured, not promised.
