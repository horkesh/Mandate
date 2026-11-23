# 0115: The tick budget is measured on its own

Status: accepted (2026-11-23). The ruling 0106 item 5 reserved for the lead, made with the profile in hand. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0106. Clarified by 0117 (the budget binds on Linux; Windows reports it).

## Context

- **The two Linux measurements now disagree by a wide margin.** CI measures the tick budget twice on Linux:
  - **in the suite:** the timing test in `done-check.test.ts` runs while the test suite's other workers share the machine;
  - **on its own:** the done check's budget criterion runs in its own step, as one process.
- **The same code reads very differently in each:**

  | Commit | In the suite (war / history) | On its own (war / history) |
  |---|---|---|
  | `e2b98c81` | 44.2 / 47.0 ms | 31.37 / 32.41 ms |
  | `0e7078cb` | 54.6 / 46.7 ms | 33.83 / 32.58 ms |
  | `2ff6e9d8` | over 40 / 40.5 ms | 25.33 / 24.88 ms |

- **The in-suite reading moves with the load, not the code.**
  - Main's code from before the sprint failed it at 40.6 and 41.6 ms in one run (`809b9629`) and passed in another (`6f4fa743`), unchanged.
  - The test suite has grown from 1,956 to 2,172 tests, so more work shares the machine while the timed test runs.
- **0106's aim was different.** It wanted CI's Linux measure of the tick under 40 ms with no change in behaviour. S85's four optimisations did that, and the done check on its own now reads about 25 ms.

## Decision

1. **The budget is unchanged:** a median of 40 ms a day, and a 95th percentile of 160 ms, with the planner, people and situations running.
2. **The binding measurement is the tick measured on its own.** It is the done check's budget criterion as CI runs it, in its own step, as one process with no parallel tests.
3. **The in-suite timing test runs alone.** CI runs it in a step of its own, after the parallel suite, with no other test file running. Its assertion and its budget don't change. The parallel suite runs without `MANDATE_TIMING`, and CI still checks that no timing test is skipped in the timing step.
4. **The local pre-commit hook is unchanged.** It already skips the wall-clock tests.

Rejected:
- **Raising the budget.** The tick fits it when measured honestly.
- **Deleting or loosening the in-suite test.** It still guards the budget once it runs alone.
- **Keeping the measurement under contention as binding.** It measures the runner's load and the size of the suite, not the tick.
- **Cutting the suite's workers for every test.** That slows the whole suite to protect one measurement.

## Consequences

- **The workflow.** A request changes `.github/workflows/ci.yml` on `sprint/july`, the integration branch, and the change reaches main with that branch after review. It adds the separate timing step, keeps the summary table's timing row, and checks that the step ran.
- **Main.** Main's in-suite failures from before the sprint are explained here, and are not a regression in its code.
