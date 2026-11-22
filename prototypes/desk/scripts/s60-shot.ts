// S60 working tool: one headless capture of the running local desk.
// Usage: npx tsx scripts/s60-shot.ts <port> <width>x<height> <out.png> [action]
// Actions: inbox, paper, board, ledger, file, daybook, help, run, orders, docket,
// outbox, attention, key-toggle. Read-only: it never signs or runs anything.
import { chromium } from '@playwright/test';

const [port = '5360', size = '1920x1080', out = 'shot.png', action = '', settings = ''] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number) as [number, number];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
// Optional presentation settings as key=value pairs, e.g. contrast=true or
// scale=200,lamp=true; they live in local storage and never reach the game.
if (settings) {
  const value = Object.fromEntries(settings.split(',').map(pair => { const [k, v = ''] = pair.split('='); return [k, v === 'true' ? true : v === 'false' ? false : Number.isNaN(Number(v)) ? v : Number(v)]; }));
  await page.addInitScript(json => localStorage.setItem('presidential-desk-presentation', json), JSON.stringify(value));
}
await page.emulateMedia({ reducedMotion: 'reduce' });
const errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
// S60_FIXTURE names a saved snapshot to show instead of the live morning;
// commands are refused, so a fixture view can never change the game.
if (process.env.S60_FIXTURE) {
  const { readFileSync } = await import('node:fs');
  const saved = JSON.parse(readFileSync(process.env.S60_FIXTURE, 'utf8'));
  const body = JSON.stringify(saved.snapshot ?? saved);
  await page.route('**/api/desk', route => route.fulfill({ status: 200, contentType: 'application/json', body }));
  await page.route('**/api/command', route => route.abort());
}
await page.goto(`http://127.0.0.1:${port}/`);
await page.getByTestId('map-canvas-host').waitFor();
await page.waitForFunction(() => document.querySelector('[data-testid=map-canvas-host]')?.getAttribute('data-ready') === 'ready', null, { timeout: 45_000 });
await page.evaluate(() => document.fonts.ready);
const fit = page.getByRole('button', { name: 'Fit the map', exact: true });
if (await fit.count()) await fit.click();
const keys: Record<string, string> = { board: 'b', ledger: 'l', file: 'g', docket: 'd', help: '?' };
if (keys[action]) await page.keyboard.press(keys[action]!);
else if (action === 'inbox') await page.locator('.tray-stack.inbox').click();
else if (action === 'outbox') await page.locator('.tray-stack.outbox').click();
else if (action === 'paper') { await page.locator('.tray-stack.inbox').click(); await page.getByTestId('paper-link').first().click(); }
else if (action === 'daybook') await page.locator('.tool-daybook').click();
else if (action === 'run') await page.locator('.table-run').click();
else if (action === 'orders') await page.locator('.tool-orders').click();
else if (action === 'attention') await page.locator('.attention-desk').click();
else if (action === 'key-toggle') await page.locator('.map-key-toggle').click();
else if (action === 'plans') await page.locator('.tool-plans').click();
// Filing is the page's own mark, not a game command.
else if (action === 'filed') { await page.locator('.tray-stack.inbox').click(); await page.getByTestId('paper-link').first().click(); await page.keyboard.press('f'); await page.waitForTimeout(300); await page.keyboard.press('g'); }
await page.waitForTimeout(600);
await page.screenshot({ path: out });
if (errors.length) console.log('page errors:', errors.join(' | '));
await browser.close();
