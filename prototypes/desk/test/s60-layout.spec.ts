import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// S60: the desk holds together at the four target sizes, and every object on it
// stays a labelled, focusable, legible control. Read-only: no day is run.
const out = resolve('../../art-masters/S60');
const phase = process.env.S60_PHASE ?? 'after';
const sizes = [
  { width: 3440, height: 1440 }, { width: 1920, height: 1080 },
  { width: 1366, height: 768 }, { width: 1280, height: 720 },
];
type Box = { name: string; left: number; top: number; right: number; bottom: number };

async function open(page: Page, size: { width: number; height: number }) {
  await page.setViewportSize(size);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready', 'ready', { timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
}

/** Every object on the desk, outside the map's own sheet. */
async function deskObjects(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const named = (el: Element) => (el.getAttribute('aria-label') ?? (el as HTMLElement).innerText ?? el.className).trim().replace(/\s+/g, ' ');
    const items = [...document.querySelectorAll<HTMLElement>(
      '.calendar-block,.attention-desk,.tray-stack,.table-books>button,.table-docket>button,.docket-card,.table-run,.desk-front .first-morning-note')];
    return items.filter(el => el.offsetWidth && getComputedStyle(el).visibility !== 'hidden').map(el => {
      const r = el.getBoundingClientRect();
      return { name: named(el), left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    });
  });
}
async function box(page: Page, selector: string): Promise<Box> {
  return page.locator(selector).first().evaluate((el, name) => { const r = el.getBoundingClientRect(); return { name, left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }, selector);
}
const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const area = (a: Box) => (a.right - a.left) * (a.bottom - a.top);

for (const size of sizes) test(`S60 layout holds at ${size.width}x${size.height}`, async ({ page }) => {
  await open(page, size);
  const objects = await deskObjects(page);
  const sheet = await box(page, '.table-map-layout .map-drawing');
  const strip = [await box(page, '.table-map-layout .map-tools'), await box(page, '.table-map-layout .map-header')];
  const key = await box(page, '.table-map-layout .map-key');
  const report = { size, sheet, key, strip, objects, failures: [] as string[] };
  // Nothing leaves the screen.
  for (const o of [...objects, ...strip, key]) if (o.left < -1 || o.top < -1 || o.right > size.width + 1 || o.bottom > size.height + 1) report.failures.push(`${o.name} leaves the screen`);
  // No desk object covers another, the map's sheet or its instrument strip.
  for (let i = 0; i < objects.length; i++) {
    if (overlap(objects[i]!, sheet) > 1) report.failures.push(`${objects[i]!.name} covers the map`);
    for (const s of strip) if (overlap(objects[i]!, s) > 1) report.failures.push(`${objects[i]!.name} covers the map strip`);
    for (let j = i + 1; j < objects.length; j++) if (overlap(objects[i]!, objects[j]!) > 4) report.failures.push(`${objects[i]!.name} overlaps ${objects[j]!.name}`);
  }
  // The strip lies beside the sheet, never on it, and its two parts don't meet.
  for (const s of strip) if (overlap(s, sheet) > 1) report.failures.push(`${s.name} lies on the map`);
  if (overlap(strip[0]!, strip[1]!) > 0) report.failures.push('the map tools meet the text-record switch');
  // The map is the largest object: at least 45% of the screen, and its printed
  // key takes no more than an eighth of it.
  if (area(sheet) < .45 * size.width * size.height) report.failures.push(`the map has only ${(area(sheet) / (size.width * size.height) * 100).toFixed(1)}% of the screen`);
  for (const o of objects) if (area(o) >= area(sheet)) report.failures.push(`${o.name} is larger than the map`);
  if (overlap(key, sheet) < area(key) - 1) report.failures.push('the map key leaves the sheet');
  if (area(key) > area(sheet) / 8) report.failures.push(`the map key covers ${(area(key) / area(sheet) * 100).toFixed(1)}% of the map`);
  // Labels fit their objects.
  const clipped = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.tool-label,.tray-stack>span,.docket-count,.table-run,.map-tools button,.map-header button,.calendar-face>*')]
    .filter(el => el.offsetWidth && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)).map(el => el.innerText.trim()));
  for (const text of clipped) report.failures.push(`label clipped: ${text}`);
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, `${phase}-layout-${size.width}x${size.height}.json`), JSON.stringify(report, null, 2));
  expect(report.failures).toEqual([]);
});

for (const size of [sizes[1]!, sizes[3]!]) test(`S60 an open paper lies on the map, beside the furniture, at ${size.width}x${size.height}`, async ({ page }) => {
  await open(page, size);
  await page.locator('.tray-stack.inbox').click();
  await page.getByTestId('paper-link').first().click();
  await expect(page.getByTestId('paper-on-map')).toBeVisible();
  await page.waitForTimeout(300);
  const paper = await box(page, '.table-paper');
  const mapArea = await box(page, '.table-map-layout');
  const objects = await deskObjects(page);
  expect(paper.left).toBeGreaterThanOrEqual(mapArea.left - 1);
  expect(paper.right).toBeLessThanOrEqual(mapArea.right + 1);
  expect(paper.top).toBeGreaterThanOrEqual(mapArea.top - 1);
  expect(paper.bottom).toBeLessThanOrEqual(mapArea.bottom + 1);
  for (const o of objects) expect(overlap(paper, o), `${o.name} under the paper`).toBeLessThanOrEqual(1);
  expect(await page.locator('.table-paper').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
});

/** sRGB relative luminance and WCAG contrast. */
const luminance = ([r, g, b]: number[]) => { const c = (v: number) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * c(r!) + .7152 * c(g!) + .0722 * c(b!); };
const contrast = (a: number, b: number) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);

for (const size of [sizes[1]!, sizes[3]!]) test(`S60 desk labels meet AA contrast over their real backgrounds at ${size.width}x${size.height}`, async ({ page }) => {
  await open(page, size);
  // Each label is measured against the pixels behind it with its text hidden,
  // at the worst 1% of those pixels, so textures and wood count.
  const targets = await page.evaluate(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.calendar-face>*,.attention-desk>span:first-child,.attention-budget>span:not(.attention-coins),.tray-stack>span,.tray-stack>small,.tool-label,.docket-count,.table-docket>div>span,.docket-card strong,.docket-card small,.table-run,.map-tools button:not(:disabled),.map-header button,.map-key h3,.map-key p,.map-key time,.map-key li,.map-key-toggle,.desk-front .first-morning-note')];
    // The box sampled is the union of the label's own text, so borders, swatches
    // and the corners of a turned card are not counted as its background.
    const textBox = (el: HTMLElement) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent!.trim() && !n.parentElement!.closest('[aria-hidden="true"]') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const range = document.createRange(); range.selectNodeContents(n);
        for (const q of range.getClientRects()) { l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
      }
      return Number.isFinite(l) ? { l, t, r, b } : null;
    };
    return els.filter(el => el.offsetWidth && el.innerText.trim()).flatMap((el, i) => {
      el.setAttribute('data-s60-contrast', String(i));
      const box = textBox(el); if (!box) return [];
      // The colour of the text itself, from the element holding the first glyph.
      const first = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent!.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }).nextNode()!;
      const color = getComputedStyle(first.parentElement!).color;
      const x = Math.max(0, Math.floor(box.l)), y = Math.max(0, Math.floor(box.t));
      return [{ i, text: el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40), color, rect: { x, y, width: Math.min(Math.ceil(box.r) - x, innerWidth - x), height: Math.min(Math.ceil(box.b) - y, innerHeight - y) } }];
    });
  });
  const failures: string[] = [], rows: unknown[] = [];
  for (const t of targets) {
    if (t.rect.width < 2 || t.rect.height < 2) continue;
    await page.evaluate(i => { const el = document.querySelector<HTMLElement>(`[data-s60-contrast="${i}"]`)!; el.dataset.s60Color = el.style.color; el.style.setProperty('color', 'transparent', 'important'); el.style.setProperty('text-shadow', 'none', 'important'); for (const c of el.querySelectorAll<HTMLElement>('*')) c.style.setProperty('color', 'transparent', 'important'); }, t.i);
    const shot = await page.screenshot({ clip: t.rect });
    await page.evaluate(i => { const el = document.querySelector<HTMLElement>(`[data-s60-contrast="${i}"]`)!; el.style.removeProperty('color'); el.style.removeProperty('text-shadow'); for (const c of el.querySelectorAll<HTMLElement>('*')) c.style.removeProperty('color'); }, t.i);
    const [low, high] = await page.evaluate(async b64 => {
      const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d')!; g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data, l: number[] = [];
      const lin = (v: number) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      for (let p = 0; p < d.length; p += 4) l.push(.2126 * lin(d[p]!) + .7152 * lin(d[p + 1]!) + .0722 * lin(d[p + 2]!));
      l.sort((a, b) => a - b);
      return [l[Math.floor(l.length * .01)]!, l[Math.floor(l.length * .99)]!];
    }, shot.toString('base64'));
    const rgb = t.color.match(/[\d.]+/g)!.map(Number);
    const text = luminance(rgb);
    const worst = Math.min(contrast(text, low), contrast(text, high));
    rows.push({ text: t.text, color: t.color, worst: Number(worst.toFixed(2)) });
    if (worst < 4.5) failures.push(`${t.text}: ${worst.toFixed(2)}:1`);
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, `${phase}-contrast-${size.width}x${size.height}.json`), JSON.stringify(rows, null, 2));
  expect(failures).toEqual([]);
});

test('S60 every desk object is a named control with a visible keyboard focus ring', async ({ page }) => {
  await open(page, sizes[2]!);
  const controls = page.locator('main.playable-table button:visible:not(:disabled), main.playable-table select:visible');
  const count = await controls.count();
  expect(count).toBeGreaterThan(20);
  for (let i = 0; i < count; i++) {
    const control = controls.nth(i);
    const name = await control.evaluate(el => (el.getAttribute('aria-label') ?? (el as HTMLElement).innerText).trim());
    expect(name, await control.evaluate(el => el.outerHTML.slice(0, 120))).not.toBe('');
  }
  // Decorative art inside objects is hidden from assistive technology.
  expect(await page.locator('main.playable-table img:not([alt=""])').count()).toBe(0);
  // Tab through the desk's objects; each focused control shows a ring.
  await page.locator('.calendar-block').focus();
  for (let i = 0; i < 26; i++) {
    const ring = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null; if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { name: (el.getAttribute('aria-label') ?? el.innerText).trim().slice(0, 30), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, shadow: cs.boxShadow !== 'none' };
    });
    if (ring) expect(ring.outline || ring.shadow, `focus ring on ${ring.name}`).toBe(true);
    await page.keyboard.press('Tab');
  }
});

test('S60 motion respects reduced motion, and the chrome sets no all-caps labels', async ({ page }) => {
  await open(page, sizes[1]!);
  await page.locator('.tray-stack.inbox').click();
  await page.getByTestId('paper-link').first().click();
  const motion = await page.locator('.table-paper').evaluate(el => { const cs = getComputedStyle(el); return { animation: cs.animationName, transform: cs.transform }; });
  expect(motion.animation).toBe('none');
  expect(motion.transform).toBe('none');
  await page.keyboard.press('Escape');
  const caps = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('main.playable-table *, dialog *')]
    .filter(el => el.offsetWidth && el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim()))
    .filter(el => { const cs = getComputedStyle(el); const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim(); return cs.textTransform === 'uppercase' || (/[A-Z]{4,}/.test(text) && text === text.toUpperCase() && /[A-Z]/.test(text) && !el.closest('kbd')); })
    .map(el => el.innerText.trim().slice(0, 40)));
  expect(caps).toEqual([]);
});

test('S60 decoration shows only what the seat has received', async ({ page }) => {
  await open(page, sizes[1]!);
  const snapshot = await page.evaluate(async () => (await fetch('/api/desk')).json());
  const unread = snapshot.morning.view.reports.length;
  const queued = snapshot.queue.length;
  const live = snapshot.morning.view.situations.filter((s: { status: string }) => s.status === 'open' || s.status === 'waiting').length;
  // Papers are drawn in a tray only when it holds some.
  await expect(page.locator('.tray-stack.inbox')).toHaveAttribute('data-count', String(unread));
  await expect(page.locator('.tray-stack.outbox')).toHaveAttribute('data-count', String(queued));
  // The docket shows a slip for each live situation and nothing else.
  await expect(page.locator('.docket-card')).toHaveCount(live);
  // The calendar block's face is the desk's own date.
  const iso = await page.locator('.table-calendar time').getAttribute('datetime');
  expect(iso).toBe(snapshot.date);
  const face = await page.locator('.calendar-face').innerText();
  const [y, m, d] = iso!.split('-').map(Number);
  expect(face).toContain(String(d));
  expect(face).toContain(String(y));
  expect(face).toContain(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m! - 1]!);
});
