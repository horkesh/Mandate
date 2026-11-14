# Lane 0.7 hand-over: the situations schema, the situations module and the gate

Branch `phase0-situations` (worktree `.claude/worktrees/situations-catalogue-d0d5f8`), on top of main 3028889. Built to FOUNDATION section 12, row 0.7, the lead's brief, `SENSITIVE-HISTORY.md` (sections 1, 2, 5 and 6) and `SITUATIONS-1861-62.md` (schema pressures P1–P17). M2, the seats layer and every earlier test still run. No Union situation is authored; every example is in the testbed's fictional register.

## What is built, and where

| Piece | Where |
|---|---|
| Situation types (World): decision and notice kinds; event and knowledge conditions; options with display keys, proposers, groups, `appearsWhen`, `expiresWhen`, `waitsOn`, effects, locked costs, orders, honoured values, a `watched` mark and their own gate tag; a costed inaction outcome; the historical default (options, a delegation, or unsourced); the staff line (ordered author posts, recommendation, reasons, confidence); chains in stages; resurface thresholds; gate tag and sign-off; citations | `packages/kernel/src/situations/types.ts` |
| Conditions (pure) and the kernel's own reference guard | `situations/conditions.ts`, `situations/references.ts` |
| State, writer `situations`: `situationStates` (status, clock, open options, thresholds crossed, decision, delegate, staff author) and `situationFlags` (0046's chain and wait state) | `situations/situations.ts`, `root-state.ts`, `ownership.ts` |
| The day's situations phase (3b, after the standing step, before cyclic reports) and the `decide` and `delegate` commands | `packages/kernel/src/tick/situations.ts`, `tick/tick.ts`, `log/commands.ts`, `log/log.ts` |
| Seat side: open decisions in the principal's menu; a delegate's menu with the same options scored by his values; situations in the view, never the historical default; the rule seat decides a delegated situation | `seats/api.ts`, `seats/requests.ts`, `view/types.ts`, `view/view.ts`, `packages/rule-seats/src/index.ts` |
| Zod schemas whose output is exactly the kernel type (compile-time equality), the semantic pass, and reading from `situations/` (`drafts/` never loaded) | `packages/pack-format/src/situations.ts`, `situation-layer.ts`, hooked into `generatePack` and `loadPack` |
| The gate: register, classes, triggers, forbidden wording, anachronisms, source policy, checklist versions and release windows as pack files; the mechanical checks; the content hash for sign-offs; the ship rule | `packages/pack-format/src/gate.ts` |
| Published JSON Schemas for modders (situation and the eight gate files) | `packages/pack-format/schemas/` |
| CLI: `npm run pack:gate-hash -- <pack>` prints each situation's content hash for a sign-off; `npm run pack:release-check -- <pack>` runs the ship rule | `packages/cli/src/pack.ts` |
| Testbed examples: six situations (a chain of two decisions with a delegated default, several options at once and a waiting option; a gated decision with a `watched` option that expires with a later law; three gated notices including an atrocity-class event) and a fictional register | `packs/testbed/situations/`, `packs/testbed/gate/`, `packs/testbed/strings/en.json` |
| The seats runner loads a v2 pack's validated situations, so CI's determinism run exercises them | `packages/cli/src/seats-run.ts` |

## How a situation runs

1. **Fire.** Each day, in id order, a situation that has not fired fires when its chain allows it and its event condition holds in State. A decision opens with the options open now; a notice applies its effects at once.
2. **Surface.** It reaches the deciding seat when its knowledge condition holds over that seat's knowledge (0052), or the same day if it has none. The staff line is written then: an `advice` report of the `requested` subtype, from the first author post that is filled by a holder who is not a subject, through the ordinary report path (so it has an author, a route and a delay). If none is available, the record says so (`sitStaffAuthor: null`): "no staff line" is itself information (catalogue P5).
3. **Live.** While open, options appear and expire daily; a change ends the turn (`situation-options`); clock thresholds in `resurfaceOn` end it once each (`situation-resurfaced`); if every option has lapsed, the inaction outcome applies (`situation-lapsed`).
4. **Decide.** The principal sends `decide` (options, at most one per group; none means ignore, which applies `inaction`) or `delegate`. A delegate decides from the same options (gate B7), scored by how far each honours his values. A waiting option applies its locked costs and defers; when its condition holds the situation reopens without it.
5. **Orders.** Every order an option issues goes out in the principal's name, through `issueOrder`, the same validated path as his own orders, by the route the option names (one a principal may order by). A refused order is reported with `entry: -1`. A delegated choice moves the choice, never the authority (0052).
6. **History default.** Only for a principal whose seat is on the rules model, and only once the situation has surfaced and is not delegated, the kernel takes the historical default: its options once they are all open, its delegation, or inaction if unsourced. Nothing else reads the default.

Effects are either chain flags (applied by `situations`) or typed proposals to the module that owns the field (catalogue P13). No owner of those fields exists yet, so proposals are reported in the tick result and counted, not applied.

## The gate: which questions are tests, and which stay with readers

**Tests now** (`GATE_QUESTIONS_TESTED`; each has a positive control in `packages/pack-format/test/gate.test.ts`, and a sweep that disabled each of the 59 check sites in `gate.ts` and `situations.ts` in turn made a test fail every time; its first run found 18 sites without a precise control, now fixed, and one unreachable duplicate, now removed):

| Question | Check |
|---|---|
| A1 | a trigger match (whole words, case rules, proper-noun allowlist) or an effect on a protected field needs a topic tag, or `none` with a reason and a sign-off |
| A2, A3, A4 | placement allowed by the register; a held topic (`record`, or needs-source on the whole topic) admits only a cited text-only item with no effects or options; the item's earliest date inside its topic's window |
| A5, A6 | gated items cite sources that resolve; none banned, and not all weak |
| A7 | a sign-off by a reviewer who is not the author, recording the current version of every applicable question, and the content hash over the item (without the sign-off), the text of every string it shows and every source row it cites |
| A8 | the ship rule, as a release check (`pack:release-check`): no held topic's window overlaps a shipped scenario, and no sign-off is a fixture's |
| B1, B2 | the fields each kind needs; a cause in State, or a labelled railroad |
| B3 | no effect targets a protected field; refused signatures (field and option patterns) from the register |
| B4 | no option, and no decision, carries an atrocity-class topic |
| B5 | every option of a gated decision carries locked costs (which have no condition by construction), and no effect conditioned on that option cancels one |
| B10 | an option the register lists as superseded expires when the law's flag is set |
| C1 | proposers named (schema) |
| C2 | across gated decisions with three or more options, no display position holds the default in more than half (counted from three such decisions: below that, a position always holds half) |
| C3/F6, C4/F5, F2 | anachronisms by earliest date; forbidden wording by scope (label, narrator, any) and severity (fail, or review as a warning the reviewer must note); the proximity rule (a resource word within N words of a protected-group term) |
| E7 | atrocity-class items name the acting side, and none of their effects raises that side's measures |
| B9 | an architecture test: the view layer's import closure cannot reach `situations/`, and no view or request any seat receives carries the default (`packages/kernel/test/situations.test.ts`, `boundary.test.ts`) |
| H5 | the published situation schema has no virtue, morality or karma field |

**Stay with readers:** Q1–Q12 (the reviewer checklist), recorded in each sign-off's question versions.

**Wait for an artefact type that does not exist yet:** D1–D5 (levers: standing orders through a holder, seat initiatives); D6 (the lever sweep needs a victory measure and a victory-only bot, Phase 1); E1–E5 (derived-term declarations); F1, F3, F4, F7 (report templates, quotations, disputed ranges, voice); G1–G5 (setup options, scenario omissions); H1–H4 (verdicts). Each becomes a test when its artefact is built; the checklist file already carries their versions.

## Choices, with what was rejected (for a decision record)

1. **Situations are hand-written JSON, one per file, committed as they are and checked at generation and at load.** They are nested (conditions, options, effects), which CSV cannot carry without a second grammar, and nothing derives them, so there is nothing to go stale. *Rejected:* CSV sources with a generator (an invented nesting syntax); one file for all situations (every edit voids every diff and sign-off).
2. **A closed condition vocabulary**: all, any, not, a day, a flag, fired, decided (with options), knows (a report pattern over the seat's knowledge), a goal, a headquarters, the clock. *Rejected:* an expression language (unvalidatable, and a pack could invent a predicate the kernel does not evaluate).
3. **Effects are flags or typed proposals to the owning module**, never writes (hard rule 5, P13). *Rejected:* effects that set State fields directly (a second writer for every field a pack touches).
4. **Two triggers kept apart**: the event over the truth starts the clock; the knowledge condition over the deciding seat's knowledge surfaces it (0046, 0052). *Rejected:* one predicate (situations either leak news the president cannot have, or start late in history runs).
5. **The historical default is read only for a rule-driven principal, inside the kernel** (a history run), not by the rule-seat package, which is player-facing and may not see it. Not logged, because it is a deterministic function of State and World and replay reproduces it. *Rejected:* putting the default in the seat request for rule seats (it would cross the player-visible boundary); logging it as a seat answer (no seat made it).
6. **A delegate decides by his values**: the menu scores each option by the share of its `honours` among the delegate's values; the rule seat takes the best. *Rejected:* letting the delegate's seat see the default; a separate delegate option set (B7 requires the same).
7. **Waiting options apply their locked costs at once and defer**; the situation reopens without them. A chained `decided` condition reads only final decisions, never a deferral. *Rejected:* a separate deferral object (catalogue P2 proposed one; an option is simpler and keeps the stance on record).
8. **Several options at once by group**: each option names a group, and a selection takes at most one per group; an ungrouped option is taken alone (P3). Attention is per decision (0040), which needs no field here.
9. **The staff line is a report through the ordinary path**, so it has an author, a route and a delay, and its author can be vacant or a subject (0046). *Rejected:* a staff line shown as situation text (no author, no bias, no credibility later).
10. **The gate lives in the pack-format package, the words in the pack** (hard rule 3, section 5). The kernel carries only the tag and sign-off types. *Rejected:* gate checks in the kernel (they are load-time validation, and need regular expressions and string tables the kernel does not read).
11. **The content hash** is over the item without its sign-off, plus resolved strings and cited source rows (section 5), using the kernel's canonical hash. Editing a reviewer's name changes nothing; editing a word voids the sign-off.
12. **Fixture sign-offs are allowed in a draft pack and refused at release.** The testbed's gated examples must load (they are outside `drafts/`), but no gate reviewer has read them; their reviewer is `fixture-signoff`, and the release check names every such sign-off as a ship-blocker. *Rejected:* a real reviewer's name on unreviewed items (false); putting the examples in `drafts/` (nothing would exercise the loader rule).
13. **The ship rule needs scenario windows**, which v2 scenarios do not carry (only a start date), so `gate/release.json` lists the scenarios a release ships with their windows. *Rejected:* an end date on the scenario header (a lane 0.2 format change for a release concern).
14. **C2 counts from three gated decisions.** With fewer, one position always holds at least half, so the rule as written would fail any pack with one gated decision.
15. **Gate tags carry the acting side** (`actingSide`) for the sign rule (E7), since a notice about the other side's conduct is decided or read by this side's principal.

## For later lanes

- **0.5:** an option's orders go through `issueOrder`; corps commanders ordering subordinates stays deferred (0052). The conditions `goal` and `headquartersAt` read the stand-ins and must move with them.
- **0.8:** the runner declares `TICK_MECHANICS` (the seats layer's and the situations phase's). In the 120-day testbed run six situations fire, one is delegated and decided by its holder, and one option issues an order; waiting, lapse, resurfacing and changing options fire only in the kernel tests, since the rule-driven principal takes defaults at once. Lane 0.8 sets their bands for a run that exercises them.
- **Phase 1:** owners for the proposals (politics, regions, forces); the lever sweep (D6) once a victory measure exists; derived-term declarations and verdict templates, which turn their gate questions into tests.
- **Authors of the March 1861 situations:** the schema fits the catalogue's pressures P1 (two triggers), P2 (waiting), P3 (several options), P4 (chains), P5 (ordered authors, no staff line), P7 (orders with routes, in the principal's name), P12 (decision and notice kinds), P13 (typed proposals) and P14 (an unsourced default). It does not yet carry P6 (Congress's chamber state and its ledger), P8 (`raisedBy` another seat's initiative), P10 (hidden terms of a promise), P11 (an outcome that requests a plan or report), P15 (options that buy knowledge) or P16 (inaction as a process); each needs its owner module first.

## Findings outside my scope

1. The register's protected fields, protected groups and refused signatures need content for the real pack, written by the gate reviewer from `SENSITIVE-HISTORY.md` section 3, with a research lane for the trigger and forbidden lists' sources.
2. `docs/design/FOUNDATION.md` section 10 should gain the `situationFlags` row (chain and wait state) beside `situationStates`, and the tick's phase 3b.
3. The seats runner now gives every pack's comms World a `situations` field (empty for M2 packs), which changed the union-1861 seats run's world hash; it is not compared against anything stored.
