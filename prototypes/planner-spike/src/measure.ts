/**
 * The spike's measurements (brief section 4): cost per draft on the testbed and
 * on a graph the size of the Union map, and how often the chosen candidate
 * changes with boldness and with the intelligence overestimate, plus which
 * scoring terms ever change a pick. Not kernel code: it reads the clock.
 * Run: npx tsx prototypes/planner-spike/src/measure.ts
 */
import { ids, phase0, world as w } from '@mandate/kernel';
import { unionSizeControl, unionSizeMap, COLS, ROWS } from '../../../packages/kernel/test/support/union-size-map.ts';
import { DEFAULT_RULES, type PlannerInput } from './context.ts';
import { draft, pick } from './planner.ts';
import { beliefsFor, profileOf, traitHolder } from './profile.ts';
import { applyEdit, concretePlan, respond, type Edit } from './edits.ts';
import { CASES, inputFor, SEATINGS, type Seating } from './testbed-cases.ts';
import { TERMS, type Candidate, type ForceStandIn, type TermKind } from './types.ts';

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}
function p95(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * 0.95))]!;
}
export function timeDraft(input: PlannerInput, runs: number): { median: number; p95: number; candidates: number; searches: number } {
  const set = draft(input);
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t = performance.now();
    draft(input);
    samples.push(performance.now() - t);
  }
  return { median: median(samples), p95: p95(samples), candidates: set.candidates.length, searches: set.counters.searches };
}

/** A synthetic input on the Union-size grid: a commander mid-front on side a, an objective four columns into b. */
export function unionSizeInput(objectiveCol = 17): PlannerInput {
  const map = unionSizeMap();
  const control = unionSizeControl();
  const derived = phase0.deriveMap(map, { control, month: 4 });
  const id = (c: number, r: number) => ids.toId('region', `g${String(c).padStart(2, '0')}_${r}`);
  const reported = new Map<ReturnType<typeof id>, number>();
  for (let c = 14; c < COLS; c++) for (let r = 0; r < ROWS; r++) reported.set(id(c, r), 2000 + ((c * 7 + r * 3) % 5) * 800);
  const person = ids.toId('person', 'synthetic_general');
  const boldness = 500;
  const { beliefs } = beliefsFor(reported, 1000, traitHolder(person, boldness));
  const post = ids.toId('post', 'army_a');
  const partner = ids.toId('post', 'army_b');
  const forces: ForceStandIn[] = [
    { id: ids.toId('forceBlock', 'a1'), post, region: id(12, 4), kind: 'block', arm: 'infantry', strength: 9000, storesDays: 12, aboard: null },
    { id: ids.toId('forceBlock', 'a2'), post, region: id(12, 4), kind: 'block', arm: 'infantry', strength: 8000, storesDays: 12, aboard: null },
    { id: ids.toId('forceBlock', 'a3'), post, region: id(11, 4), kind: 'block', arm: 'cavalry', strength: 3000, storesDays: 10, aboard: null },
    { id: ids.toId('forceBlock', 'b1'), post: partner, region: id(12, 6), kind: 'block', arm: 'infantry', strength: 9000, storesDays: 12, aboard: null },
  ];
  return {
    map,
    month: 4,
    network: phase0.INTACT_NETWORK,
    controlIndex: derived.index,
    supply: derived.supply.factions.get(ids.toId('faction', 'a'))!,
    faction: ids.toId('faction', 'a'),
    fortification: new Map(),
    beliefs,
    forces,
    posts: [
      { id: post, holder: person, parent: null, region: id(12, 4), kind: 'army' },
      { id: partner, holder: ids.toId('person', 'synthetic_partner'), parent: null, region: id(12, 6), kind: 'army' },
    ],
    post,
    profile: profileOf(person, boldness, 650),
    goal: { objective: id(objectiveCol, 5), posture: 'take', risk: 500, deadlineDays: 20, permissions: { rail: true, river: true, sea: false }, committed: [] },
    rules: DEFAULT_RULES,
  };
}

const key = (c: Candidate) => `${c.method}/${c.variant}`;

/** How many times the top pick changes as boldness runs 0..1000 in steps of 50, per case. */
export function boldnessSweep(): { case: string; picks: string[]; changes: number }[] {
  return CASES.map((spec) => {
    const picks: string[] = [];
    for (let b = 0; b <= 1000; b += 50) picks.push(key(pick(draft(inputFor(spec, 'n_appointee', { boldness: b, competence: 650 })))));
    return { case: spec.name, picks, changes: picks.filter((p, i) => i > 0 && p !== picks[i - 1]).length };
  });
}

/** How many times the top pick changes as the intelligence source's overestimate runs 1000..4000 in steps of 250, per case and seating. */
export function overestimateSweep(): { case: string; seat: string; picks: string[]; changes: number }[] {
  const out = [];
  for (const spec of CASES) {
    for (const s of SEATINGS) {
      const picks: string[] = [];
      for (let bias = 1000; bias <= 4000; bias += 250) picks.push(key(pick(draft(inputFor(spec, s.person, { ...s.seating, sourceBias: bias })))));
      out.push({ case: spec.name, seat: s.label, picks, changes: picks.filter((p, i) => i > 0 && p !== picks[i - 1]).length });
    }
  }
  return out;
}

/**
 * Liveness of the scoring terms (D9, spike "Liveness"): a term is live if
 * dropping it changes the top pick in at least one situation (the cases, under
 * every seating, at three overestimates).
 */
export function termLiveness(): Record<TermKind, number> {
  const out = Object.fromEntries(TERMS.map((t) => [t, 0])) as Record<TermKind, number>;
  for (const spec of CASES) {
    for (const s of SEATINGS) {
      for (const bias of [1000, 1500, 2500]) {
        const set = draft(inputFor(spec, s.person, { ...s.seating, sourceBias: bias }));
        const top = set.candidates[0]!;
        for (const t of TERMS) {
          const without = (c: Candidate) => c.score - (c.contributions.find((x) => x.term === t)?.amount ?? 0);
          const alt = [...set.candidates].sort((a, b) => without(b) - without(a) || (a.id < b.id ? -1 : 1))[0]!;
          if (alt.id !== top.id) out[t] += 1;
        }
      }
    }
  }
  return out;
}

if (process.argv[1]?.endsWith('measure.ts')) {
  console.log('== cost per draft on the testbed (median / p95 ms over 200 runs)');
  for (const spec of CASES) {
    for (const s of SEATINGS) {
      const r = timeDraft(inputFor(spec, s.person, s.seating), 200);
      console.log(`${spec.name.split(':')[0]} | ${s.label}: ${r.median.toFixed(3)} / ${r.p95.toFixed(3)} ms, ${r.candidates} candidates, ${r.searches} searches`);
    }
  }
  console.log('== cost per draft on the Union-size grid (270 regions, 971 edges)');
  for (const col of [15, 17, 20, 24]) {
    const r = timeDraft(unionSizeInput(col), 100);
    console.log(`objective at column ${col}: ${r.median.toFixed(3)} / ${r.p95.toFixed(3)} ms, ${r.candidates} candidates, ${r.searches} searches`);
  }
  console.log('== boldness sweep (0..1000 by 50), competence 650');
  for (const r of boldnessSweep()) console.log(`${r.case.split(':')[0]}: ${r.changes} changes: ${r.picks.join(' ')}`);
  console.log('== overestimate sweep (1000..4000 by 250)');
  for (const r of overestimateSweep()) console.log(`${r.case.split(':')[0]} | ${r.seat}: ${r.changes} changes: ${r.picks.join(' ')}`);
  console.log('== term liveness (situations in which dropping the term changes the top pick, of 36)');
  console.log(termLiveness());
  console.log('== one edit of each kind, scored by his scorer, answered by the kernel’s resolveDirective');
  const R = (id: string) => ids.toId('region', id);
  const proxy = { values: [], candour: 800, standing: 500, regard: 0 };
  const demos: [string, (typeof CASES)[number], string, Seating, (set: ReturnType<typeof draft>) => Candidate, Edit][] = [
    ['objective', CASES[0]!, 'n_fighter', {}, (s) => s.candidates[0]!, { kind: 'objective', axis: 'main', objective: R('salient_base') }],
    ['waypoints', CASES[1]!, 'n_fighter', {}, (s) => s.candidates[0]!, { kind: 'waypoints', axis: 'main', via: [R('e_lowlands')] }],
    ['timing', CASES[1]!, 'n_organiser', {}, (s) => s.candidates.find((c) => c.method === 'direct')!, { kind: 'timing', axis: 'main', concentrationDays: 0 }],
    ['add_axis', CASES[1]!, 'n_appointee', { boldness: 500, competence: 650 }, (s) => s.candidates.find((c) => c.method === 'direct')!, { kind: 'add_axis', objective: R('salient_tip') }],
    ['remove_axis', CASES[0]!, 'n_fighter', {}, (s) => s.candidates.find((c) => c.method === 'pincer')!, { kind: 'remove_axis', axis: 'partner' }],
  ];
  for (const [label, spec, person, seating, choose, edit] of demos) {
    const input = inputFor(spec, person, seating);
    const set = draft(input);
    const chosen = choose(set);
    const r = applyEdit(input, set, chosen, edit);
    if (!r.ok) {
      console.log(`${label}: refused: ${r.reason}`);
      continue;
    }
    const answer = respond(input, set, r.edited, r.distance, proxy);
    console.log(
      `${label} (${person} on ${chosen.method}/${chosen.variant}): score ${chosen.score} -> ${r.edited.score}, distance ${r.distance}, fell ${r.fell.map((f) => `${f.term} ${f.drop}`).join(', ') || 'none'}; ` +
        `answer ${answer.actual} (declares ${answer.declared}); reasons ${answer.statedReasons.map((x) => x.kind).join(', ') || 'none'}; concrete: ${concretePlan(input, set, r.edited, answer.actual).id}`,
    );
  }
  void w;
}
