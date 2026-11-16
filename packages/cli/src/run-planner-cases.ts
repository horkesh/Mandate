/**
 * Print lane 0.9's three planner cases as the kernel planner drafts them on the testbed (lane 1.2): each seating's
 * candidates with their scores and conditions, and the rejected methods' gates.
 * Run: npx tsx packages/cli/src/run-planner-cases.ts [bias]
 */
import { CASES, drafted, SEATINGS } from './planner-cases.ts';

const bias = Number(process.argv[2] ?? 1000);
for (const spec of CASES) {
  console.log(`== ${spec.title} (source bias ${bias})`);
  for (const s of SEATINGS) {
    const { set } = drafted(spec, s, { sourceBias: bias });
    console.log(`  ${s.label}: perceived ${set.draftCandidates[0]?.candPerceived ?? '-'}, ${set.draftSearches} searches`);
    for (const c of set.draftCandidates) {
      const conds = c.candConditions.map((g) => g.gateKind).join(',');
      const reqs = c.candRequests.map((r) => `${r.reqKind}:${r.reqPost ?? r.reqMen}`).join(',');
      const route = c.candAxes.map((a) => `${a.axisPost}[${[a.axisRoute.routeFrom, ...a.axisRoute.routeLegs.map((l) => l.legTo)].join('>')}] ${a.axisPhases.map((p) => p.phaseKind).join(',')} @${a.axisArrival}`).join(' | ');
      console.log(`    ${c.candScore.toString().padStart(5)} ${c.candMethod}/${c.candVariant} ${route}${conds ? ` {${conds}}` : ''}${reqs ? ` <${reqs}>` : ''}`);
    }
    for (const r of set.draftRejected) console.log(`      x ${r.rejMethod}/${r.rejVariant}: ${r.rejGates.map((g) => `${g.gateKind} (${g.gateDetail})`).join('; ')}`);
  }
}
