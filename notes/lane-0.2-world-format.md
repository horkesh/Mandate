# Lane 0.2: world format v2, hand-over

Status: done on branch `claude/phase0-world-format-c95350`, for the reviewer (0047) and then the steward (0045). Written to be turned into a decision record: each choice names what was rejected.

## What was built

| Piece | Where |
|---|---|
| The kernel's World types: regions, installations, typed edges, rail lines, depots, weather zones, people records, departments, vocabularies, rules, and scenario starts; a pure graph index and world and scenario hashes | `packages/kernel/src/world/` (exported as the `world` namespace) |
| New typed id kinds: department, depot, installation, railLine, scenario, weatherZone | `packages/kernel/src/ids.ts` |
| Zod 4 schemas whose output *is* the kernel's types (a compile-time equality check, with a positive control) | `packages/pack-format/src/schemas.ts` |
| The validator's semantic pass: references, licences, provenance, people's citations, graph rules, scenario starts, string tables, NFC | `packages/pack-format/src/validate.ts`, `licences.ts` |
| The generator: CSV and JSON sources in, canonical `data/` out, every problem at its source row and column; nothing written while an error stands | `packages/pack-format/src/generate.ts`, `cells.ts`, `csv.ts`, `layout.ts`, `format.ts` |
| Loading a pack from its committed files alone (the mod-loader path) | `packages/pack-format/src/load.ts` |
| String tables: ICU messages through intl-messageformat, with fallback to the default locale | `packages/pack-format/src/strings.ts` |
| Published JSON Schemas for modders | `packages/pack-format/schemas/*.schema.json` (`npm run pack:schemas`) |
| CLI | `npm run pack:generate -- <pack> [--check \| --report]`, `npm run pack:validate -- <pack>`, `npm run pack:schemas [-- --check]` (`packages/cli/src/pack.ts`; writes only through `io/`) |
| The staleness check | `packages/pack-format/test/packs.test.ts` (every pack with a `pack.json`: generates clean, `data/` matches byte for byte, committed files load on their own to the same hashes); `schemas.test.ts` for the published schemas |
| The testbed's v2 graph and two starts | `packs/testbed/{pack.json,PROVENANCE.json,strings,source,data}`; features pinned by `packs/testbed/test/world-v2.test.ts` |
| State owners reserved for what the format starts | `packages/kernel/src/ownership.ts` |

Dependencies added, pinned exactly: `zod` 4.6.7 (MIT), `intl-messageformat` 12.1.5 (BSD-3-Clause; its two `@formatjs` dependencies are MIT). The licence check passes.

Positive controls: 78 cases in `validate.test.ts` each break the fixture pack one way and assert the check that fires and the file it points at, and 8 more break the generated data directly for the checks only committed data can trip (an edge's ends out of order, a fort with no fort facts). The CSV reader, the staleness check, the licence allow-list and the schema-to-kernel equality (whole-key and nested drift) each have their own control. After review I disabled every check site in turn, as the reviewer did, and confirmed a test fails for each (F2).

M2 is untouched: the testbed keeps `scenario.json` for `npm run run:testbed`, and every M2 test passes. The `ids` namespace stays: retiring it means touching M2's plain-string aliases across the old kernel, which is not free.

## The format in one page

```
packs/<id>/
  pack.json               manifest: status (draft | release), locales, rules, vocabularies, factions, scenario ids
  PROVENANCE.json         every source: key, title, kind, licence, basis, copy used, licence page and date read
  strings/<locale>.json   hand-written player text (ICU)
  source/world/           departments, regions, installations, edges, rail_lines, depots, weather_zones, people (CSV)
  source/scenarios/<id>/  scenario.json header; control, posts, holders, post_links, department_changes,
                          standing_orders, force_blocks, fortification, edge_conditions, obstructions, depot_conditions (CSV)
  data/                   GENERATED: world.json, scenarios/<id>.json, strings/<locale>.json, GENERATED.md
```

Conventions: lists use `;`; the word `unknown` (or `needs-source`) marks a value no source gives, only in columns that allow it, and the record then lists the field in `unknowns`; a release pack may have none. Citations are `KEY place`, where `KEY` is the longest source key in `PROVENANCE.json` that starts the text (`OR I-1 p.489`); `;` inside parentheses does not split. Every number is an integer: coordinates in microdegrees, rates in permille. Generated JSON is canonical (sorted keys, the kernel's `canonicalJson`) with one record per line, so diffs show which record changed and a parsed file hashes exactly like the World it came from.

## Choices, with what was rejected

1. **The kernel owns the World types; Zod schemas in a separate package produce exactly those types**, checked by a type-level equality test that fails in both directions. *Rejected:* Zod in the kernel (a deterministic package may not import npm code, 0044); kernel types inferred from Zod in another package (the kernel cannot import it); two unchecked definitions (a second owner of the format).
2. **`@mandate/pack-format` is pure over file text and declared non-deterministic** (it imports Zod); the CLI lives in `packages/cli` so every write goes through `io/` atomically (0044). Its output is still deterministic, and the staleness test proves it byte for byte on Linux and Windows CI. *Rejected:* the CLI inside pack-format (a second place that writes files).
3. **Sources are CSV; generated data is canonical JSON.** CSV is what the drafts already use, what a spreadsheet edits, and what diffs well; a modder never touches `data/`. *Rejected:* hand-written JSON (verbose for 900 edges), YAML (another parser to pin), one big JSON file of record with no generator (FOUNDATION 11.7 asks for scripts and a staleness check).
4. **The staleness and validity checks are tests inside `npm test`**, so they run in `npm run check`, the pre-commit hook and both CI machines without touching the CI workflow. *Rejected:* a new `check:packs` script (the workflow test pins `check`'s parts to CI steps; more surface for the same guarantee).
5. **Provenance: every record cites one or more sources; the licence lives once, on the source** in `PROVENANCE.json`, with the copy used and, for licences that are a statement on a page, the page and the day it was read (0031). *Rejected:* a licence on each record (one licence copied thousands of times is a second owner).
6. **The licence allow-list is public-domain (with a basis: government work, expired copyright or dedicated), CC0-1.0 and own-work.** Share-alike, non-commercial, copyrighted and unstated licences are refused with a reason (0033, 0037). *Rejected:* CC-BY for now (it needs an attribution surface in the shipped game; add it with a record when a source needs it).
7. **Research notes are `pointer` sources: they may be cited, but never satisfy a citation alone**, for records, people's centres and traits (the people draft's finding 8). Appletons-only centres pass, since Appletons is a period secondary source; whether they should is the people draft's open question 2, for the history reviewer.
8. **Unknown is explicit.** A null that means "no source gives it" must be listed in the record's `unknowns`; a null in a field that must be declared (birth, death, strength, stores) without the listing is an error; a release pack may carry no unknowns. *Rejected:* sentinel numbers (0, -1); silent nulls (the oob draft asked for an explicit marker).
9. **Edges are undirected, ends in code-unit order, with an optional return length** (`lengthDaysBA`) for upstream against downstream (map question 4). Ids are generated as `type:a:b`, or `type:a:b:line` for rail, so **parallel rail edges on different lines are allowed** (map question 5); a `breakOfBulk` flag covers gauge breaks, ferries and horse-car links (map question 6). *Rejected:* directed edge pairs (doubles every road for no gain); merged lines with names in notes (the president of a line could not hold it).
10. **Rail edges must belong to a named line** (a `rail_lines` table); a post can name the line whose president holds it.
11. **Seasons are windows on an edge** (reason, months, and a depth for water edges); the effect of each reason (permille of length and capacity) and its default months are pack rules (0029). Depth by season is the window's depth. Today's weather, which is a seeded draw, is State, reserved. *Rejected:* per-edge effect overrides (no case yet), free-text months.
12. **Obstruction is a scenario-start fact, then State** (owner `infrastructure`), naming the installation whose works obstruct the edge, or none for works not modelled. *Rejected:* `obstruction_1861` as an edge field (it is true only of one date).
13. **Forts on water carry `passage` or `reduction` and the water edges they command**; each must touch the fort's region.
14. **Off-map boxes carry a role**: `foreign_power`, `blockade_port`, `raider_zone` or `distant_theatre` (0031).
15. **Post kinds are pack vocabulary with `creatable` (start only, by appointment, or by directive) and `temporary`.** A squadron kind marked `directive` is how squadrons are created in play; a temporary kind requires an operation id and dissolves with it (0040).
16. **A post changes department on a date** through `departmentChanges` in the start, applied by `command`. It is a scheduled administrative change, labelled in data, not an outcome; a situation can replace it if play should decide.
17. **Standing agreements and prior orders are records on a post** with kind, issuing post (or none, for a truce), date and a string-table summary (0040).
18. **Several starts per pack** (0030), each under `source/scenarios/<id>/`; holders come from a tenures table, and only tenures covering the start date enter the start (others are warned as history).
19. **People's centres are directions with citations** until stat scales exist (0020, 0026), so the validator can already reject an uncited centre; traits need a cited act; ranks are pack vocabulary with seniority and dates. A permille centre can be added beside the direction without a format break.
20. **String tables.** Names in source tables become keys `<kind>.<id>.name` written to `data/strings/<locale>.json`, escaped for ICU; all other player text is hand-written in `strings/<locale>.json`. The validator requires every referenced key in the default locale, parses every message as ICU, and refuses stray locales. World records hold keys, never text (0003, 0030).
21. **Label hints** (anchor, spine, size class, minimum zoom) are optional per region (0043).
22. **NFC**: every string in every pack file, keys included, must be NFC (0044).
23. **Record-level shape checks.** A record that fails its schema is reported and set aside, and the rest are still validated; references to it are not reported again. *Rejected:* whole-file schema failure (one bad enum hid every other error in the fit test).
24. **A file the generator does not read is an error** (review F3): any file or folder in `source/world/` or a scenario folder that is not one of its tables is reported with the nearest table name, so a misnamed optional table can no longer vanish silently.
25. **Sides are checked wherever two records meet** (review F4): a post's holder, a faction's principal, a carrier and the troops aboard it, a post and its parent, a block and its commanding post, a department change and its new parent must all be on the same side when the person or department has one. **Links (joint, liaison, requisition) are within one side**: dealings with the enemy, such as a local truce, are standing agreements with no issuing post, or situations. A scheduled department change cannot move a post to another side; changing sides is for situations.
26. **Troops on water are aboard a ship** (review F5): a block that is not naval may stand in a river or sea region only aboard a naval block; a carrier cannot itself be aboard anything (which also rules out cycles); a naval block in a land region with no port is a warning.

## The four open format questions, settled

1. **An installation such as a navy yard inside a region, held under another department's command.** Installations are records inside a region with their own ids; a post of any department names the installation it commands. Control stays per faction per region (0019) and command stays per post (0040), so the navy yard's post answers to the navy while the region's defences answer to the army, and an order from one does not supersede the other's standing orders. *Rejected:* a department owning a region (one region could not hold a navy yard and an army's defences); making the yard a region (the budget of 0031, and false fronts).
2. **Joint expeditions.** Two temporary posts, one per department, sharing an operation id and linked `joint`. Relay follows departments (0040: a newer order from a holder's own department supersedes his standing orders, another department's does not), so one post with two departments would make that rule ambiguous; the Sumter relief had troops under War and ships under Navy orders, and Vogdes commanded troops aboard a Navy ship. The link lets a support request (FOUNDATION section 5) find its partner. The validator enforces the shape (review F4): both posts temporary, the same operation, different departments, the same side, linked both ways. *Rejected:* one post with two departments; hanging the expedition under one department (the oob draft's interim).
3. **State troops under a Confederate general.** A force block has `department` (whose forces: who raised them and may recall them) and `post` (who commands them). A state's own government is a department of the faction it sides with, so South Carolina's troops are a state department's forces under a Confederate War Department post, and the validator requires only the same faction. *Rejected:* a third "state" faction (control and fronts are per faction, and the state troops fought on one side); merging them into the Confederate War Department (it loses the governor's recall lever, which is real politics).

   **A neutral state's government and forces** (review F6; Kentucky from May to September 1861, catalogue S16) are a department with no faction. Its posts and forces form a side of their own: they may not answer to, or command, either faction's posts, a faction's man may not hold its posts (its governor's person record has no faction), and the regions it holds are no one's in control, which control already allows. A scheduled department change cannot move it to a faction; choosing a side is the situation's work. *Rejected:* a fake allegiance (wrong history, and the S16 choice would already be made); not modelling neutral forces until they choose (the State Guard and the governor's leverage are the point of S16); a third faction (the same objection as above: control and fronts are per faction).
4. **Installations as flags or as regions.** Attributes no post holds (capital, port, rail junction, river junction) are flags on a region. Things a post can hold (fort, naval base, navy yard, arsenal) are installation records inside a region. A place becomes a region of its own, a key point, only when a decision about it is a distinct strategic choice (the map research note's rule), and naval bases must be key points (the navy note; the validator enforces it). *Rejected:* everything as flags (nothing for a post to hold, nowhere for a fort's mode and edges); everything as regions (the 250-region budget).

Two smaller ones from the oob draft: a governor's link to a Secretary of War is a `requisition` link, not a parent (question 2); labourers who eat a garrison's rations are `nonCombatants` on the block (question 10).

## What becomes State at scenario start, and who writes it

World stays World: regions, edges, installations, rail lines, depots, weather zones, departments, people's records, rules and vocabularies. Each part of a start is copied once into State at setup and has one writer from then on (`START_OWNERS` in `packages/kernel/src/world/scenario.ts`):

| Start part | State owner |
|---|---|
| control | `control` |
| fortification | `regions` |
| edge conditions, obstructions, depot conditions | `infrastructure` |
| posts: holders, temporary posts, links, department, department changes, standing orders | `command` |
| a force block's post (assignment) | `command` |
| a force block's region | `movement` |
| strength, stores on hand, detachments, non-combatants | `forces` |
| a person's rank at the start date | `people` |
| weather (reserved; nothing at a start) | `weather` |

New `OWNED_FIELDS` entries (reserved, no code yet, so lanes 0.4 to 0.7 fill in their record and key): water edge obstructions and depot condition (`infrastructure`); a post's department (`command`); a person's rank and its date (`people`); today's weather per zone (`weather`, a new State module). Fortification and edge condition were already there. **Guerrilla pressure is deliberately not State** (review F1): the gate register (SENSITIVE-HISTORY section 3.6, accepted by 0046) places it as derived, computed with typed reasons, never stored, and never the target of an option; raids reach State only through edge and depot condition. **FOUNDATION section 10's tables need these rows and the `weather` module**; that is the lead's to record.

## Fit test over the three drafts

Run with `lane-0.2-fit-drafts.mts` in the shared notes folder (full output in `lane-0.2-fit-report.txt`). The adapter only renames columns whose meaning matches (`counties_1861`, `key_point_flags`, `side`, `reputation_1861`, `traits_evidence`, `rank_dates`, `parent_post`, `location`, `parent_block`, `person_id`, `post_id`) and supplies what the drafts lack: a manifest with the vocabularies their READMEs declare, a 4 March 1861 header, and a PROVENANCE.json of the 72 keys in their source tables (Bates's diary as licence unknown, research notes as pointers). No data cell was changed, and no Union pack file was written or committed.

**4,344 errors and 156 warnings:**

| Count | Kind | What it means for lane 0.3 |
|---:|---|---|
| 2,757 | unknown-source | People: 1,560 entry-level keys (`APPLETONS-adams_charles_f`, `OR-I-4-p296`, `HEIT1-…`) that the citation grammar does not split at the hyphen; write `APPLETONS adams_charles_f` or register the entry keys. Edges: 1,165, mostly road edges citing `needs-source` (609) or `adjacency` (527), which the map README already says are unsourced. Regions: 32 cite research notes or `needs-source`. |
| 582 | centre-without-citation | People's stat evidence is in `people-sources.md` Part 3, not in the cells; move each centre's keys into its cell (`above:KEY+KEY`). |
| 362 | shape/invalid_format | Free-text places and departments where ids belong: posts (143 places, 30 departments), force blocks (93 places, 96 rows with no department column). |
| 173 | rail-without-line | Every rail edge: line names are in the notes. |
| 169 | bad-cell | People's ranks in free text (110; the format wants `rank:date` with a rank vocabulary), and free-text river seasons (59). |
| 165 | control-missing | No control table yet: the start's control is 0.3's. |
| 63 | shape/invalid_value | Region flags `fort`, `naval_base`, `navy_yard`, `arsenal`: installations in this format (question 4). |
| 27 | unlisted-null | Empty birth or death dates not marked `unknown`. |
| 12 | duplicate-holder | Posts with two tenures covering 4 March (Pensacola navy yard and others): pick the holder, or mark one acting. |
| 12 | unknown-column | `theatre`, `fort_mode` (regions); `obstruction_1861` (moves to a start's `obstructions.csv`); `posts_1861_62`, `west_point_class`, `prewar` (people); `side`, `established`, `abolished` (posts); `person_name`; `side`, `units` (force blocks). |
| 9 | off-map-role | Off-map boxes need a role. |
| 4 | unknown-reference | People with side `border` or `foreign`: faction is empty for foreigners. |
| 2, 1 | missing-file, missing-column | No `departments.csv` or `control.csv`; force blocks lack `department`. |
| 2, 2, 1, 1 | missing-value, unknown-not-allowed, shape/too_big, licence-not-allowed | Two Confederate posts without a department; `needs-source` as a ship's location; one location over 128 characters; Bates's diary (licence unconfirmed). |
| 130, 26 | warnings: unknown-value, tenure-outside-start | People's `unknown` centres (allowed in a draft); tenures that begin after 4 March. |

Records that fail their shape are set aside, so more reference errors will surface once the ids are fixed (department ids above all, since there is no departments table).

## Deferred, and not done

- No State records are built: lanes 0.4 to 0.7 build them on the reserved owners.
- Weather zones and raids: owners and fields reserved, no mechanics.
- Tenure history beyond the start, and rank changes in play: the start takes only tenures covering its date.
- `invented` people: allowed only where `pack.json` sets `allowsInventedPeople` (off by default, so a historical pack cannot carry an uncited "invented" real person), and even then the record's own provenance must cite a real, admissible source; only its centres and traits are exempt (review F7). 0033's officer pool is generated in play, never stored.
- Only English string tables; locale fallback works and is tested.
- `CLAUDE.md`'s command list should gain `pack:generate`, `pack:validate` and `pack:schemas` (the steward's sync).

## Findings outside my scope

- `ownership.ts` lacked three FOUNDATION rows from 0046 (situation chain and wait state, the Congress accountability ledger, people who have reached Union lines). I did not add them, since lane 0.7 builds those fields.
- The people draft's citation keys join the work key and the place with a hyphen; the map and oob drafts join them with a space. Lane 0.3 should pick one, and the format's grammar is the space (see the fit test).
- `.githooks` is wired through an absolute `core.hooksPath` to the main checkout, so worktrees run the main checkout's hook script; harmless today, worth knowing if the hook changes on a branch.
