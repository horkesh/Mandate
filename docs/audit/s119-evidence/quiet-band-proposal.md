# S119: three quiet-band transitions awaiting a ruling

The corrected Union capture preserves replay/resume and0rejections, but the liveness gate still fails these three terms. Existing `tools/rules/liveness-causes.ts` permits zero only for exact previously accepted transitions; S119 has no such ruling yet. Four positive breaches have been recentred with `around(observed)` under the standing rule.

| Mechanic | Existing band | Observed | Proposed |
| --- | --- | --- | --- |
| planner.term.caution | 1..4 |0|0..0|
| planner.term.force_ratio | 1..4 |0|0..0|
| planner.term.supply | 1..5 |0|0..0|

Cause: the integrated S118 allocation/Preston correction changes Patterson’s day140 choice from holding to direct. In S116, removing any of these terms changed that holding choice. In the corrected retained draft, removing each leaves direct first. The other final drafts also retain their choices. Detailed candidate scores and exact day146 contact/day147 repulse are in [planner-band-evidence.json](planner-band-evidence.json); no additional isolation run or fitted rule is claimed.

The independent existing `counts every scoring term live` test in `packages/cli/test/planner.test.ts` passes (exit0,2.796s): every planner term changes a pick or falls under an edit in its fictional controls. Supply additionally remains live in the reused testbed reference.

Proposed exact scope: three append-only0..0 Union records bound to their full cause/evidence fingerprints; add caution/force_ratio to the global QUIET table with that live driver, keep supply’s testbed activity, and add a targeted negative-control test rejecting altered or additional zero transitions. Preserve the frozen inherited origin, all prior records, scoring, strength criteria and budget. Then re-evaluate the retained capture, run cheap rule tests, and commit through the ordinary hook (roughly3minutes). No new campaign.

Decision needed: authorize exactly those three quiet records, or retain their failures and leave S119 uncommitted for the lead. The ordinary hook runs reference liveness and cannot pass with these known failures.
