For the lead: 4 items

# S150 / 0135: need-based retention and two hold missions

0135 is built. Retention compares the holder's own received mission's `lacks_resources` shortfall before and after the actual lot selection. Only a created or deepened need keeps troops. An unknown ratio/derived need is unavailable to both choices; `comply` sends with a stated typed reservation to issuer and requester. The holder's own objection/deferral still governs. Direct grants recheck at actual self-paper receipt and later partial fulfilment. Quantities and one-request-per-mission rules remain.

Fictional tests cover determined need, determined surplus despite a lower ratio, unknown comply with both reservation recipients, typed objection, and direct grants. Independent review found two defects before capture: actual direct sending could bypass the initial retention decision; predecessor missions and embarked strength could enter the comparison. Focused failing regressions and corrections close both. The final compatibility family passes193 tests in10 files, including save/serialize, the existing plan-choice assertion by kind/reason, authority and pack cases. Typecheck, pack generation/check, boundary and rules pass. [Validation](validation-results.json) · [Review correction](review-correction.json).

Two `[I]` hold missions use the existing Holmes/Johnston grammar: Beauregard at Manassas from31May (SO149, OR I-II p.896; arrival1June pp.901–902), and McDowell at his department's Arlington headquarters region from assumption28May (GO26, GO1861 p.61; GO1 OR I-LI.1 p.389; Arlington OR I-II pp.59–60). They add no troops, forced arrivals, conditional terms or historical battle/date target. [Primary readings and provenance](../0135-read/source-reading.json).

## The single measurement

Baseline: the0134 capture, `1be63020b01905522f15da9375308c6c50e737ad8ff90a24099c6f9b45388eba`. Before execution the commands, expected3–6 minute cost under contention and stop rule were named: two-day `node --import tsx tools/s150-measure-allocation.ts --0135 --smoke`, then once `node --import tsx tools/s150-measure-allocation.ts --0135`; stop at first rejection, missing prerequisite/output or replay/resume mismatch, diagnose cheaply, no blind retry. The capture runs148 days with0 rejections; daily replay, day60 resume and saved-log replay match. Final hash: `41806f3a04db1b88d954f8ca66f2c89a63ccbbeeb7d65d2e71bd936d4424386e`.

Published all33 coverage rows,422 army totals and1,362 lot/kind rows on120/140/146, all6 own requests/8 request-answer records/3 subordinate orders,18 offers/16 received, every battle and every band. Raw41-file inventory retains States84–90,120,140,146/final, save and journal under `runs/s150/measurement-0135`. [All armies](army-totals.json) · [Lots and provenance kinds](army-lots.csv) · [Coverage](rows.csv) · [Battles](battles.json) · [Bands](all-bands.json) · [Checkpoint scores](scores.json).

Command-subtree lots / rule-derived men follow. Parent and child rows overlap and must not be added.

| Command | Day120 | Day140 | Day146 |
| --- | ---: | ---: | ---: |
| McDowell | 0 / 0 | 0 / 0 | 0 / 0 |
| Patterson | 1 / 866 | 1 / 866 | 1 / 866 |
| Beauregard | 0 / 0 | 0 / 0 | 0 / 0 |
| Johnston | 2 / 1,560 | 2 / 1,560 | 2 / 1,560 |
| Mansfield | 17 / 14,636 | 16 / 13,856 | 16 / 13,856 |
| Lee, Confederate forces in Virginia | 13 / 10,140 | 13 / 10,140 | 13 / 10,140 |
| Holmes, Fredericksburg command | 1 / 780 | 1 / 780 | 1 / 780 |

Physical Lynchburg lots, grouped by their direct holder rather than command-subtree totals:

| Direct holder | Day120 | Day140 | Day146 |
| --- | ---: | ---: | ---: |
| Lee | 5 / 3,900 | 5 / 3,900 | 5 / 3,900 |
| Holmes | 1 / 780 | 1 / 780 | 1 / 780 |
| Johnston's3rd brigade, vacant | 0 / 0 | 1 / 780 | 1 / 780 |
| Pickens, South Carolina (travelling to Beauregard) | 0 / 0 | 1 / 1,440 | 0 / 0 |

[Every physical Lynchburg lot and location](lynchburg-holdings.json). The South Carolina command's full6-lot total in army-focus.json is not six lots at Lynchburg. Unknown strengths elsewhere remain unknown. The checkpoint still reports Confederate known men54,530 below100,000, unresolved because unknown lots could close the gap; this inherited checkpoint issue is not waived by the floor review.

## Every request's pace

The [full dated cycles](request-cycles.md) and [machine-readable cycles](request-cycles.json) include mission packets, request receipt, each answer and relay, superior order, sender compliance, exact selected lots, daily journey observations, physical receiver receipts and issuer/requester acknowledgements. Same-day completed legs may leave no persistent march stamp; that stamp is not called the first movement. [Compact pace CSV](request-pace.csv).

- **McDowell:** hold sent87, received89; request90 reaches Scott; order93 reaches Mansfield, who answers comply93. Selection defers `committed`: the then-eligible lot is reserved by a live operation. No lot or journey, and no daily retry. His new-mission request135 is refused138 (`compliance:object`, `scope_unavailable`), without a subordinate order.
- **Johnston:** mission90/receipt95; request96; Lee grants and answers102. His direct selected Alabama lot is observed travelling102 and physically received at Harpers Ferry108. The unknown retention comparison is a nonblocking reservation, not a deferral. Daily journey observations record the completed same-day legs before the first persistent leg stamp105.
- **Beauregard:** hold93/receipt98; request99; Cooper relays100; Davis asks Pickens101; Pickens offers, answers comply and selects one South Carolina lot102. Journey observed102, still pending148, on the Charlottesville–Fredericksburg road. No Manassas receipt is invented.
- **Patterson:** mission112/receipt112; request113 reaches Scott; Scott's114 order reaches Mansfield and gets comply with an unknown-need reservation114. Connecticut4 is selected and observed travelling114; Patterson physically receives it at Philadelphia119. The next mission140/receipt142 yields request147; Scott orders Mansfield148, who complies/selects one Massachusetts lot148, still pending at cutoff.

Actual received-paper evidence includes33 force request/allocation reports, not merely authored acknowledgements. [Orders](superior-orders.json) · [Subordinate answers](subordinate-answers.json) · [Patterson in full](patterson-requests.json) · [Receipt method](receipt-evidence-method.json).

## GO1: reporting only

GO1's three brigades/nine named bodies (OR I-LI.1 pp.389–390) are not declared. None of the observed candidates is under McDowell on84–90. First Michigan travels under Blair until88 and reaches Mansfield at Washington89; the other eight remain with their governors. Sandford's contemporary May28 report identifies the numbered New York bodies as militia, including Twenty-fifth (OR I-II pp.37–39); the earlier U39 volunteer candidate remains a reported alternative, not an identity rewrite.

The read historical chain is the attested24May crossing (OR I-II pp.37–39), GO26's geographical Virginia command (GO1861 p.61; OR I-II p.653), McDowell's29May Arlington inspection of troops already there (p.653), and GO1's explicit brigade orders. The original crossing instruction is referred to, not recovered here. GO26 contains no named Washington sending order. The model declares neither that crossing/assignment chain nor GO1's brigades; its existing McDowell template is for July orders. No new mechanism was built. [All nine bodies on all seven days, holders, source limits and alternatives](go1-report.md).

## Failures brought before the hook

**Seven of15 positive S141 floors remain zero;21 bands fail; no new zero.** Eight formerly zero floors now fire, including time twice and ordinary field combat. Every failed gate has its own [first cause](gate-first-causes.json), with [daily counter witnesses](counter-witnesses.json) and [pure retained-State derivations](first-prerequisite-witnesses.json).

The only ordinary field battle opens/closes at Harpers Ferry148. Johnston engages1,092 of1,560 known men; Patterson866. Killed/wounded161/156, missing12/40 and captures0/6 produce too few ordinary battle/casualty firings for the retained minima. Flank draws358/591 miss thresholds50/138; leader draws255/189 miss unchanged hit ranges; morale441/307 remains above rout250. Those are the first causes of flank/general-hit/rout and downstream commander-loss zeros. Known stragglers first appear in that last-day battle and are excluded from same-day returns; opaque Tennessee remains unknown. Patterson withdraws148, but operations consumes yesterday's battle, leaving repulses0 at cutoff. No day149 was added. Five pockets close, one is lost, none gains a restored supply path. Four battle orders are below minimum5.

The new meeting emits eight phase dispatches148 plus Sumter's two, exceeding dispatch maximum5. Successful reinforcement activates Patterson's five lower-valley work days, yielding works10/max8 (first over135). New hold missions, reinforcement drafts and later revisions produce19 searches/candidate/draft firings versus baseline12, first over16 on139. Movement already crosses its maxima before the new missions (arrival77, leg start81); final211/199 exceed86. First Connecticut's sea/Potomac `no_route` starts66 and repeats through135,70 blocked days; the transport gap remains (OR III-I p.160). No floor, band, seed, quantity, ratio, roster, deadline or horizon was fitted.

Lynchburg's conditional station/hold/supersession terms remain gaps (OR I-LI.2 pp.135–136,140–141,151), as do missing live cohorts and the GO1/crossing declaration above. All149 prior raw evidence files and the original368-path staged index were verified before staging these authorised extensions. Runtime inputs are pinned unchanged across capture; source pages and all41 new raw files verify. [Preservation](preservation.json) · [Runtime proof](runtime-verification.json).

For the lead:

1. Receive0135, the two sourced holds, the closed independent findings and the full dated cycles. Two request transfers now complete; two remain travelling; McDowell's first still defers committed and his later request is refused.
2. Rule on the seven remaining zero floors and all21 band failures with their first causes. Acceptance remains unmet; combined S141/S147/S150 work stays staged **before the ordinary hook**, with no hook attempt, commit, bypass or push.
3. Receive the report-only GO1/crossing and Twenty-fifth identity findings. Transport, Lynchburg conditions and missing cohorts remain named future scopes; no extra mechanism or fit was added.
4. Hosted Linux performance/headroom and the formal whole-branch sprint review remain unverified. The other project's process was left alone, and no local timing reading is evidence. Accepted0134 optimisation evidence is reused without a new performance claim.

Findings outside my scope
