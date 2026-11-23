# 0117: The tick budget binds on Linux; Windows reports it

Status: accepted (2026-11-23). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0115.

## Context

- **What CI runs.** CI runs the done check on both of its platforms. That keeps the Linux and Windows summaries for the determinism job, which compares their hashes. The done check always measures the tick budget, and the budget is a Phase 0 criterion, so it sets the done check's exit status.
- **The latest run** (`54395ef9`, run 45156403514):
  - Ubuntu passed everything, including 0115's separate timing step.
  - The Windows job failed only because its done check measured the war-by-decision median at 40.5 ms. Every other Phase 0 criterion passed there, and the hashes match Linux's.
- **Windows runners are slower.** On the same code they read 40 to 44 ms where Linux reads 25 to 34 ms.
- **The budget was always a Linux measure.**
  - 0099 item 13: "Linux CI separately checks that its required stopwatch tests ran and that no tests were skipped".
  - 0106 item 5: "CI's Linux measure".
  - CI's wall-clock tests run only on Ubuntu (`MANDATE_TIMING` is set only there).

## Decision

1. **The budget binds on Linux.** The binding measurement of 0115 is the Linux done check's budget criterion, measured on its own.
2. **Windows reports the budget, and it doesn't bind.** The done check gains an explicit option that reports the budget criterion with its numbers but leaves it out of the exit status. The Windows job uses it. Every other criterion binds on Windows as before, and the determinism job still compares the hashes.
3. **Local runs bind by default.** A local `npm run run:done-check` still binds the budget, as before. The option is CI's, for its slower Windows runner.

Rejected:
- **Raising the budget for Windows.** The budget is one number, and Linux is where it's measured.
- **Dropping the done check from the Windows job.** Its summaries feed the determinism job.
- **Optimising until a hosted Windows runner fits.** That tunes the code to one runner's speed, not to the budget's intent.

## Consequences

- **The build.** A request adds the option to the done-check CLI with a test, and uses it in `.github/workflows/ci.yml`'s Windows done-check step. The job summary still shows the Windows timing.
