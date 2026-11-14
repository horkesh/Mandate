// Generates stand-in regions for the map tripwire (lane 0.10) from a fixed seed.
//
// Why synthetic: the lead ruled out Census files (census.gov blocks this machine) and Newberry data is unlicensed
// for now. The tripwire measures rendering, not geographic accuracy, so regions are seeded Voronoi cells clipped to
// Natural Earth state outlines (public domain, see fetch-natural-earth.mjs), with deliberately hard cases added:
//   - "keypoint" regions: 4-8 km discs (river-junction sized), carved out of their neighbours
//   - "strip" regions: long thin curved regions (valley-like), carved out of their neighbours
// Output is lon/lat GeoJSON (like real pack data would be) plus a "projection" member so the loader stays generic.
//
// Usage: node scripts/generate-regions.mjs   (writes data/regions-40.geojson and data/regions-250.geojson)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import { geoConicConformal } from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import polygonClipping from 'polygon-clipping';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ne = (n) => join(root, 'data', 'ne', n);
export const SEED = 0x4d414e44; // fixed; "MAND"

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Kilometre plane: conic conformal, y down, 1 unit = 1 km. The loader rebuilds the same projection from the file.
const PROJ = { type: 'conicConformal', parallels: [33, 45], rotate: [84, 0], center: [0, 35], scale: 6371.0088 };
const proj = geoConicConformal().parallels(PROJ.parallels).rotate(PROJ.rotate).center(PROJ.center).scale(PROJ.scale).translate([0, 0]);

const SCENARIOS = [
  {
    name: 'regions-40', total: 40, keys: 6, strips: 3, tol: 0.4, seed: SEED,
    states: ['VA', 'WV', 'MD', 'DE', 'DC'],
  },
  {
    name: 'regions-250', total: 250, keys: 30, strips: 14, tol: 1.0, seed: SEED + 1,
    states: ['PA', 'NJ', 'DE', 'MD', 'DC', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'LA', 'AR', 'TN', 'KY', 'MO', 'OH', 'IN', 'IL'],
  },
];

// ---------- geometry helpers (all in km plane) ----------
const toMulti = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
function dp(ring, tol) { // Douglas-Peucker on an open polyline
  const keep = new Uint8Array(ring.length); keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const [ax, ay] = ring[a], [bx, by] = ring[b];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((ring[i][0] - ax) * dy - (ring[i][1] - ay) * dx) / L;
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return ring.filter((_, i) => keep[i]);
}
function simplifyMulti(mp, tol) {
  const out = [];
  for (const poly of mp) {
    const rings = [];
    for (const r of poly) {
      const open = r.slice(0, -1);
      if (open.length < 4) continue;
      const s = dp(open, tol);
      if (s.length >= 3) rings.push([...s, s[0]]);
    }
    if (rings.length) out.push(rings);
  }
  return out;
}
function ringArea(r) { let a = 0; for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return a / 2; }
function multiArea(mp) { let t = 0; for (const p of mp) { t += Math.abs(ringArea(p[0])); for (let i = 1; i < p.length; i++) t -= Math.abs(ringArea(p[i])); } return t; }
function pip(pt, mp) {
  let inside = false;
  for (const poly of mp) for (const r of poly) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}
function bboxOf(mp) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of mp) for (const [x, y] of p[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
const projectRing = (r) => r.map(([lo, la]) => proj([lo, la]));

// ---------- fake place names (so no setting names enter the prototype) ----------
const SYL_A = ['Bar', 'Cal', 'Dun', 'Elm', 'Fen', 'Gar', 'Har', 'Ive', 'Jas', 'Kes', 'Lin', 'Mar', 'Nor', 'Os', 'Pen', 'Quin', 'Ros', 'Sal', 'Tay', 'Ul', 'Ven', 'Wes', 'Yar', 'Ash', 'Bran', 'Cor', 'Dal', 'Ell'];
const SYL_B = ['ton', 'ford', 'wick', 'mont', 'dale', 'field', 'burg', 'haven', 'mere', 'ley', 'stead', 'port', 'worth', 'combe', 'ridge', 'gate', 'bury', 'low', 'by', 'holm'];
const WORD2 = ['Upper', 'Lower', 'Great', 'Little', 'Old', 'New', 'North', 'South', 'East', 'West'];
function makeName(rnd, kind) {
  const w = SYL_A[(rnd() * SYL_A.length) | 0] + SYL_B[(rnd() * SYL_B.length) | 0];
  if (kind === 'strip') return `${w} Valley`;
  if (kind === 'area' && rnd() < 0.22) return `${WORD2[(rnd() * WORD2.length) | 0]} ${w}`;
  return w;
}

async function build(sc) {
  const rnd = mulberry32(sc.seed);
  const all = await shapefile.read(ne('ne_10m_admin_1_states_provinces.shp'), ne('ne_10m_admin_1_states_provinces.dbf'));
  const clean = (s) => String(s).replace(/\0+$/g, '').trim(); // the dbf strings are NUL-padded
  const feats = all.features.filter((f) => clean(f.properties.adm0_a3) === 'USA' && sc.states.includes(clean(f.properties.postal)));
  if (feats.length !== sc.states.length) console.warn('states found:', feats.map((f) => clean(f.properties.postal)).join(','));

  // Land = union of the states, in the km plane, simplified.
  const polys = feats.map((f) => toMulti(f.geometry).map((p) => p.map(projectRing)));
  let land = polygonClipping.union(...polys.map((mp) => mp));
  land = simplifyMulti(land, sc.tol);
  const [lx0, ly0, lx1, ly1] = bboxOf(land);
  const landArea = multiArea(land);

  const nVor = sc.total - sc.keys - sc.strips;
  // Sites: best-candidate sampling inside land (evenly spread but irregular).
  const sites = [];
  const randomLandPoint = () => { for (;;) { const p = [lx0 + rnd() * (lx1 - lx0), ly0 + rnd() * (ly1 - ly0)]; if (pip(p, land)) return p; } };
  for (let i = 0; i < nVor; i++) {
    let best = null, bd = -1;
    for (let k = 0; k < 14; k++) {
      const p = randomLandPoint();
      let d = Infinity;
      for (const s of sites) d = Math.min(d, Math.hypot(p[0] - s[0], p[1] - s[1]));
      d *= 0.7 + rnd() * 0.6; // jitter the "best" so cells vary in size
      if (sites.length === 0 || d > bd) { bd = d; best = p; }
    }
    sites.push(best);
  }
  const vor = new Delaunay(Float64Array.from(sites.flat())).voronoi([lx0 - 20, ly0 - 20, lx1 + 20, ly1 + 20]);
  let regions = []; // {kind, geom: MultiPolygon(km)}
  for (let i = 0; i < nVor; i++) {
    const cell = vor.cellPolygon(i);
    if (!cell) continue;
    const g = polygonClipping.intersection(land, [[cell]]);
    if (g.length) regions.push({ kind: 'area', geom: g });
  }

  // Strips: long thin curved regions.
  let stripsMade = 0, tries = 0;
  while (stripsMade < sc.strips && tries++ < 400) {
    const len = 90 + rnd() * 70, step = 3, w0 = 7 + rnd() * 4;
    let [x, y] = randomLandPoint(), th = rnd() * Math.PI * 2, turn = 0;
    const L = [], R = [];
    for (let s = 0; s < len / step; s++) {
      turn = turn * 0.85 + (rnd() - 0.5) * 0.045; th += turn;
      const w = w0 * (0.85 + 0.3 * Math.sin(s * 0.35 + w0));
      const nx = -Math.sin(th), ny = Math.cos(th);
      L.push([x + (nx * w) / 2, y + (ny * w) / 2]); R.push([x - (nx * w) / 2, y - (ny * w) / 2]);
      x += Math.cos(th) * step; y += Math.sin(th) * step;
    }
    const ring = [...L, ...R.reverse()]; ring.push(ring[0]);
    let strip = polygonClipping.intersection(land, [[ring]]);
    // keep the biggest piece only so a strip is one connected region
    strip = strip.length ? [strip.sort((a, b) => multiArea([b]) - multiArea([a]))[0]] : [];
    if (!strip.length || multiArea(strip) < 400) continue;
    regions = regions.map((r) => ({ ...r, geom: polygonClipping.difference(r.geom, strip) })).filter((r) => r.geom.length);
    regions.push({ kind: 'strip', geom: strip });
    stripsMade++;
  }

  // Key points: small irregular discs carved from whatever they overlap.
  const keyCenters = [];
  tries = 0;
  while (keyCenters.length < sc.keys && tries++ < 2000) {
    const p = randomLandPoint();
    if (keyCenters.some((c) => Math.hypot(c[0] - p[0], c[1] - p[1]) < 30)) continue;
    const r0 = 4 + rnd() * 4, n = 12;
    const ring = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = r0 * (0.8 + rnd() * 0.4); ring.push([p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r]); }
    ring.push(ring[0]);
    const disc = polygonClipping.intersection(land, [[ring]]);
    if (!disc.length || multiArea(disc) < 25) continue;
    keyCenters.push(p);
    regions = regions.map((r) => ({ ...r, geom: polygonClipping.difference(r.geom, disc) })).filter((r) => r.geom.length);
    regions.push({ kind: 'keypoint', geom: disc });
  }

  // Properties, then back to lon/lat.
  const cx0 = lx0, cw = lx1 - lx0;
  const features = [];
  const toLL = (mp) => mp.map((poly) => poly.map((ring) => ring.map((p) => proj.invert(p).map((v) => +v.toFixed(5)))));
  features.push({ type: 'Feature', properties: { kind: 'land', id: 'land' }, geometry: { type: 'MultiPolygon', coordinates: toLL(land) } });
  regions.forEach((r, i) => {
    const mp = r.geom;
    const bb = bboxOf(mp);
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
    const control = Math.max(0, Math.min(1000, Math.round(500 + 520 * Math.sin(((cx - cx0) / cw) * 3.1 + (cy - ly0) * 0.002) + (rnd() - 0.5) * 140)));
    features.push({
      type: 'Feature',
      properties: { kind: r.kind, id: 'r' + String(i + 1).padStart(3, '0'), name: makeName(rnd, r.kind), controlA: control, areaKm2: Math.round(multiArea(mp)) },
      geometry: { type: 'MultiPolygon', coordinates: toLL(mp) },
    });
  });
  // Rivers from Natural Earth that touch the land bbox.
  const rv = await shapefile.read(ne('ne_10m_rivers_lake_centerlines.shp'), ne('ne_10m_rivers_lake_centerlines.dbf'));
  let nRiv = 0;
  for (const f of rv.features) {
    if (!f.geometry) continue;
    const lines = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const kept = [];
    for (const ln of lines) {
      const pr = ln.map((c) => proj(c));
      if (pr.some(([x, y]) => x >= lx0 && x <= lx1 && y >= ly0 && y <= ly1 && pip([x, y], land))) kept.push(dp(pr, sc.tol * 0.7).map((p) => proj.invert(p).map((v) => +v.toFixed(5))));
    }
    if (kept.length) { features.push({ type: 'Feature', properties: { kind: 'river', id: 'v' + nRiv++, name: f.properties.name || '' }, geometry: { type: 'MultiLineString', coordinates: kept } }); }
  }

  const counts = { area: 0, strip: 0, keypoint: 0 };
  regions.forEach((r) => counts[r.kind]++);
  const areas = regions.map((r) => multiArea(r.geom)).sort((a, b) => a - b);
  const fc = {
    type: 'FeatureCollection',
    projection: PROJ,
    meta: {
      generator: 'prototypes/map-tripwire/scripts/generate-regions.mjs',
      seed: sc.seed, scenario: sc.name, states: sc.states,
      licence: 'Land outlines and rivers: Natural Earth (public domain, https://www.naturalearthdata.com/about/terms-of-use/). Regions: synthetic, seeded.',
      counts, landKm2: Math.round(landArea), smallestKm2: Math.round(areas[0]), medianKm2: Math.round(areas[areas.length >> 1]), rivers: nRiv,
    },
    features,
  };
  mkdirSync(join(root, 'data'), { recursive: true });
  const out = join(root, 'data', sc.name + '.geojson');
  writeFileSync(out, JSON.stringify(fc));
  console.log(sc.name, JSON.stringify(fc.meta), `bbox ${Math.round(lx1 - lx0)}x${Math.round(ly1 - ly0)} km`, (JSON.stringify(fc).length / 1e6).toFixed(2) + ' MB');
}

const only = process.argv[2];
for (const sc of SCENARIOS) if (!only || sc.name === only) { const t = Date.now(); await build(sc); console.log(`  ${((Date.now() - t) / 1000).toFixed(1)} s`); }
