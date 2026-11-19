# 0092: Codex takes coding tasks through its command line

Status: accepted (2026-11-18). The owner: "since we now know you can use Codex CLI, use it for coding tasks as well". Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0048 (Codex's scope). Amended by 0096 (Codex takes over the paused 1A lanes, reviews Claude's work, and may use git to read).

## Context

- 0048 made Codex the asset maker, and 0089 to 0091 widened its scope to the prototypes in `prototypes/desk/` and `prototypes/map-icons/`.
- Since 2026-11-17 the lead has run Codex through its command line (`codex exec`), because the owner's Codex app misbehaved. Runs R14 to R21 went this way. Each stayed inside its write scope, and the lead checked each on disk before writing the receipt.
- Claude's lanes have been paused since 2026-11-17 to save tokens. Codex's plan is prepaid until 22 November 2026.

## Decision

1. **Coding tasks can go to Codex** as numbered requests in `CODEX.md`, in the same way as asset requests. The lead chooses for each task whether it goes to Codex or to a Claude lane. While Claude's lanes are paused, coding goes to Codex.
2. **Where Codex works.**
   - Prototype work stays in the main checkout, inside the request's write scope, as now.
   - Anything else (the kernel, the CLI, packs, tools) runs in its own git worktree on its own branch. The lead creates the worktree before the run and points Codex at it (`codex exec -C <worktree>`), so the main checkout's uncommitted work is out of reach.
3. **Codex never runs git.** The lead reads the diff on disk, runs `npm run check`, and commits on the branch through the pre-commit hook.
4. **The usual rules hold:**
   - the hard rules in `CLAUDE.md`: the player as principal, determinism, one owner per truth, explainable numbers, settings as packs;
   - the settled decisions and the writing rule;
   - the request's write scope.
   Each request names the decision records and files Codex must read first.
5. **Review and merge are unchanged.** A review is a lane, and a branch reaches main only after review and through the steward (0045). Until the lanes resume, Codex's branches wait. Prototype work stays uncommitted until its review, as now.

Rejected:
- **Claude lanes for all coding while the pause lasts.** The owner asked for the opposite, and saving those tokens is the reason for the pause.
- **Codex in the main checkout for kernel work.** It would share the tree with uncommitted prototypes and art, and a stray write could reach a commit unseen.
- **Codex committing on its own branch.** The lead's commit is where the diff is read and the hook runs. One writer of history keeps the ledger plain.
- **Codex reviewing its own work in place of a review lane.** A review stays independent of the work's author.

## Consequences

- `CLAUDE.md` lists coding tasks among the uses of `CODEX.md`.
- After R22, the first kernel task for Codex is the notes payload for "send back with notes" (`docs/OPEN_QUESTIONS.md`, Phase 2).
- The owner's `~/.codex/config.toml` gives Codex full access with no approvals, so a write scope holds only because Codex follows the instruction. After every run the lead checks `git status` in the main checkout, and the worktree's diff for branch work.
