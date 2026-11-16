# Lane 1.5b: the map from orders to values, wired into play

Lane 1.5b carries out the gate reviewer's items on lane 1.5 (`review-gate-1861.md`, "Gate read: lane 1.5"), which must land before lane 1.11 enters any `fugitive-policy` row. It also fixes lane 1.5's finding on the edit path. The branch is `phase1-gate-wiring`, cut from origin/main at 8d22da3.

`npm run check` passes (1153 tests), and so does `npm run run:done-check` (six of six). No liveness band moved.

## What is built

**G-1.5a: a chosen policy applies its row's pushback through the owners** (`tick/policy.ts`, called from `applyDecision`).
- A situation option gains `policy: { row, carriedBy } | null`. `row` is a `policy:` row of the map; `carriedBy` lists the posts whose holders carry it out, and may be empty.
- Choosing it reads `pushbackOf`, now the one reader of the map's pushback, so the floor and the side-wide count bite in play.
  - **Stakeholders** (`people`): each person on the side who holds an offended value gets a `policy_offended` grievance against the principal, weighted by his term, with the row as its cause.
  - **Carriers** (`proxy`): each carrier answers the row through his own compliance, practice clashes included. `proxy` records the answer under `m.<day>.policy.<situation>.<option>`.
  - The mechanic `situations.policy` is QUIET in the liveness gate, driven by `gate-wiring.test.ts`.
- **Validator** (`policyRows` in `situation-layer.ts`):
  - an option tagged with a topic the map gates (any topic a row names) must name its row, and the row must carry the topic;
  - an option that names a row must honour exactly the row's values, so the map and a delegate's choice cannot diverge;
  - the row and the carrying posts must exist.

  The check is generic: no topic id is written in `packages/` (hard rule 3). `fugitive-policy` bites because the Union rows will name it.

**G-1.5b: a floored result explains itself.** `PushbackTerm` is now a typed union with four sources:
- `values`: a person holds a value the order offends;
- `recipient`: a carrier's unwillingness, apart from any practice clash;
- `practice`: a carrier's clash with a practice of his own;
- `floor`: `{ order, amount }`, the difference to the row named in `notCheaperThan`.

The terms always sum to the total.

In play, the floor's difference is shared among the floor row's own stakeholders in proportion to their pushback, as whole numbers (the remainder goes to the first by id). Each share is a grievance whose cause is `floor:<row>`. `pushbackOf` now takes a list of recipients.

**G-1.5c: validator checks** (`policyRows`):
- every `gateTopics` id is a register topic, and a pack with gated rows but no register is refused;
- an option the register supersedes, or marks `watched`, whose row is gated, must name `notCheaperThan`, and the floor must carry the same topics.

**G-1.5d: the cost-only test on the Union pack** (`packs/union-1861/test/cost-only.test.ts`).
- It reads the pack's vocabulary, asserts that both 0074 values are flagged, and loops over every flagged value.
- An inquiry that honours the value is carried through its arrival and two weekly steps. It is compared with the same inquiry honouring nothing: willingness, reasons, regard, standing and the faded grievance are identical.
- The control: the same value unflagged does raise willingness.

**G-1.5e: the pinned sign-off of gated rows** (`gatedRowProblems` and `gatedRowHash` in `gate.ts`; the table is in `packs/union-1861/test/gated-rows.test.ts`).
- Every gated row must have an entry with its content hash and its reviewer. Any edit fails until the reviewer signs the new hash.
- An entry for a row that no longer exists, or that is no longer gated, fails.
- A fixture's sign-off fails, and so does a reviewer missing from `gate/reviewers.json` when the pack has one.
- The table is empty today, because no row is gated.

**The practice-clash term** (mechanism only; the data is lane 1.11's).
- A person gains `practices` (a world-format column, `practice:citation+citation`), each cited.
- A row gains `clashes`, the practice ids the order runs against.
- `rules.people.verbs.practiceWeight` is 200, stated by both packs and equal to one offended value.
- In compliance, a clash is a typed contribution `practice` with a `practice_clash` reason. In the pushback it is its own term, and the recipient term counts only the unwillingness apart from it, so nothing is counted twice.
- The validator refuses a practice that no row clashes with (it could never bite), one listed twice, or one without an admissible citation.

**The lever sweep's delegation** (`packages/cli/src/lever-moves.ts`, `sweepMoves`).
- The sweep itself waits for a victory measure (lanes 1.12 and 1.14). This is the function it reads moves through.
- Each open option, each delegation and inaction becomes a move, resolved to the options it takes. A delegation takes exactly what the holder's rule seat would pick (`chooseDelegated` over `situationChoice`), so a delegation that reaches a watched option is a watched move.

**The edit path** (lane 1.5's finding). `answerEdit` passes `available: PLAN_HOLDS` (500), the scale `editDirective` puts `required` on. `PLAN_HOLDS` now lives in `planner/edits.ts`, and the audience re-exports it. An edit to a plan that needs more men than it commits now states `lacks_resources`; `gate-wiring.test.ts` shows it on a real edit.

**Verbs read at the oversight where he stands** (the lead's ruling, after lane 1.4 merged). A verb is an order to a person, so every place a verb is answered now passes lane 1.4's `oversightOf(...)`:
- each couriered verb on its arrival (`arriveVerb`);
- the audience (`previewAudience` takes it as an argument, and its callers outside the tick fall back to the base);
- a policy's carriers, both in their recorded answer and in `pushbackOf`'s recipient terms (`readAt`).

The observer's and pressure's `watched` terms still stack on top as their own terms. `gate-wiring.test.ts` shows a distant man's answer to an inquiry read at his distance-reduced oversight, not the base, with the observer's term still present.

Seat initiatives are not orders, so they stay at the base oversight. An edit's answer passes both the plan's holding and the oversight.

**The content hash.** `gateContentHash` leaves out an option's `policy` when it is null. Items signed before the field existed keep their hashes, and naming a row voids the sign-off.

## Decisions taken, with the alternatives rejected

1. **Policy carriers are named on the option.** Rejected: inferring them from the option's orders, because a policy option issues no orders.
2. **The floor's difference falls on the floor row's own stakeholders.** Rejected:
   - charging it all to the carrier, since the floor is a cost to the side, not to one man;
   - leaving it unapplied, since then the floor would not bite in play.
3. **A practice is pack data on the person, validated against the rows' `clashes`.** Rejected:
   - a practice vocabulary table, because the rows already name every practice that can bite;
   - coding conduct as a value, which 0074 forbids ("a value is coded only on the holder's own motive").
4. **The gated-topic rule is generic** (any topic a row names). Rejected: naming `fugitive-policy` in `packages/` (hard rule 3).
5. **The lever-sweep moves live in `cli`,** beside the rule seats whose pick a delegation is.

These are design decisions inside the brief, recorded here. If the lead wants any of them as a decision record, they can be lifted as they stand.

## For lane 1.11 (S17)

To author the first fugitive-policy rows:
1. Give each option of a `fugitive-policy` situation a `policy: { row, carriedBy }`, with `honours` equal to the row's.
2. Tag every such row `fugitive-policy`. The `watched` row (`return`) names a floor (`notCheaperThan`) that is also tagged.
3. Put Butler-style resistance in the person table's `practices` column, cited, and in the return row's `clashes`.
4. Have the gate reviewer sign each row's hash in `gated-rows.test.ts` (`SIGNED`). The test prints the hash to sign.

## Not done

- **0074's rule** that the sweep reads an atrocity-order decision's inaction as if it were watched is the sweep's own lane. `sweepMoves` marks inaction as unwatched.
- **Options taken together** (groups) are offered one at a time.
- **A practice does not change in play,** because it is static pack data.
