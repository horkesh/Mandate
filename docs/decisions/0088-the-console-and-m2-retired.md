# 0088: The console on the new kernel, and M2 retired

Status: accepted (2026-11-17). From Phase 1 lane 1.13 (`notes/lane-1.13-console.md`, merged `fb1dea7`) and the standing reviewer's review and final verdict (`review-lane-1.13.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12's row 1.13 (0073), under 0016, 0027 and 0052.

## Context

Lane 1.13 built the text console on the new kernel, ported the demo and the verb-list test, and deleted M2. It also found and fixed a real bug: the player's seat had been given the rules driver, so the kernel took his situations' historical defaults for him.

## Decision

**The console.**
- **The command:** `npm run play -- <pack>` plays the new kernel.
- **The desk and the driver are split along the player-visible boundary.** The desk (`packages/cli/src/desk/`) sees only the seat's view and sits under the boundary test. The driver holds State and puts the rules model in every other seat. The principal's attention is read from `SeatView`, never from State.
- **His seat is registered `human`,** so his situations stay before him.
- **Turns:** a turn runs up to `turns.maxDays` (a pack rule; 7 in both packs) and ends early on his decision points (0027). Orders queue and go on the turn's first morning, and each day's reports show as they arrive. A battle day's dispatches read by the hour written.
- **Every 1A verb is an order to a person** (hard rule 1). Move, march, attack and detach are unknown commands. The verb-list test reads the new kernel's command kinds.
- **Plan review:** approve, send back, and 0026's edits. `preview` re-expands an edit through the kernel's `previewEdit`, built the way `answerEdit` builds it, and shows the route and its time before the edit is sent. It shows nothing of the commander's judgement.

**M2 is retired.**
- **Deleted:** its kernel (`GameState`, `turn`, `theatre`, `rules` and the rest), its console, runners and scripts, their tests, CI's M2 steps, and the packs' M2 scenario files.
- **Survivors:** `permille`, `compare`, `rng`, `compliance`, `directive`, and the people profile types.
- **The demo** runs on the new State, in the CLI.
- **`docs/design/KERNEL.md`** is marked retired.

Rejected:
- **One console module holding State.** The player-facing code would escape the boundary test.
- **A console-side guess at an edited route.** It could differ from what the commander does.
- **A turn length fixed in the console.** 0027 says the pack sets it.
- **Sending orders at once, mid-turn.** A turn is the unit the player acts in, and replay reads one log day.
- **Keeping the player's seat on `rules`.**
- **Keeping M2's `rules` module.** Nothing new read it.
- **A hand-built demo World inside the kernel package.**

## Consequences

- FOUNDATION section 10 records what survived, where the audience cases now live, the desk as the console's root, and the `turns` rule.
- **Lanes 1.11 and 1.12** complete the Union scripted session that 1A's done check plays.
- **Lane 1.12** builds the menu of posts from what the principal believes (the reviewer's vacancy finding). The desk then shows it as it is.
- **Lane 1.11** adds the habeas option's neutral rendering, with an architecture test that the desk never reads an option's basis.
- **OPEN_QUESTIONS:**
  - a test that the edit preview equals the arrival;
  - Union inbox volume as a Phase 2 desk question.
