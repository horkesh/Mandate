# S15: 1862 manpower and economic data drafts

For the lead: 3 items. S15 delivered on `sprint/research-foreign-economy`, from `b0cc385`. Every delivery remains a draft, excluded from loading and generation. Evidence stays in `C:/Pyrrhic/mandate-research-sources/S5/s15/`. Nothing is signed or pushed.

## Work and verification plan

1. Read the original conscription and exemption texts, Union calls, quota tables and expiring-term evidence. Draft an R90-style catalogue with dates, terms, legal authority, quotas and separate retention rules. Commit this batch through the hook.
2. Re-read the relevant S5 source pages and draft dated economic and foreign observations. Widen into railroad operating returns, ordnance output and monthly blockade captures. Preserve unavailable quantities and incompatible definitions. Commit the settled batch through the hook.
3. Verify CSV/JSON readability, unique identifiers, citations, source hashes, date precision, arithmetic, allowed paths and exclusion from runtime inputs before expensive checks. Reuse S5's unchanged runtime evidence explicitly. Run the required `MANDATE_NO_GIT=1 npm run check` and one default `npm run run:done-check`; retain every failure. No added simulation or calibration campaign.

The hook asks whether the staged branch passes the project's full checks; expected cost is minutes per batch. The done check asks whether the unchanged runtime still meets the inherited criteria; it can take twenty to thirty minutes on this shared host. Pass criteria remain unchanged. Stop after that single invocation; diagnose failures without expensive retries. Cheapest rejection gates are branch/hash, dependency startup, readable sources and draft isolation. No package build is needed.

## Manpower batch

Drafted six CSVs and a README under `packs/union-1861/source/drafts/calls/1862/`: eleven catalogue records; forty-six quota rows using the existing nine-column form; forty-eight retrospective credit rows; nine service/retention records; thirty-seven exemption classifications; five dated quota variants/corrections. The research note is `docs/research/2026-11-20-s15-manpower.md`; the source register supplies original scan links and printed/PDF mappings. Both quota tables sum to 334,835 [I] against nominal 300,000 calls; credits separately reconcile to the printed totals of 421,465 and 87,588. No arrival date is invented for retrospective credit.

Legal retention is separate from new intake. September authority through forty-five is separate from the October call limited to under forty. The ninety-day transition dispute, August 15/18 deadline variant, Illinois correction, Delaware revision and New York 59,705/59,755 variant remain explicit. Exemptions have no headcounts or managed-population effects. Batch two adds eight attributed administrative observations of conscripts, short-service categories, accepted/enrolled volunteers and a conditional forecast. They are not national intake rates.

## Settled inventory and second batch

Final inventory: **28 files,19 CSVs,809 data rows**. [Calls](../packs/union-1861/source/drafts/calls/1862/README.md) contain **164 rows**; [economy](../packs/union-1861/source/drafts/economy/README.md) **243**; [foreign/blockade](../packs/union-1861/source/drafts/foreign/README.md) **402**. Four legal constraints are separate JSON. The [manpower note](../docs/research/2026-11-20-s15-manpower.md), [economy/foreign note](../docs/research/2026-11-20-s15-economy-foreign.md), [source register](../docs/research/2026-11-20-s15-sources.md) and [machine inventory](../docs/research/2026-11-20-s15-source-inventory.json) provide interpretation, page citations, exact URLs, hashes and selected printed/PDF locators. **23 PDFs,588,972,579 bytes** were consulted at relevant passages; no whole-volume reading is claimed. S5 notes guided re-reading of their original pages. Unused leads and inherited HTTP errors named as PDFs are excluded.

Economy rows separate authority, issue, receipts, obligations and payments, with currencies, periods and reporting stages preserved. Three blank commodity cells remain absent. Treasury trade appendices dated December 26 are later than its December 4 narrative and the November endpoint. Foreign rows separate incidents, dispatches, receipt, private/public proposals, formal presentation, decisions and execution. Cotton arrivals, official exports and public relief have different perimeters; public/private relief is not summed as unemployment. The French dating conflict remains open; October 31 is notice of a request about to be sent, not a verified dispatch.

Rail widening adds McCallum's dated Union openings, equipment orders, repairs, losses and gauge changes. The original Richmond & Danville return supplies fiscal traffic/earnings, seventeen car categories, track/repair constraints and 22 named engines with reported conditions. Piedmont work begun is not a completed connection. Annual work, mean train load, nominal inventory, condition and daily military delivery are separate. Later reports have no invented contemporary presidential receipt dates.

Ordnance widening includes the contemporary Springfield magazine account and Ripley's original November report/appendices. The **35-row original-return table** separates cumulative procurement, furnishing, fiscal-year fabrication, depot stocks, saltpetre, capacity claims and forecasts. It preserves cartridge variants and different reporting periods rather than forcing a balance. Actual National Armory/arsenal fabrication is separate from capacity and the January magazine output. See the research note and row citations for quantities and scan/OCR corrections.

The monthly Navy series is a declared named-vessel subset: **337 records,322 month-known and fifteen year-only [I]**, captured or destroyed for blockade violation or battle. January through December counts are **18,26,38,49,40,37,19,23,13,19,22,18 [I]**. Explicit ditto dates are expanded; blanks stay unknown. Cargo-only and multi-craft unnamed/property sections are excluded. This is not a national blockade-only census, unique hulls, condemnations, tonnage, attempts or an interception rate. Printed year groups are preserved. The register makes aggregation inspectable.

**S3/lead correction:** the July act construes the earlier $20 million direct tax as a single levy and suspends further levy under that authority until April 1865. S5's annual-law summary must not create a recurring annual receipt. [TX62 p.489 sec.119] The legal JSON records this clarification; no S5 file was silently rewritten.

## Verification and retained failures

Inventories, runtime diagnostics and preservation checks preceded this final handover. The source/data audit passed **228 checks**; numeric citation checking found **1,438 references,170 distinct source-key/pages and none unmapped** before this final documentation. CSV/JSON readability, UTF-8, IDs, links, quota/credit sums, date precision, ordered windows, capture aggregation, unknown cells and rail inventory sums pass. Initial link, audit-selector and overly broad citation failures and their corrections are retained. Evidence: `scope-audit.json`, `citation-locator-audit.json`, `preservation-before-close.json`, `preservation-final.json`.

Preservation confirms **all 1,680 baseline files unchanged**, no out-of-scope changes, matching hashes for all 23 PDFs, and byte equality against the before-close baseline snapshot. Existing importer/manifest inspection confirms these draft areas are not loaded. Runtime, generated packs, fixtures, locks, signed material, source policy and bands are untouched. No package build or added calibration campaign ran. Lead review remains after the sprint under 0106/0096.

`npm ci` ran first: **exit 0**, 51 packages, zero reported vulnerabilities (`S5/s15-npm-ci.log`). Required **`MANDATE_NO_GIT=1 npm run check` exited 0**: **137 files;1,530 passed,one expected failure,three skipped**; typecheck, boundary, licences and the 106-row decision index passed. Receipt: `npm-check.log` and `.exit.txt`.

First batch **`86b0ba1`** passed the actual hook (`commit-manpower.log`, `.exit.txt`, exit 0). The closing economic/foreign batch must pass its actual hook; `commit-economy.log` and `.exit.txt` retain its receipt, and the one final CODEX status records its hash/result. Both use the required footer and normal hook. No bypass or push is used. Unaffected full-check evidence is reused rather than repeated for reassurance.

Required **`npm run run:done-check -- --label s15-drafts` exited 1**, once, including default eight seeds/30-day sweep horizon and drafting. It took about forty minutes, exceeding the twenty-to-thirty-minute estimate. Full evidence: `done-check.log`, `.exit.txt`, `done-check-diagnostics.json`; all **five** run/save/drafting artifacts are retained under `runtime/` with matching hashes. All failure categories were inspected:

- **Phase 0:5/6.** Behaviour, hashes, replay/save/resume, liveness and required section-ten tests passed. Budget failed on Union war-by-decision median **52.65 ms**, Union history median **117.72 ms** and history p95 **224.93 ms**, against unchanged 40/160 ms limits. War-by-decision p95 was 84.15 ms; testbed median/p95 4.59/6.43 ms. These local results do not establish CI performance.
- **1A:2/6.** Unknown-strength and stand-ins passed. Checkpoints failed on Confederate known men **20,957<100,000**, and zero planned operations fought for each side. Operation failed: two operations, zero operation battles.
- **Pushback failed:** relay holds **1<2**, filter holds **0<1**, trims **0<1**, reservations **44>9**.
- **Lever sweep failed:** `fort_monroe_arrivals` has a partial victory measure omitting people/grievance policy pushback, and its border-governor call chain was unexercised in the weighed horizon. Neither permits an accepted D6 finding.

Thus **thirteen problems** remain: three Phase 0,ten 1A, across five failing criteria. The default command's exit is set by Phase 0. S5's unaffected diagnosis of these same runtime failure categories is reused; the new timing values remain failed new measurements. The drafting diagnostic was sound, capped-day worst **49.9 ms**, information rather than a criterion. No criterion is waived, no timing cause asserted, and no expensive retry attempted.

## Remaining evidence

Eight HOLD records name missing monthly Confederate finance, monthly original armory/ordnance deliveries, foreign-response coefficients, complete blockade-only monthly captures, attempted-passage/cargo denominators, monthly rail serviceability/depot deliveries, representative wages/household prices, and net recruiting/occupational losses. Original French dispatch reconciliation and more Confederate company returns would also improve coverage. These are not filled by tuning.

## Proposed rulings

All are **[I]** proposals; none is accepted canon.

1. Keep authority, executive call, quota, enrollment, muster, retention, expiry and field strength distinct. Reject immediate full armies on enactment and double-counting retained men.
2. Keep dated quota/credit revisions and original tables. Reject silently rescaling 334,835 to 300,000 or using final furnished totals as arrivals on call dates.
3. Retain calendar terms and original enlistment dates. Reject a universal ninety-day expiry or a new three-year Confederate clock beginning April 16.
4. Keep exemptions as conditional research classifications for review. Reject universal occupational percentages, blanket enslaver exemptions and any managed stock of protected people.
5. Match units, currencies, periods, territories, instruments and reporting stages before adoption. Reject generic economy scalars, authorized ceilings as immediate cash, unsupported recurring tax receipts and arbitrary calibration bands around isolated observations.
6. Keep actual production, purchases, furnishing, stock, claimed capacity, forecasts, rail extent and operation distinct. Reject annual output as November stocks, contracts as completed arms, nominal engines as usable haulage, and annual transport work as daily rated capacity.
7. Preserve diplomatic authority and communication routes. Reject automatic knowledge of private correspondence, speech equals Cabinet policy, and cotton distress as a measured recognition threshold.
8. Keep the monthly named-vessel series under its explicit subset definition. Reject a complete blockade-count/rate label, unsupported year repairs or adding overlapping annual seizure totals.

## For the lead

1. Review the two commits after the sprint under 0106 and choose data/levy conventions before adopting any draft.
2. Route the direct-tax clarification to S3 and sensitive exemptions/coercive recruitment to the separate gate reviewer; no signature or player wording is supplied here.
3. Retain the eight holds and all thirteen runtime problems with their owners; commission the specific evidence or implementation work needed to resolve them.

## Findings outside my scope

S1/S2 own inherited runtime criteria and timing; S4 owns military operations, S3 political/tax-law synthesis, and S7/the gate sensitive wording, placement and signatures. Runtime implementation, acceptance-band changes, knowledge routing and activation of these data remain outside S15. Nothing is loaded or pushed.
