import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test('R26 map edits, refused routes, orders and send-back retain console semantics',async({page,request})=>{
 let snapshot=await(await request.get('/api/desk')).json();
 for(const line of ['order n_army_west take salient_tip review','end']){
  const r=await(await request.post('/api/command',{data:{line,day:snapshot.morning.requestDay}})).json();expect(r.ok).toBe(true);snapshot=r.snapshot;
 }
 await page.goto('/');await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();await expect(page.locator('.map-plan-sheet')).toBeVisible();
 await page.getByRole('button',{name:'Fit the map',exact:true}).click();await expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
 const host=(await page.getByTestId('map-canvas-host').boundingBox())!,diagnostics=JSON.parse((await page.getByTestId('map-diagnostics').textContent())!),handle=(await page.getByTestId('handle-objective-main').boundingBox())!;
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(host.x+diagnostics.referencePoints.salient_base[0],host.y+diagnostics.referencePoints.salient_base[1],{steps:6});await page.mouse.up();await expect(page.locator('.pencil-list li')).toHaveCount(1);
 await page.getByLabel('Region for the pencil mark').selectOption('mid_sea');await page.getByRole('button',{name:'Mark waypoint',exact:true}).click();await expect(page.locator('.map-review-message')).toContainText('cannot be reached');await expect(page.locator('.pencil-list li')).toHaveCount(1);
 const waypoint=page.getByTestId('handle-waypoints-main');await waypoint.focus();for(let i=0;i<35&&!(await waypoint.getAttribute('aria-label'))?.includes('Wending Valley');i++)await waypoint.press('ArrowRight');await waypoint.press('Enter');await expect(page.locator('.pencil-list li')).toHaveCount(2);
 await page.getByRole('button',{name:'Order these changes',exact:true}).click();await expect(page.locator('.map-review-message')).toContainText('Pencil orders placed');
 snapshot=await(await request.get('/api/desk')).json();expect(snapshot.queue.map((q:any)=>q.line)).toEqual(['edit n_army_west objective axis=main region=salient_base','edit n_army_west waypoints axis=main via=w_valley']);
 await page.getByRole('button',{name:'Strike axis main',exact:true}).click();await expect(page.locator('.map-review-message')).toContainText('a plan needs one axis');await page.getByRole('button',{name:'Send back with notes',exact:true}).click();await expect(page.locator('.map-review-message')).toContainText('pencil notes kept here');snapshot=await(await request.get('/api/desk')).json();expect(snapshot.queue.at(-1).line).toBe('sendback n_army_west');
 writeFileSync('../../art-masters/R26/plan-regression.json',JSON.stringify({queue:snapshot.queue,diagnostics},null,2));
});
