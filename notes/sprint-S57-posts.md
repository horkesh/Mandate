# S57: 1B people and posts

Research draft, 22 November 2026. S57 only, `sprint/research-cast`, from `ddc5cb7`. Documents only; no live pack, existing research row, source admission, gate signature or accepted decision changes.

## Work and validation plan

1. Read the civil-office succession evidence and draft the two cabinets, War and Navy leadership, and general-in-chief transitions.
2. Read dated command instruments and register entries for army and department changes, promotions, resignations, wounds and deaths in 1 August 1861–30 November 1862. Separate an order from its receipt and execution; preserve conflicting dates and unresolved identities.
3. Retain cited scans and page-index evidence in `C:/Pyrrhic/mandate-research-sources/S6/S57/`, with URLs and SHA-256. New tables are additive; S6, S12, S22, S38 and all earlier tracked files stay unchanged.
4. Run focused scope, CSV, citation, source-hash and preservation checks before each coherent commit. Run the required `MANDATE_NO_GIT=1 npm run check`, each actual pre-commit hook, and one default done check. Preflight typecheck and opening tests reject a bad runtime before the campaign. Expected cost: minutes per suite/hook, roughly half an hour for the done check; no unchanged campaign repeats. Stop expensive retries after an unexpected failure, retain all categories, diagnose cheaply and report inherited failures without tuning.

Root `npm ci` passed: 51 packages, zero vulnerabilities. Raw logs and validation exits remain in the external S57 folder. Progress and final receipts will be recorded here as the evidence settles.

## Civil-office step

The first batch supplies 55 civil-office/general-in-chief rows and 29 cited scans (26,971,265 bytes). The focused audit passes CSV shape, event IDs, day validity, citations, scan hashes, S57-only write scope and preservation of all 1,743 original tracked files. No existing row changes.

Preflight typecheck and ten opening tests passed. The initial required check used default parallel workers and timed out in `done-check.test.ts` setup at its unchanged 300-second bound: 136 files passed, one failed suite; 1,516 passed, one expected failure, 17 skipped. Boundary, licences and decisions, not reached by the failed chain, passed separately. A targeted run of that file with the requested `VITEST_MAX_WORKERS=1` passed. All actual hooks use one worker and the standing `MANDATE_NO_GIT=1`. No timeout or assertion is changed. The failed run is retained; unaffected tests are not rerun separately. The actual hook remains required for each commit.

## Proposed rulings [I]

Use separate event rows for nomination, confirmation, rank, command assignment, assumption, relief, resignation request, acceptance, wound and death. Reject treating one date as all of these acts, inferring a whole tenure from one dated signature, or replacing prior research rows. Nothing is applied.

## Findings outside my scope

Whole-branch review, gate review, source admission, temporal rules, implementation and integration remain with the lead after the sprint under 0106. No sign-off is supplied.
