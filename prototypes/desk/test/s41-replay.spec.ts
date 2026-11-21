import { test, expect } from '@playwright/test';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { rest } from './support/s29-controls.ts';
import { S } from '../web/strings.ts';

// Replay recorded human actions through native desk controls. Only rendered DOM
// and the public command replies are observed. No State load or API-driven act.
test('S41 replays the recorded S39 advance through the merged desk', async ({ page }) => {
  const out = resolve('../../art-masters/S41/replay');
  mkdirSync(out, { recursive: true });
  const source = resolve('../../docs/audit/s41-evidence');
  const batches = JSON.parse(readFileSync(`${source}/advance-actions.json`, 'utf8'));
  const expected = JSON.parse(readFileSync(`${source}/advance-commands.json`, 'utf8'));
  const commands: { line: string; ok: boolean; message?: string }[] = [];
  const errors: string[] = [];
  let lastReply: any;
  let blocked = 0;
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', async r => {
    if (!r.url().endsWith('/api/command') || r.request().method() !== 'POST') return;
    const reply = await r.json();
    const command = { line: r.request().postDataJSON().line, ok: reply.ok, message: reply.message };
    commands.push(command);
    appendFileSync(`${out}/commands.jsonl`, JSON.stringify(command) + '\n');
    writeFileSync(`${out}/last-reply.json`, JSON.stringify(reply));
    if (reply.turn) {
      lastReply = reply;
      writeFileSync(`${out}/turn-${reply.snapshot.morning.view.day}.json`, JSON.stringify(reply));
    }
  });
  await page.goto('/');
  await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready', 'ready', { timeout: 30_000 });
  async function snapshot(extra: object) {
    const text = await page.locator('body').innerText();
    const controls = await page.locator('button,input,select,textarea').evaluateAll(els => els
      .filter(e => (e as HTMLElement).checkVisibility()).map(e => ({ tag: e.tagName,
        text: e.textContent?.trim(), label: e.getAttribute('aria-label') ?? e.closest('label')?.textContent?.trim(),
        disabled: (e as HTMLButtonElement).disabled, value: (e as HTMLInputElement).value,
        options: e instanceof HTMLSelectElement ? [...e.options].map(o => ({ text: o.text, value: o.value })) : undefined })));
    writeFileSync(`${out}/screen.json`, JSON.stringify({ ...extra, text, controls, commands, errors }, null, 2));
    const mark = extra as { batch?: number; step?: number };
    if (mark.batch !== undefined) writeFileSync(`${out}/screen-${mark.batch}-${mark.step ?? 'done'}.txt`, text);
  }
  async function capture(name: string) {
    await page.evaluate(() => document.fonts.ready);
    const file = `${out}/${name}.png`;
    await page.screenshot({ path: file });
    writeFileSync(`${file}.recipe.json`, JSON.stringify({ request: 'S41',
      tool: 'Prototype headless Playwright harness', mode: 'Unedited rendered desk capture',
      requestedSize: page.viewportSize(), actualSize: page.viewportSize(), humanEdits: [], postProcess: [],
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
      source: 'S39 advance actions replayed on the integrated candidate; public desk only.' }, null, 2));
  }
  async function step(a: any) {
    if (a.op === 'done') return;
    if (a.op === 'rest') return rest(page);
    if (a.op === 'book') { await rest(page); await page.getByRole('navigation', { name: S.deskObjects }).getByRole('button', { name: a.name, exact: true }).click(); return; }
    if (a.op === 'size') { await page.setViewportSize({ width: a.width, height: a.height }); return; }
    if (a.op === 'capture') return capture(a.name);
    let target = a.selector ? page.locator(a.selector) : a.label ? page.getByLabel(a.label, { exact: a.exact !== false })
      : page.getByRole(a.role ?? 'button', { name: a.name, exact: a.exact !== false });
    if (a.index !== undefined) target = target.nth(a.index);
    if (a.op === 'fill') await target.fill(a.value);
    else if (a.op === 'select') await target.selectOption(a.value);
    else if (a.op === 'check') await target.setChecked(a.checked ?? true);
    else if (a.op === 'click') {
      if (a.command) {
        const response = page.waitForResponse(r => r.url().endsWith('/api/command') && r.request().method() === 'POST', { timeout: 60_000 });
        await target.click(); await response;
      } else await target.click();
    } else throw Error(`Unknown recorded operation ${a.op}`);
  }
  await snapshot({ phase: 'opening', batch: 0 });
  for (const batch of batches) {
    const steps = batch.steps ?? [batch];
    for (let i = 0; i < steps.length; i++) {
      const before = commands.length;
      try { await step(steps[i]); }
      catch (error) {
        blocked++;
        await snapshot({ phase: 'blocked', block: blocked, batch: batch.seq, step: i, action: steps[i], error: String(error), before });
        await capture(`blocked-${blocked}`);
        const recovery = `${out}/recovery-${blocked}.json`;
        while (!existsSync(recovery)) await new Promise(r => setTimeout(r, 500));
        const repair = JSON.parse(readFileSync(recovery, 'utf8'));
        appendFileSync(`${out}/recoveries.jsonl`, JSON.stringify({ batch: batch.seq, step: i, original: steps[i], ...repair }) + '\n');
        for (const action of repair.steps ?? []) await step(action);
        if (repair.retry === true) { i--; continue; }
        if (repair.skip !== true && !repair.steps?.length) throw Error('A recovery must explicitly retry, replace or skip the failed UI step');
      }
      // The response listener has completed once the desk is interactive again.
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      expect(commands.map(c => c.line)).toEqual(expected.slice(0, commands.length).map((c: any) => c.line));
      expect(commands.every(c => c.ok)).toBe(true);
      expect(errors).toEqual([]);
    }
    await snapshot({ phase: 'replaying', batch: batch.seq });
    if (batch.seq === 6) {
      writeFileSync(`${out}/preflight.json`, JSON.stringify({ batch: batch.seq, commands, errors, date: lastReply?.snapshot.date }, null, 2));
      while (!existsSync(`${out}/continue.json`)) await new Promise(r => setTimeout(r, 500));
    }
  }
  expect(commands.map(c => c.line)).toEqual(expected.map((c: any) => c.line));
  expect(lastReply.snapshot.morning.view.day).toBe(148);
  expect(lastReply.snapshot.date).toBe('1861-07-31');
  const privateFields = /paperProfile|paperNoteBasis|personTrue|reportTruth/;
  expect(JSON.stringify(lastReply)).not.toMatch(privateFields);
  await snapshot({ phase: 'complete', batch: batches.at(-1).seq });
  writeFileSync(`${out}/summary.json`, JSON.stringify({ completedDay: lastReply.snapshot.morning.view.day,
    date: lastReply.snapshot.date, commands: commands.length, turns: commands.filter(c => c.line.startsWith('end ')).length,
    exactCommands: true, errors, blocked, source: 'docs/audit/s41-evidence/advance-commands.json' }, null, 2));
});
