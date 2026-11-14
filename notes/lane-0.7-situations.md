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
| The gate: register, classes, triggers, forbidden wording, anachronisms, source policy, checklist versions, release windows and accepted reviewers as pack files; the mechanical checks; the content hash for sign-offs; the ship rule | `packages/pack-format/src/gate.ts` |
| Published JSON Schemas for modders (situation and the nine gate files) | `packages/pack-format/schemas/` |
| CLI: `npm run pack:gate-hash -- <pack>` prints each situation's content hash for a sign-off; `npm run pack:release-check -- <pack>` runs the ship rule | `packages/cli/src/pack.ts` |
| Testbed examples: six situations (a chain of two decisions with a delegated default, several options at once and a waiting option; a gated decision with a `watched` option that expires with a later law; three gated notices including an atrocity-class event) and a fictional register | `packs/testbed/situations/`, `packs/testbed/gate/`, `packs/testbed/strings/en.json` |
| The seats runner loads a v2 pack's validated situations, so CI's determinism run exercises them | `packages/cli/src/seats-run.ts` |

## How a situation runs

1. **Fire.** Each day, in id order, a situation that has not fired fires when its chain allows it and its event condition holds in State. A decision opens with the options open now; a notice applies its effects at once.
2. **Surface.** A decision reaches the deciding seat when its knowledge condition holds over that seat's knowledge (0052), counting only reports received since it fired (so news he already held never surfaces it), or the same day if it has none. A notice goes out as a report from its author post through the ordinary report path, and surfaces when that report arrives (F1). The staff line is written then: an `advice` report of the `requested` subtype, from the first author post that is filled by a holder who is not a subject, through the ordinary report path (so it has an author, a route and a delay). If none is available, the record says so (`sitStaffAuthor: null`): "no staff line" is itself information (catalogue P5).
3. **Live.** While open, options appear and expire daily, judged over what the principal knows, never State (the lead's ruling on review S10); a change ends the turn (`situation-options`); clock thresholds in `resurfaceOn` end it once each (`situation-resurfaced`); once every option has expired (an option still to appear keeps it open), the inaction outcome applies (`situation-lapsed`).
4. **Decide.** The principal sends `decide` (options, at most one per group; none means ignore, which applies `inaction`) or `delegate`. A delegate decides from the same options (gate B7), scored by how far each honours his values. A waiting option applies its locked costs and defers; when its condition holds over news received since the wait began, the situation reopens without every option already taken.
5. **Orders.** Every order an option issues goes out in the principal's name, through `issueOrder`, the same validated path as his own orders, by the route the option names (one a principal may order by). A refused order is reported with `entry: -1`. A delegated choice moves the choice, never the authority (0052).
6. **History default.** Only for a principal whose seat is on the rules model, and only once the situation has surfaced and is not delegated, the kernel takes the historical default: its options once they are all open, its delegation, or inaction if unsourced. Nothing else reads the default.

Effects are either chain flags (applied by `situations`) or typed proposals to the module that owns the field (catalogue P13). No owner of those fields exists yet, so proposals are reported in the tick result and counted, not applied.

## The gate: which questions are tests, and which stay with readers

**Tests now** (`GATE_QUESTIONS_TESTED`; a test checks that each listed id is named by a test and is a real question; each has a positive control in `packages/pack-format/test/gate.test.ts` or the kernel's situation tests, and a sweep that disabled each of the 59 check sites in `gate.ts` and `situations.ts` in turn made a test fail every time; its first run found 18 sites without a precise control, now fixed, and one unreachable duplicate, now removed):

| Question | Check |
|---|---|
| A1 | a trigger match (whole words, case rules, proper-noun allowlist) in any string the item shows, in any locale, including effect reasons, or an effect on a protected field, needs a topic tag, or `none` with a reason and a sign-off |
| A2, A3, A4 | placement allowed by the register and matching the kind (a gated decision is placed `decision`, so B5 always runs); a held topic (`record`, or needs-source on the whole topic) admits only a cited text-only item with no effects or options; the item's earliest date inside its topic's window |
| A5, A6 | gated items cite sources that resolve; none banned, and not all weak |
| A7 | a sign-off by a reviewer who is not the author, recording the current version of every applicable question (string questions included), a note for every review-severity wording hit, and the content hash over the item (without the sign-off), the text of every string it shows in every locale and every source row it cites |
| A8 | the ship rule, as a release check (`pack:release-check`): `release.json` and `reviewers.json` exist; every shipped scenario has a window; no held topic's window overlaps one; every sign-off is by a listed reviewer, never a fixture |
| B1, B2 | the fields each kind needs; a cause in State, or a labelled railroad (B2 evaluates the cause over an empty State: a cause that holds on nothing is a date in disguise) |
| B3 | no effect targets a protected field; refused signatures from the register over effect fields, option ids, option labels in every locale and issued orders |
| B4, D4 | no option, and no decision, carries an atrocity-class topic; an option's own tag adds to the situation's |
| B5 | every option of a gated decision carries locked costs (which have no condition by construction), and nothing cancels one: not the same option, not an option that can be taken with it, not another item conditioned on the decision or on the situation firing |
| B10 | an option the register lists as superseded expires when the principal knows of the law's situation |
| C1 | proposers named (schema) and resolving to people |
| C2 | across gated decisions with three or more options, no display position holds the default in more than half (counted from three such decisions: below that, a position always holds half) |
| C3/F6, C4/F5, F2 | anachronisms by earliest date; forbidden wording by scope (label, narrator, any) and severity (fail, or review as a warning the reviewer must note); the proximity rule (a resource word within N words of a protected-group term) |
| D5 | no item conditioned on atrocity-class conduct (its flags, its firing) helps the side that acted |
| E7 | atrocity-class items name the acting side; every one of their effects names a side, and none raises the acting side's measures |
| F1 | a notice has an author and a route: it is a report through the ordinary path |
| B7 | a delegate decides from the principal's option set (kernel situation tests) |
| B9 | an architecture test: the view layer's import closure cannot reach `situations/`; and a differential: four worlds differing only in the default give byte-identical views and requests to every seat (`packages/kernel/test/situations.test.ts`, `boundary.test.ts`) |
| H5 | the published situation schema has no virtue, morality or karma field |

**Stay with readers:** Q1–Q12 (the reviewer checklist), recorded in each sign-off's question versions.

**In part** (`GATE_QUESTIONS_PARTIAL`): D3 (a protected target is refused; feeding a spendable resource from one needs the derivation graph) and E3 (agency reasons on situation effects must be listed for a named agency-class topic; derived terms come later).

**Wait for an artefact type that does not exist yet:** D1, D2 (levers: standing orders through a holder, seat initiatives); D6 (the lever sweep needs a victory measure and a victory-only bot, Phase 1); E1, E2, E4, E5 (derived-term declarations); F3, F4, F7 (quotations, disputed ranges, voice); G1–G5 (setup options, scenario omissions); H1–H4 (verdicts). Each becomes a test when its artefact is built; the checklist file already carries their versions.

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
11. **The content hash** is over the item without its sign-off, plus resolved strings in every locale and cited source rows (section 5), using the kernel's canonical hash. Editing a reviewer's name changes nothing; editing a word, in any translation, voids the sign-off. Every locale is scanned too.
12. **Fixture sign-offs are allowed in a draft pack and refused at release.** The testbed's gated examples must load (they are outside `drafts/`), but no gate reviewer has read them; their reviewer is `fixture-signoff`, and the release check names every such sign-off as a ship-blocker. *Rejected:* a real reviewer's name on unreviewed items (false); putting the examples in `drafts/` (nothing would exercise the loader rule).
13. **The ship rule needs scenario windows**, which v2 scenarios do not carry (only a start date), so `gate/release.json` lists the scenarios a release ships with their windows. *Rejected:* an end date on the scenario header (a lane 0.2 format change for a release concern).
14. **C2 counts from three gated decisions.** With fewer, one position always holds at least half, so the rule as written would fail any pack with one gated decision.
15. **Gate tags carry the acting side** (`actingSide`) for the sign rule (E7), since a notice about the other side's conduct is decided or read by this side's principal.
16. **An option's appear, expire and wait conditions, and the situation's knowledge trigger, read what the principal knows, never State** (the lead's ruling on gate review S10; standing review S2). The validator and the kernel guard refuse `flag`, `fired`, `goal`, `headquartersAt` and another side's `decided` there; the truth may fire a situation, but never changes what a president is offered. *Rejected:* conditions over State (an option vanishing tells the player a fact no report brought).
17. **A notice is a report** with an author post, a type and a subtype, and surfaces when it arrives (review S10, F1). *Rejected:* notice text shown at once with no author (no route, no delay, no bias).
18. **B2 evaluates the cause instead of parsing it**: a cause that holds over an empty State is a date in disguise and needs a railroad label (review S6). *Rejected:* a syntactic date-only test (`any` of a date and a flag passed it).
19. **A review-severity wording hit needs a note in the sign-off** (`gateReview.notes["key|pattern"]`), so the reviewer's reading is on record (review S8). *Rejected:* warnings anyone can scroll past.
20. **A release accepts sign-offs only from listed reviewers** (`gate/reviewers.json`, review N2). Reviewer ≠ author stops self-review, not an unqualified reviewer. *Rejected:* trusting any name that differs from the author's.
21. **A knowledge trigger counts only news received since the event** (standing review S1); a wait counts only news since it began. Option conditions count everything he holds, so a law he already knows still expires an option. *Rejected:* a day bound on every `knows` (B10 would miss a known law).
22. **Every post a situation names is its own side's** (standing review S6; 0050), checked by the validator and the kernel's guard, so the enemy never decides, advises, reports or is ordered. *Rejected:* a side check in `delegateCommand` alone (unreachable once the guard holds, so it could have no control).

## Gate review fixes folded in

The gate reviewer approved after fixes. Each landed as its own commit with a positive control, before the rebase: S1 (placement matches the kind), S2 (reason text is scanned, required and hashed), S3 (an option's tag adds to the situation's), S4 (B5 over co-selectable options and other items), S5 (D5, and every atrocity-class effect names a side), S6 (B2 evaluates), S7 (the ship rule fails without release windows), S8 (string questions and review notes in the sign-off), S9 (F2 over phrases, inflections and the whole table), S10 (notices are reports; option conditions follow what the principal knows), S11 (the tested list is true and checked); then the nits (refused labels and orders, accepted reviewers, E3 in part, every locale, `fenfolk-population`) and fen_crossing's wording (`send_back` now names who takes them back). The fen folk's own response as a cost of `send_back` waits for a derived term; `harbour_burning` stays a fixture.

## Standing review fixes folded in

The standing reviewer approved after fixes, each landing as its own commit with a positive control: S1 (a knowledge trigger counts only news since the event), S2 (the knowledge trigger reads only what the principal can know, in the validator and the kernel guard), S3 (no lapse before an option has appeared), S5 (an option's own tag gates the item), S6 (every post a situation names is its side's), N1 (B9 as a differential), N3 (reopening excludes every option taken), N5 (P7 is carried in part). S4 was already closed by the gate review's S6 (B2 evaluates), with the reviewer's probe as a control. Left to others: N2 (E7 and benefit through the other side) is the gate reviewer's ruling; N4 (the staff line carries no author bias) is filed in OPEN_QUESTIONS for the people model.

## For later lanes

- **0.5:** an option's orders go through `issueOrder`; corps commanders ordering subordinates stays deferred (0052). The conditions `goal` and `headquartersAt` read the stand-ins and must move with them.
- **0.8:** the runner declares `TICK_MECHANICS` (the seats layer's and the situations phase's). In the 120-day testbed run six situations fire, one is delegated and decided by its holder, and one option issues an order; waiting, lapse, resurfacing and changing options fire only in the kernel tests, since the rule-driven principal takes defaults at once. Lane 0.8 sets their bands for a run that exercises them.
- **Phase 1:** owners for the proposals (politics, regions, forces); the lever sweep (D6) once a victory measure exists; derived-term declarations and verdict templates, which turn their gate questions into tests.
- **Authors of the March 1861 situations:** the schema fits the catalogue's pressures P1 (two triggers), P2 (waiting), P3 (several options), P4 (chains), P5 (ordered authors, no staff line), P7 in part (orders with routes, in the principal's name; going round the chain, since `bypass` is always false, and notices to an enemy official are not carried), P12 (decision and notice kinds), P13 (typed proposals) and P14 (an unsourced default). It does not yet carry P6 (Congress's chamber state and its ledger), P8 (`raisedBy` another seat's initiative), P10 (hidden terms of a promise), P11 (an outcome that requests a plan or report), P15 (options that buy knowledge) or P16 (inaction as a process); each needs its owner module first.

## Findings outside my scope

1. The register's protected fields, protected groups and refused signatures need content for the real pack, written by the gate reviewer from `SENSITIVE-HISTORY.md` section 3, with a research lane for the trigger and forbidden lists' sources.
2. `docs/design/FOUNDATION.md` section 10 should gain the `situationFlags` row (chain and wait state) beside `situationStates`, and the tick's phase 3b.
3. The seats runner now gives every pack's comms World a `situations` field (empty for M2 packs), which changed the union-1861 seats run's world hash; it is not compared against anything stored.
