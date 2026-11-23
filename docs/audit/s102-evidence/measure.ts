/** Headless S102 evidence capture. Run once per stated mode at the worktree root. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { phase0 } from '@mandate/kernel';
import { phase0Run } from '../../../packages/cli/src/phase0-run.ts';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { REFERENCE_RUNS, gateFailures, seatsNamed } from '../../../packages/cli/src/liveness-gate.ts';
import { checkpointsScore, observeRun } from '../../../packages/cli/src/history-run.ts';
import { coverageScore } from '../../../packages/cli/src/pushback-coverage.ts';
import type { Checkpoints, PushbackRegister } from '@mandate/pack-format';

const mode = process.argv[2] ?? 'smoke';
const dir = `runs/s102/${mode}`;
mkdirSync(dir, { recursive: true });
const write = (name: string, data: unknown) => writeFileSync(`${dir}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const specs = mode === 'references' ? REFERENCE_RUNS : mode === 'corrected' ? REFERENCE_RUNS.filter(r => r.pack === 'union-1861') : REFERENCE_RUNS.filter(r => r.pack === 'union-1861' && r.kind === 'full');
for (const spec of specs) {
  const index = REFERENCE_RUNS.indexOf(spec);
  const loaded = seatsWorld(spec.pack);
  const checkpoints: Checkpoints | null = spec.pack === 'union-1861' ? json(`packs/${spec.pack}/checkpoints.json`) : null;
  const registers: PushbackRegister[] = spec.pack === 'union-1861' ? ['union', 'confederate'].map(side => json(`packs/${spec.pack}/pushback-${side}.json`)) : [];
  const observer = observeRun(checkpoints, loaded.world.start.startDate);
  const responses = new Map<string, unknown>(), calls = new Map<string, unknown>();
  const events: unknown[] = [], levies = new Map<string, unknown>();
  let finalState: phase0.State | undefined;
  const name = `${index}-${spec.pack}`;
  const days = mode === 'smoke' ? 7 : spec.days;
  const summary = phase0Run({ pack: spec.pack, days, atWar: spec.atWar, seats: seatsNamed(spec.seats),
    hash: 'daily', replay: mode !== 'baseline', checks: mode !== 'baseline',
    ...((mode === 'references' || mode === 'corrected') && spec.kind === 'full' ? { resumeAtDay: spec.pack === 'union-1861' ? 60 : 40 } : {}),
    onSave: (text, day) => writeFileSync(`${dir}/${name}-save-${day}.json`, text),
    onTick: (world, tick) => {
      observer.onTick(world, tick);
      for (const [key, r] of Object.entries(tick.state.orderResponses)) if (r.respDay === tick.day) responses.set(`${key}|${r.respRole}|${r.respDay}`, { key, ...r });
      for (const m of tick.state.messagesInTransit) if (m.msgOrder?.orderCall != null) calls.set(m.msgOrigin, m.msgOrder);
      for (const [key, levy] of Object.entries(tick.state.postLevies)) levies.set(key, levy);
      events.push(...tick.events.map(e => ({ day: tick.day, ...e })));
      finalState = tick.state;
    },
  });
  const observations = observer.observations();
  const coverage = coverageScore(registers, observations.pushbackActs ?? [], loaded.world.start.startDate, days, summary.daily);
  write(`${name}-summary`, summary);
  write(`${name}-raw`, { responses: [...responses.values()], calls: Object.fromEntries(calls), levies: [...levies.values()], events, diagnostics: observations.pushbackActs, finalState });
  write(`${name}-coverage`, coverage);
  write(`${name}-checkpoints`, checkpoints === null ? null : checkpointsScore(checkpoints, observations, loaded.world.start.startDate, spec.atWar));
  write(`${name}-bands`, { name: spec.name, failures: gateFailures(spec, summary.liveness), bands: spec.bands });
  console.log(JSON.stringify({ mode, name: spec.name, days, final: summary.finalHash, rejections: summary.rejections, replay: summary.replay, resume: summary.resume, bandsFailed: gateFailures(spec, summary.liveness).length, matched: coverage.matched }));
}
