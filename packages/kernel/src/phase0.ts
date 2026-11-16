/**
 * The Phase 0 kernel's seats layer (lane 0.6), exported as the `phase0`
 * namespace from the package index while the M2 kernel still owns names such
 * as `viewFor`, `Message` and `Post`. When M2 retires the namespace flattens.
 *
 * The shell (the CLI runners) uses this; player-facing code and seats use
 * only `@mandate/kernel/seat-api`.
 */
export type { State } from './root-state.ts';
export * from './knowledge/report.ts';
export * from './knowledge/templates.ts';
export * from './knowledge/truth.ts';
export * from './knowledge/knowledge.ts';
export * from './knowledge/beliefs.ts';
export * from './messages/latency.ts';
export * from './messages/transit.ts';
export * from './plans/goal.ts';
export * from './plans/plans.ts';
export * from './operations/operations.ts';
export * from './operations/rules.ts';
export * from './tick/operations.ts';
export * from './tick/support.ts';
export * from './tick/plans.ts';
export { goalOf, editOf } from './tick/orders.ts';
export { goalStatus } from './tick/generate.ts';
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
export * from './combat/battle.ts';
export * from './combat/decide.ts';
export * from './combat/records.ts';
export * from './combat/resolve.ts';
export * from './combat/rules.ts';
export * from './combat/shape.ts';
// Close-out (0072): the start's fortification (`regions`) and ranks (`people`).
export * from './regions/regions.ts';
export * from './people/ranks.ts';
// Lane 1.1: people as State, their trait inputs and rules; reading orders on the new State; responses (`proxy`).
export * from './people/people.ts';
export * from './people/rules.ts';
export * from './people/traits.ts';
export * from './reading/orders.ts';
export * from './proxy/responses.ts';
