/**
 * Lead ruling, 2026-11-24, S150: exactly three tests use .fails on sprint/allocate only.
 * No merge into sprint/july while any mark remains. These are observations from b2a0c513,
 * not new bands or a waiver; the standalone/hosted done check still reports its failures.
 */
export const JULY_LIVENESS_KNOWN_FAILURE = 'the July armies have not formed; failing floors/bands: '
 + 'combat.battle_closed 1<2, combat.battle_opened 1<2, combat.captured 1<2, combat.killed_wounded 2<5, combat.missing 2<4, seats.battle_orders 4<5; '
 + 'zero floors: combat.flank_broken, combat.general_hit, combat.routed, forces.stragglers_returned, map.pocket_relieved, messages.special_messenger, operations.repulsed, reports.commander_lost; '
 + 'ceilings: movement.arrived 206>86, movement.join_blocked 70>0, movement.leg_started 193>86, operations.opened 11>10, operations.works 16>8, planner.candidates 20>16, planner.searches 20>16, plans.chosen 16>14, plans.drafted 20>16, plans.went_ahead 7>5, reports.battle_dispatch 10>5';

const KNOWN = {
 too_rare: ['combat.battle_closed','combat.battle_opened','combat.captured','combat.killed_wounded','combat.missing','seats.battle_orders'],
 dead: ['combat.flank_broken','combat.general_hit','combat.routed','forces.stragglers_returned','map.pocket_relieved','messages.special_messenger','operations.repulsed','reports.commander_lost'],
 too_frequent: ['movement.arrived','movement.join_blocked','movement.leg_started','operations.opened','operations.works','planner.candidates','planner.searches','plans.chosen','plans.drafted','plans.went_ahead','reports.battle_dispatch'],
} as const;

/** Only the named diagnostic pairs are known; another failure must remain an ordinary failing test. */
export function unexpectedJulyFailures<T extends {mechanic:string;problem:string}>(failures:readonly T[]):T[] {
 return failures.filter(f=>!Object.entries(KNOWN).some(([problem,mechanics])=>f.problem===problem&&(mechanics as readonly string[]).includes(f.mechanic)));
}
