// Hit-testing: uniform grid over region bounding boxes + exact even-odd point-in-polygon on the roughened rings.
// Rules (screen-aware): inside wins (smallest region if overlapping); otherwise the nearest border within `tolPx`;
// regions smaller than `smallPx` on screen get an enlarged pick radius and beat the larger region they sit in.
export class HitIndex {
  constructor(geo, cell = 25) {
    this.geo = geo; this.cell = cell;
    this.x0 = geo.bbox[0]; this.y0 = geo.bbox[1];
    this.nx = Math.ceil((geo.bbox[2] - this.x0) / cell) + 1; this.ny = Math.ceil((geo.bbox[3] - this.y0) / cell) + 1;
    this.grid = Array.from({ length: this.nx * this.ny }, () => []);
    for (const r of geo.regions) {
      const [bx0, by0, bx1, by1] = r.bbox;
      for (let gy = Math.floor((by0 - this.y0) / cell); gy <= Math.floor((by1 - this.y0) / cell); gy++)
        for (let gx = Math.floor((bx0 - this.x0) / cell); gx <= Math.floor((bx1 - this.x0) / cell); gx++) this.grid[gy * this.nx + gx].push(r);
    }
  }
  static inside(r, x, y) {
    if (x < r.bbox[0] || x > r.bbox[2] || y < r.bbox[1] || y > r.bbox[3]) return false;
    let inside = false;
    for (const poly of r.polys) for (const ring of poly) {
      const n = ring.length / 2;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = ring[2 * i], yi = ring[2 * i + 1], xj = ring[2 * j], yj = ring[2 * j + 1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
    }
    return inside;
  }
  static distToBorder(r, x, y, cap) {
    let best = cap * cap;
    const limit = best; // nothing within `cap` -> Infinity (not `cap`), or every nearby region would count as a hit
    for (const poly of r.polys) for (const ring of poly) {
      const n = ring.length / 2;
      for (let i = 0; i < n - 1; i++) {
        const ax = ring[2 * i], ay = ring[2 * i + 1], bx = ring[2 * i + 2], by = ring[2 * i + 3];
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        let t = l2 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = ax + t * dx - x, ey = ay + t * dy - y, d2 = ex * ex + ey * ey;
        if (d2 < best) best = d2;
      }
    }
    return best < limit ? Math.sqrt(best) : Infinity;
  }
  /** @returns {{region, how:'inside'|'near'|'small', distKm}|null} */
  pick(x, y, zoom, o = {}) {
    const tolKm = (o.tolPx ?? 4) / zoom, smallKm = (o.smallPx ?? 28) / zoom, smallTolKm = (o.smallTolPx ?? 12) / zoom;
    const reach = Math.max(tolKm, smallTolKm);
    const cands = new Set();
    for (let gy = Math.floor((y - reach - this.y0) / this.cell); gy <= Math.floor((y + reach - this.y0) / this.cell); gy++)
      for (let gx = Math.floor((x - reach - this.x0) / this.cell); gx <= Math.floor((x + reach - this.x0) / this.cell); gx++)
        if (gx >= 0 && gy >= 0 && gx < this.nx && gy < this.ny) for (const r of this.grid[gy * this.nx + gx]) cands.add(r);
    let hit = null;
    // 1. small regions get an enlarged pick radius and win over the larger region beneath the cursor
    let bestSmall = null, bestD = Infinity;
    for (const r of cands) {
      const diam = Math.max(r.bbox[2] - r.bbox[0], r.bbox[3] - r.bbox[1]);
      if (diam > smallKm) continue;
      const d = HitIndex.inside(r, x, y) ? 0 : HitIndex.distToBorder(r, x, y, smallTolKm);
      if (d <= smallTolKm && d < bestD) { bestD = d; bestSmall = r; }
    }
    if (bestSmall) return { region: bestSmall, how: bestD === 0 ? 'inside' : 'small', distKm: bestD };
    // 2. exact inside (smallest area if several)
    for (const r of cands) if (HitIndex.inside(r, x, y) && (!hit || r.area < hit.area)) hit = r;
    if (hit) return { region: hit, how: 'inside', distKm: 0 };
    // 3. nearest border within tolerance (gaps between roughened rings, coast)
    let near = null; bestD = Infinity;
    for (const r of cands) { const d = HitIndex.distToBorder(r, x, y, tolKm); if (d <= tolKm && d < bestD) { bestD = d; near = r; } }
    return near ? { region: near, how: 'near', distKm: bestD } : null;
  }
}
