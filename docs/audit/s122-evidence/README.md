# S122: strength kinds and call establishments

For the lead: 3 items. **Built and measured; commit blocked by one new zero.**
S122 only, `C:/Pyrrhic/sprint-july`, `sprint/july`, from `5625454f`.
Read the lead's message and accepted 0121,0124,0125,0127 in the main checkout.
S120/S121 inputs were read only. S123 and S124 were not undertaken.

## Implementation and sources

`forces` owns immutable `RegimentLot.lotStrength`: kind, source and source date.
`ownership.ts` classifies it and FOUNDATION section10 names it. Kinds survive
quantity changes, splitting, organisation, saving and replay. Derived block,
force-sum and faction/checkpoint totals expose their known quantities by kind,
with unknown lot identities separately. A mixed sum is not described as a return.

Schema4 invokes the migration inside the forces owner. A model call's quantity
becomes `rule` even when a catalogue gave it a historical name. Institutional
source-act lineage overrides the old generated-identity flag: no historical lot
gets a rule quantity from that flag. Old historical quantities without saved
provenance become unknown. No return or receipt is invented. Old numeric model
outputs are preserved; migration does not retroactively recalibrate their call.

The checkpoint scorer reports pass, fail and unresolved. A below-floor count
with unknown lots that could close the gap is unresolved, which retains a
problem and cannot pass 1A. Ceiling/evidence failures outrank it. Groups may be
declared by department or command post with an exact dated, disjoint member list
and membership citation. The observer reconciles actual membership; group bounds
replace their constituents as bounds, never divide among or add to them.
Mismatched dates, incomplete/overlapping membership and duplicate lot identities
fail. Historical unknown battle participants remain non-passing under0110.

The pack replaces its universal1000 with11 organisation rows, each dated and
cited; all100 call profiles name one. April militia780 comes from OR III-I
pp.67-69. GO15 infantry866 and cavalry660/818/976 by four/five/six squadrons
come from pp.151-154; the printed866/660 were checked headlessly against scans,
not the erroneous OCR806/600. GO16 uses2020 for the three-battalion infantry
regiment,997 for three-battalion cavalry and997 for twelve-battery artillery
(pp.154-157). Model regular calls now use those minima; these are not actual
recruiting returns. New York volunteer artillery stays unquantified: GO15's
absence of that organisation is not permission to import a Regular establishment.
The unknown number of Confederate cavalry companies also stays unquantified.

Confederate infantry uses the accepted780: ten companies of64 privates plus
four officers, four sergeants, four corporals and two musicians (OR IV-I
pp.126-128,131,367). The April calls' alternative64-men wording stays explicit
(pp.231-233). No extra regimental appointments are added without a legal basis.
A call's explicit headcount retains its own rule quantity. Generated April
Tennessee lots, including Turney and Bate, regain that call's rule quantity;
historical naming does not replace it with a borrowed return.

[Every call and establishment](establishments-by-call.json) publishes each row,
its side, call kind, arm, organisation, effective date, minimum and printed pages.
The declared four-squadron volunteer cavalry choice is the smallest permitted
organisation [I], not an empirical mean. Testbed's explicit fictional legacy
size is retained for compatibility and makes no historical claim.

Historical Arkansas and North Carolina conversions become unknown men under
their regiments (OR I-III pp.609-610; IV-I pp.402-404). An included model call
keeps its men and its own lot; the historical remainder loses the included
regiment count too. This preserves15 unknown North Carolina historical ordinals
instead of recreating the already represented April-call regiment. Preston's
unreturned component remains inside S119's opaque Harpers Ferry pool; none of
S121's16 recovery holds is closed. Garland's490 retains Cocke's separate dated
unit report (OR I-II p.841), never the command918 or a new July return.

[The opening audit](opening-audit.json) publishes all83 opening rows. The explicit
S120 inferences for Louisiana forts, Fort Monroe, New Mexico, Pacific, Vogdes,
District militia and Washington regulars become unknown. St Louis490 remains
an estimate: integer interpolation on February20 between Harney's February19
493 and Hagner's February21 488 [I], not a March return (OR I-I pp.654-655).
Two other numeric controls lack any retained source date (Pickens82 and Water
Witch56); they become unknown rather than acquiring an invented dated return.
The other57 inherited numeric source attributions are carried with their
original citations; they were not re-certified against originals in this lane.
Their origin-kind subtotals are model data, not a newly established historical
all-return strength for July31.

Charleston's probable3000 is a whole-command estimate (OR I-I pp.261-262).
Morris Island's2000 includes Gregg1100, Cunningham418 and Kershaw300-500,
excluding artillery (p.302). Their constituent scopes/dates do not reconcile
with independently represented opening lots: the estimates stay in checkpoint
diagnostics, and no additional aggregate men are counted. Virginia's upward40000
of June17 (OR IV-I pp.388,390-392) and Tennessee's whole-army about22000 of
July23 (OR I-IV pp.372-373) likewise remain dated diagnostics. S121 supplies
no exact membership that permits a group declaration or allocation among lots.
No June/July23 estimate is moved to July31.

[Source readings](source-reading.json) retain34 selected page-text excerpts,
raw/delivery hashes and two actual headless image inspections. No browser,
Computer Use or desktop control was used. Accepted register citations below are
carried as register citations, not represented as newly read original pages.

## The single measurement

Baseline: **S119 at5625454f**, retained `runs/s119/references`; its file hashes
are in [baseline receipts](baseline-receipts.json). The plan named that baseline,
`node --import tsx runs/s122/capture.ts`, about two minutes, and the stop rule
before launch. `npm ci` passed with zero vulnerabilities. Both two-day startups,
local module links, sources, replay and resume passed before the long run.

One148-day headless capture with replay and day60 save/resume took **64.226s**.
Zero rejections; replay, resume and saved-log replay match exactly. Final hash
`857e6280da9ac2b44a7b95ffcdfe86f31b368d1a9b5ce6b35e2401ceb528629d`.
The command exits1 because it reports the liveness failures; this was not a
runtime crash. No campaign rerun, sweep or timing certification followed.
Unchanged testbed operational evidence is reused explicitly; its two-day
compatibility startup passed. The complete ordinary suite remains pending.

| Side | S119 counted | S122 return | estimate | rule | S122 counted | unknown lots / blocks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| confederate | 63910 | 3501 | 0 | 42856 | 46357 | 50 / 32 |
| union | 121575 | 6371 | 490 | 119165 | 126026 | 12 / 12 |

Unknown means unknown men, never zero. The kind columns describe the origins
of current model quantities after ordinary losses, not historical July returns.
[Both sides and every lot](strength-by-kind.json), [all63 origins before/after](origin-changes.json).

The Confederate checkpoint is **unresolved**,53643 below its binding100000
floor with50 unknown lots. Its historical100000..200000 band is unchanged.
The Union126026 lies inside its unchanged95000..250000 band; its floor remains
non-binding. Unresolved is not a pass. [All measured criteria](criteria.json)
and [scores](scores.json) retain each problem and cause. Unknown-strength now
reports Harpers Ferry day146 and three North Carolina blocks at Manassas on
days141,142,143,146. Only records can close those historical quantities.
Pushback still fails; operation passes in this capture only. Prior lever-sweep
failures remain unmet; budget and full-done certification are not supplied.

## All33 rows

| Row | Issued / received / answered | Before → after | Cause |
| --- | --- | --- | --- |
| U01 | no / no / no | representation_gap → representation_gap | Consult records an option recommendation, not the force, preparation and feasibility assessment on these distinct relief inquiries.; needed: a scoped feasibility assessment answering a particular proposed course in packages/kernel/src/tick/verbs.ts; packages/kernel/src/knowledge/report.ts Unchanged S119 verdict; no new credit. |
| U02 | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U03a | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U03b | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U03c | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U03d | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U03e | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U04 | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U05 | no / no / no | representation_gap → representation_gap | The existing consultation carries one situation subject and recommended option, but no addressed proposal or inquiry-round identity. Evacuating both forts, provisioning, renewed relief and proposed abandonment cannot be equated with one undifferentiated consultation. Existing stances/advice remain diagnostics, not evidence that advice content is wholly absent.; needed: consultation rounds and the proposed course each advice act addresses in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/people/people.ts Stance; packs/union-1861/situations/sumter_garrison.json Unchanged S119 verdict; no new credit. |
| U14 | no / no / no | representation_gap → representation_gap | Consultation option advice has no structured unsolicited administration programme or transfer of policy direction.; needed: an unsolicited policy programme and delegation proposal with an answer in packages/kernel/src/log/commands.ts; packages/kernel/src/knowledge/report.ts Unchanged S119 verdict; no new credit. |
| U25a | no / no / no | representation_gap → representation_gap | A field commander goal and a governor troop-raising call do not carry a governor alternative for troop transit through his state.; needed: civil troop-transit negotiation and alternative-route consent in packages/kernel/src/log/commands.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| U25b | no / no / no | representation_gap → representation_gap | The mayor is absent from the cast; no civic request carries his conditional protection undertaking. Adding a person alone would not encode the matter.; needed: a civic addressee and conditional troop-protection undertaking in packs/union-1861/source/world/people.csv; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| U32 | no / no / no | representation_gap → representation_gap | Goals hold, take or relieve a place; they do not ask a commander to change his depot and supply base before an advance.; needed: a depot/base-of-supply change request and counterproposal in packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| U33 | no / no / no | representation_gap → representation_gap | 0114 can carry an outmatched fallback and a commander proposal, but has no demonstrate posture or operational goal to detain another army by threats and demonstrations (OR I-II pp.166-169). A hold fallback would erase the alternative duty; the existing hold orders still do not expose the attack-or-demonstrate demand. S96 grants no coverage from approximate timing or destination.; needed: an attack-or-demonstrate instruction and its answer in packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| U34 | no / no / no | representation_gap → representation_gap | 0114 can carry an outmatched fallback and a commander proposal, but has no demonstrate posture or operational goal to detain another army by threats and demonstrations (OR I-II pp.166-169). A hold fallback would erase the alternative duty; the existing hold orders still do not expose the attack-or-demonstrate demand. S96 grants no coverage from approximate timing or destination.; needed: an attack-or-demonstrate instruction and its answer in packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| U39 | yes / yes / yes | matched → matched | One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register. Unchanged S119 verdict; no new credit. |
| U40 | no / no / no | representation_gap → representation_gap | Land force transfers do not carry a named warship removal and engineering-readiness matter.; needed: a naval vessel removal/readiness instruction and repeated deferral in packages/kernel/src/log/commands.ts; packages/kernel/src/forces/ Unchanged S119 verdict; no new credit. |
| U42 | no / no / no | representation_gap → representation_gap | Consult records an option recommendation, not the force, preparation and feasibility assessment on these distinct relief inquiries.; needed: a scoped feasibility assessment answering a particular proposed course in packages/kernel/src/tick/verbs.ts; packages/kernel/src/knowledge/report.ts Unchanged S119 verdict; no new credit. |
| C01 | yes / yes / yes | matched → matched | One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register. Unchanged S119 verdict; no new credit. |
| C02 | yes / yes / yes | matched → matched | One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register. Unchanged S119 verdict; no new credit. |
| C03 | yes / yes / yes | mismatch → mismatch | The same request received a contrary actual response or advice; declared compliance cannot hide it. Unchanged S119 verdict; no new credit. |
| C04 | no / no / no | representation_gap → representation_gap | The transfer grammar carries force and destination but no regiment-integrity or permanent-service consent terms.; needed: organisation integrity and gubernatorial consent terms on a troop transfer in packages/kernel/src/messages/transit.ts VerbBody; packages/kernel/src/tick/verbs.ts Unchanged S119 verdict; no new credit. |
| C05 | yes / yes / yes | mismatch → mismatch | The same request received a contrary actual response or advice; declared compliance cannot hide it. Unchanged S119 verdict; no new credit. |
| C06 | no / no / no | representation_gap → representation_gap | Land goals do not express stopping shipborne reinforcement at its dock without an island landing.; needed: dock interception of naval reinforcement with supply/transport qualifications in packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| C07 | yes / yes / yes | matched → matched | One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register. Unchanged S119 verdict; no new credit. |
| C09 | no / no / no | representation_gap → representation_gap | Qualification requires service_term/offer; needed: acceptance, consent or prerequisite execution in the recruitment, transfer, enlistment or operation owner. Recording a reservation does not execute it. Unchanged S119 verdict; no new credit. |
| C10 | yes / yes / yes | matched → matched | One act on the same issuing side, actor, role and bounded matter; nearest-type interpretation follows the accepted register. Unchanged S119 verdict; no new credit. |
| C11 | yes / yes / yes | mismatch → mismatch | The same request received a contrary actual response or advice; declared compliance cannot hide it. Unchanged S119 verdict; no new credit. |
| C12 | yes / yes / yes | representation_gap → representation_gap | Qualification requires organisation/offer; needed: acceptance, consent or prerequisite execution in the recruitment, transfer, enlistment or operation owner. Recording a reservation does not execute it. Unchanged S119 verdict; no new credit. |
| C14 | no / no / no | not_observed → not_observed | No act observed for this actor, role and represented matter. Unchanged S119 verdict; no new credit. |
| C15 | yes / yes / yes | not_observed → not_observed | No act observed for this actor, role and represented matter. Unchanged S119 verdict; no new credit. |
| C16 | no / no / no | representation_gap → representation_gap | 0114 adds received conditional goals and commander proposals, but its turned/outmatched conditions do not express a duty to prevent an enemy landing after withdrawal. OR I-II p.976 makes that responsibility the disputed condition; p.959 supplies battery-site context. No landing condition or Mathias Point mission is authored by S96, so generic fallback permission does not cover this act.; needed: conditional withdrawal tied to an enemy landing, with commander responsibility in packages/kernel/src/plans/goal.ts; packages/kernel/src/messages/transit.ts Unchanged S119 verdict; no new credit. |
| C25 | yes / yes / yes | not_observed → mismatch | The same request received a contrary actual response or advice; declared compliance cannot hide it. |

[Rows JSON](rows.json) and [CSV](rows.csv) retain actors, exact request/receipt
identities, expected-register citations and exposure causes. The only verdict
movement isC25, not_observed to mismatch: the model issued the retention goal
on day142, it arrived on144, and Holmes complied. That answer remains contrary
to the unchanged register. Raw diagnostic acts259→260; no count threshold was
invented. Coverage is22 representation gaps,5 matched,4 mismatches,2 not observed.

## Every changed lot, answer, band and criterion

[Lifetime lot differences](lifetime-lot-changes.json) publish374 changed
identities with their complete before/after day transitions, including expired
and removed lots. [Final differences](lot-changes.json) publish300 final
lot/assignment/location changes, including additive source-kind metadata.
[Answer differences](answer-changes.json) publish13 changed exact responses and
their additive terms; unpaired request/day identities are never silently matched.
Combined trajectory causes are marked [I], not represented as isolated effects.

[Band telemetry](liveness-bands.json) publishes all328 rows (39 changed observed
rows); testbed evidence is explicitly reused. [Band review](band-review.json)
publishes all four permitted positive recentres, their exact old/new limits and
causes, using the unchanged `around(observed)` rule. The one new zero remains
unapplied. No historical checkpoint, quota, trait, score weight or criterion moved.
Re-evaluation reads this same retained capture; no further simulation is needed
to evaluate a band-only ruling.

## The one required ruling

**Approve the exact proposed zero for `forces.landed_by_situation`**,1..4→0..0,
in [band-review.json](band-review.json). This is a proposal, not an applied waiver.
Vogdes's opening90 was unsupported inference. The original January25 paper
transmits a return but does not print it; the January23 order lists attachments
and maximum organisation, not returned90 (OR I-I pp.352-353). Under0125 the
parent becomes unknown, so its day33 quantified landing is refused. The order's
flag is not execution. No unsupported quantity is restored to make it land.

The independent [fictional paired control](../../../packages/cli/test/situation-landing.test.ts)
drives the unchanged situation mechanic: a quantified parent lands once; an
unknown parent lands zero times and records one refusal. **2/2 pass**, receipt
`runs/s122/landing-control.json`. Its driver/needle and exact band proposal are
retained. Four positive recentres leave one observed failure; structural band
problems are empty. The obsolete global quiet label for the now-live refusal
was removed, retaining its controls. The successful Union-opening assertion is
replaced by the honest unknown-parent expectation, verified directly against
the retained capture in [opening proof](opening-retained-proof.json).

The lead's S122 instruction says **“A new zero needs the lead's ruling.”**
Therefore the ordinary hook and commit were not attempted: its liveness check
is already known to fail. No bypass, skip, history rewrite or push occurred.
HEAD remains5625454f. After the ruling, apply only that exact zero/driver/history
receipt, run the cheap boundary/rules checks, then the ordinary hook and commit.
Do not rerun the measurement for that metadata-only change.

## Verification and preservation

Final boundary, rules, typecheck, licences and decision-index checks exit0.
Latest strength/save/scorer/schema check:72/72; rules:49/49; corrected Regular
and named-transfer fixtures:10/10; landing controls:2/2. The unaffected ownership
and banned-API proof is reused (63/63), with full protected-reader identities
equal to5625454f in [projection proof](projection-proof.json). Generated World,
schemas and the testbed save fixture were regenerated with their tools.

Earlier red tests and all cheap failures remain under `runs/s122/`: new behavior
first failed6/6; stale totals/schema fixtures and expectations were corrected;
migration moved into the forces owner; type-only imports use the scanned form;
a group-schema parenthesis was caught before startup; explicit undefined optional
keys in two synthetic call fixtures were omitted. An accidental test-only text
encoding change was restored from base before final checks. No correction fitted
a production number, band, trait or acceptance criterion. [Validation receipts](validation.json).

All462 captured runtime inputs remain byte-exact except the permitted liveness
band/quiet metadata. No simulation or pack input changed after capture. Before
final prose,2752 of2805 starting tracked files remained byte-exact; all53 changes
were accounted for. Final staged inventory, whitespace check, recovery patch,
private-index reverse proof and unchanged hook/HEAD receipts live under
`runs/s122/`. The main checkout receives only the requested one fresh-read UTF-8
Python status append. Nothing is signed; formal whole-branch and gate review
remain deferred under0106/0107. No new1A credit is claimed.

For the lead:

1. Rule on the exact one-zero proposal, with the independent paired control.
2. Keep the unresolved strength, unknown combatants, pushback/sweep failures
   and source-recovery holds non-passing; review the inherited source assignments
   with the whole branch.
3. After that ruling, run the unchanged ordinary hook and commit S122, never push;
   S124 and S123 remain separate lanes.

Outside this task: new returns/rosters, S123 mandates, S124 addressing/timing,
full independent certification of inherited opening sources, new campaigns,
formal review/signatures, main integration, release and push.

Findings outside my scope
