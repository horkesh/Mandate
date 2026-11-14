# 0034: One standing steward lane from Phase 0

Status: accepted (2026-11-14). The owner asked to examine AWWV's integration steward and consider permanent lanes, including a docs steward. The steward-research lane (`docs/research/2026-11-14-awwv-steward-and-standing-lanes.md`) recommended one combined steward; the lead accepted it. Amends `docs/LANES.md`, which had deferred the steward until more than four lanes ran. Amended by 0045 (the steward integrates: it verifies and merges accepted work) and 0047 (a second standing lane, the reviewer).

## Context

- AWWV's steward is a standing session, never archived as "done" and replaced at once if it ends, exempt from the lane cap. After each merge it syncs the roadmap, board, gates and registers in one docs-only pull request.
- What went wrong there: its auto-merge landed before a review fix; a panel found twelve defects in canon text it wrote; its derived files (a board, a plan index, a compiled ledger) each needed guards; its role drifted into being the orchestrator's general helper.
- Of AWWV's roughly 30 roles, only a few earned their keep as lanes; most were prompts.
- Mandate already shows drift: canon documents cited decision ranges that went stale within hours.

## Decision

- **One standing steward lane**, combining integration bookkeeping and docs sync, from Phase 0 on. Sonnet at medium effort. It runs locally and is **exempt from the four-lane cap**.
- **Triggers:** the lead tells it of a merge batch, an accepted decision, a lane closing, or a phase boundary.
- **It may edit only:** `docs/ROADMAP.md`, `docs/OPEN_QUESTIONS.md`, the decisions index, factual pointers in `CLAUDE.md` (paths, commands, phase line), and the tables in `docs/LANES.md`. It is the single writer of `docs/OPEN_QUESTIONS.md`.
- **It never edits** decision records, `VISION.md`, the content of `FOUNDATION.md` or the hard rules, and never writes claims about what the code does.
- **It works on its own branch; the lead reviews and merges.** No auto-merge.
- **At every lane close it runs the zero-loss audit** and reports the result.
- **It keeps no private state:** the last commit it synced is recorded in `docs/ROADMAP.md`, and everything else is git history, so replacing it is cheap. If it ends, the lead starts a replacement.
- **Weight guards:** no derived documents (no board, plan index or compiled ledger); reports of 150 words or less; any duty it repeats becomes an `npm run check` check; it creates no process documents.
- **Not standing lanes now:** a separate docs steward, a determinism or CI guard (those become checks), a sources or history steward, a retrospective analyst or council.
- **Split triggers:** split the steward into integration and docs roles when more than four lanes run at once or merges move to pull requests with auto-merge; add a sources steward when Union data entry (lane 0.3) and Phase 1 situations run alongside other history work.

Rejected: no steward until more than four lanes run (drift already appeared at two or three); separate integration and docs stewards now (two lanes for one lane's work); AWWV's full set of derived status files (each is a second owner of truth, against hard rule 5).

## Consequences

- `docs/LANES.md` gains a standing-lanes section and the cap exemption.
- Canon documents stop citing decision ranges and point to the decisions index instead, so they cannot go stale.
- The steward starts after the repository moves to `C:\Pyrrhic\Mandate`, so it is not cut off mid-run.
