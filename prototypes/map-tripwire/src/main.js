// Map tripwire spike (lane 0.10, decision 0035): PixiJS 8 + tiled Canvas-2D bake + curved labels + hit-testing.
// URL params: data=regions-40|regions-250  tile=1024  mode=eager|lazy  labels=1|0  lods=3
import { Application, Container, Graphics } from 'pixi.js';
import { loadGeo, buildPaths } from './geo.js';
import { TileSystem, PAD } from './bake.js';
import { HitIndex } from './hit.js';
import { Labels } from './labels.js';

const q = new URLSearchParams(location.search);
const P = { data: q.get('data') ?? 'regions-40', tile: +(q.get('tile') ?? 1024), mode: q.get('mode') ?? 'eager', labels: q.get('labels') !== '0', lods: +(q.get('lods') ?? 3), sync: q.get('sync') === '1' || q.get('profile') === '1', profile: q.get('profile') === '1', opt: q.get('opt') === '1', glSync: q.get('glsync') === '1', maxTiles: +(q.get('maxtiles') ?? 160) };
const hud = document.getElementById('hud');
const T = {}; // report
const nowMs = () => performance.now();
const heapMB = () => (performance.memory ? performance.memory.usedJSHeapSize / 1048576 : null);

async function main() {
  T.params = P; T.dpr = window.devicePixelRatio; T.viewport = [innerWidth, innerHeight];
  T.heapStartMB = heapMB();
  // ---- renderer ----
  const app = new Application();
  const t0 = nowMs();
  await app.init({ preference: 'webgl', resizeTo: window, background: 0xb7c6c9, antialias: false, resolution: window.devicePixelRatio, autoDensity: true, powerPreference: 'high-performance', autoStart: false, sharedTicker: false });
  T.pixiInitMs = nowMs() - t0;
  document.body.appendChild(app.canvas);
  app.ticker.stop();
  const gl = app.renderer.gl;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  T.gpu = { renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR), version: gl.getParameter(gl.VERSION), maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE), pixiRenderer: app.renderer.name, webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext };

  // ---- data ----
  const t1 = nowMs();
  const fc = await (await fetch(`/data/${P.data}.geojson`)).json();
  T.fetchParseMs = nowMs() - t1;
  const geo = loadGeo(fc);
  buildPaths(geo);
  T.geo = { regions: geo.regions.length, vertices: geo.vertexCount, prepMs: geo.prepMs, pathMs: geo.pathMs, bboxKm: [geo.bbox[2] - geo.bbox[0], geo.bbox[3] - geo.bbox[1]], meta: fc.meta };

  // ---- camera ----
  const W = () => innerWidth, H = () => innerHeight;
  const bw = geo.bbox[2] - geo.bbox[0], bh = geo.bbox[3] - geo.bbox[1];
  const zFit = Math.min((W() * 0.94) / bw, (H() * 0.94) / bh);
  const cam = { x: (geo.bbox[0] + geo.bbox[2]) / 2, y: (geo.bbox[1] + geo.bbox[3]) / 2, zoom: zFit };
  const zMin = zFit * 0.9, zMax = zFit * 4;
  T.zFit = zFit;

  // ---- layers ----
  const world = new Container();
  const highlight = new Graphics();
  const labelLayer = new Container();
  const tiles = new TileSystem(app.renderer, geo, { tileSize: P.tile, zFit, dpr: window.devicePixelRatio, lodCount: P.lods, mode: P.mode, sync: P.sync, profile: P.profile, opt: P.opt, glSync: P.glSync, maxTiles: P.maxTiles });
  world.addChild(tiles.root); world.addChild(highlight);
  app.stage.addChild(world); app.stage.addChild(labelLayer);

  // ---- optional hold, so a test harness can sample GPU memory before the bake ----
  if (q.get('hold') === '1') { window.__tripwireHold = true; await new Promise((r) => { window.__go = r; }); }
  // ---- bake ----
  const heap0 = heapMB(); T.heapBeforeBakeMB = heap0;
  const tb = nowMs();
  const lodReports = [];
  const eagerLods = P.mode === 'eager' ? P.lods : 1;
  for (let k = 0; k < eagerLods; k++) {
    const before = tiles.log.length, ms = tiles.bakeLodAll(k);
    const rows = tiles.log.slice(before);
    const paint = rows.map((r) => r.paintMs), up = rows.map((r) => r.uploadMs), tot = rows.map((r) => r.paintMs + r.uploadMs);
    const L = tiles.lods[k];
    lodReports.push({ lod: k, scalePxPerKm: L.s, sizePx: [L.pw, L.ph], grid: [L.nx, L.ny], tiles: rows.length, wallMs: ms, meanPaintMs: avg(paint), meanUploadMs: avg(up), meanTileMs: avg(tot), maxTileMs: Math.max(...tot), minTileMs: Math.min(...tot) });
  }
  T.bake = { mode: P.mode, tileSize: P.tile, pad: PAD, lods: lodReports, totalWallMs: nowMs() - tb, tiles: tiles.tileCount, textureMB: tiles.textureBytes / 1048576, phaseMs: tiles.phase };
  T.heapAfterBakeMB = heapMB();
  gl.finish();

  // ---- hit index, labels ----
  const th = nowMs();
  const hit = new HitIndex(geo);
  T.hitBuildMs = nowMs() - th;
  let labels = null;
  if (P.labels) {
    labels = new Labels(geo, labelLayer);
    T.labelBuildMs = labels.buildMs;
  }

  // ---- frame ----
  let dirty = true, hoverRegion = null, lastLayoutZoom = 0;
  const frameStats = { labelLayoutMs: [], labelPosMs: [], tileUpdateMs: [] };
  function view() {
    const hw = W() / 2 / cam.zoom, hh = H() / 2 / cam.zoom;
    return { zoom: cam.zoom, worldRect: { x0: cam.x - hw, y0: cam.y - hh, x1: cam.x + hw, y1: cam.y + hh } };
  }
  function frame(budget = 6) {
    world.scale.set(cam.zoom); world.position.set(W() / 2 - cam.x * cam.zoom, H() / 2 - cam.y * cam.zoom);
    const a = nowMs(); const st = tiles.update(view(), budget, frameNo); frameStats.tileUpdateMs.push(nowMs() - a);
    let ls = null, ps = null;
    if (labels) {
      if (Math.abs(cam.zoom / (lastLayoutZoom || 1) - 1) > 0.003) { ls = labels.layout(cam.zoom); lastLayoutZoom = cam.zoom; frameStats.labelLayoutMs.push(ls.ms); }
      ps = labels.position(cam.x, cam.y, cam.zoom, W(), H()); frameStats.labelPosMs.push(ps.ms);
    }
    app.render();
    frameNo++;
    return { st, ls, ps };
  }
  let frameNo = 0, lastInfo = null;
  function setHud() {
    hud.textContent = `zoom ${(cam.zoom / zFit).toFixed(2)}× fit (${cam.zoom.toFixed(2)} px/km)  LOD ${tiles.lodForZoom(cam.zoom)}  tiles ${tiles.tileCount}  hover: ${hoverRegion ? `${hoverRegion.region.id} ${hoverRegion.region.name} [${hoverRegion.how}]` : '-'}`;
    hud.dataset.hover = hoverRegion ? hoverRegion.region.id : '';
    hud.dataset.how = hoverRegion ? hoverRegion.how : '';
  }
  function drawHighlight() {
    highlight.clear();
    if (!hoverRegion) return;
    const r = hoverRegion.region;
    for (const poly of r.polys) for (const ring of poly) { highlight.moveTo(ring[0], ring[1]); for (let i = 2; i < ring.length; i += 2) highlight.lineTo(ring[i], ring[i + 1]); highlight.closePath(); }
    highlight.stroke({ width: 3 / cam.zoom, color: 0x1f5fbf, alpha: 0.95 });
  }
  let rafId = 0;
  function loop() { rafId = requestAnimationFrame(loop); if (dirty) { frame(); setHud(); dirty = false; } }
  rafId = requestAnimationFrame(loop);

  // ---- input ----
  const toWorld = (sx, sy) => [cam.x + (sx - W() / 2) / cam.zoom, cam.y + (sy - H() / 2) / cam.zoom];
  function setZoomAt(z, sx, sy) { z = Math.max(zMin, Math.min(zMax, z)); const [wx, wy] = toWorld(sx, sy); cam.zoom = z; cam.x = wx - (sx - W() / 2) / z; cam.y = wy - (sy - H() / 2) / z; dirty = true; }
  const cv = app.canvas;
  let drag = null;
  cv.addEventListener('wheel', (e) => { e.preventDefault(); setZoomAt(cam.zoom * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('pointermove', (e) => {
    if (drag) { cam.x -= (e.clientX - drag.x) / cam.zoom; cam.y -= (e.clientY - drag.y) / cam.zoom; drag = { x: e.clientX, y: e.clientY }; dirty = true; return; }
    const [wx, wy] = toWorld(e.clientX, e.clientY);
    const h = hit.pick(wx, wy, cam.zoom);
    if ((h?.region.id ?? null) !== (hoverRegion?.region.id ?? null) || h?.how !== hoverRegion?.how) { hoverRegion = h; drawHighlight(); dirty = true; }
  });
  addEventListener('keydown', (e) => { if (e.key >= '1' && e.key <= '3') { cam.zoom = zFit * 2 ** (+e.key - 1); dirty = true; } if (e.key === '0') { cam.x = (geo.bbox[0] + geo.bbox[2]) / 2; cam.y = (geo.bbox[1] + geo.bbox[3]) / 2; cam.zoom = zFit; dirty = true; } });

  // ---- bench / test API ----
  const api = {
    report: () => ({ ...T, heapNowMB: heapMB(), tiles: { count: tiles.tileCount, textureMB: tiles.textureBytes / 1048576, evictions: tiles.evictions, bakedTotal: tiles.log.length }, labelStats: { layout: summ(frameStats.labelLayoutMs), position: summ(frameStats.labelPosMs) }, tileUpdate: summ(frameStats.tileUpdateMs) }),
    tileLog: () => tiles.log,
    regions: () => geo.regions.map((r) => ({ id: r.id, name: r.name, kind: r.kind, area: r.area, bbox: r.bbox, cx: r.cx, cy: r.cy })),
    zFit,
    view: (mult, wx, wy) => { cam.zoom = zFit * mult; if (wx !== undefined) { cam.x = wx; cam.y = wy; } else { cam.x = (geo.bbox[0] + geo.bbox[2]) / 2; cam.y = (geo.bbox[1] + geo.bbox[3]) / 2; } dirty = true; return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => { gl.finish(); res(); }))); },
    focus: (id, mult) => { const r = geo.regions.find((x) => x.id === id); cam.zoom = zFit * mult; cam.x = r.cx; cam.y = r.cy; dirty = true; return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); },
    toScreen: (wx, wy) => [(wx - cam.x) * cam.zoom + W() / 2, (wy - cam.y) * cam.zoom + H() / 2],
    pickAt: (sx, sy) => { const [wx, wy] = toWorld(sx, sy); return hit.pick(wx, wy, cam.zoom); },
    labelInfo: () => labels ? labels.items.filter((i) => i.shown).map((i) => ({ id: i.r.id, text: i.text, kind: i.r.kind, size: i.place[0]?.f })) : [],
    labelCount: () => labels ? { shown: labels.items.filter((i) => i.shown).length, total: labels.items.length } : null,
    /** Scripted pan at each zoom level; per-frame rAF delta (vsync-capped) and JS cost of update+render submit. */
    async sweep(secondsPerLevel = 4, mults = [1, 2, 4]) {
      cancelAnimationFrame(rafId);
      const out = [];
      for (const m of mults) {
        cam.zoom = zFit * m;
        const hw = W() / 2 / cam.zoom, hh = H() / 2 / cam.zoom;
        const ax = Math.max(0, bw / 2 - hw), ay = Math.max(0, bh / 2 - hh), cx = (geo.bbox[0] + geo.bbox[2]) / 2, cy = (geo.bbox[1] + geo.bbox[3]) / 2;
        const speedPx = 900; // css px/s along the path
        const pathLenKm = 2 * Math.PI * Math.max(ax, ay, 1) * 0.8;
        const omega = ((speedPx / cam.zoom) / pathLenKm) * 2 * Math.PI;
        const dts = [], cpus = [], evBefore = tiles.log.length; let prev = null, t = 0;
        const lp0 = frameStats.labelPosMs.length;
        await new Promise((resolve) => {
          const step = (ts) => {
            if (prev !== null) { dts.push(ts - prev); }
            const dt = prev === null ? 16.7 : ts - prev; prev = ts; t += dt / 1000;
            cam.x = cx + ax * Math.cos(omega * t); cam.y = cy + ay * Math.sin(omega * t * 1.31);
            const c0 = nowMs(); frame(); cpus.push(nowMs() - c0);
            if (t < secondsPerLevel) requestAnimationFrame(step); else resolve();
          };
          requestAnimationFrame(step);
        });
        gl.finish();
        out.push({ mult: m, zoom: cam.zoom, frames: dts.length, rafMs: summ(dts), cpuMs: summ(cpus), over20ms: dts.filter((d) => d > 20).length, over33ms: dts.filter((d) => d > 33.4).length, tilesBakedDuring: tiles.log.length - evBefore, labelPosMs: summ(frameStats.labelPosMs.slice(lp0)) });
      }
      rafId = requestAnimationFrame(loop); dirty = true;
      return out;
    },
    /** Uncapped: JS + GPU time per frame (gl.finish after each render), camera nudged each iteration. */
    renderCost(mult, iters = 150) {
      cam.zoom = zFit * mult; const cx = (geo.bbox[0] + geo.bbox[2]) / 2, cy = (geo.bbox[1] + geo.bbox[3]) / 2;
      const ts = [];
      for (let i = 0; i < iters; i++) { cam.x = cx + Math.sin(i * 0.37) * 120; cam.y = cy + Math.cos(i * 0.23) * 90; const a = nowMs(); frame(1e9); gl.finish(); ts.push(nowMs() - a); }
      dirty = true; return summ(ts);
    },
    /** Hit-test verification against an independent id-buffer rasteriser, plus border/small-region/timing tests. */
    hitTests(mult = 1, samples = 20000) {
      const zoom = zFit * mult, out = { mult, zoom, samples };
      const w = Math.min(Math.round(bw * zoom), 3000), h = Math.min(Math.round(bh * zoom), 3000);
      const cvs = document.createElement('canvas'); cvs.width = w; cvs.height = h;
      const c = cvs.getContext('2d', { willReadFrequently: true });
      c.imageSmoothingEnabled = false;
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
      c.setTransform(zoom, 0, 0, zoom, -geo.bbox[0] * zoom, -geo.bbox[1] * zoom);
      geo.regions.forEach((r, i) => { const n = i + 1; c.fillStyle = `rgb(${n & 255},${(n >> 8) & 255},0)`; c.fill(r.path, 'evenodd'); });
      const img = c.getImageData(0, 0, w, h).data;
      const idAt = (px, py) => { if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1) return null; const o = (py * w + px) * 4; if (img[o + 2] !== 0 || (img[o] === 255 && img[o + 1] === 255)) return -1; return (img[o] | (img[o + 1] << 8)) - 1; };
      // 1. exact PIP vs id-buffer on interior pixels (all 4 neighbours same id = not an anti-aliased edge)
      let agree = 0, disagree = 0, none = 0, rngS = 12345;
      const rnd = () => { rngS = (Math.imul(rngS, 1664525) + 1013904223) >>> 0; return rngS / 4294967296; };
      const mism = [];
      for (let i = 0; i < samples; i++) {
        const px = 1 + Math.floor(rnd() * (w - 2)), py = 1 + Math.floor(rnd() * (h - 2));
        const a = idAt(px, py); if (a === null || a === -1) { none++; continue; }
        if (idAt(px + 1, py) !== a || idAt(px - 1, py) !== a || idAt(px, py + 1) !== a || idAt(px, py - 1) !== a) { none++; continue; }
        const wx = geo.bbox[0] + (px + 0.5) / zoom, wy = geo.bbox[1] + (py + 0.5) / zoom;
        const r = hit.pick(wx, wy, 1e6, { tolPx: 0, smallTolPx: 0, smallPx: 0 }); // pure inside-test (tol in km = tolPx/zoom = 0)
        if (r && r.region.idx === a) agree++; else { disagree++; if (mism.length < 5) mism.push({ px, py, expect: geo.regions[a].id, got: r?.region.id ?? null }); }
      }
      out.pipVsIdBuffer = { interiorSamples: agree + disagree, agree, disagree, skippedEdgeOrSea: none, examples: mism };
      // 2. border points: on each region ring, (a) the pick must be a region that really touches that spot (within 1.5 px)
      //    and never null; (b) a point 1.5 px inside region A must pick A.
      let bTotal = 0, bTouch = 0, bNull = 0, bFar = 0, inTotal = 0, inOk = 0; const bFarEx = [];
      for (const r of geo.regions) for (const poly of r.polys) { const ring = poly[0]; const n = ring.length / 2; const stepI = Math.max(1, Math.floor(n / 30));
        for (let i = stepI; i < n - 1; i += stepI) {
          const vx = ring[2 * i], vy = ring[2 * i + 1], tx = ring[2 * i + 2] - ring[2 * i - 2], ty = ring[2 * i + 3] - ring[2 * i - 1], L = Math.hypot(tx, ty) || 1;
          const nx = -ty / L, ny = tx / L;
          const touching = new Set();
          for (const rr of geo.regions) if (HitIndex.inside(rr, vx, vy) || HitIndex.distToBorder(rr, vx, vy, 1.5 / zoom) < Infinity) touching.add(rr.id);
          bTotal++;
          const res = hit.pick(vx, vy, zoom);
          if (!res) bNull++; else if (touching.has(res.region.id)) bTouch++; else { bFar++; if (bFarEx.length < 5) bFarEx.push({ at: [vx, vy], got: res.region.id, touching: [...touching], how: res.how }); }
          // 1.5 px inside r (try both normals; keep the side that is inside r and not inside any smaller region)
          for (const s of [-1, 1]) { const px_ = vx + nx * s * 1.5 / zoom, py_ = vy + ny * s * 1.5 / zoom;
            if (!HitIndex.inside(r, px_, py_)) continue;
            const diam = Math.max(r.bbox[2] - r.bbox[0], r.bbox[3] - r.bbox[1]) * zoom; if (diam < 28) continue; // small-region rule applies instead
            inTotal++; const q = hit.pick(px_, py_, zoom); if (q && q.region.id === r.id) inOk++; break; }
        } }
      out.borderPoints = { total: bTotal, returnedTouchingRegion: bTouch, returnedNull: bNull, returnedNonTouchingRegion: bFar, examples: bFarEx, insideBy1p5px: { total: inTotal, pickedThatRegion: inOk } };
      // 3. small regions: hit rate vs distance (px) from the region's edge. "qualifying" = on-screen diameter <= 28 px
      //    (the small-region rule applies); others get no special pick radius, as intended.
      const small = geo.regions.filter((r) => r.kind === 'keypoint');
      const diamPx = (r) => Math.max(r.bbox[2] - r.bbox[0], r.bbox[3] - r.bbox[1]) * zoom;
      const rows = [];
      for (const dPx of [-3, 0, 4, 8, 12, 16, 24]) {
        const acc = { all: [0, 0, 0], qualifying: [0, 0, 0] };
        for (const r of small) {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            let d = 0; while (HitIndex.inside(r, r.cx + dx * d, r.cy + dy * d) && d < 100) d += 0.02;
            const x = r.cx + dx * (d + dPx / zoom), y = r.cy + dy * (d + dPx / zoom);
            const a = hit.pick(x, y, zoom), b = hit.pick(x, y, zoom, { smallTolPx: 0, smallPx: 0, tolPx: 0 });
            for (const k of diamPx(r) <= 28 ? ['all', 'qualifying'] : ['all']) { acc[k][2]++; if (a && a.region.id === r.id) acc[k][0]++; if (b && b.region.id === r.id) acc[k][1]++; }
          }
        }
        const pc = (k) => ({ n: acc[k][2], withRulePct: acc[k][2] ? +(100 * acc[k][0] / acc[k][2]).toFixed(1) : null, pureInsideTestPct: acc[k][2] ? +(100 * acc[k][1] / acc[k][2]).toFixed(1) : null });
        rows.push({ pxOutsideEdge: dPx, all: pc('all'), qualifying: pc('qualifying') });
      }
      out.smallRegions = { count: small.length, screenDiameterPx: small.map((r) => Math.round(diamPx(r))).sort((a, b) => a - b), hitRateByDistance: rows };      // 4. timing
      const t = nowMs(); let acc = 0;
      for (let i = 0; i < 20000; i++) { const r = hit.pick(geo.bbox[0] + rnd() * bw, geo.bbox[1] + rnd() * bh, zoom); if (r) acc++; }
      out.pickMicros = ((nowMs() - t) / 20000) * 1000; out.pickHits = acc;
      return out;
    },
  };
  window.__tripwire = api;
  window.__tripwireReady = true;
  setHud();
}
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
function summ(a) {
  if (!a.length) return { n: 0 };
  const s = [...a].sort((x, y) => x - y), p = (f) => s[Math.min(s.length - 1, Math.floor(f * s.length))];
  return { n: a.length, mean: avg(a), p50: p(0.5), p95: p(0.95), p99: p(0.99), max: s[s.length - 1] };
}
main().catch((e) => { window.__tripwireError = String(e?.stack ?? e); console.error(e); hud.textContent = 'ERROR ' + e; });
