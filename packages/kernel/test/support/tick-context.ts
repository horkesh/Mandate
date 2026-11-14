/**
 * A tick context for tests that drive one phase by hand (the map, the
 * contest, stores, proposals), on a seats World built from a map and a start.
 */
import { buildControlIndex } from '../../src/control-index/control-index.ts';
import { createIdMint } from '../../src/messages/transit.ts';
import type { State } from '../../src/root-state.ts';
import { indexSeatsWorld, latencyMapFor, type SeatsWorld } from '../../src/seats/world.ts';
import { createTelemetry } from '../../src/telemetry.ts';
import type { TickContext } from '../../src/tick/context.ts';
import type { WorldIndex } from '../../src/world/index.ts';
import type { ScenarioStart } from '../../src/world/scenario.ts';

/** A seats World over a map and a start (no situations, the stand-in trait inputs). */
export function worldOf(map: WorldIndex, start: ScenarioStart): SeatsWorld {
  return indexSeatsWorld(map, start);
}

export function ctxFor(world: SeatsWorld, state: State, day: number, mechanics: readonly string[] = []): TickContext {
  return {
    world,
    latency: latencyMapFor(world, buildControlIndex(world.map, state.regionControl)),
    day,
    seed: state.gameSeed,
    mint: createIdMint(state),
    telemetry: createTelemetry([...mechanics]),
    outbox: [],
    rejections: [],
    events: [],
    proposals: [],
    prices: [],
    decisionPoints: [],
    controlDeltas: [],
    infrastructureDeltas: [],
    mapEvents: [],
  };
}
