# S110: Receipt predicates, letter identity and bounded local authority

23 November 2026. **Proposal for the lead; not an accepted decision or a build.**
S110 only, `sprint/design`, kernel base
`60323786c16184d638047acc81e4c582356eeccf`. No code, pack, source hold,
signed item, accepted decision or coverage rule changes.

Recommend three cooperating additions: a seat's evidence of receiving a paper;
an enduring identity for each authored letter, separate from its journeys; and a
received mandate under which a commander selects bounded local actions. Keep
the existing planner, compliance, transport and execution owners. An order can
arrive and be refused; a report can arrive and be wrong; a permitted action can
remain impracticable. These are separate questions.

All design choices below are **[I]**. Historical statements cite the printed pages
of *Official Records*, series I, volume II (1880), chapter IX, read as retained
primary OCR extracts. [Page receipts](S110/source-pages.csv) identify 45 pages,
their URLs and SHA-256 hashes. No fresh scan inspection, live identity check,
missing original or historical receipt-clock reconciliation is claimed.
[Inputs](S110/inputs.json) pin the S99 research/register and current kernel.
Kernel comparisons with read-only `sprint-july` agree after line-ending
normalization; their different raw hashes are retained. S99's G identifiers
name groups of papers, not nine ready-to-load orders.

## 1. What the current kernel supplies

References here mean source files at the pinned commit, not later main.

| Read entry point | Existing behavior that the design must preserve or extend |
|---|---|
| `world/world.ts::PrincipalDoctrine`, `world/doctrine.ts::conditionalDoctrineProblems` | Offensive rows can carry `id`, date, `requiresNotice`, posture and discretion; IDs are checked within the doctrine. Proposal answers name identified earlier goals. |
| `seats/requests.ts::doctrineView`, `packages/rule-seats/src/index.ts` | `requiresNotice` looks for an already received situation report. An identified offensive is considered issued after any own goal to that post on/after its source date. The rule seat also prevents more than one answer to a post in one morning. Neither behavior gives independent successive letters. |
| `knowledge/knowledge.ts::rememberSentOrders` | Own sent letters carry message, doctrine, goal, proposal and reaffirmation correlations, but the retained goal copies are compacted by post. Merely changing the suppression comparison to `sentDoctrine` would lose old dispatch memory after a different goal replaces it. |
| `messages/transit.ts`, `tick/deliver.ts`, `tick/orders.ts` | Immutable hops keep `msgOrigin`; each leg has its own ID. Delivery, relay compliance and final addressee response differ. Message IDs are deterministically minted from day/sender/recipient/tag, with collision suffixes. |
| `seats/sender.ts::senderFor`, `tick/orders.ts::issueOrder` | The general field-order path requires a principal. `tick/support.ts` already lets commanders send a particular support request, not arbitrary local goals or transfers. |
| `plans/goal.ts`, `tick/plans.ts::draftProposal`, `planner/discretion.ts` | Postures are `hold`, `relieve`, `take`; discretion conditions are `turned` and `outmatched`. The pinned build already includes 0116's threat-grounded proposal while complying. S99's earlier implementation limit is therefore stale at this base. |
| `forces/detachments.ts`, `tick/detachments.ts`, `operations/operations.ts` | Forces, movement and command apply a detachment proposal through separate writers. Unknown strength cannot be counted out. Rejoin requires physical co-location and other existing guards. Operations own axis execution; this is not yet a bounded local sortie-and-return policy. |
| `tick/tick.ts`, `ownership.ts`, `root-state.ts` | Menus use the morning State before commands and today's deliveries. Every saved truth has one writer; replay uses logged choices. New receipts must not enable an unlogged same-day decision after the menu was built. |

Accepted 0015/0016, 0040/0041, 0052 and 0114/0116 supply the constraints.
**Local issuing needs an explicit amendment of 0052's principal-only rule and
resolution of its deferred subordinate-order question.** It cannot be presented
as an already accepted interpretation. The principal still gives goals to
people; this does not give Lincoln a division or a raid-target control. 0029's
general raid concept does not supply the missing issuing/menu/return contract.

## 2. Design A: receipt witnesses and a small doctrine prerequisite

### Contract and State

Add an optional `requiresPapers` conjunction to identified doctrine actions,
including concentration actions; keep `requiresNotice` with its current meaning.
Each conjunction has a validator-enforced pack limit and contains only positive
receipt selectors. The evaluator always uses **the acting seat's own knowledge**.
There is no selector for another person's private receipt or live State truth.

Two selectors suffice initially:

- **Named letter:** exact issuer, authored letter key and revision, intended
  receiving post, and receipt role (`relay` or `addressee`). Resolution is through
  a real dispatched origin, not through the key's presence in World.
- **Correlated received report:** report author/post, subject kind/id, report
  type and, when applicable, the exact own dispatched origin it answers. A
  selector may require an existing typed claim with its token/region and stated
  integer bound. All specified fields must match one received paper; never join
  an author from one paper to a favorable claim from another. Absent/unknown
  claims do not satisfy a bound. A named uncorrelated field dispatch may use its
  declared paper key, but only if that dispatch is actually generated and sent.

Proposed saved addition: `SeatKnowledge.knownPaperReceipts`, an immutable list
of minimal **receipt witnesses**, written only by `knowledge`. Each witness
retains the origin, actual recipient/person and receiving post, role, arrival
day, authored identity if present, and just the delivered typed enclosure needed
by an active selector. It records **what this recipient received**, after any
filtering; it does not expose `msgTruth` or other recipients. Reports keep their
ordinary `KnownReport`; this witness is its durable correlation excerpt, not a
second report-truth store. Orders acquire a witness at an actual hop arrival,
before the distinct compliance disposition is applied. Rejection/return at an
invalid destination creates a delivery-failure report, not a target receipt.

`messages` continues owning transit. Its delivery path proposes a receipt delta;
only `knowledge` files it. Duplicate forwarding/replay of the same
origin/recipient/role cannot duplicate the witness. A forwarded copy received by
Scott cannot satisfy Patterson's receipt. A relay's sight cannot satisfy an
addressee requirement. No witness is constructed from a historical date, a
sent-letter copy, a response in hidden `orderResponses`, or disappearance from
transit.

Readiness and its explanation are **Derived**, recomputed in `seats/requests`
from World selectors and witnesses. Return the matched origin/claim and receipt
day, or a typed missing-paper/field reason; do not save a `ready` boolean. A
receipt proves possession, not obedience or truth. Authority selector users
also require the enacted grant described in Design C. Reports of joined troops
are evidence to the commander; actual allocation/movement still checks the
resource owners when execution is proposed.

Witness retention is bounded by declared paper keys/revisions and live
correlations. Keep the earliest qualifying witness for an immutable named
receipt; retain latest applicable claim witnesses with the normal report
supersession order and the evidence for every live grant/mission/reply. Do not
let an older favorable resource report override a later contradictory report of
the same subject. Once no doctrine, active authority, pending reply or operation
can reference a runtime witness, prune it. Ordinary report ageing must not make
a one-time grant or an already met identity prerequisite disappear. Only the
identity survives indefinitely for the finite authored-key set; stale claims
must still meet their normal template age/freshness rules at a new decision.

The first evaluation after today's arrivals is the **next morning's menu**.
Delivery may enact a received order in its existing tick phase, but it does not
rerun rule seats. `fromDate` remains an earliest source bound, never sufficient
evidence. No generalized scripts, negation, arbitrary expressions or new threat
conditions enter this predicate language.

### Proposed tests, not executed tests

**A1:** same world truth, with/without the exact delivered letter: ready only in
the first; move its arrival and readiness moves to the next morning.
**A2:** wrong revision, author, post, report subject, role, other seat, merely
sent paper and known undelivered paper each fail closed. A duplicate delivery is
idempotent. **A3:** conjunction needs every witness; split claims across two
papers fail; a false received alarm may satisfy a report selector without
changing world truth. **A4:** ordinary report pruning retains referenced receipt
identity; stale/corrected resource claims cannot enable a new action; released
runtime references prune. **A5:** no report of evacuation means no conditional
evacuation branch; silence is not evidence of an empty region. Existing notice
gates and unopted-in packs remain unchanged. **A6:** save/resume and full replay
produce identical witnesses, menu reasons and daily hashes.

Rejected: extend `requiresNotice` to accept arbitrary situation IDs or date flags;
inspect other seats or global responses; assume issue equals receipt; retain
every message forever; use receipt as permission or as proof a report is true;
invent a Newton report when the observer/report grammar has no producer for it.

## 3. Design B: authored letters survive their individual dispatches

### Contract and State

Use three identities: `(issuer doctrine namespace, letter key, revision)` for
one authored instruction; `MessageId`/`msgOrigin` for a particular dispatch;
hop ID for its current leg. A letter has sender role/post, addressee post,
source citation, earliest bound and typed content. Revisions must be explicitly
declared; a different historical paper gets another key even with identical
goal terms. G04 alone contains several such papers. Acknowledgments answer a
particular dispatch, not whichever letter is currently last at that post.

Proposed addition under `SeatKnowledge`: `knownDoctrineDispatches`, written
only by `knowledge` alongside successful first insertion into transit. Key it
by the full authored identity, retaining the origin/day and any explicit own
supersession decision. This finite ledger survives the existing compacting of
`knownSentOrders`. Readiness, already-dispatched and own-policy-suppressed
remain separate derived states. A rejected command records no dispatch. A
withheld or lost dispatched paper stays dispatched; it does not automatically
become a new letter every morning. A sourced repeat or deliberate retry has a
new dispatch linked to its predecessor and a logged authorization; no automatic
retry cadence is introduced here.

Extend `OrderBody`/relevant report envelopes and log commands with the complete
authored identity and optional explicit `supersedes`/`reaffirms` references.
Keep existing `orderDoctrine`/`sentDoctrine` as compatible keys for legacy rows;
identified rows opt into the new ledger. Validation binds the issuing seat,
target, revision and actual enclosure to the declared letter: attaching an
authentic key to altered terms is rejected. A manual variation is a new own
instruction, not a sourced original that can open the original's receipt gate.
Deterministic dispatch tags include
the full stable letter identity before the existing length-hashing rule, so two
same-day same-post papers do not depend on collision-suffix order. A deliberate
retry includes its stable attempt correlation. Adding an unrelated letter must
not renumber either paper or shift their courier streams.

Independent identity **does not** mean all earlier instructions remain active.
At the sender, an explicit replacement may suppress an unsent automatic row;
an unrelated goal to that post may not silently consume it. At the addressee,
replacement changes the goal or authority only after actual receipt and the
ordinary applicable compliance/conflict treatment. A newer sent letter cannot
cancel an older in-flight message by omniscience. A late older revision must
not restore authority after its received revocation or restore a replaced
same-family goal; retain its receipt and answer, mark its instruction content
obsolete. Unrelated letters and bypass
conflicts continue through the existing resolver; no universal newest-date-win
rule replaces 0040. Explicit same-family revision order is separate from that
resolver and needs the lead's ruling with this proposal.

Keep the existing one-action-per-post morning constraint for field goals.
Sort ready letters by declared dependency/revision order, then earliest bound
and stable key. Send one and keep the others pending; two different dependent
papers may therefore go on later mornings. Administrative enclosures may share
a dispatch only if explicitly authored together. Do not collapse distinct
papers or promise sub-day historical fidelity to avoid this daily scheduling
limit. Grant/revoke packets share the same addressing and identity contract.

### Proposed tests

**B1:** two same-post letters, including identical terms and same source day,
each dispatch exactly once; an unrelated manual goal consumes neither.
**B2:** send B after A, prune A's ordinary goal copy, then advance days and
save/resume: A never reissues. **B3:** duplicate key/revision, missing namespace,
bad supersession target and cyclic dependencies are validator errors.
**B4:** reordered arrival, lost replacement and refusal cannot retroactively
change the recipient's course; received revocation followed by an older grant
cannot reactivate it. **B5:** plan/proposal/reaffirmation replies correlate to
the original dispatch across replacement; old replies never authorize a new
revision. **B6:** unrelated message insertion preserves both IDs and their
latencies; order of simultaneous ready rows and replay stays deterministic.

Rejected: the existing post/date suppression for new identified rows; matching
by text/date/last goal alone; replacing compacted goal copies with an unbounded
archive; changing IDs on every relay; canceling transit at send time; treating
reaffirmation, a new letter and a retry as interchangeable; unconditional
automatic resend or silently relaxing one action per post per morning.

## 4. Design C: received mandates and kernel-built local choices

### Authority, issuers and owners

Add a typed **mandate enclosure** to ordinary orders: mission key/revision,
granting issuer/post, receiving holder/post, parent grant/dispatch, allowed
actions, recipient subtree, spatial envelope, permitted movement modes, force
ceiling and required retained guard, expiry/termination, reporting duties and
whether/how it may be delegated. Every bound is explicit pack data or inherited
by intersection; omitted authority denies the action. No default unlimited
force, geography, duration, onward delegation or bypass. Actual force identities
and unavailable quantities remain the force owner's concern.

Proposed new `State.authorityByPost`, sole writer `command`, records enacted
mandates and their received amendments/revocations, including grantee person,
post, originating receipt and compliance disposition. Delivery proposes the
change only after valid addressing and the holder's answer; a refusal enacts
nothing, a qualified undertaking enacts only the supported accepted part.
`proxy` still owns the response, `knowledge` the person's receipt. These are
different truths, not duplicate readiness flags. A grant is holder-bound in
this first design: replacement, departure, capture or a broken actual command
chain prevents further use; a successor needs a new received grant. The sender
learns of such changes through normal reports. A superior's revocation becomes
known and operative locally on receipt, never globally at issue.

Use the existing principal as root of authority. To represent Scott issuing
rather than silently crediting Lincoln with his letters, the pack needs a
reviewed root grant to a declared general-in-chief post/holder, permitting the
specified subordinate mission grants. Once received, Scott can grant a narrower
mission to Patterson; Patterson can send narrower task orders or a limited
sortie grant to Wallace **only where the upstream grant explicitly allows it**.
Porter/Townsend signatures on behalf of their generals remain provenance;
authorization and compliance use the responsible commanding issuer. The
sources for each of these historical permissions and the root establishment
must be read and approved in the later data build. S110 does not conjure the
root grant on May 24 or claim a recovered presidential instrument.

`seats` derives a `local-action` menu from that person's received papers,
enacted mandate and planner candidates. Choices name a candidate ID and the
grant, not arbitrary targets/amounts. `packages/rule-seats` picks a consistent
candidate; the typed choice is logged. Extend the validated dispatch path with
a separate local-authority check, retaining the principal path and price rules.
Validate again at execution for actual holder, side, chain, allocations and
grant scope; refuse stale choices without exposing hidden reasons in menus.
Force ceilings apply across all live child grants, allocations and sorties;
two siblings cannot each spend the same parent allowance. Command owns the
authority commitments, while forces/command validate exclusive actual resource
allocation. A child grant is permission, never a duplicate troop balance.
No commander can appoint, levy, move somebody else's forces, issue political
verbs or create a peer's compulsory support merely by possessing a local menu.
Allow only explicit authorized field goals, bounded allocations/transfers
within the subtree and mission grants. A peer still receives an ordinary
support request and may decline. External/cross-department allocations require
a separately authorized superior action.

Each subordinate paper traverses the chain below its real issuer with existing
latency, relay response, destination validation and declared response reports.
For own-force initiation, a logged selection enters the same goal/compliance/
planning path with the received superior as authority basis; it is a local
decision, not a forged incoming Scott/Patterson letter. No artificial courier
journey from Wallace to himself. The principal receives a report later, not a
live feed. Local planning approval is only what the grant explicitly permits;
otherwise its plan waits for ordinary superior review and received approval.

### A limited sortie, including its return

Add a finite mandate mode `limited_sortie`, distinct from permanent `take`.
The candidate must be prompted by the commander's own received report of an
armed hostile gathering and satisfy the grant's target/geographic limits.
Report content requires a genuine producer: ordinary reconnaissance/observer
mechanisms must supply the gathering, not a June 12 rule or the source's number.
Do not extend this to civilians, searches, arrests, protected people or rewards
for such treatment. Those parts of p.668 and Wallace's report are outside this
military design and remain with the sensitive-history gate.

The planner compares a bounded set of permitted detachment candidates, using
existing route, supply, enemy-estimate and risk terms. Candidate sizes come from
explicit pack policy limits and available force lots, never fitting the reported
500 raiders. Require a defensible retained guard, authorized commitment ceiling,
credible outward/return route and stores for the estimated round trip. These
are typed grounds in the menu. No safe candidate, missing safety bounds or
unknown detachable strength means no sortie. Existing rules have no complete
safe-sortie policy, so its candidate limit, retained-guard bound and safety
acceptance rule need a **new reviewed pack rule**, with no numeric value chosen
by S110. Existing weights/traits/thresholds remain unchanged.

`plans` owns the chosen mission's objective, home/return goal, committed subset,
authority basis and approval; `operations` extends its record with sortie stage
(`outbound`, `action`, `returning`, `closed`) and recorded transition reason.
It proposes a typed sortie detachment through the existing three-owner
detachment coordinator, which needs an explicit extension beyond its current
garrison/landing cases. `forces` conserves known men/lots/stores, `command`
assigns the detachment, `movement` alone places/marches it. Unknown parent
strength stays unknown and blocks a numeric split; no seed of 500 or 800 is
smuggled in through this menu.

After the bounded action ends, or the commander judges continuation unsafe,
the mission switches to its already authorized return goal. The planner tests
return feasibility at each operation boundary from **his own picture**: no
known usable return route, insufficient estimated stores, or a known threat on
the return line beyond the existing planner's accepted risk produces a typed
`return_line_unsafe` sortie reason. This is a finite sortie decision, **not a
new general `turned`/`outmatched` synonym**. It requires a design ruling; it
does not yet express every geographic vulnerability Wallace describes on p.124.
Safety limits favor returning over holding captured ground. If return itself
is blocked, the operation records the blockage and uses ordinary survival/
combat behavior and reporting; it never teleports or guarantees safe arrival.

The action's completion does not install a permanent garrison or award a
separate durable occupation beyond ordinary control rules. It must not become
a hidden permanent `take`. Losses, obstruction and capture can defeat the raid.
Closing requires actual return and successful rejoin, or a recorded terminal
loss/stand-alone outcome from the existing owners. A parent that moved cannot
receive men remotely. Keep the mission active while return/rejoin is unresolved.
Permit at most one active sortie per grant and require a new qualifying
observation after closure; reusing the same receipt cannot raid every morning.
This consumed observation is part of the operation's historical mission basis,
not a new global report-consumed flag. Operation pruning keeps a compact
terminal mission basis per live mandate family until that triggering report is
stale and cannot qualify again; an older or equal observation cannot restart
it after the full operation is pruned. A grant revision cannot reset this
consumption history. An amended/revoked grant stops new
actions; an active sortie returns under its existing recovery authority, unless
a received lawful replacement orders another recoverable course. No revocation
deletes men, marches or reports.

### Proposed tests

**C1:** identical local picture with grant delivered/withheld/refused/expired:
only the enacted in-scope grant offers the local choice. **C2:** Patterson's
child grant is an intersection; attempts to widen geography, force, expiry,
recipients, movement modes or delegation fail. Unknown/stale holder, broken
chain and cross-side cases cannot exercise it. **C3:** signed-on-behalf local
order retains Patterson as issuer and passes real relays; Scott/Patterson/
Wallace own choices and later reports remain separately attributable.
**C4:** no gathering report, no safe detachment, unknown strength or inadequate
retained guard means no raid; test a safe candidate beside a rejected unsafe
one and inspect its reasons. **C5:** split/rejoin conserves lots, men and stores
after losses; parent movement, same-day rejoin, failed return and capture have
explicit outcomes; no duplicate rejoin or permanent garrison.
**C6:** completion and a separate received return-line threat both cause the
return stage; unchanged truth with different reports changes judgment only,
never physical transport. Missing threat does not invent Wallace's explanation.
**C7:** revoke in transit versus revoke received; late old grant; active sortie
recovery; new report required before another sortie. **C8:** unauthorized raw
orders, privilege escalation and invented candidate IDs fail the command
boundary. Local choice, compliance refusal, plan review and ordinary return
reports replay without re-asking a seat; human/AI/rule seats use the same menu.

Rejected: make every commander a principal; silently remove `not_a_principal`;
attribute every action to Lincoln; use `delegate` on a situation as operational
authority; let a superior script a commander's route or raid; fabricate an
incoming self-letter; treat `support` as a general grant; commit the whole
regiment; permanent capture of Romney; a calendar return or `outmatched` used
for every reason to retire; invent strength or safety constants to reproduce
the source; implement protected treatment through a raid reward.

## 5. S99 G01–G09 under the proposal

The [chain table](S110/chain.csv) is the same nine-group crosswalk in compact
form. The following is a **conditional walkthrough**, not a claim that these
papers, posts, reports or forces exist in the current pack. `A`/`B`/`C` refer to
the designs above. Historical paper dates below are provenance/earliest bounds;
the model supplies its own dispatch, receipt and execution days.

| Group | Who receives what, then acts under A/B/C | What remains unimplemented or unproved; source read |
|---|---|---|
| **G01: gathering** | Scott's May 24 direction reaches Patterson (A). Under a reviewed root/subordinate grant (C), Patterson issues distinct Keim concentration/task papers (B); allocations/joining then produce ordinary readiness reports. | No date-only concentration, conjured force or assumed root-grant receipt. Detailed transport/depot and subordinate roster work remains. Patterson acknowledges May 24 telegrams on p.652; May 29 enclosure gives preparation and wait terms, pp.658–659. |
| **G02: approach** | Scott receives Patterson's submitted turning plan; Patterson receives the separate restraint/approval papers and reports of indispensable troops joining. Local task letters move subordinate commands toward Williamsport; each has its own identity and delivery. | A cannot turn an unproduced readiness report into joined troops; no fixed timer. A regional `take` may march, but cannot distinguish all camps/fords inside one region. Plan and receipt correspondence pp.657–661; reinforcement restraint p.665; approval pp.670–671; dispositions p.679. |
| **G03: crossing** | Patterson/Cadwalader receive actual reconnaissance and applicable authority. Separate Newton and Cadwalader letters remain separate (B); local crossing choices require their own reported evacuation/safety grounds (A/C), then ordinary planning and marching. | No evacuation report means no evacuation-conditioned branch. No invented enemy-vacated claim or producer. The earlier turning mission must be considered on its own authority and believed enemy; later permission cannot cause earlier evacuation. Heights demonstration and cutting communications remain additional grammar. pp.685–687,691–693. |
| **G04: recall and recross** | Scott's recall and reiterated limits are distinct B letters; Patterson receives them, answers, and issues his own allocations/withdrawal papers. Cadwalader and each lower addressee must receive theirs; movement owners execute. | Scott's first recall is conditional on no pursuit; his paper is not a direct instant recross order. Exact named regulars/Rhode Islanders and company selection need allocation representation; no `amount:999` or subtraction of all volunteers. pp.691–696,701. |
| **G05: alarm and delay** | A received Cadwalader alarm can drive Patterson's own bounded defense choices and new local task letters. If he retains troops contrary to received recall, keep the conflicting response and request for approval; do not invent prior permission. Each failed downstream dispatch remains unreceived. | A permits response to a false alarm; it does not establish Johnston's location or automatically justify delay. Patterson's all-back report and Cadwalader's overnight account remain separate claims. pp.697–704. |
| **G06: qualified retention** | Scott receives alarm/return papers and sends a new letter; Patterson's receipt enacts only supported terms, with the later split-cavalry instruction separately identified. It changes future authorized action, not completed transfers. | Scott's June 18 9.15 p.m. letter is explicitly received June 19 12.15 p.m., pp.703,707; later two-company terms p.708 have no receipt clock here. Burnside's own arrival report pp.715–716 is not proof of every regular's return. Numeric company representation remains open. |
| **G07: Cumberland/Romney** | Patterson's June 6 bounded authority reaches Wallace; Wallace receives local gathering intelligence and chooses a limited-sortie candidate, safe detachment, outward operation and return under C. Later relief, fallback and June 21/24 recall letters are distinct B papers and still require receipt. | No recovered target-specific Patterson order is claimed. Standing terms p.668; Wallace's June 11 dispatch acknowledgment p.676, linked to the sixth by p.105. Wallace reports about 500 raiders, pp.123–124, not a production strength input. His claimed approval lacks its original/time. Exact town route, safety reading, partial force and nonmilitary treatment remain unresolved; recalls pp.712,717 prove issue, not Wallace's arrival. |
| **G08: later proposals** | Scott's request for a plan reaches Patterson, who submits a planner-produced proposal without executing an unapproved sweep. Received bridge-company refusal can inform his next choice only if modeled as a genuine report/input; B preserves each paper and subsequent answer. | No new generic proposal-at-any-difference trigger beyond 0114/0116. Explicit solicited-plan content, depot relocation, bridge/whole-line duties and material prerequisites need their own grammar/owners. June 19 refusal pp.707–708; June 20 request p.709; acknowledgment/proposal pp.711–712; June 23 renewed proposal p.717. No read pre-June-25 acceptance of the whole scheme. |
| **G09: Johnston's picture** | Union actions create observable approaches/raid/crossing/return; scouts or other actual reporting channels deliver only what Johnston can learn. Existing 0116 may generate his proposal from `turned`/`outmatched`; a correlated government reply grants discretion only on receipt. | Never gate Johnston on Union private mail or inject enemy estimates from the record. The later report places Romney intelligence on June 13 and crossing intelligence on June 16, after its stated June 15 departure, pp.471–472. Contemporary acknowledgment pp.929–930 and June 17 report/reply p.934 preserve timing differences. Neither earlier withdrawal nor July junction is guaranteed or measured here. |

The geographic limitations are representation findings [I], not historical
arrivals: the current `packs/union-1861/source/world/regions.csv` combines
Hagerstown/Cumberland/Williamsport in `western_maryland`, and
Winchester/Martinsburg in `lower_valley`; `potomac_highlands` includes Romney.
Local scope may use existing regions/edges only. Do not claim two locations
inside a region have distinct observed positions, banks, routes or raid control.
Finer locations need a separate map decision. In particular, G07 cannot claim
historical raid fidelity from two coarse region endpoints.

## 6. Build boundaries and acceptance

Recommend one lead ruling covering A/B and a narrowly bounded amendment for C,
with the limited-sortie semantics, safety-policy ownership and obsolete-revision
rule explicitly named. These are proposals, not new numbered accepted records.
Their build order is **B identity → A receipt predicates → C authority and
local menus → C sortie lifecycle → sourced G-chain data**. Implementing A
before durable B identity would leave an unstable prerequisite. Do not add S109
pushback mechanisms in this lane.

| Owner for later build | Exact responsibility and checks |
|---|---|
| Command/seat lane (1.12) | Root/child grant validation and sole `command` writer of `authorityByPost`; new local menu/command validation; receipt-bound revocation, holder and scope tests C1–C3/C7–C8. Amend 0052 before enabling it. |
| Knowledge/messages lane | `knownPaperReceipts`, `knownDoctrineDispatches`, immutable envelope identities, witnessed delivery and bounded pruning; tests A1–A6/B1–B6. Never write command authority or plans. |
| Planner/plans/operations lane (1.2/1.4) | Bounded safe candidates, local approval basis, sortie/return lifecycle, typed failed return and no permanent garrison; C4–C6/C8. Retain 0114/0116 and existing response terms. |
| Forces/movement/command owners | Extend the coordinated detachment proposal, preserve lots/stores/unknowns and validate actual allocation/rejoin; C4–C5. No planner writes to their State. |
| Pack-format/research lane | Schema, references, finite selector limits, grants/source pages, producer-backed reports and resolved posts. Reject absent producers, cyclic correspondence/grants, invalid revisions and widening delegation. Gate review owns protected content. |
| CLI/log/serialization and QA | Project only own receipt/authority explanations; log candidate/grant/dispatch identities, reject forged choices; replay/resume/deep-freeze/ownership/import-boundary tests and save fixture generation after actual State changes. |

All new saved fields and immutable records require their `ownership.ts`
classification and FOUNDATION section 10 row **in the future implementation**;
no canon synchronization is done for a proposal. Readiness, legal options and
active effective bounds are Derived, not second saved truths. State constructors
initialize only the writer-owned collections. The save version/migration policy
must be checked at that build; an older save gets empty collections, never
invented historical receipts/grants. Without receipt history it cannot retroactively
claim to have issued an identified letter or received authority. For pre-extension
logs, keep the legacy doctrine path or require a fresh run; do not silently replay
old commands under new authority rules. No public compatibility promise is made.

Before a later expensive reference campaign: pass the fictional testbed matrix
above, validate actual root cause/rosters/report producers, cheaply show G01–G03
and G07 can open and a lost-paper control stays closed, then G04–G06 recall can
terminate the threat. Only an authorized build may run one reference comparison,
attribute every changed band/coverage row/strength origin, and run the binding
1A check on its agreed plan. Passing these designs or unit tests grants no
coverage, strength, timing or 1A acceptance credit.

For S110 itself, validation is document/reference checks, byte preservation and
the actual ordinary commit hook. Existing S108 evidence is left intact; no new
simulation, timing or done-check verdict is claimed. Whole-branch standing and
gate review remain deferred under 0106/0107. Nothing is signed or cleared for main.

## Findings outside my scope

Implementation, S109, root historical authority instruments and post structure,
unproduced reconnaissance/resource reports, exact named-contingent allocation,
sub-day and map refinement, bridge/depot/demonstration grammar, safe-sortie policy
numbers, recovered scout/approval originals, reconciliation of conflicting
receipt/recrossing clocks, protected-content placement, new measurement,
whole-branch review/signatures, integration, release and pushing remain open.
