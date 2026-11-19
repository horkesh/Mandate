import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test('R29 a shown plan fills only after accepted approval, while cancelled approval stays a draft',async({page,request})=>{
 let snapshot=await(await request.get('/api/desk')).json();
 const execute=async(line:string)=>{const r=await(await request.post('/api/command',{data:{line,day:snapshot.morning.requestDay}})).json();expect(r.ok).toBe(true);snapshot=r.snapshot;return r;};
 await execute('order n_army_west take salient_tip review');await execute('end');
 const ready=async()=>expect(page.getByTestId('map-canvas-host')).toHaveAttribute('data-ready','ready');
 const count=async()=>JSON.parse((await page.getByTestId('map-canvas-host').getAttribute('data-control'))!).approvedRoutes;
 const approve=async()=>{await page.getByRole('navigation',{name:'Desk objects'}).getByRole('button',{name:'Plans & enemy',exact:true}).click();await page.getByRole('button',{name:'Approve as drafted',exact:true}).click();};
 await page.goto('/');await ready();await approve();expect(await count()).toBe(0);
 snapshot=await(await request.get('/api/desk')).json();expect(snapshot.queue[0].line).toBe('approve n_army_west');
 await execute('cancel 1');await page.reload();await ready();expect(await count()).toBe(0);
 await approve();snapshot=await(await request.get('/api/desk')).json();await execute('end');await page.reload();await ready();expect(await count()).toBe(1);
 writeFileSync('C:/Pyrrhic/ByOrderOfThePresident/art-masters/R29/approved-arrow.json',JSON.stringify({approvedPlans:snapshot.approvedPlans,rendered:await count(),cancelledDraft:true},null,2));
});
