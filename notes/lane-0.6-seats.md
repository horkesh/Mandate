# Lane 0.6 hand-over: seats, knowledge and the command log

Branch `claude/phase0-seats-914b30` (worktree `.claude/worktrees/lucid-zhukovsky-5b7770`), on top of 426e88b. Built to FOUNDATION section 12, row 0.6, and its lane notes. The M2 kernel and all its tests still run unchanged.

## What is built, and where

- **State** (`packages/kernel/src/root-state.ts`): the first Phase 0 State, exported with the rest of the seats layer as the `phase0` namespace (M2 still owns `viewFor`, `Message`, `Post`). Root fields: `gameSeed`, `stateDay`, `seatAssignments`, `messagesInTransit`, `knowledgeBySeat`, `reportTruth`, and two stand-ins, `standingGoals` and `headquarters`.
- **Seats** (`seats/`): one seat per person (`seat:<person>`), driver rules/AI/human. A request is a `SeatView` plus a menu; an answer is `choose` or `commands`. Menus: a principal's (posts he may order, their relays, routes with typical days and prices) and a commander's standing-goal step (only options the kernel judges consistent with him; one consistent option means no request).
- **Messages in transit** (`messages/`): latency by route from the map, owned by the kernel. In person, wire, courier, special messenger (priced) and mail; rail and ship refuse with `route_unavailable` until lane 0.2's typed edges. Courier weather is a draw from a stream keyed by the message's own id.
- **Orders through chains** (`tick/orders.ts`): relay is a message per link; each relaying holder applies his own (stand-in) compliance and delay, forwards or objects with a memorandum. Bypass sends the order straight to the holder and proposes a grievance for each man bypassed. Conflicting orders: the holder keeps his chain's recent order against a bypassing one from a different issuer, and reports which he obeyed.
- **Reports** (`knowledge/report.ts`, `templates.ts`, `truth.ts`): typed, with author, subject, claims and confidences, stamp (day and hour), route and posts passed. Advice has a recommendation, stated reasons and a confidence, and a `memorandum` subtype (unsolicited) beside `requested`. The informal route is six sub-types: `cabinet-word`, `caller`, `governor-wire`, `legislator`, `navy-channel`, `railroad-man`, each with its own template. A filter post holds and cuts wires bound for the principal; what it cut, and every bias term, lives in the truth layer.
- **Knowledge** (`knowledge/knowledge.ts`): reports per seat, pruned daily by template age and supersession (template, author, subject, and the order answered). Truth kept only for reports some seat holds. In a 240-day reference game over 1,000 reports are delivered, while what any seat holds stays below 60 and never grows after the first quarter (the test's assertions).
- **Beliefs** (`knowledge/beliefs.ts`): derived on read. A man's enemy estimate is the latest claim he holds times his own perception bias. His dispatches are written from this belief and his menu reads it, so both inflate the enemy by the same amount (tested: 800 seen, x2.0 by the chief, x2.4 by a timid cautious general = 3,840 in his belief, his menu and his dispatch). The intelligence chief's bias is a separate term; a test shows a timid general and a bad chief giving the same figure with different terms.
- **The boundary** (`seat-api.ts`, `view/`): `viewFor(world, state, seat, cache)` with stable references through a caller-held cache, and frozen view objects. `@mandate/kernel/seat-api` is the only kernel entry for player-facing code; the kernel's `exports` map exposes only `.` and `./seat-api`.
- **The command log and replay** (`log/`): `LogEntry = { day, seat, command }`; `playDays` asks seats and logs every answer; `replay` never asks a seat. The save envelope's log and log hash are filled.
- **The tick** (`tick/`): morning menus, commands, deliveries (repeating for same-day hops), the stand-in standing-goal step, cyclic reports, pruning, the day. Returns rejections, events with terms, proposals, prices and decision points beside State.
- **Rule seats** (`packages/rule-seats`, deterministic, player-facing): a commander takes the highest-scored step; a principal opens with the army reached soonest and goes around an office that objected yesterday, by special messenger.
- **Runner and CI**: `npm run run:seats -- <pack> <days> [--resume-at d] [--show person]`. CI runs it on the testbed (180 days, resume from 60) on Linux and Windows; `compare-runs` matches on pack and kernel and flags a failed replay.

## Checks added, each with a positive control

| Check | File | Control |
|---|---|---|
| seat-api's import closure never reaches State, truth, traits, transit, the tick | `kernel/test/boundary.test.ts` | an in-memory closure that reaches root-state through view/types |
| player-facing code imports only its folder and `@mandate/kernel/seat-api` | same | a probe importing `State`, the kernel root, a relative climb, `node:fs` |
| M2's console is the only legacy exception, and the list shrinks | same | fails if a listed file disappears or stops importing M2 |
| replay reproduces every day's hash | `kernel/test/seats-log.test.ts`, `cli/test/seats-run.test.ts` | a changed log entry changes the hashes from its day on |
| the real mid-run save: its log replays to its State; resume reaches the continuous hash | `cli/test/seats-run.test.ts`, fixture `cli/test/fixtures/saves/testbed-seats-day40.json` | (the replay control above) |
| deep-freeze backstop: whole games run with State frozen after every phase | `kernel/test/seats-log.test.ts` | the same write through an alias succeeds on an unfrozen State |
| reading views never changes outcomes; one message's weather never shifts another's | same | (the comparison is the control: a different log does change hashes) |
| knowledge plateaus | same | |
| views carry no truth term, trait or transit field | same, and `seats-orders.test.ts` | |

## Choices, with the alternatives rejected (for a decision record)

1. **State is copy-on-write; records below the root are immutable values** (their keys in `IMMUTABLE_STATE_KEYS`). Every change goes through a root field and so through its one writer, and a writer returns a new State sharing unchanged records. This makes stable view references free (0035) and makes the deep-freeze backstop cost writers nothing. Rejected: in-place writers (the alias gap stays open and stable references need dirty flags); owning every nested key by name (dozens of owned keys for records nobody edits).
2. **The day counter is owned by `tick`**, whose layer moves from `infrastructure` to `writer`. Rejected: a new `clock` module (a module for one integer); keeping the day outside State (the per-day hash must cover it).
3. **Message ids are content keys** (`m.<day>.<from>.<to>.<what>`, with `.2` on a same-day repeat), not serials. One extra report never renumbers the others, so streams keyed by message id stay put (0041). Rejected: a serial counter in State (an unrelated report shifts every later id and draw).
4. **Weather on couriers is the only dice in the seats layer**, drawn from a stream keyed by the message, created on demand and never stored. People never draw (0007). Rejected: a shared sequential "comms" stream (any extra message shifts the rest).
5. **The truth layer is a separate State map** (`reportTruth`) and file (`knowledge/truth.ts`) the view layer cannot import, not a field the view strips. Rejected: a `truth` field on each held report (one forgotten projection leaks it, and an import test cannot see a field).
6. **Perception bias is applied by every reader in belief derivation**, the source's bias at authoring as a term on the report. A commander's dispatch therefore carries his inflated belief, and the principal applies his own perception on top (1000‰ for a steady man). Rejected: bias in the planner or the dispatch writer (two owners of one bias, finding 3).
7. **Seats answer menus of kernel-judged options; principals send commands the kernel validates.** One request type for rules, AI and human (0015). A single consistent option asks nobody. Rejected: asking every seat every day (logs fill with forced answers); letting seats build plans (0026).
8. **The seat interface is synchronous in the kernel loop (`playDays`)**; an AI seat's latency is the shell's business at turn boundaries (0027), and replay never asks. Rejected: async seats in the kernel (the kernel has no clock).
9. **The player-visible boundary is a package export** (`@mandate/kernel/seat-api`) checked by an import-closure test, and player-facing packages declare `"playerFacing": true`. Rejected: a naming convention alone; a hard-coded list of packages (a new one would be skipped, as 0044 found for determinism).
10. **Supersession key = template, author, subject and the order answered.** An acknowledgement is not superseded by the same man's routine dispatch. Rejected: template, author and subject only (acks vanished three days later; found on the testbed).
11. **The wire belongs to a side** (`wireOwner` per region). Rejected: a neutral wire (a commander off the wire rode into the enemy's capital to file his dispatch; found on the testbed).
12. **Save schema stays 1.** The envelope already carried the log (lane 0.1), and no save has been released. M2 and Phase 0 saves share schema 1 with opaque State, told apart by the world hash. Rejected: a schema 2 with a meaningless migration from M2's State.

## Stand-ins, all labelled in code

| Stand-in | Replaced by |
|---|---|
| `standin/world.ts`: the comms World (regions with link days and a wire owner, factions, posts with holder, superior, strength and intelligence chief, people with boldness, regard, values, intelligence bias) | lane 0.2's World; post holders and strengths become State in lane 0.5 |
| `standin/from-scenario.ts`: the comms World built from an M2 scenario (testbed, union-1861) | lane 0.2's pack loader |
| `standin/traits.ts`: perception bias, demand ratio, relay compliance, filter decision | the Phase 1 recast of `compliance` and `reading` |
| `plans/` standing goals (hold, or advance to a region) and the consistency judgement in `seats/requests.ts` | lane 0.9's planner and plan selection |
| `movement/headquarters.ts`: a post's headquarters moving one region per `marchDays`, no divisions | lane 0.5's forces and movement |
| observed enemy strength = stand-in post strengths at enemy headquarters | lane 0.5's force blocks |

## Deferred, deliberately

- **Going around the filter** (the principal reading the raw wires at an attention cost): Phase 1 verb.
- **Attention**: route prices are reported per tick (`prices`), never charged; no attention State yet.
- **Grievances from bypassing**: returned as typed proposals, counted, not applied (people core, Phase 1).
- **Report generators for press, observer letters, casualty returns, retrospective statements**: templates exist; their owners (press, combat, the reckoning) write them.
- **Hour stamps**: the field exists; battle-day dispatch generation comes with combat.
- **Seat initiative menus, AI seats with fallback**: interface only.
- **Decision points**: objection, objective reached and order conflict only.
- **Liveness**: in the reference fixture game four mechanics stay at zero by design (rejections, defaults, conflicts, trims), each with its own test; on the testbed more stay dead because it has no filter holder, no objecting office and no thin margins. Lane 0.8 sets bands on the Union 1861 reference run.

## For later lanes

- **0.2**: the World must satisfy `LatencyMap` (`messages/latency.ts`): courier days, days to a side's wire, a region's wire owner. Filter posts and intelligence chiefs are World data.
- **0.4**: the wire owner should follow control (250‰ is the supply threshold already chosen).
- **0.5**: delete `standin/` and `movement/headquarters.ts`; `enemyAt` in `tick/generate.ts` reads force blocks instead.
- **0.7**: a situation's knowledge condition reads `knowledgeOf(state, seat)` or the seat's view; the staff recommendation is an `advice` report with `requested` subtype; the informal sub-types are ready.
- **0.8**: `playDays` already hashes every day; `seats-run.ts` is the pattern for the Phase 0 runner.

## Findings outside my scope

1. FOUNDATION section 10's field-to-writer table should gain "the current day: `tick`" and the stand-in headquarters row, and the module map's `tick` row its writer role (`ownership.ts` already says so).
2. The copy-on-write and immutable-record convention (choice 1) binds lanes 0.4 and 0.5; it belongs in the decision record with 0044's naming rule.
3. `IMMUTABLE_STATE_KEYS` grows by every nested key (68 now, 67 of them this lane's). A per-record "immutable record" declaration in `ownership.ts` would be lighter; a candidate change to the one-writer scanner.
4. The union-1861 M2 pack also runs on the seats layer through the adapter (replay and resume match over 120 days); not added to CI, since lane 0.3 rebuilds that pack.
