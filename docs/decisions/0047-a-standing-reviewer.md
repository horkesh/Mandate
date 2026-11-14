# 0047: A standing reviewer lane

Status: accepted (2026-11-14). The owner asked for "a permanent review and integration session". Integration already has one (the steward, 0045); this adds a permanent reviewer beside it. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0034, 0045 and `docs/LANES.md`.

## Context

- 0045 made every review a lane. But the app refuses to start a session on a turn that another session's message or an automated event began, which is most of the turns where a review is due. So each review became a card waiting for the owner's click.
- The app always lets the lead message a running session.

## Decision

**A second standing lane, the reviewer**, on Opus at high effort (the table's row for reviewing simulation changes, the most demanding review it does), exempt from the work-in-progress limit like the steward. The lead sends it review requests by message; it is never archived as "done", and if it ends, the lead starts a replacement at once.
- **It reviews any lane output the lead names**: code (one verdict over the four lenses in `docs/LANES.md`: canon and decisions, determinism, history, realism), data, research and design.
- **Read-only.** It never commits, merges or edits anyone's work. It checks out commits detached in its own worktree, runs the checks, plants probes and reverts them.
- **Its verdict** is approve, approve after fixes, or block. Each finding gives a location, a concrete failure scenario, a severity and a suggested fix, verified before it is reported. The detail goes to the shared notes folder as `review-<topic>.md`; the report to the lead is short.
- **It keeps no private state.** Each review starts from the files and the decisions, not from memory of earlier reviews, and re-checks rather than assumes. If its context grows long, the lead replaces it.
- **Work touching the sensitive-history gate** still gets a second, separate gate reviewer: a one-off lane, started on the owner's turn.
- **A lane's own author never reviews it**, and the reviewer never integrates. The steward merges only what the reviewer approved and the lead accepted (0045).

Rejected:
- **One session for both review and integration.** The two need different sizing (review on Opus at high effort, docs sync on Sonnet at medium), and the integrator would be grading its own merge queue.
- **A fresh reviewer lane per review, started from a card.** Reviews wait for the owner's click; that is the problem this record solves.

## Consequences

- `docs/LANES.md`'s standing lanes gain the reviewer.
- Its first review is draft PR #6 (facts that block situation authoring).
