# S133: Estimating an enemy whose strength is unknown

Proposal for the lead, 24 November 2026. S133 only, `sprint/pushback`, base
`d6e7a27a904ba0153b4852053b553450de05de96`. **No code, pack, accepted decision,
band, criterion or strength changes.** Every recommendation below is **[I]**.
Historical observations are labelled **[source]** and cite pages actually read;
software evidence is labelled **[record]** and names its committed revision.

Recommend observable counts and explicitly attributed estimates, with unknown
remainders preserved from report to planner. An ordinary offensive may proceed
without a numerical assurance of superiority. A sortie, or another candidate
with an existing numerical safety gate, may not. A scout's estimate never
quantifies the underlying historical lot or clears the unknown-combatant gate.

## 1. Evidence and its limits

Read the lead's final S133 message and decisions 0052, 0110, 0113, 0123, 0125
and 0128 in the main checkout. The local branch predates several of them; this
proposal does not copy them into its canon or declare a superseding decision.
0106/0107 continue to defer formal branch/gate review and integration. Git
history is this project's ledger (`CLAUDE.md`); no AWWV ledger is introduced.

**[source]** Mahan's *Advanced-Guard, Out-Post, and Detachment Service*, 1861
edition, p.47, paragraphs 298 and 300, discusses telescope/map equipment and
learning the space occupied by battalions, squadrons and batteries in line or
column. His p.28, paragraph 164, gives a planning allowance of about 180 yards
for a battalion of 600–700, about 60 yards for a cavalry squadron of 48 files,
and 12–20 yards between guns. These are dispositions/space allowances, **not a
return, a measured enemy count, or a universal strength for a regiment**.
P.49, paragraphs 313–316, describes covert reconnaissance and a stronger
reconnaissance that induces an enemy to display troops; p.50, paragraphs
320–323, gives observation and reporting duties. Read through a modern
transcription, with its page numbers, not a newly verified facsimile. The
[reading record](../research/S133/primary-readings.md) retains the passages,
URL, downloaded-file hash and this limitation.

**[source]** *Revised United States Army Regulations of 1861*, in the 1863
printing with appendix, pp.94–95, paragraphs 656–663, distinguishes routine,
special and forced reconnaissance. Paragraph 662 requires separating personal
observation from unverified accounts. This printing postdates July 1861; it
supports a period reporting distinction, not proof of what Patterson received
or which instruction was in force on a particular July day. No gun-to-men,
camp-to-men or company-to-men conversion is established by these passages.

**[source]** Scott's 13 July letter actually says "valley of Winchester"
(OR, series I, volume II, p.166). Patterson reports six hundred cavalry and a
blocked road on that page, without giving his counting method. Scott and
Patterson disagree about relative numbers on p.168. Patterson describes a
reconnoitring party, pickets, a displayed battle line and barricades on p.169;
these are his claims, not independent confirmation of his claimed detention.
The retained primary OCR pages [166](S115/readings/OR-I-II-p166.txt),
[167](S115/readings/OR-I-II-p167.txt), [168](S115/readings/OR-I-II-p168.txt),
and [169](S115/readings/OR-I-II-p169.txt) were read in full. No dispatch receipt
clock, accuracy of a numerical estimate, or hidden intention follows from them.

**[record]** Read S126's committed packet and kernel with `git show` from
`C:/Pyrrhic/sprint-july` at `4b45f4e1e6b858771d6ea205fb5155edde88eb90`;
read S130's committed kernel and its three committed acceptance/preservation
records from `C:/Pyrrhic/sprint-demonstrate` at
`74e821eb` (full revision recorded in the reading record). No sibling working
file, index blob, staged tree or ignored raw run was used as capture evidence.
S129's packet became committed during this task at **`7bc4afce`**, and its
three captures and relevant kernel were then read at that immutable revision.
**S130's full capture packet and second-capture correction are not in the
inspected `74e821eb` HEAD.** That absence limits section 5. The lead's S130
messages are coordination evidence, distinguished below from independently
read captures. No new simulation ran.

## 2. What an observer can estimate [I]

Separate three things: the force's true strength evidence under 0125, the
observable objects, and what the observer infers. An unknown truth does not
make every object invisible. Conversely, a private lot record is not a scout's
observation. A future producer must expose only counts that its declared
observation mechanism could obtain. It cannot enumerate every hidden regiment
in a watched region and call that a sighting.

| Observation | What may be reported | Conversion into men |
| --- | --- | --- |
| Visible men, a sufficiently exposed line, or a marching formation | The counted men or observed formation/frontage, place, time, arm, viewing conditions and whether the view was partial | Direct count, or a named observer assumption matched to that formation; disclose uncertainty and unseen parts |
| Distinguishable battalions, regiments or companies | Counts by observed unit type; identification only where learned | A count is not establishment. Require a read, applicable conversion basis; otherwise report units with men unknown |
| Guns or identifiable batteries | Guns actually seen, battery positions and activity | Keep guns as guns. These readings establish no conversion into total infantry, cavalry, crews or supporting troops |
| Camps, tents, fires or occupied ground | The observed objects and activity, with possible vacancy/duplication | Keep them as indicators. No occupants-per-tent, men-per-camp, or inferred whole army without a separately sourced basis |
| A received numerical account | Its author's dated estimate and stated scope, identified as hearsay if unverified | Carry the account, not a fictitious personal count; preserve uncertainty and provenance |
| Presence or activity but nothing countable | Presence/activity, attribution if actually learned, and **strength unknown** | None. A marker value used by a claim encoding is not one man |
| Nothing seen | Where/when the observer searched and the limits of the search | "Not seen" is not regional clearance or zero. Clearance needs an affirmative, fresh, scoped report under its own producer |

One concrete, source-bounded conversion is available for proposal: an observer
who distinguishes `b` compatible formed battalions may adopt Mahan's p.28
600–700 working allowance and report an **estimated observed component**
`[600*b, 700*b]`. This is **[I]**, reversing a space-planning example into an
observer's hypothesis. It is neither Mahan prescribing this reconnaissance
formula nor evidence that the units contain those men. No 650 midpoint is
needed. A regiment is not automatically one such battalion. The observation
must record the matching formation assumption; a partial line or an obscured
reserve leaves an additional unquantified remainder. Where the observation
mechanism cannot establish that premise, this conversion is unavailable.

This proposal supplies **no numerical company, regiment, gun or camp rule**.
A build can implement the explicit unknown branch and existing sourced
accounts first; it must not invent a coefficient to make a July order feasible.
The source does not establish a bound on the true size of an unseen army.

Apply 0052's perception in its existing ownership chain: record the observation
and conversion basis, the intelligence source's bias if applicable, the claim
actually sent, and the recipient's reading bias. Multiply both endpoints of
an interval with the existing integer-permille formula, outward-rounded;
retain the original component and terms. Each reading applies its reader's
bias once; relay/quotation must not silently reapply an earlier person's bias.
The dispatch and planner use the same derived belief. No new unsourced
personality coefficient, random estimating skill, July-specific bias or
compliance term is proposed. 0113 remains a limit on unsupported judgments in
responses; an unknown trait does not become evidence for an estimate.

## 3. Preserve partial knowledge [I]

Use a derived belief with separate presence, observed/estimated components,
coverage and unknown remainder. Its numeric component can be a point or finite
interval. A partly counted force is **that component plus an unquantified
remainder**, never the component alone labelled as the region's total. An old
complete numerical claim may remain in the dossier, with its date, after a
new unknown report; it may not silently become the current complete estimate.

Select/supersede claims across numeric, unknown and clearance variants together,
by their subject, region, observation date, receipt and stable identity. A fresh
unknown at the same scope defeats the completeness of the older number. A
smaller scoped observation does not erase an independent compatible component.
Overlapping or competing claims are alternatives, not summable reinforcements.
Retain attribution to the opposing command separately from strength: knowing
Johnston's location is not knowing his men, and knowing men does not identify
Johnston. Recompute from received reports; add no second stored belief truth.

Unknowns must survive every consumer: `enemyBeliefs`, the view, dispatches and
inquiries, planner input, neighboring threat, route weighting, ratio/shortfall,
conditional `outmatched`, and candidate explanation. Weighting a neighboring
unknown does not remove it. An unknown comparison yields **undetermined**,
not false, a reinforcement number, clearance or automatic fallback execution.
Own unknown lots likewise cannot certify an allocation, split, stores need or
superiority. Known own lots may be used without assigning men to the others.

**[record]** At `74e821eb`, `tick/generate.ts` emits
`enemy-estimate-unknown` for unquantified contact when demonstration policy is
enabled. `knowledge/beliefs.ts::latestEnemyClaims` reads only `enemy-strength`;
`planner/input.ts::viewGround` then projects values to a numeric map.
`planner/context.ts::makeCtx` supplies missing values with zero when building
neighboring threat. `planner/score.ts` divides by that numerical opposition,
uses a favorable ratio when it is zero, and derives shortfall and waiting.
Thus the unknown marker does not invalidate the old numeric belief; the
remaining numeric components can supply the small opposition. Do not fix
only the final division, or only the detention planner's special report set.
At S129's separate `7bc4afce` kernel, `tick/generate.ts` still emits numeric
`enemy-strength` from the counted enemy sum, and `viewGround` still projects
numeric values. It does not contain S130's new unknown-contact branch. Keep
those producer differences separate when interpreting the three baselines.

## 4. What candidates do [I]

| Candidate | Complete fresh numerical belief | Missing, stale, or partly unknown relevant strength |
| --- | --- | --- |
| Ordinary regional attack (`take`/ordinary offensive) | Existing terms for point estimates. For a complete finite interval, conservatively evaluate numerical demand at its upper estimate, explicitly a belief rather than a true bound | May remain an explicitly **uncertified** offensive choice under existing authority, routes, stores and own usable force. No superiority, zero-opposition bonus, numerical shortfall or promise of safety is manufactured |
| Hold | Existing ordinary holding choice | Remains available where otherwise lawful/feasible. Explain the unknown; never certify an adequate garrison from an unknown own component |
| Attack as the means of `attack_or_demonstrate` | Preserve S130's fresh target attribution and numerical attack-demand gate | Its existing numeric attack gate stays closed; request/report the missing intelligence. Ordinary attack permission is not an override for this form |
| Demonstration | Preserve authority, target attribution, known allocated force, stores, areas, duration and recovery gates | Enemy size alone is not a requirement to beat him: a force-backed observation/threat can be considered without invented superiority. However, **S130's existing fresh-estimate recovery gate still blocks an unknown on any required recovery stop, including its start**. No candidate may claim a safe route through an unknown; no target attribution still means `no_target` |
| Limited sortie | All 0128 fresh numeric estimates or affirmative clearance for target/home/crossed regions, numeric parent/guard, demand and stores checks | **Hard block**, even if ordinary attack or holding remains available. Partial/unbounded estimates cannot clear it; a complete finite observer estimate uses its upper endpoint for the numeric gate, subject to lead approval of this interval treatment |

For an ordinary offensive with an unquantified relevant remainder, recommend
marking numerical force comparison, its derived reinforcement demand and any
dependent term **unavailable**, with a typed reason. Rank the ordinary choice
set using a common set of evaluable terms: remove a numerically dependent term
from every alternative being compared if it cannot be evaluated for one of
them. This avoids rewarding a candidate merely for having missing data.
Retain known time, goal fit, caution, stores, travel and other independent terms
with their existing weights. Record the omitted domains alongside the sum;
they are not zero enemy men or zero risk. No new uncertainty bonus/penalty or
preferred commander is introduced. Enforced gates stay gates before ranking.
If no legal executable candidate survives, retain the reason and seek
information; a request is not execution of the original duty.

This is a policy choice, not a demonstration that present winners will recur.
It allows an ordinary commander to act despite incomplete intelligence, rather
than silently turning ordinary field war into 0128's exceptionally conservative
sortie. Detention activity can still be unavailable on coarse recovery geometry.
Changing that gate would need a separate proposed ruling and cheap controls;
this proposal does not weaken it to recover a demonstration in S130.

Rejected alternatives:

- Zero, one, establishment, an average unit, a midpoint, a fitted gap, or an
  omniscient true-strength lookup for an unknown part. They invent an enemy
  total or repeat the legacy fallback.
- Treat every attack as a sortie and hard-block it until every enemy return
  exists. That confuses archival truth with perception and can close ordinary
  operations despite lawful orders and observable opposition.
- Always retain the last number as a complete current picture after explicit
  unknown, or delete all useful known components. Both discard information.
- A new caution penalty, fitted time weight, Patterson exception, universal
  temperament draw, or numerical "unknown risk". These are unsupported tuning.
- Populate true lots from observer conversions, divide a command return among
  constituents, or use an estimate to pass unknown combatants. 0125 forbids it.
- Count a request, compliant answer, demonstration or unresolved contact as an
  opposed fought operation. No candidate policy changes the criterion.

## 5. Consequences, without a new run

| Matter | Evidence actually read | Consequence of the recommendation [I] |
| --- | --- | --- |
| McDowell at Manassas | **Committed S126** `docs/audit/s126-evidence/criteria.json`, `operation` after: his day135 direct operation is associated with `battle:manassas:140`. `unknownStrength` after lists three unknown North Carolina lots on days141–143 and146 | An unquantified enemy remainder will not confer a ratio bonus or automatically forbid his ordinary offensive. His actual choice must be measured after a build. The observer's estimate does not fill those three lots; their unknown-strength non-pass remains |
| Patterson | **Committed S126** same packet: direct operation141 associated with Harpers Ferry battle146. **Committed S129 `7bc4afce`**, `README.md`, `three-way-summary.json` and `readiness/plan-changes.json`: the first two captures have no Johnston appointment and opposition0; the readiness repair restores his appointment and Patterson's day140 opposition5,695, direct/hold scores106/11. Removing time gives-194/311; withdrawal/repulse/time each return to1 | Do not preserve any opposition number as an acceptance target. The unknown fallback and the earlier appointment defect are distinct causes. A repaired estimate cannot appoint Johnston, create authority, move troops or supply target attribution |
| Patterson after the demonstration build | **Lead's read final message and preceding S130 status**, not an independently read committed capture: opposition4,630→532; the three demands arrive and get compliant answers; no demonstration executes because no received target attribution places the command in `lower_valley`; direct Harper course141 is unchanged | Correct the legacy knowledge boundary generally. Do not promise the historical objection, slow walk or detention. U33/U34 remain mismatches in the lead's accepted record; missing target attribution is an independent blocker |
| Johnston | **Committed S126** criterion associates his direct operation144 with Harpers Ferry battle146. **Committed S129 `7bc4afce`**, `readiness-driver-evidence.json` and `readiness/plan-changes.json`: supply_line to Lynchburg wins104; his final147 Lynchburg draft perceives0 and remains in review. The repaired capture's operation142 fights at Harpers Ferry146. **Coordination only:** S130 status reports ordinary estimates, no demonstration activity, and Manassas course144 | Keep these different received-picture trajectories separate. Location without men is useful; no sighting of a demonstration can be fabricated. He can choose to stay or leave under ordinary policy. Neither a true presence nor a reported departure establishes causal detention |
| Operation and both sides fighting | **Committed S126** `operation` has no problems and lists four linked operations: Sumter38, Johnston144, McDowell135 and Patterson141. The same packet separately fails unknown combatants at Harpers Ferry and Manassas. The committed scorer links an operation to a battle and checks loss-breakdown sums | Preserve a path from lawful ordinary offensive to genuine opposed combat, while retaining truthful unknown-strength failures. A scout estimate affects choice only. If a side is wholly unknown, 0110 gives unresolved contact and this does not establish both sides fighting. Source recovery is still required for unknown historical combatants |

The design keeps the **operation reachable**, not guaranteed or newly passed:
ordinary attacks can still be chosen without a guessed enemy total; real
quantified forces can then fight under the existing battle rules. Holding can
fight defensively; both sides need not independently choose an attack. A
demonstration only counts if an actual ordinary battle independently occurs.
Read `packages/cli/src/history-run.ts::operationsFought/operationScore` at
`4b45f4e1`: a linkage and arithmetically summing loss breakdown are what that
scorer checks. That alone must not be presented as independent proof that an
unresolved contact was opposed fighting. Audit the actual sides/outcome in a
future implementation's acceptance evidence; no scorer change is made here.

**Committed S129 cross-check:** `three-way-criteria.json` retains McDowell's
Manassas-linked operation135 in all three captures. `readiness/battle-changes.json`
shows actual day140 combat: Union59,754 against Confederate6,490, both with
empty unknown-block lists, Union gaining ground and Confederates routed.
The repaired Harpers Ferry contact146 has Johnston5,340 against Patterson1,732,
both with empty unknown lists; Patterson withdraws. This is distinct from the
first two S129 captures' wholly unknown Confederate contact. The readiness
criterion still has four unknown-strength problems at later Manassas contacts;
the restored Harpers Ferry fight does not waive them. These actual model
records show why the operation path must survive and why a planner estimate
cannot be used to certify combatant truth. They do not measure this proposal.

**Remaining evidence gap:** S130's two detailed captures, Patterson's S130
retained candidate breakdown and Johnston's received-paper lists cannot be
independently compared under the committed-only restriction until their record
has a commit ID. It was requested during this task. The lead's S130 summaries
support conditional reasoning, not a claim that those captures or the proposed
counterfactual have been verified. No new winner, liveness count, band, detention
effect or milestone result is claimed.

## 6. The Valley is territory, not a moving target

**[record]** Read `packs/union-1861/source/world/regions.csv` at this branch's
base; the reading record retains the exact relevant rows and hashes. Its own
definitions give this territorial reading:

| Region | Defined territory/places | Interpretation [I] |
| --- | --- | --- |
| `lower_valley` | Frederick, Clarke, Berkeley, Morgan; Winchester and Martinsburg; north end of the Valley Turnpike | The explicit Winchester focus of Scott's p.166 letter |
| `middle_valley` | Shenandoah, Warren, Page; Strasburg and Front Royal; Massanutten divides the valley | The next Valley region; Strasburg is also named in Patterson's p.166 account |
| `upper_valley` | Rockingham, Augusta; Harrisonburg, Port Republic, Staunton; head of the Valley Turnpike | The upper Valley, not excluded because a particular run has no Johnston there |
| `harpers_ferry` | Jefferson; the Shenandoah–Potomac junction and Winchester and Potomac railway junction | A separately mapped outlet/key point, included when describing the whole Valley corridor; not hidden inside `lower_valley` |

Recommend naming the broad map referent explicitly as
`{harpers_ferry, lower_valley, middle_valley, upper_valley}`: the three named
Valley territorial regions and their separately represented mouth. This is a
**[I] geographic mapping**, not proof that Scott enumerated four regions. His
actual words "valley of Winchester" give a narrower operational focus in
`lower_valley`; the text does not explicitly order detention at Staunton.
If "Valley" is used strictly for the three named territorial regions, state
that convention and list `harpers_ferry` separately rather than silently losing
Jefferson's mapped key point.

Exclude `western_maryland` (Maryland counties), `cumberland_valley_pa`
(Pennsylvania counties), `loudoun_fauquier` (Leesburg/Warrenton and the railway
toward the Blue Ridge), and `potomac_highlands` (Romney/Moorefield), on their
own definitions. A `valley` terrain tag alone is not membership in this Valley.
Never expand the word to Manassas, or move its boundary to encompass Johnston's
model headquarters or a convenient received position.

The broad four-region geography is **not directly encodable as 0128's
one-or-two-region detention area**. Keep that incompatibility visible. For
the specific p.166 Winchester duty, recommend the narrower `lower_valley`
focus already authorized in 0123, with the full geographic referent recorded
separately. If the lead intends the whole Valley as the operative detention
area, obtain a superseding area-bound ruling first; do not drop two regions,
split the paper into invented duties, widen D1, or follow Johnston to satisfy
a run. No pack declaration is changed by this proposal.

## 7. Acceptance for a later build [I; not executed tests]

Before any historical capture, use small fictional paired fixtures to establish:

1. Same visible formation, different hidden true strength: the estimate and
   candidate picture are unchanged. Same true strength, changed observable
   formation: only the supported observation and estimate change.
2. Compatible battalion count yields the disclosed interval and conversion
   provenance; company/gun/camp counts without a basis yield no men. Nothing
   countable yields unknown; a private lot count never becomes a sighting.
3. Chief and recipient biases are traceable once each; dispatch and menu agree.
   Quotation, delayed/filtered receipt and replay preserve their provenance.
4. Newer unknown defeats older numeric completeness, with the old paper retained;
   mixed components, overlapping claims, stale reports and neighboring unknowns
   survive projection without duplication or zero fallback.
5. Ordinary attack remains a possible, uncertified choice; hold remains possible;
   common evaluable scoring terms include time and goal fit with unchanged
   weights. Dropping each still has a live fictional driver. No outcome is
   selected by name, calendar date, or an unlearned truth.
6. Detention still requires received attribution and lawful scope. Unknown
   recovery blocks demonstration; no numeric attack gate is bypassed. Sortie
   unknown-parent/enemy/home/transit controls remain hard failures under 0128.
7. Unknown `outmatched` stays undetermined. An estimate never changes true lots,
   the unresolved-contact rule, unknown-strength verdict or opposed-fight
   requirement; include an all-unknown defender and a genuinely fought control.
8. Rename actors and shift dates without changing results; change true Johnston
   position without a received report and leave the commander's picture and
   the geographical Valley set unchanged.

Only after these cheap controls should an authorized build measure against the
eventually committed S126/S129/S130 packets, preserving each baseline separately.
Return any new zero or band breach with cause and live driver before its hook;
review the time band when the fix lands, as the lead ordered. This document
authorizes no capture, tuning, pack edit, implementation or extra campaign.

Findings outside my scope
