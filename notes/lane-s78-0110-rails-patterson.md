# S78: unknown contact, joining headquarters, rail traces and Patterson

For the lead: 3 items. S78 only, in `sprint/july`, from unchanged
`febfd38ca2241e35e8ab1013857470b7c0e4b45f`. S77's exact starting index was
`ab1ca4720dfaba321ef876dad227983265c4b20a`; its complete patch was saved before
editing. **The build is staged; July and the commit remain held.**

## Bounded plan

Implement 0110 with paired resolver and headquarters tests. Trace rail denial
from government accession through control and passage, preserving contested
regions. Read Scott's June/July orders in OR I-II before adding Patterson's
rule-seat goal. No historical strength, arrival, battle or band is fitted.

Validation: first startup/local dependency resolution, the new failing tests,
then focused combat/headquarters/control/doctrine checks, typecheck, rules,
boundary, pack/schema freshness, licences and decision index. After those,
run the full Vitest suite once with JSON results, beside all `check` chain
gates (roughly three minutes), and each
dedicated S77 reference once (roughly minutes), with replay/resume and complete
functional comparisons against S77. Stop expensive retries on failure; retain
all failure categories and use targeted correction checks. Commit the whole
stack only through the unchanged hook if its gates can pass; then run the
binding `--milestone 1a` done check once (roughly 30 minutes). Otherwise retain
the staged stack and full recovery patch under `runs/s78/`.

0110 was read from main without merging or editing main. Its accepted text,
0107–0109 and their existing amendment annotations are copied here so the
unchanged decisions check has its complete 110-record chain. Independent branch
and gate review remains with Claude under 0106/0107. Raw evidence is in
`runs/s78/`; portable results are in `docs/audit/s78-evidence/`.

## 1. 0110 and the July commands

The resolver recognizes a side whose **every present block** has unknown
strength. It retains those blocks and records the typed `unresolved_contact`
reason, with no losses, missing, captured stragglers, rout, withdrawal, commander
hit or control change. Unresolved status is derived from the existing block and
unknown lists; no saved field or second truth is added. Fixed stream draws are
preserved. A partly known side retains its former resolution. Unknown contact
produces a report of unresolved contact, without invented hourly fire or a
quantitative public result. A later resolved final day may still be published.
The unknown-strength scorer and its criterion are unchanged.

`mainBody` excludes every pending join. Headquarters remain derived; with none
joined, the declared seat/assembly remains the fallback. Paired tests failed
first on the original implementation and pass after the changes.

The frozen trace gives Johnston **Harpers Ferry** and Beauregard **Manassas on
every July day**. S77 instead followed incoming troops: Johnston to Nashville,
Murfreesboro, Tennessee, Chattanooga and Atlanta; Beauregard through Alabama,
Georgia, Raleigh and Southside. These are model addresses, not historical
commander journeys. Complete daily rows and before/after values are in
`headquarters-and-order.json`.

Davis issues the goal on day142, 25July; Walker objects. The bypass leaves on
day143, 26July, by **special messenger**, arriving day146, 29July: three days
instead of S77's five. Johnston objects on receipt; no junction is forced.
The accepted Richmond–lower-valley public wire (OR I-II pp.473,478, S77) does
not connect his model headquarters at Harpers Ferry. That line and its model
availability horizon are unchanged.

At 31July each Confederate command has **29,000 known assigned men, none yet
joined**, plus its local unknown force. Manassas has seven unresolved days,
25–31July: no quantitative contact, losses, capture or control gain. Beauregard
remains serving. This does **not** clear July or the unknown-strength criterion.

Collateral effect [I]: McDowell finishes with **63,000**, against S77's62,000.
The exact extra lot is Maine Second's existing model1,000 men. Its muster day56
and fixed expiry day146 are unchanged. `recruitmentPhase` excludes blocks in an
open battle from discharge; the unresolved battle remains open. S77 discharged
that lot on day146. `collateral-effects.json` retains both lot histories and
distinguishes day106's regrouping from discharge. No contract is extended in
the data. Whether open-battle expiry protection should cover unresolved contact
needs a subsequent lead ruling; it was not changed here.

## 2. Civil rail access and Patterson

The rail denial is reproducible without a campaign. Accession removes neutral
passage through `departmentFactions`; 0065 explicitly leaves `regionControl`
unchanged. Formerly open regions then have neither neutral passage nor a
military control trace. No historical railway opening is inferred from this.

S78 adds **derived civil rail access for the affiliated side only on land with
no control shares** [I]. It changes neither holder nor control. Existing
occupied, tied and below-threshold shares retain their former railway rule.
Unknown governments receive no exception. Supply and military wire ownership
still use control. Cache signatures now distinguish `no_control` from
`below_threshold`; the new adversarial cache test exposed the previous alias.

`rail-regions.json` reports each of61 affected model regions, their government,
faction, holder, holding reason, exact shares and old/new permission at June1,
July1,17,25,31. The two `frozen-*.json` files under `runs/s78/` retain every day
of June/July. Both reconstructed final control and government tables match their
saved final States exactly. Salisbury–Charlotte and Greensboro gain access on
uncontrolled ground; the holder remains null with reason `no_control`. No real
territorial-control claim is made. Existing Restored Government jurisdiction
continues to bar Confederate civil access where it is Union's.

**Remaining S78 seam:** ordinary occupation can leave a small share, ending
the no-control exception before the existing tracing threshold is reached.
Salisbury–Charlotte and Knoxville show this by31July; Chattanooga is already
below threshold in the new June snapshot. Frozen route diagnostics retain all
remaining bars and actual joining locations. Thus the administrative fix does
not clear concentration. No share, threshold, rail edge or opening date is
invented to remove the residual. S79 owns independent rail-line research.

Scott's June25 order says to remain before the enemy, with battle conditional
on strength and no mandatory pursuit to Winchester (OR I-II p.725). His July13
instruction makes demonstrations an alternative for detaining Johnston in the
valley (p.166); July17–18 reinforces that task (pp.167–168). July23 orders a
hold at Harpers Ferry unless a sufficiently strong enemy can expel Patterson
(p.173). Read-page artifacts and hashes are in `source-reading.json`, outside
all worktrees under `C:/Pyrrhic/mandate-research-sources/S78/`.

The doctrine therefore issues a **hold in `lower_valley` from June25**, then a
Harpers Ferry hold from July23 [I]. These use an optional doctrine posture;
omission retains `take` for every prior row. Geographic containment is an
approximation: the existing hold grammar cannot guarantee that Johnston is
pinned. Both orders use normal attention, relays and compliance. Patterson
complies with the first on day112 and reaches the lower valley on day126,
9July. Cameron slow-walks the second; Patterson receives and complies on day142.
He remains in the valley at the horizon. His14,000 three-month men still expire
on29July, leaving2,000. No date moves a force.

## 3. Verification, preserved evidence and conditional commit

The complete suite ran once to completion: **exit1,156.117s;218 passed/four
failed files;2,034 passed/five failed/three skipped tests**. Every failed test
and score has its reason in `failures-with-causes.json`. Four failing
assertions were already failing in S77; the added failure is S35's hourly
Manassas-paper assertion, because unknown contact no longer fabricates fire
phases. No July assertion was edited.

Disclosed startup error: my shell initially continued into the suite after an
obsolete expected cache-key string failed preflight. I interrupted that own
session immediately and retained its log; it is not counted as a completed
suite. The expectation was corrected, all26 map preflight tests passed, and an
explicit exit guard preceded the complete suite. The observer smoke also
caught a query for not-yet-established posts before any full reference.

The focused preflight passed156 tests. After the complete runs, a paired
publication test exposed suppression of a later known outcome merely because
an earlier day was unresolved. The corrected73-test combat/report/operation
set and typecheck pass. Frozen evidence proves that correction changes neither
reference: both publication predicates agree across118 Union record versions;
all502 testbed block versions have known strength. The unaffected reference
evidence is reused explicitly in `publication-reuse.json`; no full retry.

Both dedicated references ran once: zero rejections, exact replay, saved-log
replay and resume. Testbed is exact against S77 in **every functional field and
all120 daily hashes**. History's initial State is exact;102 daily hashes,
51 counter rows and416 daily fields change. Complete recursive functional
differences and mechanism-family explanations [I] are retained; these are not
isolated-intervention attribution experiments. History final hash:
`f69091979a99e9b83d267eb7b261990145341e9c9294f59b0e385df1d8ce8545`.

The history retains12 liveness failures, known Confederate strength95,153 below
100,000, three pushback breaches (trims0, reservations16, slow walks18), and
seven unknown-strength day failures. Existing operation scoring passes; that
does not clear zero quantified July contact or the missing junction. No band
is recentred. Shared-Windows median/p95: history38.79/83.30ms,
testbed3.65/7.45ms. No idle-host, Linux or100µs/block certification is claimed.

Package inventories and preservation preceded final prose: all2,138 starting
paths remain and928 protected paths are byte-exact. The two Patterson rows are
the only parsed pack/generated-World data changes. Four existing projection
derivation fingerprints are refreshed for joined headquarters and the civil
transport read; the added `governmentRailOf` physical reader is disclosed.
No exemption row, classifier, known-finding baseline, hook, lock, band,
signature, situation or regiment source changes.

**No commit or full-hook attempt:** fresh failures in the unchanged hook's
required tests prevent its passing. An unchanged expensive retry is not a cure.
The whole stack remains staged, backed up under `runs/s78/`, with composition
and reverse recovery checks. The binding done check remains conditional on a
passing-hook commit and was not run. No browser, desktop control, other-lane
write, push, merge or history rewrite occurred.

For the lead:

1. Retain 0110's build and paired tests. Review the open-battle expiry
   interaction before assigning a new bounded change; do not alter a contract.
2. Review civil rail access on no-control ground and the remaining own-share
   threshold seam. A possible next rule [I] would preserve civil access while
   every positive share belongs to that government's side, excluding any
   opposing share. This is proposed, not implemented or accepted here. Reject
   blanket accession control, fabricated250‰ shares and invented railways.
3. Retain Patterson's scoped geographic hold and source qualifications;
   reject an automatic Winchester capture, pinned enemy or forced junction.
   Preserve the staged recovery stack and the failed criteria for review.

## Findings outside my scope

S79 strengths, Charleston and railway research; S76's deferred seven terms;
other worktrees; whole-branch/gate review; main integration; hosted timing
certification; release and pushing. The remaining civil-access threshold seam
and unresolved-contact expiry interaction are explicitly retained above,
not relabelled as historical absences or cleared by passing unit tests.
