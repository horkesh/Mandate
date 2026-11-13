# 0011: Single-player, with knowledge scoped per faction

Status: accepted (2026-11-14). The owner takes recommendations by default.

## Context

Multiplayer changes how hidden information has to be stored. The claim model (P4) is designed in M1, so the question has to be settled before then.

## Decision

- Mandate is a single-player product.
- All knowledge is still **scoped per faction** (and later per person): claims, beliefs and declared responses are stored as "what faction X has been told". They are never stored as a single "player view". Opponents run on the same machinery (0009), so the bot principal needs exactly this anyway.
- Hot-seat or networked play is not designed for, but this decision does not rule it out.

Rejected: designing for multiplayer now (too costly before the core loop is proven); a single global "player view" (it would break bot principals and rule out multiplayer).

## Consequences

- The view a principal gets is a function `viewFor(state, factionId)`. The UI renders only that view.
