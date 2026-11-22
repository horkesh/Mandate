import { test, expect } from '@playwright/test';
import { writtenDate } from '../web/dates.ts';
import type { Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const evidence='../../art-masters/R20';
const week=JSON.parse(readFileSync('../../art-masters/R19/week-war-snapshot.json','utf8'));
async function open(page:Page) {
  await page.route('**/api/desk',route=>route.fulfill({json:week}));
  await page.goto('/');
  await expect(page.getByTestId('desk')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Staff map',exact:true}).click();
  await expect(page.locator('dialog').getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
}

test('the sheet has one map title, its date and its text record',async({page})=>{
  await open(page);
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'Staff map',exact:true})).toHaveCount(1);
  await expect(dialog.locator('.map-date')).toHaveText(writtenDate(week.date));
  await dialog.getByRole('button',{name:/Read the map as text/}).click();
  await expect(dialog.getByTestId('map-text-twin')).toBeVisible();
  await expect(dialog.getByTestId('map-text-twin')).toContainText('Headquarters reported');
});

test('Find still reaches the off-map Panama report through the frame',async({page})=>{
  await open(page);
  await page.keyboard.press('Control+g');
  await page.getByRole('textbox',{name:'Find a region or person',exact:true}).fill('Panama');
  await page.locator('.find-results button').first().click();
  const map=page.locator('dialog .staff-map');
  await expect(map.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
  const mark=map.locator('.map-mark[data-region="panama"]');
  await expect(mark).toBeVisible();await mark.hover({timeout:5000});await mark.focus();
  await expect(map.locator('.map-note')).toContainText('Montgomery');
  await page.screenshot({path:`${evidence}/map-panama.png`});
});

for(const size of [{width:1920,height:1080},{width:3440,height:1440}]) {
  test(`report signs leave region names clear at ${size.width}x${size.height}`,async({page})=>{
    await page.setViewportSize(size);await open(page);
    const map=page.locator('dialog .staff-map'),host=map.getByTestId('map-canvas-host');
    const stages=[];
    for(const view of ['fit','virginia']) {
      if(view==='virginia')await map.getByRole('button',{name:'Show Virginia',exact:true}).click();
      await expect(host).toHaveAttribute('data-ready','ready');
      const d=await map.getByTestId('map-diagnostics').evaluate(el=>JSON.parse(el.textContent!));
      const origin=(await host.boundingBox())!;
      const signs=await map.locator('.map-mark').evaluateAll(nodes=>nodes.map(node=>{
        const b=node.getBoundingClientRect();return {region:node.getAttribute('data-region'),report:node.getAttribute('data-report'),x:b.x,y:b.y,width:b.width,height:b.height};
      }));
      expect(signs.length).toBeGreaterThan(0);
      expect(d.renderedLabels.length).toBeGreaterThan(0);
      const collisions=[];
      for(const label of d.renderedLabels)for(const sign of signs) {
        const b=label.bounds,x=sign.x-origin.x,y=sign.y-origin.y;
        if(b.x<x+sign.width&&b.x+b.width>x&&b.y<y+sign.height&&b.y+b.height>y)collisions.push({label:label.text,sign:sign.region});
      }
      stages.push({view,diagnostics:d,signs,collisions});
      writeFileSync(`${evidence}/labels-${size.width}x${size.height}.json`,JSON.stringify(stages,null,2));
      expect(collisions).toEqual([]);
      await page.screenshot({path:`${evidence}/map-war-${view}-${size.width}x${size.height}.png`});
    }
  });

  test(`the map ends at a rectangular ruled frame at ${size.width}x${size.height}`,async({page})=>{
    await page.setViewportSize(size);await open(page);
    const map=page.locator('dialog .staff-map');
    const frame=map.locator('.map-neatline');
    await expect(frame).toHaveCount(1);
    const stages=[];
    for(const view of ['fit','virginia']) {
      if(view==='virginia')await map.getByRole('button',{name:'Show Virginia',exact:true}).click();
      await expect(map.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
      const style=await frame.evaluate(el=>{const s=getComputedStyle(el);return {border:s.borderTopStyle,width:s.borderTopWidth,events:s.pointerEvents};});
      expect(style.border).toBe('double');expect(parseFloat(style.width)).toBeGreaterThanOrEqual(3);expect(style.events).toBe('none');
      const box=(await frame.boundingBox())!,drawing=(await map.locator('.map-drawing').boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(drawing.x);expect(box.y).toBeGreaterThanOrEqual(drawing.y);
      expect(box.x+box.width).toBeLessThanOrEqual(drawing.x+drawing.width+1);
      expect(box.y+box.height).toBeLessThanOrEqual(drawing.y+drawing.height+1);
      stages.push({view,box,drawing,style});
    }
    writeFileSync(`${evidence}/frame-${size.width}x${size.height}.json`,JSON.stringify(stages,null,2));
  });
}
