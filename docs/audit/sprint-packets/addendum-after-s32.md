# Review addendum after S32

S49 only, 21 November 2026. This extends [S32's packets](README.md) at their
`2026-11-21T02:11:37Z` cutoff, preserving their earlier proposals, source limits
and gate inventories. Audit starts at `d77f81a`. Review target:
**`sprint/1a` at `f19b6f007267997a652d06d18497118977e46c69`**, excluding its
staged S46 work. Tips below were read locally; no fetch, checkout, integration,
source apply or new simulation campaign was performed.

Nothing here approves a branch, accepts a proposal, signs a gate item or clears
1A. Author test results are retained evidence for their own pins. A clean
textual merge establishes neither compatible behavior nor a passing hook.

## Lead rulings already made

These come from the main checkout's CODEX. Source message headings identify the
original instructions; they are not new S49 proposals.

| Ruling | Decision and disposition |
|---|---|
| A02, “S32 and S33 received; S35 and S36, the fixes” | Menus show received service/status; actual appointment eligibility is checked on resolution with readable typed refusal. No wider truth exception. S36 implements it, including dated readiness; S41 imports it. |
| B09, same message | Reject slogan-form triads, aphorisms and all-caps eyebrows; concrete policy labels stay. Test the writing screen; change no player copy. S35 implements it. |
| Time, “S40 received; the lead's ruling on the time band; S41 amended” | Restore Union `planner.term.time` to 0..0. S36 changes day-136 inputs: without time, direct still wins 304 to 279. Constructed live control; exact frozen quiet list 24 to 25; immutable 338-band origin; no scoring/counting fit. Applied in `a611ee3`. |
| Routing, “S42 and S43 received; the lead's four band rulings; S44, commit S42” | Recenter to `around(1)`. |
| Returned orders, same message | Recenter to `around(1)`: day-87 Charleston transfer reaches a vacated post. |
| Straggler returns, same message | Recenter to `around(24)`. |
| Withdrawal, same message | Union-only 0..0, testbed's unchanged three withdrawals as live control; exact quiet list 25 to 26. Origin/scoring stay; a rout is not a withdrawal. All four S42 rulings applied in `23b5d49` (S44), without another done check. |
| S48 K2/K1, “S44 and S45 received; S46 to S48” | Advance sends an ordinary goal to the field holder; vacancy removes the choice, putting off sends nothing. A dated received proposal permits human establishment through existing appointment; rule-seat path stays. Implementation authorization does not accept S48's failed result. |

Check [band explanations](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/packages/cli/src/liveness-gate.ts#L131),
[the frozen list](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/tools/rules/inherited-quiet-bands.json#L1),
[planner controls](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/packages/cli/test/planner.test.ts#L1) and
[S44's exact transition](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/tools/test/support/s44-quiet-transition.json#L1).
S34's time proposal and S42's four band requests are historical. S46's proposed
return to a live withdrawal band is **unruled**.
The recorded time cause is S36's received correspondence changing the day-136
draft: with time removed, direct still wins 304 to 279, so the term contributes
without deciding that pick. S42's papers/received concentration change Davis's
posture and the 29 July battle to a Union rout; S44 records those causes without
changing scoring or relabelling the rout.

## 1. sprint/1a: 78eb7db to f19b6f0

**Changes:** fourteen first-parent commits, 325 changed paths including imports.
S34 merges perf `cc41c52`, people-data `2a95ed4`, checks `d617d6e`, playtest
`954dce6`, desk `e13357a`, closing with `ddea338`. S37: positive-hold counting
`2d45c99`, dossier `a250b92`. S40: final checks `50a5820`. S41: canon/time
`a611ee3`, whole play `5482371`, review entry `edc57b0`. S42/S44: `23b5d49`.
S46: **map merge only**, `f19b6f0`. S25's 27 mutation-test commits/closeout arrive
through checks; S33/S35/S39 through play. Their S32 packets remain relevant.

**Look first:** [integrated candidate](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/docs/audit/integrated-candidate.md#L1)
(its S41 containment snapshot predates S45/S47/staged deliveries),
[handover S37](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/notes/lane-1.14-done-check.md#L11),
[S34](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/notes/lane-1.14-done-check.md#L63) and
[S40 onward](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/notes/lane-1.14-done-check.md#L835). Canon/realism:
[institutional receipts](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/packages/kernel/src/seats/received.ts#L1),
[concentration/readiness](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/packages/kernel/src/seats/requests.ts#L1),
[Virginia sources](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/docs/research/2026-11-21-received-virginia-concentration.md#L1).
Determinism/regressions: kernel `received-concentration.test.ts`,
`received-establishment.test.ts`, pack `received-papers.test.ts`,
`tools/test/rule-history.test.ts`, and
[S42's complete comparison](https://github.com/horkesh/Mandate/blob/f19b6f007267997a652d06d18497118977e46c69/docs/audit/s42-evidence/comparison.json#L1).

**Proposed rulings [I]:**

1. Retain imported caches and dated-command behavior; regenerate combined World/
   schema conflicts. Reject choosing one side's behavior to avoid reconciliation.
2. Accept append-only causes, immutable 338-band origin, frozen quiet records and
   positive `around()` formula. Reject resets or further quiet transitions by prose.
3. Limit S18 migrations to exact named merges/read identities/closure changes.
   Reject blanket whitelists or permanent fingerprint refresh. Keep the unsigned
   S9 dossier in `source/drafts/people`; reject ignoring arbitrary malformed drafts.
4. S34 proposed suspending the filter floor pending a sourced holder/counter.
   S37 corrects counting, but **no suspension is accepted**. Keep the floor binding;
   reject invented holders, unrelated screening or proxy fits.
5. S37 N3-11 needs staff/ship dispatch, without proof of deliberate withholding;
   N3-27 is authorized delivery discretion; N3-06 is an outward diplomatic reply;
   N3-07 needs originator disclosure with its source qualification. Review those
   four classifications individually; reject transport/authorized delay as
   resistance, fabricated complete wires or silent deduplication.
6. Review Thomas's bureau appointment and Craven's limited attestation separately;
   reject installing either as an unsourced incoming-wire filter. Retain tenure limits.
7. Retain eight-seed ceiling diagnosis: 331 responses, zero edits/notes. Reject
   blaming S35's absent edit path or lowering thresholds to clear pushback.
8. Keep kind-based shortened-call answer retention, including ties/later replies;
   reject the obsolete ID-suffix/first-answer rule.
9. Cache received inputs across days/future receipts, preserve localization/turn
   controls and admitted-note basis in preview enclosures. Reject live eligibility
   keys, English fallbacks, private-score exposure, note deletion or coefficient fitting.
10. Adopt ordinary-route Virginia papers and bounded durable institutional evidence
    for strict received concentration/readiness. Reject side inferred from appointment/
    call answers or invented presidential receipt stamps. This supersedes S40's hold.
11. Accept S25's in-memory finite mutation method, subject to review of 23 non-kill
    classifications. Reject live-source restoration, exhaustive coverage claims,
    incidental representation tests or malformed-input inventions to improve a score.
12. Retain every failed criterion, source/lifecycle hold and unsigned item. Reject
    engineering checks, return-best counts or local timing as D6/exit clearance.

**Already ruled/evidence:** A02/B09/time/four S42 bands above are applied. S41's
binding run exits 1, Phase 0 6/6 locally, 1A 4/6. S42 exits 1, Phase 0 5/6 on
then-unadjusted bands, 1A 4/6; Manassas 29 July, 56,420/16,000 committed.
S44/S46-map hooks pass 1,952 tests/three skips; no new done check certifies
`f19b6f0`. Five pushback bands, both D6 gaps and the expressly nonbinding
Union-strength qualification remain. The historical S42 failed hook is retained.
**Probe:** exit 0, tree `1a461d41d5a3eabadb0af09b0c22278b858fcbf9`, no conflicts (identity target).

## 2. sprint/fixes-play: 64e4a6f (S35)

**Changes:** from `78eb7db`, three first-parent commits/34 paths: playtest merge
`d55ab43`, console repairs `206a516`, delivered-note scoring `64e4a6f`. B01-B09
become ordinary passing tests. Request morning becomes 5 March without shifting
simulation dates; summaries/bodies/refusals retain their received meaning.
**Look first:** [handover](https://github.com/horkesh/Mandate/blob/64e4a6f0711edd50e1a7cfcd57041924a14005d3/notes/sprint-S35-fixes-play.md#L1),
[report](https://github.com/horkesh/Mandate/blob/64e4a6f0711edd50e1a7cfcd57041924a14005d3/docs/playtests/2026-11-21-play-fixes.md#L1),
[note replay](https://github.com/horkesh/Mandate/blob/64e4a6f0711edd50e1a7cfcd57041924a14005d3/packs/union-1861/test/s35-scoring.test.ts#L1),
[console tests](https://github.com/horkesh/Mandate/blob/64e4a6f0711edd50e1a7cfcd57041924a14005d3/packages/cli/test/play-fixes.test.ts#L1). Check hidden-term
privacy, request/event mapping and a genuinely violated wait, not only wording.

**Proposed rulings:**

1. Keep request-boundary/received-body mappings and readable typed refusal records;
   reject clock shifts or undelivered prose.
2. Score edits on the draft's delivered-note basis; reject note deletion, numeric
   fitting and private-score exposure. Carry this into S36 previews on integration.
3. The formerly listed advance flag/goal ambiguity was later resolved by S48 K2;
   training/material effects remain separate. Do not reopen B09's policy labels.

**Already ruled/evidence:** B09 applied; A02/band rulings arrive later. All 268
daily reference hashes unchanged, no band moved. S29 public-command replay fights
from 30 July; not a new UI playthrough. Hook exit 0, 1,697 passed/three skips.
Binding run exit 1, Phase 0 5/6, 1A 4/6: timing, five pushback and both D6 gaps.
**Probe:** exit 0, tree `1a461d41d5a3eabadb0af09b0c22278b858fcbf9`, no conflicts; already contained via S39/S41.

## 3. sprint/fixes-canon: ed4fb19 (S36)

**Changes:** from `78eb7db`, `ad15a89`, `a7eaf41`, `ed4fb19`; 86 paths. A01-A11
repair received strength/service/control/succession, historical review/preview,
string boundaries, pack confidences, World aliasing, own-post cache and declared
measure direction. Regenerates derived artifacts/unreleased save; proposes owner prose.
**Look first:** [handover](https://github.com/horkesh/Mandate/blob/ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4/notes/sprint-S36-canon.md#L11),
[paired receipts](https://github.com/horkesh/Mandate/blob/ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4/packages/kernel/test/canon-receipts.test.ts#L1),
[view contracts](https://github.com/horkesh/Mandate/blob/ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4/packages/kernel/test/seat-view-contracts.test.ts#L1),
[hash/choice comparison](https://github.com/horkesh/Mandate/blob/ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4/docs/audit/s36-evidence/reference-comparison.json#L1),
[owner proposals](https://github.com/horkesh/Mandate/blob/ed4fb1945a8692a1c6e85fadf9cfaf6aaac1bea4/docs/design/FOUNDATION.md#L206).

**Proposed rulings:**

1. Keep immutable submitted enclosures/bounded sent copies; reject live draft/profile
   reconstruction or an execution promise. Keep actual eligibility at destination.
2. Keep received control/succession/readiness, string-table text, unchanged confidences
   as pack data, non-aliasing and own-post cache keys. Reject live filters/fallbacks.
3. Use owner-declared measure direction and fail closed. Reserved-field directions
   remain proposed; reject sign guessing, per-pack overrides or building deferred systems.
4. Review O01-O03 section-10 prose against actual writers; reject moving code owners
   to fit prose. D01-D16 remain deferred.

**Already ruled/evidence:** A02 applied including dated readiness; no band changed
here. S41 later applies the time ruling. Final hook exit 0, 1,697 passed/three skips.
Completed binding run exit 1, Phase 0 5/6, 1A 4/6; nine problems retained. Union
hashes change from day 36 (113), all 120 testbed hashes change; eight Union response
days explained. Earlier stopped campaign is not a completed verdict.
**Probe:** exit 0, tree `1a461d41d5a3eabadb0af09b0c22278b858fcbf9`, no conflicts; contained via `a611ee3`.
S42 subsequently resolves the distinct concentration read S36 left open.

## 4. sprint/play: f595bd7 (S33/S35/S39)

**Changes:** from `ddea338`, four first-parent commits/64 paths: S33 merge
`7828026`, S35 merge `850ed7f`, desk records `f747c2f`, closeout `f595bd7`.
S33 contributes `70210da`, `68bcf90`, `9c820e4`: due offers/permission discovery,
human delivery and actual July papers. S39 adds received offices/progress/clocks,
readable own acts/stops/battle hours and sheet access.
**Look first:** [S33 handover](https://github.com/horkesh/Mandate/blob/f595bd7e976898d6d25aad27a04fd179c7804ec2/notes/sprint-S33-desk.md#L1),
[S39 handover](https://github.com/horkesh/Mandate/blob/f595bd7e976898d6d25aad27a04fd179c7804ec2/notes/sprint-S39-play.md#L1),
[campaigns](https://github.com/horkesh/Mandate/blob/f595bd7e976898d6d25aad27a04fd179c7804ec2/docs/playtests/2026-11-21-new-player-1a.md#L1),
[discovery tests](https://github.com/horkesh/Mandate/blob/f595bd7e976898d6d25aad27a04fd179c7804ec2/prototypes/desk/test/s33-discovery.test.ts#L1),
[record/privacy tests](https://github.com/horkesh/Mandate/blob/f595bd7e976898d6d25aad27a04fd179c7804ec2/prototypes/desk/test/s39-records.test.ts#L1).
Separate player papers from private causes, compliance from joining, duration from ETA.

**Proposed rulings [I]:**

1. Keep due at-war offers, review counts, supplied duration and honest delivery;
   reject future hindsight, automatic bypass or promised battle dates.
2. Use human dispatches, rejecting automated battles/daybook substitutes. S33's
   July result does not certify every human trajectory.
3. Accept received-only records and exact pinned fingerprint migration; reject
   new truth exceptions or invented office/clock information.
4. Route K1-K6 separately: establishment, advance/train commands, start clock,
   drill/readiness, join reports, signing/execution. S48 remains staged; K3 is only
   a contract. Reject treating all six or training/material policy production as closed.

**Already ruled/evidence:** B09 survives; S41 reconciles A02/preview note basis.
S39 advance and raise/train: 44/42 turns, 86/79 commands, both reach 31 July;
advance receives Richmond, not Manassas battle papers. Hook 1,810 passed/three skips.
Binding run exit 1, Phase 0 6/6 locally, 1A 4/6; five pushback and both D6 gaps.
Captures/recipes remain local `art-masters/S33/` and `S39/`.
**Probe:** exit 0, tree `1a461d41d5a3eabadb0af09b0c22278b858fcbf9`, no conflicts; contained via `5482371`.

## 5. sprint/map-fixes: 9f74de6 (S45)

**Changes:** one commit from `edc57b0`, nine paths. Opening retains ordinary Fit
framing; collision placement keeps labels at their polygon/point or hides them.
Geography was current, no setup/bake needed; existing resize refit stays.
**Look first:** [handover](https://github.com/horkesh/Mandate/blob/9f74de6863be9df497a14fc8cbe18ea691ba70ca/notes/lane-s45-map-fixes.md#L1),
[all 114 displaced names](https://github.com/horkesh/Mandate/blob/9f74de6863be9df497a14fc8cbe18ea691ba70ca/notes/s45-label-audit.json#L1),
[headless framing/locality](https://github.com/horkesh/Mandate/blob/9f74de6863be9df497a14fc8cbe18ea691ba70ca/prototypes/desk/test/s45-map.spec.ts#L1),
[placement](https://github.com/horkesh/Mandate/blob/9f74de6863be9df497a14fc8cbe18ea691ba70ca/prototypes/desk/web/map/region-labels.ts#L1).

**Proposed rulings [I]:**

1. Keep Fit's broad opening and suppress collisions without local placement;
   reject changing pack anchors, regenerating current data or moving names elsewhere.
2. Retain bounded coverage: 231 views, 4,801 fixed observations/zero misplaced,
   130 rendered IDs, all 219 selectable regions focused. Reject exhaustive-camera
   claims or counting hidden names as placed.

**Already ruled/evidence:** inherits A02/B09/bands unchanged. Blank parchment was
not reproduced; eastern framing was. Hook exit 0, 1,943 passed/three skips;
three headless checks pass. No new done check/simulation change. Small-screen
furniture/reflow stays open. **Probe:** exit 0, tree `1a461d41d5a3eabadb0af09b0c22278b858fcbf9`, no conflicts;
contained via S46's `f19b6f0` map merge.

## 6. sprint/realism: 41ce9ef (S43)

**Changes:** one docs/evidence commit from `edc57b0`, 23 new paths. Read-only
86-command S41 replay separates public papers/private causes; 24 printed OR I-2
pages support nine classifications. No private S39-pin replay or new done check.
**Look first:** [classified findings](https://github.com/horkesh/Mandate/blob/41ce9efd82fa41a92d3df76a59eb9cb9053290fd/docs/playtests/2026-11-21-road-to-richmond.md#L98),
[trace/control](https://github.com/horkesh/Mandate/blob/41ce9efd82fa41a92d3df76a59eb9cb9053290fd/docs/playtests/s43-evidence/trace.ts#L1),
[battle terms](https://github.com/horkesh/Mandate/blob/41ce9efd82fa41a92d3df76a59eb9cb9053290fd/docs/playtests/s43-evidence/battles-private.json#L1),
[source pages](https://github.com/horkesh/Mandate/blob/41ce9efd82fa41a92d3df76a59eb9cb9053290fd/docs/playtests/s43-evidence/source-pages.txt#L1).
Hook exit 0, 1,943 passed/three skips; S41 failures remain unrescored.

**Proposed rulings [I], matching the nine classified rows:**

1. Supply dated local state forces/identity-preserving transfers; reject June-only
   creation or backdated July armies.
2. Separate geographic/return coverage and reconcile components; reject a statewide
   aggregate at Manassas or double counting.
3. Source Stone's contingent/term/stores; reject guessed ninety-day terms/rations
   or all later Washington volunteers.
4. Define sustainment with unknown stock and meaningful depot steps; reject automatic
   depots, a Richmond-specific ban or fitted march delays.
5. Extend existing condition/readiness owners with sourced reporting; reject duplicate
   systems, arbitrary July readiness or a universal volunteer penalty.
6. Review received concentration/transfer grouping and threatened routes; reject
   free relocation, hidden-truth planning or forcing all Charleston units north.
7. Preserve human Richmond goal, plan choice and Scott's objection; reject enforced
   historical July dates/objectives.
8. Permit weak-front exploitation if inputs sustain it; reject scripted Manassas
   or certification of this 600-man sustained occupation as realistic.
9. Review inputs/join behavior before combat; reject fitting losses/flank/victory
   bands to suppress the 600-versus-158 local result.

**Already ruled/probe:** no new band ruling; A02/B09/time/S42 retain their scope.
S46 is a staged response to items 1-2, not clearance of the others. Exit 0, tree
`6e9ff24b98a279133d541e2cc18b23ddba4f723e`, no conflicts; **not contained**.

## 7. sprint/play-politics: 3e7aad0 (S47)

**Changes:** six first-parent commits from `23b5d49`, 21 paths including S45:
map merge `1935005`, consultation `3989729`, patronage `4b9e8b8`, advice/docket
`5aef642`, displayed-morning guard `411e06e`, report `3e7aad0`. Continuous
political-first game: 40 turns/63 commands to 31 July, zero queue/dispatch/page
errors, no manual military goal/appointment.
**Look first:** [six gaps](https://github.com/horkesh/Mandate/blob/3e7aad0964ab80b301953c1e83f08d9d62323f5e/docs/playtests/2026-11-21-politician-1a.md#L93),
[handover](https://github.com/horkesh/Mandate/blob/3e7aad0964ab80b301953c1e83f08d9d62323f5e/notes/sprint-S47-politics.md#L1),
[menu tests](https://github.com/horkesh/Mandate/blob/3e7aad0964ab80b301953c1e83f08d9d62323f5e/prototypes/desk/test/s47-politics.test.ts#L1),
[receipt/playback tests](https://github.com/horkesh/Mandate/blob/3e7aad0964ab80b301953c1e83f08d9d62323f5e/prototypes/desk/test/s47-advice.test.ts#L1),
[headless controls](https://github.com/horkesh/Mandate/blob/3e7aad0964ab80b301953c1e83f08d9d62323f5e/prototypes/desk/test/s47-verify.spec.ts#L1).

**Proposed rulings [I]:**

1. Keep menu-supplied consultations and received-person patronage targets; reject
   guessed cabinet eligibility or treating the picker as eligibility.
2. Keep conservative advice bounded by displayed morning and reachable docket
   close; reject guessed option keys, hidden scores or future labels.
3. Route K47-1/K47-2: flag-only material acts and Congress message/answer ambiguity;
   reject invented physical effects or votes.
4. Route K47-3/K47-4: received political audiences/assessments and promise/expiry
   accounts; reject UI editorials or private reactions.
5. Route K47-5: institutional Navy headquarters inherits its ship's field location;
   preserve the received paper, rejecting silent UI relocation.
6. Keep K47-6 unread advance-plan wording with S48; reject duplicate UI ownership
   or claiming its staged correction is integrated.

**Already ruled/evidence:** inherits A02/B09/time/S42 unchanged. Final hook exit 0,
1,931 passed/three skips; 31 affected prototype tests/four retained headless checks
pass. Default run exit 1, Phase 0 5/6, 1A 4/6; history median 51.54 ms/40, five
pushback failures/both D6 gaps. Overlapping validation prevents unloaded timing
certification. **Probe:** exit 0, tree `5d6d9922a951873f19209de8bef4439dbbb1cf16`,
no conflicts; **not contained**. Map work is shared, not an additional fix.

## 8. sprint/research-cast: S38, 4d475c2 to ddc5cb7

**Changes:** `50c1143` research, `ddc5cb7` receipts/handover, 22 new paths.
392 handles (239 S22 pool/153 cast-post), 225 conditional proposals/167 HOLD.
Earlier S6/S12/S22/live pack preserved; S32's cast packet still covers them.
**Look first:** [index](https://github.com/horkesh/Mandate/blob/ddc5cb7b0fd5f19cb3d1c963370e6b84328707e9/docs/research/S38/README.md#L1),
[mapping/holds](https://github.com/horkesh/Mandate/blob/ddc5cb7b0fd5f19cb3d1c963370e6b84328707e9/docs/research/S38/method.md#L1),
[identity/source conflicts](https://github.com/horkesh/Mandate/blob/ddc5cb7b0fd5f19cb3d1c963370e6b84328707e9/docs/research/S38/conflicts.csv#L1),
[arithmetic/coverage audit](https://github.com/horkesh/Mandate/blob/ddc5cb7b0fd5f19cb3d1c963370e6b84328707e9/docs/research/S38/audit.py#L1),
[handover](https://github.com/horkesh/Mandate/blob/ddc5cb7b0fd5f19cb3d1c963370e6b84328707e9/notes/sprint-S38-experience.md#L1). Review dated government/naval
commissions and Native-history language; all prewar numeric command sizes stay held.

**Proposed rulings [I]:**

1. One pre-1-March-1861 tenure rule: proven zero 200, positive under 3 years 350,
   3-under-10 500, 10-under-20 650, 20+ 800. Reject per-person fitting, hindsight,
   rank/victory/campaign bonuses. No zero follows from a missing entry.
2. Union half-open intervals, exclude cadet/enlisted/warrant/post-cutoff time,
   compare before rounding, bound year-only spans and require both bounds to agree.
   Reject double-counting staff/brevet time; naval classification remains proposed.
3. Hold unsafe identities, uncertain commissions and explicit extended no-duty
   cases (Northrop). Require full-name/role corroboration; reject unsafe homonyms.
4. Keep facts/values beside S22 and preserve government transitions; reject live
   apply, backdated availability, prior overwrites or invented command sizes.
5. Preserve acquisition/edition limits; reject claiming complete 1868/annual-register
   collation. Separate staff duty, nominal tenure and exercised field command.
6. Preserve sensitive contexts as unsigned research; reject source praise or
   dehumanizing language as narrator judgment or forced removal as a bonus.

**Already ruled/evidence:** experience rule is unaccepted; A02/B09/bands admit no
values. Hooks pass 1,548/one inherited expected failure/three skips. Default exit
0 means Phase 0 6/6; nonbinding 1A remains 2/6, ten problems. Summary artifacts
do not prove every daily hash equal. **Whole-tip probe:** exit 0, tree
`137159c8739c9cee8fef334d53a26a3882bd027d`, no conflicts; **not contained**.

## 9. S46 staged Virginia forces (uncommitted)

**Identity:** `C:/Pyrrhic/sprint-1a`, HEAD `f19b6f0`, 52 staged paths/no unstaged
diff; tree **`73bd2b18296e4d8ea5926c6763b33e1d276eab0e`**. Backup
`C:/Pyrrhic/mandate-reviews/staged/s46-virginia-forces-staged.patch` exactly
matches `git diff --cached --binary`: 2,339,232 bytes, SHA-256
`fc7565ad8b122e462b68a1cdafbff436119b6c37d4193f278530087037c8ebb1`.
Map merge is committed; none of this force apply is.

**Changes/look first:** dated local contingents/commands, separate militia relief
and identity-preserving 6 June transfers replace June-only aggregate creation.
Read staged `docs/research/2026-11-21-virginia-state-forces.md:35`,
`notes/lane-s46-virginia-forces.md`, `docs/audit/s46-virginia-forces.md` and
`docs/audit/s46-evidence/`. Tests: pack `virginia-dated-forces.test.ts`,
`state-forces.test.ts`, kernel `post-succession.test.ts`. Review recruitment/
enlistment, source/cause/receipt dates, neutral succession and aggregate overlap.
These are **index sources**: `git -C <worktree> show :<path>`, not audit files or
published commits. The exact tree above pins them.

**Proposed rulings [I]:**

1. Existing notices/posts/successions conditional on alignment; reject unconditional
   calendar armies or live knowledge.
2. Two Manassas battalions at first observed garrison date, 15 May, are allocation
   inference; reject exact-arrival claims or assigning the approximate total to each.
3. Transfer identities without creation/relocation/refill; sourced militia relief
   is separate. Keep strengths/original terms unknown; reject assigning Harper's
   combined 2,400 to militia or adding 40,000 twice.
4. Bounded neutral-civilian institutional succession preserves personal choices;
   reject invented resignations or service overrides.
5. Mixed unquantified land contingents use the existing land arm; southern garrisons
   stay out of the northern sweep. Reject invented arm totals/forced Peninsula arrival.
6. Recenter successions to `around(5)` and withdrawal to `around(1)` with causes;
   only the lead may retire S44's quiet entry. **Neither is applied or accepted.**
7. Keep failed strength/unknown-combat criteria; reject forced resistance, proxy
   fitting, D6 waivers or hook bypass.

**Already ruled/evidence:** inherits A02/B09/time/S42; S44's quiet decision does
not authorize reversal. Corrected binding run exit 1, Phase 0 5/6, 1A 2/6:
withdrawal 1/0..0, successions 5/1..4; Confederate men 90,239/100,000, two unknown
combat blocks, five pushback/both D6 gaps. Stone still reaches Richmond 15 May;
new defenders withdraw. 148 Union hashes change; 120 testbed hashes/counters match.
Actual failed hook (1,958 passed/three failed/three skips) **predates** militia-share
correction; no passing final hook. NC/TN/AR optional work remains unfinished.
New state-act/gate classifications remain unsigned for review.

**Staged probe:**

```text
git merge-tree --write-tree --name-only --merge-base=f19b6f0 f19b6f0 73bd2b18296e4d8ea5926c6763b33e1d276eab0e
```

Exit 0, tree `73bd2b18296e4d8ea5926c6763b33e1d276eab0e`, no conflicts: this is
the target's own staged overlay, not a separate committed branch.

## 10. S48 staged kernel gaps (uncommitted)

**Identity:** `C:/Pyrrhic/sprint-fixes-play`, now **`sprint/kernel-gaps`**, HEAD
`23b5d49180da7a6b1d94a277d3d19bcdffb65278`, 52 staged paths/no unstaged diff;
tree **`faf16337fbaea72db263aafef1a29b574a1bf2ba`**. Backup
`C:/Pyrrhic/mandate-reviews/staged/s48-kernel-gaps-staged.patch` exactly matches
staged binary diff: 1,457,461 bytes, SHA-256
`3fe7123c4be9d37d8d433901b0bd1dcf444cfccae9ec9704a3e48058a938207d`.
This is not the committed old `sprint/fixes-play` tip.

**Changes/look first:** K2 ordinary Manassas goal/vacancy/put-off, K1 human Scott
paper received 27 May with existing appointment, K6 signing/dispatch/execution,
K4 received conditions or explicit absence, K5 receiving-command join papers,
K3 contract only. Read staged `notes/lane-s48-kernel-gaps.md` including K3,
`docs/audit/s48-evidence/goal-trace.json`, `history-comparison.json`, pack
`s48-kernel-gaps.test.ts`, kernel `s48-condition-reports.test.ts`, `join.test.ts`,
and `tools/test/support/s48-projection-migration.json`. Check ordinary orders,
received-vacancy privacy, pruning/save and rule-seat no-op. Read with
`git -C <worktree> show :<path>`; exact index tree above, no published link yet.

**Proposed rulings [I]:**

1. Keep ordinary goal/appointment and received vacancy belief under K2/K1; reject
   flag-only advance, automatic establishment or invented received plans.
2. Review issued General Order adapted as Scott's proposal; reject claiming an
   original proposal was sourced. Final local receipt is 27 May, superseding 28 May,
   with separate human-only no-op/hash proof.
3. Forward received drill/readiness with provenance or explicit absence; reject
   hidden-condition proxies, invented training actions/meters. No producer is supplied.
4. Keep receiving-command joins, unknown strength and bounded latest acknowledgments;
   reject dispatch/nominal transfer as arrival or invented headcounts.
5. Keep K3's received start/identity/source/date/staleness/supersession/pruning/save
   contract and paired-State tests; reject signing-date ETA, live operation polling
   or desk-created start papers. No clock is built.
6. Preserve liveness/field-combat criteria; investigate assembly/reset separately.
   Reject eight quiet bands merely to commit. Exact projection migrations preserve
   findings; they are not truth exceptions.

**Already ruled/evidence:** K2/K1 authorized, A02/B09/time/S42 inherited. Actual
step-1 commit attempt failed; final hook body also fails: 1,960 passed/three failed/
three skips, ten Union liveness breaches (eight dead mechanics, stages 3/4..18,
battle dispatches 2/9..36). Step-2 binding run exit 1, Phase 0 5/6, 1A 3/6:
zero Union planned operations fought, four pushback/both D6 gaps; relay holds now
meet the floor. June goal starts assembly; July goal **is sent**, then its bypass
resets assembly to 5 August. Return-best 7/8 is invalid D6 evidence. Later report
code has final-reference proof, not a second eight-seed campaign; all 268 daily
hashes change from day 1, initial hashes unchanged. Corrected paired fixtures/
human receipt were verified afterwards; **final corrected tree has no passing
whole hook**. Regenerate combined schema/unreleased save during eventual integration.

**Staged probe:**

```text
git merge-tree --write-tree --name-only --merge-base=23b5d49 f19b6f0 faf16337fbaea72db263aafef1a29b574a1bf2ba
```

Exit 0, tree `89da246c262fad44b7be98ce09d441a18205a4d1`, no conflicts. Explicit
base models the uncommitted overlay and retains S45. It does not test S46 and
S48 together or establish runtime compatibility.

## Probe method, validation and remaining review

All eight branch results used `git merge-tree --write-tree --name-only f19b6f0
<full-tip>`: exit 0, no conflict paths. Source links use immutable full commit
IDs. Five listed tips are contained (1a/fixes-play/fixes-canon/play/map-fixes);
realism/play-politics/research-cast are not. Staged trees were reconstructed in
the audit Git object database with `git mktree` from read-only stage-0 entries;
no temporary commit/ref or other-worktree index write. Explicit-base probes use
those exact trees, not old HEADs. Backups match ordinary abbreviated-index binary
diff bytes; full-index diffs have different header representation.

S49 focused checks cover ten packets, source paths/anchors, probe exits/trees,
backup equality, preserved source indexes and one-file scope. Root `npm ci`
passes; four workspace links resolve to this worktree. Actual configured commit
hook remains mandatory; its later receipt belongs in the sole CODEX status.
S32's unchanged audit-baseline runtime evidence is reused; no new done-check,
package build or gameplay review is claimed. Unchanged S32 branch packets retain
their earlier source/gate work; do not silently refresh their cutoff.

**Findings outside my scope:** standing four-lens verdicts, lead rulings, separate
gate classification/placement/signatures; all source/strength/readiness/operation/
pushback/D6/timing gaps; S46/S48 correction/ruling/commit work; cumulative conflict
resolution, CI, owner exit review, steward integration, pushing and release.
Only this addendum is edited; no new ledger, handover or canon edit is authorized.

## Updated merge order [I]

This replaces S32's suggested order, preserving required standing verdicts,
lead rulings and gate approvals. Steward must recheck cumulative integration.

1. **sprint/audit**, including S49: dispose of findings/already-made rulings first.
2. **research-gate**, **research-cast at ddc5cb7** including S38,
   **research-military**, **research-foreign-economy**, **research-politics**
   (all `sprint/` branches). Preserve source holds/units/identities/unsigned facets;
   S38's rule requires separate acceptance before apply.
3. **sprint/plan-1b** as proposals. Reconcile external drafts; do not waive 1A exit.
4. **sprint/realism at 41ce9ef** as sourced diagnosis, then **sprint/1a at
   f19b6f0** as common runtime. Review its contained **perf, people-data, checks
   (S25/3c23492), playtest, desk (S33), fixes-play, fixes-canon, play, map-fixes**
   there. Preserve A02/B09/time/S42 and later corrections; no separate remerges.
5. **sprint/play-politics at 3e7aad0**. Shared map already present; preserve advice/
   displayed-morning/privacy controls and route its six kernel gaps.
6. **S46 staged overlay**, only after local-allocation/service choices and two band
   rulings are resolved and a hook-passing commit exists. Regenerate derived data;
   preserve unknowns and failed strength/combat criteria.
7. **S48 staged overlay**, only after assembly/reset/ten liveness breaches are
   resolved without waiving field-combat evidence, then a passing hook/commit.
   Reconcile accepted S46/S47 on the owning branch; present probes do not certify
   that combination. Reject quiet-band shortcuts; keep K3/readiness/policy gaps.
8. **sprint/situations-1862** as isolated unsigned drafts, after source/contracts.
   Keep unloaded until receipt producers, typed acts, costs, adoption and signatures
   exist. Required integrated rules/history/CI and owner exit checks use final inputs;
   every unmet criterion stays open until its owner disposes of it.
