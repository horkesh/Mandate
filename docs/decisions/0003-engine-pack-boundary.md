# 0003: Settings are packs; engine code names no setting

Status: accepted (2026-11-13)

## Context

The engine must fit Rome, the US Civil War and Russia–Ukraine. AWWV hard-coded its factions as types (`Record<FactionId, …>`), so its generic mechanisms could not be lifted out. Starfleet Career (its decision 0007) kept every setting name in swappable packs and enforced that with a term-list validator, which proved cheap and effective.

## Decision

- People, posts, blocs, patrons, places, values, reason labels, verb names and all text live in `packs/<pack-id>/`. Engine code works with ids and generic concepts only.
- Values (what people care about) are pack-defined ids. The engine knows only that a person holds some values and that a directive honours or offends some.
- Asymmetry between factions lives in data tables. The engine never branches on a faction or setting (AWWV's "no `if faction ==`").
- `tools/check-pack-boundary.mjs` fails if a term from `tools/pack-terms.txt` appears in `packages/*/src`, `test` or `demo`. Add terms whenever a new pack introduces names.
- **The three-setting test:** a mechanism belongs in the engine only if it makes sense in all three reference wars. Otherwise it is pack data or a pack rule.

## Consequences

- Tests and demos use invented, setting-free names.
- The first slice (0004) is built as a pack from day one, even though it is the only one.
- A term list cannot catch designs or art that imitate a setting. Review still has to catch those.
