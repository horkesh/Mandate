# 0018: The American Civil War, 1861–65; the engine's promise is wars with fronts

Status: accepted (2026-11-14). The owner: "OK civil war it is", playing Lincoln, Union first. Supersedes 0004. Amended by 0028 (the campaign starts at the March 1861 inauguration). Design: `docs/design/FOUNDATION.md` section 3.

## Context

- 0004 made the Union 1861–62 the first slice of an engine meant to fit Rome, the Civil War and Ukraine.
- The owner then asked for HoI-style fronts and grand-strategy depth, and for Rome a cross between Imperator and Total War. Ancient war has no continuous fronts, and Total War's tactical battles are a second game.
- The owner's favourite Civil War games are AGEoD's.

## Decision

- Mandate's first game is the American Civil War, the whole war from 1861 to 1865. The player is Lincoln.
- The Union is built first; the Confederacy becomes playable later on the same machinery (0009).
- The engine's promise narrows from "every era" to **wars with fronts**. Packs stay the architecture (0003), so a later war is a new pack, not a new engine.
- Rome is a possible later game that would reuse the people layer but needs a different theatre. Tactical battles are out of scope.

Rejected: Ukraine 2022 (an ongoing war with living people); the WWII Eastern Front (HoI's home ground, and the obvious version is a minefield); WWI (little encirclement); keeping one engine for every era (two engines in one).

## Consequences

- Phase 0 proves the new kernel on 1861–62; the full war follows.
- `VISION.md`, `README.md` and the roadmap are updated to the narrowed promise.
- The living-people policy (0005) stays for any later contemporary pack.
