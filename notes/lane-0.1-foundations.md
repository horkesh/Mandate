# Lane 0.1 hand-over: engineering foundations

Branch `phase0-foundations` (worktree `.claude/worktrees/phase0-foundations-f5050e`), 6 commits on top of 9c55f21.

## Choices made, with the alternatives rejected (candidate content for a decision record)

1. **Toolchain pinned exactly**: typescript 7.0.2, vitest 5.1.0, vite 8.3.8 (Vitest 5's peer). Versions read with `npm view` on 2026-11-14. tsc 7 typechecks the repo unchanged and still reports a planted error. Rejected: caret ranges (0035 says lanes upgrade deliberately, never silently).
2. **State hash = SHA-256 over canonical JSON**, implemented in the kernel (`serialize/sha256.ts`), checked against FIPS vectors, a 1 MB vector and node:crypto on 200 random strings. Rejected: FNV/xxhash-style 64-bit (no standard vectors, weaker against accidental collisions); `node:crypto` (banned in the kernel, absent in browsers); hashing compressed bytes (0035).
3. **Canonical JSON** rejects floats, NaN, -0 is written 0, undefined anywhere, Maps/Sets/class instances, cycles, sparse arrays; errors name the path (`$.regions.r1.loyalty`).
4. **Save envelope v1** carries `log` and `logHash` now (empty for M2), so lane 0.6's command log needs no schema bump. Loading verifies hashes before migrating. A fixture test pins schema 1's exact bytes: if the saved shape changes, the test tells you to bump the schema and add a migration.
5. **One-writer check is a type-blind source scan keyed by property name**, so owned keys must be unique across all State records. Rejected: TypeScript 7's compiler API (only `unstable/*` exports over IPC to the Go binary); a second TypeScript 5 install just for the AST (two compilers to keep in step); runtime proxies (cover only exercised paths). Known gaps, documented in the scanner: writes through an aliased key, and `Object.assign` (banned instead).
6. **Every State record must be fully classified.** Any interface or object type named `...State` in any package's `src` must have each property in `OWNED_FIELDS` (owned) or `IMMUTABLE_STATE_KEYS` (`id`). This forces lanes 0.4-0.7 to fill in `code: [{ record, key }]` for each field they build. M2's `GameState` is the one legacy exemption; the test fails when it disappears so the list shrinks.
7. **Determinism is declared per package** (`"mandate": { "deterministic": true|false, "reason" }` in package.json). An undeclared package fails the test, so the rule-seat package cannot appear unscanned. Rejected: a hard-coded list in the test (a new package would be silently skipped).
8. **Licence allow-list**: MIT, ISC, Apache-2.0, BSD-2/3, 0BSD, BlueOak, CC0, Unlicense, Zlib; MPL-2.0 for dev dependencies only (12 lightningcss packages via vite). Reads the lockfile, so platform packages not installed locally are covered.

## For later lanes

- **Hashes are per turn on M2**, not per day: M2's `advance` runs several day ticks inside. The Phase 0 tick should call `canonicalHash(state)` each day; `headless.ts` and `tools/compare-runs.ts` take any list of `{turn, hash}`.
- **Telemetry**: `createTelemetry(declaredMechanics)`, `recordFire(t, name, change)`, `livenessReport`, `checkLiveness(report, bands)`. Pass a `Telemetry` into the tick explicitly; never module state. The M2 bridge (`packages/cli/src/m2-liveness.ts`) reads ledger kinds from outside and retires with M2.
- **Typed ids**: import from `packages/kernel/src/ids.ts` inside the kernel; outside it, the `ids` namespace (M2 still owns the names `RegionId` etc.). Add a kind to `ID_KINDS` when needed.
- **Writes to disk in the CLI** only through `packages/cli/src/io/` (a test fails otherwise); run output only through `createRunDir` / `writeRunFile`.
- **The health gate** (`packages/cli/test/health-gate.test.ts`) has bands for every M2 mechanic; 12 carry `minFires: 0` because the scripted leader never exercises them. Lane 0.8 replaces the reference run.
