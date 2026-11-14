# Open questions for the owner

The owner takes recommendations by default (CLAUDE.md), so this file lists only things that are not design or code decisions.

Answered and moved to decisions:
- stack (0002), first slice (0004), living people (0005), Rome's principal (0006), all on 2026-11-13;
- dice (0007), telegraphing (0008), opponents (0009), tempo (0010), multiplayer (0011), porting AWWV (0012), all on 2026-11-14.

## Parked

- **Product name.** "Mandate" stays as the codename. It collides with an old Kickstarter space game ("The Mandate", 2015), so a product name is needed before anything is public.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Before any live AI-generated text ships** (from the AI-players lane, 2026-11-14): Steam requires a disclosure of AI content and a description of guardrails; check the licence of any local model before bundling it; AI voice acting raises union issues (SAG-AFTRA's charge over Fortnite's AI Vader). Source: `docs/research/2026-11-14-ai-players.md`.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Triage of lane findings (open)

- **The player-visible boundary isn't built.** True reasons in `DirectiveResponse` are kept from the player only by a code comment, and any AI text layer would be a second way to leak them. Goes into the foundation design as a Phase 0 item, with an architecture test that also covers the code calling the AI. (AI-players lane, 2026-11-14.)
- **AI cabinets agree too much.** Studies of simulated team debates find "farcical harmony", so disagreement must come from the kernel's typed reasons and the AI only voices it. Goes into the foundation design's voice layer. (AI-players lane, 2026-11-14.)
