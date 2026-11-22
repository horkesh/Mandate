import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

// S60 captures: the desk at rest and with each tool open, at the four sizes the
// brief names. Read-only: no order is signed and no day is run.
const out = resolve('../../art-masters/S60');
const phase = process.env.S60_PHASE ?? 'after';
export const S60_SIZES = [
  { width: 3440, height: 1440 }, { width: 1920, height: 1080 },
  { width: 1366, height: 768 }, { width: 1280, height: 720 },
] as const;

async function ready(page: Page) {
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready', 'ready', { timeout: 45_000 });
  await page.evaluate(() => document.fonts.ready);
}
async function settle(page: Page) {
  await page.waitForTimeout(400);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
async function capture(page: Page, name: string) {
  mkdirSync(out, { recursive: true });
  const size = page.viewportSize()!;
  const file = resolve(out, `${phase}-${size.width}x${size.height}-${name}.png`);
  await page.screenshot({ path: file });
  writeFileSync(`${file}.recipe.json`, JSON.stringify({
    request: 'S60', tool: 'Prototype headless Playwright harness (playwright.s60.config.ts)',
    mode: `${phase} capture: ${name}`, date: '2026-11-22', requestedSize: size, actualSize: size,
    humanEdits: [], postProcess: [], sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
  }, null, 2));
}
async function putDown(page: Page) {
  for (let i = 0; i < 3 && await page.locator('dialog[open]').count(); i++) { await page.keyboard.press('Escape'); await settle(page); }
}

const tools: { name: string; open: (page: Page) => Promise<void> }[] = [
  { name: 'in-tray', open: async page => { await page.locator('.tray-stack.inbox').click(); } },
  { name: 'paper', open: async page => { await page.locator('.tray-stack.inbox').click(); await page.getByTestId('paper-link').first().click(); } },
  { name: 'org-board', open: async page => { await page.keyboard.press('b'); } },
  { name: 'ledger', open: async page => { await page.keyboard.press('l'); } },
  { name: 'file', open: async page => { await page.keyboard.press('g'); } },
  { name: 'daybook', open: async page => { await page.getByRole('button', { name: 'Daybook' }).click(); } },
  { name: 'key-card', open: async page => { await page.keyboard.press('?'); } },
  { name: 'turn-sheet', open: async page => { await page.getByRole('button', { name: /Let the days run/ }).click(); } },
  { name: 'order-sheet', open: async page => { await page.getByRole('button', { name: 'Write an order' }).click(); } },
  { name: 'docket', open: async page => { await page.keyboard.press('d'); } },
];

for (const size of S60_SIZES) test(`S60 ${phase} captures at ${size.width}x${size.height}`, async ({ page }) => {
  await page.setViewportSize(size);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  await capture(page, 'first-load');
  const fit = page.getByRole('button', { name: 'Fit the map' });
  if (await fit.count()) { await fit.click(); await settle(page); }
  await capture(page, 'desk');
  const detail = size.width !== 3440 || phase === 'after';
  if (!detail) return;
  for (const tool of tools) {
    await tool.open(page);
    await settle(page);
    await capture(page, tool.name);
    await putDown(page);
    if (await page.locator('.table-paper').count()) { await page.keyboard.press('Escape'); await settle(page); }
    await putDown(page);
  }
});
