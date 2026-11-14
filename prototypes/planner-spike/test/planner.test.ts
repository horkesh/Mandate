import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalHash, ids, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { applyEdit, concretePlan, respond } from '../src/edits.ts';
import { unionSizeInput } from '../src/measure.ts';
import { draft, pick } from '../src/planner.ts';
import { CASES, inputFor, SEATINGS } from '../src/testbed-cases.ts';
import type { Candidate, DraftSet } from '../src/types.ts';

/**
 * Lane 0.9's spike checks (brief section 4; planner-design "Measure"): every
 * case drafts at least two distinct candidates with explained scores, the
 * three cases behave as a commander of each kind would, each edit of the 0026
 * grammar applies and re-scores, and the output is deterministic.
 */
const [PINCER, SUPPLY, NAVAL] = CASES as [(typeof CASES)[0], (typeof CASES)[0], (typeof CASES)[0]];
const R = (id: string) => ids.toId('region', id);
const seat = (label: string) => SEATINGS.find((s) => s.label.startsWith(label))!;
const drafted = (spec: (typeof CASES)[0], label: string, extra = {}) => {
  const s = seat(label);
  const input = inputFor(spec, s.person, { ...s.seating, ...extra });
  return { input, set: draft(input) };
};
const all = (): { name: string; set: DraftSet }[] =>
  CASES.flatMap((spec) => SEATINGS.flatMap((s) => [1000, 2000].map((bias) => ({ name: `${spec.name} / ${s.label} / ${bias}`, set: draft(inputFor(spec, s.person, { ...s.seating, sourceBias: bias })) }))));

describe('every case drafts distinct, explained candidates', () => {
  it('gives at least two distinct candidates per case and seating, a holding action always among them', () => {
    for (const { name, set } of all()) {
      expect(set.candidates.length, name).toBeGreaterThanOrEqual(2);
      expect(new Set(set.candidates.map((c) => c.id)).size, name).toBe(set.candidates.length);
      expect(set.candidates.some((c) => c.method === 'holding'), name).toBe(true);
    }
  });

  it('gives at least two distinct moving plans in each case for some seating', () => {
    for (const spec of CASES) {
      const best = Math.max(...SEATINGS.map((s) => draft(inputFor(spec, s.person, s.seating)).candidates.filter((c) => c.method !== 'holding').length));
      expect(best, spec.name).toBeGreaterThanOrEqual(2);
    }
  });

  it('makes every score exactly the sum of its typed terms (hard rule 6)', () => {
    for (const { name, set } of all()) {
      for (const c of set.candidates) {
        expect(c.score, `${name} ${c.id}`).toBe(c.contributions.reduce((s, t) => s + t.amount, 0));
        for (const t of c.contributions) expect(Number.isSafeInteger(t.amount) && t.why.length > 0, `${c.id} ${t.term}`).toBe(true);
      }
    }
  });

  it('reports every gate of every rejected method, never an empty rejection', () => {
    for (const { name, set } of all()) for (const r of set.rejected) expect(r.gates.length, `${name} ${r.method}/${r.variant}`).toBeGreaterThan(0);
    // A low-competence man is refused the pincer for that reason, alongside any other.
    const { set } = drafted(SUPPLY, 'appointee');
    const pincer = set.rejected.find((r) => r.method === 'pincer' && r.variant === 'with_partner')!;
    expect(pincer.gates.map((g) => g.kind)).toEqual(['max_axes', 'staging_not_adjacent', 'staging_not_adjacent']);
  });

  it('keeps every quantity an integer: days in permille, scores in permille, strengths in men', () => {
    for (const { set } of all()) {
      for (const c of set.candidates) {
        for (const a of c.axes) {
          for (const n of [a.arrivalPermille, a.outOfSupplyPermille, a.strength, a.route.costPermille, ...a.phases.flatMap((p) => [p.startPermille, p.daysPermille])]) expect(Number.isSafeInteger(n)).toBe(true);
        }
      }
    }
  });
});

describe('case 1: a two-commander pincer round the salient', () => {
  it('drafts a pincer for a competent man, with a support request to the other army and an arrival window', () => {
    const { set } = drafted(PINCER, 'fighter');
    const p = set.candidates.find((c) => c.method === 'pincer' && c.variant === 'with_partner')!;
    expect(p.axes.map((a) => [a.post, a.route.from, a.route.to])).toEqual([
      ['n_army_west', 'n_west_front', 'salient_tip'],
      ['n_army_east', 'n_east_front', 'salient_tip'],
    ]);
    const req = p.requests.find((r) => r.kind === 'cooperating_axis')!;
    expect(req).toMatchObject({ to: 'n_army_east', holder: 'n_organiser', from: 'n_east_front', objective: 'salient_tip' });
    if (req.kind === 'cooperating_axis') expect(p.axes[1]!.arrivalPermille).toBeGreaterThanOrEqual(req.arriveFromPermille);
  });

  it('refuses the pincer to a man who cannot run two axes, and names why', () => {
    const { set } = drafted(PINCER, 'appointee');
    expect(set.candidates.some((c) => c.method === 'pincer')).toBe(false);
    expect(set.rejected.find((r) => r.variant === 'with_partner')!.gates[0]!.kind).toBe('max_axes');
  });

  it('makes the pincer his pick when his intelligence overstates the enemy enough that one army is too few', () => {
    expect(pick(drafted(PINCER, 'steady', { sourceBias: 1000 }).set).method).toBe('direct');
    expect(pick(drafted(PINCER, 'steady', { sourceBias: 2000 }).set).method).toBe('pincer');
  });

  it('has the timid man hold and ask the principal for men rather than attack', () => {
    const { set } = drafted(PINCER, 'organiser');
    expect(pick(set).method).toBe('holding');
    const attack = set.candidates.find((c) => c.method === 'direct')!;
    expect(attack.requests[0]).toMatchObject({ kind: 'reinforcement', to: 'principal' });
    expect(attack.conditions.map((g) => g.kind)).toContain('move_when_reinforced');
  });
});

describe('case 2: a supply-aware route', () => {
  it('has the steady man march in depot steps, and the bold man take the overextended direct road', () => {
    const steady = pick(drafted(SUPPLY, 'steady').set);
    expect(steady.method).toBe('supply_line');
    expect(steady.axes[0]!.phases.map((p) => p.kind)).toContain('depot_step');
    const bold = drafted(SUPPLY, 'fighter').set;
    expect(pick(bold).method).toBe('direct');
    expect(pick(bold).axes[0]!.outOfSupplyPermille).toBeGreaterThan(steady.axes[0]!.outOfSupplyPermille);
  });

  it('offers a longer flank over the mountains, within the packâ€™s limit, and never one that doubles back through his own rear', () => {
    const { input, set } = drafted(SUPPLY, 'fighter');
    const direct = set.candidates.find((c) => c.method === 'direct')!;
    const flank = set.candidates.find((c) => c.method === 'flank')!;
    expect(flank.axes[0]!.route.legs.map((l) => l.to)).toEqual(['w_valley', 's_west_hills', 's_heartland']);
    expect(flank.axes[0]!.route.daysPermille).toBeGreaterThan(direct.axes[0]!.route.daysPermille);
    expect(flank.axes[0]!.route.daysPermille * 1000).toBeLessThanOrEqual(direct.axes[0]!.route.daysPermille * input.rules.flankLengthMax);
    const timid = drafted(SUPPLY, 'organiser').set;
    expect(timid.rejected.find((r) => r.method === 'flank')!.gates.map((g) => g.detail)).toContain('alternative doubles back through n_railhead');
  });
});

describe('case 3: a small joint naval relief', () => {
  it('relieves the island fort by sea in the squadronâ€™s ship, with a naval support request to its holder', () => {
    const { set } = drafted(NAVAL, 'steady');
    for (const c of set.candidates.filter((x) => x.method === 'by_water')) {
      expect(c.axes[0]!.mode).toBe('sea');
      expect(c.axes[0]!.route.legs.at(-1)!.edge).toBe('sea:island_fort:south_sea');
      expect(c.requests).toContainEqual(expect.objectContaining({ kind: 'naval_support', to: 'n_home_squadron', holder: 'n_commodore', carrier: 'n_ship_resolute' }));
    }
    expect(set.rejected.find((r) => r.method === 'direct')!.gates[0]!.kind).toBe('no_route');
  });

  it('meets the boom across the channel: the careful man clears it, the bold man forces it in a night', () => {
    const careful = pick(drafted(NAVAL, 'organiser').set);
    const bold = pick(drafted(NAVAL, 'fighter').set);
    expect(careful.variant).toBe('clear_first');
    expect(bold.variant).toBe('run_in');
    const clear = (c: Candidate) => c.axes[0]!.phases.find((p) => p.kind === 'clear')!.daysPermille;
    expect(clear(careful)).toBeGreaterThan(clear(bold));
    expect(bold.axes[0]!.arrivalPermille).toBeLessThan(careful.axes[0]!.arrivalPermille);
  });

  it('offers "assemble and await word" as the reliefâ€™s holding action', () => {
    expect(drafted(NAVAL, 'steady').set.candidates.find((c) => c.method === 'holding')!.axes[0]!.phases[0]!.kind).toBe('await');
  });
});

describe('character shapes the menu', () => {
  it('gives different top picks to different men in every case', () => {
    for (const spec of CASES) {
      const picks = new Set(SEATINGS.map((s) => `${pick(draft(inputFor(spec, s.person, s.seating))).method}/${pick(draft(inputFor(spec, s.person, s.seating))).variant}`));
      expect(picks.size, spec.name).toBeGreaterThanOrEqual(2);
    }
  });

  it('applies his perception bias once, in belief derivation: the timid man sees more enemy at the same objective', () => {
    const bold = drafted(PINCER, 'fighter').set.candidates[0]!.perceivedAtObjective;
    const timid = drafted(PINCER, 'organiser').set.candidates[0]!.perceivedAtObjective;
    expect(timid).toBeGreaterThan(bold);
  });
});

describe('the 0026 edit grammar', () => {
  const proxy = { values: [], candour: 800, standing: 500, regard: 0 };

  it('re-routes an axis to a new objective and re-scores it with his scorer', () => {
    const { input, set } = drafted(PINCER, 'fighter');
    const r = applyEdit(input, set, pick(set), { kind: 'objective', axis: 'main', objective: R('salient_base') });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.edited.axes[0]!.route.to).toBe('salient_base');
      expect(r.edited.score).toBe(r.edited.contributions.reduce((s, t) => s + t.amount, 0));
    }
  });

  it('routes through waypoints; one of his own routes costs nothing, a worse one costs more', () => {
    const { input, set } = drafted(SUPPLY, 'fighter');
    const own = applyEdit(input, set, pick(set), { kind: 'waypoints', axis: 'main', via: [R('salient_base')] });
    const flank = applyEdit(input, set, pick(set), { kind: 'waypoints', axis: 'main', via: [R('s_west_hills')] });
    const far = applyEdit(input, set, pick(set), { kind: 'waypoints', axis: 'main', via: [R('e_lowlands')] });
    expect(own.ok && flank.ok && far.ok).toBe(true);
    if (own.ok && flank.ok && far.ok) {
      expect(own.distance).toBe(0);
      expect(flank.distance).toBeGreaterThan(0);
      expect(far.distance).toBeGreaterThanOrEqual(flank.distance);
    }
  });

  it('refuses a waypoint no route reaches, as a validation failure with a reason', () => {
    const { input, set } = drafted(SUPPLY, 'fighter');
    expect(applyEdit(input, set, pick(set), { kind: 'waypoints', axis: 'main', via: [R('island_fort')] })).toEqual({ ok: false, reason: 'waypoint island_fort cannot be reached by land' });
  });

  it('shortens his concentration ("move now"), and the timid man objects or shirks', () => {
    const { input, set } = drafted(SUPPLY, 'organiser');
    const plan = set.candidates.find((c) => c.method === 'direct')!;
    const r = applyEdit(input, set, plan, { kind: 'timing', axis: 'main', concentrationDays: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.edited.axes[0]!.phases[0]!.daysPermille).toBeLessThan(plan.axes[0]!.phases[0]!.daysPermille);
      expect(r.distance).toBeGreaterThan(0);
      const answer = respond(input, set, r.edited, r.distance, proxy);
      expect(['object', 'refuse', 'slow_walk', 'reinterpret', 'comply_with_reservations']).toContain(answer.actual);
      expect(answer.reasons.map((x) => x.kind)).toContain('holds_grievance');
    }
  });

  it('adds an axis with an objective and splits his force; removes one and gathers it back', () => {
    const { input, set } = drafted(SUPPLY, 'steady');
    const added = applyEdit(input, set, set.candidates.find((c) => c.method === 'direct')!, { kind: 'add_axis', objective: R('salient_tip') });
    expect(added.ok).toBe(true);
    if (added.ok) {
      expect(added.edited.axes.map((a) => a.route.to)).toEqual(['s_heartland', 'salient_tip']);
      // The depot's guard detachment stays at its post; the two brigades are split.
      expect(added.edited.axes.reduce((s, a) => s + a.strength, 0)).toBe(8000);
    }
    const p = drafted(PINCER, 'fighter');
    const pincer = p.set.candidates.find((c) => c.method === 'pincer')!;
    const removed = applyEdit(p.input, p.set, pincer, { kind: 'remove_axis', axis: 'partner' });
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(removed.edited.axes.map((a) => a.id)).toEqual(['main']);
      expect(removed.edited.requests.some((r) => r.kind === 'cooperating_axis')).toBe(false);
    }
  });

  it('turns each covert rung into a concrete plan', () => {
    const { input, set } = drafted(SUPPLY, 'fighter');
    const r = applyEdit(input, set, pick(set), { kind: 'waypoints', axis: 'main', via: [R('e_lowlands')] });
    if (!r.ok) throw new Error(r.reason);
    const reinterpreted = concretePlan(input, set, r.edited, 'reinterpret');
    expect(set.candidates.map((c) => c.id)).toContain(reinterpreted.id);
    const slow = concretePlan(input, set, r.edited, 'slow_walk');
    expect(slow.axes[0]!.arrivalPermille).toBeGreaterThan(r.edited.axes[0]!.arrivalPermille);
    expect(concretePlan(input, set, r.edited, 'comply_with_reservations')).toBe(r.edited);
  });
});

describe('determinism (decision 0002)', () => {
  it('gives the same draft set twice, and under permuted inputs', () => {
    for (const spec of CASES) {
      for (const s of SEATINGS) {
        const input = inputFor(spec, s.person, s.seating);
        const a = canonicalHash(draft(input));
        expect(canonicalHash(draft(input))).toBe(a);
        const world = input.map.world;
        const shuffled = w.indexWorld({ ...world, regions: [...world.regions].reverse(), edges: [...world.edges].reverse() });
        const permuted = { ...input, map: shuffled, forces: [...input.forces].reverse(), posts: [...input.posts].reverse(), beliefs: new Map([...input.beliefs].reverse()) };
        expect(canonicalHash(draft(permuted)), `${spec.name} / ${s.label}`).toBe(a);
      }
    }
  });

  it('uses none of the kernelâ€™s banned APIs in the planner itself', () => {
    const dir = fileURLToPath(new URL('../src/', import.meta.url));
    const planner = readdirSync(dir).filter((f) => !['cli.ts', 'measure.ts', 'testbed-cases.ts'].includes(f));
    for (const f of planner) {
      const src = readFileSync(join(dir, f), 'utf8');
      expect(src, f).not.toMatch(/Math\.random|new Date|Date\.now|performance\.|localeCompare|Math\.(sqrt|pow|log|exp|sin|cos|tan|atan|cbrt|hypot|round|floor|ceil)\b/);
      expect(src, f).not.toMatch(/from 'node:/);
    }
  });
});

describe('cost', () => {
  it('drafts on the testbed in well under the 10 ms request budget, and on a Union-size graph under 25 ms', () => {
    const time = (f: () => unknown) => {
      f();
      const xs: number[] = [];
      for (let i = 0; i < 20; i++) {
        const t = performance.now();
        f();
        xs.push(performance.now() - t);
      }
      return xs.sort((a, b) => a - b)[10]!;
    };
    for (const spec of CASES) expect(time(() => draft(inputFor(spec, 'n_fighter')))).toBeLessThan(10);
    const big = unionSizeInput();
    expect(time(() => draft(big))).toBeLessThan(25);
    expect(draft(big).candidates.length).toBeGreaterThanOrEqual(2);
  });
});
