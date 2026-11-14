# How work is run: the lead and its lanes

Adapted from AWWV's orchestrator and its founding brief for this project (2026-11-14), without the weight Mandate doesn't need yet. What we left out, and when it comes back, is at the end.

## Roles

- **The owner** makes design decisions and takes the lead's recommendation by default (see `CLAUDE.md`). Only the owner sees a lane's wrap-up box.
- **The lead** is the main Mandate session. It frames work, opens lanes, answers their questions, collects results, verifies, merges and commits. It does not redo a lane's investigation. It does small, reversible work directly.
- **A lane** is a separate session started from the lead, with its own brief. Work that ends in a branch, a document of its own or anything the owner may want to watch or steer is a lane. A quick read-only lookup whose result the lead needs this turn can be a subagent instead.
- **If the app refuses to start a session** (it has done so on some turns while the owner was on Remote Control), retry on the next turn. Never assume a refusal still holds. If it keeps refusing, tell the owner and ask before running the work as a subagent instead (lesson L11).

## Standing lanes

Decision 0034. A standing lane is never archived as "done"; if it ends, the lead starts a replacement at once. Standing lanes do not count toward the work-in-progress limit.

- **The steward** (Sonnet, medium): after each merge batch, accepted decision, lane close or phase boundary, it brings `docs/ROADMAP.md`, `docs/OPEN_QUESTIONS.md`, the decisions index, factual pointers in `CLAUDE.md` and the tables here in line, on its own branch, for the lead to merge. It is the single writer of `docs/OPEN_QUESTIONS.md` and runs the zero-loss audit when a lane closes. It never edits decisions, `VISION.md`, `FOUNDATION.md` content or hard rules. It keeps no private state and reports in 150 words or less. Its full duties and limits are in 0034.

## The brief

Every lane gets a written brief containing:

1. The goal and the exact question.
2. The files or area in scope, and what is out of bounds.
3. The hard rules that apply (from `CLAUDE.md`) and recent architectural changes it must know.
4. What is already established or ruled out.
5. The done condition, the stopping rule and, for runs, a run budget.
6. Where the output goes, and a report limit: about 400 words back, with the detail in a file.
7. The lead's session id, and these standing rules:
   - Never set `ask`, `actions` or `blocked` in wrap-up. Questions go to the lead by `SendMessage`.
   - Within the brief, decide with the recommended option and keep going.
   - Never commit, merge or push unless the brief says so. Never touch another lane's files or worktree.
   - End with a section "Findings outside my scope". Write "none" if there are none.
   - If the evidence contradicts the brief, stop and report. A brief's hypothesis is a candidate, not a command.
   - Use PowerShell and the Grep tool, not Git Bash, which times out on this machine's F: drive (lesson L9).

## Running lanes

- **Facts about the world come from a lane, never from the lead's memory.** History, other games, prices, licences: if a design argument rests on it, a research lane sources it first, or the lead marks it plainly as unverified.
- **Experiments in parallel, merges in series.** Lanes that edit code work in their own worktree or on disjoint files. The lead merges one at a time, and a lane re-checks after rebasing.
- **Non-trivial code gets one implementer lane and one separate reviewer lane.** The reviewer covers four lenses in one verdict: canon and decisions, determinism, history, and realism ("would a real commander or president find this absurd?"). Work touching the sensitive-history gate gets a second, separate reviewer for that gate.
- **Work-in-progress limit:** at most four lanes at once (standing lanes excepted), and at most two that move the simulation. Lanes never grow. New findings go to `docs/OPEN_QUESTIONS.md` and are triaged within a day: act now, park, or drop with a reason.
- **Model and effort are set per lane, never inherited by default** (owner's standing rule, 2026-11-14). Pick from this table when starting a lane and say which row in the brief; go up a row only with a stated reason.

  | Kind of lane | Model | Effort |
  |---|---|---|
  | Engine and simulation logic, calibration, determinism, sensitive history, the reviewer of simulation changes | Opus | high |
  | Architecture and design docs, planning across several systems | Opus | medium |
  | Research and source verification, game and history surveys | Sonnet | high |
  | UI and layout, tests, tooling, ordinary implementation, entering data from sources | Sonnet | high |
  | Docs sync, copy edits, mechanical cleanup | Sonnet | medium |
  | Read-only audits, inventories, simple lookups | Haiku or Sonnet | low |

  Upgrade a lane only if it struggles, and say why. Never default everything to the top model: it burns budget without improving routine work. `max` effort is not used for lanes. The lead's own model and effort are the owner's choice in the app. (Table merged from the owner's rule and AWWV's sizing guide, 2026-11-14.)
- **Calibration lanes get a budget of measured runs (default eight)**, then a continue-or-park ruling. One change per measured run.

## Closing a lane

1. Ask it once more for anything it noticed outside its scope, and triage each finding.
2. **Verify before believing.** Check its claims on disk: `git status`, `git diff --stat`, the test run with its exit status, screenshots for UI.
3. Zero-loss check: nothing uncommitted left in its worktree, no unique commits stranded on a branch.
4. **Archive it** as soon as the check passes, without asking (the owner's standing instruction, 2026-11-14). Archiving is reversible.

## Zero work loss

- Never switch branches with uncommitted results. Commit often.
- Never delete a branch with unique commits. Classify squash-merged work with `git cherry`, not `--no-merged`.
- Never commit in another running session's worktree.
- On Windows, never `rm -rf` a folder that may contain a junction (a worktree's `node_modules` junction once wiped AWWV's main checkout). Check for reparse points, and unlink junctions with `cmd /c rmdir`.
- Two long runs never share an output folder. Runs write only to the ignored `runs/` folder, never into tracked files.

## Not adopted yet, and when it comes back

| AWWV practice | Why not now | Trigger to adopt |
|---|---|---|
| Cloud lanes reporting on draft PRs, Linux CI | The repository is public on GitHub since 2026-11-14 (`horkesh/Mandate`); CI comes in Phase 0, and cloud lanes need a cloud environment | When CI is green on GitHub and a cloud environment exists |
| Four separate review seats | One reviewer with four lenses is enough at this size | A merge the reviewer can't settle alone |
| Per-PR ledger fragments | Git history is the ledger here | Never, unless commit messages stop being enough |
| A shared orchestration board for announcements | Few lanes; briefs carry what they need | Five or more lanes at once |
| Git LFS for binary assets | No binary assets yet | The first map art or image asset |
