// Generic loader: any GeoJSON FeatureCollection -> projected, densified, roughened regions in a km plane.
// Features are classified by properties.kind: 'land' | 'river' | anything else is a region.
// If the collection has a `projection` member (as our generator writes) it is used, else a conic conformal is fitted.
import { geoConicConformal, geoBounds } from 'd3-geo';

// ---- seeded value noise (own code; no Math.random, so screenshots reproduce) ----
function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
export function vnoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = fade(x - ix), fy = fade(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed), c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy; // 0..1
}
/** Displacement field: same input point -> same output, so shared borders stay shared at every LOD. */
export function displace(x, y, amp, seed) {
  // two octaves: ~28 km wobble and ~7 km tremor, in km
  const n1x = vnoise(x / 28, y / 28, seed) - 0.5, n1y = vnoise(x / 28 + 31.7, y / 28 - 12.3, seed) - 0.5;
  const n2x = vnoise(x / 7, y / 7, seed + 1) - 0.5, n2y = vnoise(x / 7 + 5.1, y / 7 + 9.9, seed + 1) - 0.5;
  return [(n1x * 1.0 + n2x * 0.45) * amp, (n1y * 1.0 + n2y * 0.45) * amp];
}

function densify(ring, maxSeg) {
  const out = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i], [x1, y1] = ring[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / maxSeg));
    for (let k = 0; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  out.push(ring[ring.length - 1]);
  return out;
}

function flat(ring) { const a = new Float64Array(ring.length * 2); ring.forEach((p, i) => { a[2 * i] = p[0]; a[2 * i + 1] = p[1]; }); return a; }
function ringBBox(f, b) { for (let i = 0; i < f.length; i += 2) { if (f[i] < b[0]) b[0] = f[i]; if (f[i] > b[2]) b[2] = f[i]; if (f[i + 1] < b[1]) b[1] = f[i + 1]; if (f[i + 1] > b[3]) b[3] = f[i + 1]; } }
function ringArea(f) { let a = 0; const n = f.length / 2; for (let i = 0; i < n - 1; i++) a += f[2 * i] * f[2 * i + 3] - f[2 * i + 2] * f[2 * i + 1]; return a / 2; }

export function loadGeo(fc, opts = {}) {
  const t0 = performance.now();
  const amp = opts.amp ?? 2.2, seg = opts.maxSeg ?? 1.6;
  let proj;
  if (fc.projection) {
    const p = fc.projection;
    proj = geoConicConformal().parallels(p.parallels).rotate(p.rotate).center(p.center).scale(p.scale).translate([0, 0]);
  } else {
    const b = geoBounds({ type: 'FeatureCollection', features: fc.features });
    const lat0 = (b[0][1] + b[1][1]) / 2, lon0 = (b[0][0] + b[1][0]) / 2;
    proj = geoConicConformal().parallels([lat0 - 5, lat0 + 5]).rotate([-lon0, 0]).center([0, lat0]).scale(6371.0088).translate([0, 0]);
  }
  const rough = (ring, seed, a) => ring.map(([x, y]) => { const d = displace(x, y, a, seed); return [x + d[0], y + d[1]]; });
  const prepRing = (ring, closed, seed, a) => {
    const p = ring.map((c) => proj(c));
    return rough(densify(p, seg), seed, a);
  };
  const bboxAll = [Infinity, Infinity, -Infinity, -Infinity];
  const out = { regions: [], rivers: [], land: null, bbox: bboxAll, prepMs: 0, vertexCount: 0 };
  for (const f of fc.features) {
    const kind = f.properties?.kind;
    const g = f.geometry;
    if (kind === 'river') {
      const lines = (g.type === 'LineString' ? [g.coordinates] : g.coordinates).map((l) => flat(prepRing(l, false, 11, amp * 0.6)));
      out.rivers.push({ id: f.properties.id, name: f.properties.name, lines });
      out.vertexCount += lines.reduce((s, l) => s + l.length / 2, 0);
      continue;
    }
    const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).map((poly) => poly.map((r) => flat(prepRing(r, true, 7, amp))));
    const bbox = [Infinity, Infinity, -Infinity, -Infinity];
    let area = 0, cx = 0, cy = 0;
    polys.forEach((poly) => {
      ringBBox(poly[0], bbox);
      let a = Math.abs(ringArea(poly[0]));
      for (let i = 1; i < poly.length; i++) a -= Math.abs(ringArea(poly[i]));
      area += a;
    });
    cx = (bbox[0] + bbox[2]) / 2; cy = (bbox[1] + bbox[3]) / 2;
    out.vertexCount += polys.reduce((s, p) => s + p.reduce((q, r) => q + r.length / 2, 0), 0);
    if (kind === 'land') { out.land = { polys, bbox }; continue; }
    // second, finer displacement for the "pen wobble" pass of the ink border
    const polysB = polys.map((poly) => poly.map((r) => { const o = new Float64Array(r.length); for (let i = 0; i < r.length; i += 2) { const d = displace(r[i], r[i + 1], 0.55, 23); o[i] = r[i] + d[0]; o[i + 1] = r[i + 1] + d[1]; } return o; }));
    out.regions.push({ id: f.properties.id, name: f.properties.name ?? f.properties.id, kind: kind ?? 'area', controlA: f.properties.controlA ?? 500, polys, polysB, bbox, area, cx, cy, idx: out.regions.length });
  }
  const regs = out.land ? [out.land] : out.regions;
  for (const r of regs) { bboxAll[0] = Math.min(bboxAll[0], r.bbox[0]); bboxAll[1] = Math.min(bboxAll[1], r.bbox[1]); bboxAll[2] = Math.max(bboxAll[2], r.bbox[2]); bboxAll[3] = Math.max(bboxAll[3], r.bbox[3]); }
  out.prepMs = performance.now() - t0;
  return out;
}

/** Build Path2D objects once (world km coordinates); strokes and fills reuse them at every LOD. */
export function buildPaths(geo) {
  const mk = (polys) => { const p = new Path2D(); for (const poly of polys) for (const r of poly) { p.moveTo(r[0], r[1]); for (let i = 2; i < r.length; i += 2) p.lineTo(r[i], r[i + 1]); p.closePath(); } return p; };
  const t0 = performance.now();
  if (geo.land) geo.land.path = mk(geo.land.polys);
  for (const r of geo.regions) { r.path = mk(r.polys); r.pathB = mk(r.polysB); }
  for (const rv of geo.rivers) { const p = new Path2D(); for (const l of rv.lines) { p.moveTo(l[0], l[1]); for (let i = 2; i < l.length; i += 2) p.lineTo(l[i], l[i + 1]); } rv.path = p; }
  geo.pathMs = performance.now() - t0;
}
