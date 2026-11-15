# 0050: World format v2: the pack format, its validator and generator, and what becomes State at scenario start

Status: accepted (2026-11-14). From Phase 0 lane 0.2 (`notes/lane-0.2-world-format.md`, which lists every choice with what it rejected) and the standing reviewer's two passes (approved after fixes). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION sections 4, 10 and 11, and decisions 0019, 0029, 0030, 0031, 0033, 0040, 0043 and 0044. Amended by 0055 (starting sides come from the post held on the start date; supply sources and depots are scenario data) and 0058 (a post kind's role, a post's intelligence chief, and each region's civil government at the start) and 0065 (a department's side is State; stores carry their date).

## Decision

**Ownership of the format.** The kernel owns the World types (`packages/kernel/src/world/`). A separate package, `@mandate/pack-format`, holds Zod 4 schemas whose output is exactly those types (a type-level equality test fails on drift in either direction), the validator, the generator and the loader. It is declared non-deterministic because it imports npm code, but its output is deterministic, and the staleness test proves that byte for byte on both CI machines. The CLI writes only through `packages/cli/src/io/` (0044).

**Layout.** Sources are CSV (and a few JSON headers) under `packs/<id>/source/`. A generator writes canonical JSON under `data/`, one record per line, so diffs show the changed record and the file hashes exactly like the World it came from; it writes nothing while any error stands. A test fails when `data/` is stale, and committed data must load on its own (the mod-loader path). The JSON Schemas are published for modders.

**Provenance and licences (0031, 0033).** Every record cites one or more sources; each source's licence lives once, in `PROVENANCE.json`, with the copy used and, for licences stated on a web page, the page and the date read. The allow-list is public domain (with its basis), CC0 and own work. Share-alike, non-commercial, copyrighted and unstated licences are refused. Research notes are pointers: citable, but never enough on their own. A value no source gives is written `unknown` and listed in the record's `unknowns`; a release pack carries none.

**Graph.** Edges are undirected, with an optional return length (upstream against downstream). Rail edges belong to named lines, so parallel lines are allowed and a line's president can hold it as a post; a break-of-bulk flag covers gauge breaks and ferries. Seasons are windows on an edge (reason, months, depth for water), with their effects as pack rules (0029). Forts on water carry passage or reduction and the water edges they command. Off-map boxes carry a role.

**Posts, forces and people (0040).**
- Post kinds are pack vocabulary, marked creatable at start, by appointment or by directive, and temporary or not.
- A post can change department on a date, as a labelled scheduled change, never across sides.
- Standing agreements and prior orders are records on a post.
- An installation (fort, naval base, navy yard, arsenal) is a record inside a region that a post of any department may command; attributes no post holds (capital, port, junction) are flags; a place becomes a region of its own only when a decision about it is a distinct strategic choice.
- A joint expedition is two temporary posts, one per department, sharing an operation and linked both ways.
- A force block records whose forces it is (its department) and who commands it (its post), so state troops under a Confederate general keep their governor's recall lever.
- A neutral state's government is a department with no faction: its posts and forces stand apart from both sides until a situation decides.
- Troops stand in a river or sea region only aboard a ship.
- Sides are checked wherever two records meet.
- People's stat centres are cited directions until stat scales exist (0020, 0026), and traits need a cited act.

**Text.** World records hold string-table keys, never text; all player text is ICU messages (0030), checked for the default locale; every string in a pack is NFC (0044); regions may carry label hints (0043).

**Several starts per pack (0030).** Each part of a start is copied into State once at setup and has one writer from then on: control by `control`; fortification by `regions`; edge conditions, obstructions and depot conditions by `infrastructure`; posts, holders, links, departments and standing orders by `command`; a block's region by `movement`; strength, stores, detachments and non-combatants by `forces`; ranks by `people`; and weather, reserved, by a new `weather` module. Guerrilla pressure is derived, never stored (0046).

Rejected: Zod in the kernel (a deterministic package may not import npm code, 0044); two unchecked definitions of the format; hand-written JSON or YAML as the source format; a licence on every record; sentinel numbers for unknown values; directed edge pairs; rail line names kept in notes; a department owning a region; one post with two departments; a third, "state" faction.

## Consequences

- FOUNDATION section 10 gains the `weather` module and rows for obstructions, depot condition, a post's department and a person's rank.
- Lane 0.3 imports the Union drafts into this format, starting from the fit test in the hand-over note (4,344 errors by kind: citation keys, stat evidence that must move into cells, free text where ids belong, rail lines, ranks, the start's control table).
- The M2 `ids` namespace stays until M2 is replaced (lanes 0.4 and 0.5).
