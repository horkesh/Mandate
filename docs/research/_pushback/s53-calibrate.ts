import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { canonicalHash, createTelemetry, livenessReport, phase0, world as w, encodeSave, decodeSave } from '../../../packages/kernel/src/index.ts';
import { createRuleSeat } from '../../../packages/rule-seats/src/index.ts';
import { seatsWorld, seatsMechanics } from '../../../packages/cli/src/seats-world.ts';
import { historyPack } from '../../../packages/cli/src/done-check.ts';
import { observeRun, pushbackCount, pushbackScore, checkpointsScore, operationScore } from '../../../packages/cli/src/history-run.ts';

// One predetermined candidate, not a coefficient search. Never writes pack or kernel inputs.
const h = historyPack('union-1861')!;
const base = seatsWorld('union-1861');
const startup = process.argv.includes('--startup');
const days = startup ? 1 : 148;
const seeds = startup ? [h.seed] : Array.from({ length: 8 }, (_, i) => h.seed + i);
const out = 'runs/s53/calibration';
mkdirSync(out, { recursive: true });
const results: { seed: number; variant: string; finalHash: string; counts: unknown; rejections: number }[] = [];
for (const seed of seeds) for (const variant of ['baseline', 'deterrence-1000']) {
  const original = base.world.map.world;
  const candidate = variant === 'baseline' ? original : { ...original, rules: { ...original.rules,
    people: { ...original.rules.people, compliance: { ...original.rules.people.compliance, deterrenceWeight: 1000 } } } };
  const world = variant === 'baseline' ? base.world : phase0.indexSeatsWorld(w.indexWorld(candidate), base.world.start, { situations: base.world.situations });
  if (world.rules.people.compliance.complyAt !== 10 || world.rules.people.compliance.temperamentWeight !== 400) throw Error('the contract changed');
  const start = phase0.createState(world, { ...base.setup, seed });
  const telemetry = createTelemetry(seatsMechanics());
  const observer = observeRun(h.checkpoints, h.startDate);
  const responses: { key: string; response: phase0.OrderResponse }[] = [];
  const seen = new Set<string>();
  const daily: { day: number; fires: Record<string, number>; rejections: unknown; points: number }[] = [];
  let previous: Record<string, number> = {};
  let mid: phase0.State | undefined;
  const model = createRuleSeat();
  const started = performance.now();
  const run = phase0.playDays(world, start, () => model, days, { freeze: false, deepChecks: false, hashEvery: 1, telemetry,
    onDay(r) {
      observer.onTick(world, r);
      const fires: Record<string, number> = {};
      for (const [k, row] of Object.entries(telemetry.mechanics)) {
        const delta = row.fires - (previous[k] ?? 0);
        if (delta !== 0) fires[k] = delta;
      }
      previous = Object.fromEntries(Object.entries(telemetry.mechanics).map(([k, row]) => [k, row.fires]));
      daily.push({ day: r.day, fires, rejections: r.rejections, points: r.decisionPoints.length });
      if (r.day === 74) mid = r.state;
      for (const [key, response] of Object.entries(r.state.orderResponses)) {
        if (response.respDay !== r.day || seen.has(key + '|' + response.respActual)) continue;
        seen.add(key + '|' + response.respActual);
        if (response.respTerms.reduce((n, t) => n + t.respTermAmount, 0) !== response.respWillingness) throw Error('terms do not sum');
        responses.push({ key, response });
      }
    },
  });
  const observations = observer.observations();
  const counts = h.checkpoints.pushback.map(p => ({ id: p.id, observed: pushbackCount(p, observations, daily, h.startDate), min: p.min, max: p.max }));
  const rejections = daily.reduce((n, d) => n + (d.rejections as unknown[]).length, 0);
  const replayChecks: Record<string, boolean> = {};
  if (!startup && seed === h.seed) {
    const repeated = phase0.replay(world, start, run.log, days, { freeze: false, deepChecks: false, hashEvery: 1 });
    replayChecks.daily = JSON.stringify(repeated.hashes) === JSON.stringify(run.hashes);
    const saved = decodeSave(encodeSave({ worldHash: canonicalHash(candidate), state: mid!, log: run.log.filter(e => e.day <= 74) }));
    const resumed = phase0.replay(world, saved.state as unknown as phase0.State, run.log, days, { freeze: false, deepChecks: false, hashEvery: 1 });
    replayChecks.resume = canonicalHash(resumed.state) === canonicalHash(run.state);
    if (!Object.values(replayChecks).every(Boolean)) throw Error('replay or resume diverged');
  }
  const result = { seed, variant, days, elapsedMs: performance.now() - started, worldHash: canonicalHash(candidate), initialHash: canonicalHash(start),
    finalHash: canonicalHash(run.state), hashes: run.hashes, counts, rejections, daily, liveness: livenessReport(telemetry), responses, log: run.log,
    scores: startup ? null : { pushback: pushbackScore(h.checkpoints, observations, daily, h.startDate, new Set(seatsMechanics())),
      checkpoints: checkpointsScore(h.checkpoints, observations, h.startDate, false), operation: operationScore(observations) }, replayChecks };
  writeFileSync(`${out}/${seed}-${variant}${startup ? '-startup' : ''}.json`, JSON.stringify(result, null, 2) + '\n');
  results.push({ seed, variant, finalHash: result.finalHash, counts, rejections });
  console.log(JSON.stringify({ seed, variant, days, counts, rejections, elapsedMs: Math.round(result.elapsedMs), replayChecks }));
}
writeFileSync(`${out}/${startup ? 'startup' : 'summary'}.json`, JSON.stringify(results, null, 2) + '\n');
