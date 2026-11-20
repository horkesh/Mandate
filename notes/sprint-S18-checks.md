# S18: rules that matter become checks

Worktree `C:/Pyrrhic/sprint-checks`, branch `sprint/checks`, base `79bd9d6`.
`npm ci` ran first, exit 0, zero vulnerabilities. Scope: validators, fixtures and hook wiring only; production findings remain unchanged.

Validation plan: fail each fixture against an inert checker, implement the check, then pass the fixture and typecheck before each real commit hook. Four separate check commits. Run the default eight-seed done check once (normally 20–35 minutes), retaining all categories; no expensive retry without a reproduced correction. Claude reviews the whole branch after the sprint under 0106.

## Proposed rulings

- Existing findings use exact fingerprints in `tools/rules/existing-findings.json`. A new or edited defect fails; a removed finding requires deleting its stale entry. Reject broad path exclusions, weakening the check, and fixing production in this lane.
- Treat every date-only branch and railroad label as requiring an explicit cited premise/outside-model exemption. Reject trusting a free-text railroad label to establish that no cause exists in State. This is a conservative authoring gate, not natural-language inference.

## Checks

1. B2: date-only/railroad situations, including drafts, with exact cited exemptions. Fixture evidence: `runs/s18/01-red.log` and `01-green.log`.
2. Projection truth: pending.
3. Liveness commit cause and `around(observed)`: pending.
4. Signed situation hash: pending.

## Findings outside my scope

Pending the pinned main audit. No production correction is authorized in S18.
