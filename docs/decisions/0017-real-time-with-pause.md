# 0017: Real time with pause on a daily tick

Status: accepted (2026-11-14). The lead proposed it in the brainstorm and the owner did not object; the owner's favourite games (Europa Universalis, Imperator, HoI) all run this way. Supersedes 0010. Design: `docs/design/FOUNDATION.md` section 9.

## Context

0010 made the tick a day and ended a turn at a decision point, between pack-set minimum and maximum lengths. The owner's references are real time with pause, and the night of the battle needs time that can slow down.

## Decision

- The kernel ticks one day at a time and never sees the wall clock.
- The shell runs days at a speed the player chooses and pauses on the kernel's decision-point signal (an objection, a battle report, a closed pocket, a situation, a seat awaiting dispatch) according to the player's settings.
- During a major battle the shell slows to hours and releases that day's dispatches by their hour stamps. Orders sent meanwhile are commands stamped for when they would arrive.
- A full 1861–65 campaign is designed to take about 15–25 hours of play (the owner's choice).

Rejected: AGEoD's simultaneous two-week turns (too coarse for latency and the night of the battle); keeping 0010's turns (the owner's references are continuous).

## Consequences

- 0010's useful part survives as the decision-point signal.
- A day tick must stay under about 40 ms so a headless campaign runs in under a minute.
- Multiplayer later needs pause voting.
