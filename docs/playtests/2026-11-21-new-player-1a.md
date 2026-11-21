# S39: a new player's 1A

For the lead: three items. Two fresh human-seat campaigns reached 31 July;
the received desk record now explains more of the player's decisions,
appointments and orders. The required default done check remains red:
Phase 0 **6/6 locally**, binding 1A **4/6**, with seven retained problems.
Six kernel/public-contract gaps remain for their owners. Nothing is signed
off, pushed or changed in another sprint worktree.

## Scope and delivery

Worktree `C:/Pyrrhic/sprint-play`, branch `sprint/play`, starts at
`ddea3384942652660f86f281af24c549b484afc6`. Root `npm ci` ran first, exit 0;
the prototype install also passed. No dependency version changed. Read the
standing, command-line, writing, 0106 and S1–S10 rules before work.

Each merge passed the actual commit hook:

| Delivery | Own commit | Hook evidence |
| --- | --- | --- |
| S33, pinned `9c820e4` | `78280265547269ba64e82cede33ef72f57ad9347` | 173 files, 1,783 passed, nine expected failures, three skips |
| S35, pinned `64e4a6f` | `850ed7f488ee3de6fb6faded35b7a2a287049a9d` | 175 files, 1,808 passed, five skips |
| Received-record desk fixes | `f747c2f9abe5ea67e0b829536a0439a2494192cb` | 175 files, 1,810 passed, three skips |

The S35 merge first failed the protected-read fingerprint guard. The narrow
correction permits the existing exact S35 merge pin to migrate two closure
hashes, preserves all 14 finding identities/read paths, and tests rejection
of other pins, ordinary commits and new identities. No truth exception was
added. Receipt: `runs/s39/merge-fingerprint-receipt.json`; retained red/green
logs are in the same directory. No later `sprint/1a` commit was merged.

The final closeout commit contains this report, its index and handover, plus
four readable response labels and their existing-test assertion. Its actual
identity, clean status and hook receipt are recorded after committing in
`runs/s39/post-commit.json` and `runs/s39/hook-closeout.log`. Independent
whole-branch/gate review remains with Claude under 0106.

## What the two players did

Both games began at the live Union desk on **5 March**. Every move was chosen
from rendered desk text, papers, labels and controls. The prototype's
headless Playwright harness submitted all moves through those controls;
neither code nor State supplied a move policy. There was no inherited S29
or S33 command prefix, save load, Computer Use, desktop control or visible
browser. The harness retained rendered screens, actions, command replies
and public desk snapshots. Own port **5309** was closed afterwards.

| Public record | Early Richmond advance | Raise and train first |
| --- | --- | --- |
| Completed endpoint | 31 July, day 148, request 149 | Same |
| Turn submissions | 44 | 42 |
| Successful UI commands, including end | 86 | 79 |
| Signed submissions, excluding end | 42 | 37 |
| Queue errors / dispatch refusals / page errors | 0 / 0 / 0 | 0 / 0 / 0 |
| Command mix, excluding end | inquire 3, decide 18, order 2, approve 1, call 17, audience 1 | decide 17, order 1, call 17, transfer 1, inquire 1 |

The advance player sent a Richmond goal on the **16 April signing morning**,
received Scott's relay objection, repeated it over the direct wire on
19 April, and approved the received plan on 21 April. Its paper reported
600 men and an axis duration of 24 days from the operation's start; it did
not report that start date. The first Richmond arrival paper was written
16 May and received 19 May; another was written 8 June and received 9 June.

The original player did not open every archived battle paper. A separate
after-play audit of the retained **public received record**, without running
a game, found 12 Stone Richmond battle-phase papers: four each dated 7 June,
13 June and 19 July. Six press battle-result papers, three each dated
11 and 18 June, claim a victory. These are attributed received statements,
not a certification of historical plausibility or private control. A later
read-only presentation check opened an actual Stone paper with its 17:00
hour. There were no Manassas battle papers in this human trajectory.

The training player chose the long-term volunteer call on 15 April, ordered
Stone to hold on 18 April, and signed offered requisitions over the available
attention allowances. A received New York return reported 55,000 present
for duty. On 7 June the player requested 30,000 men for Stone through the
native transfer form and later received Morgan's declared compliance. That
reply is not a manifest or proof that 30,000 arrived. The player chose
wait-and-train on 30 June, sent no advance goal, and received no Richmond or
Manassas field battle papers. Waiting did not establish training progress.

Some harness selectors/pacing timed out during interactive observation.
Those attempts remain in the evidence; the live games were continued rather
than restarted or replayed. One call batch paused after five queued calls
and resumed from that actual queue. No duplicate batch was sent. Two captures
prematurely named for 31 July were renamed `july25-*`; only
`completed-july31-*` proves the endpoint.

## Desk gaps and corrections

| New player's question or failure | Correction and evidence |
| --- | --- |
| Why does the paper date differ from the morning? | Anchor event, map and playback dates to completed `view.day`; preserve next-tick execution and existing request-day eligibility. Records tests and S33's nine regressions. |
| What did I decide? | Own slips retain received situation titles and option labels, including delegate/consult; server stores that public wording. No future authored titles. Records tests. |
| What does a refusal or reply mean? | Resolve pack refusal strings and readable response vocabulary; retain raw non-decision command identity for adapter compatibility. Presentation, records and send-back tests. |
| Why did time stop, and where is the paper? | Deduplicate stop reasons, link received call/support objections, reserve objective-arrival wording for actual arrivals. Records tests. |
| A call has no choice: what now? | Explain an empty decision and expose the native dated requisition route with a due-call badge; preserve war, raising, issued and request-day guards. Records/S33 tests. |
| Who holds this office; whom can I nominate? | Received office roster, known vacancies, source dates and nomination draft from people on file. Native writing form submits it. Candidate-menu eligibility/seniority is not displayed. Paired-menu privacy tests. |
| Can I establish the missing field command? | State that no establishment proposal has been received. Do not invent a command template or auto-appoint McDowell. Records and opening-UI tests; K1 remains. |
| Did signing an order make the army march? | Orders & progress separates own slips from received replies, attributed positions and arrival papers. Records tests and read-only UI checks. |
| When should an operation arrive? | Show only the received relative duration, dated status/source and battle hours; explicitly say when no start date was given. Never infer it from dispatch or approval. Privacy/clock tests. |
| Where is the commander's attitude? | Show the received declared reply and objection, not the private actual response. Received-record tests. |
| What happens on the first morning? | Brief dispatch/next-morning explanation, readable decision summaries and singular regiment wording. Opening and presentation tests. |
| How do I leave a long roster/progress sheet? | Keep its close header visible while the sheet scrolls; verify both viewports and the personnel form at 200% on 1920. Headless red/green layout evidence. |

The records presenter filters unreceived/future-written papers and groups
battle papers by their actual author post even when their subject is a region.
It reads only the public desk snapshot. The corrected UI was checked at
3440×1440 and 1920×1080. Captures are direct PNGs, with recipes and hashes;
there were no pixel edits, generated likenesses or slogans.

## Kernel and public-contract gaps — not fixed here

1. **K1, establishment:** `seats/requests.ts:212–245,273–285` restricts dated
   historical appointments to a rules-driven principal; the other appointment
   view covers `fromDate` rows. Temporary post creation inside the appoint
   verb is not a received establishment catalogue. An authored public proposal
   contract is needed. S36's separate eligibility leak remains with that lane.
2. **K2, advance/train card:** `situations/mcdowell_advance.json:15–58` sets
   flags (`manassas_advance_ordered` / `advance_put_off`); neither choice issues
   a goal, appointment or drill action. Its fixed McDowell-plan wording can
   describe a plan absent from the human desk. Pack/kernel owner must reconcile
   the text and command contract.
3. **K3, operation clock:** `operations/operations.ts:72–86,124–135` holds
   private start/axis clocks. `view/types.ts:38–81` has no received start field;
   arrival reports in `tick/operations.ts:503–524` do not add it. A new authored
   start report is needed to derive a dated ETA honestly.
4. **K4, training:** `forces/forces.ts:37–44`, `forces/enlistment.ts:64–84`
   and `combat/battle.ts:333` supply force condition and combat experience;
   there is no human drill act or received training/readiness progress view.
   The design/kernel owner must define the action and what commanders report.
5. **K5, transfers:** `tick/verbs.ts:242–247,308–331` lets the sender select
   blocks, reassign them and order joins, but the received answer has no
   manifest/join schedule. `seats/posts.ts:72–99` follows the strongest direct
   block for headquarters. York/Gettysburg headquarters while holding is
   consistent with that abstraction [I], not proof that the transfer arrived.
6. **K6, signing and execution:** `console/game.ts:83–91,126–145` dates a
   request morning at requestDay−1 and executes commands on the next tick.
   Dated proposals retain request-day eligibility. The lead should confirm
   the intended wording for a proposal bearing tomorrow's execution date.
   This branch corrects displayed paper dates without retiming eligibility.

Full causes and source references: `runs/s39/kernel-findings.json`. No S39
post-merge change touches `packages/`, `packs/` or `art/`.

## Validation and retained limits

The tracked [evidence index](s39-validation.json) points to raw receipts.
B01–B09 pass all 11 assertions; S33 retains nine passing regressions.
Seventeen new S39 record/privacy tests pass. The first full prototype suite
had 141 passes and one non-decision queue-text compatibility failure. That
failure was corrected and verified cheaply; the final affected selection
passes **29 tests**. Unaffected evidence was reused rather than rerunning
the entire prototype suite for reassurance. Final prototype typecheck/build
pass; the existing large-chunk warning remains.

Headless verification passes two opening/progress tests plus one separately
run received battle-hour check. The progress/battle checks render retained
public snapshots with **zero command POSTs**; they are not a third campaign
or State loaded into a live game. The sticky-close failure was reproduced
cheaply before correction. The required root check passes: **173 files,
1,789 tests passed, three skips**, plus its chained checks.

One default `npm run run:done-check -- --milestone 1a --label s39-new-player`
ran with drafting and all eight seeds: **exit 1, 986.11 seconds**. No limit,
band, seed count or victory definition changed. Phase 0 passes 6/6 locally;
binding 1A passes 4/6. All seven problems remain:

| Criterion | Outstanding result |
| --- | --- |
| Pushback: relay holds | 1; band 2–6 |
| Pushback: filter holds | 0; band 1–9 |
| Pushback: trims | 0; band 1–4 |
| Pushback: compliance with reservations | 16; band 1–9 |
| Pushback: slow walks | 18; band 2–9 |
| D6, Fort Monroe | Victory measure does not read people/grievance; return best in 0/8 is not valid clearance. |
| D6, recruitment chain | No border governor answered within the 24-move horizon in seeds 1861–1868; loyalty-to-regiments chain unexercised. |

Relay objections (2, band 0–6) and plan objections (38, band 10–42) pass.
The history checkpoint scores as passing, but Union known strength is
92,089 with four unknown blocks, below the explicitly nonbinding 95,000
floor; that floor remains unestablished. Confederate known strength is
124,167 with 17 unknown blocks. Default Sumter/Manassas operation checks
pass and no battle has unknown-strength participants. Those automatic
results do not establish the human trajectories' Manassas outcome.

| Local Windows run | Median / p95 / maximum, ms |
| --- | --- |
| Union reference | 30.13 / 50.33 / 62.56 |
| Union history | 22.64 / 39.00 / 55.32 |
| Testbed | 2.45 / 4.44 / 5.27 |

These pass the unchanged 40/160 ms limits locally; they do not certify
Linux CI or the unloaded 20 ms aim. Drafting is sound: 23 posts, 16 with
land force; 20-day median 28.23 ms, p95 32.74, worst 34.91; slowest draft
12.26 and capped-day worst 20.71 ms. Replay/resume/repeat checks pass.
Union final hash `d2e9277f12d7b46dfb8ae48be469f8777f2c6b3f8e4d0f8f32adf091b0d9ee82`
matches S34's recorded final; testbed final is
`69d8759b02cfa93f5fd9840e7a187969861489415a091c1b8da5c3ff0e79c7cb`.
The summaries retain 148 and 120 daily hashes; this is not a comparison of
every prior S34 daily hash.

Final inventories and runtime diagnostics preceded this report. All **834
runtime inputs** and **437 build files / 479,246,096 bytes** stayed identical
across the measured done check. Capture inventory: **41 PNG/recipe pairs**,
zero pixel edits. `art-masters/S39/advance/` and `training/` are original
played UI; `verify/` distinguishes live opening from public-record replay.
`runs/s39/inventory-{before,after}.json`, `final-verdict.json`, raw logs and
`art-masters/S39/capture-inventory.json` retain the evidence locally.

## Proposed rulings and findings outside my scope

Accept the received-record desk corrections and retain the public/private
boundary [I]. Route K1–K6 to the lead and their kernel/pack owners; do not
turn absent received data into an eligibility list, training meter or ETA.
Keep all seven done-check problems open; neither the successful human play
nor passing local timing waives them. Whole-branch review, Linux CI, D6,
calibration, history certification, other sprint lanes and release remain
outside S39. No kernel fix, new truth exception, push or signature was made.
