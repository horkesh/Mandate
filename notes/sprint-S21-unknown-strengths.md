# S21 unknown-strength research

S21 only, branch `sprint/research-military`, from `73d6b7af81213fec8377907c7db4d9692792f7ef`. Draft research; no active input, checkpoint, runtime or signature change. Sources and working evidence remain under `C:/Pyrrhic/mandate-research-sources/S4/S21/`, reusing the retained S4/S14 scans in place.

## Work and verification plan

1. Freeze the 203 S14 unknown IDs. Read dated returns and battle reports, starting with the 1862 battle formations; retain page-level evidence and record each row's search and disposition.
2. Give a number only with its source measure and date. Preserve estimates as estimates. Do not distribute army totals, derive strengths from casualties or multiply regiment counts. Nearby returns stay dated observations rather than asserted battle-day strengths. Unresolved rows remain empty with searched pages and next source recorded.
3. Update the existing draft rows and companion observations in coherent batches, keeping every original ID and the 213 original numerical observations. Keep gated material unsigned. Commit each batch through the configured hook, with the Codex footer; never push.
4. Before expensive validation, check CSV joins, citations, dates/measures, UTF-8, allowed paths and dependency resolution. Question: does research preserve the existing runnable baseline and project gates? Commands: `MANDATE_NO_GIT=1 npm run check`, one default `npm run run:done-check`, and each mandatory commit hook. Pass: exits 0 with all criteria reported; inherited failures stay failures. Expected cost: minutes per hook/check and about 20–35 minutes for the eight-seed done check on the shared host. Stop on unexpected failure, inspect every category, verify any correction cheaply and repeat only the affected required command when new evidence justifies it. No build or additional campaign is planned. Reuse S14's unchanged active-input evidence explicitly; do not treat it as a waiver of this run's required commands.
5. Finish inventories, runtime diagnostics and preservation checks before final documentation. Read main CODEX fresh and append one UTF-8 status, preserving its prior bytes. Whole-branch review and gate review remain Claude's after the sprint under 0106.

## Current batch

Eastern first pass: 108 original unknown rows researched, 26 quantified observations and 82 still unknown. Quantities include rounded reports, two source reconstructions and three upper bounds; they are not 26 exact battle-day duty returns. The row register and research note record their dates, measures and limits. Western, coastal, naval and remaining dated-command rows are next. Dependencies and typecheck pass; the single required done check is running. Final source inventory and checks will follow the settled evidence.

## Findings outside my scope

S14's non-overlapping application, cast/service joins, unsupported battle checkpoint kinds and inherited runtime failures remain with their implementation owners. Unknowns remain integration holds, not zero manpower or an acceptance waiver.
