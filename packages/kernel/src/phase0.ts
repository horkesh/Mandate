/**
 * The Phase 0 kernel's seats layer (lane 0.6), exported as the `phase0`
 * namespace from the package index while the M2 kernel still owns names such
 * as `viewFor`, `Message` and `Post`. When M2 retires the namespace flattens.
 *
 * The shell (the CLI runners) uses this; player-facing code and seats use
 * only `@mandate/kernel/seat-api`.
 */
export type { State } from './root-state.ts';
export * from './standin/traits.ts';
export * from './knowledge/report.ts';
export * from './knowledge/templates.ts';
export * from './knowledge/truth.ts';
export * from './knowledge/knowledge.ts';
export * from './knowledge/beliefs.ts';
export * from './messages/latency.ts';
export * from './messages/transit.ts';
export * from './plans/goal.ts';
export * from './plans/standing.ts';
export * from './seats/world.ts';
export * from './seats/posts.ts';
export * from './seats/api.ts';
export * from './seats/seats.ts';
export * from './seats/requests.ts';
export * from './view/types.ts';
export * from './view/view.ts';
export * from './log/commands.ts';
export * from './log/log.ts';
export * from './log/session.ts';
export * from './tick/context.ts';
export * from './tick/freeze.ts';
export * from './tick/setup.ts';
export * from './tick/tick.ts';
export * from './tick/map.ts';
// Lane 0.4: control, the control index, supply and the invariant barrier.
export * from './control/control.ts';
export * from './control-index/control-index.ts';
export * from './control-index/derived.ts';
export * from './supply/supply.ts';
export * from './invariants/map.ts';
// Lane 0.7: situations.
export * from './situations/types.ts';
export * from './situations/conditions.ts';
export * from './situations/references.ts';
export * from './situations/situations.ts';
export * from './tick/situations.ts';
// Lane 0.5: forces, command and movement.
export * from './forces/forces.ts';
export * from './command/command.ts';
export * from './movement/movement.ts';
export * from './movement/march.ts';
export * from './forces/stores.ts';
export * from './infrastructure/infrastructure.ts';
export * from './tick/forces.ts';
export * from './tick/passage.ts';
export * from './combat/contest.ts';
