# S27 console playtests, 21 November 2026

For the lead: 3 items. **Five console strategies reached 31 July, with no crash or rejected command in those runs. Nine regression cases preserve reproducible defects and a literal writing-rule conflict; none is fixed. The required integration check exits 1: Phase 0 5/6, 1A 4/6, with all 11 problems retained.**

This is S27 only, in `C:/Pyrrhic/sprint-playtest`, branch `sprint/playtest`, from integrated 1A **`bf6cc66c025a0567a991f1a94eb9ba20656f4004`**. The source, pack, generated data, signatures, saves and numerical bands are unchanged. All **1,690 original tracked files** match their starting SHA-256. Review remains deferred under 0106.

**The requested 5 March opening is unmet.** The console offers its first morning on **6 March**, and no command offers 5 March. Every strategy played the 148 days from 6 March through 31 July. B01 records this gap; neither the clock nor the acceptance criterion was changed.

## Method and evidence

`npm ci` ran first: exit 0, 51 packages added, 56 audited, zero vulnerabilities. Workspace package links resolve to this checkout. `.githooks` was already configured; no hook was bypassed.

[The player](s27-console-playtests.mjs) starts the actual `play.ts` console process, writes one command to stdin, and waits for its printed prompt. It imports no game, kernel, pack data, State, World, menu or runner. Calendar dates, available choices, post holders, plans and feedback come from stdout. The authored policy names historical choices already used by the repository's console test; it sends them only when printed as available. Each strategy is bounded at 160 turns and 60 seconds per unanswered command, and stops on a crash or non-advancing date. All five ran once, sequentially, in **90.85 seconds combined**.

The console can run a turn beyond 31 July. Final mornings were 5 August, 1 August, 1 August, 3 August and 5 August respectively. **August reports and later menu reads are excluded from July findings.** Menu observations below give their actual reading date. Across the five July windows there are **740 played days, 36,659 output lines and 10,659 report lines printed during turns**. These are output counts, not counts of distinct historical events or independent seeds.

[The evidence index](s27-evidence.json) retains actions, omissions, last July menus, all command rejections in supplemental probes, and every matching notice/wording location. Locations are zero-based NDJSON record/line offsets. Each main transcript has a SHA-256. [The audit script](s27-audit.mjs) regenerates the index from stdout records; it never opens a pack or game object. Raw transcripts, records, stderr, summaries and diagnostic logs remain in ignored `runs/s27/`. [Validation receipts](s27-validation.json) retain exits, criteria, all 11 integration problems and log hashes.

The first preflight timed out at `quit`: the harness had left piped stdin open. Closing stdin after sending `quit` corrected shutdown. The failed driver log is retained in `preflight-driver.log`; the corrected probe passed before any long playthrough. This was a harness correction, not a game fix or a campaign retry. All five final console processes exited 0.

## What each strategy saw by 31 July

Dates here are the console's dates of action or receipt. They do not establish a physical event's date independently of its report.

| Strategy | Policy and observed result | Obstacles and confusing outcomes |
|---|---|---|
| Historical course — 41 turns | Took the authored historical choices when available. Sent provisions on 7 April, the militia call on 16 April, the advance decision/order on 1 July, and the congressional request on 6 July. Sumter bombardment reports arrived on 12–13 April, surrender on 14 April, and the evacuation notice on 15 April. The Virginia notice arrived on 19 April. | Scott objected to the advance. The player bypassed the chain on 4 July, received a plan, then repeatedly approved through the ordinary chain. On **31 July** Stone still submitted a **600-man** plan from Washington to Manassas, arriving in eight days. No hour-stamped field-battle dispatch reached this player. Zero parser or send-time rejections; no crash. |
| Cautious — 38 turns | Withheld the troop call until the first offered morning after 1 May: **3 May**. Chose to train first on **18 July**, and issued no advance order. The Virginia notice arrived on **9 May**, rather than 19 April. The Fort Monroe decision arrived on 15 June rather than 26 May. | No plan awaited review on the last queried morning, **25 July**. The call delay altered the observed sequence of later papers; it did not avoid Sumter's bombardment or surrender. No hour-stamped field-battle dispatch. Zero rejected commands and no crash. |
| Aggressive — 61 turns | Ordered an advance at the first morning after 1 April, **3 April**; bypassed on **6 April** after objection; approved the offered plan from **8 April** onward. Otherwise took the historical choices. | The early plan was **holding/hold**, with 600 men at Washington. Ordinary approvals met further objections. On **29 July** the same holding plan still awaited review. There were **38 turns stopping solely on objection**, plus one combined objection stop. No hour-stamped field-battle dispatch. This is not proof that command resistance is a defect. Zero rejected commands and no crash. |
| Frequent relief — 36 turns | Relieved four different printed commanders: **Stone, 3 April; Fauntleroy, 2 May; Dimick, 2 June; Slemmer, 1 July**. All four replies reported compliance, the last two with reservations. Took historical situation choices. | The last printed posts on **27 July** omitted all four commands. No replacement was scripted, and no plan awaited review. The July advance decision still appeared, but the script could no longer order the vacant DC command. Removing commanders worked; filling their places was a discoverability dead end because the console advertises appointment without an officer-pool selector. Zero rejected commands and no crash. |
| Ignores press and Congress — 41 turns | Never opened `inbox`, sent no address or response to press, and left `special_session` undecided. Other decisions and the advance followed the historical policy. Press reports still appeared automatically during turns. | Congress remained **open on 31 July**. Stone's 600-man plan still awaited review, as in the historical strategy. The console offered no ledger or chamber summary with which this player could assess the cost of ignoring Congress. That does **not** establish that politics had no internal effect. No hour-stamped field-battle dispatch. Zero rejected commands and no crash. |

All five saw Sumter reports, but none received a field-battle result or an hour-stamped field-battle dispatch in the July window. The separate rule-seat history **did** fight at Manassas; see validation below. These player paths therefore do not establish an inability of the core to fight.

The approval loop has an escape. A short console-only probe submitted a plan in March, used `approve us_dc_militia bypass`, received `order approve`, and removed the review. Its subsequent report said `awaiting-strength`. **Approval works when delivered.** Do not fix the observed loop by removing Scott's objections or forcing a battle. The queue's failure to show the bypass is independently reproducible as B04.

## Failing regressions

The test bodies are [console regressions](s27-console-regressions.test.ts) and [the writing regression](s27-writing-regressions.test.ts). The small entry in `packs/union-1861/test/s27-console-playtests.test.ts` collects them through the existing, unchanged test configuration. Test players construct a `ConsoleSession` and use only `start()` and textual `handle()` commands; they never read driver State, World, logs or menus. Fixture assertions run **outside** `it.fails`, so a broken setup cannot impersonate the reported defect.

The normal gate uses **expected failures, not skips**. Red mode runs the desired assertions as ordinary tests:

```powershell
$env:S27_ASSERT_FIXED = '1'
npx vitest run packs/union-1861/test/s27-console-playtests.test.ts
Remove-Item Env:S27_ASSERT_FIXED
```

All nine cases have actual red assertion evidence. The first seven failed together; B07 was then isolated from B02 with a genuinely invalid objective, B08 failed in its targeted run, and B09 failed in its own run. The default expected-failure checks pass. No production correction was made. When a defect is corrected, its unexpected pass should prompt conversion to an ordinary passing test.

| Case | Severity | Reproduction and desired behavior | Located cause |
|---|---|---|---|
| **B01** | Acceptance gap | Start the console. It prints `1861-03-06`; S27 requires an actionable 5 March. | `seats/requests.ts:362–367` asks for `stateDay + 1`; `console/game.ts:81–82` maps that day onto the calendar. Resolving this must preserve the project's event dates, rather than locally shifting the clock. |
| **B02** | High | `order us_dc_militia hold bypass`, then `end`, is queued and refused as `bad_goal`. The separate `hold review` probe fails identically; bare `hold` succeeds. Optional hold flags must not become places. | `desk/commands.ts:187` takes `words[2]` as the objective while bare flags remain in `words`. |
| **B03** | Medium | On a printed plan, queue timing edits with `days=1` and `days=8`. Both summaries say `edit ... timing hold`, losing the difference. | `desk/render.ts:99` omits edit concentration days from `commandText`. This also affects queue, cancellation and sent-order text. |
| **B04** | Medium | Queue `approve us_dc_militia` and `approve us_dc_militia bypass`. Apart from queue number, the summaries are identical. They should distinguish the chain choice. | `desk/render.ts:99` omits review route and bypass. The difference can affect delivery, attention and grievance. |
| **B05** | Medium | Queue audiences with `adjust:100` and `adjust:900`. Both say only `audience ...: adjust`; the values disappear. | `desk/render.ts:107` prints counter kinds but drops their arguments. This is a summary defect, not a claim that an audience without a plan must succeed. |
| **B06** | High | Wait for `about situation officer_resignation`, then read `inbox all` and `situations`. Neither exposes the existing authored notice body. The same problem hides the terms of Sumter's surrender and many other notices. | `desk/dispatches.ts:65` replaces a claimless report with `about situation <id>`; `desk/render.ts:30` filters the situation reader to open/waiting decisions. There is no console command to read the delivered notice's body. |
| **B07** | Medium | Send a genuinely nonexistent objective. The refusal ends in `(bad_goal)` rather than explaining the invalid objective. Supplemental inputs similarly expose `unknown_region`, `malformed`, `bad_counters` and `post_held`. | `desk/render.ts:82` interpolates the typed rejection reason without player wording. |
| **B08** | Low | Preview a one-day timing edit. Both the arrow and comparison say `1 days`. | `desk/render.ts:15` and `console/session.ts:66` always use the plural. |
| **B09** | Editorial ruling | The offered label says `File a refusal, hold back its delivery, and keep an unofficial channel through Justice Campbell`. This is a literal triad of imperatives under the standing rule. | Existing `strings/en.json` wording, printed by `situationLines`. It is substantive policy copy, so the proposed literal interpretation and any later rewrite require the lead's review; no act should be removed merely to shorten the label. |

Source paths in the last column are under `packages/cli/src/`, except `seats/requests.ts` under `packages/kernel/src/` and pack strings under `packs/union-1861/`. Locations refer to the pinned base.

## Writing audit and other player concerns

The audit screened the output, read the distinct policy prose and examined the renderer templates. The automated screen found no candidates, but manual reading found **two literal imperative triads**, both printed in every strategy:

- `hold_and_talk`: “File a refusal, hold back its delivery, and keep an unofficial channel through Justice Campbell”.
- `approve_holding`: “Do not give them up: employ them and keep account, their final status reserved”.

B09 represents this wording-rule conflict. These are existing labels, not new S27 copy. No all-caps eyebrow, decorative serial-number/middle-dot string, rhyming aphorism or heading-restating tagline was found in the observed prose. This is not a claim about unvisited pack text, and the failed automated screen is not presented as a literary-quality gate.

The index's `writingLocationsThroughJuly` enumerates **every matching location**, including repeated inbox readings. Its broader clarity categories are separate from the literal bans:

- Claimless situation reports: **33 distinct report lines in each strategy, except 32 in cautious play**, render as bare keys. An open decision may still be readable through `situations`; a closed notice has no such reading path. Examples of hidden notice prose include `pratt_street_deaths`, `black_volunteer_offers`, the Native nations' notices, and `sumter_evacuated`. A bare key cannot convey the authored agency, uncertainty or terms. B06 proves the closed-notice path; this count is not asserted to be 33 distinct inaccessible notices. No new historical wording was authored here.
- Raw advice reasons such as `values_offended`, `shielded_by_standing` and `holds_grievance`; raw response tokens such as `comply_with_reservations`; and `fort-surrendered 0 at fort_sumter`. These are clarity cleanup candidates. In particular, the zero in that last line is an unexplained claim scalar, not a figure the player can interpret as a garrison or casualty total.
- Opaque person/post/region names are useful command selectors but also occupy the prose. For example, the Navy secretary reports headquarters at `pennsylvania_north` and a 6,317-man strength return. **[I]** This looks like an unexplained field command to the player; S27 does not establish the historical or allocation error behind it.

Other observations requiring review rather than a simulated-outcome fit:

- The July paper names McDowell's advance, while the historical player's command list and 600-man plan still name Stone. **[I]** The mismatch needs a player-visible explanation or the appropriate appointment path; it does not justify silently replacing a commander in a playtest.
- The early advance produces a holding plan and the later advance encounters repeated relay objections. The console does not make the blocking order's route as easy to understand as its long stream of objections. B04 preserves the concrete queue omission; military resistance itself is not marked a defect.
- There is no printed officer-pool or bloc catalogue in `help`, and no command for a chamber/ledger summary. This limits appointments, addresses and assessment of Congress. These are console completeness questions for the relevant owner, not invented new verbs in this lane.
- Anderson's bombardment messages say `going well` immediately before surrender. **[I]** The perspective is unclear; review its wording before treating it as a numerical battle error.

## Every supplemental rejection and crash

The main strategies had **zero crashes, zero parser rejections and zero kernel refusals**. Short probes deliberately exercised invalid and incomplete input. All locations and exact responses are retained in `s27-evidence.json` under `supplemental`:

| Input | Result | Classification |
|---|---|---|
| `address`; `appoint`; `observer` without arguments | Their usage strings | Three expected parser rejections; they do not supply missing catalogues. |
| `go us_dc_militia` without a ready operation | `has no operation waiting for your word (try "plans")` | One expected parser rejection. |
| `hold review` | `bad_goal` | Incorrect refusal of the advertised optional flag; B02. |
| `take not_a_region` | `bad_goal` | Expected invalid objective refusal; B07 concerns its explanation. |
| Risk `9007199254740992`; call of `-1` regiments | `malformed` | Two expected numeric refusals; no crash. |
| Audience adjustment `1001`; adjustment `900` without a plan | `bad_counters` | Two refusals; range and missing-subject feedback are opaque. |
| Inquiry about `nowhere` | `unknown_region` | Expected invalid-region refusal. |
| Appointing `absent_person` or `not_a_person` to an occupied command | `post_held` | Two occupied-post refusals; no person-validity verdict is inferred. |

That is **four parser rejections and nine send-time refusals** in supplemental probes. None is counted as a rejection in a main strategy. The initial preflight's 60-second shutdown timeout belongs to the harness correction described above, not this game-crash count.

## Required validation and preserved failures

The pre-edit plan called for cheap syntax, opening, selector, shutdown, typecheck, boundary and focused regression checks before expensive work. Those checks passed after the one shutdown correction. It authorized one full default done check with drafting and the required suite/hook, with no retry to seek better timing. The done check took **3,540.64 seconds (59.01 minutes)**, exceeding the initial 20–45-minute estimate. Its progress diagnostic and complete result are retained. There was no campaign restart or change to settings.

| Check | Result |
|---|---|
| `MANDATE_NO_GIT=1 npm run check` | **Exit 0**; 146 files, **1,595 passed, nine expected failures, three existing conditional skips**; 416.06 s including chained checks. This collected eight S27 cases plus the inherited expected failure. |
| Later B09 targeted check; final typecheck | **Exit 0** each. B09's red run exits 1 on its actual wording assertion. Unaffected full-suite evidence is reused; the final real commit hook collects the added writing test too. |
| `npm run run:done-check -- --label s27-done` | **Exit 1**; **Phase 0 5/6; 1A 4/6**. The default exit binds Phase 0; 1A is measured and reported, not waived. Eight seeds, eight gated decisions, **624 base-run recruitment calls**, with drafting measured. |
| Commit | The actual configured pre-commit hook runs on the staged delivery. `runs/s27/commit.log` and `commit-exit.json` retain its receipt; the final coordination status names the commit and hook result. No push. |

**All 11 done-check problems remain:**

1. Reference median **68.26 ms**, over the unchanged **40 ms** budget.
2. History median **165.99 ms**, over 40 ms.
3. History p95 **284.40 ms**, over the unchanged **160 ms** limit.
4. Relay holds **1**, below **2–6**.
5. Filter holds **0**, below **1–9**.
6. Trims **0**, below **1–4**.
7. Compliance with reservations **86**, above **1–9**.
8. Slow walks **13**, above **2–9**.
9. Watched `return` is the Union bot's best choice in **6/8 seeds**, above a quarter.
10. The grievance/policy-pushback channel is unmeasured, so this decision has no valid D6 evidence.
11. No border governor answered a call inside the horizon of **24 weighed moves**, leaving that chain unexercised.

The host was shared Windows, not an unloaded measurement or Linux CI verdict. No timeout, tick budget, liveness band, checkpoint, pushback threshold or historical assertion changed.

The separate rule-seat history passes checkpoints, operation, unknown-strength and stand-ins. It fought at **Manassas on day 144**, and the bombardment operation fought at Sumter. The checkpoint reports **58,497 known Union men with four unknown blocks**, and **130,862 known Confederate men with 20 unknown blocks**. The Union 95,000 floor is already non-binding in this base and is explicitly reported below its band; S27 introduced no floor waiver. Unknown-strength passes because no unknown-strength block fights, not because every block has known strength.

Hash/replay, resume and liveness pass. The Union reference has 148 daily hashes, zero rejections, and final hash **`c62e0a1a610d59983dd83a48f92130c86ca965344dec7c5c414c47cfe74a7004`**; day-60 resume and saved-log replay match. Testbed's 120-day replay/resume also passes. Summaries and saves are under `runs/s27-done/`; drafting is under `runs/s27-done-drafting/`. These are integration evidence from different drivers, not hidden-state evidence for the five console players.

## Proposed rulings and hand-over

**[I] Proposed for the lead:** preserve reported defects as expected failures with an explicit red mode until fixes are reviewed. Rejected alternatives: skipped tests, unconditional failing assertions, disabling the hook, or fixing production in S27.

**[I] Proposed:** retain the missing 5 March criterion and distinguish console receipt, last printed menus and physical truth. Rejected alternatives: altering initial State, direct kernel orders, using the rule-seat history as a substitute for console play, or counting August as July.

**[I] Proposed:** apply the literal imperative-triad rule to the two substantive labels pending the lead's interpretation. Rejected alternatives: silently exempting them or deleting policy acts to shorten their wording. Any sensitive-copy rewrite remains for its author and gate reviewer; no signature or player copy was changed here.

For the lead:

1. Review this branch whole under 0106. Route B01–B08 to the console/kernel owners, and rule on B09's literal wording interpretation. Prioritize the unreadable notice bodies and valid hold-order refusal.
2. Review the player-path completeness findings: appointments, readable feedback and assessment of Congress. Preserve legitimate resistance rather than forcing a desired battle result.
3. Retain the three timing, five pushback and three lever-sweep problems with their runtime/integration owners. **No D6 clearance or 1A-complete verdict is claimed.**

## Findings outside my scope

Production fixes and calendar reconciliation; simulation calibration; the failed budget, pushback and lever-sweep criteria; the existing non-binding Union strength floor; historical verification of the observed cast/allocation/perspective concerns; gate approval for any later sensitive-copy change; whole-branch review, integration and pushing. These remain with the lead and their existing owners. No other sprint request was undertaken or another lane's files written.
