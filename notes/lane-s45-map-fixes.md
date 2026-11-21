# S45: map framing and region labels

Scope: `sprint/map-fixes`, based on `edc57b0`; only S45's two desk defects.

Root `npm ci` passed: 51 packages, zero vulnerabilities. Evidence and unedited
captures stay in ignored `art-masters/S45/`. Only the prototype's headless
Playwright harness was used, on port 5345, with server reuse disabled. The server
is closed; `server-closed.json` records zero listeners. Existing art was read
from the main checkout; no art or other lane was changed.

Validation plan: first run the focused framing regression before implementation;
then verify label locality against every region and the rendered desk. Run the
prototype unit suite and typecheck before its build and the required commit hook.
The hook owns the root check. Expected cost: focused checks under a minute each,
prototype build under a minute, root hook about three minutes. Stop on unexpected
failure, inspect retained evidence, and verify a correction cheaply before any
affected expensive rerun. No simulation campaign is needed for display changes.

## Causes and changes

The opening path called `fitOpening`, which applied a tight eastern geographic
frame after the ordinary Fit calculation. It now retains the ordinary frame.
The existing resize observer already called Fit; it remains unchanged. The
headless regression proves exact camera equality before pressing Fit, after
panning and resizing away and back, and after pressing Fit again, at both
requested sizes. The completely empty parchment was not reproduced here: the
baseline captures show the eastern map. The requested framing difference was
reproduced and is fixed.

The generated geography is current. `python -B scripts/map-setup.py --check`
returned no stages; all 268 IDs, names and reference points match the pack CSV.
The base and runtime geometry, their recipes and the input CSV retained their
hashes throughout validation (`data-audit.json`). No regeneration or bake was
needed. There is no label-to-region join mismatch.

The collision search could shift a region name by half its text width plus 56
pixels, irrespective of its own polygon. A town whose adjacent name failed
could fall through to the same unrestricted search, with five 28-pixel rings.
The renderer now checks each area-name centre against its own exact projected
polygon, including holes and islands, allowing at most 12 screen pixels beside
it. A point-name fallback keeps its nearest text edge within 12 pixels of its
own anchor. Existing dedicated town placements retain their adjacent 8–20 pixel
gaps (up to 28.3 diagonally). If no local position clears the obstacles, the name
is hidden. Geography, anchors, simulation and report placement are unchanged.

## Evidence and verification

- The portable **full list of 114 observed displaced names**, with IDs, names,
  occurrence counts and example views, is [s45-label-audit.json](s45-label-audit.json).
  It includes all three reported examples. Across 231 baseline views there were
  1,719 misplaced label observations. The bounded inventory covers all four
  looks at 800×600, 1440×900 and 3440×1440, then all 219 selectable regions at
  1440×900. It does not claim to enumerate every possible camera position.
- Fixed headless run: **exit 0, three tests passed, 3.4 minutes**. The same 231
  views contain **4,801 label observations, 130 distinct rendered region IDs,
  zero misplaced labels**. Every selectable region was focused; collisions and
  zoom thresholds hide some names. All six examples named by S45, including the
  three initially reported as correct, appear in the fixed audit. Independent
  native Canvas fill/stroke checks verify locality, rather than calling the
  renderer's distance helper. `after-label-audit.json` retains every observation.
- `before-first-800x600.png`, `before-first-1440x900.png`,
  `after-first-800x600.png`, `after-first-1440x900.png` are the requested unedited
  first-morning captures, with size/hash recipes. Two additional fixed Fit
  captures are retained. All four primary captures were inspected. Framing
  JSON records exact camera equality and zero page errors at both sizes.
- Prototype suite: **39 files / 146 tests passed**, exit 0. After the town
  fallback correction, targeted renderer checks: **three files / nine tests
  passed**, exit 0; unaffected suite evidence is reused. Typecheck and browser
  build pass, exit 0. Build retains the documented runtime-asset and bundle-size
  warnings. Final inventory contains 437 build files and six captured PNGs.
- Expected pre-fix assertion failures are retained. The expanded harness first
  stopped at discovery on an unsupported JSON import; it was corrected and
  `--list` passed before the sweep. The complete original-code sweep then
  finished in 214 seconds and failed locality as expected. The fixed sweep
  passed in one run. The final presence assertions were also checked directly
  against its retained audit; the expensive sweep was not repeated.
- `final-inventory.json` was written after runtime and build checks, before this
  closeout. All **1,879 original tracked paths remain**. `git diff --check`
  passes. Generated geography input hashes are unchanged. The actual commit
  must run the required root hook; its outcome and commit belong in the single
  main-checkout CODEX status. No hook bypass, push or history rewrite.

## Proposed rulings

[I] Retain Fit's broad opening frame, as S45 requests, and suppress a colliding
name when no geographically local position fits. Reject regeneration of current
data, altered pack reference points, and moving names to unrelated regions to
keep them visible. These are display choices; no band, scoring or kernel change
is proposed. Reuse the pin's simulation evidence; no new done-check campaign was
run for these display-only changes.

## Findings outside my scope

Whole-branch independent review and integration belong to the lead after the
sprint. The 800×600 desk's crowded furniture remains visible in the captures;
reflow beyond the two requested map defects was not changed. A claim that all
possible camera positions have been exhaustively tested, a new performance
campaign, simulation acceptance, pushing and gate signatures are outside S45.
