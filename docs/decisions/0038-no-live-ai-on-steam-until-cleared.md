# 0038: No live AI in the Steam build until Valve clears bring-your-own-key

Status: accepted (2026-11-14). The owner chose "defer, AI off on Steam" on the lead's recommendation. Amends 0022. Extended by 0039 (AI is never in the headline; Steam's disclosure covers pre-generated text too).

## Context

The tooling survey found that Steam's content survey says a game using a live-generated AI service with per-call costs must manage access and collect payment through Steam's own methods. Whether a bring-your-own-key design, or a local model, counts is unclear. No Steamworks partner account or build exists yet.

## Decision

- The owner asks Valve once a Steamworks partner account exists.
- Until Valve answers, **the Steam build ships with template voices only.** The game is fully playable without any AI model (0015, 0022), so nothing is lost but the generated letters.
- Bring-your-own-key and local-model voice remain a setting in non-Steam builds.
- If Valve clears bring-your-own-key or local models, a new record turns them on for Steam.

Rejected: asking Valve now (no build or account yet); never shipping live AI on Steam (closes the option before asking).

## Consequences

- The seat and voice code keeps the AI path behind a build-time switch, so the Steam build can exclude it.
- Parked for the owner in `docs/OPEN_QUESTIONS.md` until a partner account exists.
