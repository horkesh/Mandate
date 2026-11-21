# Canon against code, S26 — 21 November 2026

Report only. This audit changes no canon or production code, makes no ruling and grants no gate clearance.

## Scope and interpretation

Audited checkout: `C:/Pyrrhic/sprint-audit`, branch `sprint/audit`, at **8f9fddc30e78383fd73a1919a0c56ecc12274f19**. Main at the start: **1893432a8af85d2c6df5b0f6ed7ae92febc24b9a**. Their only tree difference was `CODEX.md`; the cited implementation and canon were identical. Other sprint branches were neither imported nor audited.

Read decisions 0015–0106: **91 accepted records**, with 0017 superseded by 0027 and excluded as an active contract. Read VISION and FOUNDATION, especially section 10. Later rulings take precedence; [VISION explicitly ranks accepted decisions above its pitch](../VISION.md#L3). `s26-evidence/decision-coverage.json` records every decision, its hash, representative implementation anchor and finding disposition. Repository files are the evidence for this software audit; historical quotations inside accepted records were not independently re-researched here.

The report separates **11 current contract findings (A01–A11)**, **eight outstanding delivery/check requirements (M01–M08)**, **three section-10 discrepancies (O01–O03)**, and **16 deferred capability groups (D01–D16)**. Deferred capabilities answer S26's request for what canon promises but code does not do. They are not presented as regressions or unapproved scope cuts.

Severity: **High** breaks the knowledge boundary or an agreed milestone criterion; **Medium** is missing accepted behavior, a reusable API defect, or an enforcement gap; **Low** is documentation drift or unfinished optional/presentation work. For deferred rows, severity describes readiness impact when their phase arrives. A group can cite several manifestations of one contract failure.

Static tracing covered State writers and contract-relevant callers, menus, reports, planning, command paths, schemas, shell and tests. Nine bounded probes hold relevant reports or other inputs fixed. These demonstrate specific contradictions. A green architecture scan is not proof of semantic information isolation; this report does not claim exhaustive path coverage of every possible playthrough.

## Current contract findings

### A01. The principal receives live troop totals — High

**Canon:** [docs/decisions/0015-seats.md:14](../decisions/0015-seats.md#L14); [docs/design/FOUNDATION.md:23](../design/FOUNDATION.md#L23); [docs/VISION.md:26](../VISION.md#L26).

**Code:** [packages/kernel/src/seats/requests.ts:168](../../packages/kernel/src/seats/requests.ts#L168); [packages/kernel/src/seats/api.ts:99](../../packages/kernel/src/seats/api.ts#L99).

The principal menu sums current `fbStrength`, treating unknown blocks as zero. It supplies neither author nor report date. Changing a fixture block from **2,000 to 1,234** changes `commandable.men` with the exact same knowledge object. This crosses to human and rule requests even when a renderer does not print it. An unknown block is indistinguishable here from a known zero. This is separate from a commander knowing his own forces for planning.

Evidence: `s26-evidence/probes.json` → `men`; request handoff at [packages/kernel/src/seats/requests.ts:311](../../packages/kernel/src/seats/requests.ts#L311).

### A02. Appointment candidates disclose unreceived service and status — High

**Canon:** [docs/decisions/0015-seats.md:16](../decisions/0015-seats.md#L16); [docs/decisions/0101-an-officers-resignation-service-side-and-reported-choice.md:35](../decisions/0101-an-officers-resignation-service-side-and-reported-choice.md#L35).

**Code:** [packages/kernel/src/seats/requests.ts:185](../../packages/kernel/src/seats/requests.ts#L185); [packages/kernel/src/command/command.ts:250](../../packages/kernel/src/command/command.ts#L250).

Candidates are filtered by live service side, post and serving status, then sorted using live ranks. Death, resignation or appointment can remove or introduce a man before his letter arrives. The unposted fixture `a_spy` disappears when only his status changes to killed, with principal knowledge unchanged. The resignation record expressly separates current eligibility from instant knowledge. The finding interprets that separation as requiring a received picture for display while still enforcing actual eligibility when an appointment is resolved [I]. **Ruling needed:** whether 0015's legal-response menu is intended to exempt the exposed candidate list. The probe establishes the signal; it does not settle that exception.

Evidence: `probes.json` → `candidateStatus`. Status is reproduced; service/post/rank paths are statically traced manifestations, not additional campaign observations.

### A03. A submitted review disappears on a true vacancy — High

**Canon:** [docs/decisions/0098-rule-seat-doctrine-concentration-bombardment-and-lost-commanders.md:29](../decisions/0098-rule-seat-doctrine-concentration-bombardment-and-lost-commanders.md#L29); [docs/decisions/0102-send-a-plan-back-with-notes-the-commander-may-decline.md:21](../decisions/0102-send-a-plan-back-with-notes-the-commander-may-decline.md#L21).

**Code:** [packages/kernel/src/seats/requests.ts:62](../../packages/kernel/src/seats/requests.ts#L62); [packages/kernel/src/seats/requests.ts:67](../../packages/kernel/src/seats/requests.ts#L67).

The review projection reads current holder, plan status and selected candidate. A true vacancy removes an already submitted review independently of received loss news. The fixture has **one review before the commander is killed and zero afterwards**, with unchanged knowledge and the production loss report still in transit. The commandable menu still correctly believes the old holder, but that protection does not extend to reviews. The review body also comes from the live selected plan rather than an immutable received payload; the confirmed case is the premature vacancy signal, not a claim that every ordinary plan is rewritten.

Evidence: `probes.json` → `reviewsVacancy`; compare [packages/kernel/src/seats/requests.ts:167](../../packages/kernel/src/seats/requests.ts#L167).

### A04. An edit preview reads another seat's new intelligence — High

**Canon:** [docs/decisions/0015-seats.md:14](../decisions/0015-seats.md#L14); [docs/decisions/0088-the-console-and-m2-retired.md:17](../decisions/0088-the-console-and-m2-retired.md#L17); [docs/decisions/0026-foundation-review-revisions.md:14](../decisions/0026-foundation-review-revisions.md#L14).

**Code:** [packages/kernel/src/tick/edit-preview.ts:36](../../packages/kernel/src/tick/edit-preview.ts#L36); [packages/kernel/src/tick/edit-preview.ts:43](../../packages/kernel/src/tick/edit-preview.ts#L43); [packages/cli/src/console/game.ts:108](../../packages/cli/src/console/game.ts#L108); [packages/cli/src/console/session.ts:59](../../packages/cli/src/console/session.ts#L59).

Preview rebuilds the edit from the commander's current view, true holder and live profile. Giving **only the commander** new intelligence changes preview `perceivedEnemy` from **0 to 17,000**, while principal knowledge remains identical. The console prints that estimate in the edited plan ([packages/cli/src/desk/render.ts:25](../../packages/cli/src/desk/render.ts#L25)). A vacancy also changes a successful preview into “no drafted plan” without received loss news. The browser uses the same driver.

The parser restricts preview to a submitted own-side review. This does **not** claim that typing an arbitrary enemy post bypasses the parser. Evidence: `probes.json` → `previewOtherSeat`, `previewVacancy`.

### A05. Planning reads true enemy control beyond the accepted exceptions — High

**Canon:** [docs/decisions/0062-the-planner-shape.md:30](../decisions/0062-the-planner-shape.md#L30); [docs/decisions/0075-the-planner-as-built.md:20](../decisions/0075-the-planner-as-built.md#L20).

**Code:** [packages/kernel/src/planner/input.ts:126](../../packages/kernel/src/planner/input.ts#L126); [packages/kernel/src/planner/context.ts:84](../../packages/kernel/src/planner/context.ts#L84); [packages/kernel/src/planner/route.ts:142](../../packages/kernel/src/planner/route.ts#L142); [packages/kernel/src/planner/axes.ts:74](../../packages/kernel/src/planner/axes.ts#L74).

The full true control index reaches the planner. `enemyHeld` reads actual holder, controlling reduction phases, intermediate assaults and route scoring. Holding beliefs, works, own forces, posts, supply, network, profile and goal fixed, changing only the enemy's control share at `b_mid` from **100 to 900** adds a **2,000 permille-day reduction** and changes candidates/scores. This is distinct from the accepted own-side supply-reach/edge-condition shortcuts. Physical execution can reject impossible travel without making the draft omniscient.

Evidence: `probes.json` → `plannerTruth`; only `ground.index` varies in the second draft. No simulation campaign or parameter fitting was used.

### A06. Player text remains outside string tables — Medium

**Canon:** [docs/decisions/0030-foundation-commitments.md:13](../decisions/0030-foundation-commitments.md#L13); [docs/decisions/0089-codex-builds-a-desk-prototype.md:25](../decisions/0089-codex-builds-a-desk-prototype.md#L25).

**Code:** [packages/cli/src/desk/render.ts:31](../../packages/cli/src/desk/render.ts#L31); [packages/cli/src/desk/dispatches.ts:26](../../packages/cli/src/desk/dispatches.ts#L26); [packages/cli/src/desk/commands.ts:50](../../packages/cli/src/desk/commands.ts#L50); [packages/cli/src/console/session.ts:33](../../packages/cli/src/console/session.ts#L33); [packages/kernel/src/tick/edit-preview.ts:37](../../packages/kernel/src/tick/edit-preview.ts#L37).

Morning copy, help, confirmations, refusals, plan text, report narration and some preview failures remain literal English. `t` translates authored situation content, but not the surrounding sentences. Preview failures pass prose from the kernel to the console/browser. The browser has its permitted prototype chrome table, but its accessible map report twin still concatenates English “ at ” ([prototypes/desk/web/map/StaffMap.tsx:211](../../prototypes/desk/web/map/StaffMap.tsx#L211)). This groups the same localization defect across surfaces; it does not require player strings for pack-author-only technical diagnostics.

### A07. Report confidence defaults remain hard-coded — Medium

**Canon:** [docs/decisions/0072-phase-0-closes-with-a-close-out.md:25](../decisions/0072-phase-0-closes-with-a-close-out.md#L25); [docs/design/FOUNDATION.md:466](../design/FOUNDATION.md#L466).

**Code sites:** [packages/kernel/src/tick/commander-losses.ts:33](../../packages/kernel/src/tick/commander-losses.ts#L33); [packages/kernel/src/tick/people-week.ts:137](../../packages/kernel/src/tick/people-week.ts#L137); [packages/kernel/src/tick/orders.ts:275](../../packages/kernel/src/tick/orders.ts#L275); [packages/kernel/src/tick/plans.ts:109](../../packages/kernel/src/tick/plans.ts#L109); [packages/kernel/src/tick/recruitment.ts:124](../../packages/kernel/src/tick/recruitment.ts#L124); [packages/kernel/src/tick/verbs.ts:325](../../packages/kernel/src/tick/verbs.ts#L325); [packages/kernel/src/tick/verbs.ts:390](../../packages/kernel/src/tick/verbs.ts#L390); [packages/kernel/src/tick/verbs.ts:370](../../packages/kernel/src/tick/verbs.ts#L370).

Producers choose loss-report confidence 900, initiative confidence 700, several objection confidences 800, an inquiry estimate's 600 and observer goal-status confidence 700. Pack templates/verb rules do not expose these defaults. This excludes permille units, boolean certainty and the specific **0/500/900 press confidence ladder accepted by 0103**. The audit does not propose tuning confidence as a gameplay fix.

The same gap appears in battle traffic: [dispatch phase/enemy confidence 600/500](../../packages/kernel/src/tick/battle-reports.ts#L127); first returns [600](../../packages/kernel/src/tick/battle-reports.ts#L148), [500](../../packages/kernel/src/tick/battle-reports.ts#L149), [400](../../packages/kernel/src/tick/battle-reports.ts#L150); full returns [900](../../packages/kernel/src/tick/battle-reports.ts#L167), [800 missing](../../packages/kernel/src/tick/battle-reports.ts#L168), [800 captured](../../packages/kernel/src/tick/battle-reports.ts#L169); [governor wire 400](../../packages/kernel/src/tick/battle-reports.ts#L191); [pocket report 900](../../packages/kernel/src/tick/battle-reports.ts#L214). Consult also imposes an unexposed [minimum confidence 100](../../packages/kernel/src/tick/verbs.ts#L343).

Cyclic producers retain literal confidence for [enemy intelligence 700](../../packages/kernel/src/tick/generate.ts#L124), [works 700](../../packages/kernel/src/tick/generate.ts#L129), [obstructions 700](../../packages/kernel/src/tick/generate.ts#L137), [relayed enemy strength 600](../../packages/kernel/src/tick/generate.ts#L161), [effective strength 800](../../packages/kernel/src/tick/generate.ts#L166), [present strength 900](../../packages/kernel/src/tick/generate.ts#L186), [paper strength 900](../../packages/kernel/src/tick/generate.ts#L187) and [cabinet word 700](../../packages/kernel/src/tick/generate.ts#L210). The template's complete configurable fields stop at route/cadence/pruning ([packages/kernel/src/knowledge/templates.ts:18](../../packages/kernel/src/knowledge/templates.ts#L18)). These older cyclic sites are the existing manifestation of the same pack-tunability gap, not additional claimed new defaults.

### A08. Direct view projection exposes a mutable alias into World — Low

**Canon:** [docs/design/FOUNDATION.md:198](../design/FOUNDATION.md#L198); [docs/decisions/0035-the-stack.md:33](../decisions/0035-the-stack.md#L33).

**Code:** [packages/kernel/src/view/view.ts:263](../../packages/kernel/src/view/view.ts#L263); [packages/kernel/src/view/view.ts:51](../../packages/kernel/src/view/view.ts#L51).

For a provenance-based option, `viewFor` returns the original `proposedBy` object. Its citation array/objects are neither copied nor frozen by that projection. On live content, the probe mutates a citation through the view and observes the in-memory World definition change. It restores the value immediately and writes no pack file.

**Limit:** [packages/kernel/src/seats/requests.ts:344](../../packages/kernel/src/seats/requests.ts#L344) deep-freezes complete requests before seats receive them. This is a direct-API immutability defect, not a demonstrated exploit through the ordinary frozen request path. Evidence: `probes.json` → `worldAlias`.

### A09. The view cache can return a stale own post — Medium

**Canon:** [docs/design/FOUNDATION.md:200](../design/FOUNDATION.md#L200); [docs/decisions/0054-control-fronts-pockets-and-supply.md:17](../decisions/0054-control-fronts-pockets-and-supply.md#L17).

**Code:** [packages/kernel/src/view/view.ts:124](../../packages/kernel/src/view/view.ts#L124); [packages/kernel/src/view/view.ts:207](../../packages/kernel/src/view/view.ts#L207).

The final cache comparison omits `previous.post === post`. Relieving a principal from an office at his capital, with day, reports, region and other projected inputs unchanged, returns the previous object with the old post; a fresh cache returns null. **Limit:** the current console replaces its cache after each tick ([packages/cli/src/console/game.ts:123](../../packages/cli/src/console/game.ts#L123)). The reproduced case is supported same-day projection reuse, not an observed stale console screen. Evidence: `probes.json` → `postCache`.

### A10. A received succession paper does not update the office picture — Medium

**Canon:** [docs/decisions/0100-sourced-situations-absent-staff-advice-and-declared-governments.md:54](../decisions/0100-sourced-situations-absent-staff-advice-and-declared-governments.md#L54).

**Code:** [packages/kernel/src/view/people.ts:76](../../packages/kernel/src/view/people.ts#L76); [packages/kernel/src/view/people.ts:93](../../packages/kernel/src/view/people.ts#L93); [packs/union-1861/situations/texas_governor_changed.json:16](../../packs/union-1861/situations/texas_governor_changed.json#L16).

The people projection recognizes a notice's department-side effect but not institutional succession. A controlled receipt for the real succession notice, addressed to the Confederate principal on test day 12 with the War Secretary as author, leaves `st_gov_texas` showing **`houston_samuel`, source null, as of day zero**, rather than `clark_edward`. This tests the receiving principal's projection, not a naturally observed campaign receipt or a claim that Union players receive a paper addressed only to Davis. Command's actual succession and the received office picture are separate contracts ([packages/kernel/src/tick/forces.ts:107](../../packages/kernel/src/tick/forces.ts#L107)). Evidence: `probes.json` → `successionProjection`.

### A11. The atrocity sign check still assumes measure direction — Medium

**Canon:** [docs/decisions/0057-situations-engine-and-gate-tests.md:45](../decisions/0057-situations-engine-and-gate-tests.md#L45).

**Code:** [packages/pack-format/src/gate.ts:983](../../packages/pack-format/src/gate.ts#L983); [packages/pack-format/src/gate.ts:987](../../packages/pack-format/src/gate.ts#L987); [packages/pack-format/src/situations.ts:85](../../packages/pack-format/src/situations.ts#L85).

The checker still treats positive as beneficial and negative as costly by convention. Built owners do not register directions for it to consult. Schema prose tells authors to declare adverse measures the other way round; that does not implement the accepted owner declaration and checked direction. This is an enforcement requirement left unbuilt, **not a claim that a signed live item currently yields a profitable atrocity**. The parked D6 consequence channel is separate. No gate content or signature was changed.

## Outstanding accepted delivery requirements on main

Other sprint branches may contain candidates. Their status messages are not treated as integrated code or independently reviewed here.

| ID / severity | Canon | Code and gap |
|---|---|---|
| M01 / Medium | [docs/decisions/0105-1as-first-calibration-round-continue-or-park.md:28](../decisions/0105-1as-first-calibration-round-continue-or-park.md#L28) | [packages/kernel/src/seats/requests.ts:114](../../packages/kernel/src/seats/requests.ts#L114); [packages/rule-seats/src/index.ts:182](../../packages/rule-seats/src/index.ts#L182). Doctrine still suppresses later calls to an answered post. The low-level call verb exists; this concerns repeated doctrine calls and complete sourced data. |
| M02 / High | [docs/decisions/0105-1as-first-calibration-round-continue-or-park.md:31](../decisions/0105-1as-first-calibration-round-continue-or-park.md#L31) | [packages/kernel/src/tick/bombard.ts:42](../../packages/kernel/src/tick/bombard.ts#L42); [packages/kernel/src/tick/bombard.ts:57](../../packages/kernel/src/tick/bombard.ts#L57). Bombardment applies losses/control/reports but never files a battle record. Telemetry cannot satisfy the fought-operation contract. |
| M03 / Medium | [docs/decisions/0105-1as-first-calibration-round-continue-or-park.md:34](../decisions/0105-1as-first-calibration-round-continue-or-park.md#L34) | [packages/kernel/src/tick/people-week.ts:121](../../packages/kernel/src/tick/people-week.ts#L121); [packages/kernel/src/tick/people-week.ts:122](../../packages/kernel/src/tick/people-week.ts#L122); [packages/kernel/src/people/verb-rules.ts:55](../../packages/kernel/src/people/verb-rules.ts#L55). Initiative admission still uses ordinary compliance rungs, with no independent admission threshold. |
| M04 / Medium | [docs/decisions/0105-1as-first-calibration-round-continue-or-park.md:35](../decisions/0105-1as-first-calibration-round-continue-or-park.md#L35); [docs/decisions/0032-reports-authors-routes-filters.md:29](../decisions/0032-reports-authors-routes-filters.md#L29) | [packs/union-1861/source/scenarios/march_1861/posts.csv:103](../../packs/union-1861/source/scenarios/march_1861/posts.csv#L103); [packages/kernel/src/seats/posts.ts:108](../../packages/kernel/src/seats/posts.ts#L108). The run lacks a functioning sourced telegraph-filter holder. The caller-screening secretary is deliberately role null; relabelling him would contradict that source-limited ruling. Do not invent a holder or erase March's accepted vacancy. |
| M05 / High | [docs/design/FOUNDATION.md:430](../design/FOUNDATION.md#L430) | [packages/cli/test/console-session.test.ts:238](../../packages/cli/test/console-session.test.ts#L238). The July console battle-dispatch assertion remains an expected failure. Its August continuation and fictional control explicitly cannot satisfy July. A green suite does not close this criterion. |
| M06 / High | [docs/design/FOUNDATION.md:425](../design/FOUNDATION.md#L425); [docs/decisions/0099-the-1a-checkpoint-bands-and-the-limits-of-the-victory-sweep.md:21](../decisions/0099-the-1a-checkpoint-bands-and-the-limits-of-the-victory-sweep.md#L21); [docs/decisions/0105-1as-first-calibration-round-continue-or-park.md:36](../decisions/0105-1as-first-calibration-round-continue-or-park.md#L36) | [packages/cli/src/done-check.ts:29](../../packages/cli/src/done-check.ts#L29); [packages/cli/src/done-check.ts:85](../../packages/cli/src/done-check.ts#L85). The fresh standalone verdict below retains all failed criteria. Default exit semantics and passed architecture checks waive none. D6 is parked, not cleared by a favorable watched-option count. |
| M07 / Low | [docs/decisions/0035-the-stack.md:18](../decisions/0035-the-stack.md#L18) | [package.json:31](../../package.json#L31); [packages/kernel/package.json:13](../../packages/kernel/package.json#L13). The accepted stack calls for fast-check in Phase 0; the workspace manifests/lockfile contain no fast-check dependency or imports. This is tool-adoption drift, not a claim that the existing deterministic fixtures have no property-like coverage. |
| M08 / Medium | [docs/decisions/0027-variable-weekly-turns.md:15](../decisions/0027-variable-weekly-turns.md#L15); [docs/decisions/0040-first-month-revisions.md:30](../decisions/0040-first-month-revisions.md#L30) | [packages/cli/src/console/game.ts:129](../../packages/cli/src/console/game.ts#L129); [packages/kernel/src/tick/deliver.ts:91](../../packages/kernel/src/tick/deliver.ts#L91); [prototypes/desk/web/settings.ts:4](../../prototypes/desk/web/settings.ts#L4). The driver stops on every own decision point with no player-selectable stop mask. Delivery emits no separate requested-report stop; presentation-speed settings do not provide the promised optional stop on Inquire/Consult replies. |

## Section 10: owners against actual writers

The existing scanner found **zero classification errors and zero conflicting writer sites** across **196 workspace source files**, **50 ownership declarations and 52 bound mutable root keys**. The 52 keys plus immutable seed/calendar cover State. The census includes detected alias writes; scanner limitations and exercised deep-freeze coverage still apply. Setup's construction exception is explicit in 0052 and is not a competing runtime writer. Initializing loyalty through setup likewise is not a rogue write.

| ID / severity | Canon | Code | Discrepancy |
|---|---|---|---|
| O01 / Low | [docs/design/FOUNDATION.md:218](../design/FOUNDATION.md#L218); [docs/design/FOUNDATION.md:275](../design/FOUNDATION.md#L275) | [packages/kernel/src/ownership.ts:44](../../packages/kernel/src/ownership.ts#L44); [packages/kernel/src/ownership.ts:45](../../packages/kernel/src/ownership.ts#L45) | The module map groups compliance/reading under State writers. The later field row and code correctly make them pure and give responses to proxy. No duplicate response writer was found. |
| O02 / Low | [docs/design/FOUNDATION.md:204](../design/FOUNDATION.md#L204); [docs/design/FOUNDATION.md:239](../design/FOUNDATION.md#L239) | [packages/kernel/src/ownership.ts:36](../../packages/kernel/src/ownership.ts#L36); [packages/kernel/src/regions/regions.ts:88](../../packages/kernel/src/regions/regions.ts#L88) | The module map omits regions, although its field table and implemented fortification/arrival writers require it. KERNEL_MODULES includes it. |
| O03 / Low | [docs/decisions/0098-rule-seat-doctrine-concentration-bombardment-and-lost-commanders.md:21](../decisions/0098-rule-seat-doctrine-concentration-bombardment-and-lost-commanders.md#L21); [docs/design/FOUNDATION.md:216](../design/FOUNDATION.md#L216); [docs/design/FOUNDATION.md:466](../design/FOUNDATION.md#L466) | [packages/kernel/src/ownership.ts:100](../../packages/kernel/src/ownership.ts#L100); [packages/kernel/src/movement/join.ts:35](../../packages/kernel/src/movement/join.ts#L35) | Code and 0098 give joining orders to movement. Section 10 lacks a forceJoins row and describes movement as only location. This is missing documented responsibility, not a wrong runtime owner. |

The full writer inventory, paths and lines are in `s26-evidence/ownership-sites.json`. `personTrue`/`personTraits` have only initialization paths; `regionLoyalty` likewise has no in-play mutation. Those are missing future behaviors (D05/D14), not competing owners. Shared opening reports/claims remain knowledge-owned under the report field family. Economy and weather are reservations without concrete State fields.

## Deferred promises absent from the current build

These rows preserve their later phase or explicit follow-up. A reservation, stub, report-only proposal or projection slot does not establish that behavior works.

| ID / readiness severity | Promise and deferral | Code evidence / present limit |
|---|---|---|
| D01 / Medium | Full campaign, national will, foreign/blockade pressure clocks, elections and an ending: [docs/decisions/0018-civil-war-scope.md:13](../decisions/0018-civil-war-scope.md#L13); [docs/decisions/0028-start-victory-navy.md:18](../decisions/0028-start-victory-navy.md#L18); [docs/decisions/0084-politics-first-cut-as-built.md:103](../decisions/0084-politics-first-cut-as-built.md#L103) | [packages/kernel/src/tick/politics.ts:27](../../packages/kernel/src/tick/politics.ts#L27); [packages/kernel/src/politics/politics.ts:90](../../packages/kernel/src/politics/politics.ts#L90). Mandate and the legislature do not supply national-will victory, midterms, the 1864 candidate/election or verdict. Foreign-patience is reserved rather than applied; the British/French and blockade pressure clocks are deferred explicitly ([docs/decisions/0023-the-home-front.md:14](../decisions/0023-the-home-front.md#L14); [docs/design/FOUNDATION.md:481](../design/FOUNDATION.md#L481)). The 1A checkpoint score is not an ending. |
| D02 / Medium | Money, men stocks, munitions and named-line rail capacity through holders: [docs/decisions/0023-the-home-front.md:11](../decisions/0023-the-home-front.md#L11); [docs/design/FOUNDATION.md:482](../design/FOUNDATION.md#L482) | [packages/kernel/src/ownership.ts:150](../../packages/kernel/src/ownership.ts#L150); [packages/kernel/src/forces/enlistment.ts:9](../../packages/kernel/src/forces/enlistment.ts#L9). No economy implementation/root stocks; recruitment makes blocks directly. Supply-edge capacity is not the promised allocation economy. |
| D03 / Medium | Seeded daily weather through commanders: [docs/decisions/0029-seasons-sieges-raids-confederacy.md:10](../decisions/0029-seasons-sieges-raids-confederacy.md#L10); [docs/design/FOUNDATION.md:481](../design/FOUNDATION.md#L481) | [packages/kernel/src/world/graph.ts:85](../../packages/kernel/src/world/graph.ts#L85); [packages/kernel/src/world/scenario.ts:278](../../packages/kernel/src/world/scenario.ts#L278). Seasonal edge windows exist; no daily weather State/draw or commander-weather reason path. |
| D04 / Medium | Raids damaging rail/depots and guerrilla pressure: [docs/decisions/0029-seasons-sieges-raids-confederacy.md:18](../decisions/0029-seasons-sieges-raids-confederacy.md#L18); [docs/decisions/0075-the-planner-as-built.md:20](../decisions/0075-the-planner-as-built.md#L20) | [packages/kernel/src/infrastructure/infrastructure.ts:35](../../packages/kernel/src/infrastructure/infrastructure.ts#L35); [packages/kernel/src/planner/types.ts:137](../../packages/kernel/src/planner/types.ts#L137). Damage deltas and a raids cause are not a raid planner/operation or the gated regional pressure model. |
| D05 / Medium | Battle-changing personal stats/earned traits: [docs/decisions/0020-people-hidden-stats-and-assessment.md:14](../decisions/0020-people-hidden-stats-and-assessment.md#L14); [docs/design/FOUNDATION.md:483](../design/FOUNDATION.md#L483) | [packages/kernel/src/people/people.ts:156](../../packages/kernel/src/people/people.ts#L156); [packages/kernel/src/people/people.ts:130](../../packages/kernel/src/people/people.ts#L130). Drawn stats/initial trait lists persist; the in-play change union lacks stat/trait deltas. Force experience is separate from personal development. |
| D06 / Medium | Staff ability assessment and separate adviser credibility: [docs/decisions/0020-people-hidden-stats-and-assessment.md:15](../decisions/0020-people-hidden-stats-and-assessment.md#L15); [docs/decisions/0041-clarifications-owners-and-wording.md:9](../decisions/0041-clarifications-owners-and-wording.md#L9); [docs/design/FOUNDATION.md:483](../design/FOUNDATION.md#L483) | [packages/kernel/src/view/people.ts:117](../../packages/kernel/src/view/people.ts#L117); [packages/kernel/src/politics/politics.ts:105](../../packages/kernel/src/politics/politics.ts#L105). Listing received advice is not a converging assessment/adviser-quality derivation. Existing credibility rates the principal, a different concept. |
| D07 / Medium | Junior officer pool, report-keyed generation, roster checks and stolen credit: [docs/decisions/0020-people-hidden-stats-and-assessment.md:17](../decisions/0020-people-hidden-stats-and-assessment.md#L17); [docs/decisions/0041-clarifications-owners-and-wording.md:21](../decisions/0041-clarifications-owners-and-wording.md#L21); [docs/design/FOUNDATION.md:483](../design/FOUNDATION.md#L483) | [packages/kernel/src/people/people.ts:118](../../packages/kernel/src/people/people.ts#L118); [packages/kernel/src/world/world.ts:304](../../packages/kernel/src/world/world.ts#L304). People come from the static pack roster. Generated portraits do not create officers, identity checks or credit mechanics. |
| D08 / Medium | Promotion lists, nominate/promote, visit, honour and business while away: [docs/decisions/0026-foundation-review-revisions.md:11](../decisions/0026-foundation-review-revisions.md#L11); [docs/decisions/0041-clarifications-owners-and-wording.md:15](../decisions/0041-clarifications-owners-and-wording.md#L15); [docs/design/FOUNDATION.md:483](../design/FOUNDATION.md#L483) | [packages/kernel/src/log/commands.ts:225](../../packages/kernel/src/log/commands.ts#L225). Appoint may include a rank; no promotion-list, visit or honour commands, visit duration/delegate State or away-business resolver. |
| D09 / Medium | Unsolicited candidate plans and adoption: [docs/decisions/0040-first-month-revisions.md:19](../decisions/0040-first-month-revisions.md#L19); [docs/design/FOUNDATION.md:450](../design/FOUNDATION.md#L450) | [packages/kernel/src/plans/plans.ts:58](../../packages/kernel/src/plans/plans.ts#L58); [packages/kernel/src/planner/draft.ts:33](../../packages/kernel/src/planner/draft.ts#L33). Goals trigger candidate sets. Memorandum initiatives do not create an independent uncommissioned plan/adoption path. |
| D10 / Medium | Press slant/leaks, enemy readership, appeals to Congress, relief's bloc cost, rival candidates and costly stance reversal: [docs/decisions/0032-reports-authors-routes-filters.md:31](../decisions/0032-reports-authors-routes-filters.md#L31); [docs/decisions/0079-the-people-verbs-as-built.md:25](../decisions/0079-the-people-verbs-as-built.md#L25); [docs/decisions/0084-politics-first-cut-as-built.md:99](../decisions/0084-politics-first-cut-as-built.md#L99) | [packages/kernel/src/tick/politics.ts:84](../../packages/kernel/src/tick/politics.ts#L84); [packages/kernel/src/people/people.ts:55](../../packages/kernel/src/people/people.ts#L55). Papers go to their side's holders. Rivals/stances exist without these later consequences. This does not call the current press-result path missing. |
| D11 / Medium | Siege method, full embarkation, two-ship axes, ships' stores, blockade stations and operational rail allocation: [docs/decisions/0080-operations-as-built.md:57](../decisions/0080-operations-as-built.md#L57); [docs/decisions/0081-detachments-as-built.md:53](../decisions/0081-detachments-as-built.md#L53); [docs/design/FOUNDATION.md:484](../design/FOUNDATION.md#L484) | [packages/kernel/src/planner/types.ts:137](../../packages/kernel/src/planner/types.ts#L137); [packages/kernel/src/forces/stores.ts:74](../../packages/kernel/src/forces/stores.ts#L74); [packages/kernel/src/planner/methods.ts:256](../../packages/kernel/src/planner/methods.ts#L256). By-water plans exist for embarked troops; later mechanisms/stores consumption are absent. Works/bombardment are not a siege method. |
| D12 / Low | AI fallback, optional voice/transcripts, later play as a general and multiplayer: [docs/decisions/0015-seats.md:15](../decisions/0015-seats.md#L15); [docs/decisions/0022-voice-is-never-state.md:13](../decisions/0022-voice-is-never-state.md#L13); [docs/decisions/0038-no-live-ai-on-steam-until-cleared.md:12](../decisions/0038-no-live-ai-on-steam-until-cleared.md#L12) | [packages/kernel/src/seats/api.ts:23](../../packages/kernel/src/seats/api.ts#L23); [packages/kernel/src/log/session.ts:61](../../packages/kernel/src/log/session.ts#L61). Typed synchronous seats/driver vocabulary exist; no model caller/fallback/transcript path. The console chooses the first playable principal ([packages/cli/src/console/game.ts:65](../../packages/cli/src/console/game.ts#L65)); it has no general-seat or multiplayer driver. No live-AI Steam violation is alleged; there is no shipped Steam build to qualify. |
| D13 / Low | Full Phase-2 desk, reckoning, desktop wrapper and final assets: [docs/decisions/0053-presentation-and-asset-briefs.md:7](../decisions/0053-presentation-and-asset-briefs.md#L7); [docs/decisions/0089-codex-builds-a-desk-prototype.md:27](../decisions/0089-codex-builds-a-desk-prototype.md#L27); [docs/design/FOUNDATION.md:498](../design/FOUNDATION.md#L498) | [prototypes/desk/package.json:2](../../prototypes/desk/package.json#L2); [prototypes/desk/web/App.tsx:32](../../prototypes/desk/web/App.tsx#L32). A separate working prototype is not a promoted application package or released Electron/Steam product. No visual budget, rights clearance, real-portrait delivery or asset/gate acceptance is certified here. |
| D14 / Medium | Changing ordinary population, regional supply value and loyalty: [docs/design/FOUNDATION.md:73](../design/FOUNDATION.md#L73); [docs/design/FOUNDATION.md:239](../design/FOUNDATION.md#L239) | [packages/kernel/src/ownership.ts:94](../../packages/kernel/src/ownership.ts#L94); [packages/kernel/src/regions/regions.ts:107](../../packages/kernel/src/regions/regions.ts#L107). Only loyalty has a root binding in that family, initialized once. No general population/supply-value State or runtime loyalty writer. Protected census/arrivals must not become resource stocks. |
| D15 / Medium | Raise regiments and refill old ones as separate levers: [docs/decisions/0033-forces-scale-and-data-sources.md:25](../decisions/0033-forces-scale-and-data-sources.md#L25) | [packages/kernel/src/log/commands.ts:225](../../packages/kernel/src/log/commands.ts#L225); [packages/kernel/src/tick/recruitment.ts:51](../../packages/kernel/src/tick/recruitment.ts#L51). Calls/musters/expiry exist, but no refill order/sink for an existing regiment. The later economy owns it. Stragglers rejoining are not recruitment refills. |
| D16 / Medium | Later gate records and their content before release: [docs/decisions/0046-gate-checklist-and-situations-catalogue.md:13](../decisions/0046-gate-checklist-and-situations-catalogue.md#L13); [docs/decisions/0074-the-gate-for-1a.md:33](../decisions/0074-the-gate-for-1a.md#L33); [docs/design/FOUNDATION.md:485](../design/FOUNDATION.md#L485) | [packs/union-1861/gate/register.json:268](../../packs/union-1861/gate/register.json#L268); [packages/pack-format/src/gate.ts:16](../../packages/pack-format/src/gate.ts#L16). Held topics remain release blockers. Generic capture/agency machinery does not adopt R2/R3/R4/R6/R7, author later content or authorize Black-unit force data. Signed content is preserved. |

## Precedence checks not counted as violations

- 0017's real-time shell is superseded by 0027. Weekly turns are not a pacing violation.
- 0075 permits own-side edge-condition/supply-reach truth during 1A. A05 concerns a distinct enemy-holder read.
- 0076 permits contact strength for the battle commander, distinct from the principal's omniscient totals in A01.
- 0100 retains nine date-only opening/institutional premises and 0040's opening fallback; 0069–0070 permit nations' dated acts. Labelled notices are not automatically new violations of “causes, not dates.” `situation-causes.json` retains the complete live inventory. Further B2/gate classification remains with its owners; no label or signature was erased to settle it here.
- 0103 permits byte-equal local CLI/browser press presenters to keep source serving closed. Their duplication is not reported against the general reuse rule.
- 0052 permits unreleased save schema 1. An empty migration registry is not a released-save breach.
- 0086 intentionally makes the three stopwatch tests conditional in the ordinary hook. Their skips are disclosed; Linux CI and the standalone check retain their budget duties.
- 0099 leaves 1A non-binding on the default CLI exit until the lead changes it. Failed 1A criteria remain separately reported; a Phase-0 exit 0 would not complete 1A.
- 0106 permits sprint commits and defers independent review. This is the requested audit, not post-sprint standing-review acceptance.

## Validation and retained evidence

`npm ci` ran first: exit 0, 51 packages added, 56 audited, zero vulnerabilities, 37 seconds. Node v22.23.2, npm 10.9.8. Workspace-link preflight passed; the configured real hook path is `.githooks`.

`MANDATE_NO_GIT=1 npm run check` exited **0** in **224.37 seconds**: **137 files, 1,530 passed, one expected failure, three conditional skips**. Typecheck, boundary, licences and decisions all passed. The expected failure is M05. This is local Windows evidence, not fresh Linux CI.

Nine bounded probes exited 0 after asserting the observed contradictions. No production test was added or rewritten. The first seven probes and two follow-ups form one retained reproducer. The follow-up added the private-intelligence preview and received-succession questions; unaffected evidence is reused.

The default eight-seed done check, including drafting, calls the existing `runDoneCheck` and `measureDrafting` exports. The audit adapter changes only output placement: summaries/saves/results stay under `docs/audit/` instead of the CLI entry point's `runs/`. Seeds, horizons, drafting, budgets, assertions, rules, data and run options are unchanged. Default Phase-0 exit semantics are preserved. A separate CLI campaign was not repeated.

The campaign exited **1** after **2,714.08 seconds** (45.2 minutes including its wrapper). **Phase 0: 5/6**; timing alone failed. **1A: 2/6**. All **13 problem statements** (three timing, ten 1A) are retained, with complete criterion evidence in [runtime-verdict.json](s26-evidence/runtime-verdict.json).

| Timed run | Median / p95, ms per day | Unchanged 40 / 160 budget |
|---|---|---|
| Union reference, 148 days | 67.35 / 108.52 | Median failed |
| Testbed, 120 days | 6.62 / 57.31 | Passed |
| Union history, 148 days to 31 July | 130.35 / 271.48 | Median and p95 failed |

These loaded local Windows timings are not a Linux CI measurement. Behaviour, same-process daily hash equality, save/resume, liveness and section-ten checks passed. All checked/repeat/timed reference and history summaries report zero rejections. The Union reference has **148 daily hashes**, ending at `55a35b1034c19b09f121d3ffcd311219b416e864257b43b1bb9370a33c8e7006`; replay and day-60 resume match. The testbed retains 120 hashes and its day-40 resume. No cross-host equality is claimed.

Every failed 1A category remains open:

- **Checkpoints:** Confederate strength is **20,957**, below **100,000**; Union and Confederate fought planned operations are each **0**, below **1**.
- **Operation:** the history run has **two operations and zero battles**; no planned operation fought.
- **Pushback:** relay holds **1 < 2**, filter holds **0 < 1**, trims **0 < 1**, and compliance with reservations **44 > 9**.
- **Lever sweep:** all **eight seeds** ran; **248** base recruitment calls do not close the missing chain. The victory measure does not read the policy's grievance channel, and **24** weighed policy moves have no border governor answering a call within their horizons. The watched return option is best **0/8**, with no flagged/unpaid items; that result cannot clear **D6**, which remains parked.

Unknown-strength **for recorded battles** and stand-ins passed. The drafting diagnostic is sound: **23 commands**, seven without land force, worst all-command day **403.63 ms**, worst capped day **284.13 ms**. Drafting is informational rather than an additional done criterion. No campaign was retried and no parameter, checkpoint band or assertion was changed.

The first actual commit hook exited **1** after **489.66 seconds**: **138 files passed, one failed**; 1,534 tests passed, one expected failure and 17 skips. Its only failed suite was `packages/cli/test/done-check.test.ts:36`, whose unchanged setup exceeded the **300,000 ms** bound. No assertion failed there; its 15 tests did not run. Boundary, licences and decision-index gates were not reached, so each was checked separately and passed. The unchanged failed file then passed alone with supported `VITEST_MAX_WORKERS=1`: **14 passed / one normal timing skip**, **185.55 seconds**. Parallel contention is a supported explanation [I], not a measured exclusive cause. One final required hook retry uses the same one-worker limit with the complete collection and unchanged timeouts/assertions. The prior no-git, probe and full eight-seed campaign evidence is reused; no campaign is repeated. [hook-recovery.json](s26-evidence/hook-recovery.json) retains the failure, targeted correction verification, unreached gates and log hashes.

The real pre-commit hook is the final commit gate, without `--no-verify`. Its receipt is retained locally at `docs/audit/runs/s26/hook.log` and reported in the final CODEX status; this report does not predict that result. Raw saved States, summaries and large diagnostics remain in ignored `docs/audit/runs/s26/`. Compact findings, probe output, source hashes, writer sites and runtime verdict accompany the report in git.

Final preservation checks cover all **1,673 original tracked files**, the report's exact source citations, all accepted decision hashes and implementation anchors, contiguous finding IDs and delivery paths. No original tracked file changed. The delivery contains only Markdown and JSON under `docs/audit/`; local executable reproducers remain ignored. Main advanced during the audit, changing only `CODEX.md`, so the audited code/canon still match it; the latest verified tip is recorded in the receipt. The final machine receipt is [source-preservation.json](s26-evidence/source-preservation.json).

## Proposed rulings for the lead

1. Route A01–A05/A10 to menu/preview/projection owners; confirm A02's explicit legal-menu interpretation before adopting a correction. Recommend preserving received-evidence semantics and enforcing actual eligibility on resolution [I]. Reject silently broadening truth exceptions. Retain A08/A09's direct-API/cache limits when routing them.
2. Keep deferred D rows separate from current violations and 1A completion. Reject interpreting a full-game promise as a claim that all later phases are built. Keep every agreed criterion and 0105's parked D6 clearance intact.
3. Reconcile section 10 with the correct existing writers after review. Reject moving code into a facade to match stale prose, or treating setup construction as a competing owner.

## Findings outside my scope

No implementation, canon amendment, gate placement/signature, source-data correction, cross-branch integration, calibration, hosted CI run, asset/rights acceptance or release decision was undertaken. The lead/post-sprint reviewers own classification and routing, including other sprint branches' candidates for M01–M04. Preserved runtime failures remain acceptance gaps. No push or history rewrite; no other sprint worktree write. The only authorized write outside this worktree is the final append-only status in the main checkout's CODEX.md, read fresh before appending.
