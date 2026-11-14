# 0045: The steward integrates; reviews are lanes

Status: accepted (2026-11-14). The owner asked why reviews didn't run as sessions and pointed to AWWV's integration steward. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0034 and `docs/LANES.md`.

## Context

- 0034 made the steward docs-only: "it works on its own branch; the lead reviews and merges". So the lead verified and merged every lane by hand. On 2026-11-14 that was a dozen merges, and most of the lead's context went to merge mechanics instead of orchestration, which is the model the owner set (the lead frames, opens lanes and collects results).
- AWWV's steward is an integration steward: it lands reviewed work as well as syncing docs.
- The lead twice ran lane work as hidden subagents instead of sessions, the second time five reviews (lesson L16), so the owner could neither see nor steer it.
- 0034's own split trigger has fired: more than four lanes ran at once.

## Decision

**Reviews are lanes.** A review of lane output (code, data, research or design) runs as a reviewer lane, sized from the table in `docs/LANES.md`, never as a subagent. A subagent is for one quick lookup whose answer the lead needs in the same turn.

**The steward is the integration steward.** When the lead accepts a reviewer's verdict (or, for a docs-only lane with no reviewer, the lead's own reading), the lead names the branch or pull request to the steward, which:
1. verifies it on disk: only the files in scope, a clean worktree, `npm run check` passing after rebasing on main, and CI green where CI ran;
2. merges it into main (`--no-ff` for a lane branch; for a pull request, marks it ready and merges it with a merge commit), and pushes;
3. syncs the docs it owns in the same batch, and runs the zero-loss audit;
4. reports in 150 words or less.

**Limits.** The steward never merges code without a reviewer's approval, or anything touching the sensitive-history gate without the gate reviewer's approval. It never resolves a merge conflict by choosing content: it sends the conflict back to the lane or the lead. It keeps 0034's limits on what it may edit, and it commits nothing of its own outside those files.

**The lead keeps** the briefs, starting and closing lanes (asking once more, archiving), accepting verdicts, decisions and their records, and anything that needs the owner. The lead commits its own decision records and design notes.

**Sizing.** The steward stays on Sonnet at medium effort; the lead moves it up a row only if integration goes wrong.

Rejected:
- **The lead keeps merging.** It is the cost this record exists to remove.
- **A separate integration lane beside a docs steward.** Two standing lanes for one lane's work (0034's reasoning still holds); merging and syncing belong in one batch.
- **Auto-merge.** AWWV's auto-merge once landed before a review fix (0034).

## Consequences

- `docs/LANES.md` (roles, the steward, closing a lane) and `CLAUDE.md` (how work is run) change to match.
- The steward's first integration batch is the work already accepted: the sensitive-history checklist and the five cloud pull requests, once their review fixes land.
