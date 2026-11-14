/**
 * Print each case's draft set for each of the testbed's three generals, with
 * every candidate's terms, requests, conditions and the rejected methods' gates.
 * Run: npx tsx prototypes/planner-spike/src/cli.ts
 */
import { draft } from './planner.ts';
import { CASES, inputFor, SEATINGS } from './testbed-cases.ts';
import type { Candidate, DraftSet } from './types.ts';

const d = (permille: number) => (permille / 1000).toFixed(1);

export function describeCandidate(c: Candidate): string {
  const lines = [`  [${c.score}] ${c.method}/${c.variant}  ratio ${c.forceRatio}‰ vs ${c.perceivedAtObjective} perceived`];
  for (const a of c.axes) {
    const path = [a.route.from, ...a.route.legs.map((l) => l.to)].join(' > ');
    const phases = a.phases.map((p) => `${p.kind}@${d(p.startPermille)}+${d(p.daysPermille)}`).join(', ');
    lines.push(`      axis ${a.id} (${a.post}, ${a.mode}, ${a.strength} men): ${path}`);
    lines.push(`        arrives day ${d(a.arrivalPermille)}, ${d(a.outOfSupplyPermille)} days outside supply; ${phases}`);
  }
  lines.push(`      terms: ${c.contributions.map((t) => `${t.term} ${t.amount}`).join(', ')}`);
  for (const r of c.requests) lines.push(`      request: ${JSON.stringify(r)}`);
  for (const g of c.conditions) lines.push(`      condition: ${g.kind} (${g.detail})`);
  return lines.join('\n');
}

export function describeSet(set: DraftSet): string {
  const out = [`${set.commander} at ${set.post}: ${set.candidates.length} candidates, ${set.counters.searches} searches`];
  for (const c of set.candidates) out.push(describeCandidate(c));
  for (const r of set.rejected) out.push(`  rejected ${r.method}/${r.variant}: ${r.gates.map((g) => `${g.kind} (${g.detail})`).join('; ')}`);
  return out.join('\n');
}

if (process.argv[1]?.endsWith('cli.ts')) {
  for (const spec of CASES) {
    console.log(`\n=== ${spec.name}`);
    for (const s of SEATINGS) console.log(`-- ${s.label}\n${describeSet(draft(inputFor(spec, s.person, s.seating)))}`);
  }
}
