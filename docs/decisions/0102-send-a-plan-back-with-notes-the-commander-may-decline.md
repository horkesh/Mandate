# 0102: Send a plan back with notes the commander may decline

Status: accepted (2026-11-19). Built by Codex (R56, R67, under 0096) on `plan-sendback-notes` at `9f933f5`, closing the send-back gap from R18 (OPEN_QUESTIONS, Phase 2), and reviewed by Claude's standing reviewer. Codex drafted this record (R71). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

The desk's blue-pencil marks previously stayed on the desk when it queued a bare send-back. R56 adds a typed payload delivered to the commander; R67 verifies the conditions and the guards. Sources are `plan-sendback-notes` at `9f933f5ca05c28b23b5a45903582e4b7e9c94615`, `notes/lane-sendback-notes.md` and the implementation/tests it names. Section references below name that hand-over.

The lead's “R56 approved; R67, its follow-ups” message in `CODEX.md` records the reviewer's agreement with all five R56 proposed rulings and rules that every alternative recomputes the commander's conditions. R71 records R67's approval and resolves the earlier disagreement: recomputation already existed, and the regression is genuine. Decisions 0016, 0026, 0030, 0052, 0062 and 0098 remain the authority for principal, grammar and delivery.

## Decision

1. **Start with four soft marks.** `focus` suggests an objective on a submitted axis, `via` an ordered route, `wait` a number of concentrating days and `avoid` a place on that axis. A strike recommends avoiding the struck axis's reported objective; it does not remove the axis. These are requests to a commander, not direct orders to forces. Named-force waiting and strength requests need separate semantics and are not implemented by this vocabulary. Sources: “R56 rulings,” item 1; “What changed”; the lead's R56 brief and R67 approval of all five rulings.

2. **Read each note on arrival, then request another draft even if all are declined.** `ReviewCommand.notes` is optional for old logs and legal only on `send_back`. The notes travel as `OrderBody.orderNotes` with the existing order's route, latency, relays and bounce rules. A known vacancy is refused at issue; absence or holder change on arrival returns the dispatch without a response or redraft. `answerOrder` reads each note separately using the commander's values, regard, grievances and oversight. Nothing takes effect at issue. Notes add no attention charge; the existing special-messenger charge still applies. Sources: “R56 rulings,” item 2; “What changed”; R67's N5 guard test; 0052 and 0098.

3. **The pack owns the compliance weights and bounds [I].** Initial rung weights are exceed/comply 1000, reservations 500, slow walk 250, reinterpret/object/refuse 0. A fully weighted matching note adds 600 score units. Limits are eight notes, eight waypoints per note and sixty waiting days. All four directive rows initially use boldness 500, honour `duty` and offend no value. Both packs explicitly provide `rules.plans.notes`; validation requires the complete table, bounds and valid value vocabulary. These are uncalibrated design parameters, not historical judgments or a guarantee of compliance. Sources: “R56 rulings,” item 3 and “Ownership and format”; the lead's R67 approval.

4. **Keep the commander's alternatives and explain his selected plan.** Within the existing search cap, generate a successive alternative for each positively weighted mark while retaining the original candidates. Successive accepted marks may combine, and a suggested objective is scored against opposition believed at that objective. An avoidance penalty leaves the place legal. A note can lose to other scoring terms, an impossible route or another note. Each candidate has a typed note term and an account of followed, declined, preferred own judgement or unavailable. The goal, committed force, permissions, binding edits and approval rules stay separate. A later send-back replaces the previous note bundle; a new goal has none. Sources: “R56 rulings,” item 4 and “What changed”; `packages/kernel/src/planner/notes.ts` at the pinned commit; the lead's R67 approval.

5. **Deliver his stated account through knowledge.** Proxy stores actual responses; plans stores the marks and response references. His submitted report carries `reportNotes`, with stated account and reasons. The principal's review reads that received report, never the response table. Private note amounts, generation tags and willingness stay hidden. The submitted plan's visible score excludes its private note term, as does the received `plan-submitted` claim. Sources: “R56 rulings,” item 5; “What changed”; R67's N3 regression, which requires a positive private term before checking its exclusion; the lead's R67 approval.

6. **Every note alternative recomputes the commander's conditions.** A wait, route, avoidance or objective suggestion may not drop his reinforcement requests or `move_when_reinforced` gates. Nor may it copy stale conditions that no longer fit. Use the same candidate constructor as his ordinary drafts, evaluating the alternative's axes, objective and beliefs. Sources: the lead's R67 ruling in `CODEX.md`; “R67 / Recomputation was already present”; `planner/notes.ts` calling `score.ts`'s `makeCandidate` after filtering the old reinforcement-specific requests/gates. The source base already did this; R67 adds proof rather than a second calculation. R71 expressly confirms that finding.

7. **A note cannot narrow his menu or turn a stationary plan into a march.** Retain the original legal candidates; a requested route is a preference rather than an exclusion or compulsory replacement. The `holding` and `bombard` methods return no note-generated marching alternative. R67 checks both stationary methods with a moving-plan positive control, so a wait note remains effective where appropriate. A binding arrow edit continues through its existing compliance path; sending a note is not that edit. Sources: hard rule 1; R56 ruling 4; `planner/notes.ts / alternativeOn` and `noteCandidates`; “R67 / N9”; the lead's R71 item 3.

8. **Marks cross the existing boundaries as typed records.** The kernel checks a submitted axis, known regions and pack bounds; malformed fields, numbers, unknown tokens and approval notes are refused. Log validation checks shape and copies route arrays for replay. `plans` owns `PlanRecord.planNotes` and saved `candNotes`; `proxy` owns `OrderResponse.respNote`; `messages` carries `orderNotes` and reports in transit; `knowledge` owns received `ReportBody.reportNotes`. The immutable note/reading/disposition/account records are registered, and there is no new root State field or mutable preference table. Pruning retains a response while its plan names it. Sources: “Ownership and format,” “What changed,” and R67's independent N5/N6 issue-time guards.

9. **The desk sends the marks it holds as one send-back.** Objective and waypoint marks become `focus` and `via`; a strike becomes `avoid`. The marks clear only after queue acceptance and remain after rejection. The out-tray retains the actual tokens and text. The console uses the same typed vocabulary, with route and bypass syntax preserved. Player text comes from the added pack strings. Sources: “What changed”; the R56 browser/grammar verification and the lead's R56 item 4. This records the existing controls without claiming a free-prose or named-force note feature.

Rejected:

- Free prose interpreted by the kernel, notes converted into binding edits, or direct force movement. Source: R56 ruling 1.
- One response for a mixed bundle, effects before delivery, or refusing the redraft because one preference was refused. Source: R56 ruling 2.
- Guaranteed compliance, mandatory regional exclusion, or a coefficient hidden in the kernel. Source: R56 ruling 3.
- Replacing the goal, removing original candidates, or accumulating old note influence across reviews. Source: R56 ruling 4.
- Reading private willingness for a preview, exposing the actual rung through metadata, or displaying the private note weight in the submitted score. Sources: R56 ruling 5 and R67 N3.
- Dropping the commander's conditions, copying stale ones, or adding a second recomputation when the shared constructor already does it. Sources: the lead's R67 ruling, its conditions regression and R71's resolution.
- A wait note changing a holding or bombardment plan into a marching order. Sources: `alternativeOn`, R67 N9 and R71.

## Consequences

The player can ask for a different plan while the commander retains judgment and his legal menu. His received account explains what he says he followed; it does not certify his hidden response. Optional nested fields preserve old-log compatibility under the unreleased schema, with their owners documented in FOUNDATION section 10.

R67's conditions test follows seven alternatives: an 8,000-man force facing a believed 20,000 still requests 12,000 after a wait; a lightly held objective removes the need, and returning restores it without duplicates. Six deliberate re-breaks catch dropping, stale copying and N9/N3/N5/N6 failures. The retained root check passes 1,288 tests with three existing optional skips, and the done check passes 6/6, Union median/p95 32.17/63.67 ms against unchanged 40/160 ms limits. The lead's R67 receipt supersedes R56's earlier local timing hold. The UI evidence is R56's delivery.

Merge ordering still waits for Part B and the lead's integration. No new calibration, hosted CI result, optional map-data pass or gate sign-off is implied.

Ruling source gaps: none. All five original choices, the recomputation rule and both principal guards have identified sources.
