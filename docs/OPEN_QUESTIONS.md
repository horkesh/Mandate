# Open questions for the owner

The owner takes recommendations by default (CLAUDE.md), so this file lists only things that are not design or code decisions.

Answered and moved to decisions:
- stack (0002), first slice (0004), living people (0005), Rome's principal (0006), all on 2026-11-13;
- dice (0007), telegraphing (0008), opponents (0009), tempo (0010), multiplayer (0011), porting AWWV (0012), all on 2026-11-14.

## Parked

- **Product name.** "Mandate" stays as the codename. It collides with an old Kickstarter space game ("The Mandate", 2015), so a product name is needed before anything is public.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Before any live AI-generated text ships** (from the AI-players lane, 2026-11-14): Steam requires a disclosure of AI content and a description of guardrails; check the licence of any local model before bundling it; AI voice acting raises union issues (SAG-AFTRA's charge over Fortnite's AI Vader). Source: `docs/research/2026-11-14-ai-players.md`.
- **The market looks small** (games-survey lane, 2026-11-14; the lane's reading of Steam review counts, not market research): Ultimate General: Civil War about 5,700 reviews, Grand Tactician about 2,000, and the 2024 re-release of No Greater Glory 11. The president-as-player premise alone did not sell No Greater Glory. A commercial question for the owner before money is spent on art or marketing.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Triage of lane findings (open)

- **The player-visible boundary isn't built.** True reasons in `DirectiveResponse` are kept from the player only by a code comment, and any AI text layer would be a second way to leak them. Goes into the foundation design as a Phase 0 item, with an architecture test that also covers the code calling the AI. (AI-players lane, 2026-11-14.)
- **From the AWWV-architecture lane (2026-11-14), all going into the foundation design:**
  - the redesign collides with accepted decisions 0001, 0004, 0007, 0010 and 0011, so each needs a superseding record;
  - an architecture test that the app's commands match the kernel's verb list exactly (AWWV's desktop shell let unit orders back in);
  - run outputs live outside folders agents search;
  - export and reuse functions, never copy them (a copied function is a second owner);
  - a provenance and licence file for every geographic source;
  - calibration targets as counts of named things; event caps defer rather than drop;
  - LLM seats' typed observations as a health check, built with the first LLM seat.
- **From the history lane (2026-11-14), all going into the people design:**
  - victory doesn't reliably make generals bolder, nor defeat more cautious; the cases cut both ways, so keep reputation and nerve as separate stats and let traits decide how a result moves a man (Hooker's "lost confidence" line is a later legend);
  - the record itself moved (Porter cleared in 1879/1886, Warren in 1882), which history's shadow already settles: the hidden truth is the per-game draw, not the historians' verdict;
  - observers report to whoever sent them (Dana answered to Stanton, not Lincoln) and can be wrong (his Chickamauga wire), so an observer is an office-holder with bias, not a window on the truth;
  - Lincoln almost always softened a relief (a quiet department, "at his own request"), so dismissal needs modes with different costs;
  - Senate failure was usually a nomination lapsing at the session's end, not a rejection vote;
  - generals' memoirs (Grant's included) are self-serving on promotions and rivals, so they are weak evidence when setting hidden stats.
  - Checked and closed: no pack data encodes the two premises the lane found unsupported (Pope blaming McDowell; a single date for Butler's 1865 relief).
- **From the games-survey lane (2026-11-14):**
  - fixed: 0007's context miscounted Grand Tactician's feuds as dice (erratum added) and the 2026-11-13 note misattributed "Room at the Top" (corrected);
  - randomised general ratings have precedent (AGEoD, Hunter's ACW), so history's shadow (0020) is not novel, only well placed;
  - AGEoD's "War Resilience" (a losing side that still holds its capital regains morale) is a candidate for the politics design, to stop runaway collapse;
  - Grand Tactician presents events as telegrams in a dispatch log and its manual as an 1862 drill book: a precedent to study for the desk UI.
- **AI cabinets agree too much.** Studies of simulated team debates find "farcical harmony", so disagreement must come from the kernel's typed reasons and the AI only voices it. Goes into the foundation design's voice layer. (AI-players lane, 2026-11-14.)
