import { expect, test } from '@playwright/test';

for (const [key, title] of [['d', 'Docket'], ['b', 'Org board'], ['l', 'Ledger'], ['g', 'File'], ['m', 'Staff map'], ['?', 'Key card']]) test(`${key} opens ${title}`, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('desk')).toBeVisible();
    await page.keyboard.press(key!);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#panel-title')).toHaveText(title!);
    await page.keyboard.press('Escape');
});

test('continuous text size and skins remain local settings', async ({ page, request }) => {
  const before = await (await request.get('/api/desk')).json();
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Key card', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Text size' })).toHaveAttribute('min', '80');
  await expect(page.getByRole('slider', { name: 'Text size' })).toHaveAttribute('max', '200');
  await page.getByRole('slider', { name: 'Text size' }).fill('137');
  await page.getByRole('slider', { name: 'Map label size' }).fill('165');
  await page.getByLabel('High contrast', { exact: true }).check();
  await page.getByLabel('Evening lamp', { exact: true }).check();
  await page.reload();
  await page.getByRole('navigation').getByRole('button', { name: 'Key card', exact: true }).click();
  await expect(page.getByLabel('High contrast', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Evening lamp', { exact: true })).toBeChecked();
  await expect(page.getByRole('slider', { name: 'Text size' })).toHaveValue('137');
  await expect(page.getByRole('slider', { name: 'Map label size' })).toHaveValue('165');
  expect(await (await request.get('/api/desk')).json()).toEqual(before);
});
