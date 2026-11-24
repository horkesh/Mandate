# S154: the grammar the July orders need

For the lead: 4 proposed rulings. **Design only**, 24 November 2026,
`sprint/pushback`, base `211645212ace35456bd0df87498fbad976161ef4`.
All extensions below are **[I]**, awaiting the lead. No code, pack, accepted
decision, historical identity, strength, service term, band or floor changes.
S153 owns integration/performance; S155 owns the build of 0137.

Recommend a **received paper with one typed act**, using the existing request,
offer, goal, journey, receipt and organisation owners. Add declarable governor
sending, bounded intake/handover, successive organisation and event conditions.
Do not build an unrestricted rule language or a second army-formation system.
These mechanisms can make the read chains executable; they cannot supply
missing bodies, arms, company membership, onward papers or compliance.

## 1. Evidence and present limits

**[H]** is a historical passage read, cited by printed page. **[M]** is a read
software/research artifact. **[I]** is interpretation, proposed grammar or a
fictional specification. A reported order accepted under 0136 is marked
**[I: attested]**, retaining both the report date and the order's separately
attested date/bound. This does not make it an autograph original.

Read the lead's final S154/S155 handoff and decisions 0124, 0126, 0129, 0131
and 0133–0137 in the main checkout; S144 here; S152's disposition register,
source readings and report; S149/S151's notes, instruments, coverage and
identity CSVs; and the allocation, receipt, organisation and goal code in
`C:/Pyrrhic/sprint-allocate/packages/kernel/src/`. The
[input register](../research/S154/input-receipts.json) pins the selected inputs
and page locators. S149/S151's retained OCR is the source of the primary
readings here; no new retrieval, full-volume reading or facsimile collation is
claimed. The CSV preserves research citations even where its conclusion is
that the record cannot author an executable clause.

The [gap mapping](S154-GAP-MAPPING.csv) has **exactly 117 rows**, keyed by
`research + instrument`, one for every S152 `named_gap`. These are research
rows, not 117 different orders: U14/N07 and U36/X01, for example, overlap.
Neither this design nor its CSV changes S152's dispositions. Six partial rows
and relevant records outside those 117 are discussed explicitly below.
`R` in the mapping means reuse an existing request/offer/goal/report mechanism
or retain an evidence gap; G1–G8 refer to sections 2–9. `proposed_carries_act`
means the proposed grammar carries the read act, **not** that its prerequisites
are present or that this design has executed it. `reuse_with_dependencies`
likewise certifies no dispatch. Each row retains its residual and original
S152 gap text; paired specifications apply only to its proposed active clauses.

### What is already carried [M]

| Read kernel surface in sprint-allocate | Reuse | Limit that matters here |
| --- | --- | --- |
| `world/allocation.ts`, `world/allocation-scope.ts` | `request`/`assignment`, named or call/service/arm scope, finite quantity or textually justified `all`, `atRegion`, `continuing`, modes, paper dependencies | Pack data rejects runtime `voluntary` and `subordinateOrder`; no declarable governor-authored undertaking, compound historical intake, condition or organisation act |
| `command/allocation.ts`, `tick/allocation.ts` | Actual lot selection/reservation, governor offers, refusal, deferred lots, revision family, journeys and received allocation | Governor voluntary fulfilment expects a linked request answer; self-addressing a fabricated request is not a solution. Selection/availability/receipt paths contain broad loops; adding more rows to those loops is not the event-driven design proposed here |
| `command/service-receipt.ts` | 0133 receiving precedence, state-root/offer/special-assignment exceptions, idempotent receipt | A station/post and lawful arrival must exist. A station receipt is not an onward order; a transit stop does not transfer command |
| `world/assignments.ts`, `seats/onward-assignments.ts` | Named received regiment, command authority and onward movement | Requires a specific regiment/call and received-offer chain; not a general organisation, component or station-rule form |
| `command/organisation.ts` | Persistent formation posts and one command assignment writer | Opening a formation is not a dated received organisation paper; unknown/missing posts cannot be silently invented |
| `plans/goal.ts`, `world/doctrine.ts`, `tick/mandates.ts` | Identified dated goals, issuer/chain, received paper conditions, existing planning/approval and operations | A goal holds one regional objective/posture; exact multi-column/subregional orders cannot be silently reduced to that objective |
| `forces/lots.ts`, `forces/detachments.ts` | Stable lot/service identity, strength provenance and conserved numerical detachments | No named-company membership or arms/equipped truth. Numerical proportional splitting cannot identify a historical company |

0124/0129 still require real posts, held authority and received command
assignments. Staff carry their commander's paper. 0134 orders a subordinate
holder; it never lets a superior select the child's lots directly. 0135 keeps
only for a stated mission need, while compliance still governs. 0137 concerns
the national principal's modes; it does not make a governor or a subordinate
commander a national root. Read means always restrict the journey.

### Common paper contract [I]

Each declaration carries identity/revision, source/page, exact scope words,
issuer and authority root/post, addressee office or person, order-date
eligibility bound, report date when attested, and one of the acts below. Keep
the source report's recipient separate from the order's executing addressee:
Morgan reporting to Cameron does not order Cameron to move Morgan's regiments.
Reports, inspections, lists and departures are not implicitly acts.

Eligibility queues a choice; dispatch, paper receipt, answer, selection,
departure, physical arrival, receiving receipt and acknowledgement are separate
events. No date is a receipt. Office addressing uses 0126/0129 where lawful;
there is no universal directory of holders. Recheck authority, ownership,
service, reservations and the relevant predicate at execution and each movement
handoff. An absent identity never matches a generated lot or a similar number.
One received act may have several independently explained clause results;
unaffected valid clauses can act while a named/component clause stays a gap.

`supersedes` identifies an earlier paper/clause and its overlapping scope,
not merely a later date. Supersession takes effect on lawful receipt and
acceptance, not publication. It cancels only affected unexecuted clauses and
reservations; completed receipts remain historical facts. Already travelling
troops receive an ordinary counterorder through their actual chain. No
instant return, teleport, retroactive receipt or global cancellation occurs.
Rejected/refused revisions do not silently erase accepted instructions.

## 2. G1 — a governor's own sending order

**[H]** Morgan reports April 19/20 orders to Washington and changes the means
to steamers up the Potomac (OR III-I p.95); his April 22 paper identifies the
Albany Twenty-fifth for Washington (p.100). Sandford's December 30 report
attests April 19 sending to Washington, April 20 and 27 to Annapolis, but only
camp/readiness for other bodies; Second subsequently embarked without orders
(NY AG 1861 p.109). Earliest official readings govern disagreements under
0136; retain the later account, without letting a later table supply a date.

**Smallest addition [I]:** a declarable `governor_send` act, naming the state
root and its actual executing holder/authorised state commander, named scope
or a real call/service cohort, destination/receiving terms and read means.
On the governor's recorded sending choice it creates the same undertaking and
offer lineage as 0126, without an invented national request/response. Sandford
can execute the governor's state-chain direction only with read delegated
authority; his later federal SO89½ assignment is not that state authority.
Where delegation/post evidence is absent, retain `state_authority_missing`.

Selection is from that root's held eligible bodies, including generated lots
only under their actual call/offer obligations. A finite unnamed cohort may
be chosen by the governor's ordinary selection; it cannot be retrospectively
identified as a July roster. Alternative quantities/partitions remain the
issuer/holder's bounded choice, not a fitted number. Readiness, equipment or
service restrictions remain separate predicates, including unknowns under G8.
No second raising or identity is introduced.

Travel stays the governor's offer. Recall/reservations survive until actual
receiving receipt at the destination under 0126/0133. Means come from the
read sending terms and lawful authority, never a fallback march or 0137 union
borrowed from the President. A paper with unresolved means stays a typed gap.

**Reject:** relabelling a national request as the governor's order; enabling
pack `voluntary:true` while leaving its request-answer dependency dangling;
automatic dispatch on the attested historical departure date; a state-wide
selector; and immediate nationalisation on departure.

**Paired specifications, fictional:** **G1+** Governor Vale records sending
named Aster and Birch, actually held under his state root, by the read rail
terms to the lawful Port command. Both travel as his offer, remain his en
route, and transfer once on receipt. **G1−** change Aster's author to a state
officer with no received delegation: no Aster journey/offer; record the
authority gap. Birch's separately lawful clause remains independent. A camp
preparation clause alone never supplies embarkation authority.

**Rows:** S151 N01–N04, N08–N11, N13–N15 and the governor-request cohort rows
identified in the CSV. Some are only partly representable. N06/N12 remain
witnesses. **Tick addition:** one issuer eligibility event, one state-root
holding-bucket lookup, `k` actual selected lots and their ordinary journey/
receipt events. Waiting watches only that root/scope; no daily governor-lot
or instrument scan. Cost notation and shared infrastructure are in §10.

## 3. G2 — an intermediate station and an onward move

**[H]** Sandford's April 20/27 destination is Annapolis (NY AG p.109).
Cameron June 5 sends ready Elmira regiments to Harrisburg (OR III-I p.255);
June 14 sends Gorman there **to await further orders** (p.272). Scott's June 15
direction sends Third Michigan and other Harrisburg arrivals to Washington
(OR I-II p.690). These do not make every intermediate arrival McDowell's.

**Reuse [I]:** 0133 service receipt and a sourced station/post declaration for
Annapolis or Harrisburg. A lawful service arrival can complete a governor
offer there and become station holding. A transit leg remains transit, with
the original owner and terminal offer intact. Neither needs a new receiving
algorithm. Require the read command assignment to open the post under 0129;
no Butler/Banks substitution, assumed border or highest-rank fallback.

**Smallest route addition [I]:** an ordered list of read intermediate places
with `transit`, `receive_for_service`, or `await_further_order` at each stop.
It constrains ordinary route finding; every edge still needs permission and
capacity. A transit waypoint does not generate a receiving event. A service
receipt or wait ends that sending leg. A later received onward paper starts
a new leg from the body's actual place, carrying the same identity/service.
The list itself never invents an onward paper. Annapolis-to-Washington remains
unrecovered in these readings where no such direction is stated.

**Reject:** treating Annapolis as a spelling of Washington; assuming a later
Washington muster proves its onward order; automatically concatenating two
different papers by date; restarting an already moving body at its home;
and silently ignoring prescribed waypoints.

**Pair:** **G2+** Vale's offer of Aster terminates for service at Haven. Haven
lawfully receives it; a separately received Haven-to-Port order then sends it
from Haven. **G2−** omit the onward order: Aster stays at Haven. A mere train
passing Haven on a transit itinerary does not change owner or complete the
Port offer.

**Rows:** S149 U27 and other station/route rows in the CSV; G1's Annapolis
clauses S151 N09/N10. S149 U17/U29/U31/U33 partials also benefit, without
claiming their residuals closed. **Tick addition:** `j` itinerary entries at
declaration, one next-stop check per affected leg/arrival, station resolution
from the place index, and ordinary receipts. No global station-arrival scan.

## 4. G3 — SO89½'s state + place + receiving-command scope

**[H]** Scott's SO89½ of May 22 assigns Sandford immediate command of the
New York regiments **within the District of Columbia**, reporting to general
headquarters (OR I-LI.1 pp.388–389). It neither sends troops from New York nor
orders the crossing. The Regulations distinguish assignment from commission
and put orders through their chain (1857 Regulations pp.2–3, 57–60, as retained
in S151).

**Proposed ruling [I]: lawful as a bounded historical command assignment.**
0131 rejects state origin *alone*. For this act require the conjunction of
read state provenance, exact place, specified receiving post, national service
under the issuer's real authority, and a received assignment. This is a new
historical-intake scope, **not** another `AllocationScope` accepted by automatic
reinforcement requests. Those remain call/service/arm cohorts under 0133.

Evaluate the conjunction against the issuer's commanded national holdings at
receipt, intersected with the place/provenance index. State ownership is not
state provenance: a governor's offer still pending is excluded. Preserve
specific detached/naval duties unless this paper lawfully changes them. Scott
directs the actual intermediate holder where one exists; Sandford's receipt
opens his subordinate post and its sourced mandate under 0129. Command, not
place, changes assignment. Missing/partial District geometry is a typed gap.

No default perpetual subscription: `all ... within` captures actual qualified
holdings at execution; later newcomers require their own receipt/report and
an explicit lawful intake choice under the standing command, not an automatic
global reassignment. A paper saying present **or arriving** would explicitly
register an arrivals rule (G8). The intake remains bounded even if the text
permits all members of that intersection.

**Reject:** adding `state=NY` to ordinary requests; taking every body in the
Washington model region; taking governors' home forces or pending offers;
and using command-opening as a claim that any regiment arrived.

**Pair:** **G3+** a received superior's order gives Captain Rowan the national
Amber-state regiments physically at Port, under that superior's authority.
Only the two qualified Port regiments enter Rowan's opened command. **G3−**
move one to Haven (or retain it as an unreceived governor offer): that body
is excluded, despite the same state origin. No home-state regiment is touched.

**Rows:** S149 U36 / S151 X01 (one act, two research rows).
**Tick addition:** intersect indexed holder/place/provenance buckets once at
execution, then `k` actual assignment results; a later local intake has its
own receipt trigger. Never scan all faction lots each day.

## 5. G4 — moving the bodies a commander holds, including the crossing

**[I] Use an identified dated goal, not a new intercommand transfer kind,**
when a superior tells a holder to take/hold/relieve a representable place with
troops already lawfully under his hand. The letter belongs to the superior,
goes through the actual chain, and is answered/planned normally. It grants no
troops. Movement does not change their command. A scoped subset needs an
explicit task/axis allocation over actual held lots, not a new state selector.

**[H/I: attested]** Sandford's May 28 report states Scott's order and the
May 24 deployment; its contemporary May 26 infantry crossing / May 27 battery
sequence governs the Eighth over the December grouping (OR I-II pp.37–39;
NY AG p.110). Heintzelman's later manuscript recital identifies 48 pioneers
of the Fourteenth, not that whole regiment (OR I-II pp.40–41). Keep attested
order eligibility and report date separate. The reports' performed arrival
days never become scheduled model arrivals.

The existing goal can carry the regional purpose of a crossing. The detailed
Aqueduct/Long Bridge/Alexandria columns, precise hour, distinct bodies and
subregional positions are not one goal. Reuse supported plan-axis/waypoint
terms only where the map and read authority represent them; keep the residual
precision named. Do not flatten every column into a single forced march or
claim that a coarse regional goal implements the whole paper.

**Sandford with no post:** first receive/answer the actual SO89½ assignment
under G3/0129. Until then, `executing_post_missing`/`unopened_post`; the goal
does nothing. If no post declaration/authority evidence exists, the gap stays.
Do not put the goal on McDowell, Mansfield or Scott's own seat to bypass it.
Sandford's named federal intake does not itself give him Michigan/New Jersey
troops: their real holding/release/attached-command chain must also exist.

**Reject:** direct location edits, a May 24 calendar crossing, a transfer
whose sending/receiving commands are secretly the same holder, and invented
goals with unsupported exact deadlines/risk/transport. Generic goal-policy
defaults must remain visibly model policy, not quoted historical terms.

**Pair:** **G4+** Rowan has a received opened post, two actual regiments, and
his superior's received hold-Southbank goal with lawful crossing modes. His
accepted plan traverses the real bridge and holds there, retaining command.
**G4−** remove his received command assignment: the same eligible goal creates
no journey and moves no lots. Opening it later requires receipt/revalidation,
not backdated action.

**Rows:** S151 X02–X04, S149 U40/U49/U50/U51 and S151 P03 where their particular
terms fit; see the CSV for additional conditions/components. **Tick addition:**
one goal receipt and the existing holder's planner/operation work. Wake on
that post's changed evidence/holding, not a new daily goal/paper search.

## 6. G5 — a regional handover of one command's bodies

**[H]** GO26 creates McDowell's geographical department on May 27 (OR I-II
p.653). His May 29 report describes meeting Sandford on May 27 and inspecting
troops on May 28 (pp.653–654); his May 30 letter attests the Government's
direction to relieve Sandford (p.655). GO26 alone does not send a Washington
regiment across the Potomac.

**Smallest addition [I]:** `handover {fromCommand, toCommand, within,
scope: held_service_bodies, assignmentBasis, supersedes}`. The government's
dated GO26 assignment is the authority/date basis; the May 30 attestation
supplies the predecessor/relief interpretation, visibly [I: attested]. This
does not invent the date or wording of an additional Scott handover paper.
If a clause needs that additional paper, it remains unrecovered.

After both sides' lawful command/assignment receipts and the predecessor's
handover response, capture extant bodies actually under the named source
command, including its expressly covered subordinate formations, **and**
present in the represented region. Record per-lot inclusion/exclusion. A
specified source subtree is not every command whose headquarters is there.
Recheck source ownership and authority at commit. In-transit, untransferred
state, expired, surrendered and independently assigned bodies do not pass.
Existing live tasks require explicit adoption or ordinary counterorders;
release/remap reservations through their owners, not deletion by geography.

The bodies already at the handover place change command through the command
writer, without a fake journey. Movement does not move them to the new
headquarters. The recipient's received assignment supplies his mandate; the
handover supplies holding, never wider territory or offensive permissions.
New arrivals after the captured handover set use 0133 or a further paper.

**Reject:** a GO26 region-wide sweep, a silent post-parent change that grants
all Sandford's Washington troops too, and an organisation roster standing in
for the missing handover/arrival. No manufactured mutual consent bypasses an
actual refusal: log and report it through the ordinary government chain.

**Pair:** **G5+** the government opens Captain Cedar's Southbank department
and delivers an accepted handover of Rowan's Southbank holding. Two actual
Southbank bodies pass in place, once. **G5−** Rowan's third body is still at
Port, and a fourth Southbank body belongs to an independent command: neither
passes. No movement or force total changes for any body.

**Rows:** none of the 117 is the handover itself. S151 X06 is
`already_declared`; X08 is `evidence_only`. G5 uses the distinct relief clause
attested at p.655 with GO26, not the receipt narrative as a sending paper.
Keeping this explicit prevents a false claim of 117-row-only completeness.
**Tick addition:** one source-subtree/place intersection and `k` in-place
assignment transactions on received handover, with no territorial daily sweep.

## 7. G6 — successive received organisation

**[H]** GO1 assigns three brigades (OR I-LI.1 pp.389–390); SO5 makes Tyler's
temporary brigade from the stated present regiments (p.396). SO17/18, SO26
and GO13 successively assign brigades/divisions (pp.408–409, 411, 413–414).
Mansfield's SO140, SO167 and SO169 organise his Washington holding, not
McDowell's missing arrivals (pp.399, 409–410). Patterson's SO94/96 change five
to six companies of the Twenty-fifth Pennsylvania (pp.415–416).

**Smallest addition [I]:** a received `organise` act with explicit formation
post declarations/parents/assigned holders, memberships by read identity or
supported component, source command/subtree and scoped `supersedes` links.
Reuse persistent formations and command's assignment writer. A read command
assignment delivered/answered under 0129 opens the brigade post and its
bounded mandate. No rank appointment, roster-created troops or blanket
organisation-template activation occurs on the issue date.

Apply each membership only to a body actually held by the issuer's authorised
command/subtree. Record absent/elsewhere/other-holder/component/identity gaps
individually. An order's listing of another holder's regiment never requisitions
it (0136). No automatic future capture from a one-time organisation. An explicit
"as they arrive" clause can register G8 on real receiving events; vague
"to be increased later" supplies no membership or continuing sweep.

Each accepted successor replaces the overlapping earlier membership for bodies
it actually names and holds. Other earlier assignments survive. Replace the
specified command relation/holder without duplicating a person or assigning
the same lot twice. A named predecessor relief can change the holder of the
same persistent post; a genuinely new formation gets its own sourced post.
Moving a brigade between parents preserves its identity and subordinate lots.
Do not silently destroy its old operations; active obligations need ordinary
counterorders/replanning through the new lawful chain.

GO13's duplicate Second Maine, Thirteenth New York **Militia**, Second New
York **Volunteers**, and bracketed Pennsylvania correction remain visible
(OR I-LI.1 pp.413–414). A duplicate cannot put one lot into two brigades;
ambiguous clauses remain unapplied pending a read resolution. S151's GO1
militia links supersede S149's candidate joins as research evidence, without
rewriting either source. Generated lots cannot fill named absences.

**Reject:** an organisation that fetches a regiment from a governor; replacing
all earlier brigades by a later template; sorting conflicting duplicate
memberships and taking the last; and treating a brigade assignment as a
cross-department journey.

**Pair:** **G6+** Cedar receives order O1 assigning held Aster/Birch to Rowan's
opened brigade; accepted O2 then assigns held Aster to Elm's brigade,
superseding that membership only. Aster changes once, Birch stays with Rowan,
men/place/service unchanged. **G6−** Birch belongs to another department when
O2 lists it: record `not_held`; no transfer, new lot or phantom membership.

**Rows:** S149 U38/U39/U42–U44/U48/C45; S151 X07/M01/M02/M05–M11/P06/P08/P09/P11.
Component and identity residuals remain in the CSV. **Tick addition:** one
received organisation, `m` explicit memberships/post changes, and `k` affected
lot assignments; no daily reapplication of whole organisations.

## 8. G7 — a conditional exchange

**[H]** Scott through Townsend tells Heintzelman on June 18 that Fourth
Pennsylvania will be sent, and Seventy-first New York goes back **when Fourth
arrives**, with steamers from the Navy Yard (OR I-LI.1 p.403). Beauregard's
June 29 succession likewise distinguishes arrival, departure, replacement
and readiness (OR I-LI.2 p.151).

**Smallest addition [I]:** a received clause with a typed
`after_service_receipt {identity, receivingCommand, place}` dependency and
a separately authorised sending/held-goal consequent. Other read chains may
use an explicit `after_departure` event. This is not a generic arbitrary
boolean expression or an arrival guessed from distance/date. The paper's
Fourth-will-be-sent clause still needs a real sender/authority; it cannot
make Fourth appear. The Seventy-first clause waits even if the first cannot
execute.

Register after the executing holder accepts the paper. Test the holder's
known local receipt history once, then subscribe to that identity/place/
command's actual service-receipt event. A remote holder must receive the
ordinary report; private global truth is not his knowledge. Expected arrival,
mere passage or a different Fourth does not satisfy it. Consume the trigger
once, recheck that the outgoing body is actually held/available and that the
issuer's authority/means remain valid, then let the holder answer/execute by
ordinary compliance and retention. A condition becoming true is no order to
ignore his objection. Keep reservations attached to the outgoing lot and
release only those affected on recall, relief, expiry or supersession.

**Reject:** a scheduled June 18 swap, matching only the regiment number,
`requiresPapers` standing in for physical receipt, or automatically moving
the outgoing regiment while its replacement is travelling. No exact-time
report latency is fitted to the witness's account.

**Pair:** **G7+** accepted order C says after Aster is actually received for
service by Rowan at Southbank, return held Birch by the authorised river
route. That local receipt wakes C once; Birch then starts its real journey.
**G7−** Aster only passes through Southbank, or is expected tomorrow: C stays
waiting and Birch does not leave. Replaying the real receipt never sends it
twice.

**Rows:** S151 M03; S149 C44. S149 C24's *partial* two-First-Virginia-company
return also needs G7 plus G8 components; Bate's existing clause is not rebuilt.
**Tick addition:** one keyed subscription and one receipt-history lookup on
activation; work only on its matching receipt/report/departure and cancellation
events. No waiting-condition scan over all papers each day.

## 9. G8 — station predicates, supersession and components

**[H]** Lynchburg's June 11 hold/report rule excepts Duncan's Kentucky men
(OR I-LI.2 p.137). June 14 sends armed **and equipped arriving regiments**
to Beauregard and detains/reports unarmed regiments and companies (p.140).
June 29 explicitly modifies that rule to hold/report **all arrivals**, with
a separate Rome-Georgia-company clause to Richmond (p.151). July 8 has
Cooper's unattached-Alabama/Tenth-Georgia terms and Walker's all-Alabama terms
on the same page (p.157); July 11 concerns armed **companies**, present or
arriving, to Richmond (p.160). These scopes are not interchangeable.

**Smallest addition [I]:** a received `station_rule` with executing station
post, source/authority, explicit present/arrival coverage, text-supported
force/service/component scope, conjunction of typed predicates, and an act
(`hold_and_report`, or an existing send/offer). Link the June 29 replacement
to the June 14 rule; preserve independent clauses and exclusions. Only
qualified troops actually held/received by the station are subjects. It never
captures passing offers, visiting commands or the state's home forces.

Supported predicates use existing truths/events: actual station presence,
service term/muster where represented, current held status, received named
paper/report and a real arrival/departure/receipt. Evaluate true/false/unknown;
record missing truth as unknown, never false or a zero. **Armed and equipped
is not present model state.** Neither `lotArm` (infantry/cavalry), readiness,
equipment permille nor a positive strength proves it. June 14's send branch
and July 11's armed predicate stay `predicate_state_missing` until separately
sourced arms/equipped truth, its writer and observation path are designed.
An unconditional hold can act without that truth; report unknown fields as
unknown. Do not invent a favourable fallback destination for unknowns.

At rule receipt, evaluate only the station's indexed present set if the text
includes it; on subsequent real arrivals evaluate only arriving bodies. A
later rule affects only its received/accepted overlapping clauses; it cannot
undo a completed departure by magic. If independent papers conflict and their
relative scope/receipt precedence cannot be established, retain
`conflicting_station_terms` on the overlap rather than choose by file order.
For July 8 the common destination does not erase the attached/unattached
scope distinction or invent an intra-day historical receipt order. Compatible
clauses can coexist; explicit lawful later counterorders can resolve actual
simulation conflicts. July 11 does not revive June 14 wholesale.

The daily tabular report in June 29's paper can use **one recurring due event
per active reporting station**, aggregating that station's indexed holding
and arrival deltas. A report due every day is read reporting duty, not a daily
search for orders or lots across the world. If a full current-station table
is required, its output cost is proportional to that station's reported rows.
No invented train capacity/speed comes from the transport order (S151 C16,
OR I-LI.2 p.163).

**Components [I]:** add an optional, sourced component identity/membership
ledger under **forces**, with stable parent-service lineage, actual company
IDs (or an explicitly read set/count whose members are identified), attachment
status and separate quantity provenance. Command selects only extant held
components; forces partitions/rejoins them conserving men, stragglers, stores
and known/unknown strength; movement places the resulting containers. Do not
multiply a regiment by five/tenths, create eleven companies out of a whole
regiment's name, or let both parent and component carry the same men.
Absent membership/census remains `component_identity_missing` or
`component_quantity_missing`; unknown quantities cannot be counted out using
the current numerical detachment API. A battery separately identified in a
source remains that battery, not duplicate infantry. This is a separate
bounded state/schema extension prerequisite, not solved by a scope string.

**Reject:** armed = ready/equipped score; all troops of a state; treating a
company order as a whole-regiment order; one standing Lynchburg rule forever;
retroactive supersession by issue date; and a rule interpreter with arbitrary
pack functions or daily global condition polling.

**Pairs:** **G8a+** accepted S2 supersedes S1's send-new-arrivals clause with
hold/report. A later arrival at Haven is held and reported once. **G8a−** S2
is only issued, not received/accepted: it changes no S1 behaviour; no past
journey is cancelled. **G8b+** fictional forces truth explicitly records
Aster armed and equipped, with a received matching S1: it is eligible for the
ordinary sending choice. **G8b−** change arms truth to unknown: no sending
eligibility from that branch, even if readiness is high. Historical fixtures
cannot supply this new truth by assumption. **G8c+** actual companies A/B
have sourced membership and known conserved quantities under Rowan; send A
alone, leaving B/parent remainder intact. **G8c−** delete that membership:
no numerical fraction or whole-parent movement substitutes for A.

**Rows:** S149 C38/C41/C43; S151 C03/C04/C08–C11; all predicate/component
dependencies are individually marked in the CSV (including U37, X03/X04,
P08/P09). June 14 and July 11 remain partly unexecutable. **Tick addition:**
one local activation pass where warranted, then `a` station arrival/changed
predicate events and their `w` matching clauses; component changes cost `c`
actual components; reporting costs its actual output rows. No all-lot polling.

## 10. Event-driven cost contract and proof before a later run [I]

The lead's hosted S150 baseline is over budget: war median 97.7 ms versus
40 ms; history 96.8 ms, with 160 ms p95 also exceeded. S152's retained
exclusive request share is 26.069% of sampled CPU. These are **[M]**, from
the handoff and `s152-evidence/profile/comparison.json`/README, not timings
measured in S154. No numerical millisecond saving or added tick cost can be
honestly predicted by this design. Each proposal above states its added work;
the following is a required implementation contract, not a benchmark result.

Let `P` be declared papers, `L` lots, `e` relevant events, `k` selected/changed
lots, `m` explicit memberships, `j` route stops, `c` components and `w` only the
clauses subscribed to an event's specific keys. Build immutable paper indexes
once (`O(P log P)` sorted by eligibility/issuer/address/identity/command/place),
and reconstruct disposable State indexes once on load (`O(L + active clauses)`,
plus stable ordering). Maintain affected buckets on their owner's deltas:
holding, location, offer receipt, service expiry, post/mandate/holder changes,
reservation/task changes, component partition, and received evidence.

An eligible-date heap/cursor wakes only newly eligible papers. Command-local
ordered buckets provide qualified lots; do not maintain every possible scope
intersection. Use the smallest relevant bucket and intersect filters at the
trigger, charging its visited candidates explicitly. Family G3/G5 activation
therefore costs the actual local/source candidates even when none qualify,
not merely the successful `k`. Expiry, report duties and paper eligibility
are scheduled events, not repeated full-table date filters. Publish visited
candidates, subscriptions woken, selections, journeys, receipts and planner
calls per family in any later measurement.

Per event: keyed dispatch `O(log P + w)`, local candidate examination `O(b)`
for bucket size `b`, and stable selection `O(b log b)` where existing strength/
lot-ID choice needs it, followed by `O(k)` mutations plus existing planner,
route and communication costs. Organisation costs `O(m + k)` plus affected
local lookups; G7 lookup is keyed, not a receipt-history scan. Component
transactions cost `O(c)` plus their actual lot mutations. These are work
bounds, not a promise that all lookups are constant time. Reuse 0133/0134
request deduplication; no new daily planner calls for waiting papers.

At an idle tick none of G1–G8 visits lots or papers: only check the next due
queue head. A report-due tick may visit its own station's actual report set.
Existing broad loops in S152 are not an acceptable implementation shortcut:
new acts must enter through keyed affected-owner events, with existing APIs
used for the actual command/force/movement transaction. Building these derived
indexes is part of the extension's cost, not work attributed free to S153.
No unrelated optimisation or rewrite of existing request policy is proposed.

Indexes are disposable derivations, never a second saved truth. Command owns
received acts, one-shot consumption and assignment history; event subscription
indexes derive from those records rather than being separately saved truth;
forces owns identities/components/quantities; movement owns location/journey;
knowledge owns reports. Persist causal received-act status and trigger
consumption with command so save/resume cannot replay an exchange. Rebuild
derived queues/indexes from canonical State on resume without side effects.
Order same-day events by the existing deterministic phase/command-log order,
with strict IDs only as tie breakers for **compatible** work; ID sorting cannot
resolve a historical semantic contradiction. No wall clock, locale, random
stream, asynchronous State mutation or cached second assignment table.

### Further paired requirements on fictional fixtures

| ID | Should act/preserve | Should not act/change |
| --- | --- | --- |
| X1 | Reorder source objects; identical choices, events and State hash | Input map insertion order must not choose another regiment or resolve conflicting membership |
| X2 | Save/resume before a pending exchange; same eventual single receipt/sending as continuous play | Duplicate/replayed receipt must not send twice or repeat the offer transfer |
| X3 | Cancel/supersede one affected clause; release only its reservation and subscription | Cancellation must not free another clause's lots, erase completed receipts or teleport travelling troops |
| X4 | Unrelated lot/paper events and idle ticks visit zero G1–G8 candidates; matching event wakes its bounded bucket | No all-lot/all-paper scan, all-station loop or daily request/planner retry |
| X5 | New receiving post opens; a fresh lawful report/re-offer permits receipt of a still-present body | Post creation alone must not backfill a historical arrival or reanimate an expired lot |
| X6 | 0134 sends an ordinary scoped order to a subordinate holder, who complies subject to 0135 | Superior does not take the child's lot directly; a typed objection remains effective |
| X7 | Explicit read rail/river restriction survives offer, route and onward clause | Governor/subordinate does not inherit the national root's unrestricted modes under 0137 |

These and G1±–G8c± are **specifications, not executable tests run here**.
A later authorised build proves them cheaply first, including selectors,
missing posts, one-writer ownership, route prerequisites and idle work counts.
Only after that should its owner authorise a bounded reference measurement,
with exact baseline, commands, cost and stopping rule. S154 authorises no
capture and claims no July acceptance or hosted budget pass.

## 11. Which armies the read chains could form [I]

"Could form" here means a lawful path to receiving actual regiments and
organising them. It does not promise a complete historical roster, a size,
an arrival/battle date, or compliance. No set of these extensions alone is
sufficient to certify all four July armies from the presently read orders.

| Command | Extensions that supply a read causal path | What they do not supply |
| --- | --- | --- |
| **McDowell** | G1 sends the identified state bodies, G2 receives only at their real destination, G3 opens/intakes Sandford's qualified federal command, G4 carries the supported crossing goals, G5 hands over Sandford's actual Virginia holding under GO26/relief, G6 organises what McDowell holds; G7 carries the June 18 replacement. GO1's read named bodies give a concrete formation path (OR I-LI.1 pp.389–390; I-II pp.653–655) | Annapolis's unrecovered onward direction; missing state authority/posts/actual identities/receipts; Washington brigades' missing cross-department sending; exact crossing components/columns; GO13 identity conflicts. G6 alone brings no Washington or governor-held troops. No repair of the 16 July goal's issuer bypass/grievance is authorised |
| **Patterson** | Existing finite governor/cohort offers plus G2/G4 moves to his actual receiving command; G6 carries SO66/68/76 and SO91–105 on holdings; G8 carries the explicit arrival holds and components (OR I-LI.1 pp.397–398, 406–407, 414–416, 418). G1 also provides a state sending form where a real new undertaking is needed | Sandford's July account and Scott July 6 provide report/notice evidence (NY AG p.110; OR I-LI.1 p.412), but S152 P05 is witness-only: do not promote its departure days into four orders. Curtin's five are a finite long-term cohort, already requested; extensions neither choose a historical five nor turn short-term identities into them (OR III-I p.329). Company and missing journey/receipt gaps remain |
| **Beauregard** | Existing named national onward clauses for Cash/Sixth Louisiana/Jenkins plus real prior offers and receipts; G1/G2 for lawful governor sending/staging; G6 for GO20; G7 for June 29's replacements; G8 for station receipt/hold and exact component clauses (OR I-LI.2 pp.136, 140–141, 151; I-II pp.943–944) | G8 cannot implement June 14's armed/equipped branch without new sourced truth. Holding all June 29 arrivals sends none to Manassas. No company-to-regiment substitution, missing Virginia transfer receipt or GO20 region-wide sweep. No guaranteed field reinforcements from a conditional support notice |
| **Johnston** | Existing Bartow/Gartrell/Turney named onward clauses plus actual received holdings; G2/G4 for supported routes/held movements; G8 for supported station clauses and G6 where a real organisation paper exists (OR I-LI.2 pp.128, 135; I-II pp.897–898) | The unnamed Lynchburg pair in June 10/12 and June 21 accounts stays unidentified, as does July 13's unnamed North Carolina body (OR I-II pp.922, 945, 976–977). Richmond muster is not a Johnston destination. None of G1–G8 forces the later junction; 0131's received threat/instruction, commander's choice and actual mixed routes still govern |

S152's retained 120/140/146 holdings remain the only measurements cited:
McDowell 1/780 then zero/zero; Patterson 1/866; Johnston 2/1,560; Beauregard
zero (rule lots/men, S152 README and capture). The design has not measured a
counterfactual army or retired a `.fails` mark. The profile and hosted holds
remain with their owning lanes.

## 12. Decisions requested and closeout

For the lead:

1. Accept or revise G1/G2: declarable state sending under its actual root,
   0126 offer/0133 receipt, and explicit intermediate-leg semantics; missing
   onward papers remain gaps.
2. Rule on G3/G5's bounded intake/handover and G6's successive received
   memberships. These do not expand automatic request scope or let a
   territory/organisation seize other holdings. Keep G4 on existing goals,
   preserving unrepresentable detail and unopened-post gaps.
3. Accept G7's receipt-event dependency and G8's local station rules, while
   leaving arms/equipped truth and sourced component membership as explicit
   separate prerequisites. The CSV's residuals are not closed by grammar.
4. Route a later bounded build only after ruling, with the paired proofs and
   event-work counters before a reference run. Formal independent review is
   the lead-owned separate lane under `docs/LANES.md`, not an author review.

Findings outside my scope

S152's row classes conceal relevant distinctions outside the required 117:
GO26 is already declared, the handover attestation sits inside witness row
X08, and Sandford's July departure/receipt account P05 is witness-only. They
must be kept as distinct clauses/evidence, not reclassified wholesale to make
an army. Exact historical receipt precedence, missing onward papers, arms
truth and component census need their own evidence/build authority. S153's
performance verdict and S155's root-mode measurement remain separate.
