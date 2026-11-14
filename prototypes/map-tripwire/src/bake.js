// Static-layer bake: land wash, region fills, hatching, rough ink borders, rivers, coast -> tiled textures.
// Painter: Canvas 2D (one reused scratch canvas), uploaded straight to a Pixi texture, then reused for the next tile.
// Tiles are `tileSize` px square (plus `PAD` px of real neighbouring content each side so bilinear sampling has no seams).
// LODs: 3 levels at 1x, 2x, 4x of the "fit" zoom; the camera range is fit*0.9 .. fit*4.
import { Texture, Sprite, Container, Rectangle } from 'pixi.js';
import { CanvasSource } from 'pixi.js';

export const PAD = 4;
export const PALETTE = {
  sea: '#b7c6c9', seaLine: '#8aa0a6', paper: '#eadfc5',
  A: [128, 154, 176], B: [201, 160, 118], ink: '#2a2017', hatch: '#3b2f23', river: '#5f8aa0',
};
function idHash(id) { let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
function mix(a, b, t) { return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`; }

export class TileSystem {
  /**
   * @param renderer Pixi renderer
   * @param geo loaded geometry (with paths built)
   * @param o {tileSize, zFit (CSS px/km), dpr, lodCount, mode:'eager'|'lazy', maxTiles}
   */
  constructor(renderer, geo, o) {
    this.renderer = renderer; this.geo = geo;
    this.T = o.tileSize; this.zFit = o.zFit; this.dpr = o.dpr; this.lodCount = o.lodCount ?? 3;
    this.mode = o.mode ?? 'eager'; this.maxTiles = o.maxTiles ?? 160; this.sync = !!o.sync; this.glSync = !!o.glSync; this.profile = !!o.profile; this.phase = {};
    const m = 20;
    this.wx0 = geo.bbox[0] - m; this.wy0 = geo.bbox[1] - m;
    this.wW = geo.bbox[2] - geo.bbox[0] + 2 * m; this.wH = geo.bbox[3] - geo.bbox[1] + 2 * m;
    this.root = new Container();
    this.lods = [];
    for (let k = 0; k < this.lodCount; k++) {
      const s = this.zFit * this.dpr * 2 ** k; // device px per km
      const pw = Math.ceil(this.wW * s), ph = Math.ceil(this.wH * s);
      const lod = { k, s, pw, ph, nx: Math.ceil(pw / this.T), ny: Math.ceil(ph / this.T), container: new Container(), tiles: new Map() };
      this.root.addChild(lod.container);
      this.lods.push(lod);
    }
    this.scratch = document.createElement('canvas');
    this.scratch.width = this.scratch.height = this.T + 2 * PAD;
    this.ctx = this.scratch.getContext('2d', { alpha: false });
    this.opt = !!o.opt;
    { // 9x9 px hatch tile (two lines, 4.5 px apart); rotated per region through the pattern transform
      const hc = document.createElement('canvas'); hc.width = hc.height = 9;
      const h = hc.getContext('2d'); h.strokeStyle = PALETTE.hatch; h.lineWidth = 0.7;
      h.beginPath(); h.moveTo(0, 2.25); h.lineTo(9, 2.25); h.moveTo(0, 6.75); h.lineTo(9, 6.75); h.stroke();
      this.pattern = this.ctx.createPattern(hc, 'repeat');
    }
    for (const rv of geo.rivers) { let b = [Infinity, Infinity, -Infinity, -Infinity]; for (const l of rv.lines) for (let i = 0; i < l.length; i += 2) { b = [Math.min(b[0], l[i]), Math.min(b[1], l[i + 1]), Math.max(b[2], l[i]), Math.max(b[3], l[i + 1])]; } rv.bbox = b; }
    this.source = null;
    this.log = []; // per tile: {lod,tx,ty,paintMs,uploadMs}
    this.queue = [];
    this.evictions = 0;
  }

  coastNear(x0, y0, x1, y1) {
    if (!this.coast) {
      const pts = []; for (const poly of this.geo.land.polys) for (const ring of poly) for (let i = 0; i < ring.length; i += 2) pts.push(ring[i], ring[i + 1]);
      this.coast = Float64Array.from(pts);
    }
    const c = this.coast;
    for (let i = 0; i < c.length; i += 2) if (c[i] >= x0 && c[i] <= x1 && c[i + 1] >= y0 && c[i + 1] <= y1) return true;
    return false;
  }
  landContains(x, y) {
    let inside = false;
    for (const poly of this.geo.land.polys) for (const ring of poly) {
      const n = ring.length / 2;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = ring[2 * i], yi = ring[2 * i + 1], xj = ring[2 * j], yj = ring[2 * j + 1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
    }
    return inside;
  }

  lodForZoom(zoomCss) { // smallest LOD whose native scale is >= the view scale
    for (const l of this.lods) if (l.s >= zoomCss * this.dpr * 0.999) return l.k;
    return this.lodCount - 1;
  }

  paintTile(lod, tx, ty) {
    const { ctx, geo, T } = this, s = lod.s;
    const tw = Math.min(T, lod.pw - tx * T), th = Math.min(T, lod.ph - ty * T);
    const W = T + 2 * PAD;
    // world -> canvas px
    const ox = -(this.wx0 * s) + PAD - tx * T, oy = -(this.wy0 * s) + PAD - ty * T;
    const wxmin = (tx * T - PAD) / s + this.wx0, wymin = (ty * T - PAD) / s + this.wy0;
    const wxmax = wxmin + W / s, wymax = wymin + W / s;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.sea; ctx.fillRect(0, 0, W, W);
    ctx.setTransform(s, 0, 0, s, ox, oy);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const px = (n) => n / s; // px -> world units for line widths
    const hits = (b) => b[0] <= wxmax && b[2] >= wxmin && b[1] <= wymax && b[3] >= wymin;
    const ph = (name) => { if (!this.profile) return; ctx.getImageData(0, 0, 1, 1); const t = performance.now(); this.phase[name] = (this.phase[name] ?? 0) + (t - this._pt); this._pt = t; };
    if (this.profile) { ctx.getImageData(0, 0, 1, 1); this._pt = performance.now(); }
    // 1. engraver's water lines (offshore halos) then land wash
    // opt: tiles that do not touch the coast skip the (very expensive) stroke of the whole land outline.
    const mg = 20 / s;
    const nearCoast = !this.opt || this.coastNear(wxmin - mg, wymin - mg, wxmax + mg, wymax + mg);
    if (geo.land && hits(geo.land.bbox)) {
      if (nearCoast) {
        ctx.strokeStyle = PALETTE.seaLine;
        for (const [w, a] of [[16, 0.10], [11, 0.12], [7, 0.16], [3.5, 0.22]]) { ctx.globalAlpha = a; ctx.lineWidth = px(w); ctx.stroke(geo.land.path); }
        ctx.globalAlpha = 1; ctx.fillStyle = PALETTE.paper; ctx.fill(geo.land.path);
      } else if (this.landContains((wxmin + wxmax) / 2, (wymin + wymax) / 2)) {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PALETTE.paper; ctx.fillRect(0, 0, W, W); ctx.restore();
      }
    }
    ph('water+land');
    // 2. region fills
    for (const r of geo.regions) {
      if (!hits(r.bbox)) continue;
      ctx.globalAlpha = r.kind === 'keypoint' ? 0.8 : 0.55;
      ctx.fillStyle = mix(PALETTE.B, PALETTE.A, r.controlA / 1000);
      ctx.fill(r.path, 'evenodd');
    }
    ctx.globalAlpha = 1; ph('fills');
    // 3. hatching, clipped to each region (constant ~4.5 px spacing at each LOD's native zoom)
    const sp = 4.5;
    ctx.strokeStyle = PALETTE.hatch;
    for (const r of geo.regions) {
      if (!hits(r.bbox) || r.kind === 'keypoint') continue;
      const ang = idHash(r.id) * Math.PI;
      if (this.opt) {
        // opt: one pattern fill per region instead of clip + many stroked lines. The pattern is phase-locked to the
        // LOD's global pixel grid (origin = world origin), so hatching is continuous across tile seams.
        ctx.globalAlpha = 0.22 + 0.18 * Math.abs(r.controlA - 500) / 500;
        this.pattern.setTransform(new DOMMatrix().scale(1 / s).translate(this.wx0 * s, this.wy0 * s).rotate((ang * 180) / Math.PI));
        ctx.fillStyle = this.pattern; ctx.fill(r.path, 'evenodd');
        continue;
      }
      const cs = Math.cos(ang), sn = Math.sin(ang);
      // visible rect of region in canvas px
      const rx0 = Math.max(0, (r.bbox[0]) * s + ox), ry0 = Math.max(0, (r.bbox[1]) * s + oy);
      const rx1 = Math.min(W, (r.bbox[2]) * s + ox), ry1 = Math.min(W, (r.bbox[3]) * s + oy);
      if (rx1 <= rx0 || ry1 <= ry0) continue;
      ctx.save();
      ctx.clip(r.path, 'evenodd');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.22 + 0.18 * Math.abs(r.controlA - 500) / 500;
      ctx.lineWidth = 0.7;
      // project rect corners on the hatch normal to get the offset range
      const nx = -sn, ny = cs;
      const cs4 = [[rx0, ry0], [rx1, ry0], [rx0, ry1], [rx1, ry1]].map(([x, y]) => x * nx + y * ny);
      const dmin = Math.min(...cs4), dmax = Math.max(...cs4);
      const L = Math.hypot(rx1 - rx0, ry1 - ry0), mx = (rx0 + rx1) / 2, my = (ry0 + ry1) / 2;
      ctx.beginPath();
      const gx = tx * T - PAD, gy = ty * T - PAD, shift = gx * nx + gy * ny; // phase-lock lines to the global pixel grid
      for (let d = Math.ceil((dmin + shift) / sp) * sp - shift; d <= dmax; d += sp) {
        const cx = nx * d, cy = ny * d; // a point on the line; project onto the rect center along the line direction
        const t = (mx - cx) * cs + (my - cy) * sn;
        const bx = cx + cs * t, by = cy + sn * t;
        ctx.moveTo(bx - cs * L, by - sn * L); ctx.lineTo(bx + cs * L, by + sn * L);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1; ph('hatching');
    // 4. rivers (clipped to land)
    if (geo.rivers.length && geo.land) {
      ctx.save(); if (nearCoast) ctx.clip(geo.land.path, 'evenodd');
      ctx.strokeStyle = PALETTE.river; ctx.lineWidth = px(1.2 + 0.3 * lod.k); ctx.globalAlpha = 0.85;
      for (const rv of geo.rivers) if (!this.opt || hits(rv.bbox)) ctx.stroke(rv.path);
      ctx.restore(); ctx.globalAlpha = 1;
    }
    ph('rivers');
    // 5. rough ink borders: two passes with independent wobble
    ctx.strokeStyle = PALETTE.ink;
    for (const r of geo.regions) {
      if (!hits(r.bbox)) continue;
      const key = r.kind === 'keypoint';
      ctx.globalAlpha = key ? 0.95 : 0.8; ctx.lineWidth = px((key ? 1.8 : 1.15) + 0.2 * lod.k); ctx.stroke(r.path);
      ctx.globalAlpha = 0.4; ctx.lineWidth = px((key ? 1.0 : 0.7) + 0.1 * lod.k); ctx.stroke(r.pathB);
    }
    ph('borders');
    // 6. coast
    if (geo.land && hits(geo.land.bbox) && nearCoast) { ctx.globalAlpha = 0.9; ctx.lineWidth = px(1.7 + 0.2 * lod.k); ctx.stroke(geo.land.path); }
    ctx.globalAlpha = 1; ph('coast');
    // Canvas 2D is deferred: paint calls only record commands. A 1x1 readback forces the raster to finish, so the
    // measured time is real. (`sync` option; without it the numbers are command-recording time only.)
    if (this.sync) ctx.getImageData(0, 0, 1, 1);
    return { tw, th };
  }

  /** Paint + upload one tile; returns the tile record. */
  bakeTile(k, tx, ty) {
    const lod = this.lods[k], id = ty * lod.nx + tx;
    if (lod.tiles.has(id)) return lod.tiles.get(id);
    const gl = this.renderer.gl;
    const t0 = performance.now();
    const { tw, th } = this.paintTile(lod, tx, ty);
    const t1 = performance.now();
    const source = new CanvasSource({ resource: this.scratch, scaleMode: 'linear', autoGenerateMipmaps: false, width: this.T + 2 * PAD, height: this.T + 2 * PAD, resolution: 1 });
    this.renderer.texture.initSource(source); // uploads now (texImage2D from the canvas)
    if (this.glSync) { // force completion without reading the canvas back: read 1 px of the uploaded texture
      const gt = this.renderer.texture.getGlSource(source);
      this.fbo ??= gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gt.texture, 0);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, (this.px1 ??= new Uint8Array(4)));
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.finish(); // so uploadMs includes the GPU copy, not just the call
    const t2 = performance.now();
    // freeze: the scratch canvas is reused next tile; never update() this source again
    const tex = new Texture({ source, frame: new Rectangle(PAD, PAD, tw, th) });
    const sprite = new Sprite(tex);
    sprite.scale.set(1 / lod.s);
    sprite.position.set(this.wx0 + (tx * this.T) / lod.s, this.wy0 + (ty * this.T) / lod.s);
    lod.container.addChild(sprite);
    const tile = { k, tx, ty, id, sprite, tex, paintMs: t1 - t0, uploadMs: t2 - t1, bytes: (this.T + 2 * PAD) ** 2 * 4, used: 0 };
    lod.tiles.set(id, tile);
    this.log.push({ lod: k, tx, ty, paintMs: tile.paintMs, uploadMs: tile.uploadMs });
    return tile;
  }

  bakeLodAll(k) { const lod = this.lods[k]; const t0 = performance.now(); for (let ty = 0; ty < lod.ny; ty++) for (let tx = 0; tx < lod.nx; tx++) this.bakeTile(k, tx, ty); return performance.now() - t0; }

  evictOne(keepLod) {
    let victim = null;
    for (const l of this.lods) { if (l.k === 0 || l.k === keepLod) continue; for (const t of l.tiles.values()) if (!victim || t.used < victim.used) victim = t; }
    if (!victim) { for (const t of this.lods[keepLod].tiles.values()) if (!victim || t.used < victim.used) victim = t; }
    if (!victim) return false;
    const lod = this.lods[victim.k];
    lod.container.removeChild(victim.sprite); victim.sprite.destroy(); victim.tex.destroy(true); // frees GPU memory
    lod.tiles.delete(victim.id); this.evictions++;
    return true;
  }
  get tileCount() { return this.lods.reduce((n, l) => n + l.tiles.size, 0); }
  get textureBytes() { let b = 0; for (const l of this.lods) for (const t of l.tiles.values()) b += t.bytes; return b; }

  /** Per frame: pick LOD, show visible tiles, in lazy mode queue + bake within a time budget. */
  update(view, frameBudgetMs = 6, frame = 0) {
    const k = this.lodForZoom(view.zoom);
    const { x0, y0, x1, y1 } = view.worldRect; // km
    const stats = { lod: k, visible: 0, missing: 0, bakedThisFrame: 0 };
    const lod = this.lods[k];
    const tkm = this.T / lod.s;
    const ix0 = Math.max(0, Math.floor((x0 - this.wx0) / tkm)), ix1 = Math.min(lod.nx - 1, Math.floor((x1 - this.wx0) / tkm));
    const iy0 = Math.max(0, Math.floor((y0 - this.wy0) / tkm)), iy1 = Math.min(lod.ny - 1, Math.floor((y1 - this.wy0) / tkm));
    const need = [];
    for (let ty = iy0; ty <= iy1; ty++) for (let tx = ix0; tx <= ix1; tx++) need.push([tx, ty]);
    for (const l of this.lods) {
      if (l.k === 0 || l.k === k) {
        l.container.visible = true;
        for (const t of l.tiles.values()) t.sprite.visible = false;
      } else l.container.visible = false;
    }
    if (this.mode === 'lazy' && k > 0) {
      const t0 = performance.now();
      for (const [tx, ty] of need) {
        const id = ty * lod.nx + tx;
        if (!lod.tiles.has(id)) { stats.missing++; if (performance.now() - t0 < frameBudgetMs) { while (this.tileCount >= this.maxTiles && this.evictOne(k)); this.bakeTile(k, tx, ty); stats.bakedThisFrame++; } }
      }
    }
    for (const [tx, ty] of need) { const t = lod.tiles.get(ty * lod.nx + tx); if (t) { t.sprite.visible = true; t.used = frame; stats.visible++; } }
    // lod0 underlay is only needed while tiles are missing; hide it when the active LOD fully covers the view
    if (k > 0) { const l0 = this.lods[0]; l0.container.visible = stats.missing > 0; }
    return stats;
  }
}
