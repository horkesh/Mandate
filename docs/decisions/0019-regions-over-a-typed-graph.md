# 0019: The map is regions over a typed graph; fronts and pockets are derived

Status: accepted (2026-11-14). The owner asked "Hexes? Something like AGEoD?"; the games survey and the AWWV-architecture note both recommend this model. Extends 0013 (how the map is drawn) with what the map is. Extended by 0031 (extent, size, sources). Design: `docs/design/FOUNDATION.md` section 4.

## Context

- Civil War fronts follow railways and rivers, and encirclement means cutting an army off from its supply line.
- The survey judged hexes poor at this (rail and rivers become decoration, and hexes invite pushing counters) and free movement poor for determinism and the general's-seat pull. AGEoD's regions fit but its 3,000+ regions are its commonest complaint, and its rail is a region property.
- AWWV derived adjacency from polygons and got phantom fronts and dropped links; it saved front sectors and paid for it.

## Decision

- **Regions**, irregular and drawn to terrain, numbering in the hundreds.
- **Typed edges** between regions (road, rail, river, sea), each with a length and a capacity, authored and validated, never derived from geometry.
- **Control** is a permille per faction per region. Supply and rail need at least 250‰ control; retreat is barred into regions under 50‰. Both start from AGEoD's values and are pack-tunable.
- **Fronts** (contact edges between opposing control) and **pockets** (friendly components with no supply path to a source) are pure functions of state, never saved. Divisions belong to commanders, never to fronts.
- **Supply** is a readable path with capacity from a source; rail capacity is allocated in priority order.
- Every geographic source carries provenance and licence data in its pack.

Rejected: hexes; free movement; AGEoD's thousands of regions; geometry-derived adjacency.

## Consequences

- 0013's staff map draws these regions and derived fronts from the player's knowledge.
- Derived indexes are recomputed only when control changes, to stay within the tick budget (0017).
