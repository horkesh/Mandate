# S31: next sources for 163 unknown strengths

Completed S31's bounded next-source pass on 21 November 2026, `sprint/research-military`, from `603774ddb40ff7b393aff097ce3c067c41361092`. Research drafts only under 0106; review remains Claude's. No active input, runtime, checkpoint proposal, post, store or signature change. Sources/evidence: `C:/Pyrrhic/mandate-research-sources/S4/S31/`.

## Delivery and limits

All **163 S21 unknown IDs** have dispositions: **14 quantified observations / 149 still unknown**. The 14 are **one reported observation, three estimates, eight source reconstructions and two exclusive bounds**; they are not 14 exact all-arms battle-day duty returns. The original 253 numerical force/companion observations remain unchanged. There are now 267 numerical entries among the same 416 observations/62 snapshots.

Start with the [register](../docs/research/2026-11-21-S31-strength-dispositions.csv), [research note](../docs/research/2026-11-21-S31-next-strength-sources.md) and [source inventory](../docs/research/2026-11-21-S31-source-inventory.json). Every row retains S21's exact next-source request, further printed pages searched, result/access limit and next return needed. Battle formations were taken first. No regiment-count estimate, parent allocation, casualty inversion, invented crew or gun-personnel multiplier was made. Bounds stay exclusive. The earlier unknown wording in newly quantified force notes has been updated to point to the dated S31 observation.

The inventory covers 28 cited scans, 2,310,730,145 bytes and 390 retained selected-page records, including reread passages; three scans are new, 25 reused in place. Seven finding aids have retained HTML/hashes. No whole-volume or 390-complete-page reading claim. Numerical passages and page/plate offsets were checked; corrections/exclusions are in `page-corrections.json` and the inventory.

**Original manuscript access remains incomplete:** no individual Army manuscript morning return or Navy ship muster was acquired/read. NARA's guides supply more precise record-group/entry/series routes, including digitized Navy series 563603. Catalog attempts did not produce a verified vessel/date roll; unverified filters are not evidence of a searched roll or absence. Those holds remain explicit. The Hartwig and Perryville PDF acquisition limits are disclosed; neither supplies a delivery quantity.

Useful original observations: Ricketts 3,158 taken into action September 17 (OR I-XIX.1 p.259); Meade **under** 3,000 that day (pp.270-271); Sykes rounded 4,500 at Gaines' Mill (OR I-XI.2 pp.348-349); Peck **less than** 1,400 in hand after detachments June 28 (pp.215-219); **[I]** McCook's two field-division counts sum to 12,500, excluding separately listed Gooding (OR I-XVI.1 p.1042). These retain their restricted categories.

Carman narrative figures are attributed reconstructions/estimates, not original returns. The appended game roster on pp.144-161 is wholly excluded. Richardson's 4,029/4,039 transcription conflict stays unknown. Lee's 25,900 is September 16; A.P. Hill's 3,300 is infantry arriving on the field; McLaws' 2,934 includes infantry and the three engaged batteries. The note explains each difference. Wood's April 8 arrivals, Dix's adjacent August 17 number, December 1 Polk/Smith tables and December 31 grand-division material do not fill earlier dates.

## Verification

The pre-edit plan specified cheap dependency/startup, row/citation/readability and preservation checks before expensive validation; then the required no-git check, one default eight-seed campaign with drafting, and actual hooks. Expected cost was minutes per check/hook and 20-35 minutes for the campaign on a shared host. No package build or additional campaign. After the unexpected setup timeout, inspected the failure and every unreached gate, verified the unchanged file alone, then changed only supported worker concurrency for the required retry. Tests, configurations, timeouts and criteria were not weakened.

Final data inventories, runtime diagnostics and preservation checks preceded this closeout. `data-inventory.json` pins 69 data/source artifacts; the original 1,748 protected paths remain unchanged. The complete row/citation/hash audit has **7,742 passes / zero failures**. Own-worktree package resolution passes. The first audit's 1,690-path result is retained; the final audit narrows the allowed mutation set and verifies 1,748 paths.

| Check | Result | External evidence |
|---|---|---|
| First install | exit 0; 51 packages; zero vulnerabilities | `npm-ci.log`, `.exit.txt` |
| Startup/typecheck | exit 0; local workspace dependencies | `typecheck.log`, `.exit.txt`, `runtime-resolution.txt` |
| Initial no-git check, two workers | exit 1; 136 files pass; one 300-second setup timeout | `npm-check.log`, `.exit.txt` |
| Unreached boundary/licences/decisions | each exit 0 | `*-after-timeout.log`, `.exit.txt` |
| Unchanged failed file alone, one worker | exit 0; 14 passed/one skip; 227.41 s | `timeout-targeted.log`, `.exit.txt` |
| Eastern actual hook, one worker | exit 0; 139/1548/1/3; 708.95 s | `hook-east.log`, `.exit.txt` |
| Required no-git retry, one worker | exit 0; files/passed/expected failure/skips: 137/1530/1/3 | `npm-check-one-worker.log`, `.exit.txt` |
| One default eight-seed done check, with drafting | exit 1; Phase 0 5/6; supplemental 1A 2/6; 11 problems; 1,317.11 s | `done-check.log`, `.exit.txt`, `runtime-diagnostics.json`, `run-copies/` |
| Final batch actual hook | its settled post-commit receipt is external | `hook-final.log`, `.exit.txt`, `final-checks.json` |

Counts are files/passed/expected failure/skips where compact. The no-git mode excludes only its two Git-writing fixture files. Actual hooks retain Git fixtures. No hook bypass, push, history rewrite or unchanged expensive retry loop.

## Runtime diagnostics and reused evidence

The single campaign retains the unchanged 40/160 ms budget and all acceptance criteria. Reference final hashes equal S21: Union `55a35b1034c19b09`, testbed `69d8759b02cfa93f`. Three raw run/drafting directories are copied externally; all 69 pinned data/source hashes still match after diagnostics. S21's unaffected source/runtime evidence remains historical evidence, explicitly distinct from the fresh S31 results. No Linux CI or idle-host measure is claimed.

| Run | Median ms/day | p95 ms/day |
|---|---:|---:|
| union-1861, war by decision, 148 days | 75.1 | 156.54 |
| testbed, 120 days | 3.8 | 5.28 |
| union-1861 history run, 148 days to 1861-07-31 | 33.4 | 54.96 |

The campaign's open problems remain open:

- union-1861, war by decision, 148 days: median 75.1 ms a day, over the 40 ms budget
- union-1861 history run, 148 days to 1861-07-31: men_confederate (1861-07-31, day 148): confederate has 20957 men, below 100000
- union-1861 history run, 148 days to 1861-07-31: operations_union (1861-07-31, day 148): union fought 0 planned operations, below 1
- union-1861 history run, 148 days to 1861-07-31: operations_confederate (1861-07-31, day 148): confederate fought 0 planned operations, below 1
- union-1861 history run, 148 days to 1861-07-31: no operation fought a battle in the history run (2 operations, 0 battles)
- union-1861 history run, 148 days to 1861-07-31: relay holds: 1, below the record's 2
- union-1861 history run, 148 days to 1861-07-31: filter holds: 0, below the record's 1
- union-1861 history run, 148 days to 1861-07-31: trims: 0, below the record's 1
- union-1861 history run, 148 days to 1861-07-31: compliance with reservations: 44, above 9
- union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: measured in part: the victory measure does not read people/grievance (policy pushback) (its own choice). Until it does (the people's response through self-emancipation waits for enemy capacity in 1B), no D6 result for this decision counts as evidence (G-1.14c, G-1.14d)
- union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: chain unexercised: no border governor answered a call inside the horizon of 24 moves weighed (seeds 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868), so the policy's effect through border loyalty on regiments was never seen (G-1.14b)

The runtime unknown-strength pass reads no Union battle records and clears none of these research drafts. No D6 clearance, band adjustment, timing waiver or second campaign.

## Commits and proposed rulings

1. `384993b`: Eastern reports, source reconstructions, bounds and explicit holds; actual hook passes.
2. The Western/non-battle/river/coastal and closeout batch's hash and hook verdict are recorded after commit in external `final-checks.json` and the single shared-CODEX status. This note avoids a self-referential hash.

**[I] Preserve limited dated observations and bounds.** Reject full-command/duty relabelling, equality for an exclusive bound, nearby-date backfilling or filling absent arms by assumptions. The 149 blanks are still research/integration holds.

**[I] Attribute reconstructions and hold source conflicts.** Reject appended game rosters, silent transcription correction or implied original-manuscript verification. Read the exact original morning/muster sheets named in the register before claiming exact returns.

**[I] Keep review/application with the lead and integration owners.** Reject automatic parent/child addition, simultaneous campaign rosters, inferred cast/service identities or author sign-off. Whole-branch and gate review remain Claude's under 0106.

## Findings outside my scope

S1/S2/integration retain the runtime problems above; the unknown-strength acceptance criterion is not waived. S12/1B retain temporal cast/service joins, command coverage and non-overlapping application. The 149 original-return gaps need the named archival sheets, not another pass that treats the published organisation/loss tables as full strength. Stores, unsupported checkpoint kinds and national holds are unchanged. Gate topics, wording, placements and signatures remain the gate reviewer's. No other sprint worktree was written; the sole main-checkout write will be the requested fresh-read CODEX append after the final commit.
