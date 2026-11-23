# S85 evidence

Handover: [lane-s85-perf.md](../../../notes/lane-s85-perf.md).

- `sender-view.json`: first optimization, direct and alternating timings, exact
  reference comparisons and regression checks.
- `menu.json`: second optimization, the two existing fingerprint updates and
  exact protected readers, plus the failed writer check and equivalent rename.
- `report-filter.json`: third optimization, both routing controls, all samples
  including the unreliable history parent timings, and exact references.
- `verification.json`: baseline and final full CI-style suites, no-skips proof,
  the normal eight-seed standalone check with every 1A problem, replay/resume,
  frozen S82 non-clock comparison, source preservation and independent review.
- `profiles.json`: final cold CPU sample rankings. The old/current baseline
  attribution and their limits are retained in `verification.json`.

Raw profiles, exact source snapshots and Git-blob proofs, daily summaries,
logs, exits, failed/rejected witnesses and staged recovery patches remain in
`runs/s85/`. Normal standalone saves/summaries and drafting are in
`runs/s85-done/` and `runs/s85-done-drafting/`.

This packet precedes the final commit hook. Its actual result and commit are
recorded in `runs/s85/commit-final.*` and the sole main-checkout CODEX status.
The evidence establishes local Windows results; hosted Linux CI remains with
the lead's subsequent push. No threshold, test selection or workload changed.
