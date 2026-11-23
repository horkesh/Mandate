# S64: July forces, notice route and liveness

22 November 2026. `sprint/1a`, still at
`c3c52a489964ed64546fb535b39fa52689991efc`. S64 only. No commits or push;
S46, S52 and this candidate remain staged. All work was headless.

**The July army implementation remains incomplete.** Three existing local
contingents have sourced receiving commands, but McDowell's divisions and
Patterson's army have no exact model identities. This candidate withholds
unidentified statewide batches instead of treating them as a field army.
Consequently it produces no Union July offensive or Manassas battle. This
is a conservative partial correction, not a historically complete outcome.

## Source inclusion and implementation

The [research note](../research/2026-11-22-S64-manassas-inclusion.md),
[42-row organisation register](../research/2026-11-22-S64-command-inclusion.csv)
and [cohort crosswalk](../research/s64-cohort-crosswalk.json) cover McDowell's
department/divisions, Washington, Patterson, Beauregard's brigades, Johnston
and the joining/reserve forces. The register retains June administrative
organisations, July arrivals, engaged subsets and later retrospective returns
as different observations. Fifty-six printed pages were read as extracted
text and ten inspected as images; 66 reading artifacts are hashed. The source
folder inventory also records 50 other extracted/working artifacts, without
claiming they were all read. All scans remain outside worktrees.

McDowell's 1,707 officers and 35,614 men total 37,321 for departmental duty
[I], not 37,321 crossing or engaged (OR I-2 p.309). The two May Manassas
battalions are partial local contingents (pp.824,826-827,846-847), not that
return or Beauregard's 21,863 army return (p.568). Johnston's 10,654 and
Patterson's 14,344 are separate June returns (p.187). **No historical total
was applied:** no existing block is one of these complete source commands.

The rule-seat projection now keeps each eligible named sending post's
destination independent of the latest concentration. Dates, received command
papers and received side still govern availability; a later Manassas command
cannot erase Johnston's destination. `receiveLevies: false` on the three pack
concentration rows leaves unallocated statewide batches at their current posts.
The ordinary transfer verb owns compliance, block selection and joining.
The Charleston harbour block and the whole Washington concentration are not
silently identified with northern field armies [I]. No force, strength,
enlistment or arrival was created; no combat/planner/movement/latency rule or
acceptance band changed. Rail-load throughput remains 1B's work.

The one 148-day diagnostic exits 0 in **24.95 seconds**, with **197 commands
and zero rejections**. Its final state matches the binding reference's final
state. The Harpers Ferry transfer is sent on day 87; the Manassas transfer on
day 98. At day 148 Johnston commands `state-forces.va_harpers_ferry`, while
Beauregard commands `state-forces.va_manassas_garland` and
`state-forces.va_manassas_preston`; all three strengths remain unknown.
McDowell and Patterson have no represented field army. The only recorded
battle is Fort Sumter's bombardment.

The initial state hash matches S52. The first daily difference is day 87:
the named local transfer replaces the Charleston sweep, and the unsourced
Union wholesale transfers are withheld. Six commands are added and 41
removed. [The comparison](s64-evidence/comparison.json) retains all changes.

## Why S52's notice took four days

S52's saved commands were replayed from day 60 through 146, once, with
**all 86 daily hashes matching**. This is evidence reuse, not a second
historical decision run. It verifies the notice at its actual sending day:

| Sending day | Sender location | Recipient location | Richmond control | Latency parts |
|---:|---|---|---|---|
| 142 | Walker's office: Montgomery | Davis: moved capital Richmond | Confederate 100 permille; no wire owner | wire 0 + from-wire ride 4 |

The message is sent on day 142 and delivered on 146, without another relay
or filter. Its `wire` label does not mean both endpoints are wired.
`latencyMapFor` uses held regions as wire access; it has no separate physical
telegraph-line catalogue. A courier all the way would take eleven model days.
The selected abstraction adds four days from the nearest owned wire access
to Richmond. It stores no intermediate wire-office itinerary.

The separate day-148 analytical probe finds Raleigh as the nearest owned
region, four courier days from Richmond. Giving only the copied analytical
Richmond endpoint full ownership reduces the route to zero; that hypothetical
input was **never written into a run**. The day-142 route is independently
verified above, not inferred from the later probe.

There is no missing graph segment to add to this abstraction. The record's
Richmond-Manassas correspondence and Johnston's acknowledgement identify real
telegraphic communication (OR I-2 pp.473,980-982), not authority to invent a
July Montgomery-Richmond access exemption to shorten this particular model
message [I]. The unmoved ministry office and Richmond endpoint access remain
explicit; the lead's institutional-office work after S62 is separate. No
control share, wire latency or source dispatch was fitted to four days.

## Why the original offensive began on day 142

The record orders the march on **16 July** (OR I-2 pp.303-305; the p.303
image corrects OCR's reading of the date). The model's unchanged goal row
also starts on that date, day 133. The retained S52 trace gives the delay:

| Model day | Act |
|---:|---|
| 133, 16 July | Lincoln issues the goal; Cameron slow-walks it. |
| 135 | Scott objects; the objection reaches Lincoln. |
| 136 | Lincoln sends around the chain; McDowell's planning record is opened. |
| 137 | McDowell chooses the direct candidate; assembly begins. |
| 142, 25 July | The candidate's five-day concentration ends; the axis marches. |

The response terms, plan stages and messages are retained in the comparison.
These are model mechanisms, not claims about the historical men's motives.
No date, concentration duration or movement/combat parameter was changed to
repair the lateness. The S64 candidate has no offensive because its army
allocation is unresolved; it does not supply a new corrected departure date.

## The two requested liveness causes

Both retained S46 and S52 reference summaries have **withdrew 1** and
**post_succeeded 5**. The notice did not introduce either count.

- The S46-created Garland and Preston contingents meet McDowell at Manassas
  on S52 day 144. Cocke's side lists both strengths unknown, with zero known
  present/committed/engaged. His believed ratio is 0 against a hold threshold
  of 750; he withdraws to Fredericksburg without a morale loss. The full side
  record is in [the cause receipt](s64-evidence/s52-liveness-causes.json).
- The five successions are Texas on day 11; Norfolk Taliaferro to Gwynn on
  52; Harpers Ferry Harper to Jackson on 54; Richmond Johnston to Magruder
  on 64; Norfolk Gwynn to Huger on 79. Four S46 Virginia notices add to the
  pre-existing Texas change, exceeding the frozen maximum of four.

S64 has no Manassas contact, so withdrawal becomes zero; the five successions
remain. That silence is not a demonstrated Manassas fix. Withholding the
unidentified armies also removes land combat and much joining, movement,
control and related message activity [I]. The full result retains **20
liveness problems**, including the succession breach. No band was widened,
recentered or retired.

## Validation and preservation

The default binding check ran **once**, including its default eight-seed sweep
and drafting measure:

`npm run run:done-check -- --milestone 1a --label s64-done`

It exits **1** in **3,153.63 seconds**: **Phase 0 4/6; 1A 3/6**. The complete
32 problems and all twelve criteria are in [the result](s64-evidence/done-check.json)
and [its full output](s64-evidence/done-check.txt).

| Failed category | Retained result |
|---|---|
| Phase 0 liveness | 20 problems; the changed force assignments explain reduced activity, not a waiver. |
| Budget | Reference median/p95 49.61/155.76 ms; history 53.15/178.07, against 40/160. Windows measurement, no unloaded-host or Linux certification. |
| Checkpoints | Confederate known men 95,153 below 100,000, with 23 unknown blocks; Union planned operations fought 0 below 1. |
| Pushback | Relay/filter/trim holds 0/0/0 below floors; reservations 17 and slow walks 18 above ceilings. |
| D6 | The people/grievance term is unmeasured and no border-governor answer is exercised in the weighed horizon. No clearance. |

The unknown-strength criterion passes with no Manassas battle; the three
local unknowns are still present. Both references replay and resume, with
268 daily hashes. Testbed's world/initial hashes, all 120 daily hashes and
all liveness rows match S52 exactly. The Union reference matches the separate
S64 diagnostic final hash.

Seven focused files pass **50 tests**, including four S64 regressions.
Typecheck, pack validation/generation, schema publication, boundary, licences
and decision-index checks pass. The required `MANDATE_NO_GIT=1 npm run check`
exits 1 at the same two inherited projection-truth entries and their two stale
baseline entries. The full suite is not reached; it is not claimed passing.
No fingerprint, baseline, checker or hook was bypassed. S62 owns that repair.
The index whitespace check reports one inherited blank line at EOF in
`packages/kernel/test/s52-advance-notice.test.ts:41`; that file retains its
exact initial indexed blob. No S64 whitespace finding is reported.

Before editing, the complete index was backed up as
`runs/s64/initial-staged.patch`, SHA-256
`dcedc38b92de2c91dac8ef63c7e73f98b816283581c10b208a87ade43a46ff05`.
All **1,960** original indexed paths remain; **1,950** blobs are exact.
The ten changed originals are the S64 doctrine/type/schema/data/test overlaps.
The rest of the pack, including all numerical, date and call rules, is
semantically identical after excluding the three concentration declarations.
All **392** frozen runtime inputs stayed unchanged throughout measurement.
Source/implementation, source-folder and runtime inventories were completed
before this report. Raw logs, exits, replay trace, source hashes and staged
backups are in `runs/s64/`; portable evidence is beside this report.

## Proposed rulings [I] and remaining work

Keep the three partial inclusions and unknowns. Retain the interim withholding
of unbound state batches until unit/cohort membership supports an allocation.
Reject wholesale state or Charleston assignments, army totals added over
existing levies, aggregate division over battalions, calendar arrivals and
outcome or band fitting. No new accepted decision or signature is written.

**Unmet S64 work:** complete McDowell/Patterson force allocation, the full July
Washington roster, and unrepresented brigades/reinforcements in the register.
The candidate is reviewable but does not complete the July force implementation.

Findings outside my scope: S62; the lead's separate institutional-office work
after S62; the other sprint requests; Linux timing; whole-branch/gate review
under 0106, integration and release. Nothing is cleared or signed.
