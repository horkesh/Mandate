# S92 continuation: Texas corrected and band causes recorded

Build **724eea84** on `sprint/unknowns` applies the accepted evidence mask, eleven paired cases and six S89 cells, the Texas correction, and 36 individually chained band records. The lead's 2026-11-23 “S92 received; rulings; S92 continues” authorizes this scope under 0113. This packet compares against **S92's staged reference**, retained under `runs/s92/final/`; the parent packet retains the earlier comparison against 117b8ac8. No other sprint is integrated.

## Source and model scope

Read OR Series I, volume I, printed pp.502–504,514,523–524,552,559–569,572 (only the individual pages listed in `source-receipts.json` are claimed read). Twiggs's February 18 agreement yielded posts while troops retained arms for departure by the coast (pp.502–504,514). The February 20 table describes intended embarkation groups, not all troops already at their ports (pp.523–524). Two transports had already sailed by April 17 (p.552). Sibley's two First, three Third and two Eighth Infantry companies capitulated at Saluria on April 25 after the transport attempts failed (pp.561–564). Greene's party left April 24 and surrendered at Indianola the next morning, April 25 (pp.565–566). Reeve's six Eighth companies surrendered at San Lucas Spring on May 9 after inspection of the opposing force; Van Dorn calls it the last column (pp.567–569,572). Distinct returns and disagreements in numbers remain distinct, with no invented company apportionment. Primary page URLs, cache paths and hashes are in `source-receipts.json`.

The old start counted a 2,445-man parent **and** five quantified children. First Infantry also contained a subtraction error: **443 − 20 − 17 = 406**, not 411. Removing the duplicate aggregate and correcting that row leaves five original groups totalling 2,445: First Infantry 406; Second Cavalry eight companies 614; its E/G companies 127; Third Infantry 797; Eighth Infantry nine companies 501. The old claim that Reeve's companies were a different body from nine companies already at Indianola is withdrawn: that destination was intended, not a separate assembled force. His partial-command rations remain unsuitable for a whole-bundle stock.

**Interpretation [I]:** the coarse starting groups mix departures and captures. A notice records the already accepted departure terms when Waite holds the command and an original contingent remains. Five completion notices require that actual record, an explicit runtime lower date of May 9/day 65, and the whole original contingent still stationary, unembarked and present in the cited Texas theatre. An empty State, missing contingent, absent terms, an outside detachment or a moving unit cannot satisfy that cause. This is a conservative last-date closure of field availability, **not a claim every company surrendered on May 9 or left Texas physically**. It creates no captive count, exchange, treatment policy, replacement strength or northern destination. Officer-capture status and exact company-specific departure/capture timing are not encoded by this closure; the source record remains explicit for the lead's review. No gate signature or exemption was written.

`withdrawableForce` and the identical cited notice payload use the existing forces, movement and command owners. No State field or RNG draw is added. The source rows are independent blocks after the duplicate parent is removed. Generic live cases cover outside-theatre detachments, missing/uncited/unguarded or different source payloads, wrong-side/decision proposals and save/resume. The date and empty-parent defects were caught by the diagnostic probe before the corrected count observation; their failed evidence is retained.

## The 27 battle-days, then seven

| Place | Staged S92 days | Corrected result |
| --- | --- | --- |
| Fort Sumter | 38,39 (April 12–13) | Both retained |
| San Antonio/Austin | 129–148 (July 12–31), twenty days in three records | All removed |
| Manassas | 140,144,145,148 (July 23,27,28,31) | All retained |
| Harpers Ferry | 147 (July 30) | Retained |

Every side, commander, block, known/unknown strength and result is retained by day in `battle-review.json`. All **six non-Texas records are exact** to staged S92. No additional S92-introduced duplicate or expired Texas contingent was found on those sides. The existing three-day McDowell operation/notice seam remains an S90 matter, and the Harpers Ferry/Preston unknown-strength holds remain. These are model counts, not certification of historical Manassas, the Johnston junction or its timing.

Clark and Waite have no model casualty on day 137. Two now-unnecessary appointments disappear: Twiggs to the Texas governorship on day 142 and Abercrombie to the Department of Texas on day 143. All other response rows are exact. Beauregard's day-140 wound and the day-145 vacant-post return remain. The Texas reserve retains 2,000 rather than 1,334 men; Confederate known strength rises **93,710 → 94,376**, still below 100,000. Union known strength falls **122,860 → 118,497** as the duplicated and exited troops leave availability. Unknown blocks remain 22 Confederate and seven Union. All 70 levies, all 96 governor call answers, 68 completed musters and two pending levies are unchanged. Raw addressee reservations/slow walks remain **1/0**, plus one relay reservation.

## Bands and complete comparison

Thirty-six append-only records explain each band step, with 0113 and the named events as the cause. Thirty-two positive observations use `around(observed)`; four now-zero bands use exact `quiet()`: `recruitment.slow_walked`, `orders.relay_held`, `planner.term.caution`, `planner.term.force_ratio`. The fictional home-rule governor delays an actual muster; the fictional relayer holds an order for two days; the planner control drives every declared term. The four complete zero records are fingerprint-bound and mutation-tested. The origin and inherited quiet baseline are unchanged. Global quiet defaults that became live are removed while preserving unchanged testbed bands.

| Mechanic | Before | After | Observed |
|---|---:|---:|---:|
| combat.battle_closed | 1..5 | 2..10 | 5 |
| combat.battle_day | 2..8 | 3..14 | 7 |
| combat.battle_opened | 1..5 | 2..10 | 5 |
| combat.captured | 1..5 | 2..10 | 5 |
| combat.cut_off | 0..0 | 1..4 | 1 |
| combat.flank_broken | 1..6 | 1..6 | 3 |
| combat.general_hit | 1..4 | 1..4 | 1 |
| combat.killed_wounded | 2..8 | 5..20 | 10 |
| combat.missing | 2..8 | 4..18 | 9 |
| combat.withdrew | 0..0 | 1..4 | 1 |
| forces.stores_low | 6..26 | 51..206 | 103 |
| forces.stores_refilled | 545..2180 | 1200..4800 | 2400 |
| messages.courier_delay | 63..252 | 77..308 | 154 |
| messages.delivered | 5613..22452 | 7120..28480 | 14240 |
| messages.mail_delay | 1351..5406 | 1428..5712 | 2856 |
| messages.sent | 5947..23788 | 7523..30094 | 15047 |
| orders.relay_held | 1..4 | 0..0 | 0 |
| orders.returned | 0..0 | 1..4 | 1 |
| planner.term.caution | 1..4 | 0..0 | 0 |
| planner.term.force_ratio | 1..4 | 0..0 | 0 |
| recruitment.refused | 18..72 | 6..24 | 12 |
| recruitment.renewed | 0..0 | 1..4 | 1 |
| recruitment.slow_walked | 27..110 | 0..0 | 0 |
| reports.battle_dispatch | 9..36 | 21..84 | 42 |
| reports.casualty_return | 6..24 | 10..40 | 20 |
| reports.commander_lost | 1..4 | 1..4 | 1 |
| reports.governor_wire | 2..8 | 3..12 | 6 |
| seats.attention_spent | 65..260 | 76..306 | 153 |
| seats.battle_orders | 30..120 | 5..20 | 10 |
| situations.fired | 31..124 | 44..176 | 88 |
| situations.notice_reports | 22..88 | 35..140 | 70 |
| situations.noticed | 21..86 | 34..138 | 69 |
| situations.proposals | 20..82 | 36..146 | 73 |
| situations.surfaced | 30..122 | 43..174 | 87 |
| verbs.answered | 44..176 | 61..246 | 123 |
| operations.repulsed | 0..unbounded | 1..4 | 1 |

`liveness-review.json` records every affected count/magnitude and each retained or changed band's decision. Historical strength, pushback and timing thresholds remain unchanged. In particular, slow walks **0 < 2** is an unmet historical criterion, not a liveness change or a waiver. The count bands remain until S91 integration.

The dedicated references ran once with checks, daily hashes, replay and turn-60 saved-log replay/resume. Union final hash: `62d412e6eb47654ef9974ce98dac064618180e000a36702e00d24964d0213aa5`; testbed: `160f67761bda23a1fe11ebacd92099ccbde4ff757171e00de45926136e1158db`. Union changes against staged S92: **148 daily hashes, 26 counter rows, two removed response identities, no levy changes**. Testbed's 120 hashes, counters, responses, levies and complete State are exact. Both have zero rejections and zero liveness breaches. The adjacent `*-hashes`, `*-counters`, `*-daily`, `*-responses`, `*-levies` and `*-state-fields` files report every change, including counter magnitudes and all 263 reported State field differences. The new map-event trace is additional current-run diagnostic evidence; the old observer did not retain that trace. Old combat is instead checked from its complete retained battle records (zero pruned records), not from an invented event baseline.

## Verification and remaining criteria

- `npm ci` ran first in the original S92 build, exit 0, zero reported vulnerabilities; its receipt remains under `runs/s92/`.
- First full hook: exit 1, 2,143 passed / two failed / three skipped, 746.98 s. Both failures were inspected and reproduced cheaply. A static type import satisfies the unchanged scanner; the appointment fixture now compares the same ordinary tick and is stronger than its prior key-only assertion. No model behavior changed in that correction. Forty-eight targeted cases, typecheck and rules pass before retry.
- Actual build hook: **exit 0**, 236 files / **2,145 passed / three skipped**, 748.41 s; every chained gate passes.
- Requested post-commit full check: **exit 0**, 234 files / **2,124 passed / three skipped**, 691.11 s, `MANDATE_NO_GIT=1`, one worker. The unchanged Git fixtures are retained from the passing actual hook. Typecheck, rules, boundary, licences and 113-decision index pass.
- Dedicated checked references: **exit 0**, 72.89 s. No baseline repeat. The final source arithmetic change has the exact observed counter vector of the corrected count probe.
- One normal **eight-seed** done check, with drafting and binding **`--milestone 1a`**: **exit 1**, approximately **1760.20 s**. Phase 0 **6/6**, 1A **2/6**. All twelve criteria and literal problems are in `criteria.json`; changes against the staged S92 done check are in `criteria-comparison.json`. The independently checked done summaries are compared to all 268 dedicated daily hashes/counters in `done-reference-consistency.json`.

Local Union reference/history timing passed: median **33.04/34.18 ms**, p95 **65.66/76.17 ms**, against unchanged **40/160** limits. Testbed median/p95 **3.48/5.39 ms**. This is one local observation, not an isolated performance attribution or hosted-CI certification. Watched `return` is now **0/8** rather than 3/8; the incomplete grievance-measure/no-D6-evidence and unexercised border-chain holds remain, so D6 still fails.

| Milestone | Criterion | Result | Problems |
| --- | --- | --- | --- |
| phase0 | behaviour | PASS | 0 |
| phase0 | hash | PASS | 0 |
| phase0 | resume | PASS | 0 |
| phase0 | liveness | PASS | 0 |
| phase0 | section-ten | PASS | 0 |
| phase0 | budget | PASS | 0 |
| 1A | checkpoints | FAIL | 1 |
| 1A | operation | PASS | 0 |
| 1A | pushback | FAIL | 3 |
| 1A | unknown-strength | FAIL | 4 |
| 1A | stand-ins | PASS | 0 |
| 1A | lever-sweep | FAIL | 2 |

All remaining literal problems:

- **checkpoints**: union-1861 history run, 148 days to 1861-07-31: men_confederate (1861-07-31, day 148): confederate has 94376 men, below 100000
- **pushback**: union-1861 history run, 148 days to 1861-07-31: relay holds: 0, below the record's 1
- **pushback**: union-1861 history run, 148 days to 1861-07-31: trims: 0, below the record's 1
- **pushback**: union-1861 history run, 148 days to 1861-07-31: slow walks: 0, below the record's 2
- **unknown-strength**: union-1861, war by decision, 148 days: battle battle:harpers_ferry:147 at harpers_ferry, day 147: confederate fought with 1 blocks of unknown strength (state-forces.va_harpers_ferry)
- **unknown-strength**: union-1861, war by decision, 148 days: battle battle:manassas:140 at manassas, day 140: confederate fought with 1 blocks of unknown strength (state-forces.va_manassas_preston)
- **unknown-strength**: union-1861 history run, 148 days to 1861-07-31: battle battle:harpers_ferry:147 at harpers_ferry, day 147: confederate fought with 1 blocks of unknown strength (state-forces.va_harpers_ferry)
- **unknown-strength**: union-1861 history run, 148 days to 1861-07-31: battle battle:manassas:140 at manassas, day 140: confederate fought with 1 blocks of unknown strength (state-forces.va_manassas_preston)
- **lever-sweep**: union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: measured in part: the victory measure does not read people/grievance (policy pushback) (its own choice). Until it does (the people's response through self-emancipation waits for enemy capacity in 1B), no D6 result for this decision counts as evidence (G-1.14c, G-1.14d)
- **lever-sweep**: union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: chain unexercised: no border governor answered a call inside the horizon of 24 moves weighed (seeds 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868), so the policy's effect through border loyalty on regiments was never seen (G-1.14b)

## Preservation and closeout

The runtime links, package and preservation inventory preceded final-result documentation: all **2268** original tracked paths survive, **2238 byte-exact**, with only the **30** reviewed S92 paths changed. All **29 signed live files** and **23 protected paths** are exact, including hooks, package manifests/locks, saved-State fields, thresholds, liveness origin and inherited quiet baseline. Workspace aliases point into this worktree. The full inventory is `preservation.json`. No July, perf3, coverage or research-cast worktree is written; no browser, desktop control, signature, hook bypass or push is used.

The build and interdependent bands form one coherent passing tree: separately committing a failing build or partial band table would not satisfy the required hook. Each step remains individually reviewable in the append-only ledger. This report is prepared after settled runtime evidence and before its documentation commit's required hook; the final CODEX status records that hook and commit. Recovery and full logs remain under `runs/s92c/`.

**Proposed ruling [I]:** accept the conservative whole-bundle field-availability closure as the bounded Texas correction; retain the source's distinct company departures/captures and officer status as limits for precise future authoring. No blanket February capture, invented apportionment, date-only deletion or restoration of unsupported draws is proposed.

**Findings outside my scope:** S85 performance; S90 notice/junction timing; S91 named-coverage integration; exact company-level/office-capture authoring and any gated facets; further cast sourcing; independent cross-model/gate review, integration, release and pushing. Nothing is signed or cleared for main.
