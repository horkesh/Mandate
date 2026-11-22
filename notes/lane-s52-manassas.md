# S52: Manassas end to end

S52 only, sprint-1a / sprint/1a, starting at f19b6f0 with S46 staged.
The original index patch is backed up in runs/s52/original-s46-staged.patch.
Source-only commit f2c11d39220dc1aca881cac8965fc86b2b1ac454 passed the real
hook (208 files; 1,950 pass / 5 skips). Its pass does not clear the simulation.

The one default binding check finished exit 1 in 3,067.89 seconds:
`npm run run:done-check -- --milestone 1a --label s52-done`.
Raw log runs/s52/done-check.log. Do not start it again unchanged.
**S52 is incomplete.** Phase 0 passed 4/6; 1A passed 2/6. Liveness, budget,
Confederate strength, pushback, unknown combat blocks and D6 remain failed.
The result and proposals are in `docs/audit/s52-manassas.md` with portable
evidence in `docs/audit/s52-evidence/`. No criterion was waived.
Both completed references replay/resume successfully (268 daily hashes);
testbed hashes and counters match S46. The current candidate patch is backed up
in runs/s52/candidate-before-validator.patch. No push.

## Current work

- Step 2: imported S51 receipt change only, with its 18 regressions. Red:
  14 fail / 4 pass; green: 18 pass. Typecheck exit 0. The separate hook failed one console battle-receipt
  assertion (1,967 pass / 1 fail / 5 skips); no retry or bypass. Nothing from
  S51 is committed yet.
- Step 1: read both S21/S31 disposition registers from origin/sprint/research-military.
  Neither has a matching April-July 1861 observation for these blocks. Later
  Manassas quantities are 1862. Preserve unknowns; never backdate those returns.
- Step 3: implemented `advancingOn` and a caused notice, plus a dated doctrine
  goal conditional on its received paper. Existing planning and movement still
  own execution. 53 focused tests across five files pass, including seven
  authoring guard tests. Typecheck and generated pack/schema checks pass.
  The rail mover has no daily troop-load
  budget: capacity openness is not throughput. That requirement remains open.
- The rules preflight reports two changed fingerprints and their two stale
  inherited baseline entries through principalMenu/pendingRequests. No baseline
  or fingerprint exception was changed. This independently blocks the candidate.
- One 148-day history trace is complete: no rejected commands. The new notice
  is written day 142, reaches Davis day 146 and yields the order day 147.
  Johnston has 22,115 known model men, still joining from distant muster points;
  Patterson has no army. Manassas on day 146 routs Beauregard, not the Union.
  Do not treat any of those model observations as historical headcounts.
- Step 4: empty committed subset selects all assigned land blocks. Draft axis
  sums 135,600; day-144 present 101,600, committed 71,120, engaged 60,000;
  day-146 present 80,600, committed/engaged 56,420. Model quantities, not
  historical returns. No global commitment/frontage/morale change.
- All 1,935 original paths remain. 44 of S46's 52 staged blobs remain exact;
  eight additive overlaps preserve its lines and force values. All 705 inputs
  stayed unchanged during measurement. Afterward only the pack authoring
  validator changed and one test was added; loaded world/initial hashes match.
  Runtime kernel/rule-seat/data remain measured bytes. Reuse campaign evidence.
- Additional page images checked: OR I-2 pp.187,309,324,568. The source note
  preserves dates, scopes and inclusion limits. No live numerical apply.

## Proposed rulings [I]

Retain unknowns where identity/date/measure do not match. Reject allocating a
command total to Garland and Preston, or treating Johnston's estimate of his
opponent as Patterson's actual return. Review numerical scope before apply.

Findings outside my scope: S53-S61; gate/whole-branch review under 0106;
additional live aggregate representation, army/reserve inclusion and rail load
scale needing a lead ruling; pushing, Linux CI certification and release.
