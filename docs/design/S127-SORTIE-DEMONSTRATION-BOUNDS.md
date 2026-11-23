# S127: Bounds for limited sorties and demonstrations

23 November 2026. **Proposal for the lead under 0121 item 5, 0123 item 2 and
0124 item 8. No implementation or accepted rule.** S127 only, `sprint/pushback`,
base `6e68cdedddaa4877efa9d7d62da59a25d486ff66`.

Recommend the bounds below before either build. **Every proposed value is
[I: design]**, including the safety inequalities. None is a historical troop
number, march rate or duration. Historical evidence is marked **[source]** and
cited by printed page. The evidence does not fix these numbers.

## 1. Read basis and current boundary

Read [S110](../../../sprint-design/docs/design/S110-RECEIPTS-LETTERS-AUTHORITY.md)
in the sibling worktree and [S115](S115-ATTACK-OR-DEMONSTRATE.md) here. The
kernel reference is **committed `499607bbdf45df47b18538977cac5f0282779f09`**
in read-only `C:/Pyrrhic/sprint-mandates`, not that worktree's mutable files.
[Input receipts](S127/inputs.json) distinguish raw file hashes from git blobs.
The accepted decisions were read in the main checkout; no decision is copied,
amended or accepted by this delivery.

**[source]** Patterson's direction of 6 June, signed for him by Porter, tells
Wallace to keep his force at Cumberland and secure the named bridges. It allows
action against a reported armed gathering that a safely detached force can
overcome and requires reports of operations. It gives no numerical detachment
ceiling, guard share or sortie duration (OR I-II **p.668**;
[retained reading](S127/OR-I-II-p668.txt)). Its civilian/search/arrest terms
are outside this proposal and remain with the sensitive-history gate.

**[source]** Scott's direction of 13 July permits demonstration to detain the
enemy when Patterson cannot beat him (OR I-II **p.166**;
[retained reading](S115/readings/OR-I-II-p166.txt)). His later expectation of
threats/demonstrations and Patterson's claimed reconnaissance performance
(**p.168**, [reading](S115/readings/OR-I-II-p168.txt)) do not specify a regional
activity duration or prove detention. No value below comes from those claims,
Wallace's actual raid, July's outcome, or a replay of either campaign. No new
Regulations or tactics reading is claimed. These are retained primary OCR
readings, not fresh scans or verification of dispatch/receipt clocks.

At the committed kernel reference, read entry points establish these constraints:

| Code read at `499607bb` | Consequence for this proposal [I] |
|---|---|
| `tick/tick.ts::tick` | One tick advances one day. Morning menus precede deliveries; operations precede combat and later stores settlement. A zero-length label change cannot stand for a day of activity. |
| `world/mandates.ts`, `command/authority.ts`, `tick/mandates.ts`, `seats/local-actions.ts` | Receipt, holder, parent intersection, shared commitments and execution revalidation exist. Actions currently enumerate `hold`, `relieve`, `take`, `approve`; neither proposed operation is already authorized or implemented. |
| `planner/route.ts`, `supply/supply.ts::edgeLeg` | Routes use typed graph edges and integer permille days, with direction, season, passage and known obstacles. One region or edge is not one day's march. Search already has a pack budget. |
| `planner/context.ts`, `planner/input.ts`, `planner/score.ts` | Threat comes from received beliefs and neighboring influence. Scoring is not a hard safety certificate: absent beliefs can become zero; unknown own strength is projected as zero. New safety gates must preserve unknowns before these projections. |
| `forces/stores.ts`, `forces/detachments.ts`, `planner/axes.ts` | Stores are milli-days and consumption is daily. Splitting changes stores; a candidate must preview the actual resulting detachment, not borrow the parent's original endurance. The existing axis checks outward supply stretches, not a certified round trip. |
| `packs/union-1861/source/world/regions.csv` | `western_maryland` combines Hagerstown/Cumberland/Williamsport, `lower_valley` Winchester/Martinsburg, and `potomac_highlands` Romney/Moorefield. Counts below bound graph regions, not towns, miles, banks or tactical separation. |

## 2. Proposed values and their basis

The names are documentary labels for future pack fields, not a new schema.
Require explicit validated pack values; do not install kernel defaults. Missing
policy means the new action is unavailable. These limits restrict an otherwise
received grant; they never supply authority omitted from it. In particular,
0124's standing `guard: none` remains none: the sortie's prudential guard is
not a forged historical guard term in every standing mandate.

| Bound | Proposed value [I: design] | Basis tied to tick/regions; rejected alternative |
|---|---|---|
| S1: sortie size alternatives | At most **3**: `floor(A/3)`, `floor(2*A/3)`, `A`, omitting zero and duplicates. | Small, middle and full use of the safe allowance `A`; a constant grid avoids enumerating every man or fitting a fixed company count. Reject a preferred absolute number. |
| S2: sortie route pairs / candidates | At most **2** complete outward/recovery route pairs to one reported target region; at most **6** candidates (`3*2`) per selected report/grant morning. | One ordinary least-cost graph route pair and one alternative, using the existing route-alternative method/penalties and search budget. This permits one blocked-corridor alternative without an exhaustive path/force cross-product. Reject six separately tuned sizes or unlimited searches. |
| S3: sortie guard | Retain at least **500 permille**, rounded up, of the local parent strength, and any stronger enacted numeric guard or ordinary defensive need. | A detachment may not take the majority of the home force away across coarse regions. Half is a conservative design convention, not a period regulation. Reject no guard, an absolute garrison, or changing Scott/Patterson's standing instruments. |
| S4: sortie action interval | At most **1 full daily action interval** before returning; abort may be earlier. | The smallest nonzero interval the daily kernel can expose to ordinary operations/contact. Travel and preparation are additional. Reject a historical return date or counting outbound travel as action. |
| S5: recovery stores reserve | **1 additional day**, `1000` milli-days, after the complete estimated round trip and action. | One daily decision/phase boundary of slack, not a promise against combat or prolonged blockage. Reject zero slack or a raid-derived endurance. |
| D1: detention area | **1..2 distinct connected regions**. | The smallest area that can express an enemy command spread across a regional boundary without making the duty theater-wide. Reject an entire department or tactical subdivision inside one region. |
| D2: action area | **1..4 distinct connected regions**, including staging, activity and recovery endpoints and every transit region. | A bounded local corridor with room for staging, an activity region, recovery and one alternative region. This is a representation/branching limit, not a four-day radius or proof that every route fits. Reject an implicit expanding pursuit area. |
| D3: demonstration tasks | `deployment`: **1..2 full daily action intervals**; `reconnaissance_in_force`: **1 full daily action interval**. | A deployment can expose presence for one day or carry it through one further morning reassessment; a probe is one sampled action before recovery. Two days is the smallest distinct sustained alternative. Reject a week-long task, a zero-duration action, or a July deadline as expiry. |
| D4: demonstration candidates | At most **12**: at most **4** activity endpoints, each with one-day deployment, two-day deployment and one-day reconnaissance. | `4*(2+1)` exhausts this finite task/duration grid. Each endpoint has one selected feasible outward/recovery pair and the same explicit force allocation; route/force permutations do not multiply it. Reject a hidden candidate for every day, troop split or path. |
| D5: whole two-means menu | At most **16** operational candidates: the **12** above plus at most **4** attack candidates, one per activity endpoint. | Ensures both means have a bounded opportunity before scoring. The unchanged generic menu/search caps may reduce these maxima; no increase to existing caps, scores or terms is proposed. Reject generating demonstration only after an attack wins or fails. |
| D6: recovery reserve | The same **1 day** as S5, in addition to preparation, outward travel, selected task and recovery. | The same daily boundary warrants the same slack, independent of the named command or historical mission. Reject a separate favorable demonstration supply rule. |

Task-duration limits bound active activity, **not the detention duty**, total
travel time, combat duration, or a forced completion date. No extra fixed
campaign horizon or maximum march distance is proposed. Actual directional edge
time, stores, permissions and received expiry decide whether a route fits.

## 3. Limited-sortie safety rule

All quantities here are integers. Let `N` be the known, physically co-located,
serviceable parent-block strength at the departure/home region before the new
split. A remote subordinate, unarrived reinforcement, embarked block, prisoner
or unknown lot contributes no certified guard. If the parent strength or needed
lot accounting is unknown, block the numeric sortie; do not merely count the
unknown component as zero.

Let `G = max(ceil(N*500/1000), enacted guard, defensive need)`; an absent
instrument guard contributes no extra number. Defensive need is
`ceil(home threat * existing open-field demand / 1000)`, with the same knowledge
qualifications as below. Let `U` be locally present men
already reserved for other live commitments. Do not count men twice if an
existing commitment is also doing the guard duty. Let `C` be the remaining
hierarchical force allowance after all live sibling/parent commitments.
`A = max(0, min(N-G-U, C))`. Guard/reservation accounting must use disjoint
actual allocations: a man cannot guard home while marching elsewhere. If
`G+U>N`, or no positive size survives, publish the blocker, not a sortie.
For a reference ceiling, `C` derives from assigned force; it is not infinity.

For each of S1's sizes and S2's route pairs, all of these gates must pass:

1. **Evidence and authority.** There is an unconsumed, qualifying, fresh received
   armed-gathering report, actual enacted holder-bound sortie authority, the
   necessary regions/modes and exclusive resources. Select one report per
   grant/morning by newest observation, then stable report ID; other eligible
   reports wait, without being marked consumed. Selecting an unsafe report
   does not fabricate a safer one. Reports of the same gathering are not a
   new raid merely because a copy/revision arrived. A closed sortie needs a
   genuinely new observation, as S110 requires.
2. **Both routes.** Search outward and back independently under the commander's
   own received ground/obstruction picture, current permitted modes and region
   scope. Do not reverse the outward edge list and assume equal duration or
   permission. Recovery names the actual parent/home rendezvous; if the parent
   moves, require a newly feasible, authorized rendezvous and physical rejoin.
   No route, forbidden crossing, insufficient capacity or exhausted search
   budget yields an explained failure, never permission. The second pair may
   reuse legs; two independent disjoint corridors are not required.
3. **Round-trip stores.** Preview the actual split with the forces owner's
   accounting. For every participating block let `B` be its resulting known
   `fbStoresMilli`. Require `B >= 1000*(P+O+X+R+1)`, where `P` is remaining
   preparation/assembly ticks, `O` and `R` are outward and return execution
   ticks, and `X=1` is the planned action interval. Round **each** movement leg
   and required pause up to daily execution ticks; include any additional
   executor-imposed boundary wait. Never round the sum of fractional legs
   down. If an executor schedule cannot yet be represented, reject that
   candidate as unrepresented. No credit for hoped-for resupply, captured
   stores, local forage or unarrived support. Existing actual supply continues
   normally. Check the retained guard's own ordinary resources separately.
4. **Enemy estimate.** Require fresh received numeric estimates, or explicit
   received clearance, for the target, home and traversed regions and the
   neighbors that contribute to their existing threat field. An absent, stale
   or unknown estimate is not zero. Use the normal perceived estimate after
   filtering/perception and the existing neighboring influence; do not read
   hidden enemy strength, location or orders. No new report-age constant is
   proposed: use the report template's current validity. For route/home tests,
   require `allocated men*1000 >= perceived threat*existing open-field demand`;
   at the hostile action endpoint use the existing `demandFor` assault margin
   when applicable. For home use actual retained guard men. This hard
   inequality is a **new conservative sortie feasibility rule**, not a claim
   that the existing score already vetoes unsafe routes. Existing risk terms
   still rank survivors; they cannot override a failed gate. No extra casualty,
   success-probability or historical enemy ratio is introduced.

Keep every failed gate and its input/receipt basis, not only the first reason.
Missing enemy quantification can therefore keep an otherwise authorized sortie
unavailable; that is an evidence/producer gap, not grounds to weaken the rule.

Revalidate actual allocations/holder/scope at execution. Reassess remaining
return feasibility and stores at each operation boundary and with newly received
evidence. Failure prevents starting/continuing discretionary action and produces
the sortie-specific `return_line_unsafe` explanation; completion also starts
return. A newly blocked return remains a live recovery problem with ordinary
combat, stores and reporting. Expiry/revocation stops new offensive action, not
physical recovery. No teleport, garrison, remote rejoin, forced safe return or
third general discretion condition is created.

## 4. Demonstration areas, enumeration and time

Both area lists are explicit, nonempty, duplicate-free and inside the effective
received mission/mandate bounds. Connectivity means adjacency in the existing
typed region graph; actual routes still need lawful edges/modes. Every activity
endpoint must lie in, or be adjacent to, the detention area. Mere adjacency
proves neither tactical proximity nor that the target can observe a threat.
The action area need not contain the entire detention area. It does contain
every staging/transit/activity/recovery region used by that candidate. Invalid
or over-limit lists fail validation; never truncate them to make an order legal.

The actor needs the S115 received attribution of an opposing command to force
in the detention area. Anonymous strength, a screen or hidden membership is not
that attribution. One explicit, authorized, known force allocation is shared
as an alternative across that morning's candidate set, not committed to every
candidate at once. No automatic numeric subdivision of an unknown force and no
peer's resources appear. Applying the sortie's half-force guard to the entire
demonstration command would be a new restriction without the same rationale;
**do not do so**. Demonstrations retain any actual mandate guard/ceiling and
ordinary defensive obligations.

For each eligible action region in stable ID order, find one feasible pair
using the existing bounded route search; independently validate recovery. Draft
the three demonstration task/duration variants and one ordinary attack
candidate, deduplicate by content, retain all blocker reasons, and rank feasible
candidates using unchanged planner terms. If the existing search budget or
generic `topN` leaves fewer choices, disclose generated/feasible/truncated
counts. Exhaustion is not proof no possible course exists. It never grants an
extra search or fills a slot with an unsafe candidate. Unrelated report/order
insertion must not renumber IDs or change the sampled route pairs. One live
episode per purpose uses those resources; serial episodes need new logged
choices and actual recovery/resource availability, never an automatic repeat.

A deployment must include an actual movement leg to its authorized endpoint;
a same-region no-move deployment is invalid. Reconnaissance can be a regional
action in the current region only if ordinary operations can execute and expose
it. It cannot imply a tactical separation inside the region. Contact that becomes
battle is recorded as battle, without immunity or a new demonstration label.

Count D3's intervals only after actual availability/arrival. Define an interval
as one full daily operations opportunity followed by normal contact/combat,
observation and stores processing. Arrival that permits only a stage change
does not count; recovery cannot erase the same day's exposure. At the next
morning reassess a two-day deployment before its second interval. Finish or
abort into recovery after the selected finite interval count. An interruption
records the actual shorter/zero activity and reason; it does not earn the
planned duration. Recovery can last longer than the task bound if blocked.

Use the same conservative carried-stores schedule as section 3 with `X=1` or
`2` for the selected task. Attack candidates retain normal attack feasibility.
Do **not** demand that a demonstration can defeat the opposing main command:
that would erase the form's alternative when attack is infeasible. A credible
observable task, valid actual resources and feasible recovery are required;
ordinary contact/combat can still make it fail. Reuse ordinary threat/risk
judgment for its approach/recovery, recording unknowns as blockers to certified
recovery rather than treating silence as safety. No new demonstration force
ratio, pin effect, enemy compliance term or detention bonus is proposed.

The continuing duty survives episode closure. Reports travel normally; the
enemy can ignore the activity or leave. Deadline, elapsed duration and task
selection prove no detention or pushback. Preserve S115's four separate evidence
stages and independent U33/U34 obligations. No reference result or 1A credit is
claimed here.

## 5. Paired acceptance tests for the later builds

**These 22 pairs are proposed requirements, not executed tests.** Use fictional
actors and graphs first; all quantities below are artificial. Freeze the policy
before any historical exposure. These extend S110 C4-C8 and S115 T01/T06-T10,
T12-T18/T23; their other requirements remain binding.

| ID | Pair / pass criterion |
|---|---|
| P01 | Identical fictional state under different names and calendar dates (same season/effective permissions): identical normalized candidates, gates and durations. Changing only a historical raid date cannot open a choice. |
| P02 | Multiply all known own/enemy quantities and numeric ceilings by the same integer with stores-days fixed: normalized size shares and safety decisions agree, except published integer rounding. Detects an absolute raid-sized preferred force. |
| P03 | `N=101`, no stronger guard/reservation: `G=51`, `A=50`, sizes `16,33,50`; pair with `N=102`: `G=51`, `A=51`, sizes `17,34,51`. No fixed company quantity; exact conservation. |
| P04 | Same force with explicit guard above the half-share versus no instrument guard; then an added sibling reservation. Stronger guard/reservation reduces `A` once; no sibling double-spending, remote guard or reduction of a standing guard. |
| P05 | Same known force versus a parent lot made unknown; same report with known number versus unknown/stale/missing estimate. Numeric sortie closes with typed blockers; unknown never becomes zero. |
| P06 | Two feasible route pairs versus one return cut/permission denied while outward stays open. Only the complete feasible pair survives. Reverse edge time changed alone alters return stores, not outward cost. |
| P07 | Two fractional legs that each require a tick versus their unrounded sum. Required stores use per-leg/phase execution, not optimistic sum rounding. Include a known executor pause. |
| P08 | Fictional `P=0,O=1,X=1,R=2`: post-split stores `5000` passes the reserve test; `4999` fails. A well-stocked parent with an understocked projected detachment fails too; no assumed refill. |
| P09 | Same received threat with force exactly at its existing demand inequality versus one man short, separately at target, route and home. Strengthen only a received return-line report and get `return_line_unsafe`; change hidden truth alone and menus stay unchanged. |
| P10 | Safe candidate beside unsafe candidate in reversed input order: same content IDs, all failed gates retained, at most six candidates and the same existing search budget. No padding or search after exhaustion. |
| P11 | Actual return/co-location/rejoin versus parent moved, blockage, losses or capture. No calendar close, permanent garrison, duplicate rejoin or remote transfer; actual terminal loss is separately recorded. |
| P12 | Closed sortie with same/copy/revised receipt versus genuinely new qualifying observation: only new observation permits a new episode. Grant revision cannot reset report consumption. |
| P13 | Detention lists of two adjacent regions versus three, disconnected, empty or duplicate lists; action lists of four connected regions versus five/disconnected lists. Validate whole order; no truncation. |
| P14 | Same region count with short versus long/asymmetric edge times. Area validation stays the same; stores/recovery changes. Detects a hidden one-region-equals-one-day or July march timer. |
| P15 | Same route with a transit/recovery region outside the action area or intersected mandate versus fully inside. Only the latter is authorized. Target attribution received versus anonymous/withheld closes the named-command choice. |
| P16 | Four eligible endpoints with all three task variants and attack feasible versus one endpoint/task blocked: at most twelve demonstration/four attack candidates, stable IDs, no replacement search explosion or safety exception. Unknown force never supplies a candidate. |
| P17 | Deployment durations one/two versus zero/three intervals; reconnaissance one versus zero/two. Legal durations remain identical under date/name changes; illegal ones fail validation. |
| P18 | Selected/ordered task or arrival-stage change alone versus actual force executing a full interval. Only actual executed activity earns an interval; a two-day deployment interrupted after one records one, not two. Recovery does not count toward duration. |
| P19 | Real regional reconnaissance versus no-move deployment; then ordinary enemy contact. No invented intra-region position, immunity or label-only activity; battle remains battle. If neither task can execute, retain the execution gap before any campaign. |
| P20 | Same demonstration with attack infeasible versus attack feasible; same delivered activity with opponent choosing stay versus depart/leave screen. Both means get their lawful opportunities; no required battle victory or compelled retention. |
| P21 | Same real activity with report delivered versus unwatched/filtered/lost/delayed; same truth with different received return report. Only own delivered picture drives decisions. Claimed success, true retention and causal reaction remain distinct. |
| P22 | Replay/save-resume, authority lost/refused/revoked/expired, old revision and unrelated message insertion. Exact choices/reasons/hashes and ordinary receipt timing; no new authority from policy, self-courier, automatic repeat or state migration fabrication. |

Boundary pairs reveal exact fitted cutoffs; renaming/date/scale/edge-time pairs
reveal historical exceptions even when boundary tests pass. If a historical
run later fails, retain that failure and its evidence. Passing other tests is
not permission to adjust a value until Wallace or Patterson reproduces the
record. A policy change returns to the lead with a design/source basis and
new paired tests before another expensive capture.

## 6. Rulings requested and delivery checks

For the lead:

1. Accept **S1-S5** with section 3's full safety rule, including the half-force
   prudential guard and fail-closed enemy/store inputs. Reject guessed numeric
   strength, outward-only supply and a historic return timer.
2. Accept **D1-D6** with section 4's area and interval semantics. Reject
   duration as detention success, attack superiority as a demonstration gate,
   and a universal guard inserted into standing mandates.
3. Route the authorized implementation only after that ruling. It must cheaply
   demonstrate viable fictional sortie and activity execution, report/authority
   negative controls and an enemy free to depart before a historical campaign.
   A missing clearance producer, split-store semantics or collapsed regional
   contact remains a named prerequisite/gap, not an excuse to fit the bounds.

For this delivery, validate UTF-8, input/page hashes, local links, proposal
completeness, all 22 proposed pairs, allowed paths and all pre-existing tracked
bytes. Check workspace aliases/startup before the ordinary unchanged commit
hook (`npm run check`: typecheck, rules, tests, boundary, licences, decisions).
Expected hook cost: a few minutes; stop on failure, inspect all reported
categories, correct and verify cheaply before repeating. Logs and actual exit
codes belong to ignored `runs/s127/`. No new campaign/package/timing/coverage
measurement is authorized. Existing S115 evidence is left intact; its 24 tests
remain proposed, not a simulation result. Formal branch/gate review remains
deferred under 0106/0107. Git history is the ledger; nothing is signed.

## Findings outside my scope

Implementations, pack application, new reconnaissance/clearance/attribution
producers, finer map/contact behavior, protected civilian treatment, source
recovery and historical strength/receipt-clock reconciliation; accepted
decisions, new campaign/coverage/1A results, formal review/signatures,
integration, release and pushing. The committed detachment writer partitions
`fbStoresMilli` in proportion to men while the stores consumer treats it as
days of endurance. The build must resolve or explicitly preserve/test that
unit question; S127 changes neither writer and certifies no actual sortie.
