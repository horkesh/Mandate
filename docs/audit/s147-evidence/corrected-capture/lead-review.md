# S147 corrected capture: complete, with fifteen floors still unmet

For the lead: 2 items. S147 only on `sprint/allocate`, entry `91a816bd`.
The lead accepted the implementation and successor-mission correction and
explicitly authorised this one corrected capture. The failed day83 attempt is
preserved separately; its inventory still matches. No simulation runtime behavior was
changed after that acceptance, and no measurement was repeated after this run.
The ordinary hook failed; the combined candidate remains staged and uncommitted.

## Result and full publication

Day **148**, rejected commands **0**. Final hash:
`2c15472760578da1e426327c9a8bf66012910ed3693099d507047aa6156e66a0`.
Daily replay, day60 resume and saved-log replay agree. Raw final State,
day120/140/146 States and save60 are pinned by [raw-inventory.json](raw-inventory.json).
The baseline remains S141's corrected capture; [input-receipts.json](input-receipts.json)
pins its summary and observations.

- [All33 coverage rows](rows.csv), with complete [coverage evidence](coverage.json):
  6 matched,13 mismatch,10 representation gaps,2 unresolved,2 not observed.
- [All420 command-total rows](army-totals.csv), and [1,223 lot/kind rows](army-lots.csv)
  on days120/140/146. These are actual command subtrees, not physical army
  concentrations or historical target sizes. Every original417 command-total
  row is unchanged, and the lot CSV is byte-identical to S141. Washington's
  additional command contributes three empty rows. Unknown strengths remain unknown.
- [Every own request](requests.json), [every separate answer and reason](answers.json),
  [all receipt evidence](receipts.json), and the complete
  [causal journal](causal-events.jsonl), including dispatch and paper-receipt
  envelopes. The journal distinguishes updates to an undertaking from actual
  troop receipt; [offers](offers.json), [allocation undertakings](allocations.json)
  and [place receipts](service-receipts.json) retain their own identities.
- [Every battle](battles.json): the same one Sumter record with two fighting days;
  [no changed battle](changed-battles.json). No July field battle is restored.
- [Every original band and count](all-bands.json),
  [all bands after recentring](all-bands-after-recentre.json),
  [every changed count/magnitude](band-count-changes.json),
  [the eight positive updates](positive-band-review.json),
  [no new zero](new-zeros.json), and
  [every S141 zero's disposition](s141-zero-disposition.json).

| Day | Command | Lots | Return | Estimate | Rule | Unknown lots |
|---|---|---:|---:|---:|---:|---:|
| 120 | `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |
| 120 | `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 120 | `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 120 | `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 120 | `us_dept_washington` | 0 | 0 | 0 | 0 | 0 |
| 140 | `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |
| 140 | `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 140 | `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 140 | `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 140 | `us_dept_washington` | 0 | 0 | 0 | 0 | 0 |
| 146 | `cs_cmd_harpers_ferry` | 1 | 0 | 0 | 780 | 0 |
| 146 | `cs_cmd_manassas` | 0 | 0 | 0 | 0 | 0 |
| 146 | `us_dept_northeastern_virginia` | 0 | 0 | 0 | 0 | 0 |
| 146 | `us_dept_pennsylvania` | 0 | 0 | 0 | 0 | 0 |
| 146 | `us_dept_washington` | 0 | 0 | 0 | 0 | 0 |

## Requests and separate decisions

Five requests, each an unknown-enemy one-regiment bootstrap of real infantry
service; fourteen answers, no grant. This is an observed software trace [M],
not a claim that these are historical letters.

| Sent day | Requester | Answer path and recorded reasons |
|---:|---|---|
| 96 | `cs_cmd_harpers_ferry` | day102 `cs_forces_virginia` relay (compliance:comply, committed); day103 `cs_secretary_war` relay (compliance:comply, authority_unavailable); day104 `cs_president` ask_governor (compliance:comply, authority_unavailable); day105 `st_gov_alabama` defer (compliance:comply, offer_unreceived) |
| 113 | `us_dept_pennsylvania` | day114 `us_general_in_chief` relay (compliance:comply, scope_unavailable); day115 `us_secretary_war` relay (compliance:comply, authority_unavailable); day116 `us_president` ask_governor (compliance:comply, authority_unavailable); day130 `st_gov_california` defer (compliance:comply, scope_unavailable) |
| 125 | `cs_cmd_harpers_ferry` | day126 `cs_forces_virginia` relay (compliance:comply, retention_comparison_undetermined); day127 `cs_secretary_war` relay (compliance:comply, authority_unavailable); day128 `cs_president` ask_governor (compliance:comply, authority_unavailable); day129 `st_gov_alabama` defer (compliance:comply, offer_unreceived) |
| 135 | `us_dept_northeastern_virginia` | day138 `us_general_in_chief` refuse (compliance:object, scope_unavailable) |
| 141 | `us_dept_pennsylvania` | day142 `us_general_in_chief` refuse (compliance:object, scope_unavailable) |

McDowell, Patterson and Beauregard remain empty at all three snapshots.
Johnston retains his one existing lot,780 rule men. Receipt precedence and
requests do not invent an unread destination, transfer or uncommitted donor.
The five requests did not obtain a new troop receipt or form a July army.

## Zeros reported before the hook

**No new zero. All fifteen inherited positive floors remain breached.**
The three additional S141 zero counts already had zero minima and also remain
zero. [zero-review.json](zero-review.json) records all eighteen dispositions
and the fifteen binding failures; no zero permission or floor was changed.
The following positive floors still see zero firings:

- `combat.battle_closed`:0; floor2.
- `combat.battle_opened`:0; floor2.
- `combat.captured`:0; floor2.
- `combat.flank_broken`:0; floor1.
- `combat.general_hit`:0; floor1.
- `combat.killed_wounded`:0; floor5.
- `combat.missing`:0; floor4.
- `combat.routed`:0; floor2.
- `combat.withdrew`:0; floor1.
- `forces.stragglers_returned`:0; floor92.
- `map.pocket_relieved`:0; floor1.
- `operations.repulsed`:0; floor1.
- `planner.term.time`:0; floor1.
- `reports.commander_lost`:0; floor1.
- `seats.battle_orders`:0; floor5.

Eight moved **positive firing counts** were recentred by the standing
`around(observed)` rule, with appended causes and evidence. Two additional
magnitude-only changes did not change a band. The retained-summary gate has
only these fifteen dead-floor failures after recentring; its sole positive
frequency failure (`seats.choices`) is cleared. The ordinary hook's reference
run and done-check liveness assertions require these floors to pass. A lead
ruling on them is requested before a combined commit can succeed through that hook.

The operation criterion still passes on Sumter, while the Union planned-
operation checkpoint fails at0 and the Confederate known-strength checkpoint
is unresolved below its minimum. [scores.json](scores.json) retains both;
one pass does not waive the others. No historical/timing acceptance is claimed.

## Checks and preservation

The31 fictional tests,44 ownership tests, retained-boundary correction and
seven unchanged protected-reader roots are reused from the accepted
implementation; fingerprints verified its40 source/data/tool files before the
runner's output-directory change. Capture, replay, resume, inventories and
preservation checks precede this report. Boundary and rules checks after the
eight metadata updates exit0, with0 new/changed/stale rules findings.
S141's76 starting staged paths remain present;71 working files stay byte-exact
and five have authorised additive implementation/band extensions. The index
was exact before staging the combined candidate. No bypass or push.

## Ordinary hook and final correction checks

`git commit` invoked the ordinary hook after boundary and rules passed. The
hook exited1 in304.28 seconds:274 files passed,12 failed;2469 tests passed,
16 failed and3 skipped (plus the failed console suite). HEAD stays91a816bd.
[Every failure block and disposition](hook-disposition.json) and
[the retained excerpts](hook-failures.txt) are published. No bypass or push.

Cheap corrections separated public ForceNeed/AllocationScope contracts from
backend State imports, replaced inline import-type syntax, guarded principal
console fields, and updated exact ownership/assignment inventories and one
test arithmetic expression. The lexer and boundary/API scanners are unchanged.
The contradictory global quiet entry for plans.approved was removed because
that mechanic already has a positive reference band; no floor was lowered.
[Four kernel files have equal type-stripped executable output](type-only-runtime-equivalence.json),
so the corrected capture is reused.98 focused tests and6 band-table controls
pass. Typecheck, boundary, rules (0 findings), licences and decision-index
checks pass; [all logs and hashes](validation-results.json) are retained.

Eight failure blocks remain unresolved from the hook:three test assertions
encounter the same fifteen zero floors;five concern New York concentration,
two doctrine start days, plan-choice telemetry count and a mixed-lot synthetic
concentration fixture. Their assertions and runtime behavior were not fitted.
No post-correction full-suite result is claimed. Repeating a known-rejecting
hook would not answer a new question, so it has not been repeated.
[Final preservation](final-preservation.json) confirms all raw hashes and
S141's76 original paths (71 byte-exact;five authorized extensions).

For the lead:
1. Rule on the fifteen remaining floors; they were reported before the hook.
   No army size, target date, contract, quantity, score, speed or RNG seed was
   tuned to eliminate them. No further measurement is authorised or proposed.
2. Review the unchanged army holdings and the five unsuccessful request paths.
   Missing evidence and the later schema7/8 integration remain outside S147.
3. Resolve the five remaining allocation/timing/choice assertions against the
   accepted behavior before another ordinary hook. No passing checks waive them.

Findings outside my scope
