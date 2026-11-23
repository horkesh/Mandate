# S91: named pushback coverage

2026-11-23. For the lead: 3 items. S91 only on `sprint/coverage`, from
`117b8ac8b9c8644b83091149a7fdd3bda34b6277`. The settled run evidence is
recorded here before the commit hook; the sole main-CODEX status records
the actual commit and full-suite result after the hook returns.

## Scorer and accepted registers

Decisions 0111 and 0112 are copied byte-for-byte into this decision chain;
0099 and the decision index name their amendments. Both pack registers retain
all 74 original S88 source rows and page citations: 33 eligible, 38 excluded,
three source-qualified. Only eligible rows enter coverage. The ordinary
checkpoint and victory data are unchanged; only pushback count bands retire.

The loader requires cited registers, unique acts and a bounded typed matcher
or a documented representation gap. Missing/malformed registers fail loading.
The scorer reads observations: the same issuing side, actor, role and matter,
with single-use credit across rows. Contrary actual rungs remain mismatches
even when declared compliance conceals them. Neither dates, message spelling
nor battle outcomes determine matching. No raw count is compared to the
register or to an excess ceiling.

Morgan is the one accepted nearest-type match: an untagged 90-day militia
requisition at his receiving post. The service term and issuer are read from
its levy, never reconstructed from men actually raised. Named later calls
remain distinct by their typed call IDs. A same-day policy response gets its
issuing side from its typed policy event, never from the actor’s allegiance
or by parsing a message ID.

## Binding result, row by row

**1 matched; 8 mismatches; 2 exposure mismatches; 2 not observed; 20 gaps.**
There are 13 represented obligations, of which 12 remain unmet. No eligible
row is discarded or counted as a pass because it is a gap. The complete
[coverage packet](../docs/audit/s91-evidence/coverage.json) retains candidate
IDs, reasons, citations, raw diagnostics and grouped counts.

| Side | Row | Actor | Matter | Verdict |
| --- | --- | --- | --- | --- |
| union | U01 | scott_winfield | Sumter relief feasibility, March 12 inquiry | representation_gap |
| union | U02 | scott_winfield | Evacuating both Sumter and Pickens | representation_gap |
| union | U03a | seward_william_h | March 15 written Sumter provisioning consultation | representation_gap |
| union | U03b | cameron_simon | March 15 written Sumter provisioning consultation | representation_gap |
| union | U03c | welles_gideon | March 15 written Sumter provisioning consultation | representation_gap |
| union | U03d | smith_caleb_b | March 15 written Sumter provisioning consultation | representation_gap |
| union | U03e | bates_edward | March 15 written Sumter provisioning consultation | representation_gap |
| union | U04 | seward_william_h | March 29 renewed relief consultation | representation_gap |
| union | U05 | blair_montgomery | March 29 proposed Sumter abandonment | representation_gap |
| union | U14 | seward_william_h | Some Thoughts administration policy and direction | representation_gap |
| union | U25a | hicks_thomas_h | Troop transit through Maryland after Baltimore alternative | representation_gap |
| union | U25b | brown_george_w | Protecting troops marching around Baltimore | representation_gap |
| union | U32 | patterson_robert | Changing Valley depot and line before active operations | representation_gap |
| union | U33 | patterson_robert | Fresh attack or demonstration direction in Valley | representation_gap |
| union | U34 | patterson_robert | Fresh July 17-18 attack/demonstration direction | representation_gap |
| union | U39 | morgan_edwin_d | April Union militia requisition | matched |
| union | U40 | mccauley_charles_s | Peremptory Merrimack removal to Philadelphia | representation_gap |
| union | U42 | scott_winfield | March 5 first Sumter relief assessment | representation_gap |
| confederate | C01 | brown_joseph_e | First Pensacola contingent mustering | mismatch |
| confederate | C02 | brown_joseph_e | April additional regiments for Virginia | mismatch |
| confederate | C03 | moore_thomas_o | April active Virginia regiments and earlier readiness call | mismatch |
| confederate | C04 | pickens_francis_w | Sending South Carolina volunteers to Virginia | representation_gap |
| confederate | C05 | harris_isham_g | Initial three Virginia regiments | mismatch |
| confederate | C06 | bragg_braxton | Preventing Pickens reinforcement at dock | representation_gap |
| confederate | C07 | letcher_john | Reserve corps organization and appointments | mismatch |
| confederate | C09 | pickens_francis_w | Later two armed regiments | exposure_mismatch |
| confederate | C10 | brown_joseph_e | Reserve corps and appointment authority | mismatch |
| confederate | C11 | moore_thomas_o | Reserve corps raising and support | mismatch |
| confederate | C12 | brown_joseph_e | Later two armed regiments versus State brigade | mismatch |
| confederate | C14 | holmes_theophilus_h | Supporting Commander Lewis river expedition | not_observed |
| confederate | C15 | johnston_joseph_e | Keeping force at Harpers Ferry | exposure_mismatch |
| confederate | C16 | holmes_theophilus_h | Conditional withdrawal from Mathias Point | representation_gap |
| confederate | C25 | holmes_theophilus_h | Retaining the main force at Fredericksburg | not_observed |

C01/C02/C03/C05/C07/C10/C11/C12 are the eight contrary governor answers.
C09 has other South Carolina calls, not its later armed pair. C15 has a
Manassas offensive goal, not the Harpers Ferry garrison question. No Holmes
act is observed on C14’s river expedition or C25’s retained Fredericksburg
force. These represented matters remain failures, with no trait fitting.

All **219 raw responses** are published: 208 addressee / 11 relay, all sides
resolved. Addressee reservations remain Union 11 / Confederate 5; slow walks
9 / 9, with two additional relay slow walks. Raw telemetry remains relay
objections 3, relay holds 2, filter holds 0 and trims 0. These are diagnostics.

## Representation mechanisms

Existing Consult **does** record recommended options as stances and advice
(`tick/verbs.ts`, `people/people.ts`, `knowledge/report.ts`). This is more
information than S88’s response-only packet exposed. It does not supply the
specific inquiry, addressed proposal or feasibility assessment required to
allocate the distinct historical Sumter acts. Participation or a generic
`withdraw` recommendation cannot establish which particular proposal the
adviser answered. The gaps below concern that missing scope/detail; they do
not claim all cabinet advice content is absent. These classifications are
implementation findings for the lead’s whole-branch review.

| Rows | Needed mechanism | Location | Why the current mechanism is insufficient |
| --- | --- | --- | --- |
| U01, U42 | a scoped feasibility assessment answering a particular proposed course | `packages/kernel/src/tick/verbs.ts; packages/kernel/src/knowledge/report.ts` | Consult records an option recommendation, not the force, preparation and feasibility assessment on these distinct relief inquiries. |
| U02, U03a, U03b, U03c, U03d, U03e, U04, U05 | consultation rounds and the proposed course each advice act addresses | `packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json` | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent. |
| U14 | an unsolicited policy programme and delegation proposal with an answer | `packages/kernel/src/log/commands.ts; packages/kernel/src/knowledge/report.ts` | Consultation option advice has no structured unsolicited administration programme or transfer of policy direction. |
| U25a | civil troop-transit negotiation and alternative-route consent | `packages/kernel/src/log/commands.ts; packages/kernel/src/messages/transit.ts` | A field commander goal and a governor troop-raising call do not carry a governor alternative for troop transit through his state. |
| U25b | a civic addressee and conditional troop-protection undertaking | `packs/union-1861/source/world/people.csv; packages/kernel/src/messages/transit.ts` | The mayor is absent from the cast; no civic request carries his conditional protection undertaking. Adding a person alone would not encode the matter. |
| U32 | a depot/base-of-supply change request and counterproposal | `packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts` | Goals hold, take or relieve a place; they do not ask a commander to change his depot and supply base before an advance. |
| U33, U34 | an attack-or-demonstrate instruction and its answer | `packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts` | The goal grammar has hold, take and relieve, with no demonstrate-or-attack direction. The observed hold goals do not expose that demand. |
| U40 | a naval vessel removal/readiness instruction and repeated deferral | `packages/kernel/src/log/commands.ts; packages/kernel/src/forces/` | Land force transfers do not carry a named warship removal and engineering-readiness matter. |
| C04 | organisation integrity and gubernatorial consent terms on a troop transfer | `packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/tick/verbs.ts` | The transfer grammar carries force and destination but no regiment-integrity or permanent-service consent terms. |
| C06 | dock interception of naval reinforcement with supply/transport qualifications | `packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts` | Land goals do not express stopping shipborne reinforcement at its dock without an island landing. |
| C16 | conditional withdrawal tied to an enemy landing, with commander responsibility | `packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts` | Hold/take/relieve goals and generic transfers do not carry the stated conditional withdrawal and responsibility terms. |

## Checks and preservation

The dedicated references ran once: all **268 daily hashes unchanged**, zero
rejections, exact replay, saved-log replay and resume. The initial observer
diagnostic had an unresolved same-day Morgan matter and one null policy
side. Both were reproduced in a failing fixture and corrected by reading
existing levy and policy-event facts. A targeted 41-day read verified Morgan.
The full references were not repeated: these extra observer reads change no
State. The subsequent binding done check independently matches all 268 daily
hashes with the corrected observer. The original diagnostic limitation is
retained in [verification](../docs/audit/s91-evidence/verification.json).

One normal eight-seed check with drafting and `--milestone 1a`: **exit 1**,
**1734.737 seconds; Phase 0 5/6; binding 1A 2/6**. Every non-pushback
criterion keeps its S83 PASS/FAIL status. All other non-timing problem strings
are exact. [Criterion comparison](../docs/audit/s91-evidence/criteria-comparison.json)
retains both sets; [criteria](../docs/audit/s91-evidence/criteria.json) retains
all evidence and every failure.

| Criterion | Result |
| --- | --- |
| phase0 behaviour | PASS |
| phase0 hash | PASS |
| phase0 resume | PASS |
| phase0 liveness | PASS |
| phase0 section-ten | PASS |
| phase0 budget | FAIL |
| 1A checkpoints | FAIL |
| 1A operation | PASS |
| 1A pushback | FAIL |
| 1A unknown-strength | FAIL |
| 1A stand-ins | PASS |
| 1A lever-sweep | FAIL |

**Timing is not exact to S83 and remains failing.** The war/history medians
are 40.79 / 119.00 ms; p95 116.09 / 228.88 ms. The testbed is 8.06 / 24.95 ms.
The 40/160 ms limits are unchanged. Compared with S83’s 45.6/45.7 medians
and p95 values below 160, this adds a history-p95 budget problem. No isolated
cause, idle-host certification or Linux CI equivalence is claimed. No timing
retry was run and no criterion is waived. Confederate known strength remains
86,894; Preston’s unknown-strength battle block and both lever-sweep problems
remain unchanged. The literal “all other problem strings exact” condition
is therefore met for functional criteria, but **not for stopwatch wording**.

The preflight passed 45 focused tests; another targeted control caught the
S77 fixture still requiring retired bands. It now protects all 33 accepted
IDs, the exclusions and unchanged Confederate strength floor, and passes.
Final typecheck, rules, boundary, licences, decisions and schema/fixture
checks are logged in `runs/s91/`. The full suite runs through the unchanged
commit hook, with the established `MANDATE_NO_GIT=1` local mode and one
Vitest worker; the two Git-writing fixture suites remain ordinary/CI tests.

Before this final report, runtime links resolved to this worktree, all
**2,268 starting tracked paths** remained, all 74 S88 source rows were exact,
and all 365 protected paths (kernel, rule seats, source/generated pack data,
gates, hooks, manifests/lock and test configuration) were byte-preserved.
Inventories, original logs/exits, saves and recovery live in `runs/s91/` and
`runs/s91-done*`; no active other-lane directory was opened or changed.

## For the lead

1. Receive the observational scorer and register application under 0111/0112.
2. Review the 20 documented representation classifications, especially the
   distinction between existing option advice and missing scoped inquiries.
3. Route the twelve represented failures and the extra measured p95 budget
   failure to their existing owners. No additional campaign is requested.

Proposed rulings [I]: retain typed, single-use named matching and these
documented gaps. Reject fungible counts, arbitrary ceilings, day/outcome
matching, actor-only substitutions, treating consultation compliance as
substantive advice, and deleting failing rows to obtain clearance.

## Findings outside my scope

Implementing the gaps, behavior/cast calibration, source-qualified originals,
historical excess denominators, S85/S89/S90, isolated performance diagnosis,
whole-branch/gate acceptance, integration and release. No signature, browser,
desktop action, hook bypass, history rewrite or push.
