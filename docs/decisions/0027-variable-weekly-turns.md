# 0027: Variable turns of up to a week on a daily tick

Status: accepted (2026-11-14). The owner, asked about pacing under real time: "Are we talking about real time game here? I think turn based would fit it better?" The lead agreed and recommended variable turns capped at a week; the owner can overturn the variant. Supersedes 0017.

## Context

- 0017 chose real time with pause, after the owner's favourite grand-strategy games (Europa Universalis, Imperator, HoI). The owner's favourite Civil War games, AGEoD's, are turn-based.
- The president's work is deliberation at a desk: reading dispatches, reviewing a commander's plan, holding an audience. Real time works against it.
- The weekly attention budget (0025) already gives the game a weekly rhythm.
- Real time needed an "awaiting dispatch" pause for AI seats and lockstep with pause voting for multiplayer.

## Decision

- **The kernel still ticks one day at a time** and never sees the wall clock.
- **A turn runs up to seven days** (pack-set maximum) and **ends early at a decision point**: an objection or refusal, a battle report, a closed pocket, a situation that needs the player, a plan ready for review. The player can also set which events end a turn.
- **Between turns the player acts**: the verbs of FOUNDATION section 5, within the weekly attention budget (0025).
- **The days of a turn are shown passing** as dispatches arrive by their stamped dates, then the game waits for the player.
- **The night of the battle** is shown hour by hour from the battle day's hour-stamped dispatches, as a dispatch log. Orders sent in response are ordinary commands and arrive for a later day (0026).
- **Seats answer at turn boundaries.** An AI seat has until the player ends the turn, so think time needs no special handling; the command log still records every response.
- **Multiplayer**, later, is simultaneous turns: every human submits, then the turn resolves.

Rejected: real time with pause (0017; works against deliberation and complicates seats and multiplayer); fixed turns (a week passes even when a battle needs you on day two); AGEoD's two-week turns (too coarse for telegraph latency and battles).

## Consequences

- 0010's decision-point signal returns as the turn-ending rule; 0017's kernel-owned latency (via 0026) stands.
- The tick budget is unchanged (a full campaign headless in under a minute), but play no longer depends on it for smoothness.
- A full campaign is still designed for about 15–25 hours; the pack's turn cap and decision points are the dials.
