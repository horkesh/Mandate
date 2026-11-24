# S139 verification packet

- `input-fingerprints.json`: 512 frozen runtime inputs and the measurement tool.
- `baseline-receipts.json`: exact S134 baseline bytes checked against its committed inventory.
- `battle-comparison.json` and `battles.md`: every changed battle, both sides and sets, unknowns and outcomes.
- `operation-history.json`: the final run's complete observed operation records.
- `validation.json`: every done-check criterion, replay/resume/hash controls and timings.
- `projection-proof.json`: two own-combat derivations; no classifier or finding-baseline change.
- `pre-hook-result.json`: zero new zeros; local budget failure retained.

The hand-over is `notes/sprint-S139-tasks.md`. Raw logs, stopped attempts,
rejected-candidate evidence and the eventual ordinary-hook receipt remain in
`runs/s139/`. Only the final corrected capture verifies the staged source.
No calibration sweep, acceptance/band adjustment, signature or push.
