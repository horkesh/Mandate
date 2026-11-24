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

## Step 3: share exact morning derivations

The session's existing disposable view cache now carries weakly keyed local
options for the exact State object, indexed by world, day and person. Request
construction and tick validation share these options; execution revalidates
against its actual State, so a new State cannot reuse the frozen morning's
authority. Local grant, sender and onward-assignment readers also use the
existing dependency-checked received-view cache. No cache enters State or saves.

The new work-count control first fails on duplicate drafting, then passes with
State identity, world, day and holder invalidation. All 37 receipt/mandate tests
and typecheck pass. Every original daily hash/counter/score is exact again.
Two alternating pairs against `77565d17` measure candidate war 48.58/48.36 ms
median (p95 88.58/94.31), history 48.68/49.81 (p95 95.16/92.51). A direct
additional pair against step 2 measures 55.66 -> 48.11 ms war and
54.62 -> 49.20 ms history. No Linux acceptance is inferred from these Windows
numbers. All eight protected-reader identities are unchanged.

The first step-3 hook failed only the banned-API scanner (2,451 other tests
passed): an inline type-position `import(...)` was classified as a dynamic
import. A normal `import type` fixes it without changing the scanner. Rolldown's
emitted JavaScript is byte-identical, so all timing and hash evidence is reused.
The 52-test correction set, typecheck, boundary, rules, licences and decisions
all pass before the required hook retry. `step3-type-correction.json` records
the emitted-code equality; no expensive measurement campaign is repeated.

Step 2's ordinary hook passed in 226.93 s and committed `99955788`. The S85
snapshot helper initially acquired a mojibake BOM through the Windows default
decoder. Only the S146 measurement process was interrupted; the helper was
read as UTF-8 explicitly, its parent snapshot passed a three-day smoke, and
the already completed baseline sample was reused. No simulation run was tuned
or source changed for that correction. Evidence: `step3.json`,
`step3-projection.json`, and retained raw receipts in `runs/s146/`.

Proposed [I]: retain disposable, exact-input sharing. Reject persistent caches,
partial State keys, reuse of an earlier execution State or relaxed revalidation.

## Findings outside my scope

Hosted Linux timing acceptance, S141's held data, 0133 implementation, integration
and pushing remain with the lead. S145's retained eight-seed evidence is reused;
this performance work does not waive its failed or unresolved 1A criteria.
