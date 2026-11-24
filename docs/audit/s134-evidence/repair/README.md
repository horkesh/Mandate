# S134: hook repairs and remaining testbed flank zero

The 0130 work remains staged on `sprint/july`, after merge `2a5e62d1`.
The lead's 2026-11-24 hook-repair ruling is implemented. **No new ordinary
hook or commit has run:** the remaining testbed `combat.flank_broken` zero
returns to the lead before the hook, as that ruling requires. Its existing
`1..4` band is unchanged; no quiet exception is applied.

## Corrections

- Declare `ObservedCount`, `StrengthComponent`, `StrengthEstimate` and
  `PlanCandidate.candUnavailableTerms` immutable. Prefix `ObservedCount.kind`
  as `countKind` to meet immutable-key uniqueness. The ownership scanner and
  all its assertions are unchanged.
- Replace eight inline import-type expressions with ordinary type-only
  imports. The banned-API scanner and its assertions are unchanged.
- Regenerate the testbed day-40 save with `tools/make-save-fixture.ts` for
  the changed State. All seven seats-run tests, including exact replay and
  continuous-versus-resumed equality, pass. The eventual commit must mention
  this regeneration.
- Give the shortfall-edit, audience and authored-retry controls affirmative
  fictional enemy reports and explicit neighboring clearances. Missing
  information no longer supplies their numeric premise. Keep the shortfall,
  promised-reinforcement arithmetic, retry identity, proposal and stale-reply
  assertions. Localisation now verifies substituted wording for an unknown
  estimate and the actual moving-axis waypoint rejection. The console renders
  the pack's unknown token instead of `null`. These five focused files pass
  all 71 tests.
- Rebind the authorised union goal-fit `0..0` record without the band-level
  field reserved for stalled bands. Cause, observation, evidence and independent
  G5 driver remain unchanged. The binding fingerprint is
  `48a1f2aaed89179a9018f2f5039fcd0676624594b76bbd409bbac272a2bf9d88`.
  The frozen record and driver are in
  [the support fixture](../../../../tools/test/support/s134-quiet-transition.json).

## One union comparison

The sole repair capture took 129.034 seconds and exited 0. There are no
rejections; daily replay, day-60 resume and saved-log replay match.
[The comparison](union-comparison.json) records the exact difference from
the held 0130 capture: `kind` becomes `countKind` in saved observations.
All 17 captured artifacts match after that field-name normalization; the
complete event stream is byte-exact. No force quantity, decision, route,
estimate, operation, battle result or liveness count changes.

The final hash changes from
`c19569cb40973417440d590db337e8a481a27294953f63c8d2a659fd97cb6217`
to `22199b6c923ae2800cf670435094317852a921b6cc14d4ebb290e812f07c5b7b`.
World hash and [all 33 coverage rows](rows.csv) are unchanged:
6 matched, 15 mismatches, 2 not observed, 10 representation gaps.
All unmet criteria in the [held packet](../build/README.md) remain binding.
The new complete views, plans, correspondence, choices and actual battle
records remain in `runs/s134/repair-capture`, with
[their hashes and sizes](raw-inventory.json). Nothing overwrites the held run.

## Testbed bands and lead decision

[All 29 counter differences](testbed-count-changes.json) include magnitudes.
The [22 moved positive firing counts](testbed-band-review.json) are recentered
with `around(observed)` and individual cause records. This includes the revived
`operations.repulsed` (1), `planner.term.glory` (2) and `planner.term.time` (2).
Glory leaves the global quiet list; union's identical inherited glory band is
retained explicitly. [Term-removal counterfactuals and the repulsed operation](testbed-counterfactuals.json)
show both northern drafts change to holding when either time or glory is removed.

**The only remaining runtime gate failure is testbed `combat.flank_broken`,
1 to 0.** [The cause and live driver](flank-zero.json) and
[before/after drafts and battle records](testbed-trace.json) retain the evidence.
Unknown opposition changes the route/contact sequence under 0130. The old
south-capital battle on day 23 has draw 204 below threshold 206 and breaks a
flank; its new day-30 counterpart has draw 283 above threshold 207. All eight
new side draws exceed their thresholds. No flank rule, threshold or RNG stream
is changed. The independent `combat.test.ts` low-draw driver still passes.
Recommend accepting this single testbed reference zero with its live driver;
this recommendation is not a waiver.

[Saved-run rejudging](gate-review.json) finds no union failure, one testbed
flank failure and no band-table problem. Eleven of the sixteen individual
hook failures have direct corrections; the other five liveness assertions
depend on this one remaining zero. No assertion, scanner, numerical score,
force quantity or combat threshold was weakened to obtain a pass.

## Verification and preservation

Logs and command/exit receipts are under `runs/s134/repair-*`:
`repair-fixtures-informed`, `repair-ownership`, `repair-save-check`,
`repair-binding-check`, `repair-final-band-table-complete`,
`repair-flank-driver`, `repair-presentation-configured`,
`repair-final-typecheck`, `repair-desk-typecheck`, `repair-boundary-settled`,
`repair-rules-settled`, `repair-licences` and `repair-decisions` pass.
The prototype tests are pure headless tests; no browser or desktop control ran.
The full hook is deferred by the explicit lead-before-hook condition.

[Preservation](preservation.json) verifies four protected files, 122 earlier
S130/S132 files, 52 merge files and all 39 held build-packet files unchanged.
Both raw union captures remain exact; 847 measured files are archived exact.
Only liveness metadata and its binding test change after the repair capture.
All 213 prior cause records are an exact prefix, followed by the authorised
goal-fit record and 22 positive testbed records. The
[eight projection roots](projection-proof.json) retain their complete reader
identities; three closure hashes are rebound without adding a protected read.

S135 and all other worktrees are outside this work. No push, bypass or further
capture is assumed.
