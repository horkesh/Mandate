// S60 working tool: run turns on a lane's own local desk (never an owner's
// port) and capture the days passing, the stop slip and the next morning.
// Usage: npx tsx scripts/s60-play.ts <port> <width>x<height> <out-prefix> [turns]
import { chromium } from '@playwright/test';

const [port = '5364', size = '1366x768', prefix = 'play', turnsArg = '2'] = process.argv.slice(2);
if (['5274', '5290', '5291'].includes(port)) throw Error('Those ports are the owner\'s live desks.');
const [width, height] = size.split('x').map(Number) as [number, number];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
const errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction(() => document.querySelector('[data-testid=map-canvas-host]')?.getAttribute('data-ready') === 'ready', null, { timeout: 45_000 });
await page.evaluate(() => document.fonts.ready);
for (let turn = 0; turn < Number(turnsArg); turn++) {
  await page.locator('.table-run').click();
  await page.getByRole('button', { name: 'Send orders & run days', exact: true }).click();
  await page.getByTestId('turn-playback').waitFor();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${prefix}-t${turn}-days.png` });
  const skip = page.getByRole('button', { name: /Skip/ });
  if (await skip.count()) await skip.first().click();
  await page.getByRole('button', { name: 'To the next morning', exact: true }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${prefix}-t${turn}-morning.png` });
  const close = page.getByRole('button', { name: 'Put down the stop slip' });
  if (await close.count()) { await close.click(); await page.waitForTimeout(300); }
  await page.screenshot({ path: `${prefix}-t${turn}-desk.png` });
}
if (errors.length) console.log('page errors:', errors.join(' | '));
console.log('docket cards:', await page.locator('.docket-card').count());
await browser.close();
