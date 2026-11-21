# Evidence for S26

The [report](../2026-11-21-canon-against-code.md) is the hand-over. This directory contains audit evidence, not production fixes or adopted canon. All commands run from the worktree root after `npm ci`.

| File | Purpose |
|---|---|
| `baseline.json` | Pinned branch/main commits, installation result and SHA-256 of all 1,673 original tracked files. |
| `decision-coverage.json` | All 92 records from 0015 through 0106; 91 accepted, one explicitly superseded. Representative implementation anchors are navigation, not proof of every promise. |
| `report-references.json` | Exact source lines for the report's distinct file/line citations. |
| `ownership-sites.json` | Existing ownership scanner's declarations, detected write sites and verdicts. The report states its semantic limits. |
| `probes.json` | Nine controlled observations supporting A01–A05 and A08–A10. A04 has both vacancy and private-intelligence observations. Assertions confirm the defect; an exit 0 does not certify correct production behavior. |
| `hook-recovery.json` | First actual hook setup timeout, unchanged isolated verification, separately checked unreached gates and bounded retry plan. |
| `check-result.json` | Exit and duration of the required no-git check. Its known expected failure remains M05. |
| `runtime-verdict.json` | Complete criterion verdicts and compact diagnostics from the one default done-check campaign, including failures. |
| `situation-causes.json` | Live situation inventory retained for precedence/classification limits, not new gate clearance. |
| `source-preservation.json` | Final cheap source, citation, finding-list and write-scope checks. |

Local reproducer programs are retained in the ignored raw folder; executable programs are not part of this report-only commit. Their commands in this worktree are:

```powershell
node --import tsx docs/audit/runs/s26/ownership.ts
node --import tsx docs/audit/runs/s26/probes.ts
python docs/audit/runs/s26/verify-audit.py --final
```

`ownership.ts` imports the repository's scanner and ownership declarations. `probes.ts` uses fictional fixtures for controlled changes; its two real-pack cases check a provenance alias and a received office notice. Its World mutation is restored in memory; no pack file is written.

The required full check was `MANDATE_NO_GIT=1 npm run check` (PowerShell: set `$env:MANDATE_NO_GIT='1'` first). The actual commit hook subsequently runs its own staged-tree check. Neither expected failures nor conditional stopwatch skips are treated as acceptance.

`docs/audit/runs/s26/run-done.ts` is the local adapter for the single expensive campaign. `--preflight` checks workspace links without starting it. The normal invocation uses the repository defaults: all reference/exercise/history runs, eight sweep seeds, unchanged horizons and budgets, then drafting. It writes raw output under ignored `docs/audit/runs/s26/`. The campaign is retained rather than repeated for reassurance; no Linux/Windows cross-host equality is claimed from a local run.

Large saved States, complete runtime diagnostics, logs and the hook receipt stay locally under ignored `docs/audit/runs/s26/`. The final runtime verdict inventories their sizes and hashes. The final CODEX append records the actual commit and hook result because a commit cannot include its own subsequent hook receipt.
