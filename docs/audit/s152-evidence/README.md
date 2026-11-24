# S152: declarations under 0136

For the lead: 3 items. Worktree `C:/Pyrrhic/sprint-allocate`, branch
`sprint/allocate`, starting at `7d3c1bcd`. S152 only. S149/S151 and the shared
source cache were read-only. This build uses the existing instrument grammar;
it does not add the missing grammar listed below.

1. **Nine new executable clauses; all 201 research rows accounted for.**
   [Disposition ledger](instrument-disposition.json): S149 109, S151 92;
   25 declared,6 partial,4 already declared,117 named gaps,49 witness-only rows.
   Counts are research dispositions, not independent orders or complete chains.
   [Primary readings](source-reading.json) distinguish sending instruments from
   identity witnesses and retain source hashes; [inputs](input-receipts.json)
   pin the read-only research. No new identity, call, service term or force is
   manufactured. The executable additions are:
   - Cameron's Second Vermont request, order lower bound 3 June, Fairbanks report
     4 June, by rail to Washington (OR III-I pp.254-255), marked [I];
   - Gorman/First Minnesota to Harrisburg,14 June (p.272);
   - Scott's named Third Michigan clause at Harrisburg to Washington,15 June
     (OR I-II p.690), excluding the unnamed other arrivals;
   - Scott's Gordon/Second Massachusetts request to Patterson via Williamsport,
     attested 6 July (OR I-LI.1 pp.412,418), marked [I];
   - the national onward clauses for Bartow, Gartrell, Cash, Sixth Louisiana
     and Jenkins (OR I-LI.2 pp.128,135-136,140-141). Bartow/Eighth and Cash/Eighth
     use identity witnesses only (OR I-II p.559; I-LI.2 p.151).

   The priority gaps remain explicit, rather than being classified as unread:
   Sandford/Morgan governor-authored sending and Annapolis reception;
   SO89?'s state-scoped federal intake and subordinate command assignment;
   Sandford's crossing/handover; dated received successive brigade organisations;
   the Fourth Pennsylvania-before-Seventy-first exchange; station predicates,
   holds, company components and received supersession. The contemporary
   Eighth crossing 26 May/battery 27 May governs over December?s 24 May grouping
   (OR I-II p.39; NY AG 1861 p.110). Curtin's five/remainder remain the existing
   disjoint cohort requests, with no roster selected (OR III-I p.329).

2. **Transport and the advance are bounded readings, with gaps retained.**
   The 1857 Regulations provide transport and embarkation duties, requiring
   proper movement orders/returns (pp.107-110,123-124,127-129; paras832ff,959ff,
   987-1009). The read Confederate equivalent is an 1862 edition (pp.102-104,
   paras985ff), not retroactive 1861 authority. The US War Department act
   (1 Stat. pp.49-50, section 1) and Confederate act (Statutes p.32, sections 1-2)
   establish presidential direction of departmental business; neither reading
   supplies a specific standing personal rail/river/sea mandate. No self-grant
   or fallback is invented; principal modes remain a named authority gap.
   This is not a claim that historical transport authority did not exist.

   Read 15 July's Miles restraint (OR I-LI.1 p.419) and McDowell/Fry GO17
   (OR I-II pp.303-305). Static printed p.303 confirms 16 July; OCR 10 is not used.
   McDowell's testimony credits Scott with the plan and an earlier fixed date
   (JCCW 1863 II pp.35-38); Scott's later response is retained (pp.241-242).
   The revised 16 July Scott instruction/date is still unrecovered. The existing
   dated goal, issuer behaviour and grievance stand; no date is advanced.

3. **One capture, with acceptance still unmet.**
   Baseline `b2a0c513512bf54397c0deafac50cfa5b919d16150c5a9c9c5c733fb93eb2eb4`.
   [Result](capture/measurement-status.json): day 148, zero rejections; daily
   replay,day 60 save/resume and saved-log replay match. Final State hash
   `d4c187e2a6eeabe19e9aa8f6c625654d37a9c4ebf62ca8557f5c614e12f2b164`.
   Published 422 command totals and 1,368 lot/kind rows on 120/140/146, 25 allocation
   fates,2 onward fates, all 7 request cycles/12 authored answers,all battles and
   all 164 bands/floors. Two battles, unchanged; 25 gate failures;no new zero.
   After-tick observations may combine same-day substeps; eligibility diagnostics
   explicitly name the following day and are not historical receipts.

   On 120/140/146, Johnston holds 2 rule lots/1,560 men; Patterson 1 rule lot/866;
   Beauregard 0. McDowell holds 1 rule lot/780 on 120 and 0 on 140/146. Vermont's paper
   is sent 90, received 95,selects its actual lot and completes receipt 105.
   Minnesota's paper is sent 101, received 121 and selects its lot; its journey
   is still pending 148. The five new Confederate clauses and Third Michigan
   answer named_absent; Gordon answers scope_unavailable. Full dated evidence:
   [instrument fates](capture/instrument-fates.json),
   [request cycles](capture/request-cycles.json),
   [army lots](capture/army-lots.csv), [bands](capture/all-bands.json).

[Validation](validation.json) records cheap gates and the retained capture.
The first hook found one unopened-command crash in the S77 fictional fixture.
[The focused correction](unopened-command-fix.json) withholds papers with an
unopened sender/receiver from the menu and independently rejects them at
execution. Both missing-post cases preserve State and send nothing; the
complete-address control and original fixture assertions remain intact. The
79-test focused group passes. The [registry evidence](guard-projection.json)
records the structural read at both menu roots; no scanner was weakened.
All 148 post-correction State hashes equal the retained detailed S152 capture,
so its full evidence is reused rather than recaptured.
The second hook passed 2,559 tests but rejected the shifted reviewed-read
registration. [The exact registration correction](one-writer-registration.json)
updates only its source hash and line 139 to 140 for the unchanged service-date
comparison. The raw scanner remains intact; all 44 focused audit tests pass.
Rules and typecheck also pass; runtime and capture/profile evidence are unchanged.

All 3 existing `.fails` marks remain: the July armies have not formed. No band,
floor,value,threshold or acceptance criterion is changed. No merge into
`sprint/july` while a mark remains. The ordinary commit hook is the final
required gate; its actual result belongs in `runs/s152/commit-hook.log`,
`commit-result.json`and the single final lead CODEX status. No push.

[Preservation](preservation.json): all 3,899 starting files retained; the seven changed starting files are the pack/generated world, the two allocation
guards, their fictional test, the exact one-writer read registration and the precise projection registry; all 3,892
other starting files are byte-identical. S150's
41 live-orders raw files verify against their manifest. Final source and capture
inventories preceded this report. The lead's hosted Linux timing arrived after the detailed capture started:
`7d3c1bcd`, run45400868529, war median/p95 97.7/204.9ms; history 96.8/207.0ms.
Both exceed the 40/160 ms budget. S153 owns optimisation in a separate worktree;
no S152 optimisation was added. The merge gate now requires both no `.fails`
and hosted Linux inside budget. The following profile is CPU work distribution,
not a local stopwatch claim or a Linux verdict.

The lead then requested one local A/B profile pair. [Comparison](profile/comparison.json)
uses the exact `7d3c1bcd` package+pack snapshot and final S152 code/data, sequentially,
with S153 alongside as the lead reported. Both runs verify every one of their
148 daily State hashes against their retained capture. Samples under the
verification callback are excluded. Profile counts under ordinary play are
25,949 baseline and 13,698 S152; unequal counts are not a speed result.

| Exclusive sampled work group | Baseline share | S152 share | Difference, percentage points |
| --- | ---: | ---: | ---: |
| Allocation | 0.728% | 0.869% | +0.141 |
| Retention | 0.100% | 0.146% | +0.046 |
| Requests | 25.989% | 26.069% | +0.080 |
| Service receipt | 0 samples | 0 samples | 0.000 |
| Live orders | 0.547% | 1.256% | +0.709 |

Combined named groups: 27.364% to 28.340%, approximately +0.98 percentage points.
Request planning is the largest named group in both; controlEvidence, people
view construction and reconContacts remain leading self-cost functions.
The command log grows 223 to 232 entries. Zero receipt samples is a sampling limit,
not a dead-mechanic finding. Inclusive function shares overlap; the grouped
shares above are exclusive. A single pair under contention establishes neither
absolute added milliseconds nor statistical significance. Raw profile hashes,
source snapshot receipts and full per-function rankings are under `profile/`;
full CPuprofiles remain in the ignored `runs/s152/profile/`. No other
process stopped; direct public HTTP only, no credits, no browser or desktop.

Findings outside my scope
