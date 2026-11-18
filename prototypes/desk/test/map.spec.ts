import { presenter } from '../web/presentation.ts';
import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const evidence=`../../art-masters/${process.env.DESK_EVIDENCE_REQUEST??'R17'}`;
const sizes=[{width:3440,height:1440},{width:1920,height:1080}];

test('Union map uses the seat request and local geometry, with text and author/date access',async({page,request})=>{
  test.skip(process.env.DESK_PACK==='testbed','Union evidence uses a Union process');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(let i=0;i<3;i++) {
    let snapshot=await(await request.get('/api/desk')).json();
    const posts=snapshot.morning.menu.commandable.filter((p:any)=>/department|general_in_chief/.test(p.post)).slice(0,3);
    for(const post of posts) {const reply=await(await request.post('/api/command',{data:{line:`inquire ${post.post}`,day:snapshot.morning.requestDay}})).json();expect(reply.ok).toBe(true);}
    const reply=await(await request.post('/api/command',{data:{line:'end',day:snapshot.morning.requestDay}})).json();expect(reply.ok).toBe(true);
  }
  const snapshot=await(await request.get('/api/desk')).json();
  expect(snapshot).not.toHaveProperty('state');expect(snapshot).not.toHaveProperty('world');expect(snapshot).not.toHaveProperty('log');
  const response=await request.get('/map-data/union-1861.json');expect(response.status()).toBe(200);
  expect(await response.json()).toEqual(JSON.parse(readFileSync('public/map-data/union-1861.json','utf8')));
  for(const path of ['/map-data/union-1861.json.recipe.json','/data/raw.zip','/art-masters/R17/sources/manifest.json','/server/adapter.ts'])expect((await request.get(path)).status()).toBe(404);
  const results=[];
  for(const size of sizes) {
    await page.setViewportSize(size);await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    const host=page.getByTestId('map-canvas-host');await expect(host).toHaveAttribute('data-ready','ready',{timeout:30000});
    const map=page.getByTestId('staff-map');
    await page.screenshot({path:`${evidence}/map-rest-${size.width}x${size.height}.png`});
    const mark=map.locator('.map-mark').first();
    expect(await map.locator('.map-mark').count()).toBeGreaterThan(0);
    await mark.focus();await expect(map.locator('.map-note')).toContainText('Source paper');
    const description=await mark.getAttribute('aria-label');expect(description).toMatch(/\d{4}-\d{2}-\d{2}/);
    await host.focus();await page.keyboard.press('t');await expect(map.getByTestId('map-text-twin')).toBeVisible();
    await expect(map.getByTestId('map-text-twin')).toContainText(description!);
    await page.keyboard.press('t');await expect(map.getByTestId('map-text-twin')).not.toBeVisible();
    await map.getByRole('button',{name:'Show Virginia',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');
    await page.screenshot({path:`${evidence}/map-virginia-${size.width}x${size.height}.png`});
    const diagnostics=JSON.parse((await map.getByTestId('map-diagnostics').textContent())!);
    expect(diagnostics.rawTextureBytes).toBeLessThanOrEqual(diagnostics.rawTextureCap);expect(diagnostics.zoom).toBe(5);
    results.push({size,diagnostics,visibleMarks:await map.locator('.map-mark').count()});
  }
  writeFileSync(`${evidence}/map-browser-union.json`,JSON.stringify({requestDay:snapshot.morning.requestDay,errors,results},null,2));expect(errors).toEqual([]);
});

test('testbed map handles, rejected previews, pencil orders and send-back keep console semantics',async({page,request})=>{
  test.skip(process.env.DESK_PACK!=='testbed','Plan evidence uses a fresh testbed process');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let snapshot=await(await request.get('/api/desk')).json();
  // Small real-console fixture gate before any screenshot work.
  let reply=await(await request.post('/api/command',{data:{line:'order n_army_west take salient_tip review',day:snapshot.morning.requestDay}})).json();expect(reply.ok).toBe(true);
  reply=await(await request.post('/api/command',{data:{line:'end',day:snapshot.morning.requestDay}})).json();expect(reply.ok).toBe(true);
  snapshot=reply.snapshot;expect(snapshot.morning.menu.reviews.some((r:any)=>r.post==='n_army_west')).toBe(true);
  await page.setViewportSize(sizes[0]!);await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Staff map',exact:true}).click();
  const dialog=page.getByRole('dialog'),map=dialog.getByTestId('staff-map'),host=map.getByTestId('map-canvas-host');
  await expect(host).toHaveAttribute('data-ready','ready');
  await map.getByRole('button',{name:'Fit the map',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');
  const points=JSON.parse((await map.getByTestId('map-diagnostics').textContent())!).referencePoints;
  const box=(await host.boundingBox())!;
  const objective=(await map.getByTestId('handle-objective-main').boundingBox())!;
  await page.mouse.move(objective.x+objective.width/2,objective.y+objective.height/2);await page.mouse.down();
  await page.mouse.move(box.x+points.salient_base[0],box.y+points.salient_base[1],{steps:6});await page.mouse.up();
  await expect(dialog.locator('.pencil-list li')).toHaveCount(1);
  // An unreachable region must never create a pencil route.
  await dialog.getByLabel('Region for the pencil mark').selectOption('mid_sea');
  await dialog.getByRole('button',{name:'Mark waypoint',exact:true}).click();
  await expect(dialog.locator('.map-review-message')).toContainText('cannot be reached');
  await expect(dialog.locator('.pencil-list li')).toHaveCount(1);
  const waypoint=map.getByTestId('handle-waypoints-main');
  await waypoint.focus();
  for(let i=0;i<35 && !(await waypoint.getAttribute('aria-label'))?.includes('Wending Valley');i++)await waypoint.press('ArrowRight');
  await expect(waypoint).toBeFocused();await expect(waypoint).toHaveAttribute('aria-label',/Wending Valley/);
  await waypoint.press('Enter');
  await expect(dialog.locator('.pencil-list li')).toHaveCount(2);
  await map.getByRole('button',{name:'Fit plan',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');
  const lines=await dialog.locator('.pencil-list code').allTextContents();
  const commands=['edit n_army_west objective axis=main region=salient_base','edit n_army_west waypoints axis=main via=w_valley'];
  expect(lines).toEqual(commands.map(presenter(snapshot.strings).text));
  const captures=[];
  for(const size of sizes){
    await page.setViewportSize(size);await map.getByRole('button',{name:'Fit plan',exact:true}).click();await expect(host).toHaveAttribute('data-ready','ready');await page.evaluate(()=>document.fonts.ready);
    const diagnostics=JSON.parse((await map.getByTestId('map-diagnostics').textContent())!);
    expect(diagnostics.zoom).toBeGreaterThan(1);
    const box=(await host.boundingBox())!,handle=(await map.getByTestId('handle-objective-main').boundingBox())!,point=diagnostics.referencePoints.salient_tip;
    expect(Math.hypot(handle.x+handle.width/2-box.x-point[0],handle.y+handle.height/2-box.y-point[1])).toBeLessThan(1);
    await page.screenshot({path:`${evidence}/plan-two-marks-${size.width}x${size.height}.png`});captures.push({size,diagnostics});
  }
  await dialog.getByRole('button',{name:'Order these changes',exact:true}).click();
  await expect(dialog.locator('.map-review-message')).toContainText('Pencil orders placed');
  snapshot=await(await request.get('/api/desk')).json();expect(snapshot.queue.map((q:any)=>q.line)).toEqual(commands);
  await dialog.getByRole('button',{name:'Strike axis main',exact:true}).click();
  await expect(dialog.locator('.map-review-message')).toContainText('a plan needs one axis');
  await expect(dialog.locator('.pencil-list')).toHaveCount(0);
  // Notes use the existing send-back command; no hidden notes or new verb is sent.
  await dialog.getByRole('button',{name:'Send back with notes',exact:true}).click();
  await expect(dialog.locator('.map-review-message')).toContainText('pencil notes kept here');
  snapshot=await(await request.get('/api/desk')).json();expect(snapshot.queue.at(-1).line).toBe('sendback n_army_west');
  writeFileSync(`${evidence}/map-browser-testbed.json`,JSON.stringify({errors,lines,captures,queue:snapshot.queue},null,2));expect(errors).toEqual([]);
});
