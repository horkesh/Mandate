import { expect, test } from '@playwright/test';

test('every object has a fallback; modal Escape, focus trap, nested back and focus return', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('desk')).toBeVisible();
  const bar = page.getByRole('navigation', { name: 'Desk objects' });
  await expect(bar).toBeVisible();
  const names = ['Calendar', 'Attention', 'In-tray', 'Out-tray', 'Docket', 'Plans & enemy', 'Org board', 'Ledger', 'File', 'Daybook', 'Write an order', 'Let the days run', 'Key card'];
  for (const name of names) await expect(bar.getByRole('button', { name, exact: true })).toBeVisible();
  const opener = bar.getByRole('button', { name: 'In-tray', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('desk')).toHaveAttribute('inert', '');
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await bar.getByRole('button', { name: 'Org board', exact: true }).click();
  await page.getByRole('button', { name: /stone_charles_p/ }).first().click();
  await expect(page.getByTestId('person-card')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('person-card')).not.toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(bar.getByRole('button', { name: 'Org board', exact: true })).toBeFocused();
});

test('real Union loop, paper, docket and passing days at both target sizes', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const size of [{ width: 3440, height: 1440 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const tag = `${size.width}x${size.height}`;
    const bar = page.getByRole('navigation', { name: 'Desk objects' });
    await page.screenshot({ path: `../../art-masters/R17/desk-${tag}.png` });
    await bar.getByRole('button', { name: 'Docket', exact: true }).click();
    await page.screenshot({ path: `../../art-masters/R17/docket-${tag}.png` });
    await page.keyboard.press('Escape');
    for (let turn = 0; turn < 3; turn++) {
      await bar.getByRole('button', { name: 'Write an order', exact: true }).click();
      await page.getByLabel('Console command').fill('inquire us_general_in_chief');
      await page.getByRole('button', { name: 'Sign to out-tray', exact: true }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Order placed in the out-tray' })).toBeVisible();
      await page.keyboard.press('Escape');
      await bar.getByRole('button', { name: 'Let the days run', exact: true }).click();
      await page.getByRole('button', { name: 'Send orders & run days', exact: true }).click();
      await expect(page.getByTestId('turn-playback')).toBeVisible();
      if (turn === 0) await page.screenshot({ path: `../../art-masters/R17/days-${tag}.png` });
      await page.getByRole('button', { name: 'To the next morning', exact: true }).click();
      await page.keyboard.press('Escape');
    }
    await bar.getByRole('button', { name: 'In-tray', exact: true }).click();
    await page.getByTestId('paper-link').first().click();
    await expect(page.getByTestId('paper')).toBeVisible();
    await page.screenshot({ path: `../../art-masters/R17/paper-${tag}.png` });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    // Explicit 200% text setting: reflow and scroll, never clipped horizontal text.
    await bar.getByRole('button', { name: 'Key card', exact: true }).click();
    await page.getByRole('slider', { name: 'Text size' }).fill('200');
    await page.locator('#panel-title').focus();
    await page.keyboard.press('Escape');
    await bar.getByRole('button', { name: 'In-tray', exact: true }).click();
    await page.getByTestId('paper-link').first().click();
    expect(await page.getByTestId('paper').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: `../../art-masters/R17/reflow-${tag}.png` });
  }
  expect(errors).toEqual([]);
});

test('HTTP reads are stable, source files are closed, and stale or cross-origin writes fail', async ({ request }) => {
  const first = await (await request.get('/api/desk')).json();
  const second = await (await request.get('/api/desk')).json();
  expect(second).toEqual(first);
  expect(first).not.toHaveProperty('state');
  expect(first).not.toHaveProperty('world');
  expect(first).not.toHaveProperty('log');
  expect((await request.get('/server/adapter.ts')).status()).toBe(404);
  expect((await request.get('/@fs/C:/Pyrrhic/ByOrderOfThePresident/packages/kernel/src/index.ts')).status()).toBe(403);
  expect((await request.post('/api/command', { data: { line: 'end', day: first.morning.requestDay }, headers: { Origin: 'https://example.com' } })).status()).toBe(403);
  const stale = await (await request.post('/api/command', { data: { line: 'end', day: first.morning.requestDay - 1 } })).json();
  expect(stale.ok).toBe(false);
  expect(stale.snapshot).toEqual(first);
});
