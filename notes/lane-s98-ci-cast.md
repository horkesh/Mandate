# S98: isolated CI timing and accepted cast evidence

2026-11-23. Scope: S98 only on sprint/july from 2ff6e9d8.

The fixed plan is two implementation commits through the unchanged hook, then exactly one normal eight-seed done check with --milestone 1a. Run selector/provenance/startup checks first; then one reference capture (120 testbed and 148 Union days with replay/resume), account for every hash/counter and coverage row, and review any failed band individually. Expected costs: about 2–4 minutes per hook, 1–3 minutes for isolated timing, 1–3 minutes for references, and 15–25 minutes for the full done check on this shared Windows host. Stop an expensive retry after an unexpected failure; retain evidence, diagnose all failure categories and verify any correction cheaply first. No budget/threshold, source-policy, coverage-matcher or simulation-rule change is authorized.

CI follows 0115: the parallel suite has no MANDATE_TIMING; the three existing stopwatch files run serially on Linux, with no other file sharing the done-check measurement. The unchanged no-skips checker positively requires all three timing assertions; its input is the isolated timing report. The summary records the actual timing-step outcome. 0114 is copied from main solely to close the mandatory decision chain before 0115; 0016 and 0106 have their reciprocal links. No S96 implementation is included.

CI step committed through the unchanged hook as `fa047a19`: 241 files, 2,167 tests passed and five inherited timing-gated skips. The local isolated timing run executed 51 tests with zero skips; 50 passed and the unchanged history budget failed at 64.2 ms median /172.9 ms p95 on this shared Windows host. No retry or hosted-Linux pass is claimed.

The cast application and evidence are prepared in `docs/audit/s98-evidence/`: all 110 original/draft actions, production page/date provenance, preserved source limits and original-chain holds. The 12 failing Union bands were reviewed individually from the single reference capture. Fifteen append-only records implement seven positive recentres, five new Union quiet transitions and three testbed wording corrections; the exact eight zero-count records are fingerprint-bound. All five live controls and 324 rejudged saved band rows pass. The cast/band hook and the single binding done check remain pending. Formal standing/whole-branch and gate reviews remain deferred under 0106/0107; nothing is signed or cleared for main.

## Findings outside my scope

S96, material call terms, remaining source originals, main integration, signatures, publishing and pushing.
