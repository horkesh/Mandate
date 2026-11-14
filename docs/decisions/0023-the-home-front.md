# 0023: The home front: a light economy through people, elections, and history as situations

Status: accepted (2026-11-14). The owner chose a HoI-light economy run through people, "losing the 1864 election ends the game, you play as Lincoln", and history as pressure. Amended by 0026 (the ending is a verdict, not a historical claim) and 0028 (victory by two national wills). Design: `docs/design/FOUNDATION.md` section 7.

## Context

The owner likes state-building (Imperator) and divergent history (Europa Universalis), but the war is the core. AWWV found nine required events without defaults just before its release-qualifying runs, so unattended history runs could not play.

## Decision

- **Economy:** money, men, munitions and rail capacity. Each lever has a holder who can stall (treasury, governors, the War Department). The player sets priorities and picks people.
- **Elections:** the 1862 midterms and the 1864 presidential election are checkpoints. Losing 1864 ends the game with a negotiated peace.
- **Situations:** historical pressures arrive when their causes are present, not on dates (P15). Each is pack data with a cause predicate, options, consequences, a **historical default** and a **staff recommendation**; a test enforces both fields.
- **Foreign powers** (Britain, France) are pressure clocks worked through the Secretary of State's seat, not playable factions.
- **Border states** are contested regions whose governors and legislatures are seats.
- **The press:** a weekly front page of what the public believes; generals and the player can leak.

Rejected: a deep, Victoria-style economy (a second game); a minimal one (no state-building); scripted dated events (choices bend the war too little); a pure sandbox (stops feeling like the Civil War); elections that only weaken the player (politics becomes a penalty, not a threat).

## Consequences

- History runs (every seat on rules, historical defaults) double as the calibration harness.
- Situations touching slavery and emancipation are written under the sensitive-history gate (0021).
