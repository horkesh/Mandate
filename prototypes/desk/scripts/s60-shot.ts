// S60 working tool: one headless capture of the running local desk.
// Usage: npx tsx scripts/s60-shot.ts <port> <width>x<height> <out.png> [action]
// Actions: inbox, paper, board, ledger, file, daybook, help, run, orders, docket,
// outbox, attention, key-toggle. Read-only: it never signs or runs anything.
import { chromium } from '@playwright/test';

const [port = '5360', size = '1920x1080', out = 'shot.png', action = ''] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number) as [number, number];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.emulateMedia({ reducedMotion: 'reduce' });
const errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
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
await page.waitForTimeout(600);
await page.screenshot({ path: out });
if (errors.length) console.log('page errors:', errors.join(' | '));
await browser.close();
