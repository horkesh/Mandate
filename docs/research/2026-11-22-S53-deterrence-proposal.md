# S53: one deterrence calibration, measured and not applied

**Proposed ruling [I]: reject applying this global change.** Raising
`deterrenceWeight` from 250 to 1000 reduces routine reservations and slow
walks, but breaches other accepted floors and does not repair the missing
historical traffic. Keep the live pack unchanged. This is one candidate,
not a parameter search, and no band moved.

## What the terms mean

The current formula charges an absolute boldness mismatch against the
person's temperament (or his own best plan when provided), at weight 400.
Deterrence first combines oversight and the leader's credibility, discounts
it by the proxy's standing, then applies another weight of 250. This makes
the final willingness contribution one quarter of that already discounted
expected sanction, with integer truncation at each operation. Both terms
are design scales, not measured psychological quantities.

S37's sourced cases constrain acts and their causes; they do not estimate
either coefficient [I]. Harney's agreement of 21 May and the instruction
of 27 May concern authority, policy and his own judgment, not an ordinary
requisition's mild temperament mismatch: OR I-3 **pp. 374–376**, reread in
the [S37 edition](https://archive.org/download/warofrebellionco03unit/warofrebellionco03unit_djvu.xml).
Morgan's 18 April acknowledgement reports steps toward compliance with the
call, OR III-1 **p. 86**, reread in the
[edition OCR](https://archive.org/download/warofrebellion0301rootrich/warofrebellion0301rootrich_djvu.txt).
These are examples of qualified action and ordinary compliance, respectively;
neither establishes a numerical sanction coefficient [I]. Welles's
administrative and voyage delay, *Galaxy* 11(1), **pp. 95–97**, also does
not turn elapsed transport into a temperament-based hold [I]. See the
[floor audit](2026-11-21-pushback-cases.md) and the separate
[proposed classification record](2026-11-22-S53-proposed-0099-amendment.md).

Across this branch's eight baseline histories, **340 actual addressee
responses** are reservations or slow walks: **124 reservations and 216 slow
walks**. There are 294 call answers, eight appointment answers, 37 transfers
and one goal. Every contribution vector sums exactly. The only nonzero
terms are temperament **−152..0** and deterrence **+7..+48**; values, regard,
capacity, disposition and grievances are zero in these rows. This is kernel
diagnostic truth, not evidence that those historical people acted that way.
The earlier S37 corpus was 331 rows; it is not substituted for the current
baseline. Repeated orders and both governments remain counted.

## Predetermined candidate and method

Test **deterrenceWeight 1000**, with temperamentWeight **400**, complyAt
**10**, every other rule and all bands fixed. The hypothesis [I] was that
removing the extra quarter-weight discount might reduce routine pushback
without weakening the boldness penalty or moving an admission threshold.
The candidate is a measurement-only World override; no live `pack.json`
or generated world was altered.

The measurement contract was retained before the runs. Both one-day startup
variants passed with zero rejected commands. The study then ran one baseline
and one candidate history for each seed 1861–1868, **148 days each**, with
daily hashing, exact responses and command logs. It performed no policy
forks or victory sweep. Total measured execution was **545.56 seconds**
(about nine minutes on the shared host, above the initial estimate), excluding
startup/loading outside those intervals. This is not a tick-budget benchmark.
All sixteen histories had **zero rejected commands**. For seed 1861, each
variant's daily logged replay and saved-midpoint resume matched. These replay
checks are not claimed for the other seven seeds.

## Results against unchanged bands

| Seed | Reservations, 1..9: baseline → candidate | Slow walks, 2..9: baseline → candidate | Plan objections, 10..42: baseline → candidate | Relay holds, 2..6: baseline → candidate |
|---:|---:|---:|---:|---:|
| 1861 | 17 → 3 | 18 → 1 | 38 → 6 | 1 → 0 |
| 1862 | 20 → 3 | 19 → 6 | 27 → 11 | 4 → 0 |
| 1863 | 20 → 0 | 30 → 7 | 21 → 11 | 4 → 0 |
| 1864 | 8 → 0 | 26 → 5 | 32 → 9 | 0 → 0 |
| 1865 | 10 → 0 | 38 → 13 | 21 → 7 | 0 → 0 |
| 1866 | 14 → 2 | 24 → 8 | 20 → 9 | 0 → 0 |
| 1867 | 8 → 6 | 25 → 2 | 39 → 11 | 0 → 0 |
| 1868 | 27 → 4 | 36 → 4 | 10 → 5 | 0 → 0 |

Relay objections remain **2** in every pair, within **0..6**. Filter holds
remain **0**, below **1..9**; trims remain **0**, below **1..4**. No mechanism
or historical holder was invented to fill them. In the candidate, reservations
fall below their floor in three seeds, slow walks fail in two, and plan
objections fall below their floor in five. No seed satisfies every pushback
band. The surviving candidate reservation/slow-walk corpus is **64 call
answers** (18 reservations, 46 slow walks), still driven solely by temperament
and deterrence.

Every pair has **147 changed daily hashes, days 2–148**: **1,176 changes**
across the eight pairs. The first divergence is a recorded deterrence term,
even where the rung remains compliance. For example, the same day-2 consult
answer has deterrence 40 → 161 and unchanged other contributions. The first
counter changes occur on day 4 in recruitment. Later changed command timing,
recruitment, plans and operations are downstream effects [I]; the evidence
does not label all later differences as direct coefficient arithmetic.
In seed 1861 a Union operation fights at Manassas in the candidate; this is
an observed side effect, not a historical-force correction or a reason to
accept a calibration that violates other criteria.

The complete compact trace lists every changed hash, daily counter and
liveness row, together with response pairs, contributing terms, cause labels
and every checkpoint/operation score. Raw files retain full reasons and seat
command logs; kernel-default call packets were not individually reconstructed.
All **434 runtime inputs** matched the committed `8714ec93` source
snapshot during and after measurement. The baseline's **148 daily hashes**
also match the retained S42 reference exactly. No runtime input was changed
to produce the report.

## Evidence and reproduction

- Portable evidence: [_pushback/s53-calibration.json](_pushback/s53-calibration.json).
  Its tuple-column and omitted-zero definitions are in the JSON header.
- Recipe: [_pushback/s53-calibrate.ts](_pushback/s53-calibrate.ts), run with
  `node --import tsx docs/research/_pushback/s53-calibrate.ts --startup`, then
  once without `--startup`. It writes only `runs/s53/calibration/`.
- Consolidation: `python docs/research/_pushback/s53-build-evidence.py`.
  It writes detailed and portable outputs under `runs/s53/`; the delivered
  compact JSON is byte-identical to its portable output.
- Raw contract, logs, exits, input hashes, preservation and source-verification
  receipts are under `runs/s53/`. Sixteen raw result files are identified by SHA-256
  in the portable evidence; external historical scans remain in S37's source
  folder, outside all worktrees.

## For the lead

1. Reject applying the measured global weight increase. A better reservation
   count does not waive missing floors or lost plan objections.
2. Keep the generic carrier/disclosure paths for whole-branch review, apart
   from unresolved historical route/holder admission and the classification
   proposal. Do not substitute these synthetic fixture journeys for a verified
   March–July resistant carrier.
3. Route any further calibration as a new bounded question about order terms
   and the sourced acts. This study tried no second candidate.

## Findings outside my scope

Historical carrier appointments and route admission, quantitative rulings on
0099's floors, other sprint lanes, integration, Linux CI and gate approval
remain with their owners. The required final binding done check is reported
in the S53 closeout, not claimed by this paired study. Nothing is signed.
