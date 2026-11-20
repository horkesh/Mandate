# 0105: 1A's first calibration round: continue or park

Status: accepted (2026-11-20). The lead's continue-or-park ruling after lane 1.14 Part B's first budget of eight measured runs (Codex's R85, under 0096, on `phase1-done-check-1b` at `ede2a55`), as `docs/LANES.md` requires of a calibration lane. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0099.

## Context

- R85 spent its budget of eight measured runs on the integrated history run. It kept two sourced data corrections:
  - the western Virginia checkpoint names `st_virginia_restored`;
  - Missouri's provisional government falls on 31 July.
- It rejected three changes to global parameters, each for a stated reason:
  - **Goal boldness:** moved no criterion.
  - **Compliance threshold:** cut reservations from 44 to 4, but broke the initiatives band.
  - **Assault rate:** fitted Fort Wagner but broke Fredericksburg and Franklin.
- No band changed, and 1A stands at 2 of 6.
- Its diagnoses show that the failures are missing pieces, not wrong knobs:
  - **Armies never raised:** the Confederacy holds about 21,000 men against a band of 100,000 to 200,000. The sourced calls and state-force transfers aren't all in the data, and the doctrine suppresses a repeat call once one is answered.
  - **No field army at Manassas:** McDowell advances into empty ground, so no battle is fought by 31 July.
  - **Sumter not counted:** the bombardment writes no battle record, so it doesn't count as the Confederate planned operation that was fought.
  - **Compliance and initiative coupled:** one threshold (`complyAt`) governs both requested orders and spontaneous initiatives.
  - **The filter office is vacant,** so no filter hold can occur.

## Decision

1. **Accept R85's two data corrections, and its three rejections.** No band is widened, and no global parameter is moved to offset a missing mechanism.
2. **Checkpoints: continue.** The missing calls and transfers are supplied from the sourced record before anything else changes:
   - the Confederate calls of March and April 1861, and the state forces transferred to Confederate service;
   - the Union calls of 15 April and 3 May, and the July acts;
   - repeat calls allowed where the record has them.
   Men per regiment and the strength bands stay as they are. Virginia's secession date is reviewed with the calls, because the call reaches Letcher by courier where the record has it go by telegraph.
3. **Operation: continue.**
   - **The bombardment writes a battle record** with its actual loss terms, so Sumter counts as the Confederate planned operation fought. Telemetry is not a battle record, and no battle is forced by a weight.
   - **Bull Run is left to emerge.** The Confederate field establishment that concentrates at Manassas follows from item 2's calls and transfers and the rule seats' concentration. If it then happens, Bull Run emerges rather than being scripted.
4. **Pushback: continue.**
   - **The two thresholds separate.** A spontaneous initiative's admission threshold becomes its own pack rule, apart from ordinary compliance. Then `complyAt` can be calibrated against the reservations band without flooding the initiatives.
   - **The filter office** gets its holder from the sourced record. No filter hold is invented by relabelling other screening.
5. **Lever sweep: park D6 clearance until 1B,** which owns the missing consequence channel (people's grievance through policy pushback; 0099, G-1.14c and d). **Continue its recruitment-chain item now,** with item 2.
6. **Assault losses: investigate the contact geometry** for works assaults, with lane 1.3, in a bounded probe, not by raising every assault's rate.
7. **A second budget of eight measured runs** opens once items 2 to 4 are on main, starting from the corrected data.

Rejected:
- **Raising every assault's rate to fit Fort Wagner.** It breaks the sourced Fredericksburg and Franklin cases.
- **Lowering `complyAt` alone.** It fixes reservations by breaking the initiatives' sourced band.
- **Counting the bombardment's telemetry as a battle record,** or forcing a battle by weights.
- **Widening any band, or parking all of 1A.** The failures have identified causes that the work in items 2 to 4 addresses.

## Consequences

- Codex's next requests cover items 2, 3, 4 and 6, each in its own lane.
- R85's branch merges with its two data corrections. The next calibration round re-measures on the integrated head, with resignation and send-back notes on main.
