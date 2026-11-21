# S28: held situations and Davis's decisions

Delivered on `sprint/situations-1862`, continuing `7321b2b`: 42 unsigned drafts with 45 options, kept outside the live pack. There are 14 Union drafts covering 16 of S13's 17 held candidates, and 28 Confederate drafts. All seventeen original candidates have a bounded search result. Nothing is signed, and no live content, runtime, existing S13 file or other lane's file was changed.

The [bench README](../packs/union-1861/situations/drafts/s28/README.md) explains the overlay and promotion limits. `index.json` records each draft's gate topic, document receipt, option evidence, missing acts, source limits and expected blockers. `advocate-search.json` preserves the original candidate keys and remaining holds. The bibliography and hash manifest accompany the drafts; raw evidence and logs are at `C:/Pyrrhic/mandate-research-sources/S28/`.

Chase's 16 May letter supplies the advocate for letting Hunter's order stand (SMC501, pp. 1–2). The two manuscript pages were inspected; it is a contemporary secretarial copy. Frémont's 8 September letter explicitly defends his emancipation clause (LoC mal.1156100, pp. 1–4). Its complete LoC transcription was read after direct retrieval failures; the four-image item is cited as a whole because image-by-image pagination was not inspected. The dated documents change the original candidates' evidence dates, and Chase replaces the tentative Hunter attribution. Seward's precise victory condition remains held: Carpenter's later account (pp. 20–23) and the selected September Welles entry (I pp. 142–144) do not establish the complete option in an inspected contemporary document.

The Confederate set covers conscription proposals, the enacted acts and exemptions, Georgia's organizations, Mississippi and Vicksburg, Kentucky neutrality and the western support request, Lee's September proposals, recognition and diplomatic communications, habeas, defensive works and naval procurement. Ordinary military, legislative and diplomatic facets propose no gate topic with a bounded reason. The October exemption act is an event notice under 0046; it offers no choice over its control of enslaved people (Confederate public acts, first Congress, second session, pp. 77–79). Three proposed topic rows exist only in the authoring overlay; the live register is unchanged.

## Proposed rulings

- [I] Preserve the separate stages and knowledge limits of each document. Reject using a later law, reply, edition or outcome as an earlier received paper. An actual receipt and, where appropriate, a prior enacted-law cause remain prerequisites for promotion.
- [I] Accept the bounded period advocacy identified in the search ledger, while leaving Seward's complete victory condition held. Reject a generic choice inferred from hindsight or a memoir presented as a contemporary cabinet minute.
- [I] Keep ordinary facets as proposed `gate.none` items and coercive conscription/habeas as cost-bearing sensitive decisions. Reject a free security lever. Each no-topic ruling still needs review of its precise facet.
- [I] Retain 0046's event placement for the October act's protected-population provisions. Reject making those provisions a presidential option. The law's actual passage and implementation are not supplied by a date or statutory text alone.
- [I] Leave all locked costs and effects empty in this bench. Reject invented numerical penalties, fabricated advisers and automatic state, military or diplomatic results. The missing owners and acts are recorded per item.

## Validation and preservation

| Check | Result | Evidence |
|---|---|---|
| Dependency install and startup | `npm ci`: 51 packages, zero vulnerabilities; baseline typecheck and all 228 S13 tests passed | `logs/npm-ci.log`; baseline logs |
| Final focused draft suite | 175 tests passed; every new draft has semantic, gate, real-loader and receipt-condition checks | `logs/final-focused.log`, exit 0 |
| Required no-git check, two workers | 139 files passed; 1,933 tests passed, 1 expected failure, 3 normal skips; typecheck, boundary, licences and decision index passed | `logs/check-no-git-two-workers.log`, exit 0 |
| First real pre-commit hook | Test Files  141 passed (141); Tests  1951 passed \| 1 expected fail \| 3 skipped (1955); full check passed, including Git fixtures | `logs/commit-1.log`, exit 0 |
| Default eight-seed done check | Phase 0: 5/6 pass; reported 1A: 2/6 pass | `logs/done-check.log`, exit 1; no unchanged rerun |
| Preservation | All 1,759 baseline tracked files unchanged; all 42 new `gateReview` values null | `baseline.json`, `preservation.json` |

The first default-parallel no-git suite hit the unchanged done-check test's 300-second setup limit: 138 other files passed, with 1,919 tests passed, one expected failure and 17 skipped, including the 15 tests whose setup failed. The three checks not reached by that command were run separately and passed. The failing file then passed alone (14 passed, one normal skip) in 181.62 seconds. One controlled full check with the installed Vitest's supported `VITEST_MAX_WORKERS=2` passed in 590.37 seconds, preserving test selection, isolation and timeouts. The same worker bound is used for both actual hooks. The retained failed attempt is not discarded.

The load probes accept 19 ordinary drafts structurally and refuse 23 for their declared gate blockers: ten have unsigned/missing-cost/held-topic errors, nine have unsigned/missing-cost errors, and four notices have unsigned errors. This is not promotion approval. Every definition remains excluded from live loading. Tests reject a bare date, missing or wrong document, future receipt, unknown source, missing string and a protected-policy decision placement.

The evidence inventory has 30 original-file receipts, 175 selected/search extracts and two inspected manuscript images. Search extracts and excluded/mis-mapped files are distinguished from final evidence. Corrected OR I-16 II (`cu31924077730228`, pp. 768–769) supplies Smith's request; older cache selections are not used for it. The nearby reprisal proposal on the Vicksburg source page (OR I-15 p. 754) is excluded. Whole-file hashes do not assert whole-book reading.

The content/test batch is `efc43b5`. This hand-over is the closing documentation batch; both go through the actual hook with the required footer, without a push or history rewrite. The completed main-CODEX status lists both commits. The closing hook's receipt is `logs/commit-2.log` and `logs/commit-2.exit.txt`.

## Findings outside my scope

The unchanged branch's runtime check still fails the 40 ms budget: war-by-decision median 82.17 ms (p95 147.01), history median 131.63 ms (p95 270.15). These are shared-host measurements, not a budget waiver. S2 owns performance; no runtime tuning or additional campaign was attempted here.

The reported 1A gaps remain with integration and the existing owners: Confederate strength 20,957 against the 100,000 lower band; zero fought planned operations for each side; two operations but no operation battle; relay/filter/trim counts 1/0/0 below 2/1/1, and compliance with reservations 44 above 9. The Fort Monroe lever sweep is partial because its victory measure omits the policy-pushback path, and its border-governor chain was not exercised within the horizon. All four failed criteria are retained, not retired by passing other checks.

Seward's held option needs an inspected period document for the precise condition. Every draft still needs its index's promotion work: authentic received papers and routes, dated people/posts, actual legal causes and typed acts, and policy/cost/inaction implementation through the existing owners. S23 and the gate reviewer retain the live register and facet rulings. Under 0106 the independent branch and gate reviews occur after the sprint; the author has created no signature.
