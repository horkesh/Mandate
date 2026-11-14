/**
 * Latency is the kernel's (decision 0026; FOUNDATION section 9). A command
 * applies the day it is issued and creates a message; this module says when
 * it arrives. The shell never computes an arrival, and a seat never sets one.
 *
 * Routes (0032, 0040): in person, wire, courier, a special messenger (a route
 * with a price), mail, rail and ship. Rail and ship need the map's typed edges
 * (lane 0.2), so the stand-in map refuses them with a reason.
 *
 * Courier and mail carry exogenous noise (roads, weather: decision 0007 allows
 * dice for these, never for people). The draw comes from a stream keyed by
 * the message's own id (decision 0041's pattern), so no other message, report
 * or reading can shift it.
 */
import type { MessageId, RegionId } from '../ids.ts';
import { createStream, nextInt } from '../rng.ts';

export const ROUTE_KINDS = ['courier', 'in-person', 'mail', 'rail', 'ship', 'special-messenger', 'wire'] as const;
export type RouteKind = (typeof ROUTE_KINDS)[number];

export interface LatencyRules {
  /** Days for a message on the wire between two wired regions. */
  readonly wireDays: number;
  /** Mail against courier, permille (slower: above 1000). */
  readonly mailPermille: number;
  /** A special messenger against courier, permille (faster: below 1000). */
  readonly specialMessengerPermille: number;
  /** Most extra days a courier or the mail can lose to roads and weather. */
  readonly courierNoiseMaxDays: number;
  /** Attention a special messenger costs the sender (priced; charged once attention exists, Phase 1). */
  readonly specialMessengerPrice: number;
}

export const DEFAULT_LATENCY_RULES: LatencyRules = Object.freeze({
  wireDays: 0,
  mailPermille: 2000,
  specialMessengerPermille: 500,
  courierNoiseMaxDays: 1,
  specialMessengerPrice: 1,
});

export function latencyProblems(rules: LatencyRules): string[] {
  const problems: string[] = [];
  for (const [name, v] of Object.entries(rules)) {
    if (!Number.isSafeInteger(v) || (v as number) < 0) problems.push(`latency rule ${name} must be a whole number, not negative`);
  }
  if (rules.specialMessengerPermille > 1000) problems.push('a special messenger must not be slower than a courier');
  return problems;
}

/** The map facts latency needs (the stand-in `IndexedWorld` provides them; lane 0.2's graph will too). */
export interface LatencyMap {
  courierDays(from: RegionId, to: RegionId): number;
  daysToWire(from: RegionId): number | null;
  region(id: RegionId): { readonly wired: boolean };
}

export interface Latency {
  /** Whole days from sending to arrival; 0 means the same day. */
  readonly days: number;
  /** How the days were made, for explanation (hard rule 6). */
  readonly parts: readonly { readonly part: string; readonly days: number }[];
}

export type LatencyResult = { readonly ok: true; readonly latency: Latency } | { readonly ok: false; readonly reason: 'route_unavailable' };

/**
 * Days for a message from `from` to `to` by `route`. `noise` names the game
 * seed and message id for the courier's stream; pass null to get the typical
 * (noise-free) figure that a seat may be shown in advance.
 */
export function routeLatency(
  map: LatencyMap,
  rules: LatencyRules,
  route: RouteKind,
  from: RegionId,
  to: RegionId,
  noise: { readonly seed: number; readonly message: MessageId } | null,
): LatencyResult {
  const courier = map.courierDays(from, to);
  const parts: { part: string; days: number }[] = [];
  const done = (): LatencyResult => ({ ok: true, latency: { days: parts.reduce((s, p) => s + p.days, 0), parts } });
  const roads = (base: number): void => {
    parts.push({ part: 'roads', days: base });
    if (noise !== null && base > 0 && rules.courierNoiseMaxDays > 0) {
      const extra = nextInt(createStream(noise.seed, `courier/${noise.message}`), rules.courierNoiseMaxDays + 1);
      if (extra > 0) parts.push({ part: 'weather', days: extra });
    }
  };
  switch (route) {
    case 'in-person':
      // In the same region a word is passed at once; elsewhere the bearer rides.
      if (courier > 0) roads(courier);
      return done();
    case 'courier':
      roads(courier);
      return done();
    case 'mail':
      roads(Math.trunc((courier * rules.mailPermille) / 1000));
      return done();
    case 'special-messenger':
      // Picked men on the best horses: faster, and they do not wait for the weather.
      parts.push({ part: 'messenger', days: Math.trunc((courier * rules.specialMessengerPermille) / 1000) });
      return done();
    case 'wire': {
      const a = map.region(from).wired ? 0 : map.daysToWire(from);
      const b = map.region(to).wired ? 0 : map.daysToWire(to);
      // Off the wire at either end, the message rides to the nearest office first; if that is no
      // quicker than a courier, it goes by courier.
      if (a === null || b === null || a + b + rules.wireDays >= courier) {
        roads(courier);
        return done();
      }
      if (a > 0) parts.push({ part: 'to the wire', days: a });
      parts.push({ part: 'wire', days: rules.wireDays });
      if (b > 0) parts.push({ part: 'from the wire', days: b });
      return done();
    }
    case 'rail':
    case 'ship':
      return { ok: false, reason: 'route_unavailable' };
  }
}
