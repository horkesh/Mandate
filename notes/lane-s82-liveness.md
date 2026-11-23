# S82: liveness, the console path, Charleston and timing

For the lead: 3 items. S82 only, `sprint/july`, from
`febfd38ca2241e35e8ab1013857470b7c0e4b45f`, preserving the staged S81 stack.
The starting tree and binary patch are in `runs/s82/starting.json` and
`starting-staged.patch`. No other worktree was written, no browser or desktop
used, no gate signed, and nothing pushed.

## 1. The reviewed changes

All 162 history bands have retained daily firings and dispositions in
`docs/audit/s82-evidence/all-band-review.json`. Fourteen bands change under the
lead's S82 ruling, each with its old band, observed count, named events and
cause in the append-only record and `liveness-review.json`. Positive counts use
the existing `around(observed)` formula. No checkpoint or pushback band changes.

| Mechanic | S81 observation | Cause retained |
|---|---:|---|
| combat.flank_broken | 3 | One broken flank on 25 July, two on 28 July |
| combat.general_hit | 1 | Beauregard wounded on 28 July |
| forces.stores_low | 13 | Actual downward stores crossings; improved civil rail journeys remove the long S78 stalls [I] |
| forces.stragglers_returned | 64 | Actual July losses return to supplied surviving blocks on their non-battle days |
| map.pocket_closed | 8 | Newly traced isolated footholds, then the loss of the Manassas supply route |
| map.pocket_relieved | 1 | The route through Loudoun and Manassas relieves three regions on 26 July |
| messages.special_messenger | 1 | Davis's 26 July bypass to Harpers Ferry arrives 29 July |
| operations.works | 7 | The retained works stages on days 128–131, 144, 145 and 148 |
| orders.returned | 0 | No reference dispatch reaches a changed/vacant post; exact quiet band, existing separate live driver |
| planner.term.caution | 1 | Patterson's Harpers Ferry draft, 25 July |
| planner.term.force_ratio | 1 | The same received-input draft |
| planner.term.supply | 2 | Patterson's drafts of 25 June and 25 July |
| planner.term.time | 1 | Patterson's lower-valley draft, 25 June; this precedes July combat |
| reports.commander_lost | 1 | The ordinary report of Beauregard's wound |

The stores and pocket counts did **not** reveal counter defects. All thirteen
stores events cross from at least 7,000 to below 7,000 milli-days. Each of the
eight pocket events adds distinct cut regions; relief on day 144 and renewed
closure on day 146 are real changes of supply paths. Civil railway permission
is movement access, not a supply entitlement. Focused stores, pocket and
government controls pass. `stores-and-pockets.json` retains the S78/S81 events.

The quiet return's live driver is the typed bounce in
`packages/kernel/test/believed-posts.test.ts`, “an order sent before the report
arrives is accepted, and bounces on arrival as a returned dispatch, typed.” The
checker admits exactly this S82 record, bound by its full fingerprint, without
extending the immutable inherited quiet baseline. Six now-live global QUIET
entries are removed; the testbed's two formerly inherited zero bands remain
byte-equivalent objects. Package code carries setting-free evidence pointers;
the ledger and evidence carry the named causes.

**R86:** the script repeated its original goal after Stone shortened the plan.
Under S51, an identical goal reaffirms that shortened plan. After the first leg,
the corrected public order allows 25 remaining days to the original objective.
This changes the rehearsal's command, not the assertion, resolver or dispatch
filter. The existing hour-stamped dispatch and chronology assertions are exact.
All eight console tests pass; the retained isolated transcript receives four
hour-stamped dispatches each on days 135 and 148. Final integration also passes
R86 in the full suite.

**Anderson:** S80 is committed at
`cb633cb322789fc620333497eb23e90d1e3ce4e8`. All eighteen cited page images were
read and their hashes checked. The one row preserves the life-date conflict,
pre-start resignation, commission and promotion-date holds, empty service-choice
columns and every judgment hold. Blank draft faction/kind become the loader's
explicit `unknown` markers, not neutrality or a civilian/general assertion.
Heitman I p.164 and Appletons I p.70 distinguish him from Robert Anderson;
Walker pp.17, 52, 59–60, 256 and Wright pp.28, 56 retain the competing factual
observations. JCC I pp.306–307, 496 supplies scoped appointment observations,
not new model commission dates.

The local Confederate command passes to him on **27 May** (OR I-VI p.1,
chronology footnote). Pickens's separate State authority remains distinct
(OR IV-I pp.413–414, 913–915). No rank, opening side, strength, journey or
department is manufactured. A notice may install a serving, unposted successor
whose opening faction is explicitly unknown, with no recorded service choice;
his side then follows the held office. Known contrary factions and service
choices retain their guards. This is the implementation interpretation needed
for the specifically authorized apply under 0100/0101, not a general player
appointment permission.

The new release also corrects Beauregard's **source post** for the unchanged
31 May named assignment: he is now an unposted received candidate, not still
Charleston's holder. His person, date and Virginia prerequisite are exact.
Ordinary routing now completes the letter on day 87 rather than 92 [I]; no
arrival is authored to match the historical arrival. A 100-day startup check
and the final history verify both holders with zero rejections. The inherited
Charleston assignments, including State blocks, are unchanged: this apply does
not resolve that existing command-granularity limitation or recut Pickens's men.

Adding a second Anderson exposed a validator defect. A bare surname already
resolved by a declared speaker no longer also names every other roster person
with that surname. Adjacent given/middle names and initials still require the
second person's declaration. Positive and negative controls cover both forms.
The signed Sumter notice remains byte-exact. Four existing projection
derivations have new fingerprints; the protected reader identities are exact,
with no added row, classifier or finding-baseline exemption.

## 2. Evidence and remaining criteria

The one requested full suite exited 1 in 161.342 seconds: **225 files passed,
one failed; 2,074 tests passed, one failed, three skipped**. Its only failure was
the exact opening-side inventory omitting the newly added Anderson. Adding that
identity alone passes all 19 tests in the affected file. The later gates in that
test were inspected; his unknown side changes neither sided-roster count. No
full retry was made before the required hook. The S81 July, liveness and two
previously corrected fixture failures are absent from this suite.

One independent S82 review found three issues: stale global QUIET declarations,
Beauregard's old source post, and surname initials. All are corrected and the
targeted verification passes 43 tests; source/projection checks pass 72.
Typecheck, rules, boundary and generated pack/schema freshness pass. This is
S82 review only, not the deferred whole-stack or gate review.

Both dedicated references ran **once**, exit 0: zero rejections, exact replay,
saved-log replay and resume. Testbed has no functional difference and all 120
hashes match S81. History has six initial additions for Anderson, 148 changed
daily hashes, 337 recursive functional-summary differences, twelve counter rows
(one changes magnitude only), and 682 daily State field/identity differences.
Every before/after and its cause is retained. All history battle records are
exact to S81. All lots have unique ownership on all 148 days. Final history:
`97fb93236a6a3af5e99ad2a0dde34f4f48b21f6597c29fb0c746585d081bff0c`.

Liveness now passes. The independent reference still fails the Confederate
strength floor (**86,894**, below 100,000), trims (**0**), reservations (**16**)
and slow walks (**18**), and lists Preston's unknown-strength day on 25 July.
Johnston's 29,000 have joined at Harpers Ferry, not Manassas; there is no junction.
McDowell ends with 57,569 and Patterson with 2,000. Those outcomes remain S81's.
Operation scoring passes; that does not clear any other criterion. The lead
explicitly permits committing while these 1A calibration holds remain.

## 3. Timing, preservation and closeout

The only retained performance patch removes movement-only `governmentRail`
from the supply derivation's cache signature. It is not read by supply. Its
isolated proof matches the S81 initial state and **all 148 daily hashes**.

| CPU-profiled shared Windows run | Median / p95 ms |
|---|---:|
| Reconstructed S78, exact world/initial/148 hashes | 42.52 / 80.58 |
| S81 before optimization, exact 148 hashes | 52.07 / 95.88 |
| S81 with retained rail patch, exact 148 hashes | 43.48 / 84.70 |

Inclusive sampled map-derivation work is 327.8 → 398.6 → 337.5 ms over each run;
the rail-government reader is 24.6 → 59.4 → 51.5 ms. S81's opposing-share test
adds rail work. Combat phase samples rise 131.9 → 151.7 ms with actual resolved
July combat. Quantified-return/muster samples are sparse and show no increase
(10.9 → 7.8 ms for `applyMusters`). These are inclusive samples, not additive
components or precise per-day allocations. Identical S81 hash work outside the
tick also varies substantially, so the historical shared-host 38.79 → 49.21 ms
gap cannot be allocated wholly to code changes. A broader menu optimization was
discarded after the projection checker rejected its changed fingerprints.

Final reference medians/p95 are **39.73/86.69 ms** for history and
**3.51/7.25 ms** for testbed. The local history median is below 40 ms; this is
not idle-host, Linux or per-block certification. No budget is raised.

Package/runtime inventories and preservation checks preceded this note. All
2,190 starting paths remain, manifests/workspace aliases are intact, graph and
catalogue data are exact, and the only World changes are the additional person
and the one appointment's source-post/citation correction. Hooks, signatures,
contracts, checkpoint bands, other packs, the inherited quiet baseline and the
signed Sumter notice remain intact. Raw evidence is `runs/s82/`; the portable
packet is `docs/audit/s82-evidence/`.

The normal hook is still required. Its actual commit result and the subsequent
single `--milestone 1a` done check belong in `runs/s82/commit.*`,
`runs/s82/done-check.*`, `runs/s82-done/` and the sole fresh UTF-8 Python CODEX
status. This pre-commit handover does not anticipate those results. No history
rewrite, hook bypass or push is authorized or performed.

For the lead:

1. Retain the exact causal recentres, quiet live driver, R86 script correction
   and behavior-preserving cache patch. Reject widened bands, altered July
   assertions, fabricated fire and a claim that shared-host samples certify CI.
2. Retain the specifically authorized Anderson command apply and unposted
   Beauregard assignment. Reject opening service/commission guesses, unknown
   judgments filled with averages, merged Anderson identities, a forced arrival
   and any inferred State-force redistribution. Keep S80's factual conflicts open.
3. Continue the listed 1A calibration holds under 0105 after a passing-hook
   commit; route the whole branch and gate drafts to the deferred sprint review.
   No passing mechanic score waives a different agreed criterion.

## Findings outside my scope

S80's missing originals and conflicting dates; other research worktrees;
Charleston State-force allocation; the remaining 1A strength, pushback,
unknown-strength, junction and D6 work; controlled/Linux timing; whole-branch
and gate certification; main integration, release and pushing.
