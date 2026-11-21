# S35: defects found in play

For the lead: three items. **B01–B08 are corrected; B09 is an ordinary test
of the writing screen under the lead's ruling. The note/edit correction
passes the recorded S29 sequence. Its battle begins 30 July, with four
hour-stamped dispatches received by 31 July.**

S35 only in `C:/Pyrrhic/sprint-fixes-play`, branch `sprint/fixes-play`, from
`78eb7db`. Root `npm ci` ran first and exited 0. Playtest was merged first,
without conflicts. S27's full report and S33's report and hand-over were
read; `origin/sprint/desk` at `9c820e4` was read-only. No S36 work, other
worktree write, push, history rewrite, signature or browser/desktop use.

## Changes and ordinary regressions

| Item | Correction and evidence |
|---|---|
| B06, prioritized | A received report matching a notice's subject, type and subtype carries the authored body key. Turn playback and inbox rendering resolve that key through the pack's strings. The kernel receipt test proves the body is absent before delivery; the S27 command-only test reads the resignation notice. No open decision or undelivered paper is needed. |
| B02, prioritized | Optional hold flags are excluded from objective words. Known objectives still survive; an unknown objective remains for the kernel to refuse. Nine flag combinations, the explicit unknown case and S27's bypass path pass. |
| B01 | `dateOfRequest` maps a request boundary to the calendar day before its next numbered tick. The first actionable morning is 5 March. `dateOf`, State, tick/request numbers, event dates and report stamps retain their mapping. Console and adapter use the same request mapping. |
| B03–B05 | The shared queue/cancel/sent summary retains concentration days (including zero), review route and chain/bypass choice, and frame/adjust/reinforcement counter arguments. |
| B07 | Every typed refusal has string-table wording. The typed reason remains in the refusal record; console output resolves a key. The compile-checked reason roster covers all 32 reasons, with a separate general fallback. |
| B08 | One-day plan, preview, goal and call durations use the singular unit. |
| B09 | The actual writing screen flags `Hold. Press. Prevail.` and permits the actual `hold_and_talk` and `approve_holding` labels. The audit uses that same screen. Existing S27 prose/evidence remains a historical record; the later ruling supersedes its literal-triad interpretation. No existing player string changes. |

All eight S27 defect assertions were first run as ordinary tests and failed
for their recorded reasons. B02/B06 then passed first. Existing date and
summary assertions were updated to the corrected contract. A supplemental
test incorrectly expected a June notice during an April fixture; its receipt
assertions were moved to the existing kernel notice fixture. The failing
evidence is retained, and the targeted correction passes. The first staged
whitespace check found an extra trailing blank line in the new CLI test;
the final change removes it. No failed assertion, timeout or numerical
criterion was weakened.

## The note/edit defect and S29's recorded human sequence

Drafting and answering edits now obtain identical delivered marks and fixed
compliance readings. Both candidates use `scoreNotes`; the pack's weights
are unchanged. An edit that follows a mark retains its contribution; a
timing edit that actually removes a requested wait still loses it. Notes
are retained. There is no new State field or score exposed to the player.

The fixture in `s35-s29-commands.json` preserves the original successful UI
submissions and records the source SHA-256. `s35-replay.ts` answers public
human requests with those commands, honoring recalls and ignoring read-only
previews. Its dated-call convenience expands only calls offered by the
public menu. Other seats use the normal rule policy. It does not inject
State into a desk or claim a newly observed human UI playthrough.

The newer requested base matters: S33 measured a 300-point note and actual
slow walking at its older pin. On `78eb7db`, before S35, this same human
sequence has a **600-point** contribution, which is dropped by the edit.
The commander actually **reinterprets**, declares comply, and already
fights on 28–29 July. That prior battle cannot be attributed to this fix.

| Day-140 fact | Before correction | After correction |
|---|---:|---:|
| Redraft score / note contribution | 1,372 / 600 | 1,372 / 600 |
| Edit departure | 600 | 0 |
| Dropped note term | 600 | None |
| Actual / declared response | reinterpret / comply | comply / comply |
| Executed plan score | 1,313 (own alternative) | 1,372 (edited plan) |
| Battle starts | day 145, 28 July | day 147, 30 July |

The corrected plan retains its depot preparation. It is still fighting on
day 148, 31 July; no end date is claimed. Four dispatches written on 30 July
reach the player on 31 July. Zero replay refusals. These are game dates, not
historical-date certification. The counterfactual changes the human path's
State hash, as expected; the default reference/history hashes do not move.

The fictional regression also checks replay and save/resume after a noted
edit. Existing private-note hiding tests continue to pass.

## Calendar, bands and preservation

All **148 history** and **120 testbed** daily hashes match the retained
pre-correction baseline, together with initial/World hashes, dated checkpoint
scores, daily activity and liveness. No event date changes and no moved
reference hash needs an exemption. Final history hash:
`0cfa53c7505b94a60d454e824f2a8fa0c4ade794005e60b8391666e71944a52b`.
Testbed: `69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`.

**No band definition moved, and no reference liveness count moved.** No
checkpoint, source default, policy weight, signature or gate placement was
changed. All 169 protected art, generated-data, source, situation, checkpoint
and hook paths match the base. All 593 existing English string values are
preserved; each pack adds 33 refusal keys. Workspace package links resolve
to this worktree. The implementation inventory and raw-log hashes are in
`s35-validation.json`; runtime diagnostics and that inventory were settled
before this final report. No shipping package was built or claimed.

## Advance flag: listed only

`packs/union-1861/situations/mcdowell_advance.json:29–30` sets
`manassas_advance_ordered`; it supplies no `orders` entry. The rule principal
separately sends dated offensive goals in
`packages/rule-seats/src/index.ts:174–182`.

**[I] Neither 0100 nor 0104 establishes a general requirement that this July
option issue a goal.** [0100, item 16](../decisions/0100-sourced-situations-absent-staff-advice-and-declared-governments.md) (lines 60–62) requires a represented
cause before a notice, and explicitly says it does not invent missing
institutional choices. [0104, item 2](../decisions/0104-the-opening-of-the-war-follows-its-causes-and-its-news.md) (line 16) specifically retires the
Sumter doctrine row because `reduce_sumter` sends its goal; item 6 (line 20)
delivers zero-day situation orders when they exist. That establishes the
Sumter behavior and delivery mechanism, not a July advance ruling. Keep
the mismatch listed for the lead to decide between an explicit lawful goal
and clarification of the separate act. S35 changes neither the flag nor
that situation's effects.

## Validation and required campaign

| Check | Result |
|---|---|
| npm ci | Exit 0; 51 packages added, 56 audited, no vulnerabilities. |
| Merge hook, d55ab43 | Exit 0; 155 files, 1,671 passed, nine expected failures, three existing skips; all chained gates. |
| Console hook, 206a516 | Exit 0; 156 files, 1,693 passed, three existing skips; no expected failures; all chained gates. |
| Console correction / existing session suite | Exit 0; 58 focused tests plus eight console-session tests. |
| Note correction | Exit 0; 18 focused tests, including both note outcomes, the S29 sequence, replay/save and private-term hiding. |
| Required MANDATE_NO_GIT=1 npm run check | Exit 0; 155 files, 1,679 passed, three existing skips; type, boundary, licence and 106-decision checks pass. |
| Single default done check with --milestone 1a and drafting | Exit 1; 1,411.66 s; Phase 0 5/6, 1A 4/6. All twelve criteria and nine problems retained. |
| Final code/report commit | Runs the actual configured hook; final receipt is runs/s35/final-hook.log and the coordination status. No bypass or push. |

All nine campaign problems remain:

1. Reference median **49.53 ms** exceeds **40 ms**.
2. History median **50.15 ms** exceeds **40 ms**.
3. Relay holds **1**, below **2–6**.
4. Filter holds **0**, below **1–9**.
5. Trims **0**, below **1–4**.
6. Compliance with reservations **16**, above **1–9**.
7. Slow walks **15**, above **2–9**.
8. The Fort Monroe victory measure does not read people/grievance; no valid
   D6 evidence for that channel.
9. No border governor answers a call in the sweep's **24 moves**, seeds
   **1861–1868**; the border-loyalty-to-regiments chain remains unexercised.

Reference/history p95 **73.28/73.32 ms** remains below the unchanged
**160 ms** ceiling. Testbed median/p95 **3.90/5.05 ms**. Shared Windows host,
not Linux CI or an unloaded measurement. Drafting median/p95 **43.0/49.4 ms**,
slowest single draft **8.1 ms**, capped worst **28.0 ms**; these do not waive
the budget failures.

The other pushback measurements are relay objections **2 (0–6)** and plan
objections **36 (10–42)**. All seven measured pushback bands are listed above
or here; none was changed. The default reference State and activity are
identical to the pre-fix baseline. Differences from S33's older published
counts are not claimed as S35 effects.

The campaign weighs **eight seeds/eight gated decisions**, with **744 base
calls**. Watched return is best in **0/8**, but the two channel failures still
prevent D6 clearance. Checkpoints pass with **99,791 known Union men/four
unknown blocks** and **124,218 Confederate men/17 unknown blocks**. Both
planned-operation requirements pass, including the reference's Manassas
battle starting day **144**. No unknown-strength block fights.

Runtime diagnostics, preservation and the 31-file implementation inventory
preceded this final report. Raw evidence is in this worktree's ignored
**runs/s35/**, **runs/s35-fixes-play/** and **runs/s35-fixes-play-drafting/**;
the latter two retain summaries, saves and drafting data in timestamped
subfolders. The first evidence-summary parser assumed UTF-8 for PowerShell's
UTF-16 logs; its retained failure was corrected by decoding the BOM. The
same completed campaign then supplied all twelve criteria; no campaign or
production check was rerun for that reporting correction.

## Proposed rulings and hand-over

1. Keep the request-boundary mapping and received-notice body projection.
   Reject moving the simulation clock, exposing undelivered prose or
   requiring a closed notice to reappear as a decision.
2. Keep identical delivered-note scoring bases and legitimate note losses.
   Reject deleting notes, fitting weights/bands to a battle date, revealing
   private responses, or attributing the older base's different behavior to
   this correction.
3. Apply the lead's B09 ruling without changing policy copy. List the
   advance-flag ambiguity for a separate ruling; reject silently treating
   its flag as an order or generalizing the Sumter-specific decision.

For the lead:

1. Review the branch whole under 0106; integrate through S34 after review.
2. Rule separately on the advance situation's flag/goal meaning.
3. Retain every runtime acceptance failure and its existing owner. No D6 or
   1A-complete verdict is claimed.

Findings outside my scope: the unchanged advance-flag/goal mismatch; S36;
timing, pushback and sweep acceptance; human appointment/public-operation
clock gaps previously listed by S33; Linux CI, standing/gate review,
integration and pushing. No other sprint lane was changed.
