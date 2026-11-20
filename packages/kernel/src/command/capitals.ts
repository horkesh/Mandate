/** Capitals are State owned by command; a situation proposes a move to a named region. R48. */
import type { FactionId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { ScenarioStart } from '../world/scenario.ts';

export function initialCapitals(start: ScenarioStart): Readonly<Record<FactionId, RegionId>> {
  return Object.fromEntries(start.factions.flatMap((f) => f.capital === null ? [] : [[f.faction, f.capital]]));
}

export function capitalOf(state: State, side: FactionId): RegionId {
  const region = state.factionCapitals[side];
  if (region === undefined) throw new RangeError(`faction ${side} has no capital`);
  return region;
}

export function moveCapital(state: State, side: FactionId, region: RegionId): State {
  if (capitalOf(state, side) === region) return state;
  return { ...state, factionCapitals: { ...state.factionCapitals, [side]: region } };
}
