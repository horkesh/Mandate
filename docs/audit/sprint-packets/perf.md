# sprint/perf: review packet

Pinned remote tip: `3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab`. Comparison: `origin/main...origin/sprint/perf` at main `df0cf216e8bba2be74e992922bd8dd0730135456`; merge base `ceff796b3c793ef28e79b5d51d7dfe5a2dfabf39`. Snapshot: 2026-11-21T02:11:37.186520+00:00.

This is navigation for the standing reviewer and the lead under 0106. It is not a verdict, accepted ruling, gate sign-off or permission to merge. Locations below refer to the pinned branch, not to the audit worktree.

## What changes

Contains the older bf6cc66 integration, not the later 78eb7db S1 build/calibration, plus S2/S20/S30 optimizations: report batching, caller-owned immutable-input caches, unposted-roster/force-presence derivations, candidate-graph reuse, report-route holder lookup and one-pass command membership. Each retained optimization has a separate commit; rejected freezer/view/relay/wire/planner candidates are not delivered.

23 commits reachable from the branch but not pinned main; 97 changed paths. Descendants include shared commits; counts across packets must not be added. Immutable [full diff](https://github.com/horkesh/Mandate/compare/df0cf216e8bba2be74e992922bd8dd0730135456...3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab) and [inventory](_evidence/inventory.json). Raw git diff, its command, size and SHA-256 are retained under `_evidence/validation-raw/diffs/` (local, ignored), with the receipt in the inventory.

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
| [`8d44c89f779e`](https://github.com/horkesh/Mandate/commit/8d44c89f779e9214a6135f146855ad25a0c0203d) | Batch consecutive report arrivals to avoid repeated table copies |
| [`a3285d7d1cfd`](https://github.com/horkesh/Mandate/commit/a3285d7d1cfd30d527eed612f2b21dffaed88455) | Reuse the caller's freeze ledger across request graphs |
| [`18029078b663`](https://github.com/horkesh/Mandate/commit/18029078b663e03346e10d81bd7a2caf506c34fd) | Merge northern concentration and sourced calls into sprint/1a |
| [`e76c3348640f`](https://github.com/horkesh/Mandate/commit/e76c3348640fa6b7962fe3932a024a0380e4e131) | Merge bombardment battle records into sprint/1a |
| [`f72c709384e0`](https://github.com/horkesh/Mandate/commit/f72c709384e06d9a3466021fdb827dae66a8b31a) | Merge dated rule-seat appointments into sprint/1a |
| [`df291e653544`](https://github.com/horkesh/Mandate/commit/df291e65354427ce1c50d5730f6824b289be7f1d) | Merge independent initiative threshold into sprint/1a |
| [`fae69bc0a99a`](https://github.com/horkesh/Mandate/commit/fae69bc0a99ad2f410054ad4d83ecfc3eda62e74) | Reuse unchanged opening reports to avoid rebuilding their views |
| [`9d0ad8256e37`](https://github.com/horkesh/Mandate/commit/9d0ad8256e3783bd5176b753c4dd3803d0dcd26e) | Merge bounded assault-contact findings into sprint/1a |
| [`82f817b937c5`](https://github.com/horkesh/Mandate/commit/82f817b937c5cbcf8b379ff5f4dc96ff04058e15) | Derive unposted candidates once per principal menu |
| [`72dfa0df35b9`](https://github.com/horkesh/Mandate/commit/72dfa0df35b94008ade9538c8add717246ec902b) | Derive force presence once for census-region terms |
| [`bf6cc66c025a`](https://github.com/horkesh/Mandate/commit/bf6cc66c025a0567a991f1a94eb9ba20656f4004) | Integrate state-force acts with northern concentration |
| [`e9f7ca0432b9`](https://github.com/horkesh/Mandate/commit/e9f7ca0432b909d701b43ab5309a130e96d2b1d4) | Reuse frozen candidate rosters across mornings |
| [`53657ebb72f9`](https://github.com/horkesh/Mandate/commit/53657ebb72f91fd792da9ffb35abe03a3f869deb) | Merge integrated 1A into performance branch |
| [`e09fe4763d4f`](https://github.com/horkesh/Mandate/commit/e09fe4763d4f245edd0694dc1427173413bcf8dd) | Reuse holder lookups while constructing report routes |
| [`dab3bf13a25e`](https://github.com/horkesh/Mandate/commit/dab3bf13a25ecc9690e3cf32b1dbcfa4bbc5fe43) | Derive force membership once per post list |
| [`3155d90ef0be`](https://github.com/horkesh/Mandate/commit/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab) | Record integrated 1A performance measurements and preservation |

### Files and areas

| Change | Path |
|---|---|
| M | [docs/design/FOUNDATION.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/docs/design/FOUNDATION.md#L1) |
| M | [docs/research/2026-11-14-union-information-flows.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/docs/research/2026-11-14-union-information-flows.md#L1) |
| A | [docs/research/2026-11-20-northern-virginia-concentration.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/docs/research/2026-11-20-northern-virginia-concentration.md#L1) |
| A | [docs/research/_combat/assault-contact-probe.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/docs/research/_combat/assault-contact-probe.md#L1) |
| M | [notes/lane-1.12-rule-seats.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.12-rule-seats.md#L1) |
| M | [notes/lane-1.14-done-check.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.14-done-check.md#L1) |
| M | [notes/lane-1.3-combat.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.3-combat.md#L1) |
| M | [notes/lane-1.5-people-verbs.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.5-people-verbs.md#L1) |
| M | [notes/lane-1.7-men-regions.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.7-men-regions.md#L1) |
| A | [notes/lane-s2-perf.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L1) |
| M | [packages/cli/src/desk/render.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/src/desk/render.ts#L1) |
| M | [packages/cli/src/liveness-gate.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/src/liveness-gate.ts#L1) |
| M | [packages/cli/test/bombardment.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/bombardment.test.ts#L1) |
| A | [packages/cli/test/calls-schedule.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/calls-schedule.test.ts#L1) |
| M | [packages/cli/test/concentration.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/concentration.test.ts#L1) |
| M | [packages/cli/test/fixtures/saves/testbed-seats-day40.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/fixtures/saves/testbed-seats-day40.json#L1) |
| M | [packages/cli/test/men-regions.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/men-regions.test.ts#L1) |
| A | [packages/cli/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/state-forces.test.ts#L1) |
| M | [packages/cli/test/union-opening.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/union-opening.test.ts#L1) |
| M | [packages/cli/test/war-gate.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/cli/test/war-gate.test.ts#L1) |
| M | [packages/kernel/src/combat/battle.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/combat/battle.ts#L1) |
| M | [packages/kernel/src/combat/bombard.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/combat/bombard.ts#L1) |
| M | [packages/kernel/src/combat/records.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/combat/records.ts#L1) |
| M | [packages/kernel/src/combat/shape.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/combat/shape.ts#L1) |
| M | [packages/kernel/src/command/command.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/command/command.ts#L1) |
| M | [packages/kernel/src/command/levies.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/command/levies.ts#L1) |
| M | [packages/kernel/src/forces/enlistment.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/forces/enlistment.ts#L1) |
| M | [packages/kernel/src/knowledge/knowledge.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/knowledge/knowledge.ts#L1) |
| M | [packages/kernel/src/log/commands.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/log/commands.ts#L1) |
| M | [packages/kernel/src/log/log.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/log/log.ts#L1) |
| M | [packages/kernel/src/log/session.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/log/session.ts#L1) |
| M | [packages/kernel/src/messages/latency.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/messages/latency.ts#L1) |
| M | [packages/kernel/src/messages/transit.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/messages/transit.ts#L1) |
| M | [packages/kernel/src/ownership.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/ownership.ts#L1) |
| M | [packages/kernel/src/people/verb-rules.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/people/verb-rules.ts#L1) |
| M | [packages/kernel/src/proxy/responses.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/proxy/responses.ts#L1) |
| M | [packages/kernel/src/regions/self-emancipation.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/regions/self-emancipation.ts#L1) |
| M | [packages/kernel/src/seats/api.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/seats/api.ts#L1) |
| M | [packages/kernel/src/seats/posts.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/seats/posts.ts#L1) |
| M | [packages/kernel/src/seats/requests.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/seats/requests.ts#L1) |
| M | [packages/kernel/src/seats/world.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/seats/world.ts#L1) |
| M | [packages/kernel/src/situations/types.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/situations/types.ts#L1) |
| M | [packages/kernel/src/tick/bombard.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/bombard.ts#L1) |
| M | [packages/kernel/src/tick/context.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/context.ts#L1) |
| M | [packages/kernel/src/tick/deliver.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/deliver.ts#L1) |
| M | [packages/kernel/src/tick/orders.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/orders.ts#L1) |
| M | [packages/kernel/src/tick/people-week.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/people-week.ts#L1) |
| M | [packages/kernel/src/tick/recruitment.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/recruitment.ts#L1) |
| M | [packages/kernel/src/tick/tick.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/tick.ts#L1) |
| M | [packages/kernel/src/tick/verbs.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/verbs.ts#L1) |
| M | [packages/kernel/src/view/view.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/view/view.ts#L1) |
| M | [packages/kernel/src/world/scenario.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/world/scenario.ts#L1) |
| M | [packages/kernel/src/world/world.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/world/world.ts#L1) |
| M | [packages/kernel/test/bombard.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/bombard.test.ts#L1) |
| M | [packages/kernel/test/claimed-control.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/claimed-control.test.ts#L1) |
| A | [packages/kernel/test/command-establishment.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/command-establishment.test.ts#L1) |
| M | [packages/kernel/test/forces-command.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/forces-command.test.ts#L1) |
| M | [packages/kernel/test/people-verbs.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/people-verbs.test.ts#L1) |
| A | [packages/kernel/test/post-membership.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/post-membership.test.ts#L1) |
| A | [packages/kernel/test/principal-candidate-cache.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/principal-candidate-cache.test.ts#L1) |
| A | [packages/kernel/test/report-delivery.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/report-delivery.test.ts#L1) |
| A | [packages/kernel/test/request-freeze.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/request-freeze.test.ts#L1) |
| A | [packages/kernel/test/self-emancipation-lookup.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/self-emancipation-lookup.test.ts#L1) |
| M | [packages/kernel/test/support/map-fixture.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/support/map-fixture.ts#L1) |
| M | [packages/pack-format/schemas/pack.schema.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/schemas/pack.schema.json#L1) |
| M | [packages/pack-format/schemas/situation.schema.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/schemas/situation.schema.json#L1) |
| M | [packages/pack-format/schemas/world.schema.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/schemas/world.schema.json#L1) |
| M | [packages/pack-format/src/schemas.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/src/schemas.ts#L1) |
| M | [packages/pack-format/src/situations.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/src/situations.ts#L1) |
| A | [packages/pack-format/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/test/state-forces.test.ts#L1) |
| M | [packages/pack-format/test/support/fixture.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/test/support/fixture.ts#L1) |
| M | [packages/pack-format/test/validate.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/pack-format/test/validate.test.ts#L1) |
| M | [packages/rule-seats/src/index.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/rule-seats/src/index.ts#L1) |
| M | [packages/rule-seats/test/rule-seats.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/rule-seats/test/rule-seats.test.ts#L1) |
| M | [packs/testbed/data/world.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/testbed/data/world.json#L1) |
| M | [packs/testbed/pack.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/testbed/pack.json#L1) |
| A | [packs/union-1861/calls-1861.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/calls-1861.json#L1) |
| M | [packs/union-1861/data/scenarios/march_1861.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/data/scenarios/march_1861.json#L1) |
| M | [packs/union-1861/data/strings/en.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/data/strings/en.json#L1) |
| M | [packs/union-1861/data/world.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/data/world.json#L1) |
| M | [packs/union-1861/pack.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/pack.json#L1) |
| A | [packs/union-1861/situations/arkansas_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/arkansas_forces_transferred.json#L1) |
| D | `packs/union-1861/situations/butler_at_fort_monroe.json` (removed; inspect retained diff) |
| A | [packs/union-1861/situations/north_carolina_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/north_carolina_forces_transferred.json#L1) |
| A | [packs/union-1861/situations/tennessee_forces_return.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_forces_return.json#L1) |
| A | [packs/union-1861/situations/tennessee_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_forces_transferred.json#L1) |
| A | [packs/union-1861/situations/tennessee_military_league.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_military_league.json#L1) |
| A | [packs/union-1861/situations/virginia_forces_return.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/virginia_forces_return.json#L1) |
| A | [packs/union-1861/situations/virginia_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/virginia_forces_transferred.json#L1) |
| M | [packs/union-1861/source/scenarios/march_1861/temporary_posts.csv:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/source/scenarios/march_1861/temporary_posts.csv#L1) |
| M | [packs/union-1861/strings/en.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/strings/en.json#L1) |
| A | [packs/union-1861/test/butler-appointment.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/test/butler-appointment.test.ts#L1) |
| A | [packs/union-1861/test/calls-1861.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/test/calls-1861.test.ts#L1) |
| A | [packs/union-1861/test/northern-concentration.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/test/northern-concentration.test.ts#L1) |
| M | [packs/union-1861/test/resignation.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/test/resignation.test.ts#L1) |
| A | [packs/union-1861/test/state-forces.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/test/state-forces.test.ts#L1) |
| M | [vitest.config.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/vitest.config.ts#L1) |

## Proposed rulings for the lead

Each number is a source proposal the lead can accept, revise or overturn. Choices and rejected alternatives retain the author’s wording unless marked as S32 unpacking. Status restatements are retained for traceability; they are not additional witnesses. A withdrawn or superseded proposal is labeled by its source and is not silently revived. Where the source supplies no rejected alternative, this packet does not manufacture one.

1. Accept consecutive report batches within the knowledge owner, flushing before every intervening reader. Rejected: changed report cadence/order, dropped reports or in-place State mutation. — [notes/lane-s2-perf.md:487](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L487); hand-over.
2. Accept caller-owned freeze and opening-report caches keyed by immutable inputs. Rejected: global mutable caches or persisted derived data. — [notes/lane-s2-perf.md:488](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L488); hand-over.
3. Park the measured planner caches. Rejected: retaining extra allocation and invalidation code without evidence of a saving. The 40 ms budget, 20 ms unloaded aim and all behavior criteria remain unchanged. — [notes/lane-s2-perf.md:489](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L489); hand-over.
4. Accept the command owner's single-pass unposted roster. Rejected: retaining repeated post/World searches for every person; changing service choices, availability, rank order or menu values. — [notes/lane-s2-perf.md:499](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L499); hand-over.
5. Accept lazy force-presence derivation local to one census-term call. Rejected: repeated neighbor scans, a cross-State presence cache, or changing any term, destination, cadence, gate content or band. — [notes/lane-s2-perf.md:500](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L500); hand-over.
6. Accept only the fully keyed, deeply frozen candidate graph in the caller-owned cache. Rejected: caching a whole morning request, sharing the known-problematic morning view into planning, shallow-freeze shortcuts or persisted derived data. — [notes/lane-s2-perf.md:501](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L501); hand-over.
7. Retain both appointment behavior and the existing candidate optimization, rejecting either-side conflict replacement. Further choices will be recorded with their rejected alternatives after measurement. — [notes/lane-s2-perf.md:215](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L215); hand-over.
8. Accept a command-owned inverse lookup held by the tick caller, keyed by exact post-table identity. Reject module-global caching, caching a person's side/location, persisting derived data, or assuming insertion order for duplicate holders. Reject the freezer candidates for lack of consistent direct benefit. — [notes/lane-s2-perf.md:217](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L217); hand-over.
9. Park the request/view holder extension after its negative direct median; reject retaining extra cache plumbing on intuition alone. Prefer local one-pass command membership for post lists, rejecting a cross-State cache or changed eligibility. — [notes/lane-s2-perf.md:219](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L219); hand-over.
10. Park nearest-wire memoization after negative whole-run paired medians in both slots. Reject accepting a direct-query proxy or unpaired medians instead of the requested estimator; no repeated timing campaign to seek a win. — [notes/lane-s2-perf.md:221](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L221); hand-over.
11. Park the local relay candidate after its negative direct median as well; reject retaining a work-count reduction without a measured runtime benefit. No broader view/cache or planner changes are delivered. — [notes/lane-s2-perf.md:223](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L223); hand-over.
12. Shares the earlier bf6cc66 integration proposals with 1a.md: runner ceiling, appointment contracts, call/transfer representation and parked R93. It does not include the later 78eb7db build/calibration proposals. Review the shared choices once and the later S1 additions separately. — [notes/lane-1.14-done-check.md:3](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.14-done-check.md#L3); inherited coverage.
13. **Proposed rulings:** (1) accept single-pass availability, rejecting repeated person/post searches or altered candidate values; (2) accept a local lazy presence set, rejecting cross-State caching or changed terms/cadence; (3) accept only fully keyed, deeply frozen candidate graphs, rejecting whole-morning/planning-view sharing, shallow-freeze shortcuts or persisted derived data. — CODEX.md:5648 (preserved in the linked status snapshot); S20 author status.
14. **3. Proposed rulings, with rejected alternatives.** Accept the caller-owned inverse holder table, keyed by exact immutable post-table identity, and local one-pass force membership. Reject global/persisted caches, cached service/location, changed post eligibility and insertion-order shortcuts. Park the freezer variants, the general view-holder extension and the local relay candidate after no consistent direct saving; park nearest-wire memoization after negative whole-run paired medians in both slots, despite its direct-query win. Reject using a proxy or unpaired medians to overrule the requested estimator. Every rejected production edit and test is absent from the delivery; evidence is retained. — CODEX.md:5917 (preserved in the linked status snapshot); S30 author status.

### Status and hand-over coverage

| Source | Coverage |
|---|---|
| S2 author status | Original `CODEX.md:5206`, 31 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S20 author status | Original `CODEX.md:5630`, 25 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| S30 author status | Original `CODEX.md:5889`, 37 lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md) |
| [notes/lane-1.12-rule-seats.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.12-rule-seats.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-1.12-rule-seats.md) |
| [notes/lane-1.14-done-check.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.14-done-check.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-1.14-done-check.md) |
| [notes/lane-1.3-combat.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.3-combat.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-1.3-combat.md) |
| [notes/lane-1.5-people-verbs.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.5-people-verbs.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-1.5-people-verbs.md) |
| [notes/lane-1.7-men-regions.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-1.7-men-regions.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-1.7-men-regions.md) |
| [notes/lane-s2-perf.md:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L1) | [Retained hand-over](_evidence/handovers/perf/notes/lane-s2-perf.md) |

## Four review lenses

| Lens | First question and location | Regression evidence / test |
|---|---|---|
| Canon and decisions | Review the integrated ancestry as well as each perf commit. Derived holder/membership/candidate data must remain caller-owned and never persisted. [notes/lane-s2-perf.md:213](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L213) | [packages/kernel/test/post-membership.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/post-membership.test.ts#L1) |
| Determinism | Batch reports only across consecutive reports and flush before every intervening reader. Check exact identity keys, retained older States, duplicates, vacancies and force transfers. [packages/kernel/src/tick/deliver.ts:43](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/src/tick/deliver.ts#L43) | [packages/kernel/test/report-delivery.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/report-delivery.test.ts#L1) |
| History | Preserve inherited signed/pack/calibration inputs and S1’s unresolved dates/unknowns. Performance equality does not prove historical validity. [notes/lane-s2-perf.md:16](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L16) | [packages/kernel/test/self-emancipation-lookup.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/self-emancipation-lookup.test.ts#L1) |
| Realism | The same-day post-identity view-cache bug remains inherited and unresolved. Do not broaden morning-view sharing just because the candidate graph is safely reusable. [notes/lane-s2-perf.md:494](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/notes/lane-s2-perf.md#L494) | [packages/kernel/test/principal-candidate-cache.test.ts:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packages/kernel/test/principal-candidate-cache.test.ts#L1) |

A test link identifies the relevant guard or validation contract, not a claim that S32 ran that branch. Research/design inventories lack a general test for historical truth; compare cited pages and scope/measure sidecars before adoption. Run the required project/hook checks after integration and every behavior-triggered regression.

## Gate items

No new standalone draft. Inherits 1a’s seven administrative gate.none claims. The self-emancipation lookup optimization must preserve every term, cadence and agency path; performance equality is not D6 clearance.

| Draft / item | Topic or classification | Remaining review |
|---|---|---|
| [packs/union-1861/situations/arkansas_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/arkansas_forces_transferred.json#L1) — arkansas_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/north_carolina_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/north_carolina_forces_transferred.json#L1) — north_carolina_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_forces_return.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_forces_return.json#L1) — tennessee_forces_return | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_forces_transferred.json#L1) — tennessee_forces_transferred | proposed gate.none | classification review |
| [packs/union-1861/situations/tennessee_military_league.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/tennessee_military_league.json#L1) — tennessee_military_league | proposed gate.none | classification review |
| [packs/union-1861/situations/virginia_forces_return.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/virginia_forces_return.json#L1) — virginia_forces_return | proposed gate.none | classification review |
| [packs/union-1861/situations/virginia_forces_transferred.json:1](https://github.com/horkesh/Mandate/blob/3155d90ef0be0ee25d9074ad2aa8dc15cabfa9ab/packs/union-1861/situations/virginia_forces_transferred.json#L1) — virginia_forces_transferred | proposed gate.none | classification review |

The seven inherited administrative notices are listed here; current 1a adds the separately reviewed Minnesota remuster claim. The shared pin is bf6cc66, not current 78eb7db.

## Conflicts from merge-tree

Every row is an actual `git merge-tree --write-tree --name-only <pinned-left> <pinned-right>` result. Exit 0 means textually clean, exit 1 means conflicted. No checkout, merge or conflict resolution was performed. [All 105 commands, exits, trees, complete stdout/stderr](_evidence/merge-tree.json).

| Other tip | Exit | Conflicting files |
|---|---:|---|
| origin/main | 0 | None |
| sprint/1a | 1 | `packages/kernel/src/seats/requests.ts` |
| sprint/audit | 0 | None |
| sprint/checks | 0 | None |
| sprint/desk | 1 | `packages/kernel/src/view/view.ts` |
| sprint/people-data | 1 | `packages/cli/src/liveness-gate.ts` |
| sprint/plan-1b | 0 | None |
| sprint/playtest | 0 | None |
| sprint/research-cast | 0 | None |
| sprint/research-foreign-economy | 0 | None |
| sprint/research-gate | 0 | None |
| sprint/research-military | 0 | None |
| sprint/research-politics | 0 | None |
| sprint/situations-1862 | 0 | None |

The older bf6cc66 integration is shared; current 78eb7db is not an ancestor of perf. Preserve the later S1 build/calibration when combining the perf changes. view/view.ts conflicts with desk, and current 1a conflicts in seats/requests.ts where its appointment changes meet the candidate optimization; liveness-gate.ts conflicts with people-data. Pairwise clean checks with the S18 tooling do not resolve its fingerprint/history requirements.

These are pairwise probes only. A clean pair does not establish a clean cumulative merge, compatible semantics, passing rules/history checks or preservation of signed content. Regenerate generated conflicts with their owning tools; handwritten conflict choices need the owning lane and reviewer.

## Retained validation and open work

S30 reports all 268 daily hashes matching its integrated baseline, replay/save/resume equality, and one default run: Phase 0 6/6, 1A 4/6; war/history medians 27.83/26.30 ms. Linux CI and unloaded 20 ms aim remain unestablished. Paired savings are nonadditive; holder lookup has a negative war estimate.

S32’s own validation receipts are in [README](README.md#s32-validation). That checks this audit worktree and packet integrity; it does not re-execute all branch suites or substitute for Claude’s whole-branch review.

## Findings outside my scope

The older bf6cc66 integration is shared; current 78eb7db is not an ancestor of perf. Preserve the later S1 build/calibration when combining the perf changes. view/view.ts conflicts with desk, and current 1a conflicts in seats/requests.ts where its appointment changes meet the candidate optimization; liveness-gate.ts conflicts with people-data. Pairwise clean checks with the S18 tooling do not resolve its fingerprint/history requirements. Standing review, lead rulings, separate gate review, cumulative integration, runtime repairs, CI and pushing remain with their owners.
