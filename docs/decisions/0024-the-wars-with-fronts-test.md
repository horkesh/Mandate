# 0024: The engine test is "wars with fronts", not three settings

Status: accepted (2026-11-14). Follows from 0018, which narrowed the engine's promise; flagged by the foundation review. Amends 0003.

## Context

0003's three-setting test says a mechanism belongs in the engine only if it makes sense in Rome, the Civil War and Russia–Ukraine. Read literally after 0018, it would push fronts, railways and supply out of the engine, because ancient war has no continuous fronts.

## Decision

- **The engine test:** a mechanism belongs in the engine if it makes sense in any war with fronts and a political leadership: the Civil War, and a later gunpowder or industrial war (for example WWI or a fictional one). It must also work on the fictional testbed pack. Otherwise it is pack data or a pack rule.
- The rest of 0003 stands: setting names live only in packs, the engine never branches on a faction or setting, and `tools/check-pack-boundary.mjs` enforces the term list.
- The term list keeps its Rome and Ukraine entries, so those names still cannot leak into engine code.

Rejected: dropping the test (setting-specific rules would creep into the engine); keeping three settings (it contradicts 0018).

## Consequences

- The testbed pack gains a small region graph so engine tests stay setting-free.
