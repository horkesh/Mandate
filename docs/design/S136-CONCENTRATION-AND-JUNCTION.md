# S136: concentration, the junction, and commitment

For the lead: 4 proposed rulings. **Design only**, 24 November 2026,
`sprint/pushback`, base `cd36eca437736a7d7ecf877c78a55a645556e2b9`.
Every recommendation is **[I]**, awaiting the lead. No accepted decision,
production code, pack, strength, service term, weight, band or criterion changes.

Recommend replacing history-run statewide destination sweeps with received,
scoped instruments; making the junction a commander's relief operation over
real routes; and allocating operation tasks before deciding who fights.
The battle's date must emerge from that chain. None of these changes promises
21 July, near parity, Confederate victory, or a milestone pass.

## 1. Evidence and boundary

**[H]** is a read historical passage, cited by printed page; **[M]** is read
software evidence; **[I]** is inference or proposed design. The [reading
register](../research/S136/source-reading.json) links 27 retained primary-page
OCR readings. They are official printings of differently dated papers, not
proof of each paper's actual receipt. OCR errors remain visible; no new
facsimile collation or whole-book reading is claimed. Page 479's OCR misreads
its heading as 470; its position and passage are recorded separately.

Read the lead's new message, 0108, 0121, 0124, 0126, 0129 and 0130 in the main
checkout; also 0114, 0123 and 0128 for discretion and detention. Their accepted
rules govern this older branch. This proposal neither copies later canon into
the branch nor supersedes it. Git history is the project ledger.

**[M]** S135 at `6cd1e3dc` supplies the accepted cause audit, including its
unchanged reconstruction proof. Its amounts overlap and cannot be summed into
a corrected army. Read its note, summary, causes, junction trajectory and
proof; [context receipts](../research/S136/reading-context.json) identify them.
The July branch still resolved to **`2a5e62d1aa30e30723ad3654aee134318898aa63`**
when read. All July files came through `git show` at that revision, never its
working tree or index. The [input register](../research/S136/input-receipts.json)
records 21 files, and [model evidence](../research/S136/model-evidence.json)
retains the relevant doctrine, decisions and daily operation fields. This is
the committed S134 merge baseline, **not an inspection of the pending 0130
build**. No new historical run was needed for this design.

## 2. What sends a raised regiment to a command

### The current sweep [M]

At `2a5e62d1`, `packages/kernel/src/seats/requests.ts:162-193` filters
`rules.ruleSeats.principals[].concentrations` by date, department side,
received knowledge of the destination and optional paper prerequisites. It
sorts newest `fromDate` first, takes the first destination for each donor and
uses a broad row as the current concentration destination. Named rows are a
separate path. `packages/rule-seats/src/index.ts:264-279` sends broad transfers
with **`force: 'blocks', amount: 999`**. `receiveLevies: false` disables the
fallback for other raising posts; it does **not** restrict those explicitly in
`fromPosts` to a sourced set of regiments. Sender compliance and movement still
operate, but the request itself sweeps the donor's available force.

The Union row maps eleven states to McDowell, and Pennsylvania/Wisconsin to
Patterson. Confederate Alabama/Mississippi/Virginia donors occur in competing
rows; the newer Manassas row takes precedence. The North Carolina row names
the governor although its citation concerns a particular regiment. These are
observed declarations, not historical proof of statewide destination orders.
S135's generated and misplaced lots therefore require an allocation remedy,
not deletion or a new personnel scalar.

### What the read instruments distinguish [H]

| Instrument | What it actually distinguishes | Design consequence [I] |
| --- | --- | --- |
| Cameron to Curtin, 13 July, OR I-II p.166 | Five long-term Pennsylvania regiments, in addition to two at Cumberland, to Patterson; the remaining long-term regiments to Scott at Washington | A sending request can distinguish service and receiving command without naming every regiment; Washington receipt is not assignment to McDowell |
| Harris to Walker, 30 April and 2 May, OR IV-I pp.272,275 | Three regiments for Lynchburg, a recall reservation, uncertainty over sending, then Turney's reported departure and Bate/Maney's readiness | Call, governor's undertaking, sending action and receiving receipt are different events; a reported departure is not an automatic arrival |
| Lee's SO119, 25 May, OR I-LI.2 p.107 | Withers to Bonham at Manassas, Bate to Ruggles at Fredericksburg, Williams to Huger at Norfolk; railway timing arranged with the quartermaster | One order can distribute distinct named bodies to different commands; no state-wide destination follows |
| Lee to Johnston, 1 June, OR I-II pp.897-898 | Available Staunton companies and Turney directed to Johnston, alongside contextual intelligence and conditional instructions | Keep the named/available scope and actual authority; do not move all Virginia or Tennessee forces |
| McDowell GO13, 8 July, OR I-LI.1 pp.413-414 | Organisation of the department's troops, including Runyon's reserve division | Organisation is not a new levy, assignment of every state batch, or engagement order |
| Scott/Mansfield, 21-22 July, OR I-II pp.751,754 | Changed destinations, four named regiments sent toward Fairfax Station, regiments held at Alexandria, and return instructions | Destination and duty can change through orders; neither a roster nor a geographic label grants a permanent field entitlement |
| Cooper/Davis and Lee's SO224, 17-18 July, OR I-II pp.980-981 | Particular reinforcements, transport contingencies and different transport for Hampton's arms | A direction concerning McRae cannot authorise fifteen North Carolina lots; preserve the named scope and source identity questions |

### Proposed ruling A: one chain from raising to receipt [I]

1. **Raising remains 0108's act.** Keep call lineage, raising office/person,
   sourced catalogue identity or generated marker, arm, service and strength
   kind. A named lot is still a model-raised lot, not a historical arrival.
   Never manufacture a historical unit that was not raised, revive an expired
   one, distribute an aggregate into men, or change 866 to repair the battle.
2. **An instrument declares a request or an assignment, not a destination
   function on states.** Reuse 0121 letter identity, dispatch ledger, receipts,
   normal conflict resolution and compliance. Declare the read issuer acting
   under 0124/0129 authority, addressee office/person, sending command,
   destination/receiving command, and the force scope its words establish.
   Scope may be a named existing identity, or a cohort such as a particular
   call's available long-term infantry. State origin alone is not enough.
   An explicit request for all a scoped cohort can mean all; a finite request
   cannot silently mean 999 blocks. Missing terms are gaps, not unlimited grants.
3. **Receipt is causal.** A historical issue date can constrain when a specific
   paper is eligible, but does not deliver it or move troops. Readiness must
   require the issuer's relevant received request/report and live authority.
   Local need can cause a new commander's request; that is logged as his own
   choice, never attributed to an unread historical order. A standing assignment
   opens its post only through the received-and-answered path of 0129.
4. **A named lot follows its read orders through ordinary agency.** A named
   selector matches that identity and its applicable call/service lineage,
   never a same-state substitute or a generated lot. If absent, discharged,
   elsewhere, already committed or outside the sender's authority, record the
   shortfall and seek a new instruction. A later received onward order can
   send the existing lot from its receiving command; it does not restart it
   from its governor or clone it. Two unrelated papers do not resolve by
   newest date; use 0121's revisions and chain/bypass resolver. An unresolved
   incompatible allocation stays reported, rather than spending one lot twice.
5. **A generated lot is allocated by a real eligible request.** First honor
   its call's destination where that undertaking supplies an offer (0126),
   preserving recall and other reservations. On receipt there, a commander
   may select it against an applicable *cohort* request within his authority,
   alongside other eligible lots, through ordinary compliance. Use existing
   sender selection and stable lot-ID ties, not similarity to the July roster,
   a target army total, identity fabrication, or the battle's date. Reserve
   a selected lot against duplicate pending requests; refusal/recall frees the
   reservation. The sender reasons from his own holdings, orders and knowledge;
   the requester learns fulfilment only through reports.
6. **No eligible request means no invented destination.** An unmatched lot
   stays under its current authority at its actual place, available for a
   subsequent lawful request. If the call requires an initial destination,
   missing receiving scope is an explicit data gap. A Washington delivery
   stays in its actual receiving command until an onward order assigns it.
   A generated lot has no entitlement to McDowell merely because its state
   also raised one of his historical regiments. This is a model policy, not
   proof the historical men remained at home.
7. **Transfer and journey remain distinct.** Preserve 0126's governor-owned
   offer until receiving receipt, with recall possible beforehand. Ordinary
   transfers keep their existing ownership contract; do not silently apply
   the neutral-offer exception to all transfers. `movement` owns actual joins
   and routes, and `forces` owns lot regrouping. A mixed block is split/regrouped
   by lots when lawful, never by invented personnel. The receiving command
   acknowledges actual arrivals. A paper addressed to a command lacking its
   historical holder goes to the command post under 0129; a missing post is
   a named gap, not an invented replacement officer.

**Reject:** retaining a state sweep with smaller fitted quotas; moving the July
roster on a date; matching generated lots to missing roster names; subtracting
S135's apparent surpluses; and abandoning generated lots forever. The recommended
path preserves divergence while allowing generic forces to serve real needs.
An instrument/data lane must recover uncovered Union sending and onward orders;
this proposal does not claim the examples above close all destinations.

## 3. Johnston's junction

### The historical chain is evidence, not execution [H]

Johnston's report says Stuart reported Patterson's advance on 15 July, his
halt on the 16th and movement to his left on the 17th. Johnston inferred a
possible attack on his south or detention while Beauregard was attacked. He
reports receiving the government's telegram about 1 a.m. on 18 July and
choosing to elude Patterson rather than defeat him first. He describes moving
through **Ashby's Gap to Piedmont**, infantry onward by railway, cavalry and
artillery continuing by road, and reaching Manassas about noon on the 20th
with some formations before and others with him. These are his retrospective
observations and decisions, not omniscient reports to inject on those dates.
**OR I-II p.473.**

The reproduced **17 July Cooper telegram**, in Davis's indorsement, calls for
a junction of effective force **if practicable**, sends sick and baggage to
Culpeper by rail or Warrenton, and leaves arrangements to Johnston. Its wording
does not make completed sick evacuation a prior condition. Davis explicitly
disputes the word “after” and explains practicability by the reported relative
positions/strengths. **OR I-II pp.478-479**, distinguished from Johnston's
report wording on p.473. P.476 describes later reinforcements and their
commitment during the battle; a commander at Manassas is not proof that his
whole force has arrived or fought.

Scott's 13 July detention direction, Patterson's replies and the fresh 17-18
July exchange must stay separate. Patterson claims successful detention while
Scott questions whether Johnston has slipped away. These papers establish
received claims and disagreement, not actual retention or accurate numbers.
**OR I-II pp.166-169.**

### Proposed ruling B: receive, decide, execute, report [I]

**Receive.** Johnston needs his own received, dated picture of Patterson's
presence/activity and his own troops, readiness, routes and transport. The
government needs received evidence of the threat to Beauregard before its
conditional relief paper becomes actionable; Johnston then needs that paper
at his actual command location. A report from Beauregard can convey need but
cannot compel a peer. An issuer's dispatch, somebody else's knowledge, a
historical quotation and a hidden enemy location cannot substitute for his
receipt. Named paper selectors must bind the correct report/dispatch, not any
old situation notice. The source's hour is not a subdaily clock the kernel has.

**Authority and choice.** The relief instruction is the government's through
Cooper's staff channel, rooted in the principal; it grants no independent
principal status to Cooper and no authority over Patterson or Beauregard.
Johnston's standing command must already be enacted from its read basis.
Retain 0114's conditional relief and fallback to remain, and its existing
`turned`/`outmatched` semantics. Do not expand `outmatched` into a universal
“not practicable” switch. Failed passage, transport, stores or authority are
their own typed feasibility reasons. Within lawful feasible candidates he
weighs relief by elusion, relief after fighting if chosen, or remaining under
the existing conditional choice/planning rules. No new score term, mandatory
escape, fitted caution, or special “Johnston must join” exception is proposed.

0130 applies to his picture: counted components plus an unknown remainder
remain partial. Ordinary relief can be an uncertified choice on common
evaluable terms; an unknown ratio cannot certify safety or detention. Existing
sortie/demonstration numeric gates are unchanged. His report of his decision
reaches his superior later. An evacuation or rear duty becomes an actual task
only for forces/entities represented by the model; no 1,700 sick men, baggage
block, or extra guard quantity is created from p.473 to adjust combat strength.

**Route.** The historical Ashby's Gap road crossing and the Manassas Gap
Railroad are different things. The committed graph's `lower_valley` contains
Winchester/Martinsburg; its road to `loudoun_fauquier` cites Snicker's/Ashby's
gaps, and that eastern region includes Piedmont in its rail description.
Its rail edge onward to `manassas` is presently grouped under
`orange_and_alexandria`; the separate `manassas_gap` rail edge runs to
`middle_valley`. These are **[M]** map declarations in the captured CSVs, not
new geographic source certification. Do not invent a direct Winchester-to-
Manassas railway, or route through `middle_valley` merely because the line is
called Manassas Gap.

Offer an actual mixed road/rail route from **where the troops really stand**:
when in `lower_valley`, road to `loudoun_fauquier`, then rail to `manassas`
where permitted and available; cavalry/artillery can continue by road as the
read order provides. An army still at Harpers Ferry must first obtain lawful
movement from there, not appear at Winchester. Audit the earlier orders that
sent its unknown Virginia body to Lynchburg; fix their scope only through
their instruments, not a July relocation. The current captured relief route
instead starts at Harpers Ferry and uses two road legs, with a seven-day
concentration; it opens on day142 with concentration until149. This follows
the inspected state, not the historical chain. S135 records the subsequent
Harpers Ferry battle on146, before that concentration finishes.

An approved route must pass the same real passage checks as movement: control,
damage, capacities, permissions and changed conditions at each leg. Give
infantry/road groups distinct block journeys when their arms and actual lots
permit it. Existing movement days/capacities are model parameters; they do not
establish historical train throughput. Partial arrivals must be acknowledged
and may be committed separately, without making the whole army wait for its
last block. **Exact station loading, queue capacity and intra-day arrivals
are unresolved at this map/tick scale.** Recover transport evidence and obtain
a separate ruling before claiming such fidelity; no new train speed, boarding
timer, throughput or map subdivision is authorised here.

**Patterson.** Keep 0123's duty and 0128's limits: his actual allocated activity
can produce observations received by Johnston, who may stay, fight, reinforce
or leave. Detention is never a pin, a loyalty/compliance check on the enemy,
or a hard bar merely because the two commands share a region. Actual contact
or interdicted passage can still stop a movement under the normal rules. A
reported success, an activity label and coincident presence certify nothing.
Offline diagnostics must distinguish requested/attempted pressure, observation,
Johnston's recorded reaction, departure and any established causal effect.
If the coarse-region contact model makes ordinary departure impossible, name
that execution gap; do not grant immunity or a secret bypass.

**Reject:** a 20/21 July reinforcement event; a withdrawal triggered by the
calendar; instantaneous railway transport; borrowing Beauregard's hidden
picture; mandatory Patterson failure; forcing Johnston to fight Patterson
before leaving; and a new unbounded conditional-order language.

## 4. Reserves, demonstrations and rear guards

**[H]** GO13 calls Runyon's division a reserve (OR I-LI.1 p.414). GO22 gives
Miles a Centreville reserve position and an artillery-only demonstration at
Blackburn's Ford (OR I-II p.326). McDowell reports troops ordered from Runyon's
reserve, Blenker covering retreat, and the demonstration (p.321); his later
correction adds Richardson's rear-guard duty and Davies's action (p.328).
P.324 distinguishes the main crossing from troops elsewhere. These are
different tasks, not proof all reserves never fought.

**[M]** `combat/battle.ts:109-139` builds sides from regional standing presence,
without an operation task filter. In S135, eleven Runyon/Miles named lots
contribute 9,526 rule men to contact. That subset overlaps the roster amount;
it is not another correction total.

### Proposed ruling C: task allocation precedes commitment [I]

The army commander, under his received mandate and mission, allocates his
actual blocks among a main effort, reserve, demonstration, rear/route guard
or local defence. The commander below him receives that task and answers
through ordinary latency and compliance. “Reserve” in a template can prompt
an allocation proposal; it cannot itself enact a never-engage flag. The
President orders the commander, never chooses Runyon's regiments or a ford.

Each task names its owning operation/issuer, allocated blocks, purpose,
regional scope, start/release or completion condition, and the received
authority/task paper where applicable. One block cannot both march on the
main axis and guard the rear. Plan alternatives can leave a guard or release
a reserve by commander choice, with explicit opportunity costs under existing
terms. No new percentage of an army must be withheld. A commander without an
explicit special allocation uses the existing main/defensive task, recorded
as such, rather than an invisible historical exclusion.

Separate **physical presence**, **force exposed to this contact**, and **force
actually committed**. Combat receives a derived eligible set from the live
tasks and actual locations; it does not write a second assignment truth.
Use this conservative regional contract: the attacking side supplies the
blocks executing that attack/main effort, any released and available reserve,
and any active demonstration whose contact becomes a battle. An unreleased
reserve or guard cannot swell that offensive merely by being in the region.
On the defending side, all physically present, otherwise eligible local
blocks remain exposed to a regional attack, including reserves and guards;
there is no hidden safe pocket within that region. A counterattack therefore
can expose a previously withheld reserve. A rear guard fights where it
actually stands or retreats, never simultaneously in the main attack. Apply
the existing battle strength/commit rules only to these eligible sets; do
not invent a fraction to commit. A release follows existing receipt/local
decision tick boundaries, not a fabricated 3 p.m. event.

Demonstration troops can be attacked. Defence against contact needs no wait
for a new presidential order. Regional abstraction cannot distinguish two
historical fords within one region: this rule cannot reproduce their exact
tactical isolation or the hour of a reserve's intervention. Do not reveal an
unobserved task to an opponent. Exact within-region separation needs a separate
contact/map ruling, but is not needed to prove that an offensive no longer
automatically includes its unreleased rear reserves.

Regroup lots only through `forces`; allocation through `operations`; ordinary
command assignments through `command`; location through `movement`; received
task papers through `knowledge`. Release/reassignment replaces the old task,
records why, and ends stale reservations. Completion, retreat, loss of the
holder or operation closure must leave no stranded allocation. Strength stays
derived from the same lots, including unknowns. A smaller committed side
does not close 0130's unknown-combatant criterion.

**Reject:** excluding Runyon/Miles by name/date, excluding all reserves from
all contact, automatically committing every regional block, and introducing
a fitted reserve fraction to reach the historical engaged total. S136 proposes
the contract; the build must prove honest same-region exposure before claiming
that tasks solve tactical participation at this map scale.

## 5. Why the recorded battle is on 23 July

**[M]** The committed doctrine makes McDowell's goal eligible on **16 July**;
it does not make him march that day. His trace gives:

| Day / date (day0 = 5 March) | Recorded cause |
| --- | --- |
| 134 / 17 July | Goal set/received; plan choosing |
| 135 / 18 July | Direct plan approved, operation opens at `northern_virginia`; concentration3000 permille days, until138 |
| 138 / 21 July | `concentrated`; march starts on the three-day road to `manassas` |
| 139 / 22 July | Still marching; a battle menu is not a resolved battle |
| 140 / 23 July | Force at Manassas and first resolved battle in S135's verified packet |
| 141 / 24 July | Operations records arrival/assault acknowledgement, then enemy gone; this acknowledgement is not first contact |

`planner/axes.ts:28-48` takes the greater of gathering travel and the profile's
concentration allowance. Here the recorded phase is three days.
`tick/operations.ts:596-616` starts the march when concentration ends;
`movement/march.ts` advances 1000 permille per day, including the day a leg
starts. Thus the road ticks are138,139,140. The plan's displayed total arrival
7000 includes an assault phase and is not a civil-calendar promise of the
first combat day. The post-contact operation acknowledgement occurs later.

**[H]** McDowell's explanation of actual delays names slow troop arrivals,
transport diverted toward Patterson, late wagons/horses, disorderly trains,
provisions and marching fatigue (OR I-II p.324). His report describes the
20 July reconnaissance/starting arrangements (p.317). None establishes the
model's three-day profile allowance as a historical measurement. Likewise,
none justifies deleting two model days to obtain 21 July.

### Proposed ruling D: move the cause, measure the date [I]

Keep dispatch eligibility, dispatch/receipt, compliance/planning, gathering,
readiness, departure, each actual leg, contact and operation acknowledgement
as separately logged events. Replacing the statewide sweep changes which
troops are needed/present, their tasks and their gathering journeys. Real
received movement/transport orders can change departure and available modes.
Changed reconnaissance, stores, opposition, interruptions or lawful reserves
can change both choices and contact. Removing unrelated late blocks from a
main effort may change gathering; it does not prove that this run's three-day
floor disappears. Current profile weights/durations stay until an independently
justified mechanism/rule brief is accepted.

The historical march on16 July was encoded as eligibility for *issuing a
goal* on16 July. This is a model-layer mismatch, not evidence to backdate its
receipt. A future instrument build should source the actual preparatory/go
orders and their antecedent readiness; the read p.324 is an explanation of
departure, not an order whose dispatch/receipt can be invented. Measure any
changed timing through that chain. Do not advance `fromDate`, shorten a road,
reduce the concentration floor, move a seed or revise a threshold solely to
make the contact happen on21 July. Battle coefficients and the winner are
outside this proposal.

## 6. Paired acceptance requirements and bounded build sequence [I]

The [24 paired tests](../research/S136/paired-tests.csv) are **future executable
requirements, not tests run or passed by S136**. They specify fictional fixtures,
one changed input and both outcomes. Use permuted identities/calendar labels
to expose hard-coded armies/dates, and positive/negative controls for receipt,
authority, cohort/named scope, recall, routes, reserve exposure and unknowns.
Every case must retain lot IDs/strength kinds and typed causes; checking only
the resulting army total is insufficient. No named historical winner, force
ratio or exact July date is an acceptance target.

Recommend three bounded builds after the lead rules:

1. **Instrument allocation:** recruitment/command/data owners replace the
   history-run broad sweeps with read sending/receiving scopes and reusable
   cohort selection. Preserve generic testbed policy explicitly. First prove
   fictional request/shortfall/receipt/conservation cases, then measure allocation.
2. **Junction execution:** command/planner/movement owners verify conditional
   authority, actual origins, mixed mode journeys, partial arrivals and the
   opponent's received activity. First prove departure both with ignored
   pressure and with actual interruption. Name source/map/transport gaps before
   any historical capture; no automatic regional immunity.
3. **Task and commitment:** operations/combat owners establish one allocation
   and derived exposure/commitment, including attack on a reserve and rear-guard
   duty. Prove same-region behavior cheaply before a reference run. All new
   saved fields need the single-writer/ownership and FOUNDATION rows, migrations
   with empty unknown history, replay/resume and cleanup tests. No phantom old
   receipt, allocation or completed journey on loading an older save.

Keep existing deterministic integer arithmetic, strict ordering, bounded
candidate/search caps and budgets; no setting names in the kernel. S136 adds
no new numerical policy. Instrument chronology is pack evidence, never a kernel
name/date branch. 0108 divergence, 0126 receipt, 0129 identity continuity and
0130's unknowns survive all three builds. S137 alone owns the fourteen expiring
identities; all other service and source holds remain open.

For this design delivery, verification is limited to source/receipt hashes,
UTF-8/links/CSV structure, fresh model-summary assertions, complete preservation
of original tracked files, boundary/rules/type checks, and the required ordinary
commit hook (`npm run check` on the staged tree). Logs and actual exits live
in `runs/s136/`. Reuse S135's reconstruction and committed S134 traces; do not
rerun that campaign, build a package, or claim simulation acceptance from a
documentation commit. Formal branch review/signatures remain deferred under
0106/0107. The [handoff note](../../notes/sprint-S136-concentration-junction.md)
records delivery and remaining work.

For the lead:

1. Rule on A, instrument-scoped allocation of named and generated lots, rejecting
   state sweeps and roster/total fitting; route uncovered destination instruments.
2. Rule on B, received discretionary relief and mixed real journeys; keep
   transport precision and the earlier Lynchburg mission as named dependencies.
3. Rule on C, commander task allocation and exposed/committed forces; require
   proof of coarse-region contact behavior before any historical claim.
4. Rule on D, timing by logged causes only; keep S137 and battle tuning separate.

Findings outside my scope
