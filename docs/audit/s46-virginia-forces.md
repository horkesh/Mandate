# S46: Virginia forces on their dates

For the lead: three items. S46 only, `C:/Pyrrhic/sprint-1a`, `sprint/1a`,
from `23b5d49`. Head remains **f19b6f007267997a652d06d18497118977e46c69**.
The Virginia candidate and this evidence are staged for rulings, not committed
or cleared. No push, history rewrite, browser, desktop control or server.
S47/S48 worktrees were not accessed.

1. **Step 1 committed:** `f19b6f0`, the authorized `9f74de6` map-fix merge.
   Actual hook exit 0: 208 files, 1,952 tests passed, three inherited skips;
   typecheck, rules, boundary, licences and 106 decisions passed.
2. **Step 2 is a sourced state-force draft.** Norfolk starts with the 18 April
   record, Harpers Ferry with 22 April, Richmond with 26 April, Manassas with
   the first observed garrison on 15 May, and the Peninsula with the explicit
   21 May reference to existing troops. The alignment cause can delay entry.
   Institutional commands and four successions use the existing notice path;
   Magruder's Hampton-line assignment uses ordinary appointment delivery.
   Local muster/command, sourced relief and service transfer extend the existing
   state-force path. Original source act, enlistment credit, term, location,
   assignment and losses survive the service transfer. Harper's militia are
   separately relieved on 28 April. Their share of his approximate 2,400-man
   combined report is unknown: **no 2,400-man militia block remains**.
   The six volunteer contingents have unknown headcounts and original terms.
   The 6 June act transfers their surviving identities; it creates none.
   The later statewide aggregate is not added to these local contingents.
   Sources, printed pages, allocation inferences and limits:
   [research note](../research/2026-11-21-virginia-state-forces.md).
3. **Step 3 ran once with the requested default caps.** The fixed 86 S39 inputs
   were fed through `ConsoleSession`, as S43 did. Baseline is the step-1 snapshot,
   whose simulation matches requested `23b5d49`, with its own workspace aliases.
   **Stone still reaches Richmond on 15 May, day 71, in both runs.** The new
   garrison under Magruder has an explicit unknown block, zero quantified men,
   and withdraws. The later 19 July Richmond battle remains. Both fixed-input
   console runs end on 7 August, day 155; four intermediate turn stops differ.
   S43's older `edc57b0` end date is not substituted for this requested baseline.
   No moves were chosen from private observation.

## Evidence and failures

The one command was
`npm run run:done-check -- --milestone 1a --label s46-candidate`:
**exit 1, 1,445.62 seconds; Phase 0 5/6,
1A 2/6**. All twelve criteria and every failure are in
[done-check.json](s46-evidence/done-check.json). Behaviour, hashing, resume,
section-ten, tick budget, planned operation and stand-in criteria pass.

The corrected reference has two liveness breaches:

| Mechanic | Observed | Unchanged band | Cause |
|---|---:|---:|---|
| `combat.withdrew` | 1 | 0..0 | The local unquantified Manassas force is contacted on 27 July and withdraws. Two unknown blocks remain explicit; a rout is not relabelled. |
| `command.post_succeeded` | 5 | 1..4 | Four sourced Virginia successions add to the original one. |

The 29 July Manassas battle record is **identical to S42**, including its
16,000 Confederate and 56,420 Union committed men. The extra 27 July local
contact is additional, not a forced replacement battle. Returned orders remain
in band in the corrected candidate.

Other binding failures remain unmet:

- Confederate known strength is **90,239**, below 100,000; 23 blocks are unknown.
  It was 130,239 with the old 40,000-man aggregate. This change removes a second
  representation of Virginia's quantity without inventing local allocations.
  The aggregate evidence and unresolved statewide residual need further work;
  this is not a claim that historical Confederate strength was 90,239.
- The two Manassas battalions fight with unknown strength, failing that criterion
  in both the reference and history checks. Unknowns are preserved, not waived.
- Pushback: relay holds 1, filter holds 0, trims 0, reservations 18, slow walks 18.
- Both Fort Monroe D6 gaps persist: invalid consequence measure and an
  unexercised border recruitment chain. No D6 clearance.

The single step-2 hook attempt, **before the militia-share correction**, exited
1: 207 files passed / two failed; 1,958 tests passed / three failed / three
inherited skips. Its three assertions named withdrawal, successions and returned
orders. The source correction was cheaply verified before the one full done
check. Returned orders cease to breach in the corrected reference. No second
hook was run against already known unmet bands. The earlier hook is not claimed
as a passing check of the final tree. Its tree and complete log are retained in
`runs/s46/hook-attempt-tree.txt` and `runs/s46/step2-hook.log`.

Corrected generation, targeted source test, typecheck, rules and diff checks
pass. Unaffected schema, boundary, licence and decision checks are reused;
[check exits](s46-evidence/check-exits.json) and [receipts](s46-evidence/checks.json)
identify the evidence. No band, scoring parameter, frozen quiet list, 338-band
origin, fingerprint exception, global troop norm or tick limit was changed.

## Hashes, causes and preservation

- All **148 Union reference daily hashes** and all **155 console daily hashes**
  change; all **120 testbed daily hashes and every testbed counter** match.
  Initial opening blocks and locations are identical. Six added neutral-person
  rows in six State tables explain the different initial hash; they are not
  pre-April troops. [Initial comparison](s46-evidence/initial-difference.json).
- All 155 console hashes replay, and its final saved State matches. Both
  reference saved-log replays, daily hash replays and final resumes pass.
- **35 Union counter rows**, **eight score checkpoints**, and **six rule-seat
  command groups** change. Each old/new value and its cause or marked inference
  is retained in [reference comparison](s46-evidence/reference-comparison.json),
  [checkpoint comparison](s46-evidence/checkpoint-comparison.json) and
  [command differences](s46-evidence/command-differences.json).
  The extra Hampton-line appointment and removal of the old governor aggregate's
  day-94 transfer are explicit. The diagnostic's final hash matches the done
  check reference: `ff7990ec0914365e2edc52a10b5d3ad66bece9b85456c2e28571fc939c1d0340`.
- The fixed input lines, all changed console hashes and four timing differences
  are retained in [advance comparison](s46-evidence/advance-comparison.json)
  and [input timing](s46-evidence/console-input-timing.json).
- Reference median/p95 **30.46/64.26 ms**, history **32.55/67.29 ms**, testbed
  **2.51/3.94 ms**. The unchanged 40/160 limits pass locally; Linux CI is not
  certified here. Drafting's capped worst day is 21.8 ms.
- All **1,899 original tracked paths remain**. All **701 measured inputs** stayed
  byte-identical through the final measurement. Runtime aliases, inventory and
  preservation checks were completed before this final-result report:
  [inventory](s46-evidence/inventory.json).

Raw logs, original and corrected candidates, complete private daily observations,
fixed-input baseline snapshot and saves remain in `runs/s46/`. Downloaded primary
texts stay outside all worktrees in `C:/Pyrrhic/mandate-research-sources/S46/`.
No original source or save was removed.

## Proposed rulings [I]

Accept the bounded dated-state representation and its explicit unknowns for
review. Accept the research note's local allocation, initially neutral civilian
succession, sourced militia relief and identity-preserving transfer choices.
The exact Manassas battalion arrival dates remain inferred, not proved.

Recommend `around(5)` for institutional successions and `around(1)` for the now
live withdrawal, each with the cause above; only the lead may retire the frozen
Union quiet entry and apply those changes. **Neither change is applied.** Keep
the strength floor and unknown-strength combat acceptance criteria unmet until
source coverage or a separately authorized uncertainty model resolves them.

Reject adding the statewide total again, fabricating each local strength or
original term, hiding the unknown blocks, forcing Richmond resistance or a July
battle, fitting combat parameters, lowering the historical strength floor,
waiving D6, or bypassing the hook.

Findings outside my scope: exact statewide residual and local company rolls,
original terms, detailed cavalry/artillery and naval apply; optional North
Carolina, Tennessee and Arkansas apply while Virginia awaits the lead's rulings;
remaining pushback/D6 work; S47/S48; whole-branch/gate review, CI, integration,
pushing and release. Nothing is signed or cleared.
