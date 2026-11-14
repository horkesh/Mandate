# 0044: Engineering foundations: the state hash, saves, one writer per field, and determinism declared per package

Status: accepted (2026-11-14). From Phase 0 lane 0.1 (`notes/lane-0.1-foundations.md`) and its separate reviewer (two passes; approved after fixes). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0002 and carries out FOUNDATION sections 10–11 and 0035's engineering rules.

## Decision

**Toolchain.** TypeScript 7.0.2, Vitest 5.1.0 (with Vite 8.3.8), tsx and @types/node are pinned to exact versions, and a test fails on any version range for an external dependency. CI runs on pinned images (`ubuntu-24.04`, `windows-2025`); moving to a new image is a commit of its own. Upgrades are deliberate (0035).

**The state hash** is SHA-256 over canonical JSON, implemented in the kernel and checked against the FIPS test vectors and `node:crypto`.
- Canonical JSON accepts only integers, strings, booleans, null, plain objects and dense arrays. It rejects floats, NaN, undefined, Maps, Sets, class instances, cycles, sparse arrays, non-enumerable properties, non-index array properties and accessors. It writes -0 as 0, sorts keys by code unit, and names the path of any rejected value.
- Text is not Unicode-normalised: ids are ASCII by grammar, and the pack validator (lane 0.2) requires NFC in pack text.
- In CI and determinism runs the tick hashes every day; Monte Carlo runs may hash only at checkpoints, since a hash costs about 300 ms on a 5 MB state.

**Saves.** A versioned envelope carries world, state and command-log hashes (the log is empty until lane 0.6), verifies them before migrating, and has a migrations registry. A fixture pins schema 1's bytes. Until lane 0.6 or 0.8 adds a fixture that is a real mid-run save, a change to the shape of State is not caught in saves.

**One writer per field (hard rule 5)** is enforced by a source scan keyed by property name, not by type.
- So **owned field names are unique across all State records**: prefix them (`divisionStrength`, not `strength`).
- Every record named `State` or `...State`, and every record reachable from the root `State`, must list each property as owned (with its writer) or immutable. Lanes 0.4–0.7 add an entry for every field they build; the test forces it.
- The scan catches direct, index, non-null-asserted and destructuring writes and mutator calls. Writes through an alias (`const c = state.control; c.push(x)`) remain a known gap.
- Revisit when TypeScript 7 offers a stable compiler API. A test-time deep freeze of State outside its writer is a candidate backstop for lane 0.6.

**Determinism (0002) is declared per package** (`"mandate": { "deterministic": true | false, "reason": ... }` in `package.json`); an undeclared package fails the check. In a deterministic package:
- imports must stay inside its own `src` or name another deterministic workspace package, so no npm package, `node:` module, test helper or the CLI comes in unscanned;
- every file under `src` is TypeScript;
- `Math` is allowed member by member (trunc, abs, min, max, sign, imul, floor, ceil);
- `eval`, `Function(`, `Reflect.` and `Object.assign` are banned;
- module-level `let`, `var` and mutable collections are banned, and module-level objects and arrays must be readonly, `as const` or frozen.
The scans share one lexer that understands strings, templates, comments and regex literals and fails closed when it loses its place.

**Liveness.** Telemetry is passed into the tick explicitly, never held as module state. While M2 lives, its mechanics may carry `minFires: 0`; lane 0.8 gives every Phase 0 mechanic `minFires` of at least 1 in the Union 1861 reference run, and only a named, shrinking list of M2 mechanics may stay at 0.

**Files.** The CLI writes to disk only through `packages/cli/src/io/` (atomic writes); run output goes only into its own folder under `runs/`.

**Licences.** Every `package-lock.json` outside `node_modules` is checked against an allow-list (MIT, ISC, Apache-2.0, BSD-2 and 3, 0BSD, BlueOak, CC0, Unlicense, Zlib; MPL-2.0 for development dependencies only). Prototypes stay outside the npm workspaces.

Rejected:
- **A 64-bit non-cryptographic hash** (no standard vectors, weaker against accidental collisions); `node:crypto` in the kernel (banned, and absent in browsers); hashing compressed bytes (0035).
- **TypeScript 7's unstable compiler API, a second TypeScript 5 install, or runtime proxies** for the one-writer check (unstable, two compilers to keep in step, or coverage only of exercised paths).
- **A hard-coded list of deterministic packages** (a new package would be skipped silently).
- **Banning regex literals instead of lexing them** (enforcing the ban needs the same detection).

## Consequences

- Lanes 0.2–0.8 build on these modules: typed ids (`packages/kernel/src/ids.ts`), `serialize/`, `telemetry.ts` and `ownership.ts`.
- The M2 legacy exemptions (`GameState`, the `ids` namespace, the `minFires: 0` list) shrink as Phase 0 replaces M2, and the tests fail if they don't.
