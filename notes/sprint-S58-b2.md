# S58: causes and news for the ten B2 situations

**Partial delivery: six live findings retired with tests; three unsigned treaty
replacements ready for gate review; one physical-cause hold.** The four signed
live findings remain in the baseline. Nothing is signed or cleared for main.

Worktree `C:/Pyrrhic/sprint-b2`, branch `sprint/b2`, base `f19b6f0`.
`npm ci` ran first: exit 0, 51 packages, zero vulnerabilities. S58 only,
headless command-line tools. No push, history rewrite, hook bypass or write to
another sprint worktree. Claude owns whole-branch and gate review under 0106.

## Delivered causes

| Finding | Cause and news | Historical firing date / disposition |
|---|---|---|
| `wheeling_ordinance` | Convention must have fired; eight elapsed days [I]. Its own report must arrive. | 19 June retained; baseline retired. |
| `pierpont_elected` | Reorganisation ordinance, then one elapsed day [I]. | 20 June retained; baseline retired. |
| `wheeling_legislature` | The ordinance constitutes it and directs assembly; twelve elapsed days [I]. | 1 July retained; baseline retired. |
| `wheeling_recognition_letter` | New `pierpont_aid_requested` notice, four elapsed days [I], and actual receipt of the application. | 25 June retained; baseline retired. |
| `texas_governor_changed` | Existing refusal correspondence, three elapsed days [I], and Houston still holding the office. Succession remains command-owned. | 16 March retained; baseline retired. |
| `pickens_refused` | Actual landing choice, composite elapsed correspondence interval [I], new Navy receipt notice, then receipt by the principal. | Navy receipt 6 April retained; presidential surfacing/decision moves 6 April to 12 April. Baseline retired. |
| `muscogee_treaty` | Existing public protection-act flag, with no presidential choice dependency; own report controls disclosure. | 10 July retained in unsigned replacement; live baseline retained. |
| `choctaw_treaty` | Same public prerequisite, its own government's act and report. | 12 July retained in unsigned replacement; live baseline retained. |
| `chickasaw_treaty` | Same public prerequisite, its own government's act and report. | 12 July retained in unsigned replacement; live baseline retained. |
| `indian_territory_posts_given_up` | Missing column, supply-seizure and concentration/order producers. The existing call is not Emory's stated physical cause. | Unchanged live hold; baseline retained. |

Every live repair has an absence, boundary or late-cause control. Receipt tests
withhold the report and require it to arrive before disclosure. The civic
chain also tests a convention arriving after all nominal dates: election
cannot precede its ordinance. The treaty draft tests show that each nation's
act neither needs a presidential choice nor waits for the President to read
its report; it changes only that nation's service side, preserving civil
government. Drafts are never loaded into the live pack.

The kernel adds optional `forDays` to existing `fired` and `decided`
conditions. An event interval starts at the actual firing; a decision interval
starts at the actual final decision with the required choice. Existing
conditions without intervals retain their behavior. `knows` intervals still
start at receipt. Whole nonnegative days are schema-checked. There is no new
State field, writer, kernel timing constant or save migration. The published
schema was regenerated; FOUNDATION explains the distinction.

## Sources read and proposed rulings [I]

1. **Keep elapsed cause intervals, with the dated lower bounds.** Reject firing
   on the calendar after a missing cause, or compressing every successor into
   the first late day. These counterfactual intervals are model choices, not
   claims of universal historical deliberation times. Wheeling's convention
   opens in *Journal* p. 3; election and oath are pp. 27-28. The
   *Ordinances* pp. 6-7 authorise the governor and legislature and direct the
   latter to assemble on 1 July.
2. **Cameron's reply needs the application it answers.** OR I-2 p. 713 prints
   Pierpont's application of 21 June; pp. 723-724 print Cameron's reply of 25
   June. The new notice supplies this missing link. Reject election alone as
   sufficient to generate the reply, or answering news the President has not
   received. Recognition still uses its existing received-ordinance and
   received-letter requirements; no recognition choice is forced.
3. **Texas is an explicit causal approximation.** TX-CONV-1861 pp. 113-114
   record Houston's rejection of the Convention's continuing authority and
   its response that it will prepare an ordinance. Pages 183-185 record his
   later nonappearance for the oath and the vacancy proceedings; pp. 186-187
   continue the day's business. The existing refusal correspondence and
   continued incumbency are a bounded State bridge [I]. Reject calling the
   earlier letter the later oath refusal, inferring personal allegiance, or
   removing another incumbent. The actual oath demand/answer remains an
   unmodelled institutional choice for 1B.
   Cave's continuation in OR I-1 p. 612 separately records the refusal to
   recognise Confederate obligations and the Convention's authority; it is
   the existing notice's correspondence, not a newly modelled oath response.
4. **Preserve the dated Navy receipt and follow the real modeled route.** ORN
   I-4 p. 90 prints the Army order of 12 March; pp. 109-111 print Adams's
   refusal of 1 April, Vogdes's enclosure, and Welles's 6 April acknowledgment.
   The 31-day model interval after the opening day-1 decision is a composite
   stand-in [I], not a simulated ship or a general travel duration. A late
   choice shifts it. The trace shows the current Navy cabinet-word message
   sent day 32 and arriving day 38. Reject giving the player the refusal from
   truth alone or shortening the route to fit 6 April. S54 owns the Navy
   office-location defect; its merge may change receipt again.
5. **Disclose the derived console replay.** The source S29 submissions remain
   byte-for-byte intact. Only its exact day-33 Pickens decision may wait for
   the public menu; it is submitted day 39 and reported as an adjustment.
   Other parser errors still fail; an unoffered decision fails at the horizon.
   Reject deleting the source, ignoring the command or claiming a newly
   observed human playthrough. The retained note-score and Manassas assertions
   remain required and pass in the targeted correction check.
6. **Treaties stay unsigned proposals.** CSA-STAT pp. 289-290 and 311-312
   expressly recite the protection act of 21 May as a prior public condition.
   The drafts remove the railroad label while retaining that State condition,
   dated floors, effects, acting governments and own-report receipt. Pages
   301-302 distinguish the Creek signatures and later council ratification.
   Reject routing these acts through either president's choices, the Union
   call or troop withdrawal. Councils are still outside the current model;
   the gate reviewer must decide whether these replacements are sufficient.
7. **Hold the withdrawal notice rather than invent a cause.** Emory's report,
   OR I-1 pp. 648-649, dated 19 May, names seized supplies, provisions only to
   31 May and failed concentration as causes of his anticipatory withdrawal.
   It records joining troops on 3 May and finding Cobb's column away from its
   post on 9 May. The current notice fires on 25 April and treats a call as
   its prerequisite. There are no Emory column/order producers in this pack.
   Reject backdating his 19 May strength to the opening, making the nations
   respond to the call, or manufacturing a flag with no producer. A sourced
   physical column and its actual supplies, orders and departure reports must
   precede a gated live replacement. That acceptance criterion is unmet.
   Townsend's 18 March concentration instruction is at p. 656. His order of
   17 April, p. 667 (scan checked), requires marching on receipt and expressly
   says Arkansas's action does not affect that movement. Emory's 18 April
   letter, p. 668 (scan checked), again gives provisions only to 31 May.
   The bracketed April 16 in the report on p. 648 and the letter headed
   18 April on the road to Washita at p. 668 need reconciliation; neither
   date is silently chosen to fix the live notice. The original chronology
   and troop departure remain held rather than fitted to the 25 April flag.

Source receipts, URLs, pages and hashes are in
`docs/audit/s58-evidence/sources-read.json`. Downloaded primary copies stay
outside all worktrees in `C:/Pyrrhic/mandate-research-sources/S58/`; existing
read-only S1 and r65 originals are identified there. No historical fact is
entered from memory and no gate signature is written.

## Validation and retained failures

The bounded plan was cause/receipt regressions first, cheap typecheck and
rules before each full hook, then exactly one default eight-seed done check
with unchanged horizon, drafting, bands and timeouts. No expensive unchanged
campaign was repeated. A separate bounded 148-day diagnostic recorded event
and receipt dates without a sweep, timing or replay pass; its daily hashes
match all 148 checked hashes from the done check.
Two later wording clarifications describe the composite model interval
explicitly and remove a fixed date from the application's displayed text.
Their metadata changes the World hash; no cause, clock or State hash changes.
Hooks use the standing `MANDATE_NO_GIT=1` mode. The earlier hooks used the
older two-Vitest-worker setting; the final hook uses one worker as the latest
sprint message requests. The two Git-writing fixture files are excluded before
collection as that mode requires; ordinary CI is not certified locally.

The host ended this run at about 17:06 during the final commit hook, before
it produced a verdict. On resume, HEAD still held the two completed commits,
all 14 final paths were staged, and there were no unstaged changes. All 438
measured inputs and 34 inventoried delivery files matched; workspace links
still resolved here. The interrupted log is retained as
`runs/s58/03-commit-interrupted.log`. The owner's resume instruction authorises
one restart of that cut-off hook with one worker. The completed done check
and completed preflight evidence are reused, not repeated.

The interval controls failed first, then 36 focused tests passed. All 15 live
controls failed before repair. The first green attempt exposed R69's omitted
application fixture and an incorrect one-day Navy-route assumption; the
corrected 17 controls pass, reusing eight unaffected R47 checks. The treaty
drafts failed before delivery; all seven focused checks pass afterward.

The first cause-data hook failed only the retained S35 replay's early Pickens
submission: 207 other files / 1,947 tests passed, five skips in total (two
from its failed setup and three inherited). The correction preserved the source and used actual public
availability. Typecheck caught a menu-field typo in the first correction; the
corrected replay passes all three assertions. Inspecting both failures before
the hook retry avoided changing dates, bands, timeouts or runtime behavior to
satisfy that fixture. Raw failure and correction logs remain in `runs/s58/`.

The completed code commits before this final evidence commit are:

```text
244a8b37 Require State causes and received news for B2 situations
f76327f0 Measure situation delays from their actual cause
```

The first hook passed 207 files / 1,934 tests, three inherited skips. The
corrected cause-data hook result is retained in
`docs/audit/s58-evidence/02-commit-corrected.log`. Typecheck, rules, boundary,
licences, decision index and all signatures are checked by the hook. The final
documentation/evidence commit also goes through the actual hook; its exact
hash and result are reported in the single CODEX status.

One `npm run run:done-check -- --milestone 1a --label s58-done` completed:
**exit 1, 2691.60 seconds; Phase 0 5/6,
binding 1A 4/6.** A passed focused check waives none of its failures.

| Criterion | Result | Problems |
|---|---|---|
| behaviour | PASS | No reported problem. |
| hash | PASS | No reported problem. |
| resume | PASS | No reported problem. |
| liveness | PASS | No reported problem. |
| section-ten | PASS | No reported problem. |
| budget | FAIL | union-1861, war by decision, 148 days: median 70.0 ms a day, over the 40 ms budget; union-1861 history run, 148 days to 1861-07-31: median 108.5 ms a day, over the 40 ms budget; union-1861 history run, 148 days to 1861-07-31: p95 248.3 ms a day, over 4 times the budget |
| checkpoints | PASS | No reported problem. |
| operation | PASS | No reported problem. |
| pushback | FAIL | union-1861 history run, 148 days to 1861-07-31: relay holds: 1, below the record's 2; union-1861 history run, 148 days to 1861-07-31: filter holds: 0, below the record's 1; union-1861 history run, 148 days to 1861-07-31: trims: 0, below the record's 1; union-1861 history run, 148 days to 1861-07-31: compliance with reservations: 17, above 9; union-1861 history run, 148 days to 1861-07-31: slow walks: 18, above 9 |
| unknown-strength | PASS | No reported problem. |
| stand-ins | PASS | No reported problem. |
| lever-sweep | FAIL | union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: measured in part: the victory measure does not read people/grievance (policy pushback) (its own choice). Until it does (the people's response through self-emancipation waits for enemy capacity in 1B), no D6 result for this decision counts as evidence (G-1.14c, G-1.14d); union-1861 history run, 148 days to 1861-07-31: fort_monroe_arrivals: chain unexercised: no border governor answered a call inside the horizon of 24 moves weighed (seeds 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868), so the policy's effect through border loyalty on regiments was never seen (G-1.14b) |

Measured local timings, on this shared Windows host, not Linux CI:

- union-1861, war by decision, 148 days: median 70.04 ms, p95 135.98 ms, max 382.19 ms over 148 days
- testbed, 120 days: median 6.54 ms, p95 16.22 ms, max 36.35 ms over 120 days
- union-1861 history run, 148 days to 1861-07-31: median 108.48 ms, p95 248.30 ms, max 425.87 ms over 148 days
- one day of all 23 drafts back to back: median 74.2 ms, p95 95.5 ms, worst 100.0 ms over 20 days; slowest single draft 25.1 ms; a capped day (the pack's 3 slowest drafts for each of 2 sides, together) at worst 55.3 ms

## Hashes, dates and preservation

The Union initial State hash is unchanged. **117 daily
hashes change from day 32,
8 counter rows change, and 0
scored checkpoints change.** The two added correspondence notices add two
situation fires, notices and reports and their deliveries. Courier-delay and
age-pruning rows follow those added messages [I]. Pickens's later receipt
moves that decision's timing. Every changed daily hash and counter is listed
in `comparison.json`; their downstream causation is marked as model inference.

Union final: `73721980e915ae2ea7f01ee5c82d08fbb4f2176e5f203c0153367b3ae1d9d8f8` to
`4fe4b3c2feeb4f96891cf1b9484610c69054c361fdce72a45c7017672df74c36`. Testbed final:
`9480a41da773d3d532d38d8966f526feb7a6ccea608ab39b9d8aa242ae7f10c4`; 0 changed daily hashes and
0 changed counter rows. All 268 checked daily hashes
replay; both mid-run saves, saved logs and resumed finals match. Each checked
run has zero rejected commands. Complete event/surfacing/decision dates are
in `dates.json`, with the source calendar's day 0 on 5 March.

Portable summaries, criteria, diagnostic records, comparison and preservation
receipts are in `docs/audit/s58-evidence/`. Raw logs, source-reading and
diagnostic scripts, exit files and complete saves remain under `runs/s58/`
and `runs/s58-done/`. Inventories and runtime diagnostics preceded this final
hand-over. **438 runtime inputs** stayed unchanged during
the done check; **1906 original tracked paths** remain.
All **29 signed files**, the original human-command
fixture, existing save fixtures, data strengths, bands and other lanes are
preserved. This worktree's CODEX file is unchanged. Only the requested final
append touches the main checkout, after reading it fresh through Python.

## Findings outside my scope

S58 does not clear all ten live findings: three treaty proposals need gate
review and the withdrawal notice still lacks its physical causes. The actual
Texas oath demand/answer remains 1B work beyond the declared bridge. S54 owns
the Navy office location. Every failed done-check criterion above remains
binding with its existing owner; none is retired by these B2 tests. Claude
owns whole-branch review, all proposed rulings, gate review and signatures,
integration, Linux CI, pushing and release. No other sprint request was run.
