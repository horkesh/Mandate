import type { SeatsWorld } from '../../src/seats/world.ts';
import type { RuleSeatRules } from '../../src/world/world.ts';

/** The same seats World with other war flag rows (a test builds the bad rows the pack validator would refuse). */
export function atWarWorld(world: SeatsWorld, warFlags: RuleSeatRules['warFlags']): SeatsWorld {
  const rules = { ...world.map.world.rules, ruleSeats: { ...world.map.world.rules.ruleSeats, warFlags } };
  return { ...world, map: { ...world.map, world: { ...world.map.world, rules } } };
}
