/**
 * Latency is the kernel's (decision 0026; FOUNDATION section 9). A command
 * applies the day it is issued and creates a message; this module says when
 * it arrives. The shell never computes an arrival, and a seat never sets one.
 *
 * Routes (0032, 0040): in person, wire, courier, a special messenger (a route
 * with a price), mail, rail and ship. Ships use the directional water network's
 * passage rules. Rail messages remain unavailable.
 *
 * Courier and mail carry exogenous noise (roads, weather: decision 0007 allows
 * dice for these, never for people). The draw comes from a stream keyed by
 * the message's own id (decision 0041's pattern), so no other message, report
 * or reading can shift it.
 */
import type { FactionId, MessageId, PostId, RegionId } from '../ids.ts';
import { createStream, nextInt } from '../rng.ts';

export const ROUTE_KINDS = ['courier', 'in-person', 'mail', 'rail', 'ship', 'special-messenger', 'wire'] as const;
export type RouteKind = (typeof ROUTE_KINDS)[number];

/**
 * The routes an order may take, which are exactly the routes a principal's
 * menu offers: the kernel accepts no route it did not offer (review N1). In
 * person would be a visit (its own verb); mail is for returns, not orders;
 * rail and ship wait for Phase 1.
 */
export const ORDER_ROUTES: readonly RouteKind[] = Object.freeze(['courier', 'special-messenger', 'wire']);

/** How long each route takes beside the map's courier days. Every pack states them (`WorldRules.latency`); the kernel has no default (0072). */
export interface LatencyRules {
  /** Entrusted delivery outside the ordinary command chain; no row invents a carrier or a journey. */
  readonly dispatches?: readonly {
    readonly to: PostId;
    readonly carriers: readonly { readonly post: PostId; readonly route: 'courier' | 'ship' }[];
    readonly terms: { readonly boldness: number; readonly honours: readonly string[]; readonly offends: readonly string[] };
    readonly source: string;
  }[];
  /** Documented access to public offices, apart from military ownership; absent permits no exception. */
  readonly publicWires?: readonly { readonly from: RegionId; readonly to: RegionId; readonly faction: FactionId; readonly fromDate: string; readonly throughDate: string; readonly source: string }[];
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

const LATENCY_RULE_NAMES = ['wireDays', 'mailPermille', 'specialMessengerPermille', 'courierNoiseMaxDays', 'specialMessengerPrice'] as const;

export function latencyProblems(rules: LatencyRules): string[] {
  const problems: string[] = [];
  const targets = new Set<string>();
  for (const d of rules.dispatches ?? []) {
    if (targets.has(d.to)) problems.push(`dispatch ${d.to}: duplicate target`);
    targets.add(d.to);
    if (!d.source.trim() || d.carriers.length === 0) problems.push(`dispatch ${d.to}: carriers and a source are required`);
    if (!Number.isSafeInteger(d.terms.boldness) || d.terms.boldness < 0 || d.terms.boldness > 1000) problems.push(`dispatch ${d.to}: boldness must be a permille`);
    const posts = new Set<string>([d.to]);
    for (const c of d.carriers) {
      if (posts.has(c.post)) problems.push(`dispatch ${d.to}: repeated carrier or target ${c.post}`);
      posts.add(c.post);
      if (c.route !== 'courier' && c.route !== 'ship') problems.push(`dispatch ${d.to}: unsupported carrier route`);
    }
  }
  for (const name of LATENCY_RULE_NAMES) {
    const v = rules[name];
    if (!Number.isSafeInteger(v) || v < 0) problems.push(`latency rule ${name} must be a whole number, not negative`);
  }
  if (rules.specialMessengerPermille > 1000) problems.push('a special messenger must not be slower than a courier');
  return problems;
}

/** The map facts latency needs: courier days from the typed edges and the day's wire owners (`seats/world.ts`, `latencyMapFor`). */
export interface LatencyMap {
  /** A naval passage on today's network; absent or null means no water route. */
  shipDays?(from: RegionId, to: RegionId, faction: FactionId): number | null;
  publicWire?(from: RegionId, to: RegionId, faction: FactionId): boolean;
  courierDays(from: RegionId, to: RegionId): number;
  daysToWire(from: RegionId, faction: FactionId): number | null;
  region(id: RegionId): { readonly wireOwner: FactionId | null };
}

export interface Latency {
  /** Whole days from sending to arrival; 0 means the same day. */
  readonly days: number;
  /** How the days were made, for explanation (hard rule 6). */
  readonly parts: readonly { readonly part: string; readonly days: number }[];
}

export type LatencyResult = { readonly ok: true; readonly latency: Latency } | { readonly ok: false; readonly reason: 'route_unavailable' };

/**
 * Days for a message from `from` to `to` by `route`, sent by someone of
 * `faction` (the wire is his side's wire). `noise` names the game seed and
 * message id for the courier's stream; pass null to get the typical
 * (noise-free) figure that a seat may be shown in advance.
 */
export function routeLatency(
  map: LatencyMap,
  rules: LatencyRules,
  route: RouteKind,
  from: RegionId,
  to: RegionId,
  faction: FactionId,
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
      if (map.publicWire?.(from, to, faction)) {
        parts.push({ part: 'public wire', days: rules.wireDays });
        return done();
      }
      const a = map.region(from).wireOwner === faction ? 0 : map.daysToWire(from, faction);
      const b = map.region(to).wireOwner === faction ? 0 : map.daysToWire(to, faction);
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
