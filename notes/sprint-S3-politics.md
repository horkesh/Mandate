For the lead: 3 items

# S3: Congress, politics and the 1862 midterms

Research in progress, 2026-11-20. Branch `sprint/research-politics`, base `ceff796`. Docs only; no pack, engine, gate signature or other lane changes. Decision 0106 governs commits and deferred review.

## Work and verification plan

1. Read the coordination rules, 0106, the existing politics research and the 1B scope. Run `npm ci` before committing.
2. Retain primary scans and their provenance in `C:/Pyrrhic/mandate-research-sources/S3/`. Read the relevant pages; distinguish printed pages from digital leaves. Check OCR against scans for quantitative tables.
3. Document Congress's calendar, acts and votes, parties and political disputes. Reconstruct state election results and distinguish returns known by November 1862 from the completed 38th House. Propose, rather than implement, checkpoint bands.
4. Extend into state elections, governors, soldier voting and the press. Mark interpretations [I] and leave unsupported cells on HOLD.
5. Check citations, arithmetic, links, source inventory, scope and whitespace cheaply before the required project checks. Run `MANDATE_NO_GIT=1 npm run check` through the commit hook and one required `npm run run:done-check`. Expected cost: several minutes for the hook and roughly twenty minutes for the done check; no simulation behavior changes are expected. Pass criteria: each required gate's own exit and counts, with inherited failures retained rather than repaired outside S3. Stop expensive retries after an unexpected failure; diagnose from retained logs and reuse unaffected evidence.
6. Commit coherent documentation steps through the hook, never push. Read the shared main-checkout CODEX.md fresh and append one final UTF-8 status without changing its existing prefix.

## Proposed rulings

1. [I] Keep the 37th serving through November and treat the midterms as returns for its successor; reject seating the 38th on election night.
2. [I] Prefer the direct Globe's 60–48 first-confiscation House tally over McPherson's conflicting 61–48; reject averaging them.
3. [I] Preserve local election labels and separate actual authority, policy implementation and attributed political responses; reject one national support scalar inferred from seats.

All bands and representation choices remain proposals for the lead. Election scheduling and state arithmetic are being checked before the second documentation step.

## Verification evidence so far

`npm ci` exited 0 (51 packages, no vulnerabilities). Typecheck, boundary, licences and decisions preflights exited 0. External logs are under `C:/Pyrrhic/mandate-research-sources/S3/`.

The required `MANDATE_NO_GIT=1 npm run run:done-check -- --label s3-baseline` exited **1** on unchanged code and packs. Phase 0 behaviour, hash, resume, liveness and section-ten passed; the budget failed (Union median 91.83 ms, p95 169.05 ms). Reported 1A checkpoint, operation, pushback and lever-sweep criteria also failed; unknown-strength and stand-ins passed. Every category is retained in `done-check.log`; no expensive retry or out-of-lane calibration is authorized by S3's docs-only work. The hash references were `55a35b1034c19b09` (Union) and `69d8759b02cfa93f` (testbed). Hook checks remain required for each commit.

## For the lead

1. Review the research and proposed checkpoint definitions after the sprint.
2. Route sensitive-history material to the gate reviewer; no wording or placement is signed here.
3. Keep later elections separate from information available at the November checkpoint.

## Findings outside my scope

The earlier politics note mixes several national party counts and includes snippet-only claims. S3 will supply a page-backed replacement for its 1861–62 election and legislative material without treating its unsourced claims as evidence.
