# Lane 1.6: politics, first cut

Phase 1 lane 1.6 (FOUNDATION section 12, row 1.6), on branch `phase1-politics`, from main at 1637a1f. It builds the
chambers of the legislature and the accountability ledger (0040, 0046; S20), the framing term (0028, 0040), the
blocs and the mandate recast from M2's `derive`, and the press as a report route. It also replaces 0079's credibility
stand-in with a derived term, applies lane 1.5's `address` proposals, and adds the gate check that refuses a bloc made
of a protected group.

## What is built, and where

| Piece | Where |
|---|---|
| The four `politics` fields, the only writer `applyPolitics`, and the derived mandate and credibility, each with typed terms | `kernel/src/politics/politics.ts` |
| The pack rules (blocs, chambers, the session calendar, credibility, framing, the press), and the kernel's own check of them | `kernel/src/politics/rules.ts` |
| The front page: a paper's battles as its public hears them, and what it moves at its reach | `kernel/src/politics/press.ts` |
| The phase (4e, after the weekly people step): proposals, the week's drift and the ladder's pull, the press, then the chambers and the ledger | `kernel/src/tick/politics.ts` |
| Two condition kinds for situations, both public facts readable in option conditions: `chamber` and `ledger` | `kernel/src/situations/{types,conditions}.ts` |
| Credibility read from `politics` wherever an order or an audience read the stand-in | `kernel/src/reading/orders.ts` (`principalCredibility`), `kernel/src/audience/audience.ts` |
| Schemas, the validator, and the effect checks on `politics` fields | `pack-format/src/{schemas,validate,situations}.ts` |
| The gate check: no bloc of a protected group | `pack-format/src/gate.ts` (`checkBlocs`), run by the loader beside the situations' gate |
| Tests | `kernel/test/politics.test.ts` (10), `pack-format/test/gate.test.ts` (1 more) |

### The State

All four fields are written only by `politics`:
- `blocSupport`;
- `chamberStates` (records `ChamberState`, keys `cham*`);
- `congressLedger` (records `CongressAct`, keys `ledger*`);
- `warFraming`.

`OWNED_FIELDS` names them, with their proposers. The mandate and credibility are derived on read and never stored.

## The rules, as built

### Blocs

M2's recast. Each bloc is a pack rule: its side, its voice (a side's voices sum to 1000), its rest, its values, and its
reactions to a battle reported won or lost. Each has its cite.
- Support starts at the rest and drifts back toward it weekly, by 1/`driftDivisor` of the gap (M2's).
- An address raises the bloc addressed (`address.support`). The side's blocs that share none of its values lose `othersPenalty` (M2's rule).
- The ladder pulls weekly, by M2's rules:
  - a man on lobbying or above drains his own bloc, `lobbyingPerRung` for each rung from lobbying;
  - from public defiance up, every bloc of his side loses `publicDefiance`;
  - a rival's bloc loses `rival`.

### The mandate

The side's bloc support weighted by voice, plus the framing term at `framing.mandatePermille`. Each term is returned.

### Credibility

The principal's sanction credibility (P7) is derived. It replaces 0079's stand-in, and the pack rule
`people.context.leaderCredibility` is retired. It is the sum of:
- `base`;
- `mandatePermille` of his side's mandate;
- `perRelief` for each man who holds a relief against him: a record that he does relieve, which fades as the grievance does.

It is clamped to `min`..`max`.

Both packs set base 450 and a fifth of the mandate. That puts the start at about the old 500 (testbed 495 and Union
498), so the reference runs' compliance barely moves.

### The legislature

**Chambers by the calendar.** Each chamber sits by the pack's calendar of regular sessions. The state is recomputed
daily, because sessions fall on particular days.

**A call.** A situation's `session-call` effect summons a callable session:
- it is `called` until it opens, on its date (or the day after the call, if that has passed) or `afterCallDays` after the call;
- it then sits to its close or for `sitsDays`;
- a called session holds until it closes, whatever the calendar says;
- a second call while one stands is refused.

**The ledger** (0046):
- `ledger-act` enters an act, with its side, situation and option.
- The act is met on the first day a chamber of its side sits, or at once if one sits.
- `ledger-answer` (S20's ratification) answers what is before the legislature: one act, or all of the side's. An answer with nothing before it is refused.

**Conditions.** `{chamber: {id, state}}` and `{ledger: {side, act, status: away|before|answered}}` are public facts. They
join the option conditions' allow-list (`KNOWABLE`), as its comment had promised, so options can be legal by the
chambers. A situation's own knowledge trigger still reads only `knows`.

### Framing

Framing is signed permille per side: who its public believes began the war (positive: the other side). It is moved
only by situations' `framing` effects. It counts in the mandate, and the front page prints it.

### The press

No owner of its own: a report route (FOUNDATION section 7).

**Printing.** Every `cadenceDays`, each paper prints a front page:
- its editor (a person in the World, of the paper's side) writes it, as a `press` report, from the paper's region by mail;
- it goes to the side's principal and to every serving holder of one of its posts;
- a paper whose editor is no longer serving, or no longer on its side, is silent.

**What it says.** The page carries the battles its side closed since the last page, each read by who left the field:
- `won`: the other side withdrew or routed;
- `lost`: its own side did;
- `drawn`: neither did.

Each battle is a `battle-result` claim, with the side's killed, wounded and missing. The side's framing is a `framing`
claim when it is not zero.

**What it moves**, at the paper's reach:
- each bloc of the side, by its `victory` or `defeat` (applied by `politics`);
- the battle's commander's standing, by `press.standing` (applied by `people`).

The truth layer carries the reach as a `press_reach` term.

### Effects

A situation's effect on `politics` names one of `bloc-support`, `framing`, `ledger-act`, `ledger-answer` or
`session-call`. The fields 1B builds (`foreign-patience` and `national-will`) are still reported and not applied. Any
other field is refused, both in play (a `proposal_refused` event) and at validation. Validation also checks the bloc,
the callable session, the act's side and the ledger condition's act.

### The packs

**Union.** Data:
- the six Union blocs of the politics note (the abolitionists merged into the Radicals, as it recommends) and one Confederate bloc;
- the Senate and the House;
- the 37th and 38th Congresses' sessions, from the note's section 1.5;
- the special session of 4 July 1861 as callable, sitting 34 days;
- three papers (the Tribune, Times and Herald, edited by Greeley, Raymond and Bennett, who are already in the people list with citations).

Sources:
- voices, reactions and reach are [I], from the note's design implications;
- rests come from the M2 scenario;
- the Peace Democrats' reaction (they rise on defeats and fall on victories) is the one direction the note sources.

**Testbed.** The M2 testbed's five blocs, a Northern Assembly with a May and June session and a callable special
session, and a new fictional editor (`n_editor`, person kind `editor`) for the northern gazette.

## Done

- `npm run check` passes (1160 tests), and `npm run run:done-check` passes all six criteria. The Union run's day costs a median of 12.95 ms (p95 30.98 ms), inside the 40 ms budget, with the press's mail.
- The tests drive:
  - blocs at rest, and the mandate and credibility with their terms (a relief raises credibility; an order reads it);
  - an address and the weekly drift, through the tick;
  - the effect mapping, with its refusals;
  - the chambers by the calendar, through the tick;
  - a call, and the refusal of a second;
  - the ledger away, met, answered and refused, with both conditions;
  - battle results;
  - a front page through the tick (blocs, standing, the report the principal holds, none for the other side);
  - a silent press;
  - the rules' own check;
  - the gate's bloc check.
- The liveness gate:
  - **Bands from the merged runs:** front pages, support, and the chambers opening and adjourning.
  - **Mail counted apart (the lead's ruling, the second commit).** A weather day on a mail route now fires `messages.mail_delay`; the courier routes keep `messages.courier_delay`, so that count still watches orders and reports.
  - **Re-banded:** `courier_delay` is at its measured courier-only count, `mail_delay` at its own, and `knowledge.pruned_age` (Union 8 to 28) because front pages are kept the press template's 21 days.

| Run | `courier_delay` | `mail_delay` |
|---|---|---|
| Union (merged with main at d4943e5) | 70 | 1247 |
| Testbed | 35 | 107 |

The other Union bands from the merged run: `front_page` 30, `support` 23, `adjourned` 1, `pruned_age` 29, `messages.sent` 5,288 and `messages.delivered` 4,810.

The pre-press band of 197 also counted the mail's weather days: other reports already went by mail before the press.

### Where the mail comes from (the Union run, 75 days)

- **Messages sent:** about 2,820 before the press, 5,272 after. That is about 2,450 more: 30 front pages (3 papers × 10 weeks), each to about 80 readers.
- **Only courier and mail draw weather.** The wire and special messengers never do. Before the press the run's traffic was mostly wire.
- **Every front page goes by mail from New York.** The pack's mail takes twice the courier's days, and the weather adds 0 or 1 day (`courierNoiseMaxDays` 1), so about half the pages that travel draw a day.
- **Totals:** messages grew about 1.9 times. Weather-exposed traffic grew several-fold, because the press is the run's first bulk mail.
  - **Quiet, each driven by its kernel test:** `act`, `met`, `answered`, `called`, `framing`, `refused` and `press_silent`, until lane 1.11 authors S09, S20 and the war's opening.

## Choices made (for the decision record)

1. **Politics data as pack rules with cites** (`rules.politics`), not four new world tables. They have one consumer and are small, and the generator stays unchanged. *Rejected:* CSV tables for blocs, chambers, sessions and papers.
2. **A bloc starts at its rest; no scenario rows yet.** *Rejected:* per-scenario start rows now, with one start per pack. The March 1862 demo start will need them.
3. **The chambers by the calendar daily**, with a call held until it closes. *Rejected:* the weekly step, which would miss the session days.
4. **The ledger is entered and answered by effects, and met by any chamber of the side that sits.** *Rejected:* recording every act of the principal (the acts owed are a situation's judgement, with S20 answering them).
5. **The press prints to its own side's principal and serving post holders; its effects scale with reach, and a battle is read by who left the field.** *Rejected:* the press as an owner of State; a single national front page; the enemy reading it (1B, see findings).
6. **Credibility derived from the mandate and the reliefs on record.** *Rejected:* M2's override count, because the new State keeps no record of overrides.
7. **Unknown `politics` fields refused; the 1B fields reported.** *Rejected:* silently dropping unknown fields.
8. **No bloc of a protected group**, by its id or name in any locale. This is a gate check, not a convention.

## For the lead

1. A decision record (the eight choices).
2. **FOUNDATION section 10 rows.** The four fields with their code names and proposers. The phase list gains 4e (politics, after the people step). Section 7 gains the press's readers and the battle reading.
3. **Lane 1.11** gets the vocabulary it needs:
   - S09's `militia-call` option: a `session-call` of `congress_37_1`, plus a `ledger-act` for the call.
   - `larger-longer`: a `ledger-act` for the call.
   - S20: fires on `{chamber: {id: house, state: sitting}}`, its options read `{ledger: …, status: before}`, and ratification is a `ledger-answer`.
   - The war's opening: `framing` effects.
   - "Summon Congress at once" needs a callable session with `afterCallDays`, and how many days Congress took to assemble needs a source.
4. **The gate reviewer** should read:
   - `politics/press.ts`, `tick/politics.ts` and the Union blocs and papers in `packs/union-1861/pack.json`, against `press-suppression`, `war-aims-1861` and `northern-racism-cost`.
   - Nothing here suppresses or leaks: suppression stays a security order (lane 1.11).
   - Framing moves only by a situation's effect.
   - The reason ids lane 1.11 writes (for example, racist opposition) pass through unchanged.
5. **The mail load.** The press nearly doubles the Union run's messages, all by mail (see "Where the mail comes from"). The lead ruled to count the mail apart and to leave a reader-kinds rule until lane 1.14 measures a full campaign.
6. **The pushback map.** Nothing in 1.6 consumes the order-to-value map. `address` carries no content yet. Whatever reads its pushback later reads the floored `pushbackOf` (lane 1.5b).
7. **Calibration.** The Union numbers are [I] and the M2 rests. Lane 1.14 calibrates them against the note's calibration points (the 1862 midterm band, the two lows).

## The gate review's fixes (lane 1.6 at 95b88b5)

- **G-1.6a.** The front page counts the captured among a side's losses, as 0074 and 0076 have the public count them among the missing.
- **G-1.6b.** A cut-off force that surrendered or was destroyed has lost, though it never withdrew. Pegram's surrender at Rich Mountain prints as lost, not drawn.
- **G-1.6c.** The Confederate bloc holds `slavery_defence`, cited to the Confederate constitution of 11 March 1861 (`docs/research/2026-11-14-confederate-side.md` [AVA-CSA]). R1 decides the Confederacy's real blocs.
- **Item 4: the bloc table is pinned.**
  - `blocSignOffProblems` and `blocHash` sit in `pack-format/src/gate.ts`, as G-1.5e pins gated rows. The hash covers each bloc's rule and its English name.
  - `packs/union-1861/test/gated-blocs.test.ts` holds each Union bloc's hash, signed by `gate-reviewer`.
  - A new or edited bloc, or a renamed one, fails until it is re-signed.
  - The testbed's fictional blocs are not pinned.

## The standing review's fixes (lane 1.6 at 95b88b5 and e0661a1)

- **Item 5, the [I] labels.**
  - Each Union bloc's cite now labels its rest and reactions: "[I]", or, for the Peace Democrats, "the reactions' direction is sourced, their sizes [I]".
  - `drift` (it was `driftDivisor`), `address`, `ladder`, `credibility`, `framing` and `press.standing` each carry a `cite` stating "[I]" or "M2's". Lane 1.14's stand-in criterion finds them in the pack.
  - Credibility's cite says it replaces 0079's STAND-IN.
- **Item 4, the QUIET events asserted.** The needle tests assert the `framing`, `act`, `answered` and `called` events that the tick fires, each through `applyPolitics`.
- **The lag from a call to a sitting Congress** (the lead's ruling on lane 1.11r's answer, `docs/research/_parts/F-congress-lag.md`):
  - A second callable session, `congress_37_1_at_once`, sits 30 days after its call, for 34 days. It is marked [I], with the 1861 lag (80 days) and the comparisons (17, 75 and 38 days) in its cite; lane 1.14 calibrates it.
  - The historical call keeps its own session, `congress_37_1`, for 4 July.
  - Lane 1.11's "Summon Congress at once" option calls `congress_37_1_at_once`.
- **Item 7, the merge.** Main is merged at d4943e5, the generated files are regenerated, and every Union band this lane set is re-banded from the merged run. The done check's final hashes against both parents:

  | | lane at e0661a1 | main at d4943e5 | merged |
  |---|---|---|---|
  | Union, at war, 75 days | 6a9290a3878bfd34 | 08ecc54e6076400a | aa060c05ee33b77a |
  | Testbed, 120 days | 42bc7f0e15af1099 | 0dc77944e8d96091 | 42bc7f0e15af1099 |

  - **Union:** the merged run differs from both parents, as it should, since main's lane 1.11a people data and this lane's politics both change it.
  - **Testbed:** the merged run equals the lane's, so nothing main merged since 1637a1f changes the testbed run. Main's differs only by this lane's politics: the press, the editor and credibility.

## The press's figures from the returns (the lead's ruling, on 0ffcc56)

A front page went to the principal with the battle record's exact losses, a route around 0008 and 0052. Now:
- **The figures:** a page's `battle-result` takes its side's losses from the casualty returns its principal holds by the printing day (`returnedLosses` in `politics/press.ts`). For each battle day it takes the full return, written `revealDays` after the day, if he holds it, else the first return written that evening. The battle record is never read for figures.
- **Confidence:** 900 from full returns for every day, 500 while a first return stands for any day, and 0 with no return yet, when the page prints the result with no figure.
- **The captured (G-1.6a):** the first return counts them among the missing, and the full return lists them apart. Both count them, so G-1.6a holds through the returns.
- **The result** (won, lost or drawn by who left the field) is public. Under R54, battle reporting sends that public closing account to each side's editors through ordinary transit. The page reads the editor's received account, including its named commander, rather than consulting the battle record.
- **Test:** no figure before any return; the first return's low figure; then the full figure with the captured; and the return's claim of the enemy's losses never counts as the side's own. Re-break: reading the battle record's losses fails 2 tests.
- *Rejected:* the truth on a lag (it still leaks exact losses before the full return), and a paper's own estimate (a slant, which belongs to 1B).
- **The gate reviewer's two conditions:**
  - **A surrender never vanishes.** The result line always prints, from the public fact of who left the field, whether or not a return has come. A force taken whole, with its post above vacant, sends no return, yet the next page reads "lost" with no figure (a tick test). Dropping battles with no return fails 3 tests.
  - **No early split.** The captured print apart, as a `captured` claim beside the result, only once every day's full return has come. On the first page they are among the missing, and nothing prints them apart (a test).

## R54: received stories in the seat view and the week's papers

Built in `C:/Pyrrhic/mandate-press-view`, branch `press-in-view`, from `4a52663`. Dependencies were installed with `npm ci` in the root and `prototypes/desk` before implementation. R53 and the other worktrees are outside this run.

The closing public report reaches the editor by the existing wire/courier route. If the force can send no return, the principal's staff signs the public account from the field. It gives no casualty figure. The page selects reports received since the previous printing day; a late account can therefore appear in the next issue. Its result and commander come from that account. Figures come from the principal's held casualty returns for that battle and its covered days, bounded by the printing day. A missing day's full return prevents an early captured split. The received page never changes when later returns arrive.

The optional immutable `ReportClaim` fields `claimBattle`, `claimBattleDays` and `claimCommander` carry identity, coverage and the source's named person. `ReportClaim` remains registered in `IMMUTABLE_RECORDS`; FOUNDATION section 10 names `knowledge` as the owner, with `messages` carrying the body in transit. The view projects `battle`, `battleDays` and `commander` without reading truth. No root State field or pack rule was added.

CLI and browser presenters render headlines and short copy from twelve added generic strings in each pack. Existing strings are preserved. A zero-confidence result prints no figure; captured figures stay associated with their battle. The week's papers lists each press story with editor/post and written date, opening the received source paper. Its battle section groups phase dispatches by battle ID and links the latest received dispatch in written order. Legacy presentation fixtures without identity group only by place and day; they cannot reliably identify a battle across days.

**Proposed rulings [I]:** use an ordinary public report route and the editor's receipt window, rather than reading true closed records when printing. This can defer a story and its political effects by an issue. Keep identity as optional immutable claim metadata, rather than storing prose, adding another truth owner or consulting today's commander. Use CI for the browser typecheck, since installing the separate desk dependency tree in each hook snapshot is costly and the snapshot currently supplies only root dependencies. The lead records accepted rulings; no decision record or gate signature was authored here.

**Verification:** `runs/r54/` holds the logs, browser captures and preservation audit. The required `MANDATE_NO_GIT=1 npm run check` exited 0: 101 files, 1,273 passed and 3 skipped, plus typecheck, boundary, licences and decision index. The first root run exposed three existing LFS tests that write temporary Git fixtures despite that flag. Those fixtures did create temporary commits; no worktree history or index was written. They now skip under the flag, and the targeted LFS run passes 7 / skips 3. Normal CI and hook collection remain full. The unaffected root evidence is reused rather than rerunning the campaign to verify a test guard.

The standalone done check exits 0, 6/6 criteria: replay, save/resume, liveness and timing. All 153 Union and 153 testbed mechanics remain in their existing bands. Union median/p95 is 33.60/63.30 ms; testbed 4.44/7.34 ms. No band changed. The 35-day testbed probe has ten held page copies with battle stories and four held public closing reports.

The desk suite without ignored map data passes 76 / skips 8 (84 collected); skips name `npm run map:setup`. The later focused adapter/story/summary check passes 11 tests, including the new presenter equivalence test, and the final source-label correction passes 5 affected tests. Browser typecheck and build exit 0. The two browser checks open stories and return to the weekly paper at 1920×1080 and 3440×1440; these test the reading components with an explicit fictional snapshot, not the map. Four captures are under `runs/r54/browser/`. Existing unresolved art references and the bundle-size warning remain. CI now installs the desk's dependencies and runs `npm run typecheck:desk` on both check platforms; hosted CI was not run here.

The day-40 testbed save was regenerated using `npx tsx tools/make-save-fixture.ts`, for the new report metadata and public traffic. Its command log, log hash and world hash are unchanged. Existing strings, lockfiles, scenario sources, signed situations and gate files are preserved. HEAD remains `4a526635cf672ed318d75af1c6376c0396ec1d6a`; the index is empty. The browser server is stopped. Claude's independent standing review remains pending.

## R63: the three truth regressions and LFS fixture separation

For the lead: 1 item. Completed R63 only in `C:/Pyrrhic/mandate-press-tests`, branch `press-tests`, from `89705531c73c50064f30d57fd64daabfbad270cf`. Both requested `npm ci` installs passed before implementation. No runtime source, pack, save, lockfile, signed item or other run's worktree changed. Evidence is in `runs/r63/final-checks.json`, with the retained logs and preservation inventory beside it.

`packages/kernel/test/press-view.test.ts` now has three separate regressions:

- **P1:** the editor holds one story and another seat on the same side holds a different one. Only the editor's story and its effects print.
- **P2:** a closing report written on day 4 arrives on day 8. It is absent from day 7's page, appears on day 14's page and does not repeat on day 21.
- **P3:** two battles share a region and a covered day. Their full returns carry different losses and captured counts; each page claim keeps its own battle's figures. Sharing a covered day makes place and day insufficient to pass this test.

Each test was run against its deliberate re-break: flatten all seats' reports (P1), remove the printing-day receipt ceiling (P2), or remove battle identity from return matching (P3). Each run exited 1 with exactly its intended test failing. `runs/r63/rebreaks.json` records the exact changes, and the per-case JSON and logs retain the failures. Every mutation was restored byte-for-byte. The final production sources match the baseline. The later P1 correction only replaces an invalid union-property assertion; its story assertion, which caught P1, is unchanged.

The three Git-writing tests moved from `tools/test/lfs.test.ts` to `tools/test/lfs-git.test.ts`. Their bodies and assertions are preserved, with only the `skipIf` wrappers removed (`runs/r63/lfs-move.json`). The config excludes that whole file beside `staged-check.test.ts` only for `MANDATE_NO_GIT=1`. Normal collection includes both, and the existing CI rejection of any `MANDATE_NO_GIT` setting still passes. The ordinary fixtures were collected but were not executed in this read-only run. A new config test covers the unset, `0` and `1` modes.

The CLI and desk retain their byte-identical local `press.ts` copies. The desk development server deliberately denies sibling `packages/` sources (`scripts/dev.ts` and `server/http.ts`); a shared import would require widening that boundary. Used the request's equality fallback: `tools/test/press-copy.test.ts` compares the actual bytes. A deliberate one-line divergence exits 1 with that test failing; the original bytes were restored. The existing desk test still verifies equivalent rendered stories. No source-server change or new design ruling is proposed.

**Verification:** the required `MANDATE_NO_GIT=1 npm run check` exited 0: **102 files, 1,275 passed / 3 optional timing skips**, plus root typecheck, boundary, licences and decision index. Focused checks passed **22/22** before the P1 type correction; its final affected file passes **5/5**, followed by a passing root typecheck and full gate. The desk suite passes **77 / skips 8** optional map-data tests, and its typecheck exits 0. No browser or package build was needed for this test/config-only change. Those runtime paths and both presenter sources are unchanged.

The required standalone `npm run run:done-check -- --label r63-done` exited 0, **6/6 criteria**: repeat/frozen hashes, replay, save/resume, liveness, required section-10 coverage and timing. Union median/p95 **34.44/67.01 ms**; testbed **7.76/26.51 ms**. Both mechanics runs retain all **153** existing bands. Drafting diagnostics and the summaries/saves are under `runs/r63-done*`. These are Phase 0 mechanics checks, not milestone 1A acceptance or hosted CI.

The pre-edit config regression failed for the missing exclusion, as intended. Root typecheck then found an invalid `.delta` read on the `PeopleChange` union in the new P1 assertion; its typed replacement passed the affected test and typecheck before any full gate. A preservation helper initially demanded byte-identical Git metadata; the final audit records the actual narrower evidence: `.git` and HEAD unchanged, the index byte hash changed, and `git diff --cached` empty. Only read commands were issued, with optional locks disabled for final reads; no Git metadata was restored or edited directly. There was no expensive retry.

Final audit: **seven delivery files**, **1,380 other baseline files unchanged**, no deletions or unexpected additions. All production sources, generated files, lockfiles, saves, scenario sources, signed items and gate files match entry. HEAD remains `89705531c73c50064f30d57fd64daabfbad270cf`; there are no staged changes. Whitespace checks pass. No server was started. The standing reviewer still reviews this delivery under 0096.

For the lead:
1. Review the R63 tests and fixture move; run the ordinary Git-fixture tests through the authorised hook/CI. This run preserved their bodies and verified collection without creating Git histories.

## R68: the press within the tick budget

Completed R68 only on `press-tests`, retaining `930723df18b8565696cbc010ab630dd5cde6c934`. The runtime change is confined to `packages/kernel/src/view/view.ts`: ordinary claims without battle metadata take a direct frozen-object path, avoiding three conditional empty spread operands. Claims carrying battle metadata keep the previous projection. Optional keys, their order, null commanders, copied frozen day arrays and source immutability are covered across all 16 combinations. No State, report, message, press-selection, route, return, save or rule changed.

### Measurement and diagnosis

Main is pinned to `e56a08811117b17346380b2257b158439356b0a3`, copied to `C:/Pyrrhic/r68-main-comparison` outside every repository. No comparison worktree was created. Its workspace package links resolve to that copy. `runs/r68/prepare.py` records the source-copy method; `environment.json` records the revisions and Node version. Git commands were read-only.

Three final back-to-back Union at-war 75-day pairs alternate execution order. Both sides use the existing `phase0Run` timing mode: requests, seats and tick, without freezing or daily hashing, final checkpoint only. No other validation from this task ran alongside these final pairs.

| Pair | Main median / p95, ms | Branch median / p95, ms |
|---|---:|---:|
| 1 | 33.5943 / 68.5064 | 36.5255 / 74.7312 |
| 2 | 29.8806 / 64.4259 | 29.2377 / 66.2915 |
| 3 | 32.6303 / 74.0275 | 31.6048 / 68.1612 |
| Median of the three measurements | 32.6303 / 68.5064 | 31.6048 / 68.1612 |

The branch's median is 3.14% below main's, meeting the 5% target. Pair 1 alone is 8.73% above main; it is retained, not discarded. Earlier samples show substantial host variation. The first series also overlapped this task's separate baseline hash capture at its opening; it is not evidence of a causal before/after speedup. `final-pairs.json` retains all final measurements and hashes.

The CPU profiles and `profile-summary.json` separate initialization from `playDays`: courier-table construction is startup, while command/post lookup and report delivery dominate the day. The Union reference prints no closing battle story; return/page scans have no sampled cost, and main/branch traffic is nearly identical (5,484/5,483 sent). This does not justify an index or a traffic change. The R54 addition also runs three conditional spreads on every ordinary projected claim. The bounded same-process projection probe gives 16.9310 to 15.6008 ms median for 300,000 ordinary claims (7.86% lower), with equal projected values. The metadata case is 57.3126 to 59.5948 ms; no speedup is claimed there. Profiles do not establish the source of the Linux CI regression or a whole-day causal speedup. The exact final helper is bound by the delivery inventory; the file named `after.cpuprofile` predates the immutable-construction correction.

### Verification and preservation

The final combined command sets both `MANDATE_NO_GIT=1` and `MANDATE_TIMING=1` for `npm run check`. Its `npm test` child therefore runs all three wall-clock tests. Exit 0: 102 files, 1,279 passed, zero skips, plus typecheck, pack boundary, dependency licences and decisions index. The Git-writing fixture files remain excluded as required by the read-only run. The final focused projection/one-writer selection passes 50 tests; the earlier banned-API selection and final typecheck pass.

`npm run run:done-check -- --label r68-done` exits 0, 6/6 criteria. Union median/p95 35.61/70.42 ms; testbed 3.91/5.60 ms. Repeat/frozen hashes, replay, save/resume and liveness pass. All 153 mechanics bands per pack retain their definitions and measured values. The checked frozen runs also match all 195 daily hashes captured before editing. Complete before/final run summaries are identical. Eight view snapshots retain 968 identical successful hashes and 136 identical inherited RangeErrors; failed views are recorded, not called successes. The committed save fixture, both lockfiles, budgets and band definitions are byte-identical to entry.

The first full check found exactly one scanner failure: assigning `battleDays` on the temporary view builder conflicts with the global immutable-key rule. Its other 1,275 tests passed. The correction uses object construction, without scanner exceptions. Focused scanner/projection/type checks passed before the single combined full gate. The original failure, Windows file-URL harness startup failure and unsupported TypeScript transpilation API probe are retained in the evidence. No required limit was weakened.

Evidence: `runs/r68/final-checks.json`, `final-validation-jobs.json`, `preservation.json`, paired timing summaries/logs, CPU profiles, projection probe, daily/view comparisons and `runs/r68-done*`. Three delivery files: the projection, its regression and this hand-over. No server, install, build, generated-file regeneration, Git mutation or other run's work. Proposed rulings: none. Claude's standing review remains pending under 0096.

## Findings outside my scope

- R68: the reported Linux CI failure needs its integration rerun. Local comparisons pass the agreed target; the profiles do not prove the Linux failure's cause. The 136 unavailable view results match entry and remain outside this performance fix.

- R63's desk `npm ci` reported two dependency vulnerabilities (one low, one high). Its existing lockfile is unchanged; dependency remediation is outside R63.

- The enemy reads the papers (0032: Lee followed McClellan in the Inquirer). Front pages go only to their own side, so the enemy route is 1B.
- The relieve verb proposes no bloc resentment. M2 cost the blocs sharing the man's values in proportion to his standing.
- National will (0028's two wills), elections and the verdict remain 1B. The mandate feeds only credibility so far.
- The Confederate side has no chambers: no source in the notes covers its Congress's sessions.
- A paper's own slant (its alignment, and editors' leaks) is not modelled. Every paper prints the same battles.
- **For 1B (the gate review's item 7):** the border Unionists' values ("conciliation, union") omit their stake in slavery, which was the core of the border problem. Add `slavery_noninterference` when blocs read policy (R7's consequences). Today nothing reads bloc values but the address penalty.
- ~~The press reads the battle record's truth, not the casualty returns.~~ Fixed by the lead's ruling (see "The press's figures from the returns").
- M2's `derive.ts` stays until M2 retires.

## R72 merge resolution, 19 November 2026

The lead's merge of main `fabef47` into `f8f74da` remains in progress. App.tsx retains both R54's `pressStories` import and R66's audience/org-board imports and behaviour. No further code change was needed. Git was read-only and the merge is not staged or committed.

`MANDATE_NO_GIT=1 npm run check` passes: 107 files, 1,323 tests passed, 3 existing optional skips, with typecheck, boundary, licences and decisions passing. Desk `tsc --noEmit` passes; its suite passes 82 tests with 8 existing skips. `npm run run:done-check -- --label r72-press-done` exits 0, all six binding Phase 0 criteria pass. The later reported 1A criteria remain 2/6, with checkpoints, operation, pushback and lever-sweep failing on this branch; exit 0 is not 1A acceptance. No bands changed here. Evidence: `runs/r72/gates.json` and linked logs.

## Findings outside my scope

The situations merge remains separately blocked by the signed Sumter notice's post-holder declaration; this worktree does not include lane 1.11's history. No R70/R71 files were touched. Claude retains merge completion and standing review.
