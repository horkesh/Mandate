# A politician's 1A: S47

For the lead: 5 items. S47 only, `C:/Pyrrhic/sprint-desk`, branch
`sprint/play-politics`, from `23b5d49`. Root npm ci ran first. The requested
map merge and every code step passed the actual hook. No S46/S48 files,
kernel source, pack data, liveness band or scoring rule were changed.

## Play and observations

One continuous human-seat game ran from **5 March to 31 July**: **40 turns,
63 successful UI commands**, including 23 non-end commands. There were **zero
queue errors, dispatch refusals or page errors**. Every policy choice came from
rendered desk text and controls. The observer retained public command receipts;
it did not load State, issue moves through HTTP or derive choices from source.

The consultation correction was applied at 6 March while the server retained
the game. Later desk changes used hot reload; local read marks reset during
reloads, but the game was not restarted. Source tracing of consequences was
performed after those choices. Verification then used separate short live UI
checks and a read-only replay of the completed game's public snapshot, not a
second political playthrough.

Only the prototype's **headless Playwright harness on port 5347** was used.
No Computer Use, desktop control, real browser, owner port, push or history
rewrite. The harness closed its own server; 5347 is closed.

The cabinet was consulted about the forts, blockade and July message. The
player accepted Hicks's request, backed Harney's peace course, respected
Kentucky's neutrality, declined the writ suspension, and sought Congress's
support. Patronage was tried through Cameron's offered advancement promise.
No campaign goal, plan approval, transfer, field appointment or permission to
march was issued manually. The late-June advance card was answered by waiting.

Three March press pages carried no new battle story. Three June pages carried
the reported public reading of who began the war; neither set offered a
political editorial dialogue. At 4 July the ledger showed both chambers sitting
and the spring act before them. At 31 July it showed an answer dated 7 July,
without received answer text. These are observations of this build's desk,
not newly verified historical findings or gate approval.

The dates below are **dispatch dates from this run**, not evidence that the
named physical act occurred. Raw slips and all 40 stop dates are retained in
`runs/s47/own-acts.json` and `turns.json`.

| Dispatch | Own recorded act |
|---|---|
| 1861-03-07 | Ask in writing: Fort Pickens — Secretary of State, Secretary of the Treasury |
| 1861-03-07 | Ask in writing: Fort Sumter's garrison — Secretary of State, Attorney General |
| 1861-03-14 | Fort Pickens: Land Captain Vogdes's company from the ships |
| 1861-03-14 | Some thoughts for the president's consideration: Answer that the policy is the president's to carry out |
| 1861-03-14 | Fort Sumter's garrison: Withdraw the garrison |
| 1861-03-16 | The Confederate commissioners: File a refusal, hold back its delivery, and keep an unofficial channel through Justice Campbell |
| 1861-03-31 | Colonel Lamon's word in Charleston: Answer that the government will not try to supply Fort Sumter without giving the governor notice |
| 1861-04-05 | A Unionist from the Virginia convention: Offer to give up Fort Sumter if the convention adjourns without seceding |
| 1861-04-07 | The Pickens order is not carried out: Send a Navy Department order to land the company, by the usual ship |
| 1861-04-14 | Ask in writing: A blockade or closed ports — Attorney General, Secretary of the Navy, Secretary of State |
| 1861-04-16 | A blockade or closed ports: Proclaim a blockade |
| 1861-04-16 | The call for troops: Call 75,000 militia for three months under the 1795 law, and summon Congress for 4 July |
| 1861-04-20 | The Norfolk navy yard: Move the ships and guns out |
| 1861-04-22 | Washington cut off: Meet the governor's request that no more troops cross Maryland |
| 1861-04-24 | promise cameron_simon advancement |
| 1861-04-27 | The St. Louis arsenal: Back the department commander's course with the state |
| 1861-04-29 | The writ on the military line: Let it take its course |
| 1861-05-15 | Western Virginia: Let it take its course |
| 1861-05-26 | The people at Fort Monroe: Do not give them up: employ them and keep account, their final status reserved |
| 1861-05-26 | Kentucky's neutrality: Send no troops into Kentucky |
| 1861-07-01 | An advance before the three-month men go home: Wait and train the regiments first |
| 1861-07-06 | Ask in writing: Congress meets — Secretary of the Treasury |
| 1861-07-07 | Congress meets: Ask for 400,000 men and $400 million, and defend the spring's acts |

## Desk corrections

| Observed gap | Correction and regression evidence |
|---|---|
| Ask in writing opened an unresolved decision token with a military-post picker. | The decision card now selects only its menu-supplied consultPosts, retains the decision ID, and excludes already queued recipients. Three new regressions failed before correction; live headless dispatch verifies the selected adviser and decision. |
| Promise and pressure take a person, but the editor offered post IDs. | The picker uses only received person identities, without claiming eligibility. Its regression failed before correction. Live drafting passes at 1920 and 200 percent text. |
| Advice rendered recommendation IDs as Not supplied; governors' replies exposed call-answer numbers. | Recommendations use the exact received situation, or a unique label among received decisions when a consult reply names no decision. Ambiguous/future wording is withheld. Direct supplied generic advice is preserved. Declared call responses are separated from counts; zero is not inferred to mean refusal. Reasons retain the author's stated terms, without private weights. |
| Long dockets scrolled their close control off-screen. | The existing sticky-header rule includes the docket. The live baseline failed with viewport ratio 0; its targeted correction passes at 1920 and 3440. |

Advice resolves against the **displayed morning** during playback. The receipt,
future-label and playback controls pass after that final wiring check.
The desk does not invent missing Congress answers, bloc assessments, promise
clocks, consultation eligibility or material policy effects. Manual command
grammar remains available, including verbs on compound help lines.

Implementation: `prototypes/desk/web/App.tsx`, `People.tsx`, `business.ts`,
`strings.ts`, and the docket selector in `business.css`. Regressions:
`s47-politics.test.ts`, `s47-advice.test.ts` and `s47-verify.spec.ts` in the
prototype's test directory. The observer is `s47-play.spec.ts`;
`playwright.s47.config.ts` uses `S47_VERIFY=1` for bounded verification and
`S47_RESULT` for separate retained result folders.

## Kernel-side gaps for the lead

These remain outside S47. Inferences and proposed changes are marked [I].

1. **K47-1: policy flags do not become the named physical acts or constraints.**
   The selected withdrawal in `packs/union-1861/situations/sumter_garrison.json`
   only sets a flag; the run still receives bombardment and surrender. The
   Maryland transit and Kentucky arms/restraint options are similarly flag-only.
   A search under all `packages` and `packs` finds these flags only in their
   three defining situation files (`runs/s47/policy-flag-references.txt`). [I]
   These choices need ordinary orders/constraints and received accounts. Do not
   infer evacuation, protected transit or armed Unionists from a signed slip.
2. **K47-2: the Congress answer marker lacks a distinct received outcome.**
   `situations/special_session.json` makes the president's message choice
   directly propose `ledger-answer`, reason `ratification`. `CongressView` in
   `packages/kernel/src/view/types.ts` supplies an answered day but no answer
   text/result or separate answer source. [I] The lead should distinguish the
   president answering for his acts from Congress answering his request. The
   current marker is not evidence of a legislative vote or assent.
3. **K47-3: political audiences and assessments cannot be discovered.**
   `SeatView`/`PrincipalMenu` provide no received bloc catalogue or political
   support assessment. The address verb exists, but this player has no offered
   bloc target. The press story surface carries battle claims and war-origin
   framing, not cabinet, patronage or legislative commentary (`web/press.ts`;
   `packages/kernel/src/politics/press.ts`). [I] Supply authored public records
   and menu data; do not expose true support or generate editorials in the UI.
4. **K47-4: patronage lacks a received commitment/expiry account.**
   The own ledger proves the Cameron promise was sent. `tick/verbs.ts` writes
   the commitment; `tick/people-week.ts` handles an overdue promise through
   grievance/regard changes. `SeatView` exposes neither the principal's own
   promise terms/due dates nor a corresponding settlement/expiry account. [I]
   Add that public/own-action record before drawing a clock or explaining a
   reaction. No private reaction was inferred here from standing changes.
5. **K47-5: a cabinet office inherits its ship's field headquarters.**
   A received Welles wire places Navy headquarters in Central and Northern
   Pennsylvania. Row 48 of `source/scenarios/march_1861/force_blocks.csv` assigns
   USS Michigan directly to the Navy secretary at `pennsylvania_north`.
   `seats/posts.ts` defines a field post by direct blocks and locates its
   headquarters at its main body; `tick/generate.ts` uses that in periodic
   wires. [I] Institutional offices need their own location/report role. The
   desk should retain the received report rather than silently relocate it.
6. **K47-6: the advance card asserts an unreceived plan.** At 30 June it says a
   McDowell plan is before the cabinet, though this player has not received one.
   This overlaps S39/S48's establishment, order path and wording ownership.
   S47 chose to wait and did not edit those files, clocks or military execution.

The source paths in items 4 and 5 are under `packages/kernel/src` unless a pack
path is named. The scenario CSV is under `packs/union-1861`. Historical citations
inside that data were not independently re-researched in this playtest.

## Checks and preserved evidence

- Root npm ci: exit 0, 51 packages, no vulnerabilities. Prototype npm ci: exit 0,
  66 packages; its unchanged lockfile reports two existing advisories, one low
  and one high. No dependency or lockfile was changed.
- The map merge's ordinary hook passed **208 files / 1,952 tests / three skips**,
  including both Git-fixture suites. Later hooks use the standing
  `MANDATE_NO_GIT=1` setting and reuse that unchanged Git-fixture evidence.
  The latest code hook passed **206 files / 1,931 tests / three skips**;
  typecheck, rules, boundary, licences and 106 decisions pass.
- The prototype suite retained **40 unaffected passing files** and one
  generic-advice failure. That compatibility error was corrected and verified
  with **31 passing affected tests**. The final displayed-view selection and
  typecheck pass. No unchanged full prototype suite was repeated.
- **Four headless checks pass across retained runs:** live consultation,
  patronage/reflow, read-only July advice with zero command posts, and long
  docket scrolling. The original passing consultation result was reused.
  Initial quote-encoding and selector setup errors are retained. The affected
  and unreached UI checks alone were rerun; the docket has its own red/green trace.
- The final prototype typecheck/build pass. Runtime-art URL and chunk-size
  warnings remain; this is the local-server prototype, not a standalone package.
- An initial consultation commit attempt was stopped when its prototype
  branded-ID type error was collected. The corrected typecheck passed before
  the resumed hook. Only that commit's process tree was stopped, and only its
  temporary snapshot was removed through the guarded repository helper.
  No hook was bypassed or history rewritten.

The **one default eight-seed done check with drafting exited 1** (about 23
minutes): **Phase 0 5/6, 1A 4/6**. This is reference-harness evidence, distinct
from the political playthrough. All runtime input hashes stayed unchanged.

| Retained failure | Measurement |
|---|---|
| Phase 0 budget | History median **51.54 ms** against **40 ms**; p95 146.37 ms against 160 ms. Reference median/p95 28.45/54.95 ms; testbed 2.40/4.52 ms. |
| 1A pushback | Relay holds 1 below 2; filter holds 0 below 1; trims 0 below 1; reservations 17 above 9; slow walks 18 above 9. |
| D6 lever sweep | The victory measure does not read people/grievance, and the border recruitment chain is unexercised. The 1/8 return-best count is not D6 clearance. |

The run passes hash/replay/resume (148 Union and 120 testbed daily hashes),
liveness, behaviour, section-ten coverage, checkpoints, a fought operation,
known battle strengths and stand-in checks. The history median failure remains
unmet. This was not an unloaded performance certification: other S47 validation
jobs overlapped portions of the run, and other lanes share the machine. No
cause or regression is inferred from the timing change. No threshold, seed,
band, scoring rule or victory definition was changed, and no expensive retry
was made. Full problems, exits and saved summaries remain in `runs/s47`.

Inventories and runtime diagnostics preceded this report: **1,905 original
tracked paths remain**, all **689 simulation/check input hashes match**, and
**31 capture/recipe pairs** verify their PNG hashes (24 played, seven verification).
The final build contains **430 files / 471,672,137 bytes**. Saved-map mode was
used throughout; no map rebuild was run. Port 5347 is closed and no other server
was stopped. Capture inspection included Kentucky, both Congress dates, the
corrected Chase paper and the corrected scrolled docket.

Evidence locations:

- `art-masters/S47/politics/`: numbered rendered observations and actions,
  command receipts, complete public turn history, and 24 unedited captures.
- `art-masters/S47/verify/`: corrected presentation captures, retained failures,
  traces, result files and the zero-write public replay receipt.
- `runs/s47/`: hook/test/build logs, done-check exit and summaries, own slips,
  turn dates, preservation/build/capture inventory and interrupted-hook cleanup.

The completed public snapshot SHA-256 is `85d75a7c2f83e6f9bc03b64019f9faedb80cc954b71e052af0eea452400ed0f1`.
Code/merge commits before closeout:

```text
411e06e Resolve paper advice against the morning currently displayed
5aef642 Make received political advice readable and keep the docket close control visible
4b9e8b8 Record the headless political playthrough and preserve patronage recipients
3989729 Keep cabinet consultations attached to their received decision
1935005 Merge map fixes for the politician desk playtest
9f74de6 Keep the opening map fitted and region labels near their geography
```

The closeout commit and its actual hook receipt are recorded after commit in
`runs/s47/post-commit.json`. No push, main write or signature.

## Proposed rulings and ownership

[I] Accept the received-menu consultations, received-person patronage picker,
conservative advice labels and sticky docket header. Reject guessed cabinet
eligibility, guessed option-string keys, hidden political scores, invented
Congress answers and UI implementations of kernel policy effects. Ambiguous
recommendation wording stays explicitly unavailable.

For the lead: (1) review the desk under 0106; (2) route K47-1/K47-2 to kernel/pack
owners; (3) route K47-3 through K47-5 to political-view, press and institutional
report owners; (4) keep K47-6 with S48; (5) retain the budget, pushback and D6
failures with their existing owners. These proposals are not signed decisions.

Findings outside my scope: K47-1 through K47-6, unmet 1A/D6 and timing criteria,
S46/S48, whole-branch/cross-model and gate review, Linux CI, integration, pushing
and release. Nothing is signed or cleared.
