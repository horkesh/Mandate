import { presenter } from '../web/presentation.ts';
import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import type { DeskSnapshot } from '../web/adapter.ts';

// A real ConsoleGame testbed run, retained in R15, supplies both genres and their console wording.
const fixture = JSON.parse(readFileSync('../../art-masters/R15/paper-fixture.json', 'utf8')) as DeskSnapshot;

test('the middleware serves only the named document PNGs in both resolutions', async ({ request }) => {
  for (const name of ['telegraph-form-header', 'general-orders-head', 'masthead-ornament', 'rule-double', 'rule-thick-thin']) {
    for (const suffix of ['', '@2x']) {
      const response = await request.get(`/art/union-1861/documents/${name}${suffix}.png`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      expect((await response.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    }
  }
  for (const path of ['rule-double.png.recipe.json', 'unlisted.png', '../portraits/generated/face-001.png']) {
    expect((await request.get(`/art/union-1861/documents/${path}`)).status()).toBe(404);
  }
});

test('document decoration preserves console words and reflows in the reading column', async ({ page }) => {
  const measurements: unknown[] = [];
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/api/desk', route => route.fulfill({ json: fixture }));
  for (const size of [{ width: 3440, height: 1440 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    for (const type of ['wire-dispatch', 'press'] as const) {
      const report = fixture.morning.view.reports.find(r => r.type === type)!;
      expect(report).toBeDefined();
      await page.goto('/');
      await page.evaluate(() => { localStorage.clear(); });
      await page.reload();
      const bar = page.getByRole('navigation', { name: 'Desk objects' });
      await bar.getByRole('button', { name: 'In-tray', exact: true }).click();
      const reports = [...fixture.morning.view.reports].reverse();
      await page.getByTestId('paper-link').nth(reports.findIndex(r => r.id === report.id)).click();
      const paper = page.getByTestId('paper');
      await expect(paper).toBeVisible();
      await expect(paper.locator('.document-decoration')).toHaveCount(1);
      // Decoration is excluded from the accessibility tree; it adds no alternate wording.
      for (const ornament of await paper.locator('.document-decoration').all()) {
        await expect(ornament).toHaveAttribute('aria-hidden', 'true');
        await expect(ornament).toBeVisible();
        expect(await ornament.evaluate(el => getComputedStyle(el).maskImage)).toContain('/art/union-1861/documents/');
      }
      expect(await paper.locator('.paper-header').evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('0px');
      const original = fixture.paperText[report.id]!.split('; ').join(' ');
      await expect(paper.locator('.paper-copy')).toHaveText(presenter(fixture.strings).text(original));
      for (const scale of [100, 200]) {
        if (scale === 200) {
          await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
          await page.keyboard.press('?');
          await page.getByRole('slider', { name: 'Text size' }).fill('200');
          await page.locator('#panel-title').focus(); await page.keyboard.press('Escape');
          await bar.getByRole('button', { name: 'In-tray', exact: true }).click();
          await page.getByTestId('paper-link').nth(reports.findIndex(r => r.id === report.id)).click();
        }
        await page.evaluate(() => document.fonts.ready);
        const layout = await paper.evaluate(el => {
          const copy = el.querySelector('.paper-copy')!;
          const header = el.querySelector('.paper-header')!;
          const meta = el.querySelector('.paper-meta')!;
          const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom }; };
          return { client:el.clientWidth, scroll:el.scrollWidth, copy:rect(copy), header:rect(header), meta:rect(meta), measure:getComputedStyle(copy).maxWidth };
        });
        expect(layout.scroll).toBeLessThanOrEqual(layout.client + 1);
        expect(layout.header.bottom).toBeLessThanOrEqual(layout.meta.top);
        expect(layout.meta.bottom).toBeLessThanOrEqual(layout.copy.top);
        expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
        const tag = `${type}-${scale}-${size.width}x${size.height}`;
        await page.screenshot({ path: `../../art-masters/R15/${tag}.png` });
        // Full paper proof also includes text below the viewport at 200%.
        await paper.screenshot({ path: `../../art-masters/R15/${tag}-paper.png` });
        measurements.push({ tag, layout });
      }
    }
  }
  writeFileSync('../../art-masters/R15/layout-measurements.json', JSON.stringify({ measurements, errors }, null, 2));
  expect(errors).toEqual([]);
});

test('paper masks retain skin colours, use 2x assets and decorate printed returns', async ({ browser }) => {
  const results: unknown[] = [];
  for (const skin of ['contrast', 'lamp', 'normal'] as const) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    await context.addInitScript(skin => localStorage.setItem('presidential-desk-presentation', JSON.stringify({ [skin]: true })), skin);
    await context.route('**/api/desk', route => route.fulfill({ json: fixture }));
    const page = await context.newPage();
    const loaded: string[] = [];
    page.on('response', r => { if (r.url().includes('/documents/') && r.status() === 200) loaded.push(r.url()); });
    const type = skin === 'normal' ? 'casualty-return' : 'press';
    const reports = [...fixture.morning.view.reports].reverse();
    const index = reports.findIndex(report => report.type === type);
    expect(index).toBeGreaterThanOrEqual(0);
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Desk objects' }).getByRole('button', { name: 'In-tray', exact: true }).click();
    await page.getByTestId('paper-link').nth(index).click();
    const paper = page.getByTestId('paper');
    await expect(paper).toBeVisible();
    await expect.poll(() => loaded.length).toBeGreaterThanOrEqual(2);
    expect(loaded.every(url => url.endsWith('@2x.png'))).toBe(true);
    expect(loaded.some(url => url.includes(skin === 'normal' ? 'rule-thick-thin' : 'masthead-ornament'))).toBe(true);
    const colours = await paper.evaluate(el => ({ ink: getComputedStyle(el).color, paper:getComputedStyle(el).backgroundColor,
      mask:getComputedStyle(el.querySelector('.document-decoration')!).backgroundColor }));
    expect(colours.mask).toBe(colours.ink);
    if (skin === 'contrast') { expect(colours.ink).toBe('rgb(17, 17, 17)'); expect(colours.paper).toBe('rgb(255, 255, 255)'); }
    if (skin === 'lamp') { expect(colours.ink).toBe('rgb(39, 34, 27)'); expect(colours.paper).toBe('rgb(216, 199, 168)'); }
    const rules = await paper.evaluate(el => {
      const paper = el.getBoundingClientRect();
      return [...el.querySelectorAll('.paper-meta>div')].map(row => {
        const r = row.getBoundingClientRect(), text = row.querySelector('dd')!.getBoundingClientRect();
        return { left:r.left-paper.left, right:r.right-paper.left, bottom:r.bottom-paper.top, textBottom:text.bottom-paper.top, ruleTop:r.bottom-paper.top-12 };
      });
    });
    for (const rule of rules) expect(rule.textBottom).toBeLessThanOrEqual(rule.ruleTop);
    await paper.screenshot({ path:`../../art-masters/R15/${skin}-paper-2x.png` });
    results.push({ skin, loaded, colours, rules });
    await context.close();
  }
  writeFileSync('../../art-masters/R15/mask-skin-checks.json', JSON.stringify(results, null, 2));
});
