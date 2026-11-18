import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test('enlarged desk acts occupy separate spaces at both target sizes', async ({ page }) => {
  for (const size of [{ width: 3440, height: 1440 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size); await page.goto('/');
    for (const scale of [80, 200]) {
      await page.keyboard.press('?'); await page.getByRole('slider', { name: 'Text size' }).fill(String(scale));
      await page.locator('#panel-title').focus(); await page.keyboard.press('Escape');
      expect(await page.locator('.run-object').evaluate(el => { const a=el.getBoundingClientRect(),b=document.querySelector('.write-object')!.getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom; })).toBe(true);
    }
  }
});

test('80% and 200% reflow at both target sizes; skins have measured paper contrast', async ({ page, request }) => {
  test.setTimeout(90000);
  let snapshot = await (await request.get('/api/desk')).json();
  if (!snapshot.morning.view.reports.length) {
    const post = snapshot.morning.menu.commandable[0].post;
    await request.post('/api/command', { data: { line: `inquire ${post}`, day: snapshot.morning.requestDay } });
    snapshot = (await (await request.post('/api/command', { data: { line: 'end', day: snapshot.morning.requestDay } })).json()).snapshot;
  }
  expect(snapshot.morning.view.reports.length).toBeGreaterThan(0);
  const measurements: unknown[] = [];
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const size of [{ width: 3440, height: 1440 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    for (const scale of [80, 200]) {
      await page.goto('/');
      const bar = page.getByRole('navigation', { name: 'Desk objects' });
      await bar.getByRole('button', { name: 'Key card', exact: true }).click();
      await page.getByRole('slider', { name: 'Text size' }).fill(String(scale));
      await page.locator('#panel-title').focus(); await page.keyboard.press('Escape');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `../../art-masters/R17/desk-${scale}-${size.width}x${size.height}.png` });
      const fitsBar = await bar.evaluate(el => el.scrollWidth <= el.clientWidth + 1); expect(fitsBar).toBe(true);
      expect(await page.locator('.run-object').evaluate(el => { const a=el.getBoundingClientRect(),b=document.querySelector('.write-object')!.getBoundingClientRect();return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom; })).toBe(true);
      await page.getByRole('navigation').getByRole('button', { name: 'In-tray', exact: true }).click(); await page.getByTestId('paper-link').first().click(); await expect(page.getByTestId('paper')).toBeVisible();
      const dimensions = await page.getByTestId('paper').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, font: parseFloat(getComputedStyle(el.querySelector('.paper-copy')!).fontSize), measure: getComputedStyle(el.querySelector('.paper-copy')!).maxWidth }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width + 1);
      expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await page.screenshot({ path: `../../art-masters/R17/paper-${scale}-${size.width}x${size.height}.png` });
      measurements.push({ size, scale, dimensions });
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await page.keyboard.press('m');
      const host = page.getByRole('dialog').getByTestId('map-canvas-host'); await expect(host).toHaveAttribute('data-ready','ready');
      await page.screenshot({ path: `../../art-masters/R17/map-${scale}-${size.width}x${size.height}.png` });
      expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await page.keyboard.press('Escape');
    }
    for (const skin of ['High contrast', 'Evening lamp']) {
      await page.keyboard.press('?'); await page.getByRole('slider', { name: 'Text size' }).fill('100');
      await page.getByLabel('High contrast', { exact: true }).setChecked(skin === 'High contrast');
      await page.getByLabel('Evening lamp', { exact: true }).setChecked(skin === 'Evening lamp');
      await page.locator('#panel-title').focus(); await page.keyboard.press('Escape');
      const before = await (await request.get('/api/desk')).json();
      await page.screenshot({ path: `../../art-masters/R17/${skin.replace(' ', '-').toLowerCase()}-desk-${size.width}x${size.height}.png` });
      await page.getByRole('navigation').getByRole('button', { name: 'In-tray', exact: true }).click(); await page.getByTestId('paper-link').first().click();
      const result = await page.getByTestId('paper').evaluate(el => {
        const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
        const luminance = (v: number[]) => v.slice(0,3).map(v => {v /= 255; return v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i]!,0);
        const ratios = [...el.querySelectorAll<HTMLElement>('p,dt,dd,span,small,h3')].filter(e => e.textContent?.trim()).map(e => {
          const color = rgb(getComputedStyle(e).color); let parent: HTMLElement | null = e;
          let bg: number[] = [255,255,255];
          while (parent) { const c = rgb(getComputedStyle(parent).backgroundColor); if(c.length===3||c[3]===1){bg=c;break;} parent=parent.parentElement; }
          const a=luminance(color),b=luminance(bg); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        });
        return { minimum: Math.min(...ratios), count: ratios.length, background: getComputedStyle(el).backgroundColor, image: getComputedStyle(el).backgroundImage, transform: getComputedStyle(el.querySelector('.eyebrow')!).textTransform };
      });
      expect(result.minimum).toBeGreaterThanOrEqual(skin === 'High contrast' ? 7 : 4.5);
      if (skin === 'High contrast') { expect(result.image).toBe('none'); expect(result.transform).toBe('none'); }
      else expect(result.background).toBe('rgb(216, 199, 168)');
      await page.getByRole('button', { name: 'File this paper', exact: true }).focus();
      await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
      const ring=await page.getByRole('button', { name: 'File this paper', exact: true }).evaluate(el => ({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
      expect(ring.style).not.toBe('none');
      await page.screenshot({ path: `../../art-masters/R17/${skin.replace(' ', '-').toLowerCase()}-paper-${size.width}x${size.height}.png` });
      measurements.push({ size, skin, result, ring });
      expect(await (await request.get('/api/desk')).json()).toEqual(before);
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await page.keyboard.press('m'); await expect(page.getByRole('dialog').getByTestId('map-canvas-host')).toHaveAttribute('data-ready', 'ready');
      await page.screenshot({ path: `../../art-masters/R17/${skin.replace(' ', '-').toLowerCase()}-map-${size.width}x${size.height}.png` });
      await page.keyboard.press('Escape');
    }
  }
  writeFileSync('../../art-masters/R17/skin-measurements.json', JSON.stringify({ measurements, errors }, null, 2)); expect(errors).toEqual([]);
});
