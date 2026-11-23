# S107: a troop call does not ask for a temperament

2026-11-23. **Proposed ruling [I], for the lead; unsigned.** Calls to raise or
send troops should carry **no temperament contribution**, on either side,
whether the recipient's boldness is known or unknown. Keep the person's
boldness, all other willingness terms and their weights, and the temperament
reader for field goals and plans. No code, pack or accepted decision changes
in this delivery.

The question is whether this kind of request asks an actor to choose a degree
of operational risk. The inspected call papers specify men, service,
organisation, authority, destinations and means. Their replies do not supply
an independent scalar boldness for the act of raising or sending those men.
Turning those clauses into boldness would obscure the particular disagreement
and may charge it twice. This is a judgment about the mechanism's scope [I],
not a finding that governors lacked temperament or always complied.

## 1. What the current term reads

The normative starting point is [FOUNDATION section 6](../design/FOUNDATION.md#6-people),
especially its **True stats**, **Assessment** and **Compliance** bullets:
hidden temperament comes from sourced centres, while willingness is the sum
of values, temperament, regard, deterrence, capacity, disposition and
grievances. That section preserves deterministic M1/M2 compliance but recasts
it for goals, plans and edits. It does not establish that every administrative
request has an operational boldness.

[0007](../decisions/0007-no-dice-for-people.md), **Decision**, makes behaviour
traceable to state, rather than a fresh behavioural die roll.
[0020](../decisions/0020-people-hidden-stats-and-assessment.md), **Decision**,
permits the setup draw around the historical record and separates nerve from
reputation. [0062](../decisions/0062-the-planner-shape.md), **Decision / Scoring**,
expressly says plan compliance reads boldness relative to the commander's own
best plan: otherwise he can object to his favourite plan. Its rejected
alternative is **absolute plan boldness**. [0075](../decisions/0075-the-planner-as-built.md)
retains that planner shape and knowledge boundary; [0079](../decisions/0079-the-people-verbs-as-built.md),
**The audience**, distinguishes a goal's terms before planning from the chosen
plan's terms during planning.

Read-only July decision **0113**, **Decision 1 and 5**, further says an unknown
boldness contributes no temperament term to an order response, while the draw
stays for other readers. It does **not** resolve whether a sourced temperament
is relevant to a particular kind of request. Main decision **0118**, **Decision
1–5 and Consequences**, separates willingness from clause-specific
reservations and explicitly leaves this call-boldness question open. Those
records and the consulted implementation are pinned in [inputs.json](S107/inputs.json).
They are not merged into this older branch by S107.

The July implementation inspected, before any S107 change, computes:

```text
reference = ownBest when present, otherwise the person's drawn boldness
gap = abs(order boldness - reference), or zero for unknown boldness (0113)
temperament = -trunc(gap * temperamentWeight / 1000)
temperamentWeight = 400
```

`compliance.ts::resolveDirective` uses that absolute gap symmetrically: a
demand can be too rash **or too timid**. It is a preference mismatch, not a
measure of legal authority, equipment, willingness in general, or courage as
a virtue. Reasons are separately gated by `temperamentReasonAt`; a smaller
gap can cost willingness without publishing a temperament reason. Brown's
recorded −118 therefore need not have a visible `too_timid` reason. The
weight is unchanged in every comparison below.

All implementation paths below are under
`C:/Pyrrhic/sprint-july/packages/kernel/src/`; pack numbers are from its
`packs/union-1861/data/world.json`, **rules**, not historical measurements.
Hashes identify the bytes consulted while S106 runs; this is not a claim that
the sibling's working tree has stopped changing.

| Request | Where boldness comes from and how it is read |
| --- | --- |
| Troop call | `recruitment/rules.ts::callTerms` takes `rules.recruitment.callTerms.boldness`, **500**, even when a per-paper `CallProfile` supplies the values and unscored clauses. It returns `required: 0`, with no `ownBest`. `tick/recruitment.ts::arriveCall` passes those terms to `answerOrder`. Thus the call's words do not set its boldness; the same constant is compared with each known recipient's drawn boldness. |
| Field goal | `plans/goal.ts::goalKindOf` maps take/relieve to advance and hold to hold; `reading/orders.ts::goalTerms` reads `people.goalTerms`. This pack states **advance 600 / hold 400**, with their own value terms. Before a plan, no `ownBest` is supplied and `required` is zero. These are authored goal-kind parameters, not a reading of a governor's letter. |
| Plan or edit | `planner/edits.ts::riskOf` derives risk from exposure, supply, haste and force shortfall, with a holding floor. `editDirective` sets boldness to the clamped base plus edited risk minus own-best risk; `ownBest` is the base. Required strength, departure from judgment and support have separate terms. A commander's own best plan has zero temperament gap. See also `tick/plans.ts::answerEdit` and `tick/audience-plan.ts::planReading` in this worktree. |
| Transfer | `tick/verbs.ts` reads `reading/orders.ts::orderTerms` for `verb:transfer`. The pack's `people.verbs.orderValues` row has **boldness null**, honours duty and offends reputation. The adapter encodes null as `boldness: 500, ownBest: 500`, giving a zero gap, rather than a comparison with the sender's temperament. `people/verb-rules.ts::OrderValueRow` expressly permits null where temperament has no bearing. The sender still answers through compliance and chooses blocks under 0079. |
| Appointment | Same adapter for `verb:appoint`; the pack row also has **boldness null**, honours career/reputation, and offends no value. There is no temperament mismatch; an appointee can still decline under other terms. This already demonstrates that being an order to a person does not require a temperament charge. |

`DirectiveTerms` describes boldness as the early reduction of intent to a
level plus values. The paths above show where that abstraction acquired a
meaningful operational comparison and where calls retained a default instead.
S107 diagnoses the call path only. It does not approve or recalibrate every
goal, transfer or appointment value mapping.

## 2. Does the meaning fit the request?

For a field goal, taking ground rather than holding it, or editing a plan to
accept greater exposure, haste, supply risk or force shortfall, presents an
operational course against which a commander's preferred risk can be read
[I]. The implementation's relative comparison is particularly concrete: it
can compare the requested plan with the plan he himself considers best, on
his received knowledge (0062; 0075). This is stronger than merely labelling a
person bold and charging him whenever a request says 500.

A call recruits or dispatches men; it is not itself their attack plan.
Walker's April 22 calls specify prompt rendezvous, muster and provision
(**OR IV-I pp.231–233**). The June 30 circular separately specifies reserve
organisation, federal appointments, camps, service for the war, and cavalry;
it expressly permits the reserve infantry to arrive unarmed while requiring
the cavalry to be armed and equipped (**OR IV-I p.412**). Calling the whole
paper 500 cannot distinguish those obligations. Calling it bolder because it
is urgent, long-service or federally organised would remap timing, consent,
appointments or authority into temperament without an independent rule [I].

Sending troops can expose a State's home defence. That is a real stated
concern, but it names means and competing commitments, rather than proving a
stable mismatch with an order's abstract boldness: A. B. Moore discusses arms
and leaving Alabama exposed (**OR IV-I p.420**); T. O. Moore discusses the guns
remaining for Louisiana (**pp.422–423**). A dated, received report or an
evidence-backed judgment can qualify a particular clause under 0118. It must
not become an invented complete stock balance, and the unarmed reserve must
not acquire an arms prerequisite. A separate operational order or plan for
the troops would retain its own reader and terms [I].

## 3. What the replies support

OR means *War of the Rebellion: Official Records of the Union and Confederate
Armies*, **series–volume, printed page**. I reread the retained OCR on the
**37 pages** in [source-pages.csv](S107/source-pages.csv), with S104's page
locators and hashes. This is primary-compilation text reading, not a fresh
inspection of individual scans or the missing originals. The table describes
the expressed grounds; it does not infer private motive or personality.

| Own-government / Confederate-issued reply | Expressed ground in pages read |
| --- | --- |
| C01 Brown, April 4 | Consent, distant muster/rejected men's return costs, surgeons, State organisation, shortest acceptable service and destination. Walker's answer is separate (**OR IV-I pp.207,214**). |
| **C02 Brown, April 23** | Undertakes the requisition using State organisation, company muster at Augusta, field election at Richmond, and transport arrangements; asks for muskets. Walker agrees to the method (**pp.231,234**). This is not an objection that two regiments are too timid or rash. |
| **C03 T. O. Moore, April 22–23** | Conditional versus absolute activation and muster; inability to pay for men kept constantly ready; assembly takes time, but he undertakes all he can do (**pp.232–233,235**). |
| C04 Pickens, April 23 | Destination, continuing State consent and regimental integrity; a Confederate general appointed by the President. The incoming original remains unread (**pp.235–236**). |
| C05 Harris, April 22 | Says he lacks legal authority to order troops beyond Tennessee and has defective organisation, yet promises three regiments for Lynchburg (**pp.232–233**). |
| C07 Letcher, July 3 | Undertakes to raise the reserve while protesting the constitutional basis for federal field/staff appointments (**pp.412,419–420**). |
| C08 A. B. Moore, July 4 | Accepts the unarmed reserve and armed cavalry; says the separate armed regiments cannot be fully supplied without exposing the State. Preserve his internally awkward arms wording; no certified stock total (**pp.412,420**). |
| C09 Pickens, July 5 | Selects Orr and proposes using already armed troops for the other regiment, if service can be extended with consent; reserve details remain under inquiry. Original July 1 South Carolina request not recovered here (**pp.420–421**). |
| **C10 Brown, July 6** | Undertakes the reserve, protests federal appointments, and asks who receives and supports companies; separate cavalry undertaking depends on ability to equip it. The reserve did not require arms (**pp.412,421–422**). |
| **C11 T. O. Moore / Grivot, July 6–7** | Undertake raising/organisation, request credit for Marigny and federal camp support, discuss war-term enlistment/readiness and home-defence arms. The reply says Memphis/June 30; the model metadata says Corinth/June 29. No silent reconciliation (**pp.412,422–423**). |
| C12 Brown, July 8 | New-regiment undertaking plus an offer to preserve brigade and commander, subject to acceptance and equipment arrangements (**p.424**). |
| Excluded C18, C19, C21, C22 | Existing enlistment contracts/consent; brigade integrity/statutory authority; clarification of changed service terms; and Walker's report of Brown's restriction on State-armed troops leaving with arms. C22 is not Brown's own original reply (**pp.295,302–303,355,466,477–478**). No extra act or reservation eligibility is inferred. |

The hostile replies to **Lincoln's** call remain a separate group, classified
by issuer rather than later allegiance. Magoffin objects to the stated
purpose (**OR III-I p.70**); Ellis to purpose and constitutional authority
(**p.72**); Letcher to purpose and authority under the Constitution/1795 act
(**p.76**); Harris to coercion and claimed popular sovereignty (**pp.81,91–92**);
Jackson to purpose and legality (**pp.82–83**); Rector to perceived subjugation
and usurpation (**p.99**). These are their attributed arguments, not S107's
legal judgments. None becomes a qualified undertaking because a temperament
charge is removed. Hicks's present inability is separately about control,
organisation and arms (**OR I-II p.581**). Morgan asks for the object before
legislative adjournment, then reports steps to comply (**OR III-I pp.72,85**).

S104's full [27-disposition inventory](S104/replies.md) retains C06 as a
non-governor, and U09/U25a/U28 as non-call or unsupported scope placeholders;
they cannot establish a governor's call-boldness reply. S107 does not reread
C06's officer papers, reopen those dispositions or close any missing-original
hold. Among the governor replies actually read above, **none supplies an
independent objection to a call's boldness** [I]. That is a bounded absence of
support, not proof that no such argument occurred anywhere in the war. Strong
language about danger, urgency or war purpose must not be reclassified as a
temperament gap merely because the language sounds forceful.

Outside both registers, Buckingham promises immediate attention, then offers
Hartford versus New Haven muster arrangements and says he will obey the
original order unless countermanded (**OR III-I pp.70,82**). Andrew asks for a
route, reports orders assembling men, suggests arms production and additional
service, then reports troops dispatched while requesting arms (**pp.71–72,85–86**).
These support plain/qualified undertakings with concrete subjects. They do
not supply a 0–1000 boldness for the calls [I]. Neither man's historical
judgments are altered or newly certified here.

## 4. Arithmetic of the proposed omission

Freeze the recorded response. Let `W` be its willingness and `T` its recorded
temperament contribution (zero if absent). Then **`W_without = W - T`**. This
does not recalculate a governor's draw, other terms, principal credibility,
later events or execution. All seven recorded terms and response identifiers
are in [arithmetic.json](S107/arithmetic.json). Every recorded term sum was
checked before subtraction.

The first eight lines use **S102's retained after records** in July's
`docs/audit/s102-evidence/governor-answers.json`. They are also unchanged in
the retained S105 reference inspected. C03 has three relevant calls and C10
and C11 each answer two distinct requests; the negative headline alone must
not conceal those distinctions.

| Row / received call | Other recorded terms (nonzero) | Recorded T | Recorded W | W without T |
| --- | --- | ---: | ---: | ---: |
| C02 `cs_apr22_absolute_georgia` | deterrence +45 | −118 | −73 | **45** |
| C03 `cs_apr08_louisiana` | values +200; deterrence +40 | −96 | 144 | **240** |
| C03 `cs_apr16_louisiana` | values +200; deterrence +40 | −96 | 144 | **240** |
| C03 `cs_apr22_absolute_louisiana` | deterrence +40 | −96 | −56 | **40** |
| C10 `cs_jun30_cavalry_georgia` | deterrence +22 | −118 | −96 | **22** |
| C10 `cs_jun30_reserve_georgia` | values −200; deterrence +22 | −118 | −296 | **−178** |
| C11 `cs_jun29_extra_louisiana` | deterrence +13 | −96 | −83 | **13** |
| C11 `cs_jun30_reserve_louisiana` | values −200; deterrence +13 | −96 | −283 | **−187** |
| Outside: Andrew, S105 April-call response, day 41 | regard +90; deterrence +33; values net 0 | −134 | −11 | **123** |
| Outside: Buckingham, S105 April-call response, day 41 | deterrence +51 | absent / 0 | 51 | **51** |

The outside lines come from the already retained
`runs/s105/references/union-1861-responses.json`, not a fabricated S102
governor-register row. Their full order keys are saved; these April-call
records lack `respCallId`, so no new per-paper identifier is invented. Andrew's
net-zero values include both an honoured Union value and an offended State
autonomy value in the saved reasons. A net zero does not erase that clause
disagreement. Buckingham's absent temperament is the 0113 unknown case: zero
change is an essential control, not a reason to manufacture a trait.

For Brown's C02, this removes the sole negative term and makes the original
request numerically admissible. The same is true for C03's absolute call,
C10's cavalry and C11's extra regiments. It does **not** make every observed
material or consent qualification executable. Under 0118, positive
willingness alone does not supply a reservation: there must still be a
grounded qualification of the same request, with a compatible effect.

**The reserve residual remains:** C10 −178 and C11 −187 still have a −200
offended-value contribution. Omission of temperament does not cancel it;
neither total admits the original undertaking under 0118. No acceptable
alternative is asserted. The recorded historical undertakings therefore
remain a diagnosis question about how particular terms and undertakings are
represented, with effects/ownership limits intact. Changing that cost to
force a match is outside this ruling.

These are **ten arithmetic comparisons, not new rung, levy, strength or
coverage results**. Later paths can change deterrence, resources, timing and
other responses. Reusing the retained references avoids a campaign that
could not measure an unimplemented proposal. All existing 0111/0112/0118
same-request rules, exclusions, source holds and acceptance obligations stand.

## 5. One proposed ruling and its rejected alternatives

**Proposed ruling [I]:** a received call whose undertaking is raising or
sending troops has no applicable temperament term or `too_rash`/`too_timid`
ground derived from call boldness. Apply this by request kind on both sides,
including readings of the same call in a chain; never by governor name or
register membership. An order carrying a distinct operational course still
has that course's appropriate terms. Retain sourced values, evidence-backed
judgment, structural conditions, dated received resource information and
information requests as their own grounds under 0118. Unknown judgments
remain unknown under 0113.

Record the inapplicability explicitly in the call-to-compliance adapter in a
later authorised build. It should not masquerade as a historical 500 or a new
centre for a governor, nor set `temperamentWeight` to zero globally. Existing
null transfer/appointment semantics show the engine already has the concept;
the precise typed representation and migration belong to that build. No
extra State owner, resource stock or reservation writer is proposed here.

Rejected alternatives:

- **Keep calls at 500.** It preserves an unsupported mismatch with the
  person's draw, even after every received clause is individually sourced.
  The default is not evidence that this requisition was moderately bold.
- **Take boldness from each call's text now.** No independent scale or
  contemporary reading was established. Coding urgency, quota, service term,
  appointments or home-defence means as boldness hides the clause and can
  duplicate an existing cost. A future independently sourced course judgment
  could be evaluated on its own merits; it is no warrant to invent these
  numbers now.
- **Set each call's boldness to its recipient's temperament / preferred
  number.** That makes its content depend on the recipient and conceals
  inapplicability as a perfect match. It is not the meaning of a received
  paper. The old null adapter's equal-number encoding is an implementation
  convention, not a historical assertion.
- **Change the four governors' traits, weights, thresholds or value costs;
  widen the reservation window.** That fits outputs, violates the sourced
  character boundary or bypasses 0118. The two negative reserve totals are
  deliberately left visible.
- **Remove temperament everywhere, or treat every complaint as permission
  to omit it.** Field goals/plans have an independently meaningful operational
  comparison; a governor's protest is not the applicability switch. The rule
  must also apply to plain, unknown and unregistered recipients.

No parameter was chosen from a desired register answer. The proposed scope
comes from what the request asks and what the existing term measures, tested
against both sides' replies, unregistered cases, and an unchanged unknown
case. It does not promise all four obligations will match.

## Findings outside my scope

S106 and all sibling writes; implementing or accepting this ruling; further
reserve-value/undertaking diagnosis, means balances, execution of gates and
offers; auditing the cast citations or changing any judgment; missing
originals and source holds; new reference, coverage, Confederate strength,
timing or milestone verdicts; standing/whole-branch/gate review and signatures;
main integration, publication and pushing. Nothing signed or cleared for main.
