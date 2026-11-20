# S25: kernel mutation survey

Starting point: `sprint/checks`, `39c279c`. S25 only; production sources are read-only. Decision 0106 defers independent review until after the sprint.

## Plan and acceptance

Survey the kernel's executable modules, beginning with knowledge, view, seats, tick/orders, tick/verbs, combat and people. Inject bounded single-line comparison and arithmetic breaks in Vite's input, never in production files. The manifest records each exact operator, expression, source hash and line. Run each module's existing suites first; a survivor requires a passing run with proof that the loader applied the mutation. Invalid runs and unexercised sources are not kills.

Add a regression for each non-equivalent survivor, prove it passes on unchanged code and fails on that mutation, and commit tests by module through the existing hook. Preserve the existing assertions and all production inputs. A finite survey measures its named mutations, not every possible break.

Validation: prerequisite and loader smoke checks, per-module baselines, then the fixed manifest (at most 240 mutations; expected 30–90 minutes on this shared host). Stop expensive retries on startup, fixture or infrastructure failure; diagnose and verify cheaply before resuming. Final checks are `MANDATE_NO_GIT=1 npm run check`, each required commit hook, and one default `npm run run:done-check` (expected 20–45 minutes). The unchanged S18 runtime evidence remains relevant but does not waive that required run. Do not calibrate, widen a band or change a timeout. Retain exits, logs and inventories in `runs/s25/`.

## Proposed rulings

1. Use an in-memory Vite transform rather than editing and restoring live sources. This preserves production bytes even if a run is interrupted. Reject transient source edits and a second checkout with ambiguous workspace links.
2. Exercise a fixed, documented sample across executable modules rather than claim exhaustive mutation coverage. Report equivalent or invalid candidates separately; they cannot count as killed rule breaks.

## Progress

The fixed manifest contains 229 mutations across 32 groups. All group baselines pass; knowledge's expanded baseline includes its report/template tests in `seats-log.test.ts`. The generator and driver are `packages/kernel/test/support/s25-survey.mjs`; run `node packages/kernel/test/support/s25-survey.mjs list`, then `baseline`, then `run`. Mutation runs retain an application receipt, JSON assertions and a log. An `after` run uses the new module regression file alone, proving that the added tests supply the kill.

Knowledge: ten candidates, four existing-test kills and six raw survivors. Three survivors are rule breaks: an empty control table loses its explicit zero claims, maximum-age reports expire early, and midnight reports are rejected. Six new assertions pass on real code; all three mutations fail on their new regression. The other candidates are equivalent in the supported domain: `knowledge-01` is guarded by unequal stamp days; `knowledge-07` sorts fixed, distinct report-kind keys; `knowledge-02` can tie only on the same immutable report identity/stamp/arrival, and generated government reports supply one government claim per region. This last classification assumes the producer invariant; contradictory duplicate government claims in a single report have no defined first/last precedence and are not claimed tested.

## Findings outside my scope

The S18 production classifications and existing runtime acceptance failures remain with their owners. No production fix is authorized in S25.
