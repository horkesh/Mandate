# sprint/desk: review packet

Pinned remote tip: `7db8c80a605c4410f458487778cadc7008ac8909`. Comparison: `origin/main...origin/sprint/desk` at main `b01764406738b42633277c8bf00099e093bf20e9`; merge base `ceff796b3c793ef28e79b5d51d7dfe5a2dfabf39`. Snapshot: 2026-11-21T01:39:50.624621+00:00.

This is navigation for the standing reviewer and the lead under 0106. It is not a verdict, accepted ruling, gate sign-off or permission to merge. Locations below refer to the pinned branch, not to the audit worktree.

## What changes

S8 builds desk turn flow, attention, accountability, map wait notes and received people views; S19 adds public chamber composition, own attention/audience projections and driver stop preferences, then UI controls/accessibility. S29’s integrated merge/playtest is absent from the remote tip: its interrupted uncommitted work is outside this review snapshot.

23 commits reachable from the branch but not pinned main; 140 changed paths. Descendants include shared commits; counts across packets must not be added. Immutable [full diff](https://github.com/horkesh/Mandate/compare/b01764406738b42633277c8bf00099e093bf20e9...7db8c80a605c4410f458487778cadc7008ac8909) and [inventory](_evidence/inventory.json). Raw git diff, its command, size and SHA-256 are retained under `_evidence/validation-raw/diffs/` (local, ignored), with the receipt in the inventory.

### Commits

| Commit | Subject |
|---|---|
| [`a9c35ba85ece`](https://github.com/horkesh/Mandate/commit/a9c35ba85eced7fa7f9d377b5ed90c758e2aa76f) | Lane 1.12 Part B: consult's policy, and the 4 July message (R84, Codex) |
| [`cfa2c5a93488`](https://github.com/horkesh/Mandate/commit/cfa2c5a93488ae127a6b23e4a7ed7deb1fab12f3) | Lane 1.12 Part B: Butler to the Department of Virginia (R89, Codex) |
| [`179be08fca58`](https://github.com/horkesh/Mandate/commit/179be08fca58efead08664f14f76f2b0e836ad67) | Research: a bounded probe of assault contact (R93, Codex) |
| [`cf31f3152077`](https://github.com/horkesh/Mandate/commit/cf31f3152077d78aa8db093b2c7ef02a2e0f5501) | Initiative admission apart from compliance; the filter office left vacant (R92, Codex) |
| [`23879c48622a`](https://github.com/horkesh/Mandate/commit/23879c48622ad85746b74b0c56df2c6706065297) | The bombardment writes a battle record (R91, R95, Codex) |
| [`4f6e8b30c344`](https://github.com/horkesh/Mandate/commit/4f6e8b30c344319802511eca534dff6a2c6a95cc) | The 1861 calls for troops and the state-force transfers (R90, R96, Codex) |
| [`a0b452435189`](https://github.com/horkesh/Mandate/commit/a0b4524351890cabcd795368e3bea370f86ab7a1) | The Confederate concentration in northern Virginia (R98, Codex) |
| [`18029078b663`](https://github.com/horkesh/Mandate/commit/18029078b663e03346e10d81bd7a2caf506c34fd) | Merge northern concentration and sourced calls into sprint/1a |
| [`e76c3348640f`](https://github.com/horkesh/Mandate/commit/e76c3348640fa6b7962fe3932a024a0380e4e131) | Merge bombardment battle records into sprint/1a |
| [`f72c709384e0`](https://github.com/horkesh/Mandate/commit/f72c709384e06d9a3466021fdb827dae66a8b31a) | Merge dated rule-seat appointments into sprint/1a |
| [`df291e653544`](https://github.com/horkesh/Mandate/commit/df291e65354427ce1c50d5730f6824b289be7f1d) | Merge independent initiative threshold into sprint/1a |
| [`e82a63425f10`](https://github.com/horkesh/Mandate/commit/e82a63425f106fe203bb16a054b84c3e75e80583) | Complete the desk's received-knowledge views |
| [`9d0ad8256e37`](https://github.com/horkesh/Mandate/commit/9d0ad8256e3783bd5176b753c4dd3803d0dcd26e) | Merge bounded assault-contact findings into sprint/1a |
| [`6848cf2c086e`](https://github.com/horkesh/Mandate/commit/6848cf2c086e2e6fdda1be3da7416ad72938b4cc) | Expose public and received desk records with driver turn stops |
| [`bf6cc66c025a`](https://github.com/horkesh/Mandate/commit/bf6cc66c025a0567a991f1a94eb9ba20656f4004) | Integrate state-force acts with northern concentration |
| [`c6f9799012bc`](https://github.com/horkesh/Mandate/commit/c6f9799012bc6b447226984e5efddd6b84912b7e) | Wire the desk to its public and received records |
| [`d878dd357fa6`](https://github.com/horkesh/Mandate/commit/d878dd357fa65315cd76c9bbd390d46ea6318be5) | Merge integrated 1A into the desk branch |
| [`6627e6970228`](https://github.com/horkesh/Mandate/commit/6627e6970228908d61e58aeb5a9b8239dabd06d4) | Allow the desk to return before the maximum turn length |
| [`76d4fd6ebafd`](https://github.com/horkesh/Mandate/commit/76d4fd6ebafd3a53b9efd00898f5d28c38422aab) | State the actual shorter interval in the console stop line |
| [`2516f89e88b6`](https://github.com/horkesh/Mandate/commit/2516f89e88b60b326eaa8d661889804c945410ce) | Send identified dated calls with their complete published terms |
| [`25e6b7348f84`](https://github.com/horkesh/Mandate/commit/25e6b7348f84a73b70704861e02878f6798f5791) | Address calls to the governors offered by the raising menu |
| [`0d9194bfef49`](https://github.com/horkesh/Mandate/commit/0d9194bfef494c5d8cb5f5a74996d0413f1c3a96) | Keep signed decisions visibly pending in the docket |
| [`7db8c80a605c`](https://github.com/horkesh/Mandate/commit/7db8c80a605c4410f458487778cadc7008ac8909) | Record the S29 desk history run and its unmet acceptance checks |

### Files and areas

| Change | Path |
|---|---|
| M | [docs/design/FOUNDATION.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/design/FOUNDATION.md#L1) |
| A | [docs/playtests/2026-11-21-desk-history-run.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L1) |
| M | [docs/research/2026-11-14-union-information-flows.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/research/2026-11-14-union-information-flows.md#L1) |
| A | [docs/research/2026-11-20-northern-virginia-concentration.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/research/2026-11-20-northern-virginia-concentration.md#L1) |
| A | [docs/research/_combat/assault-contact-probe.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/research/_combat/assault-contact-probe.md#L1) |
| M | [notes/lane-1.12-rule-seats.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.12-rule-seats.md#L1) |
| M | [notes/lane-1.14-done-check.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.14-done-check.md#L1) |
| M | [notes/lane-1.3-combat.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.3-combat.md#L1) |
| M | [notes/lane-1.5-people-verbs.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.5-people-verbs.md#L1) |
| M | [notes/lane-1.7-men-regions.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.7-men-regions.md#L1) |
| A | [notes/sprint-S19-desk.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L1) |
| A | [notes/sprint-S29-desk.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S29-desk.md#L1) |
| M | [packages/cli/src/console/game.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/console/game.ts#L1) |
| M | [packages/cli/src/console/session.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/console/session.ts#L1) |
| M | [packages/cli/src/desk/commands.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/desk/commands.ts#L1) |
| M | [packages/cli/src/desk/render.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/desk/render.ts#L1) |
| M | [packages/cli/src/liveness-gate.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/liveness-gate.ts#L1) |
| M | [packages/cli/test/bombardment.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/bombardment.test.ts#L1) |
| A | [packages/cli/test/calls-schedule.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/calls-schedule.test.ts#L1) |
| M | [packages/cli/test/concentration.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/concentration.test.ts#L1) |
| M | [packages/cli/test/fixtures/saves/testbed-seats-day40.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/fixtures/saves/testbed-seats-day40.json#L1) |
| M | [packages/cli/test/men-regions.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/men-regions.test.ts#L1) |
| A | [packages/cli/test/scheduled-calls.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/scheduled-calls.test.ts#L1) |
| A | [packages/cli/test/short-turn-wording.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/short-turn-wording.test.ts#L1) |
| A | [packages/cli/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/state-forces.test.ts#L1) |
| A | [packages/cli/test/turn-limit.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/turn-limit.test.ts#L1) |
| A | [packages/cli/test/turn-stops.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/turn-stops.test.ts#L1) |
| M | [packages/cli/test/union-opening.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/union-opening.test.ts#L1) |
| M | [packages/cli/test/war-gate.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/war-gate.test.ts#L1) |
| M | [packages/kernel/src/combat/battle.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/combat/battle.ts#L1) |
| M | [packages/kernel/src/combat/bombard.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/combat/bombard.ts#L1) |
| M | [packages/kernel/src/combat/records.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/combat/records.ts#L1) |
| M | [packages/kernel/src/combat/shape.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/combat/shape.ts#L1) |
| M | [packages/kernel/src/command/command.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/command/command.ts#L1) |
| M | [packages/kernel/src/command/levies.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/command/levies.ts#L1) |
| M | [packages/kernel/src/forces/enlistment.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/forces/enlistment.ts#L1) |
| M | [packages/kernel/src/knowledge/report.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/knowledge/report.ts#L1) |
| M | [packages/kernel/src/log/commands.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/log/commands.ts#L1) |
| M | [packages/kernel/src/log/log.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/log/log.ts#L1) |
| M | [packages/kernel/src/log/session.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/log/session.ts#L1) |
| M | [packages/kernel/src/messages/latency.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/messages/latency.ts#L1) |
| M | [packages/kernel/src/messages/transit.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/messages/transit.ts#L1) |
| M | [packages/kernel/src/ownership.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/ownership.ts#L1) |
| M | [packages/kernel/src/people/verb-rules.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/people/verb-rules.ts#L1) |
| M | [packages/kernel/src/politics/rules.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/politics/rules.ts#L1) |
| M | [packages/kernel/src/proxy/responses.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/proxy/responses.ts#L1) |
| M | [packages/kernel/src/seat-api.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seat-api.ts#L1) |
| M | [packages/kernel/src/seats/api.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seats/api.ts#L1) |
| M | [packages/kernel/src/seats/requests.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seats/requests.ts#L1) |
| A | [packages/kernel/src/seats/turn-stops.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seats/turn-stops.ts#L1) |
| M | [packages/kernel/src/seats/world.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seats/world.ts#L1) |
| M | [packages/kernel/src/situations/types.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/situations/types.ts#L1) |
| M | [packages/kernel/src/tick/bombard.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/bombard.ts#L1) |
| M | [packages/kernel/src/tick/context.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/context.ts#L1) |
| M | [packages/kernel/src/tick/orders.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/orders.ts#L1) |
| M | [packages/kernel/src/tick/people-week.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/people-week.ts#L1) |
| M | [packages/kernel/src/tick/recruitment.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/recruitment.ts#L1) |
| M | [packages/kernel/src/tick/tick.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/tick.ts#L1) |
| M | [packages/kernel/src/tick/verbs.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/verbs.ts#L1) |
| A | [packages/kernel/src/view/desk.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/view/desk.ts#L1) |
| M | [packages/kernel/src/view/types.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/view/types.ts#L1) |
| M | [packages/kernel/src/view/view.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/view/view.ts#L1) |
| M | [packages/kernel/src/world/scenario.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/world/scenario.ts#L1) |
| M | [packages/kernel/src/world/world.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/world/world.ts#L1) |
| M | [packages/kernel/test/bombard.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/bombard.test.ts#L1) |
| A | [packages/kernel/test/command-establishment.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/command-establishment.test.ts#L1) |
| A | [packages/kernel/test/desk-projections.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/desk-projections.test.ts#L1) |
| M | [packages/kernel/test/people-verbs.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/people-verbs.test.ts#L1) |
| M | [packages/kernel/test/support/map-fixture.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/support/map-fixture.ts#L1) |
| M | [packages/pack-format/schemas/pack.schema.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/schemas/pack.schema.json#L1) |
| M | [packages/pack-format/schemas/situation.schema.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/schemas/situation.schema.json#L1) |
| M | [packages/pack-format/schemas/world.schema.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/schemas/world.schema.json#L1) |
| M | [packages/pack-format/src/schemas.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/src/schemas.ts#L1) |
| M | [packages/pack-format/src/situations.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/src/situations.ts#L1) |
| M | [packages/pack-format/src/validate.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/src/validate.ts#L1) |
| A | [packages/pack-format/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/test/state-forces.test.ts#L1) |
| M | [packages/pack-format/test/support/fixture.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/test/support/fixture.ts#L1) |
| M | [packages/pack-format/test/validate.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/pack-format/test/validate.test.ts#L1) |
| M | [packages/rule-seats/src/index.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/rule-seats/src/index.ts#L1) |
| M | [packages/rule-seats/test/rule-seats.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/rule-seats/test/rule-seats.test.ts#L1) |
| M | [packs/testbed/data/world.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/testbed/data/world.json#L1) |
| M | [packs/testbed/pack.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/testbed/pack.json#L1) |
| A | [packs/union-1861/calls-1861.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/calls-1861.json#L1) |
| M | [packs/union-1861/data/scenarios/march_1861.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/data/scenarios/march_1861.json#L1) |
| M | [packs/union-1861/data/strings/en.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/data/strings/en.json#L1) |
| M | [packs/union-1861/data/world.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/data/world.json#L1) |
| M | [packs/union-1861/pack.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/pack.json#L1) |
| A | [packs/union-1861/situations/arkansas_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/arkansas_forces_transferred.json#L1) |
| D | `packs/union-1861/situations/butler_at_fort_monroe.json` (removed; inspect retained diff) |
| A | [packs/union-1861/situations/north_carolina_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/north_carolina_forces_transferred.json#L1) |
| A | [packs/union-1861/situations/tennessee_forces_return.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_forces_return.json#L1) |
| A | [packs/union-1861/situations/tennessee_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_forces_transferred.json#L1) |
| A | [packs/union-1861/situations/tennessee_military_league.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_military_league.json#L1) |
| A | [packs/union-1861/situations/virginia_forces_return.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/virginia_forces_return.json#L1) |
| A | [packs/union-1861/situations/virginia_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/virginia_forces_transferred.json#L1) |
| M | [packs/union-1861/source/scenarios/march_1861/temporary_posts.csv:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/source/scenarios/march_1861/temporary_posts.csv#L1) |
| M | [packs/union-1861/strings/en.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/strings/en.json#L1) |
| A | [packs/union-1861/test/butler-appointment.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/butler-appointment.test.ts#L1) |
| A | [packs/union-1861/test/calls-1861.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/calls-1861.test.ts#L1) |
| A | [packs/union-1861/test/desk-scheduled-calls.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/desk-scheduled-calls.test.ts#L1) |
| A | [packs/union-1861/test/northern-concentration.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/northern-concentration.test.ts#L1) |
| M | [packs/union-1861/test/resignation.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/resignation.test.ts#L1) |
| A | [packs/union-1861/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/test/state-forces.test.ts#L1) |
| M | [prototypes/desk/README.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/README.md#L1) |
| A | [prototypes/desk/playwright.s19.config.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/playwright.s19.config.ts#L1) |
| A | [prototypes/desk/playwright.s29.config.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/playwright.s29.config.ts#L1) |
| A | [prototypes/desk/playwright.s8.config.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/playwright.s8.config.ts#L1) |
| M | [prototypes/desk/scripts/dev.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/dev.ts#L1) |
| A | [prototypes/desk/scripts/s19-audit.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s19-audit.ts#L1) |
| A | [prototypes/desk/scripts/s19-fixtures.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s19-fixtures.ts#L1) |
| A | [prototypes/desk/scripts/s29-audit.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s29-audit.ts#L1) |
| A | [prototypes/desk/scripts/s29-prepare.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s29-prepare.ts#L1) |
| A | [prototypes/desk/scripts/s8-audit.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s8-audit.ts#L1) |
| A | [prototypes/desk/scripts/s8-fixtures.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/scripts/s8-fixtures.ts#L1) |
| M | [prototypes/desk/server/adapter.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/server/adapter.ts#L1) |
| M | [prototypes/desk/server/http.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/server/http.ts#L1) |
| A | [prototypes/desk/test/s19.spec.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s19.spec.ts#L1) |
| A | [prototypes/desk/test/s19.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s19.test.ts#L1) |
| A | [prototypes/desk/test/s29-call-picker.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29-call-picker.test.ts#L1) |
| A | [prototypes/desk/test/s29-controls.spec.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29-controls.spec.ts#L1) |
| A | [prototypes/desk/test/s29-pending-decisions.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29-pending-decisions.test.ts#L1) |
| A | [prototypes/desk/test/s29-scheduled-calls.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29-scheduled-calls.test.ts#L1) |
| A | [prototypes/desk/test/s29-turn-limit.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29-turn-limit.test.ts#L1) |
| A | [prototypes/desk/test/s29.spec.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s29.spec.ts#L1) |
| A | [prototypes/desk/test/s8.spec.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s8.spec.ts#L1) |
| A | [prototypes/desk/test/s8.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s8.test.ts#L1) |
| A | [prototypes/desk/test/support/s29-controls.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/support/s29-controls.ts#L1) |
| M | [prototypes/desk/web/App.tsx:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/App.tsx#L1) |
| A | [prototypes/desk/web/DeskViews.tsx:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/DeskViews.tsx#L1) |
| M | [prototypes/desk/web/People.tsx:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/People.tsx#L1) |
| M | [prototypes/desk/web/adapter.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/adapter.ts#L1) |
| A | [prototypes/desk/web/business.css:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/business.css#L1) |
| A | [prototypes/desk/web/business.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/business.ts#L1) |
| M | [prototypes/desk/web/map/StaffMap.tsx:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/map/StaffMap.tsx#L1) |
| M | [prototypes/desk/web/map/notes.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/map/notes.ts#L1) |
| M | [prototypes/desk/web/map/strings.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/map/strings.ts#L1) |
| M | [prototypes/desk/web/people.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/people.ts#L1) |
| M | [prototypes/desk/web/strings.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/strings.ts#L1) |
| M | [prototypes/desk/web/table.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/table.ts#L1) |
| M | [vitest.config.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/vitest.config.ts#L1) |

## Proposed rulings for the lead

Each number is a source proposal the lead can accept, revise or overturn. Choices and rejected alternatives retain the author’s wording unless marked as S32 unpacking. Status restatements are retained for traceability; they are not additional witnesses. A withdrawn or superseded proposal is labeled by its source and is not silently revived. Where the source supplies no rejected alternative, this packet does not manufacture one.

1. Keep shorter turns as a driver preference within the pack maximum. Reject changing pack weeks or silently passing a chosen date. Keep own-queue decisions visibly pending; reject pretending queueing applied effects. — [docs/playtests/2026-11-21-desk-history-run.md:185](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L185); hand-over.
2. Use complete identified-call fields and governor routes from the public menu. Reject inferred quotas or replacing war terms with fixed durations. An issued marker means issued, not fulfilled. — [docs/playtests/2026-11-21-desk-history-run.md:188](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L188); hand-over.
3. Supply lawful human appointment/establishment context. [requests.ts](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/seats/requests.ts) restricts dated `historicalAppointments` to the rules driver; none appears in 22 human menus. Separately, the actual Union appointment table at this pin in [world.json](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/data/world.json) contains **only Butler on 22 May**. McDowell and Patterson are absent, not merely hidden by that restriction. Their sourced establishments/appointments belong to S1's owner. Reject automatic historical defaults or relabelling Stone. — [docs/playtests/2026-11-21-desk-history-run.md:191](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L191); hand-over.
4. Author a public live-clock marker, reported ranges and explanation of unavailable alternatives. `SituationView` supplies none. Reject deriving deadlines or future options from private effects, especially at Sumter. — [docs/playtests/2026-11-21-desk-history-run.md:199](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L199); hand-over.
5. Complete the prospective audience case, legal counters and declared replies. The filed answer works but is not a current numbered case. Reject inventing one from private traits or old reasons. — [docs/playtests/2026-11-21-desk-history-run.md:202](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L202); hand-over.
6. Have the contract owner classify the plan DTO's numeric score/weighted terms. The review carries score 772 and terms including `goal_fit`, `force_ratio`, `time`, `supply`, `glory`; [optionView](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/tick/plans.ts) with `false` hides private notes but retains those fields. The desk does **not** display the numbers. This is a possible oversharing review question, not a proven canon violation or permission to use the numbers as advice. — [docs/playtests/2026-11-21-desk-history-run.md:205](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L205); hand-over.
7. Preserve missing human Manassas as open acceptance. [I] Different holders, explicit review and transport make this trajectory differ from automated history; they do not prove which caused the absence. Reject fabricated reports, truth imported from the automated run, or pack tuning for a screenshot. The next bounded investigation belongs to the human operation/appointment contract owner, using the retained commands/replies. — [docs/playtests/2026-11-21-desk-history-run.md:212](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/docs/playtests/2026-11-21-desk-history-run.md#L212); hand-over.
8. Inherits every integration proposal in 1a.md, including the runner ceiling, appointment contracts, call/transfer representation and parked R93 experiment. Review them with 1a; neither descendant supersedes those choices. — [notes/lane-1.14-done-check.md:3](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.14-done-check.md#L3); inherited coverage.
9. Use public chamber records and own recorded choices; reject certifying ratification from hidden congressLedger state. — [notes/sprint-S19-desk.md:28](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L28); S32 unpacking of the cited proposal [I].
10. Show explicit audience requests and own invitations; reject an objection as a request or reconstruction of a private prospective case. — [notes/sprint-S19-desk.md:30](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L30); S32 unpacking of the cited proposal [I].
11. Keep stop preferences in the console driver; reject new State or simulation commands. — [notes/sprint-S19-desk.md:31](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L31); S32 unpacking of the cited proposal [I].
12. Use dated cited public composition; reject converting bloc support/voice into legislative seat counts. — [notes/sprint-S19-desk.md:33](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L33); S32 unpacking of the cited proposal [I].
13. **Proposed rulings, with rejected alternatives:** (1) keep dispatched slips in the shell's existing turn history, rejecting a second simulation ledger or inferring execution from dispatch; (2) keep wait notes as requests for a redraft, rejecting a conversion into movement orders or an audience/compliance preview; (3) leave unavailable projections explicit, rejecting private State/pack-effect reads, a guessed refill date or inferred Congressional ratification. — CODEX.md:5177 (preserved in the linked status snapshot); S8 author status.
14. **Proposed rulings, with rejected alternatives:** use public chamber records and known actions rather than congressLedger or unchosen effects; use dated published counts rather than converting bloc support/voice into seats; derive refill from the actual own budget rather than weekdays; keep stop preferences in the driver rather than State or the command log; show explicit requests and own invitations rather than interpreting an objection as an audience request or recomputing private compliance. The lead's whole-branch review under 0106 remains due; nothing is signed or cleared for main. — CODEX.md:5579 (preserved in the linked status snapshot); S19 author status.
15. Proposed rulings: keep bounded driver turns, complete menu-supplied calls and visibly pending own-queue answers; reject changing pack weeks, inferred call terms or claiming dispatch is execution. Supply lawful human appointment context and authored clocks/audience cases; reject automatic historical defaults or reconstruction from private effects. Classify numeric plan scores before exposing them. Preserve the human Manassas failure, rather than importing the automated battle. — CODEX.md:5958 (preserved in the linked status snapshot); S29 author status.

### Status and hand-over coverage

| Source | Coverage |
|---|---|
| S8 author status | Original `CODEX.md:5161`, 25 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S19 author status | Original `CODEX.md:5565`, 29 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S29 author status | Original `CODEX.md:5616`, 14 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S29 author status | Original `CODEX.md:5946`, 19 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| [notes/lane-1.12-rule-seats.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.12-rule-seats.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/lane-1.12-rule-seats.md) |
| [notes/lane-1.14-done-check.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.14-done-check.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/lane-1.14-done-check.md) |
| [notes/lane-1.3-combat.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.3-combat.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/lane-1.3-combat.md) |
| [notes/lane-1.5-people-verbs.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.5-people-verbs.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/lane-1.5-people-verbs.md) |
| [notes/lane-1.7-men-regions.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/lane-1.7-men-regions.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/lane-1.7-men-regions.md) |
| [notes/sprint-S19-desk.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S19-desk.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/sprint-S19-desk.md) |
| [notes/sprint-S29-desk.md:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/notes/sprint-S29-desk.md#L1) | [Retained hand-over](_evidence/handovers/desk/notes/sprint-S29-desk.md) |

## Four review lenses

| Lens | First question and location | Regression evidence / test |
|---|---|---|
| Canon and decisions | Keep the seat boundary and derive Congress only from public composition, received notices and own choices; do not read a hidden ledger as ratification. [packages/kernel/src/view/desk.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/view/desk.ts#L1) | [packages/kernel/test/desk-projections.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/desk-projections.test.ts#L1) |
| Determinism | Stop preferences belong to ConsoleGame; they must not enter State/commands/hashes. Check cache equality after composing the perf candidate-cache changes. [packages/cli/src/console/game.ts:95](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/src/console/game.ts#L95) | [packages/cli/test/turn-stops.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/cli/test/turn-stops.test.ts#L1) |
| History | The pack has no published party-count data at this tip; bloc support is not a count of seats. Future composition and unreceived audience cases must stay invisible. [packages/kernel/src/politics/rules.ts:34](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/src/politics/rules.ts#L34) | [packages/kernel/test/desk-projections.test.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packages/kernel/test/desk-projections.test.ts#L1) |
| Realism | A sent slip is not compliance; an objection is not an audience request. Check wait-note grammar, rejected occurrences, keyboard focus/reflow and the still-missing prospective case. [prototypes/desk/web/DeskViews.tsx:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/web/DeskViews.tsx#L1) | [prototypes/desk/test/s19.spec.ts:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/prototypes/desk/test/s19.spec.ts#L1) |

A test link identifies the relevant guard or validation contract, not a claim that S32 ran that branch. Research/design inventories lack a general test for historical truth; compare cited pages and scope/measure sidecars before adoption. Run the required project/hook checks after integration and every behavior-triggered regression.

## Gate items

No new signature or historical likeness. Rendering existing sensitive papers still requires their approved agency/uncertainty/terms to survive. No missing policy/cost/ratification is invented by these views.

| Draft / item | Topic or classification | Remaining review |
|---|---|---|
| [packs/union-1861/situations/arkansas_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/arkansas_forces_transferred.json#L1) — arkansas_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/north_carolina_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/north_carolina_forces_transferred.json#L1) — north_carolina_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_forces_return.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_forces_return.json#L1) — tennessee_forces_return | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_forces_transferred.json#L1) — tennessee_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_military_league.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/tennessee_military_league.json#L1) — tennessee_military_league | proposed gate.none | classification review |
| [packs/union-1861/situations/virginia_forces_return.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/virginia_forces_return.json#L1) — virginia_forces_return | proposed gate.none | classification review |
| [packs/union-1861/situations/virginia_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/7db8c80a605c4410f458487778cadc7008ac8909/packs/union-1861/situations/virginia_forces_transferred.json#L1) — virginia_forces_transferred | proposed gate.none | classification review |

The exact seven inherited administrative notice paths and exemption claims are listed in [1a](1a.md#gate-items).

## Conflicts from merge-tree

Every row is an actual `git merge-tree --write-tree --name-only <pinned-left> <pinned-right>` result. Exit 0 means textually clean, exit 1 means conflicted. No checkout, merge or conflict resolution was performed. [All 105 commands, exits, trees, complete stdout/stderr](_evidence/merge-tree.json).

| Other tip | Exit | Conflicting files |
|---|---:|---|
| origin/main | 0 | None |
| sprint/1a | 0 | None |
| sprint/audit | 0 | None |
| sprint/checks | 0 | None |
| sprint/people-data | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/perf | 1 | `packages/kernel/src/view/view.ts` |
| sprint/plan-1b | 0 | None |
| sprint/playtest | 0 | None |
| sprint/research-cast | 0 | None |
| sprint/research-foreign-economy | 0 | None |
| sprint/research-gate | 0 | None |
| sprint/research-military | 0 | None |
| sprint/research-politics | 0 | None |
| sprint/situations-1862 | 0 | None |

S29 includes 1a, so their earlier generated-schema conflicts are resolved at this pin; preserve that generated source union. view/view.ts still conflicts with perf, and liveness-gate.ts conflicts with people-data. S29 proves no human Manassas dispatch; the separate automated battle is not substitute evidence. Its appointment table has Butler only, with McDowell/Patterson absent. Pending S33 is outside this packet?s delivered scope.

These are pairwise probes only. A clean pair does not establish a clean cumulative merge, compatible semantics, passing rules/history checks or preservation of signed content. Regenerate generated conflicts with their owning tools; handwritten conflict choices need the owning lane and reviewer.

## Retained validation and open work

S29 reports 22 weekly capture sets, 18 historical bundles, all five identified calls, 72 primary capture/recipe pairs and an exact 83-command public-UI replay checkpoint. Final root hook reports 151 files/1,609 passed/one expected failure/three skips; desk 115 passed/three skips. The final focused continuation exits 1 for missing human Manassas. One default campaign: exit 1, Phase 0 5/6, 1A 4/6, ten timing/pushback/sweep problems. No D6, Linux CI or human-battle clearance.

S32’s own validation receipts are in [README](README.md#s32-validation). That checks this audit worktree and packet integrity; it does not re-execute all branch suites or substitute for Claude’s whole-branch review.

## Findings outside my scope

S29 includes 1a, so their earlier generated-schema conflicts are resolved at this pin; preserve that generated source union. view/view.ts still conflicts with perf, and liveness-gate.ts conflicts with people-data. S29 proves no human Manassas dispatch; the separate automated battle is not substitute evidence. Its appointment table has Butler only, with McDowell/Patterson absent. Pending S33 is outside this packet?s delivered scope. Standing review, lead rulings, separate gate review, cumulative integration, runtime repairs, CI and pushing remain with their owners.
