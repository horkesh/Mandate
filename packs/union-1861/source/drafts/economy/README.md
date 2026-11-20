# Economic observations for S15

Research drafts, 20 November 2026. **Nothing here is loaded or generated.** The existing pack manifest, importer, schemas, world, checkpoints and runtime rules are unchanged. These CSVs are a research interchange format, not a proposed kernel schema. [Source register](../../../../../docs/research/2026-11-20-s15-sources.md); [interpretation and gaps](../../../../../docs/research/2026-11-20-s15-economy-foreign.md).

Each row identifies one quantity, its unit and measurement perimeter, its accounting/observation window, source-document date where established, page citation, and status. Decimal monetary values are exact decimal transcriptions in the stated nominal currency. They are not modern dollars or interchangeable gold balances. `value_high` is present only for a range actually given. `lower_bound` preserves “more than”; `approximate` preserves rounded claims. Blank numbers mean absent evidence, never zero.

`observed_on` preserves the source's precision: a day, month, year or report date. `period_start`/`period_end` identify the window counted, not when Washington learned it. `source_document_date` dates the report/law or historical reconstruction; it supplies **no player knowledge route**. A fiscal-year boundary expanded by arithmetic is marked [I]. Later sources can support retrospective truth-side comparisons without becoming contemporary reports in the player's inbox.

| File | Content | Adoption limit |
|---|---|---|
| `finance-inputs.csv` | Both treasuries' dated balances/accounts and Union note/bond/deposit authority | Authority, issue, gross receipts, obligations and payment are separate; rows may overlap and must not all be summed. |
| `prices-exchange.csv` | Confederate monthly exchange/commodity multiples and Union dated quotation ranges | Exchange quote, percent premium, price multiple and physical scarcity differ; blank foldout cells stay absent. |
| `industry-baselines-production.csv` | Same-table prewar iron/rail baselines, Springfield output and contracts, Confederate manufacture/capacity claims | Prewar plant, contracted production, actual output and serviceable deliveries are different. Source quality is explicit. |
| `union-ordnance-return.csv` | Ripley's original 21 November report: procurement, furnishing and June depot stocks, capacity/forecasts and saltpetre | Procurement includes purchases; furnishing can draw on earlier stocks; capacity and powder equivalence are claims, not realized monthly output. |
| `rail-operations.csv` | Named Union line openings, equipment orders, repairs, losses and gauge work | Route length/operating status is not tons per day. Retrospective report date is kept apart from the operation. |
| `confederate-rail-returns.csv` | Richmond & Danville's financial/physical returns and car inventory; Piedmont progress communication | Fiscal-year traffic, dated inventory, worn track and incomplete construction have different meanings. |
| `richmond-danville-locomotives.csv` | The company's 30 September 1862 locomotive-condition table | Reported condition is preserved; analyst groups supply no availability or haulage coefficient. |
| `legal-constraints.json` | Income-duty collection timing, the earlier direct-tax levy, coin exceptions and the no-double-counting retention constraint | Documentary legal facts and marked interpretation; no executable tax or recruitment system. |
| `unresolved-inputs.csv` | Eight quantities still on hold, with the evidence read and the next evidence needed | Missing inputs stay missing; available observations do not measure these quantities. |

The Springfield figures come from a contemporary magazine account, not an original armory return. Schwab's Confederate small-arms and saltpetre figures remain attributed secondary evidence. Claimed monthly armory capacity is not observed monthly production. McCallum's official retrospective rail account is new S15 evidence; its 1863-65 totals are not backdated into 1862.

**[I] Proposed ruling:** adopt quantities only after specifying which engine output has the same unit, period and perimeter. Reject a generic economy scalar, nominal money automatically spendable abroad, immediate full bond/note ceilings as cash, prewar rail miles as wartime throughput, or capacity as delivered arms. No new coefficient, calibration band or daily budget is supplied.
