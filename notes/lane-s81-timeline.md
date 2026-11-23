# S81: accepted data, civil railway access and the Confederate timeline

For the lead: S81 only, sprint/july, inherited S78 stack preserved at
`runs/s81/starting-staged.patch`. Main, research lanes, hooks, bands, July
assertions and signatures are outside the write scope. Review remains Claude's
under 0096/0106/0107; the requested Sol/Luna model ids are unavailable here,
and no more expensive worker is substituted.

Validation plan: paired regression tests for discharge, civil access and own
aggregate returns, catalogue/local-force checks, typecheck, rules, boundary,
licences, decisions and generated freshness. Preflight must pass before one
complete suite (`MANDATE_NO_GIT=1 node node_modules/vitest/vitest.mjs run
--reporter=default --reporter=json --outputFile=runs/s81/full-suite.json`, about
three minutes) and one dedicated reference per pack (`node --import tsx
runs/s81/references.ts <pack>`, about minutes). The references must have no
rejections, exact replay, saved-log replay and resume. Compare every functional
summary change to S78, and retain per-block notices, requests, replies, raising,
assignment and each journey leg. Stop expensive retries on failure; corrections
get the smallest proving check. Commit the full listed lane stack only through
the unchanged hook when its tests and July conditions permit it, then run the
binding done check once with `--milestone 1a` (about thirty minutes). Otherwise
stage everything and retain a full recovery patch in runs/s81.

Anderson is deferred: S80 was not committed at the data-application step. The
read-only git observation is in runs/s81/data-apply.json. No uncommitted cast
row is imported.

## Implementation and sources

The two accepted rulings are implemented with paired tests. Discharge protection
requires that this block appear on a resolved day in the currently open battle;
a prior resolved engagement still protects it after an unresolved day. The Maine
Second retains muster day56 and expiry day146, and its surviving950 men leave
on29July in the reference. No contract or service credit changes.

Civil railway access remains derived from government affiliation while no
positive opposing share exists. Zero-valued opposing shares do not bar it; any
positive opposing share restores the existing trace threshold. No control,
holder, edge, opening date or supply/wire ownership is invented. The government
rail table changes in the existing network signature, so the cache cannot alias
an own-only and an opposing-share State. Frozen S78 inspection identifies260
region-days across13 regions where the old own-share seam barred access; the
ledger retains each government, faction, shares, holder and reason. Those
regions include both sides; they are not all Confederate territory claims.

Garland's490 are his own arriving force, reported14May and effective12May [I]
(OR I-II p.841). A separate dated `state_forces` return uses the existing stable
contingent id. The later15May unknown observation cannot overwrite it. This
exposes and fixes the cause of a dropped headcount: unknown regiment count had
forced even known men to null at entry, and barred a later own-contingent
return. One unidentified aggregate lot now preserves its known headcount;
quantifying it preserves identity and service. The original nominal-return
rule still refuses division of a larger aggregate among named regiments.
Preston remains unknown; no July return or catalogue lineage is inferred.

Only seven of214 catalogue records change; the other207 are exact. Maine3?6
retain the separate two-year State observations and gain their three-year
federal terms (Maine AG1861 p.6, AppendixF pp.2?3). Rhode Island1 gains three
months (official register pp.1,9), Rhode Island2 three years (p.39); component
muster dates are not regimental muster triggers. Washington Artillery gains an
explicit war contract (OR I-LI.2 pp.572?573, Walton's retrospective original
battalion account). Existing model conversions are labelled [I]:30days/month,
365days/year; war stays unbounded. Source-page artifacts and hashes are listed
in `source-reading.json`. All111 archival term holds remain held.

Anderson is deferred as expressly directed: S80 was not committed when the
Charleston application step was reached (`2728729e`, with S80 untracked).
No draft cast row is imported, no rank is invented and no department backdated.

## Confederate timeline and remaining divergence

All dates below are simulation dates [I]. Both frozen traces reconcile their
final control, governments, locations and joins exactly to their saved States.
The portable timelines give every request and reply, its route and duration,
actual/declared compliance and willingness terms, original call and levy,
raising/assignment, and each journey leg for all15 final direct army blocks.
There are61 S78 legs and120 S81 legs, including35 and97 completed short legs
respectively. Every inferred short leg has exactly one permitted candidate;
there is no invented shortcut. Battle retreats are retained as location changes,
not fabricated transport edges.

The15May notice fires day71 and reaches Davis day72; the3June reinforcement
notice fires day92 and reaches him day93. They are reports, not orders that
move troops. The headquarters establishments and received command knowledge
make the first local transfer requests eligible on days87 and98. Davis sends
them that day; seven- and four-day couriers produce the local assignments on
94 and102. Walker is a notice author/relay in this contract, not a separate
rule-seat transfer issuer. No ministry decision is invented.

The earlier raised forces had already been sent to Charleston. Most governors
therefore have no force left to hand over when the Virginia concentration opens.
Later sourced calls produce the July levies. In S78, Georgia's30June reserve
call goes117, arrives122 with compliance and musters127. Alabama's same call
is received with reservations and musters130. Mississippi slow-walks its29/30June
calls to136/137, and South Carolina slow-walks to139. Attention defers South
Carolina's call to120. S81 retains those compliance mechanisms; changed real
movement/control changes some message access and muster days by one day.
Every exact difference is retained, without claiming isolated attribution.

In S81 the governor requests go124(Tennessee),127(Georgia),130(Alabama),
134(North Carolina),136(Mississippi),140(South Carolina). The first five take
four days; the last also takes four. Except the North Carolina courier, they
use the offered wire route, including physical last-mile latency. Each sender
complies with the transfer; earlier call reservations and slow walks remain
in the raising record. Later repeated requests also meet opaque residuals or
already-departed troops; compliance is not proof that another force moved.
The complete ledger includes every such answer and pending request.

The corrected rail permission removes the own-share road detours, retaining
real distances. Tennessee's24,000 reach Harpers Ferry28July (join clears29July);
Georgia's5,000 complete the same concentration by30July. Johnston ends with
29,000 known assigned and joined men, plus his local unknown contingent. His
Manassas junction is still absent: the26July bypass messenger arrives29July
and he objects. No force is moved to make him comply.

North Carolina's16,000 fight at Manassas28July and11,249 fight again29July.
Arrivals that meet an enemy can retreat while the original joining instruction
is still outstanding; the trace retains that rather than claiming a safe join.
Alabama is at Culpeper?Orange, Mississippi at Chattanooga and South Carolina
in the North Carolina coastal plain at the horizon. Their leg histories retain
remaining distance and contested permissions. Charleston's unfilled command
and the earlier harbour allocation are still explicit limits; neither a reserve
headcount nor an unsupported reallocation is invented to meet a roster.

| Block | Raised | Assigned to final command | Final place / join |
|---|---|---|---|
| state-forces.va_harpers_ferry | 28 Apr | 07 Jun | harpers_ferry / joined |
| state-forces.va_manassas_garland | 12 May | 15 Jun | loudoun_fauquier / joined |
| state-forces.va_manassas_preston | 15 May | 15 Jun | loudoun_fauquier / joined |
| state-forces.cs_nc_state_transfer_north_carolina | 27 Jun | 21 Jul | loudoun_fauquier / joining |
| state-forces.cs_nc_volunteers_north_carolina | 27 Jun | 21 Jul | loudoun_fauquier / joining |
| state-forces.cs_nc_additional_north_carolina | 27 Jun | 21 Jul | loudoun_fauquier / joining |
| state-forces.cs_tn_infantry_tennessee | 29 Jun | 11 Jul | harpers_ferry / joined |
| state-forces.cs_tn_cavalry_tennessee | 29 Jun | 11 Jul | harpers_ferry / joined |
| raised.st_gov_georgia.d126.2 | 09 Jul | 14 Jul | harpers_ferry / joined |
| raised.st_gov_alabama.d129.2 | 12 Jul | 17 Jul | culpeper_orange / joining |
| raised.st_gov_georgia.d129 | 12 Jul | 14 Jul | harpers_ferry / joined |
| raised.st_gov_alabama.d132 | 15 Jul | 17 Jul | culpeper_orange / joining |
| raised.st_gov_mississippi.d135 | 18 Jul | 23 Jul | chattanooga / joining |
| raised.st_gov_mississippi.d136.2 | 19 Jul | 23 Jul | chattanooga / joining |
| raised.st_gov_south_carolina.d139 | 22 Jul | 27 Jul | nc_coastal_plain / joining |

Garland's known490 make25July a partly known defending side, so0110 now resolves
contact490 normally, with Preston listed unknown. That produces a rout, not an
unknown-only fictitious defeat. Beauregard is wounded in the28July fight and
his command becomes vacant; he is not reported captured. Three quantified
Manassas days do not clear Preston's missing strength. Beauregard's command
ends with20,741 known assigned survivors,351 safely joined, one unknown block
and eight joining blocks. McDowell ends with57,569; Patterson2,000.

## Verification and recovery

One complete full suite: exit1,183.031seconds;218 passed/five failed files;
2,041 passed/six failed/three skipped tests. Two stale fixtures are corrected:
the synthetic resolved-day record now supplies `bsideUnknown`, and catalogue
counts reflect101 finite/two war terms. The65-test correction set passes.
Four original required assertions remain rejecting: the human-console July
hour-stamped paper and three liveness checks. S35's separate Manassas-paper
test now passes; it does not waive the human-console assertion. All July
assertions are byte-exact. No full retry was made.

Preflight114 tests passed. The final source-policy/pipeline set passes36, and
the actual writer/post-succession selector passes53. An earlier source-policy command misspelled the writer path
and selected only its other three files; the actual writer test is run in the
later correction. Typecheck, rules, boundary, licences,110-decision index and
generated pack/schema freshness pass. Two existing physical-transport derivation
fingerprints change; no rows, reader classifier or finding baseline is added.

Disclosed editing faults: early default-encoding reads garbled catalogue citation
text and one invalid-succession apostrophe. They are restored from the preserved
UTF8 index. Only the seven intended catalogue records differ; numerical inputs
are unchanged by the text correction. Shape/missing-string preflight failures
were corrected before the long runs. The last apostrophe correction is absent
from every reference artifact and its refusal tests pass; the unaffected
reference evidence is reused explicitly. Red tests and all failed startup/check
logs remain in runs/s81.

Both references ran once: zero rejections, exact replay, saved-log replay and
resume. Testbed's120 hashes and every functional summary field are exact toS78.
History's initial State is exact;100 daily hashes,56 counter rows and729 daily
fields differ. All1,016 recursive functional summary differences have retained
before/after values and mechanism-family causes [I]. Final history hash:
`fe2a7d7267bd4e5d366fe06da299a8bc909d9f0e35b13792e8fa07fe128e2478`.

Remaining failures:14 liveness witnesses; known Confederate strength86,894 below
100,000; trims0, reservations16 and slow walks18 outside their bands; one
unknown-strength battle-day (Preston,25July); no Johnston-Manassas junction;
and the separate human-console paper assertion. No band is recentred and no
criterion is waived. Shared-Windows timing is49.21/104.00ms median/p95 for history
and3.58/7.57ms for testbed. This does not meet or certify the40ms budget; other
processes are retained in the runtime inventory. No Linux or100?s/block
certification is claimed.

Final package/runtime inventories and preservation checks preceded final prose:
all2,164 starting paths remain,926 protected paths are byte-exact, manifests
and workspace links are intact, and lot ownership is unique on all148 days.
Graph, doctrine, hooks, locks, bands, signatures and July assertions are exact.
The inherited S52 EOF whitespace warning remains; S81's delta is clean.

No commit or full-hook attempt: four fresh required-test witnesses still reject
the unchanged hook. An unchanged expensive retry cannot pass. The binding done
check remains conditional on a passing-hook commit and is not run. Everything
is staged and backed up under runs/s81; final recovery hashes are in the
final-receipt. Nothing is signed or cleared for main.

For the lead:

1. Retain the two accepted rulings and own-contingent headcount correction;
   retain scoped federal contracts and dated Garland strength without defaults.
2. Keep Preston/other strength holds, archival terms, the deferred Anderson
   apply, Charleston allocation and missing junction visible. Reject invented
   reserve quantities, forced compliance, fitted strengths and changed bands.
3. Review the whole staged branch under0106/0107; its failed gates still prevent
   integration. Raw evidence is runs/s81; the portable packet is
   docs/audit/s81-evidence.

## Findings outside my scope

S80 and other research work, archival records, whole-branch independent review,
gate signatures, main integration, hosted performance certification, release
and pushing. There is no new proposed canon ruling; these are accepted S81
rules and a data-loss correction. The harbour and junction limits remain
unfinished; contact alone does not make July pass.
