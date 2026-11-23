# S102: each call reads its own terms

23 November 2026. S102 only, `sprint/callterms` from `54395ef9`.
Authority is the lead's final "S101 received; rulings; S102" message in
`C:/Pyrrhic/ByOrderOfThePresident/CODEX.md`. No S100 or queued S99 build is
included. Nothing is signed or cleared for main.

## Application and source limits

The five byte-exact [S101 inputs](inputs/) retain the accepted **20 text
profiles**, **98 call instances**, value mapping, **27 governor dispositions**
and inherited source/page receipts. [apply.py](apply.py) transcribes the accepted
arrays without using governors' replies. Production contains 100 instance
profiles: the 98 researched instances, the unused national May proclamation
context, and the separately recorded July 12 brigade demand. Each retains its
shared `sourceProfile` identity, exact per-instance clauses, printed-page
`callProvenance` and limits. [application.json](application.json) lists every
assignment: **73 doctrine rows and 48 April option slots** (the same 24 quotas
under two choices). Minnesota's separately credited renewal remains recorded;
it is not another levy. The national proclamation and July 12 demand issue no
new troops.

Each command's `termsId` selects its paper; an identified doctrine call also
keeps its registered profile if the caller omits the selector. Unknown explicit
profiles and contradictory selectors are rejected. Dispatch carries the
immutable packet through every relay and the addressee. Empty arrays stay
empty. Only calls with no selected/registered profile use the explicit legacy
pack-wide fallback. Boldness stays 500. No current Confederate profile honours
Union, and no instance has blanket duty.

The six typed condition categories record service, organisation, appointments,
arms/equipment, destination and other conditions. Material records distinguish
resource, obligation and provider; quantities remain null. These are recorded
clauses, not executed contracts or inventory estimates. `required` stays zero:
all 96 addressee call answers have a zero capacity term. No governor's claim
becomes the means side of a balance.

The reserve's acceptance of unarmed companies is distinct from the cavalry's
armed/equipped admission condition (OR IV-I p.412), and the July 1 regiments'
officer selection is distinct from the reserve's Presidential field appointments
(p.416). The July 12 demand explicitly removes brigade organisation (p.466);
its `state_autonomy` offence is recorded only on that later, unissued demand.
It is never backdated from Brown's July replies (pp.477–478). New York's
two-year, State-armed tender stays distinct (OR III-I p.151); Indiana's original
GO15 requisition and McClellan destination keep their own pages (pp.263,265).

[source-receipt.json](source-receipt.json) distinguishes this application of
accepted S101 research from a new source audit: all 20 profiles and instance
differences were read; eight local primary extracts were also read and hashed.
The other original-page receipts are inherited S101 evidence, not a claim of
73 fresh primary readings. Unread originals, the Alabama arms wording,
Corinth/Memphis discrepancy and SC July 1 hold remain explicit in the copied
packet. No new cast judgment or historical material balance is asserted.

## Reference results

[comparison.json](comparison.json) gives the result. The targeted baseline
trace recovered missing before-response terms and independently matches all
148 retained S98 daily hashes, all 162 counters and all 256 raw acts by identity.
S98's prior baseline replay/resume evidence is reused. It was not a second
baseline validation campaign.

The initial five-reference capture is retained in `runs/s102/references/`.
The first build hook then rejected the missing immutable-record declaration.
The consolidated correction also gave the packet unique field names and guarded
dated-call selectors. [correction.json](correction.json) retains that failure,
diagnosis and cheap 55-test correction check. Only the two affected Union
captures were repeated, under `runs/s102/corrected/`; all 16 unaffected testbed
artifacts were reused byte-exact. The correction changes 12 intermediate Union
hashes because transit packets have the final metadata keys, while **every
counter and response record remains exact**. No expensive unchanged retry is
reported as new evidence.

Final results:

| Reference | Hash changes vs S98 | Counter changes | Replay/resume | Bands |
| --- | ---: | ---: | --- | --- |
| Union, 148 days | 145/148, first day 4 | 30/162 | both match, save day 60 | all pass |
| Testbed, 120 days | 0/120 | 0/162 | both match, save day 40 | all pass |
| Testbed silent commanders | unaffected evidence reused | unchanged | replay matches | all pass |
| Testbed editing principal | unaffected evidence reused | unchanged | replay matches | all pass |
| Union peace exercise, 30 days | final packet captured | no correction-related behavioral change | replay matches | all pass |

No commands were rejected. Initial State hashes are unchanged. Final Union hash
is `43b6f97952794f430872d2bdc37ff75dc458102c05628db9e300367881eb999b`;
testbed remains `160f67761bda23a1fe11ebacd92099ccbde4ff757171e00de45926136e1158db`.
All **340 existing band rows pass** in [liveness-review.json](liveness-review.json).
No band, cause-history record, quiet catalogue, threshold or acceptance criterion
was changed. All 268 full-reference hash pairs and 324 counter rows, including
unchanged rows, are retained with their causes. Daily summaries retain fire
counts; magnitude-only changes are identified separately, with exact totals
and raw battle/event records. Causal explanations describe this combined
intervention, not isolated additive estimates.

## Governors, coverage and strength

[governor-answers.json](governor-answers.json) covers every S101/0112 governor
disposition, plus C06's non-governor scope disposition. It keeps the historical
reply and qualified terms apart from each issuer's values/structural clauses,
and gives exact before/after response contributions, reasons, conditions and
rungs. Non-call matters and unissued requests have no invented call or rung;
C04's ordinary transfer replies are retained as diagnostics only. Exclusions
and source holds are unchanged.

Selected answers (actual willingness and rung; capacities all zero):

| Row | Before | After | Interpretation/limit |
| --- | --- | --- | --- |
| C01, Brown March call | object, −73 | comply, 127 | autonomy honour changes values by +200; no exact contractual reservation |
| C02, Brown activation | object, −73 | object, −73 | empty own-text arrays supply no invented honour |
| C03, Moore activation | comply, 144 | object, −56 | old duty reward removed; readiness replies remain comply |
| C05, Harris activation | comply, 33 | comply, 213 | own-text values change willingness, legal qualification is unscored |
| C07, Letcher reserve | comply, 67 | comply, 67 | no evidenced autonomy value contributes; appointment clause is recorded only |
| C10, Brown reserve | object, −96 | object, −296 | explicit appointment offence, not an arms deficit |
| C11, Moore extra/reserve | comply, 117 / 117 | object, −83 / −283 | loss of duty reward; reserve autonomy offence adds a separate value cost |
| C12, Brown July 1 | object, −96 | comply, 104 | own-officer honour; no July 12 offence backdated |
| U39, Morgan April | comply, 51 | comply, 51 | object-clarification qualification is not executed by current call grammar |

Pickens still reserves at willingness 7 on the June 30 reserve. That is **not**
C09's separate, unissued July 1 SC demand. [coverage.json](coverage.json) retains
all **33 obligations: 0 matched, 20 representation gaps, 9 mismatches, 2 exposure
mismatches, 2 not observed**. All 13 represented failures remain unmet.
[coverage-changes.json](coverage-changes.json) reports each row and its precise
candidate identities. Raw acts change **256 → 249**; every act, side/actor/
role/kind/rung count and relay/filter telemetry is in
[raw-pushback-diagnostics.json](raw-pushback-diagnostics.json). Raw counts confer
no historical credit and have no historical excess ceiling under 0112.

The 96 call addressees now give **74 comply, 21 object and 1 reserve**, compared
with 83/12/1 before. [reservation-diagnostics.json](reservation-diagnostics.json)
keeps every willingness/contribution. The unchanged reservation window is
0–9: C01=127, C05=213, C07=67, C12=104 and U39=51 remain above it; C02=−73,
C10=−296 and C11=−83/−283 remain below. These observations put the separate
question before the lead: how should explicit qualified compliance be answered
when structural clauses are recorded but unscored? They do not authorize
widening a threshold or fitting traits/weights here.

Confederate known strength falls **88,452 → 82,329** (−6,123), with **22 unknown
blocks** unchanged. [strength-reconciliation.json](strength-reconciliation.json)
balances the final known men by call/source origin, and [battles.json](battles.json)
keeps both battle records. Newly refused Louisiana, Tennessee, Florida and Texas
calls remove ordinary levies; Brown's March and July acceptances offset part of
that change. Subsequent physical allocation and combat losses account for the
remaining differences. No original source strength or gun stock was adjusted.
The 100,000-man checkpoint still fails, now by 17,671.

## Checks, preservation and handover

Cheap gates: `npm ci`, pack generation/schemas, typecheck, paired governor and
relay tests, selector/schema guards, complete ownership tests, startup replay,
rules, boundary, licences and decisions. The application audit passes 3,760
checks. Both projection fingerprints have the before/after receipt and add only
pack-authored profile selection; no hidden-State reader is newly exposed.

Before writing this report, the inventory preserved all **2,466 starting paths**,
all **29 signed files**, all **46 explicitly protected inputs**, 778 runtime
paths and four local workspace aliases. Twenty-five originals are intentionally
changed; none is deleted. Pack/catalogue/cast/starting-force data, quota/duration/
route rules, checkpoints, coverage registers, bands, signatures, hooks and CI
are unchanged except for the explicitly named call selectors/profiles and
generated schemas. Final inventories, staged-tree/hook receipts and recovery
proof stay in `runs/s102/`.

The build and measurement commits must pass the normal unchanged hook. The
normal eight-seed, drafting-retained binding done check follows those commits
once, with `--milestone 1a`. Its actual result, and final commit/hook receipts,
are recorded in the sole fresh-read UTF-8 Python CODEX append and the lane note;
this measurement report does not predict that gate's result. Standing/whole-
branch and sensitive-history gate review remain deferred under 0106/0107.

Proposed ruling [I]: retain per-paper reading and the recorded/unscored boundary;
route the evidence about qualified compliance to a separate lead decision.
Reject uniform Union/duty, actor-specific profiles, reply-derived issuer terms,
invented inventories, backdating, fitted thresholds, duplicate levies and raw-act
coverage credit. No acceptance criterion is waived.

## Findings outside my scope

Exact conditional-contract execution and reply/consent negotiations, complete
dated material balances and unread original sources; S100 and queued S99
implementation; repairs to failed historical/1A criteria; formal review and
signatures, hosted CI certification, main integration, release and pushing.
