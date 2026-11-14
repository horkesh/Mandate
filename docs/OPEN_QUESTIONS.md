# Open questions for the owner

The owner takes recommendations by default (CLAUDE.md), so this file lists only things that are not design or code decisions, plus lane findings still waiting for a home.

Answered and moved to decisions:
- stack (0002), first slice (0004), living people (0005), Rome's principal (0006), all on 2026-11-13;
- dice (0007), telegraphing (0008), opponents (0009), tempo (0010), multiplayer (0011), porting AWWV (0012), the staff map (0013), all on 2026-11-14;
- licence (0014), the redesign (from 0015 on; see the decisions index), the title (0036), the commercial stance (0037), live AI on Steam (0038), and positioning, price and the go or no-go bands (0039, from the market-research lane), all on 2026-11-14. The lane findings triaged here earlier that day (the player-visible boundary, the verb-list test, run outputs, no copied functions, map provenance, calibration by counts, reputation and nerve, observers, relief modes, Senate lapses, memoirs as weak evidence, AI cabinets agreeing too much) are now in `docs/design/FOUNDATION.md` and those records.

## Parked

- **Clear the title before it is used publicly** (0036): run the manual register searches listed in section 9 of `docs/research/2026-11-14-name-collisions.md` (USPTO advanced search, EUIPO, TMview, WIPO), re-run the Steam search, and have a trademark attorney clear *By Order of the President* before marketing or a store listing. Studio domains: `pyrrhic.com` is parked for sale; `pyrrhicgames.com` and `pyrrhicstudio.com` had no DNS on 2026-11-14 (check only; buying is the owner's call).
- **Before any live AI-generated text ships** (AI-players lane): Steam requires a disclosure of AI content and a description of guardrails; check the licence of any local model before bundling it; AI voice acting raises union issues (SAG-AFTRA's charge over Fortnite's AI Vader). Source: `docs/research/2026-11-14-ai-players.md`.
- **Ask Valve about bring-your-own-key AI** (0038): once a Steamworks partner account exists. Until Valve answers, the Steam build ships template voices only.
- **Map licence emails** (0031): three drafts are in the owner's Gmail (2026-11-14): the Newberry Library (addressed to its rights team), Jeremy Atack (jeremy.atack@vanderbilt.edu, from https://my.vanderbilt.edu/jeremyatack/contact/) and the University of Nebraska's railroad project (cdrh@unl.edu, named for copyright inquiries on https://railroads.unl.edu/about/copyright.html). All three are unsent; the owner reviews and sends them. The Atack data page states no licence for the shapefiles, only a suggested citation.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Lane findings waiting for a home

- **War Resilience** (games survey): AGEoD lets a losing side that still holds its capital regain morale, to stop runaway collapse. A candidate for the Phase 1 politics design.
- **The dispatch-log UI precedent** (games survey): Grand Tactician delivers events as telegrams in a dispatch log and presents its manual as an 1862 drill book. Study it before the Phase 2 desk.
- **AI seats as a health check** (AWWV-architecture lane): AWWV's three LLM commanders filed 321 typed observations, which its team came to trust more than the calibration percentage. Build the observation channel with the first AI seat.
- **Licence pages to read in a browser** (map lane): NHGIS, the Library of Congress and the National Park Service refused automated fetches. Read and archive them before lane 0.3 commits map data.
- **Sourced first-period events** (map lane): Lincoln's review of the Dakota War death sentences in December 1862 (sources disagree on 38 or 39 approved; check before authoring, under the gate) and the Trent affair (17–19 days for news to cross to Europe). Candidates for the situations in Phase 1. The Dakota review is on hold until a decision record on the wars against Native nations exists (the gate checklist's R3, under review).
- **Phase 1 research lanes already identified** (secession-winter lane): a Confederate-side situation set (Davis's cabinet, Beauregard, the upper-South conventions); the navy seat (Welles, Fox, the Strategy Board, the officers who resigned); the War Department seat (Cameron, patronage, contracts, the railways). Also check the Union dossier's Anaconda entry (a 3 May 1861 Scott letter to McClellan) and the Official Records' quota table.
- **Situation design notes** (secession-winter lane): the decision to fire on Sumter was already taken in Richmond, so the player's levers are evacuate or relieve, notice and timing, and the firing is the labelled railroad (0028); the call for 75,000 volunteers, not Sumter alone, moved Virginia, North Carolina, Tennessee and Arkansas, so it needs its own situation; the note proposes starting control and loyalty for each border state; Congress did not sit from 4 March to 4 July 1861, so the calls for troops, the blockade and the habeas order were executive acts ratified later, and the politics model needs a "Congress not sitting" state that changes which actions are legal and what Lincoln must answer for when it returns.
- **Event caps defer rather than drop** (AWWV-architecture lane): for the situations engine (Phase 0, lane 0.7).
- **Situations catalogue gaps** (docs/design/SITUATIONS-1861-62.md, proposal): its research gaps, the facts that block situation authoring, are with a cloud research lane. The catalogue recommends an early-March-1862 scenario for the public demo.
