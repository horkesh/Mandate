# S129 evidence — initial capture; corrected measurement pending

**Not complete, not committed, no acceptance claimed.** The one148-day capture
ran106.874s and exited1 on four liveness gates. It has zero rejected commands,
exact replay, day60 resume and saved-log replay. Its immutable result is
`runs/s129/capture/`; baseline is retained S126 at4b45f4e1, never rerun.
Final hash: `46575420f5abaab7ae05c0246ad47c75b72743e8da57083fb254b26c28972a28`.

[All33 verdicts and causes](rows.csv), [full coverage](coverage.json),
[C25's complete measured path](C25-path.json), [source correspondence](source-correspondence.json),
[every issued order with receipts and answers](issued-correspondence.json),
[regiment paths](command-paths.json), [local choices](local-choices.json),
[every final changed lot](lot-changes.json), [lifetime lot changes](lifetime-lot-changes.json),
[strength provenance](strength-comparison.json), [every liveness count](liveness-counts.json),
[criteria](criteria.json), [answer changes](answer-changes.json),
[operation](operation-changes.json), [plan](plan-changes.json) and [battle changes](battle-changes.json).

The33 verdicts remain5 matched,3 mismatch,3 not_observed,22 representation_gap.
C25 remains not_observed.98 final lot rows and87 lifetime lots differ; these
include location/assignment differences, not98 new regiments.53 response rows
and54 liveness count/magnitude rows differ. Full causes are retained and labelled
as inference where the combined trajectory does not isolate an individual cause.

## All failures and the correction question

Three new zeros require the lead's ruling before any quiet band can be installed:
`combat.withdrew`, `operations.repulsed`, `planner.term.time`.
`orders.returned` fires1 above its inherited0..0 band. No band, quiet rule,
criterion, score or source-derived personnel quantity has been changed.

The initial source execution is incomplete:

1. Letcher's assignment was dispatched on day49 to the future Richmond post,
   although the model's unposted Lee was at Washington and changed service on
   day51. It was returned before a receipt/answer. The corrected transport
   addresses the named person, as an ordinary appointment does; the retained
   pre-service-state fixture computes day54 arrival by the existing route.
   No date, speed, service choice or receipt has been forced.
2. The national paper was issued day66, received/answered day78 and opened
   Lee's Confederate command. He selected a local hold day79; it completed
   day86 but continued reserving the entire Tennessee block forever. Neither
   onward order was offered. The correction releases only commitments whose
   operations have all completed, retaining pending and live commitments.
3. A changed-service command recipient lacked his own service-choice paper in
   his local knowledge; a local draft also used the opening faction. The
   corrected assignment receipt files the recipient's existing own choice,
   and local drafts use his current own service. It never writes a service
   choice or discloses another person's private state.

Failing regressions and targeted corrections are retained in
`runs/s129/red-capture-diagnosis.log`, `red-completed-binding.log`,
`red-own-service.log`, `corrections-verified.log` and `corrections-types.log`.
The retained failed state now offers both onward orders in the cheap check:
`runs/s129/correction-proof.json`. The separate source-path fixture opens
both commands and selects both orders while preserving every lot:
`runs/s129/source-path-proof.json`. These are prerequisites, not a replacement
for historical measurement. No second capture has run.

The final focused correction run passes53 tests in4 files; typecheck, the44
ownership checks, boundary and rules checks pass. Additional64 rules tests and
licence checks pass. No whole-suite or hook success is claimed. The reciprocal
concurrent declaration also allows the two valid assignment receipts to arrive
in either order. An ineligible named recipient now receives and answers the
paper with a persisted institutional refusal, rather than treating his future
command's vacancy as failure to find him.

The capture's525 runtime input files are byte-exact:517 remain unchanged and
the8 changed measured inputs are archived in `runs/s129/measured-inputs/` with
matching pre-measure SHA256s. [Measured-source preservation](measured-source-preservation.json)
separates that tested capture from the later corrected working tree. No second
measurement is implied by preserving/reformatting those exact archived bytes.

## Source and representation limits

[Read instruments and rejected alternatives](../../research/S129/assignments.md).
S126's retained state already names Turney and Bate; its prose claim of
anonymity was incorrect. S129 preserves those identities and fixes extraction
from their shared block. The separate Turney instruction/receipt and particular
President-to-Walker instruction remain unread. The institutional War Department
root is read in the establishing act, ch.IX,p.32. No Ruggles holder, Holmes
substitution, new troops, historical return or prefilled receipt is supplied.

The remaining measurement question is the corrected ordinary trajectory, not
whether bands can be tuned to make the initial run pass. A further148-day capture
would cost about2minutes and must preserve the first one. The owner explicitly
requested one measurement, so another is pending authorization. Any remaining
new zero still needs the lead's exact ruling. The ordinary hook and commit have
not run; formal review/signatures/main integration remain deferred0106/0107.

Findings outside my scope
