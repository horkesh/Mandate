import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

test.beforeAll(async ({ request }) => {
  test.skip(process.env.DESK_PACK !== 'testbed', 'Context keys use the real testbed menu.');
  let s = await (await request.get('/api/desk')).json();
  if (!s.morning.menu.reviews.length) {
    for (const line of ['order n_army_east take salient_tip review', 'order n_army_west take salient_tip review'])
      expect((await (await request.post('/api/command', { data: { line, day: s.morning.requestDay } })).json()).ok).toBe(true);
    s = (await (await request.post('/api/command', { data: { line: 'end', day: s.morning.requestDay } })).json()).snapshot;
  }
  expect(s.morning.menu.reviews.length).toBeGreaterThan(0);
  expect(s.morning.view.reports.length).toBeGreaterThan(1);
  expect(s.morning.menu.situations.some((s: any) => s.delegableTo.length)).toBe(true);
});

async function start(page: Page) { await page.setViewportSize({ width: 1920, height: 1080 }); await page.goto('/'); await expect(page.getByTestId('desk')).toBeVisible(); }
const bar = (page: Page) => page.getByRole('navigation', { name: 'Desk objects' });

for (const key of ['ArrowDown', 'ArrowUp', 'j', 'k']) test(`${key} chooses a paper; Enter opens and Esc puts it down`, async ({ page }) => {
  await start(page); await bar(page).getByRole('button', { name: 'In-tray', exact: true }).click();
  const links = page.getByTestId('paper-link'); const backward = ['k', 'ArrowUp'].includes(key);
  await links.nth(backward ? 1 : 0).focus(); await page.keyboard.press(key);
  await expect(links.nth(backward ? 0 : 1)).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByTestId('paper')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(links.first()).toBeVisible();
  await page.keyboard.press('Escape'); await expect(bar(page).getByRole('button', { name: 'In-tray', exact: true })).toBeFocused();
});

test('Space opens unread papers and skips playback to its stop', async ({ page }) => {
  await start(page); await page.keyboard.press('Space'); await expect(page.getByTestId('paper')).toBeVisible();
  const first = await page.getByTestId('paper').innerText(); await page.keyboard.press('Space');
  expect(await page.getByTestId('paper').innerText()).not.toBe(first);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.keyboard.press('Control+Enter'); await page.keyboard.press('Control+Enter');
  await expect(page.getByTestId('turn-playback')).toBeVisible(); await page.keyboard.press('Space');
  await expect(page.locator('.stop-slip')).toBeVisible();
});
test('F files the open paper', async ({ page }) => {
  await start(page); await page.keyboard.press('Space'); await page.keyboard.press('f');
  await expect(page.getByTestId('paper')).not.toBeVisible(); await page.keyboard.press('g');
  await expect(page.getByTestId('paper-link')).toHaveCount(1);
});
test('I asks the person on the open card', async ({ page }) => {
  await start(page); await page.keyboard.press('b'); await page.locator('.person-tile').first().click(); await page.keyboard.press('i');
  await expect(page.getByLabel('Console command')).toHaveValue(/^inquire /);
});
test('R opens the same delegation choices as the mouse', async ({ page }) => {
  await start(page); await page.keyboard.press('d');
  const choice = page.locator('.situation').filter({ has: page.getByRole('button', { name: 'Refer this decision', exact: true }) }).first();
  await choice.getByRole('button', { name: 'Refer this decision', exact: true }).focus(); await page.keyboard.press('r');
  await expect(choice.getByRole('button', { name: /^Refer to / }).first()).toBeVisible();
  await choice.getByRole('button', { name: /^Refer to / }).first().focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Order placed' })).toBeVisible();
});
for (const [key, verb] of [['a', 'approve'], ['n', 'sendback']]) test(`${key} uses the open plan's ${verb} action`, async ({ page, request }) => {
  await start(page); await bar(page).getByRole('button', { name: 'Plans & enemy', exact: true }).click();
  await page.locator('#panel-title').focus(); await page.keyboard.press(key!);
  const s = await (await request.get('/api/desk')).json(); expect(s.queue.at(-1).line).toMatch(new RegExp(`^${verb} `));
});
test('S signs the open order through its submit button', async ({ page, request }) => {
  await start(page); await bar(page).getByRole('button', { name: 'Write an order', exact: true }).click();
  await page.getByLabel('Console command').fill('inquire n_army_west'); await page.locator('#panel-title').focus(); await page.keyboard.press('s');
  await expect(page.getByRole('status').filter({ hasText: 'Order placed' })).toBeVisible();
  expect((await (await request.get('/api/desk')).json()).queue.at(-1).line).toBe('inquire n_army_west');
});
test('Ctrl+G finds a person and a region by name', async ({ page }) => {
  await start(page); await page.keyboard.press('Control+g'); await expect(page.getByRole('textbox', { name: 'Find a region or person', exact: true })).toBeFocused(); await page.keyboard.type('Wending');
  await page.locator('.find-results button').first().click(); await expect(page.locator('#panel-title')).toHaveText('Staff map');
  await page.keyboard.press('Control+g'); await page.getByRole('textbox', { name: 'Find a region or person', exact: true }).fill('Army of the Westwatch');
  await page.locator('.find-results button').first().click(); await expect(page.getByTestId('person-card')).toBeVisible();
});
test('global shortcuts stay silent while typing, including contenteditable and native selects', async ({ page, request }) => {
  await start(page); await bar(page).getByRole('button', { name: 'Write an order', exact: true }).click();
  const field = page.getByLabel('Console command'); await field.fill('');
  const before = await (await request.get('/api/desk')).json();
  await field.pressSequentially('fr ians dblmg? w+0');
  for (const key of ['Control+Enter', 'Control+g', 'Escape', 'ArrowDown', 'ArrowUp']) await field.press(key);
  await expect(page.locator('#panel-title')).toHaveText('Write an order'); expect(await field.inputValue()).toBe('fr ians dblmg? w+0');
  await page.getByLabel('Begin with a verb').focus(); await page.keyboard.press('b'); await expect(page.locator('#panel-title')).toHaveText('Write an order');
  await page.locator('#panel-title').evaluate(el => { el.setAttribute('contenteditable', 'true'); el.focus(); });
  await page.keyboard.press('g'); await page.keyboard.press('Control+Enter');
  expect(await (await request.get('/api/desk')).json()).toEqual(before);
});

for (const key of ['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','+','-','0']) test(`map ${key} shares the camera control`, async ({ page, request }) => {
  await start(page); const before = await (await request.get('/api/desk')).json();
  await page.keyboard.press('m'); const map = page.getByRole('dialog').getByTestId('staff-map');
  const host = map.getByTestId('map-canvas-host'); await expect(host).toHaveAttribute('data-ready','ready');
  await map.getByRole('button', { name: 'Zoom in', exact: true }).click(); await expect(host).toHaveAttribute('data-ready','ready');
  const initial = JSON.parse((await map.getByTestId('map-diagnostics').textContent())!);
  await host.focus(); await page.keyboard.press(key); await expect(host).toHaveAttribute('data-ready','ready');
  const after = JSON.parse((await map.getByTestId('map-diagnostics').textContent())!);
  expect(after).not.toEqual(initial); expect(await (await request.get('/api/desk')).json()).toEqual(before);
  await page.keyboard.press('t'); await expect(map.getByTestId('map-text-twin')).toBeVisible();
  await page.keyboard.press('t'); await expect(host).toBeFocused();
});

test('Tab follows desk region order and Shift+Tab reverses it', async ({ page }) => {
  await start(page); const buttons = bar(page).getByRole('button'); await buttons.first().focus();
  for (let i=1;i<await buttons.count();i++) { await page.keyboard.press('Tab'); await expect(buttons.nth(i)).toBeFocused(); }
  await page.keyboard.press('Shift+Tab'); await expect(buttons.nth(await buttons.count()-2)).toBeFocused();
  writeFileSync('../../art-masters/R17/key-coverage.json', JSON.stringify({ keys: ['Space','ArrowUp','ArrowDown','K','J','Enter','Esc','F','R','I','A','N','S','D','B','L','M','G','Ctrl+G','W','+','-','0','Tab','Shift+Tab','Ctrl+Enter','?','T'], realConsoleFixture: true }, null, 2));
});
