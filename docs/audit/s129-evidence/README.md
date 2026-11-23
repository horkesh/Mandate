# S129: three captures and the appointment-readiness repair

**The readiness repair restores the appointments and both onward handoffs.**
Exactly one additional148-day capture ran under the latest ruling. Its raw
exit1 reports seven positive liveness breaches. No new zero remains; after the
seven standing `around(observed)` recenters, rejudging that saved evidence
passes every liveness row. No further dedicated capture ran. This is not 1A
clearance: C25 is now an observed mismatch and other binding criteria remain.

## All three S129 captures

| Measure | Original | First corrected | Readiness repair |
| --- | --- | --- | --- |
| Raw directory | `runs/s129/capture/` | `runs/s129/corrected-capture/` | `runs/s129/readiness-capture/` |
| Elapsed / raw exit | 106.874s / 1 | 97.460s / 1 | 85.196s / 1 |
| Days / command rejections | 148 / 0 | 148 / 0 | 148 / 0 |
| Replay / day60 resume / saved-log replay | exact / exact / exact | exact / exact / exact | exact / exact / exact |
| State assignment to Lee | returned49 | received/accepted54 | received/accepted54 |
| National assignment to Lee | received/accepted78 | received/accepted78 | received/accepted78 |
| Johnston / Holmes appointments | not sent | not sent | issued and accepted79 / 92 |
| Bate / Turney orders | not issued | issued87 / 88; no receipt | issued87 / 88; accepted93 / 93 |
| Physical Bate / Turney handoffs | none | none | Fredericksburg95 / Harpers Ferry99 |
| C25 | not_observed | not_observed | mismatch |
| All33 verdicts | 5 matched;3 mismatch;3 not_observed;22 gaps | same | 5 matched;4 mismatch;2 not_observed;22 gaps |
| Final lot rows differing from S126 | 98 | 108 | 97 |
| Lifetime lots differing from S126 | 87 | 99 | 94 |
| Response rows differing from S126 | 53 | 56 | 29 |
| Liveness count/magnitude rows differing from S126 | 54 | 54 | 43 |

Final hashes:
- Original: `46575420f5abaab7ae05c0246ad47c75b72743e8da57083fb254b26c28972a28`.
- First corrected: `8a0138ae3c21f8448aad005408f42743c1b6b15682bb045e47842d3176b5462f`.
- Readiness repair: `86aa271101a815d9f13151279a066889acc8e8bf020d47c004aa1b1b469b45c0`.

[Machine-readable comparison](three-way-summary.json), [all33 CSV](three-way-rows.csv),
[correspondence](three-way-correspondence.json), [all criteria](three-way-criteria.json),
[all counts and magnitudes](three-way-counts.json), [C25 paths](three-way-C25.json).
The complete per-capture evidence is retained in [original](original/comparison.json),
[first corrected](corrected/comparison.json) and [readiness repair](readiness/comparison.json).
Earlier unqualified and paired JSONs remain historical evidence; they describe
the earlier failed readiness trajectory, not the latest execution.

## The repair and its controls

`principalMenu` now distinguishes a known command address from a received held
post. `senderFor.mayEstablish` uses the same distinction, retaining declared
kind, side, parent and expected-person checks. Otherwise an offered appointment
would still be rejected as unknown_post. Actual receipt keeps its existing
post_held refusal and never displaces another holder. No truth holder is read
into readiness and no receipt is invented.

Five fictional regression cases cover unknown, vacant and absent address records,
known held-post refusal, and an unreported actual holder: the last leaves the
menu identical, accepts sending, then returns a typed post_held refusal without
displacement. [Retained-State selector controls](readiness-selector-evidence.json)
keep both appointments ready for unknown/vacant/absent records and false for
held records, and prove both commands pass the sending guard without a tick.
[Projection proof](readiness-projection-proof.json) establishes complete protected
reader identity sets unchanged before refreshing only the two closure hashes.
The older offline control remains [preserved](offline-evidence.json); the
[new offline comparison](three-way-offline-evidence.json) labels its current code.

## Restored mechanics and the seven positive breaches

| Mechanic | S126 | Original | First corrected | Readiness repair |
| --- | ---: | ---: | ---: | ---: |
| combat.withdrew | 1 | 0 | 0 | 1 |
| operations.repulsed | 1 | 0 | 0 | 1 |
| planner.term.time | 1 | 0 | 0 | 1 |
| orders.returned | 0 | 1 | 1 | 0 |

The last capture appoints Johnston and Holmes instead of suppressing their
letters on address presence. The day146 Harpers Ferry record now resolves:
Johnston has5,340 known present, including the received Turney lot, against
Patterson's1,732. Patterson withdraws to lower_valley, and his axis records the
day147 repulse. The previous two captures instead had unresolved held contact.
His day140 perceived estimate is now5,695, direct/holding scores106/11; removing
time gives-194/311 and changes the winner. Time's contributions remain+300/-300.
Combat, operation, score weights and the live-term definition are unchanged.

The seven remaining positive breaches were brought to the lead, with causes and
passing live drivers, before any hook. All receive the standing around rule;
all186 earlier cause records stay exact. No new quiet permission or threshold
exception was added.

| Mechanic | Captured limits | Fires | Recentered limits |
| --- | ---: | ---: | ---: |
| operations.ended | 1..5 | 9 | 4..18 |
| operations.stage | 9..38 | 39 | 19..78 |
| operations.works | 3..14 | 15 | 7..30 |
| planner.term.supply | 0..0 | 2 | 1..5 |
| plans.chosen | 3..12 | 14 | 7..28 |
| plans.goal_reached | 1..5 | 7 | 3..14 |
| seats.choices | 3..12 | 22 | 11..44 |

[Exact band review and drivers](readiness-band-review.json),
[offline counts, operation logs and supply counterfactuals](readiness-driver-evidence.json),
[saved-evidence gate result](readiness-regated.json). Seven operations complete
objectives and two Johnston operations are superseded; ten retained operations
contain39 stage moves. The15 ordinary fortification changes have their exact
days retained. Holmes day100 and Johnston day104 both choose supply_line, while
dropping supply makes direct win in their actual retained candidates. Fourteen
plan selections include four automatic selections; twelve local options plus
ten explicit plan-menu choices produce22 choices. No outcome was fitted.

## Onward handoffs, C25, lots and binding criteria

The source distinctions remain: SO119 addresses the Fredericksburg office
(OR I-LI.2 pp.107-108), while the attested Turney direction names Johnston
(OR I-II pp.897-898). Both actual dispatches issue87/88 and obtain addressee
receipts and compliant answers93. Troops remain Lee's until ordinary arrival:
Bate's named lot hands over95; Turney's99. These are model observations, not
claims that their historical instructions were received on those dates.

Turney later joins the declared brigade and ends at Harpers Ferry with734 men.
Bate ends with780 men, still assigned to Holmes, but physically back at
Lynchburg: Lee's later goal and Holmes's supply-line plan move it there by115.
The companion lot stays at the rendezvous. [Every command/lot path](readiness/command-paths.json),
[96 final lot deltas from the first corrected capture](readiness-lot-deltas.json),
[all lifetime changes against S126](readiness/lifetime-lot-changes.json), and
[all source correspondences](readiness/source-correspondence.json) distinguish
sending, answering, marching and actual handoff. All372 first-observed lot records
remain equal across the three S129 captures ([proof](three-way-creation-comparison.json));
no regiment, personnel return or service identity was created by this repair.
Final known totals are47,080 Confederate and126,482 Union, not historical returns.

C25's existing request issues96 and reaches Holmes99. It receives actual comply;
the existing scorer records mismatch against the named act. No new credit or
profile edit is manufactured. All other32 verdicts are unchanged. The binding
criterion problem counts are checkpoint1, pushback6, operation0, unknownStrength4.
The historical strength floor, coverage rows, unknown-force contact, inherited
sweep and budget holds are not waived or rerun. Formal whole-branch and gate
reviews/signatures/main integration remain deferred under0106/0107.

## All33 verdicts

| Row | S126 | Original | First corrected | Readiness repair |
| --- | --- | --- | --- | --- |
| U01 | representation_gap | representation_gap | representation_gap | representation_gap |
| U02 | representation_gap | representation_gap | representation_gap | representation_gap |
| U03a | representation_gap | representation_gap | representation_gap | representation_gap |
| U03b | representation_gap | representation_gap | representation_gap | representation_gap |
| U03c | representation_gap | representation_gap | representation_gap | representation_gap |
| U03d | representation_gap | representation_gap | representation_gap | representation_gap |
| U03e | representation_gap | representation_gap | representation_gap | representation_gap |
| U04 | representation_gap | representation_gap | representation_gap | representation_gap |
| U05 | representation_gap | representation_gap | representation_gap | representation_gap |
| U14 | representation_gap | representation_gap | representation_gap | representation_gap |
| U25a | representation_gap | representation_gap | representation_gap | representation_gap |
| U25b | representation_gap | representation_gap | representation_gap | representation_gap |
| U32 | representation_gap | representation_gap | representation_gap | representation_gap |
| U33 | representation_gap | representation_gap | representation_gap | representation_gap |
| U34 | representation_gap | representation_gap | representation_gap | representation_gap |
| U39 | matched | matched | matched | matched |
| U40 | representation_gap | representation_gap | representation_gap | representation_gap |
| U42 | representation_gap | representation_gap | representation_gap | representation_gap |
| C01 | matched | matched | matched | matched |
| C02 | matched | matched | matched | matched |
| C03 | mismatch | mismatch | mismatch | mismatch |
| C04 | representation_gap | representation_gap | representation_gap | representation_gap |
| C05 | mismatch | mismatch | mismatch | mismatch |
| C06 | representation_gap | representation_gap | representation_gap | representation_gap |
| C07 | matched | matched | matched | matched |
| C09 | representation_gap | representation_gap | representation_gap | representation_gap |
| C10 | matched | matched | matched | matched |
| C11 | mismatch | mismatch | mismatch | mismatch |
| C12 | representation_gap | representation_gap | representation_gap | representation_gap |
| C14 | not_observed | not_observed | not_observed | not_observed |
| C15 | not_observed | not_observed | not_observed | not_observed |
| C16 | representation_gap | representation_gap | representation_gap | representation_gap |
| C25 | not_observed | not_observed | not_observed | mismatch |

## Every changed fire count

Magnitude differences, full causes and every unchanged row are in the linked
machine-readable count table. This table includes any count/magnitude difference.

| Mechanic | S126 | Original | First corrected | Readiness repair |
| --- | ---: | ---: | ---: | ---: |
| combat.battle_closed | 6 | 5 | 5 | 6 |
| combat.battle_day | 8 | 10 | 10 | 8 |
| combat.captured | 6 | 5 | 5 | 6 |
| combat.killed_wounded | 12 | 10 | 10 | 12 |
| combat.missing | 12 | 10 | 10 | 12 |
| combat.occupation | 338 | 309 | 317 | 408 |
| combat.pursuit_chosen | 1 | 0 | 0 | 1 |
| combat.withdrew | 1 | 0 | 0 | 1 |
| combat.works_stormed | 1 | 0 | 0 | 1 |
| command.temporary_post_opened | 14 | 12 | 12 | 12 |
| control.changed | 345 | 315 | 323 | 414 |
| control.threshold_crossed | 48 | 44 | 43 | 49 |
| forces.stores_fell | 2638 | 2610 | 2603 | 2627 |
| forces.stores_low | 102 | 95 | 100 | 100 |
| forces.stores_refilled | 2943 | 2950 | 2953 | 2974 |
| forces.stragglers_returned | 178 | 180 | 172 | 172 |
| knowledge.pruned_age | 106 | 106 | 106 | 107 |
| knowledge.pruned_superseded | 146 | 146 | 146 | 146 |
| map.pocket_closed | 6 | 4 | 4 | 6 |
| map.pocket_relieved | 1 | 1 | 1 | 3 |
| map.recomputed | 52 | 48 | 47 | 55 |
| messages.courier_delay | 96 | 104 | 152 | 158 |
| messages.delivered | 14436 | 14452 | 14610 | 14842 |
| messages.mail_delay | 2858 | 2862 | 2867 | 2869 |
| messages.sent | 15207 | 15232 | 15396 | 15620 |
| movement.arrived | 701 | 707 | 696 | 704 |
| movement.joined | 65 | 66 | 64 | 65 |
| movement.leg_started | 385 | 373 | 362 | 387 |
| operations.ended | 5 | 5 | 5 | 9 |
| operations.opened | 7 | 6 | 6 | 10 |
| operations.repulsed | 1 | 0 | 0 | 1 |
| operations.stage | 25 | 24 | 24 | 39 |
| operations.works | 14 | 9 | 9 | 15 |
| orders.obeyed | 6 | 4 | 4 | 10 |
| orders.relayed | 18 | 15 | 15 | 20 |
| orders.responses_pruned | 27 | 28 | 28 | 28 |
| orders.returned | 0 | 1 | 1 | 0 |
| planner.candidates | 6 | 4 | 4 | 10 |
| planner.searches | 6 | 4 | 4 | 10 |
| planner.term.goal_fit | 1 | 0 | 0 | 1 |
| planner.term.supply | 0 | 0 | 0 | 2 |
| planner.term.time | 1 | 0 | 0 | 1 |
| plans.approved | 2 | 3 | 3 | 5 |
| plans.chosen | 8 | 7 | 8 | 14 |
| plans.drafted | 6 | 4 | 4 | 10 |
| plans.goal_reached | 4 | 5 | 5 | 7 |
| plans.goal_set | 6 | 4 | 4 | 10 |
| plans.submitted | 2 | 3 | 4 | 7 |
| plans.went_ahead | 6 | 4 | 4 | 7 |
| politics.support | 103 | 85 | 85 | 103 |
| regions.self_emancipation | 3081 | 3077 | 3077 | 3081 |
| reports.battle_dispatch | 50 | 48 | 48 | 50 |
| reports.casualty_return | 24 | 28 | 28 | 24 |
| reports.pocket | 3 | 3 | 3 | 4 |
| seats.attention_spent | 176 | 163 | 163 | 178 |
| seats.battle_orders | 11 | 15 | 15 | 11 |
| seats.choices | 8 | 8 | 11 | 22 |
| verbs.answered | 145 | 128 | 128 | 152 |
| verbs.declined | 32 | 22 | 24 | 34 |

## Preservation and validation

[Earlier two captures:44 raw files](earlier-two-captures-preservation.json) and
[earlier complete per-capture packets:43 files](earlier-packets-preservation.json)
are byte-preserved. [Measured source preservation](three-way-input-preservation.json)
locates all525 original,842 first-corrected and842 readiness inputs in current
files or immutable archives. After the last capture, seven band records, matching gate explanations, reviewed
projection metadata and the historical-ledger test change validation metadata.
The first ordinary hook then exposes a neutral-office transport path (below).
Pack inputs stay unchanged; both measured transport sources remain archived. The S124 test keeps its exact historical zero fingerprints and
mutation controls, then validates later positive changes through the ledger.

Typecheck, boundary and rules pass. The73 focused appointment/received-view/
people tests and five live-driver tests pass, reusing unaffected passing files;
56 focused rules tests and36 additional liveness/purity checks pass; earlier
unaffected ownership evidence is reused. Cheap preflights caught
test report-location/type assumptions, named band prose and stale projection
closures before the ordinary hook; all diagnostics remain in `runs/s129/`.
The first ordinary hook exits1 after247.898s:269 files and2,387 tests pass,
three skip, and the scheduled-call console test reaches a neutral governor's new
command assignment and throws. Its first hop omitted the recipient needed by
existing neutral-sender fallback; the refusal return also assumed a faction for
its neutral addressee. Two minimal fixes pass the recipient and skip a nonexistent
faction filter. Both new fictional regressions, the own-side hop control and the
previously failing console case pass (15 tests). [Exact branch-domain proof and
failure evidence](neutral-transport-review.json) establish that every previously
successful captured dispatch/report is unchanged; only formerly throwing neutral
branches differ. No further capture ran. A fixture-side intelligence-chief
mismatch was corrected before its proper red witnesses; all logs are retained.
The commit gate is the unchanged ordinary staged-tree hook, logged separately.
No hook bypass or push. No second dedicated measurement or broader campaign.

[Read sources and representation limits](../../research/S129/assignments.md);
[handover](../../../notes/sprint-S129-onward.md). Separate Turney instruction/
receipt and President-to-Walker paper remain unread. No S128 merge or S130 build.

Findings outside my scope
