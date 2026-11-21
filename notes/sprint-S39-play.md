# S39: a new player's 1A

For the lead: work in progress on `sprint/play`, from `ddea338`.

Merged S33 as `7828026` and S35 as `850ed7f`, both through the actual hook.
The S35 integration migrated only two identical protected-read closures;
the exact-pin controls and receipt are in `runs/s39/`. No unresolved finding
was removed and no read-path identity added. B01–B09: 11 passing assertions;
S33: nine passing regressions. Final merge hook: 175 files, 1,808 passing,
five skips, no expected failures. Initial guard failure retained.

Early-advance observation complete through 31 July, headless exit 0, zero
page errors. Fresh goal on 16 April, received relay objection, direct repeat
on 19 April, review approval on 21 April. Received Richmond arrival on
19 May; no claim that this establishes a battle, historical plausibility or
control. Capture names incorrectly anticipating a July 31 endpoint were
renamed to July 25; actual completed captures are explicitly named
`completed-july31-*`. Training also completed 31 July, headless exit 0,
zero page errors. It chose the long-term volunteer call, held Stone, signed
the offered requisitions over two allowances, requested 30,000 men from New
York on its received return, received Morgan's declared compliance, and
chose wait-and-train on 30 June. No operational advance was sent.

Desk corrections underway: completed-day calendar anchor (including map and
playback); received decision labels retained on own slips; typed refusal
wording; precise stop links; empty-decision explanation; received office
roster/nomination context; received progress and relative plan clocks; call
badge and singular regiment copy; first-morning dispatch explanation.
New records tests fail before implementation and pass after correction.
S33's synthetic date fixture now declares completed day 3 / request day 4
consistently with S35; its nine behavioral assertions are retained.

Scope: merge the pinned S33/S35 deliveries; play two human-seat campaigns
through July using rendered desk information; fix desk gaps with tests; list
kernel gaps without changing them. Only the prototype headless Playwright
harness may drive play. Own port 5309, closed at completion. No push.

Validation: root and prototype npm ci first; each merge through the hook;
B01–B09 and the nine S33 regressions; startup/map/selectors before campaigns;
test-first desk fixes; focused correction checks; final prototype suite,
typecheck/build, required root check and one standing done check. Expected
cost: several minutes per full hook and roughly 20–25 minutes for the one
done check, plus observed play. Stop costly retries after a failure and
diagnose retained evidence. No calibration, changed bands or extra campaign.

Decisions during play come only from rendered text, labels, papers and
controls. The harness records that evidence and separate public responses
for later diagnosis; no source-derived move policy or inherited play script.

Findings outside my scope: whole-branch/gate review remains with Claude under
0106. S37, S36 and every other sprint lane remain separate.
