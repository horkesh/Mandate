# Lane 1.5: the people's verbs, the audience and attention

Lane 1.5 is FOUNDATION section 12's people-verbs row for Phase 1 (decision 0073). It is on one branch, `phase1-people-verbs`:
- b95e1b0 is the lane's work;
- 80a3a93 merges main, which brings in lanes 1.3 and 1.10.

`npm run check` passes (1113 tests), and so does `npm run run:done-check` (six of six).

Every verb is an order to a person, and he answers it through his compliance with typed reasons, which `proxy` records (key `order|person`). No verb names a place except as part of an order to a person (hard rule 1). `command-kinds.test.ts` holds a test for that.

## What is built

**Verbs** (`log/commands.ts`; `tick/verbs.ts`). `COMMAND_KINDS` gains ten. A verb is accepted only from a principal (`not_a_principal`).

The couriered verbs travel as a `msgVerb`, beside `msgOrder` and `msgReport`, and the transit invariant is now "exactly one of the three". They are answered at arrival (`arriveVerb`):
- **appoint** (an optional rank, checked against the vocabulary). A man who refuses declines the post. An appointment settles a pending promise of advancement (`people.promise_kept`).
- **relieve**, by mode:
  - `quiet_department`, `own_request` and `outright`, each with its own grievance, regard and standing change (pack rules);
  - a relief is always effected;
  - `own_request` becomes `outright` if he will not ask.
- **transfer**: the sending commander picks the blocks by his own answer:
  - `strongest_first` if he complies;
  - `weakest_first` if he drags his feet;
  - half the amount if he reinterprets;
  - nothing if he objects or refuses, and his memorandum says why.

  This replaces the weakest-first stand-in (`command.ts`, `TransferPick`).
- **inquire**: a report of his position and his belief about a region. Past the week's free inquiries he holds a `pestered` grievance (patience, 0040).
- **consult**: each holder of the named posts writes his recommendation (`advice` of subtype `requested`), and it becomes a stance on record (`personStances`, recorded only). The route is fixed to courier.
- **observer**:
  - a man is posted at a headquarters (`observerPostings`, owned by `command`), and the watched man holds a `monitored` grievance;
  - letters come every `letterEveryDays`;
  - the oversight he adds is its own typed term, `{ kind: 'watched', source, amount }`, on top of the `context.oversight` stand-in, which it never overwrites (the lead's condition, tested).

These act at once, in Washington (`verbs.in_washington`):
- **promise**: clears `passed_over`, falls due after `dueDays`, and breaks into a `promise_broken` grievance and lost regard;
- **pressure**: a `pressured` grievance, which also adds a typed oversight term for `pressure.days`;
- **address**: only emits a `{proposal: 'address'}` for politics.

**The audience** (`audience/audience.ts`, owned by `audience`; the counters are in the import-free `audience/counters.ts`, which keeps the view boundary). It is M2's audience recast for plans:
- **before**: about a goal not yet sent, in the preview only;
- **during**: about an approved plan.

The counters are M2's eight, each answering only its kinds of reason:
- an uncandid man hides his reasons;
- a frame may name only his own values that are not cost-only;
- a threat answers nothing and leaves a grievance;
- a promised reinforcement is itself a transfer order to the other holder, who answers it by his own compliance.

`previewAudience` is pure. Holding an audience applies the counters through their owners (`people`, `command`) and records it (`audienceHeld`); it cools down for 7 days and costs attention. **M2's nine audience cases are moved onto the new State one for one**, in `people-verbs.test.ts`, "M2's audience cases".

**Attention** (`seats/attention.ts`, `seatAttention`, owned by `seats`; prices in `tick/attention.ts`):
- the pack's cost table prices it: approving as drafted and sending back are free, an edit is 1, inquire is 0, consult is 1, and a special messenger's price is added on top;
- it refills to the cap every `refillDays`, with no carry-over;
- a command is paid only if it is not rejected, and one it cannot pay is refused (`no_attention`).

**The weekly people step** (`tick/people-week.ts`, phase 4d):
- grievances fade;
- due promises break;
- the ladder moves one rung a week (`ladder/ladder.ts`, `personRungs`). Each rung above loyal costs disposition;
- a man on lobbying or above with enough standing becomes a rival (`personRivals`);
- seat initiatives fire through `resolveDirective` and reach the principal as a memorandum (`seatInitiatives`, owned by `seats`, with a cooldown). The testbed's case is `write_to_the_press`.

**From the reviews.**
- `costOnly` on pack values: honouring one adds nothing and gives no reason, and offending one still costs. A kernel test runs over every cost-only value of the Union pack and checks that no term is positive.
- The order-to-value map is pack data (`rules.people.verbs.orderValues`):
  - `goal:`, `verb:` and `policy:` rows, each with `gateTopics` and `notCheaperThan`;
  - `pushbackOf` counts every person on the side who holds an offended value, plus the recipient's unwillingness, and floors a row at the row it names;
  - an administrative verb's row has `boldness: null`, so temperament has no bearing on it.
- `regard_others`, a person-table column (`toward:direction:cite;...`), validated and cited. Regard toward anyone else stays `regardUnknown`.
- `applyPeopleChanges` checks a rank against the vocabulary and its kind (`rank "x" is a K rank, not K2`). Lane 1.3's calls now pass the vocabulary too.

**Rules.**
- Every new State field has an `OWNED_FIELDS` row: personPromises, personInquiries, seatAttention, seatInitiatives, personRungs, personRivals, audienceHeld and observerPostings.
- There is no Map or Set in State.
- Every default is a pack rule (`rules.people.attention`, `rules.people.verbs`), checked by `verbRulesProblems` in the kernel and the validator alike.

**The liveness gate.** Re-banded in both full runs:
- ladder moves, rivals, grievances fading, attention spent and refilled, and initiatives all fire in a reference run;
- the verbs, promises, observer letters and refused attention are in `QUIET`, because no rule seat uses the verbs yet. Each names the test that drives it, and those tests now count their mechanic.

## Not done, or done as a stand-in

1. **The Union fugitive-policy rows are not authored.** The mechanism is built and tested: the `fugitive-policy` gate topic, the `notCheaperThan` floor (`return` never cheaper than `approve-holding`), and pushback over every side member. The rows themselves are 1.11's data and need the gate reviewer's sign-off. Both packs carry only the six `verb:` rows.
2. **The practice-clash term is not modelled.** There is no data for it.
3. **The audience reads the chosen plan's terms during a plan** (the lead's ruling on review item 7; `tick/audience-plan.ts`). They are built as lane 1.2's `editDirective` builds them, with no edit:
   - boldness from his own best;
   - `required` from the candidate's men needed against what it commits;
   - support from its requests.

   What he holds reads as 500 on `editDirective`'s scale (`PLAN_HOLDS`). A promised reinforcement adds its men on that scale, at the principal's credibility. So M2's case 7 is now ported whole: the stated shortfall shrinks as far as the promise is believed.

   Before a plan, the audience stays on the goal's terms, which carry no `required`. Goals are not given one, because the force-ratio number has one owner, the planner.
4. **Stance reversal pricing waits for 1B.** Stances are recorded only, as approved.
5. **Freelancing is not ported**, as approved.
6. **Consult goes by courier only.**
7. **The ladder reads regard as well as grievances.** Discontent is the grievance load minus half the regard. In the testbed run, men cool toward their leader climb to lobbying with no grievance at all, and one becomes a rival. That follows from the formula, and the thresholds are design parameters, not calibrated.
8. **No rule seat uses a verb.** The rule seats need a policy (when to inquire, relieve or consult) before the verbs can fire in a reference run.

## Files

- New:
  - `people/verb-rules.ts`, `seats/attention.ts`, `ladder/ladder.ts`, `command/observers.ts`;
  - `audience/audience.ts` and `audience/counters.ts`;
  - `tick/verbs.ts`, `tick/people-week.ts`, `tick/attention.ts`;
  - `test/people-verbs.test.ts` (26 tests).
- Changed, beside the State plumbing:
  - `reading/orders.ts` (`extraContext`, `orderTerms`, `pushbackOf`);
  - `directive.ts` and `compliance.ts` (`costOnly`, oversight terms, the `watched` reason);
  - `messages/transit.ts`;
  - the pack format (schemas, the `regard_others` column, validation);
  - both packs' `pack.json` (attention and verbs; the Union pack's six 0074 values, two of them cost-only).

## R92: initiative admission and the filter office (20 November 2026)

For the lead: 2 items. R92 only, in `C:/Pyrrhic/mandate-initiative`, branch `phase1-initiative-threshold`, HEAD `3cbf71e6a04ac93c9393b73c7cf8585287069ecf`. Read the main checkout's CODEX standing, command-line, writing and R44–R49 rules, R92, and decision 0105. `npm ci` ran first, exit 0, zero vulnerabilities. Git was read-only. Claude's independent review remains pending under 0096.

### What changed

- `WorldRules.people.verbs.initiativeAt` is required by the TypeScript type, raw-World validation and pack schema. Both packs state **150**, the former admission value. It is a whole willingness threshold, not a permille weight; there is no kernel fallback.
- The weekly step shares compliance's willingness terms and candour machinery, substitutes the initiative threshold for its stated answer, and admits by willingness against `initiativeAt`. The independent admission check also prevents an ordinary `exceed` threshold bypassing a higher initiative threshold. Ordinary orders retain their existing rules and code path.
- Two new kernel cases cover separation in both directions and invalid/missing thresholds. They first failed for the intended missing behavior (`runs/r92/red.log`: 2 failed, 29 passed), then passed. Two pack-validator cases reject a missing or fractional threshold. The fixtures state the new rule.
- Regenerated the published schemas and both Worlds with their tools, and the day-40 save with `tools/make-save-fixture.ts`. The semantic audit finds only the added rule in each manifest/World and only `worldHash` changed in the save. Its State and command log are identical. No new State field or owner. FOUNDATION's initiative paragraph now names the separate threshold.

### One measured comparison, without retaining the lower value

Seed **1861**, normal peace-to-war start, **148 days** through 31 July, no `--at-war`. Change only ordinary **`complyAt` 150 → 10**, leaving **`initiativeAt` 150**. Initiatives remain **9 → 9**; all nine event days, people, posts and contribution terms are identical. Reservations become **44 → 4**, against the unchanged **1..9** band. The lowered value is not delivered: both temporarily edited files were restored byte-for-byte (`comparison-restore.json`). This is evidence for separation, not calibration acceptance or a second-budget tuning campaign.

`runs/r92/comparison.json` records every scored checkpoint/pushback result before and after. Its control was captured before the split; the full checked default run subsequently proves the split at 150 preserves **all 148 daily State hashes, every daily telemetry row and every liveness count**, making it the same control after the split. See `default-control.json`. Union final State is **`59ae6644ff381b02e8086ca57be88ec5f828979eeaaaed37cbcb6ebbdee7b097`**; replay and day-60 resume match, zero rejections. Testbed's 120-day replay and day-40 resume match too.

The small evidence adapter's initial one-day startup failed because it passed the wrong argument to `operationScore`; corrected before the baseline campaign. Its initial score also omitted the declared-mechanic set. Rescored the retained daily telemetry with the actual declarations, without repeating either comparison run (`startup.log`, `startup-fixed.log`, `rescore.ts`, `rescore.log`). Production checks use the unchanged official scorer.

### Sourced filter finding

Leave the wire-filter role unfilled for **5 March–31 July**. Hay's account assigns letters to himself and visitors/general supervision to Nicolay: Herndon and Weik, *Abraham Lincoln: The True Story of a Great Life*, vol. II, **pp. 225–226**, [read OCR](https://archive.org/stream/abrahamlincolntr02hernuoft/abrahamlincolntr02hernuoft_djvu.txt). It describes the administration generally, not a dated March handover or military-wire control.

Bates, *Lincoln in the Telegraph Office* (1907), **pp. 25–29**, names Strouse as first superintendent (official appointment 15 May, **p. 27 note 2**) but does not attribute screening Lincoln's wires to him. The named withholding case is **Eckert on 21 October 1861**, under Cameron's instructions to deliver military telegrams first to McClellan, **pp. 93–96**. Stanton's centralized supervision is later, **pp. 38–40**. [Read OCR](https://archive.org/stream/lincolnintelegra00bates/lincolnintelegra00bates_djvu.txt). These are retrospective accounts; no contemporary appointment order was newly verified. Technical management, White House mail sorting and the later headquarters case cannot establish a general presidential wire-filter holder in this run's window [I]. This is an evidence limit, not a finding that no screening occurred.

The detailed dated finding and retained extract paths are in the **R92 section of `docs/research/2026-11-14-union-information-flows.md`**. No holder, person, post kind, value, trait or situation was added or relabelled; Nicolay's existing role remains null. Proposed ruling: retain that distinction and the empty wire role; reject filling it from mail/caller work or an undated technical title merely to pass a band.

### Settled checks and bands

- Exact **`MANDATE_NO_GIT=1 npm run check`: exit 0**, **129 files / 1,475 passed / 3 existing optional timing skips**; all chained gates pass. Focused checks: **5 files / 314 passed**, exit 0. Separate typecheck, schema generation, pack generation and save-fixture generation exited 0.
- Full **`npm run run:done-check -- --label r92-done --milestone 1a`**, with drafting and all **eight seeds**: **exit 1**, **1,538.52 seconds**, run once. **Phase 0 5/6**, with only timing failed; **1A 2/6**, unknown strength and stand-ins pass. Every other criterion and each problem was inspected in `runs/r92/done-check.log`.
- Timing remains unmet: Union reference median/p95 **40.65/66.87 ms**, history **41.17/65.88**, against unchanged **40/160**. Testbed **3.87/5.83**. No unloaded-host, CI, causal-regression or performance-pass claim. No expensive retry.
- **No default band count changes.** Pushback: relay objections **2** (0..6), relay holds **1** (2..6), filter holds **0** (1..9), trims **0** (1..4), reservations **44** (1..9), slow walks **5** (2..9), plan objections **11** (10..42). Initiatives **9**, inside the unchanged liveness band. The temporary comparison changes only reservations among those seven scores.
- Checkpoints still fail Missouri's neutral side, the missing western-Virginia checkpoint department, Confederate known men **20,957** (100,000..200,000), and both sides' **zero** fought planned operations. Union known men **18,686**, four unknown blocks, remain below its non-binding 95,000 floor (250,000 ceiling); Confederate unknown blocks **13**. The history observer sees **2 operations / 0 BattleRecords**. Bombardment telemetry is not a fought-operation record. The other checkpoint results are unchanged; no checkpoint or liveness file was edited.
- Sweep: **8 seeds / 8 decisions / 248 base-run calls**, `return` best **0/8**. It still fails because policy grievances are unmeasured and **24 moves** lack a border-governor levy. D6 clearance stays parked under 0105; its recruitment-chain failure stays reported. No band or criterion is waived.

Runtime diagnostics, semantic data/save audit and the 16-file delivery inventory preceded this hand-over. The done-check process exited; no server or browser was started. Evidence index: `runs/r92/final-checks.json`; full summaries and saves: `runs/r92-done/`, drafting: `runs/r92-done-drafting/`. Other worktrees, signed situations, provenance, bands and lockfiles were not changed. The lower compliance value is restored; no staging, commit, merge or push.

### For the lead

1. Review R92's required rule/schema change and sourced empty-filter finding under 0096, then integrate before the second calibration budget. Third-party packs will also need to state `initiativeAt`; there is deliberately no implicit default.
2. Retain the failed timing gate and four 1A categories with their current owners. R92 supplies threshold separation; it does not accept `complyAt: 10`, invent a filtering holder, integrate R85's corrections, or undertake R90/R91/R93/R94.

## Findings outside my scope

- The older people-and-posts note's unverified suggestion that Eckert came to Washington in 1862 is too late for Bates's dated September/October 1861 account, pp. 93–96. The R92 information-flows section records the correction and its limits; it still supplies no March–July filtering appointment.
- The full timing failure remains an unmet acceptance criterion. No performance correction or new measurement campaign was authorized or attempted here. The unchanged behavior evidence does not determine its cause.
