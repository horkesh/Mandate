# Lessons

These are recurring mistakes and their fixes. A written lesson is the weakest fix. Prefer, in order: a test, a hook, an agent rule, and only then a lesson. Every entry names what enforces it.

## Inherited from AWWV and Starfleet Career

**L1. The premise must be structural, not a mode.**
AWWV kept manual unit control and had to force "president mode" later.
Enforced by: decision 0001. There is no command path from the player to units.

**L2. Two stores tracking one truth will diverge.**
Enforced by: CLAUDE.md hard rule 5. Add an architecture test once state has more than one module.

**L3. Derived data computed before a mutation step is stale after it.**
Enforced by: derived data is recomputed, never saved. The pipeline will name each step's reads and writes (M1).

**L4. A value that reads correctly can mean something else.**
AWWV's garrison tag covered 180 of 184 brigades, and a diff reported "zero differences" over an empty set.
Enforced by: tests must assert non-empty inputs before asserting on outputs.

**L5. Calibration can eat the project.**
Enforced by: no cell-level historical fitting as an acceptance gate (P13). Calibration targets are stated as Monte Carlo percentiles.

**L6. A brain that is built but not wired stays dark.**
AWWV's bot scorer was bypassed for months.
Enforced by: every mechanism has a headless test proving it changes an outcome.

**L7. Docs drift.**
Starfleet Career's CLAUDE.md still says "no engine code yet".
Enforced by: the CLAUDE.md "Phase" line is updated in the same change that moves a milestone.

**L8. Background agents can hang silently.**
Enforced by: give agents small batches and a budget, and have them write results to disk as they go.
