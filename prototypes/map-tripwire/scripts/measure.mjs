// Measurement run for lane 0.10. Drives a headed Chromium (GPU enabled) through each scenario and writes
// results/measurements.json plus screenshots. usage: node scripts/measure.mjs [scenario-name ...]
import { startVite, launch, gpuCounters, root } from './lib.mjs';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2);
const outFile = join(root, 'results', 'measurements.json');
mkdirSync(join(root, 'screenshots'), { recursive: true });
const results = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {};

// name: [data, query params, dpr, gpu, sweep multipliers, doScreens, doHit]
const SCENARIOS = {
  'A40-dpr1': { data: 'regions-40', q: 'glsync=1', dpr: 1, mults: [1, 2, 4], screens: true, hit: true },
  'A40-dpr1-opt': { data: 'regions-40', q: 'glsync=1&opt=1', dpr: 1, mults: [1, 2, 4] },
  'B250-dpr1': { data: 'regions-250', q: 'glsync=1', dpr: 1, mults: [1, 2, 4], screens: true, hit: true },
  'B250-dpr1-opt': { data: 'regions-250', q: 'glsync=1&opt=1', dpr: 1, mults: [1, 2, 4] },
  'C250-dpr2-3lod': { data: 'regions-250', q: 'glsync=1&opt=1', dpr: 2, mults: [1, 2, 4] },
  'C40-dpr2-3lod': { data: 'regions-40', q: 'glsync=1&opt=1', dpr: 2, mults: [1, 2, 4] },
  // tile-size comparison: 250 regions, DPR 2, 4 LODs eager (so the top LOD is 12.5k x 13.8k px)
  'T250-dpr2-tile512': { data: 'regions-250', q: 'glsync=1&opt=1&lods=4&tile=512&labels=0', dpr: 2, mults: [], tileOnly: true },
  'T250-dpr2-tile1024': { data: 'regions-250', q: 'glsync=1&opt=1&lods=4&tile=1024&labels=0', dpr: 2, mults: [], tileOnly: true },
  'T250-dpr2-tile2048': { data: 'regions-250', q: 'glsync=1&opt=1&lods=4&tile=2048&labels=0', dpr: 2, mults: [], tileOnly: true },
  // the shipping shape: 5 LODs (1x..16x fit), lazy visible-tile bake, DPR 2
  'L250-dpr2-lazy5': { data: 'regions-250', q: 'glsync=1&opt=1&lods=5&mode=lazy', dpr: 2, mults: [1, 2, 4, 8, 16], screens: false },
  'L40-dpr2-lazy5': { data: 'regions-40', q: 'glsync=1&opt=1&lods=5&mode=lazy', dpr: 2, mults: [1, 2, 4, 8, 16] },
  // lazy with 512 px tiles (same ~690 MB raw cap as 160 x 1024)
  'L250-dpr2-lazy5-t512': { data: 'regions-250', q: 'glsync=1&opt=1&lods=5&mode=lazy&tile=512&maxtiles=640', dpr: 2, mults: [1, 2, 4, 8, 16] },
  'L40-dpr2-lazy5-t512': { data: 'regions-40', q: 'glsync=1&opt=1&lods=5&mode=lazy&tile=512&maxtiles=640', dpr: 2, mults: [1, 2, 4, 8, 16] },
  // software rendering for contrast
  'S40-software': { data: 'regions-40', q: 'glsync=1&opt=1', dpr: 1, gpu: 'software', mults: [1, 2] },
};

const { server, url } = await startVite();
for (const [name, sc] of Object.entries(SCENARIOS)) {
  if (only.length && !only.includes(name)) continue;
  console.log('==', name);
  const browser = await launch({ gpu: sc.gpu ?? 'hardware' });
  const cdp = await browser.newBrowserCDPSession();
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: sc.dpr });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errs.push(e.message));
  const R = { scenario: name, ...sc, errors: errs };
  await page.goto(`${url}/?data=${sc.data}&${sc.q}&hold=1`);
  await page.waitForFunction(() => window.__tripwireHold || window.__tripwireError, null, { timeout: 120000 });
  const procs = (await cdp.send('SystemInfo.getProcessInfo')).processInfo;
  const gpuPid = procs.find((p) => p.type === 'GPU' || p.type === 'gpu')?.id;
  R.processTypes = procs.map((p) => p.type);
  const before = gpuCounters(gpuPid);
  await page.evaluate(() => window.__go());
  await page.waitForFunction(() => window.__tripwireReady || window.__tripwireError, null, { timeout: 600000 });
  if (await page.evaluate(() => window.__tripwireError)) { R.pageError = await page.evaluate(() => window.__tripwireError); results[name] = R; continue; }
  await page.waitForTimeout(500);
  const after = gpuCounters(gpuPid);
  R.gpuMemory = { gpuPid, before, afterBake: after };
  R.report = await page.evaluate(() => window.__tripwire.report());
  R.tileLogSample = (await page.evaluate(() => window.__tripwire.tileLog())).map((t) => [t.lod, +(t.paintMs + t.uploadMs).toFixed(1)]);
  if (!sc.tileOnly) {
    R.labelCounts = {};
    R.renderCost = {}; R.hit = {};
    for (const m of sc.mults) {
      await page.evaluate((m) => window.__tripwire.view(m), m);
      R.labelCounts[m] = await page.evaluate(() => window.__tripwire.labelCount());
      R.renderCost[m] = await page.evaluate((m) => window.__tripwire.renderCost(m, 120), m);
    }
    R.sweep = await page.evaluate(([s, m]) => window.__tripwire.sweep(s, m), [4, sc.mults]);
    R.afterSweep = { gpu: gpuCounters(gpuPid), report: await page.evaluate(() => window.__tripwire.report()) };
    if (sc.hit) for (const m of [1, 4]) R.hit[m] = await page.evaluate((m) => window.__tripwire.hitTests(m, 20000), m);
    if (sc.screens) {
      const shots = [];
      const shot = async (file, type = 'jpeg', clip) => { await page.screenshot({ path: join(root, 'screenshots', file), type, ...(type === 'jpeg' ? { quality: 88 } : {}), ...(clip ? { clip } : {}) }); shots.push(file); };
      const regs = await page.evaluate(() => window.__tripwire.regions());
      const key = regs.filter((r) => r.kind === 'keypoint').sort((a, b) => a.area - b.area)[1];
      const strip = regs.filter((r) => r.kind === 'strip').sort((a, b) => b.area - a.area)[0];
      const tag = sc.data.replace('regions-', 'r');
      await page.evaluate(() => window.__tripwire.view(1)); await page.waitForTimeout(150); await shot(`${tag}-zoom1-overview.jpg`);
      await page.evaluate(([x, y]) => window.__tripwire.view(2, x, y), [key.cx, key.cy]); await page.waitForTimeout(150); await shot(`${tag}-zoom2-mid.jpg`);
      await page.evaluate(([x, y]) => window.__tripwire.view(4, x, y), [key.cx, key.cy]); await page.waitForTimeout(150); await shot(`${tag}-zoom4-close-keypoint.jpg`);
      // curved label at two zoom levels (the strip region's name)
      for (const m of [1, 3]) {
        await page.evaluate(([id, m]) => window.__tripwire.focus(id, m), [strip.id, m]); await page.waitForTimeout(200);
        await shot(`${tag}-label-strip-zoom${m}.png`, 'png', { x: 300, y: 150, width: 1000, height: 600 });
      }
      R.screenshots = shots; R.focusStrip = strip; R.focusKeypoint = key;
      // Playwright-driven hover (end to end): hover the keypoint centre, 6 px off its edge, and a border between two big regions
      await page.evaluate(([x, y]) => window.__tripwire.view(1, x, y), [key.cx, key.cy]);
      await page.waitForTimeout(150);
      const pos = await page.evaluate(([x, y]) => window.__tripwire.toScreen(x, y), [key.cx, key.cy]);
      const hover = [];
      for (const [label, dx] of [['centre', 0], ['+6px beyond centre', 6], ['+14px', 14], ['+30px', 30]]) {
        await page.mouse.move(pos[0] + dx, pos[1]); await page.waitForTimeout(60);
        hover.push({ label, expected: key.id, hud: await page.evaluate(() => document.getElementById('hud').dataset.hover + ' ' + document.getElementById('hud').dataset.how) });
      }
      R.hoverE2E = hover;
    }
  }
  results[name] = R;
  writeFileSync(outFile, JSON.stringify(results, null, 1));
  await browser.close();
}
await server.close();
console.log('done ->', outFile);
