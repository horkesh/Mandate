# 0015: Every person is a seat; rules first; the command log is the truth

Status: accepted (2026-11-14). The owner chose "rules first, AI as an upgrade" and accepted the seat plan: one set of decision types for rules, AI and humans; Lincoln's seat first, "play a general" second, multiplayer third. Supersedes 0011. Clarifies 0007 and widens 0009. Design: `docs/design/FOUNDATION.md` section 8.

## Context

- The owner wants AI models able to play the opposing leader and the player's own commanders, at levels set per game, and possibly humans playing generals later.
- The AI-players research found that what works is "the engine decides, the model voices", that persona prompts barely change decisions, and that identical requests to a model do not return identical answers.
- 0011 made Mandate single-player with knowledge scoped per faction. Humans in generals' seats need knowledge scoped per person.
- 0007 says every decision a person makes is a deterministic function of state, which an AI-filled seat cannot satisfy by itself.

## Decision

- **A seat** decides for one person: the rules model, an AI model, or (later) a human. Every seat gets a request built only from what that person may know and the kernel's menu of legal responses, and returns a typed response. The same decision types serve every kind of seat.
- **Rules first.** Every person plays well on the rules model alone, offline and free. An AI seat wraps a rule seat and falls back to it on timeout, invalid output, a failed consistency check or a missing key.
- **Knowledge is scoped per seat.** Each seat stores the reports that reached it; `viewFor(state, seatId)` replaces the per-faction view.
- **The command log is the truth about what happened.** Every seat's response, including rule seats', is logged as an input. Replay, resume and Monte Carlo read the log and never call a model. Resuming from a save must equal the continuous run.
- **0007 is clarified:** a person's behaviour is a deterministic function of state *and of the recorded seat responses*. Compliance itself (what a general actually does and says he does) stays kernel mechanics; an AI may choose only among options the kernel has judged equally consistent with his state.
- **0009 is widened:** a non-player principal may be a rule seat or an AI seat with a rule fallback.
- **Order of delivery:** Lincoln's seat; then single-player as a general under an AI or rule Lincoln; then multiplayer.

Rejected: AI first with rules as a fallback (quality would depend on a model we don't control, and offline play would suffer); AI only for the player's commanders (it would split the decision types and block the general's seat later); keeping per-faction knowledge (it rules out a human or AI general who knows only his own area).

## Consequences

- An AI seat's thinking time is treated as courier latency: its answer applies on the in-game day it was due, so replays are exact.
- The player-visible boundary is built in Phase 0, before any generated text exists.
- Multiplayer later needs lockstep and pause voting in the shell; the kernel needs nothing more.
