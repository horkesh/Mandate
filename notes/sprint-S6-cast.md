# S6: 1B cast research

For the lead: 3 items. In progress on `sprint/research-cast`, based at `ceff796`, 20 November 2026. Docs only. No pack apply or signed gate work.

1. Read the standing, command-line and writing rules in the main checkout's CODEX, the sprint brief, 0106, 0085, 0087 and 0097, the research briefs and lane rules. `npm ci` completed successfully (51 packages, no vulnerabilities). Sources and command logs belong in `C:/Pyrrhic/mandate-research-sources/S6/`.
2. Research the named Union and Confederate commanders, Stanton, Confederate cabinet changes and governors. Deliver dated notes and seven-column apply-format judgment rows under `docs/research/`. Each positive judgment needs a read contemporary document and printed page. Separate 1B observation dates from the existing March/July 1861 admissibility boundaries. HOLD unsupported cells. Every mapping to a band or trait is [I].
3. Verification plan: first check CSV shape, identifiers, citations, dates, source hashes and doc-only scope. Then run the required `MANDATE_NO_GIT=1 npm run check` and one default done check, retaining full logs outside the checkout. The question is whether unchanged runtime checks pass at this branch base; pass means exit 0 with all existing criteria reported. Expected cost: several minutes for check and about 20 minutes for the done check. Stop after the first unexpected failure, inspect all retained failure categories and report an out-of-scope baseline failure without tuning code. The pre-commit hook remains mandatory for each coherent commit. No build or extra campaign is planned.

## Proposed rulings

- Pending research: S6 rows are research proposals, not an instruction to run the current apply against 1861 starting data. Reject silently moving 0085/0087's accepted boundaries.
- Independent review is deferred to the sprint's review under 0106. No author sign-off is substituted.

## Remaining work

Read and retain primary pages, complete the cast and governor coverage, audit the row recommendations, run required checks, commit through the hook and append one status to CODEX after reading it fresh.

## Findings outside my scope

- The current apply enumerates rs1-rs14. S6 uses the same row schema but must be opted into by the owning data lane after review, with temporal eligibility preserved.
