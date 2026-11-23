# S104: undertakings with typed reservations

2026-11-23. **Proposal for the lead, unsigned.** S104 only, on
`sprint/pushback`, from `ef689569b0a036c63a527aaa9d1b3bcafcb31255`.
No code, pack, register eligibility, score, band, weight or accepted decision
changes. Decisions 0111, 0112 and 0113 were read in the main checkout; the
older decision chain in this research branch is not a claim that they are
unaccepted. The sprint continues under 0106/0107.

**Recommend making the undertaking and its qualifications separate parts of
one response.** Willingness decides whether the actor undertakes a particular
request. Typed reservations say what he contests, requests or makes a
condition of that undertaking. Project `comply_with_reservations` from their
combination, rather than from proximity to zero. A protest need not stop
action; a condition may stop one stage without stopping preparation.

This fixes a representational limitation. It does not establish that every
negative willingness in S102 was wrong or would become positive. In
particular, merely attaching a reservation to a negative response cannot
turn it into compliance.

## Evidence and its limits

[The reply inventory](S104/replies.md) accounts for all **27 S101/S102
governor dispositions**, including their non-governor/non-call placeholders,
and **25 military/naval officer candidate rows** in the S88 registers. It
keeps plain compliance, qualified compliance, objection and refusal distinct,
with separate dispositions where no such reply is established. Those extra
dispositions prevent a question, an order, a situation report or an unread
reply from being made into a historical refusal. Forms are interpretations
**[I]** of stated acts, not findings about personality or private motive.
The accepted register classifications and exclusions remain unchanged.

Examples explaining the representation:

- Letcher undertakes to raise the reserve while protesting the President's
  appointment power. The objection is to the appointment clause, not to
  raising the men (OR IV-I pp.412,419–420).
- Brown undertakes the reserve but asks who will receive and support it
  before ordering companies into camp. He protests appointments and cannot
  promise arms; the issuer expressly does **not** require arms for reserve
  acceptance. Cavalry is a separate armed demand (OR IV-I pp.412,421–422).
- Harris says he lacks authority to order troops out of Tennessee yet says
  the government can rely on three regiments for Lynchburg. The authority
  claim and the voluntary undertaking coexist; neither establishes a
  personal value or an arms shortfall (OR IV-I pp.232–233).
- Holmes reports Bate dispatched as directed while disputing force size and
  the expedition's prospects. No levy reduction or waiting condition follows
  from that protest (OR I-II p.959).
- Alabama's ability to furnish the reserve and cavalry cannot stand for
  acceptance of the separate armed pair. The latter answer reports inability;
  its two arms statements conflict, so no exact stock is inferred
  (OR IV-I pp.412,416,420).

These are replies within a government's own command/negotiating relation.
The six hostile April answers to Lincoln remain Union-issued observations,
separately inventoried. Their speakers call the purpose coercion or
subjugation and refuse troops; that is their characterization, not an
amendment to Lincoln's stated purpose (OR III-I pp.68,70,72,76,81–83,91–92,99).
Neither faction nor later allegiance changes the issuing side under 0111.
Hicks's temporary inability is separately identified, not assigned an enemy
allegiance (OR I-II p.581).

### What the S102 numbers establish

Read-only S102 `governor-answers.json`, at `sprint/callterms`'s recorded
delivery, supplies these **model diagnostics**, not historical measurements:

| Historical row | S102 willingness / actual rung | Consequence for this proposal |
| --- | --- | --- |
| C01, C05, C07, C12, U39 | 127, 213, 67, 104, 51 / comply | A positive willingness must be able to carry named qualifications. |
| C02 | −73 / object | A reservation label alone cannot supply an undertaking. |
| C03 April 22 absolute call | −56 / object | Other Louisiana calls' positive replies cannot cover this demand. |
| C10 reserve / cavalry | −296 / −96, both object | Different demands and reasons; do not borrow an acceptance. |
| C11 extra / reserve | −83 / −283, both object | Different demands, support and credit questions; no automatic rescue. |
| C09 | 7 / reservations, **on the reserve** | Cannot match the historical additional armed-pair answer. |

The July pack read in `sprint-july` has `reservationsAt=0`, `complyAt=10`,
`exceedAt=450`; value weight 200. The generic kernel defaults differ, so
the pack, not the defaults, establishes the reported 0–9 window. No number
in that rules object is changed here. S102's historical qualifications and
issuer clauses are separate records; its call capacity contributions stay
zero. This proposal supplies no missing inventories or historical character
centres. Input paths and hashes are in [the receipt](S104/inputs.json).

The retained contributions make the residual concrete: C02 has **no negative
value term to remove**; temperament −118 plus deterrence 45 gives −73. C03's
absolute call has −96 plus 40 = −56. Even a genuinely changed settlement
removing C10 reserve's −200 value term would leave −118 + 22 = −96; removing
C11 reserve's −200 would leave −96 + 13 = −83. Their other terms are zero
in S102. These are arithmetic illustrations from the recorded contributions,
not an authorized subtraction or a new willingness measurement. None is
solved by declaring that a protest itself neutralizes an offense. A later
design/build must examine why a given task's existing temperament reading
produces those answers, using evidence rather than fitting boldness. C03 is
included in that residual even though the lead's illustrative list omits it.

## One response representation [I]

Retain the immutable received paper and give every clause a stable identifier
within its call instance/revision. Different revisions never share an
identity merely because they call for the same number of men. A response has:

| Part | Contents |
| --- | --- |
| Identity | issuing principal/side, actor, office/role, order, received revision, bounded matter and response identity |
| Undertaking | the specific work accepted; what can begin now; required stages; declared versus actual undertaking |
| Willingness | original willingness, all original contributions/reasons, evidence presence, and, if a concrete alternative is evaluated, its separate contributions and exact changes |
| Reservations | zero or more typed records, each naming affected clause(s), grounds, requested treatment, execution effect and provenance |
| Execution | pending/active/fulfilled/failed status of stages, actual forces/actions and fulfilment evidence; never an invented immediate delivery |

A reservation's **subject type** is one of purpose, service term/consent,
appointments, organisation/integrity, authority, muster/acceptance,
destination/movement, arms/equipment, transport, subsistence/camp support,
timing, or tactical/course judgment. Reuse S102 clause kinds where possible;
do not add an untyped miscellaneous penalty. A report on an omitted topic
may reference an explicit `unspecified` slot in that received paper. It
cannot retroactively insert the actor's preferred wording into the issuer's
paper. A missing original request is `unknown`, not `unspecified`.

Each reservation records independently:

- **Grounds:** an offended held value linked to that clause, an evidenced
  judgment about the course, a recorded institutional/contractual condition,
  a dated received resource/support report, or an information request.
  A negative aggregate by itself is not a reservation. Unknown cast judgments
  create no grounds (0113); a structural condition does not prove a trait.
- **Requested treatment:** keep the clause but protest; clarify it; request
  support; or propose a specific amendment/substitution. The actor's reading
  and a claim about legal authority are marked as such, not certified law.
- **Effect:** `statement` (no execution change), `request` (no automatic
  wait), `gate` (named prerequisite blocks a named stage), or `offer`
  (changed undertaking awaits the named party's acceptance). These are not
  increasing levels of unwillingness. A record can protest appointments and
  separately gate camp entry on support.
- **State of knowledge:** observed, reported, inferred, or unknown; paper/page
  provenance and the relevant received message. Dates describe evidence and
  receipt, never a lookup that forces the historical rung.

An actual execution restriction must remain visible even when the actor
hides his motive. Keep actual and declared reservations as well as rungs.
An uncandid actor may conceal a protest or declare a misleading undertaking;
that requires evidence under 0113. Hidden conditions cannot create received
consent, public acceptance or historical matching credit.

### Selecting an undertaking and projecting its rung [I]

1. Read only terms and information actually in hand. Preserve existing
   conflict-of-orders resolution. Enumerate the unchanged request and any
   **concrete**, admissible qualified undertaking; do not enumerate arbitrary
   subsets just to find a positive score. Existing authoring/planning grammar
   bounds candidates. If that grammar cannot express one, record a gap.
2. Evaluate each candidate with the same evidence mask and existing integer
   arithmetic/weights. Keep the original evaluation even if another is chosen.
   The acceptance boundary is the existing `reservationsAt` (0 in the July
   pack). A negative score is not overridden by a historical undertaking.
   For amended candidates change only contributions whose actual referent
   changed. A protest against Presidential appointment does not remove its
   value cost while the President still appoints; an unreceived support
   promise does not fill a resource balance. A changed appointment settlement
   may change the corresponding term after acceptance, with its cause shown.
3. Prefer the original request when it has nonnegative willingness, with all
   applicable reservations attached. A material prerequisite can still gate
   its execution. Otherwise choose the highest-willingness admissible
   alternative with nonnegative willingness, with fewer changed clauses and
   then stable clause/candidate IDs breaking ties. An amendment outside the
   actor's authority is an offer pending acceptance, never unilateral full
   compliance with the original. No invented quota/term/cast bonus enters
   the candidate score.
4. With an actual undertaking: empty reservations project `comply`; nonempty
   actual reservations project `comply_with_reservations`, regardless of
   whether willingness is 7, 67 or 213. `exceed` keeps its existing high
   willingness/held-value/shortfall conditions only for an unqualified
   undertaking; extra work on a qualified undertaking is a separate execution
   fact, not a second response or coverage credit. Retire the numeric
   comply-versus-reserve split in the proposed projection, not by widening it.
5. Without an acceptable undertaking, keep the existing negative-willingness
   object/refuse/covert-delay/reinterpret distinctions, thresholds and
   evidence rules. Counterproposals and named terms remain visible but are
   not reservations **on compliance**. A question alone is not an undertaking.
   For a historical inability/refusal report, describe the refusal as the
   record does; do not infer the model's protected-standing or candour values.

This is a recommended deterministic rule, not an implemented resolver. It
does not claim that current inputs generate the historical candidate or its
historical score. The tables below demonstrate what the representation can
say; negative S102 examples explicitly remain unresolved where no supported
alternative has been evaluated. No weight, new numerical tolerance, hidden
trait, exception by actor or matching flag is selected from a register row.

### What is raised or done [I]

| Reservation effect | Consequence |
| --- | --- |
| Statement | Carry out the requested work; publish the protest and its clause. No strength discount or delay token. Holmes/Bate is the control (OR I-II p.959). |
| Request | Carry on the undertaken work while asking for information/support, unless a separate explicit gate is established. Morgan's undertaking is not suspended merely because he asked the object (OR III-I pp.72,85). |
| Gate | Preparation can begin; the identified stage cannot complete before the prerequisite is actually satisfied. Brown's camp reception/support is not a universal manpower reduction (OR IV-I pp.421–422). |
| Offer | Keep existing troops/contracts intact. Receive acceptance, obtain required troop consent and amend terms before transfer, reorganisation or service extension. Pickens does not acquire war-term consent by suggesting substitution (OR IV-I pp.420–421). |

Recruitment owns new men; transfer owns existing men; enlistment owns terms;
the relevant operation owns its progress. Reservations reference those truths
and their events, rather than copying stocks, strength or clocks into another
state owner. No automatic levy on sending an offer, no double counting old
regiments as new recruits, no resetting service by a letter, and no completion
deadline before the required acceptance is received. Brown's ten-day **extra**
offer starts from acceptance, not from July 8 (OR IV-I p.424).

If execution cannot express a required gate or amendment, retain it visibly
as unimplemented and report the relevant 0112 representation gap. Recording
words alone is not evidence that an organisation, consent or support
mechanism executed. An inability is not covert slow walking; deliberate
delay needs its own evidence.

## How 0111/0112 would match [I]

The accepted 33 eligible obligations, exclusions and three source holds do
not change. Match one actual response to at most one eligible named act by
issuing side, actor, role and bounded matter, including advice direction.
Keep a stable request/revision identity and the particular demand answered.

A reservation match requires an undertaking of **that same request**, a
substantive qualification corresponding to the row's named subject, and a
compatible effect. A raising pledge plus an appointment protest can match a
qualified-raising row; an object rung, a reserve pledge against an armed-pair
row, or an unrelated complaint cannot. For Morgan, the accepted nearest-type
information request plus undertaking remains sufficient; do not demand an
invented material concession. Holmes's statement-only protest likewise
needs no invented reduction (OR III-I pp.72,85; OR I-II p.959).

Do not require eventual victory, the calendar day, or all men delivered to
match a **reply** act. Do require actual execution if a row's act itself is
execution, as for a deliberate delay. Keep fulfilment diagnostics separate.
Several reservations on one response are still one response; support letters
and duplicate telegrams add no acts. Materially new instructions can create
a new matter, as C12 and C19 illustrate (OR IV-I pp.424,466,477–478).

An offer awaiting acceptance is a qualified pledge, not completed amended
execution. It can match only a register row that describes that form of
undertaking; it cannot match an unconditional execution row. Insufficient
response content is unresolved. A contrary actual response is a mismatch;
missing acts are not observed; an avoidable unissued model request is an
exposure mismatch. A missing mechanism remains a representation gap, neither
pass nor failure (0112), even if text can name it. Raw responses still publish
actual/declared rungs, reservations, effect/status, actor/role/kind/order/day
and side. No raw total substitutes for coverage and no excess ceiling returns.

## Transfer checks outside the 0112 registers

These are **new matters outside both S88 candidate registers**, not merely
excluded rows or rematches. They are not new calibration obligations. No
historical willingness, hidden value or temperament is inferred. Projection
predictions are conditional on a nonnegative evaluated undertaking, not a
claim to have run these actors through a changed model.

| Case and pages read | Historical form [I] | Typed representation / discriminating check [I] |
| --- | --- | --- |
| Buckingham, April 15, to Cameron: immediate attention to requisition (OR III-I p.70; call pp.68–69). | Plain compliance. | Original undertaking, no reservation evidenced. A low positive score alone must not manufacture a complaint. |
| Washburn, April 15 and April 18, to Cameron: prompt response, then readiness at the stated rendezvous/time (OR III-I pp.71,86; call pp.68–69). | Plain compliance; the permitted readiness date is not a reservation. | Execution schedule within the received instruction, empty reservation list; no penalty for using allowed time. |
| Buckingham, April 17: men assembling at Hartford where arms are; can move to New Haven or deliver at Hartford as Department elects; obeys first order unless countermanded (OR III-I pp.69,82). | Compliance with a named logistical qualification/alternative; no refusal. | `muster_place` request/offer; mobilisation continues. The original New Haven destination stays until changed. No automatic one-day slow-walk act. |
| Andrew, April 18: arms already issued and regiments departing; asks more arms (OR III-I pp.85–86). | Compliance with a named arms qualification. | `arms_equipment` request for remaining work, not a gate on troops already dispatched, not evidence that the arsenal report is a total State weapons census. |
| Patterson, June 17, to Townsend, through his own command: troops ordered; expected delivery depends on rail transport; subsequent report names departures and transportation arrangements (OR I-II pp.696–697). | Compliance with a named transport qualification. | `transport` gate on delivery, not on issuing movement orders. Do not borrow July's U32–U34 acts or turn a car requirement into an uncooperative trait. These reports do not establish every contingent's actual arrival. |
| Johnston, July 18, to Cooper, answering July 17: intends movement toward Beauregard unless Patterson prevents it; reports insufficient transport, sick-care delay, and accepts provision risk (OR I-II pp.980,982). | Compliance with reported limits; no new imposed enemy-clearance veto established. | Separate issuer's practicability condition (p.980 is the government's message to Beauregard, not a claimed original received telegram) from actual sick/transport prerequisites reported p.982. The authorized condition is not a reservation against authority. A named support qualification can accompany undertaking; do not infer secret reluctance or refuse risk he explicitly accepts. |

Johnston's June 17 C13 is **inside** the register and therefore is only a
negative control, not an outside-sample validation: ammunition and endeavor
within allowed discretion do not become an imposed reservation. Government
confirmation must remain visible (OR I-II pp.924–925,934). Patterson's U32–U34
remain separate July matters; June 17 compliance cannot cover them.

The distinction also survives counterfactual input tests without choosing a
weight: move a score from 7 to 67 with the same actual undertaking and same
protest and its qualified form stays; remove the protest and a positive score
alone adds none; make willingness negative with no admissible undertaking and
it becomes noncompliance; supply arms to a reserve that never required them
and no new arms condition appears; remove received consent and an offer
cannot complete. These are proposed future tests, not tests run here.

## Alternatives rejected and proposed ruling

Reject widening the numeric window: it still treats aggregate magnitude as
the subject of a qualification and cannot distinguish two calls in one
letter. Reject per-person thresholds, fitted traits, additional duty rewards,
reclassifying unknowns, or new weights picked for C02/C03/C10/C11. Reject a
cosmetic reason list that always raises the whole quota; the support and
consent conditions affect stages. Reject treating every complaint or every
resource report as a blocking condition, and treating all inability as
unwillingness. Reject cancelling a negative value term merely because the
actor protests it. Reject reading issuer terms from the reply, borrowing
another call's undertaking, and declaring all new fields representation-gap
passes. Reject using an outcome/date/register ID to choose the response.

**Proposed ruling [I]:** accept the undertaking-plus-typed-reservations design
and its matching/execution boundaries for a subsequent bounded implementation
brief. Explicitly retire the 0–9 projection only when that build is accepted.
First implement stable clause references and statement/request reservations;
keep unsupported gates/offers as named gaps until their owners implement
them. Measure, rather than promise, any coverage and strength change. C02,
C03, C10 and C11 remain a diagnosis question wherever unchanged inputs cannot
generate a supported nonnegative undertaking. No agreed criterion is waived.

## Verification and findings outside my scope

[Input receipt](S104/inputs.json) pins the source/decision/register/runtime
files actually consulted. [Page receipts](S104/source-pages.csv) give printed
pages, original URLs, local extract hashes and source paths. Local primary
compilation OCR and the retained LoC/Knox transcript were read headlessly;
no real browser, Computer Use, desktop control or new live-source identity
verification. Selected papers were read, not whole volumes. OCR anomalies,
missing originals and third-party attributions are disclosed in the inventory.
Search hits alone supply no facts.

Runtime prerequisites, local workspace aliases, tracked-file preservation,
link/citation coverage, complete inventories and staged whitespace are the
cheap preflight. The ordinary unchanged full commit hook is required;
commands, exits and final inventory are retained in `runs/s104/`, and the
sole main-CODEX append records its observed result. No simulation, reference,
done-check, package build or timing campaign is needed for this documentation
proposal. Existing S102 evidence is reused only as the model diagnostic
above, not as a new S104 measurement. No independent or standing review is
claimed; sprint whole-branch/gate review remains deferred under 0106/0107.

Outside scope: S105 and all writes to sibling worktrees; code/pack application,
new cast judgments, full material balances, missing original instructions,
executed consent/support/organisation contracts, negative-willingness diagnosis,
new eligible rows or source-hold closures, new coverage/1A/timing verdicts,
formal acceptance/signatures, main integration, release and pushing.
