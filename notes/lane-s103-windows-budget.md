# S103: the Windows done-check budget option

For the lead: 2 items. S103 only, `C:/Pyrrhic/sprint-july`, branch `sprint/july`, from `8e03e2050560d8260d2abc68274cc7ddaff1bb6d`. The commit and its actual hook receipt are recorded in the sole main-CODEX status and `runs/s103/commit.json`. Headless only; no push, history rewrite, hook bypass, signature, other worktree write or S102 work.

## Delivery

`--budget-advisory` leaves the budget criterion, its FAIL/PASS result, evidence, problems, timing table and `criteria.json` intact. It removes only that criterion from the exit decision. Every other Phase 0 criterion still binds; `--milestone 1a` still binds all six 1A criteria. Default local runs bind the budget. Scoring, thresholds, simulation and packs are unchanged.

CI passes the option only when the matrix OS is `windows-2025`. Both platforms retain the complete done-check output in the job summary. Bash pipefail and an explicitly retained status preserve failure through `tee`. The Linux timing step and its no-skips check are unchanged; determinism summaries keep their existing paths.

0117 is copied byte-for-byte from the lead's accepted record. 0115 and the index carry its reciprocal clarification link. Existing 0116 is retained unchanged.

## Evidence

- Red: 4 expected failures, 24 passes, exit 1 (`runs/s103/red.log`).
- Green: 28 tests pass across the CLI and workflow files, exit 0 (`green.log`). CLI tests execute the entrypoint with a planted 80 ms median/320 ms p95 through the real budget scorer and inspect its exit call, text and complete JSON report. Expensive simulation and file writes are replaced. Every other criterion has a failing control, including binding 1A.
- Typecheck and 117-record decision check: exit 0 (`typecheck.log`, `decisions.log`).
- Required standing `MANDATE_NO_GIT=1 npm run check`: exit 0, 245 files, 2,205 tests passed, three expected timing skips; rules, boundary, licences and decisions pass (`standing-check.log`).
- Final inventory and preservation receipts precede this handover in `runs/s103/`. All 2,533 original paths survive; only five original files change. The hook and simulation inputs remain intact.

No reference or CLI campaign rerun: S103 expressly requires none; unchanged S100 reference evidence remains applicable. No new historical, timing or milestone verdict is claimed. The ordinary commit hook remains required after this handover.

## For the lead

1. Proposed ruling [I]: retain this explicit option and truthful failed budget reports under 0117. Rejected alternatives: marking budget PASS, suppressing other failures, or changing local defaults by detecting the platform.
2. Push and hosted CI verification remain with the lead; formal branch/gate review remains deferred under 0106/0107.

## Findings outside my scope

S102; inherited unmet 1A criteria recorded by S100; hosted Linux/Windows execution; formal review, signatures, main integration and release.
