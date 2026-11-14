// Prints a compact summary of results/measurements.json (what the README tables are built from).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib.mjs';
const R = JSON.parse(readFileSync(join(root, 'results', 'measurements.json'), 'utf8'));
const f = (v, d = 1) => (v === undefined || v === null ? '-' : (+v).toFixed(d));
for (const [name, r] of Object.entries(R)) {
  console.log(`\n### ${name}  (${r.data}, dpr ${r.dpr}, ${r.q}) ${r.pageError ? 'ERROR ' + r.pageError.slice(0, 200) : ''}`);
  if (!r.report) continue;
  const b = r.report.bake;
  console.log(`GPU: ${r.report.gpu.renderer} | maxTex ${r.report.gpu.maxTextureSize} | errors: ${r.errors.length}`);
  console.log(`prep: fetch ${f(r.report.fetchParseMs)} ms, project+rough ${f(r.report.geo.prepMs)} ms, paths ${f(r.report.geo.pathMs)} ms, verts ${r.report.geo.vertices}`);
  for (const l of b.lods) console.log(`  LOD${l.lod} ${l.sizePx.join('x')} grid ${l.grid.join('x')} tiles ${l.tiles}: wall ${f(l.wallMs, 0)} ms, mean tile ${f(l.meanTileMs)} (record ${f(l.meanPaintMs, 2)}), max ${f(l.maxTileMs)}, min ${f(l.minTileMs)}`);
  console.log(`  bake total ${f(b.totalWallMs, 0)} ms, ${b.tiles} tiles, textures ${f(b.textureMB, 0)} MB`);
  const gm = r.gpuMemory; const dA = (o) => (o?.adapters ? o.adapters.map((a) => `${a.mb}`).join('/') : '?');
  console.log(`  GPU mem: process dedicated before ${gm.before.processDedicatedMB} -> after bake ${gm.afterBake.processDedicatedMB} MB; adapters before ${dA(gm.before)} after ${dA(gm.afterBake)} ${gm.before.error ?? ''}`);
  console.log(`  JS heap MB: start ${f(r.report.heapStartMB)} beforeBake ${f(r.report.heapBeforeBakeMB)} afterBake ${f(r.report.heapAfterBakeMB)} now ${f(r.report.heapNowMB)}; label build ${f(r.report.labelBuildMs, 0)} ms`);
  if (r.renderCost) for (const [m, c] of Object.entries(r.renderCost)) console.log(`  renderCost x${m}: mean ${f(c.mean, 2)} p95 ${f(c.p95, 2)} max ${f(c.max, 2)} ms (JS+GPU, gl.finish)  labels ${JSON.stringify(r.labelCounts[m])}`);
  if (r.sweep) for (const s of r.sweep) console.log(`  sweep x${s.mult}: ${s.frames} frames, raf mean ${f(s.rafMs.mean, 2)} p95 ${f(s.rafMs.p95, 2)} p99 ${f(s.rafMs.p99, 2)} max ${f(s.rafMs.max, 1)} ms; >20ms: ${s.over20ms}, >33ms: ${s.over33ms}; cpu mean ${f(s.cpuMs.mean, 2)} p95 ${f(s.cpuMs.p95, 2)} max ${f(s.cpuMs.max, 1)}; tiles baked during ${s.tilesBakedDuring}; label position mean ${f(s.labelPosMs.mean, 2)}`);
  if (r.afterSweep) console.log(`  after sweep: GPU process ${r.afterSweep.gpu.processDedicatedMB} MB, JS heap ${f(r.afterSweep.report.heapNowMB)} MB, tiles ${r.afterSweep.report.tiles.count} evictions ${r.afterSweep.report.tiles.evictions}; label layout ms ${JSON.stringify(r.afterSweep.report.labelStats.layout)}`);
  if (r.hit) for (const [m, h] of Object.entries(r.hit)) console.log(`  hit x${m}: pip-vs-idbuffer ${JSON.stringify(h.pipVsIdBuffer)}\n     border ${JSON.stringify(h.borderPoints)}\n     small(${h.smallRegions.count}) diam px ${h.smallRegions.screenDiameterPx.join(',')}\n${h.smallRegions.hitRateByDistance.map((x) => `       ${String(x.pxOutsideEdge).padStart(3)} px from edge: qualifying(n=${x.qualifying.n}) rule ${x.qualifying.withRulePct}% / pure ${x.qualifying.pureInsideTestPct}%   all(n=${x.all.n}) rule ${x.all.withRulePct}% / pure ${x.all.pureInsideTestPct}%`).join('\n')}\n     pick ${f(h.pickMicros, 2)} us`);
  if (r.hoverE2E) console.log('  hover e2e:', JSON.stringify(r.hoverE2E));
}
