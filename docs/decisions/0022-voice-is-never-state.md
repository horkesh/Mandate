# 0022: AI text is voice, never state

Status: accepted (2026-11-14). From the AI-players research, which recommends this record. Amends 0005 for generated prose about real people. Amended by 0038 (no live AI in the Steam build until Valve clears it). Design: `docs/design/FOUNDATION.md` section 8.

## Context

- The research found that the pattern that works is "the engine decides, the model voices" (CICERO, Vox Deorum), and that model output is not reproducible.
- An AI writing a general's letters could leak what he will really do, and players may try to prompt-inject their own commanders through order text.
- 0005 governs real people; it did not anticipate generated prose about them.

## Decision

- **Voice is never state.** Generated text is stored in a transcript the kernel never reads; no outcome depends on it.
- **Voice is built only from views.** A general's letter is written from what he declared and chose to state, never from what he will actually do.
- **Player text goes only to the voice layer**, so injection through order text cannot change an outcome.
- **Every voiced line has a template fallback**, so the game reads fully without any model.
- **Generated prose about real historical people** (amending 0005) stays within what the sources support for that person's character, avoids inventing private conduct, and passes the sensitive-history gate (0021) where it touches it.
- **Bring your own key, plus an optional local model;** the game is fully playable with neither.

Rejected: letting the model decide compliance (persona prompts barely change decisions, and 0007's traceability would be lost); shipping only live AI text (offline play and moderation).

## Consequences

- Before any live AI text ships: Steam's AI-content disclosure, a check of any bundled model's licence, and the voice-acting issues parked in `docs/OPEN_QUESTIONS.md`.
- AI cabinets agree too much in studies, so disagreement comes from the kernel's typed reasons; the model only voices it.
