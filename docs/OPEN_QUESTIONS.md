# Open questions for the owner

The owner takes recommendations by default (CLAUDE.md), so this file lists only things that are not design or code decisions, plus lane findings still waiting for a home.

Answered and moved to decisions:
- stack (0002), first slice (0004), living people (0005), Rome's principal (0006), all on 2026-11-13;
- dice (0007), telegraphing (0008), opponents (0009), tempo (0010), multiplayer (0011), porting AWWV (0012), the staff map (0013), all on 2026-11-14;
- licence (0014), and the redesign (0015–0026), all on 2026-11-14. The lane findings triaged here earlier that day (the player-visible boundary, the verb-list test, run outputs, no copied functions, map provenance, calibration by counts, reputation and nerve, observers, relief modes, Senate lapses, memoirs as weak evidence, AI cabinets agreeing too much) are now in `docs/design/FOUNDATION.md` and those records.

## Parked

- **Product name.** "Mandate" stays as the codename. It collides with an old Kickstarter space game ("The Mandate", 2015), so a product name is needed before the game is promoted.
- **The market looks small** (games-survey lane, 2026-11-14; the lane's reading of Steam review counts, not market research): Ultimate General: Civil War about 5,700 reviews, Grand Tactician about 2,000, and the 2024 re-release of No Greater Glory 11. The president-as-player premise alone did not sell No Greater Glory. A commercial question for the owner before money is spent on art or marketing.
- **Before any live AI-generated text ships** (AI-players lane): Steam requires a disclosure of AI content and a description of guardrails; check the licence of any local model before bundling it; AI voice acting raises union issues (SAG-AFTRA's charge over Fortnite's AI Vader). Source: `docs/research/2026-11-14-ai-players.md`.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Lane findings waiting for a home

- **War Resilience** (games survey): AGEoD lets a losing side that still holds its capital regain morale, to stop runaway collapse. A candidate for the Phase 1 politics design.
- **The dispatch-log UI precedent** (games survey): Grand Tactician delivers events as telegrams in a dispatch log and presents its manual as an 1862 drill book. Study it before the Phase 2 desk.
- **AI seats as a health check** (AWWV-architecture lane): AWWV's three LLM commanders filed 321 typed observations, which its team came to trust more than the calibration percentage. Build the observation channel with the first AI seat.
- **Event caps defer rather than drop** (AWWV-architecture lane): for the situations engine (Phase 0, lane 0.7).
