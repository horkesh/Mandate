import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('the complete brief has 36 clean and rough icons with neutral ink and recipes', async () => {
  assert.ok(existsSync(new URL('../src/catalog.mjs', import.meta.url)), 'the icon catalogue must exist');
  const { icons, renderSVG } = await import('../src/catalog.mjs');
  assert.equal(icons.length, 36);
  assert.equal(new Set(icons.map(x => x.id)).size, 36);
  for (const icon of icons) {
    const svg = renderSVG(icon);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /currentColor/);
    assert.doesNotMatch(svg, /<(text|image|script|foreignObject)\b|#[0-9a-f]{3,8}\b|\brgb\(/i);
    for (const kind of ['clean', 'rough']) {
      const path = new URL(`../icons/${kind}/${icon.id}.svg`, import.meta.url);
      assert.ok(existsSync(path), `${kind}/${icon.id}`);
      assert.ok(existsSync(`${path.pathname}.recipe.json`) || existsSync(new URL(`${path.href}.recipe.json`)));
    }
  }
});

test('roughening is repeatable, seed-sensitive and preserves closed paths', async () => {
  assert.ok(existsSync(new URL('../src/roughen.mjs', import.meta.url)), 'seeded roughening must exist');
  const { roughen } = await import('../src/roughen.mjs');
  const shape = { points: [[3,3],[20,3],[20,20],[3,20]], closed: true };
  const a = roughen(shape, 4816);
  assert.deepEqual(a, roughen(shape, 4816));
  assert.notDeepEqual(a, roughen(shape, 4817));
  assert.equal(a.closed, true);
  assert.ok(a.points.length > shape.points.length);
  assert.ok(a.points.every(p => p.every(n => n >= 2.8 && n <= 20.2)));
});

test('silhouette overlap catches duplicates and translation without equating unlike shapes', async () => {
  assert.ok(existsSync(new URL('../src/metrics.mjs', import.meta.url)), 'silhouette metrics must exist');
  const { silhouette, similarity } = await import('../src/metrics.mjs');
  const mask = Array(400).fill(0);
  for (let y = 3; y < 17; y++) for (let x = 3; x < 17; x++) if (x === 3 || x === 16 || y === 3 || y === 16) mask[y*20+x] = 1;
  const filled = silhouette(mask);
  assert.equal(filled.reduce((a,b)=>a+b), 196);
  assert.equal(similarity(filled, filled), 1);
  const shifted = Array(400).fill(0);
  for (let y=0;y<20;y++) for(let x=1;x<20;x++) shifted[y*20+x] = filled[y*20+x-1];
  assert.equal(similarity(filled, shifted), 1);
  const line = Array(400).fill(0).map((_,i)=>i%20 === 10 ? 1:0);
  assert.ok(similarity(filled, line) < 0.2);
});

test('Machado matrices operate on linear light and preserve neutral ramps', async () => {
  assert.ok(existsSync(new URL('../src/vision.mjs', import.meta.url)), 'colour vision simulation must exist');
  const { simulate, matrices } = await import('../src/vision.mjs');
  assert.equal(Object.keys(matrices).length, 3);
  for (const type of Object.keys(matrices)) {
    for (const grey of [0, 64, 128, 230, 255]) for (const n of simulate([grey,grey,grey], type)) assert.ok(Math.abs(n-grey) < 0.01);
  }
  const red = simulate([255,0,0], 'protanopia');
  assert.ok(red[0] > 100 && red[0] < 115, 'gamma encoding must follow the linear matrix');
});
