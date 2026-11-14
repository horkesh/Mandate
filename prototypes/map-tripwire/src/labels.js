// Curved, letter-spaced region names along a spine, with greedy collision and zoom-dependent display.
// Spine: PCA axis of grid samples inside the region, bin-centroids along the axis, smoothed.
// Glyphs: one BitmapText per letter (shared dynamic atlas), placed by arc length, rotated to the tangent.
import { BitmapText, BitmapFont, Container } from 'pixi.js';
import { HitIndex } from './hit.js';

const FONT = 'Georgia, "Times New Roman", serif';
const REF = 100; // measure advances at 100 px, scale to taste
let measureCtx = null;
function adv(ch) {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  measureCtx.font = `${REF}px ${FONT}`;
  return measureCtx.measureText(ch).width / REF; // em
}

export function computeSpine(r) {
  const [bx0, by0, bx1, by1] = r.bbox;
  const w = bx1 - bx0, h = by1 - by0, step = Math.max(w, h) / 56;
  const pts = [];
  for (let y = by0 + step / 2; y < by1; y += step) for (let x = bx0 + step / 2; x < bx1; x += step) if (HitIndex.inside(r, x, y)) pts.push([x, y]);
  if (pts.length < 4) return null;
  let mx = 0, my = 0; for (const [x, y] of pts) { mx += x; my += y; } mx /= pts.length; my /= pts.length;
  let sxx = 0, sxy = 0, syy = 0; for (const [x, y] of pts) { const dx = x - mx, dy = y - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  let ux = Math.cos(th), uy = Math.sin(th);
  if (ux < 0 || (Math.abs(ux) < 1e-6 && uy > 0)) { ux = -ux; uy = -uy; } // read left-to-right (or upward if vertical)
  const t = pts.map(([x, y]) => (x - mx) * ux + (y - my) * uy);
  let tmin = Infinity, tmax = -Infinity; for (const v of t) { if (v < tmin) tmin = v; if (v > tmax) tmax = v; }
  const K = Math.max(6, Math.min(28, Math.round(pts.length / 6)));
  const sums = Array.from({ length: K }, () => [0, 0, 0]);
  pts.forEach(([x, y], i) => { const b = Math.min(K - 1, Math.floor(((t[i] - tmin) / (tmax - tmin || 1)) * K)); sums[b][0] += x; sums[b][1] += y; sums[b][2]++; });
  let line = sums.filter((s) => s[2] >= 2).map((s) => [s[0] / s[2], s[1] / s[2]]);
  if (line.length < 2) return null;
  for (let pass = 0; pass < 3; pass++) line = line.map((p, i) => (i === 0 || i === line.length - 1) ? p : [(line[i - 1][0] + p[0] * 2 + line[i + 1][0]) / 4, (line[i - 1][1] + p[1] * 2 + line[i + 1][1]) / 4]);
  const cum = [0]; for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  const len = cum[cum.length - 1];
  const width = r.area / Math.max(len, 1e-6); // mean thickness, km
  return { line, cum, len, width };
}
function atArc(sp, s) { // point + tangent at arc length s (km)
  const { line, cum } = sp; s = Math.max(0, Math.min(sp.len, s));
  let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
  const seg = cum[i] - cum[i - 1] || 1e-9, f = (s - cum[i - 1]) / seg;
  const x = line[i - 1][0] + (line[i][0] - line[i - 1][0]) * f, y = line[i - 1][1] + (line[i][1] - line[i - 1][1]) * f;
  return { x, y, a: Math.atan2(line[i][1] - line[i - 1][1], line[i][0] - line[i - 1][0]) };
}

export class Labels {
  constructor(geo, layer, opts = {}) {
    this.geo = geo; this.layer = layer;
    this.minPx = opts.minPx ?? 9; this.maxPx = opts.maxPx ?? 28;
    this.items = [];
    const t0 = performance.now();
    // One shared glyph atlas for every label (installing it once avoids a bitmap font per BitmapText).
    const chars = [...new Set([...geo.regions.map((r) => r.name.toUpperCase()).join(''), ...' ABCDEFGHIJKLMNOPQRSTUVWXYZ'])].join('');
    BitmapFont.install({ name: 'MapLabel', style: { fontFamily: FONT, fontSize: REF, fill: 0x2a2017, stroke: { color: 0xeadfc5, width: 10 } }, chars: [chars], resolution: 1, padding: 2 });
    for (const r of geo.regions) {
      const text = r.name.toUpperCase();
      const sp = r.kind === 'keypoint' ? null : computeSpine(r);
      const container = new Container();
      const glyphs = [...text].map((ch) => {
        const g = new BitmapText({ text: ch, style: { fontFamily: 'MapLabel', fontSize: REF } });
        g.anchor.set(0.5, 0.5); container.addChild(g); return { sprite: g, ch, adv: ch === ' ' ? 0.3 : adv(ch) };
      });
      container.visible = false; layer.addChild(container);
      this.items.push({ r, text, sp, container, glyphs, shown: false, place: [] });
    }
    this.order = [...this.items].sort((a, b) => (b.r.kind === 'strip' ? 1e9 : 0) - (a.r.kind === 'strip' ? 1e9 : 0) || b.r.area - a.r.area);
    this.buildMs = performance.now() - t0;
  }

  /** Lay out every label for this zoom (px/km, CSS): sizes, spacing, collision, show/hide. */
  layout(zoom) {
    const t0 = performance.now();
    const cell = 48, grid = new Map(), circles = [];
    const key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
    const collides = (cs) => { for (const c of cs) { const gx = Math.floor(c.x / cell), gy = Math.floor(c.y / cell); for (let a = gx - 1; a <= gx + 1; a++) for (let b = gy - 1; b <= gy + 1; b++) { const l = grid.get(a + ',' + b); if (l) for (const o of l) if (Math.hypot(o.x - c.x, o.y - c.y) < o.r + c.r) return true; } } return false; };
    const add = (cs) => { for (const c of cs) { const k = key(c.x, c.y); (grid.get(k) ?? grid.set(k, []).get(k)).push(c); } };
    let shown = 0, hidden = 0;
    for (const it of this.order) {
      it.shown = false; it.place = [];
      const { r, glyphs } = it;
      const n = glyphs.length;
      let placed = null;
      if (it.sp) {
        const lenPx = it.sp.len * zoom, widthPx = it.sp.width * zoom;
        const natural = (f) => glyphs.reduce((s, g) => s + g.adv, 0) * f;
        for (const k of [1, 0.82, 0.66]) {
          let f = Math.min(this.maxPx, Math.max(this.minPx, 0.42 * widthPx)) * k;
          if (f < this.minPx) f = this.minPx;
          if (natural(f) > 0.94 * lenPx) f = (0.94 * lenPx) / natural(1);
          if (f < this.minPx || widthPx < f * 0.9) continue; // would not fit: shrink or hide
          const ls = Math.min(0.55 * f, Math.max(0, (0.8 * lenPx - natural(f)) / Math.max(1, n - 1)));
          const total = natural(f) + ls * (n - 1);
          let s = (lenPx - total) / 2;
          const cands = [], circ = []; let inside = 0;
          glyphs.forEach((g, i) => {
            const half = (g.adv * f) / 2;
            const p = atArc(it.sp, (s + half) / zoom);
            s += g.adv * f + ls;
            cands.push({ x: p.x, y: p.y, a: p.a, f });
            circ.push({ x: p.x * zoom, y: p.y * zoom, r: 0.5 * f });
            if (HitIndex.inside(r, p.x, p.y)) inside++;
          });
          if (inside / n < 0.85) continue;
          if (collides(circ)) continue;
          placed = { cands, circ };
          break;
        }
      } else if (r.kind === 'keypoint' && zoom * Math.max(r.bbox[2] - r.bbox[0], r.bbox[3] - r.bbox[1]) >= 11) {
        // small place: horizontal label to the right of the point; only shown when the point is big enough on screen
        const f = 11, total = glyphs.reduce((s, g) => s + g.adv, 0) * f + 1.2 * (n - 1);
        const rad = (Math.max(r.bbox[2] - r.bbox[0], r.bbox[3] - r.bbox[1]) / 2) * zoom + 5;
        let s = 0; const cands = [], circ = [];
        glyphs.forEach((g) => { const half = (g.adv * f) / 2; const x = r.cx + (rad + s + half) / zoom; s += g.adv * f + 1.2; cands.push({ x, y: r.cy, a: 0, f }); circ.push({ x: x * zoom, y: r.cy * zoom, r: 0.5 * f }); });
        void total;
        if (!collides(circ)) placed = { cands, circ };
      }
      if (placed) { add(placed.circ); it.shown = true; it.place = placed.cands; shown++; } else hidden++;
    }
    this.lastZoom = zoom;
    return { ms: performance.now() - t0, shown, hidden };
  }

  /** On pan: only positions change. */
  position(camX, camY, zoom, w, h) {
    const t0 = performance.now();
    let drawn = 0;
    for (const it of this.items) {
      if (!it.shown) { it.container.visible = false; continue; }
      it.container.visible = true;
      for (let i = 0; i < it.glyphs.length; i++) {
        const c = it.place[i], s = it.glyphs[i].sprite;
        s.position.set((c.x - camX) * zoom + w / 2, (c.y - camY) * zoom + h / 2);
        s.rotation = c.a; s.scale.set(c.f / REF); drawn++;
      }
    }
    return { ms: performance.now() - t0, glyphs: drawn };
  }
}
