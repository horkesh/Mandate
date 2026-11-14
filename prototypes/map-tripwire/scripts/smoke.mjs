// Smoke test: load a map on the GPU, print a compact summary and take one screenshot.
// usage: node scripts/smoke.mjs <data> [gpu=hardware|software] [dpr=1|2] [any page param, e.g. sync=1 tile=512 mode=lazy lods=5]
import { startVite, launch, root } from './lib.mjs';
import { join } from 'node:path';

const [data = 'regions-40', ...kv] = process.argv.slice(2);
const opts = Object.fromEntries(kv.map((s) => s.split('=')));
const gpu = opts.gpu ?? 'hardware', dpr = opts.dpr ?? '1';
const extra = Object.entries(opts).filter(([k]) => k !== 'gpu' && k !== 'dpr').map(([k, v]) => `&${k}=${v}`).join('');
const { server, url } = await startVite();
const browser = await launch({ gpu });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: +dpr });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) console.log('[page]', m.text().slice(0, 300)); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`${url}/?data=${data}${extra}`);
await page.waitForFunction(() => window.__tripwireReady || window.__tripwireError, null, { timeout: 180000 });
const err = await page.evaluate(() => window.__tripwireError);
if (err) console.log('ERROR', err);
else {
  const r = await page.evaluate(() => window.__tripwire.report());
  console.log(`${data} ${extra} dpr${dpr} gpu=${r.gpu.renderer}`);
  console.log(`  geo: ${r.geo.regions} regions, ${r.geo.vertices} verts, prep ${r.geo.prepMs.toFixed(1)} ms, paths ${r.geo.pathMs.toFixed(1)} ms; heap ${r.heapBeforeBakeMB?.toFixed(1)} -> ${r.heapAfterBakeMB?.toFixed(1)} MB`);
  for (const l of r.bake.lods) console.log(`  LOD${l.lod} ${l.sizePx.join('x')} px grid ${l.grid.join('x')} tiles ${l.tiles}: wall ${l.wallMs.toFixed(1)} ms, mean paint ${l.meanPaintMs.toFixed(2)} + upload ${l.meanUploadMs.toFixed(2)} ms, max tile ${l.maxTileMs.toFixed(1)} ms`);
  console.log(`  total bake wall ${r.bake.totalWallMs.toFixed(1)} ms, ${r.bake.tiles} tiles, ${r.bake.textureMB.toFixed(1)} MB textures; labels build ${r.labelBuildMs?.toFixed(0)} ms, layout ${r.labelStats.layout.mean?.toFixed(1)} ms`);
  if (r.bake.phaseMs && Object.keys(r.bake.phaseMs).length) console.log('  phase ms (all tiles, profile mode):', Object.entries(r.bake.phaseMs).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(', '));
  await page.screenshot({ path: join(root, 'results', `smoke-${data}.png`) });
}
await browser.close(); await server.close();
