# 0036: The game is called *By Order of the President*; Mandate stays the engine's codename

Status: accepted (2026-11-14). The owner chose the title from a collision check (`docs/research/2026-11-14-name-collisions.md`): "Yes, I like it."

## Context

- "Mandate" was the codename. The name check found it high-risk as a public brand: five or more "Mandate" strategy and simulation games on Steam, dozens on itch.io, a card game, a pending US video-game trademark application, and political baggage. "The Mandate" (2015) itself was never released and its US mark is abandoned.
- *By Order of the President* had the lowest collision risk of six candidates: no game and no trademark found, and its `.com` had no DNS on 2026-11-14. Two novels share the title.
- The title carries the game's irony: the order is given; whether it is carried out is the game.

## Decision

- The first game's title is ***By Order of the President***.
- **Mandate** remains the internal codename of the engine and the repository (`horkesh/Mandate`, the `@mandate/*` packages). It is not used as a public series brand. A later series can get a brand of its own.
- The project folder on the owner's machine is renamed to match the game: `C:\Pyrrhic\ByOrderOfThePresident`.

Rejected: *War Powers* and the "Mandate:" forms (*Mandate: 1861*, *Mandate: War Powers*, *Mandate: By Order of the President*), all medium to high collision risk; renaming the GitHub repository and packages (churn for an internal codename).

## Consequences

- Before the title is used in marketing or a store listing: the owner runs the manual register searches listed in the name note (USPTO, EUIPO, TMview, WIPO), and a trademark attorney clears it. Parked in `docs/OPEN_QUESTIONS.md`.
- The README, VISION and CLAUDE.md name the game; the engine keeps its codename in code and package names.
