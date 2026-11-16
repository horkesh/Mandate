# 0078: Men and regions, as built, and enslaved people in Union-held slave states

Status: accepted (2026-11-16). From Phase 1 lane 1.7 (`notes/lane-1.7-men-regions.md`), the standing reviewer's review and re-checks (`review-lane-1.7.md`), and the gate reviewer's verdicts G-1.7a and G-1.7b (`review-gate-1861.md`). Decided by the lead under the working style in `CLAUDE.md`, adopting the gate reviewer's recommendations; the owner can overturn it. Carries out FOUNDATION section 12's row 1.7 (0073) under 0046 and 0074.

## Context

Lane 1.7 built governors raising regiments on a call, enlistment terms that run out, region loyalty, and the self-emancipation term 0046 placed. Its gate review found that the term skipped every region the Union held. That would erase the people still enslaved in Maryland, Delaware, Missouri and Kentucky, where slavery stayed lawful and commanders returned fugitives.

## Decision

**Raising men.**
1. **A call is an order to each governor,** answered by his compliance. His values (`state_autonomy` among them, 0074) and his region's loyalty set the share and the delay. A refusal or an objection raises nothing and sends a memorandum.
2. **One block per answered call,** not per regiment. The regiment count rides in the block's enlistment (`forceEnlistments`, written by `forces`).
3. **A block is made by one recruitment proposal, applied in one phase (2d).**
   - `forces` creates it and its enlistment;
   - `movement` places it at the governor's region;
   - `command` assigns it to his post and clears the levy (`postLevies`).

   Disbanding is the same proposal in reverse. No field has a second owner.
4. **Recruitment runs daily,** not in the weekly step. A muster and a term's end fall on particular days: the ninety-day men went home on theirs.
5. **A block whose term ends during an open battle** keeps its men until the battle closes.
6. **A levy due in an enemy-held region** waits, re-checked daily. Past the pack rule `recruitment.musterBlockedDays`, it lapses, with a typed report to the caller.
7. **A call to a self-governing department's post is refused** (SENSITIVE-HISTORY 3.7: no seat recruits a nation).
8. **No `men` stock in `economy` yet.** A regiment goes straight from the governor into a block (1B).

**Region loyalty is State,** owned by `regions`, from sourced start values. It scales a governor's levy and is never a stand-in for control. Where nothing is recorded it is null, never a guess. In a slave state it is the free and voting population's loyalty, and it never comes from the census.

**Self-emancipation (0046, 0074).**
- **What the term is:** derived and pure, with two causes:
  - resistance and flight within, which no one's reach drives;
  - flight to the lines, scaled by Union reach and by known policy.
- **What it writes:** only the second cause proposes arrivals, and only `regions` writes them (`regionReachedUnionLines`).
- **The census** is World data, read and never depleted.
- **Agency reasons:** each cause, and each pressure flag, carries its own reason type from the gate register. Cause 1's type follows the region's government.
- **The term runs in Union-held regions too** (G-1.7a), with the region itself as where people flee to: its posts and camps. A policy of `return` lowers it.
- **A protection flag skips a region only where slavery has ended there in law or in fact** (G-1.7b), on the model of the District of Columbia act of April 1862.
- **A policy that protects people who reach the lines** is a policy flag. It raises flight to the lines and never skips the region. No text calls the people counted there free.

Rejected:
- **One block per regiment.** Hundreds of blocks in a Union run.
- **Creating the block when the governor answers.** A governor could then never slow-walk a call.
- **Recruitment in the weekly step.** It would bunch musters and term ends onto one day a week.
- **Skipping every Union-held region.** Enslaved people in the loyal slave states would vanish from the model, which frames by omission.
- **Skipping a region wherever the Union protects arrivals.** Protecting those who reach the lines frees no one else in the region; it is exactly when flight there rises.

## Consequences

- FOUNDATION section 10 lists the new fields, and its tick list runs recruitment at 2d and self-emancipation at 4a′.
- **Lane 1.11:**
  - enters `state_autonomy` in the Union values vocabulary;
  - enters the Union calls, loyalty start values and any census rows under these rules;
  - adds a protection flag only where slavery ended in law or in fact, with R7's sign-off.
- **Lanes 1.12 and 1.14:** run the lever sweep with recruitment active, because 0046's border-loyalty gain from `return` now feeds regiments.
- **1B:** once the term reduces Confederate capacity, only `tick/regions.ts` and the capacity derivation may read it or the arrivals. Arrivals never add to Union men or labour.
