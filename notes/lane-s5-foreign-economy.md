# S5: foreign powers, blockade and war finance

For the lead: 3 items. Research packet delivered for post-sprint review, 2026-11-20. This is a docs-only lane on `sprint/research-foreign-economy`, based on `ceff796`; nothing here is accepted canon or a gate signature.

## Scope and method

Read the main checkout's CODEX standing, command-line, writing and sprint instructions, decision 0106, CLAUDE hard rules, lane rules, and the economy/foreign-powers design boundaries. Research covers Britain and France, Trent, recognition and mediation, cotton and blockade effectiveness, both treasuries, currency, taxation, prices, industry and rail transport. Adjacent work follows the evidence into neutral trade, procurement, food distribution and external credit. Facts require pages actually read; arithmetic and interpretation carry [I]. Scans and working evidence stay in `C:/Pyrrhic/mandate-research-sources/S5/`.

`npm ci` completed successfully before work: 51 packages added, zero vulnerabilities. No code, pack data, accepted decisions or other lane files were edited. Git history is this project's ledger; no AWWV ledger applies.

## Delivery

- [Source register and scan inventory](../docs/research/2026-11-20-s5-sources.md): editions, page mapping, limitations and SHA-256 inventory.
- [Foreign powers](../docs/research/2026-11-20-s5-foreign-powers.md): belligerency versus recognition, Trent's dispatch/receipt/reply sequence, British internal disagreements, French opinion and mediation, Mexico, proclamation reception and adjacent 1863 evidence.
- [Blockade and cotton](../docs/research/2026-11-20-s5-blockade-cotton.md): law versus station coverage, fleet and seizure denominators, official exports, British arrivals and distress, withholding, licensed trade and the export-credit-procurement-return route.
- [War finance and prices](../docs/research/2026-11-20-s5-war-finance.md): both treasuries, enacted note/tax provisions, actual receipts and unpaid requisitions, Confederate March/August accounts, exchange and commodity series, foreign purchasing and later external credit.
- [Industry and rail](../docs/research/2026-11-20-s5-industry-rail.md): prewar output, wartime manufacturing claims, railroad mileage and legal control, repair/supply evidence still needed, food and salt distribution.
- [Checkpoint candidates](../docs/research/2026-11-20-s5-checkpoints.md): sourced ranges and dated points, reporting definitions, explicit display tolerances and unresolved inputs. No gameplay acceptance band is invented from a single point.

The main conclusions are measurement constraints. Recognition, mediation and legal acceptance of a blockade are different decisions; cotton distress supplies no measured automatic intervention threshold. Loan/note authority is not a receipt, and a receipt is not necessarily hard currency available to an agent abroad. Fleet construction, administrative vessel totals, seizures and cargo losses have different denominators. Prewar industrial output and rail mileage do not establish November 1862 military stocks or throughput. Each argument and its historical pages are in the topic notes.

The audit corrected OCR errors in customs/food tables and the later-1862 tax transcription, and obtained the readable commodity-price foldout missing from the first scan. It preserves, rather than reconciles by invention, the early studies' conflicting French dates and relief totals, the census's two railroad totals, and discrepancies within the March Treasury report and Schwab's tax aggregate. The August primary account now supplies a separate contemporary finance checkpoint.

## Validation plan

First check branch, clean baseline, hook configuration, dependency installation, source readability and printed-page mapping. Before each coherent commit, check documentation scope, citations, source hashes and whitespace. The required pre-commit hook runs `npm run check`; retain its output outside the worktree. Also run the inherited required done check once, reporting inherited failures without changing them. Expected cost is a few minutes per hook, not a research calibration campaign. Stop expensive retries after any unexpected failure, diagnose retained evidence, and only repeat an affected gate after a cheap correction check. No performance or scenario campaign is authorized or necessary for docs-only research.

The inherited done-check command itself includes repeat/replay/resume, historical runs and its built-in lever sweep. Its default run is substantially longer than a hook (a comparable recorded run took about twenty minutes). It is the one required check, with no additional seed or calibration campaign added by S5. Pass criteria remain the project's Phase 0 criteria; all reported 1A failures are retained too. The stopping rule is completion of that invocation, with no retries to improve inherited results.

First coherent commit: `24f3903`, finance and source foundations. The unchanged hook passed: 139 test files; 1,548 tests passed, one expected failure and three skips; pack boundary, dependency licences and 106 decision records/index rows passed. Evidence is `commit-finance.log` and `commit-finance.exit.txt` (0) in the external S5 folder. The closing research commit is subject to the same hook; `commit-research.log` and `commit-research.exit.txt` retain its receipt, and the one final CODEX status records its hash and result. No bypass is used.

The final document/source audit found six research notes, 19 readable PDFs (18 historical scans plus one modern research paper), no invalid local links, no scope or encoding errors, and no missing entries among 197 retained page locators. There are seven delivery files including this handover. `doc-audit.json`, `citation-audit.json`, `source-inventory.json`, `page-locators.json` and `closing-audit.json` retain the evidence. Three HTTP error responses named as PDFs are explicitly excluded. The scan inventory in the source register supplies the hashes. The final scope check confirms runtime code, fixtures, packs, locks and accepted decisions are identical to `ceff796`; this reuses the first hook's unaffected evidence without claiming a new baseline campaign.

### Required done-check result

Ran `npm run run:done-check` once, with no reduced seeds or omitted drafting. **Exit 1**. Full evidence: `done-check.log`, `done-check.exit.txt`, `done-check-diagnostics.json` and the retained `runtime/` summaries in the external S5 folder. These are diagnostics on the unchanged runtime, not failures caused by research data being applied.

- **Phase 0: 5/6 passed.** Behaviour, daily hashes, save/resume/replay, liveness and required section-ten tests passed. Budget failed: war-by-decision median **44.57 ms** and history median **43.77 ms** exceed 40 ms; p95 values were 71.56/72.92 ms. The budget stays unchanged.
- **1A: 2/6 passed.** Unknown-strength and stand-in checks passed. Checkpoints failed: Confederate known strength **20,957** below 100,000, and **zero** planned operations fought for both sides. Union known strength **18,686**, with four unknown-strength blocks, is reported below its floor but the harness explicitly treats that lower edge as nonbinding; do not count it as a failing gate. Confederate unknown-strength blocks numbered thirteen.
- **Operation failed:** two operations, no operation battle in the history run.
- **Pushback failed:** relay holds **1** below 2; filter holds **0** below 1; trims **0** below 1; compliance with reservations **44** above 9. Other reported pushback observations remain in the log.
- **Lever sweep failed:** eight seeds/eight gated decisions, 248 base-run regiment calls; `fort_monroe_arrivals` return was best in 0/8, but that is **not an accepted D6 result**. The victory measure omits people/grievance policy pushback, and no border governor answered a call within the 24-move horizon. Both the partial measure and unexercised chain remain open.

The default command's exit is set by Phase 0; the four 1A failures are still reported and remain unmet. No criterion, band or measurement was changed, and there was no expensive retry. Timing and implementation correction belong to their respective lanes. The drafting diagnostic was sound; its capped day worst value was **106.9 ms**, information rather than another passing/failing criterion.

## Proposed rulings

All four are [I] proposals for the lead under 0023/0106; none changes canon or engine behaviour.

1. Preserve separate diplomatic stages and received reports through the Secretary of State. Reject one cotton-distress threshold that automatically grants recognition, and reject exposing private foreign cabinet knowledge to Lincoln without a route. The historical sequences support distinctions but do not measure a daily probability equation.
2. Keep authorization, instrument issue/placement, receipts, obligations and payment distinct, with domestic paper separate from external purchasing means. Reject spending full loan ceilings on enactment, crediting annual individual income duty before its collection date, or backdating 1863 Erlanger proceeds and tax-in-kind law into 1862.
3. Define each blockade measure before calibration: inventory/readiness, port status, legal acceptance, attempted passages, captures and delivered cargo. Reject treating 427 vessels including construction as deployed blockaders, or 543 cumulative seizures as a capture percentage without attempts. Reconcile cargo and finance effects to avoid duplicating one loss.
4. Require matched windows, territories, denominations and reporting perimeters for historical comparisons. Reject arbitrary broad bands around isolated points, averaging contradictory totals, and translating prewar annual output or rail miles directly into serviceable 1862 supply. Wider bands remain an unmet research/design question until supported or explicitly ruled on.

## Remaining

1. Claude's standing reviewer reviews the whole branch after the sprint under 0106; the sensitive-history reviewer rules on any derived content/effect. No signatures were added.
2. Before implementation/calibration, obtain the missing monthly Confederate accounts through November, representative Union household/wage series, November-specific Lancashire relief, port/cargo attempt denominators, 1862 cargo ownership and named-line operating returns. The August report improves the finance series without making it monthly. Resolve the French date conflict against the original dispatches.
3. The lead rules on the four proposals and routes the runtime failures listed above. S5 supplies research only and does not change behaviour to make those checks pass.

## Findings outside my scope

- S3 owns the political passage/vote history of revenue legislation; this lane reads enacted provisions and collection accounts for economic consequences. No political-lane files were changed.
- S4 owns blockade deployments, coastal operations and military outcomes. This packet's administrative totals cannot replace station-level operational evidence.
- S7/gate review is required before tax descriptions involving enslavers, proclamation reception, coercive procurement or civilian hardship become authored effects or situations. Source language and publicists' prejudices remain attributed, with no managed-person resource proposed.
- A future economy/rail implementation needs route-level equipment, bridge/repair and delivery returns, instrument/account definitions and explicit knowledge routes. No graph, pack, mechanics, checkpoint fixture or accepted decision was edited here. The inherited runtime checks belong to their implementation/performance lanes and retain their original acceptance criteria.
