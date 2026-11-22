# S58: causes and news for the ten B2 situations

Worktree `C:/Pyrrhic/sprint-b2`, branch `sprint/b2`, base `f19b6f0`.
`npm ci` ran first and passed (51 packages, zero vulnerabilities). S58 only;
headless tools, no push or other-lane edits. Review stands down under 0106.

## Plan and validation

1. Add optional elapsed days to existing event/decision predicates, without
   new State, then test boundary days and absence/wrong-choice controls.
2. Read the cited primary pages. Repair the six unsigned live situations,
   each with cause, late-cause and receipt regressions; retire only resolved
   baseline rows. Keep the dated historical checkpoints.
3. Preserve four signed live items and all signatures. Prepare unsigned gated
   replacements and tests; identify every unresolved cause or gate hold.
4. Run the done check once with `--milestone 1a`, unchanged default seeds,
   horizon and drafting. Inventory and diagnose before final documentation.

Before each full hook: typecheck, rules and focused tests must pass. The hook
tests the complete staged tree, expected minutes per coherent step. Stop
expensive retries on unexpected failure, inspect all categories, then verify
any correction cheaply. No timeout, band or assertion changes. The final
done check is expected to take 15-25 minutes; retain failures, never repeat an
unchanged campaign. Use `MANDATE_NO_GIT=1` and two Vitest workers as the
standing command-line runs do. Raw logs and exits: ignored `runs/s58/`.

## Proposed rulings [I]

Elapsed intervals belong to their actual State event or final decision;
reject absolute dates that stand in for a late cause. Event time and receipt
time remain separate. The existing receipt path surfaces notices only after
their reports arrive; no truth-only option disclosure is introduced.

## Current evidence

Step 1 committed `f76327f` through the hook: 207 files, 1,934 tests passed,
three inherited skips; typecheck, rules, boundary, licences and decisions pass.
The elapsed-cause tests failed first, then 36 focused controls passed.

Step 2's 15 new live controls all failed before repair. The first focused
green attempt identified two categories: R69's isolated world omitted the new
application prerequisite; the Pickens test assumed one day's transit although
the actual Navy cabinet-word route takes six. The eight-day trace is retained
in `runs/s58/pickens-trace.json`: receipt notice fires day 32, its in-person
message arrives day 38, then the decision surfaces. Preserve this route and
test actual delivery, including a withheld-message control; do not fit it to
the historical date. S54 separately owns the Navy office's headquarters.

Four Wheeling dates remain 19 June, 20 June, 25 June and 1 July. The new
application is 21 June, from OR I-2 p. 713; Cameron explicitly answers it in
OR I-2 pp. 723-724. The ordinance constitutes the legislature and names 1
July (Ordinances pp. 6-7). Event intervals preserve those spans if a cause is
late. These counterfactual delays are design inferences, not historical dates.

Texas uses the existing refusal correspondence and continued incumbency as
its State prerequisite, retaining three days after that notice. TX-CONV-1861
pp. 113-114 and 183-185 distinguish Houston's earlier refusal to recognize the
Convention from his later nonappearance for the oath. This is a proposed
causal approximation [I]; reject claiming that the earlier letter itself is
the later oath refusal. No governor's personal allegiance is changed.

The first step-2 hook stopped on one retained console replay: its fixed
day-33 Pickens submission precedes receipt. All other 207 files passed;
1,947 tests passed and five skipped because that suite's setup failed.
The original `s35-s29-commands.json` remains untouched. Its replay now defers
only that exact submission until the public menu offers it, reports the
recorded and actual days, and fails if it never becomes available. All other
parser failures still fail. This is a disclosed derived replay, not a claim
that the recorded human submitted on a different day. Verify its three
assertions alone before retrying the hook. No simulation correction, date
forcing or timeout change answers this fixture failure.

The corrected public-menu lookup uses `SituationChoice.situation`; typecheck
caught the initial `.id` typo before any hook retry. The isolated replay now
passes all three assertions (52.45 seconds), retaining its original score and
Manassas requirements and recording only Pickens day 33 to day 39. The three
unsigned treaty replacements pass seven focused controls; their live signed
items remain unchanged. Stage the live repairs and these draft proposals
together for the corrected coherent cause-data commit.

## Findings outside my scope

The four signed B2 items require gate review of any replacement before live
adoption. Their baseline rows cannot honestly be retired while unchanged
live defects remain. Whole-branch and gate review belong to Claude under
0106. Other sprint lanes and their uncommitted work remain untouched.
