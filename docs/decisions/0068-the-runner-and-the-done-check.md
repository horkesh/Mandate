# 0068: The headless runner, the liveness gate and the Phase 0 done check

Status: accepted (2026-11-15). Amends 0066. Amended by 0072 (the at-war Union run is a mechanics run, not a war; its bands are reset) and 0075 (the behaviour criterion accepts a contest or an occupation, with a control change). From Phase 0 lane 0.8 (`notes/lane-0.8-done-check.md`) and the standing reviewer's review and re-checks (`review-lane-0.8.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION sections 11 and 12.

## Decision

**One runner.**
- `phase0Run` carries the run and its three checks (replay, save, resume). Lane 0.6's `run:seats` is that run with a daily hash.
- It hashes at checkpoints by default and every day on request. The done check and CI hash every day.
- It writes only to `runs/`.

**Checkpoint scores are counts of named things the map derives:** regions held and traced, control shares, supplied regions, fronts, pockets, and men of known strength, with unknown blocks counted apart. Phase 0 has no victory measure, and Phase 1's history run replaces these with calibration targets.

**The liveness gate.**
- Every mechanic either fires in a reference run, inside a band of half to double its deterministic count, or is listed as quiet with its reason and the kernel test that drives it. The gate's own test checks that each named test exists.
- Exercise runs make a mechanic fire that the full runs leave quiet.
- Mechanics quiet by design until Phase 1 gives people values are banded at exactly zero, so the gate fails on purpose when values arrive (0058).

**The war gate.**
- The principal's menu carries `atWarSince`, and the rule seat opens its campaign the morning after its faction's war flag is set.
- `--at-war` (`SetupOptions.atWar`) is a labelled mechanics-run option that sets the pack's own flags at day 0 and shows in the run's summary and hash.
- The Union reference run is at war, and a peace run pins the gate.

**War decisions cannot be delegated** (amends 0066).
- Going to war is the principal's own act. A delegate's choice would put the war in the president's menu before the delegate's report reached him.
- The validator refuses a delegable situation whose option sets a war flag.

**The tick budget criterion** is a median of at most 40 ms a day, and a p95 of at most 160 ms, over requests, seats and the tick, with no hashing.
- If CI flakes on it, the p95 factor is widened. The criterion is never skipped.
- CI Linux gives a median of 6.6 ms for the Union day.

**The daily drafting cap starts at 3 drafts a day**, oldest request first, as a pack rule once the planner moves into the kernel (0062).
- One land draft costs about 9 ms, and an uncapped worst day (27 commands asking at once) about 170 ms.
- The cap is re-measured on CI hardware with the kernel planner before it is fixed.

**One test timeout, in one place:** 120 s for tests and 300 s for hooks, in `vitest.config.ts`.

**Workspace links are checked** (lesson L19). `tools/workspace-links.ts` fails when a `@mandate/*` package resolves outside the checkout under test.

Rejected:
- **A second runner beside the first.** A copy is a second owner.
- **A hash switch in State or the tick.** They must not know the cadence.
- **An invented score.** A number nothing explains (hard rule 6).
- **Exact-count bands.** Every unrelated change would move them.
- **A blanket "quiet" with no reason.** That is how a dead mechanic passes.
- **A boolean war flag.** A war beginning after day 1 would never open.
- **Writing State from the runner.** One writer per field.
- **Per-test timeouts.** They are scattered, and each new test would have to know.

## Consequences

- **The Phase 0 done check passes** on `union-1861` and the testbed, on Linux and Windows with matching hashes, and runs in CI. Phase 0 closes after an exit review lane reads the kernel against FOUNDATION and the decisions.
- **Phase 1 inherits these items, all in `docs/OPEN_QUESTIONS.md`:**
  - move the four zero bands when values arrive;
  - both sides' opening war decisions;
  - the history run's scores;
  - the planner's terms over edits;
  - the tick budget on CI hardware;
  - the Union war going static after its stand-in goals are reached.
