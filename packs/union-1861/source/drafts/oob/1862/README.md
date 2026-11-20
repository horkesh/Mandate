# 1B order-of-battle drafts

S14, 20 November 2026. **Drafts only: not loaded, unsigned, no generated output.** The initial batch covers Eastern command snapshots. Western, river/coastal and checkpoint batches follow on this branch. The [hand-over](../../../../../../notes/sprint-S14-oob-drafts.md) records scope and verification. S4's [source register](../../../../../../docs/research/2026-11-20-S4-sources.md) identifies the original public-domain scans.

Each snapshot CSV uses exactly the existing `source/drafts/oob/force_blocks.csv` columns. `posts.csv` uses the existing draft post columns. `observations.csv` joins each force row to its source window, level, commander, strength measure, accounting warning and further-research disposition. IDs and the mapping into force blocks/posts are **[I] proposals**, not historical identifiers or applied cast/service records. The post table's `established` and `abolished` stay empty: roster observations do not establish creation or abolition dates.

`strength` is an integer where reported, otherwise empty, with explicit `unknown` in the companion status and row notes. Empty means unknown, never zero. `strength_date` is empty for a monthly/interval observation whose exact return day is not stated. `from`/`through` delimit that observation's source window; they do not establish uninterrupted command tenure or daily strength. An arrow in a commander field records source succession within the window, not simultaneous commanders. Unit eponyms do not identify an acting commander: the November return names an Ewell division without proving Ewell himself commanded it.

The source measure is mandatory. Present for duty includes officers and men where added **[I]**; effective total, aggregate present, present and absent, reconstructed effectives and an unclassified statement of troops “in action” remain distinct. No 93-percent conversion is applied to an already converted number. No parent strength is distributed among unknown children. Army, corps and division rows overlap: **never sum a parent with its children**, and never add the same formation across successive snapshots. A grouping container is not an additional field force. No snapshot is an instruction to instantiate a simultaneous scenario roster.

Stores remain unknown unless a cited page reports days of provisions for that force. Ammunition rounds, capacity, captured stores and later replenishment are not days of subsistence. No generic 30-day norm is inserted. `location` names the source's command/campaign scope, not a point placement or an inferred daily march. Actual positions mentioned in notes retain their dates.

Reading evidence stays outside every worktree in `C:/Pyrrhic/mandate-research-sources/S4/S14/`: selected-page text/JSON, rendered table images, acquisition records and validation logs. Existing S4 PDFs remain in their original S4 paths. Only selected pages/lines are read; neither a retained book nor a keyword search establishes a whole-volume reading claim. All citations use printed pages. OCR is a finding aid; inspected images control numerical tables where columns are lost.

These paths are outside `source/world/` and `source/scenarios/`, which the current generator reads. No manifest, scenario header, loader, runtime checkpoint, strings, generated data or gate signature is changed. The supplied CSV shape does **not** make these drafts valid applied State: parent accounting, cast crosswalks, temporal command changes, the strength-measure mapping and scenario membership still require integration decisions.

## Proposed rulings

1. **[I] Keep dated observations.** Reject one timeless 1862 roster, backfilled monthly strengths and automatic historical battle scheduling.
2. **[I] Keep inclusive totals as evidence.** Reject loading parent totals alongside child strengths as additional manpower. A future apply must choose non-overlapping leaves and report uncovered troops; it must never infer an unknown leaf's share.
3. **[I] Preserve unknown strength as a blocking integration condition.** Reject nominal division-size defaults. A draft unknown is honest research output, not a waiver of 1A/1B's unknown-strength criterion.
4. **[I] Keep command observations separate from cast tenure.** Reject assuming a unit's namesake was its current commander or assigning synthetic person IDs before the S12 crosswalk.

## Findings outside my scope

Temporal application and force-splitting belong to the 1B implementation lanes; S12 owns person/rank/service crosswalks. Claude's whole-branch reviewer and the gate reviewer retain acceptance under 0106. This delivery supplies neither approval nor a gate-none ruling.
