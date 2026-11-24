For the lead: 3 items.

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

## Step 4 and settled delivery: index report-phase reconnaissance

One disposable index of stationary contacts by region replaces repeated sorting
and full-force ownership scans for each field commander's watched region.
It reads the same faction/offer, location, surrender, strength and assignment
rules from the single immutable report-phase State. Each observer still applies
his own side, and report ordering and minted IDs are unchanged. The index dies
at the end of `generateReports`; no persisted record is pruned or rewritten.

The work-count control first rejects the old 60 lookups against a bound of nine,
then passes. Five controls preserve unknown strength, detachments, zero strength,
surrender and embarked troops. Initial test expectations incorrectly called an
unbounded estimate partial/complete; both old and new code return unknown, so
the controls were corrected against the old code before the final comparison.
The 45-test targeted set, typecheck, banned APIs, boundary and rules pass.
Step 4 changes none of the eight protected-reader identities or fingerprints.

The first step-4 hook failed only one-writer's conservative scanner (2,457 other
tests passed): sorting an inline cast of a fresh `Object.keys` result was
classified as writing `forceLocations`. Hoisting that fresh array to a local,
as the existing `enemyAt` does, fixes the syntax without changing the scanner.
`step4-hoist-proof.json` proves exact source equality after inlining the local:
one identical key-list evaluation, sort and iteration. All captured behavior and
timings are reused. Both structural scanners, the contact/demonstration/capital
controls, typecheck, projection proof, licences, decisions, boundary and rules
pass before the required corrected hook. No expensive timing campaign is rerun.

| Serial unprofiled Windows slot | Base medians | Final medians | Final p95 |
|---|---:|---:|---:|
| War, paired run 1 / 2 | 88.40 / 86.30 ms | 44.11 / 41.47 ms | 85.84 / 87.27 ms |
| History, paired run 1 / 2 | 88.21 / 88.36 ms | 41.74 / 45.14 ms | 79.48 / 84.64 ms |

Median paired cumulative savings against `77565d17`: **44.56 ms war / 44.85 ms
history**. A separate direct pair against step 3 measures 49.14 -> 41.98 ms war
and 48.89 -> 42.35 ms history: another **7.15 / 6.54 ms**. These are Windows
observations, not Linux acceptance, and the default local 40 ms median budget
would still fail. The 40/160 limits and 0115/0117's binding Linux CI measure are
unchanged. The lead pushes and reads hosted CI; this lane never pushes.

Every step preserves all **416 daily hashes** (148 war, 148 observed history,
120 testbed), initial/final hashes, complete non-clock summaries, daily/liveness
counters and observed scores against the pinned entry. Final CPU-profiled runs
also preserve their complete non-clock summaries. The ordinary hooks exercise
the complete suite, including `runDoneCheck({sweepSeeds:0})`, daily repeat,
replay and mid-run save/resume. S145's full eight-seed and drafting campaign is
reused explicitly; all 37 files in its final inventory remain byte-identical.
No new eight-seed clearance, waived criterion or timing acceptance is claimed.

### The named additions, ranked by observed cost

1. **Mandates/local menus:** entry 6,248/6,337 sampled ms per war/history slot,
   final 496/511. Received views, address projections and unnecessary planner
   supply derivation dominate; `mayCommit`/`planAuthorized` themselves are much
   smaller (entry `planAuthorized` 67/59 ms inclusive).
2. **0130 beliefs/unknown remainders:** entry 1,007/1,064 sampled ms, final
   141/135. This includes the new `reconContacts` full-table scans, not only
   `latestEnemyClaims`/strength arithmetic. The early family classifier placed
   reconnaissance in "other"; the settled classifier includes it here.
3. **Onward orders/office calls/offers:** entry 592/600 sampled ms, final 154/150.
   Shared received views and exact morning options remove repeated setup.
4. **Receipt witnesses / `requiresPapers`:** only small resolved frames (history
   entry 4.67 ms). Matching/retention rules remain unchanged.
5. **Advice:** small resolved frames (war entry 1.56 ms); no advice rule changes.
6. **Readiness:** no separately resolved named sampled frame; its call fields
   are copied/validated inside request/recruitment paths. This is unresolved
   subframe attribution, not a measured zero or permission to remove work.

Named inclusive rows overlap. Family numbers are descriptive CPU samples,
exclude setup/unparented GC, and do not additively explain historical CI wall
times: those revisions also had different simulation workloads. Retained source
diff `60323786..77565d17` identifies these additions; no old-behaviour capture
was substituted for the entry baseline. See `hotspots.json` and `profiles.json`.

Final preservation checks precede this settled hand-over: all **3,412** original
tracked paths remain, **3,403** byte-identical; only the nine declared original
source/test/certificate paths differ. All packs, decisions, criterion/budget
inputs and original S145 artifacts are exact. Workspace aliases resolve locally;
Node 22.23.2, Python 3.14.3. The pre-hook evidence inventory retains 314 raw
files. `preservation.json` records their hashes and the declared changes.

Step 3 committed `d44e77fd` after the type-only correction, ordinary hook exit 0
in 218.54 s, 283 files / 2,452 tests passed / three existing skips. Step 4's
ordinary hook/commit receipt follows this packet in `runs/s146/step4-commit.*`
and the sole live CODEX status. Full logs remain in files. No hook bypass,
browser/desktop control, package/dependency change, other-lane import or push.

Proposed [I]: retain the four measured pure optimisations. Reject numeric/rule,
band, criterion, budget or workload changes; persistent derived caches; partial
cache keys; weaker authority/receipt checks; and claiming Linux clearance from
Windows. For the lead: (1) review these four commits, (2) push and read isolated
Linux CI against the unchanged budget, (3) retain S145's failed/unresolved 1A
criteria and S141's hold. Requested 5.6 workers unavailable; no independent
review is claimed, and formal review remains deferred under 0106/0107.

## Findings outside my scope

Hosted Linux timing acceptance, S141's held data, 0133 implementation, integration
and pushing remain with the lead. S145's retained eight-seed evidence is reused;
this performance work does not waive its failed or unresolved 1A criteria.
