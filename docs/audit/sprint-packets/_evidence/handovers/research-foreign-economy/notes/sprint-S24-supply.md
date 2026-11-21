# S24 supply drafts hand-over

For the lead: three items below. S24 only, from `f744ca7` on `sprint/research-foreign-economy`. Read the shared CODEX from the top, including the standing, command-line and writing rules, decision 0106 and the S1-S10 sprint message. Later requests were not undertaken. All new repository files are this hand-over and `packs/union-1861/source/drafts/supply/`. Raw scans, readings, scripts and logs are outside worktrees in `C:/Pyrrhic/mandate-research-sources/S5/S24/`; reused S5 source paths remain recorded. S4 volumes were read only and their cited scan pages retained in S5.

## 1. Delivered research drafts

Sixteen new paths, including thirteen CSVs with **642 rows**: 37 route candidates (17 rail and 20 river/landing), 76 depot candidates, 37 gauge baselines, 41 rail observations, 38 river observations, 71 store records, 10 transfers and 9 quartermaster purchase-return rows; plus 15 source records, 113 printed-page locators, 150 map joins, 30 map needs and 15 held evidence questions. The exact fourteen edge and seven depot columns are preserved. `README.md` documents fields and file counts; `evidence-notes.md` gives the findings and disagreements by printed page.

Coverage includes military rail openings, interrupted main stems, gauge changes and terminal handling; Mississippi, Tennessee, Cumberland, Potomac and James transport; departmental shore/afloat depots, issuing stations, ordered reserves, losses and original quantities for both sides. Gauge baselines alone do not certify military use. Dates, sources, parties and reporting stages stay separate. Quartermaster Return No.1's July-September purchases are neither on-hand stock nor army receipts.

The research preserves the B&O report's conflicting printed dates, divergent departmental dates at White House/Harrison, the Nashville witnesses' different accounting scopes, the Thoroughfare pork account's printed one-pound discrepancies and Fort Pillow's unresolved 7,500-cartridge discrepancy. Original digits were checked against scans where OCR or arithmetic disagreed. No supplied quantity is silently reconciled or converted into model capacity.

All model capacity, travel-time, depth and seasonal fields remain blank. Seven depot regions remain unresolved. Two rail segments collapse within coarse regions and are explicitly held. A Vicksburg continuity candidate is blocked; canal supply and shared departmental/side candidates are not additive free river capacity. Nothing is loaded, generated into the World, signed or calibrated.

## 2. Proposed rulings and remaining evidence

All are **[I]** proposals, with rejected alternatives:

1. Preserve physical units, report scope and reporting stage. Reject revenue, diet demand, annual freight, purchase totals, nominal cars or a promised shipment as rated daily capacity or on-hand stock.
2. Preserve gauge effective dates, military conversion and actual transfer arrangements. Reject a permanent inherited gauge after regauging or a universal break-of-gauge penalty.
3. Resolve company identities, named landings, coarse terminal joins, existing intermediate corridors and dated access before promotion. Reject bypass edges, live self-loops, implied access to Richmond, or through Union supply past Vicksburg.
4. Preserve orders, promises, witnesses' qualifications and source arithmetic. Reject turning an instruction into delivery, adding overlapping accounts, repairing printed numbers silently, or treating retrospective reports as contemporary principal knowledge.
5. Keep local acquisition and sensitive material as unsigned evidence for the appropriate review. Reject free local supply, protected people as freight/labour stock, or civilian coercion as an automatic capacity multiplier.

The fifteen HOLD records require rated daily throughput, actual journey times, effective gauge and transfer dates, route-extent/date reconciliation, reach-specific river evidence, depot stock series, purchase-to-delivery allocation, missing Nashville returns, source arithmetic clarification, clothing allocation and sensitive-use review. More dated company and depot returns are needed before military serviceability or stock can be filled across the whole window. No blank is filled by tuning. `map-needs.csv` identifies thirty map/identity/terminal needs for the map owner; it does not alter the map.

## 3. Verification, commits and retained failures

Before final result documentation, the frozen thirteen-CSV inventory, runtime diagnostics, five copied run artifacts and preservation checks were complete. The data inventory has not changed. All **1,708 original tracked files** remain byte-identical, including S15 drafts, live inputs, signed/gate files, generated Worlds, lockfiles and checkpoint bands. The sixteen new paths are inside the allowed scope. Evidence: `data-inventory.json`, `preservation.json` and `semantic-check.json` in S24's external evidence directory.

The source/shape/citation/map/preservation audit passed **2,114/2,114 checks**; nine focused semantic checks passed, retaining the discrepancies rather than repairing them. The actual `loadPack` comparison passed with the drafts visible and hidden: no draft-directory access, zero errors and identical loaded-result digest `02c899feeb285b393d6a3bc3ce8976c3dab492bc0f8a2982a50a60d2d6469515`. Evidence: `audit.json`, `loader-proof.json`. Original/retained scan hashes and printed/PDF locators were checked. Unaffected map and loader evidence is reused.

S15's successful `npm ci` is reused in this same worktree with unchanged lockfiles and workspace links. Required `MANDATE_NO_GIT=1 npm run check` passed: exit 0, **137 files, 1,530 passed, one expected failure, three skipped**, 484.19 seconds; typecheck, boundary, licences and all 106 decision-index rows passed. `npm-check.log` and `.exit.txt` retain the evidence.

The first actual hook failed only `done-check.test.ts` setup at the unchanged 300-second limit; 138 other files passed. The isolated two-CPU trial also timed out (426.85 seconds total; setup 423.165 seconds). CPU restriction was not an effective correction. A configuration preflight verified that `VITEST_MAX_WORKERS=2` is honored, all tests are collected and both time limits are unchanged. After the full CLI run ended, the sole failed suite **also failed** with unrestricted CPU affinity and two workers: exit 1, 447.35 seconds total; setup **442.836 seconds**. All fifteen tests in that suite were skipped after setup failure. Serialization did not resolve the failure either. No assertion failure in the supply data was reported. No hook, test, timeout, band or runtime source changed.

**The requested commits remain unmet. No new commit was created; HEAD remains `f744ca7`.** The actual hook rejected the attempted rail batch (exit 1, 617.43 seconds). Both narrower correction trials failed. The agreed stop rule therefore prevents another full hook attempt. The consolidated diagnosis and retained logs are in `hook-failure-diagnosis.json`, `serial-validation-plan.json`, `commit-rail.log`, `hook-targeted.log` and `hook-targeted-serial.log`, with their receipts. A further attempt needs a newly justified approach to the fixture/runtime failure; S24 does not authorize changing runtime code or its limits. This is not a waiver of the commit requirement.

Two reviewable batches are preserved as `batch-routes.patch` and `batch-depots.patch`, with their exact index trees and hashes in `batch-inventory.json` in the external evidence directory. The first batch remains staged; the closing files and final hand-over remain in the working tree. Commit-message files preserve the required Codex footer. The normal hook is never bypassed. Nothing is pushed or history-rewritten. Independent whole-branch and gate review remain deferred under 0106; these are maker checks.

The one default `npm run run:done-check -- --label s24-drafts` completed with drafting and all eight sweep seeds: **exit 1, 2,613.5 seconds (43.6 minutes)**. All categories were inspected; raw output, structured diagnostics and all five run/save/drafting artifacts with matching hashes are retained in `done-check.log`, `done-check-diagnostics.json` and `runtime/`:

- **Phase 0: 5/6.** Behaviour, hashes, replay/save/resume, liveness and section-ten passed. Budget failed: Union war-by-decision median **45.99 ms** and history median **60.75 ms**, against unchanged 40 ms. Their p95 values, 81.34 and 107.23 ms, were within 160 ms. Testbed median/p95: 7.46/18.15 ms.
- **1A: 2/6.** Unknown-strength and stand-ins passed. Checkpoints failed on Confederate known men **20,957 < 100,000** and zero fought planned operations for each side. Operation failed: two operations, zero operation battles.
- Pushback failed: relay holds **1 < 2**, filter holds **0 < 1**, trims **0 < 1**, reservations **44 > 9**.
- Lever sweep failed: `fort_monroe_arrivals` omits people/grievance policy pushback from its partial victory measure, and the border-governor call chain was unexercised within the weighed horizon. Neither is accepted D6 evidence.

These are twelve reported problems across five failing criteria. The default exit is set by Phase 0. S15/S5's unchanged diagnosis of the four 1A categories is reused; this run's new timing measurements remain failed measurements, not CI performance proof. Drafting was sound, with capped-day worst **130.2 ms**, information rather than an acceptance criterion. Passing authoring checks waives no runtime failure.

## Findings outside my scope

The lead and map owner own temporal schema, company/region/edge adoption and units. The gate reviewer owns sensitive historical use, placements and signatures. S1/S2 and the existing integration owners retain tick timing and the four 1A failure categories; the runtime/validation owner must address the fixture setup failure before these normal commits can complete. Missing rated capacities, dated stock balances, unresolved source dates/arithmetic and the thirty map needs remain open. No other sprint's files were edited. Activation, calibration, December operations and later-war totals are outside S24.
