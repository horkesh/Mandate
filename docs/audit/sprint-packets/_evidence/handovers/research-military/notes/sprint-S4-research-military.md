# S4 military research hand-over

For the lead: S4 research delivered for Claude's sprint review; no pack or simulation edits. The repository check passes. The retained baseline done check exits 1, detailed below; runtime acceptance is not claimed.

Scope: Bull Run, 21 July 1861, through 30 November 1862; campaigns, battle dates, commanders, strengths, losses and dated corps/division organisation; then Western rivers, coast and blockade operations. Branch `sprint/research-military`, starting at `ceff796`. Sources and working evidence stay in `C:/Pyrrhic/mandate-research-sources/S4/`.

## Work and verification plan

1. Read the standing, command-line and writing rules in the main checkout's CODEX, the S4 brief and decision 0106. Install dependencies with `npm ci` (done, exit 0).
2. Read page-numbered public-domain scans; retain originals, URLs, hashes and page mappings. Build dated research under `docs/research/`. Attribute returns and estimates separately; mark inferences [I] and hold unread or uncertain cells.
3. Keep organisation dated: no later corps imposed on an earlier battle. Record unresolved discrepancies rather than silently reconcile incompatible strengths or losses.
4. Widen into the Western river and coastal campaigns, including joint command and operational constraints. Research only; no gated wording, placement or signature.
5. Before costly checks, audit citations, numeric arithmetic, local links, UTF-8, changed paths and workspace dependency resolution. Then the required `MANDATE_NO_GIT=1 npm run check` and `npm run run:done-check`; the pre-commit hook runs the staged check again. Question: does this docs-only branch retain the baseline's required checks? Pass: each command exits 0; report all failures without widening S4 into implementation. Expected cost: a few minutes for check/hook and roughly twenty minutes for the eight-seed done check. Stop expensive retries on failure, inspect all reported categories, reuse unaffected evidence and leave out-of-scope failures with the lead.
6. Commit coherent research steps through the hook, without pushing. Read main CODEX fresh, then append one UTF-8 status listing commits, proposed rulings and residuals. Preserve its prior bytes.

## Proposed rulings

All remain **[I] proposals** under 0106; no acceptance, recalibration or gate clearance is claimed.

1. Keep pfd, estimated effectives, entered-battle strength and a multi-day contribution distinct. Reject an unqualified strength ratio or double conversion of Livermore's figures.
2. For the primary Bull Run casualty reference, prefer OR components 2,708 U / 1,982 C, retaining Livermore's 1,981 C variant. Preserve OR Potomac 21,863 versus L 21,883; reject a silently constructed hybrid Confederate strength. The suggested numerical tolerances remain analyst proposals, not accepted bounds.
3. Preserve overlapping windows and reporting dates. Reject adding the Seven Days sub-battles to its campaign total, or treating Donelson's missing/captured as deaths.
4. Keep army identity, formal corps, temporary attachment and roster succession dated. Reject merging the two III Corps at Second Manassas or treating all successors as simultaneous commands.
5. Define naval control by an operation and reach: passage, protected transport, landing, occupation or sustained denial. Reject declaring the Confederacy divided by the June 1862 fleet meeting above Vicksburg.
6. Retain source disagreements as attributed evidence, including Antietam's reconstruction and the November bridge explanations. Reject averaging incompatible counts into false precision or deriving character scores from blame.
7. Use Mahan's specific 1 October flotilla-transfer passage provisionally, flagging his conflicting July statement. Reject a verified legal date until the underlying transfer order is checked.

## Research delivered

- `docs/research/2026-11-20-S4-military-strengths-and-losses.md`: eighteen battle/window comparisons, arithmetic and measurement basis; Bull Run for 1A; primary-return checks at Donelson, Shiloh, Corinth and Perryville.
- `docs/research/2026-11-20-S4-campaigns-and-organisation.md`: dated corps/division snapshots, both armies at Second Manassas, additional Western/Valley/New Mexico actions, autumn replacements and November movement/bridge messages.
- `docs/research/2026-11-20-S4-rivers-coast-and-blockade.md`: procurement/crewing, Western rivers, New Orleans/Vicksburg, coastal bases, Hampton Roads, Hatteras, Port Royal, Pulaski/Macon, North Carolina sounds and New River.
- `docs/research/2026-11-20-S4-sources.md` and `2026-11-20-S4-source-inventory.json`: twenty-two cited original PDFs, about 2.13 GB, direct URLs, SHA-256 hashes and printed/PDF page examples. Wrong catalogue items and superseded page mappings are explicitly excluded.

## Verification and preservation

- `npm ci`: exit 0, 51 packages, zero vulnerabilities. `typecheck`: exit 0; workspace package resolution stays in this worktree.
- Documentation audit: 133 checks pass, including six allowed paths, local links, UTF-8, 22 retained scan sizes and 28 complete casualty sums. The audit's initial expected count was corrected from an arbitrary 29 to the actual 18 U plus 10 fully numeric C cells; the failed audit is retained as `docs-audit-initial.json`. No historical numbers changed to fit it.
- `npm run run:done-check`: **exit 1**. Phase 0 passes behaviour, hash, resume, liveness and section-ten; budget fails (Union medians 53.02 ms war-by-decision, 65.26 ms history). Concurrent sprint processes were present; this is not an idle-machine timing result. No budget is waived and no repeat was run.
- The same done check reports 1A failures in checkpoints (Confederate men and both planned-operation counts), operation (no history battle), pushback (relay/filter/trim/reservations) and lever-sweep (partial victory measure and unexercised border-governor chain). Unknown-strength and stand-ins pass. These are all reported categories, not just the first failure.
- Runtime/manifests are unchanged from `ceff796`; source notes cannot explain or repair those baseline runtime results. Evidence: `C:/Pyrrhic/mandate-research-sources/S4/runtime-preservation.json`, `done-check.log`, `done-check.exit.txt`, `done-check-summaries/`, `docs-audit.json`, `npm-ci.log`, `typecheck.log` and `title-check.log`.
- `MANDATE_NO_GIT=1 npm run check`: **exit 0**, 137 test files passed; 1,530 tests passed, one expected failure and three skipped. Typecheck, pack boundary, dependency licences and 106-record decision index pass. Evidence: `npm-check.log`, `npm-check.exit.txt`.
- The configured `.githooks/pre-commit` checks the staged tree again; its command output and exit are retained in `commit-hook.log` / `commit-hook.exit.txt`. No hook bypass, history rewrite, merge into main or push is used. See the branch history and the final main-CODEX status for the resulting commit id. Independent review stays with Claude after the sprint under 0106.

## Remaining work

Claude's independent sprint review and any gate review remain. Historical follow-ups remain held: paired final returns for every smaller action, daily division arrival/strength series, a reconciled Antietam C strength, the underlying naval transfer order, a dated primary Pocotaligo report, and independent November engineer/quartermaster reconciliation. None is filled from memory. The research adds no accepted checkpoint or gate signature.

## Findings outside my scope

1. **[I] S1 / S10:** choose source, basis and time window before adopting a strength band; Bull Run's variant counts and Shiloh's two days are concrete cases. S4 changes no current band.
2. **[I] S6:** command issue, receipt, assumption, temporary attachment and wounded replacement need separate dated service edges. No values/stats are assigned here.
3. **[I] S7 / gate:** Pike's Native-nation negotiations, Stone's confinement, prisoner/surrender terms, Planter's escaping people, civilian encounters and alleged fire on men in the water need protected review. No policy lever, placement, wording or signature is supplied.
4. **[I] S5:** possession of bases and a fleet's passage do not establish blockade interception, cotton trade or recognition effects. Those require S5's own diplomatic/economic sources.
5. **[I] Runtime owners S1 / S2:** the retained baseline done check's timing and reported 1A failures remain open; the docs-only branch does not waive them or modify their thresholds.
