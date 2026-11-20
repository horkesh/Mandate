For the lead: 1 item.

# R93: assault contact probe

2026-11-20. Report only, under decision 0105 item 6. Worktree `C:/Pyrrhic/mandate-assault-contact`, branch `phase1-assault-contact`, unchanged HEAD `3cbf71e6a04ac93c9393b73c7cf8585287069ecf`. Exactly four measured probe configurations; no production code, pack data, generated World, fixture or band changed. `npm ci` ran before the probes and checks: exit 0, zero vulnerabilities. Git was read-only.

**Recommendation [I].** Retain the current production model. The term a principled follow-up should change is **daily fire exposure in the loss numerator for works assaults**, currently the single shared `contact` in `kw = trunc(contact × base × multiplier / 1,000,000)`. A confined approach needs a distinction between the men who can fight abreast and the men exposed over successive assault efforts. Exposure must also be bounded by the opposing force's actual fire; simply charging losses against every committed attacker fails an existing acceptance criterion. Request a narrow design ruling on this distinction before implementation. Keep open-battle contact and the shared assault rates unchanged. Decision 0076 item 1 explicitly fixes shared lesser-side contact, so a production exception would require the lead to amend it; 0105 authorizes this investigation, not that exception.

**What the setup actually represents.** Read lane 1.3's hand-over, its combat research note (especially P3–P4), decision 0076, and the current contact/frontage implementation. Decision 0105 was read in the main checkout at `docs/decisions/0105-1as-first-calibration-round-continue-or-park.md`; it is newer than this worktree's head.

In `packages/kernel/src/combat/resolve.ts:162`, committed men are the commander's share of known men present. Each side's engaged men are `min(committed, frontageMen)`; contact is the smaller engaged count. At line 194, both sides' K+W use that contact. The numbers modifier uses total present strength, not the width of the approach. The same code already gives Wagner's attacker a −99‰ numbers term and +200‰ all-out posture term. The two commanders and their starting conditions are equal in the harness.

These are model inputs from the unchanged Livermore harness, not new historical estimates:

| Assault | Attacker / defender present | Attacker / defender committed | Terrain frontage | Attacker / defender engaged | Shared contact |
|---|---:|---:|---:|---:|---:|
| Fredericksburg | 106,007 / 72,497 | 74,204 / 72,497 | 60,000 | 60,000 / 60,000 | 60,000 |
| Chickasaw Bayou | 30,720 / 13,792 | 21,504 / 13,792 | 25,000 | 21,504 / 13,792 | 13,792 |
| Fort Wagner | 5,264 / 1,785 | 5,264 / 1,785 | 40,000 | 5,264 / 1,785 | 1,785 |
| Franklin | 26,897 / 27,939 | 26,897 / 27,939 | 60,000 | 26,897 / 27,939 | 26,897 |

Wagner's small garrison supplies only 33.9% of the attacker's engaged count to the loss numerator [I]. Its 40,000 frontage never binds. Fredericksburg has both sides capped to the same frontage; Franklin's attacker is already the lesser side. Chickasaw also has more attackers engaged than defenders, making it an essential control against a rule based only on the numerical ratio. Wagner and Franklin both use `all_out`; posture alone does not distinguish them.

**The beach is missing geometry, not an existing small frontage value.** The [National Park Service account, approach paragraph and footnote 6](https://www.nps.gov/articles/the-54th-massachusetts-and-the-second-battle-of-fort-wagner.htm#ftref6), citing Emilio pp. 78–80, describes an uncovered approach admitting one regiment at a time, crossfire from the walls and supporting artillery from other fortifications. Its following assault narrative describes later attacks after the leading regiment. This probe read the NPS account, not Emilio's original pages. The retrieved article and metadata are retained in `runs/r93/nps-geometry-source.json`.

The current `tidewater` row supplies only a broad terrain frontage and a −50‰ loss term. It has no local approach, assault sequence, exposure duration or supporting-fire input. Moreover, `frontageMen` is documented as men per side **per day**, so a description of simultaneous width supplies no direct conversion to that field [I]. No beach width or men-per-yard number was invented.

**Works level does not distinguish these fixtures.** All four rows directly specify `assault_works` and use the same 180/40 attacker/defender base rates. No separate Wagner works level enters `DayInput`. In the production caller, `packages/kernel/src/combat/battle.ts:292`, fortification at or above `preparedAt` selects `assault_works`; the numeric level is not then passed to the resolver as another loss term. Raising works above that threshold would not supply the missing exposure model [I].

For this one-day Wagner setup, any frontage F gives `contact = min(5,264, 1,785, F)`. Increasing F cannot increase contact; reducing F can only reduce the day's K+W [I]. Even the current multiplier ceiling of 3,000 gives at most 963 attacker K+W at contact 1,785 and base 180, below the fixture's 1,126 [I]. That is a structural diagnostic against fitting the source point by additive terms alone; matching a single source point is **not** a new acceptance requirement.

**Four probes and their limits.** Each configuration uses the existing fourteen harness setups and seeds 1–20. All calls import the unchanged `phase0.resolveDay`, with the harness's identical `combat/livermore:<battle>/<day>` stream names across configurations. Each makes 400 battle-day calls (1,600 across four configurations). There was no fifth probe, changed seed set, tuning loop or extra rate candidate. The required project checks below are separate unchanged-head checks, not additional experimental configurations.

1. Baseline: unchanged inputs and rules.
2. Frontage: for works assaults only, cap frontage at 1,000 men. This is an unsourced sensitivity test below Wagner's contact count, not a proposed conversion from the beach description.
3. Terrain: for works assaults only, set the terrain loss term to zero. Frontage, commitments and rates remain baseline.
4. Exposure diagnostic: for works assaults only, test attacker loss exposure `E_A = max(contact, attacker engaged)`, retaining defender contact and all other terms. The public resolver has no separate exposure input. The probe therefore passes an in-memory attacker base `floor(180 × E_A / contact)` to the existing resolver, approximating the changed numerator. It never writes that rate to a pack. Proxy bases are 180 at Fredericksburg and Franklin, 280 at Chickasaw and 530 at Wagner. This is **not an implemented contact rule or a proposed rate table**. Exact-numerator arithmetic is retained beside the outcomes; integer proxy error is at most two K+W at Wagner and seven at Chickasaw. The solver's typed parts describe the proxy base, not a new geometry term.

All four commands exited 0 as diagnostic executions; their candidate failures are preserved below. Rates are mean K+W per 1,000 of each side's original fixture strength, using the existing harness's truncation per seed and then of the mean. Each cell is **attacker / defender**. Source rates use integer truncation too, hence Wagner 213/94 rather than the research note's rounded 214/95. Source counts come from the accepted CSV and README; this probe did not re-transcribe Livermore's original tables.

| Configuration | Fredericksburg | Chickasaw Bayou | Fort Wagner | Franklin | Samples inside the 2–7 absolute-loss ratio |
|---|---:|---:|---:|---:|---:|
| Fixture source | 102 / 64 | 39 / 14 | 213 / 94 | 206 / 43 | Not a simulation sample |
| 1: baseline | 96 / 34 | 56 / 34 | 62 / 49 | 216 / 45 | 80/80 |
| 2: frontage ≤1,000 | 1 / 0 | 3 / 2 | 34 / 27 | 7 / 1 | 80/80 |
| 3: terrain term zero | 96 / 34 | 72 / 42 | 65 / 51 | 216 / 45 | 80/80 |
| 4: attacker exposure proxy | 96 / 34 | 87 / 34 | 184 / 49 | 216 / 45 | **60/80: fails 80% minimum** |

Configuration 2 fails the existing side-rate ranges: attacker 40–220 and defender 10–100. Narrowing this contact cap moves Wagner in the wrong direction. Configuration 3 passes the existing aggregate harness gates but moves Wagner only 62→65 and increases Chickasaw's error. Removing the terrain reduction is not the missing mechanism [I].

Configuration 4 isolates the important exposure sensitivity while leaving Fredericksburg's and Franklin's full solver outcomes identical to baseline. It nevertheless fails target 4: all twenty Wagner samples exceed the 7:1 upper ratio (9.97–12.12), leaving 75% of all works samples in band against the unchanged 80% requirement. Wagner's mean absolute losses are approximately 972 attacker / 88 defender, against source counts 1,126 / 169. The defender is also underpredicted. Chickasaw's attacker moves farther from its source, 56→87 against 39. Reject this formula; do not repair its verdict by changing a band or raising the defender's shared rate [I].

All ten non-assault setups' complete retained records match baseline in configurations 2–4. Open-battle targets remain unchanged: side means 149/177, every fully engaged single-day side within 90–240, and 200/200 open samples inside their absolute-loss ratio band. Setups with both sides within half to twice the source number are 11/14, 9/14, 11/14 and 12/14 respectively; each exceeds the existing 60% threshold. That aggregate improvement does not waive configuration 4's failed assault ratio.

The raw records establish six draws and the expected stream state per day, matching across configurations. K+W parts, killed plus wounded, missing/captured parts, multiplier terms and morale terms sum exactly; unknown-strength lists are empty. No extra random draw or commander hit was added to the harness. Evidence verification reads the retained results only, without another resolver run.

**Scope of the conclusion.** The four assault fixtures each run for one modeled day. They contain no assault waves or historical duration. Wagner's baseline defender withdraws in all twenty samples; the attacker gains ground. In configuration 4, defenders hold in seventeen and fall back in three; attackers hold in all twenty. These are loss diagnostics, not validation of the historical outcome. The baseline fixture's existing result limitation was retained, without tuning its commander or orders.

The next design should separate simultaneous frontage from cumulative, role-specific fire exposure for works assaults, using a sourced approach/works profile and actual opposing fire to limit it [I]. It should explain both sides' losses and record the exposure contribution explicitly. It must not award unlimited losses merely because more attackers are present, nor add a battle-name exception. The immediate touchpoint is the `contact` factor in the loss calculation and the caller's supply of geometry; a numeric rate or a narrower generic terrain frontage cannot stand in for that information [I]. This report does not choose an exposure coefficient or establish that this proposed distinction alone will fit the four cases.

**Required checks on the unchanged head.** Cheap preflight verified own-worktree workspace links, pack rules and all fixtures before any probe. Its first attempt omitted the combat validator's terrain-vocabulary argument; only the ignored probe script was corrected. Both failure and correction logs are retained. The full check ran once and passed; no expensive command was retried.

| Command | Exit | Result |
|---|---:|---|
| `npm ci` | 0 | Zero vulnerabilities |
| `MANDATE_NO_GIT=1 npm run check` | 0 | Typecheck; 129 files, 1,471 tests passed, three existing timing skips; boundary, licences and decision index pass; 215.52 seconds |
| `npm run run:done-check -- --label r93-done` | **1** | Phase 0 **5/6**, 1A **2/6** reported; full eight-seed sweep and drafting retained; 1,648.77 seconds |
| Retained-result verification and preservation audit | 0 | Four configurations; unchanged controls and streams; all 1,650 baseline files preserved before this report was added; own Git metadata preserved |

Done-check failures remain binding. Phase 0 fails **budget**: Union reference median/p95 138.45/268.54 ms, history 53.99/102.06, against unchanged 40/160; testbed is 6.45/11.26. No unloaded-machine, CI or causal performance claim is made. Behaviour, hashes, save/resume, liveness and section-ten checks pass. Union's 148 daily reference hashes and day-60 resume match; final reference hash is `59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`. This is the reference hash, not a claim about a newly calibrated history.

All four failed 1A categories were read and retained:

- **Checkpoints:** Missouri remains neutral; western Virginia names no government in this head's checkpoint; Confederate known strength is 20,957 against 100,000–200,000; both planned-operation counts are zero. Union known strength 18,686 is below its 95,000–250,000 band, whose floor is explicitly non-binding. R85's two accepted data corrections are not present at this head and were not copied from another run.
- **Operation:** two history operations and zero recorded battles. Bombardment telemetry does not clear the missing-record problem.
- **Pushback:** relay holds 1 against 2–6, filter holds 0 against 1–9, trims 0 against 1–4, reservations 44 against 1–9. Other pushback counts remain in band.
- **Lever sweep:** eight decisions weighed and 248 base-run calls, but the grievance consequence is unmeasured and all 24 weighed policy moves lack a border-governor recruitment answer. Return is best in 0/8 seeds; that does not supply D6 clearance.

Unknown strength and stand-ins pass as scored. No band or milestone flag changed. These checks predate integration of R90–R92 and do not measure those other runs.

**Evidence and hand-over.** `runs/r93/README.md` lists the commands and retained logs. Each of `01-baseline`, `02-frontage`, `03-terrain` and `04-exposure` holds `raw.json` and `summary.json`. `evidence-checks.json` establishes unchanged controls, draw states and proxy rounding; `evidence-inventory.json` inventories the probe and completed done-check artifacts and retains every failure line. Full project evidence is in `check.log`, `done-check.log`, their exit records, `runs/r93-done/` and `runs/r93-done-drafting/`. `baseline-inventory.json` and `final-preservation.json` cover production and own-worktree Git preservation. This report is the bounded probe's hand-over; lane 1.3's production hand-over is unchanged. Implementation and another probe require a further lead request and budget.

**For the lead**

1. Rule on a works-assault exception to 0076's shared loss contact, based on cumulative exposure constrained by sourced geometry and actual opposing fire. Keep the current production model pending that design. Reject the tested own-engaged-attacker formula, frontage reduction and terrain-term removal as remedies for Wagner; retain every existing band and 0105's rejection of the global assault-rate increase. Route independent review through Claude under 0096.

## Findings outside my scope

- Wagner's fixture does not reproduce the failed assault's result; its commander/night-decision limitation belongs to lane 1.3 with lane 1.12. Loss comparisons above do not resolve it.
- The unchanged-head timing miss requires the lead's performance/measurement owner. It was neither attributed to another process nor retried here.
- Checkpoints, operation and pushback retain 0105's owners (including R90–R92). The fresh final read of CODEX also names R94 for Missouri's cause-plus-recorded-date condition; it was not undertaken or imported. D6 clearance stays parked until 1B, with the recruitment-chain item still open. No other worktree's files or results were altered.
