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
export * from './world/consultations.ts';
export * from './knowledge/confidence.ts';
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
export * from './view/claimed-control.ts';
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
export * from './people/resignation.ts';
export * from './people/traits.ts';
// Lane 1.5: the people verbs, attention, the ladder, the audience, observers, the weekly people step.
export * from './people/verb-rules.ts';
export * from './seats/attention.ts';
export * from './ladder/ladder.ts';
export * from './audience/audience.ts';
export * from './command/observers.ts';
export * from './tick/verbs.ts';
export * from './tick/people-week.ts';
export * from './tick/attention.ts';
export * from './reading/orders.ts';
export * from './proxy/responses.ts';
// Lane 1.7: men and regions: enlistments, levies, recruitment's phase and rules, loyalty, the derived self-emancipation term.
export * from './forces/enlistment.ts';
export * from './command/levies.ts';
export * from './recruitment/rules.ts';
export * from './tick/recruitment.ts';
export * from './regions/self-emancipation.ts';
export * from './tick/regions.ts';
// Lane 1.6: politics: blocs, the chambers and the ledger, framing, the mandate and credibility, the press, its phase.
export * from './politics/politics.ts';
export * from './politics/rules.ts';
export * from './politics/press.ts';
export * from './tick/politics.ts';
// Lane 1.13: the console's preview of an arrow edit before it is sent (lane 0.9's finding 5).
export * from './tick/edit-preview.ts';

// 0108: commander-owned local acts, kept outside the presidential seat API.
export { organise, type OrganisationResult } from './tick/organisation.ts';
export { closeFormationPost } from './command/organisation.ts';
