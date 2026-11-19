import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {geoAlbers,geoPath} from 'd3-geo';
import type {GeoPermissibleObjects} from 'd3-geo';
import type {MapGeometry} from '../web/map/model.ts';
const evidence='../../art-masters/R21';
const week=JSON.parse(readFileSync('../../art-masters/R19/week-war-snapshot.json','utf8'));
const geometry:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
const projection=geoAlbers().parallels([29.5,45.5]).rotate([96,0]).center([0,38]).scale(1100).translate([0,0]);
const path=geoPath(projection);
async function open(page:Page) {
  await page.route('**/api/desk',route=>route.fulfill({json:week}));
  await page.goto('/');await expect(page.getByTestId('desk')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Staff map',exact:true}).click();
  await expect(page.locator('dialog').getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
}
for(const size of [{width:1920,height:1080},{width:3440,height:1440}]) {
  test(`canvas frame, complete regions and base coverage at ${size.width}x${size.height}`,async({page})=>{
    await page.setViewportSize(size);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await open(page);
    const map=page.locator('dialog .staff-map'),host=map.getByTestId('map-canvas-host');
    const stages:any[]=[];
    const views=process.env.DESK_R21_VIEWS?.split(',')??(process.env.DESK_R21_PREFLIGHT==='1'?['fit']:['fit','virginia','widest','pan-west','pan-east','pan-north','pan-south','closest','panama']);
    for(const view of views) {
      if(view==='virginia')await map.getByRole('button',{name:'Show Virginia',exact:true}).click();
      if(view==='widest'){await map.getByRole('button',{name:'Fit the map',exact:true}).click();for(let i=0;i<8;i++)await map.getByRole('button',{name:'Zoom out',exact:true}).click();}
      if(view.startsWith('pan-')) {
        await host.focus();
        const key={west:'a',east:'d',north:'w',south:'s'}[view.slice(4)]!;
        // A huge pointer drag exercises the same camera path without hundreds of redraws.
        const b=(await host.boundingBox())!;
        await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
        await page.mouse.move(b.x+b.width/2+(view==='pan-west'?10000:view==='pan-east'?-10000:0),b.y+b.height/2+(view==='pan-north'?10000:view==='pan-south'?-10000:0));await page.mouse.up();
        await page.keyboard.press(key);
      }
      if(view==='closest')for(let i=0;i<20;i++)await map.getByRole('button',{name:'Zoom in',exact:true}).click();
      if(view==='panama'){
        await page.keyboard.press('Control+g');
        await page.getByRole('textbox',{name:'Find a region or person',exact:true}).fill('Panama');
        await page.locator('.find-results button').first().click();
      }
      await expect(host).toHaveAttribute('data-ready','ready');
      const d=await map.getByTestId('map-diagnostics').evaluate(el=>JSON.parse(el.textContent!));
      const b=(await host.boundingBox())!,f=(await map.locator('.map-neatline').boundingBox())!;
      const signs=await map.locator('.map-mark').evaluateAll(nodes=>nodes.map(node=>{
        const el=node as HTMLElement,s=el.getBoundingClientRect(),parent=el.parentElement!.getBoundingClientRect();
        return {region:el.dataset.region,width:s.width,height:s.height,dx:s.x+s.width/2-parent.x-parseFloat(el.style.left),dy:s.y+s.height/2-parent.y-parseFloat(el.style.top)};
      }));
      const collisions=await map.locator('.map-mark').evaluateAll((nodes,arg:any)=>nodes.flatMap(n=>{const s=n.getBoundingClientRect();return arg.labels.filter((l:any)=>{const a=l.bounds;return a.x<s.right-arg.x&&a.x+a.width>s.left-arg.x&&a.y<s.bottom-arg.y&&a.y+a.height>s.top-arg.y;}).map((l:any)=>({label:l.text,sign:n.getAttribute('data-region')}));}),{labels:d.renderedLabels,x:b.x,y:b.y});
      stages.push({view,diagnostics:d,canvas:b,frame:f,signs,collisions});
      writeFileSync(`${evidence}/measurements-${size.width}x${size.height}.json`,JSON.stringify(stages,null,2));
      expect.soft(Math.abs(f.x-b.x)).toBeLessThanOrEqual(1);expect.soft(Math.abs(f.y-b.y)).toBeLessThanOrEqual(1);
      expect.soft(Math.abs(f.width-b.width)).toBeLessThanOrEqual(1);expect.soft(Math.abs(f.height-b.height)).toBeLessThanOrEqual(1);
      if(view==='fit') {
        expect.soft(d.regionContainment?.outside).toEqual([]);
        expect.soft(d.regionContainment?.shapes).toBe(185);
        // Independently project every shape's bounds and every on-map point;
        // checking just a label or anchor would miss the clipped Maine tip.
        const outside=[];
        for(const r of geometry.regions.filter(r=>!['off_map','off-map'].includes(r.kind))) {
          const vertices=r.point?[projection(r.point)!]:[];
          if(r.shape)vertices.push(...path.bounds(r.shape as GeoPermissibleObjects));
          for(const p of vertices){const x=p[0]*d.camera.z+d.camera.x,y=p[1]*d.camera.z+d.camera.y;if(x<4||y<4||x>b.width-4||y>b.height-4)outside.push({id:r.id,x,y});}
        }
        expect.soft(outside).toEqual([]);
        expect.soft(d.renderedLabels.some((l:any)=>l.id==='new_england')).toBe(true);
      }
      expect.soft(d.baseCoverage?.inside).toBe(true);
      // Verify the entire canvas perimeter against the geographic source box,
      // rather than trusting the renderer's coverage flag alone.
      const source=geometry.baseCoverage!.geographicBox;
      for(let i=0;i<=32;i++)for(const [sx,sy] of [[b.width*i/32,0],[b.width*i/32,b.height],[0,b.height*i/32],[b.width,b.height*i/32]]) {
        const ll=projection.invert!([(sx!-d.camera.x)/d.camera.z,(sy!-d.camera.y)/d.camera.z])!;
        expect.soft(ll[0]).toBeGreaterThan(source[0]+1);expect.soft(ll[0]).toBeLessThan(source[2]-1);
        expect.soft(ll[1]).toBeGreaterThan(source[1]+1);expect.soft(ll[1]).toBeLessThan(source[3]-1);
      }
      expect.soft(d.rawTextureBytes).toBeLessThanOrEqual(d.rawTextureCap);
      expect.soft(signs.filter(s=>Math.abs(s.dx)>1||Math.abs(s.dy)>1||s.width!==24||s.height!==24)).toEqual([]);
      if(view==='fit'||view==='virginia')expect.soft(collisions).toEqual([]);
      await page.screenshot({path:`${evidence}/map-war-${view}-${size.width}x${size.height}.png`});
      if(view==='panama'){const mark=map.locator('.map-mark[data-region="panama"]');await mark.hover();await mark.focus();await expect(map.locator('.map-note')).toContainText('Montgomery');}
    }
    expect(errors).toEqual([]);
  });
}
