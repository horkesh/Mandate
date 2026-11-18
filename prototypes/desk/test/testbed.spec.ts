import { expect, test } from '@playwright/test';

test('testbed: review, preview, cancel, docket and report refusals use the real console', async ({ page }) => {
  test.skip(process.env.DESK_PACK !== 'testbed', 'Supplemental live-console coverage uses a testbed process');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  const bar = page.getByRole('navigation', { name: 'Desk objects' });
  async function order(line: string) {
    await bar.getByRole('button', { name: 'Write an order', exact: true }).click();
    await page.getByLabel('Console command').fill(line);
    await page.getByRole('button', { name: 'Sign to out-tray', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Order placed in the out-tray' })).toBeVisible();
    await page.keyboard.press('Escape');
  }
  async function end() {
    await bar.getByRole('button', { name: 'Let the days run', exact: true }).click();
    await page.getByRole('button', { name: 'Send orders & run days', exact: true }).click();
    await page.getByRole('button', { name: 'To the next morning', exact: true }).click();
    await page.keyboard.press('Escape');
  }
  // eastwatch_stalls is triggered by a take goal to the eastern commander;
  // a western order alone cannot create this decision (see the pack's event).
  await order('order n_army_east take salient_tip review');
  await order('order n_army_west take salient_tip review');
  await order('inquire n_army_east');
  await bar.getByRole('button', { name: 'Out-tray', exact: true }).click();
  await page.getByRole('button', { name: 'Recall', exact: true }).last().click();
  await expect(page.getByRole('status').filter({ hasText: 'Order taken back' })).toBeVisible();
  await page.keyboard.press('Escape');
  await end();
  await bar.getByRole('button', { name: 'Plans & enemy', exact: true }).click();
  await page.getByRole('button', { name: 'Mark an edit', exact: true }).first().click();
  await page.getByLabel('Console command').fill('edit n_army_west waypoints via=w_valley');
  await page.getByRole('button', { name: 'Preview edit', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Edit preview ready' })).toBeVisible();
  await expect(page.locator('.preview .plan-route').last()).toContainText('Wending Valley');
  await page.screenshot({ path: '../../art-masters/R17/testbed-preview-1920x1080.png' });
  await page.getByRole('button', { name: 'Sign to out-tray', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Order placed in the out-tray' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await end();
  await bar.getByRole('button', { name: 'Docket', exact: true }).click();
  await expect(page.locator('.situation').first()).toBeVisible();
  await page.screenshot({ path: '../../art-masters/R17/testbed-docket-1920x1080.png' });
  await page.locator('.situation').first().getByRole('checkbox').first().check();
  await page.locator('.situation').first().getByRole('button', { name: 'Sign this decision', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Order placed in the out-tray' })).toBeVisible();
  await page.keyboard.press('Escape');
  await order('inquire missing_post');
  await end();
  await bar.getByRole('button', { name: 'Daybook', exact: true }).click();
  await expect(page.locator('.refusal').last()).toContainText('Not supplied');
});
