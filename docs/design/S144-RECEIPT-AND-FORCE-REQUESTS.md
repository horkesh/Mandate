# S144: who receives a regiment, and who asks for it

For the lead: 4 proposed rulings. **Design only**, 24 November 2026,
`sprint/pushback`, base `ae1c6c217172de0eebc5808c8ab24eadf23187a7`.
All proposed rules are **[I]**, awaiting the lead. No code, pack, accepted
decision, criterion, band, strength, service term or timing parameter changes.
S141's data commit and fifteen zero floors stay held. S145 is a separate lane.

Recommend **receipt at a lawful station, followed by a commander's own scoped
request and the superior's separate choice**. This supplies a causal path for
an army to form without making every regiment of a state belong to an army.
It will not, by itself, repair missing call destinations, authority, journeys
or unread intermediate orders. No July date or army size is an objective.

## 1. Evidence, including the limits of the sources

**[H]** denotes a read historical passage, cited by printed page; **[M]** a
read software artifact; **[I]** a proposed rule or counterfactual. The
[reading register](../research/S144/source-reading.json) retains 28 primary
OCR excerpts with locators and hashes. These are selected passages from
contemporary regulations and the Official Records' later printing of papers.
No fresh facsimile collation, whole-volume reading, or exact receipt date is
claimed. The OCR is uncorrected, including broken names and running headers.

Read the main checkout's 0124, 0126, 0129 and 0131; S136 ruling A and its
paired specifications here; S138's instrument register and unit links; and
S141's corrected packet and retained states. The
[input register](../research/S144/input-receipts.json) pins those inputs.
S138's roster links are research leads, never replacement assignment papers.
Other worktrees were read only; the requested final CODEX append is separate.

### What the Regulations actually establish [H]

| Read passage | Establishes | Does not establish |
| --- | --- | --- |
| 1857 Regulations, pp.2–3, paragraphs7–18 | Mixed corps serving together have a commanding officer, subject to special direction; a commission alone does not put an officer on duty; regularly constituted commands and succession have rules | Rank alone appoints a territorial commander, or every passing regiment changes permanent command |
| p.23, paragraph168 | An officer arriving at his post under orders reports the journey and supplies those orders to its commander, with onward reporting to departmental headquarters | Arrival dispenses with orders or proves an unrelated field assignment |
| pp.57–60, paragraphs424–429,438–441 | Special orders can concern a corps' march; orders pass through intermediate commanders; staff carry their commander's orders; the commander present opens and executes orders addressed to a body of troops | Staff are principals, or a peer can requisition another command's troops by fiat |
| p.63, paragraph468 | Troops arriving at the rendezvous are organised into brigades and divisions by the general commanding-in-chief | A roster raises or sends them, or an entire state is the rendezvous's property |
| p.126, paragraph977 | An arriving officer's quarters/fuel requisition includes the order putting him on duty at the station; a troop commander makes it for his body | Provisioning transfers ownership to the quartermaster or station |
| pp.430–431, paragraphs1351–1358 | Recruits received at a garrisoned post are put under an officer; post/station inspection and the detachment's handover rolls and arrival report are prescribed | Recruiting-depot procedures are a universal transfer law for formed volunteer regiments |

**Answer:** yes **[I]**, an otherwise unallocated regiment lawfully delivered
for service at a station should be received into that station's military
command, after an actual local receipt. The read passages support local
accountability and organisation. They do **not** explicitly enact the full
default-assignment algorithm below for every formed regiment. The extension
from those practices to a model default, and its use on the Confederate side,
are visibly **[I]**. It must not swallow 0126's governor-owned offers or a
specific assignment. This is the troop counterpart to 0129 item3's command
post as addressee, not a new rule that place is superior to every paper.

### Territorial commands read, rather than inferred from an army roster [H]

| Instrument and printed page | Read scope and consequence for the proposal [I] |
| --- | --- |
| War Department GO12, 27 April, OR I-II p.607 | Washington: original District boundary, Fort Washington/adjacent country, Maryland through Bladensburg; Mansfield assigned. Annapolis: twenty miles either side of the railway to Bladensburg; Butler assigned. Pennsylvania: PA, DE and residual MD; Patterson assigned. Receiving at Washington would ordinarily mean its department, not McDowell. Explicit receipt to Scott still means Scott. |
| War Department GO26, 27 May, OR I-II p.653 | Virginia east of the Alleghanies and north of the James, except Fort Monroe and sixty miles around it, forms McDowell's geographical department. His report on that page distinguishes his arrival from assumption and inspection. It is not a grant of all northern recruits. Boundary overlap with GO12's original District must be resolved explicitly in mapping, not by treating a coarse region as a whole department. |
| Ruggles GO1, 22 April, OR I-II p.775; Letcher's direction and Lee GO1, pp.775–776 | Ruggles assumes the volunteers/militia on the stated Mount Vernon–Rappahannock line under the governor; Lee assumes Virginia's military/naval forces. State and Confederate roots remain different until lawful transfer. |
| Lee GO3, 26 April, OR I-II p.783 | Johnston assigned all State forces in/about Richmond. This is a dated state-command assignment, not proof he still receives Richmond arrivals after taking another command. |
| Lee GO13 publishing Walker's telegram, 10 May, OR I-II p.827 | Lee is to control Confederate forces in Virginia and assign their duties; officers report stations, orders, numbers and organisation. It supports a real receiving/superior command, not a grant to take untransferred State forces. |
| Lee GO20, 26 May, OR I-II p.882 | Richmond, Norfolk, Fredericksburg, Harpers Ferry, Alexandria line and Hampton line commanders are treated as separate departments **in the sense of article65, to order general courts-martial**. It is not a complete set of geographical borders or an all-troops allocation. |
| Lee SO149, 31 May, OR I-II p.896; government SO64, 5 June, p.907 | Beauregard is assigned the troops in the Alexandria line, with predecessors' orders referred to; Holmes assumes troops in Fredericksburg's vicinity. The referred predecessors' orders are not thereby read. These provide command-specific evidence beyond GO20's limited purpose. |
| Lee GO25 publishing Letcher's transfer, 8 June, OR I-II pp.911–912 | Virginia volunteers mustered into State service transfer by regiments; later bodies transfer as formed and required; command passes to the Confederate authorities. This remains a received transfer, not relocation by calendar. |

This covers the Confederate Virginia commands implicated in S144, not an
exhaustive account of every Confederate department. Johnston's original
Secretary's assignment remains a referenced original: Jackson's refusal to
publish the assumption without Virginia instructions is read at OR I-II
p.872. Keep 0124 item5's attested-command route and the refusal; do not replace
them with an invented territorial general order.

## 2. Proposed ruling E: receipt by place with a defined exception order [I]

1. **Arrival must already be lawful.** A call/undertaking, transfer, or march
   supplies the journey and service root. A lot appearing at its raising
   place is not a delivery to the national army. The same faction, proximity,
   a boundary change, or an end-of-day snapshot is not receiving receipt.
2. **Resolve the receiving office before the holder.** The received sending
   terms win: explicit receiving command, including Scott at Washington;
   next, their specified station/rendezvous's command; only if no assigning
   command is specified, the established local military station and then its
   unambiguous territorial department. The last step is the new default.
   A visiting field headquarters does not take a garrison. A regiment passing
   through toward another destination reports its presence without changing
   its assignment. No global nearest-headquarters or highest-rank search.
3. **Require an opened post and lawful authority.** Use 0129's received and
   answered assignment, and 0124's live mandate under the right root and
   territory. Route to the post, whoever lawfully holds it on arrival. A
   missing/unopened post, absent holder, incompatible root, unresolved overlap
   or coarse-region boundary is a typed gap. Preserve the current owner,
   report the need for instructions, and do not invent an officer or a border.
   There is no automatic backfill when a post later opens: re-offer/report the
   still-present lot and obtain the first real receipt then.
4. **Respect special assignments and retained ownership.** A specific field,
   naval or detached duty remains in force unless lawfully changed. Local
   reporting/quarters is not a second combat command. A governor's offered
   regiment remains his until the receiving command's receipt under 0126;
   recall and reservations survive. If its explicit receiver is unavailable,
   local custody cannot redirect the offer: ask its owner/issuer. A neutral
   body is never nationalised by crossing a border. State forces require
   their received transfer and admission to the national chain.
5. **Receipt is one auditable transaction, not a second writer.** Movement
   records actual arrival, forces preserves/splits actual lots and service
   identity, and command records receiving assignment/offer completion once.
   The receipt links lot, origin, journey, sending paper/undertaking, receiving
   command, authority basis, reservations and day. The lot must be present,
   extant, not surrendered/discharged, and no longer travelling on that join.
   Command ends the fulfilled join and resolves pending reservations. The
   receiver learns his arrival; other seats learn through ordinary reports.
   A replay or later daily scan cannot create a second receipt.
6. **The resulting force is local holding, not an offensive entitlement.**
   A subsequent field request and answer can transfer it onward. Actual task
   allocation, real routes, live authority, physical arrival and contact
   still precede commitment under 0131. A local receipt does not add men,
   certify an unknown strength, or release a guard/reserve.

Reject both extremes: **permanent limbo until a named assigning paper is
recovered**, despite a lawful station arrival; and **geography seizes every
co-regional body**, including state recruits, ships, explicit detachments and
passing offers. Reject using Washington as an alias for McDowell, and GO20
as a complete Confederate territorial map. Add only sourced post declarations
in a later authorised build; there is no pack addition in S144.

## 3. Proposed ruling F: a mission can cause its holder to ask [I]

The historical evidence establishes that requests and answers were choices:
Patterson reminds headquarters of his request for artillery for the Frederick
column (OR I-II p.652); McDowell's reported request seeks troops from Washington
in an emergency (p.747). Beauregard asks that Holmes and the Secretary approve
support, rather than commanding Holmes's force (pp.932–933); Holmes's
indorsement disagrees with detaching it (p.933). None supplies a general
automatic manpower formula. The following protocol is **[I]**, implementing
S136 A3's allowance for a local request, not impersonating those papers.

**Trigger and choice.** After a mission has been received and accepted, its
current lawful holder considers his own reports, holdings and planner's
candidate tasks. An empty committed set or a typed shortage of an arm/task
may produce a request choice, alongside proceeding within his means, waiting,
or reporting inability. Receiving a new mission is enough to consider this
choice even if no force exists from which the current planner can draft.
In that case keep an unfilled mission/task requirement, not a fake executable
plan with phantom blocks. No request is generated from an issue date, an
unreceived enemy report, or the historical army's deficit. A known feasible
task set does not create a reinforcement request merely because it is small.

**Scope and quantity.** Request one missing task's smallest indivisible
regimental lot at a time, scoped by a real call/service family and arm suited
to that mission. The one-lot bootstrap is a proposed generic policy **[I]**,
not a sourced military establishment or a fitted strength threshold. Record
the task, why that arm/service is needed, call lineage (or an explicit
unknown), receiving command, lawful rendezvous, acceptable modes and mission
reference. A request for a cohort of long-service infantry is not a request
for all New York troops or enough men to reach a historical total. Do not use
`all`, 999, a state selector, roster similarity, or a casualty/army-size target
for this automatic local path. If no supported cohort can be specified, ask
for instructions; unknown lineage is not an unrestricted selector. Known
enemy strength can inform ordinary planning, not a new fixed force ratio.

This is deliberately conservative. Reconsider only after actual fulfilment,
changed received mission/evidence, an answer, a cancellation or a material
availability change. One outstanding request per mission/task/scope, including
its partial fulfilments, prevents daily retries from becoming a slow sweep.
Once a candidate's required task is supportable, stop that request sequence;
another task must have its own recorded necessity. A previously failed request
is not silently reissued under a new ID. Use ordinary attention/communication
policy, not a new fitted cooldown or a date-driven queue.

**Address and receipt.** Ask the real immediate superior by the existing
chain, through staff where appropriate (Regulations pp.58–60, paragraphs428,
439–441). This is a request, not authority over peers or governors. Log
`origin=commander_choice` conceptually, with the received mission and evidence
that motivated it; no unread historical source ID is attached. Dispatch and
receipt are separate; office addressability is only where existing 0126/0129
rules allow it, not a universal office-holder directory. Lost authority or a
relieved holder cancels/requires revalidation of the request; a successor
does not inherit a person-bound grant simply by reading an old request.

**The superior's own decision.** On receipt, the superior evaluates lawful
support versus retaining his actual troops for his own missions using his
planner, known needs, existing scoring terms and ordinary compliance. Do not
make `comply` always win or add a new reinforcement bonus. Candidate holdings
come from his real command/authority, not every friendly lot in State. Include
current commitments, guards, offer restrictions, pending reservations, expiry,
readiness, source and destination permissions, and possible journeys. Unknown
strength stays unknown; an unscorable comparison is recorded as such, not
scored as zero cost. Scope/authority is rechecked when a lot is selected and
again before dispatch. Selection uses the existing stable strength/lot-ID
ordering where applicable; reorder input objects without changing the result.

He may grant, grant partly, defer, counterpropose, refuse or report no eligible
force, with terms and typed reasons. A positive answer issues the **superior's**
scoped assignment to the actual sending command under his own live mandate;
that sender receives and answers it by normal compliance. Approval is not
arrival. Reserve actual lot IDs, split/regroup through forces when needed,
move through ordinary joins, complete receiving receipt, then acknowledge it
to the requester. Cancellation, refusal, recall, expiry, disbanding or regrouping
must release/remap only the affected reservations, preserving surviving lots.
Never dereference a vanished container to infer new capacity.

**A superior cannot grant what he does not hold.** If necessary he may choose
to relay/escalate the scoped need, preserving its mission and request identity,
to a superior with authority, or ask an independent governor through the
existing principal/request path. This is another deliberation and answer,
not a search that directly assigns the governor's lots. Scott's command does
not acquire a governor's root because the governor supports the Union.
The governor can undertake, refuse, delay or reserve; actual sending and receipt
follow. A generated lot still first honours its read call destination and
offer receipt before answering an onward cohort request (0131/0126). Missing
call destination or offer is an explicit data dependency, never cured by
calling the same selection a local request. Named lots do not substitute for
missing generated identities, and generated lots never answer a named demand.

Reject automatic grants, global faction inventories, a superior who merely
rubber-stamps the child, requests on every tick until a target size is reached,
and requiring an executable nonempty plan before an empty command can ask.
Do not tune new terms to make the rejected choices win. A later build should
first expose existing planner/compliance comparisons; any genuinely missing
term or force-requirement model comes to the lead separately, with its basis.

## 4. Proposed ruling G: what follows from the retained capture [M/I]

No new simulation, replay, ablation or timing run was made. The offline
[lot inventory](../research/S144/snapshot-lots.csv) enumerates **839** lot
observations in the three existing states (293/273/273). Each row keeps actual
command, place, arm, identity/generated marker, strength kind, service clocks
and offer receipt. The [reading summary](../research/S144/capture-reading.json)
retains local holdings and mission records. These are model facts, not
historical claims that the regiments stayed there. They are not a computed
eligibility verdict: authority, reservations, commitments and each actor's
received knowledge must also be checked by a future implementation.

| Actual retained holding [M] | Receipt by place alone [I] | Receipt plus own requests [I], conditional on real answers/journeys |
| --- | --- | --- |
| Washington at all three snapshots has the existing regulars under Scott, DC militia under its post, Marines and naval bodies under theirs; **no raised regiment** | No new regiment for Mansfield or McDowell. Existing special assignments remain. Washington department is absent from these States' posts; GO12 must open its post on receipt in a later build. Never replace it with Scott or McDowell by name | A proper arrival with no specific receiver goes to Washington's lawful local command. Scott's explicitly addressed receipts remain Scott's. McDowell can ask Scott; Washington holding still needs Scott/Mansfield's own lawful onward assignment, movement and McDowell's receipt |
| McDowell and Patterson have zero assigned lots on 120/140/146. McDowell has received/approved `take manassas`, set134, committed `[]`; Patterson's Harpers Ferry hold mission is set140, also `[]` | Geography alone gives neither troops from home. Opening a field post is not delivery of regiments | Each can consider a mission-linked cohort request without a pre-existing block. Allocation could form their commands from real holdings released by the right superior or consenting governor, but no particular final roster or quantity is implied |
| Curtin has fourteen service lots on 120, ending136; none on140/146. Finite-five received135, selected none, shortfall5 `scope_unavailable` | No long-term Pennsylvania regiments are created or reassigned. The remainder remains undispatched | The original five retain their original long-term scope. A new request cannot make the short-term lots long-term or fill them from another state. Empty/expired scope remains unmet; changing a mission/request needs a new logged choice, not rewriting Cameron's paper |
| New Jersey at its actual raising region: four named short-term lots end136, and `nj_1_3y_infantry`, `nj_2_3y_infantry`, `nj_3_3y_infantry` persist on140/146 under its governor; their call is `us_may16_vol_new_jersey` | None becomes Patterson's or McDowell's because of a department boundary or later roster | These three existing named long-term lots are concrete possible members of a call/service/arm cohort if their owner receives and agrees to a lawful request. A finite request selects only its quantity; they must travel and be received. The four expired lots are unavailable after136 |
| New York's governor holds52 service lots at `new_york` on140/146; named examples include `ny_11_infantry`, `ny_15_infantry`, `ny_16_infantry`, `ny_17_infantry` under `us_may03_accepted_new_york`; generated members also remain there | Not arrivals at Washington; no local capture of the state's holdings | Named examples could answer an applicable cohort after a fresh real request/undertaking. Generated members first need their call's actual destination/offer receipt. No authority to send all52 and no claim all are available; named dispatches of21July (OR I-II p.751) cannot be backdated |
| Lee's `cs_forces_virginia` holds `generated.raised.st_gov_arkansas.d56.1` and `generated.raised.st_gov_tennessee.d55.3` at Lynchburg on all three snapshots, with received offers | Already nationally received under Lee; no reason to invent a second local transfer. No enacted Lynchburg station post is supplied by the pages read here | These **two actual generated lots**, scoped by their respective received calls and infantry/service, are possible supply for a lawful request. Johnston is below Lee's live chain in the State. Beauregard's post instead sits under `cs_war_adjutant_inspector_general`: his request needs the common superior's lawful order or an explicit grant covering both commands. Do not pretend Lee's mere presence authorises a cross-chain transfer |
| `tn_1_infantry` is Johnston's only assigned lot: Harpers Ferry120, Lynchburg140/146. `tn_2_infantry` is assigned Fredericksburg but remains at Lynchburg140/146 | Neither is unassigned. Do not let place undo the onward papers, clone either lot, or place either at its commander's headquarters | Johnston can request more and reconsider his actual mission; the retained approved mission is **hold Lynchburg**, set112. No request automatically replaces it with Shenandoah relief. Bate's lot remains Holmes's pending its own lawful release; Beauregard's support suggestion and Holmes's objection are relevant distinctions (OR I-II pp.932–933) |
| `unidentified.state-forces.va_manassas_garland` at Manassas belongs to `st_va_potomac`; `unidentified.state-forces.va_harpers_ferry` belongs to `st_va_harpers_ferry`. Richmond's State holding and three generated reserve lots also retain the state chain | They do not become Beauregard's, Johnston's or Lee's Confederate troops merely by location. Their unknown strengths stay unknown | With a received and answered State-to-national transfer, and a valid local command/assignment, the Manassas body could pass to the Alexandria-line command and Harpers Ferry's to its command. That is conditional on 0124/0129, GO25 and real receipt, not an assertion this occurred in the capture. Richmond reserves need the same transfer/offer/source checks, not a sweep of all Virginia |

The rest of the839 observations remain at the exact assignments/places in the
CSV until an equivalent lawful chain exists. This is an exhaustive inventory
of the inspected snapshots, not an exhaustive reconstruction of intervening
arrivals. **No exact future selected set can honestly be predicted from these
snapshots.** The decisions, receipts, missions and journeys would change the
trajectory; the table supplies concrete candidate identities and the barriers,
not fabricated counterfactual State. It does not promise that a legal request
is chosen, complied with, or received before a regiment expires.

### Battles and the operation criterion

**[M]** S141's `changed-battles.json` retains all six absent old records:
Harpers Ferry146 and Manassas140/141/142/143/146. Its `scores.json` has
`operation.problems: []`, with evidence
`op:cs_cmd_charleston:38` (bombard) fighting `battle:fort_sumter:38`.
The read `history-run.ts` checks a planner/seat-approved operation causing a
battle during its lifetime, with summed loss breakdowns. Thus **the operation
criterion is already witnessed in the retained capture without invented
allocation**. This does not satisfy each side's checkpoint counts or the
fifteen liveness floors, and it does not remove S141's hold.

**[I] Receipt alone** supplies no additional field regiments shown at those
places; it cannot justify claiming any of the six battles restored. Conditional
completion of the Virginia transfer can supply local defenders, but without
opposing attacking troops it still cannot make a battle. Existing Sumter is
unaffected in the design's scope; no rerun is claimed to prove that result.

**[I] Receipt plus requests** makes Manassas contact possible if McDowell
receives usable troops, chooses/gets approval for a feasible operation, travels
to actual defenders, and assigns real tasks; Harpers Ferry contact is possible
if Patterson obtains force and the relevant mission and meets actual opponents
there. Johnston's present Lynchburg mission/placement cannot stand in for that
opponent or for the discretionary junction. Relief still needs 0131's reports,
government instruction, choice and routes. There is no basis to predict the old
six battle IDs/days, winners, losses, sizes, or even which theatre fights first.
Unknown defender strengths cannot become numeric loss participants without the
existing strength gates. The mechanism leaves an operation reachable; a July
field-operation pass remains **unmeasured**, and is not equivalent to repairing
all other milestone/liveness criteria.

## 5. Proposed ruling H: prove the chain before any later capture [I]

The [26 paired specifications](../research/S144/paired-tests.csv) are future
requirements on fictional fixtures, **not executable code or tests run in
S144**. Each changes one relevant condition and requires the opposite or
appropriately restricted result. They cover local/specific receipt, transit,
post gaps and overlaps, neutral recall, state transfers, empty-force requests,
knowledge, cohort scope, refusals, partial fulfilment, cross-chain authority,
stable selection, reservation cleanup, expiry, replay and criterion honesty.

A later build should first prove: a valid station arrival actually becomes
command holding; an empty mission-holder can ask; the superior can both grant
and refuse on changed circumstances; a selected actual lot really arrives;
then a fictional operation reaches actual contact with a loss breakdown.
Retain every causal step and failed category. No reference campaign should
discover an observable startup/authority/selector failure at its end. A later
reference run needs its own authorised budget; S144 requests none.

Keep 0131's named/cohort distinction, state-sweep and roster-matching rejection;
0126's offers, reservations and receipt; 0124's bounded mandates, governor roots
and staff signatures; and 0129's post opening and identity continuity. No local
receipt changes a standing mandate by rank. No own request is relabelled as a
historical paper. Rejected alternatives above are part of the proposal, not
permission to change those decisions.

For the lead:

1. Rule on the bounded local receiving default (E), including ambiguous/missing
   posts, explicit receivers and retained state/offer ownership.
2. Rule on mission-caused cohort requests (F), including the one-task/one-lot
   bootstrap and the superior's independent retain/support/refuse choice.
3. Accept the counterfactual limits (G): actual candidates and gaps are known;
   exact future allocations and July battles are not. Sumter already witnesses
   the operation criterion; the fifteen floors stay held.
4. Route a later bounded build only after the ruling (H), with paired fixtures
   first. Recover Washington's opening/receipt and Scott/Mansfield's intermediate
   papers, missing offer destinations, Virginia transfer receipts and territorial
   mapping as separate evidence dependencies. S144 implements none of them.

Findings outside my scope
