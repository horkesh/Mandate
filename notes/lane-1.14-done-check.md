# Lane 1.14: the 1A done check and calibration

## S37 pushback audit (2026-11-21): delivered, 1A remains unmet

For the lead: three items. S37 only, `sprint/1a` from `ddea338`.
Report: [pushback cases](../docs/research/2026-11-21-pushback-cases.md),
with four floor traces, eight page-cited source receipts and every simulated
reservation/slow walk in CSV and JSON. Recipes accompany the data. No other
sprint was merged or implemented; no push or signature.

1. **Counter fix, `2d45c99`.** `reports.filtered` keeps its key but fires only
   for a positive deliberate hold. Pass-through and trim-only visits are
   excluded. Trims already count reports, with claims as magnitude. Four
   branch controls demonstrate this. The corrected fixture failed the two
   zero-hold cases before the fix; 59 focused tests and typecheck then pass.
   Actual hook: 173 files, 1,787 passed, nine inherited expected failures,
   three timing skips; all chained gates pass. No band was changed.
2. **Ceilings.** All 331 addressee responses are identified: 115 reservations,
   216 slow walks, zero edits or notes. S35's isolated note/edit correction
   therefore leaves these eight base-run counts unchanged [I]. Slow walks
   are all calls; reservations are 78 calls, 36 transfers and one goal.
   Temperament and deterrence are the only nonzero willingness terms.
   `complyAt` is already 10. All vectors sum; all eight follow-up log-run
   final hashes match. Of the requests, 252 join to explicit commands and
   79 to the kernel's historical-default militia call, not a seat log entry.
3. **One binding done check**, drafting and eight seeds, unchanged 400-day
   fork cap: exit 1 in 1,376.33 s, Phase 0 6/6 locally, 1A 4/6. All seven
   failure statements remain: five pushback bands, unmeasured grievance and
   unexercised border levy chain. Every numerical band and every measured
   reference counter is unchanged from S34. Reference/history median–p95
   31.66/57.63 and 31.19/49.13 ms, unchanged 40/160 limits. No CI claim.

**Proposed rulings [I]:** N3-11 needs the missing staff/ship dispatch path;
N3-27 is authorized delivery discretion; N3-06 is an outward diplomatic
reply, not incoming-wire filtering; N3-07 needs an originator-disclosure
mechanism and keeps its source qualification. Reject elapsed transport or
authorized delay as proof of reluctant relay holding, invented holders,
unrelated screening, fabricated complete wires to trim, silent deduplication,
and threshold tuning to hide absent cases. The sourced Thomas bureau
appointment (OR III-1 p. 964) is proposed separately, not applied as the
0105 filter-office holder. No pack kind currently declares a filter role.
Keep the accepted bounds binding pending the lead's ruling.

Evidence: `runs/s37/final-verdict.json`, measurement inventories, runtime
diagnostics, preservation and dossier audits, hook/check receipts and the
eight seed/log files. Readability, workspace links, a one-day startup and
counter controls preceded expensive checks. A cheap dossier-join failure
revealed the kernel-default source; it was corrected without a simulation
retry. All 1,776 tracked files / 839 runtime inputs stayed identical during
measurement; every pack, art and save fixture matches S34. All 268 reference
daily hashes, activity, replay and resumes match, zero rejections. Final
inventories and runtime diagnostics preceded final-result documentation.
Whole-branch and gate review remain deferred under 0106.

## S34 integrated candidate (2026-11-21): 1A remains unmet

One candidate on `sprint/1a`, starting at `78eb7db`. Pinned remote inputs,
in order: perf `3155d90`, people-data `637e1d4`, checks `39c279c`, playtest
`4bf2b8b`, desk `7db8c80`. S25 and S33 were still in progress when fetched;
their later commits remain to merge. No push, other-worktree write or signature.
Whole-branch and gate reviews remain deferred under 0106.

For the lead: three items. One integrated candidate is ready for the deferred
review, not for milestone clearance. Each merge has two parents and passed
the actual hook, with the Codex footer. Nothing was pushed or signed.

| Input | Merge commit | Hook tests passed |
|---|---|---:|
| perf `3155d90` | `cc41c52` | 1,669 |
| people-data `637e1d4` | `2a95ed4` | 1,681 |
| checks `39c279c` | `d617d6e` | 1,742 |
| playtest `4bf2b8b` | `954dce6` | 1,744, plus nine expected failures |
| desk `7db8c80` | `e13357a` | 1,761, plus nine expected failures |

Every hook also runs typecheck, rules once installed, boundary, licences and
the 106-record decision index; three inherited timing skips remain. The
closing hook's exact result is in `runs/s34/commit-06-result.json` and the
single final CODEX status. S25 was not yet published beyond `39c279c` at the
closing remote read. Desk has since advanced to `9c820e4`; those later S33
commits are deliberately not merged into this pinned candidate.

### Default verification

Exactly one default `npm run run:done-check -- --milestone 1a --label
s34-integrated`, eight seeds, unchanged 400-day fork cap and drafting, exits
**1** in **1,235.99 seconds**. **Phase 0 6/6 locally; 1A 4/6.** All seven
problem statements are retained in `runs/s34/final-verdict.json` and the raw
log. No parameter search, second default campaign or criterion waiver.

| 1A criterion | Result |
|---|---|
| Checkpoints | Pass as scored; Union 92,089 known men and four unknown blocks. Its existing 95,000 floor is explicitly nonbinding, and is not established by this pass. Confederate 124,167 known men, 17 unknown blocks. |
| Fought operation | Pass: the Charleston bombardment fights at Sumter; the Northeastern Virginia operation fights at Manassas. |
| Pushback | Fail: five bands below or above their fixed bounds, listed below. |
| Unknown strength | Pass for observed combat: each Union slot reads three battles/four battle-days; testbed reads four/four. This does not close the fourth Charleston source HOLD. |
| Stand-ins | Pass as scanned; remaining labelled 1B work retains its owners. |
| Lever sweep | Fail: grievance is unmeasured, and the strict border-governor levy chain is unexercised in all 24 moves. Return is best 0/8; 744 base-run calls do not establish D6 clearance. |

| Timed slot | Median ms | p95 ms | Maximum ms |
|---|---:|---:|---:|
| Union war by decision | 26.48 | 47.42 | 60.44 |
| Testbed | 3.46 | 5.07 | 8.44 |
| Union history | 29.79 | 48.92 | 65.79 |

These local Windows samples pass unchanged 40/160 ms limits. Linux CI and
the unloaded 20 ms aim remain unestablished; comparisons with other loaded
host samples are not causal saving estimates. Drafting is sound: capped-day
worst 33.7 ms; all 23 drafts together median/p95/worst 46.0/49.9/55.4 ms.

### Pushback and the proposed filter ruling

| Counter | Observed | Fixed band | Result |
|---|---:|---:|---|
| Relay objections | 2 | 0–6 | Pass |
| Relay holds | 1 | 2–6 | Fail |
| Filter holds | 0 | 1–9 | Fail |
| Trims | 0 | 1–4 | Fail |
| Reservations | 16 | 1–9 | Fail |
| Slow walks | 18 | 2–9 | Fail |
| Plan objections | 38 | 10–42 | Pass |

`seats/posts.ts:filterPostOf` requires a held filter-role post. Both filter
and trim counters have their sole writer in `tick/deliver.ts:filterReport`,
so their zero counts are structural in the vacant-role start. R92's sourced
role distinction remains: caller/mail screening is not a sourced incoming
wire filter. Also, the scorer's "filter holds" field counts
`reports.filtered`, which fires on every filter visit regardless of
`decision.holdDays`; `reports.trimmed` fires only when a claim is cut. The
lead must clarify that proxy before using a new holder to certify literal
holds. Relay objections and positive relay delays have separate writers
in `tick/orders.ts:relayOrder`; one cannot substitute for the other.

Proposed ruling [I]: hold enforcement of the filter-hold floor pending a
sourced holder and the correct traffic/counting contract. Reject installing
an unsourced holder, relabelling a caller screen, or tuning compliance to
this proxy. **No band is changed here; its current failure remains binding
until the lead changes the criterion.** Relay holds, trims, reservations
and slow walks remain failed, with their existing owners; no ninth S1
calibration comparison or additional S34 candidate was attempted.

### Bands and preservation

Relative to S1 at `78eb7db`, only two numerical mechanic bands move:

| Band | Before → after | Cause |
|---|---|---|
| Union `seats.initiative` | `around(9)` (4–18) → `around(3)` (1–6) | Import S16's dated holds: Bates and Caleb Smith lose the late conciliation motives and their three cooldown firings each; Seward/Walker remain deferred. |
| Union `planner.term.time` | Quiet 0–0 → `around(1)` (1–4) | The combined cast changes the judged candidate; dropping the existing time term changes one pick on day 136 [I]. |

The retained preflight reference and fresh checked run have the same final
hash. Thirty-one liveness rows differ from S1, including magnitude-only
changes; every before/after row is retained in `final-verdict.json`. No
additional band moves were needed after the default check. Historical
checkpoint, pushback, victory and timing limits are unchanged. The 80
pre-S18 changes and their individual causes are recorded below and in the
tracked structured ledger.

Inventories, runtime diagnostics and preservation checks preceded these
final results. All **1,776 tracked files**, including **839 runtime/pack/
prototype inputs**, have identical before/after measurement hashes. Four
workspace aliases resolve here. All 268 daily hashes match their required
repeat/replay variants; both mid-run resumes and saved-log replays pass,
with zero rejections. Union ends
`d2e9277f12d7b46dfb8ae48be469f8777f2c6b3f8e4d0f8f32adf091b0d9ee82`;
testbed retains its earlier final hash. The branch audit proves all five
pins are ancestors, no delivery is missing and no changed path is unexplained:
1,647 of 1,699 S1 originals are unchanged, with 129 scoped changed/added paths.
All 261 existing S16 World people are identical, plus S1's Saunders. Art,
save fixtures, checkpoint bands and gate files are preserved; all 29 signed
hashes pass. No build, server, browser or other-lane worktree was used.

Evidence: `runs/s34/final-verdict.json`, `branch-content-audit.json`,
`world-people-preservation.json`, both inventories, `runtime-diagnostics.json`,
the five merge receipts and the final hook receipt. A final tooling-only
correction uses `PROVENANCE_FILE` in two S18 readers that incorrectly used
lowercase `provenance.json`. A case-sensitive filesystem control fails
before the correction and passes afterward; nine focused tests, typecheck
and all four static checks pass. It changes no measured simulation input.
The closing hook supplies the fresh full engineering gate for that fix.

The original plan estimated minutes per hook and 25–45 minutes for the
default check, with cheap checks first, unchanged gates, two Vitest workers
and no expensive retry without diagnosis. The failures/corrections below
are retained; the only full default campaign took 20.6 minutes.

Performance merged as `cc41c52`: retain both cached candidate derivation and
dated appointments. Actual hook exits 0: 157 files, 1,669 passed, three skips.
The people-data startup/reference check found one liveness breach before
its hook: `planner.term.time` fires once, on day 136, versus a quiet 0–0
band. Change only that mechanic to `around(1)` = 1–4, remove its global
QUIET entry, and retain the testbed's zero band. Cause [I]: the sourced cast
changes alter which planner candidate wins when its existing time term is
dropped; no planner coefficient changes. Retained reference rescoring and
band-structure checks pass without another run. Evidence: `runs/s34/people-reference.json`
and `people-rescored.json`. S16's initiative band and reason are retained;
S1's combat/recruitment bounds and all historical acceptance bands remain.

### S34 inherited band records

The S18 merge retains its immutable 338-band origin. The append-only
`tools/rules/liveness-changes.json` records every one of the 80 differences
from that origin to this combined tree: exact before/after objects, original
observed centre, cause and this evidence pointer. Sixty-one change numerical
bounds or add a mechanic; nineteen change explanation metadata only. These
are imported S1/S16 changes, plus the one S34 time-term correction above,
not eighty new calibrations. The positive centres retain the original
`around(n)` bounds; they are not claimed as this integration's fresh counts.
The coming done check will report those counts against the retained bands.

Twenty-four records retain pre-S18 quiet/not-here transitions. They are
exactly baselined in `inherited-quiet-bands.json`, including their causes;
the staged-history guard makes that list immutable. Unlisted future
zero-floor changes still fail. The existing liveness tests continue to
require live driving tests and explanations. The checker now compares
positive numeric limits independently of `why`, rather than rejecting the
cause metadata its own Band interface permits. Three new failing controls
and a fourth immutability control pass after correction; the focused set
is 73 tests. No historical checkpoint, pushback or tick-budget limit changed.

The four S18 checks retain ten B2 findings and the three unresolved menu
roots. A fourth root, `doctrineView`, reaches current post/department data
through S1's dated concentration selection; its player-visible classification
needs the lead, so it is an exact finding, not a new permitted derivation.
Four existing kernel-only derivations have refreshed closure hashes with
their original citations and scope. The signed inventory remains 29 paths;
no signature was written. The unchanged S9 people-placement dossier moved
to `source/drafts/people/s9-people-gate.json` (SHA-256
`c4a333e4c41791cf707cb49cf30c428d26982972d3ac720f3fa42de24687c00f`),
and its writer/test use that location. It is still unsigned and unloaded.

Proposed rulings [I]: accept the explicit inherited ledger and immutable
quiet baseline; reject resetting the origin, relaxing positive `around(n)`
or allowing future quiet transitions by prose alone. Retain all 14 exact
findings for classification; reject converting unresolved menu truth reads
into broad allowances. Keep the dossier out of the playable-situation
directory; reject skipping arbitrary malformed draft JSON in the scanner.

S18 integration failure diagnosis: the first hook stopped before tests
because a Python rewrite used Windows' default text decoding and damaged
apostrophes in exact ledger records. Regenerating from UTF-8 inputs restores
the chain and quiet-baseline matches. The next hook completed all tests
with exactly one failure: the existing R47 test still opened the dossier's
old path (1 failed, 1,741 passed, three skips). A repository-wide consumer
search identifies the writer and both test readers; all now use the new
path. The dossier bytes and every historical/gated assertion are preserved.
Before repeating the hook, rerun that entire authoring file, the apply test,
typecheck and all four static checks. Retain both failed logs; this retry
answers whether all consumers now agree on the corrected location.

### S34 desk integration checks

Playtest merge `954dce6` retains nine expected failures; they are open defects,
not fixes. The desk merge retains the request-freeze, candidate and opening
report caches alongside its desk cache. The situation schema is regenerated.
Root/desk typechecks pass; 14 focused cache/projection/history controls pass.
The desk unit suite is 110 passed, eight optional geography checks skipped:
this worktree lacks their ignored derived map inputs. No skip or selector
changed, and no browser, capture, geometry or package campaign was started.

The desk's public projection helpers change the closure of `viewFor` and
`pendingRequests`, but not their protected read paths. Refresh the existing
view derivation with its original citation, and the one still-unresolved
request fingerprint; the 14 identities remain identical. Receipt:
`runs/s34/desk-fingerprint-receipt.json`. S18's history guard would otherwise
reject the explicitly authorized integration migration. A red/green control
adds a narrow exception only while MERGE_HEAD is the exact requested
`7db8c80a605c4410f458487778cadc7008ac8909`: existing projection identities
may migrate their hashes, while new identities, other rules, other heads,
abbreviated heads and ordinary commits still fail. The baseline does not
grow. Proposed ruling [I]: accept that one named-merge reconciliation;
reject a permanent refresh switch or a blanket permission for future merges.

## S1 delivery for lead review (2026-11-21): 1A remains unmet

S1's bounded integration/build/test/calibration work is delivered on `sprint/1a` in `C:/Pyrrhic/sprint-1a`, from `ceff796`. `npm ci` ran first: exit 0, 51 packages, zero vulnerabilities. No push, history rewrite or other-lane write. Every completed commit used the real hook and Codex footer. The five requested merges are separate and ordered; R97 was read from its supplied worktree without changing it. Independent review and gate signatures remain deferred to Claude under 0106; nothing is signed here. The current delivery has a source HOLD and unmet acceptance, so it is not a claim that 1A is finished.

| Commit | Delivery |
|---|---|
| `1802907` | Merge northern concentration and sourced calls into sprint/1a |
| `e76c334` | Merge bombardment battle records into sprint/1a |
| `f72c709` | Merge dated rule-seat appointments into sprint/1a |
| `df291e6` | Merge independent initiative threshold into sprint/1a |
| `9d0ad82` | Merge bounded assault-contact findings into sprint/1a |
| `bf6cc66` | Integrate state-force acts with northern concentration |
| `7032e4e` | Source three Charleston opening strengths |
| `ca428f7` | Date department appointments and Harpers Ferry command |
| `cffb0d1` | Implement sourced national enlistment paths |
| `9edd547` | Close battle chronology and command regression gaps |

The closeout commit carries ordinary `complyAt: 10` (from 150), keeping `initiativeAt: 150`, the final handovers and the source-only correction below. This is the best tested partial improvement preserving every non-timing Phase 0 criterion, proposed for review. Reservations still fail 16 against 1..9. Reject 3/5 despite their passing reservations count because their required recruitment-delay floor fails; reject 30/50 as worse reservation results. No historical band is widened and no failure is waived.

The integration's full default eight-seed check with drafting passed all five non-timing Phase 0 criteria before the final build. The final eight-seed/drafting comparison again passes all five; timing fails at the unchanged 40/160 ms budget. The final result is Phase 0 **5/6**, 1A **4/6**, exit 1. Pushback and D6 remain unmet. The complete result, all failures and recommendations are `runs/s1/final-verdict.json` and `calibration-08-done.json`.

### The completed eight-comparison budget

Comparison 1 explicitly reuses the unchanged post-build `national-final` history; it is not a new rerun. Comparisons 2-6 each change only ordinary compliance against that control. Comparison 7 changes only the seed against 4. Comparison 8 verifies the selected configuration with the complete default harness, all 8 seeds 1861-1868, the unchanged 400-day ceiling, replay/save and drafting. There was no ninth comparison. The control reuse is proven by `control-reuse-proof.json`; exact commands/configurations and fixed-band hashes are in `calibration-plan.md` and `calibration-manifest.json`. Candidate mechanical and sourced bands were never recentered.

| Comparison | Single comparison/control | Reservations | Delayed calls | Union reference liveness |
|---|---|---:|---:|---|
|1|reused sourced build; complyAt 150; seed 1861|101|55|PASS after build-only reconciliation|
|2|complyAt 3 vs 1|5|19|FAIL: below fixed 27 floor|
|3|complyAt 5 vs 1|5|19|FAIL: below fixed 27 floor|
|4|complyAt 10 vs 1|16|29|PASS|
|5|complyAt 30 vs 1|39|37|PASS|
|6|complyAt 50 vs 1|75|42|PASS|
|7|seed 1862 vs 4, same 10|18|34|five sensitivity breaches; checkpoints/operation/unknown-strength pass|
|8|full default verification at 10|16|29|all required reference/exercise bands PASS|

The low-threshold recruitment counter is not dead: `recruitment.slow_walked` counts any accepted call with positive muster delay, including reservation rungs. Promoting these to ordinary compliance reduces it to 19. That explains the observed failure; it does not authorize moving its 27 floor. Seed 7 additionally fires the guarded Minnesota renewal, while the default reference correctly lacks an eligible regiment. Its five fixed-band sensitivity breaches are stragglers returned 179, pocket relief 1, relay-held 0, renewal 1 and battle orders 18. These are retained, not hidden or recentered. Initiatives remain 9 in every history probe.

### Final verdict and next bounded work

| Criterion | Verdict | Recommendation |
|---|---|---|
| phase 0 behaviour | PASS | park tuning; preserve the working mechanism |
| phase 0 hash | PASS | park; retain deterministic checks |
| phase 0 resume | PASS | park; retain save/replay controls |
| phase 0 liveness | PASS | park band changes; preserve fixed required floors |
| phase 0 section-ten | PASS | park; preserve single owners and pure kernel |
| phase 0 budget | FAIL | continue with S2 on integrated runtime; no budget increase |
| 1A checkpoints | PASS | park numerical tuning; preserve sourced bands |
| 1A operation | PASS | park forced-battle work; retain emerged battle and record regressions |
| 1A pushback | FAIL | continue source/role mapping and bounded compliance work; no ninth comparison here |
| 1A unknown-strength | PASS | park calibration; continue the fourth Charleston source HOLD |
| 1A stand-ins | PASS | park 1A replacement work; route remaining named stand-ins to 1B |
| 1A lever-sweep | FAIL | parkD 6 clearance to 1B under 0105; continue strict new-border-governor levy chain |

Pushback: relay objections 2 and plan objections 36 pass. Relay holds 1 vs 2..6, filter holds 0 vs 1..9, trims 0 vs 1..4, reservations 16 vs 1..9 and slow walks 15 vs 2..9 fail. Continue the specific missing causes. The read primary OR III-1 p.324 gives Scott's July 8 telegraph restriction, confirmed by Cameron, but names no censor. Retrospective public-censorship leads do not establish a holder for the modeled incoming presidential-report filter. Do not install Nicolay as a wire censor from the sourced caller-screening evidence, or substitute public censorship without resolving its traffic, source and gate contract. This is a source/role-mapping HOLD, not permission to park all 1A or relabel another screen as a filter hold.

D6: 744 base-run recruitment calls, 8 gated decisions weighed, return best 0/8 seeds. That numeric result is diagnostic only: the victory measure still lacks the people/grievance channel and all 24 strict border-governor levy chains are unexercised. 0105 parks clearance to 1B while requiring the chain item to continue. Institutional transfer and voluntary remuster remain excluded from new border-governor levies. No D6 clearance.

Final timing on this shared Windows host: Union war-by-decision median 55.44 ms, p95 151.27 ms; history median 60.57 ms, p95 135.14 ms. Both medians fail 40 ms; both p95 values remain below 160 ms. S2 owns the integrated performance/CI work; this is not a Linux measure or a budget increase. Drafting is sound: 23 commands, 16 with land forces; day median 42.9 ms, p95 49.0 ms, worst 53.7 ms; capped day worst 25.4 ms. Drafting remains informational under the existing contract.

### Build outcomes and remaining source limits

The per-build histories and daily tables below remain the detailed record. R97 produces Stone/Beauregard at Manassas July 27-29, starting 45,600/40,000 and ending 43,175/54,144. Three sourced Charleston strengths leave that July unchanged. The dated-command and separate Johnston histories produce McDowell/Beauregard July 25-29, 45,600/40,000 first day and 43,532/53,932 last. The national build and selected final configuration produce McDowell/Beauregard July 27 and 29:90,600/40,000 then 83,156/16,000 present. These are model outputs, not historical strength returns. July 31 known strength 99,791 Union/124,218 Confederate; unknown blocks 4/17. None fights unknown in the checked histories. The distinct public-word console route fights under Stone and receives 28 hour-stamped July dispatch lines; it does not borrow the rule-seat appointments or inject battle state.

The four Charleston requests yielded three read counts (Johnson 100, Palmetto 146 mixed, Rifles 450) and a fourth **source HOLD** for Anderson's First SC Regular Infantry. 960 all-State-regulars is not that regiment; 700 in August 1862 cannot be backdated. Additional bounded newspaper/OR/NPS/State-report searches did not supply a separate opening return. The final newspaper collection lead failed retrieval and contributes no adopted fact. Preserve unknown rather than invent a fourth count.

The national path covers 16 additional quotas/56 regiments, keeps the earlier New York tender and Indiana June 11 call distinct, implements the Minnesota unit's guarded voluntary remuster rather than a duplicate levy, and supplies a three-arm central Regular recruiting path. The Regular organization minimum 18,154 and maximum 22,714 are not enlisted strength. Actual men remain unknown; Smith may object and does in the default history. Individual remuster consent/replacement remains a labeled 1B stand-in. Patterson's sourced July 27 discharge is still not implemented by the appointment rows. No unsourced retirement/faction change was added.

A closeout source audit corrected the Saunders rationale:0055 requires his starting post/home, not a future office. The read official 1880 Congressional Directory (second edition corrected 29 January, F. A. Richardson, GPO; Nebraska/Senators/Alvin Saunders entry), corroborated by the official Biographical Directory, supports the Iowa-home mapping [I]. The source row and cast audit now cite it. Union remains unchanged; no birth/death, judgement or other simulation cell is populated. The biography is conservatively classified secondary for 1861 home inference. This supersedes the earlier mistaken future-office rationale, not 0055.

The source correction was applied only after comparison 8 completed and all 300 runtime hashes were identical before/after. Generated-World equivalence proves that **only Saunders's provenance list changes**; every other World field is identical. The old measured World/pack remain archived. No behavioral campaign is repeated for this metadata correction. `source-metadata-equivalence.json`, `saunders-source-correction.json` and the required full hook retain the proof and new World validation. Source inventory:48 retained entries, only cited/read passages claimed, at `C:/Pyrrhic/mandate-research-sources/S1/sources-read.json`.

### Verification, preservation and review

The test-gap commit's full hook passed 154 files/1,669 tests, three optional timing skips and **no expected failure**. All 8 console tests also pass at 10. New bombardment cadence, actual capital-dispatch/save and in-transit command-parent regressions pass; P1-P3 already exist and pass. The original B4/B5 and V4/C2/C4 descriptions remain unavailable: these named contract regressions do not certify unavailable IDs closed. The lead must reconcile those IDs during review.

Before writing this final result, package diagnostics (`npm ls --depth=0`, Node 22.23.2), affected source test/19 cases, typecheck, generation, boundary, licences, decision index, artifact inventory and preservation audit pass. Historical `checkpoints.json` has exact base/final SHA-256 `a45b94342892cd8954cdf72ca11478ae77b7026b1239300125fbade34cc42b9f`. Testbed data/day 40 save and this worktree's own CODEX copy are unchanged. Only Saunders's source/note columns differ from the national cast inventory; all cast values and all other rows are preserved. Eight-comparison inventory has 17 retained artifacts, including two checked summaries/two mid-run saves. All workspace links resolve here.

The closeout commit requires one final real full hook, with the affected gates already preflighted: two workers, 600-second setup ceiling, all collection/assertions intact; expected 4-6 minutes. Stop on failure, inspect all categories, verify a targeted correction before any required retry; no new calibration. Evidence: `runs/s1/closeout-hook.log` and `closeout-hook-exit.json`. Final audit/inventory paths: `final-audit.json`, `final-evidence-inventory.json`, `runtime-diagnostics.json`, `final-runtime-candidate.json`. All logs remain in ignored `runs/s1/`; no raw scan is committed.

Proposed rulings [I]: retain 10 as a partial compliance improvement with unchanged initiative admission; accept the sourced command/quota paths, unknown actual Regular strength, conservative whole-unit renewal and due-until-sent appointments; retain the remaining source/lifecycle holds. Reject fabricated strengths/levies, future-office starting sides, retrying a refused appointment, moving candidate bands, relabeling transfers/remusters as a new levy, forcing battle, or claiming D6 from 0/8 alone. The lead rules after independent/gate review; no accepted decision record or signature was written here.

## S1 sprint integration record (2026-11-20)

S1 works only in `C:/Pyrrhic/sprint-1a`, branch `sprint/1a`, from `ceff796`, under 0106. `npm ci` ran first (exit 0, 51 packages, zero vulnerabilities). Independent review and gate signatures are deferred to Claude after the sprint. No push or other-lane write is authorized.

Sequence: merge `a0b4524`, `23879c4`, `cfa2c5a`, `cf31f31`, `179be08`, each through the hook; read/import R97 and recenter its mechanical liveness breaches with `around()` and causes; verify integrated history and the default done check; finish the four sourced build items, reporting July after each; close the named test gaps; spend the second eight-comparison calibration budget and recommend continue or park per criterion. Historical checkpoint and pushback bands remain binding; only the mechanical liveness bands may be recentered as S1 instructs. Timing stays 40/160 ms and belongs to S2.

Validation plan: generate schemas, both affected Worlds and the save fixture with their tools; typecheck and focused affected tests before each full hook. One 148-day replay-free history probe costs seconds and rejects broken assumptions before the hook (typically 3–6 minutes). The integrated default eight-seed done check with drafting costs about 20 minutes; it must pass all non-timing Phase 0 criteria. After unexpected failure stop, inspect all failure categories, reproduce/fix cheaply, then repeat only the affected required gate. Reuse unaffected evidence. Run output stays in ignored `runs/s1/`, one folder/label per measurement. The eight calibration comparisons are a separate bounded budget, opened only after build integration. No expensive campaign outside this scope.

First merge: combine main's resignation and review-note fields with R90/R98's call and reassignment fields. Generated schemas, Worlds and day-40 save are regenerated. No side's behavior is discarded. The 148-day probe has zero rejections; Johnston's eligibility changes allocation and this intermediate history has no field battle. Mechanical bands: captures 0 uses `quiet()` (the helper rejects zero, and testbed still drives captures); joining 39 and support 16 use `around()`, with causes in code. The first full hook failed only the stale resignation fixture (1,565 pass, one expected fail, three timing skips): it still expected Virginia on day 46, before R90's wire correction. Correct its pre-event/eve lengths to day 42/47 while preserving Johnston's day-48 assertion. Targeted verification precedes the required corrected hook.

The corrected first-merge suite passed 1,566 tests, one existing expected failure and three optional timing skips, then boundary rejected two historical names added in explanatory comments under `packages/`. Those comments are now generic; boundary/licences/decisions pass. The next hook timed out only the done-check test's 300-second setup under file concurrency (142 other files passed). Its isolated rerun passes all 14 applicable tests in 192.55 seconds. Use Vitest's supported `VITEST_MAX_WORKERS=1` for subsequent full hooks on this shared machine: serialize this lane's test files, preserving collection, timeouts and assertions. No CI or timing budget change. Logs retain all failed attempts; another hook is required because the commit must pass it.

Merge 1 committed through the full hook as `1802907`: 143 files, 1,566 passed, one inherited expected failure, three optional timing skips; all chained gates passed. Serial duration 662.46 seconds. Merge 2 combines the immutable bombardment record with this history, retaining R95's `around(49)` support centre. Its cheap 148-day history has zero rejected commands and zero liveness breaches; Confederate planned operations now score one via the real fort record. Typecheck/boundary and 30 focused bombardment tests pass. Use the already verified two-worker bound for this next required hook to reduce the serial gate's eleven-minute cost; no timeout, assertion or collection change.

Merge 2 committed as `e76c334`: 143 files, 1,571 passed, one inherited expected failure and three optional timing skips; chained gates pass. Merge 3 preserves both sourced appointment contracts in one discriminated union: effective-date, rules-driver-only appointments and cause-dependent reassignment from an expected old post. Both travel through the normal appointment verb. Creation telemetry fires only after the destination appointment succeeds. Its focused six-file check passes 113 tests. The first focused failure exposed a duplicate fixture post-kind identifier; replace its creation rule instead of appending a conflicting second definition. The 148-day probe has zero rejections and no liveness breaches. July has no field battle; known strengths remain Union 62,686 and Confederate 46,457. Logs: `runs/s1/merge-3-*`.

Merge 3 committed as `f72c709`: 144 files, 1,581 passed, one inherited expected failure and three optional timing skips; all chained gates pass. Merge 4 retains resignation's weekly step and takes the independent `initiativeAt` rule, at its behavior-preserving 150 in both packs. Schemas, both Worlds and the save fixture are regenerated; only the save's `worldHash` changes. Typecheck, boundary and 283 focused tests pass. The history's 148 daily hashes, ten checkpoint rows, daily telemetry and final hash match merge 3, with zero rejected commands and no liveness breaches (`runs/s1/merge-4-preservation.json`). R92's sourced empty-filter finding remains a limit, not permission to invent a holder.

Merge 4 committed as `df291e6`, through the full hook and all chained gates. Merge 5 is the read R93 assault-contact report only. It retains the failed exposure formula and unchanged production model; no historical, loss-ratio or absolute-loss band is moved. Reuse merge 4's behavior evidence because no executable or pack input changes in this merge. R97 is next.

The first merge-5 hook stopped at the done-check setup's 300-second deadline: 143 other files / 1,571 tests pass, one inherited expected failure, 17 skips (14 caused by the failed setup, three optional timing checks). Boundary/licence/decision gates were not reached; merge 4's unchanged-input evidence is retained. Stop and diagnose, not a two-worker retry. An isolated one-worker run also exhausted 300 seconds. The bounded 600-second probe passes all 14 applicable assertions in 282.14 seconds, with the existing optional timing skip. CPU samples of 69-79 percent and about 12 GiB free memory establish host observations only, not a cause. The revised approach makes the one named runner setup ceiling 600 seconds and uses one file worker for the hook. Every assertion, collected test and milestone/tick budget is preserved. This runner-only change is a proposed ruling; reject skipping the setup, suppressing a failing criterion, or attributing a production regression without evidence. Evidence and stopping rule: `runs/s1/merge-5-timeout-plan.json`. Another setup timeout stops expensive retries for a new diagnosis.

Merge 5 committed as `9d0ad82`: 144 files / 1,585 passed, one inherited expected failure, three optional timing skips; all chained gates pass. The one-worker full hook took 1,176.06 seconds. That settles the runner-bound correction. Subsequent required hooks use two file workers with the verified 600-second setup ceiling: the earlier two-worker suites completed in 364-488 seconds and failed only the old ceiling in the latter case. This is an elapsed-cost choice, not a causal host-performance claim. No timeout, collection or assertion is changed again.

R97 is imported from its read-only worktree, retaining both R98 concentration rows, its appointments and the Union doctrine. Seven notices replace only the eleven institutional transfer requisitions. The import guard stopped before strings because its expected fourteen omitted two reason labels; all sixteen additions were inspected, and only the remaining strings/hand-overs/manifest were resumed. Source hashes and removed identities are in `runs/s1/r97-import-manifest.json`. Generated situation schema and Union World come from their tools. Typecheck and boundary pass; four focused files / 28 tests pass. The retained 148-day history has zero rejected commands. Its 43 changed mechanical counts, including the five requested rows, are recentered with `around()` and a cause each; the formerly global quiet pocket-relief mechanic now fires once in Union and remains explicitly quiet in testbed. Retained-row rescoring passes without replaying unchanged history. Two compatibility files / 21 tests pass, with the inherited console battle expected failure still present. Historical checkpoint/pushback files are untouched.

R97 July: Stone at `us_dc_militia` fights Beauregard at Manassas on days 144-146 (27-29 July). Day one is Union 45,600 / Confederate 40,000; day three 43,175 / 54,144. These are model BattleRecord strengths, not claims about the historical battle. Johnston resigns from Union service on day 48, then takes the Harpers Ferry post on day 71 through the normal appointment. Known 31 July strengths are Union 58,497 / Confederate 130,862, with four/twenty unknown blocks respectively; no unknown block participates in the five recorded battle-days. All checkpoint and fought-operation scorers pass. Pushback still fails holds, filter holds, trims, reservations and slow walks; D6 requires the full default run. Evidence: `runs/s1/r97-integrated*.json`, `r97-band-reconciliation.json`, `r97-rescore.log`.

R97 committed through the full hook as `bf6cc66`: 147 files, 1,611 passed, one inherited expected failure, three optional timing skips; all chained gates pass (497.59 seconds). The default integrated eight-seed CLI check, including drafting and the original 400-day fork cap, exits 1 after 2,831.96 seconds. All five non-timing Phase 0 criteria pass; timing alone fails (Union medians 52.46/52.82 ms against 40, p95 79.76/82.18 against 160). All 298 tracked runtime inputs, HEAD and workspace links are identical before/after. No repeat is needed. Evidence: `runs/s1/integrated-{done.log,done-exit.json,verdict.json,runtime-before.json,runtime-after.json}`.

1A baseline: checkpoints, fought operation, unknown strength and stand-ins pass. Pushback fails five unchanged bands. D6 has return best in 6/8 seeds, the missing people/grievance channel, and no qualifying border-governor answer in any of 24 policy forks. The latter remains an unmet recruitment-chain criterion; transfers and remusters cannot satisfy it. The clearance limitation stays parked under 0105, not waived. Drafting: 23 commands, 16 with land forces; uncapped median75.1/p95 90.3/worst93.9 ms; capped worst54.8 ms. Logs retain every category, including those that do not set the default exit.

### S1 Charleston source snapshots (2026-11-21)

Fort Johnson100 and Fort Palmetto146 are the State Historian's retrospective distribution at Beauregard's arrival on 3 March (report for 1899, published 1900, p. 13, scan checked). Palmetto is explicitly infantry and artillery combined, so its arm becomes mixed. Rifles450 is the Charleston correspondence of 3 April in the New York Herald, 9 April p. 2, checked against LOC. Carrying snapshots into the 5 March opening is labelled [I], preserving their actual snapshot dates. New provenance entries disclose source level and licence.

The fourth infantry count remains a source HOLD. The same SC report's 960 is all three regular arms, and 700 is dated30 August 1862; neither is substituted. Bounded OR, NPS and 1861 SC-report searches yielded no adopted separate opening count. Two additional newspaper pages could not be retrieved; unread material supplies no fact. Retained sources and limits: `C:/Pyrrhic/mandate-research-sources/S1/sources-read.json`, `remaining-source-limits.json`.

The new four-case regression first fails all four assertions, then the generated World passes it and the existing world suite (23 tests). The148-day history has zero rejections and no liveness breaches, with checkpoints/operation/unknown-strength passing and the same five pushback failures. July is unchanged at Manassas: Stone vs Beauregard, 27-29 July; Union/Confederate 45,600/40,000 on 27th, 44,300/38,969 on 28th, 43,175/54,144 on 29th. Final hash `7db435f81d9d7953c2604d9dad5683a341a48f685c72cb1a35576b8af354f229`. These are model strengths, not historical claims. Evidence: `runs/s1/charleston-*` and `charleston.json`.

The first Charleston hook exits1:147 other files/1,614 tests pass, one inherited expected failure and three optional timing skips; only the R74 Sumter whole-result hash fails. The new100 known artillerymen change its numerical firing terms, so the old claim of identical inputs is stale. No production value or expected hash is changed to fit it. The correction explicitly restores the old unquantified attackers inside a test-only control, retains the original pre-R74 full-proposal hash, and separately checks that the current pack adds100 firing men while preserving surrender, musters, command, people and control. Both affected files/10 tests, typecheck, boundary, licences and decisions pass. All failure categories are retained in `runs/s1/charleston-hook.log`; the later gates were not reached by that hook and are now checked cheaply. The147 unaffected files and settled history evidence are reused. A corrected full hook remains required to commit; one attempt, stop and consolidate if another correction fails.

Proposed ruling [I]: adopt the three read counts and the mixed-arm distinction, retain the fourth as unknown. Reject an aggregate allocation, a paper establishment or an1862 return as an opening headcount. Remaining build items and the calibration budget stay open. Next required hook asks whether this coherent source-data step preserves the full check; two workers, 600-second setup ceiling, expected 8-12 minutes, one attempt, stop on failure. No runtime edits while it runs.

### S1 dated command placements (2026-11-21)

The Charleston step committed as `7032e4e`, through the corrected full hook:148 files, 1,615 passed, one inherited expected failure and three optional timing skips; all chained gates pass. The required suite took541.25 seconds. No production change was made for its fixture correction.

Patterson's Pennsylvania command opens on 27 April (GO 12 section 3 p. 31; OR I-2 chronological summary p. 1). McDowell's Northeastern Virginia command opens on 28 May, distinguished from the 27 May creation/assignment order (GO 26 p. 61; OR I-2 chronological summary p. 2). Arlington headquarters is in his1 June report, OR I-2 pp. 59-60. The declared posts start unopened, create no troops and open only through an accepted ordinary appointment. [I] The same temporary-command representation as R89 and the northern_virginia map region represent these departments. New levies and the old DC concentration join McDowell through existing transfers; the old July 16 goal names his new command. No battle is scripted.

Rules-only `historicalAppointees` reserves a future effective-date appointee from generic vacancies. A positive-control test offers one candidate and one vacancy: it appoints him with no reservation and skips him with the reservation. Human/AI menus receive neither this list nor due historical offers. There is no new State field. An offensive may name an own-side declared post, but the ordinary menu cannot command it before it exists. Butler's regression continues to assert his own appointment, not that no other historical appointment can exist.

The appointment regressions first fail the three missing behaviors, then44 focused tests and typecheck pass. The separate148-day appointment history has no rejected commands. Thirty changed mechanical counts are recentered with causes; a former globally quiet time term now decides one Union pick, while this command's supply term decides none and remains live in testbed. Retained-row rescoring has zero breaches. Historical checkpoint/pushback bands are unchanged. Manassas is McDowell vs Beauregard on 25-29 July:

| Date | Union commander | Union present | Confederate commander | Confederate present |
|---|---|---:|---|---:|
| 1861-07-25 | mcdowell_irvin | 45,600 | beauregard_pierre_g_t | 40,000 |
| 1861-07-26 | mcdowell_irvin | 45,072 | beauregard_pierre_g_t | 39,472 |
| 1861-07-27 | mcdowell_irvin | 44,552 | beauregard_pierre_g_t | 38,952 |
| 1861-07-28 | mcdowell_irvin | 44,039 | beauregard_pierre_g_t | 38,439 |
| 1861-07-29 | mcdowell_irvin | 43,532 | beauregard_pierre_g_t | 53,932 |

Model strengths only, not a claim about the historical battle. Known31 July strengths are Union 54,732 / Confederate 123,842; four/seventeen unknown blocks, none fighting. Checkpoints, operation and unknown-strength pass; the same five pushback bands fail (reservations81, slow walks13). Hash `94882cc6f96a3337e2178a82bb0c612aaa539c17365207c3ba063996ac440a5d`. Evidence: `runs/s1/appointments*.json`, focused/type/boundary logs.

Johnston's own14 October report, OR I-2 p. 470, dates his assumption at Harpers Ferry to23 May, distinct from the 15 May assignment (pp. 844-845). [I] Move only the appointment/concentration earliest date to23 May, retaining Virginia's side and his real service-change prerequisites. The old fixture that rewrote his starting faction is replaced with the ordinary history: Union Quartermaster General initially; resignation on day 48; unposted until the normal appointment opens Harpers Ferry on day 79. The new test first fails against the old early opening, then both affected files/nine tests and typecheck pass. The appointment creates no force.

The separate post-Johnston history has zero rejections, the identical five-day Manassas table above, and passing checkpoint/operation/unknown-strength scores. Fifteen mechanical counts move; neither reference now reopens a pocket, so its zero is explicit and the existing `map-tick.test.ts` case “then its opening” remains the named live driver. Retained-row rescoring has zero breaches. Hash `1891f2628ab165afc1773592d7d235f45ffe7e9d80b8ed0bc52b5d607a4fd5ba`. Evidence: `runs/s1/johnston*.json` and logs. Both intermediate histories are retained rather than rerun.

Proposed rulings [I]: use sourced assumption dates with the normal delivered appointment; reserve future rule-seat appointees from generic vacancies; allow a guarded declared command in the existing offensive doctrine; retain the disclosed aggregate concentration approximation. Reject changing opening factions, forced appointments, new calendar armies or forced July junctions. Patterson's 27 July discharge (GO 46,19 July, pp. 83-84) needs service/office expiry behavior beyond these appointment records; it is reported, not simulated as a resignation or faction change.

The two formerly unavailable Keowee Courier pages were subsequently retrieved through their plain-text endpoints; page4 was read too. They provide officer appointments and combined island/fort strengths, not a separate opening infantry return. The fourth Charleston count remains a source HOLD. Sources and retrieval corrections are retained outside the worktree.

Next required hook question: do these coherent command-roster changes pass the full mandatory check with non-timing Phase 0 preserved? The cheapest checks are the focused command tests, typecheck, boundary, sound band table and named pocket driver. Then one two-worker commit hook, expected 9-12 minutes, with the existing600-second setup bound; stop on a failure and inspect every category. National enlistment and test-gap work follow this commit. No second calibration comparison has run.

Proposed rulings: retain the bounded 600-second runner setup ceiling after its failed 300-second configurations and passing isolated/full probes; use the bounded file concurrency described above. Preserve both appointment contracts instead of dropping resignation-aware reassignment or effective-date history. Remaining work is the sequence above.

### Findings outside my scope

Linux timing belongs to S2; independent review and gated-item signatures belong to Claude and the gate reviewer after the sprint.

**Current, R94 (2026-11-20):** Missouri now requires a received call and the recorded date, day 148, replacing R85's fitted 105-day wait. Six Missouri regressions and the required check pass. The full binding done check exits 1: Phase 0 6/6; 1A 2/6, with the same four failed categories as R85. R94 below supersedes only R85's Missouri interval and proposed acceptance of that interval; its eight-comparison record and other findings remain historical evidence. Claude's independent review is pending.

Branch `phase1-done-check-1a`, from main at a38d7ea. It builds FOUNDATION section 12's row 1.14, Part A: the harness that scores 1A's done check. Part B, the calibration runs, waits for lanes 1.11 and 1.12. `run:done-check` now reports 1A's six criteria beside Phase 0's six. Each is PASS or FAIL, with its reasons.

### S1 national volunteer and Regular paths (2026-11-21)

The command-roster commit is `ca428f7`: full hook 149 files, 1,620 passed, one inherited expected failure and three optional timing skips; all chained gates pass (505.80 seconds).

Sixteen distinct additional state quotas, 56 regiments, now issue through ordinary calls: OR III-1 pp.203-204,207-208. New York's fourteen are additional to its earlier long-term tender, as Scott's May16 letter on p.208 says; Indiana's June11 six remain separate. The seventeenth documented quota is Minnesota's existing regiment, not another levy. The read retrospective regimental history (1916, p.17) describes the voluntary May11 remuster, original April29 credit and replacements for decliners. A guarded, notice-only renewal changes only the eligible surviving whole unit's current term and optional source, preserving its actual model muster credit, men, original call, location and assignment [I]. No unit is fabricated after refusal, expiry or late muster. The existing `forces` owner applies it; ownership and FOUNDATION describe it. Aggregate consent/replacement is explicitly a 1B-owned stand-in, not individual agency. The governor carries the administrative notice [I]; no words are attributed. A vacant Adjutant General cannot carry it. Renewal never counts as a new governor levy or a D6 chain completion.

A declared recruiting office under the existing Adjutant General opens by C. F. Smith's accepted ordinary appointment on April27 (GO12 section4 p.31, return to previously assigned duties). GO16 May4 pp.36-40 directs eight infantry, one cavalry and one artillery regiments. The visually checked minimum18154 and maximum22714 are organization, not a return. Three separate ordinary calls retain unknown actual strength and the proper arms; no five-day automatic paper army is fabricated. Three-year terms use July29 act section5 p.101 retrospectively [I]. The later ninth infantry increment is not another nine-regiment levy. Unknown-strength recruiting units stay at the bureau under the existing concentration rule. The actual Smith objects to all three in this history; a separate fictional willing-holder control proves all three can muster distinctly with unknown strength. A numeric-organization regression also prevents converting an explicit eight-regiment quota into seventeen default-sized regiments.

Nebraska uses its existing government/region and an ordinary governor post, initially vacant. Saunders has minimal identity, unsourced traits/dates unknown, an Iowa-home starting-side inference under0055 (source correction above), and a May15 dated appointment representing first-read confirmed holding (his p.204 letter), not the legal appointment date. Its call follows his actual appointment. No Native Nation recruitment was added.

The first national history exposed an opening-screen assumption that the earlier smaller build missed: the exact-day historical offer disappears if attention cannot pay that day. It lost McDowell and had no Union fought operation. Retain that evidence in `runs/s1/national*`. Correction [I]: an unsent dated appointment stays due and its candidate reserved until its own letter is sent; an answer/refusal is not retried. Only identities of the principal's own letters are read. Human/AI menus remain unchanged. Red/green tests cover delayed offers and final refusal. The corrected history opens McDowell on day85 (May29), through delivery, not a calendar write. Patterson remains day53, Johnston resigns day48 and accepts Harpers Ferry day79, Smith day53. A dated row still does not retire Patterson on July27; that lifecycle remains a sourced limitation.

Corrected July: McDowell vs Beauregard at Manassas on July27 (day144), Union90,600/Confederate40,000 present, and July29 (day146),83,156/16,000. July31 known strength99,791/124,218, unknown blocks4/17. These are model outcomes, not historical returns. Checkpoints, fought operation and unknown-strength pass; pushback remains five failures: relay holds1, filter holds0, trims0, reservations101, slow walks15. Other pushback bands pass. Final hash `f7433fac6baf5230e09788add23c3d9dda2bb088f983b00ed4e76c0718ea0ffc`, zero rejected commands. Minnesota's April call is refused, so the notice correctly never fires. Both reference runs leave renewal quiet; its unit-conservation test proves a real renewal, one renewal firing and zero new musters. Forty-seven changed mechanical counters are recentered from this build, with causes; the time term now has its existing live planner case. Retained-row rescoring has zero liveness breaches. Historical checkpoint/pushback bands are unchanged.

Focused evidence: initial missing paths failed13 tests; corrected affected tests pass, including60 appointment/renewal/pack tests after the delayed-offer correction, a fictional three-arm recruiting control, schema guards and declared-post guards. Typecheck, generator, unchanged Testbed save and boundary pass. `runs/s1/national-final*`, `dated-delay-red/green.log`, `regular-fixture-trace.json` retain details. The full collection remains required; one real hook with two workers and600-second setup ceiling, expected8-12minutes, all assertions/gates unchanged. Stop expensive retries on any failure and inspect all categories. Freeze runtime during it.

The first national hook failed only two stale fixture assumptions: Butler asserted that no other due appointment could exist, and the cast audit excluded the one new minimal identity. Correct only Butler-specific selection/assertions and the explicit Saunders inventory count/inference. Both affected files/21tests, typecheck and the three unreached boundary/licence/decision gates pass. Reuse the152 unaffected files/1,661 passing-test evidence and the unchanged history. One corrected full hook now asks whether those fixture corrections restore the required collection; same two workers/600-second setup ceiling, expected5-10minutes, stop and consolidate on another failed correction.

Proposed rulings [I]: accept the read quotas and central unknown-strength path, whole-unit voluntary renewal with original model credit, and due-until-sent dated appointments. Reject organization-as-enlisted-strength, duplicate Minnesota/Regular levies, refusal bypass, invented individual consent, or counting remuster/transfer as a new border levy. Separate review and signatures remain Claude's after0106.

### S1 open regression gaps (2026-11-21)

National paths committed as `cffb0d1`, through the corrected full hook:154 files,1,663 passed, one inherited expected failure and three optional timing skips,270.16seconds; all chained gates pass.

Added two direct bombardment-record regressions: an interrupted firing schedule closes on its actual last firing day and restarts at day one; a one-day record cap retains yesterday's record instead of overwriting it. A high-boldness fixture prevents accidental surrender from invalidating the interruption premise. Added an actual dispatch from a moved State capital, with save/resume preserving the origin and no World-start fallback; and an in-transit appointment whose declared parent changes side, preserving the source holder and leaving the destination unopened. Three new direct-phase cases initially lacked declared telemetry; supply the normal complete mechanic list, then both affected files/34tests pass. The other three focused files/12tests already pass. Production code is unchanged.

The console opening/selectors pass before the bounded public-word history. Its player explicitly sends the sourced separate New York long-term call and ordinary concentration, edits the submitted intermediate arrow, then resumes/approves the original Manassas goal. Selectors and dates come from printed desk output, with no State/World/runner/injected battle. It receives28 distinct hour-stamped dispatch lines by July31; first reported fighting is day134 (July17), Stone at Manassas, dispatches08/12/17/21received day135. This human route differs from the rule-seat history, which appoints McDowell. The old expected-failure now unexpectedly passes and is converted to ordinary `it`. Battle existence and chronology are separate hard assertions; chronology checks each printed received list, not duplicated `inbox all` output. Reversed supplemental dispatches still fail chronology with absence disabled. All8console tests pass; the explicit call/transfer sent assertions are then verified before the hook. The later-August fallback now runs only on absent July dispatches, not on transcript rereading. Evidence: `runs/s1/console-gaps/`, `gaps-console*.log`, `gaps-focused.log`, `gaps-correction.log`.

P1-P3 already have editor-only, late closing receipt and separate battle-identity regressions in `packages/kernel/test/press-view.test.ts`; retained/rebroken pages and CLI words also pass in the focused run. No duplicate tests added. The original B4/B5 and V4/C2/C4 review descriptions remain unavailable after the prior bounded search (also noted in CODEX's R48 exchange); these are named contract regressions, not a claim that unavailable IDs have been certified closed. Lead must reconcile those IDs at review.

Proposed [I]: preserve the human long-term call/concentration/resumed-goal route as the honest battle exercise; reject injected armies/battles, hidden selectors or letting absence/reversed order satisfy the same expected failure. The actual existence test is now ordinary. Before committing this tests-only step, one full required hook asks whether the regressions coexist with the settled runtime; two workers,600-second setup ceiling, expected4-6minutes, stop on failure. Reuse national history because runtime is unchanged. Calibration stays unopened until that gate passes.

Second budget plan: comparison1 reuses unchanged corrected national history;2-6 independently change only ordinary complyAt to3,5,10,30,50 (initiativeAt150), replacing the provisional coarser grid because actual reservations include scores1upward;7 changes only seed for the selected/restored configuration;8 is the complete default eight-seed/400-cap done check plus drafting. All historical and mechanical bands stay fixed. Candidate improvements cannot waive non-timing Phase0 or another historical criterion. A candidate is only provisional until comparison8; restore150 if none preserves the gates and improves the agreed acceptance. D6 clearance stays parked, strict new-border-levy chain remains continue. Expected six short histories2-6minutes and final verification45-90minutes on this host; inspect all failures once, no ninth comparison or unplanned campaign. Exact commands, controls and stop rules: `runs/s1/calibration-plan.md`.

## What is in place

| Piece | Where |
|---|---|
| The pack's bands, read from the numbers note with a citation each: 16 checkpoints, 7 pushback bands and the victory weights | `packs/union-1861/checkpoints.json` |
| Their schema and validator. Every department, region and faction is checked against the World, dates are checked against the start, and upside-down bands are refused. The file is optional, loaded by `loadPack` and published as JSON Schema | `packages/pack-format/src/checkpoints.ts`, `schemas/checkpoints.schema.json` |
| The history run: start to the last checkpoint date, with the pack's own peace and war, rule seats, a read-only observer, and a timed copy | `packages/cli/src/history-run.ts`, `done-check.ts` (`historyRun`) |
| The scorers, each a pure function of the observations: checkpoints (plus each side's war flag set by its own decision, never `--at-war`), the fought operation with a breakdown, pushback, and unknown strength in every run's battles | `history-run.ts` |
| The stand-in check over the code's labels, now written `STAND-IN(<key>; owner: <lane>)`, with a tell for each retired stand-in that had a name. It also lists pack values carried from M2, as lane 1.6's review asked | `packages/cli/src/stand-ins.ts`; nine labels normalised in `kernel` and `rule-seats` |
| The victory measure | `packages/cli/src/victory.ts` |
| The lever sweep (D6): a victory-only bot over seeds, delegation read through `lever-moves.ts`, an atrocity decision's inaction read as watched (0074), any `floor_unpaid` reported as a breach (0082), and recruitment required | `packages/cli/src/lever-sweep.ts`; `atrocityDecisions` in `pack-format/src/gate.ts` |
| The budget, re-measured over the history run too. It now fails if no timed run had the planner, people or situations running | `done-check.ts` (`BUDGET_SYSTEMS`) |
| The 0086 gap: the Linux job fails when any test is skipped, and requires the three stopwatch tests to have run and passed | `tools/no-skips.ts`, a `no_skips` step in `ci.yml`, pinned in `tools/test/ci-workflow.test.ts` |
| Tests: a positive control for every scorer, the sweep on the seats fixture, the pack validator and the no-skips tool | `packages/cli/test/done-check-1a.test.ts`, `packages/pack-format/test/checkpoints.test.ts`, `tools/test/no-skips.test.ts`, `done-check.test.ts` |

**Exit status.** Phase 0's criteria still set it. 1A's criteria are measured and reported; `--milestone 1a` makes them binding. CI stays green while 1A is unfinished, and the lead flips the flag when Part B begins.

## Recorded measurements before the R58 merge

These figures predate main's lane 1.12 merge. The R58 section below gives the current results.

Phase 0: all six pass. 1A: all six fail, each for a reason that names its owner:
- **checkpoints:** 7 of 11 states seceded. Maryland, Missouri and the three treaty nations are neutral. No government in the pack stands for western Virginia. Neither side is at war, because no opening situation has been authored. Men: Union 18,771 (reported, since its floor is not binding) and Confederate 7,957 (below 100,000). Union operations fought: 0.
- **operation:** no operation in the peace run.
- **pushback:** every band reads 0, so six fall below the record's lower bounds.
- **unknown strength:** in the at-war mechanics run, the Union fights at Washington with one block of unknown strength, `fb_us_marines_washington_barracks`.
- **stand-ins:** six of the eight are gone. The generic principal and the capital as objective remain, labelled and owned by lane 1.12, which is a 1A lane, not 1B.
- **lever sweep:** no gated decision opens, and no call for regiments is made.

The tick budget, re-measured on this machine while other sessions were running:

| Run | median (ms) | p95 (ms) | max (ms) |
|---|---|---|---|
| Union at war | 12.2 | 30.1 | 33.1 |
| Testbed | 1.5 | 2.4 | 2.6 |
| Union history run (148 days) | 13.2 | 33.4 | 43.5 |

The budget is a 40 ms median and a 160 ms p95. The history run is at peace on main, so it drafts no plans. The Part B runs measure the war.

## The lead's rulings and the gate review (since 159aaaa)

- **Pushback upper bounds:** accepted as proposed. Each band's cite now names every record case it was counted from.
- **Victory measure:** accepted, labelled [I], and amended by G-1.14c with a fifth term, the mandate (lane 1.6's, in permille above its rest, at 1 a permille). The weights are pack data.
- **Confederate men:** originally open-topped pending lane 1.11r3's reading of the OR IV-1 returns; R58 adds the authorised inferred ceiling below.
- **Confederate planned operations:** 1 to 4, not 0 to 4. FOUNDATION's "a planned operation fought by each side" stands, counting the Sumter bombardment on Davis's government's order, which lane 1.12's bombardment stage makes fightable.
- **Western Virginia's government and the marines' strength:** routed to lanes 1.11 and 1.11r3.
- **Stand-ins:** lane 1.12 retires them in Part A.
- **`--milestone 1a`:** goes into CI's `run:done-check` step when Part B starts. Not done here.
- **G-1.14a, atrocity inaction, the forward route:** `atrocityDecisions` also finds a decision whose inaction fires an atrocity-class item. That can happen directly (a read that the decision was decided with any outcome, or not decided with the option that stops it; a flag its inaction sets; a chain stage after it) or through items in between. Routes back through the decision's own options are excluded. Tested on the testbed's fictional register.
- **G-1.14b, the recruitment chain:** a fugitive-policy decision is one where an option, or the inaction, names a policy row tagged `fugitive-policy`. Each of its moves is played on until a governor of a border government answers a call, up to 400 days; if none does, the move is reported "chain unexercised". The border governments are the pack's `government-side` checkpoints.
- **G-1.14c, every channel measured:** `VICTORY_READS` lists the channels the measure reads: government sides; bloc support and framing, through the mandate; ledger acts and answers, through the mandate once Congress meets the act. A gated decision whose options, locked costs or inaction propose to any other channel is reported "unmeasured channel", and no D6 result counts for it. A decision that enters a ledger act is played on until Congress meets it, up to 400 days.

## Since 85c3a37: G-1.14d and the standing review's should-fixes

- **G-1.14d** (the gate reviewer's finding, the lead's ruling). The unmeasured-channel check now also follows:
  - a policy row's pushback, reported as `people/grievance (policy pushback)`;
  - every flag a gated decision sets or clears, through whatever reads it, to a fixed point. A pack rule reading it counts: the self-emancipation rule's policy, pressure and protected flags give `regions/self-emancipation`, and a war flag gives `seats/war`. So does an item whose trigger or option conditions read it, which carries that item's channels, flags and policies.
  - The sweep's report says a decision with any such channel is **measured in part**, names each channel and how it is reached, and says that no D6 result for it counts as evidence. In 1A that will be true of S17: its people's-response cost cannot be weighed until enemy capacity exists in 1B.
- **The recruitment chain** closes only with a new levy at a border government's post. A levy exists only for an answer to a call, and it is where loyalty scales the regiments. A transfer or a goal at a governor's post can no longer stand in for it.
- **New tests**, so that breaking each rule fails one:
  - the border-department filter;
  - the fork's stopping rule (`forkDone`: the ledger wait and the chain wait) and `playOn`;
  - the mandate's weight away from its rest, on the testbed's blocs.
- **The Union men band's cite** carries lane 1.11r3's cross-check: Cameron's 22 June claim of 250,000 in the field. It is a public claim, not a return, and it agrees with the upper edge.

**Wired but not exercised.** The Union pack has no gated decisions yet, so the sweep weighs nothing on main. G-1.14a to d are tested on fixtures only. Their first real decisions come when lane 1.11 merges, and Part B's calibration runs exercise them.

## Pause record (2026-11-17; superseded by R58 below)

- **Head:** `phase1-done-check-1a` at accb12a, CI green.
  - **G-1.14d:** done (63ca901), with the standing review's should-fixes.
  - **Main:** already merged in (accb12a, no conflicts). No merge is owed.
  - **Review:** the standing reviewer has queued 63ca901 and accb12a for re-check after the pause. The gate reviewer has accb12a for G-1.14d.
- **Lane 0.7l:** `art-lfs` is at 535e3ff, CI green: main merged in, the art-masters/ refusal, and the modes test. That is past the lead's "stays at 9c69c66", because those commits were already pushed when the pause arrived. The reviewer has queued 535e3ff.
- **Owed on resume, by the lead's ruling:**
  - Give the Confederate men band a labelled inferred ceiling of 200,000 [I]. Cite the inference from Walker's 24 July count (OR IV-1 pp. 496-497, "190 regiments and 34 battalions" accepted), so calibration can revisit it.
  - The Washington Marines strength and the Harris/Henderson correction go to the data lane.
- **Part B, the calibration runs**, once lanes 1.11 and 1.12 are on main:
  1. Merge main into this branch, then run `run:done-check` and read the six 1A criteria on the real history run, which by then has war openings, situations and principals.
  2. Calibrate design parameters against the bands, never the bands against the run. In order:
     - goal boldness (hold 400, advance 600);
     - the compliance thresholds, against the pushback bands;
     - discontent and the ladder;
     - credibility and the M2-carried politics values;
     - drafting against execution boldness (McClellan's gap);
     - the Fort Wagner assault case.
  3. Run the lever sweep with 8 seeds on the authored gated decisions (S17 first). Read any flagged option, any "chain unexercised", and the "measured in part" channels.
  4. Re-measure the tick budget on the war run, and count the press's mail apart, as the lead ruled.
  5. When the criteria pass, or their remaining failures are ruled, add `--milestone 1a` to CI's `run:done-check` step.

## Where the lane stopped (R58, 2026-11-19)

Worked only on R58 in this worktree. HEAD remains `f6dedebb167643912b7c4492ccc451093bd973c2`; the lead's merge of main at `d472d1e` remains in progress. Both conflict files have resolved contents, but the index intentionally still records them as unmerged. No stage, commit, abort, checkout, fetch or other Git write was performed. R44 and the gate reviewer had already approved Part A; Claude's review of this delivery remains pending.

**Step 1, merge resolution and the required check's Git guard:**

| File | Resolution |
|---|---|
| `packages/kernel/src/seats/world.ts` | Kept lane 1.12's doctrine validation and retirement of the other-capital objective. Lane 1.14 had only relabelled that obsolete stand-in here. The resolved file matches main at `d472d1e`. |
| `packages/rule-seats/src/index.ts` | Kept lane 1.12's doctrine, attention accounting, calls, concentration, appointments, inquiries and battle answers. Removed the obsolete generic-principal implementation and its labels, rather than restoring a stand-in that main retired. The resolved file matches main at `d472d1e`. |
| `tools/test/lfs.test.ts` | Before running the required gate, made its three scratch-history fixtures honour `MANDATE_NO_GIT=1`, as R54 had done on another branch. The hook-mode Git query also skips under that flag. Ordinary hook and CI collection remain unchanged. |

Lane 1.14's scorers, sweep, victory measure and stand-in scanner are preserved. No generated file required regeneration, and all generated files remain byte-identical to the initial merged worktree. Step 1's file copies and manifest are in `runs/r58/step1/` and `runs/r58/step1-files.json`.

**Step 2, a separate change set:** only `packs/union-1861/checkpoints.json`. The `men_confederate` maximum is now **200,000 [I]**; its 100,000 minimum and binding floor are unchanged. Its citation names `docs/research/_leads/T2-strengths.md`, section 1's corrected reasoning, and Walker to Davis, 24 July 1861, OR IV-1 pp. 496–497. About 200,000–210,000 is a rough paper estimate for the regiments and battalions Walker counted [I]. His independent companies, twelve recently called regiments and reserve corps are outside that count. The 200,000 ceiling is explicitly an inferred, revisable calibration band, not an upper bound proved by those sources or a count of men under arms. This completes the ceiling item R51 left to this lane. The lead can commit step 1's merge first, then this file; this hand-over records both steps.

**Verification and retained evidence:**

- Dependency links resolve to this worktree's own packages; the root lockfile did not differ between the two merge parents, so no install was needed. Typecheck exits 0. Focused doctrine, seats, bombardment, harness, checkpoint and LFS checks exit 0: **7 files, 98 passed / 4 skipped** (`runs/r58/step1-focused.log`).
- The pack loads. The ceiling probe confirms that only the maximum and its citation changed: 99,999 fails the existing floor, 100,000 and 200,000 pass, and 200,001 fails the ceiling (`runs/r58/ceiling-check-corrected.log`, exit 0). The first probe failed because a PowerShell evidence export was UTF-16; converting that evidence file to UTF-8 corrected the probe without a product change. Both logs are retained.
- Required **`MANDATE_NO_GIT=1 npm run check` exits 0: 103 files, 1,307 passed / 7 skipped**, plus typecheck, pack boundary, licences and decision index (`runs/r58/check.log`, `check-exit.json`). The skips are the three existing opt-in stopwatch tests and four Git-dependent LFS tests; the staged-hook file is excluded by the existing no-Git configuration.
- Required **`npm run run:done-check -- --label r58-done` exits 1: Phase 0 5/6, reported 1A 2/6** (`runs/r58/done-check.log`, `done-check-exit.json`). Behaviour, hashes, replay/save-resume, liveness and section-ten pass. The Union mechanics run misses the unchanged timing budget: **98.28 ms median / 220.86 ms p95**, against 40/160 ms. Testbed is **6.41/39.20 ms**; the 148-day Union history run is **34.42/71.19 ms**. Reference summaries and saves are under `runs/r58-done/`; drafting evidence is under `runs/r58-done-drafting/`.
- One cheap, isolated 75-day timing-only reproduction also exits 1: **96.73 ms median / 191.22 ms p95** (`runs/r58/timing-only.json`, `timing-only.log`). No expensive campaign was repeated. The kernel and rule-seat executable code matches `d472d1e`: their remaining kernel differences are comments. The runner's optional observer is after the timing sample and absent from timed runs. This inspection does not establish whether the miss is main's performance or machine load. The timing gate remains unmet; thresholds and simulation parameters were not changed.
- 1A now passes **unknown strength** and **stand-ins**. The other four criteria remain failed: the history run has no government's war opening, incomplete sides/governments, 7,957 Confederate men below the floor, no fought operation or pushback, and no gated decision or recruitment in the sweep. The added ceiling is reported as `100000..200000`; it does not cause the present below-floor failure. These remain for the situations/data lanes and Part B, not feature work in R58.
- Final preservation inventory: `runs/r58/final-preservation.json`. The index and all five other snapshotted merge-state files are byte-identical to entry. Both conflict files are marker-free; `git diff --check` exits 0. No server was started.

**For the lead:** commit the merge changes before the separate ceiling file, after review. The standalone timing failure remains a failed required gate. [I] Keep its budget unchanged and route the reproducible miss to Part B/performance diagnosis; rejected changing the budget or tuning unrelated simulation behavior to close this merge. The full-suite evidence remains valid and was not repeated. Part B still awaits lanes 1.11 and 1.12 together, and `--milestone 1a` remains off.

## The proposals as made

**1. Pushback upper bounds.** Each is three times the record's cases of that kind, counting note-only rows and extras, and never below the lower bound plus 3.

| Band | Lower (verified) | Upper |
|---|---|---|
| Relay objections | 0 | 6 |
| Relay holds | 2 | 6 |
| Filter holds | 1 | 9 |
| Trims | 1 | 4 |
| Compliance with reservations | 1 | 9 |
| Slow walks | 2 | 9 |
| Objections to a plan | 10 | 42 |

Why three times:
- The catalogue covers only the 21 situations' principal-level decisions, read in a single pass. Burlingame ch. 22 never loaded. So the record undercounts, and a run may exceed it.
- But three times everything the record shows, in the same five months, would make pushback the main thing that happens. That is what an upper bound exists to stop.

The run counts both sides, while the lower bounds are all Union-side cases, so they stay lower bounds.

*Rejected:*
- A ratio to orders given. The order count is not settled until 1.12's principals exist.
- No upper bound for compliance with reservations. It still weighs a goal by a man's temper, and a flood of it would hide a broken willingness scale (the reviewer's tabulation: every order lands on reservations or an objection).

**2. The victory measure** (`victory.ts`, weights in `checkpoints.json`). It reads the checkpoint scores; it does not score how close the run stays to history.

| Term | Counts | Weight |
|---|---|---|
| capital | each principal's seat region the side holds, minus each one the other side holds | 1000 |
| government | each government on the side, minus each on the other side | 100 |
| men | permille of all known men, above an even share | 1 |
| ground | permille of all control shares, above an even share | 1 |

Each term returns its amount. The terms are relative, so no opponent needs to be subtracted.

Why these weights:
- A capital outweighs any spread of men or ground (at most 500 each). The capitals are the war's stated aims in the window.
- A government is worth a tenth of a capital, so turning Kentucky outweighs a few percent of the men.

*Rejected:*
- Planned operations fought as a term. That count calibrates against history; it is not winning.
- Distance from the checkpoint bands. That would make the bot a history-follower, and D6 needs a winner.
- Casualties. Each loss already shows in men.

## Choices made

1. **Bands live in a pack file at the root, `checkpoints.json`, beside `pack.json`, not under `data/`.** `data/` is generated, and these bands are hand-written from research. *Rejected:* `WorldRules`, which the kernel would carry and never read.
2. **Phase 0's criteria set the exit status; 1A's are reported until `--milestone 1a`.** *Rejected:* failing CI on main today. The brief expects 1A to fail now, and a red CI for a known state teaches nothing.
3. **The Union men band runs from present for duty's lower edge to the rolls' upper edge (95,000 to 250,000), with a non-binding floor.** A block's strength is "men present", which lies between those two measures, and the note forbids scoring present for duty against the rolls. *Rejected:* either bracket alone.
4. **A tie counts as best in the sweep.** A move that scores as well as the best one is a move the bot may take. *Rejected:* strict best, which would let a watched option hide behind a tie.
5. **The sweep plays each move 30 days on, from the morning the decision is open, and weighs each gated decision once per seed.** The done check sweeps 8 seeds; its test sweeps 2.
6. **Stand-in labels follow one format, `STAND-IN(<key>; owner: <lane>)`, on one line.** Three stale labels were reworded: the credibility stand-in that lane 1.6 replaced, the conflict-window note, and the capital objective.

## Part A's items for the lead (historical)

1. Every item from the first report is ruled (above).
2. Missouri has no rival government in the pack, so its band scores the one `st_missouri`.
3. When Part B starts, add `--milestone 1a` to CI's `run:done-check` step.
4. The channel list (`VICTORY_READS`) is what 1B extends when national will, foreign patience and enemy capacity get owners. Until then, a gated option that proposes to them is reported unmeasured, as G-1.14c intends.

## R85, Part B: eight measured comparisons (2026-11-20)

**Stopped at the budget.** Worktree C:/Pyrrhic/mandate-done-check-1b, branch phase1-done-check-1b, HEAD ff07445735e0423581f5107ce89b348770fde024 throughout. npm ci ran before the work: exit 0, 51 packages added, zero vulnerabilities. Git commands were read-only. No measurement includes R82, R83 or R84's integration, even if those branches land elsewhere during this run. The lead must prepare the merge of main and a new measurement before this branch lands.

Final Phase 0: **6/6**. Final 1A harness: **2/6**, still unmet. R86 owns the separate console-session acceptance item. The two retained changes are source-data reconciliations. All global design parameters and generated World are restored byte-for-byte to entry. No numeric band, expected side, checkpoint date, victory weight or liveness band changed. CI's milestone flag remains unchanged; no failed criterion was waived.

Fresh coordination read before the status: R82, R83 and R84 are now committed elsewhere as c278f46, e1ff5e7 and a9c35ba. R87-R89 are new, separate requests; none was undertaken here. R88 still routes the absent history battle to R85. That operation criterion remains failed at this exhausted calibration budget and needs the owner work below, not a substituted testbed battle.

### Retained data and source limits

1. **The Restored Government checkpoint reference.** side_western_virginia now names the existing st_virginia_restored department rather than an empty list. Its expectation remains Union on 31 July. The old citation incorrectly said the department did not exist. The existing western_virginia recognition option already sets this department to Union. Read source/world/departments.csv and OR I-2 p. 723, Cameron's 25 June letter addressing Peirpoint as governor: https://ehistory.osu.edu/books/official-records/002/0723. Source copy: runs/r85/source-or-i2-p723.md. This corrects a reference; it does not relax an outcome.
2. **Missouri's receipt-based wait: 106 to 105 days [I].** The first call answer is day 43, 17 April. The old wait fires on day 149, 1 August. A 105-day wait fires on day 148, 31 July, as the Missouri State Archives' vacancy-ordinance entry dates it: https://www.sos.mo.gov/archives/history/timeline/3. The existing numbers note and secession-winter note also place the government within this window. The interval itself is a model inference, not a historical causal interval. It remains receipt-based in other openings. The notice fires on 31 July but has not surfaced to the principal when this run stops. Its gate.none and all effects are unchanged. The timeline is an institutional secondary source; the July convention journal was not read, and the excluded HathiTrust link was not opened. No other timeline claim was adopted.

**Sequencing limit:** these data discrepancies were confirmed after the initial global-parameter probes. Those probes therefore predate the corrected data control; they were not presented as source-corrected runs and none was retained. Run 6 restores every global parameter before isolating the reference correction; run 7 adds only the modelled Missouri wait. Any next parameter batch starts from the corrected data after integration.

### Run record

Every mutating comparison changes one parameter or data reference against its named control. Citation changes explain that same change. Controls, pure battle probes and final verification are all counted conservatively within eight. The reference runner's internal replay, resume, repeat and timing copies, and the required suite's immutable verification runs, are not additional parameter searches. No ninth comparison ran.

For all history rows the six columns are the actual 1A criteria. “Not rerun” does not mean pass; those candidates did not obtain fresh D6 evidence. Original observations and original scores are retained.

| Run | One change / control and reason | Checkpoints | Operation | Pushback | Unknown strength | Stand-ins | Lever sweep |
|---|---|---|---|---|---|---|---|
| 1 | ff07445 baseline; exact npm run run:done-check -- --milestone 1a --label r85-01-baseline | FAIL: 5 rows | FAIL | FAIL: 4 bands | PASS | PASS | FAIL |
| 2 | Advance goal boldness 600 to 500 against run 1 [I], testing the lane 1.1 calibration note's temperament mismatch; hold stays 400 | FAIL: same 5 | FAIL | FAIL: same 4, reservations 44 | PASS | PASS | Not rerun |
| 3 | Restore goal; complyAt 150 to 10 against run 1 [I], testing whether small positive willingness should count as ordinary compliance under 0099's reservations band | FAIL: same 5 | FAIL | FAIL: 3 bands; reservations 4 | PASS | PASS | Not rerun |
| 4 | Pure assault control at attacker base rate 180; existing CSV, four works setups, 20 named seeds each | Not rerun | Not rerun | Not rerun | Not rerun | Not rerun | Not rerun |
| 5 | Pure assault attacker rate 180 to 600 against run 4 [I], testing the Wagner deficit without moving any band | Not rerun | Not rerun | Not rerun | Not rerun | Not rerun | Not rerun |
| 6 | Global knobs restored; only the sourced Restored Government reference correction against run 1 | FAIL: 4 rows | FAIL | FAIL: 4 bands | PASS | PASS | Not rerun |
| 7 | Only Missouri wait 106 to 105 against run 6, sourced date plus explicit model inference above | FAIL: 3 rows | FAIL | FAIL: 4 bands | PASS | PASS | Not rerun |
| 8 | Required full verification of run 7; no further change; eight seeds and original 400-day fork cap | FAIL | FAIL | FAIL | PASS | PASS | FAIL |

Evidence for runs 2, 3, 6 and 7: runs/r85/02-goal.json, 03-threshold.json, 06-source-control.json and 07-missouri.json, each with final State and command exit/time files. They call the existing phase0Run and pure scorers; observers run after the timing sample and never write State. Run 1's full CLI log, exit and summaries are retained under runs/r85/01-baseline* and runs/r85-01-baseline/. Run 8 is runs/r85/final-gate/result.json and 08-final-gate.log. Its input hashes before/after match.

### Parameter decisions, in the requested order

- **Goal boldness: reject run 2.** No criterion, pushback count or operation outcome improved. Walker's goal willingness moved from -164 to -124, but he still objected; Beauregard's changed from 128 to 88, still reservations. A lower requested boldness is not uniformly more agreeable to bolder men. Hold 400 / advance 600 stand.
- **Compliance: reject run 3 as a production setting.** Reservations fall 44 to 4 inside 1–9, but spontaneous cabinet initiatives rise 9 to 27, outside the unchanged 4–18 liveness band. The required check exits 1: 3 failures, 1,468 passes and 3 existing skips. All three failures are that one liveness regression, asserted by the reference and done-check tests. The same complyAt threshold governs requested orders and self-proposed initiatives. Do not change an initiative cooldown simply to hide the coupling. Restore 150; continue with the people/seat owners before another threshold batch.
- **Discontent and ladder: leave uncalibrated.** The observed ladder ends with Houston lobbying and Toombs grumbling; ten moves occur. Its formula is grievance load less half regard. No sourced rung-count band in this five-month window identifies new thresholds or disposition weights. Changing these to offset run 3's initiative admission would tune a different mechanism to a proxy.
- **Credibility and M2 politics: leave uncalibrated.** The politics hand-over's sourced calibration targets are the 1862 midterms and the later lows; they are outside this window. No relief in this history run identifies per-relief credibility. Keep the M2 cites rather than claiming that July calibrated drift, address, ladder politics, credibility or press standing.
- **Drafting versus execution: case not exercised.** The Union commander is Stone at us_dc_militia, not a McClellan planning/execution case. He selects the supply-line advance, reaches Manassas on day 145, and works there. At the end its sole standing force is 600 Union militia, with no opponent. More aggressive planning weights cannot provide the missing opposing establishment.
- **Fort Wagner: reject run 5.** The current lesser-side contact model gives Wagner 62 attacker K+W per 1,000 against the CSV's integer-truncated 213. Raising the shared assault base rate makes Wagner 208, but Fredericksburg becomes 322 and Franklin 722, beyond the unchanged 40–220 attacker band. All 80 candidate samples fail the 2–7 absolute-loss ratio. Current rates pass those checks. This supports investigating assault contact geometry with lane 1.3, not raising every assault's rate. The probe uses the existing resolveDay, existing CSV and named streams; it is not a second campaign runner. The early coverage prose mistakenly described three setups; metadata was corrected to four one-modelled-day setups without changing or repeating observations. Raw logs remain.

| Works setup | Current attacker / defender K+W per 1,000 | Rate-600 candidate | CSV attacker / defender |
|---|---:|---:|---:|
| Fredericksburg | 96 / 34 | 322 / 34 | 102 / 64 |
| Chickasaw Bayou | 56 / 34 | 188 / 34 | 39 / 14 |
| Fort Wagner | 62 / 49 | 208 / 49 | 213 / 94 |
| Franklin | 216 / 45 | 722 / 45 | 206 / 43 |

The CSV follows the existing model's setup days; those are not new assertions about the historical duration. All loss-breakdown parts sum in both comparisons. The existing full Livermore harness passes unchanged.

### Diagnosis and continue-or-park recommendation

| Criterion | Final diagnosis | Recommendation and owner |
|---|---|---|
| Checkpoints | Restored Government and Missouri now satisfy their existing rows. Confederate known men remain 20,957 against 100,000–200,000; both sides have zero scored fought operations. Union men are 18,686, reported below their non-binding floor, not silently passed as enrolled strength. | **Continue**, data/recruitment 1.7 and rule seats 1.12: supply the missing sourced calls/state-force transfers before changing men per regiment. The doctrine contains the 8 April call but suppresses repeat calls once answered and runs only after war; the research note also lists 9 March and 16 April calls. Keep all strength and operation bands. |
| Operation | Two approved operations, zero BattleRecords. Sumter's bombardment emits battle telemetry and reports but tick/bombard.ts writes no BattleRecord, which operationsFought/operationScore require. The Union executes into unopposed Manassas. | **Continue**, combat/operations 1.3–1.4 and rule seats 1.12: preserve actual bombardment loss terms in the record consumed by the scorer, and supply sourced field establishments. Do not count telemetry as the required record or force an arbitrary battle by a weight change. |
| Pushback | Relay objections 2 (0–6), holds 1 (2–6), filter holds 0 (1–9), trims 0 (1–4), reservations 44 (1–9), slow walks 5 (2–9), objections 11 (10–42). The filter office is vacant; cabinet/caller screening cannot be relabelled as telegram filtering. | **Continue**, people 1.1/1.5 and rule seats/report routes 1.12: resolve the requested-order/initiative coupling and exercise sourced relay/filter cases. No band recentering or invented filter holder. |
| Unknown strength | PASS as scored: history has no BattleRecords, while the testbed battle records contain none unknown. This is not evidence that a missing history battle was checked. | Keep the gate; repeat after the battle-record and establishment work. Owners 1.3/1.10/1.14. |
| Stand-ins | PASS; four well-formed labels below, with 1B owners. M2 rule groups are listed as calibration evidence, not code-label failures. | No label change. Keep the uncalibrated data explicit. |
| Lever sweep | 8 seeds, 8 decisions weighed, 248 base-run calls. Return's best-choice count is not D6 clearance: grievance effects remain unmeasured and the policy-to-border-levy chain remains unexercised. | **Park D6 clearance until 1B** owns the missing channel (0099, G-1.14c/d); **continue the recruitment-chain item now** with 1.7/1.12. Existing calls precede the policy fork and the doctrine suppresses later calls. Do not remove the required new levy, shorten 400 days, or score an unmeasured consequence as zero cost. |

Final sweep details: return is best in **0/8** seeds; **zero flagged choices, zero unpaid floors and zero unmet ledger waits**. All **24** policy moves retain the unexercised recruitment-chain finding. The unmeasured channel is people/grievance through policy pushback. Those failures prevent D6 clearance despite the zero best-choice count.

Virginia still fires on day 46, 20 April, against the record's 17 April. Letcher's call answer is day 44 and the signed situation waits two further days. The requested route is already wire; transport/relay behavior and the signed causal interval need review by 1.11/1.12 and the gate reviewer. No signed item was edited to make this date fit.

### The stand-ins, exactly as the criterion reads them

| File and line | Label / owner |
|---|---|
| packages/kernel/src/forces/stores.ts:74 | Ships and troops afloat do not consume stores; owner 1B, ships' stores |
| packages/kernel/src/planner/route.ts:127 | Ships/boats' own stores bypass marching supply cost; owner 1B, ships' stores |
| packages/kernel/src/situations/types.ts:74 | call-received-delay; owner 1B, conventions and legislatures |
| packages/pack-format/src/situations.ts:63 | The same call-received-delay schema label; owner 1B, conventions and legislatures |

All eight named Phase 0 stand-ins are retired according to the scanner's labels/tells. Zero malformed labels. The five M2-carried groups remain rules.politics.drift, address, ladder, credibility and press.standing. Pack-only assumptions outside that scanner are not claimed retired.

### Final verification and preservation

- Final exact MANDATE_NO_GIT=1 npm run check: **exit 0**, 129 files, 1,471 passed / 3 existing opt-in timing skips. Time 183.52 s. The rejected threshold's failed check and the successful restoration check are retained separately; there was no unchanged retry to seek a different verdict.
- Focused compliance, 1A scorer/sweep-fixture and Livermore checks: **53 passed**, exit 0. The later focused checkpoint command selected one existing file, **5 passed**; no nonexistent opening-file selector was counted as coverage. The full suite supplies the actual opening tests.
- Final full done check: Phase 0 **6/6**, 1A **2/6**. Binding 1A exit is 1. Evidence is complete even when the criterion fails.
- Final Union hash **704c3934f6625007a596b231fbbe152c156aa62e8ff8761d6b735838b62dc3fd**; replay and day-60 resume match. Its first 147 daily State hashes match the baseline, with only day 148 changed by Missouri. All 120 testbed hashes match the baseline. Zero rejected commands. World hash changes include the edited situation/citation; generated World and all global rules are byte-identical.
- Full-run tick cost, median / p95 / max ms: Union war by decision **32.73 / 54.28 / 68.79**; testbed **3.85 / 5.11 / 5.72**; history **31.35 / 52.37 / 66.41**. The baseline history failed at 93.64 / 164.22 against unchanged 40 / 160. Later candidate times varied from 26.12 to 35.04 median. No unloaded condition or causal speedup is claimed; Linux/integration timing still decides.
- Press mail counted apart: **4,622** received press seat/report pairs and **294** other received mail pairs after day zero in run 7. These are deduplicated (seat, report id) observations, not a claim that messages.sent equals report delivery count. Input/behavior equality with run 8 is checked by its final hash.
- Before this hand-over, preservation checked 1,650 entry files: only the checkpoint reference/citation and ungated Missouri wait/citation differed; 1,648 others were unchanged. Among 182 explicitly protected inputs, 181 were unchanged and the sole exception was that ungated Missouri file. All signed situations, gate material, PROVENANCE.json, saves, lockfiles, liveness bands and generated World were preserved. This hand-over is the third delivery file. Final inventory and hashes are runs/r85/final-preservation.json.
- No package build, server or browser campaign. No write in another run's worktree, no Git mutation, no signature or decision record authored. Claude's independent review remains required under 0096.

**Proposed rulings:** accept the sourced department-reference correction and 105-day model inference; reject the three global parameter candidates rather than weakening gates. Keep the current bands and CI flag until 1A's residuals pass or the lead explicitly rules on them. A new batch requires the lead's continue-or-park ruling after R82/R83/R84 integration; no run remains in this budget.

## R94: Missouri by cause and recorded date (2026-11-20)

Handled R94 only in `C:/Pyrrhic/mandate-done-check-1b`, retaining branch `phase1-done-check-1b` at `ede2a556bdd854953a2ea93b80ad9bf7871a9a8c`. Git was read-only. Existing dependencies resolve to this worktree's own packages; no install was needed. Other requests and worktrees were left alone.

**Change and source.** `packs/union-1861/situations/missouri_provisional_government.json` now has exactly `all: [callReceived { post: st_gov_missouri, days: 0 }, dayAtLeast 148]`. Its citation identifies 31 July 1861 as the recorded date, rather than an inferred interval after receipt. Reread the Missouri State Archives timeline's vacancy-ordinance entry: <https://www.sos.mo.gov/archives/history/timeline/3>. The July convention journal remains unread; its existing source limitation is preserved. R94's lead ruling supplies the cause-plus-date model, following 0100 item 16. A call received after day 148 permits the notice on receipt, without another wait. Only the event and citation changed; the notice's text, effects, report, earliest metadata and gate classification are unchanged. No signed item changed.

**Regressions.** `packs/union-1861/test/r94-missouri.test.ts` drives the loaded notice through real ticks and checks both its fired day and the command-owned government side. Call receipts on days 20, 43, 147 and 148 all fire on day 148, never earlier. Without a received call there is no notice, flag or side change through day 160. A day-151 receipt fires on day 151, once, with the flag and Union side retained on day 152. Refused calls are used: receipt is the prerequisite, not compliance. Before the data change the new tests failed in four cases and passed in two (`runs/r94/red.log`, exit 1); after it, all six and the two Wheeling regressions passed (`green.log`, exit 0). The full suite below verifies the final fixture with the pack's exact governor identifier.

**Required checks and all failures.**

- Typecheck and pack boundary preflight: both exit 0 (`runs/r94/preflight-exits.json`).
- Exact `MANDATE_NO_GIT=1 npm run check`: exit 0, **130 files / 1,477 passed / 3 existing optional timing skips**, plus boundary, licences and decision index; **184.74 s** (`check.log`, `check-exit.json`).
- One full `npm run run:done-check -- --milestone 1a --label r94-final`, with eight seeds, the original fork horizon and drafting: **exit 1**, **1,532.32 s**, **Phase 0 6/6; 1A 2/6** (`done-check.log`, `done-check-exit.json`, `final-checks.json`). All ten reported problems were inspected. No gate was retried or waived.
- Missouri is Union on day 148 and passes its unchanged checkpoint. The same four 1A categories fail: **checkpoints** (Confederate known men 20,957 below 100,000; both sides' fought-operation counts 0 below 1); **operation** (two operations, zero battle records); **pushback** (relay holds 1 below 2, filter holds 0 below 1, trims 0 below 1, reservations 44 above 9); **lever sweep** (people/grievance remains unmeasured and no new border levy in 24 policy moves). Unknown strength and stand-ins pass as scored; zero history battle records still limits the strength claim. The eight-seed sweep weighs eight decisions and records 248 base-run calls; return is best in 0/8. Those results do not clear D6.
- War/history tick median–p95 are **38.04/63.70** and **39.20/62.40 ms**, within the unchanged **40/160** limits; testbed is **3.84/5.61 ms**. No unloaded or CI claim. Drafting is sound: capped worst day **25.2 ms**, with the configured three drafts per side. The full log and `runs/r94-final-drafting/` retain the report.

**Reference comparison and preservation.** The fresh reference summaries match R85 for every daily State hash (148 Union, 120 testbed), final State hash, replay, resume, rejections and liveness row. Union final State remains `704c3934f6625007a596b231fbbe152c156aa62e8ff8761d6b735838b62dc3fd`; its World hash changes because the loaded situation and citation changed. Comparison: `runs/r94/reference-comparison.json`. This reuses R85 as the comparison baseline; no R85 campaign was repeated. R94 is required verification, not a new parameter search or the second calibration budget.

Runtime checks, the complete failure list and five output artifacts were inventoried before this hand-over (`runs/r94/final-checks.json`, `artifact-inventory.json`). The pre-document audit found only the Missouri edit and new test among 1,651 baseline files; all 1,650 other baseline files were unchanged. This hand-over is the third delivery file. `runs/r94/final-preservation.json` records the final inventory, including documentation. Generated World, signed situations, gate material, provenance, saves, lockfiles and all numeric/liveness bands are preserved. No build, server, browser or other-worktree write. The worktree's CODEX.md is unchanged; the only main-checkout write is the single requested status append after a fresh coordination read.

**For the lead:** review and commit R94 under 0096. No new ruling is requested: R94 already replaces the fitted interval. R85's remaining failures and their owners remain open; this checkout does not include the other runs' changes.

## Findings outside my scope

- R94 adds no new finding outside scope. The R85 items below retain their owners; this run neither implements nor remeasures their changes from other worktrees.

- 1.11/1.12 and the gate reviewer own Virginia's signed receipt/transport timing. The date was not fitted by an unreviewed signed edit.
- 1.7/1.12 own missing repeat calls, state-force coverage, field opposition and the post-policy border levy. The full sweep cannot establish D6 until that chain and 1B's missing consequence channel exist.
- 1.1/1.5 and the seats owner must resolve ordinary compliance versus spontaneous initiative admission before another global-threshold calibration. The isolated reservations improvement was rejected because its required gate failed.
- 1.3/1.4 own the bombardment record gap and a bounded assault-contact investigation. The Wagner result is not permission to increase every assault's losses.
- 1B owns the sourced politics/ladder targets outside this window and the four labelled stand-ins. They remain uncalibrated; a passing label scan does not settle their values.
- The lead/steward must integrate R82, R83 and R84, prepare main's merge into this branch under read-only-Git rules, obtain independent review, and remeasure on the integrated head. None of this run's evidence includes those changes.

## Findings outside my scope

S1's calibration budget is spent and1A remains unmet. The lead must obtain the deferred independent/gate review, reconcile the unavailable review IDs and rule on the proposed partial calibration; no extra comparison is authorized here. S2 owns the current integrated tick budget with hashes preserved. The fourth Charleston strength, Patterson discharge lifecycle, correct wire-filter traffic/holder source and strict post-policy border-governor levy remain explicit bounded follow-ups.1 Bowns the missing grievance consequence channel and individual remuster consent/service work; transfers/remusters are not substitutes for the strict levy chain. The late-read Iowa July 9 cavalry order (OR III-1 p.324) concerns an already accepted regiment; without its prior identity/terms it is not entered as another levy. Earlier dated stop reports below their headings are retained as history and are superseded by this S1 delivery.

## S40 integration plan (2026-11-21)

S40 only, on sprint/1a from a250b92. Merge remote checks at 3c23492, then fixes-canon at ed4fb19, each through the real hook; preserve S37's positive filter-hold counting, S36's received views and S34's caches. Do not merge play, desk or fixes-play or write another lane's worktree. Correct the shortened-call regression (the candidate already has kind-based recognition from S1) and the dated-concentration received-knowledge path, with a paired-State test. No sign-offs, pushes, history rewrites or browser tools.

Validation question: do the integrated contracts retain calls and use received evidence without losing either branch's behavior? First run focused regressions, typecheck, S18's four rules and staged-history checks. Then the actual full hook for each coherent commit (roughly ten minutes each), the required no-Git full check, and exactly one default eight-seed done check with drafting and --milestone 1a (roughly twenty to thirty minutes). Keep logs/exits under runs/s40, compare retained S37/S34 evidence without rerunning those campaigns, and report every moved band/hash and all six 1A criteria. Stop expensive retries at an unexpected failure, diagnose all categories, and verify a correction cheaply first. No calibration, band relaxation or additional campaign. Final inventories and runtime diagnostics precede closing documentation. Independent review remains deferred to Claude under 0106.

## Findings outside my scope (S34)

- Lead/reviewers: whole-branch, canon/history/realism/determinism and gate
  review remain deferred under 0106. Nothing is signed or pushed. Rule on
  the explicit inherited-band baseline, four unresolved projection roots,
  named-merge fingerprint migration and proposed filter-floor hold.
- Integrator: S25's later commits remain to merge when published. S33's
  `70210da`, `68bcf90` and `9c820e4` are now on the remote but were not in
  the requested starting snapshot; all three remain to merge. S32's packet
  will need the lead's eventual push of this final local candidate.
- Existing 1A owners: all five failed pushback bands and both D6 evidence
  gaps remain open. The filter's traffic/holder source and counting contract
  need a ruling; caller screening is not a substitute. The fourth Charleston
  strength, Patterson's discharge lifecycle and strict new border levy
  remain with their source/model owners. 1B retains the missing grievance
  consequence channel; return best 0/8 is not clearance.
- View/CI owners: the inherited same-day post-identity cache finding is
  unchanged. Local timing passes; Linux CI and the unloaded aim are still
  unestablished. Eight optional desk geography checks lack their ignored
  map inputs here; no shipping-package or human-playthrough acceptance is
  claimed. The unchanged desk lockfile's npm install reports one low and
  one high audit finding (`runs/s34/npm-ci-desk.log`); dependency changes
  were outside this integration and no automatic audit fix was run.

## Findings outside my scope (S37)

- Lead ruling: the four floor classifications and the qualified source claim
  behind N3-07; all accepted bands remain binding.
- Command-data owner: Lorenzo Thomas's ordinary bureau appointment from
  7 March (OR III-1 p. 964), and Craven attested commanding Crusader on
  11 March (Welles, Galaxy p. 95), with opening/end tenure held. These are
  distinct from an unsourced wire-filter role. Crusader's existing ship post
  has an unknown holder, not an absent post; the corrected final trace says so.
- Mechanism owners: Pickens staff/ship dispatch preparation and carriage,
  entrusted conditional relief delivery, and an agent's own disclosure of
  unofficial conduct. The current flags do not implement those contracts.
- S35 and S36 retain their own fixes. Their branches were not imported or
  edited. Existing grievance, border-levy, Linux CI and whole-branch/gate
  review obligations remain open. Nothing is signed.


## S40: checks committed; canon merge held (2026-11-21)

For the lead: 3 items. S40 only in `C:/Pyrrhic/sprint-1a`, `sprint/1a`, from `a250b92a851c6102a0e740aa139e0ab8a784cb77`. Read the standing, command-line, writing, S1-to-S10 sprint rules and 0106. Root npm ci passed and workspace links resolve here. Headless tools only. No push, history rewrite, other worktree write, signature, or S41 work. The shared file's later S39 delivery and S41 brief were read; S41 explicitly waits for an S40 commit.

### 1. Commit and unresolved merge

The checks merge is committed as **50a5820d195a514204e5e437c594f712c8301247**, parents `a250b92` and `3c23492cb8a795a08b854d4e4911270eb4079d56`, through the actual hook with the Codex footer. Its corrected hook exits 0 in 471.38 seconds: **200 files, 1,879 passed, nine inherited expected failures, three timing skips**, plus all chained checks. The first hook failed only an imported test's old call-term diagnostic; the updated test retains the one-day acceptance and zero-day rejection and adds the already-supported war-duration case. Focused correction passed. No production call-term rule changed.

The second named merge, **ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4**, is **resolved and staged, not committed**. Six handwritten conflicts preserve both sides: presentation formatter with turn controls; localized help with scheduled calls and governor routes; both claim kinds; S36 received roster with S34's cache and deep-freeze ledger. The cache now follows received posts/reports, preserves reuse across days, and invalidates at future receipt boundaries. All three schema conflicts were regenerated; both Worlds were regenerated. The unreleased save fixture imported from S36 passes its tests. An old prototype fixture caller now supplies the formatter; the fixture itself was not executed.

The actual canon commit hook, under the standing `MANDATE_NO_GIT=1`, **exits 1 in 467.03 seconds**: **201 files; five failures / 1,883 passed / nine inherited expected failures / three timing skips**. Three assertions expose the same liveness failure; two were old cache assumptions. The latter were corrected and **17 focused cache/receipt tests pass**, including a new future-receipt control. Typecheck passes. The 198 unaffected passing files are reused; no futile full-hook retry was made while the binding liveness failure remains. The unchanged Git-fixture evidence comes from the first merge hook and its 21 focused proxy/staged controls. The second merge cannot be committed through the required hook at this pin. Commit message: `runs/s40/commit-canon.txt`.

The measured staged tree is **930c2807d3bf69acb58b42c1d7811868c749d839**, with HEAD `50a5820` and MERGE_HEAD `ed4fb19`. Final documentation is added afterward; the runtime inputs are unchanged. `origin/sprint/checks` is an ancestor of HEAD; `origin/sprint/fixes-canon` is not yet one. S41's prerequisite is therefore unmet. This is a partial delivery, not a clean/fully committed candidate.

### 2. Requested fixes, cases and proposed rulings

- **Call recognition:** the candidate already had S1's `respKind === 'call'` correction before S40. Retain it. S25's obsolete proxy expectation now checks unconditional retention of first, tied and later content-shortened calls, insertion order, and expiry of an unrelated response. Restoring the original suffix test in memory makes the new regression fail; unchanged source passes. No live source was edited/restored for that control.
- **Dated concentration: HELD under S40's explicit unreceived-truth fallback.** The paired-State tests fail against the live path and pass with the strict received-only implementation. Its bounded reference probe has no field battle: Davis has no received `st_virginia` side notice for the Harpers Ferry and Manassas concentration rows. Appointment replies briefly establish the posts, then ordinary report pruning loses that establishment picture. At day 148 the true holders remain, but those posts are absent from his received picture. Lincoln's Northeastern Virginia row has its public government prerequisite and later receives a post paper. Do not infer side from control, a successful appointment, or a call answer. The strict patch is preserved, **unapplied**, in `docs/audit/s40-evidence/held-concentration.patch`; its tests are inside the patch and its dated trace is `held-concentration.json`. It applies cleanly with `--unidiff-zero`. Ten additional liveness failures disappear when this held patch is removed; the independent time-term failure remains. No historical band was fitted to this probe, and it was not an eight-seed done check.
- **Time-term blocker:** S36's received-information integration changes the day-136 draft. Time still contributes +300 to the direct plan and -300 to holding. Removing time leaves direct **304** versus holding **279**, so the correctly defined decisive-pick telemetry is now **0**, formerly **1**. Its binding band remains **1..4**. Do not alter scoring or count every nonzero contribution to satisfy this proxy. Recommend that the lead rule explicitly on one documented return to a quiet band with its live mechanism control; this run does **not** authorize or apply that policy. S18's immutable origin, append-only causes and 24 exact inherited quiet transitions remain unchanged.
- **Projection receipts [I]:** keep the exact two residual-finding migrations only for the named `ed4fb19` merge, and migrate the existing own-seat view derivation fingerprint for S36's cache fix. Reject a permanent refresh option, broad whitelist or new truth exception. Tests reject other heads, edited paths/hashes, added reads and additional findings. **13 findings remain:** ten B2 labels and three request roots, including the unchanged concentration finding. The resolved `reviewsFor` entry is removed. The receipts are `tools/test/support/s40-projection-migration.json`.
- **Cache/localization reconciliation [I]:** cache received evidence rather than hidden service/rank/status; preserve cross-day reuse and the freeze ledger. Keep all inherited turn/scheduled-call behavior behind S36's formatter, with both pack string tables. Reject restoring live candidate filtering or English fallbacks. S25's typed planner-error and submitted-plan fixtures were adapted without relaxing their boundary assertions.

Final S18 scan exits 0, with **64 fixture tests** in six files passing. Root/desk typechecks, boundary, licences and the 106-decision index pass. Headless desk units: **111 passed / eight inherited optional-map skips**. The first parser/type preflight errors, three missing-paper fixture failures, cache correction, held-path red/green logs and all failed exits are retained in `runs/s40/`. No browser, server campaign, package build, new timeout or new skip was added.

### 3. One default done check and settled evidence

`npm run run:done-check -- --milestone 1a --label s40-candidate`, all eight default seeds, original 400-day fork cap and drafting, **exits 1 in 896.20 seconds**. **Phase 0 5/6; 1A 4/6.** Behaviour, determinism, resume, section-ten and timing pass. Liveness fails only `planner.term.time` 0 against 1..4.

| 1A criterion | Result and retained qualification |
|---|---|
| Checkpoints | Pass as scored. Union 92,089 known men / four unknown blocks remains below the expressly nonbinding 95,000 floor; Confederate 124,046 / 17 unknown blocks. Each side fights one planned operation. |
| Fought operation | Pass: Sumter operation day 38 and Northeastern Virginia operation day 137, fighting at Manassas day 144. |
| Pushback | Fail: relay objections 2 / 0..6 and plan objections 38 / 10..42 pass. Relay holds 1 / 2..6, filter holds 0 / 1..9, trims 0 / 1..4, reservations 17 / 1..9, slow walks 18 / 2..9 fail. |
| Unknown strength | Pass for observed battles: each Union slot three battles / four battle-days; testbed four / four. |
| Stand-ins | Pass as scanned; labelled 1B owners remain. |
| Lever sweep | Fail: unmeasured people/grievance channel and all 24 unexercised border-governor moves. Eight gated decisions, eight seeds, 744 base recruitment calls. Return best 0/8 is not D6 clearance. |

These are **eight retained problem statements**, one more than S37 because of liveness. Only the observed reservations counter changes within pushback (16 to 17); no acceptance bound moves.

| Local Windows timing | Median / p95, ms per day |
|---|---|
| Union reference | 22.71 / 36.69 |
| Union history | 21.60 / 35.64 |
| Testbed | 2.67 / 4.40 |

All are below unchanged 40/160 limits. Shared-host observations do not certify Linux CI or the unloaded 20 ms aim. Drafting is sound: 23 commands, 16 with land forces, all-command median/p95/worst 22.4/23.6/24.2 ms; capped worst 17.8 ms. No completed campaign retry, parameter search or waiver.

**Hashes and causes.** Both initial State hashes match S37. Union changes all **113 daily hashes from day 36 through 148**, ending **bffdb4255a3bf3759a2c3c782f87468a4d286744eeee9b2130e1669bb8bee3d3**, formerly `d2e9277f12d7b46dfb8ae48be469f8777f2c6b3f8e4d0f8f32adf091b0d9ee82`. Testbed changes all **120**, ending **ee1b76d81d16951cd9d9cfcaecce1f773128ad5df4bfedea6b1ed60f4b014b56**, formerly `69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`; its final matches S36 exactly. S36's own sent-order copies and historical plan enclosures change knowledge; at the Union day-60 and testbed day-40 saves, commands are identical and **knowledgeBySeat is the only changed root field**. Later Union choices change through received candidate/strength/control inputs [I]. All 268 checked hashes repeat/replay; both resumes and saved-log replays match, zero rejections.

Nine Union command groups differ from S37: Lincoln nominates Loring rather than Sumner on day 70, adds Sumner on 78, and Rhode Island's transfer moves from 80 to 85; Davis's Virginia transfer moves 105 to 94, permitting an inquiry on 100, and Mississippi's transfer moves 137 to 136. These are request days. Received eligibility/strength and unchanged attention/in-transit routing explain the changes [I]. A bounded read-only trace matches the final campaign hashes; it is separate from the default sweep. All exact commands, 19 changed liveness rows, every old/new World/final/daily hash and their causes are in `docs/audit/s40-evidence/runtime.json`.

World hashes change with S36's unchanged-valued report-confidence table becoming pack data. Regeneration also repairs one existing Union politics citation's UTF-8 apostrophe; all numerical political fields match. No cast or start data is fitted. Both Worlds' people (262 Union-pack, 17 testbed) and all non-rule top-level data match entry. Art, decisions, gate material, provenance, locks, hooks and every acceptance-band file remain unchanged. All **1,784 original tracked paths** remain.

Package inventories (**13 manifests/locks**), runtime diagnostics and preservation checks preceded this closing narrative. All **1,834 tracked files / 846 runtime inputs** and the staged tree were identical during measurement. Portable receipts: `docs/audit/s40-evidence/validation.json`, `source-inventory.json`, `runtime.json`, held patch/trace, and the two exact migration receipts. Raw commands, logs, exits, inventories, trace States and later append proof: `runs/s40/`. The metadata reader's UTF-16 tree-file correction is retained; it did not rerun simulation. Final documentation is staged with the unresolved merge and does not change the measured runtime inputs.

## Findings outside my scope (S40)

- **Lead decision required before the canon merge and S41:** rule on the zero decisive-time observation under S18, or assign genuine time-sensitive reference coverage. The current band remains binding and the required hook refuses the merge. No acceptance criterion is waived by the passing budget or focused tests.
- **Knowledge/notice owners:** supply a received government-side path to Davis and durable received establishment memory before adopting the held concentration patch. The related dated appointment `ready` prerequisite still calls `departmentSide`; S36's candidate/readiness correction does not supply that missing government notice. These read paths are not approved truth exceptions.
- **S41 only after S40 commits:** merge play/desk/fixes-play whole, propagate S35's admitted-note basis to S36's preview enclosures, retain the formatter boundary and replay S39's headless campaign. None was undertaken here; S39's files were not touched.
- The five historical pushback failures, both D6 evidence gaps, source/lifecycle holds, whole-branch/gate review, Linux CI, steward integration, pushing and release remain with their owners. Nothing is signed.


## S41 execution plan (2026-11-21)

S41 only, from HEAD 50a5820 with staged MERGE_HEAD ed4fb19. Step 0 applies the lead's post-S40 ruling: the Union planner.term.time band returns to 0..0, a constructed live control proves dropping time changes the chosen candidate, and the 24-entry frozen list grows by exactly one cited record. The 338-band origin and scoring stay unchanged; the concentration patch stays held. Commit that merge through the hook before fetching/merging origin/sprint/play f595bd7 whole. Preserve received views, caches, S37 counting, S39 guard correction and all finding identities. Then carry the delivered-note basis into received preview enclosures and retain the string-table boundary.

Validation question: does the final integrated candidate preserve the contracts and replay S39's recorded advance to 31 July? Run focused controls, both typechecks, S18 scans/history and desk units before each affected full hook (about 8 to 10 minutes). The play merge hook supplies the required final full check if it covers the final source tree; final documentation commits still use their required hooks. Run one default eight-seed done check with drafting and --milestone 1a (about 15 to 25 minutes), comparing retained S40/S39 evidence for all changed bands/hashes and six 1A criteria. Run only the prototype's headless Playwright harness on owned port 5317; first verify startup, selectors and the initial recorded commands, then continue the same game through the recorded campaign (about 10 to 20 minutes). Stop expensive retries on unexpected failures, diagnose every category and verify corrections cheaply; do not restart campaigns for reassurance. No calibration or extra campaign. Logs/exits go to runs/s41; inventories, runtime diagnostics and preservation checks precede final report/hand-over. Whole-branch review remains deferred to Claude under 0106. Never push, sign, rewrite history or write another worktree except the one final UTF-8 Python status append.

## Findings outside my scope (S41 plan)

The held concentration receipt contracts, dated appointment departmentSide prerequisite, historical pushback bands, D6 gaps, source/lifecycle holds, CI and whole-branch/gate review remain with their owners.


## S41 time band ruling

Applied the lead's 2026-11-21 CODEX message, "S40 received; the lead's ruling on the time band; S41 amended". S36 changes the received inputs to the day-136 draft; direct still wins 304 to 279 with time removed. The reference therefore records zero decisive time picks. Restore only this band to 0..0 and append exactly one record to the frozen list (24 to 25). The 338-band origin is unchanged. The constructed pincer control in packages/cli/test/planner.test.ts picks direct with time and holding without time; it also asserts liveTerms contains time. Scoring and the decisive-pick definition are unchanged. Whole-list fingerprints authorize only the exact old/new lists, then freeze the result again; changed, reordered, removed or extra transitions fail.


## S41 merge and follow-ups

Step 0 is committed as a611ee327889eb03ad489f3bdb97db7566b6506d, parents 50a5820 and ed4fb19, through the ordinary hook: exit 0 in 447.10 seconds, 203 files / 1,912 passed / nine inherited expected failures / three timing skips and all chained gates. The constructed time control and exact 24-to-25 freeze transition pass.

The whole play merge is pinned at f595bd7e976898d6d25aad27a04fd179c7804ec2. Thirteen handwritten conflicts are reconciled, retaining received menus/caches, S37 telemetry and S39 desk records. S35 console corrections stay behind the formatter: objective flags, readable notices/refusals, edit days/routes/bypass, audience values and ICU singular days. Four imported parser fixtures and one old localization date expectation are adapted to the combined API, preserving their assertions. The two received-preview regressions fail before the follow-up with false distance 600 and pass after it for 0/7-day notes, save/load and private-state changes. The optional sealed note basis is carried in the received plan enclosure; ordinary unnoted enclosures retain their shape. No scoring coefficient or accepted band changes.

S39's exact guard correction is retained alongside S36/S40. The two residual closure hashes migrate only for the exact play merge, with full before/after receipts and rejection controls. All 13 finding identities and the six derivation identities/reasons/citations remain; viewFor's existing own-seat derivation changes its closure hash for readable received notices. No truth exception is added. Existing S40 concentration patch remains unapplied. Whole-branch review remains deferred under 0106.

## Findings outside my scope (S41 source)

Retain the held receipt contracts, all historical pushback and D6 gaps, source/lifecycle holds, CI and whole-branch/gate review. The final integrated-candidate report will route the source proposals and later statuses after runtime/replay evidence settles.


S41 hook correction: the first play-merge hook exits 1 in 445.50 seconds, with only two assertions failing in one-writer.test.ts; 202 other files / 1,920 assertions pass, with three existing timing skips. The optional note-basis object and its nested note entries were missing from IMMUTABLE_RECORDS. Both are now explicitly immutable under knowledge; no owner or write permission changed. The complete focused ownership/preview/history selection passes 62 assertions. The one desk-suite failure was a generic label hiding supplied pack wording; pack wording now wins, with all 30 affected tests passing and the other 136 passing assertions reused. The exact mandatory hook is retried because a merge must commit through it; no done-check campaign has started. A receipt-construction alias was corrected to preserve the derivation's true before hash, and the headless harness now saves each batch's rendered text for divergence evidence. Neither affects simulation. All failures and exits remain in runs/s41.
