# S148 evidence

- `battle-comparison.json`, `battles.md`: every changed battle and both complete records.
- `checkpoint-bands.json`, `bands.json`: every checkpoint row and all liveness/historical bands, criteria and residuals.
- `validation.json`: exact replay/resume/hash controls, new-zero comparison and local S146/S148 timings.
- `baseline-receipts.json`: pinned recapture exactly matches the retained S146 summary.
- `input-fingerprints.json`, `preservation.json`: runtime inputs and retained S139/S145/S146 sources.
- `projection-proof.json`: only S139's certified own-task readers added; principal/view identities unchanged.
- `operation-history.json`: all observed candidate operation records.
- `capture-source.ts.txt`, `analysis-source.py.txt`, `checkpoint-source.ts.txt`: exact evidence collectors; paths resolve when restored into `runs/s148/`.

Hand-over: `notes/lane-s148-merge.md`. Raw logs, exits, full captures, pinned
snapshot and final hook/commit receipt: `runs/s148/`. No sweep, band change,
hosted acceptance, signature or push is claimed.
