# S14 order-of-battle data drafts

For the lead: **7 items**. S14 only, in `C:/Pyrrhic/sprint-research-military`, branch `sprint/research-military`, from pinned `84c3466`. Draft data and research only. Nothing loaded, generated, signed or pushed. No kernel, loader, active pack, scenario, calibration, other sprint file or local CODEX change.

## Delivery

The [draft README](../packs/union-1861/source/drafts/oob/1862/README.md) explains the files in `packs/union-1861/source/drafts/oob/1862/`:

- **62 source snapshots / 416 force observations**, using the existing 14 force-block CSV columns. These are observations, not 416 unique formations or one simultaneous scenario roster.
- Matching **416 draft posts and 416 observations**, with commanders or limits, source windows, strength measures, accounting warnings and further-research dispositions. Unit eponyms do not prove who actually commanded.
- **213 numerical observations / 203 explicit unknown strengths.** Numerical statuses: 200 reported, ten estimates/reconstructions, one upper bound, two ordered quantities whose actual size remains unknown. “Reported” does not certify accuracy or completeness; each measure and source character qualify it.
- **Two provision orders** in `stores-observations.csv`: ten days for Hatteras, three days cooked rations requested for Price. Fulfilment is unknown. Every actual `stores_days` remains unknown; no generic norm, captured quantity, rounds or hull count becomes subsistence.
- [checkpoints-1862.draft.json](../packs/union-1861/checkpoints-1862.draft.json): today's schema, one inferred broad Union November men band and an explicitly unbounded Confederate national **HOLD**. That hold cannot satisfy 1B acceptance or establish zero strength.
- [checkpoints-battles-1862.draft.json](../packs/union-1861/checkpoints-battles-1862.draft.json): **68 proposed bands / 17 windows**, both sides, separate strength and casualty categories. Its envelope follows the current file, but the proposed battle kinds are **unsupported by today's schema**. No accepting code or observer was added. Tolerances are [I] review proposals, not sourced confidence intervals, accepted calibration or a battle schedule.

Eastern observations cover pre-corps organisation, winter returns, the Peninsula/Seven Days, Second Manassas, Maryland, autumn returns and grand divisions. Western work includes Donelson, both Shiloh armies, Pea Ridge, Grant's territorial divisions/districts/wings, Corinth, the disputed pre-Perryville return, Army of Kentucky, New Mexico, Army of Tennessee and East Tennessee. River/coastal observations distinguish flotillas, independent rams, naval divisions, army expeditions/brigades, hull lists and the one reported crew. Parents, children, attachments and successive snapshots are not additive.

## Sources and reading limits

The [reading record](../docs/research/2026-11-20-S14-oob-source-reading.md) and [inventory](../docs/research/2026-11-20-S14-source-inventory.json) record **23 PDFs / 2,141,303,158 bytes / 345 selected-page records**, with URLs, SHA-256 and printed/PDF positions. Selected passages/lines were read, not complete volumes or necessarily every line of a retained page.

Original S4 scans remain in place. Five new PDFs are retained only in **`C:/Pyrrhic/mandate-research-sources/S4/S14/`**: OR I-XI.3, I-XVI.2, I-XVII.2, I-XX.2 and III-II. `source-inventory.log` checks title/series/part/year; XVII.2 is 1887. The original S4 inventory is unchanged; no scan is committed.

Enlarged/rotated images corrected preliminary February/June/November transcriptions, distinguished staff from duty columns and preserved incompatible Shiloh returns. Wrong-offset XI.3 evidence remains excluded in `superseded-xi3-offset14/`; printed 238 is PDF244. Mahan's OCR20/26 collision is image-checked. The close-out batch corrects preliminary title-year metadata. `validation-corrections.json` also records the external schema checker’s Windows file-URL correction; no production code or data was changed for that error.

Vincent's 24 November army-command and separate volunteer muster/pay-roll series use different reporting dates and categories. The Regular aggregate is not added as verified Regular pfd. No complete November Confederate national pfd total was established; partial mixed-measure commands are not a national return, and January 1863 is not backdated.

## Verification and preservation

Inventories and runtime diagnostics preceded this close-out documentation. All evidence is external under S4/S14:

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0; 51 packages, zero vulnerabilities | `npm-ci.log`, `.exit.txt` |
| Startup/typecheck | exit 0; own worktree resolution | `typecheck.log`, `.exit.txt` |
| Force/post/observation audit | exit 0; **3,699 checks** | `audit.json` |
| Checkpoint band audit | exit 0; **455 checks** | `checkpoint-audit.json` |
| Current checkpoint schema | national draft parses; battle proposal kinds rejected as expected and unresolved | `checkpoint-schema.json`, `.log`, `.exit.txt` |
| Required `MANDATE_NO_GIT=1 npm run check` | exit 0; **137 files / 1,530 passed / one expected failure / three skips**; typecheck, boundary, licences and 106-record decisions pass | `npm-check.log`, `.exit.txt` |
| Eastern hook | exit 0; **139 files / 1,548 passed / one expected failure / three skips**, other hook checks pass | `hook-east.log`, `.exit.txt` |
| Western/coastal hook | exit 0; same 139/1,548 counts, other hook checks pass | `hook-west.log`, `.exit.txt` |
| One default eight-seed done check, with drafting | **exit 1**; Phase 0 **5/6**, supplemental 1A **2/6** | `done-check.log`, `.exit.txt`, `runtime-diagnostics.json`, `run-copies/` |
| Inventory / preservation | **68 data/source-inventory artifacts** hashed; **1,679 base tracked paths protected**; no out-of-scope change | `delivery-inventory.json`, `preservation.json` |

The close-out hook's result is recorded in external `hook-final.log` / `.exit.txt` and `final-checks.json`. It checks the final committed batch in addition to the completed checks above. Every commit uses the configured `.githooks/pre-commit` and Codex footer. No bypass, history rewrite, merge, checkout of another branch or push.

The done-check CLI drafts by default; its extra `--with-drafting` word is unrecognised and ignored. The default eight seeds ran, not a reduced campaign. Reference hashes match retained S4: Union **`55a35b1034c19b09`**, testbed **`69d8759b02cfa93f`**. Active inputs are unchanged from `84c3466`. No 1B simulation, Linux CI or idle-machine timing claim.

All **13 reported problems** remain open:

- **Phase 0 timing (3):** Union reference median 100.27 ms exceeds 40; p95 199.42 ms exceeds 160; history median 42.40 ms exceeds 40. History p95 is 68.61 ms. No budget change or retry.
- **1A checkpoints (3):** Confederate known men 20,957 below 100,000; both sides fought zero planned operations, below one.
- **1A operation (1):** two history operations, no operation battle.
- **1A pushback (4):** relay holds 1 below 2; filter holds 0 below 1; trims 0 below 1; reservations 44 above 9.
- **1A lever sweep (2):** grievance channel unmeasured; border-governor recruitment chain unexercised. No D6 clearance.

Unknown-strength passes the inherited harness, but it read **zero Union battle records** and four testbed records. That does not clear any of the 203 draft unknowns for 1B. Other passes waive no unmet criterion. No expensive retry, build or extra campaign was run.

## Commits

1. **`e908420`** — Draft dated Eastern orders of battle for 1B review.
2. **`47e40b4`** — Draft Western, river and coastal forces with further return evidence.
3. The close-out commit contains checkpoint drafts, metadata/prose corrections and this hand-over. Its resulting ID and hook exit are in external `final-checks.json` and the one main-CODEX status; this note needs no self-referential hash.

## For the lead: proposed rulings and residuals

1. **[I] Keep source observations and dates.** Reject a timeless 1862 roster, backdating later returns, treating the disputed nominal 1 October return as a certified deployment or turning dates into automatic battles.
2. **[I] Select non-overlapping forces before applying.** Reject summing parents/children, treating territorial divisions as tactical divisions or apportioning parent strengths. Resolve uncovered troops and every unknown that could fight; the 203 holds are not a waiver.
3. **[I] Keep measures and command evidence separate.** Reject pfd/effective/enrolled equivalence, reconverting Livermore, unit eponyms as current occupants and synthetic cast IDs. S12 needs person/rank/service crosswalks and assumption instruments.
4. **[I] Preserve three corps and incomplete coverage.** GO 151 names Smith, Polk and Hardee; the 20 November numeric return is narrower. Reject substituting East Tennessee department strength for Smith corps. Original subordinate returns, November Cumberland divisions and smaller-action paired returns remain needed.
5. **[I] Preserve naval/supply evidence types.** Reject hulls as crews, contracted/building ships as service-ready, generic complements and provision orders as fulfilled stocks. Fleet complements, actual stocks and the original flotilla-transfer instrument remain needed; Mahan's July/October conflict stays unresolved.
6. **[I] Keep checkpoint gaps visible.** Union/battle widths are review proposals, never fitted to a run. Reject a Confederate national bound from partial mixed measures or an outside-window total. The national hold and unsupported battle kinds remain integration work; 1B owners must decide their observation/schema contract. Empty pushback and copied victory weights supply no new ruling.
7. **[I] Route review and failures to their owners.** Claude's standing reviewer reviews the whole branch after the sprint; the gate reviewer retains every placement/signature. Reject author sign-off and new gate-none claims. Unchanged runtime failures belong to S1/S2 and integration, not S14 data tuning.

## S21 follow-up, 21 November 2026

S14's figures above describe its pinned delivery at `73d6b7a`. S21 subsequently researched all **203 original unknown IDs**, supplying **40 explicitly measured quantities** and retaining **163 unknowns** with searched pages and next sources. The original 213 numerical observations and 416 IDs/windows remain unchanged; the draft now has 253 numerical observations. See the [S21 hand-over](sprint-S21-unknown-strengths.md), [research note](../docs/research/2026-11-20-S21-unknown-strengths.md) and [row register](../docs/research/2026-11-20-S21-strength-dispositions.csv). S21 changes neither S14 checkpoint draft, the active inputs nor the integration/review holds below. S14's historical verification results are not replaced by S21's separate evidence.

## Findings outside my scope

1. **S1/S2:** the 13 baseline problems above remain, with unchanged active inputs and matching hashes. No performance repair or threshold waiver supplied.
2. **S12 / 1B force and data owners:** temporal identities, cast/service crosswalks, non-overlapping representation, missing leaf returns, actual stores and Smith corps must be resolved before application.
3. **1B harness/operations/combat owners:** battle observations need explicit measures/overlap handling; today's scorer cannot read the proposal kinds. A boundless national hold is not acceptance evidence.
4. **S7 / gate:** surrender/exchange, confinement, Native-nation service limits, civilian property and alleged fire on men in the water remain protected source subjects. No policy, resource pool, effect, placement or signature is authored. A military-only draft supplies no authority to ship 1B while other required subjects remain absent.
