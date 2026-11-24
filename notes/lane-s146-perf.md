For the lead: 1 item.

# S146: hash-neutral tick cost

S146 only, `sprint/july`, pinned base `77565d17`. Headless throughout; other
worktrees read-only except the separately authorised final coordination append.
No push. Decisions 0115/0117 retain the 40 ms median / 160 ms p95 Linux budget.

## Step 1: discard unavailable grant papers before projecting addresses

`availableMandatePapers` first checks the unchanged date, outgoing dispatch and
received-paper predicates. It projects addresses only if an instrument survives,
using the original complete declared scope. This avoids rebuilding a received
view for a paper already sent or not yet due; recipient and authority rules hold.

Two alternating unprofiled pairs per Union slot, serial on this Windows machine,
save a median 7.32 ms/day in war and 7.55 ms/day in history against `77565d17`.
All 148 war, 148 observed history and 120 testbed daily hashes, counters and
observed scores match the base. Timings remain above budget; no Linux acceptance.
The focused work-count regression first failed with two redundant view calls,
then passed with the full receipt/mandate files (35 tests); typecheck passes.
All eight protected-reader identities remain exact; two dependency fingerprints
are recertified with their complete before/after closure proof. Boundary and rules
pass before the ordinary hook. Hook receipts are retained after this note.

Evidence: `docs/audit/s146-evidence/step1.json` and `step1-projection.json`;
raw captures, timing pairs, source snapshot, commands/exits and preservation
inventory in `runs/s146/`. The evidence collector initially compared its outer
wall clock too; narrowing that assertion to the already compared simulation
summary, scores and budget fixed the collector without repeating any run.

Proposed [I]: retain the pure early filter. Rejected: change issued identity,
address scope, rules, bands, budget, workload or any acceptance criterion.
The requested 5.6 worker models are unavailable; no substitute or independent
review is claimed. Formal review remains deferred under 0106/0107.

## Step 2: derive local planning inputs only for surviving goals

The unchanged issuer/order/recipient/ceiling guards now precede received-view
and map construction. A supply map is built once per local planning call, only
when at least one actual goal reaches drafting. No candidate, guard or ordering
changes. Two work-count controls first fail on the prior code, then pass; the
full receipt/mandate files pass 36 tests, and typecheck passes. Cheap gates caught
and corrected a fixture API mistake and closure narrowing before long runs.

Two serial alternating pairs against the original base measure war medians
84.02/86.10 -> 54.64/55.89 ms, history 90.58/88.23 -> 55.23/55.34 ms. The paired
cumulative savings are 29.80/34.12 ms/day. These are cumulative comparisons
against `77565d17`; their difference from step 1 is not an additive causal
estimate. Candidate p95s: 100.37/103.13 ms war, 106.53/105.86 ms history.
All 416 daily hashes and complete counters/scores match the original base again.
The eight protected-reader identities remain exact. Boundary and rules pass
before the ordinary hook; no rule, pack, band or budget changed.

Follow-up CPU profiles put local-options work at about 1.38 seconds per Union
slot, down from about 6 seconds at entry. The removed work was mostly supply
derivation and received views. Remaining costs include report generation,
received views, sender projections and repeated local-option construction.
Profiles retain setup separately; inclusive samples overlap and cannot prove
the historical wall-clock regression's additive cause. Receipt/advice/readiness
frames absent from samples are not claimed to cost zero.

Evidence: `docs/audit/s146-evidence/step2.json`, `step2-projection.json` and
`profiles.json`; raw profile samples, exact paths, logs and exits in `runs/s146/`.
Step 1's hook passed 283 files, 2,450 tests, three existing skips in 261.08 s
and committed `80d48e86`. Full original pack inputs and 3,412 starting tracked
paths remain preserved. Proposed [I]: retain lazy pure planning inputs; reject
skipping any authority check or changing local candidate/selection semantics.

## Findings outside my scope

Hosted Linux timing acceptance, S141's held data, 0133 implementation, integration
and pushing remain with the lead. S145's retained eight-seed evidence is reused;
this performance work does not waive its failed or unresolved 1A criteria.
