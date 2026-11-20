# 0096: Codex resumes milestone 1A

Status: accepted (2026-11-19). The owner: "Give him more work, he can do anything you can, I want to use his tokens". Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0092 (Codex's scope and its use of git). Amended by 0106 (the sprint to 22 November: Codex commits on its own branches, and review is deferred to the sprint's end).

## Context

- Claude's lanes have been paused since 2026-11-17 to save tokens. Milestone 1A stopped with five branches waiting on review and three lanes part done: 1.11 (situations), 1.11r3 (research), and 1.12 (rule seats; Part A done, Part B not started). The resignation lane was never opened. Each lane's hand-over is in `notes/` on its branch.
- Under 0092, Codex took coding tasks: R14 to R43, of which R29, R32 and R42 were kernel work, each reviewed by the standing reviewer and merged by the steward.
- Codex's plan is prepaid until 22 November 2026.

## Decision

1. **Codex takes over the paused 1A lanes as their implementer.** Each lane step is a numbered request in `CODEX.md`, run through `codex exec` in that lane's own worktree and branch. The lane's hand-over in `notes/` is its brief, together with its row in FOUNDATION section 12. Codex keeps the hand-over current and ends it with "Findings outside my scope". The Claude sessions of those lanes stay paused and are not re-tasked.
2. **Reviews cross models.** Codex reviews work that Claude's lanes wrote, with the standing reviewer's four lenses, its verdicts and its bar for holding a merge. Claude's standing reviewer reviews work that Codex wrote. The work's author still never reviews it.
3. **Git.** A Codex run may use git only to read: `log`, `diff`, `show`, `status`, `merge-base` and `merge-tree`. It never commits, checks out, merges, stages, stashes, fetches or pushes. The lead starts any merge of main into a branch before the run, leaving the conflicts for Codex to resolve, and commits after reading the diff, through the hook. The steward merges into main after review (0045).
4. **Rulings.** A Codex run can't ask the lead mid-run. When a lane needs a ruling within design, Codex takes the choice it recommends, builds it, and lists it in its status as a proposed ruling with the alternatives it rejected. The lead records each accepted ruling as a decision record. Outside design (money, publishing, outward actions) Codex stops that item.
5. **Unchanged:**
   - The gate reviewer signs every gated item. Codex drafts gated items in `situations/drafts/` and never writes a signature.
   - Facts about the world come only from sources Codex has read, with page or entry cited. An inference is marked [I].
   - The hard rules, the settled decisions and the limits in `docs/LANES.md` all hold: four lanes at once, two moving the simulation, with the standing review excepted.

Rejected:
- **Resuming Claude's lanes.** That spends the tokens the pause was meant to save, and the owner asked for Codex's to be used.
- **Codex on prototypes and tooling only.** That leaves 1A stalled while the plan runs out on 22 November.
- **A second Codex session reviewing Codex's work.** It is the same author in practice. A review across models stays independent.
- **Codex merging branches itself.** One writer of history keeps the ledger plain (0092).
- **Holding Part B and resignation until Part A merges.** Running them in sequence costs days the plan doesn't have. Merges stay in series, and each branch merges main again before it lands.

## Consequences

- R44 to R49 open in `CODEX.md`:
  - R44 reviews the queued Claude branches;
  - R45 runs the second round of re-sourcing research;
  - R46 resolves the merges of main into the 1.11 and 1.12 branches;
  - after the lead commits those merges, R47 continues 1.11, R48 continues 1.12 (Part B, without the items that wait on 1.11), and R49 opens resignation.
- The apply of the re-sourcing to the pack, 1.14 Part B's calibration and the send-back notes follow once their bases are on main.
- `CLAUDE.md` and `docs/LANES.md` name Codex's lanes beside Claude's.
