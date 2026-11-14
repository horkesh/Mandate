# 0002: TypeScript kernel, pure and deterministic

Status: accepted (2026-11-13; owner chose TypeScript over C#/.NET + Godot). Clarified by 0044 (determinism declared per package; import and Math allow-lists).

## Context

AWWV is TypeScript/React/Electron. Starfleet Career is C#/.NET + Godot. Mandate's presentation is a leader's desk: dispatches, audiences, org charts, and later a 2D map. That is web UI territory. Some AWWV logic (event system, serializer and migrations, the directive chain) can be ported directly. AWWV also showed the risk: V8 differences in `Math.pow`/`exp` could flip outcomes between Node versions.

## Decision

- `packages/kernel` is pure TypeScript. It has no DOM, no Node APIs, no I/O, no clock and no global randomness. It runs identically under Node and in a browser.
- **All simulation math is integer.** Scores use the permille scale (0..1000, or signed ±1000). There are no floats in state. There is one rounding rule: truncate toward zero (`Math.trunc`). Transcendental `Math` functions are banned in the kernel.
- Randomness comes only from **named seeded streams**: one stream per purpose, seeded from the save seed and the stream name (the Starfleet Career pattern). People's decisions are caused by state, not dice. Dice are reserved for exogenous noise such as weather and battle variance.
- Ordered iteration uses `strictCompare` (code-unit order), never `localeCompare` or insertion order.
- These rules are enforced by `packages/kernel/test/banned-apis.test.ts`, not by prose alone.
- Node 22 LTS (`.nvmrc`), Vitest, npm workspaces.

## Consequences

- A turn is a pure function: `(state, decisions) → (state, report)`. Replay and bisection are trivial.
- Headless Monte Carlo calibration runs from the same code as the game.
- UI packages (`desk`, and later `map`) depend on the kernel. The kernel never depends on them, and an architecture test will enforce this once they exist.
