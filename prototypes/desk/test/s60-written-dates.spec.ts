import { test, expect, type Page } from '@playwright/test';
import { writtenDate } from '../web/dates.ts';

// Lead's ruling on S60: every date the player reads is written out
// ("5 March 1861"; "Tuesday, 5 March 1861" on the calendar block). No rendered
// text, and no spoken name or tooltip, may contain an ISO date. This test runs
// one turn on its own server, so it runs after the read-only S60 checks.
const ISO = /\b\d{4}-\d{2}-\d{2}\b/;

async function leaks(page: Page, where: string) {
  const found = await page.evaluate(source => {
    const iso = new RegExp(source);
    const hits: string[] = [];
    const text = document.body.innerText;
    for (const line of text.split('\n')) if (iso.test(line)) hits.push(`text: ${line.trim().slice(0, 90)}`);
    for (const el of document.querySelectorAll<HTMLElement>('[aria-label],[title],[placeholder],img[alt]')) {
      if (!el.getClientRects().length) continue;
      for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
        const value = el.getAttribute(attr);
        if (value && iso.test(value)) hits.push(`${attr}: ${value.slice(0, 90)}`);
      }
    }
    return hits;
  }, ISO.source);
  expect(found, where).toEqual([]);
}
async function settle(page: Page) { await page.waitForTimeout(300); }
async function putDown(page: Page) {
  for (let i = 0; i < 3 && await page.locator('dialog[open]').count(); i++) { await page.keyboard.press('Escape'); await settle(page); }
}
const book = (page: Page, name: string) => page.getByRole('navigation', { name: 'Desk objects' }).getByRole('button', { name, exact: true });

test('S60 no rendered text shows an ISO date, before and after a turn', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready', 'ready', { timeout: 45_000 });
  const snapshot = await page.evaluate(async () => (await fetch('/api/desk')).json());

  // The calendar block reads the weekday form; its time element keeps the
  // machine date only in its attribute.
  const calendar = page.locator('.table-calendar time');
  await expect(calendar).toHaveText(writtenDate(snapshot.date, { weekday: true }));
  await expect(calendar).toHaveAttribute('datetime', snapshot.date);
  await expect(page.locator('.map-key .map-cartouche time')).toHaveText(writtenDate(snapshot.date));
  await leaks(page, 'first morning');

  // Every tool, the open paper and the map's text record.
  const opens: [string, () => Promise<void>][] = [
    ['in-tray', () => page.locator('.tray-stack.inbox').click()],
    ['calendar', () => page.locator('.calendar-block').click()],
    ['attention', () => page.locator('.attention-desk').click()],
    ['org board', () => book(page, 'Org board').click()],
    ['ledger', () => book(page, 'Ledger').click()],
    ['daybook', () => book(page, 'Daybook').click()],
    ['file', () => book(page, 'File').click()],
    ['plans', () => page.locator('.tool-plans').click()],
    ['orders and progress', () => book(page, 'Orders & progress').click()],
    ['key card', () => book(page, 'Key card').click()],
    ['turn sheet', () => page.locator('.table-run').click()],
    ['docket', () => page.keyboard.press('d')],
  ];
  for (const [where, open] of opens) { await open(); await settle(page); await leaks(page, where); await putDown(page); }
  await page.locator('.tray-stack.inbox').click();
  await page.getByTestId('paper-link').first().click();
  await expect(page.getByTestId('paper')).toBeVisible();
  await leaks(page, 'open paper');
  await page.keyboard.press('f'); await settle(page);
  await putDown(page);
  await book(page, 'File').click(); await settle(page);
  await leaks(page, 'file with a filed paper');
  await putDown(page);
  await page.getByRole('button', { name: 'Read the map as text' }).click(); await settle(page);
  await leaks(page, 'map text record');
  await page.getByRole('button', { name: 'Return to the map' }).click(); await settle(page);

  // A signed slip, the days passing, the stop and the records they leave.
  await book(page, 'Write an order').click();
  await page.getByLabel('Console command').fill('inquire us_general_in_chief');
  await page.getByRole('button', { name: 'Sign to out-tray', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Order placed in the out-tray' })).toBeVisible();
  await putDown(page);
  await page.locator('.tray-stack.outbox').click(); await settle(page);
  await leaks(page, 'out-tray slip');
  await putDown(page);
  await page.locator('.table-run').click();
  await page.getByRole('button', { name: 'Send orders & run days', exact: true }).click();
  await expect(page.getByTestId('turn-playback')).toBeVisible();
  await leaks(page, 'days passing');
  await page.getByRole('button', { name: 'To the next morning', exact: true }).click(); await settle(page);
  await leaks(page, 'stop slip');
  const stop = page.getByRole('button', { name: 'Put down the stop slip' });
  if (await stop.count()) await stop.click();
  for (const [where, open] of opens) { await open(); await settle(page); await leaks(page, `${where} after a turn`); await putDown(page); }
});
