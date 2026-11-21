# S24 supply-data drafts, August 1861 to November 1862

Research drafts for the lead and, where relevant, the gate reviewer under decision 0106. Nothing here is loaded, signed, generated into the World, or approved as model capacity. Work starts from `f744ca7` on `sprint/research-foreign-economy`.

The requested edge and depot tables retain exactly the columns of `source/world/edges.csv` and `source/world/depots.csv`. Historical dates, users, operating conditions and evidence belong in their `notes` and in the companion observation tables. Empty model fields mean unestablished, never zero. These files are not import-ready: adoption requires dated operations, map resolution and an explicit units ruling.

## Draft inventory

| File | Rows | Meaning |
| --- | ---: | --- |
| `edges.csv` | 37 | Seventeen rail and twenty river/landing candidates; exact fourteen live edge columns |
| `depots.csv` | 76 | Departmental, shore, afloat, issuing, manufacturing and ordered depot candidates; exact seven live depot columns |
| `rail-gauges.csv` | 37 | Published company baselines, with effective date unestablished |
| `rail-operations.csv` | 41 | Dated extent, repair, interruption, loss, conversion and traffic observations |
| `river-operations.csv` | 38 | Navigation, loads, fleet movements, landing and issuing observations |
| `stores.csv` | 71 | Original quantities and events, preserving reporting stage |
| `transfers.csv` | 10 | Gauge, connecting track, bridge and canal transfers |
| `quartermaster-returns.csv` | 9 | July-September 1862 purchases; individual rows overlap total rows |
| `sources.csv` | 15 | Read source volumes/reports with scan paths, URLs, hashes and limitations |
| `source-pages.csv` | 113 | Printed-page to original/retained PDF-page concordance |
| `map-joins.csv` | 150 | Every edge, named road and depot against the pinned map |
| `map-needs.csv` | 30 | Held map, terminal, corridor, reach and identity needs |
| `unresolved-inputs.csv` | 15 | Missing evidence and rejected shortcuts before adoption |

The thirteen CSVs contain 642 rows, including source, map and hold records. `evidence-notes.md` explains the research and the material disagreements by printed page. The hand-over is `notes/sprint-S24-supply.md`. These are scoped observations, not a complete daily inventory of either side's transport system.

## Reading the drafts

Look up a row's source key in `sources.csv`, then its printed page in `source-pages.csv`. The latter points to a retained PDF page and SHA-256. New scans and extracts are in `C:/Pyrrhic/mandate-research-sources/S5/S24/`; reused S5 scans retain their existing paths. S4 source volumes were read only, with the cited scan pages copied into S5.

`observed_on` and `date_precision` describe the historical event; `source_document_date` records the reporting document. Qualified dates and intervals must not become exact days. The B&O report's fiscal/title year 1862 conflicts with its transportation header printed October 1, 1864; the true composition date remains unresolved. Quantitative ranges use `value`/`value_high`, with approximation or strict lower-bound wording in `unit` and `notes`. Event values of one count an event, not a shipment or supply unit. An empty number is unknown, never zero.

`reporting_stage` distinguishes orders, promises, requests, dispatch, arrival, handling, purchase, reserve, consumption and loss. Only the source's stated stage is supported. Army ration demand is not rail capacity; a boat's draft is not river depth; revenue is not tons; a suit aggregate is not a per-depot stock. Compound campaign observations and totals overlap their components and must not be added indiscriminately.

All model capacity, travel-time, depth and seasonal fields remain blank. `break_of_bulk` is also unestablished: the companion transfer table records the evidence without supplying a runtime penalty. All depot `kind` values are candidate `depot`, with no permanent production source or strength inferred. Seven depot regions are unresolved and blank. Two rail candidates collapse inside existing regions and are held, not usable self-loops. Matching map identities establish no historical possession or serviceability.

Separate rows may describe different sides, departments or stages at the same place. They are not additive parallel capacity. Read the side and department in each depot's `notes`; an ID suffix alone is not a faction classification.

**Do not copy these CSVs into live inputs.** The current loader can supply numerical defaults, and the existing edge/depot columns do not encode this evidence's changing dates, users and reporting stages. Promotion needs the lead's temporal/unit ruling, map resolution and appropriate review. The actual-loader comparison found no reads of this draft directory and the same loaded result with these files visible or hidden.

## Work and validation plan

1. Read original railroad reports and returns alongside the Official Records; separate nominal infrastructure from actual military use. Draft rail routes, gauges, transfers and dated openings/interruptions. Commit this coherent batch through the hook.
2. Cover the Mississippi, Tennessee, Cumberland, Potomac and James; draft their landings, depots, commodities and dated transport constraints. Preserve stock, dispatch orders, requirements and actual deliveries separately. Commit the river/depot batch.
3. Audit every citation against retained scan pages, all map joins, source hashes, CSV shapes, numeric units and preservation. Verify the actual loader does not read these drafts. Complete the required checks and one done check, retaining inherited failures without changing acceptance criteria. Settle inventories and runtime evidence before the final hand-over and final commit.

Scans and raw evidence are retained under `C:/Pyrrhic/mandate-research-sources/S5/`, with new S24 evidence in `S24/`. Earlier S5/S15 source scans may be reused after reading the cited pages; their draft claims alone are not evidence. Research may use retrospective official reports, with the report date kept separate from the date described. Such a report does not establish what a principal knew on the described day.

## Proposed rulings

- [I] Keep original physical measures outside model `capacity` and `length_days`; reject turning tons per year, rolling-stock counts or food requirements into rated daily supply.
- [I] Treat each dated observation as a scoped claim; reject filling the entire window with a single opening, closure, gauge, stock or party's possession.
- [I] Preserve the current map and list needs here; reject inventing a live region, connecting line or transfer penalty.

## Findings outside my scope

Loading, temporal schema adoption, supply calibration, map changes and independent review belong to the lead and the appropriate lanes. Protected people are never entered as freight, labour stock, or a supply multiplier. Sensitive historical use remains an unsigned gate matter. Other sprint files are outside S24.
