# Lane 0.7l: Git LFS for `art/`

Branch `art-lfs`, from main at d183416. It turns Git LFS on for the game's binaries before Codex's first delivery (R1, two pilot textures into `art/_pilot/`) is committed. This follows `docs/design/ASSETS.md` section 0.7 and the Git LFS row of `docs/LANES.md` ("Not adopted yet").

## What is in place

| Piece | Where |
|---|---|
| LFS patterns for `art/**/*.{png,webp,jpg,wav,ogg,flac,ttf,otf,woff2}`; the repository's own lines kept; recipes and notes stay text | `.gitattributes` |
| LFS's `pre-push`, `post-checkout`, `post-commit` and `post-merge`, in the committed hooks folder (`core.hooksPath` is `.githooks`), each failing loudly (exit 2, with what to do) when git-lfs is missing | `.githooks/` |
| The pre-commit hook: first `tools/lfs-check.ts --staged`, then the check exactly as before | `.githooks/pre-commit` |
| The check: under `art/`, a path an LFS pattern covers must be an LFS pointer, and any other file must not be binary | `tools/lfs-check.ts` |
| CI: both checkouts state `lfs: false`, and a step runs the check on the pushed tree (`--tree HEAD`), so a `--no-verify` commit is caught | `.github/workflows/ci.yml` |
| Tests: the patterns, the matcher, the check's passes and refusals, the hooks' text and executable modes, and CI's checkouts | `tools/test/lfs.test.ts`, `tools/test/ci-workflow.test.ts` |
| One line each | `CLAUDE.md`, ASSETS.md section 0.7 |

## Why the check reads git's blobs, not files

In a working tree, an LFS file is smudged back to its binary. So is the pre-commit hook's private snapshot, which `git checkout-index` writes. Only the stored blob tells a pointer from art that went into plain git. That is also why the check runs in the hook before the snapshot, and in CI as its own step: the snapshot is not a repository, so it cannot run inside `npm run check`.

## The scratch-clone proof

See the report (the commands and their output) for this lane's head:
- in a clone of `art-lfs` with the repository's hooks, a PNG added under `art/_pilot/` became an LFS pointer and was committed through the full pre-commit hook;
- a PNG forced into plain git (the LFS filter switched off for one `git add`) was refused by the pre-commit hook;
- nothing was pushed, and the clone was deleted.

## Choices made

1. **Hooks committed in `.githooks`, not written by `git lfs install`.** *Rejected:* letting `git lfs install` write them, which with `core.hooksPath` set writes into the committed folder anyway, with no review and no message about this repository.
2. **The check refuses any binary under `art/`, not only the listed types.** *Rejected:* checking only the LFS patterns, which would let a new format (a `.psd`, a `.gif`) slip into plain git.
3. **CI checks the pushed tree as a step of its own.** *Rejected:* a vitest test, which cannot read git inside the pre-commit snapshot.
4. **CI fetches no LFS objects at all, stated as `lfs: false` and pinned by a test.** Fetching waits until a build or test needs the art (ASSETS.md 0.7).

## For the lead

1. When Codex's R1 lands, commit it on a branch from a clone where `git lfs install --skip-repo` has been run. The hook refuses it otherwise, with the fix in its message.
2. The repository's LFS budget stays at $0 (ASSETS.md 0.7). That is the owner's account setting; nothing here changes it.
3. Lane 1.13's CI edits (the M2 steps removed) and this lane's (the `lfs_check` step and `lfs: false`) touch the same workflow. Whichever merges second needs main merged in. The edits sit in different places, so git should merge them cleanly.

## Findings outside my scope

- None.
