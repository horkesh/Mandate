# 0059: Tooling: the one-writer scan's gaps, the decisions-index check, a hook that checks the staged tree, and immutable records by type

Status: accepted (2026-11-14). From the tooling batch (`notes/tooling-batch.md`), four small-tooling items from `docs/OPEN_QUESTIONS.md`, approved twice by the standing reviewer. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0052.

## Decision

**The one-writer scan finds writes through casts and their siblings.**
- A grouping parenthesis that mentions an owned key counts as a write when either of these holds:
  - it is followed by an assignment, an increment or decrement, or a mutating call;
  - it is preceded by `delete` or a prefix increment.
- This one rule covers casts, comma expressions, conditionals, `??` and angle assertions.
- The scan also covers:
  - bracket forms;
  - optional chaining;
  - borrowed mutators such as `Array.prototype.push.call`;
  - reflective writes with the key as first argument (`Object.assign`, `Reflect.set`, `defineProperty`).
- The rule can flag a write that lands beside a key. The fix is to rename a local.
- The alias gap (`const c = state.x; c.push(v)`) remains, and the deep freeze in tests is its backstop.

**The decisions index is checked in both directions, in `npm run check` and CI.**
- **Rows against records.** Each index row must agree with its record's Status line: the leading word, and every relation with its number.
- **Forward claims against their targets.** A record that says it amends, refines or extends another must be answered by the target's own Status line. Only a sentence-initial capitalised verb counts as a claim.
- **The relations:** amended, clarified, extended, widened, confirmed, refined, superseded and replaced, each followed by "by" and record numbers. A target that says "replaced by" counts as amended.

**The pre-commit hook checks exactly what is being committed.**
- When the working tree equals the index, the check runs in place. Otherwise it runs in a private snapshot of the index, with links to the real `node_modules` and to the snapshot's own workspace packages.
- The working tree is never touched.
- Cleanup unlinks every link before deleting anything, and refuses any folder that is not a snapshot in the temp folder.

**Immutable records are declared by type name** (`IMMUTABLE_RECORDS`).
- Beside them sit State's set-once root fields (`IMMUTABLE_ROOT_FIELDS`) and `NEVER_REASSIGNED_KEYS`. The scan reads each record's keys from its type.
- Keys must be unique across declared records and distinct from owned keys. That is now checked, not just a convention.
- A new nested record is one line in the declaration.
- **This amends 0052:** its consequences named `IMMUTABLE_STATE_KEYS`, which this replaces.

Rejected:
- **Normalising casts away with a regex.** Types nest and contain parentheses.
- **Parsing TypeScript.** TypeScript 7 has no stable compiler API (0044).
- **Checking index rows only against their own records.** Drift starts in the forward direction: 0033 amended 0026 without 0026 saying so.
- **`git stash --keep-index` in the hook.** The stash stack is shared by every worktree and session, so a pop can restore another session's entry, and a failed restore loses work.
- **Relying on CI per commit.** CI checks only the pushed tip.
- **Refusing a dirty working tree.** It blocks ordinary partial commits.
- **Inferring immutable records from reachability alone.** A nested record added by mistake would silently become immutable.

## Consequences

- The check found real drift, now fixed:
  - 0003's row now says "replaced by 0024";
  - 0017's row gains "amended by 0026";
  - 0026's Status now answers 0033;
  - 0008 and 0015 now answer 0032.
- A test that shells out to git cannot run inside the hook's snapshot, which has no `.git`. Such tests skip there and run in place and in CI.
- `CLAUDE.md`'s command list gains `npm run check:decisions` in the steward's sync.
