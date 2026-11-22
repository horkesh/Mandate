/** Truth-based passage belongs to delivery, never to the principal's menu projection. */
import { marchSteps, type MarchGround } from '../movement/march.ts';
import { routeLatency, type LatencyMap, type LatencyResult } from './latency.ts';

/** Entrusted ships are a delivery path; they are not a new principal-menu transport order. */
export function dispatchLatency(...args: Parameters<typeof routeLatency>): LatencyResult {
  const [map, , route, from, to, faction] = args;
  if (route !== 'ship') return routeLatency(...args);
  const days = map.shipDays?.(from, to, faction) ?? null;
  return days === null ? { ok: false, reason: 'route_unavailable' } : { ok: true, latency: { days, parts: [{ part: 'ship', days }] } };
}

export function shipLatencyMap(base: LatencyMap, ground: MarchGround): LatencyMap {
  return { ...base, shipDays: (from, to, faction) => {
    if (from === to) return 0;
    const first = marchSteps(ground, from, to, faction, true)[0];
    return first === undefined ? null : Math.ceil((first.leg.daysPermille + first.remainingMilli) / 1000);
  } };
}
