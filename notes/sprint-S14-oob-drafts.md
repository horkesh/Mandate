# S14 order-of-battle data drafts

For the lead: S14 only, on `sprint/research-military` from `84c3466`. Eastern batch ready for the hook; Western/river/coastal and checkpoint batches in progress. Nothing generated, loaded, signed or pushed.

## Work and verification plan

1. Read CODEX's standing, command-line, writing and sprint rules, 0106, the S4 hand-over, force-block columns and checkpoint format. `npm ci` completed, exit 0. Retain new evidence under `C:/Pyrrhic/mandate-research-sources/S4/S14/`; reuse S4 scans without altering them.
2. Draft dated Eastern armies, corps and divisions with the existing force-block columns. Companion observations preserve roster windows, commanders, source measures and parent/child accounting. Research unknown strengths in returns before retaining them as unknown. Commit this batch through the hook.
3. Widen to Western commands, rivers and coast; preserve naval complements separately from army manpower and provisions separately from ammunition. Commit this batch through the hook.
4. Draft checkpoint proposals beside `checkpoints.json`, with explicit source bases, windows and inferred tolerances. No runtime calibration and no imposed historical battle schedule. Commit the final batch through the hook.
5. Before costly checks: audit CSV shapes/joins, date windows, citations against retained page reads, arithmetic, unknowns, draft isolation and unchanged runtime inputs. Use the verification-before-completion skill's evidence rule. Required `MANDATE_NO_GIT=1 npm run check`, real pre-commit hooks and one `npm run run:done-check`. Question: do the isolated drafts preserve the required baseline checks? Pass: exits 0; report inherited failures without changing runtime or bands. Expected cost: minutes per hook/check and approximately 20–35 minutes for the eight-seed done check. Stop after unexpected failure, inspect every reported category, correct cheaply if in scope and reuse unaffected evidence. No build or additional campaign is planned.
6. Settle inventories and diagnostics before final documentation. Read main CODEX fresh and append one UTF-8 status preserving its previous bytes. Never touch another lane's files.

## Eastern batch

21 source snapshots, 259 force rows: 133 reported strengths and 126 explicit unknowns. Every row has a matching draft post and observation with commander, source window, measure and further-research disposition. New reading of OR I-XI.3 supplies May20, June20, July20, August10/20 returns; OR I-XIX.2 supplies November10 and GO184; OR I-XXI supplies November20. Enlarged image checks corrected initial February, June and November transcriptions before commit. The first XI.3 offset assumption was wrong; those extracts/images remain excluded under the external `superseded-xi3-offset14/`. Correct printed238 is PDF244. No erroneous offset or preliminary transcription is treated as evidence.

Cheap preflight: typecheck exit 0; runtime/manifests unchanged; focused audit exit 0, 2,170 checks. The default eight-seed done check with drafting is running once. The CLI drafts by default; the supplied `--with-drafting` is unrecognised but ignored, with no change to defaults. Logs stay external. Required hook checks each committed batch; final non-Git check remains planned.

## Proposed rulings

All remain [I] proposals under 0106; none accepts canon or signs a gate item. Keep source windows and measures distinct, inclusive parent totals non-additive, unknowns blocking at integration and commander observations separate from S12 cast tenure. Rejected: a timeless roster, nominal sizes, backfilling later returns, duplicate parents/children and assuming an eponym is the current commander. The draft README carries the detailed reasons.

## Western, river and coastal batch

Eastern commit **`e908420`** passed the real hook: exit 0, 139 files, 1,548 passed, one expected failure and three skips, plus typecheck, boundary, licences and decisions. Western/coastal additions bring the draft to **62 snapshots / 416 force observations**, before final close-out counts. Further reading supplies Grant's territorial returns, pre-Perryville returns with their date warning, the three-corps Army of Tennessee order and November return, East Tennessee's approximate return, North Carolina's effective returns and distinct naval forces. The two rations orders remain orders, not actual stocks. No `stores_days` default or fill is applied.

Proposed rulings [I]: distinguish territorial from tactical divisions; reject treating Rosecrans's territorial Third Division as one normal division. Preserve the order's three Confederate corps and the numeric return's smaller coverage; reject substituting the entire East Tennessee department for Smith's unreturned corps. Keep ship crews and hull counts separate; reject interchangeable crews or a new hull instantly becoming service-ready. Preserve the disputed Buell return and Mahan transfer date instead of silently resolving them. Other sensitive-history source passages remain research leads, without effects or gate-none claims.

The focused audit before this batch passes 3,695 checks; final numeric/count changes are rechecked before commit. Source scans and logs remain external. The single required done check is still running; no repeat or runtime tuning.

## Findings outside my scope

The retained S4 baseline done-check failures remain assigned to S1/S2. Independent whole-branch and gate review remain with Claude after the sprint under 0106.
