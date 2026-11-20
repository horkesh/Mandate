# S13: August 1861–November 1862 situation drafts

Work in progress, 20 November 2026. Branch `sprint/situations-1862`, base `33cc7d4`. Only S13 is authorized. `npm ci` completed first: exit 0, 51 packages, zero vulnerabilities.

The delivery covers catalogue S22–S57, including stages whose first cause falls inside the window. December 1862 stages remain outside it. All authored content, strings, source declarations and proposed policy rows stay under `packs/union-1861/situations/drafts/`; no signatures or live pack inputs change.

The draft check will parse each item independently against the existing schema and semantic validator, resolve its strings and source declarations in an in-memory overlay, and run the gate. Unsigned content and held topics remain explicit review blockers. No checker result authorizes loading a draft in the game. Test controls will demonstrate that malformed content and missing evidence still fail.

Before each commit: focused loader and preservation checks, then the real pre-commit hook. The hook's full check is required even for data. Expected cost: a few minutes per coherent batch; stop after an unexpected failure, retain its log, diagnose all failure categories and verify the correction with focused checks before another hook.

Required final validation: `MANDATE_NO_GIT=1 npm run check` and one default `npm run run:done-check`. First establish that the live pack loads and the draft tests pass. Expected cost: several minutes for the check and approximately 30–40 minutes for the eight-seed done check. Pass criteria are the existing checks and unchanged budgets; inherited failures are reported, never tuned away. No repeated campaign without a new question. Logs and source readings live outside worktrees in `C:/Pyrrhic/mandate-research-sources/S13/`.

Proposed rulings [I], to be finalized against the evidence: preserve unsupported alternatives as explicit holds; separate a historical document from a policy choice; use State/received reports for causes, and disclose missing 1B owners instead of inventing State or applying effects to them. The alternative of calendar-only notices is rejected wherever a causal predicate exists.

## Findings outside my scope

Whole-branch standing review, gate placement/wording/signatures, missing 1B owners and baseline integration remain with their existing owners. No other sprint branch is written.
