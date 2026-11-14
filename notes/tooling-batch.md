# Tooling batch hand-over: scanner gaps, the decisions index, the pre-commit hook, immutable records

Branch `tooling-batch` (worktree `.claude/worktrees/phase0-control`), on top of f18b073. Four items from `docs/OPEN_QUESTIONS.md`'s small-tooling group, one commit each (plus one comment fix), every commit through `npm run check`.

## What changed

| Item | Where | Commit |
|---|---|---|
| 1. One-writer scan: casts, `delete` through a cast, and siblings | `packages/kernel/test/support/one-writer.ts`, `one-writer.test.ts` | e7fed73 |
| 2. A decisions-index check in `npm run check` and CI | `tools/decisions-index.ts`, `tools/check-decisions-index.ts`, `tools/test/decisions-index.test.ts`, `package.json`, `.github/workflows/ci.yml` | b59b7bb |
| 3. The pre-commit hook checks exactly what is being committed | `tools/staged-check.ts`, `.githooks/pre-commit`, `tools/test/staged-check.test.ts` | fb7c89b, db9f438 |
| 4. Immutable records declared per record, not per key | `packages/kernel/src/ownership.ts`, the scanner, `one-writer.test.ts` | 2e9537e |

## Choices, with what was rejected (for a decision record)

1. **A write through a parenthesised target is found by asking whether the group mentions the key**, not by parsing casts. A grouping parenthesis (not a call or control head) that is followed by an assignment, `++`/`--` or a mutating call, or preceded by `delete` or a prefix `++`/`--`, and that mentions an owned key, is a write. That covers casts, comma expressions, conditionals, `??` and angle assertions at once. It can flag a write that lands beside the key; the price is renaming a local. *Rejected:* normalising casts away with a regex (types nest and contain parentheses); parsing TypeScript (no stable compiler API in TypeScript 7, decision 0044).
2. **Siblings closed with it:** `delete` through a receiver cast and bracket forms of increment, delete and mutating calls; optional chaining (`x.key?.push(v)`); a borrowed mutator (`Array.prototype.push.call(x.key, v)`); reflective writes with the key as the first argument (`Object.assign`, `Reflect.set`, `defineProperty`), which the banned-API scan forbids only in deterministic packages while the CLI is not one. Comma expressions and optional chaining were the two the lead named; both covered.
3. **The decisions index is checked in both directions**: the row against the record's Status line (leading word, relations such as `amended by 0040` with their numbers), and a record that says "Amends 0017" against the target's own Status. Only the sentence-initial capitalised verbs count as forward claims, since prose such as "extends 0031's sourcing rule" is not a claim about the target. A target that says "replaced by" counts as amended. *Rejected:* checking rows against records only (the forward direction is how drift starts: 0017's row lacked the note its own record carried, and 0033 amended 0026 without 0026 saying so).
4. **The pre-commit hook runs the check in place when the working tree equals the index, and otherwise in a private snapshot of the index.** The snapshot is `git checkout-index` into the temp folder with a `node_modules` of links to the real one, except the workspace packages, which link to the snapshot's own copies (npm's workspace links are junctions with absolute targets into the working tree, so linking the whole folder would test the unstaged packages). The working tree is never touched. *Rejected:* `git stash --keep-index` and restore (the stash stack is shared by every worktree and session here, so a pop can restore another session's entry, and a failed restore loses work); relying on CI per commit (CI runs the pushed tip only and `cancel-in-progress` drops earlier runs of a branch, so it does not check each commit); refusing a dirty tree (it blocks the ordinary partial commit).
5. **Cleanup cannot delete `node_modules`.** It unlinks every link first, deletes nothing if one remains, refuses any folder that is not a snapshot directly inside the temp folder, and a failed cleanup only leaves a temp folder behind (docs/LANES.md: a junction once wiped AWWV's main checkout).
6. **Immutable records are declared by type name** (`IMMUTABLE_RECORDS`, 15 now), with State's set-once root fields (`IMMUTABLE_ROOT_FIELDS`) and `NEVER_REASSIGNED_KEYS` (`id`) beside it; the scan reads the keys from the types. The derived keys equal the old 69-key list exactly. Keys must still be unique across declared records and distinct from owned keys, because the scan matches by name, and that is now checked rather than a convention. *Rejected:* deriving the declaration from reachability alone (a nested record added by mistake would silently be immutable; one line to declare it is the prompt to think); a per-record marker comment in each type (a second place to keep in step).

## Real drift the index check found, fixed in `b59b7bb`

- **0003:** the row said "test amended by 0024"; the record says "replaced by 0024". The row now says replaced.
- **0017:** the record says "Amended by 0026"; the row lacked it. The row now has it.
- **0033 and 0026:** 0033 says "Amends 0016 and 0026", but 0026's Status said nothing back. **I annotated 0026's Status line and row with "Amended by 0033"**, a bookkeeping change to a decision record. If 0033's "Amends 0026" was wrong, revert that annotation and fix 0033 instead; the check stays green either way as long as the two agree.

## Findings outside my scope

1. **Decision 0052 says** nested records' "keys are listed in `IMMUTABLE_STATE_KEYS`". That list is gone: it is now `IMMUTABLE_RECORDS` (declared by record type). A word in 0052's consequences, for the lead.
2. **`CLAUDE.md`'s command list** wants `npm run check:decisions`, and its "pre-commit hook" remark can say the hook checks the exact staged tree (the steward's sync).
3. **A test that asks git a question** cannot run inside a snapshot (no `.git`): the hook's executable-bit test skips there, and runs in place and in CI. Any future test that shells out to git needs the same.
4. **Lane 0.1's alias gap remains** (`const c = state.x; c.push(v)`): the deep freeze in tests is its backstop (`tick/freeze.ts`).
