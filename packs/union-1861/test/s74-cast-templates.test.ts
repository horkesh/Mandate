import { expect,it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { createState } from '../../../packages/kernel/src/tick/setup.ts';
import { morningGround,principalMenu } from '../../../packages/kernel/src/seats/requests.ts';
import { toId } from '../../../packages/kernel/src/ids.ts';
const {world,setup}=seatsWorld('union-1861');
const added=world.map.world.people.filter(p=>p.provenance.some(c=>c.source.startsWith('S69-')||c.source==='S72-OR'));
it('retains 28 factual identities and only the personally subscribed motive accepted under 0122',()=>{
 expect(added).toHaveLength(28);
 for(const p of added){
  expect(Object.values(p.centres).every(c=>c.direction===null),p.id).toBe(true);
  expect(Object.values(p.temperament).every(c=>c.direction===null),p.id).toBe(true);
  expect(p.regard.direction,p.id).toBeNull();expect(p.traits,p.id).toEqual([]);
  // Bartow's personally signed charter supplies a new own-motive leg, not an office-derived judgment.
  expect(p.values,p.id).toEqual(p.id==='bartow_francis_s' ? [{value:'confederate_independence',cites:[
   {source:'S116-OR4-92',at:'p92 dated 1861-02-08'},
   {source:'S116-OR4-99',at:'p99 dated 1861-02-08'},
  ]}] : []);
 }
 expect(added.filter(p=>p.service!==undefined).map(p=>[p.id,p.service?.historicalOn,p.service?.toFaction])).toEqual([['elzey_arnold','1861-04-25','confederate']]);
});
it('retains the July identity and term holds in the sourced templates',()=>{
 const templates=world.map.world.organisationTemplates!;
 expect(templates.map(t=>t.id)).toEqual(['s74_mcdowell','s74_patterson','s74_beauregard','s74_johnston']);
 for(const t of templates)expect(new Set(t.posts.map(p=>p.id)).size).toBe(t.posts.length);
 const williams=templates.find(t=>t.id==='s74_patterson')!.posts.find(p=>p.id==='s74_patterson_brigade_3')!;
 expect(williams).toMatchObject({commander:null,identityHeld:true});
 expect(templates.filter(t=>t.id==='s74_beauregard'||t.id==='s74_johnston').flatMap(t=>t.posts).some(p=>p.kind==='division_command')).toBe(false);
 // S77 applies S75; S81 adds S76's six finite terms and Washington Artillery's war contract.
 expect(world.map.world.regimentCatalogue!.filter(r=>r.termDays.length>0)).toHaveLength(101);
 expect(world.map.world.regimentCatalogue!.filter(r=>r.warTerm===true)).toHaveLength(2);
});
it('keeps the generated local officer off the opening presidential catalogue',()=>{
 const generated=world.map.world.people.filter(p=>p.invented);
 expect(generated).toHaveLength(1);expect(generated[0]!.requiresIntroduction).toBe(true);
 const state=createState(world,setup),menu=principalMenu(world,state,toId('faction','union'),morningGround(world,state,1));
 expect(menu.candidates.some(p=>p.person===generated[0]!.id)).toBe(false);
});
