/**
 * 1A's history run and what it is scored on (FOUNDATION sections 11 and 12; lane 1.14, Part A: the harness).
 *
 * The history run plays a pack from its start to its last checkpoint date with the pack's own peace and war (never
 * the labelled `--at-war`), every seat on the rules model. An observer reads each day's tick result, never writing:
 * the battles and operations as they stand, each addressee's answer as it is recorded, the holder of each region a
 * checkpoint names, and on each checkpoint's date the sides, the men and the holders. The scorers are pure functions of
 * those observations and the pack's bands (`checkpoints.json`), so every one has a positive control.
 *
 * Bands come from a research lane before any run and are never fitted from one; today's main may fail some, and the
 * point is that the check measures.
 */
import { phase0, world as w } from '@mandate/kernel';
import type { Checkpoint, Checkpoints, PushbackBand } from '@mandate/pack-format';

/** The day number of an ISO date, counting the start date as day 0. */
export function dayOfDate(startDate: string, date: string): number {
  return w.daysFromCivil(w.parseIsoDate(date)) - w.daysFromCivil(w.parseIsoDate(startDate));
}

/** The last day any band reads: how long the history run plays. */
export function historyDays(c: Checkpoints, startDate: string): number {
  const dates = [...c.checkpoints.map((k) => k.date), ...c.pushback.map((p) => p.through)];
  return Math.max(1, ...dates.map((d) => dayOfDate(startDate, d)));
}

export interface Snapshot {
  readonly day: number;
  /** Each department's side (null: neutral). */
  readonly sides: Readonly<Record<string, string | null>>;
  /** Each department's kind (the World's), which a `side-set` counts by. */
  readonly kinds: Readonly<Record<string, string>>;
  /** Each faction's men in blocks of known strength, and its blocks of unknown strength. */
  readonly men: Readonly<Record<string, { readonly known: number; readonly unknownBlocks: number }>>;
  /** The holder of each region a `held` checkpoint names (null: nobody holds it). */
  readonly holders: Readonly<Record<string, string | null>>;
}

export interface ObservedOperation {
  readonly record: phase0.OperationRecord;
  /** Its post's side when it was first seen. */
  readonly faction: string | null;
}

export interface ObservedResponse {
  readonly key: string;
  readonly actual: string;
  readonly day: number;
}

export interface Observations {
  /** Every battle seen, as it last stood. */
  readonly battles: ReadonlyMap<string, phase0.BattleRecord>;
  readonly operations: ReadonlyMap<string, ObservedOperation>;
  /** Addressees' answers, once per order, man and rung. */
  readonly responses: readonly ObservedResponse[];
  readonly snapshots: ReadonlyMap<number, Snapshot>;
  /** For each `held` checkpoint, the days its region was not held by its faction. */
  readonly notHeld: ReadonlyMap<string, readonly number[]>;
  /** `floor_unpaid:<row>` records (0082), by day. */
  readonly unpaidFloors: readonly { readonly day: number; readonly rule: string }[];
  /** Each faction's war: the day its war flag was set, or null at peace, as the last day observed stood. */
  readonly warSince: Readonly<Record<string, number | null>>;
  readonly lastDay: number;
}

/** A read-only observer of a run: give `onTick` to the runner, then read `observations()`. */
export function observeRun(c: Checkpoints | null, startDate: string): { readonly onTick: (world: phase0.SeatsWorld, r: phase0.TickResult) => void; readonly observations: () => Observations } {
  const snapshotDays = new Set((c?.checkpoints ?? []).map((k) => dayOfDate(startDate, k.date)));
  const held = (c?.checkpoints ?? []).filter((k): k is Extract<Checkpoint, { kind: 'held' }> => k.kind === 'held');
  const battles = new Map<string, phase0.BattleRecord>();
  const operations = new Map<string, ObservedOperation>();
  const responses: ObservedResponse[] = [];
  const seenResponses = new Set<string>();
  const snapshots = new Map<number, Snapshot>();
  const notHeld = new Map<string, number[]>(held.map((k) => [k.id, []]));
  const unpaidFloors: { day: number; rule: string }[] = [];
  let warSince: Record<string, number | null> = {};
  let lastDay = 0;
  const onTick = (world: phase0.SeatsWorld, r: phase0.TickResult) => {
    const { state, map } = r;
    lastDay = r.day;
    for (const [id, b] of Object.entries(state.battleRecords)) battles.set(id, b);
    for (const [id, op] of Object.entries(state.operationRecords)) {
      const seen = operations.get(id);
      const post = state.postStates[op.opPost];
      const faction = seen?.faction ?? (post === undefined ? null : phase0.departmentSide(state, post.postDepartment));
      operations.set(id, { record: op, faction });
    }
    for (const [key, resp] of Object.entries(state.orderResponses)) {
      if (resp.respRole !== 'addressee' || resp.respDay !== r.day) continue;
      const k = `${key}|${resp.respActual}`;
      if (seenResponses.has(k)) continue;
      seenResponses.add(k);
      responses.push({ key, actual: resp.respActual, day: r.day });
    }
    for (const e of r.events) {
      if (e.event !== 'policy_unpaid') continue;
      for (const t of e.terms) if (t.termRule !== null && t.termRule.startsWith('floor_unpaid:')) unpaidFloors.push({ day: r.day, rule: t.termRule });
    }
    const holder = (region: string): string | null => (map?.index.holdings as ReadonlyMap<string, { readonly holder: string | null }> | undefined)?.get(region)?.holder ?? null;
    for (const k of held) if (holder(k.region) !== k.faction && r.day <= dayOfDate(startDate, k.date)) notHeld.get(k.id)!.push(r.day);
    warSince = Object.fromEntries(world.factionIds.map((f) => [f, phase0.warSince(world, state, f)]));
    if (snapshotDays.has(r.day)) {
      const sides: Record<string, string | null> = {};
      for (const [d, f] of Object.entries(state.departmentFactions)) sides[d] = f;
      const kinds: Record<string, string> = {};
      for (const d of world.map.world.departments) kinds[d.id] = d.kind;
      const men: Record<string, { known: number; unknownBlocks: number }> = {};
      for (const f of world.map.world.factions) men[f.id] = { known: 0, unknownBlocks: 0 };
      for (const block of Object.values(state.forceBlockStates)) {
        const side = phase0.departmentSide(state, block.fbDepartment);
        if (side === null || men[side] === undefined) continue;
        if (block.fbStrength === null) men[side]!.unknownBlocks += 1;
        else men[side]!.known += block.fbStrength;
      }
      const holders: Record<string, string | null> = {};
      for (const k of held) holders[k.region] = holder(k.region);
      snapshots.set(r.day, { day: r.day, sides, kinds, men, holders });
    }
  };
  return { onTick, observations: () => ({ battles, operations, responses, snapshots, notHeld, unpaidFloors, warSince, lastDay }) };
}

/** The operations that fought a battle by `day`: a battle its post caused, opened while the operation ran. */
export function operationsFought(obs: Observations, day: number): { readonly id: string; readonly op: ObservedOperation; readonly battle: string }[] {
  const out: { id: string; op: ObservedOperation; battle: string }[] = [];
  const battles = [...obs.battles.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  for (const [id, op] of [...obs.operations.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const r = op.record;
    const hit = battles.find(([, b]) => b.battleStartDay <= day && b.battleCauses.includes(r.opPost) && b.battleStartDay >= r.opStartDay && (r.opEndDay === null || b.battleStartDay <= r.opEndDay));
    if (hit !== undefined) out.push({ id, op, battle: hit[0] });
  }
  return out;
}

export interface Scored {
  readonly problems: readonly string[];
  readonly evidence: readonly string[];
}

const list = (xs: readonly string[]): string => (xs.length === 0 ? 'none' : xs.join(', '));

/** One checkpoint against the run's observations. */
export function checkpointScore(k: Checkpoint, obs: Observations, startDate: string): Scored {
  const day = dayOfDate(startDate, k.date);
  const at = `${k.id} (${k.date}, day ${day})`;
  const snap = obs.snapshots.get(day);
  if (snap === undefined) return { problems: [`${at}: the run did not reach the checkpoint (it ended on day ${obs.lastDay})`], evidence: [] };
  switch (k.kind) {
    case 'side-set': {
      const exactly: readonly string[] = k.exactly;
      const on = Object.entries(snap.sides).filter(([, f]) => f === k.faction).map(([d]) => d);
      const extra = on.filter((d) => !exactly.includes(d) && k.departmentKinds.includes(snap.kinds[d] ?? '')).sort();
      const missing = exactly.filter((d) => !on.includes(d)).sort();
      const problems: string[] = [];
      if (extra.length > 0) problems.push(`${at}: on the ${k.faction} side beyond the band: ${list(extra)}`);
      if (missing.length > 0) problems.push(`${at}: not on the ${k.faction} side: ${list(missing)}`);
      return { problems, evidence: [`${at}: ${k.exactly.length - missing.length} of ${k.exactly.length} on the ${k.faction} side${extra.length > 0 ? `, and ${extra.length} more` : ''}`] };
    }
    case 'government-side': {
      const want = k.side ?? 'neutral';
      if (k.departments.length === 0) return { problems: [`${at}: no government in the pack stands for ${k.name} (a data gap: the band is ${want})`], evidence: [] };
      const wrong = k.departments.filter((d) => (snap.sides[d] ?? null) !== k.side).map((d) => `${d} is ${snap.sides[d] ?? 'neutral'}`);
      return { problems: wrong.length > 0 ? [`${at}: ${k.name} should be ${want}: ${list(wrong)}`] : [], evidence: [`${at}: ${k.name} is ${k.departments.map((d) => snap.sides[d] ?? 'neutral').join('/')} (band ${want})`] };
    }
    case 'held': {
      const holder = snap.holders[k.region] ?? null;
      const problems: string[] = [];
      if (holder !== k.faction) problems.push(`${at}: ${k.region} is held by ${holder ?? 'nobody'}, not ${k.faction}`);
      const lost = obs.notHeld.get(k.id) ?? [];
      if (k.throughout && lost.length > 0) problems.push(`${at}: ${k.region} was not held by ${k.faction} on ${lost.length} days (first day ${lost[0]})`);
      return { problems, evidence: [`${at}: ${k.region} held by ${holder ?? 'nobody'}${k.throughout ? `; not held by ${k.faction} on ${lost.length} days` : ''}`] };
    }
    case 'men': {
      const m = snap.men[k.faction] ?? { known: 0, unknownBlocks: 0 };
      const band = `${k.min}..${k.max ?? 'no upper bound'}`;
      const problems: string[] = [];
      const evidence = [`${at}: ${k.faction} ${m.known} men of known strength, ${m.unknownBlocks} blocks of unknown strength (band ${band})`];
      if (m.known < k.min) {
        if (k.floorBinding) problems.push(`${at}: ${k.faction} has ${m.known} men, below ${k.min}`);
        else evidence.push(`${at}: below the lower edge, reported and not failed (the band's floor is not binding: no primary return bounds it)`);
      }
      if (k.max !== null && m.known > k.max) problems.push(`${at}: ${k.faction} has ${m.known} men, above ${k.max}`);
      return { problems, evidence };
    }
    case 'operations-fought': {
      const fought = operationsFought(obs, day).filter((o) => o.op.faction === k.faction);
      const n = fought.length;
      const band = `${k.min}..${k.max ?? 'no upper bound'}`;
      const problems: string[] = [];
      if (n < k.min) problems.push(`${at}: ${k.faction} fought ${n} planned operations, below ${k.min}`);
      if (k.max !== null && n > k.max) problems.push(`${at}: ${k.faction} fought ${n} planned operations, above ${k.max}`);
      return { problems, evidence: [`${at}: ${k.faction} fought ${n} planned operations (band ${band})${n > 0 ? `: ${fought.map((o) => `${o.id} at ${o.op.record.opObjective ?? 'its ground'}`).join(', ')}` : ''}`] };
    }
  }
}

/** Every checkpoint, and each side's war flag set by its own government's decision with no `--at-war` (0066). */
export function checkpointsScore(c: Checkpoints, obs: Observations, startDate: string, atWar: boolean): Scored {
  const problems: string[] = [];
  const evidence: string[] = [];
  for (const k of c.checkpoints) {
    const s = checkpointScore(k, obs, startDate);
    problems.push(...s.problems);
    evidence.push(...s.evidence);
  }
  if (atWar) problems.push('the history run was started at war by the labelled option; each side’s war flag must be set by its own government’s decision (0066)');
  for (const [f, since] of Object.entries(obs.warSince)) {
    if (since === null) problems.push(`${f} is not at war by day ${obs.lastDay}: no decision of its government set its war flag (0066)`);
    else evidence.push(`${f} at war since day ${since}`);
  }
  return { problems, evidence };
}

/**
 * At least one operation drafted by the kernel planner, chosen by its commander's seat, approved, executed and fought with
 * the battle model, with a breakdown. An operation exists only for an approved plan the planner drafted and its
 * commander chose, so the test is an operation that fought a battle whose losses come with their terms.
 */
export function operationScore(obs: Observations): Scored {
  const fought = operationsFought(obs, obs.lastDay);
  if (fought.length === 0) return { problems: [`no operation fought a battle in the history run (${obs.operations.size} operations, ${obs.battles.size} battles)`], evidence: [] };
  const withBreakdown = fought.filter((o) => {
    const b = obs.battles.get(o.battle)!;
    return b.battleDays.length > 0 && b.battleDays.every((d) => d.bdaySides.every((s) => s.bsideKwParts.reduce((n, t) => n + t.btermValue, 0) === s.bsideKw));
  });
  const problems = withBreakdown.length === 0 ? ['no fought operation’s battle carries a loss breakdown whose parts sum to its losses'] : [];
  return { problems, evidence: fought.map((o) => `${o.id} (${o.op.faction ?? 'no side'}, ${o.op.record.opMethod}) fought battle ${o.battle}`) };
}

/** How often a pushback band's kind fired through its date: a mechanic's fires by day, or the addressees' answers on a rung. */
export function pushbackCount(p: PushbackBand, obs: Observations, daily: readonly { readonly day: number; readonly fires: Readonly<Record<string, number>> }[], startDate: string): number {
  const through = dayOfDate(startDate, p.through);
  if ('mechanic' in p.count) {
    const m = p.count.mechanic;
    return daily.filter((d) => d.day <= through).reduce((n, d) => n + (d.fires[m] ?? 0), 0);
  }
  const rung = p.count.response;
  return obs.responses.filter((r) => r.actual === rung && r.day <= through).length;
}

export function pushbackScore(c: Checkpoints, obs: Observations, daily: readonly { readonly day: number; readonly fires: Readonly<Record<string, number>> }[], startDate: string, declared: ReadonlySet<string>): Scored {
  const problems: string[] = [];
  const evidence: string[] = [];
  for (const p of c.pushback) {
    if ('mechanic' in p.count && !declared.has(p.count.mechanic)) {
      problems.push(`${p.name}: counts ${p.count.mechanic}, which no mechanic declares`);
      continue;
    }
    const n = pushbackCount(p, obs, daily, startDate);
    const band = `${p.min}..${p.max ?? 'no upper bound'}`;
    evidence.push(`${p.name}: ${n} (band ${band})`);
    if (n < p.min) problems.push(`${p.name}: ${n}, below the record's ${p.min}`);
    if (p.max !== null && n > p.max) problems.push(`${p.name}: ${n}, above ${p.max}`);
  }
  return { problems, evidence };
}

/** No block fights with unknown strength: every battle record lists none unknown (risk 5). */
export function unknownStrengthScore(runs: readonly { readonly name: string; readonly battles: ReadonlyMap<string, phase0.BattleRecord> }[]): Scored {
  const problems: string[] = [];
  const evidence: string[] = [];
  for (const run of runs) {
    let days = 0;
    for (const [id, b] of [...run.battles.entries()].sort(([a], [c]) => (a < c ? -1 : a > c ? 1 : 0))) {
      for (const d of b.battleDays) {
        days += 1;
        for (const s of d.bdaySides) {
          if (s.bsideUnknown.length > 0) problems.push(`${run.name}: battle ${id} at ${b.battleRegion}, day ${d.bdayDay}: ${s.bsideFaction} fought with ${s.bsideUnknown.length} blocks of unknown strength (${s.bsideUnknown.slice(0, 4).join(', ')}${s.bsideUnknown.length > 4 ? ', ...' : ''})`);
        }
      }
    }
    evidence.push(`${run.name}: ${run.battles.size} battles, ${days} battle-days read`);
  }
  return { problems, evidence };
}
