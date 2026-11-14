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
- **Map licence emails** (map lane, 2026-11-14; decision 0031): a confirmation to the Newberry Library that its current reuse terms apply, and permission requests to the owners of the two 1861 railway datasets (Atack's layer; the University of Nebraska's). Outward-facing, so the owner sends them or authorises the lead to; drafts can be prepared on request.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Lane findings waiting for a home

- **War Resilience** (games survey): AGEoD lets a losing side that still holds its capital regain morale, to stop runaway collapse. A candidate for the Phase 1 politics design.
- **The dispatch-log UI precedent** (games survey): Grand Tactician delivers events as telegrams in a dispatch log and presents its manual as an 1862 drill book. Study it before the Phase 2 desk.
- **AI seats as a health check** (AWWV-architecture lane): AWWV's three LLM commanders filed 321 typed observations, which its team came to trust more than the calibration percentage. Build the observation channel with the first AI seat.
- **Licence pages to read in a browser** (map lane): NHGIS, the Library of Congress and the National Park Service refused automated fetches. Read and archive them before lane 0.3 commits map data.
- **Sourced first-period events** (map lane): Lincoln's review of the Dakota War death sentences in December 1862 (sources disagree on 38 or 39 approved; check before authoring, under the gate) and the Trent affair (17–19 days for news to cross to Europe). Candidates for the situations in Phase 1.
- **Phase 1 research lanes already identified** (secession-winter lane): a Confederate-side situation set (Davis's cabinet, Beauregard, the upper-South conventions); the navy seat (Welles, Fox, the Strategy Board, the officers who resigned); the War Department seat (Cameron, patronage, contracts, the railways). Also check the Union dossier's Anaconda entry (a 3 May 1861 Scott letter to McClellan) and the Official Records' quota table.
- **Situation design notes** (secession-winter lane): the decision to fire on Sumter was already taken in Richmond, so the player's levers are evacuate or relieve, notice and timing, and the firing is the labelled railroad (0028); the call for 75,000 volunteers, not Sumter alone, moved Virginia, North Carolina, Tennessee and Arkansas, so it needs its own situation; the note proposes starting control and loyalty for each border state; Congress did not sit from 4 March to 4 July 1861, so the calls for troops, the blockade and the habeas order were executive acts ratified later, and the politics model needs a "Congress not sitting" state that changes which actions are legal and what Lincoln must answer for when it returns.
- **Event caps defer rather than drop** (AWWV-architecture lane): for the situations engine (Phase 0, lane 0.7).
