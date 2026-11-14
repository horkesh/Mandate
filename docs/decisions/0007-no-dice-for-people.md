# 0007: No dice for people

Status: accepted (2026-11-14); clarified by 0015 (seat responses) and 0020 (stats drawn at setup). Erratum: the context below counts Grand Tactician's feuds as obedience rolls; the games survey found its manual derives feuds from fame and initiative gaps, with no dice, in battles only.

## Context

Players resent obedience rolls (AGEOD activation checks, Grand Tactician feuds). AWWV had no RNG at all and found that this made replay and bisection trivial. The risk is that a fully deterministic proxy can be "solved".

## Decision

- Every decision a person makes (compliance, reports, ladder moves, bloc and patron responses) is a deterministic function of state. People never draw from an RNG stream.
- Seeded streams (0002) are used only for exogenous noise: battle variance, weather, accidents.
- The answer to "solvability" is epistemic, not random. The player never sees a proxy's true state, only claims (P4) and declared responses (0008).

## Consequences

- `banned-apis.test.ts` can later forbid RNG imports in people modules once the kernel is split into modules.
- Every surprise a proxy springs must be traceable to state the player could in principle have discovered.
